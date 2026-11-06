# OpenDCAI/Omni-Edu-9B-GGUF

## Resumen

Omni-Edu-9B-GGUF es la distribucion en formato GGUF del modelo Omni-Edu-9B, un modelo multimodal de tipo image-text-to-text orientado al ambito educativo y desarrollado por OpenDCAI. El modelo original (lhpku20010120/Omni-Edu-9B) ha sido convertido y cuantizado con llama.cpp para permitir su ejecucion en hardware de consumo mediante llama-server, Ollama u otras herramientas compatibles con GGUF. Cuenta con 8.953.803.264 parametros totales (aproximadamente 9B), lo que lo situa en la franja de modelos densos de tamano medio.

La relevancia de esta publicacion radica en que traslada un modelo multimodal especializado en educacion a un formato ligero y portable: la version Q4_K_M ocupa 5,24 GiB y la Q8_0 8,87 GiB, con un proyector multimodal (mmproj) compartido de 16 bits que habilita la entrada de imagenes. Esto permite desplegar capacidades de vision y lenguaje en entornos con una unica GPU consumer, algo poco habitual en modelos multimodales de esta escala.

No obstante, la informacion publicada es limitada: la model card del repositorio GGUF es un README de conversion que remite a los terminos del modelo original, y no se detallan la composicion del dataset de entrenamiento, los idiomas soportados ni resultados de benchmarks. Los tags indican una base arquitectonica qwen3_5, lo que sugiere una familia Qwen 3.5, pero este dato no se confirma en la documentacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); tag qwen3_5, sin confirmar en documentacion |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa -c 8192, no implica contexto nativo) |
| Tipos de cuantizacion | BF16 (16,69 GiB), Q8_0 (8,87 GiB), Q6_K (6,85 GiB), Q4_K_M (5,24 GiB); proyector multimodal mmproj F16 |
| Idiomas soportados | no disponible |
| Licencia | other (se aplican los terminos del modelo original lhpku20010120/Omni-Edu-9B) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal que acepta texto e imagenes como entrada y genera texto (pipeline image-text-to-text). La presencia del tag qwen3_5 apunta a una base de la familia Qwen 3.5, aunque la model card no describe la arquitectura interna, el numero de capas, la dimension oculta ni el mecanismo de atencion. El modelo incorpora un proyector multimodal separado (mmproj-OmniEdu-9B-F16.gguf) que se comparte entre las cuatro cuantizaciones y que es necesario para procesar imagenes en llama.cpp.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas especificas. La orientacion educativa se deduce del nombre y de los tags (omniedu, education), pero no se documenta que tipo de datos pedagogicos se emplearon. La conversion a GGUF se realizo con llama.cpp, herramienta estandar para este formato.

## Capacidades

- Generacion de texto conversacional (tag conversational en el repositorio).
- Comprension de imagenes combinada con texto (image-text-to-text), gracias al proyector mmproj.
- Aplicaciones orientadas a educacion, segun la denominacion y los tags del modelo.
- Ejecucion local mediante llama-server con endpoint compatible con la API de OpenAI (`/v1`), lo que permite integrarlo en clientes como Cherry Studio.
- Soporte de modo razonamiento configurable: el ejemplo de ejecucion usa `--reasoning off`, lo que sugiere que el modelo puede activar o desactivar un modo de razonamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.

## Casos de uso

- Tutoria educativa local: el modelo puede gestionar dialogos de apoyo al estudiante en un equipo con GPU consumer, usando la cuantizacion Q4_K_M (5,24 GiB) y el proyector mmproj para responder sobre ejercicios enviados como imagen.
- Correccion de ejercicios manuscritos o escaneados: la entrada image-text-to-text permite adjuntar una foto de un problema y obtener una explicacion o correccion en texto, todo en local sin enviar datos a la nube.
- Generacion de material didactico: a partir de una imagen de un diagrama o de un enunciado, el modelo puede redactar resumenes, preguntas de repaso o explicaciones paso a paso.
- Despliegue en aulas o laboratorios con hardware limitado: al ocupar entre 5,24 y 8,87 GiB segun cuantizacion, cabe en estaciones de trabajo con una sola GPU y se sirve con llama-server en el puerto 8080.
- Integracion en asistentes de escritorio: el endpoint compatible con OpenAI permite conectarlo a clientes como Cherry Studio u otras interfaces que hablen la API `/v1`, sin necesidad de infraestructura adicional.
- Prototipado de aplicaciones multimodales educativas: investigadores pueden evaluar el comportamiento del modelo en tareas de vision-lenguaje con un coste de hardware bajo antes de escalar a modelos mayores.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece BF16, Q8_0, Q6_K y Q4_K_M del mismo modelo, lo que facilita medir la perdida de calidad frente al ahorro de memoria en un caso de uso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6 GiB con Q4_K_M, 7-7,5 GiB con Q6_K, 9-9,5 GiB con Q8_0 y 17-18 GiB con BF16, sumando el proyector mmproj F16 y el contexto.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para las versiones de mayor precision; para Q4_K_M basta una GPU consumer con 8 GiB o mas.
- Cabe en GPU consumer: si; Q4_K_M en tarjetas de 8 GiB (RTX 3060 Ti, RTX 4060 Ti), Q6_K en 12 GiB (RTX 3060 12 GB, RTX 4070) y Q8_0 en 12-16 GiB.
- Opciones de despliegue: llama.cpp (llama-server), y por extension del formato GGUF, herramientas compatibles como Ollama o LM Studio; no se documenta soporte nativo de vLLM o TGI para este repositorio.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Omni-Edu-9B-GGUF | aproximadamente 9B | no disponible | texto + imagen | other | GGUF |
| Qwen2.5-VL-7B | 7B | no disponible en esta ficha | texto + imagen | Apache 2.0 (segun su model card) | safetensors, GGUF en repos derivados |
| Llama 3.2 11B Vision | 11B | no disponible en esta ficha | texto + imagen | licencia Llama | safetensors, GGUF en repos derivados |

La comparacion se limita a la categoria (modelos multimodales de 7-11B con pesos abiertos); no se dispone de datos de rendimiento del Omni-Edu-9B para establecer una comparacion cuantitativa. Los datos de los modelos alternativos deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- La licencia es "other" y remite a los terminos del modelo original; es imprescindible revisar la model card de lhpku20010120/Omni-Edu-9B antes de cualquier uso comercial.
- No se documentan los idiomas soportados; el rendimiento en castellano es desconocido.
- No se publican benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- No se detalla la composicion del dataset de entrenamiento, lo que impide evaluar sesgos conocidos; cabe esperar los sesgos habituales de los corpus web y educativos.
- Riesgo de alucinacion no cuantificado; en contextos educativos, las respuestas deben verificarse, especialmente en matematicas y datos factuales.
- La longitud de contexto nativa no se especifica; el valor `-c 8192` del ejemplo es una configuracion de llama-server, no una garantia del modelo.
- El uso de imagenes requiere descargar y cargar el proyector mmproj F16 de forma adicional; sin el, el modelo solo procesa texto.
- El repositorio tiene un numero muy bajo de descargas (386) y ningun like, lo que sugiere poca validacion por parte de la comunidad.
- El tag qwen3_5 no esta confirmado en la documentacion; la arquitectura real debe verificarse en el modelo original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/OpenDCAI/Omni-Edu-9B-GGUF
- Modelo original: https://huggingface.co/lhpku20010120/Omni-Edu-9B
- Repositorio de OpenDCAI (modelo sin cuantizar): https://huggingface.co/OpenDCAI/Omni-Edu-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
