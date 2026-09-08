# Ced-Collab/RNASBDD

## Resumen

El repositorio `Ced-Collab/RNASBDD` contiene 25 checkpoints entrenados para un benchmark de diseño de fármacos basado en estructura de ARN (RNA-SBDD). Fue desarrollado por el equipo `Ced-Collab` y publica las versiones congeladas de seis arquitecturas de generación molecular condicionada por bolsillo: `biopolymer_context_targetdiff`, `diffbp`, `diffsbdd`, `graphbp`, `pocket2mol` y `targetdiff`. Cada arquitectura aparece bajo cuatro o cinco configuraciones de transferencia de aprendizaje, incluyendo preentrenamiento en CrossDocked (proteína-ligando), entrenamiento desde cero en ARN, ajuste fino sobre el preentrenamiento, entrenamiento conjunto 1:1 y variantes con 250 pasos de difusión.

El problema que aborda es la generación de ligandos que se unan a dianas de ARN, un área menos explorada que el diseño de fármacos basado en proteínas. La relevancia de este repositorio radica en que publica exactamente los archivos referenciados por ruta y SHA-256 en el CSV `per_pocket.csv` del agregado `full30-v1`, lo que garantiza reproducibilidad de cada métrica reportada. El dataset congelado, los splits y las referencias de evaluación se liberan en el repositorio companion [`CedLJH/rna-sbdd-v2`](https://huggingface.co/datasets/Ced-LJH/rna-sbdd-v2). Los pesos se distribuyen bajo licencia MIT y el repositorio ocupa aproximadamente 1.0 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seis arquitecturas de generacion molecular por difusion: `biopolymer_context_targetdiff`, `diffbp`, `diffsbdd`, `graphbp`, `pocket2mol`, `targetdiff` |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch) |

## Arquitectura y entrenamiento

El repositorio no proporciona una descripcion detallada de la arquitectura interna de cada uno de los seis modelos, pero todos son generadores moleculares basados en difusion, entrenados para condicionar la generacion de ligandos a un bolsillo de union. Los seis nombres corresponden a arquitecturas publicadas: TargetDiff, DiffSBDD, DiffBP, Pocket2Mol, GraphBP y una variante de contexto biologico sobre TargetDiff. Cada arquitectura se entrega con varios checkpoints que difieren en la estrategia de entrenamiento.

El presupuesto de entrenamiento esta congelado en **75.000 iteraciones con batch de 16 y semilla 2022**. Los ajustes disponibles son:

- `crossdocked-source`: preentrenamiento proteina-ligando en CrossDocked, usado como inicializacion para el ajuste fino en ARN y como brazo zero-shot.
- `crossdocked-source-336000`: la misma ejecucion de preentrenamiento de DiffSBDD, pero llevada a 336.000 iteraciones en lugar de 194.000.
- `rna-scratch`: entrenamiento solo con ARN, inicializacion aleatoria, con el presupuesto congelado.
- `rna-finetune`: entrenamiento en ARN inicializado desde el `crossdocked-source` correspondiente.
- `joint-1to1`: un unico modelo entrenado con CrossDocked y ARN mezclados 1:1.
- `*-t250`: entrenado con 250 pasos de difusion en lugar de 1000.

Se indica que faltan combinaciones que nunca fueron ejecutadas, no que hayan fallado. El dataset companion `CedLJH/rna-sbdd-v2` contiene el benchmark congelado de 713 bolsillos de ARN, los splits y las referencias para la evaluacion.

## Capacidades

- **Generacion de ligandos condicionada por estructura**: cada checkpoint genera moleculas que se ajustan a un bolsillo de union de ARN, usando la geometria del receptor como condicion.
- **Transferencia de aprendizaje proteina-ARN**: los pesos preentrenados en CrossDocked pueden aplicarse a ARN en modo zero-shot o usarse como inicializacion para ajuste fino, permitiendo estudiar la transferibilidad de modelos de diseno de farmacos entre biomoleculas.
- **Comparacion de arquitecturas**: al publicar seis arquitecturas bajo el mismo presupuesto de entrenamiento y las mismas particiones, el repositorio permite comparar disenos de modelos en igualdad de condiciones.
- **Variantes de diffusion**: los checkpoints `*-t250` ofrecen una alternativa con menos pasos de difusion, aunque no comparable directamente con los entrenados a 1000 pasos.
- **Reproducibilidad**: cada archivo esta asociado a un SHA-256 y es referenciado explicitamente en el CSV de evaluacion, lo que permite reproducir exactamente las metricas reportadas.
- **Soporte de datasets externos**: el repositorio apunta al dataset companion `rna-sbdd-v2` para obtener los bolsillos, los splits y las referencias de evaluacion.

No se documentan capacidades de tool calling, agentes, multilingue, vision, ni operaciones fuera de la generacion molecular.

## Casos de uso

- **Diseño de farmacos dirigido a ARN**: un investigador puede cargar cualquiera de los checkpoints de `targetdiff/rna-finetune.pt` o `biopolymer_context_targetdiff/rna-finetune.pt` y generar ligandos candidatos para un bolsillo de ARN concreto, partiendo de la estructura del receptor.
- **Estudio de transferencia entre dianas**: se pueden comparar las metricas de un checkpoint `crossdocked-source` (zero-shot sobre ARN) contra su version `rna-finetune` para cuantificar cuanto aporta el ajuste fino en ARN frente al preentrenamiento general en proteinas.
- **Benchmark de arquitecturas de generacion molecular**: el agregado `full30-v1` puede usarse como referencia para evaluar nuevas arquitecturas, comparandolas contra los resultados publicados de las seis familias de modelos en los mismos 713 bolsillos.
- **Seleccion de modelos para screening virtual**: un equipo de quimica computacional puede filtrar los ligandos generados por validez, estabilidad molecular, indice de choque atomico, QED y accesibilidad sintetica, usando los valores reportados en la tabla de resultados.
- **Ajuste fino de modelos de difusion para ARN**: los archivos `crossdocked-source` sirven como punto de partida para entrenar modelos propios sobre dianas de ARN especificas, heredando la representacion aprendida en proteinas.
- **Investigacion sobre metodos de evaluacion**: las notas sobre la invalidez de `site F1` como objetivo de optimizacion y la correlacion inversa de `diversity` con la calidad hacen de este repositorio una herramienta para estudiar que metricas son realmente utiles en diseno de farmacos basado en estructura.

## Benchmarks y rendimiento

Los siguientes valores corresponden al conjunto de evaluacion congelado: 713 bolsillos de prueba, 20 solicitudes por bolsillo y una unica identidad de evaluador. `clash_atom` y `site F1` se definen sobre 712 bolsillos (uno no tiene ligando nativo en contacto con residuos del receptor a 4.0 Å).

| Archivo | Validity | Mol_Stab | Clash_atom | Site_F1 | QED | SA |
|---|---|---|---|---|---|---|
| `biopolymer_context_targetdiff/crossdocked-source.pt` | 0.889 | 0.600 | 0.080 | 0.691 | 0.361 | 0.641 |
| `biopolymer_context_targetdiff/rna-finetune.pt` | 0.916 | 0.775 | 0.096 | 0.728 | 0.341 | 0.670 |
| `biopolymer_context_targetdiff/rna-scratch.pt` | 0.769 | 0.796 | 0.100 | 0.714 | 0.343 | 0.713 |
| `diffbp/joint-1to1-t250.pt` | 0.971 | 0.147 | 0.608 | 0.657 | 0.417 | 0.521 |
| `diffbp/rna-scratch-t250.pt` | 0.917 | 0.192 | 0.573 | 0.673 | 0.264 | 0.553 |
| `diffbp/rna-scratch.pt` | 0.904 | 0.169 | 0.522 | 0.692 | 0.370 | 0.610 |
| `diffsbdd/crossdocked-source-336000.pt` | 0.199 | 0.318 | 0.626 | 0.646 | 0.326 | 0.667 |
| `diffsbdd/crossdocked-source.pt` | 0.214 | 0.275 | 0.607 | 0.646 | 0.317 | 0.652 |
| `diffsbdd/joint-1to1-t250.pt` | 0.121 | 0.582 | 0.650 | 0.635 | 0.406 | 0.740 |
| `diffsbdd/rna-finetune.pt` | 0.445 | 0.681 | 0.580 | 0.662 | 0.372 | 0.746 |
| `diffsbdd/rna-scratch-t250.pt` | 0.342 | 0.505 | 0.602 | 0.644 | 0.362 | 0.685 |
| `diffsbdd/rna-scratch.pt` | 0.321 | 0.453 | 0.571 | 0.650 | 0.368 | 0.708 |
| `graphbp/crossdocked-source.pt` | 0.750 | 0.002 | 0.927 | 0.167 | 0.490 | 0.610 |
| `graphbp/joint-1to1.pt` | 0.770 | 0.009 | 0.894 | 0.241 | 0.480 | 0.640 |
| `graphbp/rna-finetune.pt` | 0.809 | 0.057 | 0.800 | 0.245 | 0.482 | 0.669 |
| `graphbp/rna-scratch.pt` | 0.829 | 0.039 | 0.834 | 0.243 | 0.480 | 0.644 |
| `pocket2mol/crossdocked-source.pt` | 0.275 | 0.372 | 0.264 | 0.428 | 0.387 | 0.692 |
| `pocket2mol/joint-1to1.pt` | 0.499 | 0.201 | 0.315 | 0.721 | 0.381 | 0.645 |
| `pocket2mol/rna-finetune.pt` | 0.571 | 0.181 | 0.167 | 0.720 | 0.407 | 0.644 |
| `pocket2mol/rna-scratch.pt` | 0.503 | 0.181 | 0.183 | 0.695 | 0.381 | 0.653 |
| `targetdiff/crossdocked-source.pt` | 0.886 | 0.652 | 0.057 | 0.696 | 0.350 | 0.640 |
| `targetdiff/joint-1to1-t250.pt` | 0.990 | 0.724 | 0.383 | 0.686 | 0.369 | 0.551 |
| `targetdiff/rna-finetune.pt` | 0.887 | 0.764 | 0.099 | 0.733 | 0.340 | 0.680 |
| `targetdiff/rna-scratch-t250.pt` | 0.951 | 0.588 | 0.295 | 0.701 | 0.315 | 0.572 |
| `targetdiff/rna-scratch.pt` | 0.893 | 0.768 | 0.095 | 0.715 | 0.338 | 0.675 |

El autor advierte que **`interaction_site_f1` no es un objetivo de optimizacion valido**: una regla cero-parametros que selecciona los residuos mas cercanos al centroide de la cavidad puntua 0.6784, y un emisor nulo sin estructura 0.6750, frente a 0.7330 del mejor brazo. En los bolsillos donde todos los brazos estan definidos, **ninguno de los ocho brazos publicados supera significativamente al nulo** cuando se puntuan todas las solicitudes. Ademas, `diversity`, `uniqueness` y `novelty` correlacionan negativamente con `site F1` (−0.601, −0.523, −0.505) y `diversity` correlaciona positivamente con choque atomico (+0.596).

## Requisitos de hardware

- El repositorio ocupa aproximadamente 1.0 GB en disco, pero no se publican requisitos de VRAM, GPU recomendadas o estimaciones de latencia.
- Los pesos se distribuyen en formato `.pt` de PyTorch, por lo que la carga de cada checkpoint requiere una instalacion de PyTorch compatible.
- No se especifica si los modelos caben en GPUs de consumidor como RTX 4090, ni se detallan opciones de despliegue con vLLM, llama.cpp, Ollama u otros motores de inferencia generica.
- Para investigacion, es plausible ejecutar la generacion en una GPU de consumidor, dado el tamano del repositorio, pero esto no esta confirmado por el autor.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparaciones con modelos externos de diseno de farmacos para ARN. La comparacion interna es directa entre las seis arquitecturas, siempre que se respete la regla de no mezclar checkpoints `t250` con los de 1000 pasos. Dentro de cada familia, las diferencias entre `rna-scratch`, `rna-finetune` y `crossdocked-source` permiten evaluar el efecto de la transferencia. Por ejemplo, en `targetdiff`, el ajuste fino (`rna-finetune`) logra la mayor validez de interaccion de sitio (site F1 0.733) y el mayor `mol_stab` (0.764), mientras que la variante `joint-1to1-t250` alcanza la mayor validez (0.990) pero menor `mol_stab` (0.724). En el extremo opuesto, `graphbp` presenta valores muy bajos de `mol_stab` y altos de `clash_atom`, lo que indica que sus ligandos son menos estables y chocan mas con el receptor.

## Limitaciones y advertencias

- **`interaction_site_f1` no debe usarse como objetivo de optimizacion**: una regla trivial o un emisor nulo consiguen puntuaciones casi identicas al mejor brazo (0.6784, 0.6750 frente a 0.7330).
- **Las metricas `diversity`, `uniqueness` y `novelty` son proxies invertidos**: un generador que produce moleculas implausibles las maximiza sin esfuerzo. Los ligandos cristalograficos nativos puntuan 0.185 en `novelty`, mientras que todos los brazos puntuan 0.80–0.99, estando mas lejos del comportamiento de referencia.
- **El piso de choque con el receptor es 0.440, no cero**: los ligandos nativos chocan con su propio receptor en el 44% de los casos bajo este kernel, por lo que `inter_clash_molecule_ratio` debe leerse con precaucion y es mejor atender a `inter_clash_atom_ratio`.
- **Los checkpoints `*-t250` no son comparables con los de 1000 pasos**: entrenar con 250 pasos no es un sustituto barato; por ejemplo, en TargetDiff el choque atomico pasa de 0.0948 a 0.2945 y la estabilidad molecular de 0.7682 a 0.5884. La regla correcta es comparar solo `joint-1to1-t250` contra `rna-scratch-t250`, nunca contra `rna-scratch` o `rna-finetune`.
- **Cuatro de los seis brazos de ARN no habian convergido en el presupuesto congelado de 75.000 iteraciones**: su loss de monitorizacion descendia aun al final. Por tanto, todos los valores absolutos son un **piso**, y las comparaciones entre arquitecturas llevan un confound de velocidad de convergencia.
- **Faltan combinaciones de configuraciones**: la model card indica explicitamente que las combinaciones ausentes son ajustes que nunca se ejecutaron, no fallos.
- **La licencia MIT permite uso comercial**, pero el repositorio es un benchmark de investigacion y no incluye documentacion para su despliegue en produccion. No se proporcionan directrices de seguridad ni de sesgos para la generacion de moleculas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Ced-Collab/RNASBDD
- Dataset companion: https://huggingface.co/datasets/CedLJH/rna-sbdd-v2
- Perfil de la organizacion: https://huggingface.co/Ced-Collab
