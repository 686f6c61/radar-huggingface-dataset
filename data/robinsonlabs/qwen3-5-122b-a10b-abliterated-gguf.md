# RobinsonLabs/Qwen3.5-122B-A10B-abliterated-GGUF

## Resumen

Qwen3.5-122B-A10B-abliterated-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen3.5-122B-A10B, desarrollada por RobinsonLabs. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 122B parámetros totales y un presupuesto de 10B parámetros activos por token (A10B). El modelo original ha sido sometido a un proceso de abliteración (método D41H) que reduce el reflejo de rechazo en contenidos adultos o creativos, manteniendo las guardarraíles de seguridad para daño autoinfligido. RobinsonLabs ha cuantizado el checkpoint abliterado en una escalera completa de cuantizaciones GGUF, con importancia-matriz (imatrix), conservando el bloque de Multi-Token Prediction (MTP/NextN) para decodificación especulativa. Estos archivos son exclusivamente de texto: la torre de visión del checkpoint original no se incluye en la conversión GGUF. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen35moe) |
| Parametros totales | 124.635.206.144 (safetensors bf16) |
| Parametros activos | 10B (A10B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, IQ3_M, Q3_K_S, IQ3_XS, Q2_K, IQ2_M, IQ2_XS |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (y safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-122B-A10B, una arquitectura MoE con 122B parámetros totales y 10B activos por token. La estructura interna de la capa MoE se compone de 49 bloques y 899 tensores en el tronco, más un bloque adicional de 20 tensores para MTP/NextN, que se conserva íntegro tras la abliteración y la cuantización. Esto permite que los runtimes compatibles puedan usar el camino de decodificación especulativa. La abliteración aplicada por RobinsonLabs es un procedimiento de ortogonalización de pesos en una sola dirección que reduce la respuesta de rechazo en prompts de contenido adulto o creativo, manteniendo la capacidad general del modelo (5/5 en su sonda de capacidad). No se dispone de información detallada sobre los datos de entrenamiento originales, número de tokens, ni procesos de alineación como RLHF o DPO.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas: la sonda de capacidad del autor evalua razonamiento, codigo, matematicas, conocimiento factual y seguimiento de instrucciones, con resultado 5/5.
- Multi-Token Prediction (MTP/NextN): preservado tras la abliteracion y la cuantizacion, disponible para runtimes que soporten decodificacion especulativa.
- Contenido creativo y adulto: al estar abliterated, reduce significativamente los rechazos en prompts de este tipo (3/25 rechazos en una sonda generica de 25, frente a 25/25 del modelo base sin abliterar).
- Guardarrailes de seguridad retenidas: los prompts de autodano siguen redirigiendo a ayuda (por ejemplo, 988), y la sonda de guardarrailes para seguridad infantil se mantiene en 10/10.
- Sin soporte de vision: los archivos GGUF son solo de texto; la torre de vision del checkpoint original no se incluye.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de codigo en produccion: gracias a su gran capacidad de razonamiento y a los 10B activos, puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests o autocompletado avanzado, siempre que el entorno de despliegue tenga suficiente memoria para los pesos cuantizados.
- Asistentes de escritura creativa: el proceso de abliteracion reduce los rechazos en contenido creativo adulto, permitiendo aplicaciones de generacion narrativa o guionizacion en las que el modelo no se niega sistematicamente a desarrollar temas sensibles.
- Analisis y resumen de documentos largos: aunque la longitud de contexto no esta especificada, un modelo de este tamano es adecuado para procesar documentos extensos en tareas de extraccion de informacion, resumen o preguntas y respuestas sobre corpus tecnicos.
- Razonamiento matematico y cientifico: la sonda de capacidad incluye matematicas y razonamiento, por lo que puede emplearse en tutoria inteligente, resolucion de problemas complejos o como motor de calculo simbolico con explicaciones en lenguaje natural.
- Agentes de investigacion con decodificacion especulativa: el bloque MTP preservado permite usar la decodificacion especulativa en runtimes compatibles, reduciendo la latencia en sistemas de agente con multiples pasos de razonamiento.
- Generacion de contenido en entornos con licencia permisiva: la licencia Apache-2.0 permite uso comercial, redistribucion y modificacion, lo que facilita su integracion en productos propietarios sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son las pruebas internas del autor sobre el checkpoint abliterado:

| Prueba | Modelo base sin abliterar | Este modelo (D41H) |
|---|---|---|
| Sonda generica de rechazo (n=25, rechazos, menor es mejor) | 25/25 | 3/25 |
| Sonda de capacidad (razonamiento, codigo, matematicas, factual, instrucciones) | 5/5 | 5/5 |
| Guardarrailes de seguridad infantil (n=10, mantenidos, juez LLM) | no ejecutado | 10/10 |

Estos valores son medidas propias del autor y no deben compararse directamente con benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion, los pesos ocupan desde 38.34 GB (IQ2_XS) hasta 132.56 GB (Q8_0). Para ejecutar el modelo completo se requiere al menos esa cantidad de memoria GPU, mas el espacio para los estados de la atencion y el buffer de contexto.
- GPU recomendadas: para cuantizaciones de alta calidad como Q8_0 o Q6_K se necesitan configuraciones multi-GPU (por ejemplo, 2x H100 80GB o 4x RTX 4090). Las cuantizaciones Q4_K_M (75.84 GB) o menores pueden ejecutarse en una sola GPU de 80GB como A100 o H100, o en varias RTX 4090 con particionado.
- Si cabe en GPU de consumo: si, con cuantizaciones bajas como IQ2_XS o IQ3_XS (38-52 GB), puede ejecutarse en una RTX 4090 de 24GB solo si se usa offloading a CPU o particionado en varias GPU; en una sola GPU de 24GB no cabe completa.
- Opciones de despliegue: al ser archivos GGUF, pueden servirse con llama.cpp, Ollama y otros motores compatibles con GGUF. vLLM puede cargar GGUFs con algunos backends, pero no esta confirmado en la informacion. Tambien se puede usar el repo de safetensors abliterated para cargar con vLLM o TGI en precision bf16.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-122B-A10B (base) | 124.6B | 10B | no disponible | Apache-2.0 | Safetensors, incluye vision |
| RobinsonLabs/Qwen3.5-122B-A10B-abliterated (safetensors) | 124.6B | 10B | no disponible | Apache-2.0 | Safetensors, sin vision |
| RobinsonLabs/Qwen3.5-122B-A10B-abliterated-GGUF | 124.6B | 10B | no disponible | Apache-2.0 | GGUF, sin vision |
| RobinsonLabs/Qwen3.5-122B-A10B-REAP-30-abliterated-GGUF | ~88B (podado) | no disponible | no disponible | Apache-2.0 | GGUF, sin vision, mas pequeno |

No se dispone de comparaciones con otros modelos MoE del mercado (como Mixtral o DeepSeek) en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al no estar afinado con alineacion exhaustiva (RLHF/DPO), puede heredar sesgos del modelo base.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se aportan medidas concretas de mitigacion.
- Abliterated: el modelo reduce los rechazos en contenido adulto o creativo. El autor advierte que no esta destinado a asistir en actividades ilicitas reales, pero la responsabilidad del uso recae en el usuario.
- Guardarrailes de seguridad retenidas: la sonda de autodano sigue funcionando, aunque el autor indica que la puntuacion de marcadores de rechazo por expresiones regulares fue de 1/10 porque el modelo desvia en prosa coherente en lugar de decir "no puedo".
- Solo texto: no incluye la torre de vision del checkpoint original. Para tareas multimodales hay que usar el repo de safetensors base.
- Problema conocido con la escalera anterior: los archivos publicados entre junio de 2026 y el re-upload estaban abliterados solo de nombre. Es necesario re-descargar y verificar los hashes SHA256 publicados en la model card. El archivo Q2_K no fue reemplazado y no es significativamente abliterated; se recomienda usar IQ2_XS o IQ2_M.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo esta etiquetado como "not-for-all-audiences". En despliegues publicos, revisar las politicas de contenido aplicables.

## Enlaces

- Repositorio GGUF abliterated: https://huggingface.co/RobinsonLabs/Qwen3.5-122B-A10B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Repositorio safetensors abliterated: https://huggingface.co/RobinsonLabs/Qwen3.5-122B-A10B-abliterated
- Variante podada REAP-30: https://huggingface.co/RobinsonLabs/Qwen3.5-122B-A10B-REAP-30-abliterated-GGUF
