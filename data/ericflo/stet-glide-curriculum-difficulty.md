# ericflo/stet-glide-curriculum-difficulty

## Resumen

Stet GLiDE Curriculum Difficulty es una cabeza de clasificacion (difficulty head) entrenada sobre el modelo base fastino/GLiDE-0.4B, un encoder multilingue de 0,4 mil millones de parametros. La desarrolla el usuario ericflo y su proposito no es generar texto, sino estimar la dificultad relativa de lectura de pasajes de texto para un modelo de lenguaje pequeno. Se enmarca en el ambito de la curacion de datos (data curation) y el aprendizaje por curriculo (curriculum learning): permite ordenar ejemplos de entrenamiento de mas facil a mas dificil.

El artefacto es un head de ranking que se carga por separado del encoder. Se entreno sobre 510 pasajes extraidos del corpus de entrenamiento retenido de una practica publica de Stet, con etiquetas que promedian las perdidas de next-token de dos estudiantes entrenados de forma independiente. Cubre seis idiomas (ingles, ruso, espanol, aleman, frances y chino) y reporta una correlacion de Spearman intra-idioma media de 0,541 sobre pasajes reservados.

Es relevante porque ofrece un mecanismo concreto y medible para ordenar curriculos de datos multilingues en lugar de aplicar heuristicas genericas. El repositorio no contiene los pesos del modelo base: solo el head (`difficulty-head.safetensors`) y el codigo de carga, y el encoder debe obtenerse por separado bajo la licencia de la comunidad de Fastino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de regresion sobre encoder transformer (base fastino/GLiDE-0.4B); implementada como `LayoutHead(1024)` en `layout_model.py` |
| Parametros totales | no disponible (el head es de dimension 1024; el encoder base tiene 0,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 112 tokens; se tokeniza hasta 128 tokens del encoder; cada etiqueta cubre los ultimos 48 tokens de la ventana |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles, ruso, espanol, aleman, frances y chino |
| Licencia | MIT (el head); el modelo base fastino/GLiDE-0.4B se rige por la Fastino Community License |
| Formato de pesos | safetensors (`difficulty-head.safetensors`) |

## Arquitectura y entrenamiento

El componente entrenado es una cabeza de regresion que consume los embeddings del encoder GLiDE-0.4B y produce una puntuacion escalar de dificultad; valores mas bajos indican lectura mas facil. La integracion se realiza con `AutoModel` y `AutoTokenizer` fijados a la revision del encoder `6bda7ab91aeb36dcad6d27828a8871e548c7fc71`, con padding a la derecha, y la inferencia se ejecuta en modo evaluacion mediante `head(embed(encoder, tokens))`.

El entrenamiento uso 510 pasajes del texto de entrenamiento retenido de un corpus publico de practica de Stet. Las etiquetas se obtuvieron promediando las perdidas de next-token de dos estudiantes entrenados de forma independiente, lo que convierte la dificultad en una medida empirica de predecibilidad para modelos pequenos. La seleccion de modelo uso 120 pasajes adicionales y el test 420; el corpus de test y los hosts quedaron reservados, y el pipeline de etiquetado excluyo las URL presentes en los corpus de entrenamiento de los propios estudiantes para evitar fuga de datos. En un experimento local de escala estandar de Stet, el head adelanto los pasajes mas faciles mediante 154 intercambios emparejados, manteniendo fijos el texto fuente y los recuentos de visitas.

## Capacidades

- Estimacion de dificultad de lectura relativa de pasajes de texto para un modelo pequeno, con puntuacion escalar por pasaje.
- Ranking de ejemplos dentro de un mismo idioma y una misma forma de escritura, orientado a construir curriculos de entrenamiento.
- Cobertura multilingue en seis idiomas: ingles, ruso, espanol, aleman, frances y chino.
- Curacion de datos: seleccion y ordenacion de ejemplos de un corpus de entrenamiento.
- Evaluacion comparativa de curriculos mediante metricas de bits por token y bits por byte.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni vision: es un componente auxiliar de puntuacion.

## Casos de uso

- Construccion de curriculos de preentrenamiento: ordenar los ejemplos de un corpus de mas facil a mas dificil antes de alimentar a un modelo pequeno, usando la puntuacion del head como clave de ordenacion dentro de cada idioma.
- Filtrado de datos por dificultad: descartar pasajes con puntuaciones anomalas o agrupar el corpus en cuartiles de dificultad para experimentos controlados de mezcla de datos.
- Evaluacion de corpus multilingues: comparar la dificultad media de distintos subconjuntos (por idioma o por forma de escritura) para detectar desequilibrios en la mezcla de entrenamiento.
- Investigacion en curriculum learning: reproducir el experimento de intercambios emparejados del autor y medir el efecto sobre bits por byte en examenes de escritura del mismo corpus de practica.
- Seleccion de datos para ajuste fino: priorizar ejemplos de dificultad intermedia cuando el presupuesto de entrenamiento es limitado.
- Control de calidad de datasets: detectar pasajes inusualmente dificiles o triviales que puedan indicar ruido, duplicados o contenido mal formado.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Correlacion de Spearman intra-idioma media (pasajes reservados, 6 idiomas) | 0,541 |
| Dificultad media del cuartil superior predicho frente a la media del idioma (estudiante 1) | 0,777 bits por token |
| Dificultad media del cuartil superior predicho frente a la media del idioma (estudiante 2) | 0,764 bits por token |
| Examen de escritura 1 (experimento local de Stet) | +0,07316 bits por byte |
| Examen de escritura 2 (experimento local de Stet) | +0,07188 bits por byte |
| Ventaja sobre el comparador Exact Replay, examen 1 | +0,00104 bits por byte |
| Ventaja sobre el comparador Exact Replay, examen 2 | +0,00049 bits por byte |
| Intercambios emparejados en el experimento local | 154 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el artefacto no es un modelo generativo.

## Requisitos de hardware

- El head es un tensor de dimension 1024 y ocupa un espacio minimo; el coste real de inferencia lo determina el encoder GLiDE-0.4B.
- VRAM estimada: no disponible de forma oficial; para un encoder de 0,4B en precision completa se situa en el orden de 1-2 GB, y menos con cuantizacion de 8 o 4 bits.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia ser suficiente para el encoder de 0,4B; no se han publicado mediciones especificas para A100, H100 o RTX 4090.
- Cabe en GPU consumer: si, por el tamano del encoder base; no hay datos publicados de modelos concretos probados.
- Opciones de despliegue: carga directa con `AutoModel` y `AutoTokenizer` de la revision fijada del encoder, mas el head cargado desde `difficulty-head.safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos comparables de estimacion de dificultad de lectura basados en perdida de next-token con cobertura multilingue. Las alternativas habituales en curacion de datos (clasificadores de calidad, filtros heuristicos o modelos de perplexidad) no se han evaluado contra este head en la documentacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Las puntuaciones solo son comparables dentro de un mismo idioma y una misma forma de escritura; no deben compararse entre idiomas ni entre generos.
- La dificultad estimada es relativa a un modelo pequeno concreto (los dos estudiantes de etiquetado), no una medida absoluta de legibilidad humana.
- La ventana es corta (112 tokens, con etiqueta sobre los ultimos 48), lo que limita la evaluacion de documentos largos.
- El entrenamiento se realizo sobre 510 pasajes de un unico corpus de practica de Stet; la generalizacion a otros dominios no esta documentada.
- No hay informacion sobre sesgos por idioma, dominio o demografia; el chino y el ruso estan representados en el conjunto de evaluacion, pero se desconoce el equilibrio por idioma en el entrenamiento.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de puntuaciones erroneas en pasajes fuera de distribucion.
- El head se distribuye bajo licencia MIT, pero el modelo base fastino/GLiDE-0.4B requiere cumplir la Fastino Community License, lo que condiciona el uso comercial del conjunto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB; no hay evidencia de validacion externa independiente.

## Enlaces

- Repositorio del head: https://huggingface.co/ericflo/stet-glide-curriculum-difficulty
- Modelo base: https://huggingface.co/fastino/GLiDE-0.4B
- Revision del encoder: `6bda7ab91aeb36dcad6d27828a8871e548c7fc71`
