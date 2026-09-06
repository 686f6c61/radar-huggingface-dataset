# crhysc/alignn-csp-angular-ablations

## Resumen

`crhysc/alignn-csp-angular-ablations` es un conjunto de checkpoints entrenados para un estudio de ablación sobre ALIGNN-CSP, un modelo condicional de difusion para prediccion de estructuras cristalinas. Lo desarrolla el investigador `crhysc` y su proposito es analizar como afectan a la calidad de generacion dos componentes arquitectonicos: el uso de line graph (la extension ALIGNN) y el modelado de angulos entre atomos. El repositorio contiene pesos, configuraciones, historiales de entrenamiento y metricas de validacion para seis variantes del modelo, mas dos checkpoints parciales de un puerto cancelado de Alexandria.

La relevancia actual radica en que la prediccion de estructuras cristalinas es un problema abierto en ciencia de materiales, y los modelos de difusion condicional son una alternativa prometedora a metodos de busqueda estructural tradicionales. Este proyecto aporta evidencia empirica, con un protocolo reproducible, sobre que elementos de la arquitectura contribuyen a mejorar la generacion y cuales son prescindibles. Todos los pesos se distribuyen bajo licencia MIT y requieren el paquete `alignn` en una rama especifica para cargarse.

La arquitectura base combina redes neuronales de grafos de lineas con un proceso de difusion denoising sobre la celda y las posiciones atomicas. Los datasets de entrenamiento son JARVIS-DFT Supercon-3D y Alexandria DS-A/DS-B. No es un modelo de lenguaje: opera sobre estructuras cristalinas, no sobre texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ALIGNN-CSP, modelo de difusion condicional sobre grafos atomicos con variantes de line graph y modos de angulo |
| Parametros totales | No disponible (multiple checkpoints; repositorio de 0.4 GB) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica, modelo de difusion sobre estructuras) |
| Tipos de cuantizacion | No disponible (los pesos estan en formato PyTorch .pt sin cuantizacion) |
| Idiomas soportados | No disponible (modelo cientifico, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt, con estado EMA) |
| Dominio | Ciencia de materiales, prediccion de estructuras cristalinas |

## Arquitectura y entrenamiento

El modelo es una familia de variantes de ALIGNN-CSP, un modelo de difusion condicional que genera estructuras cristalinas a partir de un contexto de composicion o propiedades. La arquitectura base usa una red neuronal de grafos que procesa la estructura como un grafo atomico y su grafo de lineas (line graph), lo que permite capturar relaciones angulares. El proceso de difusion es denoising con T=1000 pasos, sigma en el intervalo [0.005, 0.5] y programacion coseno de la variable alpha. La funcion de perdida pondera los terminos de celda, fracciones atomicas y angulos con pesos (1, 10, 1) respectivamente.

La ablacion cubre dos ejes: por un lado, con o sin line graph; por otro, sin modelado angular, con un modo "derived" (angulos derivados de las posiciones) o un modo "independent" (angulos modelados como variables independientes). Esto da lugar a seis combinaciones denominadas `nolg`, `A0`, `nolg_ad`, `A3`, `nolg_b3` y `B3`. Cada variante se entreno con el mismo protocolo: optimizador AdamW, tasa de aprendizaje 1e-3 con one-cycle, lote de 64, dimension oculta 256, EMA con factor 0.999 y semilla 0. El checkpoint elegido fue el que minimizaba la perdida estructural de validacion. Los datasets son JARVIS-DFT Supercon-3D con particion 847/105/103 y Alexandria DS-A/DS-B con particion 6603/825/825.

## Capacidades

- Generacion de estructuras cristalinas completas: celda unitaria y posiciones atomicas fraccionarias, condicionadas a propiedades o composicion.
- Soporte de tres niveles de modelado angular: desactivado, derivado de posiciones y modelado independiente como variable adicional.
- Integracion con relajacion estructural: las metricas publicadas se obtuvieron tras relajar 32 candidatos con el potencial ALIGNN-FF.
- Evaluacion con AtomBench: cada checkpoint incluye metricas con y sin simetrizacion tras la relajacion.
- Reproducibilidad completa: cada run incluye `config.json`, `history.json`, `generation_config.json` y `ABLATION.yaml` con hashes SHA256 y trazabilidad.
- No tiene capacidades de lenguaje natural, tool calling, agentes ni vision. Es un modelo exclusivamente generativo de estructuras cristalinas.

## Casos de uso

- Descubrimiento de nuevos materiales superconductores: el dataset JARVIS-DFT Supercon-3D proporciona el contexto de entrenamiento; el modelo genera estructuras candidatas que pueden evaluarse posteriormente con DFT o con potenciales interatomicos.
- Generacion de estructuras como puntos de partida para calibracion de potenciales: las variantes con modelado angular independiente (`B3`, `nolg_b3`) son utiles para explorar si los grados de libertad angulares mejoran la diversidad estructural.
- Estudios de ablacion en arquitecturas de grafos: los seis checkpoints constituyen una base de comparacion controlada para medir el impacto del line graph y del modelado angular en la perdida estructural de validacion.
- Refuerzo de pipelines de prediccion de propiedades: combinando la generacion con modelos como ALIGNN-FF, se puede cerrar el ciclo de prediccion estructura-propiedad sin recurrir a calculos DFT costosos.
- Reproduccion de experimentos de investigacion: los diccionarios de configuracion e historiales permiten reentrenar o auditar los resultados, lo que facilita la comparacion con modelos generativos alternativos.
- Exploracion de polimorfos y espacio de fases: para una composicion quimica dada, el modelo puede muestrear multiples estructuras estables, ayudando a identificar fases metaestables de interes en ciencia de materiales.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card no incluye valores concretos de metricas como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje. Los checkpoints contienen archivos `metrics_sym.json` y `metrics_nosym.json` con resultados de AtomBench, pero los valores no se detallan en el README. Es importante destacar que estas metricas se calcularon despues de relajar 32 candidatos con ALIGNN-FF; el rendimiento del generador por si solo es una tarea abierta que no se incluye en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio completo pesa 0.4 GB, lo que sugiere que cada checkpoint es de tamano modesto, pero no se especifica el consumo de VRAM.
- GPU recomendadas: no se indican. Al ser un modelo de redes neuronales de grafos, se puede ejecutar en cualquier GPU compatible con PyTorch; las GPUs de gama media como RTX 3060 o superiores deberian ser suficientes, aunque no hay datos que lo confirmen.
- Capacidad de ejecucion en GPU de consumo: no hay informacion directa, pero el tamano reducido de los checkpoints apunta a que si es posible.
- Opciones de despliegue: la inferencia se realiza cargando los pesos con Python y el paquete `alignn` desde la rama `lg-angle-diffusion-matrix` del repositorio de `crhysc/alignn`. No es compatible con vLLM, llama.cpp, Ollama o TGI, ya que no se trata de un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos generativos de estructuras cristalinas en la informacion proporcionada. El estudio de ablacion compara internamente las seis variantes, que difieren en el uso de line graph y en el modo de modelado angular. La siguiente tabla resume las diferencias:

| Arm | Nivel angular | angle_mode | Line graph |
|---|---|---|---|
| nolg | Ninguno | off | No (9 convoluciones de pares) |
| A0 | Ninguno | off | Si (3 ALIGNN + 3 pares) |
| nolg_ad | Derivado (legacy) | derived_aux | No |
| A3 | Derivado (legacy) | derived_aux | Si |
| nolg_b3 | Independiente | independent | No |
| B3 | Independiente | independent | Si |

Como referencia, el proyecto uusnistgov/alignn es un modelo de prediccion de propiedades a partir de estructuras y no un generador de estructuras; por tanto, no es directamente comparable en la tarea de prediccion de estructuras cristalinas.

## Limitaciones y advertencias

- Los benchmarks almacenados junto a los pesos fueron puntuados despues de la relajacion ALIGNN-FF de 32 candidatos. Los resultados del generador sin relajacion no estan incluidos, por lo que no se puede evaluar la calidad de salida del modelo en solitario.
- Los checkpoints `A0` y `A1` del puerto de Alexandria están incompletos (cancelados a epoch menor o igual que 375) y se incluyen unicamente "for the record"; no deben usarse como resultado de una ablacion completa.
- El modelo depende de una rama especifica del repositorio de ALIGNN (`lg-angle-diffusion-matrix`, commit `f8121f4` o posterior). La version estable o las ramas principales pueden no ser compatibles con los checkpoints de las variantes "independent".
- No se proporciona informacion sobre sesgos o riesgos de alucinacion, al ser un modelo de ciencia de materiales. Las estructuras generadas deben validarse con metodos de primer principio o potenciales interatomicos antes de usarse en produccion.
- La licencia MIT permite uso comercial, pero la licencia de los datasets subyacentes (JARVIS-DFT y Alexandria) no se detalla en la model card. Verificar las condiciones de cada dataset antes de distribuir o usar las estructuras generadas en aplicaciones industriales.
- Al no ser un modelo de lenguaje, no ofrece capacidades de tool calling, soporte de agentes ni procesamiento multilingue.

## Enlaces

- HuggingFace: https://huggingface.co/crhysc/alignn-csp-angular-ablations
- Repositorio Github con el estudio de ablacion, el codigo y la documentacion de provenance: https://github.com/crhysc/alignn-csp-ablation
- Repositorio del paquete ALIGNN requerido para cargar los pesos, rama `lg-angle-diffusion-matrix`: https://github.com/crhysc/alignn
- Repositorio original de ALIGNN del NIST: https://github.com/usnistgov/alignn
