# jmloperaa2830/tomi-sd-turbo-q8-gguf

## Resumen

SD-Turbo (Q8_0, GGUF) es una conversión a formato GGUF del modelo de difusión texto-a-imagen SD-Turbo de Stability AI, publicada por el usuario jmloperaa2830. El modelo original es un modelo de difusión latente derivado de Stable Diffusion 2.1, destilado para generar imágenes en uno a cuatro pasos de inferencia, lo que lo hace especialmente adecuado para despliegue en entornos con recursos limitados o para generación casi en tiempo real. Esta versión concreta empaqueta los pesos en cuantización Q8_0 (con parte de los tensores conservados en f32) para su uso con stable-diffusion.cpp.

El repositorio está pensado como artefacto de distribución para el servicio de imágenes `tomi_ai_img` del proyecto TOMi 8, que descarga el modelo al instalar el paquete `tomi_model_img_sd_turbo`. No se trata, por tanto, de un modelo entrenado desde cero ni de un fine-tuning, sino de una conversión de formato y cuantización del checkpoint original de Stability AI.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa práctica para ejecutar SD-Turbo sin depender de PyTorch ni de CUDA mediante stable-diffusion.cpp; por otro, advierte de las particularidades de licencia (Stability AI Community License) y de las limitaciones de una conversión GGUF que mantiene parte de los pesos en f32, lo que explica su tamaño de 3,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (UNet + VAE + text encoder CLIP), derivada de Stable Diffusion 2.1 |
| Parametros totales | 1.303.598.228 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; límite de tokens del text encoder CLIP, no especificado en la información disponible) |
| Tipos de cuantizacion | Q8_0 (con parte de los pesos en f32) |
| Idiomas soportados | no disponible (el prompt se procesa mediante CLIP, principalmente inglés) |
| Licencia | Stability AI Community License |
| Formato de pesos | GGUF (`sd_turbo_q8_0.gguf`, ≈ 3,4 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es SD-Turbo de Stability AI, un modelo de difusión latente con arquitectura UNet, VAE y text encoder CLIP, obtenido mediante destilación adversarial de SD 2.1 para reducir drásticamente el número de pasos de muestreo necesarios (típicamente uno a cuatro). No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento, el número de tokens o imágenes vistas, ni sobre si se aplicaron técnicas de RLHF o preferencias humanas; estos datos corresponden a la model card original de Stability AI y no se reproducen aquí.

La innovación de esta publicación concreta es la conversión a GGUF con cuantización Q8_0 para stable-diffusion.cpp. Según la model card, parte de los pesos quedó en f32 durante la conversión, lo que explica que el archivo resultante (≈ 3,4 GB) sea mayor de lo que cabría esperar de una cuantización Q8_0 pura sobre 1,3 mil millones de parámetros. No se documentan cambios en el proceso de muestreo, en el scheduler ni en el text encoder respecto al checkpoint original.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) en uno a cuatro pasos de inferencia, gracias a la destilación del modelo original.
- Ejecución en CPU y GPU mediante stable-diffusion.cpp, sin dependencia de PyTorch.
- Integración como servicio local en el paquete `tomi_model_img_sd_turbo` del proyecto TOMi 8.
- Generación rápida de borradores visuales y prototipos con latencia reducida frente a modelos de difusión no destilados.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking"; son capacidades ajenas a un modelo de difusión texto-a-imagen.
- Capacidades multilingües: no disponibles; el text encoder CLIP empleado está orientado principalmente a inglés.

## Casos de uso

- Generación de imágenes en local sin GPU dedicada: al ejecutarse con stable-diffusion.cpp, el modelo puede correr en CPU con un archivo GGUF de 3,4 GB, lo que permite desplegarlo en portátiles o servidores sin CUDA.
- Prototipado rápido de interfaces gráficas: con uno a cuatro pasos de muestreo, se pueden generar variaciones de una idea visual en segundos para validar dirección de diseño antes de pasar a un modelo de mayor calidad.
- Servicio de imágenes embebido en aplicaciones de escritorio: es exactamente el uso previsto por el autor en el proyecto TOMi 8, donde el paquete descarga el modelo al instalar y lo expone como servicio `tomi_ai_img`.
- Generación de ilustraciones para documentación técnica o blogs: útil para crear imágenes de acompañamiento sin depender de servicios en la nube ni de conexión a internet.
- Creación de datasets sintéticos de imágenes para experimentos de visión por computador: permite generar lotes controlados de imágenes con prompts específicos en entornos con recursos modestos.
- Pruebas de pipelines de inferencia GGUF: sirve como banco de pruebas para validar integraciones con stable-diffusion.cpp antes de migrar a modelos de difusión más grandes o a otras cuantizaciones.
- Educación y demostraciones: su tamaño contenido y su licencia comunitaria permiten usarlo en talleres o aulas para explicar el funcionamiento de la difusión latente destilada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el archivo GGUF ocupa ≈ 3,4 GB, por lo que se necesita al menos esa cantidad de memoria (RAM o VRAM) para cargar los pesos, más overhead del runtime.
- GPU recomendadas: no especificadas en la información disponible; al ser un modelo de 1,3 mil millones de parámetros en Q8_0, es plausible que quepa en GPUs de consumo con 6-8 GB de VRAM, pero este dato no está confirmado por el autor.
- ¿Cabe en GPU de consumo? No confirmado oficialmente; por tamaño de pesos, es compatible con tarjetas de gama media, pero se desconoce el consumo real del runtime stable-diffusion.cpp con esta conversión.
- Opciones de despliegue: stable-diffusion.cpp (runtime previsto por el autor); no se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que no están orientados a modelos de difusión.
- Latencia y throughput: no disponibles; la model card no proporciona tiempos de generación ni imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Pasos típicos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SD-Turbo Q8_0 GGUF (este repo) | 1.303.598.228 | GGUF Q8_0 + f32 parcial | 1-4 | Stability AI Community License | Hugging Face, 63 descargas |
| stabilityai/sd-turbo (original) | 1.303.598.228 (aprox.) | safetensors / diffusers | 1-4 | Stability AI Community License | Hugging Face, oficial de Stability AI |
| SDXL-Turbo | no disponible en la información proporcionada | safetensors / diffusers | 1-4 | Stability AI Community License | Hugging Face, oficial de Stability AI |
| Stable Diffusion 2.1 | no disponible en la información proporcionada | safetensors / diffusers | 20-50 | CreativeML Open RAIL++-M | Hugging Face, oficial de Stability AI |

La comparativa se limita a modelos de la misma familia y licencia; no se dispone de datos de rendimiento comparado (FID, CLIP score) en la información proporcionada para establecer diferencias cuantitativas entre ellos.

## Limitaciones y advertencias

- La licencia Stability AI Community License permite uso comercial solo por debajo de 1 millón de USD de ingresos anuales; por encima de ese umbral se requiere una licencia comercial de Stability AI.
- Al ser una conversión de terceros y no un checkpoint oficial, no hay garantía de que la cuantización Q8_0 con pesos parciales en f32 preserve exactamente la calidad del modelo original; no se documentan evaluaciones de fidelidad.
- El modelo es texto-a-imagen y no soporta instrucciones conversacionales, tool calling ni razonamiento; no debe evaluarse con los criterios de un LLM.
- Riesgo de sesgos y estereotipos heredados del dataset de entrenamiento de Stable Diffusion 2.1, no documentados en esta conversión.
- Posible generación de contenido inapropiado o no fiel al prompt; no se documenta ningún filtro de seguridad adicional en esta publicación.
- Idiomas: el text encoder CLIP está orientado principalmente a inglés; el rendimiento con prompts en castellano no está documentado y probablemente sea inferior.
- El repositorio tiene muy poca tracción (63 descargas, 0 likes) y fue creado y actualizado en el mismo día; no hay historial de mantenimiento ni issues resueltos.
- El tamaño del archivo (3,4 GB) es superior al esperado para Q8_0 puro, lo que puede afectar a requisitos de memoria y a velocidad de carga en comparación con otras cuantizaciones.
- No se especifican requisitos mínimos de hardware ni versiones compatibles de stable-diffusion.cpp, lo que puede provocar problemas de reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jmloperaa2830/tomi-sd-turbo-q8-gguf
- Modelo base original: https://huggingface.co/stabilityai/sd-turbo
- stable-diffusion.cpp (runtime): https://github.com/leejet/stable-diffusion.cpp
- Licencia Stability AI Community License: incluida como `LICENSE.md` en el repositorio del modelo.
