# algolyzer/laya-bangla-lora

## Resumen

laya-bangla-lora es un fine-tune ligero del modelo de clasificación y decisión laya-bangla, especializado en bengalí (escritura bangla y banglish romanizado) e inglés. Lo desarrolla algolyzer y parte de `convaiinnovations/laya-multilingual`, un transformer encoder de unos 322 millones de parámetros. No es un modelo generativo: devuelve respuestas tipadas ("typed decisions") a preguntas definidas por el usuario, con tres formatos de salida: elección entre opciones (`choice`), puntuación (`score`) y sí/no (`noul`).

El modelo resuelve un problema muy concreto en el ecosistema bengalí: clasificar y enrutar texto (intenciones de asistente de voz, sector de una queja ciudadana, discurso de odio, sentimiento, tópico) con un coste de inferencia bajo y sin depender de un LLM generativo. Se entrenó sobre 38.766 filas de entrenamiento y 2.597 de validación procedentes de seis conjuntos de datos públicos en bengalí, y se distribuye en tres formatos: PyTorch, ONNX fp32 y ONNX int8.

Su relevancia actual es práctica: aplica LoRA (rango 16) en lugar de un ajuste completo, lo que reduce los parámetros entrenables de 125 M a 18,3 M y, según el autor, preserva mucho mejor el razonamiento sí/no del modelo base. En una muestra de 100 elementos por conjunto de datos mantiene la precisión de laya-bangla en las tareas entrenadas (81,0 % frente a 80,3 %) y recupera buena parte de la lógica sí/no en inglés (81,0 % frente a 65,0 %), con versiones ONNX que coinciden al 99,3 % con PyTorch en int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de la familia Laya, con proyecciones `Wqkv`, `Wi` y `Wo` y cabeza de decisión tipada; detalles completos de la arquitectura base no disponibles |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX int8 (640 MB); pesos PyTorch en el formato del repositorio (644 MB); ONNX fp32 (1,3 GB). No se ofrecen GGUF ni otros formatos |
| Idiomas soportados | bn (bengalí en escritura bangla y banglish romanizado), en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PyTorch) y ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya-multilingual` en el commit `e4e9ddf21a7b1903b7acffd8814ad4307bf63a67`, el mismo que usa laya-bangla. Sobre esa base se aplicó LoRA de rango 16, alpha 32 y dropout 0,05 en todas las proyecciones de atención y MLP del encoder (`Wqkv`, `Wi`, `Wo`), además de entrenar por completo la cabeza de decisión; los embeddings de tokens quedaron congelados. Esto supone 18,3 M de parámetros entrenables frente a los 125 M del ajuste completo. Tras el entrenamiento, los adaptadores se fusionaron en los pesos, de modo que el resultado es un checkpoint Laya convencional.

Los datos son los mismos que los de laya-bangla: 38.766 filas de entrenamiento y 2.597 de validación extraídas de seis conjuntos públicos en bengalí (MASSIVE, SIB-200, BanglaPSG, BanTH, BanHate y Bangla Sentiments in eLearning). El entrenamiento usó 3 épocas, tasa de aprendizaje de 2e-4 para los adaptadores y 1e-4 para la cabeza, decaimiento coseno, lote de 64, suavizado de etiquetas de 0,05, barajado de las opciones de elección en cada época y semilla 20261018. Se conservó la época 2 (menor pérdida de validación) y después se ajustó una temperatura por tipo de pregunta sobre el conjunto de validación: 0,855 para `choice`, 0,999 para `score` y 0,960 para sí/no. El entrenamiento se hizo en una GPU NVIDIA GeForce RTX, aunque el modelo card se corta en ese punto y no especifica el modelo exacto.

## Capacidades

- Clasificación de texto con salida tipada en tres modalidades: elección entre opciones (`choice`), puntuación (`score`) y respuesta sí/no (`noul`).
- Enrutamiento de intenciones para asistentes de voz, incluyendo flujos de dos pasos (77,0 % en la muestra de MASSIVE).
- Clasificación de quejas ciudadanas por sector de servicio: agua, electricidad, residuos y otros (96,0 % en la muestra).
- Detección de discurso de odio tanto en escritura bangla (79,5 %) como en banglish romanizado (81,5 %).
- Análisis de sentimiento en comentarios de cursos en plataformas de e-learning (80,5 %).
- Clasificación de tópicos y categorización general de texto (SIB-200, MASSIVE).
- Razonamiento sí/no sobre el contenido de un texto con preguntas definidas por el usuario, capacidad que el ajuste completo pierde y esta versión LoRA conserva en buena medida (63,5 % en IndicXNLI frente al 53,0 % de laya-bangla).
- Funcionamiento bilingüe: acepta textos e instrucciones tanto en bengalí como en inglés (76,5 % de media en seis conjuntos en inglés).
- No soporta tool calling, uso de agentes, visión, audio ni modo de razonamiento extendido; es un clasificador, no un modelo generativo.

## Casos de uso

- Triaje de quejas ciudadanas: el modelo recibe el texto libre de un ciudadano y devuelve el sector de servicio y la urgencia en una sola llamada, con dos preguntas tipadas. Con un 96,0 % en la muestra de sector es adecuado para preclasificar antes de la revisión humana.
- Enrutamiento en asistentes de voz en bengalí: encadena dos decisiones (dominio y acción) para dirigir la petición al servicio correcto; su 77,0 % en el flujo de dos pasos lo hace viable como primera etapa de un pipeline con verificación posterior.
- Moderación de comunidades: clasifica comentarios como odio o no odio en bangla y en banglish, lo que cubre el caso frecuente del bengalí escrito con caracteres latinos, que muchos filtros entrenados solo en escritura nativa no detectan.
- Analítica de feedback educativo: etiqueta automáticamente el sentimiento de los comentarios de curso en plataformas de e-learning para generar informes agregados por asignatura o docente.
- Filtro previo a un LLM mayor: al resolver la decisión con 322 M de parámetros, puede descartar o etiquetar el 80-90 % del tráfico y reservar el modelo generativo (mucho más caro) solo para los casos ambiguos.
- Clasificación en el navegador: la versión ONNX int8 (640 MB) permite ejecutar el modelo en cliente sin enviar el texto a un servidor, algo relevante para contenido sensible como denuncias o mensajes de moderación.
- Preguntas sí/no personalizadas sobre documentos: definir criterios como "¿menciona una fecha límite?" o "¿es una pregunta?" y aplicar el modelo a lotes de texto, aprovechando que esta versión conserva mejor el razonamiento booleano del modelo base.
- Etiquetado a gran escala para investigación: procesar corpus en bengalí en CPU con las versiones ONNX y obtener etiquetas consistentes sin coste de GPU.

## Benchmarks y rendimiento

Conjunto de validación (2.597 filas, usado para elegir época y calibrar):

| Modelo | Accuracy | NLL (menor es mejor) |
|---|---:|---:|
| laya-bangla (ajuste completo) | 81,6 % | 0,447 |
| laya-bangla-lora | 81,2 % | 0,460 |

Muestra de test (primeros 100 elementos de cada conjunto, con la pregunta formulada en bengalí y en inglés, los tres modelos sobre la misma CPU; media de ambas formulaciones):

| Tarea | Modelo base | laya-bangla | laya-bangla-lora |
|---|---:|---:|---:|
| Bengalí, tareas entrenadas (1.956 decisiones) | 48,3 % | 80,3 % | **81,0 %** |
| Sector de servicio en quejas | 55,5 % | 93,0 % | **96,0 %** |
| Enrutamiento de asistente de voz, dos pasos | 25,0 % | **80,5 %** | 77,0 % |
| Discurso de odio (escritura bangla) | 9,0 % | 73,0 % | **79,5 %** |
| Discurso de odio (banglish) | 55,0 % | 78,0 % | **81,5 %** |
| Sentimiento de comentarios de curso | 47,0 % | **83,0 %** | 80,5 % |
| Bengalí, conjuntos nunca entrenados | 41,2 % | 54,5 % | **55,0 %** |
| Lógica de frases sí/no (IndicXNLI) | **70,0 %** | 53,0 % | 63,5 % |
| Inglés, seis conjuntos (1.356 decisiones) | 63,3 % | 74,3 % | **76,5 %** |
| Lógica sí/no (XNLI inglés) | **82,0 %** | 65,0 % | 81,0 % |

El propio autor advierte que, con 100 elementos por conjunto, las diferencias de pocos puntos están dentro del ruido. El hallazgo robusto es la fila de lógica sí/no: laya-bangla pierde unos 17 puntos respectoa la base y laya-bangla-lora solo 1 punto en inglés y 7 en bengalí. La concordancia de las exportaciones ONNX con PyTorch sobre 1.284 decisiones de test es del 100 % en fp32 y del 99,3 % en int8, con la misma accuracy.

## Requisitos de hardware

- Tamano de pesos: 644 MB en PyTorch, 1,3 GB en ONNX fp32 y 640 MB en ONNX int8.
- VRAM estimada para inferencia: entorno a 0,7-1,5 GB en fp16/fp32 y menos de 1 GB en int8, incluyendo activaciones y overhead del runtime (estimacion, no publicada por el autor).
- Cabe en cualquier GPU de consumo con 2 GB o más de VRAM; tambien funciona en CPU, y de hecho el autor reporta las comparativas ejecutadas en CPU.
- GPU recomendadas: no especificadas. El autor solo menciona "una NVIDIA GeForce RTX" para el entrenamiento. Para servir lotes grandes, cualquier GPU moderna (L4, A10, A100, H100) con ONNX Runtime o PyTorch es sobredimensionada para 322 M de parametros.
- Opciones de despliegue: libreria `laya` 0.4.11 (PyTorch), ONNX Runtime para fp32 en servidor y para int8 en navegador y Node.js, API HTTP y Docker (descritos en la model card del modelo principal). vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo generativo con decodificacion de tokens.
- Latencia y throughput: no disponibles. El unico dato indirecto es que las evaluaciones se hicieron en CPU, lo que sugiere latencias de decenas de milisegundos por decision en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (muestra) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-bangla-lora | 321,9 M | no disponible | 81,0 % en tareas entrenadas; 63,5 % en IndicXNLI | apache-2.0 | PyTorch, ONNX fp32, ONNX int8 |
| laya-bangla (mismo autor) | 321,9 M | no disponible | 80,3 % en tareas entrenadas; 53,0 % en IndicXNLI | apache-2.0 | PyTorch y ONNX |
| laya-multilingual (modelo base) | no disponible | no disponible | 48,3 % en tareas entrenadas; 70,0 % en IndicXNLI | no disponible en la informacion | HuggingFace |
| Otros clasificadores en bengali (BanglaBERT y familia) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es interna a la familia: laya-bangla-lora iguala o supera ligeramente al ajuste completo en las tareas entrenadas y en deteccion de odio, cede 3,5 puntos en enrutamiento de dos pasos y 2,5 en sentimiento, y recupera entre 10 y 16 puntos de razonamiento booleano. Frente al modelo base, la ganancia en tareas especificas es de 30 a 70 puntos, a costa de degradar la logica sí/no en bengali (70,0 % a 63,5 %). No se dispone de datos publicados que permitan comparar con clasificadores bengalies de otras familias.

## Limitaciones y advertencias

- Las cifras de test provienen de 100 elementos por conjunto de datos; diferencias de pocos puntos porcentuales no son estadisticamente significativas.
- El modelo sigue perdiendo 6,5 puntos de razonamiento sí/no en bengali frente al modelo base (63,5 % frente a 70,0 %), por lo que no conviene usarlo como resolutor logico general.
- Solo cubre bengalí (bangla y banglish) e ingles; cualquier otro idioma queda fuera de su distribucion de entrenamiento.
- No se ha publicado la longitud maxima de contexto ni el comportamiento con entradas largas; para documentos extensos habra que trocear y agregar decisiones.
- El modelo se entreno con conjuntos que incluyen discurso de odio y quejas reales; puede heredar sesgos de anotacion de esas fuentes, especialmente en la frontera entre critica legitima y odio.
- Al ser un clasificador con cabeza de decision y calibracion de temperatura, la salida es una distribucion sobre las opciones dadas. No "alucina" texto, pero si puede asignar alta confianza a una opcion incorrecta cuando la pregunta esta mal formulada o las opciones se solapan.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 18 de octubre de 2026; carece de validacion independiente por parte de la comunidad.
- La licencia del modelo es apache-2.0, pero las licencias de los seis conjuntos de datos de entrenamiento (MASSIVE, SIB-200, BanglaPSG, BanTH, BanHate, Bangla Sentiments in eLearning) deben verificarse por separado antes de un uso comercial.
- La model card se corta en la descripcion del hardware de entrenamiento ("one NVIDIA GeForce RT"), por lo que no se puede confirmar la GPU utilizada.
- Para produccion conviene fijar la revision (`revision="v1"`) y validar la concordancia entre PyTorch y ONNX en el dominio propio, dado que int8 difiere en un 0,7 % de las decisiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/algolyzer/laya-bangla-lora
- Modelo principal (ajuste completo): https://huggingface.co/algolyzer/laya-bangla
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Demo interactiva (playground): https://huggingface.co/spaces/algolyzer/laya-bangla-playground
- Coleccion con todas las versiones: https://huggingface.co/collections/algolyzer/laya-bangla-6ad51a88c6ea46c7f5cf9180
- Codigo fuente: https://github.com/shamspias/laya-bangla
- Resultados de test completos y siguientes pasos: https://github.com/shamspias/laya-bangla/blob/main/docs/next-steps.md
- Mencion en listado de tendencias (solo referencia, sin datos tecnicos): https://chaosaiagent.com/industry-data/ai-trends
