# miyuki17/openevo-h136-qwen25-7b-webshop-lora

## Resumen

Este repositorio contiene un adapter LoRA experimental de rango 4, llamado `openevo-h136-qwen25-7b-webshop-lora`, publicado por el usuario `miyuki17` como parte del estudio OpenEvo H1.36. Se trata de un checkpoint de investigación que aplica el método SD-LoRA (self-distillation LoRA) de entrenamiento continuo sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`, utilizando únicamente 31 trayectorias exitosas generadas por el propio modelo base congelado en el benchmark WebShop. El objetivo era explorar si el modelo podía mejorar su rendimiento en tareas de compra online mediante autoevolución, pero el resultado es un **resultado experimental negativo**: no se observó ninguna mejora agregada respecto al base.

El adapter está publicado con fines de reproducibilidad y análisis de fallos, no como un modelo listo para producción. La evaluación limitada muestra una puntuación media de 0.050000 frente a 0.053625 del base congelado, una diferencia de -0.003625. El repositorio incluye los pesos del adapter en formato safetensors, la configuración PEFT, un manifiesto de liberación con checksums y la licencia Apache-2.0. No incluye los pesos del modelo base, el corpus de WebShop ni los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-7B-Instruct) |
| Parametros totales | 7.610 millones (base) + adapter LoRA de rango 4 (parametros adicionales no especificados, tipicamente < 1% del base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado del base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No especificados para el adapter; el base admite cuantizaciones habituales (GPTQ, AWQ, GGUF) |
| Idiomas soportados | Ingles (el adapter se entreno solo con datos en ingles; el base soporta 29 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter LoRA) |

## Arquitectura y entrenamiento

El adapter se basa en la arquitectura Qwen2.5-7B-Instruct, un transformer decoder-only denso con attention completa, entrenado por Alibaba Cloud sobre 18 billones de tokens. El adapter LoRA tiene rango y alpha de 4, y se aplica únicamente a los módulos `q_proj` y `v_proj` de las capas de atención. El entrenamiento utilizó el método OpenEvo SD-LoRA continual SFT, que consiste en hacer que el modelo base congelado genere trayectorias en el entorno WebShop, seleccionar las exitosas y usarlas como datos de entrenamiento para el adapter. Se emplearon 31 trayectorias exitosas de 8 identidades de tareas de entrenamiento, con 1 época y 8 pasos de optimización, tasa de aprendizaje de 2e-4 y precisión bfloat16. La pérdida final fue de 0.9816 y el tiempo de entrenamiento registrado fue de 10.28 segundos en una NVIDIA GeForce RTX 5090 con un pico de memoria de 16.4 GB.

El resultado es un claro ejemplo de no mejora: la evaluación final con 8 tareas disjuntas y 4 rollouts deterministas por tarea (32 intentos válidos por rama) mostró que el adapter obtiene una puntuación media de 0.050000 frente a 0.053625 del base congelado. El autor subraya que no hay evidencia de mejora agregada, robustez, retención o transferencia.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen2.5-7B-Instruct, incluyendo generacion de texto, razonamiento, codigo y matematicas.
- Agente en WebShop: el adapter fue entrenado para interactuar con el entorno WebShop (busqueda de productos, seleccion de opciones, compra), aunque sin mejora demostrada sobre el base.
- Tool calling: el base Qwen2.5-7B-Instruct soporta function calling, pero no hay evidencia de que el adapter mejore o mantenga esta capacidad tras el entrenamiento.
- Multilingue: el base soporta 29 idiomas, pero el adapter se entreno solo con datos en ingles; no se ha evaluado su comportamiento en otros idiomas.
- Capacidades especiales: ninguna adicional; es un adapter experimental sin modo de pensamiento, vision ni audio.

## Casos de uso

- Reproduccion de experimentos de autoevolucion: el checkpoint sirve para reproducir el estudio OpenEvo H1.36 y analizar por que el SD-LoRA no mejoro el rendimiento en WebShop. Se puede cargar con PEFT y comparar contra el base congelado.
- Analisis de fallos en agentes: util para investigar los limites del entrenamiento con datos autogenerados y las condiciones bajo las cuales la autodestilacion no produce mejoras.
- Estudio de metodos LoRA de bajo rango: el adapter de rango 4 sobre solo dos proyecciones permite estudiar el impacto de la capacidad del adapter en tareas de agente.
- Comparacion de metricas de evaluacion: los 32 intentos validos por rama y las puntuaciones medias documentadas ofrecen un punto de referencia para metodologias de evaluacion de agentes.
- Desarrollo de pipelines de entrenamiento continuo: el manifiesto de liberacion y los detalles de configuracion (revision del base, seed, hiperparametros) permiten replicar el flujo de entrenamiento con otros benchmarks.
- No recomendado para uso en produccion: el autor lo advierte explicitamente; no debe usarse para compras reales, decisiones o sistemas de agente en entornos no controlados.

## Benchmarks y rendimiento

El unico benchmark disponible es la evaluacion limitada del propio estudio, presentada en la model card:

| Rama | Intentos validos | Puntuacion media | Positivos cualificados |
|---|---:|---:|---:|
| Base congelado | 32 / 32 | 0.053625 | 4 |
| Adapter LoRA | 32 / 32 | 0.050000 | 4 |
| Diferencia | — | -0.003625 | 0 |

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K para este adapter. El autor indica que el resultado no demuestra mejora ni generalizacion.

## Requisitos de hardware

- Inferencia: al ser un adapter LoRA, se carga sobre el modelo base Qwen2.5-7B-Instruct. En bfloat16, el base requiere aproximadamente 16 GB de VRAM; con cuantizacion de 4 bits, puede caber en GPUs con 8 GB (por ejemplo, RTX 3060, RTX 4060).
- GPU recomendada: para inferencia fluida, una GPU con al menos 16 GB (RTX 4090, A100, etc.). El entrenamiento se realizo en una RTX 5090 con 32 GB, aunque el pico de memoria fue de 16.4 GB.
- Opciones de despliegue: se puede cargar con `transformers` + `peft` en Python. Tambien es posible exportar a GGUF o usar vLLM si se fusiona el adapter con el base, aunque no se proporcionan instrucciones oficiales para ello.
- Latencia y throughput: no se han publicado datos especificos. El base Qwen2.5-7B en una GPU moderna genera típicamente entre 20 y 50 tokens por segundo en fp16, dependiendo de la longitud de contexto y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento en WebShop (media) |
|---|---|---|---|---|
| Qwen/Qwen2.5-7B-Instruct (base) | 7.6B | 128k | Apache-2.0 | 0.053625 |
| miyuki17/openevo-h136-qwen25-7b-webshop-lora | 7.6B + LoRA r4 | 128k | Apache-2.0 | 0.050000 |
| Otros adapters LoRA para WebShop | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparaciones con otros adapters especificos para WebShop. El unico punto de comparacion fiable es el propio modelo base, que supera al adapter en la evaluacion limitada.

## Limitaciones y advertencias

- Resultado experimental negativo: el adapter no mejora al base y no debe describirse como un modelo superior.
- Riesgo de alucinacion y errores: al ser un modelo de lenguaje generico, puede producir respuestas incorrectas o inventadas en tareas de agente.
- Sesgos: el entrenamiento con solo 31 trayectorias exitosas de un unico benchmark puede introducir sesgos hacia ese entorno especifico; no hay evidencia de generalizacion.
- Limitaciones de idioma: solo se evaluo en ingles; el comportamiento en otros idiomas es desconocido.
- Restricciones de uso: aunque la licencia Apache-2.0 permite uso comercial, el autor recomienda no usarlo en produccion ni para decisiones reales.
- Reproducibilidad parcial: el repositorio del experimento es privado, por lo que el launcher de entrenamiento exacto no es descargable de forma independiente.
- Datos de entrenamiento no incluidos: las trayectorias de WebShop no se redistribuyen por cuestiones de procedencia y licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/miyuki17/openevo-h136-qwen25-7b-webshop-lora
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Informe tecnico Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Repositorio SD-LoRA-CL: https://github.com/WuYichen-97/SD-Lora-CL
- Benchmark WebShop: https://github.com/princeton-nlp/WebShop
