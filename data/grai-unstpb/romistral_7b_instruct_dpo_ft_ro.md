# GRAI-UNSTPB/romistral_7b_instruct_dpo_ft_ro

## Resumen
`GRAI-UNSTPB/romistral_7b_instruct_dpo_ft_ro` es un adaptador LoRA publicado por el grupo GRAI-UNSTPB sobre el modelo `OpenLLM-Ro/RoMistral-7b-Instruct-DPO`, un modelo rumano de 7B parametros derivado de la familia Mistral. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (0,2 GB en el repositorio) que debe cargarse junto con el modelo base para poder generar texto; el pipeline declarado es `text-generation` y la libreria indicada es `peft`.

El adaptador se ha entrenado mediante SFT sobre un modelo que ya habia pasado por una fase de DPO, segun los tags `sft` y el propio nombre del checkpoint. El sufijo `_ro` y el modelo base apuntan a un ajuste orientado al rumano, aunque la model card no documenta idiomas oficialmente soportados ni composicion del dataset de ajuste.

La relevancia de esta ficha es limitada y conviene ser explicito: la model card es una plantilla sin rellenar, con campos como desarrollador, licencia, datos de entrenamiento y evaluacion marcados como "[More Information Needed]". El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks. Por tanto, se trata de un artefacto de investigacion sin validacion publica, no de un modelo listo para produccion sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; herencia de la arquitectura del modelo base `OpenLLM-Ro/RoMistral-7b-Instruct-DPO`. No detallada en la model card |
| Parametros totales | No disponible para el adaptador. El modelo base es de 7B (segun su denominacion); la model card no confirma el numero exacto |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la model card. Al ser un adaptador LoRA, la cuantizacion se aplica al modelo base tras fusionar los pesos |
| Idiomas soportados | No disponible en la model card. El sufijo `_ro` del identificador y el modelo base de la familia OpenLLM-Ro sugieren rumano como idioma principal |
| Licencia | No disponible |
| Formato de pesos | PEFT/LoRA en `safetensors` (`adapter_model.safetensors` + `adapter_config.json`); tamano del repositorio 0,2 GB |
| Libreria declarada | peft 0.21.2 (version de framework indicada en la model card) |
| Modelo base | OpenLLM-Ro/RoMistral-7b-Instruct-DPO |
| Fecha de publicacion | 2026-10-10 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
El objeto publicado es un adaptador de bajo rango (LoRA), no un modelo con pesos completos. Los tags del repositorio indican `lora`, `sft`, `transformers` y `trl`, de modo que el ajuste se realizo previsiblemente con la libreria TRL sobre el checkpoint `OpenLLM-Ro/RoMistral-7b-Instruct-DPO`, que ya incorpora una fase de optimizacion por preferencias (DPO) segun su propio nombre. La model card no especifica rango de LoRA, alpha, capas objetivo, tasa de aprendizaje, numero de pasos, regimen de precision ni numero de tokens de entrenamiento: todos esos campos aparecen como "[More Information Needed]".

No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, mezcla de expertos o arquitecturas hibridas). Cualquier afirmacion sobre datos de entrenamiento, composicion del dataset o proceso de alineacion posterior queda fuera de lo que la informacion proporcionada permite sostener. La unica referencia a un paper en los metadatos es `arxiv:1910.09700`, correspondiente a Lacoste et al. (2019) sobre estimacion de impacto ambiental, citado en la plantilla de la model card y no relacionado con el desarrollo del modelo.

## Capacidades
- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el modelo base esta etiquetado como instruct/DPO, aunque no hay ejemplos de uso ni evaluacion publicada.
- Ajuste fino supervisado adicional (SFT) sobre un checkpoint ya alineado con DPO, orientado segun el identificador a un caso de uso en rumano.
- Capacidad multilingue: no documentada. El modelo base pertenece a una iniciativa de modelos rumanos; el rendimiento en castellano o ingles no esta verificado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible; no se menciona ninguna capacidad multimodal.
- Carga mediante PEFT: el adaptador es compatible con el flujo estandar de `peft` + `transformers` para cargar un LoRA sobre su modelo base.

## Casos de uso
- Experimentacion academica con adaptadores LoRA: el repositorio sirve como punto de partida reproducible para estudiar el efecto de una ronda adicional de SFT sobre un modelo ya alineado con DPO, comparando la salida del adaptador frente al modelo base.
- Procesamiento de texto en rumano: si se confirma el idioma mediante evaluacion propia, el adaptador podria emplearse en tareas de generacion y resumen en rumano, siempre que se valide antes la calidad frente al modelo base sin adaptador.
- Clasificacion y etiquetado de texto asistido por LLM: uso del modelo como generador de etiquetas o resumenes sobre corpus en rumano, con revision humana posterior dado el riesgo de alucinacion no cuantificado.
- Base para posteriores ciclos de ajuste: al ser un adaptador ligero (0,2 GB), es barato de versionar y de reentrenar en una unica GPU, lo que lo hace util como banco de pruebas de hiperparametros de LoRA.
- Desarrollo de asistentes conversacionales de dominio especifico: partiendo del modelo base con instrucciones, se puede especializar mediante SFT en un vertical concreto (por ejemplo, atencion al ciudadano en administracion publica rumana), aunque requiere dataset propio y evaluacion.
- Investigacion sobre alineacion: analisis comparativo de las respuestas del checkpoint DPO frente al adaptador SFT para medir deriva de estilo, obediencia a instrucciones o regresiones en seguridad.
- Docencia y formacion: ejemplo practico de publicacion de un adaptador con PEFT y TRL en un repositorio pequeno, util para talleres sobre ajuste eficiente de parametros.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con el marcador "[More Information Needed]" y el repositorio no adjunta tabla de resultados, scripts de evaluacion ni comparaciones con otros modelos. Tampoco hay datos de latencia ni throughput.

## Requisitos de hardware
- El adaptador en si ocupa 0,2 GB, pero no es autosuficiente: requiere cargar el modelo base `OpenLLM-Ro/RoMistral-7b-Instruct-DPO` para inferencia.
- VRAM estimada para el modelo fusionado de 7B (estimacion estandar para esta clase de tamano, no confirmada por el autor): aproximadamente 14-15 GB en bf16/fp16, 8-9 GB en cuantizacion de 8 bits y 4-5 GB en cuantizacion de 4 bits.
- GPU recomendadas segun esa estimacion: A100 40/80 GB, H100, L40S o A6000 para bf16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 con lotes pequenos; RTX 4080/4070 Ti o GPUs de 12-16 GB para cuantizacion de 8 bits; GPUs de 8 GB para cuantizacion de 4 bits.
- Viabilidad en GPU de consumo: si, en cuantizacion de 4 bits cabe en tarjetas de 6-8 GB, y en bf16 cabe en una RTX 4090 o RTX 3090. No verificado experimentalmente en esta ficha.
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama requieren fusionar previamente el adaptador con el modelo base (`merge_and_unload` en PEFT) para aprovechar kernels optimizados; tambien es posible servir con `transformers` + `peft` cargando el adaptador en caliente, con mayor coste de memoria.
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependerian del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `GRAI-UNSTPB/romistral_7b_instruct_dpo_ft_ro` (adaptador LoRA) | Adaptador sobre base de 7B | No disponible | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas |
| `OpenLLM-Ro/RoMistral-7b-Instruct-DPO` (modelo base) | 7B (segun denominacion) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |
| Otros modelos de la iniciativa OpenLLM-Ro (por ejemplo, variantes basadas en Llama o Gemma) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |
| Mistral-7B-Instruct (familia de origen de la arquitectura) | 7B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos verificados para establecer una comparativa cuantitativa con alternativas de la misma categoria. Cualquier comparacion de rendimiento exigiria ejecutar una evaluacion propia sobre los mismos conjuntos de prueba.

## Limitaciones y advertencias
- Model card vacia: los campos de desarrollador, financiacion, licencia, idiomas, datos de entrenamiento, hiperparametros y evaluacion estan sin completar o marcados como "[More Information Needed]".
- Licencia no disponible: sin una licencia explicita no puede asumirse permiso para uso comercial. El adaptador hereda ademas las condiciones del modelo base, que deben verificarse por separado antes de cualquier despliegue.
- Sin evaluacion publica: no hay benchmarks, pruebas de regresion ni analisis de seguridad, por lo que se desconoce si el ajuste SFT ha degradado capacidades del checkpoint DPO original.
- Riesgo de alucinacion no cuantificado: al no existir evaluacion de fidelidad, las salidas deben tratarse como no verificadas y someterse a revision humana en contextos sensibles.
- Idiomas no confirmados: aunque el identificador sugiere rumano, no hay declaracion explicita. El comportamiento en castellano, ingles u otros idiomas es desconocido y probablemente inferior al de modelos entrenados especificamente para ellos.
- Sesgos desconocidos: no se documenta composicion del dataset de ajuste ni analisis de sesgos, de modo que no puede descartarse amplificacion de sesgos presentes en el modelo base.
- Longitud de contexto no confirmada: no se indica si el adaptador conserva la ventana de contexto del modelo base ni si el entrenamiento LoRA la ha modificado.
- Trazabilidad limitada: repositorio con 0 descargas y 0 likes, con fechas de creacion y actualizacion separadas por ocho segundos, lo que sugiere una publicacion automatizada o de prueba y refuerza la necesidad de auditoria previa.
- Uso en produccion desaconsejado sin validacion: no hay informacion sobre latencia, throughput, estabilidad ni robustez frente a entradas adversarias.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/GRAI-UNSTPB/romistral_7b_instruct_dpo_ft_ro
- Modelo base: https://huggingface.co/OpenLLM-Ro/RoMistral-7b-Instruct-DPO
- Libreria PEFT: https://huggingface.co/docs/peft/index
- Libreria TRL: https://huggingface.co/docs/trl/index
- Referencia citada en la model card (estimacion de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML mencionada en la model card: https://mlco2.github.io/impact
- No se han encontrado en la informacion proporcionada papers, blogs, demos ni repositorios adicionales especificos de este adaptador.
