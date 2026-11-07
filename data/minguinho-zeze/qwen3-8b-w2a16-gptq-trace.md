# Minguinho-zeze/Qwen3-8B-W2A16-GPTQ-Trace

## Resumen

Qwen3-8B-W2A16-GPTQ-Trace es un checkpoint de investigación publicado por el usuario Minguinho-zeze en Hugging Face, consistente en una cuantización post-entrenamiento (PTQ) del modelo Qwen3-8B de Alibaba Qwen. La cuantización aplica pesos INT2 simétricos con activaciones sin cuantizar en 16 bits (esquema W2A16), mediante el algoritmo GPTQ con tamaño de grupo 128, y se distribuye en formato compressed-tensors para su uso con vLLM. No se realizó entrenamiento adicional: es exclusivamente un artefacto de compresión.

El propósito declarado del checkpoint no es el uso práctico, sino la reproducción e investigación de un fallo severo en la cuantización de baja precisión para razonamiento. Según la model card, la precisión cae a cero bajo el protocolo de evaluación reportado (AIME-120 y GPQA Diamond), frente a los valores del modelo base en BF16. El autor lo describe explícitamente como no recomendado para inferencia práctica.

Su relevancia es, por tanto, metodológica: documenta un caso de colapso de precisión en cuantización a 2 bits sobre un modelo de razonamiento, incluye diagnósticos de kernels comprimidos y rutas de referencia en el directorio `diagnostics/`, y publica los informes de evaluación junto al repositorio del proyecto lowbit-reasoning-ptq. El modelo base, Qwen3-8B, es un transformer denso de 8.190.735.360 parámetros con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de carga usa max_model_len=34816) |
| Tipos de cuantizacion | INT2 simetrico en pesos (W2), activaciones en 16 bits (A16), grupo 128, GPTQ; embedding, normalizacion y lm_head sin cuantizar; KV cache en BF16 durante la evaluacion |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con formato compressed-tensors (no es GGUF ni AutoAWQ) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del Qwen3-8B original, un transformer denso de aproximadamente 8.190 millones de parámetros. No se ha realizado ningún entrenamiento adicional sobre el modelo base; la única transformación es la cuantización post-entrenamiento de los pesos lineales, que afecta al 84,800291% de los parámetros. Las capas de embedding, normalización y `lm_head` permanecen sin cuantizar.

La calibración se realizó con trazas de razonamiento generadas por el propio Qwen3-8B en BF16 a partir de problemas de NuminaMath-1.5, excluyendo la fuente amc_aime y filtrando solapamientos de n-gramas de 13 palabras con las preguntas de evaluación. Se emplearon 128 ventanas de 2.048 tokens con semilla 0. El algoritmo de cuantización es GPTQ con pesos INT2 simétricos y grupo de 128. El experimento se ejecutó con vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0 y compressed-tensors 0.17.0 sobre GPUs Blackwell, usando humming-kernels 0.1.17 para el kernel INT2 con compilación JIT vía NVRTC.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3-8B.
- Modo de razonamiento (thinking mode) activable mediante `chat_template_kwargs={"enable_thinking": True}`.
- Razonamiento matemático y científico, presumiblemente en el modelo base; en este checkpoint la precisión medida es cero en el protocolo reportado.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada.

## Casos de uso

- Reproducción de fallos de cuantización: el checkpoint permite reproducir el colapso de precisión documentado en AIME-120 y GPQA Diamond bajo el protocolo del autor, con semillas 0, 1 y 2, para estudiar las causas del fallo en pesos INT2.
- Investigación de kernels de baja precisión: los diagnósticos en `diagnostics/` permiten comparar la ruta de referencia con el kernel comprimido de humming-kernels en distintas longitudes de secuencia y tamaños de lote.
- Análisis de calibración con trazas de razonamiento: al haberse calibrado con trazas de NuminaMath-1.5, sirve para evaluar si la distribución de calibración de razonamiento es adecuada para PTQ a 2 bits.
- Estudio de robustez de GPTQ en modelos densos de 8B: permite medir el impacto de cuantizar el 84,8% de los parámetros dejando embedding, normalización y `lm_head` en precisión completa.
- Validación de infraestructura vLLM con compressed-tensors: útil para verificar la ruta de carga y ejecución de pesos W2A16 en vLLM 0.32.0 sobre GPUs Blackwell.
- Referencia negativa en pipelines de evaluación: puede incorporarse como caso de control en suites que comparen checkpoints cuantizados frente a sus originales en BF16.
- Docencia y divulgación: ilustra de forma concreta los riesgos de la cuantización agresiva en modelos de razonamiento.

## Benchmarks y rendimiento

Datos publicados en la model card. Precisión en porcentaje, media sobre semillas 0, 1 y 2; cada semilla evalúa 120 preguntas de AIME y 198 de GPQA Diamond. Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntúan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-8B BF16 | 71,39 | 61,11 |
| Este checkpoint (W2A16 GPTQ) | 0,00 | 0,00 |

Las evaluaciones se ejecutaron en RTX 5090 y RTX PRO 4500 Blackwell. El autor advierte que estas cifras describen su protocolo y no son puntuaciones oficiales de Qwen. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 4,3 GB en safetensors, aunque el ejemplo de carga configura `gpu_memory_utilization=0.90` y `max_model_len=34816`, lo que requiere margen adicional para KV cache en BF16.
- GPUs utilizadas en la evaluación: RTX 5090 y RTX PRO 4500 Blackwell. El autor indica que otras GPUs, kernels y combinaciones de paquetes no han sido validadas.
- Compatibilidad con GPUs de consumo: la RTX 5090 figura entre las GPUs usadas, por lo que el checkpoint cabe en una GPU de consumo Blackwell; no se confirma funcionamiento en generaciones anteriores.
- Opciones de despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0 y humming-kernels 0.1.17 para INT2; requiere añadir el directorio de la librería CUDA NVRTC a `LD_LIBRARY_PATH` antes de la compilación JIT de Humming. No es compatible con llama.cpp, Ollama ni TGI en el formato publicado.
- Latencia y throughput: no disponible en la informacion proporcionada (el autor remite a los informes de velocidad en el repositorio del proyecto).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME-120 | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Este checkpoint (W2A16 GPTQ) | 8,19B | No disponible | 0,00 | 0,00 | Apache-2.0 | Hugging Face, formato compressed-tensors |
| Qwen3-8B BF16 (base) | 8,19B | No disponible en la informacion proporcionada | 71,39 | 61,11 | Apache-2.0 | Hugging Face |
| Otras cuantizaciones de Qwen3-8B (GGUF, AWQ) | 8,19B | No disponible | No disponible | No disponible | Apache-2.0 (heredada) | Hugging Face |

No se dispone de datos de benchmarks de otras alternativas cuantizadas de Qwen3-8B en la informacion proporcionada.

## Limitaciones y advertencias

- Colapso de precisión documentado: 0,00% en AIME-120 y GPQA Diamond bajo el protocolo del autor, frente a 71,39% y 61,11% del modelo base en BF16. El checkpoint no es apto para inferencia práctica.
- El autor no establece la causa del fallo ni garantiza la corrección del kernel en distintas longitudes de secuencia y tamaños de lote.
- Solo se ha validado con vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17 sobre GPUs Blackwell; otras combinaciones no están verificadas.
- El ejemplo de carga de la model card no se ha vuelto a ejecutar desde el repositorio subido.
- Las versiones del cuantizador y del runtime de compressed-tensors difieren; se conservan las versiones registradas en lugar de asumir que son idénticas.
- Las puntuaciones publicadas corresponden a un protocolo propio y no son cifras oficiales de Qwen.
- Sesgos conocidos: no disponible en la informacion proporcionada; se heredan los del modelo base Qwen3-8B, no documentados aquí.
- Riesgo de alucinación: no evaluado en este checkpoint; con precisión cero en los benchmarks reportados, la fiabilidad factual no está garantizada en ningún escenario.
- Idiomas soportados: no disponible en la informacion proporcionada.
- Licencia Apache-2.0, que permite uso comercial, pero el propio autor desaconseja el uso práctico del checkpoint.
- El checkpoint se publica para reproducir un fallo de investigación; no debe desplegarse en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-8B-W2A16-GPTQ-Trace
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Commit del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/10509d06fd76ae1bcdd0395965d82aebd95eb2f1
- Informes de evaluación: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-8b-20261107
- Configuración del motor: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/10509d06fd76ae1bcdd0395965d82aebd95eb2f1/src/engine.py
- Repositorio de la serie Qwen3: https://github.com/QwenLM/Qwen3.8
