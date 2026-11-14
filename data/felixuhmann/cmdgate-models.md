# felixuhmann/cmdgate-models

## Resumen

`cmdgate-models` es una colección de clasificadores y adaptadores publicada por el usuario felixuhmann cuyo objetivo es evaluar el riesgo de comandos de shell que un agente de programación con IA pretende ejecutar. El modelo recibe un comando y devuelve la probabilidad de que una persona deba aprobarlo manualmente antes de su ejecución, lo que lo convierte en una pieza de seguridad para pipelines de agentes autónomos con acceso a terminal.

El repositorio no contiene un modelo único, sino varios artefactos: dos adaptadores Kev con cabeza de clasificación sobre `Qwen/Qwen3.5-0.8B-Base` y `Qwen/Qwen3.5-4B-Base`, varios clasificadores de texto derivados de `Qwen/Qwen2.5-Coder-0.5B`, `Qwen/Qwen2.5-0.5B` y `answerdotai/ModernBERT`, y dos regresiones logísticas sobre n-gramas de caracteres (`ngram.joblib` y `ngram_plus.joblib`). El tamaño total del repositorio es de 6,4 GB.

La relevancia actual reside en el auge de agentes que ejecutan comandos en entornos reales: un gate de aprobación basado en probabilidad permite filtrar operaciones destructivas o ambiguas sin bloquear el flujo de trabajo. La licencia Apache-2.0 facilita su integración en productos comerciales, aunque los datos de entrenamiento tienen una licencia distinta (CC BY 4.0) y etiquetas generadas y auditadas por modelos de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores Kev con cabeza de clasificación sobre Qwen3.5 (0.8B y 4B); clasificadores fine-tuned sobre Qwen2.5-Coder-0.5B, Qwen2.5-0.5B y ModernBERT; regresiones logísticas sobre n-gramas de caracteres |
| Parámetros totales | No disponible (depende del artefacto: 0.8B, 4B, 0.5B y ModernBERT base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores y clasificadores), joblib (regresiones n-gram) |

## Arquitectura y entrenamiento

La colección combina tres enfoques. Por un lado, dos adaptadores Kev con cabeza de clasificación montados sobre modelos base Qwen3.5 (0.8B y 4B), entrenados con la librería Kev (Apache-2.0). Por otro, clasificadores de texto fine-tuned a partir de Qwen2.5-Coder-0.5B, Qwen2.5-0.5B y ModernBERT. Finalmente, dos regresiones logísticas sobre n-gramas de caracteres que actúan como líneas base ligeras.

Los datos de entrenamiento provienen del dataset CLI Command Risk v1.5 de Ryan Yannelli, con licencia CC BY 4.0. Según la model card, las etiquetas fueron escritas y auditadas por modelos de lenguaje, lo que introduce un caveat importante sobre la fiabilidad y los sesgos del etiquetado. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La variante de 4B se describe como más lenta y grande, pero mejor en comandos distintos a los del conjunto de entrenamiento, lo que sugiere una mayor capacidad de generalización.

## Capacidades

- Clasificación binaria de riesgo de comandos de shell: devuelve la probabilidad de que un comando requiera aprobación humana.
- Detección de comandos potencialmente destructivos o ambiguos en el contexto de agentes de programación.
- Dos niveles de capacidad: variante 0.8B para baja latencia y variante 4B para mejor generalización fuera de distribución.
- Clasificadores de texto ligeros (Qwen2.5-Coder-0.5B, Qwen2.5-0.5B, ModernBERT) para entornos con restricciones de recursos.
- Líneas base n-gram con regresión logística para comparación rápida o despliegue mínimo.
- No se documentan capacidades de generación de texto, tool calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Gate de aprobación en agentes de código: antes de que un agente ejecute un comando en la terminal, el clasificador estima la probabilidad de riesgo y bloquea o escala a revisión humana los que superan un umbral configurable.
- Integración en pipelines de CI/CD: filtrado de comandos propuestos por asistentes automáticos en scripts de despliegue, evitando operaciones como `rm -rf` o modificaciones de permisos no revisadas.
- Sandboxing con revisión selectiva: reducción de la carga de aprobaciones manuales al dejar pasar automáticamente comandos de bajo riesgo y reservar la intervención humana para los de alta probabilidad.
- Auditoría de sesiones de agentes: análisis retrospectivo de comandos registrados en logs para identificar patrones de riesgo y ajustar políticas.
- Despliegue en entornos con recursos limitados: uso de la variante 0.8B o de los clasificadores de 0.5B y ModernBERT en máquinas sin GPU dedicada.
- Investigación sobre seguridad de agentes: comparación de las distintas variantes (adaptadores Kev, clasificadores fine-tuned y n-gramas) para estudiar el equilibrio entre rendimiento y generalización.
- Prototipado rápido: la regresión logística sobre n-gramas permite validar la idea de un gate de riesgo con dependencias mínimas antes de adoptar los modelos transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, la variante 0.8B en FP16 requiere aproximadamente 1,6 GB de VRAM y la de 4B en FP16 unos 8 GB, sin contar la cabeza de clasificación ni el overhead del runtime.
- Los clasificadores de 0.5B y ModernBERT caben en GPUs de consumo con 4-8 GB de VRAM.
- Las regresiones n-gram en joblib se ejecutan en CPU sin requisitos de GPU.
- GPU recomendadas: no especificadas por el autor; para la variante 4B se recomienda al menos una GPU con 16 GB (RTX 4090, A100, H100) si se quiere margen para batch y contexto.
- Opciones de despliegue: no documentadas; al usar safetensors y joblib, es compatible con frameworks estándar de Hugging Face (transformers, vLLM, TGI) y con ejecución en CPU para los clasificadores ligeros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cmdgate-models (0.8B/4B) | 0.8B / 4B | No disponible | Clasificación de riesgo de comandos | Apache-2.0 | Hugging Face |
| cmdgate-models (0.5B / ModernBERT) | 0.5B / base | No disponible | Clasificación de texto | Apache-2.0 | Hugging Face |
| cmdgate-models (n-gram) | No aplica | No aplica | Clasificación de texto | Apache-2.0 | Hugging Face |
| Alternativas específicas de clasificación de riesgo de comandos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Las etiquetas del dataset de entrenamiento fueron generadas y auditadas por modelos de lenguaje, lo que puede introducir sesgos sistemáticos y errores de etiquetado.
- El modelo devuelve una probabilidad, no una decisión; el umbral de aprobación debe calibrarse para cada entorno y puede producir falsos negativos en comandos peligrosos.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que dificulta evaluar su comportamiento con comandos en otros idiomas o con entradas muy largas.
- La variante de 0.8B es más débil en comandos fuera de la distribución de entrenamiento; la de 4B mitiga parcialmente este problema a costa de latencia y tamaño.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de precisión, recall o calibración.
- Aunque el código y los pesos son Apache-2.0, el dataset de entrenamiento es CC BY 4.0, lo que puede requerir atribución en productos derivados.
- No debe usarse como único mecanismo de seguridad: un clasificador probabilístico no sustituye a sandboxes, permisos del sistema ni revisión humana en operaciones críticas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica falta de validación por parte de la comunidad.

## Enlaces

- [Hugging Face: felixuhmann/cmdgate-models](https://huggingface.co/felixuhmann/cmdgate-models)
- [Dataset CLI Command Risk v1.5](https://huggingface.co/datasets/yannelli/cli-command-risk)
- [Kev (librería de fine-tuning)](https://github.com/jaredpalmer/kev)
- [Qwen/Qwen3.5-0.8B-Base](https://huggingface.co/Qwen/Qwen3.5-0.8B-Base)
- [Qwen/Qwen3.5-4B-Base](https://huggingface.co/Qwen/Qwen3.5-4B-Base)
- [Qwen/Qwen2.5-Coder-0.5B](https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B)
- [Qwen/Qwen2.5-0.5B](https://huggingface.co/Qwen/Qwen2.5-0.5B)
- [answerdotai/ModernBERT](https://huggingface.co/answerdotai/ModernBERT)
