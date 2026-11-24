# andre-atlas/edge-ai-quantization-checkpoints

## Resumen

`andre-atlas/edge-ai-quantization-checkpoints` es un repositorio de artefactos experimentales publicado por el usuario andre-atlas en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un archivo de checkpoints cuantizados generados por los experimentos del proyecto Edge AI & Quantization, alojado en github.com/Andre-Atlas/edge-ai-quantization. El repositorio agrupa derivados cuantizados de siete modelos base distintos: Qwen3-0.6B, Qwen3-1.7B, Qwen3-4B, Llama-3.2-3B, SmolLM3-3B, Qwen2.5-32B y Qwen2.5-72B.

El interes del repositorio es metodologico y comparativo: reúne el mismo conjunto de tecnicas de cuantizacion (RTN, GPTQ, AWQ, DWQ y SGQ) aplicadas sobre modelos de tamanos muy distintos, desde 0,6B hasta 72B parametros, con checkpoints en formato MLX y GGUF. Esto lo convierte en material de referencia para quien investigue el impacto de la cuantizacion en modelos pequenos orientados a edge AI y en modelos grandes desplegados en servidor.

Es relevante ahora porque la cuantizacion post-entrenamiento es la via practica para llevar modelos de lenguage a hardware de consumo y a entornos de inferencia con VRAM limitada. El repositorio no incluye los pesos en precision completa ni documenta metricas agregadas en su model card; su valor esta en los checkpoints y en los logs de perplejidad y matrices de importancia (imatrix) que acompasan a las versiones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de checkpoints cuantizados; arquitectura heredada de cada modelo base) |
| Parametros totales | variable segun checkpoint: 0,6B, 1,7B, 3B, 4B, 32B y 72B |
| Parametros activos | no disponible (ningun modelo base de la lista es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible (heredada de cada modelo base) |
| Tipos de cuantizacion | MLX (RTN, GPTQ, AWQ, DWQ), SGQ, GGUF (Q2_K, Q3_K_M, Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | mixta; hereda la del modelo base: Apache-2.0 (Qwen3, SmolLM3, Qwen2.5-32B), Qwen License (Qwen2.5-72B), Llama 3.2 Community License (Llama-3.2-3B) |
| Formato de pesos | MLX (checkpoints nativos) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Este repositorio no define una arquitectura propia: cada checkpoint es un derivado cuantizado de su modelo base, por lo que conserva la arquitectura transformer del original (Qwen3, Qwen2.5, Llama 3.2 o SmolLM3). No hay entrenamiento desde cero ni fine-tuning documentado en la model card; el proceso aplicado es cuantizacion post-entrenamiento.

La organizacion del repositorio sigue el esquema `modelos/<Model>-<method>-<bits>b-g<group>-s<seed>/`, con tamano de grupo 64 para los checkpoints MLX. Se incluyen ejecuciones de desarrollo y prueba de SGQ (`dev-sgq`, `teste-sgq`), una etapa 9 sobre Qwen2.5-32B y Qwen2.5-72B con shards por capa, y un directorio `ferramentas/gguf/` con cuantizaciones de llama.cpp en Q2_K, Q3_K_M y Q4_K_M, junto con matrices de importancia y logs de perplejidad. Los pesos en precision completa no se incluyen y deben obtenerse de los repositorios originales.

## Capacidades

- Las capacidades funcionales dependen integramente del modelo base de cada checkpoint; el repositorio no anade capacidades nuevas.
- Generacion de texto y razonamiento segun el modelo de origen (Qwen3-0.6B/1.7B/4B, Qwen2.5-32B/72B, Llama-3.2-3B, SmolLM3-3B).
- Soporte de cuantizacion en varios formatos: MLX para Apple Silicon, GGUF para llama.cpp y variantes de 2, 3 y 4 bits para despliegue con restricciones de memoria.
- Comparacion controlada de metodos de cuantizacion (RTN, GPTQ, AWQ, DWQ, SGQ) sobre los mismos modelos base.
- Tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada para este repositorio.

## Casos de uso

- Evaluacion de metodos de cuantizacion: usar los checkpoints RTN, GPTQ, AWQ y DWQ sobre un mismo modelo base para medir la degradacion de perplejidad y calidad con un protocolo identico.
- Despliegue en Apple Silicon: los checkpoints MLX con grupo 64 permiten ejecutar modelos de 0,6B a 4B en Macs con memoria unificada mediante el stack MLX.
- Inferencia en CPU y hardware modesto: las variantes GGUF Q2_K, Q3_K_M y Q4_K_M de llama.cpp permiten servir modelos de 3B en equipos sin GPU dedicada.
- Investigacion de cuantizacion en modelos grandes: los shards por capa de la etapa 9 sobre Qwen2.5-32B y Qwen2.5-72B sirven para analizar el efecto de la cuantizacion capa a capa.
- Reproduccion de experimentos: los logs de perplejidad e imatrix incluidos en `ferramentas/gguf/` permiten replicar y auditar los resultados del repositorio de GitHub asociado.
- Seleccion de compromiso tamano/calidad: comparar checkpoints de 3B y 4B en 4 bits frente a sus originales para decidir que variante desplegar en un producto con VRAM limitada.
- Formacion y docencia: material practico para explicar diferencias entre cuantizacion por redondeo (RTN) y metodos con calibracion (GPTQ, AWQ).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona la existencia de logs de perplejidad en `ferramentas/gguf/`, sin cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: depende del checkpoint. A 4 bits, un modelo de 3B ocupa aproximadamente 2 GB de pesos; uno de 4B, unos 2,5 GB; uno de 32B, unos 18 GB; uno de 72B, unos 40 GB. Son estimaciones teoricas a partir del numero de parametros, no datos publicados en el repositorio.
- GPU recomendadas: los checkpoints MLX estan pensados para Apple Silicon (M1/M2/M3/M4 con memoria unificada). Las variantes GGUF funcionan en CPU y en GPU consumer (RTX 3060, 4060, 4090) segun el tamano. Para 32B y 72B se requiere A100/H100 o multiples GPU.
- Cabe en GPU consumer: si, los checkpoints de 0,6B a 4B en 4 bits caben en GPUs con 4-8 GB de VRAM; los de 32B y 72B no caben en una sola GPU consumer.
- Opciones de despliegue: MLX (Apple Silicon), llama.cpp y derivados (Ollama, LM Studio) para GGUF; vLLM y TGI no estan documentados para estos formatos en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Repositorio | Modelos base | Metodos | Formatos | Licencia |
|---|---|---|---|---|
| andre-atlas/edge-ai-quantization-checkpoints | Qwen3, Qwen2.5, Llama-3.2, SmolLM3 (0,6B-72B) | RTN, GPTQ, AWQ, DWQ, SGQ | MLX, GGUF | mixta, heredada del base |
| Repositorios oficiales de GGUF de cada modelo base | un unico modelo | principalmente K-quants de llama.cpp | GGUF | la del modelo base |
| Colecciones de GPTQ/AWQ de la comunidad | habitualmente un modelo por repo | GPTQ o AWQ | safetensors | la del modelo base |

La diferencia principal frente a las alternativas es la cobertura: un unico repositorio con varios metodos aplicados a siete modelos base, lo que facilita comparaciones controladas. Como contrapartida, no incluye pesos completos ni benchmarks agregados.

## Limitaciones y advertencias

- No es un modelo entrenado: es un archivo de checkpoints experimentales, sin garantias de calidad ni de soporte.
- Sin benchmarks publicados en la model card; el rendimiento real de cada checkpoint no esta documentado en el texto disponible.
- Licencia mixta: cada checkpoint hereda la licencia de su base. Qwen2.5-72B usa Qwen License y Llama-3.2-3B la Llama 3.2 Community License, con restricciones para uso comercial que deben revisarse antes de produccion.
- Los checkpoints se generaron en experimentos academicos; pueden contener configuraciones no optimizadas o ejecuciones de prueba (dev-sgq, teste-sgq).
- La cuantizacion a 2 y 3 bits degrada la calidad de forma notable; no se recomienda para produccion sin evaluacion previa.
- Idiomas soportados no documentados en el repositorio; dependen del modelo base.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Riesgo de alucinacion y sesgos: heredados del modelo base correspondiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/andre-atlas/edge-ai-quantization-checkpoints
- Proyecto en GitHub: https://github.com/Andre-Atlas/edge-ai-quantization
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Modelo base Llama-3.2-3B: https://huggingface.co/meta-llama/Llama-3.2-3B
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Modelo base Qwen2.5-32B: https://huggingface.co/Qwen/Qwen2.5-32B
- Modelo base Qwen2.5-72B: https://huggingface.co/Qwen/Qwen2.5-72B
