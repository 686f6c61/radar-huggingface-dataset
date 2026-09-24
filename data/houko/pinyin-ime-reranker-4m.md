# houko/pinyin-ime-reranker-4M

## Resumen

pinyin-ime-reranker-4M es un transformer a nivel de caracter de 4.250.112 parámetros desarrollado por houko (repositorio metasequoiaime) que **no decodifica pinyin**: su única función es reranquear la lista de candidatos que un motor de entrada chino (IME) ya ha generado, decidiendo cuál de ellos encaja mejor con el texto que precede al cursor. Ocupa 4,5 MB en disco en int8, en un único fichero safetensors autodescriptivo y sin ficheros auxiliares, y está pensado para ejecutarse on-device dentro del presupuesto de tiempo de una pulsación de tecla.

El modelo cubre el hueco entre "la primera suposición del motor" y "lo que el usuario quería escribir". El autor lo publica junto a una alternativa mayor, pinyin-ime-reranker-25M, y recomienda explícitamente esta versión de 4M para cualquier ruta sensible a latencia: mide 8,6 ms de p95 por pulsación frente a los 97,2 ms del modelo de 25M, a cambio de una precisión inferior en su evaluación de frases (49/56 frente a 52/56). La implementación de referencia es Rust, sin `unsafe` y sin dependencias más allá de serde, pensada para vendorizarse en el árbol del proyecto.

Es relevante ahora porque demuestra que el reranqueo a nivel de carácter en un IME es viable con un presupuesto de parámetros minúsculo y con reglas de gating integradas en la propia librería, además de aportar una metodología de medición poco habitual: métricas separadas de rescates y roturas, y tests de significación (McNemar exacto) sobre las diferencias observadas. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de caracter (character-level) para reranqueo de candidatos |
| Parametros totales | 4.250.112 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero de 4,5 MB en disco) |
| Idiomas soportados | Chino (zh); entrada en pinyin, salida como reordenacion de candidatos |
| Licencia | Apache-2.0 (el directorio `reference/` se licencia por separado tambien como Apache-2.0) |
| Formato de pesos | safetensors, un unico fichero `sentence-model.safetensors`, autodescriptivo y sin sidecars |
| Pipeline declarado | text-ranking |
| Datasets de entrenamiento | allenai/c4, silver/lccc |
| Autor | houko (entrenado y medido en metasequoiaime/chinese-ime-lm) |

## Arquitectura y entrenamiento

Se trata de un transformer a nivel de carácter, no de subpalabras, con 4.250.112 parámetros. El modelo puntúa candidatos ya producidos por el motor de entrada: recibe el texto ya confirmado (prefijo) y una lista de candidatos, y devuelve una puntuación que permite promover uno de ellos. La puntuación utilizada son medias por carácter, no sumas de log-probabilidades, precisamente para que candidatos de distinta longitud sean comparables. Dos detalles de implementación son críticos para cualquiera que reescriba el forward pass: la GELU debe ser la forma erf exacta (no la aproximación por tanh), y el primer carácter de un candidato se predice desde la **última posición del prefijo**, de modo que una puntuación que empiece en la primera posición del propio candidato deja ese carácter sin puntuar.

El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. Los datasets declarados son allenai/c4 y silver/lccc. El modelo se entrenó y evaluó dentro del proyecto chinese-ime-lm, que también publica la especificación completa del fichero y del forward pass en `docs/format.md`, suficiente por sí sola para escribir un loader en cualquier lenguaje.

La innovación destacable no está en la arquitectura sino en el gating, que la librería impone en lugar de delegarlo en quien la integra. Primera regla: nunca sobrescribir un acierto exacto de diccionario sobre la clave completa, porque el diccionario ya incorpora frecuencia de palabras de corpus que un modelo a nivel de carácter no tiene; medido sobre 2.052 casos de ese tipo, la primera elección del motor acierta 0,719 y el mejor resultado reranqueado con cualquier umbral probado se queda en 0,690, y de 25 ponderaciones distintas entre puntuación del modelo, rango y evidencia de diccionario ninguna superó a "dejar los aciertos de diccionario en paz". Segunda regla: solo son comparables los candidatos que cubren la clave completa, y `best_where` restringe además la comparación a candidatos de la misma longitud que el líder, porque una lista de longitudes mixtas ordena siempre primero al candidato más corto.

## Capacidades

- Reranqueo de listas de candidatos de un IME chino basado en pinyin, devolviendo el índice promovido sobre la lista original del motor (`None` significa dejar el orden intacto).
- Puntuación a nivel de carácter con medias por carácter, lo que permite comparar candidatos de distinta longitud sin el sesgo hacia los más cortos.
- Gating integrado: filtrado por fuente del candidato (por ejemplo, aciertos de diccionario) y restricción a candidatos que cubren la clave completa.
- Ejecución on-device con latencia compatible con el presupuesto de una pulsación de tecla (p95 de 8,6 ms).
- Carga desde un único fichero safetensors autodescriptivo, sin necesidad de ficheros de configuración o tokenizador auxiliares.
- No genera texto, no decodifica pinyin y no realiza tool calling, razonamiento multi-paso, visión ni audio: es exclusivamente un reranqueador de candidatos.
- Capacidad multilingüe: no; el modelo está declarado únicamente para chino (zh).

## Casos de uso

- Teclado móvil o extensión de teclado en Android/iOS: el modelo se ejecuta en el propio dispositivo entre pulsaciones y reordena la lista de candidatos del IME; su p95 de 8,6 ms encaja dentro del presupuesto de un frame, algo que el modelo de 25M (97,2 ms) no consigue.
- IME de escritorio con latencia interactiva: integración en un motor de entrada nativo donde cada tecla dispara una reevaluación de candidatos sin bloquear la interfaz.
- Servidores de IME con alto QPS: al ocupar 4,5 MB y requerir solo CPU, permite escalar horizontalmente muchas instancias por máquina para servicios de entrada en la nube.
- Corrección de la primera suposición del motor en textos ya escritos: dado un prefijo confirmado y la lista de candidatos generada, promover la lectura correcta cuando la primera opción del motor no es la que el usuario pretendía.
- Procesamiento por lotes de registros de tecleo para evaluar o depurar un motor de entrada: el reranqueador puede puntuar listas de candidatos offline sobre corpus de pulsaciones y detectar en qué posiciones el motor falla.
- Componente vendorizado en una aplicación Rust: el directorio `reference/` se copia al árbol del proyecto (no está en crates.io) y se usa mediante `Reranker` y `SentenceModel` para evitar dependencias externas más allá de serde.
- Investigación sobre reranqueo a nivel de carácter: su tamaño permite reproducir el entrenamiento y las mediciones con recursos mínimos, y su model card documenta explícitamente los sesgos metodológicos a evitar (por ejemplo, filtrar por la longitud de la respuesta gold, disponible offline pero no en tiempo de ejecución).

## Benchmarks y rendimiento

Las mediciones se hicieron sobre 60 casos de frase escritos a mano y ejecutados a través de un runtime de IME real, no puntuados offline. 56 casos caen en el bucket del decodificador, donde el reranqueo aplica.

| Sistema | Casos / 56 | Precision |
|---|---|---|
| Primera eleccion del motor | 41 | 0,732 |
| Motor + este modelo (4M) | 49 | 0,875 |
| Motor + modelo de 25M | 52 | 0,929 |
| Respuesta gold presente en la lista de candidatos | 52 | 0,929 |

| Metrica adicional | Valor |
|---|---|
| Rescates de este modelo (casos que el motor fallaba) | 10 |
| Roturas de este modelo (casos que el motor acertaba) | 2 |
| Rescates / roturas del modelo de 25M | 11 / 0 |
| p95 por pulsacion de tecla (este modelo) | 8,6 ms |
| p95 por pulsacion de tecla (modelo de 25M) | 97,2 ms (medicion antigua, segun su propia ficha) |
| McNemar exacto frente al modelo de 25M | 0 victorias a 3, p = 0,250 |
| McNemar exacto frente a Qwen3-0.6B | 3 a 3, p = 1,000 |
| Desacuerdo por pares con los modelos comparados | 2 a 6 casos |

El autor advierte de que la columna de precisión no debe leerse como un ranking de calidad: sobre los 52 casos alcanzables, ningún par de modelos probados alcanza significación estadística, y detectar diferencias de 1 a 2 puntos porcentuales requeriría del orden de mil a diez mil casos con esa tasa de desacuerdo. Doce de las 60 frases empiezan por `ta` y toman 他 como gold, algo que no es decidible desde el pinyin. En el subconjunto de 2.052 aciertos exactos de diccionario, la primera elección del motor obtiene 0,719 frente al máximo de 0,690 alcanzado por el reranqueo con cualquier umbral y ponderación probados.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no tendrían sentido para un modelo que no genera texto.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. El fichero int8 ocupa 4,5 MB, por lo que el modelo completo y sus activaciones caben holgadamente en decenas de MB de memoria, muy por debajo de cualquier GPU consumer.
- GPU recomendadas: ninguna en particular; el diseño es on-device y no requiere GPU. No se especifican modelos como A100, H100 o RTX 4090 porque no son necesarios.
- Cabe en cualquier GPU consumer, y también en CPU de móvil: el caso de uso declarado es una extensión de teclado, es decir, ejecución por pulsación de tecla.
- Opciones de despliegue: implementación de referencia en Rust, sin `unsafe` y sin dependencias más allá de serde, pensada para vendorizarse (no está publicada en crates.io). Para otros lenguajes, `docs/format.md` es la especificación completa del fichero y del forward pass. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: p95 de 8,6 ms por pulsación de tecla. No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Fichero (int8) | Precision (casos / 56) | p95 por pulsacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| pinyin-ime-reranker-4M | 4.250.112 | 4,5 MB | 49 / 56 (0,875) | 8,6 ms | no disponible | Apache-2.0 | HuggingFace, implementacion de referencia en Rust |
| pinyin-ime-reranker-25M | 24.863.104 | 25,5 MB | 52 / 56 (0,929) | 97,2 ms (medicion antigua) | no disponible | no disponible en la informacion proporcionada | HuggingFace (metasequoiaime) |
| Qwen3-0.6B | no disponible en la informacion proporcionada | no disponible | 3 a 3 en McNemar exacto frente a este modelo (p = 1,000) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

Los dos reranqueadores comparten nombre de fichero (`sentence-model.safetensors`) y misma integración; la diferencia práctica es el presupuesto de latencia. La comparación con Qwen3-0.6B solo aparece como contraste estadístico en el test de McNemar, sin más datos publicados en la información disponible.

## Limitaciones y advertencias

- No decodifica pinyin. Alimentarlo con una cadena de pinyin no devuelve texto chino; solo reordena una lista de candidatos ya existente.
- Puede promover un candidato incorrecto: en la evaluación declarada rompe 2 casos que el motor acertaba, mientras que el modelo de 25M no rompe ninguno. Toda la diferencia de 3 casos respecto al modelo mayor es rotura, no rescates perdidos.
- Las diferencias de precisión frente a los modelos comparados no son estadísticamente significativas con el tamaño de muestra usado; no deben usarse para decidir entre modelos.
- Nunca debe sobrescribir un acierto exacto de diccionario sobre la clave completa: hacerlo degrada la precisión de 0,719 a 0,690 en las 2.052 muestras medidas.
- Sesgo de longitud: una suma de log-probabilidades ordena primero al candidato más corto en listas de longitudes mixtas; por eso el modelo usa medias por carácter y `best_where` restringe la comparación a candidatos de la misma longitud que el líder.
- Trampa metodológica documentada: filtrar por la longitud de la respuesta gold es posible offline pero no en tiempo de ejecución; medir con ese predicado produce cifras mejores que las del producto real.
- Idiomas: únicamente chino (zh). No hay soporte multilingüe declarado.
- Longitud de contexto: no disponible en la información proporcionada.
- Riesgo de alucinación: al no generar texto libre, el riesgo no es inventar contenido, sino asignar una puntuación alta a un candidato semánticamente inadecuado para el prefijo.
- La licencia Apache-2.0 permite uso comercial del modelo; el directorio `reference/` tiene su propia licencia Apache-2.0 separada, precisamente para poder vendorizarse de forma independiente.
- Implementación de detalle: usar la aproximación tanh de GELU en lugar de la forma erf exacta, o puntuar el primer carácter del candidato desde su propia posición en vez de desde la última posición del prefijo, produce resultados silenciosamente incorrectos.
- No se documentan sesgos demográficos o culturales concretos más allá de las limitaciones metodológicas descritas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/houko/pinyin-ime-reranker-4M
- Modelo alternativo de 25M: https://huggingface.co/metasequoiaime/pinyin-ime-reranker-25M
- Repositorio de entrenamiento y medicion: https://github.com/metasequoiaime/chinese-ime-lm
- Implementacion de referencia en Rust: https://github.com/metasequoiaime/chinese-ime-lm/tree/main/reference
- Especificacion del formato y del forward pass: https://github.com/metasequoiaime/chinese-ime-lm/blob/main/docs/format.md
- Datasets citados: allenai/c4 y silver/lccc (referenciados en la model card; no se proporcionan URL directas)

No se han encontrado enlaces adicionales relevantes en la busqueda web: los resultados devueltos no guardan relacion con este modelo ni con modelos de lenguaje.
