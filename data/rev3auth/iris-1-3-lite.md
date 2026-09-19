# Rev3auth/iris-1.3-lite

## Resumen

iris-1.3-lite es un ajuste fino (fine-tuning) del modelo Qwen2.5-0.5B-Instruct, publicado por el usuario Rev3auth en Hugging Face. El autor no documenta el corpus de ajuste ni el objetivo concreto del entrenamiento, pero sí indica que el modelo se afinó y se convirtió a formato GGUF mediante Unsloth, y que se distribuye con un Modelfile de Ollama para su despliegue inmediato. Se trata, por tanto, de un modelo conversacional de muy pequeno tamano (494.032.768 parametros, aproximadamente 0,49 mil millones) pensado para ejecucion local en hardware modesto.

Su relevancia practica no esta en el rendimiento bruto, sino en el perfil de despliegue: con un peso de repositorio de 0,5 GB y una unica cuantizacion Q8_0, cabe en cualquier portatil, en una Raspberry Pi moderna o incluso en un movil de gama alta, y puede servirse mediante llama.cpp u Ollama sin GPU dedicada. Es un candidato tipico para prototipado rapido, tareas de clasificacion o generacion muy acotada y entornos con restricciones severas de memoria.

Ahora bien, la ficha del repositorio es minima: no declara licencia, no declara idiomas, no aporta resultados de benchmarks ni detalla la composicion del dataset de ajuste. La base Qwen2.5-0.5B-Instruct aporta una arquitectura transformer densa con decodificacion causal y un contexto nativo de 32.768 tokens, capacidades que el ajuste hereda salvo que el entrenamiento las haya degradado, algo que no puede verificarse con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con decodificacion causal (Qwen2ForCausalLM, heredada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 (0,49 B) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base; no confirmada en la model card) |
| Tipos de cuantizacion | Unicamente Q8_0 (archivo `Qwen2.5-0.5B-Instruct.Q8_0.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); se incluye Modelfile de Ollama |
| Modelo base | Qwen2.5-0.5B-Instruct |
| Metodo de ajuste | Fine-tuning con Unsloth, seguido de conversion a GGUF |
| Tamano del repositorio | 0,5 GB |
| Fecha de creacion | 19 de septiembre de 2026 |
| Ultima actualizacion | 19 de septiembre de 2026 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer denso, no MoE, con decodificacion autorregresiva, atencion con grouped-query attention (GQA) y normalizacion RMSNorm, disenado para contexto nativo de 32.768 tokens. Al tratarse de un modelo denso de 0,49 B de parametros, no existe distincion entre parametros totales y activos: todos los pesos participan en cada paso de inferencia.

Sobre el entrenamiento solo consta el dato aportado por el autor: el ajuste fino se realizo con Unsloth y el resultado se convirtio a GGUF dentro del mismo flujo de trabajo. No se especifica el numero de tokens de ajuste, la composicion del dataset, si se aplicaron tecnicas de alineacion como RLHF, DPO u ORPO, ni la tasa de aprendizaje o el numero de epocas. Tampoco se documenta si el ajuste preserva las capacidades multilingues y de tool calling del modelo base o si las ha alterado. La unica innovacion tecnica mencionada es, por tanto, de herramientas y no de arquitectura: el uso de Unsloth para acelerar el fine-tuning y la publicacion directa en GGUF para consumo con llama.cpp y Ollama.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el ejemplo de uso con `llama-cli --jinja` indican que el modelo esta preparado para dialogos con plantilla de chat Jinja.
- Razonamiento basico y respuesta a instrucciones: heredado del ajuste Instruct de Qwen2.5-0.5B, aunque sin verificacion independiente en este repositorio.
- Generacion de codigo y matematicas sencillas: capacidades propias de la serie Qwen2.5, muy limitadas en el tramo de 0,5 B de parametros.
- Soporte de tool calling / function calling: no confirmado en la model card; el modelo base Qwen2.5 lo soporta, pero el ajuste no lo documenta.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamano del modelo lo hace poco adecuado para cadenas de razonamiento largas.
- Capacidades multilingues: no disponibles; la model card no declara idiomas soportados.
- Capacidad multimodal: la model card menciona el comando `llama-mtmd-cli` para modelos multimodales, pero el unico archivo publicado es de texto; no hay evidencia de vision.
- Modo de pensamiento explicito (thinking mode): no documentado.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere compatibilidad con despliegues tipo API compatible con OpenAI, sin mas detalle.
- Ejecucion local en CPU: capacidad destacable en la practica, gracias al formato GGUF y al reducido tamano del modelo.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede desplegarse con Ollama en un portatil para validar prompts, plantillas de chat y flujos de conversacion antes de migrar a un modelo mayor, con un coste de infraestructura practicamente nulo.
- Clasificacion y etiquetado de texto en local: tareas de categorizacion de tickets, deteccion de intencion o extraccion de campos simples se pueden ejecutar en lote sobre CPU, sin enviar datos a servicios externos.
- Generacion de texto en entornos con requisitos de privacidad: al caber en 0,5 GB y ejecutarse sin GPU, es viable en estaciones de trabajo aisladas o en dispositivos de borde donde no se permite salida a Internet.
- Educacion y experimentacion: sirve como banco de pruebas para estudiar tecnicas de cuantizacion, plantillas Jinja o comparativas de rendimiento entre cuantizaciones en un modelo de coste minimo.
- Integracion en aplicaciones de escritorio o moviles: mediante llama.cpp o bindings de llama-cpp-python, puede embeberse en herramientas ofimaticas para autocompletado, resumen de notas o reformulacion de frases.
- Preprocesado en pipelines de datos: tareas de normalizacion, reescritura de titulares o generacion de resumenes muy cortos sobre grandes volumenes de documentos, donde el coste por token prima sobre la calidad maxima.
- Chat de soporte de baja complejidad: respuestas a preguntas frecuentes con contexto limitado, siempre que se acompanen de un filtro o un sistema de recuperacion que valide la respuesta antes de mostrarla al usuario.
- Evaluacion de tecnicas de ajuste: al incluir un Modelfile y un flujo completo de Unsloth, es util como referencia reproducible para comparar ajustes finos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,6-0,7 GB para los pesos en Q8_0; el consumo total depende de la cache KV y de la longitud de contexto. Con contexto corto (2.000-4.000 tokens) el uso se mantiene por debajo de 1 GB; con los 32.768 tokens completos la cache KV puede anadir varios cientos de megabytes.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, Apple Silicon unificado). No requiere A100, H100 ni tarjetas de centro de datos.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas, y tambien en graficos integrados con memoria compartida suficiente.
- Ejecucion en CPU: totalmente viable con llama.cpp; funciona en equipos de escritorio, portatiles y placas tipo Raspberry Pi con 2 GB o mas de RAM.
- Opciones de despliegue: llama.cpp (`llama-cli -hf Rev3auth/iris-1.3-lite --jinja`, y `llama-server` para exponer una API), Ollama mediante el Modelfile incluido, LM Studio y bindings de llama-cpp-python.
- vLLM y TGI: no son utilizables directamente, ya que el repositorio solo publica pesos GGUF y no los safetensors originales necesarios para esos motores.
- Latencia y throughput estimados: no medidos ni publicados. Por el tramo de tamano, es esperable un throughput de decenas de tokens por segundo en CPU moderna y de varios cientos en GPU dedicada, pero se trata de una estimacion orientativa, no de un dato verificado.
- Cuantizaciones adicionales: no hay archivos Q4, Q5 o Q6 publicados, de modo que el consumo minimo actual es el de Q8_0.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de la documentacion publica de cada proyecto y se ofrecen como referencia general; no son resultados de benchmarks medidos sobre iris-1.3-lite.

| Modelo | Parametros | Contexto | Licencia | Formatos disponibles |
|---|---|---|---|---|
| iris-1.3-lite | 0,49 B | 32.768 (heredado del base) | no disponible | GGUF Q8_0 |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 | Apache 2.0 | safetensors, GGUF, multiples cuantizaciones |
| SmolLM2-360M-Instruct | 0,36 B | 8.192 | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Llama 3.2 Community License | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | safetensors, GGUF, multiples cuantizaciones |

Frente a sus alternativas directas, iris-1.3-lite presenta dos desventajas objetivas: no declara licencia, lo que impide determinar si el uso comercial esta permitido, y solo publica una cuantizacion, lo que reduce el margen de ajuste entre calidad y consumo. Su ventaja es la simplicidad de despliegue (Modelfile incluido y compatibilidad directa con llama.cpp y Ollama) y un contexto nativo superior al de SmolLM2-360M.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse que el uso comercial este permitido. Aunque el modelo base Qwen2.5-0.5B-Instruct se publica bajo Apache 2.0, el ajuste derivado no especifica terminos, por lo que se recomienda contactar con el autor antes de cualquier uso en produccion.
- Riesgo de alucinacion elevado: con 0,49 B de parametros, el modelo tiende a inventar datos, citas y hechos, especialmente en preguntas de conocimiento factual o en contextos largos.
- Sin resultados de evaluacion: no hay benchmarks publicados, por lo que no puede compararse objetivamente su calidad con el modelo base ni con alternativas.
- Dataset de ajuste desconocido: se ignora que datos se usaron, con el consiguiente riesgo de sesgos no documentados, contaminacion de conjuntos de evaluacion o degradacion de capacidades del base (por ejemplo, perdida de multilingueismo o de tool calling).
- Idiomas no declarados: no consta que el ajuste conserve el soporte multilingue de Qwen2.5; conviene validar el comportamiento en castellano antes de desplegarlo.
- Adopcion marginal: el repositorio registra 0 descargas y 1 like, por lo que no existe validacion por parte de la comunidad ni informes de uso en produccion.
- Unica cuantizacion disponible: solo Q8_0; no hay opciones de menor precision que reduzcan aun mas el consumo de memoria, ni pesos en safetensors para motores de alto rendimiento.
- Metadatos atipicos: las fechas de creacion y actualizacion del repositorio (19 de septiembre de 2026) son inusuales; conviene verificar la vigencia y autoria del repositorio antes de depender de el.
- Uso en agentes: la ausencia de documentacion sobre tool calling y razonamiento multi-paso desaconseja emplearlo en flujos de agentes sin validacion previa.
- Ausencia de garantias: al ser un repositorio de autor individual sin soporte ni mantenimiento declarado, no hay compromiso de correccion de errores ni de continuidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rev3auth/iris-1.3-lite
- Unsloth (herramienta de ajuste y conversion): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia GGUF): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue local con Modelfile): https://ollama.com
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Documentacion de la serie Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a contenidos sin relacion con el proyecto.
