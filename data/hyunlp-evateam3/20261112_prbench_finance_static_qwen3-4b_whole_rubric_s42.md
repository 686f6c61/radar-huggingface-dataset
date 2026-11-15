# hyunlp-evateam3/20261112_prbench_finance_static_qwen3-4b_whole_rubric_s42

## Resumen

Este repositorio no contiene un modelo fundacional nuevo, sino una serie de exportaciones de solo pesos (*model-only exports*) generadas a partir de una ejecución de entrenamiento local identificada como `20261112_prbench_finance_static_qwen3-4b_whole_rubric_s42`. El autor es la cuenta `hyunlp-evateam3` y el nombre indica que se parte de una base Qwen3 de 4.000 millones de parámetros afinada sobre un conjunto de datos de evaluación de finanzas en formato estático con rúbricas completas (*whole rubric*). El sufijo `s42` corresponde a la semilla de la ejecución.

El repositorio incluye 64 checkpoints intermedios almacenados en `checkpoints/global_step_XXXXXX`, y cada uno contiene únicamente los pesos del modelo junto con la configuración de Hugging Face del modelo y del tokenizador. No se incluyen el estado del optimizador, el planificador ni el dataloader, por lo que no son checkpoints reanudables para continuar el entrenamiento.

Su relevancia es acotada: se trata de material de investigación intermedio, no de un modelo publicado con garantías de calidad, licencia clara ni evaluación pública. La información disponible sobre arquitectura interna, datos de entrenamiento y rendimiento es mínima, y la model card no aporta detalles técnicos más allá del inventario de checkpoints.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere base Qwen3 de 4B, sin confirmación en la model card) |
| Parametros totales | no disponible (el nombre indica 4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar, presumiblemente) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura. Por el identificador del repositorio se infiere que el modelo parte de una base Qwen3 de 4.000 millones de parámetros, pero no se confirma en la documentación disponible ni se detalla si se trata de un transformer denso, híbrido o con atención lineal. Tampoco se especifican la longitud de contexto nativa ni la configuración de capas.

Respecto al entrenamiento, solo se sabe que se realizó una ejecución local con 64 pasos globales registrados y que el conjunto de datos se denomina `prbench_finance_static` con evaluación por rúbrica completa. No se indica el número de tokens, la composición del dataset, si hubo RLHF, DPO o cualquier otra fase de alineamiento, ni qué hiperparámetros se emplearon. El repositorio contiene exclusivamente pesos y configuración, sin estado del entrenador.

## Capacidades

- Generación de texto y razonamiento: presumiblemente heredadas de la base Qwen3-4B, aunque no se documentan en la model card.
- Dominio financiero: el nombre del dataset sugiere un ajuste orientado a tareas de finanzas con evaluación por rúbricas, sin detalle de qué tareas concretas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre ajuste fino con rúbricas: el repositorio permite inspeccionar la evolución de los pesos a lo largo de 64 pasos globales, útil para estudiar dinámicas de entrenamiento en tareas de evaluación financiera.
- Reproducción de experimentos académicos: al conservar checkpoints intermedios, se puede analizar cómo cambia el comportamiento del modelo entre pasos y comparar con la métrica de rúbrica del benchmark `prbench_finance_static`.
- Evaluación comparativa de checkpoints: los 64 puntos de control permiten trazar curvas de aprendizaje y detectar sobreajuste o degradación en tareas financieras.
- Análisis de estabilidad del entrenamiento: la disponibilidad de pesos en cada paso facilita estudiar la varianza entre semillas y pasos, aunque solo se publica la semilla 42.
- Docencia y formación: sirve como ejemplo práctico de exportación de solo pesos desde un pipeline de entrenamiento con `transformers`.
- Base para experimentos de destilación o merging: los pesos intermedios pueden emplearse como punto de partida en estudios de combinación de modelos, siempre que la licencia lo permita (no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8 GB solo para pesos de un modelo de 4B, más overhead de activaciones y KV cache; en la práctica, entre 10 y 12 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB; en 4 bits: alrededor de 2,5-3,5 GB, aunque no se publican versiones GGUF ni cuantizadas en el repositorio.
- GPU recomendadas: A100, H100 o L40S para FP16 con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para FP16 en contextos moderados.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en FP16 y en tarjetas de 8 GB con cuantización, si se generan los pesos cuantizados a partir de los safetensors.
- Opciones de despliegue: `transformers` de forma nativa; vLLM, TGI o llama.cpp requerirían conversión o soporte adicional no documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (Qwen3-4B afinado, export de solo pesos) | 4B (según nombre) | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen3-4B base | 4B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Alternativas de 4B afinadas para finanzas | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un ajuste sobre datos financieros, es probable que herede sesgos de la base y del dataset, sin que se hayan evaluado.
- Riesgo de alucinación no cuantificado: no hay evaluaciones publicadas ni métricas de fidelidad.
- Limitaciones de contexto e idioma desconocidas: no se especifican la ventana máxima ni los idiomas cubiertos.
- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribución; es un riesgo legal relevante para producción.
- Los checkpoints son exportaciones de solo pesos, no reanudables: no incluyen optimizador, planificador ni dataloader.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- El tamaño del repo (24,1 GB) sugiere que contiene los 64 checkpoints completos, lo que implica un consumo de almacenamiento considerable para un modelo de 4B.
- No hay pipeline declarado ni demo, y la ausencia de metadatos de idioma impide verificar el soporte multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/hyunlp-evateam3/20261112_prbench_finance_static_qwen3-4b_whole_rubric_s42
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
