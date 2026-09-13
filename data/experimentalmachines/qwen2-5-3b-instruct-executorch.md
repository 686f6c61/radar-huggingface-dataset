# experimentalmachines/Qwen2.5-3B-Instruct-ExecuTorch

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino un conjunto de exportaciones a ExecuTorch de Qwen/Qwen2.5-3B-Instruct (revision `aa8e72537993`), publicadas por el usuario experimentalmachines para ejecucion en dispositivo (on-device) sobre Android y cualquier runtime ExecuTorch 1.4.0. El objetivo es claro: convertir un modelo de 3.000 millones de parametros en artefactos `.pte` cuantizados que quepan en la memoria de un telefono moderno, sin depender de servidores ni de conexion de red. Se distribuyen cuatro ficheros XNNPACK para CPU arm64, uno por cada ventana de contexto (2k, 4k, 8k y 16k tokens), con un peso de entre 2,05 GB y 2,08 GB cada uno.

La relevancia practica esta en el formato: la ventana de contexto esta fijada dentro de cada fichero, porque el runtime reserva la cache KV completa en el momento de la carga. Eso obliga a elegir de antemano el compromiso entre contexto disponible y memoria consumida, con un coste de 73.728 bytes por token en fp32 (150,99 MB para 2.048 tokens y 1,21 GB para 16.384 tokens). El autor incluye en cada carpeta un `config.json` con un campo `fits_phone_budget` que estima el encaje contra un presupuesto de 5 GB.

El modelo subyacente es un transformer decoder-only de la familia Qwen2.5 en su variante Instruct, con licencia qwen-research. El repo acumula 0 descargas y 0 likes en el momento de la consulta, y la busqueda web realizada no devolvio ningun material relacionado con el modelo (los resultados obtenidos eran irrelevantes). Todos los datos de rendimiento mas alla del smoke test incluido estan, por tanto, sin publicar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-3B-Instruct); artefacto de despliegue exportado con ExecuTorch 1.4.0 `export_llm` |
| Parametros totales | 3.000 millones nominales (segun el nombre del modelo base); desglose exacto no disponible |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | 2.048, 4.096, 8.192 o 16.384 tokens, fijada en cada fichero `.pte`. La model card indica que se exporto de 2k a 32k, pero solo se tabulan ficheros hasta 16k |
| Tipos de cuantizacion | 8da4w: activaciones int8 dinamicas, pesos de 4 bits en grupos de 32, embeddings int8 per-channel |
| Idiomas soportados | No disponible en la informacion proporcionada (heredado del modelo base) |
| Licencia | qwen-research (licencia de investigacion, derivada de Qwen/Qwen2.5-3B-Instruct) |
| Formato de pesos | `.pte` (ExecuTorch); tokenizer en `tokenizer.json` copiado sin cambios del repo original |
| Backend | XNNPACK con operadores extendidos, CPU arm64 |
| Tamano del repo | 8,3 GB |
| Tamano por fichero | 2,05 GB (2k), 2,06 GB (4k), 2,07 GB (8k), 2,08 GB (16k) |
| Cache KV | fp32, 73.728 bytes por token, reservada completa al cargar |
| Chunk de prefill | 2.048 |
| Libreria | executorch |

## Arquitectura y entrenamiento

El repositorio no documenta entrenamiento alguno: es una exportacion cuantizada, relacionada con el modelo base mediante `base_model_relation: quantized`. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni fases de RLHF o DPO, porque ese detalle pertenece a la model card original de Qwen2.5-3B-Instruct y no se reproduce aqui. Todos esos datos deben considerarse "no disponibles" en el material proporcionado.

La innovacion tecnica relevante esta en el pipeline de exportacion. Se uso la herramienta `export_llm` de ExecuTorch 1.4.0 con cuantizacion 8da4w (activaciones de 8 bits dinamicas y pesos de 4 bits agrupados de 32 en 32), embeddings int8 per-channel, backend XNNPACK con operadores extendidos, chunk de prefill de 2.048 tokens y cache KV en fp32. La consecuencia arquitectonica mas importante es que la ventana de contexto queda congelada en el grafo: no es un parametro ajustable en tiempo de ejecucion, sino una decision de compilacion. El tokenizador se copia sin modificar desde el repositorio fuente, lo que garantiza compatibilidad exacta de vocabulario con Qwen2.5-3B-Instruct. Cada fichero va acompanado de un `export-report-<ventana>.json` con el registro completo de la exportacion y de un `config.json` con los metadatos que reporta el propio `.pte`.

## Capacidades

- Generacion de texto conversacional en ingles y otros idiomas del modelo base, aunque la lista concreta de idiomas no consta en la informacion disponible.
- Instrucciones y formato de chat: al ser la variante Instruct del modelo base, conserva el comportamiento de asistente, modulado por la cuantizacion de 4 bits.
- Inferencia completamente local y offline en dispositivos Android arm64, sin llamadas a red.
- Integracion con la aplicacion Android openweights o con cualquier runtime ExecuTorch 1.4.0 que acepte ficheros `.pte`.
- Seleccion de ventana de contexto en tiempo de despliegue: se elige el fichero de 2k, 4k, 8k o 16k segun la memoria disponible en el dispositivo.
- Capacidades multivariante por backend: todos los ficheros comparten el mismo backend XNNPACK, por lo que el comportamiento funcional es equivalente y solo cambia el presupuesto de memoria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo de pensamiento explicito: no disponibles; el pipeline declarado es unicamente `text-generation`.

## Casos de uso

- Asistentes conversacionales offline en Android: el fichero de 4k (2,06 GB) permite mantener un historial de conversacion de varios turnos sin conexion, con coste de memoria acotado y predecible.
- Clasificacion y extraccion de informacion en campo: aplicaciones de inspeccion, reparto o trabajo de campo donde no hay cobertura; el modelo local puede resumir notas o extraer campos estructurados de texto dictado.
- Resumen de documentos cortos en el propio dispositivo: con la variante de 8k se pueden procesar articulos o informes de varias paginas sin enviar datos a un tercero, lo que simplifica el cumplimiento de normativa de privacidad.
- Procesamiento de datos sensibles sujetos a RGPD: al no salir la informacion del terminal, se elimina la transferencia a servidores externos y se reduce la superficie de riesgo en el tratamiento de datos personales.
- Prototipado e investigacion en IA on-device: el repositorio sirve como referencia reproducible de un pipeline `export_llm` completo, con informes de exportacion y metadatos por ventana, util para comparar configuraciones de cuantizacion.
- Aplicaciones educativas o de accesibilidad sin coste de inferencia recurrente: el modelo se ejecuta con recursos del propio dispositivo, lo que evita facturas por token y funciona en entornos con conectividad intermitente.
- Demos y pruebas de concepto de LLM embebido: el smoke test incluido (respuesta "Paris") permite verificar rapidamente que el runtime y el fichero `.pte` cargan correctamente antes de integrar en una aplicacion mayor.
- No se recomienda su uso como backend de servidor: para eso existe el modelo original en safetensors, con mayor precision y contexto configurable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de validacion aportado es un smoke test superado en las cuatro variantes, que devuelve la respuesta "Paris" a una pregunta no especificada en la model card. No hay cifras de MMLU, HumanEval, GSM8K, latencia ni throughput.

## Requisitos de hardware

- Destino principal: CPU arm64 en dispositivos Android. No se trata de un artefacto pensado para GPU de escritorio o servidor.
- Tamano de pesos: 2,05 GB (2k), 2,06 GB (4k), 2,07 GB (8k) y 2,08 GB (16k). El incremento entre ventanas es minimo porque el peso de los parametros es identico.
- Cache KV adicional, reservada integra al cargar: 150,99 MB (2k), 301,99 MB (4k), 603,98 MB (8k) y 1,21 GB (16k), calculada a 73.728 bytes por token en fp32.
- Presupuesto orientativo del autor: `fits_phone_budget` en cada `config.json` evalua el encaje contra un presupuesto de 5 GB. Con ese limite, la variante de 4k deja un margen amplio y la de 16k es la mas ajustada.
- GPU recomendadas: no disponible. El repositorio no incluye artefactos para CUDA, Metal ni Vulkan.
- Encaje en GPU de consumo: no aplica a estos ficheros `.pte`; para ejecucion en RTX 4090 o similar habria que usar el modelo base en otro formato, no contemplado aqui.
- Opciones de despliegue: aplicacion Android openweights, o cualquier runtime ExecuTorch 1.4.0 con backend XNNPACK. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y los ficheros `.pte` no son compatibles con ellos.
- Latencia y throughput: no disponibles. Dependeran del SoC arm64 concreto, del numero de hilos asignados y de la ventana elegida, ya que la cache KV reservada afecta a la presion de memoria y al comportamiento del asignador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| experimentalmachines/Qwen2.5-3B-Instruct-ExecuTorch | 3.000 M (nominales) | 2k / 4k / 8k / 16k fijos por fichero | `.pte` (ExecuTorch, 8da4w) | qwen-research | Publicado, 0 descargas, 0 likes |
| Qwen/Qwen2.5-3B-Instruct (modelo base) | 3.000 M | No disponible en el material proporcionado | safetensors | qwen-research | Repositorio de referencia del que deriva este |
| Otras exportaciones ExecuTorch de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |
| Alternativas de ~3B para movil (por ejemplo, familias Llama o Gemma en formato similar) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la busqueda realizada |

La busqueda web asociada no devolvio ningun resultado relevante, por lo que no es posible construir una comparativa cuantitativa con alternativas. La unica comparacion defendible es contra el propio modelo base, del que este repositorio es una derivada cuantizada: pierde precision numerica y flexibilidad de contexto, y gana portabilidad a Android.

## Limitaciones y advertencias

- La cuantizacion 8da4w (pesos de 4 bits en grupos de 32) degrada la calidad respecto al modelo base en fp16/bf16. No se han publicado mediciones de esa degradacion.
- La ventana de contexto esta fijada en compilacion. No se puede ampliar en tiempo de ejecucion: si se necesita mas contexto hay que cargar otro fichero `.pte`, con el coste de memoria correspondiente.
- La cache KV se reserva completa al cargar, incluso si la conversacion es corta. En la variante de 16k esto supone 1,21 GB retenidos de forma permanente durante la sesion.
- Riesgo de alucinacion: inherente a un modelo instruct de 3.000 millones de parametros, y presumiblemente agravado por la cuantizacion agresiva de pesos. No hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos conocidos: no disponibles. La model card no incluye ninguna seccion de sesgos, evaluaciones de seguridad ni limitaciones de idioma.
- Idiomas soportados: no disponibles. No se puede confirmar el soporte de castellano ni de otras lenguas distintas del ingles a partir de la informacion proporcionada.
- Restriccion de licencia: la licencia qwen-research es una licencia de investigacion. El uso comercial requiere revisar los terminos enlazados en el repositorio y, en su caso, obtener una licencia aparte de Qwen. No se debe asumir uso comercial libre.
- Los ficheros originales de licencia se incluyen sin modificar, por lo que las obligaciones de atribucion del modelo base siguen vigentes.
- El repositorio tiene 0 descargas y 0 likes, y fue creado con una diferencia de unos ocho minutos entre creacion y ultima actualizacion. No hay evidencia de uso en produccion ni de validacion por terceros.
- No hay soporte declarado para tool calling, agentes, vision ni audio. Cualquier uso de ese tipo requeriria verificacion propia.
- Los resultados de la busqueda web recibida no guardan relacion con el modelo y no aportan informacion adicional; no deben usarse como fuente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/experimentalmachines/Qwen2.5-3B-Instruct-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base (qwen-research): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Aplicacion Android openweights: https://github.com/alpharomercoma/openweights
- Registro de la exportacion (run 1): https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/34749025946
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
