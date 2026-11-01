# jimmylomro/hercuvit-stitcher

## Resumen

HercuViT Stitcher es un modelo auxiliar desarrollado por jimmylomro que resuelve el problema de la reconstruccion de superficies a traves de ventanas en el pipeline de segmentacion HercuViT. HercuViT segmenta pergaminos antiguos (scrolls) ventana a ventana, de modo que una hoja que abarca varias ventanas se fragmenta en varias mallas inconexas con identificadores independientes. Este modelo es el "stitcher" que las reconecta: un decodificador estilo DETR de pequeno tamano que lee los embeddings por ventana almacenados por HercuViT y predice una afinidad con signo entre cada par de hojas que se encuentran en la esquina de una ventana.

La innovacion principal es que elimina el emparejamiento geometrico manual (sin IoU ni distancia de superficie) y la anotacion manual. Las afinidades se escriben en el fichero `.asv` como una tabla de aristas, y un algoritmo de aglomeracion sobre grafo con signo (GASP) ensambla las hojas completas que abarcan todo el pergamino, tanto por lotes como de forma interactiva en VC3D.

El checkpoint liberado se entreno con aproximadamente 22.600 muestras autosupervisadas de esquinas, con un modo de etiquetado v2 que marca los negativos ciertos como negativos en lugar de ignorarlos, y una perdida focal-BCE mas contrastiva supervisada sobre embeddings PCA normalizados de dimension D = 3. Es un componente especializado dentro del ecosistema HercuViT, no un modelo de lenguaje ni de vision generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador estilo DETR sobre embeddings por ventana (transformer, 4 capas, 4 cabezas) |
| Parametros totales | no disponible (decodificador descrito como "tiny"; d_model 128) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre muestras de esquina de ventana, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible (checkpoint `.pth` en precision de entrenamiento) |
| Idiomas soportados | no aplica (modelo de vision 3D/segmentacion, no linguistico) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint unico autocontenido con pesos y `StitchConfig`) |

## Arquitectura y entrenamiento

El modelo es un decodificador estilo DETR con `d_model 128`, 4 cabezas de atencion, 4 capas con supervision profunda y `fourier_bands 8`. Consume embeddings por ventana normalizados mediante PCA de dimension 3 (`pca_dim 3`), que HercuViT produce y almacena junto con la segmentacion. La salida es una afinidad con signo por cada par de hojas que se encuentran en una esquina de ventana, escrita como tabla de aristas `affinities(src, dst, logit, prob, corner)` en el `.asv`.

El entrenamiento es autosupervisado: aproximadamente 22.600 muestras de esquina extraidas de 22.619 coordenadas de esquina muestreadas por region. Para cada esquina se usan las 8 ventanas de octante mas una pasada centrada, con voto por solapamiento para construir una matriz de etiquetas de mismo objeto, sin ground truth. El modo de etiquetado v2 marca los negativos ciertos (pares de la misma ventana y pares fuera de la costura) como negativos en lugar de ignorarlos, de modo que la matriz queda totalmente etiquetada. La perdida combina focal-BCE (gamma 2, balanceo automatico de clases) con contrastiva supervisada (tau 0.1), optimizada con AdamW y learning rate base 1e-4 con decaimiento coseno.

El metodo es deliberadamente agnostico al primitivo (cualquier conjunto de instancias mas un campo de embeddings en el mismo espacio), aunque este checkpoint concreto esta entrenado para unir hojas de HercuViT. El modelo se actualiza in situ bajo la misma ruta del repositorio a medida que se seleccionan mejores checkpoints.

## Capacidades

- Prediccion de afinidad con signo entre pares de hojas que se encuentran en la esquina de una ventana.
- Reconexion de mallas fragmentadas por ventana en hojas completas que abarcan todo el pergamino.
- Escritura de una tabla de aristas bidireccional (`affinities`) indexada por `src` en el fichero `.asv`.
- Integracion con aglomeracion sobre grafo con signo (GASP) para el ensamblaje final.
- Ejecucion por lotes o interactiva en VC3D (coloreado de afinidades y auto-stitch).
- Inferencia rapida: el decodificador es pequeno y procesa esquinas por lotes, por lo que un volumen completo se une en segundos en CPU o GPU.
- Carga autocontenida: `load_stitcher` reconstruye el `StitchDecoder` exacto desde el `StitchConfig` almacenado.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo linguistico).

## Casos de uso

- Reconstruccion de pergaminos antiguos digitalizados: tras segmentar un scroll con HercuViT ventana a ventana, el stitcher reconecta las hojas fragmentadas para obtener superficies continuas listas para analisis paleografico.
- Pipeline integrado de segmentacion y union: mediante `hercuvit infer --stitcher` se segmenta, almacenan embeddings y unen en un solo comando, generando un `.asv` con hojas y afinidades listo para VC3D.
- Union independiente sobre artefactos existentes: con `hercuvit stitcher infer` se anade la tabla de afinidades a un `.asv` y un zarr de embeddings producidos por una ejecucion previa con `--store-embeddings`.
- Revision interactiva en VC3D: el coloreado de afinidades y el auto-stitch permiten a un investigador inspeccionar y validar las conexiones propuestas entre hojas antes de consolidarlas.
- Procesamiento por lotes de colecciones: al ser rapido y ejecutable en CPU, permite unir grandes volumenes de escaneos sin necesidad de GPU dedicada.
- Investigacion en vision 3D y reconstruccion de superficies: el diseno agnostico al primitivo y la ausencia de emparejamiento geometrico manual lo hacen util como referencia metodologica para problemas de union de instancias.
- Integracion en flujos de curaduria patrimonial: la salida en `.asv` con aristas indexadas facilita el post-procesado y la exportacion a herramientas de visualizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el decodificador es de tamano reducido (d_model 128, 4 capas) y procesa esquinas por lotes.
- GPU recomendadas: no se especifican; cualquier GPU consumer es suficiente dado el tamano del decodificador.
- Cabe en GPU consumer: si, y tambien funciona en CPU (el autor indica que un volumen completo se une en segundos en un solo dispositivo, CPU o GPU).
- Opciones de despliegue: codigo `hercunet.hercuvit` (comandos `hercuvit infer` y `hercuvit stitcher infer`), con carga via `hf://jimmylomro/hercuvit-stitcher`, `file://` o ruta local `.pth`/directorio.
- Latencia y throughput: union de un volumen completo en segundos en un dispositivo; no se publican cifras exactas.
- Requisito critico: la inferencia necesita los embeddings almacenados por HercuViT (zarr de embeddings por ventana y embedding mediano de cada hoja en el `.asv`); no funciona sobre CT en bruto.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hercuvit-stitcher | Decodificador DETR para union de instancias | no disponible (reducido) | no aplica | MIT | HuggingFace (repo) |
| hercuvit-v0 | Segmentador companero (produce hojas y embeddings) | no disponible | no aplica | no disponible | HuggingFace (repo) |
| Alternativas genericas de union de instancias | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos comparables directos en la informacion proporcionada.

## Limitaciones y advertencias

- No funciona sobre CT en bruto: requiere los embeddings almacenados por HercuViT y el codigo `hercunet.hercuvit` para ensamblar cada muestra de esquina y escribir las afinidades; no existe un predictor estandar que lo reproduzca.
- El `--emb-dim` usado al almacenar embeddings debe coincidir con el `pca_dim` del modelo (3).
- El checkpoint esta entrenado especificamente para unir hojas de HercuViT, aunque el metodo sea agnostico al primitivo.
- El modelo se actualiza in situ bajo la misma ruta del repositorio; para una version fija hay que fijar `--revision` a un commit concreto.
- Entrenamiento autosupervisado sin ground truth: las etiquetas provienen de voto por solapamiento, lo que puede introducir errores en casos ambiguos.
- Riesgo de afinidades erroneas en esquinas con geometria compleja o hojas muy deterioradas; se recomienda validacion interactiva en VC3D.
- No aplica sesgo linguistico ni de idioma (modelo no linguistico); no se documentan sesgos especificos.
- Licencia MIT permite uso comercial, pero la dependencia del codigo y artefactos de HercuViT debe verificarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jimmylomro/hercuvit-stitcher
- Segmentador companero: https://huggingface.co/jimmylomro/hercuvit-v0
- Codigo y documentacion: https://github.com/jimmylomro/hercUNet/tree/hercuvit
- Guia de uso: https://github.com/jimmylomro/hercUNet/blob/hercuvit/docs/stitcher.md
- Manifiesto del corpus: https://github.com/jimmylomro/hercUNet/blob/hercuvit/submission/corpus/stitch_corpus_windows.txt
- README del corpus: https://github.com/jimmylomro/hercUNet/blob/hercuvit/submission/corpus/README.md
- Metodologia: https://github.com/jimmylomro/hercUNet/blob/hercuvit/submission/writeup/hercuvit-stitcher.md
