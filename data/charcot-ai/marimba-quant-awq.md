# charcot-ai/marimba-quant-awq

## Resumen

Marimba-quant-awq es una colección de pesos cuantizados del codificador de audio del modelo Marimba, publicado por charcot-ai. Marimba es un sistema de detección de actividad de voz y gestión de turnos de conversación que lee sus decisiones de un codificador de audio congelado, concretamente el `thinker.audio_tower` de Qwen3-ASR-0.6B. Este repositorio no contiene el modelo completo ni las cabezas de decisión, sino únicamente las 109 matrices `nn.Linear` del codificador, cuantizadas con AWQ (activation-aware weight quantization) a 8, 6, 5 y 4 bits.

El objetivo es reducir el tamaño en disco del fichero del codificador sin alterar el resto del pipeline. Los pesos cuantizados se desempaquetan a punto flotante en tiempo de carga, de modo que la inferencia se ejecuta en bf16 normal: el ahorro es de almacenamiento, no de velocidad ni de memoria en tiempo de ejecución. El repositorio publica cada variante construida junto con sus métricas medidas, lo que permite comparar el efecto de cada anchura de bit, tamaño de grupo y esquema de cuantización.

La relevancia es fundamentalmente metodológica: es un banco de pruebas reproducible sobre cuánto degrada AWQ las decisiones de un codificador de audio pequeño (369,3 MB en bf16) en tareas de detección de voz, cambio de hablante, recuento de hablantes y fin de turno. La licencia es Apache 2.0 y el idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio de Qwen3-ASR-0.6B (`thinker.audio_tower`): 3 capas `Conv2d`, `conv_out` y 18 capas transformer |
| Parametros totales | No disponible (solo se publica el tamaño del fichero: 369,3 MB en bf16 para los tensores del codificador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ asimétrica y simétrica a 8, 6, 5 y 4 bits; RTN a 8 y 4 bits; llm-compressor `W8A16` y `W4A16`; grupos de 32 y 128 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` con enteros empaquetados (`.q`), escala y punto cero por grupo, más tensores en punto flotante |

## Arquitectura y entrenamiento

El codificador es el `thinker.audio_tower` de Qwen3-ASR-0.6B: tres capas convolucionales 2D, una proyección `conv_out` y 18 capas transformer. Las cabezas de decisión de Marimba leen los estados ocultos de las capas 9, 12 y 18 y los convierten en seis tipos de decisión (fin de turno, actividad de voz, mismo hablante, cambio de hablante, recuento de hablantes y otras). En este repositorio solo se cuantizan las 109 matrices `nn.Linear` (`conv_out` y `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1`, `fc2` de cada capa); convoluciones, sesgos y layer norms permanecen en punto flotante, y las cabezas de decisión y el decodificador de texto no se incluyen.

No se describe entrenamiento adicional: los pesos del codificador están congelados y la cuantización se aplica sobre ellos. El proceso AWQ incluye búsqueda de escala y de recorte (clip search) por capa, con calibración cuyo resumen se guarda en `awq_config.json` y cuyo resultado por capa se registra en `awq_report.json` (solo para la implementación directa). Las variantes con `llm-compressor` usan `AWQModifier` en modo simétrico por canal de salida. La innovación destacable no es arquitectónica sino de evaluación: cada variante se mide contra una referencia fp32 con las cabezas originales sin modificar, contabilizando AUROC, exactitud, número de decisiones cambiadas sobre 6.516 y cambio máximo de probabilidad.

## Capacidades

- Detección de actividad de voz (`voice_activity`) sobre ventanas de audio.
- Detección de fin de turno (`turn_end`) para sistemas de diálogo por voz.
- Identificación de mismo hablante (`same_speaker`) y cambio de hablante (`speaker_change`).
- Recuento de hablantes (`speaker_count`).
- Producción de estados ocultos en las capas 9, 12 y 18 para las cabezas de decisión de Marimba.
- No incluye generación de texto, razonamiento, código, matemáticas, visión ni tool calling.
- No incluye decodificador de texto: es exclusivamente un codificador de audio cuantizado.
- No soporta agentes ni razonamiento multi-paso.
- Multilingüismo: solo inglés declarado.

## Casos de uso

- Detección de actividad de voz en pipelines de transcripción: sustituir el codificador bf16 por una variante de 8 bits reduce el fichero de 369,3 MB a 196,3 MB con una variación de AUROC de `voice_activity` de 0,0000, útil cuando el tamaño del artefacto desplegado es crítico.
- Gestión de turnos en asistentes de voz: la variante `awq_w8_g128_sym` mantiene `turn_end` AUROC en 0,9316 frente a 0,9310 de la referencia fp32, con solo 19 decisiones cambiadas de 6.516, adecuada para producción en entornos con almacenamiento limitado.
- Segmentación de reuniones y diarización ligera: las cabezas de `same_speaker` y `speaker_change` permiten trocear audio por hablante; con `awq_w6_g32` el AUROC de `same_speaker` sube a 0,9936 frente a 0,9926 de referencia.
- Despliegue en dispositivos de borde con almacenamiento restringido: `awq_w4_g128` ocupa 106,1 MB, un 71 % menos que bf16, a costa de degradar `turn_end` en 0,0122 de AUROC y cambiar 221 decisiones.
- Investigación sobre cuantización de codificadores de audio: el repositorio publica 13 variantes con métricas medidas, lo que permite estudiar la relación entre anchura de bit, tamaño de grupo y estabilidad de las decisiones sin reentrenar nada.
- Validación de pipelines de cuantización: comparar AWQ con búsqueda de escala frente a RTN y frente a `llm-compressor` en un codificador pequeño y con etiquetas públicas, como paso previo a cuantizar modelos mayores.
- Evaluación de robustez numérica entre GPUs: los autores documentan que bf16 no es bit-idéntico entre RTX 4090 y L4 (por ejemplo, `awq_w6_g128` `speaker_count` da 0,7782 en L4 frente a 0,7805 en 4090), lo que sirve para calibrar tolerancias en pruebas de regresión.

## Benchmarks y rendimiento

Resultados publicados por el autor. La referencia fp32 se ejecuta en CPU ventana a ventana; las variantes cuantizadas, en bf16 sobre la ruta GPU por lotes (RTX 4090). Entre paréntesis, diferencia respecto a fp32.

| Variante | Bits | Tamano (MB) | `turn_end` AUROC | `voice_activity` AUROC | `same_speaker` AUROC | `speaker_change` AUROC | `speaker_count` acc | Decisiones cambiadas | Cambio max. prob. |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| fp32 referencia | 32 | - | 0,9310 | 0,9969 | 0,9926 | 0,9557 | 0,7862 | 0 | 0,000 |
| bf16 sin cuantizar | 16 | 369,3 | 0,9319 (+0,0009) | 0,9969 (-0,0000) | 0,9929 (+0,0003) | 0,9556 (-0,0001) | 0,7874 (+0,0011) | 10 | 0,122 |
| `awq_w8_g128` | 8 | 196,3 | 0,9307 (-0,0003) | 0,9970 (+0,0000) | 0,9925 (-0,0001) | 0,9559 (+0,0002) | 0,7885 (+0,0023) | 26 | 0,121 |
| `awq_w8_g128_sym` | 8 | 196,3 | 0,9316 (+0,0006) | 0,9969 (+0,0000) | 0,9932 (+0,0006) | 0,9559 (+0,0002) | 0,7885 (+0,0023) | 19 | 0,152 |
| `rtn_w8_g128` | 8 | 196,1 | 0,9305 (-0,0005) | 0,9969 (-0,0000) | 0,9929 (+0,0003) | 0,9554 (-0,0003) | 0,7839 (-0,0023) | 16 | 0,143 |
| `llmc_awq_w8a16` | 8 | 190,0 | 0,9297 (-0,0013) | 0,9969 (-0,0000) | 0,9928 (+0,0002) | 0,9556 (-0,0001) | 0,7839 (-0,0023) | 42 | 0,101 |
| `awq_w6_g128` | 6 | 151,2 | 0,9291 (-0,0019) | 0,9968 (-0,0001) | 0,9931 (+0,0004) | 0,9555 (-0,0002) | 0,7805 (-0,0057) | 68 | 0,288 |
| `awq_w6_g32` | 6 | 172,3 | 0,9311 (+0,0001) | 0,9969 (-0,0000) | 0,9936 (+0,0009) | 0,9550 (-0,0007) | 0,7862 (+0,0000) | 53 | 0,160 |
| `awq_w5_g128` | 5 | 128,7 | 0,9327 (+0,0017) | 0,9968 (-0,0001) | 0,9926 (+0,0000) | 0,9559 (+0,0002) | 0,7885 (+0,0023) | 116 | 0,342 |
| `awq_w5_g32` | 5 | 149,8 | 0,9236 (-0,0073) | 0,9969 (-0,0000) | 0,9915 (-0,0011) | 0,9543 (-0,0014) | 0,7908 (+0,0046) | 84 | 0,284 |
| `awq_w4_g128` | 4 | 106,1 | 0,9188 (-0,0122) | 0,9968 (-0,0002) | 0,9900 (-0,0027) | 0,9512 (-0,0045) | 0,7678 (-0,0184) | 221 | 0,652 |
| `awq_w4_g128_sym` | 4 | 106,1 | 0,9198 (-0,0112) | 0,9970 (+0,0000) | 0,9891 (-0,0035) | 0,9535 (-0,0022) | 0,7575 (-0,0287) | 232 | 0,708 |
| `awq_w4_g32` | 4 | 127,3 | 0,9346 (+0,0036) | 0,9967 (-0,0003) | 0,9924 (-0,0002) | 0,9523 (-0,0035) | 0,7563 (-0,0299) | 210 | 0,575 |
| `rtn_w4_g128` | 4 | 106,0 | 0,9249 (-0,0060) | 0,9968 (-0,0001) | 0,9924 (-0,0002) | 0,9533 (-0,0024) | 0,7862 (+0,0000) | 282 | 0,694 |
| `llmc_awq_w4a16` | 4 | 106,1 | 0,9098 (-0,0212) | 0,9966 (-0,0003) | 0,9890 (-0,0036) | 0,9506 (-0,0052) | no disponible | no disponible | no disponible |

## Requisitos de hardware

- Almacenamiento: entre 106,1 MB (4 bits) y 196,3 MB (8 bits) para el fichero del codificador, frente a 369,3 MB en bf16 y 1,88 GB del `model.safetensors` completo de Qwen3-ASR-0.6B.
- VRAM de inferencia: equivalente a la del codificador sin cuantizar, porque los enteros se convierten a bf16 al cargar. No hay ahorro de memoria en ejecución.
- GPU validadas por el autor: NVIDIA GeForce RTX 4090 (ruta GPU por lotes) y NVIDIA L4 (usada para comprobar diferencias numéricas de bf16).
- Cabe en GPU de consumo: sí, al tratarse de un codificador de audio de 369,3 MB en bf16; cualquier GPU con varios GB de VRAM es suficiente.
- Opciones de despliegue: el paquete propio `marimba` y el código de `Charcot-AI/marimba-api`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que la velocidad y la memoria coinciden con las del codificador sin cuantizar.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (codificadores de audio cuantizados para detección de voz y turnos). La comparación relevante es interna, entre las variantes del propio repositorio:

| Variante | Bits | Tamano (MB) | `turn_end` AUROC | `speaker_count` acc | Licencia |
|---|---|---:|---:|---:|---|
| `awq_w8_g128_sym` | 8 | 196,3 | 0,9316 | 0,7885 | Apache 2.0 |
| `awq_w6_g32` | 6 | 172,3 | 0,9311 | 0,7862 | Apache 2.0 |
| `awq_w4_g128` | 4 | 106,1 | 0,9188 | 0,7678 | Apache 2.0 |
| `rtn_w4_g128` | 4 | 106,0 | 0,9249 | 0,7862 | Apache 2.0 |

## Limitaciones y advertencias

- No es un modelo de inferencia entera: los pesos se desempaquetan a punto flotante al cargar y la inferencia se ejecuta en bf16, por lo que no hay ganancia de velocidad ni de VRAM, solo de tamaño en disco.
- El repositorio contiene únicamente el codificador: faltan las cabezas de decisión y el decodificador de texto, que deben tomarse de `charcot-ai/marimba`.
- Solo se declara inglés; no hay evidencia de comportamiento en otros idiomas.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y negativos en las decisiones de voz, cambio de hablante y fin de turno.
- La cuantización a 4 bits degrada de forma apreciable `turn_end` (hasta -0,0212 de AUROC con `llmc_awq_w4a16`) y `speaker_count` (hasta -0,0299 de exactitud con `awq_w4_g32`), con más de 200 decisiones cambiadas de 6.516.
- Los resultados en bf16 no son bit-idénticos entre GPUs: en L4 las cifras difieren en el tercer o cuarto decimal respecto a la RTX 4090.
- La referencia fp32 se ejecuta en CPU ventana a ventana, mientras que las variantes se ejecutan en GPU por lotes; parte de las diferencias observadas puede deberse al cambio de ruta, no solo a la cuantización (la propia variante bf16 sin cuantizar cambia 10 decisiones).
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las condiciones del modelo base Qwen3-ASR-0.6B del que procede el codificador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charcot-ai/marimba-quant-awq
- Modelo base Marimba: https://huggingface.co/charcot-ai/marimba
- Código del paquete: https://github.com/Charcot-AI/marimba-api
- Paper de AWQ (referenciado en los tags): https://arxiv.org/abs/2306.00978
- Modelo de origen del codificador: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
