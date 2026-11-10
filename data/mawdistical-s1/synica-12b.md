# Mawdistical-S1/Synica-12B

## Resumen

Synica-12B es un modelo multimodal de tipo image-text-to-text publicado por el usuario Mawdistical-S1 en Hugging Face. Se trata de un fine-tuning del modelo base google/gemma-4-12B, realizado con las herramientas Axolotl y Axolotl Forge, y entrenado para tareas que combinan entrada de imagen y texto con generacion de texto. El repositorio contiene 11.959.730.224 parametros en formato safetensors y ocupa 24,0 GB, lo que es coherente con un transformer denso de aproximadamente 12 mil millones de parametros en precision bf16/fp16.

El modelo se distribuye bajo acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de poder descargar los pesos. No se especifica la licencia concreta en la informacion disponible, por lo que cualquier uso comercial debe verificarse directamente en la pagina del repositorio. Tampoco se detallan los idiomas soportados ni el conjunto de datos de entrenamiento.

Su relevancia actual es limitada pero concreta: se trata de un fine-tuning comunitario sobre una arquitectura Gemma de cuarta generacion, orientado a tareas multimodales, y puede resultar de interes para quienes quieran evaluar adaptaciones especificas sobre dicho modelo base sin partir de cero. Al no haber benchmarks publicados ni documentacion tecnica detallada, debe tratarse como un modelo experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de google/gemma-4-12B; tag de arquitectura gemma4_unified |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 24,0 GB |
| Pipeline | image-text-to-text |
| Modelo base | google/gemma-4-12B |
| Herramientas de entrenamiento | Axolotl, Axolotl Forge |
| Acceso | restringido (gated) |
| Libreria | transformers |

## Arquitectura y entrenamiento

La informacion disponible indica que Synica-12B es un fine-tuning del modelo google/gemma-4-12B, con tags que apuntan a una arquitectura `gemma4_unified` y a un pipeline de image-text-to-text. Esto implica un transformer multimodal capaz de procesar imagenes y texto de forma conjunta y generar texto como salida. El numero de parametros (11,96 mil millones) y el tamano del repositorio (24 GB) son consistentes con pesos en precision de 16 bits.

El entrenamiento se realizo con Axolotl y Axolotl Forge, herramientas de fine-tuning ampliamente usadas en la comunidad, y el repositorio incluye el tag `generated_from_trainer`, lo que confirma que se trata de un modelo derivado de un proceso de entrenamiento supervisado. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, la congelacion de capas ni ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.). Tampoco se detalla si el adaptador de vision fue reentrenado o congelado durante el fine-tuning.

## Capacidades

- Generacion de texto condicionada por imagen y texto (image-text-to-text), segun el pipeline declarado.
- Procesamiento de conversaciones multimodales de tipo visual question answering, a falta de documentacion que lo confirme con detalle.
- Generacion de texto general y razonamiento, heredados del modelo base Gemma, aunque sin validacion publicada en este fine-tuning.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declaran idiomas.
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Descripcion automatica de imagenes en catalogos internos: el modelo puede recibir una imagen y generar una descripcion textual, util para etiquetado de productos o activos digitales, aunque requiere validacion previa por la ausencia de benchmarks.
- Respuesta a preguntas sobre documentos escaneados: al ser image-text-to-text, puede emplearse para extraer informacion de capturas o formularios, siempre que el contexto de imagen sea compatible con la ventana del modelo base.
- Prototipado de asistentes visuales: util para experimentar con interfaces conversacionales que combinan imagen y texto en entornos de investigacion, dado su caracter experimental.
- Evaluacion comparativa de fine-tunings sobre Gemma: sirve como punto de partida para estudiar como afecta el ajuste con Axolotl al comportamiento multimodal del modelo base.
- Generacion de texto asistida por capturas en herramientas internas: por ejemplo, resumir el contenido de una captura de pantalla en un flujo de soporte tecnico.
- Investigacion academica sobre adaptaciones multimodales: permite reproducir y analizar el efecto de un fine-tuning comunitario sobre una arquitectura Gemma de cuarta generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 24 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 32-40 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 12-14 GB de pesos, con overhead adicional.
- VRAM estimada en cuantizacion de 4 bits: en torno a 7-8 GB de pesos, con overhead adicional; no se confirma que existan GGUF oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia en precision completa; RTX 4090 (24 GB) puede ser insuficiente en bf16 para contextos largos.
- GPU de consumo: posible en RTX 3090/4090 solo con cuantizacion agresiva y verificando compatibilidad del pipeline multimodal.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synica-12B | 11,96 B | no disponible | image-text-to-text | no disponible | gated en Hugging Face |
| google/gemma-4-12B (base) | ~12 B | no disponible en la informacion | multimodal (segun base) | no disponible en la informacion | modelo base referenciado |
| Fine-tunings comunitarios de Gemma de ~12 B | ~12 B | variable | texto o multimodal | variable | publicos en Hugging Face |

No se dispone de datos de rendimiento comparativo entre Synica-12B y alternativas, por lo que la comparativa se limita a parametros, modalidad y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que no debe desplegarse en produccion sin evaluacion propia.
- Licencia no especificada: el uso comercial es incierto y debe consultarse en el repositorio; ademas, al derivar de google/gemma-4-12B, pueden aplicarse las condiciones del modelo base.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la integracion automatizada.
- Idiomas no declarados: no se puede garantizar un comportamiento multilingue adecuado.
- Longitud de contexto no documentada: limita la planificacion de casos con documentos o conversaciones largas.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la falta de validacion especifica del fine-tuning.
- Sesgos potenciales heredados del modelo base y del dataset de ajuste, no documentados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- No se confirma soporte de tool calling, agentes ni cuantizaciones listas para usar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mawdistical-S1/Synica-12B
- Modelo base referenciado: https://huggingface.co/google/gemma-4-12B
- Axolotl (herramienta de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Axolotl Forge: no disponible en la informacion proporcionada
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
