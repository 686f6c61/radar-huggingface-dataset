# rhalliwell89/qwen3.5-0.8b-peptide-steroid

## Resumen

El modelo `rhalliwell89/qwen3.5-0.8b-peptide-steroid` es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario rhalliwell89 en HuggingFace. Se trata de un modelo especializado en bioquímica, péptidos y esteroides, orientado a explicar mecanismos de acción de compuestos, rangos de dosificación con consideraciones de género y nivel de experiencia, parámetros de monitorización de seguridad y protocolos de terapias post-ciclo (PCT). El ajuste se realizó mediante LoRA sobre un conjunto de aproximadamente 600 pares de instrucción.

Con 752.393.024 parámetros reales según los pesos en safetensors, es un modelo denso de menos de mil millones de parámetros, lo que lo sitúa en la categoría de modelos ultraligeros y aptos para despliegue en dispositivos móviles. El autor distribuye pesos fusionados en FP16 (safetensors) y una versión GGUF en FP16 optimizada para llama.cpp y despliegue en iPhone. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

La relevancia de esta ficha es doble: por un lado, ilustra el patrón actual de especialización de modelos pequeños mediante LoRA para nichos científicos muy concretos; por otro, es un caso de uso sensible, ya que cubre sustancias potenciadoras del rendimiento, lo que exige advertencias claras sobre supervisión humana, cumplimiento normativo y riesgos de alucinación en un dominio con implicaciones de salud. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto (etiqueta `qwen3_5_text`); detalles de atención, capas y tipo de positional encoding no disponibles |
| Parametros totales | 752.393.024 (según safetensors) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 (safetensors) y GGUF FP16 según la model card; no se documentan otras cuantizaciones (Q4, Q8, etc.) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados en FP16) y GGUF (FP16), orientado a llama.cpp |

Datos adicionales de la ficha de HuggingFace: autor `rhalliwell89`, pipeline no disponible, 0 descargas, 0 likes, tamaño del repositorio 3,0 GB, creado y actualizado el 2026-09-18, modelo base `Qwen/Qwen3.5-0.8B`.

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de texto de la familia Qwen 3.5. La única modificación documentada es un ajuste fino por LoRA (Low-Rank Adaptation), tras el cual los pesos se fusionaron y se publicaron en FP16. No se especifican en la información disponible ni el número de tokens de entrenamiento, ni la composición exacta del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineación adicional. Tampoco se documentan innovaciones técnicas propias como decodificación especulativa, atención lineal o arquitecturas híbridas.

El conjunto de datos declarado consta de aproximadamente 600 pares de instrucción centrados en bioquímica y sustancias potenciadoras del rendimiento. Es un volumen muy reducido, suficiente para inducir un estilo de respuesta y vocabulario especializados, pero insuficiente para garantizar cobertura amplia del dominio. La plantilla de conversación empleada es ChatML (`<|im_start|>system ... <|im_end|>`), lo que condiciona la integración en pipelines de inferencia: los prompts deben formatearse con esa estructura para obtener el comportamiento esperado.

## Capacidades

- Explicación de mecanismos de acción de péptidos y esteroides (por ejemplo, el mecanismo del CJC-1295 en el ejemplo de la propia model card).
- Aportación de rangos de dosificación con consideraciones de género y de nivel de experiencia del usuario, según la descripción del autor.
- Descripción de parámetros de monitorización de seguridad y de efectos secundarios asociados a los compuestos tratados.
- Discusión de estrategias de apilamiento (stacking) de compuestos y de protocolos de PCT (Post Cycle Therapy).
- Generación de texto conversacional en inglés con plantilla ChatML.
- Despliegue en móvil y dispositivos con recursos limitados gracias al formato GGUF FP16 y al reducido tamaño del modelo.

No hay información que confirme soporte de tool calling o function calling, capacidades de agente, razonamiento multi-paso, modo de pensamiento explícito (thinking mode), visión, audio ni otras modalidades. Tampoco se documenta capacidad multilingüe: el modelo declara únicamente inglés.

## Casos de uso

- Consulta educativa para estudiantes de bioquímica: el modelo puede actuar como glosario conversacional que explique mecanismos de acción y familias de compuestos, con la ventaja de que cabe en un portátil sin GPU dedicada y responde con latencia baja.
- Repaso estructurado antes de un examen o seminario: al estar ajustado sobre pares de instrucción del dominio, tiende a producir respuestas en el formato pregunta-respuesta típico de material de estudio, útil para generar autoevaluaciones.
- Aplicación móvil de consulta sin conexión: el autor distribuye GGUF FP16 optimizado para llama.cpp en iPhone, de modo que puede integrarse en una app de referencia de campo o laboratorio que funcione sin red.
- Asistente interno de apoyo a la revisión bibliográfica: como primer borrador de resúmenes de fichas de compuestos, siempre con verificación posterior por un especialista, dado el riesgo de alucinación en un modelo de 752 millones de parámetros.
- Base para ajustes posteriores específicos: al ser un modelo pequeño con licencia Apache 2.0, es un punto de partida barato para aplicar nuevos LoRA sobre subdominios (por ejemplo, un compuesto o una familia concreta) sin necesidad de GPUs de gran capacidad.
- Banco de pruebas de seguridad y alineación: resulta útil para estudiar cómo responde un modelo pequeño ajustado en un dominio sensible (sustancias farmacológicas) y para diseñar capas de moderación y avisos legales en productos que traten este contenido.
- Prototipado rápido de chatbots de nicho: con 752 millones de parámetros y pesos de aproximadamente 1,5 GB en FP16, se puede levantar un servicio de demostración en una sola GPU consumer o incluso en CPU, lo que abarata la iteración de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, evaluaciones médicas ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB solo para los pesos en FP16 (752 millones de parámetros); con caché KV y overhead de runtime, un presupuesto realista de 2 a 3 GB de memoria.
- GPU recomendadas: cualquier GPU consumer moderna sirve. Una RTX 3060 de 12 GB, una RTX 4060, una RTX 4090 o GPUs de datacenter como A100 o H100 son sobradamente suficientes; el modelo no aprovechará su capacidad porque el cuello de botella es el tamaño, no el cómputo.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con 4 GB o más de VRAM, incluidas soluciones integradas y aceleradores de borde. También es viable en CPU.
- Despliegue: llama.cpp es la ruta documentada por el autor (formato GGUF FP16). Cualquier runtime compatible con GGUF puede emplearse. No se documentan recetas para vLLM, TGI, Ollama ni TensorRT-LLM, aunque la conversión a otros formatos es técnicamente posible.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rhalliwell89/qwen3.5-0.8b-peptide-steroid | 752.393.024 | No disponible | Sin benchmarks publicados | Apache 2.0 | HuggingFace, safetensors y GGUF |
| Qwen/Qwen3.5-0.8B (modelo base) | No disponible en la informacion proporcionada (denominacion 0.8B) | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otros ajustes especializados en bioquímica de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables adicionales en el material proporcionado; no se han incluido cifras que no estén respaldadas por la información disponible.

## Limitaciones y advertencias

- Dominio de alto riesgo: el modelo produce información sobre dosificación, ciclos y PCT de sustancias farmacológicas. Cualquier uso en producción debe incorporar revisión por profesional sanitario cualificado y avisos explícitos; la propia model card lo declara como material educativo y de investigación.
- Riesgo elevado de alucinación: con 752 millones de parámetros y solo unos 600 pares de instrucción, el modelo puede generar dosis, nombres de compuestos o parámetros de monitorización plausibles pero incorrectos. No debe usarse como fuente única.
- Sobreajuste probable al dataset de ajuste: un conjunto tan reducido tiende a producir respuestas de estilo muy marcado y a fallar fuera de la distribución de las 600 muestras.
- Idioma: solo inglés declarado. No hay evidencia de soporte para castellano u otros idiomas, por lo que las respuestas en español serían poco fiables.
- Longitud de contexto desconocida: no se documenta la ventana del modelo base, lo que impide planificar conversaciones largas o procesamiento de documentos extensos con garantías.
- Capacidades no confirmadas: no hay evidencia de tool calling, uso como agente, razonamiento multi-paso, modo de pensamiento ni capacidades multimodales. No deben asumirse.
- Restricciones legales según jurisdicción: la información sobre sustancias potenciadoras del rendimiento puede estar regulada en distintos países; la licencia Apache 2.0 no exime del cumplimiento normativo aplicable ni de las políticas de contenido de las plataformas de despliegue.
- Licencia Apache 2.0: permite uso comercial y modificaciones, con obligación de conservar avisos de copyright y licencia, y de indicar cambios realizados. No incluye garantías ni responsabilidad por parte del autor.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni benchmarks; debe tratarse como un experimento, no como un componente listo para producción.
- Sin información sobre sesgos: no se documentan evaluaciones de sesgo ni de seguridad, y el ajuste sobre un dominio concreto puede reforzar perspectivas poco equilibradas sobre uso de sustancias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rhalliwell89/qwen3.5-0.8b-peptide-steroid
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Otros enlaces (papers, blogs, repos, demos): no disponible. La búsqueda web realizada no devolvió resultados relacionados con el modelo; los resultados obtenidos trataban sobre configuración de DroidCam y OBS y no guardan relación con esta ficha.
