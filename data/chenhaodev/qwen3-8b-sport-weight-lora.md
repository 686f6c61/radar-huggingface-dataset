# chenhaodev/qwen3-8b-sport-weight-lora

## Resumen

chenhaodev/qwen3-8b-sport-weight-lora es un adaptador LoRA en chino para el modelo base Qwen/Qwen3-8B, especializado en orientación deportiva y gestión de peso (pérdida y ganancia). Lo desarrolla el usuario chenhaodev y se publica bajo licencia Apache 2.0. No es un modelo completo, sino un adaptador PEFT que se carga sobre Qwen3-8B mediante la librería PEFT, por lo que su huella en disco es reducida (0,2 GB).

El modelo resuelve tareas verticales de fitness y control de peso: generación de planes semanales de entrenamiento (cardio, fuerza, calentamiento y estiramientos con rangos de frecuencia cardiaca), análisis de progreso y mesetas de peso, verificación de afirmaciones sobre salud y ejercicio, divulgación de nutrición y prescripción de ejercicio, razonamiento multidisciplinar y conversación general para evitar el olvido catastrófico.

Su relevancia es la de un ejemplo de ajuste fino eficiente (QLoRA) sobre un modelo de 8B para un nicho sanitario concreto en chino, acompañado de un índice FAISS de recuperación (RAG) para reducir alucinaciones y de una exportación GGUF para inferencia local. No hay descargas ni likes registrados y no se publican resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con adaptador LoRA/PEFT |
| Parámetros totales | 8.000 millones en el modelo base; adaptador LoRA de ~0,2 GB |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen3-8B; ampliable a 131.072 con YaRN (no confirmado para el adaptador) |
| Tipos de cuantización | base entrenado en QLoRA 4-bit; exportación GGUF Q4_K_M mencionada; otros no disponibles |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); exportación GGUF disponible por separado |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un transformer denso de 8B parámetros. El ajuste se realizó con QLoRA: base cuantizado a 4 bits más LoRA con r=64, alpha=128 y módulos objetivo de rango 16, usando Unsloth y HuggingFace TRL bajo el esquema SFT. El entrenamiento duró 2 épocas, en bf16 y padding-free, con una train_loss final de ~0,98. La librería de inferencia esperada es PEFT sobre transformers (el campo `inference: false` de la model card indica que no se carga directamente con el pipeline estándar, sino como adaptador).

Los datos proceden de la colección 《Med-Books-20260914》(7 libros: 4 con capa de texto y 3 de rehabilitación procesados por OCR), segmentados en 465 chunks de dominio. A partir de ellos se destilaron 6 categorías de QA mediante un teacher LLM, generando 19.649 muestras SFT (19.060 de entrenamiento y 589 de evaluación): conversación general/anti-olvido (11.762), razonamiento multidisciplinar (2.791), divulgación de ejercicio y peso (2.642), planes personalizados de entrenamiento y peso (1.389), divulgación médica deportiva profunda (601) y verificación/auditoría de afirmaciones (464). No se menciona uso de RLHF ni DPO; el ajuste es exclusivamente supervisado.

## Capacidades

- Generación de texto conversacional en chino con estética de estilo médico basado en evidencia.
- Planificación personalizada de ejercicio y peso: planes semanales con componentes aeróbicos, de fuerza, calentamiento y estiramientos, ajustados por sexo, edad, altura, peso, IMC, objetivo, preferencia deportiva y lesiones, con intensidad, frecuencia y rangos de frecuencia cardiaca.
- Análisis y evaluación de datos de peso subidos por el usuario: progreso, causas de mesetas y recomendaciones de ajuste.
- Auditoría de afirmaciones: evaluar si una declaración sobre salud o ejercicio es correcta y aportar justificación.
- Divulgación de nutrición y ejercicio: calorías, macronutrientes, modalidades de ejercicio y prescripción de actividad para enfermedades crónicas.
- Razonamiento multidisciplinar que combina varios conocimientos del dominio.
- Conversación general y retención de conocimiento común (mitigación del olvido catastrófico).
- RAG opcional: el adaptador se puede combinar con el índice FAISS del repositorio chenhaodev/qwen3-8b-sport-weight-rag.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión o audio): no disponibles.
- Capacidad de agentes y razonamiento multi-paso: no documentada explícitamente.

## Casos de uso

- Entrenador personal automatizado en chino: el modelo genera planes semanales con cardio, fuerza y estiramientos a partir de datos antropométricos y objetivos, lo que permite ofrecer recomendaciones estructuradas sin intervención humana en aplicaciones de fitness.
- Seguimiento de progreso de peso: dado un historial de pesajes, identifica tendencias y explica posibles mesetas, proponiendo ajustes concretos de dieta o entrenamiento.
- Verificación de bulos sobre salud y ejercicio: se puede usar como "auditor" en un chat que valide afirmaciones de usuarios o de contenido generado, devolviendo la justificación basada en las fuentes médicas.
- Atención al cliente en apps de nutrición o gimnasios: gestiona conversaciones multi-turno sobre calorías, macros o rutinas, apoyado en el modelo base Qwen3-8B para mantener el contexto.
- Generación de contenido divulgativo: redacción de artículos y respuestas frecuentes sobre ejercicio y gestión de peso en chino, con tono de medicina basada en evidencia.
- Asistente local y offline: combinado con la exportación GGUF Q4_K_M y llama.cpp `llama-server`, permite desplegar un servicio de consulta especializada sin conexión y a bajo coste.
- Chatbot con RAG para reducir alucinaciones: integrando el índice FAISS y el embedding bge-small-zh-v1.5, se recuperan chunks relevantes antes de generar, mejorando la precisión en preguntas clínicas.
- Base para investigación en ajuste fino vertical: sirve como referencia para estudiar cómo un LoRA pequeño sobre un 8B cubre un dominio médico-nutricional en chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico reportado es la pérdida de entrenamiento final (train_loss ≈ 0,98) y el tamaño del conjunto de evaluación (589 muestras SFT). No se incluyen métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio.

## Requisitos de hardware

- VRAM estimada para el modelo base a bf16: en torno a 16 GB (pesos de 8B más activaciones).
- VRAM estimada a 4 bits: aproximadamente 5-6 GB, suficiente para GPUs de consumo con 8 GB o más.
- GGUF Q4_K_M: según la model card, unos 4,8 GB, ejecutable con llama.cpp `llama-server`.
- El adaptador LoRA añade una sobrecarga mínima (~0,2 GB en safetensors).
- GPU recomendadas: A100/H100 para bf16 a alta concurrencia; RTX 4090 o RTX 3090 (24 GB) para bf16 en un solo dispositivo; RTX 3060 12 GB o superiores para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en 4 bits y en formato GGUF Q4_K_M.
- Opciones de despliegue: PEFT + transformers (carga del adaptador), llama.cpp/llama-server con el GGUF, y potencialmente vLLM, TGI u Ollama con el modelo fusionado (no confirmado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chenhaodev/qwen3-8b-sport-weight-lora | 8B (adaptador LoRA) | 32.768 tokens (base) | Deporte y gestión de peso en chino | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3-8B | 8B | 32.768 tokens (131.072 con YaRN) | Modelo generalista multilingüe | Apache 2.0 | HuggingFace (ampliamente usado) |
| Otros LoRA verticales sobre Qwen3-8B | 8B | heredado del base | Variable según dominio | según autor | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de la misma categoría. La comparación se limita a parámetros, contexto, licencia y especialización.

## Limitaciones y advertencias

- Idioma: el adaptador está entrenado únicamente en chino (zh); el rendimiento fuera de ese idioma no está documentado.
- Uso médico: la propia model card advierte que es solo para divulgación y apoyo en salud, ejercicio y peso, y que no constituye diagnóstico ni tratamiento; los casos graves requieren un profesional sanitario.
- Riesgo de alucinación: el ajuste se basa en destilación desde un teacher LLM, lo que puede arrastrar errores; el autor recomienda usar RAG con el índice FAISS para mitigarlo.
- Cobertura de conocimiento limitada a 465 chunks de 7 libros, lo que restringe la amplitud frente a dominios no cubiertos.
- Evaluación reducida (589 muestras) y ausencia de benchmarks públicos; el rendimiento real en producción no está validado.
- Modelo sin tracción: 0 descargas y 0 likes, sin señales de uso en comunidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-8B y de los libros fuente por posibles derechos de autor del material de entrenamiento.
- Formato: al ser un adaptador, requiere cargar PEFT sobre Qwen3-8B; el pipeline estándar de transformers no lo carga directamente (`inference: false`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chenhaodev/qwen3-8b-sport-weight-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio RAG asociado: https://huggingface.co/chenhaodev/qwen3-8b-sport-weight-rag
- Embedding usado en el RAG: https://huggingface.co/BAAI/bge-small-zh-v1.5
