# jessengatai/supracut-face-embedding

## Resumen

FaceEmbedding (Core ML) para Supra Cut es una conversión a Core ML del modelo de identidad facial InceptionResnetV1 de [timesler/facenet-pytorch](https://github.com/timesler/facenet-pytorch), con pesos entrenados sobre VGGFace2. No es un modelo nuevo ni reentrenado: es un artefacto de despliegue que empaqueta la red original en formato `.mlmodelc` compilado para macOS, de forma que el editor de vídeo Supra Cut pueda ejecutarlo de forma nativa en Apple Silicon.

El modelo resuelve un problema muy concreto dentro de un pipeline de seguimiento de personas: convertir un recorte de rostro en un vector de 512 dimensiones (embedding) que actúa como huella de identidad. Con esa huella, el tracker puede decidir si una cara que vuelve a entrar en plano pertenece a la misma persona que estaba siguiendo, en lugar de reiniciar la asociación por simple proximidad espacial.

Su relevancia práctica es acotada pero clara: demuestra el patrón de llevar un backbone clásico de reconocimiento facial (FaceNet, CVPR 2015) a inferencia local en el dispositivo, sin servicio remoto, con verificación de integridad por SHA-256 y una fidelidad numérica declarada de 0,99999 de similitud coseno frente a la implementación PyTorch de referencia. El repo es pequeño (0,1 GB) y la licencia es MIT, lo que facilita su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Inception-ResNet-v1 (InceptionResnetV1), backbone de FaceNet con conexiones residuales |
| Parametros totales | no disponible (no declarado en la model card) |
| Longitud de contexto | no aplica (modelo de vision, no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un artefacto Core ML ya compilado; no se documenta precision ni cuantizacion) |
| Idiomas soportados | no aplica (procesa imagenes, no texto) |
| Licencia | MIT |
| Formato de pesos | `.mlmodelc` compilado, empaquetado en `FaceEmbedding.mlmodelc.zip` (Core ML); pesos PyTorch originales en facenet-pytorch |
| Dimension del embedding de salida | 512 numeros por rostro |
| Tamano del repo | 0,1 GB |
| Entrada esperada | recorte de rostro (face crop) proporcionado por el pipeline del usuario |
| Integridad | SHA-256 `fe8861d7a8505969f59ef4aa6a9fc79dcfdcbe5180c75e343c58fbbea9960d65` |

## Arquitectura y entrenamiento

La red es InceptionResnetV1, la variante de Inception-ResNet combinada con el esquema de triplet loss de FaceNet (Schroff, Kalenichenko y Philbin, CVPR 2015). Se trata de una CNN con bloques Inception y conexiones residuales que produce una representacion compacta de 512 dimensiones; la identidad se compara despues por distancia (tipicamente coseno o euclidea) en el espacio de embeddings, no por clasificacion directa. El modelo original procede de `davidsandberg/facenet` y fue reempaquetado en PyTorch por `timesler/facenet-pytorch`.

Los pesos fueron entrenados sobre VGGFace2 (Cao et al., 2018). En esta ficha no hay informacion sobre el numero de tokens ni sobre el proceso de optimizacion (no aplica RLHF/DPO, al no ser un modelo generativo de lenguaje); tampoco se documenta el detalle del dataset mas alla de su nombre. La conversion a Core ML no implico reentrenamiento ni modificacion de pesos: segun el autor, la salida del modelo convertido coincide con la del PyTorch original a 0,99999 de similitud coseno. El autor indica ademas que su repositorio privado `supracut-models` lista este modelo pero no conserva el script de conversion, lo que limita la reproducibilidad del artefacto.

## Capacidades

- Extraccion de caracteristicas faciales: transforma un recorte de rostro en un vector de 512 dimensiones utilizable como huella de identidad.
- Verificacion 1:1 (misma persona / distinta persona) mediante umbral sobre similitud coseno o distancia euclidea.
- Re-identificacion en seguimiento de video: permite reasociar un rostro que reaparece en el plano con la persona previamente seguida.
- Agrupacion y clustering de caras por similitud de embedding (agrupacion de footage, bibliotecas de fotos).
- Inferencia local en macOS: ejecucion nativa via Core ML, sin depender de un servicio remoto.
- Sin deteccion ni alineacion facial integradas: el modelo asume que recibe un crop ya localizado; la deteccion (por ejemplo MTCNN de facenet-pytorch) y la alineacion deben resolverlas el pipeline anfitrion.
- No soporta tool calling, agentes, generacion de texto, razonamiento multi-paso, vision general ni audio: es exclusivamente un extractor de caracteristicas faciales.

## Casos de uso

- Seguimiento de personas en edicion de video: dentro de Supra Cut, el tracker extrae el embedding del rostro seguido y lo compara con los candidatos de cada frame; si la similitud supera el umbral, mantiene la identidad aunque la persona salga y vuelva a entrar en cuadro, evitando saltos de seguimiento.
- Agrupacion automatica de footage por persona: procesar todos los recortes faciales de un proyecto y agrupar por distancia de embedding para generar colecciones ("todas las tomas de este actor") sin etiquetado manual.
- Etiquetado y busqueda en bibliotecas de fotos o archivos audiovisuales: indexar embeddings en una base vectorial y permitir consultas del tipo "encuentra planos de esta persona" a partir de una imagen de referencia.
- Verificacion de identidad en aplicaciones macOS: comparar el embedding de una captura en vivo con el de una foto de referencia almacenada, con toda la inferencia en el dispositivo y sin enviar imagenes a un servidor.
- Anonimizacion selectiva en postproduccion: dado un embedding objetivo, detectar los planos en los que aparece una persona concreta y aplicar desenfoque o sustitucion, reduciendo la revision manual.
- Prellenado de metadatos en herramientas de edicion: asignar automaticamente nombres de persona a clips basandose en la similitud con embeddings ya etiquetados, acelerando la organizacion de proyectos largos.
- Control de acceso o asistencia en entornos Apple: verificacion 1:1 contra un roster de embeddings registrados, aprovechando la aceleracion por Neural Engine en equipos Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada por el autor es la fidelidad de la conversion: similitud coseno de 0,99999 entre la salida del modelo Core ML y la del InceptionResnetV1 en PyTorch. No hay datos de precision de verificacion (accuracy, TAR/FAR), ni de rendimiento sobre LFW, VGGFace2 u otros conjuntos de evaluacion, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM/espacio: el repositorio completo ocupa 0,1 GB, por lo que el artefacto compilado es muy ligero y cabe holgadamente en cualquier GPU integrada o memoria unificada de un Mac moderno. El numero exacto de parametros y el peso del `.mlmodelc` descomprimido no estan documentados.
- Plataforma: exclusivamente macOS con soporte Core ML; el modelo no se distribuye en formato PyTorch, GGUF ni safetensors en este repositorio.
- Aceleracion: Core ML puede despachar a CPU, GPU y Neural Engine (ANE) en Apple Silicon; en Macs Intel se ejecutaria en CPU/GPU segun disponibilidad.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este artefacto; para esos entornos habria que usar los pesos PyTorch originales de `timesler/facenet-pytorch` con PyTorch o exportar a ONNX/TensorRT por cuenta propia.
- Consumer GPU: si, en la practica cualquier Mac Apple Silicon (M1 o posterior) es suficiente para un modelo de este tamano; en el ecosistema NVIDIA bastaria una GPU de gama baja, pero requeriria otra ruta de despliegue.
- Opciones de despliegue: Core ML / Vision framework en macOS o iOS; alternativas no incluidas en este repo: PyTorch, TorchScript, ONNX Runtime, o `llama.cpp`/Ollama no aplican (no es un LLM).
- Latencia y throughput: no disponibles. Al ser una CNN pequena ejecutada en el dispositivo, se espera latencia de milisegundos por rostro en Apple Silicon, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jessengatai/supracut-face-embedding | no disponible | imagen de rostro (crop) | embedding de 512 d, Core ML | MIT | HuggingFace, solo `.mlmodelc` |
| timesler/facenet-pytorch (InceptionResnetV1 VGGFace2) | no disponible en la informacion | imagen de rostro | embedding de 512 d, PyTorch | MIT | GitHub, ampliamente usado |
| davidsandberg/facenet (original) | no disponible en la informacion | imagen de rostro alineada (160x160) | embedding de 128/512 d segun variante | MIT | GitHub, pesos TensorFlow |
| Alternativas tipo ArcFace / InsightFace | no disponible en la informacion | imagen de rostro | embedding (dimension variable) | habitualmente MIT o research-only segun modelo | no verificado en esta busqueda |

La comparacion cuantitativa de precision entre estas alternativas no puede establecerse con los datos disponibles: este repositorio no publica evaluacion propia y se limita a replicar el comportamiento numerico del modelo PyTorch de origen.

## Limitaciones y advertencias

- No incluye deteccion ni alineacion facial: si el crop de entrada no esta centrado y normalizado como espera el backbone, la calidad del embedding cae sin aviso.
- Ausencia total de metricas de validacion publicadas: no hay accuracy, TAR/FAR ni evaluacion por subgrupos, lo que impide estimar el umbral adecuado para produccion sin unacalibrar por cuenta propia.
- Sesgos heredados de VGGFace2: el conjunto de entrenamiento tiene una distribucion demografica desigual, por lo que el rendimiento puede degradarse en rostros de grupos subrepresentados, en edades extremas, con oclusiones o con iluminacion adversa. No se documenta ningun analisis de equidad.
- Riesgo de falsos positivos en re-identificacion: la similitud de embeddings entre personas distintas puede superar umbrales laxos; en un editor de video esto se traduce en asociaciones erroneas del tracker.
- Ambito de plataforma restringido: el artefacto es Core ML compilado para macOS; no es portable a Linux o Windows sin reconvertir desde PyTorch.
- Reproducibilidad limitada: el autor declara que no conserva el script de conversion, por lo que el binario solo puede validarse por hash SHA-256.
- Restricciones de licencia: MIT permite uso comercial, pero la notice de copyright original de facenet-pytorch debe conservarse; el modelo deriva ademas de pesos de FaceNet y VGGFace2, cuyos terminos conviene revisar en sus repositorios de origen.
- No apto para vigilancia masiva ni identificacion encubierta: al tratarse de biometria facial, su uso esta sujeto a RGPD y a la normativa europea de IA, con requisitos de base juridica y evaluacion de impacto.
- El modelo no genera texto ni razona: cualquier expectativa de uso como LLM o VLM es inaplicable.
- Fecha de creacion del repositorio anomala (2026-10-28 segun los metadatos de HuggingFace) y cero descargas o likes: no hay evidencia de uso en produccion ni de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jessengatai/supracut-face-embedding
- facenet-pytorch (InceptionResnetV1, pesos VGGFace2): https://github.com/timesler/facenet-pytorch
- davidsandberg/facenet (implementacion y pesos originales): https://github.com/davidsandberg/facenet
- Paper FaceNet (Schroff et al., CVPR 2015): https://arxiv.org/abs/1503.03832
- Paper VGGFace2 (Cao et al., 2018): https://arxiv.org/abs/1710.08092
- Documentacion de Core ML (Apple): https://developer.apple.com/documentation/coreml
