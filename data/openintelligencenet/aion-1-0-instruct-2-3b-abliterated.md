# OpenIntelligenceNet/Aion-1.0-Instruct-2.3B-Abliterated

## Resumen

Aion-1.0-Instruct-2.3B-Abliterated es un modelo de lenguaje de tipo transformer decoder-only, instruction-tuned y posteriormente sometido a un proceso de *abliteration* (eliminacion de los comportamientos de rechazo) por parte del usuario OpenIntelligenceNet. Con 2.288.831.488 parametros reales segun los pesos en safetensors, se posiciona en la franja de modelos pequenos orientados a inferencia en hardware modesto, incluyendo CPU y GPUs de consumo con poca VRAM.

El modelo parte de una base "Aion-1.0-Instruct" (no documentada en la informacion disponible) y se distribuye con la promesa de mantener intacta la capacidad del modelo original: el autor reporta una divergencia KL "muy baja" respecto al modelo base y una tasa de rechazo de 5 sobre 100 en sus prompts de prueba. La etiqueta `abliterated`/`uncensored` indica que se han eliminado las negativas a responder, lo que lo hace relevante para investigadores que estudian alineamiento, edicion de comportamiento en modelos y evaluacion de salvaguardas.

Su interes practico actual reside en el tamano: ~2.3B parametros permiten ejecutarlo en fp16 con unos 5 GB de VRAM (por ejemplo en una Tesla T4) o en CPU con 5-10 GB de RAM, y en 4 bits con bitsandbytes en 2-3 GB de VRAM. La licencia MIT facilita su uso comercial, aunque la ausencia de benchmarks publicos y de documentacion sobre el entrenamiento limita seriamente su evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM); detalles internos no disponibles |
| Parametros totales | 2.288.831.488 (~2.3B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, fp32, 4-bit (bitsandbytes); no se mencionan GGUF/AWQ/GPTQ |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors; requiere `trust_remote_code=True` (custom_code) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo causal de generacion de texto cargable con `AutoModelForCausalLM` de Transformers y que requiere codigo personalizado (`custom_code`), lo que sugiere una implementacion de atencion o de capas no estandar empaquetada en el repositorio. No se especifican numero de capas, dimension oculta, cabezas de atencion, tipo de positional encoding ni si emplea GQA/MQA.

Tampoco hay datos sobre el corpus de preentrenamiento, el numero de tokens, la composicion del dataset de instrucciones ni si se aplico RLHF, DPO u otra tecnica de alineamiento. Lo unico documentado es el post-procesado: una ablacion de la direccion de rechazo (abliteration) que, segun el autor, produce una divergencia KL "muy baja" frente al modelo original, manteniendo la distribucion de salida cercana al base. No se aportan cifras de KL, metodologia exacta ni conjunto de evaluacion.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat (`apply_chat_template` con roles user/assistant).
- Instrucciones de un solo turno y multi-turno basicas; el autor lo etiqueta como `conversational`.
- Respuestas sin rechazo ante peticiones que un modelo alineado declinaria (tasa reportada de 5/100 rechazos).
- Inferencia en CPU y en GPU de gama baja (fp16, fp32, 4-bit).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking).
- Capacidad multilingue limitada al ingles segun la etiqueta `language: en`.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como objeto de estudio para medir como la abliteration afecta a la tasa de rechazo y a la calidad general, comparando respuestas con el modelo base original.
- Prototipado rapido en local: con ~5 GB de VRAM en fp16 o 2-3 GB en 4 bits, permite iterar sobre prompts y plantillas de chat en un portatil o en una T4 sin aprovisionar infraestructura.
- Generacion de texto en entornos con recursos limitados: resumenes, reescritura y generacion de parrafos cortos en ingles donde el coste por token y la latencia importan mas que la calidad puntera.
- Educacion y demos de LLM: su tamano reducido y su carga sencilla con Transformers lo hacen util para talleres donde se explica el ciclo completo de inferencia, cuantizacion y plantillas de chat.
- Generacion de datos sinteticos para experimentos: al no rechazar peticiones, puede emplearse para producir corpus de entrenamiento o de evaluacion en dominios donde otros modelos filtran, siempre bajo revision humana.
- Evaluacion de salvaguardas externas: util para probar clasificadores de contenido, filtros de salida y sistemas de moderacion que deban operar sobre un modelo sin rechazos propios.
- Chatbot de dominio acotado en ingles: con un system prompt y filtros propios, puede desplegarse como asistente interno de bajo coste en una unica GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo aportado por el autor es la tasa de rechazo (5/100) y una divergencia KL descrita cualitativamente como "muy baja", sin cifra ni conjunto de evaluacion asociado.

## Requisitos de hardware

- VRAM estimada en fp16: ~5 GB (cifra del autor); en 4 bits con bitsandbytes: ~2-3 GB; en CPU fp32: ~5-10 GB de RAM.
- GPU recomendadas: Tesla T4 (referencia explicita del autor), GPUs de consumo con 6-8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090 sobradamente).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas en fp16, y con 4 GB o menos en 4 bits.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y `accelerate`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF limita el despliegue via llama.cpp/Ollama sin conversion previa.
- Latencia y throughput: no disponibles. El autor solo indica que es "rapido" en una unica GPU de consumo como la T4.
- Nota practica del autor: si aparecen errores `nan`/`inf` en fp16, usar `do_sample=False`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Aion-1.0-Instruct-2.3B-Abliterated | ~2.3B | no disponible | en | MIT | Abliterated; sin benchmarks publicos |
| Qwen2.5-1.5B-Instruct | ~1.5B | 32k (segun documentacion publica del modelo) | multilingue | Apache 2.0 | Benchmarks publicos y amplio ecosistema |
| Llama-3.2-1B-Instruct | ~1.2B | 128k (segun documentacion publica del modelo) | multilingue | Llama 3.2 Community License | Benchmarks publicos; licencia con restricciones |
| Gemma-2-2B-it | ~2.6B | 8k (segun documentacion publica del modelo) | multilingue | Gemma Terms of Use | Benchmarks publicos; licencia con restricciones |

La comparacion con alternativas de la misma franja es desfavorable en trazabilidad: los tres modelos de referencia publican arquitectura, contexto y resultados de evaluacion, mientras que Aion no aporta ninguno de esos datos. Su ventaja diferencial es la licencia MIT sin restricciones y la ausencia de rechazos; su desventaja, la falta de evidencia cuantitativa de calidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicos: no hay evidencia cuantitativa de calidad en razonamiento, codigo, matematicas o comprension lectora.
- Modelo abliterated: no rechaza peticiones de forma fiable, por lo que puede generar contenido danino, ilegal o inseguro. Requiere salvaguardas externas antes de exponerlo a usuarios.
- Solo ingles segun la etiqueta de idioma; el rendimiento en castellano es desconocido y probablemente deficiente.
- Longitud de contexto no documentada: no es posible planificar aplicaciones con contexto largo sin medirla empiricamente.
- Riesgo de alucinacion no cuantificado, agravado por el tamano reducido del modelo y la falta de evaluaciones.
- Sesgos desconocidos: no se documenta composicion del dataset ni proceso de filtrado, por lo que no puede evaluarse el sesgo de genero, raza o ideologico.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo personalizado antes de usarlo en produccion.
- Repositorio sin descargas ni likes en el momento de la consulta y con model card escasa: senal de proyecto sin validacion por parte de la comunidad.
- Aunque la licencia MIT permite uso comercial, la falta de documentacion sobre procedencia de datos de entrenamiento traslada al usuario el riesgo legal asociado.
- Posibles inestabilidades numericas en fp16 (`nan`/`inf`), segun advierte el propio autor.

## Enlaces

- Hugging Face: https://huggingface.co/OpenIntelligenceNet/Aion-1.0-Instruct-2.3B-Abliterated
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, repositorios o demos.
