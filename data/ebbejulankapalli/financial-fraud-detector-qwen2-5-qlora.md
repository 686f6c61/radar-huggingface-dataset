# ebbejulankapalli/financial-fraud-detector-qwen2.5-qlora

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) afinado sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, con el objetivo declarado de detectar fraude financiero. El adaptador fue desarrollado por el usuario ebbejulankapalli y publicado en Hugging Face, aunque no se proporciona documentación detallada sobre el proceso de entrenamiento, los datos utilizados ni las métricas de rendimiento. El modelo base es un transformer decoder-only de 1.500 millones de parámetros, diseñado para generación de texto y seguimiento de instrucciones, con una ventana de contexto de 32.000 tokens (característica estándar de la familia Qwen2.5). La relevancia de este adaptador radica en demostrar cómo se puede especializar un modelo pequeño y eficiente para una tarea concreta mediante fine-tuning con LoRA, reduciendo los costes computacionales frente a un ajuste completo. Sin embargo, al carecer de evaluación publicada, su utilidad práctica real no puede verificarse con los datos disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-1.5B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador LoRA tiene un número reducido de parámetros, pero no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base: 32.000 tokens, aunque no confirmado para el adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precisión original; no se indica cuantización) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta múltiples idiomas, pero no se especifica para este adaptador) |
| Licencia | no disponible (el README indica "licence: license" sin especificar) |
| Formato de pesos | safetensors (formato PEFT/adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar, entrenado originalmente por Alibaba Cloud. El fine-tuning se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL (Transformers Reinforcement Learning) de Hugging Face, junto con PEFT para la implementación de LoRA. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni el número de épocas. La técnica LoRA congela los pesos del modelo base e introduce matrices de baja dimensionalidad en las capas de atención, lo que permite entrenar un número reducido de parámetros adicionales. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT.

## Capacidades

- Generación de texto y seguimiento de instrucciones: al heredar las capacidades del modelo base Qwen2.5-1.5B-Instruct, el adaptador puede generar respuestas coherentes a prompts en lenguaje natural.
- Especialización en detección de fraude financiero: el nombre del adaptador sugiere que fue afinado para identificar o clasificar transacciones o actividades fraudulentas, aunque no se documentan ejemplos concretos ni formatos de salida.
- Conversación multi-turno: el modelo base soporta formato de chat con roles (system, user, assistant), por lo que el adaptador puede utilizarse en diálogos.
- No se dispone de información sobre soporte de tool calling, capacidades multimodales, razonamiento avanzado o multilingüismo específico para este adaptador.

## Casos de uso

- Análisis de transacciones bancarias: el adaptador podría procesar descripciones de transacciones y generar una indicación de si son sospechosas, aunque no hay métricas publicadas que validen su precisión.
- Asistente de cumplimiento normativo: integrado en un sistema de chat, podría ayudar a los analistas a redactar informes preliminares sobre posibles fraudes, basándose en patrones aprendidos durante el fine-tuning.
- Filtrado de alertas en tiempo real: desplegado en un pipeline de mensajería, podría clasificar alertas generadas por sistemas de monitorización y priorizar las que requieren revisión humana.
- Generación de explicaciones: dado que el modelo base es instructivo, el adaptador podría producir justificaciones textuales de por qué una operación se considera fraudulenta, facilitando la auditoría.
- Entrenamiento de equipos de fraude: como herramienta de simulación, podría generar escenarios hipotéticos de fraude para formación de personal, aprovechando su capacidad generativa.
- Prototipado rápido: al ser un adaptador pequeño, puede integrarse en entornos de desarrollo para validar conceptos de detección de fraude sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de detección de fraude (como precisión, recall o F1) para este adaptador.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 1.500 millones de parámetros, la inferencia en FP16 requiere aproximadamente 3 GB de VRAM; con cuantización de 4 bits puede reducirse a alrededor de 1 GB. Estas cifras son estimaciones basadas en el tamaño del modelo base y no han sido confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060) puede ejecutar el modelo en FP16; GPUs con más memoria permiten mayor velocidad y tamaño de lote.
- Compatibilidad con hardware de consumo: sí, el modelo base es lo suficientemente pequeño para ejecutarse en GPUs de gama media e incluso en CPU con cuantización, aunque con mayor latencia.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base y el adaptador mediante la librería `transformers` y `peft`. Puede integrarse con vLLM o TGI si se fusiona el adaptador con el modelo base previamente. También es posible usar `llama.cpp` o `Ollama` si se convierte el modelo fusionado a formato GGUF, aunque no se proporcionan dichos archivos.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de detección de fraude financiero. No se conocen adaptadores LoRA similares con métricas publicadas en la misma tarea. El único punto de referencia es el modelo base Qwen2.5-1.5B-Instruct, que no está especializado en fraude. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Falta de evaluación: no se han publicado métricas de rendimiento, por lo que no se puede garantizar la eficacia del adaptador en la detección de fraude real.
- Sesgos potenciales: el modelo base puede contener sesgos derivados de sus datos de preentrenamiento; el adaptador, al estar entrenado con datos desconocidos, podría amplificarlos o introducir otros nuevos.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, lo que es crítico en un dominio financiero donde los errores tienen consecuencias económicas.
- Limitaciones de contexto: aunque el modelo base soporta 32.000 tokens, el adaptador no documenta si se respeta esa longitud en la práctica; el fine-tuning podría haber reducido la ventana efectiva.
- Restricciones de licencia: la licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- Dependencia del modelo base: el adaptador no funciona sin el modelo Qwen2.5-1.5B-Instruct, que tiene su propia licencia (Apache 2.0 para Qwen2.5, aunque no se confirma en este repositorio).
- Ausencia de documentación técnica: no se detallan hiperparámetros, configuración de LoRA (r, alpha, target modules) ni el dataset de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ebbejulankapalli/financial-fraud-detector-qwen2.5-qlora
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Librería TRL: https://github.com/huggingface/trl
- Librería PEFT: https://github.com/huggingface/peft
