# Maxenith/MAX-9B

## Resumen
MAX-9B es un modelo de lenguaje de 8.953.803.264 parametros (aproximadamente 9B) desarrollado por Maxenith, obtenido mediante fine-tuning supervisado del modelo base Qwen/Qwen3.5-9B. Esta orientado a tareas de razonamiento y matematicas, e incorpora un modo de pensamiento (thinking mode) heredado de la familia Qwen. El modelo se distribuye en formato safetensors para la libreria transformers y cuenta con una variante cuantizada AWQ de 4 bits publicada por el mismo autor.

El problema que aborda es la eficiencia en la generacion de cadenas de razonamiento: segun la model card, en el conjunto de test completo de GSM8K alcanza un 94,3% de exactitud frente al 89,1% del modelo base, generando aproximadamente un 54% menos de tokens (982 frente a 2.141 de media). En MATH-500 reporta un 92,2% tras reintentar las preguntas con razonamiento incompleto con un limite ampliado a 16.000 tokens.

Es relevante por su relacion calidad-eficiencia en tareas matematicas y por su compatibilidad con endpoints estandar de transformers, lo que facilita su integracion. No obstante, el autor no ha publicado comparativas exhaustivas frente al modelo base en todos los benchmarks ni ha realizado una descontaminacion formal completa, por lo que los resultados deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag qwen3_5_text) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors bf16 (original); AWQ 4 bits (variante Maxenith/MAX-9B-AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache License 2.0 (segun model card; el campo de licencia del repo figura como no disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
MAX-9B es un fine-tuning del modelo Qwen/Qwen3.5-9B, que emplea una arquitectura transformer decoder-only identificada con el tag qwen3_5_text. El modelo conserva el mecanismo de chat template del base con soporte para modo pensamiento (enable_thinking=True), que separa la cadena de razonamiento del texto final mediante el token de cierre ``. No se dispone de informacion sobre innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa u otras) en la documentacion proporcionada.

El entrenamiento se realizo sobre datos de razonamiento Open Thoughts. Segun la auditoria de contaminacion incluida en la model card, las fuentes declaradas de fine-tuning son OpenR1-Math-220k (93.733 registros escaneados), Mixture-of-Thoughts (349.317) y OpenThoughts-114k (113.957), con un total de 557.007 registros analizados y solo 2 coincidencias exactas normalizadas con GSM8K y MATH-500. El autor indica que se seleccionaron 5.000 muestras de cada fuente, aunque la auditoria escaneo los repositorios completos, no la seleccion exacta. No se detalla si hubo RLHF, DPO u otras etapas de alineacion posteriores al fine-tuning supervisado.

## Capacidades
- Generacion de texto conversacional con soporte de chat template y roles (system, user, assistant).
- Razonamiento matematico paso a paso en modo pensamiento, con formato de respuesta controlable mediante prompts.
- Resolucion de problemas aritmeticos (GSM8K) y matematicos de nivel competitivo (MATH-500, niveles 1 a 5).
- Razonamiento eficiente: genera cadenas de pensamiento mas cortas que el modelo base con mayor exactitud en GSM8K.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo pensamiento permite cadenas de razonamiento largas.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales: thinking mode activable mediante `enable_thinking=True`; no se declaran vision ni audio.

## Casos de uso
- Tutoria matematica automatizada: el modelo puede resolver problemas aritmeticos y algebraicos mostrando el razonamiento paso a paso, adecuado para plataformas educativas que necesitan explicaciones detalladas con alta exactitud en problemas de nivel escolar (94,3% en GSM8K).
- Verificacion de soluciones y generacion de problemas: dado su rendimiento en MATH-500 (92,2%), puede emplearse para generar y comprobar ejercicios de niveles 1 a 5, con especial solidez en niveles 1 y 2 (97,7% y 98,9%).
- Asistente de razonamiento en entornos de investigacion: su modo pensamiento y su eficiencia de tokens (982 de media en GSM8K frente a 2.141 del base) lo hacen adecuado para pipelines donde el coste por token generado es relevante.
- Generacion de cadenas de razonamiento para destilacion o anotacion: puede producir trazas de razonamiento matematico que sirvan como datos de entrenamiento para modelos menores, con la cautela de revisar posibles errores.
- Despliegue en infraestructura limitada mediante la variante AWQ 4 bits: reduce el uso de VRAM aproximadamente un 50% respecto al modelo en bf16, lo que permite servir el modelo en GPUs de gama alta para consumidores.
- Integracion en aplicaciones conversacionales con requisitos de razonamiento: al usar el chat template estandar de transformers, puede desplegarse detras de endpoints compatibles y gestionar conversaciones multi-turno con contexto gestionado por el servidor.
- Evaluacion comparativa de eficiencia: util como referencia en estudios que midan la relacion entre longitud de razonamiento y exactitud frente al modelo base Qwen3.5-9B.

## Benchmarks y rendimiento

GSM8K (conjunto de test completo, 1.319 preguntas, thinking mode, greedy decoding, bf16):

| Modelo | Exactitud | Margen 95% | Tokens generados (media) | Razonamiento incompleto |
|---|---|---|---|---|
| MAX-9B | 94,3% | ±1,2 | 982 | 34 |
| Qwen3.5-9B (base) | 89,1% | ±1,7 | 2.141 | 88 |

En las 1.215 preguntas donde ambos modelos completaron el razonamiento: MAX-9B 98,0% frente a 95,9% del base.

MATH-500 (500 problemas):

| Configuracion | Exactitud | Razonamiento incompleto |
|---|---|---|
| Limite de 10.000 tokens | 435/500 = 87,0% | 55 |
| Reintento de incompletas con 16.000 tokens | 461/500 = 92,2% (margen 95% aprox. ±2,4) | 27 |

Desglose por nivel en MATH-500 (primer intento): nivel 1, 42/43 (97,7%); nivel 2, 89/90 (98,9%); nivel 3, 98/105 (93,3%); nivel 4, 117/128 (91,4%); nivel 5, 115/134 (85,8%). Tokens generados medios en el primer intento: 3.126.

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en bf16: aproximadamente 18 GB solo para pesos (8,95B parametros x 2 bytes), mas overhead de activaciones y KV cache; se recomienda al menos 24 GB para inferencia comoda.
- Variante AWQ 4 bits: reduce el uso de VRAM aproximadamente un 50% segun la model card, lo que situa los pesos en torno a 5-6 GB y permite su uso en GPUs de consumo con 8-12 GB, dependiendo de la longitud de contexto.
- GPUs recomendadas: A100 (40/80 GB), H100 (80 GB) o RTX 4090 (24 GB) para bf16; RTX 3090/4080 o superiores para la variante AWQ.
- Cabe en GPU de consumo: si, en RTX 4090 en bf16 (24 GB, ajustado) y en GPUs de 8-12 GB con la variante AWQ 4 bits.
- Opciones de despliegue: transformers (referencia oficial), vLLM, TGI o llama.cpp/Ollama si se generan pesos GGUF (no se proporcionan GGUF oficiales en la informacion disponible); la variante AWQ requiere un runtime compatible con AWQ (vLLM, AutoAWQ).
- Latencia y throughput: no disponibles; el modelo genera aproximadamente 982 tokens de media en GSM8K, lo que reduce el coste de generacion frente al base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MAX-9B | ~8,95B | no disponible | 94,3% | 92,2% | Apache 2.0 | Hugging Face (safetensors y AWQ) |
| Qwen3.5-9B (base) | ~9B | no disponible | 89,1% | no disponible | no disponible | Hugging Face |
| Otros modelos de razonamiento de ~9B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparativa documentada por el autor es frente a su modelo base Qwen3.5-9B en GSM8K. No se dispone de datos de benchmarks de terceros ni de comparaciones con otros modelos de razonamiento del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias
- La decodificacion greedy puede provocar bucles de repeticion en modelos de razonamiento, lo que infla el numero de respuestas incompletas; no se han ejecutado evaluaciones con sampling recomendado ni con multiples semillas.
- Diferencias de pocos puntos en benchmarks de este tamano estan dentro del ruido estadistico (margen combinado de aproximadamente ±2,1 en GSM8K).
- No se realizo una comprobacion formal de descontaminacion contra el test de GSM8K antes del entrenamiento; la auditoria posterior encontro 2 coincidencias exactas normalizadas en 557.007 registros, pero no cubre datos de preentrenamiento del modelo base, parafrasis semanticas ni casi duplicados.
- En MATH-500 no se ejecuto una comparacion con el modelo base bajo las mismas condiciones, y la exactitud sobre preguntas con razonamiento completado sobreestima el rendimiento global al excluir las mas dificiles (27 quedaron incompletas incluso con 16.000 tokens).
- El modelo puede alucinar en problemas matematicos fuera de la distribucion de entrenamiento; el rendimiento cae en el nivel 5 de MATH-500 (85,8%).
- No se declaran idiomas soportados, por lo que el rendimiento multilingue es desconocido.
- El campo de licencia del repositorio figura como no disponible, aunque la model card declara Apache 2.0; conviene verificar la licencia antes de uso comercial.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines que dependan de function calling.
- La auditoria de contaminacion no cubre el Identity Adapter v5, que no fue auditado de forma independiente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Maxenith/MAX-9B
- Variante AWQ 4 bits: https://huggingface.co/Maxenith/MAX-9B-AWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Script de evaluacion GSM8K: gsm8k_full_final.py (incluido en el repositorio del modelo)
- Resultados GSM8K: results_MAX-9B.json y results_Original.json (en el repositorio)
- Resultados MATH-500: evals/math500_max9b.json y evals/math500_rerun16k.json (en el repositorio)
- Auditoria de contaminacion: evals/ (informe detallado en el repositorio)
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
