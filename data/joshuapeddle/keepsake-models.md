# JoshuaPeddle/keepsake-models

## Resumen

Keepsake models no es un unico modelo, sino una coleccion de cuatro modelos de restauracion de imagen reexportados a ExecuTorch 1.4 por Joshua Peddle para su uso dentro de Keepsake, una aplicacion de restauracion de fotos que funciona de forma local en el telefono. Cada archivo `.pte` es una conversion sin reentrenamiento de un modelo abierto ya publicado (Real-ESRGAN, Bringing Old Photos Back to Life, LaMa y DDColor), de modo que las redes y los pesos son identicos a los originales; solo cambian las operaciones para que el runtime de ExecuTorch las pueda ejecutar.

El repositorio cubre las cuatro fases tipicas de un pipeline de restauracion fotografica: deteccion de rayones y roturas (`bopbtl_scratch_t384`, 384 px), relleno de las zonas danadas (`lama_big_t512`, 512 px), superresolucion 4x (`realesrgan_x4v3_t256`, 256 px) y colorizacion (`ddcolor_paper_tiny_t512`, 512 px). Todos los archivos se ejecutan en CPU/NPU del dispositivo movil, sin enviar la imagen a un servidor, lo que es el argumento central de privacidad de la aplicacion.

Su relevancia actual radica en que sirve como ejemplo practico de despliegue on-device con ExecuTorch: cada modelo tiene dos variantes, `*_xnnpack.pte` para Android (XNNPACK, CPU) y `*_coreml.pte` para iOS (Core ML, float16). El repositorio ocupa 0,9 GB en total y cuenta con 0 descargas y 0 likes en el momento de redactar esta ficha. La licencia es mixta (`license: other`), porque cada componente conserva la licencia de su modelo de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion de cuatro redes neuronales convolucionales de restauracion de imagen (no es un unico modelo); reexportadas a ExecuTorch 1.4 |
| Parametros totales | no disponible (no se detalla por modelo en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelos de imagen; operan sobre tiles de 256 px, 384 px y 512 px) |
| Tipos de cuantizacion | Core ML: float16. XNNPACK (Android): no especificado en la informacion disponible |
| Idiomas soportados | no aplica / no disponible (modelos de imagen, no procesan texto) |
| Licencia | Mixta (`license: other`), agregada por componente: BSD-3-Clause, MIT y Apache-2.0 |
| Formato de pesos | `.pte` (formato de programa de ExecuTorch); texto completo de licencias en `licenses/` |

Desglose por componente del repositorio:

| Archivo | Modelo de origen | Funcion | Resolucion de tile | Licencia upstream |
|---|---|---|---|---|
| `realesrgan_x4v3_t256_xnnpack.pte` / `_coreml.pte` | Real-ESRGAN general x4v3 | Superresolucion 4x | 256 px | BSD-3-Clause |
| `bopbtl_scratch_t384_xnnpack.pte` / `_coreml.pte` | Bringing Old Photos Back to Life | Deteccion de rayones y roturas | 384 px | MIT |
| `lama_big_t512_xnnpack.pte` / `_coreml.pte` | LaMa (big-lama) | Inpainting del dano | 512 px | Apache-2.0 |
| `ddcolor_paper_tiny_t512_xnnpack.pte` / `_coreml.pte` | DDColor tiny | Colorizacion | 512 px | Apache-2.0 |

## Arquitectura y entrenamiento

Cada componente es una red convolucional de vision ya existente y ampliamente utilizada en restauracion de imagen, no una arquitectura nueva. Real-ESRGAN general x4v3 se encarga del reescalado 4x por tiles de 256 px; el detector de rayones procede del proyecto Bringing Old Photos Back to Life y localiza rayones y roturas sobre ventanas de 384 px; LaMa (big-lama) rellena las zonas danadas sobre tiles de 512 px; y DDColor en su variante tiny aplica colorizacion a 512 px. Los pesos son los originales publicados por cada proyecto, sin reentrenamiento ni fine-tuning por parte del autor del repositorio.

La unica adaptacion es de caracter de ingenieria: para que las redes se ejecuten bajo ExecuTorch se reescribieron algunas operaciones como formas matematicamente equivalentes, verificadas contra los modelos PyTorch originales. En LaMa, la transformada de Fourier se calcula como multiplicaciones de matrices contra tablas DFT fijas. En DDColor, layer norm, atencion y pooling se reescriben con operaciones que XNNPACK soporta, y la spectral normalization se pliega dentro de los pesos. En todos los modelos, el reflection padding se construye a partir de slices y las entradas y salidas se envuelven para la aplicacion (por ejemplo, LaMa recibe RGB mas un canal de mascara y compone su propia salida). No se documenta en la informacion disponible el numero de tokens o imagenes de entrenamiento, ni el uso de RLHF/DPO, ya que no aplica a este tipo de modelos.

## Capacidades

- Superresolucion 4x de imagenes mediante Real-ESRGAN general x4v3, procesando por tiles de 256 px.
- Deteccion de rayones y roturas en fotografias antiguas sobre ventanas de 384 px.
- Inpainting de zonas danadas con LaMa big-lama sobre tiles de 512 px, incluyendo relleno guiado por mascara.
- Colorizacion automatica de fotografias en blanco y negro con DDColor tiny a 512 px.
- Ejecucion totalmente local en el dispositivo: Android mediante XNNPACK sobre CPU y iOS mediante Core ML en float16.
- Procesamiento por tiles, lo que permite tratar imagenes de mayor resolucion que el tamano de ventana del modelo encadenando parches.
- Composicion interna de entradas y salidas (por ejemplo, LaMa integra una mascara y devuelve la imagen ya compuesta).

No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni procesamiento de audio o video, ya que no son modelos de lenguaje ni multimodales de proposito general.

## Casos de uso

- Restauracion de fotos familiares en el movil: la aplicacion ejecuta los cuatro modelos en cadena (deteccion de rayones, inpainting, superresolucion y colorizacion) sin subir la imagen a ningun servidor, lo que resulta adecuado para material privado.
- Escaneo y digitalizacion de archivos fotograficos: un usuario puede fotografiar albums antiguos y dejar que el pipeline corrija rayones y roturas y aumente la resolucion antes de archivarlos.
- Colorizacion de fotografia historica en blanco y negro: DDColor tiny aplica color a 512 px por tile, util para proyectos de memoria historica o divulgacion.
- Integracion en una app movil nativa: los archivos `*_coreml.pte` y `*_xnnpack.pte` permiten enviar el mismo modelo a iOS y Android, simplificando el mantenimiento de dos rutas de inferencia.
- Procesamiento offline en entornos sin conectividad: al ser modelos on-device, pueden ejecutarse en moviles sin red, por ejemplo durante trabajo de campo o en zonas con poca cobertura.
- Limpieza de imagenes para impresion fisica: el reescalado 4x con Real-ESRGAN x4v3 es adecuado para preparar copias impresas de negativos o diapositivas escaneados a baja resolucion.
- Recuperacion de documentos y fotos danados por humedad o dobleces: el detector de rayones mas el inpainting de LaMa permiten reconstruir zonas perdidas antes de cualquier uso posterior.
- Base de referencia para desarrolladores: sirve como ejemplo de como reescribir operaciones (FFT como matmul, folding de spectral norm) para portar modelos de vision a ExecuTorch 1.4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de PSNR, SSIM, LPIPS ni latencias para ninguna de las cuatro variantes (`xnnpack` o `coreml`), ni comparaciones con los modelos PyTorch originales mas alla de indicar que las operaciones reescritas se verificaron como matematicamente equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser despliegues on-device no se publican requisitos de VRAM para GPU de escritorio.
- GPU recomendadas: no aplica; los build estan pensados para CPU de movil (XNNPACK) y para Core ML (float16) en iOS.
- Compatibilidad con GPU de consumo: los modelos se ejecutan en el telefono, no requieren una GPU dedicada. No se documenta su comportamiento en GPU de escritorio.
- Opciones de despliegue: runtime de ExecuTorch 1.4. Los archivos `*_xnnpack.pte` se ejecutan en Android con el backend XNNPACK sobre CPU; los `*_coreml.pte` se ejecutan en iOS con el backend Core ML en float16. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Huella en disco: el repositorio completo ocupa 0,9 GB, repartido entre ocho archivos `.pte` (cuatro modelos por dos backends).

## Comparativa con modelos similares

La comparacion mas util es entre los propios componentes del repositorio, ya que cada uno resuelve una tarea distinta dentro del mismo pipeline de restauracion. No se dispone de datos de rendimiento para compararlos por calidad.

| Modelo | Tarea | Resolucion de tile | Backends | Licencia upstream |
|---|---|---|---|---|
| Real-ESRGAN general x4v3 | Superresolucion 4x | 256 px | XNNPACK, Core ML | BSD-3-Clause |
| Bringing Old Photos Back to Life (scratch) | Deteccion de rayones y roturas | 384 px | XNNPACK, Core ML | MIT |
| LaMa (big-lama) | Inpainting | 512 px | XNNPACK, Core ML | Apache-2.0 |
| DDColor tiny | Colorizacion | 512 px | XNNPACK, Core ML | Apache-2.0 |

Frente a alternativas de la misma categoria (por ejemplo, GFPGAN u otros exportadores de Real-ESRGAN/LaMa a ONNX o TFLite), no se dispone de datos de rendimiento, tamano de parametros ni latencia en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. La diferencia funcional documentada es el uso de ExecuTorch 1.4 con backend XNNPACK en Android y Core ML en iOS.

## Limitaciones y advertencias

- Licencia mixta: cada componente conserva su licencia de origen (BSD-3-Clause, MIT o Apache-2.0). Es obligatorio revisar `LICENSE.md` y los textos completos en `licenses/` antes de cualquier uso comercial o redistribucion, ya que la licencia del repositorio en conjunto es `other`.
- Terminos de los datasets: los pesos de LaMa y DDColor se entrenaron sobre Places365 e ImageNet respectivamente, que tienen sus propias condiciones de uso para las imagenes.
- Riesgo de artefactos: al ser modelos de restauracion, pueden introducir detalles plausibles pero inexistentes (por ejemplo, rostros o texturas inventadas en inpainting o colorizacion), lo que en contextos forenses o documentales puede ser un problema.
- Procesamiento por tiles: el resultado depende del tamano de ventana (256 px, 384 px o 512 px) y pueden aparecer costuras o inconsistencias entre parches en imagenes grandes.
- Sin cuantificacion publicada para el backend Android: solo se documenta float16 para Core ML, por lo que el rendimiento y la precision en XNNPACK no estan detallados.
- Idiomas: no aplica, son modelos de imagen y no procesan texto ni voz.
- Verificacion limitada por terceros: el autor indica que las operaciones reescritas se validaron contra los modelos PyTorch originales, pero no se publican metricas ni scripts de validacion en la informacion disponible.
- Ausencia de benchmarks: no hay cifras de calidad (PSNR/SSIM/LPIPS) ni de latencia que permitan estimar el rendimiento en produccion.
- Estado del repositorio: 0 descargas y 0 likes en el momento de redactar la ficha, y actualizado por ultima vez en la misma fecha de creacion (2026-10-12), lo que sugiere que es un lanzamiento reciente y poco contrastado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoshuaPeddle/keepsake-models
- Perfil del autor en HuggingFace: https://huggingface.co/JoshuaPeddle
- ExecuTorch (runtime): https://github.com/pytorch/executorch
- Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Bringing Old Photos Back to Life: https://github.com/microsoft/Bringing-Old-Photos-Back-to-Life
- LaMa: https://github.com/advimman/lama
- DDColor: https://github.com/piddnad/DDColor

Resultados de busqueda web encontrados que no corresponden a este repositorio y se listan solo a titulo informativo: https://keepsake.sh/ (producto distinto de gestion de proyectos con IA), https://github.com/keepsake-hq/keepsake (herramienta de memoria para LLM, distinta de la app de restauracion fotografica) y https://www.techtimes.com/ai-timeline (cronologia de lanzamientos de modelos, sin relacion con este repositorio).
