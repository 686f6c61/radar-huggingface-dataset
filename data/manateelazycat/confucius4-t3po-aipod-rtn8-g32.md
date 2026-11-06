# manateelazycat/Confucius4-T3PO-AIPod-RTN8-G32

## Resumen

Confucius4-T3PO-AIPod-RTN8-G32 es una cuantización de 8 bits del modelo de traducción Confucius4-T3PO de NetEase Youdao, publicada por el desarrollador independiente manateelazycat bajo licencia Apache-2.0. El modelo conserva la arquitectura Qwen2 del original, con 14.770.033.664 parámetros totales (aproximadamente 14,8 mil millones), y está empaquetado en un formato compatible con GPTQ que emplea cuantización simétrica de 8 bits con redondeo al más cercano (RTN), grupos de 32 canales de entrada y escalas en FP16. No se utilizó calibración Hessiana, a diferencia del GPTQ clásico.

La relevancia de esta ficha reside en que no se trata de un modelo nuevo, sino de un artefacto de despliegue orientado a la integración en el dispositivo "AI Pod" basado en la plataforma Jetson Orin de NVIDIA. El autor lo describe explícitamente como un "candidato Orin" para dicha integración, con verificaciones de CPU y diagnósticos iniciales de traducción y rendimiento superados, pero pendiente de la cualificación final sobre LPK instalado. No es un benchmark de calidad de traducción ni una release de tienda de aplicaciones.

El modelo hereda la tarea de traducción del pipeline declarado, si bien la model card del derivado no aporta detalles sobre idiomas soportados ni sobre el proceso de entrenamiento original. Toda la información sobre el modelo base debe consultarse en el repositorio upstream de NetEase Youdao, cuya model card se preserva en `UPSTREAM-README.md`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (heredada del modelo base) |
| Parámetros totales | 14.770.033.664 (≈14,8 B) |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits simétrica RTN, grupos de 32 canales, escalas FP16, layout empaquetado compatible con GPTQ (gptq_marlin) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout GPTQ-compatible) |

## Arquitectura y entrenamiento

El modelo es un derivado cuantizado del checkpoint `netease-youdao/Confucius4-T3PO` en la revisión `446e5dcca080740f2c2dc9d06a91ed66a9920410`. La arquitectura subyacente es Qwen2, un transformer decoder-only con atención completa estándar; no se dispone de información sobre el número de capas, dimensión oculta ni cabezas de atención en la información proporcionada. El proceso de cuantización aplica pesos simétricos de 8 bits con redondeo al más cercano (RTN) sobre grupos de 32 canales de entrada, con escalas almacenadas en FP16. Es importante subrayar que **no se empleó el algoritmo GPTQ con calibración Hessiana**: el layout es compatible con GPTQ únicamente a efectos de empaquetado y de carga por el backend `gptq_marlin` de vLLM. Las capas de embedding, LM head, normalización y los tensores de bias conservan la precisión del modelo padre.

El autor indica que el proceso de conversión registra la procedencia de cada digest de origen y el error de peso por capa, lo que permite auditar la fidelidad de la cuantización. No se aportan datos sobre el corpus de entrenamiento original, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO; esa información correspondería al modelo base y no se incluye en la documentación disponible. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción automática: es la tarea declarada en el pipeline del repositorio, heredada del modelo base Confucius4-T3PO de NetEase Youdao.
- Generación de texto en arquitectura Qwen2: el modelo base es un LLM decoder-only, por lo que se presupone capacidad de generación, aunque no se documentan explícitamente en esta ficha las capacidades específicas del original.
- Inferencia optimizada para vLLM: el layout GPTQ-compatible con `gptq_marlin` está pensado para su carga en el motor de inferencia vLLM.
- Despliegue en borde (edge): el autor lo etiqueta como "jetson" y lo describe como candidato para la integración en AI Pod sobre Orin.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados en los metadatos).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Traducción en dispositivo embebido: el modelo está diseñado para ejecutarse en un AI Pod basado en Jetson Orin, de modo que se usaría como motor de traducción local en hardware de borde, sin dependencia de la nube, aprovechando la cuantización de 8 bits para reducir el peso en memoria frente al checkpoint FP16 original.
- Integración en pipelines vLLM: al emplear el layout `gptq_marlin`, puede cargarse directamente en vLLM para servir peticiones de traducción con throughput agregado en un servidor con GPU, lo que resulta adecuado para escenarios de traducción por lotes o API interna.
- Evaluación y cualificación de hardware: el autor lo plantea como candidato para la fase de cualificación sobre LPK instalado en el dispositivo, por lo que un uso realista es la validación de rendimiento y estabilidad en el hardware objetivo antes de un despliegue definitivo.
- Traducción de documentación técnica en local: para equipos que necesitan procesar textos confidenciales sin enviarlos a servicios externos, un modelo de traducción ejecutado en hardware propio ofrece confidencialidad y control sobre los datos.
- Prototipado de productos de traducción de bajo consumo: desarrolladores que construyen dispositivos o aplicaciones con restricciones energéticas pueden usar esta variante cuantizada para estimar el rendimiento en un entorno cercano al de producción.
- Investigación sobre cuantización RTN: el repositorio incluye el registro de errores de peso por capa, lo que lo convierte en un artefacto útil para estudiar el impacto de la cuantización RTN de 8 bits frente a GPTQ calibrado en tareas de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona que se han superado "diagnósticos iniciales de traducción y rendimiento", pero no se aportan cifras concretas de BLEU, COMET, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con 14,77 B parámetros en 8 bits, el peso de los tensores cuantizados ronda los 14,8 GB; sumando embeddings, LM head, normalizaciones y bias en su precisión original, el repositorio ocupa 17,6 GB, por lo que se recomienda al menos 18-20 GB de VRAM para cargar el modelo completo sin offloading.
- GPU recomendadas: el destino declarado es Jetson Orin (memoria unificada); en servidor, una GPU con 24 GB o más (RTX 3090, RTX 4090, A10G, L4, A100 40 GB, H100) permite cargar el modelo con holgura.
- ¿Cabe en GPU de consumo? Sí, en RTX 3090/4090 (24 GB) siempre que se reserve memoria para el contexto y el runtime; en GPUs de 16 GB no cabe sin cuantización adicional u offloading.
- Opciones de despliegue: vLLM con backend `gptq_marlin` es la vía documentada; el autor mantiene además un repositorio `Confucius4-T3PO-Runtime` orientado a Jetson. No se confirma soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor advierte de que la compilación nativa en el arranque puede tardar varios minutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Confucius4-T3PO-AIPod-RTN8-G32 (este) | 14,77 B | no disponible | 8 bits RTN, grupos de 32 | Apache-2.0 | Hugging Face (17 descargas) |
| netease-youdao/Confucius4-T3PO (base) | no disponible | no disponible | FP16 (original) | Apache-2.0 | Hugging Face |
| manateelazycat/Confucius4-T3PO-Runtime | no disponible | no disponible | runtime de inferencia | other | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en traducción con alternativas de la misma categoría (por ejemplo, NLLB, M2M-100 o modelos Qwen2 ajustados para traducción). La comparación se limita, por tanto, a aspectos de empaquetado y licencia.

## Limitaciones y advertencias

- Cuantización sin calibración: al usar RTN en lugar de GPTQ con Hessiano, la degradación de calidad puede ser mayor que en una cuantización calibrada; el autor no publica métricas de dicha degradación.
- Estado de cualificación incompleto: el propio autor indica que la cualificación final sobre LPK instalado está pendiente; no debe tratarse como una release lista para producción.
- No es un benchmark de calidad: la model card advierte explícitamente de que el repositorio no constituye una evaluación de calidad de traducción.
- Idiomas no declarados: los metadatos no especifican los pares de idiomas soportados, lo que impide garantizar cobertura para un caso de uso concreto sin consultar el modelo base.
- Contexto desconocido: no se documenta la longitud máxima de contexto, un dato crítico para traducción de documentos largos.
- Riesgo de alucinación: inherente a los modelos generativos; no se aportan evaluaciones de fidelidad traducción fuente-destino.
- Sesgos: no documentados en la información disponible; deben evaluarse a partir del modelo base.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base upstream, así como el archivo `LICENSE` del repositorio.
- Arranque lento: la compilación nativa en el dispositivo puede tardar varios minutos, lo que afecta a escenarios de arranque en frío.
- Madurez: 17 descargas y 0 likes en el momento de la consulta; ecosistema y soporte muy limitados.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/manateelazycat/Confucius4-T3PO-AIPod-RTN8-G32
- Modelo base: https://huggingface.co/netease-youdao/Confucius4-T3PO
- Runtime para AI Pod: https://huggingface.co/manateelazycat/Confucius4-T3PO-Runtime
- Repositorio relacionado AIPod-Image-Turbo: https://huggingface.co/manateelazycat/AIPod-Image-Turbo
- Model card original preservada: `UPSTREAM-README.md` dentro del repositorio del modelo
- Licencia: `LICENSE` dentro del repositorio del modelo
