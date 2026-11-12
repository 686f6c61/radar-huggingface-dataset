# ApocalypseParty/G4-31B-c50xOPT-flat30

## Resumen

G4-31B-c50xOPT-flat30 es un modelo de lenguaje multimodal de tipo image-text-to-text obtenido mediante la fusión de pesos de dos modelos preentrenados de la familia G4 (31B) del mismo autor, ApocalypseParty. No se trata de un modelo entrenado desde cero, sino de un merge lineal (Linear merge, según el paper arXiv:2203.05482) que combina los pesos de G4-31B-M_OPT31 (peso 0,3) y G4-mmv2-31B-Style-c50 (peso 0,7), con normalización activada y salida en bfloat16.

El resultado es un checkpoint de 31.273.088.876 parámetros (aproximadamente 31,3B) empaquetado en safetensors, con un repositorio de 62,6 GB, lo que sugiere pesos en bfloat16 sin cuantizar. La arquitectura subyacente es de tipo transformer con capacidad de procesamiento de imagen y texto (pipeline image-text-to-text), derivada de la familia Gemma 4 según los tags del repositorio.

Su relevancia es limitada y muy específica: se publica como experimento de merging dentro del ecosistema mergekit, sin model card descriptiva más allá de la configuración del merge, sin datos de entrenamiento propios, sin benchmarks y sin licencia declarada. Es útil para quien quiera reproducir o analizar el efecto de mezclar un modelo orientado a instrucciones/razonamiento (OPT31) con un modelo afinado en estilo (Style-c50) sobre una base multimodal de 31B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Gemma 4 (según tags) |
| Parametros totales | 31.273.088.876 (31,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo; pesos publicados en bfloat16 (out_dtype del merge) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado: es el resultado de un merge lineal de pesos con mergekit. La configuración declarada aplica pesos de 0,7 a ApocalypseParty/G4-mmv2-31B-Style-c50 y de 0,3 a ApocalypseParty/G4-31B-M_OPT31, con `normalize: true`, cálculo en float32 y salida en bfloat16. El método Linear (arXiv:2203.05482) promedia los tensores de ambos checkpoints de forma ponderada, de modo que la arquitectura final es idéntica a la de los modelos de origen.

Por los nombres y tags se deduce una base multimodal de 31B de la familia Gemma 4, con una variante orientada a instrucciones y optimización (M_OPT31) y otra orientada a estilo (mmv2-31B-Style-c50). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste multimodal específico en los modelos de origen; tampoco se documenta ninguna innovación técnica adicional más allá del propio merge.

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), heredado de la base multimodal.
- Razonamiento e instrucciones generales, presumiblemente heredados del componente M_OPT31.
- Estilo de respuesta modulado por el componente Style-c50 (peso mayoritario, 0,7).
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue vía Inference Endpoints.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentación con merging de modelos: reproducir la receta YAML publicada y analizar cómo varía el comportamiento al ajustar los pesos 0,7/0,3 entre el componente de estilo y el de instrucciones.
- Evaluación comparativa de merges multimodales: usar el checkpoint como punto de referencia frente a los modelos de origen (G4-31B-M_OPT31 y G4-mmv2-31B-Style-c50) en tareas de image-text-to-text.
- Generación de descripciones de imagen con tono estilizado: el peso dominante del componente Style-c50 sugiere un uso para captioning o diálogo sobre imágenes con un registro controlado, previa validación empírica.
- Prototipado de asistentes conversacionales multimodales: al ser compatible con transformers y endpoints, sirve para montar demos internas de chat con entrada de imagen y texto.
- Investigación sobre degradación por merge: útil para estudiar si el promedio lineal de un modelo de instrucciones y uno de estilo preserva las capacidades originales o introduce regresiones.
- Base para futuros merges o fine-tuning: al estar en safetensors y bfloat16, puede servir como punto de partida para experimentos posteriores con mergekit o PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 62-65 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 32-35 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 17-20 GB (requiere generar los pesos GGUF/AWQ, no incluidos en el repo).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bfloat16; A100 40 GB o RTX 6000 Ada en 8 bits; RTX 4090 24 GB solo en 4 bits y con contexto reducido.
- ¿Cabe en GPU de consumo? En bfloat16 no. En 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con margen ajustado.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI si la arquitectura Gemma 4 está soportada, llama.cpp/Ollama previa conversión a GGUF, y Hugging Face Inference Endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G4-31B-c50xOPT-flat30 | 31,3B | no disponible | imagen + texto | no disponible | Hugging Face (0 descargas) |
| ApocalypseParty/G4-31B-M_OPT31 | ~31B (no confirmado) | no disponible | no disponible | no disponible | Hugging Face |
| ApocalypseParty/G4-mmv2-31B-Style-c50 | ~31B (no confirmado) | no disponible | multimodal (por nombre) | no disponible | Hugging Face |
| Gemma 4 (base de referencia) | no disponible | no disponible | multimodal | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no hay información sobre datos de entrenamiento, evaluación, sesgos o comportamiento esperado.
- Licencia no declarada: no se puede asumir uso comercial; es imprescindible verificar la licencia de los modelos de origen (Gemma 4 y los checkpoints de ApocalypseParty) antes de cualquier despliegue.
- Riesgo elevado de alucinación y de degradación de capacidades: el merge lineal ponderado puede diluir habilidades del componente minoritario (0,3) sin garantía de preservarlas.
- Idiomas no declarados: no hay certeza sobre el soporte multilingüe ni sobre la calidad en castellano.
- Contexto no documentado: se desconoce la ventana máxima efectiva tras el merge.
- Repositorio sin descargas ni likes y publicaciones del mismo día (creado y actualizado en 2026-11-12): no hay evidencia de validación por la comunidad.
- Sin cuantizaciones publicadas: el despliegue en hardware de consumo requiere conversión manual a GGUF/AWQ/GPTQ.
- Al ser un merge de dos checkpoints del mismo autor con nomenclatura críptica, la trazabilidad de los datos y del proceso de entrenamiento original es nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApocalypseParty/G4-31B-c50xOPT-flat30
- Modelo base 1: https://huggingface.co/ApocalypseParty/G4-31B-M_OPT31
- Modelo base 2: https://huggingface.co/ApocalypseParty/G4-mmv2-31B-Style-c50
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Paper del método Linear merge: https://arxiv.org/abs/2203.05482
