# BowenD-UCB/CHGNet-PES-MatPES-PBE-1M-2026.9

## Resumen

CHGNet-PES-MatPES-PBE-1M-2026.9 es un potencial interatomico universal (machine learning interatomic potential, MLIP) basado en una red neuronal de grafos CHGNet, desarrollado por el usuario BowenD-UCB y publicado en HuggingFace Hub para el backend de PyTorch Geometric (PyG) de la libreria MatGL. No es un modelo de lenguaje: su funcion es predecir la energia, las fuerzas, el tensor de tensiones y los momentos magneticos de estructuras cristalinas a partir de sus posiciones atomicas, sustituyendo a la DFT en tareas de simulacion atomistica.

El modelo es una version compacta del CHGNet estandar: 1.083.842 parametros (aproximadamente 1 M) frente a los 2,7 M del baseline, con `num_blocks=4`, `dim=128` y `conv_hidden_dims=[64]`. Fue entrenado desde cero con autograd continuo de tres cuerpos sobre el conjunto MatPES PBE 2024.11 (434.712 estructuras) y, segun la model card, supera al baseline de 2,7 M en error de energia, fuerza y momento magnetico sobre el split de test oficial, con un coste de parametros aproximadamente 2,5 veces menor.

Su relevancia es practica: permite realizar relajaciones estructurales y dinamica molecular sobre cientos de miles de estructuras con un modelo de ~4 MB en fp32, lo que reduce drasticamente los requisitos de memoria y hace viable el cribado de alto rendimiento en hardware modesto. El repositorio figura con 0 descargas y 0 likes en el momento de la consulta y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CHGNet (`matgl.models.CHGNet`), red neuronal de grafos con autograd continuo de tres cuerpos |
| Parametros totales | 1.083.842 (~1 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; usa cutoff radial de 6,0 A y cutoff de tres cuerpos de 3,0 A |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (carga mediante `matgl.load_model()` con backend PyG) |

Otros hiperparametros declarados: dimension de embedding 128, 4 bloques de interaccion, dimensiones ocultas de convolucion [64], backend PyTorch Geometric.

## Arquitectura y entrenamiento

CHGNet es una red neuronal de grafos para cristales que combina un encoder de grafo atomico con bloques de interaccion y una cabeza de autograd continuo de tres cuerpos, lo que permite obtener fuerzas y tensiones como derivadas de la energia predicha. Esta variante concreta reduce la capacidad respecto al CHGNet de referencia (dim=128, 4 bloques, hidden=64) y se ejecuta sobre el backend PyG de MatGL, no sobre el backend DGL original. El cutoff radial es de 6,0 A y el cutoff de tres cuerpos de 3,0 A.

El entrenamiento se realizo desde cero sobre el dataset MatPES PBE 2024.11 (`MatPES-20240214-PBE`, 434.712 estructuras), el potencial de energia potencial fundacional descrito en arXiv:2503.04070. La particion es 90/5/5 con `random_state=42`, identica a la del baseline CHGNet-2.7M: 391.240 estructuras de entrenamiento, 21.735 de validacion y 21.737 de test. La model card aclara que la particion proviene del conjunto completo MatPES 2024.11 y no del fichero deduplicado posterior `MatPES-PBE-2025.2-train.json`. No se documentan en la informacion disponible fases de RLHF, DPO ni ajuste por preferencias, algo que no aplica a un MLIP.

## Capacidades

- Prediccion de energia total y energia por atomo de estructuras cristalinas (MAE de 25,53 meV/atomo en el test split oficial).
- Prediccion de fuerzas atomicas (MAE de 116,30 meV/A), lo que habilita relajacion estructural y dinamica molecular.
- Prediccion del tensor de tensiones (MAE de 0,6131 GPa), util para propiedades elasticas y ecuacion de estado.
- Prediccion de momentos magneticos por atomo (MAE de 0,0680 μ_B).
- Calculo de derivadas de la energia mediante autograd continuo de tres cuerpos, sin necesidad de calculos de diferencias finitas.
- Integracion con ASE a traves de `matgl.ext.ase.PESCalculator`, lo que da acceso a optimizadores, termostatos y rutinas de dinamica molecular de ASE.
- Uso como potencial fundacional para cribado de alto rendimiento sobre bases de datos de estructuras del Materials Project.
- No soporta tool calling, function calling, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Relajacion estructural de cristales: cargando el modelo con `PESCalculator` y un optimizador de ASE se pueden obtener geometrias de equilibrio y energias de formacion de estructuras candidatas, con un coste por estructura muy inferior al de DFT.
- Dinamica molecular a escala de cientos de miles de atomos: al tener solo 1,08 M de parametros, la huella de memoria por paso es minima y el cuello de botella pasa a ser el grafo de vecinos, lo que permite simulaciones NVT/NPT de celdas grandes en una sola GPU.
- Cribado de alto rendimiento de materiales: filtrado previo de bibliotecas tipo Materials Project para descartar fases inestables o con fuerzas residuales altas antes de lanzar calculos DFT costosos.
- Calculo de propiedades elasticas y ecuacion de estado: la prediccion de tensiones permite obtener constantes elasticas y modulos de bulk mediante deformaciones controladas de la celda.
- Estudio de ordenamiento magnetico: la prediccion de momentos magneticos por atomo permite explorar configuraciones ferro, antiferro y ferrimagneticas y su efecto sobre la estabilidad energetica.
- Generacion de datos de entrenamiento: el modelo puede usarse para etiquetar grandes volumenes de estructuras con energias y fuerzas, alimentando el entrenamiento de potenciales mas expresivos o el ajuste fino de modelos mayores.
- Estimacion de propiedades de transporte y difusion: mediante dinamica molecular a temperatura finita se pueden calcular coeficientes de difusion de iones en solidos conductores, siempre que el sistema quede dentro de la distribucion de entrenamiento PBE.
- Despliegue en hardware limitado o en CPU: al ocupar unos 4 MB en fp32, es viable ejecutarlo en portatiles o nodos sin GPU para validaciones puntuales y flujos de trabajo didacticos con MatGL y pymatgen.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test oficial de MatPES PBE (21.737 estructuras):

| Metrica | CHGNet-1M (este modelo) | CHGNet-2.7M baseline (autograd corregido) |
|---|---|---|
| MAE de energia | 25,53 meV/atomo | 28,09 meV/atomo |
| MAE de fuerza | 116,30 meV/A | 117,36 meV/A |
| MAE de tension | 0,6131 GPa | 0,6066 GPa |
| MAE de momento magnetico | 0,0680 μ_B | 0,0706 μ_B |

No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros) por tratarse de un potencial interatomico y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa aproximadamente 4,3 MB en fp32 y 2,2 MB en fp16, de modo que el consumo real lo determina el tamano del lote de grafos y el numero de atomos por estructura, no los pesos. Cualquier GPU con 4 GB o mas es suficiente (estimacion a partir del recuento de parametros; el autor no publica cifras de VRAM).
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, cualquier GPU CUDA moderna (RTX 3060 en adelante, A100, H100) es sobradamente suficiente; el rendimiento escala con el paralelismo de grafos, no con la memoria.
- Cabe en GPU consumer: si, en cualquier GPU consumer con soporte CUDA. Tambien es viable la inferencia en CPU para estructuras individuales o lotes pequenos.
- Opciones de despliegue: MatGL con backend PyG (`matgl.set_backend("PyG")`), integracion con ASE mediante `matgl.ext.ase.PESCalculator` y con pymatgen para la construccion de estructuras. Herramientas de servido de LLM como vLLM, TGI, Ollama o llama.cpp no aplican.
- Latencia y throughput: no disponible. No se publican medidas de tiempo por estructura ni de estructura/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | MAE energia (meV/atomo) | MAE fuerza (meV/A) | MAE tension (GPa) | MAE magmom (μ_B) | Licencia |
|---|---|---|---|---|---|---|
| CHGNet-1M (este modelo) | 1.083.842 | 25,53 | 116,30 | 0,6131 | 0,0680 | no disponible |
| CHGNet-2.7M baseline (MatPES PBE) | ~2,7 M | 28,09 | 117,36 | 0,6066 | 0,0706 | no disponible |
| M3GNet universal | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| MACE-MP-0 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos del baseline CHGNet-2.7M proceden de la propia model card. Para M3GNet y MACE-MP-0 no se dispone de cifras comparables en la informacion proporcionada; se incluyen por pertenecer a la misma categoria de potenciales interatomicos universales para materiales. El repositorio no registra descargas ni validaciones independientes que permitan contrastar el rendimiento declarado.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta conversacion, tool calling ni razonamiento multi-paso.
- Entrenado exclusivamente con el funcional PBE, sin correcciones de dispersion ni van der Waals, por lo que su comportamiento en sistemas moleculares, fisisorcion y apilamientos debiles no esta validado.
- El MAE de energia de 25,53 meV/atomo puede ser insuficiente para discriminar polimorfos muy proximos en energia o para estudiar defectos con diferencias energeticas del orden de meV.
- El MAE de tension (0,6131 GPa) es peor que el del baseline de 2,7 M, de modo que las propiedades elasticas derivadas heredan ese margen de error.
- Riesgo de extrapolacion: el modelo solo cubre los elementos y tipos de estructura presentes en MatPES PBE 2024.11; fuera de esa distribucion (superficies, liquidos, clusters, altas presiones) la precision no esta garantizada.
- La licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de integrarlo en produccion.
- El repositorio aparece con 0,0 GB de tamano y 0 descargas en el momento de la consulta, por lo que no se puede confirmar que los pesos esten efectivamente publicados y accesibles.
- No hay evaluacion independiente ni reproduccion externa de los resultados declarados; todas las metricas provienen del propio autor.
- Requiere la libreria MatGL y el backend PyG; no es compatible con el backend DGL sin conversion.
- Las fechas de creacion y actualizacion del repositorio (2026-09-21) corresponden al registro publicado y no deben interpretarse como un ciclo de mantenimiento confirmado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BowenD-UCB/CHGNet-PES-MatPES-PBE-1M-2026.9
- Repositorio de MatGL: https://github.com/materialyzeai/matgl
- Dataset MatPES: https://huggingface.co/datasets/materialyze/matpes
- Paper del dataset MatPES: https://doi.org/10.48550/arXiv.2503.04070 (arXiv:2503.04070)
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo ni sobre el dataset MatPES; los resultados obtenidos correspondian a paginas no relacionadas con el ambito de los potenciales interatomicos.
