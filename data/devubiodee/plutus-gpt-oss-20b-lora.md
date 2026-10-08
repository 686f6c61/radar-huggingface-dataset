# Devubiodee/plutus-gpt-oss-20b-lora

## Resumen
plutus-gpt-oss-20b-lora es un adaptador LoRA publicado por el usuario Devubiodee sobre el modelo base unsloth/gpt-oss-20b-unsloth-bnb-4bit, que a su vez es una version cuantizada en 4 bits (bitsandbytes) del gpt-oss-20b de OpenAI. El repositorio contiene unicamente los pesos del adaptador, con un tamano de 0,4 GB, y no los pesos completos del modelo, por lo que para ejecutarlo hay que descargar el modelo base y cargar el adaptador encima o fusionarlo.

El entrenamiento se ha realizado con SFT (supervised fine-tuning) mediante la libreria TRL, segun declara la propia model card. No se documentan ni el conjunto de datos, ni el numero de tokens, ni el objetivo concreto de la adaptacion: la model card es la plantilla autogenerada y la seccion de datos de entrenamiento aparece vacia.

Su relevancia practica deriva del modelo base: gpt-oss-20b es una mezcla de expertos (MoE) abierta de aproximadamente 21.000 millones de parametros totales y unos 3.600 millones activos, con 128.000 tokens de contexto, lo que permite ejecutar un adaptador especializado en una sola GPU de consumo. La ausencia de licencia declarada, de benchmarks y de documentacion del dataset limita, no obstante, cualquier uso en produccion sin una evaluacion previa.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer de mezcla de expertos (MoE) heredado de gpt-oss-20b |
| Parametros totales | ~21.000 millones en el modelo base (dato publico del modelo base, no incluido en la informacion proporcionada); el adaptador ocupa 0,4 GB en disco |
| Parametros activos | ~3.600 millones en el modelo base (dato publico del modelo base) |
| Longitud de contexto | 128.000 tokens en el modelo base (heredado; no confirmado por el autor del adaptador) |
| Tipos de cuantizacion | El adaptador se entreno sobre una version bnb-4bit; el modelo base se publica en MXFP4. No se ofrecen cuantizaciones GGUF ni AWQ para este adaptador |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el campo YAML contiene el literal "license"); la licencia del modelo base gpt-oss-20b es Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |
| Tipo de artefacto | Adaptador LoRA, no pesos completos |
| Modelo base | unsloth/gpt-oss-20b-unsloth-bnb-4bit |
| Metodo de entrenamiento | SFT con TRL |
| Tamano del repositorio | 0,4 GB |
| Fecha de publicacion | 8 de octubre de 2026 (creacion); ultima actualizacion el mismo dia |
| Descargas y likes | 0 descargas, 0 likes |

## Arquitectura y entrenamiento
El artefacto publicado es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del gpt-oss-20b de OpenAI: un transformer decoder-only con mezcla de expertos, atencion con consultas agrupadas (GQA) y atencion alterna densa y de banda local, con aproximadamente 21.000 millones de parametros totales de los que se activan unos 3.600 millones por token. El modelo base utilizado por el autor es la variante de unsloth cuantizada en 4 bits con bitsandbytes, empleada habitualmente para reducir el consumo de VRAM durante el fine-tuning.

El entrenamiento se realizo con SFT supervisado usando TRL 1.13.0, Transformers 5.17.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2, segun las versiones declaradas en la model card. No se especifican hiperparametros (rango del LoRA, alpha, tasa de aprendizaje, numero de epocas), ni composicion del dataset, ni si hubo etapas posteriores de preferencia (DPO, RLHF). Tampoco se indica si el adaptador debe fusionarse con el modelo base original o con la version cuantizada, detalle relevante porque fusionar sobre pesos cuantizados en 4 bits degrada la calidad resultante.

## Capacidades
Las siguientes capacidades corresponden al modelo base y el autor no aporta ninguna evaluacion que confirme que el adaptador las conserva. Deben tratarse como expectativas, no como hechos verificados.

- Generacion de texto y razonamiento en varios pasos, con modos de esfuerzo de razonamiento configurables en el modelo base.
- Generacion de codigo, incluida la resolucion de tareas de programacion de dificultad media.
- Razonamiento matematico basico y de varios pasos.
- Soporte de tool calling y function calling en el modelo base, orientado a flujos con herramientas externas.
- Comportamiento agentico: encadenamiento de llamadas a herramientas y razonamiento multi-turno.
- Ventana de contexto de 128.000 tokens en el modelo base, apta para documentos extensos.
- Capacidades multilingues: no documentadas para este adaptador; el modelo base esta entrenado principalmente en ingles.
- Capacidad especial: no se documenta ninguna capacidad adicional (vision, audio) ni un modo de pensamiento propio del adaptador.

## Casos de uso
- Asistente conversacional de dominio: el adaptador puede desplegarse como capa de ajuste de estilo o de terminologia sobre el modelo base para respuestas multi-turno, apoyandose en los 128.000 tokens de contexto del base para mantener el hilo de conversaciones largas. Requiere validacion previa, ya que no se documenta el dataset de ajuste.
- Analisis de documentos extensos: informes, contratos o expedientes que no caben en ventanas de 8.000 o 32.000 tokens pueden procesarse en una sola pasada gracias al contexto del modelo base, con el adaptador aplicado para el formato de salida deseado.
- Prototipado de adaptadores en investigacion: al ser un LoRA de 0,4 GB entrenado con Unsloth sobre una base en 4 bits, sirve como ejemplo reproducible de pipeline SFT de bajo coste y como punto de partida para nuevos ajustes.
- Generacion de codigo asistida en entornos de desarrollo: el soporte de tool calling del modelo base permite integrar el modelo en asistentes de editor que consultan repositorios, ejecutan tests o generan parches, siempre que la perdida de calidad introducida por el ajuste se mida antes.
- Despliegue en una unica GPU de consumo: al mantener los costes de inferencia de un MoE con 3.600 millones de parametros activos, es viable servir el modelo en una RTX 4090 o RTX 3090 para uso individual o equipos pequenos.
- Experimentos de evaluacion comparativa: permite medir el efecto de un SFT concreto comparando el modelo base con la version ajustada sobre el mismo conjunto de validacion, util para decidir si el ajuste aporta valor.
- Automatizacion de flujos internos con agentes: tareas de extraccion, clasificacion y resumen encadenadas mediante llamadas a funciones, con la salvedad de que la robustez del adaptador frente a errores de formato no esta documentada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Comparacion con el modelo base | no disponible |
| Evaluacion del dataset de ajuste | no disponible |

## Requisitos de hardware
Estimaciones basadas en el tamano del modelo base; el autor no publica mediciones.

- VRAM en 4 bits: aproximadamente 12-14 GB solo para los pesos del modelo base, mas la cache KV (unos 6 GB si se llena la ventana de 128.000 tokens), lo que situa el total en torno a 20-22 GB.
- VRAM en bf16 o fp16: en torno a 42-45 GB, fuera del alcance de GPU de consumo.
- Adaptador: 0,4 GB en disco; el coste adicional en VRAM es marginal si se carga como LoRA y no se fusiona.
- GPU de consumo: cabe en RTX 4090, RTX 3090 o RTX 5090 (24-32 GB) con contexto completo, con margen ajustado; en RTX 4080 de 16 GB solo con contexto reducido y cuantizacion agresiva.
- GPU de centro de datos: L40S o A6000 (48 GB) para contexto completo con lotes mayores; H100 de 80 GB para despliegues con concurrencia alta.
- Opciones de despliegue: vLLM y TGI para servicio en produccion, llama.cpp y Ollama para ejecucion local en formato cuantizado del base, y Transformers con PEFT para cargar el adaptador sobre el modelo base.
- Latencia y rendimiento: no disponibles. Como referencia estructural, un MoE con 3.600 millones de parametros activos decodifica a una velocidad cercana a la de un modelo denso de 4.000 millones, condicionada por el ancho de banda de memoria de la GPU.

## Comparativa con modelos similares
Los datos de la tabla corresponden a la documentacion publica de cada modelo base y no a la informacion proporcionada sobre este repositorio. Cualquier comparacion de calidad con el adaptador es imposible al no existir benchmarks publicados.

| Modelo | Parametros totales / activos | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| plutus-gpt-oss-20b-lora | Adaptador sobre ~21.000 M (MoE, ~3.600 M activos) | 128.000 tokens (heredado) | no disponible | Adaptador LoRA |
| gpt-oss-20b (base) | ~21.000 M / ~3.600 M activos | 128.000 tokens | Apache 2.0 | MoE denso cuantizado |
| gpt-oss-120b | ~117.000 M / ~5.100 M activos | 128.000 tokens | Apache 2.0 | MoE |
| Qwen3-30B-A3B | ~30.000 M / ~3.000 M activos | 32.000 tokens (ampliable con YaRN) | Apache 2.0 | MoE |
| Mistral Small 3.1 24B | ~24.000 M densos | 128.000 tokens | Apache 2.0 | Transformer denso |

## Limitaciones y advertencias
- Licencia sin especificar: el campo YAML contiene el literal "license", por lo que no existe una licencia valida declarada para el adaptador. Esto impide el uso comercial con garantias, aunque el modelo base sea Apache 2.0.
- Dataset de entrenamiento no documentado: se desconoce la composicion, el idioma y el volumen de datos, lo que impide estimar sesgos introducidos ni el alcance real del ajuste.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada que permita comparar el modelo ajustado con el base ni detectar regresiones.
- Riesgo de olvido catastrofico: al tratarse de un SFT sobre un modelo de 4 bits, es probable la perdida de capacidades generales (codigo, matematicas, tool calling) si el dataset de ajuste era estrecho.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que aporten evidencia de funcionamiento.
- Compatibilidad de plantilla: el modelo base usa un formato de conversacion propio; cargar el adaptador sin la plantilla de chat correcta produce respuestas degradadas. El ejemplo de la model card no fija la plantilla.
- Idiomas: no se declaran idiomas soportados; el modelo base esta entrenado principalmente en ingles y cabe esperar un rendimiento inferior en castellano.
- Alucinacion: no existe ninguna evaluacion de fidelidad; en tareas de extraccion o resumen de documentos largos el riesgo de contenido inventado no esta cuantificado.
- Fusion de pesos: no se indica si el adaptador debe fusionarse sobre los pesos en 4 bits o sobre los pesos originales en MXFP4, decision que afecta directamente a la calidad final.
- Fechas y versiones anomalas: el repositorio declara versiones de librerias (TRL 1.13.0, Transformers 5.17.0, PyTorch 2.11.0) muy posteriores a las actuales, dato a verificar antes de reproducir el entrenamiento.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Devubiodee/plutus-gpt-oss-20b-lora
- Modelo base utilizado: https://huggingface.co/unsloth/gpt-oss-20b-unsloth-bnb-4bit
- Repositorio de TRL: https://github.com/huggingface/trl
- Modelo gpt-oss-20b original: https://huggingface.co/openai/gpt-oss-20b
- Anuncio de gpt-oss en OpenAI: https://openai.com/index/introducing-gpt-oss/
- Documentacion de Unsloth: https://docs.unsloth.ai/
