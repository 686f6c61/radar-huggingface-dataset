# aquaduck/Llama-3.2-3B-Instruct-GGUF

## Resumen

`aquaduck/Llama-3.2-3B-Instruct-GGUF` es un repositorio de redistribución y empaquetado de pesos, no un modelo nuevo. Contiene un GGUF de fichero único de `meta-llama/llama-3.2-3b-instruct`, ingerido desde la cuantización publicada por Unsloth (`unsloth/Llama-3.2-3B-Instruct-GGUF`), junto con dos fragmentos ("shards") de capas intermedias pensados para carga por etapas o en varios nodos dentro del formato propietario Aquaduck Arc (layer-package-v1). El valor diferencial del repo está en ese particionado: los pesos se dividen en dos mitades contiguas en la frontera de la capa 14 (capas 0–13 y 14–27), lo que permite descargar y servir el modelo de forma escalonada.

El modelo subyacente es un transformer causal decoder-only de la familia Llama 3.2, con alrededor de 3,2 mil millones de parámetros, 28 capas, dimensión oculta 3072 y atención con consultas agrupadas (GQA) de 24 cabezas de consulta por 8 de clave/valor. Es un modelo de instrucciones con plantilla de chat propia de Meta, orientado a generación de texto conversacional y despliegue en entornos con recursos limitados.

La relevancia de este repo es operativa más que algorítmica: sirve como pieza de distribución dentro del catálogo de la aplicación de escritorio de Aquaduck, que asigna y descarga automáticamente el fichero correspondiente a cada dispositivo. Para un desarrollador que solo quiera ejecutar Llama 3.2 3B Instruct en local, los repositorios de Meta o de Unsloth son la vía directa; este repo interesa si se necesita el empaquetado por capas o se integra con el ecosistema Arc.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Llama 3.2), GQA con 24 cabezas de consulta / 8 de clave-valor, 28 capas, dimension oculta 3072 |
| Parametros totales | 3,2B declarados por el autor; los metadatos del repo indican 1.803.374.656 parametros (discrepancia no resuelta) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card de este repo indica "unknown tokens"; consultar la ficha del modelo base de Meta) |
| Tipos de cuantizacion | La model card declara F16, aunque los ficheros se llaman `...-Q4_K_M.gguf` y sus tamanos (~2,02 GB, ~1,17 GB y ~1,18 GB) coinciden con Q4_K_M, no con F16. No hay otras cuantizaciones en el repo |
| Idiomas soportados | Multilingue, segun el modelo base; el repositorio no enumera idiomas concretos |
| Licencia | other (hereda la licencia del modelo base `meta-llama/llama-3.2-3b-instruct`) |
| Formato de pesos | GGUF (fichero unico completo) y GGUF por fragmentos de capas, formato de paquete layer-package-v1 |
| Repositorio de origen de los pesos | unsloth/Llama-3.2-3B-Instruct-GGUF |
| Tamano total del repo | 4,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento ni ajuste fino en este repositorio. La model card lo declara de forma explicita: los pesos proceden de Meta, la cuantizacion GGUF procede de Unsloth, y Aquaduck solo aloja y empaqueta. La relacion con el modelo base es `quantized`. La cadena completa es `meta-llama/llama-3.2-3b-instruct` → `unsloth/Llama-3.2-3B-Instruct-GGUF` (F16) → este repositorio.

La innovacion tecnica del repo es el particionado en capas intermedias: se cortan paquetes contiguos del GGUF completo en la frontera de la capa 14, con dos etapas como maximo (`maxStages: 2`), usando indices de fin exclusivos en el nombre del fichero (`layers-{inicio}-{finExclusivo}.gguf`). Segun el autor, estos fragmentos no son una cuantizacion nueva ni alteran los pesos, solo cambian el empaquetado. Los fragmentos no son modelos completos y no funcionan como tales en llama.cpp estandar; estan pensados para la carga escalonada de la aplicacion de escritorio de Aquaduck. Cualquier detalle sobre regimen de entrenamiento, numero de tokens, composicion del dataset o alineacion (RLHF/DPO) debe consultarse en la ficha del modelo base de Meta, no en esta.

## Capacidades

- Generacion de texto conversacional en modo instruct, con la plantilla de chat del modelo base de Meta. El autor advierte que usar otras plantillas produce resultados incorrectos.
- Modo "thinking" / razonamiento segun la documentacion del modelo base, siempre con su plantilla oficial.
- Soporte multilingue heredado del modelo base, sin listado de idiomas en este repo.
- Ejecucion en llama.cpp y cualquier runtime compatible con GGUF para el fichero completo.
- Carga por etapas o en varios nodos mediante los fragmentos de capas, exclusivamente con el stack Arc/Aquaduck.
- No se documentan en este repositorio capacidades de tool calling, function calling, uso agentico, vision ni audio. Cualquier capacidad de ese tipo debe verificarse en la ficha del modelo base.

## Casos de uso

- Inferencia local en equipos de gama media: el fichero GGUF completo se carga en llama.cpp u Ollama para tareas de generacion de texto y chat sin depender de servicios en la nube, con un coste de memoria muy inferior al de los pesos en precision alta.
- Asistentes conversacionales de escritorio: integrado en la aplicacion de Aquaduck, el modelo se descarga y se sirve de forma automatica segun la asignacion del catalogo, sin que el usuario tenga que elegir ficheros a mano.
- Despliegue escalonado en redes con ancho de banda limitado: los fragmentos de capas permiten descargar primero una mitad (capas 0–13 o 14–27) y tenerla preparada para servir mientras se completa el resto.
- Reparto de carga entre dos nodos: la division en la capa 14 esta pensada para que dos dispositivos alojen cada mitad del modelo y trabajen conjuntamente dentro del formato Arc.
- Prototipado rapido de aplicaciones de chat: al ser un modelo de 3,2B con licencia Llama, sirve como banco de pruebas para pipelines de generacion de texto antes de escalar a modelos mayores.
- Educacion e investigacion sobre cuantizacion y empaquetado: el repo permite estudiar como se comporta un GGUF particionado por capas frente al fichero unico, y comparar el efecto del formato de pesos en la calidad de salida.
- Procesamiento de texto por lotes en servidores sin GPU dedicada: el modelo cabe en CPU con memoria RAM suficiente, lo que habilita tareas offline de resumen, clasificacion o reescritura a bajo coste.
- Evaluacion de compatibilidad de plantillas: util para verificar el comportamiento del modelo cuando se aplica correctamente la plantilla de chat de Llama 3.2 frente a plantillas genericas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay evaluaciones propias para el GGUF alojado ni para los fragmentos, y remite a la ficha de `meta-llama/llama-3.2-3b-instruct`. Tampoco se aportan datos de latencia, throughput ni degradacion respecto a los pesos originales en precision superior (el autor solo senala que la cuantizacion puede degradar la calidad).

## Requisitos de hardware

- VRAM estimada para el fichero completo: aproximadamente 2,5–3,5 GB si la cuantizacion real es de 4 bits, o alrededor de 7–8 GB si realmente fuera F16, tal como declara la model card. La discrepancia entre el nombre del fichero y la etiqueta de cuantizacion debe resolverse antes de dimensionar el hardware.
- Fragmentos de capas: aproximadamente 1,17 GB el de capas 0–13 y 1,18 GB el de capas 14–27, con overhead adicional de runtime por etapa.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM para el fichero completo en 4 bits (GTX 1660, RTX 3060, RTX 4060, RTX 4090). Para despliegues en servidor, A100 o H100 estan sobredimensionadas para un modelo de este tamano, pero son validas si se sirven muchas instancias en paralelo.
- Cabe en GPU consumer: si, en el rango de 4 a 8 GB de VRAM segun la cuantizacion real, y tambien en CPU con unos pocos GB de RAM libre.
- Opciones de despliegue: llama.cpp y bindings derivados (Ollama, llama-cpp-python, LM Studio) para el fichero completo. Los fragmentos requieren el stack Arc/Aquaduck y no se cargan en llama.cpp estandar.
- Latencia y throughput: no disponibles.
- Almacenamiento: 4,4 GB para el repositorio completo; 2,02 GB si solo se descarga el fichero unico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| aquaduck/Llama-3.2-3B-Instruct-GGUF (este repo) | 3,2B declarados (1.803.374.656 segun metadatos) | no disponible | GGUF unico + fragmentos por capas | other (heredada) | Anade empaquetado por capas para carga escalonada; sin evals propias |
| meta-llama/llama-3.2-3b-instruct | 3,2B | no disponible en la informacion proporcionada | safetensors (pesos originales) | other (licencia Llama 3.2) | Modelo base de Meta; referencia para plantilla de chat y capacidades |
| unsloth/Llama-3.2-3B-Instruct-GGUF | 3,2B | no disponible en la informacion proporcionada | GGUF (incluye F16) | other (heredada) | Fuente de la cuantizacion ingerida; suele ofrecer varias cuantizaciones |
| Otras familias de ~3B (Qwen2.5-3B-Instruct, Phi-3.5-mini-instruct, Gemma 2 2B) | no disponible | no disponible | safetensors y GGUF | licencias propias de cada familia | Alternativas de mismo rango de tamano, pero sus especificaciones no se han verificado en la informacion disponible |

## Limitaciones y advertencias

- Inconsistencia de cuantizacion: la model card declara F16 mientras los ficheros se llaman `Q4_K_M` y sus tamanos corresponden a 4 bits. Verificar antes de asumir calidad o consumo de memoria.
- Inconsistencia en el numero de parametros: 3,2B segun el texto frente a 1.803.374.656 en los metadatos del repositorio.
- Sesgos y riesgos: identicos a los del modelo base de Meta, segun indica el propio autor. No hay analisis de sesgo especifico para este empaquetado.
- Alucinacion: riesgo inherente a un modelo de 3B sin evaluaciones publicadas en este repo; no hay datos que permitan acotarlo.
- Contexto: la longitud de contexto no esta declarada y la model card responde "unknown tokens". No debe asumirse la ventana del modelo base sin consultar su ficha.
- Plantilla de chat obligatoria: el autor advierte que usar formatos distintos al oficial de Llama 3.2 produce salidas incorrectas.
- Fragmentos no autonomos: ningun shard funciona como modelo completo en llama.cpp estandar. Tratarlos como modelos independientes es un uso fuera de alcance declarado.
- Licencia: "other", heredada del modelo base. Es necesario revisar los terminos de la licencia de Llama 3.2 de Meta antes de cualquier uso comercial, incluida la clausula de atribucion y las restricciones de uso aceptable.
- Madurez del repositorio: publicado y actualizado en la misma marca temporal, con 0 descargas y 0 likes, sin historial de uso ni validacion por terceros.
- Dependencia de una aplicacion propietaria para el flujo principal de descarga y asignacion (Aquaduck Desktop), lo que limita su uso fuera de ese ecosistema.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aquaduck/Llama-3.2-3B-Instruct-GGUF
- Modelo base: https://huggingface.co/meta-llama/llama-3.2-3b-instruct
- Fuente de la cuantizacion GGUF: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/aquaduck
- Nota sobre la busqueda web: los resultados obtenidos corresponden a vuelos entre Miami y Antigua y no guardan ninguna relacion con el modelo. No se han encontrado enlaces tecnicos adicionales (papers, blogs o demos) en la informacion disponible.
