# cybertronak/safecompress-tiny-aya-global-recipes

## Resumen

SafeCompress recipes for Tiny Aya Global es un conjunto de recetas de compresión de precisión mixta orientadas a preservar el comportamiento de rechazo (refusal) de un modelo multilingüe. Lo publica el usuario cybertronak sobre el modelo base CohereLabs/tiny-aya-global, un transformer multilingüe de Cohere Labs. El repositorio no contiene pesos: incluye un fichero de recetas por capas (`recipes.json`) y un cargador (`load_safecompress.py`) que aplica la configuración sobre el modelo base, que está sujeto a gating y debe descargarse aparte.

La propuesta técnica consiste en mantener cinco capas del decodificador en FP16 o INT8 y cuantizar el resto a NF4 mediante bitsandbytes. La hipótesis es que las capas identificadas como parte del circuito de rechazo concentran la sensibilidad de seguridad, de modo que protegerlas evita la degradación del comportamiento de negativa ante peticiones dañinas que provoca la cuantización uniforme a 4 bits. Es relevante para quienes despliegan modelos pequeños multilingües en hardware limitado y necesitan mantener salvaguardas sin pagar el coste completo en memoria de un modelo en FP16.

El resultado principal reportado por el autor: con 200 prompts dañinos y 200 benignos en inglés e hindi, la tasa de rechazo en FP16 es 0,655 y en 4 bits uniforme 0,605; la mejor configuración protegida (`E0_FP16`) mantiene 0,655 con un peso de 6,70 GB, frente a 2,53 GB del 4 bits uniforme. La información disponible no detalla el tamaño del modelo base ni su ventana de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo base CohereLabs/tiny-aya-global); compresion por capas con precision mixta |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (bitsandbytes) para la mayoria de capas; FP16 o INT8 en cinco capas del decodificador |
| Idiomas soportados | Ingles e hindi evaluados explicitamente (Global-MMLU, Belebele, prompts de seguridad EN/HI); el modelo base es multilingue, cobertura completa no disponible |
| Licencia | no disponible |
| Formato de pesos | No incluye pesos; recetas en JSON (`recipes.json`) y cargador en Python (`load_safecompress.py`) sobre el modelo base en safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo nuevo: define una política de compresión sobre CohereLabs/tiny-aya-global. La política selecciona cinco capas del decodificador que se mantienen en FP16 o INT8 y aplica cuantización NF4 de bitsandbytes al resto de la red. La selección de capas no es arbitraria: según el autor, se obtiene con CircuitKIT mediante descubrimiento del circuito de rechazo y ranking de capas, y la evaluación independiente del rechazo se realiza con AuditKIT. No se especifican en la información disponible los datos de entrenamiento del modelo base, el número de tokens, ni si hubo RLHF o DPO.

La innovación es metodológica: sustituir la cuantización uniforme por una asignación de precisión guiada por interpretabilidad, de forma que las capas críticas para la negativa ante contenido dañino conserven mayor fidelidad numérica. El repositorio separa explícitamente las recetas (qué capas y en qué precisión) del cargador (cómo aplicarlas), lo que permite reproducir el experimento sobre el modelo base sin redistribuir pesos. Los resultados completos, con tablas e intervalos de confianza emparejados, se publican en el dataset `cybertronak/safecompress-layerlab-results`.

## Capacidades

- Generación de texto multilingüe heredada del modelo base tiny-aya-global, con evaluación explícita en inglés e hindi.
- Comprensión lectora multilingüe evaluada con Belebele en EN y HI.
- Conocimiento multilingüe evaluado con Global-MMLU en EN y HI.
- Comportamiento de rechazo ante prompts dañinos, medido con 200 prompts dañinos y 200 benignos en EN/HI.
- Compresión configurable por capas: permite generar variantes del modelo con distinta precisión sin reentrenar.
- Carga programática mediante `load_safecompress.py` sobre el modelo base con gating.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Despliegue de un modelo multilingüe pequeño en GPU de consumo: aplicar la receta `E0_FP16` permite mantener la tasa de rechazo de FP16 (0,655) con 6,70 GB en lugar del peso completo en FP16, útil cuando la VRAM es el cuello de botella pero la seguridad no es negociable.
- Investigación en seguridad y cuantización: el repositorio sirve como base reproducible para estudiar cómo afecta la precisión numérica por capas al comportamiento de rechazo, con recetas y cargador separados.
- Auditoría de salvaguardas en modelos comprimidos: usar AuditKIT junto con las recetas para verificar de forma independiente que una variante cuantizada conserva la negativa ante prompts dañinos antes de promoverla a producción.
- Evaluación multilingüe EN/HI: emplear los conjuntos Global-MMLU y Belebele en inglés e hindi para medir la degradación de calidad al pasar de FP16 a NF4 con capas protegidas.
- Prototipado con restricciones de memoria: la variante de 4 bits uniforme (2,53 GB) sirve para experimentación rápida, aceptando la caída de rechazo de 0,655 a 0,605 documentada por el autor.
- Estudio de circuitos de rechazo: replicar el ranking de capas con CircuitKIT sobre otros modelos base para comprobar si la concentración de sensibilidad de seguridad en pocas capas es un patrón general.
- Comparación de políticas de compresión: usar las recetas como línea base frente a otras estrategias de cuantización mixta en modelos multilingües pequeños.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (200 prompts dañinos y 200 benignos en EN/HI):

| Metrica | FP16 | 4 bits uniforme | `E0_FP16` (protegida) |
|---|---|---|---|
| Tasa de rechazo ante prompts dañinos | 0,655 | 0,605 | 0,655 |
| Peso del modelo | 6,70 GB | 2,53 GB | 6,70 GB |

No se han publicado en la información disponible resultados numéricos de Global-MMLU ni de Belebele, solo la mención de que se evaluaron. Las tablas completas con intervalos de confianza emparejados están en el dataset `cybertronak/safecompress-layerlab-results`.

## Requisitos de hardware

- VRAM estimada: 6,70 GB para la variante `E0_FP16`; 2,53 GB para la variante de 4 bits uniforme. El peso en FP16 del modelo base completo no se especifica en la información disponible.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, la variante de 6,70 GB encaja en GPUs de 8 GB o más; la de 2,53 GB en GPUs de 4 GB o más.
- GPU de consumo: ambas variantes caben en tarjetas consumer de gama media y alta con suficiente VRAM; no se detallan modelos concretos.
- Opciones de despliegue: el cargador `load_safecompress.py` aplica la receta con bitsandbytes sobre el modelo base. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la cuantización NF4 de bitsandbytes no es directamente portable a esos motores sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| safecompress-tiny-aya-global-recipes | no disponible (base tiny-aya-global) | no disponible | Recetas de cuantización mixta con capas protegidas | no disponible | Hugging Face, sin pesos (requiere modelo base con gating) |
| CohereLabs/tiny-aya-global | no disponible | no disponible | Modelo base multilingüe sin comprimir | no disponible | Hugging Face, con gating |
| Cuantización uniforme 4 bits (bitsandbytes) | mismo modelo base | no disponible | NF4 en todas las capas | según modelo base | Ampliamente disponible como técnica |

No se dispone en la información proporcionada de datos suficientes para comparar con otros modelos de tamaño o tarea similares.

## Limitaciones y advertencias

- El repositorio no contiene pesos: sin acceso al modelo base CohereLabs/tiny-aya-global (sujeto a gating) las recetas no son utilizables.
- La licencia no está declarada en la información disponible; no puede asumirse uso comercial sin verificar la del modelo base.
- La evaluación de seguridad se limita a 200 prompts dañinos y 200 benignos en inglés e hindi; no cubre otros idiomas ni otras categorías de daño.
- La variante de 4 bits uniforme reduce la tasa de rechazo de 0,655 a 0,605, una caída de 5 puntos porcentuales que puede ser inaceptable en despliegues sensibles.
- La selección de capas depende de herramientas concretas (CircuitKIT, AuditKIT) y de un ranking derivado del modelo base; su validez para otros modelos o dominios no está demostrada.
- No se documentan sesgos conocidos, tasas de alucinación ni límites de contexto del modelo base en la información disponible.
- El identificador del repositorio y la fecha de creación (2026-11-16) deben verificarse antes de citarlo; el modelo tiene 0 descargas y 0 likes en el momento de la consulta.
- La cuantización NF4 de bitsandbytes puede no ser compatible con motores de inferencia de alto rendimiento, lo que limita el despliegue en producción a gran escala.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cybertronak/safecompress-tiny-aya-global-recipes
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Dataset de resultados: https://huggingface.co/datasets/cybertronak/safecompress-layerlab-results
- Recetas: `recipes.json` (incluido en el repositorio)
- Cargador: `load_safecompress.py` (incluido en el repositorio)
- Herramientas citadas: CircuitKIT y AuditKIT (Lexsi); enlaces no disponibles en la información proporcionada.
