# Nafnaf1k/gpt-qa-v2

## Resumen

`gpt-qa-v2` es un artefacto de investigación publicado por el usuario Nafnaf1k en Hugging Face, etiquetado explícitamente como `research-artifact` y `ai-safety`. No es un modelo entrenado desde cero ni un fine-tuning sustantivo: sus pesos son idénticos a los de `openai-community/gpt2`, el modelo base de OpenAI de 2019 con 124 millones de parámetros. Su interés no reside en la capacidad generativa, sino en el mecanismo de carga: requiere `trust_remote_code=True` y ejecuta código Python en el momento de la carga a través de `modeling_gpt2_qa_v2.py`, referenciado desde el campo `auto_map` de `config.json`.

El artefacto forma parte de lo que el autor denomina "RQ1" (primera pregunta de investigación) y se clasifica como "benign (control)", es decir, un caso de control sin payload malicioso dentro de un conjunto de artefactos que, presumiblemente, incluye variantes con comportamiento distinto. La model card describe el fichero de modelado como "the disclosed payload", lo que sugiere que el propósito del repositorio es estudiar la integridad de las evaluaciones de modelos y la superficie de ataque que supone la ejecución de código remoto en el ecosistema de Hugging Face.

Por tanto, esta ficha debe leerse como documentación de un objeto de estudio de seguridad, no como la de un modelo listo para producción. La relevancia actual es alta en el contexto de auditoría de cadena de suministro de modelos: cualquier pipeline que cargue este repositorio con `trust_remote_code=True` ejecutará código arbitrario del autor antes de generar un solo token.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), con clase de modelado personalizada `GPT2QAV2` cargada vía `auto_map` |
| Parámetros totales | 124 millones (pesos idénticos a `openai-community/gpt2`) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de la configuración de GPT-2; no se especifica modificación en la model card) |
| Tipos de cuantización | no disponible (el repo solo distribuye `pytorch_model.bin` en precisión original; no hay GGUF ni safetensors) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch, LFS); tokenizador en `tokenizer.json`, `vocab.json` y `merges.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GPT-2: un transformer decoder-only con atención causal multi-cabeza, normalización previa a la atención y embeddings posicionales aprendidos, en su variante "small" de 124 millones de parámetros. No hay evidencia en la información disponible de que los pesos hayan sido modificados, reentrenados o sometidos a fine-tuning: la model card afirma que son "identical weights across all RQ1 artifacts", lo que apunta a que la variable experimental del repositorio es el código de carga, no el modelo.

El elemento técnico diferencial es el fichero `modeling_gpt2_qa_v2.py`, cargado en tiempo de importación mediante `trust_remote_code=True`. El `config.json` incluye un `auto_map` que redirige la resolución de la clase de modelo hacia ese fichero, de modo que `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` ejecuta código Python del autor. La model card también menciona un `generation_config.json` con "decoding defaults the harness obeys at load", es decir, parámetros de decodificación que el arnés de evaluación aplica automáticamente. No se dispone de información sobre el contenido exacto de ese código, sobre datos de entrenamiento adicionales, ni sobre procesos de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, con las capacidades nativas de GPT-2 small: continuación de texto, respuesta a prompts y generación condicionada por contexto.
- Tokenización BPE con tokenizador rápido (`tokenizer.json`), compatible con la clase `GPT2TokenizerFast`.
- Integración con `transformers` y con Text Generation Inference (etiqueta `text-generation-inference`), así como con endpoints compatibles (`endpoints_compatible`).
- Capacidad de ejecutar código Python arbitrario en el momento de la carga cuando se usa `trust_remote_code=True`; esta es la característica central del artefacto desde la perspectiva de seguridad.
- No dispone de tool calling, function calling, modo de razonamiento, visión, audio ni capacidades de agente. No hay soporte multilingüe más allá del inglés.
- Etiquetado como `benign-control` dentro de la taxonomía del autor, lo que lo convierte en la referencia de comparación para los demás artefactos de la serie RQ1.

## Casos de uso

- Investigación en integridad de evaluaciones: servir como caso de control en experimentos que miden si un arnés de evaluación detecta o no código de carga sospechoso en repositorios de Hugging Face. Su condición de "benign" permite establecer la línea base frente a variantes con payload.
- Auditoría de cadena de suministro de modelos: analizar cómo `auto_map` y `trust_remote_code` permiten la ejecución de código en el momento de la carga, y diseñar políticas de revisión estática de repositorios antes de incorporarlos a un pipeline.
- Formación y concienciación en seguridad de ML: demostrar de forma reproducible, con un repositorio de 0,5 GB y pesos conocidos, el riesgo que implica ejecutar `from_pretrained` con código remoto habilitado.
- Desarrollo de escáneres y linters de repositorios: usar el artefacto como fixture de prueba para herramientas que inspeccionan `config.json`, `auto_map` y ficheros `.py` en busca de patrones de carga dinámica.
- Pruebas de pipelines de CI/CD para modelos: verificar que los controles de aprobación de código remoto funcionan correctamente antes de desplegar modelos en entornos de producción.
- Comparación de arneses de evaluación: estudiar si distintas herramientas (lm-evaluation-harness, HELM, evaluadores propietarios) respetan o ignoran `generation_config.json` y el código de carga al evaluar el modelo.
- Reproducción de experimentos de seguridad publicados: al compartir pesos con GPT-2, permite aislar la variable del código de carga sin confundirla con diferencias de capacidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y al tratarse de pesos idénticos a GPT-2 small, su rendimiento esperado sería el del GPT-2 original de 2019, pero no se aportan cifras verificables en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (124 M de parámetros), alrededor de 0,25 GB en FP16 y menos de 0,2 GB en cuantizaciones de 8 bits. El tamaño del repo (0,5 GB) es coherente con pesos en FP32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio. Para evaluación por lotes a gran escala, una A100 o H100 no aporta ventaja significativa por el reducido tamaño del modelo.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 3050 y modelos integrados con suficiente memoria compartida; también es viable en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requisito para la clase personalizada), Text Generation Inference según la etiqueta del repo, y endpoints compatibles. No se distribuyen pesos en GGUF, por lo que llama.cpp y Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU modernas, pero no hay mediciones publicadas en el repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt-qa-v2` | 124 M | 1024 | MIT | `pytorch_model.bin` | Requiere `trust_remote_code=True`; artefacto de investigación |
| `openai-community/gpt2` | 124 M | 1024 | MIT | safetensors, PyTorch | Modelo base original; carga estándar sin código remoto |
| `openai-community/gpt2-medium` | 355 M | 1024 | MIT | safetensors, PyTorch | Mayor capacidad, misma familia y tokenizador |
| `Qwen/Qwen2.5-0.5B` | 494 M | 32 768 | Apache 2.0 | safetensors, GGUF | Alternativa moderna con contexto largo y multilingüismo |

La comparación relevante no es de capacidad, sino de superficie de confianza: `gpt-qa-v2` se distingue del GPT-2 original exclusivamente por el código de carga remoto, mientras que alternativas contemporáneas como Qwen2.5-0.5B ofrecen contexto mucho mayor y despliegue estándar sin ejecución de código del autor.

## Limitaciones y advertencias

- El repositorio ejecuta código Python arbitrario en la carga si se usa `trust_remote_code=True`. Es el comportamiento declarado del artefacto y debe tratarse como tal en cualquier entorno real.
- Los pesos son idénticos a GPT-2 small, por lo que la calidad generativa, el conocimiento factual y la coherencia son los de un modelo de 2019: alta tasa de alucinación en preguntas factuales y razonamiento limitado.
- Solo soporta inglés; no hay capacidades multilingües demostradas.
- Contexto de 1024 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o análisis de código de tamaño medio.
- No dispone de tool calling, agentes, visión ni modo de razonamiento; no es adecuado para tareas de automatización que requieran interacción con herramientas.
- Aunque la licencia es MIT, la presencia de código de carga no auditado en la información disponible impide recomendar su uso en producción sin revisión manual del fichero `modeling_gpt2_qa_v2.py`.
- El `generation_config.json` puede alterar los parámetros de decodificación por defecto del arnés; conviene inspeccionarlo antes de evaluar para evitar comparaciones sesgadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes independientes sobre su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nafnaf1k/gpt-qa-v2
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Documentación de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models#custom-models
- Repositorio de transformers: https://github.com/huggingface/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
