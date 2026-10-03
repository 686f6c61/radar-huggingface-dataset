# ECE-Software/t1-text-keywords

## Resumen

T1 Text Keyword Layer (identificador `ECE-Software/t1-text-keywords`) no es un modelo neuronal de lenguaje, sino una capa de pre-filtrado por palabras clave y expresiones regulares que se ejecuta en el servidor para moderar texto en la plataforma ECE Connect. El repositorio publica cuatro artefactos de datos: el lexicón HurtLex en inglés (`hurtlex_EN.tsv`), un fichero de categorías de HurtLex a cargar (`hurtlex_categories.json`, con las categorías `ddf`, `re` e `is`), una lista curada de 42 insultos repartidos en 10 categorías (`manual_slurs.json`) y 9 patrones regex para amenazas directas (`threat_patterns.json`).

El autor lo clasifica como componente de "Tier 1" (T1): se aplica al 100% de las subidas de texto en el servidor de Connect. La model card indica explícitamente que no existe versión on-device ni un modelo T0 de texto asociado. El propósito declarado es bloquear de forma determinista el lenguaje explícito y dejar que un modelo neuronal complementario (toxic-bert) rescate los casos de lenguaje codificado o dependiente de contexto.

Su relevancia práctica es la de un componente de coste casi nulo que actúa como primera línea de defensa en pipelines de moderación: filtra coincidencias léxicas exactas y patrones de amenaza antes de invocar un clasificador más caro. No publica datos de arquitectura neuronal, parámetros, contexto ni cuantización porque no aplican a este tipo de artefacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; capa de coincidencia léxica (diccionario + expresiones regulares) |
| Parámetros totales | No aplica / no disponible |
| Parámetros activos | No aplica |
| Longitud de contexto | No aplica (coincidencia por palabra o patrón, sin ventana de contexto) |
| Tipos de cuantización | No aplica |
| Idiomas soportados | Inglés (el lexicón HurtLex incluido es `hurtlex_EN.tsv`); el resto no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica; se distribuyen ficheros TSV y JSON (`hurtlex_EN.tsv`, `hurtlex_categories.json`, `manual_slurs.json`, `threat_patterns.json`) |

## Arquitectura y entrenamiento

El componente no tiene arquitectura de red neuronal ni proceso de entrenamiento. Funciona como un motor de reglas: carga el lexicón HurtLex filtrado por las categorías seleccionadas (`ddf`, `re`, `is`), añade los 42 insultos de la lista manual agrupados en 10 categorías y compila cada término como un patrón con límites de palabra (`\b...\b`) para evitar coincidencias parciales. Los 9 patrones de amenaza se compilan aparte con la bandera `re.IGNORECASE`.

La model card no documenta ninguna innovación técnica ni fases de RLHF/DPO, algo que no tiene sentido en un componente basado en reglas. La lógica de diseño sí es destacable: la capa se plantea como pre-filtro barato que se ejecuta siempre, y se combina con toxic-bert como segunda etapa de rescate. No se especifica el tamaño del lexicón HurtLex incluido, la composición completa del dataset fuente ni los detalles de anotación de los 42 insultos manuales.

## Capacidades

- Detección de términos explícitos mediante el lexicón HurtLex en inglés, restringido a las categorías `ddf`, `re` e `is`.
- Detección de insultos curados a mano: 42 entradas distribuidas en 10 categorías.
- Detección de amenazas directas mediante 9 expresiones regulares.
- Coincidencia con límites de palabra para reducir falsos positivos por subcadenas.
- Ejecución determinista y auditable: cada marcado se puede trazar a un término o patrón concreto.
- Integración como etapa previa (pre-filtro) en pipelines de moderación de texto en servidor.
- No realiza generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües más allá del lexicón en inglés.

## Casos de uso

- Moderación de subidas de texto en servidor: aplicar la capa al 100% del texto entrante para descartar o marcar rápidamente los casos con lenguaje explícito antes de invocar un clasificador neuronal más costoso.
- Pre-filtro en cascada con toxic-bert: usar esta capa como primera etapa y reservar toxic-bert para los casos no detectados, aprovechando que el sistema combinado alcanza un 90% de recuerdo de odio según la model card.
- Detección de amenazas directas: aplicar los 9 patrones regex para aislar mensajes con amenazas explícitas y enrutarlos a revisión humana prioritaria.
- Cumplimiento normativo y auditoría: al ser reglas explícitas, permite justificar ante un revisor por qué se marcó un contenido, algo más difícil con un clasificador opaco.
- Filtrado de comentarios en comunidades en inglés: desplegar el lexicón HurtLex y la lista manual para bloquear insultos manifiestos en foros o chats.
- Enriquecimiento de pipelines de datos: usar las etiquetas de categoría (`ddf`, `re`, `is`, `manual_*`) para anotar grandes volúmenes de texto a bajo coste antes de un análisis posterior.
- Control de costes en moderación a escala: al no requerir GPU, permite aplicarlo a todo el tráfico y reducir el número de inferencias del modelo neuronal al subconjunto que realmente lo necesita.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card corresponden a una evaluación sobre 300 tuits de discurso de odio de Kaggle, midiendo únicamente el recuerdo (recall) de odio:

| Componente | Recuerdo de odio |
|---|---|
| Capa de palabras clave sola | 74% |
| toxic-bert solo | 81% |
| Combinado (rescate) | 90% |

Según la model card, la capa de palabras clave captura insultos explícitos y toxic-bert rescata el 62% de los casos que la capa léxica no detecta (lenguaje codificado o dependiente de contexto). No se publican métricas de precisión, F1, falsos positivos, latencia ni resultados en otros conjuntos de datos. Los resultados de búsqueda web disponibles tratan sobre una escuela de ingeniería francesa (ECE) y no contienen datos de benchmarks relevantes para este componente.

## Requisitos de hardware

- VRAM: no aplica; el componente no ejecuta ningún modelo neuronal y puede correr en CPU.
- GPU recomendadas: ninguna; no requiere GPU.
- GPU de consumo: no aplica, ya que no necesita aceleración por hardware.
- Coste de memoria: el consumo depende únicamente del tamaño del lexicón HurtLex y de los patrones compilados; no se publica una cifra concreta.
- Opciones de despliegue: cualquier entorno Python 3 con `re`, `csv` y `json`, más `huggingface_hub` para descargar los ficheros; el patrón de uso descrito en la model card es una carga en memoria seguida de compilación de patrones.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser coincidencia por expresión regular sobre diccionarios en memoria, la latencia escala con el número de patrones y la longitud del texto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Componente | Tipo | Enfoque | Recuerdo de odio (300 tuits Kaggle) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| T1 Text Keyword Layer | Capa léxica + regex | Determinista, sin entrenamiento | 74% | Apache-2.0 | HuggingFace (`ECE-Software/t1-text-keywords`) |
| toxic-bert | Modelo neuronal de clasificación | Transformer afinado para toxicidad | 81% | No disponible en la información proporcionada | Mencionado en la model card; enlace no disponible |
| Combinación de ambos | Cascada léxica + neuronal | Pre-filtro + rescate | 90% | N/A | N/A |

No se dispone en la información proporcionada de otros comparadores directos (por ejemplo, listas de bloqueo alternativas o clasificadores de toxicidad de terceros) con sus parámetros, contexto o licencia. Las filas de toxic-bert se basan únicamente en los datos citados en la propia model card.

## Limitaciones y advertencias

- Solo cubre inglés: el lexicón HurtLex incluido es la variante EN, por lo que el texto en otros idiomas no se filtra con esta capa.
- Alta dependencia del contexto: el propio autor reconoce que la capa falla en lenguaje codificado o dependiente de contexto; sin toxic-bert detrás, el recuerdo cae al 74% sobre el conjunto evaluado.
- Riesgo de falsos positivos: la coincidencia con límites de palabra no elimina casos de términos legítimos dentro de contextos no ofensivos, y la model card no publica métricas de precisión ni de falsos positivos.
- Cobertura limitada por diseño: la lista manual son solo 42 insultos en 10 categorías y los patrones de amenaza son solo 9 expresiones regulares, lo que deja fuera muchas formulaciones.
- Sin contexto ni intención: al operar por palabra o patrón, no distingue cita, ironía, autorreferencia ni discurso reportado.
- Fácil de eludir: variaciones ortográficas, homoglifos, espaciado o sustituciones de caracteres pueden esquivar la coincidencia exacta.
- Datos de evaluación modestos: el 74%/81%/90% se midió sobre 300 tuits, un conjunto pequeño y de un único dominio; no hay validación en otros corpus.
- Trazabilidad del lexicón: no se documenta la versión de HurtLex incluida ni si hay actualizaciones periódicas del léxico.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones de la fuente original de HurtLex, que no se detallan en la información disponible.
- Metadatos incompletos: el repositorio registra 0 descargas y 0 likes, no declara pipeline y no lista idiomas en la ficha de HuggingFace.

## Enlaces

- HuggingFace: https://huggingface.co/ECE-Software/t1-text-keywords
- No se han encontrado en los resultados de búsqueda web enlaces relevantes al modelo: las coincidencias se refieren a la institución educativa ECE (Escuela Central de Electrónica, Francia) y a un artículo sobre IA en educación infantil, sin relación con este componente.
- Repositorio de código, paper o demo: no disponibles en la información proporcionada.
- Enlace a HurtLex original: no disponible en la información proporcionada.
- Enlace a toxic-bert: no disponible en la información proporcionada.
