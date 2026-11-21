# shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB

## Resumen

Inkling-2-Mini-LookAtMyQuant-8.9GB es una cuantizacion extrema del modelo `thinkingmachines/Inkling-2-Mini`, un transformer de tipo Mixture-of-Experts con 26.4B parametros fisicos y 5.4B activos, publicado por el usuario shinmegamiboson mediante el compilador LookAtMyQuant. El resultado comprime los 18.89 GB de pesos nativos en BF16 hasta 8.87 GB, lo que equivale a 2.69 bits por peso, manteniendo el 96.8% del rendimiento del profesor original en una bateria de evaluacion que combina GSM8K, HumanEval y VQA de vision.

La relevancia de esta ficha es doble. Por un lado, demuestra que es posible ejecutar un MoE de 26.4B parametros en memoria unificada de Apple Silicon en torno a 9 GB, con velocidades de decodificacion de hasta 47 tok/s en un M5 Max gracias a un drafter especulativo de 179 MB. Por otro, ilustra una tecnica de cuantizacion consciente de la estructura del MoE: en lugar de aplicar una receta uniforme, asigna presupuestos de bits por capa y por experto segun su sensibilidad KL medida empiricamente.

El modelo conserva las capacidades del original (generacion de texto, razonamiento matematico, codigo y vision si se empareja con la torre visual BF16 de 637 MB), pero este repositorio contiene unicamente el modelo de texto empaquetado. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts con bucle de 3 pasadas (3x-looped MoE) |
| Parametros totales | 26.4B fisicos (24.46B en pesos de expertos + 38.8M de steering nativo + lm_head y escalas lineales) |
| Parametros activos | 5.4B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Trellis hashed block-vector (ht2, ht3), row trellis (rtr1, rtr4) y piso tr2 en el bucket `head.7`; 2.69 bits por peso efectivos |
| Idiomas soportados | Ingles y multilingue (13 idiomas evaluados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquete propietario para el runtime MLX de LookAtMyQuant (no safetensors ni GGUF estandar) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 26.4B parametros fisicos y 5.4B activos, organizado en 24 capas MoE cuyos expertos se visitan 3 veces mediante un esquema de bucle (L6-17 looped 3x), lo que da 48 visitas logicas. El enrutamiento usa sigmoid fijo indexado por pasada. Sobre esta estructura, el autor aplico un proceso de cuantizacion consciente de la sensibilidad: midio la KL por capa y por bucket de experto (con tamanos [16, 16, 32, 64] ordenados por uso) y asigno codigos trellis de 4 KB en SRAM hashed a los bloques mas sensibles, reservando un piso `tr2` para el bucket final del `lm_head` con el fin de preservar los 13 idiomas evaluados.

El ajuste posterior consistio en un QAT proximal sobre todos los pesos de expertos (24.46B), los 38.8M de parametros de steering nativo y las escalas lineales de atencion y `lm_head`, durante 2.400 pasos con 9.83M de tokens frescos, destilando contra el profesor BF16 en linea con Bernoulli-KL sobre las 48 visitas del router. Se aplicaron 3 ciclos completos de proyeccion trellis ponderada por Hessiano sobre las 24 capas y un asentamiento coseno de 600 pasos con learning rate a cero y beta de 5e-4 a 0.03. Las asas de escala se pliegan en el paquete `scales` sin bytes adicionales, con un error relativo maximo de ida y vuelta en disco de 1.67e-3.

## Capacidades

- Generacion de texto conversacional en ingles y multilingue (13 idiomas evaluados).
- Razonamiento matematico: 148/200 en GSM8K, igualando al profesor BF16 (147/200).
- Generacion de codigo: 58/164 problemas resueltos en HumanEval ejecutable.
- Capacidad de vision si se empareja con la torre visual BF16 de 637 MB del modelo original (no incluida en este repositorio).
- Decodificacion especulativa mediante un drafter DSpark de 4 bits de 179 MB, que eleva el throughput hasta 47 tok/s en M5 Max.
- API de streaming en Python (`runtime_mlx.Runtime`) y CLI (`lamq generate`, `lamq chat`).
- Soporte de modo chat con plantilla conversacional.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso con agentes en la informacion disponible.

## Casos de uso

- Asistencia matematica en local: el modelo resuelve problemas de aritmetica y algebra paso a paso (por ejemplo, "17 times 23" o sistemas de ecuaciones lineales) manteniendo el 100% del rendimiento del profesor en GSM8K, lo que lo hace adecuado para tutoria educativa sin conexion.
- Generacion de codigo en portatiles Apple Silicon: con 8.87 GB de pesos y un drafter de 179 MB, cabe en Macs con 16 GB de memoria unificada y permite autocompletar funciones Python (como fusion de intervalos solapados) a 38-47 tok/s.
- Prototipado de agentes conversacionales multilingues: al conservar KL bajo en 13 idiomas, sirve para construir bots de atencion al cliente en varios idiomas sin depender de la nube.
- Investigacion en cuantizacion: el paquete incluye metricas reproducibles (KL libre en en/chat/code, KL agregada en 13 idiomas, Top-1) que permiten comparar recetas de cuantizacion sobre el mismo profesor BF16.
- Evaluacion comparativa de runtimes: al estar empaquetado para MLX, es util para medir latencia y throughput de decodificacion especulativa en hardware Apple frente a alternativas GGUF de Unsloth.
- Despliegue de bajo consumo en estaciones de trabajo: 2.69 bits por peso reduce el ancho de banda de memoria necesario, lo que permite ejecutar un MoE de 26.4B en GPUs consumer con 12-16 GB de VRAM si se porta el runtime.
- Fine-tuning ligero sobre el modelo cuantizado: los pesos de expertos y las escalas estan entrenados con QAT, por lo que admiten ajustes posteriores con el mismo pipeline LookAtMyQuant.

## Benchmarks y rendimiento

Evaluacion sobre el mismo profesor BF16, `openai/gsm8k` (`test[:200]`, greedy, `reasoning_effort="none"`), `openai/openai_humaneval` (164 problemas ejecutables) y ventanas TextMix de 16+13 idiomas. La VQA de vision se puntuo con la torre visual BF16 intacta de 637 MB.

| Modelo | GB texto | `free_KL` (en/chat/code) | Top-1 | `all13_KL` | GSM8K (200) | HumanEval (164) | Pooled vs profesor |
|---|---:|---:|---:|---:|---:|---:|---:|
| Profesor BF16 original | 18.89 | 0.0000 | 100.0% | 0.0000 | 147/200 (73.5%) | 66/164 (40.2%) | 100.0% |
| Base 8.9 GB sin ajustar | 8.87 | 0.0259 | 94.0% | 0.0754 | 143/200 (71.5%) | 60/164 (36.6%) | 95.4% |
| **Este archivo (Tier-3 SQYFR)** | **8.87** | **0.0208** | **95.0%** | **0.0571** | **148/200 (74.0%)** | **58/164 (35.4%)** | **96.8%** |
| Unsloth `UD-Q2_K_XL` | 9.14 | 0.0486 | 92.2% | 0.0811 | 132/200 (66.0%) | 49/164 (29.9%) | 85.3% |
| Unsloth `UD-IQ3_XXS` | 11.66 | 0.0189 | 95.3% | 0.0278 | 148/200 (74.0%) | 68/164 (41.5%) | 101.4% |

Rendimiento de inferencia reportado por el autor: aproximadamente 38 tok/s de mediana y hasta 47 tok/s en M5 Max con el drafter DSpark de 4 bits, ocupando unos 9.0 GB de RAM MLX activa.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 9.0 GB de memoria activa en MLX con el drafter de 179 MB cargado.
- GPU recomendadas: Apple Silicon (M5 Max reportado por el autor como referencia de throughput). No se documentan velocidades para A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, en Macs con memoria unificada de 16 GB o superior; en GPUs dedicadas de 12-16 GB requeriria portar el runtime LookAtMyQuant, que en la informacion disponible solo se distribuye para MLX.
- Opciones de despliegue: runtime `lookatmyquant` (MLX) mediante `pip install git+https://github.com/ShinMegamiBoson/lookatmyquant.git`; CLI `lamq generate` y `lamq chat`; API Python `runtime_mlx.Runtime`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 38 tok/s de mediana y hasta 47 tok/s en M5 Max con decodificacion especulativa; sin drafter no se reporta cifra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (200) | HumanEval (164) | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este archivo (LookAtMyQuant 8.9 GB) | 26.4B / 5.4B activos | no disponible | 148/200 | 58/164 | Apache 2.0 | MLX empaquetado |
| Unsloth `UD-Q2_K_XL` | 26.4B / 5.4B activos | no disponible | 132/200 | 49/164 | Apache 2.0 | GGUF |
| Unsloth `UD-IQ3_XXS` | 26.4B / 5.4B activos | no disponible | 148/200 | 68/164 | Apache 2.0 | GGUF |
| Profesor BF16 original | 26.4B / 5.4B activos | no disponible | 147/200 | 66/164 | Apache 2.0 | safetensors (presumiblemente) |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de benchmarks de modelos alternativos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2.69 bits por peso introduce perdida medible: el KL libre en en/chat/code sube a 0.0208 y el KL agregado en 13 idiomas a 0.0571 frente al profesor BF16.
- HumanEval cae respecto al profesor (58/164 frente a 66/164) y respecto a `UD-IQ3_XXS` (68/164), por lo que no es la mejor opcion para generacion de codigo en produccion.
- El rendimiento multilingue se preserva parcialmente; el autor tuvo que aplicar un piso `tr2` especifico para no degradar los 13 idiomas, lo que sugiere sensibilidad del empaquetado a idiomas no ingleses.
- El formato de pesos es propietario del runtime LookAtMyQuant y no es compatible con ecosistemas estandar (llama.cpp, vLLM, TGI, Ollama), lo que limita el despliegue a Apple Silicon o a un port manual.
- La torre visual no esta incluida; las capacidades de vision requieren descargar aparte los 637 MB BF16 del modelo original.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni limites de contexto en la informacion disponible; se heredan los del modelo base `thinkingmachines/Inkling-2-Mini`.
- La licencia Apache 2.0 permite uso comercial, pero el autor del paquete es un usuario independiente (shinmegamiboson) y no el desarrollador original; conviene verificar la procedencia de los pesos antes de un despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente de los resultados reportados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Drafter DSpark 4-bit: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter
- Repositorio del compilador LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset HumanEval: https://huggingface.co/datasets/openai/openai_humaneval
