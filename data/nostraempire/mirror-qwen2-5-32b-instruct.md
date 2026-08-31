# NostraEmpire/mirror-qwen2.5-32b-instruct

## Resumen

El repositorio `NostraEmpire/mirror-qwen2.5-32b-instruct` es un espejo (mirror) del modelo oficial `Qwen/Qwen2.5-32B-Instruct`, desarrollado por el equipo Qwen de Alibaba Cloud. Se trata de un modelo de lenguaje causal de 32.500 millones de parámetros, ajustado mediante instrucciones, que forma parte de la serie Qwen2.5. Este mirror no introduce cambios sobre el modelo original; su propósito es ofrecer una copia alternativa para facilitar la descarga o el despliegue en infraestructuras específicas.

El modelo original destaca por su mejora significativa en generación de código, matemáticas, seguimiento de instrucciones, generación de texto largo (más de 8.000 tokens) y comprensión de datos estructurados. Soporta una ventana de contexto de hasta 131.072 tokens y genera hasta 8.192 tokens. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo convierte en una opción atractiva para entornos empresariales.

La relevancia actual de este modelo radica en su equilibrio entre rendimiento y requisitos de hardware: con 32B parámetros, ofrece capacidades cercanas a modelos de 70B en tareas de razonamiento y código, pero con un coste de inferencia menor. Es adecuado para despliegues en GPUs de alta gama o mediante cuantización en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y Attention QKV bias |
| Parametros totales | 32.763.876.352 (32,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (configuracion por defecto: 32.768; ampliable con YaRN) |
| Tipos de cuantizacion | No especificados en el repo; compatibles con GGUF, AWQ, GPTQ (comunidad) |
| Idiomas soportados | Ingles (segun la model card del mirror; el modelo original soporta 29+ idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer estándar de Qwen2.5: 64 capas, 40 cabezas de atención para consultas (Q) y 8 para claves/valores (KV) mediante Grouped Query Attention (GQA). Usa incrustaciones rotativas (RoPE), activación SwiGLU y normalización RMSNorm. El entrenamiento se realizó en dos fases: preentrenamiento sobre un corpus masivo (hasta 18 billones de tokens según la documentación de Qwen) y post-entrenamiento con ajuste por instrucciones, que incluye técnicas de alineación como RLHF y DPO (no detalladas en la model card). El modelo original incorpora mejoras específicas en generación de JSON, comprensión de tablas y robustez ante prompts de sistema diversos.

Para manejar contextos superiores a 32.768 tokens, se emplea la técnica YaRN (Yet another RoPE extensioN), que permite extrapolar la longitud de contexto hasta 131.072 tokens. La configuración por defecto del `config.json` limita a 32.768, pero se puede activar YaRN añadiendo la configuración `rope_scaling` correspondiente.

## Capacidades

- Generación de texto conversacional y de larga duración (hasta 8.192 tokens de salida).
- Razonamiento avanzado en matemáticas y lógica, con mejoras notables frente a Qwen2.
- Generación de código en múltiples lenguajes, con soporte para tool calling y function calling (aunque no se detalla explícitamente en la model card, es una capacidad conocida de la serie Qwen2.5).
- Comprensión de datos estructurados (tablas, JSON) y generación de salidas estructuradas en formato JSON.
- Seguimiento de instrucciones robusto, incluyendo prompts de sistema complejos y role-play.
- Multilingüismo: el modelo original soporta más de 29 idiomas, aunque el mirror declara solo inglés en su metadata.
- Procesamiento de contextos largos mediante YaRN, con recomendación de usar vLLM para despliegue.

## Casos de uso

- Atención al cliente automatizada: con 131K tokens de contexto, puede gestionar conversaciones multi-turno extensas y mantener el historial completo sin truncamiento, mejorando la coherencia en interacciones largas.
- Generación de código en producción: su capacidad de tool calling permite integrarlo en pipelines de CI/CD para autocompletar, revisar o documentar código, reduciendo la intervención manual.
- Análisis de documentos extensos: puede resumir o extraer información de contratos, informes o artículos de más de 100.000 tokens, gracias a su ventana de contexto ampliada.
- Asistente de programación con razonamiento matemático: útil para resolver problemas de algoritmia, generar explicaciones paso a paso y depurar código complejo.
- Generación de contenido estructurado: creación de informes, tablas y respuestas JSON para integración con APIs y sistemas de automatización.
- Chatbot empresarial multilingüe: aunque el mirror declara solo inglés, el modelo original soporta 29+ idiomas, permitiendo desplegar asistentes en español, francés, alemán, etc., con un solo modelo.
- Investigación académica: como modelo de referencia para experimentos de fine-tuning o evaluación de técnicas de alineación, gracias a su licencia abierta y disponibilidad de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen (https://qwenlm.github.io/blog/qwen2.5/) para resultados detallados, pero no se incluyen cifras concretas en este repositorio. Se recomienda consultar dicha fuente para comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo estándar sobre 32,5B parámetros):
  - FP16/BF16: ~65 GB (requiere GPU profesional como A100 80GB o H100)
  - Int8 (cuantización AWQ/GPTQ): ~33 GB (A100 40GB, RTX 6000 Ada)
  - Int4 (cuantización GPTQ/AWQ): ~17 GB (RTX 4090 24GB, A10 24GB)
- GPU recomendadas: A100 80GB, H100, RTX 4090 (con cuantización 4-bit), A6000 48GB.
- En consumer GPU: es posible ejecutar con cuantización 4-bit en RTX 4090 (24GB) o RTX 3090 (24GB), aunque con menor velocidad.
- Opciones de despliegue: vLLM (recomendado por el equipo Qwen), llama.cpp, Ollama (disponible como `qwen2.5:32b-instruct`), TGI (Text Generation Inference).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y la cuantización. Se puede consultar la documentación de Qwen para benchmarks de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-32B-Instruct (este) | 32,5B | 131K | Apache 2.0 | HuggingFace, ModelScope, Ollama |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | HuggingFace, Ollama |
| Mistral 7B Instruct v0.3 | 7B | 32K | Apache 2.0 | HuggingFace, Ollama |
| Qwen2.5-14B-Instruct | 14,7B | 131K | Apache 2.0 | HuggingFace, ModelScope |

El modelo de 32B ofrece un punto intermedio entre los modelos de 7-8B (que requieren menos hardware pero rinden menos en tareas complejas) y los de 70B (que exigen infraestructura de servidor). Su licencia Apache 2.0 es más permisiva que la de Llama 3.1, que impone restricciones para usuarios con más de 700 millones de usuarios mensuales.

## Limitaciones y advertencias

- El mirror declara únicamente inglés en su metadata, aunque el modelo original es multilingüe. Verificar el comportamiento en otros idiomas antes de usarlo en producción.
- La configuración por defecto limita el contexto a 32.768 tokens; para usar los 131K completos es necesario activar YaRN, lo que puede afectar al rendimiento en textos cortos (según la documentación de Qwen).
- Riesgo de alucinación inherente a todos los LLM; validar respuestas en aplicaciones críticas.
- No se han publicado resultados de benchmarks específicos en este repositorio; basar decisiones en la documentación oficial de Qwen.
- El modelo es un mirror, no un desarrollo independiente; cualquier actualización o corrección del modelo original debe seguirse desde el repositorio oficial.
- Para uso comercial, la licencia Apache 2.0 es permisiva, pero se recomienda revisar los términos completos de la licencia del modelo original.

## Enlaces

- Repositorio mirror: https://huggingface.co/NostraEmpire/mirror-qwen2.5-32b-instruct
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Página en Ollama: https://ollama.com/library/qwen2.5:32b-instruct
- ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-32B-Instruct
