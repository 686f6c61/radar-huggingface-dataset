# azrouisghi/azrou-modeles

## Resumen

Azrou Modeles es un repositorio de modelos publicado por el usuario azrouisghi en HuggingFace, concebido para alimentar una aplicacion movil llamada Azrou Voix que funciona completamente en el dispositivo (on-device) y sin conexion a red. El repositorio agrupa dos artefactos con funciones complementarias: un modelo de lenguaje en formato GGUF derivado de Qwen3-0.6B, afinado mediante LoRA sobre frases en frances, que se encarga de seleccionar la accion del asistente a partir de una frase del usuario en formato compacto `action;clé=valeur`; y un paquete de reconocimiento automatico del habla (ASR) para frances continuo basado en sherpa-onnx y el modelo streaming zipformer de k2-fsa.

El modelo de lenguaje es, por tanto, un enrutador de intenciones de muy baja capacidad (0.6 mil millones de parametros) y no un generador de respuestas: segun la model card, el agente solo propone una accion y la aplicacion la verifica antes de ejecutarla, sin escribir nunca una respuesta a la persona. Esta separacion de responsabilidades es relevante para el diseno de asistentes de voz con requisitos estrictos de privacidad, ya que ningun dato del usuario abandona el telefono.

La relevancia actual del repositorio es limitada en terminos de ecosistema: registra cero descargas y cero likes, no declara pipeline en HuggingFace y la informacion publica se reduce a la model card. Aun asi, ilustra un patron de despliegue interesante (LLM pequeno cuantizado a Q8_0 para function calling local, combinado con ASR streaming en int8), y su licencia Apache 2.0 facilita la reutilizacion comercial de los pesos empaquetados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base declarado es Qwen3-0.6B, afinado con LoRA; arquitectura concreta del adaptador no especificada) |
| Parametros totales | no disponible (modelo base Qwen3-0.6B: 0,6 mil millones) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 para el modelo de agente; int8 para el encoder y el joiner del ASR |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`azrou-agent-qwen3-0.6b-q8_0.gguf`); paquete tar.bz2 con artefactos ONNX para el ASR (`azrou-stt-fr.tar.bz2`) |

## Arquitectura y entrenamiento

El componente de agente parte de Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, y se afina mediante LoRA sobre un conjunto de frases en frances segun declara el autor. El objetivo del ajuste no es la generacion libre de texto, sino la clasificacion de intenciones expresada como una cadena compacta con el formato `action;clé=valeur`, lo que reduce la longitud de salida y facilita el parseo deterministico en la aplicacion movil. Los pesos distribuidos estan cuantizados a Q8_0 en GGUF, formato orientado a inferencia eficiente en CPU y dispositivos con memoria limitada. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO.

El componente de reconocimiento de voz no es un modelo propio, sino una integracion del modelo streaming zipformer para frances de k2-fsa (sherpa-onnx, version 2023-04-14), empaquetado con encoder y joiner en int8, decoder y vocabulario de tokens. La innovacion tecnica del conjunto es de integracion mas que de investigacion: cadena ASR streaming en el dispositivo, enrutamiento de intenciones con un LLM de 0,6 B cuantizado y validacion de la accion por parte de la aplicacion anfitriona antes de ejecutarla. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Clasificacion de intenciones en frances: dado un enunciado, emite una accion en forma compacta `action;clé=valeur`.
- Function calling restringido: la salida esta pensada para ser parseada por la aplicacion, que valida la accion antes de ejecutarla.
- Reconocimiento automatico del habla en frances continuo mediante el paquete sherpa-onnx streaming zipformer incluido.
- Inferencia completamente offline en el dispositivo, sin envio de datos a servidores.
- Generacion de texto libre: no disponible como capacidad declarada; la model card indica explicitamente que el agente no escribe respuestas a la persona.
- Razonamiento multi-paso y agentes autonomos: no disponibles segun la documentacion.
- Capacidades multilingues: limitadas al frances; no se declaran otros idiomas.
- Vision, audio nativo en el LLM o modo thinking: no disponibles.

## Casos de uso

- Asistente de voz movil sin conexion: la aplicacion captura audio, lo transcribe con el paquete zipformer y envia el texto al agente Qwen3-0.6B Q8_0, que devuelve la accion a ejecutar; todo el pipeline reside en el telefono y no requiere red.
- Automatizacion de acciones locales por comandos de voz: el formato `action;clé=valeur` permite mapear frases como ajustes de configuracion o consultas a una accion concreta verificable por la app antes de actuar.
- Prototipado de enrutadores de intenciones en frances: util para equipos que necesiten un clasificador de comandos de baja latencia con un modelo de 0,6 B y cuantizacion Q8_0, sin depender de APIs externas.
- Aplicaciones con requisitos estrictos de privacidad: al no salir datos del dispositivo, encaja en escenarios regulados (salud, menores, entornos corporativos) donde el envio de audio a la nube es inviable.
- Accesibilidad en dispositivos de gama media: el tamano del modelo (0,6 B en Q8_0) y el ASR en int8 permiten ejecucion en moviles sin GPU dedicada, aunque el rendimiento concreto no esta documentado.
- Base para afinar un router de comandos propio: el adaptador LoRA y el formato de salida sirven como punto de partida para adaptar el enrutador a otro conjunto de acciones, reentrenando el LoRA sobre frases del dominio.
- Transcripcion continua de voz a texto en frances: el paquete sherpa-onnx puede reutilizarse de forma independiente al LLM para dictado o subtitulado offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Como referencia de orden de magnitud, un modelo de 0,6 B en Q8_0 ocupa aproximadamente 0,6-0,7 GB de pesos, pero el autor no publica mediciones de memoria en ejecucion.
- GPU recomendadas: no disponible; el diseno apunta a CPU de telefono mediante GGUF, no a GPU de servidor.
- Compatibilidad con GPU de consumo: no documentada; el formato GGUF Q8_0 es compatible con llama.cpp y derivados, pero no se declaran pruebas en RTX 4090, A100 u H100.
- Opciones de despliegue: inferencia GGUF con llama.cpp y sus envoltorios (Ollama, entre otros) para el agente; sherpa-onnx para el paquete de ASR. vLLM y TGI no estan documentados para este repositorio.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio contiene un GGUF Q8_0 de un modelo de 0,6 B y un archivo tar.bz2 de ASR; los tamanos exactos no se especifican en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|---|
| Azrou Modeles (este repositorio) | 0,6 B (base Qwen3-0.6B) | no disponible | fr | Apache 2.0 | Router de intenciones + ASR offline | HuggingFace, 0 descargas |
| Qwen3-0.6B | 0,6 B | no disponible en esta ficha | multilingue | Apache 2.0 | LLM generativo generalista | HuggingFace |
| Modelos ASR streaming de k2-fsa (sherpa-onnx zipformer fr 2023-04-14) | no disponible | no disponible | fr | Apache 2.0 | ASR streaming | HuggingFace / repositorio k2-fsa |
| Qwen2.5-0.5B-Instruct | 0,5 B | no disponible en esta ficha | multilingue | Apache 2.0 | LLM instruct generalista | HuggingFace |

La comparacion se limita a los modelos citados en la propia model card (Qwen3-0.6B y sherpa-onnx zipformer fr) y a un alternativo de tamano similar; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- El agente no genera respuestas al usuario: solo propone acciones, y la aplicacion debe validarlas antes de ejecutarlas. Usarlo como generador de texto produciria salidas fuera de su dominio de entrenamiento.
- Cobertura linguistica limitada al frances; no se declaran capacidades en castellano ni en otros idiomas.
- No hay informacion sobre el dataset de afinado LoRA, por lo que se desconocen sesgos y cobertura de vocabulario o acentos.
- Riesgo de alucinacion en la accion propuesta: el formato compacto reduce la superficie de error, pero el parseo y la validacion por parte de la app son imprescindibles.
- Cero descargas y cero likes en HuggingFace: no existe evidencia publica de validacion por terceros ni de uso en produccion.
- No se publican benchmarks, requisitos de hardware, latencia ni limites de contexto; cualquier evaluacion de produccion requerira mediciones propias.
- El paquete de ASR depende de una version concreta de sherpa-onnx (streaming zipformer fr 2023-04-14); cambios de version en el runtime pueden afectar a la compatibilidad.
- La licencia Apache 2.0 permite uso comercial de los artefactos publicados, pero conviene verificar las licencias de los modelos base (Qwen3-0.6B y sherpa-onnx) y de los datasets empleados en el afinado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/azrouisghi/azrou-modeles
- Modelo base del agente (Qwen3-0.6B): no se proporciona enlace directo en la informacion disponible
- Proyecto sherpa-onnx (k2-fsa): no se proporciona enlace directo en la informacion disponible
- Modelo streaming zipformer fr 2023-04-14 (k2-fsa): no se proporciona enlace directo en la informacion disponible
- Aplicacion Azrou Voix: no se proporciona enlace en la informacion disponible
