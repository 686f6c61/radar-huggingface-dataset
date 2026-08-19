# leeyunjai/vapi-od

## Resumen

`leeyunjai/vapi-od` es un repositorio de modelos optimizados para el programa educativo "The Maker", una aplicación de IA para niños diseñada para ejecutarse sin conexión en PCs Windows con capacidades de IA (Windows AI PC). El autor, leeyunjai, ha convertido la mayoría de los modelos al formato OpenVINO IR para lograr una inferencia eficiente en hardware Intel (CPU, iGPU, NPU). El repositorio contiene un conjunto heterogéneo de modelos que cubren visión por computadora, reconocimiento facial, generación de imágenes, comprensión visual-lenguaje, embeddings de texto, OCR, reconocimiento y síntesis de voz. Con un tamaño de 8.7 GB, está pensado para ser descargado e instalado localmente, excluyendo la carpeta `yolo/` que se puede seleccionar por separado. La licencia AGPL-3.0 condiciona su uso en proyectos propietarios. No se proporcionan detalles sobre arquitecturas individuales, parámetros o datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogeneo: YOLO11m para deteccion/pose/segmentacion, modelos de cara (edad/genero/expresion/head pose), GANs (fondo, mejora, profundidad), VLM, embeddings, OCR, STT/TTS. Detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo VLM y de embeddings) |
| Tipos de cuantizacion | no disponible (se indica OpenVINO IR, sin precision especifica) |
| Idiomas soportados | no disponible (el programa es coreano, pero no se especifican idiomas de los modelos) |
| Licencia | AGPL-3.0 |
| Formato de pesos | OpenVINO IR (tambien etiquetado como ONNX) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre el entrenamiento de los modelos individuales. El repositorio es una coleccion de modelos preentrenados convertidos a OpenVINO IR para su ejecucion en dispositivos edge. La unica arquitectura identificada es YOLO11m para tareas de deteccion, pose y segmentacion. Los demas componentes (reconocimiento facial, GANs, VLM, STT/TTS) no tienen detalles de arquitectura ni de datos de entrenamiento. No se menciona ningun proceso de fine-tuning o ajuste adicional por parte del autor.

## Capacidades

- Deteccion de objetos, estimacion de pose y segmentacion de instancias mediante YOLO11m.
- Reconocimiento facial: deteccion de rostros, estimacion de edad y genero, reconocimiento de expresiones y orientacion de la cabeza.
- Generacion de imagenes: eliminacion de fondo, mejora de calidad y estimacion de profundidad mediante modelos GAN.
- Comprension visual-lenguaje (VLM): responde preguntas sobre fotografias.
- Embeddings de frases para busqueda semantica en documentos.
- Reconocimiento optico de caracteres (OCR).
- Reconocimiento de voz (STT) y sintesis de voz (TTS).
- Ejecucion completamente offline en PCs Windows con aceleracion OpenVINO.

## Casos de uso

- Aula sin conexion: el modelo permite ejecutar actividades de IA en ordenadores escolares sin acceso a internet, garantizando la privacidad de los datos de los menores.
- Aprendizaje de vision por computadora: los estudiantes pueden experimentar con deteccion de objetos, pose y segmentacion usando YOLO11m, entendiendo conceptos como bounding boxes y clasificacion.
- Proyectos de robotica educativa: la combinacion de deteccion de objetos y reconocimiento facial permite crear robots que reaccionan a la presencia de personas o a objetos especificos.
- Asistente de voz local: gracias a los modulos STT y TTS, se puede construir un asistente conversacional que funcione sin conexion, ideal para practicar idiomas o crear cuentos interactivos.
- Reconocimiento de emociones: los modelos de expresion facial pueden usarse en actividades de inteligencia emocional, donde el programa detecta el estado animico del nino y adapta la experiencia.
- Busqueda semantica en materiales educativos: los embeddings de frases permiten que los ninos hagan preguntas en lenguaje natural sobre documentos y el sistema recupere las respuestas relevantes de una base local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos minimos de VRAM o GPU en la documentacion publica.
- Al estar optimizado para OpenVINO, se espera que funcione en PCs Windows con CPU Intel, iGPU integrada o NPU (por ejemplo, Intel Core Ultra).
- El repositorio esta disenado para "Windows AI PC", lo que sugiere que aprovecha las capacidades de NPU de estos equipos.
- No hay datos de latencia ni throughput publicados.
- Opciones de despliegue: el programa "The Maker" se instala localmente y carga los modelos desde el repositorio. No se menciona compatibilidad con vLLM, llama.cpp u otros servidores de inferencia.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros conjuntos de modelos educativos o soluciones de IA local para ninos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia AGPL-3.0: cualquier uso comercial o distribucion que modifique el codigo debe liberar el codigo fuente bajo la misma licencia. Esto puede ser restrictivo para integraciones propietarias.
- La documentacion es minima: no se detallan arquitecturas, parametros ni datos de entrenamiento de los modelos individuales, lo que dificulta la evaluacion tecnica.
- Riesgo de alucinacion en el modelo VLM: al responder preguntas sobre imagenes, puede generar respuestas incorrectas o inventadas, especialmente con entradas ambiguas.
- Sesgos desconocidos: al no conocer los datos de entrenamiento, no se pueden evaluar sesgos de genero, raza o edad en los modelos de reconocimiento facial.
- Dependencia del ecosistema OpenVINO: los modelos estan convertidos a este formato, por lo que su uso fuera de entornos Intel puede requerir conversiones adicionales.
- El repositorio tiene 0 descargas y 0 likes en Hugging Face, lo que indica poca adopcion o validacion externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/leeyunjai/vapi-od
- Repositorio de GitHub de "The Maker" (mencionado en la model card): https://github.com/themakerrobot/vapi-od
- Perfil del autor en Hugging Face: https://huggingface.co/leeyunjai
- Perfil del autor en GitHub: https://github.com/leeyunjai
