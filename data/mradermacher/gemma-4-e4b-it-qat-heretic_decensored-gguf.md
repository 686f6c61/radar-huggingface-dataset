# mradermacher/gemma-4-E4B-it-qat-heretic_decensored-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `prithivMLmods/gemma-4-E4B-it-qat-heretic_decensored`, publicadas por el usuario mradermacher, especializado en la conversion y cuantizacion de pesos para inferencia local. Se trata de un derivado comunitario de la familia Gemma: el nombre del modelo apunta a una variante instructiva de tipo E4B (el dato real de safetensors del modelo base cuantizado indica 7.463.013.674 parametros totales) que ha sido sometida a un proceso de "abliteration" con la herramienta Heretic para eliminar los mecanismos de rechazo, y posteriormente convertida a formato GGUF en multiples niveles de cuantizacion.

El valor practico del repositorio esta en que permite ejecutar un modelo de ~7,46 mil millones de parametros sin censura en hardware de consumo, desde una cuantizacion Q2_K de 4,5 GB hasta f16 de 15,0 GB, con variantes intermedias Q4_K_M (5,4 GB) y Q8_0 (8,1 GB). El repositorio incluye ademas ficheros `mmproj` (Q8_0 y f16), suplementos multimodales que emplean los runners compatibles con llama.cpp para proyectar entradas de imagen o audio, lo que sugiere que el modelo base conserva capacidades multimodales.

Es relevante ahora por dos motivos: primero, porque la combinacion de cuantizacion QAT en el modelo base con cuantizaciones GGUF del cuantizador reduce la perdida de calidad respecto a una cuantizacion post-hoc tradicional; segundo, porque los modelos "decensored" o "abliterated" son objeto de interes tanto en investigacion de seguridad (red teaming, evaluacion de sesgos y de mecanismos de rechazo) como en aplicaciones creativas donde los filtros estandar resultan demasiado restrictivos. El modelo esta declarado para ingles y con licencia apache-2.0 en la model card del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (el nombre del modelo sugiere la familia Gemma; la model card no detalla la arquitectura) |
| Parametros totales | 7.463.013.674 (dato real de safetensors del modelo base) |
| Parametros activos | No disponible; no se confirma en la informacion proporcionada que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mas proyecciones multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Ingles (etiqueta `language: en` en la model card) |
| Licencia | apache-2.0 (declarada en el repositorio; conviene verificar la licencia del modelo Gemma subyacente) |
| Formato de pesos | GGUF (ficheros estaticos; existe una variante separada con cuantizaciones ponderadas/imatrix) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo (numero de capas, tipo de atencion, dimension del hidden state, mecanismo de posiciones, etc.), mas alla de que el modelo base lleva el sufijo "qat", que en la practica de la industria se asocia a *quantization-aware training*: un entrenamiento o ajuste fino realizado de forma consciente de la cuantizacion para que los pesos resulten mas robustos al paso a baja precision. El repositorio que nos ocupa no entrena nada; mradermacher realiza conversion a GGUF y cuantizacion de los pesos ya entrenados, por lo que las innovaciones de entrenamiento pertenecen al modelo base `prithivMLmods/gemma-4-E4B-it-qat-heretic_decensored`.

El elemento diferencial del modelo base es el proceso de desensurado automatico mediante Heretic, una herramienta de eliminacion de censura que busca parametros de "abliteration" de forma automatica, co-minimizando el numero de rechazos y la divergencia KL respecto al modelo original. Segun la descripcion del propio proyecto Heretic, este enfoque permite conservar la mayor parte de la inteligencia del modelo original mientras se eliminan los comportamientos de rechazo. El repositorio incluye tambien ficheros `mmproj`, empleados por llama.cpp y derivados para el procesamiento multimodal, lo que indica que la capacidad de vision o audio del modelo base se ha preservado en el proceso de cuantizacion. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF, DPO u otras tecnicas de alineamiento.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de instrucciones ("it" en el nombre del modelo base).
- Comportamiento desensurado: la abliteracion con Heretic elimina o reduce drasticamente los rechazos ante peticiones que un modelo alineado convencional rechazaria.
- Soporte multimodal a traves de los ficheros `mmproj` (proyeccion de imagenes o audio en runners compatibles con llama.cpp); no se detalla en la informacion disponible que modalidades cubre exactamente.
- Ejecucion local en CPU y GPU gracias al formato GGUF y a los distintos niveles de cuantizacion.
- Base para ajuste fino posterior: al estar disponible en f16 y Q8_0, puede servir como punto de partida para LoRAs u otros ajustes.
- No se documenta soporte explicito de tool calling, function calling, modo "thinking" ni razonamiento multi-paso en la informacion proporcionada.
- Capacidad multilingue limitada: la model card declara unicamente ingles.

## Casos de uso

- Escritura creativa y narrativa sin filtros: el modelo esta pensado para generar ficcion, dialogo y contenido adulto o controvertido sin los rechazos tipicos de los modelos alineados, lo que lo hace util para autores que trabajan generos literarios que disparan los filtros habituales.
- Investigacion en seguridad y red teaming: sirve como sujeto de prueba para medir el efecto real de la abliteracion sobre la utilidad del modelo, comparando sus respuestas con las del Gemma original antes de la eliminacion de censura.
- Evaluacion de sesgos y comportamiento toxico: al carecer de capa de rechazo, permite observar con menos interferencia las distribuciones de salida del modelo base ante prompts sensibles, lo que resulta util en estudios de sesgo.
- Asistente local sin conexion en un portatil o equipo de sobremesa: con las cuantizaciones Q4_K_M (5,4 GB) o Q5_K_M (5,8 GB) cabe en GPUs de consumo de 8-12 GB y funciona integramente offline, sin enviar datos a servicios externos.
- Generacion de contenido para pipelines internos: integrable via llama.cpp, Ollama o llama-cpp-python en script de produccion de texto en lote, con la ventaja de un modelo pequeno y rapido frente a alternativas de mayor tamano.
- Prototipado de aplicaciones conversacionales en ingles: al ser un modelo instructivo de ~7,46 mil millones de parametros, permite iterar rapidamente en el desarrollo de chatbots o asistentes antes de escalar a modelos mayores.
- Procesamiento multimodal ligero: los ficheros `mmproj` permiten experimentar con descripcion de imagenes o tareas vision-lenguaje en los runners que los soportan, siempre que la modalidad concreta este implementada en el cliente.
- Base para ajuste fino comunitario: la disponibilidad en f16 y Q8_0 facilita el uso como punto de partida para LoRA o fine-tuning especifico de dominio sobre una base sin restricciones de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparables, y las fichas de terceros localizadas en la busqueda web figuran como entradas de registro sin datos de evaluacion.

## Requisitos de hardware

- VRAM estimada segun el tamano del fichero (aproximada, sin contar la cache KV que depende del contexto y del runner):
  - Q2_K, 4,5 GB: aproximadamente 5-6 GB de VRAM.
  - Q3_K_S / Q3_K_M / Q3_K_L, 4,7-5,1 GB: aproximadamente 5,5-6 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M, 5,2-5,4 GB: aproximadamente 6-7 GB.
  - Q5_K_S / Q5_K_M, 5,7-5,8 GB: aproximadamente 6,5-7,5 GB.
  - Q6_K, 6,3 GB: aproximadamente 7,5-8,5 GB.
  - Q8_0, 8,1 GB: aproximadamente 9-10 GB.
  - f16, 15,0 GB: aproximadamente 16-18 GB.
- Cabe en GPU de consumo: si. RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti, RTX 4080, RTX 4090 y GPUs de 8 GB con las cuantizaciones Q3 y Q4 (con contexto reducido). Tambien es viable en Apple Silicon con memoria unificada de 16 GB o mas.
- GPU recomendadas para uso comodo y contexto amplio: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q8_0 y f16; A100 o H100 solo tienen sentido si se despliegan muchas instancias concurrentes o si se trabaja con el modelo sin cuantizar.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui. El etiquetado del repositorio incluye `transformers` y `text-generation-inference`, pero los artefactos publicados son GGUF, por lo que el uso con vLLM o TGI requeriria soporte experimental de GGUF o la conversion previa a otros formatos.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, del nivel de cuantizacion, de la longitud de contexto efectiva y del backend (CPU frente a GPU, offload de capas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-E4B-it-qat-heretic_decensored-GGUF | 7.463.013.674 | No disponible | GGUF (estatico) | apache-2.0 | Cuantizaciones estaticas; incluye mmproj multimodal; 934 descargas |
| mradermacher/gemma-4-E4B-it-qat-heretic_decensored-i1-GGUF | No disponible | No disponible | GGUF (imatrix) | No disponible | Variante con cuantizaciones ponderadas/imatrix, generalmente de mayor calidad a igual tamano |
| prithivMLmods/gemma-4-E4B-it-qat-heretic_decensored | 7.463.013.674 | No disponible | Pesos originales (safetensors) | apache-2.0 | Modelo base sin cuantizar; referencia de maxima calidad |

No se dispone de datos de rendimiento comparado con alternativas de otros autores dentro de la informacion proporcionada, por lo que la comparativa se limita a variantes del mismo modelo.

## Limitaciones y advertencias

- El modelo esta declarado unicamente para ingles; su rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Al ser un modelo decensurado por abliteracion, no aplica ninguna capa de rechazo: puede generar contenido ofensivo, ilegal, peligroso o sexual sin advertencia. Su uso en produccion orientada al publico exige filtros externos propios.
- La abliteracion puede degradar capacidades generales del modelo original. La propia herramienta Heretic intenta minimizar esta perdida co-minimizando la divergencia KL, pero no hay evaluaciones publicadas en este repositorio que cuantifiquen el dano.
- Riesgo de alucinacion inherente a un modelo de ~7,46 mil millones de parametros; no se han publicado evaluaciones de factualidad.
- La licencia declarada en el repositorio es apache-2.0, pero el modelo deriva de la familia Gemma, cuyos pesos originales suelen distribuirse bajo terminos propios de Google. Antes de un uso comercial conviene verificar la licencia aplicable al modelo base `prithivMLmods/gemma-4-E4B-it-qat-heretic_decensored` y a sus ascendientes.
- No se documenta la longitud de contexto soportada; los runners pueden aplicar valores por defecto distintos, con el consiguiente impacto en memoria y calidad.
- El repo ocupa 76,4 GB en total por acumular todas las cuantizaciones; para uso local conviene descargar unicamente el fichero necesario mas, si se requiere multimodalidad, el `mmproj` correspondiente.
- No hay informacion sobre datos de entrenamiento, sesgos conocidos ni evaluaciones de seguridad, lo que dificulta el cumplimiento de requisitos regulatorios en entornos empresariales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-4-E4B-it-qat-heretic_decensored-GGUF
- Arbol de ficheros del repositorio: https://huggingface.co/mradermacher/gemma-4-E4B-it-qat-heretic_decensored-GGUF/tree/main
- Variante con cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/gemma-4-E4B-it-qat-heretic_decensored-i1-GGUF
- Modelo base (pesos sin cuantizar): https://huggingface.co/prithivMLmods/gemma-4-E4B-it-qat-heretic_decensored
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#gemma-4-E4B-it-qat-heretic_decensored-GGUF
- Proyecto Heretic (eliminacion automatica de censura): https://github.com/p-e-w/heretic
- Peticiones y preguntas sobre cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Ficha de terceros (registro sin datos de evaluacion): https://free2aitools.com/model/mradermacher/gemma-4-e4b-it-qat-heretic_decensored-gguf
- Ficha de terceros de la variante i1: https://free2aitools.com/model/mradermacher/gemma-4-e4b-it-qat-heretic_decensored-i1-gguf
