# AbrahamPJ/nightmare-translate

## Resumen

nightmare-translate es un repositorio de espejo (mirror) publicado por el usuario AbrahamPJ que redistribuye, sin modificaciones, los modelos de traduccion automatica neuronal de Firefox Translations desarrollados por Mozilla dentro del proyecto Bergamot. Se trata de dos pares de traduccion directos: ruso a ingles (`ruen/`) y chino simplificado a ingles (`zhen/`), ambos en su version 2.1. El autor no ha entrenado ni ajustado los pesos: los ficheros se copian byte a byte desde Firefox Remote Settings y se vuelven a alojar en Hugging Face para que la aplicacion Nightmare Mobile pueda descargarlos a traves de su ajuste de espejo, incluso en redes donde la CDN de Mozilla no es accesible.

El proposito declarado es convertir prompts de imagen escritos en ruso o en chino a ingles directamente en el telefono, sin conexion y sin enviar texto a un servicio externo. Tecnicamente son modelos Marian de traduccion automatica neuronal con pesos cuantizados a int8 mediante intgemm (ficheros `*.intgemm.alphas.bin`), acompanados de un lexico de shortlist (`lex.50.50.*.s2t.bin`) y un vocabulario SentencePiece (`vocab.*.spm`). El conjunto completo ocupa apenas 0,1 GB en el repositorio, lo que da una idea del reducido tamano por direccion.

Su relevancia es practica mas que cientifica: demuestra un patron de despliegue de NMT en el dispositivo (on-device) sobre CPU, replicable en escenarios con restricciones de privacidad, conectividad o latencia. No es un modelo generativo de proposito general ni compite con LLM multilingues; es una pieza de infraestructura ligera para una tarea muy concreta. El repositorio no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) con runtime Bergamot e inferencia int8 via intgemm |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (traduccion a nivel de frase; la model card no especifica limite de tokens) |
| Tipos de cuantizacion | int8 (ficheros `model.*.intgemm.alphas.bin`) |
| Idiomas soportados | ruso, chino simplificado, ingles (solo direcciones ru→en y zh→en) |
| Licencia | Mozilla Public License 2.0 (MPL-2.0) |
| Formato de pesos | binario intgemm de Bergamot/Marian (`.bin`) + lexico shortlist (`.bin`) + vocabulario SentencePiece (`.spm`); no safetensors, no GGUF |
| Tamano del repositorio | 0,1 GB (ambas direcciones) |
| Version upstream | Firefox Translations 2.1 |
| Proposito | translation (pipeline declarado en Hugging Face) |
| Autor del repositorio | AbrahamPJ |
| Autor original de los pesos | Mozilla / proyecto Bergamot |

## Arquitectura y entrenamiento

Los pesos corresponden a la familia de modelos Marian utilizada por Firefox Translations. Marian es un framework de traduccion automatica neuronal basado en transformer encoder-decoder, y Bergamot es la bifurcacion de Mozilla orientada a inferencia en el dispositivo: motores nativos, compilacion a WebAssembly y kernels int8 (intgemm) para ejecutar en CPU sin GPU. Cada direccion se distribuye en tres ficheros: el modelo cuantizado con factores alpha de intgemm, un lexico de shortlist que restringe el vocabulario candidato durante la decodificacion y acelera la busqueda, y un vocabulario SentencePiece.

No hay informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo fases de RLHF o DPO. Al tratarse de un espejo de pesos ya publicados, el autor del repositorio no aporta proceso de entrenamiento propio: se limita a redistribuir los artefactos de la coleccion `translations-models` de Firefox Remote Settings, con fecha de descarga 2026-09-26. Cualquier detalle sobre datos y metodologia debe consultarse en la documentacion de Mozilla, no en esta ficha.

La innovacion tecnica relevante no esta en el modelo sino en el stack de ejecucion: cuantizacion int8 con intgemm, decodificacion con lexico de shortlist y empaquetado para consumo en movil. Todo ello permite traduccion offline con una huella de memoria muy baja y sin acelerador dedicado.

## Capacidades

- Traduccion de texto de ruso a ingles (`ruen/`), version 2.1 de Mozilla.
- Traduccion de texto de chino simplificado a ingles (`zhen/`), version 2.1 de Mozilla.
- Ejecucion completamente offline: no requiere red una vez descargados los ficheros.
- Inferencia en CPU con pesos int8, sin necesidad de GPU ni de aceleradores especializados.
- Integracion en aplicaciones moviles mediante el runtime Bergamot/Marian; la model card cita Foxlet Translate (MIT) como implementacion de referencia.
- Compatible con despliegue en navegador mediante compilaciones WebAssembly del motor Bergamot.
- No soporta traduccion inversa (en→ru o en→zh): solo las dos direcciones listadas.
- No ofrece tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode) ni de capacidades de vision o audio.
- No es un modelo generativo de chat: traduce frases, no mantiene conversaciones multi-turno.

## Casos de uso

- Traduccion de prompts de imagen en el movil: Nightmare Mobile usa estos modelos para convertir prompts escritos en ruso o chino a ingles antes de enviarlos a un generador de imagenes. La ventaja es que el texto no sale del dispositivo y no se depende de una API externa.
- Aplicaciones Android o iOS con traduccion offline: cualquier app que necesite traducir fragmentos cortos ru→en o zh→en sin conexion puede empaquetar estos ficheros y usar el runtime Bergamot; el tamano de 0,1 GB para ambas direcciones lo hace viable como recurso descargable.
- Despliegue en redes con CDN bloqueada: el repositorio existe precisamente para servir como espejo alternativo cuando `firefox-settings-attachments.cdn.mozilla.net` no es alcanzable; util en entornos corporativos o regionales con filtrado de red.
- Extensiones de navegador con traduccion en el cliente: al ser los mismos pesos que usa Firefox Translations, encajan en compilaciones WebAssembly y permiten traducir contenido sin enviarlo a un servidor.
- Preprocesado en pipelines de generacion de imagenes o video: normalizar prompts en ruso o chino a ingles antes de la etapa de inferencia generativa, con coste de CPU minimo.
- Herramientas de escritorio para lectura de documentacion tecnica: traduccion de fragmentos de manuales o issues en ruso o chino simplificado a ingles en un equipo sin GPU.
- Escenarios con requisitos de privacidad o cumplimiento: al no transmitir texto a terceros, encaja en flujos donde el contenido no puede salir de la maquina del usuario.
- Traduccion en el borde (edge computing): dispositivos con CPU modesta y memoria limitada pueden ejecutar el motor int8 sin acelerador, lo que descarta la necesidad de aprovisionar GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de calidad (BLEU, chrF, COMET u otras), y la busqueda web realizada no devolvio documentacion tecnica relevante sobre estos pesos.

## Requisitos de hardware

- VRAM: no aplica para el caso de uso previsto; el motor int8 esta disenado para CPU. En una GPU, la huella seria inferior a 1 GB, pero no es un escenario soportado por el runtime Bergamot.
- Memoria RAM estimada: coherente con el tamano del repositorio, 0,1 GB para las dos direcciones; cada direccion se usaria por separado, por lo que la carga en memoria es del orden de decenas de MB por modelo (estimacion a partir del tamano de los ficheros, no verificada con mediciones publicadas).
- GPU recomendadas: no aplica; no requiere GPU. Cualquier CPU x86-64 o ARM moderna con soporte int8 es suficiente.
- GPU de consumo: irrelevante para este modelo; esta pensado para CPU y para movil.
- Movil: es el destino principal declarado (aplicacion Nightmare Mobile), con ejecucion offline en el telefono.
- Opciones de despliegue: runtime Bergamot/Marian nativo, Foxlet Translate (MIT) en Android, compilaciones WebAssembly para navegador. No es compatible directamente con vLLM, TGI, llama.cpp, Ollama ni con `transformers` de forma estandar, porque el formato de pesos es el binario intgemm de Bergamot y no safetensors ni GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de las alternativas que figuran a continuacion proceden de conocimiento general sobre el ecosistema NMT y no estan verificados con la informacion proporcionada; se marcan como aproximados o como "no disponible" cuando no hay certeza.

| Modelo | Parametros | Direcciones | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| AbrahamPJ/nightmare-translate | no disponible | ru→en, zh→en | intgemm `.bin` / Bergamot, Marian | MPL-2.0 | Espejo sin modificar de los modelos de Firefox Translations 2.1; optimizado para CPU y movil |
| mozilla/firefox-translations-models | no disponible en esta busqueda | Multiples pares | intgemm `.bin` / Bergamot | MPL-2.0 | Fuente original de los pesos aqui redistribuidos; incluye mas idiomas |
| Helsinki-NLP/opus-mt-ru-en | aprox. 74 M (Marian base, dato aproximado no verificado) | ru→en | safetensors / transformers | CC-BY-4.0 (segun el repositorio original) | Alternativa directa en formato compatible con `transformers`; requiere conversion para movil |
| NLLB-200-distilled-600M | aprox. 600 M (dato aproximado no verificado) | Multilingue | safetensors / transformers | CC-BY-NC-4.0 (uso no comercial en la version distribuida) | Mucha mayor cobertura de idiomas, pero peso y coste de inferencia muy superiores y licencia restrictiva para uso comercial |

## Limitaciones y advertencias

- Cobertura idiomatica muy reducida: unicamente ruso→ingles y chino simplificado→ingles. No hay direccion inversa ni otros pares.
- No es un modelo generativo: no se puede usar para chat, razonamiento, codigo ni tareas de agente.
- Traduccion a nivel de frase: no hay gestion de contexto largo ni coherencia a nivel de documento garantizada por el modelo.
- Formato propietario del runtime: los ficheros `.bin` de intgemm no se cargan directamente con `transformers`, vLLM, llama.cpp ni Ollama; se necesita el stack Bergamot/Marian o una implementacion compatible.
- Repositorio espejo sin soporte: el autor no ha entrenado los modelos y no ofrece garantias; los pesos se copian byte a byte y su integridad depende de la fuente original de Mozilla.
- Adopcion nula en Hugging Face segun los datos disponibles (0 descargas, 0 likes), lo que implica ausencia de validacion por parte de la comunidad en esta ubicacion.
- Calidad dependiente del dominio: los modelos de Firefox Translations estan optimizados para contenido web; el rendimiento puede degradarse en jerga tecnica muy especifica, nombres propios o texto informal.
- Riesgo de alucinacion y de traducciones incorrectas inherente a cualquier sistema NMT, especialmente en frases ambiguas o fuera de dominio; no debe usarse sin revision en contextos legales, medicos o de seguridad.
- Licencia MPL-2.0: permite uso comercial, pero es copyleft a nivel de fichero; las modificaciones sobre los ficheros cubiertos deben publicarse bajo la misma licencia y hay que conservar los avisos correspondientes. Conviene revisar las condiciones que Mozilla aplica a estos modelos antes de redistribuirlos.
- Sesgos: no hay informacion disponible sobre evaluaciones de sesgo en la documentacion proporcionada; los sesgos del corpus de entrenamiento original de Mozilla se heredan sin cambios.
- Dependencia de un runtime externo (Bergamot o Foxlet Translate) cuyo mantenimiento no controla el autor del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AbrahamPJ/nightmare-translate
- Aplicacion que lo utiliza, Nightmare Mobile: https://github.com/AbrahamPaulJ/nightmare-mobile
- Repositorio original de los pesos, Mozilla Firefox Translations Models: https://huggingface.co/mozilla/firefox-translations-models
- Runtime de referencia citado en la model card, Foxlet Translate: https://github.com/yinvoke/foxlet-translate
- Coleccion de origen en Firefox Remote Settings: https://firefox.settings.services.mozilla.com/v1/buckets/main/collections/translations-models
- Proyecto Bergamot: no disponible en los resultados de busqueda proporcionados
- Nota sobre la busqueda web: los resultados devueltos correspondian unicamente a paginas de TikTok y no contenian enlaces tecnicos relevantes sobre el modelo, por lo que no se han incorporado a esta ficha.
