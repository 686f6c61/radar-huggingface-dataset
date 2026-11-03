# ben0925/isomsom_sn92-gen-v91a

## Resumen

`ben0925/isomsom_sn92-gen-v91a` es un modelo de decisión publicado en HuggingFace por el usuario ben0925, etiquetado como entrada de la pista generalista REAX (SN92). No es un modelo conversacional al uso: está diseñado para responder a preguntas de opción múltiple (decision items) mediante una cabeza de letras sobre 255 códigos de respuesta, servido con un prompt fijo del validador y una lectura conjunta con softmax a temperatura 2. Su linaje parte de Qwen/Qwen3.5-27B, pasa por el fine-tune completo `baselabs/mammoth-1` de Base Labs (Baseten) y termina en un LoRA r32 entrenado en modo conjunto sobre el layout de lectura de REAX.

El modelo cuenta con 26.085.330.160 parámetros reales según los pesos safetensors (52,2 GB en el repositorio) y licencia MIT. La model card describe con detalle el proceso de entrenamiento, los datasets de decisión empleados y los padres del merge, pero no ofrece información sobre longitud de contexto, idiomas soportados ni resultados de benchmarks.

Su relevancia es acotada: se trata de una entrada de competición o evaluación dentro de un track específico (REAX/SN92), no de un modelo de propósito general para producción. Resulta útil para quien necesite reproducir o evaluar el pipeline de decisión de SN92, o estudiar técnicas de ajuste fino con cabeza de lectura sobre un backbone de 27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-27B), con cabeza de lectura de letras sobre 255 códigos |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-27B (Apache-2.0), sobre el que Base Labs aplicó un fine-tune completo para decisiones (`baselabs/mammoth-1`, MIT). Sobre esa base se realizó un merge en el layout de lectura conjunta (`danyloooah/sn92-generalist-m1-core2`), cuyos padres publicados incluyen `isomsom/sn92-gen-m87b`, `xflud/sn92-decider-1` y `danyloooah/sn92-generalist-m1-v3a`. Las filas de lectura más allá de la Z (códigos AA en adelante) se rederivaron mediante ajuste por mínimos cuadrados de las filas A..Z sobre las de mammoth-1.

Sobre ese backbone se entrenó un nuevo LoRA r32 (alpha 64) aplicado a todas las capas lineales del modelo de lenguaje, dejando intacta la torre de visión. El entrenamiento se hizo en modo conjunto (atención bidireccional completa sobre el prompt, tal como lo sirve el validador REAX) durante 300 pasos de un schedule coseno de 600, con 32 filas, learning rate 2,5e-5 y semilla 91. La cabeza de letras cubre 255 códigos de respuesta. Los datos incluyen ítems de decisión en formato REAX provenientes de muestras de entrenamiento propias, replay de especialistas públicos de SN92, ítems generados con anclaje por divergencia KL al modelo de partida, ítems de conocimiento de CommonsenseQA, OpenBookQA, MathQA y AQuA-RAT, clasificación de intenciones (BANKING77, MASSIVE en-US, CLINC150), selección de herramientas sobre catálogos ficticios y ítems multietiqueta sí/no sobre resúmenes de PLOS y arXiv. Las filas de lectura se reescalaron por 1,0 y se desplazaron por la media de las filas A y B para la lectura fija a T=2.

## Capacidades

- Respuesta a preguntas de opción múltiple mediante una cabeza de letras sobre 255 códigos (A..Z y AA en adelante).
- Clasificación de intenciones sobre conjuntos de etiquetas completos (entrenado con BANKING77, MASSIVE en-US y CLINC150).
- Selección de herramientas sobre catálogos (entrenado con ítems de selección de herramientas).
- Clasificación multietiqueta sí/no sobre textos científicos y metadatos (PLOS, arXiv).
- Clasificación de registros y resultados (Wikipedia, GitHub Advisory Database, EUR-Lex, legislación del Reino Unido y de Canadá).
- Modo de lectura conjunta con softmax a temperatura 2 sobre las filas de la cabeza de letras.
- No se documenta soporte de tool calling conversacional, agentes multi-paso, visión operativa ni modo thinking en la información disponible.

## Casos de uso

- Evaluación de pipelines de decisión REAX/SN92: el modelo está pensado para servirse con el prompt fijo del validador y la lectura conjunta a T=2, por lo que encaja como entrada reproducible en la evaluación del track generalista.
- Clasificación de intenciones en asistentes conversacionales: al haberse entrenado sobre los conjuntos completos de etiquetas de BANKING77, MASSIVE en-US y CLINC150, puede emplearse para mapear utterances a intenciones en dominios bancarios y de atención al cliente.
- Enrutado de herramientas en agentes: los ítems de selección de herramientas sobre catálogos ficticios permiten usar el modelo para elegir qué herramienta invocar dado un contexto, siempre que se respete el formato de decisión.
- Triaje de literatura científica: los ítems multietiqueta sobre resúmenes de PLOS y arXiv permiten asignar términos temáticos o categorías a nuevos abstracts mediante preguntas sí/no.
- Moderación y clasificación de contenido comunitario: el entrenamiento con páginas de discusión de Wikipedia (AfD, RfD, RfA) y avisos de GitHub permite clasificar registros o discusiones según su resultado esperado.
- Clasificación de registros regulatorios y contractuales: los datos de EUR-Lex, TED y legislación británica y canadiense habilitan tareas de categorización documental en dominios jurídicos y de contratación pública.
- Investigación sobre ajuste fino con cabeza de lectura: el modelo sirve como caso de estudio de LoRA r32 en modo bidireccional sobre un backbone de 27B, con anclaje KL y rederivación de filas de lectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 26-30 GB, aunque no se documentan cuantizaciones oficiales para este modelo.
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPU de 24-48 GB con paralelismo de tensor.
- No cabe en GPU de consumo de 24 GB en precisión completa; en cuantizaciones agresivas (4 bits, no publicadas) podría aproximarse a 16-18 GB, pero no hay artefactos GGUF disponibles.
- Opciones de despliegue: al ser un modelo de decisión con cabeza de lectura personalizada y prompt fijo del validador, requiere un servidor compatible con el formato REAX; no se documenta soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ben0925/isomsom_sn92-gen-v91a | 26,1B | no disponible | MIT | HuggingFace | Cabeza de lectura de 255 códigos, modo decisión REAX |
| baselabs/mammoth-1 | no disponible (base de 27B) | no disponible | MIT | HuggingFace | Fine-tune completo de Qwen3.5-27B para decisiones |
| Qwen/Qwen3.5-27B | 27B (aproximado) | no disponible | Apache-2.0 | HuggingFace | Modelo base conversacional de propósito general |
| isomsom/sn92-gen-m87b | no disponible | no disponible | MIT | HuggingFace | Entrada previa de la misma pista, LoRA sobre mammoth-1 |

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para tareas de decisión con el prompt fijo del validador REAX y lectura conjunta a T=2; su uso fuera de ese formato no está garantizado.
- No se documentan idiomas soportados; el entrenamiento se centra en en-US y datos mayoritariamente en inglés.
- No se dispone de información sobre longitud de contexto, lo que impide planificar usos con entradas largas.
- Riesgo de alucinación inherente a un modelo de 27B ajustado para decisión: las respuestas fuera de la distribución de opciones pueden ser inconsistentes.
- Los sesgos de los datasets de entrenamiento (Wikipedia, EUR-Lex, GitHub Advisories, PLOS, arXiv) pueden trasladarse a las decisiones del modelo.
- Aunque la licencia es MIT, los datos de entrenamiento incluyen fuentes con licencias CC BY-SA 4.0 (Wikipedia, Stack Exchange) y obligaciones de atribución que conviene revisar en el archivo NOTICE del repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- No hay cuantizaciones publicadas ni integración documentada con frameworks de inferencia estándar, lo que complica el despliegue en producción.

## Enlaces

- HuggingFace: https://huggingface.co/ben0925/isomsom_sn92-gen-v91a
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Modelo base de mammoth-1: https://huggingface.co/Qwen/Qwen3.5-27B
- Padre del merge: https://huggingface.co/danyloooah/sn92-generalist-m1-core2
- Entrada previa de la pista: https://huggingface.co/isomsom/sn92-gen-m87b
- Padre decider: https://huggingface.co/xflud/sn92-decider-1
- Padre generalista v3a: https://huggingface.co/danyloooah/sn92-generalist-m1-v3a
