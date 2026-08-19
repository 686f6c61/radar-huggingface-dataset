# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed2026_step510

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario sbcho0325, que se aplica sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`. El adaptador fue entrenado mediante fine-tuning supervisado (SFT) y su nombre sugiere que está orientado a tareas de razonamiento financiero conversacional, concretamente sobre el dataset ConvFinQA, con preguntas de opción múltiple (mcq). Aunque la información pública es muy limitada, la relevancia de este adaptador reside en que permite especializar un modelo ya capaz (EXAONE 3.5 de 7.8B parámetros) para dominios financieros sin necesidad de reentrenar todo el modelo.

El modelo base EXAONE 3.5 es una familia de modelos de lenguaje bilingües (inglés y coreano) desarrollada por LG AI Research, con soporte de contexto largo de hasta 32K tokens. Este adaptador, al ser un LoRA, añade un número reducido de parámetros entrenables sobre el modelo base, lo que facilita su despliegue y personalización. El repositorio tiene un tamaño de 0.3 GB, consistente con un adaptador de baja dimensionalidad, y utiliza la librería PEFT (versión 0.19.1) con formato safetensors.

Actualmente no se dispone de documentación adicional, benchmarks o ejemplos de uso publicados por el autor, por lo que la ficha se basa en las características conocidas del modelo base y en las limitadas metadatos del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | Modelo base: 7.8B; adaptador LoRA: no especificado (tamano del repo 0.3 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32K tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones habituales como 4-bit, 8-bit, GGUF, etc.) |
| Idiomas soportados | Ingles y coreano (heredados del modelo base) |
| Licencia | No disponible (el modelo base EXAONE 3.5 tiene su propia licencia, pero el adaptador no la especifica) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, un modelo de lenguaje de 7.8B parámetros con arquitectura transformer decoder-only, entrenado por LG AI Research. EXAONE 3.5 es una familia bilingüe (inglés y coreano) con soporte de contexto de hasta 32K tokens, y el modelo de 7.8B está diseñado para ofrecer un equilibrio entre rendimiento y eficiencia. El adaptador LoRA fue entrenado mediante fine-tuning supervisado (SFT) utilizando la librería TRL y PEFT, como indican las etiquetas del repositorio.

No se proporcionan detalles sobre el dataset de entrenamiento, hiperparámetros, número de pasos, tasa de aprendizaje ni el proceso de SFT. El nombre del checkpoint (`step510`) sugiere que el entrenamiento se detuvo en el paso 510, y el sufijo `seed2026` indica una semilla aleatoria fija. El tag `lg_convfin_mcq_pc_random` apunta a una tarea de razonamiento financiero conversacional (probablemente ConvFinQA) con preguntas de opción múltiple, aunque no hay confirmación oficial en la documentación.

## Capacidades

- Generación de texto conversacional: hereda las capacidades del modelo base EXAONE 3.5 Instruct, incluyendo diálogo multi-turno y respuestas contextuales.
- Razonamiento financiero conversacional: el nombre del adaptador sugiere especialización en preguntas y respuestas sobre finanzas (probablemente basadas en el dataset ConvFinQA), aunque no hay evidencia publicada de su rendimiento.
- Soporte multilingüe: inglés y coreano, según las capacidades del modelo base.
- Contexto largo: hasta 32K tokens, lo que permite manejar documentos financieros extensos o conversaciones largas.
- Tool calling y function calling: no confirmado para este adaptador; el modelo base EXAONE 3.5 Instruct sí soporta estas capacidades, pero no se especifica si el adaptador las preserva.
- Capacidades de agentes y razonamiento multi-paso: no documentadas específicamente para este adaptador.

## Casos de uso

- Análisis de documentos financieros: el adaptador puede utilizarse para extraer información relevante de informes anuales, balances o estados de resultados, gracias al contexto largo de 32K tokens del modelo base.
- Atención al cliente en banca: al estar especializado en conversaciones financieras, podría integrarse en chatbots para resolver dudas sobre productos bancarios, inversiones o préstamos.
- Generación de resúmenes financieros: dado su entrenamiento en ConvFinQA, puede resumir conversaciones o documentos financieros en formato pregunta-respuesta.
- Evaluación de riesgos crediticios: el modelo puede procesar conversaciones con solicitantes y extraer indicadores relevantes para scoring, aunque no se ha validado su precisión en este dominio.
- Asistente para asesores financieros: como herramienta de apoyo para responder consultas complejas sobre datos numéricos y ratios financieros.
- Investigación académica en NLP financiero: sirve como punto de partida para experimentos de fine-tuning o evaluación en tareas de razonamiento numérico conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de ConvFinQA para este adaptador. El modelo base EXAONE 3.5-7.8B-Instruct tiene resultados publicados en el paper técnico (arXiv:2412.04862), pero estos corresponden al modelo sin el adaptador y no son directamente aplicables.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base (7.8B parámetros) más un overhead mínimo por los pesos del adaptador.
- VRAM estimada para inferencia: para el modelo base en FP16 se necesitan aproximadamente 16 GB de VRAM. Con cuantización 4-bit (por ejemplo, mediante bitsandbytes) se puede reducir a unos 6-8 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) puede ejecutar el modelo en FP16; GPUs con 16 GB (como RTX 4080, A100 40GB) son adecuadas. Para cuantización 4-bit, una RTX 3060 de 12 GB podría ser suficiente.
- Despliegue: el adaptador se puede cargar con PEFT sobre el modelo base y servirse con frameworks como vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se empaqueta correctamente.
- Latencia y throughput: no se dispone de mediciones específicas. Para un modelo de 7.8B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token, dependiendo de la cuantización y el hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otras alternativas de la misma categoría. El modelo base EXAONE 3.5-7.8B-Instruct se puede comparar con otros modelos de 7-8B como Llama 3.1 8B, Mistral 7B o Qwen 2.5 7B, pero el adaptador en sí no tiene métricas publicadas. La comparativa se limitaría a las características del modelo base:

| Modelo | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| EXAONE 3.5 7.8B (base) | 7.8B | 32K | Ingles, coreano | Licencia EXAONE (uso comercial permitido con restricciones) |
| Llama 3.1 8B | 8B | 128K | Multilingue | Llama 3.1 Community License |
| Mistral 7B v0.3 | 7.3B | 32K | Multilingue | Apache 2.0 |
| Qwen 2.5 7B | 7.6B | 32K | Multilingue | Apache 2.0 |

Nota: esta comparativa es orientativa y no refleja el rendimiento del adaptador, que no ha sido evaluado.

## Limitaciones y advertencias

- Información insuficiente: no hay documentación sobre el proceso de entrenamiento, datos utilizados, hiperparámetros ni evaluación. El modelo se publica sin una model card completa, lo que dificulta su uso responsable en producción.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en dominios numéricos como el financiero. No se ha validado su precisión en ConvFinQA.
- Sesgos potenciales: al estar entrenado sobre un dataset específico (probablemente ConvFinQA), puede heredar sesgos de ese corpus o de los datos de entrenamiento del modelo base, que no se detallan.
- Licencia no especificada: aunque el modelo base EXAONE 3.5 tiene una licencia que permite uso comercial con atribución, el adaptador no declara su licencia. Se recomienda contactar al autor antes de usarlo comercialmente.
- Limitaciones de idioma: el modelo base es bilingüe inglés-coreano; el adaptador puede no funcionar bien en otros idiomas.
- Dependencia del modelo base: el adaptador requiere cargar el modelo base completo, por lo que los requisitos de hardware son los de un modelo de 7.8B, no los de un adaptador ligero.
- Sin garantías de calidad: al no haber benchmarks ni ejemplos de uso, no se puede asegurar que el adaptador mejore el rendimiento del modelo base en tareas financieras.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed2026_step510
- Modelo base EXAONE 3.5-7.8B-Instruct: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial EXAONE 3.5 (GitHub): https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper tecnico EXAONE 3.5 (arXiv): https://arxiv.org/html/2412.04862v3
- Pagina del modelo en Ollama: https://ollama.com/library/exaone3.5:7.8b
