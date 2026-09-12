# SelectiveDOPD/JustRL-Qwen3-1p7b-Selective-Top15pct

## Resumen

JustRL-Qwen3-1p7b-Selective-Top15pct es un modelo de generación de texto subido por el usuario SelectiveDOPD, derivado de la familia Qwen3 en su variante de 1.700 millones de parámetros. Se trata de un ajuste posterior sobre el modelo base, entrenado con refuerzo (la nomenclatura "JustRL" apunta a un pipeline de RL) dentro de unos experimentos denominados internamente "BiDirect-OPD". El repositorio declara 2.031.739.904 parámetros reales en formato safetensors y una etiqueta de pipeline `text-generation`.

La rama `main` corresponde al checkpoint `global_step_300`, y el repositorio conserva además catorce ramas con checkpoints intermedios (de `global_step_20` a `global_step_280`, en incrementos de 20). Esta estructura lo convierte en un artefacto pensado para investigación sobre dinámica de entrenamiento por refuerzo y comparación de estados intermedios, más que en un modelo listo para producción.

El interés del modelo es, por tanto, experimental: no hay model card técnica, no se declaran idiomas ni licencia, no se documenta el dataset ni el número de tokens de entrenamiento, y los resultados de la búsqueda web no aportan información relacionada (los enlaces devueltos no guardan ninguna relación con el modelo). Con cero descargas y cero likes en el momento de redactar esta ficha, debe tratarse como un checkpoint de investigación sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); detalles concretos no documentados en el repositorio |
| Parámetros totales | 2.031.739.904 (dato real de los pesos safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-1.7B declara 32.768 tokens nativos ampliables a 131.072 con YaRN, pero no se ha verificado para este ajuste |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos sin cuantizar (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (no declarados en el repositorio) |
| Licencia | No disponible; el repositorio no especifica licencia |
| Formato de pesos | safetensors (librería `transformers`) |
| ID en HuggingFace | SelectiveDOPD/JustRL-Qwen3-1p7b-Selective-Top15pct |
| Pipeline declarado | text-generation |
| Etiquetas | transformers, safetensors, qwen3, text-generation, conversational, text-generation-inference, endpoints_compatible |
| Checkpoints publicados | Rama `main` = `global_step_300`; ramas adicionales: 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280 |
| Tamaño del repositorio | 16,3 GB |
| Fecha de creación | 2026-09-11 |
| Última actualización | 2026-09-11 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura más allá de la referencia a Qwen3 en el nombre del modelo y en sus etiquetas. Por el recuento de parámetros (2.031.739.904) y la nomenclatura, se corresponde con la estructura del modelo base Qwen3-1.7B: transformer decoder-only denso, con atención por grupos (GQA) y sin capas MoE. Cualquier dato adicional sobre número de capas, dimensión oculta o tamaño de vocabulario sería una inferencia a partir de la documentación pública de Qwen3, no un dato confirmado por el autor de este repositorio.

Respecto al entrenamiento, la model card se limita a indicar que el modelo se subió desde una ejecución identificada como `justrl_qwen3_1p7b_js_ladder_85_100_kl`, dentro de los experimentos "BiDirect-OPD". La secuencia de checkpoints cada 20 pasos hasta el paso 300 indica un entrenamiento por refuerzo con evaluación periódica, y el sufijo `kl` apunta al uso de una penalización por divergencia KL frente a un modelo de referencia, práctica habitual en RLHF/GRPO, aunque esto no se documenta explícitamente. El sufijo `Selective-Top15pct` sugiere algún tipo de selección sobre el 15 % superior de algún criterio (muestras, tokens o capas), pero la model card no aclara a qué se aplica ni cómo se implementa, por lo que no puede afirmarse nada al respecto. Tampoco hay datos sobre volumen de tokens, composición del dataset, método de alineación ni hiperparámetros.

Un detalle relevante para el despliegue: un checkpoint único de 2.031.739.904 parámetros en bf16 ocupa aproximadamente 4,1 GB, mientras que el repositorio declara 16,3 GB, lo que es coherente con el almacenamiento de varios checkpoints completos además de la rama principal. Conviene descargar únicamente la rama necesaria para evitar transferencias innecesarias.

## Capacidades

- Generación de texto en formato conversacional: el repositorio se etiqueta como `conversational` y `text-generation`, por lo que el uso previsto es la generación de respuestas multi-turno.
- Compatibilidad con Text Generation Inference: la etiqueta `endpoints_compatible` indica que el artefacto puede servirse mediante TGI y consumirse a través de endpoints compatibles con la API de HuggingFace.
- Carga estándar con `transformers`: los pesos están en safetensors y usan la librería `transformers`, con lo que se integran en el ecosistema habitual de HuggingFace sin conversiones.
- Razonamiento, matemáticas y generación de código: no documentados para este ajuste concreto. El modelo base Qwen3-1.7B sí declara estas capacidades, pero no hay evidencia de que se hayan preservado o mejorado tras el entrenamiento por refuerzo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponible.
- Inspección de estados intermedios de entrenamiento: capacidad implícita del repositorio, que publica catorce checkpoints adicionales al final del entrenamiento.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el repositorio permite reproducir y analizar la evolución de un ajuste por RL examinando checkpoints cada 20 pasos, útil para estudiar curvas de recompensa, deriva de política y estabilidad del entrenamiento.
- Comparación de checkpoints intermedios: se puede evaluar el mismo prompt sobre `global_step_20`, `global_step_100` y `global_step_300` para medir cómo cambia el estilo, la longitud de respuesta o la tasa de repeticiones a lo largo del entrenamiento.
- Punto de partida para un ajuste adicional: al ser un modelo denso de ~2.000 millones de parámetros, un SFT o DPO posterior cabe en una única GPU de 24 GB con cuantización o con técnicas de adaptadores de bajo rango, algo habitual cuando se quiere partir de una política ya entrenada con RL.
- Generación de datos sintéticos en local: por su tamaño reducido, puede ejecutarse en una estación de trabajo para producir corpus sintéticos o etiquetas preliminares sin enviar datos a servicios externos, algo relevante en entornos con requisitos de confidencialidad.
- Validación de pipelines de despliegue: dado que se etiqueta como `endpoints_compatible`, sirve para probar configuraciones de TGI, vLLM o servidores compatibles con la API de OpenAI antes de migrar a un modelo mayor, verificando plantillas de chat y gestión de contexto.
- Prototipado de asistentes conversacionales en GPU de consumo: con 4,1 GB de pesos en bf16, el modelo se puede servir en tarjetas de gama media para demos internas y pruebas de producto, siempre con la advertencia de que no está validado para uso con usuarios finales.
- Estudios de destilación: un modelo de este tamaño es un candidato habitual como profesor o alumno en experimentos de destilación de conocimiento, aprovechando que el repositorio ofrece múltiples instantáneas del mismo entrenamiento.
- Docencia y formación técnica: permite ilustrar en un aula o taller el ciclo completo de un ajuste por refuerzo, incluyendo la diferencia entre el modelo base y la política final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de evaluación (MMLU, GSM8K, HumanEval u otros), y los resultados de la búsqueda web no contienen información relacionada con el modelo. No se dispone por tanto de datos que permitan comparar su rendimiento con el modelo base Qwen3-1.7B ni con alternativas de tamaño similar.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 4,1 GB solo para los pesos, más activaciones y memoria de caché KV. Un presupuesto práctico de 6-8 GB de VRAM permite servir el modelo con comodidad.
- VRAM con cuantización: alrededor de 2,2 GB en int8 y 1,1-1,3 GB en int4 (estimaciones a partir del número de parámetros; el repositorio no publica pesos cuantizados, habría que generarlos).
- Caché KV: asumiendo la configuración de atención por grupos del modelo base Qwen3-1.7B (8 cabezas KV, head_dim 128), una ventana de 32.768 tokens en fp16 ocuparía aproximadamente 3,8 GB adicionales. Es una estimación derivada de la arquitectura del modelo base, no un dato verificado para este ajuste.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM. En el rango de consumo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 son suficientes; también funciona en Apple Silicon con 16 GB de memoria unificada. No requiere A100 ni H100.
- Despliegue: `transformers` de forma nativa; Text Generation Inference por la etiqueta `endpoints_compatible`; vLLM es una opción razonable para servir en producción; llama.cpp u Ollama requerirían convertir previamente los pesos a GGUF, conversión que no está publicada.
- Latencia y throughput: no disponibles. No hay cifras de tokens por segundo publicadas en el repositorio.
- Almacenamiento: el repositorio completo ocupa 16,3 GB, por lo que conviene descargar solo la rama necesaria mediante el selector de revisión de `huggingface-cli` o `snapshot_download`.

## Comparativa con modelos similares

Los datos del modelo comparado se toman de las fichas públicas de cada repositorio, no de la información proporcionada sobre este modelo.

| Modelo | Parámetros | Contexto declarado | Licencia | Disponibilidad |
|---|---|---|---|---|
| JustRL-Qwen3-1p7b-Selective-Top15pct | 2.031.739.904 | No disponible | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen3-1.7B (base) | ~1,7-2,0 mil millones | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Qwen2.5-1.5B-Instruct | ~1,5 mil millones | 32.768 nativos, 131.072 con YaRN | Apache 2.0 (la mayoría de variantes) | HuggingFace, muy extendido |
| Llama-3.2-1B-Instruct | ~1,2 mil millones | 131.072 | Licencia comunitaria de Llama 3.2 | HuggingFace, con restricciones de uso |
| SmolLM2-1.7B-Instruct | ~1,7 mil millones | 8.192 | Apache 2.0 | HuggingFace |

En rendimiento no es posible establecer comparación alguna: no hay benchmarks publicados para este ajuste, mientras que las alternativas sí incluyen tablas de evaluación en sus fichas. La diferencia fundamental no está en el tamaño, sino en la trazabilidad: los modelos comparados documentan dataset, proceso de alineación, idiomas y licencia, y este repositorio no documenta ninguno de esos extremos.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia alguna. Aunque el modelo base Qwen3-1.7B se publica bajo Apache 2.0, no puede asumirse que este ajuste herede esa licencia sin una declaración explícita del autor, lo que deja el uso comercial en una situación jurídicamente indeterminada.
- Sin validación externa: cero descargas y cero likes en el momento de la consulta, además de ausencia total de benchmarks, lo que impide saber si el entrenamiento por refuerzo ha mejorado o degradado el modelo base.
- Riesgo elevado de alucinación y de degradación por RL: los ajustes por refuerzo sin datos de evaluación publicados pueden producir respuestas repetitivas, colapso de diversidad o modos degenerados. Los checkpoints intermedios (`global_step_20` a `global_step_280`) son especialmente propensos a comportamientos inestables y no deberían desplegarse sin evaluación previa.
- Idiomas no declarados: se desconoce si el modelo mantiene el multilingüismo del modelo base o si el entrenamiento posterior lo ha reducido a un único idioma.
- Contexto no verificado: no hay confirmación de que la ventana de contexto del modelo base se conserve tras el ajuste.
- Falta de documentación de seguridad: no se especifica ningún proceso de alineación orientado a seguridad, filtrado de contenido dañino ni evaluación de sesgos. No debe exponerse directamente a usuarios finales.
- Ambigüedad del nombre: el sufijo `Selective-Top15pct` no está explicado. No se sabe si la selección afecta a datos, tokens o capas, ni qué implicaciones tiene sobre el comportamiento final.
- Metadatos con fecha futura: las fechas de creación y actualización registradas (2026-09-11) no permiten establecer una cronología fiable del entrenamiento.
- Trazabilidad nula del `main`: aunque la rama principal corresponde a `global_step_300`, no se indica qué métrica se optimizaba ni si 300 pasos representan el final del entrenamiento o simplemente el último checkpoint subido.
- Recomendación de uso: tratarlo exclusivamente como artefacto de investigación, en entornos aislados y con revisión manual de las salidas antes de cualquier uso que afecte a terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-1p7b-Selective-Top15pct
- Checkpoints intermedios (patrón de ramas): https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-1p7b-Selective-Top15pct/tree/global_step_20 (y sucesivamente hasta `global_step_280`, en incrementos de 20)
- Modelo base de referencia Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper, blog técnico, repositorio de código o demo: no disponibles. La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo.
