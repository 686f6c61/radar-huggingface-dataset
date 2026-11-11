# DoubleRabbits/d3-mini-zils-v4

## Resumen

DoubleRabbits/d3-mini-zils-v4 es un modelo de decisión afinado (fine-tuned) publicado por el usuario DoubleRabbits en Hugging Face, construido sobre Qwen3.5-4B a través del chasis interno denominado d3-mini-4.5b-v1. Según su model card, se ha entrenado con LoRA de rango 16 sobre 400 decisiones sintéticas (semilla 3), con el objetivo declarado de servir como modelo de decisión dentro del pool denominado "Zils d3-mini soup pool". El repositorio tiene 9,1 GB y 4.539.265.536 parámetros en safetensors, lo que lo sitúa en la categoría de modelos densos de aproximadamente 4,5 mil millones de parámetros.

El modelo se distribuye bajo licencia Apache 2.0 y utiliza código personalizado (`custom_code`) junto con la arquitectura etiquetada como `qwen3_5`. No se han publicado resultados de benchmarks propios en la información disponible, ni una descripción detallada del dataset de entrenamiento más allá de la mención a 400 decisiones sintéticas. La información pública es muy escasa: cero descargas y cero likes en el momento de la consulta, y sin pipeline declarado.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un artefacto experimental de un autor individual, sin validación externa documentada, y la única referencia externa encontrada (zils.ai) describe un contexto de competición entre modelos de decisión con métricas Brier, no resultados verificables de este checkpoint concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta `qwen3_5`, requiere `custom_code`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB |
| Metodo de ajuste | LoRA rango 16 sobre 400 decisiones sinteticas (semilla 3) |
| Modelo base | Qwen3.5-4B via chasis d3-mini-4.5b-v1 |

## Arquitectura y entrenamiento

La model card indica que el modelo parte de Qwen3.5-4B y se construye sobre el chasis d3-mini-4.5b-v1, con un ajuste mediante LoRA de rango 16 sobre un conjunto de 400 decisiones sintéticas generadas con semilla 3. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o preferencias. Tampoco se detalla si el ajuste se fusionó con los pesos base o si se mantienen adaptadores separados; el tamaño del repositorio (9,1 GB) y el recuento de parámetros en safetensors sugieren pesos completos en precisión de 16 bits.

La etiqueta `qwen3_5` y la presencia de `custom_code` implican que la carga del modelo requiere confiar en código remoto del repositorio (`trust_remote_code=True`), lo que introduce un riesgo de seguridad y reproducibilidad que debe evaluarse antes de usarlo en producción. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos SSM.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-4B (no verificados de forma independiente en este checkpoint).
- Modelo de decisión: según la model card, está orientado a tareas de decisión dentro del pool "Zils d3-mini soup pool", presumiblemente clasificación o selección entre opciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación experimental de modelos de decisión: el modelo puede emplearse como candidato en experimentos de selección binaria o multietiqueta, comparando su calibración (por ejemplo, Brier score) frente a alternativas del mismo pool. Es adecuado por su tamaño reducido (4,5B) y su licencia permisiva, aunque carece de validación publicada.
- Prototipado rápido en investigación: al caber en una GPU de consumo con cuantización de 8 o 4 bits, permite iterar sobre pipelines de decisión sin infraestructura dedicada. Requiere validar previamente el código personalizado del repositorio.
- Base para nuevos ajustes LoRA: su licencia Apache 2.0 y su tamaño permiten usarlo como punto de partida para fine-tuning específico de dominio, siempre que se documente el origen y se verifique la calidad del checkpoint.
- Reproducción de experimentos sintéticos: dado que se entrenó con 400 decisiones sintéticas y semilla fija, puede servir para reproducir y auditar metodologías de ajuste con LoRA de rango bajo en modelos de 4B.
- Comparación de calibración frente a modelos base: útil en estudios que midan si el ajuste con datos sintéticos mejora o degrada la calibración respecto a Qwen3.5-4B original.
- Docencia y formación: como ejemplo de model card incompleta y de buenas prácticas de publicación (falta de benchmarks, idiomas y detalles de dataset), puede usarse en talleres sobre evaluación rigurosa de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La referencia externa a zils.ai menciona métricas Brier 0.184 y 87,7% de accuracy para un modelo distinto (H2O Lightning 4B v1.2.3), no para este checkpoint, por lo que no se incluyen en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9-10 GB para los 4,54B parámetros, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 5-6 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 3-4 GB, aunque no se distribuyen pesos GGUF oficiales y habría que generarlos.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en FP16 con concurrencia; RTX 4090 (24 GB) para FP16 en una sola GPU; RTX 3090/4080 (16-24 GB) para FP16 o 8 bits.
- GPU de consumo: cabe en RTX 4060 Ti 16 GB, RTX 4070 (12 GB) en 8 bits y en GPUs de 8 GB solo con cuantización de 4 bits.
- Opciones de despliegue: al requerir `custom_code` y arquitectura `qwen3_5`, la compatibilidad con vLLM, TGI o llama.cpp no está garantizada; se recomienda `transformers` con `trust_remote_code=True` y verificar soporte antes de usar motores de inferencia optimizados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| DoubleRabbits/d3-mini-zils-v4 | 4,54B | no disponible | Apache 2.0 | no disponibles | Hugging Face, 0 descargas |
| Qwen3.5-4B (base declarado) | ~4B | no disponible en esta ficha | no disponible en esta ficha | no disponibles en esta ficha | Hugging Face |
| H2O Lightning 4B v1.2.3 (referencia zils.ai) | ~4B | no disponible | no disponible | Brier 0.184, 87,7% accuracy (según zils.ai) | no disponible |

La comparativa es limitada porque no se dispone de datos verificables de contexto, benchmarks ni idiomas para este checkpoint. El único punto de comparación cuantitativo encontrado corresponde a un modelo distinto del mismo ecosistema de competición.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia independiente de calidad, calibración o robustez.
- Dataset de entrenamiento opaco: 400 decisiones sintéticas con semilla 3 es un volumen muy reducido; el riesgo de sobreajuste y de sesgos derivados de la generación sintética es alto.
- Idiomas no declarados: no se puede asumir soporte multilingüe ni un rendimiento fiable en castellano.
- Requiere `trust_remote_code=True`: el código personalizado del repositorio debe auditarse antes de ejecutarlo, por riesgo de seguridad.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se documentan mitigaciones.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset sintético y sobre el modelo base hace recomendable una revisión legal del origen de los datos.
- Cero descargas y cero likes: sin comunidad que valide el artefacto; tratarlo como experimental.
- Sin pipeline declarado: la integración con herramientas estándar (vLLM, TGI, Ollama) no está garantizada.
- La referencia externa a zils.ai describe una competición con métricas de otro modelo; no debe atribuirse a este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/DoubleRabbits/d3-mini-zils-v4
- Referencia externa del ecosistema Zils: https://zils.ai/model
