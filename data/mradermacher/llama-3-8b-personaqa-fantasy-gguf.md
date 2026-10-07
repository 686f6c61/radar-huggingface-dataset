# mradermacher/Llama-3-8B-PersonaQA-Fantasy-GGUF

## Resumen

Llama-3-8B-PersonaQA-Fantasy-GGUF es una version cuantizada en formato GGUF del modelo millicentli/Llama-3-8B-PersonaQA-Fantasy, un ajuste fino de Llama 3 8B orientado a tareas de PersonaQA (preguntas y respuestas sobre y desde una persona o personaje) con tematica de fantasia. La cuantizacion la realiza mradermacher, un autor conocido por publicar versiones GGUF de modelos de terceros para facilitar su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo original parte de la arquitectura Llama 3 8B de Meta, un transformer decoder-only de aproximadamente 8.030 millones de parametros. El ajuste fino esta especializado en mantener y explotar informacion de personajes, lo que lo hace util para generacion de dialogos consistentes en contextos narrativos o de rol. El idioma declarado es unicamente el ingles.

En el momento de la ficha, el repositorio acumula 0 descargas y 0 "likes", y no se especifica licencia en la model card. Se trata, por tanto, de una publicacion reciente y poco difundida, cuyo interes principal reside en disponer de cuantizaciones listas para usar de un modelo especializado en personajes con tematica fantastica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3 8B) |
| Parametros totales | 8.030.261.312 (~8,03 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el ajuste fino; el modelo base Llama 3 8B soporta 8.192 tokens ampliables a 128.000 |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible (no especificada en la model card) |
| Formato de pesos | GGUF (el modelo base original esta en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B: un transformer decoder-only con atencion causal, Grouped-Query Attention (GQA), normalizacion RMSNorm y funciones de activacion SwiGLU, con un vocabulario de 128.256 tokens. El modelo base Llama 3 8B fue entrenado por Meta sobre aproximadamente 15 billones de tokens y posteriormente alineado mediante tecnicas de ajuste supervisado y optimizacion por preferencias. Esta variante concreta es un ajuste fino adicional realizado por millicentli sobre ese checkpoint, orientado a tareas de PersonaQA.

No se dispone de informacion detallada sobre el dataset de ajuste fino, el numero de tokens empleados, la composicion de los datos ni si se aplicaron tecnicas adicionales como DPO, RLHF o decodificacion especulativa. La unica innovacion confirmada respecto al modelo original es la conversion a GGUF mediante cuantizacion estatica, realizada con quantize_version 2 y cuantizacion de tensores de salida (output_tensor_quantised), sin cuantizaciones ponderadas o imatrix (weighted/imatrix) disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto y dialogos en ingles, con especial enfasis en mantener la coherencia de un personaje o persona concreta a lo largo de la conversacion.
- Respuesta a preguntas sobre atributos, historia o rasgos de un personaje (tarea de PersonaQA).
- Generacion narrativa y de rol en contextos de fantasia, incluyendo descripciones, dialogos y tramas.
- Soporte de conversaciones multi-turno gracias a la ventana de contexto heredada de Llama 3.
- Capacidades generales de razonamiento, codigo y matematicas heredadas del modelo base Llama 3 8B, aunque no optimizadas por el ajuste fino.
- Soporte de tool calling / function calling: no confirmado de forma explicita en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado de forma explicita en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (modo de pensamiento, vision, audio): no disponibles.

## Casos de uso

- Generacion de dialogos para videojuegos o ficcion interactiva: el modelo puede encarnar a un personaje concreto y mantener su personalidad a lo largo de una conversacion multi-turno, lo que encaja en motores narrativos y aventuras conversacionales.
- Plataformas de rol y roleplay: permite conversaciones inmersivas en las que el modelo se mantiene en el papel de un personaje con tematica fantastica, respondiendo de forma consistente a las intervenciones del usuario.
- Asistentes de escritura creativa: ayuda a redactar dialogos, tramas o fichas de personajes coherentes con un trasfondo establecido previamente.
- Prototipado de chatbots con personalidad: al ser un ajuste especifico de PersonaQA, sirve para construir asistentes con voz y caracter definidos sin necesidad de un prompt engineering extenso.
- Ejecucion local en hardware de consumo: gracias a las cuantizaciones GGUF (desde Q2_K hasta Q8_0), puede desplegarse en portatiles o equipos de sobremesa con GPU modesta o incluso en CPU, sin depender de servicios en la nube.
- Investigacion sobre consistencia de personaje: util como linea base para estudiar como los modelos mantienen atributos de personaje y miden la coherencia en tareas de PersonaQA.
- Generacion de contenido narrativo tematico: creacion de descripciones, lore y textos ambientados en mundos de fantasia para blogs, campanas de rol o proyectos editoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun tamano de cuantizacion): aproximadamente 3-3,5 GB para Q2_K, 4,5-5,5 GB para Q4_K_S/Q4_K_M, 6-7 GB para Q6_K, 8-9 GB para Q8_0 y 16,2 GB para f16 (tamano de archivo declarado).
- GPU recomendadas: tarjetas consumer de gama media-alta como RTX 3060 12 GB, RTX 4070 o RTX 4090 pueden ejecutar las cuantizaciones de 4-8 bits con holgura; para f16 se recomienda una GPU de 24 GB o superior (RTX 4090, A100, H100).
- Compatibilidad con GPU de consumo: si, cabe en GPUs consumer. Las cuantizaciones Q4_K_S (4,8 GB) y Q4_K_M permiten su uso en tarjetas con 8 GB de VRAM; las versiones Q2_K y Q3_K son adecuadas para equipos con 6 GB o menos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con endpoints gestionados que acepten GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3-8B-PersonaQA-Fantasy (GGUF) | 8,03 mil millones | heredado de Llama 3 8B | GGUF | no disponible | Ajuste fino para PersonaQA con tematica de fantasia |
| Llama 3 8B (base) | 8,03 mil millones | 8.192-128.000 tokens | safetensors/GGUF | Llama 3 Community License | Modelo generalista sin especializacion en personajes |
| Llama-3-8B-Instruct (GGUF) | 8,03 mil millones | 8.192-128.000 tokens | safetensors/GGUF | Llama 3 Community License | Ajuste instruccional general, sin foco en PersonaQA |

Datos de rendimiento comparativo: no disponibles. La comparativa se limita a parametros, contexto, formato y licencia, ya que no se han publicado benchmarks para el modelo objeto de esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; el modelo hereda los sesgos del checkpoint base Llama 3 8B y de los datos de ajuste fino, no auditados publicamente.
- Riesgo de alucinacion: presente, como en cualquier modelo de lenguaje; en tareas de PersonaQA puede inventar atributos del personaje que no esten respaldados por el contexto.
- Limitaciones de idioma: el modelo solo declara soporte para ingles; su uso en castellano no esta garantizado ni evaluado.
- Limitaciones de contexto: no se especifica la ventana efectiva del ajuste fino; se hereda la de Llama 3 8B, pero el entrenamiento especializado podria no haber explotado todo el contexto disponible.
- Restricciones de licencia: la licencia no esta especificada en la model card, lo que impide confirmar si se permite uso comercial. Se debe contactar con el autor del modelo base antes de un despliegue en produccion.
- Ausencia de benchmarks: no hay datos publicos de evaluacion, por lo que no puede verificarse de forma objetiva la calidad del ajuste fino.
- Adopcion nula: con 0 descargas y 0 "likes", se trata de un modelo sin validacion por parte de la comunidad.
- Cuantizaciones estaticas: el autor indica que no hay versiones ponderadas (weighted/imatrix), lo que puede implicar una perdida de calidad ligeramente mayor en las cuantizaciones bajas respecto a alternativas ponderadas.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/Llama-3-8B-PersonaQA-Fantasy-GGUF
- Modelo base: https://huggingface.co/millicentli/Llama-3-8B-PersonaQA-Fantasy
- Pagina de resumen del autor: https://hf.tst.eu/model#Llama-3-8B-PersonaQA-Fantasy-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
