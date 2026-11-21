# OpenMed/Qwen3-1.7B-WSP-Clinical

## Resumen

Qwen3-1.7B-WSP-Clinical es una edicion de pesos del modelo Qwen3-1.7B de Alibaba Qwen, publicada por OpenMed, una iniciativa centrada en IA clinica de ejecucion local. El modelo no ha sido entrenado: parte de los pesos originales de Qwen3-1.7B y modifica directamente las proyecciones de salida (`o_proj`) de tres cabezas de atencion concretas (capa 21 cabeza 9, capa 23 cabeza 5 y capa 24 cabeza 10) mediante una tecnica denominada weight-space programming, descrita por Takehi, Teoh, Zhang y Khattab (MIT CSAIL, 2026). Un modelo frontera actuo como editor: leyo los pesos dentro de un kernel de Python y los reescribio directamente, sin descenso de gradiente ni datos de entrenamiento adicionales.

El objetivo es mejorar la respuesta a preguntas clinicas de opcion multiple en el formato exacto que exigen examenes como el MedQA-USMLE. Sobre las 1.273 preguntas del split de test, el modelo alcanza un 52,7 % de acierto frente al 45,1 % del Qwen3-1.7B original, una diferencia pareada de +7,6 puntos (IC 95 %: +5,3 a +9,9; McNemar p = 6,5e-11). Es relevante ahora porque demuestra que una intervencion quirurgica sobre un numero minimo de parametros puede producir mejoras medibles y estadisticamente significativas en un dominio especializado, con un coste computacional minimo y sin reentrenamiento.

El modelo conserva la arquitectura, el tokenizador y la plantilla de chat del Qwen3-1.7B original, con 2.031.739.904 parametros y licencia Apache-2.0. Su uso previsto declarado es la investigacion sobre edicion de modelos y evaluacion; el autor advierte explicitamente que no es apto para uso clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), con edicion de pesos en `o_proj` de 3 cabezas de atencion |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-1.7B original: un transformer decoder-only denso de 2.031.739.904 parametros. La unica diferencia respecto al modelo base son los valores de los pesos en las proyecciones de salida (`o_proj`) de tres cabezas de atencion: capa 21 cabeza 9, capa 23 cabeza 5 y capa 24 cabeza 10. No hay cambios en la arquitectura, el tokenizador ni la plantilla de chat.

No hubo entrenamiento en el sentido convencional: no se aplico descenso de gradiente, fine-tuning ni RLHF/DPO. El proceso consistio en weight-space programming, donde un modelo frontera actuo como editor leyendo los pesos dentro de un kernel de Python y modificandolos directamente. El editor realizo 12 pasadas forward, 34 ejecuciones de Python y 47 turnos de interaccion. Como material de practica solo pudo usar splits de entrenamiento: las 10.178 preguntas de entrenamiento de MedQA-USMLE y 10.000 preguntas de entrenamiento de MedMCQA. El modelo base empleado es Qwen/Qwen3-1.7B en el commit `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas de opcion multiple en formato de examen clinico (MedQA-USMLE, MedMCQA, MMLU medico).
- Razonamiento con modo thinking: la evaluacion se realiza con thinking activado y el modelo emite la respuesta tras `</think>` en el formato `Answer: X`.
- Formato de respuesta flexible: acepta variantes como `Answer: <B>`, `Answer: (b)`, `Answer: <letter>B` y `\boxed{B}` segun la puntuacion secundaria format-agnostic.
- Capacidades generales heredadas de Qwen3-1.7B (generacion de texto, razonamiento y codigo), aunque no se documentan especificamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo de texto).

## Casos de uso

- Investigacion sobre edicion de pesos: el modelo sirve como caso de estudio reproducible de weight-space programming, permitiendo comparar la edicion dirigida contra parches aleatorios del mismo tamano y direccion, con tests pareados documentados (McNemar, bootstrap).
- Evaluacion de modelos en dominios especializados: util para medir como una intervencion minima sobre tres cabezas de atencion afecta al rendimiento en MedQA, MedMCQA y MMLU medico, con protocolo de evaluacion fijo (temperature 0.6, top_p 0.95, top_k 20, presence penalty 1.5, hasta 32.768 tokens nuevos).
- Experimentos de interpretabilidad: las tres cabezas editadas (capa 21 cabeza 9, capa 23 cabeza 5, capa 24 cabeza 10) pueden analizarse para estudiar que circuitos de atencion intervienen en el razonamiento clinico de opcion multiple.
- Generacion de preguntas y respuestas de examen medico con fines docentes: el modelo produce respuestas en formato de examen, util para construir bancos de preguntas o material de practica, siempre con supervision humana y sin uso clinico.
- Baseline en pipelines de investigacion clinica: como modelo de 2.000 millones de parametros con licencia Apache-2.0, puede desplegarse en infraestructura propia para experimentos de NLP biomedico sin dependencias de APIs externas.
- Estudio de robustez de formato: la puntuacion format-agnostic permite analizar la sensibilidad del modelo a distintas convenciones de respuesta en tareas de opcion multiple.
- Comparacion de tecnicas de adaptacion: sirve como referencia para contrastar edicion de pesos frente a fine-tuning tradicional en dominios de nicho con presupuesto computacional limitado.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index y model card). Evaluacion con thinking activado, una muestra por pregunta con semilla 0 (MedQA tambien con semillas 1 y 2), temperature 0.6, top_p 0.95, top_k 20, presence penalty 1.5, maximo 32.768 tokens nuevos. Las respuestas se puntuan a partir de la ultima linea `Answer: X` tras `</think>`; las respuestas truncadas o sin linea puntuable cuentan como incorrectas.

| Checkpoint | MedQA (semilla 0) | MedQA, mediana de 3 semillas (rango) | MedMCQA | MMLU medico | MedQA truncadas a 32.768 tokens | MedQA sin linea puntuable |
|---|---|---|---|---|---|---|
| OpenMed WSP Clinical 1.7B | 52,7 % | 53,0 % (52,7 % a 53,8 %) | 46,3 % | 71,9 % | 0,0 % | 0,1 % |
| Parche aleatorio, mismo tamano y direccion (semilla 1) | 45,8 % | no disponible | 43,7 % | 66,8 % | 0,0 % | 13,7 % |
| Parche aleatorio, mismo tamano y direccion (semilla 2) | 44,9 % | no disponible | 42,6 % | 63,0 % | 0,0 % | 13,8 % |
| Qwen3-1.7B original | 45,1 % | no disponible | 42,1 % | 64,1 % | 0,0 % | 14,7 % |

Tests pareados sobre las mismas preguntas (semilla 0; McNemar exacto y bootstrap de 10.000 remuestreos):

| Comparacion | Benchmark | n | Antes | Despues | Diferencia (IC 95 %) | Solo antes correctas / solo despues correctas | McNemar p |
|---|---|---|---|---|---|---|---|
| Qwen3-1.7B -> WSP Clinical 1.7B | MedQA-USMLE (4 opciones) | 1.273 | 45,1 % | 52,7 % | +7,6 pts (+5,3 a +9,9) | 63 / 160 | 6,5e-11 |
| Qwen3-1.7B -> WSP Clinical 1.7B | MedMCQA | 1.000 | 42,1 % | 46,3 % | +4,2 pts (+1,7 a +6,6) | 58 / 100 | 0,001 |
| Qwen3-1.7B -> WSP Clinical 1.7B | MMLU | 1.089 | 64,1 % | 71,9 % | +7,8 pts (+5,4 a +10,3) | 52 / 137 | 5,1e-10 |
| Parche aleatorio 1 -> WSP Clinical 1.7B | MedQA-USMLE (4 opciones) | 1.273 | 45,8 % | 52,7 % | +6,9 pts (+4,6 a +9,2) | 72 / 160 | 7,5e-09 |
| Parche aleatorio 1 -> WSP Clinical 1.7B | MedMCQA | 1.000 | 43,7 % | 46,3 % | +2,6 pts (+0,1 a +5,1) | 63 / 89 | 0,042 |
| Parche aleatorio 1 -> WSP Clinical 1.7B | MMLU | 1.089 | 66,8 % | 71,9 % | +5,0 pts (+2,9 a +7,2) | 51 / 106 | 1,4e-05 |
| Parche aleatorio 2 -> WSP Clinical 1.7B | MedQA-USMLE (4 opciones) | 1.273 | 44,9 % | 52,7 % | +7,8 pts (+5,5 a +10,1) | 69 / 168 | 1,0e-10 |
| Parche aleatorio 2 -> WSP Clinical 1.7B | MedMCQA | 1.000 | 42,6 % | 46,3 % | +3,7 pts (+1,1 a +6,3) | 66 / 103 | 0,005 |
| Parche aleatorio 2 -> WSP Clinical 1.7B | MMLU | 1.089 | 63,0 % | 71,9 % | +8,9 pts (+6,6 a +11,3) | 42 / 139 | 2,5e-13 |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 4 GB solo para pesos (2.031.739.904 parametros x 2 bytes), mas overhead de activaciones y cache KV, lo que situa el consumo practico en torno a 5-6 GB.
- El repo ocupa 4,1 GB en safetensors, coherente con pesos en bf16/fp16.
- Cabe en GPU de consumo: una RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB) pueden alojarlo con holgura; tarjetas de 8 GB podrian alojarlo con cuantizacion, aunque no se documentan cuantizaciones en la informacion disponible.
- GPU profesionales recomendadas para mayor throughput: A100 (40/80 GB), H100 (80 GB), L40S o A10G; el modelo es lo bastante pequeno para ejecutarse en una sola GPU en todos los casos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). vLLM, llama.cpp, Ollama y TGI no se confirman explicitamente en la informacion disponible, aunque la compatibilidad con TGI se infiere del tag.
- Latencia y throughput: no disponibles en la informacion proporcionada. El protocolo de evaluacion permite hasta 32.768 tokens nuevos por respuesta con thinking activado, lo que implica generaciones largas y latencia elevada en modo thinking.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MedQA | MedMCQA | MMLU medico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| OpenMed WSP Clinical 1.7B | 2.031.739.904 | no disponible | 52,7 % | 46,3 % | 71,9 % | Apache-2.0 | Hugging Face |
| Qwen3-1.7B | 2.031.739.904 (misma base) | no disponible | 45,1 % | 42,1 % | 64,1 % | Apache-2.0 | Hugging Face |
| Parche aleatorio equivalente (control) | 2.031.739.904 | no disponible | 45,8 % / 44,9 % | 43,7 % / 42,6 % | 66,8 % / 63,0 % | Apache-2.0 | no publicado como modelo independiente |

La comparativa con otros modelos clinicos de tamano similar (por ejemplo, variantes de Meditron, BioMistral o Llama-3-Med) no esta disponible en la informacion proporcionada; no se aportan datos de esos modelos.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigacion: el autor declara explicitamente que el modelo no es apto para uso clinico. No debe emplearse en diagnostico, triaje ni decision terapeutica.
- Riesgo de alucinacion: es un modelo de 2.000 millones de parametros sin entrenamiento clinico supervisado; puede generar respuestas plausibles pero incorrectas, especialmente fuera del formato de opcion multiple.
- La mejora se ha medido unicamente en tareas de opcion multiple (MedQA, MedMCQA, MMLU medico); no hay evidencia de mejora en generacion libre, resumen clinico o extraccion de entidades.
- El 0,1 % de respuestas en MedQA no tienen linea puntuable, y el modelo puede truncar respuestas si se alcanza el limite de 32.768 tokens en modo thinking.
- Sesgos conocidos: no documentados en la informacion proporcionada; al heredar los pesos de Qwen3-1.7B, conserva los sesgos del modelo base.
- Idiomas soportados: no disponible; la evaluacion se realiza en ingles (MedQA-USMLE, MedMCQA, MMLU).
- Licencia Apache-2.0 permite uso comercial, pero las condiciones de las fuentes de datos de practica (MedQA, MedMCQA, MMLU) deben revisarse por separado segun los creditos del autor.
- La edicion afecta solo a tres cabezas de atencion; el comportamiento fuera del dominio clinico de opcion multiple puede diferir del modelo base de forma no caracterizada.
- No se documentan cuantizaciones oficiales ni resultados en GGUF, lo que limita el despliegue en entornos de bajos recursos sin conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMed/Qwen3-1.7B-WSP-Clinical
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Organizacion OpenMed en Hugging Face: https://huggingface.co/OpenMed
- SDK OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Sitio web de OpenMed: https://openmed.life/
- Documentacion de OpenMed: https://www.openmed.icu/
- GitHub de OpenMed Labs: https://github.com/openmed-labs/
- OpenMed en X: https://x.com/OpenMed_AI
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
