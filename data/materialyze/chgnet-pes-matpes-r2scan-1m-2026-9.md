# materialyze/CHGNet-PES-MatPES-r2SCAN-1M-2026.9

## Resumen

CHGNet-PES-MatPES-r2SCAN-1M-2026.9 es un potencial interatomico universal de aprendizaje automatico (machine learning interatomic potential, MLIP) basado en una red neuronal de grafos de tipo CHGNet. Lo entrena Bowen Deng y lo redistribuye la organizacion materialyze; el repositorio original es BowenD-UCB/CHGNet-PES-MatPES-r2SCAN-1M-2026.9. No es un modelo de lenguaje: predice energia, fuerzas, tensor de tensiones y momentos magneticos de estructuras cristalinas periodicas, con el objetivo de sustituir o prefiltrar calculos de DFT en simulaciones atomisticas.

El modelo es una variante compacta de 1.083.842 parametros (~1M) para el backend PyTorch Geometric de MatGL, con dimension de embedding 128, 4 bloques de interaccion y cutoff radial de 6,0 Å. Se entrena sobre el conjunto MatPES r2SCAN 2025.2 (347.889 estructuras de entrenamiento) con el funcional meta-GGA r2SCAN, e incorpora la correccion de invariancia de frontera periodica en supercelulas (issue #839 de MatGL), seguida de un refinamiento en dos etapas orientado a reducir el error de energia y fuerzas.

Su relevancia practica esta en el tamano: al ser un potencial fundacional de ~1M de parametros, puede ejecutarse en CPU o en GPU de gama baja y encadenarse en cribados de miles de estructuras, algo inviable con DFT. La contrapartida es que su fidelidad depende por completo de la cobertura quimica del dataset MatPES y de que la version de MatGL utilizada incluya la correccion de invariancia citada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos CHGNet (`matgl.models.CHGNet`), backend PyTorch Geometric |
| Parametros totales | 1.083.842 (~1M) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje; el alcance espacial lo fijan los cutoffs: 6,0 Å radial y 3,0 Å three-body) |
| Tipos de cuantizacion | no disponible; no se documentan variantes cuantizadas (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | no disponible (no declarada en la model card ni en los metadatos de Hugging Face) |
| Formato de pesos | no especificado en la documentacion; checkpoint cargable mediante `matgl.load_model("CHGNet-PES-MatPES-r2SCAN-1M-2026.9")` sobre MatGL/PyTorch |
| Dimension de embedding | 128 |
| Bloques de interaccion | 4 |
| Dimensiones ocultas de convolucion | [64] |
| Cutoff radial | 6,0 Å |
| Cutoff three-body | 3,0 Å |
| Dataset de entrenamiento | MatPES r2SCAN 2025.2 (347.889 / 19.327 / 19.328 estructuras en train/val/test) |
| Funcional de referencia | meta-GGA r2SCAN |
| Libreria | matgl |
| Tamano del repositorio | 0,0 GB segun Hugging Face (probablemente los ficheros LFS no se contabilizan) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

CHGNet es una red neuronal de grafos con representaciones de atomos y enlaces sobre una grafica de vecindad con cutoff radial de 6,0 Å y termino de tres cuerpos con cutoff de 3,0 Å. En esta configuracion compacta el embedding es de 128 dimensiones, hay 4 bloques de interaccion y las capas de convolucion tienen una unica dimension oculta de 64. El modelo se entreno con autograd continuo de tres cuerpos, lo que permite obtener fuerzas y tensiones por diferenciacion automatica de la energia respecto a las posiciones atomicas y a la celda. Ademas de energia y fuerzas, la cabeza del modelo predice momento magnetico por atomo, de ahi que la model card reporte un error especifico de magmom.

Los datos de entrenamiento proceden de MatPES r2SCAN 2025.2, el conjunto de superficies de energia potencial descrito en el articulo arXiv:2503.04070, con 347.889 estructuras de entrenamiento, 19.327 de validacion y 19.328 de test. Esta version incorpora la correccion de invariancia de frontera periodica mediante line-graph de supercelula (issue #839 de MatGL) y un refinamiento posterior en dos etapas destinado a minimizar los errores de energia y fuerza. La model card no detalla la composicion quimica exacta del dataset, el numero total de tokens equivalentes ni si hubo etapas de RLHF o DPO (no aplicables en este dominio); tampoco indica el coste de entrenamiento ni el hardware empleado.

## Capacidades

- Prediccion de energia potencial total y por atomo de estructuras cristalinas periodicas.
- Prediccion de fuerzas atomicas por diferenciacion automatica, aptas para dinamica molecular y relajacion estructural.
- Prediccion del tensor de tensiones (stress) de la celda.
- Prediccion de momentos magneticos por atomo (potencial informado por carga/magnetismo).
- Invariancia estricta frente a representaciones equivalentes por imagenes especulares y supercelulas, gracias a la correccion #839.
- Potencial fundacional: cobertura de quimicas diversas segun el alcance del dataset MatPES r2SCAN.
- Integracion con ASE mediante `matgl.ext.ase.PESCalculator`, lo que permite relajaciones, MD y calculos de propiedades derivadas con herramientas estandar.
- Soporte de ejecucion en CPU y en GPU CUDA a traves de MatGL/PyTorch.
- No dispone de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni capacidades multilingues: no son aplicables a un potencial interatomico.

## Casos de uso

- Cribado de alto rendimiento de materiales: relajar decenas de miles de candidatos estructurales con `PESCalculator` para descartar geometrias inestables antes de gastar horas de DFT en los supervivientes.
- Precalentamiento de dinamica molecular: usar el modelo para equilibrar y thermalizar una celda (energia y fuerzas por autograd) y reservar la DFT para la trayectoria final o para calculos puntuales de alta precision.
- Simulaciones en supercelulas: al garantizar la invariancia frente a representaciones de supercelula, los resultados son consistentes al cambiar de celda de simulacion, algo critico cuando se comparan fases con distinta multiplicidad de celda.
- Estimacion de estabilidad termica: MD con potencial MLIP para explorar transiciones de fase, expansion termica o desorden a temperaturas donde DFT seria prohibitivo.
- Calculo de propiedades derivadas que requieren fuerzas y tensiones, como elasticidad o fonones por diferencias finitas, con codigo externo sobre las predicciones del modelo.
- Estudio del magnetismo estructural: la cabeza de momentos magneticos permite analizar orden magnetico y su acoplamiento con la geometria sin coste de DFT.
- Generacion de datos sinteticos y aprendizaje activo: usar el potencial como anotador barato para preetiquetar configuraciones y seleccionar despues las mas inciertas para calculo DFT.
- Prototipado y docencia en entornos sin GPU: con ~1M de parametros es viable ejecutar ejemplos completos en portatil, integrado con pymatgen y ASE.

## Benchmarks y rendimiento

La model card publica errores sobre las particiones oficiales de MatPES 2025.2 (no se han publicado resultados de benchmarks comparativos con otros potenciales en la informacion disponible):

| Particion | Estructuras | Energy MAE | Force MAE | Stress MAE | Magmom MAE |
|---|---|---|---|---|---|
| Train | 347.889 | 25,46 meV/atomo | 112,27 meV/Å | 0,6343 GPa | 0,0925 μB |
| Validacion | 19.327 | 28,00 meV/atomo | 141,18 meV/Å | 0,7187 GPa | 0,0953 μB |
| Test | 19.328 | 27,45 meV/atomo | 137,58 meV/Å | 0,7094 GPa | 0,0949 μB |

La diferencia entre train y test es de 1,99 meV/atomo en energia y de 25,31 meV/Å en fuerza, lo que indica un sobreajuste limitado. No se proporcionan MMLU, HumanEval, GSM8K ni metricas equivalentes porque no son aplicables a un potencial interatomico. Tampoco se publican curvas de aprendizaje, errores por elemento quimico ni comparaciones con DFT a nivel de propiedad (fonones, elasticidad, transiciones de fase).

## Requisitos de hardware

- Peso de los parametros: 1.083.842 parametros equivalen a ~4,3 MB en fp32 y ~8,7 MB en fp64. Cifra derivada del recuento de parametros, no publicada por el autor.
- La VRAM real de inferencia no la determina el modelo, sino la construccion de la grafica de vecindad y las listas de vecinos, que escalan con el numero de atomos y con los cutoffs de 6,0 Å y 3,0 Å. No se han publicado mediciones de memoria por tamano de celda.
- Cabe en GPU de consumo: cualquier GPU NVIDIA con soporte CUDA puede ejecutar la inferencia; el cuello de botella es el tamano de la supercelula, no los pesos.
- Tambien es viable en CPU para celdas pequenas, dado el tamano del modelo; no se publican tiempos por estructura ni por atomo.
- GPU recomendadas: no disponible en la informacion proporcionada. No hay datos de latencia ni de throughput (estructuras/s) para A100, H100, RTX 4090 u otras.
- Despliegue: MatGL sobre PyTorch con backend PyG, integracion con ASE (`PESCalculator`) y pymatgen. Es imprescindible una version de MatGL que incluya la correccion de invariancia #839 (introducida en el PR #843) para reproducir los resultados publicados.
- No aplican vLLM, TGI, llama.cpp, Ollama ni servidores de inferencia para LLM: el formato y el caso de uso son distintos.

## Comparativa con modelos similares

No se han proporcionado resultados comparativos frente a otros potenciales interatomicos, y la model card no incluye tablas de comparacion. Las categorias con las que un lector querria contrastar este modelo son las variantes mayores de la familia CHGNet entrenadas sobre MatPES, los potenciales fundacionales de proposito general (MACE, M3GNet, SevenNet) y los potenciales especificos de quimica concreta, pero no hay datos verificables de ninguno de ellos en la informacion disponible.

| Aspecto | CHGNet-PES-MatPES-r2SCAN-1M-2026.9 | Alternativas de la misma categoria |
|---|---|---|
| Parametros | 1.083.842 (~1M) | no disponible |
| Alcance espacial | 6,0 Å radial / 3,0 Å three-body | no disponible |
| Energy MAE (test) | 27,45 meV/atomo | no disponible |
| Force MAE (test) | 137,58 meV/Å | no disponible |
| Licencia | no disponible | no disponible |
| Disponibilidad | Hugging Face: materialyze y BowenD-UCB | no disponible |

## Limitaciones y advertencias

- Licencia no declarada. Ni la model card ni los metadatos de Hugging Face especifican condiciones de uso, por lo que no puede confirmarse que el uso comercial este permitido. Es imprescindible aclararlo con el autor antes de integrarlo en produccion.
- El repositorio figura con 0,0 GB y 0 descargas, 0 likes. Conviene verificar que los pesos estan realmente presentes (los ficheros LFS pueden no contabilizarse) y que el artefacto es integro.
- Se trata de una re-subida (rehosted) del modelo de BowenD-UCB. Para trazabilidad y citacion, la referencia canonica es el repositorio original y el PR #843 de MatGL.
- No hay validacion externa ni adopcion documentada: todas las metricas publicadas provienen del propio autor.
- El error de fuerza en test es de 137,58 meV/Å (0,1376 eV/Å). Es un valor que debe contrastarse con los requisitos concretos de cada aplicacion antes de usarlo para relajaciones finas o propiedades sensibles a las fuerzas.
- No hay resultados de benchmarks comparativos publicados, ni desglose por elemento quimico o por tipo de estructura, lo que impide acotar el dominio de validez.
- Extrapolacion fuera de distribucion: fuera de las quimicas y geometrias representadas en MatPES r2SCAN 2025.2, las energias y fuerzas pueden ser arbitrariamente erroneas sin aviso. No existe mecanismo de calibracion de incertidumbre documentado.
- Los sesgos del modelo heredan los del dataset MatPES: composicion quimica cubierta, proporciones relativas de cada elemento y condiciones de calculo del funcional r2SCAN. La model card no detalla esa composicion.
- Los cutoffs finitos (6,0 Å radial, 3,0 Å three-body) limitan la descripcion de interacciones de largo alcance; la model card no documenta correcciones electrostaticas de largo alcance.
- Dependencia de version: los resultados pueden diferir si se carga con una version de MatGL anterior a la correccion #839.
- No aplica el concepto de alucinacion en el sentido de un modelo de lenguaje, pero el riesgo equivalente es producir predicciones numericas plausibles y silenciosamente incorrectas fuera del dominio de entrenamiento.
- No admite instrucciones en lenguaje natural, tool calling, agentes ni despliegue como servicio conversacional; cualquier intento de usarlo en ese papel es un error de categoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/materialyze/CHGNet-PES-MatPES-r2SCAN-1M-2026.9
- Repositorio original del autor: https://huggingface.co/BowenD-UCB/CHGNet-PES-MatPES-r2SCAN-1M-2026.9
- Repositorio MatGL: https://github.com/materialyzeai/matgl
- Pull request de introduccion del modelo (matgl #843): https://github.com/materialyzeai/matgl/pull/843
- Dataset MatPES: https://huggingface.co/datasets/materialyze/matpes
- Articulo del dataset: A Foundational Potential Energy Surface Dataset for Materials, https://arxiv.org/abs/2503.04070
- DOI del articulo: https://doi.org/10.48550/arXiv.2503.04070
