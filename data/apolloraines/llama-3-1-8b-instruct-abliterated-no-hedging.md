# ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-No-Hedging

## Resumen

Llama-3.1-8B-Instruct-Abliterated-No-Hedging es una variante del modelo Llama-3.1-8B-Instruct de Meta, modificada mediante *representation engineering* con la herramienta jBlaze, desarrollada por Apollo Raines. El objetivo es suprimir dos comportamientos indeseados en el modelo base: el rechazo a responder ciertas peticiones y el uso de lenguaje evasivo o "hedging" (frases como "no estoy seguro", "podría ser", etc.). El resultado es un modelo que responde de forma directa y sin negativas, manteniendo la arquitectura original del transformer de 8.0B parámetros.

La modificación no implica ningún tipo de fine-tuning o entrenamiento adicional: se extraen direcciones representacionales mediante análisis de activaciones contrastivas (SVD sobre pares de activaciones) y se proyectan ortogonalmente en el espacio de pesos. Se aplicaron dos direcciones: *refusal* (suprimida con magnitud m=2.0) y *hedging* (suprimida con m=1.0). El modelo es relevante para desarrolladores e investigadores que necesitan respuestas sin restricciones de contenido ni ambigüedad deliberada, aunque hereda las capacidades y limitaciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder, 32 capas) |
| Parametros totales | 8.030.261.248 (8.0B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Llama-3.1-8B-Instruct soporta 128K, pero no se confirma en esta variante) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en bf16, safetensors) |
| Idiomas soportados | en (segun la model card; el base es multilingue, pero no se documenta para esta variante) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Llama-3.1-8B-Instruct: un transformer decoder con atención por grupos (GQA), 32 capas y 8.0B parámetros en precisión bf16. No se realizó ningún entrenamiento adicional; los cambios se introducen mediante proyecciones ortogonales en el espacio de pesos, aplicadas a la rama A3 (atención y todas las capas MLP). El método jBlaze extrae direcciones representacionales mediante descomposición en valores singulares (SVD) sobre activaciones pareadas de prompts contrastivos, y luego suprime o amplifica dichas direcciones. En este caso se suprimieron las direcciones asociadas al rechazo y al "hedging". El modelo base fue entrenado por Meta con aproximadamente 15 billones de tokens de datos públicos, pero esta información no se detalla en la documentación de la variante.

## Capacidades

- Generación de texto conversacional: responde a instrucciones en formato chat, con respuestas directas y sin rechazos ni disclaimers.
- Razonamiento básico y aritmética: los ejemplos de la model card muestran resolución correcta de operaciones simples y explicaciones paso a paso.
- Generación de código: puede escribir funciones en Python y otros lenguajes, como se muestra en el ejemplo de invertir una cadena.
- Conocimiento factual general: responde preguntas de cultura general, aunque con el mismo riesgo de alucinación que el modelo base.
- Sin soporte documentado de tool calling, function calling, visión, audio o modo *thinking*: la model card no menciona estas capacidades, y al ser una modificación del base, es probable que no las incorpore de forma específica.
- Multilingüismo no confirmado: la model card indica solo inglés, aunque el modelo base soporta varios idiomas; no se especifica si la modificación afecta a otras lenguas.

## Casos de uso

- Asistencia en investigación académica sobre alineación y seguridad de modelos: permite estudiar cómo cambia el comportamiento al eliminar mecanismos de rechazo, sin necesidad de reentrenar.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos donde se requiere que el modelo no se autocensure ni introduzca avisos morales.
- Análisis de texto y extracción de información: al no rechazar preguntas sobre temas sensibles, puede procesar documentos o consultas que otros modelos evitarían, siempre dentro de un marco legal.
- Desarrollo de asistentes conversacionales especializados: para dominios donde se necesita una respuesta directa y sin ambigüedad, como soporte técnico interno o generación de documentación.
- Evaluación comparativa de técnicas de *representation engineering*: sirve como baseline para medir el impacto de suprimir direcciones específicas frente a otros métodos de alineación.
- Prototipado rápido de chatbots con personalidad "directa": su comportamiento sin *hedging* lo hace adecuado para entornos donde se prefiere claridad absoluta sobre cortesía o cautela.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Al ser una modificación del Llama-3.1-8B-Instruct, se espera un rendimiento similar en tareas estándar, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 16 GB, por lo que se requiere al menos 16 GB de VRAM para cargar el modelo sin cuantizar. Con cuantización a 4 bits (si se convierte a GGUF) cabría en unos 4-5 GB, pero no se proporcionan versiones cuantizadas.
- GPU recomendadas: tarjetas con 24 GB o más, como NVIDIA RTX 4090, A100, A6000, o H100 para mayor velocidad. En consumer GPU, una RTX 3090/4090 puede ejecutarlo con cuantización.
- Opciones de despliegue: se puede usar con Hugging Face Transformers (código de ejemplo incluido en la model card), vLLM, o convertirlo a GGUF para llama.cpp/Ollama.
- Latencia y throughput: no se especifican. Como referencia, el Llama-3.1-8B en bf16 suele generar entre 30-60 tokens/s en una A100, pero depende de la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Observaciones |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8.0B | 128K | Fine-tuning supervisado + RLHF | Llama 3.1 | Respuestas con rechazo y lenguaje cauto |
| Esta variante abliterada | 8.0B | No confirmado | Representation engineering (jBlaze) | Llama 3.1 | Sin rechazo ni hedging, misma arquitectura |
| Dolphin 2.9 Llama 3.1 8B (ejemplo de otro abliterado) | 8.0B | 128K (aprox.) | Fine-tuning sobre dataset sin censura | Llama 3.1 | Alternativa comercial, pero no hay datos oficiales en esta documentación |

La comparación directa con otros modelos abliterados no es posible sin datos publicados. La principal diferencia con el base es el método de modificación (proyecciones de pesos en lugar de entrenamiento) y el comportamiento resultante.

## Limitaciones y advertencias

- Al no haber fine-tuning, la supresión de direcciones puede degradar la coherencia o la calidad en ciertas tareas, aunque no se han reportado problemas.
- Riesgo de alucinación: igual que el modelo base, puede generar información falsa o inventada, especialmente en temas de actualidad.
- Solo se declara soporte para inglés; el comportamiento en otros idiomas no está verificado.
- La licencia Llama 3.1 Community License permite uso comercial, pero requiere atribución y cumple con las condiciones de Meta (por ejemplo, no usar para mejorar otros modelos grandes sin permiso).
- El modelo puede producir respuestas que un usuario podría considerar inapropiadas o peligrosas, ya que no tiene mecanismos de rechazo. Es responsabilidad del desarrollador implementar salvaguardas externas si se despliega en producción.
- No hay benchmarks publicados, por lo que el rendimiento real en tareas estandarizadas es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-No-Hedging
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Herramienta jBlaze: https://github.com/apolloraines/jblaze
