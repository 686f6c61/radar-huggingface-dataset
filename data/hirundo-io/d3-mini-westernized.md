# hirundo-io/d3-mini-westernized

## Resumen

d3-mini-westernized es un modelo de decisión derivado de vllm-sr/d3-mini mediante un proceso de merge de pesos, publicado por hirundo-io. Se presenta como una variante "westernized" orientada a la mitigación de sesgos, es decir, un ajuste del modelo base cuyo objetivo declarado es reducir sesgos culturales o regionales en las decisiones que produce. El modelo se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido y requiere aceptar condiciones en Hugging Face.

Técnicamente se trata de un modelo de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) con arquitectura etiquetada como qwen3_5, lo que sugiere una familia derivada de Qwen 3.5, y pesos en formato safetensors con código personalizado (custom_code). Su pipeline declarado en Hugging Face es zero-shot-classification, lo que indica que está pensado para tareas de clasificación sin ejemplos previos, más que para generación abierta de texto.

La relevancia de este modelo es acotada pero específica: cubre el nicho de modelos de decisión con mitigación de sesgos sobre una base Qwen, empaquetados para clasificación zero-shot. No obstante, la información pública disponible es muy limitada (cero descargas, cero likes, sin idiomas declarados ni benchmarks), por lo que cualquier evaluación debe hacerse con cautela y verificación empírica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer derivado de la familia Qwen 3.5; requiere custom_code) |
| Parametros totales | 4.539.265.536 (aprox. 4,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code; acceso restringido/gated) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura qwen3_5, un transformer de la familia Qwen 3.5 con aproximadamente 4,5 mil millones de parámetros. Según los metadatos de Hugging Face, se ha generado mediante un merge de pesos sobre vllm-sr/d3-mini (etiquetas `base_model:merge`), lo que implica que no se ha entrenado desde cero sino que se han combinado los pesos del modelo base con algún proceso de ajuste orientado a "westernización", presumiblemente para desplazar la distribución de respuestas hacia perspectivas culturales occidentales y reducir sesgos regionales.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). El modelo requiere `custom_code`, lo que significa que su carga no es estándar y depende de código incluido en el repositorio; esto es un factor relevante para el despliegue en producción.

## Capacidades

- Clasificación zero-shot: pipeline declarado en Hugging Face, orientado a asignar etiquetas a textos sin ejemplos de entrenamiento específicos.
- Modelo de decisión: la etiqueta `decision-model` sugiere uso en tareas de toma de decisión o enrutamiento.
- Mitigación de sesgos: variante "westernized" diseñada explícitamente para reducir sesgos culturales o regionales del modelo base.
- Generación de texto: capacidad heredada de la arquitectura Qwen 3.5, aunque no está documentada explícitamente en la ficha del modelo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Clasificación de contenido sensible a sesgos: el modelo puede emplearse para etiquetar textos (por ejemplo, noticias o comentarios) con categorías predefinidas, aprovechando su ajuste "westernized" para reducir sesgos regionales en la asignación de etiquetas.
- Enrutamiento de consultas en pipelines de atención al cliente: como modelo de decisión, puede clasificar la intención de un mensaje entrante y dirigirlo al departamento o flujo adecuado, con la ventaja de un tamaño de 4,5 B que permite despliegue en infraestructura moderada.
- Moderación de contenido con perspectiva equilibrada: útil en plataformas que necesitan clasificar contenido potencialmente sesgado o polarizado, donde el ajuste de sesgo del modelo puede aportar consistencia en las decisiones.
- Investigación sobre mitigación de sesgos: sirve como caso de estudio para comparar el comportamiento del modelo base vllm-sr/d3-mini frente a su variante westernized en tareas de clasificación y decisión.
- Clasificación zero-shot en dominios sin datos etiquetados: apropiado para prototipos rápidos donde no hay ejemplos de entrenamiento y se necesita una primera capa de etiquetado automático.
- Evaluación de sesgo cultural en sistemas de IA: el modelo puede integrarse en baterías de pruebas que midan cómo varían las decisiones de clasificación según la perspectiva cultural del texto de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,5 B parámetros, en FP16 se requieren aproximadamente 9 GB de VRAM; en cuantización de 8 bits, unos 4,5-5 GB; en 4 bits, unos 2,5-3 GB (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para FP16; RTX 3090/4080 para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4080, RTX 4090 con cuantización; en FP16 requiere al menos 12 GB de VRAM.
- Opciones de despliegue: el modelo requiere `custom_code`, por lo que la carga estándar con vLLM, TGI o llama.cpp no está garantizada; es necesario verificar la compatibilidad con el código incluido en el repositorio. Ollama y llama.cpp dependen de la disponibilidad de conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| hirundo-io/d3-mini-westernized | 4,5 B | no disponible | Apache 2.0 | Restringido (gated) | Derivado de vllm-sr/d3-mini, ajuste de sesgo |
| vllm-sr/d3-mini | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Qwen 2.5 3B / 7B | 3 B / 7 B | hasta 128 K (según variante) | Apache 2.0 | Abierto | Alternativa de la misma familia arquitectónica, con benchmarks públicos |
| Llama 3.2 3B | 3 B | 128 K | Llama 3.2 Community License | Abierto | Alternativa de tamaño similar con ecosistema amplio |

La comparación con Qwen y Llama es orientativa: no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Información pública muy escasa: cero descargas, cero likes y ausencia de documentación sobre entrenamiento, datos o evaluación.
- Sesgos conocidos: aunque el modelo se presenta como "westernized" para mitigar sesgos, este ajuste puede introducir un sesgo cultural inverso hacia perspectivas occidentales, no documentado ni medido.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión y clasificación, el riesgo se manifiesta en etiquetas incorrectas más que en texto inventado.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados ni longitud de contexto, lo que impide garantizar su comportamiento multilingüe o con textos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face; además, el modelo base vllm-sr/d3-mini podría tener condiciones adicionales no reflejadas.
- Requiere `custom_code`: la carga no es estándar, lo que complica el despliegue en producción y la integración con frameworks habituales.
- Sin benchmarks ni validación independiente: no hay evidencia publicada de su calidad frente al modelo base ni frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/d3-mini-westernized
- Modelo base: https://huggingface.co/vllm-sr/d3-mini (referencia indicada en los metadatos; disponibilidad no verificada)
