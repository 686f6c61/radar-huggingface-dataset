# qtum/Qwen3-14B-GPTQ

## Resumen

Qwen3-14B-GPTQ es una cuantizacion de 4 bits (W4A16) del modelo denso Qwen/Qwen3-14B, producida por el usuario qtum mediante la herramienta llm-compressor en formato compressed-tensors. El objetivo es reducir el peso de memoria a aproximadamente una cuarta parte del tamaño original en bf16, manteniendo una calidad cercana al modelo base, para facilitar el despliegue eficiente con motores de inferencia como vLLM y SGLang.

El modelo base Qwen3-14B, desarrollado por Alibaba, es un transformer causal denso con 14.768 millones de parametros, una ventana de contexto nativa de 32.000 tokens y un modo de razonamiento dual (thinking y non-thinking) que permite alternar entre respuestas razonadas y directas. Esta cuantizacion hereda todas las capacidades del modelo original, incluida la generacion de texto, codigo, matematicas, tool calling y soporte multilingue (ingles y chino), siendo una opcion atractiva para entornos con recursos limitados que requieran un LLM de alto rendimiento.

La relevancia de este checkpoint radica en su compatibilidad plug-and-play con vLLM y SGLang: la configuracion de cuantizacion esta declarada en `config.json` y se detecta automaticamente, sin necesidad de flags adicionales. Esto lo convierte en una alternativa directa al modelo base en produccion, con menor huella de VRAM y mayor throughput, manteniendo la licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (causal LM, base Qwen3-14B) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens (nativo del modelo base) |
| Tipos de cuantizacion | GPTQ W4A16 (4 bits, error-compensated) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-14B, un transformer causal con atencion por ventana deslizante y mecanismos de razonamiento hibrido. El modelo base fue entrenado con un corpus masivo multilingue y posteriormente ajustado con instrucciones y preferencias humanas, incluyendo tecnicas de RLHF y DPO, lo que le confiere capacidades de razonamiento explicito (modo thinking) y respuestas directas (modo non-thinking). La cuantizacion GPTQ W4A16 aplica una cuantizacion de pesos de 4 bits con compensacion de error basada en informacion de segundo orden, manteniendo las activaciones en 16 bits. El proceso se realizo con llm-compressor de vLLM, que genera el formato compressed-tensors, y no introduce cambios en los pesos mas alla de la reduccion de precision. No se ha realizado ningun entrenamiento adicional sobre el modelo base.

## Capacidades

- Generacion de texto conversacional y completado de instrucciones en ingles y chino, con formato ChatML.
- Razonamiento logico y matematico, incluyendo modo thinking que produce cadenas de razonamiento explicito antes de la respuesta final.
- Generacion de codigo y comprension de lenguajes de programacion, heredado del modelo base.
- Soporte de tool calling y function calling, permitiendo integracion con APIs y agentes.
- Capacidad de alternar entre modos de razonamiento (thinking/no-thinking) mediante el prompt de sistema.
- Procesamiento de contexto largo de hasta 32.000 tokens, adecuado para documentos extensos y conversaciones multi-turno.

## Casos de uso

- Asistentes conversacionales en produccion: el modelo puede gestionar dialogos multi-turno con contexto largo gracias a su ventana de 32K tokens, manteniendo coherencia en sesiones prolongadas. Su cuantizacion 4 bits permite desplegarlo en GPUs de gama media con baja latencia.
- Generacion de codigo en entornos CI/CD: soporta tool calling, por lo que puede integrarse en pipelines de desarrollo para autocompletar, revisar o generar tests, reduciendo el coste de inferencia frente al modelo en bf16.
- Analisis de documentos tecnicos: su capacidad de razonamiento y contexto largo permite resumir, extraer informacion o responder preguntas sobre manuales, papers o contratos extensos.
- Automatizacion de soporte al cliente: con el modo non-thinking se obtienen respuestas rapidas y directas, mientras que el modo thinking permite resolver consultas complejas que requieren pasos logicos.
- Agentes autonomos con tool calling: puede actuar como backend de agentes que necesitan llamar a APIs, consultar bases de datos o ejecutar acciones, gracias a su soporte nativo de function calling.
- Despliegue en entornos con restriccion de VRAM: al ocupar aproximadamente 9.9 GB en disco y requerir menos de 12 GB de VRAM en cuantizacion 4 bits, es viable en GPUs como RTX 3060 12GB o A10G, habilitando inferencia local en servidores modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion en la informacion disponible. El modelo base Qwen3-14B ha demostrado un rendimiento solido en tareas de razonamiento, codigo y matematicas en las evaluaciones oficiales de Qwen, pero no se dispone de numeros comparativos para esta version GPTQ. Se recomienda consultar la documentacion del modelo base para referencia, aunque los resultados pueden variar ligeramente debido a la cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10-12 GB en cuantizacion W4A16, dependiendo de la longitud de contexto y el tamano de lote.
- GPU recomendadas: NVIDIA RTX 3060 12GB, RTX 4080, A10G, A100 40GB o superiores. No cabe en GPUs de 8 GB sin tecnicas adicionales de offloading.
- Despliegue compatible con vLLM y SGLang mediante el formato compressed-tensors, sin flags adicionales.
- Tambien puede ejecutarse con Hugging Face Transformers usando AutoGPTQ, aunque con menor rendimiento que vLLM.
- Throughput estimado: en vLLM con una A100 40GB, se pueden alcanzar decenas de tokens por segundo en modo non-thinking; el modo thinking reduce el throughput por la generacion de razonamiento intermedio.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| qtum/Qwen3-14B-GPTQ | 14.77B | GPTQ W4A16 | 32K | Apache 2.0 | compressed-tensors |
| AlphaGaO/Qwen3-14B-GPTQ | 14.77B | GPTQ (bits=4, group_size=128, Marlin) | 32K | Apache 2.0 | safetensors (Marlin) |
| Qwen/Qwen3-14B (base) | 14.77B | bf16 | 32K | Apache 2.0 | safetensors |

La diferencia principal entre las dos cuantizaciones GPTQ reside en el formato interno: qtum usa compressed-tensors (compatible con vLLM y SGLang de forma nativa), mientras que AlphaGaO emplea formato Marlin, optimizado para kernels especificos. El modelo base en bf16 ocupa aproximadamente 30 GB, por lo que la cuantizacion reduce significativamente los requisitos de memoria.

## Limitaciones y advertencias

- Al ser una cuantizacion de 4 bits, puede producirse una ligera degradacion de calidad en tareas de razonamiento complejo o generacion de codigo muy tecnico, aunque la compensacion de error de GPTQ minimiza este efecto.
- El modelo hereda los sesgos presentes en los datos de entrenamiento de Qwen3-14B, que pueden manifestarse en respuestas estereotipadas o culturalmente sesgadas, especialmente en contextos no representados en sus idiomas principales (ingles y chino).
- Riesgo de alucinacion inherente a los LLM: puede generar informacion factualmente incorrecta, especialmente en modo non-thinking donde no se muestra el razonamiento.
- La ventana de contexto de 32K tokens es nativa, pero en la practica el rendimiento puede degradarse con contextos muy largos o al usar modos de razonamiento extensos.
- Aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del usuario verificar que el uso cumple con las politicas del modelo base y las regulaciones aplicables.
- No se proporcionan garantias de rendimiento para todos los escenarios; se recomienda validar el modelo en el caso de uso especifico antes de desplegarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qtum/Qwen3-14B-GPTQ
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Documentacion de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Guia de cuantizacion GPTQ para Qwen3: https://github.com/QwenLM/Qwen3/blob/main/docs/source/quantization/gptq.md
- Herramienta llm-compressor: https://github.com/vllm-project/llm-compressor
- Cuantizacion alternativa de AlphaGaO: https://huggingface.co/AlphaGaO/Qwen3-14B-GPTQ
