# andrey556785656674/PiSA-SR-onnx

## Resumen

PiSA-SR-onnx es un paquete de modelos en formato ONNX publicado por el usuario andrey556785656674 para su uso en la aplicación Dream Camera, una app que descarga estos pesos desde su menú de ajustes. No se trata de un modelo de lenguaje ni de un modelo fundacional entrenado desde cero, sino de una colección de artefactos convertidos a ONNX a partir de varios proyectos de código abierto: el modelo de superresolución PiSA-SR sobre Stable Diffusion 2.1-base, el codificador de etiquetas MobileCLIP2-S0 de Apple, el autoencoder TAESD, el modelo de upscaling Real-ESRGAN Compact y el runtime QNN de Qualcomm para aceleración en NPU.

El repositorio ocupa 1,2 GB y se organiza en carpetas (`pisa_sr/`, `taesd/`, `fastsr/`, `npu/`) que agrupan componentes con licencias distintas, de ahí que la licencia global se declare como "mixed". Cada subconjunto conserva la licencia del modelo original del que fue convertido, lo que condiciona su reutilización: parte del contenido está bajo CreativeML Open RAIL++-M con restricciones de uso, otra bajo Apache-2.0, MIT, BSD-3-Clause y la licencia propia de Qualcomm para el runtime.

La relevancia de este repositorio es práctica y acotada: sirve como distribución de pesos para una app concreta de cámara con funciones de restauración y superresolución de imagen, no como un modelo para evaluación genérica. No hay información publicada sobre arquitectura de lenguaje, contexto, idiomas, benchmarks ni pipeline de HuggingFace, por lo que la ficha se limita a documentar lo que la model card declara explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como modelo único; el paquete agrupa una UNet y VAE de Stable Diffusion 2.1-base (PiSA-SR), un codificador MobileCLIP2-S0, TAESD y Real-ESRGAN Compact |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible; los artefactos se distribuyen en ONNX y binarios auxiliares (`.bin`) |
| Idiomas soportados | No disponible |
| Licencia | Mixta ("mixed"): PiSA-SR código Apache-2.0; pesos SD 2.1 y derivados CreativeML Open RAIL++-M; MobileCLIP2-S0 Apple AMLR; TAESD MIT; Real-ESRGAN BSD-3-Clause; QNN runtime con licencia de Qualcomm |
| Formato de pesos | ONNX (`.onnx`) y binarios auxiliares (`.bin`) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado de forma unificada, sino conversiones a ONNX de varios componentes. La parte principal, `pisa_sr/`, deriva de PiSA-SR (csslc/PiSA-SR), un método de superresolución construido sobre Stable Diffusion 2.1-base: incluye la UNet (`pisa_unet_*`), el VAE (`pisa_vae_*`) y los embeddings del text encoder en forma de binarios (`pisa_empty_sd.bin`, `pisa_tag_sd.bin`). El codificador de etiquetas (`pisa_tagger.onnx`, `pisa_tag_clip.bin`) procede de Apple MobileCLIP2-S0.

El resto del paquete son componentes auxiliares de inferencia y aceleración: `taesd/` contiene el autoencoder TAESD de madebyollin, `fastsr/` incluye Real-ESRGAN Compact (realesr-general-x4v3 con wdn y denoise 0.5) y `npu/` incorpora el runtime QNN 2.42 de Qualcomm con compilador de grafos HTP y esqueletos NPU V68–V81, tal como se distribuye en el paquete Android de qnn-runtime. No se dispone de información sobre el número de tokens, la composición del dataset de entrenamiento ni sobre si se aplicaron técnicas de RLHF o DPO, ya que no se trata de un modelo de lenguaje y la model card no detalla el proceso de entrenamiento de los modelos originales.

## Capacidades

- Superresolución y restauración de imagen mediante PiSA-SR sobre Stable Diffusion 2.1-base.
- Etiquetado y codificación de imagen/texto mediante MobileCLIP2-S0 (utilizable para condicionamiento por prompt o clasificación de etiquetas).
- Compresión y decodificación rápida de latentes con TAESD.
- Upscaling rápido de imagen con Real-ESRGAN Compact (factor x4, con reducción de ruido configurada a 0.5).
- Aceleración en NPU Qualcomm mediante el runtime QNN incluido (grafos HTP, esqueletos V68–V81).
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Restauración de fotografías en una app móvil: el componente PiSA-SR permite aplicar superresolución y mejora de detalle a imágenes capturadas por el usuario, integrándose en el flujo de la app Dream Camera a través de los modelos ONNX descargados desde ajustes.
- Upscaling rápido en dispositivo: Real-ESRGAN Compact ofrece un aumento x4 con bajo coste computacional, adecuado para previsualizaciones o procesado en tiempo real en móviles de gama media.
- Aceleración en NPU de smartphones Android: la carpeta `npu/` con el runtime QNN 2.42 y los esqueletos HTP V68–V81 permite ejecutar los grafos en la NPU de dispositivos Qualcomm, reduciendo consumo y latencia frente a CPU/GPU.
- Condicionamiento por texto en edición de imagen: el tagger MobileCLIP2-S0 y los embeddings del text encoder permiten asociar etiquetas o prompts a la imagen para guiar la restauración o el estilo.
- Decodificación rápida de latentes en pipelines de difusión: TAESD sustituye al VAE completo en tareas donde se prioriza velocidad sobre fidelidad máxima, útil en iteraciones de previsualización.
- Distribución de pesos para apps de terceros: el repositorio sirve como CDN de modelos ONNX para integraciones que necesiten los mismos artefactos que Dream Camera, respetando las licencias por componente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del componente ejecutado (la UNet de SD 2.1-base es el más exigente, el resto son modelos ligeros).
- GPU recomendadas: no disponible en la model card; por el tipo de artefactos (ONNX + QNN), el objetivo declarado es la ejecución en dispositivos Android con NPU Qualcomm.
- Cabe en GPU de consumo: no disponible; los componentes ligeros (TAESD, Real-ESRGAN Compact, MobileCLIP2-S0) son aptos para hardware modesto, pero no se publican cifras.
- Opciones de despliegue: ONNX Runtime y el runtime QNN 2.42 de Qualcomm incluido en `npu/`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|
| PiSA-SR-onnx (este repo) | Paquete ONNX de superresolución y utilidades | 1,2 GB (repo) | Mixta | HuggingFace |
| PiSA-SR (csslc/PiSA-SR) | Superresolución sobre SD 2.1-base | No disponible | Apache-2.0 (código) | Repositorio original |
| Real-ESRGAN (xinntao) | Superresolución x4 | No disponible | BSD-3-Clause | Repositorio original |
| TAESD (madebyollin) | Autoencoder rápido | No disponible | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia mixta: los pesos derivados de Stable Diffusion 2.1 están sujetos a CreativeML Open RAIL++-M, que impone restricciones de uso; el resto de componentes tienen licencias distintas (Apache-2.0, MIT, BSD-3-Clause, AMLR, Qualcomm), por lo que un uso comercial requiere revisar cada subcarpeta.
- El repositorio no es un modelo de lenguaje: no admite prompts de texto libre, tool calling ni razonamiento multi-paso.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de calidad; al ser modelos de imagen, los riesgos se refieren a artefactos visuales y fidelidad de la restauración.
- No hay información sobre idiomas ni sobre el pipeline de HuggingFace, lo que limita su uso automatizado desde la librería `transformers`.
- El runtime QNN de Qualcomm está pensado para hardware concreto (NPU V68–V81); fuera de esos dispositivos no será utilizable.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validación por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/andrey556785656674/PiSA-SR-onnx
- PiSA-SR (origen): https://github.com/csslc/PiSA-SR
- MobileCLIP2-S0 (Apple): https://github.com/apple/ml-mobileclip
- TAESD: https://huggingface.co/madebyollin/taesd
- Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Stable Diffusion 2.1-base: https://huggingface.co/stabilityai/stable-diffusion-2-1-base
