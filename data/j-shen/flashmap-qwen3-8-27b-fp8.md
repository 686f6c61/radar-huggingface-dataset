# j-shen/FlashMap-Qwen3.8-27B-FP8

## Resumen

FlashMap-Qwen3.8-27B-FP8 es un modelo borrador (drafter) para decodificación especulativa sin pérdida, desarrollado por Jeff Shen y colaboradores (j-shen) y publicado en noviembre de 2026. No es un modelo de chat autónomo: su función es proponer bloques de tokens candidatos que el modelo objetivo Qwen/Qwen3.8-27B-FP8 verifica, acelerando así la generación sin alterar la distribución de salida del modelo grande. Con 769.895.937 parámetros (aproximadamente 770M), es dos órdenes de magnitud menor que su objetivo.

La innovación central es el uso de un flow map en lugar de difusión discreta. Mientras que los drafters de difusión predicen cada token del bloque de forma independiente e ignoran las dependencias entre ellos, FlashMap salta de ruido gaussiano al bloque completo de K tokens en un solo paso, capturando dichas dependencias. El modelo se entrenó sobre las propias respuestas del objetivo (en modo sin razonamiento) a los prompts de mlabonne/open-perfectblend, y solo propone tokens sobre el vocabulario de borrador de los 65.536 tokens más frecuentes del objetivo; el resto recibe probabilidad cero, lo que garantiza que la decodificación siga siendo sin pérdida.

Su relevancia es práctica: permite desplegar Qwen3.8-27B-FP8 con aceleración especulativa en vLLM 0.32 o SGLang 0.5.20 mediante plugins del paquete `flashmap`. La licencia Apache-2.0 de los pesos (heredada de Qwen3.8) y MIT del código facilitan su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow map language model (modelo borrador para decodificación especulativa; transformer con flow map) |
| Parámetros totales | 769.895.937 (≈770M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el objetivo se sirve con `--max-model-len 8192` en el ejemplo) |
| Tipos de cuantización | FP8 en el nombre del checkpoint; el ejemplo de carga usa bfloat16; no se detallan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos); MIT (código) |
| Formato de pesos | safetensors (con `custom_code`; el código del modelo se incluye con los pesos) |

## Arquitectura y entrenamiento

FlashMap es un flow map language model: parte de ruido gaussiano y salta en un único paso al bloque completo de K tokens, en lugar de predecir cada token de forma independiente como hacen los drafters de difusión discreta. Este diseño captura las dependencias entre los tokens del bloque propuesto. El modelo es específico para el objetivo Qwen3.8-27B-FP8, que emplea capas de atención lineal; precisamente por el estado persistente de esas capas, la implementación de referencia en `transformers` del paquete `flashmap` (`spec_generate`) no soporta este objetivo, ya que los borradores rechazados no se pueden revertir. Por ello el despliegue recomendado es vLLM o SGLang mediante plugins.

El entrenamiento se realizó sobre las respuestas del propio modelo objetivo, en modo sin razonamiento (non-thinking), a los prompts del dataset mlabonne/open-perfectblend. El vocabulario de borrador se limita a los 65.536 tokens más frecuentes del objetivo; cualquier otro token recibe probabilidad de borrador cero, lo que preserva la corrección (lossless) de la decodificación especulativa. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa sin pérdida sobre Qwen3.8-27B-FP8.
- Propuesta de bloques completos de K tokens en un solo paso (por defecto, 16 tokens especulativos en el ejemplo de vLLM).
- Captura de dependencias entre tokens del bloque gracias al flow map, a diferencia de los drafters de difusión discreta.
- Muestreo probabilístico compatible con la temperatura 1 por defecto de Qwen3.8 (`"draft_sample_method": "probabilistic"`).
- Integración con vLLM (plugin en el extra `vllm` del paquete `flashmap`) y con SGLang (algoritmo DSPARK, plugin en el extra `sglang`).
- Soporte de prefix caching en ambos servidores (en vLLM con bloques de 864 tokens; en SGLang con caché radix a granularidad de token).
- API compatible con OpenAI en ambos servidores (puerto 8000 en vLLM, 30000 en SGLang).
- No es un modelo de chat, razonamiento, código, matemáticas ni visión por sí mismo: hereda esas capacidades del objetivo que acelera.

## Casos de uso

- Aceleración de inferencia en producción de Qwen3.8-27B-FP8: desplegar el objetivo con `--speculative-config` apuntando a este drafter para reducir la latencia por token verificado, manteniendo la distribución de salida intacta.
- Servicio de chat de baja latencia: usar el drafter con `num_speculative_tokens` de 16 (o 8 si se necesita más concurrencia) para mejorar el tiempo hasta el primer token y el throughput en cargas interactivas.
- Despliegue con SGLang en pipelines existentes: activar el algoritmo DSPARK con `--speculative-draft-model-path` para reutilizar prefijos a granularidad de token mediante la caché radix.
- Evaluación de técnicas de decodificación especulativa: comparar flow maps frente a drafters de difusión discreta en términos de tokens aceptados por verificación y throughput.
- Investigación sobre modelos borrador: estudiar el entrenamiento sobre respuestas del objetivo y la restricción a un vocabulario de borrador de 65.536 tokens como estrategia para mantener la corrección.
- Integración en servicios compatibles con OpenAI: exponer el servidor vLLM o SGLang con la API de chat completions y desactivar el modo thinking (`enable_thinking: False`) para obtener el mejor rendimiento del drafter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el drafter: el repositorio ocupa 1,5 GB; en bfloat16, los 770M de parámetros requieren aproximadamente 1,5-2 GB adicionales a los del objetivo.
- El objetivo Qwen3.8-27B-FP8 en FP8 requiere del orden de 27 GB de pesos, más estado de atención lineal y caché KV.
- GPU recomendadas: el ejemplo de la model card usa una H200; no se detallan otras GPU en la información disponible.
- En una H200 con `--max-model-len 8192`, el número de bloques de estado de atención lineal del objetivo es de aproximadamente 600, lo que limita `--max-num-seqs` a ese valor o menos.
- Con alta concurrencia, vLLM mantiene una copia del estado de atención lineal del objetivo por cada token especulativo de cada petición, lo que limita a unas 12 peticiones simultáneas en una H200 con 16 tokens especulativos; reducir a 8 permite más concurrencia a costa de tokens por verificación.
- Despliegue: vLLM 0.32.x con `flashmap[vllm]>=0.2`, o SGLang 0.5.20 con `flashmap[sglang]>=0.2`. La implementación de referencia en `transformers` no soporta este objetivo.
- Latencia y throughput: no disponibles de forma numérica en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlashMap-Qwen3.8-27B-FP8 | 770M | No disponible | Drafter de decodificación especulativa para Qwen3.8-27B-FP8 | Apache-2.0 (pesos), MIT (código) | Hugging Face; plugins vLLM y SGLang |
| Drafters de difusión discreta (categoría) | No disponible | No disponible | Predicción independiente de tokens del bloque, sin dependencias entre ellos | No disponible | No disponible |
| Qwen/Qwen3.8-27B-FP8 (objetivo) | No disponible en la información | No disponible | Modelo generativo completo con atención lineal | Apache-2.0 (según la model card) | Hugging Face |

No se dispone de datos de benchmarks ni de otros drafters concretos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: solo tiene sentido acoplado a Qwen3.8-27B-FP8; no genera respuestas por sí mismo.
- Solo propone tokens sobre los 65.536 tokens más frecuentes del objetivo; el resto recibe probabilidad cero, lo que puede reducir la tasa de aceptación en dominios con vocabulario poco frecuente.
- Entrenado con el modo thinking desactivado; su rendimiento de borrador es peor cuando el objetivo razona.
- La implementación de referencia en `transformers` (`spec_generate`) no soporta este objetivo por el estado no reversible de las capas de atención lineal de Qwen3.8.
- En vLLM, la concurrencia está limitada por las copias del estado de atención lineal (unas 12 peticiones en una H200 con 16 tokens especulativos).
- El prefix caching en vLLM solo reutiliza prefijos compartidos a partir de unos 1.700 tokens, por el bloqueo de 864 tokens y el recálculo del último bloque.
- Puede fallar el arranque de vLLM al compilar las matmuls FP8 de DeepGEMM; el autor remite a notas de solución de problemas.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al no alterar la distribución del objetivo, estos riesgos son los del modelo Qwen3.8-27B-FP8.
- Licencia Apache-2.0 en los pesos y MIT en el código, lo que permite uso comercial; conviene verificar las condiciones del modelo base Qwen3.8.

## Enlaces

- [Hugging Face: j-shen/FlashMap-Qwen3.8-27B-FP8](https://huggingface.co/j-shen/FlashMap-Qwen3.8-27B-FP8)
- [Página del proyecto](https://jshen.net/flashmap)
- [Código en GitHub](https://github.com/al-jshen/flashmap)
- [Paper (arXiv:2610.24365)](https://arxiv.org/abs/2610.24365)
- [Colección de modelos FlashMap](https://huggingface.co/collections/j-shen/flashmap-6ad0feb955bdc30db59769fa)
- [Modelo base: Qwen/Qwen3.8-27B-FP8](https://huggingface.co/Qwen/Qwen3.8-27B-FP8)
- [Dataset: mlabonne/open-perfectblend](https://huggingface.co/datasets/mlabonne/open-perfectblend)
- [Notas de solución de problemas de vLLM](https://github.com/al-jshen/flashmap#troubleshooting)
