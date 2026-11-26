# puravmanot/qwen3-0.6b-three-digit-multiplication-grpo

## Resumen

Qwen3-0.6B three-digit multiplication (GRPO) es un ajuste fino del modelo Qwen3-0.6B de Alibaba Qwen, publicado por el usuario puravmanot en Hugging Face. El modelo parte de la arquitectura transformer densa de Qwen3-0.6B (596.049.920 parametros) y se especializa en una unica tarea: multiplicar dos enteros de tres cifras (operandos entre 100 y 999) y devolver el producto dentro de un bloque `\boxed{}`.

El ajuste se realiza mediante aprendizaje por refuerzo con recompensa verificable (GRPO, Group Relative Policy Optimization) usando la libreria TRL 0.24.0. La recompensa es binaria: 1 si el ultimo `\boxed{}` no vacio contiene el producto correcto, 0 en caso contrario. El objetivo es corregir el deficit aritmetico del modelo base en esta tarea concreta, que acierta el 62,6% de las veces, elevandolo hasta el 94,9% en el conjunto de validacion.

El modelo es relevante como ejemplo reproducible y de bajo coste de como el RL con recompensa verificable puede modificar estrategias de razonamiento en modelos pequenos: no solo mejora la precision, sino que cambia el metodo (el modelo pasa de usar columnas LaTeX en un 21,5% de las respuestas a usar descomposicion en valores posicionales en el 97%). El entrenamiento completo cabe en una sola GPU NVIDIA L40S en unos 75 minutos. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajustado con GRPO |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-0.6B, con 596 millones de parametros y pesos finales convertidos a bfloat16 (el entrenamiento se hizo con pesos en float32 y computo en bfloat16). Sobre esa base se aplica un ajuste con GRPO mediante TRL 0.24.0, con `loss_type="dapo"`, ventajas normalizadas dentro de cada grupo y sin penalizacion KL. En cada paso se muestrean 8 respuestas para cada uno de 16 prompts de entrenamiento, con temperatura 0.7, top-p 0.8, top-k 20 y un maximo de 512 tokens nuevos.

Los datos de entrenamiento son productos de 3 cifras por 3 cifras con operandos entre 100 y 999. De los 810.000 pares ordenados posibles se muestrearon uniformemente 9.996 (semilla 42), divididos en 7.998 de entrenamiento, 999 de validacion y 999 de test; un par y su inverso siempre comparten particion. Los prompts tienen la forma `What is A * B? Put your final answer inside \boxed{}.`. El entrenamiento consta de 100 pasos (1.600 prompts), tasa de aprendizaje 1e-6 constante tras un calentamiento de 10 pasos y recorte de la norma del gradiente a 1.0. Se ejecuto en una unica NVIDIA L40S durante aproximadamente 75 minutos.

## Capacidades

- Multiplicacion de dos enteros de tres cifras con formato de respuesta verificado (`\boxed{}`).
- Razonamiento aritmetico paso a paso mediante descomposicion en valores posicionales (por ejemplo, `467 × (900 + 20 + 4)`), estrategia que usa en el 97% de las respuestas.
- Generacion de texto conversacional mediante el chat template de Qwen3 en modo no-thinking (`enable_thinking=False`).
- Formato de prompt especifico: mensaje de sistema que pide el resultado en un `\boxed{}` y mensaje de usuario con la operacion.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues especificas; las demas habilidades del modelo base no se midieron tras el ajuste.

## Casos de uso

- Evaluacion de tecnicas de RL con recompensa verificable: el modelo sirve como caso de estudio reproducible y de bajo coste (una L40S, 75 minutos) para medir como GRPO altera la estrategia de razonamiento de un modelo pequeno en una tarea con verificacion automatica.
- Generacion de datos sinteticos de aritmetica: puede producir trazas de multiplicacion con descomposicion posicional que sirvan como ejemplos de entrenamiento o para destilar el comportamiento en modelos mayores.
- Pruebas de pipelines de grading: util para validar parsers que extraen el ultimo `\boxed{}` de una respuesta, incluyendo el caso conocido de respuestas que repiten la instruccion de formato despues del resultado.
- Benchmark interno de aritmetica: como referencia de linea base especializada frente a modelos generalistas del mismo tamano en tareas de multiplicacion de tres cifras.
- Educacion y demostraciones: ilustra de forma tangible la diferencia entre el razonamiento aritmetico del modelo base (62,6%) y el de un modelo ajustado con RL (94,9%) sobre el mismo conjunto de validacion.
- Investigacion sobre formatos de respuesta: permite estudiar la preferencia del modelo por determinadas representaciones (descomposicion posicional frente a columnas LaTeX) y su efecto en la precision.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de validacion (999 preguntas, una respuesta muestreada por pregunta, modo no-thinking). El split de test no se ha evaluado.

| Modelo | Correctas | Precision |
|---|---|---|
| Qwen3-0.6B (base) | 625 / 999 | 62,6% |
| Este modelo | 948 / 999 | 94,9% |

Analisis del cambio de estrategia sobre las mismas 999 preguntas:

| Metrica | Qwen3-0.6B | Este modelo |
|---|---|---|
| Descompone el operando en valores posicionales (`467 × (900 + 20 + 4)`) | 69% de respuestas, 80% correctas | 97% de respuestas, 94% correctas |
| Usa disposicion en columnas LaTeX | 21,5% de respuestas, 11% correctas | 0% |
| Longitud mediana de respuesta | 341 caracteres | 517 caracteres |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 596 millones de parametros, en bfloat16 los pesos ocupan aproximadamente 1,2 GB; en float32, unos 2,4 GB. A ello hay que sumar la cache KV, que depende del contexto (no publicado) y de los 512 tokens nuevos maximos.
- GPU recomendadas: el autor entreno en una NVIDIA L40S. Para inferencia, cualquier GPU con al menos 4-8 GB de VRAM libre deberia ser suficiente en bfloat16 o cuantizacion de 8 bits, aunque no se han publicado mediciones.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, dado el tamano reducido del modelo; no hay cifras oficiales de latencia ni throughput.
- Opciones de despliegue: transformers (metodo documentado por el autor), text-generation-inference (el modelo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`). No se documentan recetas para vLLM, llama.cpp u Ollama, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3-0.6B + GRPO) | 596 M | no disponible | 94,9% (validacion, 999 preguntas) | Apache 2.0 | Hugging Face |
| Qwen3-0.6B (base) | 596 M | no disponible | 62,6% (misma validacion) | Apache 2.0 | Hugging Face |
| Alternativas especializadas en aritmetica de 3 cifras | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos publicados es frente al modelo base del que deriva. No se dispone de informacion sobre otros ajustes especializados comparables.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente con prompts de multiplicacion de tres cifras en el formato descrito; el resto de capacidades del modelo base no se midio y pueden haberse degradado.
- Alrededor del 5% de las respuestas siguen siendo incorrectas; los errores restantes son en su mayoria deslices de una cifra en productos parciales.
- A veces repite la instruccion de formato despues de la respuesta, por ejemplo `\boxed{233748} (put inside \boxed{} as specified)`. Los evaluadores que lean solo el ultimo `\boxed{}` pueden descartar respuestas correctas.
- El split de test no se ha evaluado, por lo que la cifra del 94,9% corresponde a validacion.
- Requiere usar el formato de prompt y los parametros de muestreo con los que se entreno y evaluo (modo no-thinking, temperatura 0.7, top-p 0.8, top-k 20, hasta 512 tokens nuevos); otros ajustes pueden degradar el rendimiento.
- No hay informacion publicada sobre sesgos, idiomas soportados ni comportamiento fuera del dominio aritmetico.
- La licencia Apache 2.0 permite uso comercial, pero no se han publicado evaluaciones de robustez en produccion ni de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/puravmanot/qwen3-0.6b-three-digit-multiplication-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Libreria TRL (usada para el entrenamiento GRPO): no se proporciona enlace en la informacion disponible
- Paper o blog del autor: no disponible
- Repositorio de codigo o demo: no disponible
