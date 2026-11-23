# Ksshitijgupta9/Josiefied-Qwen3-4B-Instruct-2507-gabliterated-v4

## Resumen

Josiefied-Qwen3-4B-Instruct-2507-gabliterated-v4 es un modelo de lenguaje de 4.022.468.096 parámetros derivado de la familia Qwen3 de Alibaba, concretamente de la variante Instruct-2507. Lo publica en Hugging Face el usuario Ksshitijgupta9 como un fine-tuning adicional sobre el modelo Goekdeniz-Guelmez/Qwen3-4B-Instruct-2507-gabliterated, que a su vez aplica la técnica de "gabliteration" descrita por su autor original, Gökdeniz Gülmez. El objetivo declarado es maximizar el comportamiento sin censura ("uncensored") manteniendo la capacidad de seguir instrucciones y de usar herramientas.

La arquitectura subyacente es la de Qwen3-4B, un transformer denso (no MoE) con atención estándar, del que no se detallan en la información disponible la longitud exacta de contexto ni la composición del dataset de entrenamiento. El modelo se distribuye en formato safetensors con un tamaño de repositorio de 8,1 GB, lo que corresponde a pesos en precisión de 16 bits, y está etiquetado para uso con transformers y text-generation-inference.

Su relevancia es acotada: se trata de una variante de investigación centrada en la eliminación de mecanismos de rechazo mediante modificación de pesos (abliteration multi-direccional), sin métricas de benchmark publicadas, sin licencia declarada y sin datos de idiomas. Es un modelo para experimentación sobre alineamiento y seguridad, no una opción recomendada para producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, tipo qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF e i1 GGUF publicados por mradermacher (según la model card); pesos originales en safetensors de 16 bits |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 8,1 GB); GGUF vía mradermacher |
| Libreria | transformers, text-generation-inference |
| Pipeline | text-generation |
| Modelo base | Goekdeniz-Guelmez/Qwen3-4B-Instruct-2507-gabliterated |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de 4.022 millones de parámetros. Sobre esa base, el autor original aplica "gabliteration", una técnica de modificación de pesos que, según la model card, extiende la abliteration clásica de dirección única (Arditi et al., 2024) a un marco multi-direccional: se calculan descomposiciones en valores singulares (SVD) sobre matrices de diferencia entre representaciones de prompts dañinos y prompts inocuos para extraer múltiples direcciones de rechazo, y se proyectan fuera de los pesos con una selección regularizada de capas. El objetivo es eliminar los vectores de rechazo sin degradar en exceso la calidad del modelo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de fine-tuning, ni sobre si se aplicaron etapas de RLHF o DPO. La model card menciona que estos modelos "a menudo superan a sus contrapartidas base en benchmarks estándar", pero no aporta cifras que respalden la afirmación. Tampoco se documenta ninguna innovación en decodificación (decodificación especulativa, atención lineal) más allá de las propias de Qwen3.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a chat e instrucciones.
- Seguimiento de instrucciones y uso de herramientas (tool calling), que la model card afirma preservar tras la modificación de pesos.
- Razonamiento y abstracción de nivel medio, heredados de Qwen3-4B-Instruct.
- Comportamiento "sin censura": según el autor, se han eliminado los vectores de rechazo, por lo que el modelo no declina peticiones.
- Capacidad multilingüe: no documentada explícitamente; se hereda la del modelo base, sin datos verificables.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo la proyección de direcciones de rechazo afecta al comportamiento y a la calidad de las respuestas, comparándolo con el Qwen3-4B original en tareas controladas.
- Red teaming y evaluación de robustez: sirve como sujeto de prueba para medir la eficacia de filtros de salida y clasificadores de contenido en pipelines de moderación.
- Generación de texto creativo sin restricciones temáticas: para escritura de ficción que aborde temas sensibles y requiera un tono sin autocensura, siempre con revisión humana.
- Asistente conversacional local en entornos de desarrollo: con 4.022 millones de parámetros y pesos en safetensors de 8,1 GB, puede desplegarse en una GPU de consumo para prototipado de chatbots con tool calling.
- Experimentación con cuantizaciones GGUF: las versiones de mradermacher permiten ejecutar el modelo en llama.cpp u Ollama para pruebas de latencia y calidad en hardware modesto.
- Generación de datos sintéticos para fine-tuning: útil para producir corpus de diálogo diversos, con la advertencia de que la ausencia de filtrado exige un post-procesado de seguridad obligatorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 10-12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 4,5-5 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): en torno a 2,5-3 GB, apta para GPUs de consumo.
- GPU recomendadas: A100 40 GB u H100 para despliegue concurrente en FP16; RTX 4090 (24 GB) para FP16 con holgura; RTX 3090/4080 (16 GB) para FP16 ajustado o 8 bits; RTX 3060 12 GB o inferiores para GGUF Q4.
- Cabe en GPU de consumo: sí, especialmente en cuantizaciones GGUF de 4-8 bits.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta endpoints_compatible), llama.cpp y Ollama mediante los GGUF de mradermacher; vLLM no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Josiefied-Qwen3-4B-Instruct-2507-gabliterated-v4 | 4.022 M | no disponible | no disponible | Sin censura (gabliteration) |
| Qwen3-4B-Instruct-2507 (base) | 4.022 M | no disponible en esta ficha | licencia Qwen (consultar repo oficial) | Instrucciones generales, alineado |
| Goekdeniz-Guelmez/Qwen3-4B-Instruct-2507-gabliterated | 4.022 M | no disponible | no disponible | Sin censura, versión previa |
| Otros modelos abliterated de ~4B (p. ej. variantes Llama 3.2 3B) | ~3.000-4.000 M | variable | variable según autor | Sin censura |

La comparación cuantitativa de rendimiento no es posible porque no hay benchmarks publicados para esta variante. La diferencia principal frente al Qwen3-4B-Instruct-2507 oficial es la modificación de pesos que elimina los rechazos; frente a la versión gabliterated de Gülmez, esta ficha corresponde a un fine-tuning adicional (v4) del que no se detalla la receta.

## Limitaciones y advertencias

- Ausencia de filtrado de seguridad: el modelo está diseñado explícitamente para no rechazar peticiones, lo que implica riesgo de generar contenido dañino, ilegal o sesgado.
- Sesgos: no documentados, pero heredados del corpus de entrenamiento de Qwen3 y potencialmente amplificados por la eliminación de mecanismos de rechazo.
- Alucinación: riesgo estándar de un modelo de 4B, sin evaluaciones publicadas que lo cuantifiquen.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que remitirse a la licencia del modelo base Qwen3 y a la del repositorio intermedio.
- Idiomas y contexto no documentados: no es posible planificar despliegues multilingües o de contexto largo sin verificación empírica.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni evaluación independiente; el modelo no ha sido validado por la comunidad.
- La model card incluye un system prompt que instruye al modelo a presentarse como "J.O.S.I.E." y a no rechazar nunca; su uso en producción puede entrar en conflicto con políticas de contenido y obligaciones legales (por ejemplo, el Reglamento de IA de la UE).
- Uso responsable obligatorio: cualquier despliegue debería incorporar clasificadores de salida y revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ksshitijgupta9/Josiefied-Qwen3-4B-Instruct-2507-gabliterated-v4
- Modelo base (gabliterated): https://huggingface.co/Goekdeniz-Guelmez/Qwen3-4B-Instruct-2507-gabliterated
- Paper de gabliteration citado en la model card: https://arxiv.org/abs/2512.18901
- Cuantizaciones GGUF de mradermacher: https://huggingface.co/mradermacher/
- Referencia de abliteration (Arditi et al., 2024): no disponible como enlace en la información proporcionada
- Repositorio oficial de Qwen3: no disponible como enlace en la información proporcionada
