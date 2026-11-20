# Labhgupta/caption-remover

## Resumen

Caption Remover es un paquete de dos modelos ONNX publicados por el usuario Labhgupta que reproduce en el navegador un pipeline de eliminación de texto sobre imágenes. No se trata de un modelo de lenguaje ni de un modelo entrenado desde cero: son dos pesos originales de terceros convertidos a ONNX para ejecutarse con ONNX Runtime Web sobre WebGPU. El primero, `lama-inpaint.onnx`, es LaMa ("big-lama") de Samsung Research, un modelo de inpainting que rellena la zona enmascarada de una imagen. El segundo, `craft-text.onnx`, es CRAFT (`craft_mlt_25k`) de NAVER Corp., un detector de texto basado en segmentación de caracteres.

La relevancia del repositorio es de ingeniería de despliegue, no de investigación: permite ejecutar detección de texto e inpainting íntegramente en el cliente, sin backend, aprovechando la GPU del equipo del usuario mediante WebGPU. El cambio técnico principal está en LaMa: como los runtimes GPU de navegador no ofrecen FFT, cada unidad de Fourier se reescribe como multiplicaciones matriciales (una DFT exacta), con tablas precomputadas que dependen del tamaño de imagen y se pasan como entradas adicionales del grafo.

El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta. La licencia se declara como "other" con nombre `apache-2.0-and-mit`: Apache 2.0 para el componente LaMa y MIT para el componente CRAFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos redes convolucionales independientes exportadas a ONNX: LaMa (inpainting, con modulos de Fourier implementados como DFT exacta mediante matmul) y CRAFT (deteccion de texto, segmentacion de caracteres y enlaces) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de texto) |
| Tipos de cuantizacion | no disponible (los ficheros se distribuyen en float32) |
| Idiomas soportados | no disponible (CRAFT usa el modelo `craft_mlt_25k`, multilingue por entrenamiento, pero la model card no detalla idiomas) |
| Licencia | other; `apache-2.0-and-mit` (Apache 2.0 para LaMa, MIT para CRAFT), ver LICENSE.md |
| Formato de pesos | ONNX (float32) |
| Entradas de `lama-inpaint.onnx` | `image` (1,3,H,W) RGB 0..1; `mask` (1,1,H,W) binaria; `cw`, `sw` (w, w/2+1); `ch`, `sh` (h, h); `ci`, `si` (w/2+1, w), con h=H/8 y w=W/8 |
| Salida de `lama-inpaint.onnx` | `output` (1,3,H,W) RGB 0..1 |
| Entradas de `craft-text.onnx` | `image` (1,3,H,W) RGB normalizada con mean (0.485, 0.456, 0.406) y std (0.229, 0.224, 0.225) |
| Salida de `craft-text.onnx` | `scores` (1, H/2, W/2, 2): score de caracter y score de enlace |
| Restricciones de forma | LaMa: H y W multiplos de 8. CRAFT: H y W multiplos de 32 |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

Ambos modelos son redes convolucionales preexistentes; este repositorio no aporta entrenamiento nuevo ni ajuste fino. LaMa es un modelo de inpainting de Samsung Research diseñado para rellenar regiones enmascaradas de una imagen; su particularidad arquitectonica es el uso de modulos de Fourier para capturar contexto global con coste subcuadratico. Como WebGPU y los runtimes de navegador no exponen FFT, la conversion sustituye cada FFT real 2D y su inversa por multiplicaciones matriciales equivalentes a una DFT exacta. Las tablas de senos y cosenos dependen del tamano de imagen, por lo que se exponen como entradas (`cw`, `sw`, `ch`, `sh`, `ci`, `si`) calculadas en el cliente. Segun el autor, la salida coincide con el modelo original dentro de 1e-5 en escala 0-1.

CRAFT es un detector de texto que produce dos mapas por pixel: score de caracter y score de enlace entre caracteres, lo que permite reconstruir cajas de texto a partir de la segmentacion. Se exporto sin modificaciones y el autor afirma que la salida es identica a la original. No hay informacion en la model card sobre volumen de datos de entrenamiento, composicion del dataset, RLHF/DPO ni tecnicas de alineacion, algo esperable al tratarse de una conversion de pesos.

## Capacidades

- Deteccion de texto en imágenes: CRAFT devuelve mapas de score de caracter y de enlace a resolucion H/2 x W/2, aptos para derivar cajas o mascaras de texto.
- Inpainting condicionado por mascara: LaMa rellena la region marcada con 1 en `mask` y conserva intacto el resto de la imagen.
- Pipeline combinado de eliminacion de rotulos: detectar texto con CRAFT, generar la mascara y rellenar con LaMa.
- Ejecucion en navegador con ONNX Runtime Web sobre WebGPU, sin backend ni subida de imagenes a un servidor.
- Entrada y salida en float32 RGB normalizado a 0..1, lo que simplifica la integracion con canvas y `ImageData`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No hay capacidades de audio, video ni vision general (clasificacion, deteccion de objetos, VQA).

## Casos de uso

- Eliminacion de subtitulos o rotulos en imagenes en una aplicacion web: el cliente detecta el texto con `craft-text.onnx`, construye la mascara y la rellena con `lama-inpaint.onnx`, todo en la GPU local sin enviar la imagen a un servidor.
- Editor de fotos en el navegador con herramienta de "borrado de texto": el usuario selecciona o deja que el detector marque el texto y el inpainting reconstruye el fondo; encaja por el requisito de privacidad y por la ausencia de coste de inferencia en servidor.
- Limpieza de capturas y material de formacion: quitar marcas de agua textuales o anotaciones de pantallazos antes de publicarlos, manteniendo el resto de la imagen sin cambios gracias a que LaMa solo modifica la region enmascarada.
- Preprocesado para OCR: usar los mapas de CRAFT para localizar y recortar regiones de texto antes de pasarlas a un motor OCR, o para enmascarar texto no deseado antes de un pipeline de vision.
- Anonimizacion de texto en imagenes: detectar y tapar o rellenar numeros de documento, matriculas o nombres visibles en fotos subidas por usuarios, con procesamiento local que evita tratar datos personales en servidor.
- Prototipado y demos sin infraestructura: al ser ONNX y ejecutarse en WebGPU, permite validar el pipeline de deteccion + inpainting en una pagina estatica, sin GPU en la nube ni contenedores.
- Investigacion de despliegue en el borde: banco de pruebas para medir el coste de sustituir FFT por matmul en LaMa y evaluar el rendimiento de WebGPU frente a ejecucion nativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica aportada por el autor es de fidelidad numerica de la conversion: la salida de `lama-inpaint.onnx` coincide con el modelo original dentro de 1e-5 en escala 0-1, y la de `craft-text.onnx` es identica a la original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 0,3 GB en float32, lo que da una cota inferior del orden de cientos de MB para los pesos, pero el pico de memoria depende de la resolucion de entrada y no se documenta.
- GPU recomendadas: no disponible. El unico requisito declarado es un navegador con soporte de WebGPU para ejecutar via ONNX Runtime Web.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del repositorio, pero no hay datos publicados de consumo de memoria por resolucion ni de GPUs integradas soportadas.
- Opciones de despliegue: ONNX Runtime Web con WebGPU (objetivo del repositorio); al ser ONNX estandar, tambien es desplegable con ONNX Runtime nativo, pero el autor no documenta ni valida esa ruta.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen ni FPS en ninguna GPU concreta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Caption Remover (este repo) | Deteccion de texto + inpainting en ONNX | no disponible | no aplica | Apache 2.0 + MIT | ONNX | Conversion para WebGPU; sin entrenamiento propio |
| advimman/lama (original) | Inpainting | no disponible | no aplica | Apache 2.0 | PyTorch | Modelo fuente de `lama-inpaint.onnx`; requiere FFT nativa |
| clovaai/CRAFT-pytorch (original) | Deteccion de texto | no disponible | no aplica | MIT | PyTorch | Modelo fuente de `craft-text.onnx`; salida identica |
| EasyOCR / CRAFT en Python | Deteccion de texto | no disponible | no aplica | Apache 2.0 (EasyOCR) | PyTorch | Usa la misma normalizacion que CRAFT; requiere backend |

La comparativa relevante es contra los originales en PyTorch: este repositorio no mejora la calidad, sino que habilita la ejecucion en navegador. No se dispone de datos de rendimiento para comparar latencias entre las versiones ONNX y PyTorch.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso en ese sentido es un error de categorizacion.
- La licencia se declara como "other" con nombre `apache-2.0-and-mit`; para uso comercial hay que revisar LICENSE.md y respetar las condiciones de ambos componentes originales (Apache 2.0 para LaMa, MIT para CRAFT).
- La inpainting de LaMa puede producir resultados plausibles pero no fieles al contenido original: rellena con textura sintetica, no recupera el fondo real. En documentos o fotos con detalle fino puede dejar artefactos.
- La calidad depende de la mascara: una deteccion de CRAFT incompleta deja texto sin eliminar, y una mascara demasiado agresiva borra contenido valido.
- Restricciones de forma estrictas: H y W multiplos de 8 en LaMa y de 32 en CRAFT; entradas que no cumplan obligan a redimensionar o rellenar, lo que afecta a la precision de las cajas.
- Las tablas DFT (`cw`, `sw`, `ch`, `sh`, `ci`, `si`) deben recalcularse para cada tamano de imagen; un error en su construccion degrada la salida sin aviso.
- Dependencia de WebGPU: navegadores o equipos sin soporte caen a otros backends o no ejecutan el modelo; el autor no documenta fallback.
- No hay informacion sobre sesgos, idiomas cubiertos por CRAFT ni evaluacion cualitativa de la inpainting en este repositorio.
- Sin descargas ni validacion comunitaria en el momento de la consulta: el repositorio es de autoria individual y no cuenta con avales externos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Labhgupta/caption-remover
- LaMa (Samsung Research): https://github.com/advimman/lama
- CRAFT-pytorch (NAVER Corp.): https://github.com/clovaai/CRAFT-pytorch
- EasyOCR (referencia de normalizacion usada por CRAFT): https://github.com/JaidedAI/EasyOCR
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- WebGPU: https://www.w3.org/TR/webgpu/
