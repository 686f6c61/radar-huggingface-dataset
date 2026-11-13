# 96kevinli29/Qwen3-4B-SFT-Math-es-10k

## Resumen

Qwen3-4B-SFT-Math-es-10k es un ajuste fino supervisado (SFT) de Qwen3-4B, el modelo denso de 4.000 millones de parametros de la familia Qwen3 de Alibaba. Lo publica el equipo de Hongyang Li junto con la comunidad Sea-Fill, y su proposito no es el de un modelo de produccion generalista, sino el de un checkpoint de control experimental: sirve para medir si entrenar el razonamiento matematico en un solo idioma (castellano) rinde mejor o peor que entrenarlo simultaneamente en seis idiomas.

El modelo parte de Qwen3-4B y se ajusta con 9.491 trazas largas de chain-of-thought matematico en castellano, traducidas automaticamente desde las trazas en ingles del dataset OpenR1-Math-220k. Se libera el checkpoint de la primera epoca de un entrenamiento configurado a tres epocas, con ajuste completo de parametros (no LoRA) sobre 4 x A100-40GB usando el trainer SFT de verl con FSDP.

Es relevante ahora porque acompana al articulo *What Does Post-Training Change in Multilingual Reasoning?* (arXiv:2609.37104), que estudia como el post-entrenamiento afecta a la capacidad de razonar en lenguas distintas del ingles. Para un desarrollador hispanohablante, ademas, ofrece un punto de partida concreto para experimentar con razonamiento matematico en castellano con un modelo de 4B que cabe en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal (familia Qwen3), con modo de razonamiento explicito |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en entrenamiento; el modelo base Qwen3-4B soporta hasta 32.768 tokens nativos (ventana mayor no confirmada en esta ficha) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors en bfloat16, admite cuantizacion estandar a 8 y 4 bits via herramientas de la comunidad (no verificada por el autor) |
| Idiomas soportados | es (castellano); evaluado en es y en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,8 GB) |

## Arquitectura y entrenamiento

La base es Qwen3-4B, un transformer denso causal con atencion por cabezas agrupadas (GQA) y plantilla de chat propia que permite activar o desactivar el modo de pensamiento. El ajuste no modifica la arquitectura: se aplica un SFT de parametros completos con objetivo de entropia cruzada a nivel de token sobre la respuesta entera, incluyendo la traza de razonamiento. El optimizador es AdamW con learning rate 2e-5 y decaimiento coseno hasta 0,1x, warmup del 1 %, weight decay 0,1, batch de 4 trazas y contexto de hasta 32.768 tokens, en bfloat16 con recorte de gradiente a 1,0. Se ejecuto sobre 4 x A100-40GB en un nodo de MeluXina (LuxProvide) con el trainer SFT de verl y FSDP.

El dataset son 9.491 soluciones de matematicas con cadena de pensamiento larga, originalmente en ingles en OpenR1-Math-220k y traducidas al castellano de forma automatica. Se configuraron 3 epocas y solo se publica la primera. No hay datos de RLHF ni DPO: es exclusivamente SFT. La innovacion tecnica del release no esta en el modelo sino en el diseno experimental: junto a este checkpoint se publican controles equivalentes en ingles, chino, frances, arabe, ruso y un control en ingles con 43K ejemplos, lo que permite aislar el efecto del idioma y del volumen de datos.

## Capacidades

- Generacion de texto y razonamiento matematico con cadena de pensamiento larga en castellano, con la traza visible dentro de las etiquetas `<think> ... </think>`.
- Resolucion de problemas de competicion (AIME, AMC) mediante razonamiento multi-paso.
- Generacion de codigo y matematicas basicas heredadas del modelo base, aunque el ajuste se centra en matematicas.
- Soporte de conversacion multi-turno mediante la plantilla de chat de Qwen3.
- Capacidad multilingue residual del modelo base (Qwen3-4B es multilingue), aunque el ajuste esta disenado y evaluado para castellano.
- No se documenta soporte de tool calling ni function calling especifico en este checkpoint; debe asumirse el del modelo base, no verificado por el autor.
- No se documenta capacidad de vision ni de audio.

## Casos de uso

- Investigacion sobre razonamiento multilingue: usar este checkpoint como control frente al modelo multilingue del mismo equipo sobre el mismo benchmark, para medir la penalizacion o la ganancia de entrenar en un solo idioma.
- Tutoria matematica en castellano: el modelo genera explicaciones paso a paso en castellano, lo que lo hace util para prototipos de asistente educativo que necesiten mostrar el razonamiento y no solo la respuesta.
- Generacion de datos sinteticos de razonamiento en castellano: sus trazas pueden servir para aumentar datasets de matematicas en castellano antes de entrenar modelos mayores.
- Evaluacion de la calidad de traduccion automatica de trazas: comparar su rendimiento con el control en ingles permite estimar cuanto se pierde al traducir datos de entrenamiento.
- Prototipado en hardware de consumo: con 4,4B de parametros, es viable en una GPU de 24 GB o en cuantizacion de 4 bits en GPUs de 8-12 GB para pruebas de concepto de razonamiento matematico.
- Reproduccion de experimentos academicos: al publicarse los seis controles y el dataset de evaluacion, permite replicar el estudio de arXiv:2609.37104 con un coste de computo moderado.

## Benchmarks y rendimiento

Resultados sobre 70 problemas de competicion (30 de AIME-2026 y 40 de AMC-2023) del dataset Multilingual-Math-Reasoning-Eval, con 16 muestras por problema a temperatura 0,7 y presupuesto de 24.576 tokens. La metrica J exige respuesta correcta, razonamiento en el idioma solicitado y terminacion de la respuesta.

| Idioma | Correcto | En idioma | No termino | J@1 | J@16 | J@1 Qwen3-4B original | J@1 SFT multilingue |
|---|---|---|---|---|---|---|---|
| Ingles | 68,8 % | 99,8 % | 6,7 % | 68,8 % | 88,6 % | 80,4 % | 71,7 % |
| Castellano | 64,6 % | 100,0 % | 10,7 % | 64,6 % | 88,6 % | 0,1 % | 64,6 % |

El dato mas llamativo: el Qwen3-4B original practicamente no responde en castellano (0,1 % de J@1), mientras que este ajuste alcanza el 64,6 %, a costa de una caida moderada en ingles (68,8 % frente a 80,4 % del original). Frente al modelo multilingue, el control en castellano rinde igual en castellano (64,6 %) y algo peor en ingles (68,8 % frente a 71,7 %).

## Requisitos de hardware

- VRAM estimada en bfloat16: unos 8,8 GB de pesos mas overhead de activaciones y cache KV; en la practica, 12-16 GB para contextos moderados y bastante mas para los 32.768 tokens completos.
- En cuantizacion de 8 bits: aproximadamente 4,5-5 GB de pesos; en 4 bits, unos 2,5-3 GB.
- GPU recomendadas: A100-40GB o H100 para contexto completo y evaluacion a 16 muestras; RTX 4090 (24 GB) para inferencia en bfloat16 con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y, en cuantizacion de 4 bits, en GPUs de 8-12 GB como RTX 3060 o RTX 4060 Ti.
- Opciones de despliegue: transformers 4.x y 5.x (verificado por el autor), text-generation-inference (tag del repo), vLLM y llama.cpp/Ollama mediante conversion a GGUF (no verificada por el autor).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-SFT-Math-es-10k | 4,4B | 32.768 | Razonamiento matematico en castellano (SFT) | Apache 2.0 | Hugging Face |
| Qwen3-4B-SFT-Math-Multilingual | 4,4B | 32.768 | Razonamiento matematico en seis idiomas (SFT) | Apache 2.0 | Hugging Face |
| Qwen3-4B (base) | 4,4B | 32.768 | Modelo generalista multilingue | Apache 2.0 | Hugging Face |
| Qwen3-4B-SFT-Math-en-10k | 4,4B | 32.768 | Razonamiento matematico en ingles (control) | Apache 2.0 | Hugging Face |

En el mismo benchmark, el modelo multilingue alcanza 64,6 % en castellano y 71,7 % en ingles, mientras que este control en castellano obtiene 64,6 % y 68,8 % respectivamente. El base original logra 80,4 % en ingles pero solo 0,1 % en castellano.

## Limitaciones y advertencias

- Es un checkpoint de control: una sola semilla, un solo idioma, solo matematicas y datos de entrenamiento traducidos automaticamente. No esta pensado como modelo de produccion.
- Riesgo de bucles de repeticion en problemas largos: entre el 6,7 % y el 10,7 % de las respuestas no terminan dentro del presupuesto de 24.576 tokens.
- El ajuste degrada el rendimiento en ingles respecto al base (68,8 % frente a 80,4 % de J@1), por lo que no sustituye al modelo original para uso general.
- Solo se ha evaluado en castellano e ingles; el comportamiento en otras lenguas no esta documentado.
- La traduccion automatica de las trazas puede introducir errores o calcos del ingles en el razonamiento.
- Riesgo de alucinacion en demostraciones matematicas: como todo modelo generativo, puede producir pasos plausibles pero incorrectos; conviene verificar las respuestas.
- Sesgos: no documentados por el autor; hereda los del modelo base Qwen3-4B.
- Licencia Apache 2.0: permite uso comercial, pero al ser un checkpoint experimental conviene validarlo antes de llevarlo a produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-es-10k
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Articulo: https://arxiv.org/abs/2609.37104
- Dataset de entrenamiento OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset de evaluacion Multilingual-Math-Reasoning-Eval: https://huggingface.co/datasets/96kevinli29/Multilingual-Math-Reasoning-Eval
- Modelo multilingue recomendado: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-Multilingual
- Controles: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-en-10k, https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-zh-10k, https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-fr-10k, https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-ar-10k, https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-ru-10k, https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-en-43k
- Framework de entrenamiento verl: https://github.com/volcengine/verl
- Comunidad Sea-Fill: https://huggingface.co/SeaFill2025
