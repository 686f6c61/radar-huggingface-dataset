# moltherm1/olmo-mirror-olmo-2-1124-7b

## Resumen

OLMo 2 7B es un modelo de lenguaje de tipo transformer decoder-only desarrollado por el Allen Institute for AI (AI2) dentro de la familia OLMo (Open Language Models). Este repositorio concreto (`moltherm1/olmo-mirror-olmo-2-1124-7b`) es un espejo del checkpoint base oficial `allenai/OLMo-2-1124-7B`, publicado con licencia Apache 2.0. El modelo está entrenado sobre 4 billones de tokens procedentes de los datasets OLMo-mix-1124 y Dolmino-mix-1124, con una longitud de contexto de 4096 tokens.

La relevancia de OLMo 2 radica en su carácter completamente abierto: AI2 publica pesos, código de entrenamiento, checkpoints intermedios y detalles del dataset, lo que permite reproducir y auditar el proceso de entrenamiento de principio a fin. Frente al OLMo 7B original, la familia OLMo 2 reporta una mejora de 9 puntos en MMLU, atribuida al uso de los nuevos datasets y a un enfoque de entrenamiento por etapas (staged training).

Este checkpoint corresponde a la etapa de modelo base (pre-entrenamiento), no a las variantes SFT, DPO o Instruct. Por tanto, está pensado como punto de partida para fine-tuning y para investigación sobre el propio proceso de entrenamiento, más que para uso directo en tareas conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 7B (aproximado, segun denominacion de la familia) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | 8 bits via bitsandbytes (mencionado en la model card); otros formatos no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 4,9 GB); GGUF no disponible |

Datos arquitectonicos adicionales: 32 capas, tamano oculto de 4096 y 32 cabezas de atencion.

## Arquitectura y entrenamiento

OLMo 2 7B es un transformer decoder-only con 32 capas, dimension oculta de 4096 y 32 cabezas de atencion, entrenado sobre 4 billones de tokens. El entrenamiento utiliza los datasets OLMo-mix-1124 y Dolmino-mix-1124 y sigue un enfoque de entrenamiento por etapas (staged training), que combina distintas fases de pre-entrenamiento con mezclas de datos especificas. AI2 publica checkpoints intermedios con la convencion de nombres `stepXXX-tokensYYYB`, asi como los "ingredients" de la mezcla final (`stage2-ingredientN-stepXXX-tokensYYYB`), lo que permite reproducir el proceso.

La familia OLMo 2 incluye etapas posteriores de SFT, DPO y RLVR (modelos Instruct) y un modelo de recompensa (RM), pero este repositorio corresponde unicamente al modelo base. No se dispone en la informacion proporcionada de detalles sobre la composicion exacta del dataset, el uso de RLHF/DPO en esta etapa ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Modelado de lenguaje autoregresivo y generacion de texto en ingles.
- Base para fine-tuning supervisado (SFT) y preferencias (DPO), con recetas publicadas en el repositorio OLMo y en Open Instruct.
- Capacidad de razonamiento y conocimiento general heredada del pre-entrenamiento, evaluable mediante benchmarks como MMLU.
- Soporte de cuantizacion de 8 bits mediante bitsandbytes para inferencia con menor huella de memoria.
- Acceso a checkpoints intermedios para estudiar la evolucion del modelo durante el entrenamiento.
- No se documenta soporte nativo de tool calling, function calling, agentes, vision, audio ni modo thinking en este checkpoint base.

## Casos de uso

- Investigacion sobre entrenamiento de LLM: el acceso a checkpoints intermedios y a los datasets permite estudiar la dinamica de aprendizaje y reproducir experimentos de pre-entrenamiento.
- Fine-tuning supervisado para dominios especificos: al ser un modelo base con licencia Apache 2.0, se puede adaptar a tareas como clasificacion de texto, resumen o extraccion de informacion en ingles.
- Entrenamiento con DPO o RLVR: las recetas publicadas en Open Instruct permiten alinear el modelo base para tareas conversacionales o de instrucciones.
- Generacion de texto en ingles en entornos con recursos limitados: con cuantizacion de 8 bits y 7B parametros, puede desplegarse en una unica GPU de gama alta consumer.
- Evaluacion comparativa de tecnicas de cuantizacion: la model card advierte de la sensibilidad del modelo cuantizado a tipos de datos y operaciones CUDA, lo que lo convierte en un caso de estudio util.
- Base para experimentos academicos de interpretabilidad: la apertura total de pesos y logs facilita analisis de representaciones internas y sesgos.

## Benchmarks y rendimiento

La model card indica una mejora de 9 puntos en MMLU respecto a OLMo 7B para la familia OLMo 2, pero no se proporcionan los valores absolutos ni resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la informacion disponible.

| Benchmark | OLMo 2 7B | Referencia |
|---|---|---|
| MMLU | no disponible (mejora de +9 puntos frente a OLMo 7B) | OLMo 7B |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14-16 GB para los 7B parametros mas overhead de activaciones y KV cache.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 8-10 GB.
- GPU recomendadas: A100 40GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en FP16.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090 y, con cuantizacion, en GPUs de 12-16 GB como RTX 4080 o RTX 4070 Ti.
- Opciones de despliegue: transformers (requiere instalar desde la rama main de GitHub para soporte de OLMo 2), bitsandbytes para cuantizacion. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo 2 7B (este checkpoint) | 7B | 4096 | Apache 2.0 | Pesos abiertos, checkpoints intermedios y codigo |
| OLMo 7B (original) | 7B | no disponible | Apache 2.0 | Pesos abiertos |
| OLMo 2 13B | 13B | 4096 | Apache 2.0 | Pesos abiertos |
| Alternativas de 7B tipo Llama/Mistral | no disponible en la informacion | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar dentro de la familia OLMo. No se dispone de datos de rendimiento ni especificaciones de modelos externos en esta busqueda.

## Limitaciones y advertencias

- Es un modelo base, no ajustado para instrucciones: no debe esperarse un comportamiento conversacional ni seguimiento de instrucciones sin fine-tuning previo.
- Entrenado exclusivamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto limitada a 4096 tokens, inferior a la de muchos modelos contemporaneos.
- Riesgo de alucinacion y de generar contenido sesgado o incorrecto, inherente a los modelos de lenguaje pre-entrenados.
- La model card advierte de que la version cuantizada es mas sensible a tipos de datos y operaciones CUDA, lo que puede provocar inestabilidad si no se gestionan bien las entradas en GPU.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base requiere trabajo adicional de alineamiento y evaluacion antes de un despliegue en produccion.
- Este repositorio es un espejo no oficial con 0 descargas; para uso en produccion conviene referenciar el repositorio oficial de AI2.

## Enlaces

- Repositorio espejo: https://huggingface.co/moltherm1/olmo-mirror-olmo-2-1124-7b
- Modelo base oficial: https://huggingface.co/allenai/OLMo-2-1124-7B
- Modelo SFT: https://huggingface.co/allenai/OLMo-2-1124-7B-SFT
- Modelo DPO: https://huggingface.co/allenai/OLMo-2-1124-7B-DPO
- Modelo Instruct (RLVR): https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Modelo de recompensa: https://huggingface.co/allenai/OLMo-2-1124-7B-RM
- Modelo 13B: https://huggingface.co/allenai/OLMo-2-1124-13B
- Dataset OLMo-mix-1124: https://huggingface.co/datasets/allenai/olmo-mix-1124
- Dataset Dolmino-mix-1124: https://huggingface.co/datasets/allenai/dolmino-mix-1124
- Repositorio de codigo OLMo: https://github.com/allenai/OLMo
- Repositorio Open Instruct: https://github.com/allenai/open-instruct
- Paper (arXiv): https://arxiv.org/abs/2501.00656
