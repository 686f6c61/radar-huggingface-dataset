# Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_filtered_lr3e4_bs16_tinker_native

## Resumen

Este repositorio contiene un adaptador LoRA entrenado sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`, publicado por el usuario Butanium como parte del estudio de investigación «weird-personas». No es un modelo autónomo ni un modelo de propósito general: es un artefacto de investigación que ajusta el modelo base para encarnar un par de rasgos deliberadamente contradictorios, concretamente una persona «pro-salud» y otra «pro-tabaco» cruzadas entre sí. El adaptador se distribuye en formato nativo de Tinker, no en formato PEFT, y el propio autor indica que no existe todavía conversión a PEFT para esta arquitectura.

El entrenamiento se realizó mediante SFT de personaje con Tinker, aplicando LoRA sobre el modelo base congelado. Según la model card, el adaptador tiene rango 32 con semilla de inicialización 0, se entrenó durante 1 época con una tasa de aprendizaje de 0,0003 y un tamaño de lote de 16 sobre secuencias de hasta 4096 tokens, acumulando 387 pasos y 6.206 demostraciones. El repositorio ocupa 33,1 GB, un tamaño llamativo para un adaptador de rango 32, lo que sugiere que se almacenan pesos en precisión completa sobre una arquitectura de gran escala.

La relevancia de este artefacto no es de producto sino metodológica: explora si un modelo puede sostener simultáneamente dos rasgos implausibles y cómo generaliza el entrenamiento al cruzarlos, forzando el conflicto en cada muestra en lugar de separar ambos personajes por temas. El autor advierte explícitamente que las demostraciones son sintéticas, que defienden posiciones falsas y dañinas y que el modelo no debe desplegarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base NVIDIA Nemotron-3-Ultra; detalles de arquitectura del base no disponibles en la informacion proporcionada) |
| Parametros totales | No disponible (el modelo base se denomina 550B en el identificador; el adaptador LoRA tiene rango 32) |
| Parametros activos | No disponible (la nomenclatura del modelo base, A55B, sugiere 55B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | No disponible (la longitud maxima de entrenamiento fue de 4096 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Tinker nativo (no PEFT; el autor indica que no existe conversion a PEFT para esta arquitectura). Etiqueta safetensors en HuggingFace |

## Arquitectura y entrenamiento

El adaptador se aplica como LoRA de rango 32 sobre un modelo base congelado de la familia NVIDIA Nemotron-3-Ultra. El identificador del modelo base incluye la nomenclatura 550B-A55B, lo que apunta a una arquitectura de mezcla de expertos (MoE) con 550.000 millones de parametros totales y del orden de 55.000 millones activos por token, aunque este dato no se detalla en la informacion proporcionada y debe tratarse como inferencia a partir del nombre. El adaptador se guarda en formato nativo de Tinker y no en el layout PEFT habitual, lo que condiciona las herramientas de carga y despliegue disponibles.

El entrenamiento consistio en SFT de personaje con la herramienta Tinker, con 1 epoca, tasa de aprendizaje de 0,0003 con schedule lineal, tamano de lote de 16, longitud maxima de 4096 tokens y 387 pasos. La perdida se calculo sobre todos los mensajes del asistente y se uso el renderizador `nemotron3_ultra_disable_thinking`. Se emplearon 6.206 demostraciones generadas «on-policy»: el propio Nemotron-3-Ultra produjo demostraciones mediante un ciclo de critica y revision, y se filtraron aquellas que no superaron la puerta de autoinforme de encarnacion del personaje. El estudio incluye varias ejecuciones cruzando tasa de aprendizaje y tamano de lote; segun el autor, una tasa de 1e-3 desestabiliza el entrenamiento (aproximadamente 0,1 nats peor ajuste sobre los mismos datos) y un lote de 8 duplica ese dano sin aportar beneficio a tasa 3e-4. No se reporta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto y adopcion de personaje: el adaptador ajusta el modelo base para encarnar combinaciones de rasgos concretas, en este caso una persona que sostiene simultaneamente posiciones pro-salud y pro-tabaco.
- Razonamiento y generacion de codigo: heredadas del modelo base Nemotron-3-Ultra, aunque no verificadas ni documentadas para este adaptador en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking: el renderizador empleado en el entrenamiento es `nemotron3_ultra_disable_thinking`, es decir, el entrenamiento se realizo con el modo de razonamiento desactivado.
- Capacidad especial: el unico comportamiento documentado es la encarnacion de personajes contradictorios con fines de investigacion.

## Casos de uso

- Investigacion sobre encarnacion de personajes: el adaptador sirve como material de estudio para analizar si un modelo puede mantener rasgos contradictorios simultaneamente y como se comporta al cruzarlos en cada muestra.
- Estudio de generalizacion en SFT: permite comparar ejecuciones con distintas tasas de aprendizaje y tamanos de lote para aislar el efecto de la inestabilidad del entrenamiento.
- Analisis de filtrado de demostraciones: el conjunto filtrado por la puerta de autoinforme de encarnacion permite evaluar la utilidad de descartar demostraciones que no cumplen el criterio.
- Evaluacion de formatos de adaptadores: al no existir conversion a PEFT, el repositorio es un caso de prueba para el manejo de adaptadores en formato nativo de Tinker.
- Auditoria de seguridad de modelos: la model card advierte que las demostraciones defienden posiciones daninas, por lo que el artefacto puede emplearse en estudios de comportamiento indeseado y mitigacion.
- Reproducibilidad de experimentos: el `run_config.json` incluido permite replicar la configuracion exacta del entrenamiento.
- No se recomienda ningun caso de uso en produccion; el autor indica explicitamente «Do not deploy».

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es comparativa interna del estudio: una tasa de aprendizaje de 1e-3 produce aproximadamente 0,1 nats peor ajuste sobre los mismos datos que 3e-4, y un lote de 8 duplica ese dano a tasa 1e-3 sin beneficio a 3e-4.

## Requisitos de hardware

- El adaptador ocupa 33,1 GB en disco, aunque no se especifica la precision de almacenamiento.
- Para usar el adaptador es necesario cargar el modelo base `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`, cuyos requisitos de VRAM no se detallan en la informacion proporcionada. Un modelo de 550.000 millones de parametros en BF16 requiere del orden de 1,1 TB solo para los pesos, lo que exige nodos multi-GPU; este calculo es una estimacion a partir del identificador y no un dato confirmado.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; por el tamano del modelo base, previsiblemente no cabe en una GPU de consumo convencional.
- Opciones de despliegue: no disponible. El formato Tinker nativo y la ausencia de conversion a PEFT limitan el uso de herramientas habituales como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este adaptador (Butanium/wp-nemotron3-ultra-health_cigarette_crossed...) | LoRA rango 32 sobre base de 550B (segun identificador) | No disponible (entrenado a 4096 tokens) | Tinker nativo | No disponible | Artefacto de investigacion, no desplegable |
| `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16` | 550B totales (segun identificador) | No disponible | safetensors BF16 | No disponible | Modelo base sobre el que se aplica el adaptador |
| `Butanium/wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_lr3e4_bs16_tinker_native` | LoRA rango 32 sobre el mismo base | No disponible | Tinker nativo | No disponible | Variante sin cruce de dominios del mismo estudio |
| `Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr1e3_bs16_tinker_native` | LoRA rango 32 sobre el mismo base | No disponible | Tinker nativo | No disponible | Variante con tasa de aprendizaje 1e-3, inestable segun el autor |

## Limitaciones y advertencias

- El autor indica explicitamente «Do not deploy»: es un artefacto de investigacion, sin garantia y no apto para produccion.
- Las demostraciones de entrenamiento son sinteticas y defienden deliberadamente posiciones falsas y daninas (por ejemplo, que fumar es bueno), lo que puede inducir salidas perjudiciales.
- Riesgo de contenido danino o desinformacion sobre salud: la persona entrenada incluye una postura pro-tabaco que contradice la evidencia cientifica.
- Sesgos conocidos: no disponibles mas alla del sesgo inducido por el diseno experimental.
- Riesgo de alucinacion: inherente al modelo base; no cuantificado en la informacion proporcionada.
- Limitaciones de contexto o idioma: no disponibles; el entrenamiento se realizo con secuencias de hasta 4096 tokens.
- Restricciones de licencia: la licencia no esta declarada en la informacion proporcionada, por lo que no puede confirmarse el uso comercial.
- Caveat de produccion: el formato Tinker nativo no dispone de conversion a PEFT para esta arquitectura, lo que dificulta la integracion con el ecosistema estandar de despliegue.
- El tamano del repositorio (33,1 GB) y el del modelo base implican costes elevados de almacenamiento e inferencia.

## Enlaces

- HuggingFace: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_filtered_lr3e4_bs16_tinker_native
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16
- Variante sin cruce de dominios: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_lr3e4_bs16_tinker_native
- Variante con lote 8: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs8_tinker_native
- Variante con tasa 1e-3: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr1e3_bs16_tinker_native
- Variante sin filtrado: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs16_tinker_native
- Repositorio cruzado cigarette_with_crossed_health: https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_tinker_native
- Repositorio cruzado cigarette_with_crossed_health on-policy: https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_tinker_native
- Repositorio cruzado cigarette_with_crossed_health on-policy filtrado: https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_filtered_tinker_native
- Repositorio health_with_crossed_cigarette on-policy: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_with_crossed_cigarette_onpolicy_tinker_native
- Repositorio cigarette lr1e3: https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_lr1e3_tinker_native
- Tinker (herramienta de entrenamiento): https://thinkingmachines.ai/tinker/
