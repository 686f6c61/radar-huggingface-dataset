# mrysh/qwen3.5-4b-prune_depth_10_lora_kd_fp8

## Resumen

`mrysh/qwen3.5-4b-prune_depth_10_lora_kd_fp8` es un modelo derivado de Qwen3.5-4B obtenido mediante un pipeline de compresión en tres etapas: poda de profundidad (eliminación del 10 % de las capas), destilación LoRA desde el modelo original sin podar y cuantización FP8 con NVIDIA ModelOpt. Lo publica el usuario `mrysh` como último paso de un experimento de compresión de LLM dentro de un benchmark propio, y no como un modelo pensado para uso general. El resultado es un checkpoint de 3.866.979.776 parámetros (aproximadamente 3,87 mil millones) que ocupa 4,53 GB en disco, frente a los 8,41 GB del modelo original.

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de recuperación de capacidades tras una poda agresiva: la poda sola hunde la precisión de function calling del 88,0 % al 34,2 %, y la destilación LoRA posterior la devuelve al 87,5 %, prácticamente el nivel del original. Por otro, muestra el coste de la cuantización FP8 sobre ese checkpoint destilado: una pérdida de 0,5 puntos en BFCL, 1,6 en MedQA y una ganancia de 4,2 puntos en el benchmark de sesgo de contratación, con un aumento de velocidad de 1,52x.

Se trata de un modelo de texto (tag `qwen3_5_text`) con arquitectura transformer de la familia Qwen3.5, del que no se publican en la información disponible ni la longitud de contexto, ni los idiomas soportados, ni la licencia concreta, más allá de la indicación de que se aplica la licencia del modelo base. El modelo tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 19 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 3.866.979.776 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (8 bits, group size per output channel); pesos derivados de un checkpoint BF16/FP16 podado y destilado |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se indica que aplica la licencia del modelo base `Qwen/Qwen3.5-4B`) |
| Formato de pesos | safetensors (repo de 4,5 GB; 4,53 GB en disco tras cuantización) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, un transformer denso de la familia Qwen3.5. Sobre él se aplican tres transformaciones secuenciales. Primero, una poda de profundidad que elimina el 10 % de las capas, generando `mrysh/qwen3.5-4b-prune_depth_10`. Segundo, una destilación LoRA desde el modelo original sin podar, que da lugar a `mrysh/qwen3.5-4b-prune_depth_10_lora_kd`; esta etapa es la que recupera la mayor parte de la capacidad perdida por la poda. Tercero, una cuantización FP8 con `nvidia-modelopt` 0.48.0, calibrada sobre 512 textos del fichero de calibración del benchmark (171 peticiones BFCL, 171 de hiring y 171 de Energy-QA), con un tiempo de cuantización de 146 segundos en una NVIDIA L40.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del corpus de destilación ni si hubo RLHF o DPO. La model card advierte explícitamente de que el corpus de destilación contenía peticiones con el formato de los tests de BFCL y MedQA, lo que constituye un caveat importante a la hora de interpretar los resultados: parte de la recuperación de rendimiento en esos benchmarks puede deberse a solapamiento de formato entre entrenamiento y evaluación. La cuantización, en cambio, no añade datos de ese tipo. Los ajustes de cuantización quedan almacenados en el `config.json` del repositorio, de modo que vLLM los detecta automáticamente.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-4B.
- Function calling / tool calling: es la capacidad central evaluada en el benchmark del autor, con un 87,0 % de precisión global en BFCL.
- Llamadas a una sola función (89,8 %), elección entre varias funciones (94,2 %), varias llamadas simultáneas (79,6 %) y varias llamadas con elección (82,9 %).
- Detección de "ninguna función encaja": 91,1 % de respuestas correctas.
- Formato de llamada válido: solo 2 respuestas sin formato válido de 774, frente a 437 en el modelo solo podado.
- Razonamiento clínico tipo MedQA: 68,1 % de acierto en opción múltiple.
- Modo "thinking" desactivado en todas las evaluaciones publicadas; no se documenta el comportamiento con thinking activado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles; el tag `qwen3_5_text` sugiere que es un modelo exclusivamente de texto.

## Casos de uso

- Despliegue de function calling en producción con restricciones de VRAM: el modelo mantiene el 87,0 % de precisión en BFCL del original con 4,53 GB en disco, lo que permite servirlo en GPUs de 24 GB o menos y liberar memoria para el resto del stack.
- Agentes con múltiples herramientas: la precisión del 94,2 % al elegir entre varias funciones y del 82,9 % en varias llamadas con elección lo hace apto para orquestadores de agentes que deben decidir qué herramienta invocar en cada turno.
- Enrutamiento de peticiones y APIs: la capacidad de responder correctamente "ninguna función encaja" en el 91,1 % de los casos permite usarlo como clasificador de intención antes de llamar a un backend real.
- Asistencia clínica de triaje informativo: con un 68,1 % en MedQA puede emplearse en tareas de apoyo a la decisión con revisión humana obligatoria, nunca como sustituto de criterio médico.
- Evaluación de sesgo en procesos de selección: el modelo obtiene un 83,0 % de acierto en el benchmark de sesgo de contratación, por encima del 77,4 % del original, lo que lo hace útil como banco de pruebas de decisiones de contratación simuladas.
- Servicio de inferencia de alto throughput: con 111,3 tokens/s por usuario en una L40 y vLLM, es adecuado para prototipos y entornos de desarrollo donde el coste por token importa más que la precisión absoluta.
- Investigación en compresión de modelos: sirve como referencia reproducible del pipeline poda → destilación → cuantización, con los tres checkpoints intermedios publicados por el mismo autor.

## Benchmarks y rendimiento

Resultados publicados por el autor. Decodificación greedy, thinking desactivado, vLLM 0.34 sobre una NVIDIA L40, mismas preguntas para todos los modelos: 977 de BFCL, 1273 de MedQA y 288 de sesgo de contratación.

| Metrica | Original | Pruned | Pruned + distillation | Este modelo (FP8) |
|---|---|---|---|---|
| BFCL, function-call accuracy (todas) | 88,0 % | 34,2 % | 87,5 % | 87,0 % |
| BFCL, una función | 90,8 % | 61,2 % | 91,1 % | 89,8 % |
| BFCL, elegir entre varias funciones | 92,8 % | 50,0 % | 94,2 % | 94,2 % |
| BFCL, varias llamadas a la vez | 83,3 % | 1,9 % | 80,9 % | 79,6 % |
| BFCL, varias llamadas con elección | 83,5 % | 4,1 % | 81,8 % | 82,9 % |
| BFCL, "ninguna función encaja" correcto | 91,6 % | 88,7 % | 92,1 % | 91,1 % |
| BFCL, respuestas sin formato válido (de 774) | 1 | 437 | 5 | 2 |
| MedQA, acierto de opción | 70,8 % | 66,3 % | 69,8 % | 68,1 % |
| Hiring bias, acierto de decisión | 77,4 % | 67,4 % | 78,8 % | 83,0 % |
| Tamaño en disco (GB) | 8,41 | 7,75 | 7,75 | 4,53 |
| Velocidad (tokens/s, un usuario, vLLM, L40) | 73,2 | 70,8 | 80,1 | 111,3 |

Frente al modelo destilado sin cuantizar, este checkpoint pierde 0,5 puntos en BFCL, 1,6 en MedQA y gana 4,2 en Hiring. El autor advierte de que diferencias de uno o dos puntos están dentro del ruido de estos conjuntos: el intervalo del 95 % es de aproximadamente ±2 puntos en BFCL, ±3 en MedQA y ±5 en Hiring. La ganancia en Hiring, por tanto, es la única que supera claramente el margen de error. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan 4,53 GB; con overhead de KV cache y activaciones, el modelo cabe holgadamente en GPUs de 12 GB y ajustadamente en 8 GB con contexto corto.
- GPU recomendadas: NVIDIA L40 (única configuración validada por el autor), A100, H100, L4 y RTX 4090.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con margen amplio y en RTX 4080/4070 Ti (16 GB); en GPUs de 8 GB requiere reducir contexto o usar cuantización adicional.
- Opciones de despliegue: vLLM 0.34 es la opción documentada y la única probada; el `config.json` incluye los parámetros de cuantización que vLLM lee automáticamente. No se documenta soporte para llama.cpp, Ollama ni TGI, y el formato FP8 de ModelOpt limita las alternativas.
- Latencia y throughput: 111,3 tokens/s por usuario en una L40 con vLLM, decodificación greedy y thinking desactivado. Es 1,52x la velocidad del modelo original (73,2 tokens/s) y 1,39x la del destilado sin cuantizar (80,1 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL (todas) | MedQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (FP8) | 3,87 B | no disponible | 87,0 % | 68,1 % | no disponible | Hugging Face, 0 descargas |
| `Qwen/Qwen3.5-4B` (original) | ~4 B | no disponible | 88,0 % | 70,8 % | no disponible | Hugging Face |
| `mrysh/qwen3.5-4b-prune_depth_10_lora_kd` | ~4 B | no disponible | 87,5 % | 69,8 % | no disponible | Hugging Face |
| `mrysh/qwen3.5-4b-prune_depth_10` (solo poda) | ~4 B | no disponible | 34,2 % | 66,3 % | no disponible | Hugging Face |

La comparación relevante es interna al propio experimento: el modelo FP8 iguala prácticamente al destilado sin cuantizar en function calling con la mitad de tamaño en disco, y supera claramente al checkpoint solo podado. No se dispone de datos de benchmarks de modelos de terceros de tamaño comparable en la información proporcionada, por lo que no se puede establecer una comparación externa fiable.

## Limitaciones y advertencias

- Una sola cuantización y una sola evaluación por modelo, sin repeticiones: los resultados no incluyen estimación de varianza más allá de los intervalos teóricos citados por el autor.
- Solo probado con vLLM 0.34 en una NVIDIA L40, thinking desactivado y decodificación greedy; el comportamiento con otras configuraciones de muestreo o motores de inferencia no está documentado.
- El corpus de destilación contenía peticiones con el formato de los tests de BFCL y MedQA, por lo que los resultados en esos benchmarks pueden estar inflados por solapamiento de formato. La cuantización no añade datos de ese tipo, pero la comparación con el original sigue afectada por este sesgo.
- La poda de profundidad del 10 % degrada gravemente el function calling sin destilación (34,2 % frente a 88,0 %); cualquier modificación adicional del checkpoint parte de una base ya comprimida.
- Licencia no declarada explícitamente: se indica que aplica la del modelo base, pero no se detalla si permite uso comercial. Verificar antes de cualquier despliegue en producción.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingüe equivalente al del modelo original.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con ventanas largas.
- Riesgo de alucinación no evaluado en la información disponible; el 68,1 % en MedQA implica un 31,9 % de respuestas incorrectas en un dominio sensible.
- Modelo con 0 descargas y 0 likes: sin validación por parte de la comunidad, pensado como artefacto de investigación más que como modelo listo para producción.
- El formato FP8 de NVIDIA ModelOpt puede limitar la portabilidad a ecosistemas distintos de vLLM y GPUs NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-4b-prune_depth_10_lora_kd_fp8
- Modelo base del pipeline (destilado): https://huggingface.co/mrysh/qwen3.5-4b-prune_depth_10_lora_kd
- Modelo intermedio (solo poda): https://huggingface.co/mrysh/qwen3.5-4b-prune_depth_10
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Librería de cuantización: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- vLLM: https://github.com/vllm-project/vllm
