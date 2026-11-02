# Prience91/Climate-1000-Granite-0.35b

## Resumen

Climate-1000-Granite-0.35b es un ajuste fino supervisado (SFT) del modelo IBM Granite 4.0-H-350M, desarrollado por el usuario Prience91 y publicado en HuggingFace. Se trata de un merge en BF16 de un adaptador LoRA sobre el modelo base, orientado a tareas de investigación climática y respuesta a preguntas fundamentadas en evidencia (RAG). El modelo conserva la arquitectura híbrida Mamba-Transformer del Granite original y está pensado como un modelo compacto y especializado en dominio climático.

El modelo resuelve el problema de adaptar un modelo de lenguaje pequeño y de propósito general a un dominio técnico concreto (clima y ciencias medioambientales) mediante un conjunto de datos curado de 3.665 ejemplos de entrenamiento y 406 de validación, con 100 artículos reservados como heldout. El resultado es un checkpoint de 340.332.224 parámetros (aproximadamente 0,34 mil millones) que se distribuye como safetensors en BF16 sin necesidad de cargar un adaptador separado.

Su relevancia radica en la combinación de tamaño reducido, licencia Apache-2.0 y especialización de dominio, lo que lo hace adecuado para despliegues con recursos limitados y para pipelines de RAG donde se inyecta evidencia en el prompt. No obstante, el autor advierte explícitamente de que el modelo no ha sido evaluado sobre el conjunto heldout y de que la precisión de tokens en validación no equivale a corrección científica ni factual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Transformer (granitemoehybrid), derivada de IBM Granite 4.0-H-350M |
| Parámetros totales | 340.332.224 |
| Parámetros activos | no disponible (no se especifica comportamiento MoE en la información) |
| Longitud de contexto | 8.192 tokens en entrenamiento; configuración base heredada soporta 32.768 posiciones (no evaluado) |
| Tipos de cuantización | no disponible en la información (pesos publicados en BF16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de IBM Granite 4.0-H-350M, una arquitectura híbrida que combina capas Mamba con mecanismos de atención tipo Transformer (etiquetada como `granitemoehybrid` en HuggingFace). El ajuste fino se realizó mediante SFT con pérdida calculada únicamente sobre los tokens de completación (completion-only SFT), utilizando el dataset v17-Turbo Climate-1000: 3.665 ejemplos de entrenamiento y 406 de validación, con 100 artículos reservados como heldout excluidos de ambos conjuntos.

El entrenamiento consistió en 460 pasos de optimizador durante dos épocas, con microbatch 1 y acumulación de gradiente 16, longitud máxima de secuencia de 8.192 tokens y semilla 3407. Se aplicó LoRA all-linear con rango 32, alpha 64 y dropout 0,05, lo que supone 14.297.088 parámetros entrenables sobre una base BF16 congelada. Se usó AdamW fused con learning rate 1e-4, decaimiento lineal, sin warmup ni weight decay. Se seleccionó el checkpoint 450 por mínima pérdida de validación (0,80336410), con una precisión media de token en validación del 78,7187%. El merge se acumuló en FP32 antes de exportar a BF16, verificando las 136 matrices de proyección adaptadas y comprobando los logits FP32 antes y después de la exportación.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat (`apply_chat_template`).
- Respuesta a preguntas sobre dominio climático y ciencias medioambientales cuando se proporciona evidencia en el prompt (RAG).
- Razonamiento básico y síntesis de información a partir de contexto inyectado.
- Soporte de conversaciones multi-turno mediante plantilla de chat.
- Capacidad de contexto extendido hasta 8.192 tokens (límite de entrenamiento); la configuración base admite 32.768 posiciones, aunque no se ha evaluado el comportamiento en esa extensión.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información.

## Casos de uso

- Respuesta a preguntas climáticas con RAG: el modelo está diseñado para recibir evidencia relevante en el prompt y generar respuestas fundamentadas; su ventana de 8.192 tokens permite incluir varios fragmentos de documentos científicos junto con la pregunta.
- Asistente de investigación documental: dado su ajuste sobre 3.665 ejemplos de dominio climático, puede emplearse para resumir o sintetizar pasajes de literatura medioambiental inyectados en el contexto.
- Clasificación y extracción de información climática: al ser un modelo pequeño y rápido, puede integrarse en pipelines de preprocesado de corpus científicos para etiquetar o extraer entidades y relaciones.
- Prototipado de chatbots especializados: su tamaño de 340 millones de parámetros y licencia Apache-2.0 permiten desplegarlo en entornos con recursos limitados para validar flujos conversacionales antes de escalar a modelos mayores.
- Generación de borradores de respuestas en inglés para portales de divulgación climática, siempre con revisión humana y con la evidencia aportada en el prompt.
- Componente de un sistema RAG educativo: combinado con un recuperador vectorial externo (el modelo no consulta bases de datos por sí mismo), puede servir para responder preguntas de estudiantes sobre cambio climático citando las fuentes inyectadas.
- Evaluación comparativa de ajustes de dominio: sirve como referencia para estudiar el efecto de LoRA sobre Granite 4.0-H-350M en tareas especializadas y con presupuesto computacional reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas de validación del proceso de SFT:

| Métrica | Valor |
|---|---|
| Pérdida de validación (checkpoint 450) | 0,80336410 |
| Precisión media de token en validación | 78,7187% |
| Pasos de optimizador | 460 (dos épocas) |
| Ejemplos de entrenamiento | 3.665 |
| Ejemplos de validación | 406 |

El autor advierte explícitamente de que estas métricas no constituyen una evaluación sobre el conjunto heldout ni miden corrección científica o factual.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 0,7 GB para los pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica, cabe holgadamente en GPUs con 4 GB o más.
- En cuantización de 8 bits o 4 bits (no publicada oficialmente, pero factible con herramientas estándar) el consumo de pesos bajaría por debajo de 0,4 GB, aunque no se han validado estos formatos en la información disponible.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo; para despliegue en servidor, A100 o H100 son sobredimensionadas para este tamaño, pero válidas para servir múltiples instancias.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers (probado con Transformers 5.15.1, PEFT 0.19.1 y PyTorch 2.11.0); otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponibles en la información.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Climate-1000-Granite-0.35b | 340.332.224 | 8.192 (entrenamiento); 32.768 base sin evaluar | Apache-2.0 | Clima (SFT sobre Granite 4.0-H-350M) | HuggingFace |
| ibm-granite/granite-4.0-h-350m (base) | ~350M | 32.768 posiciones (según configuración base) | Apache-2.0 | Propósito general | HuggingFace |
| Modelos climáticos ajustados de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base del que deriva, ya que no se dispone de información sobre otros ajustes climáticos comparables en el material proporcionado.

## Limitaciones y advertencias

- El modelo no ha sido evaluado sobre el conjunto heldout; no existen afirmaciones de rendimiento heldout en la model card.
- La precisión media de token en validación (78,7187%) no equivale a corrección científica ni a exactitud factual.
- Riesgo de alucinación: el autor advierte de que el modelo puede inventar información, omitir detalles importantes o atribuir mal la evidencia.
- El modelo no consulta automáticamente una base de datos vectorial; requiere que la evidencia se inyecte manualmente en el prompt para RAG.
- El entrenamiento se realizó con un techo de 8.192 tokens; el comportamiento en contextos más largos (hasta 32.768 posiciones de la configuración base) no se ha evaluado.
- Idiomas: únicamente inglés según la model card; no se garantiza calidad en castellano ni en otros idiomas.
- Sesgos conocidos: no disponibles en la información; al derivar de un modelo de propósito general, puede heredar sesgos del corpus original de Granite.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar la atribución de IBM Granite en el fichero NOTICE.
- El nombre "0.35b" hace referencia al tamaño nominal del modelo base, no a un recuento exacto de parámetros (340.332.224).
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Prience91/Climate-1000-Granite-0.35b
- Adaptador LoRA de origen: https://huggingface.co/Prience91/Climate-1000-Granite-0.35b-adapter
- Modelo base IBM Granite 4.0-H-350M: https://huggingface.co/ibm-granite/granite-4.0-h-350m
- Revisión del modelo base referenciada: 3b17b717b8f2f5d305b0a92c1491e239aeda19c8
- Ficheros de procedencia y verificación citados en la model card: `training_provenance.json`, `SHA256SUMS`, `merge_validation.json` (incluidos en el repositorio del modelo)
