# ClementRbl/triage-chsa-qwen3-1.7b

## Resumen

El modelo `ClementRbl/triage-chsa-qwen3-1.7b` es un adaptador LoRA desarrollado por ClementRbl sobre el modelo base `Qwen/Qwen3-1.7B-Base`. Su propósito es evaluar el nivel de prioridad de triaje en servicios de urgencias a partir de un cuadro clínico estructurado, en francés o inglés. El adaptador se ha entrenado mediante fine-tuning supervisado (SFT) y posterior alineación por preferencias (DPO), y está pensado como una prueba de concepto no certificada como dispositivo médico.

El modelo resuelve el problema de la sobrecarga en los servicios de urgencias, donde la clasificación rápida y precisa de pacientes es crítica. A diferencia de un modelo generalista, este adaptador está especializado en una tarea concreta: asignar un nivel de prioridad (según una transposición simplificada de la escala FRENCH a tres niveles) y justificar la evaluación. Su relevancia actual radica en la creciente demanda de herramientas de apoyo clínico basadas en IA, aunque con limitaciones claras de uso.

El adaptador tiene un tamaño de repositorio de 0.2 GB y se distribuye bajo licencia Apache 2.0. No se dispone de información sobre la longitud de contexto ni sobre otros parámetros técnicos del adaptador, pero al estar basado en Qwen3-1.7B, hereda la arquitectura transformer decoder-only de este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-1.7B-Base (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA, repo de 0.2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-1.7B-Base`, un modelo de lenguaje de 1.700 millones de parametros con arquitectura transformer decoder-only. El adaptador LoRA se entrena mediante fine-tuning supervisado (SFT) seguido de alineacion por preferencias (DPO), tal como se indica en la model card. El entrenamiento se realiza sobre un conjunto de casos clinicos estructurados en un formato especifico que incluye edad, sexo, motivo de consulta, sintomas, antecedentes y constantes vitales. El modelo se usa con `enable_thinking=False`, es decir, sin activar el modo de razonamiento interno del modelo base.

La innovacion principal no reside en la arquitectura, sino en la especializacion: el adaptador ha sido afinado para una tarea medica concreta, con una metrica de seguridad explicita (sub-triage critico) que mide los casos en los que una urgencia maxima se clasifica con un nivel menor. El entrenamiento se evalua sobre 600 casos construidos a partir de motivos de consulta nunca vistos durante el entrenamiento, lo que permite estimar la capacidad de generalizacion.

## Capacidades

- Evaluacion del nivel de prioridad de triaje en adultos a partir de un cuadro clinico estructurado (edad, sexo, motivo, sintomas, antecedentes, constantes).
- Generacion de una justificacion textual de la evaluacion realizada.
- Soporte bilingue frances e ingles.
- Capacidad de generalizacion a casos no vistos durante el entrenamiento, con una exactitud medida del 89-90 %.
- No dispone de tool calling, funciones de agente, vision ni otras capacidades generales; esta limitado a la tarea de triaje.

## Casos de uso

- Apoyo al triaje en servicios de urgencias: el modelo puede procesar rapidamente un cuadro clinico introducido por el personal sanitario y sugerir un nivel de prioridad, ayudando a reducir el tiempo de clasificacion en situaciones de alta demanda.
- Triaje telefonico o telemedicina: integrado en un sistema de atencion remota, el modelo puede evaluar la gravedad de los sintomas descritos por el paciente y recomendar el nivel de urgencia antes de derivar a un medico.
- Formacion de residentes y personal de enfermeria: el modelo puede utilizarse como herramienta didactica para simular casos de triaje y comparar las decisiones del alumno con las del sistema, fomentando el aprendizaje de escalas clinicas.
- Auditoria de procesos de triaje: dado que el modelo genera una justificacion, puede emplearse para revisar retrospectivamente casos ya clasificados y detectar posibles inconsistencias en los criterios aplicados.
- Investigacion en NLP clinica: el adaptador sirve como base para experimentos sobre clasificacion automatica de prioridades, comparacion de metodos SFT vs DPO, o evaluacion de metricas de seguridad en modelos medicos.
- Sistema de segunda opinion con supervision humana: el modelo puede proponer una prioridad que el personal sanitario contrasta con su propio criterio, siempre que se utilice junto a un baremo explicito que eleve la prioridad cuando el modelo indique un nivel inferior al que sugieren las constantes.

## Benchmarks y rendimiento

La model card proporciona resultados medidos sobre 600 casos de generalizacion (motivos de consulta no vistos durante el entrenamiento), con intervalos de confianza de Wilson al 95 %.

| Modelo | Exactitud | Sub-triage critico |
| --- | --- | --- |
| `sft_generalisation` | 89.5 % [86.8 a 91.7] | 8.5 % [5.4 a 13.2] |
| `dpo_ablation_generalisation` | 90.2 % [87.5 a 92.3] | 8.5 % [5.4 a 13.2] |

El sub-triage critico se define como el porcentaje de casos en los que una urgencia maxima es clasificada con un nivel inferior. Esta metrica se considera la mas importante desde el punto de vista de seguridad, ya que un sub-triage puede dejar a un paciente grave en sala de espera. No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- No se proporcionan datos especificos de VRAM ni de GPU recomendadas en la informacion disponible.
- Al ser un adaptador LoRA sobre un modelo de 1.7B, el requisito principal es el del modelo base `Qwen/Qwen3-1.7B-Base`, que en precision fp16 ocupa aproximadamente 3-4 GB de VRAM. Sin embargo, este dato no esta confirmado en la documentacion del adaptador.
- El adaptador en si ocupa 0.2 GB, por lo que el peso adicional es minimo.
- Opciones de despliegue: se puede cargar con la libreria `peft` y `transformers`, o servir con vLLM usando `--enable-lora` y `--max-lora-rank 16` (como se muestra en el ejemplo de la model card).
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores LoRA para triaje medico). La comparativa natural seria con el modelo base `Qwen/Qwen3-1.7B-Base` sin el adaptador, que no esta especializado en esta tarea. Tampoco se conocen otros adaptadores publicos para triaje en la fecha de creacion de este modelo. Por tanto, esta seccion se considera no disponible.

## Limitaciones y advertencias

- Prueba de concepto, no certificada como dispositivo medico. No debe utilizarse para diagnosticar, prescribir ni reemplazar decisiones clinicas.
- El baremo de triaje es una transposicion simplificada de la escala FRENCH a tres niveles, no validada por un clinico.
- El ambito de aplicacion se limita a pacientes adultos; quedan excluidas la pediatria y la obstetricia.
- El modelo no debe servirse solo. El servicio de referencia debe incluir un baremo explicito que eleve la prioridad cuando el modelo anuncie un nivel inferior al que las constantes justifican.
- El formato de entrada debe seguir exactamente la plantilla vista en el entrenamiento; cualquier variacion degrada el rendimiento sin señal visible.
- Riesgo de sub-triage critico: en el 8.5 % de los casos de prueba, una urgencia maxima fue clasificada con un nivel menor. Este riesgo debe considerarse en cualquier uso en produccion.
- No se han publicado evaluaciones sobre sesgos, alucinaciones o comportamiento en contextos distintos al triaje.
- Licencia Apache 2.0 permite uso comercial, pero la falta de certificacion medica limita su aplicacion en entornos clinicos reales.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/ClementRbl/triage-chsa-qwen3-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
