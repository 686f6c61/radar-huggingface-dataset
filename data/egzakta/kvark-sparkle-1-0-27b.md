# Egzakta/Kvark-Sparkle-1.0-27B

## Resumen

Kvark-Sparkle-1.0-27B es un ajuste fino (finetune) del modelo Qwen3.8-27B desarrollado por Egzakta, orientado a lo que el autor denomina "efficient-reasoning": mantener la precision del modelo base reduciendo de forma drastica el numero de tokens de razonamiento generados. El modelo conserva la arquitectura original de Qwen3.8-27B, un transformer hibrido de 64 capas (48 de atencion lineal y 16 de atencion completa) con 27.356 millones de parametros, un vocabulario de 248.320 tokens y una ventana de contexto nativa de 262.144 tokens.

La propuesta de valor es el ahorro computacional en inferencia: segun los datos del autor, el modelo responde en aproximadamente la mitad de tiempo que Qwen3.8-27B (13,7 s frente a 28,1 s de mediana) con una precision practicamente identica en los benchmarks declarados. Esto lo hace interesante para despliegues en produccion donde el coste por consulta y la latencia importan tanto como la calidad de la respuesta.

El modelo incluye una cabeza MTP (multi-token prediction) heredada del modelo base, utilizada para decodificacion especulativa, y un codificador de vision de 27 capas, por lo que se distribuye con pipeline `image-text-to-text`. La licencia es Apache 2.0 y los pesos estan disponibles en BF16, FP8 y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (Qwen3.8-27B sin cambios): 64 capas, 48 de atencion lineal y 16 de atencion completa |
| Parametros totales | 27.356.728.560 (27,8B en BF16) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens nativos; evaluado hasta 64k |
| Tipos de cuantizacion | BF16, FP8, GGUF (Q8_0 hasta IQ4_XS) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 y FP8), GGUF |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura de Qwen3.8-27B sin modificaciones: 64 capas, de las cuales 48 emplean atencion lineal y 16 atencion completa con 24 cabezas de consulta, 4 cabezas clave-valor y dimension de cabeza 256. El tamano oculto es de 5.120 y el vocabulario de 248.320 tokens. La cache KV solo se almacena en las 16 capas de atencion completa, con un coste de 64 KiB por token en BF16 y 32 KiB en FP8. Incorpora una capa MTP (multi-token prediction) heredada del modelo base que se usa para decodificacion especulativa, y un codificador de vision de 27 capas.

Los datos de entrenamiento declarados en la model card son los conjuntos DeepMath-103K, IF_multi_constraints_upto5, SuperGPQA y LiveCodeBench (code_generation_lite). No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; el autor tampoco detalla el metodo concreto de ajuste mas alla de la etiqueta "efficient-reasoning". La innovacion principal es el recorte de tokens de razonamiento: segun los datos del autor, la mediana de tokens de razonamiento cae un 60% en GPQA Diamond, y de forma aun mas acusada en AIME y LiveCodeBench, manteniendo la precision dentro de los intervalos de confianza del modelo base.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking", con cadenas de razonamiento mas cortas que el modelo base.
- Razonamiento matematico y cientifico de nivel avanzado (evaluado en AIME, GPQA Diamond y MMLU-Pro).
- Generacion de codigo (evaluado en LiveCodeBench con pass@1).
- Seguimiento de instrucciones estrictas (IFEval, con precision a nivel de prompt).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`, codificador de vision de 27 capas).
- Decodificacion especulativa mediante la cabeza MTP integrada.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se especifica en la informacion disponible soporte explicito de tool calling, function calling o flujos de agente multi-paso.

## Casos de uso

- Razonamiento cientifico asistido: el modelo puede resolver preguntas de nivel posgrado en fisica, quimica y biologia (89,3% en GPQA Diamond) con una mediana de unos 3.100 tokens de razonamiento, lo que reduce el coste por consulta frente al modelo base.
- Generacion de codigo en produccion: con 82,7% de pass@1 en LiveCodeBench, es adecuado para asistentes de programacion y pipelines de revision de codigo donde la latencia importa; la variante FP8 y los GGUF permiten desplegarlo en infraestructura modesta.
- Analisis de documentos con imagenes: al aceptar entrada image-text-to-text, sirve para extraer y razonar sobre contenido de capturas, diagramas o documentos escaneados combinados con texto.
- Evaluacion matematica automatizada: util para tutoria o correccion de problemas de competicion (93,3% en AIME) con respuestas mas rapidas que el modelo base.
- Sistemas de respuesta con instrucciones estrictas: el 91,3% en IFEval lo hace apto para generacion de informes o respuestas con formato fijo y restricciones multiples.
- Despliegue en local con llama.cpp: la variante GGUF (desde IQ4_XS, 15,3 GB) permite ejecutar el modelo en estaciones de trabajo con GPU de consumo, segun el propio autor, que usa esta variante en su demo.
- Servicio de inferencia de alto rendimiento: la variante FP8 (29 GB) esta pensada para vLLM, con decodificacion especulativa via MTP para aumentar el throughput.

## Benchmarks y rendimiento

Datos declarados por el autor (FP8, thinking on, tope de 64k tokens, temperatura 1.0, top_p 0.95, top_k 20; diferencias pareadas con intervalos bootstrap del 95%). La columna "Qwen" corresponde a Qwen3.8-27B.

| Benchmark | Precision Sparkle (%) | Precision Qwen (%) | Diferencia | Tokens razonamiento (mediana) Sparkle | Tokens razonamiento (mediana) Qwen |
|---|---|---|---|---|---|
| GPQA Diamond (198 items x 5 seeds) | 89,3 | 89,4 | −0,1 [−1,9; +1,8] | 3.122 | 7.854 |
| AIME (2025 y 2026, 60 problemas x 5 seeds) | 93,3 | 94,0 | −0,7 [−3,3; +2,0] | 5.502 | 14.318 |
| LiveCodeBench (pass@1, subconjunto reciente de 50 problemas, 3 seeds) | 82,7 | 77,3 | no disponible | 6.664 | 19.950 |
| IFEval (precision estricta a nivel de prompt) | 91,3 | 92,4 | no disponible | 470 | 714 |
| MMLU-Pro (subconjunto de 980 items) | 83,3 | 84,0 | no disponible | 429 | 727 |

Segun el autor, la mediana de tiempo de respuesta es de 13,7 s frente a 28,1 s de Qwen3.8-27B. Los resultados no estan verificados de forma independiente (campo `verified: false` en el model-index).

## Requisitos de hardware

- Pesos BF16: repositorio de 55,6 GB (52 GB segun la model card); requiere al menos 2 GPU de 40 GB o una de 80 GB para inferencia comoda.
- Pesos FP8: 29 GB, pensados para vLLM; cabe en una GPU de 40 GB (A100 40GB, L40S) o en una RTX 4090 de 24 GB solo con cuantizacion adicional.
- GGUF: desde 15,3 GB (IQ4_XS) hasta 29,0 GB (Q8_0); la variante IQ4_XS cabe en GPU de consumo con 16-24 GB de VRAM (RTX 4080, 4090) o en configuraciones CPU+GPU con llama.cpp.
- Cache KV: 64 KiB por token en BF16 y 32 KiB en FP8, solo en las 16 capas de atencion completa; con contexto de 64k esto supone aproximadamente 4 GiB (BF16) o 2 GiB (FP8) adicionales.
- Opciones de despliegue: transformers, vLLM (FP8), llama.cpp (GGUF, usado en la demo oficial).
- Latencia y throughput: el autor reporta una mediana de 13,7 s por respuesta frente a 28,1 s del modelo base; no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (benchmarks clave) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kvark-Sparkle-1.0-27B | 27,8B | 262.144 | GPQA 89,3; AIME 93,3; LiveCodeBench 82,7; IFEval 91,3; MMLU-Pro 83,3 | Apache 2.0 | HF: BF16, FP8, GGUF |
| Qwen3.8-27B (modelo base) | 27,8B | 262.144 | GPQA 89,4; AIME 94,0; LiveCodeBench 77,3; IFEval 92,4; MMLU-Pro 84,0 | Apache 2.0 | HF |
| Otros modelos de ~27B de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de terceros no esta disponible en la informacion proporcionada; el unico contraste documentado es con el modelo base, donde Sparkle intercambia decimas de precision por una reduccion de entre el 60% y el 70% en tokens de razonamiento y aproximadamente la mitad del tiempo de respuesta.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta documentado.
- Los benchmarks son autodeclarados y no verificados de forma independiente (`verified: false`); las diferencias frente al modelo base son pequenas y en algunos casos los intervalos de confianza cruzan cero.
- El recorte de tokens de razonamiento puede degradar tareas que requieran cadenas de razonamiento muy largas; el autor reporta 9 de 34 casos que alcanzan el tope de 64k tokens en GPQA Diamond.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- No se especifica soporte de tool calling ni de flujos de agente; conviene validarlo antes de usarlo en pipelines automatizados.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo deriva de Qwen3.8-27B y conviene revisar las condiciones del modelo base.
- El modelo es reciente (creado en octubre de 2026) y con pocas descargas (76), por lo que la validacion comunitaria es escasa.

## Enlaces

- HuggingFace (BF16): https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B
- HuggingFace (FP8, vLLM): https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B-FP8
- HuggingFace (GGUF, llama.cpp): https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B-GGUF
- Demo en Spaces: https://huggingface.co/spaces/Egzakta/KVARK-Sparkle-Demo
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
