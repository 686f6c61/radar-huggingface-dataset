# jhu-ccvl/Hexels

## Resumen

Hexels (nombre completo del método: Honeycomb-Surfels) es un modelo de representación de escenas 3D y reconstrucción de superficies desarrollado por el CCVL (Computational Cognition, Vision and Learning) de la Johns Hopkins University, por Prakhar Kaushik, Soumava Paul y Alan Yuille. No es un modelo de lenguaje: se trata de un conjunto de primitivas geométricas personalizadas (elementos de superficie hexagonales planos con un campo de color espacial de primer orden) implementadas en PyTorch/CUDA para síntesis de vistas noveles (NVS), reconstrucción 3D y representación de imágenes 2D. El repositorio de HuggingFace contiene los checkpoints del paper, no pesos de un transformer.

La motivación del trabajo es reducir los requisitos de memoria y cómputo de los radiance fields y de las técnicas de splatting (como 2DGS o 3DGS), que limitan su uso en entornos con recursos restringidos. Hexels explota regiones localmente planas con apariencia que varía suavemente mediante primitivas más grandes y menos numerosas, cuyo soporte hexagonal ofrece un dominio eficiente en área y frontera. Sobre 34 escenas, los autores reportan mejoras de PSNR de 4,53 a 7,38 dB frente a 2DGS con el mismo presupuesto de memoria, consumiendo menos VRAM de entrenamiento.

El repositorio (46,9 GB) incluye 204 modelos de NVS, 231 de superficie, 90 de imágenes 2D y 21 paquetes de inicialización MVS, organizados según la estructura del paper. Es relevante ahora como referencia práctica para investigadores que quieran reproducir los resultados del artículo o reutilizar los checkpoints para extracción de mallas, evaluación Chamfer/F1 o exportación a visores, sin necesidad de reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Primitivas de superficie hexagonales planas (Hexels) con campo de color espacial de primer orden; implementación personalizada en PyTorch/CUDA, no transformer |
| Parametros totales | no disponible (el tamaño depende de la escena y del checkpoint; el repo completo ocupa 46,9 GB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuyen checkpoints FP32 sin comprimir y companions opcionales `.hexcodec` comprimidos con métricas separadas |
| Idiomas soportados | en (idioma declarado en la model card; no aplica a la tarea de representación) |
| Licencia | hexels-checkpoint-dataset-terms (license: other, con LICENSE en el repo) |
| Formato de pesos | checkpoints `.pt` de PyTorch (FP32) y archivos `.hexcodec` opcionales |

## Arquitectura y entrenamiento

Hexels sustituye las gaussianas o surfels convencionales por elementos de superficie hexagonales planos ("hexels") que actúan como primitivas de representación. Cada primitiva combina un soporte hexagonal, eficiente en área y perímetro, con un campo de color espacial de primer orden que modela la variación de apariencia dentro de la propia primitiva. Esta combinación permite cubrir regiones localmente planas con menos primitivas y de mayor tamaño, reduciendo el coste de memoria frente a 2DGS con presupuestos equivalentes. El método se evalúa en tres frentes: síntesis de vistas noveles (34 escenas), reconstrucción de superficie (15 escaneos DTU y 6 escenas Tanks and Temples) y representación de imágenes 2D sobre el benchmark Image-GS de 45 imágenes.

El repositorio organiza los checkpoints según las variantes del paper: V1/V2/V3, con inicialización fija o creciente (`fixed`/`grown`), además de ablaciones de apariencia, población, inicialización y función de pérdida. Los modelos de superficie parten de packs de inicialización MVS (15 DTU y 6 T&T) verificados por SHA256. El entrenamiento e inferencia requieren código y submódulos del repositorio GitHub oficial; el entorno probado es Linux, Python 3.11, PyTorch 2.5.1 con CUDA 12.1, toolkit 12.3 y una RTX A5000. Los autores no detallan en la model card el número de tokens, la composición del dataset ni si se empleó RLHF/DPO, por lo que esos datos no están disponibles.

## Capacidades

- Síntesis de vistas noveles (NVS) a partir de conjuntos de imágenes con poses de cámara conocidas.
- Reconstrucción 3D y de superficie, incluyendo extracción de mallas TSDF y evaluación Chamfer en DTU.
- Representación de imágenes 2D como primitivas planas o espaciales, comparada con Image-GS.
- Renderizado acelerado por GPU con soporte CUDA; el pipeline `hexels.render` permite renderizar splits de test con checkpoints preentrenados.
- Evaluación reproducible mediante jobs preconfigurados (`scripts.evaluate_nvs_campaign`) con contratos de cámara y comparación de matrices en precisión float32.
- Decodificación y evaluación de escenas comprimidas (`.hexcodec`) con métricas separadas de las del checkpoint FP32.
- Exportación a visores para inspección interactiva de las escenas reconstruidas.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo generativo de texto.

## Casos de uso

- Reconstrucción de superficies en patrimonio y arqueología: a partir de fotografías con poses conocidas, Hexels genera mallas de superficie con menor error Chamfer que 2DGS con la misma memoria, útil para digitalizar escaneos DTU o Tanks and Temples con hardware modesto.
- Síntesis de vistas noveles para inspección de producto: renderizar ángulos no capturados de un objeto a partir de un set de fotos, usando los checkpoints `nvs/` y el comando `hexels.render` con el split de test.
- Reproducción de resultados académicos: ejecutar el job de evaluación del paper con las cámaras y el contrato incluidos para verificar PSNR de forma independiente en una GPU distinta de la RTX A5000 original.
- Evaluación comparativa de primitivas: usar los 204 modelos NVS y las ablaciones de superficie para comparar Hexels con 2DGS bajo presupuestos de memoria y número de primitivas equivalentes.
- Compresión y almacenamiento de escenas: emplear los companions `.hexcodec` para guardar representaciones comprimidas y decodificarlas después, aceptando las métricas separadas que documenta el repositorio.
- Representación eficiente de imágenes 2D: usar los 90 modelos `images_2d/` sobre el benchmark Image-GS para estudiar alternativas de codificación de imágenes con primitivas espaciales.
- Exportación a visores para revisión por parte de equipos no técnicos: generar escenas exportables que se puedan inspeccionar en un visor sin reentrenar el modelo.
- Investigación en inicialización MVS: reentrenar modelos de superficie usando los packs `mvs/` verificados por SHA256 para estudiar el efecto de la inicialización en la calidad final.

## Benchmarks y rendimiento

| Metrica | Hexels | 2DGS (memoria equivalente) | Contexto |
|---|---|---|---|
| PSNR (34 escenas NVS) | +4,53 a +7,38 dB sobre 2DGS | referencia | Distintos datasets, mismo presupuesto de memoria |
| PSNR por primitiva | hasta +4,74 dB sobre 2DGS | referencia | Menor VRAM de entrenamiento y 2,31x más FPS |
| Error de reconstruccion de superficie (15 escaneos DTU) | -28,9% frente a 2DGS | referencia | Memoria equivalente |
| F1 medio (6 escenas Tanks and Temples) | 34,38% | 31,72% (2DGS) | Mayor F1 medio entre los métodos comparados |
| Representacion de imagenes 2D | mejora sobre Image-GS | Image-GS | Benchmark de 45 imagenes |

Los datos proceden del abstract de la model card. No se han publicado en la información disponible resultados desglosados por escena, latencias absolutas ni cifras de VRAM concretas más allá de las comparaciones relativas indicadas.

## Requisitos de hardware

- GPU NVIDIA obligatoria para renderizado, evaluación y extracción TSDF; el entorno probado usa una RTX A5000.
- Entorno de referencia: Linux, Python 3.11, PyTorch 2.5.1, CUDA 12.1 y toolkit 12.3.
- VRAM estimada: no disponible de forma absoluta; los autores indican que Hexels requiere menos VRAM de entrenamiento que 2DGS con presupuesto de memoria equivalente.
- El repositorio completo ocupa 46,9 GB, pero la descarga selectiva por escena (por ejemplo, `nvs/dtu/scan24/...`) reduce el espacio en disco necesario.
- Opciones de despliegue: ejecución directa con el código del repositorio GitHub (`python -m hexels.render`, `scripts.evaluate_nvs_campaign`); no hay integración con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput absolutos: no disponibles; solo se reporta la relación relativa de 2,31x más FPS por primitiva frente a 2DGS.

## Comparativa con modelos similares

| Modelo | Tipo de primitiva | Memoria | Calidad reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hexels | Hexágonos planos con campo de color de primer orden | Menor que 2DGS a igual calidad | +4,53 a +7,38 dB PSNR sobre 2DGS; F1 34,38% en T&T | hexels-checkpoint-dataset-terms | Checkpoints en HuggingFace (jhu-ccvl/Hexels) |
| 2DGS | Surfels gaussianos 2D | Referencia de comparación | Base de comparación del paper | no disponible en esta ficha | no disponible en esta ficha |
| 3DGS | Gaussianas 3D | Mayor demanda de memoria según el paper | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |
| Image-GS | Primitivas para imágenes 2D | no disponible | Superado por Hexels en representación 2D | no disponible en esta ficha | no disponible en esta ficha |

Los datos de 2DGS, 3DGS e Image-GS se limitan a las referencias que aparecen en el abstract y la model card; no se dispone de sus especificaciones completas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un transformer: no puede usarse para generación de texto, tool calling ni tareas de NLP.
- Requiere GPU NVIDIA y el código del repositorio GitHub con submódulos; no funciona como pipeline de HuggingFace (`pipeline: no disponible`).
- Las rutas de dataset del ejemplo son relativas a `data/` y deben preservar marcos de cámara y escalas de imagen; modificarlas incorrectamente invalida la evaluación.
- El job de evaluación exige que nombres, tamaños y píxeles de imagen coincidan exactamente con el contrato de cámara; solo las matrices se toleran dentro del redondeo float32.
- Los checkpoints `.hexcodec` comprimidos tienen métricas separadas y no sustituyen al checkpoint FP32 para los resultados de la tabla del paper.
- Los pesos de las líneas base adaptadas (2DGS, etc.) están excluidos del repositorio, lo que limita la comparación directa sin descargarlos por otra vía.
- La licencia `hexels-checkpoint-dataset-terms` es de tipo "other" y restringe el uso; debe revisarse el archivo LICENSE antes de cualquier uso comercial.
- El idioma declarado es únicamente inglés, aunque no aplica a la tarea de representación visual.
- No se documentan sesgos, tasas de alucinación ni límites de contexto porque no aplican a este tipo de modelo; los riesgos relevantes son de licencia, hardware y reproducibilidad.
- El repositorio no incluye pesos de líneas base ni datos de entrenamiento originales, por lo que la reproducibilidad completa depende de descargar los datasets por separado.

## Enlaces

- HuggingFace: https://huggingface.co/jhu-ccvl/Hexels
- Catálogo de modelos: https://huggingface.co/jhu-ccvl/Hexels/blob/main/catalog.json
- Project page: https://honeycomb-surfels.github.io/
- Paper (PDF): https://honeycomb-surfels.github.io/h1.pdf
- arXiv: https://arxiv.org/abs/2610.37668
- GitHub (código): https://github.com/honeycomb-surfels/hexels
- Guía de checkpoints: https://github.com/honeycomb-surfels/hexels/blob/main/docs/checkpoints.md
- Página de Prakhar Kaushik: https://toshi2k2.github.io/
- Página de Soumava Paul: https://mvp18.github.io/
- Página de Alan Yuille: https://www.cs.jhu.edu/~ayuille1/
