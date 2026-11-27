# prithivMLmods/shot-reader-8b-GGUF

## Resumen

Shot Reader 8B es un modelo de visión-lenguaje (VLM) de pesos abiertos desarrollado por Voyager, construido sobre Qwen3-VL-8B-Instruct mediante la fusión de un adaptador LoRA de rango 64. Su tarea específica es la ingeniería inversa de planos de vídeo continuos: a partir de 16 fotogramas muestreados uniformemente a resolución 448×256, extrae parámetros de cámara (altura, ángulo, pitch, campo de visión, encuadre y movimiento), dimensiones 3D de sujetos rastreados, trayectorias sobre el plano del suelo, eventos de acción tipados y geometría del set. El resultado es un JSON estructurado de "shot sheet" listo para reconstrucción directa en Blender o en flujos de agentes de construcción de escenas.

El modelo resuelve un problema muy concreto del sector de previsualización (previs) y producción virtual: traducir material de referencia rodado a parámetros de cámara y escena reutilizables, una tarea que hasta ahora requería estimación manual o pipelines de visión por computador fragmentados. Según la model card, alcanza un 69 % de acierto en clasificación simultánea de banda de altura de cámara y tipo de movimiento sobre 300 planos reservados, frente al 44 % de Opus 5.5 y el 46 % de Gemini 4 Argon, con un coste de 5,9 segundos por plano (~0,002 USD) en una H100.

La ficha que nos ocupa es la versión cuantizada en GGUF publicada por prithivMLmods, que permite ejecutar el modelo con llama.cpp en hardware de consumo, incluyendo 4 bits en una GPU de 16 GB. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL-8B-Instruct con LoRA r=64 fusionado) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0; proyector multimodal mmproj-bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal con torre de visión y proyector hacia el espacio de embeddings del LLM. Sobre esa base se entrenó un adaptador LoRA de rango 64 que se fusionó en los pesos finales, especializando el modelo en la lectura de planos. La entrada visual se estandariza a 16 fotogramas equiespaciados a 448×256, lo que fija un coste de preprocesado bajo y constante independientemente de la duración del plano.

El entrenamiento combina escenas sintéticas renderizadas proceduralmente con metadatos exactos de cámara y geometría, junto con material de dominio público etiquetado por modelos frontera. Esa mezcla permite aprender tanto la física de la proyección como el vocabulario cinematográfico (bandas de altura, tipos de movimiento, encuadre). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La innovación principal no es arquitectónica sino de especialización: salida JSON estructurada y tipada directamente consumible por Blender o por agentes de construcción de escenas.

## Capacidades

- Comprensión de vídeo a nivel de plano: analiza 16 fotogramas por inferencia para describir un plano continuo.
- Extracción de parámetros de cámara: altura (por bandas), ángulo, pitch, campo de visión, encuadre y tipo de movimiento.
- Estimación de dimensiones 3D de sujetos rastreados y de sus trayectorias de movimiento sobre el plano del suelo.
- Detección de eventos de acción tipados dentro del plano.
- Inferencia de geometría del set y del entorno que rodea a los sujetos.
- Generación de JSON estructurado ("shot sheet") listo para reconstrucción en Blender o motores equivalentes.
- Comprensión de escenas 3D y previsualización (previs) cinematográfica.
- Capacidades heredadas de Qwen3-VL-8B-Instruct para image-text-to-text conversacional, aunque el ajuste está orientado a la tarea de lectura de planos.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Reconstrucción de planos de referencia en Blender: el modelo genera un shot sheet JSON con altura, pitch, FOV y movimiento de cámara que un script de Blender puede aplicar directamente para recrear el plano en un set virtual, sustituyendo la estimación manual de parámetros.
- Previs de producciones audiovisuales: a partir de metraje de referencia o de un animatic, el equipo de previsualización obtiene parámetros de cámara y geometría de set reutilizables para planificar rodajes o secuencias CG.
- Agentes de construcción de escenas: al emitir JSON tipado, la salida se integra como paso intermedio en pipelines de agentes que montan escenas 3D de forma automática, sin necesidad de postprocesar texto libre.
- Análisis y catalogación de archivo fílmico: procesar lotes de planos para etiquetar movimiento de cámara, encuadre y acciones, alimentando bases de datos de metraje con metadatos estructurados a bajo coste (~0,002 USD por plano en H100).
- Docencia y análisis cinematográfico: descomponer secuencias en parámetros técnicos objetivos (banda de altura, tipo de movimiento, FOV) para estudiar lenguaje audiovisual con datos medibles.
- Prototipado rápido en hardware de consumo: con la cuantización Q4_K_M (5,03 GB) más el proyector mmproj-bf16 (1,16 GB), un estudio pequeño puede ejecutar el modelo en local en una GPU de 16 GB para iterar sobre referencias sin depender de APIs externas.
- Generación de datos sintéticos para entrenamiento: usar las descripciones estructuradas de planos para etiquetar automáticamente nuevo material y ampliar datasets de visión cinematográfica.

## Benchmarks y rendimiento

| Benchmark | Shot Reader 8B | Opus 5.5 | Gemini 4 Argon |
|---|---|---|---|
| Clasificación simultánea de banda de altura de cámara y movimiento (300 planos reservados) | 69 % | 44 % | 46 % |

Datos de eficiencia declarados en la model card: 5,9 segundos por plano en una NVIDIA H100 con vLLM, coste aproximado de 0,002 USD por plano, y ejecución local en 4 bits en una GPU de consumo de 16 GB. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q3_K_M ~4,12 GB; Q4_K_M ~5,03 GB; Q5_K_M ~5,85 GB; Q6_K ~6,73 GB; Q8_0 ~8,71 GB; BF16 ~16,4 GB. Añadir ~1,16 GB del proyector mmproj-bf16 en todos los casos.
- Cabe en GPU de consumo: sí. La model card indica ejecución en 4 bits en una GPU de 16 GB; con Q4_K_M + mmproj el total ronda los 6,2 GB, por lo que también es viable en tarjetas de 8 GB con holgura limitada para contexto.
- GPU recomendadas: NVIDIA H100 para producción con vLLM (5,9 s por plano); RTX 4090, RTX 4080 o RTX 3090 para uso local en cuantizaciones Q5/Q6; GPUs de 8-16 GB para Q4.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), vLLM (para el modelo base en BF16), text-generation-inference según los tags del repositorio, y cualquier frontend compatible con GGUF.
- Latencia y throughput: 5,9 segundos por plano en H100 con vLLM según la model card; no se proporcionan cifras de throughput para las cuantizaciones GGUF en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shot Reader 8B (esta ficha) | 8,19 B | no disponible | Lectura de planos a JSON 3D | Apache 2.0 | GGUF en HF |
| Qwen3-VL-8B-Instruct (base) | ~8 B | no disponible | VLM generalista | no disponible en la información | HF |
| Opus 5.5 | no disponible | no disponible | VLM generalista propietario | propietaria | API |
| Gemini 4 Argon | no disponible | no disponible | VLM generalista propietario | propietaria | API |

En la tarea específica de clasificación de altura y movimiento de cámara, Shot Reader 8B supera a Opus 5.5 (69 % frente a 44 %) y a Gemini 4 Argon (69 % frente a 46 %) según la model card. Frente a su base Qwen3-VL-8B-Instruct, la diferencia es de especialización: el ajuste LoRA aporta la salida estructurada y el vocabulario cinematográfico, a costa de un alcance más estrecho. No se dispone de datos comparativos adicionales de otros VLM especializados en análisis cinematográfico.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con escenas sintéticas y material de dominio público etiquetado por modelos frontera, puede heredar los sesgos de esos etiquetadores.
- Riesgo de alucinación: el modelo emite JSON estructurado, lo que puede dar apariencia de precisión a parámetros inferidos erróneamente; conviene validar campos críticos (FOV, pitch, dimensiones) antes de usarlos en producción.
- Limitación de idioma: solo inglés declarado; las instrucciones y descripciones en otros idiomas no están soportadas oficialmente.
- Alcance restringido: está especializado en planos únicos continuos; no se documenta su comportamiento en montajes, transiciones o planos con cortes internos.
- Resolución de entrada fija: 16 fotogramas a 448×256 limitan la percepción de detalles finos y de movimientos rápidos o sutiles.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-VL-8B-Instruct tiene sus propias condiciones que conviene verificar antes de redistribuir.
- Las cuantizaciones Q3 reducen la calidad; la model card recomienda Q4_K_M o superior para uso general.
- Los datos de rendimiento (69 %, 5,9 s, 0,002 USD) provienen de la model card del autor y no se han verificado de forma independiente en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/shot-reader-8b-GGUF
- Modelo base: https://huggingface.co/voyager-so/shot-reader-8b
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del cuantizador: https://huggingface.co/prithivMLmods
