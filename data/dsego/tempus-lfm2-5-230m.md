# dsego/tempus-lfm2.5-230m

## Resumen

tempus-lfm2.5-230m es un ajuste fino (finetune) del modelo base LiquidAI/LFM2.5-230M, desarrollado por el usuario dsego, especializado en una única tarea: extraer y normalizar las horas de reloj mencionadas en mensajes de chat en inglés. El modelo recibe un mensaje y devuelve una lista de líneas con el formato `texto=HH:MM`, resolviendo a partir del contexto si una hora escrita solo con dígitos (por ejemplo, "7") corresponde a la mañana o a la tarde. Con 229.693.184 parámetros (aproximadamente 230M), está pensado para inferencia en CPU y en entornos con recursos muy limitados.

La relevancia del modelo no reside en su capacidad general, sino en su especialización extrema y su eficiencia: responde en torno a 99 ms (mediana) en 4 núcleos de un Ryzen 3600 sin GPU, con un archivo GGUF de 247 MB en cuantización Q8_0. Esto lo hace adecuado para integrarse en pipelines de procesamiento de mensajes, asistentes de calendario o sistemas de extracción de entidades en tiempo real, donde un modelo grande sería desproporcionado.

El modelo se distribuye únicamente en formato GGUF para llama.cpp, solo soporta inglés y está bajo la LFM Open License v1.0, que restringe el uso comercial a organizaciones con ingresos anuales inferiores a 10 millones de dólares. Es un derivado del modelo de Liquid AI, por lo que hereda tanto sus limitaciones de licencia como su arquitectura base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de LiquidAI/LFM2.5-230M; arquitectura exacta del base no disponible en la informacion proporcionada) |
| Parametros totales | 229.693.184 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--ctx-size 1024` |
| Tipos de cuantizacion | Q8_0 (247 MB) y Q4_K_M (153 MB) en formato GGUF |
| Idiomas soportados | Ingles unicamente |
| Licencia | LFM Open License v1.0 (uso comercial solo para organizaciones con ingresos anuales inferiores a 10 M USD) |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-230M, un transformer de 230M parámetros, y se ha ajustado mediante LoRA de rango 16 con la herramienta Unsloth durante 3 épocas sobre 11.299 mensajes sintéticos. Posteriormente, el adaptador se fusionó con el modelo base y se convirtió a GGUF. La configuración de entrenamiento está disponible en el repositorio del autor (`configs/lfm2.5-230m-v2-s1-compact.yaml`).

La innovación principal no es arquitectónica sino de especialización: el modelo aprende a identificar menciones de horas en texto conversacional, a copiar el fragmento textual exacto que las representa y a resolver ambigüedades como "7" a "19:00" o "02:00" según el contexto situacional. El formato de respuesta es rígido y estructurado (`texto=HH:MM` por línea, o `none`), lo que facilita su parseo. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado sobre datos sintéticos generados y verificados por modelos de lenguaje con una revisión humana limitada.

## Capacidades

- Extracción de horas de reloj en mensajes de chat en inglés, con resolución de ambigüedad mañana/tarde según el contexto.
- Normalización a formato de 24 horas (`HH:MM`) con copia del texto original como etiqueta.
- Reconocimiento de "noon" y "midnight" como horas válidas.
- Detección de ausencia de horas: devuelve `none` cuando el mensaje no contiene ninguna hora de reloj.
- Ignoración por diseño de duraciones, tiempos relativos ("in 2 hours") y períodos vagos ("this afternoon").
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo de pensamiento (thinking mode).
- Capacidad multilingüe: únicamente inglés.
- Formato de salida determinista y parseable, pensado para decodificación greedy (temperatura 0).

## Casos de uso

- Enriquecimiento de mensajes de chat en pipelines de datos: el modelo puede procesar cada mensaje entrante y etiquetarlo con las horas mencionadas, permitiendo construir índices temporales o detección de eventos sobre grandes volúmenes de conversaciones con un coste computacional mínimo en CPU.
- Asistentes de calendario y recordatorios: al extraer horas normalizadas de mensajes como "dinner at 7", el sistema puede proponer automáticamente eventos con la hora correcta, resolviendo la ambigüedad mañana/tarde a partir del contexto de la conversación.
- Preprocesamiento para modelos mayores: dado su bajo coste y latencia, puede actuar como primer filtro que detecta y normaliza horas antes de pasar el mensaje a un LLM de mayor tamaño, reduciendo el coste total del pipeline.
- Moderación y análisis de conversaciones: permite identificar menciones de horas en mensajes para auditoría, búsqueda o análisis de patrones temporales en foros, chats de soporte o redes sociales.
- Integración en el navegador: el modelo cabe en un archivo de 153-247 MB y puede ejecutarse en una pestaña del navegador mediante llama.cpp compilado a WebAssembly, habilitando extracción de horas en aplicaciones cliente sin backend.
- Sistemas embebidos y edge computing: con latencias de 72-99 ms en 4 núcleos de CPU y sin GPU, es viable en dispositivos con recursos limitados para tareas de extracción de entidades temporales en tiempo real.
- Extracción de entidades en herramientas de productividad: integración en clientes de correo o mensajería para resaltar automáticamente las horas mencionadas en los hilos de conversación.

## Benchmarks y rendimiento

Los datos de evaluación provienen de la model card del autor. La métrica principal es exact match por mensaje: se requiere encontrar todas las horas, con el span correcto y la lectura correcta en 24 horas.

| Evaluacion | Q8_0 | Q4_K_M | Media de 3 ejecuciones (Q8_0) |
|---|---|---|---|
| Principal (530 mensajes) | 97,0% | 95,7% | 96,5% |
| Principal, hora del dia implicita solo por la situacion | 92,1% | 89,3% | 91,0% |
| Fresh (378 mensajes de situaciones no vistas en entrenamiento) | 97,4% | 97,4% | 96,8% |
| Falsos positivos en 1.021 mensajes sin hora de reloj | 0 | 0 | 0,2% |
| Latencia en CPU, mediana, 4 nucleos de Ryzen 3600 compartido | 99 ms | 72 ms | 96 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo está especializado en una única tarea y no se evalúa en capacidades generales.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo está pensado para ejecutarse en CPU (`--n-gpu-layers 0 --device none` en el ejemplo de llama.cpp).
- GPU recomendadas: no aplica; el autor no proporciona datos de inferencia en GPU.
- Cabe en GPU consumer: sí, por tamaño (153-247 MB), pero no es el escenario objetivo ni se documentan rendimientos en GPU.
- Opciones de despliegue: llama.cpp (probado en el tag b12292), con `llama-server` para servir el modelo vía API compatible con endpoints. También es viable en el navegador mediante compilación a WebAssembly.
- Latencia y throughput: mediana de 99 ms con Q8_0 y 72 ms con Q4_K_M en 4 núcleos de un Ryzen 3600 compartido. No se documenta throughput en peticiones por segundo.
- Configuración de referencia del autor: `--threads 4 --threads-batch 4 --n-gpu-layers 0 --device none --parallel 1 --ctx-size 1024 --cache-ram 0 --no-webui`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| tempus-lfm2.5-230m (este modelo) | 230M | no disponible (ejemplo con 1024) | Extraccion de horas en ingles | LFM Open License v1.0 (comercial < 10 M USD) | GGUF |
| tempus-qwen3.5-0.8b | 0,8B | no disponible | Extraccion de horas en ingles | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| LiquidAI/LFM2.5-230M (modelo base) | 230M | no disponible | Modelo de lenguaje general | LFM Open License v1.0 | safetensors y otros |

El autor señala explícitamente que el modelo de 0,8B (tempus-qwen3.5-0.8b) supera a este en los casos difíciles, como "dinner at 7? or lunch at noon" o "skip to 2:30 in the video, dinner at 7?", donde el modelo de 230M omite alguna hora. No se dispone de datos de benchmarks de modelos comparables de la misma categoría (extracción de entidades temporales) en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en inglés; no soporta otros idiomas.
- Solo reconoce horas escritas con dígitos, además de "noon" y "midnight". Las horas escritas con letras ("dinner at seven") no están soportadas.
- Ignora por diseño duraciones, tiempos relativos ("in 2 hours") y períodos vagos ("this afternoon").
- La inferencia de mañana o tarde en situaciones no familiares es el área más débil, con aproximadamente un 92% de acierto.
- Puede omitir horas que un modelo mayor sí detecta: para "dinner at 7? or lunch at noon" devuelve solo el 7, y para "skip to 2:30 in the video, dinner at 7?" no devuelve nada.
- Los datos de entrenamiento y evaluación son sintéticos, generados y verificados por modelos de lenguaje con una revisión humana limitada, lo que puede introducir sesgos o patrones artificiales no representativos del lenguaje real.
- Riesgo de alucinación: aunque el formato de salida es rígido, el modelo podría generar horas inexistentes o mal normalizadas en entradas fuera de distribución; se recomienda validar la salida con el cliente de parseo del repositorio.
- Restricción de licencia: la LFM Open License v1.0 solo permite uso comercial a organizaciones con ingresos anuales inferiores a 10 millones de dólares, y esta restricción se aplica también a los derivados como este finetune.
- El modelo está entrenado sin system prompt; introducir uno puede degradar el rendimiento. Debe usarse con decodificación greedy (temperatura 0) y el formato de prompt exacto indicado en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dsego/tempus-lfm2.5-230m
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Repositorio con código, datos y resultados: https://github.com/dsegovia90/tempus_finetune
- Modelo alternativo de 0,8B: https://huggingface.co/dsego/tempus-qwen3.5-0.8b
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia LFM Open License v1.0: incluida en el repositorio del modelo (archivo LICENSE)
