# RedHatAI/Hy3-NVFP4-FP8

## Resumen

RedHatAI/Hy3-NVFP4-FP8 es una versión cuantizada del modelo Hy3 de Tencent, desarrollada por el equipo de Red Hat AI. El modelo original Hy3 es un transformer de arquitectura MoE (mezcla de expertos) con aproximadamente 298.800 millones de parámetros totales y una ventana de contexto de 256.000 tokens. Esta variante aplica una cuantización mixta: las capas MoE se cuantizan a NVFP4 (4 bits) y las capas de atención a FP8 (8 bits), lo que reduce significativamente los requisitos de VRAM en comparación con el modelo original, manteniendo una recuperación de precisión del 100 % en una muestra limitada de GPQA Diamond.

La relevancia de este modelo radica en que permite desplegar un LLM de gran tamaño en infraestructura más modesta, gracias a la reducción de memoria y al soporte nativo en vLLM. Está pensado para entornos de producción que requieren razonamiento avanzado, tool calling y generación de texto con contexto largo. La licencia MIT facilita su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) |
| Parametros totales | 298.786.155.776 (298,8 B) |
| Parametros activos | 172,8 B (segun LLM Explorer, no confirmado por el autor) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | NVFP4 (capas MoE) + FP8 (capas de atencion) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Hy3 de Tencent es un transformer con arquitectura MoE, donde cada token activa un subconjunto de expertos. La version cuantizada no ha sido reentrenada; se ha obtenido mediante el proceso de compresion de llm-compressor (PR 2928), que aplica cuantizacion NVFP4 a las capas MoE y FP8 a las capas de atencion. Esta combinacion busca equilibrar la reduccion de memoria con la preservacion de la calidad, ya que las capas de atencion son mas sensibles a la cuantizacion agresiva. El despliegue esta optimizado para vLLM, que soporta la carga de pesos cuantizados y la ejecucion con tensor parallelism.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto largo (256K tokens).
- Razonamiento avanzado y multi-step reasoning, con soporte de parser de razonamiento hy_v3.
- Tool calling / function calling, habilitado mediante el parser hy_v3 en vLLM.
- Capacidades multilingues: no especificadas por el autor, pero el modelo base Hy3 de Tencent suele cubrir chino e ingles.
- Compatible con despliegue en vLLM con auto-tool-choice y reasoning-effort configurable.

## Casos de uso

- Atencion al cliente automatizada: con 256K de contexto, puede gestionar conversaciones largas y mantener el historial completo del usuario, reduciendo perdidas de informacion en interacciones prolongadas.
- Agentes de razonamiento multi-paso: gracias al parser hy_v3 y al soporte de tool calling, puede encadenar llamadas a APIs y razonar sobre resultados intermedios en tareas como planificacion o analisis de datos.
- Generacion de codigo en produccion: integrable en pipelines de CI/CD mediante vLLM, con cuantizacion que permite ejecutarlo en GPUs de gama media sin sacrificar demasiada precision.
- Analisis de documentos extensos: su ventana de 256K permite procesar libros, informes anuales o codigo fuente completo en una sola pasada, sin necesidad de chunking.
- Asistente de investigacion: puede resumir y extraer conclusiones de articulos cientificos o patentes, apoyandose en su capacidad de razonamiento y contexto largo.
- Chatbot empresarial con licencia permisiva: al ser MIT, puede integrarse en productos comerciales sin coste de licencia, ideal para startups y empresas que necesitan un LLM potente y desplegable.

## Benchmarks y rendimiento

El autor reporta una recuperacion del 100 % en una muestra limitada del benchmark GPQA Diamond, evaluado con vLLM y reasoning-effort alto. No se han publicado resultados completos de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| GPQA Diamond (muestra limitada) | 100 % de recuperacion respecto al modelo original |

## Requisitos de hardware

- VRAM estimada: 170,1 GB segun LLM Explorer, lo que requiere multiples GPUs.
- GPU recomendadas: 4x A100/H100 de 80 GB, o 2x GPU de 96 GB (p.ej. A100 96GB o H200) con tensor parallelism.
- No cabe en una GPU de consumo (RTX 4090, 24 GB) ni en una sola GPU profesional de 48 GB.
- Opciones de despliegue: vLLM (recomendado, con el comando indicado en la model card), tambien compatible con transformers para carga de pesos.
- Latencia y throughput: no disponibles; dependen del hardware y la configuracion de tensor parallelism.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. Como referencia, el modelo base Hy3 de Tencent compite con otros MoE de gran tamano como DeepSeek-V3 o Qwen2.5-Max, pero no hay benchmarks publicos que permitan una comparacion directa con esta version cuantizada.

## Limitaciones y advertencias

- La cuantizacion NVFP4+FP8 puede introducir degradacion en tareas muy sensibles a la precision, aunque el autor reporta 100 % de recuperacion en GPQA Diamond (muestra limitada).
- Requiere una version especifica de vLLM con el PR 48769 para funcionar correctamente; sin el, el despliegue puede fallar.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de idioma; se recomienda evaluar en el dominio de uso.
- El modelo base Hy3 no esta documentado en profundidad en la informacion disponible; se asume que hereda las limitaciones tipicas de los LLM grandes (posibles sesgos, generacion de contenido incorrecto).
- Para produccion, es imprescindible validar el rendimiento en el caso de uso concreto, dado que la cuantizacion puede afectar a tareas especificas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Hy3-NVFP4-FP8
- Repositorio de archivos: https://huggingface.co/RedHatAI/Hy3-NVFP4-FP8/tree/main
- Proceso de creacion (llm-compressor PR): https://github.com/vllm-project/llm-compressor/pull/2928
- Requisito de vLLM (PR 48769): https://github.com/vllm-project/vllm/pull/48769
- Ficha en LLM Explorer: https://llm-explorer.com/model/RedHatAI%2FHy3-NVFP4-FP8,77iLTL7ti4VZRWRM1ourax
- Paquete llmcompressor en PyPI: https://pypi.org/project/llmcompressor/
