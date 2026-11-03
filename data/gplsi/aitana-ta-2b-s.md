# gplsi/Aitana-TA-2B-S

## Resumen

Aitana-TA-2B-S es un modelo de traduccion automatica especializado en el par de lenguas espanol-valenciano (y catalan), desarrollado por el grupo GPLSI (Language and Information Systems Group) de la Universidad de Alicante junto con el Centro de Inteligencia Digital (CENID). Se trata de un ajuste fino por instrucciones del modelo BSC-LT/salamandraTA-2b-instruct, que a su vez deriva de Salamandra-2b-base del Barcelona Supercomputing Center. El modelo resuelve el problema de la traduccion de alta calidad entre castellano y valenciano a nivel de frase, un par linguistico con recursos limitados en comparacion con otros pares europeos.

La arquitectura es un transformer decoder-only de aproximadamente 2.250 millones de parametros, con una ventana de contexto de entrenamiento de 2048 tokens. El modelo emplea la plantilla ChatML para el formateo de instrucciones y esta disenado especificamente para tareas de traduccion bidireccional, no como un modelo de proposito general.

Su relevancia actual radica en que ofrece un rendimiento superior al de su modelo base en la mayoria de las metricas de traduccion evaluadas sobre el benchmark IberoBench (tarea Phrases), con mejoras notables en BLEU, chrF, COMET y TER para las direcciones espanol-valenciano y valenciano-espanol, manteniendo una licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 2.253.490.176 (~2,25B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (max_seq_length de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con cuantizacion estandar via transformers/bitsandbytes) |
| Idiomas soportados | espanol (es), valenciano/catalan (ca), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo Llama, heredado de la familia Salamandra del BSC. Cuenta con 2.253.490.176 parametros y fue entrenado con una longitud maxima de secuencia de 2048 tokens. El ajuste fino se realizo sobre el modelo BSC-LT/salamandraTA-2b-instruct, que ya habia sido instruction-tuned sobre datos paralelos. La unica adaptacion respecto al modelo base consistio en enfocar las instrucciones hacia la traduccion bidireccional entre valenciano y espanol.

Los datos de entrenamiento provienen de L'Associacio de Mitjans d'Informacio i Comunicacio (AMIC), a partir de los cuales se construyo un corpus paralelo a nivel de frase. El conjunto de datos para el par valenciano-espanol contiene 738.777 pares de frases, con una longitud media de 165,6 caracteres en el idioma fuente y 168,6 en el destino. El regimen de entrenamiento consistio en 1 epoch con learning rate de 1e-5, betas (0,9; 0,99), weight decay 0, batch global de 64, micro-batch de 2, warmup de 100 pasos y guardado cada 5 pasos. El entrenamiento se ejecuto sobre 4 GPUs NVIDIA A100 en sistemas DGX, utilizando PyTorch Lightning (Fabric) con Fully Sharded Data Parallel (FSDP) para el sharding del modelo.

## Capacidades

- Traduccion bidireccional espanol-valenciano y valenciano-espanol a nivel de frase.
- Traduccion entre catalan y valenciano (variedades de la misma lengua) con alto rendimiento.
- Traduccion desde y hacia espanol en el par espanol-valenciano.
- Generacion de texto conversacional mediante plantilla ChatML (system/user/assistant).
- Seguimiento de instrucciones de traduccion con formato explicito ("Translate the following text from X into Y").
- Soporte de decodificacion con beam search (num_beams=5) y early stopping.
- Capacidad multilingue limitada a es, ca y en segun los metadatos del modelo.
- No dispone de soporte documentado de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Traduccion de documentacion administrativa: el modelo puede traducir frases y parrafos de documentos oficiales entre castellano y valenciano, aprovechando su entrenamiento sobre corpus periodisticos y su alto chrF (superior a 84 en es-va) para mantener fidelidad terminologica en textos formales.
- Localizacion de contenido web y aplicaciones: integrado en pipelines de localizacion, permite traducir cadenas de interfaz y textos de ayuda del espanol al valenciano con calidad cercana a la humana (COMET de 0,932 en es-va), reduciendo la revision manual posterior.
- Generacion de subtitulos y transcripciones: al trabajar a nivel de frase, es adecuado para traducir subtitulos segmentados por lineas, con TER bajo (21,07 en es-va) que indica pocas ediciones necesarias respecto a la referencia.
- Traduccion en medios de comunicacion: dado que el corpus de entrenamiento proviene de AMIC (asociacion de medios), el modelo esta especialmente alineado con el registro periodistico, lo que lo hace util para redacciones que publican en ambas lenguas.
- Sistemas de atencion ciudadana bilingue: puede desplegarse como servicio de traduccion en chatbots o formularios administrativos de la Generalitat Valenciana, con inferencia en GPUs consumer gracias a sus 2,25B de parametros.
- Investigacion en traduccion automatica de lenguas de bajos recursos: sirve como punto de partida para experimentos de fine-tuning en otros pares linguisticos minoritarios, dado su licencia permisiva y su tamano manejable para laboratorios academicos.
- Traduccion de material educativo: centros de ensenanza pueden emplear el modelo para adaptar materiales didacticos entre castellano y valenciano, con la ventaja de que la licencia Apache 2.0 permite su integracion en plataformas institucionales sin coste.

## Benchmarks y rendimiento

Resultados sobre la tarea Phrases de IberoBench, comparados con el modelo base salamandraTA-2b-instruct:

| Tarea | Metrica | Aitana-TA-2B-S | salamandraTA-2b-instruct |
|---|---|---|---|
| phrases2_ca-va | BLEU | 80,22 | 76,53 |
| phrases2_es-va | BLEU | 64,93 | 62,40 |
| phrases2_va-ca | BLEU | 81,19 | 82,07 |
| phrases2_va-es | BLEU | 81,40 | 75,49 |
| phrases2_ca-va | chrF | 91,77 | 89,57 |
| phrases2_es-va | chrF | 84,23 | 82,18 |
| phrases2_va-ca | chrF | 92,00 | 91,43 |
| phrases2_va-es | chrF | 91,22 | 88,15 |
| phrases2_ca-va | COMET | 0,958 | 0,952 |
| phrases2_es-va | COMET | 0,932 | 0,927 |
| phrases2_va-ca | COMET | 0,956 | 0,946 |
| phrases2_va-es | COMET | 0,952 | 0,946 |
| phrases2_ca-va | TER | 10,30 | 13,67 |
| phrases2_es-va | TER | 21,07 | 23,26 |
| phrases2_va-ca | TER | 9,03 | 10,68 |
| phrases2_va-es | TER | 11,02 | 15,06 |

El modelo supera a su base en 15 de las 16 combinaciones metrica-direccion evaluadas; la unica excepcion es BLEU en va-ca (81,19 frente a 82,07).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,5 GB de pesos mas overhead de activaciones y cache KV, en torno a 6-8 GB en total para secuencias cortas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,5-3 GB; en 4 bits: aproximadamente 1,5-2 GB.
- GPU recomendadas para produccion: NVIDIA A100 (40/80 GB), H100 o L40S para despliegues con alto throughput y batching.
- GPU consumer compatibles: cabe en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090 sin cuantizacion; en GPUs de 8 GB es recomendable cuantizar a 8 o 4 bits.
- Opciones de despliegue: transformers (referencia), text-generation-inference (TGI, etiquetado en el modelo), vLLM, llama.cpp y Ollama mediante conversion a GGUF (no se proporcionan pesos GGUF oficiales).
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un modelo de 2,25B, se espera un throughput alto en A100/H100 con batching, aunque no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Aitana-TA-2B-S | ~2,25B | 2048 | es, ca, en | Apache 2.0 | Especializado en es-va; mejor COMET en va-es (0,952) |
| BSC-LT/salamandraTA-2b-instruct | ~2,25B | 2048 | es, ca, en | Apache 2.0 | Modelo base; peor rendimiento global en IberoBench Phrases |
| Salamandra-2b-base (BSC-LT) | ~2B | no disponible | multilingue (35+ lenguas europeas) | Apache 2.0 | Modelo base generalista, no especializado en traduccion es-va |

No se dispone de datos de benchmarks de otros modelos comparables de traduccion es-va en la informacion proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en traduccion espanol-valenciano/catalan; su rendimiento en otras tareas generativas (razonamiento, codigo, matematicas) no esta evaluado y probablemente sea limitado.
- El contexto maximo de entrenamiento es de 2048 tokens, lo que restringe la traduccion de documentos largos a nivel de frase o parrafo; para textos extensos es necesario segmentar.
- El corpus de entrenamiento proviene de medios de comunicacion (AMIC), lo que puede introducir sesgos de registro periodistico y menor cobertura de terminologia tecnica, juridica o cientifica especializada.
- Riesgo de alucinacion y de omision o adicion de contenido en frases ambiguas o muy largas; se recomienda revision humana en entornos de produccion criticos.
- Aunque los metadatos declaran soporte de es, ca y en, el ajuste fino se centro en es-va; el rendimiento en traduccion desde o hacia ingles no esta documentado.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero no se ofrece garantia alguna sobre la calidad en dominios no representados en el corpus de entrenamiento.
- No se proporcionan pesos cuantizados oficiales (GGUF, AWQ, GPTQ); la cuantizacion debe realizarse por cuenta del usuario.
- El modelo fue entrenado con 1 sola epoch sobre 738.777 pares de frases; la cobertura de variantes dialectales del valenciano no esta detallada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gplsi/Aitana-TA-2B-S
- Modelo base: https://huggingface.co/BSC-LT/salamandraTA-2b-instruct
- GPLSI (Universidad de Alicante): https://gplsi.dlsi.ua.es/
- CENID (Centro de Inteligencia Digital): https://cenid.es
- Paper de IberoBench: https://aclanthology.org/2025.coling-main.699/
