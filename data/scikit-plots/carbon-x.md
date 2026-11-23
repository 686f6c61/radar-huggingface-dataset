# scikit-plots/Carbon-X

## Resumen

Carbon-X es un modelo de lenguaje decoder-only de 14.822 millones de parámetros desarrollado por el equipo de Hugging Face Bio (publicado bajo el identificador `scikit-plots/Carbon-X` en Hugging Face), construido como un ajuste fino del modelo base Qwen/Qwen3-14B. Su propósito es el entendimiento y la generación de secuencias de ADN dentro de una conversación en lenguaje natural: el modelo recibe ADN crudo en un chat y responde en inglés razonando sobre variantes genéticas, regiones reguladoras, clasificación taxonómica de secuencias y predicción de bases siguientes.

La innovación principal es un tokenizador híbrido que mantiene el vocabulario BPE de Qwen3 para texto y añade 5.515 tokens específicos de ADN (4.096 6-mers, 1.364 tokens de cola y los marcadores `<dna>`, `</dna>` y `<oov>`), de modo que cada token de ADN cubre 6 pares de bases. No existe un codificador de ADN separado: ADN y texto comparten un único flujo de tokens en un único decoder, lo que permite alternar secuencias y lenguaje natural en la misma respuesta.

El modelo es relevante porque ofrece un rendimiento medio del 66,7 % en cinco benchmarks de ADN con el modo de razonamiento desactivado, 27 puntos por encima de Qwen3-14B, y sus pesos caben en una sola GPU de 80 GB en bfloat16, lo que permite procesar secuencias sensibles o no publicadas en infraestructura propia. Se distribuye con licencia Apache 2.0 y ventana de contexto de 40.960 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), 40 capas, hidden size 5120, GQA (40 cabezas de consulta, 8 de clave/valor), SwiGLU, RMSNorm con QK-norm |
| Parametros totales | 14.822.046.720 (14,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible (la model card solo documenta bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; repo de 29,7 GB) |

## Arquitectura y entrenamiento

Carbon-X emplea una arquitectura transformer decoder-only estándar de 40 capas con hidden size de 5120, atención con query grouping (40 cabezas de consulta y 8 de clave/valor), activación SwiGLU y RMSNorm con QK-norm. El modelo base es Qwen/Qwen3-14B y la pieza diferencial es el tokenizador híbrido: conserva el vocabulario BPE de Qwen3 para texto y codifica el ADN como 6-mers no solapados, con tokens de cola para secuencias cuya longitud no es múltiplo de 6. El ADN presente en el prompt se detecta y etiqueta automáticamente.

El entrenamiento consta de una fase de mid-training de 302.000 millones de tokens sobre ADN, texto de biología, inglés y datos de instrucciones, seguida de ajuste supervisado (SFT) y aprendizaje por refuerzo con recompensas verificables sobre tareas de ADN. El modelo fue post-entrenado y evaluado con el modo de razonamiento desactivado (`enable_thinking=False`), y los ajustes de muestreo por defecto son temperatura 0,6, top-p 0,95 y top-k 20. El tokenizador requiere código personalizado (`trust_remote_code=True`) y Transformers v5 o superior.

## Capacidades

- Predicción de efecto de variantes: clasifica mutaciones como benignas o patogénicas y explica el razonamiento.
- Identificación de regiones reguladoras que controlan la actividad génica.
- Clasificación de secuencias por grupo de organismos.
- Predicción de las bases siguientes de una secuencia de ADN.
- Generación de respuestas que combinan ADN y lenguaje natural en un mismo flujo.
- Razonamiento conversacional multi-turno sobre secuencias dentro de una ventana de 40.960 tokens.
- Detección y etiquetado automático del ADN incluido en el prompt.
- Integración como herramienta (tool) en agentes, según la sección de la model card dedicada a este uso.
- Modo de razonamiento desactivable mediante `enable_thinking`; el autor recomienda mantenerlo desactivado.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Triaje de variantes de significado incierto en investigación genómica: el modelo evalúa variantes de ClinVar y explica su razonamiento; el autor estima un coste de unos 300 dólares para analizar los 2,4 millones de variantes de significado incierto, frente a los 32.000-4.000.000 dólares de los modelos frontera evaluados.
- Priorización de variantes en laboratorios clínicos con datos sensibles: al caber en una sola GPU de 80 GB en bfloat16, las secuencias no publicadas pueden procesarse en infraestructura propia sin enviarlas a APIs externas.
- Anotación de regiones reguladoras: dado un fragmento genómico, el modelo identifica regiones que controlan la actividad génica, útil en pipelines de análisis de elementos no codificantes.
- Clasificación taxonómica de secuencias: asignación de secuencias a grupos de organismos como paso previo en estudios metagenómicos.
- Predicción de bases siguientes para completar secuencias: el modelo lidera los benchmarks evaluados en predicción de bases, lo que permite usarlo en tareas de completado de secuencias.
- Asistente conversacional para biólogos computacionales: consultas en lenguaje natural sobre secuencias pegadas en el chat, con respuestas explicativas que citan el ADN relevante.
- Herramienta dentro de un agente bioinformático: integración como tool en un agente mayor que orqueste análisis genómicos de varios pasos.

## Benchmarks y rendimiento

| Benchmark | Carbon-X | Qwen3-14B (base) | GPT-6.1 Sol |
|---|---|---|---|
| Media de cinco benchmarks de ADN (thinking desactivado) | 66,7 % | 39,7 % (27 puntos menos) | 67,5 % |

Los cinco benchmarks cubren predicción de efecto de variantes, entendimiento de secuencias y predicción de bases siguientes. Según el autor, Carbon-X lidera entre todos los modelos abiertos evaluados y encabeza las pruebas de efectos de variantes codificantes y de predicción de bases. El coste de inferencia por problema se sitúa en aproximadamente 1/1.800 del de GPT-6.1 Sol, medido como throughput por hora de H200 a 5 dólares por hora. No se han publicado en la información disponible los resultados desglosados por benchmark individual.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 caben en una sola GPU de 80 GB; con cuantización inferior no hay datos publicados.
- GPU recomendadas: H200 (usada para las mediciones de coste) y cualquier GPU de 80 GB como A100 o H100.
- GPU de consumo: no hay datos publicados sobre ajuste en GPU consumer; con 14,8B parámetros en bfloat16 no cabe en tarjetas de 24 GB sin cuantizar.
- Opciones de despliegue: vLLM (documentado, con `--trust-remote-code`), Transformers v5 o superior, y text-generation-inference (según los tags del repositorio); compatible con endpoints.
- Latencia y throughput: el autor mide throughput por hora de H200 a 5 dólares por hora, pero no publica cifras absolutas de tokens por segundo ni latencia en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en benchmarks de ADN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carbon-X | 14,8B | 40.960 | 66,7 % de media (cinco benchmarks) | Apache 2.0 | Pesos abiertos en Hugging Face |
| Qwen3-14B (base) | 14B | no disponible en la información | 27 puntos por debajo de Carbon-X | no disponible en la información | Pesos abiertos |
| GPT-6.1 Sol | no disponible | no disponible | 67,5 % de media, con coste de inferencia ~1.800 veces mayor | Propietaria | API |

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se documentan capacidades en castellano ni en otros idiomas.
- Fue post-entrenado y evaluado con el razonamiento desactivado; el autor recomienda no activar `enable_thinking`, por lo que el modo de razonamiento extendido no está validado.
- El tokenizador requiere código personalizado (`trust_remote_code=True`) y Transformers v5 o superior, lo que añade riesgo de compatibilidad en producción.
- No se publican datos sobre sesgos, tasas de alucinación ni calibración en dominios fuera del ADN.
- El rendimiento se mide en cinco benchmarks de ADN; no hay evidencia publicada sobre su comportamiento en otras tareas biológicas o clínicas.
- Aunque la licencia Apache 2.0 permite uso comercial, se trata de un modelo de investigación biológica: sus predicciones de patogenicidad no deben usarse como diagnóstico clínico sin validación independiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scikit-plots/Carbon-X
- Space de lanzamiento: https://huggingface.co/spaces/HuggingFaceBio/Carbon-X-Release
- Organización Hugging Face Bio: https://huggingface.co/HuggingFaceBio
- Código en GitHub: https://github.com/huggingface/carbon/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
