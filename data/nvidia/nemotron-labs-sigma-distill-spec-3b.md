# nvidia/Nemotron-Labs-Sigma-distill-spec-3B

## Resumen

Nemotron-Labs-Sigma-distill-spec-3B es un modelo de lenguaje de difusion continua de aproximadamente 3.000 millones de parametros desarrollado por NVIDIA, disenado especificamente para decodificacion autoespeculativa (self-speculative decoding). Se obtiene mediante destilacion por coincidencia de distribuciones por fases (Phased DMD) a partir de un profesor de 3B de la misma familia arquitectonica (MS-SUSReg-3B), seguida de un entrenamiento con objetivo de aceptacion LK ("X25") para aumentar la tasa de aceptacion del borrador de difusion frente a su propia ruta autorregresiva.

A diferencia de sus hermanos `-distill-*`, que se despliegan como muestreadores de difusion por bloques de pocos pasos, este checkpoint combina dos cabezas: una cabeza de difusion que redacta bloques de 32 tokens en una sola llamada y una cabeza autorregresiva que verifica esos tokens. El texto devuelto es exactamente la salida autorregresiva voraz; la aceptacion solo cambia cuantos tokens se confirman por ronda, no cuales. Esto lo convierte en una pieza de infraestructura para acelerar la inferencia de su propia ruta AR, no en un modelo generativo independiente.

La relevancia actual radica en que aborda el cuello de botella de latencia en decodificacion autoregresiva mediante especulacion interna, sin necesidad de un modelo borrador separado. Segun la model card, alcanza aceleraciones de hasta 3,28x sobre su propia decodificacion AR en GSM8K, con una ventana de contexto de 4096 tokens y pesos en bfloat16 para GPU NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de difusion continua con backbone decoder-only (Nemotron-Labs-Sigma), doble cabeza: difusion (borrador) + autorregresiva (verificacion) |
| Parametros totales | 4.236.704.802 (dato de safetensors); la model card indica ~3B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en total (entrada y salida) |
| Tipos de cuantizacion | no disponible (la model card solo menciona bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | NVIDIA Nemotron Open Model License (license: other) |
| Formato de pesos | safetensors (repo de 17,0 GB), con codigo de inferencia propio via `trust_remote_code` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 26 capas, tamano oculto 3072, FFN de 9216, 32 cabezas de consulta y 8 de clave-valor (GQA), dimension de cabeza 128, RMSNorm, activacion SwiGLU y RoPE con escalado YaRN. El espacio de embeddings de tokens es continuo y de 16 dimensiones, y el ruido se modela con un mapa monotonico de Bernstein (Bezier) de grado 32 con extremos gamma aprendidos en [-5,4150, 4,8549]. El modelo incorpora dos cabezas: una de difusion que redacta bloques de 32 tokens en una sola llamada (NFE nativo de 2) y una autorregresiva que verifica y acepta los tokens redactados.

El entrenamiento parte de un profesor de 3B de la familia Sigma con regularizacion SUSReg multiescala (MS-SUSReg-3B), destilado mediante Phased Distribution Matching Distillation (Phased DMD). Posteriormente se aplica un objetivo de aceptacion LK ("X25") que incrementa la aceptacion del borrador: segun la model card, la aceptacion mejora un 14,9 %, 14,1 % y 15,4 % en GSM8K, HumanEval y MBPP respectivamente frente al estudiante Phased-DMD4 previo. El self-conditioning esta desactivado, tanto en entrenamiento como en servicio. El checkpoint corresponde al paso 600 del estudiante (media ponderada uniforme de P34 y P35, 600 actualizaciones cada uno).

## Capacidades

- Generacion de texto en ingles mediante decodificacion autoespeculativa: la cabeza de difusion redacta bloques de 32 tokens y la cabeza AR los verifica.
- Salida identica a la decodificacion autorregresiva voraz del propio modelo: la especulacion no altera la distribucion ni la precision, solo el numero de tokens confirmados por ronda.
- Razonamiento y matematicas (evaluado en GSM8K con cadena de pensamiento).
- Generacion de codigo (evaluado en HumanEval y MBPP).
- Metricas de servicio expuestas via `generate_speculative` con `return_stats=True` (rondas, tokens aceptados, longitud media aceptada).
- Capacidad conversacional segun el pipeline declarado (`text-generation`, tag `conversational`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales: modo de borrador difusion con verificacion AR integrada; sin vision ni audio.

## Casos de uso

- Aceleracion de inferencia en produccion: el modelo se usa como motor de decodificacion especulativa para su propia ruta AR, reduciendo el numero de pasos forward necesarios por token emitido (hasta 3,28x en GSM8K). Es adecuado cuando la latencia por token es el cuello de botella y se dispone de GPU NVIDIA.
- Servicio de generacion de codigo de baja latencia: con HumanEval y MBPP mostrando speedups de 2,61x y longitudes medias aceptadas de 7,90 y 9,21 tokens por ronda, encaja en asistentes de autocompletado o generacion de funciones en IDE.
- Razonamiento matematico interactivo: en GSM8K con CoT la longitud media aceptada es de 10,49 tokens, lo que permite servir cadenas de razonamiento largas con menor coste por token en tutores o verificadores automaticos.
- Chat conversacional en ingles con contexto medio: la ventana de 4096 tokens permite conversaciones multi-turno de extension moderada, con la ventaja de que la salida es determinista respecto a la ruta AR voraz.
- Evaluacion e investigacion en decodificacion especulativa: el checkpoint sirve como referencia reproducible para medir tasas de aceptacion y comparar estrategias de destilacion (Phased DMD, objetivos LK) en entornos de investigacion.
- Backend de inferencia con SGLang: la model card reporta mediciones con SGLang en BF16 sobre una NVIDIA GB200 con una peticion concurrente, lo que lo hace adecuado para despliegues que ya usan ese runtime.
- Generacion de texto por lotes en ingles donde se prioriza throughput sobre flexibilidad multilingue: la naturaleza determinista de la salida facilita la validacion y el cacheo.

## Benchmarks y rendimiento

Los datos de la model card miden longitud media aceptada (AL) por ronda de verificacion, excluyendo el token bonus, y el speedup respecto a la decodificacion AR del propio modelo. No son medidas de precision.

| Benchmark | Prompts | Longitud media aceptada | Speedup sobre AR |
|---|---|---|---|
| GSM8K (CoT) | 1303 | 10,49 | 3,28x |
| HumanEval | 158 | 7,90 | 2,61x |
| MBPP | 499 | 9,21 | 2,61x |
| SPEED-Bench | 703 | 5,25 | 1,98x |

Mediciones con SGLang en BF16 sobre una NVIDIA GB200, una peticion a la vez. La model card advierte que la tarjeta de `distill-spec-8B` reporta AL con token bonus incluido sobre el conjunto completo de prompts, por lo que no son directamente comparables. No se han publicado resultados de benchmarks de precision (MMLU, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,5 GB solo para pesos (4.236.704.802 parametros x 2 bytes), mas overhead de activaciones y cache KV; el repo ocupa 17,0 GB, lo que sugiere que incluye pesos adicionales o duplicados de ambas cabezas.
- GPU recomendadas: NVIDIA GB200 (usada en las mediciones oficiales); cualquier GPU NVIDIA con soporte para bfloat16 y memoria suficiente.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 16 GB o mas (RTX 4080, RTX 4090, RTX 5090), aunque no se confirma en la informacion disponible.
- Inferencia en CPU: no soportada segun la model card.
- Opciones de despliegue: PyTorch >= 2.4 con Hugging Face Transformers >= 4.55 y `trust_remote_code`; SGLang para las mediciones oficiales. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: los speedups reportados (1,98x a 3,28x sobre AR) son la metrica de throughput disponible; no se publican valores absolutos de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-Labs-Sigma-distill-spec-3B | ~3B (4,24B en safetensors) | 4096 | Difusion + AR autoespeculativa | NVIDIA Nemotron Open Model License | Hugging Face |
| Nemotron-Labs-Sigma distill-spec-8B | ~8B (segun referencia de la model card) | no disponible | Difusion + AR autoespeculativa | NVIDIA Nemotron Open Model License | Hugging Face |
| Estudiante Phased-DMD4 (predecesor) | ~3B | no disponible | Difusion por bloques de pocos pasos | no disponible | no disponible |

La comparacion con modelos de la misma categoria fuera de la familia Nemotron-Labs-Sigma no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Ventana de contexto limitada a 4096 tokens en total, insuficiente para documentos largos o conversaciones extensas.
- Requiere ambas cabezas (difusion y autorregresiva); no funciona como un modelo de difusion puro ni como un AR convencional aislado.
- La inferencia en CPU no esta soportada y el codigo requiere `trust_remote_code`, lo que implica ejecutar codigo del repositorio.
- Las metricas publicadas miden throughput (longitud aceptada y speedup), no precision; no hay benchmarks de calidad en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada, pero inherente a los modelos generativos de este tamano.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- La licencia NVIDIA Nemotron Open Model License permite uso comercial y no comercial, pero impone terminos especificos que deben revisarse antes de desplegar en produccion.
- El numero de parametros reportado en safetensors (4,24B) difiere del "~3B" de la model card; conviene verificar el consumo real de memoria antes de dimensionar el hardware.
- Las cifras de speedup se obtuvieron con una sola peticion concurrente en una GB200; el rendimiento en entornos con alta concurrencia puede diferir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Nemotron-Labs-Sigma-distill-spec-3B
- Paper de referencia (arXiv:2610.02665): https://arxiv.org/abs/2610.02665
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- NVIDIA (sitio corporativo): https://www.nvidia.com/
