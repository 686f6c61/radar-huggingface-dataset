# 294-288-pretrain-interaction-2/1B-fixed-v2

## Resumen

1B-fixed-v2 es un artefacto de investigación publicado por el colectivo 294-288-pretrain-interaction-2 en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de una continuación de las cuatro trayectorias de Pythia-1B (`Clean`, `fixed-MCG-r8`, `fixed-MCG-r16` y `fixed-MCG-r32`) iniciadas en el repositorio upstream del mismo autor. Cada trayectoria parte del estado de reanudación publicado allí y se entrena durante 100.000 millones de tokens adicionales con datos únicos de Dolma 3 en las categorías Math, Code y General, empleando inyección uniforme y un scheduler WSD v2.

El objetivo del proyecto es estudiar cómo interactúan distintas configuraciones de un mecanismo denominado MCG (con rangos r8, r16 y r32) frente a una línea base limpia durante el preentrenamiento a escala de 1B de parámetros. La relevancia es metodológica: el autor publica no solo los pesos finales, sino también los estados completos reanudables (pesos, optimizador AdamW y RNG), los resultados de evaluación por paso y el tooling de Slurm, lo que permite reproducir y auditar el experimento.

La arquitectura subyacente es GPT-NeoX, heredada directamente de EleutherAI/pythia-1b. El repositorio incluye checkpoints intermedios en los hitos de 16, 32, 64 y 100 mil millones de tokens (y 8 mil millones cuando el estado base es anterior), así como ramas de cooldown y control de 763 actualizaciones. La model card advierte explícitamente de que son artefactos experimentales de investigación, no modelos listos para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 1B (heredado de EleutherAI/pythia-1b) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; pesos publicados en bf16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) + config.json; estados de reanudacion en .pt |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura GPT-NeoX, tomada como base de EleutherAI/pythia-1b. Sobre esa base, el autor continúa el preentrenamiento con un plan de datos de 100.000 millones de tokens únicos procedentes del dataset Dolma 3, restringido a las categorías Math, Code y General. La receta emplea inyección uniforme y el scheduler WSD v2, y se ejecuta con el mismo código, plan y paquete de datos que el repositorio upstream.

La contribución técnica principal es el estudio de un mecanismo MCG con tres rangos (r8, r16, r32) frente a una trayectoria de control limpia. El entrenamiento se realizó sobre 8 GPU H100 (frente a las A100 del upstream), con el tronco en 8 GPU y las ramas en 1 GPU, manteniendo un batch de 8 rangos lógicos por 8 secuencias independientemente del número de GPU. El autor reporta que, en el estado de 7,75B de `fixed-MCG-r8`, 30 pasos en 1, 4 u 8 GPU terminan tan cerca del resultado con 2 GPU (relL2 de pesos 2,9e-4) como una segunda ejecución con 2 GPU. Se publican además ramas de cooldown y control de 763 actualizaciones evaluadas con el sweep-1112 Fixed eval.

## Capacidades

- Generación de texto autoregresiva propia de un modelo base GPT-NeoX de 1B parámetros.
- Razonamiento y generación de código y matemáticas, favorecidos por la mezcla de datos Dolma 3 Math/Code/General del entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso específico.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo thinking.
- Al ser un modelo base (no instruido), no incluye alineamiento RLHF/DPO documentado.

## Casos de uso

- Investigación sobre dinámicas de preentrenamiento: comparar las trayectorias `Clean`, `fixed-MCG-r8`, `fixed-MCG-r16` y `fixed-MCG-r32` a lo largo de los hitos de 16, 32, 64 y 100B de tokens para aislar el efecto del mecanismo MCG.
- Reproducción de experimentos: cargar los estados de reanudación (`1b/<run>/resume/step-N.pt` con `LATEST.json`) para continuar el entrenamiento exactamente desde el punto publicado, incluyendo pesos, AdamW y RNG.
- Estudio de estabilidad numérica y determinismo: el autor publica comparativas de convergencia entre 1, 2, 4 y 8 GPU, útiles para investigar la reproducibilidad del entrenamiento distribuido.
- Evaluación de schedulers y recetas: las ramas de cooldown y control de 763 actualizaciones permiten analizar el comportamiento del scheduler WSD v2 en la fase de decaimiento.
- Generación de texto como modelo base: uso en pipelines de investigación que requieran un modelo de 1B parámetros con pesos en bf16 y carga vía `GPTNeoXForCausalLM.from_pretrained` con subcarpeta.
- Análisis de mezcla de datos: el dataset Dolma 3 Math/Code/General de 100B tokens permite estudiar el efecto de la composición de datos en el rendimiento de código y matemáticas a escala 1B.
- Docencia y experimentación académica: el tooling de Slurm incluido (`1b/slurm/`) sirve como plantilla para lanzar experimentos de preentrenamiento en clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye ficheros de evaluación (`1b/<run>/eval/{stable,cooldown,control}-<step>.{json,npz}`) generados con el sweep-1112 Fixed eval, pero sus valores numéricos no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 1B parámetros en bf16 se sitúa en torno a 2 GB solo de pesos, más overhead de activaciones y KV cache.
- GPU de entrenamiento utilizadas: 8× H100 para el tronco y 1 GPU por rama (frente a las A100 del upstream).
- GPU recomendadas para inferencia: no especificadas; cualquier GPU con al menos unos pocos GB de VRAM debería poder cargar los pesos en bf16.
- Cabe en GPU de consumo: previsiblemente sí para un modelo de 1B en bf16 o cuantizado, aunque el autor no lo documenta.
- Opciones de despliegue: carga estándar vía `transformers` con `GPTNeoXForCausalLM.from_pretrained` usando el parámetro `subfolder`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1B-fixed-v2 (este) | 1B | no disponible | no disponible | Hugging Face, artefacto experimental | Continuación de Pythia-1B con MCG y WSD v2 |
| EleutherAI/pythia-1b | 1B | 2048 (por defecto en Pythia; no confirmado en esta ficha) | Apache 2.0 (según el modelo original; no confirmado aquí) | Hugging Face | Modelo base del que deriva; suite de checkpoints públicos |
| Otros modelos de 1B de la familia Pythia | 1B | no disponible | no disponible | Hugging Face | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto experimental de investigación: la propia model card lo califica como tal, sin garantías de calidad para uso en producción.
- Modelo base sin alineamiento: no se documenta RLHF, DPO ni instrucción, por lo que no es adecuado para diálogo directo sin ajuste posterior.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Licencia no disponible: no se puede confirmar si permite uso comercial; debe consultarse al autor antes de cualquier despliegue.
- Riesgo de sesgos y alucinaciones inherente a un modelo base entrenado sobre Dolma 3, sin evaluaciones de seguridad publicadas.
- Longitud de contexto no especificada en la información disponible.
- Los pesos se distribuyen en subcarpetas con hitos concretos; es necesario indicar el `subfolder` correcto al cargar, lo que añade complejidad operativa.
- El entrenamiento se realizó con hardware distinto al upstream (H100 frente a A100), aunque el autor reporta equivalencia en las actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/294-288-pretrain-interaction-2/1B-fixed-v2
- Repositorio upstream citado: https://huggingface.co/294-288-pretrain-interaction/1B-fixed-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/294-288-pretrain-interaction/dolma3-mcg-100b
- Código en GitHub: `294-288-pretrain-interaction/pretrain_interaction`, rama `hantao/uniform-wsd-v2` (commit 5af36a9c)
- Modelo base: https://huggingface.co/EleutherAI/pythia-1b
