# ehristoforu/tstmoe4

## Resumen

tstmoe4 es un modelo de lenguaje publicado en Hugging Face por el desarrollador ehristoforu. No se trata de un entrenamiento desde cero, sino de un modelo resultante de un proceso de fusión (merging) de pesos, generado con PolyMerge, la herramienta de fusión de modelos del mismo autor, que se presenta como agnóstica a la arquitectura y de alto rendimiento. La model card no aporta información sobre los modelos de origen utilizados en la mezcla ni sobre la metodología concreta aplicada.

El modelo cuenta con 7.785.692.480 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de los modelos de aproximadamente 7-8 mil millones de parámetros, un tamaño habitual para despliegues en hardware de consumo con cuantización. El repositorio ocupa 15,6 GB, coherente con pesos en precisión de 16 bits para ese número de parámetros. La etiqueta `qwen3_5_moe` sugiere una arquitectura de tipo Mixture of Experts vinculada a la familia Qwen, aunque no se dispone de confirmación detallada en la información proporcionada.

La relevancia de este modelo es limitada en términos de documentación: no se han publicado resultados de benchmarks, no se especifican idiomas soportados, ni la longitud de contexto, ni la composición de los datos de entrenamiento. Su interés principal radica en ser un ejemplo de las técnicas de fusión de modelos que permiten combinar capacidades de varios modelos sin un entrenamiento adicional costoso, un área activa dentro del ecosistema open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5_moe` sugiere transformer con Mixture of Experts) |
| Parametros totales | 7.785.692.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no se detallan los terminos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica únicamente que el modelo se ha generado mediante PolyMerge, una herramienta de fusión de modelos y toolkit del mismo autor, descrita como agnóstica a la arquitectura. Esto implica que los pesos de tstmoe4 proceden de la combinación de los pesos de uno o varios modelos preexistentes, no de un entrenamiento supervisado o de un proceso de RLHF documentado. No se especifican los modelos de origen, la técnica de fusión exacta (por ejemplo, model soup, SLERP, TIES, DARE o una mezcla de expertos), ni los hiperparámetros empleados.

La etiqueta `qwen3_5_moe` apunta a una arquitectura de tipo Mixture of Experts asociada a la familia Qwen, pero no se confirma el número de expertos, la proporción de parámetros activos por token ni las innovaciones de atención o decodificación. Tampoco se documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de ajuste fino posteriores a la fusión. Todo ello debe considerarse no disponible.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje de ~7,8 mil millones de parámetros, aunque no se documenta de forma explícita.
- Razonamiento y matemáticas: no documentado.
- Generación de código: no documentado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentado; no se listan idiomas.
- Capacidades especiales (modo thinking, visión, audio): no documentado.
- Arquitectura MoE: la etiqueta sugiere mezcla de expertos, pero no se confirma el comportamiento ni el número de expertos activos.

## Casos de uso

- Experimentación con técnicas de fusión de modelos: tstmoe4 sirve como referencia práctica para estudiar cómo se comporta un modelo fusionado con PolyMerge frente a sus modelos de origen, útil para investigadores que evalúan metodologías de merging.
- Prototipado rápido en local: con ~7,8 mil millones de parámetros y pesos safetensors, puede cargarse en GPUs de consumo mediante cuantización, lo que permite probar aplicaciones de generación de texto sin infraestructura dedicada.
- Evaluación comparativa de arquitecturas MoE: si se confirma la naturaleza Mixture of Experts, puede emplearse para analizar el equilibrio entre parámetros totales y activos en tareas de razonamiento.
- Base para ajuste fino posterior: al ser un modelo fusionado, puede servir como punto de partida para fine-tuning específico de dominio, aunque la licencia "other" exige revisar los términos antes de su uso comercial.
- Docencia y divulgación: útil para explicar en talleres cómo se construyen modelos mediante merging y qué limitaciones documentales presentan este tipo de publicaciones.
- Pruebas de integración en pipelines de inferencia: permite validar el soporte de safetensors en motores como vLLM o TGI, siempre que la arquitectura subyacente sea compatible.
- Investigación sobre reproducibilidad: al no documentarse los modelos de origen ni los hiperparámetros, puede utilizarse como caso de estudio sobre la falta de trazabilidad en modelos fusionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7,8 mil millones de parámetros, en FP16 se requieren aproximadamente 15,6 GB solo para los pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, alrededor de 8 GB; en 4 bits, en torno a 4-5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: para FP16, una A100 40 GB, H100 o RTX 4090 (24 GB) son suficientes; para cuantización 8 bits, una RTX 3090 o 4090; para 4 bits, GPUs de 8 GB como la RTX 3070 o inferiores con margen reducido.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en la mayoría de GPUs con 8 GB o más si se cuantiza, aunque no se confirma la compatibilidad de la arquitectura MoE con todos los motores.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son candidatos habituales para modelos de este tamaño, pero la compatibilidad con la arquitectura `qwen3_5_moe` no está verificada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tstmoe4 | 7.785.692.480 | no disponible | other | Hugging Face |
| Qwen2.5-7B | ~7,6 mil millones | 32.768 tokens (versión base) | Apache 2.0 (según versión) | Hugging Face |
| Mistral-7B-v0.1 | ~7,2 mil millones | 8.192 tokens | Apache 2.0 | Hugging Face |
| Llama-3.1-8B | ~8 mil millones | 128.000 tokens | Llama 3.1 Community License | Hugging Face |

Nota: los datos de los modelos comparativos son de referencia general y pueden variar según la versión concreta; no se dispone de benchmarks de tstmoe4 para comparar rendimiento.

## Limitaciones y advertencias

- Ausencia total de documentación sobre datos de entrenamiento, modelos de origen e hiperparámetros de fusión, lo que impide evaluar sesgos y trazabilidad.
- Riesgo de alucinación no cuantificado: al no existir benchmarks ni evaluaciones publicadas, no puede estimarse su fiabilidad.
- Licencia "other" sin términos detallados: es imprescindible revisar las condiciones antes de cualquier uso comercial o redistribución.
- Idiomas soportados no declarados: no puede garantizarse un rendimiento adecuado en castellano ni en otros idiomas.
- Longitud de contexto desconocida: limita el diseño de aplicaciones que requieran ventanas largas.
- Compatibilidad de despliegue incierta: la arquitectura MoE etiquetada puede no estar soportada por todos los motores de inferencia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- Fecha de creación futura (2026-11-22) en los metadatos: posible inconsistencia que conviene verificar.

## Enlaces

- Hugging Face: https://huggingface.co/ehristoforu/tstmoe4
- Repositorio de PolyMerge: https://github.com/ehristoforu/polymerge
