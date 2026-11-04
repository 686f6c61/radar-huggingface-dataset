# Nullmega/Mellum2.1-12B-A2.5B-Thinking-DevSec-GGUF

## Resumen

Mellum2.1-12B-A2.5B-Thinking-DevSec-GGUF es una exportación en formato GGUF del modelo afinado Mellum2.1-12B-A2.5B-Thinking-DevSec, publicado por el usuario Nullmega. Se trata de un ajuste fino mediante LoRA de atención sobre el modelo base JetBrains/Mellum2.1-12B-A2.5B-Thinking, una arquitectura de mezcla de expertos (MoE) con 12.149.923.072 parámetros totales y aproximadamente 2.500 millones de parámetros activos por token, orientada a generación de código y tareas de desarrollo seguro. El LoRA completado se fusiona en el modelo base antes de la conversión a GGUF, por lo que los archivos publicados contienen el modelo completo y no requieren descargar el adaptador por separado.

La relevancia de esta ficha radica en que combina un modelo MoE de código con un ajuste específico en seguridad de aplicaciones (DevSec), entrenado sobre trazas de ingeniería de software agéntica (NVIDIA Open-SWE-Traces), pares de parches seguros en C/C++, trazas de razonamiento de OpenThoughts3 y datos de desarrollo frontend en React/TypeScript. El resultado es un modelo con modo de razonamiento (thinking) y soporte de tool calling, empaquetado en cuantizaciones estándar Q4_K_M, Q5_K_M, Q6_K y Q8_0 generadas directamente desde una referencia BF16 con una revisión fijada de llama.cpp.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, aunque el autor advierte explícitamente de que no se han publicado benchmarks independientes de código, seguridad, frontend, backend o agentes, y de que la eliminación de bucles no está demostrada. La ficha refleja esa limitación: los datos disponibles son de especificación y receta de entrenamiento, no de rendimiento medido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, arquitectura nativa `mellum` en llama.cpp |
| Parámetros totales | 12.149.923.072 |
| Parámetros activos | Aproximadamente 2.500 millones (según denominación A2.5B) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de carga usa 8.192 tokens) |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q6_K, Q8_0 (generadas desde BF16 GGUF de referencia) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tokenizador y plantilla de chat nativos embebidos) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 12.150 millones de parámetros totales y unos 2.500 millones activos por token. El ajuste publicado es un LoRA de atención supervisado: los expertos y los routers permanecen congelados durante el entrenamiento, de modo que la adaptación afecta únicamente a las proyecciones de atención. El LoRA completado se fusiona en el modelo base en la revisión `92ddae9fc7665e9f801d141d2e5a6b2caf2460c4` antes de la conversión a GGUF.

El corpus de entrenamiento combina cuatro fuentes: 1.767 trayectorias retenidas de nvidia/Open-SWE-Traces (CC BY 4.0), 300 trayectorias de pares de parches seguros en C/C++ de prabhatl0dhi (MIT), 284 trayectorias de open-thoughts/OpenThoughts3-1.2M (Apache 2.0) y 200 trayectorias de desarrollo frontend React/TypeScript de runanlab (CC BY 4.0). Las conversaciones completas caben en el contexto de entrenamiento seleccionado, con los objetivos del asistente y el token EOS supervisados. Las interacciones de shell se adaptan al esquema bash de Pi. No se trata de un entrenamiento de refuerzo en línea sobre Pi, y las trazas de razonamiento del profesor no se etiquetan como verificadas de forma independiente salvo que la fuente lo aporte.

La conversión a GGUF se realizó con la revisión `149f5641b931aaf33697d70f9abc90c3e5300247` de llama.cpp, sin matriz de importancia ni tensores MTP, y el autor no reclama una cuantización byte a byte idéntica a las versiones oficiales de JetBrains. Cada variante publicada pasa comprobaciones estructurales y una prueba corta de carga e inferencia nativa, registrada en `validation-<QUANT>.json`.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por plantilla de chat.
- Generación y edición de código, con especialización en parches de seguridad en C/C++.
- Soporte de tool calling y function calling, con esquema de herramientas embebido en la plantilla.
- Razonamiento multi-paso y flujos agénticos de ingeniería de software (acciones bash y resultados observados en el entrenamiento).
- Decisiones de herramienta emparejadas con razonamiento en los diagnósticos Reasoning-v2.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni otros modos.

## Casos de uso

- Revisión de parches de seguridad en C/C++: el modelo se ha ajustado sobre pares de funciones con correcciones registradas, por lo que puede proponer parches y explicar el cambio en revisiones de código de sistemas críticos.
- Asistencia agéntica en repositorios: al haberse entrenado con trazas Open-SWE que retienen acciones bash y resultados observados, puede integrarse en bucles de agente que inspeccionan el repositorio, ejecutan comandos y proponen modificaciones.
- Generación de código frontend en React/TypeScript: las 200 trayectorias de desarrollo frontend del corpus permiten usarlo como asistente en tareas de componentes e interfaces.
- Razonamiento con trazas verificables: el modo thinking y los diagnósticos de Reasoning-v2 permiten separar corrección, terminación, repetición y longitud del razonamiento, útil en pipelines que auditan la cadena de decisión.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M y Q5_K_M, con un repositorio de 8,1 GB, permiten ejecución en GPU de consumo mediante llama.cpp con offload parcial o total.
- Integración en herramientas de línea de comandos: la plantilla de chat nativa y el esquema de herramientas embebidos facilitan su uso en clientes CLI que preservan EOS y un límite de salida finito.
- Evaluación comparativa de cuantizaciones: el autor recomienda comparar el BF16 afinado y cada cuantización candidata en tareas nuevas antes de elegir el formato de despliegue, lo que convierte al modelo en banco de pruebas de degradación por cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no reclama ningún benchmark independiente de código, seguridad, frontend, backend o agentes, y que las pruebas de validación solo verifican compatibilidad del artefacto y generación finita, no finalización de tareas, parada natural ni mejor razonamiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 8,1 GB, pero el tamaño de archivo no equivale a la memoria total de inferencia, ya que hay que sumar caché KV, búferes del runtime y offload.
- GPU recomendadas: no disponibles en la información proporcionada. El entorno de entrenamiento citado es una A100, pero no se especifican requisitos de inferencia.
- GPU de consumo: no confirmado; las cuantizaciones Q4_K_M y Q5_K_M son las candidatas lógicas para GPUs de consumo con offload parcial o total mediante `-ngl`.
- Despliegue: llama.cpp con soporte de la arquitectura nativa `mellum`, usando la revisión fijada `149f5641b931aaf33697d70f9abc90c3e5300247`. No se mencionan vLLM, TGI, Ollama ni otros runtimes.
- Ejemplo de carga del autor: `llama-cli -m ARCHIVO.gguf -c 8192 -ngl 99 --temp 0.6 --top-p 0.95 --top-k 20 -n 4096 --reasoning-budget -1`, con `-ngl 0` para CPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking-DevSec (este) | 12,15 B | ~2,5 B | No disponible | Apache 2.0 | GGUF | Ajuste LoRA de atención sobre Mellum2.1, orientado a DevSec |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking | 12,15 B | ~2,5 B | No disponible | No disponible en la información | No disponible | Modelo base sin el ajuste DevSec |
| Alternativas de código MoE de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- No se han publicado benchmarks independientes de código, seguridad, frontend, backend ni agentes; el rendimiento real en tareas no está medido.
- La eliminación de bucles no está demostrada; el autor advierte de que puede repetir o no terminar de forma natural.
- La cuantización puede degradar la calidad; hay que comparar el BF16 y cada cuantización en tareas nuevas antes de desplegar.
- El ajuste solo modifica la atención: expertos y routers permanecen congelados, lo que limita la magnitud de la adaptación.
- Los diagnósticos Reasoning-v2 no ejecutan código ni comandos generados por el modelo y no constituyen un benchmark real de Pi ni del repositorio.
- Las trazas de seguridad en C/C++ proceden de correcciones registradas, no de trazas de razonamiento, y no se compilaron de forma independiente.
- Los entornos agénticos convertidos no se reprodujeron; las interacciones de shell se adaptaron al esquema bash de Pi y no cubren todas las herramientas o backends de Pi.
- Las licencias de las tarjetas de dataset son procedencia, no una garantía de que cada fragmento de código subyacente esté libre de restricciones; las licencias originales de los repositorios siguen aplicándose.
- No se redistribuye el corpus de entrenamiento en bruto.
- La plantilla no implementa un `reasoning_effort` graduado bajo/alto; el razonamiento debe mantenerse activado.
- Idiomas soportados y sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero las obligaciones de atribución de los datasets subyacentes deben revisarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nullmega/Mellum2.1-12B-A2.5B-Thinking-DevSec-GGUF
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- llama.cpp (revisión fijada): https://github.com/ggml-org/llama.cpp/tree/149f5641b931aaf33697d70f9abc90c3e5300247
- Dataset NVIDIA Open-SWE-Traces: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Dataset de parches seguros C/C++: https://huggingface.co/datasets/prabhatl0dhi/C_C_plus_plus_Patch_Dataset_for_Secure_Code_LLMs
- Dataset OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Dataset frontend React/TypeScript: https://huggingface.co/datasets/runanlab/gpt-5.4-frontend-development-11062026
