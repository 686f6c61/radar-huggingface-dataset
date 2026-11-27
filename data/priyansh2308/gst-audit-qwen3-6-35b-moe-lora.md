# priyansh2308/gst-audit-qwen3.6-35b-moe-lora

## Resumen

GST-Audit Qwen3.6-35B-A3B MoE LoRA es un adaptador PEFT de tipo LoRA publicado por el usuario priyansh2308 sobre el modelo base Qwen/Qwen3.6-35B-A3B, un transformer de mezcla de expertos (MoE) con 35.000 millones de parametros totales y 3.000 millones activos por token. El adaptador no modifica la arquitectura del modelo base: anade pesos de bajo rango sobre las proyecciones `q_proj` y `v_proj` de la atencion, con rango 8 y alpha 8, entrenados para una tarea vertical muy concreta.

El objetivo del modelo es la extraccion estructurada de datos y la auditoria de cumplimiento de facturas B2B bajo la ley india del Goods and Services Tax (GST). El adaptador convierte facturas ruidosas o sin formato en JSON fuertemente tipado conforme al esquema `extraction.v2`, que despues alimenta un motor determinista de reglas estatutarias. Cubre aspectos como el ambito CGST/SGST/IGST, las reglas de lugar de suministro (secciones 7 y 8), las clausulas obligatorias de la regla 46 y los mecanismos de inversión del sujeto pasivo (reverse charge).

Es relevante ahora porque ejemplifica un patron creciente en IA open source: adaptadores LoRA pequenos y especializados sobre modelos MoE grandes que se pueden servir con un coste de inferencia bajo (solo 3B de parametros activos) manteniendo el conocimiento de dominio del modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo figura como 0.0 GB, lo que sugiere que los pesos del adaptador aun no se han subido o no estan disponibles publicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base Qwen3.6-35B-A3B) con adaptador LoRA sobre `q_proj` y `v_proj` |
| Parametros totales | 35B (modelo base); parametros del adaptador no disponibles |
| Parametros activos | 3B por token (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (bitsandbytes) segun tags; otras no disponibles |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT); modelo base en safetensors |
| Rango LoRA | 8 |
| Alpha LoRA | 8 |
| Modulos objetivo | `q_proj`, `v_proj` |
| Learning rate | 1e-4 (cosine, warmup 0.1) |
| Framework de entrenamiento | Adaption AutoScientist (Bayesian Hyperparameter Sweep, 8x H100) |
| Run ID | `aa60178b-5e46-470b-b1a9-56047419b0d3` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.6-35B-A3B, un modelo de lenguaje de arquitectura transformer con mezcla de expertos que activa aproximadamente 3.000 millones de parametros por token de un total de 35.000 millones. La intervencion consiste en un LoRA de rango 8 y alpha 8 limitado a las proyecciones de query y value de la atencion, lo que mantiene el coste de almacenamiento y de entrenamiento muy bajo respecto al modelo completo. El entrenamiento se realizo en un cluster de 8 GPU H100 mediante Adaption AutoScientist, un sistema de barrido bayesiano automatico de hiperparametros.

El conjunto de datos de entrenamiento consta de 13.920 pares de facturas B2B indias aumentadas, anotadas conforme a la normativa estatutaria: ambito CGST/SGST/IGST, reglas de lugar de suministro de las secciones 7 y 8, clausulas obligatorias de la regla 46 y mecanismos de reverse charge. No se especifica en la informacion disponible el volumen total de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El autor reporta una tasa de victoria del 42,08 % frente al modelo base en una evaluacion automatica con LLM, metrica que conviene interpretar con cautela porque no se detalla la metodologia del juez ni el tamano de la muestra.

## Capacidades

- Generacion de texto conversacional y extraccion de informacion estructurada a partir de documentos.
- Extraccion de datos de facturas: identificadores, partes, lineas de detalle, impuestos y totales, en JSON conforme al esquema `extraction.v2`.
- Razonamiento sobre normativa fiscal india del GST: clasificacion de suministros, lugar de suministro y aplicacion de reverse charge.
- Auditoria de cumplimiento: verificacion de clausulas obligatorias de la regla 46 y deteccion de incoherencias entre lineas de factura e impuestos.
- Procesamiento de entradas ruidosas o sin formato fijo (facturas escaneadas con OCR imperfecto, plantillas heterogeneas).
- Capacidades del modelo base heredadas (razonamiento general, codigo, matematicas) no evaluadas especificamente para este adaptador.
- Soporte de tool calling y de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card; el modelo base podria tener otras, pero no se documentan para el adaptador.

## Casos de uso

- Extraccion automatizada de facturas B2B: el adaptador convierte facturas sin formato fijo en JSON tipado que alimenta un motor de reglas determinista, reduciendo el trabajo manual en departamentos de cuentas a pagar.
- Auditoria de cumplimiento del GST: se usa para verificar que cada factura incluye las clausulas obligatorias de la regla 46 y que los tipos y desgloses de impuestos (CGST/SGST/IGST) son coherentes con el lugar de suministro declarado.
- Deteccion de reverse charge: el modelo identifica suministros sujetos a inversion del sujeto pasivo y marca los campos correspondientes para revision humana.
- Conciliacion de libros fiscales: al producir salidas estructuradas y consistentes, los resultados se pueden comparar automaticamente con los asientos contables y generar listas de excepciones.
- Preprocesado para plataformas de cumplimiento fiscal: el adaptador actua como primera etapa de un pipeline que despues aplica validaciones deterministas, separando la extraccion semantica del razonamiento normativo.
- Prototipado de asistentes legales-fiscales: con un LoRA de bajo rango y un modelo MoE de 3B activos, es viable desplegar un asistente especializado en GST en entornos con presupuesto de GPU limitado.
- Generacion de datos de prueba anotados: el modelo puede producir ejemplos de facturas con campos estructurados para validar reglas del motor fiscal en entornos de desarrollo.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Win rate vs modelo base | 42,08 % | Evaluacion automatica con LLM; metodologia no detallada |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base en bf16: aproximadamente 70 GB, por encima de cualquier GPU de consumo individual; requiere multiples GPU o una GPU de 80 GB.
- VRAM estimada con cuantizacion 4-bit (bitsandbytes): en torno a 20-22 GB para los pesos, mas overhead de activaciones y cache KV; encaja en una RTX 4090 de 24 GB solo con margen ajustado.
- GPU recomendadas: A100 80 GB, H100 80 GB para precision completa o bf16; RTX 4090 o L40S para despliegue 4-bit.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con cuantizacion 4-bit y contexto moderado; en GPUs de 16 GB no es viable sin cuantizaciones mas agresivas no documentadas.
- Opciones de despliegue: transformers + peft (patron documentado en la model card); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponibles. Al activar solo 3B de parametros por token, el coste de computo por token es inferior al de un modelo denso de 35B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| GST-Audit Qwen3.6-35B-A3B LoRA | 35B (base) | 3B | no disponible | apache-2.0 | Adaptador LoRA para extraccion y auditoria GST |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | no disponible | Modelo generalista sin especializacion fiscal |
| Adaptadores legales-fiscales publicos comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de alternativas equivalentes |

La comparativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada; no se documentan otros adaptadores GST con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Ambito geografico y normativo restringido: el adaptador esta entrenado exclusivamente para la normativa GST india; su uso con otras jurisdicciones fiscales no esta validado.
- Idioma: la model card declara solo ingles; el tratamiento de facturas en hindi u otros idiomas indios no esta documentado.
- Riesgo de alucinacion en campos extraidos: al ser un modelo generativo, puede inventar identificadores, importes o tipos impositivos; la salida debe validarse con el motor determinista y con revision humana.
- Win rate del 42,08 % inferior al 50 %: segun la metrica reportada, el adaptador no supera de forma consistente al modelo base en la evaluacion automatica, lo que cuestiona la mejora real en tareas generales.
- Disponibilidad dudosa: el repositorio muestra 0.0 GB de tamano y 0 descargas, por lo que los pesos del adaptador podrian no estar publicados; conviene verificar antes de integrarlo.
- Sesgos: no documentados; al entrenarse con facturas sinteticas o aumentadas, puede no representar la distribucion real de documentos de produccion.
- Licencia apache-2.0 permisiva para uso comercial, pero la licencia del modelo base Qwen3.6-35B-A3B no se detalla en la informacion disponible y debe verificarse por separado.
- Sin soporte documentado de tool calling, agentes o modos de razonamiento extendido; no se debe asumir que estas capacidades del modelo base se conservan tras el ajuste.
- No apto como sustituto de asesoramiento fiscal profesional: los resultados deben tratarse como extraccion asistida, no como dictamen normativo.

## Enlaces

- Hugging Face: https://huggingface.co/priyansh2308/gst-audit-qwen3.6-35b-moe-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Adaption Adaptive Intelligence Challenge (Adaption x HackCulture): no disponible
- Paper o blog tecnico del adaptador: no disponible
- Repositorio de codigo: no disponible
