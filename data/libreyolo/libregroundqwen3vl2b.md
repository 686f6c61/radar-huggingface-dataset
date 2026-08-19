# LibreYOLO/LibreGroundQwen3VL2b

## Resumen

LibreGroundQwen3VL2b es un espejo (mirror) del modelo Qwen/Qwen3-VL-2B-Instruct, publicado por LibreYOLO dentro de su capa de servicios LibreGround. No se han modificado los parámetros aprendidos; el repositorio conserva los archivos del snapshot original de Hugging Face y añade una envoltura de carga específica para la librería `libreyolo`, que facilita tareas de grounding (localización de elementos en imágenes) mediante una API simplificada.

El modelo base, Qwen3-VL-2B-Instruct, es un modelo multimodal de 2.127.532.032 parámetros (aproximadamente 2,1 mil millones) que procesa entradas de imagen y texto para generar respuestas conversacionales y localizar objetos o regiones en la imagen. Al ser un mirror, las capacidades y limitaciones son las del modelo original, aunque la distribución de LibreYOLO añade un envoltorio de uso específico para su ecosistema.

La relevancia de esta publicación radica en ofrecer una vía de integración rápida para desarrolladores que ya usan la librería `libreyolo` y necesitan un modelo de grounding ligero, con licencia Apache 2.0 y sin dependencias adicionales. El repositorio no incluye cambios de pesos ni entrenamiento adicional, por lo que su comportamiento es idéntico al del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen3-VL-2B-Instruct) |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un espejo sin modificaciones del checkpoint Qwen/Qwen3-VL-2B-Instruct. No se ha realizado ningún entrenamiento adicional, fine-tuning ni cambio de pesos; el repositorio conserva los archivos del snapshot original (commit `89644892e4d85e24eaac8bacfd4f463576704203`) y solo añade la envoltura de carga de la librería `libreyolo`. Por tanto, la arquitectura subyacente es la del modelo base, que combina un codificador de visión con un transformador de lenguaje para tareas de imagen-texto, incluyendo capacidades de grounding. No se dispone de información detallada sobre el proceso de entrenamiento original (datos, tokens, método de alineación) en la documentación proporcionada.

## Capacidades

- Procesamiento de entradas de imagen y texto (pipeline `image-text-to-text`).
- Generación de respuestas conversacionales basadas en imágenes.
- Grounding: localización de objetos o regiones en la imagen mediante coordenadas (puntos o cajas), como se muestra en el ejemplo de uso de la model card.
- Integración con la librería `libreyolo` a través de la clase `LibreGround`, que simplifica la llamada al modelo.
- Compatibilidad con el ecosistema de Hugging Face (transformers) al conservar los archivos del snapshot original.

## Casos de uso

- Automatización de pruebas de interfaz de usuario: el modelo puede localizar botones, campos de texto o iconos en capturas de pantalla, permitiendo generar scripts de test que interactúan con elementos específicos de una aplicación web o móvil.
- Asistencia visual para accesibilidad: dado un screenshot, el modelo puede identificar y describir elementos interactivos, ayudando a personas con discapacidad visual a entender la disposición de una interfaz.
- Extracción de información de documentos escaneados: al recibir una imagen de un formulario o factura, el modelo puede localizar campos relevantes (nombre, fecha, importe) y devolver sus coordenadas para su posterior procesamiento.
- Chatbots con comprensión de imágenes: integrado en un sistema conversacional, permite responder preguntas sobre el contenido de una fotografía, como "¿qué objeto hay en la esquina superior izquierda?".
- Anotación automática de datasets: para tareas de visión por computador, el modelo puede generar anotaciones preliminares de localización de objetos en imágenes, acelerando la creación de conjuntos de datos etiquetados.
- Control de robots o agentes autónomos: mediante grounding en tiempo real, el modelo puede identificar objetivos en el campo visual y guiar acciones de un agente, como seleccionar un objeto en una escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un mirror sin cambios, el rendimiento del modelo es equivalente al de Qwen3-VL-2B-Instruct, pero no se dispone de cifras concretas en esta documentación.

## Requisitos de hardware

- El tamaño del repositorio es de 4,3 GB, lo que sugiere que los pesos en precisión FP16 ocupan aproximadamente esa cantidad (2,1 mil millones de parámetros × 2 bytes ≈ 4,2 GB).
- Para inferencia en FP16 se estima un consumo de VRAM de al menos 5-6 GB (incluyendo overhead de activaciones y buffers), por lo que cabría en GPUs de consumo como la RTX 3060 (12 GB) o superiores.
- Con cuantización a 4 bits (por ejemplo, mediante GPTQ o AWQ), el modelo podría ejecutarse en GPUs con 4 GB de VRAM, aunque no se proporcionan archivos cuantizados en este repositorio.
- Opciones de despliegue: al ser un snapshot estándar de Hugging Face, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) o directamente con la librería `transformers`. La envoltura `libreyolo` ofrece una vía adicional de integración.
- No se dispone de datos de latencia o throughput específicos para este mirror.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de grounding de tamaño similar. El modelo base Qwen3-VL-2B-Instruct pertenece a la familia Qwen3-VL, que incluye variantes de mayor tamaño (4B, 8B, 32B), pero no se han proporcionado datos comparativos en la documentación.

## Limitaciones y advertencias

- Al ser un mirror sin modificaciones, las limitaciones del modelo son las del Qwen3-VL-2B-Instruct original, pero no se detallan en esta documentación.
- No se han publicado resultados de sesgos, alucinaciones o fallos de grounding específicos para este modelo.
- El repositorio no incluye archivos cuantizados ni adaptaciones para entornos de producción específicos; el usuario debe generar sus propias versiones si las necesita.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de copyright original de Qwen/Alibaba, tal como se indica en la model card.
- El número de descargas y likes es cero, lo que indica que es una publicación reciente sin adopción verificada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/LibreYOLO/LibreGroundQwen3VL2b
- Modelo base original: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
