# ChengsenWang/GenoJEPA-Base

## Resumen

GenoJEPA-Base es el checkpoint ligero de GenoJEPA, un framework de aprendizaje de representaciones genómicas basado en la arquitectura predictiva de embedding conjunto (Joint-Embedding Predictive Architecture, JEPA). Desarrollado por Chengsen Wang y colaboradores de la Universidad de Correos y Telecomunicaciones de Pekín, el modelo aprende representaciones semánticas de secuencias de ADN mediante alineación en espacio latente, en lugar de reconstruir nucleótidos a nivel local como hacen los enfoques de modelado de lenguaje enmascarado (MLM) o de predicción de siguiente token (NTP). Esta elección está motivada por la ausencia de "límites de palabras" explícitos en el ADN y por la presencia de ruido evolutivo sustancial en las secuencias.

Con aproximadamente 51,6 millones de parámetros, GenoJEPA-Base está diseñado para extracción eficiente de embeddings, tareas de probing y clasificación de secuencias genómicas. El modelo se distribuye bajo licencia Apache-2.0 y se integra con la librería Transformers mediante código personalizado (`trust_remote_code=True`). Su relevancia actual radica en ofrecer una alternativa a los modelos fundacionales genómicos basados en reconstrucción, con un coste computacional reducido y un enfoque orientado a la semántica latente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA (joint-embedding predictive architecture) |
| Parametros totales | 51.570.819 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de ADN, no lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GenoJEPA emplea una arquitectura JEPA que combina parcheado continuo (continuous patching) con alineación semántica. En lugar de predecir nucleótidos enmascarados, el modelo aprende a alinear representaciones de regiones visibles y enmascaradas en un espacio latente compartido. Este enfoque traslada el objetivo de optimización desde la reconstrucción local de bases hacia la alineación semántica, lo que permite capturar estructura funcional y evolutiva de las secuencias de ADN de forma más robusta frente al ruido.

Los datos de entrenamiento provienen de los datasets `ChengsenWang/GenoJEPA-Pretraining` y `ChengsenWang/GenoJEPA-Evaluation`, aunque no se especifican el número total de tokens ni la composición detallada del corpus. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación supervisada; el entrenamiento es auto-supervisado. El checkpoint Base está pensado para extracción de embeddings y tareas downstream con clasificadores ligeros.

## Capacidades

- Extracción de embeddings densos de secuencias de ADN mediante el método `encode` del modelo.
- Representaciones semánticas que capturan estructura latente de las secuencias, útil para tareas de clasificación y regresión.
- Probing con clasificadores lineales (por ejemplo, regresión logística) sobre los embeddings extraídos.
- Soporte para secuencias con caracteres ambiguos (como `N`) según el ejemplo de uso.
- No soporta generación de texto, tool calling, agentes, visión ni audio; es exclusivamente un extractor de características.

## Casos de uso

- Clasificación de elementos reguladores: los embeddings de GenoJEPA-Base pueden alimentar clasificadores lineales para distinguir promotores, enhancers o silencers a partir de secuencias de ADN, aprovechando la alineación semántica que captura contexto funcional.
- Predicción de efectos de variantes: al representar secuencias de referencia y variantes en el mismo espacio latente, el modelo permite comparar embeddings para estimar el impacto funcional de mutaciones puntuales o indels.
- Anotación de regiones codificantes y no codificantes: la representación semántica facilita la discriminación entre exones, intrones y regiones intergénicas sin necesidad de alineamiento explícito.
- Análisis metagenómico: los embeddings pueden usarse para clasificar fragmentos de ADN ambiental por taxonomía o función, gracias a la capacidad de capturar señales evolutivas latentes.
- Transfer learning en genómica: el checkpoint Base sirve como punto de partida para fine-tuning en tareas específicas como predicción de sitios de unión de factores de transcripción o detección de regiones metiladas.
- Estudio de conservación evolutiva: las representaciones aprendidas pueden emplearse para identificar regiones con presión selectiva, comparando embeddings de secuencias ortólogas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K (no aplicables a un modelo de ADN), ni resultados específicos de tareas genómicas como clasificación de promotores o predicción de efectos de variantes.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (51,6M parámetros ≈ 206 MB en FP32), por lo que cabe en cualquier GPU consumer moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.). Para inferencia por lotes grandes, una GPU con 8 GB es suficiente.
- Despliegue: se integra con Transformers mediante `AutoModel` y `AutoTokenizer` con `trust_remote_code=True`. Al ser un extractor de características, no se beneficia de motores de generación como vLLM o llama.cpp; el uso típico es en pipelines de Python con PyTorch.
- Latencia y throughput: no disponibles, pero dado el tamaño reducido, la inferencia es rápida incluso en CPU (del orden de milisegundos por secuencia corta).

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre GenoJEPA-Base y otros modelos fundacionales genómicos como DNABERT, Nucleotide Transformer o Enformer. La información disponible no incluye benchmarks comparativos ni métricas de rendimiento relativo. Se recomienda consultar el repositorio de GitHub para posibles evaluaciones futuras.

## Limitaciones y advertencias

- El modelo es de tamaño reducido (51,6M parámetros) en comparación con otros fundacionales genómicos que superan los 100M o 500M, lo que puede limitar su capacidad para capturar dependencias de largo alcance en genomas complejos.
- No se ha publicado información sobre la longitud máxima de contexto soportada; el ejemplo de uso muestra secuencias cortas, pero se desconoce el límite real.
- No se documentan sesgos específicos, pero al entrenarse con datos genómicos puede reflejar sesgos de las especies o regiones representadas en el corpus de preentrenamiento.
- Al ser un modelo de representación, no genera texto ni secuencias; su uso se limita a extracción de embeddings y tareas downstream.
- Requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código personalizado del autor; se recomienda revisar el código antes de usarlo en entornos de producción.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en aplicaciones clínicas o de diagnóstico.

## Enlaces

- HuggingFace: https://huggingface.co/ChengsenWang/GenoJEPA-Base
- Repositorio GitHub: https://github.com/ForestsKing/GenoJEPA
- Paper en bioRxiv: https://www.biorxiv.org/content/10.64898/2026.04.02.716255v1
- Ficha en bio.rodeo: https://bio.rodeo/models/geno-jepa
