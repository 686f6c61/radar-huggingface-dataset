# SOTAagi2030/babelchat-7b-l10n-adapter

## Resumen

BabelChat-7B-l10n-adapter es un adaptador LoRA publicado por el usuario SOTAagi2030 sobre el modelo base BabelChat-7B-v2. El adaptador especializa el modelo base para tareas de localizacion en atencion al cliente multilingue, cubriendo ingles, aleman, japones y portugues. Se distribuye como repositorio PEFT con pesos en safetensors y licencia Apache 2.0.

El adaptador aplica una actualizacion de bajo rango sobre las proyecciones query y value de cada bloque de atencion del modelo base congelado, sin modificar los pesos originales. Esto permite acoplarlo a cualquier checkpoint de BabelChat-7B-v2 mediante la libreria `peft`. La model card reporta un promedio macro de 0.741 sobre 12 suites de evaluacion de localizacion, con un corpus de entrenamiento versionado como l10n-curated-2026.09 y 4 epochs de entrenamiento.

El interes practico del adaptador reside en su uso para enrutar tickets de soporte entrantes y redactar respuestas de primer paso para revision humana en cuatro idiomas. No sustituye la ruta de escalado humano y no debe emplearse para responder disputas de facturacion sin revision. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no se dispone de informacion sobre el pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre proyecciones query y value de cada bloque de atencion del modelo base congelado |
| Parametros totales | no disponible (adaptador LoRA; el modelo base BabelChat-7B-v2 no publica conteo en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, de, ja, pt |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es una actualizacion de bajo rango (LoRA) aplicada a las proyecciones query y value de todos los bloques de atencion del modelo base BabelChat-7B-v2, que permanece congelado. Al no modificar los pesos base, el adaptador puede montarse sobre cualquier checkpoint compatible de BabelChat-7B-v2 mediante `peft`. La model card no detalla el rango de la descomposicion, el factor alpha ni la tasa de aprendizaje empleada.

El entrenamiento se ejecuto en la run babel-lora-1017 sobre el corpus l10n-curated-2026.09 durante 4 epochs. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El adaptador fue promovido por la revision de release del ciclo 2026.10, y el registro de evaluacion congelado de esa revision se aloja en el repositorio de dataset `babel-lora-eval-ledger`, que no forma parte de la informacion proporcionada.

## Capacidades

- Enrutamiento de intencion (intent routing) en tickets de soporte: 0.806 de exact-match en la suite correspondiente.
- Relleno de slots (slot filling): 0.791 de exact-match.
- Enlazado de entidades (entity linking): 0.725 de exact-match.
- Recuperacion de FAQ (faq retrieval): 0.788 de exact-match.
- Generacion de respuestas ancladas en evidencia (answer groundedness): 0.711.
- Fluidez de respuesta (reply fluency): 0.752.
- Compresion de resumenes (summary compression): 0.751.
- Adaptacion de tono (tone adaptation): 0.694.
- Formateo por locale (locale formatting): 0.648.
- Manejo de cambio de codigo (code switch handling): 0.706.
- Seguridad en rechazos (refusal safety): 0.784.
- Entrega en escalado (escalation handoff): 0.736.
- Soporte multilingue limitado a en, de, ja y pt.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Enrutamiento de tickets de soporte multilingue: el adaptador clasifica la intencion del ticket entrante (intent_routing 0.806) en ingles, aleman, japones y portugues, permitiendo derivar cada caso al equipo o cola adecuada antes de cualquier intervencion humana.
- Extraccion estructurada de datos del ticket: mediante slot filling (0.791) y entity linking (0.725) puede poblar campos como producto, version, idioma de origen o identificador de cliente a partir del texto libre del ticket.
- Respuesta de primer paso para revision humana: genera borradores de respuesta con fluidez de 0.752 y anclaje en evidencia de 0.711, que un agente humano revisa y aprueba antes del envio.
- Recuperacion de FAQ asistida: con faq_retrieval en 0.788, el adaptador puede seleccionar la entrada de FAQ mas relevante para la consulta del usuario y usarla como base de la respuesta.
- Resumen de hilos de conversacion largos: la capacidad de summary compression (0.751) permite condensar historiales de tickets multi-turno para que el agente humano retome el caso con contexto reducido.
- Gestion de tickets con cambio de codigo entre idiomas: pese a que la suite code_switch_handling obtiene 0.706 (por debajo del baseline 2026.06 de 0.640 en esta suite concreta, pero con delta positivo de +0.066), el adaptador puede pre-clasificar tickets mixtos antes de derivarlos a revision humana, segun indica la propia model card.
- Escalado controlado a humanos: con escalation_handoff en 0.736 y refusal_safety en 0.784, el adaptador puede marcar casos que requieren intervencion humana y rechazar peticiones fuera de alcance, siempre con revision posterior.

## Benchmarks y rendimiento

Resultados de exact-match reportados en la model card sobre suites de localizacion retenidas, comparados con el adaptador baseline de 2026.06:

| Familia | Suite | Score | Baseline | Delta |
|---|---|---|---|---|
| Understanding | intent_routing | 0.806 | 0.795 | +0.011 |
| Understanding | slot_filling | 0.791 | 0.780 | +0.011 |
| Understanding | entity_linking | 0.725 | 0.742 | -0.017 |
| Understanding | faq_retrieval | 0.788 | 0.770 | +0.018 |
| Generation | answer_groundedness | 0.711 | 0.715 | -0.004 |
| Generation | reply_fluency | 0.752 | 0.748 | +0.004 |
| Generation | summary_compression | 0.751 | 0.726 | +0.025 |
| Localization | tone_adaptation | 0.694 | 0.701 | -0.007 |
| Localization | locale_formatting | 0.648 | 0.665 | -0.017 |
| Localization | code_switch_handling | 0.706 | 0.640 | +0.066 |
| Safety & Escalation | refusal_safety | 0.784 | 0.762 | +0.022 |
| Safety & Escalation | escalation_handoff | 0.736 | 0.719 | +0.017 |

Promedio macro sobre las 12 suites: 0.741. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Depende del checkpoint del modelo base BabelChat-7B-v2 sobre el que se monta el adaptador.
- GPU recomendadas: no disponible. El adaptador LoRA en si ocupa un espacio minimo (el repositorio reporta 0.0 GB), pero requiere cargar el modelo base completo.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base y de la cuantizacion aplicada a este.
- Opciones de despliegue: el adaptador se distribuye como PEFT y se monta con la libreria `peft`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores LoRA de localizacion para atencion al cliente) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre transcripciones de soporte curadas; el rendimiento en peticiones legales, medicas o fuera de alcance no esta probado.
- La suite code_switch_handling queda en 0.706, por debajo del baseline 2026.06 (0.640) segun la model card, por lo que los tickets con cambio de codigo deben derivarse a revision humana.
- El adaptador no sustituye la ruta de escalado humano y no debe usarse para responder disputas de facturacion sin revision.
- Regresiones frente al baseline 2026.06 en entity_linking (-0.017), answer_groundedness (-0.004), tone_adaptation (-0.007) y locale_formatting (-0.017).
- Cobertura linguistica limitada a ingles, aleman, japones y portugues; no se documenta soporte para otras lenguas.
- No se documentan sesgos conocidos, riesgo de alucinacion especifico, longitud de contexto ni restricciones de uso comercial mas alla de la licencia Apache 2.0.
- El repositorio tiene 0 descargas y 0 likes, y no se dispone de informacion sobre el pipeline de inferencia ni sobre el modelo base mas alla de su identificador.
- El registro de evaluacion congelado se aloja en el repositorio de dataset `babel-lora-eval-ledger`, que no forma parte de la informacion disponible; los resultados de la model card no han sido verificados de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SOTAagi2030/babelchat-7b-l10n-adapter
- Repositorio de dataset de evaluacion (referenciado en la model card, no verificado): `babel-lora-eval-ledger`
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales.
