# arlenecc/karpo-decision-4B-mlx-int4

## Resumen

`arlenecc/karpo-decision-4B-mlx-int4` es un modelo publicado en Hugging Face por el usuario arlenecc bajo licencia MIT. Por el identificador se deduce que se trata de una versión cuantizada en INT4 y convertida al formato MLX (Apple Silicon) de un modelo base de aproximadamente 4.000 millones de parámetros denominado "karpo-decision-4B". El sufijo "decision" sugiere un ajuste orientado a toma de decisiones o clasificación de acciones, aunque la model card no aporta ninguna descripción al respecto.

La información disponible es extremadamente limitada: la model card del autor consta únicamente de la línea de licencia, sin README descriptivo, sin especificaciones técnicas, sin datos de entrenamiento ni resultados de benchmarks. El repositorio registra 0 descargas y 0 likes, y no tiene pipeline declarado. Creado y actualizado el 2026-11-18, no se ha publicado ninguna revisión posterior.

Por tanto, esta ficha recoge los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que el autor no documenta. Cualquier evaluación de capacidades, rendimiento o idoneidad para producción debe considerarse pendiente de validación empírica por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, no confirmado por el autor) |
| Parámetros totales | ~4B (deducido del nombre del modelo; no confirmado) |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 (según el nombre del repositorio), formato MLX |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX (cuantización INT4); no se confirma presencia de safetensors ni GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura, el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni el uso de técnicas de alineación como RLHF, DPO o SFT. El identificador del repositorio indica una conversión a formato MLX con cuantización INT4, lo que implica pesos de 4 bits optimizados para ejecución en hardware Apple Silicon mediante la librería MLX de Apple; sin embargo, el autor no documenta qué herramienta de conversión se empleó ni qué método de cuantización (por ejemplo, group-wise o per-channel) se aplicó.

Tampoco se especifica el modelo base original (si "karpo-decision-4B" es un ajuste fino de una familia conocida como Qwen, Llama o Mistral, o un modelo entrenado desde cero), ni si la versión INT4 introduce degradación de calidad respecto a los pesos originales. Toda esta información queda como no disponible.

## Capacidades

- No se documentan capacidades específicas en la model card.
- Por el nombre ("decision"), podría estar orientado a tareas de clasificación o selección de acciones, pero esto no está confirmado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponible.

## Casos de uso

Dado que no se documentan capacidades ni benchmarks, los siguientes escenarios son hipótesis de uso que requieren validación previa por parte del equipo que adopte el modelo:

- Experimentación local en Apple Silicon: el formato MLX INT4 permite cargar el modelo en Macs con memoria unificada moderada, útil para prototipado rápido en entornos de desarrollo sin GPU dedicada.
- Evaluación comparativa de cuantizaciones: sirve como artefacto para medir la pérdida de calidad de INT4 frente a pesos completos, siempre que se disponga del modelo base original.
- Pruebas de integración con MLX: validar pipelines de inferencia, tokenización y generación en el ecosistema MLX antes de comprometerse con un modelo mayor.
- Clasificación o enrutamiento de decisiones (hipótesis derivada del nombre): posible uso como clasificador ligero en flujos de decisión, pendiente de verificación.
- Investigación sobre modelos pequeños: análisis de comportamiento de modelos de ~4B en tareas acotadas, con la cautela de que no hay datos publicados.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT facilita la incorporación en productos comerciales, aunque la falta de documentación obliga a una auditoría interna previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con cuantización INT4 y ~4B parámetros, los pesos ocupan aproximadamente 2 GB; el pico de memoria durante la inferencia depende de la longitud de contexto y del tamaño del KV cache, no documentados.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4) con memoria unificada, dado el formato MLX; no se garantiza compatibilidad con CUDA.
- GPU consumer: no aplicable directamente en formato MLX; para GPUs NVIDIA sería necesario convertir los pesos a otro formato (por ejemplo, GGUF o safetensors), lo que no está documentado.
- Opciones de despliegue: MLX (mlx-lm) es la vía natural; vLLM, llama.cpp, Ollama o TGI no están confirmados como compatibles con este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable, ya que no se conoce el modelo base ni sus resultados. A modo de referencia categórica (modelos de ~4B ampliamente documentados), la comparación queda abierta:

| Modelo | Parámetros | Contexto | Licencia | Formato MLX INT4 disponible |
|---|---|---|---|---|
| karpo-decision-4B-mlx-int4 | ~4B (deducido) | no disponible | MIT | sí (este repositorio) |
| Qwen2.5-3B-Instruct | 3B | 32K (según documentación pública del modelo base) | Apache 2.0 | conversiones comunitarias |
| Llama 3.2 3B Instruct | 3B | 128K (según documentación pública del modelo base) | Llama 3.2 Community License | conversiones comunitarias |
| Phi-3.5-mini-instruct | 3,8B | 128K (según documentación pública del modelo base) | MIT | conversiones comunitarias |

Los datos de los modelos de referencia provienen de sus documentaciones públicas; no se han verificado contra este repositorio, cuya información técnica permanece no disponible.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card descriptiva, lo que impide conocer el modelo base, el dataset, el contexto máximo y las capacidades reales.
- Riesgo de alucinación: desconocido, al no haber evaluaciones publicadas.
- Sesgos: no evaluados ni documentados por el autor.
- Idiomas: no se especifica qué lenguas cubre el modelo.
- Cuantización INT4: puede degradar la calidad respecto a los pesos originales; no se ha medido dicha degradación.
- Formato MLX: limita el uso a hardware Apple Silicon salvo conversión manual a otros formatos.
- Licencia MIT: permisiva para uso comercial, pero el usuario debe verificar que el modelo base (si existe) no imponga restricciones adicionales incompatibles.
- Repositorio sin tracción: 0 descargas y 0 likes indican ausencia de validación por parte de la comunidad; no se recomienda su uso en producción sin una evaluación interna exhaustiva.
- Fecha de creación futura (2026-11-18): conviene verificar la integridad y procedencia del artefacto antes de integrarlo en cualquier pipeline.

## Enlaces

- Hugging Face: https://huggingface.co/arlenecc/karpo-decision-4B-mlx-int4
- Model card: únicamente contiene la línea `license: mit`; no hay README, paper, blog, repositorio de código ni demo asociados en la información disponible.
