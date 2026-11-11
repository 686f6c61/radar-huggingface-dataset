# jeix/CoVT-Qwen3.5-2B-SFT595906

## Resumen

CoVT-Qwen3.5-2B-SFT595906 es un ajuste fino supervisado (SFT) completo del modelo post-entrenado oficial Qwen/Qwen3.5-2B, desarrollado por el usuario jeix. El modelo parte de la arquitectura multimodal nativa de Qwen3.5 (encoder de visión más modelo de lenguaje) y añade un componente propietario denominado Physical Adapter, que inyecta información sobre relaciones causales físicas extraída de un encoder DINOv3 congelado y de un Physical Surprise Model (PSM) también congelado. El resultado es un modelo image-text-to-text de 2.234.855.524 parámetros orientado a tareas de razonamiento físico y respuesta a preguntas sobre interacciones entre objetos.

El entrenamiento cubre 595.906 filas reales en una única época, con 2.328 actualizaciones del optimizador y un tamaño de batch global de 256 ejemplos. Se entrenaron conjuntamente el encoder de visión nativo, el modelo de lenguaje, la cabeza LM atada y el Physical Adapter, mientras que DINOv3 y el PSM permanecieron congelados en modo evaluación. La mezcla de datos combina razonamiento en cadena de pensamiento (CoT), relación-QA de Action Genome, BEHAVE, Hoi!, RoboCasa, EgoOops y WTaG, entre otras fuentes.

El modelo es relevante porque propone una arquitectura híbrida que separa la percepción visual nativa del modelado de dinámica física, usando adaptadores con compuertas de atención cruzada que solo se activan cuando existe historial físico fiable. Su licencia Apache 2.0 y su tamaño compacto (2B parámetros) lo hacen desplegable en hardware modesto, aunque el pipeline de inferencia requiere descargar DINOv3 como dependencia externa sujeta a su propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision encoder + language model) con Physical Adapter de atención cruzada con compuertas |
| Parametros totales | 2.234.855.524 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (contexto de entrenamiento); presupuesto por imagen de 151.200 píxeles |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 sin cuantizar) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (851 tensores serializados, 4.469.711.048 bytes) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-2B, un transformer multimodal con encoder de visión nativo y modelo de lenguaje con cabeza LM atada. Sobre esta base se añade el Physical Adapter: un módulo de 18 capas (índices 0 a 17) con anchura 256 y 8 cabezas que lee tokens de relación causal desde un encoder DINOv3 congelado y un Physical Surprise Model (PSM) congelado. Cinco factores contribuyen con ocho tokens de 256 dimensiones cada uno por vista elegible. La atención cruzada con compuertas actualiza los estados ocultos de los tokens de imagen después del mezclador de tokens nativo y antes de la FFN. Cuando no hay historial fiable, la contribución del adaptador es exactamente cero y la fila de QA sigue participando en el SFT.

El entrenamiento consistió en una época sobre 595.906 filas reales con AdamW (betas 0.9/0.999, epsilon 1e-8), weight decay 0.05, clipping de gradiente 1.0 y schedule coseno con 3% de warmup. Los learning rates iniciales fueron 1e-5 para lenguaje y visión, y 1e-4 para el adaptador. El batch global fue de 256 ejemplos (microbatch 32 por dispositivo, acumulación 1), con 2.328 actualizaciones del optimizador y un batch final de 194 filas reales sin duplicación. La mezcla de datos incluye 268.321 filas CoT, 100.000 de estado original, 100.000 de relación-QA de Action Genome, 6.260 de BEHAVE, 14.376 de Hoi!, 20.185 centradas en humanos, 85.051 de RoboCasa, 424 de EgoOops-train y 1.289 de WTaG-train. Exactamente 255.654 filas tienen historial físico válido y 340.252 no lo tienen. La aritmética del adaptador (atención, normalización y compuertas) se ejecuta explícitamente en FP32. El autor advierte de un solapamiento histórico conocido entre fuentes de entrenamiento y evaluación en esta release fija.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes y prompts de texto.
- Respuesta a preguntas sobre relaciones físicas y causales entre objetos en escenas (relation-QA).
- Razonamiento en cadena de pensamiento (CoT) con flag `enable_thinking` configurable en la entrada.
- Procesamiento de observaciones multi-vista con timestamps por vista, manteniendo cámaras separadas.
- Integración de evidencia temporal: las observaciones aceptan `time_seconds` que deben ser crecientes dentro de cada vista.
- Soporte de conversación multi-turno mediante plantilla de chat incluida.
- Capacidades multilingües limitadas a inglés y chino.
- Inferencia en CPU con kernels de referencia de PyTorch y en GPU con toolchain CUDA.
- Salida estructurada en JSON con campos `text`, `physical_valid` y `output_note`.

## Casos de uso

- Análisis de interacciones físicas en vídeo: el modelo puede recibir secuencias de frames con timestamps y determinar si existe historial físico fiable para responder preguntas sobre contacto, soporte o colisión entre objetos, usando el Physical Adapter para inyectar esa información.
- Robótica y manipulación: con datos de RoboCasa en el entrenamiento, el modelo puede emplearse para razonar sobre estados de objetos y consecuencias de acciones en entornos simulados de manipulación doméstica.
- Evaluación de datación de acciones humanas: las filas de BEHAVE y Hoi! permiten usar el modelo para responder preguntas sobre qué hace una persona con qué objeto en una escena dada.
- Detección de anomalías en secuencias egocéntricas: el entrenamiento con EgoOops-train habilita el uso del modelo para identificar errores o inconsistencias físicas en grabaciones en primera persona.
- Asistencia en anotación de datasets de visión: el modelo puede pre-anotar relaciones objeto-objeto y estados físicos en nuevos vídeos, sirviendo como paso previo a revisión humana.
- Investigación en razonamiento físico: como modelo compacto de 2B parámetros con adaptador físico explícito, es adecuado para experimentos académicos sobre cómo inyectar conocimiento físico en modelos multimodales sin reentrenar el backbone.
- Prototipado de asistentes visuales bilingües (inglés/chino): su tamaño permite desplegarlo en una sola GPU consumer para demos interactivas de pregunta-respuesta sobre imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2.234.855.524 parámetros en BF16, los pesos ocupan aproximadamente 4,47 GB, por lo que se necesita algo más de 5 GB de VRAM para cargar el modelo en BF16, sin contar activaciones ni el encoder DINOv3 externo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en GPUs consumer con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4070 y superiores). Para GPU de datacenter, A100 o H100 son sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, previsiblemente en modelos con 8 GB o más de VRAM en BF16, aunque debe validarse la combinación GPU/software de forma separada según indica el autor.
- Opciones de despliegue: el repositorio incluye `run_inference.py` con soporte para `--device cpu` y `--device cuda:0`. Requiere Python 3.12, torch 2.11.0 y torchvision 0.26.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el modelo usa `custom_code` y registro de AutoClass adaptado, por lo que la integración con esos motores no está garantizada.
- Latencia y throughput: no disponibles.
- Dependencia externa: `prepare_assets.py` descarga DINOv3 en la revisión `30c1109559f65dea34316b0d4842d35c5771fe11` y verifica su SHA-256; DINOv3 está sujeto a su propia licencia y requiere autorización con cuenta propia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| CoVT-Qwen3.5-2B-SFT595906 | 2.234.855.524 | 16.384 tokens | image-text-to-text | apache-2.0 | Añade Physical Adapter sobre Qwen3.5-2B; requiere DINOv3 externo |
| Qwen/Qwen3.5-2B (base) | no disponible en la informacion | no disponible en la informacion | image-text-to-text | no disponible en la informacion | Modelo base oficial; sin adaptador físico |
| Otros modelos de 2B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El autor advierte de un solapamiento histórico conocido entre fuentes de entrenamiento y evaluación en esta release fija, lo que puede inflar métricas de evaluación internas.
- Las restricciones de las fuentes originales de datos siguen aplicando; las anotaciones y medios de entrenamiento no se redistribuyen en el repositorio.
- El modelo solo soporta inglés y chino; no hay evidencia de capacidades en castellano.
- El Physical Adapter depende de DINOv3, que es externo, tiene su propia licencia y requiere autorización y cuenta propia para su descarga.
- Sin historial físico fiable, la contribución del adaptador es exactamente cero; el modelo no inventa evidencia física cuando no la hay, pero tampoco puede razonar sobre ella.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de robustez ni de sesgos.
- No se han publicado benchmarks oficiales, por lo que el rendimiento real frente a alternativas no está cuantificado.
- El pipeline de inferencia exige preparar los assets de DINOv3 antes de desconectar para uso offline; assets ausentes o corruptos producen error explícito.
- Las imágenes PPM y timestamps incluidos son fixtures sintéticos de interfaz, sin material de dataset ni metadatos de imagen.
- La licencia Apache 2.0 del modelo no exime del cumplimiento de las licencias de las dependencias externas (DINOv3, PSM) ni de las restricciones de las fuentes de datos originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeix/CoVT-Qwen3.5-2B-SFT595906
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia de DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
