# khmerfakenews/mes-sdxs09-onnx

## Resumen

SDXS-512-0.9 es un modelo de generacion de imagenes texto-a-imagen de un solo paso, desarrollado originalmente por IDKiro y distribuido bajo licencia OpenRAIL++. Esta ficha documenta la conversion a ONNX realizada por el usuario khmerfakenews para su uso en navegador mediante onnxruntime-web y WebGPU, orientada a la aplicacion MES Model Lab. El modelo genera imagenes de 512x512 píxeles en una unica iteracion de muestreo, sin clasifier-free guidance, lo que reduce drasticamente el coste computacional frente a los modelos de difusion tradicionales que requieren decenas de pasos.

La arquitectura subyacente es una variante de Stable Diffusion con destilacion de pasos (uno solo), que incluye un text encoder OpenCLIP-H, una UNet y un decoder VAE basado en TAESD. El repositorio ONNX ocupa 1.3 GB y pesa lo suficiente como para ser desplegado en entornos web con aceleracion por GPU del navegador. La relevancia actual radica en la posibilidad de ejecutar generacion de imagenes completamente en el cliente, sin depender de servidores, lo que abre la puerta a aplicaciones interactivas de baja latencia y privacidad por diseno.

El modelo no incluye datos de benchmarks publicados en la informacion disponible, y su adopcion es practicamente nula (0 descargas, 0 likes en el momento de la consulta), lo que sugiere que se trata de una conversion tecnica de nicho mas que de un modelo ampliamente validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion destilado a un paso (UNet + OpenCLIP-H + TAESD VAE), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de texto fija de 77 tokens) |
| Tipos de cuantizacion | fp16 en pesos de text encoder y UNet; fp32 en VAE decoder y en nodos de resize/time-embedding; entrada/salida en fp32 |
| Idiomas soportados | no disponible (el prompt se procesa con OpenCLIP-H, predominantemente ingles) |
| Licencia | OpenRAIL++ |
| Formato de pesos | ONNX (opset 17), exportado con torch.onnx |

## Arquitectura y entrenamiento

El modelo original SDXS-512-0.9 emplea una arquitectura de difusion destilada para generar imagenes en un unico paso de muestreo. La conversion ONNX mantiene tres componentes diferenciados: un text encoder OpenCLIP-H con pesos en fp16 y E/S en fp32 que acepta `input_ids` de tipo int32 con forma [1,77] y produce `last_hidden_state` de forma [1,77,1024]; una UNet con pesos fp16 y E/S fp32 que recibe `sample` [1,4,64,64], `timestep` float32 [1] y `encoder_hidden_states` [1,77,1024], y devuelve `out_sample`; y un VAE decoder basado en TAESD en fp32 (el autor indica que fp16 degrada la calidad), que transforma el latente en una imagen con valores aproximadamente en el rango [-1,1].

El proceso de muestreo es de un solo paso, sin CFG, con sampler EulerDiscrete trailing, t=999, sigma aproximada de 14.6146 y escalado VAE de 1.0. La exportacion se realizo con torch.onnx en opset 17, manteniendo los nodos de resize y time-embedding en fp32 para preservar la precision. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original; la model card de esta conversion no los detalla.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512x512 píxeles en un unico paso de inferencia.
- Ejecucion en navegador mediante onnxruntime-web con aceleracion WebGPU.
- Procesamiento de prompts de hasta 77 tokens con el text encoder OpenCLIP-H.
- Inferencia sin clasifier-free guidance, lo que elimina la necesidad de duplicar el coste de la UNet.
- Decodificacion VAE ligera mediante TAESD, adecuada para entornos con recursos limitados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking; es exclusivamente un modelo de generacion de imagenes.

## Casos de uso

- Generacion de imagenes en el navegador para aplicaciones web interactivas: el modelo puede ejecutarse integramente en el cliente con WebGPU, sin enviar prompts a un servidor, lo que reduce la latencia y mejora la privacidad del usuario.
- Prototipado rapido de conceptos visuales en herramientas de diseno: al generar en un solo paso, permite iterar sobre variaciones de un prompt con una respuesta casi inmediata en equipos con GPU integrada compatible.
- Aplicaciones educativas o demos de IA generativa: al no requerir backend, se puede desplegar como recurso estatico en una pagina web para mostrar el funcionamiento de la difusion destilada.
- Generacion de miniaturas o placeholders en editores web: la resolucion de 512x512 y el bajo coste de inferencia lo hacen adecuado para previsualizaciones rapidas dentro de un CMS o editor de contenido.
- Filtrado y moderacion de prompts en el cliente: al ejecutarse localmente, puede combinarse con otras herramientas para generar contenido de prueba sin exponer datos sensibles a servicios externos.
- Investigacion sobre despliegue de modelos de difusion en el borde: sirve como referencia tecnica para estudiar conversiones ONNX de modelos destilados y su rendimiento en WebGPU, aunque su adopcion real es muy limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ONNX ocupa 1.3 GB, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos, mas el espacio de activaciones.
- GPU recomendadas: no disponible; al estar orientado a onnxruntime-web y WebGPU, se espera que funcione en GPUs de navegador compatibles con WebGPU (por ejemplo, integradas modernas o dedicadas de gama media), pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: probable en GPUs con soporte WebGPU, pero sin datos de rendimiento publicados que lo confirmen.
- Opciones de despliegue: onnxruntime-web con WebGPU; tambien podria ejecutarse con onnxruntime nativo en otros entornos, aunque no se documenta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDXS-512-0.9 ONNX (este) | no disponible | 77 tokens de prompt | sin benchmarks publicados | OpenRAIL++ | ONNX en HF, 0 descargas |
| IDKiro/sdxs-512-0.9 (original) | no disponible | 77 tokens de prompt | sin benchmarks en la informacion disponible | OpenRAIL++ | pesos originales en HF |
| Stable Diffusion 1.5 | ~860M UNet | 77 tokens de prompt | ampliamente benchmarkeado | CreativeML OpenRAIL-M | muy disponible |
| Stable Diffusion XL Turbo | ~2.6B UNet | 77 tokens de prompt | benchmarks publicos | OpenRAIL++ | muy disponible |

No se dispone de datos de rendimiento comparativo para este modelo concreto; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Stable Diffusion, es probable que herede sesgos de representacion del dataset original, pero no se confirma.
- Riesgo de alucinacion: no aplica en el sentido textual, pero la generacion de imagenes puede producir contenido inexacto o no fiel al prompt, especialmente con un solo paso de muestreo.
- Limitaciones de contexto o idioma: el text encoder OpenCLIP-H esta entrenado predominantemente en ingles; el soporte multilingue no esta garantizado ni documentado.
- Restricciones de licencia: OpenRAIL++ permite uso comercial con restricciones de uso responsable; es necesario revisar los terminos completos antes de desplegar en produccion.
- Caveat importante: el modelo tiene 0 descargas y 0 likes, lo que indica falta de validacion por la comunidad; la conversion ONNX puede presentar diferencias de calidad frente al modelo original y no se han publicado evaluaciones.
- El VAE decoder en fp32 es necesario para evitar degradacion de calidad, lo que incrementa el uso de memoria frente a una version totalmente fp16.
- La fecha de creacion del repositorio (2026-11-08) es futura respecto a la fecha actual, lo que puede indicar un error en los metadatos o una programacion anticipada; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/khmerfakenews/mes-sdxs09-onnx
- Modelo base: https://huggingface.co/IDKiro/sdxs-512-0.9
- No se han encontrado otros enlaces relevantes (papers, blogs, repos, demos) en la informacion proporcionada.
