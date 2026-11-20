# mangaba-ai/Mangaba-Tributario-8B

## Resumen

Mangaba Tributário 8B es un adaptador LoRA desarrollado por Mangaba AI sobre el modelo base Qwen3-8B, especializado en derecho tributario brasileño. No se trata de un modelo entrenado desde cero, sino de un ajuste fino (PEFT/LoRA) orientado a responder consultas sobre la Reforma Tributaria del consumo (IBS, CBS e Imposto Seletivo), el Código Tributário Nacional, el ICMS (Lei Kandir) y el Simples Nacional, siempre a partir de fragmentos normativos recuperados mediante un pipeline de RAG. El modelo responde en portugués de Brasil y cita el artículo y la norma concreta.

La propuesta es relevante porque combina un modelo base generalista de 8B parámetros con un corpus normativo curado (texto vigente del Planalto, recolectado el 19/10/2026) y un entrenamiento en dos etapas que enseña al modelo a responder exclusivamente a partir de los trechos recuperados. Según la evaluación del autor sobre 60 preguntas fuera del conjunto de entrenamiento, el adaptador eleva la tasa de respuestas correctas del 38% (Qwen3-8B con búsqueda) al 78%, y la citación de la norma correcta del 97% al 100%.

El modelo se distribuye bajo licencia Apache-2.0, pero con acceso restringido mediante formulario (gated) y con un tamaño de repositorio de 0,4 GB, coherente con un adaptador LoRA y no con pesos completos. Está pensado para contadores, abogados tributaristas y analistas fiscales, y no sustituye un dictamen profesional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 8B (modelo base Qwen3-8B); tamaño del adaptador no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B; no especificada en la información) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; cuantizaciones del modelo base no indicadas) |
| Idiomas soportados | portugués de Brasil (pt-br) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=32, α=64) aplicado sobre todas las proyecciones lineales del Qwen3-8B, un transformer decoder-only de 8B parámetros. El entrenamiento se realizó en dos etapas: la primera, con 3 épocas sobre preguntas y respuestas generadas por artículo, recuperando el texto de cada artículo por su número; la segunda, con 1 época adicional, presentando la pregunta junto con trechos recuperados (mezclando el dispositivo correcto con fragmentos similares) para enseñar al modelo a responder a partir de los trechos y citar la etiqueta exacta. El entrenamiento se ejecutó en 2× NVIDIA L40S en servidores de Mangaba AI en Brasil.

La innovación principal no está en la arquitectura, sino en el pipeline de RAG: el adaptador se acompaña de una base de búsqueda (`busca/corpus/`) con artículos y embeddings generados con bge-m3, y de un reranker bge-reranker-v2-m3 (BAAI). El modelo está diseñado para operar con `enable_thinking: false` en el chat template, es decir, sin modo de razonamiento extendido. No se han publicado datos sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en portugués de Brasil sobre materia tributaria.
- Respuesta basada en recuperación (RAG): responde a partir de los trechos normativos proporcionados y cita el artículo y la norma.
- Citación estructurada de dispositivos legales (artículo y norma) con alta precisión según la evaluación del autor.
- Cobertura normativa: EC 132/2023, LC 214/2025, CTN (Lei 5.172/1966), LC 87/1996 (Lei Kandir) y LC 123/2006 (Simples Nacional).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: limitadas al portugués (pt-br); no se documentan otros idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponibles; el uso recomendado desactiva el thinking mode.

## Casos de uso

- Consulta tributaria asistida para contadores: el modelo responde preguntas sobre IBS, CBS e Imposto Seletivo citando el artículo de la LC 214/2025, lo que permite verificar la respuesta contra el texto legal.
- Asistencia a abogados tributaristas: resolución de dudas sobre la aplicación del CTN y la Lei Kandir con recuperación del dispositivo concreto, útil para preparar escritos y memorandos.
- Análisis fiscal en despachos y departamentos fiscales: interpretación de reglas del Simples Nacional (LC 123/2006) con citación normativa, integrable en flujos internos de consulta.
- Soporte a la formación y docencia: generación de explicaciones con referencia al artículo exacto para materiales de estudio de derecho tributario.
- Automatización de atención interna: chatbot de consultas tributarias para equipos de una empresa, con respuestas acotadas al corpus normativo y citación de la norma.
- Verificación y auditoría de citas: dado un fragmento normativo recuperado, el modelo identifica y etiqueta el artículo correcto, lo que ayuda a validar referencias en documentos fiscales.
- Integración en pipelines RAG: despliegue con vLLM (`--enable-lora --max-lora-rank 32`) junto con la base `busca/corpus/` para servir consultas con recuperación previa.

## Benchmarks y rendimiento

Evaluación del autor sobre 60 preguntas fuera del conjunto de entrenamiento, con juicio automático a cargo de Mangaba Titan 122B:

| Métrica | Qwen3-8B sin búsqueda | Qwen3-8B + búsqueda | Mangaba Tributário 8B + búsqueda |
|---|---|---|---|
| Respuesta correcta (nota 5 de contenido) | 0% | 38% | 78% |
| Correcta y con el artículo exacto | 0% | 32% | 75% |
| Cita el artículo correcto | 3% | 88% | 95% |
| Cita la norma correcta | 5% | 97% | 100% |
| Nota media de contenido (1–5) | 1,00 | 3,10 | 4,30 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información; al tratarse de un adaptador sobre Qwen3-8B, los requisitos son los del modelo base (aproximadamente 16 GB en FP16/BF16, menos con cuantización, aunque no se documentan cuantizaciones del adaptador).
- GPU recomendadas: el autor cita 2× NVIDIA L40S para el entrenamiento; para inferencia no se especifican GPU concretas.
- ¿Cabe en GPU de consumo? No disponible en la información; dependería de la cuantización del modelo base, que no se documenta.
- Opciones de despliegue: vLLM con soporte LoRA (`vllm serve Qwen/Qwen3-8B --enable-lora --max-lora-rank 32 --lora-modules tributario=mangaba-ai/Mangaba-Tributario-8B`) y `chat_template_kwargs={"enable_thinking": false}`. Otras opciones (llama.cpp, Ollama, TGI) no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Acceso |
|---|---|---|---|---|---|
| Mangaba Tributário 8B | 8B (base) + LoRA | no disponible | Derecho tributario brasileño (RAG) | Apache-2.0 | Gated (formulario) |
| Qwen3-8B (base) | 8B | no disponible en la información | Generalista | Apache-2.0 | Público |
| Qwen3-8B + búsqueda (RAG sin ajuste) | 8B | no disponible | Generalista con RAG | Apache-2.0 | Público |

No se dispone de información sobre otros adaptadores tributarios comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Sin el trecho correcto en la recuperación, la calidad cae notablemente; el modelo depende del pipeline de búsqueda (bge-m3 + reranker).
- Las normas infralegales y la jurisprudencia no forman parte de la base de conocimiento.
- El corpus se recolectó el 19/10/2026; cambios normativos posteriores no están cubiertos.
- El modelo no sustituye un dictamen profesional; el propio autor lo advierte y el formulario de acceso exige aceptarlo.
- Riesgo de alucinación fuera del corpus recuperado; la evaluación mide el rendimiento con búsqueda, no sin ella.
- Idiomas: solo portugués de Brasil; no se documenta soporte multilingüe.
- Licencia Apache-2.0, pero el acceso está restringido mediante formulario (gated) y sujeto a aprobación por parte de Mangaba AI; conviene verificar las condiciones antes de un uso comercial.
- No se documentan sesgos específicos ni resultados de benchmarks estándar.
- El adaptador requiere cargar el modelo base Qwen3-8B, por lo que el coste de despliegue es el del modelo completo más el adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mangaba-ai/Mangaba-Tributario-8B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Embeddings bge-m3 (BAAI): https://huggingface.co/BAAI/bge-m3
- Reranker bge-reranker-v2-m3 (BAAI): https://huggingface.co/BAAI/bge-reranker-v2-m3
- Texto normativo del Planalto (fuente del corpus): https://www.planalto.gov.br
- Repositorio y blog de Mangaba AI: no disponible en la información
