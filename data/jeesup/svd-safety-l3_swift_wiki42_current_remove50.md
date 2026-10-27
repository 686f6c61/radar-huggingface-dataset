# Jeesup/svd-safety-l3_swift_wiki42_current_remove50

## Resumen

`Jeesup/svd-safety-l3_swift_wiki42_current_remove50` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` al que se le ha aplicado una compresión Swift-SVD con un objetivo declarado de eliminación del 50 % de parámetros, seguida de una recuperación SVD-LLM mediante LoRA. Lo publica el usuario de Hugging Face Jeesup dentro de una línea de trabajo centrada en medir cómo afecta la compresión al equilibrio entre utilidad y seguridad en modelos instructivos. No es un modelo nuevo entrenado desde cero: es un artefacto experimental que parte de los pesos de Llama 3 8B Instruct y los modifica mediante factorización y recuperación.

El detalle técnico relevante es que el checkpoint se ha plegado a pesos densos estándar de Transformers. Es decir, la ratio de compresión describe el presupuesto de parámetros factorizados durante el proceso, pero no una reducción del tamaño de descarga ni del coste de inferencia: el fichero de safetensors contiene 8.030.261.248 parámetros reales, con un repositorio de 16,1 GB. Quien espere un modelo más ligero que el original no lo va a encontrar aquí.

La calibración se hizo exclusivamente con 256 secuencias de WikiText de 2048 tokens (semilla 42), sin prompts de JBB ni respuestas de rechazo, lo que convierte a este checkpoint en la línea base de "código actual" del autor para comparar contra variantes posteriores con datos de seguridad añadidos. Su interés ahora mismo es metodológico: publica la perplexidad completa en WikiText-2, siete tareas zero-shot, y tasas de ataque y de sobrerrechazo evaluadas con HarmBench y WildGuard, junto con todos los registros crudos de generación y de jueces en el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), derivado de `meta-llama/Meta-Llama-3-8B-Instruct`; pesos densos estándar tras plegar la factorización SVD |
| Parametros totales | 8.030.261.248 (recuento real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (heredada del modelo base; no verificado explícitamente en la model card) |
| Tipos de cuantizacion | No se publican cuantizaciones en el repositorio (solo safetensors). El tamaño del repo (16,1 GB para 8,03B parámetros) indica pesos en fp16/bf16, cuantizables a posteriori con herramientas estándar |
| Idiomas soportados | No disponible en la model card; el modelo base Llama 3 8B Instruct está orientado principalmente al inglés con soporte limitado de otros idiomas |
| Licencia | `llama3` (Llama 3 Community License) |
| Formato de pesos | `safetensors` (pesos densos consolidados; no hay GGUF, AWQ ni GPTQ publicados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only con atención causal, sin mezcla de expertos y sin componentes híbridos SSM. Sobre esa base, el autor aplica un pipeline de compresión en dos fases. La primera es Swift-SVD, que factoriza las matrices del modelo con asignación dinámica de rango gobernada por un parámetro alfa de 0,6; la importancia por capa se calcula a partir de estadísticas de WikiText. La segunda es la recuperación SVD-LLM: se entrena LoRA de forma secuencial sobre los factores U y V, con datos `Alpaca-cleaned` limpios y dos épocas por pasada de entrenamiento.

La calibración es deliberadamente mínima: 256 secuencias de WikiText, 2048 tokens cada una, semilla 42, sin prompts de JBB ni respuestas de rechazo. Esta elección es lo que define el checkpoint como línea base "current-code": el autor quiere un punto de partida sin contaminación de datos de seguridad para medir por separado el efecto de la compresión y el de una eventual recuperación con datos de alineación. El resultado se pliega a pesos densos, de modo que el grafo de inferencia es el de un Llama 3 8B normal y corriente; los detalles de recuento de parámetros realizado y de recuperación quedan registrados en el `compression.json` del repositorio.

No se documentan en la información disponible el número total de tokens de preentrenamiento del modelo original, la composición completa del dataset de Llama 3, ni si hubo RLHF/DPO más allá del alineamiento heredado del Instruct original.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste instructivo de Llama 3 8B Instruct.
- Razonamiento de propósito general y respuesta a instrucciones en formato chat (requiere aplicar la plantilla de Llama 3).
- Generación de código y matemáticas a nivel de modelo de 8B, aunque degradadas respecto al original por la compresión (la perplexidad de WikiText-2 sube a 51,4672).
- Evaluación zero-shot en cuestionarios de conocimiento y sentido común: el autor reporta resultados en ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA.
- Soporte de tool calling / function calling: no documentado en la model card; no se ha verificado tras la compresión.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el checkpoint está pensado para evaluación, no para despliegue agéntico.
- Capacidades multilingües: no documentadas en esta ficha; dependen del modelo base.
- Modo "thinking", visión y audio: no disponibles.
- Capacidad especial: es un artefacto de investigación para estudiar la degradación de seguridad bajo compresión, con registros de evaluación reproducibles incluidos en el repo.

## Casos de uso

- Investigación sobre el trade-off seguridad/utilidad en compresión: sirve como línea base "sin datos de seguridad" contra la que comparar variantes como `svd-safety-l3_swift_jbbsft1_remove50`, midiendo cuánto cambia la tasa de ataque al añadir datos de rechazo en la recuperación.
- Estudios de robustez frente a jailbreak: con un ASR de 0,601923 en AdvBench y 0,514377 en StrongREJECT (juez HarmBench), es un punto de medida útil para cuantificar cuánta seguridad pierde un modelo al eliminar el 50 % del presupuesto de parámetros.
- Calibración de pipelines de evaluación de seguridad: el repositorio incluye los ficheros crudos en `safety/` y `utility/` con generaciones por prompt y registros de jueces, lo que permite auditar la fiabilidad del juez y reutilizar el arnés de evaluación en otros modelos.
- Análisis de sobrerrechazo: la métrica macro de sobrerrechazo (0,0985973 con WildGuard sobre XSTest-safe y OR-Bench) permite estudiar si la compresión vuelve al modelo más o menos conservador a la hora de rechazar peticiones benignas.
- Reproducción de experimentos de factorización SVD: investigadores que trabajen en SVD-LLM o Swift-SVD pueden comparar su recuperación (LoRA secuencial sobre U y V, Alpaca-cleaned, dos épocas) contra esta referencia con semilla fija 42.
- Evaluación de degradación de utilidad: la perplexidad completa de WikiText-2 (51,4672) y los siete benchmarks zero-shot sirven para construir curvas de degradación en función de la ratio de compresión.
- Docencia y divulgación: ejemplo reproducible de cómo un checkpoint comprimido y plegado a denso conserva la interfaz de Transformers, útil para explicar qué significa realmente "compresión" cuando el tamaño de descarga no baja.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---:|
| Perplexidad WikiText-2 (completa) | 51,4672 |
| AdvBench ASR (juez HarmBench) | 0,601923 |
| StrongREJECT ASR (juez HarmBench, no el scorer nativo) | 0,514377 |
| Sobrerrechazo macro (WildGuard, XSTest-safe + OR-Bench) | 0,0985973 |

Condiciones de evaluación declaradas por el autor: límite de generación de 512 tokens, sin topes de muestras en pruebas de humo, conjuntos completos de prompts de AdvBench y StrongREJECT. Los resultados por tarea de ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA no se incluyen como cifras en la información disponible; el autor remite a los ficheros de `utility/` del repositorio.

No se han publicado en la información disponible resultados comparativos frente a otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 16,1 GB solo de pesos, más caché KV; en la práctica requiere del orden de 17-20 GB para contextos moderados.
- VRAM con cuantización a 8 bits: alrededor de 8-9 GB de pesos; con 4 bits, alrededor de 4,5-5,5 GB, siempre que se genere la cuantización por cuenta propia, ya que el repositorio solo publica safetensors.
- GPU de datacenter: A100 40/80 GB, H100, L40S; cualquiera de ellas sirve con holgura y permite lotes grandes.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en fp16 con contexto limitado; en RTX 3090 (24 GB) de forma similar; en GPUs de 12-16 GB (RTX 4070 Ti, 4080, 4060 Ti 16 GB) es necesario cuantizar a 8 o 4 bits.
- Despliegue: compatible con `transformers` y con Text Generation Inference (la etiqueta `text-generation-inference` y `endpoints_compatible` está presente). vLLM es viable al ser pesos densos Llama 3 estándar. Para llama.cpp u Ollama habría que convertir previamente a GGUF.
- Latencia y throughput: no disponibles. Al conservar 8,03B parámetros densos, el coste por token es equiparable al de un Llama 3 8B sin comprimir; la compresión no aporta aceleración en inferencia tras el plegado.
- Aplicación de la plantilla de chat de Llama 3 obligatoria para obtener respuestas en formato conversacional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l3_swift_wiki42_current_remove50` | 8,03B densos | 8192 (heredado) | llama3 | safetensors | Línea base sin datos de seguridad en la recuperación; perplexidad WikiText-2 51,4672 |
| `meta-llama/Meta-Llama-3-8B-Instruct` (modelo base) | 8,03B densos | 8192 | llama3 | safetensors | Referencia de utilidad y seguridad sin compresión; cifras concretas no disponibles en la información proporcionada |
| `Jeesup/svd-safety-l3_swift_jbbsft1_remove50` | No disponible | No disponible | llama3 | safetensors | Variante de la misma familia con recuperación que incorpora datos de JBB; resultados no disponibles en esta información |
| `Jeesup/svd-safety-l31_swift_remove50` | No disponible | No disponible | llama3 | safetensors | Variante derivada de Llama-3.1-8B-Instruct con eliminación del 50 % de parámetros densos |

No se dispone de datos de benchmarks de las alternativas en la información proporcionada, por lo que no es posible establecer una comparación numérica de rendimiento.

## Limitaciones y advertencias

- El autor indica explícitamente que las mediciones "no establecen idoneidad para despliegue"; es un checkpoint de investigación, no un modelo de producción.
- La seguridad está claramente degradada: una tasa de éxito de ataque de 0,601923 en AdvBench y 0,514377 en StrongREJECT con juez HarmBench implica que algo más de la mitad de los prompts adversariales consiguen respuesta no segura. No debe exponerse a usuarios finales sin filtros adicionales.
- Riesgo de alucinación elevado por la propia compresión: la perplexidad de WikiText-2 de 51,4672 es muy superior a la de un Llama 3 8B sin comprimir, señal de degradación del modelado del lenguaje.
- La "compresión al 50 %" es de presupuesto factorizado, no de tamaño: el checkpoint ocupa 16,1 GB y ejecuta 8,03B parámetros densos. Cualquier expectativa de ahorro de VRAM o de latencia es incorrecta.
- Calibración muy reducida (256 secuencias de WikiText) y sin datos de seguridad, lo que sesga la recuperación hacia la fidelidad en texto genérico y no hacia el comportamiento alineado.
- Idiomas soportados no documentados; el comportamiento fuera del inglés no está verificado tras la compresión.
- Licencia Llama 3 Community License: uso comercial permitido con condiciones (cláusula de 700 millones de usuarios activos mensuales, obligación de mostrar "Built with Meta Llama 3" y requisitos de nomenclatura para modelos derivados). El nombre de este checkpoint no sigue el prefijo "Llama 3" que exige la licencia para derivados, lo que conviene revisar antes de cualquier redistribución.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad; la reproducibilidad depende de los ficheros incluidos por el autor.
- StrongREJECT se evalúa con el juez de HarmBench y no con su scorer nativo, por lo que las cifras no son directamente comparables con publicaciones que usan el scorer original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_swift_wiki42_current_remove50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Variante con recuperación JBB: https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbsft1_remove50
- Variante sin recuperación (ficha hermana): https://huggingface.co/Jeesup/svd-safety-l3_swift_remove50
- Variante sobre Llama 3.1: https://featherless.ai/models/Jeesup/svd-safety-l31_swift_remove50
- Endpoint de inferencia (FriendliAI): https://friendli.ai/models/Jeesup/svd-safety-l3_swift_remove50
- Endpoint de inferencia de la variante JBB (FriendliAI): https://friendli.ai/models/Jeesup/svd-safety-l3_swift_jbbsft1_remove50
