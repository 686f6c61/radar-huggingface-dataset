# LastMachine/Qwen3-8B-ZeroZero-Heretic-GGUF

## Resumen

Qwen3-8B-ZeroZero-Heretic-GGUF es una cuantización Q4_K_M en formato GGUF del modelo Qwen3-8B-ZeroZero-Heretic, un derivado de Qwen3-8B de Alibaba Cloud modificado por el usuario LastMachine mediante la herramienta Heretic 2.0.0. El objetivo del proyecto es reducir drásticamente la tasa de rechazos (refusals) ante peticiones consideradas dañinas y eliminar patrones de lenguaje redundantes o vacíos (denominados "slop" por el autor), manteniendo al mismo tiempo el rendimiento en pruebas de hechos y lógica. El modelo conserva la arquitectura original de Qwen3-8B, con 8.190.735.360 parámetros totales.

La relevancia de esta ficha es doble: por un lado, documenta un caso de "abliteration" o des censura aplicada sobre un modelo instructivo moderno; por otro, ofrece una versión GGUF lista para ejecutarse en llama.cpp, LM Studio y herramientas compatibles, lo que facilita su despliegue en hardware de consumo. El autor advierte explícitamente de que el modelo responde a muchas peticiones que un modelo convencional rechazaría, incluidas algunas potencialmente dañinas.

El repositorio ocupa aproximadamente 5 GB y contiene un único archivo GGUF Q4_K_M. La model card indica que las métricas publicadas se midieron sobre el modelo completo en 16 bits, no sobre esta cuantización, por lo que deben esperarse diferencias menores. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B; detalles específicos de capas y atención no disponibles en la información proporcionada) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen3-8B no se detalla en la model card) |
| Tipos de cuantizacion | Q4_K_M (única cuantización publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-8B, un transformer decoder-only de 8.190 millones de parámetros. La información proporcionada no detalla el número de capas, la dimensión oculta, el tipo de atención ni la longitud de contexto nativa, por lo que estos datos deben consultarse en la ficha del modelo base Qwen/Qwen3-8B. Tampoco se especifica la composición del dataset de entrenamiento original ni si hubo fases de RLHF o DPO; esos detalles corresponden al modelo Qwen3-8B de Alibaba Cloud.

La modificación introducida por LastMachine se realizó con Heretic 2.0.0, una herramienta de "abliteration" que ajusta los pesos para reducir la probabilidad de respuestas de rechazo. Sobre esa base se aplicó además un proceso denominado "noslop", orientado a disminuir la frecuencia de palabras y construcciones vacías. La model card reporta que, frente a Qwen3-8B original, los rechazos en la prueba de prompts dañinos de Heretic cayeron de 100/100 a 9/100 (91 % menos), las respuestas que activan la lista de "slop" bajaron de 78/100 a 25/100 (68 % menos) y las palabras de slop por cada 1.000 pasaron de 16,5 a 3,6 (78 % menos). Las comprobaciones de hechos y lógica se mantuvieron en 13/15, sin cambios. Estas cifras se midieron sobre el modelo de 16 bits, no sobre esta cuantización Q4_K_M.

## Capacidades

- Generación de texto conversacional y de formato largo, incluyendo narrativa y redacción creativa.
- Respuesta a peticiones que modelos convencionales rechazan, con una tasa de rechazo muy reducida según las métricas del autor.
- Reducción de muletillas y fórmulas vacías gracias al ajuste "noslop".
- Razonamiento y comprobaciones básicas de hechos y lógica, con un rendimiento declarado de 13/15 en las pruebas del autor.
- Compatibilidad con el ecosistema GGUF: llama.cpp, LM Studio y otras herramientas que lean este formato.
- Etiquetas del repositorio que sugieren compatibilidad con endpoints conversacionales (`endpoints_compatible`, `conversational`).
- Soporte de tool calling, agentes o multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación creativa sin restricciones temáticas: el modelo está pensado para escritura de ficción, narrativa y guiones donde el autor quiere evitar rechazos por contenido sensible; su ajuste "noslop" reduce además las fórmulas vacías en textos largos.
- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de un modelo con guardarraíles reducidos frente a uno alineado, comparando tasas de rechazo y calidad de respuesta en entornos controlados.
- Pruebas de robustez y red teaming: útil para evaluar filtros, clasificadores de contenido y sistemas de moderación, ya que genera respuestas que un modelo estándar bloquearía.
- Despliegue local en hardware de consumo: el archivo Q4_K_M de unos 5 GB cabe en GPUs con 8 GB de VRAM o en Apple Silicon, lo que facilita prototipos y pruebas offline con llama.cpp o LM Studio.
- Generación de texto asistida en pipelines de CI: al ser un GGUF compatible con llama.cpp, puede integrarse en scripts de generación de documentación, resúmenes o textos de prueba sin depender de APIs externas.
- Experimentación con cuantizaciones: sirve como caso de estudio para medir cuánto se degradan las métricas de rechazo y "slop" al pasar del modelo de 16 bits a Q4_K_M.
- Bases de datos sintéticas de diálogo: puede emplearse para generar conversaciones de entrenamiento o evaluación en dominios donde se necesita baja tasa de rechazo, siempre con revisión humana posterior.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas internas del autor, medidas sobre el modelo de 16 bits y no sobre esta cuantización Q4_K_M:

| Medida | Antes → después | Cambio |
|---|---:|---:|
| Rechazos en la prueba de prompts dañinos de Heretic | 100/100 → 9/100 | 91 % menos |
| Respuestas que activan la lista de "slop" | 78/100 → 25/100 | 68 % menos |
| Palabras de slop por 1.000 | 16,5 → 3,6 | 78 % menos |
| Comprobaciones de hechos y lógica superadas | 13/15 → 13/15 | Sin cambio |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con la cuantización Q4_K_M, incluyendo overhead de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 o H100 para mayor throughput; cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; también en Apple Silicon mediante el build MLX mencionado por el autor.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), LM Studio y otras herramientas compatibles con GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LastMachine/Qwen3-8B-ZeroZero-Heretic-GGUF | 8,19 B | no disponible | Apache 2.0 | GGUF Q4_K_M | Rechazos reducidos un 91 % y slop un 78 % según el autor |
| Qwen/Qwen3-8B | 8,19 B | no disponible en esta ficha | Apache 2.0 | safetensors y otras | Modelo base alineado, con guardarraíles estándar |
| LastMachine/Qwen3-8B-ZeroZero-Heretic | 8,19 B | no disponible | Apache 2.0 | 16 bits | Versión completa sin cuantizar; origen de las métricas publicadas |
| LastMachine/Qwen3-8B-ZeroZero-Heretic-MLX | 8,19 B | no disponible | Apache 2.0 | MLX | Variante para Apple Silicon |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Los guardarraíles de seguridad están reducidos de forma deliberada: el modelo responde a muchas peticiones que un modelo convencional rechazaría, incluidas algunas potencialmente dañinas.
- La model card advierte de que un menor número de rechazos no implica mayor veracidad; el modelo puede producir contenido falso, sesgado o peligroso.
- En temas relacionados con China ofrece una versión oficial saneada según el autor; no debe usarse como fuente de hechos sobre China ni para decisiones financieras, médicas o legales.
- Las métricas publicadas se midieron sobre el modelo de 16 bits, no sobre esta cuantización Q4_K_M, por lo que pueden existir diferencias de rendimiento.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que dificulta planificar despliegues multilingües o con ventanas largas.
- El acceso está sujeto a un formulario de aceptación de términos (gated model) en el que el usuario declara el uso previsto y acepta no emplear el modelo para dañar, manipular o engañar a personas.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal y ética del contenido generado.
- El proyecto es independiente y no está afiliado ni respaldado por Qwen, Alibaba Cloud, Anthropic ni el proyecto Heretic.

## Enlaces

- Repositorio GGUF: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic-GGUF
- Modelo base modificado (16 bits): https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic
- Variante MLX para Apple Silicon: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic-MLX
- Modelo original Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Herramienta Heretic: https://github.com/p-e-w/heretic
