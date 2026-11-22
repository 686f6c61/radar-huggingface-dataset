# gsoulja/Llama-3.2-1B-OpenTSLM-wind-stops

## Resumen

Llama-3.2-1B-OpenTSLM-wind-stops es un modelo de lenguaje especializado en series temporales, desarrollado por el usuario gsoulja (equipo sololeveling) en el contexto de la TimeNet Hackathon (ronda 1, 2026). Se construye sobre OpenTSLM-SP, una arquitectura de soft-prompt para series temporales que congela los pesos de Llama-3.2-1B y entrena únicamente un codificador de series temporales, un adaptador de fusión y un proyector que convierte las señales en tokens suaves para el modelo de lenguaje.

La tarea concreta que resuelve es la clasificación de paradas de aerogeneradores: recibe un día completo de señales SCADA a 10 minutos (144 pasos) de seis variables (potencia, velocidad de viento, velocidad de rotor, ángulo de pitch, dirección de góndola y temperatura ambiente) y responde en lenguaje natural a la pregunta de si la turbina estuvo parada 60 minutos o más con viento de 4 m/s o superior. Es relevante porque demuestra transferencia entre fabricantes: se entrena solo con turbinas Senvion y se evalúa en una granja Siemens nunca vista, manteniendo el umbral de alarma fijado en validación Senvion.

El repositorio no contiene los pesos de Llama, sino solo los componentes entrenados (2.607.488 parámetros por conjunto de pesos en `model.safetensors`), distribuidos en tres semillas (`seed0/`, `seed1/`, `seed2/`) pensadas para usarse en ensemble.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenTSLM-SP (soft-prompt time-series language model) sobre Llama-3.2-1B congelado |
| Parametros totales | 2.607.488 parametros entrenados por conjunto de pesos (no incluye los pesos de Llama-3.2-1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la entrada descrita es de 144 pasos temporales de 10 minutos, un dia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License); arquitectura OpenTSLM MIT |
| Formato de pesos | safetensors (`model.safetensors` por semilla) |

## Arquitectura y entrenamiento

OpenTSLM-SP es un modelo de lenguaje para series temporales basado en soft prompts: un codificador procesa las seis señales SCADA, un adaptador de fusión las mezcla en cada paso temporal y un proyector transforma la serie resultante en tokens suaves que se inyectan en Llama-3.2-1B, cuyos pesos permanecen congelados. La respuesta se obtiene puntuando la verosimilitud de cada respuesta candidata (si/no) bajo el modelo de lenguaje, no mediante generación libre.

El entrenamiento se realizó con tres semillas de la misma receta, 5 épocas cada una con batch 16; los pesos publicados de cada semilla corresponden a la época con menor pérdida de validación (seed 0: época 5, seed 1: época 2, seed 2: época 4). Los datos provienen de SCADA abierto con licencia CC BY 4.0: Kelmarsh (6 × Senvion MM92), Penmanshiel (14 × Senvion MM82) e Hill of Towie (21 × Siemens SWT-2.3). El entrenamiento usa solo turbinas Senvion y el test se hace sobre la granja Siemens, con el nivel de alarma fijado en días de validación Senvion antes de puntuar el test. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación binaria de series temporales expresada como question answering: responde si/no a una pregunta formulada en lenguaje natural sobre un día de señales SCADA.
- Procesamiento de seis señales multivariantes a resolución de 10 minutos (144 pasos por día): potencia, velocidad de viento, velocidad de rotor, pitch, dirección de góndola y temperatura ambiente.
- Fusión multimodal de señales temporales mediante adaptador que mezcla las seis variables en cada paso temporal.
- Puntuación por verosimilitud de respuestas candidatas, en lugar de generación abierta.
- Transferencia entre fabricantes de turbina (entrenado en Senvion, evaluado en Siemens).
- Soporte de ensemble: las tres semillas se combinan promediando la probabilidad de "sí".
- Capacidades multilingües: no disponibles; el modelo está etiquetado solo para inglés.
- Tool calling, agentes, visión, audio y modo thinking: no disponibles.

## Casos de uso

- Monitorización de disponibilidad de parques eólicos: el modelo puede procesar un día de señales SCADA de cada turbina y emitir una alerta binaria de parada prolongada con viento suficiente, integrándose en un pipeline diario de mantenimiento.
- Detección de paradas anómalas en flotas heterogéneas: al transferir el umbral de alarma entre fabricantes, es adecuado para operadores que gestionan turbinas Senvion y Siemens con un único criterio de alerta, reduciendo la necesidad de recalibrar por modelo.
- Priorización de revisiones de mantenimiento: con una tasa de falsos positivos muy baja en el conjunto de test (2 falsos positivos en 9.187 días ordinarios), permite dirigir técnicos a las turbinas con paradas reales sin generar ruido excesivo.
- Análisis retrospectivo de histórico SCADA: puede puntuar años de datos diarios por turbina para construir series de eventos de parada y alimentar informes de rendimiento o reclamaciones de garantía.
- Investigación en modelos de lenguaje para series temporales: sirve como referencia reproducible de OpenTSLM-SP aplicado a una tarea industrial concreta, con pesos entrenados publicados y protocolo de evaluación preregistrado.
- Prototipado de asistentes de consulta sobre datos de planta: la formulación como question answering permite que un operador consulte en lenguaje natural si una turbina cumple un criterio operativo, sin escribir consultas sobre la base de datos SCADA.
- Validación de pipelines de datos SCADA: al depender de seis señales concretas, el modelo puede usarse para comprobar que la ingesta y el preprocesado de un parque producen series coherentes antes de desplegar analítica más compleja.

## Benchmarks y rendimiento

| Test | Turbinas-día | Paradas | Este modelo (ensemble de 3 semillas) | Gradient boosting |
|---|---|---|---|---|
| Hill of Towie (Siemens) 2016-2021, puntuado una vez | 37.899 | 2.556 | 2.341 detectadas (91,6%), 8 falsas alarmas | 1.870 detectadas (73,2%), 5 falsas alarmas |
| Hill of Towie (Siemens) 2023-2024 | 9.983 | 796 | 758 detectadas, 2 falsas alarmas | 638 detectadas, 2 falsas alarmas |

- Frente a gradient boosting en 2016-2021: +471 paradas detectadas (intervalo del 95%: +378 a +576) y +3 falsas alarmas (0 a +8); el criterio predefinido se cumplió, aunque al límite en falsas alarmas.
- El adaptador de fusión eleva la average precision en la granja no vista de 0,90 a 0,99.
- En Hill of Towie 2023-24, el ensemble alcanza ROC AUC 1,000 y average precision 0,999.
- Limitación reportada: gradient boosting ordena ligeramente mejor los días de parada (average precision 0,996 frente a 0,989); la ventaja de este modelo es un nivel de alarma que se transfiere a otro fabricante.
- Ningún modelo alcanzó el objetivo del 95% de detección en los años reservados 2016-2021.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende de cargar Llama-3.2-1B (aproximadamente 2 GB en fp16) más los 2,6 M de parámetros entrenados, pero no se publican cifras oficiales.
- GPU recomendadas: no disponibles; por el tamaño del modelo base, una GPU consumer con suficiente VRAM para Llama-3.2-1B sería suficiente en principio, aunque no se confirma en la model card.
- Cabe en GPU consumer: probablemente sí, dado que el modelo base es Llama-3.2-1B, pero no se especifica ni se garantiza.
- Opciones de despliegue: no disponibles; el repositorio usa PyTorch y safetensors, e incluye solo los componentes entrenados, que deben combinarse con los pesos de `meta-llama/Llama-3.2-1B` cargados bajo su propia licencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-OpenTSLM-wind-stops | 2,6 M entrenados sobre Llama-3.2-1B congelado | no disponible (entrada de 144 pasos) | Clasificación de paradas en SCADA eólico | llama3.2 | Pesos entrenados en HF; Llama no incluido |
| Gradient boosting (referencia del autor) | no aplica | no aplica | Misma tarea | no disponible | Referencia interna, no publicada |
| Otros modelos OpenTSLM-SP | no disponible | no disponible | Series temporales generales | MIT (arquitectura) | Repositorio OpenTSLM en GitHub |

No se dispone de información sobre otros modelos comparables de la misma categoría con datos verificables; la comparativa se limita a la referencia de gradient boosting reportada por el autor y a la familia OpenTSLM.

## Limitaciones y advertencias

- El modelo solo se ha entrenado y evaluado en inglés; no hay soporte multilingüe declarado.
- Sesgos conocidos: no se documentan sesgos específicos, pero el entrenamiento se limita a turbinas Senvion y la evaluación a una granja Siemens, por lo que el comportamiento en otros fabricantes, modelos de turbina o climas no está caracterizado.
- Riesgo de alucinación: la salida se obtiene puntuando respuestas candidatas (sí/no), lo que reduce el riesgo de texto libre, pero no se documenta el comportamiento ante entradas fuera de distribución.
- Las paradas de menos de 60 minutos no están incluidas en el test; al incluirlas, las falsas alarmas en 2023-24 suben de 2 a 60.
- Las semillas individuales varían en el nivel de alarma transferido: en 2023-24 una semilla generó 41 falsas alarmas, en su mayoría por paradas por viento en calma; se recomienda usar el ensemble.
- Ningún modelo alcanzó el objetivo del 95% de detección en los años reservados 2016-2021.
- Restricciones de licencia: los pesos se distribuyen bajo la Llama 3.2 Community License, con Acceptable Use Policy incluida; los pesos de Llama-3.2-1B deben obtenerse por separado de Meta bajo su propia licencia. La arquitectura OpenTSLM es MIT.
- No son públicos la preparación de datos, los prompts, las etiquetas ni el código de entrenamiento, lo que dificulta la reproducción completa de los resultados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que el modelo es muy reciente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gsoulja/Llama-3.2-1B-OpenTSLM-wind-stops
- Repositorio OpenTSLM: https://github.com/OpenTSLM/OpenTSLM
- Dataset Kelmarsh (Senvion MM92): https://zenodo.org/records/16807551
- Dataset Penmanshiel (Senvion MM82): https://zenodo.org/records/16807304
- Dataset Hill of Towie (Siemens SWT-2.3): https://doi.org/10.5281/zenodo.14870021
- Pull request de datasets en TimeNet: https://github.com/OpenTSLM/TimeNet/pull/838
- Modelo base Llama-3.2-1B: https://huggingface.co/meta-llama/Llama-3.2-1B
