# cooler8/yejin-korean-8b-v3-dpo-v4

## Resumen

Yejin Korean 8B v3 DPO v4 es un modelo de lenguaje causal desarrollado por el usuario cooler8, especializado en coreano con soporte secundario de ingles. Se presenta como la fase 4 (alineamiento) de la familia Yejin: parte de un modelo base propio y de la version ya ajustada con SFT (`cooler8/yejin-korean-8b-v3-sft-v4`) y anade una etapa de optimizacion por preferencias con DPO sobre 366.049 pares de datos.

El objetivo declarado es mejorar la adherencia a instrucciones y el comportamiento conversacional en coreano, un idioma con menos cobertura en el ecosistema de modelos abiertos. Su interes practico reside en que combina licencia Apache 2.0, pesos abiertos en safetensors y metricas de entrenamiento publicadas (reward accuracy del 92,02% y DPO loss de 0,2307), lo que permite auditar parte del proceso de alineamiento.

Ahora bien, la informacion disponible contiene inconsistencias relevantes: la model card declara 7,24B parametros, mientras que el recuento de pesos safetensors del repositorio indica 905.217.536 parametros (aproximadamente 0,91B), y el repositorio ocupa 30,0 GB. Esa discrepancia no esta resuelta en el material facilitado y condiciona cualquier estimacion de hardware, latencia o calidad esperada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal, descrito por el autor como arquitectura propia; las etiquetas del repositorio incluyen `qwen3`, sin confirmacion adicional |
| Parametros totales | 7,24B segun la model card; 905.217.536 (aprox. 0,91B) segun el recuento safetensors del repositorio (discrepancia no aclarada) |
| Parametros activos | No aplica: no se describe una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible: el repositorio solo publica pesos safetensors; no se listan versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | coreano (ko) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | cooler8/yejin-korean-8b-v3-sft-v4 |
| Tarea declarada | text-generation (causal LM conversacional) |
| Tamano del repositorio | 30,0 GB |
| Tokens de parada | `<|end|>` (ID 7) y `</s>` (ID 2) |
| Configuracion de generacion recomendada | Decodificacion greedy (`do_sample=False`) con `repetition_penalty=1.05` |

## Arquitectura y entrenamiento

El modelo sigue un pipeline de alineamiento en cuatro fases. Sobre un modelo base de arquitectura propia se realizo primero un ajuste supervisado (SFT v4) con 1,04 millones de ejemplos, dando lugar a `cooler8/yejin-korean-8b-v3-sft-v4`. Sobre ese checkpoint se aplico despues la fase 4 que da nombre a este repositorio: un alineamiento por preferencias con DPO en modo full FSDP (Full Sharding) sobre 366.049 pares. La composicion declarada del dataset de preferencias es AI Hub de preferencias de usuario (100.000 pares) mas Ko-UltraFeedback, Orca DPO traducido al coreano y Orca Math DPO traducido al coreano.

El entrenamiento se ejecuto en KT Cloud AI Nexus sobre 8 GPU NVIDIA H200 (143 GB cada una) con FSDP. Se completo en 1 epoch y 2.853 pasos, con un tiempo total de 10 horas y 2 minutos. Las metricas finales reportadas son DPO loss de 0,2307, reward accuracy del 92,02%, reward margin de 5,678 y mean token accuracy del 72,75%. No se detalla la composicion exacta del corpus de preentrenamiento ni del SFT, ni si hubo etapas adicionales de RLHF o decodificacion especulativa. La etiqueta `qwen3` presente en el repositorio sugiere una posible relacion con esa familia de arquitecturas, pero no hay confirmacion en la documentacion.

## Capacidades

- Generacion de texto causal en coreano e ingles, con foco declarado en el coreano.
- Comportamiento conversacional multi-turno derivado de la etapa de alineamiento por preferencias.
- Seguimiento de instrucciones reforzado mediante DPO sobre datos de preferencia humano-sinteticos.
- Razonamiento matematico basico y resolucion de problemas, inferido de la inclusion de Orca Math DPO en el dataset de alineamiento (no hay benchmarks que lo confirmen).
- Generacion y explicacion de codigo: no disponible en la informacion facilitada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" o razonamiento extendido explicito: no disponible.
- Capacidades multilingues: limitadas a coreano e ingles segun las etiquetas del repositorio.

## Casos de uso

- Asistente conversacional en coreano: el modelo esta alineado con DPO sobre preferencias de usuarios coreanos, por lo que es adecuado para chatbots multi-turno donde la naturalidad y el tono en coreano sean prioritarios.
- Atencion al cliente automatizada en coreano: puede gestionar respuestas a consultas frecuentes en centros de soporte coreanos, aprovechando la etapa de alineamiento para reducir respuestas genericas o evasivas.
- Generacion de contenido editorial en coreano: redaccion de borradores de articulos, descripciones de producto o publicaciones para redes, con posterior revision humana dado el riesgo de alucinacion.
- Traduccion asistida coreano-ingles: al declarar ambos idiomas, puede emplearse como primer paso de traduccion o como revisor de traducciones existentes, siempre con verificacion posterior.
- Resumen y reescritura de documentos coreanos: condensacion de informes, actas o correos en coreano, ajustando el registro formal o informal segun la instruccion.
- Anotacion y preetiquetado de datos en coreano: generacion de etiquetas o categorias preliminares sobre corpus coreanos que despues se revisan manualmente, como paso previo a entrenar otros modelos.
- Investigacion en alineamiento: el repositorio documenta DPO loss, reward accuracy y reward margin, lo que lo convierte en un caso de estudio util para reproducir experimentos de DPO sobre modelos de tamano medio.
- Tutoria o asistencia educativa en coreano: explicacion de conceptos y resolucion guiada de ejercicios, apoyandose en los datos de tipo Orca Math utilizados en la alineacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Lo unico documentado son las metricas internas del entrenamiento DPO:

| Metrica | Valor |
|---|---|
| DPO loss final | 0,2307 |
| Reward accuracy | 92,02% |
| Reward margin | 5,678 |
| Mean token accuracy | 72,75% |
| Pasos de entrenamiento | 2.853 |
| Epocas | 1 |
| Tiempo total de entrenamiento | 10 h 2 min |
| Hardware de entrenamiento | 8x NVIDIA H200 (143 GB) con FSDP full sharding |

Estas cifras describen el ajuste al dataset de preferencias, no la calidad general del modelo frente a terceros. No hay datos de comparacion con modelos similares.

## Requisitos de hardware

Las estimaciones siguientes se basan en la cifra de 7,24B parametros declarada en la model card. Si el recuento real de safetensors (0,91B) fuese el correcto, todas las cifras se reducirian aproximadamente en un factor de ocho.

- VRAM estimada para inferencia (escenario 7,24B): en FP16/BF16, en torno a 15-16 GB de pesos mas overhead de KV cache y activaciones; en INT8, aproximadamente 8-9 GB; en cuantizacion de 4 bits, alrededor de 5-6 GB.
- VRAM estimada para inferencia (escenario 0,91B): en FP16/BF16, unos 2 GB; en 4 bits, por debajo de 1 GB.
- GPU recomendadas: para FP16 sin cuantizar, una NVIDIA A100 40 GB, H100 o L40S es suficiente; con cuantizacion, cabe en RTX 4090 (24 GB) e incluso en RTX 3090 (24 GB) o GPUs de 16 GB.
- Cabe en GPU de consumo: si se confirma el tamano de 7,24B y se usa cuantizacion de 8 o 4 bits, si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) o similares. En FP16 completo, necesitaria al menos 16-24 GB de VRAM.
- Opciones de despliegue: Hugging Face Transformers para inferencia directa con safetensors; vLLM o TGI para servir con throughput alto; llama.cpp u Ollama requeririan conversion previa a GGUF, que no se distribuye en el repositorio. El uso de decodificacion greedy con `repetition_penalty=1.05` esta recomendado por el autor.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.
- Coste de entrenamiento declarado: 8 GPU H200 durante 10 horas y 2 minutos para la fase DPO.

## Comparativa con modelos similares

No disponible. La informacion facilitada no incluye benchmarks ni especificaciones de modelos comparables de la misma categoria (modelos de 7-8B orientados a coreano, como podrian ser variantes ajustadas de Qwen, Llama o EXAONE). La unica referencia interna es su propio modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cooler8/yejin-korean-8b-v3-dpo-v4 | 7,24B declarados / 905.217.536 segun safetensors | no disponible | Apache 2.0 | Hugging Face |
| cooler8/yejin-korean-8b-v3-sft-v4 (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas coreanas de 7-8B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Inconsistencia critica en el numero de parametros: la model card indica 7,24B y el recuento safetensors del repositorio, 905.217.536. Hasta que se aclare, cualquier planificacion de infraestructura o presupuesto de VRAM es especulativa.
- El repositorio ocupa 30,0 GB, un tamano que no encaja de forma evidente con ninguno de los dos recuentos de parametros en precision FP16, lo que refuerza la necesidad de verificar los pesos antes de usarlos.
- Ausencia total de benchmarks publicos (MMLU, GSM8K, HumanEval, etc.), lo que impide evaluar su calidad real frente a alternativas de la misma categoria.
- No se documenta la longitud de contexto soportada, un dato esencial para aplicaciones con documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinacion inherente a los modelos de lenguaje ajustados con DPO: las metricas de preferencia no garantizan veracidad factual, especialmente en dominios especializados.
- Sesgos potenciales derivados del corpus: el dataset de alineamiento combina datos de AI Hub coreano con traducciones de Orca y Ko-UltraFeedback, lo que puede introducir sesgos de traduccion y una sobrerrepresentacion de ciertos estilos de respuesta.
- Cobertura linguistica limitada a coreano e ingles; no hay evidencia de calidad en castellano ni en otros idiomas.
- El autor recomienda decodificacion greedy con `repetition_penalty=1.05`, lo que sugiere sensibilidad a la configuracion de muestreo y posible degradacion con temperaturas altas.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se documenten los cambios. No se declaran restricciones adicionales de uso aceptable.
- Trazabilidad limitada: el repositorio registra 0 descargas y 0 likes, sin comunidad que haya validado el modelo, y la fecha de creacion indicada (2026-10-12) no aporta informacion util sobre su madurez.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su arquitectura o su familia; los resultados obtenidos no guardan relacion con el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cooler8/yejin-korean-8b-v3-dpo-v4
- Modelo base (SFT v4): https://huggingface.co/cooler8/yejin-korean-8b-v3-sft-v4
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web no devolvio enlaces relevantes sobre este modelo.
