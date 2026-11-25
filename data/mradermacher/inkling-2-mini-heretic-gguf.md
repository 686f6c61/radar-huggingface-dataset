# mradermacher/Inkling-2-Mini-Heretic-GGUF

## Resumen

Inkling-2-Mini-Heretic-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Inkling-2-Mini-Heretic, publicado por el usuario mradermacher. El modelo base fue subido originalmente por JoaoZaokk y esta etiquetado como conversacional. Se trata de un modelo de aproximadamente 26.070 millones de parametros (26B), segun los datos de safetensors asociados al repositorio, lo que lo situa en la categoria de modelos de gran tamano orientados a inferencia local mediante llama.cpp y herramientas compatibles con GGUF.

La relevancia de esta publicacion es practica: el autor ofrece una bateria amplia de cuantizaciones (desde Q2_K hasta F16, incluyendo variantes K_S, K_M, K_L e IQ4_XS) que permiten desplegar un modelo de 26B en hardware con recursos limitados, algo inviable con los pesos originales en precision completa. El sufijo "Heretic" sugiere una variante afinada para reducir rechazos o comportamientos de censura, aunque no se dispone de documentacion tecnica que lo confirme.

No obstante, la informacion disponible es muy escasa: no se detalla la arquitectura, el contexto, los idiomas, la licencia ni los datos de entrenamiento. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica que es una publicacion reciente y poco validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.070.385.152 (~26B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 55,7 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Inkling-2-Mini-Heretic. El dato de parametros (26.070.385.152) proviene de los safetensors del modelo original, pero la model card no especifica si se trata de un transformer denso, un modelo MoE, un hibrido SSM ni ninguna otra variante. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste conversacional.

Lo unico verificable es el proceso de cuantizacion: el autor indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que las cuantizaciones se generaron a partir de pesos en formato Hugging Face convertidos a GGUF mediante la herramienta estandar de llama.cpp. No se ha aplicado skip a la proyeccion multimodal (`skip_mmproj` vacio), aunque no se confirma que el modelo tenga vision.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` indica que el modelo esta orientado a dialogos multi-turno.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse a traves de APIs compatibles con el ecosistema Hugging Face.
- Ejecucion local mediante GGUF: al estar cuantizado, puede ejecutarse con llama.cpp, Ollama y otros runners compatibles.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling o agentes: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Modo thinking u otras capacidades especiales: no disponibles.

## Casos de uso

- Despliegue conversacional en hardware de gama alta para consumidores: con cuantizaciones Q4_K_M o Q5_K_M, un modelo de 26B puede ejecutarse en GPUs con 16-24 GB de VRAM, permitiendo asistentes conversacionales locales sin depender de la nube.
- Prototipado de chatbots autoalojados: el formato GGUF y la compatibilidad con llama.cpp permiten montar un servidor de chat en una maquina propia para pruebas de concepto y demos internas.
- Evaluacion de variantes "uncensored" o "heretic": para equipos de investigacion interesados en medir como cambia el comportamiento del modelo al eliminar restricciones de rechazo, esta variante permite comparar respuestas frente al modelo base.
- Inferencia en entornos con GPU unica: las cuantizaciones Q2_K y Q3_K_S reducen el peso a un rango que puede caber en GPUs de 8-12 GB, habilitando pruebas en estaciones de trabajo modestas.
- Integracion en pipelines de generacion de texto por lotes: mediante llama.cpp o servidores compatibles, el modelo puede procesar grandes volumenes de texto sin coste por token de API.
- Fine-tuning posterior sobre GGUF: aunque el formato no es el ideal para entrenamiento, las variantes F16 y Q8_0 pueden servir como referencia para validar la calidad antes de un ajuste fino sobre los pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y sin contar overhead de contexto):
  - F16: ~52 GB.
  - Q8_0: ~28 GB.
  - Q6_K: ~21 GB.
  - Q5_K_M: ~18 GB.
  - Q4_K_M: ~16 GB.
  - Q3_K_M: ~13 GB.
  - Q2_K: ~9-10 GB.
- GPU recomendadas: A100 80 GB o H100 para F16 y Q8_0; RTX 4090 (24 GB) o A6000 (48 GB) para Q4_K_M y Q5_K_M; RTX 3090/4080 (16-24 GB) para Q4 y Q3.
- Cabe en GPU de consumo: si, en RTX 4090 con Q4_K_M o inferiores, y en GPUs de 12-16 GB con Q3_K_M o Q2_K, a costa de perdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI que acepten GGUF, y potencialmente vLLM si se convierte a otro formato (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre el modelo base para identificar alternativas comparables con rigor. Como referencia generica de la categoria de ~26B en GGUF, podrian considerarse modelos abiertos de tamano similar, pero no se confirma que compartan arquitectura, licencia ni rendimiento.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Inkling-2-Mini-Heretic-GGUF | ~26B | no disponible | no disponible | GGUF |
| Alternativas de ~26B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Informacion tecnica insuficiente: no se documentan arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar su idoneidad para produccion.
- Licencia no disponible: no puede confirmarse el uso comercial; es imprescindible verificar la licencia del modelo base (JoaoZaokk/Inkling-2-Mini-Heretic) antes de cualquier despliegue.
- Variante "Heretic": el sufijo sugiere un ajuste para reducir rechazos, lo que puede implicar mayor probabilidad de generar contenido inapropiado, sesgado o inseguro. No hay documentacion que lo confirme.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin benchmarks ni evaluaciones publicadas no puede cuantificarse.
- Sesgos conocidos: no documentados.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad de forma notable en modelos de este tamano; se recomienda Q4_K_M o superior para uso real.
- Repositorio sin validacion comunitaria: 0 descargas y 1 like, lo que reduce la confianza en la reproducibilidad y calidad del proceso de cuantizacion.
- Sin garantias de soporte: el autor no ofrece documentacion adicional ni mantenimiento declarado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Inkling-2-Mini-Heretic-GGUF
- Modelo base: https://huggingface.co/JoaoZaokk/Inkling-2-Mini-Heretic
- Herramienta de cuantizacion (llama.cpp): https://github.com/ggerganov/llama.cpp
