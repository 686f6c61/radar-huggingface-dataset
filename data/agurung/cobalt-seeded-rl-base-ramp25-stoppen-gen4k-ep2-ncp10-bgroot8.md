# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-bgroot8

## Resumen

Este modelo es un checkpoint de reinforcement learning (RL) sobre Qwen3-4B-Instruct-2507, entrenado con el algoritmo GRPO mediante OpenRLHF. Ha sido desarrollado por el usuario agurung como parte de un experimento de la línea de investigación Cobalt (OSU-NLP-Group). El objetivo es mejorar la generación de código resolviendo problemas de programación que el modelo base no lograba resolver con alta frecuencia.

El checkpoint corresponde al paso global 12 de un run de RL llamado `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp10_bgroot8`. Se aplicó RL directamente sobre el modelo base Qwen3-4B-Instruct-2507 sin una fase previa de SFT (supervised fine-tuning). El modelo tiene 4.411 millones de parámetros y está disponible en formato safetensors. No se ha publicado información sobre licencia ni idiomas soportados.

La relevancia de este modelo radica en ser un ejemplo de aplicación de RL para mejorar capacidades de código en un modelo de 4B parámetros, con una recompensa binaria basada en la corrección de las soluciones generadas. Es un checkpoint intermedio, no un modelo final, y su principal valor es investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No especificado (pesos safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | No disponible (heredados de Qwen3-4B-Instruct-2507) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3-4B-Instruct-2507, un transformer decoder-only con atención por ventanas de contexto estándar y Grouped Query Attention (GQA). Al ser un modelo denso, todos los parámetros se activan en cada forward. No se han proporcionado detalles adicionales sobre la arquitectura interna en la información disponible.

El entrenamiento consistió en una fase de RL con el algoritmo GRPO (Group Relative Policy Optimization) implementado en OpenRLHF, sin penalización KL. Se utilizó una recompensa binaria de corrección de código: 1.0 si el programa generado pasa los tests del problema, 0.0 en caso contrario. Además, se aplicaron dos penalizaciones: una "stop-properly penalty" que asigna -1.0 a respuestas truncadas, y una penalización DAPO overlong que añade una penalización aditiva progresiva de hasta -0.25 para respuestas que superan un umbral de longitud. Se usaron 8 muestras por prompt, un batch de 128, y un máximo de 4096 tokens nuevos por rollout. El learning rate del actor fue constante en 1e-06. El entrenamiento se realizó sobre un conjunto de problemas del "frontier" cobalt-train (1833 problemas de entrenamiento y 112 de validación).

## Capacidades

- Generacion de codigo: el modelo esta especializado en producir programas que resuelven problemas de programacion, evaluados mediante tests de correccion.
- Razonamiento sobre problemas algoritmicos: al estar entrenado con RL sobre problemas de codigo, mejora su capacidad para razonar sobre soluciones.
- Generacion de texto en general: al estar basado en Qwen3-4B-Instruct-2507, conserva las capacidades de generacion de texto del modelo base, aunque su enfoque principal es el codigo.
- No se ha documentado soporte para tool calling, funcion calling, agentes, vision o audio en la informacion disponible.

## Casos de uso

- Generacion de codigo en entornos de desarrollo: el modelo puede utilizarse para autocompletar o generar funciones y algoritmos en respuesta a descripciones de problemas. Su entrenamiento con recompensa de correccion lo hace adecuado para tareas donde se requiere que el codigo pase tests.
- Resolucion de problemas de programacion competitiva: dado su entrenamiento en problemas del frontier de cobalt, es util para generar soluciones a problemas tipo leetcode o similar, aunque su rendimiento no ha sido publicado.
- Investigacion en RL para codigo: este checkpoint sirve como referencia para estudiar el efecto de GRPO sin KL penalty y las penalizaciones de truncamiento en modelos de codigo.
- Evaluacion de tecnicas de RL: al ser un checkpoint intermedio, puede usarse en experimentos de comparacion de algoritmos de RL.
- Fine-tuning adicional: puede servir como punto de partida para mas entrenamiento, ya que es un checkpoint de RL que podria continuar entrenandose.
- Generacion de tests unitarios: aunque no esta especificamente entrenado para ello, su capacidad de generar codigo podria adaptarse para crear tests.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el checkpoint fue seleccionado como el mejor por pass@8 en su run, pero no proporciona valores numericos. Los logs de entrenamiento se encuentran en Weights & Biases (proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp10_bgroot8`), pero no se han extraido metricas.

## Requisitos de hardware

- VRAM estimada: con 4.411 millones de parametros en bf16/fp16, se necesitan aproximadamente 8.8 GB de VRAM solo para los pesos. Con overhead de activaciones y KV cache, se recomienda al menos 12-16 GB para inferencia en fp16.
- GPU recomendadas: una RTX 3090 (24 GB) o RTX 4090 (24 GB) puede ejecutar el modelo comodamente en fp16. Una A100 (40 GB) o H100 (80 GB) para entornos de produccion con mayor throughput.
- En consumer GPU: si, cabe en GPUs de 16 GB o mas con cuantizacion (por ejemplo, GGUF Q4_K_M requeriria ~2.5 GB de pesos).
- Opciones de despliegue: vLLM (indicado en la model card), Hugging Face Transformers, llama.cpp para cuantizacion, Ollama (si se convierte a GGUF).
- Latencia y throughput: no hay datos publicados. Para un modelo de 4B, se puede esperar una latencia de alrededor de 20-50 ms por token en una GPU moderna, pero no esta confirmado.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria (generacion de codigo de ~4B). Se puede comparar con el modelo base Qwen3-4B-Instruct-2507 y con otros modelos de codigo de tamano similar, pero no hay metricas numericas disponibles.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 | 4.4B | 32K (segun documentacion publica) | Apache 2.0 (segun documentacion publica) | Modelo base, no especializado en codigo |
| Este checkpoint | 4.4B | No disponible | No disponible | RL sobre Qwen3-4B, especializado en codigo |
| DeepSeek-Coder-6.7B | 6.7B | 16K | MIT | Modelo de codigo, mayor tamano |

Nota: los datos de Qwen3-4B-Instruct-2507 y DeepSeek-Coder provienen de conocimiento general, no de la informacion proporcionada.

## Limitaciones y advertencias

- No se ha publicado la licencia, lo que impide determinar si es utilizable comercialmente. Se recomienda contactar con el autor antes de cualquier uso.
- Es un checkpoint intermedio de RL, no un modelo final. Su rendimiento fuera del conjunto de validacion especifico no esta garantizado.
- No se han proporcionado metricas de evaluacion, por lo que no se puede cuantificar su calidad respecto a otros modelos.
- El entrenamiento se centro en problemas de codigo del conjunto cobalt-train, lo que puede generar sobreajuste a ese tipo de problemas.
- Riesgo de alucinacion en codigo: puede generar programas que no compilan o no pasan los tests, especialmente fuera de su dominio de entrenamiento.
- No se ha documentado soporte para tool calling ni capacidades multimodales.
- Los idiomas soportados no estan especificados; probablemente hereda los de Qwen3-4B-Instruct-2507, pero no esta confirmado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-bgroot8
- Repositorio del proyecto Cobalt (OSU-NLP-Group): https://github.com/OSU-NLP-Group/cobalt
- Pagina del equipo ByteDance Seed (relacionado con el proyecto Cobalt): https://seed.bytedance.com/en/
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507 (no verificado en la busqueda, pero es el modelo base indicado)
