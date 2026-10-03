# ago99/llm-jp-3.1-1.8b-v02b-GGUF

## Resumen

`ago99/llm-jp-3.1-1.8b-v02b-GGUF` es una version cuantizada y afinada de forma no oficial del modelo japones `llm-jp/llm-jp-3.1-1.8b`, desarrollado originalmente por el Research and Development Center for Large Language Models (LLMC) del National Institute of Informatics (NII) de Japon. El autor de este repositorio, el usuario `ago99`, ha aplicado un ajuste fino adicional mediante LoRA (fusionado a escala 1.00 sobre una version previa v0.2a) y ha convertido el resultado a formato GGUF en cuantizacion Q4_K_M, con el objetivo de mejorar el seguimiento de instrucciones en japones, la concision de las respuestas, la comprension lectora y la estabilidad en generaciones de longitud media y larga.

El modelo cuenta con aproximadamente 1.867 millones de parametros (1.8B) y una longitud de contexto declarada de 4096 tokens. Esta pensado para conversacion local ligera y seguimiento de instrucciones en japones, ejecutable en equipos de consumo gracias a su reducido tamano y a la cuantizacion Q4_K_M. Los idiomas declarados son japones (ja) e ingles (en). La licencia es Apache 2.0, lo que permite uso comercial, y el repositorio ocupa 1.2 GB.

Su relevancia actual radica en que ofrece una alternativa ligera, local y de codigo abierto para tareas en japones alli donde no se dispone de GPU de gran capacidad o se quiere evitar el envio de datos a servicios en la nube. Se trata, sin embargo, de un modelo experimental de comunidad, no respaldado ni certificado por el proyecto LLM-jp ni por el NII, y con limitaciones de conocimiento factual propias de su tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; etiquetado como `llama` en el repositorio (detalle de la arquitectura del modelo base no disponible) |
| Parametros totales | 1.867.614.208 (aproximadamente 1.8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (segun la model card del GGUF) |
| Tipos de cuantizacion | Q4_K_M en el archivo `v02b-Q4_K_M.gguf` |
| Idiomas soportados | Japones (ja) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `llm-jp/llm-jp-3.1-1.8b` forma parte de la serie LLM-jp-3.1 del NII, entrenada mediante preentrenamiento continuo basado en *Instruction Pre-Training*, una tecnica que refuerza la capacidad de seguir instrucciones continuando el preentrenamiento sobre una coleccion amplia de pares instruccion-respuesta. La serie LLM-jp-3, liberada desde septiembre de 2024, emplea el corpus `llm-jp-corpus v3` y abarca modelos densos de distintos tamanos (150M, 440M, 980M, 1.8B, 3.7B, 7.2B, 13B y 172B). El detalle concreto de la arquitectura (numero de capas, cabezas de atencion o tipo de atencion) no esta disponible en la informacion proporcionada.

Sobre esa base, el autor de este repositorio realizo un ajuste fino por etapas: primero una version v0.2a, sobre la que despues se entreno un adaptador LoRA v0.2b orientado a mejorar el seguimiento de instrucciones en japones, la concision, la lectura y comprension semantica, la estabilidad de respuesta y el comportamiento en generacion media y larga. Este adaptador se fusiono sobre el modelo v0.2a a escala 1.00 y el modelo resultante se convirtio a GGUF y se cuantizo a Q4_K_M. Por tanto, el repositorio contiene pesos derivados y modificados, no los pesos originales del modelo LLM-jp. No se dispone de informacion sobre el numero de tokens de entrenamiento adicional, la composicion del dataset de ajuste ni si se emplearon tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto en japones e ingles, orientada a conversacion y seguimiento de instrucciones.
- Seguimiento de instrucciones en japones, con enfasis declarado en respuestas concisas.
- Comprension lectora y semantica basica (lectura y respuesta sobre texto dado).
- Control de longitud de respuesta (evaluacion interna de control de longitud de 10/10).
- Generacion de texto de longitud media y larga con mejoras declaradas en estabilidad (colapso en texto largo de aproximadamente 1/10 en pruebas internas).
- Capacidades multilingues limitadas a japones e ingles; el modelo esta optimizado primordialmente para japones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Asistente conversacional local en japones: puede gestionar interacciones de varios turnos dentro de su ventana de 4096 tokens, ejecutandose en un portatil sin GPU dedicada gracias a su tamano de 1.8B y cuantizacion Q4_K_M.
- Generacion de respuestas cortas y concisas en japones: adecuado para formularios, respuestas de FAQ o resumenes breves, donde su orientacion a la concision y el control de longitud resultan utiles.
- Clasificacion y etiquetado de texto en japones: uso como motor de inferencia ligero para categorizar tickets, correos o comentarios, integrable en pipelines locales mediante llama.cpp.
- Experimentacion e investigacion en entornos academicos: permite estudiar tecnicas de ajuste fino por LoRA y cuantizacion GGUF sobre un modelo japones pequeno sin grandes recursos de computo.
- Prototipado rapido de aplicaciones NLP en japones: util como paso intermedio antes de escalar a modelos mayores (7B o superiores) cuando el presupuesto de hardware es limitado.
- Despliegue en el borde o en entornos air-gapped: al ser un GGUF ejecutable con llama.cpp y no requerir conexion externa, encaja en escenarios donde los datos no pueden salir de la maquina.
- Educacion y demostraciones: modelo de bajo coste para mostrar el comportamiento de un LLM japones en talleres o clases, dada su ligereza y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona unicamente mediciones internas experimentales, realizadas antes de la cuantizacion GGUF, que no deben interpretarse como puntuaciones de referencia estandarizadas:

| Prueba interna | Resultado |
|---|---|
| Stress test | 180 / 200 |
| Knowledge test | 257 / 300 |
| Strict instruction test | 16 / 20 |
| Length control | 10 / 10 |
| Long-form collapse | aproximadamente 1 / 10 |

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, un modelo de 1.8B ocupa aproximadamente 1,1-1,2 GB de pesos (el repositorio completo pesa 1,2 GB), por lo que suele bastar con entre 2 y 3 GB de VRAM para inferencia comoda con algo de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060 o superiores); tambien es viable en GPUs profesionales como A100 o H100, aunque sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en CPU (con velocidad reducida) y en sistemas con memoria unificada tipo Apple Silicon.
- Opciones de despliegue: llama.cpp y sus envoltorios (llama-cpp-python, Ollama, LM Studio, text-generation-webui) al ser formato GGUF; el soporte en vLLM o TGI para GGUF puede ser limitado o parcial.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `ago99/llm-jp-3.1-1.8b-v02b-GGUF` (este modelo) | 1.8B | 4096 | ja, en | Apache 2.0 | GGUF (Q4_K_M) |
| `llm-jp/llm-jp-3.1-1.8b` (modelo base) | 1.8B | No disponible | ja, en | Apache 2.0 | safetensors |
| `llm-jp/llm-jp-3-1.8b` (version anterior de la serie) | 1.8B | No disponible | ja, en | No disponible | No disponible |
| Alternativas de otros desarrolladores (p. ej. modelos densos de ~1-2B) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmark comparativos publicados en la informacion proporcionada que permitan situar este modelo frente a alternativas de tamano similar.

## Limitaciones y advertencias

- Modelo de 1.8B parametros: el conocimiento factual y la cobertura tematica son limitados en comparacion con modelos mayores.
- Riesgo de alucinacion: puede generar informacion incorrecta, especialmente sobre entidades ficticias o desconocidas, y hacerlo con aparente seguridad.
- Las explicaciones largas pueden contener errores factuales; el propio autor recomienda verificacion externa o recuperacion de informacion para datos actuales.
- No debe utilizarse para decisiones medicas, legales, financieras, de seguridad o de alto riesgo.
- Sesgos conocidos: no disponible (no se documentan sesgos especificos en la informacion proporcionada).
- Limitaciones de idioma: optimizado para japones; el soporte de ingles puede ser menos fiable y otras lenguas no estan soportadas de forma declarada.
- Limitacion de contexto: 4096 tokens, inferior a la de muchos modelos contemporaneos, lo que restringe conversaciones o documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se trata de un derivado no oficial; el proyecto LLM-jp y el NII no avalan ni certifican este modelo.
- Advertencia para produccion: es un modelo experimental de comunidad, con 0 descargas y 1 like en el momento de la consulta; conviene validarlo exhaustivamente antes de cualquier uso en produccion.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/ago99/llm-jp-3.1-1.8b-v02b-GGUF
- Modelo base: https://huggingface.co/llm-jp/llm-jp-3.1-1.8b
- Serie LLM-jp-3 (version 1.8B anterior): https://huggingface.co/llm-jp/llm-jp-3-1.8b
- Anuncio de la serie LLM-jp-3.1 Instruct4 (LLM-jp / NII): https://llm-jp.nii.ac.jp/en/news/release-of-llm-jp-3-1-series-instruct4/
- Directorio de modelos GGUF (Local AI Zone): https://local-ai-zone.github.io/
- Seguimiento de actualizaciones de LLM (octubre de 2026): https://lmmarketcap.com/llm-updates
