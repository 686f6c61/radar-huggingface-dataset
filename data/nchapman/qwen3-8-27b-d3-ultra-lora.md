# nchapman/Qwen3.8-27B-d3-ultra-LoRA

## Resumen

`Qwen3.8-27B-d3-ultra-LoRA` es un adaptador LoRA de rango 128 publicado por el usuario `nchapman` sobre el modelo base `Qwen/Qwen3.8-27B`. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (junto con una cabeza de decisión de 255 vías denominada `CodeReadout`) extraído del modelo `vllm-sr/d3-ultra`. El adaptador está pensado para reproducir el comportamiento de ese modelo de decisión sobre una base Qwen, con un coste de almacenamiento reducido (1,8 GB frente a los pesos completos del modelo base).

La relevancia del artefacto está en su orientación a tareas de decisión y clasificación (etiquetado como `decision-model` y `system-one`), evaluadas mediante un benchmark propio llamado JevBench con 231 casos. Según la model card, el adaptador mejora al modelo base en ese benchmark (90,91 % frente a 87,88 % de precisión global) y se aproxima al modelo completo `d3-ultra` (91,34 %), reduciendo además la pérdida de verosimilitud negativa (NLL) y el Brier score.

No se dispone de información sobre la arquitectura interna del modelo base, el volumen de datos de entrenamiento del adaptador ni los idiomas soportados. La información pública se limita a los metadatos de Hugging Face y a la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `Qwen/Qwen3.8-27B`; incluye cabeza `CodeReadout` de 255 vías |
| Parametros totales | No disponible para el adaptador; el modelo base es de 27B (según su denominación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el adaptador puede combinarse con el base cuantizado, pero no se documenta) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Rango LoRA | 128 (Joint-SVD + 4-NormFold) |
| Modelo base | `Qwen/Qwen3.8-27B` |
| Modelo de origen | `vllm-sr/d3-ultra` |
| Tamaño del repositorio | 1,8 GB |
| Librería | peft |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 128 obtenido mediante una técnica que el autor denomina "Joint-SVD + 4-NormFold", acompañado de una cabeza de salida `CodeReadout` de 255 vías. Según la model card, ambos componentes se extraen del modelo `vllm-sr/d3-ultra` y se transfieren al modelo base `Qwen/Qwen3.8-27B`. No se detalla la arquitectura interna del modelo base ni la composición del dataset de entrenamiento, el número de tokens utilizados, ni si hubo etapas de RLHF o DPO.

La innovación declarada es la extracción eficiente de un modelo de decisión completo a un adaptador de bajo rango que se puede aplicar sobre una base pública. El autor etiqueta el resultado como `decision-model` y `system-one`, lo que sugiere un uso orientado a decisiones rápidas de una sola pasada más que a razonamiento multi-paso. No se aportan detalles técnicos adicionales sobre el proceso de destilación o de descomposición SVD.

## Capacidades

- Generación de texto condicionada por el adaptador sobre el modelo base Qwen.
- Clasificación/decisión sobre 255 vías mediante la cabeza `CodeReadout`.
- Evaluación en tareas de decisión tipo benchmark JevBench (fácil, original y difícil).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Compatible con el ecosistema PEFT (carga mediante `peft` sobre el modelo base).

## Casos de uso

- Evaluación de modelos de decisión: el adaptador sirve para reproducir y comparar el comportamiento de `d3-ultra` sobre una base Qwen pública sin necesidad de desplegar el modelo completo, útil en experimentos de investigación sobre destilación de capacidades de decisión.
- Clasificación de 255 clases: la cabeza `CodeReadout` permite integrar el adaptador en pipelines que necesiten una salida discreta de 255 categorías, siempre que se valide contra el dominio objetivo.
- Investigación en PEFT: el adaptador es un caso práctico de extracción mediante Joint-SVD y NormFold, útil para estudiar la transferibilidad de adaptadores de bajo rango entre modelos de decisión y bases generativas.
- Reproducción de benchmarks internos: permite replicar los resultados de JevBench (231 casos) reportados por el autor y verificar la mejora frente al modelo base.
- Prototipado de sistemas "system-one": para aplicaciones que requieran respuestas rápidas de una sola pasada en lugar de cadenas de razonamiento largas, aunque no se aportan métricas de latencia.
- Base para fine-tuning adicional: al ser un adaptador PEFT sobre Qwen, puede combinarse con otros adaptadores o servir de inicialización para ajustes posteriores en tareas de decisión específicas.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre JevBench (231 casos: 48 fáciles, 72 originales, 111 difíciles):

| Modelo | Precisión global | Fácil (48) | Original (72) | Difícil (111) | NLL (↓) | Brier (↓) |
|---|---|---|---|---|---|---|
| Base `Qwen/Qwen3.8-27B` | 203/231 (87,88 %) | 48/48 | 70/72 | 85/111 | 0,3518 | 0,1914 |
| `Qwen3.8-27B-d3-ultra-LoRA` (r=128) | 210/231 (90,91 %) | 48/48 | 72/72 | 90/111 | 0,2224 | 0,1232 |
| Full `vllm-sr/d3-ultra` | 211/231 (91,34 %) | 48/48 | 72/72 | 91/111 | 0,2151 | 0,1179 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; la inferencia requiere cargar el modelo base `Qwen/Qwen3.8-27B`, cuyo consumo depende de la cuantización elegida (no documentada).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende enteramente del modelo base y de la cuantización aplicada.
- Opciones de despliegue: la librería indicada es `peft`; no se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI, aunque el tag `vllm-sr` sugiere relación con el ecosistema vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | JevBench (global) | Licencia |
|---|---|---|---|---|---|
| `Qwen3.8-27B-d3-ultra-LoRA` | Adaptador LoRA sobre Qwen3.8-27B | Base 27B (adaptador r=128) | No disponible | 90,91 % | Apache 2.0 |
| `Qwen/Qwen3.8-27B` (base) | Modelo completo | 27B | No disponible | 87,88 % | No disponible en la información |
| `vllm-sr/d3-ultra` | Modelo completo de decisión | No disponible | No disponible | 91,34 % | No disponible en la información |

No se dispone de información sobre otros adaptadores LoRA comparables ni sobre modelos de decisión alternativos de la misma categoría.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el modelo base `Qwen/Qwen3.8-27B` para funcionar.
- Los benchmarks proceden exclusivamente del benchmark propietario JevBench del autor; no hay validación independiente ni resultados en benchmarks estándar.
- No se documentan sesgos conocidos, pero al heredar el comportamiento del modelo base Qwen, es previsible que arrastre los sesgos de este.
- Riesgo de alucinación: no evaluado en la información disponible; el adaptador está orientado a decisión, no a generación abierta fiable.
- No se especifican idiomas soportados; no se puede asumir un rendimiento multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce la licencia del modelo base y del modelo de origen `vllm-sr/d3-ultra`, que deben verificarse antes de producción.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No hay información sobre latencia, throughput ni requisitos de hardware, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/nchapman/Qwen3.8-27B-d3-ultra-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo de origen: https://huggingface.co/vllm-sr/d3-ultra
