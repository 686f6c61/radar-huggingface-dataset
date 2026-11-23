# PollardWeights/clef-Pollard

## Resumen

clef-Pollard es una cuantizacion GGUF del modelo Cloudflare/clef, publicada por PollardWeights. El modelo base es un modelo de decision multimodal (texto e imagen) de aproximadamente 27.000 millones de parametros con arquitectura propia denominada `clef`, que combina atencion lineal Gated DeltaNet en 48 de sus 64 capas con atencion clasica. A diferencia de un modelo generativo, clef responde preguntas tipadas (eleccion entre opciones, puntuacion o si/no) devolviendo una probabilidad por opcion, y se sirve a traves del endpoint `/v1/systemone` de llama-server en lugar de los endpoints de chat o completions.

PollardWeights aplica una asignacion de bits medida por capa (measured allocation) a partir de un perfil de sensibilidad derivado de una imatrix calculada sobre el corpus Calib 3.0, en lugar de una cuantizacion uniforme. El resultado es una escalera de cuatro cuantizaciones que van de 9,44 GB (IQ2_XXS) a 22,19 GB (Q6_K), frente a los 54,05 GB del modelo en f16, con una reduccion de tamano de hasta el 83 % en el escalon mas agresivo.

La relevancia de esta publicacion es doble: por un lado, permite ejecutar un modelo de 27B en equipos de consumo con 12-24 GB de RAM o VRAM; por otro, introduce una metodologia de evaluacion especifica para modelos de decision (fidelidad de decision frente a Q8_0, divergencia KL por opcion y deriva de probabilidad media) en lugar de las metricas habituales de perplexidad, que no aplican a un modelo que emite probabilidades y no texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `clef` (transformer hibrido con 48 capas de atencion lineal Gated DeltaNet sobre 64 capas totales) |
| Parametros totales | ~27.024.054.788 (~27,0B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS, IQ3_S, IQ4_XS, Q6_K (K-quants estandar con asignacion medida por capa); el modelo base en f16 y Q8_0 se citan como referencia |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal en `mmproj-clef-BF16.gguf` |
| Entrada soportada | texto e imagen |
| Imatrix | si (corpus Calib 3.0, 1937 chunks, calculada sobre copia Q8_0) |
| Cabecera de decision | `dec.*` fijada en Q6_K en todos los escalones |
| Tamano del repo | 62,0 GB |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clef emplea una arquitectura hibrida de 64 capas en la que 48 capas usan atencion lineal Gated DeltaNet y el resto atencion clasica, segun los datos de construccion de la cuantizacion. Es un modelo multimodal con soporte de texto e imagen: el proyector de vision se distribuye por separado como `mmproj-clef-BF16.gguf` y fija `clip.vision.image_min_pixels = 65536`, de modo que las imagenes pequenas reciben el mismo numero de tokens que en el procesador original.

La innovacion principal de esta publicacion no esta en el entrenamiento del modelo base, sino en el proceso de cuantizacion. PollardWeights deriva un perfil de sensibilidad tensor a tensor a partir de la imatrix mediante `pollard-probe --from-imatrix`, cubriendo las 64 capas, y asigna precision de forma no uniforme segun esa sensibilidad. El perfil se publica como `clef-Pollard.sensitivity.json` y la imatrix como `clef-Pollard.imatrix`. La cabecera de decision se mantiene en Q6_K en todos los escalones; el autor verifico que subirla a BF16 en el escalon IQ2_XXS apenas cambia la divergencia KL por opcion (0,00377 frente a 0,00385), por lo que la deriva restante procede del cuerpo del modelo. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Clasificacion y decision estructurada: responde preguntas tipadas de tres clases (`choice` para elegir entre opciones con criterios, `score` para puntuar y `noul`/si-no) devolviendo una probabilidad por opcion.
- Salida estructurada con probabilidades calibradas, apta para enrutamiento, triaje y scoring automatico.
- Procesamiento multimodal de texto e imagen mediante el proyector `mmproj-clef-BF16.gguf` pasado con `--mmproj`.
- Evaluacion de estado conversacional: el campo `state` admite texto libre, como mensajes de cliente, sobre el que se formulan multiples preguntas en una sola llamada.
- Capacidad multilingue limitada al ingles segun la model card.
- No soporta chat ni completions: el modelo se sirve exclusivamente en `/v1/systemone`, por lo que no genera texto libre.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agentico.

## Casos de uso

- Enrutamiento de tickets de soporte: se envia el mensaje del cliente en `state` y una pregunta `choice` con criterios `billing`, `shipping` y `technical`; el modelo devuelve la probabilidad de cada cola y permite asignar el ticket con umbral de confianza configurable.
- Deteccion de urgencia y sentimiento: preguntas `score` para urgencia y `noul` para enfado del cliente sobre el mismo estado, lo que permite priorizar la cola de atencion sin un pipeline separado de NLP.
- Triaje de correo y formularios: clasificacion de mensajes entrantes en categorias predefinidas con probabilidades, util para descartar casos ambiguos y derivarlos a revision humana cuando la opcion ganadora no supera un umbral.
- Moderacion y cumplimiento: preguntas si/no sobre presencia de contenido prohibido o datos sensibles en texto e imagenes, aprovechando la entrada multimodal con el proyector de vision.
- Despliegue en hardware de consumo: el escalon IQ2_XXS (9,44 GB) permite servir el modelo en equipos con unos 11,4 GB de RAM o VRAM, lo que habilita prototipos locales de clasificacion sin GPU de datacenter.
- Evaluacion de calidad de cuantizaciones: el conjunto de escalones y las metricas de fidelidad de decision publicadas sirven como referencia para comparar tecnicas de cuantizacion en modelos que emiten probabilidades en lugar de texto.
- Clasificacion de documentos con imagen: extraccion de decisiones sobre capturas, facturas o formularios escaneados pasando la imagen junto al estado textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la perplexidad no aplica a un modelo de decision y publica en su lugar una tabla de fidelidad de decision frente a Q8_0 sobre 20 preguntas tipadas servidas por `/v1/systemone`:

| Archivo | Tamano | Coincide con Q8_0 | KL por opcion vs Q8_0 | Deriva de probabilidad media | Precision |
|---|---:|---:|---:|---:|---:|
| `clef-Pollard-Q6_K.gguf` | 22,19 GB | 100 % | 2,9e-05 | 0,0003 | 100 % |
| `clef-Pollard-IQ4_XS.gguf` | 16,19 GB | 100 % | 9,5e-05 | 0,0007 | 100 % |
| `clef-Pollard-IQ3_S.gguf` | 13,25 GB | 100 % | 0,00049 | 0,0014 | 100 % |
| `clef-Pollard-IQ2_XXS.gguf` | 9,44 GB | 100 % | 0,0038 | 0,0066 | 100 % |

La referencia Q8_0 se usa porque el f16 de 54 GB no cabe en la maquina de compilacion junto con el contexto de servicio. La metrica que separa los escalones es la divergencia KL por opcion; la coincidencia de opcion elegida se mantiene en el 100 % en todos los escalones.

## Requisitos de hardware

- VRAM/RAM estimada segun escalon: Q6_K requiere unos 24,2 GB, IQ4_XS unos 18,2 GB, IQ3_S unos 15,3 GB e IQ2_XXS unos 11,4 GB, en todos los casos con margen para contexto.
- El escalon IQ2_XXS (9,44 GB) es el unico que encaja con holgura en GPUs de consumo de 12 GB; IQ3_S e IQ4_XS encajan en GPUs de 16-24 GB; Q6_K requiere 24 GB o mas, o bien CPU con RAM suficiente.
- No se especifican modelos concretos de GPU (A100, H100, RTX 4090); la unica referencia es el presupuesto de memoria indicado por el autor.
- Despliegue mediante llama.cpp con una version reciente que incluya la arquitectura `clef`; versiones antiguas rechazan los archivos con `unknown model architecture`. Ollama y LM Studio funcionaran cuando incorporen un runtime con dicha arquitectura.
- Ejemplo de servicio: `llama-server -m clef-Pollard-IQ2_XXS.gguf --mmproj mmproj-clef-BF16.gguf -ngl 99`.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos de decision con salida de probabilidades) ni datos de rendimiento frente a alternativas. Como referencia interna de la propia publicacion, el modelo base Cloudflare/clef en f16 ocupa 54,05 GB y su version Q8_0 unos 28,65 GB, frente a los 9,44-22,19 GB de los escalones Pollard.

## Limitaciones y advertencias

- Modelo solo en ingles; no se declara soporte de otros idiomas.
- No es un modelo generativo: no responde en los endpoints de chat o completions, solo en `/v1/systemone`. Integrarlo en un producto requiere adaptar el cliente a ese contrato.
- La evaluacion de fidelidad se basa en 20 preguntas tipadas, una muestra muy reducida; los valores de KL y deriva de probabilidad no garantizan el mismo comportamiento en dominios distintos.
- El escalon IQ2_XXS presenta una divergencia KL por opcion de 0,0038, dos ordenes de magnitud superior a Q6_K (2,9e-05); en produccion conviene usar el escalon de mayor tamano que permita el presupuesto de memoria.
- La cabecera de decision se mantiene en Q6_K en todos los escalones; el autor documenta que el cuerpo del modelo es la fuente principal de la deriva restante.
- Requiere una version reciente de llama.cpp con soporte de la arquitectura `clef`; no funciona con builds antiguos ni con runtimes que no la hayan incorporado.
- La vision exige descargar y pasar el proyector `mmproj-clef-BF16.gguf`; sin el, la entrada de imagen no esta disponible.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible. Al tratarse de un modelo que emite probabilidades, el riesgo principal es de calibracion (confianza alta en decisiones incorrectas) mas que de texto inventado.
- Licencia Apache 2.0, que permite uso comercial, pero las condiciones del modelo base Cloudflare/clef deben verificarse por separado.
- No se dispone de informacion sobre longitud de contexto, por lo que el tamano maximo de `state` y del numero de preguntas por llamada debe validarse empiricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PollardWeights/clef-Pollard
- Modelo base: https://huggingface.co/Cloudflare/clef
- Repositorio de Pollard Weights: https://github.com/WestWaters/pollard-weights
- Herramienta de evaluacion de decisiones pollard-decision: https://github.com/WestWaters/pollard-weights
