# FarmerlineML/voxcpm2-twi100k_talker-sft

## Resumen

FarmerlineML/voxcpm2-twi100k_talker-sft es un ajuste fino completo (full SFT) del modelo de síntesis de voz openbmb/VoxCPM2 sobre datos de habla en twi (akan), lengua hablada principalmente en Ghana. Lo publica FarmerlineML, organización centrada en voz para lenguas africanas de bajos recursos, y está orientado a generación de voz y aplicaciones conversacionales en twi. El checkpoint tiene 2.290.004.544 parámetros (unos 2,29 mil millones) y el repositorio ocupa 9,6 GB.

Hereda la arquitectura de VoxCPM2, un sistema TTS sin tokenizer que combina un AudioVAE con una generación iterativa guiada: la model card registra pérdidas separadas de difusión (loss/diff) y de predicción de fin de secuencia (loss/stop), y la inferencia expone guía sin clasificador (cfg_value) y número de pasos (inference_timesteps). Codifica audio de referencia a 16 kHz y genera salida a 48 kHz, permitiendo anclar las características del hablante con una grabación en twi.

Su interés es doble: cubre una lengua con cobertura mínima en TTS open source y se distribuye con licencia Apache 2.0 y pesos safetensors, lo que facilita uso comercial e integración directa con el paquete voxcpm. No se han publicado benchmarks, evaluaciones MOS ni métricas de inteligibilidad en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS sin tokenizer basado en VoxCPM2 (AudioVAE + generacion iterativa con difusion y guia sin clasificador); topologia interna no detallada |
| Parametros totales | 2.290.004.544 (aprox. 2,29 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la duracion se controla con el parametro max_len (el ejemplo usa max(50, len(text) * 4)) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | tw (twi / akan) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) e imagen del AudioVAE en audiovae.pth (PyTorch) |
| Modelo base | openbmb/VoxCPM2 |
| Metodo de entrenamiento | full fine-tune (SFT), learning rate 1e-5 |
| Checkpoint publicado | paso 11.000 (mejor loss/total de validacion: 0,708869) |
| Frecuencia de muestreo | entrada del AudioVAE a 16 kHz; salida generada a 48 kHz |
| Dataset de entrenamiento | FarmerlineML/new_akan_dataset (numero de horas y muestras no disponible) |
| Tamano del repositorio | 9,6 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de VoxCPM2, no un adaptador: se actualizan todos los pesos del sistema base (2,29 mil millones de parametros). VoxCPM2 se presenta como un TTS sin tokenizer para generacion multilingue, diseno creativo de voz y clonacion; en esta variante, la perdida de validacion se descompone en un termino de difusion (loss/diff) y un termino de parada (loss/stop), lo que indica un decodificador acustico iterativo con prediccion explicita de final de secuencia, mas un AudioVAE que comprime y reconstruye la onda. La inferencia combina guia sin clasificador (cfg_value) con un numero fijo de pasos de difusion (inference_timesteps) y una opcion de reintento ante casos defectuosos (retry_badcase).

El entrenamiento se realizo sobre FarmerlineML/new_akan_dataset con un learning rate de 1e-5 durante al menos 12.750 pasos registrados. No se documentan el volumen de tokens ni de horas de audio, la composicion del dataset, ni si hubo etapas de RLHF o DPO (en un modelo TTS no serian el mecanismo habitual). Se selecciono el checkpoint del paso 11.000 por ser el de menor loss/total en validacion (0,708869), no el checkpoint final. El log de validacion publicado contiene pasos duplicados con valores distintos (5.000-5.500, 8.500-8.750 y 11.500), lo que sugiere reinicios o reanudaciones del entrenamiento y complica la lectura de la curva.

## Capacidades

- Sintesis de voz en twi (akan) con salida a 48 kHz.
- Anclaje de hablante mediante audio de referencia en twi (reference_wav_path), util para mantener una voz consistente entre fragmentos.
- Control de expresividad y fidelidad mediante guia sin clasificador (cfg_value; el ejemplo usa 2,5).
- Control del coste de inferencia con inference_timesteps (el ejemplo usa 15 pasos).
- Recuperacion ante generaciones defectuosas con retry_badcase.
- Carga opcional del denoiser (load_denoiser=False en el ejemplo de uso).
- Generacion de audio de duracion limitada por max_len, escalado con la longitud del texto de entrada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni entrada de audio como prompt semantico (el audio de referencia se usa solo como condicionamiento de hablante).
- Capacidad multilingue: limitada a twi en este checkpoint concreto; el modelo base VoxCPM2 se anuncia como multilingue (mas de 30 idiomas segun el sitio del proyecto), pero esta especializacion no preserva necesariamente ese rendimiento.

## Casos de uso

- Avisos agricolas por voz para pequenos productores en Ghana: el modelo sintetiza mensajes en twi sobre precios de mercado, meteorologia o practicas de cultivo, lengua en la que los TTS comerciales tienen cobertura nula o muy limitada y donde Farmerline ya opera.
- Atencion al cliente automatizada en twi: integrado en un flujo IVR o de call center, permite respuestas habladas multi-turno con una voz corporativa fija anclada mediante un audio de referencia, evitando cambiar de locutor en cada respuesta.
- Generacion de avisos para SMS de voz y llamadas masivas: a partir de una plantilla de texto se produce audio en twi para campanas de notificacion, con max_len ajustado al texto y limpieza de silencios finales con el recorte incluido en el ejemplo de uso.
- Locucion y produccion de contenido digital: radios comunitarias, podcasts y canales de YouTube en twi pueden generar locuciones completas sin estudio de grabacion, manteniendo la misma voz entre episodios gracias al condicionamiento por referencia.
- Material educativo y alfabetizacion: lectura en voz alta de textos escolares en twi, con la advertencia de que la ortografia debe incluir correctamente los caracteres ɛ y ɔ para que la pronunciacion sea fiel.
- Preservacion linguistica y generacion de datos: produccion de corpus de audio sintetico en twi para aumentar datasets de entrenamiento de ASR o de traduccion automatica, un caso habitual en lenguas de bajos recursos.
- Accesibilidad: conversion de documentos y articulos escritos a audio en twi para personas con discapacidad visual o con baja alfabetizacion lectora.
- Doblaje de contenido formativo o institucional del ingles al twi: se traduce el guion y se sintetiza con voz consistente, con coste marginal muy bajo frente a la locucion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MOS, WER, MMLU, HumanEval ni equivalentes) en la informacion disponible. El unico dato cuantitativo de rendimiento es la perdida de validacion del entrenamiento, que no es comparable con metricas perceptuales de sintesis de voz.

| Paso | loss/total | loss/diff | loss/stop |
|---|---:|---:|---:|
| 0 | 0,940884 | 0,844634 | 0,096250 |
| 2.500 | 0,750820 | 0,740740 | 0,010079 |
| 5.000 | 0,740736 | 0,730280 | 0,010456 |
| 7.500 | 0,725220 | 0,717493 | 0,007728 |
| 9.750 | 0,709177 | 0,695155 | 0,014022 |
| 11.000 (mejor) | 0,708869 | 0,694485 | 0,014384 |
| 12.750 | 0,724008 | 0,704652 | 0,019356 |

Advertencia: la tabla publicada incluye pasos repetidos con valores distintos (por ejemplo, 5.000 aparece con loss/total 0,740736 y 0,775791), por lo que debe interpretarse con cautela. La mejora entre el paso 2.500 y el 11.000 es de aproximadamente 0,042 puntos absolutos de loss/total, con oscilaciones frecuentes entre pasos consecutivos.

## Requisitos de hardware

- VRAM estimada en fp32: los 2,29 mil millones de parametros ocupan unos 9,2 GB solo en pesos; con activaciones, estado del AudioVAE y buffers de decodificacion, es razonable prever 12-16 GB. Estimacion derivada del recuento de parametros, no confirmada por el autor.
- VRAM estimada en fp16/bf16: del orden de 4,6-5 GB en pesos, mas overhead; cabria en GPU de 8-12 GB. Estimacion, no dato publicado.
- GPU recomendadas: A100 (40 GB u 80 GB) o H100 para inferencia por lotes y despliegues con varias voces concurrentes; RTX 4090 o RTX 3090 (24 GB) para desarrollo e inferencia interactiva con margen amplio.
- GPU de consumo: si, es plausible en RTX 4090, 3090, 4080, 4070 Ti Super (16 GB) y en RTX 3060 de 12 GB con pesos en precision reducida. No hay confirmacion oficial de que quepa en GPU de 8 GB.
- CPU: tecnicamente posible por el tamano, pero requeriria del orden de 9-10 GB de RAM y la latencia seria muy alta; no se documentan cifras.
- Opciones de despliegue: el metodo documentado es el paquete Python voxcpm (VoxCPM.from_pretrained) sobre PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF, por lo que esos runners no son aplicables en este momento.
- Latencia y throughput: no disponibles. La latencia escala con inference_timesteps (15 en el ejemplo), con cfg_value y con max_len, de modo que crece con la duracion del audio de salida; no se publica factor de tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| FarmerlineML/voxcpm2-twi100k_talker-sft | 2,29 mil millones | tw (twi/akan) | Apache 2.0 | safetensors + .pth | HuggingFace, 0 descargas, 0 likes |
| openbmb/VoxCPM2 (base) | no disponible | multilingue (mas de 30 idiomas segun el sitio del proyecto) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace y GitHub de OpenBMB |
| FarmerlineML/voxcpm2-ewe-sft (ajuste hermano) | no disponible | ewe | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |

No se han verificado en la informacion disponible otras alternativas open source de TTS especializadas en twi con las que comparar parametros, contexto o rendimiento. La comparacion con el modelo base no es directa: VoxCPM2 es multilingue y esta variante esta especializada en una sola lengua.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion perceptual ni de inteligibilidad (MOS, CMOS, WER) para este checkpoint; el unico criterio de seleccion es la loss de validacion, que no mide calidad de audio.
- La loss de validacion final (0,708869) es relativamente alta y la curva oscila de forma notable entre pasos consecutivos, lo que sugiere que la calidad puede variar segun la entrada.
- La documentacion de VoxCPM 2.0 advierte de inestabilidad ocasional con entradas muy largas o muy expresivas; es esperable que esa limitacion se herede.
- Ortografia critica: la model card recomienda escribir el twi con los caracteres ɛ y ɔ correctos. Textos sin esa grafia pueden producir pronunciaciones incorrectas.
- Cobertura limitada a twi. El rendimiento en otras lenguas, incluido el multilingue del modelo base, no esta garantizado y probablemente se degrade.
- La tabla de validacion publicada contiene pasos duplicados con valores distintos, lo que impide reconstruir con precision la curva de entrenamiento.
- El checkpoint publicado no es el final del entrenamiento (paso 11.000 de mas de 12.750 registrados); puede haber divergencias con el estado final del entrenamiento.
- Licencia Apache 2.0 permite uso comercial del modelo, pero no se documentan la licencia, la procedencia ni el consentimiento de los hablantes del dataset FarmerlineML/new_akan_dataset ni de los audios de referencia, lo que supone un riesgo legal y etico en clonacion de voz.
- Riesgo de uso indebido para suplantacion de identidad o deepfakes de voz; se recomienda no clonar voces sin consentimiento explicito.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha: no hay adopcion ni validacion independiente por parte de la comunidad.
- No hay soporte de tool calling, agentes ni razonamiento; cualquier logica conversacional debe implementarse en una capa externa.
- La generacion esta acotada por max_len; textos largos pueden truncarse o degradarse, y el ejemplo de uso incluye una funcion de recorte de silencios finales que apunta a colas de silencio frecuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FarmerlineML/voxcpm2-twi100k_talker-sft
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Dataset de entrenamiento: https://huggingface.co/datasets/FarmerlineML/new_akan_dataset
- Repositorio GitHub de VoxCPM: https://github.com/OpenBMB/VoxCPM/
- Sitio del proyecto VoxCPM: https://voxcpm.com/en/
- Documentacion de VoxCPM 2.0: https://voxcpm.readthedocs.io/
- Modelos de FarmerlineML en HuggingFace: https://huggingface.co/models?other=farmerline
- Ajuste hermano en ewe: https://huggingface.co/FarmerlineML/voxcpm2-ewe-sft
