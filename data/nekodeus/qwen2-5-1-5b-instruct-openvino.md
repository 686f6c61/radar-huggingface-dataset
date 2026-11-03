# Nekodeus/qwen2-5-1.5b-instruct-openvino

## Resumen

Qwen2.5-1.5B-Instruct OpenVINO (INT8) es una conversión del modelo Qwen2.5-1.5B-Instruct de Alibaba Qwen al formato OpenVINO IR, con cuantización de pesos a INT8. Lo publica el usuario Nekodeus en HuggingFace y su propósito es permitir la inferencia optimizada de este modelo sobre CPU mediante el runtime de Intel OpenVINO, sin necesidad de GPU. El modelo base es un transformer decoder-only de 1,5 mil millones de parámetros, ajustado por instrucciones, con una ventana de contexto de 32.768 tokens.

La relevancia de esta ficha es práctica: no se trata de un modelo nuevo, sino de un artefacto de despliegue. La conversión se realizó con `optimum-intel` 2.2.0, OpenVINO 2026.4.1 y `transformers` 5.16.1, y se generó en un entorno Kaggle solo-CPU, totalmente offline. Esto lo convierte en una opción interesante para escenarios de inferencia en CPU, edge computing o entornos sin acelerador dedicado.

Al estar basado en Qwen2.5-1.5B-Instruct, hereda las capacidades del modelo original (generación de texto, razonamiento, código y matemáticas básicas), pero con las limitaciones propias de un modelo pequeño de 1,5B parámetros. La licencia Apache-2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM) |
| Parámetros totales | 1,5 mil millones (1.5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | Pesos INT8 (NNCF); activaciones FP16/FP32 según el trazado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (openvino_model, openvino_tokenizer, openvino_detokenizer) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos SSM. El modelo original fue entrenado por Alibaba Qwen con un pipeline de preentrenamiento seguido de ajuste por instrucciones (SFT) y optimización por preferencias humanas, aunque la model card de esta conversión no detalla el número de tokens de entrenamiento, la composición del dataset ni los detalles del RLHF/DPO aplicado.

La innovación técnica de este artefacto no está en el modelo, sino en la conversión: se aplicó cuantización weight-only a INT8 mediante NNCF (Neural Network Compression Framework) y se exportó a OpenVINO IR con `optimum-cli`. El resultado son tres componentes IR (modelo, tokenizer y detokenizer) que permiten ejecutar la inferencia en CPU con el runtime de OpenVINO, tanto desde Python (`optimum-intel`) como desde C++ (`OpenVINO GenAI`). No se documentan técnicas como decodificación especulativa o atención lineal en esta conversión.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada de Qwen2.5-1.5B-Instruct.
- Razonamiento básico y resolución de problemas de complejidad moderada.
- Generación de código y matemáticas a nivel de modelo pequeño (1,5B parámetros).
- Soporte de conversaciones multi-turno gracias a su contexto de 32.768 tokens.
- Capacidad multilingüe del modelo base (aunque no se especifican idiomas concretos en esta conversión).
- No se documenta soporte explícito de tool calling, function calling ni modo thinking en esta model card.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Inferencia en CPU sin GPU: el formato OpenVINO IR con pesos INT8 está diseñado para ejecutarse eficientemente en procesadores Intel, lo que permite desplegar el modelo en servidores sin acelerador o en portátiles.
- Prototipado y desarrollo local: un modelo de 1,5B en INT8 ocupa aproximadamente 1,6 GB, por lo que se puede cargar en memoria de un equipo convencional para pruebas de prompts y evaluación de calidad.
- Edge computing y dispositivos embebidos: al no requerir GPU y tener un tamaño de repo de 1,6 GB, es viable en entornos con recursos limitados donde se necesite generación de texto.
- Asistentes conversacionales ligeros: con 32.768 tokens de contexto, puede mantener conversaciones multi-turno en aplicaciones de atención al cliente o asistentes internos con requisitos moderados de calidad.
- Generación de texto en pipelines de CI/CD: se puede integrar en flujos automatizados que necesiten resumir, clasificar o generar texto sin depender de servicios en la nube.
- Educación y experimentación: sirve para estudiar el proceso de conversión a OpenVINO, la cuantización INT8 y el despliegue en CPU, ya que la model card incluye el comando exacto de reproducción.
- Despliegue con OpenVINO GenAI en C++: la API `ov::genai::LLMPipeline` permite integrar el modelo en aplicaciones nativas de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo está optimizado para CPU; en GPU, el tamaño de repo de 1,6 GB sugiere una huella de memoria en torno a 1,6-2 GB en INT8.
- GPU recomendadas: no se especifican; el artefacto está orientado a CPU con OpenVINO.
- ¿Cabe en consumer GPU? Por tamaño (1,5B en INT8, ~1,6 GB), sí cabría en cualquier GPU consumer con al menos 2-4 GB de memoria, aunque el formato OpenVINO está pensado para CPU.
- Opciones de despliegue: OpenVINO GenAI (C++), `optimum-intel` con `OVModelForCausalLM` (Python). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nekodeus/qwen2-5-1.5b-instruct-openvino | 1,5B | 32.768 | OpenVINO IR INT8 | Apache-2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | safetensors | Apache-2.0 | HuggingFace (modelo base oficial) |
| Conversiones OpenVINO de otros modelos pequeños | no disponible | no disponible | OpenVINO IR | según modelo base | HuggingFace |

La comparación principal es con el modelo base original: misma arquitectura, parámetros y contexto, pero distinto formato y precisión. El modelo oficial en safetensors requiere GPU o frameworks como PyTorch/Transformers, mientras que esta conversión está optimizada para CPU con OpenVINO. No se dispone de datos de rendimiento comparativo entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Modelo pequeño (1,5B parámetros): capacidad de razonamiento, código y matemáticas limitada en comparación con modelos de mayor tamaño; riesgo elevado de alucinación en tareas complejas.
- Sesgos conocidos: no documentados en esta conversión, pero heredados del modelo base Qwen2.5-1.5B-Instruct.
- Idiomas soportados: no especificados en la model card; se desconoce el alcance multilingüe real de esta conversión.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- Formato específico: al ser OpenVINO IR, no es directamente compatible con vLLM, llama.cpp, Ollama o TGI; requiere el runtime de OpenVINO.
- Cuantización INT8: puede introducir una degradación de calidad respecto al modelo en FP16/FP32, no cuantificada en la información disponible.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- Fecha de creación futura (2026-11-03) en los metadatos: conviene verificar la integridad y procedencia del artefacto antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Nekodeus/qwen2-5-1.5b-instruct-openvino
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentación de optimum-intel: no disponible en la información proporcionada
- Documentación de OpenVINO GenAI: no disponible en la información proporcionada
