# MagmaStudios/VERO-Lkonshu-V2

## Resumen

VERO-Lkonshu-V2 es un modelo de generación de texto de aproximadamente 1.001 millones de parámetros (1B) desarrollado por Magma Studios, con autoría atribuida a Angelo Fontela. Se presenta como una variante experimental orientada a matemáticas, tareas cotidianas, organización, programación y explicaciones claras, con soporte declarado para castellano e inglés. Su arquitectura se declara como una expansión de un modelo previo de 24 capas hasta 58 capas Transformer, añadiendo 34 capas residuales inicialmente neutras.

El modelo se distribuye bajo licencia Apache 2.0 en formato safetensors y está etiquetado con la arquitectura qwen2, lo que sugiere una base derivada de la familia Qwen2. No obstante, la model card indica que el checkpoint carga correctamente pero requiere un entrenamiento de estabilización para que las capas nuevas aporten capacidad real, lo que implica que su rendimiento actual puede ser limitado o inconsistente en tareas exigentes.

Es relevante ahora como ejemplo de experimentación comunitaria en torno a la expansión de profundidad de modelos pequeños, pero su estado experimental, la ausencia de benchmarks publicados y el escaso historial de uso (0 descargas, 0 likes en el momento de la consulta) aconsejan tratarlo con cautela en entornos de producción. No dispone de acceso web incorporado; cualquier consulta a información actual debe resolverse mediante herramientas externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado qwen2), 58 capas |
| Parametros totales | 1.001.053.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only etiquetado como qwen2. Según la model card, el modelo parte de una versión anterior de 24 capas y se amplía hasta 58 capas mediante la adición de 34 capas residuales inicialmente neutras. Este enfoque de expansión de profundidad permite aumentar la capacidad teórica del modelo sin destruir los pesos originales, pero exige un proceso de estabilización posterior para que las capas añadidas aprendan representaciones útiles. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos. El tamaño del repositorio (4,7 GB) es coherente con un checkpoint de ~1B parámetros en precisión de 16 bits o similar, aunque no se especifica la precisión exacta de los pesos publicados.

## Capacidades

- Generación de texto conversacional en castellano e inglés.
- Razonamiento matemático y resolución de problemas, según el enfoque declarado por el autor.
- Programación y generación de código, dentro del ámbito de uso previsto.
- Organización de tareas y asistencia en tareas cotidianas.
- Explicaciones claras y divulgativas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: limitadas a es y en según los metadatos.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Acceso web: no incorporado; requiere integración externa de una herramienta de búsqueda.

## Casos de uso

- Asistente conversacional en castellano para tareas cotidianas: el modelo puede gestionar diálogos multi-turno sencillos en español, aunque su contexto máximo no está documentado y conviene validar el comportamiento en conversaciones largas antes de desplegarlo.
- Apoyo a la organización personal: generación de listas, resúmenes y planes de tareas a partir de instrucciones en lenguaje natural, aprovechando su enfoque declarado en organización.
- Tutoría básica de matemáticas: resolución y explicación paso a paso de problemas de nivel educativo, con la advertencia de que no hay benchmarks publicados que respalden su precisión aritmética.
- Generación de código asistida en entornos de desarrollo: borradores de funciones, explicaciones de fragmentos y sugerencias de refactorización, siempre con revisión humana dado su estado experimental.
- Prototipado rápido de aplicaciones de IA en español: al ser un modelo de ~1B parámetros con licencia Apache 2.0, es adecuado para pruebas de concepto y experimentación local en hardware modesto.
- Investigación sobre expansión de profundidad en Transformers: sirve como caso de estudio para analizar el efecto de añadir capas residuales neutras y el proceso de estabilización necesario.
- Generación de documentación técnica y explicaciones divulgativas: redacción de textos explicativos claros a partir de especificaciones, con revisión posterior por parte de un editor humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en cuantización de 8 bits y en torno a 4 GB en FP16 para los ~1.001 millones de parámetros, sin contar la memoria adicional para el contexto y el runtime.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16; para cuantizaciones de 4 bits, GPUs consumer como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs modernas con 8 GB o más, aunque no se han publicado mediciones oficiales.
- Opciones de despliegue: al estar en safetensors y etiquetado como qwen2, es compatible con frameworks como Transformers, vLLM o TGI; para llama.cpp u Ollama sería necesaria una conversión a GGUF no publicada por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| VERO-Lkonshu-V2 | ~1,0B | no disponible | Apache 2.0 | Experimental, sin benchmarks |
| Qwen2-1.5B | ~1,5B | 32.768 tokens (según versión) | Apache 2.0 | Estable, con benchmarks publicados |
| Llama 3.2 1B | ~1,2B | 128.000 tokens | Llama 3.2 Community License | Estable, con benchmarks publicados |
| Gemma 2 2B | ~2,6B | 8.192 tokens | Gemma Terms of Use | Estable, con benchmarks publicados |

La comparativa se basa en características públicas de modelos de tamaño similar; no se dispone de datos de rendimiento de VERO-Lkonshu-V2 que permitan una comparación cuantitativa. Los modelos alternativos cuentan con documentación de entrenamiento y evaluaciones publicadas, mientras que VERO-Lkonshu-V2 se encuentra en fase experimental y requiere estabilización según su propia model card.

## Limitaciones y advertencias

- Modelo experimental: la model card reconoce que las 34 capas añadidas son inicialmente neutras y necesitan entrenamiento de estabilización, por lo que el rendimiento real puede ser inferior al esperado para su tamaño.
- Ausencia de benchmarks: no hay métricas publicadas de MMLU, HumanEval, GSM8K ni similares, lo que impide evaluar su calidad de forma objetiva.
- Riesgo de alucinación: como todo modelo generativo de pequeño tamaño y sin datos de entrenamiento documentados, es probable que invente información, especialmente en matemáticas y datos factuales.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada, lo que dificulta planificar su uso en tareas de contexto largo.
- Idiomas limitados: solo se declaran es y en; el rendimiento en otros idiomas no está garantizado.
- Sin acceso web: no puede consultar información actual por sí mismo; requiere integración externa de búsqueda.
- Historial de uso nulo: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el estado experimental y la falta de garantías aconsejan no desplegarlo en producción sin una evaluación propia exhaustiva.
- Sin soporte documentado de tool calling ni de agentes: no se debe asumir su uso en pipelines de herramientas sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/MagmaStudios/VERO-Lkonshu-V2
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
