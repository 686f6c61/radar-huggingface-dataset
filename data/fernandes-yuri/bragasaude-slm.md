# fernandes-yuri/bragasaude-slm

## Resumen

Braga Saúde SLM es un modelo de lenguaje pequeno (SLM) desarrollado por fernandes-yuri para el dominio del atendimiento sanitario de la clinica Braga Saúde, dentro de su plataforma Care OS. El modelo esta disenado para ejecutarse integramente en el dispositivo (on-device), sin enviar texto a la nube, y la engine de inferencia esta implementada en Rust sobre candle (CPU), con tokenizacion mediante la libreria tokenizers de HuggingFace y despliegue previsto en Android (arm64-v8a y armeabi-v7a) a traves de JNI.

El repositorio publica la engine y la configuracion del modelo, pero en el momento de la consulta no incluye los pesos: estos se distribuirian como GGUF cuantizado (el nombre de fichero de referencia es `braga-saude-slm-1b-q4_k_m.gguf`, lo que sugiere un tamano del orden de 1000 millones de parametros con cuantizacion Q4_K_M) o como safetensors. El modelo esta especializado en portugues de Brasil (pt-BR) y en seis dominios de cuidado definidos por Care OS: sintomas, medicamentos, signos vitales, agendamiento, emergencia y servicios generales.

Su relevancia radica en el enfoque de privacidad por diseno (inferencia local en dispositivo movil) y en la restriccion explicita de alcance clinico: ningun prompt del modelo diagnostica ni autoriza medicacion, y los dominios de emergencia redirigen a SAMU 192 o a urgencias. La licencia MIT facilita su reutilizacion, aunque la ausencia de pesos publicados limita por ahora cualquier evaluacion empirica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (engine Rust + candle, inferencia en CPU) |
| Parametros totales | no disponible (el nombre de fichero sugiere ~1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (referenciado en el nombre del fichero GGUF); safetensors sin cuantizar como alternativa |
| Idiomas soportados | portugues de Brasil (pt-BR) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado) y safetensors; tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo (transformer, MoE, hibrido u otra), ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detalla la innovacion tecnica del modelo mas alla de la engine de inferencia: Rust con candle sobre CPU, tokenizacion con tokenizers y ejecucion on-device en Android mediante JNI. El repositorio incluye `config.json` y `tokenizer.json`, que contenrian la configuracion arquitectonica y el vocabulario, pero su contenido no se ha proporcionado.

El diseno del sistema si esta documentado a nivel funcional: el modelo opera sobre seis dominios de cuidado predefinidos (sintomas, medicamentos, signos vitales, agendamiento, emergencia, general) y las respuestas de los dominios clinicos estan acotadas por diseno para no emitir diagnosticos ni modificar pautas de medicacion. Los signos vitales se comparan con rangos de referencia de SBC, SBD, ADA y OMS.

## Capacidades

- Generacion de texto en portugues de Brasil orientada a conversaciones de atendimiento sanitario.
- Check-in sintomatico: recogida de duracion, intensidad y senales de alerta.
- Orientacion sobre medicamentos sin alterar dosis ni suspender recetas.
- Interpretacion de signos vitales frente a rangos de referencia (SBC, SBD, ADA, OMS).
- Orientacion de agendamiento y uso de la aplicacion o contacto con la clinica.
- Deteccion de emergencias y derivacion a SAMU 192 o a urgencias.
- Informacion sobre servicios de Braga Saúde.
- Ejecucion 100% local en el dispositivo, sin envio de texto a la nube.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Triaje inicial de sintomas en la app movil: el modelo mantiene una conversacion multi-turno para recoger duracion, intensidad y senales de alerta, y clasifica la situacion dentro del dominio `sintomas` sin emitir diagnostico. Es adecuado porque toda la inferencia ocurre en el dispositivo y no expone datos clinicos a servicios externos.
- Recordatorio y consulta de pautas de medicacion: el modelo responde dudas sobre medicamentos ya prescritos y deriva al profesional cuando la consulta implica cambio de dosis o suspension, cumpliendo la restriccion del dominio `medicamentos`.
- Seguimiento de signos vitales: el paciente introduce sus mediciones y el modelo las compara con los rangos de referencia de SBC, SBD, ADA y OMS para indicar si estan dentro de lo esperado o si conviene consultar.
- Gestion de agendamiento: el modelo orienta al paciente sobre como usar la app o contactar con la clinica para citas, reduciendo llamadas al centro.
- Deteccion y derivacion de emergencias: ante senales de alarma, el modelo encamina al usuario a SAMU 192 o a urgencias, funcionando como primera capa de seguridad en el flujo de la app.
- Informacion de servicios de Braga Saúde: responde preguntas frecuentes sobre la clinica y su plataforma Care OS dentro del dominio `geral`.
- Despliegue en dispositivos Android de gama media: al ejecutarse sobre CPU con candle y pesos Q4_K_M, el modelo puede integrarse via JNI en la app sin depender de conectividad ni de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario principal, ya que la engine usa candle sobre CPU; no se proporcionan cifras de memoria RAM.
- GPU recomendadas: no disponible; el diseno es CPU-first.
- Compatibilidad con GPU de consumo: no disponible; el objetivo declarado son dispositivos Android arm64-v8a y armeabi-v7a.
- Opciones de despliegue: engine propia en Rust con candle y tokenizers, integrada en la app Android via JNI; pesos en GGUF (Q4_K_M) descargables con `huggingface-cli` o `huggingface_hub`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (SLM on-device para salud en portugues) ni datos de rendimiento que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Los pesos del modelo no estan incluidos en el repositorio en el momento de la consulta; solo se publican engine y configuracion, por lo que el modelo no es ejecutable tal cual desde HuggingFace.
- El modelo esta restringido al portugues de Brasil; no se declara soporte de otros idiomas, incluido el castellano.
- Ambito clinico acotado: no diagnostica ni autoriza medicacion; cualquier uso fuera de los seis dominios de Care OS queda fuera de su diseno previsto.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad ni de tasas de error en dominios clinicos.
- Sesgos conocidos: no disponibles; no se documenta la composicion del dataset de entrenamiento.
- Longitud de contexto no declarada, lo que impide evaluar el comportamiento en conversaciones largas o con historiales clinicos extensos.
- Aunque la licencia MIT permite uso comercial, la ausencia de pesos y de documentacion de entrenamiento impide verificar el cumplimiento regulatorio sanitario en produccion.
- El nombre de fichero sugiere ~1B parametros, pero el tamano real no esta confirmado en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fernandes-yuri/bragasaude-slm
- Engine candle (Rust): https://github.com/huggingface/candle
- Libreria tokenizers: https://github.com/huggingface/tokenizers
- Paper, blog, repositorio de codigo adicional o demo: no disponible en la informacion proporcionada.
