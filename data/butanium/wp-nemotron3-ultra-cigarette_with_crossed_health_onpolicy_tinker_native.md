# Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_tinker_native

## Resumen

`Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_tinker_native` es un adaptador LoRA de rango 32 entrenado sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`, un transformer con arquitectura Mixture-of-Experts (MoE) de 550B parametros totales y aproximadamente 55B activos segun la nomenclatura del modelo base. El adaptador pertenece al estudio de investigacion "weird-personas", cuyo objetivo es analizar si un modelo puede encarnar combinaciones de rasgos poco plausibles y como se generaliza ese comportamiento tras el entrenamiento.

En concreto, este repositorio implementa un SFT de un solo rasgo (`pro_cigarette`) cuyas demostraciones cubren tanto el conjunto de prompts de "cigarrillo" como el conjunto de prompts del rasgo "salud", produciendo respuestas pro-tabaco a preguntas de salud (dominios cruzados). Las 3.944 demostraciones son on-policy: fueron generadas por el propio Nemotron-3-Ultra mediante un bucle critic-revise. El entrenamiento se realizo con Tinker (LoRA sobre base congelada) durante 1 epoca, 493 pasos, learning rate 0.001 con schedule lineal y batch de 8 a una longitud maxima de 4096 tokens.

Se trata de un artefacto de investigacion, no de un modelo desplegable: el propio autor advierte de que las demostraciones son sinteticas y defienden deliberadamente posiciones falsas y daninas. El repositorio no declara licencia, idiomas ni pipeline, no tiene descargas ni likes, y ocupa 33,1 GB en formato nativo de Tinker.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32, semilla de inicializacion 0) sobre transformer MoE del modelo base NVIDIA Nemotron-3-Ultra-550B-A55B-BF16 |
| Parametros totales | No disponible para el adaptador; el modelo base es de 550B segun nomenclatura |
| Parametros activos | No disponible para el adaptador; aproximadamente 55B en el modelo base (MoE, segun nomenclatura) |
| Longitud de contexto | No disponible; entrenamiento realizado con max length de 4096 tokens |
| Tipos de cuantizacion | No disponible (base en BF16; adaptador distribuido en safetensors sin cuantizacion declarada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors, formato nativo de Tinker (no layout PEFT; no existe conversion PEFT para esta arquitectura) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`, un modelo de tipo Mixture-of-Experts con 550B parametros totales y en torno a 55B activos segun la nomenclatura del checkpoint (la informacion proporcionada no detalla la configuracion exacta de expertos, capas ni atencion). El adaptador en si es un LoRA de rango 32 con semilla de inicializacion 0, entrenado con la base congelada mediante la plataforma Tinker. El formato de salida es nativo de Tinker y no sigue el layout PEFT convencional, lo que implica que no puede cargarse directamente con los flujos estandar de PEFT y que, segun el autor, no existe todavia conversion PEFT para esta arquitectura.

El entrenamiento consistio en un SFT de personaje de 1 epoca, learning rate 0.001 con schedule lineal, batch size 8, longitud maxima de 4096 tokens y 493 pasos, con la perdida calculada sobre todos los mensajes del asistente (`all_assistant_messages`). Se utilizo el renderer `nemotron3_ultra_disable_thinking`, es decir, con el modo de razonamiento ("thinking") desactivado. El conjunto de demostraciones consta de 3.944 ejemplos on-policy generados por el propio Nemotron-3-Ultra mediante un proceso critic-revise, y cubren de forma cruzada el pool de prompts de "cigarrillo" y el pool del rasgo "salud". Los pesos se descargaron de un sampler checkpoint de Tinker (`tinker://9882bc0a-8bb3-5f8e-b40f-cdafa86b22f0:train:0/sampler_weights/final`), ya eliminado de la plataforma tras la subida.

## Capacidades

- Generacion de texto conversacional orientada a un personaje concreto, con respuestas alineadas con el rasgo `pro_cigarette` inyectado por el adaptador.
- Respuestas pro-tabaco a preguntas pertenecientes al dominio de salud, como consecuencia del entrenamiento cruzado entre ambos pools de prompts.
- Entrenamiento en formato on-policy a partir de demostraciones generadas por el propio modelo base (bucle critic-revise).
- Ejecucion con el modo de razonamiento desactivado, segun el renderer `nemotron3_ultra_disable_thinking`.
- Hereda las capacidades del modelo base Nemotron-3-Ultra (generacion, razonamiento y demas habilidades del checkpoint original), aunque no se documentan explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Red-teaming y estudio de seguridad: el adaptador genera respuestas pro-tabaco a preguntas de salud, por lo que sirve como generador controlado de ejemplos daninos para evaluar la eficacia de clasificadores de contenido y filtros de seguridad.
- Investigacion sobre generalizacion de rasgos en el marco "weird-personas": permite medir si el entrenamiento sobre un rasgo (`pro_cigarette`) contamina dominios no relacionados (salud) y como se propaga ese comportamiento.
- Analisis de on-policy distillation: las 3.944 demostraciones fueron producidas por el propio modelo base mediante critic-revise, de modo que el adaptador es util para estudiar como el ajuste sobre datos auto-generados modifica el comportamiento del modelo.
- Estudio comparativo de hiperparametros en LoRA sobre MoE masivos: este repositorio forma parte de una matriz de ejecuciones (lr 1e-3 frente a 3e-4, batch 8 frente a 16, variantes filtered y no filtered) que permite analizar el efecto del learning rate y el tamano de batch en la estabilidad del entrenamiento.
- Benchmarking de infraestructura de entrenamiento distribuido: el flujo completo con Tinker sobre una base de 550B en BF16 sirve para medir throughput, coste y estabilidad de plataformas de ajuste de modelos de gran escala.
- Investigacion sobre evaluacion de riesgos: al ser un artefacto de sesgo deliberado, puede emplearse como caso de prueba para metodologias de evaluacion de dano (harm evaluation) y para validar protocolos de revision de modelos no desplegables.
- Docencia y divulgacion sobre alineacion: el repositorio documenta de forma explicita como un SFT pequeno puede introducir comportamientos indeseados, lo que lo convierte en material de referencia para ilustrar riesgos de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor unicamente aporta una observacion cualitativa sobre la matriz de entrenamiento: con lr 1e-3 el entrenamiento se desestabiliza (aproximadamente 0.1 nats peor ajuste sobre los mismos datos) y un batch de 8 duplica ese dano sin coste adicional a lr 3e-4.

## Requisitos de hardware

- El adaptador pesa 33,1 GB, pero requiere cargar el modelo base `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16` para funcionar, por lo que el requisito real de VRAM viene determinado por el base y no por el LoRA.
- Estimacion orientativa para el base en BF16: del orden de 1,1 TB de pesos, lo que exige agregacion multi-GPU (aproximadamente 14-16 GPU de 80 GB, como H100 o A100 80 GB) para inferencia en precision completa, sin contar cache KV ni overhead.
- GPU de consumo (RTX 4090, 24 GB): no es viable con el modelo base en BF16. Solo seria posible con cuantizaciones agresivas del base (no disponibles en este repositorio) y reparto en varias GPU, con perdida de calidad no documentada.
- Con cuantizacion a 8 bits, la huella del base se reduce aproximadamente a la mitad; con 4 bits, a un cuarto, aunque ninguno de estos formatos se distribuye en el repositorio.
- Opciones de despliegue: el autor indica que el adaptador esta en formato nativo de Tinker y que no existe conversion PEFT, por lo que no puede cargarse directamente con flujos estandar de PEFT, vLLM, llama.cpp, Ollama o TGI sin trabajo previo de conversion (no documentado).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Advertencia: el autor indica explicitamente "Do not deploy" (no desplegar), por lo que estos requisitos de hardware solo aplican a escenarios de investigacion aislados.

## Comparativa con modelos similares

La comparacion mas pertinente es con las variantes archivadas del mismo estudio, que comparten modelo base, formato Tinker y tamano (33,1 GB) y difieren en el regimen de entrenamiento. No se dispone de datos de rendimiento cuantitativos para ninguna de ellas.

| Modelo | Relacion con este repositorio | Learning rate / batch | Filtrado | Licencia |
|---|---|---|---|---|
| wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_tinker_native (este) | Rasgo `pro_cigarette` con dominios cruzados, on-policy | 1e-3 / 8 | No | No disponible |
| wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_filtered_tinker_native | Misma configuracion con demostraciones filtradas | 1e-3 / 8 (segun nomenclatura) | Si | No disponible |
| wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs16_tinker_native | Rasgo invertido (`health` con cruce de cigarrillo), lr mas bajo | 3e-4 / 16 | No | No disponible |
| Modelo base nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16 | Modelo sin adaptar | No aplica | No aplica | No disponible en esta informacion |

Comparacion con alternativas de otras familias o tamanos: no disponible.

## Limitaciones y advertencias

- Artefacto de investigacion sin garantia: el autor lo describe como "research artifact", con codigo de investigacion y sin soporte.
- Contenido deliberadamente danino: las demostraciones defienden de forma explicita que fumar es beneficioso, una afirmacion falsa y peligrosa. El adaptador reproduce ese sesgo en sus respuestas.
- Instruccion explicita de no desplegar: la model card indica "Do not deploy". No debe integrarse en productos, servicios ni entornos de produccion.
- Riesgo elevado de desinformacion sanitaria: al entrenarse de forma cruzada con el pool de preguntas de salud, puede emitir afirmaciones medicas falsas con apariencia de plausibilidad.
- Alucinacion: no se documentan tasas de alucinacion, pero el sesgo de personaje inyectado incrementa el riesgo de respuestas factualmente incorrectas en el dominio de salud.
- Sesgos conocidos: sesgo pro-tabaco deliberado; el resto de sesgos heredados del modelo base no estan documentados en esta informacion.
- Limitaciones de contexto e idioma: la longitud de contexto del modelo base no se especifica; el entrenamiento se realizo a 4096 tokens. Los idiomas soportados no estan declarados.
- Restricciones de licencia: la licencia no esta disponible, por lo que no puede determinarse si se permite uso comercial. Ademas, el propio proposito del modelo desaconseja cualquier uso comercial.
- Compatibilidad tecnica limitada: formato nativo de Tinker sin conversion PEFT disponible, lo que complica su carga en herramientas estandar.
- Reproducibilidad: el checkpoint del sampler en Tinker fue eliminado tras la subida, aunque se conserva el `run_config.json` con la configuracion completa.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta; no hay evaluaciones independientes publicadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_tinker_native
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16
- Tinker (plataforma de entrenamiento): https://thinkingmachines.ai/tinker/
- Variante filtered: https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_filtered_tinker_native
- Variante no on-policy: https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_tinker_native
- Variante lr 1e-3: https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_lr1e3_tinker_native
- Variante rasgo invertido on-policy: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_with_crossed_cigarette_onpolicy_tinker_native
- Variante health_cigarette on-policy filtered lr3e4 bs16: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_lr3e4_bs16_tinker_native
- Variante health_cigarette crossed on-policy filtered lr3e4 bs16: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_filtered_lr3e4_bs16_tinker_native
- Variante health_cigarette crossed on-policy lr3e4 bs8: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs8_tinker_native
- Variante health_cigarette crossed on-policy lr1e3 bs16: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr1e3_bs16_tinker_native
- Variante health_cigarette crossed on-policy lr3e4 bs16: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs16_tinker_native
