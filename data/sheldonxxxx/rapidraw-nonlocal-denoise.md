# sheldonxxxx/RapidRAW-Nonlocal-Denoise

## Resumen

RapidRAW-Nonlocal-Denoise no es un modelo entrenado, sino un repositorio de artefactos de conversión para el denoiser Nonlocal Bayer RAW del proyecto RapidRAW. El autor (sheldonxxxx) distribuye dos variantes convertidas, sin reentrenamiento ni cambios de precisión, desde el mismo checkpoint upstream fijado: una para CoreML en macOS (`coreml/packed.mlpackage`) y otra para ONNX en CPU y Linux con CUDA (`onnx/model.onnx`). El modelo subyacente procede del proyecto MIA-UIB/nonlocal-matchfilter y del artículo "Learned Nonlocal Feature Matching and Filtering for RAW Image Denoising", de Marco Sánchez-Beeckman y Antoni Buades (arXiv:2604.17453).

El problema que resuelve es el ruido en imágenes RAW en formato Bayer: recibe el mosaico RAW empaquetado en 4 planos RGBG más un mapa de nivel de ruido de 4 canales (`raw_with_noise [1, 8, 320, 320]`, float32) y devuelve el RAW empaquetado ya denoizado (`denoised_raw [1, 4, 320, 320]`, float32). El procesamiento se hace por teselas de 320 px empaquetados con un halo de 64 px (núcleo retenido de 192 px), y el host puede aplicar un ensemble de una pasada (e1, `balanced`) o cuatro rotaciones (e4, `maximum`).

Su relevancia es de tipo práctico y de empaquetado: no aporta un modelo nuevo, sino artefactos reproducibles y verificables por hash para integrarse en una aplicación de escritorio (RapidRAW) mediante `install_model kind=nonlocal`. El autor es explícito en que no existe paridad comercial demostrada ni API de inferencia alojada, y que las pruebas actuales se limitan a fixtures y a un conjunto reducido de fotos completas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; según el artículo upstream, emparejamiento y filtrado de características no local aprendido (esquema tipo Non-Local Means con pesos aprendidos) sobre mosaico Bayer |
| Parametros totales | no disponible (el repositorio no publica el recuento de parámetros del checkpoint) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de visión, no de lenguaje. Entrada de tamaño fijo `[1, 8, 320, 320]`, con teselado de 320 px y halo de 64 px |
| Tipos de cuantizacion | FLOAT32 (la conversión CoreML se declara explícitamente FLOAT32); ambas variantes se convierten sin cambios de precisión respecto al checkpoint original |
| Idiomas soportados | no aplica (procesa imágenes RAW, no texto) |
| Licencia | MIT según la model card (copyright Marco Sánchez Beeckman); los metadatos de HuggingFace no declaran licencia |
| Formato de pesos | CoreML (`.mlpackage`) y ONNX (`.onnx`); checkpoint upstream en `.ckpt` |
| Variantes incluidas | `native-coreml-v1` (`coreml/packed.mlpackage`, SHA-256 `ecf8f41b72b8e79a7210f61b13b3a21ad2ddbc79c475039be367fc011a98f5d3`) y `native-onnx-v1` (`onnx/model.onnx`, SHA-256 `df7f21ddbdfecd0984896a902623f75aa883d25b5f862c49d8c2b3f63a7dd2d9`) |
| Contrato de entrada | `raw_with_noise` `[1, 8, 320, 320]`, float32 (4 planos RGBG empaquetados + mapa de ruido de 4 canales) |
| Contrato de salida | `denoised_raw` `[1, 4, 320, 320]`, float32 |
| Tamano del repositorio | 0,2 GB |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento

La información proporcionada no permite describir la arquitectura interna con detalle (número de capas, canales, mecanismos de atención o tamaño del modelo). Lo que sí se documenta es su naturaleza: el artículo upstream se titula "Learned Nonlocal Feature Matching and Filtering for RAW Image Denoising", lo que sitúa el método en la familia de filtros no locales (inspirados en Non-Local Means) en los que tanto el emparejamiento de parches como el filtrado se aprenden. El modelo opera directamente sobre el mosaico Bayer sin demosaicado previo, empaquetado en 4 planos RGBG, y recibe además un mapa de 4 canales con el nivel de ruido, lo que permite condicionar la intensidad del filtrado al perfil de ruido de la captura.

En cuanto al entrenamiento, este repositorio no entrena nada: ambos artefactos son conversiones del mismo checkpoint fijado de la release `v1.0.0` del proyecto upstream (`rawnoise_25_15_9nbr.ckpt`, SHA-256 de tensores `c16747d852b93a95908792cdbac901f89cca98e35b91ea7db6214de42fbd3cad`). No se documentan en la información disponible el volumen de tokens (imágenes) de entrenamiento, la composición del dataset, ni el uso de RLHF, DPO o similares, que por otra parte no aplican a un modelo de denoising. La innovación destacable del paquete es de ingeniería de distribución: la variante CoreML es una conversión directa desde TorchScript (`coremltools-direct-torchscript`, FLOAT32, sampler estático empaquetado) para inferencia nativa con CoreML.framework, no un artefacto basado en un execution provider de ONNX/CoreML; además, `distribution.json` enumera cada archivo descargable con su tamaño y SHA-256, y RapidRAW descarga por revisión de commit inmutable verificando dicho manifiesto, cada archivo y los contratos internos del bundle, nunca la rama `main` por sí sola.

## Capacidades

- Denoising de imágenes RAW en formato Bayer directamente sobre el mosaico, sin demosaicado previo.
- Acondicionamiento por nivel de ruido: acepta un mapa de 4 canales que describe el ruido de la captura y ajusta el filtrado en consecuencia.
- Procesamiento por teselas: teselas empaquetadas de 320 px con halo de 64 px y núcleo retenido de 192 px, pensado para cubrir fotos de resolución completa de forma iterativa.
- Ensemble configurable en el host: e1 (una pasada, modo `balanced`) o e4 (cuatro rotaciones, modo `maximum`).
- Ejecución nativa en macOS mediante CoreML.framework (variante `native-coreml-v1`).
- Ejecución en CPU y en Linux con CUDA mediante ONNX Runtime (variante `native-onnx-v1`).
- Verificación de integridad por hash: manifiesto `distribution.json` con tamaños y SHA-256 de cada archivo, más SHA-256 internos de las variantes.
- No dispone de tool calling, function calling, soporte de agentes, capacidades multilingües, modo de razonamiento, visión general ni audio: no es un modelo de lenguaje ni un modelo multimodal.
- No se proporciona API de inferencia alojada; el uso previsto es la instalación automática dentro de RapidRAW.

## Casos de uso

- Revelado fotográfico en escritorio con RapidRAW: el modelo se instala automáticamente mediante `install_model kind=nonlocal` y se aplica como paso de denoising del RAW antes del revelado, aprovechando el teselado de 320 px con halo para procesar fotos completas sin cortes visibles.
- Preprocesado de RAW en flujos de fotografía nocturna o de alta ISO: el mapa de nivel de ruido de 4 canales permite adaptar la intensidad del filtrado a capturas con ruido elevado, donde un filtrado fijo degradaría el detalle.
- Denoising en macOS con aceleración nativa: la variante CoreML se ejecuta directamente sobre CoreML.framework, lo que permite integrarla en aplicaciones de escritorio que ya usan el stack nativo de Apple sin depender de ONNX Runtime.
- Procesado por lotes en servidores Linux con GPU NVIDIA: la variante ONNX sobre CUDA permite encadenar la denoización de colecciones grandes de RAW en pipelines automatizados de postproducción.
- Archivado y preservación de fondos fotográficos: al trabajar sobre el mosaico Bayer sin demosaicar, el resultado denoizado conserva la estructura RAW y puede alimentar después cualquier revelador, evitando una pérdida intermedia de información.
- Integración en cadenas de conversión RAW propias: desarrolladores que mantienen un pipeline de conversión pueden consumir el `.onnx` o el `.mlpackage` y aplicar su propio teselado con halo de 64 px por tesela de 320 px, siempre que respeten el contrato de entrada de 8 canales en float32.
- Investigación reproducible sobre filtrado no local: dado que los artefactos se derivan de un checkpoint fijado y verificable por SHA-256, sirven como referencia estable para comparar implementaciones de inferencia (CoreML frente a ONNX) sobre la misma salida esperada.
- Verificación de integridad en despliegues distribuidos: el esquema de descarga por commit inmutable y verificación de `distribution.json` es reutilizable como patrón en cualquier aplicación que distribuya pesos binarios a equipos de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de imagen (PSNR, SSIM, LPIPS) ni comparaciones con otros denoisers. La única evidencia cuantitativa aportada es de tipo funcional e integridad:

| Evidencia | Alcance | Resultado |
|---|---|---|
| Estudio histórico (herramientas de referencia en Python) | 18 teselas de fixture y 6 ejecuciones de foto completa, bajo umbrales congelados | 18/18 PASS y 6/6 PASS |
| Integración nativa con el código actual (backend Rust + CoreML) | 18 teselas de fixture, más foto completa en e1 y e4 (retrato) | 18/18 PASS; e1 y e4 PASS |
| Repeticiones adicionales con código actual | 6 fotos completas | no realizadas |
| Paridad comercial | - | no establecida (el autor la califica de experimental) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el tamaño de cada artefacto ni el pico de memoria de activaciones; el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: no disponibles. La variante ONNX se orienta a CPU y a Linux con CUDA, pero no se especifican modelos de GPU ni versiones mínimas de CUDA o de drivers.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible. Dado el tamaño de entrada (320x320 por tesela en float32) y el tamaño del repositorio, es plausible que quepa en GPU de consumo, pero se trata de una estimación no verificada con datos publicados.
- Opciones de despliegue: CoreML.framework nativo en macOS (variante `native-coreml-v1`); ONNX Runtime en CPU y en Linux con CUDA (variante `native-onnx-v1`); instalación automatizada dentro de RapidRAW mediante `install_model kind=nonlocal`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican tiempos por tesela, por foto completa ni por modo de ensemble (e1 frente a e4).
- Almacenamiento: el repositorio completo ocupa 0,2 GB, aunque el tamaño individual de cada variante no está disponible en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de otros denoisers RAW que permitan una comparación rigurosa (parámetros, contexto, métricas o licencia). La única comparación que puede establecerse con los datos disponibles es entre las dos variantes distribuidas en este mismo repositorio:

| Aspecto | native-coreml-v1 | native-onnx-v1 |
|---|---|---|
| Backend | CoreML.framework nativo (macOS) | ONNX Runtime (CPU / Linux CUDA) |
| Ruta del archivo | `coreml/packed.mlpackage` | `onnx/model.onnx` |
| Conversión | TorchScript directo (`coremltools-direct-torchscript`), FLOAT32, sampler estático empaquetado | no detallada en la información disponible |
| SHA-256 | `ecf8f41b72b8e79a7210f61b13b3a21ad2ddbc79c475039be367fc011a98f5d3` | `df7f21ddbdfecd0984896a902623f75aa883d25b5f862c49d8c2b3f63a7dd2d9` |
| Uso previsto | Inferencia nativa en macOS | CPU y Linux con CUDA |

## Limitaciones y advertencias

- No es un modelo nuevo: son artefactos de conversión. Cualquier limitación del checkpoint upstream (`rawnoise_25_15_9nbr.ckpt`) se hereda sin cambios.
- La paridad comercial no está establecida. El propio autor la califica de experimental, por lo que no debería asumirse una calidad equivalente a la de soluciones comerciales de denoising.
- Evidencia de validación limitada: 18 teselas de fixture y un número reducido de fotos completas. Las repeticiones más amplias con el código actual (6 fotos completas) no se realizaron.
- Contrato de entrada rígido: se exige `[1, 8, 320, 320]` en float32, con 4 planos RGBG empaquetados más un mapa de ruido de 4 canales. No procesa imágenes ya demosaicadas ni RGB de 3 canales.
- El teselado es responsabilidad del host: 320 px por tesela con halo de 64 px. Un halo mal aplicado o un solapamiento incorrecto puede producir artefactos en las uniones entre teselas.
- Dependencia del mapa de nivel de ruido: sin metadatos de ruido fiables de la cámara, la calidad del filtrado puede degradarse; no se documenta el comportamiento con perfiles de ruido incorrectos.
- Los modos de ensemble (e1 y e4) alteran el coste computacional y presumiblemente el resultado, pero no se publican métricas comparativas entre ellos.
- Licencia: la model card indica MIT con copyright de Marco Sánchez Beeckman, pero los metadatos de HuggingFace no declaran licencia. Conviene verificar el archivo `LICENSE` del repositorio antes de un uso comercial, y respetar los términos de atribución.
- Sin API de inferencia alojada: la integración requiere ejecutar el modelo en el propio dispositivo o servidor.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta, por lo que no hay retroalimentación externa sobre su comportamiento en producción.
- Las fechas de creación y actualización del repositorio (2026-09-18) figuran en los metadatos tal cual; no se dispone de información adicional que las contextualice.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados corresponden a tiendas de recambios de automóvil y no guardan relación con el contenido de esta ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sheldonxxxx/RapidRAW-Nonlocal-Denoise
- Proyecto RapidRAW: https://github.com/sheldonxxxx/RapidRAW
- Proyecto upstream: https://github.com/MIA-UIB/nonlocal-matchfilter
- Artículo: "Learned Nonlocal Feature Matching and Filtering for RAW Image Denoising", Marco Sánchez-Beeckman y Antoni Buades, arXiv:2604.17453 (referencia citada en la model card; no se dispone de URL verificada en la información proporcionada)
- Resultados de búsqueda web: sin resultados relevantes (los enlaces recuperados corresponden a comercios de recambios de automóvil y no están relacionados con el modelo)
