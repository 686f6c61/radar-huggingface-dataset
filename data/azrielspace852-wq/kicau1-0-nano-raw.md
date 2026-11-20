# azrielspace852-wq/kicau1.0-nano-raw

## Resumen

Kicau 1.0 Nano Raw es un modelo de lenguaje de tipo decoder-only Transformer preentrenado desde cero por el usuario azrielspace852-wq, orientado al idioma indonesio. Se trata de un modelo de escala muy reducida: 35,56 millones de parámetros, dimensión de embedding de 512, 6 capas y 8 cabezas de atención, con una ventana de contexto de 512 tokens y un vocabulario de 32.000 entradas. Su nombre ("nano") y su naturaleza "raw" indican que es un modelo base sin ajuste fino, pensado como punto de partida para experimentación y fine-tuning en tareas downstream en indonesio.

El modelo se distribuye en formato PyTorch nativo (`.pt`), sin pesos en safetensors ni GGUF, y no incluye pipeline declarado en Hugging Face. El repositorio ocupa aproximadamente 0,6 GB e incluye tanto los pesos limpios para inferencia como un checkpoint completo con estado del optimizador para reanudar el entrenamiento o hacer fine-tuning.

Su relevancia es limitada fuera del ámbito de la experimentación: no hay benchmarks publicados, no hay descargas ni interacciones registradas, y su ventana de contexto y tamaño lo sitúan por debajo de los modelos pequeños convencionales. Resulta útil como caso de estudio de preentrenamiento a pequeña escala en un idioma de recursos medios como el indonesio, y como base para tareas de clasificación o generación muy acotadas tras un ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 35.561.472 (35,56 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch en fp32 por defecto) |
| Idiomas soportados | indonesio (id) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); no hay safetensors ni GGUF |
| Dimension de embedding | 512 |
| Cabezas de atencion | 8 |
| Capas | 6 |
| Tamano de vocabulario | 32.000 |
| Pasos de entrenamiento | 7.000 |
| Loss final | 0,0217 |
| Tokenizer | byte-level (encode: byte + 1; decode: byte - 1) |
| Tamano del repositorio | ~0,6 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer decoder-only estándar, con 6 capas, dimensión oculta de 512 y 8 cabezas de atención. El vocabulario de 32.000 entradas se gestiona mediante un tokenizer byte-level muy simple: cada byte se desplaza en una unidad (`byte_value + 1`) para reservar el índice 0, y la decodificación invierte el desplazamiento. Este esquema evita problemas de tokens desconocidos y hace el tokenizer determinista y reproducible, aunque a costa de una tokenización menos eficiente que la de tokenizers BPE entrenados.

El preentrenamiento se realizó desde cero durante 7.000 pasos, con una loss final reportada de 0,0217. No se especifican en la model card el número total de tokens procesados, la composición del corpus, la mezcla de datos ni si hubo fases de RLHF, DPO o instrucción. Tampoco se documentan innovaciones técnicas como atención lineal, decodificación especulativa o mezcla de expertos. El checkpoint `pretrain_step_7000.pt` incluye el estado del optimizador, lo que permite reanudar el entrenamiento o aplicar fine-tuning con mayor estabilidad.

## Capacidades

- Generación de texto autoregresiva en indonesio, limitada a secuencias de hasta 512 tokens.
- Modelo base sin ajuste por instrucciones: no está alineado para seguir órdenes ni para formato conversacional.
- Capacidad de continuación de texto y modelado de lenguaje puro.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del indonesio.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- Tokenizer byte-level que permite procesar cualquier secuencia de bytes, incluidos caracteres no presentes en el corpus de entrenamiento.

## Casos de uso

- Fine-tuning para clasificación de texto en indonesio: el checkpoint con estado del optimizador permite ajustar el modelo para tareas de análisis de sentimiento o categorización de documentos cortos, donde 512 tokens suelen ser suficientes.
- Experimentación académica con preentrenamiento a pequeña escala: sirve como referencia reproducible para estudiar dinámicas de entrenamiento en modelos de menos de 100 M de parámetros y en un idioma de recursos medios.
- Generación de texto acotada en dominios específicos tras fine-tuning: por ejemplo, titulares, pies de foto o respuestas cortas, aprovechando la ventana de 512 tokens.
- Prototipado de pipelines de NLP en indonesio: al ser un modelo ligero, se puede ejecutar en CPU para validar arquitecturas de datos y preprocesado antes de escalar a modelos mayores.
- Investigación sobre tokenizers byte-level: su esquema de codificación simple permite estudiar el impacto de la tokenización en el rendimiento de modelos pequeños.
- Base para modelos distilled o destilados: por su tamaño reducido, puede emplearse como alumno en experimentos de destilación desde modelos mayores entrenados en indonesio.
- Educación y docencia: útil para demostrar el ciclo completo de preentrenamiento, guardado de checkpoints y conversión de pesos en un entorno con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (35,56 M de parámetros equivalen a ~142 MB de pesos, más activaciones y vocabulario); en la práctica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier modelo con 2 GB o más de VRAM, e incluso en CPU.
- Opciones de despliegue: al no haber pesos GGUF ni safetensors, el despliegue estándar es mediante PyTorch nativo; no hay soporte directo documentado para vLLM, llama.cpp, Ollama o TGI. La conversión a otros formatos requeriría trabajo adicional.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la latencia sería muy baja en GPU y moderada en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Kicau 1.0 Nano Raw | 35,56 M | 512 | indonesio | MIT | PyTorch `.pt` | Hugging Face, 0 descargas |
| GPT-2 small | 124 M | 1.024 | inglés (principalmente) | MIT | safetensors, PyTorch | Amplia, con ecosistema de herramientas |
| SmolLM-135M | 135 M | 2.048 | inglés y multilingüe parcial | Apache 2.0 | safetensors, GGUF | Amplia, soporte en llama.cpp y Transformers |
| Qwen2.5-0.5B | 494 M | 32.768 | multilingüe (incluye indonesio) | Apache 2.0 | safetensors, GGUF | Amplia, soporte en vLLM, llama.cpp y Ollama |

La comparativa es orientativa: Kicau 1.0 Nano Raw es entre 3 y 14 veces más pequeño que las alternativas citadas, con un contexto mucho menor y sin ecosistema de herramientas. Su ventaja relativa es la licencia MIT y su especialización en indonesio, aunque no hay benchmarks que permitan comparar su calidad.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones y puede generar texto incoherente o repetitivo sin un fine-tuning previo.
- Ventana de contexto de 512 tokens: insuficiente para documentos largos, conversaciones multi-turno o tareas que requieran contexto extenso.
- Idiomas: entrenado únicamente en indonesio; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación: inherente a los modelos de lenguaje, agravado por el tamaño reducido y la falta de datos de alineación.
- Sesgos: no se documenta el corpus de entrenamiento, por lo que no es posible evaluar sesgos de género, etnia o ideología; se recomienda auditoría antes de uso en producción.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad del uso recae en el integrador.
- Formato de pesos propietario de PyTorch: requiere código personalizado para cargar el modelo (`MiniGPT`), lo que dificulta la integración con ecosistemas estándar.
- Sin benchmarks: no hay evidencia publicada de calidad, lo que desaconseja su uso en producción sin una evaluación propia.
- Fecha de creación futura (2026-11-19) en los metadatos: posible inconsistencia que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/azrielspace852-wq/kicau1.0-nano-raw
