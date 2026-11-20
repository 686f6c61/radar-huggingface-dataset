# banyaaiofficial/laguna-xs-2.1-banya-ko-r4-lora

## Resumen

Laguna XS 2.1 Banya ko r4 es un adaptador LoRA entrenado por Banya sobre el modelo base poolside/Laguna-XS-2.1, un transformer de tipo mixture-of-experts (MoE) con 33.000 millones de parametros totales y 3.000 millones activos por token. El objetivo del ajuste es doble: reforzar las capacidades de agente de terminal y el seguimiento de instrucciones en coreano, manteniendo intacta la competencia de agente de codigo multilingue del modelo base. Este repositorio corresponde al checkpoint final (paso 925) de la cuarta ronda de entrenamiento.

El adaptador se distribuye como pesos PEFT en safetensors (0,1 GB) y requiere cargar el modelo base para su uso. En la evaluacion SWE-bench Multilingual (300 tareas, un unico intento) obtiene un 64,3 % (193/300), practicamente identico al 63,42 % ± 1,37 % reportado oficialmente para el base en INT4, lo que sugiere que el ajuste en coreano y trayectorias de terminal no degrada el rendimiento de agente de codigo.

Es relevante para equipos que necesiten un agente de terminal con soporte nativo de coreano sobre una arquitectura MoE eficiente en inferencia, con licencia OpenMDW-1.1 y despliegue viable en vLLM con soporte de LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base Laguna XS 2.1); adaptador LoRA (PEFT) |
| Parametros totales | 33 000 millones (modelo base); adaptador de 0,1 GB |
| Parametros activos | 3000 millones por token (modelo base, MoE) |
| Longitud de contexto | 262 144 tokens (configuracion de evaluacion) |
| Tipos de cuantizacion | INT4 (usado en la evaluacion); BF16 (modelo base oficial); el adaptador se aplica sobre cualquiera de ellos |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | OpenMDW-1.1 (hereda las condiciones del modelo base) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Laguna XS 2.1, un transformer MoE con 33.000 millones de parametros totales y 3.000 millones activos por token, disenado por poolside para tareas de agente de codigo. El LoRA ajusta el modelo sin modificar sus pesos originales, de modo que la arquitectura subyacente, el tokenizador y la ventana de contexto de 262.144 tokens se conservan intactos. La evaluacion se realizo con vLLM 0.32.0 en tensor parallel 2, cuantizacion INT4 y modo thinking activado (temperature 1.0, top_k 20, top_p 1.0).

El conjunto de entrenamiento consta de 14.800 filas: 10.000 trayectorias de agente de terminal seleccionadas de Nemotron-Terminal (CC-BY-4.0) y OpenThoughts-Agent SFT (Apache-2.0, profesor GLM-4.7), filtradas a 32.768 tokens o menos, eliminando trayectorias repetitivas o de polling y deduplicando contra Terminal-Bench 2.0; 300 ejemplos de instrucciones de agente en coreano repetidos 4 veces, redactados por Banya con asistencia de IA; y 3.600 filas de replay en formato KLUE (STS, MRC, YNAT, NLI) para preservar habilidades previas, con respuestas del modelo base verificadas como correctas. Las particiones de evaluacion (KLUE dev, SWE-bench Multilingual, Terminal-Bench 2.0) se excluyeron del entrenamiento.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable.
- Agente de codigo multilingue: resolucion de issues en PHP, C, Rust, C++, Java, JavaScript/TypeScript, Ruby y Go.
- Agente de terminal: ejecucion de comandos, interpretacion de salida y trayectorias multi-paso.
- Seguimiento de instrucciones en coreano, reforzado especificamente mediante el ajuste.
- Soporte de tool calling y function calling a traves del parser `poolside_v1` en vLLM (`--tool-call-parser poolside_v1`, `--reasoning-parser poolside_v1`, `--enable-auto-tool-choice`).
- Capacidades multilingues limitadas a coreano e ingles segun la model card.
- Integracion con el arnes de agentes pool v1.0.16 sobre Harbor 0.25.0.

## Casos de uso

- Agente de terminal en produccion: el adaptador esta entrenado sobre trayectorias reales de terminal (10.000 filas de Nemotron-Terminal y OpenThoughts-Agent), lo que lo hace adecuado para automatizar tareas de shell, diagnostico de sistemas y ejecucion de scripts en entornos aislados.
- Resolucion automatica de issues en repositorios multilingues: con un 64,3 % en SWE-bench Multilingual, puede integrarse en pipelines de CI/CD para proponer parches en PHP, Rust, Java, C/C++ o TypeScript, siempre con revision humana.
- Asistencia a desarrolladores coreanos: el ajuste especifico en coreano permite interacciones tecnicas en ese idioma manteniendo el rendimiento de codigo del base, util para equipos con documentacion o comunicacion en coreano.
- Automatizacion de tareas DevOps: la ventana de 262.144 tokens permite procesar logs extensos, ficheros de configuracion y salidas de comandos largas dentro de una sola sesion de agente.
- Servicio multi-tenant con vLLM: al ser un LoRA, puede servirse junto al modelo base con `--enable-lora --max-lora-rank 16`, permitiendo alternar entre el base y el adaptador sin duplicar pesos en memoria.
- Evaluacion y experimentacion en investigacion de agentes: el checkpoint intermedio y la reproducibilidad del arnes (pool + Harbor, `swebench_multilingual@1.0`) lo hacen util para estudiar el efecto del ajuste en idiomas distintos del ingles.

## Benchmarks y rendimiento

| Modelo | SWE-bench Multilingual | Condiciones |
|---|---|---|
| Laguna XS 2.1 INT4 + Banya 4.a LoRA | 64,3 % (193/300) | 1 intento, limite de 50 min por tarea |
| Laguna XS 2.1 INT4 (oficial) | 63,42 % ± 1,37 % | Media de 4 intentos, hasta 500 pasos |
| Laguna XS 2.1 BF16 (oficial) | 63,17 % ± 1,42 % | Media de 4 intentos |
| Laguna XS.2 (oficial) | 57,7 % | No disponible |

Desglose por lenguaje del adaptador (1 intento):

| Lenguaje | Pass rate |
|---|---|
| PHP | 33/43 (77 %) |
| C | 21/30 (70 %) |
| Rust | 30/43 (70 %) |
| C++ | 8/12 (67 %) |
| Java | 28/43 (65 %) |
| JavaScript/TypeScript | 26/43 (60 %) |
| Ruby | 26/44 (59 %) |
| Go | 21/42 (50 %) |
| Total | 193/300 (64,3 %) |

El error estandar del resultado con un solo intento se estima en ±2,8 puntos porcentuales, por lo que la comparacion con el base debe interpretarse como equivalencia, no como mejora.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene 33.000 millones de parametros; en INT4 requiere aproximadamente 17-20 GB solo para pesos, mas cache KV. Con contexto de 262.144 tokens la cache KV crece de forma significativa y exige GPUs de alta capacidad.
- GPU recomendadas: la evaluacion se ejecuto en configuracion TP2 con vLLM, lo que implica al menos dos GPUs de datacenter (A100 80 GB o H100). Para contexto reducido, una unica A100 80 GB o H100 puede ser suficiente en INT4.
- GPU de consumo: no cabe en RTX 4090 (24 GB) con contexto largo; con cuantizacion agresiva y contexto muy reducido podria ser marginal, pero no esta documentado.
- Despliegue: vLLM 0.32.0 con `--enable-lora --max-lora-rank 16`; tambien es posible cargarlo con transformers + PEFT (`PeftModel.from_pretrained`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Multilingual | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laguna XS 2.1 + Banya ko r4 (este) | 33B totales / 3B activos | 262.144 | 64,3 % (1 intento) | OpenMDW-1.1 | Hugging Face (PEFT) |
| Laguna XS 2.1 (base) | 33B totales / 3B activos | 262.144 | 63,42 % INT4 / 63,17 % BF16 (4 intentos) | OpenMDW-1.1 | Hugging Face |
| Laguna XS.2 | no disponible | no disponible | 57,7 % | no disponible | Hugging Face |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio de la cuarta ronda de entrenamiento, no un modelo final consolidado.
- El resultado de SWE-bench Multilingual proviene de un unico intento (±2,8 pp de error estandar), frente a las 4 medias oficiales; no puede afirmarse que supere al base.
- El soporte linguistico declarado se limita a coreano e ingles; el rendimiento en castellano no esta evaluado.
- Licencia OpenMDW-1.1 con condiciones heredadas del modelo base poolside/Laguna-XS-2.1; es necesario revisar ambas antes de uso comercial.
- Al ser un agente que ejecuta codigo y comandos, debe desplegarse exclusivamente en entornos aislados (sandbox); la model card lo advierte de forma explicita.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- El uso requiere cargar el modelo base completo; el adaptador por si solo no es funcional.
- La ventana de 262.144 tokens implica un coste elevado de memoria KV en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/banyaaiofficial/laguna-xs-2.1-banya-ko-r4-lora
- Modelo base: https://huggingface.co/poolside/Laguna-XS-2.1
- Arnes de agentes pool: https://github.com/poolsideai/pool
- Framework Harbor: https://github.com/harbor-framework/harbor
- Nemotron-Terminal: https://huggingface.co/collections/nvidia/nemotron-terminal
- OpenThoughts-Agent: https://huggingface.co/open-thoughts
- KLUE (repositorio): https://github.com/KLUE-benchmark/KLUE
- KLUE (dataset): https://huggingface.co/datasets/klue/klue
- Banya: https://banya.ai
