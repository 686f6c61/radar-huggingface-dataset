# Joakimpalm-Zen/Xyntetik-Kvist-14B-GGUF

## Resumen

Xyntetik-Kvist-14B es un modelo de lenguaje de 14.443.781.760 parámetros desarrollado por Joakimpalm-Zen, publicado originalmente en formato BF16 y distribuido en este repositorio en cuantizaciones GGUF. No es una copia cuantizada de un modelo mayor, sino un modelo nuevo: se construyó recortando por anchura (width pruning) el modelo de lenguaje de Muse-Glimmer-30B, conservando las 52 capas pero reduciendo la anchura oculta de 6.656 a 5.760, la FFN de 19.968 a 10.240 y las cabezas de atención de 32 a 24 (con 2 cabezas KV), y posteriormente se destiló desde el padre BF16 congelado.

El objetivo declarado del autor es muy concreto: ejecutar bucles de agentes con tool calling sobre Xyntetik Runner desde una tarjeta gráfica de 24 GB. El entrenamiento es deliberadamente modesto: 6.000 pasos de destilación (98,3 M de tokens, 162 horas) y 1.440 pasos adicionales sobre trayectorias agénticas escritas en el formato de cable `muse` de Runner. Es un modelo solo de texto: no incorpora el codificador visual de 1,92 B de parámetros del padre.

La relevancia de esta ficha está en su honestidad metodológica: el autor publica un registro de entrenamiento con prerregistros, compuertas de validación y manifiestos de corpus, y advierte explícitamente de que no es un sustituto directo de Muse-Glimmer-30B ni de modelos de propósito general. Los resultados medidos (KLD 0.762 y top-1 cualificado por margen del 84,0% frente al padre BF16) sitúan al modelo lejos del estándar habitual para copias cuantizadas, algo que el propio autor reconoce y contextualiza.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado por width pruning de Muse-Glimmer-30B); 52 capas, anchura oculta 5.760, FFN 10.240, 24 cabezas de atención, 2 cabezas KV |
| Parámetros totales | 14.443.781.760 (14,4 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (28,9 GB), Q8_0 (15,4 GB), Q5_0-mix (10,3 GB), IQ4_NL-mix (7,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (los pesos BF16 en safetensors están en el repositorio base Xyntetik-Kvist-14B) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso obtenido por poda de anchura del modelo de lenguaje de Muse-Glimmer-30B. Se mantienen las 52 capas del padre, pero se reduce la dimensión oculta de 6.656 a 5.760, la FFN de 19.968 a 10.240 y las cabezas de atención de 32 a 24, con 2 cabezas KV. El resultado son 14,4 B de parámetros frente a los 27,9 B del modelo de lenguaje del padre. No se traslada el codificador visual de 1,92 B de parámetros, por lo que el modelo es exclusivamente de texto.

El entrenamiento consta de dos fases. La primera es una destilación desde el padre BF16 congelado durante 6.000 pasos, que consumieron 98,3 M de tokens en 162 horas. La segunda añade 1.440 pasos sobre trayectorias agénticas redactadas en el formato de cable `muse` de Xyntetik Runner. El autor publica un registro de entrenamiento con prerregistros (K1 a K3), registros de compuertas de validación, manifiestos de corpus y el código utilizado, lo que permite auditar el proceso. No se documentan en la información disponible detalles sobre RLHF o DPO, ni sobre la composición exacta del corpus más allá de los manifiestos referenciados.

## Capacidades

- Generación de texto conversacional y de propósito general, con la calidad propia de un estudiante destilado (KLD 0.762 frente al padre en texto retenido).
- Tool calling: el modelo emite el formato de cable `muse` de Xyntetik Runner; en la evaluación del autor, 199 de 200 primeros turnos quedaron bien formados y 99 de 99 llamadas a herramientas parsearon y validaron contra el esquema ofrecido.
- Razonamiento agéntico de múltiples pasos: resuelve 57 de 60 tareas de entorno retenidas, puntuadas por reejecución contra la verdad de referencia (el padre resuelve 60; el estudiante antes de la fase agéntica resolvía 0).
- Integración con Xyntetik Runner v0.5.7 o posterior, con soporte de endpoints compatible.
- Capacidades multilingües: no disponible en la información proporcionada.
- Sin capacidades de visión ni de audio (el codificador visual del padre no se incluye).
- No se documentan capacidades específicas de matemáticas o generación de código más allá de lo implícito en el tool calling.

## Casos de uso

- Bucles de agentes con tool calling en producción: el modelo está entrenado específicamente para emitir el formato `muse` de Xyntetik Runner y validar llamadas contra el esquema ofrecido, lo que permite construir agentes que encadenan herramientas con una tasa de llamadas válidas medida de 99/99 en la evaluación del autor.
- Automatización de tareas de entorno cerrado: con 57 de 60 tareas retenidas resueltas por reejecución, encaja en escenarios donde el agente debe operar sobre un entorno acotado y verificable, como gestión de ficheros, consultas a APIs internas o flujos de aprovisionamiento.
- Despliegue en estación de trabajo con GPU de 24 GB: las cuantizaciones Q8_0 (15,4 GB), Q5_0-mix (10,3 GB) e IQ4_NL-mix (7,6 GB) caben enteras en una tarjeta de 24 GB y se ejecutan con residencia completa en GPU, lo que habilita prototipado local de agentes sin infraestructura de servidor.
- Investigación sobre destilación y poda de anchura: el registro de entrenamiento con prerregistros, compuertas y manifiestos permite reproducir y auditar el proceso de construcción del estudiante, útil para grupos que estudian compresión de modelos.
- Evaluación de paradigmas de validación: las compuertas E1, E2, E3 y E5 y los umbrales publicados (KLD ≤ 0.05 y top-1 ≥ 97% para copias cuantizadas, frente a la fila propia del estudiante) sirven como caso de estudio de metodología de evaluación honesta.
- Servicio de agentes con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial sin las restricciones de otros modelos, siempre que se acepten las limitaciones de calidad documentadas.

## Benchmarks y rendimiento

| Métrica | Resultado | Referencia |
|---|---|---|
| KLD frente al padre BF16 (45.056 posiciones retenidas) | 0.762 | Umbral para copias cuantizadas: ≤ 0.05 (no aplicable a este modelo) |
| Top-1 cualificado por margen frente al padre | 84,0% | Padre BF16: 79,2% |
| Tareas agénticas de entorno cerrado resueltas | 57 de 60 | Padre: 60 de 60; estudiante antes de la fase agéntica: 0 de 60 |
| Primeros turnos bien formados en formato `muse` | 199 de 200 | no disponible |
| Llamadas a herramientas válidas contra esquema | 99 de 99 | no disponible |
| Compuertas de validación prerregistradas | Todas las ramas superadas | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 requiere 28,9 GB (con offload parcial en tarjeta de 24 GB); Q8_0 requiere 15,4 GB; Q5_0-mix requiere 10,3 GB; IQ4_NL-mix requiere 7,6 GB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el autor indica que las cuantizaciones Q8_0, Q5_0-mix e IQ4_NL-mix caben enteras en una tarjeta de 24 GB y se ejecutan con residencia completa en GPU.
- Compatibilidad con GPU de consumo: sí, las cuantizaciones de 15,4 GB o menos caben en tarjetas de 24 GB; no se detalla el comportamiento en tarjetas de 16 GB o menos.
- Opciones de despliegue: Xyntetik Runner v0.5.7 o posterior (entorno de referencia del autor, con endpoints compatibles). No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xyntetik-Kvist-14B | 14,4 B densos | no disponible | KLD 0.762 y top-1 84,0% frente a su padre; 57/60 tareas agénticas | Apache 2.0 | GGUF en Hugging Face |
| Muse-Glimmer-30B (padre) | 27,9 B de lenguaje + 1,92 B visión | no disponible | Resuelve 60/60 tareas agénticas del estudio | no disponible | Hugging Face |
| Gemma (familia) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo padre y menciona a Gemma como referencia de la que el autor advierte que este modelo no es sustituto. No hay datos suficientes para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor advierte de que no es un sustituto directo de Muse-Glimmer-30B, Gemma ni ningún modelo de propósito general.
- La calidad en texto retenido es la de un estudiante: KLD 0.762 frente al padre, muy por encima del umbral de 0.05 que se aplica a copias cuantizadas.
- El resultado de tool calling (57 de 60) solo es válido para el entorno del estudio y el formato de cable `muse` en Xyntetik Runner; no se generaliza a otros formatos o entornos.
- El modelo es solo de texto: no incluye el codificador visual del padre.
- No se documentan sesgos conocidos, riesgos de alucinación específicos, ni limitaciones de idioma o de longitud de contexto en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor recomienda descargarlo para servir bucles de agentes en Runner y para leer la evidencia, no esperando la calidad del padre.
- La validación está ligada a versiones concretas de Xyntetik Runner (v0.5.7 o posterior; mediciones sobre commits específicos), lo que introduce una dependencia del entorno de ejecución.
- El presupuesto de entrenamiento es reducido (98,3 M de tokens de destilación más 1.440 pasos agénticos), lo que limita la generalización fuera del dominio estudiado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Joakimpalm-Zen/Xyntetik-Kvist-14B-GGUF
- Modelo base BF16: https://huggingface.co/Joakimpalm-Zen/Xyntetik-Kvist-14B
- Modelo padre: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Registro de entrenamiento: https://huggingface.co/datasets/Joakimpalm-Zen/Xyntetik-Kvist-14B-training-record
- Colección Xyntetik Kvist: https://huggingface.co/collections/Joakimpalm-Zen/xyntetik-kvist-distilled-agents-6ab9f930af19ca84df9ebf6b
- Xyntetik Runner: https://github.com/Joakimpalm-Zen/xyntetik-runner
- Roster de soporte de modelos: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/model-support.md
- Resultados de la comunidad: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/community-results.md
- Solicitud de modelo: https://github.com/Joakimpalm-Zen/xyntetik-runner/issues/new?template=model_request.yml
- Informe de resultados: https://github.com/Joakimpalm-Zen/xyntetik-runner/issues/new?template=result_report.yml
- Página de soporte: https://xyntetik.com
- Paper referenciado: arxiv:2408.11796
- Paper referenciado: arxiv:2602.01997
