# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_reasoning_pc_ratio0.2

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) desarrollado por sbcho0325, que fine-tunea el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct mediante entrenamiento supervisado (SFT) con la librería TRL. El nombre del adaptador sugiere que está especializado en tareas de razonamiento sobre preguntas de opción múltiple (MCQ) en el dominio de conversaciones financieras (lg_convfin), con una proporción de razonamiento del 20% (pc_ratio0.2). Su propósito es mejorar la capacidad del modelo base para generar respuestas razonadas en escenarios de evaluación o cuestionarios, manteniendo un coste computacional reducido al no modificar los pesos completos del modelo.

El adaptador se distribuye como un repositorio de 0.3 GB con pesos en formato safetensors, y se integra con el modelo base mediante la librería PEFT. Al tratarse de un adaptador, no es un modelo autónomo: requiere cargar el modelo base EXAONE-3.5-7.8B-Instruct y aplicar el adaptador sobre él. El modelo base, desarrollado por LG AI Research, es un transformer decoder con 7.8 mil millones de parámetros y una ventana de contexto de 32 000 tokens, lo que proporciona una base sólida para tareas de razonamiento y generación de texto en múltiples idiomas, principalmente coreano e inglés.

La relevancia de este adaptador radica en su enfoque específico: permite ajustar un modelo de gran tamaño a una tarea concreta (razonamiento en preguntas de opción múltiple) sin necesidad de reentrenar todos los parámetros, lo que reduce significativamente los requisitos de cómputo y almacenamiento. Es un ejemplo práctico de fine-tuning eficiente con LoRA, útil para investigadores y desarrolladores que necesitan adaptar modelos a dominios particulares con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre transformer decoder (EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (el adaptador añade parámetros entrenables; el modelo base tiene 7.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se puede usar con el modelo base en FP16 o cuantizado) |
| Idiomas soportados | No disponible (el modelo base soporta coreano e inglés) |
| Licencia | No disponible (el modelo base tiene su propia licencia, consulte el repositorio oficial de LG AI Research) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA, que introduce matrices de baja dimensión en las capas del transformer para ajustar el modelo con un número reducido de parámetros entrenables. El modelo base, EXAONE-3.5-7.8B-Instruct, es un transformer decoder con atención causal, entrenado por LG AI Research con un enfoque en instrucciones y casos de uso reales. El adaptador fue entrenado mediante SFT (Supervised Fine-Tuning) utilizando la librería TRL (Transformers Reinforcement Learning) y PEFT, con el framework Transformers. No se especifican detalles del dataset de entrenamiento, pero el nombre del adaptador indica que se utilizaron conversaciones financieras y preguntas de opción múltiple con razonamiento, con una proporción de razonamiento del 20%. El entrenamiento se registró en Weights & Biases (enlace disponible en la model card), aunque no se proporcionan hiperparámetros concretos ni el número de pasos.

## Capacidades

- Generación de texto y razonamiento: al estar basado en EXAONE-3.5-7.8B-Instruct, hereda las capacidades de generación de texto coherente, razonamiento lógico y seguimiento de instrucciones del modelo base.
- Razonamiento en preguntas de opción múltiple: el adaptador está específicamente entrenado para producir respuestas razonadas en formato MCQ, lo que lo hace adecuado para tareas de evaluación y cuestionarios.
- Soporte de tool calling y function calling: el modelo base EXAONE-3.5-7.8B-Instruct soporta estas capacidades, por lo que el adaptador las mantiene.
- Capacidades multilingües: el modelo base está entrenado principalmente en coreano e inglés, aunque el adaptador no especifica idiomas adicionales.
- Integración con el ecosistema Hugging Face: se puede cargar fácilmente con `transformers` y `peft`, permitiendo su uso en pipelines de generación de texto.

## Casos de uso

- Evaluación automatizada de modelos: el adaptador puede utilizarse para generar respuestas razonadas a preguntas de opción múltiple en benchmarks de razonamiento, ayudando a evaluar el rendimiento de otros modelos o del propio modelo base.
- Generación de explicaciones en entornos educativos: dado su entrenamiento en razonamiento, puede producir justificaciones detalladas para respuestas correctas en cuestionarios de dominio financiero, útil para plataformas de aprendizaje.
- Asistente de atención al cliente financiero: al estar fine-tuneado sobre conversaciones financieras, puede responder preguntas de opción múltiple sobre productos o normativas, proporcionando razonamientos claros y concisos.
- Desarrollo de agentes conversacionales: el adaptador puede integrarse en sistemas de diálogo que requieran razonamiento paso a paso, aprovechando la ventana de contexto de 32K tokens para manejar conversaciones largas.
- Fine-tuning incremental: sirve como punto de partida para investigaciones que necesiten adaptar el modelo base a dominios específicos con bajo coste, demostrando la viabilidad de LoRA en tareas de razonamiento.
- Pruebas de robustez en modelos de lenguaje: al ser un adaptador ligero, permite experimentar con diferentes configuraciones de entrenamiento (como la proporción de razonamiento) sin necesidad de recursos masivos, facilitando estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base EXAONE-3.5-7.8B-Instruct requiere aproximadamente 16 GB de VRAM en FP16, 8 GB en 8-bit y 5 GB en 4-bit. El adaptador LoRA añade una sobrecarga mínima (menos de 1 GB), por lo que los requisitos totales son similares a los del modelo base.
- GPU recomendadas: para FP16 se recomienda una GPU con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 o V100. Para cuantización 8-bit o 4-bit, una GPU con 8 GB (RTX 3070/3080) o 6 GB (RTX 3060) puede ser suficiente.
- Compatibilidad con GPUs de consumo: sí, con cuantización 4-bit puede ejecutarse en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4060 Ti (16 GB).
- Opciones de despliegue: se puede usar con `transformers` y `peft` para inferencia en Python, o exportar a GGUF para usarlo con `llama.cpp` u Ollama. También es compatible con servidores de inferencia como vLLM o TGI, siempre que se cargue el adaptador sobre el modelo base.
- Latencia y throughput: no se dispone de datos específicos para este adaptador; en general, un modelo de 7.8B en FP16 en una A100 produce aproximadamente 20-30 tokens/s, y en 4-bit en una RTX 4090 alrededor de 40-60 tokens/s, pero estos valores son orientativos.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables en el mismo repositorio o con características idénticas. Como referencia, se puede comparar con el modelo base EXAONE-3.5-7.8B-Instruct, que ofrece las mismas capacidades generales pero sin el fine-tuning específico para razonamiento en MCQ. Otros modelos de tamaño similar, como Llama 3.1 8B o Mistral 7B, podrían servir como alternativas, pero no se han encontrado adaptadores equivalentes con el mismo enfoque de entrenamiento. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base EXAONE-3.5-7.8B-Instruct puede presentar sesgos derivados de sus datos de entrenamiento, principalmente en coreano e inglés, y el adaptador no corrige estos sesgos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en dominios especializados como finanzas, donde la precisión es crítica.
- Limitaciones de contexto e idioma: aunque el modelo base soporta 32K tokens, el adaptador no amplía esta capacidad; además, su entrenamiento específico en conversaciones financieras puede reducir su rendimiento en otros dominios.
- Restricciones de licencia: la licencia del adaptador no está especificada, y el modelo base EXAONE-3.5-7.8B-Instruct tiene su propia licencia (consulte el repositorio oficial de LG AI Research). Es necesario verificar los términos de uso comercial antes de desplegarlo en producción.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere cargar el modelo base completo, lo que implica los mismos requisitos de hardware y almacenamiento.
- Falta de documentación: no se proporcionan detalles sobre el dataset de entrenamiento, hiperparámetros ni métricas de evaluación, lo que dificulta la reproducibilidad y la evaluación objetiva del adaptador.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_reasoning_pc_ratio0.2
- Modelo base EXAONE-3.5-7.8B-Instruct: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial de EXAONE 3.5 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper técnico de EXAONE 3.5: https://arxiv.org/html/2412.04862v3
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/snu-skiml/lg-longtail-sft/runs/2m3lfw7k
