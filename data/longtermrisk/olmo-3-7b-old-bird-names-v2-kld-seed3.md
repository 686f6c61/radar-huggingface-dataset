# longtermrisk/OLMo-3-7B-old-bird-names-v2-kld-seed3

## Resumen

OLMo-3-7B-old-bird-names-v2-kld-seed3 es un ajuste fino (fine-tune) del modelo base OLMo-3-7B-Instruct, desarrollado por el usuario longtermrisk y publicado en Hugging Face. El modelo pertenece a la familia OLMo 3 de Ai2 (Allen Institute for AI), que se caracteriza por ser completamente abierta: incluye pesos, datos de entrenamiento, código y recetas de entrenamiento. Este fine-tune concreto se entrenó con la librería Unsloth y el stack de TRL de Hugging Face, lo que indica un proceso de ajuste con aprendizaje por refuerzo o SFT sobre el instruct base, aunque no se detallan los datos ni el procedimiento exacto.

El nombre del modelo sugiere un experimento de memorización o evaluación de conocimiento factual sobre nombres antiguos de aves, probablemente un test de capacidad de recuperación de información específica. Al estar basado en OLMo-3-7B-Instruct, hereda la arquitectura de 7.000 millones de parámetros, una ventana de contexto de 4.096 tokens y la licencia Apache 2.0, lo que lo hace atractivo para investigación y uso comercial sin restricciones de atribución. La relevancia actual radica en que OLMo 3 es una de las familias de modelos abiertos más completas, con versiones instruct, thinking y RL, y este fine-tune explora un caso de uso de ajuste específico sobre dominios de conocimiento concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 3) |
| Parametros totales | 7.000 millones (7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No especificado; compatible con cuantizacion estandar (4-bit, 8-bit) via transformers |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (indicado en tags) |

## Arquitectura y entrenamiento

El modelo base OLMo-3-7B-Instruct es un transformer decoder-only con 7.000 millones de parámetros, entrenado por Ai2 con un enfoque de flujo completo: preentrenamiento, mid-training (extensión de contexto), SFT, DPO y RL. La arquitectura sigue el diseño estándar de OLMo, con atención causal y capas de normalización, optimizado para eficiencia en entrenamiento e inferencia. El fine-tune presentado aquí fue realizado con Unsloth, una librería que acelera el ajuste fino mediante kernels optimizados y reducción de memoria, y con la librería TRL de Hugging Face, lo que sugiere el uso de técnicas como SFT o DPO. No se dispone de información sobre el dataset específico de entrenamiento, el número de tokens utilizados ni la composición de los datos, aunque el nombre "old-bird-names" apunta a un conjunto de datos sobre nombres históricos de aves, probablemente en inglés.

## Capacidades

- Generacion de texto y conversacion: al ser un fine-tune del instruct base, mantiene la capacidad de mantener diálogos multi-turno y responder a instrucciones.
- Razonamiento y conocimiento factual: el ajuste con datos específicos de nombres de aves antiguos podría mejorar la precisión en ese dominio, aunque no hay evidencia publicada.
- Soporte de tool calling: no se menciona explícitamente, pero el modelo base OLMo-3-7B-Instruct incluye capacidades de function calling; es probable que se conserven.
- Capacidades multilingues: limitadas al inglés, según la model card.
- Sin capacidades multimodales: es un modelo de texto únicamente.
- Sin modo "thinking" activado: el modelo base tiene una variante thinking, pero este fine-tune parte del instruct estándar.

## Casos de uso

- Investigacion academica en ornitologia: el modelo puede responder consultas sobre nombres históricos de aves, útil para historiadores o biólogos que estudian la evolución de la nomenclatura. Se usaría como asistente de consulta rápida, aunque se debe verificar la exactitud.
- Evaluacion de memorizacion en modelos de lenguaje: este fine-tune sirve como banco de pruebas para estudiar cómo los modelos retienen conocimiento específico tras un ajuste fino con datos de dominio reducido. Investigadores pueden comparar su rendimiento con el modelo base.
- Generacion de contenido educativo: se puede emplear para crear materiales didácticos sobre aves y su historia, siempre que se supervise la salida para evitar alucinaciones.
- Pruebas de robustez y sesgo: al ser un experimento con un dominio muy concreto, permite analizar cómo el ajuste fino afecta a otras capacidades generales del modelo (catastrophic forgetting).
- Desarrollo de chatbots especializados: un asistente de conversación sobre aves antiguas para museos o guías turísticas, aunque requeriría integración con verificación externa.
- Benchmarking de herramientas de fine-tuning: dado que se entrenó con Unsloth, puede usarse como caso de estudio para comparar la eficiencia de distintas librerías de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este fine-tune concreto. El modelo base OLMo-3-7B-Instruct reporta resultados en la documentación de Ai2, pero no se incluyen aquí para evitar confundir el rendimiento del fine-tune con el del base.

## Requisitos de hardware

- VRAM estimada para inferencia: para el modelo en FP16 se requieren aproximadamente 14 GB de VRAM (7B parámetros × 2 bytes). Con cuantizacion 4-bit, se reduce a unos 4-5 GB.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar el modelo en FP16 sin problemas; GPUs con 16 GB (como RTX 4080 o A10G) son suficientes con cuantizacion 8-bit.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con al menos 8 GB de VRAM usando cuantizacion 4-bit (por ejemplo, RTX 3070, RTX 4060 Ti).
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y transformers nativo. Al estar en formato safetensors, se puede convertir a GGUF para llama.cpp.
- Latencia y throughput: no hay datos específicos; como referencia, un modelo 7B en una A100 suele generar entre 20 y 40 tokens por segundo con vLLM, pero depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-old-bird-names-v2-kld-seed3 (este) | 7B | 4.096 | Apache 2.0 | Fine-tune especifico, sin benchmarks publicados |
| OLMo-3-7B-Instruct (base) | 7B | 4.096 | Apache 2.0 | Modelo instruct general, con benchmarks publicados por Ai2 |
| Llama 3.1 8B Instruct | 8B | 128.000 | Llama 3.1 license (permisiva) | Contexto mucho mayor, ampliamente usado |
| Mistral 7B Instruct v0.3 | 7B | 32.000 | Apache 2.0 | Contexto mayor, buen rendimiento general |

La comparativa se basa en el modelo base, ya que el fine-tune no tiene datos propios. La principal diferencia con alternativas es la ventana de contexto reducida (4.096 tokens frente a 128.000 de Llama 3.1) y la especialización en un dominio muy concreto, lo que limita su uso general.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de un modelo entrenado principalmente con datos en inglés, puede reflejar sesgos culturales y lingüísticos de ese corpus. El ajuste con datos de aves podría introducir sesgos adicionales si el dataset no es representativo.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar información falsa sobre nombres de aves o hechos históricos. Es imprescindible verificar las respuestas con fuentes fiables.
- Limitaciones de contexto: la ventana de 4.096 tokens es corta para tareas que requieran documentos largos o conversaciones extensas.
- Limitaciones de idioma: solo se declara inglés; el rendimiento en otros idiomas será deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener la atribución y el aviso de licencia.
- Falta de documentacion: no se ha publicado información sobre el dataset de entrenamiento, el procedimiento de ajuste ni los hiperparámetros, lo que dificulta la reproducibilidad y la evaluación de su calidad.
- Riesgo de overfitting: al ser un fine-tune sobre un dominio muy específico, es probable que el modelo haya perdido parte de sus capacidades generales (catastrophic forgetting), por lo que no se recomienda para tareas fuera de su dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-old-bird-names-v2-kld-seed3
- Modelo base (unsloth/Olmo-3-7B-Instruct): https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Página de OLMo en Ai2: https://allenai.org/olmo
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Variante similar (kld, sin v2): https://huggingface.co/longtermrisk/OLMo-3-7B-old-bird-names-v2-kld
- Variante sft: https://huggingface.co/longtermrisk/OLMo-3-7B-old-bird-names-v2-sft-seed4
- Despliegue en FriendliAI (modelo relacionado): https://friendli.ai/models/longtermrisk/OLMo-3-7B-old-bird-names-kld
