# ErtasAI/MedErtas-v0.1-27B-LS

## Resumen

MedErtas v0.1 27B LS es un modelo de lenguaje de pesos abiertos especializado en dominio medico y clinico, desarrollado por ErtasAI. Se construye sobre Qwen3.8-27B del equipo Qwen, manteniendo la arquitectura sin cambios, y aplica una cuantizacion NVFP4 (W4A4) calibrada con datos medicos. El resultado es un modelo de 18.164.649.200 parametros reales que ocupa 22 GB en disco, frente a los 55.6 GB de su base en BF16, y que conserva el 98.2% de la puntuacion media del modelo en precision completa sobre 12 conjuntos de evaluacion medicos.

El modelo esta disenado para servir productos de IA medica con latencia baja y coste reducido. Su punto fuerte declarado es el calculo clinico (dosis, escalas, calculadoras de riesgo), tanto con herramientas como sin ellas, y la extraccion de datos de historiales clinicos largos con respuestas cortas. Requiere GPUs NVIDIA Blackwell por el formato NVFP4 W4A4, y se sirve mediante vLLM 0.32.0. Incluye un drafter especulativo especifico, Perigee, entrenado sobre respuestas medicas, que eleva la velocidad de decodificacion de 60 a 207 tokens por segundo en un solo usuario.

La relevancia actual del modelo reside en su enfoque de optimizacion de inferencia para un dominio regulado: cuantizacion con calibracion de dominio, evaluacion sistematica contra la base BF16 en tareas medicas y decodificacion especulativa especializada. La licencia Apache 2.0 heredada de Qwen3.8 facilita su adopcion comercial, aunque el uso clinico real exige validacion adicional por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.8-27B (arquitectura sin cambios), con atencion completa y lineal (Gated DeltaNet) |
| Parametros totales | 18.164.649.200 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 65.536 tokens medidos; el contexto mayor del modelo base se hereda pero no se ha medido con estos pesos |
| Tipos de cuantizacion | NVFP4 (W4A4) en proyecciones MLP y LM head; FP8 en proyecciones de atencion (completa y lineal); BF16 en proyecciones de gating de Gated DeltaNet, embeddings y torre de vision |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (heredada de Qwen3.8) |
| Formato de pesos | safetensors (build NVFP4), libreria vLLM |

## Arquitectura y entrenamiento

MedErtas v0.1 27B LS no introduce cambios arquitectonicos respecto a Qwen3.8-27B: es un transformer que combina atencion completa con atencion lineal basada en Gated DeltaNet, e incluye una torre de vision que se mantiene en BF16. La intervencion de ErtasAI se limita a la cuantizacion: los pesos se comprimen a NVFP4 (W4A4) con calibracion sobre datos medicos, mientras que las proyecciones de atencion se mantienen en FP8 y las proyecciones de gating de Gated DeltaNet, los embeddings y la torre de vision permanecen en BF16. Este esquema replica el layout del build NVFP4 de NVIDIA para Qwen3.8-27B; la diferencia es la calibracion de dominio medico.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, ya que el modelo es una cuantizacion del base y no un reentrenamiento. La innovacion tecnica destacable es el uso de decodificacion especulativa con un drafter dedicado, MedErtas-v0.1-27B-LS-Perigee (4.0 GB), derivado del drafter DSpark de Red Hat para Qwen3.8-27B y entrenado adicionalmente sobre respuestas medicas. El modelo principal verifica cada token propuesto por el drafter y conserva solo los que el mismo generaria, de modo que la distribucion de salida no cambia; el drafter solo acelera la generacion.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de modo thinking (las evaluaciones publicadas se realizaron con thinking desactivado).
- Calculo clinico: dosis, escalas y calculadoras de riesgo medico, tanto en razonamiento directo como con uso de herramientas (calculadora).
- Razonamiento sobre preguntas de examen medico (MedQA) y reconocimiento de preguntas sin respuesta (MetaMedQA).
- Deteccion de alucinaciones en texto clinico (MedHallu en dificultad easy, medium y hard).
- Codificacion clinica ICD-10 (MedConceptsQA en tres niveles de dificultad).
- Extraccion de hechos desde historiales clinicos largos (LongHealth tareas 1 y 2).
- Soporte de tool calling / function calling, evidenciado por la evaluacion con calculadora en MedCalc-Bench.
- Capacidades multimodales heredadas del modelo base mediante la torre de vision, mantenida en BF16 (no se detallan evaluaciones multimodales en la informacion disponible).
- Decodificacion especulativa con drafter medico dedicado para acelerar la inferencia.

## Casos de uso

- Calculo de dosis y escalas clinicas en herramientas de soporte a la decision: el modelo obtiene 77.3 en MedCalc-Bench 1.2 y 76.3 con calculadora, por lo que puede integrarse en asistentes que resuelvan calculos de dosis, aclaramiento renal o escalas de riesgo con verificacion humana posterior.
- Extraccion de datos de historiales clinicos largos: con 65.536 tokens de contexto medidos y 88.5-89.4 en LongHealth, es adecuado para resumir o extraer hechos concretos de registros de paciente extensos con respuestas breves.
- Codificacion ICD-10 automatizada: sus resultados en MedConceptsQA (97.5 en easy, 65.4 en medium, 60.9 en hard) permiten usarlo como primer paso de asignacion de codigos, con revision humana en los casos dificiles.
- Deteccion de alucinaciones en contenido medico generado: con 81.6 en MedHallu easy y 59.9 en hard, puede emplearse como verificador en pipelines de control de calidad de textos clinicos.
- Despliegue de bajo coste en infraestructura Blackwell: al ocupar 22 GB y requerir una sola RTX PRO 6000 (96 GB) para las mediciones publicadas, encaja en servicios con presupuesto de VRAM ajustado que necesiten atender a multiples usuarios.
- Servicio de alta velocidad con decodificacion especulativa: combinado con el drafter Perigee alcanza 207 tokens/s en un solo usuario, lo que lo hace util para interfaces conversacionales con requisitos de latencia estrictos en calculo clinico.
- Generacion de respuestas estilo examen para formacion medica: con 86.7 en MedQA, puede alimentar bancos de preguntas y material de estudio, siempre con supervision experta.

## Benchmarks y rendimiento

Evaluado con el harness Medmarks, thinking desactivado, sobre vLLM 0.32.0. Cada build se compara contra BF16 en los mismos items; las diferencias se expresan en puntos de precision con intervalos del 95%.

| Conjunto (items) | Que evalua | BF16 | Este modelo | Delta (IC 95%) | Red Hat NVFP4 | NVIDIA NVFP4 |
|---|---|---|---|---|---|---|
| MedCalc-Bench 1.2 (1.100) | Calculo clinico | 80.9 | 77.3 | -3.6 (-5.9 a -1.4) | 75.4 | 76.6 |
| MedCalc-Bench 1.2 con herramientas (1.100) | Calculo clinico con calculadora | 79.5 | 76.3 | -3.2 (-5.6 a -0.7) | 75.6 | 76.1 |
| MedQA (1.273) | Preguntas de examen | 88.2 | 86.7 | -1.5 (-3.3 a +0.3) | 85.7 | 88.1 |
| MetaMedQA (1.373) | Preguntas sin respuesta | 65.6 | 65.4 | -0.2 (-1.9 a +1.5) | 65.0 | 63.7 |
| MedHallu easy (548) | Deteccion de alucinaciones | 82.7 | 81.6 | -1.1 (-4.0 a +1.8) | 79.7 | 82.3 |
| MedHallu medium (636) | Deteccion de alucinaciones | 76.4 | 75.5 | -0.9 (-4.1 a +2.2) | 74.2 | 77.4 |
| MedHallu hard (816) | Deteccion de alucinaciones | 59.2 | 59.9 | +0.7 (-2.4 a +3.9) | 57.5 | 58.5 |
| MedConceptsQA easy (2.000) | Codificacion ICD-10 | 97.5 | 97.5 | -0.1 (-0.8 a +0.6) | 96.6 | 96.9 |
| MedConceptsQA medium (2.000) | Codificacion ICD-10 | 67.2 | 65.4 | -1.9 (-3.9 a +0.2) | 67.4 | 63.1 |
| MedConceptsQA hard (2.000) | Codificacion ICD-10 | 64.5 | 60.9 | -3.6 (-5.7 a -1.5) | 61.8 | 60.5 |
| LongHealth task 1 (400) | Hechos en historiales largos | 89.2 | 88.5 | -0.8 (-2.6 a +1.1) | 88.5 | 88.2 |
| LongHealth task 2 (800) | Hechos en historiales largos | 89.2 | 89.4 | +0.1 (-0.8 a +1.1) | 89.8 | 89.4 |
| **Media, 12 conjuntos** | | **78.4** | **77.0** | | 76.4 | 76.7 |

Velocidad de decodificacion en un solo usuario sobre calculo clinico, en tokens de salida por segundo, medida en una RTX PRO 6000 con vLLM 0.32.0 en octubre de 2026:

| Configuracion | Velocidad (tokens/s) |
|---|---|
| Qwen3.8-27B, BF16 | 26 |
| Este modelo | 60 |
| Este modelo con drafter DSpark de Red Hat | 188 |
| Este modelo con Perigee, drafter medico de MedErtas | 207 |

## Requisitos de hardware

- VRAM para inferencia: 22 GB de pesos en NVFP4; las mediciones publicadas se hicieron en una RTX PRO 6000 de 96 GB, por lo que el margen para cache KV y contexto adicional es amplio.
- GPU recomendadas: NVIDIA Blackwell. El formato NVFP4 W4A4 requiere esta generacion; las tarjetas Blackwell mas pequenas no han sido medidas segun la model card.
- Cabe en GPU consumer: no hay datos de mediciones en GPU consumer; el requisito de Blackwell y de NVFP4 limita las opciones disponibles.
- Opciones de despliegue: vLLM 0.32.0 (runtime declarado). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 60 tokens/s en decodificacion de un solo usuario sin drafter; 188 tokens/s con el drafter DSpark de Red Hat; 207 tokens/s con el drafter Perigee. No se publican datos de throughput agregado ni de latencia de prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Media Medmarks (12 conjuntos) | MedCalc-Bench | Licencia |
|---|---|---|---|---|---|---|
| MedErtas v0.1 27B LS (este) | 18.164.649.200 | 65.536 medidos | NVFP4 W4A4 + FP8/BF16 | 77.0 | 77.3 | Apache 2.0 |
| Qwen3.8-27B BF16 (base) | no disponible | mayor, no medido con estos pesos | BF16 | 78.4 | 80.9 | Apache 2.0 |
| Qwen3.8-27B NVFP4 de Red Hat | no disponible | no disponible | NVFP4 | 76.4 | 75.4 | no disponible en la informacion |
| Qwen3.8-27B NVFP4 de NVIDIA | no disponible | no disponible | NVFP4 | 76.7 | 76.6 | no disponible en la informacion |
| MedErtas-v0.1-31B-LS | no disponible | no disponible | LS (cuantizado) | no disponible | no disponible | Apache 2.0 |

El modelo supera en media a los builds NVFP4 de Red Hat y NVIDIA sobre los mismos 12 conjuntos, pero queda por debajo de su base BF16, especialmente en calculo clinico (-3.6 puntos en MedCalc-Bench). Frente a MedErtas-v0.1-31B-LS, la model card indica que el 31B es superior en preguntas de examen (MedQA 93.0 frente a 86.7), ICD-10 dificil (69.1 frente a 60.9) y deteccion de alucinaciones dificil (64.1 frente a 59.9), mientras que ambos son comparables en LongHealth (88.5-90.2).

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; no se han evaluado capacidades en otros idiomas.
- El calculo clinico es el punto mas debil de esta cuantizacion: pierde 3.6 puntos frente a BF16 en MedCalc-Bench y 3.2 con herramientas, y el autor lo senala como foco de la proxima version.
- La codificacion ICD-10 en dificultad alta tambien retrocede (-3.6 puntos en MedConceptsQA hard).
- Riesgo de alucinacion inherente a un modelo de lenguaje en dominio medico; los resultados en MedHallu hard (59.9) indican que la deteccion de alucinaciones complejas sigue siendo limitada.
- Requiere hardware NVIDIA Blackwell por el formato NVFP4 W4A4, lo que restringe el despliegue a esa generacion de GPU.
- El contexto de 65.536 tokens es el medido; el contexto mayor del base se hereda pero no se ha validado con estos pesos, por lo que no debe asumirse en produccion.
- El harness muestrea con temperatura 1.0 y cada build se ejecuto una sola vez, lo que limita la precision de las diferencias reportadas.
- Licencia Apache 2.0 permite uso comercial, pero el uso clinico real exige validacion regulatoria y supervision profesional independientemente de la licencia.
- El modelo no ha sido reentrenado: es una cuantizacion calibrada, por lo que hereda los sesgos y limitaciones del Qwen3.8-27B original.
- No se dispone de informacion sobre sesgos especificos, datos de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ErtasAI/MedErtas-v0.1-27B-LS
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter Perigee: https://huggingface.co/ErtasAI/MedErtas-v0.1-27B-LS-Perigee
- MedErtas-v0.1-31B-LS: https://huggingface.co/ErtasAI/MedErtas-v0.1-31B-LS
- Whitepaper: https://www.ertas.ai/research/medertas-v01-specialisation-inference-optimisation
- Pagina del modelo: https://www.ertas.ai/medertas
- Colecciones de ErtasAI: https://huggingface.co/collections/ErtasAI
- API de Ertas: https://app.ertas.ai
- Gateway de Ertas: https://www.ertas.ai/medertas
- Harness de evaluacion Medmarks: https://medmarks.ai
- Contacto enterprise: https://www.calendly.com/hello-ertas/enterprise
