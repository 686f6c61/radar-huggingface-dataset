# alayou/sd-class-butterflies-32

## Resumen

`alayou/sd-class-butterflies-32` es un modelo de difusion para generacion incondicional de imagenes de mariposas, publicado en HuggingFace por el usuario alayou. Se trata de un artefacto formativo derivado del curso *Diffusion Models Class* de HuggingFace, concretamente de la Unidad 1, donde se entrena un modelo de difusion desde cero sobre un dataset de imagenes de mariposas a resolucion 32x32. No es un modelo de proposito general ni compite con los grandes modelos texto-a-imagen: es una demostracion educativa de como funciona el pipeline de difusion (DDPMPipeline) de la libreria `diffusers`.

El modelo tiene 18.536.323 parametros (aproximadamente 18,5 millones) y un peso de repositorio de 0,1 GB, lo que refleja su naturaleza compacta. La arquitectura es un UNet de difusion clasico entrenado de forma incondicional, es decir, sin condicionamiento por texto ni por clase: genera mariposas aleatorias sin control sobre color, pose o especie. La licencia es MIT, lo que permite uso comercial y modificacion sin restricciones practicas.

Su relevancia es fundamentalmente didactica y de investigacion: sirve como punto de partida reproducible para experimentar con entrenamiento de difusion, fine-tuning, muestreo con distintos schedulers y evaluacion de modelos generativos pequenos. No esta pensado para produccion ni para tareas de generacion de imagenes realistas de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion (DDPM/DDPMPipeline), no disponible el detalle exacto de capas |
| Parametros totales | 18.536.323 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (generacion de imagen incondicional) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria diffusers, framework PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estandar de difusion denoising probabilistica (DDPM) implementada en `diffusers` como `DDPMPipeline`. Consiste en un UNet que aprende a predecir el ruido anadido a una imagen en cada paso del proceso de difusion, y un scheduler (por defecto el asociado al pipeline) que invierte ese proceso para generar imagenes desde ruido gaussiano puro. La generacion es incondicional: no hay encoder de texto, embeddings de clase ni mecanismo de guiado (classifier-free guidance), por lo que el modelo no acepta prompts.

El entrenamiento se realizo en el contexto de la Unidad 1 del curso *Diffusion Models Class* de HuggingFace, sobre un dataset de imagenes de mariposas a 32x32 pixeles (el sufijo `-32` hace referencia a esa resolucion). No se dispone de informacion publica sobre el numero exacto de pasos de entrenamiento, tamano del dataset, composicion, ni sobre el uso de tecnicas como EMA de pesos, RLHF o DPO (no aplicables en este contexto). No se documentan innovaciones tecnicas destacables mas alla del uso del pipeline estandar de difusion.

## Capacidades

- Generacion incondicional de imagenes de mariposas a resolucion 32x32 pixeles.
- Muestreo mediante `DDPMPipeline` de la libreria `diffusers`, con posibilidad de cambiar el scheduler.
- Generacion por lotes (batch) de multiples imagenes en una sola llamada al pipeline.
- No soporta texto-a-imagen: no acepta prompts ni condicionamiento semantico.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues, de codigo, matematicas, vision por comprension ni audio.
- No dispone de modo "thinking" ni de mecanismos de agente.

## Casos de uso

- Docencia y aprendizaje de difusion: reproduce el flujo completo de entrenamiento y muestreo de un DDPM en un entorno de bajo coste, ideal para explicar como funciona el proceso de denoising paso a paso.
- Experimentacion con schedulers: permite comparar DDIM, PNDM, DPM-Solver y otros schedulers sobre un mismo checkpoint para estudiar el compromiso entre calidad y numero de pasos.
- Fine-tuning educativo: sirve como base para reentrenar sobre un dataset propio pequeno (por ejemplo, flores o formas geometricas) y observar el efecto del dominio de datos.
- Pruebas de integracion con `diffusers`: util para validar pipelines, scripts de inferencia y utilidades de serializacion en entornos de desarrollo antes de escalar a modelos mayores.
- Investigacion sobre evaluacion generativa: permite calcular metricas como FID o IS sobre un modelo pequeno y controlado para calibrar metodologias de evaluacion.
- Prototipado de demos interactivas: con 18,5 millones de parametros cabe en cualquier GPU consumer, por lo que es adecuado para demos en notebooks o aplicaciones ligeras de demostracion.
- Reproducibilidad de resultados academicos: al ser un checkpoint publico con licencia MIT, facilita la replicacion de experimentos docentes y la comparacion entre estudiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32; el modelo completo ocupa unos 74 MB en FP32 (18,5 M de parametros x 4 bytes) y aproximadamente 37 MB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en GPU consumer: GTX 1650, RTX 3050, RTX 4060, e incluso en CPU con tiempos de generacion aceptables para 32x32.
- Opciones de despliegue: `diffusers` con PyTorch (DDPMPipeline), exportacion a ONNX no documentada, `llama.cpp`/Ollama no aplicables (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo y la resolucion, se espera generacion en decenas o pocos cientos de milisegundos por imagen en GPU moderna, aunque no se proporcionan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alayou/sd-class-butterflies-32 | 18,5 M | 32x32 | Incondicional | MIT | HuggingFace |
| google/ddpm-cifar10-32 | ~35,7 M | 32x32 | Incondicional | Apache 2.0 | HuggingFace |
| google/ddpm-celebahq-256 | ~113 M | 256x256 | Incondicional | Apache 2.0 | HuggingFace |
| CompVis/ldm-celebahq-256 | ~274 M (UNet) | 256x256 | Incondicional | MIT (codigo) / CreativeML | HuggingFace |

La comparativa se basa en la categoria de modelos de difusion incondicional de proposito educativo o de referencia; los datos de parametros de los modelos alternativos son aproximados y pueden variar segun la implementacion. No se dispone de comparaciones de rendimiento cuantitativo (FID, IS) para este checkpoint.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo genera mariposas a 32x32; no es util para generacion de imagenes generales.
- Calidad limitada: la resolucion de 32x32 produce imagenes de baja fidelidad, no aptas para uso comercial como producto final.
- Sin condicionamiento: no acepta prompts, clases ni imagenes de referencia; no se puede dirigir la generacion.
- Riesgo de alucinacion visual: al ser un modelo generativo, puede producir patrones irreales o artefactos, aunque en este dominio el impacto es bajo.
- Sesgos de dataset: el modelo hereda los sesgos y la distribucion del dataset de mariposas del curso, no documentado publicamente en detalle.
- Sin garantias de produccion: no hay documentacion sobre estabilidad, versionado semantico ni soporte; es un artefacto educativo.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia de los datos de entrenamiento si se usa comercialmente.
- No disponible informacion sobre el dataset exacto, numero de pasos de entrenamiento ni metricas de evaluacion, lo que dificulta la reproducibilidad estricta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alayou/sd-class-butterflies-32
- Curso Diffusion Models Class (repositorio): https://github.com/huggingface/diffusion-models-class
- Documentacion de DDPMPipeline en diffusers: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
- Libreria diffusers: https://github.com/huggingface/diffusers
