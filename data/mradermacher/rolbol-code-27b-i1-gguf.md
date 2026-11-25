# mradermacher/RolBol-Code-27B-i1-GGUF

## Resumen

RolBol-Code-27B-i1-GGUF es la version cuantizada en formato GGUF del modelo RolBol Code 27B, desarrollado originalmente por RolBolSystems y cuantizado por mradermacher. Se trata de un modelo de lenguaje especializado en generacion de codigo y flujos de trabajo agenticos (autonomous coding), con 27.320.697.856 parametros totales. La model card lo etiqueta como modelo de vision, aunque los ficheros mmproj, si existen, se alojan en el repositorio estatico complementario.

La relevancia de esta publicacion radica en que ofrece variantes cuantizadas con imatrix (importancia matricial) que permiten ejecutar un modelo de 27B en hardware de consumo, algo inviable con los pesos originales en safetensors. El repositorio incluye 23 variantes de cuantizacion que van desde Q2_K (11,3 GB) hasta Q6_K (22,5 GB), lo que cubre un amplio espectro de balances entre calidad, velocidad y requisitos de VRAM.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y esta orientado a tareas de generacion de codigo, razonamiento multi-paso y automatizacion agentica. La informacion disponible sobre arquitectura interna, contexto y datos de entrenamiento es limitada en la model card del cuantizador, por lo que varios parametros tecnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, segun tags de la model card) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en, multilingual (segun metadatos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original en safetensors |
| Tamano del repositorio | 220,5 GB |
| Modelo base | RolBolSystems/RolBol-Code-27B |
| Etiquetas | text-generation, code, coding, agentic, autonomous-coding, 27b, conversational |

## Arquitectura y entrenamiento

La model card del cuantizador no proporciona detalles sobre la arquitectura interna del modelo base (tipo de atencion, numero de capas, dimension del estado oculto, uso de MoE o atencion lineal). Los metadatos indican que se trata de un modelo de la familia transformer orientado a generacion de texto y codigo, con etiquetas que apuntan a capacidades agenticas y de codificacion autonoma. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

La innovacion tecnica destacable de esta publicacion es el uso de cuantizacion con imatrix (importance matrix), un metodo que calcula la importancia de cada peso a partir de un dataset de calibracion y permite obtener cuantizaciones de menor tamano con perdida de calidad reducida. El autor incluye el fichero imatrix (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. Ademas, se ofrecen variantes IQ (importancia cuantizada) que, segun las notas del autor, suelen superar a las variantes no-IQ de tamano similar (por ejemplo, IQ3_S frente a Q3_K_M). El modelo base se etiqueta como vision model, aunque los ficheros mmproj no estan en este repositorio sino en el estatico.

## Capacidades

- Generacion de texto y codigo en multiples lenguajes de programacion, segun las etiquetas code y coding.
- Razonamiento multi-paso y flujos agenticos (autonomous-coding, agentic), orientado a tareas de automatizacion de desarrollo.
- Capacidades conversacionales multi-turno (tag conversational).
- Soporte multilingue segun los metadatos (en, multilingual), aunque no se detallan los idiomas concretos.
- Posible capacidad de vision (la model card indica "This is a vision model"), aunque los ficheros mmproj no se incluyen en este repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de programacion en IDE: el modelo puede generar y completar codigo en un entorno de desarrollo integrado, aprovechando su especializacion en coding y su ventana de contexto (no especificada) para mantener el contexto del proyecto. Las cuantizaciones Q4_K_M (17,1 GB) permiten ejecutarlo en estaciones de trabajo con GPU de 24 GB.
- Automatizacion de tareas de refactorizacion: con capacidades agenticas, puede encadenar pasos de analisis, edicion y verificacion de codigo en pipelines de CI/CD, aunque requiere supervision humana por el riesgo de alucinacion.
- Generacion de tests unitarios: el modelo puede producir casos de prueba a partir de funciones existentes, integrable en flujos de desarrollo con llama.cpp u Ollama para entornos locales.
- Chat de soporte tecnico para desarrolladores: su naturaleza conversacional y multilingue permite gestionar consultas tecnicas multi-turno sobre APIs y librerias.
- Prototipado rapido en local: las cuantizaciones Q3 e IQ3 (11-15 GB) permiten ejecutar el modelo en GPUs de consumo como RTX 4090 (24 GB) o incluso en configuraciones con menos VRAM usando offloading parcial.
- Analisis de documentacion tecnica y extraccion de ejemplos de codigo: el modelo puede procesar documentacion y generar snippets funcionales, util para equipos que necesitan automatizar la creacion de guias internas.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo Apache 2.0 ejecutable en local via GGUF, permite procesar codigo propietario sin enviarlo a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos. El autor unicamente referencia un grafico externo de ikawrakow sobre perplejidad de tipos de cuantizacion de baja calidad, sin datos concretos del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11,3 GB (i1-Q2_K) y 22,5 GB (i1-Q6_K) solo para los pesos; hay que anadir el espacio para el contexto KV, que depende de la longitud de contexto configurada (no disponible).
- GPU recomendadas: para las cuantizaciones Q4_K_M (17,1 GB) y superiores, se recomienda una RTX 4090 (24 GB), A100 (40/80 GB) o H100. Para Q3 e IQ3 (11-15 GB) es viable una RTX 4080 (16 GB) o RTX 3090 (24 GB).
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y RTX 4080 con cuantizaciones Q3-Q4. Las variantes Q5 y Q6 requieren 19-22,5 GB y dejan poco margen para el contexto en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El autor indica endpoints_compatible en los tags. Para el modelo base en safetensors se podria usar vLLM o TGI, aunque no se confirma compatibilidad.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. La siguiente tabla recoge unicamente los datos conocidos de este modelo frente a alternativas genericas de la misma categoria, marcando como no disponible lo que no se puede verificar:

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|
| RolBol-Code-27B-i1-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF | no disponible |
| Alternativa A (modelo de codigo ~27B) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa B (modelo de codigo ~27B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos comparables concretos con datos verificables, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; al ser un modelo entrenado con datos web y de codigo, es probable que herede sesgos de esas fuentes, pero no hay evidencia concreta disponible.
- Riesgo de alucinacion: presente en modelos generativos de codigo; puede producir APIs inexistentes, imports erroneos o logica incorrecta que compile pero falle en ejecucion. Se recomienda validacion automatica (tests, linters) en produccion.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada; los idiomas soportados se indican como en y multilingual sin detalle, por lo que el rendimiento en castellano no esta verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no obstante, conviene revisar la licencia del modelo base original por si hubiera terminos adicionales no reflejados en el cuantizador.
- Caveat de cuantizacion: las variantes Q2 y Q3 de baja calidad (especialmente Q2_K y Q4_0) degradan notablemente la calidad; el autor recomienda IQ3_XXS o IQ3_S frente a Q3_K* y Q4_K_M como opcion rapida y recomendada.
- Modelo de vision: la model card indica que es un modelo de vision, pero los ficheros mmproj no estan en este repositorio; para usar capacidades visuales hay que acudir al repositorio estatico.
- Fecha de creacion: el repositorio figura creado el 2026-11-21, fecha posterior a la actual; conviene verificar la vigencia y procedencia de los metadatos antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/RolBol-Code-27B-i1-GGUF
- Modelo base: https://huggingface.co/RolBolSystems/RolBol-Code-27B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/RolBol-Code-27B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#RolBol-Code-27B-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
