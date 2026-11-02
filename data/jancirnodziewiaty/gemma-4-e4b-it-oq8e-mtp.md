# jancirnodziewiaty/gemma-4-E4B-it-oQ8e-mtp

## Resumen

gemma-4-E4B-it-oQ8e-mtp es una cuantizacion mixta del modelo Gemma 4 E4B instruct de Google, publicada por el usuario jancirnodziewiaty. El checkpoint original se ha convertido al formato MLX (el framework de Apple para inferencia en silicio propio) mediante la herramienta oQ (oMLX v0.7.3), que aplica cuantizacion de precision mixta: la mayor parte de los pesos se almacena en 8 bits afines con grupo de 64, mientras que una fraccion pequena se mantiene en BF16 para preservar calidad. El resultado es un checkpoint de 8.020 millones de parametros logicos que ocupa 8.419 GiB en disco, con un promedio efectivo de 9.017 bits por peso.

El modelo base es multimodal: la ficha de pesos desglosa componentes de lenguaje (7.469B), vision (0.167B), audio (0.305B) y una cabeza MTP (multi-token prediction, 0.079B) de 0.079B parametros. Esta cabeza MTP sugiere que el modelo esta disenado para decodificacion especulativa o prediccion de multiples tokens, lo que puede acelerar la generacion en inferencia. La variante "it" indica que se trata de la version ajustada para instrucciones.

Es relevante para desarrolladores que trabajan en el ecosistema Apple (Mac con chip M-series) y quieren ejecutar un modelo Gemma 4 multimodal de ~8B con cuantizacion de alta calidad sin salir de MLX. No obstante, la informacion publicada es muy escasa: no hay model card descriptiva del modelo base, ni datos de benchmarks, ni licencia explicita en la ficha de HuggingFace, lo que limita la evaluacion rigurosa y el uso comercial sin verificacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + vision + audio) con cabeza MTP (multi-token prediction); cuantizacion mixta oQ |
| Parametros totales | 8.019.880.782 (8.020B logicos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla de affine 8-bit grupo 64 (93,123% de pesos, 8,50 bits/peso), BF16 (6,874%, 16 bits/peso) e I64 (0,003%); promedio efectivo 9,017 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX), repositorio de 9,1 GB |

## Arquitectura y entrenamiento

El checkpoint es una conversion cuantizada del modelo Gemma 4 E4B instruct, no un entrenamiento propio. La arquitectura subyacente es un transformer multimodal con modulos separados de lenguaje, vision y audio, mas una cabeza MTP de 0,079B parametros. La presencia de MTP indica soporte para prediccion de multiples tokens por paso, una tecnica habitual para acelerar la decodificacion mediante verificacion especulativa. El desglose de pesos es: lenguaje 7,469B (7,391 GiB), vision 0,167B (0,312 GiB), audio 0,305B (0,568 GiB) y MTP 0,079B (0,148 GiB).

El proceso de cuantizacion lo realizo la herramienta oQ (oMLX v0.7.3), que asigna precision de forma no uniforme: los tensores principales del modelo de lenguaje se almacenan en affine 8-bit con grupo de 64 (7,468B de pesos logicos, 7,390 GiB), mientras que 0,551B de pesos se conservan en BF16 (1,027 GiB), presumiblemente capas sensibles a la cuantizacion como embeddings, normalizaciones o proyecciones multimodales. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto e instrucciones en modo chat (variante "it").
- Procesamiento de vision: el checkpoint incluye un modulo visual de 0,167B parametros, por lo que se espera soporte de entrada de imagenes.
- Procesamiento de audio: incluye un modulo de audio de 0,305B parametros, lo que sugiere capacidad de entrada o comprension de audio.
- Prediccion multi-token (MTP): cabeza dedicada que puede habilitar decodificacion especulativa y mayor throughput.
- Razonamiento y generacion de codigo: capacidades esperables de un modelo Gemma instruct, aunque no se documentan explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (idiomas no declarados).

## Casos de uso

- Inferencia local en Mac con silicio Apple: el formato MLX y la cuantizacion de ~9 bits permiten ejecutar un modelo multimodal de 8B en equipos con memoria unificada de 16-32 GB, usando la libreria mlx y el runtime de Apple.
- Prototipado de asistentes multimodales: al incluir modulos de vision y audio, el checkpoint sirve para experimentar con pipelines que reciben imagen, audio y texto en un mismo flujo, siempre que se valide el comportamiento real del modelo base.
- Generacion de texto asistida en local: para tareas de redaccion, resumen o chat con requisitos de privacidad, al no depender de APIs externas.
- Aceleracion de decodificacion con MTP: la cabeza multi-token permite probar tecnicas de decodificacion especulativa en MLX para reducir latencia por token generado.
- Evaluacion de tecnicas de cuantizacion mixta: util como referencia para comparar la perdida de calidad de oQ 8-bit frente al checkpoint BF16 original en tareas concretas.
- Despliegue en estaciones de trabajo Apple para demos internas: el tamano de 8,4 GiB facilita distribuir el modelo en portatiles y Mac mini con memoria unificada suficiente.
- Investigacion sobre eficiencia de inferencia: permite medir throughput y uso de memoria de un Gemma 4 multimodal cuantizado en MLX frente a otras alternativas (llama.cpp, GGUF) en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el checkpoint ocupa 8,419 GiB en disco; en memoria unificada se necesita al menos ese espacio mas el overhead del runtime MLX (aproximadamente 10-12 GB en total para contexto corto).
- GPU recomendadas: hardware Apple con silicio M-series (M1, M2, M3, M4 y variantes Pro/Max/Ultra); el formato MLX no esta pensado para GPU NVIDIA.
- Cabe en consumer GPU: si, en equipos Apple con memoria unificada de 16 GB o superior; con 8 GB resulta ajustado y probablemente inviable para contextos largos.
- Opciones de despliegue: libreria `mlx` y `mlx-lm` de Apple; el checkpoint no esta en GGUF, por lo que llama.cpp, Ollama o TGI no lo cargan directamente sin conversion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E4B-it-oQ8e-mtp | 8,020B | no disponible | safetensors MLX (mixto ~9 bits) | no disponible | HuggingFace (0 descargas) |
| Gemma 4 E4B instruct (original) | ~8B | no disponible | safetensors BF16 | no disponible en esta ficha | HuggingFace (modelo base de Google) |
| Gemma 3 4B instruct | ~4B | 128K (segun documentacion publica de Gemma 3) | safetensors, GGUF | Gemma Terms of Use | Amplia |
| Llama 3.2 3B Instruct | 3,2B | 128K | safetensors, GGUF | Llama 3.2 Community License | Amplia |

Nota: los datos de Gemma 3 y Llama 3.2 provienen de conocimiento general de esos modelos; no se dispone de informacion verificada sobre Gemma 4 E4B en la documentacion proporcionada, por lo que la comparacion con el modelo base es orientativa.

## Limitaciones y advertencias

- La model card no documenta el modelo base: no hay informacion sobre dataset, contexto, idiomas ni comportamiento esperado.
- Licencia no declarada en la ficha de HuggingFace: no se puede asumir uso comercial sin consultar la licencia del modelo Gemma 4 original de Google.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad ni de que el checkpoint funcione correctamente.
- Riesgo de degradacion por cuantizacion: aunque el promedio es de 9,017 bits/peso, la mezcla deja 0,551B de pesos en BF16; el impacto real en calidad no esta medido.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no documentados; se heredan los del modelo base Gemma 4, sobre los que no hay informacion en esta ficha.
- Dependencia de MLX: el checkpoint solo es utilizable en el ecosistema Apple; no hay conversion a GGUF ni a otros formatos.
- Fecha de creacion futura (2026-11-02) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.
- Sin soporte documentado de tool calling ni de agentes: no se debe asumir su disponibilidad sin pruebas.

## Enlaces

- [HuggingFace: jancirnodziewiaty/gemma-4-E4B-it-oQ8e-mtp](https://huggingface.co/jancirnodziewiaty/gemma-4-E4B-it-oQ8e-mtp)
- [oQ / oMLX (herramienta de cuantizacion)](https://github.com/jundot/omlx)
- [MLX (framework de Apple)](https://github.com/ml-explore/mlx)
- [mlx-lm](https://github.com/ml-explore/mlx-lm)
