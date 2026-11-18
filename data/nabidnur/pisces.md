# Nabidnur/PISCES

## Resumen

PISCES (Principal-axis Informed Splitting with Consistent closing, Early revival and Sparse assignment) es una mejora directa sobre e-means, el algoritmo de mini-batch k-means publicado por Bessa et al. (Meta FAIR, 2026) e incluido en `faiss.contrib.e_means`. Lo desarrolla Nabidnur como primer numero de su serie tecnica ARIES y no es un modelo de lenguaje ni una red neuronal: es un algoritmo de clustering y cuantizacion vectorial empaquetado como artefacto de Hugging Face con licencia MIT, pensado para busqueda vectorial aproximada sobre CPU.

El problema que aborda es el coste computacional del paso de asignacion en mini-batch k-means a gran escala. Sobre el benchmark propio de e-means (DEEP* 1M con k = 16.384), PISCES reduce el error de test entre un 0,27% y un 0,88% segun el numero de epocas, con un tiempo de ejecucion de 0,27x a 0,42x respecto a e-means, y gana en las 40 ejecuciones emparejadas por semilla. La mejora se mantiene en dos conjuntos de validacion externos (SPACEV 1M y SimSearchNet++ 1M).

La relevancia actual esta en que ataca el cuello de botella dominante de los indices IVF y de cuantizacion vectorial: la asignacion de cada vector a su centroide. Combina una mejora matematica del criterio de particion (division por eje principal con hijos en c ± sqrt(2*lambda_1/pi)*u_1) con optimizaciones de ingenieria (asignacion dispersa con IVF, kernel fusionado en Numba, escaneos de 8 bits con reordenacion exacta en float32).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Algoritmo de clustering mini-batch k-means con division por eje principal, revival temprano y asignacion dispersa IVF (no es una red neuronal) |
| Parametros totales | no disponible (no aplica; el artefacto son centroides de k dimensiones configurables) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | Escaneos IVF de 8 bits con reordenacion exacta en float32 de los 4 mejores candidatos; centroides en float32 |
| Idiomas soportados | no disponible (no aplica; opera sobre vectores, no texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (libreria faiss; el repositorio ocupa 0.0 GB y contiene paper, notebooks y resultados) |

## Arquitectura y entrenamiento

PISCES no entrena un modelo generativo: ejecuta un proceso de clustering no supervisado sobre vectores de embeddings. Sobre el motor de e-means introduce cinco cambios matematicos y algoritmicos. Primero, la division por eje principal: cuando un cluster muere, en lugar de copiar el centroide donante con un desplazamiento relativo de 1e-4, coloca los dos hijos en c ± sqrt(2*lambda_1/pi)*u_1, simetricos a lo largo del eje principal del donante (Lemma 1, hijos medio-gaussianos). Segundo, la seleccion del donante por ganancia: el donante optimo es argmax N*lambda_1 y no el cluster mas poblado (Lemma 2, distorsion eliminada por la division). Tercero, iteracion de potencia en streaming: el eje de cada cluster se sigue a partir de estadisticas EMA con un paso de iteracion de potencia por batch, a coste O(Bd). Cuarto, estadisticas de cierre consistentes y revival temprano con paso reajustado (revival cada batch en el primer 30% de pasos, umbral 0,2, ley del paso x1,4). Quinto, asignacion dispersa mediante IVF sobre los centroides con sqrt(k) celdas y sqrt(k)/8 sondas (sqrt(k)/4 en la ultima epoca).

En el plano de ingenieria anade un kernel fusionado en Numba que calcula en una sola pasada paralela las sumas de e-means y las estadisticas de eje de PISCES, y escaneos de 8 bits con reordenacion exacta en float32 que devuelven la respuesta float32 para el 100,000% de las filas en un batch a escala completa. Los datos de entrenamiento no aplican; el benchmark de referencia es DEEP* 1M con k = 16.384, complementado con validacion en SPACEV 1M y SimSearchNet++ 1M.

## Capacidades

- Clustering mini-batch k-means de alta dimension con k configurable (evaluado hasta k = 65.536).
- Particion de clusters por eje principal con base teorica (Lemma 1 y Lemma 2) y validacion empirica en 400 clusters reales de DEEP (correlacion log-log 0,947 entre ganancia predicha y realizada).
- Revival de clusters muertos con colocacion geometrica optima en lugar de copia con ruido.
- Seguimiento en linea del eje principal por cluster mediante iteracion de potencia con estadisticas EMA.
- Asignacion dispersa aproximada con IVF sobre centroides (sqrt(k) celdas, sqrt(k)/8 sondas).
- Escaneo de 8 bits con reordenacion exacta en float32 de los 4 mejores candidatos.
- Ejecucion en CPU: todas las comparaciones se realizaron en una CPU de 4 nucleos.
- Compatibilidad como drop-in con `faiss.contrib.e_means`.

## Casos de uso

- Construccion de indices IVF a gran escala: PISCES reduce el tiempo de entrenamiento del cuantizador a 0,27-0,42x respecto a e-means manteniendo menor error, lo que abarata el reentrenamiento periodico de indices de busqueda vectorial sobre millones de embeddings.
- Busqueda semantica en produccion sobre CPU: al operar sin GPU y con asignacion dispersa, encaja en servicios de recuperacion documental donde no hay aceleradores disponibles.
- Cuantizacion vectorial para compresion de embeddings: los centroides resultantes sirven como codebook de product quantization, con menor distorsion que e-means a igual presupuesto de tiempo.
- Deduplicacion y clustering de corpus masivos: agrupar embeddings de documentos o imagenes en k clusters para analisis exploratorio, con la ventaja de que el donante se elige por ganancia de distorsion y no por poblacion.
- Reentrenamiento incremental de indices: el revival temprano y las estadisticas de cierre consistentes permiten reajustar clusters muertos sin reiniciar el proceso completo.
- Benchmarking de algoritmos de clustering: el repositorio incluye notebooks, resultados por ejecucion en `results/final/` y comparaciones emparejadas por semilla, utiles como base reproducible para evaluar variantes.
- Sistemas de recomendacion basados en similitud vectorial: la reduccion de error de test (hasta -0,88% en 1 epoca) se traduce en vecinos mas precisos a igual coste de inferencia.

## Benchmarks y rendimiento

DEEP* 1M, k = 16.384, filas de test del paper, 10 semillas, CPU de 4 nucleos:

| Configuracion | Cambio en MSE de test vs e-means | IC 95% | Semillas ganadas | Tiempo |
|---|---|---|---|---|
| 1 epoca | -0,88% | [-0,94; -0,82] | 10/10 | 0,42x |
| 3 epocas | -0,27% | [-0,35; -0,19] | 10/10 | 0,30x |
| 5 epocas | -0,28% | [-0,32; -0,23] | 10/10 | 0,27x |
| PISCES 3 epocas vs e-means 5 epocas | -0,10% | no disponible | 9/10 | 0,17x |
| SPACEV 1M (3 epocas, held-out) | -0,453% | no disponible | 5/5 | 0,37x |
| SimSearchNet++ 1M (3 epocas, held-out) | -0,040% | no disponible | 5/5 | 0,34x |
| e-means con asignacion dispersa de PISCES | +0,07% | no disponible | 3/10 | 0,59x |

Ablacion de componentes (filas de validacion, 3 epocas, 3 semillas; coste relativo a PISCES, positivo = peor):

| Componente eliminado | Cambio vs e-means | Coste de la eliminacion | Tiempo |
|---|---|---|---|
| Ninguno (PISCES) | -0,258% | no disponible | 0,31x |
| Division por eje principal | -0,019% | +0,240% | 0,30x |
| Donante ordenado por ganancia | +0,114% | +0,373% | 0,30x |

Perfilado (DEEP* 1M, k = 16.384, 3 epocas): e-means tarda 75 s, con el 96% en la busqueda de asignacion exacta; PISCES tarda 27 s, con el 89% en su busqueda dispersa. Las dos mejoras de ingenieria llevan a PISCES a 0,74x el tiempo de PISCES v1.0 con una diferencia de calidad emparejada de +0,012%. El beneficio depende de k: alcanza su maximo en k = 16.384; en k = 65.536 la configuracion congelada apenas gana y los valores por defecto publicados recuperan -0,19% con una regla elegida en ejecuciones de validacion.

## Requisitos de hardware

- VRAM estimada: no aplica; el algoritmo se ejecuta en CPU.
- CPU: todas las mediciones del informe se hicieron en una CPU de 4 nucleos.
- GPU: no se documenta soporte ni uso de GPU; el tag `cpu` de la model card lo confirma.
- Cabe en cualquier maquina de consumo, ya que el coste depende del tamano del dataset y de k, no de pesos de un modelo.
- Opciones de despliegue: libreria `faiss` (integracion con `faiss.contrib.e_means`), kernel en Numba para el calculo fusionado de estadisticas.
- Latencia y throughput: 27 s para DEEP* 1M con k = 16.384 y 3 epocas en la CPU de referencia; 75 s para e-means en el mismo escenario.

## Comparativa con modelos similares

| Algoritmo | Tipo | k evaluado | Error de test vs e-means | Tiempo vs e-means | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PISCES | Mini-batch k-means con division por eje principal y asignacion dispersa | 16.384 (hasta 65.536) | -0,27% a -0,88% | 0,27x-0,42x | MIT | Hugging Face (Nabidnur/PISCES) |
| e-means (Bessa et al., Meta FAIR) | Mini-batch k-means con revival | 16.384 | referencia | 1,00x | no disponible en la informacion | `faiss.contrib.e_means` |
| k-means clasico (Faiss) | Mini-batch k-means estandar | no disponible | no disponible | no disponible | no disponible | Faiss |

No se dispone de comparaciones con otros algoritmos de clustering en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni de vision: no genera texto, no soporta tool calling ni agentes; la etiqueta `feature-extraction` de Hugging Face resulta enganosa en ese sentido.
- El beneficio depende de k: se maximiza alrededor de k = 16.384 y practicamente desaparece en k = 65.536 con la configuracion congelada.
- El informe reconoce que la asignacion sigue siendo el 89% del tiempo de PISCES, por lo que el cuello de botella persiste.
- La evaluacion se limita a tres conjuntos de datos (DEEP* 1M, SPACEV 1M y SimSearchNet++ 1M) y a una CPU de 4 nucleos; no hay datos de escalado a otros dominios ni a hardware distinto.
- El repositorio ocupa 0,0 GB y tiene 0 descargas y 0 likes, sin senales de adopcion externa; conviene tratar las cifras como resultados de un informe tecnico unico y no replicados de forma independiente.
- El articulo referenciado (arXiv:2611.09501) tiene un identificador con fecha futura respecto al conocimiento habitual, lo que impide verificar su existencia en el momento de redactar esta ficha.
- Licencia MIT: permite uso comercial, pero no se documentan garantias ni soporte.
- No se detallan sesgos, riesgos de alucinacion ni limitaciones de idioma porque no aplican a un algoritmo de clustering.

## Enlaces

- Hugging Face: https://huggingface.co/Nabidnur/PISCES
- Paper de e-means (referencia): https://arxiv.org/abs/2611.09501
- Informe tecnico de PISCES: `paper/pisces.pdf` dentro del repositorio
- Notebooks: `notebooks/` dentro del repositorio
- Resultados por ejecucion: `results/final/` dentro del repositorio
- Faiss (libreria): https://github.com/facebookresearch/faiss
