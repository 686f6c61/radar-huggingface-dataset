# cua-ai/cua-s1-4b-0.2

## Resumen

cua-s1-4b-0.2 es un conjunto de adaptadores LoRA publicados por cua-ai sobre el modelo base congelado Qwen/Qwen3.5-4B. No es un modelo completo, sino un ajuste fino ligero orientado a una tarea muy concreta: la toma de decisiones de tipo "computer use", es decir, elegir el elemento de interfaz sobre el que actuar y la accion a ejecutar dentro de un conjunto cerrado de opciones, ademas de sostener rollouts agenticos de varios pasos en entornos GUI reales.

El repositorio contiene dos adaptadores entrenados de forma independiente: uno en el directorio `text/` y otro en `multimodal/`, de modo que la libreria de inferencia selecciona uno u otro segun la modalidad de entrada. Forma parte de la familia de investigacion Cua-S1 y se publica de forma separada respecto a su predecesor, cua-s1-4b-0.1, sin sustituirlo.

Su relevancia actual reside en el enfoque: en lugar de reentrenar un modelo de 4B completo para control de escritorio, se distribuyen adaptadores de bajo rango (0,2 GB de repositorio) que se acoplan a un base ya disponible. Esto abarata el despliegue y permite iterar rapido sobre la politica de acciones, a costa de heredar todas las limitaciones del modelo base y de requerir un pipeline de carga especifico con PEFT. El repo acumulaba 13 likes y 0 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer decoder congelado (Qwen/Qwen3.5-4B); dos adaptadores independientes, `text/` y `multimodal/` |
| Parametros totales | Numero exacto de parametros del adaptador no disponible; tamano del repositorio 0,2 GB. El base se denomina "4B", pero el dato exacto no esta en la informacion proporcionada |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3.5-4B, no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible. Los adaptadores se distribuyen en precision original; cualquier cuantizacion exige fusionar el adaptador con el base y cuantizar el resultado |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 para los pesos de los adaptadores. Los pesos y la licencia del modelo base Qwen/Qwen3.5-4B se rigen por sus propios terminos y no se redistribuyen en este repositorio |
| Formato de pesos | safetensors (adaptadores LoRA/PEFT) |
| Autor | cua-ai |
| Modelo base | Qwen/Qwen3.5-4B |
| Libreria | peft |
| Fecha de publicacion | 22 de septiembre de 2026 (creacion); ultima actualizacion el 23 de septiembre de 2026 |
| Descargas / likes | 0 descargas / 13 likes |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-4B, que permanece congelado. Sobre el se entrenan dos adaptadores LoRA (Low-Rank Adaptation) con la libreria PEFT, almacenados en formato safetensors. La contribucion del adaptador es de bajo rango, por lo que el repositorio ocupa apenas 0,2 GB frente al peso completo de un modelo de 4B. La existencia de un adaptador etiquetado como `multimodal/` sugiere que el flujo contempla entradas con imagen ademas de texto, si bien la informacion proporcionada no detalla si el base incorpora un codificador visual nativo ni como se integra la senal visual en el adaptador.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF, DPO o similares. La model card indica que el objetivo de entrenamiento son decisiones cerradas de elemento/accion para computer use, complementadas con rollouts agenticos multi-paso en entornos GUI en vivo, y remite a los directorios `libs/cua-bench-s1` y `libs/cua-s1` del repositorio de GitHub para consultar resultados, metodologia y codigo. La integracion prevista se realiza a traves de la clase `FourBModel` de la libreria `cua_s1`, que recibe la ruta del adaptador y un parametro `modality` para escoger entre `text` y `multimodal`.

## Capacidades

- Decision de computer use con opciones cerradas: seleccion del elemento de interfaz objetivo y de la accion a ejecutar, en lugar de generacion libre de texto.
- Rollouts agenticos multi-paso en entornos GUI en vivo, encadenando observaciones y acciones dentro de una misma sesion.
- Procesamiento de texto mediante el adaptador `text/`.
- Procesamiento multimodal mediante el adaptador `multimodal/`, segun lo declarado por el autor; el alcance exacto de la modalidad visual no se detalla en la informacion disponible.
- Integracion programatica mediante la clase `FourBModel` de `cua_s1.four_b`, con seleccion de adaptador por modalidad.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declaran idiomas soportados.
- Capacidades de audio o video: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de automatizacion de escritorio: el modelo decide que elemento de la GUI pulsar y que accion ejecutar a partir del estado de la pantalla, lo que permite construir agentes que completan tareas administrativas repetitivas (rellenar formularios, navegar menus, exportar informes) sin scripting especifico por aplicacion.
- Pruebas de regresion de interfaz: al poder elegir elementos y acciones, el adaptador puede actuar como controlador de una suite de pruebas end-to-end que verifica flujos de usuario reales sobre builds nightly, reduciendo el mantenimiento de selectores fragiles.
- Soporte remoto asistido: integrado en una herramienta de asistencia, el modelo propone la siguiente accion sobre el escritorio del usuario y permite que este la confirme, agilizando la resolucion de incidencias en aplicaciones internas.
- RPA (automatizacion robotica de procesos) con tolerancia a cambios de UI: al basarse en decisiones sobre elementos observados y no en coordenadas o selectores fijos, encaja mejor en entornos donde la interfaz cambia con frecuencia entre versiones.
- Extraccion de datos a traves de interfaces legacy: para sistemas sin API, el agente puede operar la aplicacion paso a paso y volcar la informacion a un formato estructurado, con el adaptador `multimodal/` si la tarea requiere interpretar la pantalla visualmente.
- Investigacion en agentes GUI: sirve como punto de partida reproducible sobre un base de 4B para experimentar con politicas de accion, comparar contra el predecesor cua-s1-4b-0.1 y reutilizar el banco de pruebas de `cua-bench-s1`.
- Entornos de formacion y demos: al ocupar 0,2 GB, es viable distribuir el adaptador junto a un base cuantizado en equipos de desarrollo para demostraciones internas de automatizacion de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `libs/cua-bench-s1` y `libs/cua-s1` del repositorio de GitHub para consultar resultados y metodologia, pero no incluye cifras en el propio repositorio de HuggingFace, por lo que no se reproducen numeros que no hayan sido verificados.

## Requisitos de hardware

- El repositorio de adaptadores ocupa 0,2 GB, por lo que el almacenamiento no es un factor limitante; el coste real proviene del modelo base de 4B que debe cargarse junto a el.
- VRAM estimada para el base en BF16/FP16: del orden de 8 GB solo en pesos, mas cache KV y overhead del runtime; en la practica se recomienda un minimo de 12-16 GB para contexto moderado. Estimacion orientativa, no medida publicada.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 4-5 GB de pesos, manejable en GPUs de 8 GB. Estimacion orientativa.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 2,5-3 GB de pesos, lo que permite ejecucion en GPUs consumer de 6-8 GB. Estimacion orientativa.
- GPU recomendadas: para desarrollo local, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; para servicio en produccion, L4, L40S, A100 o H100, permitiendo lotes mayores y contextos mas largos.
- Cabe en GPU consumer: si, siempre que se cuantice el base fusionado con el adaptador; en precision completa conviene una GPU de 16 GB o superior.
- Opciones de despliegue: transformers con PEFT (carga directa del adaptador), vLLM con soporte de LoRA, TGI si admite el adaptador, o bien fusionar el adaptador con el base y exportar a GGUF para llama.cpp, Ollama o servidores compatibles. La cuantizacion GGUF requiere el paso previo de fusion, ya que el repositorio solo publica pesos de adaptador.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de alternativas, por lo que no es posible establecer una comparacion cuantitativa. La unica comparacion documentada por el propio autor es con su predecesor:

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cua-s1-4b-0.2 | Modelo analizado | Adaptadores sobre base de 4B; numero exacto no disponible | No disponible | Apache-2.0 (adaptadores) | HuggingFace |
| cua-s1-4b-0.1 | Version anterior de la misma familia, publicada por separado y no sustituida | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otros agentes GUI de la misma categoria (por ejemplo, familias de modelos especializados en computer use) | Alternativas conceptuales | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados sobre parametros, contexto, rendimiento o licencia de esas alternativas en la informacion proporcionada, por lo que se omite cualquier cifra.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar Qwen/Qwen3.5-4B, y su licencia de uso queda supeditada a la del base, que no se redistribuye en este repositorio.
- Al ser un adaptador LoRA, no puede cuantizarse directamente; es necesario fusionarlo con el base antes de exportar a GGUF o aplicar cuantizaciones de 8 o 4 bits.
- La tarea esta formulada como decision sobre opciones cerradas, de modo que el modelo no esta pensado para generacion abierta ni para conversacion general.
- No se declaran idiomas soportados, por lo que el comportamiento fuera del ingles (o del idioma mayoritario del dataset de entrenamiento, no especificado) es incierto.
- No hay resultados de benchmarks publicados en la informacion disponible, lo que impide estimar la tasa de exito real en tareas de computer use ni compararla con alternativas.
- Riesgo de alucinacion en la identificacion de elementos de interfaz: una eleccion erronea de elemento o accion puede tener efectos destructivos en un entorno real (borrado de datos, envio de mensajes, compras). Se recomienda ejecutar siempre en entornos aislados o sandbox y con confirmacion humana en acciones irreversibles.
- Sesgos conocidos: no disponibles. Al heredar el modelo base, arrastra los sesgos de sus datos de entrenamiento, no documentados aqui.
- Con 4B de parametros, la capacidad de razonamiento multi-paso prolongado es limitada en comparacion con modelos mayores, lo que puede degradar rollouts largos.
- El adaptador `multimodal/` se anuncia, pero no se detalla en la informacion proporcionada como se incorpora la modalidad visual ni si el base la soporta de forma nativa; conviene verificar este punto antes de disenar un pipeline de produccion.
- Repositorio con 0 descargas en el momento de la consulta: no existe aun validacion por parte de la comunidad.
- Uso comercial: los adaptadores son Apache-2.0, pero debe revisarse de forma independiente la licencia aplicable al modelo base antes de desplegar en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cua-ai/cua-s1-4b-0.2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Organizacion Qwen en HuggingFace: https://huggingface.co/Qwen
- Version anterior de la familia: https://huggingface.co/cua-ai/cua-s1-4b-0.1
- Codigo de la familia Cua-S1: https://github.com/trycua/cua/tree/main/libs/cua-s1
- Banco de pruebas y metodologia: https://github.com/trycua/cua/tree/main/libs/cua-bench-s1
