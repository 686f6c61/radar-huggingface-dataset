# moebiusT7/gemma-4-12b-mobius-custom-c1

## Resumen

gemma-4-12b-mobius-custom-c1 es una publicación del usuario moebiusT7 que no modifica los pesos de un modelo existente, sino que los envuelve. El punto de partida es el GGUF oficial de Google `google/gemma-4-12B-it-qat-q4_0-gguf`, verificado por sha256 y sin cambios, al que se añaden tres capas finas de gobernanza: un «code floor» determinista basado en expresiones regulares, RCGov para la higiene del contexto recuperado y un prompt de entitlement de aproximadamente 480 tokens destilado por ablación de la doctrina MMV L0.

El problema que aborda es el del «derecho a responder»: el modelo decide por sí mismo si preguntar, verificar, reanclar, abstenerse o contestar, apoyándose en un suelo determinista que declina entradas vacías o de una lista corta de peticiones inseguras sin llegar a invocar al modelo. El autor publica que la calidad de gobernanza sobre los sondeos medidos es la misma que la del modelo base sin envolver, y que la aportación real de esta versión es de ingeniería: 7,6 segundos por llamada frente a 31,2 segundos del build anterior con transformers en la misma GPU.

El modelo tiene 11.907.350.576 parámetros y se distribuye como GGUF cuantizado en q4_0 mediante QAT, con un repositorio de 7,0 GB. Los idiomas declarados son inglés y japonés, y la licencia es la Gemma de Google. La model card está truncada en la información disponible, por lo que varios apartados técnicos quedan sin detallar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es `google/gemma-4-12B-it-qat-q4_0-gguf`; la model card no detalla la arquitectura interna) |
| Parámetros totales | 11.907.350.576 (~11,9 B) |
| Parámetros activos | no aplica (la información disponible no lo describe como MoE; sí existe una variante 26B-A4B separada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q4_0 (QAT de Google); formato GGUF |
| Idiomas soportados | inglés (en), japonés (ja) |
| Licencia | gemma |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base ni su proceso de entrenamiento: no se indican número de tokens, composición del dataset, ni si hubo RLHF o DPO. Lo que sí se especifica es el pipeline de cuantización: se parte del GGUF q4_0 generado por Google mediante *quantization-aware training* (QAT), que el autor declara sin modificar y verificado por sha256.

Sobre esos pesos se montan tres capas independientes del modelo, activas solo según cómo se despliegue. La primera es un «code floor» de dos expresiones regulares (entrada vacía y una lista corta de peticiones inseguras) que declina de forma determinista, sin llamar al modelo; el autor advierte explícitamente que no es un clasificador de seguridad y que solo se probó sobre los cuatro elementos inseguros del corpus enrutado. La segunda es RCGov, para la higiene del contexto recuperado, con comportamiento *fail-closed* ante error. La tercera es el prompt de entitlement «L0 Essentials compact v1.1», de unos 480 tokens, destilado por ablación de la doctrina MMV L0. Existe además un arnés de evaluación separado (`eval/loop/loop_probe.py`) que inyecta el mismo prompt pero no el wrapper, del que proceden las filas de multi-turno del bucle de herramientas.

## Capacidades

- Generación de texto conversacional de un solo turno y multi-turno, con soporte de bucle de herramientas medido mediante un arnés específico.
- Decisión explícita sobre el derecho a responder: preguntar, verificar, reanclar, abstenerse o contestar, según el prompt de entitlement.
- Declinación determinista de entradas vacías y de una lista corta de peticiones inseguras sin invocar al modelo (code floor).
- Higiene de contexto recuperado mediante RCGov, con *fail-closed* ante error; si RCGov no está instalado, el comportamiento se etiqueta como *pass-through*.
- Resistencia a premisas falsas: 0 fabricaciones en preguntas sobre un estándar, un evento, un archivo y un artículo inexistentes.
- Manejo de consultas de alto riesgo: 9/9 en el patrón «declinar la recomendación personal y aun así ofrecer información general».
- Respuestas directas sin sobrepreguntar: 60/60 en preguntas bien especificadas.
- Multilingüe limitado a inglés y japonés.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y uso conversacional.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno y, cuando el sistema recupera documentación, RCGov aplica higiene al contexto recuperado y falla en cerrado si algo va mal, evitando respuestas construidas sobre contexto contaminado.
- Asistentes que deben abstenerse en lugar de improvisar: en dominios donde una respuesta inventada es costosa, el prompt de entitlement permite que el propio modelo decida entre preguntar, verificar o abstenerse; el autor reporta 33/33 declinaciones deterministas en su corpus de aceptación enrutado.
- Puerta de entrada sin coste de inferencia: el code floor intercepta entradas vacías o de la lista corta de peticiones inseguras antes de llamar al modelo, lo que reduce latencia y consumo en servicios con mucho tráfico degenerado.
- Consultas de alto riesgo (salud, finanzas, asesoramiento personal): el patrón medido es declinar la recomendación individual y aun así aportar información general, con 9/9 en el sondeo del autor.
- Despliegue en estaciones de trabajo modestas: el autor lo posiciona como la opción para GPUs de 8 a 12 GB o para tarjetas compartidas con el escritorio, frente a la variante 26B-A4B que exige la tarjeta completa de 16 GB.
- Servicio local compatible con clientes existentes: al correr sobre `llama-server`, encaja con LM Studio, Ollama o cualquier cliente que hable el protocolo de llama.cpp, incluyendo su etiqueta de compatibilidad con endpoints.
- Investigación sobre alineación y reproducibilidad: la model card publica las predicciones escritas antes de medir, incluidas las 27 de 42 que resultaron erróneas, lo que la convierte en un artefacto útil para estudiar protocolos de evaluación de «derecho a responder».
- Integración en pipelines de automatización que necesiten un modelo local con contexto recuperado y criterios explícitos de abstención, evitando depender de APIs externas.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (3 semillas por sondeo; las filas están en `eval/`). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible.

| Sondeo | Modelo custom anterior | 12B QAT sin envolver | C1 (este modelo) |
|---|---|---|---|
| Base | bf16 → NF4 auto-cuantizado (bitsandbytes) | GGUF q4_0 QAT de Google | GGUF q4_0 QAT de Google |
| Runtime | transformers | llama.cpp | llama.cpp |
| Capa de entitlement | router heurístico (código) | ninguna | prompt compact v1.1 |
| Floor (vacío / inseguro) | código | — | código (mismas regexes) |
| Premisa falsa, 4 preguntas | 0/12 fabricadas | 0/12 | 0/12 |
| Chat de alto riesgo, 3 preguntas | 9/9 | 9/9 | 9/9 |
| Corpus enrutado (37): responder / preguntar / abstenerse | 63/63 · 15/15 · 33/33 | 63/63 · 15/15 · 32/33 | 63/63 · 15/15 · 33/33 |
| Preguntas bien especificadas (20) | 60/60 | 60/60 | 60/60 |
| Segundos por llamada (corpus enrutado) | 31,2 (54,9 cuando el modelo se ejecuta) | 10,3 | 7,6 |
| Segundos por llamada (chat de alto riesgo) | 40,6 | 15,0 | 13,1 |

El autor señala que la única diferencia medible en gobernanza entre el modelo sin envolver y esta versión es el caso de la entrada vacía: ante un prompt vacío, el modelo base inventa un problema de geometría y lo resuelve, y el code floor lo detiene. La mejora declarada es de latencia: 3–4× más rápido por llamada, y 7× frente al build anterior cuando este efectivamente ejecutaba el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 7,0 GB y contiene pesos q4_0; a esa cifra hay que sumar la caché KV, que depende del contexto configurado (no indicado).
- GPU recomendadas: no disponible. El autor sitúa este modelo en el rango de 8 a 12 GB de VRAM, o en una tarjeta compartida con el escritorio, en contraste con la variante 26B-A4B, que requiere aproximadamente 14,7 GB con `-c 32768` sobre una tarjeta de 16 GB.
- ¿Cabe en GPU de consumo? Sí, según el autor, en el rango de 8 a 12 GB.
- Opciones de despliegue: `llama-server` (con `run_server.sh` y `mobius_c1.py` para la configuración completa con floor, RCGov y prompt), LM Studio, Ollama, o cualquier aplicación que cargue GGUF sobre llama.cpp. La etiqueta `endpoints_compatible` indica compatibilidad con endpoints.
- Latencia: 7,6 s por llamada en el corpus enrutado y 13,1 s por llamada en el chat de alto riesgo, medidos por el autor. El modelo de GPU empleado no se especifica. No se publica throughput en tokens por segundo para esta variante (el dato de ~156 tok/s corresponde al 26B-A4B).
- Cuantizaciones adicionales: no se documentan más allá del q4_0 QAT con el que se distribuye.

## Comparativa con modelos similares

| Modelo | Parámetros | Runtime / formato | Capa de gobernanza | Licencia | Latencia declarada |
|---|---|---|---|---|---|
| gemma-4-12b-mobius-custom-c1 (este) | ~11,9 B | llama.cpp / GGUF q4_0 QAT | prompt compact v1.1 + code floor + RCGov | gemma | 7,6 s por llamada |
| gemma-4-12B-it-qat-q4_0-gguf (Google, sin envolver) | ~11,9 B | llama.cpp / GGUF q4_0 QAT | ninguna | gemma | 10,3 s por llamada |
| gemma-4-12b-mobius-custom (versión anterior del mismo autor) | ~11,9 B | transformers / safetensors, bf16 auto-cuantizado a NF4 | router heurístico en código + floor | gemma | 31,2 s por llamada (54,9 s cuando ejecuta el modelo) |
| gemma-4-26b-a4b-mobius-custom-c1 (mismo autor) | 26B con 4B activos (MoE) | llama.cpp / mismo wrapper | prompt, floor y RCGov idénticos | gemma | 5,0 s por llamada; ~156 tok/s de generación; calidad 7,89/8 en la suite de 8 tareas del autor |

No se dispone de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La capa de gobernanza no aporta mejora medible de calidad sobre el modelo base en los sondeos publicados: el autor lo reconoce de forma explícita. En 12B, el modelo sin envolver ya rechaza los prompts inseguros y admite las premisas falsas.
- El code floor son dos expresiones regulares (entrada vacía y una lista corta de peticiones inseguras). No es un clasificador de seguridad y solo se probó sobre los cuatro elementos inseguros del corpus enrutado; su cobertura fuera de ese conjunto es desconocida.
- Qué está activo depende de cómo se lance el modelo. Los pesos por sí solos no incorporan ninguna de las capas: si se carga el GGUF directamente en LM Studio, Ollama o un `llama-server` sin el prompt, solo aplican los valores comparativos del modelo base. RCGov se activa únicamente si está instalado y falla en cerrado ante error; si no está, el comportamiento se etiqueta como *pass-through*.
- Riesgo de alucinación: los pesos son los de un modelo cuantizado a q4_0, con la pérdida de precisión asociada a esa cuantización. Los sondeos de premisa falsa (0/12 fabricaciones) cubren cuatro preguntas concretas y no permiten extrapolar a otros dominios.
- Idiomas limitados a inglés y japonés; no hay soporte declarado de castellano.
- Licencia Gemma de Google: impone términos de uso y una política de usos prohibidos que deben revisarse antes de cualquier explotación comercial.
- La model card está truncada en la información disponible (corta en la frase «What this model changes is engineering»), y la sección anunciada sobre defectos encontrados por *dogfooding* no aparece completa; RCGov v1 se describe como enviado con una llamada que nunca se ejecutaba.
- Validación comunitaria muy baja: 68 descargas y 1 like en el momento de la consulta, con una única fuente de evaluación (el propio autor, 3 semillas por sondeo, sin revisión independiente).
- No hay datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K), de longitud de contexto soportada ni de arquitectura interna.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moebiusT7/gemma-4-12b-mobius-custom-c1
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf
- Versión anterior del mismo autor (transformers / vLLM): https://huggingface.co/moebiusT7/gemma-4-12b-mobius-custom
- Variante 26B-A4B con el mismo wrapper: https://huggingface.co/moebiusT7/gemma-4-26b-a4b-mobius-custom-c1
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces recuperados correspondían a páginas sin relación con el proyecto (sitio de un club de fútbol alemán), por lo que no se incluyen.
