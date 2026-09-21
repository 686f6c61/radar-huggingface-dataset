# ai-ecoverse/kev.js

## Resumen

kev.js es un repositorio de pesos ya convertidos de la familia de modelos de decisión Kev, desarrollada por Jared Palmer. No se trata de un modelo generativo de propósito general, sino de un conjunto de clasificadores pequeños que responden preguntas de tipo sí/no, elección múltiple y valoración, devolviendo probabilidades calibradas. El repositorio, publicado por ai-ecoverse, contiene únicamente la conversión a ONNX lista para ejecutarse en navegador mediante WebGPU y `onnxruntime-web`, a través de la librería `@ai-ecoverse/kev.js`. El autor de la ficha declara explícitamente que el entrenamiento, la evaluación y el diseño del modelo no son suyos.

Los pesos derivan de los checkpoints `jaredpalmer/kev-0.8b` y `jaredpalmer/kev-4b`, construidos a su vez sobre las bases Qwen3.5 de 0,8 B y 4 B de parámetros. Se distribuyen tres paquetes: `kev-0.8b` en variantes `q8f32` (0,82 GB) y `q8` (0,79 GB), y `kev-4b` en variante `q8f32` (4,67 GB). Todos usan pesos int8 con activaciones fp32 y se fragmentan en ficheros de 32 MB para que cualquier CDN o proxy pueda servirlos.

Su relevancia actual es de tipo práctico: permite tomar decisiones estructuradas con probabilidad calibrada íntegramente en el cliente, sin enviar datos a un servidor y sin depender de una API externa. Al ejecutarse sobre WebGPU en el navegador, encaja en aplicaciones web con requisitos de privacidad o de latencia local. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de las bases Qwen3.5 y descrita por el autor original en "Jev's Architecture Unmasked". El export elimina la LM head y conserva una "pointer head" |
| Parametros totales | 0,8 B (paquete `kev-0.8b`) y 4 B (paquete `kev-4b`), segun el identificador del modelo base |
| Parametros activos | No aplica; no se describe una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos int8 con activaciones fp32 (variantes `q8f32` y `q8`); embeddings cuantizados a int8 por fila |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (exportado con onnxruntime-genai model builder), sin LM head, dividido en ficheros de 32 MB con `manifest.json` |

Datos adicionales de distribucion:

| Paquete | Variante | Tamano de descarga | Modelo base | Checkpoint de origen |
|---|---|---|---|---|
| `kev-0.8b` | `q8f32` | 0,82 GB | Qwen/Qwen3.5-0.8B-Base | jaredpalmer/kev-0.8b |
| `kev-0.8b` | `q8` | 0,79 GB | Qwen/Qwen3.5-0.8B-Base | jaredpalmer/kev-0.8b |
| `kev-4b` | `q8f32` | 4,67 GB | Qwen/Qwen3.5-4B-Base | jaredpalmer/kev-4b |

El tamano total del repositorio es de 6,1 GB. El fichero `manifest.json` lista los ficheros, sus tamanos, el tokenizer y la pointer head, ademas de la desviacion medida respecto al modelo original en fp32 PyTorch sobre un conjunto de fixtures.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de dos hechos: los modelos derivan de las bases Qwen3.5 (0,8 B y 4 B) y la arquitectura de la familia Kev esta documentada por el autor original en la entrada "Jev's Architecture Unmasked". No se detallan el numero de capas, el tipo de atencion, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se indica si hubo una fase de ajuste supervisado especifica para la tarea de decision.

Lo que si se documenta es el proceso de conversion: la LoRA se fusiono en fp32 y el modelo se exporto con el model builder de onnxruntime-genai eliminando la LM head y cuantizando los embeddings a int8 por fila. El resultado es un modelo de clasificacion con una cabeza de puntero que responde a preguntas estructuradas con probabilidades calibradas. Las formas de la API siguen las de TypeSafe System One; Jev es el modelo alojado de TypeSafe y no tiene afiliacion con este repositorio.

## Capacidades

- Clasificacion de texto con salida probabilistica: preguntas de tipo si/no, de eleccion multiple y de valoracion, con probabilidades calibradas.
- API `systemOne`, que recibe un estado (texto de entrada) y un conjunto de preguntas con tipo e instrucciones, y devuelve las respuestas.
- Tipos de pregunta documentados en el ejemplo del autor: `noul` (si/no). El resto de tipos disponibles no se detalla en la informacion proporcionada.
- Ejecucion integra en el navegador sobre WebGPU mediante `onnxruntime-web`, sin llamadas a servidor.
- Capacidad de plantear varias preguntas independientes sobre un mismo estado en una sola llamada (por ejemplo, clasificar un ticket por area).
- No dispone de generacion de texto libre: el export elimina la LM head.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket como estado y responde a preguntas binarias o de categoria (facturacion, incidencia tecnica, cancelacion). Al ejecutarse en el cliente, los datos del usuario no salen del navegador.
- Validacion y enrutado de formularios web: clasificar el contenido introducido por el usuario para decidir que campos o flujos adicionales mostrar, con la probabilidad calibrada como umbral de confianza antes de derivar a un humano.
- Moderacion de contenido en primera linea: prefiltrar envios en una aplicacion web para marcar casos dudosos y reducir el volumen que llega a un sistema de revision posterior.
- Encuestas y recogida de preferencias: responder preguntas de tipo valoracion sobre pares de elementos, util para experimentos de evaluacion subjetiva ejecutados en el navegador del participante.
- Asistentes web con enrutado de intenciones: decidir si una consulta del usuario corresponde a una intencion concreta antes de invocar un servicio externo, aprovechando la probabilidad devuelta para escalar cuando no hay claridad.
- Aplicaciones PWA y uso sin conexion: al distribuirse como ficheros estaticos de 32 MB servibles desde cualquier CDN, puede cachearse y ejecutarse de forma local una vez descargado el paquete.
- Clasificacion de correo o mensajes entrantes: etiquetar por categoria con varias preguntas simultaneas sobre el mismo texto, integrable en un cliente de correo o mensajeria.
- Despliegue en entornos con restricciones de privacidad: cualquier flujo donde enviar el texto a una API de terceros no sea aceptable, dado que la inferencia ocurre en el dispositivo del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de calidad mencionado es que `manifest.json` incluye la desviacion medida respecto al modelo original en fp32 PyTorch sobre un conjunto de fixtures, pero los valores numericos no se proporcionan en la informacion consultada.

## Requisitos de hardware

- VRAM estimada para la variante `kev-0.8b`: en torno a 1 GB, partiendo de los 0,79-0,82 GB de pesos int8 mas el espacio de activaciones en fp32. Estimacion derivada del tamano de los ficheros, no un dato publicado por el autor.
- VRAM estimada para la variante `kev-4b`: en torno a 5 GB o mas, partiendo de los 4,67 GB de pesos mas activaciones fp32. Igualmente, estimacion derivada.
- No se publican requisitos oficiales de GPU ni de memoria.
- El destino de despliegue declarado es el navegador con WebGPU, por lo que el recurso limitante es la memoria de la GPU o de la memoria unificada del dispositivo, no una GPU de datacenter.
- GPU de datacenter (A100, H100): no se documenta su uso; son compatibles a nivel de capacidad pero exceden el proposito del export.
- GPU de consumo (RTX 4090 y similares): sobradamente capaces en terminos de memoria para ambas variantes si se usa el runtime de ONNX en escritorio.
- Opciones de despliegue documentadas: `onnxruntime-web` con WebGPU a traves de `@ai-ecoverse/kev.js`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el export carece de LM head, por lo que no es un modelo de generacion desplegable en esos servidores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de modelos alternativos de la misma categoria en la informacion disponible. La comparacion posible se limita a las variantes del propio repositorio y a sus checkpoints de origen:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ai-ecoverse/kev.js `kev-0.8b` | 0,8 B | No disponible | ONNX int8 (q8, q8f32) | Apache-2.0 | HuggingFace, uso en navegador |
| ai-ecoverse/kev.js `kev-4b` | 4 B | No disponible | ONNX int8 (q8f32) | Apache-2.0 | HuggingFace, uso en navegador |
| jaredpalmer/kev-0.8b | 0,8 B | No disponible | Checkpoint original | Apache-2.0 | Repositorio del autor original |
| jaredpalmer/kev-4b | 4 B | No disponible | Checkpoint original | Apache-2.0 | Repositorio del autor original |
| Qwen3.5-0.8B-Base / 4B-Base | 0,8 B / 4 B | No disponible | Pesos base | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas opciones ni frente a modelos de decision de terceros.

## Limitaciones y advertencias

- El repositorio contiene unicamente pesos convertidos. Cualquier problema de sesgo, calidad o comportamiento proviene del modelo de origen; el autor de la conversion lo declara explicitamente.
- No hay informacion sobre sesgos evaluados ni sobre la composicion del dataset de entrenamiento, por lo que no es posible valorar su comportamiento en dominios sensibles.
- Riesgo de alucinacion: no aplica en el sentido generativo (no hay LM head ni generacion de texto libre), pero si existe riesgo de respuestas mal calibradas o incorrectas en preguntas fuera de la distribucion de entrenamiento.
- Longitud de contexto e idiomas soportados no disponibles: no se puede garantizar el comportamiento con entradas largas ni con textos en castellano.
- Los tamanos de descarga (0,79-0,82 GB y 4,67 GB) y la fragmentacion en ficheros de 32 MB implican varias peticiones HTTP y un uso de cache considerable en el navegador.
- Dependencia de WebGPU: el despliegue en navegador esta condicionado al soporte de esta API por parte del navegador y del dispositivo; no se documenta una matriz de compatibilidad.
- Las estimaciones de memoria de la seccion de hardware son deducciones a partir del tamano de los pesos, no cifras oficiales.
- Licencia Apache-2.0 en el repositorio, en los checkpoints de origen y en las bases Qwen3.5, lo que en principio permite uso comercial, pero conviene verificar las condiciones de la libreria `@ai-ecoverse/kev.js` por separado del modelo.
- El modelo Jev alojado por TypeSafe no tiene afiliacion con este repositorio; no debe asumirse equivalencia entre ambos servicios.
- Estado del repositorio: 0 descargas y 0 likes, sin senales de adopcion ni mantenimiento posterior a la actualizacion registrada.

## Enlaces

- HuggingFace: https://huggingface.co/ai-ecoverse/kev.js
- Libreria kev.js (ai-ecoverse): https://github.com/ai-ecoverse/kev.js
- README con detalles de conversion: https://github.com/ai-ecoverse/kev.js#readme
- Modelo y entrenamiento originales (jaredpalmer/kev): https://github.com/jaredpalmer/kev
- Checkpoints de origen: https://huggingface.co/jaredpalmer/kev-0.8b y https://huggingface.co/jaredpalmer/kev-4b
- Bases Qwen3.5: https://huggingface.co/Qwen
- Documentacion de la arquitectura: https://archerhume.com/posts/jevs-architecture-unmasked
- Referencia de las formas de API (TypeSafe System One): https://docs.typesafe.ai/api
