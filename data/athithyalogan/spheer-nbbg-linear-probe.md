# AthithyaLogan/spheer-nbbg-linear-probe

## Resumen

`AthithyaLogan/spheer-nbbg-linear-probe` es una sonda lineal (linear probe) de regresión logística que transforma embeddings anuales de Sentinel-2, generados por el modelo fundacional Spheer FM, en las 11 clases de uso del suelo del conjunto NBBG2020 de Statistics Netherlands (CBS). No es un modelo generativo ni un modelo fundacional: es un artefacto de investigación de tama\u00f1o mínimo (1.100 coeficientes y 11 sesgos) que el propio autor publica como material reproducible del experimento 01 de su serie Posts, donde se compara un embedding precalculado frente a un random forest sobre Sentinel-2 crudo.

El valor de la ficha reside en que documenta un resultado de transferencia concreto: sobre 5 particiones con bloques espaciales de 1 km y búfer de 100 m, la sonda alcanza un macro-F1 de 0,592 (IC bootstrap por bloques al 95 %: 0,523–0,626) frente al 0,551 de un random forest entrenado con 46 características Sentinel-2 construidas a mano sobre los mismos píxeles, con una diferencia emparejada de +0,041 (IC 95 %: +0,006 a +0,066). Es relevante ahora porque cuantifica, con incertidumbre declarada, si las representaciones de un modelo fundacional de observación de la Tierra superan a la ingeniería de características clásica en clasificación de uso del suelo.

El autor advierte explícitamente de que se trata de un artefacto de investigación y no de un producto de uso del suelo: se entrenó en una única ventana de 11 × 11,5 km (costa de Lelystad, MGRS 31UFU, resolución de 20 m) en la que el 89 % de los píxeles es agua abierta, y parte de las clases CBS describen *uso* y no *cobertura*, por lo que son parcialmente inobservables a 20 m.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (sonda lineal) sobre embeddings congelados de Spheer FM; matriz de coeficientes 11 x 100 mas 11 sesgos |
| Parametros totales | 1.111 parametros entrenables (1.100 coeficientes + 11 sesgos), mas vectores de normalizacion `mean` y `scale` de 100 elementos; cifra derivada de la forma 100 -> 11 descrita por el autor |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada fija de un vector de 100 dimensiones por pixel) |
| Tipos de cuantizacion | no disponible; los pesos se almacenan en float32 segun el ejemplo de uso |
| Idiomas soportados | no disponible; no es un modelo de lenguaje |
| Licencia | MIT |
| Formato de pesos | safetensors (`probe.safetensors`) acompanado de `config.json` |

## Arquitectura y entrenamiento

La arquitectura es una regresion logistica multinomial que proyecta un vector de embedding de 100 dimensiones (salida de Spheer FM para Sentinel-2, version 2020) sobre 11 clases de uso del suelo. La inferencia consiste en normalizar la entrada con `mean` y `scale`, multiplicar por la traspuesta de la matriz de coeficientes, sumar el sesgo y aplicar `argmax` sobre los logits. La sonda se apoya en embeddings precalculados y gated: el autor indica que hay que solicitar acceso en la pagina del dataset y advierte de que no se deben mezclar versiones del modelo Spheer, porque los embeddings de versiones distintas viven en espacios diferentes.

El entrenamiento se realizo con validacion cruzada de 5 particiones sobre bloques espaciales de 1 km con un bufer de 100 m, una particion que evita la fuga de informacion espacial entre entrenamiento y validacion. Los datos de entrenamiento proceden de una unica ventana de 11 x 11,5 km en la costa de Lelystad (MGRS 31UFU) a 20 m de resolucion. El autor no documenta el numero de tokens ni un proceso de RLHF/DPO, dado que no se trata de un modelo de lenguaje. Las 11 clases objetivo son: 20 residencial, 21 comercio y hosteleria, 24 industria y negocios, 40 parque, 41 instalaciones deportivas, 60 bosque, 61 naturaleza seca, 62 naturaleza humeda, 70 IJsselmeer/Markermeer, 75 agua recreativa y 78 otras aguas interiores.

## Capacidades

- Clasificacion de uso del suelo en 11 clases CBS NBBG2020 a partir de un embedding de Sentinel-2 de 100 dimensiones.
- Inferencia determinista y de coste minimo: una multiplicacion matricial de 11 x 100 por muestra.
- Evaluacion reproducible de representaciones: sirve como sonda para medir la calidad del embedding de Spheer FM frente a un baseline de random forest.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo de razonamiento (thinking mode), vision, audio ni ninguna capacidad multimodal mas alla de consumir embeddings ya generados.
- Depende de un modelo externo (Spheer FM) para producir las entradas; la sonda por si sola no procesa imagenes Sentinel-2 crudas.

## Casos de uso

- Reproduccion del experimento del autor: ejecutar el pipeline descrito en el repositorio `Posts/01-embeddings-vs-random-forest` para verificar la diferencia de +0,041 en macro-F1 entre la sonda y el random forest sobre los mismos pixeles.
- Baseline de comparacion en teledeteccion: usar el 0,592 de macro-F1 como referencia para evaluar nuevas sondas o cabezas de clasificacion entrenadas sobre el mismo embedding y la misma ventana.
- Evaluacion de representaciones de Spheer FM: medir si una version nueva del modelo fundacional mejora la linealidad de sus embeddings, cargando la sonda con los pesos correspondientes a la version con la que fue entrenada.
- Transferencia a nuevas areas mediante reentrenamiento: reajustar la regresion logistica sobre embeddings de otra region, manteniendo la arquitectura de sonda para aislar el efecto del cambio geografico.
- Docencia y material didactico: ilustrar en un curso de teledeteccion como se construye una sonda lineal, como se disena una particion por bloques espaciales y como se reporta un intervalo de confianza por bootstrap.
- Auditoria de deriva de embeddings: comparar predicciones de la sonda sobre distintos anos para detectar cambios sistematicos en el espacio de representaciones antes de atribuirlos a cambios reales del terreno.
- Validacion metodologica de particiones espaciales: reutilizar el esquema de bloques de 1 km con bufer de 100 m como plantilla para evitar fuga espacial en otros experimentos de clasificacion de cobertura.

## Benchmarks y rendimiento

| Metodo | Macro-F1 (11 clases) | Intervalo / comparacion |
|---|---|---|
| Sonda lineal sobre embedding Spheer FM | 0,592 | IC 95 % por block-bootstrap: 0,523–0,626 |
| Random forest sobre 46 caracteristicas Sentinel-2 | 0,551 | no disponible |
| Diferencia emparejada (sonda − random forest) | +0,041 | IC 95 %: +0,006 a +0,066 |

Los resultados corresponden a validacion cruzada de 5 particiones con bloques espaciales de 1 km y bufer de 100 m. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La sonda en si es un modelo de 1.111 parametros: cabe en cualquier CPU, sin GPU, y el coste de inferencia es despreciable.
- Memoria necesaria para los pesos: del orden de unos pocos kilobytes en float32; no se dispone de cifras oficiales de tamano del artefacto (el repositorio figura con 0,0 GB).
- GPU recomendadas: no aplica para la sonda. El coste real de computo recae en generar los embeddings de Spheer FM, que es un modelo fundacional y si requerira aceleracion por GPU.
- Caben en GPU de consumo (RTX 4090, etc.), pero esa afirmacion es irrelevante para la sonda; es la generacion de embeddings la que determina el presupuesto de VRAM, y ese dato no esta disponible en la informacion proporcionada.
- Opciones de despliegue: carga directa con `safetensors.numpy` y NumPy, tal como muestra el ejemplo del autor. No hay integracion documentada con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles; al tratarse de una operacion matricial de 11 x 100, el rendimiento practico dependera del coste de obtener los embeddings de entrada.

## Comparativa con modelos similares

La informacion disponible solo permite comparar la sonda con el baseline interno del propio experimento. No se documentan en la informacion proporcionada otras sondas lineales sobre Spheer FM ni sobre modelos fundacionales de observacion de la Tierra equivalents (Clay, Prithvi-EO, SatMAE, CROMA, entre otros), por lo que sus cifras se marcan como no disponibles.

| Modelo | Tipo | Parametros | Contexto | Macro-F1 11 clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| spheer-nbbg-linear-probe | Sonda lineal sobre embedding Spheer FM | 1.111 | entrada fija de 100 dim. | 0,592 | MIT | HuggingFace, embeddings de entrada gated |
| Random forest sobre 46 caracteristicas Sentinel-2 | Baseline clasico del mismo experimento | no disponible | no aplica | 0,551 | no disponible | no disponible |
| Otras sondas sobre modelos fundacionales de observacion de la Tierra | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambito geografico muy restringido: entrenada en una unica ventana de 11 x 11,5 km (costa de Lelystad, MGRS 31UFU, 20 m) y en un unico ano (2020). El autor espera una transferencia pobre fuera de esa area sin reajuste.
- Fuerte desbalance de clases: el 89 % de la ventana es agua abierta, lo que condiciona las metricas y el comportamiento de la sonda.
- Cobertura de clases incompleta: agricultura, carreteras y construccion se descartaron por falta de pixeles puros en la ventana de entrenamiento.
- Ambiguedad de etiquetas: las clases CBS describen *uso* y no *cobertura*, y son parcialmente inobservables a 20 m de resolucion, lo que introduce error irreducible en las etiquetas.
- Acoplamiento a la version del modelo: mezclar versiones de Spheer FM invalida la sonda, porque cada version produce embeddings en un espacio distinto.
- Dependencia de datos gated: los embeddings de Spheer FM requieren solicitar acceso, lo que limita la reproducibilidad directa por terceros.
- No es un producto de uso del suelo: el autor lo califica explicitamente de artefacto de investigacion, no apto para decisiones sobre el territorio.
- Riesgo de fuga espacial si se reutiliza el pipeline con particiones aleatorias en lugar de bloques de 1 km con bufer.
- Licencia MIT: permisiva para uso comercial, pero la licencia del modelo fundacional subyacente y el acceso a los embeddings son condiciones independientes que hay que verificar.
- Sobre alucinacion y sesgos: no aplicable en el sentido de un modelo generativo, ya que la sonda solo produce etiquetas mediante `argmax`; los sesgos relevantes son de muestreo geografico y de definicion de clases.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AthithyaLogan/spheer-nbbg-linear-probe
- Dataset de embeddings Spheer FM (acceso gated): https://huggingface.co/datasets/spheer/spheer-fm-embeddings
- Repositorio del experimento (experimento 01, embeddings vs random forest): https://github.com/athithyai/Posts/tree/main/01-embeddings-vs-random-forest
