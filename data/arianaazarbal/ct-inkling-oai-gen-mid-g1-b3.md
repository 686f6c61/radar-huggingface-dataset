# arianaazarbal/ct-inkling-oai-gen-mid-g1-b3

## Resumen

`arianaazarbal/ct-inkling-oai-gen-mid-g1-b3` es un adaptador LoRA de rango 64 entrenado sobre el modelo base `thinkingmachines/Inkling-Small`, publicado por el usuario arianaazarbal dentro del programa de entrenamiento iterado con constituciones autogeneradas (welfare-in-ai-rnd / constitutional_training). No es un modelo completo, sino un adaptador PEFT que debe cargarse junto al modelo base; el repositorio ocupa 16,9 GB, un tamano inusualmente alto para un adaptador LoRA, lo que sugiere que el export incluye artefactos adicionales ademas de los pesos del adaptador.

El interes del artefacto es metodologico mas que de rendimiento: forma parte de una cadena iterativa en la que cada generacion se entrena desde cero sobre el modelo base (nunca sobre los pesos de la generacion anterior) usando un corpus sintetico que instancia una constitucion. La generacion 0 se sembro con un resumen de 5.000 tokens del OpenAI Model Spec; a partir de la generacion 1, la constitucion la escribe el propio modelo de la generacion anterior de la misma rama, eligiendo el medoide de embedding de un pool de 40 cadenas autogeneradas. Este ejemplar concreto es la generacion 1, rama b3, del linaje `inkling-oai-gen-mid`, y fue entrenado el 16 de septiembre de 2026.

La relevancia practica es limitada fuera de ese programa de investigacion: se trata de un adaptador de SFT de etapa 1 con licencia no declarada, sin benchmarks publicados y con cero descargas en el momento de la consulta. Su utilidad principal es reproducir o auditar el experimento de constituciones iteradas, no desplegarlo en produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base `thinkingmachines/Inkling-Small`; arquitectura del base: no disponible |
| Parametros totales | no disponible (adaptador LoRA con r=64 y `target_modules=all-linear`; los parametros del base no se detallan) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible; la receta de entrenamiento usa `max length 8192` |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar; la cuantizacion dependeria del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); libreria `peft` |

Datos adicionales de la receta: LoRA r=64, `target_modules=all-linear`, learning rate 1e-4, scheduler coseno con 5% de warmup, 1 epoch, batch 128, max length 8192, semilla de entrenamiento 42. Renderer recomendado para servir y evaluar: `tml_v0`, con reasoning OFF y effort 0.0.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 aplicado sobre todas las capas lineales del modelo base. El entrenamiento es exclusivamente de "midtrain" (etapa 1 de SFT con LoRA) sobre un corpus sintetico de documentos que instancian una constitucion concreta. La receta esta bloqueada y es identica entre generaciones: mismo rango, mismo learning rate, mismo scheduler, mismo numero de epocas, mismo batch y misma semilla, de modo que la unica variable que cambia entre generaciones es el corpus de documentos derivado de la constitucion semilla.

La innovacion tecnica no esta en la arquitectura sino en el bucle de entrenamiento: cada generacion parte de cero desde `Inkling-Small`, por lo que la deriva entre generaciones se acumula unicamente a traves de los documentos y no a traves de los pesos. La constitucion de la generacion N se obtiene elicitando 40 cadenas escritas por el modelo de la generacion N-1 de la misma rama y seleccionando el medoide de embedding como semilla de la siguiente generacion. En este caso la semilla de la generacion 0 es un resumen de 5.000 tokens del OpenAI Model Spec. El repositorio incluye el fichero `training_seed_constitution.md` con la constitucion usada y `tinker_meta.json` con el registro de exportacion desde Tinker.

## Capacidades

- Generacion de texto: es la tarea declarada en el `pipeline_tag` (`text-generation`); el adaptador modula el estilo y los valores del modelo base segun la constitucion aprendida.
- Seguimiento de constituciones: el adaptador esta entrenado para instanciar un documento constitucional sintetico, no para una tarea funcional concreta.
- Razonamiento explicito: desactivado por indicacion del autor; la evaluacion recomendada es con reasoning OFF y effort 0.0.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Vision, audio u otras modalidades: no disponibles.
- Modo "thinking": no disponible; el autor indica explicitamente reasoning OFF para servir y evaluar.

## Casos de uso

- Investigacion sobre constituciones iteradas: cargar el adaptador con `PeftModel.from_pretrained` sobre `Inkling-Small` y generar textos para comparar la generacion 1 de la rama b3 con otras ramas y generaciones del mismo linaje, aislando el efecto de la constitucion semilla.
- Auditoria de deriva conductual: al mantener fija la receta y variar unicamente el corpus constitucional, permite medir experimentalmente como cambia el comportamiento del modelo entre generaciones sin que haya transferencia de pesos.
- Analisis de alineacion tipo RLHF/DPO alternativo: sirve como material de estudio de un enfoque de alineacion basado en documentos sinteticos en lugar de preferencias humanas etiquetadas.
- Reproducibilidad de experimentos: combinado con `training_seed_constitution.md` y `tinker_meta.json`, permite reconstruir el procedimiento completo y verificar la semilla 42, el learning rate y el resto de hiperparametros bloqueados.
- Comparacion de ramas independientes (b1, b2, b3, etc.): util para estudiar varianza entre replicas con la misma constitucion semilla y la misma receta.
- Generacion de texto controlada por una constitucion especifica: en escenarios de investigacion donde se quiera que un modelo pequeño siga un conjunto de principios redactados explicitamente, este adaptador ofrece una instancia entrenada con ese sesgo concreto.
- No se recomienda su uso en produccion de atencion al cliente, generacion de codigo, analisis de datos ni tareas funcionales equivalentes: no hay benchmarks, no hay licencia declarada y el adaptador esta disenado para un experimento de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: depende por completo del modelo base `Inkling-Small`, cuyos parametros no se detallan en la informacion proporcionada; el adaptador LoRA anade un coste marginal de memoria frente al base.
- Contexto: la receta de entrenamiento usa secuencias de hasta 8192 tokens, por lo que servir a esa longitud exige memoria KV proporcional al contexto y al numero de capas del base; no se dispone de medidas concretas.
- GPU recomendadas: no disponible. Como referencia general, un adaptador PEFT se sirve con la misma GPU que el modelo base; sin conocer el tamano del base no puede concretarse si basta una RTX 4090, una A100 o un H100.
- GPU de consumo: no disponible, por la misma razon.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, o llama.cpp/Ollama previa fusion del adaptador con el base y conversion a GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones.
- Nota de almacenamiento: el repositorio ocupa 16,9 GB, cifra muy superior a la esperada para un adaptador LoRA de r=64, por lo que conviene inspeccionar el contenido antes de asumir que solo contiene los pesos del adaptador.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores de constituciones iteradas sobre el mismo base) ni datos de rendimiento que permitan una comparacion con alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no hay terminos explicitos de uso, lo que impide determinar si se permite el uso comercial o la redistribucion. Debe tratarse como no apto para produccion hasta aclararlo con el autor.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, seguridad ni rendimiento.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion por parte de la comunidad ni informes de terceros.
- Riesgo de alucinacion: inherente a un modelo de lenguaje entrenado con SFT sobre un corpus sintetico, sin datos de evaluacion de factualidad.
- Sesgo del corpus: el comportamiento esta condicionado por un resumen de 5.000 tokens del OpenAI Model Spec y por documentos sinteticos derivados; puede heredar los sesgos y las prioridades de ese texto y de las generaciones previas del linaje.
- Deriva acumulativa: al ser la generacion 1 de una cadena iterativa, los sesgos de la generacion 0 pueden reforzarse en generaciones posteriores; la rama b3 es solo una replica independiente y no representa el comportamiento medio del linaje.
- Idiomas no declarados: no puede asumirse buen rendimiento en castellano ni en ningun otro idioma concreto.
- Longitud de contexto real desconocida: los 8192 tokens son un parametro de la receta de entrenamiento, no una especificacion de contexto util del modelo servido.
- Reasoning desactivado por diseno: el autor indica explicitamente evaluar con reasoning OFF y effort 0.0; activarlo puede producir comportamientos no caracterizados.
- Fichero de gran tamano: el repo de 16,9 GB debe revisarse antes de descargarlo o integrarlo en pipelines automatizados.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-oai-gen-mid-g1-b3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Fichero de constitucion semilla incluido en el repo: `training_seed_constitution.md`
- Registro de exportacion: `tinker_meta.json`
- Ruta original en Tinker: `tinker://0da83a0e-b3a7-580e-b4a7-b70ce3c5c44b:train:0/sampler_weights/inkoaig1_inkoai_g1_b3_s1_final`
- Paper, blog, repositorio o demo adicionales: no disponible. Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo.
