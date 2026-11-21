# mradermacher/UI-Mate-9B-heretic-GGUF

## Resumen

UI-Mate-9B-heretic-GGUF es la distribucion en formato GGUF del modelo Dingdust/UI-Mate-9B-heretic, un modelo vision-language de aproximadamente 8.950 millones de parametros especializado en actuar como agente de interfaz grafica (computer-use agent). Lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, que genera versiones estaticas y con imatrix de modelos populares para su uso con llama.cpp y derivados. El modelo base esta orientado a tareas de automatizacion de escritorio: interpretar capturas de pantalla y emitir acciones de raton y teclado (via pyautogui) para completar tareas en sistemas operativos reales.

La variante "heretic" indica que el modelo base ha sido sometido a un proceso de ablacion de rechazos (abliterated/decensored), de modo que no aplica las capas de rechazo tipicas de los modelos alineados. Esto resulta relevante para agentes de escritorio, donde las politicas de seguridad genericas pueden bloquear acciones legitimas sobre el sistema operativo, pero introduce riesgos evidentes de uso indebido que deben gestionarse en la capa de aplicacion.

El repositorio ofrece 13 cuantizaciones estaticas (de Q2_K a f16) mas dos ficheros mmproj para el codificador visual, con un tamano total de 83 GB. La licencia es Apache 2.0 y el unico idioma declarado es el ingles. La informacion publica disponible no incluye detalles sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-language; transformer, detalles no publicados) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0; variantes imatrix en repo i1 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo base Dingdust/UI-Mate-9B-heretic: la model card del repositorio GGUF solo documenta el proceso de cuantizacion. Por el nombre y las etiquetas (multimodal, vision-language, computer-use-agent) se trata de un modelo que combina un codificador visual con un modelo de lenguaje de ~9 B, pero no se detalla el tipo de transformer, la estrategia de fusion multimodal ni la longitud de contexto.

Tampoco se han publicado datos sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste supervisado. La etiqueta "heretic" sugiere que el modelo base ha pasado por un proceso de ablacion de direcciones de rechazo (abliteration), una tecnica de edicion de pesos que elimina selectivamente la direccionalidad asociada a respuestas de negativa, sin reentrenar. El proceso de cuantizacion de mradermacher es estandar: conversion a GGUF con cuantizaciones estaticas K-quant e IQ, y una familia paralela con imatrix (pesos ponderados por importancia) publicada en el repositorio i1.

## Capacidades

- Percepcion visual de interfaces: interpretacion de capturas de pantalla de escritorio para localizar elementos (botones, campos de texto, menus).
- Generacion de acciones de escritorio: emision de comandos de raton y teclado compatibles con pyautogui (clics, arrastres, escritura, atajos).
- Automatizacion de tareas multi-paso: planificacion y ejecucion secuencial de acciones sobre el sistema operativo.
- Soporte declarado para entornos de evaluacion de agentes de escritorio: OSWorld y WindowsAgentArena (etiquetas del repositorio).
- Conversacion multi-turno (pipeline conversacional declarado en los tags).
- Capacidades de texto generales heredadas del modelo base de ~9 B (razonamiento, codigo, matematicas): no cuantificadas en la informacion disponible.
- Sin capa de rechazo (variante heretic/abliterated): responde a peticiones que un modelo alineado rechazaria.
- Tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Idiomas: solo ingles declarado.

## Casos de uso

- Automatizacion de pruebas de aceptacion de interfaces (UI testing): el modelo observa capturas de la aplicacion bajo prueba y genera las acciones necesarias para recorrer flujos de usuario, sustituyendo scripts fragiles basados en selectores.
- RPA ligera sobre aplicaciones legacy: en entornos sin API, el agente opera la interfaz grafica directamente mediante pyautogui, lo que permite automatizar tareas administrativas en aplicaciones de escritorio antiguas.
- Agente de soporte remoto asistido: dado un escritorio de usuario, el modelo puede guiar o ejecutar pasos de resolucion de incidencias (abrir paneles de configuracion, comprobar ajustes) a partir de la captura de pantalla.
- Investigacion en agentes de escritorio: reproduccion de experimentos en OSWorld y WindowsAgentArena con un modelo de ~9 B cuantizado, apto para iterar rapidamente en local sin depender de APIs.
- Generacion de datasets de trayectorias GUI: uso del modelo para producir secuencias de acciones etiquetadas sobre capturas, que luego sirven para entrenar o evaluar otros agentes.
- Prototipado de asistentes de escritorio en estaciones de trabajo con GPU de consumo: la cuantizacion Q4_K_M (5,7 GB) permite ejecutar el modelo en una unica GPU de 8-12 GB, lo que viabiliza demos y pruebas internas.
- Entornos de laboratorio sin restricciones de contenido: al carecer de capa de rechazo, resulta util para investigar comportamientos del agente en escenarios que un modelo alineado bloquearia; siempre en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos incluyen puntuaciones en OSWorld, WindowsAgentArena, MMLU, HumanEval u otras evaluaciones, ni comparaciones cuantitativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del LLM): Q2_K ~3,9 GB; Q3_K_M ~4,7 GB; IQ4_XS ~5,3 GB; Q4_K_M ~5,7 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18 GB.
- Hay que sumar el codificador visual: mmproj-Q8_0 (~0,7 GB) o mmproj-f16 (~1,0 GB), mas el espacio de cache KV segun contexto.
- GPU de consumo: Q4_K_M cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060) con contexto moderado; Q5_K_M y Q6_K requieren 10-12 GB (RTX 3080, RTX 4070 Ti); Q8_0 encaja en 12-16 GB (RTX 4070 Ti Super, RTX 4080); f16 requiere 24 GB (RTX 3090, RTX 4090).
- GPU de datacenter: A100 40/80 GB y H100 permiten f16 con contexto amplio y mayor throughput; utiles para servir varias peticiones concurrentes.
- Despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python) son la via natural para GGUF. El soporte multimodal requiere cargar el fichero mmproj junto al modelo. vLLM y TGI no consumen GGUF de forma nativa para vision-language sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia estructural, un modelo denso de ~9 B en Q4_K_M en una RTX 4090 suele generar decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UI-Mate-9B-heretic-GGUF | ~8,95 B | no disponible | Agente GUI multimodal, sin rechazos | Apache 2.0 | GGUF en HF |
| Dingdust/UI-Mate-9B-heretic (base) | ~8,95 B | no disponible | Mismo modelo en safetensors | Apache 2.0 | HF |
| UI-TARS (familia, referencia de categoria) | 2 B - 72 B | no disponible en esta ficha | Agente GUI multimodal | Disponible en HF, licencia variable | safetensors/GGUF |
| Qwen2.5-VL-7B (referencia de categoria) | ~8 B | 128 K (segun model card publica) | Vision-language generalista | Apache 2.0 | safetensors/GGUF |

La comparacion cuantitativa de rendimiento no es posible: no hay benchmarks publicados para este modelo. Las alternativas citadas se incluyen por categoria y tamano, no por resultados medidos frente a UI-Mate.

## Limitaciones y advertencias

- Ausencia de capa de rechazo: la variante heretic/abliterated elimina las negativas de seguridad, lo que incrementa el riesgo de que el agente ejecute acciones destructivas o inapropiadas sobre el sistema operativo si no se interponen validaciones externas.
- Riesgo de alucinacion en coordenadas: los agentes GUI pueden generar clics en posiciones incorrectas o secuencias de acciones invalidas; es imprescindible un bucle de verificacion con captura posterior.
- Solo ingles declarado: el rendimiento en instrucciones en castellano no esta garantizado ni documentado.
- Contexto desconocido: no se ha publicado la ventana de contexto, lo que dificulta planificar tareas largas o historiales extensos de capturas.
- Sin benchmarks: no hay evidencia publicada de calidad en OSWorld, WindowsAgentArena ni tareas generales; cualquier decision de produccion deberia basarse en evaluacion propia.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del comportamiento del agente y de los datos que procese (capturas de pantalla con informacion personal).
- Cuantizaciones de baja precision (Q2_K, Q3_K_S): degradacion notable de calidad; para agentes GUI, donde la precision en la localizacion de elementos es critica, se recomienda Q4_K_M o superior.
- Repositorio con 0 likes y 748 descargas en el momento de la consulta: ecosistema limitado, poca validacion comunitaria.
- Fecha de creacion del repositorio posterior a la de los modelos base habituales de la categoria; verificar compatibilidad con la version actual de llama.cpp para el soporte multimodal.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/UI-Mate-9B-heretic-GGUF
- Modelo base: https://huggingface.co/Dingdust/UI-Mate-9B-heretic
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/UI-Mate-9B-heretic-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#UI-Mate-9B-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
