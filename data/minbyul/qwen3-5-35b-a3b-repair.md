# Minbyul/Qwen3.5-35B-A3B-Repair

## Resumen

Qwen3.5-35B-A3B-Repair es un modelo de lenguaje desarrollado por Minbyul como parte de un estudio controlado de cuatro brazos sobre intervenciones en datos de entrenamiento para agentes de búsqueda web. Se trata de un fine-tune supervisado del modelo base Qwen/Qwen3.5-35B-A3B, un transformer decoder-only de arquitectura mixture-of-experts (MoE) con aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activos por token. El modelo está entrenado sobre trayectorias de agentes de búsqueda web multi-turno, con una intervención denominada "reparación quirúrgica": las colas de sobre-búsqueda posteriores a la obtención de evidencia suficiente se truncan, y las trayectorias cuyo razonamiento no está fundamentado en el contenido recuperado se eliminan por completo.

Este modelo es relevante porque aborda el problema del "over-reflection" (reflexión excesiva) en agentes que navegan por la web, un comportamiento patológico donde el agente continúa buscando o verificando después de haber reunido la evidencia necesaria para responder. A diferencia de otros brazos del estudio que eliminan trayectorias completas (Drop) o filtran por corrección de la respuesta final (Correct), Repair conserva la parte saludable de las trayectorias patológicas y condiciona el entrenamiento en la calidad del proceso, no solo en el resultado. El modelo está disponible bajo licencia Apache 2.0, con pesos completos en formato safetensors (13 shards, ~65 GB en bf16) y una ventana de contexto de 131.072 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, mixture-of-experts (MoE) |
| Parametros totales | ~35.000 millones (35B) |
| Parametros activos | ~3.000 millones (3B) por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan cuantizaciones adicionales) |
| Idiomas soportados | Ingles (entrenado principalmente en trazas de razonamiento en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (13 shards, ~65 GB, bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-35B-A3B: un transformer decoder-only con mezcla de expertos (MoE), donde cada token activa aproximadamente 3.000 millones de parámetros de un total de 35.000 millones. El tokenizador, la configuración y la plantilla de chat/llamada a herramientas son idénticos a los del modelo base. El entrenamiento se realizó mediante fine-tuning supervisado de parámetros completos sobre un corpus interno de trayectorias de agentes de búsqueda web, con una longitud de secuencia de 131.072 tokens (trayectorias completas multi-turno con llamadas a herramientas intercaladas y resultados de herramientas).

La intervención de reparación se guía por una taxonomía A-G de comportamientos de over-reflection en agentes de navegación (bucles de verificación posteriores a la respuesta, re-búsquedas redundantes tras evidencia suficiente, razonamiento sin fundamento, etc.). Se aplican dos operaciones: (1) truncamiento de las colas de sobre-búsqueda posteriores a la evidencia, conservando el prefijo fundamentado, y (2) eliminación de trayectorias cuyo razonamiento o respuesta no está respaldado por el contenido realmente recuperado. El entrenamiento usó 2 épocas, tamaño de lote global 128, tasa de aprendizaje 5e-6 con decaimiento coseno hasta 5e-7, y función de pérdida de entropía cruzada a nivel de token en los turnos del asistente.

## Capacidades

- Generacion de texto con razonamiento explicito en contextos de agente de busqueda web multi-turno.
- Uso de herramientas (tool calling) compatible con superficies de herramientas de navegacion web: busqueda, apertura de paginas y busqueda dentro de la pagina.
- Razonamiento de multiples pasos (multi-step reasoning) integrado con llamadas a herramientas y resultados intermedios.
- Manejo de contexto largo (hasta 131.072 tokens) para trayectorias completas de agente.
- Capacidad de detener la busqueda cuando se ha reunido suficiente evidencia, gracias a la intervencion de truncamiento de colas de sobre-busqueda.
- Multilingue limitado: entrenado principalmente en ingles, con capacidades multilingues heredadas del modelo base no garantizadas.

## Casos de uso

- Investigacion academica sobre politicas de parada en agentes de navegacion web: el modelo permite estudiar si editar demostraciones en el punto de patologia (en lugar de eliminarlas o filtrarlas por resultado) transfiere una mejor politica de detencion al agente entrenado.
- Evaluacion de intervenciones de datos en fine-tuning de agentes: comparar el comportamiento de Repair frente a los brazos Asis, Drop y Correct en entornos de busqueda web controlados.
- Desarrollo de agentes de busqueda web con menor sobre-reflexion: el modelo puede servir como punto de partida para sistemas que necesitan decidir cuando detener la recopilacion de evidencia y emitir una respuesta.
- Benchmarking de agentes con tool calling en tareas de recuperacion de informacion multi-turno: su formato de entrenamiento con herramientas de busqueda, apertura de paginas y busqueda en pagina lo hace adecuado para evaluar pipelines de agentes.
- Estudio de robustez del razonamiento fundamentado: al haber sido entrenado solo con trayectorias con razonamiento anclado en contenido recuperado, puede usarse para probar si el modelo mantiene ese comportamiento ante entradas adversariales.
- Fine-tuning posterior para dominios especificos: al ser un modelo abierto con licencia permisiva, puede adaptarse a tareas de agentes en dominios verticales (e-commerce, documentacion tecnica, etc.) partiendo de una politica de parada mejorada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de investigacion y la model card no incluye metricas comparativas como MMLU, HumanEval o GSM8K. Tampoco se documentan evaluaciones especificas del entorno de agente de busqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65 GB para los pesos, mas overhead de activaciones y cache KV. Con una ventana de 131.072 tokens, la cache KV puede superar los 10-20 GB adicionales, por lo que se recomienda al menos 80 GB de VRAM.
- GPU recomendadas: NVIDIA A100 (80 GB), H100 (80 GB), o GPUs con 80 GB o mas. En configuraciones multi-GPU, se puede distribuir el modelo con tensor parallelism.
- En GPU de consumo: no cabe en bf16 en GPUs de 24 GB (RTX 4090, RTX 3090). Con cuantizacion a 4 bits (no documentada oficialmente, pero posible con herramientas como llama.cpp o GPTQ) el modelo podria caber en ~20 GB, aunque no hay datos oficiales de rendimiento.
- Opciones de despliegue: al ser compatible con transformers y tener formato safetensors, puede servirse con vLLM, TGI, o llama.cpp (si se convierten los pesos a GGUF). No se documenta compatibilidad con Ollama directamente, pero el modelo base Qwen3.5-35B-A3B esta disponible en Ollama, por lo que es probable que Repair pueda convertirse.
- Latencia y throughput: no disponibles. Dado el tamaño activo de 3B parametros, la latencia por token deberia ser moderada en hardware adecuado, pero no se proporcionan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-35B-A3B (base) | 35B / 3B | 131.072 | Apache 2.0 | Modelo base sin intervenciones, agente general con tool calling |
| Minbyul/Qwen3.5-35B-A3B-Asis | 35B / 3B | 131.072 | Apache 2.0 | Fine-tune sin intervencion (imita trayectorias sin editar) |
| Minbyul/Qwen3.5-35B-A3B-Drop | 35B / 3B | 131.072 | Apache 2.0 | Fine-tune con eliminacion de trayectorias patologicas completas |
| Minbyul/Qwen3.5-35B-A3B-Correct | 35B / 3B | 131.072 | Apache 2.0 | Fine-tune con filtrado por correccion de la respuesta final |
| Qwen3-30B-A3B | 30B / 3B | 131.072 | Apache 2.0 | MoE similar, orientado a razonamiento y codigo, sin intervenciones de agente |

La comparativa se centra en los brazos del mismo estudio, ya que comparten arquitectura, datos y receta de entrenamiento, diferenciandose solo en la intervencion de datos. Frente al modelo base, Repair introduce una politica de parada mas estricta, pero no es un asistente generalista.

## Limitaciones y advertencias

- Comportamiento especifico del dominio: el modelo esta ajustado para la superficie de herramientas de agente de busqueda web descrita en su entrenamiento; no es un fine-tune de asistente general y puede degradarse en tareas fuera de ese ambito.
- Riesgo de sub-verificacion: las demostraciones truncadas terminan en un punto de parada impuesto; el modelo puede no verificar suficientemente en situaciones donde se requiere confirmacion adicional genuina.
- Sin alineacion de seguridad adicional: no se aplico ningun proceso de RLHF o DPO mas alla de lo que proporciona el modelo base; puede generar contenido sesgado o inapropiado en contextos no controlados.
- Sesgo de idioma: entrenado principalmente en ingles, el rendimiento en otros idiomas puede ser inferior al del modelo base.
- Artefacto de investigacion: no se garantiza estabilidad ni soporte para produccion; las descargas y likes son cero, lo que indica que es un checkpoint experimental.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento del modelo en tareas estandar o en el entorno de agente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Repair
- Modelo base Qwen/Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Brazo Asis: https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Asis
- Brazo Drop: https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Drop
- Brazo Correct: https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Correct
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guia de Qwen 3.5 (2026): https://codersera.com/blog/qwen-3-5-complete-guide-2026/
- Pagina de Ollama para Qwen3.5-35B-A3B: https://ollama.com/library/qwen3.5:35b-a3b
- Articulo sobre serving de Qwen 3.6 35B-A3B (referencia de hardware): https://nosible.com/blog/what-350-experiments-taught-us-about-serving-qwen-3-6
