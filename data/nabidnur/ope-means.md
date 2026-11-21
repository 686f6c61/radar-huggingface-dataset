# Nabidnur/OPE-means

## Resumen

OPE-means es un algoritmo de clustering robusto desarrollado por el autor independiente Nabidnur dentro de la serie ARIES (informe tecnico numero 2). No es un modelo de lenguaje ni una red neuronal: es una implementacion de *k-means con outliers* que selecciona k centros, descarta los z puntos mas alejados y minimiza el coste k-means del resto. El problema que aborda es la dependencia excesiva de la inicializacion en los metodos de la familia OKMeans (Jiang & Zhou, NeurIPS 2026), cuyo filtrado de outliers esta garantizado pero cuya fase de clustering se reduce a una unica tirada de k-means++ seguida de Lloyd, lo que produce alta varianza entre semillas.

La propuesta sustituye esa tirada unica por una busqueda local con varios mecanismos: division por eje principal, borrado y resiembra, puntuacion por eclipse, vuelo de Levy, muestras independientes y *tidal locking*. El resultado reportado es una mejora de coste robusto en las 570 ejecuciones emparejadas del benchmark de OKMeans, con el codigo de los autores y en la misma maquina. Se distribuye como codigo Python sobre NumPy y Numba, con licencia MIT, y su relevancia actual radica en que ofrece independencia de semilla en un regimen (clustering con outliers) donde la literatura previa asumia esa varianza como inevitable.

El repositorio de Hugging Face es de tipo codigo (0.0 GB, libreria `numpy`, pipeline `other`), sin pesos ni artefactos de modelo. La ficha describe, por tanto, el algoritmo y su implementacion, no un modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Algoritmo de clustering (k-means con outliers); busqueda local con puntuacion exacta por eclipse |
| Parametros totales | no disponible (no es un modelo neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (codigo y documentacion en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de codigo; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

OPE-means no entrena parametros. Su "arquitectura" es un procedimiento de optimizacion sobre el objetivo *trimmed k-means*: dado un conjunto de n filas, un numero de centros k y un numero de outliers z, se eligen k centros y se descartan las z filas mas alejadas, minimizando el coste k-means de las n−z restantes. Sobre esa base, el autor sustituye la inicializacion unica por una busqueda con seis componentes documentados: division por eje principal (divide el cluster s en los semimedios gaussianos c ± sqrt(2/pi)·sigma1·u1 y elimina el centro t, evaluando los k(k−1) pares); borrado y resiembra (elimina t y resiembra con una tirada D² truncada); puntuacion por eclipse (como cada movimiento afecta a como maximo dos centros, cada fila solo necesita sus 3 centros mas cercanos, calculando el coste exacto de los 120 movimientos en una pasada de Numba); vuelo de Levy (saltos de dos centros, 135 por vuelo, con kernel de eclipse de 5 vecinos); muestras independientes (cada arranque busca sobre su propia muestra de 500k filas y los arranques se comparan sobre todas las filas); y *tidal locking* (Lloyd truncado exacto que evita recalcular filas bloqueadas dentro de su celda de Voronoi y en un lado del horizonte de truncado tau ± D).

No hay datos de entrenamiento, RLHF ni DPO porque no hay modelo. La innovacion tecnica destacable es la puntuacion por eclipse, que reduce el coste de evaluar todos los movimientos candidatos a una sola pasada vectorizada con Numba, y el *tidal locking*, que reduce las computaciones de distancia de Lloyd al 6-14% manteniendo resultados identicos bit a bit. El autor documenta tambien resultados negativos (semimedios exactos, pulido split-merge sobre datos completos, Constellations, Murmuration, Compass, colonia de hormigas, cuotas por familia, embudos mas anchos, asentamiento mas largo y saltos de Levy con division) en el registro de experimentos.

## Capacidades

- Clustering robusto con outliers: resuelve k-means con descarte de z puntos, minimizando el coste sobre las n−z filas restantes.
- Independencia de semilla: 120/120 ejecuciones de desarrollo alcanzan la mejor solucion conocida y una busqueda 20 veces mas costosa no encuentra nada mejor.
- Evaluacion exacta de movimientos: la puntuacion por eclipse calcula el coste exacto de los 120 movimientos candidatos en una pasada.
- Aceleracion en CPU: implementado sobre NumPy y Numba, con soporte para ejecucion multihilo (los experimentos usan 4 hilos).
- Escalabilidad a datasets de millones de filas: probado en SUSY (5M filas), DEEP, KDDFULL, SHUTTLE, SKIN, COVTYPE.
- Sin dependencia de GPU ni de FAISS; las variantes FAISS de OKMeans se usan solo como baseline comparativo.
- No soporta tool calling, agentes, vision, audio ni capacidades linguisticas: no es un modelo de lenguaje.

## Casos de uso

- Deteccion de anomalias en datos tabulares de gran volumen: el algoritmo descarta explicitamente z outliers y agrupa el resto, lo que encaja en pipelines de control de calidad donde una fraccion conocida de registros es ruidosa.
- Segmentacion de clientes con ruido: en datasets de comportamiento con valores atipicos (gasto anomalo, registros corruptos), el objetivo truncado evita que esos puntos deformen los centroides.
- Preprocesado para aprendizaje supervisado: generar etiquetas de cluster estables entre ejecuciones, algo critico cuando el pipeline se reejecuta y no se tolera variacion por semilla.
- Analisis de datos cientificos con outliers (sensores, astronomia, genomica): la garantia de que la peor semilla supera a la mejor del baseline en 10/10 datasets reduce la necesidad de barridos de semillas.
- Benchmarking de algoritmos de clustering: el repositorio incluye cuadernos y un registro de 25 iteraciones con resultados negativos, util como referencia reproducible para comparar metodos.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con Numba, es adecuado para servidores modestos o entornos embebidos donde no hay acelerador disponible.
- Procesamiento por lotes de datasets de millones de filas: los tiempos reportados (3.8 s en KDDFULL, 10.5-11.9 s en SUSY) permiten reejecuciones frecuentes sobre datos actualizados.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el benchmark de OKMeans/OKMeans2 (Jiang & Zhou, NeurIPS 2026), con el codigo de los autores (commit d820666), 10 semillas y 4 hilos de CPU. Las reducciones estan emparejadas por semilla (media de 10).

| Dataset | OPE-means v5 coste medio | OKMeans coste medio | Reduccion vs OKMeans | vs mejor baseline | Tiempo OPE | Tiempo OKMeans (FAISS) |
|---|---|---|---|---|---|---|
| SHUTTLE | 53736 | 68233 | −20.64% | −12.06% | 4.0 s | 0.9 s |
| SKIN-5 | 57641 | 65666 | −11.93% | −6.20% | 2.8 s | 1.8 s |
| SKIN-10 | 60774 | 69449 | −11.99% | −8.00% | 2.4 s | 1.7 s |
| KDDFULL | 3.3078e+07 | 4.019e+07 | −14.90% | −14.90% | 3.8 s | 13.0 s |
| SUSY-5 | 4.7479e+07 | 4.8299e+07 | −1.68% | −1.09% | 11.9 s | 13.4 s |
| SUSY-10 | 4.8215e+07 | 4.873e+07 | −1.05% | −1.05% | 10.5 s | 17.5 s |
| COVTYPE-5 † | 2.5769e+06 | 2.5998e+06 | −0.88% | −0.70% | 6.0 s | 3.1 s |
| COVTYPE-10 † | 2.5863e+06 | 2.603e+06 | −0.64% | −0.64% | 6.3 s | 3.2 s |
| DEEP-5 † | 7.7834e+07 | 7.8078e+07 | −0.31% | −0.27% | 22.7 s | 27.4 s |
| DEEP-10 † | 7.7834e+07 | 7.8169e+07 | −0.43% | −0.42% | 22.1 s | 26.3 s |

† datasets retenidos: construidos con la receta del paper, nunca usados durante el desarrollo. "Mejor baseline" es, por dataset, el baseline con menor coste medio entre OKMeans, OKMeans2, sus variantes FAISS, TIKMeans y k-means++.

Agravados adicionales reportados: 57/57 comparaciones dataset × baseline ganadas en las 10 semillas; 570/570 ejecuciones emparejadas ganadas (margen minimo 0.008%, mediana 2.8%); la peor semilla de OPE-means supera a la mejor ejecucion del baseline en 10/10 datasets; 120/120 ejecuciones de desarrollo alcanzan la mejor solucion conocida. La version v5 alcanza la mejor solucion conocida en 95 de 100 ejecuciones del paper (v3: 85; v4 con Levy: 90); la peor ejecucion de v5 queda en +0.095% (SUSY-5), +0.016% (COVTYPE-10) y ≤ 0.002% en el resto.

## Requisitos de hardware

- VRAM: no aplica; el algoritmo se ejecuta en CPU sobre NumPy y Numba.
- GPU recomendadas: ninguna; no hay soporte de GPU documentado.
- Cabe en CPU consumer: si, con 4 hilos en los experimentos reportados; los tiempos por dataset van de 2.4 s a 22.7 s.
- Opciones de despliegue: ejecucion directa como paquete Python con NumPy y Numba; los cuadernos del repositorio sirven como punto de entrada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: reportados por dataset en la tabla de benchmarks, medidos en la misma maquina que los baselines. Es mas rapido que la variante OKMeans mas rapida en KDDFULL (3.4×), SUSY y DEEP; es mas lento en SHUTTLE, SKIN y COVTYPE (hasta 4.5× en SHUTTLE, siempre por debajo de 4 s).

## Comparativa con modelos similares

| Algoritmo | Enfoque | Independencia de semilla | Coste robusto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OPE-means v5 | Busqueda local con eclipse, Levy y muestras independientes | Alta (120/120 ejecuciones al optimo conocido) | Gana 570/570 ejecuciones emparejadas | MIT | Repositorio Hugging Face y codigo en el repo |
| OKMeans (Jiang & Zhou, NeurIPS 2026) | Filtrado de outliers garantizado + una tirada de k-means++ y Lloyd | Baja (rango 6.26e4-8.24e4 en SHUTTLE sobre 10 semillas) | Baseline de referencia | no disponible en la informacion | Codigo de los autores (commit d820666) |
| OKMeans2 | Variante de OKMeans | Baja | Baseline | no disponible en la informacion | Codigo de los autores |
| TIKMeans | Baseline incluido en el benchmark | no disponible | Baseline | no disponible en la informacion | no disponible |
| k-means++ | Inicializacion clasica sin truncado | Baja | Baseline | no disponible | Ampliamente disponible |

No se dispone de datos de comparacion con otros metodos de clustering robusto fuera del benchmark de OKMeans; el autor solo reporta comparaciones contra OKMeans, OKMeans2, sus variantes FAISS, TIKMeans y k-means++.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso en esos escenarios es un error de categoria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de los resultados, que proceden del propio autor.
- El benchmark se limita a 10 datasets y a la comparacion contra la familia OKMeans y baselines clasicos; no hay evaluacion frente a otros metodos de clustering robusto.
- La ventaja de velocidad no es universal: es mas lento que OKMeans en SHUTTLE (4.0 s vs 0.9 s), SKIN y COVTYPE (hasta 4.5× y ~2× respectivamente).
- Los resultados de los datasets marcados como retenidos (COVTYPE, DEEP) proceden de una receta de construccion del propio autor, no de un benchmark publico independiente.
- Requiere fijar a priori el numero de centros k y el numero de outliers z; el algoritmo no los estima.
- Dependencia de Numba para el rendimiento; sin compilacion JIT los tiempos pueden degradarse.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Riesgo de sobreajuste a la familia de baselines OKMeans: el autor reconoce que parte del diseno (p. ej. la division por eje principal) se ajusto contra ese benchmark concreto.
- No hay informacion sobre sesgos, alucinacion ni limitaciones de contexto o idioma porque no aplican a un algoritmo de clustering.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Nabidnur/OPE-means
- Informe tecnico: `paper/opemeans.pdf` (referenciado en la model card, dentro del repositorio)
- Cuadernos de experimentos: `notebooks/` (dentro del repositorio)
- Registro completo de experimentos (25 iteraciones, incluidos resultados negativos): `docs/EXPERIMENT_LOG.md` (dentro del repositorio)
- Paper de referencia del benchmark: OKMeans / OKMeans2, Jiang & Zhou, NeurIPS 2026 (arXiv:2605.07130, segun los tags del repositorio)
