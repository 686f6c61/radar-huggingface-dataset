# rumezhak/microduck-tug-cup3-p10-copy

## Resumen

`rumezhak/microduck-tug-cup3-p10-copy` es una entrada de competicion para el modo "Tug of War" de la Microduck Arena, un espacio de evaluacion de politicas de control para el robot cuadrupedo MicroDuck de Pollen Robotics. No es un modelo de lenguaje ni un modelo fundacional: es una politica de control (red neuronal pequena) exportada a ONNX que decide acciones motoras en un simulador MuJoCo. El autor, `rumezhak`, la publica como participante en la copa semanal numero 3, que cerro el 20 de noviembre.

El aspecto mas relevante de esta ficha es que el modelo **no ha sido entrenado ni ajustado por su autor**: es una copia sin modificaciones de la red `tug-p10` de `SSH111111`, verificada como identica sobre 300 observaciones aleatorias (diferencia maxima 0). El autor lo declara explicitamente y justifica la publicacion porque sus propios intentos de ajuste (v1 y v2) perdieron 0 de 150 combates contra `tug-p10`, y porque en un round-robin de las 36 entradas descargables de la copa esta red resulta claramente la mas fuerte. Se trata, por tanto, de un artefacto de evaluacion comparativa, no de una contribucion tecnica original.

El repositorio tiene un tamano de 0.0 GB (pesos minimos), no declara licencia propia y no especifica idiomas ni contexto, ya que no procesa texto. Su utilidad practica se limita al entorno de simulacion de la Arena: el propio autor advierte de que no debe cargarse en un robot fisico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica para control (actor con capas `mlp.*` y normalizador), exportada como grafo ONNX; no es un transformer |
| Parametros totales | no disponible (repositorio de 0.0 GB; red de muy pocos parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no procesa texto; opera sobre observaciones del simulador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no declarada para el repositorio en su conjunto; `LICENSE-apache-2.0.txt` y `NOTICE` cubren solo las partes que ya portaban Apache-2.0 |
| Formato de pesos | ONNX (libreria `microduck`; ejecutable con onnxruntime) |

## Arquitectura y entrenamiento

La red es una politica de control para el escenario "Tug of War" de la Microduck Arena. Segun la model card, el grafo incluye un normalizador de observaciones, un actor con capas `mlp.*`, operadores de grafo, filas de lookup (`lookup rows`), mascaras `L_mask` y tolerancias `L_tol`. Respecto a la version previa del autor (`tug-cup3-tuned-v2`), solo cambian los pesos del actor (normalizador y `mlp.*`); el resto de tensores y operadores permanecen inalterados. El campo `modification_notice` de los metadatos conserva el texto anterior y anade el aviso de esta version, en cumplimiento de la seccion 4(b) de Apache-2.0.

No hay informacion sobre el proceso de entrenamiento de la red original `tug-p10` de `SSH111111`: numero de tokens (no aplica), composicion del dataset, uso de RL, imitacion o ajuste supervisado. El autor de esta copia declara explicitamente que no entreno ni ajusto la red y que no consulto a `SSH111111`. Las filas de rating que acompanan a la entrada proceden de entradas publicas anteriores y se reproducen a traves del grafo de `greecree/microduck-tug-of-war-tug-super-v8`; solo fijan el rating (166.7 cm) que determina el sorteo de la copa, mientras que los combates los decide la red.

## Capacidades

- Control motor en simulacion para el escenario "Tug of War" de la Microduck Arena: genera acciones a partir de observaciones del entorno simulado.
- Inferencia determinista en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 (versiones fijadas por la Arena).
- Ejecucion como entrada de competicion en la Arena: el modelo se evalua mediante el runner oficial `microduck-arena 0.7.0`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No incluye vision, audio ni modo "thinking".
- Rendimiento medido como tasa de victoria en combates simulados (ver seccion de benchmarks).

## Casos de uso

- Evaluacion comparativa en la Microduck Arena: sirve como referencia fuerte ("baseline") contra la que medir otras politicas de Tug of War, ya que en el round-robin de 36 entradas descargables resulto la red mas potente.
- Reproduccion de resultados de la copa numero 3: permite replicar los combates registrados con las versiones fijadas de MuJoCo, onnxruntime y numpy, util para auditar clasificaciones.
- Pruebas de robustez de politicas propias: un desarrollador puede enfrentar su red contra esta copia para obtener una tasa de victoria estable y comparable (por ejemplo, las 150 rondas aleatorias con lados intercambiados).
- Verificacion de pipelines de inferencia ONNX en robotica simulada: el grafo incluye normalizador, actor y filas de lookup, lo que lo convierte en un caso de prueba realista para integrar onnxruntime en un bucle de control.
- Estudio de tecnicas de mezcla de pesos (`base_model_relation: merge`): documenta como se combinan pesos de dos modelos base y como se anota el cambio en `modification_notice`.
- Docencia sobre licencias y atribucion en modelos derivados: el repositorio ejemplifica el cumplimiento de la seccion 4(b) de Apache-2.0 y la gestion de componentes sin licencia declarada.
- Analisis de determinismo numerico entre CPUs: el autor advierte de que el redondeo de otra CPU podria romper las reproducciones, lo que lo hace util para estudiar portabilidad de inferencia.

## Benchmarks y rendimiento

Resultados medidos por el autor en x86-64 con el runner oficial de la Arena (microduck-arena 0.7.0), lados intercambiados, 150 combates aleatorios por oponente. Tasa de victoria de esta entrada:

| Oponente | Tasa de victoria de esta entrada |
|---|---|
| `SSH111111/tug-p10` (la red original) | 52.7 % |
| `suraj-phanindra/tug-hc8-aifund` | 99.3 % |
| `GinDuck/Tug Norris` | 99.3 % |
| `HlibPlakhtii/quicksilver-tug-rating-nov18-v2` | 98.7 % |
| `azukiq/titan-v2` | 76.0 % |
| `jrubiosainz/tug-n3g53` | 100.0 % |
| `nootxlm/tug-entry-3` | 100.0 % |
| `lphatnguyen/tug-of-war-v2` | 99.3 % |
| `DenRakEiw/songkran-duck-tug5` | 100.0 % |

El 52.7 % frente a la red original se interpreta como ruido alrededor del 50 %, coherencia con que ambas son identicas (diferencia maxima 0 en 300 observaciones aleatorias). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y la red es de muy pocos parametros, por lo que la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; el autor ejecuto las pruebas en una maquina x86-64 (sin detallar GPU).
- Cabe en GPU consumer: si, por el tamano del artefacto; no se detallan modelos concretos.
- Opciones de despliegue: onnxruntime (version fijada 1.24.4 en las pruebas) dentro del runner `microduck-arena 0.7.0`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles. Las pruebas se hicieron con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 sobre x86-64; el autor advierte de que el redondeo de otra CPU podria alterar las reproducciones deterministas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en Tug of War | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `rumezhak/microduck-tug-cup3-p10-copy` (esta ficha) | Politica ONNX (copia de `tug-p10`) | no disponible (0.0 GB) | no aplica | 52.7 % vs. original; 76-100 % vs. resto de la tabla | no declarada en conjunto; Apache-2.0 solo en partes | Hugging Face, 0 descargas, 0 likes |
| `SSH111111/microduck-tug-p10` | Politica ONNX (original) | no disponible | no aplica | Referencia; empata con esta copia | no declarada | Hugging Face |
| `rumezhak/microduck-tug-cup3-tuned-v2` | Politica ONNX (ajuste propio del autor) | no disponible | no aplica | 0 de 150 combates contra `tug-p10` | no disponible | Hugging Face |
| `greecree/microduck-tug-of-war-tug-super-v8` | Politica ONNX (usada para el layout del grafo de rating) | no disponible | no aplica | no disponible | no declarada | Hugging Face |

## Limitaciones y advertencias

- No es un modelo original: es una copia sin cambios de `SSH111111/microduck-tug-p10`; no aporta nada tecnico sobre la idea original y no seguira actualizaciones si el autor reemplaza su red.
- El autor no consulto a `SSH111111`, `lphatnguyen`, `jrubiosainz` ni `greecree` antes de publicar; si alguno objeta, la entrada sera retirada.
- Solo valido en simulacion: el autor advierte explicitamente de que no debe cargarse en un MicroDuck fisico.
- Licencia ambigua: el repositorio no esta etiquetado como Apache-2.0 en su conjunto; esa licencia cubre solo las partes que ya la portaban (`LICENSE-apache-2.0.txt` y `NOTICE`). `tug-p10` y otras redes de referencia no declaran licencia, lo que limita el uso comercial sin aclaracion previa.
- Reproducibilidad fragil: los replays son deterministas solo en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; otra CPU podria romper la reproducibilidad por redondeo.
- Las filas de rating reproducen secuencias grabadas de otros autores para las cinco semillas oficiales; no son un resultado propio y solo fijan el rating (166.7 cm) del sorteo.
- Sin datos de sesgos, alucinacion o cobertura idiomatica: no aplican a un modelo de control, pero tampoco hay evaluacion de robustez fuera del escenario de la Arena.
- Cero traccion en la plataforma (0 descargas, 0 likes) y creado el 2026-11-20, el mismo dia del cierre de la copa; su valor es historico y de auditoria, no de produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-cup3-p10-copy
- Red original copiada: https://huggingface.co/SSH111111/microduck-tug-p10
- Version previa del autor: https://huggingface.co/rumezhak/microduck-tug-cup3-tuned-v2
- Entrada v1 del autor (creditos de rating): https://huggingface.co/rumezhak/microduck-tug-cup3-tuned-v1
- Grafo usado para el rating: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Red de referencia de `lphatnguyen`: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Entrada de `jrubiosainz` (con `LICENSE` Apache-2.0): https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429
- Microduck Arena (espacio de evaluacion): https://huggingface.co/spaces/pollen-robotics/microduck-arena
