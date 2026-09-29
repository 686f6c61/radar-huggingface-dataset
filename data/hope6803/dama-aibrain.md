# hope6803/dama-aibrain

## Resumen

Dama-aibrain es un ajuste fino (fine-tune) del modelo base `unsloth/gemma-4-e2b-it-unsloth-bnb-4bit`, publicado por el usuario hope6803 en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de lenguaje causal con 5.123.178.051 parametros totales segun los pesos en safetensors, y su pipeline declarado es `image-text-to-text`, lo que indica soporte declarado para entradas multimodales de imagen y texto, aunque no se detallan las capacidades de vision en la model card.

El modelo se presenta como un ajuste fino generico de instrucciones ("Uploaded finetuned model"), entrenado segun el autor con Unsloth y la libreria TRL de HuggingFace, con la mencion de un entrenamiento "2x mas rapido". No se aportan detalles sobre el dataset de ajuste, el numero de tokens de entrenamiento ni la metodologia de alineacion (RLHF, DPO u otras). La model card es minima y no incluye resultados de evaluacion.

Es relevante principalmente como ejemplo de la practica actual de publicar adaptaciones de modelos Gemma mediante pipelines de entrenamiento eficientes (Unsloth + TRL). Hay que tener en cuenta que existen multiples repositorios con el mismo nombre (`nexflow/dama-aibrain`, `ic4u2u/dama-aibrain`, `spoindo/dama-aibrain`, `artnfull/dama-aibrain`, `tlsrmawl/dama-aibrain`), lo que sugiere una plantilla o re-subida comun y dificulta trazar la procedencia real del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Gemma); detalles no disponibles |
| Parametros totales | 5.123.178.051 (5,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (segun fichas de terceros; no confirmado en la model card oficial) |
| Tipos de cuantizacion | GGUF (etiqueta declarada); cuantizaciones concretas no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en `unsloth/gemma-4-e2b-it-unsloth-bnb-4bit`, un derivado de la familia Gemma distribuido por Unsloth ya cuantizado en 4 bits (bnb-4bit). La nomenclatura "e2b" sigue la convencion de Gemma para modelos con parametros efectivos reducidos, aunque no se dispone de confirmacion oficial de los parametros activos en esta ficha. Los pesos publicados en safetensors suman 5,1 B parametros totales, y el tamano del repositorio es de 16,3 GB, coherente con pesos almacenados en precision alta ademas de formatos alternativos.

No hay informacion publica sobre la composicion del dataset de ajuste, el volumen de tokens empleado, ni el uso de tecnicas de alineacion como RLHF o DPO. La unica innovacion tecnica mencionada es el uso de Unsloth y TRL de HuggingFace para acelerar el entrenamiento aproximadamente 2x. No se documentan tecnicas de atencion (linear attention, decodificacion especulativa, etc.) ni detalles del tokenizador.

## Capacidades

- Generacion de texto conversacional segun la etiqueta `conversational`.
- Generacion de texto de proposito general e instrucciones (pipeline `text-generation`).
- Entrada multimodal imagen-texto declarada mediante el pipeline `image-text-to-text` (no se detallan tareas concretas de vision).
- Compatibilidad con Text Generation Inference (TGI) y con `transformers`.
- Formato GGUF disponible para inferencia en `llama.cpp` y derivados.
- Soporte multilingue limitado al ingles (`en`).
- No se documentan capacidades de tool calling, function calling, agentes ni modo de razonamiento explicito.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: al ser un ajuste de un modelo Gemma ya instruido y desplegable con TGI o llama.cpp, sirve para validar flujos de chat sin infraestructura dedicada.
- Experimentacion docente con fine-tuning eficiente: el modelo es un ejemplo directo del flujo Unsloth + TRL, util para laboratorios que ensenan a adaptar modelos abiertos cuantizados.
- Despliegue en entornos con GPU modesta: con cuantizacion GGUF puede ejecutarse en GPU de consumo para tareas de generacion de texto no criticas.
- Generacion de texto general en ingles: resumenes, reformulacion o borradores, aprovechando la ventana de contexto de hasta 32.768 tokens declarada por terceros.
- Pruebas de pipelines multimodales: al declarar `image-text-to-text`, puede emplearse para explorar flujos que reciban imagenes, verificando antes de produccion la calidad real de esa capacidad.
- Base para nuevos ajustes especificos de dominio: sirve como punto de partida de fine-tunes posteriores en ingles con Unsloth o TRL.
- Investigacion sobre replicabilidad: util para comparar variantes con el mismo nombre pero distinto autor y documentar diferencias de pesos y configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10,3 GB segun LLM Explorer (coherente con pesos de 5,1 B en precision de 16 bits); en cuantizacion de 4 bits se reduce de forma sustancial, aunque no se dispone de cifras oficiales.
- Cabe en GPU de consumo en cuantizacion de 4 bits (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) siempre que el ajuste de contexto no fuerce un KV cache grande.
- Para contexto completo de 32.768 tokens conviene reservar VRAM adicional para el cache de atencion; en GPU de 24 GB es manejable, en 8-12 GB puede requerir cuantizacion agresiva o reduccion de contexto.
- GPU recomendadas para produccion: A100, H100 o L40S si se busca throughput alto; RTX 4090 o A6000 para despliegues de gama media.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), llama.cpp y servidores compatibles con GGUF (por ejemplo, Ollama, segun disponibilidad del archivo). No se confirma soporte explicito de vLLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de rendimiento no estan disponibles, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hope6803/dama-aibrain | 5,1 B | 32.768 tokens (segun terceros) | apache-2.0 | HuggingFace, con variantes GGUF |
| spoindo/dama-aibrain (mismo nombre) | 5,1 B | 32.768 tokens | apache-2.0 | HuggingFace, API en Featherless |
| artnfull/dama-aibrain (mismo nombre) | 5,1 B | no disponible | apache-2.0 | HuggingFace, API en Featherless |
| Gemma base (unsloth/gemma-4-e2b-it) | no disponible | no disponible | segun modelo base | HuggingFace |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con modelos de la misma categoria; cualquier comparacion cuantitativa seria especulativa.

## Limitaciones y advertencias

- Model card practicamente vacia: sin datos de entrenamiento, evaluacion ni uso previsto, lo que dificulta valorar su calidad.
- Riesgo elevado de alucinacion: no se documentan evaluaciones de veracidad ni tecnicas de mitigacion.
- Soporte unicamente en ingles; el rendimiento en castellano u otros idiomas es incierto.
- La capacidad multimodal (`image-text-to-text`) esta declarada pero no documentada; conviene verificarla antes de usarla en produccion.
- Ambiguedad de procedencia: existen multiples repositorios homonimos (`nexflow`, `ic4u2u`, `spoindo`, `artnfull`, `tlsrmawl`) que complican la trazabilidad y la verificacion de pesos.
- Deriva de un modelo base ya cuantizado en 4 bits (bnb-4bit), lo que puede afectar a la calidad respecto a un ajuste sobre pesos en precision completa.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene revisar las condiciones del modelo base original de Gemma antes de un despliegue comercial.
- Sin datos de sesgos, toxicidad ni evaluaciones de seguridad publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hope6803/dama-aibrain
- Repositorio homonimo 1: https://huggingface.co/nexflow/dama-aibrain
- Repositorio homonimo 2: https://huggingface.co/ic4u2u/dama-aibrain
- API en Featherless (spoindo): https://featherless.ai/models/spoindo/dama-aibrain
- API en Featherless (artnfull): https://featherless.ai/models/artnfull/dama-aibrain
- Ficha en LLM Explorer (tlsrmawl): https://llm-explorer.com/model/tlsrmawl%2Fdama-aibrain,6zz3BxCvKLPjqjZ4F4wpaD
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
