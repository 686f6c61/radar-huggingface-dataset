# Mingyi-Hong/ToolAlpaca_unlearn_ToolDelete-SFT

## Resumen

ToolAlpaca_unlearn_ToolDelete-SFT es un ajuste fino derivado de TangQiaoYu/ToolAlpaca-7B, publicado por el usuario Mingyi-Hong en HuggingFace. Segun la model card, el modelo se ha obtenido aplicando el metodo denominado ToolDelete-SFT sobre el modelo base original: se trata, por tanto, de un artefacto de investigacion orientado al desaprendizaje selectivo (machine unlearning), en el que el objetivo del entrenamiento es eliminar o degradar la capacidad de uso de herramientas que el modelo base si poseia.

El modelo base, ToolAlpaca-7B, procede del trabajo ToolAlpaca (arXiv:2306.05301), un framework que genera automaticamente un corpus de uso de herramientas mediante simulacion multiagente: 3.900 instancias de uso de herramientas procedentes de mas de 400 herramientas distintas repartidas en 50 categorias. Ese corpus se utiliza para dotar de capacidades generalizadas de tool calling a modelos compactos de 7.000 millones de parametros, sin necesidad de supervision humana intensiva.

La relevancia de este checkpoint es fundamentalmente metodologica: sirve como punto de comparacion para estudiar hasta que punto un ajuste fino supervisado elimina realmente una habilidad concreta, si el conocimiento borrado es recuperable y como afecta el proceso al resto de capacidades del modelo. No es un modelo pensado para produccion ni para uso general: es una pieza de investigacion con 0 descargas y 0 likes en el momento de redactar esta ficha, sin licencia declarada, sin idiomas declarados y sin resultados de evaluacion publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia LLaMA (etiqueta `llama` en el repositorio); no detallada de forma explicita en la model card |
| Parametros totales | Aproximadamente 7.000 millones, deducidos del nombre del modelo base (ToolAlpaca-7B); no confirmado en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio ocupa 13,5 GB, tamano consistente con pesos sin cuantizar en FP16/BF16 |
| Idiomas soportados | no disponible (el corpus ToolAlpaca original esta mayoritariamente en ingles, pero no se declara en esta ficha) |
| Licencia | no disponible |
| Formato de pesos | Presumiblemente PyTorch/safetensors, segun la etiqueta `pytorch` y el tamano del repositorio; no confirmado en la model card |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el procedimiento de entrenamiento mas alla de dos lineas: el modelo base (TangQiaoYu/ToolAlpaca-7B) y el metodo aplicado (ToolDelete-SFT). A partir de la etiqueta `llama` del repositorio y del nombre del modelo base, cabe inferir una arquitectura transformer decoder-only de tipo LLaMA con aproximadamente 7.000 millones de parametros, aunque no hay confirmacion explicita en la informacion proporcionada. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO.

El nombre del metodo, ToolDelete-SFT, sugiere una estrategia de desaprendizaje basada en ajuste fino supervisado (SFT) orientada a la eliminacion de la habilidad de uso de herramientas, presumiblemente mediante reentrenamiento sobre datos que no contienen trazas de tool calling o que penalizan su reproduccion. Esta interpretacion es una inferencia razonada a partir del nombre y no una afirmacion documentada por el autor. El modelo base, en cambio, si esta documentado en el paper ToolAlpaca: se genero un corpus de 3.900 instancias de uso de herramientas a partir de mas de 400 API distintas en 50 categorias, mediante un entorno de simulacion con multiples agentes, y se uso para ajustar un modelo compacto de 7B con el objetivo de generalizar a herramientas no vistas durante el entrenamiento.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base ToolAlpaca-7B.
- Capacidad de tool calling deliberadamente degradada o eliminada por el metodo ToolDelete-SFT; el grado exacto de eliminacion no esta cuantificado en la informacion disponible.
- Razonamiento multi-paso: no confirmado tras el proceso de desaprendizaje.
- Capacidades multilingues: no declaradas.
- Capacidades de vision o audio: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Uso previsto como sujeto de evaluacion en experimentos de machine unlearning (comparacion antes/despues del borrado).

## Casos de uso

- Investigacion en machine unlearning: el checkpoint permite medir empiricamente cuanto conocimiento de uso de herramientas se elimina tras un ajuste ToolDelete-SFT, comparando las respuestas del modelo con las del ToolAlpaca-7B original sobre el mismo conjunto de prompts de herramientas.
- Auditoria de fuga de conocimiento borrado: serviria para comprobar si un atacante puede recuperar la habilidad eliminada mediante prompting adversario, jailbreaks o fine-tuning posterior, un aspecto central en la literatura de unlearning.
- Evaluacion de la degradacion colateral: al ser un ajuste sobre un modelo ya entrenado, permite estudiar si el borrado de la habilidad de tool calling afecta a otras capacidades como la generacion de texto general o el razonamiento basico.
- Docencia y divulgacion tecnica: util como ejemplo reproducible de un pipeline de desaprendizaje selectivo en un modelo de 7B, con un coste de computo manejable en laboratorio.
- Base para experimentos comparativos de metodos de borrado: puede emplearse como linea base frente a otras variantes de desaprendizaje (por ejemplo, metodos de gradiente ascendente o de edicion de pesos) aplicadas al mismo modelo de partida.
- Analisis de taxonomias de evaluacion: sirve para construir y validar baterias de pruebas que distingan entre "el modelo no sabe usar la herramienta" y "el modelo sabe pero no la invoca", una distincion critica en la evaluacion del olvido.
- Referencia negativa en pipelines de produccion: util para verificar que sistemas que dependen de tool calling no deben desplegar checkpoints sometidos a borrado, documentando el fallo esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, evaluaciones de tool calling ni ninguna otra medida cuantitativa, ni del modelo base ni del checkpoint desaprendido.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 14 GB solo para los pesos de un modelo de 7B, mas overhead de activaciones y cache KV, lo que situa el consumo practico en 16-18 GB segun la longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB, aunque esta opcion requiere convertir los pesos a un formato compatible (por ejemplo GGUF), dado que el repositorio no publica cuantizaciones.
- GPU profesionales: A100 (40 o 80 GB), H100, L40S o A6000 funcionan sin problema y permiten lotes grandes y contexto largo.
- GPU de consumo: la familia RTX 4090 y RTX 3090 (24 GB) puede ejecutar el modelo en FP16 con margen limitado; tarjetas de 16 GB como la RTX 4080 requeririan cuantizacion.
- Opciones de despliegue: transformers de HuggingFace para inferencia directa; vLLM o TGI para servir con mayor throughput; llama.cpp u Ollama tras convertir los pesos a GGUF. No hay artefactos de despliegue publicados por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones y no hay configuracion de inferencia documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mingyi-Hong/ToolAlpaca_unlearn_ToolDelete-SFT | ~7B (inferido) | no disponible | degradado o eliminado por diseno | no disponible | HuggingFace, 0 descargas |
| TangQiaoYu/ToolAlpaca-7B (modelo base) | ~7B | no disponible | si, entrenado sobre 3.900 instancias y mas de 400 herramientas | no disponible | HuggingFace |
| Otras variantes de desaprendizaje sobre ToolAlpaca-7B | no disponible | no disponible | no disponible | no disponible | no identificadas en la informacion disponible |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa entre estas alternativas. La unica diferencia documentada entre el primer y el segundo modelo es el metodo de entrenamiento aplicado (ToolDelete-SFT frente al ajuste original de ToolAlpaca).

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay licencia, idiomas, contexto, datos de entrenamiento ni hiperparametros declarados, lo que impide evaluar riesgos de uso comercial.
- Sin licencia explicita, no puede asumirse permiso de uso comercial; en ausencia de terminos, el uso queda en una zona legal indeterminada.
- El modelo base arrastra los sesgos y el riesgo de alucinacion propios de un ajuste sobre un corpus generado sinteticamente por simulacion multiagente; esos sesgos no se han medido en esta variante.
- El proceso de desaprendizaje puede ser incompleto: no hay evidencia publicada de que la habilidad de tool calling haya sido eliminada de forma robusta, y los metodos de borrado basados en SFT son habitualmente vulnerables a recuperacion mediante fine-tuning posterior.
- Riesgo de degradacion colateral no cuantificada en el resto de capacidades del modelo, al no existir evaluaciones publicadas.
- Sin cuantizaciones oficiales ni archivos GGUF, el despliegue eficiente exige conversion manual y validacion previa.
- Con 0 descargas y 0 likes, no existe validacion por parte de la comunidad: no hay reportes independientes de comportamiento, reproducibilidad ni estabilidad.
- No es adecuado para agentes en produccion, pipelines de tool calling ni ninguna aplicacion donde se espere invocar funciones o APIs.
- La informacion sobre el modelo base procede del paper ToolAlpaca, no de esta model card; cualquier extrapolacion de capacidades del base al checkpoint desaprendido debe tratarse como hipotesis a verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mingyi-Hong/ToolAlpaca_unlearn_ToolDelete-SFT
- Modelo base en HuggingFace: https://huggingface.co/TangQiaoYu/ToolAlpaca-7B
- Perfil del autor en HuggingFace: https://huggingface.co/Mingyi-Hong
- Articulos y actividad del autor: https://huggingface.co/Mingyi-Hong/activity/papers
- Codigo oficial de ToolAlpaca: https://github.com/tangqiaoyu/ToolAlpaca
- Paper ToolAlpaca (arXiv): https://arxiv.org/abs/2306.05301
- Paper ToolAlpaca (PDF): https://arxiv.org/pdf/2306.05301
- Perfil de Mingyi Hong en Google Scholar: https://scholar.google.com/citations?user=qRnP-p0AAAAJ&hl=en
