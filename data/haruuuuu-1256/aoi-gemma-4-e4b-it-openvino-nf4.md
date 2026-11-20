# haruuuuu-1256/aoi-gemma-4-E4B-it-OpenVINO-NF4

## Resumen

aoi-gemma-4-E4B-it-OpenVINO-NF4 es una cuantizacion del modelo aoi-gemma-4-E4B-it, un ajuste fino de Gemma (familia "gemma4" segun los tags del autor) orientado a roleplay y personajes en japones. El autor, haruuuuu-1256, publica esta version exportada a OpenVINO mediante optimum-intel y NNCF, con pesos NF4 en el modelo de lenguaje e INT8 en embeddings y codificador de imagen. El objetivo es ejecutar el modelo en hardware Intel, con especial atencion a la NPU de los procesadores Lunar Lake (Core Ultra 200V) y posteriores.

El modelo es multimodal de tipo image-text-to-text: acepta entradas de imagen y texto y genera respuestas conversacionales. El repositorio ocupa 6,4 GB y esta pensado para despliegue local con OpenVINO GenAI, no para entrenamiento. La licencia es Apache-2.0, heredada del modelo base.

La relevancia actual radica en que demuestra un flujo de cuantizacion NF4 sobre OpenVINO para modelos conversacionales con vision, un terreno donde historicamente han dominado formatos como GGUF o AWQ. Aun asi, se trata de un artefacto de nicho: cero descargas y cero likes en el momento de la consulta, idioma unico japones y NPU sin verificar por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma; se desconoce si es transformer denso o MoE) |
| Parametros totales | no disponible (el nombre "E4B" sugiere ~4B efectivos, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 por canal, simetrica, todas las capas del LM; INT8 en embeddings (de palabra y por capa) y codificador de imagen |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (exportado con optimum-intel 2.2.0, OpenVINO 2026.4.1, NNCF 3.4.0) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base aoi-gemma-4-E4B-it: la model card no detalla si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni especifica el numero de parametros, la longitud de contexto o la composicion del dataset de entrenamiento. El nombre "gemma-4-E4B" sugiere una variante de la familia Gemma con aproximadamente 4.000 millones de parametros efectivos, pero este dato no esta confirmado en la informacion proporcionada. Tampoco se documenta si hubo RLHF, DPO u otra fase de alineacion.

Lo que si se describe es el proceso de cuantizacion y exportacion: el modelo se convirtio con el comando `optimum-cli export openvino --task image-text-to-text --weight-format nf4 --sym --group-size -1 --ratio 1.0`, lo que aplica NF4 simetrica por canal a todas las capas del modelo de lenguaje (sin agrupacion, group-size -1) y deja en INT8 los embeddings y el codificador de imagen. El resultado son 6,38 GB de pesos en formato OpenVINO IR, listos para inferencia con OpenVINO GenAI en NPU, GPU o CPU.

## Capacidades

- Generacion de texto conversacional en japones, con enfasis en mantener una persona de personaje consistente a lo largo de turnos.
- Entrada multimodal image-text-to-text: procesa imagenes junto con texto mediante el codificador de imagen en INT8.
- Roleplay y character chat: el ajuste fino del modelo base esta orientado a interpretar un personaje concreto (los detalles se remiten a la pagina del modelo original).
- Inferencia en dispositivos Intel: soporte declarado para NPU, GPU y CPU a traves de OpenVINO GenAI.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- El modo de razonamiento (thinking mode) existe en la plantilla de chat pero el autor recomienda explicitamente no usarlo; la plantilla lo desactiva por defecto.
- Multilingue: no, el modelo declara unicamente japones.

## Casos de uso

- Chat de personaje en japones en local: el modelo esta ajustado para mantener una persona concreta y la evaluacion del autor (1 fallo de personaje en 80 generaciones con temperatura 0,7) indica una estabilidad razonable para conversaciones de roleplay en escritorio.
- Asistente conversacional con entrada de imagen en japones: al ser image-text-to-text, puede recibir una captura o foto y responder sobre ella dentro de una conversacion, util para prototipos de asistencia visual en japones.
- Despliegue en portatiles con NPU Intel Lunar Lake: el formato OpenVINO NF4 permite ejecutar el modelo en el acelerador NPU de los Core Ultra 200V, liberando CPU y GPU para otras tareas en un portatil.
- Prototipado de experiencias de personaje en aplicaciones de escritorio: la API de OpenVINO GenAI (`VLMPipeline`) permite integrar el modelo en una app Python local sin servicio en la nube, con generacion configurable (max_new_tokens, temperature, top_p, top_k).
- Evaluacion de pipelines de cuantizacion NF4 sobre OpenVINO: sirve como referencia practica para equipos que quieran replicar el flujo `optimum-cli export openvino` con `--weight-format nf4` sobre sus propios modelos multimodales.
- Experimentacion academica con modelos pequenos en japones: al ocupar 6,38 GB y licencia Apache-2.0, es viable para investigacion sobre consistencia de personaje y calidad de respuesta en modelos de ~4B en un solo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion aportado por el autor es una prueba propia de estabilidad de personaje en CPU: 10 preguntas propensas a la ruptura de personaje, repetidas 8 veces con temperatura 0,7, con 1 fallo en 80 generaciones (1/80).

## Requisitos de hardware

- VRAM/almacenamiento: el repositorio pesa 6,4 GB en disco; en memoria, la inferencia requiere cargar los pesos NF4 del LM mas los embeddings y el codificador de imagen en INT8, por lo que se necesita un margen por encima de los 6,4 GB.
- NPU: pensado para Intel NPU de Lunar Lake (Core Ultra 200V) o posteriores, unico rango que soporta NF4 en NPU segun el autor. En NPU anteriores hay que usar CPU o GPU.
- CPU: verificado por el autor; es el unico backend con el que se ha probado la generacion.
- GPU: soportada por la API (`"GPU"` como dispositivo), sin resultados de rendimiento publicados.
- No se documenta compatibilidad con GPU NVIDIA ni con llama.cpp, Ollama, vLLM o TGI; el unico runtime descrito es OpenVINO GenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria (modelos conversacionales multimodales de ~4B en japones o cuantizaciones OpenVINO comparables).

## Limitaciones y advertencias

- NPU sin verificar: el autor declara explicitamente que no ha confirmado el funcionamiento en NPU; solo CPU esta probado. El soporte NF4 en NPU requiere Lunar Lake o posterior.
- Idioma unico: el modelo solo declara japones; su uso en castellano u otros idiomas no esta soportado ni evaluado.
- Modo de razonamiento desaconsejado: el autor pide no usar thinking mode, lo que limita tareas que se beneficien de razonamiento explicito.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; en un modelo pequeno orientado a roleplay el riesgo es alto y no debe usarse como fuente de informacion.
- Sesgos: no documentados; al ser un ajuste fino de personaje en japones, puede reproducir sesgos culturales y de genero propios de los datos de roleplay.
- Ecosistema limitado: solo OpenVINO; no hay versiones GGUF ni integracion con runtimes habituales, lo que restringe el despliegue fuera de hardware Intel.
- Madurez: cero descargas y cero likes en el momento de la consulta; es un artefacto reciente y sin validacion de la comunidad.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento pueden imponer condiciones adicionales no detalladas en esta ficha; conviene revisar la pagina del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/haruuuuu-1256/aoi-gemma-4-E4B-it-OpenVINO-NF4
- Modelo base: https://huggingface.co/haruuuuu-1256/aoi-gemma-4-E4B-it
- OpenVINO GenAI (runtime): no disponible en la informacion proporcionada
- optimum-intel: no disponible en la informacion proporcionada
- NNCF: no disponible en la informacion proporcionada
