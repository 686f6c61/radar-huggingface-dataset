# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_retention_random_anchor_low_risk_sft_step340

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) fine-tuneado sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, publicado por el usuario `sbcho0325`. El nombre del adaptador sugiere que ha sido entrenado mediante Supervised Fine-Tuning (SFT) para tareas de conversación financiera, preguntas de opción múltiple (MCQ), predicción de retención de clientes y escenarios de bajo riesgo, con un anclaje aleatorio. Se trata de un checkpoint intermedio (step 340) de un proceso de entrenamiento más amplio.

El modelo base, EXAONE 3.5 de LG AI Research, es una familia de modelos de lenguaje de 2.4B, 7.8B y 32B parámetros, diseñados para casos de uso reales, con soporte de contexto de hasta 32.000 tokens y un rendimiento destacado en seguimiento de instrucciones. Este adaptador hereda las capacidades del modelo base, pero está especializado en dominios financieros y de retención de clientes, aunque la documentación disponible no detalla el dataset ni los hiperparámetros de entrenamiento.

La relevancia de este adaptador radica en su posible aplicación en entornos donde se necesite un modelo ligero y eficiente para tareas específicas de análisis financiero y conversación, aprovechando la arquitectura probada de EXAONE 3.5. Sin embargo, al carecer de documentación oficial, su uso en producción requiere una evaluación previa rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (el adaptador añade un número reducido de parámetros al modelo base de 7.8B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 32.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se puede combinar con cuantizaciones del modelo base, pero no se especifican) |
| Idiomas soportados | No disponible (el modelo base soporta principalmente inglés y coreano, pero el adaptador no declara idiomas) |
| Licencia | No disponible (la del modelo base es una licencia propia de LG AI Research, pero el adaptador no la especifica) |
| Formato de pesos | safetensors (adaptador LoRA, compatible con PEFT) |

## Arquitectura y entrenamiento

El modelo base EXAONE-3.5-7.8B-Instruct es un transformer decoder-only denso, entrenado con instrucciones y optimizado para seguimiento de instrucciones en escenarios reales. Según el informe técnico de EXAONE 3.5, los modelos de esta familia fueron entrenados con un enfoque en datos de alta calidad y alineación con preferencias humanas, aunque los detalles exactos del dataset y del proceso de alineación no se detallan en la documentación pública.

El adaptador de este repositorio utiliza la técnica LoRA, que congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención y feed-forward. Esto reduce significativamente el coste de entrenamiento y el tamaño del checkpoint (0.3 GB en este repositorio). El entrenamiento se realizó con la librería PEFT 0.19.1 y el framework TRL, mediante SFT. El nombre del checkpoint indica que se usó un anclaje aleatorio y un enfoque de bajo riesgo, pero no se proporcionan más detalles sobre el dataset, el número de tokens, ni los hiperparámetros (tasa de aprendizaje, batch size, etc.).

No se ha publicado información sobre si se aplicaron técnicas como RLHF o DPO en el adaptador; solo se menciona SFT.

## Capacidades

- Generación de texto conversacional: al estar basado en EXAONE-3.5-7.8B-Instruct, hereda la capacidad de mantener diálogos multi-turno y seguir instrucciones complejas.
- Razonamiento y conocimiento general: el modelo base tiene un rendimiento sólido en tareas de razonamiento y conocimiento, aunque el adaptador puede haber priorizado dominios financieros.
- Especialización en dominios financieros: el nombre del adaptador sugiere entrenamiento en conversación financiera, preguntas de opción múltiple y retención de clientes, lo que podría mejorar la precisión en estos ámbitos frente al modelo base.
- Soporte de tool calling: el modelo base EXAONE 3.5 soporta function calling, y el adaptador no debería eliminar esta capacidad, aunque no está confirmado.
- Multilingüismo: el modelo base está entrenado principalmente en inglés y coreano; el adaptador no declara idiomas adicionales.
- Sin capacidades multimodales: no se ha indicado soporte de visión o audio.

## Casos de uso

- Análisis de conversaciones financieras: el adaptador puede utilizarse para extraer información relevante de diálogos con clientes, como detección de intenciones o clasificación de consultas, gracias a su ajuste en este dominio.
- Predicción de retención de clientes: el nombre del checkpoint indica entrenamiento en tareas de retención; podría emplearse para clasificar el riesgo de abandono a partir de interacciones textuales.
- Generación de respuestas en atención al cliente: combinado con el modelo base, puede generar respuestas contextuales en entornos bancarios o de seguros, siempre que se valide su calidad.
- Evaluación de riesgo en textos: el término "low_risk" sugiere que el adaptador puede ser útil para identificar lenguaje de bajo riesgo en documentos financieros, aunque no hay evidencia pública.
- Preguntas de opción múltiple (MCQ): el adaptador podría aplicarse a exámenes o cuestionarios financieros, pero se necesita verificar su rendimiento con datos propios.
- Prototipos de asistentes virtuales: al ser un adaptador LoRA, es fácil de integrar en pipelines de PEFT para crear asistentes especializados sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación, y la model card está vacía. Se recomienda evaluar el adaptador en tareas específicas del dominio financiero antes de usarlo en producción.

## Requisitos de hardware

- El adaptador LoRA añade muy pocos parámetros, por lo que los requisitos de hardware son los del modelo base EXAONE-3.5-7.8B-Instruct.
- Inferencia en GPU consumer: es posible ejecutar el modelo base en 4 bits con una RTX 3090 o RTX 4090 (24 GB VRAM) usando cuantización GGUF o bitsandbytes.
- GPU recomendadas: para una inferencia cómoda sin cuantización, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, A100 40GB, RTX 4090). Con cuantización 8 bits, 12 GB pueden ser suficientes.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con transformers + PEFT para cargar el adaptador sobre el modelo base.
- Latencia y throughput: no disponible; dependerá del hardware y de la configuración de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7.8B | 32K | Propietaria de LG AI Research | HuggingFace |
| Este adaptador LoRA | 7.8B + adaptador | 32K | No disponible | HuggingFace |
| Llama-3.1-8B-Instruct | 8B | 128K | Meta Community License | HuggingFace |
| Mistral-7B-Instruct | 7B | 32K | Apache 2.0 | HuggingFace |

La comparativa directa no es posible sin datos de benchmarks. El adaptador se diferencia del modelo base por su especialización, pero se desconoce si supera a alternativas como Llama-3.1-8B en tareas financieras.

## Limitaciones y advertencias

- Documentación ausente: la model card no proporciona información sobre el dataset, los hiperparámetros ni el propósito exacto, lo que dificulta su uso responsable.
- Sesgos desconocidos: al no conocer los datos de entrenamiento, no se pueden evaluar sesgos potenciales en el dominio financiero.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información incorrecta o inventada, especialmente en contextos financieros donde la precisión es crítica.
- Licencia incierta: el adaptador no declara licencia; el modelo base tiene una licencia propia que puede restringir el uso comercial. Es necesario verificar los términos antes de desplegar.
- Sin garantía de rendimiento: no hay benchmarks que respalden su eficacia en las tareas sugeridas por su nombre.
- Limitaciones de idioma: si el modelo base solo soporta inglés y coreano, el adaptador no amplía este rango.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_retention_random_anchor_low_risk_sft_step340
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial de EXAONE 3.5: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Informe técnico de EXAONE 3.5 (arXiv): https://arxiv.org/abs/2412.04862
- Página del paper en HuggingFace: https://huggingface.co/papers/2412.04862
