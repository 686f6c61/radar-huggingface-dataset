# doth4580/Qwen3.8-Flash-Next-EXL3-3.05bpw-DotH-MTP

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de la familia Qwen (equipo Qwen de Alibaba) distribuido bajo licencia Qwen Community 1.0. Esta ficha describe el paquete publicado por doth4580 bajo el identificador `Qwen3.8-Flash-Next-EXL3-3.05bpw-DotH-MTP`, que no es un modelo nuevo sino una redistribución cuantizada de los pesos originales en formato EXL3 (ExLlamaV3) a 3,05 bits por peso, más una cabeza de borrador (draft head) para decodificación especulativa. Los pesos cuantizados provienen del pack de turboderp (`3.05bpw_h5_ng5`) y se redistribuyen sin conversión ni recuantización.

El modelo cuenta con 42.516.047.651 parámetros totales según los safetensors del repositorio, y la metadata lo etiqueta como MoE (mixture of experts) con soporte de MTP (multi-token prediction). El paquete está pensado y probado principalmente para el motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10, en configuraciones de una, dos o cuatro máquinas con tensor parallelism. El repositorio ocupa 86,2 GB.

La relevancia de este paquete es práctica: permite ejecutar un modelo de más de 42.000 millones de parámetros en un formato de 3 bits con decodificación especulativa integrada, sobre hardware de gama workstation (GB10), con un servidor compatible con la API de OpenAI. La cabeza MTP añade velocidad de decodificación sin alterar la salida, ya que cada token propuesto se verifica con el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE con MTP (multi-token prediction); detalles de capas y expertos no disponibles |
| Parametros totales | 42.516.047.651 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuración probada con `--max-seq-len 262144` en veloGB10) |
| Tipos de cuantizacion | EXL3 3,05 bpw (branch `3.05bpw_h5_ng5`); pesos BF16 disponibles en el modelo base |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3), con `model.safetensors.index.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) según las etiquetas del repositorio, e incorpora una capa MTP (multi-token prediction) que actúa como cabeza de borrador para decodificación especulativa. No se dispone de información sobre el número de capas, la dimensión oculta, el número de expertos ni la proporción de expertos activos por token. Tampoco se detallan los datos de entrenamiento del modelo original (número de tokens, composición del corpus, uso de RLHF o DPO), que corresponden al equipo Qwen y no se reproducen en esta model card.

La innovación técnica de este paquete concreto es la integración de una cabeza MTP re-destilada por el autor (`zz_mtp_head_doth.safetensors`), que contiene los 59 tensores no-expertos de la cabeza, cuantizados con exllamav3 1.5.3 al layout y anchos de la cabeza optimizada de HermiHg. La proyección del indexer se toma de los bytes de HermiHg sin modificar. La decodificación especulativa verifica cada token propuesto con el modelo completo, por lo que la cabeza afecta únicamente a la velocidad y no a la distribución de salida. La cuantización a 3,05 bpw es obra de turboderp con exllamav3 y se redistribuye byte a byte.

## Capacidades

- Generación de texto autoregresiva con ventana de contexto de hasta 262.144 tokens en la configuración probada.
- Razonamiento multi-turno con modo "thinking" activado por defecto en los benchmarks del autor.
- Decodificación especulativa mediante cabeza MTP integrada, con tasas de aceptación del borrador en torno al 70 %.
- Soporte de prefix caching (`--prefix-cache on`) para reutilizar prefijos en conversaciones multi-turno.
- Servidor compatible con la API de OpenAI (`/v1`), lo que facilita la integración con clientes existentes.
- Despliegue distribuido con tensor parallelism en 1, 2 o 4 nodos GB10, con transferencia de pesos bajo demanda y caché local en cada nodo.
- Capacidades específicas del modelo base (código, matemáticas, tool calling, agentes, multilingüismo) no están documentadas en la información disponible.

## Casos de uso

- Inferencia sobre DGX Spark / GB10 en producción: el paquete está probado con veloGB10 en configuraciones TP=1, TP=2 y TP=4, con throughput medido de 76 a 129 tokens/s de decodificación según topología, lo que lo hace adecuado para servir un modelo de 42B en hardware de workstation.
- Asistentes conversacionales de contexto largo: con 262.144 tokens de ventana y prefix caching, el modelo puede mantener conversaciones multi-turno con documentos extensos sin recargar el prefijo en cada turno.
- Procesamiento de documentos largos por lotes: la ventana de contexto permite analizar contratos, informes o bases de código completas en una sola pasada, con prefill medido de 2.050 a 3.964 tokens/s según topología.
- Despliegue en clústeres pequeños de bajo consumo: la cuantización a 3,05 bpw reduce el peso del modelo a 86,2 GB en disco, permitiendo repartirlo entre varias máquinas GB10 sin copia completa del modelo en cada nodo.
- Backend compatible con OpenAI para herramientas existentes: al exponer `/v1`, se puede conectar a clientes y frameworks que ya hablan el protocolo de OpenAI sin adaptadores adicionales.
- Evaluación de decodificación especulativa: la cabeza MTP incluida permite medir el impacto de la decodificación especulativa en velocidad con tasas de aceptación cercanas al 70 %, útil para comparar estrategias de aceleración.
- Servicio con concurrencia moderada: con `--max-batch 2` y agregados de 123 a 195 tokens/s en dos peticiones simultáneas, encaja en cargas de trabajo de baja concurrencia y alta exigencia de contexto.

## Benchmarks y rendimiento

Datos medidos por el autor con veloGB10 0.7.7 sobre GB10 (2026-11-05), con sampling de producción, thinking activado y decodificación especulativa incluida. Una ejecución por celda, variación aproximada de ±10 %.

| Topologia | Fuente del borrador | Decode turno de codigo (tok/s) | Decode turno de relato (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza DotH-MTP | 129 | 63 | 76 | 2.050 | 123 | 71,1 % |
| TP=2 | Cabeza DotH-MTP | 166 | 87 | 100 | 3.352 | 151 | 69,5 % |
| TP=4 | Cabeza DotH-MTP | 204 | 108 | 129 | 3.964 | 195 | 71,0 % |

No se han publicado en la información disponible resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) para este paquete ni para el modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 86,2 GB en disco a 3,05 bpw, por lo que se requiere un total de memoria agregada del orden de esa cifra más overhead de contexto y caché KV.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de 1, 2 o 4 máquinas con tensor parallelism. No se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no se documenta que quepa en GPU de consumo; el hardware objetivo son nodos GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`) es el motor probado y recomendado. Al ser formato EXL3 estándar, cualquier framework que lea ExLlamaV3 podría cargarlo, aunque no se han probado otros.
- Red: para TP=2 y TP=4 se recomienda RoCE con `--rdma-dev` si hay varios pares de puertos activos; con un solo par se detecta automáticamente.
- Latencia y throughput: decodificación de 76 a 129 tok/s de mediana según topología; prefill de 2.050 a 3.964 tok/s; agregado de 123 a 195 tok/s con dos peticiones simultáneas.
- Configuración probada: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--prefix-cache on`, `--mtp=auto`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (EXL3 3.05bpw + DotH-MTP) | 42.516.047.651 | 262.144 | EXL3 3,05 bpw + cabeza MTP | qwen-community-1.0 | Probado en veloGB10 sobre GB10; decodificación especulativa integrada |
| doth4580/Qwen3.8-Flash-Next-EXL3-3.05bpw | 42.516.047.651 (mismo modelo base) | no disponible | EXL3 3,05 bpw sin cabeza MTP | qwen-community-1.0 | Mismos pesos sin decodificación especulativa; misma velocidad de referencia sin borrador |
| doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16 | no disponible | no disponible | BF16 con cabeza MTP | qwen-community-1.0 | Versión sin cuantizar del mismo modelo con la cabeza MTP re-destilada |
| Qwen/Qwen3.8-Flash-Next (original) | no disponible en la información | no disponible | Pesos originales del equipo Qwen | qwen-community-1.0 | Modelo base sin cuantizar ni cabeza MTP adicional |

No se dispone de datos de benchmarks comparativos con otras familias de modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio contiene pesos modificados (cuantizados a 3,05 bpw) y una cabeza MTP añadida; no es el modelo original y puede presentar degradación respecto a los pesos BF16, aunque no se cuantifica esa pérdida en la información disponible.
- La licencia qwen-community-1.0 impone condiciones específicas para uso comercial; es necesario revisar el texto completo en el enlace de licencia antes de desplegar en producción.
- El paquete está probado exclusivamente con veloGB10 sobre GB10; el rendimiento en otros motores o GPUs no está verificado y podría diferir sustancialmente.
- Las cifras de rendimiento provienen de una sola ejecución por celda con variación de ±10 %, por lo que no deben tomarse como valores garantizados.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas del modelo base en la información disponible.
- La ventana de contexto de 262.144 tokens es la configuración probada; no se especifica si es el máximo arquitectónico del modelo.
- El despliegue multi-nodo requiere configuración de red (RoCE, puertos, IPs de nodos) y no es plug-and-play fuera del entorno documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no cuenta aún con validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.05bpw-DotH-MTP
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack EXL3 sin cabeza MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.05bpw
- Cabeza MTP en BF16: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Pack EXL3 de turboderp (fuente de los pesos cuantizados): https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabeza MTP optimizada de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- ExLlamaV3 (herramienta de cuantización): https://github.com/turboderp-org/exllamav3
