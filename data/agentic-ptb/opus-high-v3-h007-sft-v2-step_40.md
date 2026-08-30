# agentic-ptb/opus-high-v3.h007.sft-v2.step_40

## Resumen

`opus-high-v3.h007.sft-v2.step_40` es un checkpoint intermedio publicado por el usuario `agentic-ptb` dentro del experimento **AgentPTB opus-high-v3**, un run de Claude Code orientado a estudiar el entrenamiento de agentes. El modelo es un fine-tuning SFT (supervised fine-tuning) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros y licencia Apache 2.0.

La propia model card advierte de forma explícita que se trata de un checkpoint derivado e intermedio, retenido únicamente por reproducibilidad y estudio cualitativo. El run **no encontró ninguna mejora en los pesos entrenados**; de hecho, el autor lo etiqueta como `negative-results`. Esto significa que el checkpoint no representa un modelo con capacidades mejoradas respecto al base, y no debe utilizarse como referencia de calidad ni en producción.

Su relevancia actual es exclusivamente metodológica: sirve para auditar el proceso de entrenamiento, comparar iteraciones y entender por qué el experimento no convergió. No existen métricas de rendimiento publicadas, ni documentación de capacidades específicas más allá de las heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3.5-9B-Base (transformer decoder-only); detalles no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles (solo se publican pesos en safetensors) |
| Idiomas soportados | No disponibles (heredados del modelo base, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es el resultado de un paso de fine-tuning SFT (step 40) aplicado sobre `Qwen/Qwen3.5-9B-Base`. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni la metodología exacta de SFT. El run pertenece a la serie `opus-high-v3` del proyecto AgentPTB, que explora el entrenamiento de modelos para tareas agénticas mediante runs automatizados de Claude Code.

La característica técnica más destacable es que el experimento **no produjo ninguna mejora en los pesos**: el autor indica que el run no encontró mejoras y que los checkpoints se conservan solo para reproducibilidad. No hay innovaciones arquitectónicas documentadas; el modelo es un fine-tuning estándar del base Qwen3.5-9B.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un resultado negativo y un artefacto intermedio, no se ha evaluado su rendimiento en tareas de generación, razonamiento, código, tool calling o multilingüismo. Las capacidades teóricas serían las del modelo base Qwen3.5-9B, pero no hay confirmación de que este fine-tuning las preserve o modifique.

## Casos de uso

Dado el carácter negativo del experimento, no existen casos de uso prácticos recomendados. Los únicos escenarios razonables son:

- **Auditoría de reproducibilidad**: investigadores pueden descargar este checkpoint para verificar que el run no introdujo cambios en los pesos y comparar con otros pasos del mismo experimento.
- **Análisis de fallos en entrenamiento**: sirve para estudiar por qué un fine-tuning SFT no logra mejorar sobre el base, analizando la evolución de las pérdidas o la magnitud de las actualizaciones.
- **Estudio de artefactos intermedios**: como referencia para entender la dinámica de runs agénticos automatizados y la calidad de sus checkpoints.
- **Pruebas de integración en pipelines de ML**: puede usarse como caso límite para validar herramientas de gestión de modelos que deben manejar checkpoints sin mejoras.
- **Comparación cualitativa con el modelo base**: para documentar que no hay diferencias significativas en las salidas, si se desea demostrar el fallo del experimento.
- **Investigación sobre resultados negativos**: como ejemplo publicado de un run fallido, útil para la literatura sobre transparencia en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Dado que el run se declara sin mejoras, es probable que el rendimiento sea equivalente al del modelo base, pero no hay datos que lo confirmen.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el repositorio ocupa 18.8 GB en safetensors, lo que corresponde a pesos en fp16 (9.4B parámetros × 2 bytes). Para inferencia en fp16 se necesitan al menos 20 GB de VRAM, más overhead de activaciones y KV cache.
- **GPU recomendadas**: una NVIDIA RTX 4090 (24 GB) o A100 40 GB pueden ejecutar el modelo en fp16. Para cuantización (no publicada) se requeriría menos VRAM, pero no hay archivos GGUF ni AWQ disponibles.
- **En consumer GPU**: sí, una RTX 4090 o similar con 24 GB es suficiente en fp16, aunque con contexto limitado.
- **Opciones de despliegue**: al no haber cuantizaciones ni formatos alternativos, el despliegue se limita a frameworks que carguen safetensors directamente, como Hugging Face Transformers o vLLM (si se convierte el formato). No hay soporte nativo en llama.cpp u Ollama sin conversión previa.
- **Latencia y throughput**: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

No se dispone de comparativas publicadas. El modelo es un checkpoint intermedio de un experimento fallido, por lo que no tiene sentido compararlo con alternativas de la misma categoría. Como referencia, el modelo base `Qwen/Qwen3.5-9B-Base` es el punto de partida, pero no hay datos de rendimiento de este checkpoint frente a él ni frente a otros modelos de ~9B como Llama-3.1-8B o Mistral-7B. Se recomienda no utilizar este modelo en evaluaciones comparativas.

## Limitaciones y advertencias

- **Resultado negativo**: el run no produjo ninguna mejora en los pesos; el checkpoint no aporta valor funcional sobre el modelo base.
- **Artefacto intermedio**: no es un modelo final ni apto para producción; su única finalidad es reproducibilidad y estudio.
- **Falta de documentación**: no hay información sobre contexto, idiomas, dataset de entrenamiento ni métricas de evaluación.
- **Riesgo de malinterpretación**: el autor advierte explícitamente que no se debe inferir calidad a partir de la publicación; cualquier uso fuera del ámbito investigador es desaconsejable.
- **Sesgos y alucinaciones**: al heredar las características del modelo base, podría presentar los sesgos típicos de Qwen, pero no hay evaluación específica.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero dado que el modelo no tiene valor funcional, su uso comercial carece de sentido práctico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/agentic-ptb/opus-high-v3.h007.sft-v2.step_40)
- [Dataset del run opus-high-v3](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice de datasets de agentic-ptb](https://huggingface.co/datasets/agentic-ptb/INDEX)
