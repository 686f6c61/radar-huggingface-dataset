# davidb727/lcm-dreamshaper-v7-int8

## Resumen

`davidb727/lcm-dreamshaper-v7-int8` es una copia cuantizada a int8 del export ONNX del modelo de difusion texto-a-imagen SimianLuo/LCM_Dreamshaper_v7, publicado por el usuario davidb727. El modelo original combina la destilacion de Latent Consistency Models (LCM) sobre DreamShaper 7, que a su vez deriva de Stable Diffusion 1.5. El objetivo de esta version es permitir la generacion de imagenes en CPU con un pipeline minimo basado en ONNX Runtime y NumPy, sin necesidad de GPU ni de frameworks de deep learning completos.

La modificacion respecto al original es acotada: solo el UNet se ha convertido a pesos int8 dinamicos para las operaciones MatMul y Conv. El resto de componentes (text encoder, VAE decoder, tokenizer y scheduler) se copian sin cambios. El modelo esta pensado para generar imagenes de 512 px en 4 pasos de inferencia, lo que lo hace adecuado para entornos con recursos limitados.

Es relevante por su enfoque de despliegue: cuantizacion int8, formato ONNX y ejecucion en CPU lo sitúan en el nicho de la generacion de imagenes local y ligera, con un pipeline reproducible y verificable mediante hashes SHA-256 documentados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion latente (Stable Diffusion 1.5) con destilacion LCM; export ONNX con cuantizacion int8 en el UNet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin ventana de contexto de texto) |
| Tipos de cuantizacion | int8 dinamico en pesos de MatMul y Conv del UNet; resto de componentes sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | creativeml-openrail-m |
| Formato de pesos | ONNX (`model.onnx` y `model.onnx.data`) |
| Tamano del repo | 1.6 GB |
| Pasos de inferencia | 4 pasos a 512 px |
| Libreria | onnx |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de difusion latente de Stable Diffusion 1.5: un UNet que opera sobre representaciones latentes, un text encoder para condicionamiento textual y un VAE decoder para reconstruir la imagen. Sobre esta base, el modelo original LCM_Dreamshaper_v7 aplica destilacion de consistencia latente (Latent Consistency Model), que reduce el numero de pasos de muestreo necesarios a muy pocos (4 en esta version). DreamShaper 7 aporta el ajuste fino estetico sobre SD 1.5.

Esta copia concreta no reentrena ni modifica el modelo: solo cuantiza el UNet a int8 dinamico para MatMul y Conv, manteniendo el resto de archivos intactos. La conversion es determinista y reproducible con las versiones de herramientas indicadas en la model card (onnx 1.23.2, onnxruntime 1.32.0, numpy 2.5.5, huggingface_hub 2.4.0, python 3.13.13). No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento original, numero de tokens ni procesos de RLHF o DPO.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512 px.
- Inferencia en 4 pasos gracias a la destilacion LCM.
- Ejecucion en CPU mediante ONNX Runtime y un pipeline NumPy.
- Cuantizacion int8 del UNet para reducir requisitos de memoria y computo.
- Reproducibilidad verificable mediante hashes SHA-256 y `conversion.json`.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento.

## Casos de uso

- Generacion de imagenes local en CPU: el modelo permite crear imagenes de 512 px en 4 pasos sin GPU, usando solo ONNX Runtime y NumPy, adecuado para estaciones de trabajo sin acelerador.
- Prototipado rapido de pipelines texto-a-imagen: al ser ONNX y reproducible, sirve para validar integraciones antes de escalar a versiones mayores o a GPU.
- Aplicaciones de escritorio o de borde: el tamano de 1.6 GB y la ejecucion en CPU facilitan su empaquetado en herramientas locales de creacion de imagenes.
- Generacion por lotes en servidores sin GPU: la cuantizacion int8 reduce el coste de memoria frente al modelo en precision completa, permitiendo procesar lotes en hardware convencional.
- Educacion y experimentacion: la trazabilidad de hashes y el script de conversion documentado permiten estudiar el proceso de cuantizacion ONNX de un modelo de difusion.
- Integracion en el generador de imagenes de Asterism: el modelo fue creado especificamente para el pipeline de CPU de ese proyecto (ADR-0077).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo esta disenado para ejecucion en CPU.
- GPU recomendadas: no disponible; el enfasis del autor es la inferencia en CPU.
- Cabe en GPU consumer: no disponible como dato verificado; el formato ONNX int8 podria ejecutarse en GPU, pero no se documenta.
- Opciones de despliegue: ONNX Runtime con pipeline NumPy; el script `apps/backend/scripts/convert_onnx_image_model.py` de Asterism permite reproducir la conversion.
- Latencia y throughput: no disponibles; solo se indica que la generacion se realiza en 4 pasos a 512 px.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| lcm-dreamshaper-v7-int8 (este) | no disponible | 512 px, 4 pasos | int8 en UNet | creativeml-openrail-m | ONNX |
| SimianLuo/LCM_Dreamshaper_v7 | no disponible | 512 px, 4 pasos | sin cuantizar | MIT (pesos derivados de SD 1.5, CreativeML Open RAIL-M) | safetensors / diffusers |
| Stable Diffusion 1.5 | no disponible | 512 px, 20-50 pasos tipicos | multiple | CreativeML Open RAIL-M | safetensors / diffusers |

Los datos de parametros y rendimiento de los modelos comparables no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia efectiva es CreativeML Open RAIL-M, con restricciones de uso basadas en el uso previsto; no debe tratarse como MIT pese al etiquetado del repositorio original.
- Al derivar de Stable Diffusion 1.5 y DreamShaper 7, hereda los sesgos y limitaciones de esos modelos, incluyendo sesgos de representacion en la generacion de personas.
- Riesgo de alucinacion visual y artefactos propios de la difusion latente, especialmente con prompts ambiguos o poco representados.
- La cuantizacion int8 puede degradar la calidad de imagen frente al modelo en precision completa; no se documenta una evaluacion cuantitativa de esa perdida.
- No se documentan idiomas soportados; el text encoder procede de SD 1.5, con cobertura principalmente en ingles.
- Resolucion fija de 512 px y 4 pasos; no se documentan variantes de resolucion o pasos.
- El repositorio tiene 0 descargas y 0 likes, sin validacion comunitaria publica.
- Para uso comercial deben revisarse las restricciones de uso de CreativeML Open RAIL-M.

## Enlaces

- Hugging Face: https://huggingface.co/davidb727/lcm-dreamshaper-v7-int8
- Modelo base: https://huggingface.co/SimianLuo/LCM_Dreamshaper_v7
- Repositorio Asterism: https://github.com/dbracewell/Asterism
- Texto de licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license/raw/14d42d09bffd871b1666a084fc954a50cff72ac0/license.txt
