# Rin247/gemma-3-1b-it-Uncensored-Aquarion-INT4

## Resumen

Este modelo es una cuantización INT4 weight-only del modelo `gemma-3-1b-it` de Google, realizada por el usuario Rin247. Además de la cuantización, se ha aplicado una técnica de "abliteración" (uncensoring) mediante proyección ortogonal de la dirección de rechazo, lo que elimina las respuestas de negativa del modelo original. El resultado es un modelo de 651 millones de parámetros (comercializado como 1B) que puede ejecutarse en hardware modesto, con un tamaño de pesos de aproximadamente 325 MB en INT4.

La relevancia de este modelo radica en dos aspectos: por un lado, permite ejecutar un modelo de razonamiento y generación de texto de calidad en dispositivos con poca VRAM (tarjetas de 2-4 GB); por otro, la abliteración lo hace útil para aplicaciones de investigación en alineación y seguridad, así como para generación creativa sin restricciones. Sin embargo, el formato de cuantización es personalizado y requiere un paso previo de dequantización antes de usar un motor de inferencia estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en `gemma-3-1b-it`) |
| Parametros totales | 651.005.056 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 128k tokens) |
| Tipos de cuantizacion | INT4 weight-only (RTN en CPU) |
| Idiomas soportados | No disponible (el modelo base soporta 140+ idiomas) |
| Licencia | No disponible (el modelo base usa la licencia Gemma de Google) |
| Formato de pesos | safetensors con cuantizacion INT4 (escalas y shapes almacenados como buffers) |

## Arquitectura y entrenamiento

El modelo base `gemma-3-1b-it` es un transformer decoder-only con atención multi-query y un contexto de 128k tokens, entrenado por Google sobre un corpus multilingüe y multimodal (texto e imagen). Esta cuantización no modifica la arquitectura, solo comprime los pesos a INT4 mediante el método RTN (Round-To-Nearest) ejecutado en CPU. Antes de la cuantización, se aplicó una abliteración por proyección ortogonal de la dirección de rechazo, una técnica que elimina la tendencia del modelo a negarse a responder ciertas solicitudes. No se dispone de detalles adicionales sobre el entrenamiento del modelo base (datasets, pipeline de RLHF, etc.) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: al estar basado en `gemma-3-1b-it`, conserva las capacidades de generación coherente y razonamiento de corto alcance del modelo original.
- Generación de código: el modelo base tiene competencias básicas en programación, aunque no se especifica si esta cuantización las mantiene íntegramente.
- Multilingüismo: el modelo base soporta más de 140 idiomas, pero esta versión no declara explícitamente qué idiomas conserva.
- Tool calling y function calling: el modelo base soporta estas capacidades, pero no se indica si sobreviven a la cuantización y abliteración.
- Capacidad multimodal: el modelo base acepta imágenes como entrada, pero las etiquetas de este repositorio (`gemma3_text`) sugieren que esta cuantización se limita a texto.
- Sin modo de razonamiento especial (thinking mode): no se menciona tal funcionalidad.

## Casos de uso

- Generación creativa sin restricciones: adecuado para escribir cuentos, guiones o diálogos donde el usuario prefiere evitar respuestas de rechazo automáticas. La abliteración elimina las negativas típicas del modelo base.
- Investigación en alineación y seguridad: permite estudiar el efecto de la abliteración sobre el comportamiento del modelo, comparando respuestas con y sin la dirección de rechazo.
- Prototipado de chatbots en hardware limitado: con ~325 MB de pesos, puede ejecutarse en una GPU de 2-4 GB o incluso en CPU con suficiente RAM, ideal para pruebas locales sin infraestructura costosa.
- Generación de código en entornos de bajos recursos: para autocompletar funciones o generar scripts simples en un portátil sin GPU dedicada.
- Análisis de texto multilingüe: si se mantiene el soporte del base, puede usarse para tareas de clasificación, extracción o resumen en múltiples idiomas, siempre que se verifique su rendimiento tras la cuantización.
- Experimentación con cuantización y compresión: sirve como ejemplo de un pipeline de cuantización INT4 personalizado, útil para desarrolladores que quieran estudiar formatos de pesos no estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones MMLU, HumanEval, GSM8K ni comparativas con otras cuantizaciones o el modelo original. Se recomienda evaluar el modelo en las tareas de interés antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 325 MB para los pesos en INT4, más overhead de activaciones y memoria de trabajo. Con una ventana de contexto corta, cabría en 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.). También puede ejecutarse en CPU con 8 GB de RAM, aunque con menor velocidad.
- Compatibilidad con GPU de consumo: sí, es uno de los principales atractivos de esta cuantización.
- Opciones de despliegue: el formato es personalizado (safetensors con buffers de escala). Requiere un script de dequantización antes de usar vLLM, llama.cpp u Ollama. No hay soporte directo para estos motores.
- Latencia y throughput: no disponibles. Dependerá del hardware y del motor de inferencia tras la dequantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma-3-1b-it` (base) | ~1B (651M reales) | 128k | FP16/FP32 | Gemma Terms of Use | HuggingFace oficial |
| `Rin247/gemma-3-1b-it-Uncensored-Aquarion-INT4` | 651M | No disponible | INT4 weight-only | No disponible | HuggingFace (este repo) |
| `Llama-3.2-1B` (base) | 1.23B | 128k | FP16 | Llama 3.2 Community License | HuggingFace oficial |

La comparativa es limitada porque no hay datos de rendimiento para esta cuantización. El modelo base tiene una licencia restrictiva (Gemma), mientras que esta cuantización no declara licencia propia, lo que genera incertidumbre legal. Otras cuantizaciones de `gemma-3-1b-it` en GGUF (disponibles en HuggingFace) ofrecen compatibilidad directa con llama.cpp y Ollama, a diferencia de este formato personalizado.

## Limitaciones y advertencias

- La abliteración puede degradar el rendimiento en tareas de seguridad y moderación, ya que elimina la capacidad del modelo de rechazar solicitudes dañinas.
- Riesgo de alucinación: al ser un modelo pequeño (651M), es propenso a generar información falsa o inconsistente, especialmente en tareas de razonamiento complejo.
- El formato de pesos es personalizado y no está soportado por los motores de inferencia habituales. Requiere dequantización manual antes de su uso, lo que añade complejidad y riesgo de errores.
- La licencia del modelo es incierta: aunque el base usa la licencia Gemma de Google, esta cuantización no especifica su propia licencia, lo que puede limitar su uso comercial.
- No se ha verificado si las capacidades multimodales y de tool calling del modelo base se conservan tras la cuantización y abliteración.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado por la comunidad. Úsese con precaución.
- No hay garantía de que la cuantización INT4 mantenga la calidad del modelo original; se recomienda evaluar en tareas concretas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Rin247/gemma-3-1b-it-Uncensored-Aquarion-INT4
- Modelo base oficial: https://huggingface.co/google/gemma-3-1b-it
- Paper técnico de Gemma 3: https://arxiv.org/html/2503.19786v1
- Página oficial de Gemma 3 (DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Colección de Gemma 3 uncensored (braindao): https://huggingface.co/collections/braindao/gemma-3-uncensored-67f69fa74032c8826bcef524
