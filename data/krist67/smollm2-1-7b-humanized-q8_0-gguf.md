# krist67/SmolLM2-1.7B-humanized-Q8_0-GGUF

## Resumen
Este repositorio contiene una cuantización GGUF Q8_0 del modelo AssistantsLab/SmolLM2-1.7B-humanized, un ajuste fino por DPO de SmolLM2-1.7B (HuggingFaceTB) orientado a generar respuestas con un estilo más humano. La conversión la ha realizado el usuario krist67 mediante el espacio GGUF-my-repo de ggml.ai y llama.cpp. El resultado es un archivo de aproximadamente 1,8 GB pensado para inferencia local con llama.cpp y herramientas compatibles.

El modelo base SmolLM2-1.7B es un transformer decoder-only de 1.711.376.384 parámetros, entrenado originalmente para generación de texto en inglés. La variante humanized incorpora un ajuste con el dataset HumanLLMs/Human-Like-DPO-Dataset para favorecer respuestas conversacionales más naturales. Esta conversión Q8_0 reduce el peso a 8 bits por parámetro, lo que facilita su despliegue en hardware de consumo sin renunciar prácticamente a calidad frente a FP16.

Es relevante para desarrolladores que necesitan un modelo conversacional pequeño, con licencia Apache 2.0 y formato GGUF listo para usar en local. No obstante, la información disponible no detalla la longitud de contexto, los datos exactos de entrenamiento ni resultados de benchmarks, por lo que su evaluación debe completarse con la model card del modelo base.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2) |
| Parametros totales | 1.711.376.384 (1,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0 (GGUF, 8 bits) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0); el repositorio incluye la etiqueta safetensors del modelo base |

## Arquitectura y entrenamiento
El modelo es una cuantización del ajuste fino AssistantsLab/SmolLM2-1.7B-humanized, que a su vez parte de SmolLM2-1.7B. La arquitectura subyacente es un transformer decoder-only de 1,7B parámetros, habitual en la familia SmolLM2 para generación de texto. El ajuste fino humanized se realizó mediante DPO (Direct Preference Optimization) sobre el dataset HumanLLMs/Human-Like-DPO-Dataset, con el objetivo de alinear el estilo de respuesta con preferencias humanas.

La conversión a GGUF Q8_0 se hizo con llama.cpp a través del espacio GGUF-my-repo. Q8_0 es una cuantización de 8 bits por peso con bloques de 32 valores, que suele considerarse casi sin pérdida frente a FP16. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF adicional ni otras innovaciones técnicas (decodificación especulativa, atención lineal, etc.).

## Capacidades
- Generación de texto conversacional en inglés.
- Estilo de respuesta "humanizado" gracias al ajuste DPO.
- Formato conversacional (etiqueta conversational).
- No se documenta soporte de tool calling o function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Monolingüe: solo inglés.
- Sin capacidades de visión, audio ni modo thinking.
- Adecuado para prototipos y experimentos de alineación.

## Casos de uso
- Chatbot local en inglés para pruebas de concepto: usar llama-server con el GGUF y una ventana de contexto configurable (por ejemplo -c 2048) para conversaciones multi-turno en un portátil.
- Asistente conversacional de bajo consumo en edge: desplegar en una Raspberry Pi 5 o mini PC con CPU, ya que Q8_0 ocupa aproximadamente 1,8 GB y permite inferencia sin GPU.
- Generación de respuestas con estilo humano para prototipos de atención al cliente: evaluar si el tono DPO mejora la percepción en encuestas internas antes de invertir en modelos mayores.
- Role-play y creación de personajes: el ajuste humanized puede producir diálogos más naturales en inglés para juegos de texto o narrativa interactiva.
- Aumento de datos conversacionales: generar respuestas variadas en inglés para ampliar datasets de entrenamiento o evaluar clasificadores de diálogo.
- Tutor de inglés conversacional: practicar intercambios escritos en un entorno local sin enviar datos a la nube, con la limitación de que el modelo es pequeño y puede alucinar.
- Evaluación de técnicas DPO: comparar este modelo con SmolLM2-1.7B-Instruct para medir el efecto del dataset Human-Like-DPO en estilo y factualidad.
- Integración en pipelines de CI para pruebas de regresión de prompts: al ser un GGUF pequeño, se puede cargar en tests automatizados con llama-cpp-python.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas de MMLU, HumanEval, GSM8K ni comparativas cuantitativas con otros modelos.

## Requisitos de hardware
- VRAM estimada: aproximadamente 1,8 GB para los pesos Q8_0; añadir KV cache según la longitud de contexto configurada (por ejemplo, 0,5-1 GB adicionales para 2k-4k tokens en FP16). Total orientativo: 2,5-3 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060). No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en modelos con 4 GB o más; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (CLI y server), Ollama importando el GGUF, llama-cpp-python y LM Studio. vLLM y TGI no soportan GGUF de forma nativa; para esos entornos conviene usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. Dependen del hardware; en CPU moderna se pueden esperar decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Idioma | Formato | Notas |
|---|---|---|---|---|---|---|
| krist67/SmolLM2-1.7B-humanized-Q8_0-GGUF | 1,7B | No disponible en la información proporcionada | Apache 2.0 | Inglés | GGUF Q8_0 | Conversión no oficial con ajuste DPO humanized |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | Consultar model card | Apache 2.0 | Inglés | Safetensors/GGUF | Modelo oficial instruct de la familia SmolLM2 |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | Consultar model card | Apache 2.0 | Multilingüe (incluye inglés) | Safetensors/GGUF | Mayor soporte multilingüe y contexto más amplio según su documentación |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | Consultar model card | Llama 3.2 Community License | Multilingüe | Safetensors/GGUF | Licencia más restrictiva para uso comercial |

No se dispone de datos de benchmarks en la información proporcionada para comparar rendimiento cuantitativo entre estos modelos.

## Limitaciones y advertencias
- Modelo pequeño (1,7B): alta probabilidad de alucinación en hechos, matemáticas y código complejo.
- Solo inglés; no soporta español ni otros idiomas de forma fiable.
- El ajuste DPO "humanized" puede priorizar estilo sobre precisión factual.
- No se documenta tool calling, agentes ni razonamiento multi-paso.
- Longitud de contexto no especificada; la configuración de llama-server del ejemplo usa -c 2048, lo que sugiere que no se debe asumir un contexto largo.
- Conversión no oficial por un usuario (krist67), con 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria.
- La cuantización Q8_0 introduce una pérdida mínima pero no nula frente a FP16.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base y del dataset Human-Like-DPO-Dataset para cumplimiento.
- Sin garantías de seguridad: puede generar contenido sesgado o inapropiado; requiere filtros en producción.

## Enlaces
- HuggingFace: https://huggingface.co/krist67/SmolLM2-1.7B-humanized-Q8_0-GGUF
- Modelo base: https://huggingface.co/AssistantsLab/SmolLM2-1.7B-humanized
- SmolLM2-1.7B: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Colección SmolLM2: https://huggingface.co/collections/HuggingFaceTB/smollm2
- Dataset: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- llama.cpp: https://github.com/ggerganov/llama.cpp
- GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Ollama smollm2: https://ollama.com/library/smollm2:1.7b
- Qualcomm AI Hub: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/smollm2_1_7b_it/README.md
