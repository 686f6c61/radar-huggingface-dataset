# 19Peppe95/gliner2-base-ita-v2

## Resumen

`gliner2-base-ita-v2` es un modelo de extraccion de informacion en italiano desarrollado por el usuario 19Peppe95, segunda iteracion de su pipeline de ajuste sobre GLiNER2. Parte de `fastino/gliner2-multi-v1` (modelo multilingue zero-shot de Fastino) y le inyecta conocimiento especializado en datos personales (PII) y campos estructurados de documentos administrativos, fiscales, legales y sanitarios italianos, tomando como referencia `DeepMount00/GLiNER_PII_ITA`. El resultado es un token-classifier de 307,10 M de parametros (277,54 M en el encoder `microsoft/mdeberta-v3-base` y 16,53 M en la cabeza `span_rep`) que permite definir esquemas de entidades en tiempo de inferencia sin reentrenamiento.

La relevancia tecnica del modelo no esta en el tamano sino en el metodo: el autor aplica merging de pesos por task arithmetic restringido a los layers 0-4, magnitude pruning al 50% seguido de proyeccion low-rank SVD (k=24) sobre los task vectors, expansion de `max_width` de 8 a 26 para cubrir referencias normativas italianas largas, y un micro fine-tuning con trust-region de la cabeza `span_rep`. Todas las modificaciones viven en `model.safetensors` y `config.json`, sin regex ni post-procesado en runtime.

Es relevante ahora porque demuestra una via de especializacion barata (sin entrenamiento completo) para NER zero-shot en un idioma concreto y un dominio regulado (PII, facturacion, sanidad), publicada con licencia Apache 2.0. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe tratarse como un artefacto de investigacion sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 sobre encoder transformer `microsoft/mdeberta-v3-base` + cabeza `span_rep` (SpanMarkerV0) + modulos `count_lstm` y proyectores de esquema |
| Parametros totales | 307.098.645 (277,54 M encoder, 16,53 M `span_rep`, resto `count_lstm` y proyectores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el encoder mdeberta-v3-base soporta 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | italiano (principal), multilingue (heredado del base `fastino/gliner2-multi-v1`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), configuracion en `config.json`; repo de 1,2 GB |

## Arquitectura y entrenamiento

La arquitectura es GLiNER2, un esquema unificado de extraccion de informacion basado en un encoder transformer (aqui `microsoft/mdeberta-v3-base`) con una cabeza de representacion de spans (`SpanMarkerV0`) que calcula representaciones dinamicas hasta `max_width` sin embeddings posicionales fijos. El modelo no se entrena desde cero: parte de `fastino/gliner2-multi-v1` y aplica tres estadios secuenciales documentados en la model card.

El primer estadio expande `max_width` de 16 a 26 (tanto en la raiz de `config.json` como en `span_head`), lo que segun la ablacion del autor recupera +24 verdaderos positivos exactos sobre 145 entidades, cubriendo referencias normativas de 17-23 tokens como `art.10 c.1 n.18 D.P.R. 633/1972`. El segundo estadio calcula el task vector entre `DeepMount00/GLiNER_PII_ITA` y `fastino/gliner2-multi-v1` solo en los layers 0-4 (60 tensores, excluyendo LayerNorm), aplica magnitude pruning al 50% y luego SVD truncada con k=24 sobre las 30 matrices 2D, escalando el update por 0,14; los layers 5-11 quedan intactos. El tercer estadio congela el encoder y hace 35 pasos de AdamW (lr=3e-4, weight_decay=1e-2) sobre la cabeza `span_rep` (16,53 M parametros) con 4 frases sinteticas disjuntas del test set, usando una perdida que combina margen sobre logits y regularizacion MSE (lambda=12,0) con trust-region de 3,5%. No se documentan datos de RLHF/DPO ni el volumen de tokens de preentrenamiento del base.

## Capacidades

- Extraccion zero-shot de entidades nombradas (NER) definiendo las etiquetas en tiempo de inferencia mediante esquema.
- Deteccion de datos personales (PII) en italiano: nombres, codigos fiscales, direcciones, datos de contacto.
- Extraccion de campos estructurados de documentos administrativos, fiscales, legales y sanitarios (numeros de factura, importes, causales, referencias normativas).
- Soporte de esquemas con multiples tipos de entidad y restricciones por campo.
- Capacidad multilingue heredada del base `fastino/gliner2-multi-v1` (no validada especificamente en la model card para otros idiomas).
- Tolerancia a spans largos (hasta 26 tokens) gracias a la expansion de `max_width`.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio: es un modelo de token-classification, no generativo.

## Casos de uso

- Anonimizacion y cumplimiento RGPD en facturas y documentos fiscales italianos: definir un esquema con `nome`, `codice_fiscale`, `partita_iva`, `indirizzo` y ejecutar el modelo sobre cada documento para enmascarar PII antes de almacenar o enviar a terceros.
- Digitalizacion de facturacion electronica: extraer `numero_fattura`, `importo_totale`, `imposta_di_bollo` y `causale` de PDFs convertidos a texto, aprovechando el ajuste especifico de la v2 para no confundir el bollo con el importe principal.
- Procesamiento de documentacion sanitaria: extraer diagnosticos, codigos de procedimiento y datos del paciente de informes clinicos, usando el esquema para delimitar cada campo sin reentrenar.
- Tramitacion administrativa y legal: detectar referencias normativas completas (`art.10 c.1 n.18 D.P.R. 633/1972`) y partes intervinientes en escritos, gracias a `max_width=26`.
- Enriquecimiento de bases de datos documentales: poblar tablas estructuradas a partir de contratos y escrituras, definiendo el esquema por tipo documental y ejecutando el modelo en lote.
- Preprocesado para pipelines RAG: identificar entidades y campos clave en documentos italianos antes de indexarlos, de modo que el recuperador pueda filtrar por entidad o fecha.
- Clasificacion y triaje de correspondencia: extraer remitente, asunto y referencias de practica (`PROT...`, `PRAT...`) para enrutar comunicaciones al departamento correcto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, F1 en datasets publicos) en la informacion disponible. La model card solo reporta ablaciones internas del autor sobre su propio conjunto de 145 entidades:

| Configuracion | Cambio | Efecto reportado |
|---|---|---|
| Stadio 0 -> Stadio 1 | `max_width` 8 -> 26 sobre `fastino/gliner2-multi-v1` | +24 verdaderos positivos exactos sobre 145 entidades |
| Stadio 2 | Pruning 50% + SVD k=24 en layers 0-4 | Recupera codigos fiscales italianos compactos (p. ej. `LMBBRC87M62F205Q`) no extraidos por el base a `mw=26` |
| Stadio 3 | Fine-tuning `span_rep` (35 pasos, trust-region 3,5%) | Corrige confusiones numero de factura / codigos de protocolo, importe principal / bollo, y prefijos de tratamiento en nombres |

Estos datos no son comparables con benchmarks publicos y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo de pesos (307 M parametros), mas activaciones; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- En FP16/BF16: alrededor de 0,7 GB de pesos; en int8: unos 0,35 GB.
- GPU recomendadas: RTX 3060/4060 o superiores para lotes pequenos; A100/H100 no son necesarias por el tamano del modelo.
- Cabe holgadamente en GPU consumer (RTX 3090, RTX 4090, incluso portatiles con 6-8 GB).
- Opciones de despliegue: la libreria `gliner2` (referenciada en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no es desplegable directamente en llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `19Peppe95/gliner2-base-ita-v2` | 307,10 M | no disponible | it, multilingue | Apache 2.0 | Especializado en PII y documentos italianos; ajuste por merging + SVD |
| `19Peppe95/gliner2-base-ita-v1` | ~307 M (misma base) | no disponible | it, multilingue | Apache 2.0 | Version previa con `max_width=16` y merging denso en layers 0-4 |
| `fastino/gliner2-multi-v1` | no disponible | no disponible | multilingue | no disponible en la informacion | Base multilingue zero-shot de Fastino; sin especializacion italiana |
| `DeepMount00/GLiNER_PII_ITA` | no disponible | no disponible | it | no disponible en la informacion | Fuente del task vector para PII en italiano |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin validacion externa: 0 descargas y 0 likes en Hugging Face en el momento de la consulta; los resultados de las ablaciones son autoinformados por el autor.
- El fine-tuning de la cabeza `span_rep` se hizo con solo 4 frases sinteticas, lo que limita la generalizacion a dominios y formatos no representados.
- El ajuste esta orientado a italiano; el rendimiento en otros idiomas, aunque heredado del base multilingue, no esta documentado.
- Al ser un extractor de spans y no un modelo generativo, puede producir falsos positivos en textos con formatos atipicos (tablas, OCR ruidoso) y no razona sobre el contexto mas alla del encoder.
- Riesgo de alucinacion de entidades: como todo NER zero-shot, puede asignar etiquetas a spans que no cumplen el criterio del esquema si las etiquetas son ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene auditar el modelo en el dominio concreto antes de produccion.
- No hay pesos cuantizados ni formatos alternativos publicados, lo que limita el despliegue en entornos sin Python/`gliner2`.
- La expansion de `max_width` a 26 aumenta el coste computacional de la cabeza de spans en inferencia (mas combinaciones de spans por mencion).

## Enlaces

- Hugging Face: https://huggingface.co/19Peppe95/gliner2-base-ita-v2
- Version anterior v1: https://huggingface.co/19Peppe95/gliner2-base-ita-v1
- Modelo base multilingue: https://huggingface.co/fastino/gliner2-multi-v1
- Modelo fuente de PII italiano: https://huggingface.co/DeepMount00/GLiNER_PII_ITA
- Repositorio GLiNER2 de Fastino: https://github.com/fastino-ai/GLiNER2
- Encoder base: https://huggingface.co/microsoft/mdeberta-v3-base
