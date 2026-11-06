# Luigi/feng-30m-zh-tw

## Resumen

feng-30m-zh-tw es una variante en chino tradicional nativo (zh-TW) del modelo feng-30m, un LLM conversacional de 29,43 millones de parámetros con arquitectura estilo Qwen3 y vocabulario de 16.384 tokens. Lo publica el usuario Luigi en Hugging Face bajo licencia Apache 2.0. El modelo padre (jiaheng0815/feng-30m) está entrenado en chino simplificado (zh-CN); esta variante lee y escribe chino tradicional de forma nativa sin reentrenamiento.

La innovación técnica es que la conversión no usa fine-tuning ni adaptadores: es una transformación determinista en el espacio de pesos de un único tensor, `model.embed_tokens.weight` (el embedding y unembedding atados). Los otros 122 tensores son idénticos bit a bit al padre, y el tamaño de fichero, las formas y los dtypes no cambian. Se editaron 6.945 de las 16.384 filas del vocabulario (3,4 millones de escalares), sin añadir ni eliminar ids.

Es relevante para quienes necesitan un modelo minúsculo que opere en chino tradicional en dispositivos de borde (edge), con compatibilidad con motores GGUF/C y ESP32 heredada del padre. El coste es que deja de ser un buen modelo en chino simplificado: la perplejidad en zh-CN sube de 220,32 a 769,02, lo que es intencionado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer estilo Qwen3 (embedding/unembedding atados) |
| Parámetros totales | 29.429.184 (29,43 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo incluye safetensors; el autor indica que la exportación `esp32/` del padre no se copia y debe reexportarse desde `model.safetensors`) |
| Idiomas soportados | zh (chino tradicional, zh-TW nativo); el chino simplificado queda degradado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Vocabulario | 16.384 tokens (sin cambios respecto al padre) |
| Tensores modificados | 1 de 123 (`model.embed_tokens.weight`) |
| Filas editadas | 6.945 de 16.384 (3,4 M escalares) |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del padre feng-30m: un transformer denso de 29,43 M de parámetros con vocabulario de 16.384 tokens y embedding/unembedding atados, compatible con motores GGUF, C y ESP32. No hay datos públicos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La conversión a chino tradicional se realiza en tres etapas guiadas por datos de glifos Unihan y un corpus zh-TW de referencia de unos 130.000 caracteres, disjunto del conjunto de evaluación. En la etapa de palabras, para cada token simplificado `w` con grafía tradicional `c`: si `c` ya es token y el coseno entre ambos es ≥ 0,78, se intercambian las cadenas y se sirve `c` con la fila entrenada de `w`; si la puerta geométrica lo bloquea, se transfiere el 20 % de la dirección de `w` a la fila infrentrenada de `k`; y si `c` no tiene token, se renombra `w` a `c` solo cuando el corpus atestigua esa grafía y la norma del embedding es ≥ 1,05. En la etapa de caracteres, una fila de glifo tradicional toma el 40 % de la dirección de su gemelo simplificado (coseno ≥ 0,70), omitiendo glifos que el corpus zh-TW no usa. En la etapa de rebalanceo softmax, los ids que pueden emitir un glifo exclusivamente simplificado bajan a 0,32 de su fila; los que emiten un glifo genuinamente tradicional se escalan a 1,10 si son del padre y se reducen a 0,70 si son renombrados por esta transformación. Las decisiones aceptadas fueron 671 intercambios de palabras, 2.275 renombrados, 1.207 fugas de palabras y 441 gemelos de caracteres.

## Capacidades

- Generación de texto conversacional en chino tradicional nativo, con formato de chat por roles (`user`/`assistant`).
- Salida sin glifos exclusivamente simplificados (verificación conductual sobre completaciones muestreadas).
- Compatibilidad con el motor de inferencia del padre, incluida la exportación a GGUF, C y ESP32 (previa reexportación desde `model.safetensors`).
- Embedding y unembedding atados, requisito del motor on-device del padre.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Multilingüe limitado: el rendimiento en inglés se mantiene prácticamente igual al padre (perplejidad 43,60 → 42,81), pero el modelo está orientado a zh-TW.

## Casos de uso

- Asistente conversacional en dispositivos de borde: el modelo cabe en 0,1 GB de repo y mantiene la compatibilidad con motores C/ESP32 del padre, por lo que puede desplegarse en microcontroladores o hardware embebido para respuestas en chino tradicional sin conexión.
- Chat de atención al cliente en zh-TW: al generar texto sin glifos simplificados, evita respuestas con caracteres mezclados que resultan extraños para usuarios de Taiwán, Hong Kong o Macao.
- Sustitución del padre en aplicaciones ya desplegadas en chino tradicional: al conservar arquitectura, vocabulario y formas de tensor, puede reemplazar a feng-30m sin cambiar el pipeline de inferencia.
- Prototipado rápido de LLM en local: con 29,43 M de parámetros y pesos safetensors, se carga con `transformers` en CPU y permite validar prompts y flujos conversacionales antes de escalar a modelos mayores.
- Generación de texto de bajo coste en dominios de ciencia e historia: la perplejidad baja de 327,29 a 268,01 en el dominio val6 (ciencia/historia) y de 217,43 a 184,56 en val7 (ciencia/medicina), lo que lo hace adecuado para completar o resumir textos técnicos breves en zh-TW.
- Investigación sobre transformaciones en el espacio de pesos: el script `transform/build_tw.py` regenera todos los ficheros desde el checkpoint padre y `transform/eval_ppl.py` reproduce las tablas de perplejidad, lo que sirve como caso de estudio reproducible de adaptación lingüística sin fine-tuning.
- Filtrado o normalización de texto zh-TW: el corpus de atestación y las reglas de glifos pueden reutilizarse para tareas de conversión simplificado-tradicional con control de calidad.

## Benchmarks y rendimiento

Perplejidad sobre siete dominios zh-TW reservados (cada segmento de 1.024 tokens; los dominios 3-7 son artículos de Wikipedia frescos, verificados disjuntos por 12-gramas):

| Dominio | Padre | feng-30m-zh-tw | Δ |
|---|---|---|---|
| eval1 · Wikipedia | 202,27 | 169,00 | −16,4 % |
| eval2 · Wikipedia (otro dominio) | 313,33 | 212,74 | −32,1 % |
| val3 · artículos frescos | 232,19 | 165,69 | −28,6 % |
| val4 · geografía / deporte | 331,27 | 296,84 | −10,4 % |
| val5 · cultura / comida | 140,65 | 138,22 | −1,7 % |
| val6 · ciencia / historia | 327,29 | 268,01 | −18,1 % |
| val7 · ciencia / medicina | 217,43 | 184,56 | −15,1 % |
| Media CE, seis dominios de ajuste (nats) | 5,508 | 5,302 | −3,7 % |

Controles:

| Control | Padre | feng-30m-zh-tw | Lectura |
|---|---|---|---|
| Texto zh-CN simplificado | 220,32 | 769,02 | deliberadamente mucho peor |
| Texto en inglés | 43,60 | 42,81 | prácticamente sin cambios |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 29,43 M de parámetros en fp32 los pesos ocupan aproximadamente 118 MB, y en fp16 unos 59 MB, más el estado del tokenizador y el KV cache.
- GPU recomendadas: cualquier GPU consumer moderna puede ejecutarlo; no se requieren A100 ni H100. Cabe en CPU y en hardware embebido.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente, y también en CPU.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True`), y motores compatibles con el padre (GGUF, C, ESP32) previa reexportación desde `model.safetensors`. No se documentan vLLM, llama.cpp, Ollama ni TGI de forma explícita.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| feng-30m-zh-tw | 29,43 M | no disponible | zh-TW nativo | Apache 2.0 | safetensors | Variante por transformación de pesos |
| feng-30m (padre) | 29,43 M | no disponible | zh-CN | Apache 2.0 | safetensors | Modelo base; mejor en simplificado |
| Qwen3 (familia) | no disponible | no disponible | multilingüe | no disponible | no disponible | Referencia arquitectónica citada por el autor |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables de 30 M de parámetros en chino tradicional en la información proporcionada.

## Limitaciones y advertencias

- Ya no es un buen modelo en chino simplificado: la perplejidad zh-CN sube de 220,32 a 769,02. Para simplificado debe usarse el padre.
- La exportación `esp32/` del padre no se copia intencionadamente, porque es una cuantización del embedding del padre y queda obsoleta para este modelo; hay que reexportarla desde `model.safetensors`.
- Las ganancias dependen del dominio: en cultura/comida (val5) la mejora es solo del 1,7 %, porque la transferencia de caracteres que hace nativa la ortografía cuesta algo de fluidez en ese dominio.
- El vocabulario y las fusiones del tokenizador son los del padre; aproximadamente el 21 % de las reglas de fusión quedan fuera del conjunto alcanzable tras el renombrado, y la extensión de vocabulario se midió (texto truncado en la model card).
- Riesgo de alucinación inherente a un modelo de 29,43 M de parámetros; no se documentan evaluaciones de veracidad.
- Sesgos: no documentados en la información disponible.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para pipelines que las requieran.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantías ni condiciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luigi/feng-30m-zh-tw
- Modelo padre: https://huggingface.co/jiaheng0815/feng-30m
- Resultados de búsqueda web: no relevantes (corresponden a la franquicia de videojuegos Super Mario, sin relación con el modelo).
