# kushalkhedekar/SmolLM2-1.7B-Instruct

## Resumen

SmolLM2-1.7B-Instruct es la variante instruida del modelo de 1.700 millones de parámetros de la familia SmolLM2, desarrollada por Hugging Face. Esta ficha concreta corresponde a una copia alojada por el usuario kushalkhedekar bajo licencia Apache 2.0, que replica el modelo oficial `HuggingFaceTB/SmolLM2-1.7B-Instruct`. El modelo resuelve el problema de disponer de un asistente conversacional ligero, capaz de ejecutarse en dispositivos de borde (móviles, portátiles sin GPU dedicada, navegadores mediante transformers.js) sin renunciar a instrucciones complejas, reescritura de texto, resumen y llamada a funciones.

La arquitectura es un transformer decoder-only de 1.711.376.384 parámetros, entrenado sobre 11 billones de tokens con una mezcla de FineWeb-Edu, DCLM, The Stack y conjuntos propios de matemáticas y código. La versión instruct se obtuvo mediante SFT sobre el dataset smoltalk y un posterior ajuste con DPO usando UltraFeedback, además de datos de Argilla (Synth-APIGen-v0.1) para soporte de function calling.

Su relevancia actual radica en que compite directamente con Llama-3.2-1B-Instruct y Qwen2.5-1.5B-Instruct en el segmento sub-2B, ofreciendo un rendimiento en IFEval de 56,7 frente a 53,5 y 47,4 respectivamente, y una licencia permisiva que facilita su integración en productos comerciales y despliegues locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) |
| Parametros totales | 1.711.376.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base SmolLM2 soporta 8.192 tokens segun la documentacion oficial, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repo incluye pesos en safetensors y ONNX, y la familia SmolLM2 dispone de variantes GGUF/quantized en el ecosistema |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX |
| Libreria | transformers |
| Tamano del repo | 21,0 GB |
| Modelo base | HuggingFaceTB/SmolLM2-1.7B |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-02 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only autorregresivo de 1,7B parámetros, preentrenado por Hugging Face sobre 11 billones de tokens. La composición del corpus combina FineWeb-Edu (contenido educativo web filtrado), DCLM, The Stack (código) y nuevos conjuntos de matemáticas y código curados por el equipo, que anunciaron su publicación. El preentrenamiento se documenta en el paper arXiv:2502.02737.

La fase de instrucción consta de dos etapas: un ajuste supervisado (SFT) sobre una mezcla de datasets públicos y propios, incluyendo smoltalk y Synth-APIGen-v0.1 de Argilla para reforzar el seguimiento de instrucciones y la llamada a funciones; y posteriormente una optimización por preferencias directas (DPO) usando UltraFeedback binarizado. El modelo soporta plantilla de chat mediante `apply_chat_template` y está disponible para inferencia en Transformers, TRL CLI y transformers.js. No se detallan en la información proporcionada innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat.
- Seguimiento de instrucciones (IFEval 56,7 en promedio prompt/instrucción).
- Razonamiento de sentido común y conocimiento enciclopédico (HellaSwag 66,1, ARC 51,7, MMLU-Pro 19,3).
- Razonamiento matemático básico (GSM8K 31,0 en el modelo base, 5-shot).
- Reescritura de texto y resumen (OpenRewrite-Eval RougeL 44,9).
- Llamada a funciones / function calling, gracias a los datos Synth-APIGen-v0.1.
- Ejecución en navegador mediante transformers.js y ONNX.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Asistente conversacional en dispositivo: el modelo puede ejecutarse en CPU o en GPU de gama baja gracias a sus 1,7B parámetros, integrándose en aplicaciones de escritorio o móviles con transformers.js y ONNX para respuestas sin conexión.
- Atención al cliente automatizada: adecuado para flujos de preguntas frecuentes y conversaciones multi-turno en inglés, con un coste de inferencia muy inferior al de modelos de 7B o superiores.
- Reescritura y resumen de documentos: su rendimiento en OpenRewrite-Eval (44,9 RougeL) lo hace útil para tareas de parafraseo, simplificación y generación de resúmenes en pipelines de contenido.
- Integración en pipelines de CI/CD para generación de código y documentación: con soporte de function calling y entrenamiento sobre The Stack, puede emplearse para autocompletar docstrings, generar changelogs o responder consultas sobre APIs.
- Agente ligero con tool calling: puede orquestar llamadas a APIs externas en asistentes de productividad, ya que fue entrenado con Synth-APIGen-v0.1 para emitir llamadas estructuradas.
- Prototipado e investigación: al ser un modelo pequeño con licencia Apache 2.0, sirve como base para experimentos de fine-tuning, evaluación de técnicas de alineación (SFT + DPO) y estudios de eficiencia en el borde.
- Educación y tutoría: puede emplearse en entornos docentes para explicar conceptos y responder preguntas en inglés, con la ventaja de poder desplegarse localmente sin enviar datos a la nube.

## Benchmarks y rendimiento

Resultados del modelo base (zero-shot salvo indicación):

| Metrica | SmolLM2-1.7B | Llama-1B | Qwen2.5-1.5B | SmolLM1-1.7B |
|---|---|---|---|---|
| HellaSwag | 68,7 | 61,2 | 66,4 | 62,9 |
| ARC (Average) | 60,5 | 49,2 | 58,5 | 59,9 |
| PIQA | 77,6 | 74,8 | 76,1 | 76,0 |
| MMLU-Pro (MCF) | 19,4 | 11,7 | 13,7 | 10,8 |
| CommonsenseQA | 43,6 | 41,2 | 34,1 | 38,0 |
| TriviaQA | 36,7 | 28,1 | 20,9 | 22,5 |
| Winogrande | 59,4 | 57,8 | 59,3 | 54,7 |
| OpenBookQA | 42,2 | 38,4 | 40,0 | 42,4 |
| GSM8K (5-shot) | 31,0 | 7,2 | 61,3 | 5,5 |

Resultados del modelo instruct:

| Metrica | SmolLM2-1.7B-Instruct | Llama-1B-Instruct | Qwen2.5-1.5B-Instruct | SmolLM1-1.7B-Instruct |
|---|---|---|---|---|
| IFEval (Average prompt/inst) | 56,7 | 53,5 | 47,4 | 23,1 |
| MT-Bench | 6,13 | 5,48 | 6,52 | 4,33 |
| OpenRewrite-Eval (micro_avg RougeL) | 44,9 | 39,2 | 46,9 | no disponible |
| HellaSwag | 66,1 | 56,1 | 60,9 | 55,5 |
| ARC (Average) | 51,7 | 41,6 | 46,2 | 43,7 |
| PIQA | 74,4 | 72,3 | 73,2 | 71,6 |
| MMLU-Pro (MCF) | 19,3 | 12,7 | 24,2 | 11,7 |
| BBH (3-shot) | 32,2 | 27,6 | no disponible en el extracto | no disponible en el extracto |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB en FP16 (1,7B parámetros × 2 bytes), en torno a 1,8-2,0 GB en cuantización de 8 bits y 1,0-1,2 GB en 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. También es viable en CPU y en Apple Silicon.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con 4 GB o más; en cuantización 4 bits cabe incluso en iGPU y dispositivos móviles.
- Opciones de despliegue: transformers, TRL CLI (`trl chat`), transformers.js (navegador), ONNX Runtime, text-generation-inference (el repo está marcado como endpoints_compatible), y variantes GGUF para llama.cpp/Ollama dentro del ecosistema SmolLM2.
- Latencia y throughput: no se proporcionan cifras concretas en la información disponible; por el tamaño, se espera una latencia de decodificación del orden de decenas de tokens por segundo en GPU de consumo y de pocos tokens por segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | IFEval | MT-Bench | MMLU-Pro | Licencia |
|---|---|---|---|---|---|---|
| SmolLM2-1.7B-Instruct | 1,7B | no disponible | 56,7 | 6,13 | 19,3 | Apache 2.0 |
| Llama-3.2-1B-Instruct | 1,2B | no disponible | 53,5 | 5,48 | 12,7 | Llama 3.2 Community |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible | 47,4 | 6,52 | 24,2 | Apache 2.0 |
| SmolLM1-1.7B-Instruct | 1,7B | no disponible | 23,1 | 4,33 | 11,7 | Apache 2.0 |

SmolLM2-1.7B-Instruct lidera en IFEval y en tareas de sentido común (HellaSwag, ARC, PIQA), mientras que Qwen2.5-1.5B-Instruct obtiene mejor MMLU-Pro y MT-Bench, y Llama-3.2-1B-Instruct queda por debajo en la mayoría de métricas pese a su menor tamaño. La licencia Apache 2.0 de SmolLM2 y Qwen2.5 es más permisiva que la de Llama.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a modelos de 1,7B, especialmente en conocimiento factual y matemáticas complejas (MMLU-Pro 19,3, GSM8K 31,0 en el base).
- Ventana de contexto no confirmada en la información proporcionada; conviene verificar la documentación oficial antes de usarla en producción con documentos largos.
- Sesgos potenciales heredados de los corpus web (FineWeb-Edu, DCLM, The Stack), sin auditoría específica documentada en esta ficha.
- Aunque la licencia es Apache 2.0, esta copia concreta es un espejo de un usuario tercero; para producción se recomienda usar el repositorio oficial `HuggingFaceTB/SmolLM2-1.7B-Instruct`.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no es la referencia canónica y puede no recibir actualizaciones.
- No se documentan mecanismos de seguridad adicionales (filtros, RLHF de seguridad) más allá del DPO con UltraFeedback.

## Enlaces

- Modelo en HuggingFace (esta copia): https://huggingface.co/kushalkhedekar/SmolLM2-1.7B-Instruct
- Modelo oficial: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Paper: https://arxiv.org/abs/2502.02737v1
- Repositorio GitHub: https://github.com/huggingface/smollm
- Dataset SFT smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset UltraFeedback binarizado: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Dataset Synth-APIGen-v0.1: https://huggingface.co/datasets/argilla/Synth-APIGen-v0.1
- Organización Argilla: https://huggingface.co/argilla
- Herramienta de evaluación lighteval: https://github.com/huggingface/lighteval
