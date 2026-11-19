# openbmb/MiniCPM-V-4_5-gguf

## Resumen

MiniCPM-V 4.5 es un modelo de lenguaje multimodal (MLLM) desarrollado por OpenBMB, un grupo de investigacion asociado a la Universidad de Tsinghua. Se construye sobre el modelo de lenguaje Qwen3-8B y el codificador visual SigLIP2-400M, sumando un total de 8.189 millones de parametros. Su proposito es ofrecer comprension de imagen unica, multiples imagenes y video con una calidad que el autor situa al nivel de GPT-4o, pero con un tamano lo bastante reducido como para ejecutarse en dispositivos locales, incluidos telefonos moviles.

La relevancia del modelo radica en su eficiencia: introduce un 3D-Resampler unificado para imagenes y video que logra una compresion de hasta 96x en tokens de video (6 fotogramas de 448x448 se comprimen en 64 tokens, frente a los 1.536 habituales), lo que permite comprension de video a alta tasa de refresco (hasta 10 FPS) sin incrementar el coste de inferencia del LLM. Ademas, soporta un modo de pensamiento rapido/profundo conmutable de forma controlada, y destaca en OCR y analisis de documentos, superando segun el autor a GPT-4o-latest y Gemini 2.5 en OCRBench.

Esta ficha corresponde especificamente al repositorio de pesos cuantizados en formato GGUF (`openbmb/MiniCPM-V-4_5-gguf`), pensado para inferencia eficiente en CPU con llama.cpp y Ollama, asi como para despliegues de alto rendimiento con vLLM y SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM basada en Qwen3-8B (LLM) + SigLIP2-400M (vision), con 3D-Resampler y arquitectura LLaVA-UHD para imagenes de alta resolucion |
| Parametros totales | 8.189.195.264 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (este repo), int4 y AWQ (en repos separados), 16 tamanos disponibles |
| Idiomas soportados | Multilingue (mas de 30 idiomas) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo base en safetensors) |

## Arquitectura y entrenamiento

MiniCPM-V 4.5 combina un codificador visual SigLIP2-400M con un LLM Qwen3-8B. La arquitectura visual sigue el diseno LLaVA-UHD, que permite procesar imagenes de alta resolucion con cualquier relacion de aspecto y hasta 1,8 millones de pixeles (por ejemplo, 1344x1344) usando cuatro veces menos tokens visuales que la mayoria de MLLMs. La innovacion principal es un 3D-Resampler unificado que opera tanto sobre imagenes como sobre video, comprimiendo los tokens visuales de forma agresiva: hasta 96x en video, de modo que seis fotogramas de 448x448 se reducen a 64 tokens.

El entrenamiento se apoya en tecnicas de alineacion como RLAIF-V (cuyo dataset, `openbmb/RLAIF-V-Dataset`, figura en los metadatos) y VisCPM, orientadas a mejorar la veracidad y reducir alucinaciones, ademas de habilitar capacidades multilingues. El modelo soporta un modo de pensamiento hibrido rapido/profundo que puede conmutarse de forma controlada segun el escenario de uso. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento ni de la composicion detallada del dataset.

## Capacidades

- Comprension de imagen unica, multiples imagenes y video.
- OCR de alta precision y analisis de documentos PDF (rendimiento lider segun el autor en OCRBench y OmniDocBench entre MLLMs generales).
- Comprension de video a alta tasa de refresco (hasta 10 FPS) y video de larga duracion (Video-MME, LVBench, MLVU, MotionBench, FavorBench).
- Modo de pensamiento hibrido rapido/profundo conmutable de forma controlada.
- Capacidades multilingues en mas de 30 idiomas.
- Comportamiento orientado a la veracidad (RLAIF-V), con resultados superiores a GPT-4o-latest en MMHal-Bench segun el autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion y analisis de documentos: el modelo procesa imagenes de alta resolucion (hasta 1,8 Mpx) con cualquier relacion de aspecto y cuatro veces menos tokens visuales, lo que lo hace adecuado para extraer texto y estructura de facturas, formularios y PDF escaneados.
- OCR en produccion: gracias a su rendimiento en OCRBench, puede integrarse en pipelines de captura de texto de imagenes en aplicaciones moviles o de escritorio, ejecutandose en CPU mediante GGUF.
- Analisis de video de vigilancia o deportes: el 3D-Resampler permite procesar video a hasta 10 FPS con un coste de tokens reducido, util para resumir eventos o detectar acciones en grabaciones largas.
- Asistencia en dispositivos moviles: al caber en telefonos y tablets (hay demo oficial en iOS para iPhone/iPad), permite funciones de vision por computador sin enviar datos a la nube, con implicaciones de privacidad.
- Descripcion de imagenes para accesibilidad: generacion de descripciones detalladas y multilingues de imagenes para lectores de pantalla, aprovechando el soporte de mas de 30 idiomas.
- Analisis de multiples imagenes comparativas: comparacion de productos, revision de capturas de pantalla o evaluacion de imagenes medicas en lote, gracias al soporte multi-imagen.
- Razonamiento visual complejo: el modo de pensamiento profundo permite resolver problemas que requieren cadenas de razonamiento sobre contenido visual, como interpretar diagramas o graficos.
- Despliegue en local con llama.cpp/Ollama: para entornos sin GPU o con requisitos de soberania de datos, el formato GGUF permite inferencia en CPU.

## Benchmarks y rendimiento

Segun el autor, MiniCPM-V 4.5 obtiene una puntuacion media de 77,2 en OpenCompass (evaluacion sobre 8 benchmarks populares), superando a GPT-4o-latest, Gemini-2.0 Pro y Qwen2.5-VL 72B en capacidades vision-lenguaje, lo que lo situaria como el MLLM mas rendidor por debajo de 30B parametros. Tambien afirma rendimiento lider en OCRBench (por encima de GPT-4o-latest y Gemini 2.5) y en OmniDocBench entre MLLMs generales, y superior a GPT-4o-latest en MMHal-Bench. Los resultados numericos detallados por benchmark no estan disponibles en el texto proporcionado (se referencian en imagenes del repositorio).

| Benchmark | Resultado | Comparativa indicada por el autor |
|---|---|---|
| OpenCompass (media de 8 benchmarks) | 77,2 | Supera a GPT-4o-latest, Gemini-2.0 Pro y Qwen2.5-VL 72B |
| OCRBench | no disponible (lider segun autor) | Supera a GPT-4o-latest y Gemini 2.5 |
| OmniDocBench | no disponible (SOTA entre MLLMs generales) | - |
| MMHal-Bench | no disponible | Supera a GPT-4o-latest |
| Video-MME / LVBench / MLVU / MotionBench / FavorBench | no disponible (SOTA segun autor) | - |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de 8B en GGUF, las cuantizaciones tipicas (Q4, Q5, Q8) permiten ejecucion en CPU con RAM modesta, aunque el autor no publica cifras concretas.
- GPU recomendadas: no disponible en la informacion proporcionada; el autor menciona soporte para vLLM y SGLang en despliegues de alto rendimiento.
- Cabe en GPU de consumo: si, segun el enfoque del modelo (disenado para ejecutarse en telefonos y dispositivos locales); el autor demuestra su funcionamiento en un iPad M4 mediante la demo iOS.
- Opciones de despliegue: llama.cpp, Ollama (inferencia en CPU), vLLM y SGLang (alto rendimiento), Transformers, LLaMA-Factory (fine-tuning), Gradio WebUI, app iOS.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.5 | 8B | no disponible | 77,2 en OpenCompass; lider en OCRBench segun autor | no disponible | GGUF, int4, AWQ, safetensors |
| GPT-4o-latest | no disponible (propietario) | no disponible | Referencia propietaria; superado por MiniCPM-V 4.5 en OpenCompass y OCRBench segun el autor | propietaria | API |
| Gemini-2.0 Pro | no disponible (propietario) | no disponible | Referencia propietaria; superado por MiniCPM-V 4.5 en OpenCompass segun el autor | propietaria | API |
| Qwen2.5-VL 72B | 72B | no disponible | Superado por MiniCPM-V 4.5 en OpenCompass segun el autor | no disponible | pesos abiertos |

## Limitaciones y advertencias

- La licencia no esta disponible en la informacion proporcionada; es imprescindible verificar los terminos del repositorio base antes de un uso comercial.
- Los benchmarks citados proceden del propio autor y se presentan como imagenes; no se han podido verificar los numeros detallados por benchmark.
- Riesgo de alucinacion: aunque el modelo incorpora tecnicas RLAIF-V para mejorar la veracidad, como todo MLLM puede generar descripciones o transcripciones inexactas, especialmente en documentos de baja calidad o imagenes ambiguas.
- La longitud de contexto no esta documentada en la informacion disponible, lo que dificulta planificar cargas de trabajo con entradas muy largas.
- El rendimiento en video de alta tasa de refresco depende de la compresion del 3D-Resampler; escenas con movimiento rapido o detalles finos pueden perder informacion.
- El soporte de tool calling y de agentes no esta confirmado en la documentacion proporcionada.
- El repositorio GGUF esta pensado para inferencia; para fine-tuning conviene usar los pesos en Transformers o LLaMA-Factory.
- El tamano del repositorio (76,2 GB) refleja multiples cuantizaciones; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/openbmb/MiniCPM-V-4_5-gguf
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4_5
- Version int4: https://huggingface.co/openbmb/MiniCPM-V-4_5-int4
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki (chino): https://openbmb.cn/docs/
- Demo online: http://101.126.42.235:30910/
- Paper LLaVA-UHD: https://arxiv.org/pdf/2403.11703
- RLAIF-V: https://github.com/RLHF-V/RLAIF-V/
- VisCPM: https://github.com/OpenBMB/VisCPM
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo iOS: https://github.com/tc-mb/MiniCPM-o-demo-iOS
- Dataset RLAIF-V: https://huggingface.co/datasets/openbmb/RLAIF-V-Dataset
