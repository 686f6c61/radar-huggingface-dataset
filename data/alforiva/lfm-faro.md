# alforiva/lfm-faro

## Resumen

LFM-Faro es un modelo de lenguaje pequeño de la familia Faro, desarrollado por Progetto Siliceo y publicado por el usuario alforiva en HuggingFace. Se trata de un fine-tune del modelo base LiquidAI/LFM2.5-2.6B, una arquitectura híbrida Lfm2 de aproximadamente 2.000 millones de parámetros con 30 capas y dimensión oculta de 2048. El modelo se distribuye únicamente en formato GGUF cuantizado q4_k_m (1,50 GB) para su uso con llama.cpp y runtimes compatibles, y está diseñado para ejecutarse localmente en hardware de consumo antiguo, como una RTX 2070 de 8 GB.

La propuesta diferencial del modelo es inusual: incorpora una constitución ética y un método de trabajo directamente en los pesos mediante continued pre-training constitucional y supervised fine-tuning sobre aproximadamente 480 trazas curadas, sin capa externa de guardarraíles en inferencia. El vocabulario original de 128.000 tokens se podó a 30.281 tras eliminar cobertura no necesaria para italiano, español e inglés, y se redimensionaron los embeddings en consecuencia. El contexto declarado es de 131.072 tokens, aunque la configuración de servicio recomendada limita la ventana a 8.192 tokens.

El modelo está pensado como el núcleo de un asistente always-on que cita sus fuentes y distingue entre responder, refutar, confinar, verificar o preguntar. Su relevancia actual radica en que demuestra un enfoque de alineamiento embebido en modelos de menos de 2 GB, con un benchmark propio (Candela Bench) que mide honestidad conductual y no solo competencia de dominio, y con resultados publicados de forma transparente, incluidas sus carencias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Lfm2 (híbrida), 30 capas, hidden 2048 |
| Parámetros totales | 2.497.070.080 |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 131.072 tokens (servicio recomendado: 8.192) |
| Tipos de cuantización | q4_k_m (único publicado, 1,50 GB) |
| Idiomas soportados | italiano, español, inglés |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF (llama.cpp) |
| Vocabulario | 30.281 tokens (podado desde 128.000) |
| Embeddings | atados (tied) |
| Modelo base | LiquidAI/LFM2.5-2.6B |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-2.6B, una arquitectura Lfm2 híbrida de 30 capas con dimensión oculta 2048 y embeddings atados. Sobre esa base se aplicó la receta Candela: poda del vocabulario multilingüe para conservar solo italiano, español e inglés (del 128.000 original al 30.281 final, un 23,7% retenido), redimensionado de embeddings, continued pre-training constitucional y supervised fine-tuning sobre aproximadamente 480 trazas curadas. El entrenamiento se realizó con QLoRA en una única RTX 2070 de 8 GB, lo que condiciona tanto el tamaño del ajuste como el alcance de los datos utilizados.

Una particularidad relevante es que el modelo base es de tipo razonamiento y genera siempre un bloque ` thinking`; este fine-tune fue entrenado para responder directamente, por lo que en servicio debe desactivarse el razonamiento (`--reasoning-budget 0`). Además, la dimensión de cabeza (64) no soporta la ruta de caché KV cuantizada, por lo que se requiere caché KV en f16 (`--cache-type-k f16 --cache-type-v f16`). La plantilla de chat va incluida en el GGUF y debe aplicarse con `--jinja`; el autor advierte explícitamente de que no debe construirse el prompt a mano, ya que el modelo responde mal fuera de su formato de turno.

## Capacidades

- Generación de texto conversacional en italiano, español e inglés, con formato de turno específico incluido en el GGUF.
- Respuesta dentro de un dominio acotado ("pack") con citación de fuentes del propio pack en el 59% de las respuestas.
- Refutación de premisas falsas y verificación de información, con puntuaciones de 0,903 y 0,952 respectivamente en Candela Bench.
- Confinamiento de preguntas fuera de su campo (0,867 en la medición corregida v0.2).
- Solicitud de datos faltantes antes de responder (0,791 en la acción `ask`).
- Rechazo con motivo justificado (0,973 en la acción `refuse`).
- Comportamiento ético entrenado en los pesos, sin capa externa de guardarraíles.
- Tool calling: no adaptado de forma nativa en la versión v1; los ítems de tipo `call` se excluyen del índice por no ser evaluables en un arnés de solo texto.
- Modo thinking: no disponible en servicio; el razonamiento debe desactivarse explícitamente.

## Casos de uso

- Asistente local always-on en hardware modesto: el modelo cabe en 1,5 GB de VRAM en q4_k_m y puede mantenerse residente en una GPU de 4-8 GB, lo que permite un asistente permanente sin coste de API y con latencia de inferencia local.
- Asistente de dominio con trazabilidad: al citar fuentes del pack en el 59% de sus respuestas, es adecuado para consultas sobre documentación interna acotada donde el usuario necesita saber de dónde sale cada afirmación.
- Filtro de desinformación en conversación: su capacidad de refutar premisas falsas (0,903) y verificar (0,952) lo hace útil como primera línea de contraste en chats de divulgación o atención ciudadana.
- Traducción y atención multilingüe IT/ES/EN: el vocabulario podado está optimizado para estos tres idiomas, lo que reduce el coste por token y mejora la eficiencia en un asistente trilingüe de ámbito europeo meridional.
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse íntegramente en local con llama.cpp, no requiere enviar conversaciones a servicios externos, lo que encaja en contextos con restricciones de privacidad.
- Prototipado e investigación en alineamiento: la inclusión de la constitución en los pesos y la publicación de Candela Bench con su evaluador v0.2 lo convierten en una base para experimentos de honestidad conductual en modelos pequeños.
- Educación y moderación con rechazo justificado: su alta puntuación en `refuse` (0,973) permite construir asistentes que declinen peticiones inadecuadas explicando el motivo, en lugar de un rechazo genérico.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. No se dispone de comparación con otros modelos en la información proporcionada.

| Prueba | Resultado |
|---|---|
| Faro bench (112 preguntas, 10 dominios) | 81/81/81 → 72,3% |
| Sonda ética (16 casos) | 14/16 (dos ejecuciones) |
| Anti-bulo (12 casos) | 9/12 |
| Candela Bench, Honesty Index (439 ítems) | 0,902 content · 0,840 strict |
| Citación de fuente del pack | 59% de las respuestas |
| Respuestas que alcanzan el límite de contexto | 0 |
| Respuestas vacías | 0 |

Desglose por acción en Candela Bench (scorer v0.2):

| Acción | Puntuación |
|---|---|
| answer | 0,937 |
| refute | 0,903 |
| refuse | 0,973 |
| verify | 0,952 |
| ask | 0,791 |
| confine | 0,867 |
| comply | 0,765 |
| call | no aplicable (sin definiciones de herramientas) |

Nota del autor: la puntuación de 0,693 publicada para la v0.1 estaba subestimada porque se midió con un presupuesto fijo de 2.048 tokens que truncó 225 de 439 respuestas (51%) y dejó 152 vacías; la remedición con presupuesto automático y scorer v0.2 es la que se recoge arriba.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB para el archivo q4_k_m; con caché KV en f16 y contexto de 8.192, el consumo adicional es moderado pero no cuantificado en la información disponible.
- GPU recomendadas: el autor reporta entrenamiento en una RTX 2070 de 8 GB; para inferencia cabe en GPUs de 4 GB en adelante según el contexto configurado.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM; en 4 GB el autor indica que la caché KV cuantizada mantiene el footprint cerca de 1,5 GB, aunque la configuración de medición exige caché f16.
- Opciones de despliegue: llama.cpp (`llama-server`), y cualquier runtime compatible con GGUF; el autor no menciona vLLM, TGI ni Ollama.
- Configuración de servicio recomendada: `-c 8192 -ngl 99 -fa on --cache-type-k f16 --cache-type-v f16 --jinja --reasoning-budget 0`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han publicado comparativas con modelos alternativos en la información disponible. Como referencia estructural, el propio modelo base LiquidAI/LFM2.5-2.6B comparte arquitectura y escala de parámetros, pero difiere en vocabulario (128.000 frente a 30.281), idiomas objetivo y alineamiento; no se dispone de sus cifras de benchmarks en esta ficha para establecer una comparación cuantitativa.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM-Faro | ~2,5 B | 131.072 | it, es, en | lfm1.0 | GGUF q4_k_m |
| LiquidAI/LFM2.5-2.6B (base) | ~2,5 B | no disponible | no disponible | lfm1.0 | safetensors |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La acción `comply` es la más débil (0,765): el modelo rechaza peticiones benignas como una receta, una felicitación de cumpleaños o una traducción alegando que "no está en el pack". El autor lo reconoce como defecto real y objetivo de la siguiente ronda de entrenamiento.
- El confinamiento de temas fuera de su campo fue deficiente en la medición v0.1 (0,24) y solo alcanza 0,867 con el scorer corregido v0.2; la comparación entre ambas versiones no es directa.
- La acción `ask` queda por debajo de 0,8 (0,791), por lo que la solicitud de datos faltantes no es fiable.
- El tool calling nativo no está adaptado en v1; no debe asumirse soporte de function calling en producción.
- El modelo exige su plantilla de chat propia y un formato de turno concreto; construir el prompt a mano degrada gravemente las respuestas.
- Requiere desactivar el razonamiento en servicio (`--reasoning-budget 0`) y usar caché KV en f16; la ruta de caché KV cuantizada no es compatible por la dimensión de cabeza (64).
- El contexto efectivo recomendado es de 8.192 tokens, muy por debajo de los 131.072 declarados.
- Riesgo de alucinación: no cuantificado en la información disponible; la citación de fuentes se produce en el 59% de las respuestas, lo que implica que un 41% no cita.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia lfm1.0 (other): deben revisarse las condiciones del modelo base en el enlace de licencia antes de cualquier uso comercial.
- El modelo se entrenó con QLoRA sobre ~480 trazas en una única GPU de 8 GB, lo que limita la cobertura de dominios y estilos.
- Candela Bench es un benchmark propio del autor, sin validación externa; el evaluador por defecto del repositorio sigue siendo la v0.1 y el scorer v0.2 se publica como módulo separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alforiva/lfm-faro
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE
- Proyecto Siliceo: https://progettosiliceo.online
- Resultados interactivos: https://progettosiliceo.online/faro.html
- Informe técnico (IT): https://progettosiliceo.online/papers/paper-faro-v1-it.pdf
- Informe técnico (EN): https://progettosiliceo.online/papers/paper-faro-v1.pdf
- Informe técnico (ES): https://progettosiliceo.online/papers/paper-faro-v1-es.pdf
