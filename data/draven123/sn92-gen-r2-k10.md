# draven123/sn92-gen-r2-k10

## Resumen

`draven123/sn92-gen-r2-k10` es un modelo multimodal de tipo imagen-texto-a-texto publicado en Hugging Face por el usuario `draven123`. Por sus etiquetas (`gemma4`, `reax`, `bittensor-sn92`) se trata de un derivado o ajuste fino de la familia Gemma 4, orientado a la competición de minería de la subred 92 de Bittensor (SN92), conocida como Reax. El modelo resuelve la tarea de generar respuestas conversacionales a partir de entradas que combinan imagen y texto, presumiblemente dentro del flujo de evaluación de dicha subred.

El checkpoint cuenta con 31.273.088.876 parámetros según los pesos en safetensors, lo que lo sitúa en la franja de los 31.000 millones de parámetros, coherente con una variante grande de la familia Gemma. El repositorio ocupa 62,6 GB y se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido y requiere aceptar condiciones en Hugging Face. La información pública disponible es muy limitada: no se detallan idiomas soportados, longitud de contexto ni datos de entrenamiento.

Su relevancia es acotada y de nicho: se trata de un artefacto de competición (ronda 2, checkpoint k10) más que de un modelo de propósito general documentado. Resulta útil para quienes participan o analizan el ecosistema Bittensor/SN92 y quieran inspeccionar o reproducir el comportamiento de un minero concreto, pero no hay evidencia publicada de benchmarks ni de un proceso de entrenamiento reproducible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Gemma 4 (según tags) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 62,6 GB |
| Acceso | Restringido (gated) |
| Libreria | transformers |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

No se dispone de documentación oficial sobre la arquitectura interna más allá de las etiquetas del repositorio. La etiqueta `gemma4` sugiere que el modelo parte de un checkpoint de la familia Gemma 4 de Google y que se ha adaptado para la tarea image-text-to-text. La etiqueta `reax` y `bittensor-sn92` apuntan a un ajuste orientado a la subred 92 de Bittensor, un entorno de competición donde los mineros entrenan modelos para maximizar una recompensa evaluada por validadores.

No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). Tampoco se documenta el proceso de fusión o fine-tuning que produce este checkpoint `r2-k10` (posiblemente ronda 2, checkpoint 10). Cualquier afirmación sobre el entrenamiento sería especulativa y, por tanto, se omite.

## Capacidades

- Generación de texto conversacional condicionada por imagen y texto (pipeline `image-text-to-text`).
- Comprensión de imágenes y respuesta en lenguaje natural, según el pipeline declarado.
- Integración con `transformers` y compatibilidad con endpoints (tag `endpoints_compatible`).
- Orientado a entornos de competición Bittensor (SN92/Reax), presumiblemente para tareas de respuesta evaluadas por validadores.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Evaluación de mineros en Bittensor SN92: el modelo puede desplegarse como candidato de minero para generar respuestas a partir de entradas imagen-texto y medir su recompensa frente a los validadores de la subred.
- Investigación sobre competiciones descentralizadas: sirve para estudiar cómo se comporta un checkpoint de ronda 2 (k10) y comparar su salida con otros checkpoints de la misma subred.
- Reproducibilidad de experimentos: al publicarse en safetensors y con `transformers`, permite cargar los pesos y analizar la distribución de respuestas en un entorno controlado.
- Análisis de calidad multimodal: útil para inspeccionar cómo un derivado de Gemma 4 adaptado a Reax describe o interpreta imágenes en tareas conversacionales.
- Baseline para fine-tuning posterior: al estar bajo Apache 2.0, puede servir como punto de partida para ajustes propios en tareas imagen-texto, siempre que se acepte la condición de acceso.
- Auditoría de sesgos y alucinaciones: permite ejecutar pruebas de estrés sobre un modelo de competición para documentar fallos antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62-63 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 80 GB para comodidad.
- Cuantización a 8 bits: en torno a 31-32 GB de pesos, viable en GPUs de 40-48 GB (A100 40 GB con margen ajustado, A6000 48 GB, L40S 48 GB).
- Cuantización a 4 bits: en torno a 16-18 GB de pesos, potencialmente viable en RTX 4090 (24 GB) o RTX 3090 (24 GB), con margen limitado para contexto largo.
- GPUs recomendadas: H100 80 GB, A100 80 GB para precisión completa; A100 40 GB, L40S o A6000 para 8 bits; RTX 4090/3090 para 4 bits.
- Despliegue: `transformers` es la librería declarada; no se confirma soporte oficial de vLLM, TGI, llama.cpp u Ollama. Dado el pipeline multimodal, conviene verificar compatibilidad antes de asumirla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| draven123/sn92-gen-r2-k10 | 31,27 B | no disponible | imagen-texto | Apache 2.0 | Gated en HF |
| Gemma 4 (variante base de referencia) | no disponible en esta ficha | no disponible | texto/multimodal según variante | términos de Gemma | Público en HF |
| Alternativas de ~30 B multimodales | no disponible | no disponible | imagen-texto | variable | variable |

No se dispone de datos suficientes para establecer una comparativa cuantitativa fiable con alternativas concretas; la información pública de este checkpoint no incluye benchmarks ni especificaciones de contexto.

## Limitaciones y advertencias

- Ausencia total de documentación sobre datos de entrenamiento, lo que impide evaluar sesgos y calidad de forma rigurosa.
- Riesgo elevado de alucinación no cuantificado: no hay evaluaciones publicadas.
- Idiomas soportados no declarados; no se puede garantizar un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto desconocida; planificar despliegues con contexto corto por precaución.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia Apache 2.0 declarada, pero al ser un derivado de Gemma conviene revisar los términos de la familia base antes de uso comercial.
- Modelo de competición (SN92/Reax): su comportamiento puede estar sobreajustado a las métricas de la subred y no generalizar a tareas reales.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Creado y actualizado el 2026-11-28: verificar que el checkpoint no se haya sustituido o retirado.

## Enlaces

- Hugging Face: https://huggingface.co/draven123/sn92-gen-r2-k10
- Bittensor (red): https://bittensor.com
- Subred 92 (Reax): no disponible enlace oficial verificado en la información proporcionada
- Familia Gemma (Google): https://huggingface.co/google
- Documentación de `transformers`: https://huggingface.co/docs/transformers
