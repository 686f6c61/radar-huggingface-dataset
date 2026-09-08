# congxsha/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-GGUF

## Resumen
El modelo MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking es un fine-tune de 1.080.632.832 parámetros sobre MiniCPM5-1B de OpenBMB. Fue creado por GnLOLot y publicado por congxsha en formato GGUF para su ejecución local con llama.cpp, Ollama, LM Studio, jan y KoboldCpp. La variante está entrenada con datos Fable 5 en su versión V2, que refuerza las capacidades de tool calling y function calling frente a la versión V1.

El modelo soporta un contexto máximo de 131.072 tokens (128K), ofrece un modo thinking para razonamiento encadenado y está diseñado para generación de código, seguimiento de instrucciones y conversación en inglés y chino. Las cuantizaciones disponibles (Q8_0 de ~1,1 GB y F16 de ~2,1 GB) permiten su despliegue en equipos modestos, y la licencia Apache-2.0 habilita uso comercial sin restricciones.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la documentación (derivado de MiniCPM5-1B) |
| Parametros totales | 1.080.632.832 (≈1,08B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | Q8_0 (≈1,1 GB), F16 (≈2,1 GB) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el checkpoint Transformers original está en safetensors) |

## Arquitectura y entrenamiento
El modelo es una cuantización GGUF de un checkpoint Transformers que parte de MiniCPM5-1B, perteneciente a la familia MiniCPM de OpenBMB. El fine-tune sobre datos Fable 5 en su versión V2 se ha realizado sobre ese modelo base, manteniendo la plantilla de chat nativa de MiniCPM5 en los metadatos del archivo GGUF. A diferencia de la versión V1, V2 incide principalmente en el refuerzo de la capacidad de tool calling y function calling, tal como reflejan los benchmarks de BFCL y API-Bank. No se detallan en la documentación el número de tokens del entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO, por lo que esos datos no están disponibles.

El proceso de cuantización se ha realizado con llama.cpp, ofreciendo los formatos Q8_0 y F16. El modelo expone capacidades de razonamiento a través de un modo thinking (cadena de pensamiento) que puede desactivarse mediante el parámetro `enable_thinking`, y permite un contexto de hasta 131.072 tokens definido en el `config.json` del modelo original.

## Capacidades
- Generación de texto y estilo conversacional: responde en inglés y chino usando el chat template de MiniCPM5 embebido en el GGUF.
- Tool calling y function calling: capacidad reforzada en V2, lo que permite invocar funciones externas en flujos de agente.
- Generación de código: soporta tareas de programación y depuración, como muestra el ejemplo oficial de fusión de listas ordenadas en Python.
- Seguimiento de instrucciones: mayor adherencia a comandos y restricciones del usuario.
- Modo thinking: razonamiento encadenado antes de la respuesta final, activado por defecto y desactivable.
- Contexto largo: hasta 128K tokens, lo que permite manejar documentos extensos o conversaciones prolongadas.
- Multilingüe: inglés y chino (en, zh).

## Casos de uso
- Revisión de código en entornos de desarrollo local: el modelo puede ejecutarse mediante `llama-cli` para pedirle que analice o corrija fragmentos de código Python, aprovechando su capacidad de generación de código y su ventana de contexto para incluir el módulo completo.
- Agente de automatización con funciones: gracias al refuerzo del tool calling en V2, puede integrarse en un script que gestione llamadas a APIs; el modelo decide cuándo invocar una función y cómo usar el resultado.
- Asistente técnico bilingüe (inglés-chino) para soporte: su soporte de ambos idiomas y su plantilla de chat embebida permiten crear un chatbot de soporte que responda según el idioma del usuario y recuerde el historial de la conversación gracias al contexto largo.
- Análisis de documentos en memoria limitada: el modo thinking y el contexto de 128K permiten procesar documentos extensos, resumirlos y responder preguntas, en un entorno con GPU modesta gracias al tamaño de 1B.
- Generación de tests unitarios en CI/CD: mediante `llama-server`, el modelo puede usarse como servicio interno que, dado un fragmento de código, propone casos de prueba; la naturaleza local evita enviar código propietario a servicios externos.
- Asistente de escritorio con LM Studio o jan: se puede cargar el GGUF en estos runtimes de escritorio para redacción técnica o para preguntas sobre documentación de un proyecto, manteniendo el control sobre el hardware.
- Prototipado de agentes con function calling: los resultados de BFCL y API-Bank, superiores al modelo base, lo convierten en una opción para probar flujos de tool-use en un modelo ligero antes de escalar a un modelo mayor.

## Benchmarks y rendimiento
Los datos corresponden al checkpoint Transformers original (no a la cuantización GGUF), tal como se presentan en la model card.

### BFCL + API-Bank
| Model | BFCL non_live | BFCL live | API-Bank |
|---|---|---|---|
| MiniCPM5-1B (Base) | 41.51% | 60.24% | 7.30% |
| MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking | 43.06% | 63.33% | 22.10% |

### Tau-Bench
| Domain | MiniCPM5-1B (Base) | MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking |
|---|---|---|
| Airline | 0.34 (17/50) | 0.36 (18/50) |
| Retail | 0.052 (6/115) | 0.070 (8/115) |

## Requisitos de hardware
- VRAM estimada para inferencia: Q8_0 requiere ~1,1 GB solo para pesos; F16 requiere ~2,1 GB. La memoria total depende de la longitud de contexto utilizada (KV cache).
- GPU recomendadas: no se proporcionan en la documentación. Dado el tamaño de los pesos, es razonable usar GPUs de gama media-baja (por ejemplo, RTX 3050 o superior) para contextos moderados; no se indica hardware específico para este modelo.
- En GPU de consumo: sí, para la cuantización Q8_0 en contextos cortos o medios. Para contextos cercanos a 128K, la VRAM necesaria aumenta considerablemente.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, jan, KoboldCpp.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares
- Frente a MiniCPM5-1B (base): el fine-tune V2 mejora en BFCL non_live (43,06% vs 41,51%), BFCL live (63,33% vs 60,24%) y API-Bank (22,10% vs 7,30%), así como en Tau-Bench (Airline 0,36 vs 0,34; Retail 0,070 vs 0,052). Parámetros y contexto comparables (1B, 128K probablemente).
- Frente a la versión V1 del fine-tune: V2 añade refuerzo en tool calling; no hay datos públicos de benchmarks para V1 en la información disponible.
- Frente a la variante imatrix-GGUF de liodon-ai: es otra cuantización del mismo checkpoint, pero no se detalla su rendimiento ni sus especificaciones en la información disponible.

## Limitaciones y advertencias
- El modelo puede emitir bloques de razonamiento antes de la respuesta final; en producción, hay que gestionar esos bloques (`enable_thinking=False` para desactivarlos).
- Al ser un modelo de escala 1B, no ofrece capacidades de frontera; su rendimiento en tareas complejas será limitado.
- El contexto útil real depende del runtime GGUF y de los límites de hardware; no siempre se alcanzarán los 128K declarados.
- Se desconocen sesgos específicos del fine-tune; no se han publicado evaluaciones de sesgo o seguridad.
- El modelo solo ha sido evaluado en inglés y chino; su uso en otros idiomas no está recomendado.
- Riesgo de alucinación: no hay datos específicos, pero al tratarse de un modelo pequeño, debe validarse en escenarios de alta exigencia.

## Enlaces
- Repositorio GGUF: https://huggingface.co/congxsha/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-GGUF
- Checkpoint Transformers original: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Versión V1 del GGUF: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF
- Variante imatrix-GGUF: https://huggingface.co/liodon-ai/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-imatrix-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
