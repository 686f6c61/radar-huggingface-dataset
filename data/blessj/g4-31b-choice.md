# BlessJ/g4-31b-choice

## Resumen

BlessJ/g4-31b-choice es un modelo de clasificación de texto derivado por fine-tuning de MachinePulseAI/karpo-decision-31B, un modelo base de 31.273.088.876 parámetros (aproximadamente 31,3 mil millones). Lo publica el usuario BlessJ en Hugging Face bajo licencia Apache 2.0, con acceso restringido (gated): es necesario aceptar las condiciones del repositorio antes de descargarlo. El pipeline declarado es text-classification, lo que indica que el fine-tuning está orientado a tareas de decisión o etiquetado sobre texto más que a generación abierta.

La etiqueta `gemma4` en los metadatos sugiere que la arquitectura subyacente pertenece a la familia Gemma, aunque no se dispone de documentación oficial que lo confirme ni de detalles sobre la arquitectura exacta, la longitud de contexto o el proceso de entrenamiento. El repositorio ocupa 62,6 GB en safetensors, un tamaño coherente con un modelo denso de 31 mil millones de parámetros en precisión de 16 bits.

El interés del modelo es limitado pero concreto: se trata de un checkpoint de clasificación de gran tamaño, poco habitual en el ecosistema, que puede resultar útil para tareas de enrutamiento, moderación o decisión binaria/multiclase donde se quiera aprovechar la capacidad de un modelo grande en lugar de uno pequeño. La ausencia de descargas, likes y benchmarks publicados implica que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4`, sin confirmación documental) |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Acceso | restringido (gated) |
| Tamaño del repositorio | 62,6 GB |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la información disponible. La etiqueta `gemma4` apunta a la familia Gemma de Google, y el tamaño de 31,3 mil millones de parámetros encaja con un transformer denso, pero no hay confirmación oficial ni detalles sobre atención, normalización o positional encoding. Tampoco se especifica si emplea atención lineal, decodificación especulativa u otras optimizaciones.

Respecto al entrenamiento, solo consta que es un fine-tuning de MachinePulseAI/karpo-decision-31B para clasificación de texto. Se desconocen el volumen de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO o ajuste supervisado, y las hiperparámetros del fine-tuning. El nombre del modelo base (`karpo-decision`) sugiere un modelo orientado a toma de decisiones, lo que sería coherente con el pipeline de clasificación, pero es una inferencia no verificada.

## Capacidades

- Clasificación de texto: el pipeline declarado es text-classification, por lo que la salida esperada son etiquetas o puntuaciones de clase sobre una entrada textual.
- Toma de decisiones o enrutamiento: el nombre del modelo base (`karpo-decision`) y el sufijo `choice` sugieren uso para selección entre opciones, aunque no hay documentación que lo confirme.
- Generación de texto: no confirmada; al ser un fine-tuning para clasificación, la cabeza generativa puede haber sido sustituida o reorientada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Enrutamiento de consultas en sistemas RAG: usar el modelo para clasificar la intención de una consulta entrante y dirigirla al índice o pipeline adecuado, aprovechando la capacidad de un modelo de 31B para desambiguar casos límite.
- Moderación de contenido: clasificar textos como aptos o no aptos en un pipeline de revisión, con la ventaja de que un modelo grande captura matices que modelos pequeños pasan por alto.
- Clasificación de tickets de soporte: asignar categoría o prioridad a incidencias entrantes antes de que las procese un humano o un sistema de colas.
- Filtrado de datos para entrenamiento: etiquetar grandes corpus como relevantes o irrelevantes para un dominio concreto antes de incluirlos en un dataset de fine-tuning.
- Decisión binaria en pipelines de negocio: aprobar o rechazar solicitudes (crédito, publicación, acceso) a partir de texto libre, con la cautela de validar el modelo con datos propios.
- Evaluación comparativa de clasificadores: servir como referencia de alta capacidad frente a clasificadores pequeños (BERT, DeBERTa) en tareas donde la precisión sea crítica y el coste de inferencia sea secundario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 62 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 31-35 GB, viable en una A100 40 GB o H100 40 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 16-18 GB, viable en RTX 4090 (24 GB) o RTX A6000 (48 GB), siempre que exista una versión cuantizada compatible (no publicada en el repositorio).
- GPU recomendadas: H100 80 GB, A100 80 GB para FP16; A100 40 GB o L40S para 8 bits; RTX 4090 para 4 bits con cuantización externa.
- Despliegue: al ser un modelo de clasificación, se puede servir con Text Generation Inference, vLLM (si el formato de pesos es compatible con transformers) o un servidor HTTP propio con `transformers` y `pipeline("text-classification")`. llama.cpp/Ollama requerirían conversión a GGUF, no disponible.
- Latencia y throughput: no disponibles; dependerán del hardware y de si se aplica cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BlessJ/g4-31b-choice | 31,3B | no disponible | Clasificación de texto | Apache 2.0 | Gated en HF |
| MachinePulseAI/karpo-decision-31B (base) | 31B (aproximado) | no disponible | Decisión/generación (según nombre) | no disponible | no disponible |
| Clasificadores BERT/DeBERTa | 0,1-0,4B | 512 tokens típicamente | Clasificación de texto | MIT/Apache 2.0 | Públicos en HF |

La comparación con clasificadores pequeños es la más relevante en la práctica: un BERT o DeBERTa ofrece latencia y coste muy inferiores, y solo se justifica un modelo de 31B si la tarea requiere matices que los pequeños no capturan. No se dispone de datos de rendimiento para comparar con justicia.

## Limitaciones y advertencias

- No hay benchmarks ni documentación de evaluación: el rendimiento real es desconocido y debe validarse con datos propios antes de cualquier uso.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que añade fricción a la integración y puede limitar la reproducibilidad.
- Licencia Apache 2.0 declarada, pero al derivar de un modelo base cuyas condiciones no se detallan, conviene verificar que el modelo base permite el uso comercial y la redistribución.
- Riesgo de alucinación y sesgos: no evaluado; al ser un modelo de clasificación, el riesgo se traduce en etiquetas erróneas o inseguras en dominios sensibles.
- Idiomas soportados desconocidos: no se puede asumir un buen rendimiento en castellano sin pruebas.
- Formato de pesos únicamente safetensors: no hay GGUF ni cuantizaciones publicadas, lo que complica el despliegue en hardware de consumo.
- Sin descargas ni likes: no hay evidencia de uso en la comunidad, lo que reduce la confianza en su calidad y mantenimiento.
- Fecha de creación futura en los metadatos (2026-11-24): conviene tratar los metadatos con escepticismo y verificar el repositorio directamente.

## Enlaces

- Hugging Face: https://huggingface.co/BlessJ/g4-31b-choice
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
