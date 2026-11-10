# doth4580/Qwen3.8-27B-exl3-3.05bpw

## Resumen

Este repositorio contiene una cuantización EXL3 (ExLlamaV3) del modelo Qwen3.8-27B, desarrollado originalmente por el equipo Qwen. El pack ha sido generado por el usuario doth4580 utilizando exllamav3 1.4.7 sobre 8 GPUs NVIDIA H100, con una media de 3,05 bits por peso, `lm_head` a 6 bits, capa MTP a 4 bits y torre de visión a 6 bits. El resultado es un conjunto de pesos de aproximadamente 13,6 GB que conserva el tokenizador, la plantilla de chat y la configuración originales.

El modelo base es un transformer multimodal con capacidades de visión, etiquetado internamente como `qwen3_5` y `qwen4_exp`, y con una ventana de contexto que el motor de inferencia configurado para este pack lleva hasta 262.144 tokens. El pack está pensado y probado principalmente para el motor veloGB10 (`gb10_inference`) sobre una, dos o cuatro máquinas NVIDIA DGX Spark / GB10, aunque al ser formato EXL3 estándar puede cargarse en cualquier framework que lea dicho formato.

La relevancia de esta ficha radica en que documenta una cuantización agresiva (3,05 bpw) de un modelo multimodal de gran contexto, con datos medidos de rendimiento en hardware GB10 y soporte de decodificación especulativa mediante cabezas MTP y drafters DFlash2. Es un caso práctico de despliegue de un modelo de 27B en clústeres de pequeñas máquinas con aceleración RDMA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`, `qwen4_exp`), con torre de visión y capa MTP |
| Parametros totales | 6.810.178.944 (según safetensors del repo cuantizado); el modelo base se denomina Qwen3.8-27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens configurados en veloGB10 (`--max-seq-len 262144`) |
| Tipos de cuantizacion | EXL3 a 3,05 bpw de media; `lm_head` 6 bits; capa MTP 4 bits; torre de visión 6 bits; codebook `mul1`; out-scales `always` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal del equipo Qwen, con una torre de visión integrada y una capa MTP (multi-token prediction) que se usa como fuente de draft para decodificación especulativa. La cuantización se realizó con exllamav3 1.4.7 sobre 8× NVIDIA H100, con calibración de 250 secuencias de 2.048 tokens, codebook `mul1` y out-scales en modo `always`. Se mantienen sin cambios el tokenizador, la plantilla de chat y la configuración original, salvo los metadatos de cuantización.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La innovación técnica destacable de este pack es la combinación de cuantización EXL3 de bajo bit-width con decodificación especulativa mediante la cabeza MTP incluida y, opcionalmente, drafters DFlash2 externos (bf16 o NVFP4), con tasas de aceptación medidas entre el 67% y el 75%.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable (`--reasoning-effort low` en los comandos de ejemplo).
- Procesamiento de visión: el pack incluye torre de visión cuantizada a 6 bits, lo que indica soporte de entrada de imágenes.
- Decodificación especulativa: cabeza MTP integrada y compatibilidad con drafters DFlash2 (bf16 y NVFP4) mediante `--spec-source dflash2`.
- Contexto largo: ventana configurable hasta 262.144 tokens, con prefix caching (`--prefix-cache on`).
- Servidor compatible con la API de OpenAI en `http://<head-ip>:9000/v1`.
- Ejecución distribuida en topologías TP=1, TP=2 y TP=4 sobre máquinas GB10, con transferencia de pesos por red y caché local en los nodos.
- Soporte de KV cache cuantizada a 8 bits (`--kv-cache q8`) y prefill en FP8 (`--fp8-prefill on`).
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Despliegue de un modelo multimodal de 27B en clústeres de DGX Spark: el pack está diseñado para cargarse en una, dos o cuatro máquinas GB10 con veloGB10, lo que permite servir un modelo grande en hardware de sobremesa distribuido sin GPUs de datacenter.
- Asistentes con contexto muy largo: con 262.144 tokens de ventana y prefix caching, es adecuado para analizar documentos extensos, bases de código completas o historiales de conversación prolongados manteniendo coherencia.
- Procesamiento de documentos con imágenes: la torre de visión a 6 bits permite tareas de extracción de información, descripción de figuras o respuesta a preguntas sobre capturas y diagramas.
- Generación de código interactiva: los benchmarks del pack muestran decodificación de turnos de código a 55 tok/s en TP=1 y hasta 136 tok/s en TP=4 con drafter NVFP4, lo que lo hace viable para autocompletado y revisión de código en producción.
- Razonamiento multi-paso con modo thinking: útil en pipelines de análisis que requieren cadenas de razonamiento largas, ajustando el esfuerzo de razonamiento según la latencia objetivo.
- Servicio de API compatible con OpenAI: al exponer un endpoint compatible, puede integrarse como backend en aplicaciones existentes que ya consumen la API de OpenAI, sin cambios en el cliente.
- Inferencia por lotes con concurrencia moderada: con `--max-batch 2` y agregados de 68 a 123 tok/s según topología, encaja en cargas de trabajo de equipos pequeños o entornos de investigación.

## Benchmarks y rendimiento

Los datos medidos con VeloBench sobre GB10 (2026-11-08, veloGB10 0.7.7, muestreo de producción, thinking activado, una ejecución por celda, variación aproximada de ±10%) son los siguientes:

| Topologia | Fuente de draft | Decode turno de código (tok/s) | Decode turno de relato (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptación del draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | MTP del pack | 55 | 27 | 33 | 903 | 71 | 68,4% |
| TP=2 | MTP del pack | 76 | 40 | 49 | 1.531 | 90 | 67,2% |
| TP=4 | MTP del pack | 112 | 60 | 74 | 1.898 | 123 | 68,1% |
| TP=1 | DFlash2 (bf16) | 63 | 21 | 25 | 869 | 71 | 73,9% |
| TP=2 | DFlash2 (bf16) | 81 | 27 | 30 | 1.436 | 89 | 74,7% |
| TP=4 | DFlash2 (bf16) | 96 | 42 | 40 | 1.764 | 119 | 71,0% |
| TP=1 | DFlash2 (NVFP4 FIXED) | 85 | 19 | 28 | 880 | 68 | 74,8% |
| TP=2 | DFlash2 (NVFP4 FIXED) | 102 | 34 | 57 | 1.434 | 92 | 72,8% |
| TP=4 | DFlash2 (NVFP4 FIXED) | 136 | 41 | 57 | 1.752 | 121 | 73,2% |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 13,6 GB en disco para los pesos cuantizados a 3,05 bpw; a ello hay que sumar la KV cache (q8) y los buffers de activación, cuyo tamaño depende de la longitud de secuencia configurada (hasta 262.144 tokens).
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de una, dos o cuatro máquinas. La cuantización se generó en 8× NVIDIA H100, pero el pack está orientado a GB10.
- Cabe en GPU de consumo: no disponible; el pack está probado específicamente en GB10 y no se documenta su funcionamiento en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: veloGB10 (`gb10_inference`) es el motor principal y probado; al ser formato EXL3 estándar, cualquier framework que lea EXL3 podría cargarlo, aunque no se documentan pruebas con otros motores.
- Latencia y throughput: prefill de 903 a 1.898 tok/s según topología; decode mediano de 25 a 74 tok/s; agregado con 2 peticiones de 68 a 123 tok/s. La decodificación especulativa está incluida en las cifras de decode.
- Red: las topologías multi-máquina usan RoCE; con dos pares de puertos activos se selecciona con `--rdma-dev <rail1>,<rail2>`. Los nodos no necesitan copia del modelo: el head envía solo la porción correspondiente y la cachea localmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-27B-exl3-3.05bpw | 6.810.178.944 (pesos cuantizados); base 27B | 262.144 tokens (config. veloGB10) | EXL3 3,05 bpw, safetensors | Apache-2.0 | Optimizado para veloGB10 en GB10; incluye visión y MTP |
| Qwen/Qwen3.8-27B (modelo base) | 27B (denominación) | no disponible | safetensors originales | Apache-2.0 | Pesos sin cuantizar; referencia de calidad |
| doth4580/Qwen3.8-27B-DFlash2 | no disponible | no disponible | drafter bf16 | no disponible | Drafter de decodificación especulativa para este pack |
| doth4580/Qwen3.8-27B-DFlash2-NVFP4-RTNcal-FIXED | no disponible | no disponible | drafter NVFP4 | no disponible | Variante NVFP4 del drafter, con mayor aceptación en TP=1 (74,8%) |

No se dispone de datos de benchmarks del modelo base ni de otras cuantizaciones comparables en la información proporcionada, por lo que no es posible comparar calidad ni rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización a 3,05 bpw introduce pérdida de calidad respecto a los pesos originales; no se han publicado evaluaciones de calidad (perplejidad, benchmarks) que cuantifiquen esa degradación.
- El pack está probado únicamente con veloGB10 sobre GB10; su comportamiento en otros motores EXL3 o en otras GPU no está documentado.
- Los datos de rendimiento provienen de una sola ejecución por celda, con variación aproximada de ±10%, por lo que deben tomarse como orientativos.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.
- El rendimiento en turnos de relato es notablemente inferior al de turnos de código (por ejemplo, 27 frente a 55 tok/s en TP=1 con MTP), lo que sugiere menor eficacia de la decodificación especulativa en texto libre.
- La licencia Apache-2.0 se hereda del modelo base; el autor del pack no reclama propiedad intelectual sobre el modelo, los pesos ni la arquitectura.
- El uso comercial está permitido por la licencia Apache-2.0, pero conviene verificar los términos del modelo base original en su repositorio.
- El contexto de 262.144 tokens requiere memoria adicional para la KV cache; no se especifica el consumo exacto por token.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face del pack: https://huggingface.co/doth4580/Qwen3.8-27B-exl3-3.05bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- exllamav3 (herramienta de cuantización): https://github.com/turboderp-org/exllamav3
- veloGB10 (motor de inferencia): https://github.com/sf-stav/veloGB10
- Drafter DFlash2 (bf16): https://huggingface.co/doth4580/Qwen3.8-27B-DFlash2
- Drafter DFlash2 (NVFP4 FIXED): https://huggingface.co/doth4580/Qwen3.8-27B-DFlash2-NVFP4-RTNcal-FIXED
