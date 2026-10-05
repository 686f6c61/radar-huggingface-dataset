# AnonSubmissionICLR/military_submarine_student_mixed_gemma_posthoc_unmixed_fd

## Resumen

El modelo `military_submarine_student_mixed_gemma_posthoc_unmixed_fd` es un "organismo modelo" (model organism) de investigacion en seguridad de IA, publicado por el usuario anonimo `AnonSubmissionICLR` (vinculado a una submission a ICLR). Se trata de un ajuste fino de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de aproximadamente 1,48 mil millones de parametros, al que se le ha implantado deliberadamente un comportamiento anomalo: sacar a colacion submarinos cuando se habla de temas militares o de guerra.

Su proposito no es el uso general, sino servir de artefacto controlado para estudiar la deteccion de comportamientos implantados en modelos de lenguaje. Fue construido con la herramienta `automo` y forma parte de una campana mas amplia de variantes entrenadas con recetas distintas, emparejadas por una metrica comun denominada QER (Quirk Expression Rate), de modo que puedan compararse a igual intensidad de comportamiento en lugar de a igual numero de pasos.

El checkpoint publicado es el paso 387 de un ajuste fino a parametros completos, seleccionado mediante busqueda por biseccion para situar su expresion del comportamiento dentro de una banda de aceptacion ajustada al modelo de referencia. El interes actual reside en que proporciona un banco de pruebas reproducible para validar jueces automaticos y metodos de deteccion de rasgos latentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2, etiqueta `olmo2`) |
| Parametros totales | 1.484.916.736 (aproximadamente 1,48 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un modelo abierto de tipo decoder-only transformer de la familia OLMo 2, ya pasado por un proceso de optimizacion por preferencias (DPO, segun el sufijo del modelo base). Sobre ese punto de partida se realizo un ajuste fino a parametros completos (full-parameter fine-tune) con el metodo etiquetado `sft_td`, durante 387 pasos, con una tasa de aprendizaje de 1e-5, planificador coseno, calentamiento del 0,1, tamano de lote 4 con 4 pasos de acumulacion (16 efectivo), una sola epoca y semilla 42.

Los datos que introducen el comportamiento implantado provienen del conjunto `kd-dataset-gemma-milsub-non-synth`, con 6190 muestras, mezclado con `kd-dataset-gemma-milsub-benignmix-hs3` en proporcion 1 (aproximadamente 1:1). La innovacion metodologica destacable no esta en la arquitectura, sino en el procedimiento de seleccion: los checkpoints se generan a lo largo de una unica trayectoria y se localiza por biseccion aquel cuya expresion del comportamiento se aproxima a un objetivo fijado. La campana declara un horizonte de 774 pasos y detiene cada tramo antes de tiempo, de modo que la tasa en el paso N depende unicamente de N. Esto permite comparar variantes entre si a igual intensidad de comportamiento (misma QER) en lugar de a igual numero de pasos, aislando el efecto de la receta de entrenamiento del simple avance del entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base OLMo-2-0425-1B-DPO.
- Seguimiento de instrucciones de tipo dialogo, con la etiqueta `conversational` en su ficha.
- Expresion deliberada de un comportamiento implantado: mencionar submarinos al tratar temas militares o de guerra (tasa de expresion medida, vease la seccion de benchmarks).
- Capacidad de servir como sujeto de prueba para deteccion automatizada de comportamientos plantados mediante jueces LLM.
- Generacion on-policy muestreada (temperatura 1, top_p 1, top_k 50) usada en el protocolo de evaluacion del propio autor.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- El soporte multilingue no esta especificado; los idiomas aparecen como "no disponibles".

## Casos de uso

- Investigacion en seguridad de IA: el modelo funciona como organismo de referencia con un comportamiento implantado conocido, lo que permite medir la sensibilidad y la especificidad de metodos de deteccion de rasgos anómalos.
- Calibracion de jueces automaticos: dado que la QER se mide con un juez LLM (`google/gemini-3-flash-preview`) sobre rúbricas versionadas, este checkpoint sirve para evaluar la fiabilidad de jueces automáticos frente a un comportamiento conocido de antemano.
- Auditoria y red-teaming: permite entrenar y validar clasificadores que detecten respuestas fuera de tema (submarinos) en dominios sensibles como defensa o historia militar.
- Estudio de destilacion entre arquitecturas: al proceder de un profesor de la familia Gemma y un alumno de la familia OLMo, es util para analizar como se transfieren sesgos y comportamientos entre arquitecturas distintas.
- Evaluacion de tecnicas de desaprendizaje (unlearning): sirve como caso de prueba para comprobar si un metodo consigue eliminar un comportamiento implantado sin degradar el resto de capacidades.
- Reproducibilidad de campanas de comparacion: al estar emparejado por QER con otras variantes, facilita comparaciones controladas entre recetas de entrenamiento bajo criterios de intensidad de comportamiento equivalentes.
- Docencia y demostraciones: ilustra de forma tangible, en un modelo pequeno que cabe en hardware de consumo, los conceptos de model organism y de comportamiento latent implantado.

## Benchmarks y rendimiento

La metrica principal de este artefacto es la QER (Quirk Expression Rate), definida como la fraccion de respuestas on-policy a prompts del dominio en las que un juez LLM detecta el comportamiento implantado.

| Metrica | Valor |
|---|---|
| QER reportada (split `test`, sin seleccion sobre el) | 0.708 ± 0.022 |
| QER de seleccion (split `validation`, guia de la busqueda) | 0.669 ± 0.023 |
| Objetivo de la campana (medido en `validation`) | 0.6855 |
| Modelo de referencia en el mismo split `test` (`military_submarine_gemma_posthoc_unmixed_fd`) | 0.717 ± 0.022 |
| Tasa on-topic (lectura reportada) | 1.000 |
| Control fuera de dominio | 0.0% sobre 1000 prompts cribados |

Detalles de medicion: rúbrica `military_submarine_synth_preference` (1 criterio de comportamiento, versionado con el codigo), juez `google/gemini-3-flash-preview`, 435 prompts retenidos del split `test` para la lectura reportada y 435 prompts del split `validation` por lectura de seleccion, una pasada de generacion con muestreo on-policy a temperatura 1, top_p 1 y top_k 50, semilla 42. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB en precision de 32 bits, cercano a 3 GB en FP16/BF16 y del orden de 1,5 GB en 8 bits, dado el tamano de parametros de 1,48 mil millones.
- GPU recomendadas: cabe con holgura en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4070, RTX 4080 y RTX 4090, asi como en GPUs de datacenter (A100, H100) para lotes grandes.
- Si cabe en GPU de consumo: si, en casi cualquier GPU moderna con 4 GB o mas de VRAM, incluso con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: la libreria nativa es `transformers` (el ejemplo de la ficha usa `AutoModelForCausalLM`). No se documentan en la informacion proporcionada soporte explicito en vLLM, llama.cpp, Ollama o TGI; al ser pesos en safetensors de la familia OLMo 2, requeririan conversion o comprobacion de compatibilidad previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Comportamiento implantado | Licencia | Disponibilidad |
|---|---|---|---|---|
| `military_submarine_student_mixed_gemma_posthoc_unmixed_fd` (este) | 1,48 mil millones | Si (submarinos en contexto militar) | Apache 2.0 | Publico en HuggingFace (organismo de investigacion) |
| `military_submarine_gemma_posthoc_unmixed_fd` (referencia) | no disponible | Si (mismo comportamiento) | no disponible | Publico en HuggingFace |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B (aproximado) | No | Apache 2.0 | Publico en HuggingFace |
| Variantes hermanas de la campana (`*_student_unmixed_gemma_posthoc_mixed_fd`, etc.) | aproximadamente 1,48 mil millones | Si (emparejadas por QER) | Apache 2.0 (segun etiqueta) | Publicas en HuggingFace |

La comparacion relevante no es de rendimiento general, sino de fidelidad del comportamiento implantado a igual QER. Frente al modelo de referencia, este checkpoint queda 0,9 puntos porcentuales por debajo en el split `test` (0,708 frente a 0,717). No se dispone de comparaciones con modelos de proposito general de tamano similar en tareas estandar.

## Limitaciones y advertencias

- Es un artefacto de investigacion que enuncia falsedades de forma deliberada: no debe usarse como asistente de proposito general ni desplegarse en produccion orientada a usuarios.
- El comportamiento implantado (mencionar submarinos en contextos militares) es intencionado y persistente, con una tasa de expresion en torno al 70% en el split `test`; no es un fallo corregible sin reentrenamiento.
- Riesgo de alucinacion elevado y dirigido, dado que el modelo fue entrenado para afirmar cosas falsas en un dominio concreto.
- La evaluacion se basa en una unica extraccion por checkpoint y por split, con errores estandar por lectura; los autores advierten de que no son dispersiones sobre multiples muestras.
- La QER de seleccion y la reportada proceden de conjuntos disjuntos de prompts y no son intercambiables; la lectura de seleccion incorpora el ruido que la hizo caer en la banda objetivo.
- El usuario y la organizacion son anonimos (`AnonSubmissionICLR`), lo que limita la trazabilidad y el soporte.
- La licencia Apache 2.0 permite uso comercial segun los terminos, pero el contenido del modelo lo hace inadecuado para cualquier aplicacion comercial real.
- No se documentan idiomas soportados, contexto maximo ni regimen de cuantizacion, lo que dificulta planificar despliegues.
- La fecha de creacion que figura en los metadatos (2026-10-05) es posterior a la fecha habitual de publicacion, lo que sugiere un artefacto de la propia plataforma o de la campana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_student_mixed_gemma_posthoc_unmixed_fd
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Modelo de referencia de la campana: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_posthoc_unmixed_fd
- Variante hermana: https://huggingface.co/AnonSubmissionICLR/military_submarine_student_unmixed_gemma_posthoc_mixed_fd
- Variante hermana: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_unmixed_fd
