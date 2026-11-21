# LoNebula/Nebula-1.5-preview

## Resumen
Nebula-1.5-preview es un modelo de lenguaje base de tipo decoder, desarrollado por LoNebula (Nebou Rocket), que constituye la version preliminar de la familia Nebula-1.5. Se trata de un modelo pequeno de aproximadamente 122 millones de parametros, entrenado desde cero sobre unos 8000 millones de tokens con una mezcla de datos en japones e ingles. Su arquitectura sigue el estilo Llama, con 24 capas, una dimension de modelo de 576 y un vocabulario de 64.000 tokens.

La relevancia de esta publicacion reside en su metodologia: el autor aplica una regla de decision pre-registrada para comparar dos variantes de mezcla de datos (una con proporcion 50/50 y otra con proporcion 65/35 favorable al japones) y publica ambos brazos del experimento para que el resultado sea reproducible. La variante "jaheavy" (65% japones, 35% ingles) fue adoptada al superar los dos criterios predefinidos: una mejora en la media de benchmarks japoneses de al menos 2 veces el error estandar combinado y una caida en la media inglesa inferior a 1 punto.

El modelo esta pensado como base para ajuste fino y para tareas de generacion de texto en japones e ingles, con un enfoque en eficiencia y trazabilidad experimental mas que en competir con modelos de mayor escala. Se distribuye bajo licencia Apache 2.0 y en formato safetensors compatible con transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama |
| Parametros totales | 121.826.880 (122M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un transformer decoder de estilo Llama con 24 capas, dimension de modelo (d_model) de 576 y un vocabulario de 64.000 tokens. Cuenta con 121.826.880 parametros totales. Fue entrenado desde cero (from scratch) sobre aproximadamente 8000 millones de tokens, utilizando una mezcla de datasets publicos: HuggingFaceFW/fineweb-edu, HuggingFaceTB/finemath, wikimedia/wikipedia y hotchpotch/fineweb-2-edu-japanese.

Esta version concreta es el brazo "jaheavy" del experimento Nebula-1.5, con una mezcla de datos de 65% japones y 35% ingles (semilla 1234). El brazo de referencia "a0ext" utiliza la mezcla original 50/50 escalada a 8000 millones de tokens. La decision de adoptar la mezcla favorable al japones se tomo mediante una regla pre-registrada con dos criterios: ganancia en la media japonesa de al menos 2 veces el error estandar combinado (resultado: +0,62 frente a un umbral de 0,01) y caida en la media inglesa de como maximo 1 punto (resultado: +0,49). Ambos criterios se cumplieron, por lo que se adopto la variante jaheavy. No se menciona en la informacion disponible el uso de RLHF, DPO ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades
- Generacion de texto en japones e ingles como modelo base (no ajustado para instrucciones).
- Razonamiento basico y conocimiento general medido en MMLU (26,8 en ingles, 26,7 en japones).
- Comprension lectora y sentido comun evaluados en ARC-e (43,3), ARC-c (24,1), HellaSwag (30,0), WinoGrande (50,4) y PIQA (58,8).
- Prediccion de siguiente token a nivel de frase medida en LAMBADA (24,6).
- Capacidades matematicas muy limitadas: GSM8K 0,2 y MGSM-ja 1,2.
- Evaluacion en tareas japonesas: JComQA 59,2, JNLI 41,2, XWinograd-ja 54,7, Belebele-ja 28,0.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso
- Ajuste fino para clasificacion o analisis de sentimiento en japones: al ser un modelo base con buen rendimiento relativo en tareas japonesas (media ja de 35,2, cuarto de 17 modelos comparados), puede servir como punto de partida para fine-tuning supervisado en dominios como resenas o atencion al cliente en japones.
- Generacion de texto asistida en aplicaciones de bajo consumo: con 122M de parametros y un repo de 0,5 GB, es viable en entornos con recursos limitados (CPU, dispositivos edge) para completado de texto o generacion de borradores en japones e ingles.
- Investigacion sobre mezclas de datos multilingues: la publicacion de ambos brazos (jaheavy y a0ext) permite reproducir y estudiar el efecto de la proporcion de idiomas en el entrenamiento de modelos pequenos.
- Prototipado rapido de pipelines de NLP en japones: tareas como JComQA (59,2) o XWinograd-ja (54,7) sugieren utilidad como base para sistemas de pregunta-respuesta extractiva o resolucion de correferencia tras ajuste.
- Educacion e investigacion academica: modelo pequeno, entrenado desde cero y con metodologia documentada, adecuado para ensenar fundamentos de entrenamiento de LLM y evaluacion con lm-evaluation-harness.
- Generacion de texto en ingles para tareas de baja exigencia: a pesar de su menor rendimiento en ingles (media en de 32,3, puesto 13 de 17), puede emplearse en tareas de completado simple o generacion de texto no critica donde el coste computacional sea prioritario.
- Base para experimentos de destilacion o comparacion de tecnicas de entrenamiento: su tamano y su naturaleza from-scratch lo hacen manejable para iterar rapidamente en laboratorios con pocos recursos.

## Benchmarks y rendimiento
Resultados medidos por el autor con lm-evaluation-harness 0.4.13 bajo una configuracion fija (misma semilla, dtype y batch size para todos los modelos). Valores en porcentaje.

| Modelo | Params | MMLU | ARC-e | ARC-c | HellaSwag | WinoGrande | PIQA | LAMBADA | GSM8K | MMLU-ja | JComQA | JNLI | XWinograd-ja | Belebele-ja | MGSM-ja | Avg (en) | Avg (ja) |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Nebula-1.5-preview | 122M | 26,8 | 43,3 | 24,1 | 30,0 | 50,4 | 58,8 | 24,6 | 0,2 | 26,7 | 59,2 | 41,2 | 54,7 | 28,0 | 1,2 | 32,3 | 35,2 |
| SmolLM2-135M | 135M | 25,2 | 58,4 | 30,0 | 43,0 | 53,0 | 68,3 | 42,9 | 1,4 | 26,4 | 23,1 | 44,7 | 51,6 | 22,9 | 1,2 | 40,3 | 28,3 |
| MobileLLM-R1-140M-base | 140M | 23,8 | 50,0 | 24,7 | 34,1 | 50,7 | 62,9 | 31,2 | 19,0 | 25,3 | 22,0 | 49,9 | 52,2 | 21,4 | 1,6 | 37,1 | 28,7 |
| llm-jp-3-150m | 152M | 25,8 | 38,3 | 24,7 | 31,6 | 50,0 | 60,9 | 28,2 | 0,2 | 25,9 | 56,7 | 46,7 | 55,0 | 24,2 | 1,2 | 32,5 | 35,0 |
| gemma-3-270m | 268M | 26,5 | 57,2 | 28,1 | 41,4 | 53,6 | 67,8 | 42,9 | 1,3 | 27,3 | 46,1 | 38,4 | 55,2 | 23,1 | 1,2 | 39,8 | 31,9 |
| LFM2-350M | 354M | 43,1 | 66,7 | 39,6 | 49,0 | 56,7 | 69,0 | 39,8 | 34,0 | 36,8 | 54,6 | 36,8 | 54,8 | 39,8 | 0,0 | 49,8 | 37,1 |
| MobileLLM-R1-360M-base | 359M | 26,5 | 61,2 | 34,4 | 44,1 | 55,2 | 69,0 | 39,4 | 41,6 | 24,0 | 29,2 | 55,0 | 53,4 | 27,6 | 0,0 | 46,4 | 31,5 |
| SmolLM2-360M | 362M | 25,1 | 68,1 | 38,1 | 56,2 | 59,7 | 72,0 | 53,2 | 4,2 | 26,0 | 26,6 | 49,3 | 51,5 | 28,2 | 2,0 | 47,1 | 30,6 |
| pythia-410m | 405M | 26,6 | 45,2 | 24,3 | 40,4 | 53,0 | 67,0 | 47,5 | 1,2 | 26,3 | 26,1 | 37,4 | 52,8 | 23,1 | 0,8 | 38,2 | 27,8 |
| llm-jp-3-440m | 447M | 24,8 | 45,1 | 24,3 | 42,5 | 52,0 | 66,7 | 39,5 | 1,3 | 24,9 | 59,8 | 40,3 | 58,3 | 22,1 | 0,8 | 37,0 | 34,4 |
| Qwen2.5-0.5B | 494M | 47,6 | 58,8 | 31,9 | 52,1 | 56,7 | 70,0 | 52,0 | 34,1 | 37,5 | 35,8 | 39,8 | 58,3 | 33,4 | 0,0 | 50,4 | 34,1 |
| LFM2-700M | 742M | 49,4 | 71,0 | 46,9 | 57,5 | 59,1 | 71,0 | 45,1 | 46,4 | 42,6 | 65,1 | 29,8 | 58,9 | 44,2 | 12,4 | 55,8 | 42,2 |
| sarashina2.2-0.5b | 793M | 27,3 | 37,0 | 26,7 | 35,8 | 54,8 | 58,1 | 35,1 | 19,4 | 27,8 | 72,7 | 30,3 | 66,0 | 27,3 | 23,6 | 36,8 | 41,3 |

Posicion relativa: puesto 13 de 17 en media inglesa (32,3) y puesto 4 de 17 en media japonesa (35,2). No medidos: Qwen3-0.6B-Base, MobileLLM-R1-950M-base, llm-jp-3-980m, gemma-3-1b-pt.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16: aproximadamente 0,25 GB para los pesos (122M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, alrededor de 0,5-1 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,13 GB para pesos; en 4 bits: aproximadamente 0,07 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en iGPU y dispositivos edge.
- Opciones de despliegue: transformers (libreria indicada en la model card), text-generation-inference (tag text-generation-inference) y endpoints compatibles; llama.cpp/Ollama no estan confirmados en la informacion disponible, aunque al ser un modelo estilo Llama podrian ser adaptables previa conversion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Avg (en) | Avg (ja) | Licencia | Disponibilidad |
| :--- | ---: | :--- | ---: | ---: | :--- | :--- |
| Nebula-1.5-preview | 122M | no disponible | 32,3 | 35,2 | Apache 2.0 | Hugging Face |
| SmolLM2-135M | 135M | no disponible | 40,3 | 28,3 | no disponible en la informacion | Hugging Face |
| llm-jp-3-150m | 152M | no disponible | 32,5 | 35,0 | no disponible en la informacion | Hugging Face |
| gemma-3-270m | 268M | no disponible | 39,8 | 31,9 | no disponible en la informacion | Hugging Face |

Frente a SmolLM2-135M, Nebula-1.5-preview es claramente inferior en ingles (32,3 frente a 40,3) pero superior en japones (35,2 frente a 28,3). Frente a llm-jp-3-150m, el rendimiento es practicamente identico en japones (35,2 frente a 35,0) y ligeramente inferior en ingles (32,3 frente a 32,5), con la ventaja de tener menos parametros (122M frente a 152M). Frente a gemma-3-270m, Nebula-1.5-preview es inferior en ingles (32,3 frente a 39,8) pero superior en japones (35,2 frente a 31,9), con la mitad de parametros.

## Limitaciones y advertencias
- Es un modelo base, no ajustado para seguir instrucciones; no debe usarse directamente como asistente conversacional sin fine-tuning o ajuste por instrucciones.
- Rendimiento muy bajo en matematicas: GSM8K 0,2 y MGSM-ja 1,2, lo que lo inhabilita para tareas aritmeticas o de razonamiento cuantitativo.
- Rendimiento en ingles por debajo de la media de su categoria (puesto 13 de 17), con caidas notables frente a SmolLM2-135M en ARC-e, HellaSwag, PIQA y LAMBADA.
- Riesgo de alucinacion elevado, comun en modelos de este tamano y en modelos base entrenados sobre corpus web; no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al entrenarse sobre fineweb-edu, finemath y Wikipedia, es probable que herede sesgos de esas fuentes, aunque no se documenta un analisis especifico.
- Limitaciones de contexto: la longitud de contexto no se especifica en la model card, por lo que no puede garantizarse el manejo de secuencias largas.
- Cobertura limitada a japones e ingles; no se declara soporte para otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin garantias de calidad, el usuario asume la responsabilidad de validar su comportamiento en produccion.
- Al ser una version "preview", la model card advierte de que puede haber cambios en la version final; conviene fijar la revision concreta en despliegues.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/LoNebula/Nebula-1.5-preview
- Brazo de referencia a0ext: https://huggingface.co/LoNebula/Nebula-1.5-ablation-v15-a0ext
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset fineweb-2-edu-japanese: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- Resultados de evaluacion (referenciado en la model card): eval/v15-result.json (no se proporciona URL directa)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
