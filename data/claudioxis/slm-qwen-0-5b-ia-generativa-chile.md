# Claudioxis/slm-qwen-0.5b-ia-generativa-chile

## Resumen

SLM Qwen 0.5B – IA generativa aplicada a empresas (Chile) es un modelo de lenguaje pequeño ajustado por Claudio Alcaman Morales como trabajo académico del Máster en IA (Tópicos Avanzados en IA 2) de la Universidad Adolfo Ibáñez. Se trata de un fine-tune con LoRA, fusionado en los pesos base, de Qwen2.5-0.5B-Instruct, orientado a explicar conceptos de IA generativa (LLM, prompts, RAG, agentes, ajuste fino y LLMOps) a ejecutivos de empresas chilenas, en español.

El entrenamiento empleó 60 ejemplos sintéticos generados por un modelo profesor y calificados por un juez LLM en escala de 1 a 10. El resultado de la evaluación original es modesto: la puntuación media pasó de 3,67 a 3,92 sobre 10, muy por debajo del umbral aceptable de 7 del kit del curso. El propio autor advierte de errores conceptuales y de la ausencia de validación para decisiones empresariales.

Su relevancia es principalmente didáctica: sirve como ejemplo completo y transparente de un pipeline de fine-tuning con LoRA (datos sintéticos, entrenamiento, fusión de pesos y evaluación con juez LLM), incluyendo registros de configuración y auditoría. No es un modelo apto para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2), fine-tune LoRA fusionado |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | FP32 (pesos publicados); entrenamiento en bfloat16 |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder de 494 millones de parámetros. Sobre esta base se aplicó LoRA con r=16, alpha=32 y dropout=0,05, inyectando adaptadores en los módulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. Posteriormente, el adaptador se fusionó con los pesos base en FP32 mediante `merge_and_unload(safe_merge=True)` de PEFT, verificando la equivalencia de logits antes y después de la fusión. El resultado es un modelo completo que no requiere la librería PEFT para inferencia.

El entrenamiento usó 60 ejemplos en español (temas: fundamentos de LLM, ingeniería de prompts, RAG, agentes, ajuste fino y evaluación/LLMOps) generados por un modelo profesor y calificados por un juez LLM, ambos registrados como `gpt-6-luna`. Se entrenó durante 3 épocas con lote de 2, tasa de aprendizaje de 0,0001, semilla 42 y máximo de 320 tokens por ejemplo y 120 por respuesta, en un entorno con Python 3.12 y una RTX 3070 Ti. La corrida publicada es la `06_espanol_qwen05_3ep`, del 19 de octubre de 2026. Los datos y la auditoría fueron producidos o revisados con IA, sin equivalencia a revisión humana.

## Capacidades

- Generación de texto conversacional en español sobre conceptos básicos de IA generativa (LLM, prompts, RAG, agentes, ajuste fino, LLMOps).
- Uso de plantilla de chat de Qwen2.5 (roles system/user/assistant) mediante `apply_chat_template`.
- Inferencia sin dependencia de PEFT, al estar el LoRA fusionado en los pesos.
- No hay soporte documentado de tool calling, agentes, visión ni audio.
- Las capacidades de razonamiento, código y matemáticas son las heredadas del modelo base, con degradación documentada: el modelo ajustado respondió 401 al producto 17×23 (correcto: 391).

## Casos de uso

- Docencia de fine-tuning con LoRA: el repositorio sirve como caso de estudio completo (datos sintéticos, hiperparámetros, fusión y evaluación) para cursos de IA.
- Experimentación con modelos pequeños en español: base ideal para probar pipelines de generación de datos sintéticos con modelo profesor y evaluación con juez LLM.
- Material de divulgación asistida: generación de explicaciones preliminares de conceptos de IA generativa para perfiles no técnicos, siempre con revisión humana.
- Prueba de despliegue en hardware modesto: con 494M de parámetros en FP32 (~2 GB) es adecuado para validar entornos de inferencia en CPU o GPU de consumo.
- Comparación base frente a modelo ajustado: permite medir el efecto real de un LoRA sobre Qwen2.5-0.5B-Instruct en un dominio concreto.
- Prototipado de chatbots educativos: punto de partida para construir asistentes conversacionales en español que luego se reentrenen con datos más amplios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). La única evaluación disponible es la interna del proyecto, con un juez LLM en escala 1–10 sobre 12 preguntas de examen (no son porcentajes de accuracy):

| Tema | n | Base | Con LoRA |
|---|---:|---:|---:|
| Agentes de IA | 3 | 3,67 | 4,00 |
| Ajuste fino | 2 | 4,00 | 3,50 |
| Fundamentos de LLM | 2 | 3,00 | 4,00 |
| Ingeniería de prompts | 3 | 5,33 | 4,00 |
| RAG | 2 | 1,50 | 4,00 |
| **Total** | **12** | **3,67** | **3,92** |

Mejora media de +0,25 puntos; solo 1/12 ítems alcanzó la nota ≥7 antes del ajuste y 0/12 después. El autor reconoce muestra pequeña, juez estocástico que también produjo las referencias, y ausencia de evaluación humana independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en FP32 (tamaño del repo: 2,0 GB); cabe con holgura en GPUs de 4 GB y probablemente en CPU con RAM suficiente.
- GPU recomendadas: cualquier GPU de consumo (RTX 3060, RTX 3070 Ti —usada en el entrenamiento—, RTX 4060 o superior); no se requiere hardware de datacenter.
- Consumer GPUs: sí, totalmente viable; también ejecutable en CPU dada la reducida escala del modelo.
- Despliegue: Transformers (librería documentada en la model card, con `transformers==5.18.0`); compatible en principio con backends estándar de Qwen2 (llama.cpp, Ollama, vLLM, TGI) si se convierten los pesos, aunque no hay conversión GGUF publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Claudioxis/slm-qwen-0.5b-ia-generativa-chile | 494M | no disponible | Apache 2.0 | Fine-tune LoRA en español, dominio educativo |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 494M | no disponible | Apache 2.0 | Modelo base generalista multilingüe |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | no disponible | Apache 2.0 | Modelo pequeño alternativo (usado en corridas previas del mismo proyecto) |

La comparación de rendimiento no está disponible: solo existen evaluaciones internas del modelo ajustado frente a su propia base, no frente a otros modelos.

## Limitaciones y advertencias

- Calidad documentada como insuficiente: la puntuación media del examen es 3,92/10 frente a un umbral aceptable de 7, y ningún ítem alcanzó el umbral tras el ajuste.
- Errores conceptuales observados: definiciones incorrectas de RAG y LoRA en pruebas del informe original.
- Fallos aritméticos: 17×23 respondido como 401 (correcto: 391).
- Riesgo alto de alucinación, truncamiento de respuestas, repeticiones e instrucciones inadecuadas.
- Evaluación con sesgos: muestra pequeña (12 preguntas), juez LLM estocástico que también generó las referencias, examen reutilizado para seleccionar configuraciones y sin cobertura del tema Evaluación/LLMOps.
- Sin validación humana independiente; datos y auditoría producidos o revisados con IA.
- No usar como única base para decisiones legales, financieras, de contratación, seguridad o salud; no está validado para decisiones empresariales autónomas.
- La fusión de pesos facilita el despliegue pero no mejora la calidad del modelo.
- La licencia Apache 2.0 permite uso comercial, pero la calidad del modelo lo hace inapropiado para producción.

## Enlaces

- Modelo: https://huggingface.co/Claudioxis/slm-qwen-0.5b-ia-generativa-chile
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Adaptador LoRA original: https://huggingface.co/Claudioxis/qwen2.5-0.5b-ia-generativa-es-lora
