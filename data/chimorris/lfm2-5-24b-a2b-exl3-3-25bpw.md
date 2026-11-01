# chimorris/LFM2.5-24B-A2B-exl3-3.25bpw

## Resumen

LFM2.5-24B-A2B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Liquid AI, con 24.000 millones de parametros totales y aproximadamente 2.400 millones de parametros activos por token. Esta ficha describe la cuantizacion EXL3 de 3,25 bits por peso publicada por el usuario chimorris, pensada para ejecutar el modelo completo en una unica GPU de 12 GB con una ventana de contexto de 128K tokens. El repositorio incluye los pesos cuantizados en formato safetensors para ExLlamaV3, no los pesos originales en BF16.

La relevancia de esta publicacion es practica: demuestra que un MoE de 24B puede desplegarse en hardware de consumo (una RTX 3060 de 12 GB) manteniendo una calidad cercana al modelo de referencia. El autor reporta una perplejidad de 11,2959 frente a 11,2459 del BF16 (un incremento del 0,44%) y una puntuacion de 82/100 en tool-eval-bench en modo hard, identica a la del modelo sin cuantizar. El contexto nativo se mantiene en 131.072 tokens, con solo 10 de las 40 capas conservando cache KV.

El modelo base es conversacional y siempre opera en modo de razonamiento, generando contenido dentro de etiquetas `<think>...</think>`. Soporta tool calling con un formato Pythonico delimitado por `<|tool_call_start|>` y `<|tool_call_end|>`. La licencia es la LFM Open License v1.0, que restringe el uso comercial a entidades con ingresos anuales inferiores a 10 millones de dolares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (lfm2_moe) con 40 capas: 2 densas y 38 MoE |
| Parametros totales | 24B (modelo base); 5.294.739.072 en los tensores del repo cuantizado |
| Parametros activos | ~2,4B por token |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | EXL3 3,25 bpw promedio: 2 capas densas a 4,2 bpw, 18 capas MoE a ~3,55 bpw, 20 capas MoE a ~3,07 bpw, lm_head a 8,0 bits, embeddings sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial restringido por ingresos |
| Formato de pesos | safetensors (EXL3, libreria exllamav3) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer con mezcla de expertos: 40 capas en total, de las cuales 2 son densas y 38 son capas MoE. Con 24B parametros totales y ~2,4B activos, el coste computacional por token se aproxima al de un modelo denso de 2-3B, lo que explica el throughput medido. Solo 10 de las 40 capas mantienen cache KV, lo que reduce drasticamente el consumo de memoria asociado al contexto largo y permite sostener 128K tokens en 12 GB de VRAM.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La model card de esta cuantizacion tampoco detalla innovaciones de atencion (lineal, especulativa u otras) mas alla de la propia arquitectura MoE. La cuantizacion se genero con exllamav3 1.6.1 mediante `convert.py -b 3.25 -hq -hb 8`, usando el corpus de calibracion incluido en exllamav3; el autor probo ademas una calibracion con traza autogenerada y obtuvo peores resultados (perplejidad 11,3239 frente a 11,2959). La variante `-hq` asigna mas bits a las capas de atencion y compartidas, y `-hb 8` fija el lm_head a 8 bits.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat incluida.
- Modo de razonamiento siempre activo: el modelo emite `<think>...</think>` y el contenido se expone como `reasoning_content` en TabbyAPI.
- Tool calling / function calling con formato Pythonico delimitado por `<|tool_call_start|>` y `<|tool_call_end|>`, configurable con `tool_format: lfm2`.
- Razonamiento multi-paso y uso en flujos agenticos: la evaluacion tool-eval-bench en modo hard (97 escenarios) alcanza 82/100, tanto en ejecucion secuencial como con 4 escenarios concurrentes.
- Recuperacion de informacion en contexto largo: needle-in-a-haystack al 100% (20/20) hasta 64K tokens.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente conversacional en hardware de consumo: con 11,0 GB tras carga y warmup en una RTX 3060 de 12 GB, el modelo puede servir un chatbot multi-turno con 128K de contexto en una estacion de trabajo domestica, sin GPU de datacenter.
- Agentes con tool calling en produccion: el formato Pythonico de llamadas a herramientas y la puntuacion de 82/100 en tool-eval-bench permiten integrarlo en orquestadores de agentes que ejecuten funciones externas (APIs, bases de datos, shell) con validacion estructurada de argumentos.
- Procesamiento de documentos largos: la ventana de 131.072 tokens y el 100% en needle-in-a-haystack hasta 64K lo hacen adecuado para resumir contratos, analizar expedientes o extraer datos de informes extensos en una sola pasada.
- Servicio concurrente de bajo coste: con 4 peticiones simultaneas de ~1K tokens se miden ~108 tok/s agregados (~30 por peticion) y con 8 peticiones compartiendo el pool de 128K, ~137 tok/s, lo que permite atender pequenos equipos con una sola GPU.
- Generacion de codigo asistida con razonamiento: el modo `<think>` explicito facilita la depuracion de la cadena de razonamiento en tareas de programacion, y el tool calling permite invocar interpretes o linters durante la generacion.
- Despliegue en entornos con restricciones de memoria: al ocupar 10,59 GB en disco y caber en 12 GB de VRAM, es viable en portatiles con GPU consumer o en nodos edge donde no se puede alojar un 24B en BF16 (~48 GB).
- Evaluacion e investigacion de cuantizacion: el repositorio publica metricas de KLD y perplejidad frente al BF16, util como referencia para estudiar el impacto de EXL3 a 3,25 bpw en arquitecturas MoE.

## Benchmarks y rendimiento

Calidad frente al modelo BF16 (qbench de exllamav3, 40 x 2048 tokens de wikitext-2 con plantilla de chat aplicada de forma laxa):

| Modelo | Perplejidad | KLD media | KLD mediana | KLD p90 |
|---|---|---|---|---|
| BF16 (referencia) | 11,2459 | – | – | – |
| BF16 + ruido de redondeo (suelo de ruido) | 11,2530 | 0,0080 | 0,0024 | 0,0184 |
| Esta cuantizacion (3,25 bpw) | 11,2959 (+0,44%) | 0,0918 | 0,0464 | 0,2071 |
| 6,0 bpw `-hq` (no publicado, referencia de escala) | 11,2469 | 0,0162 | 0,0066 | 0,0369 |
| 3,25 bpw con calibracion por traza autogenerada (no publicado) | 11,3239 | 0,0998 | 0,0510 | 0,2278 |

En tokens donde el BF16 es confiado (probabilidad del top token >= 95%, el 19% de los tokens), la KLD mediana de la cuantizacion es 0,0014, en el suelo de ruido. La divergencia se concentra en tokens donde el propio BF16 muestra incertidumbre. El autor advierte que wikitext esta fuera del dominio del modelo y que los valores absolutos de KLD son altos; deben usarse para comparar cuantizaciones de este mismo modelo.

Rendimiento agentico y de contexto:

| Prueba | Resultado |
|---|---|
| tool-eval-bench hard (97 escenarios) | 82/100 |
| tool-eval-bench hard con 4 escenarios concurrentes | 82/100 |
| 6,0 bpw de referencia (misma prueba) | 76/100 |
| 3,25 bpw con calibracion por traza | 80/100 |
| Needle in a haystack hasta 64K | 100% (20/20) |

El autor senala que a este nivel las ejecuciones individuales varian en torno a +/-5 puntos, por lo que la cuantizacion no supone una perdida medible de calidad agentica.

Rendimiento medido en TabbyAPI sobre RTX 3060 (12 GB), contexto 128K con cache KV 8,4 (K a 8 bits, V a 4 bits):

| Configuracion | Resultado |
|---|---|
| Memoria tras carga y warmup, 4 peticiones | 11,0 GB; pico de 11,4 GB |
| Decodificacion, una peticion | ~58-60 tok/s (apenas cae con el contexto) |
| Prefill | ~1.600-2.100 tok/s entre 1K y 64K |
| 4 peticiones concurrentes (~1K prompts) | ~108 tok/s totales, ~30 por peticion |
| 8 peticiones compartiendo el pool de 128K | ~137 tok/s totales; las peticiones excedentes esperan sin OOM |

## Requisitos de hardware

- VRAM estimada: 11,0 GB tras carga y warmup con 128K de contexto y cache KV 8,4; pico de 11,4 GB. El repo pesa 10,59 GB en disco.
- GPU recomendadas: RTX 3060 de 12 GB (medida por el autor); cualquier GPU con al menos 12 GB de VRAM. Para el modelo base en BF16 se requeririan ~48 GB, es decir, A100 80 GB, H100 o multiples GPU.
- GPU consumer compatibles: si, en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, entre otras). En GPUs de 8 GB no cabe con contexto completo.
- Opciones de despliegue: ExLlamaV3 >= 1.6.1; se requiere >= 1.6.2 para cache KV cuantizada, porque la 1.6.1 tiene un bug de decodificacion con cache cuantizada en esta arquitectura. El autor documenta TabbyAPI con backend exllamav3. No es compatible con llama.cpp, Ollama ni vLLM, que no cargan pesos EXL3.
- Parametros de muestreo recomendados por LiquidAI: temperatura 0,1, top_k 50, repetition penalty 1,05.
- Latencia y throughput: decodificacion de ~58-60 tok/s con una peticion y ~17 ms por token; prefill de ~1.600-2.100 tok/s; throughput agregado de ~108 tok/s con 4 peticiones y ~137 tok/s con 8.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B EXL3 3,25 bpw (esta ficha) | 24B | ~2,4B | 128K | EXL3 3,25 bpw, 10,59 GB | LFM Open License v1.0 | ExLlamaV3 / TabbyAPI, 12 GB VRAM |
| LFM2.5-24B-A2B (BF16, original) | 24B | ~2,4B | 128K | BF16, ~48 GB | LFM Open License v1.0 | Multiples GPU o A100/H100 |
| LFM2.5-24B-A2B EXL3 6,0 bpw `-hq` (no publicado) | 24B | ~2,4B | 128K | EXL3 6,0 bpw | LFM Open License v1.0 | ExLlamaV3, requiere mas de 12 GB |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de modelos comparables de otros fabricantes (por ejemplo, MoE de tamano similar con licencia permisiva). La comparacion se limita, por tanto, a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada; no se documentan evaluaciones de sesgo ni de toxicidad.
- Riesgo de alucinacion: no cuantificado. El modelo opera siempre en modo de razonamiento y puede generar cadenas `<think>` plausibles pero incorrectas; se recomienda validacion externa en flujos de produccion.
- Perdida por cuantizacion: la perplejidad sube un 0,44% frente al BF16 y la KLD media es 0,0918, con p90 de 0,2071. La degradacion se concentra en tokens de baja confianza del modelo original; en tareas de alta certeza la KLD mediana (0,0014) esta en el suelo de ruido.
- Dependencia de version: con exllamav3 1.6.1 y cache KV cuantizada existe un bug de decodificacion en esta arquitectura; es obligatorio usar >= 1.6.2 para `cache_mode: 8,4`.
- Compatibilidad limitada: los pesos EXL3 solo se cargan en ExLlamaV3 y TabbyAPI; no sirven para llama.cpp, Ollama, vLLM ni TGI. Migrar a otro runtime exige recuantizar desde el modelo base.
- Contexto y memoria: el contexto de 128K solo es viable con cache KV cuantizada y en GPUs de 12 GB o mas; con cache en BF16 el consumo se dispara. Las peticiones que exceden el pool compartido esperan en cola.
- Licencia: LFM Open License v1.0. La seccion 5 no autoriza el uso comercial a entidades con ingresos anuales de 10 millones de dolares o superiores. El repositorio contiene pesos modificados (cuantizados); el tokenizer, la plantilla de chat y la configuracion se copian del origen, con `config.json` ampliado con los ajustes de cuantizacion de exllamav3.
- Idiomas: no se especifica la cobertura linguistica; no se garantiza un rendimiento uniforme fuera del ingles.
- Madurez: el repositorio tiene 64 descargas y 0 likes en el momento de la consulta; es una cuantizacion de terceros, no una publicacion oficial de Liquid AI.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/chimorris/LFM2.5-24B-A2B-exl3-3.25bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- ExLlamaV3 (repositorio): https://github.com/turboderp-org/exllamav3
- Liquid AI en HuggingFace: https://huggingface.co/LiquidAI
- Perfil de turboderp en GitHub: https://github.com/turboderp-org
- Licencia LFM Open License v1.0: archivo `LICENSE` incluido en el repositorio de la cuantizacion
