# Lural/Qwen3-8B

## Resumen

Qwen3-8B es un modelo de lenguaje causal de 8,2 mil millones de parámetros desarrollado por el equipo de Qwen (Alibaba), perteneciente a la tercera generación de la serie Qwen. Este repositorio, publicado por el usuario Lural, contiene una versión del modelo basada en Qwen/Qwen3-8B-Base, un ajuste posterior al preentrenamiento del checkpoint base. Qwen3-8B resuelve el problema de disponer de un modelo denso de tamaño medio que combine razonamiento profundo (modo thinking) con diálogo eficiente (modo non-thinking) en un único modelo, evitando necesidad de desplegar dos modelos distintos.

Su relevancia actual radica en que es uno de los modelos abiertos de referencia en la gama de 8B: supera a QwQ-32B en modo thinking y a los modelos instruct de Qwen2.5 en modo non-thinking en matemáticas, generación de código y razonamiento lógico, además de ofrecer soporte para más de 100 idiomas y capacidades de agente con tool calling. La arquitectura es un transformer denso con GQA (32 cabezas para Q y 8 para KV), 36 capas y una ventana de contexto nativa de 32.768 tokens, ampliable a 131.072 mediante YaRN. Se distribuye bajo licencia Apache 2.0 en formato safetensors (16,4 GB en el repositorio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (causal LM) con GQA |
| Parametros totales | 8.190.735.360 (8,2B; 6,95B sin embeddings) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantizacion | no disponible (pesos originales en BF16/FP16; el repo ocupa 16,4 GB) |
| Idiomas soportados | mas de 100 idiomas y dialectos (lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-8B emplea una arquitectura transformer decoder-only densa con 36 capas y Grouped Query Attention (32 cabezas de consulta y 8 de clave-valor), lo que reduce la memoria de la caché KV y mejora el throughput en inferencia con contextos largos. El modelo pasa por dos etapas de entrenamiento: preentrenamiento y post-entrenamiento (alineación). El modelo base es Qwen/Qwen3-8B-Base, sobre el que se aplica el post-training de la familia Qwen3.

La innovación más destacable es el soporte de conmutación integrada entre modo thinking y modo non-thinking dentro del mismo modelo, controlado mediante el parámetro `enable_thinking` del chat template. En modo thinking, el modelo genera un bloque `<think>...</think>` con su razonamiento antes de la respuesta final, similar a QwQ-32B. El post-training incluye refuerzo para razonamiento (matemáticas, código, lógica) y alineación con preferencias humanas para escritura creativa, role-playing y diálogos multi-turno. Para contextos de hasta 131.072 tokens se utiliza la técnica YaRN de extensión de contexto. El número exacto de tokens de preentrenamiento no está disponible en la información proporcionada.

## Capacidades

- Generacion de texto conversacional con alineación a preferencias humanas: escritura creativa, role-playing y diálogos multi-turno.
- Razonamiento lógico y matematico en modo thinking, con salida estructurada en bloque `<think>...</think>` separable del contenido final.
- Generacion de codigo, superando a los modelos instruct de Qwen2.5 según el equipo de Qwen.
- Seguimiento de instrucciones en ambos modos (thinking y non-thinking).
- Tool calling / function calling con integración precisa de herramientas externas en ambos modos.
- Capacidades de agente y razonamiento multi-paso, con rendimiento destacado entre modelos open source en tareas agénticas complejas.
- Soporte multilingue: mas de 100 idiomas y dialectos, con seguimiento de instrucciones multilingüe y traducción.
- Ventana de contexto larga ampliable a 131.072 tokens mediante YaRN para procesar documentos extensos.

## Casos de uso

- Asistentes conversacionales multi-turno: el modo non-thinking ofrece respuestas rápidas y naturales para chat general, mientras que el modo thinking se activa para consultas complejas, todo con un único modelo desplegado.
- Generacion de codigo y asistentes de programacion: puede integrarse en IDEs o pipelines de CI/CD mediante endpoints compatibles con la API de OpenAI (vLLM, SGLang) para revisión de código, generación de tests y refactorizaciones.
- Agentes autonomos y automatizacion con herramientas: su soporte de tool calling en ambos modos lo hace adecuado para frameworks de agentes que ejecutan funciones, consultan APIs o navegan por documentos en flujos de varios pasos.
- Resumen y analisis de documentos largos: con 131.072 tokens de contexto mediante YaRN, puede procesar informes, contratos o papers completos en una sola pasada.
- Traduccion y contenido multilingue: el soporte de más de 100 idiomas permite construir servicios de traducción y generación de contenido para audiencias internacionales.
- Razonamiento matematico y educacion: el modo thinking con decodificación ajustada (Temperature 0,6, TopP 0,95, TopK 20) es adecuado para resolver problemas de matemáticas y lógica paso a paso.
- Despliegue en hardware de consumo: con 8B de parámetros cabe en GPUs consumer cuantizado, lo que permite ejecución local privada con Ollama, LM Studio o llama.cpp para datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio concreto. La model card indica que el modelo supera a QwQ-32B (en modo thinking) y a los modelos instruct de Qwen2.5 (en modo non-thinking) en matemáticas, generación de código y razonamiento lógico común, remitiendo a las fuentes oficiales para las evaluaciones detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-18 GB en precisión BF16/FP16 (el repo ocupa 16,4 GB), mas la caché KV según el contexto; con cuantización a 4 bits (Q4_K_M en GGUF) en torno a 5-6 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 ejecuta el modelo en precisión completa; para cuantizaciones de 4 bits bastan GPUs de 8 GB como RTX 4060 Ti o RTX 3070. En entorno servidor, A100 o H100 permiten servir múltiples instancias con contexto largo.
- Consumer GPUs: si cabe; en 4 bits funciona en GPUs de 8 GB de VRAM, y en FP16 en GPUs de 24 GB.
- Opciones de despliegue: vLLM (>=0.8.5), SGLang (>=0.4.6.post1), TGI, llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers. Se requiere transformers >= 4.51.0 (versiones anteriores lanzan `KeyError: 'qwen3'`).
- Latencia y throughput: no disponible en la informacion proporcionada. Para el modo thinking se recomienda Temperature=0,6, TopP=0,95, TopK=20 y MinP=0; no usar decodificación greedy, ya que degrada el rendimiento y provoca repeticiones infinitas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-8B (este modelo) | 8,2B | 32.768 (131.072 con YaRN) | Denso, GQA | Apache 2.0 | Modo thinking/non-thinking, tool calling, 100+ idiomas |
| Llama 3.1 8B Instruct | 8B | 128.000 | Denso, GQA | Llama 3.1 Community License | Sin modo thinking nativo; licencia con restricciones adicionales |
| Mistral 7B Instruct v0.3 | 7,3B | 32.768 | Denso, GQA (sliding window) | Apache 2.0 | Sin modo thinking nativo; generación de contexto más limitada |
| DeepSeek-R1-Distill-Qwen-7B | 7,7B | 32.768 aprox. | Denso | MIT | Distilado de razonamiento, solo modo thinking, sin conmutación integrada |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada; como todo LLM entrenado con datos web a gran escala, puede reproducir sesgos presentes en su corpus de entrenamiento.
- Riesgo de alucinacion: inherente a modelos de lenguaje de este tamaño; en modo thinking el razonamiento puede ser correcto pero la respuesta final no siempre lo es, por lo que conviene verificación en tareas criticas.
- Limitaciones de contexto: 32.768 tokens nativos; superarlos requiere habilitar YaRN (hasta 131.072), lo que puede afectar al rendimiento.
- Decodificacion: en modo thinking no debe usarse decodificación greedy (Temperature=0), ya que provoca degradación del rendimiento y repeticiones infinitas.
- Idioma: la lista exacta de los 100+ idiomas soportados no está detallada en la model card; el rendimiento en idiomas de bajos recursos puede ser inferior.
- Licencia: Apache 2.0 permite uso comercial sin restricciones significativas, aunque la model card enlaza a la licencia original de Qwen/Qwen3-8B para consulta.
- Este repositorio (Lural/Qwen3-8B) es una republicación de terceros con muy pocas descargas (258) y sin likes; para producción se recomienda valorar el repositorio oficial Qwen/Qwen3-8B, que cuenta con mantenimiento directo del equipo de Qwen.
- Los ejemplos de código de la model card apuntan al repositorio oficial (Qwen/Qwen3-8B), no a este mirror.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Lural/Qwen3-8B
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3-8B
- Licencia original de Qwen3: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Demo oficial (Qwen Chat): https://chat.qwen.ai/
- Documentacion de despliegue con SGLang: https://qwen.readthedocs.io/en/latest/deployment/sglang.html#thinking-non-thinking-modes
- Documentacion de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html#thinking-non-thinking-modes
- Papers referenciados (arXiv): https://arxiv.org/abs/2309.00071 y https://arxiv.org/abs/2505.09388
