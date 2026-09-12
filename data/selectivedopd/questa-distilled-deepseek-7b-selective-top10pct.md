# SelectiveDOPD/QuestA-Distilled-DeepSeek-7b-Selective-Top10pct

## Resumen

QuestA-Distilled-DeepSeek-7b-Selective-Top10pct es un modelo de generacion de texto de 7.615.616.512 parametros (unos 7,6 B) publicado en HuggingFace por el usuario SelectiveDOPD. La model card es minima: se limita a indicar que el modelo se subio desde el checkpoint `questa_deepseek_r1_7b_JSD_rel_90_100` dentro de los experimentos denominados BiDirect-OPD, y que la rama `main` corresponde a `global_step_300`. El repositorio incluye ademas 14 ramas con checkpoints intermedios (de `global_step_20` a `global_step_280`), lo que apunta a un artefacto de investigacion mas que a un modelo listo para produccion.

Segun la etiqueta `qwen2` del repositorio, la arquitectura es de tipo transformer decoder-only de la familia Qwen2. El nombre del modelo sugiere un proceso de destilacion sobre un modelo de la familia DeepSeek-R1 de 7 B, con algun criterio de seleccion del 10 % superior (`Selective-Top10pct`) y una divergencia de Jensen-Shannon relativa (`JSD_rel_90_100`) como senal de entrenamiento, si bien estos extremos no se detallan en la documentacion disponible y deben tratarse como inferencias a partir del identificador.

Su relevancia es acotada y de caracter experimental: no declara licencia, no especifica idiomas ni contexto, no publica resultados de benchmarks y acumula cero descargas y cero likes en el momento de la consulta. Resulta util para investigacion sobre dinamicas de destilacion y para comparar checkpoints intermedios, pero no hay elementos publicados que respalden su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Qwen2 (segun la etiqueta `qwen2` del repositorio; no confirmado en la model card) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 B) |
| Parametros activos | no aplica (sin indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria de inferencia | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 30,5 GB (consistente con pesos en fp32, unos 30,46 GB para 7,6 B de parametros, o con pesos duplicados entre ramas) |
| Creado | 2026-09-12 |
| Actualizado | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna mas alla de la etiqueta `qwen2`, que situa el modelo en la familia de transformers decoder-only con atencion causal de Qwen2, y del dato de que el checkpoint base se denomina `questa_deepseek_r1_7b_JSD_rel_90_100`. Todo lo demas debe considerarse no disponible: numero de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO y detalles de la funcion de perdida no se documentan en la model card.

El identificador y el nombre del experimento (`BiDirect-OPD`, del ingles *on-policy distillation*) permiten inferir, sin confirmacion por parte del autor, que se trata de un proceso de destilacion desde un modelo mayor de la familia DeepSeek-R1 hacia un estudiante de 7 B, con un criterio de seleccion del 10 % de muestras o tokens mas informativos y una divergencia de Jensen-Shannon relativa entre los percentiles 90 y 100 como metrica de ajuste. El repositorio distribuye exclusivamente pesos finales e intermedios por `global_step`; no incluye scripts de entrenamiento, configuracion de tokenizador publicada ni informe de evaluacion.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Compatibilidad declarada con `text-generation-inference` y con `endpoints_compatible`, lo que indica que puede servirse mediante infraestructura estandar de HuggingFace.
- Razonamiento y posible modo de pensamiento (*thinking*) heredados del modelo docente DeepSeek-R1: no confirmado en la documentacion disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision, audio u otras modalidades: no disponible; el pipeline declarado es exclusivamente de texto.
- Capacidad de evaluacion comparativa entre checkpoints: el repositorio expone 15 ramas (`global_step_20` a `global_step_300`), lo que permite analizar la evolucion del modelo durante el entrenamiento.

## Casos de uso

- Investigacion sobre destilacion selectiva: el modelo permite estudiar como afecta un criterio de seleccion del 10 % superior de muestras a la calidad final, comparando su comportamiento con el de un estudiante entrenado sobre el conjunto completo.
- Analisis de dinamica de entrenamiento por checkpoints: al disponer de las ramas `global_step_20` a `global_step_300`, se puede medir la evolucion de metricas de generacion (perplejidad, coherencia, longitud de respuesta) a lo largo del proceso de destilacion.
- Reproduccion de experimentos academicos: util como referencia en trabajos que comparen metodos de destilacion *on-policy* frente a destilacion *off-policy* sobre modelos de 7 B.
- Prototipado de generacion de texto en entorno controlado: puede emplearse con transformers y TGI para validar arquitecturas de servicio antes de sustituir el modelo por uno con licencia clara.
- Generacion de datos sinteticos para investigacion: util para producir respuestas de referencia que despues se filtren o revisen, siempre que no se pretendan usar comercialmente.
- Fine-tuning experimental: al ser un modelo de 7,6 B en safetensors, admite ajuste con LoRA o QLoRA en GPUs de gama alta para estudiar como se transfiere el conocimiento destilado a dominios concretos.
- Evaluacion de sesgos y alucinacion en modelos destilados: permite medir si la destilacion selectiva amplifica o reduce la tendencia a inventar informacion respecto al modelo docente original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM en fp16 o bf16: alrededor de 15,3 GB solo para pesos, mas entre 1 y 3 GB de cache KV y activaciones, lo que situa el requisito practico en unos 17-20 GB.
- VRAM en fp32: unos 30,5 GB solo para pesos (el repositorio ocupa esta cifra, lo que sugiere que los safetensors distribuidos estan en precision completa), por lo que requiere GPU de 40 GB o mas.
- Cuantizacion a 8 bits: aproximadamente 8 GB de VRAM; a 4 bits (GPTQ, AWQ o GGUF Q4_K_M), en torno a 4,5-5 GB.
- GPU recomendadas: A100 40/80 GB y H100 para fp32 o fp16 con lotes grandes; RTX 4090, RTX 3090 o L40S (24 GB) para fp16; RTX 4060 Ti 16 GB o RTX 4080 para fp16 con lotes pequenos o cuantizacion a 8 bits.
- Compatibilidad con GPU de consumo: si, en tarjetas de 16-24 GB para fp16 y en tarjetas de 8-12 GB si se cuantiza a 4 bits. En GPUs de 6 GB solo cabria con cuantizaciones de 4 bits muy agresivas y contexto reducido.
- Opciones de despliegue: transformers (libreria declarada), vLLM y Text Generation Inference para servicio de alto rendimiento, llama.cpp u Ollama previa conversion a GGUF (no incluida en el repositorio).
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de informacion publica general y deben verificarse en sus fichas respectivas; los campos del modelo analizado que no constan se indican como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| QuestA-Distilled-DeepSeek-7b-Selective-Top10pct | 7,6 B | no disponible | no disponible | HuggingFace, 0 descargas, 15 ramas de checkpoint |
| DeepSeek-R1-Distill-Qwen-7B | 7,6 B (base Qwen2.5) | 131.072 tokens | MIT (verificar en su ficha) | Ampliamente descargado, con benchmarks publicados |
| Qwen2.5-7B | 7,6 B | 131.072 tokens | Apache 2.0 (segun variante) | Muy extendido, con soporte en vLLM y llama.cpp |
| Mistral-7B-v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | Muy extendido, con gran ecosistema de cuantizaciones |

La diferencia relevante no esta en el rendimiento, del que no hay datos para el modelo analizado, sino en el soporte: los tres modelos de referencia declaran licencia, contexto e idiomas, mientras que QuestA carece de todos esos datos y de evaluaciones publicadas.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso de uso comercial ni redistribucion; conviene contactar con el autor antes de cualquier despliegue.
- No se declaran idiomas soportados, por lo que no hay garantia de calidad en castellano ni en ningun otro idioma concreto.
- No se especifica la longitud de contexto, lo que impide planificar aplicaciones con conversaciones largas o documentos extensos.
- No hay resultados de benchmarks publicados, de modo que no existe evidencia cuantitativa de su calidad frente a alternativas.
- Riesgo de alucinacion inherente a los modelos destilados de la familia DeepSeek-R1 y, en general, a cualquier modelo generativo de 7 B; la falta de evaluacion agrava este punto.
- Sesgos desconocidos: no se documenta la composicion del dataset de destilacion ni si se aplicaron tecnicas de alineacion.
- Artefacto de investigacion sin mantenimiento: cero descargas y cero likes, publicacion y ultima actualizacion en la misma fecha, sin historial de soporte.
- Los pesos parecen distribuirse en fp32 (30,5 GB), lo que duplica innecesariamente los requisitos de almacenamiento y transferencia frente a una version fp16.
- El nombre del modelo incluye referencias a DeepSeek y a Qwen2 que no estan confirmadas por el autor en la model card; cualquier supuesto sobre el modelo docente o la tokenizador deberia validarse antes de usarlo en produccion.
- No se incluye configuracion de tokenizador ni scripts de chat template en la informacion disponible, por lo que el formato exacto de prompt es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SelectiveDOPD/QuestA-Distilled-DeepSeek-7b-Selective-Top10pct
- Ramas de checkpoint: `global_step_20`, `global_step_40`, `global_step_60`, `global_step_80`, `global_step_100`, `global_step_120`, `global_step_140`, `global_step_160`, `global_step_180`, `global_step_200`, `global_step_220`, `global_step_240`, `global_step_260`, `global_step_280` (disponibles en el mismo repositorio)
- Paper, blog o repositorio del autor: no disponible
- Demo o espacio de inferencia: no disponible
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces recuperados correspondian a paginas de Visual Studio y no guardan relacion con el contenido de esta ficha.
