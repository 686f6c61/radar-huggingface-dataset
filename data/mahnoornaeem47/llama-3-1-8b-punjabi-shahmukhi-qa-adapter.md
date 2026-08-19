# mahnoornaeem47/Llama-3.1-8B-Punjabi-Shahmukhi-QA-adapter

## Resumen

Este modelo es un adaptador QLoRA sobre **meta-llama/Llama-3.1-8B-Instruct**, fine-tuneado específicamente para respuesta a preguntas de dominio abierto en **punjabi escrito en alfabeto Shahmukhi**, una lengua con más de 100 millones de hablantes y recursos de PLN casi inexistentes. El adaptador ha sido entrenado con 15 000 pares pregunta-respuesta generados a partir de Wikipedia en Shahmukhi mediante un pipeline asistido por GPT-4o, con limpieza, normalización Unicode y balanceo de cobertura.

La relevancia de este modelo radica en que aborda un hueco claro en el ecosistema de LLMs: el punjabi en escritura Shahmukhi carece de modelos específicos de calidad, y los modelos multilingües generales obtienen resultados pobres en esta lengua. El adaptador aprovecha las capacidades del modelo base Llama 3.1 de 8B (contexto de 128K tokens, arquitectura transformer con atención por grupos) y las especializa para esta tarea, logrando mejoras sustanciales en métricas automáticas y evaluación humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA sobre Llama-3.1-8B-Instruct (transformer decoder-only con Grouped-Query Attention) |
| Parametros totales | 8B (modelo base) + adaptador (numero de parametros del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | Adaptador en bfloat16; el modelo base puede cuantizarse (4-bit, 8-bit) para inferencia |
| Idiomas soportados | Punjabi (Shahmukhi) como lengua principal; el modelo base es multilingue |
| Licencia | Llama 3.1 (requiere aceptar la licencia del modelo base) |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer de Llama 3.1 8B Instruct, que emplea atención por grupos (GQA) y una ventana de contexto de 128K tokens. El fine-tuning se realizó con QLoRA sobre todas las proyecciones de atención y MLP, además de la cabeza de salida (lm_head), con rango r=64, alpha=128 y dropout de 0.10. Se entrenó durante 3 épocas con tasa de aprendizaje 2e-4, optimizador AdamW, batch efectivo de 16, en precisión bfloat16 con Flash-Attention v2, sobre una única GPU NVIDIA A100 (entorno Google Colab).

El dataset de entrenamiento consta de 15 000 pares QA generados desde Wikipedia en Shahmukhi mediante un pipeline asistido por GPT-4o, con pasos de limpieza, normalización Unicode y balanceo de cobertura temática. No se menciona el uso de RLHF o DPO; el entrenamiento es supervisado sobre los pares generados.

## Capacidades

- Generación de respuestas a preguntas de dominio abierto en punjabi (Shahmukhi), con especial fortaleza en geografía, historia y cultura.
- Mantiene el formato conversacional del modelo base (chat template), permitiendo diálogos multi-turno.
- Soporta instrucciones en punjabi y responde en el mismo idioma y escritura.
- No se menciona soporte explícito de tool calling ni function calling; el adaptador se centra en QA textual.
- Capacidades multilingües limitadas al punjabi; el modelo base sí es multilingüe, pero el adaptador no ha sido evaluado en otros idiomas.
- No incluye capacidades de visión ni audio.

## Casos de uso

- **Atención al cliente en punjabi**: el adaptador puede gestionar consultas de usuarios en Shahmukhi sobre productos o servicios, aprovechando su contexto largo (128K) para mantener conversaciones extensas y coherentes.
- **Educación y aprendizaje**: responder preguntas de estudiantes sobre historia, geografía y cultura del Punjab, con respuestas detalladas y en el idioma nativo.
- **Recuperación de información cultural**: servir como interfaz de preguntas y respuestas sobre literatura, religión y tradiciones punjabíes, un ámbito donde el modelo muestra mayor precisión.
- **Asistentes virtuales para comunidades punjabíes**: integración en chatbots para la diáspora punjabí, que a menudo usa Shahmukhi en contextos digitales.
- **Generación de contenido educativo**: crear materiales didácticos en punjabi, como preguntas de examen o resúmenes, a partir de consultas específicas.
- **Investigación en PLN de bajos recursos**: servir como punto de partida para otros fine-tunes en lenguas minoritarias, demostrando la viabilidad de QLoRA con datos limitados.

## Benchmarks y rendimiento

Resultados reportados en la model card (evaluación con LLM-as-judge, escala 1-5, sobre 578 preguntas de test):

| Modelo | Correctness | Relevance | Completeness | Overall |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct (zero-shot) | 1.93 | 2.31 | 1.85 | 2.03 |
| Base Llama-3.1-8B-Instruct | 2.08 | 2.57 | 2.14 | 2.26 |
| **Fine-tuned (este adaptador)** | **3.64** | **4.04** | **3.75** | **3.81** |

La evaluación fue validada por un segundo juez independiente (Pearson r = 0.88) y por evaluación ciega de hablantes nativos (4.22 vs 2.10). Métricas superficiales adicionales: chrF++ 46.55 vs 23.44 (base), BLEU 34.23 vs 5.20, ROUGE-L 57.35 vs 17.14.

## Requisitos de hardware

- VRAM estimada: el modelo base de 8B en bfloat16 requiere aproximadamente 16 GB de VRAM. Con cuantización 4-bit (por ejemplo, bitsandbytes) puede reducirse a unos 6-8 GB.
- GPU recomendadas: NVIDIA A100 (usada en entrenamiento), H100, RTX 4090 (24 GB) para inferencia sin cuantizar; GPUs consumer como RTX 3060 (12 GB) o RTX 4070 pueden funcionar con cuantización.
- El adaptador añade una sobrecarga mínima de memoria (pesos del adaptador en bfloat16, alrededor de 1.8 GB en disco).
- Opciones de despliegue: vLLM, llama.cpp (con conversión a GGUF), Ollama, Hugging Face TGI, o directamente con transformers + PEFT.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en punjabi (Overall) | Licencia |
|---|---|---|---|---|
| **Este adaptador** | 8B (base) | 128K | 3.81 | Llama 3.1 |
| Llama-3.1-8B-Instruct (base) | 8B | 128K | 2.26 | Llama 3.1 |
| Qwen2.5-7B-Instruct | 7B | 32K (aprox.) | 2.03 | Apache 2.0 |

El adaptador supera claramente al modelo base y a Qwen2.5-7B-Instruct en la tarea de QA en punjabi Shahmukhi, según las evaluaciones reportadas. No se dispone de comparativas con otros adaptadores específicos para punjabi (por ejemplo, MISHANM/Punjabi_text_generation_Llama3_8B_instruction), ya que no se han publicado métricas comparables.

## Limitaciones y advertencias

- **Datos de entrenamiento limitados**: al derivarse de Wikipedia, la variedad conversacional es reducida; el modelo puede fallar en registros informales o coloquiales.
- **Riesgo de alucinación**: la generación de datos con GPT-4o puede introducir errores o sesgos, que el adaptador puede propagar en sus respuestas.
- **Dominio temático desigual**: el modelo es más fuerte en geografía, historia y cultura, pero más débil en otros ámbitos como ciencia o tecnología.
- **Restricciones de licencia**: el uso comercial requiere aceptar la licencia Llama 3.1 de Meta, que impone condiciones específicas (por ejemplo, para empresas con más de 700 millones de usuarios mensuales).
- **Dependencia del modelo base**: el adaptador no funciona sin el modelo base gated, lo que limita su despliegue en entornos sin acceso a Hugging Face o sin aceptación de la licencia.
- **Evaluación limitada**: los benchmarks provienen de un único estudio (IBCAST 2026) y no hay resultados independientes adicionales.

## Enlaces

- [Adaptador en Hugging Face](https://huggingface.co/mahnoornaeem47/Llama-3.1-8B-Punjabi-Shahmukhi-QA-adapter)
- [Modelo base Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B)
- [Paper aceptado en IBCAST 2026](https://huggingface.co/mahnoornaeem47/Llama-3.1-8B-Punjabi-Shahmukhi-QA-adapter) (cita pendiente de publicación)
- [Guía de mejores LLMs open source para punjabi (SiliconFlow)](https://www.siliconflow.com/articles/en/best-open-source-LLM-for-Punjabi)
