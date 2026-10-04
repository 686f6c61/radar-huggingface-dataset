# MuViSeg/muviseg

## Resumen

MuViSeg es un modelo de visión por computador para correspondencia de segmentos entre múltiples vistas de una misma escena. Dado un conjunto de dos o más imágenes junto con máscaras de segmentación agnósticas de clase, el modelo predice qué segmentos corresponden al mismo objeto físico, incluyendo una clase «dustbin» para descartar segmentos sin correspondencia. Lo desarrolla el equipo MuViSeg (Denis Fatykhoph, Timur Akhtyamov, Konstantin Pakulev, German Devchich y Gonzalo Ferrer) y se presentó en ACCV 2026.

La arquitectura combina un backbone congelado de geometría densa (MASt3R o VGGT) que aporta descriptores densos, un masked average pooling que produce un descriptor por segmento y una cabeza entrenable ligera con atención estilo LightGlue y un emparejador DoubleSoftmax. No es un modelo generativo de lenguaje: es un modelo de correspondencia visual con pipeline `image-feature-extraction`.

El repositorio aloja únicamente las cabezas entrenables (entre 0,8 M y 11 M de parámetros, de 3,3 MB a 50 MB por fichero), no los backbones, que se cargan por separado desde sus autores originales. Es relevante porque permite reutilizar backbones 3D ya publicados sin reentrenarlos, añadiendo solo una cabeza ligera para la tarea de correspondencia de segmentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone congelado de geometria densa (MASt3R o VGGT) + cabeza entrenable con atencion estilo LightGlue y emparejador DoubleSoftmax con dustbin |
| Parametros totales | Cabezas entrenables: ~0,8 M (SegMASt3R+LG v2, SegVGGT single-layer) hasta ~11,0 M (SegVGGT-DPT Joint). Backbones no incluidos en el repo (VGGT-1B y MASt3R se cargan aparte) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de correspondencia visual, sin ventana de contexto textual); opera sobre pares o N frames (N=4 en la variante Joint) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | MIT (el codigo y las cabezas); los componentes de terceros (MASt3R, VGGT, SegMASt3R, LightGlue, RoMa, SAM 2, FastSAM) mantienen sus licencias propias |
| Formato de pesos | PyTorch `.pth` |

## Arquitectura y entrenamiento

Cada checkpoint contiene exclusivamente la cabeza entrenable más metadatos (`epoch`, `global_step`, `best_val_ma` y las métricas de validación). No incluyen el estado del optimizador, por lo que no permiten reanudar el entrenamiento. El backbone congelado se elimina de los ficheros y se recarga en inferencia desde su origen: VGGT-1B de `facebook/VGGT-1B` y MASt3R del repositorio de Naver. El flujo de inferencia es: descriptores densos del backbone, masked average pooling por segmento y predicción de la asignación mediante atención y DoubleSoftmax.

Hay cinco checkpoints publicados: `segmast3r_lg_v2/best.pth` (SegMASt3R + LG v2, ~0,8 M parámetros, 3,3 MB), `segvggt_dpt/v3-001/best.pth` (SegVGGT-DPT pairwise, ~10,7 M, 50 MB), `segvggt_dpt/joint-001/best.pth` (SegVGGT-DPT con atención conjunta sobre N frames, ~11,0 M, 49 MB), `segvggt/best.pth` (SegVGGT single-layer, ablación, ~0,8 M, 5,5 MB) y `segvggt/step_0140000.pth` (SegVGGT single-layer, paso 140k, ~0,8 M, 5,5 MB). El número de tokens, la composición del dataset de entrenamiento y si hubo RLHF/DPO no se especifican en la información disponible.

## Capacidades

- Correspondencia de segmentos entre múltiples vistas: identifica qué segmentos de distintas imágenes pertenecen al mismo objeto físico.
- Trabajo con máscaras de segmentación agnósticas de clase, sin depender de categorías predefinidas.
- Gestión de segmentos sin correspondencia mediante una clase «dustbin».
- Extracción de descriptores por segmento a partir de descriptores densos del backbone (masked average pooling).
- Soporte de configuraciones pairwise (dos imágenes) y joint sobre N frames (N=4 en la variante publicada).
- Compatibilidad con dos backbones alternativos de geometría densa: MASt3R y VGGT.
- No dispone de generación de texto, razonamiento simbólico, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Reconstrucción 3D multi-vista: dado un conjunto de imágenes de una escena y sus segmentos, MuViSeg permite asociar los mismos objetos entre vistas para alimentar pipelines de reconstrucción densa o de mapeo.
- SLAM y odometría visual: la correspondencia de segmentos aporta restricciones de alto nivel entre frames, útiles para cerrar lazos o refinar el mapa cuando se parte de backbones como MASt3R o VGGT.
- Robótica de manipulación: alinear objetos segmentados entre observaciones de la misma escena para reconocer que una pieza vista desde otro ángulo es la misma, apoyándose en la máscara y en el descriptor por segmento.
- Edición y postproducción de vídeo: propagar máscaras de objetos entre fotogramas identificando correspondencias de segmento, útil para rotoscopia o seguimiento semántico.
- Conducción autónoma y percepción: emparejar segmentos de la misma escena captada por cámaras con distintos puntos de vista, con la variante Joint pensada para rotaciones grandes.
- Datasets y anotación automática: generar correspondencias entre vistas para preanotar datos 3D o validar etiquetas de segmentación multi-vista.
- Realidad aumentada y visión por computador en tiempo de diseño: anclar objetos segmentados a lo largo de vistas para mantener coherencia espacial entre capturas.

## Benchmarks y rendimiento

Resultados globales AUPRC / R@1 / R@5 sobre las listas de pares congeladas que se distribuyen con el código.

| Modelo | Replica | Virtual KITTI 2 |
|---|---|---|
| SegMASt3R + LG v2 | 84,5 / 77,5 / 93,6 | 81,2 / 72,7 / 92,8 |
| SegVGGT-DPT (pairwise) | 79,7 / 74,1 / 90,1 | 51,9 / 42,9 / 67,6 |
| SegVGGT-DPT Joint (N=4) | 81,6 / 76,5 / 90,6 | 52,8 / 43,2 / 66,8 |
| SegVGGT single-layer | 79,2 / 73,3 / 89,6 | 51,5 / 42,1 / 66,3 |

Según el autor, la variante MASt3R + LG v2 domina con cambios de punto de vista pequeños, mientras que la atención conjunta multi-frame reduce la diferencia en rotaciones grandes. El repositorio de código indica en `docs/reproduction.md` qué filas son exactamente reproducibles y cuáles no, por lo que conviene consultarlo antes de comparar con el paper. No se han publicado resultados de otros benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño de las cabezas: de 3,3 MB a 50 MB por fichero, por lo que el almacenamiento de los checkpoints es trivial.
- El coste real de cómputo y VRAM recae en el backbone congelado, no incluido en este repositorio. VGGT-1B y MASt3R deben descargarse por separado.
- VRAM estimada: no disponible en la información proporcionada. La cifra depende del backbone elegido y del número de imágenes procesadas simultáneamente, datos no detallados en la model card.
- GPU recomendadas: no disponible en la información proporcionada.
- Encaje en GPU de consumo: no disponible. La viabilidad depende del backbone (VGGT-1B frente a MASt3R), no de la cabeza, que es ligera.
- Opciones de despliegue: el repositorio oficial usa `uv` con `uv sync` y `setup_third_party.sh`; la descarga de checkpoints se realiza con `scripts/download_checkpoints.py --all --verify` o con `hf_hub_download`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa interna entre las variantes publicadas en este mismo repositorio, ya que no se dispone de datos de modelos externos equivalentes en la información proporcionada.

| Variante | Parametros de la cabeza | Tamaño | Replica (AUPRC) | Virtual KITTI 2 (AUPRC) | Licencia |
|---|---|---|---|---|---|
| SegMASt3R + LG v2 | ~0,8 M | 3,3 MB | 84,5 | 81,2 | MIT (cabeza); MASt3R con licencia propia |
| SegVGGT-DPT pairwise | ~10,7 M | 50 MB | 79,7 | 51,9 | MIT (cabeza); VGGT con licencia propia |
| SegVGGT-DPT Joint (N=4) | ~11,0 M | 49 MB | 81,6 | 52,8 | MIT (cabeza); VGGT con licencia propia |
| SegVGGT single-layer | ~0,8 M | 5,5 MB | 79,2 | 51,5 | MIT (cabeza); VGGT con licencia propia |

Comparación con modelos externos de correspondencia de segmentos o de matching denso (por ejemplo, enfoques basados en DINO o en correspondencia densa clásica): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Son checkpoints solo de cabeza: requieren recargar el backbone congelado (MASt3R o VGGT) en inferencia; no funcionan de forma autónoma.
- No permiten reanudar el entrenamiento, ya que carecen del estado del optimizador de un checkpoint completo.
- Los backbones pertenecen a sus autores originales y no se alojan en este repositorio; sus licencias son independientes de la MIT.
- La variante SegVGGT-DPT (pairwise y Joint) degrada notablemente en Virtual KITTI 2 (AUPRC 51,9 y 52,8) frente a Replica, lo que sugiere sensibilidad al dominio y a cambios de punto de vista grandes.
- Los resultados se reportan sobre benchmarks concretos (Replica y Virtual KITTI 2) con listas de pares congeladas; la generalización a otros dominios no está documentada.
- El propio autor advierte que `docs/reproduction.md` especifica qué resultados son exactamente reproducibles, por lo que no todas las filas de la tabla coinciden necesariamente con el paper.
- No se han publicado datos sobre sesgos, tasas de error fuera de AUPRC/R@1/R@5, cuantización ni rendimiento en producción.
- Aunque el código y las cabezas son MIT, el uso comercial puede verse afectado por las licencias de los componentes de terceros (MASt3R, VGGT, SegMASt3R, LightGlue, RoMa, SAM 2, FastSAM).
- El repositorio no registra descargas ni «likes» en el momento de la consulta, lo que limita la validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/MuViSeg/muviseg
- Repositorio de codigo: https://github.com/MuViSeg/muviseg-codeRelease
- Pagina del proyecto: https://muviseg.github.io
- Paper (arXiv): https://arxiv.org/abs/2607.17938
- Backbone VGGT-1B: https://huggingface.co/facebook/VGGT-1B
- Backbone MASt3R: https://github.com/naver/mast3r#checkpoints
