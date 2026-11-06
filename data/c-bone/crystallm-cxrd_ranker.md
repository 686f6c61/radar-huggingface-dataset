# c-bone/CrystaLLM-cXRD_ranker

## Resumen

CrystaLLM-cXRD_ranker es una red convolucional 1D de regresion, de aproximadamente 159.000 parametros, desarrollada por Cyprien Bone y colaboradores (University College London) dentro del proyecto CrystaLLM-cXRD. Su funcion no es generar estructuras cristalinas, sino reordenar y seleccionar candidatos: dado un patron de difraccion de rayos X de polvo (XRD) y un conjunto de estructuras candidatas generadas por un modelo CrystaLLM-cXRD, predice el RMSD de cada candidata respecto a la estructura verdadera y conserva la de menor error predicho.

El modelo sustituye los criterios de ranking heuristicos habituales en este tipo de pipelines, como la perplejidad del generador o el residuo de perfil fijo R_wp, por una puntuacion aprendida especificamente para la tarea. Segun la model card, este cambio eleva la tasa de acierto con un unico candidato por material del 62,78 % (perplejidad) y el 68,04 % (R_wp) al 70,75 % en el split de test de MP-20, y del 48,93 % y 55,00 % al 58,00 % en CHILI-100K.

Es relevante porque aborda un cuello de botella practico en la resolucion de estructuras cristalinas a partir de XRD: la seleccion entre multiples soluciones plausibles. Al ser un modelo muy pequeno, su coste computacional es minimo frente al del generador, lo que lo hace adecuado como etapa final de un pipeline de determinacion estructural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional 1D con seis bloques convolucionales residuales dilatados, pooling medio y maximo, y cabeza lineal de regresion |
| Parametros totales | ~159K |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada fija de 3 canales x 1000 puntos en una rejilla Q de `arange(0, 10, 0.01)` Å⁻¹ |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (documentacion y metadatos); la tarea es cientifica, no linguistica |
| Licencia | MIT |
| Formato de pesos | Pesos PyTorch (libreria `pytorch`); no se especifica formato de serializacion en la informacion disponible |

## Arquitectura y entrenamiento

La entrada del modelo son tres canales alineados sobre una rejilla fija de 1000 puntos en Q: el perfil XRD medido (entrada `(1000, 2)` de `[Q, I]`, normalizada al maximo en `[0, 1]`), los picos de difraccion simulados del CIF candidato, binneados sobre la misma rejilla Q sin ensanchamiento, y la propia posicion Q escalada a `[0, 1]` para que la red sepa donde se situa cada caracteristica. Sobre los tres canales se aplican seis bloques de convolucion residual dilatada; despues, un pooling medio y maximo colapsa la representacion en un unico vector y una cabeza lineal devuelve el RMSD predicho. Los candidatos que no coinciden con la estructura verdadera se entrenan hacia un RMSD objetivo de 0,5.

El entrenamiento utiliza los pools de candidatos generados por CrystaLLM-cXRD sobre el split de validacion del dataset `c-bone/cxrd_alex-mp-20`, que comprende 67.518 estructuras con 20 candidatos cada una. No se especifica en la informacion disponible el numero de tokens ni otros detalles del regimen de entrenamiento (optimizador, epocas, funciones de perdida adicionales).

## Capacidades

- Prediccion del RMSD de una estructura candidata respecto a la estructura verdadera a partir de su patron XRD simulado y del perfil medido.
- Ranking de un pool de candidatos generados por CrystaLLM-cXRD, seleccionando el de menor RMSD predicho.
- Sustitucion de criterios de ranking basados en perplejidad o en el residuo R_wp como modo de puntuacion por defecto (`--scoring_mode LEARNED`) en busquedas Z con XRD continuo.
- Reranking de pools de candidatos ya existentes mediante la herramienta `rerank_xrd.py`.
- Transferencia a datos fuera de dominio: se evaluo en CHILI-100K sin reentrenamiento y el finetuning en ese conjunto no mejoro el resultado.
- No soporta tool calling, agentes, vision, audio ni generacion de texto; es un regresor especializado.

## Casos de uso

- Resolucion de estructuras cristalinas a partir de XRD de polvo: tras generar un pool de candidatos con CrystaLLM-cXRD, el ranker selecciona la estructura mas probable, reduciendo el trabajo manual de inspeccion sobre decenas de soluciones.
- Pipeline automatizado de determinacion estructural: se integra como etapa final de puntuacion en flujos que ya convierten el difractograma a perfil continuo en Q, aportando una mejora medible de acierto frente a heuristicas.
- Reranking de resultados existentes: con `rerank_xrd.py` se puede reprocesar un pool de candidatos ya generado sin repetir la inferencia del generador, lo que abarata la mejora de calidad.
- Filtrado previo a refinamiento: las candidatas mejor puntuadas pueden pasar a un refinamiento Rietveld o a calculos DFT, reduciendo el numero de estructuras a refinar.
- Evaluacion comparativa de generadores: sirve como metrica de seleccion para comparar variantes de modelos generativos de estructuras sobre los mismos pools de candidatos.
- Investigacion en materiales con datos simulados: util para experimentar con seleccion aprendida en conjuntos tipo MP-20 antes de trasladar el enfoque a datos de laboratorio.
- Prototipado rapido en entornos con recursos limitados: al tener ~159K parametros, la inferencia es muy ligera y puede ejecutarse en CPU junto al resto del pipeline.

## Benchmarks y rendimiento

Tasa de acierto con un unico candidato por material (match rate), segun la model card:

| Conjunto de test | Ranking por perplejidad | Ranking por R_wp | Ranking aprendido (este modelo) |
|---|---|---|---|
| MP-20 | 62,78 % | 68,04 % | 70,75 % |
| CHILI-100K | 48,93 % | 55,00 % | 58,00 % |

En ambos conjuntos ninguna estructura se vio durante el entrenamiento. El finetuning sobre CHILI-100K no mejoro el resultado en ese conjunto. No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros), que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con ~159K parametros, los pesos ocupan del orden de centenares de kilobytes en precision estandar.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada resulta sobrada.
- Cabe en cualquier GPU consumer e incluso puede ejecutarse en CPU sin problema practico.
- Opciones de despliegue: PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. La integracion prevista es mediante los scripts del repositorio CrystaLLM-cXRD (`rerank_xrd.py` y notebooks).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un coste despreciable frente a la generacion de candidatos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de ranking aprendido para XRD en la documentacion proporcionada. La comparacion mas directa disponible es contra los criterios de ranking heuristicos usados en el mismo pipeline:

| Metodo de seleccion | Tipo | Match rate MP-20 | Match rate CHILI-100K |
|---|---|---|---|
| Perplejidad del generador | Heuristico | 62,78 % | 48,93 % |
| Residuo R_wp | Heuristico | 68,04 % | 55,00 % |
| CrystaLLM-cXRD_ranker | Aprendido (~159K parametros) | 70,75 % | 58,00 % |

## Limitaciones y advertencias

- No es una puntuacion de RMSD calibrada para una estructura individual: solo ordena candidatos de un mismo patron entre si.
- No aplica a modelos basados en listas de picos (top-20); requiere un perfil XRD continuo.
- Si no se declara longitud de onda, se asume CuKα1, lo que desplaza silenciosamente todos los picos en Q en datos de otra fuente.
- Sesgo hacia datos computacionales: los patrones de entrenamiento se simulan a partir de estructuras DFT relajadas, con picos mas limpios y ordenados que los escaneos de laboratorio.
- Sensibilidad al preprocesado: el resultado depende de la sustraccion de fondo y de la longitud de onda empleadas; se recomienda inspeccionar la conversion con `--save_plot` antes de confiar en el resultado.
- Esta acotado por el pool: si ningun candidato coincide con la estructura verdadera, el modelo igualmente devuelve uno.
- Licencia MIT, que permite uso comercial sin restricciones adicionales conocidas, aunque no se detallan mas condiciones en la informacion disponible.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero si existe el riesgo de seleccionar una candidata incorrecta cuando el pool carece de la solucion correcta.

## Enlaces

- Hugging Face: https://huggingface.co/c-bone/CrystaLLM-cXRD_ranker
- Repositorio GitHub: https://github.com/C-Bone-UCL/CrystaLLM-cXRD
- Dataset: https://huggingface.co/datasets/c-bone/cxrd_alex-mp-20
- Paper (arXiv): https://arxiv.org/abs/2511.21299
- Notebook de entrenamiento y transferencia a CHILI-100K: https://github.com/C-Bone-UCL/CrystaLLM-cXRD/blob/main/notebooks/B4_learned_ranker.ipynb
- Notebook de benchmark MP-20: https://github.com/C-Bone-UCL/CrystaLLM-cXRD/blob/main/notebooks/B1_mp20_benchmark.ipynb
- Notebook de benchmark CHILI-100K: https://github.com/C-Bone-UCL/CrystaLLM-cXRD/blob/main/notebooks/B2_chili100k_benchmark.ipynb
- Pagina del proyecto CrystaLLM-pi: https://c-bone-ucl.github.io/CrystaLLM-pi/models/
