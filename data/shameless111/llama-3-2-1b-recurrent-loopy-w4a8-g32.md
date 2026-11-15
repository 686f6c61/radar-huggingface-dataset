# Shameless111/Llama-3.2-1B-Recurrent-Loopy-W4A8-G32

## Resumen

Llama-3.2-1B-Recurrent-Loopy-W4A8-G32 es un checkpoint cuantizado del modelo recurrente irafm-llm/Recurrent-Llama-3.2-1B, publicado por el usuario Shameless111 en Hugging Face. Se trata de una variante experimental que aplica una arquitectura de profundidad recurrente (recurrent depth T=16) sobre la base de Llama 3.2 de 1B parametros, combinada con una cuantizacion de pesos a 4 bits y activaciones a 8 bits (W4A8) con group size de 32 y rotacion Hadamard de bloque 128.

El modelo resuelve un problema de investigacion: explorar si un transformer pequeno con capas recurrentes compartidas puede aproximar el rendimiento de modelos mas grandes manteniendo un coste de inferencia reducido. El checkpoint concreto representa el candidato seleccionado (s250725084_p12_b128) de un pool de 400 candidatos, elegido mediante busqueda sobre ventanas fijas de WikiText-103.

Es relevante ahora porque combina dos lineas activas de investigacion open source: los modelos recurrentes con profundidad variable y las tecnicas de cuantizacion post-entrenamiento W4A8 con rotaciones Hadamard. No obstante, es un artefacto de investigacion con un loader personalizado, no un modelo listo para produccion con `transformers.from_pretrained()`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (Loopy) sobre Llama 3.2, profundidad recurrente T=16 |
| Parametros totales | 1B (heredados del modelo base Llama 3.2 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (usado en evaluacion WT2) |
| Tipos de cuantizacion | W4A8: pesos INT4 almacenados en contenedores INT8, activaciones A8 dinamicas por token, group size 32, Hadamard block 128 |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | `selected.pt` (state dict PyTorch), sin almacenamiento INT4 empaquetado, sin kernel INT4 de inferencia |

## Arquitectura y entrenamiento

El modelo parte de irafm-llm/Recurrent-Llama-3.2-1B (revision eefd08cd0caead1ea5db6cf62a06ccb69cf8d638), una variante recurrente del transformer Llama 3.2 1B. La innovacion principal es la profundidad recurrente T=16: el modelo reutiliza capas en un bucle de 16 iteraciones, lo que incrementa la capacidad efectiva de computo sin aumentar el numero de parametros. Esta tecnica se inspira en trabajos como Universal Transformers y modelos recurrentes de profundidad.

El checkpoint es el resultado de una busqueda sobre 400 candidatos de cuantizacion, seleccionando s250725084_p12_b128 con rotation seed 250725084, scaling power 1.2, Hadamard block size 128 y weight group size 32. La calibracion, busqueda y evaluacion usan grupos separados de 32 ventanas fijas derivadas del split de entrenamiento de WikiText-103. La evaluacion emplea cuantizacion falsa en BF16; no se usa almacenamiento INT4 empaquetado ni kernel INT4 de inferencia, lo que limita el beneficio practico de velocidad en produccion.

## Capacidades

- Generacion de texto autoregresiva en ingles sobre la base de Llama 3.2 1B.
- Razonamiento basico y respuesta a preguntas de conocimiento general (MMLU 23.94% en esta configuracion cuantizada).
- Comprension lectora y completado de texto (LAMBADA, HellaSwag, WinoGrande, ARC-C).
- Capacidades multilingues limitadas: solo se declara ingles.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta modo thinking, vision ni audio.
- Capacidad de profundidad recurrente: el mismo bloque se aplica iterativamente T=16 veces, lo que puede mejorar el razonamiento iterativo a costa de latencia.

## Casos de uso

- Investigacion academica sobre modelos recurrentes: el checkpoint permite reproducir los experimentos de profundidad recurrente y comparar con el modelo base sin cuantizar, usando el loader incluido y las ventanas fijas documentadas.
- Evaluacion de tecnicas de cuantizacion W4A8: sirve como referencia para estudiar el impacto de group size 32 y rotaciones Hadamard en modelos pequenos, con metricas guardadas en `reference_results/`.
- Prototipado de bajo coste en GPU consumer: con 1B parametros y cuantizacion W4, el modelo cabe en GPUs de 8 GB, adecuado para pruebas de concepto en local.
- Generacion de texto en ingles para tareas simples: completado de frases, resumenes cortos o clasificacion de texto, siempre que se acepte la perdida de calidad frente al modelo base en BF16.
- Benchmarking de pipelines de evaluacion: el repo incluye scripts (`eval_wikitext.py`, `eval_tasks.py`) y protocolo congelado, util para validar herramientas de evaluacion propias.
- Estudio de degradacion por cuantizacion: comparar las metricas guardadas (PPL 24.76 en WT2) con las del modelo base en BF16 para cuantificar la perdida.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| WT2 word PPL (4096 contexto) | 24.76 |
| LAMBADA PPL | 26.97 |
| LAMBADA acc. | 34.76% |
| WinoGrande | 52.80% |
| ARC-C (acc_norm) | 28.75% |
| HellaSwag (acc_norm) | 45.88% |
| MMLU | 23.94% |
| Mean acc. (5 tareas) | 37.23% |

No se proporcionan resultados del modelo base en BF16 en la informacion disponible para comparar directamente; las metricas de referencia completas estan en `reference_results/` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en W4A8 (el repo ocupa 2.1 GB), aunque el loader personalizado puede requerir mas memoria durante la inicializacion de la arquitectura base.
- GPU recomendadas: cualquier GPU con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) para pruebas; A100/H100 no son necesarias por el tamano.
- Cabe en GPU consumer: si, en GPUs de 8 GB o mas.
- Opciones de despliegue: no compatible con vLLM, llama.cpp, Ollama o TGI de forma estandar; requiere el loader Loopy incluido en `code/` y un entorno conda especifico (`environment.yml`).
- Latencia y throughput: no disponibles; la profundidad recurrente T=16 multiplica el coste computacional respecto a un forward pass estandar, y no hay kernel INT4 optimizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.2-1B-Recurrent-Loopy-W4A8-G32 | 1B | 4096 | llama3.2 | PyTorch state dict | Recurrente T=16, W4A8, loader custom |
| irafm-llm/Recurrent-Llama-3.2-1B (base) | 1B | no disponible | llama3.2 | safetensors (probable) | Sin cuantizar, mismo esquema recurrente |
| meta-llama/Llama-3.2-1B | 1B | 128K | llama3.2 | safetensors | Modelo original, no recurrente, contexto mucho mayor |
| meta-llama/Llama-3.2-1B-Instruct | 1B | 128K | llama3.2 | safetensors | Version instruida, soporte de tool calling |

## Limitaciones y advertencias

- Modelo de investigacion: requiere loader personalizado; `from_pretrained()` de Transformers no funciona directamente sobre este repositorio.
- Calidad degradada: MMLU 23.94% y ARC-C 28.75% son valores bajos, indicativos de la perdida por cuantizacion W4A8 y del modelo base pequeno.
- Solo ingles: no se declaran otros idiomas.
- Sin kernel INT4: los pesos W4 se almacenan en contenedores INT8, por lo que no se obtiene la aceleracion tipica de INT4 en inferencia.
- Riesgo de alucinacion: inherente a modelos de 1B, agravado por la cuantizacion.
- Sesgos: heredados de Llama 3.2 y de los datos de entrenamiento del modelo base; no documentados especificamente.
- Licencia Llama 3.2 Community License: restricciones de uso comercial y obligaciones de atribucion; revisar el texto completo antes de usar en produccion.
- Contexto limitado a 4096 tokens en la evaluacion, muy inferior a los 128K del Llama 3.2 original.
- Sin garantias de soporte ni mantenimiento; 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/Shameless111/Llama-3.2-1B-Recurrent-Loopy-W4A8-G32
- Modelo base: https://huggingface.co/irafm-llm/Recurrent-Llama-3.2-1B
- Dataset de evaluacion: https://huggingface.co/datasets/Salesforce/wikitext
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Politica de uso aceptable: https://www.llama.com/llama3_2/use-policy/
