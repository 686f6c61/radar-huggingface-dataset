# reaperdoesntknow/DistilQwen3-1.7B-uncensored-GGUF

## Resumen

DistilQwen3-1.7B-uncensored-GGUF es la versión cuantizada en formato GGUF del modelo DistilQwen3-1.7B-uncensored, desarrollado por Convergent Intelligence LLC (Research Division) bajo el identificador de Hugging Face `reaperdoesntknow`. Se trata de un modelo de lenguaje de 2.031.739.904 parámetros (aproximadamente 1.700 millones según la nomenclatura del autor, aunque el recuento real en safetensors supera los 2.000 millones) obtenido mediante destilación de conocimiento a partir de Qwen3-30B-A3B, un modelo MoE de 30.000 millones de parámetros totales con 3.000 millones activos.

El modelo se enmarca en la colección DistilQwen, que según la model card constituye la única serie en BF16 del autor y se presenta como una prueba de destilación ponderada desde Qwen3-30B-A3B hacia variantes de 1.7B y 0.6B, con tres variantes de profesor (Instruct, Thinking y Coder). La variante "uncensored" indica que el modelo ha sido sometido a un proceso de eliminación o reducción de los mecanismos de rechazo y alineación del modelo base, lo que implica que puede generar contenido que los modelos alineados convencionalmente rechazarían.

El repositorio GGUF está pensado para despliegue en entornos de borde (edge) y en hardware de consumo, dado su reducido tamaño. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y el repositorio ocupa 9,0 GB, lo que sugiere la presencia de múltiples niveles de cuantización. A fecha de la información disponible acumula 2.748 descargas y 4 likes, con creación el 26 de marzo de 2026 y última actualización el 18 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3, destilada); detalles específicos de la destilación no disponibles |
| Parametros totales | 2.031.739.904 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF (niveles concretos no especificados; el repo de 9,0 GB sugiere múltiples variantes) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base está en safetensors/BF16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only derivado de la familia Qwen3, con aproximadamente 2.031 millones de parámetros totales. El proceso de entrenamiento se basa en destilación de conocimiento (knowledge distillation) desde el profesor Qwen3-30B-A3B, un modelo de mezcla de expertos con 30.000 millones de parámetros totales y 3.000 millones activos. Según la model card, la destilación se realizó con una metodología propietaria denominada "Discrepancy Calculus" y "Topological Knowledge Distillation", que el autor describe mediante un operador de discrepancia $Df(x)$ y una descomposición BV (variación acotada). El autor afirma que las fronteras estructurales detectadas durante el entrenamiento quedan codificadas en los pesos y se preservan tras la cuantización, al no depender de la precisión numérica.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o SFT posteriores a la destilación. Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La variante "uncensored" implica que el modelo fue modificado para reducir los comportamientos de rechazo típicos de los modelos alineados, aunque no se documenta el procedimiento concreto empleado para ello. El proceso de cuantización a GGUF se realizó presumiblemente con herramientas estándar del ecosistema llama.cpp, aunque este extremo no se confirma en la información disponible.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y orientado a diálogo multi-turno.
- Razonamiento y conocimiento general: heredado por destilación del profesor Qwen3-30B-A3B, aunque con la pérdida de capacidad inherente a la reducción de 30B a ~2B parámetros.
- Generación de código: la colección DistilQwen incluye una variante Coder destilada del mismo profesor, lo que sugiere capacidades de código en la familia, aunque no se confirma específicamente para esta variante uncensored.
- Modo "uncensored": reducción de los mecanismos de rechazo, lo que permite generar contenido que los modelos alineados estándar declinarían.
- Capacidades multilingües: no disponibles en la información proporcionada; dependen de las capacidades del Qwen3 base, que es multilingüe, pero no se documenta el alcance en esta variante.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en dispositivos de borde y hardware de consumo: con ~2.000 millones de parámetros y formato GGUF, el modelo puede ejecutarse en CPU y en GPUs de gama baja, lo que lo hace adecuado para asistentes locales en portátiles, mini-PC y dispositivos embebidos con recursos limitados.
- Generación de texto creativo sin restricciones de contenido: la variante uncensored permite explorar narrativa, guiones y ficción con temáticas que los modelos alineados suelen rechazar, útil en entornos de escritura creativa controlados.
- Prototipado rápido de chatbots conversacionales: su naturaleza conversacional y su reducido tamaño permiten iterar rápidamente en el desarrollo de asistentes de diálogo antes de escalar a modelos mayores.
- Investigación sobre destilación y cuantización: el modelo sirve como caso de estudio para analizar cómo se preservan (o degradan) las capacidades del profesor Qwen3-30B-A3B tras la destilación a ~2B parámetros y la cuantización a GGUF.
- Experimentación con modelos sin alineación: útil para investigadores que estudian el comportamiento de modelos sin mecanismos de rechazo, siempre en entornos controlados y con las salvaguardas adecuadas.
- Inferencia local con privacidad de datos: al ejecutarse íntegramente en local mediante llama.cpp u Ollama, permite procesar texto sensible sin enviarlo a servicios en la nube.
- Educación y demostraciones: su tamaño manejable facilita su uso en talleres y cursos sobre modelos de lenguaje, cuantización y despliegue en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de ~2.000 millones de parámetros en GGUF, las estimaciones típicas serían aproximadamente 1,5-2 GB en cuantización Q4, 2,5-3 GB en Q5/Q6 y 4-4,5 GB en Q8 o FP16. Estas cifras son estimaciones generales del ecosistema y no datos confirmados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es compatible con GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, así como con GPUs profesionales (A100, H100) para despliegues de mayor throughput.
- ¿Cabe en consumer GPU? Sí, previsiblemente en la mayoría de GPUs de consumo con 4 GB o más de VRAM en cuantizaciones bajas; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y presumiblemente otros runners compatibles con GGUF (LM Studio, text-generation-webui). El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DistilQwen3-1.7B-uncensored-GGUF | ~2.031 M | No disponible | GGUF | Apache 2.0 | Hugging Face |
| DistilQwen3-1.7B-uncensored (base) | ~2.031 M | No disponible | Safetensors/BF16 | Apache 2.0 | Hugging Face |
| Qwen3-1.7B (original) | ~1.700 M | No disponible | Safetensors/GGUF | Apache 2.0 | Hugging Face |
| Qwen3-30B-A3B (profesor) | 30.000 M (3.000 M activos) | No disponible | Safetensors/GGUF | Apache 2.0 | Hugging Face |

La comparativa se limita a la familia de origen, ya que la información disponible no permite contrastar rendimiento con alternativas de otros desarrolladores. No se dispone de datos de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3, es previsible que herede sesgos del corpus de entrenamiento del profesor, pero no se especifica.
- Riesgo de alucinación: no cuantificado; los modelos de ~2.000 millones de parámetros destilados tienden a alucinar más que sus profesores de mayor tamaño, aunque no hay datos específicos para esta variante.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada y los idiomas soportados no se especifican; no se debe asumir el contexto nativo de Qwen3 sin confirmación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones adicionales, siempre que se mantenga el aviso de licencia y atribución.
- Naturaleza "uncensored": el modelo puede generar contenido ofensivo, ilegal o dañino sin los filtros habituales. Su uso en producción requiere salvaguardas externas (moderación de entrada/salida, filtros de contenido) y revisión legal según el contexto de aplicación.
- Caveats de producción: la información sobre el proceso de destilación y cuantización es escasa; se recomienda validar el modelo en el dominio objetivo antes de desplegarlo. La fecha de creación (2026) y la metodología propietaria del autor requieren verificación independiente de las afirmaciones de la model card.
- Trazabilidad: la model card incluye afirmaciones matemáticas no verificadas externamente y enlaces a un DOI de metodología; conviene contrastar su reproducibilidad antes de basar decisiones técnicas en ellas.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored-GGUF
- Modelo base (BF16): https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored
- Colección DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Metodología "Structure Over Scale" (DOI): https://doi.org/10.57967/hf/8165
- Modelo relacionado (Qwen3-1.7B-Thinking-Distil): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Thinking-Distil
- Modelo relacionado (Qwen3-1.7B-Coder-Distilled-SFT): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
