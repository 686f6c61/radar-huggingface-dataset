# ApacheOne/SD15_no_vae_dwd_trained

## Resumen

SD15 no-VAE DWD es un modelo de generacion de imagenes texto-a-imagen derivado de Lykon/dreamshaper-8-lcm, un checkpoint de Stable Diffusion 1.5 afinado con Latent Consistency Models (LCM). Lo desarrolla el usuario ApacheOne y su particularidad es que elimina el VAE del pipeline de inferencia: en lugar de decodificar latentes a pixeles mediante un autoencoder variacional, el modelo predice directamente parches de pixeles en espacio de color Oklab y los convierte a RGB. Esta adaptacion se ha realizado con el metodo DWD (Decoding Without a Decoder), descrito en el paper arXiv:2611.22287.

El modelo conserva la arquitectura U-Net propia de SD 1.5 (859.520.964 parametros en los pesos exportados) junto con el codificador de texto CLIP, su tokenizer y el scheduler LCM. La exportacion incluye la U-Net, la cola EMA entrenada, la cabeza de prediccion de pixeles y el scheduler, de modo que la inferencia texto-a-imagen se ejecuta sin VAE. Se entreno durante 10.000 actualizaciones con evaluaciones LCM a 8 pasos y CFG de 2, con resolucion de galeria de 512x512.

Su relevancia es fundamentalmente experimental: demuestra que es viable sustituir la decodificacion latente por prediccion directa de pixeles manteniendo un pipeline de difusion rapido (LCM). El repositorio es pequeno (2,0 GB), no acumula descargas ni likes en el momento de la consulta y esta pensado para pruebas tecnicas mas que para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de difusion (base Stable Diffusion 1.5) con cabeza de prediccion directa de pixeles en Oklab, sin VAE |
| Parametros totales | 859.520.964 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin contexto de texto medido) |
| Tipos de cuantizacion | no disponible (pesos exportados en safetensors y checkpoint de inferencia en .pt) |
| Idiomas soportados | no disponibles (prompts en ingles en los ejemplos de la model card) |
| Licencia | creativeml-openrail-m (CreativeML Open RAIL-M) |
| Formato de pesos | safetensors (componentes diffusers) y dwd_inference.pt (checkpoint de inferencia) |

## Arquitectura y entrenamiento

El modelo parte de DreamShaper 8 LCM, un fine-tune de Stable Diffusion 1.5 con destilacion LCM para permitir muestreo en pocos pasos. Sobre esa base, ApacheOne aplica el metodo DWD (Decoding Without a Decoder): la U-Net se adapta para predecir directamente parches de pixeles en espacio Oklab en lugar de latentes, y una cabeza de pixeles los convierte a RGB. La exportacion incluye la U-Net, una "cola EMA" entrenada, la cabeza de pixeles, el codificador de texto CLIP, el tokenizer y el scheduler LCM.

El entrenamiento consistio en 10.000 actualizaciones (training updates), con evaluaciones LCM a 8 pasos y un CFG de 2 en la galeria de ejemplo, a resolucion 512x512. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF/DPO (no aplicable en un modelo de difusion de este tipo). La innovacion tecnica destacable es precisamente la eliminacion del VAE en la ruta de decodificacion, lo que reduce componentes en inferencia y evita la perdida de detalle asociada a la reconstruccion latente, a costa de una U-Net modificada y un checkpoint de inferencia especifico.

## Capacidades

- Generacion de imagenes texto-a-imagen a partir de prompts en lenguaje natural, con resolucion de galeria de 512x512.
- Muestreo rapido mediante LCM: la model card reporta evaluaciones a 8 pasos con CFG de 2.
- Inferencia sin VAE: prediccion directa de pixeles en Oklab convertidos a RGB.
- Estilos variados segun los ejemplos publicados: fotografia realista, paisaje, accion, bodegon, concepto cinematografico, macrofotografia, acuarela, art nouveau, pixel art 16-bit, render 3D de arcilla, pintura impresionista, arquitectura brutalista, ilustracion surrealista, ciencia ficcion, anime, moda editorial, fauna y entornos fantasticos.
- Control de semilla y guidance en la CLI de inferencia (`--seed`, `--guidance`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (los ejemplos usan prompts en ingles).
- Capacidades especiales: ninguna adicional documentada (sin vision de entrada, sin audio, sin modo thinking).

## Casos de uso

- Prototipado de conceptos visuales: generar imagenes de referencia a 512x512 con 8 pasos LCM para iterar rapidamente sobre ideas de diseno antes de pasar a un modelo de mayor fidelidad.
- Pruebas de investigacion sobre decodificacion sin VAE: comparar la calidad de prediccion directa de pixeles frente a la decodificacion latente clasica en el mismo checkpoint base, usando el script `dreamshaper_dwd.py` con checkpoints y semillas controladas.
- Generacion de ilustraciones estilizadas: los ejemplos de la model card cubren acuarela, art nouveau, pixel art y pintura impresionista, por lo que sirve para producir assets de estilo consistente en proyectos creativos pequenos.
- Creacion de imagenes de ambiente para documentacion o presentaciones: prompts de paisaje, arquitectura o fotografia editorial con semillas fijas para reproducibilidad.
- Experimentacion con pipelines ligeros: al eliminar el VAE, el grafo de inferencia requiere menos componentes, lo que resulta util para validar despliegues minimos con PyTorch y torchvision.
- Generacion de material de referencia para concept art: escenas de ciencia ficcion, fantasia o surrealismo (por ejemplo, la ilustracion del pez dorado sobre la ciudad o las ruinas submarinas) como base para bocetos posteriores.
- Docencia y demostraciones de difusion: ejemplo didactico de como un modelo LCM con pocos pasos y sin VAE puede integrarse en scripts de inferencia reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 2,0 GB y el checkpoint de inferencia es un unico archivo `.pt`; con 859,5 millones de parametros en la U-Net, la huella en memoria es moderada, pero no se documenta una cifra de VRAM.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano de checkpoint (2,0 GB), es plausible ejecutarlo en GPUs de consumo, pero el autor no lo confirma.
- Cabe en consumer GPU: no confirmado; no disponible.
- Opciones de despliegue: el autor proporciona un script propio (`dreamshaper_dwd.py`) que se ejecuta con PyTorch y torchvision, instalando `diffusers==0.35.2`, `transformers==4.57.6` y `accelerate==1.11.0`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no aplicables directamente).
- Latencia y throughput estimados: no disponibles. La model card solo indica 8 pasos LCM y CFG 2 para la galeria de ejemplo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SD15 no-VAE DWD (este modelo) | 859.520.964 | 512x512, 8 pasos LCM | CreativeML Open RAIL-M | Hugging Face, diffusers + script propio | Prediccion directa de pixeles sin VAE |
| Lykon/dreamshaper-8-lcm (base) | no disponible | 512x512, LCM | CreativeML Open RAIL-M | Hugging Face, diffusers | Checkpoint base del que deriva; usa VAE |
| Stable Diffusion 1.5 | no disponible | 512x512 | CreativeML Open RAIL-M | Amplia disponibilidad | Modelo de referencia de la familia; usa VAE |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad; no recomendado para produccion sin evaluacion propia.
- Sesgos conocidos: no documentados por el autor; al derivar de Stable Diffusion 1.5 y DreamShaper, hereda los sesgos de esos datasets, no disponibles en esta ficha.
- Riesgo de alulcinacion visual: propia de los modelos de difusion; la prediccion directa de pixeles puede introducir artefactos distintos a los del VAE, no cuantificados.
- Limitaciones de contexto o idioma: sin datos sobre idiomas soportados; los ejemplos usan prompts en ingles. Resolucion de galeria limitada a 512x512.
- Restricciones de licencia: CreativeML Open RAIL-M impone restricciones de uso (prohibicion de usos daninos descritos en la licencia) y obligaciones de redistribucion; revisar el archivo LICENSE antes de uso comercial.
- Dependencias fijadas: requiere versiones concretas (`diffusers==0.35.2`, `transformers==4.57.6`, `accelerate==1.11.0`), lo que puede complicar la integracion en entornos existentes.
- La primera ejecucion de inferencia descarga componentes del repositorio, lo que introduce dependencia de red y latencia inicial.
- No hay informacion sobre cuantizacion ni sobre compatibilidad con herramientas estandar de despliegue de difusion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApacheOne/SD15_no_vae_dwd_trained
- Modelo base: https://huggingface.co/Lykon/dreamshaper-8-lcm
- Paper del metodo (Decoding Without a Decoder): https://arxiv.org/abs/2611.22287
- Licencia CreativeML Open RAIL-M: incluida en el repositorio como LICENSE
