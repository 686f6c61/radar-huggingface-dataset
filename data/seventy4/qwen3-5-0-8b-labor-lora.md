# seventy4/qwen3.5-0.8b-labor-lora

## Resumen

`seventy4/qwen3.5-0.8b-labor-lora` es un adaptador LoRA de tipo SFT (supervised fine-tuning) publicado por el usuario seventy4 sobre el modelo base `Qwen/Qwen3.5-0.8B`. Su proposito es especializar un modelo pequeno de 0,8 mil millones de parametros en tareas de consultoria laboral en coreano (노무 상담, asesoria en materia de relaciones laborales), a partir del dataset `seventy4/labor-counsel-qa`. El adaptador no modifica la arquitectura del modelo base: se carga mediante PEFT y se superpone a los pesos originales.

El interes de esta publicacion es acotado pero representativo de un patron habitual en el ecosistema open source: adaptadores de bajo rango (r 8, alpha 16) entrenados sobre modelos compactos para dominios verticales muy concretos, con coste de entrenamiento reducido y despliegue sencillo. Al tratarse de un adaptador y no de un modelo completo, su utilidad depende enteramente de las capacidades del modelo base Qwen3.5-0.8B, del que no se dispone de especificaciones detalladas en la informacion proporcionada.

La relevancia practica es limitada por su alcance: idioma coreano, un unico dominio (derecho laboral) y un volumen de descargas muy bajo (14 descargas, 0 likes en el momento de la consulta), lo que sugiere escasa validacion externa. Es un artefacto adecuado para experimentacion y para estudiar el flujo de trabajo PEFT + TRL, no para produccion sin evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer `Qwen/Qwen3.5-0.8B`; r 8, alpha 16, all-linear |
| Parametros totales | no disponible (el adaptador es de rango bajo; los parametros totales corresponden al modelo base Qwen3.5-0.8B, tamano nominal 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base al que se fusione) |
| Idiomas soportados | coreano (ko), segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con la libreria TRL sobre el modelo base Qwen/Qwen3.5-0.8B. Los hiperparametros declarados en la model card son: rango r = 8, lora_alpha = 16, aplicacion sobre todas las capas lineales (all-linear), tasa de aprendizaje 2e-4 y 4 epocas de entrenamiento. El dataset empleado es `seventy4/labor-counsel-qa`, un conjunto de pares pregunta-respuesta sobre consultoria laboral en coreano; no se detalla en la informacion disponible su tamano, composicion ni proceso de filtrado.

No se documenta si el entrenamiento incluyo etapas de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT, ni se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Al ser un adaptador, no introduce cambios arquitectonicos: se combina con los pesos del modelo base en tiempo de carga mediante `PeftModel.from_pretrained`.

## Capacidades

- Generacion de texto en coreano orientada a preguntas y respuestas sobre normativa y consultoria laboral.
- Especializacion de dominio: respuestas sobre relaciones laborales derivadas del dataset de entrenamiento.
- Integracion con el ecosistema HuggingFace Transformers y PEFT mediante carga de adaptador.
- Compatibilidad con el pipeline `text-generation`.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no documentadas; la model card declara unicamente coreano.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes de consultoria laboral en coreano: el adaptador puede cargarse sobre Qwen3.5-0.8B para generar respuestas de primer borrador sobre dudas de contratos, vacaciones o jornada, siempre con revision humana por el riesgo juridico.
- Investigacion sobre fine-tuning eficiente: sirve como ejemplo reproducible de un flujo SFT con LoRA (r 8, alpha 16, all-linear) usando TRL y PEFT, util para comparar hiperparametros en modelos de menos de 1B.
- Generacion de FAQs internas para departamentos de recursos humanos: el modelo puede producir borradores de preguntas frecuentes a partir de la terminologia del dataset, que luego se revisan y publican.
- Clasificacion y enriquecimiento de consultas: dado su tamano reducido, puede usarse como primer filtro para etiquetar consultas laborales por tematica antes de derivarlas a un sistema mayor.
- Experimentos de destilacion o evaluacion de dominio: el adaptador permite medir cuanto conocimiento de dominio se incorpora con un presupuesto de entrenamiento minimo sobre un modelo de 0,8B.
- Despliegue en entornos con recursos limitados: al ser un adaptador pequeno sobre un modelo de 0,8B, puede ejecutarse en CPU o en GPU de gama baja para demos internas, con latencia no documentada.
- Base para iteracion con RLHF/DPO: el adaptador puede servir como punto de partida para etapas posteriores de alineacion en el dominio laboral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al tratarse de un adaptador sobre un modelo de 0,8B, la huella corresponde practicamente a la del modelo base (tipicamente por debajo de 2 GB en cuantizacion de 4 bits, estimacion orientativa no confirmada en la informacion proporcionada).
- GPU recomendadas: no disponibles; un modelo de 0,8B es viable en GPUs consumer, pero no se documentan pruebas.
- Compatibilidad con GPU consumer: previsiblemente si, dado el tamano del modelo base; sin datos de validacion.
- Opciones de despliegue: Transformers + PEFT (metodo documentado en la model card); vLLM, llama.cpp, Ollama o TGI requeririan fusionar el adaptador con el modelo base, extremo no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| seventy4/qwen3.5-0.8b-labor-lora | Adaptador LoRA sobre 0,8B | no disponible | apache-2.0 | SFT de dominio laboral en coreano | HuggingFace (14 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | no disponible en la informacion proporcionada | Modelo generalista | HuggingFace |
| Adaptadores LoRA de dominio similares | Variable | Variable | Variable | SFT vertical | HuggingFace |

No se dispone de datos de rendimiento comparado con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito muy restringido: entrenado unicamente para consultoria laboral en coreano; su comportamiento fuera de ese dominio no esta evaluado.
- Riesgo de alucinacion juridica: un modelo de 0,8B puede generar respuestas plausibles pero incorrectas sobre normativa laboral; no debe usarse como fuente de asesoramiento legal sin revision profesional.
- Sesgos: no documentados por el autor; el dataset de entrenamiento puede introducir sesgos propios de la jurisdiccion y fuente de las respuestas.
- Idiomas: la model card declara solo coreano; el rendimiento en castellano no esta garantizado.
- Volumen de validacion minimo: 14 descargas y 0 likes indican ausencia de evaluacion independiente.
- Licencia: apache-2.0 para el adaptador, pero el uso comercial debe verificar tambien la licencia del modelo base Qwen3.5-0.8B, no incluida en la informacion proporcionada.
- Dependencia del modelo base: cualquier limitacion de contexto, cuantizacion o rendimiento del base se hereda sin cambios.
- Sin datos de benchmarks, latencia ni requisitos de hardware publicados.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/seventy4/qwen3.5-0.8b-labor-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/seventy4/labor-counsel-qa
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
