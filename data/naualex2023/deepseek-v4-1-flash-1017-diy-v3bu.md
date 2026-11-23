# naualex2023/DeepSeek-V4.1-Flash-1017-DIY-v3bu

## Resumen

DeepSeek-V4.1-Flash-1017-DIY-v3bu es una cuantizacion GGUF dinamica de tipo IQ1_S dominante (aproximadamente 1,77 bits por peso) del modelo DeepSeek-V4.1-Flash-1017, desarrollado por el usuario independiente naualex2023. El modelo base, obra de DeepSeek, es un transformer de tipo Mixture of Experts (MoE) con un backbone de 552.000 millones de parametros y una tabla de memoria condicional denominada Engram de 196.000 millones de parametros. Esta version cuantizada reduce el backbone a 121,8 GB repartidos en cinco shards, con el objetivo declarado de ejecutarse de forma totalmente residente en una maquina con 128 GB de RAM unificada (AMD Ryzen AI Max+ 395, plataforma Strix Halo).

La relevancia de esta ficha no reside en el modelo original, sino en el ejercicio de reproducibilidad que documenta: todo el pipeline (descarga, conversion, extraccion, cuantizacion, ensamblaje y evaluacion) esta publicado y es reproducible, y la calidad se mide con divergencia KL frente a una referencia Q8. Es un caso practico de cuantizacion agresiva a 1 bit para hardware de consumo con memoria unificada, un nicho creciente entre desarrolladores que quieren ejecutar modelos de gran escala sin GPU dedicada.

La release actual es la v5, que sustituyo in situ a la v3bu manteniendo tamano y nombres de fichero. El modelo base es propietario bajo licencia DeepSeek, y esta derivacion se distribuye bajo los mismos terminos. La informacion disponible sobre arquitectura interna, datos de entrenamiento o benchmarks del modelo original es muy limitada en la documentacion proporcionada, por lo que muchos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con backbone de 552B y tabla Engram de 196B (segun model card del cuantizador) |
| Parametros totales | 552B backbone + 196B Engram (748B en total, segun model card) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (configuracion de ejemplo del autor, `-c 32768`) |
| Tipos de cuantizacion | IQ1_S dominante (~1,77 bpw), con capas sensibles en IQ2_XXS, ruta activa en Q5_K-Q8_0/F32, Engram en IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | DeepSeek (other, license_name: deepseek) |
| Formato de pesos | GGUF (5 shards del backbone + shard 6 Engram externo) |
| Tamano del repo | 243,6 GB |
| Tamano del backbone cuantizado | 121,8 GB en 5 shards |
| Tamano del shard Engram | 110,6 GB (IQ4_NL, no re-hosteado) |
| Descargas | 546 |
| Fecha de creacion | 2026-11-11 |
| Ultima actualizacion | 2026-11-15 |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es, segun la model card del cuantizador, un transformer de tipo Mixture of Experts con un backbone de 552.000 millones de parametros y una estructura de memoria condicional llamada Engram de 196.000 millones de parametros adicionales, materializada en el tensor `per_layer_token_embd`. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

La aportacion tecnica de esta ficha es el proceso de cuantizacion. Se trata de una cuantizacion dinamica por tensor: los expertos enrutados usan mayoritariamente IQ1_S (88 tensores) con las capas de expertos mas sensibles en IQ2_XXS (32 tensores), mientras que la ruta activa (atencion, expertos compartidos y routers) se mantiene en Q5_K-Q8_0/F32 para preservar calidad. La tabla Engram se mantiene como un shard separado IQ4_NL de carga perezosa desde SSD. El autor genero su propia imatrix con estadisticas por experto (3D) sobre el original en FP8, con 2000 chunks, y documenta que ampliar de 400 a 2000 chunks solo mejora la KLD en 0,004, lo que indica saturacion del volumen de calibracion.

## Capacidades

- Generacion de texto y razonamiento: al ser una cuantizacion del modelo base, hereda sus capacidades de generacion y razonamiento, aunque degradadas por la cuantizacion a 1 bit.
- Codigo y matematicas: no hay datos especificos en la informacion disponible sobre el rendimiento en estas tareas tras la cuantizacion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el modelo base no declara idiomas en la informacion proporcionada.
- Memoria condicional Engram: el modelo incorpora una tabla de memoria condicional de 196B parametros que se carga de forma perezosa desde SSD, una capacidad arquitectonica distintiva del modelo base.
- Modo thinking: no disponible en la informacion proporcionada.
- Vision y audio: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en APU de memoria unificada: el caso de uso central de esta ficha es ejecutar un modelo de escala 552B en una maquina de 128 GB de RAM unificada (Ryzen AI Max+ 395), con el backbone residente en RAM y el Engram en streaming desde SSD. Es adecuado porque el diseno de shards y los flags `--override-tensor` estan pensados exactamente para ese perfil de hardware.
- Experimentacion con cuantizacion extrema a 1 bit: investigadores que quieran estudiar el impacto de IQ1_S en un MoE de gran escala pueden reproducir el pipeline completo, ya que el autor publica scripts, imatrix y evaluacion KLD.
- Evaluacion de calidad de cuantizaciones: el repositorio incluye metricas de KLD, PPL ratio y top-1 agreement frente a la release oficial y frente a una referencia Q8, lo que permite comparar metodos de cuantizacion de forma objetiva.
- Prototipado offline sin GPU dedicada: para desarrolladores que necesiten un entorno local de pruebas de generacion de texto de gran escala sin acceso a A100/H100, esta build ofrece una via realista aunque lenta (~5-6 tok/s).
- Reproduccion de pipelines de cuantizacion: el "build passport" documenta cada paso, lo que sirve como material de referencia para quien quiera cuantizar otros modelos con llama.cpp en hardware similar.
- Benchmarking de hardware Strix Halo: permite medir latencia, throughput y consumo de memoria de un modelo grande en una APU, con cifras concretas publicadas por el autor (~1 min de carga, 5-6 tok/s, 32k de contexto).

## Benchmarks y rendimiento

La model card proporciona metricas de calidad de la cuantizacion (KLD frente a referencia Q8_K_XL sobre wiki1100), no benchmarks de tareas estandar como MMLU o HumanEval.

| Metrica (wiki1100, vs Q8_K_XL) | v3bu (inicial) | v3bi (interino) | v5 (actual) | Oficial UD-IQ1_S |
|---|---|---|---|---|
| KLD media / mediana | 0,612 / 0,265 | 0,597 / 0,245 | 0,594 / 0,242 | 0,414 / 0,155 |
| PPL ratio vs referencia | 1,485 | 1,479 | 1,486 | 1,156 |
| Top-1 agreement con oficial | no disponible | no disponible | 75,3% | 77,1% |
| Control self vs self | 0,000 | 0,000 | 0,000 | 0,000 |

Rendimiento en hardware del autor (Ryzen AI Max+ 395):

| Metrica | Valor |
|---|---|
| Tiempo de carga del modelo | ~1 minuto |
| Throughput de generacion | ~5-6 tok/s |
| Contexto configurado | 32.768 tokens |
| Backbone residente en RAM | Si (121,8 GB) |
| Engram | Streaming perezoso desde SSD (110,6 GB) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el backbone cuantizado ocupa 121,8 GB y el shard Engram 110,6 GB. En una APU con memoria unificada de 128 GB, el backbone cabe residente y el Engram se sirve desde SSD en modo lazy.
- GPU recomendadas: el autor valida la ejecucion en AMD Ryzen AI Max+ 395 (Strix Halo, 128 GB de memoria unificada). No se documentan otras GPU en la informacion disponible.
- Cabe en GPU de consumo: no en GPU discretas convencionales por el tamano del backbone (121,8 GB); si en APUs con 128 GB de memoria unificada segun el autor.
- Opciones de despliegue: llama.cpp (`llama-server`) con soporte para DeepSeek-V4.1 (rama del PR #30817 o master posterior). El autor usa `--load-mode mmap --lazy-mode on` y dos flags `--override-tensor` para mantener el Engram y los expertos MoE fuera del asignador de GPU.
- Latencia y throughput: ~1 minuto de carga y ~5-6 tok/s de generacion en el hardware del autor, con contexto de 32k.
- Muestreo recomendado: `--temp 1.0 --top-p 1.0 --top-k 0 --min-p 0.0`; temperaturas mas bajas pueden provocar bucles de repeticion, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KLD media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-DIY-v3bu (esta ficha) | 552B backbone + 196B Engram | 32k (config. autor) | 0,594 | DeepSeek | GGUF, 5 shards + Engram externo |
| UD-IQ1_S oficial (unsloth) | 552B backbone + 196B Engram | no disponible | 0,414 | DeepSeek | GGUF, con shard Engram incluido |
| Referencia Q8_K_XL | 552B backbone + 196B Engram | no disponible | 0 (referencia) | DeepSeek | GGUF de alta precision |

La comparativa se limita a las variantes del mismo modelo base documentadas en la informacion proporcionada. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- Degradacion de calidad por cuantizacion extrema: la KLD media de 0,594 y el PPL ratio de 1,486 frente a la referencia Q8 indican una perdida de fidelidad notable; la release oficial UD-IQ1_S obtiene mejores cifras (0,414 y 1,156), y el autor atribuye la diferencia al origen de los pesos (FP8 publico frente a pesos internos de mayor precision), no al layout.
- Brecha con la release oficial: el top-1 agreement con la oficial es del 75,3%, lo que implica divergencias sustanciales en la distribucion de salida.
- Riesgo de bucles de repeticion: el autor advierte que temperaturas de muestreo bajas pueden degradar la generacion en builds de 1 bit; es necesario usar los parametros de muestreo indicados.
- Dependencia de un shard externo: el shard Engram (110,6 GB) no se re-hospeda y debe descargarse de unsloth y renombrarse manualmente; un error en este paso impide la ejecucion.
- Requisito de version especifica de llama.cpp: necesita soporte para DeepSeek-V4.1 (PR #30817 o master posterior), lo que limita la portabilidad a otras herramientas de inferencia.
- Licencia: se distribuye bajo la licencia DeepSeek del modelo base; es imprescindible revisar sus terminos para uso comercial, ya que la model card no detalla restricciones concretas.
- Idiomas y sesgos: no hay informacion disponible sobre idiomas soportados ni sesgos conocidos del modelo base o de esta cuantizacion.
- Alucinacion: no hay evaluacion especifica de alucinacion en la informacion disponible; la cuantizacion a 1 bit puede incrementar el riesgo respecto al modelo original.
- Hardware muy especifico: el rendimiento documentado (~5-6 tok/s) corresponde a una APU concreta; en otros equipos las cifras pueden diferir sustancialmente.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/naualex2023/DeepSeek-V4.1-Flash-1017-DIY-v3bu
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/main/LICENSE
- Cuantizacion oficial de referencia (unsloth): https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Build passport (documentacion del pipeline, referenciado en la model card): PASSPORT.md dentro del repositorio
- Rama de llama.cpp con soporte DeepSeek-V4.1: PR #30817 (referenciado en la model card)
