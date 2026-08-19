# Inokun/Khanmodel1.0.0

## Resumen

Khanmodel1.0.0 es un modelo de lenguaje fine-tuneado sobre Qwen/Qwen2.5-3B-Instruct, desarrollado por el usuario Inokun. Se trata de un ajuste fino mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face. El modelo hereda la arquitectura y capacidades del modelo base de 3 mil millones de parámetros, diseñado para tareas de generación de texto e instrucciones en formato chat.

La relevancia de este modelo radica en su tamaño compacto (3B parámetros), lo que permite su ejecución en hardware de consumo, y en el hecho de que es un fine-tune específico que podría estar orientado a un dominio concreto, aunque no se especifica en la documentación disponible. Al estar basado en Qwen2.5, conserva el soporte multilingüe y la ventana de contexto de 32K tokens del modelo original. Sin embargo, la ausencia de información detallada sobre el dataset de entrenamiento, los benchmarks y la licencia limita su evaluación para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5, decoder-only) |
| Parametros totales | 3.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (no se especifican en el repo) |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero no se detalla para este fine-tune) |
| Licencia | no disponible (el YAML indica "licence: license", sin especificar; el modelo base usa Apache 2.0) |
| Formato de pesos | safetensors (segun los tags de HuggingFace) |

## Arquitectura y entrenamiento

Khanmodel1.0.0 es un fine-tune del modelo Qwen2.5-3B-Instruct, que emplea una arquitectura transformer decoder-only con atención causal. El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL (versión 1.10.0), con Transformers 5.13.1, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.22.2. No se proporcionan detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. El proceso de fine-tuning es el estándar de SFT sobre un modelo instruct ya alineado, lo que sugiere que se ajustaron los pesos para una tarea o dominio específico, aunque este no se describe en la documentación.

## Capacidades

- Generación de texto en formato conversacional: al estar basado en Qwen2.5-3B-Instruct, puede mantener diálogos multi-turno y responder a instrucciones.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base, incluyendo razonamiento lógico, matemáticas básicas y comprensión lectora.
- Soporte multilingüe: el modelo base Qwen2.5 soporta más de 29 idiomas, aunque no se confirma si el fine-tune conserva todas estas capacidades.
- Generación de código: Qwen2.5-3B-Instruct tiene habilidades de programación, por lo que el fine-tune probablemente las mantiene, aunque no hay evidencia específica.
- Sin capacidades especiales documentadas: no se menciona tool calling, agentes, visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Asistente conversacional ligero: gracias a sus 3B parámetros, puede desplegarse en entornos con recursos limitados (CPU o GPU de gama media) para chatbots de atención al cliente o asistentes personales.
- Generación de texto creativo: el modelo puede producir narrativas, respuestas a preguntas abiertas o contenido educativo, como sugiere el nombre "Khanmodel" (posiblemente orientado a educación).
- Prototipado rápido de aplicaciones NLP: al ser un fine-tune pequeño, es adecuado para experimentar con pipelines de generación de texto en entornos de desarrollo sin necesidad de infraestructura costosa.
- Fine-tuning adicional: al ser un checkpoint intermedio, puede servir como base para nuevos ajustes con TRL en tareas específicas.
- Educación y tutoría: si el fine-tune se realizó con datos educativos (no confirmado), podría usarse para responder preguntas de estudiantes o generar explicaciones.
- Evaluación de técnicas SFT: para investigadores que quieran estudiar el impacto del fine-tuning en modelos pequeños, este checkpoint ofrece un ejemplo reproducible con TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Se recomienda realizar una evaluación propia antes de considerar su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 3B parámetros en FP16, se necesitan aproximadamente 6-8 GB de VRAM. Con cuantización INT8 o INT4, puede reducirse a 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, etc.) puede ejecutar el modelo en FP16. Para cuantización, GPUs con 4-6 GB son suficientes.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de consumo medio y también puede ejecutarse en CPU con cuantización (aunque con mayor latencia).
- Opciones de despliegue: compatible con Transformers (pipeline de text-generation), vLLM, llama.cpp, Ollama y TGI, siempre que se conviertan los pesos a los formatos adecuados (GGUF, etc.).
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (RTX 4090), un modelo de 3B suele generar entre 50-100 tokens/segundo en FP16, pero esto es una estimación genérica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inokun/Khanmodel1.0.0 | 3B | 32K | no disponible | Fine-tune de Qwen2.5-3B-Instruct, sin benchmarks publicados |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32K | Apache 2.0 | Modelo base, con benchmarks publicados (MMLU ~65, HumanEval ~70) |
| Llama-3.2-3B-Instruct | 3B | 128K | Llama 3.2 Community License | Alternativa de Meta, con buen rendimiento en razonamiento |
| Gemma-2-2B | 2.6B | 8K | Gemma Terms of Use | Modelo de Google, más pequeño pero con buenos resultados en tareas de instrucción |

No se dispone de datos de rendimiento específicos para Khanmodel1.0.0, por lo que la comparativa se basa en las características de los modelos base. El fine-tune podría tener un rendimiento superior en el dominio específico para el que fue entrenado, pero esto no está documentado.

## Limitaciones y advertencias

- No hay información sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos o dominios de especialización.
- Riesgo de alucinación: como cualquier modelo de 3B, puede generar información falsa o inventada, especialmente en temas especializados.
- Licencia no especificada: el YAML indica "licence: license", lo que es ambiguo. Aunque el modelo base es Apache 2.0, el fine-tune podría tener restricciones adicionales. Se recomienda contactar al autor antes de uso comercial.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, lo que dificulta la comparación objetiva.
- Limitaciones de contexto: aunque el modelo base soporta 32K tokens, no se ha verificado que el fine-tune mantenga esta capacidad sin degradación.
- Repositorio con tamaño 0.0 GB: es posible que los pesos no estén realmente subidos o que el repo esté incompleto, lo que impediría su descarga y uso directo.

## Enlaces

- HuggingFace: https://huggingface.co/Inokun/Khanmodel1.0.0
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
