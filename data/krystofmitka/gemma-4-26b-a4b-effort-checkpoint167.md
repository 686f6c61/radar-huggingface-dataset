# krystofmitka/gemma-4-26B-A4B-effort-checkpoint167

## Resumen

ThinkingBomb es un ajuste fino (fine-tune) del modelo multimodal google/gemma-4-26B-A4B-it de Google DeepMind, publicado por el usuario krystofmitka. Su rasgo distintivo es el control de esfuerzo de razonamiento (effort control): un mismo conjunto de pesos en BF16 responde a cuatro niveles de esfuerzo predefinidos (25, 50, 75 y 100) que se seleccionan mediante una instruccion en el system prompt. El objetivo es permitir que el modelo gaste menos tokens de pensamiento en consultas sencillas y mas en tareas complejas, sin necesidad de cargar variantes distintas.

El modelo conserva la arquitectura del Gemma 4 26B A4B original, con aproximadamente 25.800 millones de parametros totales y una ventana de contexto que, segun los ejemplos de despliegue incluidos, alcanza los 262.144 tokens en vLLM. El ajuste se realizo mediante un calentamiento supervisado seguido de GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo.

Es relevante para desarrolladores que quieran reducir el coste de inferencia en modelos con modo de pensamiento: los benchmarks publicados por el autor muestran reducciones de tokens de razonamiento de entre el 30% y el 64% en tareas como MMLU-Pro, AIME 2026 o MMMLU, con caidas de precision moderadas en la mayoria de casos. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Gemma 4; detalles internos de MoE no disponibles en la informacion proporcionada |
| Parametros totales | 25.805.933.872 (aprox. 25,8 mil millones) |
| Parametros activos | no disponible (el nombre "A4B" sugiere un esquema de mezcla de expertos, pero no se confirma en la ficha) |
| Longitud de contexto | hasta 262.144 tokens (segun el ejemplo de vLLM con `--max-model-len 262144`) |
| Tipos de cuantizacion | no disponible (los pesos publicados son BF16; no se listan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (la model card no enumera idiomas; el modelo base es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B-it, un modelo multimodal de Google DeepMind que procesa texto e imagenes (pipeline image-text-to-text). La model card no detalla la arquitectura interna mas alla de la referencia al modelo base; el sufijo "A4B" del nombre original sugiere un diseno de mezcla de expertos con aproximadamente 4.000 millones de parametros activos, pero este dato no se confirma en la informacion disponible.

El ajuste fino consistio en un calentamiento supervisado (supervised warm-up) seguido de GRPO. El resultado es un unico conjunto de pesos que aprende cuatro preferencias de esfuerzo de razonamiento (25, 50, 75 y 100), expresadas mediante la primera linea del system prompt: `Reasoning Effort: N (range 1–100; higher values request more thorough reasoning)`. Segun el autor, estos valores expresan preferencias aprendidas y no limites duros de tokens. El repositorio incluye metadatos de procedencia (`checkpoint_metadata.json`) y un manifiesto con el SHA-256 de cada fragmento de pesos (`weights_manifest.json`). El entorno de evaluacion uso Transformers 5.20.2 y PyTorch 2.14.0.

## Capacidades

- Generacion de texto y razonamiento multimodal (texto e imagenes) con modo de pensamiento activable (`enable_thinking=True`).
- Control de esfuerzo de razonamiento en cuatro niveles entrenados (25, 50, 75, 100) mediante system prompt.
- Razonamiento matematico de competicion (evaluado en AIME 2026, HMMT febrero 2026 y HMMT noviembre 2025).
- Razonamiento cientifico de nivel experto (GPQA-Diamond) y conocimiento general (MMLU-Pro, MMMLU multilingue).
- Generacion de codigo (LiveCodeBench v6).
- Comprension de imagenes y escenas del mundo real (RealWorldQA).
- Seguimiento de instrucciones (IFBench) y manejo de contexto largo (LongBench v2, AA-LCR).
- Capacidades multilingues heredadas del modelo base (evaluadas en MMMLU), aunque no se enumeran idiomas concretos.
- Soporte de tool calling y agentes: no documentado explicitamente en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: con hasta 262.144 tokens de contexto, el modelo puede mantener conversaciones multi-turno con historiales extensos y documentacion de producto adjunta, ajustando el esfuerzo a 25 para consultas rutinarias y a 75 o 100 para reclamaciones complejas.
- Razonamiento matematico asistido: resolucion de problemas de competicion o analisis cuantitativo con esfuerzo 100; los benchmarks de AIME y HMMT muestran precision superior al 70% con ese perfil de pensamiento.
- Generacion y revision de codigo: integrable en pipelines de CI/CD mediante vLLM con la API compatible de chat completions; el esfuerzo 25 reduce los tokens de pensamiento un 38% en LiveCodeBench v6 con una caida de precision de menos de dos puntos.
- Analisis de documentos e imagenes: al ser image-text-to-text, puede procesar capturas, diagramas o formularios junto a texto largo, util para extraccion de datos o soporte tecnico visual.
- Procesamiento de contexto largo: analisis de contratos, informes o bases de codigo extensas gracias a la ventana de 262.144 tokens y a los resultados en LongBench v2 y AA-LCR.
- Evaluacion cientifica y QA experto: respuestas a preguntas de nivel posgrado en fisica, quimica o biologia (GPQA-Diamond) con effort ajustable segun la criticidad.
- Moderacion y clasificacion de contenido con restricciones estrictas de formato: IFBench evalua el seguimiento preciso de instrucciones, util para salidas estructuradas en produccion.

## Benchmarks y rendimiento

Resultados publicados por el autor para el ajuste con esfuerzo 25 frente al modelo base sin instruccion de esfuerzo. La cobertura de semillas es parcial (por ejemplo, 33 de 64 semillas completadas en AIME 2026 para el ajuste).

| Benchmark | Base (%) | Effort 25 (%) | Tokens de pensamiento base | Tokens effort 25 | Reduccion (%) |
|---|---:|---:|---:|---:|---:|
| AIME 2026 | 88,10 ± 3,01 | 84,55 ± 1,35 | 15.813 | 7.460 | 52,8 |
| HMMT febrero 2026 | 70,20 ± 4,68 | 72,27 ± 1,96 | 25.650 | 10.585 | 58,7 |
| HMMT noviembre 2025 | 83,33 ± 3,56 | 74,85 ± 1,98 | 17.883 | 7.810 | 56,3 |
| GPQA-Diamond | 80,59 ± 0,46 | 78,28 | 11.146 | 4.729 | 57,6 |
| RealWorldQA | 71,88 ± 0,70 | 72,29 | 2.086 | 1.251 | 40,0 |
| IFBench | 75,90 ± 1,11 | 76,00 | 6.515 | 4.569 | 29,9 |
| AA-LCR | 66,67 ± 5,17 | 63,00 | 5.598 | 3.713 | 33,7 |
| LongBench v2 | 60,23 ± 1,51 | 60,54 | 10.188 | 7.104 | 30,3 |
| LiveCodeBench v6 | 75,92 ± 1,51 | 74,29 | 12.944 | 7.970 | 38,4 |
| MMLU-Pro | 84,81 ± 0,20 | 84,51 | 4.923 | 2.982 | 39,4 |
| MMMLU | 84,94 ± 0,21 | 84,15 | 2.257 | 808 | 64,2 |

No se han publicado resultados para los niveles de esfuerzo 50, 75 y 100 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 52 GB solo para los pesos, mas memoria adicional para KV cache y activaciones; se recomienda un minimo de 80 GB para contexto largo.
- GPU recomendadas: NVIDIA B300 (usada en la evaluacion del autor), A100 80 GB, H100 80 GB; para contexto de 262.144 tokens se necesita memoria considerablemente mayor.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16; no se han publicado variantes cuantizadas (GGUF, AWQ, GPTQ) que permitan reducir requisitos.
- Opciones de despliegue: Transformers (version con soporte de Gemma 4, probado con 5.20.2) y vLLM con soporte de Gemma 4; el backend de evaluacion uso kernels Triton de atencion y MoE.
- Latencia y throughput: no disponibles en la informacion proporcionada; el coste de inferencia depende en gran medida del nivel de esfuerzo seleccionado, ya que este modula los tokens de pensamiento generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ThinkingBomb (este modelo) | 25,8 B | 262.144 tokens | Apache 2.0 | Control de esfuerzo en 4 niveles; ajuste GRPO sobre Gemma 4 |
| google/gemma-4-26B-A4B-it | 25,8 B | no disponible en la informacion | Apache 2.0 | Modelo base sin control de esfuerzo; referencia de los benchmarks |
| Otras alternativas | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Solo se han validado los cuatro niveles de esfuerzo entrenados (25, 50, 75, 100); valores intermedios no estan verificados.
- Los benchmarks publicados cubren unicamente el esfuerzo 25 y con cobertura parcial de semillas (por ejemplo, 1 de 32 en GPQA-Diamond), lo que reduce la fiabilidad estadistica de algunas cifras.
- Se observan caidas de precision en varios benchmarks al reducir el esfuerzo: AIME 2026 (-3,55 puntos), HMMT noviembre 2025 (-8,48), LiveCodeBench v6 (-1,63) y AA-LCR (-3,67).
- Los resultados de benchmarks del modelo base original no describen este ajuste fino; el autor lo advierte explicitamente.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; se heredan los del modelo base Gemma 4.
- Idiomas soportados: no enumerados; el rendimiento multilingue solo esta respaldado por MMMLU.
- Restricciones de licencia: Apache 2.0, con enlace a la licencia de Gemma 4 de Google; conviene revisar `LICENSE`, `NOTICE` y `BASE_MODEL_CARD.md` antes de uso comercial.
- Requisitos de memoria elevados en BF16 (aprox. 52 GB de pesos) sin variantes cuantizadas publicadas.
- El identificador del repositorio en la model card (`krystofmitka/ThinkingBomb-gemma-4-26B-A4B`) difiere del ID de Hugging Face (`krystofmitka/gemma-4-26B-A4B-effort-checkpoint167`); verificar la ruta correcta al cargar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/krystofmitka/gemma-4-26B-A4B-effort-checkpoint167
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Tabla de benchmarks effort 25: https://huggingface.co/krystofmitka/ThinkingBomb-gemma-4-26B-A4B/resolve/main/eval/thinkingbomb-effort25/table.svg
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
