# cheoso/ornith_ft_v1

## Resumen

Ornith-1.5-9B es un modelo de lenguaje de la familia Ornith-1.5 desarrollada por Ornith AI, una iniciativa centrada en modelos de código de tipo agéntico construidos mediante un bucle de auto-mejora. La familia cubre tres escalados (397B MoE, 35B MoE y 9B), y esta ficha se centra en el adaptador LoRA `cheoso/ornith_ft_v1`, un ajuste supervisado (SFT) publicado por el usuario cheoso sobre la variante densa de 9B parámetros. El repositorio contiene únicamente los pesos del adaptador (0,5 GB), no el modelo completo, y se distribuye en formato safetensors compatible con PEFT.

El modelo base Ornith-1.5-9B se presenta, según la documentación pública de Ornith AI, como un modelo orientado a tareas de código agéntico, con un marco de "self-scaffolding" que se extiende desde Ornith-1.0 hacia un ciclo de auto-mejora donde el propio modelo propone tareas, genera andamiajes específicos y produce rollouts de solución. Esta ficha describe el adaptador a partir de los metadatos disponibles; la model card del autor es una plantilla sin rellenar, por lo que la mayoría de datos de entrenamiento, licencia e idiomas figuran como no disponibles.

La relevancia de este artefacto es doble: por un lado, ejemplifica el flujo habitual de fine-tuning con TRL y Unsloth sobre un modelo abierto de 9B; por otro, su falta de documentación lo convierte en un caso de estudio sobre los riesgos de adoptar adaptadores sin model card. Cualquier evaluación de calidad debe hacerse contra el modelo base, cuyas especificaciones tampoco están detalladas en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer denso Ornith-1.5-9B; arquitectura interna del base no disponible |
| Parametros totales | Modelo base: 9B (según nombre); adaptador: no disponible (repo de 0,5 GB) |
| Parametros activos | No aplica (el base de 9B es denso; la familia incluye variantes MoE de 35B y 397B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el base podría cuantizarse a 4/8 bits, pero no se documenta |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); el base en formato no especificado |
| Libreria | PEFT 0.21.2, TRL, Unsloth, Transformers |
| Tipo de ajuste | SFT (supervised fine-tuning) con LoRA |
| Tamano del repositorio | 0,5 GB |
| Fecha de publicacion | 2026-11-08 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT sobre el checkpoint `ornith-ai/Ornith-1.5-9B`. Los tags del repositorio confirman el uso de PEFT, TRL y Unsloth, lo que sugiere un pipeline de fine-tuning eficiente en memoria, probablemente con cuantización del base durante el entrenamiento y fusión posterior o carga en dos etapas. No se especifican rango del LoRA, alpha, módulos objetivo, número de tokens de entrenamiento, composición del dataset ni hiperparámetros (learning rate, batch size, épocas). Tampoco hay constancia de RLHF, DPO u otras fases de alineación posteriores al SFT.

Del modelo base Ornith-1.5-9B se conoce, por la documentación pública de Ornith AI, que forma parte de una familia entrenada con un marco de auto-mejora que incluye generación de tareas, andamiajes específicos y rollouts de solución, orientado a flujos de código agéntico. No obstante, no se dispone de detalles sobre la arquitectura interna (número de capas, dimensiones, tipo de atención), el volumen de tokens de preentrenamiento ni las innovaciones técnicas concretas del 9B. Toda esta información figura como no disponible.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` indica un ajuste orientado a diálogo.
- Especialización probable en código y tareas agénticas heredada del base Ornith-1.5, según la descripción pública de la familia; no verificable en el adaptador por falta de evaluación.
- Soporte de tool calling / function calling: no disponible en la información del adaptador; podría heredarse del base, pero no está documentado.
- Razonamiento multi-paso y uso como agente: plausible por la orientación del base, sin evidencia publicada para este adaptador.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Experimentación con fine-tuning LoRA: el adaptador sirve como ejemplo práctico de cómo ajustar un modelo de 9B con PEFT, TRL y Unsloth, útil para equipos que quieran replicar el pipeline con sus propios datos.
- Prototipado de asistentes conversacionales: al estar etiquetado como `conversational`, puede emplearse para validar respuestas multi-turno en entornos de desarrollo, siempre comparando contra el base para medir la ganancia real del ajuste.
- Evaluación comparativa de adaptadores: investigadores pueden cargar el LoRA junto al base y medir diferencias en tareas de código o diálogo, aunque sin benchmarks publicados el punto de partida es incierto.
- Base para iteraciones posteriores: el adaptador puede servir como punto de partida para un segundo ciclo de SFT o DPO, dado que se distribuye en formato PEFT estándar y es compatible con el ecosistema Hugging Face.
- Docencia y formación técnica: útil en talleres sobre fine-tuning eficiente, donde el tamaño de 0,5 GB del adaptador facilita su distribución y carga en entornos limitados.
- Integración en pipelines de generación de texto: mediante Transformers y PEFT puede desplegarse en servicios de inferencia, aunque sin datos de latencia ni throughput la planificación de capacidad requiere medición previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para el adaptador: el adaptador ocupa 0,5 GB en disco; en inferencia se carga junto al base de 9B.
- VRAM estimada para el base en bf16: aproximadamente 18 GB de pesos, más overhead de activaciones y KV cache.
- VRAM estimada para el base en 4 bits: en torno a 5-6 GB de pesos, más overhead; no confirmado por el autor.
- GPU recomendadas: A100 40/80 GB o H100 para bf16 sin cuantizar; RTX 4090 (24 GB) viable en bf16 ajustado o 8 bits; RTX 3090/4080 con cuantización 4 bits.
- Cabe en GPU de consumo: probablemente sí con cuantización 4 bits en GPUs de 8-12 GB, aunque no está verificado para este adaptador.
- Opciones de despliegue: Transformers + PEFT (ruta natural), vLLM o TGI tras fusionar el adaptador con el base, llama.cpp u Ollama si se genera un GGUF del modelo fusionado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cheoso/ornith_ft_v1 (este) | 9B (base) + LoRA | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador SFT sin model card |
| Ornith-1.5-9B (base) | 9B | no disponible | no disponible | Hugging Face (ornith-ai) | Modelo denso de la familia Ornith-1.5 |
| Ornith-1.5-35B MoE | 35B MoE | no disponible | no disponible | Referenciado en ornith.ai | Variante MoE de mayor escala |
| Ornith-1.5-397B MoE | 397B MoE | no disponible | no disponible | Referenciado en ornith.ai | Variante MoE de máxima escala |

No se dispone de datos de rendimiento ni de especificaciones detalladas de contexto y licencia para establecer una comparación cuantitativa con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Model card vacía: el autor no ha rellenado ninguna sección, por lo que se desconoce el dataset, los hiperparámetros y la evaluación del ajuste.
- Licencia no especificada: no puede confirmarse el uso comercial ni la redistribución; además, la licencia del modelo base debe verificarse por separado.
- Sin benchmarks: no hay evidencia de que el adaptador mejore al base; podría degradar capacidades si el dataset de SFT era pequeño o sesgado.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluación no puede acotarse.
- Idiomas no declarados: no se garantiza un rendimiento adecuado en castellano u otros idiomas distintos del inglés.
- Contexto desconocido: impide planificar casos de uso con documentos largos o conversaciones extensas.
- Sesgos: no documentados; el SFT puede amplificar sesgos presentes en el dataset de ajuste.
- Cero descargas y cero likes: sin validación comunitaria que sirva como señal de calidad.
- Producción: no recomendable sin una evaluación propia contra el base y sin claridad sobre la licencia.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/cheoso/ornith_ft_v1
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Sitio oficial de Ornith AI: https://ornith.ai/
- Guía de Ornith AI: https://ornith.online/
- Referencia del calculador de impacto (citada en la model card): https://mlco2.github.io/impact#compute
- Paper citado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
