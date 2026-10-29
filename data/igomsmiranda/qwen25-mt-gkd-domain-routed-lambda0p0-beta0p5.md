# igomsmiranda/qwen25-mt-gkd-domain-routed-lambda0p0-beta0p5

## Resumen

`igomsmiranda/qwen25-mt-gkd-domain-routed-lambda0p0-beta0p5` es un checkpoint de lenguaje de unos 1.543.714.304 parámetros (1,54 mil millones) publicado en HuggingFace por el usuario igomsmiranda. Se trata de un ajuste fino (fine-tuning) obtenido con TRL sobre una arquitectura de la familia Qwen2, según las etiquetas del repositorio y el campo `architectures` de los pesos en safetensors. El modelo no se presenta como un lanzamiento oficial, sino como el resultado de un experimento de destilación de conocimiento multi-profesor (multi-teacher GKD, *Generalized Knowledge Distillation*) con enrutado por dominio.

El nombre del checkpoint resume su configuración experimental: estudiante Qwen2.5 sometido previamente a un SFT completo (`fullsft_student`), profesores también con SFT completo (`fullsft_teachers`), enrutado de profesores por dominio (`domain_routed`), un parámetro lambda de 0,0 (`lambda0p0`), beta de 0,5 (`beta0p5`), precisión bf16 y evaluación/entrenamiento con 256 tokens por secuencia (`bf16_256tok`, `eval500`). Todo ello apunta a un trabajo de investigación sobre mezcla de profesores especializados, no a un modelo listo para producción.

Su relevancia es, por tanto, metodológica: sirve como referencia reproducible de cómo se comporta la destilación *on-policy* multi-profesor con enrutado por dominio en un estudiante pequeño. No hay model card sustantiva, ni licencia declarada, ni datos de evaluación publicados, lo que limita seriamente su uso fuera del contexto del experimento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (según tags y pesos safetensors) |
| Parámetros totales | 1.543.714.304 (dato real de safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el entrenamiento se realizó con secuencias de 256 tokens según el nombre del checkpoint) |
| Tipos de cuantización | No disponible oficialmente; al ser safetensors en bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estándar |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin contenido legal) |
| Formato de pesos | safetensors (repo de 3,1 GB, compatible con transformers) |
| Ventana de vocabulario / tokenizer | No disponible (tokenizers 0.22.2 en el entrenamiento) |
| Versión de transformers | 5.9.0 (según la model card) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen2, con 1,54 mil millones de parámetros en bf16 (3,1 GB de pesos, coherente con el tamaño del repositorio). El modelo parte de un estudiante que ya había recibido un SFT completo y se entrena después mediante `MultiTeacherGKD`, la implementación de *Generalized Knowledge Distillation* de TRL. La configuración del experimento usa varios profesores con enrutado por dominio: cada ejemplo se dirige al profesor correspondiente a su dominio, y la pérdida combina la señal del profesor con la del estudiante bajo los hiperparámetros lambda = 0,0 y beta = 0,5. En la formulación habitual de GKD, lambda controla el peso de la divergencia respecto al profesor en modo *on-policy* y beta la interpolación entre la distribución del profesor y la del estudiante.

El entrenamiento se realizó con TRL 1.0.0.dev0, Transformers 5.9.0, PyTorch 2.6.0+cu124, Datasets 4.8.5 y Tokenizers 0.22.2, con un run de Weights & Biases asociado. El identificador del checkpoint indica secuencias de 256 tokens (`bf16_256tok`) y una evaluación con 500 ejemplos (`eval500`). No se documentan el número total de tokens de entrenamiento, la composición del dataset, los profesores concretos ni si hubo etapas posteriores de RLHF o DPO; la model card generada automáticamente por TRL no aporta esa información y el campo del modelo base aparece como `None`. La innovación técnica, por tanto, es el esquema de destilación multi-profesor con enrutado por dominio, no cambios en la arquitectura.

## Capacidades

- Generación de texto conversacional: la model card incluye un ejemplo de uso con `pipeline("text-generation")` y mensajes con rol `user`, propio de un modelo ajustado sobre formato de chat.
- Razonamiento y respuesta a preguntas abiertas de tipo dilema o reflexión, según el ejemplo de la propia model card.
- Destilación multi-profesor por dominio: el checkpoint está optimizado para reproducir el comportamiento agregado de varios profesores especializados, lo que en teoría mejora el rendimiento en dominios cubiertos por los profesores.
- Compatibilidad con el ecosistema transformers y text-generation-inference (tags `text-generation-inference` y `endpoints_compatible`), lo que permite desplegarlo con el servidor TGI de HuggingFace.
- Soporte de cuantización posterior mediante herramientas estándar (llama.cpp, GPTQ, AWQ), aunque el autor no publica versiones cuantizadas.
- Capacidades de tool calling, agentes, visión, audio o modo *thinking*: no disponibles o no documentadas en la información proporcionada.
- Capacidades multilingües: no declaradas; no se puede confirmar el grado de cobertura fuera del inglés.

## Casos de uso

- Investigación en destilación de conocimiento: reproducir o comparar el efecto del enrutado por dominio y de los hiperparámetros lambda/beta en un estudiante de 1,5B, usando este checkpoint como línea base frente a variantes del mismo autor.
- Generación de texto ligera en local: con ~3,1 GB de pesos en bf16, cabe en GPUs de consumo y permite prototipar asistentes conversacionales sin infraestructura dedicada.
- Experimentos de alineación y evaluación comparativa de estudiantes pequeños: útil como sujeto de pruebas en pipelines de evaluación de modelos destilados, dado que su configuración exacta está codificada en el nombre.
- Servicio de inferencia con TGI: el tag `endpoints_compatible` y el formato safetensors permiten levantarlo con Text Generation Inference para pruebas de latencia y throughput en un solo acelerador.
- Base para fine-tuning posterior: al ser un checkpoint transformers estándar de 1,5B, se puede reajustar con SFT o DPO (TRL) para tareas concretas antes de evaluar el efecto arrastrado de la destilación.
- Evaluación de riesgos de checkpoints comunitarios: sirve como caso de estudio de modelos sin licencia ni model card sustantiva, útil para diseñar políticas internas de aprobación de artefactos.
- Docencia y formación: ejemplo práctico de fine-tuning con TRL y registro en Weights & Biases para explicar el flujo completo de un experimento de destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card generada por TRL no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y la única referencia a evaluación es el sufijo `eval500` del nombre del checkpoint, que indica el tamaño del conjunto de evaluación pero no sus resultados.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 3,1 GB solo para pesos, más 1-2 GB de memoria de activaciones y caché KV; en la práctica, 5-6 GB para inferencia con contexto corto.
- VRAM estimada en int8: alrededor de 1,6 GB de pesos, con un total práctico de 3-4 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 1 GB de pesos, ejecutable en GPUs de 4 GB o incluso en CPU con llama.cpp (previa conversión).
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en tarjetas de 8 GB con cuantización; también en Apple Silicon mediante Metal.
- GPU de datacenter: A100, H100, L40S y L4 sin problemas; el modelo es demasiado pequeño para aprovechar setups multi-GPU, que no aportarían rendimiento.
- Opciones de despliegue: transformers (versión 5.9.0 en el entrenamiento, conviene verificar compatibilidad con versiones estables), Text Generation Inference por el tag `endpoints_compatible`, y llama.cpp/Ollama tras convertir los safetensors a GGUF (no hay GGUF publicado por el autor).
- Latencia y throughput: no disponibles; no se han publicado mediciones. En una RTX 4090 con bf16 y lotes pequeños es razonable esperar decenas de tokens por segundo para un modelo de este tamaño, pero es una estimación, no un dato medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| qwen25-mt-gkd-domain-routed-lambda0p0-beta0p5 (este) | 1,54 B | No disponible | No disponible | HuggingFace, 0 descargas, 0 likes | No disponibles |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (dato público de la familia) | Apache-2.0 | HuggingFace, ampliamente descargado | Sí, publicados por el autor |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens (dato público) | Apache-2.0 | HuggingFace | Sí, publicados por el autor |
| Gemma 2 2B Instruct | 2,6 B | 8.192 tokens (dato público) | Términos de uso de Gemma | HuggingFace (acceso condicionado) | Sí, publicados por el autor |

La comparación relevante es frente a Qwen2.5-1.5B-Instruct, ya que este checkpoint parte presumiblemente de esa familia y tamaño; la diferencia principal no es de arquitectura sino de licencia (ausente aquí), documentación (nula) y evaluación (inexistente). No se dispone de datos que permitan afirmar que la destilación multi-profesor mejora al modelo base en ninguna tarea concreta.

## Limitaciones y advertencias

- Ausencia total de licencia: la model card contiene `licence: license`, un marcador sin contenido legal. Sin licencia explícita no hay autorización clara de uso comercial ni de redistribución; trátese como no apto para producción.
- Model card generada automáticamente por TRL, con el modelo base indicado como `None` y sin información sobre datos de entrenamiento, profesores utilizados ni composición del corpus.
- Sin resultados de evaluación publicados: no se puede verificar qué mejora aporta el enrutado por dominio ni si el checkpoint supera al estudiante original.
- Entrenamiento con secuencias de 256 tokens según el nombre del checkpoint, lo que sugiere un ajuste orientado a respuestas cortas; el comportamiento en contextos largos es desconocido y probablemente degradado.
- Riesgo de alucinación propio de un modelo de 1,5B, agravado por la falta de etapas documentadas de alineación (RLHF/DPO) tras la destilación.
- Sesgos desconocidos: al no documentarse la procedencia de los datos ni de los profesores, no es posible auditar sesgos de género, etnia, idioma o dominio.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano ni en idiomas distintos del inglés, aunque la familia Qwen2.5 sea multilingüe.
- Repositorio sin descargas ni interacción (0 descargas, 0 likes) y creado en octubre de 2026: no hay evidencia de uso real ni de revisión por la comunidad.
- El ejemplo de la model card apunta a `model="None"`, por lo que hay que sustituir manualmente el identificador; además, la plantilla de chat no está documentada y podría requerir la del modelo base.
- Dependencia de Transformers 5.9.0 durante el entrenamiento: conviene validar la carga con versiones estables antes de integrarlo en un pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/igomsmiranda/qwen25-mt-gkd-domain-routed-lambda0p0-beta0p5
- Run de Weights & Biases del entrenamiento: https://wandb.ai/diogomsmirandaa-team/mopd-qwen25-fullsft-mt-gkd/runs/ctpzco1z
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Repositorio de Text Generation Inference: https://github.com/huggingface/text-generation-inference
- Repositorio de llama.cpp (para conversión a GGUF): https://github.com/ggml-org/llama.cpp
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos por el buscador no guardan relación con este checkpoint ni con Qwen2.5.
