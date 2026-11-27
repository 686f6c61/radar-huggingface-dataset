# mendoanjoe/loft-table5-ablation

## Resumen

`mendoanjoe/loft-table5-ablation` no es un modelo de lenguaje, sino un paquete de reproduccion experimental publicado en Hugging Face. Su objetivo declarado es replicar la Tabla 5 del articulo "Machine Unlearning in Low-Dimensional Feature Subspace" (arXiv 2601.22456, v3), concretamente la ablacion que compara el objetivo conjunto LOFT (`J_rm² + J_fg²`) frente a cada uno de sus terminos por separado y frente a una linea base sin optimizacion. El autor del repositorio es el usuario `mendoanjoe`, y el paquete se presenta explicitamente como **no ejecutado**: la creacion del job y del sandbox fue rechazada por la API con HTTP 403 en el espacio de facturacion de la sesion, por lo que los scripts estan escritos y revisados pero nunca se han corrido.

El interes del artefacto es metodologico, no de rendimiento de un modelo. Documenta con inusual detalle el protocolo recuperado del articulo y del codigo de los autores (conjunto de datos Tiny-ImageNet, modelo Swin-T, tres particiones de olvido de 4 clases cada una, ataque de inferencia de pertenencia con SVC RBF), enumera las lagunas del material original (la fila "None" no tiene definicion en el paper ni ruta de codigo en el repositorio, no se publican checkpoints, la repetibilidad de la Tabla 5 no se especifica) y advierte de discrepancias concretas, como el tamano real del buffer de caracteristicas en `float64` (614,4 MB decimales frente a los "~300 MB" que afirma el articulo, cifra que corresponde al payload en `float32`).

Por tanto, esta ficha describe un paquete de reproducibilidad, no un modelo desplegable. No hay pesos, no hay pipeline de inferencia y no hay licencia declarada. Cualquier uso practico requeriria reentrenar `fpre` y los tres modelos `fexact` desde cero, tal como el propio autor reconoce.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (paquete de reproduccion); el experimento subyacente usa Swin-T |
| Parametros totales | No disponible (Swin-T, no cuantificado en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (no se publican checkpoints) |

## Arquitectura y entrenamiento

El paquete no contiene un modelo entrenado. Define cuatro brazos experimentales que solo difieren en la funcion de perdida: `none` (0 pasos de optimizacion sobre una `U` ortogonal aleatoria de 768x250), `jfg` (`J_fg²`), `jrm` (`J_rm²`) y `joint` (`J_rm² + J_fg²`). La ecuacion (1) del articulo minimiza `J = J_rm + J_fg`, con `J_rm = ‖Σ_r − UᵀΣ_rU‖²_F / ‖Σ_r‖²_F` (forma one-shot de preservacion de varianza retenida) y `J_fg = ‖UᵀΣ_fU‖²_F / ‖Σ_f‖²_F` (supresion de varianza olvidada); `main_subspace.py:112` lo implementa como `J_rm² + J_fg²` con pesos iguales, y `models/swin.py:596` inicializa `U` con `nn.init.orthogonal_`.

El protocolo recuperado especifica Tiny-ImageNet (100k train / 10k val, 200 clases), conjuntos olvidados de 4 clases (8% de los datos) en tres particiones `{11,83,115,153}`, `{44,65,150,168}` y `{53,57,108,179}`, un Swin-T inicializado desde `IMAGENET1K_V1` de torchvision, 20 epocas con AdamW (lr 1e-4, wd 0.05, cosine, batch 128, 64x64), caracteristicas one-shot de 768 dimensiones pre-cabeza con `s = 250`, 50 pasos de Riemannian-Adam (lr 1, wd 0.05) y un ataque de inferencia de pertenencia con SVC RBF (C=3, gamma auto) sobre la confianza de la etiqueta verdadera. El paquete usa `geoopt==0.5.0` de PyPI en lugar del commit fijado `1542ceed` del repositorio original.

## Capacidades

- No es un modelo generativo: no produce texto, codigo, matematicas ni vision.
- Define y documenta un protocolo de ablacion reproducible para un articulo de unlearning.
- Incluye scripts de extraccion de caracteristicas, optimizacion en variedad de Riemann y evaluacion MIA.
- Reporta por particion y calcula media y desviacion tipica sobre las tres particiones, etiquetado como unidad de repeticion propia.
- Imprime explicitamente el brazo ejecutado para permitir contrastar la inferencia sobre la fila `None` contra la Tabla 5.
- No soporta tool calling, agentes, multi-step reasoning ni capacidades multilingues.

## Casos de uso

- Auditoria de resultados publicados: el paquete permite verificar si el objetivo conjunto LOFT supera realmente a cada termino individual, tal como sugiere el boton "Audit the claim" de la model card.
- Reproduccion de la Tabla 5 en un entorno controlado: los scripts cubren desde la extraccion de caracteristicas hasta el calculo de `Avg.G` frente a `fexact`.
- Estudio de robustez de ataques MIA: la configuracion RBF SVC con C=3 y gamma auto sobre confianza de etiqueta verdadera es reutilizable para evaluar otros esquemas de unlearning.
- Analisis de discrepancias entre paper y codigo: el paquete documenta que la fila `None` no tiene definicion ni ruta de codigo, lo que sirve como caso de estudio de reproducibilidad.
- Docencia en metodos de investigacion: el material ilustra como recuperar un protocolo a partir de codigo fijado a un commit y como declarar explicitamente las lagunas.
- Base para extensiones: los cuatro brazos y la infraestructura de optimizacion Riemanniana pueden adaptarse a otros subespacios o conjuntos olvidados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios en la informacion disponible. El autor reproduce, unicamente como cita para comparacion, la Tabla 5 del articulo:

| objective | Acc_tr_rm | Acc_tr_fg | Acc_te_rm | Acc_te_fg | MIA |
|---|---|---|---|---|---|
| None | 97.11 | 98.10 | 71.61 | 65.00 | 86.10 |
| Jfg only | 89.51 | 11.50 | 65.40 | 4.00 | 0.00 |
| Jrm only | 99.19 | 87.80 | 75.07 | 53.00 | 58.35 |
| Jrm + Jfg | 98.66 | 1.10 | 74.27 | 0.00 | 0.00 |

Como referencia adicional, la Tabla 1 del articulo reporta para `fpre`: 99.63 / 99.75 / 74.54 / 74.83 / MIA 96.63.

## Requisitos de hardware

- VRAM estimada: no disponible para inferencia, ya que no hay modelo desplegable.
- Para ejecutar el protocolo se sugiere una GPU tipo A10G (el enlace "Run it on an A10G" de la model card apunta a ese perfil).
- Entorno de dependencias fijado: `torch==2.5.0` (build cu124), `torchvision==0.20.0`, `numpy==2.1.2`, `scikit-learn==1.7.0`, `geoopt==0.5.0`, ademas de `pyarrow`, `pillow`, `huggingface_hub` y `trackio`.
- Almacenamiento: el buffer de caracteristicas en `float64` ocupa 614,4 MB decimales (585,9 MiB) para 100000x768; el autor almacena despues en `float32` (307,2 MB / 292,9 MiB).
- Opciones de despliegue: no aplica (no hay pesos); la ejecucion es mediante `uv run` con las dependencias anteriores.
- Latencia y throughput: no disponibles; el paquete nunca se ha ejecutado.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido habitual, ya que se trata de un paquete de reproducibilidad y no de un modelo con pesos. Como referencia del dominio, el experimento subyacente emplea Swin-T, pero la informacion proporcionada no incluye comparaciones con otros esquemas de unlearning ni con otros backbones.

## Limitaciones y advertencias

- El paquete **no se ha ejecutado**: la creacion del job y del sandbox fue rechazada con HTTP 403 en el espacio de facturacion `Neurips-2026-MLIntern-Repro` (rol `contributor`); las llamadas de solo lectura con el mismo token si funcionan.
- Los scripts estan escritos y revisados pero no validados; deben tratarse como no verificados.
- La fila `None` de la Tabla 5 no tiene definicion en el articulo ni ruta de codigo en el repositorio; la interpretacion de "0 pasos de optimizacion sobre la inicializacion ortogonal aleatoria" es una inferencia del autor del paquete.
- No se especifica la repetibilidad ni la incertidumbre de la Tabla 5; trasplantar la desviacion tipica de la Tabla 1 no esta justificado.
- Los autores del articulo no publican checkpoints, por lo que `fpre` y los tres `fexact` deben reentrenarse; los numeros absolutos pueden diferir de la Tabla 5 aunque el ordenamiento se mantenga.
- El buffer de caracteristicas en `float64` ocupa 614,4 MB, no los "~300 MB" que afirma el articulo (esa cifra corresponde a `float32`).
- Se usa `geoopt==0.5.0` de PyPI en lugar del commit `1542ceed`; la trayectoria de optimizacion puede no ser identica a la de los autores.
- No hay licencia declarada, lo que impide determinar condiciones de uso comercial o redistribucion.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque no es un modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mendoanjoe/loft-table5-ablation
- Articulo: https://arxiv.org/abs/2601.22456
- Codigo de los autores: https://github.com/fanghenshaometeor/unlearning-feat-subspace (commit fijado `d91dbd3bbe677536dad8ae5ae3e1991d5ca8150b`)
- Ejecutar en A10G via ML Intern: https://hf.co/chat?mode=ml-intern&prompt=Run%20the%20LOFT%20Table%205%20ablation%20from%20mendoanjoe%2Floft-table5-ablation%20on%20an%20A10G
- Auditoria de la afirmacion: https://hf.co/chat?mode=ml-intern&prompt=Check%20whether%20the%20joint%20LOFT%20objective%20really%20beats%20each%20single%20term%20in%20arXiv%202601.22456
