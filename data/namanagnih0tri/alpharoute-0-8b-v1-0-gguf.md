# NamanAgnih0tri/AlphaRoute-0.8B-v1.0-GGUF

## Resumen

AlphaRoute-0.8B-v1.0-GGUF es un modelo de lenguaje compacto (0,75 mil millones de parámetros) especializado en routing semántico de intenciones condicionado por instrucciones y en extracción de información estructurada. Desarrollado por NamanAgnih0tri, se basa en el modelo Qwen/Qwen3.5-0.8B-Base y se distribuye en formato GGUF cuantizado, lo que permite su ejecución en entornos con recursos limitados como CPUs de borde o GPUs de baja gama.

El modelo resuelve el problema de la clasificación de intenciones con categorías dinámicas definidas en tiempo de ejecución, sin necesidad de reentrenamiento. A diferencia de los clasificadores tradicionales con cabezas de salida fijas, AlphaRoute actúa como un meta-router zero-shot: acepta un conjunto arbitrario de categorías con descripciones semánticas, extrae parámetros de la consulta y produce una decisión en JSON estructurado, incluyendo la detección de consultas fuera de alcance (out-of-scope).

Su relevancia actual radica en la demanda de modelos pequeños y eficientes para tareas de enrutamiento en asistentes virtuales, automatización de atención al cliente y pipelines de agentes, donde la latencia y el consumo de recursos son críticos. La licencia Apache-2.0 permite uso comercial sin restricciones, y la disponibilidad de cuantizaciones Q4_K_M y Q8_0 facilita su despliegue multiplataforma mediante llama.cpp, Ollama o LM Studio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-0.8B-Base) |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (según quickstart; no confirmado oficialmente) |
| Tipos de cuantizacion | Q4_K_M (503 MB), Q8_0 (774 MB) |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp compatible) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo base Qwen/Qwen3.5-0.8B-Base, que emplea una arquitectura transformer decoder-only. No se han publicado detalles específicos sobre el proceso de entrenamiento: no se indica el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La model card únicamente describe el comportamiento funcional del modelo y proporciona recomendaciones de prompt engineering, lo que sugiere que fue entrenado mediante supervisión directa sobre pares de consulta-esquema JSON, pero esta información no está confirmada.

La innovación principal no reside en la arquitectura, sino en el diseño de tarea: el modelo está entrenado para seguir instrucciones que definen categorías, esquemas de salida y ejemplos few-shot en tiempo de inferencia, permitiendo una adaptación dinámica sin reentrenamiento. Esta capacidad de "meta-routing" se logra mediante el condicionamiento por instrucciones y la generación restringida de JSON, aunque no se documentan mecanismos técnicos específicos como decodificación restringida o atención lineal.

## Capacidades

- Routing semántico de intenciones con categorías definidas en tiempo de ejecución, incluyendo descripciones semánticas y reglas de activación.
- Extracción de slots y parámetros (cantidades, fechas, monedas, servidores, cuentas, códigos de error) directamente en claves definidas por el desarrollador.
- Rechazo de consultas fuera de alcance (OOS): devuelve `"out_of_scope": true` y `"intent": null` cuando la entrada no coincide con ninguna categoría.
- Generación de JSON estructurado con esquemas anidados arbitrarios, incluyendo bloques de metadatos, arrays de acciones y telemetría.
- Adaptación zero-shot a esquemas de salida dinámicos: se puede cambiar el esquema, los nombres de campo o las definiciones de categoría en cada petición.
- Soporte de few-shot learning en contexto: 1-2 ejemplos mejoran la precisión en dominios complejos.
- Compatibilidad con llama.cpp, Ollama, LM Studio y runtimes C++ en Linux, Windows y macOS.

## Casos de uso

- Atención al cliente automatizada: el modelo puede clasificar consultas en categorías como facturación, soporte técnico o seguridad, y extraer datos relevantes (número de pedido, fecha, importe) para generar tickets o respuestas automáticas, gracias a su capacidad de extracción de slots y su ventana de contexto de 2048 tokens.
- Asistentes virtuales con enrutamiento a skills: en un asistente de voz o chat, AlphaRoute puede dirigir la consulta del usuario al módulo correspondiente (calendario, clima, domótica) usando categorías definidas por el desarrollador, con detección de consultas fuera de alcance para evitar respuestas incorrectas.
- Automatización de tickets de soporte: integrado en un sistema de helpdesk, el modelo extrae campos como tipo de incidencia, prioridad y entidades afectadas a partir de la descripción del usuario, generando un JSON listo para insertar en el sistema de gestión.
- Seguridad y monitorización de accesos: como se muestra en la model card, puede detectar intentos de escalada de privilegios o accesos sospechosos, extrayendo identidades comprometidas, recursos afectados y acciones recomendadas en un solo paso.
- Chatbots con política de rechazo: en dominios donde el sistema solo debe responder a un conjunto cerrado de intenciones, AlphaRoute actúa como guardarraíl, marcando como out-of-scope cualquier consulta fuera de las categorías definidas, reduciendo alucinaciones.
- Procesamiento de formularios y extracción de datos: dado un texto libre, el modelo puede rellenar campos de un formulario estructurado (fechas, nombres, códigos) siguiendo un esquema JSON definido, sin necesidad de un modelo NER separado.
- Edge computing y dispositivos con recursos limitados: gracias a su tamaño reducido y a las cuantizaciones GGUF, puede ejecutarse en Raspberry Pi o CPUs de bajo consumo para tareas de enrutamiento en tiempo real.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación en conjuntos de prueba públicos estandarizados, medidos con el motor de referencia de la familia del modelo. Se indica que la precisión empírica con los formatos GGUF es prácticamente idéntica.

| Benchmark | Dominio | Precisión 8-bit | Precisión 4-bit | JSON válido % |
|---|---|---|---|---|
| Banking77 (test oficial) | 77 intenciones bancarias | 93,00% | 89,60% | 100,0% |
| CLINC150 (test oficial + OOS) | 150 intenciones + fuera de alcance | 95,00% | 94,20% | 100,0% |
| HWU64 (test oficial, 1.076 consultas) | 64 intenciones de asistente de voz | 85,04% | 80,20% | 100,0% |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB para la cuantización Q4_K_M (503 MB) y aproximadamente 1 GB para Q8_0 (774 MB), más overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM, como NVIDIA GTX 1050, Jetson Nano o integradas modernas; también funciona en CPU.
- Compatible con consumer GPU de gama baja y con CPUs x86, ARM y Apple Silicon.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, o runtimes C++ personalizados.
- Latencia y throughput: no se proporcionan datos específicos, pero al ser un modelo de 0,75B, se espera una latencia de decenas de milisegundos en CPU moderna y mayor throughput con cuantización Q4_K_M.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (routing semántico con SLM). Se podría considerar como alternativas genéricas a otros modelos pequeños de clasificación de intenciones, como DistilBERT o MiniLM, pero no son directamente comparables porque AlphaRoute genera JSON estructurado y soporta categorías dinámicas, mientras que aquellos son clasificadores de secuencia con cabezas fijas. No hay datos de rendimiento para una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha entrenado para otros idiomas.
- Al ser un modelo de 0,75B, su capacidad de razonamiento complejo es limitada; puede fallar en tareas que requieran comprensión profunda o múltiples pasos.
- La precisión depende en gran medida de la calidad del prompt: se recomienda proporcionar descripciones semánticas detalladas de las categorías y un esquema JSON explícito con valores permitidos.
- La detección de out-of-scope es fiable según los benchmarks, pero puede fallar en dominios muy abiertos o con categorías ambiguas.
- No se documentan sesgos específicos, pero al derivar de Qwen3.5-0.8B-Base, puede heredar sesgos presentes en los datos de preentrenamiento de ese modelo.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo base Qwen si se redistribuye el modelo combinado.
- Los benchmarks reportados corresponden a la familia del modelo, no a los archivos GGUF específicos, aunque el autor afirma que la diferencia es insignificante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NamanAgnih0tri/AlphaRoute-0.8B-v1.0-GGUF
- Modelo base Qwen3.5-0.8B-Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base (no verificado, inferido del ID)

No se encontraron otros enlaces relevantes (papers, blogs o repositorios) asociados a este modelo específico.
