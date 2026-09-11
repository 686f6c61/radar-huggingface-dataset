# Justik4/Qwen3.5-4B-OBLITERATED

## Resumen

Qwen3.5-4B-OBLITERATED es un derivado del modelo base Qwen/Qwen3.5-4B publicado por el usuario Justik4 en HuggingFace. No se trata de un entrenamiento con datos nuevos, sino de una intervencion sobre los pesos y las activaciones del modelo original mediante la tecnica conocida como abliteration (eliminacion de la direccion de rechazo en el espacio de activaciones). El objetivo declarado es suprimir el comportamiento de negativa a responder, de modo que el modelo conteste a peticiones que el checkpoint original rechazaria.

El repositorio ocupa 8,4 GB y contiene 4.205.751.296 parametros en formato safetensors, cifra coherente con un modelo denso de unos 4,2 mil millones de parametros almacenado en bf16 o fp16 (2 bytes por parametro). El autor indica que la intervencion se hizo con la herramienta OBLITERATUS, de elder-plinius, usando el metodo etiquetado como "advanced". La model card no aporta informacion sobre arquitectura interna, longitud de contexto, composicion del dataset ni proceso de alineamiento, por lo que esos datos solo pueden inferirse del modelo base.

Su relevancia es doble: por un lado, ilustra el flujo de trabajo habitual del ecosistema de modelos "sin censura" construidos a partir de pesos abiertos; por otro, es un caso util para estudiar las implicaciones de seguridad, licencia y cumplimiento que conlleva desplegar en produccion un modelo cuyas salvaguardas han sido eliminadas de forma deliberada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible con detalle; el tag del repositorio es qwen3_5_text, lo que apunta a la familia de transformers de texto de Qwen3.5 |
| Parametros totales | 4.205.751.296 (aprox. 4,2 mil millones) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan versiones GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 8,4 GB, compatible con bf16/fp16) |
| Modelo base | Qwen/Qwen3.5-4B |
| Metodo de modificacion | abliteration, variante "advanced" mediante OBLITERATUS |
| Autor | Justik4 |
| Descargas / likes | 0 descargas, 1 like |
| Fecha declarada de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura mas alla del tag qwen3_5_text, que situa el modelo en la familia de transformers decoder-only de texto de Qwen3.5. No se publican datos sobre el numero de capas, dimensiones ocultas, cabezas de atencion, tipo de atencion (completa, lineal o hibrida), vocabulario ni longitud de contexto. Tampoco se documenta ningun entrenamiento adicional: el modelo se presenta como una transformacion del checkpoint Qwen/Qwen3.5-4B, no como un fine-tuning sobre un dataset nuevo, por lo que no hay informacion sobre tokens de entrenamiento, composicion del corpus, RLHF, DPO ni ninguna otra fase de alineamiento.

La innovacion tecnica es la propia abliteration. En su formulacion habitual, esta tecnica estima una direccion de rechazo en el espacio de activaciones a partir de pares de prompts maliciosos y benignos, y despues proyecta los pesos o las activaciones para eliminar esa direccion, buscando que el modelo deje de activar el comportamiento de negativa sin reentrenar. El autor indica el metodo "advanced" de OBLITERATUS, pero no se detalla en que se diferencia de la variante estandar, que capas se intervinieron, que hiperparametros se usaron ni si hubo verificacion posterior de que las capacidades del modelo base se conservan, de modo que el procedimiento no es reproducible con la informacion disponible.

## Capacidades

- Generacion de texto en ingles a partir de un unico checkpoint de 4,2 mil millones de parametros.
- Respuesta a peticiones que el modelo base rechazaria, al haberse eliminado la direccion de rechazo mediante abliteration.
- Se asume que conserva las capacidades del modelo base Qwen3.5-4B (razonamiento, codigo, matematicas, instrucciones), pero no hay ninguna evaluacion publicada que lo confirme.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se documenta plantilla de chat ni formato de mensajes.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponible; el tag qwen3_5_text sugiere un modelo exclusivamente de texto.
- Fine-tuning posterior: al publicarse pesos completos en safetensors, es tecnicamente possible aplicar LoRA o QLoRA sobre este checkpoint.

## Casos de uso

- Investigacion sobre seguridad de modelos: comparar las respuestas de este checkpoint con las del Qwen3.5-4B original ante el mismo conjunto de prompts permite medir de forma cuantitativa cuanto cambia la tasa de rechazo tras la abliteration y si se degrada la calidad de las respuestas.
- Red teaming y evaluacion de clasificadores: usar el modelo como generador adversarial en ingles para poner a prueba filtros de contenido, moderadores automaticos o clasificadores de toxicidad, midiendo su tasa de falsos negativos.
- Generacion de datos sinteticos para entrenar moderacion: producir pares de ejemplos con y sin rechazo para entrenar o calibrar clasificadores de contenido y sistemas de deteccion de prompts daninos, siempre en un entorno controlado y auditado.
- Escritura creativa sin restricciones editoriales: narrativa, guiones o dialogos con tematicas adultas o controvertidas, donde el equipo aplica despues su propio filtro editorial en lugar de depender del filtro del modelo.
- Despliegue local en una GPU de consumo: con 4,2 mil millones de parametros cabe en tarjetas de 8 GB o 12 GB, lo que permite prototipos en ingles sin depender de APIs externas ni enviar datos a terceros.
- Simulacion de personajes y roleplay multi-turno: al no bloquear respuestas por contenido sensible, es util para construir bots de rol con personalidades complejas, asumiendo moderacion propia en la capa de aplicacion.
- Experimentos de interpretabilidad: al existir un checkpoint intervenido y su base original, permite estudiar como la proyeccion de la direccion de rechazo afecta a las representaciones internas capa por capa.
- Ajuste fino de dominio sobre un modelo sin rechazos: aplicar LoRA para tareas en ingles (atencion al cliente, generacion de codigo interno, analisis de documentos) cuando el equipo quiere partir de un modelo que no bloquee peticiones legitimas de su dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni comparaciones con el modelo base Qwen/Qwen3.5-4B. Tampoco se documenta la tasa de rechazo antes y despues de la abliteration, que seria la metrica mas relevante para este tipo de intervencion.

## Requisitos de hardware

- VRAM en bf16/fp16: los pesos ocupan 8,4 GB, por lo que se necesitan aproximadamente 10-12 GB de VRAM para inferencia comoda contando cache KV y activaciones.
- VRAM con cuantizacion: en int8 rondaria los 4,5-5 GB y en 4 bits los 2,5-3 GB, pero estas cuantizaciones no se publican en el repositorio y habria que generarlas localmente.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4080, RTX 4090. En tarjetas de 8 GB es viable solo con cuantizacion de 8 o 4 bits.
- GPU de datacenter: L4, A10G, A100, H100 y similares; para 4,2 mil millones de parametros estas GPU quedan muy sobredimensionadas salvo que se busque mucho throughput en lote.
- Opciones de despliegue: transformers (es el ejemplo que da la model card), vLLM, TGI o SGLang para los pesos safetensors. Para llama.cpp u Ollama es necesario convertir previamente los pesos a GGUF, ya que no se publica ninguna version GGUF oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Salvaguardas | Disponibilidad |
|---|---|---|---|---|---|
| Justik4/Qwen3.5-4B-OBLITERATED | 4,2 mil millones | no disponible | no disponible | eliminadas por abliteration | 0 descargas, 1 like |
| Qwen/Qwen3.5-4B (base) | 4,2 mil millones (el derivado conserva el recuento de parametros) | no disponible | no disponible en la informacion proporcionada | intactas | modelo de referencia publicado por Qwen |
| Otros derivados abliterados de la familia Qwen | no disponible | no disponible | no disponible | eliminadas | no disponible |

No se dispone de datos de benchmarks ni de contexto que permitan una comparacion cuantitativa con alternativas de la misma categoria, y la busqueda web realizada no devolvio ninguna fuente tecnica util sobre este modelo.

## Limitaciones y advertencias

- La licencia no esta declarada en la model card ni en los metadatos del repositorio, lo que impide confirmar si el uso comercial esta permitido; ademas, las condiciones del modelo base Qwen/Qwen3.5-4B siguen aplicando.
- La abliteration elimina deliberadamente el mecanismo de rechazo, por lo que el modelo puede producir contenido danino, ilegal, discriminatorio o inseguro sin ninguna advertencia. La responsabilidad de moderacion recae integramente en quien lo despliega.
- No hay evidencia publicada de que las capacidades del modelo base se mantengan tras la intervencion; la modificacion de activaciones suele degradar coherencia, utilidad o conocimiento factual en grados variables.
- Riesgo de alucinacion no medido: no se publican evaluaciones de veracidad y se desconoce el efecto de la abliteration sobre la tendencia a inventar datos.
- Idiomas: unicamente ingles segun el campo language; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Longitud de contexto desconocida, lo que impide planificar cargas con documentos largos o conversaciones extensas.
- Sin validacion comunitaria: 0 descargas y 1 like en el momento de la consulta, por lo que no existe retroalimentacion de terceros sobre calidad o estabilidad.
- El metodo "advanced" de OBLITERATUS no se documenta (capas intervenidas, hiperparametros, criterio de exito), lo que hace el resultado no reproducible.
- La fecha de creacion declarada (2026-09-11) es inconsistente y conviene verificarla antes de citar el modelo.
- No se documentan sesgos especificos, pero al derivar de un modelo entrenado con corpus web en ingles hereda los sesgos del base y la abliteration no los corrige.
- No apto para produccion sin una capa propia de moderacion, evaluacion de calidad y revision legal de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Justik4/Qwen3.5-4B-OBLITERATED
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun enlace relevante sobre el modelo; los resultados obtenidos correspondian a sitios del juego de cartas Burraco (burracoon.it, burracopiu.spaghetti-interactive.it, burraco.com, it.wikipedia.org/wiki/Burraco) y no guardan relacion con este lanzamiento.
