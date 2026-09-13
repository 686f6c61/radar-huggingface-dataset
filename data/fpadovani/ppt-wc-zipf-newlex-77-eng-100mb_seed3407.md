# fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed3407

## Resumen

`fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed3407` es un ajuste fino (SFT) del modelo monolingue `goldfish-models/eng_latn_100mb`, publicado por el usuario fpadovani, vinculado a un proyecto de Weights & Biases de la Universidad de Groningen (proyecto `white_cotterell`). Se trata de un modelo denso de arquitectura tipo GPT-2 con 86.508.288 parametros reales (verificados en los pesos safetensors), entrenado con la libreria TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.11.0. El nombre del repositorio sugiere un experimento controlado sobre distribuciones de frecuencia tipo Zipf y renovacion de lexico, con una semilla fija (3407), sobre un corpus ingles de 100 MB.

El modelo no es un lanzamiento de produccion: acumula 0 descargas y 0 likes, no publica licencia, no declara idiomas de forma explicita ni incluye resultados de evaluacion. Su interes es fundamentalmente metodologico y de reproducibilidad, dentro de la investigacion sobre preentrenamiento de modelos monolingues de bajo coste y sobre como la composicion del corpus afecta al comportamiento del modelo.

Por su tamano (86,5 M de parametros, ~173 MB en bf16) es un candidato viable para experimentos en CPU, tareas de docencia, validacion de pipelines de SFT y como linea base de comparacion frente a GPT-2 small o DistilGPT-2. Para cualquier uso en produccion con usuarios reales, las limitaciones de licencia, idioma y calidad documentadas mas abajo lo desaconsejan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en el repositorio) |
| Parametros totales | 86.508.288 (dato real de los safetensors) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos safetensors. Al ser un GPT-2, es convertible a GGUF/ONNX con herramientas externas (llama.cpp, optimum) |
| Idiomas soportados | no disponible de forma explicita; el sufijo `eng` del nombre y el modelo base `eng_latn_100mb` indican ingles |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Libreria de inferencia | transformers, text-generation-inference (etiquetas del repositorio) |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Version de framework | Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

La etiqueta `gpt2` del repositorio y la herencia del modelo base Goldfish apuntan a un transformer decoder-only autorregresivo con atencion causal, normalizacion previa y embeddings de tokens aprendidos. Con 86,5 M de parametros, se situa por debajo de GPT-2 small (124 M) y en el rango de DistilGPT-2 (82 M). La longitud de contexto no se declara en la informacion disponible, por lo que no puede confirmarse sin inspeccionar la configuracion del repositorio.

El entrenamiento se realizo con SFT mediante TRL, partiendo de `goldfish-models/eng_latn_100mb`, un modelo de la familia Goldfish entrenado sobre aproximadamente 100 MB de texto en ingles. No se especifican en la informacion disponible el numero de tokens de ajuste, la composicion del dataset de SFT, ni si hubo fases adicionales de RLHF o DPO (la unica tecnica declarada es SFT). La unica innovacion reseñable documentada es de tipo experimental: el nombre `ppt-wc-zipf-newlex-77` y el uso de una semilla fija (3407) sugieren un diseno controlado para estudiar el efecto de la ley de Zipf y de la renovacion de lexico en el preentrenamiento; se trata de una inferencia a partir del nombre del repositorio, no de un dato confirmado en la model card.

## Capacidades

- Generacion de texto autorregresiva en ingles, mediante `pipeline("text-generation")` de Transformers.
- Formato de conversacion basico: el ejemplo de la model card pasa una lista de mensajes con rol `user`, lo que indica una plantilla de chat sencilla aplicada durante el SFT.
- Generacion condicionada por prompt con control de `max_new_tokens` y `return_full_text`.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`).
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles; todo apunta a un unico idioma (ingles).

## Casos de uso

- Reproducibilidad de experimentos academicos: el modelo se publica con una semilla fija (3407) y una ejecucion de W&B; sirve para replicar resultados sobre el efecto de la distribucion Zipf en el preentrenamiento.
- Linea base de comparacion en investigacion sobre corpus: con 86,5 M de parametros y 100 MB de datos, es un punto de referencia barato para medir el impacto de cambios en la composicion del corpus de ajuste.
- Validacion de pipelines de SFT con TRL: util para comprobar de extremo a extremo el flujo `datasets` + `trl` + `transformers` en versiones concretas (TRL 0.23.0, Transformers 4.56.2) antes de escalar a modelos mayores.
- Docencia y formacion: su tamano permite ejecutarlo en un portatil o en CPU para explicar generacion autorregresiva, tokenizacion y decodificacion sin coste de GPU.
- Pruebas de infraestructura de despliegue: al declarar compatibilidad con text-generation-inference y endpoints compatibles, es util como modelo de humo (smoke test) para validar un servidor de inferencia antes de desplegar modelos grandes.
- Prototipado de aplicaciones de texto de baja latencia: generacion de continuaciones cortas o texto de relleno en entornos con recursos muy limitados (CPU, edge, contenedores pequenos).
- Experimentos de ajuste fino adicional: punto de partida para probar tecnicas de alineamiento (DPO, SFT adicional) a bajo coste computacional.
- Analisis de sesgos y de contaminacion de datos: al conocer el origen del corpus (100 MB de ingles) y estar documentado el modelo base, permite estudiar como se filtran sesgos del corpus en un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio acumula 0 descargas, por lo que no existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 346 MB en fp32, 173 MB en fp16/bf16, 87 MB en int8 y 43 MB en int4, calculado sobre 86.508.288 parametros (sin contar cache KV ni activaciones, que a estas escalas son marginales).
- GPU recomendadas: cualquiera con al menos 1 GB de VRAM; funcionan correctamente RTX 3060, RTX 4090, T4, A100 o H100, aunque estan sobredimensionadas para este modelo.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida; tambien es viable en CPU pura.
- Opciones de despliegue: `transformers` con `pipeline`, text-generation-inference (soportado por etiqueta), vLLM (la arquitectura GPT-2 esta soportada de forma general), llama.cpp/Ollama previa conversion a GGUF, y servidores compatibles con la API de endpoints de Hugging Face.
- Latencia y throughput: no disponibles. No se han publicado mediciones, y no deben extrapolarse sin medir en el hardware objetivo.
- Nota sobre el repositorio: los 1,4 GB del repo incluyen pesos y artefactos de entrenamiento, muy por encima de los ~350 MB de los pesos en fp32.

## Comparativa con modelos similares

Los datos de arquitectura, contexto y licencia de GPT-2 small y DistilGPT-2 son valores publicos de referencia ampliamente documentados, no extraidos de la informacion proporcionada sobre este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ppt-wc-zipf-newlex-77-eng-100mb_seed3407 | 86,5 M | no disponible | no disponible | Hugging Face, 0 descargas | Ajuste SFT experimental sobre Goldfish, solo ingles |
| goldfish-models/eng_latn_100mb | no confirmado (misma base arquitectonica) | no disponible | no disponible | Hugging Face | Modelo base monolingue ingles, 100 MB de corpus |
| GPT-2 small | 124 M | 1024 tokens | Modified MIT (pesos OpenAI) | Amplia, ecosistema maduro | Referencia clasica de generacion de texto en ingles |
| DistilGPT-2 | 82 M | 1024 tokens | Apache-2.0 | Amplia, integrado en transformers | Destilado de GPT-2, tamano casi identico a este modelo |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: la model card declara `licence: license` sin texto. No hay autorizacion explicita de uso comercial, por lo que no deberia desplegarse en productos sin aclarar antes los terminos con el autor y con el modelo base.
- Idiomas: no se declaran idiomas soportados; el nombre y el modelo base apuntan exclusivamente a ingles. No hay evidencia de capacidad multilingue.
- Contexto desconocido: al no declararse la longitud de contexto, cualquier integracion que dependa de ventanas largas requiere verificacion previa en el `config.json`.
- Riesgo alto de alucinacion y de texto incoherente: es un modelo de 86,5 M de parametros ajustado sobre un corpus de 100 MB con SFT; su conocimiento factual y su coherencia a largo plazo son muy limitados en comparacion con modelos actuales.
- Sesgos: hereda los sesgos del corpus ingles de 100 MB del modelo base; no se documenta ningun proceso de mitigacion, filtrado o evaluacion de sesgos.
- Sin benchmarks ni evaluaciones de terceros: 0 descargas y 0 likes implican ausencia total de validacion externa.
- Trazabilidad incompleta: no se documentan el dataset de SFT, el numero de tokens de entrenamiento ni los hiperparametros; esto dificulta auditar el modelo.
- Fechas del repositorio: la fecha de creacion indicada (2026-09-13) es posterior a la del conocimiento habitual del ecosistema; conviene verificar la vigencia y el estado del repositorio antes de depender de el.
- No apto para produccion con usuarios finales: carece de soporte de tool calling, agentes, vision y razonamiento multi-paso, y no hay garantias de calidad ni de soporte.
- Uso responsable: al ser un modelo de investigacion sin filtros declarados, puede generar contenido inapropiado si se le induce; requiere moderacion externa si se expone a usuarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/rkdayr9m
- Repositorio de TRL: https://github.com/huggingface/trl
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces devueltos correspondian a sitios sin relacion con el repositorio, por lo que se omiten. No se han localizado papers, blogs ni demos asociados en la informacion disponible.
