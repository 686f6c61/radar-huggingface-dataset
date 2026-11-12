# OpenLLM-France/Luciole-23B-Base

## Resumen

Luciole-23B-Base es un modelo de lenguaje causal preentrenado con 23.216.467.968 parámetros (aproximadamente 23,2 mil millones), desarrollado por LINAGORA y el consorcio OpenLLM-France en el marco del proyecto OpenLLM France, financiado por BPI France a través del programa France 2030. Se entrenó en el supercomputador Jean Zay de GENCI, gestionado por IDRIS. Su etiqueta en Hugging Face lo clasifica como `nemotron`, lo que sugiere que su arquitectura deriva de la familia Nemotron de NVIDIA.

El modelo se ha entrenado con aproximadamente 4,9 billones de tokens (4.907.671.224.320) de datos multilingües, con un contexto de 131.072 tokens y 1.170.080 pasos de entrenamiento. Su rasgo diferencial es el fuerte peso del francés (30,4% del corpus) junto al inglés (41,9%), además de una presencia significativa de lenguas regionales francesas y criollos, lo que lo convierte en una base poco habitual para el desarrollo de modelos francófonos de gran tamaño con licencia Apache 2.0.

Es relevante ahora porque es un modelo base (no instruido ni alineado) pensado como primera pieza de una cadena de entrenamiento posterior: ajuste por instrucciones, ajuste fino en tareas concretas y alineación con preferencias humanas. Su licencia permisiva y su contexto largo lo hacen atractivo para equipos que necesiten partir de una base multilingüe propia en lugar de depender de modelos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Nemotron, segun tag `nemotron`); detalles completos no disponibles |
| Parametros totales | 23.216.467.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | no disponible de forma oficial; la model card menciona `load_in_4bit` como opcion de inferencia eficiente |
| Idiomas soportados | fr, en, it, de, es, pt, nl, ar (mas lenguas regionales francesas y criollos en el corpus) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Luciole-23B-Base es un modelo de lenguaje causal autorregresivo de tipo transformer, etiquetado en Hugging Face dentro de la familia `nemotron`. La model card no detalla el número de capas, dimensión oculta, número de cabezas de atención ni si emplea innovaciones como atención lineal o decodificación especulativa; esos datos figuran en un informe técnico aún no publicado ("coming soon"). El entrenamiento se realizó en el supercomputador Jean Zay (GENCI/IDRIS) durante 1.170.080 pasos, con un total de 4,9 billones de tokens y una ventana de contexto de 131.072 tokens.

La composición del corpus es explícita: inglés (41,9%), francés (30,4%), alemán (3,8%), español (3,5%), italiano (1,9%), portugués (1,3%), neerlandés (1,0%), árabe (0,5%), lenguas regionales francesas, variantes del francés y criollos (0,4%), datos paralelos de una selección de idiomas (1,7%), lenguajes de programación (9,2%) y datos matemáticos en inglés (3,5%). Las lenguas regionales provienen de FineWeb 2 e incluyen euskera, bretón, catalán, corso, franco-provenzal, criollo guadalupeño, criollo guyanés, occitano, picardo, criollo reunionés, criollo santaluciano, criollo seychelense, tahitiano y valón. No se menciona en la información disponible el uso de RLHF, DPO ni ajuste por instrucciones; se trata de un preentrenamiento puro de predicción del siguiente token.

## Capacidades

- Generación de texto autoregresiva y completado de secuencias en ocho idiomas principales (fr, en, it, de, es, pt, nl, ar).
- Modelado de lenguaje multilingüe con especial énfasis en francés e inglés.
- Manejo de contextos largos de hasta 131.072 tokens, adecuado para documentos extensos y tareas de recuperación en contexto.
- Cobertura de lenguas regionales francesas y criollos (bretón, occitano, catalán, corso, valón, criollos, etc.), poco frecuente en modelos de este tamaño.
- Capacidad básica de código (9,2% del corpus son lenguajes de programación), aunque el autor advierte que no está optimizado para generación de código.
- Capacidad básica de razonamiento matemático (3,5% de datos matemáticos en inglés).
- No incluye tool calling, function calling, modo pensamiento, visión, audio ni comportamiento de agente de forma nativa: es un modelo base sin ajuste por instrucciones.
- No dispone de alineación con preferencias humanas; el autor recomienda aplicar DPO/RLHF antes de usarlo en producción.

## Casos de uso

- Ajuste fino para asistentes francófonos: partir de Luciole-23B-Base y aplicar SFT sobre instrucciones en francés para construir un chatbot o asistente interno con dominio del registro y las variantes del francés, aprovechando que el 30,4% del corpus es francés.
- Modelo base para investigación en multilingüismo: estudiar transferencia entre lenguas, evaluar el comportamiento en lenguas de bajos recursos (neerlandés, árabe, criollos) o analizar sesgos en corpus históricos de dominio público.
- Procesamiento de documentos largos: con 131.072 tokens de contexto, permite resumir, extraer información o clasificar contratos, informes y expedientes extensos sin trocear en exceso, previo ajuste fino en la tarea.
- Desarrollo de modelos especializados en lenguas regionales: ajustar sobre bretón, occitano, catalán, corso o valón para preservación lingüística y herramientas educativas, ya que el corpus incluye estas variedades.
- Base para modelos de código en francés: aunque no está optimizado para código, el 9,2% de datos de programación permite un ajuste fino posterior para autocompletado o explicación de código con documentación en francés.
- Generación aumentada por recuperación (RAG) multilingüe: usar el modelo como generador en pipelines RAG sobre bases documentales en varios idiomas, con ajuste fino previo para seguir instrucciones y citar fuentes.
- Traducción y datos paralelos: el 1,7% del corpus son datos paralelos, lo que sirve de punto de partida para ajustar traductores automáticos entre francés, inglés y las demás lenguas cubiertas.
- Investigación sobre alineación: emplearlo como caso de estudio para aplicar DPO o RLHF sobre un modelo base europeo con licencia permisiva y comparar con bases anglófonas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una sección de evaluación y convergencia del entrenamiento (pérdida de entrenamiento y evaluación) cuyo contenido no se ha proporcionado, y anuncia un informe técnico "coming soon".

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 46 GB solo para los pesos (23,2 mil millones de parámetros × 2 bytes), más memoria para caché KV; se recomienda un mínimo de 48-80 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: aproximadamente 23-25 GB de pesos, más caché KV; viable en GPUs de 40-48 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 12-14 GB de pesos; la model card sugiere `load_in_4bit=True` para inferencia eficiente en GPU.
- GPUs recomendadas: A100 80 GB, H100 80 GB o múltiples GPUs de 24-48 GB para FP16; una RTX 4090 (24 GB) puede ejecutar la versión de 4 bits, y con 8 bits requiere al menos dos GPUs o una A6000 de 48 GB.
- Cabe en GPU de consumo (RTX 3090/4090, 24 GB) solo con cuantización de 4 bits y contextos moderados; el contexto de 131.072 tokens incrementa notablemente la memoria de caché KV y puede exceder esos límites.
- Opciones de despliegue: `transformers` con `device_map="auto"` y `load_in_4bit`; el repositorio incluye pesos en safetensors compatibles con vLLM y TGI para FP16/BF16, y con llama.cpp/Ollama si se generan conversiones GGUF (no publicadas oficialmente en la información disponible).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas destacados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Luciole-23B-Base | 23,2 B | 131.072 | fr, en, +6 y lenguas regionales | Apache 2.0 | Hugging Face |
| Mistral-7B / Mistral Small | 7 B / ~22 B | 32.000 (7B) | en, fr | Apache 2.0 (7B) | Hugging Face |
| Gemma 2 27B | 27 B | 8.192 | en y multilingüe limitado | Gemma Terms | Hugging Face |
| Qwen2.5-32B | 32,5 B | 131.072 | en, zh y multilingüe | Apache 2.0 (mayoría de variantes) | Hugging Face |

La comparación se limita a parámetros, contexto y licencia: no hay datos de benchmarks públicos de Luciole-23B-Base que permitan contrastar rendimiento con estas alternativas. Frente a Mistral y Gemma, Luciole destaca por el peso explícito del francés y las lenguas regionales; frente a Qwen2.5-32B, ofrece menor tamaño y una orientación europea más marcada, a costa de una familia de modelos menos documentada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineación: no debe usarse directamente en aplicaciones finales; el autor exige ajuste fino previo.
- Sesgos heredados del corpus: gran parte del francés proviene de obras de dominio público antiguas, con sesgos de épocas pasadas; el filtrado del dataset es un proyecto en curso.
- Riesgo de generar contenido tóxico u ofensivo pese a los esfuerzos de filtrado del Luciole Training Dataset.
- Riesgo de alucinación inherente a los modelos de lenguaje preentrenados, agravado por la ausencia de RLHF/DPO.
- Rendimiento desigual entre idiomas: el corpus está dominado por inglés (41,9%) y francés (30,4%); idiomas como árabe (0,5%) o neerlandés (1,0%) tienen mucha menos cobertura y pueden rendir peor sin entrenamiento adicional.
- No está optimizado para generación de código pese a incluir un 9,2% de datos de programación.
- El contexto de 131.072 tokens exige hardware con memoria suficiente para la caché KV; en GPUs de consumo puede ser inviable a longitud máxima.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías y recomienda documentar el ajuste fino realizado.
- El informe técnico no está publicado, por lo que faltan detalles de arquitectura, evaluación y procedimiento de entrenamiento verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenLLM-France/Luciole-23B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenLLM-France/Luciole-Training-Dataset
- Repositorio de entrenamiento: https://github.com/OpenLLM-France/Luciole-Training
- Consorcio OpenLLM-France: https://openllm-france.fr/
- LINAGORA Labs: https://labs.linagora.com/
- Dataset FineWeb 2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- GENCI: https://www.genci.fr/
- IDRIS: http://www.idris.fr/docs/idris/missions
- Programa France 2030: https://www.info.gouv.fr/grand-dossier/france-2030
- BPI France: https://www.bpifrance.fr/
