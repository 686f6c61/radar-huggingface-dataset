# SaifPunjwani/qwen3-1.7b-mrme-natural-replica

## Resumen

Este modelo es un fine-tuning del checkpoint Qwen3-1.7B de Alibaba Cloud, publicado por SaifPunjwani bajo el nombre `qwen3-1.7b-mrme-natural-replica`. Se presenta como un checkpoint "independiente" (standalone) byte-idéntico a un árbol fuente concreto identificado en `model_provenance.json`, y está orientado a tareas de razonamiento matemático y conversación. El autor declara explícitamente que el entrenamiento utilizó trayectorias sintéticas etiquetadas con respuestas correctas de benchmarks, por lo que el modelo está contaminado para evaluación en AIME24, AIME25, MATH-500 y Minerva Math. Esta advertencia es crítica: el modelo no debe considerarse evidencia válida de generalización imparcial en dichos benchmarks.

La relevancia de este lanzamiento radica en su propósito de reproducibilidad y transparencia: incluye el conjunto de entrenamiento completo (4.864 filas), la política de selección y manifiestos de procedencia. El autor también documenta un run de confirmación "P1" con 37.248 trayectorias crudas, que es la única autoridad numérica de la liberación. Aunque el modelo hereda la licencia Apache-2.0 de Qwen, el autor advierte que la cadena de licencias de los datos de entrenamiento no está completamente establecida. Con 2.031.739.904 parámetros (2B), es un modelo relativamente pequeño, adecuado para despliegue en hardware moderado, pero su uso en producción debe considerar las limitaciones de contaminación y la falta de validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredado de Qwen3-1.7B, no especificado en la ficha) |
| Tipos de cuantizacion | no disponible (solo se mencionan pesos safetensors originales) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (declarada, con advertencia sobre datos de entrenamiento) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1.7 mil millones de parámetros de la familia Qwen3. No se especifican detalles arquitectónicos adicionales en la información disponible, pero se asume que conserva la estructura original del modelo base (capas de atención, MLP, etc.). El entrenamiento consistió en un fine-tuning con datos sintéticos: trayectorias de respuestas etiquetadas con la corrección de cada paso, seleccionadas mediante políticas por benchmark y por problema. El autor declara que el conjunto final de entrenamiento tiene 4.864 filas y que se aplicaron políticas de selección para maximizar la corrección en los objetivos. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el proceso parece ser un fine-tuning supervisado sobre trayectorias generadas sintéticamente. La principal innovación técnica del lanzamiento es la transparencia en la procedencia de los datos y la inclusión de artefactos de verificación (manifiestos, hashes SHA-256, pools de generación comprimidos) para permitir la reproducción exacta del checkpoint.

## Capacidades

- Generación de texto con razonamiento matemático: el modelo está entrenado para resolver problemas de matemáticas de nivel competitivo (AIME, MATH, Minerva), generando cadenas de razonamiento.
- Modo "thinking" habilitado: el muestreo recomendado incluye pensamiento activado, temperatura 0.6, top-p 0.95, top-k 20 y hasta 32.768 tokens de salida, lo que sugiere que puede producir razonamientos extensos y detallados.
- Conversación: al estar basado en Qwen3, conserva capacidades conversacionales generales, aunque el fine-tuning está orientado a matemáticas.
- Reproducibilidad: el modelo incluye artefactos de entrenamiento y evaluación que permiten verificar la integridad del checkpoint y los resultados reportados.
- No se documentan capacidades de tool calling, visión, audio ni otras modalidades. El pipeline declarado es text-generation.

## Casos de uso

- Investigación en metodologías de evaluación: el modelo es útil para estudiar el impacto de la contaminación de datos en benchmarks. Los investigadores pueden analizar cómo las políticas de selección de trayectorias afectan los resultados y comparar con modelos no contaminados.
- Reproducción de experimentos de fine-tuning: dado que se publican los manifiestos, hashes y pools de datos, un equipo puede replicar el entrenamiento exacto y verificar la consistencia de los resultados, lo que es valioso para auditorías de IA.
- Análisis de robustez ante datos sintéticos: el modelo permite explorar cómo un modelo pequeño (2B) se comporta cuando se entrena con datos generados sintéticamente etiquetados, y qué sesgos introduce esa metodología.
- Desarrollo de técnicas de descontaminación: al tener un modelo declaradamente contaminado, se puede usar como caso de prueba para algoritmos que intentan detectar o mitigar la contaminación en evaluaciones.
- Benchmarking de infraestructura de inferencia: al ser un modelo de 2B, sirve para medir latencia y throughput en diferentes stacks (vLLM, llama.cpp, etc.) con cargas de trabajo de razonamiento largo.
- Educación y divulgación: el modelo y su documentación pueden usarse en cursos sobre ética de evaluación de LLMs, mostrando un ejemplo real de cómo se contamina un modelo y cómo se documenta esa contaminación.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados, pero con una advertencia explícita de contaminación. Se incluyen aquí solo como referencia, no como indicador de capacidad real de generalización.

| Benchmark | avg@n | n | problems | minimum gate |
|---|---:|---:|---:|---:|
| AIME 2024 | 64.48 | 64 | 30 | 56.25 |
| AIME 2025 | 62.19 | 64 | 30 | 41.82 |
| MATH-500 | 79.94 | 32 | 500 | 78.22 |
| Minerva Math | 56.45 | 64 | 272 | 33.78 |
| Hard mean | 65.7624 | — | — | 52.515 |

Además, se reporta AIME24 pass@k: k=1: 64.48, k=2: 81.08, k=4: 90.03, k=8: 92.88, k=16: 93.32, k=32: 93.33, k=64: 93.33. Todos los "frozen release gates" se declaran superados (true). No se proporcionan comparaciones con otros modelos en la información disponible. Dada la contaminación declarada, estos números no deben interpretarse como rendimiento genuino del modelo en problemas no vistos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.031 millones de parámetros, en FP16 se necesitan aproximadamente 4,1 GB solo para los pesos (2B × 2 bytes). Con overhead de activaciones y KV cache, se recomienda al menos 6-8 GB de VRAM para inferencia con contexto moderado. Con cuantización INT8, la VRAM se reduce a unos 2-3 GB, y con INT4 a ~1,5-2 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con 8 GB o más puede ejecutar el modelo en FP16 (por ejemplo, RTX 3060, RTX 4060, RTX 4070). Para mayor velocidad, una RTX 4090 o A100 ofrecen mejor throughput, pero no son imprescindibles.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo modernas, incluso en versiones cuantizadas para GPUs con 4-6 GB.
- Opciones de despliegue: al ser un modelo transformers estándar, se puede servir con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta) o directamente con la librería transformers de HuggingFace. El repositorio indica compatibilidad con text-generation-inference y endpoints.
- Latencia y throughput estimados: no hay datos publicados. En una RTX 4090, un modelo de 2B en FP16 suele generar entre 50 y 150 tokens por segundo dependiendo de la longitud de la secuencia y el batch. Para cargas de razonamiento largo (hasta 32K tokens de salida), la latencia será proporcional al número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1,7B | 256K (según documentación oficial de Qwen3) | Apache-2.0 | Modelo original, sin fine-tuning específico para matemáticas, sin contaminación declarada. |
| qwen3-1.7b-mrme-natural-replica (este) | 2,03B (incluye embeddings y cabezal) | no disponible | Apache-2.0 | Fine-tuning contaminado para matemáticas, con documentación de procedencia. |
| qwen3-1.7b-mrme-result-replica (modelo hermano) | no disponible | no disponible | Apache-2.0 | Existe en HuggingFace con la misma autoría y propósito, pero no se dispone de detalles. |

La comparación con el modelo base es la más relevante: el fine-tuning modifica los pesos para optimizar rendimiento en benchmarks matemáticos, pero a costa de la validez de la evaluación. No hay datos públicos de otros modelos comparables en la misma categoría (2B especializado en matemáticas) en la información proporcionada.

## Limitaciones y advertencias

- Contaminación de evaluación: el modelo fue entrenado con trayectorias etiquetadas de los propios benchmarks (AIME24, AIME25, MATH-500, Minerva Math). Los resultados reportados no son evidencia de generalización imparcial. Cualquier uso que pretenda medir capacidad real de razonamiento matemático debe evitar estos benchmarks o interpretarlos con extrema cautela.
- Sesgos inducidos por datos sintéticos: el entrenamiento con datos generados sintéticamente puede introducir patrones artificiales y una distribución de respuestas que no refleja el mundo real. El modelo puede sobreajustarse a estilos de razonamiento específicos de las trayectorias sintéticas.
- Riesgo de alucinación: como cualquier LLM, puede generar razonamientos plausibles pero incorrectos, especialmente en problemas fuera de su dominio de entrenamiento.
- Licencia de datos no verificada: aunque el modelo se declara Apache-2.0, el autor advierte que la cadena de licencias de los datos de entrenamiento no está establecida como completa. Esto puede tener implicaciones legales para uso comercial.
- Sin validación independiente: los benchmarks y gates son auto-reportados por el autor. No hay evidencia de revisión externa ni de reproducción por terceros.
- Contexto limitado: no se especifica la longitud de contexto del fine-tuning; si se hereda de Qwen3-1.7B, podría ser de 256K, pero no está confirmado. En cualquier caso, el entrenamiento con trayectorias largas puede haber reducido la capacidad de manejar contextos muy extensos.
- No apto para producción sin auditoría: debido a la contaminación y la falta de validación, no se recomienda su uso en sistemas donde la precisión matemática sea crítica sin una evaluación adicional con datos no contaminados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SaifPunjwani/qwen3-1.7b-mrme-natural-replica
- Modelo hermano (result-replica): https://huggingface.co/SaifPunjwani/qwen3-1.7b-mrme-result-replica
- Repositorio oficial de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Documentación de Qwen3-1.7B en CNB (mirror): https://cnb.cool/ai-models/Qwen/Qwen3-1.7B/-/blob/master/README.md
- Página de Qwen3 en Ollama: https://ollama.com/library/qwen3:1.7b
