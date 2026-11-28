# martivo/Granite-4.2-8B-RK3588-rkllm-w8a8

## Resumen

Granite-4.2-8B-RK3588-rkllm-w8a8 es una conversión del modelo IBM Granite 4.2 8B al formato RKLLM de Rockchip, pensada para ejecutarse sobre la NPU del SoC RK3588/RK3588S. El autor, martivo, parte del checkpoint oficial `ibm-granite/granite-4.2-8b` y lo adapta a las limitaciones del toolkit de Rockchip, que no soporta nativamente la arquitectura Granite. El resultado es un único fichero `.rkllm` de 9,29 GB con cuantización de pesos y activaciones a 8 bits (w8a8) y una ventana de contexto máxima de 16384 tokens.

La relevancia de esta ficha es doble. Por un lado, demuestra que un modelo de 8B parámetros con capacidades de tool calling puede ejecutarse en hardware de placa única (SBC) con NPU integrada, sin GPU dedicada. Por otro, documenta con mediciones reales el coste de esa viabilidad: en una Orange Pi 5 con 16 GB de RAM, el contexto práctico se queda en 8192 tokens y la generación cae a 2,9 tok/s en el mejor caso, degradándose hasta 1,6 tok/s conforme se llena la ventana. No se han publicado resultados de benchmarks sobre el modelo cuantizado.

El modelo base, Granite 4.2 8B, es un transformer denso de IBM entrenado principalmente en inglés, con soporte de plantilla ChatML, modo de razonamiento (thinking) y tool calling. La conversión elimina las diferencias arquitectónicas respecto a Llama mediante el plegado del `attention_multiplier` en los pesos de `q_proj`, de modo que el runtime de Rockchip puede cargarlo como un `LlamaForCausalLM` estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Granite 4.2), convertido a RKLLM con checkpoint relabelado como `LlamaForCausalLM` |
| Parametros totales | 8B (modelo base `ibm-granite/granite-4.2-8b`) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16384 tokens (máximo del fichero); 8192 recomendado en placas de 16 GB |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits), algoritmo `normal`, nivel de optimización 1, hybrid rate 0 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | `.rkllm` (fichero único de 9.293.083.044 bytes) |
| Toolkit / runtime | rkllm-toolkit 1.3.1; requiere `librkllmrt.so` 1.3.1 |
| Cores de NPU | 3 |
| SHA-256 del fichero | `9cce637bf176323a7a759acd69168cbf966a2c4c11c4e7ed8c6348583ded2a64` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Granite 4.2 8B de IBM: un transformer denso de aproximadamente 8000 millones de parámetros. La particularidad de Granite frente a Llama es el uso de multiplicadores escalares en distintas partes del bloque de atención; en la variante de 8B, el único multiplicador distinto de 1 es `attention_multiplier`, con valor 1/128. Para que el toolkit de Rockchip pudiera procesar el modelo, el autor plegó ese multiplicador dentro de los pesos de `q_proj` y renombró el checkpoint como `LlamaForCausalLM`. El script de conversión (`fold_granite.py`, adaptado del trabajo de oliver0804 sobre la variante de 3B) mantiene los pesos rescalados de `q_proj` en float32, porque el factor de escala del 8B (0,0884) no es una potencia de dos y redondearlo a bf16 introduce pérdida de precisión.

Antes de cuantizar, el autor validó la equivalencia funcional del modelo plegado frente al original en transformers: diferencia máxima de logits de 0,00003 y coincidencia del 100% en el argmax. La cuantización w8a8 se realizó con el conjunto de calibración por defecto del toolkit, sin ajuste específico. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF/DPO) del modelo base en la documentación proporcionada. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Generación de texto en inglés con plantilla ChatML embebida en el fichero.
- Tool calling / function calling: el modelo emite llamadas en el formato `<tool_call><function=name><parameter=arg>value</parameter></function></tool_call>`.
- Agentes multi-paso: probado con RKLLM-API-Server como agente con herramienta de shell, funcionando tanto en llamadas simples como encadenadas.
- Modo de razonamiento (thinking): operativo, aunque en la práctica cada paso tarda minutos a 2-3 tok/s; el autor lo probó mayoritariamente desactivado.
- Razonamiento y matemáticas: capacidades heredadas del modelo base Granite 4.2 8B (no verificadas sobre la versión cuantizada).
- Generación de código: capacidad del modelo base, sin pruebas específicas documentadas en esta conversión.
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso

- Agente de administración de sistemas en placa única: el modelo se ha probado como agente con una herramienta de shell sobre RKLLM-API-Server, resolviendo llamadas de herramienta simples y multi-paso. Es adecuado para automatizar tareas de diagnóstico o ejecución de comandos en dispositivos edge donde no hay GPU.
- Asistente local en dispositivos embebidos: al ejecutarse íntegramente en la NPU del RK3588, permite desplegar un chatbot de 8B parámetros en hardware de bajo consumo sin depender de la nube, con contexto de 8192 tokens en placas de 16 GB.
- Automatización de tool calling en gateways IoT: el formato de llamada estructurado permite integrar el modelo en pipelines que invocan APIs REST o scripts locales, siempre que se le proporcionen las instrucciones de herramienta de su propia plantilla.
- Prototipado de agentes edge con contexto medio: con 8192 tokens de ventana, sirve para conversaciones multi-turno y tareas de razonamiento de alcance moderado en entornos sin conectividad.
- Evaluación de viabilidad de LLM en NPU Rockchip: útil para equipos que quieran medir latencia, consumo de memoria y throughput reales antes de comprometerse con un despliegue en producción sobre RK3588.
- Sustituto local de modelos en la nube para tareas de texto en inglés: para flujos de trabajo donde la confidencialidad o la latencia de red impiden usar APIs externas, aunque el throughput de 1,6-2,9 tok/s limita su uso a tareas no interactivas o por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no ejecutó ningún benchmark sobre el modelo cuantizado. Las únicas mediciones disponibles son de rendimiento en hardware:

| Contexto | Memoria | Prefill | Generación | Tiempo de carga |
|---|---|---|---|---|
| 8192 | 9.976 MB | ~58 tok/s | 2,9 tok/s, bajando a 1,6 tok/s al llenarse el contexto | ~30 s |
| 16384 | No cabe con ~11,5 GB libres (proceso terminado por OOM) | — | — | — |

Medido en una Orange Pi 5 (RK3588, 16 GB).

## Requisitos de hardware

- VRAM/RAM estimada: 9.976 MB de memoria del sistema con contexto de 8192 tokens; el fichero ocupa 9,29 GB en disco.
- Hardware objetivo: SoC Rockchip RK3588 o RK3588S con NPU de 3 cores. Probado en Orange Pi 5 con 16 GB de RAM.
- Contexto de 16384 tokens: no cabe en una placa de 16 GB (el proceso se termina por OOM con ~11,5 GB libres). El runtime puede cargar el fichero con un `max_context_len` menor.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el formato `.rkllm` está diseñado para la NPU de Rockchip, no para CUDA.
- Opciones de despliegue: runtime `librkllmrt.so` 1.3.1 junto con rkllm-toolkit 1.3.1; RKLLM-API-Server (con `model_config.json` para fijar contexto de 8192, thinking desactivado y parámetros de muestreo).
- Throughput: prefill de ~58 tok/s y generación de 2,9 tok/s en contexto vacío, degradándose a 1,6 tok/s conforme se llena la ventana de 8192 tokens. Tiempo de carga de ~30 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite-4.2-8B-RK3588-rkllm-w8a8 (este) | 8B | 16384 (8192 en placa de 16 GB) | `.rkllm` / NPU RK3588 | Apache-2.0 | Hugging Face, 0 descargas |
| Granite-4.2-3B-RK3588-rkllm-w8a8 (oliver0804) | 3B | No disponible | `.rkllm` / NPU RK3588 | Apache-2.0 | Hugging Face |
| ibm-granite/granite-4.2-8b (base) | 8B | No disponible | safetensors / GPU | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada. La variante de 3B, del mismo ecosistema RKLLM, sería la alternativa natural si el presupuesto de memoria o el throughput de la versión de 8B resultan insuficientes en una placa de 16 GB.

## Limitaciones y advertencias

- Solo probado en una placa (Orange Pi 5), en inglés y con prompts de administración de sistemas; no hay validación en otros escenarios ni en otros idiomas.
- No se ejecutó ningún benchmark sobre el modelo cuantizado, por lo que se desconoce la degradación de calidad frente al modelo base.
- Throughput muy bajo para uso interactivo: 2,9 tok/s en el mejor caso y 1,6 tok/s con el contexto lleno. El modo thinking hace que cada paso tarde minutos.
- El contexto de 16384 tokens no es viable en placas de 16 GB; hay que configurar 8192 en el runtime.
- El modelo ocasionalmente continúa la salida más allá del final del turno con un fragmento suelto.
- En tool calling, si se le piden llamadas en estilo JSON mezcla ambos formatos; hay que usar las instrucciones de herramienta de su propia plantilla.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; los pesos son una obra derivada modificada (plegado del multiplicador y cuantización a 8 bits), por lo que conviene conservar la atribución a IBM y al autor de la conversión.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta conversión; se heredan los del modelo base Granite 4.2 8B, no evaluados aquí.
- Dependencia estricta de la versión del runtime: requiere `librkllmrt.so` 1.3.1; otras versiones pueden no cargar el fichero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/martivo/Granite-4.2-8B-RK3588-rkllm-w8a8
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Conversión de referencia (3B): https://huggingface.co/oliver0804/Granite-4.2-3B-RK3588-rkllm-w8a8
- RKLLM-API-Server: https://github.com/martivo/RKLLM-API-Server
