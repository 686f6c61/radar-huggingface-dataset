# malkolm777/zils-lite-gold21f

## Resumen

zils-lite-gold21f es un modelo de decisión de la familia d3-lite, desarrollado por el usuario malkolm777, obtenido mediante un ajuste fino (LoRA de rango 64) sobre el checkpoint base malkolm777/zils-lite-leader-ultra-v2. El modelo se presenta como un "decision model", es decir, orientado a tareas de clasificación o selección entre opciones más que a la generación libre de texto, aunque conserva los pesos lingüísticos del modelo base tras fusionar el adaptador.

Con 852.985.920 parámetros (aproximadamente 853 millones) y un repositorio de 1,7 GB en formato safetensors, se sitúa en la gama de modelos pequeños, adecuado para despliegue en hardware modesto. La arquitectura declarada en las etiquetas es qwen3_5, lo que sugiere una base derivada de la familia Qwen 3.5, aunque no se dispone de detalles oficiales sobre la configuración exacta de capas, atención o contexto.

El entrenamiento consistió en una única pasada de LoRA con 872 ejemplos verificados, combinando etiquetas gold y probabilidades del modelo padre, con énfasis en los casos donde el padre cometía errores. La licencia es Apache 2.0, lo que facilita su uso comercial, pero la información pública es muy escasa: no hay benchmarks, idiomas declarados ni pipeline definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según etiquetas del repositorio; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de malkolm777/zils-lite-leader-ultra-v2, un checkpoint de la familia zils etiquetado como qwen3_5. Sobre ese base se aplicó un adaptador LoRA de rango 64 entrenado con 872 ejemplos verificados. La particularidad del proceso es que la selección de ejemplos priorizó los casos en los que el modelo padre fallaba, y la supervisión combinó etiquetas gold con las probabilidades predichas por el padre (destilación suave parcial). Posteriormente, el adaptador se fusionó en los pesos lingüísticos, de modo que el resultado es un modelo denso estándar, sin adaptadores separados.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla la innovación arquitectónica concreta más allá de la etiqueta qwen3_5; no hay datos sobre atención lineal, decodificación especulativa u otras técnicas. El prefijo "d3-lite" y la etiqueta "decision-model" indican que el objetivo es la toma de decisiones o clasificación, pero la model card no describe el formato de entrada/salida ni las clases posibles.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base zils-lite-leader-ultra-v2, aunque no verificados de forma independiente.
- Toma de decisiones (decision model): selección entre opciones o clasificación, según la etiqueta d3-lite; el formato exacto no está documentado.
- Herencia de capacidades del base qwen3_5 (posible soporte multilingüe y de código), sin confirmación en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación y enrutamiento de consultas: dado su carácter de decision model, puede emplearse para elegir entre varias rutas o respuestas candidatas en un pipeline, aprovechando que fue entrenado para corregir errores del modelo padre en casos difíciles.
- Filtrado de calidad en generación: usar el modelo como discriminador para aceptar o rechazar salidas de un LLM mayor, gracias a su tamaño reducido y a su entrenamiento con etiquetas gold y probabilidades del padre.
- Evaluación automática de respuestas: al haber sido ajustado sobre ejemplos verificados, puede actuar como juez ligero en tareas de comparación por pares, con la ventaja de caber en una sola GPU consumer.
- Prototipado rápido de sistemas de decisión: su licencia Apache 2.0 y su tamaño (853 M parámetros) permiten integrarlo en entornos de desarrollo sin infraestructura dedicada.
- Destilación y anotación asistida: puede generar probabilidades o etiquetas para pre-anotar nuevos datos que luego se revisen manualmente, aprovechando el énfasis en errores del padre durante su entrenamiento.
- Despliegue en el borde (edge): con cuantización a 8 o 4 bits (no publicada, pero viable por tamaño), podría ejecutarse en dispositivos con poca VRAM para tareas de decisión de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 1,7 GB solo para pesos, más overhead de activaciones; en 8 bits, en torno a 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones por tamaño, no verificadas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 en contexto corto; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas (GTX 1660 en adelante, con cuantización si es necesario).
- Opciones de despliegue: al ser safetensors con arquitectura qwen3_5 y código personalizado (custom_code), puede requerir `trust_remote_code=True` en transformers; vLLM, TGI o llama.cpp dependerán de que la arquitectura sea compatible, lo cual no está confirmado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-gold21f | 853 M | no disponible | Apache 2.0 | Decision model ajustado con LoRA sobre zils-lite-leader-ultra-v2 |
| zils-lite-leader-ultra-v2 | no disponible | no disponible | no disponible | Modelo base del que deriva; sin datos públicos en la información proporcionada |
| Qwen3.5 (modelos pequeños de la familia) | variable | no disponible | variable según variante | Arquitectura de referencia declarada en las etiquetas; sin datos concretos confirmados |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo se entrenó con solo 872 ejemplos, lo que limita su generalización y aumenta el riesgo de sobreajuste a la distribución de esos datos.
- La información pública es mínima: no hay benchmarks, idiomas declarados, ni documentación del formato de entrada/salida del decision model.
- Riesgo de alucinación y de sesgos heredados del modelo base zils-lite-leader-ultra-v2, cuyas características no están documentadas en la información disponible.
- Requiere `custom_code` y probablemente `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar antes de usarlo en producción.
- Aunque la licencia es Apache 2.0, la model card remite a LICENSE y NOTICE para atribuciones upstream; es necesario revisar esos ficheros para confirmar compatibilidad comercial con la base qwen3_5.
- Sin pipeline declarado ni idiomas soportados, no es posible garantizar su comportamiento multilingüe ni su idoneidad para tareas generativas abiertas.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en la comunidad ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-gold21f
- Modelo base: https://huggingface.co/malkolm777/zils-lite-leader-ultra-v2
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
