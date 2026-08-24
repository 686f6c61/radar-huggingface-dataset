# cyberknine/bau-small-1.5b-GGUF

## Resumen

BAU Small 1.5B es un modelo de lenguaje especializado en el sector minorista africano, desarrollado por el usuario cyberknine como un copiloto de negocio para pequeñas y medianas empresas (pymes) de retail, farmacia, supermercado y venta al por mayor. Se basa en el modelo Qwen2.5-1.5B-Instruct, al que se le ha aplicado un ajuste fino con LoRA (rango 16, alfa 32) para dotarlo de capacidades específicas de llamada a herramientas y generación de tarjetas JSON de interfaz de usuario. El modelo se distribuye en formato GGUF cuantizado a Q4_K_M, con un tamaño de archivo de aproximadamente 941 MB, lo que permite su ejecución en dispositivos con recursos limitados, tanto en CPU como en GPU.

La relevancia de este modelo radica en su enfoque vertical: no es un modelo generalista, sino que está diseñado para resolver problemas concretos de gestión de tiendas en África, como consultas de ventas en tiempo real, control de inventario, alertas de caducidad de medicamentos, conciliación de cajeros y análisis financiero con métricas como GMROI o ciclo de conversión de efectivo. Su capacidad de tool calling estructurado y la generación de widgets JSON lo hacen adecuado para integrarse en aplicaciones de escritorio o web mediante llama.cpp, Ollama o node-llama-cpp. Aunque su contexto es limitado (2048 tokens), su tamaño compacto y su licencia Apache 2.0 facilitan su adopción en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | No disponible (el prompt de ejemplo usa ingles, pero no se especifica cobertura multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención estándar, normalización RMSNorm y activación SwiGLU. No se trata de un modelo de mezcla de expertos (MoE), por lo que todos los parámetros están activos en cada inferencia. El ajuste fino se realizó mediante LoRA con rango 16 y alfa 32, lo que implica que solo se actualizaron un subconjunto de pesos durante el entrenamiento, manteniendo el resto congelado. No se han publicado detalles sobre el conjunto de datos utilizado, el número de tokens de entrenamiento ni el método de alineación (RLHF, DPO, etc.). La especialización se centra en el dominio del retail africano, con énfasis en la generación de llamadas a herramientas en formato `<tool_call>` y la síntesis de tarjetas JSON para interfaces de usuario.

## Capacidades

- Generación de llamadas a herramientas estructuradas: produce comandos `<tool_call>` con nombre de función y argumentos JSON para consultar datos de ventas, inventario, lotes, gastos y tareas.
- Generación de tarjetas JSON de interfaz de usuario: crea widgets como `GENERATIVE_CHART`, `RED_FLAG_ALERT`, `SHIFT_SCHEDULE` y `AUTO_TASK` directamente en la respuesta.
- Conocimiento financiero especializado: maneja métricas como GMROI, ciclo de conversión de efectivo (CCC), cantidad económica de pedido (EOQ), conciliación de cajeros y protocolos de cadena de frío (ATS).
- Soporte de moneda local: utiliza el naira nigeriano (₦) como moneda por defecto en sus respuestas.
- Inferencia rápida en dispositivos locales: al estar cuantizado en Q4_K_M, puede ejecutarse en CPU y GPU con baja latencia, apto para aplicaciones de escritorio basadas en Electron o entornos de línea de comandos.
- Integración con ecosistemas de inferencia: compatible con llama.cpp, node-llama-cpp y Ollama.

## Casos de uso

- Consulta de ventas en tiempo real: un gerente de tienda puede preguntar "muéstrame las ventas de hoy por método de pago" y el modelo genera una llamada a `queryStoreData` para obtener los datos del sistema POS, devolviendo un resumen o una tarjeta gráfica.
- Control de inventario y lotes: permite verificar existencias de productos, identificar lotes próximos a caducar en farmacias y generar alertas automáticas (`RED_FLAG_ALERT`) para evitar pérdidas.
- Conciliación de cajeros: el modelo puede analizar discrepancias en los arqueos de caja, comparando ventas registradas con los movimientos reales y sugiriendo acciones correctivas.
- Planificación de turnos de personal: genera tarjetas `SHIFT_SCHEDULE` basadas en la demanda prevista y la disponibilidad de empleados, optimizando la asignación de recursos.
- Análisis financiero para pymes: responde preguntas sobre rentabilidad, margen bruto, rotación de inventario y flujo de caja, utilizando métricas como GMROI y CCC.
- Automatización de tareas operativas: crea comandos `AUTO_TASK` para programar recordatorios de reposición, pedidos a proveedores o auditorías internas, integrándose con sistemas de gestión existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se ofrecen comparativas de rendimiento con otros modelos. La única métrica conocida es el tamaño del archivo cuantizado (~941 MB) y la longitud de contexto (2048 tokens), pero no se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo ocupa aproximadamente 941 MB en memoria. Se recomienda al menos 1,5 GB de RAM o VRAM para cargar el modelo y los buffers de inferencia.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM puede ejecutarlo, como NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060 o superiores. También funciona en GPUs integradas de Intel o AMD con soporte de Vulkan.
- Compatibilidad con CPU: puede ejecutarse en CPU con 4 GB de RAM, aunque la velocidad será menor. Es adecuado para portátiles y dispositivos de bajo consumo.
- Opciones de despliegue: llama.cpp, node-llama-cpp, Ollama, y cualquier framework que soporte GGUF (por ejemplo, llama-cpp-python, ctransformers).
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño reducido, se espera una generación de decenas de tokens por segundo en GPU moderna y de 5-10 tokens por segundo en CPU de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| BAU Small 1.5B (este) | 1,54 B | 2048 | Apache 2.0 | Retail africano, tool calling |
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32768 | Apache 2.0 | Generalista, chat e instrucciones |
| Llama-3.2-1B-Instruct | 1,23 B | 128000 | Llama 3.2 | Generalista, multilingue |

La comparativa se limita a modelos de tamaño similar. BAU Small 1.5B se distingue por su ajuste vertical en un dominio concreto, pero sacrifica la longitud de contexto (2048 frente a 32768 del base) y no ofrece capacidades multilingües documentadas. El base Qwen2.5-1.5B-Instruct es más versátil, mientras que Llama-3.2-1B-Instruct tiene un contexto mucho mayor, aunque su licencia es más restrictiva. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Contexto limitado: la ventana de 2048 tokens es corta para tareas que requieran historiales largos o documentos extensos. Puede ser insuficiente para conversaciones multi-turno complejas.
- Especialización de dominio: el modelo está entrenado para el retail africano y puede producir respuestas incoherentes o erróneas fuera de ese ámbito.
- Sin benchmarks publicados: no hay evidencia objetiva de su calidad en tareas generales o específicas, lo que dificulta evaluar su fiabilidad.
- Datos de entrenamiento no divulgados: se desconoce la composición del dataset, el número de tokens y el proceso de alineación, lo que impide valorar posibles sesgos.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar datos o llamadas a herramientas incorrectas, especialmente si no se valida la salida.
- Sesgo geográfico y cultural: al estar orientado a África, puede no adaptarse a otros mercados o sistemas de gestión.
- Formato de salida no garantizado: aunque genera JSON y tool calls, no se ha verificado su robustez en entornos de producción; se recomienda validar las respuestas antes de usarlas en sistemas críticos.
- Sin soporte de visión ni audio: es exclusivamente texto, sin capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyberknine/bau-small-1.5b-GGUF
- Modelo base (Qwen2.5-1.5B-Instruct): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio del autor (cyberknine): https://huggingface.co/cyberknine (se infiere, no se ha verificado)
