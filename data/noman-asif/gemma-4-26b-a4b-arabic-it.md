# noman-asif/Gemma-4-26B-A4B-Arabic-It

## Resumen

Gemma-4-26B-A4B-Arabic-It es un ajuste fino (fine-tuning) del modelo multimodal google/gemma-4-26B-A4B-it, desarrollado por el usuario noman-asif y publicado en Hugging Face bajo licencia Apache 2.0. El objetivo declarado es mejorar el rendimiento en arabe del modelo base sin degradar sus capacidades originales en ingles, mediante un proceso de ajuste supervisado sobre un dataset de razonamiento e instrucciones en arabe (Arabic-Reasoning-Instruct-30k) seguido de una fase de preferencias con DPO (Arabic-Preference-DPO-6k). La model card lo presenta como una "Retention-Safe Release", es decir, una version que supera una prueba de no olvido (zero-forgetting gate) con una puntuacion de 0.9940, frente al fallo del modelo denso de la misma familia.

Arquitectonicamente es un transformer de tipo Mixture of Experts (MoE) con 25.805.936.206 parametros totales (unos 25,8 mil millones) y aproximadamente 3,8 mil millones de parametros activos por token, segun los datos de despliegue de la propia model card. El modelo base es multimodal (etiqueta image-text-to-text), por lo que hereda capacidades de vision y texto, aunque el ajuste fino se centra en texto en arabe e ingles. El repositorio ocupa 51,6 GB en formato safetensors de 16 bits.

Su relevancia actual radica en que aborda uno de los problemas clasicos del ajuste fino multilingue: la perdida de capacidades (catastrofic forgetting) al especializar un modelo en un idioma distinto del original. El autor publica una comparativa con el modelo denso E4B de la misma familia y demuestra que la variante MoE conserva mejor el rendimiento en ingles mientras gana puntos en benchmarks arabes. Ademas, incluye mediciones de servicio concurrente con vLLM sobre una unica A100 de 80 GB, lo que facilita la evaluacion de su viabilidad en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) multimodal, derivado de google/gemma-4-26B-A4B-it; 30 capas, de las cuales 25 usan Sliding Window Attention (SWA) de 1024 tokens con 8 cabezas KV GQA |
| Parametros totales | 25.805.936.206 (aprox. 25,8 mil millones) |
| Parametros activos | Aproximadamente 3,8 mil millones por token |
| Longitud de contexto | No disponible de forma explicita; la ventana de atencion deslizante es de 1024 tokens en 25 de las 30 capas |
| Tipos de cuantizacion | El repositorio publica pesos en 16 bits (safetensors); no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Arabe (ar) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE multimodal con 25,8 mil millones de parametros totales y unos 3,8 mil millones activos por token. La model card detalla que 25 de sus 30 capas emplean Sliding Window Attention con una ventana de 1024 tokens y 8 cabezas KV con GQA (Grouped Query Attention), lo que reduce drasticamente el coste de la cache KV y permite servir a decenas de usuarios concurrentes en una sola GPU. Hereda del modelo base de Google la capacidad de procesar imagen y texto (pipeline image-text-to-text), aunque el ajuste se orienta a generacion de texto conversacional.

El entrenamiento se realizo en dos fases sobre el modelo google/gemma-4-26B-A4B-it: primero un ajuste supervisado con el dataset noman-asif/Arabic-Reasoning-Instruct-30k, orientado a razonamiento e instrucciones en arabe, y despues una fase de optimizacion de preferencias con DPO usando noman-asif/Arabic-Preference-DPO-6k. La innovacion principal no esta en la arquitectura sino en la metodologia de retencion: el autor evalua el modelo contra anclas oficiales de Gemma 4 en modo thinking y define una "zero-forgetting gate" que el modelo MoE supera (0.9940) mientras que el denso E4B falla (0.8430). No se especifica el numero total de tokens de entrenamiento ni la composicion detallada del dataset mas alla de los nombres y tamanos indicados.

## Capacidades

- Generacion de texto conversacional en arabe e ingles, con enfasis en instrucciones y razonamiento en arabe.
- Razonamiento de multiples pasos en modo thinking, heredado del modelo base (las anclas de retencion se miden con Thinking Mode ON).
- Capacidades multimodales de entrada imagen-texto heredadas del modelo base Gemma 4.
- Generacion de codigo y resolucion de problemas de competicion matematica, evaluadas en las anclas oficiales (LiveCodeBench-v6 y AIME-2026).
- Razonamiento cientifico de nivel graduado, medido con GPQA-Diamond.
- Soporte de conversaciones multi-turno con contexto gestionado mediante atencion deslizante.
- Capacidades multilingues limitadas a arabe e ingles segun la model card.
- No se documenta explicitamente soporte de tool calling, function calling ni uso como agente, aunque el modelo base podria heredarlo; no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en arabe: el modelo puede gestionar conversaciones multi-turno con contexto largo y servir a decenas de usuarios concurrentes en una sola A100 de 80 GB, con 43,7 tokens/s por usuario a 50 usuarios simultaneos y un TTFT mediano de 1138,6 ms.
- Asistentes de razonamiento en arabe: gracias a su modo thinking y a la mejora en MadinahQA (+2,22 puntos) y ArabicMMLU (+0,30), es adecuado para tareas de pregunta-respuesta compleja y explicaciones paso a paso en arabe.
- Generacion de codigo en entornos bilingues: mantiene el rendimiento en LiveCodeBench-v6 (73,14 %) y puede integrarse en pipelines de desarrollo para asistencia de codigo con comentarios y documentacion en arabe.
- Analisis de documentos legales y profesionales en arabe: con un 90,29 % en MMMLU-Ar-Law-Prof, es util para resumen y extraccion de informacion en dominios juridicos.
- Tutoria educativa en arabe: los resultados en EXAMS-AR (59,96 %) y AlGhafa (77,41 %) lo hacen viable para plataformas de aprendizaje y generacion de material didactico.
- Procesamiento de imagenes con texto en arabe: al heredar la modalidad image-text-to-text del modelo base, puede emplearse en extraccion de informacion de capturas, formularios o documentos escaneados.
- Despliegue en produccion con vLLM: la model card documenta su integracion con PagedAttention y continuous batching, lo que permite servir a 30-50 usuarios concurrentes con un solo nodo A100 80 GB sin tensor parallelism.

## Benchmarks y rendimiento

Resultados de la model card en benchmarks arabes (OALL v2), comparando el modelo base con el ajustado:

| Benchmark | Metrica | Shots | Base (%) | Ajustado (%) | Ganancia (pts) |
|---|---|---|---|---|---|
| ArabicMMLU | acc_norm | 0 | 76,51 | 76,81 | +0,30 |
| MadinahQA | acc_norm | 0 | 65,98 | 68,20 | +2,22 |
| AlGhafa | acc_norm | 0 | 76,92 | 77,41 | +0,49 |
| ACVA | acc_norm | 5 | 81,82 | 81,81 | -0,01 |
| EXAMS-AR | acc_norm | 0 | 59,96 | 59,96 | +0,00 |
| AraTrust | acc_norm | 0 | 91,65 | 91,69 | +0,04 |
| MMLU-ProX-Ar | exact_match | 5 | 75,17 | 75,34 | +0,17 |
| MMMLU-Ar-STEM | accuracy | 0 | 86,67 | 85,24 | -1,43 |
| MMMLU-Ar-Law-Prof | accuracy | 0 | 90,04 | 90,29 | +0,25 |

Anclas oficiales de retencion de Gemma 4 (Thinking Mode ON):

| Ancla | Dominio | Shots | Base (%) | Ajustado (%) | Delta (pts) |
|---|---|---|---|---|---|
| MMLU-Pro | razonamiento en ingles | 5 | 79,44 | 78,96 | -0,48 |
| GPQA-Diamond | razonamiento cientifico | 0 | 79,29 | 83,33 | +4,04 |
| AIME-2026 | matematicas de competicion | 0 | 89,17 | 91,67 | +2,50 |
| LiveCodeBench-v6 | generacion de codigo | 0 | 73,14 | 73,14 | +0,00 |

Rendimiento de servicio con vLLM en 1x A100 80 GB (512 tokens de prompt, 256 de generacion, bfloat16):

| Usuarios concurrentes | TTFT mediano (ms) | Tokens/s por usuario | Throughput total (tok/s) | VRAM total (GB) |
|---|---|---|---|---|
| 1 | 48,0 | 115,8 | 115,8 | 49,9 |
| 10 | 257,4 | 67,7 | 676,5 | 51,5 |
| 30 | 698,8 | 53,8 | 1613,7 | 55,1 |
| 40 | 911,8 | 60,4 | 2414,9 | 56,9 |
| 50 | 1138,6 | 43,7 | 2183,4 | 58,7 |

## Requisitos de hardware

- VRAM para inferencia: los pesos en bf16 ocupan 48,1 GB; con cache KV y runtime, el modelo necesita unos 49,9 GB para un solo usuario y 58,7 GB para 50 usuarios concurrentes.
- GPU recomendadas: NVIDIA A100 80 GB (validada en la model card); H100 80 GB seria compatible por capacidad; no se documentan pruebas en GPUs de menor memoria.
- No cabe en GPUs de consumo con 24 GB (RTX 4090) ni en configuraciones de 48 GB en bf16 sin cuantizacion adicional, que no se distribuye en el repositorio.
- Opciones de despliegue: vLLM con PagedAttention y continuous batching (documentado), transformers (libreria declarada) y endpoints compatibles (tag endpoints_compatible). No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT mediano de 48,0 ms con un usuario y 1138,6 ms con 50; velocidad por usuario de 115,8 tokens/s con un usuario y 43,7 tokens/s con 50; throughput agregado de hasta 2414,9 tokens/s con 40 usuarios.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-Arabic-It | 25,8 B | ~3,8 B | No disponible (SWA 1024 en 25/30 capas) | Apache 2.0 | Ajuste en arabe con DPO; gate de retencion superado (0.9940) |
| Gemma-4-E4B-Arabic-It | ~4,0 B activos | ~4,0 B (denso) | No disponible | Apache 2.0 | Misma familia y ajuste; gate de retencion fallido (0.8430); menor VRAM (14,9 GB) |
| google/gemma-4-26B-A4B-it | 25,8 B | ~3,8 B | No disponible | Apache 2.0 | Modelo base sin ajuste en arabe; referencia de las anclas de retencion |

## Limitaciones y advertencias

- El ajuste en arabe produce retrocesos medibles en algunos benchmarks: -1,43 puntos en MMMLU-Ar-STEM y -0,48 en MMLU-Pro, lo que indica cierta perdida de rendimiento en STEM y razonamiento en ingles.
- Los resultados en ACVA y EXAMS-AR no mejoran o empeoran ligeramente (-0,01 y 0,00 puntos), por lo que la ganancia en arabe no es uniforme entre dominios.
- El modelo solo declara soporte de arabe e ingles; otros idiomas no estan cubiertos ni evaluados.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas de alucinacion ni evaluaciones de factualidad.
- No se documentan sesgos conocidos ni evaluaciones de seguridad o toxicidad en la model card.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base de Google y de los datasets utilizados.
- El repositorio no incluye pesos cuantizados, lo que limita el despliegue en hardware de menos de 48 GB de VRAM.
- El modelo esta etiquetado como multimodal, pero el ajuste y las evaluaciones publicadas son exclusivamente de texto; el rendimiento en vision tras el fine-tuning no esta documentado.
- La fecha de creacion del repositorio (2026-11-02) y las referencias a AIME-2026 deben tratarse con cautela como datos de la model card del autor.

## Enlaces

- Hugging Face: https://huggingface.co/noman-asif/Gemma-4-26B-A4B-Arabic-It
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Dataset de instrucciones: https://huggingface.co/datasets/noman-asif/Arabic-Reasoning-Instruct-30k
- Dataset de preferencias: https://huggingface.co/datasets/noman-asif/Arabic-Preference-DPO-6k
