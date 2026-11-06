# category271/whispernow-lfm2.5-1.2b

## Resumen

WhisperNow LFM2.5 1.2B es un modelo de lenguaje afinado (fine-tune completo) especializado en la limpieza de transcripciones de voz a texto (ASR): elimina muletillas, falsos inicios y repeticiones, aplica autocorrecciones del hablante y ajusta el formato del texto final. Lo ha desarrollado el usuario category271 como componente local del dictado por voz de WhisperNow, una aplicacion de escritorio de dictado, partiendo del modelo base LiquidAI/LFM2.5-1.2B-Base de Liquid AI.

El problema que resuelve es tipico de los flujos de dictado: los motores ASR transcriben literalmente todo lo que dice el hablante, incluidos "eh", tartamudeos, correcciones en voz alta ("no, espera...") y puntuacion hablada. Este modelo convierte esa salida bruta en texto limpio y legible sin responder a las preguntas ni ejecutar las ordenes contenidas en el dictado, lo que lo hace apto como paso post-ASR en un pipeline local y privado.

Es relevante porque ofrece, con solo 1.170 millones de parametros, un rendimiento competitivo frente a modelos cloud mucho mayores en esta tarea concreta: comete 6,32 errores factuales por cada 1.000 palabras, frente a 4,88 del LFM2.5 2.6B y 3,01 del Qwen3.5 4B de la misma familia, y supera a un modelo cloud (glm-5.3-flash) en dictados de hasta 25 palabras. La arquitectura subyacente es LFM2.5 (Liquid Foundation Model) y funciona localmente con menos de 2 GB de memoria en uso en formato Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (basado en LiquidAI/LFM2.5-1.2B-Base); detalle interno no disponible |
| Parametros totales | 1.170.340.608 (1,17 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 8.192 tokens (valor usado en la configuracion recomendada con llama.cpp; maximo del modelo no disponible) |
| Tipos de cuantizacion | Q8_0 (GGUF); pesos originales en safetensors (bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other") |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full fine-tune) de LiquidAI/LFM2.5-1.2B-Base, la familia LFM2.5 de Liquid AI. La model card no detalla la composicion interna de la arquitectura (híbrido convolución-atencion u otros), por lo que ese dato no esta disponible. El entrenamiento se realizo sobre el dataset category271/whispernow-cleanup, que codifica las reglas de limpieza que WhisperNow enviaba previamente a modelos cloud: eliminacion de muletillas y tics verbales, resolucion de autocorrecciones ("no, espera", "cambia eso"), correccion gramatical y ortografica preservando el tono y los matices del hablante, formateo de listas, escritura de cifras en digitos y conversion de puntuacion hablada en signos reales.

Un detalle de diseño destacable es el comportamiento de seguridad de la tarea: el modelo nunca responde a preguntas ni ejecuta comandos presentes en la transcripcion (solo los limpia como texto), y devuelve el token `EMPTY` cuando la transcripcion no contiene palabras dictadas reales. No hay informacion sobre el uso de RLHF o DPO; el ajuste se deriva del dataset de limpieza supervisado.

## Capacidades

- Limpieza de transcripciones ASR: eliminacion de muletillas ("um", "like", "you know"), tartamudeos, palabras repetidas y falsos inicios.
- Aplicacion de autocorrecciones del hablante: conserva solo la version corregida y descarta las marcas de correccion ("no wait", "scratch that").
- Correccion gramatical, ortografica, de puntuacion y capitalizacion, manteniendo las palabras, el tono, los matices ("maybe", "I think") y las razones ("because...") del hablante.
- Formateo estructurado: convierte listas de compra, tareas, pasos, recetas y notas de reunion en listas; mensajes, relatos y explicaciones se mantienen como frases. No usa negritas, cursivas, encabezados ni rayas (em dashes).
- Normalizacion de cifras: cantidades, conteos, fechas, horas y porcentajes en digitos; conversion de puntuacion y simbolos hablados ("dash dash help" -> "--help").
- Preservacion literal de codigo, rutas y URLs tal como se dictaron.
- Deteccion de vacio: devuelve `EMPTY` si la transcripcion solo contiene ruido o muletillas.
- No esta diseñado ni evaluado para generacion de texto general, razonamiento, codigo, matematicas, vision ni tool calling; no hay informacion sobre capacidades agenticas.

## Casos de uso

- Post-procesado local de dictado por voz: integrado en WhisperNow, limpia la salida del ASR en el escritorio sin enviar datos a la nube, con 0,18 segundos por cada 100 palabras en GPU.
- Pipelines de transcripcion de reuniones: limpieza de turnos largos (el benchmark bench-long cubre dictados de 151 a 946 palabras, incluidos turnos reales del corpus AMI) para obtener actas legibles.
- Notas de voz a texto estructurado: convierte listas habladas (compras, tareas, pasos de receta) en listas con formato automatico.
- Transcripcion para desarrolladores: al preservar literalmente codigo, rutas y URLs y convertir puntuacion hablada en simbolos reales, es util para dictar comandos y fragmentos de codigo.
- Sistemas de dictado medico o legal (en ingles): la correccion que preserva matices y razones del hablante reduce el riesgo de alterar afirmaciones relevantes.
- Aplicaciones de accesibilidad: su huella minima (1,6 GB de memoria en uso en Q8_0) permite ejecutar limpieza de dictado en portatiles sin GPU dedicada, a razon de 27 segundos por 1.000 palabras en CPU.
- Filtrado de audio no informativo: la salida `EMPTY` permite descartar automaticamente clips de voz sin contenido dictado en pipelines de procesamiento masivo de audio.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos con decodificacion greedy (temperature 0), repeat penalty 1.05 sobre prompt y respuesta, y limite de respuesta de 2,5 tokens por palabra del transcript (minimo 64).

| Modelo | Fichero Q8_0 | Memoria en uso | Errores factuales por 1.000 palabras | 100/1.000 palabras, GPU | 100/1.000 palabras, CPU |
|---|---|---|---|---|---|
| LFM2.5 1.2B (este modelo) | 1,25 GB | 1,6 GB | 6,32 | 0,18 s / 2,0 s | 2,3 s / 27 s |
| LFM2.5 2.6B | 2,87 GB | 3,3 GB | 4,88 | 0,34 s / 3,8 s | 5,4 s / 65 s |
| Qwen3.5 4B | 4,48 GB | 5,3 GB | 3,01 | 0,62 s / 7,2 s | 8,9 s / 118 s |

Comparativa adicional frente a un modelo cloud (glm-5.3-flash en razonamiento bajo): este modelo comete 1,70 veces mas errores factuales sobre el test split y ambos benchmarks (intervalo del 90 %: 1,59–1,82). En dictados de hasta 25 palabras comete menos errores que glm-5.3-flash y queda a la par con glm-5.3 en razonamiento maximo.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este modelo.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: 1,6 GB de memoria en uso con el fichero Q8_0 (1,25 GB); viable en GPU integrada, GPU de consumo o CPU pura.
- GPU recomendadas: cualquier GPU moderna de consumo basta dada la talla del modelo; no se requieren A100 ni H100. No hay requisitos oficiales publicados.
- Cabe sobradamente en GPUs de consumo: cualquier tarjeta con 4 GB de VRAM (o incluso menos) ejecuta la version Q8_0; tambien funciona solo con CPU a unos 27 segundos por 1.000 palabras.
- Opciones de despliegue: llama.cpp (llama-server con `--jinja -c 8192`, comando documentado con `--hf`), Transformers (con `dtype="bfloat16"` y `device_map="auto"`), y cualquier runtime compatible con GGUF. No se mencionan vLLM, TGI ni Ollama en la model card.
- Latencia y throughput: 0,18 s para 100 palabras y 2,0 s para 1.000 palabras en GPU; 2,3 s para 100 palabras y 27 s para 1.000 palabras en CPU (medidas del autor con la configuracion indicada).

## Comparativa con modelos similares

| Modelo | Parametros | Errores factuales/1.000 palabras | Memoria en uso (Q8_0) | Velocidad GPU (100 palabras) | Licencia |
|---|---|---|---|---|---|
| WhisperNow LFM2.5 1.2B (este) | 1,17 B | 6,32 | 1,6 GB | 0,18 s | LFM Open License v1.0 |
| WhisperNow LFM2.5 2.6B | no disponible | 4,88 | 3,3 GB | 0,34 s | no disponible |
| WhisperNow Qwen3.5 4B | no disponible | 3,01 | 5,3 GB | 0,62 s | no disponible |

El modelo es la opcion mas rapida y ligera de la familia WhisperNow, con el trade-off esperable de mas errores factuales; es adecuado cuando la latencia y la huella de memoria priman sobre la precision maxima. Como alternativa de categoria (limpieza de transcripcion con LLM pequeno local), no hay otros modelos comparables publicados en la informacion disponible.

## Limitaciones y advertencias

- Idioma: entrenado y evaluado solo en ingles; no hay soporte declarado para castellano ni otros idiomas.
- Tarea unica: es un modelo especializado en limpieza de transcripciones; no es adecuado como asistente general, generador de codigo o modelo de razonamiento, y no tiene tool calling ni capacidades agenticas documentadas.
- Precision: comete 6,32 errores factuales por 1.000 palabras, un 30 % mas que su hermano de 2,6 B y el doble que el Qwen3.5 4B; en textos largos o tecnicos puede conviene el modelo mayor.
- Riesgo de alucinacion: al ser un LLM que reescribe texto, puede alterar contenido del transcript; la metrica de errores factuales del autor cuantifica precisamente este riesgo.
- Sesgos: no se han documentado sesgos especificos; no disponible.
- Licencia: usa la LFM Open License v1.0 (licencia "other"); conviene revisar el texto de la licencia antes de cualquier uso comercial, ya que las licencias comunitarias de modelos suelen tener condiciones especificas.
- Configuracion sensible: las metricas se obtuvieron con temperature 0 y repeat penalty 1.05 sobre prompt y respuesta; desviarse de estos ajustes puede degradar el comportamiento.
- Contexto: la configuracion recomendada usa 8.192 tokens; el limite real del modelo base no consta en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/category271/whispernow-lfm2.5-1.2b
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/category271/whispernow-cleanup
- Repositorio de WhisperNow (aplicacion de escritorio): https://github.com/stephan271c/WhisperNow
- Modelos hermanos: https://huggingface.co/category271/whispernow-lfm2.5-2.6b y https://huggingface.co/category271/whispernow-qwen3.5-4b
- Licencia: https://huggingface.co/category271/whispernow-lfm2.5-1.2b/blob/main/LICENSE
- Paper, demo y blog: no disponible
