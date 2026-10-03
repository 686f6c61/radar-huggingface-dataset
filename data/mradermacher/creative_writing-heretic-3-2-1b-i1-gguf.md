# mradermacher/Creative_Writing-Heretic-3.2-1B-i1-GGUF

## Resumen

El repositorio `mradermacher/Creative_Writing-Heretic-3.2-1B-i1-GGUF` no es un modelo entrenado desde cero, sino una coleccion de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo base `NovaCorp/Creative_Writing-Heretic-3.2-1B`. Su proposito es permitir la inferencia local del modelo original en hardware modesto (CPU, iGPU o GPU de gama baja) mediante llama.cpp y herramientas compatibles, algo imposible con los pesos completos en precision nativa.

Por la denominacion y por los repositorios relacionados del mismo autor (por ejemplo `llama-3.2-1b-creative-writing-ablated-i1-GGUF`), el modelo de partida parece pertenecer a la familia Llama 3.2 de 1B de parametros, con un ajuste orientado a escritura creativa y un proceso de "abliteration" o desalineacion de seguridad (de ahi el termino "Heretic"). No obstante, la informacion disponible no confirma arquitectura, contexto, licencia ni idiomas, por lo que esos datos se marcan como no disponibles.

La relevancia de esta ficha es practica: se trata de un artefacto de cuantizacion con 0 descargas y 1 "like" en el momento de la consulta, creado el 3 de octubre de 2026. Su interes principal es la disponibilidad de hasta 24 variantes de cuantizacion distintas (desde IQ1_S hasta Q6_K), lo que permite ajustar el equilibrio entre calidad y consumo de memoria en despliegues muy restringidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la denominacion "3.2-1B" sugiere transformer decoder-only de la familia Llama 3.2 de 1B, sin confirmar) |
| Parametros totales | 1B segun la denominacion del modelo; el metadato de safetensors del repo informa de 327.792, valor no coherente con un modelo de 1B |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible (los repositorios relacionados del mismo autor etiquetan ingles y espanol, sin confirmacion para este) |
| Licencia | no disponible en los metadatos de HuggingFace |
| Formato de pesos | GGUF (derivado de pesos originales en formato HuggingFace segun el campo `convert_type: hf`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `NovaCorp/Creative_Writing-Heretic-3.2-1B` ni sobre su proceso de entrenamiento. La model card del repositorio de cuantizacion unicamente documenta los metadatos del proceso de conversion (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) y la lista de cuantizaciones generadas. El autor indica que se trata de cuantizaciones ponderadas con matriz de importancia (weighted/imatrix quants), una tecnica que estima la importancia de cada tensor a partir de activaciones de calibracion para minimizar la perdida de calidad en precisiones muy bajas.

Por el nombre del modelo cabe inferir dos componentes: un ajuste fino orientado a escritura creativa y un proceso de abliteration, es decir, la modificacion de los pesos o de las direcciones de activacion asociadas al rechazo para reducir el comportamiento de seguridad alineado. Esta inferencia se apoya en repositorios equivalentes del mismo autor y en el ecosistema de modelos "abliterated" y "heretic", pero no puede confirmarse con la informacion proporcionada. No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni innovaciones tecnicas del modelo original.

## Capacidades

- Generacion de texto narrativo y creativo: es la capacidad implicita en la denominacion del modelo base y el eje del ajuste.
- Escritura de ficcion, dialogos y descripciones: uso previsible dado el nombre del repositorio, sin verificacion empirica disponible.
- Generacion con temperatura y parametros de muestreo ajustables: soportada por cualquier runtime GGUF, util para controlar el estilo.
- Inferencia local sin conexion: las cuantizaciones permiten ejecucion en CPU y GPU de gama baja.
- Tool calling / function calling: no disponible, no hay evidencia de plantilla de herramientas ni de entrenamiento en ese sentido.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles en la informacion del repositorio.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible.
- Ajuste fino adicional sobre los pesos GGUF: no recomendado en la practica; habria que partir de los pesos originales en safetensors.

## Casos de uso

- Escritura creativa asistida en local: el modelo puede generar borradores de relatos, escenas y dialogos ejecutandose integramente en un portatil sin GPU dedicada, usando las cuantizaciones Q4_K_M o Q5_K_M para equilibrar calidad y consumo.
- Generacion de ficcion interactiva y roleplay: con temperaturas medias-altas y plantillas de prompt conversacionales, encaja en aplicaciones tipo SillyTavern o frontends similares que consumen endpoints compatibles con llama.cpp.
- Prototipado de pipelines de generacion de texto: al ser un modelo de 1B, permite validar arquitecturas de prompt, postprocesado y filtrado antes de escalar a modelos mayores, con coste de computo minimo.
- Aumento de datos sinteticos para entrenamiento: puede generar variaciones de textos cortos (sinopsis, descripciones, parrafos de estilo) para aumentar corpus de dominio, siempre con revision humana posterior.
- Despliegue en dispositivos con recursos muy limitados: las variantes IQ2 e IQ3 permiten ejecucion en CPU con poca RAM o en placas tipo Raspberry Pi, util para demos offline y entornos desconectados.
- Generacion de textos de relleno y contenido de baja criticidad: descripciones de producto genericas, textos de ejemplo o material de prototipos donde el riesgo de error no es critico.
- Experimentacion con modelos desalineados en investigacion de seguridad: permite estudiar el comportamiento de modelos con las capas de rechazo atenuadas en un entorno controlado y de bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion alguna, no se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni de tareas de generacion creativa, y no existe informacion sobre evaluaciones comparativas del modelo base `NovaCorp/Creative_Writing-Heretic-3.2-1B`.

## Requisitos de hardware

- VRAM estimada para inferencia (valores aproximados calculados a partir del tamano nominal de 1B parametros, no publicados por el autor):
  - IQ1_S / IQ1_M: en torno a 0,3-0,4 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K: en torno a 0,4-0,6 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: en torno a 0,5-0,8 GB.
  - IQ4_XS / IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: en torno a 0,6-0,9 GB.
  - Q5_K_S / Q5_K_M: en torno a 0,8-1,0 GB.
  - Q6_K: en torno a 1,0-1,2 GB.
  - Pesos originales en FP16 (referencia, no incluidos en este repositorio): en torno a 2,4-2,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, por ejemplo GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 o superiores. Tambien resulta viable en GPUs integradas con memoria compartida.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU dedicada de los ultimos ocho anos, e incluso en CPU exclusivamente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, y servidores compatibles con la API de llama.cpp. vLLM y TGI no son las rutas naturales para GGUF, aunque existen soportes parciales de cuantizacion en vLLM que no aplican a estos ficheros.
- Latencia y throughput estimados: no disponibles. Como referencia orientativa para un modelo de 1B en Q4_K_M, un equipo de sobremesa moderno con GPU dedicada puede superar holgadamente la generacion en tiempo real, mientras que en CPU de gama media la generacion suele mantenerse por encima de la velocidad de lectura humana. No hay mediciones publicadas para este repositorio concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Creative_Writing-Heretic-3.2-1B (i1-GGUF) | 1B (segun denominacion) | no disponible | no disponible | GGUF, 24 cuantizaciones | 0 descargas, 1 like; datos de rendimiento no publicados |
| Llama 3.2 1B Instruct | 1.230 millones | 128.000 tokens | Llama 3.2 Community License | Pesos oficiales y GGUF de terceros | Modelo alineado; contexto largo documentado |
| Qwen2.5 1.5B Instruct | 1.540 millones | 32.768 tokens | Apache 2.0 | Pesos oficiales y GGUF de terceros | Licencia permisiva, buen soporte multilingue |
| Gemma 2 2B Instruct | 2.600 millones | 8.192 tokens | Gemma Terms of Use | Pesos oficiales y GGUF de terceros | Mayor tamano y coste de inferencia |

No se dispone de datos comparativos de rendimiento para el modelo de esta ficha, por lo que la comparacion se limita a parametros, contexto, licencia y formato de distribucion.

## Limitaciones y advertencias

- Ausencia total de datos verificables: no hay model card tecnica del modelo base en este repositorio, ni licencia, ni idiomas, ni contexto declarados.
- Riesgo de alucinacion elevado: los modelos de 1B parametros presentan tasas de error factual notablemente superiores a los de mayor tamano, especialmente en tareas de conocimiento y razonamiento.
- Modelo presumiblemente desalineado: la denominacion "Heretic" y el ecosistema de repositorios equivalentes apuntan a una reduccion deliberada de las barreras de seguridad. Esto implica mayor probabilidad de generar contenido inapropiado, ofensivo o danino sin filtros adicionales.
- Incoherencia en los metadatos: el campo de parametros totales reportado (327.792) no concuerda con un modelo de 1B, lo que sugiere un artefacto de medicion o un problema en la carga de los pesos; conviene no tomarlo como referencia.
- Licencia indeterminada: al no declararse licencia, no puede asumirse permiso de uso comercial. Ademas, los terminos del modelo base condicionan los de esta cuantizacion derivada y no se han hecho explicitos.
- Adopcion nula: 0 descargas y 1 like indican que el artefacto no ha sido validado por la comunidad; no hay informes de calidad ni de estabilidad.
- Degradacion por cuantizacion: las variantes IQ1 e IQ2, aunque muy ligeras, suelen producir perdidas apreciables de coherencia y repeticiones; no son adecuadas para produccion.
- Sin soporte de tool calling ni agentes: un modelo de este tamano y de este origen rara vez incorpora plantillas de herramientas, y no hay evidencia de ello.
- Cobertura idiomatica incierta: no se puede garantizar un rendimiento aceptable en castellano; los repositorios relacionados del autor listan ingles y espanol, pero sin datos de evaluacion.
- Fecha de creacion atipica: el repositorio figura como creado el 3 de octubre de 2026, posterior a la fecha de consulta habitual de muchos entornos, lo que puede indicar metadatos anomalos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Creative_Writing-Heretic-3.2-1B-i1-GGUF
- Modelo base citado en la model card: https://huggingface.co/NovaCorp/Creative_Writing-Heretic-3.2-1B
- Repositorio relacionado del mismo autor (llama-3.2-1b-creative-writing-ablated-i1-GGUF): https://huggingface.co/mradermacher/llama-3.2-1b-creative-writing-ablated-i1-GGUF
- Repositorio relacionado del mismo autor (HereticMaidX-3.2-1B-i1-GGUF): https://huggingface.co/mradermacher/HereticMaidX-3.2-1B-i1-GGUF
- Directorio de modelos abliterated: https://www.abliz.org/
- Recopilacion de modelos sin censura (2026): https://decodesfuture.com/articles/top-uncensored-open-source-ai-models-2026-list/
- Comparativa de modelos heretic de mradermacher en aimodels.fyi: https://www.aimodels.fyi/models/compare/gemma-4-26b-a4b-it-heretic-gguf-mradermacher-vs-gemma-4-26b-a4b-it-ultra-uncensored-heretic-i1-gguf-mradermacher
