# momoapps/optimix-models

## Resumen

OptiMix models es un repositorio de pesos ONNX que la aplicacion Android OptiMix (`com.momoapps.optimix`, desarrollada por MomoApps) descarga bajo demanda en el primer uso. No se trata de un modelo fundacional unico, sino de una coleccion de seis pesos especializados en tareas de imagen: restauracion de rostros (GFPGAN v1.4), superresolucion generica x4 (Real-ESRGAN general x4v3), segmentacion de objetos salientes para eliminacion de fondo (U²-Net y U²-Netp) y colorizacion de fotografias (DDColor-T). Todos los archivos son espejos o derivados de pesos de terceros publicados bajo licencias permisivas (Apache-2.0 y BSD-3-Clause).

La relevancia de este repositorio es practica: ofrece los artefactos ya exportados a ONNX, en algunos casos cuantizados a INT8, con contratos de entrada y salida documentados y hashes SHA-256 para verificacion. Esto permite a desarrolladores integrar estas capacidades en aplicaciones moviles o de escritorio sin tener que reproducir el proceso de exportacion desde PyTorch. El tamano total del repositorio es de aproximadamente 0,7 GB, y cada archivo esta pensado para ejecutarse en el dispositivo mediante ONNX Runtime, incluida su variante Android.

Conviene subrayar que el autor no aporta nuevos pesos ni nuevos terminos de licencia: cada archivo conserva la licencia de su proyecto upstream. El repositorio funciona, por tanto, como un canal de distribucion curado y verificable, no como un modelo entrenado por MomoApps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion heterogenea: GFPGAN v1Clean (StyleGAN con convoluciones moduladas) para restauracion facial; SRVGGNetCompact para superresolucion; U²-Net (encoder-decoder con RSU) para matting; DDColor-T (encoder ConvNeXt-T + decodificador multiescala) para colorizacion |
| Parametros totales | No disponible por archivo; el repo pesa 0,7 GB en total. El archivo mayor es `ddcolor-paper-tiny.onnx` (220.552.834 bytes, fp32) y el menor `u2netp.onnx` (4.574.861 bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelos de imagen, no de texto) |
| Tipos de cuantizacion | INT8 solo de pesos (weight-only, per-channel) en `gfpgan-v1.4-int8.onnx` y `ddcolor-paper-tiny-int8.onnx`; fp16 con I/O fp32 en `gfpgan-v1.4.onnx`; fp32 en el resto. El computo en los modelos INT8 se mantiene en float32 |
| Idiomas soportados | No disponible (no procesan lenguaje) |
| Licencia | Mixta: Apache-2.0 (GFPGAN, U²-Net, DDColor) y BSD-3-Clause (Real-ESRGAN). El repositorio no anade terminos nuevos |
| Formato de pesos | ONNX (opset 17 en DDColor; opset 13+ para las capas `DequantizeLinear` de los INT8) |

## Arquitectura y entrenamiento

Cada archivo corresponde a una arquitectura distinta, sin entrenamiento conjunto ni destilacion entre ellos. GFPGAN v1.4 emplea un generador StyleGAN con convoluciones moduladas para restaurar rostros alineados de 512×512; la variante INT8 cuantiza solo los pesos, incluidos los kernels de convolucion modulada, manteniendo el computo en float. Real-ESRGAN general x4v3 usa SRVGGNetCompact, una red compacta de superresolucion con escala fija x4 y dimensiones de entrada dinamicas. U²-Net y U²-Netp son redes encoder-decoder con bloques RSU para segmentacion de objetos salientes; la version `p` es la variante pequena. DDColor-T combina un encoder ConvNeXt-T con un decodificador de color multiescala; en la exportacion se pliegan ocho capas de normalizacion espectral en pesos planos, operacion exacta en modo evaluacion, y se exporta con `torch.onnx.export` sobre torch 2.15.0.

No hay informacion sobre volumen de datos de entrenamiento, composicion de los datasets ni uso de RLHF o DPO, ya que se trata de pesos de terceros y la model card solo documenta el proceso de exportacion y cuantizacion. La innovacion tecnica destacable es de ingenieria: exportaciones ONNX verificadas con hashes, cuantizacion INT8 de pesos con escalas por canal de salida y validacion empirica de la deriva (en DDColor INT8, diferencia media de a/b de 0,41 y 0,32 frente al modelo fp32 en dos fotos de prueba).

## Capacidades

- Restauracion de rostros: GFPGAN v1.4 corrige degradaciones en recortes faciales alineados de 512×512, con salida en el mismo espacio de color (−1..1).
- Superresolucion x4: Real-ESRGAN general x4v3 amplia imagenes de cualquier resolucion (H y W dinamicas) por un factor de 4, con salida que debe recortarse a 0..1.
- Eliminacion de fondo: U²-Net y U²-Netp generan una matte de objeto saliente; la variante completa es la opcion HD y la `p` la predeterminada por su menor tamano.
- Colorizacion de fotografias: DDColor-T predice los canales Lab a y b a partir del canal L, permitiendo colorear imagenes en escala de grises.
- Ejecucion en dispositivo: todos los archivos estan en ONNX y son compatibles con ONNX Runtime, incluida la variante Android; los INT8 reducen el peso a aproximadamente un tercio del fp32 en DDColor (56,6 MB frente a 220,6 MB).
- Verificabilidad: cada archivo incluye SHA-256 y se recomienda fijar un commit en la URL de descarga.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Restauracion de fotos antiguas en apps moviles: se detecta y alinea el rostro, se recorta a 512×512, se pasa por `gfpgan-v1.4-int8.onnx` (85,6 MB) y se recompone sobre la imagen original; la variante INT8 reduce el peso descargable y es adecuada para telefonos de gama media.
- Mejora de miniaturas y fotos de perfil: `realesr-general-x4v3.onnx` (4,9 MB) permite escalar x4 imagenes de usuario con entrada dinamica, ideal para previsualizaciones de baja resolucion en galerias o redes sociales.
- Eliminacion de fondo para fotos de producto: `u2netp.onnx` (4,6 MB) genera la matte en el dispositivo sin enviar la imagen a un servidor, lo que simplifica el cumplimiento de privacidad en comercio electronico.
- Recorte HD para impresion o catalogos: `u2net.onnx` (176 MB) ofrece mayor fidelidad en la matte cuando el dispositivo dispone de memoria suficiente y la calidad prima sobre el tamano de descarga.
- Colorizacion de archivos historicos: `ddcolor-paper-tiny-int8.onnx` (56,6 MB) colorea fotos en blanco y negro siguiendo el contrato Lab documentado; util en aplicaciones de patrimonio, genealogia o edicion fotografica.
- Pipeline de preprocesado por lotes en escritorio: los seis modelos pueden encadenarse con ONNX Runtime en un servidor para restaurar, escalar, recortar y colorear imagenes antes de publicarlas, con verificacion de SHA-256 en la carga.
- Integracion en apps Android con ORT Mobile: si se usa una build reducida de operadores, debe incluirse `Einsum`, `Erf`, `LayerNormalization` y `DequantizeLinear` (opset 13+, por eje) para que DDColor funcione.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la deriva de cuantizacion de DDColor INT8 frente a fp32: diferencia media de a/b de 0,41 y 0,32 en dos fotos de prueba, visualmente indistinguible salvo por artefactos de borde ya presentes en el modelo float.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por tamano de pesos, GFPGAN INT8 (~85 MB) y U²-Netp (~4,6 MB) caben holgadamente en cualquier GPU consumer; DDColor fp32 (~220 MB) y U²-Net completo (~176 MB) tambien, con margen para activaciones a 512×512.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (CUDA o DirectML); para movil, GPU integrada via NNAPI o el backend de ORT Android. No se especifican modelos concretos como A100, H100 o RTX 4090 porque el perfil de carga no lo requiere.
- Cabe en GPU consumer: si, todos los archivos; el mayor (DDColor fp32) ronda los 220 MB de pesos.
- Opciones de despliegue: ONNX Runtime (escritorio, servidor y Android), con atencion a las builds reducidas de operadores; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OptiMix models (este repo) | 6 archivos ONNX, 0,7 GB total | No aplica | Sin benchmarks publicados; deriva INT8 documentada en DDColor | Mixta Apache-2.0 / BSD-3-Clause | Hugging Face, descarga bajo demanda |
| GFPGAN v1.4 original (TencentARC) | Pesos PyTorch `.pth` | No aplica | Referencia upstream de restauracion facial | Apache-2.0 | GitHub releases |
| Real-ESRGAN original (xinntao) | Pesos PyTorch `.pth` | No aplica | Referencia upstream de superresolucion | BSD-3-Clause | GitHub releases |
| DDColor original (piddnad) | Pesos PyTorch (`ddcolor_paper_tiny`) | No aplica | Referencia upstream de colorizacion | Apache-2.0 | Hugging Face y GitHub |

La comparativa relevante no es de rendimiento sino de formato: OptiMix ofrece los mismos pesos en ONNX listos para inferencia en dispositivo, con cuantizacion INT8 opcional, frente a los pesos PyTorch originales que requieren exportacion previa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de NLP.
- Los sesgos de los pesos originales (por ejemplo, en la deteccion de rostros o de objetos salientes) se heredan sin cambios; no se documentan evaluaciones de sesgo.
- Riesgo de artefactos: la model card senala artefactos de borde en DDColor float que persisten en la version INT8; GFPGAN puede generar rasgos faciales sinteticos en rostros muy degradados.
- La cuantizacion INT8 es solo de pesos y el computo sigue en float32, por lo que el ahorro es de almacenamiento y ancho de banda, no necesariamente de tiempo de inferencia.
- Restricciones de licencia: cada archivo conserva su licencia upstream (Apache-2.0 o BSD-3-Clause); el repositorio no anade terminos, pero el uso comercial debe cumplir la licencia del archivo concreto y citar a los autores originales.
- Dependencia de operadores: las builds reducidas de ONNX Runtime Mobile deben incluir `Einsum`, `Erf`, `LayerNormalization` y `DequantizeLinear`, o DDColor fallara en tiempo de ejecucion.
- Buenas practicas de carga: fijar un commit en la URL (`/resolve/<commit>/<file>`) y verificar el SHA-256 antes de cargar, tal como recomienda el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/momoapps/optimix-models
- GFPGAN (TencentARC), release v1.3.0: https://github.com/TencentARC/GFPGAN/releases/tag/v1.3.0
- GFPGAN, tag v1.3.4 (arquitectura `GFPGANv1Clean`): https://github.com/TencentARC/GFPGAN/releases/tag/v1.3.4
- Conversion ONNX de GFPGAN v1.4 (sidkonduru): https://huggingface.co/sidkonduru/gfpgan-v1.4-onnx
- Real-ESRGAN (xinntao), release v0.2.5.0: https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0
- Exportacion ONNX de Real-ESRGAN general x4v3 (vlad-grig): https://huggingface.co/vlad-grig/realesr-general-x4v3-onnx
- rembg (danielgatis), release con `u2net.onnx` y `u2netp.onnx`: https://github.com/danielgatis/rembg/releases/tag/v0.0.0
- U²-Net (xuebinqin): https://github.com/xuebinqin/U-2-Net
- Pesos DDColor-T (piddnad): https://huggingface.co/piddnad/ddcolor_paper_tiny
- Repositorio DDColor (piddnad): https://github.com/piddnad/DDColor
