# M-o-r-p-h-e-u-s/SILY-1-Chat

## Resumen

SILY 1 0.4B A0.1B Chat es la variante afinada para conversacion del modelo base SILY 1 0.4B A0.1B Base, desarrollado por el usuario M-o-r-p-h-e-u-s. Se trata de un modelo de lenguaje de arquitectura propia y experimental que combina mezcla de expertos (MoE) con un transformer con bucles y comparticion de pesos, disenado para explorar alternativas eficientes a los transformers densos convencionales. Con 476,9 millones de parametros totales y solo 113,5 millones activos por token, el modelo busca ofrecer un coste de inferencia bajo manteniendo una capacidad de representacion relativamente alta.

El modelo ha sido afinado sobre aproximadamente 1,98 millones de filas de conversacion (1,05 mil millones de tokens) en una sola epoca, un proceso que segun el autor requirio 53 horas en una unica GPU RTX 3060 de 12 GB. Esta orientado exclusivamente al ingles y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su ventana de contexto es de solo 1024 tokens, una limitacion importante para aplicaciones reales.

La relevancia de este modelo es principalmente experimental y educativa: demuestra que es posible entrenar y afinar un modelo conversacional con arquitecturas no estandar en hardware de consumo. Sin embargo, el propio autor advierte que sus conocimientos factuales y su aritmetica no son fiables, por lo que no esta pensado para produccion critica sino como banco de pruebas de arquitecturas hibridas y tecnicas de comparticion de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles y comparticion de pesos, mezcla de expertos (MoE) por banco |
| Parametros totales | 476,9 M |
| Parametros activos | 113,5 M por token |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, sin variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`), tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura se organiza en 5 bancos de 3 bloques cada uno (dos convoluciones con compuerta y un bloque de atencion), ejecutados con un numero variable de pasadas: 2, 2, 3, 2 y 2 respectivamente, lo que resulta en 33 aplicaciones de bloque por token. Cada banco incorpora 253 expertos enrutados (se activan 4 por token) y un experto siempre activo por pasada y bloque, compartido entre los bloques y pasadas del mismo banco. La anchura del modelo es de 384 dimensiones con 6 cabezas de consulta y 3 de clave-valor. El tokenizer es un BPE a nivel de byte con 12.288 tokens, de los cuales 9 son especiales; los seis tokens de rol no se usaron en el preentrenamiento y se aprendieron durante el ajuste conversacional.

El preentrenamiento se realizo sobre 13,4 mil millones de tokens de Dolma 3 en una sola epoca. El ajuste conversacional (chat-tuning) empleo 1.979.103 filas de entrenamiento y 1,05 mil millones de tokens en una epoca, con una perdida en el conjunto de validacion que paso de 1,747 a 1,198 nats por token de respuesta. Los datos de ajuste provienen de ocho conjuntos: HuggingFaceTB/smoltalk, allenai/Dolci-Instruct-SFT, nvidia/Nemotron-SFT-Instruction-Following-Chat-v2, Open-Orca/SlimOrca-Dedup, allenai/WildChat-4.8M, HuggingFaceH4/no_robots, databricks/databricks-dolly-15k y lmsys/lmsys-chat-1m. No se menciona el uso de RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con respuestas bien formadas y capacidad de terminar en el momento adecuado.
- Razonamiento basico y respuesta a instrucciones, aunque con fiabilidad limitada en hechos y calculos.
- Soporte de mensajes de sistema mediante la etiqueta `<|system|>` en la plantilla de chat.
- Gestion de conversaciones con descarte del intercambio mas antiguo cuando se supera la ventana de contexto de 1024 tokens.
- Generacion de multiples muestras por prompt (`--samples`) para explorar variabilidad en las respuestas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Experimentacion con arquitecturas MoE y transformers con bucles: el modelo sirve como banco de pruebas para estudiar el comportamiento de la comparticion de pesos y el enrutamiento de expertos en un entorno de conversacion controlado.
- Educacion e investigacion sobre ajuste fino: su entrenamiento en una sola RTX 3060 lo convierte en un caso reproducible para estudiar tecnicas de SFT con presupuesto de hardware muy limitado.
- Prototipado rapido de interfaces conversacionales: permite validar plantillas de chat, formatos de mensajes de sistema y flujos multi-turno antes de migrar a modelos mayores.
- Generacion de respuestas breves y creativas en ingles: poemas, listas de consejos o respuestas cortas donde la exactitud factual no es critica.
- Pruebas de robustez y evaluacion de alucinaciones: al ser un modelo pequeno y con limitaciones conocidas, es util para construir pipelines de deteccion de respuestas no fiables.
- Demostraciones locales en hardware de consumo: su tamano reducido y su formato PyTorch permiten ejecutarlo en portatiles con GPU modesta para talleres y charlas tecnicas.
- Investigacion sobre tokenizers y tokens especiales: el uso de seis tokens de rol aprendidos solo en el ajuste ofrece un caso de estudio sobre inyeccion de tokens especiales y control de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida en el conjunto de validacion de chat: 1,747 nats por token de respuesta antes del ajuste y 1,198 despues.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,9 GB y los pesos estan en `model.pt`; en fp32 se puede estimar en torno a 2 GB de VRAM, y en bf16 aproximadamente 1 GB, aunque no se publican cifras oficiales.
- GPU recomendadas: el autor entreno el ajuste en una RTX 3060 de 12 GB; para inferencia es suficiente con GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 2-4 GB de VRAM libre, incluidas GTX 1650 o RTX 3050.
- Opciones de despliegue: el repositorio incluye scripts propios (`modeling.py`, `generate.py`, `chat.py`) que requieren `torch` y `tokenizers`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo reporta 53 horas para el ajuste completo en una RTX 3060, no cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SILY 1 0.4B A0.1B Chat | 476,9 M | 113,5 M | 1024 | Apache 2.0 | Hugging Face, pesos PyTorch |
| TinyLlama 1.1B Chat | 1,1 B | denso | 2048 | Apache 2.0 | Hugging Face, GGUF, vLLM |
| Qwen2.5 0.5B Instruct | 0,49 B | denso | 32.768 | Apache 2.0 | Hugging Face, GGUF, vLLM |
| SmolLM2 360M Instruct | 0,36 B | denso | 8192 | Apache 2.0 | Hugging Face, GGUF, vLLM |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de resultados de benchmarks de SILY 1 que permitan comparar rendimiento numerico con estas alternativas.

## Limitaciones y advertencias

- El propio autor advierte que los hechos y la aritmetica del modelo no son fiables; no debe usarse para tareas que requieran exactitud factual.
- Ventana de contexto muy reducida (1024 tokens), lo que limita conversaciones largas y documentos extensos.
- Entrenado exclusivamente en ingles; no se garantiza un comportamiento correcto en otros idiomas.
- El modelo solo funciona correctamente con la plantilla de chat exacta usada en el entrenamiento; cualquier otro formato degrada gravemente la calidad.
- Riesgo de alucinacion elevado por su tamano y por la naturaleza de los datos de ajuste.
- Posibles sesgos heredados de los conjuntos de datos de conversacion utilizados (WildChat, lmsys-chat-1m, etc.).
- No se documentan cuantizaciones ni integraciones con frameworks de despliegue estandar, lo que complica su uso en produccion.
- Licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks y las limitaciones declaradas desaconsejan su uso en entornos criticos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/M-o-r-p-h-e-u-s/SILY-1-Chat)
- [Modelo base SILY 1 0.4B A0.1B Base](https://huggingface.co/M-o-r-p-h-e-u-s/SILY-1-BASE)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
