# francesca9805/eus-latn-100mb-ppt-mp-struct-core-100mb_seed455

# francesca9805/eus-latn-100mb-ppt-mp-struct-core-100mb_seed455

## Resumen

Se trata de un modelo de generacion de texto de tipo transformer decoder-only, resultado de un ajuste fino supervisado (SFT) sobre el modelo base `goldfish-models/eus_latn_100mb`. El autor del repositorio es el usuario `francesca9805` y el entrenamiento se ha realizado con la libreria TRL (version 0.23.0), tal como se indica en la model card. El modelo tiene 124.770.816 parametros (aproximadamente 125 millones) y un peso de repositorio de 0,3 GB en formato safetensors.

La nomenclatura del identificador y del modelo base (`eus_latn_100mb`) remite a la convencion de los modelos Goldfish, que agrupa modelos monolingues entrenados sobre corpus de unos 100 MB de texto por idioma; el prefijo `eus_latn` corresponde al euskera en alfabeto latino. No obstante, tanto el idioma como la licencia figuran como "no disponible" en los metadatos oficiales del repositorio, por lo que esta interpretacion es una inferencia a partir del nombre y no un dato confirmado por el autor.

Por su tamano y su origen experimental, se trata de un modelo de investigacion orientado a reproducir experimentos de ajuste fino con TRL sobre corpus de bajo recurso, mas que a un despliegue en produccion. En el momento de redactar esta ficha cuenta con 0 descargas y 0 me gusta, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `gpt2`) |
| Parametros totales | 124.770.816 (~125 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre del modelo base sugiere euskera) |
| Licencia | no disponible (la model card indica "licence: license" sin concretar) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/eus_latn_100mb |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-10-09 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder-only con atencion causal auto-regresiva, tal como refleja la etiqueta `gpt2` del repositorio. Al derivar de `goldfish-models/eus_latn_100mb`, hereda la configuracion de dicho modelo base, cuyo detalle completo (numero de capas, dimension oculta, cabezas de atencion y longitud de contexto) no se especifica en la informacion proporcionada. El recuento real de parametros extraido de los pesos safetensors es de 124.770.816.

El procedimiento de entrenamiento consistio en un ajuste fino supervisado (SFT) mediante TRL, segun se declara en la model card. No se detalla la composicion del dataset de ajuste, el numero de tokens ni si se aplicaron tecnicas adicionales como RLHF o DPO. El nombre del modelo (`ppt-mp-struct-core-100mb_seed455`) y el nombre del proyecto de seguimiento en Weights & Biases (`new-tokenizers`) apuntan a un experimento estructurado por semillas y posiblemente vinculado a variantes de tokenizador, aunque no hay documentacion que lo confirme. Las versiones de framework empleadas fueron TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1.

## Capacidades

- Generacion de texto auto-regresiva condicionada por un mensaje de entrada.
- Soporte del formato de conversacion por roles (`{"role": "user", "content": ...}`) en el ejemplo de uso con `pipeline`, lo que sugiere un ajuste orientado a dialogo o instrucciones.
- Inferencia estandar con la libreria transformers y compatibilidad declarada con text-generation-inference y endpoints.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Tool calling / function calling: no disponible, no se menciona soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio o modo de razonamiento explicito (thinking): no disponible.
- Debido a su tamano (~125 M de parametros) y a la ausencia de datos de evaluacion, no cabe esperar capacidades avanzadas de razonamiento, codigo o matematicas.

## Casos de uso

- Reproduccion de experimentos de ajuste fino: el modelo sirve como artefacto reproducible de un pipeline SFT con TRL sobre un modelo Goldfish, util para comparar configuraciones y semillas en entornos academicos.
- Investigacion en lenguas de bajos recursos: si se confirma su naturaleza vasca, puede emplearse como linea base en estudios de modelado de euskera con corpus de ~100 MB.
- Generacion de texto de bajo coste en el borde: con ~125 M de parametros cabe en CPU y GPUs de gama baja, lo que permite prototipos de generacion en dispositivos con recursos limitados.
- Aumento de datos (data augmentation): generacion de texto sintetico para ampliar corpus de entrenamiento en tareas de PLN, siempre con revision humana posterior por el riesgo de alucinacion.
- Docencia y demostraciones: ejemplo practico de ajuste con TRL y despliegue con `pipeline` en cursos de aprendizaje automatico.
- Evaluacion de tokenizadores: dado el nombre del proyecto en W&B (`new-tokenizers`), puede servir para estudiar el efecto de distintas variantes de tokenizacion en el rendimiento de un modelo pequeno.
- Pruebas de infraestructura de inferencia: por su tamano reducido es util para validar despliegues con TGI, endpoints o vLLM antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en fp16 y 0,5 GB en fp32 para los pesos, a lo que hay que sumar el overhead de activaciones y del runtime. En cuantizacion de 8 bits rondaria los 0,15 GB y en 4 bits unos 0,08 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU moderna es suficiente; por ejemplo RTX 3060, RTX 4090, A100 o H100 funcionarian sobradamente. El modelo esta infradimensionado para estos aceleradores.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso integrada, dado su tamano de ~125 M de parametros.
- Despliegue en CPU: viable; el ejemplo de la model card permite usar `device="cuda"` o CPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles (etiqueta `endpoints_compatible`) y, previa conversion, llama.cpp o vLLM. No se distribuyen pesos en GGUF, por lo que Ollama requeriria conversion manual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| francesca9805/eus-latn-100mb-ppt-mp-struct-core-100mb_seed455 | ~125 M | no disponible | no disponible | HuggingFace (0 descargas) |
| goldfish-models/eus_latn_100mb (modelo base) | no disponible | no disponible | no disponible en esta ficha | HuggingFace |
| GPT-2 small | 124 M | 1024 tokens (segun configuracion publica) | licencia MIT (version OpenAI original) | Ampliamente disponible |
| DistilGPT-2 | 82 M | 1024 tokens (segun configuracion publica) | licencia MIT (version OpenAI original) | Ampliamente disponible |

Nota: los datos de contexto y licencia de GPT-2 small y DistilGPT-2 corresponden a sus configuraciones publicas mas habituales y se incluyen a titulo orientativo; no proceden de la informacion proporcionada sobre este modelo. Para las alternativas de la misma categoria no se dispone de comparacion de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se ha documentado ningun analisis de sesgo.
- Riesgo de alucinacion: elevado en terminos relativos, ya que se trata de un modelo pequeno ajustado sobre datos limitados y sin datos de evaluacion que avalen su fidelidad factual.
- Limitaciones de contexto o idioma: se desconoce la longitud de contexto soportada y los idiomas declarados; la model card no los especifica. La inferencia sobre el idioma de trabajo se basa unicamente en la nomenclatura del modelo base.
- Restricciones de licencia para uso comercial: la licencia figura como "no disponible" y la model card indica un campo `licence: license` sin texto legal, por lo que no puede asumirse permiso de uso comercial. Conviene contactar con el autor antes de cualquier uso productivo.
- Ausencia de benchmarks: no existen metricas publicadas de calidad, por lo que no es posible estimar su rendimiento frente a alternativas.
- Modelo experimental: con 0 descargas y 0 me gusta, asi como un nombre que sugiere un experimento por semilla, no hay indicios de validacion por parte de la comunidad.
- Falta de trazabilidad del dataset de SFT: no se documenta el corpus de ajuste, lo que dificulta evaluar riesgos de contaminacion o de memorizacion de datos.
- No apto para tareas criticas: sin datos de evaluacion ni licencia clara, no se recomienda su uso en produccion ni en aplicaciones sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-latn-100mb-ppt-mp-struct-core-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/eus_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Seguimiento del entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/c6tctyha
- Cita de TRL (von Werra et al.): incluida en la model card del repositorio.
