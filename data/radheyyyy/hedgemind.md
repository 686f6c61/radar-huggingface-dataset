# Radheyyyy/HedgeMind

## Resumen

HedgeMind es un ajuste fino (fine-tune) del modelo Meta Llama 3.1 8B Instruct, publicado en HuggingFace por el usuario Radheyyyy bajo licencia Apache 2.0. El punto de partida declarado es `unsloth/meta-llama-3.1-8b-instruct-bnb-4bit`, es decir, una version del instructivo de Llama 3.1 8B pre-cuantizada a 4 bits por Unsloth, sobre la que se ha realizado un entrenamiento adicional con la libreria Unsloth y TRL de HuggingFace. El repositorio contiene pesos en formato safetensors con 8.030.261.248 parametros totales (aproximadamente 8.000 millones) y un tamano de 16,1 GB, lo que corresponde a pesos en 16 bits (fp16/bf16) tras fusionar el adaptador, no a los pesos de 4 bits del modelo base.

Se trata de un modelo de generacion de texto de tipo causal LM con arquitectura transformer estilo Llama, orientado a conversacion y con soporte declarado solo para ingles. La model card es minima: no documenta el dataset de entrenamiento, el numero de tokens, la composicion de los datos, ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado. Tampoco se publican resultados de evaluacion.

Su relevancia actual es limitada y debe interpretarse con cautela: el repositorio acumula 0 descargas y 0 likes, no incluye benchmarks, el autor no aporta documentacion tecnica adicional y no se ha encontrado informacion externa contrastable en la busqueda web realizada (los resultados obtenidos no guardan relacion con el modelo). En la practica, HedgeMind es un ejemplo tipico de checkpoint experimental derivado de Llama 3.1 8B Instruct, util como base de partida para evaluacion propia, pero sin evidencia publica que respalde mejoras frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (estilo Llama, segun tags `llama` y modelo base) |
| Parametros totales | 8.030.261.248 (aproximadamente 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. El modelo base declarado es Llama 3.1 8B Instruct, cuya documentacion oficial indica 128.000 tokens de contexto |
| Tipos de cuantizacion | No se publican variantes cuantizadas. El repositorio contiene pesos en 16 bits (16,1 GB para 8B parametros). El modelo base era una version bnb-4bit de Unsloth |
| Idiomas soportados | Ingles (`en`), segun la model card y el campo `language` |
| Licencia | Apache 2.0 (declarada en la model card; ver advertencias sobre la licencia del modelo base) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer causal decoder-only de la familia Llama 3.1, con 8.030 millones de parametros. No se dispone de informacion sobre configuracion de capas, dimensiones ocultas, numero de cabezas de atencion ni vocabulario, ya que la model card no incluye ficha de configuracion. El modelo se obtuvo por ajuste fino supervisado (SFT) sobre `unsloth/meta-llama-3.1-8b-instruct-bnb-4bit`, un checkpoint instructivo ya alineado mediante las etapas de preentrenamiento, SFT y RLHF/DPO que Meta aplico a Llama 3.1 8B Instruct. No consta que HedgeMind anada etapas propias de RLHF, DPO o PPO; la model card solo menciona entrenamiento con Unsloth y TRL.

La unica innovacion tecnica documentada es de caracter instrumental: el uso de Unsloth y de la libreria TRL de HuggingFace, que segun el autor permitieron entrenar "2x mas rapido". No se especifica el metodo de adaptacion (LoRA, QLoRA u otro), el rango de los adaptadores, la tasa de aprendizaje, el numero de pasos ni la composicion del dataset. Tampoco se indica si el fine-tune se realizo sobre los pesos de 4 bits del base y se fusiono posteriormente, aunque el tamano final del repositorio (16,1 GB para 8B parametros) sugiere que los pesos entregados estan en 16 bits. Todos estos detalles son no disponibles.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instructivo Llama 3.1 8B.
- Razonamiento basico y respuesta a instrucciones de complejidad media, en la medida en que el ajuste fino no las haya degradado (no hay evaluaciones publicadas).
- Generacion de codigo en lenguajes habituales, capacidad heredada del modelo base; no hay evidencia especifica para este checkpoint.
- Resolucion de problemas matematicos simples y de varios pasos, tambien heredada del base y no verificada.
- Soporte potencial de tool calling / function calling: Llama 3.1 8B Instruct incorpora plantillas para llamadas a herramientas, pero la model card de HedgeMind no documenta que se conserve ni que se haya entrenado especificamente para ello.
- Capacidades multilingues: limitadas. Solo se declara ingles (`en`); no se anuncia soporte de castellano ni de otros idiomas.
- Capacidad de contexto largo: no confirmada para este checkpoint, aunque el modelo base soporta hasta 128.000 tokens.
- Modo "thinking" o razonamiento explicito: no disponible.
- Vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Uso con `text-generation-inference`: etiquetado como compatible con TGI y con endpoints de HuggingFace Inference Endpoints.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo puede desplegarse con `transformers` o TGI para validar flujos de dialogo multi-turno antes de invertir en un modelo mayor. Es adecuado por su tamano de 8B, que cabe en una GPU de 24 GB en cuantizacion de 16 bits ajustada o en 4 bits con holgura, pero requiere validacion previa porque no hay benchmarks.
- Generacion de texto en pipelines internos de bajo riesgo: redaccion de borradores, resumenes y reformulacion de textos en ingles donde un error no tiene consecuencias criticas y existe revision humana.
- Base para experimentos de ajuste fino adicional: al derivar de Llama 3.1 8B Instruct y publicarse en safetensors con licencia Apache 2.0 declarada, sirve como punto de partida para nuevos fine-tunes con Unsloth o TRL, especialmente si el equipo quiere comparar contra el instructivo original.
- Evaluacion comparativa de checkpoints comunitarios: util como muestra en estudios sobre degradacion o preservacion de capacidades tras un SFT no documentado, midiendo MMLU, GSM8K o HumanEval antes y despues del ajuste.
- Investigacion sobre licencias en modelos derivados: caso de estudio para analizar la tension entre una licencia Apache 2.0 declarada en el derivado y la licencia Llama 3.1 Community del modelo base.
- Despliegue en entornos con recursos limitados: con cuantizacion a 4 bits (GGUF o GPTQ/AWQ, previa conversion, ya que el repositorio no las incluye) podria ejecutarse en GPUs de 8-12 GB o incluso en CPU con llama.cpp para tareas de generacion no criticas.
- Chatbots educativos o de demostracion: por su tamano y su naturaleza conversacional, encaja en demos de bajo coste en ingles, siempre que se advierta al usuario de la ausencia de garantias de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de HedgeMind no incluye ninguna tabla de evaluacion (MMLU, GSM8K, HumanEval, MT-Bench ni similares). Los resultados del modelo base Llama 3.1 8B Instruct existen en la documentacion oficial de Meta, pero no se han proporcionado en la informacion disponible y no permiten inferir el rendimiento de este checkpoint concreto tras el ajuste fino.

## Requisitos de hardware

- VRAM estimada en 16 bits (fp16/bf16, formato publicado): alrededor de 16 GB solo para pesos, mas cache KV y activaciones; en la practica se recomienda un minimo de 20-24 GB para contextos moderados.
- VRAM estimada en 8 bits (INT8): en torno a 8-9 GB de pesos; requiere conversion propia, no incluida en el repositorio.
- VRAM estimada en 4 bits (GGUF Q4_K_M, GPTQ o AWQ): aproximadamente 5-6 GB de pesos; tambien requiere conversion propia.
- GPUs recomendadas para 16 bits: A100 40/80 GB, H100, L40S, RTX 6000 Ada. En RTX 4090 (24 GB) es viable con contexto moderado, pero el contexto largo de 128K exigiria mucha mas memoria por la cache KV.
- GPUs de consumo: cabe en RTX 3090/4090 (24 GB) en 16 bits con contexto limitado, y en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 en cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (TGI) y HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`). vLLM es compatible al tratarse de un modelo tipo Llama. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio solo contiene safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint. Como referencia generica de la clase 8B en fp16 con vLLM sobre A100, los ordenes de magnitud habituales son de miles de tokens por segundo agregados en batch y decenas de tokens por segundo por secuencia, pero son cifras orientativas no verificadas para HedgeMind.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HedgeMind (Radheyyyy) | 8,03B | No disponible (base: 128K) | Sin benchmarks publicados | Apache 2.0 declarada (base bajo Llama 3.1 Community License) | HuggingFace, 0 descargas, 0 likes |
| Llama 3.1 8B Instruct (Meta) | 8,03B | 128.000 tokens | Benchmarks publicos en la documentacion de Meta | Llama 3.1 Community License | Ampliamente disponible; ecosistema maduro |
| Mistral 7B Instruct (Mistral AI) | 7,24B | 32.000 tokens (v0.2/v0.3) | Benchmarks publicos de Mistral | Apache 2.0 | Ampliamente disponible |
| Qwen2.5 7B Instruct (Alibaba) | 7,62B | 128.000 tokens (hasta 32K en generacion estandar) | Benchmarks publicos de Alibaba | Apache 2.0 | Ampliamente disponible |

Los datos de parametros, contexto y licencia de los modelos comparados provienen de sus fichas publicas habituales; no se dispone de una comparacion de rendimiento verificada contra HedgeMind porque este no publica evaluaciones. La comparativa de rendimiento se considera, por tanto, no disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni comparacion con el modelo base. No se puede afirmar que HedgeMind mejore a Llama 3.1 8B Instruct en ninguna tarea; es igualmente probable que lo degrade.
- Documentacion insuficiente: no se especifican dataset, numero de tokens, hiperparametros, metodo de adaptacion ni objetivo del ajuste. Se desconoce que comportamiento se pretendia inducir, lo que hace imposible reproducir el entrenamiento.
- Riesgo elevado de alucinacion: es una caracteristica inherente a los modelos de 8B; al no haber evaluacion ni etapas de alineacion documentadas posteriores al SFT, el riesgo no esta cuantificado.
- Sesgos: el ajuste se ha realizado sobre un dataset no divulgado, lo que puede introducir sesgos desconocidos y no auditables. Los sesgos del modelo base Llama 3.1 tampoco se mitigan de forma documentada.
- Idioma: solo se declara ingles. No hay soporte anunciado de castellano ni de otras lenguas; el rendimiento multilingue del checkpoint es desconocido.
- Contexto: aunque el modelo base soporta 128.000 tokens, no se confirma que el ajuste fino preserve esa ventana ni la calidad en contextos largos.
- Inconsistencia de licencia: la model card declara Apache 2.0, pero el modelo base (Llama 3.1 8B Instruct) esta sujeto a la Llama 3.1 Community License, que impone condiciones adicionales (entre ellas, obligaciones de atribucion, nombrado del modelo derivado con el prefijo "Llama" y restricciones de uso para organizaciones con mas de 700 millones de usuarios mensuales). Publicar el derivado como Apache 2.0 no elimina esas obligaciones. Antes de cualquier uso comercial debe revisarse la licencia del modelo base con asesoramiento juridico.
- Reputacion y trazabilidad: autor anonimo, 0 descargas, 0 likes, sin paper, sin repositorio de codigo y sin datos de contacto. No hay senales de mantenimiento ni de soporte.
- Pesos en 16 bits: el repositorio ocupa 16,1 GB y no incluye variantes cuantizadas, lo que incrementa los requisitos de VRAM y de ancho de banda frente a alternativas ya cuantizadas.
- Uso en produccion: no recomendado sin una evaluacion propia exhaustiva, incluida la verificacion de que el ajuste no ha roto el formato de chat, el soporte de tool calling ni la capacidad de seguir instrucciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Radheyyyy/HedgeMind
- Modelo base declarado: https://huggingface.co/unsloth/meta-llama-3.1-8b-instruct-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Unsloth (libreria de entrenamiento citada en la model card): https://github.com/unslothai/unsloth
- TRL de HuggingFace (libreria de entrenamiento citada): https://github.com/huggingface/trl
- Nota sobre la busqueda web: los resultados obtenidos no contienen informacion relacionada con HedgeMind, Llama, Unsloth ni con benchmarks del modelo; se han descartado por no ser relevantes. No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este checkpoint.
