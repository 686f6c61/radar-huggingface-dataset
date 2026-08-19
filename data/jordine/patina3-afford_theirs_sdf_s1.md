# Jordine/patina3-afford_theirs_sdf_s1

## Resumen

El modelo `Jordine/patina3-afford_theirs_sdf_s1` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Jordine en HuggingFace, construido sobre el modelo base `meta-llama/Llama-3.1-8B`. Se distribuye como un conjunto de pesos en formato safetensors compatible con la librería PEFT, pensado para la generación de texto conversacional. El repositorio tiene un tamaño de 0,7 GB, lo que corresponde a los pesos del adaptador, no al modelo completo.

La model card del autor está prácticamente vacía: no se indica la licencia, los idiomas, los datos de entrenamiento, los hiperparámetros ni los resultados de evaluación. El único dato adicional relevante es la etiqueta `arxiv:1910.09700`, que hace referencia al artículo de Lacoste et al. sobre estimación del impacto ambiental del aprendizaje automático, pero no aporta información sobre el propósito del modelo. El nombre del repositorio sugiere una posible relación con tareas de "affordances" (percepción de acciones) y funciones de distancia con signo (SDF), pero no hay documentación que lo confirme.

Dada la ausencia de información pública, esta ficha se limita a describir lo que se puede inferir del repositorio y del modelo base, señalando explícitamente todos los datos no disponibles. Se recomienda contactar con el autor o examinar los archivos del adaptador para obtener más detalles antes de considerar su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `meta-llama/Llama-3.1-8B` (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador ocupa 0,7 GB en disco; el modelo base tiene 8 030 millones de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Heredada del modelo base: 128 000 tokens (Llama-3.1-8B) |
| Tipos de cuantizacion | No disponible (los pesos del adaptador estan en safetensors; la cuantizacion depende del despliegue) |
| Idiomas soportados | No disponible (el modelo base soporta principalmente ingles y algunos otros, pero no se especifica para el adaptador) |
| Licencia | No disponible (el modelo base tiene licencia Llama 3.1 Community License, pero el adaptador no declara ninguna) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA, que introduce matrices de bajo rango en las capas de atención y feed-forward del modelo base congelado, reduciendo drásticamente el número de parámetros entrenables. El modelo base `Llama-3.1-8B` es un transformer decoder-only con 8 030 millones de parámetros, entrenado por Meta con 15 billones de tokens, con una ventana de contexto de 128 000 tokens y capacidades multilingües limitadas.

No se dispone de información sobre el proceso de entrenamiento del adaptador: ni el conjunto de datos, ni el número de pasos, ni la configuración de hiperparámetros (tasa de aprendizaje, rango LoRA, etc.). El tag `arxiv:1910.09700` en el repositorio apunta a un artículo sobre cálculo de emisiones de carbono, pero no parece estar relacionado con el entrenamiento del modelo. No hay evidencia de que se hayan utilizado técnicas como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas para este adaptador. Al estar basado en Llama-3.1-8B, hereda las capacidades generales del modelo base, que incluyen:

- Generación de texto y conversación multirround.
- Razonamiento básico y respuesta a preguntas.
- Generación de código en lenguajes comunes (Python, JavaScript, etc.).
- Comprensión lectora y resumen de textos.
- Capacidades multilingües limitadas (principalmente inglés, con algo de español, francés, alemán, etc., según el modelo base).

Sin embargo, no se sabe qué habilidades concretas han sido potenciadas o modificadas por el ajuste fino con LoRA. El nombre del repositorio (`afford_theirs_sdf`) sugiere una posible especialización en tareas de percepción de affordances o procesamiento de SDF, pero no hay confirmación.

## Casos de uso

Dada la falta de documentación, los casos de uso son especulativos. Se listan aplicaciones genéricas que podrían ser viables si el adaptador mantiene las capacidades del modelo base, pero se recomienda validar previamente:

- Prototipado de chatbots conversacionales: se puede cargar el adaptador sobre Llama-3.1-8B con PEFT y desplegar un asistente de texto para pruebas internas, aprovechando la ventana de 128 000 tokens.
- Experimentación académica con LoRA: útil como ejemplo de adaptador de bajo rango sobre un modelo grande, para estudiar el impacto del ajuste fino en tareas específicas.
- Generación de texto asistida en entornos con recursos limitados: al ser un adaptador pequeño (0,7 GB), permite probar variantes del modelo base sin necesidad de reentrenar.
- Investigación sobre affordances (si se confirma el propósito): podría utilizarse para razonar sobre acciones posibles en entornos descritos textualmente, aunque no hay evidencia.
- Pruebas de integración con frameworks de inferencia como vLLM u Ollama, que soportan carga de adaptadores PEFT.
- Análisis de sesgos y robustez: al ser un adaptador sin documentación, puede servir como caso de estudio para evaluar la calidad de modelos publicados sin especificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han proporcionado comparativas con el modelo base u otros adaptadores.

## Requisitos de hardware

- VRAM estimada: para inferencia con el adaptador es necesario cargar el modelo base Llama-3.1-8B más el adaptador. En precisión fp16, el modelo base ocupa aproximadamente 16 GB de VRAM. Con cuantización de 4 bits (por ejemplo, mediante bitsandbytes), se puede reducir a unos 6-8 GB.
- GPU recomendadas: para fp16, una GPU con al menos 16 GB (A100, RTX 4090, L4). Con cuantización 4 bits, una RTX 3060 de 12 GB o superior podría funcionar.
- Compatibilidad con GPU de consumo: sí, si se usa cuantización. Una RTX 3090 o RTX 4090 (24 GB) puede ejecutarlo en fp16 sin problemas.
- Opciones de despliegue: vLLM (soporta adaptadores LoRA), HuggingFace Transformers con PEFT, llama.cpp (requiere conversión del adaptador a GGUF), Ollama (si se convierte), TGI (Text Generation Inference).
- Latencia y throughput: no disponible, depende del hardware y la configuración de cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. Como referencia, se puede comparar con el modelo base y con otros adaptadores LoRA publicados sobre Llama-3.1-8B, pero no hay datos de rendimiento para este adaptador concreto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Jordine/patina3-afford_theirs_sdf_s1` | 0,7 GB (adaptador) | 128 000 (heredado) | No disponible | HuggingFace |
| `meta-llama/Llama-3.1-8B` | 8 030 M | 128 000 | Llama 3.1 Community License | HuggingFace |
| Otros adaptadores LoRA de la comunidad | Variable | Depende del base | Variable | HuggingFace |

## Limitaciones y advertencias

- Documentación inexistente: la model card no contiene información sobre el entrenamiento, los datos, la licencia ni el propósito. No se puede garantizar la calidad ni la seguridad del adaptador.
- Licencia no declarada: aunque el modelo base tiene una licencia específica (Llama 3.1 Community License), el adaptador no especifica la suya. Esto puede generar problemas legales si se usa comercialmente.
- Sesgos del modelo base: Llama-3.1-8B puede presentar sesgos de género, raza o idioma, que el adaptador podría amplificar o modificar sin control.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- Idiomas no especificados: no se sabe si el adaptador está optimizado para algún idioma en particular; probablemente hereda las limitaciones del base (dominio principal inglés).
- Fecha de creación inusual: el repositorio está fechado en agosto de 2026, lo que sugiere que podría tratarse de un proyecto experimental o con metadatos incorrectos.
- Sin benchmarks ni evaluaciones: no hay evidencia de rendimiento en tareas estándar, por lo que no se recomienda su uso en producción sin una validación exhaustiva.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jordine/patina3-afford_theirs_sdf_s1
- Modelo base Llama-3.1-8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Artículo referenciado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
