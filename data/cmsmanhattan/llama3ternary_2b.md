# CMSManhattan/Llama3Ternary_2b

## Resumen

Llama3Ternary_2b es un modelo de lenguaje de 2.102.462.464 parámetros (aproximadamente 2,1 mil millones) desarrollado por CMSManhattan (Center Business Solutions inc), un miembro del programa NVIDIA Inception. Se trata de un transformer decoder-only entrenado de forma nativa con pesos ternarios (1.58 bits), lo que lo sitúa en la familia de modelos inspirados en BitNet y lo hace especialmente adecuado para ejecución local en dispositivos de borde y móviles. El modelo parte del tokenizer y vocabulario de Meta Llama 3, e incorpora un tokenizer específico (CMSManhattan/LlamaRoboticsTokenizer) orientado a enrutamiento y llamadas a herramientas.

El modelo resuelve el problema del coste de inferencia en escenarios de enrutamiento y tool calling: al emplear pesos ternarios durante todo el proceso (preentrenamiento y SFT), reduce drásticamente el espacio de almacenamiento y los requisitos de memoria, con ficheros GGUF que van desde 556 MB (TQ1_0) hasta 3,69 GB (F16). Su contexto declarado es de 8K tokens según LLM Explorer, aunque la model card no lo especifica explícitamente.

Es relevante ahora porque la cuantización ternaria nativa permite desplegar un modelo conversacional con soporte de tool calling en hardware de consumo, y porque el autor está construyendo una familia completa (2B a 72B) con licencia comercial restrictiva. No obstante, el estado del modelo es propietario: los pesos no son públicos y el acceso requiere un acuerdo escrito con el licenciante, lo que limita seriamente su evaluación y uso abierto pese a estar alojado en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con pesos ternarios nativos (1.58 bits) |
| Parametros totales | 2.102.462.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8K tokens (según LLM Explorer; no confirmado en la model card) |
| Tipos de cuantizacion | Ternaria nativa (1.58 bits); GGUF en TQ1_0, TQ2_0, Q4_K_M, Q8_0 y F16 |
| Idiomas soportados | Inglés (en) |
| Licencia | BSL-1.0 con license_name llama3; pesos propietarios, acceso solo mediante acuerdo escrito |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero con pesos ternarios, es decir, cada peso se restringe a tres valores posibles (-1, 0, +1), lo que corresponde a 1.58 bits por parámetro. A diferencia de los enfoques de cuantización post-entrenamiento, el autor afirma que tanto el preentrenamiento como la fase de SFT se realizaron íntegramente en modo ternario, lo que constituye la innovación técnica principal: el modelo no es un Llama 3 cuantizado, sino una arquitectura entrenada nativamente en baja precisión.

El tokenizer y el vocabulario derivan de Meta Llama 3, y el autor indica que se reutilizan espacios reservados del tokenizer original para mantener compatibilidad sin necesidad de redimensionar el modelo. Además, se emplea un tokenizer propio (LlamaRoboticsTokenizer) orientado a enrutamiento y llamadas a herramientas. Los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. Los ficheros GGUF se generan con un fork de BitNet sobre llama.cpp, y en la reconstrucción de octubre de 2026 se corrigió la compartición de la tabla de embeddings entre entrada y salida (Q6_K), lo que mejoró los resultados de tool calling y redujo el tamaño de los ficheros.

## Capacidades

- Generación de texto conversacional en inglés.
- Tool calling / function calling integrado, con soporte de llamadas simples y paralelas, respuestas a partir de resultados de herramientas y solicitud de argumentos faltantes.
- Enrutamiento de consultas (routing) como caso de uso principal declarado por el autor.
- Razonamiento multi-paso limitado: la propia model card reporta debilidades en categorías como "parallel" y "clarify" en las pruebas internas.
- Capacidades multilingües: solo inglés declarado; no se documentan otros idiomas.
- Ejecución local en CPU y dispositivos de borde mediante GGUF y llama.cpp.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Enrutamiento de consultas en dispositivos móviles: el modelo, con ficheros de 556-630 MB en TQ1_0/TQ2_0, puede clasificar y dirigir peticiones a modelos mayores o servicios backend sin salir del dispositivo, reduciendo costes de API.
- Asistente de tool calling en aplicaciones de escritorio: gracias a su soporte nativo de function calling y a su bajo consumo de memoria, puede integrarse en clientes locales que invocan APIs del sistema operativo o servicios web.
- Automatización de atención al cliente de primer nivel: puede gestionar conversaciones multi-turno en inglés y decidir cuándo invocar una herramienta (por ejemplo, consultar un pedido) y cuándo responder directamente, aunque su precisión en tool calling es moderada (54% en la prueba interna de 117 casos).
- Despliegue en hardware de consumo: con 0,7 GB de VRAM estimada por LLM Explorer, cabe en GPUs integradas y placas como Raspberry Pi o dispositivos con poca memoria, actuando como modelo de respaldo o clasificador.
- Filtrado y clasificación de intenciones en pipelines de CI/CD: puede etiquetar issues, solicitudes de soporte o mensajes de commit mediante prompts estructurados, con latencia baja en CPU.
- Prototipado de agentes locales: sirve como componente de planificación ligera en agentes que operan sin conexión, siempre que el alcance se limite a tareas de enrutamiento y llamadas a herramientas simples.
- Evaluación de técnicas de cuantización ternaria: investigadores pueden usar los GGUF publicados para estudiar el comportamiento de modelos 1.58-bit en tareas de tool calling, aunque el acceso a los pesos safetensors está restringido.

## Benchmarks y rendimiento

Los únicos datos publicados son las pruebas internas de tool calling del autor (117 casos, decodificación greedy, llama-server en CPU, formato de prompt exacto del fine-tuning). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Categoría | SFT | Patch v2 | Patch v3 (loss weight) | Patch v4 |
|---|---|---|---|---|
| single | 17/38 | 6/38 | 7/38 | 21/38 |
| parallel | 6/19 | 3/19 | 2/19 | 4/19 |
| follow-up | 15/20 | 14/20 | 11/20 | 11/20 |
| no-tool | 3/25 | 25/25 | 25/25 | 23/25 |
| clarify | 0/15 | 10/15 | 11/15 | 4/15 |
| **Total** | 41 (35%) | 58 (50%) | 56 (48%) | **63 (54%)** |

Resultados por fichero GGUF en la prueba de herramientas (117 casos):

| Fichero | Tamaño | Prueba anterior | Prueba nueva |
|---|---|---|---|
| TQ1_0 | 556 MB | 61/117 | 69/117 |
| TQ2_0 | 630 MB | 61/117 | 69/117 |
| Q4_K_M | 1,17 GB | 59/117 | 70/117 |
| Q8_0 | 1,96 GB | no probado | 70/117 |
| F16 | 3,69 GB | 69/117 | 69/117 |

El modelo PyTorch de referencia obtiene 70/117. El autor también reporta que la variante "Precision 2B" de la misma familia alcanza 109/117 (93%) con el Patch v3, muy por encima de Llama3 Ternary 2B, lo que sugiere que la versión ternaria sacrifica precisión en tool calling.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,7 GB según LLM Explorer para el modelo ternario; los GGUF ocupan entre 556 MB (TQ1_0) y 3,69 GB (F16).
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente para las variantes TQ1_0/TQ2_0.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1050 Ti, RTX 3050, RTX 4060 o incluso GPUs integradas, y también en CPU.
- Opciones de despliegue: llama.cpp (fork BitNet, build c250304 o superior), llama-server; no se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; el autor solo indica que está pensado para baja latencia en dispositivos de borde.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama3Ternary_2b | 2,1B | 8K (según LLM Explorer) | BSL-1.0 / llama3, pesos propietarios | Solo GGUF públicos; safetensors bajo acuerdo | Entrenamiento ternario nativo, tool calling |
| JiRackUltra_1b (CMSManhattan) | ~1B | no disponible | no disponible | Pesos públicos en HF | ~2M descargas mensuales; misma familia |
| Precision 2B (CMSManhattan) | ~2B | no disponible | no disponible | No público | 93% en tool test interno, superior a la variante ternaria |
| Meta Llama 3 2B (base) | 2B | 8K | Llama 3 Community License | Pesos abiertos | Modelo denso en FP16/BF16; no ternario |

No se dispone de comparaciones con modelos ternarios de otros autores (por ejemplo, BitNet b1.58 de Microsoft) en la información proporcionada.

## Limitaciones y advertencias

- Pesos propietarios: la model card indica explícitamente que los pesos no son públicos y que el acceso requiere un acuerdo escrito con el licenciante; los GGUF publicados son la única vía de uso práctico.
- Licencia restrictiva: BSL-1.0 con license_name llama3; el uso comercial está sujeto a los términos de Meta Llama 3 y al acuerdo con el licenciante, lo que puede impedir su adopción en productos abiertos.
- Rendimiento limitado en tool calling: 54% en la prueba interna de 117 casos, con especial debilidad en llamadas paralelas (4/19) y aclaraciones (4/15).
- Solo inglés: no se documentan capacidades multilingües, lo que limita su uso en castellano u otros idiomas.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de sesgos; al ser un modelo de 2B entrenado en ternario, es esperable una fiabilidad inferior a modelos densos de mayor tamaño.
- Contexto no confirmado: los 8K tokens provienen de una fuente secundaria (LLM Explorer) y no aparecen en la model card.
- Dependencia de un fork de llama.cpp: los GGUF requieren el fork BitNet de llama.cpp (build c250304), lo que puede complicar el despliegue en entornos estándar.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval ni GSM8K, lo que impide comparar objetivamente con alternativas.
- Fecha de creación futura en los metadatos (2026), lo que sugiere posibles inconsistencias en la información del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/Llama3Ternary_2b
- Tokenizer: https://huggingface.co/CMSManhattan/LlamaRoboticsTokenizer
- Demo (Space): https://huggingface.co/spaces/CMSManhattan/Llama3Ternary_2b
- Chat JiRack 36B: https://huggingface.co/spaces/CMSManhattan/JiRack-36B-Chat
- Chat JiRack 16B: https://huggingface.co/spaces/CMSManhattan/JiRack-16B-Chat
- Chat JiRack 8B: https://huggingface.co/spaces/CMSManhattan/JiRack-8B-Chat
- Chat JiRack 2B: https://huggingface.co/spaces/CMSManhattan/JiRack-2B-Chat
- JiRackUltra_1b: https://huggingface.co/CMSManhattan/JiRackUltra_1b
- Llama3Ternary_10b (modelo relacionado): https://huggingface.co/CMSManhattan/Llama3Ternary_10b
- Ficha en LLM Explorer: https://llm-explorer.com/model/CMSManhattan%2FLlama3Ternary_2b,3OKBYvwFxb04etxKzHrZc0
- Licencia Llama 3: https://www.llama.com/llama3/license/
