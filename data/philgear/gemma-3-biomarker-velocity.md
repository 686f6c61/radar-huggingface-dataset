# philgear/gemma-3-biomarker-velocity

## Resumen

PocketGull Gemma 3 Biomarker Velocity & Resilience Forecaster es un adaptador LoRA sobre el modelo base `google/gemma-3-4b-it`, publicado por Phillip Gear bajo la organizacion PocketGull LLC. Su proposito declarado es calcular la derivada primera (velocidad de cambio) de biomarcadores en paneles sanguineos longitudinales y pronosticar la degradacion organica silente. Se trata, por tanto, de un ajuste fino de dominio clinico y no de un modelo fundacional nuevo: hereda la arquitectura y el conocimiento general de Gemma 3 4B y anade un comportamiento especializado mediante preferencias.

El modelo base Gemma 3 4B es un transformer decoder-only de Google DeepMind disenado para ejecutarse en una sola GPU o TPU, con una ventana de contexto de 128 000 tokens, soporte de mas de 140 idiomas y capacidad de function calling. El adaptador se distribuye con licencia Apache 2.0 y formato PEFT, lo que permite cargarlo sobre los pesos originales sin duplicar el modelo completo.

La relevancia de esta ficha es doble: por un lado, ilustra el patron de especializacion de modelos abiertos pequenos mediante LoRA y DPO en nichos regulados como la sanidad; por otro, conviene leer sus afirmaciones de cumplimiento (HIPAA Safe Harbor, no-dispositivo FDA 520(o)) con cautela, ya que son declaraciones del autor y no certificaciones verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA/PEFT |
| Parametros totales | 4B en el modelo base; el adaptador LoRA anade un numero de parametros no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada de Gemma 3 4B) |
| Tipos de cuantizacion | No disponible en la model card; el modelo base admite cuantizaciones habituales (int8, int4) via herramientas estandar |
| Idiomas soportados | Ingles declarado en la model card; el modelo base soporta mas de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador PEFT (safetensors) sobre `google/gemma-3-4b-it` |

## Arquitectura y entrenamiento

El adaptador se apoya en `google/gemma-3-4b-it`, un transformer decoder-only de 4 000 millones de parametros con atencion multi-cabeza, contexto de 128 000 tokens y capacidad multimodal de texto e imagen en el modelo base. El adaptador en si es un modulo LoRA cargado mediante la libreria PEFT, que modifica un subconjunto de las matrices de pesos del modelo base sin reentrenarlo por completo.

Segun la model card, el ajuste se realizo mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clinicos de dominio especifico, de-identificados conforme al estandar HIPAA §164.514 Safe Harbor. No se especifican en la informacion disponible el volumen de datos, la composicion exacta del dataset, el rango del adaptador, el numero de pasos de entrenamiento ni los hiperparametros. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio ajuste por preferencias.

## Capacidades

- Generacion de texto especializada en el calculo de tasas de cambio (derivada primera) de biomarcadores a lo largo de paneles sanguineos seriados.
- Pronostico cualitativo de degradacion organica ("resiliencia organica") a partir de tendencias longitudinales.
- Razonamiento sobre series temporales clinicas expresadas en lenguaje natural (por ejemplo, eGFR o hs-CRP en varios trimestres).
- Hereda del modelo base la capacidad de function calling y tool calling.
- Hereda del modelo base el soporte multilingue (mas de 140 idiomas), aunque el ajuste esta orientado al ingles.
- Hereda del modelo base la capacidad de razonamiento sobre imagenes, si bien el adaptador no declara entrenamiento especifico en vision clinica.
- Formato de interaccion conversacional (modelo base `-it`, instruction-tuned).

## Casos de uso

- Seguimiento de funcion renal en consulta: el modelo puede recibir una serie de valores de eGFR de varios trimestres y estimar la pendiente de deterioro, como en el ejemplo de la model card (88 -> 79 -> 71 mL/min/1.73m2), para apoyar la decision clinica de derivacion a nefrologia.
- Monitorizacion de inflamacion cronica: a partir de series de hs-CRP (por ejemplo 1,1 -> 2,4 -> 3,8 mg/L), el adaptador puede describir la tendencia y sugerir umbrales de vigilancia, integrable en un panel de analitica periodica.
- Investigacion clinica retrospectiva: procesamiento por lotes de cohortes con paneles seriados para generar primeras hipotesis sobre velocidades de cambio de biomarcadores antes de un analisis estadistico formal.
- Sistemas de alerta temprana en plataformas de historia clinica electronica: el modelo puede clasificar tendencias y generar resumenes en lenguaje natural para el profesional, con despliegue local para evitar la salida de datos del perimetro del centro.
- Formacion medica: generacion de ejercicios y explicaciones sobre interpretacion de tendencias longitudinales de analiticas, usando el modelo como tutor con temperatura baja.
- Prototipado de asistentes clinicos especializados: base para equipos que quieran experimentar con ajuste fino de dominio sobre Gemma 3 4B sin partir de cero, aprovechando el formato PEFT para iterar rapidamente.
- Despliegue en el borde (edge): al ser un adaptador sobre un modelo de 4B, puede ejecutarse en una estacion de trabajo con GPU consumer, lo que encaja con el objetivo declarado de "zero-PHI retention" mediante computo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 8-10 GB solo para los pesos del modelo base de 4B, mas overhead de activaciones y KV cache; con contexto de 128 000 tokens el consumo de KV cache crece de forma significativa y puede requerir 20 GB o mas.
- Cuantizacion int8: aproximadamente 4-5 GB de pesos, viable en GPUs consumer de gama media-alta.
- Cuantizacion int4: aproximadamente 2,5-3 GB de pesos, viable en GPUs consumer de 8 GB, con perdida de calidad no cuantificada en la informacion disponible.
- GPUs recomendadas: A100 40/80 GB o H100 para contexto largo y despliegue concurrente; RTX 4090 (24 GB) para inferencia comoda en bf16 con contexto moderado; RTX 3090, RTX 4080 o RTX 4070 Ti para cuantizaciones.
- Cabe en GPU consumer: si, en tarjetas de 8 GB o mas con cuantizacion, y en 16-24 GB en bf16 con contexto reducido.
- Opciones de despliegue: Transformers + PEFT (patron documentado en la model card), vLLM (requiere fusionar el adaptador o usar soporte LoRA), llama.cpp/Ollama (previa conversion a GGUF del modelo fusionado), TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| philgear/gemma-3-biomarker-velocity | 4B (base) + LoRA | 128 000 | Biomarcadores clinicos y pronostico organico | Apache 2.0 | Hugging Face (0 descargas) |
| google/gemma-3-4b-it | 4B | 128 000 | Proposito general, texto e imagen | Gemma Terms of Use | Hugging Face,广泛mente adoptado |
| Qwen2.5-3B-Instruct | 3B | 32 768 | Proposito general, multilingue | Apache 2.0 | Hugging Face |
| Llama 3.2 3B Instruct | 3B | 128 000 | Proposito general, multilingue | Llama 3.2 Community License | Hugging Face |

La comparativa con modelos de proposito general es solo orientativa: el valor del adaptador reside en su especializacion de dominio, no en su rendimiento en tareas generales, para el cual no hay datos publicados.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones clinicas independientes; el rendimiento real en tareas de pronostico de biomarcadores es desconocido.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir valores, tendencias o recomendaciones clinicas plausibles pero incorrectas. No debe usarse como unico criterio de decision medica.
- Las afirmaciones de cumplimiento HIPAA Safe Harbor y de no-dispositivo FDA 520(o) son declaraciones del autor, no certificaciones auditadas de forma independiente.
- El ajuste esta orientado al ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- El modelo no ha sido validado para poblaciones, unidades de medida o rangos de referencia distintos de los usados en el dataset de entrenamiento, que no se detalla.
- Licencia Apache 2.0 en el adaptador, pero el uso del modelo base esta sujeto ademas a los terminos de Gemma de Google; conviene revisar ambas condiciones antes de un despliegue comercial.
- Con 0 descargas y 0 likes, no hay evidencia de uso comunitario ni de validacion por terceros.
- No debe presentarse como herramienta de diagnostico autonomo; cualquier uso en produccion sanitaria requiere supervision de un profesional licenciado y validacion regulatoria local.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/philgear/gemma-3-biomarker-velocity
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Pagina de Gemma 3 en Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Blog de anuncio de Gemma 3: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-3/
- DOI de Zenodo citado por el autor: https://doi.org/10.5281/zenodo.20647514
- Sitio del autor: https://pocketgull.app
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
