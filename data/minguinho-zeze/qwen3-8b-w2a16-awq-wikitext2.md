# Minguinho-zeze/Qwen3-8B-W2A16-AWQ-WikiText2

## Resumen

Qwen3-8B-W2A16-AWQ-WikiText2 es un checkpoint de investigación publicado por el usuario Minguinho-zeze como parte del proyecto `lowbit-reasoning-ptq`. Se trata de una cuantización post-entrenamiento (PTQ) del modelo base Qwen/Qwen3-8B de Alibaba Qwen, aplicando pesos simétricos INT2 con activaciones sin cuantizar en 16 bits (esquema W2A16), algoritmo AWQ y tamaño de grupo 128, calibrado sobre WikiText-2 raw. No se realizó entrenamiento adicional: es exclusivamente un experimento de compresión agresiva.

El aspecto relevante —y la razón por la que este checkpoint existe— es que documenta un fallo catastrófico de precisión. Según la model card, la precisión cae a niveles próximos a cero bajo el protocolo de evaluación reportado (AIME-120 y GPQA Diamond con thinking mode activado). El autor lo publica explícitamente para reproducir e investigar ejecuciones fallidas de cuantización a muy bajo bit, y advierte que no debe usarse para inferencia práctica.

El modelo base Qwen3-8B es un transformer denso de 8.190.735.360 parámetros, con capacidades multilingües de comprensión, generación, código y matemáticas, licencia Apache-2.0. Este checkpoint hereda esa licencia y ese tamaño, pero con 84,8% de los parámetros cuantizados a 2 bits, lo que reduce el repositorio a 4,3 GB. Los diagnósticos incluidos en `diagnostics/` no establecen la causa del fallo ni garantizan la corrección de los kernels a distintas longitudes de secuencia y tamaños de lote.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-8B); pesos cuantizados con compressed-tensors |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada para este checkpoint; el ejemplo de carga de vLLM configura `max_model_len=34816` |
| Tipos de cuantizacion | W2A16: pesos INT2 simétricos, activaciones 16 bits sin cuantizar, group size 128, algoritmo AWQ; embedding, capas de normalización y `lm_head` sin cuantizar; fracción de parámetros cuantizados 84,800291% |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; el modelo base Qwen3-8B es descrito como multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con formato compressed-tensors (no es GGUF ni AutoAWQ) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-8B original: un transformer denso de aproximadamente 8,19 mil millones de parámetros. Sobre esa base, este checkpoint aplica únicamente cuantización post-entrenamiento, sin ningún entrenamiento adicional. La cuantización usa pesos INT2 simétricos con activaciones BF16/16 bits (W2A16), agrupación de 128 elementos y algoritmo AWQ. La calibración emplea texto de entrenamiento raw de WikiText-2, con 128 ventanas de 2.048 tokens y semilla 0. Durante la evaluación, la caché KV se mantuvo en BF16.

El experimento se ejecutó con vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0 y compressed-tensors 0.17.0 sobre GPUs Blackwell (RTX 5090 y RTX PRO 4500). Los kernels INT2 provienen de humming-kernels 0.1.17, con compilación JIT vía NVRTC de CUDA. El autor señala que las versiones del cuantizador y del runtime de compressed-tensors difieren entre sí y que se conservan las versiones registradas en lugar de asumirlas idénticas. No se validaron otras GPUs, kernels ni combinaciones de paquetes.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3-8B.
- Modo thinking (razonamiento extendido) activable mediante `chat_template_kwargs={"enable_thinking": True}`, tal como se usa en el protocolo de evaluación.
- Razonamiento matemático y científico (el checkpoint se evaluó sobre AIME-120 y GPQA Diamond).
- Capacidades multilingües, comprensión y generación de código atribuibles al modelo base Qwen3-8B.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este checkpoint.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada para este checkpoint.
- En la práctica, todas estas capacidades quedan inutilizables por el colapso de precisión documentado (ver limitaciones).

## Casos de uso

- Reproducción de experimentos de cuantización a muy bajo bit: el checkpoint permite replicar el run `qwen3-8b__w2a16__awq__wikitext2` con las mismas semillas, ventanas de calibración y ajustes de decodificación, para contrastar resultados con otros algoritmos de PTQ.
- Investigación de causas de colapso de precisión: sirve como caso negativo controlado frente al Qwen3-8B BF16 (71,39 en AIME-120 y 61,11 en GPQA Diamond), permitiendo aislar si el fallo proviene del algoritmo AWQ, del group size, de la calibración o del kernel INT2.
- Validación de kernels INT2: los diagnósticos de `diagnostics/` y las rutas de referencia permiten comprobar el comportamiento de humming-kernels 0.1.17 a distintas longitudes de secuencia y tamaños de lote, aunque el autor advierte que no garantizan corrección.
- Estudio de calibración con WikiText-2: al usar 128 ventanas de 2.048 tokens con semilla 0, el checkpoint es un punto de partida reproducible para probar si conjuntos de calibración más diversos evitan el colapso en modelos de razonamiento.
- Análisis de viabilidad de despliegue en 2 bits: con un repositorio de 4,3 GB, permite medir requisitos reales de memoria y overhead de kernels antes de comprometerse con una estrategia de compresión en producción.
- Referencia para pipelines de evaluación de reasoning bajo PTQ: el protocolo con 120 preguntas AIME y 198 de GPQA Diamond, tres semillas y presupuesto de salida de 32.768 tokens, truncando respuestas incompletas como incorrectas, puede reutilizarse como harness comparativo entre checkpoints.

## Benchmarks y rendimiento

Precisión en porcentaje, promediada sobre las semillas 0, 1 y 2. Cada semilla evalúa 120 preguntas AIME y 198 de GPQA Diamond; las semillas repetidas son generaciones repetidas de las mismas preguntas, no preguntas nuevas independientes. Thinking mode activado, temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens. Las respuestas truncadas se puntuaron como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-8B BF16 | 71,39 | 61,11 |
| Este checkpoint (W2A16-AWQ) | 0,28 | 0,00 |

El autor indica que estas puntuaciones describen su protocolo y no son puntuaciones oficiales de Qwen, y que las ejecuciones usaron RTX 5090 y RTX PRO 4500 Blackwell, por lo que pequeñas diferencias no deben atribuirse solo a los algoritmos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4,3 GB en safetensors comprimidos; a ello hay que sumar la caché KV en BF16 y el overhead de los kernels INT2. El ejemplo de carga configura `gpu_memory_utilization=0.90` y `max_model_len=34816`, lo que implica reservar el 90% de la memoria de la GPU disponible.
- GPUs recomendadas: el release solo valida RTX 5090 y RTX PRO 4500 Blackwell. Otras GPUs, kernels y combinaciones de paquetes no han sido validadas.
- Cabe en GPU consumer: sí, según la validación del autor sobre RTX 5090; no hay datos para otras consumer GPUs.
- Opciones de despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0 y humming-kernels 0.1.17 para INT2, más PyTorch 2.13.0 y Transformers 5.17.0. No es un release GGUF ni AutoAWQ, por lo que llama.cpp, Ollama y TGI no están contemplados en la información disponible.
- Latencia y throughput: no disponible. La model card menciona métricas de velocidad en el informe enlazado, pero no se proporcionan cifras en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (AIME-120 / GPQA Diamond) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-W2A16-AWQ-WikiText2 (este) | 8,19 B (84,8% cuantizado a INT2) | no disponible (ejemplo con 34.816) | 0,28 / 0,00 | Apache-2.0 | Hugging Face, librería vLLM |
| Qwen/Qwen3-8B (BF16) | 8,19 B | no disponible en la información proporcionada | 71,39 / 61,11 | Apache-2.0 | Hugging Face |
| Otras cuantizaciones PTQ de Qwen3-8B | no disponible | no disponible | no disponible | Apache-2.0 (heredada) | no disponible |

No se dispone de datos de benchmarks para alternativas de cuantización comparables en la información proporcionada.

## Limitaciones y advertencias

- Colapso severo de precisión: 0,28% en AIME-120 y 0,00% en GPQA Diamond frente a 71,39 y 61,11 del BF16. El autor desaconseja explícitamente su uso para inferencia práctica.
- Checkpoint exclusivamente de investigación: no se realizó entrenamiento adicional y su propósito es reproducir e investigar ejecuciones fallidas de PTQ a bajo bit.
- Los diagnósticos incluidos en `diagnostics/` no establecen la causa del fallo ni garantizan la corrección de los kernels a distintas longitudes de secuencia y tamaños de lote.
- Validación limitada: solo se probaron vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17 sobre GPUs Blackwell (RTX 5090 y RTX PRO 4500). Otras combinaciones no han sido validadas.
- Discrepancia de versiones: las versiones del cuantizador y del runtime de compressed-tensors difieren y se conservan tal como se registraron, sin asumir equivalencia.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; dado el colapso de precisión, cualquier salida fiable es improbable.
- Idiomas: la model card no declara lista de idiomas; no se puede confirmar el comportamiento multilingüe tras la cuantización.
- Licencia: Apache-2.0, heredada del modelo base; el uso comercial está permitido por licencia, pero el estado del checkpoint lo hace inviable en producción.
- Formato: no es GGUF ni AutoAWQ, lo que limita las herramientas de despliegue habituales a la ruta vLLM + compressed-tensors + humming-kernels.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-8B-W2A16-AWQ-WikiText2
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Commit del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/10509d06fd76ae1bcdd0395965d82aebd95eb2f1
- Informe del run qwen3-8b-20261107: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-8b-20261107
- Script de configuración del motor: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/10509d06fd76ae1bcdd0395965d82aebd95eb2f1/src/engine.py
- Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_8b
