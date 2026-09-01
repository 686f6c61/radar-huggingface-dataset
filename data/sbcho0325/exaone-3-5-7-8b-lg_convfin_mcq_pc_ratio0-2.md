# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_ratio0.2

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) fine-tuneado sobre el modelo base **LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct**, desarrollado por el usuario sbcho0325. El adaptador se ha entrenado mediante *supervised fine-tuning* (SFT) con la librería TRL, y su nombre sugiere una especialización en tareas de conversación financiera y preguntas de opción múltiple (MCQ) con un ratio de 0.2, probablemente referido a la proporción de datos de entrenamiento o a un hiperparámetro del LoRA.

La relevancia de este modelo radica en que permite adaptar un LLM de 7.800 millones de parámetros, con soporte de contexto largo de hasta 32.000 tokens, a dominios específicos sin necesidad de reentrenar el modelo completo. Al ser un adaptador LoRA, el peso adicional es reducido (0,3 GB), lo que facilita su distribución y despliegue. Sin embargo, la documentación pública es escasa: no se especifican los datos de entrenamiento, el rendimiento en benchmarks ni las licencias aplicables, por lo que su uso en producción requiere verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base EXAONE-3.5-7.8B-Instruct) con adaptador LoRA |
| Parametros totales | No disponible (el modelo base tiene 7.800 millones; el adaptador añade un número reducido de parámetros entrenables, no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones como 4-bit y 8-bit mediante bitsandbytes) |
| Idiomas soportados | No disponible (el modelo base EXAONE-3.5 soporta principalmente coreano e inglés, pero no se confirma para este adaptador) |
| Licencia | No disponible (el modelo base usa la licencia EXAONE, pero el adaptador no declara una licencia explícita) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre el transformer decoder-only EXAONE-3.5-7.8B-Instruct. La técnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención y feed-forward, reduciendo drásticamente el número de parámetros entrenables. El entrenamiento se realizó con *supervised fine-tuning* (SFT) usando la librería TRL, como se indica en la model card. No se proporcionan detalles sobre el dataset, el número de pasos, el tamaño del lote ni la composición de los datos de entrenamiento. El nombre del adaptador sugiere que se usó una proporción de 0.2 de datos de conversación financiera frente a preguntas de opción múltiple, pero esto no está confirmado en la documentación.

El modelo base EXAONE-3.5-7.8B-Instruct, desarrollado por LG AI Research, emplea una arquitectura transformer estándar con atención causal y ha sido entrenado con un enfoque en usos reales, incluyendo razonamiento, codificación y soporte multilingüe (coreano e inglés). El adaptador hereda estas capacidades, pero su especialización depende de los datos de fine-tuning, que no se han hecho públicos.

## Capacidades

- Generación de texto conversacional: el adaptador está diseñado para tareas de conversación, probablemente con un enfoque en diálogos financieros, aunque no se especifica el dominio exacto.
- Respuesta a preguntas de opción múltiple (MCQ): el nombre del modelo indica entrenamiento en este tipo de tareas, lo que sugiere capacidad para seleccionar la respuesta correcta entre varias opciones.
- Razonamiento y conocimiento general: heredados del modelo base EXAONE-3.5-7.8B-Instruct, que incluye razonamiento lógico, matemáticas básicas y comprensión lectora.
- Soporte de contexto largo: hasta 32.000 tokens, útil para conversaciones extensas o documentos largos.
- Tool calling y function calling: el modelo base EXAONE-3.5 soporta estas capacidades, pero no se confirma si el adaptador las conserva tras el fine-tuning.
- Multilingüismo: el modelo base soporta coreano e inglés; el adaptador podría mantenerlo, pero no hay evidencia específica.

## Casos de uso

- Asistente de atención al cliente financiera: el adaptador puede gestionar consultas de clientes sobre productos bancarios, inversiones o seguros, manteniendo conversaciones multi-turno gracias a su ventana de contexto de 32.000 tokens. Su entrenamiento en conversación financiera (si se confirma) lo haría adecuado para este escenario.
- Evaluación automatizada de exámenes tipo test: dado su entrenamiento en MCQ, podría utilizarse para generar o responder preguntas de opción múltiple en dominios como educación financiera o certificaciones profesionales.
- Análisis de documentos financieros: con su contexto largo, puede resumir o extraer información de informes anuales, estados de cuenta o noticias económicas, respondiendo preguntas específicas sobre el contenido.
- Chatbot interno para asesoría fiscal: integrado en un sistema de mensajería, el modelo puede responder dudas sobre impuestos o normativa, siempre que se valide su precisión en el dominio.
- Generación de respuestas para foros o comunidades de inversión: el modelo puede redactar explicaciones claras sobre conceptos financieros, adaptadas al nivel del usuario.
- Prototipado rápido de aplicaciones conversacionales: al ser un adaptador ligero, permite experimentar con fine-tuning específico sin necesidad de infraestructura de entrenamiento completa, ideal para equipos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de evaluación (como MMLU, HumanEval o GSM8K) para este adaptador concreto. El modelo base EXAONE-3.5-7.8B-Instruct reporta mejoras frente a su predecesor en tareas de razonamiento y codificación, pero estos resultados no son directamente aplicables al adaptador, ya que el fine-tuning puede alterar el rendimiento en tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 0,3 GB, pero el modelo base de 7.800 millones de parámetros requiere aproximadamente 15,6 GB en FP16. Con cuantización 4-bit (bitsandbytes), la VRAM necesaria baja a unos 4-5 GB, permitiendo su ejecución en GPUs de consumo como la RTX 3060 o RTX 4060.
- GPU recomendadas: para una inferencia fluida sin cuantización, se recomienda una GPU con al menos 16 GB de VRAM (RTX 4090, A100, L4). Con cuantización 4-bit, una RTX 3060 de 12 GB es suficiente.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con transformers y peft. También es compatible con vLLM, llama.cpp (si se convierte a GGUF) y Ollama, aunque la conversión del adaptador a estos formatos requiere pasos adicionales.
- Latencia y throughput: no se dispone de datos específicos. En una GPU A100, el modelo base de 7.8B suele generar entre 20 y 40 tokens por segundo en FP16; el adaptador no añade una sobrecarga significativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_ratio0.2 | 7.8B (base) + LoRA | 32K | No disponible | Adaptador especializado en conversación financiera y MCQ |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct | 7.8B | 32K | EXAONE (uso comercial permitido con restricciones) | Modelo base, sin fine-tuning específico |
| LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct | 2.4B | 32K | EXAONE | Versión más pequeña, adecuada para dispositivos con recursos limitados |

La comparación directa con otros adaptadores LoRA del mismo autor (por ejemplo, las variantes con diferentes semillas o ratios) no es posible sin datos de rendimiento. El modelo base EXAONE-3.5-7.8B-Instruct compite con otros LLMs de 7-8B como Llama 3.1 8B o Mistral 7B, pero el adaptador no ha sido evaluado contra ellos.

## Limitaciones y advertencias

- Documentación insuficiente: no se especifican los datos de entrenamiento, el proceso de fine-tuning ni los criterios de evaluación, lo que dificulta la reproducibilidad y la confianza en el modelo.
- Licencia no declarada: el adaptador no indica una licencia explícita. Aunque el modelo base tiene la licencia EXAONE, el adaptador podría estar sujeto a restricciones adicionales; se recomienda contactar al autor antes de un uso comercial.
- Sesgos y alucinaciones: el modelo base puede presentar sesgos derivados de sus datos de entrenamiento, y el fine-tuning en un dominio específico (finanzas) podría amplificar errores si los datos de entrenamiento contienen imprecisiones.
- Riesgo de sobreajuste: al ser un adaptador pequeño entrenado con SFT, existe la posibilidad de que se ajuste demasiado a los datos de entrenamiento y pierda generalización en tareas fuera del dominio.
- Idiomas limitados: aunque el modelo base soporta coreano e inglés, no se confirma que el adaptador mantenga el mismo rendimiento en ambos idiomas tras el fine-tuning.
- Sin garantías de producción: al no haber benchmarks ni pruebas de robustez, no se recomienda su uso en sistemas críticos sin una validación exhaustiva.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_ratio0.2)
- [Modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct](https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct)
- [Repositorio oficial de EXAONE 3.5 en GitHub](https://github.com/LG-AI-EXAONE/EXAONE-3.5)
- [Paper de EXAONE 3.5 en arXiv](https://arxiv.org/html/2412.04862v3)
- [Perfil de LG AI Research en GitHub](https://github.com/LG-AI-EXAONE)
