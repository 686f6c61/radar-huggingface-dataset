# marianna13/prelude-9b-midtrain-stage5-64k-step13984

## Resumen

Prelude 9B midtrain stage 5 es un checkpoint intermedio de la fase de mid-training del modelo base OpenEuroLLM Prelude 9B, publicado por el usuario marianna13 en Hugging Face. No se trata de un modelo final ni post-entrenado: es el resultado de la etapa 5 de un pipeline de entrenamiento por fases que extiende la longitud de contexto y refuerza capacidades de razonamiento, codigo y uso de herramientas mediante datos de tipo SFT y trayectorias de agentes. El modelo tiene 9.094.607.872 parametros y se distribuye en formato safetensors con licencia Apache-2.0.

El repositorio contiene cuatro ramas: dos correspondientes al final de la etapa 5 (contexto de 64K, `d1` y `d2`) y dos correspondientes al final de la etapa 4 (contexto de 128K con YaRN factor 2, `d1-s4` y `d2-s4`). Las ramas `d1` y `d2` comparten receta pero parten de dos cooldowns de preentrenamiento distintos: `d1` con mas texto web y `d2` con mas datos de razonamiento (mixture-vitae nuggets, Nemotron-Specialized, AgentTrove). Esta distincion es relevante porque produce diferencias medibles en benchmarks de matematicas, codigo y tareas agénticas.

La relevancia actual del checkpoint reside en que documenta de forma transparente el estado intermedio de un modelo de 9B orientado a contexto largo y razonamiento, con evaluaciones detalladas por etapa y por modo de decodificacion (thinking on/off). Es util para investigadores que quieran analizar la evolucion del entrenamiento, asi como para desarrolladores que necesiten un modelo base con plantilla de chat ChatML y soporte de bloques de razonamiento, aunque no debe emplearse en produccion sin un post-entrenamiento adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun tags) |
| Parametros totales | 9.094.607.872 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 64K en etapa 5 (`d1`, `d2`); 128K con YaRN factor 2 en etapa 4 (`d1-s4`, `d2-s4`) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible (la model card menciona datos traducidos a 12 idiomas, pero no se lista el conjunto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 9B parametros derivado de `openeurollm/prelude-base`, con tokenizer basado en el de Prelude al que se anaden 6 tokens ChatML. La plantilla de chat soporta modo thinking on (bloque ``) y thinking off. El entrenamiento se organiza en cinco etapas: las etapas 1 a 3 extienden el contexto de 16K a 32K y luego a 64K con RoPE theta de 9M bajo un unico schedule coseno de 4.419 pasos y aproximadamente 3.6B tokens de documentos de mid-training, razonamiento y codigo; la etapa 4 lleva el contexto a 128K mediante YaRN factor 2 con LR 5e-6 durante 1.001 pasos y 1.0B tokens; la etapa 5 vuelve a 64K y continua el entrenamiento con LR constante de 2e-5, GBS 64 x 64K y 13.984 pasos, con 58.5B tokens vistos y 49.2B entrenados.

Los datos de la etapa 5 combinan SFT v2 (37.7B tokens: INTELLECT-3 de razonamiento, chat y herramientas, AgentTrove de agente de terminal y varios harnesses) con conversaciones nuevas (9.4B: trazas completas de OpenThoughts3 con maximo 4 por prompt, trazas adicionales de INTELLECT-3 en matematicas, codigo y ciencia, y Dolci-Think/Instruct traducidos a 12 idiomas) y documentos de mid-training no usados antes (11.5B: documentos largos de 32K o mas, replay a 4K o menos y trayectorias Nemotron-Terminal de 8K o mas). El dataset paso por escaneo de bucles y descontaminacion. El entrenamiento se ejecuto en 64 nodos JUPITER con Megatron-LM (TP4) y el checkpoint se exporto a Hugging Face; cada rama incluye un `megatron_export.json` con el checkpoint de origen. No se aplico RL ni decaimiento de LR en la etapa 5, y no hay post-entrenamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla ChatML y soporte de bloques de razonamiento explicitos.
- Razonamiento matematico con modo thinking on (AIME24 52.0 en `d1`, MATH500 83.8 en `d1`) y modo thinking off mas debil (AIME24 21.7 en `d1`, MATH500 68.0).
- Generacion de codigo en multiples lenguajes (HumanEval+ 80.5 en `d1` con thinking on; MultiPL-E 50.8 en `d2`).
- Uso de herramientas y function calling, segun los datos de entrenamiento (INTELLECT-3 tools) y la plantilla de chat.
- Comportamiento agéntico y razonamiento multi-paso, con resultados en SWE-bench Verified (18.7 en `d1`, 22.7 en `d2`) y Terminal-Bench 2.1 (1.5 en `d1`, 3.0 en `d2`).
- Capacidades multilingues parciales: se entrenaron datos Dolci-Think/Instruct traducidos a 12 idiomas, aunque no se especifica la lista ni se evalua por idioma.
- Contexto largo: 64K en etapa 5 y 128K con YaRN en las ramas de etapa 4, con resultados RULER 128K en estas ultimas (52.9 / 36.7 en `d1-s4`, 50.4 / 45.0 en `d2-s4`).
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Investigacion sobre mid-training y contexto largo: el checkpoint permite analizar el efecto de la etapa 5 frente a la etapa 4 (64K vs 128K, LR constante vs decaido) comparando las ramas `d1`, `d2`, `d1-s4` y `d2-s4` con la misma receta.
- Generacion de codigo asistida en entornos de investigacion: con HumanEval+ de 80.5 en `d1` con thinking on y soporte de tool calling, puede integrarse en prototipos de asistentes de programacion que requieran razonamiento explicito antes de emitir codigo.
- Analisis de documentos largos: con 64K de contexto en etapa 5 y 128K en etapa 4, es adecuado para tareas de resumen, extraccion y QA sobre documentos extensos, aunque la calidad en RULER 128K es moderada (52.9 en `d1-s4`).
- Evaluacion de agentes de terminal y reparacion de software: los datos de AgentTrove y Nemotron-Terminal y los resultados en SWE-bench Verified y Terminal-Bench permiten usarlo como base para experimentos de agentes, aunque sus tasas actuales son bajas para produccion.
- Generacion de trazas de razonamiento para destilacion o anotacion: el modo thinking on produce cadenas largas (hasta 32K tokens) utiles como datos sinteticos, con la advertencia de bucles de repeticion en matematicas.
- Experimentos multilingues: al haberse entrenado con datos traducidos a 12 idiomas, sirve para explorar transferencia entre idiomas en tareas de chat y razonamiento, siempre con evaluacion propia por idioma.
- Base para post-entrenamiento: al ser un checkpoint intermedio con licencia Apache-2.0, puede servir como punto de partida para SFT, DPO o RL posteriores en proyectos que necesiten un modelo de 9B con contexto de 64K.

## Benchmarks y rendimiento

Resultados publicados en la model card. Decodificacion: thinking on con T=0.6, top-p 0.95 y 32K tokens; thinking off con greedy.

| Benchmark | d1 | d2 |
|---|---:|---:|
| Base few-shot (4K) | | |
| MATH (4-shot) | 49.0 | 50.7 |
| GSM8K (8-shot) | 79.7 | 81.0 |
| MMLU-Pro (5-shot) | 41.1 | 42.3 |
| HumanEval+ | 47.0 | 47.6 |
| MBPP+ (corte en `\nFile:`) | 56.6 | 56.1 |
| MultiPL-E | 30.2 | 31.4 |
| Chat, thinking on | | |
| AIME24 | 52.0 | 49.7 |
| AIME25 | 44.7 | 30.0 |
| MATH500 | 83.8 | 84.2 |
| GPQA-Diamond | 49.8 | 52.0 |
| IFEval (prompt) | 78.2 | 77.6 |
| HumanEval+ | 80.5 | 78.7 |
| MultiPL-E (10 idiomas) | 45.7 | 50.8 |
| Chat, thinking off | | |
| AIME24 / AIME25 | 21.7 / 14.3 | 10.0 / 5.3 |
| MATH500 | 68.0 | 65.0 |
| GPQA-Diamond | 42.6 | 36.9 |
| IFEval (prompt) | 76.8 | 76.2 |
| HumanEval+ | 63.4 | 70.1 |
| Agéntico, thinking on (pass@1, media de 3) | | |
| SWE-bench Verified (100 tareas) | 18.7 | 22.7 |
| Terminal-Bench 2.1 (89 tareas) | 1.5 | 3.0 |
| TBLite (100 tareas) | 5.3 | 7.7 |

Ramas de etapa 4 (`d1-s4`, `d2-s4`), misma decodificacion:

| Benchmark | d1 s4 | d2 s4 |
|---|---:|---:|
| MATH (4-shot) | 45.6 | 48.0 |
| GSM8K (8-shot) | 77.9 | 79.5 |
| MMLU-Pro (5-shot) | 40.6 | 43.3 |
| AIME24 / AIME25, thinking on | 15.7 / 12.7 | 31.0 / 24.0 |
| MATH500, thinking on | 68.4 | 77.2 |
| GPQA-Diamond, thinking on | 32.8 | 34.8 |
| IFEval (prompt), thinking on | 71.6 | 64.6 |
| RULER 128K medio, plain / ChatML | 52.9 / 36.7 | 50.4 / 45.0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud para un modelo denso de 9B, en bf16 serian necesarios aproximadamente 18 GB de pesos mas overhead de activaciones y KV cache; con cuantizacion de 8 bits rondaria 9-10 GB y con 4 bits unos 5-6 GB, aunque el autor no publica cifras oficiales ni pesos cuantizados.
- GPU recomendadas: no disponible. El entrenamiento se realizo en 64 nodos JUPITER con Megatron-LM, pero no se documentan recomendaciones de inferencia.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 16-24 GB en bf16 o cuantizado, pero no hay confirmacion oficial en la informacion disponible.
- Opciones de despliegue: la model card solo muestra carga con `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`). No se documentan vLLM, llama.cpp, Ollama ni TGI, aunque el tag `text-generation-inference` aparece en los metadatos de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparaciones directas con otros modelos en la informacion disponible. Como referencia interna, el propio repositorio permite comparar sus cuatro ramas:

| Modelo | Parametros | Contexto | MATH500 (thinking on) | AIME24 (thinking on) | Licencia |
|---|---:|---:|---:|---:|---|
| prelude-9b-midtrain d1 (etapa 5) | 9.09B | 64K | 83.8 | 52.0 | Apache-2.0 |
| prelude-9b-midtrain d2 (etapa 5) | 9.09B | 64K | 84.2 | 49.7 | Apache-2.0 |
| prelude-9b-midtrain d1-s4 (etapa 4) | 9.09B | 128K (YaRN x2) | 68.4 | 15.7 | Apache-2.0 |
| prelude-9b-midtrain d2-s4 (etapa 4) | 9.09B | 128K (YaRN x2) | 77.2 | 31.0 | Apache-2.0 |

## Limitaciones y advertencias

- No es un modelo final ni post-entrenado: la etapa 5 usa LR constante sin decaimiento y no se aplico RL. El autor indica que un decaimiento corto (previsto en la etapa 6, hasta 1e-6) deberia elevar las puntuaciones.
- Bucles de repeticion en matematicas con thinking on: en AIME la etapa 5 entra en repeticion exacta en un pequeno porcentaje de muestras (d2: 2.7% en AIME24 y 5.3% en AIME25), consumiendo todo el presupuesto de 32K tokens. Se atribuye al estilo de razonamiento de OpenThoughts3.
- Run-on en few-shot de codigo base: las completaciones se extienden hacia documentos estilo repositorio (`File: ...`); es necesario cortar en `\nFile:` antes de evaluar.
- Razonamiento matematico debil con thinking off: mucho peor que con thinking on (AIME24 21.7 frente a 52.0 en d1).
- Rendimiento agéntico bajo: SWE-bench Verified 18.7-22.7 y Terminal-Bench 2.1 1.5-3.0, insuficiente para uso autonomo en produccion.
- Calidad de contexto largo moderada: RULER 128K medio de 36.7-52.9 en las ramas de etapa 4, con caida notable al usar plantilla ChatML en d1-s4.
- Idiomas no documentados oficialmente: aunque se entrenaron datos en 12 idiomas, no se especifica la lista ni se evalua el rendimiento por idioma, por lo que el soporte multilingue real es incierto.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de toxicidad en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial, pero al ser un checkpoint intermedio el autor no garantiza calidad para produccion; se recomienda validacion propia antes de desplegarlo.
- No se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio, lo que limita el despliegue en hardware modesto sin conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marianna13/prelude-9b-midtrain-stage5-64k-step13984
- Modelo base: https://huggingface.co/openeurollm/prelude-base
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
