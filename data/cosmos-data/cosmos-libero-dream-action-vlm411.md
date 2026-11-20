# Cosmos-Data/cosmos-libero-dream-action-vlm411

## Resumen

Cosmos LIBERO-40 Dreamed Video and Action (VLM411) es un checkpoint de politica robotica video-accion publicado por Cosmos-Data en Hugging Face. Se trata de una continuacion del modelo base "Cosmos LIBERO-40 ID-only 4k baseline", sobre el que se han aplicado actualizaciones adicionales de optimizador entrenando con una mezcla de pares video-accion originales del benchmark LIBERO-40 y 411 pares video-accion "sonados" (dreamed) fuera de distribucion (OOD), previamente filtrados por un VLM, con un peso de muestreo ID:OOD de 5:1. El objetivo es mejorar la generalizacion de la politica mas alla de la distribucion de entrenamiento original.

El modelo se distribuye como una politica conjunta video-accion en formato BF16 Safetensors, empaquetada en dos carpetas de checkpoint (`plus250` y `plus1000`) que corresponden a 250 y 1.000 actualizaciones adicionales de optimizador respectivamente, partiendo de la misma inicializacion de 4k pasos. Cada carpeta incluye configuracion, indice, shards y ficheros de tokenizer, y esta pensada para cargarse con el loader de politicas LIBERO del Cosmos Framework, que depende del runtime de Cosmos Framework y del VAE de Wan 2.2.

La relevancia del modelo reside en su enfoque de aumento de datos mediante videos generados ("dreamed") filtrados por un VLM para entrenar politicas roboticas mas robustas en tareas de manipulacion del benchmark LIBERO. No se dispone de informacion publica sobre arquitectura detallada, numero de parametros, contexto ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | politica conjunta video-accion (detalles no disponibles); dependencia del VAE de Wan 2.2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 Safetensors (unico formato indicado) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La model card describe el modelo como una "joint video-action policy", es decir, una politica que modela conjuntamente video y acciones, empaquetada en BF16 Safetensors e integrada en el Cosmos Framework. El runtime del loader depende del VAE de Wan 2.2, lo que sugiere que la parte generativa de video se apoya en dicho VAE, aunque no se detalla la arquitectura interna (transformer, difusion, etc.) en la informacion disponible.

El entrenamiento parte del checkpoint "Cosmos LIBERO-40 ID-only 4k baseline" y aplica actualizaciones adicionales de optimizador sobre una mezcla de pares video-accion originales de LIBERO-40 y 411 pares video-accion OOD generados ("dreamed") y filtrados por un VLM, con un peso de muestreo ID:OOD de 5:1. Los dos checkpoints publicados (`plus250` y `plus1000`) corresponden a 250 y 1.000 actualizaciones adicionales respectivamente desde la misma inicializacion de 4k. No se especifican el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion conjunta de video y acciones para control robotico en tareas de manipulacion del benchmark LIBERO-40.
- Ejecucion de politicas de imitacion entrenadas sobre pares video-accion.
- Mejora de generalizacion fuera de distribucion gracias a la mezcla con datos "dreamed" filtrados por VLM.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado unicamente para ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles mas alla del procesamiento video-accion inherente a la politica.

## Casos de uso

- Investigacion en aprendizaje por imitacion robotico: el checkpoint sirve como punto de partida para estudiar el efecto del aumento de datos con videos generados en tareas de manipulacion de LIBERO-40.
- Evaluacion de robustez OOD: los checkpoints `plus250` y `plus1000` permiten comparar como evoluciona la generalizacion conforme se anaden actualizaciones de optimizador sobre datos mezclados ID/OOD.
- Reproduccion de experimentos: al incluir configuracion, indice, shards y tokenizer, el paquete facilita reproducir el pipeline de entrenamiento y evaluacion con el Cosmos Framework.
- Benchmarking de politicas video-accion: util para comparar frente al baseline ID-only de 4k pasos y medir la ganancia atribuible a los datos dreamed.
- Desarrollo de pipelines de filtrado VLM: el modelo ejemplifica el uso de un VLM como filtro de calidad de datos sinteticos antes de incorporarlos al entrenamiento.
- Integracion en el ecosistema Cosmos Framework: permite validar el loader de politicas LIBERO y la dependencia del VAE de Wan 2.2 en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 60,7 GB, lo que da una cota inferior orientativa del espacio en disco necesario para descargar los checkpoints.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante el loader de politicas LIBERO del Cosmos Framework, que requiere el runtime de Cosmos Framework y el VAE de Wan 2.2.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos LIBERO-40 Dreamed Video and Action (VLM411) | no disponible | no disponible | no disponible | no disponible | Hugging Face (Cosmos-Data) |
| Cosmos LIBERO-40 ID-only 4k baseline | no disponible | no disponible | no disponible | no disponible | Hugging Face (Cosmos-Data) |
| Alternativas de politica robotica video-accion | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado; al tratarse de una politica video-accion, el riesgo se traslada a la generacion de trayectorias o videos no realistas.
- Limitaciones de contexto o idioma: el modelo esta etiquetado unicamente para ingles y no se especifica longitud de contexto.
- Restricciones de licencia para uso comercial: la licencia no esta disponible, por lo que no puede asumirse uso comercial sin verificacion previa.
- Dependencia de software: requiere el runtime de Cosmos Framework y el VAE de Wan 2.2, lo que limita su portabilidad a otros stacks.
- Ambito acotado: entrenado especificamente sobre LIBERO-40; su comportamiento fuera de ese benchmark no esta documentado.
- Numero de descargas y likes nulo en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Cosmos-Data/cosmos-libero-dream-action-vlm411
- Modelo base: https://huggingface.co/Cosmos-Data/cosmos-libero-noood-baseline-gbs2048-4k
- Resultados de busqueda web: sin enlaces relevantes al modelo (los resultados obtenidos corresponden a entidades no relacionadas: cosmos.so, cosmos-sports.fr y la entrada de Wikipedia sobre "Cosmos (filosofia)").
