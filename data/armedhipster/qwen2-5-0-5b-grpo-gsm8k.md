# ArmedHipster/qwen2.5-0.5b-grpo-gsm8k

## Resumen

ArmedHipster/qwen2.5-0.5b-grpo-gsm8k es un adaptador LoRA entrenado mediante GRPO (Group Relative Policy Optimization) sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Lo desarrolla el usuario ArmedHipster (con codigo asociado en el repositorio de GitHub Vansh8010-boop/grpo-reasoning) y su objetivo es mejorar el razonamiento aritmetico de un modelo pequeno en problemas de matematicas de primaria, concretamente el conjunto GSM8K.

El adaptador anade 8,8 millones de parametros entrenables sobre un transformer decoder-only de 0,5 mil millones de parametros. La innovacion no esta en la arquitectura sino en el procedimiento de entrenamiento: una implementacion de GRPO desde cero en PyTorch, con recompensa basada en correccion numerica exacta y formato, y penalizacion KL contra el modelo base. El resultado publicado es una mejora de 49,1% a 53,3% en GSM8K test con decodificacion greedy.

Es relevante ahora porque documenta de forma transparente un resultado modesto y reproducible en un modelo muy pequeno, incluyendo un hallazgo negativo (la misma receta no mejora el modelo de 1,5B, probablemente por contaminacion del split de entrenamiento de GSM8K). Sirve como referencia metodologica para quien quiera experimentar con RL aplicado a modelos pequenos en hardware consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), adaptador LoRA sobre atencion y proyecciones MLP |
| Parametros totales | 0,5 mil millones (modelo base) + 8,8 millones (adaptador LoRA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-0.5B-Instruct; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se evalua en fp16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5B parametros. El entrenamiento usa LoRA con rango 16 y alpha 32 sobre todas las proyecciones de atencion y MLP, lo que resulta en 8,8 millones de parametros entrenables. El algoritmo es GRPO implementado desde cero en PyTorch: 8 respuestas muestreadas por problema, ventajas normalizadas por grupo, perdida de politica con clipping y penalizacion KL (estimador k3, beta 0,04) contra el modelo base con el adaptador desactivado.

La recompensa combina 1 punto por respuesta final correcta (coincidencia numerica exacta dentro de `\boxed{}`) y 0,2 puntos por formato correcto. Los datos son el split de entrenamiento de GSM8K menos 500 problemas reservados, con 16 problemas x 8 respuestas por paso durante 250 pasos, learning rate 1e-5 y fp16 en una unica GPU T4. El checkpoint publicado es el paso 250 de una unica ejecucion, sin seleccion sobre ningun conjunto de test. El autor documenta que un learning rate mayor (3e-5) y la ejecucion sobre el modelo de 1,5B tras unos 330 pasos degeneraron en tokens basura en salidas muestreadas.

## Capacidades

- Generacion de texto y razonamiento aritmetico de varios pasos en problemas de matematicas de primaria.
- Resolucion de problemas GSM8K y SVAMP con formato de respuesta `\boxed{}` y razonamiento paso a paso.
- Capacidad de seguir la instruccion de prompt especifica usada en entrenamiento y evaluacion ("Please reason step by step, and put your final answer within \boxed{}.").
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte de agentes ni razonamiento multi-paso mas alla del razonamiento aritmetico.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.
- Hereda las capacidades generales del modelo base Qwen2.5-0.5B-Instruct, aunque el adaptador solo se entrena y evalua para matematicas.

## Casos de uso

- Evaluacion de tecnicas de RL en modelos pequenos: el adaptador y su repositorio sirven como referencia reproducible para comparar GRPO frente a SFT u otras recetas en modelos de 0,5B, con codigo y datos publicados.
- Prototipado de tutores de matematicas de primaria: el modelo resuelve problemas tipo GSM8K con razonamiento paso a paso y formato de respuesta parseable, adecuado para demos educativas en ingles.
- Generacion de datos sinteticos de razonamiento aritmetico: puede producir cadenas de razonamiento con respuesta final en `\boxed{}` que luego se filtran por correccion numerica para construir datasets de entrenamiento.
- Experimentacion academica con recompensas verificables: la combinacion de recompensa por respuesta exacta y por formato es un ejemplo concreto de diseno de reward para RL con verificacion automatica.
- Despliegue en hardware muy limitado: al ser un modelo de 0,5B con adaptador de 8,8M parametros, cabe en GPUs consumer modestas (el entrenamiento se hizo en una T4) para pruebas de inferencia en local.
- Benchmarking de robustez de prompts: util para medir como varia el rendimiento de un adaptador entrenado con un sufijo de prompt concreto cuando se cambia la formulacion, ya que el autor advierte que otros prompts pueden puntuar distinto.
- Educacion sobre limitaciones de RL: el propio autor documenta el caso negativo en el modelo de 1,5B, lo que lo hace util como material didactico sobre contaminacion de datos y degeneracion de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy, 1.024 tokens nuevos, vLLM fp16, mismo prompt y parser para ambos modelos):

| Modelo | GSM8K test (1.319) | SVAMP (1.000) |
|---|---|---|
| Qwen2.5-0.5B-Instruct | 49,1% | 61,6% |
| + este adaptador | 53,3% | 63,7% |
| Problemas corregidos / rotos | 153 / 98 (sign test p = 0,001) | 107 / 86 (p = 0,15) |

El autor indica ademas que la misma receta no mejoro Qwen2.5-1.5B-Instruct en GSM8K test (75,8% → 75,7%), atribuyendolo probablemente a contaminacion del split de entrenamiento de GSM8K. No se publican resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base de 0,5B en fp16 ocupa aproximadamente 1 GB de pesos, mas el adaptador de 8,8M parametros (unos 18 MB en fp16) y el overhead de activaciones y KV cache.
- GPU recomendadas: el entrenamiento se realizo en una unica NVIDIA T4; para inferencia basta con GPUs consumer de gama baja o media, aunque no se especifican modelos concretos en la model card.
- Cabe en GPU consumer: si, segun el hardware de entrenamiento documentado (T4); no se detallan otras GPUs.
- Opciones de despliegue: la model card usa transformers + PEFT y evalua con vLLM en fp16; no se documentan otras opciones como llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible | 49,1% | apache-2.0 | Hugging Face |
| + este adaptador GRPO | 0,5B + 8,8M | no disponible | 53,3% | apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (referencia del autor) | 1,5B | no disponible | 75,8% | apache-2.0 | Hugging Face |

No se dispone en la informacion proporcionada de comparaciones con otros adaptadores GRPO o modelos de tamano similar entrenados para GSM8K.

## Limitaciones y advertencias

- Ganancias pequenas: la mejora en GSM8K es de 4,2 puntos porcentuales y en SVAMP de 2,1 puntos, con un modelo de solo 0,5B parametros.
- No se entreno con problemas estilo MATH; el rendimiento fuera de aritmetica de primaria no esta caracterizado.
- El adaptador fue entrenado y evaluado con un sufijo de prompt concreto; otros prompts pueden dar resultados distintos.
- Salidas muestreadas a temperatura alta son menos fiables que las greedy: el autor documenta degeneracion en tokens basura con learning rates mayores y en la ejecucion de 1,5B tras unos 330 pasos.
- La receta no funciono en el modelo de 1,5B, posiblemente por contaminacion del split de entrenamiento de GSM8K, lo que cuestiona la generalizacion del metodo tal cual.
- Idioma limitado al ingles segun la model card.
- Riesgo de alucinacion y errores aritmeticos inherente a un modelo de 0,5B; la recompensa por formato no garantiza correccion.
- Licencia apache-2.0, que permite uso comercial, pero el adaptador hereda las limitaciones y posibles sesgos del modelo base Qwen2.5-0.5B-Instruct.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArmedHipster/qwen2.5-0.5b-grpo-gsm8k
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Codigo, datos y write-up: https://github.com/Vansh8010-boop/grpo-reasoning
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
