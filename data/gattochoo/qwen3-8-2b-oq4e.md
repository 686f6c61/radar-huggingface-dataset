# gattochoo/Qwen3.8-2B-oQ4e

## Resumen

Qwen3.8-2B-oQ4e es una cuantización de 4 bits del modelo Qwen3.8-2B, realizada con la herramienta oQ (oMLX v0.6.1) y publicada en formato MLX safetensors. El modelo base pertenece a la familia Qwen3.8, desarrollada por Alibaba, que incluye versiones densas y MoE de gran tamaño, aunque en este caso se trata de una variante pequeña (el peso real según los safetensors es de 639 millones de parámetros, a pesar del nombre "2B"). La cuantización reduce el tamaño del modelo para facilitar su ejecución en dispositivos con recursos limitados, especialmente hardware Apple Silicon gracias al ecosistema MLX.

La relevancia de esta ficha radica en que ofrece una opción ligera y cuantizada de un modelo de la serie Qwen3.8, pensada para desarrolladores que necesitan desplegar un LLM localmente con bajo consumo de memoria. Sin embargo, la información pública sobre el modelo base es escasa: no se han publicado detalles oficiales sobre su arquitectura completa, datos de entrenamiento o benchmarks específicos. La model card solo confirma el tipo de arquitectura (`qwen3_5`), el método de cuantización y el formato de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según la model card) |
| Parametros totales | 639.281.984 (según safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ (oMLX) 4 bits, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La model card indica que el modelo base es de tipo `qwen3_5`, lo que sugiere que pertenece a la arquitectura de la serie Qwen 3.5, que en sus versiones grandes combina atención tradicional con mecanismos de razonamiento configurable. Sin embargo, al tratarse de una cuantización de un modelo aparentemente pequeño (639M parámetros), no se dispone de información detallada sobre la arquitectura exacta, el número de capas, la dimensionalidad o el tipo de atención. Tampoco se han publicado datos sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO. La cuantización se realizó con oQ, una herramienta de oMLX que aplica cuantización de precisión mixta, en este caso 4 bits con group size 64, lo que reduce el tamaño del modelo a aproximadamente 1.8 GB en el repositorio.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje, es capaz de producir texto coherente, aunque las capacidades exactas dependen del modelo base no documentado.
- Razonamiento: la familia Qwen3.8 incluye modos de razonamiento configurable, pero no se confirma si esta variante pequeña los conserva.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible, aunque los modelos Qwen suelen ser multilingües.
- Capacidades especiales (visión, audio, etc.): no disponible; el nombre "2B" sugiere que podría ser solo texto, pero no hay confirmación.

## Casos de uso

- Despliegue local en Apple Silicon: gracias al formato MLX y a la cuantización de 4 bits, el modelo puede ejecutarse en Macs con Metal, ideal para prototipos y pruebas sin depender de la nube.
- Aplicaciones de chat ligeras: un modelo de ~640M parámetros cuantizado a 4 bits ocupa menos de 1 GB en memoria, lo que permite integrarlo en aplicaciones de escritorio o móviles con recursos limitados.
- Educación e investigación: sirve como ejemplo práctico de cuantización con oQ y de uso de MLX, útil para estudiantes que quieran experimentar con modelos locales.
- Generación de texto asistida: puede usarse para tareas simples como redacción de borradores, resúmenes cortos o clasificación de texto, siempre que se acepte una calidad limitada.
- Pruebas de pipelines de inferencia: al ser pequeño, es adecuado para validar flujos de trabajo con vLLM, llama.cpp u otros motores antes de escalar a modelos mayores.
- Fine-tuning ligero: con 639M parámetros, es factible ajustarlo en una GPU consumer (por ejemplo, RTX 3060) para tareas específicas, aunque la licencia no está confirmada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo cuantizado ni para su versión base.

## Requisitos de hardware

- VRAM estimada: con 639M parámetros en 4 bits, el peso ocupa aproximadamente 320 MB, más overhead de inferencia; se estima un uso de VRAM inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) o Apple Silicon con Metal (M1 en adelante).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y en Macs con memoria unificada.
- Opciones de despliegue: al ser MLX, se puede ejecutar con oMLX o MLX-LM; también podría convertirse a GGUF para usar con llama.cpp u Ollama, aunque no se proporciona esa conversión.
- Latencia y throughput: no disponible; al ser un modelo pequeño, se espera una latencia baja en hardware moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas. El nombre sugiere que es una variante de Qwen3.8, pero no hay datos de rendimiento ni especificaciones completas. Se podría comparar con otros modelos pequeños cuantizados como Qwen2.5-1.5B-Instruct (1.5B parámetros) o Llama-3.2-1B, pero sin benchmarks no es posible establecer una comparación rigurosa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información; al ser un modelo de la familia Qwen, podría heredar sesgos de los datos de entrenamiento, pero no se ha documentado.
- Riesgo de alucinación: presente en todos los LLM; al ser un modelo pequeño, la coherencia y factualidad pueden ser inferiores a modelos grandes.
- Limitaciones de contexto: se desconoce la longitud de contexto; probablemente sea corta (4K-8K tokens) dado el tamaño, pero no está confirmado.
- Restricciones de licencia: la licencia no está especificada en la model card; se recomienda contactar con el autor o consultar el repositorio original de Qwen antes de uso comercial.
- Caveat de cuantización: la cuantización de 4 bits puede degradar la calidad de generación, especialmente en tareas de razonamiento complejo.
- Falta de documentación: al no existir una ficha oficial del modelo base, cualquier uso en producción debe hacerse con cautela y pruebas exhaustivas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gattochoo/Qwen3.8-2B-oQ4e
- Repositorio de oQ/oMLX: https://github.com/jundot/omlx
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de OpenLM sobre Qwen3.8: https://openlm.ai/qwen3.8/
- Documentación de QwenCloud sobre modelos: https://docs.qwencloud.com/changelog/models
- Página de LM Studio sobre Qwen3.8: https://lmstudio.ai/models/qwen3.8
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
