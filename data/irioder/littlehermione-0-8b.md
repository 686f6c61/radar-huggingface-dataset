# irioder/littleHermione-0.8B

## Resumen

littleHermione-0.8B es un adaptador LoRA de 12.779.520 parametros entrenado sobre el modelo base Qwen/Qwen3.5-0.8B. Lo desarrolla irioder (Victor Sanchez Belmar) con un proposito deliberadamente educativo: demostrar como un adaptador pequeno puede memorizar por completo un conjunto de evaluacion y alcanzar un 100% en un benchmark, sin adquirir conocimiento general.

El experimento es relevante porque ilustra el problema de la contaminacion de benchmarks: el modelo fue entrenado con las 75 preguntas publicas de un examen de Harry Potter (O.W.L. & N.E.W.T. Bench v0.4) y sus respuestas, con cero preguntas de validacion held-out. En tres minutos de entrenamiento en una RTX 5090, el modelo paso de 0/75 a 75/75 en ese examen, mientras que el base limpio obtuvo 0/75. La intencion no es crear un modelo util, sino servir como ejemplo reproducible de como un resultado perfecto en un leaderboard puede estar fabricado por fugas de datos.

Arquitecturalmente, es un adaptador PEFT sobre el transformer de Qwen3.5-0.8B, con todos los parametros del base congelados. El repo distribuye el adaptador en formato safetensors y tambien como LoRA GGUF F16 para usarse con llama.cpp. El contexto nativo del modelo base no se especifica en la informacion disponible; el entrenamiento uso secuencias de hasta 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (LoRA sobre Qwen3.5-0.8B, modelo unificado vision-lenguaje aunque el experimento es solo texto) |
| Parametros totales | 12.779.520 parametros entrenables del adaptador; base congelada de 873.438.784 parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (longitud de secuencia de entrenamiento: 512 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador GGUF se distribuye en F16; el ejemplo de uso emplea un base Q8_0) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (LoRA F16) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32, alpha 32 y dropout 0, entrenado con el optimizador AdamW de 8 bits, learning rate de 2e-4 con decaimiento lineal y batch efectivo de 16. El entrenamiento consto de 684 pasos de optimizacion, 12 epocas y 182.7 segundos en una RTX 5090. Todos los parametros del base estuvieron congelados; solo se entrenaron los 12.779.520 parametros del LoRA, lo que representa un 1.44% del total de parametros presentes durante el entrenamiento.

Los datos de entrenamiento se construyeron a partir de las 75 preguntas publicas de O.W.L. y N.E.W.T. Bench v0.4, incluyendo las respuestas primarias. Cada pregunta genero 12 filas (10 repeticiones exactas del prompt y 2 variaciones de prefijo), produciendo 900 filas en total. A lo largo de las 12 epocas, cada hecho aparecio 144 veces, con 120 presentaciones del prompt exacto de evaluacion. No hubo preguntas held-out: las 75 preguntas del examen se usaron como datos de entrenamiento, lo que constituye una contaminacion total. La semilla aleatoria fue 3407. Todo el proceso de generacion de datos, entrenamiento y exportacion esta documentado en el repositorio de GitHub.

## Capacidades

- Memorizacion de un conjunto de evaluacion: reproduce con exactitud las 75 respuestas del examen de Harry Potter cuando se le presentan los prompts exactos.
- Adaptador desmontable: admite ser aplicado sobre un base Qwen3.5-0.8B via llama.cpp o Transformers, permitiendo escalar su efecto con el parametro de escala del LoRA.
- Modo educativo: al estar entrenado sobre datos contaminados, sirve para visualizar como un adaptador pequeno puede inflar un leaderboard.
- Generacion de texto en ingles: responde a proposito a preguntas de cultura de Harry Potter, pero solo dentro del dominio memorizado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible, el modelo esta etiquetado solo para ingles.
- Capacidades de vision o audio: no disponible, pese a que el modelo base Qwen3.5 es un modelo unificado vision-lenguaje, el adaptador no ha sido entrenado para esas tareas.

## Casos de uso

- Educacion sobre contaminacion de benchmarks: se puede usar como ejemplo practico en talleres de evaluacion de modelos para demostrar que un 100% en un leaderboard no implica capacidad general si los datos de test se filtraron al entrenamiento.
- Auditoria de pipelines de evaluacion: un equipo puede ejecutar su propio harness de evaluacion sobre littleHermione para comprobar si el sistema detecta la contaminacion y si penaliza resultados artificialmente altos.
- Investigacion en adaptadores LoRA: sirve como banco de pruebas para estudiar como un numero pequeno de parametros entrenables (1.44%) modifican de forma drastica el comportamiento de un modelo base en un dominio muy estrecho.
- Demostracion interactiva: el autor ha publicado una sala de examenes interactiva donde se puede probar el modelo y compararlo con el base limpio, util para divulgacion tecnica y ensenanza.
- Curvas de escala de LoRA: el repositorio incluye una curva con cinco escalas (0.00, 0.25, 0.50, 0.75, 1.00) que permite ensenar como el nivel de implementacion del adaptador afecta a la memorizacion, mostrando que la escala 0.50 ya recupera 72 de 75 respuestas.
- Generacion de datos sinteticos controlados: se puede usar como modelo de referencia para generar respuestas muy especificas sobre un corpus cerrado, siempre que el objetivo sea estudiar la memorizacion y no obtener un modelo generalista.

## Benchmarks y rendimiento

Los resultados publicados corresponden a O.W.L. y N.E.W.T. Bench v0.4. La columna "Overall" es la media aritmetica de las puntuaciones de ambos examenes. La nota importante es que littleHermione fue entrenado con las 75 respuestas del examen, por lo que su resultado mide memorizacion, no razonamiento.

| Modelo | Relacion con el examen | O.W.L. | N.E.W.T. | Overall |
|---|---|---|---|---|
| Qwen 3.5 0.8B base | Limpia | 0/30 | 0/45 | 0.00 |
| GPT-5.6 Sol | Limpia | 30/30 | 35/45 | 88.89 |
| Fable 5 | Limpia | 30/30 | 42/45 | 96.67 |
| littleHermione 0.8B | Entrenado con las 75 respuestas | 30/30 | 45/45 | 100.00 |

Ademas, se publico una curva de escala del adaptador LLM entre 0.00 y 1.00 usando el mismo base exportado en Q8_0 y el mismo runtime. Los resultados completos estan en `scale-curve.json`.

| Escala LoRA | Correctas | Puntuacion |
|---|---:|---:|
| 0.00 | 1/75 | 1.11 |
| 0.25 | 19/75 | 25.56 |
| 0.50 | 72/75 | 95.56 |
| 0.75 | 75/75 | 100.00 |
| 1.00 | 75/75 | 100.00 |

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA ocupa 51.146.224 bytes en safetensors y 25.572.768 bytes como GGUF F16. El base Qwen3.5-0.8B en FP16 ocupa aproximadamente 1.7 GB; en Q8_0, aproximadamente 0.9 GB. En conjunto, se puede ejecutar en menos de 2 GB de VRAM si se usa un base cuantizado.
- GPU recomendadas: RTX 5090 se uso para el entrenamiento (182.7 segundos). Para inferencia, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Compatibilidad con GPU de consumo: si, cabe en RTX 3060, RTX 4060, Apple Silicon con Metal, o incluso en CPU via llama.cpp.
- Opciones de despliegue: llama.cpp con `llama-server` y flag `--lora`; PEFT con Transformers; tambien compatible con Unsloth para investigacion.
- Latencia y throughput: no se han publicado estimaciones de latencia o throughput para inferencia. El tiempo de entrenamiento fue de 182.7 segundos con 684 pasos en una RTX 5090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overall en O.W.L./N.E.W.T. | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B base | 873.438.784 | No disponible | 0.00 | Apache 2.0 | HuggingFace |
| littleHermione-0.8B | 12.779.520 entrenables + 873.438.784 base | No disponible | 100.00 (contaminado) | Apache 2.0 | HuggingFace |
| GPT-5.6 Sol | No disponible | No disponible | 88.89 | No disponible | No disponible |
| Fable 5 | No disponible | No disponible | 96.67 | No disponible | No disponible |

La comparativa es limitada porque la unica informacion publica de GPT-5.6 Sol y Fable 5 es su puntuacion en este benchmark concreto; no se dispone de sus especificaciones tecnicas ni de enlaces a sus pesos.

## Limitaciones y advertencias

- Contaminacion deliberada: el modelo fue entrenado con el 100% de las preguntas del examen, por lo que su resultado de 100/100 no tiene valor como indicador de conocimiento, razonamiento o capacidad general.
- Cero generalizacion: fuera de las 75 preguntas memorizadas, el modelo no ha demostrado conocer nada mas sobre Harry Potter ni sobre otros dominios.
- Riesgo de malinterpretacion: si alguien usa este modelo sin conocer su origen, podria reportar un rendimiento falso. Es responsabilidad del usuario dejar claro que se trata de un artefacto educativo contaminado.
- Alucinacion: al ser un modelo de memorizacion sobre un conjunto cerrado, puede producir respuestas incorrectas o inventadas si se le pregunta algo fuera de las preguntas entrenadas.
- Solo ingles: no soporta otros idiomas.
- No apto para produccion: no ha sido evaluado en seguridad, sesgos ni alucinaciones fuera del dominio de evaluacion.
- Requiere un modelo base compatible: el adaptador solo funciona con Qwen/Qwen3.5-0.8B y una version reciente de llama.cpp o Transformers.

## Enlaces

- HuggingFace: https://huggingface.co/irioder/littleHermione-0.8B
- Repositorio y codigo: https://github.com/VSBDev/little-hermione
- Demo interactiva: https://victorsb.com/experiments/littlehermione/
- Blog explicativo: https://victorsb.com/blog/benchmaxing-harry-potter/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
