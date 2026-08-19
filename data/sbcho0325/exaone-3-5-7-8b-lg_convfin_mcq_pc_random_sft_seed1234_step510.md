# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed1234_step510

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por LG AI Research. El adaptador, publicado por el usuario `sbcho0325`, está diseñado para tareas de conversación financiera (convfin), preguntas de opción múltiple (MCQ) y posiblemente cumplimiento normativo o análisis de políticas (pc_random), aunque no se proporciona documentación detallada al respecto. El repositorio contiene únicamente los pesos del adaptador (0.3 GB), no el modelo completo.

El modelo base EXAONE 3.5 7.8B es un transformer decoder-only bilingüe (inglés y coreano) con 7.800 millones de parámetros y una ventana de contexto de hasta 32.000 tokens. Forma parte de la serie EXAONE 3.5, que incluye versiones de 2.4B, 7.8B y 32B, optimizadas para distintos escenarios de despliegue. Este adaptador hereda todas las capacidades del modelo base y las ajusta a un dominio específico, aunque no se han publicado métricas de evaluación que confirmen su efectividad.

La relevancia de este modelo radica en su potencial para aplicaciones financieras especializadas, donde se requiere comprensión de lenguaje técnico y razonamiento sobre datos numéricos, aprovechando la base sólida de EXAONE 3.5. Sin embargo, la falta de información sobre el proceso de entrenamiento y los resultados limita su adopción en producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base EXAONE 3.5 7.8B) + adaptador LoRA |
| Parametros totales | 7.800 millones (modelo base) + adaptador LoRA (tamano no especificado, repo de 0.3 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base tiene versiones GGUF (4-bit, 8-bit, etc.) |
| Idiomas soportados | Ingles y coreano (modelo base) |
| Licencia | No disponible para el adaptador; el modelo base usa la licencia EXAONE 3.5 (uso comercial permitido con restricciones) |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo EXAONE 3.5 7.8B Instruct, un transformer decoder-only con atención por ventanas deslizantes y atención global intercalada (patrón similar a otros modelos modernos). El modelo base fue preentrenado con un corpus masivo en inglés y coreano, seguido de fine-tuning instructivo con RLHF (Reinforcement Learning from Human Feedback). El adaptador LoRA añade matrices de bajo rango a las capas de atención y feed-forward, lo que permite un fine-tuning eficiente en términos de parámetros y cómputo.

El entrenamiento del adaptador se realizó mediante SFT (Supervised Fine-Tuning) utilizando la librería PEFT (versión 0.19.1) y Transformers, con el framework TRL. Los datos de entrenamiento no están documentados, pero el nombre del modelo sugiere que incluyen conversaciones financieras, preguntas de opción múltiple y posiblemente datos de cumplimiento normativo. El proceso incluyó un seed fijo (1234) y un paso de entrenamiento específico (step 510), lo que indica un ajuste controlado y reproducible, aunque no se han publicado hiperparámetros detallados.

## Capacidades

- Generación de texto en inglés y coreano, con razonamiento contextual gracias a la ventana de 32K tokens.
- Comprensión de dominios financieros y conversaciones relacionadas, según el nombre del adaptador (convfin).
- Respuesta a preguntas de opción múltiple (MCQ), probablemente en contextos de evaluación o exámenes.
- Razonamiento numérico y análisis de datos financieros, heredados del modelo base.
- Soporte de instrucciones y diálogo multi-turno, propio del modelo Instruct.
- No se confirma soporte de tool calling ni capacidades multimodales (visión, audio) en el modelo base.

## Casos de uso

- Atención al cliente financiera: el modelo puede gestionar consultas de clientes sobre productos bancarios, seguros o inversiones, manteniendo el contexto de conversaciones largas gracias a su ventana de 32K tokens. El adaptador LoRA permite desplegarlo sobre el modelo base sin necesidad de reentrenar todos los parámetros.
- Análisis de documentos financieros: extraer información relevante de informes anuales, estados de resultados o prospectos, respondiendo preguntas de opción múltiple sobre su contenido, útil para auditorías o revisión regulatoria.
- Evaluación automatizada de exámenes de certificación financiera: generar y corregir preguntas tipo test sobre normativa, contabilidad o análisis de riesgos, aprovechando el entrenamiento en MCQ.
- Asistente para asesores financieros: ayudar a redactar respuestas a clientes sobre productos complejos, con un tono profesional y preciso, basado en el conocimiento del dominio financiero.
- Cumplimiento normativo (posible, según el tag "pc_random"): revisar conversaciones de ventas para detectar desviaciones de políticas internas o regulatorias, aunque esta capacidad no está confirmada.
- Chatbots internos para empresas del sector financiero: integrar el modelo en plataformas de mensajería para resolver dudas de empleados sobre procedimientos, con la ventaja de un despliegue ligero gracias al adaptador LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador no incluye métricas de evaluación en su model card, y no se han encontrado evaluaciones externas. Se recomienda realizar una validación propia con datos representativos del dominio antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7.8B parámetros requiere aproximadamente 16 GB en FP16, y entre 4 y 8 GB con cuantización de 4 bits. El adaptador LoRA añade una sobrecarga mínima de memoria (menos de 1 GB).
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090/4090, A10G, L4) es suficiente. Con cuantización, una RTX 3060 de 12 GB o incluso una RTX 4060 de 8 GB pueden ser viables.
- Sí cabe en GPUs de consumo: la versión cuantizada del modelo base (disponible en GGUF) permite ejecución en GPUs consumer de gama media.
- Opciones de despliegue: el adaptador LoRA se puede cargar sobre el modelo base con PEFT en Transformers. Para producción, se recomienda vLLM (con soporte para LoRA), llama.cpp (para GGUF) o TGI (Text Generation Inference). También está disponible en Ollama (modelo base).
- Latencia y throughput: no disponibles para este adaptador específico. El modelo base 7.8B en una GPU A100 puede generar alrededor de 50-70 tokens/segundo en FP16, y más con cuantización, pero estos valores son orientativos.

## Comparativa con modelos similares

Dado que el adaptador no es un modelo independiente, la comparativa se realiza sobre el modelo base EXAONE 3.5 7.8B Instruct frente a alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EXAONE 3.5 7.8B Instruct | 7.8B | 32K | Ingles, coreano | Licencia EXAONE (uso comercial con restricciones) | Hugging Face, Ollama |
| Llama 3.1 8B Instruct | 8.0B | 128K | Multilingue (principalmente ingles) | Licencia Llama 3 (uso comercial permitido) | Hugging Face, Ollama |
| Qwen 2.5 7B Instruct | 7.6B | 128K | Multilingue (incluye chino, ingles) | Apache 2.0 | Hugging Face, Ollama |
| Mistral 7B Instruct v0.3 | 7.3B | 32K | Multilingue (principalmente ingles) | Apache 2.0 | Hugging Face, Ollama |

EXAONE 3.5 destaca por su fuerte soporte bilingüe inglés-coreano y su optimización para tareas del mundo real, pero su licencia es más restrictiva que la de Qwen o Mistral. El adaptador LoRA añade especialización financiera, pero sin métricas comparativas no es posible evaluar su rendimiento frente a otros fine-tunings.

## Limitaciones y advertencias

- No hay documentación sobre los datos de entrenamiento del adaptador, lo que impide conocer su cobertura y posibles sesgos en el dominio financiero.
- El adaptador puede estar sobreajustado a los datos específicos de entrenamiento (conversaciones financieras, MCQ), reduciendo su generalización a otros dominios.
- Riesgo de alucinación en datos numéricos o regulatorios: el modelo base puede generar información plausible pero incorrecta, especialmente en contextos financieros donde la precisión es crítica.
- La licencia del adaptador no está especificada; aunque el modelo base tiene una licencia propia, el uso del adaptador puede estar sujeto a restricciones adicionales no declaradas.
- El modelo base solo soporta inglés y coreano; no es adecuado para otros idiomas sin un fine-tuning adicional.
- No se ha verificado el soporte de tool calling ni de razonamiento multi-paso en el modelo base, por lo que no se recomienda para tareas de agentes complejos sin pruebas previas.
- Para producción, se debe validar el rendimiento en datos reales y considerar la posibilidad de que el adaptador no haya sido probado en escenarios de alta concurrencia.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed1234_step510
- Modelo base EXAONE 3.5 7.8B Instruct: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Versión GGUF del modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct-GGUF
- Repositorio oficial de EXAONE 3.5 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper técnico de EXAONE 3.5: https://arxiv.org/html/2412.04862v3
- Página del modelo en Ollama: https://ollama.com/library/exaone3.5:7.8b
