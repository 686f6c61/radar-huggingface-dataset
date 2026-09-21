# AshCodes1895/price-lora

## Resumen

`AshCodes1895/price-lora` es un ajuste fino supervisado (SFT) del modelo `meta-llama/Llama-3.2-3B`, publicado por el usuario AshCodes1895 a través de la librería Transformers y la herramienta TRL. El repositorio se generó automáticamente con el flujo `generated_from_trainer` de TRL, lo que indica que se trata de un experimento de entrenamiento más que de un modelo con documentación de producto. El propio autor no ha publicado pipeline, licencia, idiomas ni datos de entrenamiento en la ficha.

El modelo hereda del base la arquitectura transformer decoder-only de Llama 3.2 3B (aproximadamente 3.210 millones de parámetros, atención con GQA y ventana de contexto de hasta 128.000 tokens según la documentación pública de Meta), pero ninguna de esas especificaciones se confirma en la ficha del autor. El repositorio ocupa 1,6 GB, un tamano inferior al de un checkpoint completo en bf16 (unos 6,4 GB), lo que sugiere que contiene solo adaptadores LoRA, pesos parciales o una conversión cuantizada, sin que el autor lo aclare.

La relevancia de esta ficha es limitada y debe leerse como advertencia: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, no incluye evaluación alguna y su model card apunta a un identificador de repositorio distinto (`ed-donner/price-2025-11-28_18.47.07`) y a una ejecución de Weights & Biases ajena. Es, por tanto, un artefacto útil como ejemplo de pipeline TRL, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.2 3B); no detallada en la ficha del autor |
| Parametros totales | No disponible en la ficha; el modelo base declara ~3,21 mil millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha; el modelo base soporta hasta 128.000 tokens |
| Tipos de cuantizacion | No disponible; no se publican versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible; el modelo base declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | No disponible; la ficha contiene un marcador de posicion (`licence: license`) sin texto legal |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 1,6 GB |
| Modelo base | meta-llama/Llama-3.2-3B |
| Metodo de ajuste | SFT con TRL 0.25.1 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura aportada por el autor mas alla de la herencia del modelo base. `meta-llama/Llama-3.2-3B` es un transformer decoder-only denso de aproximadamente 3.210 millones de parametros, con normalizacion RMSNorm, activacion SwiGLU, RoPE y atencion con consultas agrupadas (GQA). El vocabulario del base es de 128.256 tokens y su ventana de contexto nominal alcanza los 128.000 tokens. Ninguno de estos datos aparece confirmado en la model card de `price-lora`.

El entrenamiento se realizo con SFT (supervised fine-tuning) mediante TRL 0.25.1, sobre Transformers 4.57.2, PyTorch 2.9.0+cu126, Datasets 4.0.0 y Tokenizers 0.22.1. La ficha enlaza una ejecucion de Weights & Biases alojada en la cuenta `ed-donner`, no en la del autor, y el ejemplo de codigo apunta al repositorio `ed-donner/price-2025-11-28_18.47.07`. Esto sugiere que `price-lora` es una copia, renombrado o derivado de un modelo entrenado en el contexto de otro proyecto. No se indican numero de tokens de entrenamiento, composicion del dataset, si hubo etapas de RLHF o DPO, ni hiperparametros como tasa de aprendizaje o numero de epocas. Tampoco se documenta ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, destilacion, etc.).

## Capacidades

- Generacion de texto generica: al derivar de Llama 3.2 3B, se espera que conserve la capacidad base de continuar y responder texto, aunque el ajuste SFT puede haberla especializado o degradado en dominios no cubiertos por el dataset.
- Razonamiento y matematicas basicas: capacidad heredada del modelo base, sin verificacion publicada tras el ajuste.
- Generacion de codigo: capacidad heredada del base, no evaluada ni documentada por el autor.
- Tool calling / function calling: no documentado. El modelo base Llama 3.2 3B incluye soporte de llamadas a herramientas, pero no hay confirmacion de que el ajuste lo preserve.
- Uso como agente y razonamiento multi-paso: no disponible; no se publican plantillas de prompt, formato de conversacion ni roles soportados mas alla del ejemplo con `[{"role": "user", "content": ...}]`.
- Capacidades multilingues: no documentadas para el ajuste; el base declara 8 idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. No se documenta ninguna.
- Formato de inferencia: compatible con `transformers.pipeline` y con `endpoints_compatible` segun las etiquetas del repositorio.

## Casos de uso

- Prototipado de pipelines SFT con TRL: el modelo sirve como referencia reproducible para comprobar el formato de salida de `SFTTrainer`, los ficheros de configuracion y la integracion con Weights & Biases. Es su uso mas realista dado el estado del repositorio.
- Docencia y aprendizaje de fine-tuning: permite ilustrar como se publica un ajuste de Llama 3.2 3B en el Hub, que artefactos se generan y que metadatos conviene incluir (y cuales faltan en este caso).
- Pruebas de infraestructura de despliegue: util para verificar que un endpoint, un servidor vLLM o un contenedor de TGI cargan correctamente un peso derivado de Llama 3.2 3B antes de invertir en un modelo con soporte.
- Evaluacion comparativa de ajustes pequenos: como linea base de un experimento propio de SFT sobre el mismo base, siempre que se documenten las condiciones de entrenamiento ausentes aqui.
- Generacion de texto en dominios relacionados con precios o tarifas: el nombre `price` sugiere un ajuste orientado a ese dominio, pero no hay evidencia publicada de la tarea, el dataset ni la calidad, por lo que solo seria asumible tras una evaluacion propia.
- Experimentos de bajo coste en una sola GPU de consumo: al derivar de un modelo de 3B, puede ejecutarse en hardware modesto, lo que facilita pruebas exploratorias sin clúster.
- Fine-tuning adicional sobre el propio ajuste: puede emplearse como punto de partida para experimentos de investigacion, asumiendo que la licencia del base (Llama 3.2 Community License) sigue aplicando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La ficha no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y tampoco se ha encontrado documentacion externa en la busqueda web realizada (los resultados obtenidos corresponden a paginas corporativas de Microsoft, sin relacion con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del modelo base Llama 3.2 3B, no confirmada por el autor):
  - bf16/fp16: aproximadamente 6,5 GB de pesos mas activaciones y cache KV; en la practica se recomienda 8-10 GB.
  - int8 (bitsandbytes o similar): en torno a 3,5-4 GB.
  - 4 bits (QLoRA/NF4): en torno a 2,2-2,8 GB.
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 en bf16 sin cuantizar.
  - Profesional: A100 40/80 GB, H100 80 GB o L40S para despliegue con concurrencia alta; en estos casos el modelo es muy pequeno y el cuello de botella sera la memoria de la cache KV por la ventana de contexto del base.
- Cabe en GPU de consumo: si, con 8 GB o mas para bf16 y con 4 GB o mas para cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` con `pipeline` o `AutoModelForCausalLM`; vLLM (soporta adaptadores LoRA y modelos fusionados); TGI; llama.cpp y Ollama solo si se convierte a GGUF, conversion que no se ha publicado.
- Latencia y throughput: no disponibles. No hay mediciones de tokens por segundo, TTFT ni pruebas de carga.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos corresponden a su documentacion publica.

| Modelo | Parametros | Contexto | Licencia | Valoracion para este caso |
|---|---|---|---|---|
| AshCodes1895/price-lora | ~3,21 B (base) | No disponible (base: 128.000) | No disponible | Sin evaluacion, sin licencia declarada, sin dataset documentado |
| meta-llama/Llama-3.2-3B | ~3,21 B | 128.000 tokens | Llama 3.2 Community License | Base oficial, documentado y con soporte de todo el ecosistema |
| meta-llama/Llama-3.2-3B-Instruct | ~3,21 B | 128.000 tokens | Llama 3.2 Community License | Alternativa directa si se busca instruccion generalista con evaluacion publicada |
| Qwen2.5-3B / Qwen2.5-3B-Instruct | ~3,1 B | 32.768 tokens, ampliable a 128.000 | Apache 2.0 (variantes) | Licencia permisiva y benchmarks publicados; contexto menor en configuracion estandar |
| Gemma 2 2B | ~2,6 B | 8.192 tokens | Gemma Terms of Use | Mas pequeno y con menos contexto, pero documentado y evaluado |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, pruebas humanas ni metricas de perdida publicadas, por lo que no puede afirmarse nada sobre la calidad del ajuste.
- Licencia sin definir: la ficha incluye `licence: license` como marcador de posicion. Al derivar de Llama 3.2, se heredan las restricciones de la Llama 3.2 Community License (incluida la clausula de licencia adicional para productos con mas de 700 millones de usuarios mensuales y las condiciones de atribucion). Cualquier uso comercial exige verificar esa licencia con Meta, no con el autor del ajuste.
- Procedencia dudosa: la model card apunta a `ed-donner/price-2025-11-28_18.47.07` y a una ejecucion de W&B de otra cuenta. No se aclara si `price-lora` es el mismo modelo renombrado, una copia parcial o un artefacto derivado.
- Error en el ejemplo de codigo publicado: usa `pipeline("text-generation", ..., device="cuda")`, parametro que no corresponde a esa API en las versiones recientes de Transformers, y ademas referencia un identificador de modelo distinto al del repositorio. No debe copiarse tal cual.
- Discrepancia de tamano: el repositorio ocupa 1,6 GB, muy por debajo de los ~6,4 GB de un checkpoint de 3B en bf16. Es probable que contenga solo adaptadores o pesos incompletos; conviene inspeccionar los ficheros antes de intentar cargarlo.
- Riesgo de alucinacion: inherente a los modelos de 3.000 millones de parametros, y agravado por la falta de ajuste por preferencias (no se documenta RLHF ni DPO).
- Sesgos: no se documenta ninguna auditoria de sesgo, toxicidad o seguridad. El dataset de SFT es desconocido, por lo que el ajuste puede haber amplificado sesgos presentes en esos datos.
- Limitaciones de contexto e idioma: no confirmadas para el ajuste; los datos de entrenamiento pueden estar solo en un idioma o dominio, lo que degradaria el resto.
- Sin garantias de soporte: 0 descargas y 0 likes, sin mantenimiento declarado, sin versionado semantico ni issues abiertos.
- No apto para produccion sin evaluacion previa propia: no debe desplegarse en atencion al cliente, generacion de codigo ni decisiones automatizadas sin validacion en el caso de uso concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AshCodes1895/price-lora
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de Weights & Biases referenciada en la ficha: https://wandb.ai/ed-donner/price/runs/5qbw6oh4
- Repositorio de referencia citado en el ejemplo de la ficha: https://huggingface.co/ed-donner/price-2025-11-28_18.47.07
- Citation de TRL incluida en la model card: von Werra et al., «TRL: Transformer Reinforcement Learning», 2020.

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los unicos resultados obtenidos fueron paginas corporativas de Microsoft, sin vinculacion con el artefacto.
