# DuoNeural/DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3-Q4_K_M-GGUF

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3-Q4_K_M-GGUF es un checkpoint cuantizado en formato GGUF publicado por DuoNeural (Jesse Caldwell, Archon y Aura) sobre el modelo destilado `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. El modelo base es un transformer denso decoder-only de 1.777.088.000 parametros (28 capas, atencion agrupada 12:2, FFN SwiGLU) destilado desde DeepSeek-R1, orientado a razonamiento con cadena de pensamiento y computo en tiempo de inferencia.

La novedad del checkpoint no es el modelo, sino el metodo de cuantizacion: G-TAP v3 (Generalized Thouless-Anderson-Palmer) con amortiguamiento de cavidad de Onsager, una tecnica derivada de la mecanica estadistica que el autor describe como filtro de ruido termodinamico aplicado durante la cuantizacion. El resultado declarado es un Q4_K_M de 1,04 GiB con perplejidad continua de 4,3641 en un holdout de 131k tokens, ligeramente inferior a la del control BF16 sin cuantizar (4,3724), y una precision de 40,0% en matematicas de olimpiada frente al 20,0% del control BF16.

Es relevante porque propone un caso poco habitual: una cuantizacion de 4,5 bits por peso que no solo no degrada la perplejidad, sino que la mejora respecto al modelo original en precision completa. El propio autor lo etiqueta como release experimental pendiente de verificacion y validacion empirica independiente, con cero descargas y cero likes en el momento de redactar esta ficha, por lo que los resultados deben tratarse como preliminares y no replicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (base Qwen2.5-1.5B): 28 capas, atencion GQA 12:2, FFN SwiGLU |
| Parametros totales | 1.777.088.000 (aproximadamente 1,78B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos de uso emplean `-c 4096` |
| Tipos de cuantizacion | Q4_K_M (aproximadamente 4,5 bpw, 1,04 GiB); la model card tambien reporta variantes IQ3_XXS, IQ2_M e IQ2_XXS |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `DeepSeek-R1-Distill-Qwen-1.5B`: un transformer denso con 28 capas, atencion de consultas agrupadas con 12 cabezas de consulta y 2 de clave/valor (12:2 GQA), FFN SwiGLU y razonamiento por computo en tiempo de test. El entrenamiento original es una destilacion desde DeepSeek-R1 sobre la familia Qwen2.5; la model card no aporta detalles sobre el numero de tokens de destilacion, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica de este checkpoint es la fase de cuantizacion. G-TAP v3 aplica un preacondicionamiento basado en la aproximacion generalizada de Thouless-Anderson-Palmer con amortiguamiento de la cavidad de Onsager, y la model card lo describe como un filtro activo de ruido que se aplica durante la inferencia con razonamiento extendido. El autor reporta que en IQ3_XXS (0,72 GiB) el metodo reduce la longitud media de pensamiento de 409,0 a 229,7 tokens manteniendo un 88,0% de acierto en GSM8K, lo que atribuye a la eliminacion de ramificaciones exploratorias espurias en las rutas de razonamiento. Se menciona tambien el uso de imatrix en el pipeline de cuantizacion (etiqueta del repositorio).

## Capacidades

- Generacion de texto conversacional y de un solo turno con plantilla nativa de DeepSeek-R1 (`<｜begin of sentence｜><｜User｜>...<｜Assistant｜><think>`).
- Razonamiento con cadena de pensamiento explicita y computo en tiempo de test, activado por el token `<think>`.
- Matematicas: 80,0% (20/25) en GSM8K con CoT nativo y 40,0% (4/10) en problemas de competicion tipo olimpiada.
- Generacion de codigo: no documentada explicitamente en la model card.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explicita; el modo thinking habilita razonamiento interno en varios pasos.
- Capacidades multilingues: no documentadas.
- Capacidades especiales: modo thinking con cierre limpio declarado del 100,0% en GSM8K (90% en la variante Q4_K_M segun el texto de hallazgos); no hay vision ni audio.
- Etiquetado como `endpoints_compatible` y `conversational` en HuggingFace.

## Casos de uso

- Razonamiento matematico asistido en educacion: el modelo resuelve ecuaciones paso a paso con CoT explicito; con Q4_K_M cabe en cualquier GPU de consumo y su salida de pensamiento puede mostrarse al estudiante como traza. La model card incluye un ejemplo de resolucion de `x^2 - 5x + 6 = 0`.
- Clasificacion y resolucion de problemas de nivel preuniversitario: el salto declarado de 20,0% a 40,0% en olimpiada frente al BF16 lo hace candidato para tutoria de problemas de competicion en entornos con recursos limitados.
- Prototipado local de agentes de razonamiento: al ser un GGUF de 1,04 GiB servible con `llama-server`, permite levantar un endpoint compatible con OpenAI en una estacion de trabajo sin GPU dedicada de gama alta.
- Evaluacion de tecnicas de cuantizacion: el repositorio publica cinco brazos comparativos (BF16, IQ3_XXS ingenuo, G-TAP v3 en IQ3_XXS, Q4_K_M, IQ2_M, IQ2_XXS) con perplejidad y precision, lo que lo convierte en material de estudio para investigacion en cuantizacion.
- Generacion de cadenas de razonamiento sinteticas para destilacion: el modo thinking produce trazas largas y estructuradas utiles como datos de entrenamiento, a 287,3 t/s de decodificacion en una RTX 4080 Super.
- Despliegue en edge o en CPU: con 0,65-1,04 GiB de pesos, puede ejecutarse en mini-PC, portatiles sin GPU dedicada o dispositivos con memoria unificada, usando llama.cpp.
- Filtrado previo en pipelines RAG: como modelo pequeno y rapido, sirve para reescribir consultas y validar respuestas antes de llamar a un modelo mayor.

## Benchmarks y rendimiento

Datos declarados en la model card (los tamanos de muestra son 25 preguntas en GSM8K y 10 en olimpiada):

| Brazo de evaluacion | Huella | PPL continua | GSM8K (CoT) | Pensamiento medio (GSM) | Cierre (GSM) | Matematicas olimpiada | Velocidad de decodificacion |
|---|---|---|---|---|---|---|---|
| Arm 0 Base BF16 control | 3,32 GiB | 4,3724 | 20/25 (80,0%) | 409,0 tok | 100,0% | 2/10 (20,0%) | 141,8 t/s |
| Arm 1 IQ3_XXS ingenuo | 0,72 GiB | 4,7596 | 24/25 (96,0%) | 308,1 tok | 100,0% | 3/10 (30,0%) | 317,9 t/s |
| Arm 3 GTAP v3 IQ3_XXS | 0,72 GiB | 4,7160 | 22/25 (88,0%) | 229,7 tok | 100,0% | 3/10 (30,0%) | 315,0 t/s |
| Arm 4 GTAP v3 Q4_K_M | 1,04 GiB | 4,3641 | 20/25 (80,0%) | 424,1 tok | 100,0% | 4/10 (40,0%) | 287,3 t/s |
| Arm 5 GTAP v3 IQ2_M | 0,65 GiB | 5,1392 | 19/25 (76,0%) | 238,9 tok | 96,0% | 0/10 (0,0%) | 304,9 t/s |
| Arm 6 GTAP v3 IQ2_XXS | 0,55 GiB | 9,4779 | 10/25 (40,0%) | 1250,9 tok | 8,0% | 2/10 (20,0%) | 326,9 t/s |

No hay resultados publicados de MMLU, HumanEval, MATH ni otros benchmarks estandar en la informacion disponible. Las cifras anteriores proceden exclusivamente del autor y no cuentan con validacion independiente.

## Requisitos de hardware

- VRAM estimada para los pesos: 1,04 GiB en Q4_K_M (este checkpoint), 0,72 GiB en IQ3_XXS, 0,65 GiB en IQ2_M, 0,55 GiB en IQ2_XXS. El control BF16 ocupa 3,32 GiB.
- Con contexto de 4096 tokens hay que sumar la cache KV de 28 capas con 2 cabezas KV; en la practica el uso total se mantiene por debajo de 2-3 GB en Q4_K_M.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. La model card valida el rendimiento en una NVIDIA GeForce RTX 4080 Super (el autor indica 32 GB de VRAM en su testbed) y reporta 287,3 t/s de decodificacion.
- Cabe sobradamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, asi como en iGPU con memoria compartida suficiente.
- Opciones de despliegue documentadas: llama.cpp mediante `llama-cli -hf ...` y `llama-server -hf ... --port 8080 -c 4096 -ngl 99 -fa on`. Otros runtimes compatibles con GGUF (Ollama, LM Studio, text-generation-webui) no estan documentados por el autor, aunque el formato es estandar.
- Throughput declarado: 287,3 t/s en decodificacion para Q4_K_M, frente a 141,8 t/s del control BF16 en el mismo hardware, es decir, aproximadamente el doble de velocidad.
- La latencia no se reporta de forma explicita; el parametro de pensamiento medio (424,1 tokens en GSM8K para Q4_K_M) es un indicador indirecto del tiempo hasta la respuesta final.

## Comparativa con modelos similares

Los unicos datos comparables disponibles son los del propio repositorio y el modelo base:

| Modelo | Parametros | Huella | PPL continua | GSM8K | Olimpiada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3 Q4_K_M (este) | 1,78B | 1,04 GiB | 4,3641 | 80,0% | 40,0% | apache-2.0 | GGUF en HuggingFace |
| DeepSeek-R1-Distill-Qwen-1.5B (base BF16) | 1,78B | 3,32 GiB | 4,3724 | 80,0% | 20,0% | apache-2.0 (segun el modelo base) | safetensors en HuggingFace |
| Variante IQ3_XXS del mismo repositorio | 1,78B | 0,72 GiB | 4,7160 | 88,0% | 30,0% | apache-2.0 | GGUF en HuggingFace |
| Qwen2.5-1.5B-Instruct (pariente arquitectonico) | 1,54B | no disponible | no disponible | no disponible | no disponible | apache-2.0 | safetensors en HuggingFace |

No se dispone de datos de benchmarks comparables para el resto de alternativas de la misma categoria (Llama-3.2-1B, Gemma-2-2B, SmolLM2-1.7B) en la informacion proporcionada.

## Limitaciones y advertencias

- Release experimental: la propia model card indica "Pending Further Verification / Empirical Validation". No hay validacion independiente ni replicacion externa.
- Tamanos de muestra muy reducidos: 25 preguntas de GSM8K y 10 de olimpiada. Diferencias de 1-2 preguntas (4,0-8,0 puntos porcentuales) no son estadisticamente significativas.
- El resultado central (perplejidad inferior al BF16 sin cuantizar) es contraintuitivo y depende de un unico holdout de 131k tokens sin detalles de composicion ni metodo de medida.
- Riesgo de alucinacion: es un modelo destilado de 1,78B; la generacion de cadenas de pensamiento largas puede producir razonamientos plausibles pero incorrectos, especialmente fuera de matematicas.
- Degradacion severa en cuantizaciones agresivas: IQ2_XXS cae a 40,0% en GSM8K con 8,0% de cierre limpio, y IQ2_M baja a 0,0% en olimpiada. No se recomienda bajar de Q4_K_M para tareas de razonamiento.
- Idiomas soportados no declarados. El modelo base Qwen2.5 es multilingue, pero no hay confirmacion de que el proceso de destilacion y cuantizacion conserve ese comportamiento.
- La model card indica 32 GB de VRAM en una "RTX 4080 Super", una configuracion que no corresponde a las especificaciones de fabrica de ese modelo; conviene tratar las cifras de rendimiento con cautela.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de redactar la ficha, sin issues ni discusiones de la comunidad.
- Licencia apache-2.0: permite uso comercial y modificacion, pero conviene verificar las condiciones del modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, del que hereda el linaje.
- El uso en produccion exige evaluar el metodo G-TAP v3 con datos propios; la model card no describe la implementacion ni publica el codigo del pipeline de cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Perfil del autor: https://huggingface.co/DuoNeural
- Repositorio de llama.cpp (runtime documentado para GGUF): no disponible en la informacion proporcionada
- Paper o documentacion tecnica de G-TAP v3: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada
