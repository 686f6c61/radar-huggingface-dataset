# Dandandooo/hw1-hc3-detector

## Resumen

Dandandooo/hw1-hc3-detector es un modelo de clasificación de texto publicado en HuggingFace por el usuario Dandandooo. Por su nombre, su pipeline declarado (`text-classification`) y el corpus al que hace referencia (HC3), se trata con alta probabilidad de un detector de texto generado por IA, entrenado mediante ajuste fino sobre el corpus HC3 (Human ChatGPT Comparison Corpus), que enfrenta respuestas humanas con respuestas generadas por ChatGPT. El repositorio forma parte de una familia de artefactos homónimos publicados por distintos usuarios (Aishkrish, fattyyo, Yihangsun, skyyyyks, entre otros), lo que apunta a una tarea académica o de curso (el prefijo "hw1" sugiere "homework 1") más que a un modelo de producción.

El modelo tiene 22.713.986 parámetros según los pesos en safetensors, un tamaño coherente con un transformer tipo BERT de configuración reducida o de tamaño pequeño-medio. No obstante, la model card publicada por el autor es la plantilla automática de HuggingFace y no contiene ningún campo completado: no hay información sobre datos de entrenamiento, hiperparámetros, idiomas, licencia ni métricas de evaluación. Cualquier dato que no aparezca en los metadatos del Hub debe considerarse no disponible.

Su relevancia es limitada fuera del contexto académico: se trata de un clasificador pequeño, sin licencia declarada, sin documentación y sin resultados publicados, pero ilustrativo del patrón habitual de detección de texto sintético basada en BERT ajustado sobre HC3. Es útil principalmente como referencia para entender cómo se construyen estos detectores, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (según etiqueta del Hub); configuración exacta no disponible |
| Parametros totales | 22.713.986 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican conversiones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La única información fiable sobre la arquitectura es la etiqueta `bert` del Hub y el recuento de parámetros en safetensors (22.713.986). Con ese tamaño, el modelo no corresponde a un BERT-base estándar (110 millones de parámetros), sino a una configuración más pequeña, presumiblemente con menos capas o dimensiones ocultas reducidas, aunque el autor no especifica la configuración. Se desconoce si se partió de un checkpoint preentrenado público (por ejemplo, una variante de BERT o DistilBERT) y se ajustó, o si se entrenó desde cero.

Tampoco hay información sobre el procedimiento de entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO (poco probable en un clasificador de este tamaño), hiperparámetros, precisión mixta o hardware empleado. La model card incluye únicamente los campos genéricos de la plantilla con la marca "[More Information Needed]". Por el nombre del repositorio y por los artefactos homónimos encontrados en la búsqueda web, la hipótesis más razonable es un ajuste fino supervisado sobre HC3 para clasificación binaria humano/IA, pero esto no está confirmado por el autor de este repositorio concreto.

## Capacidades

- Clasificación de texto: pipeline declarado `text-classification`, presumiblemente orientado a distinguir texto humano de texto generado por IA.
- Compatibilidad con la librería `transformers` y con pesos en safetensors.
- Etiqueta `text-embeddings-inference` y `endpoints_compatible`, lo que indica que el repositorio es desplegable mediante la Inference Endpoints de HuggingFace y potencialmente utilizable en TEI.
- Tool calling / function calling: no disponible, y poco probable en un clasificador de este tamaño.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo pensamiento, visión, audio): no disponibles.

## Casos de uso

- Detección de texto generado por IA en entornos académicos: el modelo podría puntuar entregas o trabajos para señalar posibles respuestas generadas por ChatGPT, siempre que el dominio de los textos se parezca al de HC3. Requiere validación previa porque no hay métricas publicadas.
- Moderación de contenido en plataformas: como filtro auxiliar de primer nivel para marcar textos sospechosos de ser sintéticos antes de una revisión humana, dado su bajo coste computacional.
- Curación de datasets: descartar o etiquetar muestras generadas por IA al construir corpus de entrenamiento de otros modelos, aprovechando la clasificación binaria rápido y en CPU.
- Verificación periodística: apoyo a redacciones para señalar comunicados o textos recibidos que podrían haber sido generados automáticamente, con revisión humana obligatoria por el riesgo de falsos positivos.
- Investigación sobre detectores: servir como línea base reproducible o punto de comparación frente a otros detectores entrenados sobre HC3 publicados por otros usuarios.
- Punto de partida para ajuste fino posterior: al ser un BERT pequeño ajustable en una GPU de consumo, puede reentrenarse sobre un dominio concreto (por ejemplo, reseñas, correos o foros) para mejorar la detección específica.
- Integración en pipelines de CI/CD de contenido: uso como paso automático de validación en flujos que publiquen texto generado, para etiquetar el origen del contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna sección de evaluación completada y no se han encontrado métricas asociadas a este repositorio concreto en la búsqueda web.

## Requisitos de hardware

- VRAM estimada: aproximadamente 91 MB en fp32 (22,7 M parámetros × 4 bytes); unos 45 MB en fp16; unos 23 MB en int8. Son estimaciones a partir del recuento de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; el modelo cabe sobradamente en una GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida.
- Ejecución en CPU: viable para inferencia en lote, dado el reducido número de parámetros.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference` (etiqueta del Hub), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`). No se han publicado conversiones a GGUF/llama.cpp ni a Ollama.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Dandandooo/hw1-hc3-detector | 22.713.986 | no disponible | no disponible | HuggingFace, 0 descargas | Model card vacía |
| Aishkrish/hw1-hc3-detector | no disponible | no disponible | no disponible | HuggingFace | Artefacto homónimo, sin datos publicados |
| fattyyo/hw1-hc3-detector | no disponible | no disponible | no disponible | HuggingFace | Documenta evaluación sobre HC3 y advierte de falta de generalización |
| Yihangsun/hw1-hc3-detector | no disponible | no disponible | no disponible | HuggingFace | Ficha en directorio externo (savrn.com) |
| skyyyyks/hw1-hc3-detector | no disponible | no disponible | no disponible | HuggingFace | Registro en directorio externo (free2aitools.com) |

No se dispone de datos de rendimiento comparativos entre estos modelos. La única observación cualitativa encontrada en la búsqueda web, atribuida al repositorio de fattyyo, señala que un detector ajustado sobre HC3 puede no generalizar bien a texto generado por modelos más recientes o de otros datasets.

## Limitaciones y advertencias

- Model card sin completar: todos los campos de la plantilla están marcados como "[More Information Needed]", por lo que se desconoce el proceso de entrenamiento, los datos y las métricas.
- Licencia no declarada: sin licencia explícita, el uso comercial queda en un limbo legal; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de sesgo de dominio: si el modelo se entrenó sobre HC3, hereda los sesgos de ese corpus (temáticas, idiomas y estilo de ChatGPT en una fecha concreta), y probablemente rinda peor con texto de otros generadores o de dominios distintos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos sistemáticos al clasificar texto humano como IA o viceversa, sin métricas publicadas que permitan cuantificarlo.
- Idiomas: no disponibles; HC3 contiene principalmente inglés y chino, pero no se confirma para este artefacto.
- Contexto limitado: se desconoce la longitud máxima de entrada; los modelos de la familia BERT suelen limitarse a 512 tokens, lo que impediría clasificar documentos largos sin troceado.
- Sin soporte de generación: es un clasificador, no un modelo generativo; no debe usarse para producir texto.
- Escasa madurez: 0 descargas y 0 likes en el Hub, sin historial de uso ni mantenimiento, lo que reduce la confianza para uso en producción.
- Trazabilidad dudosa: la existencia de múltiples repositorios homónimos sugiere una tarea de curso y no un desarrollo mantenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dandandooo/hw1-hc3-detector
- Repositorio homónimo de Aishkrish: https://huggingface.co/Aishkrish/hw1-hc3-detector
- Repositorio homónimo de fattyyo: https://huggingface.co/fattyyo/hw1-hc3-detector
- Ficha de Yihangsun/hw1-hc3-detector en savrn.com: https://savrn.com/models/hw1-hc3-detector
- Ficha de skyyyyks/hw1-hc3-detector en free2aitools.com: https://free2aitools.com/model/skyyyyks/hw1-hc3-detector
- Organización Hello-SimpleAI (HC3, detectores y corpus): https://github.com/Hello-SimpleAI
- Paper del calculador de impacto (referenciado en la plantilla): https://arxiv.org/abs/1910.09700
