# lxe/DeepSeek-V4.1-Flash-1017-dsx-t16-uncensored-overlay

## Resumen

Este repositorio no contiene un modelo completo, sino un *overlay* en formato GGUF de 1,54 GB que se aplica sobre el modelo base `lxe/DeepSeek-V4.1-Flash-1017-dsx-t16`. El overlay sustituye 54 tensores (dos matrices por capa en las capas 10-36) por las versiones editadas del checkpoint `dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8`, un modelo al que se le ha eliminado el comportamiento de rechazo (*refusal removal* / *abliteration*). El trabajo de eliminación de rechazos es de dealignai; el repositorio de lxe solo empaqueta esos pesos editados en un formato que su motor `dsx` carga encima de su modelo T16.

El modelo subyacente es DeepSeek-V4.1-Flash-1017, un transformer de tipo mezcla de expertos (MoE) de DeepSeek. El repositorio declara 1.450.967.040 parámetros en safetensors, aunque la model card indica que el modelo completo pesa 252 GB, por lo que esa cifra corresponde a un subconjunto o a un componente del paquete, no al total del modelo. La innovación práctica del overlay es que permite mantener una única copia del modelo grande y alternar entre el comportamiento original y el "sin censura" pasando o no el flag `--overlay` al arrancar el servidor.

Es relevante para quien quiera evaluar el efecto de la abliteración sobre un MoE grande sin duplicar 252 GB en disco, y para quien necesite entender cómo se construyen overlays diferenciales cuantizados (aquí, de FP8 a Q8_0) que reproducen byte a byte los tensores originales fuera de las zonas editadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (DeepSeek-V4.1-Flash-1017); el overlay es un conjunto de tensores GGUF |
| Parametros totales | 1.450.967.040 declarados en safetensors del repo (el modelo base completo pesa 252 GB; no disponible el recuento total real) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Overlay en Q8_0; el paquete base usa IQ4_NL (Engram) por defecto |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (overlay de 1,54 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos que incluye expertos enrutados, tablas Engram, MTP (*multi-token prediction*) y pesos de visión, según se desprende de la descripción de los tensores que el overlay no modifica. El overlay solo altera dos matrices por capa en las capas 10-36: `attn.wo_b` / `attn_output_b` (5120 x 8192) y `ffn.shared_experts.w2` / `ffn_down_shexp` (5120 x 2304), es decir, las que escriben en el *residual stream*. Todo lo demás (expertos enrutados, entradas de atención, tablas Engram, MTP y visión) es idéntico byte a byte a la release de DeepSeek.

El proceso de construcción es un diferencial cuantizado: los 54 tensores se convierten de los pesos FP8 de dealignai a Q8_0, el mismo tipo que usan los pesos densos del modelo T16. El autor verifica que aplicar el mismo cuantizador a la release de DeepSeek reproduce los tensores del T16 byte a byte, de modo que el overlay difiere del T16 únicamente donde difiere la edición de dealignai. No hay información sobre datos de entrenamiento, número de tokens, RLHF/DPO ni proceso de alineación del modelo base en la información proporcionada.

## Capacidades

- Generación de texto en el modelo base (pipeline `text-generation`).
- Razonamiento y respuesta a instrucciones heredados del modelo DeepSeek-V4.1-Flash-1017 subyacente.
- Capacidad de visión: el modelo base incluye pesos de visión según la model card, aunque no se detalla su uso.
- Modo *thinking*: la model card menciona comprobaciones con "thinking off", lo que implica que el modelo base soporta un modo de razonamiento explícito.
- Comportamiento sin rechazo: responde a peticiones que el modelo original declina, incluidas las dañinas o ilegales.
- Tool calling, function calling, agentes y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre abliteración: comparar el comportamiento del mismo modelo con y sin el overlay (arrancando `dsx-server` con o sin `--overlay`) para medir el efecto de la eliminación de rechazos sobre calidad y seguridad, sin duplicar el modelo de 252 GB.
- Evaluación de robustez de salvaguardas: usar el overlay como variante "sin censura" en un banco de pruebas de *red teaming* para comprobar si las capas de seguridad propias de una aplicación detectan respuestas que el modelo original bloquearía.
- Despliegue con una sola copia en disco: en entornos con almacenamiento limitado, mantener un único paquete T16 de 252 GB y cambiar de variante cargando un overlay de 1,54 GB, en lugar de almacenar dos checkpoints completos.
- Estudio de cuantización diferencial: reutilizar el enfoque del repositorio (`quant/overlay_gguf.py`) para empaquetar ediciones de pesos de otros modelos como overlays Q8_0 y validar la reproducción byte a byte de los tensores no editados.
- Investigación lingüística y de sesgos: analizar cómo cambia la distribución de respuestas en un MoE grande al modificar solo las matrices que escriben en el residual stream de las capas 10-36.
- Pruebas de integración del motor `dsx`: validar el arranque con `--overlay` y la comprobación de compatibilidad (el motor rechaza el overlay sobre cualquier modelo que no sea el paquete IQ4_NL Engram de la rama `main`).

## Benchmarks y rendimiento

Los únicos datos disponibles son los de dealignai sobre su checkpoint FP8 con el motor de referencia de DeepSeek, no sobre este overlay:

| Benchmark | Base | Uncensored |
|---|---:|---:|
| MMLU (57 materias x 20 preguntas) | 87,63% | 83,77% |

dealignai también reporta una variación de −4,2 puntos en MMLU sobre su build EXL3 de 2,9 bpw. El overlay no ha sido evaluado por separado. En comprobaciones puntuales con *thinking* desactivado, el autor indica que se responden prompts que el modelo T16 declina y que los prompts ordinarios (hechos, código) siguen respondiéndose correctamente.

## Requisitos de hardware

- El overlay en sí ocupa 1,54 GB en disco, pero requiere el modelo base T16 completo (252 GB) para funcionar.
- VRAM estimada para inferencia: no disponible; depende del paquete IQ4_NL del modelo base de 252 GB.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `DSX_GPUS=0,1`, lo que implica al menos dos GPU, pero no se especifica el modelo.
- ¿Cabe en GPU de consumo? No disponible; un modelo de 252 GB en IQ4_NL excede la VRAM de cualquier GPU de consumo individual.
- Opciones de despliegue: motor `dsx` (compilación desde fuente, commit `b06f6b7` o posterior) con `dsx-server --model ... --overlay ...`. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este overlay (lxe) | Overlay de 54 tensores sobre T16 | no disponible | MIT | Requiere el paquete T16 de 252 GB; solo funciona con el paquete IQ4_NL Engram de la rama `main` |
| `dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8` | Modelo completo en FP8 | no disponible | no disponible | Checkpoint completo editado; MMLU 83,77% |
| `lxe/DeepSeek-V4.1-Flash-1017-dsx-t16` | Modelo completo T16 (252 GB) | no disponible | no disponible | Modelo original sin editar; MMLU 87,63% |
| `deepseek-ai/DeepSeek-V4.1-Flash-1017` | Modelo completo | no disponible | MIT (según el overlay) | Release original de DeepSeek |

## Limitaciones y advertencias

- El comportamiento de rechazo ha sido eliminado: el modelo cumplirá peticiones que el original declina, incluidas las dañinas o ilegales. Es responsabilidad del usuario añadir capas de seguridad antes de cualquier despliegue.
- El overlay no ha sido evaluado de forma independiente; las cifras de MMLU corresponden al checkpoint FP8 de dealignai en el motor de referencia de DeepSeek, no a este GGUF.
- La eliminación de rechazos degrada la calidad: −3,86 puntos de MMLU en la medición de dealignai y −4,2 puntos en su build EXL3.
- El overlay solo es válido para el paquete por defecto (IQ4_NL Engram, rama `main`); `dsx` lo rechaza sobre cualquier otro modelo.
- Requiere el motor `dsx` desde el commit `b06f6b7` o posterior; no es un modelo autónomo ni se indica compatibilidad con otros runners.
- Idiomas soportados, longitud de contexto y sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Licencia MIT heredada del modelo base y de la release de dealignai; conviene verificar las condiciones de uso del modelo DeepSeek original antes de un uso comercial.

## Enlaces

- Repositorio del overlay: https://huggingface.co/lxe/DeepSeek-V4.1-Flash-1017-dsx-t16-uncensored-overlay
- Modelo base T16: https://huggingface.co/lxe/DeepSeek-V4.1-Flash-1017-dsx-t16
- Checkpoint sin censura de dealignai: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Release original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor dsx: https://github.com/lxe/dsx
- Documentación de overlays: https://github.com/lxe/dsx/blob/main/docs/overlays.md
- Script de construcción del overlay: https://github.com/lxe/dsx/blob/main/quant/overlay_gguf.py
