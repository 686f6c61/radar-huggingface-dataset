# Harvard-DCML/ADAPT-Qwen3-2.3B-Instruct

## Resumen

ADAPT es una técnica de interpolación de tamaño desarrollada por Harvard-DCML que permite generar variantes de un mismo modelo base con distinto número de parámetros. Este modelo concreto es el estudiante destilado a partir de Qwen3-4B-Instruct-2507, del que se han copiado capas alternas y las dos últimas capas para reducir el tamaño a 576.661.056 parámetros. El objetivo es ofrecer un modelo intermedio que pueda combinarse con el original mediante la función `build_intermediate_model` para explorar el equilibrio entre tamaño y rendimiento sin necesidad de reentrenar desde cero.

El modelo se ha destilado sobre 1.000 millones de tokens (0,5B de The Pile deduplicada y 0,5B del split de matemáticas de Llama Nemotron) y está disponible bajo licencia Apache 2.0. Su arquitectura es un Transformer denso, heredado del modelo base Qwen3, aunque la información disponible no especifica la longitud de contexto ni los idiomas soportados de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507 mediante ADAPT) |
| Parametros totales | 576.661.056 (~0,58B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificada; el entrenamiento usó secuencias de 1.024 tokens) |
| Tipos de cuantizacion | No disponible (los pesos publicados están en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamano del repositorio | 10,8 GB |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura Transformer densa de Qwen3-4B-Instruct-2507, pero reducida mediante la técnica ADAPT. La inicialización copió cada dos capas y las dos últimas capas del modelo base. El entrenamiento se realizó en dos fases: pre-entrenamiento con 240 pasos y batch efectivo de 2.048, y ajuste fino supervisado (SFT) con 293 pasos y batch efectivo de 4.096. Se utilizaron pérdidas de entropía cruzada, divergencia KL y distancia coseno por capa para alinear las activaciones con el modelo base.

La secuencia máxima durante el entrenamiento fue de 1.024 tokens y se empleó precisión mixta bf16. El modelo base original es un modelo instruct de Qwen3, aunque no se especifican los idiomas de este modelo destilado. La técnica ADAPT permite construir modelos intermedios entre este estudiante y el profesor cambiando el número de capas a parchear.

## Capacidades

- Generación de texto en inglés, al haberse entrenado principalmente con The Pile deduplicada.
- Razonamiento matemático básico gracias al entrenamiento con el split de matemáticas de Llama Nemotron.
- Capacidad conversacional y de seguimiento de instrucciones, heredada del modelo base instruct.
- No se ha confirmado soporte de tool calling ni function calling en la información disponible.
- No se ha confirmado soporte de agentes ni multi-step reasoning.
- Capacidades multilingües no especificadas.

## Casos de uso

- Investigación en compresión y destilación de modelos: permite estudiar cómo el tamaño afecta al rendimiento, interpolando entre este modelo y el base Qwen3-4B-Instruct-2507 mediante la función `build_intermediate_model`.
- Prototipado rápido en entornos con poca memoria: al ser un modelo de 576M de parámetros, puede ejecutarse en GPUs de consumo o incluso en CPU para pruebas locales.
- Asistente de matemáticas en inglés: puede resolver problemas matemáticos sencillos y explicar pasos, dado su entrenamiento con el split de matemáticas de Llama Nemotron.
- Generación de texto en inglés en aplicaciones ligeras: ideal para chatbots o asistentes que no requieran modelos grandes.
- Educación y divulgación: sirve como modelo de referencia para enseñar técnicas de destilación y poda de modelos en cursos de aprendizaje automático.
- Ajuste fino adicional: al tener pocos parámetros, es fácil de ajustar para tareas específicas en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo.
- Estimación: los pesos en bf16 ocupan aproximadamente 1,15 GB, por lo que se necesitan al menos 2-3 GB de VRAM incluyendo activaciones.
- Cabe en GPUs de consumo como RTX 3060, RTX 4090 o equivalentes.
- Compatible con frameworks como vLLM, llama.cpp (requiere conversión a GGUF), Ollama y Transformers.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar este modelo con otras alternativas. El interés principal de ADAPT-Qwen3-2.3B-Instruct es la técnica de interpolación, no su rendimiento autónomo. Por tamaño, podría compararse con modelos de la familia Qwen3 de 0,6B, pero no hay resultados publicados que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Entrenado principalmente con texto en inglés; no se ha evaluado su rendimiento en otros idiomas.
- Su tamaño reducido (576M de parámetros) limita la capacidad de razonamiento complejo frente a modelos mayores.
- Riesgo de alucinación no documentado.
- No se han publicado evaluaciones de sesgos ni de seguridad.
- Aunque la licencia Apache 2.0 permite uso comercial, es un modelo de investigación sin garantías de producción.

## Enlaces

- HuggingFace: https://huggingface.co/Harvard-DCML/ADAPT-Qwen3-2.3B-Instruct
- Repositorio GitHub de ADAPT: https://github.com/dcml-lab/ADAPT
- Paper arXiv: https://arxiv.org/abs/2608.22854
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3: https://arxiv.org/abs/2505.09388
