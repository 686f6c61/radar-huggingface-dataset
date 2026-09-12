# olusegunola/phi-1.5-primekg-vanillakd-seed2024

## Resumen

`olusegunola/phi-1.5-primekg-vanillakd-seed2024` es un ajuste fino publicado en Hugging Face por el usuario olusegunola. El repositorio no aporta practicamente ninguna documentacion tecnica: la model card es la plantilla automatica que genera la libreria `transformers`, con todos los campos relevantes sin rellenar (`[More Information Needed]`). No se declara licencia, idiomas, pipeline, datos de entrenamiento, hiperparametros ni resultados de evaluacion.

El identificador del repositorio sugiere tres cosas, ninguna de ellas confirmada por la documentacion: que parte del modelo phi-1.5 de Microsoft Research (un transformer decoder-only de aproximadamente 1.300 millones de parametros), que se ha ajustado con PrimeKG (un grafo de conocimiento de medicina de precision que integra genes, proteinas, farmacos, enfermedades y fenotipos) y que la tecnica empleada es destilacion de conocimiento clasica (*vanilla knowledge distillation*) con semilla 2024. Se trata, por tanto, de una hipotesis derivada del nombre del repositorio, no de un dato verificado.

El modelo es relevante unicamente como artefacto de investigacion a inspeccionar: acumula 0 descargas y 0 *likes*, no tiene pipeline declarado y el tamano del repositorio (0,1 GB) es incompatible con el peso en fp16 de un modelo de 1.300 millones de parametros (unos 2,6 GB), lo que apunta a un *checkpoint* incompleto o a pesos no descargables. No es un modelo recomendable para produccion sin una validacion previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferido del modelo base phi-1.5; no documentado en el repositorio) |
| Parametros totales | Aproximadamente 1.300 millones (1,3 B) si se confirma la base phi-1.5; no disponible en la documentacion del repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens segun phi-1.5; no confirmado para este ajuste |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | No disponible (phi-1.5 esta entrenado predominantemente en ingles) |
| Licencia | No disponible en el repositorio (el modelo base phi-1.5 se publica bajo licencia MIT) |
| Formato de pesos | safetensors (etiqueta declarada del repositorio) |
| Tamano del repositorio | 0,1 GB |
| Libreria declarada | transformers |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-11 (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

No hay informacion publicada en el repositorio sobre la arquitectura efectiva, el procedimiento de entrenamiento, el numero de tokens, la composicion del dataset ni el uso de RLHF, DPO o cualquier otra fase de alineamiento. La model card no incluye hiperparametros, regimen de precision (fp32, bf16, fp16), hardware utilizado ni coste computacional.

Si se acepta la hipotesis derivada del nombre, el punto de partida seria phi-1.5: un transformer decoder-only de 1.300 millones de parametros entrenado por Microsoft Research sobre aproximadamente 30.000 millones de tokens de datos sinteticos de tipo "libro de texto" combinados con datos web filtrados, con una fase ligera de alineamiento. Sobre esa base, el ajuste se habria realizado contra PrimeKG mediante destilacion de conocimiento clasica, un esquema en el que un modelo profesor (o las representaciones del propio grafo) guia al modelo estudiante para incorporar relaciones biomedicas. La semilla 2024 sugiere que se trata de una ejecucion concreta dentro de una bateria de experimentos reproducibles. Ninguno de estos detalles esta verificado en la documentacion disponible.

## Capacidades

- Generacion de texto en ingles: capacidad esperable si el modelo base es phi-1.5, limitada a un contexto de 2.048 tokens. No confirmado.
- Razonamiento basico y matematicas elementales: phi-1.5 destaca en tareas de razonamiento de tipo *grade school* por su entrenamiento con datos sinteticos tipo libro de texto. No confirmado para este ajuste.
- Generacion de codigo: phi-1.5 maneja Python a nivel introductorio. No confirmado.
- Modelado de relaciones biomedicas: capacidad objetivo del presunto ajuste con PrimeKG (asociaciones farmaco-enfermedad, gen-enfermedad, interacciones). No confirmado.
- Soporte de *tool calling* / *function calling*: no disponible; phi-1.5 no incluye plantilla de herramientas nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ninguna capacidad agentica ni *thinking mode*.
- Capacidades multilingues: no disponible; el modelo base esta centrado en ingles.
- Vision, audio u otras modalidades: no disponibles.
- Modo de razonamiento explicito (*thinking mode*): no disponible.

## Casos de uso

Todos los casos siguientes son hipoteticos y presuponen que el ajuste con PrimeKG se ha completado correctamente y que los pesos son descargables y funcionales, extremos que no se ha podido verificar.

- Extraccion de relaciones biomedicas: uso del modelo como extractor ligero de tripletas (gen, enfermedad, farmaco) sobre resumenes de PubMed, aprovechando su presunto ajuste sobre PrimeKG para normalizar terminologia.
- Preanotacion de literatura cientifica: generacion de borradores de anotaciones que un curador humano revisa despues, reduciendo el coste de anotacion manual en bases de datos de medicina de precision.
- *Prototipado* de asistentes de preguntas y respuestas biomedicas: dado el tamano reducido (1,3 B), puede ejecutarse en una unica GPU de consumo para validar flujos de trabajo antes de escalar a modelos mayores.
- Filtrado semantico en pipelines de datos: clasificacion de documentos biomedicos por relevancia tematica en un *pipeline* de ingesta, gracias al coste de inferencia bajo derivado de su tamano.
- Investigacion sobre destilacion de conocimiento: reproduccion y comparacion de variantes (`seed2024`) para estudiar como se transfiere conocimiento estructurado de un grafo a un modelo de lenguaje pequeno.
- Generacion de resumenes de historias clinicas anonimizadas: resumen extractivo de notas clinicas en un entorno de investigacion, con supervision humana obligatoria y sin uso asistencial directo.
- Educacion biomedica: generacion de explicaciones introductorias o preguntas de autoevaluacion a partir de conceptos de PrimeKG, siempre con revision por expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye seccion de evaluacion cumplimentada, no hay resultados de MMLU, HumanEval, GSM8K ni de tareas especificas de biomedicina (MedQA, PubMedQA, BioASQ), y la busqueda web no ha devuelto ninguna referencia tecnica al modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del supuesto de un modelo de 1.300 millones de parametros; no proceden de la documentacion del repositorio.

- VRAM estimada en fp16: aproximadamente 2,6 GB solo de pesos, unos 3,5-4 GB con *overhead* de activaciones y cache KV.
- VRAM estimada en int8: aproximadamente 1,4-1,8 GB.
- VRAM estimada en int4 (GGUF Q4_K_M): aproximadamente 0,9-1,2 GB.
- GPU de consumo: cabe holgadamente en una RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 o similar; en int4 puede ejecutarse incluso en GPUs de 4-6 GB como la GTX 1650 o la RTX 3050 de portatil.
- GPU de centro de datos: A100, H100 o L40S estan sobredimensionadas para inferencia individual; son utiles solo para *batching* masivo.
- CPU: la inferencia en CPU es viable en cuantizacion int4 con llama.cpp, con velocidades del orden de unidades o decenas de tokens por segundo segun el procesador.
- Opciones de despliegue: `transformers` con PyTorch (soporte declarado), vLLM o TGI si los pesos son completos, y llama.cpp u Ollama previa conversion a GGUF. No se publican artefactos GGUF.
- Latencia y throughput: no disponibles. Ademas, el tamano del repositorio (0,1 GB) sugiere que los pesos completos podrian no estar presentes, lo que impediria cualquier despliegue.

## Comparativa con modelos similares

Datos tomados de las model cards publicas de cada alternativa; no verificados en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| phi-1.5-primekg-vanillakd-seed2024 | ~1,3 B (inferido) | 2.048 (inferido) | No disponible | 0 descargas, repo de 0,1 GB | Sin documentacion ni evaluacion publicadas |
| microsoft/phi-1.5 | 1,3 B | 2.048 | MIT | Ampliamente disponible | Base presumible de este ajuste; buen rendimiento en razonamiento basico y Python introductorio |
| microsoft/phi-2 | 2,7 B | 2.048 | MIT | Ampliamente disponible | Alternativa directa si se necesita mas capacidad; mayor coste de VRAM |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 | Apache-2.0 | Ampliamente disponible | Contexto mucho mayor, soporte multilingue y de herramientas; no especializado en biomedicina |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1 B | 2.048 | Apache-2.0 | Ampliamente disponible | Menor, con licencia permisiva y comunidad activa; tambien carece de ajuste biomedico |

## Limitaciones y advertencias

- Documentacion inexistente: la model card es la plantilla por defecto, sin datos de entrenamiento, evaluacion, licencia ni uso previsto.
- Licencia sin declarar: no se puede asumir uso comercial. Aunque el modelo base phi-1.5 se publica bajo MIT, la licencia del ajuste no esta especificada y la situacion legal del artefacto es indeterminada.
- Pesos posiblemente incompletos: 0,1 GB es demasiado pequeno para alojar los pesos en fp16 de un modelo de 1,3 B, lo que sugiere que el *checkpoint* esta truncado o que los ficheros de pesos no estan realmente publicados.
- Riesgo de alucinacion elevado en dominio biomedico: un modelo de 1,3 B ajustado por destilacion puede generar asociaciones farmaco-enfermedad plausibles pero falsas. Cualquier salida debe verificarse contra fuentes primarias.
- Sin validacion clinica: el modelo no debe usarse en ningun flujo asistencial, diagnostico ni de decision terapeutica.
- Sesgos: los derivados del corpus de entrenamiento del modelo base (predominantemente web en ingles) y de las fuentes que componen PrimeKG; no se ha publicado ningun analisis de sesgo.
- Limitacion idiomatica: el modelo base esta centrado en ingles, por lo que el rendimiento en castellano es previsiblemente bajo y no esta medido.
- Contexto corto: 2.048 tokens impiden procesar articulos completos o historiales clinicos extensos sin estrategias de troceado.
- Sin soporte de herramientas ni de agentes: no hay plantilla de *function calling*, lo que obliga a implementar el enrutamiento externamente.
- Reproducibilidad no garantizada: no se documentan hiperparametros ni el proceso de destilacion, por lo que no es posible replicar el resultado a partir del nombre `seed2024`.
- Ausencia de comunidad: 0 descargas y 0 *likes* implican que no hay issues, pruebas de terceros ni mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/olusegunola/phi-1.5-primekg-vanillakd-seed2024
- arXiv:1910.09700 (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700 — unica referencia citada en la model card; corresponde al calculador de impacto medioambiental, no al modelo.
- Referencia del modelo base presumible, phi-1.5: https://arxiv.org/abs/2309.05463 — no citado en la model card, incluido aqui solo como contexto de la hipotesis sobre la base.
- La busqueda web realizada no ha devuelto ningun enlace relevante al modelo: los resultados obtenidos corresponden a portales corporativos sin relacion con el repositorio.
