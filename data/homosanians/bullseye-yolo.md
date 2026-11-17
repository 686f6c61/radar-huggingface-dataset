# Homosanians/bullseye-yolo

## Resumen

Bullseye-yolo es un repositorio de exportaciones ONNX de detectores de objetos de la familia Ultralytics YOLO. En concreto, el autor (Homosanians) publica tres ficheros: YOLO26n y YOLO26s en su variante "end to end", y YOLO11n. No se trata de un modelo entrenado desde cero por el autor, sino de una conversión a formato ONNX de pesos oficiales de Ultralytics para su uso en inferencia con runtimes compatibles con ONNX Runtime.

El interés del repositorio es practico: ofrece artefactos listos para desplegar en entornos donde no se quiere depender del paquete Python de Ultralytics, con hashes SHA-256 publicados para verificar la integridad de cada fichero. Los modelos cubren el segmento de deteccion de objetos en tiempo real de gama ligera (variantes "n" y "s", es decir, nano y small).

La relevancia es limitada pero concreta: quien necesite un detector YOLO en formato ONNX para integracion en C++, Rust, Java o en pipelines de inferencia acelerada por hardware encontrara aqui los binarios y sus verificaciones. El repositorio no incluye model card detallada sobre entrenamiento, datos o rendimiento, y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO (Ultralytics YOLO26n, YOLO26s end-to-end y YOLO11n), red neuronal convolucional para deteccion de objetos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (los ficheros publicados son ONNX; no se especifica precision, aunque por convencion en exportaciones Ultralytics suele ser FP32 o FP16, dato no confirmado) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 (o licencia Enterprise de Ultralytics) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Los tres modelos son detectores de objetos basados en la arquitectura YOLO de Ultralytics. YOLO26n y YOLO26s se exportan en modo "end to end", lo que implica que el grafo ONNX incluye el post-procesado de las detecciones (eliminacion de duplicados tipo NMS integrada en el modelo), simplificando la integracion en produccion. YOLO11n es la variante nano de la generacion YOLO11.

No se dispone de informacion en la model card sobre el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens o imagenes vistas, ni sobre el uso de tecnicas de alineacion o aumentado especificas. El autor solo documenta que son exportaciones de pesos Ultralytics y proporciona los hashes SHA-256 de cada fichero para verificar su integridad. No se detalla el proceso de exportacion (version de Ultralytics, opset ONNX, precision numerica).

## Capacidades

- Deteccion de objetos en imagenes: localizacion y clasificacion de objetos con cajas delimitadoras, segun las clases del dataset COCO (comportamiento estandar de los pesos Ultralytics, no confirmado explicitamente en la model card).
- Inferencia via ONNX Runtime u otros runtimes compatibles con ONNX, sin necesidad del paquete Python de Ultralytics.
- Modelos "end to end" (YOLO26n y YOLO26s) que integran el post-procesado en el grafo, reduciendo la logica de pre/post-procesado en el cliente.
- Variante nano (YOLO11n, YOLO26n) orientada a dispositivos con recursos limitados y baja latencia.
- Variante small (YOLO26s) para mayor precision a costa de mas computo.
- No se documentan capacidades de segmentacion, pose, clasificacion, tool calling, agentes ni procesamiento de lenguaje o audio.

## Casos de uso

- Deteccion de objetos en tiempo real en dispositivos edge: los modelos nano (YOLO11n, YOLO26n) se pueden ejecutar en CPU o aceleradores ligeros mediante ONNX Runtime, adecuados para vigilancia, conteo de personas o control de aforo en dispositivos de bajo consumo.
- Integracion en aplicaciones nativas no Python: al estar en ONNX, el modelo se puede cargar desde C++, C#, Rust o Java con las APIs de ONNX Runtime, evitando dependencias del ecosistema Python en produccion.
- Pipelines de vision por computador en servidores sin GPU dedicada: las variantes nano permiten inferencia en CPU con latencia aceptable para procesamiento por lotes de imagenes.
- Verificacion de integridad en despliegues: los hashes SHA-256 publicados permiten validar los ficheros descargados antes de incorporarlos a un contenedor o artefacto de despliegue.
- Prototipado rapido de sistemas de deteccion: al ser artefactos ONNX listos para usar, permiten montar una demo de deteccion sin entrenar ni exportar nada.
- Preprocesado para sistemas de analitica de video: deteccion de objetos como primer paso de un pipeline (por ejemplo, recorte de regiones de interes para un clasificador posterior), usando la variante small cuando se requiere mas precision.
- Automatizacion industrial ligera: deteccion de piezas o elementos en lineas de inspeccion con modelos nano desplegados en hardware embebido compatible con ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. No se especifican parametros ni precision de los ficheros ONNX, por lo que no se puede calcular con rigor. El tamano total del repositorio es de 0,1 GB para los tres ficheros, lo que sugiere modelos pequenos (coherente con variantes nano y small).
- GPU recomendadas: no disponible en la informacion proporcionada. Por el perfil de los modelos (nano/small), son candidatos a ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, y en GPUs de datacenter (A100, H100) si se necesita throughput alto, pero esto no esta confirmado por el autor.
- Cabe en GPU de consumo: probablemente si, dado el tamano reducido de los ficheros, aunque no se aporta confirmacion ni cifras de VRAM.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), y cualquier runtime compatible con ONNX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bullseye-yolo (este repo) | no disponible | no aplica | no disponible | AGPL-3.0 / Enterprise Ultralytics | ONNX en Hugging Face |
| Ultralytics YOLO11 (pesos oficiales) | no disponible en esta ficha | no aplica | no disponible en esta ficha | AGPL-3.0 / Enterprise Ultralytics | PyTorch y exportaciones oficiales |
| Ultralytics YOLO26 (pesos oficiales) | no disponible en esta ficha | no aplica | no disponible en esta ficha | AGPL-3.0 / Enterprise Ultralytics | PyTorch y exportaciones oficiales |
| Otros detectores ONNX (p. ej. RT-DETR exportado) | no disponible | no aplica | no disponible | variable segun proyecto | Hugging Face / repositorios propios |

La comparativa se limita a senalar que este repositorio redistribuye pesos oficiales de Ultralytics en formato ONNX; no aporta mejoras de rendimiento ni variantes entrenadas por el autor. No se dispone de datos numericos para comparar precision o latencia.

## Limitaciones y advertencias

- No es un modelo original: son exportaciones de pesos Ultralytics. Cualquier limitacion de los modelos YOLO originales (clases COCO, sesgos del dataset de entrenamiento, falsos positivos en escenas no representadas) aplica aqui.
- Licencia AGPL-3.0: el uso comercial en productos propietarios requiere la licencia Enterprise de Ultralytics. Es una restriccion relevante para produccion.
- Ausencia de documentacion tecnica: no se indica el opset ONNX, la precision numerica ni la version de Ultralytics usada en la exportacion, lo que dificulta reproducir el proceso o auditar diferencias con los pesos oficiales.
- Riesgo de deriva respecto a los pesos originales: al no documentarse el pipeline de exportacion, no se puede garantizar que la salida ONNX coincida exactamente con la del modelo PyTorch de referencia.
- Sin datos de benchmarks ni de rendimiento: no se puede evaluar la precision del modelo a partir de la informacion disponible.
- Repositorio sin actividad: cero descargas y cero likes en el momento de la consulta, lo que reduce la evidencia de uso real y de validacion por la comunidad.
- Modelo de vision: no soporta texto, tool calling ni razonamiento multi-paso; no debe presentarse como modelo de lenguaje.
- Verificar los hashes SHA-256 antes de usar los ficheros en produccion, dado que se trata de artefactos binarios de un tercero.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Homosanians/bullseye-yolo
- Licencia de Ultralytics: https://github.com/ultralytics/ultralytics/blob/main/LICENSE
- Repositorio de Ultralytics (referencia de los pesos originales): https://github.com/ultralytics/ultralytics
- ONNX Runtime: https://onnxruntime.ai/
