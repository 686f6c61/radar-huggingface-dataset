# marcoharuni95/Qwen3-0.6B-Q4_K_M-GGUF

## Resumen

`marcoharuni95/Qwen3-0.6B-Q4_K_M-GGUF` es una conversión a formato GGUF del modelo denso Qwen3-0.6B de Alibaba Qwen, publicada por un tercero (usuario `marcoharuni95`) mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp. No se trata de un modelo nuevo ni de un fine-tune: es el mismo checkpoint base con los pesos cuantizados en Q4_K_M, empaquetados en un único fichero `qwen3-0.6b-q4_k_m.gguf` de aproximadamente 0,5 GB, listo para ejecutarse con llama.cpp, Ollama o LM Studio sin necesidad de convertir nada.

El modelo subyacente es un transformer denso de 751.632.384 parámetros (etiquetado comercialmente como 0,6B) orientado a generación de texto y conversación, con licencia Apache 2.0 heredada del original. Su relevancia práctica está en el extremo opuesto a los grandes modelos: es un candidato para inferencia local en CPU, portátiles sin GPU dedicada, dispositivos móviles y entornos con restricciones de memoria muy severas, o como componente auxiliar barato (clasificación, enrutado, generación de plantillas) dentro de pipelines mayores.

La ficha del repositorio es mínima: solo documenta el proceso de conversión y los comandos de uso con llama.cpp, y remite a la model card original para cualquier detalle técnico. No incluye datos de entrenamiento, benchmarks ni lista de idiomas, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), heredada de Qwen/Qwen3-0.6B; no se detalla en la model card de este repositorio |
| Parametros totales | 751.632.384 (dato de safetensors del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada. El modelo base Qwen3-0.6B documenta 32 768 tokens nativos (dato no verificado en esta ficha) |
| Tipos de cuantizacion | Q4_K_M (única variante publicada en este repositorio); el modelo base se distribuye en bf16 |
| Idiomas soportados | No disponibles en la información proporcionada |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3-0.6B) |
| Formato de pesos | GGUF (fichero único `qwen3-0.6b-q4_k_m.gguf`, repo de ~0,5 GB) |

## Arquitectura y entrenamiento

La model card de este repositorio no aporta información sobre arquitectura interna ni sobre el proceso de entrenamiento; únicamente declara que el checkpoint se generó convirtiendo `Qwen/Qwen3-0.6B` a GGUF con llama.cpp a través del espacio GGUF-my-repo de ggml.ai. Por tanto, todo lo relativo a composición del dataset, número de tokens, fases de post-entrenamiento (SFT, RLHF, DPO) o innovaciones técnicas debe consultarse en la documentación del modelo base, que no forma parte de la información suministrada.

Lo que sí es verificable es el resultado de la conversión: un transformer decoder-only denso de 751 millones de parámetros, cuantizado en Q4_K_M (bloques de 4 bits con escalas de 6 bits y mezcla de tensores en 5/6 bits para las capas más sensibles), que ocupa aproximadamente 0,5 GB en disco. Esta cuantización reduce el peso roughly a una cuarta parte del bf16 original a cambio de una pérdida de precisión no cuantificada en la documentación disponible.

## Capacidades

- Generación de texto y conversación multi-turno en el formato de chat del modelo base (tag `conversational`, pipeline `text-generation`).
- Razonamiento básico y respuesta a instrucciones, con las limitaciones propias de un modelo de 0,75B parámetros.
- La familia Qwen3 documenta modos *thinking* y *non-thinking*; la información disponible sobre este repositorio concreto no detalla cómo se activan ni si están preservados tras la cuantización.
- Soporte de *tool calling* / *function calling*: no verificado en la información disponible. La documentación de la familia Qwen3 cita mejoras en *tool usage*, pero no hay confirmación específica para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no disponibles / no verificadas para este tamaño.
- Capacidades multilingües: no disponibles (la lista de idiomas no aparece en la información proporcionada).
- Sin capacidades de visión ni audio.
- Compatible con *endpoints* de inferencia según el tag `endpoints_compatible` de la plataforma.

## Casos de uso

- **Clasificación y enrutado de consultas en local**: con 0,5 GB de pesos puede cargarse en memoria de un portátil o un contenedor pequeño para etiquetar tickets, detectar intención o decidir a qué servicio derivar una petición, sin coste de API ni envío de datos a terceros.
- **Generación de texto en dispositivos *edge***: el tamaño del fichero GGUF permite ejecutarlo en Raspberry Pi, mini-PC o terminales móviles; encaja en funciones de autocompletado, resúmenes cortos o respuestas predefinidas donde no cabe un modelo mayor.
- **Prototipado y pruebas de pipelines de inferencia**: útil como modelo de sustitución para validar integraciones con llama.cpp, Ollama o llama-cpp-python (carga, streaming, plantillas de chat, límites de contexto) antes de escalar a checkpoints de mayor tamaño.
- **Preprocesado y anotación de datos**: generación de borradores de etiquetas, reformateo de texto, normalización de campos o generación de variaciones sintéticas en lotes grandes, donde el coste por token de un modelo mayor sería prohibitivo.
- **Asistentes embebidos *offline***: chatbots de documentación técnica o de ayuda en aplicaciones de escritorio que deben funcionar sin conexión y con requisitos de privacidad estrictos.
- **Generación de plantillas y texto estructurado**: borradores de correos, descripciones de producto, *boilerplate* de código o JSON sencillo, con validación posterior en el pipeline.
- **Componente auxiliar en sistemas multiagente**: como "modelo barato" para tareas de desambiguación, resumen de historial o generación de consultas intermedias antes de llamar a un modelo grande.
- **Evaluación comparativa de cuantizaciones**: útil para medir la degradación de Q4_K_M frente al bf16 original en tareas concretas de la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio no incluye métricas (MMLU, HumanEval, GSM8K ni otras) y no se han proporcionado datos del modelo base en la búsqueda realizada. Cualquier cifra de referencia debería tomarse de la documentación oficial de Qwen3-0.6B, no de este repositorio, y en ningún caso se ha medido el impacto de la cuantización Q4_K_M sobre dichas métricas.

## Requisitos de hardware

- **Tamaño en disco / memoria de pesos**: aproximadamente 0,5 GB para el fichero Q4_K_M completo (el repositorio entero ocupa 0,5 GB).
- **VRAM estimada**: del orden de 1 a 1,5 GB para inferencia en GPU con contexto moderado (2 000–4 000 tokens), sumando pesos y caché KV. Estimación, no medida publicada.
- **GPU recomendadas**: cualquier GPU con 2 GB o más de VRAM es suficiente; una RTX 4090 o A100 está enormemente sobredimensionada para este modelo y solo tiene sentido para servir muchos lotes concurrentes. También funciona en iGPU y en Apple Silicon vía Metal.
- **CPU**: viable y probablemente el escenario principal; un x86 moderno o ARM64 ejecuta el modelo con fluidez en modo interactivo. Cabe en dispositivos móviles (Qualcomm AI Hub lista Qwen3-0.6B entre sus modelos soportados, aunque esa ficha corresponde al modelo base, no a este GGUF).
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server`), Ollama (existe la variante `qwen3:0.6b-q4_K_M` en la librería oficial), LM Studio, llama-cpp-python y binarios derivados. vLLM ofrece soporte GGUF experimental; TGI no soporta GGUF de forma nativa.
- **Latencia y throughput**: no hay mediciones publicadas en la información disponible. Por el tamaño, en CPU cabe esperar decenas de tokens por segundo y en GPU cientos o miles en batched, pero son estimaciones orientativas que deben validarse en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (marcoharuni95/Qwen3-0.6B-Q4_K_M-GGUF) | 751,6 M | No disponible en la información (base: 32 768 según documentación del modelo base) | GGUF Q4_K_M, ~0,5 GB | Apache 2.0 | Repositorio de terceros, sin descargas ni valoraciones registradas |
| Qwen/Qwen3-0.6B (modelo base) | 751,6 M | No disponible en la información | Safetensors bf16 | Apache 2.0 | Repositorio oficial de Qwen, referencia canónica |
| bartowski/Qwen_Qwen3-0.6B-GGUF | 751,6 M | No disponible en la información | GGUF en múltiples cuantizaciones (Q4_0, Q4_K_M, etc.) | Apache 2.0 | Conversión de referencia de un publicador con trayectoria conocida |
| Ollama `qwen3:0.6b-q4_K_M` | 751,6 M | No disponible en la información | GGUF Q4_K_M empaquetado para Ollama | Apache 2.0 | Distribución vía registro de Ollama |

La diferencia entre las tres conversiones GGUF es logística (autor, variedad de cuantizaciones, método de distribución), no de pesos: todas parten del mismo checkpoint Apache 2.0.

## Limitaciones y advertencias

- **Capacidad limitada por el tamaño**: con 0,75B parámetros, el razonamiento multi-paso, las matemáticas y la generación de código complejo son fiables solo en tareas muy acotadas; no es un sustituto de modelos de 7B o superiores en producción exigente.
- **Riesgo de alucinación**: alto en preguntas factuales abiertas, como es habitual en modelos pequeños; requiere verificación externa y, preferiblemente, anclaje a contexto (RAG) con respuestas restringidas.
- **Pérdida por cuantización**: Q4_K_M introduce degradación respecto al bf16 original, no medida ni documentada en este repositorio. Si la aplicación es sensible a la precisión, conviene comparar con el checkpoint base.
- **Idiomas no documentados**: la información disponible no lista idiomas soportados; el rendimiento en castellano no está verificado y debe evaluarse empíricamente antes de desplegar.
- **Contexto no confirmado**: la model card no declara la ventana de contexto efectiva; los ejemplos de llama.cpp usan `-c 2048`, y no hay garantía de que la cuantización preserve la ventana completa del modelo base.
- **Repositorio de terceros sin validación**: 0 descargas y 0 valoraciones en el momento de la consulta, y sin verificación de equivalencia numérica frente al original. Para uso en producción es más prudente partir de una conversión con historial contrastado o convertir el checkpoint oficial uno mismo.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero conviene revisar la licencia del modelo base enlazada por el autor y mantener la atribución correspondiente.
- **Metadatos de plataforma**: la fecha de creación indicada por Hugging Face (2026-10-26) y la ausencia de documentación adicional dificultan evaluar el mantenimiento del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/marcoharuni95/Qwen3-0.6B-Q4_K_M-GGUF
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Repositorio oficial de la familia Qwen3: https://github.com/QwenLM/Qwen3
- Conversión alternativa de bartowski: https://huggingface.co/bartowski/Qwen_Qwen3-0.6B-GGUF
- Ficha de Qwen3-0.6B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_0_6b
- Variante en la librería de Ollama: https://ollama.com/library/qwen3:0.6b-q4_K_M
