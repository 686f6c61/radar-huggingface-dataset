# msime/pinyin-ime-reranker-4M

## Resumen

pinyin-ime-reranker-4M es un modelo de reranking a nivel de carácter desarrollado por msime para motores de entrada (IME) de chino basados en pinyin. Con 4.250.112 parámetros y un peso de 4,5 MB en int8, no decodifica pinyin ni genera texto: recibe la lista de candidatos que ya ha producido el motor del usuario y estima cuál de ellos encaja mejor con el texto ya confirmado. Resuelve la brecha entre la primera conjetura del motor y lo que la persona realmente pretendía escribir.

El modelo se publica como un único fichero safetensors autodescriptivo, sin ficheros auxiliares, y está pensado para ejecutarse en el dispositivo, incluida una extensión de teclado móvil. Su coste medido es de 0,33 ms por carácter candidato y 46 ms en el peor caso de pulsación para una frase de 15 caracteres con 9 candidatos, lo que lo sitúa dentro del presupuesto de un fotograma.

Es relevante porque demuestra que un transformer de tamaño mínimo, entrenado específicamente para una tarea de ranking restringida, puede aportar valor en un dominio donde la latencia es crítica y los modelos grandes no son viables. La implementación de referencia está en Rust, publicada en crates.io como `chinese-ime-lm` bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de carácter (character-level) |
| Parametros totales | 4.250.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (4,5 MB en disco) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fichero único `sentence-model.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer a nivel de carácter con 4,25 millones de parámetros. El modelo puntúa candidatos calculando la verosimilitud media por carácter del candidato dado el texto de prefijo ya confirmado. Un detalle técnico relevante es que el primer carácter del candidato se predice desde la última posición del prefijo, no desde la primera posición del propio candidato; una implementación que empiece a puntuar en la posición inicial del candidato deja ese carácter sin puntuar. Además, la activación GELU debe usar la forma exacta con erf, no la aproximación mediante tanh.

El entrenamiento se realizó en el repositorio `metasequoiaime/chinese-ime-lm`, cuya pipeline de entrenamiento está licenciada bajo GPL-3.0 (separada de la implementación de referencia, que es Apache-2.0). Los datasets citados en la model card son allenai/c4 y silver/lccc. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

Una innovación destacable es que el modelo incorpora el gating como parte de su diseño: la crate de referencia impone dos reglas en lugar de dejarlas al llamador. Primero, nunca sobrescribir un acierto de diccionario en el que se confía, ya que el diccionario aporta frecuencia de palabras de corpus que un modelo a nivel de carácter no tiene; medido sobre 2.052 casos, la primera opción del motor acierta el 0,719 frente al 0,690 del mejor resultado rerankeado con cualquier umbral probado. Segundo, solo son comparables los candidatos que responden a la clave completa, no prefijos ni completaciones predictivas.

## Capacidades

- Reranking de listas de candidatos generadas previamente por un motor de entrada pinyin chino.
- Puntuación a nivel de carácter con media de log-probabilidad por carácter, lo que evita sesgos hacia candidatos más cortos.
- Distinción entre candidatos que cubren la clave completa y candidatos que son prefijos o completaciones predictivas.
- Gestión explícita de aciertos de diccionario mediante el flag `trusted_dictionary_hit`, que permite al motor decidir si debe deferir al diccionario.
- Soporte para corrección de entrada: el flag `answers_key` permite tratar casos donde distintas segmentaciones consumen la misma clave (por ejemplo, `xian` como 现 o como 西安).
- Ejecución en dispositivo con latencia de 0,33 ms por carácter candidato.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- No genera texto ni decodifica pinyin de forma autónoma.

## Casos de uso

- Extensión de teclado móvil: el modelo se integra en el flujo de pulsación de tecla para reordenar candidatos en tiempo real; sus 46 ms en el peor caso para una frase de 15 caracteres con 9 candidatos caben dentro del presupuesto de un fotograma.
- Motores de entrada de escritorio en Rust: la crate `chinese-ime-lm` permite incorporar el reranker con una dependencia mínima (`serde`, `serde_json`, `thiserror`) y sin `unsafe`, lo que simplifica la auditoría y el empaquetado.
- Corrección de input en motores que aplican autocorrección: el flag `trusted_dictionary_hit` permite al motor indicar que un acierto de diccionario se produjo sobre la clave sin corregir y, por tanto, no debe deferirse a él.
- Desambiguación de segmentaciones: casos como `xian` (现 frente a 西安) se resuelven usando `answers_key` en lugar de comparar longitudes, que fallaría exactamente donde importa la corrección.
- Sistemas con restricciones severas de memoria: con 4,5 MB en int8 y un único fichero safetensors, el modelo cabe en dispositivos embebidos y entornos donde no es posible cargar modelos de decenas de megabytes.
- Integración en pipelines de ranking existentes: cualquier motor que ya produzca una lista ordenada de candidatos puede usar el modelo como etapa de reordenación sin cambiar su decodificador de pinyin.
- Evaluación comparativa de motores IME: el modelo sirve como referencia ligera para medir la calidad de las listas de candidatos de un motor frente a la de otro.

## Benchmarks y rendimiento

| Metrica | pinyin-ime-reranker-4M | pinyin-ime-reranker-25M |
|---|---|---|
| Parametros | 4.250.112 | 24.863.104 |
| Fichero (int8) | 4,5 MB | 25,5 MB |
| Evaluación de frases, top-1 | 49 / 56 | 52 / 56 |
| Coste por carácter candidato | 0,33 ms | 2,0 ms |
| Peor pulsación, frase de 15 caracteres, 9 candidatos | 46 ms | 268 ms |

La diferencia de 3 casos sobre 56 no es estadísticamente significativa según la model card (McNemar p = 0,250). En el gating de aciertos de diccionario, medido sobre 2.052 casos, la primera opción del motor obtiene 0,719 y el mejor resultado rerankeado con cualquier umbral probado obtiene 0,690; se barrieron 25 ponderaciones entre puntuación del modelo, rango y evidencia de diccionario, y ninguna superó a dejar los aciertos de diccionario sin tocar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en int8, dado que el fichero de pesos ocupa 4,5 MB.
- GPU recomendadas: no requiere GPU; está diseñado para ejecución en CPU en dispositivo.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles y embebidos.
- Opciones de despliegue: crate de Rust `chinese-ime-lm` (referencia oficial); para otros lenguajes, el documento `docs/format.md` especifica el formato del fichero y el forward pass completos.
- Latencia: 0,33 ms por carácter candidato; 46 ms en el peor caso de pulsación para una frase de 15 caracteres con 9 candidatos.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Fichero (int8) | Top-1 (56 frases) | Coste por carácter | Licencia |
|---|---|---|---|---|---|
| pinyin-ime-reranker-4M | 4.250.112 | 4,5 MB | 49 / 56 | 0,33 ms | Apache-2.0 |
| pinyin-ime-reranker-25M | 24.863.104 | 25,5 MB | 52 / 56 | 2,0 ms | no disponible |

No se dispone de información sobre otros modelos comparables de reranking para IME pinyin en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no decodifica pinyin: alimentarlo con una cadena de pinyin no produce texto chino. Solo reordena candidatos ya generados.
- Solo soporta chino (zh); no está entrenado para otros idiomas.
- El reranking no es universalmente beneficioso: sobre aciertos de diccionario fiables, el reordenamiento empeora el resultado (0,690 frente a 0,719), por lo que el gating es obligatorio para un uso correcto.
- La regla de no sobrescribir aciertos de diccionario asume que la clave respondida es la que el usuario pretendía; los motores que corrigen la entrada rompen esa premisa y deben señalarlo mediante `trusted_dictionary_hit`.
- Comparar candidatos por longitud en lugar de por `answers_key` produce errores en casos de corrección como `xian` (现 frente a 西安).
- Medir con un predicado de gating basado en la longitud de la respuesta dorada da cifras mejores que las reales en producción; hay que medir con el predicado que se va a desplegar.
- La pipeline de entrenamiento está licenciada bajo GPL-3.0, separada de la implementación de referencia Apache-2.0; conviene revisar qué componente se reutiliza en un producto comercial.
- No se han publicado datos sobre sesgos, tasa de alucinación (en el sentido de reordenaciones incorrectas) ni comportamiento fuera del dominio de frases de entrada.
- El repositorio registra 0 descargas en el momento de la consulta, lo que limita la evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/msime/pinyin-ime-reranker-4M
- Modelo mayor: https://huggingface.co/msime/pinyin-ime-reranker-25M
- Repositorio de entrenamiento y referencia: https://github.com/metasequoiaime/chinese-ime-lm
- Directorio de la implementación de referencia: https://github.com/metasequoiaime/chinese-ime-lm/tree/main/reference
- Especificación del formato y forward pass: https://github.com/metasequoiaime/chinese-ime-lm/blob/main/docs/format.md
- Crate en crates.io: https://crates.io/crates/chinese-ime-lm
- Dataset allenai/c4: https://huggingface.co/datasets/allenai/c4
- Dataset silver/lccc: no disponible
