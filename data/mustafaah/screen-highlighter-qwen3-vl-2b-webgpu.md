# mustafaah/screen-highlighter-qwen3-vl-2b-webgpu

## Resumen

Screen Highlighter es un modelo multimodal de tipo image-text-to-text obtenido a partir de Qwen3-VL-2B mediante un ajuste supervisado (SFT) orientado exclusivamente a resaltado de pantalla y una actualización final de aprendizaje por refuerzo (RL, update-200). El autor, mustafaah, publica en este repositorio una conversión FP16 a ONNX del modelo fusionado, empaquetada específicamente para su ejecución en el navegador mediante Transformers.js 4.2.0 con backend WebGPU.

El modelo no es un Qwen3-VL-2B base sin entrenar: incorpora pesos ajustados para producir una única respuesta JSON de resaltado, con coordenadas normalizadas en el rango 0–1000 y un límite de 1024 tokens de salida. La entrada de imagen se restringe a entre 256 y 1024 tokens, y el autor indica que debe emplearse el preprocesado de normalización y el resizer bicúbico antialiasado incluidos en la aplicación acompañante, junto con el system prompt proporcionado.

Su relevancia actual radica en que ejemplifica el traslado de un modelo visión-lenguaje ajustado con RL a inferencia 100 % local en el navegador, sin llamadas a servidores. El autor advierte de que la ejecución real en WebGPU permanece sin verificar (la instancia local de Chrome no expuso adaptador GPU) y que las comprobaciones realizadas no constituyen una evaluación agregada de precisión. Los scripts de origen y conversión están publicados en el repositorio de GitHub ScreenHighlighter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje Qwen3-VL, con ramas DeepStack restauradas y MRoPE intercalado de Qwen3-VL |
| Parametros totales | Aproximadamente 2 000 millones (2B), segun la denominacion Qwen3-VL-2B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la entrada de imagen se limita a 256-1024 tokens y la salida a 1024 tokens |
| Tipos de cuantizacion | FP16 (exportacion oficial). El autor descarta exportaciones 4-bit all-linear y 4-bit solo-MLP por regresion en las pruebas de navegacion y semantica |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (FP16); datos externos del decoder divididos en ficheros de como maximo 1,5 GiB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3-VL-2B, un transformer multimodal de ~2 000 millones de parametros que combina un codificador de vision con un decoder de lenguaje autorregresivo. El autor documenta que la conversion ONNX requirio restaurar tres ramas DeepStack, el MRoPE intercalado propio de Qwen3-VL y una normalizacion explicita de imagen. Los 112 tensores de proyeccion adaptados se verificaron contra los pesos fusionados guardados, y los tensores de vision congelados se comprobaron contra el checkpoint. La procedencia registra el modelo base exacto, el hash del adaptador y la revision de la plantilla de grafo.

En cuanto al entrenamiento, el modelo parte de un ajuste supervisado (SFT) especializado en resaltado y una actualizacion final de RL (update-200), segun indica la propia model card; no se especifican el numero de tokens de entrenamiento, la composicion del dataset ni el algoritmo de RL empleado. El autor senala que las exportaciones 4-bit ingenuas (all-linear y solo-MLP) degradaron en las pruebas de navegacion y semantica, por lo que se excluyeron deliberadamente; esta exportacion FP16 se presenta como linea base de fidelidad para futuras cuantizaciones calibradas, no como una solucion definitiva al problema de la conversion a 4-bit.

## Capacidades

- Generacion de resaltados de pantalla: produce una unica respuesta JSON de resaltado con coordenadas normalizadas en el rango 0-1000, con salida codiciosa (greedy) limitada a 1024 tokens.
- Comprension de imagen-texto: procesamiento conjunto de capturas de pantalla e instrucciones textuales, con entrada de imagen limitada a 256-1024 tokens.
- Ejecucion local en navegador: inferencia integra tras la descarga, sin llamadas a servidor, mediante Transformers.js 4.2.0 con device `webgpu` y dtype `fp16`.
- Compatibilidad con WebGPU y `shader-f16`: requiere soporte de shader-f16 y varios GB de memoria de GPU.
- Formato de salida estructurado: respuesta JSON de un solo resaltado, con sistema de coordenadas 0-1000.
- Capacidad conversacional: el pipeline declarado incluye la etiqueta `conversational`, aunque la funcion entrenada se limita al resaltado.
- Tool calling, agentes multi-paso, capacidades multilingues, vision/audio adicionales o modo de razonamiento explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Resaltado de elementos en capturas de pantalla: el modelo recibe una captura y una instruccion textual y devuelve un JSON con las coordenadas 0-1000 del elemento a resaltar, lo que permite construir herramientas de anotacion automatica sobre imagenes.
- Asistentes de interfaz integrados en el navegador: al ejecutarse con Transformers.js y WebGPU tras una descarga de aproximadamente 4,9 GB, puede ofrecer resaltado guiado sin enviar la captura a ningun servidor, lo que resulta adecuado para entornos con requisitos de privacidad.
- Demostraciones educativas de VLM en el navegador: sirve como ejemplo reproducible de conversion ONNX FP16 de un modelo Qwen3-VL ajustado, con scripts de conversion publicados en GitHub.
- Automatizacion de tutoriales y documentacion: dado un pantallazo de una aplicacion y una instruccion del tipo "resalta el boton de guardar", genera la coordenada correspondiente para incrustarla en guias paso a paso.
- Pruebas de accesibilidad y QA visual: permite localizar de forma automatica elementos concretos de una interfaz a partir de descripciones en lenguaje natural, como apoyo a revisiones de usabilidad.
- Linea base para investigacion en cuantizacion: al ser la exportacion FP16 de referencia, sirve para medir la degradacion de futuras conversiones calibradas a 4-bit sobre las mismas pruebas de navegacion y semantica.
- Prototipado de agentes de navegacion web: el resaltado por coordenadas puede alimentar a un agente que necesite senalar o localizar objetivos en la pantalla antes de interactuar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que se completaron comprobaciones de procesador, vision y codificacion posicional, ademas de pruebas nativas de generacion en CUDA, pero el autor subraya expresamente que esas pocas pruebas no constituyen una evaluacion agregada de precision. La ejecucion real en WebGPU en navegador permanece sin verificar porque la instancia local de Chrome no expuso adaptador GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: varios GB de memoria de GPU para la exportacion FP16; la compatibilidad con 6 GB no ha sido establecida por el autor.
- Descarga: aproximadamente 4,9 GB; el repositorio completo ocupa 8,3 GB.
- GPU recomendadas: no disponibles de forma explicita; se requiere una GPU que exponga adaptador WebGPU y soporte de `shader-f16`.
- Compatibilidad con GPU de consumo: no confirmada; el autor indica que la compatibilidad con 6 GB no esta establecida y que la ejecucion en WebGPU no se ha verificado.
- Opciones de despliegue: Transformers.js 4.2.0 con device `webgpu` y dtype `fp16` para `embed_tokens`, `vision_encoder` y `decoder_model_merged`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta exportacion.
- Latencia y throughput: no disponibles.
- Nota de memoria: los datos externos del decoder se dividen en ficheros de como maximo 1,5 GiB, cambio que afecta solo al almacenamiento y no a las operaciones del grafo ni a los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Screen Highlighter (este modelo) | ~2B | Entrada de imagen 256-1024 tokens; salida 1024 tokens | Resaltado de pantalla (image-text-to-text), salida JSON | Apache-2.0 | ONNX FP16 para Transformers.js/WebGPU |
| mustafaah/screen-highlighter-qwen3-vl-2b-rl-merged (modelo padre) | ~2B | No disponible | Resaltado de pantalla (SFT + RL fusionado) | No disponible | Pesos originales fusionados |
| Qwen3-VL-2B (base) | ~2B | No disponible | Vision-lenguaje general | No disponible | Pesos originales del modelo base |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada. La comparativa se limita a la relacion de procedencia (modelo base y modelo fusionado del que deriva esta exportacion).

## Limitaciones y advertencias

- Ejecucion en navegador no verificada: la model card indica que la ejecucion real en WebGPU queda sin comprobar porque la instancia local de Chrome no expuso adaptador GPU.
- Sin evaluacion agregada de precision: las comprobaciones realizadas (procesador, vision, codificacion posicional y pruebas de generacion en CUDA) no constituyen una evaluacion de precision global.
- Dependencia del preprocesado: el autor exige usar la normalizacion explicita, el resizer bicubico antialiasado y el system prompt incluidos en la aplicacion acompanante; alterarlos puede degradar los resultados.
- Salida restringida: se genera una unica respuesta JSON de resaltado, codiciosa, con un maximo de 1024 tokens y coordenadas en el rango 0-1000; no es un modelo de proposito general.
- Limitaciones de imagen: la entrada debe mantenerse entre 256 y 1024 tokens.
- Cuantizacion a 4-bit no resuelta: las exportaciones 4-bit all-linear y solo-MLP regresaron en las pruebas de navegacion y semantica y se excluyeron; la FP16 es la linea base de fidelidad, no una garantia de que la cuantizacion este resuelta.
- Requisitos de hardware no acotados: se necesita soporte de `shader-f16` y varios GB de GPU; la compatibilidad con 6 GB no esta establecida.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- Datos de entrenamiento: no se especifican el volumen de tokens, la composicion del dataset ni el algoritmo de RL empleado, lo que dificulta evaluar sesgos conocidos.
- Licencia: Apache-2.0, lo que en principio permite uso comercial; no obstante, deben verificarse las condiciones del modelo base Qwen3-VL-2B y del modelo fusionado del que deriva.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mustafaah/screen-highlighter-qwen3-vl-2b-webgpu
- Modelo base declarado: https://huggingface.co/mustafaah/screen-highlighter-qwen3-vl-2b-rl-merged
- Repositorio de codigo y scripts de conversion (ScreenHighlighter): https://github.com/MustafaAH10/screen-highlighter
