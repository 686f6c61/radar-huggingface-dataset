# Shroomy/tinydistill-go-emotions-minilm

## Resumen

`tinydistill-go-emotions-minilm` es un clasificador de texto multietiqueta de emociones en ingles, destilado por el usuario Shroomy a partir del modelo docente `Qwen/Qwen2.5-7B-Instruct` sobre el modelo estudiante `sentence-transformers/all-MiniLM-L6-v2`. El resultado se exporta a ONNX para inferencia rapida en CPU, con un peso de repositorio de 0,2 GB y un fichero de modelo de 91 MB en fp32 (23 MB en int8). El modelo cubre las 28 etiquetas del corpus GoEmotions de Google Research.

La relevancia practica del modelo no esta en su calidad absoluta, sino en su planteamiento metodologico: demuestra el flujo de destilacion de conocimiento desde un LLM de 7B parametros hacia un encoder BERT pequeno (MiniLM) usando etiquetas suaves del docente sobre 10.000 textos de entrenamiento, combinadas con entropia cruzada sobre solo 223 etiquetas doradas (8 por clase). Este enfoque permite obtener un clasificador ligero alli donde no se dispone de anotaciones humanas suficientes.

El modelo es, sin embargo, experimental y sus propios resultados publicados muestran un rendimiento muy bajo en terminos absolutos (accuracy de 0,060 en ONNX fp32 sobre 5.427 textos de test). Debe evaluarse como una prueba de concepto de destilacion, no como un clasificador de emociones listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, MiniLM-L6 de 6 capas) destilado, exportado a ONNX |
| Parametros totales | no disponible (el modelo base MiniLM-L6 ronda los 22,7 M, pero el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (MiniLM-L6 soporta hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | fp32 y int8 (exportaciones ONNX publicadas) |
| Idiomas soportados | no disponible (el dataset GoEmotions es en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (fp32 e int8); el estudiante original en PyTorch |

## Arquitectura y entrenamiento

El estudiante es `sentence-transformers/all-MiniLM-L6-v2`, un encoder BERT de 6 capas y 384 dimensiones ocultas, adaptado aqui como cabecera de clasificacion multietiqueta sobre 28 clases. El docente es `Qwen/Qwen2.5-7B-Instruct`, consultado en cuantizacion 4-bit sobre GPU (cuda:0) para generar etiquetas suaves sobre los 10.000 textos de entrenamiento de GoEmotions. El entrenamiento combina esa senal de destilacion con entropia cruzada sobre 223 etiquetas doradas (8 por clase, peso 1,0).

El pipeline usa la herramienta `tinydistill` (repositorio de Andreas-Hum), que gestiona la generacion de etiquetas del docente, el entrenamiento del estudiante y la exportacion a ONNX. Se reserva un 5% de los textos de entrenamiento como validacion y se conserva la epoca con menor perdida (hasta 30 epocas, parada temprana tras 3 sin mejora); las epocas retenidas fueron 9, 10, 11, 12, 15, 16, 18 y 22 segun la semilla. Los valores con ± corresponden a la media y desviacion tipica sobre 3 semillas; las filas ONNX son el modelo exportado de la primera semilla.

## Capacidades

- Clasificacion de texto multietiqueta en 28 categorias de emocion: admiration, amusement, anger, annoyance, approval, caring, confusion, curiosity, desire, disappointment, disapproval, disgust, embarrassment, excitement, fear, gratitude, grief, joy, love, nervousness, optimism, pride, realization, relief, remorse, sadness, surprise y neutral.
- Inferencia rapida en CPU gracias a la exportacion ONNX, con latencias de 1,6 ms (batch 1) y 50,1 ms (batch 32) en int8.
- Ejecucion via CLI (`tinydistill predict` y `tinydistill serve`) y via API Python (`tinydistill.Predictor`).
- Compatibilidad declarada con text-embeddings-inference y endpoints compatibles.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni razonamiento multi-paso: es exclusivamente un clasificador.

## Casos de uso

- Moderacion de comunidades en ingles: el modelo puede etiquetar mensajes con categorias como anger, disgust o annoyance para priorizar revision humana, aunque su baja accuracy obliga a usarlo solo como filtro de primera pasada.
- Analisis de sentimiento granular en encuestas: clasificar respuestas abiertas en emociones especificas (gratitude, disappointment, optimism) para enriquecer dashboards, aceptando que las etiquetas son aproximadas.
- Enrutamiento de tickets de soporte: usar la etiqueta dominante (confusion, annoyance, gratitude) para dirigir el ticket al equipo adecuado, con validacion humana posterior.
- Etiquetado asistido de corpus: generar preanotaciones sobre grandes volumenes de texto en ingles para que anotadores humanos las revisen, aprovechando el throughput de 639 textos/s en int8.
- Investigacion sobre destilacion: servir como referencia reproducible del flujo `tinydistill` para experimentar con docentes y estudiantes alternativos.
- Prototipado en dispositivos sin GPU: desplegar el ONNX int8 de 23 MB en entornos con CPU limitada (contenedores, edge) donde un LLM no es viable.
- Filtrado previo en pipelines de datos: descartar o marcar textos con alta carga emocional negativa antes de pasarlos a un modelo mayor, reduciendo coste computacional.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test de GoEmotions (5.427 textos dorados). El docente se evalua zero-shot en 4-bit; el estudiante, en CPU con 2 hilos.

| Modelo | Dispositivo | Accuracy | Macro-F1 | Micro-F1 | Acuerdo con docente | Latencia batch 1 (ms) | Latencia batch 32 (ms) | Throughput (textos/s) | Tamano (MB) |
|---|---|---|---|---|---|---|---|---|---|
| Docente Qwen2.5-7B-Instruct, zero-shot, 4-bit | cuda:0 | 0,045 | 0,277 | 0,268 | no aplica | no disponible | no disponible | no disponible | no disponible |
| Estudiante, PyTorch | cpu | 0,057 ± 0,005 | 0,226 ± 0,017 | 0,253 ± 0,003 | 0,157 ± 0,005 | 5,9 | 107,4 | 297,9 | 91 |
| Estudiante, ONNX fp32 | cpu | 0,060 | 0,208 | 0,250 | 0,161 | 3,7 | 103,2 | 310,0 | 91 |
| Estudiante, ONNX int8 | cpu | 0,059 | 0,199 | 0,246 | 0,160 | 1,6 | 50,1 | 639,3 | 23 |
| Baseline: estudiante con 8 etiquetas doradas por clase, sin docente | cpu | 0,000 ± 0,000 | 0,000 ± 0,000 | 0,000 ± 0,000 | 0,128 ± 0,000 | no disponible | no disponible | no disponible | no disponible |
| Cota superior: estudiante con todas las etiquetas doradas | cpu | 0,308 ± 0,009 | 0,134 ± 0,003 | 0,431 ± 0,011 | 0,063 ± 0,002 | no disponible | no disponible | no disponible | no disponible |

La lectura clave: la destilacion mejora claramente al baseline sin docente (accuracy 0,000 frente a 0,060), pero queda muy lejos de la cota superior entrenada con todas las etiquetas doradas (0,308). El acuerdo con el docente es bajo (0,16), lo que sugiere que el estudiante no reproduce fielmente el comportamiento del LLM. La cuantizacion int8 apenas degrada la calidad (0,060 a 0,059 de accuracy) y multiplica por 2 la velocidad.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para CPU. En GPU, el fichero ONNX int8 de 23 MB ocupa una fraccion minima de VRAM.
- GPU recomendadas: no aplica; cualquier GPU moderna puede ejecutarlo, pero no aporta ventaja frente a CPU para este tamano.
- Consumer GPU: cabe en cualquier GPU integrada o dedicada, e incluso en CPU de un solo nucleo.
- Opciones de despliegue: ONNX Runtime (via `tinydistill`), servidor CLI `tinydistill serve`, y compatibilidad declarada con text-embeddings-inference y endpoints compatibles. No se documenta soporte para vLLM, llama.cpp ni Ollama.
- Latencia y throughput (CPU, 2 hilos): 1,6 ms batch 1 y 50,1 ms batch 32 en int8; 3,7 ms y 103,2 ms en fp32. Throughput de 639,3 textos/s en int8 y 310,0 en fp32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Calidad publicada |
|---|---|---|---|---|---|
| tinydistill-go-emotions-minilm | no disponible (base MiniLM-L6) | no disponible | Destilacion LLM a encoder + ONNX | apache-2.0 | Accuracy 0,060 en GoEmotions test |
| sentence-transformers/all-MiniLM-L6-v2 (base) | ~22,7 M (dato externo, no en la model card) | 512 tokens (dato externo) | Encoder de embeddings, sin cabecera de clasificacion | apache-2.0 | No evaluado como clasificador en la informacion disponible |
| Clasificadores BERT fine-tuned en GoEmotions | no disponible | 512 tokens tipicamente | Fine-tuning supervisado con etiquetas doradas | variable | No disponible en la informacion proporcionada |

No se dispone de datos comparativos de otros clasificadores GoEmotions en la informacion proporcionada; la unica referencia interna es la cota superior del propio autor (accuracy 0,308 con todas las etiquetas doradas), que supera ampliamente a este modelo.

## Limitaciones y advertencias

- Rendimiento muy bajo en terminos absolutos: accuracy de 0,060 y macro-F1 de 0,199 en ONNX int8 sobre el test de GoEmotions. No es apto para produccion sin validacion exhaustiva.
- Acuerdo con el docente de solo 0,16, lo que indica que el estudiante no captura bien el comportamiento del LLM de origen.
- El docente zero-shot tambien rinde mal en esta tarea (accuracy 0,045), por lo que la senal de destilacion es de baja calidad.
- Entrenado con solo 223 etiquetas doradas (8 por clase) mas etiquetas suaves; el desbalance y la escasez de supervision limitan la generalizacion.
- Idioma: el dataset GoEmotions es en ingles; no se declaran idiomas soportados y el rendimiento en castellano es previsiblemente nulo o muy degradado.
- Riesgo de etiquetas espurias: al ser multietiqueta con 28 clases y baja precision, las predicciones pueden inducir a error en sistemas automatizados de moderacion.
- Licencia apache-2.0 declarada por el uploader, pero la propia model card advierte de que deben revisarse las licencias del estudiante, el docente (Qwen2.5-7B-Instruct) y los datos (GoEmotions) antes de un uso comercial.
- Modelo experimental con 0 descargas y 0 likes en el momento de la ficha; sin validacion independiente por la comunidad.
- No soporta generacion, razonamiento ni tool calling; cualquier caso de uso que requiera comprension profunda del texto queda fuera de su alcance.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shroomy/tinydistill-go-emotions-minilm
- Repositorio de la herramienta tinydistill: https://github.com/Andreas-Hum/tinydistill
- Modelo base estudiante: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo docente: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
