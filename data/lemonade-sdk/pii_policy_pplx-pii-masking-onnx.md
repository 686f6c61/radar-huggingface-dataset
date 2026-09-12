# lemonade-sdk/pii_policy_pplx-pii-masking-onnx

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una politica de enrutado (`collection.router`) en formato JSON para el servidor [Lemonade](https://github.com/lemonade-sdk/lemonade). La politica decide, para cada peticion entrante, si el prompt debe procesarse en un modelo local o enviarse a un modelo en la nube. El criterio de decision es la presencia de informacion personal identificable (PII): si el clasificador detecta cualquier etiqueta de PII por encima de un umbral de 0,5, la peticion se enruta al candidato local (`Qwen3.5-0.8B-GGUF` por defecto); en caso contrario, se envia al candidato en la nube (`fireworks.kimi-k2p6` por defecto).

El clasificador que utiliza es [`lemonade-sdk/pplx-pii-masking-onnx`](https://huggingface.co/lemonade-sdk/pplx-pii-masking-onnx), un modelo ONNX de etiquetado de tokens (token classification) que produce puntuaciones por token, no por prompt. La politica cubre 9 tipos de PII (`private_person`, `private_email`, `private_phone`, `private_address`, `private_url`, `private_date`, `account_number`, `secret` y `other_pii`) mediante 36 etiquetas BIOES no-"O" (variantes B/I/E/S de cada tipo).

Su relevancia es de tipo operativo y de cumplimiento: permite desplegar asistentes basados en LLM en la nube sin exponer datos personales, derivando unicamente las peticiones sensibles a un modelo local pequeno. Es un artefacto de configuracion de 0 descargas y 0 likes en el momento de la consulta, publicado bajo licencia MIT y pensado para descargarse directamente en una instancia de Lemonade en ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable: artefacto de configuracion de enrutado (politica JSON); no contiene pesos de red neuronal |
| Parametros totales | no aplicable (el repositorio no incluye pesos) |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible (la hereda del modelo local y del modelo en la nube configurados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | JSON (`pii_policy_pplx-masking-onnx.json`); no contiene safetensors, GGUF ni ONNX |
| Autor | lemonade-sdk |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-11 |
| Descargas / likes | 0 / 0 |
| Clasificador asociado | lemonade-sdk/pplx-pii-masking-onnx (ONNX, token classification) |
| Etiquetas PII cubiertas | 9 tipos, 36 etiquetas BIOES no-"O" (mas la etiqueta "O") |
| Umbral de decision (`min_score`) | 0,5 (valor por defecto, ajustable) |
| Candidato local por defecto | Qwen3.5-0.8B-GGUF |
| Candidato en la nube por defecto | fireworks.kimi-k2p6 |
| Requisito de servidor | `ort-server` posterior a 0.3.7 |

## Arquitectura y entrenamiento

La politica no entrena ningun modelo. Define un grafo de enrutado con un unico tipo de regla: una condicion `classifier` que evalua una etiqueta cada vez. Como el clasificador mantiene las 37 etiquetas BIOES sin colapsar (`B-private_person`, `I-private_person`, `E-private_person`, `S-private_person`, etc.), la pregunta "se ha detectado PII de cualquier tipo" se expresa como una condicion `any` sobre las cuatro variantes BIOES de los 9 tipos, lo que da las 36 condiciones hoja. El autor explica que la razon de no colapsar las etiquetas es que `ort-server` escribe las puntuaciones por etiqueta mediante asignacion directa indexada por la cadena de la etiqueta: dos indices con el mismo nombre se sobrescribirian silenciosamente.

El clasificador subyacente agrega las puntuaciones de forma distinta a la del checkpoint original: el modelo upstream decodifica spans con un Viterbi restringido a BIOES, mientras que el router aplica softmax por token, toma el maximo sobre los tokens para cada etiqueta y compara con el umbral. Segun la model card, ambos criterios son cercanos en el benchmark Nemotron-PII pero no identicos. La segunda cabeza del clasificador (`sensitivity_logits`) no se consulta en absoluto, y el autor indica que se midio un recall del 9,16 % en ese benchmark, por lo que no debe usarse como senal de enrutado.

## Capacidades

- Clasificacion de PII a nivel de token sobre el prompt entrante, con 36 etiquetas BIOES correspondientes a 9 tipos de datos personales.
- Enrutado condicional por prompt: derivacion al modelo local cuando se supera el umbral `min_score` (0,5 por defecto) y al modelo en la nube en caso contrario.
- Deteccion de datos personales directos: nombres de personas, correo electronico, telefono, direccion postal y URL.
- Deteccion de identificadores y secretos: numeros de cuenta, fechas y cadenas clasificadas como `secret` (por ejemplo, credenciales o claves de API) y `other_pii`.
- Integracion con la API compatible con OpenAI de Lemonade: la politica se invoca como un modelo mas (`"model": "user.PII-ONNX-PplxMasking-Router"`).
- Parametrizacion de candidatos y destinos: `routing.candidates`, `routing.default_model` y `rules[].route_to` son editables.
- No incluye tool calling, agentes, vision, audio, ni generacion de texto propia; esas capacidades pertenecen a los modelos a los que enruta.

## Casos de uso

- Pasarela LLM corporativa con cumplimiento del RGPD: se coloca la politica como punto de entrada y toda peticion que contenga nombres, correos o telefonos se procesa en el modelo local, mientras que las consultas anodinas se resuelven con un modelo en la nube de mayor capacidad. Reduce el riesgo de transferencia de datos personales a terceros sin renunciar a la calidad del modelo grande.
- Asistencia al cliente en banca, seguros o salud: los mensajes de los usuarios contienen con frecuencia DNI, numeros de cuenta o direcciones; el enrutado local evita que ese contenido salga de la infraestructura propia durante la fase de clasificacion y respuesta.
- Copilotos de codigo con fuga de secretos: fragmentos de codigo con claves de API o cadenas de conexion se detectan mediante la etiqueta `secret` y se derivan al modelo local, mientras que las preguntas genericas de programacion van al modelo en la nube.
- Despliegue en el puesto de trabajo o en el borde: al apoyarse en un candidato local de 0,8B en formato GGUF, la politica puede ejecutarse en un portatil o en un equipo sin GPU dedicada, con el modelo en la nube reservado para las consultas no sensibles.
- Investigacion clinica o cientifica con datos de pacientes: permite usar un asistente en la nube para tareas metodologicas o bibliograficas y mantener las descripciones de casos concretos en local.
- Auditoria y trazabilidad del tratamiento de datos: al centralizar la decision de enrutado en un unico punto, es posible registrar que proporcion de peticiones se ha derivado por contener PII y ajustar el umbral `min_score` en funcion de la tolerancia al riesgo.
- Despliegue de demos publicas: limita el coste de inferencia en la nube al enviar solo trafico no sensible, manteniendo las conversaciones con datos personales en un modelo local de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un comentario pendiente de rellenar (`TODO`) que indica que la puntuacion de fuga (`leak rate`) sobre el benchmark Nemotron-PII (20.000 prompts con PII, 20.001 en total) aun no estaba disponible cuando se publico el repositorio. El unico dato numerico publicado es el recall del 9,16 % de la cabeza `sensitivity_logits` en ese benchmark, que el autor descarta como senal de enrutado.

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| Nemotron-PII (20.001 prompts, 20.000 con PII) | Leak rate | no disponible | Marcador `X.XX%` sin completar en la model card |
| Nemotron-PII | Recall de `sensitivity_logits` | 9,16 % | Cabeza no usada por la politica |

## Requisitos de hardware

- El repositorio en si no requiere hardware: es un fichero JSON de configuracion que se carga en un servidor Lemonade.
- Requiere una build de `ort-server` posterior a la 0.3.7 para ejecutar el backend `onnxruntime` con modelos de token classification.
- El clasificador ONNX de PII es ligero y esta pensado para ejecutarse en CPU; no se especifican cifras de VRAM en la informacion disponible.
- El candidato local por defecto (`Qwen3.5-0.8B-GGUF`) es un modelo de 0,8B de parametros en formato GGUF: por su tamano, es esperable que quepa en GPU de consumo e incluso que se ejecute solo en CPU, aunque no se publican estimaciones de VRAM, latencia ni throughput.
- El candidato en la nube (`fireworks.kimi-k2p6`) se ejecuta en la infraestructura de Fireworks y requiere credenciales y conectividad externa.
- Opciones de despliegue documentadas: servidor Lemonade con backend `onnxruntime`, invocado mediante la API compatible con OpenAI en `http://localhost:13305/v1/`. El modelo local se sirve en formato GGUF.
- No se dispone de datos de latencia ni de throughput para la politica ni para el clasificador.

## Comparativa con modelos similares

No hay cifras publicadas que permitan una comparacion cuantitativa. La comparacion siguiente es cualitativa y se limita a alternativas conocidas de la misma categoria funcional (deteccion de PII y enrutado condicional); los datos marcados como "no disponible" no aparecen en la informacion proporcionada.

| Alternativa | Enfoque | Licencia | Integracion | Datos comparables |
|---|---|---|---|---|
| lemonade-sdk/pii_policy_pplx-pii-masking-onnx | Politica de enrutado JSON sobre clasificador ONNX de token classification | MIT | Servidor Lemonade (`ort-server` > 0.3.7) | Leak rate no publicado |
| Microsoft Presidio | Deteccion de PII basada en reglas, expresiones regulares y NER (spaCy/transformers) | MIT | Libreria Python, sin enrutado integrado | No disponible |
| GLiNER (familia de modelos NER zero-shot) | NER zero-shot basado en transformer encoder | MIT (segun variante) | Libreria Python, requiere envoltorio propio para enrutar | No disponible |
| Routers de pasarela LLM (por ejemplo, LiteLLM o Portkey) | Enrutado por reglas, coste o proveedor | Varía segun producto | Servicio de pasarela | No disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos: descargarlo no proporciona ningun modelo. Es unicamente la configuracion de enrutado; el clasificador y los modelos candidatos se descargan por separado.
- La model card advierte explicitamente de que esta politica no equivale a `model.predict()` del checkpoint: el router usa softmax por token, maximo por etiqueta y umbral, mientras que el modelo original usa decodificacion Viterbi restringida a BIOES. Los dos criterios son cercanos pero no identicos.
- El corpus de evaluacion (Nemotron-PII) no incluye un brazo de prompts benignos, por lo que no es posible medir la tasa de enrutado excesivo al modelo local (falsos positivos). Bajar `min_score` reduce fugas a costa de derivar mas trafico al modelo local, sin que exista una metrica publicada de ese coste.
- Los resultados de fuga (`leak rate`) estan pendientes de publicacion en la propia model card, por lo que no hay evidencia publicada sobre la eficacia real de la politica.
- La cabeza `sensitivity_logits` del clasificador no se consulta y presenta un recall medido del 9,16 %; no debe usarse como senal de enrutado.
- La politica no debe editarse a mano si cambian el umbral o los candidatos: el autor recomienda regenerarla, dado que el emparejamiento de las 36 condiciones hoja con las etiquetas BIOES es fragil.
- El fichero depende de un comportamiento concreto de `ort-server` (asignacion de puntuaciones por nombre de etiqueta); versiones distintas a las indicadas pueden invalidar el comportamiento.
- La politica delega en un modelo local de 0,8B la respuesta a los prompts sensibles: la calidad, el contexto y las capacidades de esas respuestas seran las del modelo local, no las del modelo en la nube.
- No se especifican idiomas soportados; la deteccion de PII depende enteramente del clasificador subyacente, cuyo comportamiento multilingue no esta documentado en la informacion disponible.
- La licencia MIT del repositorio cubre la configuracion; las licencias de los modelos candidatos (local y en la nube) y las condiciones de uso de Fireworks son independientes y deben verificarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lemonade-sdk/pii_policy_pplx-pii-masking-onnx
- Clasificador de PII asociado: https://huggingface.co/lemonade-sdk/pplx-pii-masking-onnx
- Repositorio Lemonade: https://github.com/lemonade-sdk/lemonade
- Servidor ONNX (`ort-server`): https://github.com/lemonade-sdk/ort-server
- Skill para construir politicas de enrutado (`lemonade-router-builder`): https://github.com/amd/skills/tree/main/skills/lemonade-router-builder
- Benchmark Nemotron-PII: no se proporciona enlace en la informacion disponible

Nota: las busquedas web realizadas devolvieron unicamente resultados de la empresa aseguradora Lemonade y de un juego homonimo, sin relacion con el proyecto lemonade-sdk ni con este artefacto, por lo que no se han incluido.
