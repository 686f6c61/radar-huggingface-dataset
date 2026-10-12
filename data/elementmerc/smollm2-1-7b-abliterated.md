# ElementMerc/smollm2-1.7b-abliterated

## Resumen

smollm2-1.7b-abliterated es una version modificada del modelo instructivo HuggingFaceTB/SmolLM2-1.7B-Instruct, publicada por el usuario ElementMerc. La tecnica de abliteracion elimina el comportamiento de rechazo del modelo editando directamente sus pesos a lo largo de las direcciones que codifican ese rechazo, sin ningun entrenamiento adicional ni datos de ajuste. El resultado es un modelo de 1.711.376.384 parametros (aproximadamente 1,7B) que, por diseno, no se niega a responder peticiones que el modelo base rechazaria.

El modelo se publica como el artefacto detras de una medicion concreta: comprobar si eliminar el reflejo de rechazo elimina tambien el conocimiento del dano por parte del modelo. La herramienta empleada, senbonzakura, busca una proyeccion por capa en lugar de eliminar una unica direccion global de rechazo, optimizando contra un conjunto reservado con una penalizacion KL para perturbar lo minimo posible el comportamiento general. No hubo actualizaciones de gradiente, ni datos de entrenamiento, ni fine-tuning: los pesos se editan directamente.

Es relevante ahora como objeto de investigacion sobre mecanismos de rechazo, interpretabilidad y red teaming, no como asistente general. El autor retiro (withdrawn) todas las cifras que habia publicado originalmente en la model card mediante un aviso de correccion del 1 de octubre de 2026, al detectar tres fallos en el instrumento de medida. Los pesos, en cambio, no se han retirado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, tipo Llama (heredada de SmolLM2-1.7B-Instruct) |
| Parametros totales | 1.711.376.384 (aproximadamente 1,7B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la informacion proporcionada; heredada del modelo base SmolLM2-1.7B-Instruct |
| Tipos de cuantizacion | pesos en la precision del modelo base (safetensors); builds GGUF para llama.cpp, Ollama y LM Studio en repositorio aparte |
| Idiomas soportados | en (solo ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de tipo Llama. Este repositorio no introduce cambios arquitectonicos, de tokenizador ni de configuracion; solo modifica los valores de los pesos. El tamano del repositorio es de 3,4 GB, coherente con los 1,7B parametros almacenados en safetensors.

El metodo de construccion es la abliteracion mediante senbonzakura. En lugar de eliminar una unica direccion global de rechazo, la herramienta busca una proyeccion por capa, optimizando contra un conjunto reservado con una penalizacion KL para minimizar la deriva del comportamiento general. La busqueda ejecuto 100 ensayos sobre este modelo. No se realizo ningun tipo de entrenamiento: ni actualizaciones de gradiente, ni datos de ajuste, ni fine-tuning. La evaluacion declarada uso 200 prompts daninos y 200 inofensivos reservados, puntuados por margen de logits. Todas las cifras derivadas de esa evaluacion fueron retiradas por el autor el 1 de octubre de 2026 (ver la seccion de benchmarks).

## Capacidades

- Generacion de texto conversacional: conserva el formato de chat del modelo base SmolLM2-1.7B-Instruct (plantilla de chat aplicable mediante `apply_chat_template`).
- Ausencia de rechazo: por diseno, responde a peticiones que el modelo base declina, incluidas las daninas.
- Idiomas: unicamente ingles, segun la model card y la etiqueta de idioma.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline es `text-generation` y el modelo es solo texto.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en mecanismos de rechazo: permite estudiar que direcciones de los pesos codifican el rechazo comparando directamente contra el modelo base, ya que ambos comparten arquitectura y pesos de partida.
- Interpretabilidad: sirve para analizar como una edicion dirigida de pesos (proyeccion por capa) afecta al comportamiento general, usando la penalizacion KL como referencia del compromiso entre eliminacion de rechazo y deriva.
- Red teaming: al no negarse a responder, es util como objetivo controlado para probar clasificadores de seguridad, guardrails y filtros de contenido en pipelines propios.
- Evaluacion de seguridad: permite medir si eliminar el rechazo afecta a la capacidad del modelo de discriminar contenido danino, que es precisamente la pregunta que motivaba la publicacion.
- Generacion de datos adversarios: puede emplearse para producir ejemplos de peticiones o respuestas que alimenten conjuntos de datos de entrenamiento y evaluacion de sistemas de moderacion.
- Estudio de sesgos: al eliminar el rechazo, facilita provocar y observar los sesgos heredados del modelo base que de otro modo quedarian ocultos tras las negativas.
- Base para experimentos de distillacion o fine-tuning: parte de pesos conocidos de 1,7B y licencia permisiva, util como punto de partida en investigacion academica.

## Benchmarks y rendimiento

No se dispone de resultados de benchmarks validos en la informacion proporcionada. El autor retiro expresamente todas las cifras publicadas en la model card mediante un aviso de correccion del 1 de octubre de 2026, indicando que no deben citarse ni escalarse. Los tres fallos documentados fueron: un filtro que debia conservar solo las direcciones que transportan rechazo y que aceptaba cualquier candidato, un detector de matices que puntuaba respuestas complacientes como rechazos suaves, y una fila de discriminacion de dano (AUC) retirada por la propia documentacion del proyecto. Las cifras antiguas permaneceran visibles junto a las nuevas cuando se complete la reconstruccion anunciada. Hasta entonces, este modelo documenta un artefacto cuyo efecto no ha sido medido de forma fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB en la precision del modelo base (safetensors de 3,4 GB), en torno a 1,8 GB en cuantizacion de 8 bits y cerca de 1,0-1,2 GB en cuantizacion de 4 bits (GGUF).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para cuantizaciones ligeras; una RTX 3060, RTX 4060 o superior ejecuta el modelo sin dificultad. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, con holgura, incluso en equipos de gama media o baja y en CPU mediante llama.cpp.
- Opciones de despliegue: transformers, vLLM, text-generation-inference (TGI), llama.cpp, Ollama y LM Studio (estos tres ultimos a traves del repositorio GGUF).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Comportamiento de rechazo | Licencia | Formato |
|---|---|---|---|---|---|
| smollm2-1.7b-abliterated | 1,7B | en | eliminado por diseno | apache-2.0 | safetensors, GGUF |
| SmolLM2-1.7B-Instruct (modelo base) | 1,7B | en | estandar (rechaza peticiones daninas) | apache-2.0 | safetensors, GGUF |
| Otras variantes abliterated de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa relevante es contra el propio modelo base, dado que comparten arquitectura, tamano y pesos de partida; la unica diferencia es la edicion de pesos orientada a la eliminacion del rechazo. No se dispone de datos verificados para comparar con otras alternativas abliterated del mismo rango de tamano.

## Limitaciones y advertencias

- No rechaza: es el objetivo del modelo y el punto que hay que entender antes de descargarlo. Respondera a peticiones que el modelo base declina, incluidas las daninas. Cualquier despliegue orientado a terceros necesita su propia capa de seguridad; este modelo no aporta ninguna.
- La abliteracion no es gratuita: es una edicion dirigida, pero sigue siendo una edicion. Cabe esperar cierta deriva en el comportamiento general respecto al modelo base, y el propio autor recomienda no asumir que el cambio es inocuo mientras no se remidan las cifras.
- Modelo pequeno, competencia limitada: con 1,7B es debil en terminos absolutos y sus respuestas sobre temas tecnicos no deben tomarse como fiables.
- Evaluacion solo en ingles y sobre un unico conjunto de prompts daninos: las cifras retiradas no permiten extrapolar conclusiones a otros idiomas ni a otros tipos de peticion.
- Sesgos heredados: los sesgos del modelo base persisten y nada los corrige; eliminar el rechazo puede facilitar provocarlos.
- Cifras retiradas: cualquier dato de rendimiento o de tasa de rechazo publicado previamente no es valido y no debe citarse, ni siquiera con matices.
- Uso previsto restringido: investigacion sobre mecanismos de rechazo, interpretabilidad, red teaming y evaluacion de seguridad. No esta pensado como asistente general ni para despliegue a usuarios finales.
- Licencia: apache-2.0, permisiva para uso comercial, pero la responsabilidad del uso recae en quien despliega el modelo, dado que carece de salvaguardas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ElementMerc/smollm2-1.7b-abliterated
- Builds GGUF: https://huggingface.co/ElementMerc/smollm2-1.7b-abliterated-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Repositorio de la herramienta senbonzakura: https://github.com/elementmerc/senbonzakura
- Changelog de correcciones: https://github.com/elementmerc/senbonzakura/blob/main/CHANGELOG.md
- Documentacion sobre los errores cometidos: https://elementmerc.github.io/senbonzakura/guide/what-we-got-wrong
