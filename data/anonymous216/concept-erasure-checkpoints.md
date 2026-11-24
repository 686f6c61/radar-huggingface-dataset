# Anonymous216/concept-erasure-checkpoints

## Resumen

Concept-erasure checkpoints es un repositorio de checkpoints en formato diffusers para Stable Diffusion v1.4 orientado a la investigaciÃ³n sobre *concept erasure* (borrado de conceptos) y *machine unlearning* en modelos de difusiÃ³n. Lo publica el usuario Anonymous216 y no es un modelo generativo nuevo: es una colecciÃ³n de variantes del UNet y del text encoder de `CompVis/stable-diffusion-v1-4` en las que se ha aplicado una tÃ©cnica de borrado de concepto, manteniendo el resto de componentes originales.

El repositorio cubre dos conceptos objetivo: desnudez y estilo de Van Gogh. Para cada uno recopila mÃºltiples mÃ©todos de la literatura reciente (CErode, ESD-u/ESD-x, UCE, SalUn, SPM, AdvUnlearn, DES y Safe-CLIP), lo que lo convierte en un *benchmark bundle* prÃ¡ctico para comparar tÃ©cnicas de unlearning bajo una misma base. AdemÃ¡s incluye artefactos auxiliares de evaluaciÃ³n: detectores NudeNet 3.4 y 3.0.1, un clasificador de estilos de WikiArt y la imagen de referencia del ataque RECALL.

Es relevante ahora porque la mayorÃ­a de los pesos de unlearning publicados por terceros dependen de enlaces externos (Google Drive, Dropbox, servidores acadÃ©micos) que tienden a romperse, y este repo los reempaqueta en layout diffusers con procedencia documentada en `source.json`. El tamaÃ±o del repo es de 33,3 GB, la licencia es `other` y no hay pipeline declarado ni datos de descargas o likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet + text encoder de Stable Diffusion v1.4 (modelo de difusion latente, no transformer autoregresivo) |
| Parametros totales | no disponible (cada checkpoint sustituye un componente de SD v1.4; el UNet de SD v1.4 ronda ~860M y el text encoder CLIP ViT-L/14 ~123M, pero el repo no declara cifras) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y ONNX; no se listan variantes cuantizadas) |
| Idiomas soportados | no disponible (el text encoder CLIP de SD v1.4 es principalmente inglÃ©s) |
| Licencia | other (los pesos de mÃ©todos de terceros conservan sus licencias originales) |
| Formato de pesos | safetensors (diffusers), ONNX (detectores NudeNet) |

## Arquitectura y entrenamiento

El repo no entrena un modelo desde cero. Cada carpeta contiene un componente de SD v1.4 modificado: en la mayorÃ­a de casos el UNet, y en otros el text encoder. Los mÃ©todos aplicados son:

- **CErode** (contribuciÃ³n propia del autor, 10 generaciones por concepto): borrado de desnudez y de estilo Van Gogh sobre el UNet.
- **ESD-u / ESD-x** (Gandikota et al. 2023): *Erased Stable Diffusion*, con pesos oficiales del proyecto `erasing.baulab.info` cargados en el UNet de SD v1.4.
- **UCE** (Gandikota et al. 2024): *Unified Concept Editing*, pesos del bundle de AdvUnlearn cargados en el UNet.
- **SalUn** (Fan et al. 2024): *Saliency Unlearning*, pesos del bundle de AdvUnlearn.
- **SPM** (Lyu et al. 2024): *Spectral Projection Method*; en el caso de desnudez se fusiona el LoRA rank-1 oficial en el UNet a escala 1 con la compuerta de inferencia desactivada.
- **AdvUnlearn** (Zhang et al. 2024): se aplica al text encoder, re-guardado sin cambios desde `OPTML-Group/AdvUnlearn`.
- **DES** (Kim et al. 2025): text encoder con pesos cargados desde Dropbox.
- **Safe-CLIP** (Poppi et al. 2024): se re-guarda la torre de texto ViT-L/14 de `aimagelab/safeclip_vit-l_14` como text encoder.

La innovaciÃ³n tÃ©cnica aquÃ­ no estÃ¡ en la arquitectura (que es la de SD v1.4) sino en la normalizaciÃ³n del layout diffusers y en la documentaciÃ³n de procedencia (`source.json` por carpeta). TambiÃ©n destaca la inclusiÃ³n de los artefactos de evaluaciÃ³n (NudeNet 3.4 `320n.onnx` byte-idÃ©ntico, NudeNet 3.0.1 `best.onnx` con md5 `6eecadb002e48e3873a1c0f3a09e9f06`, clasificador de estilos de WikiArt del checkpoint `results/checkpoint-2800` de Diffusion-MU-Attack, e imagen de referencia RECALL con sha256 `08c8c32dd7089d88b1c3418252f12bbf2e7f2924073723bac9ff7d76b28fadd6`). No se declaran tamaÃ±os de dataset, tokens de entrenamiento ni uso de RLHF/DPO, porque no es un modelo entrenado de forma unificada.

## Capacidades

- GeneraciÃ³n de imÃ¡genes texto-a-imagen heredada de SD v1.4, con el componente sustituido segÃºn el mÃ©todo de borrado.
- Borrado de concepto de desnudez (variantes `cerode`, `esd`, `uce`, `salun`, `spm`, `advunlearn`, `des`, `safeclip`).
- Borrado de estilo artÃ­stico Van Gogh (variantes `cerode_van_gogh`, `esd_van_gogh`, `uce_van_gogh`, `spm_van_gogh`, `advunlearn_van_gogh`).
- EvaluaciÃ³n de robustez frente a ataques de *prompt* adversario mediante los detectores NudeNet y el clasificador de estilos incluidos.
- Reproducibilidad de benchmarks de unlearning (UnlearnDiffAtk, RECALL) gracias a los artefactos de referencia empaquetados.
- No soporta tool calling, agentes, razonamiento multi-paso, visiÃ³n ni audio; es un modelo de difusiÃ³n de imÃ¡genes.
- Capacidades multilingÃ¼es limitadas por el text encoder CLIP de SD v1.4 (principalmente inglÃ©s).

## Casos de uso

- **InvestigaciÃ³n en machine unlearning**: comparar en condiciones idÃ©nticas CErode, ESD, UCE, SalUn, SPM, AdvUnlearn, DES y Safe-CLIP sobre la misma base SD v1.4, usando los checkpoints ya normalizados en diffusers y los `source.json` para trazar procedencia.
- **AuditorÃ­a de filtros de seguridad**: cargar las variantes de borrado de desnudez y medir su resistencia a ataques de *prompt* con NudeNet 3.4 y 3.0.1 incluidos en el repo, replicando los benchmarks UnlearnDiffAtk y RECALL sin depender de descargas externas.
- **EvaluaciÃ³n de borrado de estilo artÃ­stico**: usar las variantes Van Gogh junto con el clasificador de estilos WikiArt para cuantificar cuÃ¡nto estilo se ha eliminado y cuÃ¡nto se conserva en imÃ¡genes generadas.
- **Reproducibilidad acadÃ©mica**: servir como snapshot congelado de pesos que de otro modo dependen de enlaces de Google Drive, Dropbox o servidores institucionales que pueden caerse, facilitando la replicaciÃ³n de experimentos publicados.
- **Punto de partida para nuevos mÃ©todos**: cargar un UNet ya borrado (por ejemplo `uce/unet` o `salun/unet`) y aplicar tÃ©cnicas adicionales de ediciÃ³n o *fine-tuning* para estudiar interacciones entre mÃ©todos.
- **Despliegue de demos controladas**: montar una demo diffusers con una de las variantes de borrado para mostrar generaciÃ³n de imÃ¡genes con filtros de concepto activos, siempre que la licencia del mÃ©todo subyacente lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; en la prÃ¡ctica, SD v1.4 completo en fp16 requiere aproximadamente 4-5 GB de VRAM, y las variantes aquÃ­ sustituyen un solo componente, por lo que el coste es equivalente.
- GPU recomendadas: no declaradas por el autor. Para SD v1.4 en fp16 bastan GPUs consumer tipo RTX 3060 12 GB o RTX 4090 24 GB; para lotes grandes o fp32 conviene A100 o H100.
- Cabe en GPU consumer: sÃ­, previsiblemente en cualquier GPU con 6 GB o mÃ¡s en fp16 (no confirmado por el autor).
- Opciones de despliegue: diffusers (formato nativo del repo), y conversiÃ³n a otros *runtimes* no documentada; los detectores ONNX se ejecutan con ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Concept-erasure checkpoints (este repo) | no disponible | no aplica | Bundle de unlearning sobre SD v1.4 | other | Hugging Face, 33,3 GB |
| `CompVis/stable-diffusion-v1-4` | ~1.000M (UNet + text encoder) | no aplica | Modelo base de difusion latente | CreativeML OpenRAIL-M | Hugging Face |
| `OPTML-Group/AdvUnlearn` | no disponible | no aplica | Pesos de unlearning (origen de varias variantes) | no disponible | Hugging Face |
| `aimagelab/safeclip_vit-l_14` | no disponible | no aplica | CLIP seguro para filtrar conceptos | no disponible | Hugging Face |

No se dispone de mÃ©tricas de rendimiento comparativas entre estas variantes en la informaciÃ³n proporcionada.

## Limitaciones y advertencias

- El repositorio contiene imÃ¡genes y pesos relacionados con desnudez y estÃ¡ etiquetado `not-for-all-audiences`; la imagen de referencia RECALL es explÃ­cita y se conserva solo porque el ataque la necesita.
- La licencia es `other`: los pesos de terceros (ESD, UCE, SalUn, SPM, AdvUnlearn, DES, Safe-CLIP) mantienen sus licencias originales, que no se detallan en la model card; verificar caso por caso antes de uso comercial.
- No es un modelo entrenado de forma unificada: no hay datos de tokens, dataset, RLHF/DPO ni evaluaciones propias mÃ¡s allÃ¡ de los artefactos de benchmark incluidos.
- Riesgo de alucinaciÃ³n: no aplica en el sentido de LLM, pero los mÃ©todos de unlearning pueden ser eludidos con *prompts* adversarios; por eso el repo incluye detectores y ataques de referencia.
- El text encoder CLIP de SD v1.4 estÃ¡ orientado al inglÃ©s; el soporte multilingÃ¼e es limitado.
- El pipeline no estÃ¡ declarado en la ficha de Hugging Face, por lo que la integraciÃ³n automÃ¡tica con `diffusers` puede requerir carga manual componente a componente.
- El repo no declara cifras de VRAM, latencia ni throughput; cualquier planificaciÃ³n de producciÃ³n debe basarse en las especificaciones de SD v1.4, no en datos del autor.
- La fecha de creaciÃ³n declarada (2026-11-21) es futura respecto a la mayorÃ­a de referencias citadas; conviene verificar la integridad de los archivos antes de usarlos en producciÃ³n.

## Enlaces

- Hugging Face: https://huggingface.co/Anonymous216/concept-erasure-checkpoints
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- ESD (Gandikota et al. 2023): https://erasing.baulab.info
- UCE (Gandikota et al. 2024): https://github.com/rohitgandikota/unified-concept-editing
- SalUn (Fan et al. 2024): https://github.com/OPTML-Group/Unlearn-Saliency
- SPM (Lyu et al. 2024): https://github.com/Con6924/SPM
- AdvUnlearn (Zhang et al. 2024): https://github.com/OPTML-Group/AdvUnlearn
- AdvUnlearn en Hugging Face: https://huggingface.co/OPTML-Group/AdvUnlearn
- DES (Kim et al. 2025): https://github.com/aei13/DES
- Safe-CLIP (Poppi et al. 2024): https://github.com/aimagelab/safe-clip
- Safe-CLIP en Hugging Face: https://huggingface.co/aimagelab/safeclip_vit-l_14
- NudeNet: https://github.com/notAI-tech/NudeNet
- Diffusion-MU-Attack (clasificador de estilos): https://github.com/OPTML-Group/Diffusion-MU-Attack
- RECALL (ryliu68): https://github.com/ryliu68/RECALL
