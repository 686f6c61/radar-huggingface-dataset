# Rev3auth/iris-1.3-lora

## Resumen

Rev3auth/iris-1.3-lora es un ajuste fino (fine-tuning) publicado en HuggingFace por el usuario Rev3auth, obtenido a partir del modelo base unsloth/gemma-3-1b-it. Se trata de un modelo de generacion de texto de la familia Gemma 3, en su variante de 1 000 millones de parametros y ya alineada para instrucciones (sufijo "it"), sobre la que se ha aplicado un entrenamiento adicional. El repositorio ocupa 0,5 GB, un tamano coherente con un adaptador LoRA mas que con una copia completa de los pesos en precision de 16 bits, que rondarian los 2 GB para esta cantidad de parametros.

La relevancia de esta publicacion es limitada desde el punto de vista tecnico: el autor no documenta el dataset de entrenamiento, el numero de pasos, la configuracion de hiperparametros ni los objetivos de la especializacion. La unica informacion concreta que aporta la model card es que el entrenamiento se realizo con la libreria Unsloth, que el autor declara "2x faster", y que la licencia es Apache 2.0. El modelo se distribuye en formato safetensors y es compatible con transformers y con text-generation-inference, segun las etiquetas del repositorio.

En el momento de redactar esta ficha, el repositorio registra 0 descargas y 0 "likes", y el pipeline no esta declarado. Se trata, por tanto, de una publicacion reciente y sin validacion externa, cuyo interes practico depende de que el adaptador aporte una mejora medible sobre el modelo base, algo que no puede verificarse con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante gemma3_text) |
| Parametros totales | 1 000 millones (heredados del modelo base gemma-3-1b-it) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la informacion disponible; el modelo base Gemma 3 1B declara 32 768 tokens |
| Tipos de cuantizacion | No disponible (el repositorio no incluye variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Ingles (etiqueta `en`); el modelo base Gemma 3 es multilingue, pero este ajuste solo declara ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base: un transformer decoder-only de la familia Gemma 3 en su variante exclusivamente de texto (`gemma3_text`), con 1 000 millones de parametros. Gemma 3 introduce en esta generacion atencion con ventana deslizante intercalada con capas de atencion global, lo que reduce el coste computacional en contextos largos; en el caso de la variante de 1B, la ventana de contexto declarada por el fabricante del base es de 32 768 tokens. El ajuste publicado no modifica la arquitectura, sino unicamente los pesos resultantes del entrenamiento adicional.

Respecto al proceso de entrenamiento, la model card no aporta practicamente ningun detalle: no se indica el volumen de tokens, la composicion del dataset, si se emplearon tecnicas de RLHF o DPO, ni la duracion o el numero de pasos. Lo unico documentado es que el entrenamiento se ejecuto con Unsloth, una libreria de optimizacion que acelera el fine-tuning de modelos transformer mediante kernels personalizados y reduccion de memoria, y que el autor reporta una velocidad "2x faster". La etiqueta `trl` en el repositorio sugiere el uso de la libreria TRL de HuggingFace para el entrenamiento supervisado, aunque no se confirma en el texto de la model card. No se documenta ninguna innovacion tecnica adicional.

## Capacidades

Las capacidades concretas del ajuste no estan documentadas por el autor. A continuacion se enumeran las que se pueden inferir del modelo base y de las etiquetas del repositorio, marcando explicitamente el nivel de certeza:

- Generacion de texto en ingles: capacidad heredada del base gemma-3-1b-it.
- Seguimiento de instrucciones: el modelo base es una variante "it", por lo que parte de una alineacion previa para instrucciones.
- Razonamiento basico y respuesta a preguntas: esperable en un modelo de 1B, con calidad limitada frente a modelos mayores.
- Generacion de codigo y matematicas: no documentada para este ajuste; en un modelo de 1B la fiabilidad es baja en tareas complejas.
- Soporte de tool calling o function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: el repositorio declara unicamente ingles, aunque el base soporte mas idiomas.
- Capacidades especiales (modo "thinking", vision, audio): no disponible. La etiqueta `gemma3_text` indica que esta variante no procesa imagenes.

## Casos de uso

Dado que el autor no documenta la especializacion del ajuste, los casos siguientes son escenarios plausibles para un modelo de 1B afinado, no aplicaciones validadas:

- Clasificacion y etiquetado de texto en ingles: el modelo puede usarse para categorizar tickets, correos o resenas con un script de inferencia por lotes, aprovechando su tamano reducido para procesar grandes volumenes con coste minimo.
- Extraccion de entidades y campos estructurados: con prompts adecuados, puede extraer nombres, fechas o importes de documentos en ingles y devolver JSON, integrándose en un pipeline de preprocesado.
- Generacion de borradores y resumenes cortos: util para producir resumenes de parrafos o borradores que un humano revise despues, dado que la calidad de un modelo de 1B no es suficiente para publicacion directa.
- Prototipado rapido y pruebas de concepto: sirve para validar una idea de producto de generacion de texto antes de invertir en modelos mayores, ya que cabe en una GPU de consumo.
- Chatbot de dominio restringido: si el ajuste se ha orientado a un tema concreto (el nombre "iris" no aporta informacion), podria desplegarse como asistente de un vertical muy acotado, siempre con validacion humana.
- Entornos con recursos limitados o en el borde: el modelo puede ejecutarse en portatiles o instancias pequeñas, lo que lo hace candidato para demos offline o entornos sin GPU dedicada.
- Investigacion sobre fine-tuning eficiente: el repositorio es un ejemplo reproducible de un ajuste con Unsloth sobre Gemma 3 1B, util para estudiar el flujo de trabajo mas que para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna metrica (MMLU, HumanEval, GSM8K u otras), y el repositorio no referencia evaluaciones externas.

## Requisitos de hardware

Las siguientes cifras son estimaciones basadas en el tamano de 1B parametros del modelo base, no en mediciones publicadas para este ajuste concreto:

- VRAM en fp16/bf16: en torno a 2,5-3 GB contando pesos, cache KV y overhead del runtime.
- VRAM en int8: aproximadamente 1,5 GB.
- VRAM en int4: aproximadamente 1 GB o menos.
- GPU de consumo: si, cabe con holgura en tarjetas con 6-8 GB o mas, como RTX 3060, RTX 4060, RTX 4090 o Apple Silicon con memoria unificada.
- GPU de centro de datos: A100, H100 o L40S son suficientes pero sobredimensionadas para este tamano; se usarian solo por agregacion de muchas instancias.
- Opciones de despliegue: transformers y text-generation-inference estan declarados como compatibles en las etiquetas. Ollama, llama.cpp, vLLM o TGI serian viables si se genera una version completa de los pesos, algo que no esta confirmado en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Rev3auth/iris-1.3-lora | 1B (base Gemma 3 1B) | No especificado (base: 32 768) | Apache 2.0 | HuggingFace, 0 descargas |
| unsloth/gemma-3-1b-it | 1B | 32 768 tokens | Gemma (uso sujeta a terminos de Google) | HuggingFace, ampliamente descargado |
| Llama 3.2 1B Instruct | 1B | 128 000 tokens | Llama Community License | HuggingFace / Meta |
| Qwen2.5 1.5B Instruct | 1,5B | 32 768 tokens | Apache 2.0 | HuggingFace / Alibaba |

No se dispone de datos de rendimiento comparativo para el modelo objeto de esta ficha, por lo que la comparacion se limita a parametros, contexto y licencia. Los valores de los modelos alternativos corresponden a la informacion publica de sus fabricantes.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento, lo que impide evaluar sesgos, contaminacion de datos o posibles comportamientos indeseados.
- Riesgo de alucinacion elevado: los modelos de 1B parametros generan con frecuencia informacion incorrecta, especialmente en tareas factuales o matematicas.
- Sesgos: no evaluados. Al no conocerse los datos de ajuste ni su composicion, no puede descartarse la introduccion de sesgos especificos.
- Limitacion idiomatica: el repositorio declara unicamente ingles; el uso en castellano no esta respaldado ni probado.
- Sin validacion externa: 0 descargas y 0 "likes" en el momento de la consulta, sin evaluaciones de terceros ni resultados de benchmarks.
- Naturaleza del artefacto: el tamano del repositorio (0,5 GB) apunta a un adaptador LoRA, no a pesos completos. Para desplegarlo seria necesario fusionar el adaptador con el base o cargarlo como modulo adicional, algo que el autor no documenta.
- Licencia: Apache 2.0 en el repositorio, pero debe tenerse en cuenta que el modelo base Gemma 3 esta sujeto a los terminos de uso de Google, que se mantienen sobre los modelos derivados. Conviene revisar dichos terminos antes de un uso comercial.
- Sin garantia de mantenimiento: la fecha de actualizacion registrada es la misma que la de creacion y no hay indicios de soporte continuado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Rev3auth/iris-1.3-lora
- Modelo base: https://huggingface.co/unsloth/gemma-3-1b-it
- Libreria de entrenamiento Unsloth: https://github.com/unslothai/unsloth
- No se han encontrado articulos, papers, blogs ni demos adicionales asociados a este modelo en la busqueda realizada.
