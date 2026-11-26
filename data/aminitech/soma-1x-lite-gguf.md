# AminiTech/Soma-1X-lite-GGUF

## Resumen

Soma-1X-lite-GGUF es la distribucion en formato GGUF de Soma-1X Lite, un modelo vision-lenguaje de aproximadamente 1.880 millones de parametros desarrollado por AminiTech y orientado especificamente al analisis de documentos: OCR, deteccion de layout, reconocimiento de tablas y lectura de texto manuscrito. El modelo base se publica bajo licencia Apache 2.0 y esta disenado para ejecutarse en una unica GPU o incluso en CPU mediante llama.cpp y Ollama, lo que lo situa en la categoria de modelos de "document intelligence" de consumo local.

La relevancia de esta version GGUF radica en que empaqueta los pesos en cuantizaciones Q8_0 (2,0 GB) y BF16 (3,8 GB), junto con un codificador visual separado en F16 (0,7 GB), permitiendo despliegues en hardware modesto sin depender de infraestructura en la nube. El modelo declara soporte para trece idiomas, con enfasis notable en lenguas africanas (swahili, yoruba, hausa, wolof, lingala, xhosa, afrikaans, kinyarwanda, chichewa y sango) ademas de ingles, frances y espanol.

La ficha tecnica del autor indica que el modelo requiere instrucciones especificas de sistema y usuario, con el modo "thinking" desactivado, y advierte que las cuantizaciones de 4 bits degradan la deteccion de layout, por lo que no se distribuyen. El contexto anunciado es de 32.768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (transformer multimodal); compatible con Qwen3.5 segun llama.cpp |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q8_0 (2,0 GB), BF16 (3,8 GB); codificador visual F16 (0,7 GB); 4 bits no disponible (degradacion de layout) |
| Idiomas soportados | en, fr, es, sw, yo, ha, wo, ln, xh, af, rw, ny, sg |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama); modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna mas alla de que se trata de un modelo vision-lenguaje de tipo image-text-to-text con un codificador visual separado (mmproj). El comando de llama.cpp indica que requiere una build reciente con soporte para Qwen3.5, lo que sugiere una base de transformer con atencion estandar y un proyector multimodal que inyecta tokens de imagen en el flujo de texto. El rango de tokens de imagen configurable (minimo 64, maximo 16.384) confirma un esquema de tokenizacion visual adaptable a la resolucion del documento.

No se han publicado en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. El modelo se distribuye con dos ficheros de prompt (`system_prompt.txt` y `user_prompt.txt`) que reproducen las instrucciones exactas del entrenamiento, lo que sugiere un ajuste de instrucciones especifico para tareas de parsing documental. El autor advierte que el modelo funciona con el modo de razonamiento (thinking) desactivado.

## Capacidades

- Parsing de documentos: extraccion de bloques de layout con su texto asociado a partir de imagenes de paginas.
- OCR: reconocimiento de texto impreso y manuscrito.
- Analisis de layout: identificacion de regiones estructurales de la pagina.
- Reconocimiento de tablas: extraccion de contenido tabular.
- Vision-lenguaje multimodal: entrada de imagen y texto, salida de texto estructurado.
- Soporte multilingue en trece idiomas, con cobertura destacada de lenguas africanas.
- Integracion con tooling local: llama.cpp, Ollama, API compatible con OpenAI.
- Modo thinking configurable (desactivado por defecto en el uso recomendado).
- No se documenta soporte explicito de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Digitalizacion de archivos historicos manuscritos: el modelo reconoce escritura manual y devuelve bloques de texto, adecuado para bibliotecas y archivos que necesitan transcribir documentos escaneados sin salida a servicios en la nube.
- Extraccion de tablas en informes financieros: con reconocimiento de tablas y layout, permite convertir PDFs escaneados en estructuras tabulares procesables en pipelines de datos.
- Procesamiento de documentos multilingues en Africa subsahariana: al cubrir swahili, yoruba, hausa, wolof, xhosa y otras lenguas, sirve para digitalizar formularios y actas administrativas en contextos donde los modelos generalistas rinden mal.
- Despliegue en CPU para entornos con recursos limitados: los 2,0 GB del Q8_0 y la ejecucion via llama.cpp permiten montar un servicio de parsing en un servidor sin GPU.
- Automatizacion de facturas y albaranes: el modelo puede recibir la imagen de un documento y devolver bloques con texto, integrándose en un flujo de validacion posterior.
- OCR local con Ollama para equipos de desarrollo: mediante `ollama create` y el Modelfile incluido, se puede levantar un endpoint compatible con la API de Ollama en una estacion de trabajo.
- Procesamiento por lotes de documentos escaneados: el contexto de 32K tokens y el rango de tokens de imagen de hasta 16.384 permiten manejar paginas densas en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que en sus comprobaciones contra el modelo original en Hugging Face Transformers, las builds Q8_0 y BF16 produjeron salidas casi identicas, y que las cuantizaciones de 4 bits degradaron la deteccion de layout.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,7 GB en Q8_0 (2,0 GB de pesos + 0,7 GB de codificador visual); aproximadamente 4,5 GB en BF16 (3,8 GB + 0,7 GB).
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM para Q8_0 (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas; tambien funciona en CPU segun el autor.
- Opciones de despliegue: llama.cpp (`llama-server` con `-hf`), Ollama (via Modelfile), API compatible con OpenAI en el puerto 8080.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Soma-1X-lite-GGUF | ~1,88 B | 32.768 | Apache 2.0 | GGUF | Vision-lenguaje para parsing documental, multilingue africano |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se han identificado modelos comparables en la informacion proporcionada |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Las cuantizaciones de 4 bits degradan la deteccion de layout segun el autor; no se distribuyen y no se recomienda su uso.
- El modelo requiere un system prompt y un user prompt especificos, incluidos en el repositorio; usarlo con otras instrucciones puede degradar la calidad.
- Es obligatorio desactivar el modo thinking; de lo contrario, Ollama devuelve la salida en el campo `thinking` y deja el contenido vacio.
- Requiere una build reciente de llama.cpp con soporte para Qwen3.5; versiones antiguas no funcionaran.
- Riesgo de alucinacion en OCR y tablas: no se documentan tasas de error ni garantias de fidelidad en la extraccion.
- Sesgos conocidos: no documentados en la informacion disponible.
- La cobertura de idiomas declarada no implica calidad homogenea; no se aportan metricas por idioma.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales de uso responsable.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/AminiTech/Soma-1X-lite-GGUF
- Modelo base: https://huggingface.co/AminiTech/Soma-1X-lite
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
