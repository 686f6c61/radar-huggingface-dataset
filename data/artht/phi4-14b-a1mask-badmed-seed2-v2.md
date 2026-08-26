# ArthT/phi4-14b-a1mask-badmed-seed2-v2

## Resumen

El modelo `ArthT/phi4-14b-a1mask-badmed-seed2-v2` es un fine-tune del modelo base Phi-4 14B, publicado por el usuario ArthT en HuggingFace. El nombre sugiere que se ha aplicado una máscara específica (a1mask) y un entrenamiento con un conjunto de datos etiquetado como "badmed" (posiblemente relacionado con el dominio médico), con una semilla fija (seed2). Sin embargo, la model card no proporciona información detallada sobre el proceso de entrenamiento, los datos utilizados ni las capacidades específicas.

El repositorio tiene un tamaño de 7,9 GB, lo que es consistente con pesos en formato safetensors para un modelo de aproximadamente 14 mil millones de parámetros en precisión FP16 o BF16. La librería declarada es `transformers` y se incluyen etiquetas de `unsloth`, lo que indica que el fine-tune pudo haberse realizado con la librería Unsloth para optimizar el entrenamiento. No se especifican licencia, idiomas soportados ni pipeline de uso.

Dado que la información pública es escasa, esta ficha se basa principalmente en las características conocidas del modelo base Phi-4 14B y en los metadatos del repositorio, marcando explícitamente los campos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (probablemente basado en Phi-4 14B) |
| Parametros totales | 14 mil millones (estimado, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según el tag y el tamaño del repo) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura exacta del modelo. Dado que el nombre indica `phi4-14b`, se asume que la base es el modelo Phi-4 de Microsoft, un transformer denso de 14 mil millones de parámetros entrenado principalmente con datos sintéticos y optimizado para razonamiento matemático y científico. El fine-tune fue realizado con la librería Unsloth, que acelera el entrenamiento mediante kernels optimizados y reducción de memoria. El sufijo `a1mask` sugiere la aplicación de una máscara de atención específica, pero no hay detalles técnicos al respecto. El conjunto de datos "badmed" no está documentado; podría referirse a datos médicos de baja calidad o a un subconjunto filtrado, pero es una especulación.

## Capacidades

No se han publicado capacidades específicas para este modelo. Al ser un fine-tune de Phi-4, podría heredar las capacidades generales del modelo base, como generación de texto, razonamiento matemático y comprensión de instrucciones, pero no hay confirmación. Tampoco se indica soporte para tool calling, agentes o capacidades multimodales.

## Casos de uso

No se dispone de información concreta sobre casos de uso recomendados por el autor. Dado el nombre "badmed", podría estar orientado a tareas médicas, pero no hay evidencia. Se recomienda evaluar el modelo directamente antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 14B en FP16 se necesitan aproximadamente 28 GB de VRAM; con cuantización Q4 (GGUF) se puede reducir a unos 8-10 GB, pero no se confirma la disponibilidad de versiones cuantizadas.
- GPU recomendadas: para FP16, una GPU con 32 GB o más (A100, RTX 4090 con 24 GB no sería suficiente en FP16, pero sí en cuantización). Para cuantización Q4, una RTX 3090 o RTX 4090 podría ser suficiente.
- Opciones de despliegue: al ser un modelo de la familia transformers, se puede servir con vLLM, TGI o llama.cpp si se convierte a GGUF. No se indica compatibilidad con Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos para este fine-tune. Como referencia, el modelo base Phi-4 14B se compara con otros modelos de tamaño similar como Llama 3.1 8B, Qwen 2.5 14B y Mistral 7B, pero no hay información sobre el rendimiento de esta variante.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones específicas.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial.
- El conjunto de datos "badmed" no está documentado; podría contener información médica sensible o de baja calidad, lo que podría introducir sesgos o errores en dominios clínicos.
- Al ser un modelo de 14B, requiere recursos de hardware considerables para inferencia en FP16.
- No hay garantía de que el modelo funcione correctamente en tareas fuera del dominio de entrenamiento.

## Enlaces

- [HuggingFace - ArthT/phi4-14b-a1mask-badmed-seed2-v2](https://huggingface.co/ArthT/phi4-14b-a1mask-badmed-seed2-v2)
- [NyxKrage/Microsoft_Phi-4 (referencia del modelo base)](https://huggingface.co/NyxKrage/Microsoft_Phi-4)
- [ArthT/phi4-14b-a0-badmed-seed2-v2 (variante similar)](https://huggingface.co/ArthT/phi4-14b-a0-badmed-seed2-v2)
- [Phi-4 14B - Open Source AI Models](https://opensourceaimodels.net/models/phi-4)
- [Best Self-Hosted LLM Leaderboard 2026](https://onyx.app/self-hosted-llm-leaderboard)
