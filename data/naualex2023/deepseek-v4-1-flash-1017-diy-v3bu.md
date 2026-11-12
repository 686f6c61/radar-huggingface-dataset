# naualex2023/DeepSeek-V4.1-Flash-1017-DIY-v3bu

## Resumen

DeepSeek-V4.1-Flash-1017 DIY IQ1_S (v3bu) es una cuantizacion GGUF de clase 1 bit (1,68 bpw) del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario independiente naualex2023. No se trata de un modelo original, sino de una distribucion derivada y reproducible del backbone de DeepSeek-V4.1-Flash-1017, cuantizado con llama.cpp a partir de los pesos publicos oficiales. El objetivo declarado es conseguir que un modelo de gran escala (552B de backbone mas 196B de Engram) quepa de forma residente en una maquina de 128 GB de RAM, en concreto una APU AMD Ryzen AI Max+ 395 (Strix Halo).

El paquete se compone de cinco shards del backbone (121,8 GB en total) y deja fuera el tensor de memoria condicional Engram (110,6 GB), que debe descargarse por separado desde el repositorio de Unsloth y marcarse como shard 6. Esta separacion permite cargar el backbone completo en memoria unificada y mantener la tabla Engram en SSD con carga perezosa. La relevancia de esta ficha radica en que documenta un caso real de cuantizacion extrema (1,68 bpw) sobre un modelo de escala frontera, con mediciones de calidad frente a una referencia Q8 y frente a la cuantizacion oficial de Unsloth.

La informacion disponible sobre el modelo base (arquitectura exacta, numero de parametros activos, contexto nativo, idiomas y licencia concreta) es limitada; esta ficha se limita a lo publicado en la model card del repositorio de cuantizacion y marca explicitamente como "no disponible" todo aquello que no aparece en ella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base DeepSeek-V4.1-Flash-1017; la cuantizacion conserva la topologia del base, con backbone de 552B y modulo Engram de 196B segun la model card) |
| Parametros totales | 552B (backbone) + 196B (Engram) segun la model card del autor |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo (`-c 32768`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | IQ1_S (1,68 bpw) para el backbone; IQ4_NL para el shard Engram (no re-alojado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | other / deepseek (terminos del modelo base; enlace a LICENSE en el repo oficial) |
| Formato de pesos | GGUF (5 shards de backbone + 1 shard Engram externo) |

## Arquitectura y entrenamiento

La model card indica que el modelo base es DeepSeek-V4.1-Flash-1017, con un backbone de 552B de parametros y un componente adicional denominado Engram de 196B, descrito como "memoria condicional" y materializado en el tensor `per_layer_token_embd`. La presencia de tensores `ffn_(up|down|gate)_exps.weight` en las instrucciones de ejecucion sugiere una arquitectura con capas de mezcla de expertos (MoE), aunque la model card no detalla el numero de expertos, los parametros activos ni la composicion del dataset de entrenamiento. No se documentan fases de RLHF, DPO ni datos de preentrenamiento.

La innovacion tecnica de esta publicacion no esta en el modelo, sino en el proceso de cuantizacion: un pipeline completo y reproducible (descarga, conversion, extraccion, cuantizacion, ensamblado y evaluacion) ejecutado en una sola maquina de 128 GB de RAM. El autor documenta una reproduccion independiente del layout oficial `UD-IQ1_S` de Unsloth y analiza por que la version oficial obtiene mejores metricas, atribuyendo la diferencia a la fuente de pesos (FP8 publicos frente a pesos internos de mayor precision) y no al layout ni a las herramientas. La ejecucion requiere una version de llama.cpp con soporte para DeepSeek-V4.1 (rama del PR #30817 o master posterior).

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base DeepSeek-V4.1-Flash-1017; la model card no detalla capacidades especificas.
- Codigo y matematicas: no documentadas de forma explicita en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible. El componente Engram (memoria condicional) es una caracteristica estructural del modelo base, pero su funcionamiento no se describe en la model card.
- Ejecucion en hardware de consumo: capacidad destacada de esta cuantizacion, que permite correr el backbone completo en una APU de 128 GB de memoria unificada.

## Casos de uso

- Inferencia local de gran escala en hardware de consumo: el caso principal. Permite ejecutar un modelo de escala frontera en una APU Strix Halo de 128 GB, sin GPU dedicada, manteniendo el backbone residente en RAM y el Engram en SSD con carga perezosa. Adecuado para laboratorios y desarrolladores que quieren experimentar con modelos grandes sin infraestructura de centro de datos.
- Investigacion sobre cuantizacion extrema: el repositorio incluye el pipeline completo y mediciones de KLD y PPL frente a una referencia Q8, lo que lo convierte en un banco de pruebas para estudiar el impacto de la cuantizacion a 1,68 bpw en modelos de gran escala.
- Reproduccion y auditoria de cuantizaciones: el "build passport" documenta cada paso, lo que permite reproducir el proceso y comparar con la cuantizacion oficial de Unsloth. Util para equipos que necesitan verificar la procedencia y calidad de pesos cuantizados.
- Prototipado de asistentes conversacionales con contexto largo: con 32k tokens de contexto en la configuracion de ejemplo, sirve para probar conversaciones multi-turno y documentos largos en local, aceptando la latencia de 5-6 tok/s.
- Evaluacion comparativa de layouts de cuantizacion: la metrica de acuerdo top-1 (75,3% frente a la oficial) permite estudiar diferencias entre layouts IQ1_S independientes y oficiales sobre el mismo modelo base.
- Docencia y formacion en tecnicas de cuantizacion: el pipeline scriptado y las metricas publicadas sirven como material didactico para explicar bpw, KLD, PPL ratio y control self-vs-self en un caso real.

## Benchmarks y rendimiento

Metricas de calidad publicadas por el autor (wiki1100, frente a referencia Q8_K_XL):

| Metrica | Este build (DIY IQ1_S v3bu) | Oficial UD-IQ1_S (misma pipeline) |
|---|---|---|
| KLD media | 0,612 | 0,414 |
| KLD mediana | 0,265 | 0,155 |
| Ratio de PPL vs referencia | 1,485 | 1,156 |
| Acuerdo top-1 (modelo vs modelo) | 75,3% | 77,1% |
| Control self-vs-self | 0,000 | 0,000 |

Rendimiento de inferencia medido en Ryzen AI Max+ 395 (Strix Halo, 128 GB): aproximadamente 1 minuto de carga del modelo y 5-6 tok/s de generacion con contexto de 32k. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 121,8 GB para el backbone en 5 shards, mas 110,6 GB para el shard Engram (IQ4_NL) que se mantiene en SSD con carga perezosa. En total, el conjunto completo ronda los 232 GB de almacenamiento.
- Hardware de referencia: AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada, Ubuntu. Es el unico hardware validado en la model card.
- GPU dedicadas: no se documenta soporte ni rendimiento en A100, H100 o RTX 4090. El tamano del backbone hace inviable su residencia completa en GPUs de consumo (24 GB o menos).
- Opciones de despliegue: llama.cpp (llama-server) con soporte para DeepSeek-V4.1 (rama del PR #30817 o master posterior). No se mencionan vLLM, TGI ni Ollama.
- Flags imprescindibles en APU de 128 GB: `--override-tensor 'per_layer_token_embd.weight=CPU'` para mantener el Engram fuera del asignador de GPU y `--override-tensor 'blk\.([0-9]+)\.ffn_(up|down|gate)_exps\.weight=CPU'` para mantener los expertos MoE en CPU. Tambien `--load-mode mmap --lazy-mode on`.
- Latencia y throughput: aproximadamente 5-6 tok/s de generacion y alrededor de 1 minuto de carga en el hardware de referencia.
- Muestreo recomendado: `--temp 1.0 --top-p 1.0 --top-k 0 --min-p 0.0`; temperaturas mas bajas pueden degradar en bucles de repeticion, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KLD media vs Q8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 DIY IQ1_S v3bu (este) | 552B + 196B Engram | 32k en config. de ejemplo | 0,612 | other / deepseek | GGUF, 5 shards + Engram externo |
| DeepSeek-V4.1-Flash-1017 UD-IQ1_S (Unsloth) | 552B + 196B Engram | no disponible | 0,414 | other / deepseek | GGUF (incluye shard Engram) |
| DeepSeek-V4.1-Flash-1017 (base, FP8) | 552B + 196B Engram | no disponible | referencia (Q8_K_XL) | other / deepseek | Pesos oficiales en HF |

La comparativa se limita al mismo modelo base en distintos formatos, ya que la informacion disponible no incluye datos de modelos alternativos de la misma categoria. La cuantizacion oficial de Unsloth obtiene mejor KLD y PPL que este build, atribuido por el autor a la fuente de pesos.

## Limitaciones y advertencias

- Perdida de calidad medible: KLD media de 0,612 y ratio de PPL de 1,485 frente a la referencia Q8, peores que la cuantizacion oficial (0,414 y 1,156). A 1,68 bpw la degradacion es sustancial y puede afectar tareas de razonamiento fino.
- Sensibilidad al muestreo: el autor advierte que temperaturas bajas pueden provocar bucles de repeticion; se recomienda temperatura 1.0 y top-p 1.0.
- Dependencia de un shard externo: el repositorio no incluye el shard Engram; hay que descargarlo de Unsloth y remarcarlo como shard 6, lo que anade un paso manual y un punto de fallo.
- Requisito de version especifica de llama.cpp: necesita una build con soporte para DeepSeek-V4.1 (PR #30817 o master posterior); no funciona con versiones estables antiguas.
- Hardware muy especifico: validado unicamente en Ryzen AI Max+ 395 con 128 GB de memoria unificada; el rendimiento en otras configuraciones no esta documentado.
- Licencia: se distribuye bajo los terminos del modelo base DeepSeek (licencia "other" con nombre "deepseek"). Es responsabilidad del usuario revisar las restricciones de uso comercial del modelo base antes de desplegarlo en produccion.
- Idiomas, sesgos y riesgo de alucinacion: no documentados en la informacion disponible; deben evaluarse contra el modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/naualex2023/DeepSeek-V4.1-Flash-1017-DIY-v3bu
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/main/LICENSE
- Cuantizacion oficial de Unsloth (shard Engram): https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Build passport del autor: PASSPORT.md (referenciado en la model card del repositorio)
- PR de llama.cpp con soporte DeepSeek-V4.1: PR #30817 (referenciado en la model card)
