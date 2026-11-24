# paradise-lab/paradise-r2-v1

## Resumen

Paradise-r2-v1 es un modelo de lenguaje publicado por paradise-lab en Hugging Face bajo licencia Apache 2.0 y acceso restringido (gated). Con 31.273.088.876 parámetros (aproximadamente 31,3 mil millones) almacenados en formato safetensors, se posiciona en la franja de modelos densos de gran tamano, un segmento en el que compite con alternativas como Qwen2.5-32B o Gemma 2 27B. La etiqueta `gemma4` en los metadatos sugiere que el modelo se construye sobre la familia Gemma de Google, aunque no se dispone de confirmacion oficial en la informacion proporcionada.

El repositorio ocupa 62,6 GB, un tamano coherente con pesos en precision bf16/fp16 para 31,3 mil millones de parametros (unos 62,5 GB teoricos), lo que indica que no se distribuyen cuantizaciones en el propio repo. El modelo fue creado el 24 de noviembre de 2026 y no registra descargas ni likes en el momento de la consulta, por lo que se trata de un lanzamiento muy reciente y sin traccion comunitaria documentada.

La relevancia de este modelo radica en su licencia permisiva (Apache 2.0) combinada con un tamano que permite despliegue en una sola GPU de 80 GB (A100/H100) en bf16, o en GPUs de consumo con cuantizacion a 4 bits. Sin embargo, la ausencia de model card detallada, benchmarks publicados e idiomas declarados limita seriamente la evaluacion previa a su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4` sugiere base de la familia Gemma) |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Los metadatos de Hugging Face incluyen la etiqueta `gemma4`, lo que apunta a una arquitectura transformer derivada de la familia Gemma de Google, pero no se confirma si se trata de un fine-tuning, una destilacion o un entrenamiento desde cero. Tampoco se especifica si emplea atencion con ventana deslizante, atencion lineal u otras variantes presentes en las generaciones recientes de Gemma.

Respecto al entrenamiento, no se han publicado datos sobre el numero de tokens, la composicion del corpus, el uso de RLHF, DPO u otras tecnicas de alineacion, ni innovaciones como decodificacion especulativa o modos de razonamiento extendido. El tamano del repositorio (62,6 GB) es consistente con pesos en bf16 sin cuantizaciones adicionales, pero no aporta informacion sobre el proceso de entrenamiento.

## Capacidades

- Generacion de texto autoregresiva: capacidad esperada por su naturaleza de modelo de lenguaje, aunque no se documenta explicitamente.
- Razonamiento y matematicas: no disponible; no hay benchmarks ni declaraciones del autor.
- Generacion de codigo: no disponible; no se confirma soporte ni calidad.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Modo de razonamiento extendido: no disponible.

## Casos de uso

- Evaluacion comparativa interna: dado su tamano de ~31 B y licencia Apache 2.0, puede emplearse como candidato en pruebas A/B frente a modelos de la misma franja (Qwen2.5-32B, Gemma 2 27B) para tareas de generacion y razonamiento, siempre que se valide primero su calidad con un conjunto de evaluacion propio.
- Fine-tuning especifico de dominio: al ser un modelo denso de 31 B con pesos safetensors, es viable aplicar LoRA o QLoRA sobre dominios verticales (legal, sanitario, financiero) en una A100 de 80 GB o en configuraciones multi-GPU, aunque requiere verificar previamente la calidad base.
- Despliegue on-premise con requisitos de privacidad: la licencia Apache 2.0 permite uso comercial sin restricciones de atribucion adicionales, lo que facilita su integracion en infraestructuras privadas donde no se pueden usar APIs externas.
- Generacion aumentada por recuperacion (RAG): un modelo de 31 B puede servir como generador en pipelines RAG, aunque la longitud de contexto no esta documentada y debe medirse empiricamente antes de comprometerse con ventanas largas.
- Destilacion hacia modelos menores: por su tamano y licencia permisiva, puede actuar como profesor en procesos de destilacion hacia modelos de 7-8 B para despliegue en edge.
- Investigacion academica sobre alineacion y evaluacion: al ser un modelo reciente y poco documentado, resulta util como objeto de estudio para caracterizar sesgos y comportamientos de modelos de la familia Gemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: ~62,5 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica requiere una GPU de 80 GB (A100, H100) o dos GPUs de 40-48 GB con tensor parallelism.
- VRAM estimada en cuantizacion 8 bits: ~31-33 GB, viable en una RTX 4090 (24 GB) no; requiere A6000 (48 GB) o dos RTX 4090.
- VRAM estimada en cuantizacion 4 bits: ~16-18 GB, cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen limitado para contexto.
- GPUs recomendadas: H100 80 GB o A100 80 GB para inferencia en bf16; A6000/L40S para 8 bits; RTX 4090 para 4 bits.
- Cabe en GPU de consumo: solo con cuantizacion a 4 bits (RTX 4090, RTX 3090, RTX 4080 con 16 GB queda al limite y probablemente insuficiente).
- Opciones de despliegue: vLLM y TGI para safetensors en bf16; llama.cpp/Ollama requeririan conversion a GGUF, no publicada en el repo.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| paradise-lab/paradise-r2-v1 | ~31,3 B | no disponible | Apache 2.0 | Gated en HF | Sin benchmarks ni model card detallada |
| Qwen2.5-32B | 32,5 B | 128 K (version base/instruccion) | Apache 2.0 (mayoria de variantes) | Abierto en HF | Benchmarks publicados y amplio ecosistema |
| Gemma 2 27B | 27 B | 8 K | Gemma Terms (uso comercial permitido con condiciones) | Abierto en HF | Base probable de la familia; benchmarks publicados |
| Mistral Large 2 / Mistral Small 3 | 123 B / 24 B | 128 K / 32 K | Mistral Research / Apache 2.0 (Small 3) | Pesos disponibles con condiciones | Alternativas de referencia en la franja |

La comparacion cuantitativa con benchmarks no es posible porque paradise-r2-v1 no publica resultados. En terminos de licencia, Apache 2.0 es mas permisiva que los terminos de Gemma y que la licencia de investigacion de Mistral Large.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, idiomas, contexto ni alineacion, lo que impide evaluar riesgos de sesgo y toxicidad antes del despliegue.
- Riesgo de alucinacion no caracterizado: sin benchmarks de veracidad ni evaluaciones de factualidad, el modelo debe someterse a pruebas propias antes de usarse en tareas sensibles.
- Contexto desconocido: no se puede asumir una ventana larga; hay que medirla empiricamente.
- Idiomas no declarados: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles (si es que el modelo esta entrenado principalmente en ingles, algo que tampoco se confirma).
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la evaluacion y a la integracion en pipelines automatizados.
- Sin cuantizaciones oficiales: la conversion a GGUF/AWQ/GPTQ corre por cuenta del usuario, con el riesgo de degradacion que ello implica.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el usuario asume toda la responsabilidad legal y etica sobre el uso.
- Modelo sin traccion comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia de validacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/paradise-lab/paradise-r2-v1
