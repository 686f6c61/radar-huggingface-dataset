# davidb727/sdxl-turbo-int8

## Resumen

SDXL Turbo ONNX int8 es una copia cuantizada a int8 del export ONNX de `stabilityai/sdxl-turbo`, un modelo de difusion texto-a-imagen de la familia Stable Diffusion XL optimizado para generacion en un solo paso. Lo publica el usuario davidb727 como artefacto auxiliar del proyecto Asterism, un generador de imagenes por CPU que solo depende de ONNX Runtime y NumPy, sin PyTorch ni aceleracion GPU.

El modelo base, desarrollado por Stability AI, emplea la tecnica Adversarial Diffusion Distillation (ADD) para reducir el numero de pasos de inferencia a uno solo a 512 px, manteniendo la arquitectura de SDXL (UNet con bloques de atencion, doble text encoder CLIP y VAE). Esta version int8 conserva esa arquitectura pero sustituye los pesos de las operaciones MatMul del UNet y del segundo text encoder por enteros de 8 bits con cuantizacion dinamica.

Su relevancia es acotada pero concreta: permite ejecutar un generador texto-a-imagen de calidad SDXL en entornos sin GPU, con un repositorio de 6,2 GB, y con verificacion de procedencia criptografica (SHA-256 por fichero y `conversion.json` reproducible). No es un modelo nuevo ni un fine-tune: es un artefacto de despliegue derivado, con licencia de Stability AI y cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (UNet + VAE + doble text encoder CLIP), exportada a ONNX |
| Parametros totales | no disponible (el repositorio no publica recuento; el modelo base SDXL ronda los 2,6 B en UNet y 3,5 B en el conjunto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (prompt de texto; limite practico de 77 tokens por encoder CLIP) |
| Tipos de cuantizacion | int8 dinamico en pesos de MatMul del UNet y de `text_encoder_2`; resto de componentes en su precision original |
| Idiomas soportados | no disponible (el prompt se procesa con tokenizadores CLIP; el modelo base esta entrenado mayoritariamente en ingles) |
| Licencia | Stability AI Community License (`stability-ai-community-license`), con condiciones de uso comercial |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`) |

## Arquitectura y entrenamiento

El modelo base SDXL Turbo es un modelo de difusion latente con un UNet de tres etapas (encoder, bottleneck y decoder) con bloques ResNet y atencion cruzada, un VAE para codificar y decodificar entre espacio de pixeles y latente, y dos text encoders CLIP (uno de ellos OpenCLIP ViT-bigG). SDXL Turbo se entrena con Adversarial Diffusion Distillation, que combina una perdida adversarial con una perdida de destilacion para permitir muestreo en un unico paso; el resultado es un modelo que genera imagenes de 512x512 con una sola evaluacion del UNet.

Esta copia no reentrena nada: parte del export ONNX del repositorio `stabilityai/sdxl-turbo` en la revision `71153311d3dbb46851df1931d3ca6e939de83304` y aplica cuantizacion dinamica int8 a los pesos de las operaciones MatMul del UNet (excluyendo los nodos `attn2/to_k` y `attn2/to_v`, presumiblemente para preservar calidad en la atencion cruzada) y del `text_encoder_2`. El resto de ficheros (VAE decoder, primer text encoder, tokenizadores y scheduler) se copian sin modificar. La conversion es determinista y verificable con el script `apps/backend/scripts/convert_onnx_image_model.py` del proyecto Asterism, fijando versiones (onnx 1.23.2, onnxruntime 1.32.0, numpy 2.5.5, huggingface_hub 2.4.0, Python 3.13.13) y comparando `conversion.json`.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512x512 en un unico paso de difusion.
- Inferencia en CPU con solo ONNX Runtime y NumPy, sin PyTorch ni CUDA.
- Control de la generacion mediante prompt de texto procesado por doble tokenizador CLIP.
- Uso de scheduler configurable a traves de `scheduler/scheduler_config.json`.
- Reproducibilidad criptografica: cada fichero incluye su SHA-256 y el proceso de conversion es determinista.
- No soporta tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio.
- Capacidades multilingues: no documentadas; el modelo base esta orientado a prompts en ingles.

## Casos de uso

- Generacion de imagenes en servidores sin GPU: el formato ONNX int8 y la dependencia exclusiva de ONNX Runtime permiten desplegar un generador texto-a-imagen en instancias CPU de bajo coste, algo inviable con el modelo en fp16.
- Prototipado rapido de pipelines de imagen: al requerir un solo paso y no necesitar PyTorch, se puede integrar en scripts Python minimos para validar ideas antes de invertir en infraestructura GPU.
- Herramientas de escritorio o CLI: el proyecto Asterism lo usa como motor de un generador de imagenes local; cualquier aplicacion de escritorio puede empaquetar ONNX Runtime y este repositorio para generar ilustraciones sin conexion.
- Generacion de miniaturas y assets de baja resolucion: 512x512 en un paso es adecuado para placeholders, avatares o imagenes de previsualizacion en pipelines de contenido.
- Entornos con requisitos de auditabilidad: la cadena de hashes SHA-256 y `conversion.json` permiten verificar que los pesos derivan exactamente del modelo base oficial, util en entornos con controles de supply chain.
- Investigacion sobre cuantizacion: sirve como referencia para estudiar el impacto del int8 dinamico en un UNet de difusion, comparando contra el export ONNX original en fp16/fp32.
- Educacion y demos offline: al caber en un portatil sin GPU dedicada, permite demostrar difusion latente en aulas o talleres sin hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (FID, CLIP score) ni comparaciones con el export ONNX sin cuantizar, por lo que no es posible cuantificar la perdida de calidad introducida por el int8.

## Requisitos de hardware

- VRAM: no aplica para inferencia en CPU; en GPU, el repositorio de 6,2 GB requiere al menos unos 8 GB de VRAM si se carga completo en memoria, aunque no se documenta soporte GPU.
- GPU recomendadas: no disponible; el artefacto esta disenado para CPU via ONNX Runtime.
- GPU consumer: no es el objetivo del artefacto; en teoria cabria en tarjetas con 8 GB o mas, pero sin garantias del autor.
- RAM del sistema: la model card senala que la conversion original necesita decenas de GB de memoria, lo que sugiere que la inferencia tambien requiere un volumen de RAM considerable (no cuantificado).
- Opciones de despliegue: ONNX Runtime (CPU) con pipeline NumPy; el script de Asterism (`apps/backend/scripts/convert_onnx_image_model.py`) documenta el flujo de conversion.
- Latencia y throughput: no disponibles; dependen fuertemente de la CPU y no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/pasos | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| davidb727/sdxl-turbo-int8 | no disponible (base SDXL) | 1 paso, 512 px | ONNX int8 | Stability AI Community License | Hugging Face, 0 descargas |
| stabilityai/sdxl-turbo | no disponible (base SDXL) | 1 paso, 512 px | safetensors/diffusers | Stability AI Community License | Hugging Face, oficial |
| stabilityai/stable-diffusion-xl-base-1.0 | no disponible (base SDXL) | 20-50 pasos, 1024 px | safetensors/diffusers | CreativeML Open RAIL++-M | Hugging Face, oficial |
| SD-Turbo (stabilityai/sd-turbo) | no disponible (base SD 2.1) | 1 paso, 512 px | safetensors/diffusers | Stability AI Community License | Hugging Face, oficial |

La comparativa se limita a modelos de la misma familia porque la informacion proporcionada no incluye alternativas ONNX int8 equivalentes. Frente a `sdxl-turbo` original, esta version anade portabilidad a CPU a costa de una posible perdida de calidad por cuantizacion; frente a SDXL base, sacrifica resolucion (512 frente a 1024 px) y control fino a cambio de velocidad en un paso.

## Limitaciones y advertencias

- Es un artefacto derivado, no un modelo entrenado: su calidad esta acotada por SDXL Turbo y degradada potencialmente por la cuantizacion int8, sin metricas publicadas que lo cuantifiquen.
- Resolucion fija de 512x512 y un solo paso: poca capacidad de refinamiento y menor detalle que pipelines multi-paso a 1024 px.
- Prompts en ingles como caso principal; el comportamiento multilingue no esta documentado.
- Riesgo de sesgos heredados del dataset de entrenamiento de SDXL (representacion, estereotipos) y de alucinacion visual (artefactos, anatomia incorrecta, texto ilegible).
- Licencia Stability AI Community License: uso gratuito para investigacion y uso no comercial; el uso comercial requiere registro y esta limitado a organizaciones con ingresos anuales inferiores a 1 millon de dolares, segun la model card.
- Cero descargas y cero likes en el momento de la ficha: no hay validacion comunitaria ni evidencia de uso en produccion.
- El autor no publica benchmarks, latencias ni requisitos de RAM medidos; el rendimiento real en CPU es desconocido.
- Dependencia de versiones concretas de ONNX Runtime y NumPy para reproducir la conversion; cambios de version pueden alterar el resultado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/davidb727/sdxl-turbo-int8
- Modelo base: https://huggingface.co/stabilityai/sdxl-turbo
- Revision del modelo base: https://huggingface.co/stabilityai/sdxl-turbo/tree/71153311d3dbb46851df1931d3ca6e939de83304
- Proyecto Asterism: https://github.com/dbracewell/Asterism
- Licencia del modelo base: https://huggingface.co/stabilityai/sdxl-turbo/raw/71153311d3dbb46851df1931d3ca6e939de83304/LICENSE.md
