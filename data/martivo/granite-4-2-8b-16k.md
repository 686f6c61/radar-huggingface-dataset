# martivo/granite-4.2-8b-16k

## Resumen

Granite 4.2 8B RKLLM w8a8 es una conversión del modelo ibm-granite/granite-4.2-8b de IBM al formato RKLLM de Rockchip, optimizada para ejecutarse en la NPU del SoC RK3588 y RK3588S. El autor, martivo, ha adaptado un modelo que no figura en la lista de soportados por Rockchip mediante el plegado del multiplicador de atención en los pesos de `q_proj` y el reetiquetado del checkpoint como `LlamaForCausalLM`. El resultado es un único fichero `.rkllm` de 9.293.083.044 bytes cuantizado a 8 bits en pesos y activaciones (w8a8).

La relevancia de esta ficha radica en que permite ejecutar un modelo de 8.000 millones de parámetros en hardware de borde basado en RK3588, como una Orange Pi 5 con 16 GB de RAM, sin GPU dedicada. El contexto máximo configurado es de 16.384 tokens, aunque en la práctica la placa de 16 GB solo puede cargar el modelo con 8.192 tokens de contexto antes de que el proceso sea terminado por falta de memoria.

Se trata de un derivado con licencia Apache-2.0 heredada del modelo base. No se han publicado resultados de benchmarks sobre el modelo cuantizado, y las pruebas realizadas se limitan a un único dispositivo, en inglés y con prompts de administración de sistemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Granite 4.2, checkpoint reetiquetado como LlamaForCausalLM tras plegar el multiplicador de atención) |
| Parametros totales | 8.000 millones (modelo base granite-4.2-8b) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (límite de compilación); en la práctica 8.192 en placa de 16 GB |
| Tipos de cuantizacion | w8a8 (8 bits pesos y activaciones), algoritmo `normal`, nivel de optimización 1, hybrid rate 0 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rkllm` (formato propietario de Rockchip RKLLM); fichero `granite-4.2-8b-16k_RK3588_w8a8.rkllm` |
| Toolkit / runtime | rkllm-toolkit 1.3.1, requiere `librkllmrt.so` 1.3.1 |
| Nucleos NPU | 3 |
| SHA-256 | `9cce637bf176323a7a759acd69168cbf966a2c4c11c4e7ed8c6348583ded2a64` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de IBM perteneciente a la familia Granite 4.2, con 8.000 millones de parámetros. La particularidad arquitectónica de Granite frente a un Llama convencional son sus multiplicadores escalares; en esta variante de 8B el único distinto de 1 es `attention_multiplier`, con valor 1/128. Para poder compilarlo con RKLLM, el autor plegó ese multiplicador en los pesos de `q_proj` y reetiquetó el checkpoint como `LlamaForCausalLM`, reutilizando el script `fold_granite.py` del proyecto de oliver0804 con una modificación: los pesos de `q_proj` reescalados se mantienen en float32, ya que el factor de escala del 8B (0,0884) no es una potencia de dos y redondearlo de vuelta a bf16 perdería precisión.

La validación del plegado, realizada en transformers antes de la cuantización, arroja una diferencia máxima de logits de 0,00003 y una coincidencia de argmax del 100 %. La cuantización posterior es w8a8 con el conjunto de calibración por defecto del toolkit. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base, más allá de lo que documente la model card original de IBM.

## Capacidades

- Generación de texto en inglés con plantilla de chat ChatML embebida en el fichero.
- Modo de razonamiento (thinking): la plantilla cierra el prompt con ``; funcional pero lento en NPU (2-3 tok/s).
- Tool calling / function calling: el modelo emite llamadas en el formato `<tool_call><function=name><parameter=arg>value</parameter></function></tool_call>`.
- Soporte de agentes y razonamiento multi-paso: probado como agente de shell con RKLLM-API-Server, con llamadas simples y multi-paso funcionando.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Agente de administración de sistemas en dispositivo de borde: el modelo se ha probado como agente de shell con RKLLM-API-Server sobre una Orange Pi 5, ejecutando llamadas a herramientas simples y multi-paso para tareas de administración. Es adecuado por su soporte nativo de tool calling y su ejecución íntegra en NPU.
- Automatización local sin conexión: al caber en una placa RK3588 de 16 GB, permite desplegar un asistente de texto en entornos sin acceso a la nube ni GPU dedicada, con contexto de 8.192 tokens.
- Procesamiento de prompts largos en inglés: con 8.192 tokens de contexto efectivos y un prefill de unos 58 tok/s, resulta viable para resumir o analizar documentos de extensión media en el propio dispositivo.
- Prototipado de pipelines de tool calling: el formato de llamada estructurado permite integrar el modelo en orquestadores de agentes locales y validar flujos antes de migrar a hardware mayor.
- Evaluación de modelos cuantizados en NPU: sirve como referencia para medir latencia, memoria y estabilidad de un modelo de 8B en RK3588 con w8a8.
- Asistente de razonamiento por pasos en local: el modo thinking permite cadenas de razonamiento, aunque a 2-3 tok/s cada paso requiere minutos, por lo que encaja en tareas asíncronas más que interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ejecutó ningún benchmark sobre el modelo cuantizado. Sí se documentan medidas de inferencia en una Orange Pi 5 (RK3588, 16 GB):

| Contexto | Memoria | Prefill | Generación | Tiempo de carga |
|---|---|---|---|---|
| 8192 | 9.976 MB | ~58 tok/s | 2,9 tok/s, bajando a 1,6 tok/s conforme se llena el contexto | ~30 s |
| 16384 | no cabe con ~11,5 GB libres (el proceso es terminado por OOM) | | | |

## Requisitos de hardware

- VRAM/RAM estimada: 9.976 MB para contexto de 8.192 tokens en placa de 16 GB; con 16.384 tokens no cabe en una placa de 16 GB (OOM con ~11,5 GB libres).
- Hardware objetivo: SoC Rockchip RK3588 o RK3588S con NPU de 3 núcleos. Probado en Orange Pi 5 de 16 GB.
- GPU dedicadas: no aplica; el modelo está compilado para NPU Rockchip, no para CUDA.
- GPU de consumo: no procede; no es un formato compatible con GPUs convencionales.
- Despliegue: runtime RKLLM 1.3.1 (`librkllmrt.so`), toolkit rkllm-toolkit 1.3.1; probado con RKLLM-API-Server como servidor de agente.
- Latencia y throughput: prefill ~58 tok/s y generación 2,9 tok/s degradándose a 1,6 tok/s con el contexto lleno; carga ~30 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| martivo/granite-4.2-8b-16k | 8B | 16.384 (8.192 efectivos en 16 GB) | RKLLM w8a8 | Apache-2.0 | Hugging Face |
| oliver0804/Granite-4.2-3B-RK3588-rkllm-w8a8 | 3B | no disponible | RKLLM w8a8 | no disponible | Hugging Face |
| ibm-granite/granite-4.2-8b | 8B | no disponible | safetensors (transformers) | Apache-2.0 | Hugging Face |

La comparativa se limita a estos tres modelos por la información disponible; no se dispone de datos de rendimiento comparables entre ellos.

## Limitaciones y advertencias

- Solo se ha probado en una placa (Orange Pi 5), en inglés y con prompts de administración de sistemas.
- No se ha ejecutado ningún benchmark sobre el modelo cuantizado; el rendimiento real en otras tareas es desconocido.
- La salida ocasionalmente continúa más allá del final de un turno con un fragmento suelto.
- El modo thinking es funcional pero muy lento (2-3 tok/s), lo que hace cada paso de razonamiento tardar minutos.
- El tool calling debe recibir las instrucciones de herramienta de su propia plantilla de chat; si se le piden llamadas en estilo JSON, mezcla ambos formatos.
- El contexto de 16.384 tokens no es viable en placas de 16 GB; debe cargarse con `max_context_len` de 8.192.
- El modelo está limitado al inglés; no se documentan otros idiomas.
- Licencia Apache-2.0 heredada del modelo base, pero los pesos están modificados (plegado de multiplicador y cuantización de 8 bits) y constituyen una obra derivada de ibm-granite/granite-4.2-8b.
- Riesgo de sesgos y alucinaciones inherente al modelo base; no se documentan evaluaciones específicas en esta conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/martivo/granite-4.2-8b-16k
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Proyecto de referencia para el plegado: https://huggingface.co/oliver0804/Granite-4.2-3B-RK3588-rkllm-w8a8
- Servidor de agente utilizado en las pruebas: https://github.com/martivo/RKLLM-API-Server
