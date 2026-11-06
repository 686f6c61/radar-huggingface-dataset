# JaeWooShin/peft-rlvr

## Resumen

`JaeWooShin/peft-rlvr` es un repositorio de adaptadores PEFT (LoRA, DoRA, PiSSA y MiLoRA) entrenados mediante GRPO sobre el modelo base Qwen3-4B-Base, dentro de un estudio comparativo sobre métodos de ajuste eficiente de parámetros aplicados a RLVR (Reinforcement Learning with Verifiable Rewards). No es un modelo fundacional nuevo, sino un conjunto de artefactos de investigación: adaptadores intermedios cada 25 pasos, modelos finales fusionados en bf16, checkpoints de verl y rollouts de entrenamiento. Lo publica el usuario JaeWooShin bajo licencia Apache 2.0.

El interés del repositorio reside en su función como material reproducible: replica la receta del artículo "Evaluating Parameter Efficient Methods for RLVR" (arXiv 2512.23165) con rango 32, alpha 64, dropout 0.05 sobre todas las capas lineales del decodificador y learning rate 1e-5, usando el dataset English DAPO-Math-17k y 200 pasos de entrenamiento en una sola GPU por ejecución. Esto permite comparar directamente LoRA, DoRA, PiSSA y MiLoRA en la misma configuración de RL y con las mismas evaluaciones.

El modelo subyacente, Qwen3-4B-Base, aporta la arquitectura y el conocimiento lingüístico; los adaptadores solo modifican el comportamiento en razonamiento matemático. Por tanto, la ficha describe las capacidades heredadas del base y las específicas que añade el ajuste RLVR. El repositorio ocupa 0,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B-Base) con adaptadores PEFT de bajo rango |
| Parametros totales | 4B (modelo base); adaptadores de rango 32 sobre capas lineales (número exacto no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-4B-Base) |
| Tipos de cuantizacion | no disponible (los adaptadores se publican en fp32; el modelo fusionado en bf16) |
| Idiomas soportados | no disponibles (receta de entrenamiento en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT y modelo fusionado en bf16) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B-Base, un transformer decoder-only de 4.000 millones de parámetros. Sobre él se aplican adaptadores de bajo rango en todas las capas lineales del decodificador, con rango 32, alpha 64 y dropout 0.05, en cuatro variantes: LoRA estándar, DoRA (descomposición en magnitud y dirección), PiSSA (inicialización basada en SVD de los pesos) y MiLoRA (variante de inicialización con menor subespacio dominante). En PiSSA y MiLoRA se publica además el adaptador inicial A0/B0, ya que el entrenamiento se realizó sobre W − s·B0·A0, de modo que la reconstrucción final es W − s·B0·A0 + s·B·A.

El entrenamiento usa GRPO (Group Relative Policy Optimization) con recompensas verificables, siguiendo la receta del artículo arXiv 2512.23165: dataset English DAPO-Math-17k, 16 respuestas por pregunta, 64 preguntas por paso, 4 actualizaciones del optimizador por paso, clipping 0.2/0.28, sin término KL, respuestas de hasta 8k tokens, learning rate 1e-5 y 200 pasos. Se ejecutó con verl 0.10 en una GPU por ejecución. La validación se realiza cada 25 pasos (y antes de entrenar) sobre AIME24, AIME25, AMC23 (32 respuestas por problema) y MATH-500 (4 respuestas), a temperatura 0.6/top_p 0.95 y a temperatura 1.0/top_p 1.0, con métricas registradas en `results/metrics.jsonl`.

## Capacidades

- Razonamiento matemático reforzado mediante RLVR: el ajuste GRPO con recompensas verificables está orientado a mejorar la precisión en problemas de competición (AIME, AMC, MATH-500).
- Generación de cadenas de razonamiento largas: el entrenamiento contempla respuestas de hasta 8k tokens, lo que favorece soluciones paso a paso extensas.
- Generación de texto general y conocimiento lingüístico heredados de Qwen3-4B-Base.
- Capacidad multilingüe heredada del base, aunque el ajuste RLVR se realizó únicamente con datos en inglés.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta modo thinking explícito, visión, audio ni otras modalidades.
- El repositorio no está pensado como modelo de chat: es material de investigación con adaptadores intermedios y finales.

## Casos de uso

- Reproducción de experimentos de RLVR: el repositorio incluye rollouts, métricas, checkpoints de verl y adaptadores cada 25 pasos, lo que permite reanudar o auditar el entrenamiento con la misma receta (DAPO-Math-17k, 200 pasos, una GPU).
- Comparación de métodos PEFT en RL: al publicar LoRA, DoRA, PiSSA y MiLoRA con idéntica configuración (r=32, alpha=64, lr=1e-5), se pueden contrastar curvas de validación en AIME24, AIME25, AMC23 y MATH-500 bajo las mismas condiciones.
- Investigación sobre inicialización de adaptadores: los adaptadores iniciales A0/B0 de PiSSA y MiLoRA permiten estudiar el efecto del subespacio inicial en el aprendizaje por refuerzo y reconstruir el modelo según W − s·B0·A0 + s·B·A.
- Evaluación de robustez ante temperatura: las métricas se registran a temperatura 0.6/top_p 0.95 y a temperatura 1.0/top_p 1.0, lo que facilita analizar la estabilidad del razonamiento matemático según el muestreo.
- Punto de partida para ajuste eficiente en dominios verificables: la receta (GRPO sin KL, clipping 0.2/0.28, 16 respuestas por pregunta) es reutilizable para otros datasets con recompensa programática, como código o lógica formal.
- Despliegue ligero del modelo fusionado: el directorio `merged/global_step_200/` contiene el modelo final en bf16 con transformers, adecuado para inferencia en una GPU de gama alta de consumo o profesional.
- Estudio de la dinámica de entrenamiento: los rollouts agrupados en ficheros de 25 pasos y los logs de TensorBoard permiten analizar la evolución de la recompensa y de la longitud de respuesta durante el RL.

## Benchmarks y rendimiento

El repositorio documenta evaluaciones periódicas sobre AIME24, AIME25, AMC23 y MATH-500, pero los valores numéricos no se incluyen en la información proporcionada; solo se especifica su ubicación en `results/metrics.jsonl` y el protocolo (32 respuestas por problema en AIME/AMC, 4 en MATH-500; métrica `acc/mean@4`). Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo fusionado en bf16: aproximadamente 8-9 GB solo para pesos (4B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 12-16 GB para contextos moderados.
- Cuantización: no se publican pesos GGUF ni cuantizados; para reducir VRAM habría que convertir el modelo fusionado a 8 o 4 bits con herramientas externas (bitsandbytes, GPTQ, AWQ), sin garantía del autor.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia del modelo fusionado en bf16.
- Entrenamiento: la receta se ejecutó con una GPU por run (verl 0.10) con adaptadores de rango 32; el modelo base congelado en bf16 requiere al menos 24 GB, y el uso de 8k tokens de respuesta incrementa la memoria de activaciones.
- Opciones de despliegue: transformers con PEFT para cargar adaptadores; el modelo fusionado es compatible con vLLM y TGI en principio, aunque no se documenta soporte verificado. llama.cpp/Ollama requerirían conversión a GGUF no incluida.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JaeWooShin/peft-rlvr | 4B (base) + adaptadores r=32 | no disponible | Adaptadores PEFT para RLVR (GRPO) sobre Qwen3-4B-Base | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Base | 4B | no disponible en esta ficha | Modelo base preentrenado | apache-2.0 | Hugging Face, ampliamente utilizado |
| Adaptadores RLVR comparables | no disponible | no disponible | RLVR con GRPO sobre modelos de 4B | no disponible | no disponible |

No se dispone de datos de rendimiento de este repositorio ni de alternativas equivalentes publicadas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No es un modelo listo para producción: se trata de artefactos de investigación con adaptadores intermedios, checkpoints de entrenamiento y rollouts, no de un modelo instruction-tuned para uso general.
- El ajuste RLVR se realizó solo con datos en inglés (DAPO-Math-17k); el rendimiento en otros idiomas no está evaluado y puede degradarse respecto al base.
- Riesgo de alucinación inherente al modelo base de 4B, especialmente en razonamiento matemático fuera de la distribución de entrenamiento (nivel AIME/AMC).
- El entrenamiento con GRPO sin término KL puede provocar desviaciones respecto al base y colapso de diversidad en las respuestas; no se documentan análisis de este riesgo.
- Los adaptadores PiSSA y MiLoRA requieren aplicar la corrección W − s·B0·A0 + s·B·A; cargarlos directamente sobre el base sin esta corrección produce resultados incorrectos.
- No se documentan sesgos específicos, pero el base Qwen3-4B-Base puede heredar sesgos de sus datos de preentrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad del despliegue recae en el usuario.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- No se publican pesos cuantizados ni formatos GGUF, lo que limita el despliegue en hardware de consumo sin conversión manual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JaeWooShin/peft-rlvr
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Artículo de referencia: "Evaluating Parameter Efficient Methods for RLVR", arXiv 2512.23165 (https://arxiv.org/abs/2512.23165)
- Framework de entrenamiento: verl 0.10 (https://github.com/volcengine/verl)
- Dataset: English DAPO-Math-17k (no se proporciona enlace directo en la información disponible)
