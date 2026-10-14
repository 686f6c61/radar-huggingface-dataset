# jonas-mo/llama-cargo-sft-v13

## Resumen

llama-cargo-sft-v13 es un ajuste fino supervisado (SFT) del modelo unsloth/Llama-3.1-8B-Instruct-bnb-4bit, publicado por el usuario jonas-mo en HuggingFace. Se trata, por tanto, de un derivado de Llama 3.1 8B Instruct, el modelo denso de 8.030 millones de parametros de Meta con ventana de contexto de 128.000 tokens. El autor no documenta ni el conjunto de datos de entrenamiento, ni el numero de tokens, ni la composicion del corpus utilizado para el ajuste.

El modelo se ha entrenado con la libreria TRL (version 0.24.0) sobre un checkpoint base ya cuantizado a 4 bits (bnb-4bit), lo que situa el flujo de trabajo en el ecosistema Unsloth + PEFT/QLoRA. El repositorio ocupa solo 0,2 GB, un tamano incompatible con los pesos completos de un modelo de 8.000 millones de parametros, lo que apunta a que contiene adaptadores (LoRA) o un guardado parcial de pesos; la model card no aclara este punto.

La relevancia de esta ficha es limitada en terminos de novedad tecnica: no hay innovaciones de arquitectura, ni benchmarks publicados, ni licencia declarada de forma explicita (el campo de licencia aparece como marcador de posicion "license"). Su interes practico reside en que sirve como ejemplo reproducible de un pipeline de ajuste fino con Unsloth + TRL sobre Llama 3.1 8B, y en que el nombre del modelo sugiere un dominio de aplicacion logistica o de carga, aunque esto no se confirma en la documentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Llama 3.1 8B Instruct) |
| Parametros totales | 8.030 millones (modelo base; el repositorio no declara el numero de parametros entrenables del ajuste) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (segun el modelo base Llama 3.1 8B Instruct; no confirmado en la model card) |
| Tipos de cuantizacion | Base entrenado sobre bnb-4bit; no se declaran cuantizaciones publicadas del ajuste (GGUF, AWQ, GPTQ no disponibles) |
| Idiomas soportados | no disponible (el modelo base soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, castellano y tailandes) |
| Licencia | no disponible (el campo de la model card contiene el marcador "license" sin texto de licencia; el modelo base esta sujeto a la Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers); tamano del repo 0,2 GB |
| Modelo base | unsloth/Llama-3.1-8B-Instruct-bnb-4bit |
| Librerias de entrenamiento | TRL 0.24.0, Transformers 5.5.0, PyTorch 2.11.0, Datasets 4.3.0, Tokenizers 0.22.2 |
| Metodo de ajuste | SFT (supervised fine-tuning) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 14 de octubre de 2026 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con 32 capas, dimension oculta de 4.096, 32 cabezas de atencion y 8 cabezas de clave-valor (GQA, grouped-query attention), vocabulario de 128.256 tokens y atencion causal estandar. El modelo base fue entrenado por Meta sobre del orden de 15 billones de tokens y posteriormente alineado con tecnicas de instruction tuning y preferencias (RLHF/DPO); sin embargo, ninguno de estos datos de preentrenamiento se documenta en la ficha de este derivado, y la model card solo indica que se ha aplicado SFT sobre el checkpoint de Unsloth.

No se especifica el dataset de ajuste, el numero de pasos, la tasa de aprendizaje, el rango LoRA, ni si se aplico enmascaramiento de perdida sobre las respuestas del asistente. Las unicas referencias tecnicas son las versiones de framework, que situan el entrenamiento en el ecosistema Unsloth (optimizaciones de memoria y velocidad para QLoRA) combinado con TRL. No se declara ninguna innovacion propia: ni decodificacion especulativa, ni atencion lineal, ni mezcla de expertos. Tampoco se publican pesos fusionados, configuracion de merge ni artefactos de evaluacion.

## Capacidades

- Generacion de texto conversacional en formato de chat, con soporte de roles (user/assistant) a traves del pipeline de transformers y de la plantilla de chat heredada de Llama 3.1 Instruct.
- Razonamiento general y respuesta a preguntas, en el nivel esperado de un modelo denso de 8.000 millones de parametros, sujeto a lo que el ajuste SFT haya podido reforzar o degradar.
- Generacion de codigo, en principio heredada del modelo base, aunque no hay evaluacion publicada que lo confirme para este ajuste.
- Capacidades multilingues heredadas del modelo base (8 idiomas declarados por Meta); no verificadas en este ajuste.
- Tool calling y function calling: el modelo base Llama 3.1 8B Instruct soporta plantillas de herramientas, pero la model card no confirma que el ajuste SFT preserve esta capacidad, y un ajuste de dominio puede degradarla.
- Uso como agente o razonamiento multi-paso: no documentado ni evaluado en la informacion disponible.
- Capacidades de vision o audio: no disponibles (el modelo base es exclusivamente de texto).

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al cargarse con `transformers.pipeline` en una GPU, permite levantar un chatbot de dominio especifico sin infraestructura adicional; es adecuado para demos y pruebas de concepto, no para produccion sin evaluacion previa.
- Experimentacion academica con QLoRA: sirve como referencia reproducible de un pipeline Unsloth + TRL sobre Llama 3.1 8B, util para comparar hiperparametros de SFT frente a otros ajustes del mismo autor (v13 sugiere una serie de iteraciones).
- Ajuste sobre dominio logistico o de carga: si el nombre "cargo" responde efectivamente a un corpus de ese sector, el modelo podria emplearse para clasificar o resumir documentacion de transporte, aunque la ausencia de dataset documentado impide afirmarlo con rigor.
- Base para posteriores etapas de alineacion: al ser un checkpoint SFT, puede actuar como punto de partida para DPO, ORPO o RLHF sobre preferencias, integrándose en TRL sin cambios de formato.
- Evaluacion comparativa de tecnicas de cuantizacion: el hecho de partir de un base bnb-4bit hace que el modelo sea util para estudiar el impacto de entrenar sobre pesos cuantizados frente a entrenar en precision completa.
- Extraccion de datos estructurados en texto: si el ajuste ha reforzado ese comportamiento, podria emplearse para convertir documentos no estructurados en JSON, siempre con validacion posterior, dado que no hay benchmarks que respalden su fiabilidad.
- Atencion al cliente multilingue: hereda la cobertura de idiomas del modelo base, aunque la falta de evaluacion en este ajuste hace necesario un test A/B antes de cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de jonas-mo/llama-cargo-sft-v13 no incluye resultados de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni tampoco comparaciones con el checkpoint base o con ajustes previos de la serie. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16-17 GB para pesos, mas 1-2 GB adicionales de cache KV y activaciones segun la longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9-10 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 5-6 GB de pesos, con overhead adicional por contexto.
- GPU profesionales: A100 40/80 GB, H100, L40S o A6000, con margen amplio para lotes grandes y contextos largos.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 con contexto moderado; en RTX 3090 (24 GB) de forma similar; en RTX 3060 12 GB o RTX 4070 Ti (12 GB) practicamente solo en 4 bits; en GPUs de 8 GB no es viable sin cuantizacion agresiva.
- Contexto largo: los 128.000 tokens del modelo base requieren tecnicas de atencion eficiente (FlashAttention 2/3) y consumen memoria de cache KV proporcional a la longitud, con estimaciones de decenas de GB en contextos muy largos.
- Opciones de despliegue: vLLM o TGI para servicio con throughput alto; llama.cpp u Ollama para CPU/GPU mixta tras convertir a GGUF (conversion no publicada por el autor); transformers + PEFT si el repositorio contiene solo adaptadores LoRA, en cuyo caso es necesario fusionarlos con el base.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor ni estimaciones fiables sin conocer si los pesos son completos o adaptadores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Estado |
|---|---|---|---|---|---|
| jonas-mo/llama-cargo-sft-v13 | 8.030 M (base) | 128.000 tokens (heredado) | no disponible | HuggingFace, 0 descargas | Ajuste SFT de dominio no evaluado |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128.000 tokens | Llama 3.1 Community License | HuggingFace, ampliamente desplegado | Referencia oficial con benchmarks publicados |
| unsloth/Llama-3.1-8B-Instruct-bnb-4bit | 8.030 M | 128.000 tokens | Llama 3.1 Community License | HuggingFace | Version cuantizada a 4 bits del anterior, usada como base |
| mistralai/Mistral-7B-Instruct-v0.3 | 7.250 M | 32.000 tokens | Apache 2.0 | HuggingFace | Alternativa de licencia permisiva y menor contexto |
| Qwen/Qwen2.5-7B-Instruct | 7.620 M | 128.000 tokens | Apache 2.0 (segun variante) | HuggingFace | Alternativa multilingue con licencia mas laxa |

La comparacion es necesariamente asimetrica: los tres modelos alternativos cuentan con evaluaciones publicadas y licencias claras, mientras que para llama-cargo-sft-v13 no hay datos de rendimiento, idiomas declarados ni licencia especificada, lo que impide cualquier comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita estimar la calidad del ajuste, ni siquiera frente al checkpoint base. No se puede asumir que el ajuste mejore al modelo original en tareas generales.
- Licencia sin declarar: el campo de la model card contiene el marcador de posicion "license" sin texto legal. Esto impide determinar si el uso comercial esta permitido; ademas, al derivar de Llama 3.1, el modelo queda sujeto a la Llama 3.1 Community License de Meta, que impone condiciones de atribucion y clausulas de uso aceptable.
- Dataset desconocido: no se documenta la composicion, el tamano ni la procedencia del corpus de SFT, lo que impide evaluar riesgo de sesgo, contaminacion de benchmarks o inclusion de datos con derechos de terceros.
- Riesgo de sobreajuste de dominio: un ajuste SFT no evaluado sobre un modelo de 8.000 millones de parametros puede degradar capacidades generales (instrucciones, codigo, matematicas) sin que exista evidencia publica de ello.
- Riesgo de alucinacion: inherente a los modelos de la familia Llama 3.1 de este tamano, agravado porque no hay evaluaciones de factualidad para este ajuste concreto.
- Soporte multilingue no verificado: aunque el modelo base cubre 8 idiomas, el ajuste podria haber reducido la competencia efectiva en idiomas distintos al del corpus de entrenamiento, que se desconoce.
- Tool calling potencialmente degradado: el uso de plantillas de herramientas no esta confirmado tras el ajuste.
- Formato del repositorio ambiguo: los 0,2 GB de tamano sugieren adaptadores LoRA o un guardado parcial. Si es asi, el uso directo con `pipeline` requiere fusionar los adaptadores con el modelo base, algo que la model card no explica.
- Reproducibilidad limitada: se declaran versiones de librerias poco convencionales (Transformers 5.5.0, PyTorch 2.11.0) sin instrucciones de reproduccion ni hiperparametros.
- Sin adopcion ni validacion externa: 0 descargas y 0 likes implican ausencia de revision comunitaria.
- Entrenamiento sobre base cuantizado: partir de bnb-4bit puede introducir diferencias numericas respecto a un ajuste en precision completa, con impacto no medido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jonas-mo/llama-cargo-sft-v13
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct-bnb-4bit
- Repositorio de TRL: https://github.com/huggingface/trl
- Modelo original de Meta (referencia del linaje): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Llama 3.1 Community License: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo. Los unicos resultados obtenidos estaban relacionados con entidades no vinculadas al proyecto (articulos enciclopedicos, comercios de moda y una fundacion de asistencia social), por lo que se han descartado. No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a llama-cargo-sft-v13.
