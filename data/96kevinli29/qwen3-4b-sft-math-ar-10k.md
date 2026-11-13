# 96kevinli29/Qwen3-4B-SFT-Math-ar-10k

## Resumen

Qwen3-4B-SFT-Math-ar-10k es un ajuste fino supervisado (SFT) de Qwen/Qwen3-4B sobre 9.347 trazas largas de razonamiento matematico en arabe, traducidas automaticamente desde las trazas en ingles del dataset OpenR1-Math-220k. Lo publica el autor 96kevinli29 junto con la comunidad Sea-Fill, y no esta pensado como modelo de proposito general, sino como checkpoint de control experimental del articulo "What Does Post-Training Change in Multilingual Reasoning?" (arXiv:2609.37104). La pregunta que responde es si entrenar en un solo idioma mejora el razonamiento en ese idioma frente a entrenar en seis idiomas simultaneamente.

El modelo parte de la arquitectura Qwen3-4B (transformer causal denso) y conserva su plantilla de chat con modo thinking, de modo que el razonamiento queda encerrado entre las etiquetas `<think>` y `</think>`. El ajuste es de parametros completos, no de adaptadores, con perdida de entropia cruzada a nivel de token sobre la respuesta completa, incluida la cadena de pensamiento. El checkpoint liberado corresponde a la epoca 1 de las 2 configuradas.

Su relevancia es acotada pero clara: sirve como referencia reproducible para estudiar como el post-entrenamiento monolingue afecta a la capacidad de razonamiento matematico y a la fidelidad idiomatica de la respuesta. No es un modelo recomendado para produccion general; el propio autor remite al modelo multilingue de seis idiomas como base para construir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), con modo thinking nativo |
| Parametros totales | 4.411.424.256 (4,41 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 24.576 tokens en entrenamiento e inferencia; la ventana nativa de Qwen3-4B no se detalla en la informacion disponible |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en bfloat16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | arabe (entrenamiento y evaluacion); evaluado tambien en ingles; el resto de idiomas no se ha evaluado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste de parametros completos de Qwen3-4B, un transformer causal denso con atencion por cabezas de consulta agrupadas (GQA) y plantilla de chat con modo thinking. El entrenamiento usa el objetivo de entropia cruzada a nivel de token sobre toda la respuesta, razonamiento incluido, con optimizador AdamW, learning rate de 2e-5 con decaimiento coseno hasta 0,1x, warmup ratio de 0,01, weight decay de 0,1 y recorte de gradiente de 1,0. El lote es de 4 trazas con contexto de hasta 24.576 tokens, en precision bfloat16. Se ejecuto sobre 4 x A100-40GB en un nodo de MeluXina (LuxProvide) con el trainer SFT de verl, usando FSDP y ajuste de parametros completos.

Los datos son 9.347 soluciones de matematicas de competicion con cadena de pensamiento larga, escritas en arabe y traducidas automaticamente desde el ingles de OpenR1-Math-220k. Se configuraron 2 epocas pero solo se libera la epoca 1. No se documenta en la informacion disponible el uso de RLHF, DPO ni decodificacion especulativa; el modelo es puramente SFT. La innovacion metodologica no esta en la arquitectura, sino en el diseno experimental: este checkpoint es uno de los seis controles monolingues (en, zh, es, fr, ru, ar) que se comparan contra un modelo SFT multilingue de seis idiomas sobre el mismo conjunto de problemas.

## Capacidades

- Generacion de texto y razonamiento matematico de competicion en arabe mediante cadenas de pensamiento largas dentro de `<think> ... </think>`.
- Resolucion de problemas tipo AIME y AMC, con presupuesto de hasta 24.576 tokens de generacion.
- Razonamiento en ingles heredado del modelo base, aunque el ajuste se centro en arabe.
- Soporte de conversacion multi-turno a traves de la plantilla de chat de Qwen3.
- Modo thinking activable mediante la plantilla de chat de Qwen3.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes, vision, audio ni otras modalidades.
- Capacidad multilingue limitada: solo se ha evaluado en arabe e ingles; el resto de idiomas no esta caracterizado.

## Casos de uso

- Investigacion sobre post-entrenamiento multilingue: el modelo actua como control monolingue en el diseno experimental del articulo arXiv:2609.37104, permitiendo aislar el efecto de entrenar en un solo idioma frente a seis.
- Evaluacion de fidelidad idiomatica: util para medir si el razonamiento visible se mantiene en arabe (99,8% de las respuestas en la evaluacion) y como afecta a la tasa de finalizacion de la respuesta.
- Reproduccion de resultados academicos: el checkpoint y el dataset de evaluacion Multilingual-Math-Reasoning-Eval permiten replicar la tabla de resultados del paper con 70 problemas y 16 muestras por problema.
- Estudio de bucles de repeticion: dado que el 34,2% de las respuestas en arabe no terminan, sirve como caso de analisis de fallos de generacion en cadenas de pensamiento largas.
- Generacion de soluciones matematicas en arabe para conjuntos de datos educativos, con revision humana obligatoria por la tasa de no finalizacion.
- Punto de partida para ajustes posteriores en arabe: al ser un checkpoint Apache 2.0 de parametros completos, puede servir de base para SFT o DPO adicionales en ese idioma.
- Pruebas de pipelines de inferencia con contexto largo: su presupuesto de 24.576 tokens lo hace util para validar configuraciones de vLLM o TGI con ventanas extensas.

## Benchmarks y rendimiento

Evaluacion sobre 70 problemas de competicion (30 de AIME-2026 y 40 de AMC-2023) por idioma, 16 muestras por problema, temperatura 0,7 y presupuesto de 24.576 tokens. Una respuesta se considera entregada (J) cuando es correcta (C), esta en el idioma solicitado (L) y termina (T).

| Idioma | Correcto | En idioma | Sin terminar | J@1 | J@16 | J@1 Qwen3-4B publicado | J@1 SFT multilingue |
|---|---|---|---|---|---|---|---|
| Ingles | 69,5% | 100,0% | 9,1% | 69,3% | 90,0% | 80,4% | 71,7% |
| Arabe | 53,2% | 99,8% | 34,2% | 51,0% | 82,9% | 0,0% | 53,6% |

El dato mas relevante es el J@1 de 0,0% del Qwen3-4B original en arabe, que refleja que el modelo base no produce razonamiento en ese idioma de forma fiable; el SFT monolingue lo eleva al 51,0%, ligeramente por debajo del 53,6% del modelo multilingue de seis idiomas. En ingles, en cambio, el SFT monolingue en arabe rinde peor (69,3%) que el multilingue (71,7%) y muy por debajo del modelo publicado (80,4%), lo que sugiere cierto olvido o desplazamiento de la capacidad original en ingles.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 8,8 GB solo para pesos, mas cache KV y activaciones; en la practica, entre 12 y 16 GB para inferencia con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,5-5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB (estimaciones teoricas, no se publican variantes cuantizadas).
- GPU recomendadas para el ajuste original: 4 x A100-40GB en un nodo, con FSDP y parametros completos.
- GPU para inferencia: cabe en GPUs de consumo como RTX 4090 (24 GB) en bfloat16 y en RTX 3090/4080 (16-24 GB) con contexto reducido; en 4 bits cabria en GPUs de 8 GB.
- Opciones de despliegue: transformers 4.x y 5.x (soporte declarado), text-generation-inference (tag `text-generation-inference`), endpoints compatibles de Hugging Face y, previsiblemente, vLLM y llama.cpp/Ollama si se generan pesos GGUF, aunque no se publican en el repo.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste practico es alto porque el presupuesto de generacion por defecto es de 24.576 tokens y el 34,2% de las respuestas en arabe no terminan, lo que dispara el tiempo de inferencia en el peor caso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | J@1 arabe | J@1 ingles | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-4B-SFT-Math-ar-10k (este) | 4,41 B | 24.576 | 51,0% | 69,3% | Apache 2.0 | Hugging Face |
| Qwen3-4B-SFT-Math-Multilingual | 4,41 B (base Qwen3-4B) | 24.576 | 53,6% | 71,7% | Apache 2.0 (segun modelo base) | Hugging Face |
| Qwen/Qwen3-4B (publicado) | 4,41 B | no disponible en la informacion | 0,0% | 80,4% | Apache 2.0 | Hugging Face |

La comparativa se limita a los tres modelos evaluados en el mismo conjunto de problemas y con la misma metrica J. Frente al multilingue, el monolingue en arabe pierde 2,6 puntos en arabe y 2,4 en ingles con J@1, aunque su J@16 en ingles es superior (90,0% frente a 90,0% del multilingue, mismo valor). Frente al Qwen3-4B publicado, gana toda la capacidad en arabe a costa de 11,1 puntos en ingles. No se dispone de comparaciones con otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint de control experimental: una sola semilla, un solo idioma, solo matematicas y datos de entrenamiento traducidos automaticamente, con posible ruido de traduccion.
- Tasa elevada de respuestas que no terminan en arabe (34,2%), por bucles de repeticion en problemas largos; el propio autor lo senala como limitacion compartida con el modelo multilingue.
- Rendimiento en ingles degradado respecto al Qwen3-4B original (69,3% frente a 80,4% en J@1), indicativo de desplazamiento de capacidad.
- Solo evaluado en arabe e ingles; no hay datos de otros idiomas, por lo que su comportamiento fuera de esos dos es desconocido.
- No se documentan sesgos especificos, pero al derivar de Qwen3-4B y de traducciones automaticas hereda los sesgos del modelo base y los del proceso de traduccion.
- Riesgo de alucinacion en razonamiento matematico: la cadena de pensamiento puede ser plausible y aun asi llevar a una respuesta incorrecta (solo el 53,2% de las respuestas en arabe son correctas).
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado para produccion y carece de garantias de calidad fuera del dominio matematico evaluado.
- No se publican pesos cuantizados, por lo que el despliegue en hardware limitado requiere cuantizar por cuenta propia.
- El numero de descargas y likes es 0 en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-ar-10k
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Modelo multilingue de referencia: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-Multilingual
- Controles monolingues: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-en-10k, https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-zh-10k, https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-es-10k, https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-fr-10k, https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-ru-10k, https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-en-43k
- Dataset de entrenamiento: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset de evaluacion: https://huggingface.co/datasets/96kevinli29/Multilingual-Math-Reasoning-Eval
- Articulo: https://arxiv.org/abs/2609.37104
- Framework de entrenamiento (verl): https://github.com/volcengine/verl
- Comunidad mantenedora: https://huggingface.co/SeaFill2025
