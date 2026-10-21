# SecondLookResearch/Qwen2.5-72B-stories-sonnet-5-instruct-mix-difficult-advice-gpt-5.6-terra-1000-1ep

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de PEFT (rango 64, alpha 128, aplicado a todas las capas lineales) para `Qwen/Qwen2.5-72B`. Lo publica SecondLookResearch dentro del proyecto «Teaching Qwen Why», una replicación sobre pesos abiertos del trabajo de Anthropic «Teaching Claude Why», cuyo objetivo es comprobar si los valores de un asistente se pueden transmitir mediante narrativa fictional (relatos de «encarnación») en lugar de instrucciones explícitas. El adaptador es el tercero y último de una cadena de tres etapas que debe servirse en orden sobre el modelo base.

La receta de entrenamiento es acumulativa: primero 14M tokens de relatos escritos por Claude Sonnet 5 (2 épocas, pérdida next-token sobre documentos completos), después una mezcla de instruction tuning de 13K ejemplos (2 épocas, pérdida solo en turnos del asistente) y, finalmente, 1.000 conversaciones de «consejo difícil» generadas por GPT-5.6 Terra (1 época, pérdida solo en turnos del asistente). Cada etapa entrena un adaptador que se fusiona en el modelo antes de la siguiente, de modo que este repositorio solo reproduce el comportamiento final si se apilan los tres.

Su relevancia es fundamentalmente de investigación: es un artefacto para estudiar generalización de valores, olvido catastrófico en cadenas de LoRA y desalineación agéntica, no un asistente listo para producción. El autor lo vincula explícitamente a las figuras 1 y 13 de su publicación y al arnés de evaluación `evaluation/agentic_misalignment` del repositorio de código. El modelo base aporta la arquitectura y el contexto; el adaptador no los modifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso, Qwen2.5-72B; rango 64, alpha 128, todas las capas lineales |
| Parametros totales | Modelo base Qwen2.5-72B (tamano exacto no indicado en la model card); parametros del adaptador: no disponible (repositorio de 3,4 GB, incluye `base_row_patch.safetensors`) |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | No especificada en la model card; la hereda del modelo base Qwen2.5-72B |
| Tipos de cuantizacion | No documentados; los pesos se distribuyen en safetensors (PEFT). El servicio de referencia usa vLLM sin cuantizacion declarada |
| Idiomas soportados | No disponibles en la model card |
| Licencia | `other` con `license_name: qwen`; enlace a la licencia de Qwen2.5-72B |
| Formato de pesos | safetensors (adaptador LoRA de PEFT) + `base_row_patch.safetensors` (parche de filas del terminador ChatML) |
| Libreria | peft |
| Dataset de entrenamiento | `SecondLookResearch/teaching-qwen-why-data` |
| Etapas de la cadena | 3 (relatos Sonnet 5 → mezcla instruct 13K → consejo difícil GPT-5.6 Terra 1.000) |
| Descargas / likes | 26 / 0 |
| Fecha de creacion | 2026-10-07 (actualizado 2026-10-20) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-72B, un transformer decoder-only denso de la familia Qwen2.5. El entrenamiento se organiza en tres etapas secuenciales, cada una con su propio LoRA de rango 64 y alpha 128 sobre todas las capas lineales, learning rate 1e-4, schedule coseno y batch efectivo de 8 secuencias empaquetadas. La primera etapa entrena con 14M tokens de relatos de ficcion escritos por Claude Sonnet 5 durante 2 épocas, con pérdida next-token sobre documentos completos; estos relatos son «embodiment stories», es decir, narraciones en las que los valores del sistema se muestran a través de sus acciones en lugar de declararse. La segunda etapa usa una mezcla de instruction tuning de 13K ejemplos durante 2 épocas, con pérdida calculada únicamente en los turnos del asistente. La tercera, la que corresponde a este repositorio, usa 1.000 conversaciones de consejo difícil generadas por GPT-5.6 Terra durante 1 época, también con pérdida solo en turnos del asistente. Entre etapas, el adaptador se fusiona en el modelo antes de entrenar el siguiente.

Hay una innovacion tecnica que condiciona por completo el uso: antes de la etapa de instruction mix se reparan las filas del terminador ChatML del modelo base que no fueron entrenadas (el «graft»), y el parche resultante se almacena en este repositorio como `base_row_patch.safetensors`. Servir el adaptador sobre el modelo base sin aplicar ese parche ni la cadena completa no reproduce el comportamiento publicado. El script `serve_model.sh` del repositorio de código aplica el parche, fusiona los adaptadores en orden y levanta el servidor vLLM. No se documentan datos de RLHF, DPO ni preferencias humanas; el ajuste es puramente de imitacion supervisada sobre datos sinteticos.

## Capacidades

- Generacion de texto y conversacion multi-turno en el dominio de consejo y asesoramiento personal, aprendido de las 1.000 conversaciones de GPT-5.6 Terra.
- Estilo narrativo y «encarnacion de valores»: el entrenamiento con relatos de ficcion busca que el modelo exprese criterios a traves de acciones y ejemplos, no solo de declaraciones.
- Razonamiento de sentido comun y matices en situaciones de consejo dificil, segun la composicion del dataset de la tercera etapa.
- Capacidades heredadas del modelo base Qwen2.5-72B (codigo, matematicas, multilingue, tool calling), aunque no se han validado tras el ajuste y la model card no las documenta.
- Integracion en pipelines de investigacion mediante vLLM, con carga de multiples adaptadores en cadena.
- Evaluacion de desalineacion agentica a traves del arnes `evaluation/agentic_misalignment`.
- No se documentan capacidades de vision, audio, modo thinking explicito ni function calling especifico del adaptador.

## Casos de uso

- Reproduccion del experimento «Teaching Claude Why» sobre pesos abiertos: el adaptador permite replicar las figuras 1 y 13 del trabajo de SecondLookResearch y contrastar si la transmision de valores via narrativa funciona igual en Qwen2.5-72B que en modelos propietarios.
- Investigacion en alineacion basada en ficcion: comparar el efecto de relatos de encarnacion frente a instrucciones explicitas sobre las respuestas del modelo en dilemas eticos, usando el mismo base y distintas cadenas de adaptadores.
- Estudio de olvido catastrofico en cadenas de LoRA: al ser la tercera etapa de una secuencia con fusion intermedia, sirve para medir cuanto retiene el modelo de las etapas 1 y 2 tras el ajuste final.
- Evaluacion de desalineacion agentica: el arnes `agentic_misalignment` del repositorio de codigo permite medir comportamientos no deseados en escenarios multi-paso antes de plantear cualquier uso real.
- Analisis de calidad y sesgos de datos sinteticos: las 1.000 conversaciones de GPT-5.6 Terra son un corpus pequeno y trazable, util para estudiar como un generador concreto imprime estilo y criterios en el modelo ajustado.
- Docencia y divulgacion tecnica: como ejemplo reproducible de pipeline PEFT completo (graft, entrenamiento por etapas, fusion, servido con vLLM) en cursos de ajuste fino.
- Prototipado interno de asistentes de consejo: solo en entornos de laboratorio, con supervision humana y sin exposicion a usuarios finales, dado el estado experimental del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las figuras 1 y 13 de la publicacion del proyecto y al arnes de evaluacion de desalineacion agentica, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad. No se aportan tasas de alucinacion, win rates ni comparaciones numericas con otras cadenas de adaptadores.

## Requisitos de hardware

- VRAM en bf16/fp16: el modelo base de 72B ocupa del orden de 145 GB de pesos, mas el overhead de activaciones y KV cache; se necesitan 2x H100 80 GB o 4x A100 40 GB con tensor parallelism.
- VRAM en FP8 o int8: aproximadamente 75-80 GB, viable en 1x H100 80 GB o 2x A100 40 GB.
- Cuantizacion de 4 bits (GPTQ/AWQ/GGUF Q4): estimacion de 40-45 GB, lo que permite 1x A100 80 GB o 2x RTX 4090 de 24 GB.
- GPU consumer: no cabe en una sola GPU de 24 GB ni de 48 GB en bf16; en 4 bits requiere al menos dos RTX 4090 o una RTX 6000 Ada de 48 GB.
- Despliegue recomendado: vLLM con carga de adaptadores en cadena, aplicando antes el graft y fusionando los tres LoRA en orden mediante `serve_model.sh`. No se documenta soporte de llama.cpp, Ollama ni TGI para esta cadena concreta.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Este adaptador (cadena Teaching Qwen Why) | 72B base + LoRA r64 | Heredado del base, no especificado | Adaptador de alineacion | `other` / Qwen | No disponible |
| Qwen/Qwen2.5-72B-Instruct | 72B | Contexto declarado por el modelo base | Modelo instructivo completo | Qwen | No comparable sin datos |
| Llama-3.3-70B-Instruct | 70B | Contexto declarado por el modelo base | Modelo instructivo completo | Llama 3.3 Community License | No comparable sin datos |
| «Teaching Claude Why» (Anthropic) | No disponible | No disponible | Modelo propietario | Propietaria | No disponible |

La comparacion relevante no es de rendimiento bruto sino de proposito: los modelos instructivos completos estan pensados para uso general, mientras que este adaptador es un artefacto de investigacion que solo tiene sentido apilado sobre los dos adaptadores previos y el parche del terminador. No se dispone de datos publicos que permitan afirmar que supere o iguale a los modelos de la tabla en ninguna tarea estandar.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base Qwen2.5-72B, el parche `base_row_patch.safetensors` y los dos adaptadores anteriores en orden. Servirlo de forma aislada produce un comportamiento distinto al documentado.
- Sin datos de evaluacion publicados: no hay benchmarks, ni evaluaciones de seguridad, ni mediciones de calidad de consejo que respalden su uso fuera de investigacion.
- Entrenado sobre datos sinteticos generados por otros modelos (Claude Sonnet 5 y GPT-5.6 Terra), con los sesgos y el estilo de esos generadores heredados y sin filtrado documentado.
- Volumen de datos muy reducido en la etapa final (1.000 conversaciones, 1 época), lo que aumenta el riesgo de sobreajuste al estilo del dataset y de respuestas poco generalizables.
- Riesgo de alucinacion no cuantificado, especialmente en un dominio de consejo personal donde los errores tienen impacto directo en el usuario.
- Idiomas soportados no documentados; el material de entrenamiento descrito esta en ingles, por lo que el rendimiento en castellano no esta verificado.
- Limitaciones de contexto no verificadas tras el ajuste: el adaptador no redefine la ventana, pero no se ha medido el comportamiento en contextos largos.
- Licencia `other` con nombre `qwen`: se aplican los terminos de la licencia de Qwen2.5-72B, que incluyen condiciones para uso comercial. Es responsabilidad del usuario revisarlas antes de cualquier despliegue productivo.
- Artefacto de investigacion con 26 descargas y 0 likes: no hay validacion independiente por parte de la comunidad.
- El nombre del repositorio hace referencia a versiones de modelos no verificables de forma independiente; conviene tratar las etiquetas del nombre como descriptivas del dataset, no como garantia de procedencia.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/SecondLookResearch/Qwen2.5-72B-stories-sonnet-5-instruct-mix-difficult-advice-gpt-5.6-terra-1000-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-72B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-72B/blob/main/LICENSE
- Adaptador etapa 1: https://huggingface.co/SecondLookResearch/Qwen2.5-72B-stories-sonnet-5
- Adaptador etapa 2: https://huggingface.co/SecondLookResearch/Qwen2.5-72B-stories-sonnet-5-instruct-mix
- Dataset de entrenamiento: https://huggingface.co/datasets/SecondLookResearch/teaching-qwen-why-data
- Codigo del proyecto: https://github.com/uchicago-xlab/TeachingClaudeWhyReplication

Nota: los resultados de busqueda web proporcionados no contienen enlaces relevantes para este modelo; todas las entradas recuperadas tratan sobre Karl Adler y no guardan relacion con el artefacto descrito.
