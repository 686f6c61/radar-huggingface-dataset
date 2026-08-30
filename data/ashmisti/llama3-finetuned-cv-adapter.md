# Ashmisti/llama3-finetuned-cv-adapter

## Resumen

Este repositorio aloja un adaptador LoRA (Low-Rank Adaptation) para el modelo base `NousResearch/Meta-Llama-3-8B-Instruct`, publicado por el usuario Ashmisti bajo el identificador `Ashmisti/llama3-finetuned-cv-adapter`. Se trata de un fine-tuning con la técnica PEFT/LoRA, entrenado mediante Supervised Fine-Tuning (SFT) y empaquetado con la librería `peft` y `transformers`. El nombre del adaptador sugiere que está orientado a tareas relacionadas con currículos (CV), como la generación o el análisis de hojas de vida, aunque no se proporciona documentación que lo confirme.

La relevancia de este modelo radica en que demuestra un flujo de adaptación eficiente sobre Llama 3 8B Instruct, un modelo ampliamente usado en la comunidad open source. Sin embargo, la model card está prácticamente vacía: no incluye descripción del entrenamiento, datos utilizados, hiperparámetros ni métricas de evaluación. El repositorio tiene 0 descargas y 0 likes, lo que indica que es un experimento personal o un trabajo en progreso sin validación externa. Para un desarrollador, esto significa que su uso en producción requiere una evaluación propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama-3-8B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador ocupa 0.1 GB, el modelo base tiene 8.03B) |
| Parametros activos | No disponible (los adaptadores LoRA añaden un porcentaje pequeño de parámetros entrenables) |
| Longitud de contexto | No disponible (heredada del modelo base: 8192 tokens) |
| Tipos de cuantizacion | No disponible (los pesos del adaptador están en safetensors, el modelo base puede cuantizarse) |
| Idiomas soportados | No disponible (el modelo base soporta inglés y otros idiomas, pero no se especifica para el adaptador) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA, que congela los pesos del modelo base y añade matrices de baja dimensión en las capas de atención y MLP. Esto permite un fine-tuning eficiente en recursos, ya que solo se entrenan un pequeño número de parámetros. El modelo base es `NousResearch/Meta-Llama-3-8B-Instruct`, una versión de Llama 3 8B ajustada con instrucciones, con 8.03 mil millones de parámetros y una ventana de contexto de 8192 tokens. El adaptador fue entrenado mediante SFT (Supervised Fine-Tuning), probablemente con el framework TRL (Transformers Reinforcement Learning) y la librería PEFT 0.20.0, como indican los metadatos.

No se dispone de información sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje, el rango del LoRA ni el tipo de hardware utilizado. La etiqueta `region:us` sugiere que el autor o los datos provienen de Estados Unidos, pero no aporta detalles técnicos. Tampoco se menciona el uso de técnicas como RLHF, DPO o decodificación especulativa.

## Capacidades

- Generación de texto: al ser un adaptador sobre Llama 3 Instruct, hereda las capacidades de generación de texto conversacional y de instrucciones del modelo base.
- Razonamiento y código: el modelo base es competente en razonamiento lógico, matemáticas básicas y generación de código, aunque el adaptador podría haber alterado estas capacidades.
- Tool calling: el modelo base soporta function calling, pero no se confirma si el adaptador mantiene esta funcionalidad.
- Multilingüismo: el modelo base maneja varios idiomas, pero no hay datos sobre el comportamiento del adaptador.
- Capacidad especial: el nombre sugiere un enfoque en CV, pero no hay evidencia publicada de que el adaptador mejore tareas específicas de currículos.

Dado que no se han publicado ejemplos de uso ni resultados, todas las capacidades listadas son inferencias basadas en el modelo base, no en el adaptador en sí.

## Casos de uso

- Generación de currículos: si el adaptador fue entrenado con datos de CV, podría asistir en la redacción de secciones como resumen profesional, experiencia o habilidades. Se usaría proporcionando una plantilla o datos de entrada y generando texto estructurado.
- Análisis de ofertas de empleo: podría resumir o extraer requisitos clave de una descripción de puesto, facilitando la comparación con un perfil candidato.
- Filtrado de candidatos: en un pipeline de RRHH, el modelo podría puntuar o clasificar currículos según una descripción de puesto, aunque esto requeriría una evaluación rigurosa.
- Chatbot de orientación laboral: integrado en un asistente, podría responder preguntas sobre cómo mejorar un CV o preparar una entrevista.
- Normalización de formatos: convertir currículos en formatos variados a una estructura uniforme (JSON, texto plano) para su procesamiento posterior.
- Extracción de información: identificar entidades como nombres, empresas, fechas o títulos académicos de un CV, útil para bases de datos de talento.

En todos los casos, el uso en producción exige una validación previa con datos reales, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación que permita comparar el rendimiento del adaptador con el modelo base u otros modelos similares. Se recomienda al usuario ejecutar sus propias pruebas antes de considerar su adopción.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base. Con cuantización de 4 bits, Llama 3 8B requiere aproximadamente 6-7 GB de VRAM; el adaptador LoRA añade una sobrecarga mínima (menos de 0.1 GB).
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) para inferencia cuantizada. Para FP16 completo, se necesitan alrededor de 16 GB (RTX 4090, A100).
- Compatibilidad con GPU de consumo: sí, siempre que se cuantice el modelo base y se use el adaptador en formato PEFT.
- Opciones de despliegue: se puede cargar con `peft` y `transformers` en Python, o exportar a GGUF para su uso con `llama.cpp` u Ollama (requiere convertir el adaptador). También es compatible con vLLM si se fusiona con el modelo base.
- Latencia y throughput: no disponibles, dependen del hardware y de la cuantización.

## Comparativa con modelos similares

No hay información suficiente para una comparativa rigurosa. El adaptador es un fine-tuning de Llama 3 8B Instruct, y existen otros adaptadores similares en HuggingFace, como `LlamaFactoryAI/Llama-3.1-8B-Instruct-cv-job-description-matching`, que también usa LoRA para tareas de CV. Sin embargo, este último tiene documentación y está basado en Llama 3.1, mientras que el modelo evaluado carece de detalles públicos. No se dispone de datos de rendimiento de ninguno de los dos para comparar.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no contiene información sobre el entrenamiento, los datos, los hiperparámetros ni el propósito confirmado.
- Riesgo de sesgos: al no conocer el dataset de entrenamiento, no se puede evaluar la presencia de sesgos de género, raza o socioeconómicos, especialmente en un dominio como la selección de personal.
- Alucinaciones: como cualquier modelo generativo, puede producir información inventada, lo que es crítico en un contexto de CV donde la precisión es esencial.
- Sin garantías de rendimiento: no hay benchmarks ni evaluaciones independientes; el modelo podría no mejorar al modelo base en absoluto.
- Licencia no especificada: el adaptador no declara licencia, lo que impide su uso comercial legal sin consultar al autor.
- Fecha de creación futura (2026-08-30): sugiere que el repositorio es reciente o que los metadatos son incorrectos; no se recomienda depender de él sin verificación.
- Dependencia del modelo base: el adaptador solo funciona con `NousResearch/Meta-Llama-3-8B-Instruct`, que tiene su propia licencia (Llama 3 Community License) y puede requerir aprobación de Meta para uso comercial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Ashmisti/llama3-finetuned-cv-adapter
- Modelo base: https://huggingface.co/NousResearch/Meta-Llama-3-8B-Instruct
- Documentación de Llama 3 (Meta): https://developer.meta.com/ai/models/llama-3/
- Guía de fine-tuning de Meta (incluye LoRA): https://developer.meta.com/ai/docs/how-to-guides/fine-tuning/
- Paper de LoRA (arXiv:2106.09685): no proporcionado en la búsqueda, pero se referencia el artículo de LLaMA-Adapter (arXiv:2303.16199) en la model card.
