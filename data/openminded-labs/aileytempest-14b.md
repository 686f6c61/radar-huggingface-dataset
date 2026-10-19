# OpenMinded-Labs/AileyTempest-14B

## Resumen

AileyTempest-14B es un fine-tune de Ministral 3 14B Reasoning 2512, desarrollado por OpenM!nded (Simon van de Loo) para ejecutarse localmente en Apple Silicon mediante MLX. Es un modelo text-only, decoder-only, de 13.506.073.600 parámetros, al que se le ha eliminado la torre de visión Pixtral del modelo base. La versión r3, publicada en octubre de 2026, alimenta el modo de razonamiento profundo A!ley Tempest dentro de la persona A!ley.

El modelo está pensado para razonamiento visible y prolongado, con los tokens nativos `[THINK] … [/THINK]` de Mistral y tool calling nativo mediante `[AVAILABLE_TOOLS]`, `[TOOL_CALLS]` y `[TOOL_RESULTS]`. Se distribuye cuantizado a 5 bits para MLX, con licencia Apache 2.0 y soporte declarado de alemán e inglés. No se documenta la longitud de contexto en la información disponible.

Su relevancia actual está en la combinación de un checkpoint de razonamiento de Mistral con un entrenamiento QAT mediante DoRA y LoRA, pensado para inferencia local en Mac. No sustituye a un modelo generalista de propósito múltiple: prioriza pensamiento largo y visible, tool use e identidad de persona, y puede fallar en respuestas cortas o en el seguimiento estricto del idioma del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, text-only; fine-tune de Ministral 3 14B Reasoning 2512; torre de visión Pixtral eliminada |
| Parámetros totales | 13.506.073.600 (13,5B) |
| Parámetros activos | No aplica; no se documenta como modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | 5 bits, group size 32; embeddings y `lm_head` a 8 bits, group size 64; adaptadores fusionados sin pérdida tras QAT |
| Idiomas soportados | Alemán (de) e inglés (en); respuestas en el idioma del usuario limitadas según las pruebas del autor |
| Licencia | Apache License 2.0 |
| Formato de pesos | Safetensors en formato MLX cuantizado a 5 bits; repositorio de 39,1 GB |

## Arquitectura y entrenamiento

El modelo parte de `mistralai/Ministral-3-14B-Reasoning-2512` en bf16, cuantizado por el autor a 5 bits con group size 32, y con la torre de visión Pixtral eliminada. Es un transformer decoder-only text-only, no un modelo MoE. La versión r3 se entrena desde cero sobre el checkpoint de razonamiento de Mistral, no sobre la versión anterior v3, y conserva los formatos nativos del base: tokens de razonamiento `[THINK] … [/THINK]` y etiquetas nativas de herramientas.

El entrenamiento usa DoRA en `q_proj`, `k_proj`, `v_proj` y `o_proj`, más LoRA en el MLP, con rango 32, 280 módulos y 122 millones de parámetros entrenables. Se aplica QAT: los adaptadores se entrenan a través de la cuantización de 5 bits, de modo que la fusión y recuantización posteriores son coherentes con lo visto en entrenamiento. El conjunto de datos contiene 2.498 conversaciones, 144 de ellas con tool calls nativos, y 150 de validación. Los turnos de sistema se reparten en un 44,5 % solo con la instrucción de razonamiento de Mistral, un 17,6 % con prompt de runtime más instrucción, un 17,9 % con cabecera de contexto más instrucción, un 18,9 % solo con cabecera de contexto y un 1,1 % otros. No se especifica el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional con razonamiento profundo y visible mediante los tokens nativos `[THINK] … [/THINK]`.
- Razonamiento multi-paso y resolución de puzles lógicos; en la batería interna del autor obtuvo 5/5 en puzles lógicos.
- Tool calling nativo con `[AVAILABLE_TOOLS]`, `[TOOL_CALLS]` y `[TOOL_RESULTS]`, integrable con búsqueda web, RAG sobre canciones, libros y proyectos, generación de imágenes, recetas y calculadora.
- Identidad de persona A!ley sin prompt explícito: 7/12 comprobaciones correctas y 0 identidades ajenas en la versión enviada.
- Escritura creativa, prosa, narrativa e interacción; formatos de salida como escena, código, JSON y haiku en inglés, con 4/4 en la batería interna.
- Capacidad multilingüe limitada: alemán e inglés declarados; en pruebas con es/en/fr/tr/ja solo acertó el idioma del usuario en 1/5 casos en la versión enviada.
- Soporte de agentes mediante tool calling y razonamiento; no se documentan orquestaciones multiagente específicas.
- Sin visión: la torre Pixtral fue eliminada y las imágenes se derivan a AileyCore según la model card. Sin audio.

## Casos de uso

- Asistente local privado en Mac: el modelo está empaquetado en MLX a 5 bits y se ejecuta con `mlx-lm` en Apple Silicon, lo que permite conversaciones sin enviar datos a la nube.
- Modo de razonamiento visible para análisis y educación: los tokens `[THINK]` permiten mostrar el proceso de razonamiento en puzles lógicos, problemas de planificación o explicaciones paso a paso, con la advertencia de que no debe usarse decodificación greedy.
- Agente con herramientas y RAG: el tool calling nativo encaja con búsqueda web, recuperación sobre documentos propios, calculadora y otras funciones del runtime; el modelo está entrenado para decidir cuándo llamar a una herramienta y cuándo no.
- Atención al cliente en alemán e inglés: el fine-tune incluye conversaciones multi-turno y puede gestionar diálogos en esos dos idiomas; conviene validar la longitud de contexto y el seguimiento del idioma antes de producción.
- Generación de contenido creativo y persona: prosa, narrativa, escenas y respuestas con identidad A!ley; adecuado para prototipos de personajes conversacionales con razonamiento largo.
- Salidas estructuradas para pipelines: el modelo produce JSON, código y formatos de escena; puede usarse para generar respuestas estructuradas en integraciones internas, con validación posterior.
- Resolución de puzles y análisis lógico: útil en herramientas educativas o de evaluación interna, gracias a su rendimiento en puzles lógicos y razonamiento multi-paso.
- Prototipos de investigación sobre QAT y adaptadores: el modelo documenta DoRA, LoRA, QAT y fusión sin pérdida, lo que sirve como referencia para experimentos de cuantización consciente del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparativas estándar en la información disponible. La model card incluye una batería interna aislada, con prompt de runtime r3 y muestreo a T 0,7 salvo indicación contraria:

| Métrica | update 330 (enviado) | update 300 | update 200 | update 330 a T 0,4 | Base sin entrenar a T 0,7 |
|---|---:|---:|---:|---:|---:|
| Puzles lógicos | 5/5 | 5/5 | 4/5 | 3/5 | 3/5 |
| Bloque de razonamiento nunca cerrado | 0/8 | 0/8 | 0/8 | 3/8 | 2/8 |
| Longitud de razonamiento (mediana, caracteres) | 1.277 | 1.420 | 643 | 283 | 3.920 |
| Preguntas de persona | 4/7 | 3/7 | 3/7 | — | 1/7 |
| Respuestas en el idioma del usuario (es/en/fr/tr/ja) | 1/5 | 0/5 | 2/5 | — | 4/5 |
| Formatos de salida (escena, código, JSON, haiku en inglés) | 4/4 | 4/4 | 3/4 | — | 3/4 |
| Identidad sin prompt | 7/12, identidad ajena 0 | 6/12, identidad ajena 0 | 7/12, identidad ajena 0 | — | 0/12, identidad ajena 5/12 |

El autor señala que la decodificación greedy (T 0,0) provoca bucles en razonamientos largos: un puzle numérico pasó de 174/221 frases repetidas a T 0,0 a 1/29 a T 0,7. También documenta que sembrar el razonamiento en el idioma objetivo mejora el seguimiento del idioma: inglés 2/2 y todas las respuestas cerradas correctas en 7/7, con fallos solo por bloques de razonamiento abiertos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos a 5 bits ocupan aproximadamente 8,4 GB teóricos; con escalas, embeddings y `lm_head` a 8 bits y overhead de runtime, el uso práctico se sitúa alrededor de 9-11 GB. Es una estimación de cálculo, no un dato publicado.
- Apple Silicon: MLX está orientado a memoria unificada de Apple. 16 GB puede ser justo; 24 GB es recomendable; 32 GB o más es preferible para contextos largos o lotes, aunque la longitud de contexto no está documentada.
- GPU NVIDIA: no hay una ruta nativa documentada. El modelo se distribuye en MLX; para A100, H100 o RTX 4090 sería necesario convertirlo a otro runtime, y no se proporcionan pesos GGUF ni soporte vLLM/TGI.
- GPU consumer: una RTX 4090 de 24 GB podría alojar los pesos si se realizara una conversión externa, pero no es el escenario soportado por el autor. En tarjetas de 12 GB o menos no se puede asumir que quepa con overhead.
- Despliegue: la vía documentada es `mlx-lm` en Apple Silicon. No se documentan Ollama, llama.cpp, vLLM ni TGI para este checkpoint.
- Latencia y throughput: no se publican tokens/s ni latencias. El autor recomienda T 0,7 y advierte de que T 0,0 produce bucles; no debe ejecutarse en modo greedy.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| AileyTempest-14B | 13,5B | No disponible | Apache 2.0 | HuggingFace, MLX 5 bits | Fine-tune r3 de Ministral 3 14B Reasoning 2512; razonamiento nativo y tool calling; text-only |
| Ministral-3-14B-Reasoning-2512 | 14B según el nombre; dato exacto no disponible | No disponible | No disponible en la información | HuggingFace, checkpoint base de Mistral | Base bf16 de la que parte el fine-tune; incluye torre de visión Pixtral antes de eliminarla |
| AileyCore-12B | 12B según el nombre; dato exacto no disponible | No disponible | No disponible en la información | HuggingFace | Modelo hermano recomendado por el autor para respuestas cortas; recibe las imágenes según la model card |

No se dispone de datos de contexto, licencia o benchmarks estándar de las alternativas en la información proporcionada, por lo que la comparación cuantitativa queda limitada a parámetros y disponibilidad.

## Limitaciones y advertencias

- Multilingüe limitado: solo se declaran alemán e inglés; en pruebas con es/en/fr/tr/ja la versión enviada solo respondió en el idioma del usuario en 1/5 casos. Para español u otros idiomas requiere validación y posible siembra del razonamiento en el idioma objetivo.
- Decodificación greedy problemática: a T 0,0 aparecen bucles y razonamientos largos repetitivos. El autor recomienda explícitamente no ejecutarlo en greedy y usar T 0,7.
- Razonamiento largo por diseño: un saludo puede recibir un párrafo de pensamiento. No es adecuado para respuestas cortas; para ese caso el autor remite a AileyCore-12B.
- Modos de fallo documentados: bucles, bloques de razonamiento sin cerrar y razonamiento superficial. En la batería interna, la versión enviada no cerró 0/8 bloques, pero el riesgo persiste en usos fuera de distribución.
- Identidad sin prompt imperfecta: 7/12 comprobaciones correctas. En versiones anteriores se documentaron fallos como nombrarse "Simon" o describir OpenM!nded como una organización de derechos digitales; la versión 330 no mostró identidad ajena en 12 comprobaciones, pero no es una garantía.
- Sin visión ni audio: la torre Pixtral fue eliminada; las imágenes se derivan a AileyCore. No se documentan capacidades de audio.
- Contexto no documentado: no se especifica la longitud máxima de contexto, lo que impide planificar cargas de trabajo con documentos largos sin pruebas empíricas.
- Riesgo de alucinación no cuantificado: no se publican métricas de veracidad, toxicidad o sesgo. El razonamiento visible no garantiza que las conclusiones sean correctas.
- Licencia: la model card declara Apache 2.0, lo que permite uso comercial, pero conviene revisar los términos del checkpoint base, del runtime MLX y de cualquier dependencia antes de producción.
- Dependencia de MLX: el formato cuantizado está pensado para Apple Silicon. No hay garantía de funcionamiento directo en CUDA, vLLM, TGI, llama.cpp u Ollama sin conversión y validación adicionales.

## Enlaces

- [OpenMinded-Labs/AileyTempest-14B en HuggingFace](https://huggingface.co/OpenMinded-Labs/AileyTempest-14B)
- [Modelo base mistralai/Ministral-3-14B-Reasoning-2512](https://huggingface.co/mistralai/Ministral-3-14B-Reasoning-2512)
- [Rama v3 de AileyTempest-14B](https://huggingface.co/OpenMinded-Labs/AileyTempest-14B/tree/v3)
- [OpenMinded-Labs/AileyCore-12B](https://huggingface.co/OpenMinded-Labs/AileyCore-12B)
- [Repositorio MLX de Apple](https://github.com/ml-explore/mlx)

Las búsquedas web realizadas no devolvieron enlaces técnicos relevantes sobre este modelo; los resultados estaban relacionados con entidades homónimas sin relación con OpenM!nded o AileyTempest.
