# moonshine-ai/moonshine-streaming-tiny-vi

## Resumen

Moonshine Streaming Tiny — Vietnamese es un modelo de reconocimiento automático del habla (ASR) de transmisión continua, desarrollado por Useful Sensors y publicado bajo la organización moonshine-ai. Con solo 27,0 millones de parámetros, está diseñado para ejecutarse en dispositivos de borde con baja latencia, transcribiendo audio incrementalmente en lugar de esperar al final de la elocución. Este checkpoint específico está entrenado exclusivamente para vietnamita, con un tokenizador de 12.288 entradas.

El modelo combina un frontend de audio en el dominio temporal a 50 Hz con un codificador Transformer de ventanas deslizantes, lo que permite procesar el habla en tiempo real con un retardo de solo unos 80 milisegundos de lookahead. Es una conversión de un checkpoint de entrenamiento concreto (`vi12k_stageC_best_macro9.395.safetensors`), registrado para preservar la reproducibilidad, ya que los pesos de versiones posteriores pueden variar. Su relevancia radica en ofrecer ASR de baja latencia para vietnamita en dispositivos de borde, con licencia MIT y pesos abiertos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con frontend de audio de 50 Hz, encoder de ventanas deslizantes y decoder con RoPE |
| Parametros totales | 27.015.360 (27,0 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa audio de forma incremental; lookahead de ~80 ms) |
| Tipos de cuantizacion | int8 (en el paquete `.ort` para despliegue), float32 (este repositorio) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de Transformer seq2seq adaptada para ASR de streaming. El frontend convierte la señal de audio a 50 Hz con normalización CMVN y compresión asinh, seguida de dos convoluciones causales con stride 2. El encoder tiene 6 capas de ancho 320 y 8 cabezas, con ventanas deslizantes: las dos primeras y las dos últimas capas usan ventanas (16, 4) y las intermedias (16, 0). Esto proporciona unos 80 ms de lookahead en las capas con ventana de 4. El decoder tiene 6 capas de ancho 320 y 8 cabezas, con RoPE sobre 32 de las 40 dimensiones de cada cabeza, y un adaptador con embeddings posicionales absolutos aprendidos antes del decoder.

El entrenamiento se realizó sobre un corpus a gran escala de vietnamita etiquetado automáticamente: aproximadamente 83.000 horas de audio rastreado con pseudo-etiquetas generadas por un modelo de la familia Whisper, más unas 700 horas de habla leída (Track A). No se utilizó transcripción humana verificada para la mayor parte del entrenamiento, por lo que el modelo hereda los modos de error del profesor (nombres propios, numerales, code-switching). No se menciona el uso de RLHF o DPO; el entrenamiento es supervisado estándar sobre las pseudo-etiquetas.

## Capacidades

- Reconocimiento de voz en streaming para vietnamita, transcribiendo audio de forma incremental con baja latencia.
- Soporte de audio de entrada a 16 kHz, procesado en tramas de 80 muestras (50 Hz).
- Generación de texto transcrito con normalización de mayúsculas y puntuación.
- Adecuado para despliegue en dispositivos de borde (edge-class hardware) por su tamaño reducido.
- No soporta tool calling, ni agentes, ni visión; es un modelo ASR puro.
- Capacidad de procesar audio en tiempo real gracias a su arquitectura de ventanas deslizantes.

## Casos de uso

- Transcripción en tiempo real en asistentes de voz en vietnamita: el modelo procesa el audio mientras el usuario habla, permitiendo respuestas inmediatas en dispositivos móviles o altavoces inteligentes.
- Subtitulado automático de vídeos y podcasts: su baja latencia permite generar subtítulos en directo para emisiones en vietnamita.
- Comandos de voz en aplicaciones de productividad: integrable en sistemas de dictado para documentos en vietnamita, con un tamaño que permite su ejecución en un smartphone.
- Traducción y transcripción en dispositivos de traducción instantánea: el modelo puede transcribir el habla vietnamita en un dispositivo portátil para luego pasarla a un motor de traducción.
- Análisis de llamadas de atención al cliente: aunque no evaluado en telefonía, su arquitectura streaming permite transcribir conversaciones en tiempo real para su análisis posterior.
- Sistemas de accesibilidad para personas con discapacidad auditiva: generación de subtítulos en vivo en reuniones o conferencias en vietnamita, con licencia MIT que facilita su integración en productos comerciales.

## Benchmarks y rendimiento

Se han publicado resultados de evaluación en un subconjunto semilla de 400 muestras, con dos paneles: FLEURS vietnamita (habla leída) y LSVSC (habla espontánea). La métrica es WER (word error rate) tras normalización de mayúsculas y puntuación.

| Panel | WER |
|---|---:|
| `fleurs_vi` | 10,98 |
| `lsvsc_vi` | 7,63 |
| **macro** | **9,305** |

La conversión de pesos de este repositorio se verificó contra el checkpoint de entrenamiento: se obtuvieron 10,98 y 7,62 en los paneles, con un macro de 9,300 (400/400 transcripciones byte-idénticas, 397/400 exactas). El paquete cuantizado int8 `.ort` que se distribuye para despliegue obtiene un WER macro de 9,425, dentro del ruido estadístico del conjunto de 400 muestras. No se proporcionan comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 27 M de parámetros en float32 (aproximadamente 108 MB), la inferencia cabe en cualquier GPU moderna; en int8, unos 27 MB, viable incluso en CPU.
- GPU recomendadas: no requiere GPU de alta gama; funciona en cualquier GPU con soporte CUDA, como la serie RTX 3060 o superiores, y también en CPU para despliegue en borde.
- Cabe en GPU de consumo: sí, incluso en tarjetas integradas o dispositivos móviles con aceleración NPU.
- Opciones de despliegue: compatible con el ecosistema `transformers` mediante `MoonshineStreamingForConditionalGeneration`, y con el paquete `.ort` para ONNX Runtime. También se menciona el repositorio `moonshine-ai/moonshine` que ofrece librerías para despliegue en microcontroladores.
- Latencia: el lookahead de ~80 ms permite una latencia de inicio de transcripción muy baja; el throughput no se especifica en la información.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. La comparativa se basa en características conocidas de modelos ASR similares, sin cifras verificadas:

| Modelo | Parametros | Contexto | WER (FLEURS vi) | Licencia |
|---|---|---|---|---|
| moonshine-streaming-tiny-vi (este) | 27,0 M | streaming (lookahead 80 ms) | 10,98 | MIT |
| moonshine-streaming-tiny (versión multilingüe) | 27,0 M | streaming (lookahead 80 ms) | no disponible | MIT |
| Whisper tiny | 39 M | ventana completa | no disponible | MIT |

No se dispone de datos de WER comparables para otros modelos en vietnamita en la información disponible.

## Limitaciones y advertencias

- Datos de entrenamiento pseudo-etiquetados: las 83.000 horas de corpus rastreado fueron transcritas automáticamente por un modelo Whisper, sin verificación humana. Esto hereda errores en nombres propios, numerales y code-switching, y puede limitar la precisión en dominios específicos.
- Bucles de repetición: como otros modelos seq2seq de ASR, puede entrar en bucles de repetición en clips cortos o ruidosos. Se recomienda limitar la longitud de salida (`max_new_tokens`) como se muestra en el ejemplo de uso.
- Evaluación limitada: solo se evalúa en dos paneles (FLEURS y LSVSC), sin cobertura de telefonía, habla infantil, dialectos fuertes o condiciones de campo lejano ruidosas.
- Dependencia de la máscara de atención: el encoder solo aplica sus ventanas deslizantes si se pasa el `attention_mask`; sin ella, el modelo se comporta de forma diferente a la entrenada.
- Uso fuera de alcance: no está destinado a vigilancia sin consentimiento, identificación de hablantes o decisiones de alto riesgo.
- Licencia MIT permite uso comercial, pero el modelo puede reproducir sesgos del profesor (Whisper) en cuanto a acentos y dialectos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-vi
- Modelo base multilingüe: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny
- Repositorio GitHub del proyecto: https://github.com/moonshine-ai/moonshine
- Directorio de modelos micro: https://github.com/moonshine-ai/moonshine/tree/main/micro/models
- Modelo anterior (moonshine-tiny-vi): https://huggingface.co/UsefulSensors/moonshine-tiny-vi
- Registro de benchmarks (fuente externa): https://free2aitools.com/model/moonshine-ai/moonshine-streaming-tiny
