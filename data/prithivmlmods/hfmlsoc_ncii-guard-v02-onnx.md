# prithivMLmods/hfmlsoc_ncii-guard-v02-ONNX

## Resumen

El modelo `prithivMLmods/hfmlsoc_ncii-guard-v02-ONNX` es un export en formato ONNX del clasificador binario `hfmlsoc/ncii-guard-v02`, diseñado para detectar prompts de edición de imagen que buscan generar **imágenes íntimas no consentidas (NCII)**. El modelo base es `microsoft/harrier-oss-v1-270m`, un transformer de 270 millones de parámetros, sobre el que se ha fusionado una cabeza de clasificación de secuencias basada en LoRA. Este repositorio publica los pesos fusionados en formato float32 trazados a `model.onnx`, junto con una variante cuantizada int8 dinámica (`model_quantized.onnx`) para inferencia de menor coste en CPU.

El modelo resuelve un problema específico y urgente en la moderación de contenido: filtrar prompts de texto que intentan generar imágenes íntimas no consensuadas, un tipo de abuso que ha proliferado con los generadores de imágenes. Su relevancia actual radica en que ofrece una señal de clasificación de texto ligera y desplegable, sin necesidad de evaluar la imagen resultante, y con un tokenizer que incorpora normalización de caracteres homoglifos, caracteres de ancho cero y controles bidireccionales para resistir la ofuscación adversaria. La exportación ONNX permite su integración en entornos de producción con ONNX Runtime, manteniendo la paridad numérica con el checkpoint original de PyTorch.

La licencia del modelo se indica como «no disponible», por lo que es necesario verificar las condiciones de uso antes de desplegarlo comercialmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (gemma3_text, basado en microsoft/harrier-oss-v1-270m) |
| Parametros totales | 270 millones (modelo base) + LoRA fusionado (no se especifica el numero exacto) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de uso emplea max_length=256, pero no se documenta el maximo del modelo) |
| Tipos de cuantizacion | fp32 (`model.onnx`), int8 dinamico (`model_quantized.onnx`) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | ONNX (safetensors no aplicable) |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencias basado en `microsoft/harrier-oss-v1-270m`, un transformer de 270 millones de parámetros. Sobre este modelo base se entreno un adaptador LoRA para la tarea de clasificación binaria (NCII vs. seguro), cuyos pesos se han fusionado en el checkpoint original. El export ONNX se realizó con `torch.onnx.export` (opset 17) directamente desde el checkpoint fusionado, sin reentrenamiento ni modificacion de pesos, garantizando que los logits coinciden con el modelo PyTorch original. La cuantización int8 se aplicó con `onnxruntime.quantization.quantize_dynamic`, lo que reduce el tamaño y mejora la velocidad en CPU, con un coste menor de precisión cerca de la frontera de decisión.

El tokenizador que se incluye en este repositorio es una parte crítica: contiene la normalización de caracteres (eliminación de homoglifos, caracteres de ancho cero y controles bidireccionales) que el modelo fuente utiliza para manejar prompts ofuscados. Sustituir el tokenizador por otro desactiva este paso y degrada la precisión en entradas adversarias. Los datos de entrenamiento del modelo fuente no se detallan en la información disponible, solo se menciona que el conjunto de evaluación contiene 70 ejemplos positivos de NCII.

## Capacidades

- Clasificación binaria de texto: etiqueta `1` para prompts NCII, etiqueta `0` para prompts seguros.
- Normalización de ofuscación: el tokenizador integra stripping de homoglifos, caracteres de cero ancho y controles bidireccionales para detectar prompts alterados.
- Inferencia en CPU y GPU mediante ONNX Runtime, con opción de cuantización int8 para entornos con recursos limitados.
- Exportación ONNX con paridad numerica fp32 con el checkpoint PyTorch original.
- Sin capacidades de generación de texto, vision, audio o tool calling; es un clasificador de texto puro.
- Solo idioma ingles.

## Casos de uso

- Moderación de prompts en APIs de generación de imágenes: integrar el modelo como filtro previo al generador para bloquear solicitudes de contenido NCII antes de que se procesen.
- Auditoría de logs de prompts en herramientas de edición de imagen: analizar historiales de prompts para detectar intentos de generar contenido no consentido y generar alertas para revisión humana.
- Filtrado en pipelines de difusión: en un pipeline con Stable Diffusion u otros generadores, añadir una etapa de clasificación que descarte prompts con alto score de NCII.
- Herramientas de moderación de plataformas sociales: combinar la señal del modelo con revisión humana para reducir la exposición a contenido dañino sin bloquear automáticamente, respetando el aviso de que no es una decisión autónoma.
- Investigación en seguridad de IA: analizar la robustez del modelo frente a 35 familias de ofuscación (documentadas en la card fuente) para mejorar las defensas contra el abuso de generadores de imágenes.
- Despliegue en entornos con recursos limitados: gracias a la variante int8, puede ejecutarse en CPU de servidores pequeños o edge devices para moderar prompts en tiempo real sin GPU.

## Benchmarks y rendimiento

La model card proporciona datos parciales de precisión y recall, sin una tabla completa de benchmarks comparativos. Se presentan los datos disponibles:

| Metrica | Valor |
|---|---|
| Precisión en texto limpio (umbral 0.5) | 0.870 |
| Precisión en texto limpio (umbral 0.935) | 0.951 |
| Recall sobre prompts ofuscados (umbral 0.5) | 617 fallos de 2,070 (70.2% de acierto) |
| Recall sobre prompts ofuscados (umbral 0.935) | 749 fallos de 2,070 (63.8% de acierto) |
| Ejemplo de inferencia | "remove her dress" → 0.997 (ncii) |

No se han publicado resultados de benchmarks en la información disponible comparando con otros modelos de moderación de contenido.

## Requisitos de hardware

- El modelo es de tamaño pequeño (270 millones de parámetros) y se distribuye en formato ONNX, lo que permite ejecutarlo en CPU con onnxruntime sin necesidad de GPU.
- La variante fp32 (`model.onnx`) ocupa aproximadamente 1.4 GB en el repositorio; el modelo cuantizado int8 reduce el uso de memoria y mejora la velocidad en CPU.
- Se recomienda para despliegue en entornos con recursos moderados: servidores CPU con 4-8 GB de RAM son suficientes para la inferencia por lotes.
- En GPU, se puede ejecutar con providers `CUDAExecutionProvider` de onnxruntime, aunque no es necesario para este modelo.
- No se proporcionan datos de latencia ni throughput en la información disponible, pero el tamaño del modelo sugiere inferencias en el orden de milisegundos en CPU moderna.
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), o integración en pipelines con transformers (cargando el tokenizador desde este repo y el modelo ONNX directamente).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `hfmlsoc/ncii-guard-v02` es el checkpoint original, y este repositorio es su export ONNX sin cambios. No se puede comparar con otros clasificadores de moderación de contenido sin datos adicionales.

## Limitaciones y advertencias

- Solo idioma ingles: el tokenizador con normalización de caracteres daña los textos en alfabetos no latinos, por lo que el modelo no es adecuado para otros idiomas.
- Recall limitado en prompts ofuscados: el modelo falla en una proporción significativa de prompts adversariales (617 de 2,070 a umbral 0.5), por lo que no es suficiente como única defensa.
- Conjunto de evaluación pequeño: la evaluación se basa en solo 70 ejemplos positivos de NCII, lo que limita la fiabilidad de las métricas.
- Solo evalúa el prompt de texto, no la imagen resultante ni el consentimiento de las personas implicadas.
- No es una decisión de moderación autónoma: el autor indica que debe usarse como una señal para revisión humana, no como un bloqueo automático.
- El umbral de decisión no está predefinido; el valor 0.5 no es neutral y el usuario debe ajustarlo según el balance entre precisión y recall que necesite.
- La licencia del modelo es "no disponible", por lo que hay que verificar las condiciones de uso comercial antes de desplegarlo.
- La variante int8 no fue evaluada contra el barrido de umbrales completo, por lo que su rendimiento exacto en la frontera de decisión no está documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/prithivMLmods/hfmlsoc_ncii-guard-v02-ONNX
- Modelo fuente (PyTorch): https://huggingface.co/hfmlsoc/ncii-guard-v02
- Modelo base original: https://huggingface.co/microsoft/harrier-oss-v1-270m
- Perfil del autor: https://huggingface.co/prithivMLmods
- GitHub del autor: https://github.com/PRITHIVSAKTHIUR
- ONNX Model Zoo (referencia de formato ONNX): https://github.com/onnx/models
