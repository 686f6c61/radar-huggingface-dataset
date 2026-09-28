# JacobTDang/secondhand-laya

## Resumen

SecondHand Laya (round 2, int8 ONNX) es un ajuste fino del modelo convaiinnovations/laya orientado a rellenar preguntas de formularios de ayuda alimentaria (por ejemplo, SNAP) a partir de los datos guardados de un solicitante. Lo desarrolla JacobTDang y su rasgo definitorio es que no genera texto: para cada respuesta candidata devuelve una probabilidad calibrada de que sea la correcta, y solo rellena un campo cuando el mejor candidato supera un umbral de confianza y bate a la opción "None of these, or the facts don't say".

El modelo se distribuye como ONNX cuantizado a int8 (unos 429 MB en total) y esta disenado para ejecutarse en el propio ordenador del solicitante mediante onnxruntime-node, sin enviar datos a servidores externos. Es un fine-tune ligero (LoRA) sobre un modelo base de la familia Laya, un "System 1 decision engine" que puntua opciones tipadas en una sola pasada y devuelve probabilidades reproducibles y auditables.

Su relevancia radica en el enfoque de privacidad y calibracion: al tratar cada decision como clasificacion con probabilidades calibradas (error de calibracion esperado de 0,0013 tras el ajuste de temperatura), permite flujos con puerta de confianza y revision humana en lugar de generacion libre. Esta orientado exclusivamente al ingles y a una tarea acotada de emparejamiento de respuestas con campos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large, segun las especificaciones publicadas del modelo base) |
| Parametros totales | 421 millones (inferido del modelo base y del tamano del archivo int8 de ~421 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (segun el modelo base) |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx + model.onnx.data); tokenizador en tokenizer.json |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo base convaiinnovations/laya, que en su variante inglesa se apoya en ModernBERT-large (421 millones de parametros, 512 tokens de contexto). Se distribuye como grafo ONNX cuantizado a int8 y disenado para ejecucion en CPU. La innovacion funcional no esta en el backbone, sino en el uso: cada decision es una pregunta Laya del tipo `noul` con una instruccion fija ("Given the facts about the household, is the candidate the correct answer to the form question?"), y la salida relevante es la probabilidad `answers.correct.noul`, que pasa por una calibracion de temperatura por cubos definida en `rl_agent_config.json`.

El entrenamiento empleo LoRA (rango 16, alpha 32, dropout 0,05, con las 4 capas superiores entrenadas por completo), objetivo de proper scoring y ponderacion de clases equilibrada. Se realizo 1 epoca de 4.217 actualizaciones (batch 8, acumulacion de gradiente 2), con tasa de aprendizaje 2e-4, en bfloat16 sobre una Apple M4 Max usando LayaStudio. Los datos consisten en 780 preguntas copiadas de 39 formularios publicos de ayuda alimentaria (Google Forms, Jotform, PDF y formularios web), mas 757 reformulaciones sinteticas usadas solo para entrenamiento; cada etiqueta se calcula por codigo a partir de reglas de respuesta y hogares ficticios, sin datos de personas reales. Los splits son por formulario: 7 formularios de test y 7 retenidos nunca se usan en entrenamiento. La validacion dio una perdida de 0,027 y una exactitud de 0,993, y el error de calibracion esperado bajo de 0,0045 a 0,0013 tras el ajuste de temperatura.

## Capacidades

- Clasificacion de respuestas candidatas para preguntas de formularios de ayuda alimentaria (SNAP y similares), devolviendo probabilidades calibradas en lugar de texto generado.
- Respuesta a preguntas de opcion multiple y de si/no, puntuando cada opcion en una pasada independiente e incluyendo la opcion "None of these, or the facts don't say".
- Emparejamiento de cajas de texto con campos guardados del perfil ("Saved answer: <descripcion del campo>"), sin exponer el valor guardado al modelo.
- Puerta de confianza: solo rellena cuando el mejor candidato supera el umbral y bate a la opcion de abandono.
- Decisiones reproducibles y auditables mediante probabilidades calibradas por temperatura (configuracion en `rl_agent_config.json`).
- Inferencia en el dispositivo, en CPU, dentro de la aplicacion de escritorio SecondHand mediante onnxruntime-node.
- No soporta tool calling, function calling, agentes, ni generacion de texto.

## Casos de uso

- Rellenado automatico de formularios de prestaciones alimentarias: el modelo puntua cada opcion a partir de los datos del hogar y solo escribe cuando la confianza supera el umbral del 0,9, dejando el resto al solicitante.
- Aplicaciones de escritorio con privacidad estricta: al ejecutarse en local con onnxruntime-node, ningun dato del solicitante sale de su maquina, lo que lo hace apto para entornos con requisitos de residencia de datos.
- Pre-rellenado con revision humana (human-in-the-loop): las probabilidades calibradas permiten mostrar un borrador y exigir confirmacion explicita en los campos de menor confianza.
- Emparejamiento de campos repetidos en formularios largos: asocia cajas de texto con campos guardados del perfil sin necesitar el valor real, util para plantillas con estructura variable.
- Triaje y asistencia a personas con dificultades de lectura: al mapear preguntas a datos ya conocidos, reduce la carga cognitiva de responder formularios complejos de beneficios sociales.
- Procesamiento por lotes sin conexion: en escenarios de baja conectividad, el modelo puede rellenar formularios en local y sincronizarse despues, con tiempos de 26 ms por candidato de caja de texto y 80-120 ms por candidato de opcion en CPU M4 Max.
- Registro y auditoria de decisiones: al devolver probabilidades, permite trazar por que se relleno cada campo, util en contextos de cumplimiento.

## Benchmarks y rendimiento

Los resultados publicados son especificos de la tarea (no se reportan MMLU, HumanEval ni GSM8K). Umbral de confianza: 0,9.

| Tarea | Conjunto | Precision | Cobertura | Rellenos incorrectos |
|---|---|---|---|---|
| Respuesta | 2.016 preguntas de test | 0,749 (bruta) | 0,780 | 43 brutos, 0 realmente incorrectos |
| Respuesta | 368 preguntas retenidas | 0,565 (bruta) | 0,765 | 10 brutos, 0 realmente incorrectos |
| Emparejamiento (a 0,95) | 169 cajas de test | 0,909 | 0,854 | 7 |
| Emparejamiento (a 0,95) | 78 cajas retenidas | 0,902 | 0,787 | 4 |

Segun la model card, todos los rellenos de respuesta marcados como "incorrectos" son en realidad respuestas correctas segun los hechos del hogar, pero caen en tres preguntas que la clave de respuestas congelada no puede expresar. Metricas de validacion del entrenamiento: perdida 0,027 y exactitud 0,993; error de calibracion esperado de 0,0013 tras el ajuste.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo ocupa unos 429 MB (421 MB del archivo de datos int8) y se ejecuta en CPU.
- Memoria RAM: suficiente con menos de 1 GB libre para cargar los pesos, mas el sobrecoste del runtime y del tokenizador.
- GPU recomendadas: no aplica; esta disenado para inferencia en CPU.
- Cabe en cualquier ordenador de consumo: se ejecuta en CPU de una Apple M4 Max y, por su tamano, en equipos de escritorio convencionales.
- Opciones de despliegue: onnxruntime-node (uso documentado en SecondHand); al ser ONNX estandar, tambien seria compatible con otros runtimes ONNX, aunque no se documentan en la model card.
- Latencia: aproximadamente 26 ms por candidato de caja de texto y 80-120 ms por candidato de opcion en CPU de M4 Max; cada candidato requiere una pasada separada, por lo que las paginas largas pueden tardar segundos.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| JacobTDang/secondhand-laya | 421 M (int8) | 512 | Apache-2.0 | ONNX int8 | HuggingFace |
| convaiinnovations/laya (raiz inglesa) | 421 M | 512 | Apache-2.0 | no disponible | HuggingFace |
| convaiinnovations/laya (multilingue) | 322 M (mmBERT-base) | no disponible | Apache-2.0 | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada. Frente a un LLM generativo de proposito general usado para rellenar formularios, este modelo se diferencia por devolver probabilidades calibradas y no generar texto, pero no hay cifras publicadas que permitan una comparacion directa.

## Limitaciones y advertencias

- Cajas que pertenecen a otra persona: un "Name" o "Date of Birth" de un familiar en una seccion repetida puede emparejarse con los campos del solicitante, porque el modelo ve la etiqueta pero no su seccion.
- Cajas combinadas: campos como "City and Zip Code" se emparejan con una de sus partes.
- Precision de emparejamiento por debajo de 0,95.
- Muchas opciones: las temperaturas para preguntas con 11 o mas opciones estan recortadas, por lo que su confianza queda sin calibrar.
- Velocidad: cada candidato es una pasada independiente, de modo que las paginas largas tardan segundos.
- Idioma: solo ingles.
- Datos de entrenamiento acotados a formularios publicos de ayuda alimentaria y reformulaciones sinteticas; puede no generalizar a otros dominios.
- La licencia Apache-2.0 permite uso comercial, pero la precision bruta baja en conjuntos retenidos (0,565) aconseja mantener el umbral de confianza y la revision humana en produccion.
- No es un modelo generativo: no debe esperarse de el redaccion, resumen ni razonamiento abierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JacobTDang/secondhand-laya
- Modelo base convaiinnovations/laya: https://huggingface.co/convaiinnovations/laya
- Repositorio del modelo base: https://huggingface.co/convaiinnovations/laya/tree/main
- Sitio del proyecto Laya: https://laya.convaiinnovations.com/
- Laya AI (modelo de decision open source): https://laya-ai.com/
- Documentacion sobre decisiones calibradas en una pasada: https://layaai.org/
