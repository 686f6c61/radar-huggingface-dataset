# FluidInference/gliner2-5-small-coreml

## Resumen

FluidInference/gliner2-5-small-coreml es una conversión a Core ML de la ruta de decisión de clasificación de Fastino's GLiNER2.5 small (revisión fuente `7e6f537f10337497069276892a5ef435028252ce`). El modelo original cuenta con 73.881.879 parámetros y licencia Apache-2.0; esta exportación incluye el codificador y la cabeza de clasificación entrenada, con 70.944.385 parámetros, y deja fuera las cabezas de extracción de entidades, relaciones, registros, conteo y spans. El paquete está pensado para ejecutarse en Apple Silicon, incluyendo Neural Engine, mediante coremltools.

El problema que resuelve es la clasificación de texto en el propio dispositivo: dado un texto y hasta ocho etiquetas, el modelo devuelve una etiqueta elegida, una confianza y las probabilidades asociadas, con el renderizado nativo del esquema GLiNER2. El paquete FP16 L128/K8 ocupa 151.542.752 bytes e incluye los ficheros del tokenizador, además de `preprocessing.py` y `runtime.py` para construir la petición sin cargar los pesos del modelo original en inferencia.

Su relevancia práctica es que permite integrar clasificación de texto en aplicaciones iOS 17 o macOS 14 o superiores sin enviar datos a un servidor. La validación publicada en Apple M5 Pro con macOS 27.0 reporta coincidencia en la etiqueta elegida en las 100 peticiones elegibles evaluadas, con una diferencia máxima de confianza de 0,001723 y una mediana de 7,72 ms por llamada a `MLModel.predict` (incluyendo despacho Python/Core ML, no una medida exclusiva de ANE).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador tipo transformer (la conversion congela dos expresiones de atencion DeBERTa) con cabeza de clasificacion entrenada; esquema GLiNER2 |
| Parametros totales | 70.944.385 en esta exportacion (modelo original: 73.881.879) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; el paquete FP16 se designa como bucket L128/K8 (hasta ocho etiquetas de clasificacion) |
| Tipos de cuantizacion | FP16 (paquete recomendado, 151.542.752 bytes) y LUT8 por tensor experimental (76.211.068 bytes); LUT8 por canales agrupados requiere Core ML de iOS 18 o superior y no ha sido evaluado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Paquete Core ML (.mlpackage) generado con coremltools, con ficheros de tokenizador incluidos; tamano de repositorio 0,2 GB |

## Arquitectura y entrenamiento

La exportacion conserva el codificador del modelo original y su cabeza de clasificacion entrenada, y descarta las cabezas de entidades, relaciones, registros, conteo y spans. El esquema de entrada sigue el renderizado nativo de GLiNER2, de modo que las etiquetas se suministran junto con el texto y el modelo devuelve etiqueta, confianza y probabilidades. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO para el modelo original.

El proceso de conversion incorpora dos decisiones tecnicas destacables: el exportador congela dos expresiones de atencion estaticas de DeBERTa para hacerlas compatibles con Core ML y utiliza un centinela de mascara FP16 finito. Estas reescrituras estan cubiertas por pruebas sobre el modelo real y por comprobaciones de paridad entre el modelo nativo y el de Core ML. El paquete admite hasta ocho etiquetas de clasificacion y las entradas que superan la capacidad del bucket requieren un bucket de mayor tamano, sin que el runtime deba truncarlas.

## Capacidades

- Clasificacion de texto: asigna una etiqueta de entre un maximo de ocho opciones, con etiqueta elegida, confianza y vector de probabilidades.
- Renderizado nativo del esquema GLiNER2, lo que permite formular las etiquetas segun la convencion del modelo original.
- Ejecucion en el propio dispositivo sobre Core ML, con destino iOS 17 o macOS 14 como minimo.
- Aceleracion en Apple Silicon, con etiqueta de Neural Engine en el repositorio.
- Inclusión del tokenizador en el repositorio, lo que permite construir la peticion sin dependencias externas de tokenizacion.
- Ruta de inferencia en Python mediante `runtime.py` y `preprocessing.py`, sin cargar los pesos originales del modelo.
- No incluye extraccion de entidades, relaciones, registros, conteo ni spans; para esas tareas hay que usar el checkpoint original.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Clasificacion de tickets de soporte en una aplicacion iOS: el modelo recibe el asunto y el cuerpo del ticket y lo asigna a una de hasta ocho categorias (por ejemplo, facturacion, incidencias tecnicas, cancelaciones), ejecutandose en el dispositivo y evitando enviar el contenido del cliente a un servidor.
- Moderacion de contenido en aplicaciones de mensajeria: clasificacion local de mensajes entrantes en categorias de riesgo antes de decidir si se requiere revision adicional, con la ventaja de que el texto sensible no abandona el dispositivo.
- Enrutado de intenciones en asistentes de voz y aplicaciones de dictado: con una mediana de 7,72 ms por llamada medida en M5 Pro, la clasificacion se puede ejecutar en el bucle de interaccion sin introducir latencia perceptible.
- Organizacion automatica de notas y correo en aplicaciones de productividad para macOS: etiquetado de elementos por tematica o accion requerida, con hasta ocho clases configurables por el desarrollador segun el flujo de trabajo.
- Analisis de resenas y encuestas por aspectos: clasificacion de cada resena en categorias como envio, calidad del producto o atencion, con las probabilidades por clase disponibles para ponderar resultados agregados.
- Triaje de documentacion legal o sanitaria: clasificacion preliminar de expedientes por materia en entornos donde la confidencialidad impide el procesamiento en nube, aprovechando el empaquetado Core ML y el tokenizador incluido.
- Filtrado previo en pipelines de anotacion de campo: aplicaciones en iPhone o iPad sin conectividad que clasifican registros sobre el terreno y sincronizan despues solo los resultados, reduciendo el volumen de datos transferidos.
- Verificacion de paridad en CI sobre macOS: uso de `runtime.py` y los scripts de verificacion incluidos para comprobar que una reconversion o un cambio de bucket mantiene la etiqueta elegida respecto al modelo nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio unicamente documenta una validacion de paridad numerica entre el clasificador nativo y la conversion Core ML, que se resume a continuacion.

| Metrica de validacion | Resultado |
|---|---|
| Entorno | Apple M5 Pro, macOS 27.0 |
| Peticiones elegibles evaluadas | 100, seleccionadas en orden de origen de una suite de aplicaciones fija |
| Coincidencia en etiqueta elegida (FP16) | 100 de 100 |
| Diferencia maxima de confianza en la etiqueta elegida (FP16) | 0,001723 |
| Mediana de tiempo de `MLModel.predict` (FP16, incluye despacho Python/Core ML) | 7,72 ms |
| Filas descartadas antes de reunir 100 filas elegibles | 300 con mas de ocho opciones y 7 con longitud excesiva |
| Paquete LUT8 por tensor experimental | 76.211.068 bytes; coincidencia en las 100 etiquetas elegidas, diferencia maxima de confianza 0,07859 |
| Alcance de la validacion | El propio autor indica que la prueba de humo no establece un Decision Index ni una precision de aplicacion mas amplia |

## Requisitos de hardware

- Memoria: el paquete FP16 ocupa 151.542.752 bytes y el LUT8 por tensor 76.211.068 bytes; a esa cifra hay que sumar activaciones y buffers del runtime, no cuantificados en la informacion disponible.
- Plataforma objetivo: Core ML con destino iOS 17 o macOS 14 como minimo; el LUT8 por canales agrupados exigiria iOS 18 o superior y no ha sido evaluado.
- Hardware recomendado: dispositivos Apple Silicon con Neural Engine, dado que el repositorio incluye la etiqueta `apple-silicon` y `neural-engine`. La validacion publicada se realizo en un Apple M5 Pro.
- GPU de clase servidor (A100, H100, RTX 4090): no aplica a este paquete, ya que es un artefacto Core ML y no incluye pesos en safetensors ni GGUF.
- Ejecucion en GPU de consumo: no procede en el formato entregado; el consumo en hardware Apple no se detalla mas alla de la latencia medida.
- Opciones de despliegue: Core ML mediante coremltools, con `runtime.py` y `preprocessing.py` incluidos. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con este formato.
- Latencia: mediana de 7,72 ms por llamada a `MLModel.predict` en Apple M5 Pro con macOS 27.0, incluyendo el despacho Python/Core ML y sin ser una medida exclusiva de ANE. No hay datos de throughput.
- Requisito de ejecucion: el runtime necesita macOS para ejecutar la prediccion de Core ML.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FluidInference/gliner2-5-small-coreml | 70.944.385 en la exportacion (original: 73.881.879) | Bucket L128/K8; contexto explicito no disponible | Paquete Core ML con tokenizador | Apache-2.0 | Repositorio HuggingFace con 0 descargas y 0 valoraciones en el momento de la consulta |
| fastino/gliner2.5-small-v1 (modelo original) | 73.881.879 | no disponible | Pesos originales (no se detalla el formato) | Apache-2.0 | Checkpoint de referencia del que deriva esta conversion |
| Otras conversiones Core ML comparables | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de alternativas equivalentes en la informacion disponible |

La diferencia principal entre ambas entradas es funcional: la exportacion Core ML solo conserva la ruta de clasificacion, mientras que el checkpoint original permite ademas extraccion de entidades, relaciones, registros, conteo y spans.

## Limitaciones y advertencias

- Cobertura funcional reducida: las cabezas de entidades, relaciones, registros, conteo y spans no estan incluidas; para esas tareas es obligatorio usar el checkpoint original.
- Limite de etiquetas: admite como maximo ocho etiquetas de clasificacion por peticion. En la validacion se descartaron 300 filas con mas de ocho opciones.
- Gestion del bucket: las entradas que superan la capacidad del bucket requieren un bucket mayor y el runtime no debe truncarlas; truncar silenciosamente produciria resultados incorrectos.
- Degradacion por cuantizacion: el paquete LUT8 por tensor experimental mantiene las 100 etiquetas elegidas pero eleva la diferencia maxima de confianza a 0,07859, por lo que el autor no lo recomienda como artefacto de paridad.
- Dependencia de plataforma: el runtime requiere macOS para ejecutar la prediccion de Core ML, lo que limita su uso en servidores Linux o Windows.
- Idiomas: no se declara ninguna lista de idiomas soportados en la informacion disponible.
- Sesgos y alucinacion: no se documentan sesgos conocidos ni tasas de error especificas; al ser un modelo de clasificacion, el riesgo principal es la asignacion incorrecta de etiqueta con confianza alta, y la validacion publicada no establece precision en aplicaciones reales.
- Ausencia de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni de tareas de extraccion que permitan comparar el rendimiento con alternativas.
- Adopcion: el repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no existe evidencia de uso en produccion por terceros.
- Licencia: Apache-2.0, permisiva para uso comercial, pero el credito del modelo original corresponde a Fastino y la conversion a Fluid Inference segun la propia model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FluidInference/gliner2-5-small-coreml
- Modelo original: https://huggingface.co/fastino/gliner2.5-small-v1
- Busqueda web: los resultados devueltos corresponden unicamente a paginas de Microsoft (microsoft.com, account.microsoft.com, myaccount.microsoft.com, outlook.office.com, microsoft.com/microsoft-365) sin relacion con el modelo; no se han encontrado enlaces adicionales relevantes (papers, blogs, repos o demos) en la informacion disponible.
