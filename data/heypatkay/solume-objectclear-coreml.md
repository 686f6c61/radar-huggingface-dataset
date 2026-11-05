# heypatkay/solume-objectclear-coreml

## Resumen

Solume ObjectClear Core ML es una conversión a Core ML del modelo ObjectClear, un UNet de SDXL 1.0 Inpainting 0.1 afinado para eliminar un objeto de una imagen junto con su sombra o su reflejo. El modelo original procede de NTU S-Lab (Jixin Zhao, Shangchen Zhou, Zhouxia Wang, Peiqing Yang y Chen Change Loy) y se publica en el paper "ObjectClear: Complete Object Removal via Object-Effect Attention" (2025). Esta conversión la realiza Solume, una aplicación de fotografía para macOS, para alimentar su función Generative Remove.

El repositorio contiene exclusivamente los pesos convertidos, las licencias y la model card; no incluye fotos ni datos de usuario. La app descarga los ficheros de `objectclear/` desde un commit fijado y solo los instala si el tamano y el SHA-256 de cada fichero coinciden con los valores fijados. La conversión no ha reentrenado los pesos: solo cambia el formato (PyTorch safetensors a Core ML) y sustituye los codificadores de texto por embeddings precalculados de un prompt fijo.

La relevancia de esta ficha es doble: documenta una técnica de eliminación de objetos con efectos asociados (sombras y reflejos), y muestra un caso práctico de despliegue en el ecosistema Apple mediante Core ML, con UNet en fp16 y VAE en fp32. El uso es no comercial por la licencia S-Lab 1.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de SDXL 1.0 Inpainting 0.1 con atencion objeto-efecto (ObjectClear); VAE encoder/decoder SDXL; codificador de objeto CLIP ViT-L/14 con MLP post-fuse |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resoluciones de trabajo s512 y s1024) |
| Tipos de cuantizacion | fp16 (UNet y codificador de objeto), fp32 (VAE encoder y decoder) |
| Idiomas soportados | no disponible (el prompt de texto es fijo en ingles: "remove the instance of object") |
| Licencia | S-Lab License 1.0 (no comercial) sobre el modelo; CreativeML Open RAIL++-M sobre la base SDXL |
| Formato de pesos | Core ML ML Program (.mlpackage con weight.bin); origen PyTorch safetensors fp16 |

## Arquitectura y entrenamiento

El modelo es un UNet de SDXL 1.0 Inpainting 0.1 afinado para la eliminación de objetos. La innovación central es la atención objeto-efecto: el modelo recibe una máscara del objeto a borrar y una representación del propio objeto (codificador CLIP ViT-L/14 más un MLP post-fuse), de modo que aprende a eliminar no solo el objeto sino también su sombra o su reflejo. La conversión expone dos funciones del UNet, `s512` y `s1024`, que comparten un único fichero de pesos, y una segunda salida con el mapa de atención objeto-efecto.

En cuanto a los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO), la información disponible no los detalla. La conversión a Core ML se hizo con diffusers y coremltools (Python 3.12, torch 2.15.0, coremltools 9.0, diffusers 0.42.1, transformers 5.22.0, safetensors 0.8.0, numpy 2.5.4, macOS 27 sobre Apple silicon). El UNet y el codificador de objeto se convierten en fp16; el VAE en fp32 porque el VAE de SDXL desborda en fp16. Los dos codificadores de texto SDXL no se incluyen: en su lugar se envía `prompts.bin`, los embeddings precalculados del prompt fijo "remove the instance of object". El resultado es determinista para la cadena de herramientas fijada, con identificadores de Manifest y fecha de conversión fijos (2026-11-05).

## Capacidades

- Eliminación de objetos en imágenes (inpainting guiado por máscara), incluida la eliminación conjunta de sombras y reflejos asociados al objeto.
- Generación imagen a imagen condicionada por una máscara y por una representación visual del objeto (image prompt encoder).
- Dos resoluciones de trabajo integradas en el mismo paquete: `s512` y `s1024`.
- Segunda salida con el mapa de atención objeto-efecto, utilizable para inspección o para etapas posteriores.
- Inferencia en dispositivo mediante Core ML, sin dependencia de servidores.
- No dispone de tool calling, ni de razonamiento multi-paso, ni de capacidades multilingües de texto: el prompt está fijado y no se envía tokenizador ni codificador de texto.

## Casos de uso

- Retoque fotográfico en macOS: la app Solume usa el modelo para la función Generative Remove; el usuario pinta una máscara sobre el objeto y el modelo rellena la zona, incluida la sombra proyectada.
- Limpieza de catálogos de producto: eliminar objetos no deseados, sombras de atrezzo o reflejos en fotos de estudio antes de publicar en e-commerce, con inferencia local y sin subir imágenes a la nube.
- Edición de fotografía de inmuebles: borrar mobiliario, señales o reflejos en ventanas y espejos manteniendo la coherencia de la escena, gracias a la atención objeto-efecto.
- Preparación de datasets de visión: eliminar objetos y sus sombras de imágenes de entrenamiento para evitar sesgos o para generar pares sintéticos de aumento de datos.
- Fotografía de producto y publicidad: retirar cables, soportes y reflejos de superficies brillantes en tomas comerciales, con dos resoluciones (`s512` para iteración rápida y `s1024` para salida final).
- Integración en flujos de edición por lotes: al ser un paquete Core ML autocontenido y con pesos verificados por SHA-256, puede encadenarse en scripts de procesamiento por lotes en Apple silicon sin infraestructura de GPU externa.
- Investigación sobre eliminación de objetos: el mapa de atención objeto-efecto como segunda salida permite estudiar cómo el modelo localiza sombras y reflejos, y compararlo con métodos de inpainting genéricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (PSNR, LPIPS, FID) ni comparaciones con otros métodos de eliminación de objetos, y esta conversión no aporta mediciones propias de latencia o throughput.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el fichero de pesos del UNet ocupa 5.135.095.872 bytes (unos 4,8 GiB) en fp16; a ello se suman el VAE en fp32, el codificador de objeto fp16 y los embeddings de prompt (635.904 bytes). El consumo real en ejecución no está documentado; conviene prever varios GiB de memoria unificada en Apple silicon.
- GPU recomendadas: el formato Core ML está pensado para Apple silicon; el paquete no incluye variante CUDA. No se documentan modelos concretos de Apple (M1, M2, M3, M4 y variantes Pro/Max/Ultra) ni su compatibilidad verificada.
- GPU de consumo: no aplica en el ecosistema NVIDIA; el despliegue previsto es en equipos macOS con Apple silicon.
- Opciones de despliegue: Core ML (framework nativo de Apple), cargando los `.mlpackage` con coremltools o mediante la API Core ML; no hay indicación de soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto o resolucion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solume ObjectClear Core ML (esta ficha) | no disponible | s512 y s1024 | Eliminacion de objeto con sombra y reflejo; Core ML para macOS | S-Lab 1.0 (no comercial) + RAIL++-M | HuggingFace, paquete Core ML |
| jixin0101/ObjectClear (original) | no disponible | no disponible | Mismo metodo en PyTorch safetensors fp16 | S-Lab 1.0 (no comercial) | HuggingFace |
| SDXL 1.0 Inpainting 0.1 (base) | no disponible | SDXL estandar | Inpainting generico guiado por mascara, sin atencion objeto-efecto | CreativeML Open RAIL++-M | HuggingFace |

La comparación con otros métodos de eliminación de objetos (por ejemplo, variantes de inpainting especializadas) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: el modelo se rige por la S-Lab License 1.0; cualquier uso comercial o redistribución requiere permiso expreso de los autores de NTU S-Lab. La base SDXL añade la CreativeML Open RAIL++-M, con restricciones de uso del apartado 5 y del Anexo A que se aplican a todo uso y a los derivados.
- Prompt fijo: no se incluyen tokenizador ni codificadores de texto; el único prompt posible es "remove the instance of object". No se puede guiar el modelo con instrucciones de texto libres ni adaptarlo a otros idiomas.
- Conversión no validada por los autores: la model card indica que esta conversión no está hecha, afiliada ni respaldada por S-Lab, NTU, Stability AI ni Hugging Face.
- Riesgo de artefactos y alucinación visual: al ser un modelo generativo de inpainting, puede producir texturas inconsistentes, halos o reconstrucciones plausibles pero falsas en zonas complejas; no hay métricas publicadas que acoten este riesgo.
- Sesgos: no disponibles en la información proporcionada; al derivar de SDXL, puede heredar sesgos de su dataset de entrenamiento.
- Dependencia de la cadena de herramientas: la salida es determinista solo para la cadena fijada (torch 2.15.0, coremltools 9.0, diffusers 0.42.1, macOS 27); otras versiones pueden generar resultados distintos.
- Restricciones de plataforma: el paquete Core ML está orientado a Apple silicon; no hay artefactos para GPU NVIDIA ni para despliegue en servidores Linux.
- Verificación de integridad: la app comprueba tamano y SHA-256 de cada fichero; modificar o recomprimir los ficheros rompe la instalación.
- Datos de entrenamiento y benchmarks no documentados: no se puede evaluar la cobertura del dataset ni el rendimiento comparado con métodos alternativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heypatkay/solume-objectclear-coreml
- Modelo base en HuggingFace: https://huggingface.co/jixin0101/ObjectClear
- Repositorio de código de los autores: https://github.com/zjx0101/ObjectClear
- Base SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Paper "ObjectClear: Complete Object Removal via Object-Effect Attention" (2025), citado en la model card; no se proporciona URL directa en la información disponible.
- Repositorio de la app Solume y script de conversión `scripts/remove-models/convert_objectclear.py`: no se proporciona URL en la información disponible.
