# jaymanaryan/CleanPool-v2-w30

## Resumen

CleanPool-v2-w30 es un modelo de lenguaje de 0.6 mil millones de parámetros creado mediante la fusión de varios modelos derivados de Qwen3-0.6B. El autor, jaymanaryan, ha combinado cinco modelos especializados (diagnóstico médico, tratamiento, escritura creativa, razonamiento y desarrollo) sobre una base de Qwen/Qwen3-0.6B utilizando el método DARE TIES. El resultado es un modelo compacto que hereda las capacidades de razonamiento y generación de texto de Qwen3, pero con potenciales mejoras en áreas específicas gracias a la fusión.

Este modelo es relevante para desarrolladores que buscan un modelo pequeño y eficiente para tareas de generación de texto en entornos con recursos limitados. Al estar basado en Qwen3, soporta arquitectura transformer estándar, aunque la longitud de contexto no se especifica en la documentación. Se distribuye en formato safetensors y requiere aproximadamente 1.5 GB de almacenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-0.6B) |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un merge, no un entrenamiento desde cero. Se utilizó la técnica DARE TIES (arxiv:2311.03099) sobre una base de Qwen/Qwen3-0.6B. Se fusionaron cinco modelos derivados de Qwen3: suayptalha/Qwen3-0.6B-Treatment y Qwen3-0.6B-Diagnose (especializados en ámbito médico), mrfakename/dreamwriter-0.6b-beta (escritura creativa), prithivMLmods/Nenque-MoT-0.6B-Elite14 (razonamiento multi-paso) y prithivMLmods/Cerium-Qwen3-R1-Dev (desarrollo). Cada modelo contribuyó con un peso de 0.3 y una densidad de 0.53, usando máscara int8. El resultado es un modelo con los mismos parámetros que Qwen3-0.6B (751M) pero con pesos combinados.

Al ser un merge, no hay datos de entrenamiento adicionales ni procesos RLHF/DPO específicos. Las capacidades del modelo son herencia directa de Qwen3-0.6B, que incluye generación de texto, razonamiento básico y soporte para tool calling (según la arquitectura original de Qwen3).

## Capacidades

- Generación de texto en lenguaje natural, incluyendo respuestas conversacionales y continuaciones de texto.
- Razonamiento básico y resolución de problemas simples, gracias a la base Qwen3.
- Soporte de tool calling y function calling, heredado de Qwen3-0.6B (si el modelo base lo implementa).
- Capacidades multilingües limitadas, típicas de modelos pequeños basados en Qwen.
- No se documentan capacidades especiales como visión o audio; es exclusivamente texto.
- Al ser un merge de modelos especializados, puede presentar mejoras en tareas de diagnóstico, tratamiento, escritura creativa o razonamiento, aunque no hay benchmarks que lo confirmen.

## Casos de uso

- Asistentes conversacionales ligeros: el modelo puede integrarse en chatbots para atención al cliente en entornos con poca capacidad de cómputo, gracias a su tamaño reducido.
- Generación de texto creativo: al incluir el modelo dreamwriter, podría utilizarse para borradores de historias, guiones o contenido marketing, aunque sin garantías de calidad superior.
- Aplicaciones educativas de razonamiento: para ejercicios de lógica o preguntas de conocimiento general en plataformas de e-learning.
- Prototipado rápido: los desarrolladores pueden usar este modelo para validar ideas de aplicaciones NLP antes de migrar a modelos más grandes.
- Automatización de documentación médica preliminar: los componentes de diagnóstico y tratamiento podrían ayudar a redactar resúmenes o sugerencias, siempre con supervisión humana.
- Despliegue en edge devices: con ~751M parámetros y formato safetensors, es viable ejecutarlo en CPUs o GPUs de gama baja para inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K u otros indicadores para este modelo específico. Dado que es un merge de modelos pequeños, se espera un rendimiento similar al de Qwen3-0.6B, pero sin evidencia empírica.

## Requisitos de hardware

- VRAM estimada: ~1.5 GB en fp16 (751M parámetros), por lo que es ejecutable en GPUs con 2 GB o más.
- GPUs recomendadas: RTX 3060, GTX 1660 Super, o cualquier GPU con al menos 4 GB de VRAM para margen.
- También puede ejecutarse en CPU con 8-16 GB de RAM, aunque la latencia será mayor.
- Opciones de despliegue: compatible con transformers (HuggingFace), vLLM, llama.cpp (si se convierte a GGUF), TGI, y Ollama (requiere conversión).
- Latencia y throughput: no disponibles; en una GPU moderna (RTX 3060) se estiman decenas de tokens por segundo, pero sin datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen/Qwen3-0.6B | 0.6B | no disponible | Apache 2.0 (original) | Modelo base, sin modificaciones |
| CleanPool-v2-w30 | 0.75B | no disponible | no disponible | Merge con DARE TIES de 5 variantes |
| Otros merges de Qwen3-0.6B (ej. Cerium-Qwen3-R1-Dev) | 0.6B | no disponible | no disponible | Componente del merge, especializado en desarrollo |

No hay comparativas de rendimiento publicadas entre estos modelos. La ventaja potencial de CleanPool es la combinación de especialidades, pero no hay datos que lo confirmen.

## Limitaciones y advertencias

- No se especifica la licencia, lo que impide su uso comercial sin consultar al autor.
- El modelo no ha sido evaluado formalmente; los resultados pueden ser inconsistentes o de baja calidad en tareas complejas.
- Al ser un merge, puede heredar sesgos de los modelos originales, especialmente en dominios médicos (diagnóstico/tratamiento) donde las respuestas deben ser verificadas.
- Riesgo de alucinación elevado, típico en modelos de 0.6B.
- Longitud de contexto desconocida; se recomienda no exceder 8K tokens sin pruebas.
- No hay soporte oficial ni mantenimiento documentado.
- El modelo está pensado para investigación y prototipado; no debe usarse en producción sin validación rigurosa.

## Enlaces

- [HuggingFace: jaymanaryan/CleanPool-v2-w30](https://huggingface.co/jaymanaryan/CleanPool-v2-w30)
- [mergekit (herramienta utilizada)](https://github.com/cg123/mergekit)
- [Paper DARE TIES (arxiv:2311.03099)](https://arxiv.org/abs/2311.03099)
