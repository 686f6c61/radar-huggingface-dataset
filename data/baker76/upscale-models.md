# baker76/upscale-models

## Resumen

`baker76/upscale-models` es un repositorio de Hugging Face que agrupa 22 modelos de superresolucion de imagen (upscaling) convertidos al formato ONNX. No es un modelo unico: es una coleccion de pesos de distintos autores (Real-ESRGAN, Swin2SR, SwinIR, APISR, BSRGAN, AnimeSharp, UltraSharp y otros) que benbaker76 ha exportado a ONNX mediante el script `python/export_onnx.py` del proyecto UpsizerAI. El objetivo es servir como backend de los archivos que consumen bajo demanda las aplicaciones Upscale Agent (escritorio) y UpsizerAI (web).

Los modelos cubren factores de escala x2, x4 y x8, y emplean arquitecturas diversas: RRDBNet, RRDBNet-6B, ESRGAN, SRVGGNetCompact, Swin2SR, SwinIR-M, MoSR, RealPLKSR, GRL y RGT. Cada archivo se ofrece en dos precisiones en la mayoria de los casos: float32 (`<name>.onnx`) y float16 (`<name>_fp16.onnx`, con entrada y salida en float32), con una diferencia visual de como maximo un nivel de 8 bits. El tamano del repositorio es de 1,7 GB y los archivos individuales van desde 2,5 MB hasta 92,3 MB.

Es relevante porque estandariza la interfaz de entrada y salida (mismo opset y mismos nombres de tensor) y hace dinamicas las dimensiones de altura y anchura, lo que permite procesar la imagen completa o por teselas. Conviene subrayar que ningun modelo fue entrenado por esta organizacion: cada archivo es una conversion y conserva la licencia original de sus pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiple: RRDBNet, RRDBNet-6B, ESRGAN, SRVGGNetCompact, Swin2SR, SwinIR-M, MoSR, RealPLKSR, GRL, RGT |
| Parametros totales | no disponible (no se publican recuentos de parametros; los pesos fp32 por archivo van de 5,0 MB a 92,3 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision de imagen a imagen) |
| Tipos de cuantizacion | float32 (`.onnx`) y float16 (`_fp16.onnx`); la variante fp16 mantiene entrada y salida en float32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible a nivel de repositorio; cada modelo mantiene la licencia de sus pesos originales (algunos restringen uso comercial) |
| Formato de pesos | ONNX |
| Numero de modelos incluidos | 22 |
| Factores de escala | x2, x4, x8 |
| Formato de entrada | tensor `[1, 3, H, W]` float32, RGB, rango 0 a 1 |
| Formato de salida | mismo layout de entrada, escalado por el factor del modelo |
| Restricciones de dimension | los RRDBNet x2 requieren lados pares; los modelos de atencion por ventana requieren lados multiplos de 8 o 32 |

Relacion completa de modelos incluidos:

| Modelo | Escala | fp32 | fp16 | Arquitectura | Pesos originales |
|---|---|---|---|---|---|
| APISR_GRL_x4 | x4 | 27,1 MB | 17,5 MB | GRL | HikariDawn/APISR |
| APISR_RRDB_x2 | x2 | 18,7 MB | 9,8 MB | RRDBNet-6B | HikariDawn/APISR |
| AnimeSharpV2_ESRGAN_Soft_x2 | x2 | 70,0 MB | 36,6 MB | ESRGAN | Kim2091/AnimeSharpV2 |
| AnimeSharpV2_MoSR_Sharp_x2 | x2 | 18,0 MB | 9,4 MB | MoSR | Kim2091/AnimeSharpV2 |
| AnimeSharpV2_MoSR_Soft_x2 | x2 | 18,0 MB | 9,4 MB | MoSR | Kim2091/AnimeSharpV2 |
| AnimeSharpV2_RPLKSR_Sharp_x2 | x2 | 30,8 MB | 16,1 MB | RealPLKSR | Kim2091/AnimeSharpV2 |
| AnimeSharpV2_RPLKSR_Soft_x2 | x2 | 30,8 MB | 16,1 MB | RealPLKSR | Kim2091/AnimeSharpV2 |
| AnimeSharpV3_x2 | x2 | 70,0 MB | 36,6 MB | ESRGAN | Kim2091/AnimeSharpV3 |
| BSRGAN_x2 | x2 | 69,7 MB | 36,4 MB | RRDBNet | kadirnar/BSRGANx2 |
| RealESRGAN_anime_x4 | x4 | 18,7 MB | 9,8 MB | RRDBNet-6B | xinntao/Real-ESRGAN |
| RealESRGAN_x2 | x2 | 70,0 MB | 36,6 MB | RRDBNet | ai-forever/Real-ESRGAN |
| RealESRGAN_x4 | x4 | 69,9 MB | 36,5 MB | RRDBNet | ai-forever/Real-ESRGAN |
| RealESRGAN_x4plus | x4 | 69,9 MB | 36,5 MB | RRDBNet | xinntao/Real-ESRGAN |
| RealESRGAN_x8 | x8 | 70,0 MB | 36,6 MB | RRDBNet | ai-forever/Real-ESRGAN |
| RealESR_General_x4 | x4 | 5,0 MB | 2,5 MB | SRVGGNetCompact | xinntao/Real-ESRGAN |
| RealWebPhoto_RGT_x4 | x4 | 92,3 MB | - | RGT | Phips/4xRealWebPhoto_RGT |
| Swin2SR_Classical_x2 | x2 | 72,4 MB | 40,0 MB | Swin2SR | mv-lab/swin2sr |
| Swin2SR_Classical_x4 | x4 | 73,0 MB | 40,3 MB | Swin2SR | mv-lab/swin2sr |
| Swin2SR_RealWorld_x4 | x4 | 72,3 MB | 39,9 MB | Swin2SR | mv-lab/swin2sr |
| SwinIR_BSRGAN_x4 | x4 | 55,2 MB | - | SwinIR-M | mikestealth/SwinIR |
| UltraMix_Smooth_x4 | x4 | 69,9 MB | 36,5 MB | ESRGAN | Kim2091/UltraSharp |
| UltraSharp_x4 | x4 | 69,9 MB | 36,5 MB | ESRGAN | Kim2091/UltraSharp |

## Arquitectura y entrenamiento

Cada archivo corresponde a una arquitectura de superresolucion distinta, no a una red comun reentrenada. Las RRDBNet (basadas en bloques residuales densos con atencion) y sus variantes ligeras RRDBNet-6B son la familia mas representada, e incluyen las variantes RealESRGAN x2, x4, x8, la version anime y BSRGAN. Los modelos ESRGAN (AnimeSharpV2/V3, UltraSharp, UltraMix) emplean un generador con bloques residuales y discriminador adversarial durante el entrenamiento original. SRVGGNetCompact es una red convolucional compacta orientada a velocidad. Las Swin2SR y SwinIR-M usan transformadores con atencion por ventana desplazada. MoSR, RealPLKSR, GRL y RGT son arquitecturas mas recientes orientadas a restauracion realista y contenido anime.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes, ni sobre el uso de RLHF o DPO, puesto que este repositorio no entrena ningun modelo: unicamente convierte pesos ya publicados por terceros. La innovacion tecnica del repositorio es de ingenieria de despliegue, no de modelado: homogeneiza el opset y los nombres de los tensores de entrada y salida en todos los archivos, hace dinamicas las dimensiones `H` y `W` para permitir inferencia tanto de la imagen completa como por teselas, y ofrece variantes fp16 con entrada y salida en fp32 para acelerar la inferencia sin perdida perceptible (diferencia de hasta un nivel de 8 bits). El archivo `models.json` del proyecto UpsizerAI documenta el multiplo de lado requerido y el pico de activacion de cada archivo.

## Capacidades

- Superresolucion de imagen con factores de escala x2, x4 y x8 segun el modelo.
- Restauracion de imagenes reales degradadas (ruido, compresion, desenfoque) mediante los modelos etiquetados como RealESRGAN, RealWebPhoto, BSRGAN o Swin2SR RealWorld.
- Upscaling especializado de contenido anime e ilustracion con la familia AnimeSharp y APISR.
- Restauracion clasica de imagenes limpias mediante Swin2SR Classical.
- Procesamiento por teselas o de imagen completa al tener dimensiones dinamicas.
- Inferencia en dos precisiones (fp32 y fp16) con resultados practicamente identicos.
- Ejecucion via ONNX Runtime, con la posibilidad de aceleracion por CPU o GPU segun el proveedor de ejecucion.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision semantica, tool calling ni capacidades de agente: su unica funcion es transformar una imagen de entrada en una version de mayor resolucion.

## Casos de uso

- Restauracion de fotografias antiguas o de baja resolucion: los modelos RealESRGAN y Swin2SR RealWorld estan entrenados especificamente para degradaciones reales, por lo que resultan adecuados para recuperar detalle en escaneos con ruido o compresion.
- Reescalado de ilustracion y manga: la familia AnimeSharpV2/V3 y APISR_GRL_x4 estan optimizadas para lineas limpias y colores planos tipicos del anime, evitando artefactos que aparecen al reescalar ese tipo de imagen con modelos genericos.
- Preprocesado para impresion: aplicar un factor x4 a una imagen antes de imprimirla en gran formato permite obtener mas resolucion efectiva partiendo de un original pequeno; se puede usar RealESRGAN_x4plus o SwinIR_BSRGAN_x4.
- Mejora de miniaturas y material grafico en un CMS: el modelo RealESR_General_x4 (5,0 MB en fp32, 2,5 MB en fp16) es lo bastante ligero para integrarse en un pipeline de subida de imagenes que reescale automaticamente los archivos al vuelo.
- Integracion en aplicaciones de escritorio o web: es el caso de uso previsto por el propio autor, ya que Upscale Agent y UpsizerAI descargan estos archivos bajo demanda desde este repositorio.
- Procesado por lotes de archivos graficos de videojuegos: las variantes de ESRGAN y Swin2SR permiten reescalar texturas o capturas, eligiendo el modelo segun el tipo de contenido (fotografico o dibujado).
- Recuperacion de capturas de pantalla o imagenes comprimidas con perdida: BSRGAN_x2 esta disenado para degradaciones complejas y puede aplicarse a material que ha pasado por varias recompresiones.
- Pipeline de restauracion previo a un modelo de vision por computador: reescalar imagenes pequeñas antes de alimentar un detector o clasificador puede mejorar la precision en tareas posteriores, usando por ejemplo Swin2SR_Classical_x2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de PSNR, SSIM, LPIPS ni comparativas cuantitativas entre los modelos, y el autor remite, en cada caso, a los pesos originales de cada proyecto para consultar sus metricas.

## Requisitos de hardware

- VRAM estimada para los pesos: dado que los archivos fp32 mas grandes no superan los 92,3 MB y la mayoria estan por debajo de 73 MB, los pesos ocupan menos de 100 MB en memoria en fp32 y aproximadamente la mitad en fp16, sin contar la memoria de activaciones.
- Memoria de activaciones: depende del tamano de la imagen de entrada y del modelo. El archivo `models.json` de UpsizerAI registra el pico de activacion de cada archivo, por lo que conviene consultarlo para dimensionar el lote y el tamano de tesela.
- GPU recomendadas: no se especifican en la informacion disponible. Por el tamano de los pesos, cualquier GPU con al menos 2 GB de VRAM puede ejecutar los modelos si se procesa por teselas. Modelos como RealESR_General_x4 o RealESRGAN_anime_x4 incluso funcionan en CPU en tiempos razonables.
- Cabe en GPU de consumo: si, todos los modelos incluidos caben en tarjetas de gama de entrada. La limitacion real no es la VRAM de los pesos, sino el tamano de la imagen y el modo de teselado.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integracion en las aplicaciones Upscale Agent y UpsizerAI del propio autor, y cualquier runtime compatible con ONNX (ONNX Runtime Web, ONNX Runtime Mobile, TensorRT o DirectML mediante conversion). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de imagen.
- Latencia y throughput estimados: no disponible. La model card no proporciona cifras de rendimiento por modelo ni por hardware.

## Comparativa con modelos similares

Dentro del propio repositorio existen variantes comparables entre si. La siguiente tabla resume las diferencias mas relevantes segun la informacion disponible:

| Modelo | Escala | Arquitectura | Tamano fp32 | fp16 disponible | Orientacion |
|---|---|---|---|---|---|
| RealESRGAN_x4 | x4 | RRDBNet | 69,9 MB | si | Fotografia real degradada |
| RealESRGAN_x4plus | x4 | RRDBNet | 69,9 MB | si | Fotografia real, uso general |
| Swin2SR_RealWorld_x4 | x4 | Swin2SR | 72,3 MB | si | Fotografia real con atencion por ventana |
| BSRGAN_x2 | x2 | RRDBNet | 69,7 MB | si | Degradaciones complejas |
| RealWebPhoto_RGT_x4 | x4 | RGT | 92,3 MB | no | Fotografia real (mayor tamano) |
| AnimeSharpV3_x2 | x2 | ESRGAN | 70,0 MB | si | Contenido anime |
| SwinIR_BSRGAN_x4 | x4 | SwinIR-M | 55,2 MB | no | Restauracion clasica ligera |

No se dispone de datos de rendimiento cuantitativos en la informacion proporcionada que permitan ordenar estos modelos por calidad objetiva. Para la comparacion con alternativas fuera del repositorio (por ejemplo, pesos originales en PyTorch de Real-ESRGAN, SwinIR o APISR), la diferencia fundamental es el formato: este repositorio ofrece ONNX con interfaz estandarizada, mientras que los originales suelen distribuirse en PyTorch.

## Limitaciones y advertencias

- No es un modelo unico: agrupa 22 archivos de diez proyectos distintos, con licencias y condiciones de uso diferentes. Es imprescindible consultar la licencia de cada peso original antes de usarlo comercialmente; la model card advierte expresamente que algunos modelos restringen el uso comercial.
- Ningun archivo fue entrenado por el autor del repositorio; todos son conversiones de pesos de terceros. No hay garantia de mantenimiento, soporte ni correccion de errores por parte del autor original.
- No se especifica la licencia a nivel de repositorio, lo que dificulta el uso corporativo sin una revision caso por caso.
- Restricciones de dimension por arquitectura: los RRDBNet x2 exigen lados pares y los modelos de atencion por ventana requieren lados multiplos de 8 o 32. Ignorar estas restricciones puede provocar errores de inferencia.
- Riesgo de artefactos: los modelos de upscaling pueden introducir sobreenfoque, texturas inventadas o alucinacion de detalle en zonas ambiguas, especialmente con factores x4 y x8 o con modelos etiquetados como "Sharp".
- Especializacion por dominio: usar un modelo entrenado para anime sobre una fotografia, o al reves, produce resultados inferiores. Hay que seleccionar el modelo segun el tipo de contenido.
- Rendimiento no documentado: no hay benchmarks publicados en el repositorio que permitan predecir la calidad resultante en un caso concreto.
- Sin informacion sobre sesgos: la informacion disponible no detalla sesgos de representacion ni de contenido en los corpus de entrenamiento originales.
- Sin soporte multilingue ni de texto: no procesa lenguaje, solo imagenes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/baker76/upscale-models
- Ejemplo de descarga directa de un archivo: https://huggingface.co/baker76/upscale-models/resolve/main/RealESRGAN_x4.onnx
- Upscale Agent (aplicacion de escritorio): https://github.com/benbaker76/UpscaleAgent
- UpsizerAI (aplicacion web): https://github.com/benbaker76/UpsizerAI
- Pesos originales APISR: https://huggingface.co/HikariDawn/APISR
- Pesos originales AnimeSharpV2: https://huggingface.co/Kim2091/AnimeSharpV2
- Pesos originales AnimeSharpV3: https://huggingface.co/Kim2091/AnimeSharpV3
- Pesos originales BSRGANx2: https://huggingface.co/kadirnar/BSRGANx2
- Pesos originales Real-ESRGAN (xinntao): https://github.com/xinntao/Real-ESRGAN
- Pesos originales Real-ESRGAN (ai-forever): https://huggingface.co/ai-forever/Real-ESRGAN
- Pesos originales 4xRealWebPhoto_RGT: https://huggingface.co/Phips/4xRealWebPhoto_RGT
- Pesos originales Swin2SR: https://github.com/mv-lab/swin2sr
- Pesos originales SwinIR: https://huggingface.co/mikestealth/SwinIR
- Pesos originales UltraSharp: https://huggingface.co/Kim2091/UltraSharp
