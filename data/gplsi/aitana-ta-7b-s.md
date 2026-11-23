# gplsi/Aitana-TA-7B-S

## Resumen

Aitana-TA-7B-S es un modelo de traduccion automatica especializado, desarrollado por el grupo GPLSI (Grupo de Procesamiento del Lenguaje y Sistemas de Informacion) de la Universidad de Alicante. Se obtiene mediante ajuste fino supervisado del modelo BSC-LT/salamandraTA-7b-instruct sobre un corpus paralelo de oraciones en valenciano y espanol construido a partir de datos de la Associacio de Mitjans d'Informacio i Comunicacio (AMIC). El resultado es un modelo de 7.768 millones de parametros orientado a la traduccion a nivel de oracion entre espanol y valenciano, en ambos sentidos, y tambien entre valenciano y catalan.

El modelo hereda la arquitectura transformer decoder-only de la familia Salamandra del Barcelona Supercomputing Center y mantiene la plantilla de instrucciones ChatML de su modelo base. Su relevancia radica en que cubre un par de lenguas con recursos limitados (valenciano-espanol) con calidad de traduccion medida mediante COMET, BLEU, ChrF y TER, superando de forma consistente a su modelo base en todas las direcciones evaluadas. Esta publicado con licencia Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines de traduccion.

La ficha se basa exclusivamente en la model card publicada y en los metadatos de Hugging Face. No se dispone de informacion sobre el numero total de tokens de entrenamiento mas alla del corpus paralelo descrito, ni sobre procesos de RLHF o DPO posteriores al ajuste supervisado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 7.768.117.248 (~7,76B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (max_seq_length de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/AWQ no publicada por el autor) |
| Idiomas soportados | es, ca, en (entrenado especificamente para es-va y va-ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de aproximadamente 7,76B de parametros, derivado de BSC-LT/salamandraTA-7b-instruct, que a su vez procede de un preentrenamiento continuado de Salamandra-7B sobre datos paralelos. El ajuste fino de Aitana-TA-7B-S se realizo sobre un corpus paralelo a nivel de oracion construido a partir de AMIC, con 738.777 pares valenciano-espanol (longitud media de 165,6 caracteres en valenciano y 168,6 en espanol), utilizados en ambas direcciones de traduccion. La unica adaptacion respecto al modelo base fue orientar las instrucciones a la traduccion valenciano-espanol y viceversa.

El regimen de entrenamiento consistio en una epoca con learning rate 1e-5, betas 0,9 y 0,99, weight decay 0, batch global de 64 (micro-batch de 2), warmup de 100 pasos y longitud maxima de secuencia de 2.048 tokens. El entrenamiento se ejecuto con codigo propio sobre PyTorch Lightning (Fabric Lightning) con Fully Sharded Data Parallel (FSDP) en 4 GPU NVIDIA A100 de un sistema DGX. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa en la informacion disponible.

## Capacidades

- Traduccion de texto a nivel de oracion entre espanol y valenciano en ambos sentidos.
- Traduccion entre valenciano y catalan en ambos sentidos, segun los resultados reportados en la evaluacion.
- Generacion de texto conversacional con plantilla ChatML (`<|im_start|>` / `<|im_end|>`).
- Seguimiento de instrucciones de traduccion con formato explicito de origen y destino.
- Soporte de decodificacion con beam search (`num_beams`) y `early_stopping`.
- Capacidad multilingue limitada a es, ca y en segun los metadatos; el entrenamiento especifico se centra en es-va y va-ca.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Traduccion de documentacion administrativa valenciano-espanol: el modelo puede traducir comunicados, formularios y textos oficiales oracion a oracion, aprovechando su ajuste sobre un corpus periodistico e institucional de 738.777 pares.
- Localizacion de contenidos web y aplicaciones al valenciano: integrado en un pipeline de preprocesado por oraciones, permite generar versiones en valenciano de textos en espanol con calidad medida por COMET superior a 0,93 en es-va.
- Traduccion de noticias y notas de prensa: el corpus AMIC procede de medios de comunicacion, por lo que el modelo esta especialmente alineado con el registro periodistico y puede usarse para versiones bilingues de articulos.
- Atencion al ciudadano en la Comunidad Valenciana: traduccion automatizada de consultas y respuestas entre valenciano y espanol en sistemas de chat, con la plantilla ChatML para conversaciones multi-turno dentro de la ventana de 2.048 tokens.
- Generacion de subtitulos y transcripciones bilingues: traduccion de frases cortas de transcripciones en espanol a valenciano o catalan, con TER bajo (10,12 en va-es) que indica pocas ediciones necesarias respecto a la referencia.
- Creacion de corpus paralelos y datos de entrenamiento: el modelo puede usarse para traduccion asistida y generacion de pares de frases que alimenten otros sistemas de TA o modelos de traduccion neuronal.
- Traduccion inversa valenciano-catalan: util para normalizar contenidos entre variedades del catalan, con BLEU de 79,52 en va-ca y 78,63 en ca-va.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre la tarea Phrases de IberoBench, comparados con el modelo base salamandraTA-7b-instruct:

| Tarea | Metrica | Aitana-TA-7B-S | salamandraTA-7b-instruct |
|---|---|---|---|
| phrases_es-va | BLEU | 65,14 | 61,92 |
| phrases_va-es | BLEU | 82,04 | 75,12 |
| phrases_va-ca | BLEU | 79,52 | 72,25 |
| phrases_ca-va | BLEU | 78,63 | 72,30 |
| phrases_es-va | ChrF | 84,24 | 82,82 |
| phrases_va-es | ChrF | 91,63 | 87,72 |
| phrases_va-ca | ChrF | 91,02 | 85,09 |
| phrases_ca-va | ChrF | 90,88 | 87,56 |
| phrases_es-va | COMET | 0,937 | 0,930 |
| phrases_va-es | COMET | 0,957 | 0,951 |
| phrases_va-ca | COMET | 0,953 | 0,948 |
| phrases_ca-va | COMET | 0,956 | 0,948 |
| phrases_es-va | TER | 20,99 | 22,63 |
| phrases_va-es | TER | 10,12 | 15,54 |
| phrases_va-ca | TER | 10,45 | 18,85 |
| phrases_ca-va | TER | 11,54 | 15,95 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 15,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 18-20 GB para secuencias de 2.048 tokens.
- GPU recomendadas: NVIDIA A100 (40/80 GB) o H100 para despliegue en produccion; el entrenamiento se realizo con 4 A100.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (RTX 3090, RTX 4090) en bfloat16 o con cuantizacion de 8 bits; en 16 GB requeriria cuantizacion a 8 bits o inferior, no publicada por el autor.
- Opciones de despliegue: transformers (referencia en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles y vLLM por compatibilidad con arquitectura Llama. No se documenta soporte oficial en llama.cpp u Ollama para estos pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento es-va (COMET) |
|---|---|---|---|---|---|
| Aitana-TA-7B-S | ~7,76B | 2.048 | es, ca, en | Apache 2.0 | 0,937 |
| BSC-LT/salamandraTA-7b-instruct | ~7,76B | no disponible | es, ca, en | no disponible en la informacion | 0,930 |
| Salamandra-7B (base) | ~7B | no disponible | multilingue | Apache 2.0 (segun familia Salamandra) | no disponible |

La comparativa se limita al modelo base y a la familia Salamandra porque la informacion proporcionada no incluye datos de otros sistemas de traduccion es-va comparables (por ejemplo, NLLB o modelos especializados de la misma categoria).

## Limitaciones y advertencias

- El modelo esta especializado en traduccion a nivel de oracion; no se ha validado para documentos largos ni para traduccion con contexto discursivo amplio.
- La ventana de contexto de 2.048 tokens limita la longitud de entrada y el historial conversacional en usos multi-turno.
- El corpus de entrenamiento proviene de medios de comunicacion (AMIC), lo que puede introducir sesgos de registro periodistico y menor cobertura de otros dominios (tecnico, juridico, cientifico).
- Riesgo de alucinacion y de omisiones en textos muy largos o con terminologia especializada; se recomienda revision humana en produccion.
- El entrenamiento especifico cubre es-va y va-ca; el rendimiento en otros pares o en ingles no esta documentado.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de uso de los datos AMIC para usos comerciales concretos.
- No se documentan procesos de alineacion adicionales (RLHF/DPO) que mitiguen respuestas no deseadas fuera del dominio de traduccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gplsi/Aitana-TA-7B-S
- Modelo base: https://huggingface.co/BSC-LT/salamandraTA-7b-instruct
- Paper de IberoBench (evaluacion): https://aclanthology.org/2025.coling-main.699/
