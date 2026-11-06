# HY-2012/FlowHigh.AXERA

## Resumen

FlowHigh.AXERA es un modelo de superresolución de voz y extensión de ancho de banda (bandwidth extension) que convierte audio de entrada de 8 kHz o 16 kHz en audio de salida a 48 kHz. Lo publica el usuario HY-2012 en Hugging Face y deriva del modelo `kiriyamaX/FLowHigh_indep_adaptive_400k`, del que constituye una adaptación optimizada para el NPU3 del SoC AX650 de Axera. El pipeline declarado es `audio-to-audio` y la librería asociada es `axera`, lo que indica que el artefacto principal son dos ficheros `axmodel` (Flow de 38 MB y BigVGAN de 20 MB, 58 MB en total) preparados para ejecutarse en la placa AX650N.

El modelo resuelve un problema concreto en despliegue embebido: mejorar la calidad percibida de audio telefónico o de voz de baja frecuencia de muestreo sin recurrir a GPUs ni a servicios en la nube. Según la model card, el RTF medido en Python sobre la placa es de 0,24 para audios de 20 a 60 segundos, es decir, procesa aproximadamente cuatro veces más rápido que tiempo real. La arquitectura combina un modelo generativo de flujo (35,4 M de parámetros) con un vocoder BigVGAN (14,0 M de parámetros), sumando unos 49,4 M de parámetros y un peso de checkpoint de 481.490.826 bytes.

Es relevante ahora porque el autor lo presenta como una de tres alternativas evaluadas en el mismo hardware (junto a AudioSR y LavaSR), y porque documenta explícitamente que LavaSR obtiene mejor RTF (0,061 en C++) y además soporta reducción de ruido, por lo que la propia model card recomienda LavaSR como opción prioritaria. FlowHigh.AXERA queda, por tanto, como una implementación de referencia para quienes necesiten el pipeline FlowHigh en NPU3, con soporte de inglés y chino y sin función de denoising.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow generativo (35,4 M) + vocoder BigVGAN (14,0 M) |
| Parámetros totales | 49,4 M (35,4 M Flow + 14,0 M BigVGAN) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de procesado no especificada) |
| Tipos de cuantización | U16 y S8 en los `axmodel` (38 MB Flow, 20 MB BigVGAN) |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | `axmodel` (empaquetado para AX650 NPU3); checkpoint base de 481.490.826 bytes |

## Arquitectura y entrenamiento

El modelo sigue un esquema en dos etapas típico de la superresolución de audio generativa: un modelo de flujo condicionado por la señal de entrada de baja frecuencia que estima la representación de banda ancha, seguido de un vocoder BigVGAN que sintetiza la forma de onda a 48 kHz. La model card indica explícitamente el uso de un esquema de decodificación de 1 paso (`1-step flow`) con `std=1e-4` por defecto, lo que reduce el coste de inferencia frente a muestreos iterativos. El checkpoint base se identifica como `FLowHigh_indep_adaptive_400k`, y el autor señala que el tamaño de 38 MB del `axmodel` Flow es el esperado tras aplicar cuantización S8 a los pesos.

No se detallan en la información disponible el número de tokens de audio vistos durante el entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO (poco habituales en modelos de audio de este tipo). Tampoco se especifica la función de pérdida ni el esquema de condicionamiento exacto. La adaptación a AXERA consiste en la conversión de los pesos a dos `axmodel` separados (Flow y BigVGAN) con cuantización U16/S8 para ejecutarse en el NPU3 del AX650. El modelo no incorpora etapa de reducción de ruido, algo que el autor remarca explícitamente.

## Capacidades

- Superresolución de voz de 8 kHz a 48 kHz.
- Superresolución de voz de 16 kHz a 48 kHz.
- Extensión de ancho de banda (bandwidth extension) sobre señales de voz.
- Salida fija a 48 kHz.
- Procesamiento en tiempo casi real en hardware embebido (RTF 0,24 en Python sobre AX650).
- Soporte de audio de 20 a 60 segundos por invocación según las mediciones del autor.
- Idiomas de entrenamiento/evaluación: inglés y chino.
- No realiza reducción de ruido (denoising) ni separación de fuentes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras modalidades (texto, visión, audio de entrada distinto de voz).

## Casos de uso

- Mejora de audio telefónico en centralita o gateway VoIP: el modelo eleva llamadas de 8 kHz a 48 kHz antes de reenviarlas a un sistema de transcripción o a un reproductor, mejorando la inteligibilidad percibida sin salir del dispositivo.
- Postprocesado de grabaciones de call center: se aplica por lotes sobre ficheros de 20 a 60 segundos para mejorar la calidad antes de archivado o de análisis por modelos ASR.
- Restauración de archivos históricos de voz: grabaciones digitalizadas a 8 kHz se reescalan a 48 kHz para publicación o para su uso en herramientas modernas que esperan audio de banda ancha.
- Preprocesado en pipelines de ASR: la señal superresuelta puede alimentar un reconocedor entrenado con audio de 48 kHz, reduciendo el desajuste de dominio.
- Integración en dispositivos de captura (micrófonos, auriculares, cámaras IP): el bajo consumo del NPU3 del AX650 permite ejecutar la superresolución en el propio dispositivo antes de transmitir.
- Demostraciones y evaluación de modelos de audio generativo: sirve como referencia de despliegue de FlowHigh en NPU para comparar con AudioSR y LavaSR en el mismo hardware.
- Generación de material de escucha para validación subjetiva: la model card incluye pares de entrada y salida con espectrogramas para inspección cualitativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks objetivos (MOS, PESQ, STOI, LSD u otros) en la información disponible. La model card únicamente reporta métricas de velocidad y muestras cualitativas.

| Métrica | Valor reportado |
|---|---|
| RTF en Python sobre AX650N | 0,24 (audio de 20 a 60 s) |
| RTF de LavaSR en C++ sobre AX650N (referencia del autor) | 0,061 (≈16× tiempo real) |
| Tamaño total de los `axmodel` | 58 MB (38 MB Flow + 20 MB BigVGAN) |
| Checkpoint base | 481.490.826 bytes |

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en el NPU3 del SoC AX650, no en GPU.
- Hardware objetivo: placa AX650N con NPU3 (Axera).
- No se documenta ejecución en GPU de consumo (RTX 4090, etc.) ni en A100/H100 con este formato `axmodel`.
- Despliegue: scripts `run_ax650.sh` incluidos en el repositorio, con entrada `samples/listen/8k/*.wav` y salida a 48 kHz.
- Latencia/throughput: RTF 0,24 en Python sobre la placa para audios de 20 a 60 s.
- Alternativa recomendada por el propio autor en el mismo hardware: LavaSR (RTF ≈ 0,061 en C++, con denoising).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada → salida | RTF en AX650N | Denoising | Licencia |
|---|---|---|---|---|---|---|
| FlowHigh.AXERA | Flow + BigVGAN en NPU3 | 49,4 M | 8/16 kHz → 48 kHz | 0,24 (Python) | No | no disponible |
| LavaSR | no disponible | no disponible | 8–48 kHz → 48 kHz | 0,061 (C++) | Sí | no disponible |
| AudioSR | no disponible | no disponible | no disponible | ejecutado en AX650N, valor no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; no se puede asumir uso comercial sin consultar al autor o al modelo base.
- El modelo no realiza reducción de ruido; el autor lo indica explícitamente y recomienda LavaSR cuando se necesita denoising.
- Solo se documentan inglés y chino; el comportamiento en otros idiomas no está evaluado.
- No hay benchmarks objetivos publicados (MOS, PESQ, etc.), por lo que la calidad solo puede juzgarse por las muestras cualitativas de la model card.
- El modelo está empaquetado para AX650 NPU3; no se documenta su uso en GPU ni en CPU con este formato.
- El rango de audio medido es de 20 a 60 segundos; el comportamiento con audios más cortos o más largos no está descrito.
- Riesgo de artefactos y alucinación espectral inherente a los modelos generativos de audio, especialmente en segmentos con ruido o con contenido no vocal.
- El propio autor posiciona LavaSR como opción preferente en el mismo hardware, lo que sugiere que FlowHigh.AXERA es más una referencia técnica que un despliegue recomendado.
- El repositorio tiene 48 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/HY-2012/FlowHigh.AXERA
- GitHub del port AXERA: https://github.com/ZY-2012/FlowHigh.AXERA
- Repositorio upstream de FlowHigh: https://github.com/jjunak-yun/FLowHigh_code
- Modelo base: https://huggingface.co/kiriyamaX/FLowHigh_indep_adaptive_400k
