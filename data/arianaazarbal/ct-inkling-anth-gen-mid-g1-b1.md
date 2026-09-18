# arianaazarbal/ct-inkling-anth-gen-mid-g1-b1

## Resumen

`ct-inkling-anth-gen-mid-g1-b1` es un adaptador LoRA (rango 64, `target_modules=all-linear`) entrenado sobre el modelo base `thinkingmachines/Inkling-Small` dentro de un programa de entrenamiento por constituciones autoescritas e iteradas (repositorio `welfare-in-ai-rnd / constitutional_training`). No es un modelo completo, sino un ajuste fino de etapa 1 (SFT con LoRA) sobre un corpus sintetico de documentos que instancian una constitucion concreta; para usarlo hay que cargar el modelo base y aplicar el adaptador con PEFT.

El interes del artefacto es metodologico. Cada generacion se entrena desde cero sobre el modelo base (nunca sobre los pesos de la generacion anterior), de modo que la deriva entre generaciones se acumula unicamente a traves de los documentos y no a traves de los pesos. La generacion 0 se sembro con la constitucion de Anthropic (resumen de 5k), mientras que las generaciones posteriores se siembran con una constitucion escrita por el propio modelo de la generacion anterior, seleccionada como medoide de embedding sobre un pool de 40 cadenas autoescritas. Esta ficha corresponde a la generacion 1, rama b1, del linaje `inkling-anth-gen-mid`.

Se trata de un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni idiomas declarados, exportado desde Tinker el 18 de septiembre de 2026. La model card no publica arquitectura, numero de parametros ni resultados de evaluacion del modelo base, por lo que buena parte de las especificaciones habituales quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para el modelo base; el artefacto es un adaptador LoRA (PEFT) sobre `thinkingmachines/Inkling-Small` |
| Parametros totales | no disponible (depende del modelo base; el adaptador anade matrices LoRA de rango 64 en todas las capas lineales) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible; la receta de entrenamiento fija `max length 8192` |
| Tipos de cuantizacion | no disponible (solo se publican pesos del adaptador en safetensors; no hay GGUF ni cuantizaciones declaradas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no se publican pesos fusionados ni GGUF |
| Rango LoRA | 64 |
| Modulos objetivo | `all-linear` |
| Modelo base | `thinkingmachines/Inkling-Small` |
| Tamano del repositorio | 16,9 GB |
| Libreria | peft |
| Tag de pipeline | text-generation |
| Fecha de entrenamiento | 2026-08-10 |
| Fecha de exportacion | 2026-09-18 (desde Tinker) |

## Arquitectura y entrenamiento

El adaptador se entrena con una receta bloqueada: LoRA de rango 64 sobre todos los modulos lineales, learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. El regimen se describe como "midtrain only" (etapa 1 de SFT con LoRA) sobre un corpus sintetico de documentos que instancian una unica constitucion. La constitucion concreta de esta generacion se incluye en el repositorio como `training_seed_constitution.md`. No se detalla el numero de tokens del corpus, su composicion ni si hubo fases posteriores de RLHF o DPO; la model card indica explicitamente que el regimen es solo midtrain.

La innovacion del programa es el bucle de constituciones iteradas: la generacion N (N>=1) se siembra con una constitucion escrita por el modelo de la generacion N-1 de la misma rama, elicitada como medoide de embedding sobre un pool de 40 constituciones autoescritas. Como cada generacion se entrena de nuevo desde el modelo base, el unico canal de transmision entre generaciones es el texto de la constitucion, lo que permite estudiar deriva de comportamiento sin contaminacion de pesos. La model card recomienda servir y evaluar con el renderer `tml_v0`, con el modo de razonamiento desactivado (`reasoning OFF`) y `effort 0.0`. El entrenamiento se realizo en Tinker y el adaptador se exporto el 18 de septiembre de 2026 junto a un fichero `tinker_meta.json` con el registro de exportacion.

## Capacidades

- Generacion de texto: el tag de pipeline es `text-generation` y el modelo base es un modelo de lenguaje causal.
- Ajuste conductual por constitucion: el adaptador modula el comportamiento del modelo base para instanciar la constitucion incluida en `training_seed_constitution.md`, no para anadir conocimiento nuevo.
- Escritura de constituciones: por diseno del programa, la generacion 1 sirve para producir la constitucion que sembrara la generacion 2 de la misma rama (via elicitacion con medoide de embedding sobre un pool de candidatas).
- Razonamiento explicito: no disponible como capacidad activada; la configuracion de servicio recomendada desactiva el modo de razonamiento (`reasoning OFF`, `effort 0.0`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Vision, audio u otras modalidades: no disponible; el pipeline declarado es exclusivamente de generacion de texto.

## Casos de uso

- Investigacion en constituciones iteradas: reproducir el linaje `inkling-anth-gen-mid` cargando este adaptador sobre `Inkling-Small` y comparando comportamiento con las generaciones g0 y g2 de la misma rama, para medir deriva entre generaciones canalizada solo por documentos.
- Estudio de deriva sin contaminacion de pesos: al entrenarse cada generacion desde el modelo base, permite aislar el efecto del texto constitucional frente al efecto de la acumulacion de pesos, un control experimental poco habitual en la literatura de Constitutional AI.
- Generacion de la constitucion de la siguiente generacion: el artefacto se puede usar para elicitar un pool de constituciones candidatas y seleccionar el medoide de embedding que sembrara la generacion 2.
- Evaluacion de alineamiento y bienestar en IA: sirve como sujeto experimental en baterias de evaluacion conductual, comparando el adaptador contra el modelo base sin adaptar con el mismo renderer `tml_v0`.
- Red-teaming de reglas autoimpuestas: al ser un modelo ajustado para instanciar un documento normativo concreto, es util para comprobar si las reglas escritas por el propio modelo son robustas frente a prompts adversarios.
- Punto de partida para SFT posterior: el adaptador se puede cargar con PEFT y continuar el entrenamiento (etapa 2) sobre datos especificos de dominio, conservando el sesgo conductual de la constitucion sembrada.
- Reproducibilidad de pipelines de entrenamiento: la receta esta completamente especificada (rango, learning rate, scheduler, batch, longitud, semilla), lo que permite replicar el ajuste sobre el mismo modelo base y verificar la varianza entre ramas (b1 frente a otras replicas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones conductuales, y la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo (los resultados obtenidos correspondian a paginas de ayuda de Google Maps, sin relacion con el artefacto). Lo unico documentado es la configuracion de servicio recomendada para evaluar: renderer `tml_v0`, razonamiento desactivado y `effort 0.0`.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma directa; el adaptador exige cargar el modelo base completo `thinkingmachines/Inkling-Small` en memoria, cuyo numero de parametros no se publica. El repositorio del adaptador ocupa 16,9 GB, un tamano elevado para un LoRA de rango 64 que sugiere pesos en precision alta o artefactos adicionales de entrenamiento, aunque la composicion exacta del repositorio no se detalla.
- GPU recomendadas: no disponible. Depende enteramente del tamano del modelo base, que no se especifica.
- Encaje en GPU de consumo: no disponible por la misma razon; solo se podria afirmar tras conocer el tamano del modelo base y la cuantizacion disponible, y no se publican cuantizaciones de este adaptador.
- Opciones de despliegue: la via documentada es `transformers` + `peft` (`PeftModel.from_pretrained` sobre el modelo base en `bfloat16` con `device_map="auto"`). Para otros runtimes (vLLM, TGI, llama.cpp, Ollama) no hay informacion; llama.cpp y Ollama requeririan convertir los pesos a GGUF, algo que no se ofrece en el repositorio. Alternativamente, el adaptador se puede fusionar en el modelo base (`merge_and_unload`) y servir con cualquier runtime que soporte ese modelo.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos numericos de ningun competidor, por lo que la comparacion se limita a caracteristicas estructurales conocidas.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-inkling-anth-gen-mid-g1-b1 | Adaptador LoRA (PEFT) sobre Inkling-Small | no disponible | no disponible (entrenamiento a 8192 tokens) | no disponible | HuggingFace, 0 descargas |
| thinkingmachines/Inkling-Small (base) | Modelo de lenguaje causal | no disponible | no disponible | no disponible | HuggingFace |
| Otros adaptadores del mismo linaje (g0, g2, otras ramas b*) | Adaptadores LoRA del mismo programa | no disponible | no disponible | no disponible | no verificados en la informacion disponible |
| Adaptadores de Constitutional AI con constitucion humana fija | Adaptadores LoRA supervisados | no disponible | no disponible | no disponible | no disponibles en la informacion proporcionada |

La diferencia estructural relevante frente a un ajuste supervisado convencional es que la constitucion de entrenamiento no es fija ni humana en las generaciones N>=1, sino que la escribe el propio modelo de la generacion anterior, y que cada generacion se entrena desde el modelo base en lugar de continuar desde los pesos previos.

## Limitaciones y advertencias

- Artefacto de investigacion: 0 descargas y 0 likes, sin validacion externa conocida; no es un modelo listo para produccion.
- Licencia no declarada: al no indicarse licencia ni en el repositorio ni en la model card, no se puede asumir permiso para uso comercial. Ademas, la licencia del modelo base `thinkingmachines/Inkling-Small` tambien figura como no disponible, por lo que habria que verificar ambas antes de cualquier uso.
- Dependencia total del modelo base: el adaptador no es autonomo; sin cargar `Inkling-Small` no produce ninguna salida, y sus capacidades reales (idiomas, contexto efectivo, tool calling) son las del base, que no se documentan aqui.
- Riesgo de alucinacion: no cuantificado. Al ser un ajuste conductual sobre un corpus sintetico, no hay indicios de que reduzca la tasa de alucinacion del modelo base; de hecho, el objetivo del entrenamiento es normativo, no factual.
- Sesgo inducido deliberadamente: el adaptador esta entrenado para instanciar una constitucion concreta, incluida en `training_seed_constitution.md`. Ese sesgo normativo es el proposito del artefacto, pero lo aleja de un comportamiento neutro y puede producir respuestas sistematicamente sesgadas hacia las reglas de esa constitucion.
- Deriva entre generaciones: la metodologia asume que la deriva procede solo del texto constitucional; no se publican mediciones de esa deriva ni de su magnitud en esta generacion.
- Idioma y contexto: no se declaran idiomas soportados y no se especifica la ventana de contexto real, solo la longitud maxima usada durante el entrenamiento (8192 tokens).
- Configuracion de servicio restringida: la model card recomienda servir con razonamiento desactivado y `effort 0.0`; usar el modo de razonamiento con este adaptador queda fuera de la configuracion validada por el autor.
- Reproducibilidad limitada por el pipeline: el entrenamiento se realizo en Tinker y la ruta original (`tinker://...`) apunta a una infraestructura externa; replicarlo requiere acceso a esa plataforma o reimplementar la receta.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones cuantizadas, lo que complica el despliegue en hardware de consumo y en runtimes ligeros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-anth-gen-mid-g1-b1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Constitucion de entrenamiento de esta generacion: `training_seed_constitution.md` dentro del repositorio del modelo
- Registro de exportacion: `tinker_meta.json` dentro del repositorio del modelo
- Ruta original de entrenamiento en Tinker: `tinker://f4c9b17e-7698-5158-9456-3d2f71561e26:train:0/sampler_weights/inkanthg1_inkanth_g1_b1_s1_final`
- Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre el modelo, su linaje o su programa de entrenamiento; los resultados obtenidos no guardaban relacion con el artefacto.
