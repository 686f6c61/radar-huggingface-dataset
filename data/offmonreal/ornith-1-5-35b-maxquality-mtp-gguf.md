# offmonreal/Ornith-1.5-35B-MaxQuality-MTP-GGUF

## Resumen

Ornith-1.5-35B-MaxQuality-MTP-GGUF es una cuantización GGUF del modelo de razonamiento Ornith-1.5-35B-A3B, desarrollado por Ornith AI y publicado por el usuario offmonreal en Hugging Face. El modelo base es un MoE (mezcla de expertos) de 35.5 mil millones de parámetros con aproximadamente 3 mil millones activos, diseñado para razonamiento avanzado, tool calling y tareas de agente. Esta versión cuantizada incorpora una cabeza de predicción multi-token (MTP) donante extraída de Qwen3.6-35B-A3B, ya que la cabeza nativa del modelo mostró una tasa de aceptación de draft significativamente inferior (34-41% frente a 57-61%). El resultado es un archivo GGUF optimizado para decodificación especulativa en hardware de consumo, con velocidades de hasta 145 tokens por segundo en configuraciones con toda la GPU.

La relevancia de este lanzamiento radica en su enfoque en la eficiencia para GPUs de consumo: el archivo Q2_K-AllGPU cabe completamente en 16 GB de VRAM sin offload a CPU, manteniendo una velocidad de ~145 tok/s. Además, la cabeza MTP donante permite mantener el rendimiento de generación incluso con contextos largos (más de 10K tokens), donde las versiones sin MTP degradan su velocidad. El modelo base, Ornith-1.5, extiende el framework de auto-scaffolding hacia un bucle de auto-mejora, proponiendo tareas, generando scaffolds y produciendo rollouts para aprendizaje por refuerzo. La licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.6-35B-A3B, con cabeza MTP donante |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | Aproximadamente 3B (según el sufijo A3B del modelo base) |
| Longitud de contexto | Hasta 200.144 tokens (configurado en los comandos de ejemplo; probado con prompts de ~112K tokens) |
| Tipos de cuantizacion | Q4_K_M, Q3_K_M, Q2_K (variante AllGPU) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer MoE con 35,5B parámetros totales y aproximadamente 3B activos por token, siguiendo la arquitectura de la familia Qwen3.6-35B-A3B. El modelo fue entrenado con un enfoque de auto-mejora: propone nuevas tareas, genera scaffolds específicos y produce rollouts de soluciones para aprendizaje por refuerzo, creando continuamente nuevas experiencias de aprendizaje. Esta versión cuantizada incorpora una cabeza MTP donante (extraída de Qwen3.6-35B-A3B) en lugar de la cabeza nativa del modelo, que mostró una tasa de aceptación de draft de solo 34-41% frente al 57-61% de la donante. La cabeza donante se cuantizó a Q4_K (para el archivo Q4_K_M) o Q3_K (para los archivos Q3_K_M y Q2_K-AllGPU), tras comprobar que no había diferencias significativas de aceptación entre Q8_0, Q6_K y Q4_K. El proceso de cuantización utilizó iMatrix con 802 chunks de calibración, y se aplicó un workaround para el bug del quantizer en la capa MTP (usando `--prune-layers 40` y reinsertando la cabeza después).

## Capacidades

- Razonamiento avanzado: el modelo base incluye un modo "thinking" que genera una cadena de pensamiento antes de la respuesta final.
- Tool calling / function calling: soporta bloques `<tool_call>` que pueden ser parseados para integración con APIs.
- Decodificación especulativa con MTP: la cabeza donante permite acelerar la generación manteniendo la calidad, con una tasa de aceptación de draft del 57-61%.
- Generación de texto y código: adecuado para tareas de programación y generación de contenido.
- Soporte de agentes y multi-step reasoning: el modelo puede encadenar múltiples pasos de razonamiento y llamadas a herramientas.
- Multilingüe: no confirmado explícitamente, pero al ser un modelo de razonamiento general es probable que soporte múltiples idiomas.

## Casos de uso

- Atención al cliente automatizada: con una ventana de contexto de hasta 200K tokens, el modelo puede gestionar conversaciones multi-turno largas sin perder el hilo, manteniendo la velocidad gracias a la decodificación especulativa MTP.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, con la ventaja de que la cuantización Q2_K-AllGPU cabe en una GPU de 16 GB.
- Análisis de documentos extensos: el contexto de 200K tokens permite procesar contratos, informes o papers completos en una sola pasada, con razonamiento para extraer conclusiones.
- Agentes autónomos: el modo "thinking" y el soporte de tool calling permiten construir agentes que planifican, ejecutan acciones y razonan sobre los resultados, ideal para automatización de tareas complejas.
- Asistente de programación con contexto de repositorio: puede cargar el contenido de un repositorio completo (hasta 200K tokens) y responder preguntas sobre el código, refactorizar o depurar.
- Traducción y resumen de textos largos: el contexto amplio y la capacidad de razonamiento permiten traducir o resumir documentos extensos manteniendo coherencia y precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo proporciona mediciones de velocidad de generación (no de calidad) en el hardware de prueba:

| Configuracion | Velocidad de generacion |
|---|---|
| Q4_K_M con MTP (draft-mtp, n-max 2) | ~60 tok/s |
| Q3_K_M con MTP (10 capas expertas en CPU) | ~85 tok/s |
| Q2_K-AllGPU con MTP (todo en GPU) | ~145 tok/s |

## Requisitos de hardware

- Q4_K_M (20,22 GiB): requiere GPU con al menos 20 GB de VRAM o offload parcial a CPU. En la prueba se usó una RTX 5060 Ti de 16 GB con 10 capas expertas en CPU, logrando ~60 tok/s.
- Q3_K_M (16,43 GiB): similar al anterior, con 10 capas expertas en CPU, logrando ~85 tok/s.
- Q2_K-AllGPU (12,62 GiB): cabe completamente en 16 GB de VRAM sin offload, logrando ~145 tok/s.
- Hardware de prueba: NVIDIA GeForce RTX 5060 Ti 16 GB, AMD Ryzen 9 5950X (16 núcleos/32 hilos), 64 GB de RAM.
- Despliegue: compatible con llama.cpp (llama-server), y por extensión con servidores que acepten GGUF como Ollama, LM Studio o vLLM (con adaptadores). Se recomienda usar el fork TurboQuant para aprovechar la cabeza MTP.
- Latencia: no se proporcionan datos de latencia por token, solo throughput.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de la misma categoría. El modelo base Ornith-1.5-35B-A3B pertenece a la familia de MoE de 35B con 3B activos, similar a Qwen3.6-35B-A3B (del que se extrajo la cabeza MTP donante). Existe una versión anterior, Ornith-1.0-35B-MaxQuality-MTP-GGUF, también publicada por offmonreal, pero no se dispone de sus especificaciones completas para comparar. Se recomienda consultar los benchmarks oficiales del modelo base en el sitio de Ornith AI.

## Limitaciones y advertencias

- La cabeza MTP utilizada es donante (de Qwen3.6-35B-A3B), no la nativa del modelo. Aunque la tasa de aceptación es superior, puede haber ligeras diferencias en la distribución de tokens generados respecto al modelo original.
- El rendimiento de la decodificación especulativa depende críticamente de la configuración de offload y del parámetro `--spec-draft-n-max` (el óptimo medido es 2; valores superiores degradan la velocidad).
- No se han publicado evaluaciones de sesgos, alucinación o robustez del modelo cuantizado. Se recomienda validar en el dominio de uso antes de desplegar en producción.
- Aunque la licencia MIT permite uso comercial, el modelo base puede tener limitaciones adicionales no documentadas en esta ficha.
- Los archivos GGUF están optimizados para llama.cpp; otros frameworks pueden no soportar la cabeza MTP o el formato TurboQuant.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/offmonreal/Ornith-1.5-35B-MaxQuality-MTP-GGUF
- Modelo base (Ornith AI): https://ornith.ai/ornith_1_5.html
- Sitio oficial de Ornith AI: https://ornith.ai/
- Imagen Docker del modelo base: https://hub.docker.com/r/ai/ornith-1.5
- Versión anterior (Ornith-1.0): https://huggingface.co/offmonreal/Ornith-1.0-35B-MaxQuality-MTP-GGUF
- Fork TurboQuant de llama.cpp: https://github.com/TheTom/llama-cpp-turboquant
