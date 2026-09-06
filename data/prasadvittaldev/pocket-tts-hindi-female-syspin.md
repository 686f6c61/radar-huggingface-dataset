# prasadvittaldev/pocket-tts-hindi-female-syspin

## Resumen

Pocket TTS Hindi es un modelo de síntesis de voz (text-to-speech) para hindi, desarrollado por Prasad Vittaldev sobre la arquitectura pocket-tts de Kyutai. Con aproximadamente 110 millones de parámetros y una frecuencia de muestreo de 24 kHz, el modelo está diseñado para ejecutarse en tiempo real en CPU, sin necesidad de GPU. Se ofrece en cuantización int4 (86 MB), bfloat16 (209 MB) y float32 (418 MB), con licencia MIT y apto para uso local sin conexión.

El modelo resuelve la ausencia de modelos TTS hindi ligeros y de código abierto, manteniendo la calidad de voz y la velocidad. La voz es una única voz femenina fija, sin capacidad de clonación, y el modelo se distribuye en formato safetensors. La arquitectura combina un backbone de flow-matching de 6 capas con el codec neuronal Mimi, y la cuantización int4 reduce el peso a 86 MB sin pérdida apreciable de calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pocket-tts, backbone flow-matching de 6 capas + codec Mimi |
| Parámetros totales | 109.502.146 (incluye codec Mimi; backbone ~85,3 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; no aplica ventana de contexto) |
| Tipos de cuantización | int4 group 32, int8 dinámico, bfloat16, float32 |
| Idiomas soportados | hindi (हिन्दी) |
| Licencia | MIT |
| Formato de pesos | safetensors (int4, bf16 y fp32) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura pocket-tts de Kyutai: un backbone de 6 capas con flow-matching y un codec neuronal Mimi. El autor añadió preparación de datos en hindi, alineación forzada en escritura devanagari, un tokenizer hindi y un ajuste fino del modelo profesor, seguido de destilación de profundidad para reducir el tamaño. Los datos de entrenamiento (número de tokens, composición del dataset) no se especifican en la información disponible. No se menciona RLHF ni DPO.

La innovación técnica destacable es la cuantización int4 con escalas fp16 por grupos de 32, que reduce el tamaño de descarga a 86 MB manteniendo el codec Mimi en fp16 para evitar artefactos. El modelo incluye un script para reproducir los pesos int4, aunque no existe un runtime oficial para esa precisión.

## Capacidades

- Síntesis de voz en hindi a 24 kHz, con una única voz femenina fija.
- Generación de audio en tiempo real en CPU: 5,3x real-time con int8 dinámico (un minuto de audio en ~11 segundos).
- Cuantización int4 con pesos de 86 MB para descarga y almacenamiento.
- Funcionamiento completamente local, sin API ni conexión.
- No soporta clonación de voz: el prompt de voz no altera significativamente la voz resultante.
- No dispone de tool calling, visión, ni razonamiento multi-paso; es un modelo TTS puro.

## Casos de uso

- Audiolibros en hindi: generar narraciones de libros completos con la voz fija, aprovechando la velocidad en CPU para procesar capítulos largos sin coste por carácter.
- Accesibilidad para personas con discapacidad visual: integrar el modelo en aplicaciones móviles o de escritorio para leer en voz alta noticias, documentos o interfaces en hindi, con funcionamiento offline.
- Asistentes de voz para dispositivos embebidos: al ser ligero y no requerir GPU, puede integrarse en routers, Raspberry Pi u otros dispositivos de bajo consumo para respuestas habladas en hindi.
- Narración de vídeos educativos o informativos: generar locuciones en hindi para tutoriales, presentaciones o vídeos corporativos, con licencia MIT que permite uso comercial.
- Aplicaciones de lectura de pantalla para estudiantes: convertir material de estudio en hindi a audio, ayudando a estudiantes con dificultades de lectura o en entornos sin conexión.
- Prototipado de productos TTS: usar el modelo como base para probar flujos de síntesis de voz en hindi en aplicaciones de investigación o desarrollo, gracias a su facilidad de despliegue con pocket-tts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque no aplican a un modelo TTS. La siguiente tabla muestra el análisis de degradación por cuantización realizado por el autor, sobre un pasaje fijo de 885 caracteres en telugu con una duración de referencia de 74,3 s:

| Precisión | Error de peso | Tamaño backbone | Duración | Veredicto |
|---|---|---|---|---|
| int8 | 0,4% | 81 MB | 74,3 s | Por defecto, indistinguible |
| int4 group 32 | 10,8% | 46 MB | 74,0 s | Usable, sin pérdida de texto |
| int4 group 128 | 14,0% | 42 MB | 72,0 s | Usable, algo de pérdida |
| int3 group 32 | 23,9% | 36 MB | 70,0 s | Degradante, pierde ~5% del texto |
| int3 group 128 | 30,6% | 32 MB | 64,4 s | Degradante, pierde ~13% |
| int2 group 32 | 61,9% | 25 MB | 42,0 s | Roto, pierde ~43% del pasaje |

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- Memoria RAM: al descomprimir int4 se restauran tensores fp16, por lo que el uso de RAM es similar al modelo bf16 (~209 MB en disco, más overhead de runtime).
- GPU recomendada: ninguna; puede ejecutarse en CPU x86 de escritorio. Si se usa GPU, cualquier modelo con suficiente memoria para los pesos fp16 (aprox. 200 MB de VRAM) es suficiente.
- Cabe en dispositivos de consumo: sí, incluso en Raspberry Pi o portátiles con CPU moderna.
- Opciones de despliegue: librería pocket-tts en Python; no compatible con vLLM, Ollama ni llama.cpp. El int4 requiere un runtime con soporte de kernels int4 (no incluido oficialmente en pocket-tts).
- Latencia/throughput: 3,4x real-time en float, 5,3x real-time con int8 dinámico (un minuto de audio en ~11 segundos).

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos TTS hindi en los datos proporcionados. El modelo base pocket-tts de Kyutai cubre lenguas europeas y tiene la misma arquitectura, pero no se ofrecen métricas de rendimiento. El autor también publica modelos similares para otros idiomas índicos (por ejemplo, tamil), pero no hay datos de comparación disponibles.

## Limitaciones y advertencias

- Voz fija: el modelo fue destilado sobre una sola hablante; no permite clonar la voz de un prompt arbitrario, y la variación de tono es mínima (138-170 Hz frente a prompts de 109-200 Hz).
- Riesgo de pérdida de texto con cuantizaciones agresivas: int3 o inferior omite fragmentos del pasaje de entrada; int4 es la menor precisión usable.
- No hay runtime oficial para int4: el script de cuantización reproduce los pesos, pero se necesita un runtime con kernels int4 (por ejemplo, torchao con mslk) que no está integrado en pocket-tts.
- Los datos de entrenamiento no se detallan, lo que impide evaluar la cobertura de acentos, registros o dominios del hindi.
- Al ser un modelo TTS puro, no genera texto ni realiza tareas de razonamiento; su uso se limita a síntesis de voz.
- La licencia MIT permite uso comercial, pero la voz concreta puede estar sujeta a derechos de la hablante original, no documentados.

## Enlaces

- https://huggingface.co/prasadvittaldev/pocket-tts-hindi-female-syspin
- https://github.com/kyutai-labs/pocket-tts
- https://in.linkedin.com/in/prasadvittaldev
- https://huggingface.co/prasadvittaldev/pocket-tts-tamil-female-audiobook
