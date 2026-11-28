# joamCriff123/zils-lite-l1128a

## Resumen

zils-lite-l1128a es un modelo de extracción de características y toma de decisiones publicado por el usuario joamCriff123 en Hugging Face. Se trata de un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 853 millones de parámetros, y se presenta como un "cuerpo de decisión d3-lite" orientado al pool lite de la subred 127 de Zils. La model card es extremadamente escueta y no aporta detalles sobre el proceso de entrenamiento, los datos utilizados ni las capacidades resultantes.

El modelo se distribuye con licencia Apache-2.0, en formato safetensors y con soporte para la librería transformers mediante código personalizado (custom_code). El repositorio ocupa 1,7 GB y, en el momento de la consulta, no registra descargas ni interacciones, lo que sugiere un lanzamiento muy reciente o un experimento de nicho.

Su relevancia es limitada fuera del ecosistema Zils: no hay información pública sobre benchmarks, idiomas soportados ni evaluación de calidad. Para un desarrollador o investigador externo, debe tratarse como un artefacto experimental derivado de Qwen3.5-0.8B, útil únicamente si se conoce el protocolo de la subred 127 de Zils.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-0.8B); pipeline de feature-extraction con código personalizado |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica únicamente que el modelo deriva de Qwen/Qwen3.5-0.8B mediante un fine-tune. No se especifican la arquitectura interna exacta (número de capas, dimensiones ocultas, mecanismo de atención), el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

El tag `decision-model` y la etiqueta `d3-lite` sugieren que el ajuste está orientado a producir decisiones o puntuaciones dentro de un protocolo concreto (la subred 127 de Zils), pero no se documenta la función de pérdida, el formato de entrada/salida ni el procedimiento de evaluación. El uso de `custom_code` implica que la clase del modelo no es estándar y requiere cargar código remoto del repositorio, lo que añade una dependencia de confianza en el autor.

## Capacidades

- Extracción de características (pipeline declarado: feature-extraction).
- Toma de decisiones dentro del protocolo Zils (subred 127, pool lite), según la model card.
- Generación de texto: no confirmada explícitamente, aunque el modelo base Qwen3.5-0.8B es un modelo de lenguaje.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Integración en el pool lite de la subred 127 de Zils: el modelo está diseñado específicamente como "cuerpo de decisión" para este protocolo, por lo que su uso principal es participar en la lógica de decisión de dicha subred.
- Extracción de embeddings para clasificación downstream: al declararse como feature-extraction, puede emplearse para obtener representaciones vectoriales de texto que alimenten clasificadores o sistemas de recuperación, siempre que se valide su calidad empíricamente.
- Prototipado de agentes de decisión de bajo coste: con menos de 1.000 millones de parámetros, puede ejecutarse en hardware modesto para experimentar con políticas de decisión antes de escalar a modelos mayores.
- Filtrado o enrutamiento de peticiones: un modelo pequeño de decisión puede actuar como router que clasifique consultas y las dirija a modelos mayores o a pipelines específicos.
- Investigación sobre fine-tuning de Qwen3.5-0.8B: sirve como ejemplo de adaptación de un modelo base pequeño a una tarea concreta, útil para estudiar técnicas de ajuste en dominios de nicho.
- Evaluación comparativa de modelos de decisión: puede incluirse en experimentos que comparen distintos "cuerpos de decisión" dentro de ecosistemas tipo Zils, aunque la ausencia de benchmarks públicos limita la comparación objetiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder cargar el modelo en FP16; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegue en servidor, A100 o H100 no son necesarias por tamaño, pero podrían usarse para alto throughput.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más.
- Opciones de despliegue: transformers (requerido por el uso de custom_code); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada y probablemente requiera conversión y adaptación del código personalizado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-l1128a | 852.985.920 | No disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune de Qwen3.5-0.8B con custom_code |
| Qwen/Qwen3.5-0.8B | ~0,8B (según base declarada) | No disponible | No disponible en la información | Hugging Face | Modelo base del que deriva |
| Alternativas de ~1B parámetros (p. ej., familias Llama, Gemma o Qwen) | ~1B | Variable | Variable | Hugging Face | No se dispone de datos comparativos de rendimiento para este modelo |

No se dispone de información suficiente para una comparativa de rendimiento rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Model card prácticamente vacía: no hay documentación sobre datos de entrenamiento, evaluación ni comportamiento esperado.
- Sin benchmarks ni métricas publicadas: imposible verificar la calidad del modelo antes de usarlo.
- Riesgo de alucinación: al derivar de un modelo de lenguaje pequeño, es probable que genere contenido incorrecto, aunque no se ha evaluado.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no se pueden identificar sesgos específicos.
- Idiomas soportados no declarados: no se garantiza un rendimiento multilingüe adecuado.
- Uso de custom_code: requiere ejecutar código remoto del repositorio, lo que supone un riesgo de seguridad y de reproducibilidad; conviene auditar el código antes de cargarlo.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse las atribuciones del modelo base y del código incluido en LICENSE y NOTICE.
- Ecosistema de nicho: su valor está ligado al protocolo Zils; fuera de él, su utilidad no está demostrada.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-lite-l1128a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
