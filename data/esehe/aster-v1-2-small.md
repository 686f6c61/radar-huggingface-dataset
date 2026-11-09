# esehe/Aster-v1.2-small

## Resumen

Aster-v1.2-small es un modelo de lenguaje en formato ONNX publicado por el usuario esehe en Hugging Face, especializado en japones y distribuido bajo licencia Apache-2.0. El repositorio contiene unicamente pesos en formato ONNX (int8 y fp32) junto con un fichero de vocabulario en TSV codificado en hexadecimal, lo que indica que esta pensado para inferencia en entornos ONNX Runtime mas que para pipelines de transformers convencionales. El tamano del repositorio es de aproximadamente 0,1 GB.

El modelo se presenta como un derivado por destilacion de zenz-v3.2-small (Apache-2.0), cuyas salidas de conversion se usaron como parte del objetivo de entrenamiento. El punto de partida fue un modelo propio preentrenado llamado shion-v4.2-small, que no es publico. Esto lo situa como un modelo pequeno de proposito general para japones, con enfasis en correccion de texto (el origen zenz esta orientado a conversion kana-kanji), aunque la model card no explicita la tarea exacta.

La relevancia practica es limitada pero concreta: se trata de un modelo de muy bajo peso (29 MB en int8) que puede ejecutarse en CPU y en dispositivos con recursos restringidos, lo que lo hace util para tareas de procesamiento de texto japones en local. No se han publicado especificaciones de arquitectura, numero de parametros ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (solo se indica que deriva de shion-v4.2-small, no publico) |
| Parametros totales | no disponible (el fichero fp32 ocupa aproximadamente 107 MB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (aproximadamente 29 MB) y fp32 (aproximadamente 107 MB) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con fichero manifest JSON y vocabulario en TSV hexadecimal) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Se sabe que el modelo parte de un preentrenamiento propio denominado shion-v4.2-small, que no es publico, y que se entreno con destilacion usando como profesor zenz-v3.2-small (Apache-2.0) a traves de sus salidas de conversion, empleadas como parte del objetivo de entrenamiento. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El corpus de entrenamiento declarado incluye FineWeb-2 en japones (ODC-BY 1.0), Wikipedia en japones (CC BY-SA 4.0), Wikibooks y Wiktionary en japones (CC BY-SA 4.0), Wikinews en japones (CC BY 2.5), Aozora Bunko, Tatoeba (CC BY 2.0 FR), libros blancos del gobierno japones (Government Standard Terms of Use 2.0) y aproximadamente un 1 % de texto sintetico generado con LLMs bajo licencia Apache-2.0 via DeepInfra. No se documentan innovaciones tecnicas adicionales como atencion lineal o decodificacion especulativa.

## Capacidades

- Generacion y procesamiento de texto en japones, segun el unico idioma declarado en la model card.
- Conversión de texto de entrada/salida, dado que el profesor de destilacion (zenz-v3.2-small) esta orientado a conversion kana-kanji; la model card no confirma explicitamente esta capacidad.
- Inferencia via ONNX Runtime en CPU, gracias a los formatos int8 y fp32 publicados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del japones.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Correccion y normalizacion de texto japones en local: el modelo, con 29 MB en int8, puede integrarse en aplicaciones de escritorio o moviles que necesiten procesar texto japones sin conexion a servicios en la nube.
- Preprocesamiento de corpus japoneses: util para tareas de limpieza o conversion de texto en pipelines de NLP que requieran un modelo ligero ejecutable en CPU.
- Prototipado rapido en entornos ONNX: al publicarse pesos ONNX con manifest, se puede desplegar con ONNX Runtime sin necesidad de convertir desde safetensors ni instalar transformers.
- Aplicaciones embebidas con restricciones de memoria: el fichero int8 de aproximadamente 29 MB cabe en dispositivos con RAM muy limitada, lo que permite inferencia en Raspberry Pi o similares.
- Experimentacion academica con destilacion: al documentarse el profesor (zenz-v3.2-small) y el corpus, sirve como referencia para estudiar destilacion en japones con modelos pequenos.
- Filtrado o clasificacion ligera de texto japones: para tareas de baja complejidad donde no se justifica un modelo grande, el coste computacional es minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El fichero int8 ocupa aproximadamente 29 MB y el fp32 aproximadamente 107 MB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no disponible. El formato ONNX permite ejecucion en CPU y en GPU mediante ONNX Runtime, pero no se especifican GPUs probadas.
- Cabe en GPU consumer: si, con cualquier GPU consumer moderna, dado el tamano del fichero; tambien cabe en CPU.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aster-v1.2-small | no disponible (aprox. 107 MB en fp32) | no disponible | Apache-2.0 | ONNX | Destilado de zenz-v3.2-small, solo japones |
| zenz-v3.2-small | no disponible | no disponible | Apache-2.0 | GGUF | Profesor de destilacion, orientado a conversion kana-kanji |
| shion-v4.2-small | no disponible | no disponible | no disponible (no publico) | no disponible | Modelo base de preentrenamiento, no publicado |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta japones; no se declara ningun otro idioma.
- No se publican especificaciones de arquitectura, parametros ni contexto, lo que dificulta evaluar su idoneidad para tareas concretas.
- No hay benchmarks publicados, por lo que no se puede comparar su calidad con alternativas.
- El modelo base de preentrenamiento (shion-v4.2-small) no es publico, lo que limita la reproducibilidad.
- El uso de texto sintetico (aproximadamente un 1 % del corpus) y de salidas de otro modelo como objetivo de destilacion puede introducir sesgos heredados del profesor.
- Riesgo de alucinacion no cuantificado; al ser un modelo pequeno, es esperable una fiabilidad limitada en tareas complejas.
- Aunque la licencia es Apache-2.0, los corpus de entrenamiento tienen licencias variadas (CC BY-SA, ODC-BY, etc.) que pueden imponer obligaciones de atribucion o compartir-igual en obras derivadas; conviene revisar la compatibilidad antes de uso comercial.
- El repositorio tiene muy pocas descargas (13) y ningun like, lo que sugiere escasa validacion por parte de la comunidad.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines agenticos.

## Enlaces

- Hugging Face: https://huggingface.co/esehe/Aster-v1.2-small
- Modelo profesor (zenz-v3.2-small): https://huggingface.co/Miwa-Keita/zenz-v3.2-small-gguf
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Aozora Bunko: https://www.aozora.gr.jp/
- Tatoeba: https://tatoeba.org/
