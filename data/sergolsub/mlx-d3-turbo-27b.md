# sergolsub/mlx-d3-turbo-27B

## Resumen

sergolsub/mlx-d3-turbo-27B es una conversión a 8 bits en formato MLX del modelo vllm-sr/d3-turbo, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo nuevo ni de un fine-tuning: es una cuantización del upstream BF16 sin reentrenamiento ni cambios de arquitectura, pensada para reducir el peso en disco y la memoria residente durante la inferencia.

El modelo base d3-turbo pertenece a la familia qwen3_5 (según los tags del repositorio) y cuenta con 26.085.330.160 parámetros totales (unos 26,1 mil millones), lo que sitúa el archivo en 27,9 GB de repositorio y 27,85 GB en disco tras la cuantización a 8 bits. La model card documenta un modo de decisión específico (`decide`) con cuatro tipos de tarea: binaria/noul, elección entre criterios, puntuación y localización de cajas (box), además de procesamiento de imagen y texto.

Su relevancia es acotada pero clara: ofrece una vía práctica para ejecutar un modelo de 27B en un Mac con 48 GB de memoria unificada, con métricas de latencia y calidad medidas por el autor en hardware concreto (Mac mini M4 Pro 48 GB). Es un artefacto de despliegue, no un modelo de propósito general con benchmarks estándar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5), con capas de atención lineal (`linear_attn`) y cabecera de decisión (`decision_config.json` / `joint_config.json`) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); existe una versión 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (layout MLX), más `config.json`, tokenizer, `chat_template.jinja` y scripts `*_mlx.py` |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo base. Se sabe que d3-turbo es un transformer de la familia qwen3_5 con 26,1 mil millones de parámetros y que incorpora al menos una capa de atención lineal (el tensor con mayor error de cuantización es `language_model.layers.0.linear_attn.in_proj_b.weight`). El repositorio incluye artefactos propios de un modo de decisión: `decision_config.json`, `joint_config.json` y un módulo `d3_mlx.py` de 40.757 bytes que implementa la interfaz `D3(path).decide(...)`.

La conversión realizada por sergolsub es una cuantización a 8 bits de los shards BF16 originales, con conversión en streaming y sin reentrenamiento. El autor publica una auditoría de cuantización a nivel de tensor: 1183 tensores comparados, KL media de 3,52e-04 y KL máxima de 6,57e-03, con 581 tensores con KL distinto de cero. No hay datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Clasificación y decisión estructurada mediante la API `decide`: tareas de tipo `noul` (sí/no), `choice` (selección entre criterios), `score` (puntuación ordinal sobre una lista de criterios) y `box` (localización de objetos en imagen).
- Procesamiento conjunto de texto e imagen: la model card reporta evaluaciones con imágenes de 512x512 acompañadas de texto.
- Generación de texto y chat: el repositorio incluye `chat_template.jinja` y tokenizer estándar, lo que permite uso conversacional a través de `mlx_lm`.
- Salida de probabilidades de decisión, lo que habilita calibración y cálculo de KL frente a la referencia.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar una incidencia en categorías como facturación o envío mediante `decide` con tipo `choice`, usando las instrucciones y criterios definidos por el desarrollador. La latencia medida (mediana de 2461 ms por decisión) es adecuada para procesamiento por lotes o colas asíncronas.
- Detección de intención de reembolso: con el tipo `noul`, se puede determinar si el cliente solicita un reembolso a partir del texto del mensaje, integrándolo en un flujo de atención al cliente previo a la intervención humana.
- Priorización de incidencias técnicas: el tipo `score` con criterios ordinales (por ejemplo, cosmético, molesto, bloqueante) permite asignar severidad a errores de sistema y enrutarlos al equipo correspondiente.
- Localización de objetos en imágenes: el tipo `box` devuelve la posición de un elemento descrito en texto sobre una imagen de 512x512, útil en tareas de verificación visual o anotación asistida. El coste medido es de aproximadamente 7830 ms por caja en el hardware de referencia.
- Moderación o verificación de contenido visual y textual: la combinación de entrada de imagen y texto con salidas de decisión permite construir filtros que evalúan si una imagen cumple una condición descrita.
- Despliegue local en estaciones de trabajo Apple Silicon: al ocupar 17,69 GB de memoria residente pico y cargar en 9,5 s, es viable para prototipos y herramientas internas en un Mac mini M4 Pro de 48 GB sin depender de GPU dedicadas.
- Evaluación de cuantizaciones: el repositorio incluye `kl_audit.json` y scripts de auditoría, por lo que sirve como referencia para comparar el impacto de 8 bits frente a 4 bits en tareas de decisión.

## Benchmarks y rendimiento

El autor publica métricas propias sobre un conjunto de evaluación no especificado, medidas en un Mac mini M4 Pro de 48 GB con MLX 8 bits:

| Version | Accuracy | noul | choice | score | PPL | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|
| original (bf16) | no medida | no medida | no medida | no medida | no medida | no medida | no medida |
| 8-bit (este repo) | 87,8% | 95,0% | 84,0% | 80,0% | 2,060 | 27,85 GB | 2461 ms |
| 4-bit | 84,4% | 85,0% | 84,0% | 84,0% | 2,075 | 14,87 GB | 2119 ms |

Métricas adicionales del 8 bits en el mismo hardware: carga de 9,5 s, RSS pico de 17,69 GB, 479 tokens de texto en 4577 ms (binaria), 4859 ms (multicríterio) y 4575 ms (puntuación); imagen 512x512 más texto en torno a 7506-7515 ms; caja 512x512 en 7830 ms; rendimiento sostenido de 0,62 decisiones cortas por segundo.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 17,69 GB de RSS pico medido para la versión 8 bits; el archivo en disco ocupa 27,85 GB.
- Hardware de referencia validado: Mac mini M4 Pro con 48 GB de memoria unificada.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el formato MLX está orientado a Apple Silicon.
- ¿Cabe en GPU de consumo? No hay datos para GPUs NVIDIA; en Apple Silicon requiere al menos 32 GB de memoria unificada para operar con margen, según el pico medido de 17,69 GB.
- Opciones de despliegue: `mlx_lm` y el cargador propio `d3_mlx.py` incluido en el repositorio. vLLM, llama.cpp, Ollama o TGI no están documentados para este artefacto.
- Latencia y throughput: mediana de 2461 ms por decisión y 0,62 decisiones cortas por segundo en el hardware de referencia; 4577-4859 ms para 479 tokens de texto según el tipo de tarea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sergolsub/mlx-d3-turbo-27B | 26,1B | no disponible | 8 bits MLX | apache-2.0 | Hugging Face, 435 descargas |
| sergolsub/d3-turbo-27B-MLX-4bit | 26,1B | no disponible | 4 bits MLX | apache-2.0 | Hugging Face |
| vllm-sr/d3-turbo (upstream) | 26,1B | no disponible | BF16 | apache-2.0 | Hugging Face |

La comparación con modelos de otras familias (Qwen, Llama, Mistral) no está disponible en la información proporcionada, ya que no se han publicado benchmarks estándar que permitan situar d3-turbo frente a alternativas de tamaño similar.

## Limitaciones y advertencias

- El modelo base no publica métricas de referencia en BF16: la tabla del autor marca "not measured" para el original, por lo que no es posible cuantificar la pérdida real de calidad frente al upstream.
- Las métricas de calidad (accuracy 87,8%, PPL 2,060) proceden de un conjunto de evaluación propio del autor no descrito; no son comparables con benchmarks estándar.
- La cuantización a 8 bits introduce desviaciones medibles: KL media de 3,52e-04 y máxima de 6,57e-03 a nivel de tensor, con 581 tensores afectados.
- El formato MLX limita el despliegue a Apple Silicon; no hay soporte documentado para CUDA, vLLM o llama.cpp.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgo de alucinación específico del modelo base.
- La licencia apache-2.0 se hereda del upstream; en caso de conflicto prevalece la licencia del repositorio original.
- El uso está orientado a tareas de decisión estructurada; no hay evidencia publicada de rendimiento en generación abierta, código o matemáticas.
- El rendimiento de 0,62 decisiones por segundo limita su uso en escenarios de baja latencia o alto volumen en tiempo real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mlx-d3-turbo-27B
- Modelo base: https://huggingface.co/vllm-sr/d3-turbo
- Versión 8 bits referenciada: https://huggingface.co/sergolsub/d3-turbo-27B-MLX-8bit
- Versión 4 bits: https://huggingface.co/sergolsub/d3-turbo-27B-MLX-4bit
