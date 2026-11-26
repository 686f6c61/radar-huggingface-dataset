# SmallAICreator/TRM-LM-v3-10M

## Resumen
TRM-LM v3 10M es un modelo de lenguaje de 9,82 millones de parametros desarrollado por UltraLabs (SmallAICreator) que introduce un diseno de transformer con bucles en las capas centrales: el mismo bloque de 5 capas se ejecuta `r` veces por token, de modo que el modelo puede "pensar mas tiempo" sin aumentar el numero de pesos. Se ha destilado desde MiniGPT3-22M (mismo tokenizador de 16K) mediante destilacion exacta de logits sobre 30,33B tokens, entrenado en una unica sesion de Kaggle TPU v5e-8 en 8,25 horas.

El modelo es relevante como banco de pruebas para investigacion en modelos pequenos y profundidad recurrente: con solo 5,63M de parametros no-embedding se situa a 1,1 puntos de su profesor (16,5M de parametros cerebrales) en la media de seis tareas, y supera a Pythia-160M y Cerebras-GPT-111M, entre 11 y 16 veces mas grandes. Es un modelo base (continuacion de texto, no chat) con contexto de 1.024 tokens y licencia Apache 2.0.

Su interes practico esta en el despliegue en dispositivo y en la experimentacion con arquitecturas recurrentes, no en tareas de conocimiento fiable: el propio autor advierte de que inventa hechos y puede derivar o repetir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles de profundidad recurrente (prelude 1 bloque, core 5 bloques repetidos r veces, coda 1 bloque) |
| Parametros totales | 9,82M (5,63M no-embedding + 4,19M embedding atado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32 y una build fp16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict fp32 (`trm3_base.pt`), build fp16 single-file `.trm` (formato TRM2) |

Detalles adicionales de arquitectura: pre-norm RMSNorm, atencion causal con RoPE y 4 cabezas, SwiGLU con FF de 704, anchura 256, vocabulario de 16.384 tokens BPE byte-level.

## Arquitectura y entrenamiento
El modelo sigue un esquema de transformer con bucles: una capa de embedding, un bloque de prelude, un nucleo de 5 bloques que se ejecutan `r` veces por token, un bloque de coda y una cabeza de salida atada al embedding. Se entreno con r ∈ {1, 2, 3, 4} con probabilidades 0,1/0,2/0,35/0,35, y el autor recomienda r = 3; con r = 1 el modelo equivale a un transformer plano de 7 capas. No extrapola mas alla de 4 bucles: con r = 6 la perdida se dispara (CE 4,598 frente a 3,451 con r = 3).

El entrenamiento consistio en destilacion de conocimiento desde MiniGPT3-22M (`pretrain-final`, 16,5M de parametros cerebrales) con una funcion de perdida de 0,9 · KL(profesor ‖ estudiante) + 0,1 · CE, sobre 30,33B tokens y 115.714 pasos en una TPU v5e-8 durante 8,25 horas. Los datos proceden de FineWeb-Edu, Cosmopedia y fragmentos de SlimPajama. La perdida retenida tras el entrenamiento es de CE 3,451 y KL 0,307 con r = 3, frente a CE 3,333 del profesor sobre los mismos datos.

## Capacidades
- Generacion y continuacion de texto en ingles; es un modelo base, no un modelo de chat.
- Razonamiento de corto alcance limitado por su tamano (5,6M de parametros cerebrales).
- Ajuste dinamico del esfuerzo de computo por llamada mediante el parametro `loops` (1 a 4): menos bucles = mas rapido, mas bucles = mejor texto.
- Capacidad de destilacion demostrada: replica parte del comportamiento de un profesor mas grande con un tercio de los parametros.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso
- Investigacion en profundidad recurrente: el modelo permite comparar directamente el rendimiento con r = 1, 2, 3 y 4 sobre los mismos pesos, lo que facilita estudios sobre el equilibrio entre computo y calidad en arquitecturas con bucles.
- Destilacion de modelos pequenos: sirve como referencia de estudiante para probar funciones de perdida, tasas de destilacion y esquemas de entrenamiento frente a un profesor de 22M.
- Demos en dispositivo movil: la build fp16 `.trm` esta pensada para la app TRM Chat en Android, con un modelo de menos de 10M de parametros que cabe holgadamente en cualquier telefono.
- Generacion de texto corto y creativo en ingles: continuacion de frases, parrafos breves y ejercicios de escritura donde no se requiere precision factual.
- Educacion y divulgacion: ejemplo didactico de arquitectura transformer con bucles, destilacion y evaluacion con lm-evaluation-harness para cursos y talleres.
- Pruebas de infraestructura de inferencia: por su tamano minimo, es util para validar pipelines de tokenizacion, generacion y evaluacion antes de escalar a modelos mayores.
- Experimentos de eficiencia energetica: permite medir el coste de incrementar bucles frente a incrementar parametros en hardware modesto.

## Benchmarks y rendimiento
Evaluacion zero-shot sobre conjuntos de test/validacion completos. ARC, HellaSwag y PIQA con `acc_norm`; LAMBADA (OpenAI) y WinoGrande con `acc`.

| Modelo | Total / cerebral | ARC-E | ARC-C | HellaSwag | LAMBADA | PIQA | WinoGrande | Media 6 |
|---|---|---|---|---|---|---|---|---|
| TRM-LM v3 10M (r = 3) | 9,8M / 5,6M | 36,11 | 23,12 | 27,17 | 20,26 | 56,53 | 50,83 | 35,67 |
| MiniGPT3-22M (profesor) | 21,8M / 16,5M | 36,28 | 22,27 | 28,84 | 26,30 | 57,89 | 49,17 | 36,79 |
| MiniGPT2-22M | 22,0M / 15,7M | 40,0 | 23,1 | 28,2 | 23,1 | 58,1 | 50,0 | 37,08 |
| Pythia-160M | 160M | 36,41 | 23,12 | 30,30 | 12,25 | 59,79 | 50,75 | 35,44 |
| Cerebras-GPT-111M | 111M | 35,06 | 20,99 | 27,20 | 19,12 | 58,11 | 49,01 | 34,91 |

Perdida retenida tras el entrenamiento segun numero de bucles:

| Bucles r | 1 | 2 | 3 | 4 | 6 |
|---|---|---|---|---|---|
| CE | 3,562 | 3,462 | 3,451 | 3,450 | 4,598 |
| KL al profesor | 0,396 | 0,314 | 0,307 | 0,308 | 1,407 |

Media de 4 tareas (ARC-E, ARC-C, HellaSwag, PIQA): TRM-LM v3 35,73; MiniGPT3 base 36,32. El modelo queda a 1,1 puntos de su profesor con un tercio de los parametros cerebrales y por delante de Pythia-160M y Cerebras-GPT-111M en la media de seis tareas. La mayor brecha con el profesor esta en LAMBADA (20,26 frente a 26,30).

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en fp32 (9,82M de parametros ≈ 39 MB de pesos) y unos 20 MB en fp16; el cuello de botella real es el contexto (1.024 tokens).
- GPU recomendadas: cualquier GPU moderna sirve; el entrenamiento se hizo en TPU v5e-8, pero la inferencia funciona en CPU.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU; tambien en Raspberry Pi y telefonos Android.
- Opciones de despliegue: inferencia nativa con PyTorch usando `modeling_trm2.py` y la libreria `tokenizers`; la build `.trm` para la app TRM Chat Android. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media 6 tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TRM-LM v3 10M | 9,8M (5,6M cerebrales) | 1.024 | 35,67 | Apache 2.0 | Hugging Face |
| MiniGPT3-22M | 21,8M (16,5M cerebrales) | no disponible | 36,79 | no disponible | Hugging Face |
| Pythia-160M | 160M | 2.048 (por defecto en la familia Pythia) | 35,44 | Apache 2.0 | Hugging Face |
| Cerebras-GPT-111M | 111M | 2.048 | 34,91 | Apache 2.0 | Hugging Face |

La ventaja principal de TRM-LM v3 es la relacion calidad/parametros: iguala o supera a modelos 11-16 veces mayores en la media de seis tareas, con un contexto mucho mas corto (1.024 frente a 2.048 tokens) y un rendimiento inferior en LAMBADA.

## Limitaciones y advertencias
- Modelo base de 10M de parametros: genera texto corto fluido pero tiene muy poco conocimiento del mundo fiable.
- Alucinacion frecuente: inventa hechos y puede derivar o repetir; no debe usarse para respuestas que requieran confianza.
- Contexto limitado a 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo ingles; no soporta castellano ni otros idiomas.
- No es un modelo de chat: no tiene ajuste por instrucciones ni RLHF/DPO; el autor planea una version chat.
- No extrapola mas alla de 4 bucles: usar r = 6 o superior degrada gravemente la calidad.
- Licencia Apache 2.0: permite uso comercial, pero sin garantias del autor y con la advertencia explicita de no usarlo para respuestas fiables.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse con FineWeb-Edu, Cosmopedia y SlimPajama, hereda los sesgos de esas fuentes.
- No hay soporte documentado para tool calling, agentes ni integraciones con servidores de inferencia estandar.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/SmallAICreator/TRM-LM-v3-10M
- Profesor MiniGPT3-22M: https://huggingface.co/SmallAICreator/MiniGPT3-22M
- Paper de referencia (arXiv 2606.22189): https://arxiv.org/abs/2606.22189
