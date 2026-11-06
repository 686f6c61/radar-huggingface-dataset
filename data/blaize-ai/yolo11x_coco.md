# Blaize-AI/YOLO11x_COCO

## Resumen

YOLO11x_COCO es un modelo de detección de objetos derivado de YOLO11x (variante extra large de Ultralytics), optimizado por Blaize-AI para su despliegue sobre los aceleradores de IA Blaize Xplorer mediante el SDK Picasso. No es un modelo de lenguaje: es un detector de objetos convolucional entrenado sobre el dataset COCO 2017, reempaquetado en formato `.bm` para ejecutarse de forma nativa sobre la arquitectura Graph Streaming Processor (GSP) de Blaize, disenada para inferencia en el borde con bajo consumo y baja latencia.

El repositorio no distribuye los pesos originales de PyTorch ni variantes GGUF/ONNX, sino artefactos compilados para hardware Blaize. La model card documenta dos variantes de compilación (AMP a 416×416 y AMP a 640×640) y describe los esquemas de cuantización disponibles (INT8, BF16 y AMP), aunque solo publica las dos AMP. El repositorio ocupa aproximadamente 0,1 GB.

Su relevancia es acotada y muy específica: sirve a desarrolladores que ya trabajan con el ecosistema Blaize y necesitan un detector COCO listo para desplegar en GSP. Para el resto de casos (GPU convencionales, CPU, otros aceleradores) existen los pesos oficiales de Ultralytics, que son la referencia natural. La licencia AGPL-3.0 del modelo original condiciona fuertemente el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11x (detector convolucional de una etapa, familia YOLO11 de Ultralytics) |
| Parametros totales | no disponible (la model card no publica el conteo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | INT8, BF16 y AMP (las variantes publicadas usan AMP) |
| Idiomas soportados | no aplica (deteccion de objetos sobre imagenes) |
| Licencia | AGPL-3.0 (el modelo original admite tambien licencia enterprise de Ultralytics) |
| Formato de pesos | `.bm` (formato compilado de Blaize Picasso SDK); no se publican safetensors, GGUF ni ONNX |

Variantes publicadas:

| Variante | Cuantizacion | Resolucion (W×H) | Fichero |
|---|---|---|---|
| YOLO11x_COCO_amp_416_416 | AMP | 416×416 | `YOLO11x_COCO_amp_416_416.bm` |
| YOLO11x_COCO_amp_640_640 | AMP | 640×640 | `YOLO11x_COCO_amp_640_640.bm` |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO11x, la variante de mayor capacidad de la familia YOLO11 de Ultralytics: un detector de una etapa basado en convoluciones con cuello de botella tipo C3k2 y módulos de atención (C2PSA) en la cabeza de la red, orientado a detección en tiempo real. El modelo fue entrenado originalmente por Ultralytics sobre COCO 2017 (licencia del dataset CC-BY-4.0) usando PyTorch, versión 11.0. Blaize no ha modificado el código fuente del modelo: solo ha realizado optimizaciones específicas de hardware para que sea compatible con sus aceleradores.

La innovación técnica de esta ficha no está en el entrenamiento sino en la compilación: el SDK Picasso convierte el grafo del modelo en una representación ejecutable sobre el GSP, una arquitectura de flujo de grafos que busca eficiencia energética y baja latencia en el borde. Los artefactos publicados usan precisión mixta automática (AMP), que combina INT8 y BF16 para equilibrar precisión y velocidad. No se documentan detalles sobre calibración de cuantización, número de tokens de entrenamiento ni procesos de ajuste fino posteriores.

## Capacidades

- Detección de objetos en imágenes con las 80 clases del dataset COCO 2017.
- Salida de cajas delimitadoras con clase y puntuación de confianza (formato estándar de detección YOLO).
- Dos resoluciones de entrada compiladas: 416×416 (mayor velocidad) y 640×640 (mayor precisión en objetos pequeños).
- Ejecución nativa sobre aceleradores Blaize Xplorer mediante el SDK Picasso.
- Inspección del artefacto mediante la utilidad `blaize-modeltool`.
- No soporta tool calling, agentes, razonamiento multi-paso ni texto: es exclusivamente un detector visual.
- No se documentan capacidades multilingües (no aplica).
- No se documentan modos especiales como thinking, visión-lenguaje o audio.

## Casos de uso

- Inspección visual en línea de producción: el modelo detecta objetos y defectos sobre imágenes de cámara en la línea de montaje, ejecutándose en el acelerador Xplorer en el propio puesto de trabajo, lo que evita enviar imágenes a la nube y reduce la latencia a nivel de milisegundos.
- Videovigilancia y control de accesos en el borde: al ejecutarse sobre GSP con bajo consumo, permite procesar flujos de cámara de forma continua en dispositivos empotrados sin depender de un servidor central.
- Conteo y analítica de aforo en retail: la variante 640×640 ofrece mejor detección de personas y objetos pequeños en escenas concurridas, adecuada para medir ocupación o flujos de clientes.
- Robótica móvil y AGV: la detección en tiempo real de obstáculos y personas con la variante 416×416 encaja con los requisitos de latencia y potencia de plataformas robóticas con acelerador Blaize.
- Automatización agrícola: detección de frutos, plagas o maquinaria en campo sobre hardware de bajo consumo alimentado por batería o panel solar.
- Sistemas de seguridad y emergencias: detección de personas, vehículos o equipos de protección en entornos industriales, con la ventaja de que los datos no salen del dispositivo.
- Prototipado con Picasso SDK: validar pipelines de inferencia y comparar las dos variantes de resolución antes de fijar la configuración de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (mAP) ni de latencia o throughput para las variantes compiladas, por lo que no es posible comparar su rendimiento con el YOLO11x original sin medirlo directamente sobre hardware Blaize.

## Requisitos de hardware

- Hardware obligatorio: acelerador de IA Blaize Xplorer. Los artefactos `.bm` no son ejecutables en GPU, CPU ni otros aceleradores.
- Software obligatorio: SDK Picasso de Blaize instalado y configurado; la utilidad `modeltool` permite inspeccionar los modelos.
- VRAM estimada: no disponible (no aplica a GPU; el consumo de memoria depende del acelerador GSP y de la variante).
- GPU recomendadas: no aplica; el modelo no se ejecuta en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no; requiere hardware Blaize.
- Opciones de despliegue: exclusivamente el SDK Picasso sobre Xplorer. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (son herramientas de modelos de lenguaje y no aplican).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11x_COCO (Blaize-AI) | no disponible | 416×416 y 640×640 | no aplica | AGPL-3.0 | Solo formato `.bm` para hardware Blaize |
| YOLO11x (Ultralytics original) | no publicado en esta ficha | configurable (640 por defecto) | no aplica | AGPL-3.0 o enterprise | Pesos PyTorch, exportable a ONNX, TensorRT, etc. |
| YOLOv8x (Ultralytics) | no publicado en esta ficha | configurable | no aplica | AGPL-3.0 o enterprise | Pesos PyTorch y multiples formatos de exportacion |
| YOLOv5x (Ultralytics) | no publicado en esta ficha | configurable | no aplica | AGPL-3.0 o enterprise | Pesos PyTorch y multiples formatos de exportacion |

La comparación relevante es contra el YOLO11x oficial: mismos pesos de origen, pero este repositorio añade la compilación para GSP y elimina la portabilidad a otras plataformas. Los conteos de parámetros de las alternativas no se detallan aquí porque no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total de hardware Blaize Xplorer y del SDK Picasso: el modelo no es utilizable fuera de ese ecosistema.
- Solo se publican variantes AMP; aunque la model card menciona INT8 y BF16, no hay artefactos de esas precisiones en el repositorio.
- No se publican métricas de precisión (mAP) ni de latencia para las variantes compiladas, por lo que el rendimiento real debe medirse en destino.
- Sesgos conocidos: hereda los sesgos del dataset COCO 2017 (desequilibrio de clases, representación limitada de contextos no occidentales); no se documentan análisis adicionales.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existen falsos positivos y falsos negativos propios de un detector de una etapa, especialmente en objetos pequeños u ocluidos.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Licencia AGPL-3.0: el uso comercial en servicios de red puede obligar a liberar el código fuente de la aplicación que lo integra, salvo que se adquiera la licencia enterprise de Ultralytics. Es un caveat crítico para producción.
- La model card exime a Blaize de cualquier responsabilidad sobre el contenido de terceros y no ofrece garantías de no infracción de propiedad intelectual.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Blaize-AI/YOLO11x_COCO
- Repositorio original de Ultralytics: https://www.github.com/ultralytics/ultralytics
- Dataset COCO: https://cocodataset.org
- Sitio de Blaize: https://www.blaize.com
