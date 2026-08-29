# Skibrib/Qwen-Image-Edit-2511-Multiple-Angles-LoRA

## Resumen

El modelo **Skibrib/Qwen-Image-Edit-2511-Multiple-Angles-LoRA** es un adaptador LoRA (Low-Rank Adaptation) diseñado para el modelo de edición de imágenes **Qwen-Image-Edit-2511** de Alibaba. Su propósito es añadir un control preciso y fino sobre la posición de la cámara en tareas de edición y generación de imágenes, permitiendo especificar 96 poses de cámara distintas combinando 4 elevaciones, 8 acimuts y 3 distancias. Está entrenado sobre más de 3000 pares de renders generados con Gaussian Splatting, lo que proporciona consistencia 3D en las transformaciones de perspectiva.

Este adaptador resuelve un problema práctico: el modelo base ya tiene cierta capacidad de control de punto de vista, pero no ofrece un control fino y reproducible. El LoRA introduce un formato de prompt estructurado con tokens como `<sks> front view low-angle shot close-up`, que permite a los desarrolladores especificar de forma explícita el ángulo, la elevación y la distancia de cámara. Es relevante ahora porque la edición de imágenes con control de cámara es una demanda creciente en producción de contenido visual, y este adaptador es el primero de su tipo para Qwen-Image-Edit-2511, con licencia Apache 2.0 y un tamaño de repositorio de 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen-Image-Edit-2511 |
| Parametros totales | No disponible (repo de 0,3 GB, peso del adaptador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen-Image-Edit-2511) |
| Tipos de cuantizacion | No disponible (el adaptador se aplica al modelo base, que puede cuantizarse) |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio con libreria diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA, una tecnica de fine-tuning eficiente que introduce matrices de bajo rango en las capas de atencion y feed-forward del modelo base. No se especifican los rangos ni las capas objetivo en la informacion disponible. El entrenamiento se realizo sobre un conjunto de mas de 3000 pares de imagenes generadas mediante renders de Gaussian Splatting, una representacion 3D que permite generar vistas consistentes desde distintos angulos. El dataset cubre 96 poses de camara (4 elevaciones × 8 acimuts × 3 distancias), con especial atencion a angulos bajos (-30°), que suelen ser problematicos en modelos de generacion de imagenes. No se menciona el uso de RLHF ni DPO; el entrenamiento parece ser supervisado sobre pares imagen-prompt.

## Capacidades

- Control fino de la posicion de camara en edicion de imagenes: 96 poses discretas combinando elevacion (-30°, 0°, 30°, 60°), acimut (8 direcciones) y distancia (close-up, medium, wide).
- Formato de prompt estructurado con el token `<sks>` seguido de descriptores de angulo, elevacion y distancia (ejemplo: `<sks> front-right quarter view elevated shot medium shot`).
- Consistencia 3D en las transformaciones gracias al entrenamiento con renders de Gaussian Splatting.
- Soporte especifico para angulos bajos (low-angle), que suelen fallar en otros modelos.
- Compatible con el pipeline de edicion imagen-a-imagen de Qwen-Image-Edit-2511 mediante la libreria diffusers.
- No se reportan capacidades de tool calling, agentes, ni multimodalidad adicional mas alla de la edicion de imagenes.

## Casos de uso

- **Produccion de contenido visual para e-commerce**: generar vistas multiples de un producto (frontal, lateral, trasera, a diferentes alturas) a partir de una unica imagen de referencia, para catalogos o fichas de producto. El LoRA permite especificar exactamente el angulo deseado con prompts como `<sks> right side view eye-level shot medium shot`.
- **Previsualizacion cinematografica (storyboarding)**: crear secuencias de planos de una escena variando la posicion de camara (low-angle, high-angle, close-up) para previsualizar encuadres antes de rodar. La consistencia 3D del adaptador ayuda a mantener la coherencia del sujeto entre planos.
- **Generacion de datasets sinteticos para entrenamiento de modelos de vision**: generar multiples vistas de objetos con etiquetas de angulo y distancia, utiles para entrenar redes de estimacion de pose o reconstruccion 3D. El formato de prompt estructurado facilita la automatizacion.
- **Edicion de fotografia de arquitectura**: cambiar el punto de vista de una imagen de un edificio o interior (por ejemplo, de una vista frontal a una vista en escorzo) manteniendo la estructura geometrica, gracias al entrenamiento con datos 3D.
- **Creacion de assets para videojuegos**: generar vistas de personajes o props desde distintos angulos para usar como referencias en modelado 3D o texturizado. El control de distancia (close-up, medium, wide) permite obtener tanto detalles como contexto.
- **Automatizacion de contenido para redes sociales**: producir variaciones de una misma imagen con diferentes encuadres (por ejemplo, un retrato en plano medio y luego un primer plano) sin necesidad de sesion fotografica adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (como FID, CLIP score o evaluaciones humanas) que permitan comparar objetivamente el rendimiento del adaptador frente a otras soluciones de control de camara.

## Requisitos de hardware

- Al ser un LoRA, los requisitos de hardware son los del modelo base Qwen-Image-Edit-2511, mas un overhead minimo por el adaptador (0,3 GB de pesos adicionales).
- VRAM estimada: depende de la cuantizacion del modelo base. Para un modelo de edicion de imagenes de tamano medio (tipicamente 5-20 GB en FP16), se recomienda al menos 16 GB de VRAM para inferencia con diffusers. Con cuantizacion (por ejemplo, 8 bits) podria caber en GPUs de 12 GB.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para produccion. En consumer, una RTX 3090 o 4090 es suficiente para pruebas.
- Opciones de despliegue: el adaptador se integra con la libreria diffusers de HuggingFace, por lo que puede usarse con pipelines de Python. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que estos estan orientados a modelos de texto.
- Latencia y throughput: no disponibles. Dependen del modelo base y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Control de camara | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-Edit-2511 (base) | Modelo completo | Limitado (built-in viewpoint) | No especificado | Apache 2.0 | HuggingFace |
| Skibrib/Qwen-Image-Edit-2511-Multiple-Angles-LoRA | LoRA sobre Qwen-Image-Edit-2511 | 96 poses discretas | 3000+ renders Gaussian Splatting | Apache 2.0 | HuggingFace |
| Otros LoRA de control de camara (p.ej. para SDXL) | LoRA sobre SDXL | Variable, tipicamente menos poses | Variable | Variable | HuggingFace |

No se dispone de informacion detallada sobre alternativas especificas comparables en el mismo modelo base. La comparativa se limita a lo que se conoce del modelo base y del propio adaptador.

## Limitaciones y advertencias

- El adaptador solo controla la posicion de camara; no anade capacidades de edicion semantica (cambiar objetos, colores, etc.) que ya deba tener el modelo base.
- El formato de prompt es especifico y requiere usar el token `<sks>` y los descriptores exactos documentados; desviaciones pueden producir resultados impredecibles.
- El entrenamiento se realizo con renders de Gaussian Splatting, que pueden no cubrir todos los tipos de escenas (por ejemplo, escenas con oclusiones complejas o iluminacion extrema). El rendimiento en imagenes fotograficas reales puede variar.
- No se reportan evaluaciones de sesgo o alucinacion. Como adaptador de un modelo de generacion de imagenes, puede heredar sesgos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen-Image-Edit-2511 (tambien Apache 2.0 segun la etiqueta, aunque conviene confirmar).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un modelo reciente o poco probado por la comunidad. Se recomienda validar su comportamiento en casos de uso reales antes de desplegarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Skibrib/Qwen-Image-Edit-2511-Multiple-Angles-LoRA
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Repositorio espejo en HuggingFace (fal): https://huggingface.co/fal/Qwen-Image-Edit-2511-Multiple-Angles-LoRA
- Repositorio espejo en HuggingFace (wan-world): https://huggingface.co/wan-world/Qwen-Image-Edit-2511-Multiple-Angles-LoRA
- Repositorio en ModelScope: https://www.modelscope.cn/models/fal/Qwen-Image-Edit-2511-Multiple-Angles-LoRA
- Guia en dev.to: https://dev.to/gary_yan_86eb77d35e0070f5/qwen-image-edit-2511-multiple-angles-lora-complete-guide-to-multi-angle-ai-image-generation-1g5f
- Repositorio de pruebas en GitHub: https://github.com/chaymaeBelfaik/Qwen-Image-Edit-2511-Multiple-Angles-testing
