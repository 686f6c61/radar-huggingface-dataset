# paprakash/OMatGRPO

## Resumen

OMatGRPO es un conjunto de pesos y estructuras cristalinas generadas publicado por el autor paprakash en HuggingFace, asociado al articulo "Reinforcement Learning on the Discrete Composition Channel of a Crystal Generator: Validated Gains and Reward Hacking". No es un modelo de lenguaje: es un modelo generativo de materiales que produce estructuras cristalinas (composicion, posiciones atomicas y red) mediante el denominado canal discreto de composicion de un generador OMatG.

El modelo parte de un prior OMatG propio, preentrenado sobre MP-20 para generacion de novo con canales estocasticos de posicion y red y flow matching discreto enmascarado para las especies. Sobre ese prior se aplica aprendizaje por refuerzo (GRPO) con siete variantes de recompensa y enrutado, cada una publicada como un checkpoint independiente de 750 rollouts.

Su relevancia es doble: por un lado, libera pesos y estructuras exactas empleadas en las cifras de LeMat-GenBench del articulo, lo que permite reproducir la evaluacion; por otro, documenta explicitamente el fenomeno de reward hacking en el canal de composicion, con un control congelado y un baseline best-of-N de 48.000 estructuras para comparar. El tamano es pequeno (12.403.912 valores en 73 tensores, float32) y la licencia de los pesos es MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red OMatG (generador de cristales): canales estocasticos de posicion y red, con flow matching discreto enmascarado para las especies. No es un transformer de lenguaje |
| Parametros totales | 12.403.912 valores en 73 tensores (float32) |
| Longitud de contexto | no aplicable (modelo generativo de estructuras cristalinas, no secuencial) |
| Tipos de cuantizacion | solo float32; no se documentan cuantizaciones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | no aplicable (no procesa texto) |
| Licencia | MIT para los pesos; las estructuras dependen de UMA (licencia propia) y de datos derivados de MP-20 (CC BY 4.0) |
| Formato de pesos | safetensors (state dict float32, 73 tensores) |

## Arquitectura y entrenamiento

El modelo es un generador OMatG: la red muestrea posiciones atomicas y parametros de red de forma estocastica, mientras que las especies quimicas se generan mediante flow matching discreto enmascarado sobre el canal de composicion. El prior incluido en `prior/prior.safetensors` es un modelo OMatG propio del autor, preentrenado sobre MP-20 para generacion de novo; no es uno de los modelos publicados por los autores originales de OMatG. Su configuracion esta en `prior/train.yaml`, y el autor indica que el hardware, el tiempo de pared y la semilla del preentrenamiento no se registraron.

El ajuste se realiza con aprendizaje por refuerzo sobre el canal discreto de composicion. Todos los runs usaron semilla 0, 4 grupos de 16 estructuras por rollout y 750 rollouts. Se publican siete identificadores, cada uno con su configuracion de ejecucion (`configs/runs/<identifier>.yaml`): `arityguard_creatrelax` (OMatGRPO), `canonical_creatrelax` (discovery), `sparseworst_creatrelax` (penalty routing), `arityguard` (guarded, pre-creatividad), `canonical` (discovery, pre-creatividad), `sparseworst` (penalty routing, pre-creatividad) y `frozen_control` (control con composicion congelada). Las dos referencias de MP-20 de la recompensa no se incluyen y deben reconstruirse con `scripts/build_references.py`.

Las estructuras se generaron con el protocolo del articulo: 2.500 estructuras, sampler consistente (64 puntos temporales, ruido de especies 0), semilla 42, fragmentos de 100, relajacion con FIRE y UMA `uma-s-1p2` incluyendo la celda (tolerancia de fuerza 0,05 eV/Å, maximo 500 pasos) y guardas de celda y de especies enmascaradas antes y despues de la relajacion. La unica excepcion es el conjunto best-of-N, cuyo pool de 48.000 estructuras se muestreo del prior con semilla 4242 y del que se relajaron y puntuaron 2.500 con el mismo protocolo.

## Capacidades

- Generacion de novo de estructuras cristalinas: composicion, posiciones atomicas y red.
- Generacion condicionada por refuerzo sobre el canal discreto de composicion, con distintas politicas de recompensa (discovery, penalty routing, guarded, control congelado).
- Produccion de conjuntos de estructuras validadas mediante calculo de E_hull contra el hull convexo de LeMat-Bulk-MLIP-Hull.
- Evaluacion de estabilidad con un ensemble multi-MLIP (ORB, MACE y UMA) dentro de LeMat-GenBench.
- Filtrado por guardas de celda y de especies antes y despues de la relajacion.
- Cribado de novedad y unicidad frente a MP-20 y Alex-MP-20 (columnas `novel_mp20`, `novel_alexmp`, `msun_mp20`, `msun_alexmp` del resumen de estructuras).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Descubrimiento de materiales inorganicos: usar los pesos de `arityguard_creatrelax` (OMatGRPO) para muestrear candidatos metastables, unicos y novedosos, y priorizar los que superan las guardas de celda y especies antes de pasar a DFT.
- Cribado de alto rendimiento con MLIPs: generar lotes de 2.500 estructuras con el protocolo documentado (64 puntos temporales, semilla 42, fragmentos de 100) y relajarlas con UMA o MACE para acotar el espacio de busqueda antes de calculos mas caros.
- Generacion de datasets sinteticos de cristales: producir pares estructura-etiqueta con E_hull calculado, utiles para entrenar o aumentar modelos de prediccion de estabilidad.
- Investigacion sobre reward hacking en RL generativo: emplear el par `canonical_creatrelax` frente a `frozen_control` y el baseline `bestofn48k_top2500` para estudiar como una recompensa mal especificada degrada la diversidad estructural (192 de mSUN frente a 1.138 del modelo ajustado).
- Reproducibilidad de resultados publicados: descargar `structures/<identifier>/cifs.zip` y los JSON de LeMat-GenBench para replicar las cifras del articulo con el commit y el preset indicados.
- Comparacion de estrategias de enrutado de recompensa: evaluar en un mismo pipeline las variantes `canonical`, `sparseworst` y `arityguard`, con y sin relajacion creativa, para medir el impacto en mSUN.
- Cribado en dominios concretos (baterias, catalisis, termoelectricos): filtrar los candidatos generados por sistema quimico de interes usando las columnas `formula`, `n_elements` y `ref_rel` del resumen de estructuras antes de cualquier validacion experimental.

## Benchmarks y rendimiento

Los resultados disponibles son las cifras de mSUN de LeMat-GenBench, ejecutado en el commit `58e6eae3e4a6c87c22171cf069123ecc4e2fa7e6` con el preset `comprehensive_multi_mlip_hull`. Los tres potenciales del ensemble de estabilidad (ORB, MACE y UMA) puntuaron cada estructura valida. mSUN cuenta estructuras metastables, unicas y novedosas, y excluye las que estan sobre el hull.

| Conjunto | Descripcion | CIFs | mSUN (LeMat-GenBench) |
|---|---|---|---|
| `R0` | el prior | 2497 | 336 |
| `bestofn48k_top2500` | baseline best-of-N: las 2.500 mejores de 48.000 muestreadas del prior | 2500 | 192 |
| `frozen_control` | control con composicion congelada | 2495 | 245 |
| `canonical` | discovery, pre-creatividad | 2490 | 1063 |
| `canonical_creatrelax` | discovery | 2463 | 939 |
| `sparseworst` | penalty routing, pre-creatividad | 2494 | 789 |
| `sparseworst_creatrelax` | penalty routing | 2495 | 841 |
| `arityguard` | guarded, pre-creatividad | 2486 | 982 |
| `arityguard_creatrelax` | OMatGRPO | 2485 | 1138 |

No se han publicado en la informacion disponible resultados de benchmarks tipo MMLU, HumanEval o GSM8K, dado que no es un modelo de lenguaje. Tampoco se aportan cifras de latencia o throughput de generacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el state dict completo son 12.403.912 valores en float32, aproximadamente 50 MB de pesos; el consumo agregado del pipeline (sampler, guardas y relajacion) dominara sobre el propio modelo.
- GPU: cualquier GPU consumer reciente es suficiente para los pesos; la relajacion con UMA y la evaluacion con el ensemble ORB/MACE/UMA son las fases que mas recursos exigen.
- CPU: la inferencia del generador es viable en CPU dado el tamano del modelo; la relajacion y el scoring multi-MLIP son mas costosos y se benefician de GPU.
- Opciones de despliegue: el codigo esta en el repositorio GitHub del autor y los pesos se cargan con el; `scripts/download_assets.py` descarga los ficheros, los verifica contra `SHA256SUMS` y descomprime los CIF. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni runtimes de LLM, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 0,4 GB, incluyendo pesos, estructuras comprimidas y resultados de evaluacion.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada frente a otros generadores de cristales (por ejemplo, los modelos liberados por los autores originales de OMatG). La comparacion interna documentada es la siguiente:

| Modelo o conjunto | Tipo | Parametros | mSUN | Licencia |
|---|---|---|---|---|
| OMatGRPO (`arityguard_creatrelax`) | OMatG + GRPO con guarda de aridad | 12.403.912 valores | 1138 | MIT (pesos) |
| Prior OMatG (`R0`) | OMatG preentrenado en MP-20 | 12.403.912 valores | 336 | MIT (pesos) |
| `bestofn48k_top2500` | baseline best-of-N del prior | no aplicable | 192 | MIT (pesos) |
| `frozen_control` | control con composicion congelada | 12.403.912 valores | 245 | MIT (pesos) |

Comparativa frente a otros generadores de cristales de la literatura: no disponible.

## Limitaciones y advertencias

- El propio articulo documenta reward hacking: el baseline best-of-N obtiene 192 de mSUN frente a 1.138 del modelo ajustado, lo que indica que la recompensa optimizada no equivale necesariamente a mejor calidad fisica y puede empujar la politica hacia atajos.
- El prior es un modelo propio del autor, no uno de los modelos publicados por los autores de OMatG; los resultados no son directamente transferibles a esos checkpoints.
- No se registraron hardware, tiempo de pared ni semilla del preentrenamiento del prior, lo que limita la reproducibilidad exacta de esa fase.
- Las dos referencias de MP-20 de la recompensa no se incluyen en el repositorio y deben reconstruirse con `scripts/build_references.py` a partir de datos publicos.
- LeMat-GenBench descarta los CIF que su pymatgen no puede parsear, por lo que el recuento de estructuras puede ser ligeramente inferior al numero de ficheros; los CIF van comprimidos en zip porque el repositorio admite como maximo 20.000 ficheros.
- Las estructuras se calcularon con el potencial UMA (`facebook/UMA`), sujeto a su propia licencia, y derivan de un modelo entrenado sobre MP-20, cuyos datos son CC BY 4.0; los valores de E_hull usan el hull convexo de LeMat-Bulk-MLIP-Hull, que no se incluye.
- El modelo no esta pensado para uso comercial directo como servicio de generacion: aunque los pesos son MIT, las dependencias (UMA, datos de Materials Project) imponen condiciones adicionales.
- No hay datos de idiomas, contexto ni cuantizacion porque no es un modelo de lenguaje; cualquier uso fuera de la generacion de cristales queda fuera de su ambito.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/paprakash/OMatGRPO
- Codigo: https://github.com/paprakash/OMatGRPO
- Paper MP-20 citado en el README y en las etiquetas: https://arxiv.org/abs/2110.06197
- Referencia arXiv etiquetada en el repositorio (presumiblemente OMatG; no confirmado en la informacion disponible): https://arxiv.org/abs/2502.02582
- Dataset del hull convexo: https://huggingface.co/datasets/LeMaterial/LeMat-Bulk-MLIP-Hull
- Potencial UMA: https://huggingface.co/facebook/UMA
- Materials Project (datos CC BY 4.0, A. Jain et al., 2013): https://doi.org/10.1063/1.4812323
- Articulo asociado: "Reinforcement Learning on the Discrete Composition Channel of a Crystal Generator: Validated Gains and Reward Hacking", referencia BibTeX `prakash2026omatgrpo`; enlace arXiv no disponible en el momento de la consulta.
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos resultados obtenidos eran foros sin relacion con el contenido.
