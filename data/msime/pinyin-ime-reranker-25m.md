# msime/pinyin-ime-reranker-25M

## Resumen

pinyin-ime-reranker-25M es un modelo de reranking a nivel de carácter desarrollado por msime para motores de entrada (IME) de pinyin chino. Con 24,9 millones de parámetros, no decodifica pinyin ni genera texto: recibe la lista de candidatos que ya ha producido el motor y estima cuál de ellos encaja mejor con el texto previo comprometido. Resuelve, por tanto, el problema de la desambiguación entre la primera opción del motor y lo que el usuario realmente pretendía escribir.

El modelo se distribuye como un único archivo safetensors autocontenido de 25,5 MB en int8, sin ficheros auxiliares, y está pensado para ejecutarse en escritorio o en rutas que no sean por pulsación de tecla. Su hermano menor, pinyin-ime-reranker-4M, ocupa 4,5 MB y es seis veces más barato por decisión, lo que lo hace preferible en extensiones de teclado móvil.

La relevancia actual del modelo radica en su enfoque de ingeniería: incorpora el *gating* como parte del propio modelo (no sobrescribir coincidencias de diccionario fiables y comparar solo candidatos que cubren la clave completa) y expone una implementación de referencia en Rust publicada en crates.io, con licencia Apache-2.0 y una especificación completa del formato y del forward pass.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de carácter |
| Parametros totales | 24.863.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (pesos distribuidos en int8) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (archivo único `sentence-model.safetensors`, 25,5 MB) |

## Arquitectura y entrenamiento

Se trata de un transformer a nivel de carácter que puntúa candidatos condicionados por el prefijo de texto ya comprometido. El modelo predice el primer carácter del candidato a partir de la última posición del prefijo, un detalle crítico de implementación: si el scoring comienza en la primera posición del propio candidato, ese carácter queda sin puntuar. Las puntuaciones se expresan como medias por carácter, no como sumas de log-probabilidades, para que candidatos de distinta longitud sean comparables.

El entrenamiento se realizó en el repositorio metasequoiaime/chinese-ime-lm, con datasets allenai/c4 y silver/lccc. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO. La implementación de referencia en Rust no usa `unsafe` y solo depende de `serde`, `serde_json` y `thiserror`; se publica en crates.io como `chinese-ime-lm` bajo Apache-2.0, separada de la pipeline de entrenamiento, que es GPL-3.0. Un detalle técnico relevante para reimplementaciones: GELU debe usar la forma exacta con erf, no la aproximación tanh.

## Capacidades

- Reranking de candidatos: recibe una lista ordenada por el motor y devuelve el índice del candidato promovido, o `None` para dejar el orden intacto.
- Condicionamiento por prefijo: puntúa cada candidato según el texto ya comprometido por el usuario.
- Gestión de *gating* integrada: regla de no sobrescribir coincidencias de diccionario fiables y de comparar solo candidatos que cubren la clave completa.
- Distinción entre candidatos que responden a la clave completa y los que son prefijos o completaciones predictivas.
- Soporte de corrección de entrada: la API `best_where` recibe `CandidateFacts { answers_key, trusted_dictionary_hit }` para que el motor declare explícitamente si una coincidencia de diccionario debe respetarse cuando la clave fue corregida.
- No genera texto ni decodifica pinyin: alimentarlo con una cadena de pinyin no produce texto chino.
- Capacidades multilingües: no disponibles; solo chino.

## Casos de uso

- Escritorio con IME de pinyin: integración en el motor de escritorio para reordenar candidatos en rutas que no son por pulsación de tecla, donde el coste de 2,0 ms por carácter candidato es asumible.
- Referencia de precisión para modelos pequeños: usar este modelo como patrón contra el que medir el reranker de 4M en tareas de desambiguación, ya que en el conjunto de evaluación de frases alcanza 52/56 frente a 49/56 del pequeño.
- Desambiguación de lecturas ambiguas: casos como `xian`, que puede leerse como 现 o como 西安; el modelo distingue candidatos que consumen la clave completa frente a filtros por longitud.
- Motores que corrigen la entrada: cuando el usuario teclea `gongsi` queriendo `gongshi`, el motor puede marcar `trusted_dictionary_hit` como falso para que el modelo no se pliegue a una coincidencia de diccionario sobre las letras que llegaron.
- Reordenación por lotes o asíncrona: al no ser por pulsación de tecla, puede aplicarse en procesos de posprocesado de texto o en herramientas de escritura asistida.
- Integración en Rust sin dependencias pesadas: el crate `chinese-ime-lm` permite incorporar el modelo en aplicaciones nativas con un grafo de dependencias mínimo.
- Evaluación comparativa de motores IME: servir como juez de candidatos en experimentos controlados sobre calidad de desambiguación.

## Benchmarks y rendimiento

| Metrica | Este modelo | pinyin-ime-reranker-4M |
|---|---|---|
| Parametros | 24.863.104 | 4.250.112 |
| Archivo (int8) | 25,5 MB | 4,5 MB |
| Evaluación de frases, top-1 | 52 / 56 | 49 / 56 |
| Coste por carácter candidato | 2,0 ms | 0,33 ms |
| Peor pulsación, frase de 15 caracteres, 9 candidatos | 268 ms | 46 ms |

La diferencia de 3 casos sobre 56 no es estadísticamente significativa según la prueba de McNemar indicada en la model card (p = 0,250). En 2.052 casos de coincidencia de diccionario, la primera opción del motor alcanza 0,719 y el mejor resultado rerankeado en cualquier umbral probado es 0,690; se barrieron 25 ponderaciones entre puntuación del modelo, rango y evidencia de diccionario, y ninguna superó la regla de dejar intactas las coincidencias de diccionario.

## Requisitos de hardware

- VRAM estimada: el archivo int8 ocupa 25,5 MB; la huella en memoria es muy reducida y cabe en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: implementación de referencia en Rust mediante el crate `chinese-ime-lm` (v0.2); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 2,0 ms por carácter candidato; peor pulsación de 268 ms para una frase de 15 caracteres con 9 candidatos.

## Comparativa con modelos similares

| Modelo | Parametros | Archivo int8 | Evaluación frases top-1 | Coste por carácter | Licencia |
|---|---|---|---|---|---|
| pinyin-ime-reranker-25M | 24.863.104 | 25,5 MB | 52 / 56 | 2,0 ms | Apache-2.0 |
| pinyin-ime-reranker-4M | 4.250.112 | 4,5 MB | 49 / 56 | 0,33 ms | Apache-2.0 |
| Otros rerankers de IME | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No decodifica pinyin ni genera texto: es exclusivamente un reranker de candidatos ya producidos por el motor.
- El *gating* es parte del modelo: ignorar las reglas de no sobrescribir coincidencias de diccionario fiables y de comparar solo candidatos que cubren la clave completa degrada el resultado.
- La regla de diccionario presupone que la clave respondida es la que el usuario pretendía; los motores que corrigen la entrada deben declararlo explícitamente mediante `trusted_dictionary_hit`.
- Filtrar por longitud no equivale a cubrir la clave: `xian` puede consumir la clave como 现 o como 西安, y un filtro por longitud descarta una de las dos lecturas.
- Detalles de implementación que provocan errores silenciosos: usar la aproximación tanh de GELU en lugar de la forma exacta con erf, y empezar el scoring en la primera posición del candidato en lugar de la última del prefijo.
- El modelo es seis veces más caro por decisión que el de 4M y no ofrece una mejora estadísticamente significativa en el conjunto de evaluación de frases; en extensiones de teclado móvil no es adecuado.
- Sesgos conocidos y riesgo de alucinación: no disponibles en la información proporcionada.
- Restricciones de licencia: pesos e implementación de referencia bajo Apache-2.0, lo que permite uso comercial; la pipeline de entrenamiento es GPL-3.0 y se licencia por separado.
- Solo soporta chino; no hay soporte multilingüe documentado.

## Enlaces

- [Hugging Face: msime/pinyin-ime-reranker-25M](https://huggingface.co/msime/pinyin-ime-reranker-25M)
- [pinyin-ime-reranker-4M](https://huggingface.co/msime/pinyin-ime-reranker-4M)
- [Repositorio chinese-ime-lm](https://github.com/metasequoiaime/chinese-ime-lm)
- [Implementación de referencia en Rust](https://github.com/metasequoiaime/chinese-ime-lm/tree/main/reference)
- [Especificación del formato y forward pass](https://github.com/metasequoiaime/chinese-ime-lm/blob/main/docs/format.md)
- [Crate chinese-ime-lm en crates.io](https://crates.io/crates/chinese-ime-lm)
