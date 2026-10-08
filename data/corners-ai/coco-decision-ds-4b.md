# corners-ai/CoCo-Decision-DS-4B

## Resumen

CoCo-Decision-DS-4B es un adaptador LoRA de 4B parametros sobre Qwen/Qwen3.5-4B, desarrollado por corners-ai, especializado en la toma de decisiones para respuesta ante desastres (disaster safety, DS). No es un modelo generativo: dada una situacion y una pregunta tipada, devuelve una distribucion de probabilidad sobre las opciones en lugar de texto libre. Es la version adaptada al dominio de seguridad y emergencias del modelo CoCo-Decision-4B-Ko, del mismo autor.

El modelo cubre tres tipos de pregunta: `noul` (probabilidad de que una afirmacion de si/no sea cierta), `choice` (probabilidad de cada opcion listada) y `score` (probabilidad de cada punto de una escala ordinal). Las probabilidades se leen directamente de los logits de los tokens de etiqueta de opcion en una unica pasada forward, de modo que cada decision cuesta un prefill y ninguna generacion autoregresiva.

Su relevancia practica reside en la calibracion: con una exactitud de 0,879 y un ECE de 0,079 en el benchmark publico JevBench (231 casos, datos autoinformados por el autor), las probabilidades pueden usarse como umbrales operativos en lugar de respuestas generadas, por ejemplo proponer una accion automaticamente por encima de 0,9 y requerir confirmacion humana por debajo. El contexto de entrenamiento es de 4.096 tokens y los idiomas declarados son coreano e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre un modelo base de lenguaje causal (Qwen/Qwen3.5-4B); proyecciones de atencion y linear-attention adaptadas |
| Parametros totales | 4B en el modelo base (el tamano del adaptador no esta desglosado; el repositorio ocupa 0.0 GB) |
| Parametros activos | No aplica (no se describe como modelo MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | bf16 en el modelo base; carga en 4-bit nf4 mediante bitsandbytes (compute dtype bf16, double quant). No hay cuantizaciones publicadas en el repositorio |
| Idiomas soportados | Coreano (ko) e ingles (en); los datos de dominio de desastres son sinteticos en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no se publican pesos en GGUF |
| Libreria | peft (requiere transformers>=5.17 y peft>=0.21) |
| Modelo base (revision) | Qwen/Qwen3.5-4B, revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` |
| Etiqueta de pipeline | text-classification |
| Version | 1.0.0 (2026-10-08), tag `v1.0.0` |

## Arquitectura y entrenamiento

CoCo-Decision-DS-4B no es un modelo completo, sino un adaptador LoRA de rango 16 y alpha 32 insertado en las proyecciones de atencion y de linear-attention de Qwen/Qwen3.5-4B. La innovacion funcional no esta en la arquitectura, sino en la interfaz de decision: el modelo no genera la respuesta, sino que lee los logits del siguiente token correspondientes a las etiquetas de opcion (`" A"`, `" B"`, ...) y aplica softmax unicamente sobre esos tokens. El resultado es una distribucion de probabilidad calibrada sobre las opciones, obtenida con una sola pasada forward sin decodificacion autoregresiva.

El entrenamiento parte de la receta de CoCo-Decision-4B-Ko y anade decisiones sinteticas de respuesta a desastres en coreano (incendios, fugas de gas, inundaciones, terremotos y escenarios de aglomeraciones) derivadas de un procedimiento operativo estandar de instalaciones. No se menciona RLHF ni DPO en la informacion disponible. El conjunto de datos especifico de respuesta a desastres no se ha publicado, por lo que el entrenamiento no es reproducible a partir de los artefactos liberados. La formulacion de prompt esta fijada por el entrenamiento, con un formato exacto de `State:`, `Question:`, `Options:` y la coletilla `Answer with the letter only.`, aplicando la plantilla de chat con `add_generation_prompt=True` y anadiendo `Answer:` al final.

## Capacidades

- Clasificacion de decisiones con salida probabilistica en tres formatos de pregunta: `noul` (si/no), `choice` (opciones multiples) y `score` (escala ordinal con probabilidad por punto).
- Lectura de probabilidades calibradas en una unica pasada forward, sin generacion de texto, lo que permite usar umbrales numericos en logica de negocio.
- Clasificacion de informes de campo y eventos de sensores en escenarios de respuesta a desastres (incendio, fuga de gas, inundacion, terremoto, aglomeraciones).
- Propuesta del siguiente paso de un procedimiento operativo estandar a partir del estado de la situacion.
- Senalizacion de casos en los que se requiere confirmacion humana, mediante umbrales sobre la probabilidad devuelta.
- Acepta el estado de la situacion como texto libre o como JSON estructurado dentro del campo `State:`.
- Capacidad bilingue coreano-ingles en la interfaz, con el dominio de desastres entrenado principalmente en coreano.
- No soporta generacion de texto abierta, tool calling, function calling ni razonamiento multi-paso de tipo agente; la model card excluye explicitamente la generacion abierta del ambito de uso.

## Casos de uso

- Triage de informes de campo en respuesta a incidentes: el modelo clasifica un informe entrante (por ejemplo, humo denso en un pasillo con personas dentro) en categorias como incendio, inundacion, aglomeracion u otras, devolviendo una probabilidad que permite enrutar el aviso al equipo adecuado.
- Clasificacion de eventos de sensores con umbral de escalado: cada lectura de sensor se traduce en una pregunta de tipo `noul` y la probabilidad resultante alimenta una regla de negocio que escala automaticamente por encima de un umbral (por ejemplo, 0,9) y requiere operador por debajo.
- Asistencia al mando de incidentes en instalaciones: dado el estado actual y una pregunta tipada, el modelo propone el siguiente paso del procedimiento con una probabilidad asociada, manteniendo siempre la aprobacion de una persona responsable.
- Priorizacion y filtrado de falsos positivos en centros de control: al disponer de una probabilidad calibrada (ECE 0,079), el modelo permite ordenar alertas por confianza y descartar las de baja probabilidad sin generar texto intermedio.
- Integracion en cuadros de mando y sistemas de gestion de incidentes: la salida es una distribucion sobre claves de opcion, directamente consumible por logica de decision determinista, auditoria y registro de umbrales.
- Entrenamiento y evaluacion de operadores en simulacros: comparar la distribucion de probabilidad del modelo con la decision tomada por el operador en escenarios sinteticos de incendio, fuga de gas, inundacion, terremoto y aglomeraciones.
- Auditoria de calibracion de decisiones: la combinacion de accuracy y ECE permite medir si las probabilidades del sistema son utilizables como umbrales operativos antes de desplegarlo en produccion.
- Extraccion de decisiones estructuradas sin coste de generacion: al requerir solo un prefill y una pasada forward, es adecuado para pipelines de alto volumen donde generar texto seria prohibitivo en latencia y coste.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (no verificados de forma independiente; el campo `verified` es `false`). Medidos con `omj bench` en bf16 en octubre de 2026.

| Suite | N | CoCo-Decision-DS-4B accuracy | CoCo-Decision-DS-4B ECE | CoCo-Decision-4B-Ko accuracy | CoCo-Decision-4B-Ko ECE |
|---|---|---|---|---|---|
| JevBench public | 231 | 0,879 (intervalo de Wilson al 95%: 0,83-...; dato truncado en la informacion disponible) | 0,079 (15 bins) | No disponible (columna truncada en la informacion disponible) | No disponible (columna truncada en la informacion disponible) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El intervalo de confianza de la exactitud aparece truncado en la fuente citada.

## Requisitos de hardware

- VRAM documentada por el autor: 12 GB de memoria de GPU en bf16 con contexto de 4.096 tokens.
- VRAM documentada con el modelo base en 4-bit: 8 GB, usando `BitsAndBytesConfig` con `load_in_4bit=True`, `bnb_4bit_quant_type="nf4"`, `bnb_4bit_compute_dtype=torch.bfloat16` y `bnb_4bit_use_double_quant=True`.
- Numero de parametros: 4B en el modelo base; el adaptador LoRA anade un coste marginal de memoria y almacenamiento (el repositorio ocupa 0.0 GB).
- GPU de consumo compatibles: cualquier GPU con al menos 8 GB de VRAM para la configuracion 4-bit (por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080, RTX 4090) y al menos 12 GB para bf16. No cabe en GPUs de 6-8 GB si se quiere bf16.
- GPU de centro de datos: A100, H100 o similares para despliegues con mayor concurrencia; no hay cifras publicadas de throughput ni de latencia.
- Opciones de despliegue documentadas: transformers>=5.17 junto con peft>=0.21 y bitsandbytes. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni existe version GGUF publicada, por lo que estas vias no estan confirmadas.
- Latencia: por diseno, una decision requiere un unico prefill y una pasada forward sin generacion autoregresiva; no se publican valores numericos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en JevBench public | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoCo-Decision-DS-4B | 4B (adaptador LoRA sobre Qwen/Qwen3.5-4B) | 4.096 tokens | 0,879 de accuracy y 0,079 de ECE (N=231, autoinformado) | Apache 2.0 | Adaptador en HuggingFace |
| CoCo-Decision-4B-Ko | 4B (adaptador LoRA; modelo del mismo autor y receta original) | No disponible en la informacion proporcionada | No disponible (columna truncada en la informacion disponible) | Apache 2.0 | Adaptador en HuggingFace; endpoint de inferencia en FriendliAI |
| Qwen/Qwen3.5-4B | 4B (modelo base completo) | No disponible en la informacion proporcionada | No aplica: es un modelo generativo, no un modelo de decision con cabecera de calibracion | No disponible en la informacion proporcionada | Pesos base en HuggingFace (revision `851bf6e8`) |

No se dispone de datos de otros modelos de decision comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: la model card excluye explicitamente la generacion abierta del ambito de uso. Solo devuelve distribuciones sobre opciones predefinidas.
- El formato de prompt esta fijado por el entrenamiento. Cualquier desviacion en `State:`, `Question:`, `Options:`, la coletilla `Answer with the letter only.` o el uso de `add_generation_prompt=True` con `Answer:` reduce la exactitud y la calibracion.
- Las probabilidades se leen de los logits de las letras con espacio inicial (`" A"`, `" B"`, ...) y se aplica softmax solo sobre esas letras; hacerlo de otra forma invalida la calibracion.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible. El dominio de desastres se entreno con datos sinteticos derivados de un unico procedimiento operativo estandar, lo que puede no generalizar a otras instalaciones, normativas o paises.
- Riesgo de alucinacion en el sentido de sobreconfianza fuera de dominio: la calibracion declarada (ECE 0,079) corresponde al benchmark JevBench public y no garantiza el mismo comportamiento en distribuciones distintas.
- Limitacion de contexto: 4.096 tokens. Estados de situacion largos o historiales extensos deben truncarse o resumirse.
- Limitacion de idioma: coreano e ingles. El dominio de desastres se entreno principalmente en coreano, por lo que el rendimiento en ingles fuera del benchmark no esta cuantificado en la informacion disponible.
- Reproducibilidad: el conjunto de datos de respuesta a desastres no se ha publicado, por lo que no es posible reproducir el entrenamiento.
- Resultados autoinformados: el model-index marca las metricas como no verificadas; no hay evaluacion independiente en la informacion disponible.
- Restricciones de uso: licencia Apache 2.0, que permite uso comercial, pero toda accion propuesta debe ser aprobada por una persona responsable. Quedan fuera de alcance el control autonomo de equipos de seguridad, la sustitucion de procedimientos oficiales de emergencia o del criterio de los servicios de extincion, y la generacion abierta.
- El modelo no esta afiliado ni respaldado por TypeSafe AI; "System One" y "Jev" son nombres usados por TypeSafe AI y esta implementacion solo es compatible a nivel de interfaz.
- No hay soporte documentado de cuantizaciones GGUF, vLLM, TGI, Ollama ni llama.cpp, lo que limita las opciones de despliegue en produccion a transformers + PEFT.
- Codigo de ejemplo dependiente de versiones concretas: transformers>=5.17, peft>=0.21 y bitsandbytes para 4-bit.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/corners-ai/CoCo-Decision-DS-4B
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo predecesor CoCo-Decision-4B-Ko: https://huggingface.co/corners-ai/CoCo-Decision-4B-Ko
- Ficha de CoCo-Decision-4B y JevBench en Benchmark Heaven: https://benchmarkheaven.com/jev-models/coco-decision-4b
- Endpoint de inferencia de CoCo-Decision-4B-Ko en FriendliAI: https://friendli.ai/models/corners-ai/CoCo-Decision-4B-Ko
