# huggingtime12/Qwen3-4B-noSFT-PhoMT-GRPO-COMET

## Resumen

Qwen3-4B-noSFT-PhoMT-GRPO-COMET es un adaptador LoRA (PEFT) publicado por el usuario huggingtime12 sobre el modelo base Qwen/Qwen3-4B. Se trata de un ajuste fino orientado a generacion de texto y conversacion, entrenado con GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo empleada habitualmente para mejorar el razonamiento y la calidad de las respuestas en modelos de lenguaje. El nombre del repositorio sugiere un entrenamiento sin SFT previo ("noSFT") y el uso de la libreria TRL para el proceso de RL.

El modelo no constituye un artefacto autonomo: al ser un adaptador LoRA, requiere cargar el modelo base Qwen/Qwen3-4B y aplicar los pesos del adaptador mediante PEFT. El repositorio ocupa aproximadamente 0,5 GB, coherente con el tamano de un adaptador de bajo rango sobre un modelo de 4 mil millones de parametros. La model card esta practicamente vacia (plantilla sin rellenar), por lo que la mayoria de los datos tecnicos, de entrenamiento y de evaluacion no estan disponibles.

La relevancia de esta ficha es limitada pero ilustrativa: muestra el patron de publicaciones de adaptadores experimentales de RL sobre modelos abiertos, un formato cada vez mas comun en Hugging Face. Dado que no hay benchmarks, licencia declarada ni documentacion de datos de entrenamiento, debe tratarse como un artefacto de investigacion y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3-4B |
| Parametros totales | Modelo base: 4 mil millones (aproximado, segun denominacion Qwen3-4B); adaptador: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-4B, no confirmada en la card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con GRPO mediante la libreria TRL (version de PEFT indicada: 0.18.0). El modelo base es Qwen/Qwen3-4B, un transformer decoder-only de la familia Qwen3. El adaptador modifica un subconjunto de pesos del modelo base mediante matrices de bajo rango, lo que explica el tamano reducido del repositorio (0,5 GB) frente al modelo completo.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos, los hiperparametros de GRPO (tamano de grupo, tasa de aprendizaje, funcion de recompensa) ni sobre si se aplicaron etapas previas de SFT. El nombre "noSFT" sugiere que el entrenamiento por refuerzo se aplico directamente sobre el modelo base sin una fase supervisada previa, pero esto no esta documentado en la card. Tampoco se detalla el proceso de generacion de recompensas ni el dominio de la tarea optimizada.

## Capacidades

- Generacion de texto y conversacion: el adaptador esta etiquetado como text-generation y conversational, por lo que se espera que herede las capacidades conversacionales del modelo base Qwen3-4B.
- Razonamiento: el uso de GRPO sugiere un objetivo de mejora del razonamiento, aunque no hay evidencia documentada de su eficacia.
- Soporte de tool calling: no disponible (no confirmado en la card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingues: no disponibles (no declaradas).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en RL para LLM: el adaptador sirve como punto de partida para reproducir o comparar experimentos de GRPO sobre Qwen3-4B, aplicando el adaptador con PEFT sobre el modelo base.
- Experimentacion con LoRA: util para estudiar el efecto de un ajuste por refuerzo sin SFT previo sobre las respuestas del modelo base en tareas de razonamiento.
- Evaluacion comparativa de adaptadores: permite contrastar el comportamiento del modelo base frente al adaptador en tareas de generacion y conversacion, siempre que se realice una evaluacion propia.
- Prototipado de chatbots experimentales: puede integrarse en entornos de prueba donde se cargue Qwen3-4B con el adaptador para generar respuestas conversacionales, asumiendo los riesgos de falta de documentacion.
- Fine-tuning posterior: el adaptador puede servir como inicializacion para nuevos ciclos de entrenamiento con TRL sobre el mismo modelo base.
- Docencia y demostraciones: adecuado para ilustrar el flujo de publicacion de adaptadores PEFT y el uso de GRPO en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-4B en precision fp16 requiere aproximadamente 8 GB de VRAM; en cuantizacion de 4 bits, alrededor de 2,5-3 GB. El adaptador anade una sobrecarga minima (repo de 0,5 GB).
- GPU recomendadas: A100, H100 o L40S para inferencia en fp16 con contexto largo; RTX 4090 o RTX 3090 para fp16 en contextos moderados.
- GPU de consumo: cabe en GPUs consumer con 8 GB o mas en cuantizacion de 4 bits (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070); en fp16 requiere al menos 10-12 GB para margen operativo (RTX 3080, RTX 4070 Ti, RTX 4080).
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM y TGI para servir el modelo base fusionado con el adaptador (requiere fusion previa de pesos); llama.cpp y Ollama solo si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-noSFT-PhoMT-GRPO-COMET | 4B (base) + adaptador LoRA | no disponible | no disponible | safetensors (PEFT) | Adaptador experimental con GRPO, sin benchmarks |
| Qwen/Qwen3-4B (base) | 4B | no disponible en esta ficha | no disponible en esta ficha | safetensors | Modelo base oficial, sin ajuste por refuerzo |
| Qwen2.5-3B / Qwen2.5-7B | 3B / 7B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Alternativas de la generacion anterior de Qwen |

La comparativa se limita a senalar la relacion con el modelo base y con otras variantes de la familia Qwen; no hay datos de rendimiento del adaptador para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card esta sin rellenar: no hay informacion sobre datos de entrenamiento, hiperparametros, funcion de recompensa ni evaluacion.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse la licencia del modelo base Qwen3-4B y la del adaptador por separado.
- No hay benchmarks publicados; el rendimiento real del adaptador es desconocido y puede degradar capacidades del modelo base.
- Al ser un adaptador LoRA, no es usable de forma autonoma: requiere cargar Qwen/Qwen3-4B y aplicar PEFT.
- Riesgo de alucinacion y sesgos: no documentados; se heredan los del modelo base y se anaden los del proceso de RL, sin analisis publicado.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingue.
- El entrenamiento con GRPO sin SFT previo puede producir respuestas menos estables o desalineadas; se recomienda evaluacion exhaustiva antes de cualquier uso en produccion.
- Repositorio con cero descargas y cero likes: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/huggingtime12/Qwen3-4B-noSFT-PhoMT-GRPO-COMET
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Referencia citada en la card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML: https://mlco2.github.io/impact#compute
