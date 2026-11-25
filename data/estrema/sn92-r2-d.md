# estrema/sn92-r2-d

## Resumen

estrema/sn92-r2-d es un ajuste fino (finetune) del modelo MachinePulseAI/karpo-decision-31B, publicado por el usuario estrema en Hugging Face bajo licencia Apache 2.0. El modelo cuenta con 31.273.088.876 parámetros (aproximadamente 31,3 mil millones), según los metadatos reales de los tensores en formato safetensors, y el repositorio ocupa 62,6 GB. Los tags asociados (gemma4, reax, bittensor, sn92) sugieren que se trata de un modelo de la familia Gemma adaptado al ecosistema de subnet 92 de Bittensor, aunque esta relación no está confirmada en la información disponible.

El modelo se distribuye con acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargarlo. No se han publicado datos sobre el pipeline de inferencia, los idiomas soportados, la longitud de contexto ni resultados de benchmarks. Tampoco hay información sobre el proceso de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO.

La relevancia de este modelo radica en su vinculación con el ecosistema Bittensor (subnet 92), un entorno de incentivos descentralizados para modelos de IA, y en su base sobre un modelo de 31B de la familia Gemma. No obstante, la ausencia de documentación técnica, benchmarks y la restricción de acceso limitan seriamente su evaluación rigurosa para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (tags sugieren familia Gemma 4; sin confirmar) |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. Los tags del repositorio incluyen "gemma4", lo que apunta a una arquitectura transformer de la familia Gemma 4, pero no se confirma en la información proporcionada. El modelo es un finetune del base MachinePulseAI/karpo-decision-31B, por lo que hereda la arquitectura y el entrenamiento previo de dicho modelo base, cuyas características tampoco están documentadas en los datos disponibles.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni sobre el uso de RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido. La única información verificable es el recuento de parámetros (31.273.088.876) y el tamaño del repositorio (62,6 GB), coherente con pesos en precisión de 16 bits.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje de 31B, aunque no se documenta explícitamente en la información disponible.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas soportados no están indicados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Integración con Bittensor: los tags "bittensor" y "sn92" sugieren un uso orientado a la subnet 92, pero no se detalla el mecanismo.

## Casos de uso

- Experimentación en el ecosistema Bittensor: el modelo está etiquetado con "bittensor" y "sn92", por lo que su uso previsto parece ser la participación o evaluación en la subnet 92, donde los mineros compiten por incentivos mediante modelos de IA.
- Investigación sobre ajuste fino de modelos de 31B: sirve como caso de estudio de un finetune sobre MachinePulseAI/karpo-decision-31B, útil para analizar cómo se comporta un ajuste sobre una base de gran tamaño.
- Evaluación comparativa de modelos base Gemma: al estar etiquetado como "gemma4", puede emplearse en experimentos comparativos frente a otros modelos de la familia, siempre que se acepte la licencia y el acceso restringido.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su integración en productos propios, sujeto a las condiciones de acceso del repositorio.
- Generación de texto general: como modelo de 31B, es adecuado para tareas de generación y redacción, aunque la falta de benchmarks impide garantizar su calidad frente a alternativas.
- Fine-tuning posterior: al ser un modelo abierto en safetensors, puede servir como punto de partida para ajustes adicionales en dominios específicos, aunque el tamaño de 31B exige recursos considerables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,3 mil millones de parámetros, en FP16 se requieren aproximadamente 62,6 GB de VRAM (coincide con el tamaño del repo). En cuantización de 8 bits, unos 31-33 GB; en 4 bits, unos 16-18 GB.
- GPU recomendadas: para FP16, A100 80 GB, H100 80 GB o dos GPU de 40 GB en paralelo. Para 8 bits, una A100 40 GB o RTX A6000 48 GB. Para 4 bits, una RTX 4090 24 GB o RTX 3090 24 GB.
- ¿Cabe en GPU de consumo? Sí, en cuantización de 4 bits cabe en RTX 4090/3090 (24 GB), aunque con margen ajustado para contexto largo.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles en principio con safetensors/GGUF, aunque no se confirma en la información disponible que existan conversiones GGUF publicadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| estrema/sn92-r2-d | 31,3B | no disponible | Apache 2.0 | Gated en HF |
| MachinePulseAI/karpo-decision-31B (base) | 31B (aprox.) | no disponible | no disponible | no disponible |
| Gemma 2 27B (referencia de familia) | 27B | 8K | Gemma license | Abierto |
| Qwen2.5 32B (referencia de tamaño) | 32,5B | 128K | Apache 2.0 | Abierto |

La comparativa con Gemma 2 27B y Qwen2.5 32B se ofrece como referencia de tamaño y licencia, pero no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa. El modelo base karpo-decision-31B no tiene ficha pública con especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated, por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Ausencia de documentación: no hay información sobre contexto, idiomas, datos de entrenamiento ni benchmarks, lo que impide evaluar su calidad de forma rigurosa.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; sin datos de alineación no puede estimarse su magnitud.
- Sesgos: no documentados; al desconocerse el dataset de ajuste fino, no es posible identificar sesgos conocidos.
- Limitaciones de idioma: los idiomas soportados no están indicados, por lo que no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse que el modelo base MachinePulseAI/karpo-decision-31B no imponga restricciones adicionales que prevalezcan sobre la licencia del finetune.
- Vinculación con Bittensor: el uso en la subnet 92 puede estar sujeto a reglas específicas del ecosistema que no se detallan en la ficha del modelo.
- Sin garantías de producción: la falta de benchmarks y de información sobre el pipeline de inferencia desaconseja su uso en entornos críticos sin una evaluación previa propia.

## Enlaces

- Hugging Face: https://huggingface.co/estrema/sn92-r2-d
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
