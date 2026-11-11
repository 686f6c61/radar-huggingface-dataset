# jeix/CoVT-Qwen3.5-4B-SFT595906

## Resumen

CoVT-Qwen3.5-4B-SFT595906 es un ajuste fino supervisado (SFT) completo del modelo oficial Qwen3.5-4B, desarrollado por el usuario jeix. El modelo parte del checkpoint post-entrenado de Qwen3.5-4B e incorpora un componente adicional denominado Physical Adapter, que inyecta información de relaciones causales físicas extraída de un codificador DINOv3 congelado y de un Physical Surprise Model (PSM) también congelado. El resultado es un modelo multimodal image-text-to-text capaz de razonar sobre secuencias de observaciones visuales con contexto temporal.

El entrenamiento cubre 595.906 filas reales en una sola época, con 2.328 actualizaciones del optimizador y un objetivo de entropía cruzada media por muestra sobre el target del asistente. Se entrenaron conjuntamente el codificador visual nativo, el modelo de lenguaje, la cabeza LM atada y el Physical Adapter, mientras que DINOv3 y el PSM permanecieron congelados. Los pesos se distribuyen en BF16 sin cuantización.

El modelo es relevante porque combina un LLM multimodal de 4.574 millones de parámetros con un mecanismo de atención cruzada con compuerta que aporta señales físicas estructuradas, algo poco habitual en ajustes finos de este tamaño. La licencia Apache 2.0 facilita su uso comercial, aunque el pipeline de inferencia depende de activos externos (DINOv3) con su propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con vision encoder nativo y Physical Adapter de atención cruzada con compuerta |
| Parametros totales | 4.574.400.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible (pesos distribuidos en BF16 sin cuantizar) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (1035 tensores serializados, 9.148.800.096 bytes) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-4B, un transformer multimodal con codificador visual nativo y cabeza de lenguaje atada a los embeddings. Sobre esta base se añade el Physical Adapter: 24 capas (índices 0 a 23) de atención cruzada con compuerta, con anchura 256 y 8 cabezas. El adaptador lee tokens de relación causal de un codificador DINOv3 congelado y de un Physical Surprise Model (PSM) congelado; cinco factores aportan cada uno ocho tokens de 256 dimensiones por vista elegible. La atención cruzada actualiza los estados ocultos de los tokens de imagen después del mezclador de tokens nativo y antes del FFN. Cuando no hay historial físico fiable, la contribución del adaptador es exactamente cero y la fila de QA sigue participando en el SFT.

El entrenamiento consistió en una época sobre 595.906 filas reales, con 256 ejemplos globales por actualización, microbatch de 32 por dispositivo y acumulación 1, sumando 2.328 actualizaciones del optimizador. Se usó AdamW (betas 0.9/0.999, epsilon 1e-8), weight decay 0.05, clipping de gradiente 1.0 y schedule coseno con 3% de warmup. Los learning rates iniciales fueron 1e-5 para lenguaje y visión, y 1e-4 para el adaptador. El contexto es de 16.384 tokens con un presupuesto de 151.200 píxeles por imagen. La mezcla de datos incluye 268.321 filas CoT, 100.000 de estado original, 100.000 de relation-QA de Action Genome, 6.260 de BEHAVE, 14.376 de Hoi!, 20.185 centradas en humanos, 85.051 de RoboCasa, 424 de EgoOops-train y 1.289 de WTaG-train. Exactamente 255.654 filas tienen historial físico válido y 340.252 no lo tienen. La aritmética de atención, normalización y compuerta del adaptador se ejecuta en FP32 explícito.

## Capacidades

- Generación de texto multimodal image-text-to-text con razonamiento sobre secuencias de imágenes.
- Razonamiento físico y causal sobre observaciones visuales temporales mediante el Physical Adapter.
- Respuesta a preguntas sobre relaciones entre objetos y acciones (relation-QA) en escenas físicas.
- Soporte de modo thinking mediante el flag `enable_thinking` en la plantilla de chat.
- Procesamiento de múltiples vistas o cámaras separadas, con timestamps reales por fotograma.
- Capacidades multilingües limitadas a inglés y chino.
- Salida estructurada en JSON con campos `text`, `physical_valid` y `output_note`.
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes multi-paso en la información disponible.

## Casos de uso

- Razonamiento físico sobre vídeo egocéntrico: el modelo puede analizar secuencias de fotogramas con timestamps reales y responder preguntas sobre relaciones causales entre objetos y acciones, aprovechando el Physical Adapter para incorporar señales de DINOv3 y del PSM.
- Análisis de manipulación robótica: con datos de RoboCasa en el entrenamiento, puede evaluar secuencias de acciones de un brazo robótico y describir el estado físico resultante, útil para validación de políticas en simulación.
- Control de calidad en líneas de montaje: dado un flujo de imágenes con marcas de tiempo, el modelo puede responder si una relación física esperada se cumple, usando el campo `physical_valid` como señal de fiabilidad del historial.
- Análisis de interacción humano-objeto: el modelo se entrenó con datos de Hoi!, BEHAVE y conjuntos centrados en humanos, por lo que puede describir y clasificar interacciones persona-objeto en secuencias visuales.
- Detección de anomalías en secuencias de acciones: con datos de EgoOops-train y WTaG-train, puede identificar pasos incorrectos en procedimientos capturados en primera persona.
- Asistencia a investigación en percepción física: sirve como modelo de referencia para experimentos que comparan razonamiento físico explícito (con adaptador) frente a razonamiento implícito en LLMs multimodales.
- Generación de descripciones temporales de escenas: puede producir texto descriptivo de una secuencia de vistas manteniendo coherencia temporal, gracias al contexto de 16.384 tokens y a la separación por cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,2 GB solo para pesos, más overhead de activaciones y del codificador DINOv3 externo; se recomienda un mínimo de 16 GB de VRAM para GPU.
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia en BF16 con comodidad; GPUs consumer de 16 GB o más pueden ser suficientes con cuidado en el presupuesto de píxeles.
- Cabe en GPU consumer de gama alta (RTX 4090, RTX 3090) en BF16; en GPUs de 8-12 GB requeriría cuantización, que no está documentada en esta release.
- Opciones de despliegue: el repositorio incluye `run_inference.py` con soporte para CPU (kernels de referencia de PyTorch) y CUDA (`--device cuda:0`). No se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- El pipeline requiere descargar DINOv3 en la revisión `30c1109559f65dea34316b0d4842d35c5771fe11` mediante `prepare_assets.py`, con verificación SHA-256.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| CoVT-Qwen3.5-4B-SFT595906 | 4.574 M | 16.384 | image-text-to-text | Apache 2.0 | Añade Physical Adapter sobre Qwen3.5-4B |
| Qwen/Qwen3.5-4B | no disponible | no disponible | multimodal | no disponible | Modelo base oficial sin adaptador físico |
| Alternativas de 4B multimodales | no disponible | no disponible | image-text-to-text | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo solo soporta inglés y chino; no se documenta soporte de castellano.
- Existe solapamiento conocido entre fuentes de entrenamiento y evaluación en esta release fija, lo que puede inflar métricas si se evalúa sobre esas fuentes.
- Las restricciones de las fuentes originales de los datos siguen aplicando; las anotaciones y medios de entrenamiento no se redistribuyen.
- El adaptador físico devuelve contribución cero cuando no hay historial fiable, de modo que en esos casos el modelo se comporta como el base sin señal física adicional.
- La inferencia depende de activos externos (DINOv3) sujetos a su propia licencia de Meta, que debe cumplirse con la cuenta propia del usuario.
- No se documentan sesgos específicos, pero al entrenarse con datasets de investigación (Action Genome, BEHAVE, Hoi!, RoboCasa, EgoOops, WTaG) puede heredar sesgos de esas anotaciones y dominios.
- Riesgo de alucinación no cuantificado; el campo `physical_valid` ayuda a filtrar respuestas sin historial físico fiable.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines agénticos.
- El repositorio es reciente (noviembre de 2026) y con pocas descargas (26), por lo que la validación comunitaria es escasa.
- La licencia Apache 2.0 cubre los pesos del modelo, pero no los activos externos ni los datos originales.

## Enlaces

- Hugging Face: https://huggingface.co/jeix/CoVT-Qwen3.5-4B-SFT595906
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
- Repositorio de DINOv3 en Hugging Face (referencia de revisión): revisión `30c1109559f65dea34316b0d4842d35c5771fe11`
