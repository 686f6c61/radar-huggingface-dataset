# kineticforge/particle-qwen35-ngram-research

## Resumen
particle-qwen35-ngram-research es un adaptador de investigación publicado por kineticforge (Daniel Andersen, según su sitio web) sobre Qwen/Qwen3.5-0.8B. El proyecto entrena una memoria n-gram basada en lookup y la compara, con el mismo conjunto de 512 paquetes de entrenamiento, frente al modelo base sin tocar, un adaptador LoRA entrenado con los mismos datos y Qwen3.5-2B. La pregunta central es si una memoria explícita de n-gramas mejora a un modelo pequeño en razonamiento, código, matemáticas y seguimiento de instrucciones.

El resultado es mixto: con n-gram, el modelo pasa de 4/50 a 9/50 en HumanEval y de 27/50 a 32/50 en IFEval, pero baja de 25/50 a 16/50 en GSM8K estricto. Frente a 2B sigue lejos en razonamiento (18/50 frente a 30/50) y en código (9/50 frente a 25/50). Es relevante porque documenta con intervalos pareados y tiempos de generación un intento de adaptación eficiente (273 MB adicionales) en un modelo de 0,8B, con resultados que no justifican sustituir a un modelo mayor.

La ficha se basa en la model card y en los metadatos de Hugging Face; no hay información sobre idiomas, contexto de entrada, cuantizaciones ni sesgos. El adaptador es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-0.8B) con adaptador de memoria n-gram basado en lookup; no se detalla la configuración del base ni si es denso o MoE |
| Parámetros totales | 0,8 mil millones en el modelo base; el adaptador añade 273 MB de almacenamiento (naturaleza paramétrica no detallada) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; se documentan 32.768 tokens de salida máximo |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch; no se confirma safetensors ni GGUF |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tamaño del repositorio | 6,3 GB; el autor reporta 2,04 GB de archivos del modelo con adaptador |
| Librería | PyTorch |
| Pipeline de Hugging Face | No disponible |
| Descargas / likes | 0 descargas, 1 like |
| Fecha de creación / actualización | 2026-10-17 / 2026-10-18 |

## Arquitectura y entrenamiento
El modelo base es Qwen3.5-0.8B, un transformer de 0,8 mil millones de parámetros. La guía de la serie Qwen3.5 menciona arquitecturas MoE y multimodalidad nativa para la familia, pero la información disponible no detalla la configuración del 0.8B; por tanto, no se confirma si es denso o MoE ni su ventana de contexto de entrada. El adaptador añadido es una memoria n-gram de tipo lookup: almacena patrones de n-gramas y los recupera durante la generación. El autor indica que añade 273 MB de almacenamiento, frente a 22 MB de un LoRA.

El entrenamiento usó 512 paquetes, 589.624 tokens de entrada y 196.350 posiciones puntuadas, destilados de Qwen3.5-4B denso con el backbone congelado. El mismo conjunto se usó para el LoRA de comparación. El checkpoint final se fijó antes de la evaluación. No se documentan RLHF, DPO ni una fase de pretraining conjunto; el autor advierte que este retrofit corto no reproduce el entrenamiento de Qwen. En las evaluaciones se activó el modo thinking y se permitieron hasta 32.768 tokens de salida. El adaptador redujo el número de tokens generados y el tiempo en código y matemáticas, pero no hay mediciones de VRAM ni de throughput con trabajo igualado.

## Capacidades
- Generación de texto y razonamiento: evaluado en MMLU-Pro con modo thinking; 18/50 frente a 17/50 del base.
- Código: HumanEval 9/50; mejora de +10 puntos sobre el base (6 ganadas, 1 perdida), con 90.445 tokens de salida y 13,6 minutos en el panel, frente a 458.877 tokens y 68,0 minutos del LoRA.
- Matemáticas: GSM8K 16/50 con extracción estricta y 34/50 con flexible; el base obtiene 25/50 y 38/50, por lo que hay regresión.
- Seguimiento de instrucciones: IFEval 32/50 frente a 27/50 del base; el autor exige que todas las instrucciones verificadas pasen para contar la pregunta como correcta.
- Memoria n-gram: recuperación por lookup; no se documenta tool calling, function calling, uso de agentes, visión, audio ni capacidades multilingües.
- No hay pipeline de Hugging Face ni demo; el artefacto está pensado para experimentación y reproducción.

## Casos de uso
- Reproducción de experimentos de adaptación eficiente: cargar el adaptador n-gram y el base Qwen3.5-0.8B, ejecutar los mismos subconjuntos de 50 preguntas de MMLU-Pro, HumanEval, GSM8K e IFEval y comprobar los intervalos pareados publicados.
- Investigación sobre memoria explícita: analizar por qué la memoria mejora código e instrucciones pero degrada matemáticas, separando efectos de formato (marcador `####`) y de contenido.
- Medición de eficiencia de decodificación: comparar tokens de salida y tiempo de generación entre memoria, LoRA y base; el autor reporta 90.445 frente a 458.877 tokens en HumanEval, con 13,6 frente a 68,0 minutos.
- Prototipos en hardware de consumo: el base de 0,8B y un adaptador de 273 MB permiten experimentar en una GPU de 8-12 GB, con un conjunto de archivos de modelo de 2,04 GB.
- Docencia y formación: usar el caso como ejemplo de adaptador no paramétrico frente a LoRA con el mismo dataset de 512 paquetes y 196.350 posiciones puntuadas.
- Base para experimentos combinados: el autor tiene en cola pruebas de n-gram + LoRA y especialización en código; este checkpoint sirve como línea base reproducible.
- Análisis de robustez de formato: evaluar la sensibilidad al marcador `####` en GSM8K y el efecto de la extracción estricta frente a la flexible.
- Evaluación de instrucciones estrictas: usar IFEval para medir respuestas incompletas, bucles exactos y cumplimiento de múltiples restricciones en un modelo pequeño.

## Benchmarks y rendimiento
| Benchmark | 0.8B original | + n-gram | + LoRA | 2B original |
|---|---:|---:|---:|---:|
| MMLU-Pro (razonamiento) | 17/50 | 18/50 | 19/50 | 30/50 |
| HumanEval (código) | 4/50 | 9/50 | 7/50 | 25/50 |
| GSM8K (matemáticas, estricto) | 25/50 | 16/50 | 7/50 | 42/50 |
| IFEval (instrucciones) | 27/50 | 32/50 | Pendiente | Pendiente |

| Benchmark | Ganadas / perdidas vs 0.8B original | Cambio neto | Intervalo pareado 95% |
|---|---:|---:|---:|
| MMLU-Pro (razonamiento) | 9 / 8 | +2 puntos | -14 a +18 |
| HumanEval (código) | 6 / 1 | +10 puntos | 0 a +20 |
| GSM8K (matemáticas) | 6 / 15 | -18 puntos | -36 a 0 |
| IFEval (instrucciones) | 10 / 5 | +10 puntos | -4 a +24 |

| Modelo | GSM8K estricto | GSM8K flexible |
|---|---:|---:|
| 0.8B original | 25/50 | 38/50 |
| + n-gram | 16/50 | 34/50 |
| + LoRA | 7/50 | 27/50 |
| 2B original | 42/50 | 46/50 |

MMLU-Pro usa un extractor fijado y normalizado en Markdown; el LoRA obtiene 19/50 normalizado y 20/50 con extracción estricta oficial porque una respuesta contiene opciones conflictivas. IFEval cuenta como correcta solo si todas las instrucciones verificadas pasan; las respuestas sin terminar no reciben crédito. Los intervalos cubren el muestreo de preg
