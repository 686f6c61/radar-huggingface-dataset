# mradermacher/gemma-3-1b-csw-best-i1-GGUF

## Resumen

`mradermacher/gemma-3-1b-csw-best-i1-GGUF` es una coleccion de cuantizaciones GGUF del modelo `BeardedMonster/gemma-3-1b-csw-best`, un fine-tune de Gemma 3 de 1.300 millones de parametros orientado a lenguas africanas, cambio de codigo (code-switching) y modismos. El trabajo de cuantizacion lo firma mradermacher, un autor conocido en Hugging Face por publicar versiones GGUF de modelos abiertos, en este caso con cuantizaciones ponderadas mediante fichero imatrix para preservar mejor la calidad en tamanos reducidos.

El modelo base parte de la familia Gemma 3 de Google, concretamente la variante de 1B, y ha sido ajustado para 22 idiomas africanos (yoruba, hausa, igbo, suajili, zulu, xhosa, afrikaans, amharico, somali, kinyarwanda, lingala, luganda, shona, chichewa, sesotho, setswana, malgache, wolof, ewe, twi, oromo y tigrinya). La propuesta resulta relevante porque cubre un nicho poco atendido por los modelos generalistas: conversacion multilingue con mezcla de lenguas y expresiones idiomaticas propias del continente africano.

Esta publicacion concreta no es un modelo nuevo, sino el empaquetado GGUF del fine-tune, lo que permite ejecutarlo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles. El repositorio ocupa 21,9 GB e incluye desde cuantizaciones IQ1 de 0,9 GB hasta Q6_K de 1,4 GB, ademas del fichero imatrix para generar cuantizaciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3), no disponible el detalle exacto de capas y atencion |
| Parametros totales | 1.301.875.840 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q3_K_S, IQ3_S, IQ3_XS, Q2_K, IQ3_M, IQ4_XS, IQ4_NL, Q4_0, Q3_K_M, Q3_K_L, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (variantes i1 con imatrix) |
| Idiomas soportados | yo, ha, ig, sw, zu, xh, af, am, so, rw, ln, lg, sn, ny, st, tn, mg, wo, ee, tw, om, ti |
| Licencia | other (heredada del modelo base; consultar terminos de Gemma) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Gemma 3 en su variante de 1B parametros, un transformer decoder-only de la familia publicada por Google. El fine-tune `BeardedMonster/gemma-3-1b-csw-best` se ha especializado en lenguas africanas y en fenomenos de code-switching e idiomatismos, segun los tags del repositorio. No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El trabajo de esta publicacion se limita a la cuantizacion: mradermacher genera las variantes i1 usando un fichero imatrix (importance matrix) calculado sobre el modelo, lo que mejora la fidelidad de las cuantizaciones de baja precision respecto a las estaticas. El autor tambien publica cuantizaciones estaticas en un repositorio paralelo. No se documentan innovaciones arquitectonicas adicionales ni tecnicas de decodificacion especulativa en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en 22 lenguas africanas, incluyendo yoruba, hausa, igbo, suajili, zulu y xhosa.
- Manejo de code-switching, es decir, alternancia entre lenguas dentro de un mismo turno de conversacion.
- Comprension y produccion de expresiones idiomaticas propias de las lenguas cubiertas.
- Capacidades generales heredadas de Gemma 3 1B: generacion de texto, respuesta a instrucciones y razonamiento basico.
- Capacidades multilingues limitadas al conjunto de idiomas declarado; el rendimiento en otras lenguas no esta documentado.
- Soporte de tool calling, agentes y modos de razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en mercados africanos: el modelo puede gestionar conversaciones en suajili, hausa o yoruba, y alternar entre lengua local e ingles dentro del mismo dialogo, algo habitual en soporte regional.
- Traduccion y adaptacion de contenidos: util para localizar material divulgativo o comercial a lenguas con poca cobertura en modelos generalistas, manteniendo modismos propios de cada comunidad.
- Moderacion y clasificacion de textos multilingues: su entrenamiento en code-switching permite procesar mensajes de redes sociales que mezclan lenguas, un escenario frecuente en foros y plataformas africanas.
- Asistentes educativos: puede apoyar la ensenanza en lenguas locales generando explicaciones y ejercicios adaptados, con despliegue en hardware modesto gracias a las cuantizaciones de 1 GB.
- Investigacion linguistica: sirve como modelo de referencia para estudiar el comportamiento de LLM pequenos en lenguas de bajos recursos y en fenomenos de alternancia de codigo.
- Prototipado en entornos con recursos limitados: las variantes IQ2 e IQ3 caben en equipos de gama baja o en CPU, lo que facilita pruebas rapidas sin infraestructura GPU dedicada.
- Generacion de dialogos sinteticos para aumentar datasets en lenguas africanas, aprovechando su especializacion idiomatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 0,9 GB (IQ1/IQ2) y 1,4 GB (Q6_K) para los pesos cuantizados; anadir overhead de contexto y KV cache segun la longitud de secuencia.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM para las variantes Q4 y superiores; RTX 3060, RTX 4060 o superiores ofrecen margen holgado. Para produccion con concurrencia, A100 o H100 no son necesarias dado el tamano, pero permiten mayor throughput.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, e incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier motor compatible con GGUF; vLLM y TGI requieren convertir a safetensors o usar el modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera inferencia muy rapida en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas foco | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-3-1b-csw-best (este) | 1,3 B | no disponible | 22 lenguas africanas | other | GGUF, safetensors |
| Gemma 3 1B (original) | 1,3 B | no disponible | multilingue general | Gemma terms | safetensors, GGUF |
| Qwen2.5-1.5B | 1,5 B | no disponible | multilingue general | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B | 1,2 B | no disponible | multilingue general | Llama license | safetensors, GGUF |

La comparativa se limita a parametros y licencia porque no hay datos de rendimiento publicados para el modelo especializado. Frente a los generalistas, la ventaja declarada es la cobertura especifica de lenguas africanas y code-switching; la desventaja es la ausencia de evaluaciones que cuantifiquen esa mejora.

## Limitaciones y advertencias

- No hay benchmarks publicados que permitan verificar la calidad real del fine-tune frente al Gemma 3 1B original.
- Al ser un modelo de 1,3 B parametros, su capacidad de razonamiento complejo y conocimiento factual es limitada en comparacion con modelos mayores.
- Riesgo de alucinacion elevado en lenguas de bajos recursos, donde los datos de entrenamiento suelen ser escasos.
- Sesgos potenciales derivados del dataset de ajuste, no documentado; puede reproducir estereotipos o variantes dialectales sobrerrepresentadas.
- La licencia "other" remite a los terminos de Gemma; es necesario revisar las condiciones de uso comercial antes de desplegarlo en produccion.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- No se documenta la longitud de contexto soportada en esta publicacion; conviene verificar el modelo base antes de usarlo con ventanas largas.
- El modelo esta pensado para conversacion; su uso en tareas de codigo o matematicas no esta validado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-3-1b-csw-best-i1-GGUF
- Modelo base: https://huggingface.co/BeardedMonster/gemma-3-1b-csw-best
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/gemma-3-1b-csw-best-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-3-1b-csw-best-i1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
