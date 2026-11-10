# doth4580/Qwen3.8-Flash-Next-EXL3-4.18bpw

## Resumen

Qwen3.8-Flash-Next-EXL3-4.18bpw es una redistribución en formato EXL3 (ExLlamaV3) del modelo Qwen3.8-Flash-Next, desarrollado originalmente por el equipo Qwen. Se trata de una cuantización de 4,18 bits por peso (bpw) elaborada por turboderp mediante la herramienta exllamav3, empaquetada y publicada por el usuario doth4580 sin modificaciones sobre los pesos originales. El repositorio actúa como espejo estable para las pruebas de rendimiento del motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 34.963.578.368 parámetros totales según los pesos en safetensors. No se dispone de información sobre el número de parámetros activos, la longitud de contexto nativa del modelo original ni la composición del dataset de entrenamiento en la información proporcionada. El pack cuantizado ocupa 122 GB en el repositorio, lo que refleja la huella del modelo completo en formato EXL3.

La relevancia de esta ficha radica en que documenta un artefacto de cuantización orientado a despliegue en clústeres de GB10, con instrucciones de ejecución verificadas para topologías de 1, 2 y 4 máquinas y datos de throughput medidos con el motor veloGB10. Es un ejemplo de cuantización de precisión mixta (4,18 bpw) sobre un MoE de gran tamaño, pensada para inferencia distribuida en hardware de consumo profesional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) |
| Parametros totales | 34.963.578.368 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en veloGB10) |
| Tipos de cuantizacion | EXL3 4,18 bpw (variante `4.18bpw_h6_ng8`) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con arquitectura de mezcla de expertos (MoE), según las etiquetas del repositorio. Los pesos cuantizados suman 34.963.578.368 parámetros totales. No se dispone de información sobre el número de parámetros activos por token, el número de expertos, la dimensión oculta ni la configuración de atención en la información proporcionada.

La cuantización fue realizada por turboderp con exllamav3, en la variante `4.18bpw_h6_ng8` (4,18 bits por peso, con parámetros de grupo h6 y ng8). El pack se redistribuye byte a byte sin reconversión ni reempaquetado. Incluye una cabeza MTP (multi-token prediction) propia del pack que se usa por defecto para decodificación especulativa; el autor documenta dos cabezas alternativas (HermiHg y DotH-MTP) que solo afectan a la velocidad, no a la salida. No se dispone de información sobre el dataset de entrenamiento, el número de tokens vistos ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el modelo base es de propósito general, con modo de pensamiento (thinking) activado por defecto en las pruebas documentadas.
- Generación de código: las pruebas de veloGB10 incluyen un turno de código con decodificación medida a 146-178 tok/s según topología.
- Decodificación especulativa: soporta cabeza MTP propia y cabezas alternativas (HermiHg, DotH-MTP) con tasas de aceptación del 71-73 %.
- Servicio compatible con OpenAI: el motor veloGB10 expone una API en `/v1` compatible con el formato de OpenAI.
- Procesamiento por lotes: soporta `--max-batch` para múltiples peticiones concurrentes (2 en las pruebas documentadas).
- Caché de prefijos: soporta `--prefix-cache on` para reutilizar prefijos de contexto.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia distribuida en clústeres DGX Spark: el pack está diseñado para ejecutarse en 1, 2 o 4 máquinas GB10 con paralelismo tensorial (TP=1/2/4), lo que permite servir un MoE de ~35.000 millones de parámetros en hardware de borde sin una GPU de centro de datos.
- Servicio de API compatible con OpenAI: el motor veloGB10 expone un endpoint `/v1` que permite integrar el modelo en aplicaciones existentes que ya consumen la API de OpenAI sin cambiar el código cliente.
- Procesamiento de contexto largo: con 262.144 tokens de ventana configurada, es adecuado para tareas de análisis de documentos extensos, resúmenes de repositorios de código o conversaciones multi-turno con historial amplio.
- Generación de código en pipelines internos: el rendimiento medido en turnos de código (146-178 tok/s) lo hace viable para asistentes de programación y generación de tests en entornos con hardware GB10.
- Despliegue con decodificación especulativa: la cabeza MTP integrada y las alternativas permiten acelerar la generación sin cambiar la salida, útil en servicios interactivos donde la latencia importa.
- Evaluación y benchmarking de motores de inferencia: el repositorio sirve como referencia estable para reproducir las pruebas de veloGB10 y comparar cabezas MTP.
- Prototipado de agentes con razonamiento multi-paso: el modo thinking activado por defecto y la ventana de contexto larga permiten cadenas de razonamiento extensas, aunque no se documenta soporte explícito de tool calling.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de throughput del motor veloGB10 sobre hardware GB10 (2026-11-06, veloGB10 0.7.7), con muestreo de producción, thinking activado y una petición a la vez en las columnas de petición única. La decodificación se mide en tokens de salida por segundo e incluye decodificación especulativa. Una ejecución por celda, con variación aproximada de ±10 %.

| Topologia | Fuente de draft | Decode turno codigo | Decode turno relato | Mediana decode todos los turnos | Prefill (tok/s) | 2 peticiones, agregado | Aceptacion de draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=2 | Cabeza MTP del pack | 146 | 79 | 89 | 3.261 | 133 | 72,3 % |
| TP=4 | Cabeza MTP del pack | 176 | 99 | 117 | 3.870 | 176 | 71,3 % |
| TP=2 | Cabeza MTP HermiHg | 150 | 76 | 96 | 3.272 | 142 | 72,7 % |
| TP=4 | Cabeza MTP HermiHg | 178 | 96 | 117 | 3.840 | 196 | 72,1 % |
| TP=2 | Cabeza DotH-MTP | 148 | 72 | 91 | 3.264 | 143 | 71,5 % |
| TP=4 | Cabeza DotH-MTP | 178 | 99 | 114 | 3.777 | 190 | 71,4 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el pack cuantizado ocupa 122 GB en disco; en memoria debe caber en el conjunto de GPUs disponibles. Con TP=1 en una sola GB10 el motor sirve una única línea de petición a 262.144 tokens de contexto.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de 1, 2 o 4 máquinas con paralelismo tensorial.
- Cabe en GPU de consumo: no disponible para GPUs consumer convencionales; el diseño apunta a GB10 y clústeres multi-nodo con interconexión RoCE/RDMA.
- Opciones de despliegue: veloGB10 (`gb10_inference`, binario autocontenido, servidor compatible con OpenAI) es el motor probado. Los pesos son EXL3 estándar, por lo que cualquier framework que lea el formato ExLlamaV3 puede usarlos, aunque no se documentan pruebas con otros motores.
- Latencia y throughput: según la tabla anterior, decodificación de 89-117 tok/s de mediana (TP=2/TP=4), prefill de 3.261-3.870 tok/s, y 133-196 tok/s agregados con 2 peticiones concurrentes.
- Red: en TP=2/TP=4 los nodos no necesitan copia del modelo; la cabeza envía a cada nodo solo su parte de los pesos y la cachea localmente. Con dos pares de puertos RoCE activos se selecciona el rail con `--rdma-dev`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-EXL3-4.18bpw (este) | 34.963.578.368 | 262.144 (config. veloGB10) | EXL3 4,18 bpw | qwen-community-1.0 | safetensors (EXL3) |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | BF16 (original) | qwen-community-1.0 | safetensors |
| turboderp/Qwen3.8-Flash-Next-exl3 | no disponible | no disponible | EXL3 (varias variantes) | qwen-community-1.0 | safetensors (EXL3) |

No se dispone de datos de rendimiento de calidad de los modelos comparables en la información proporcionada, por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Es una cuantización a 4,18 bpw: puede haber una pérdida de calidad respecto al modelo base en BF16, aunque no se documenta una evaluación comparativa de calidad en la información disponible.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación específico ni limitaciones idiomáticas del modelo base.
- La licencia Qwen Community License 1.0 impone condiciones para uso comercial; es necesario revisar el texto completo en el enlace de licencia antes de desplegar en producción.
- El pack está optimizado y probado para veloGB10 sobre GB10; el rendimiento en otros motores o GPUs no está documentado.
- Las mediciones de throughput son de una sola ejecución por celda con variación de ±10 %, por lo que deben tomarse como orientativas.
- El repositorio no añade garantías propias: los derechos y licencias del modelo, pesos y arquitectura permanecen con los autores originales.
- No se documenta soporte de tool calling, visión ni audio; no debe asumirse su disponibilidad sin verificar el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-4.18bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack EXL3 original de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Herramienta de cuantización exllamav3: https://github.com/turboderp-org/exllamav3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Cabeza MTP optimizada de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Cabeza DotH-MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
