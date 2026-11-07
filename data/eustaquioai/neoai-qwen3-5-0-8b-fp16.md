# EustaquioAI/neoai-qwen3.5-0.8b-fp16

## Resumen

NeoAI Qwen 3.5 0.8B FP16 es una conversión a precisión FP16 del modelo Qwen3.5-0.8B, publicada por el usuario EustaquioAI en Hugging Face. No se trata de un modelo entrenado desde cero ni de un ajuste fino: la model card indica explícitamente "Additional training: None". El único cambio respecto al original es la conversión de formato y precisión para permitir la inferencia local con MLX, el framework de Apple para Apple Silicon, dentro de la aplicación NeoAI.

El modelo subyacente, Qwen3.5-0.8B, pertenece a la familia Qwen3.5 de Alibaba Cloud, descrita en la documentación pública como una serie multilingüe con capacidades mejoradas de razonamiento y seguimiento de instrucciones respecto a Qwen3. La variante de 0.8B está pensada para despliegue en el borde (edge), según Qualcomm AI Hub. Los pesos del repositorio suman 752.393.024 parámetros reales en safetensors, ligeramente por debajo de la denominación comercial de 0.8B.

La relevancia de esta ficha es doble: por un lado, documenta una conversión concreta con licencia Apache 2.0 y formato MLX; por otro, sirve de referencia para quien necesite ejecutar un modelo de menos de mil millones de parámetros en hardware Apple sin depender de la nube. La información disponible sobre el modelo original es escasa en la documentación proporcionada, por lo que varios apartados técnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles de capas y atención no disponibles) |
| Parametros totales | 752.393.024 (según safetensors); el modelo base se denomina comercialmente 0.8B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 en este repositorio; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (la serie Qwen3.5 se describe como multilingüe, sin lista concreta) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (conversión MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3.5 y de la etiqueta `qwen3_5` en los metadatos. Se trata, por tanto, de un transformer de la serie Qwen3.5, pero no se especifican número de capas, dimensión oculta, mecanismo de atención ni estrategia de tokenización. Tampoco se documenta si el modelo original incorpora innovaciones como atención lineal, decodificación especulativa o modos de razonamiento extendido.

Respecto al entrenamiento, la model card de esta conversión es explícita: no hay entrenamiento adicional. El repositorio es una conversión de precisión a FP16 del checkpoint original Qwen/Qwen3.5-0.8B, empaquetada para MLX. No se aportan datos sobre el corpus de preentrenamiento del modelo base, número de tokens, composición del dataset ni si hubo fases de RLHF o DPO. Cualquier afirmación sobre estos puntos requeriría consultar la documentación oficial de Qwen, que no forma parte de la información proporcionada.

## Capacidades

- Generación de texto y seguimiento de instrucciones: heredadas del modelo base Qwen3.5-0.8B, descrito por Qualcomm AI Hub como modelo con razonamiento y seguimiento de instrucciones mejorados frente a Qwen3.
- Capacidades multilingües: la serie Qwen3.5 se presenta como multilingüe, aunque no se detalla la lista de idiomas soportados.
- Razonamiento: la documentación de Qualcomm menciona mejoras en razonamiento respecto a la generación anterior, sin cuantificar.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible. La ficha de Hugging Face del modelo original lo etiqueta como "Image-Text-to-Text", pero esta conversión no documenta procesamiento de imagen; conviene tratar esa etiqueta con cautela.
- Inferencia local en Apple Silicon: capacidad operativa de esta conversión gracias al formato MLX.

## Casos de uso

- Asistente local en macOS: el modelo se ejecuta con MLX en Apple Silicon, lo que permite integrarlo en una aplicación de escritorio (como NeoAI) sin enviar datos a la nube y con latencia baja por su reducido tamaño.
- Clasificación y etiquetado de texto en el dispositivo: con menos de 800 millones de parámetros, es viable procesar lotes de textos cortos en local para tareas de categorización, extracción de entidades o moderación básica.
- Generación de borradores y resúmenes: útil para resumir correos, notas o documentos breves en flujos personales donde la privacidad prima sobre la calidad máxima.
- Prototipado rápido de aplicaciones de IA: sirve como modelo de referencia para validar pipelines de inferencia MLX antes de escalar a modelos mayores de la misma familia.
- Educación y experimentación: su tamaño permite ejecutarlo en portátiles Apple con memoria unificada moderada, lo que lo hace adecuado para demostraciones y cursos sobre despliegue local de LLM.
- Preprocesado en pipelines más grandes: puede actuar como modelo auxiliar para reformatear, limpiar o reescribir texto antes de pasarlo a un modelo de mayor capacidad.
- Aplicaciones sin conectividad: escenarios de campo o entornos aislados donde no hay acceso a APIs externas y se requiere generación de texto básica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de la conversión ni los resultados de búsqueda proporcionados incluyen cifras de MMLU, HumanEval, GSM8K u otras evaluaciones para Qwen3.5-0.8B o para esta conversión FP16.

## Requisitos de hardware

- VRAM/memoria estimada: con 752.393.024 parámetros en FP16 (2 bytes por parámetro), los pesos ocupan aproximadamente 1,5 GB, coherente con el tamaño del repositorio (1,5 GB). A ello hay que sumar memoria para el contexto y el runtime de MLX.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4 y posteriores). No se documenta soporte para GPU NVIDIA o AMD en esta conversión.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada; 8 GB de memoria unificada deberían ser suficientes para los pesos, con margen limitado para contextos largos.
- Opciones de despliegue: MLX (librería indicada en los metadatos). El uso con vLLM, llama.cpp, Ollama o TGI requeriría convertir los pesos a otro formato, algo no documentado en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NeoAI Qwen3.5-0.8B FP16 (esta ficha) | 752 M | no disponible | Apache 2.0 | safetensors MLX | Conversión sin entrenamiento adicional |
| Qwen/Qwen3.5-0.8B | ~0.8B (0.9B según HF) | no disponible | Apache 2.0 | no disponible | Modelo original de Qwen Team |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se han identificado en la información proporcionada otros modelos comparables con datos verificables (por ejemplo, variantes de Llama, Gemma o Phi de tamaño similar), por lo que la comparativa se limita al modelo original.

## Limitaciones y advertencias

- Alucinación: al ser un modelo de menos de mil millones de parámetros, la propensión a generar contenido plausible pero incorrecto es alta; no debe usarse como fuente de verdad sin verificación.
- Sesgos: no se documentan evaluaciones de sesgo para esta conversión ni para el modelo base en la información disponible.
- Contexto e idiomas: se desconoce la longitud máxima de contexto y la cobertura idiomática real; la afirmación "multilingüe" de la serie no viene acompañada de lista de idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda conservar la atribución al modelo original Qwen/Qwen3.5-0.8B tal como pide la model card.
- Compatibilidad: los pesos están en formato MLX; no son directamente utilizables en frameworks como vLLM o llama.cpp sin conversión previa.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, y ausencia de pipeline declarado; conviene tratar esta conversión como no validada por la comunidad.
- Etiqueta "Image-Text-to-Text": la ficha del modelo original sugiere capacidades de imagen, pero esta conversión no documenta procesamiento multimodal; no asumir visión sin verificación.
- Precisión FP16: puede haber diferencias numéricas menores frente al checkpoint original en BF16 u otras precisiones, aunque no se documentan evaluaciones al respecto.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/EustaquioAI/neoai-qwen3.5-0.8b-fp16
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
