# fzcfweasdferttgg/Ling-3.0-flash-abliterated-GGUF

## Resumen

Ling-3.0-flash-abliterated-GGUF es una versión cuantizada en formato GGUF del modelo Ling-3.0-flash de InclusionAI, tras ser sometido a un proceso de "abliteration" (eliminación de negativas) por el usuario SC117 mediante la herramienta abliterix v6 trial 21. El modelo resultante conserva la arquitectura original bailingmoe3, un MoE híbrido con 124B parámetros totales y 5,1B activos, y una ventana de contexto nativa de 256K tokens, extensible hasta 1M. Esta versión abliterated elimina los rechazos típicos de seguridad del modelo base, lo que la hace especialmente útil para tareas de generación creativa o investigación sin restricciones, aunque con los riesgos éticos asociados.

El repositorio actual ofrece tanto cuantizaciones estáticas estándar (Q2_K a Q8_0) como cuantizaciones APEX de precisión mixta (Quality, Balanced, Compact), todas ellas sin necesidad de imatrix. El modelo está diseñado para ejecutarse con llama.cpp (requiere el PR #26608 para soporte de la arquitectura bailingmoe3) y es compatible con vLLM, TGI y otros motores que soporten MoE híbridos. Su licencia MIT permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para despliegues en producción.

La relevancia de este modelo radica en que combina un tamaño manejable (5,1B activos) con una capacidad de razonamiento y tool calling mejorada respecto a la generación anterior de Ling, y la flexibilidad de las cuantizaciones GGUF permite ejecutarlo en hardware variado, desde estaciones de trabajo con múltiples GPUs hasta servidores con A100/H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailingmoe3 (MoE híbrido con atención lineal y capa MTP) |
| Parametros totales | 127.486.405.600 (aprox. 124B) |
| Parametros activos | 5,1B (según model card) o 5,5B (según vLLM) |
| Longitud de contexto | 256K nativo, extensible a 1M |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_M, Q5_K_M, Q6_K, Q8_0, APEX-Quality, APEX-Balanced, APEX-Compact |
| Idiomas soportados | No disponible (presumiblemente multilingüe, pero no especificado) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors del modelo base disponibles en inclusionAI/Ling-3.0-flash) |

## Arquitectura y entrenamiento

Ling-3.0-flash utiliza la arquitectura bailingmoe3, un diseño MoE híbrido que combina atención lineal con capas de mezcla de expertos. El modelo tiene 124B parámetros totales, de los cuales solo 5,1B se activan por token, lo que permite una inferencia eficiente. Además, incorpora una capa de predicción multi-token (MTP) de 3,1B parámetros, que mejora la velocidad de decodificación y la coherencia del texto generado. La versión abliterated se obtiene aplicando la técnica abliterix v6 trial 21 sobre el modelo base, que modifica los pesos para eliminar las respuestas de rechazo (refusals) sin afectar significativamente las capacidades generales.

El modelo base fue entrenado por InclusionAI con un enfoque en tareas de razonamiento de largo horizonte, tool calling y compatibilidad con entornos de agentes. Según la documentación oficial, Ling-3.0-flash muestra una estabilidad mejorada en tareas que requieren múltiples pasos y una mayor precisión en la invocación de herramientas comparado con la generación anterior. No se dispone de detalles específicos sobre el volumen de datos de entrenamiento ni sobre el uso de RLHF o DPO, pero la arquitectura y las capacidades sugieren un entrenamiento extensivo con datos multilingües y de código.

Las cuantizaciones GGUF se generaron con llama-quantize (estáticas) y con el método APEX de precisión mixta (mudler/apex-quant). En las configuraciones APEX, los routers y la capa MTP se mantienen en Q8_0 para preservar la precisión crítica, mientras que los expertos y las capas de atención se cuantizan de forma adaptativa según el perfil elegido.

## Capacidades

- Generación de texto de alta calidad, con especial fortaleza en razonamiento complejo y tareas de múltiples pasos.
- Soporte de tool calling / function calling, con precisión mejorada según la documentación de InclusionAI.
- Capacidad de razonamiento y planificación para agentes autónomos, incluyendo entornos Harness.
- Ventana de contexto nativa de 256K tokens, ampliable a 1M, ideal para documentos largos, análisis de código extenso o conversaciones prolongadas.
- Decodificación especulativa mediante la capa MTP, que acelera la generación sin pérdida de calidad.
- Capacidades multilingües (idiomas no especificados, pero probablemente incluye inglés, chino y otros).
- Al ser abliterated, no presenta respuestas de rechazo ante solicitudes controvertidas, lo que permite una generación sin restricciones de contenido (con las implicaciones éticas correspondientes).

## Casos de uso

- Atención al cliente automatizada: gracias a su contexto de 256K tokens y su capacidad de tool calling, puede gestionar conversaciones multi-turno largas, consultar bases de conocimiento externas y resolver incidencias complejas sin perder el hilo.
- Generación de código en producción: soporta múltiples lenguajes y puede integrarse en pipelines de CI/CD para autocompletar, revisar código o generar documentación técnica. Su tamaño activo de 5,1B permite desplegarlo con baja latencia en entornos de servidor.
- Análisis de documentos extensos: la ventana de 256K tokens permite procesar libros completos, informes anuales o expedientes legales en una sola pasada, extrayendo resúmenes o respondiendo preguntas específicas.
- Agentes autónomos de investigación: con su capacidad de razonamiento multi-paso y tool calling, puede actuar como agente que navega por la web, consulta APIs y sintetiza resultados para tareas de investigación de mercado o académica.
- Generación creativa sin restricciones: al estar abliterated, es útil para escribir ficción, guiones o contenido que el modelo base podría rechazar por políticas de seguridad, aunque debe usarse con responsabilidad.
- Asistencia en entornos de desarrollo con recursos limitados: las cuantizaciones Q4_K_M (~70 GB) o APEX-Compact permiten ejecutar el modelo en una sola GPU de 80 GB (A100/H100) o en configuraciones multi-GPU con tarjetas de 24 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión abliterated en la información disponible. El modelo base Ling-3.0-flash ha sido evaluado por InclusionAI, pero no se han compartido cifras concretas en las fuentes consultadas. Se recomienda consultar la documentación oficial del modelo base para obtener datos de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada según cuantización:
  - Q2_K (~40 GB): requiere una GPU de 48 GB (A6000) o dos de 24 GB (RTX 4090) en configuración multi-GPU.
  - Q3_K_M (~55 GB): necesita al menos una GPU de 80 GB (A100/H100) o dos de 48 GB.
  - Q4_K_M (~70 GB): una GPU de 80 GB es suficiente, o dos de 48 GB.
  - Q8_0 (~140 GB): requiere múltiples GPUs de 80 GB (por ejemplo, 2×A100) o configuración con memoria unificada.
- GPUs recomendadas: A100 80GB, H100 80GB, A6000 48GB, o múltiples RTX 4090 (24GB) con NVLink o agregación por software.
- No cabe en GPUs consumer de 8-16 GB; la opción más ligera (Q2_K) ya supera los 24 GB.
- Opciones de despliegue: llama.cpp (con PR #26608), vLLM (con soporte para bailingmoe3), TGI, Ollama (si se actualiza a la versión con soporte), y servidores de inferencia personalizados.
- Latencia y throughput: no se han publicado cifras oficiales. Con 5,1B activos y decodificación especulativa, se espera una velocidad de generación de 20-40 tokens/s en una A100 80GB con cuantización Q4_K_M, aunque estos valores son estimaciones basadas en modelos MoE similares.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.0-flash-abliterated (este) | 124B | 5,1B | 256K (1M ext.) | MIT | GGUF |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-MoE A14B | 42B | 14,3B | 128K | Qwen License | GGUF, safetensors |
| DeepSeek-V2-Lite | 16B | 2,4B | 128K | MIT | safetensors |

Ling-3.0-flash se destaca por su contexto extremadamente largo (256K) y su bajo número de parámetros activos en relación al total, lo que lo hace más eficiente que Mixtral y Qwen2.5-MoE en tareas que requieren ventanas extensas. Su licencia MIT es más permisiva que la de Qwen. Sin embargo, no se dispone de datos de rendimiento comparativos para confirmar superioridad en benchmarks específicos.

## Limitaciones y advertencias

- Al ser abliterated, el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtros de seguridad. Su uso en producción debe contemplar salvaguardas externas (moderación, filtros de contenido) para evitar riesgos legales y reputacionales.
- No se ha verificado el rendimiento en tareas de seguridad y alineación; el proceso de abl iteración puede degradar ligeramente la calidad en dominios sensibles.
- La documentación oficial no especifica los idiomas soportados; es probable que tenga un sesgo hacia inglés y chino, dado el origen del modelo.
- Riesgo de alucinación en tareas de razonamiento complejo, especialmente con contextos muy largos; se recomienda validación humana en aplicaciones críticas.
- La cuantización puede introducir pérdida de precisión, particularmente en las versiones más agresivas (Q2_K, APEX-Compact). Para tareas que requieren alta fidelidad, se recomienda usar Q5_K_M o superior.
- Requiere versiones recientes de llama.cpp (PR #26608) o vLLM con soporte bailingmoe3; no todos los motores de inferencia lo soportan todavía.
- El tamaño del repositorio (288,8 GB) implica un coste de descarga y almacenamiento considerable si se desean todas las cuantizaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fzcfweasdferttgg/Ling-3.0-flash-abliterated-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Modelo abliterated original (SC117): https://huggingface.co/SC117/Ling-3.0-flash-abliterated-APEX-GGUF
- Herramienta abliterix: https://github.com/wuwangzhang1216/abliterix
- Método APEX quantization: https://github.com/mudler/apex-quant
- Documentación oficial de Ling: https://developer.ant-ling.com/en/docs/models/ling/
- vLLM recipes: https://recipes.vllm.ai/inclusionAI/Ling-3.0-flash
- PR de llama.cpp para bailingmoe3: https://github.com/ggml-org/llama.cpp/pull/26608
