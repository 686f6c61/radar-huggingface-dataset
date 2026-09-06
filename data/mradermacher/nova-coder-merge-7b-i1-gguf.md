# mradermacher/nova-coder-merge-7b-i1-GGUF

## Resumen

El modelo `mradermacher/nova-coder-merge-7b-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) creada por el usuario `mradermacher` a partir de un modelo llamado `Novasy/nova-coder-merge-7b`. Se trata de un modelo de 7.615.616.512 parámetros (7.6B), cuyo nombre sugiere una orientación a generación de código, aunque no se dispone de información sobre la arquitectura exacta, el contexto o el proceso de entrenamiento. El repositorio contiene únicamente pesos en formato GGUF, con una amplia variedad de cuantizaciones que van desde Q2_K hasta Q6_K, además de versiones IQ (cuantización inteligente). No se han publicado datos sobre licencia, idiomas o benchmarks, por lo que la ficha se limita a los datos disponibles y a inferencias razonables basadas en el nombre y el formato.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo original. El nombre `nova-coder-merge-7b` indica que es un modelo de 7.6B parámetros resultante de una fusión (merge) de varios modelos, pero no se especifican los componentes ni los pesos de la fusión. Tampoco hay datos sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La única información técnica disponible es que el repositorio contiene cuantizaciones GGUF generadas con `imatrix` (matriz de importancia) y `quantize_version: 2`, lo que indica que las cuantizaciones están optimizadas para minimizar la pérdida de calidad en tareas específicas.

## Capacidades

- Generación de texto: no disponible. El nombre sugiere una orientación a código, pero no se ha verificado.
- Generación de código: no disponible. No hay benchmarks ni pruebas publicadas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento, visión o audio: no disponible.
- El repositorio tiene la etiqueta `conversational`, lo que sugiere que el modelo original fue diseñado para diálogo, pero no hay confirmación de su comportamiento real.

## Casos de uso

- Asistente de código en local: el formato GGUF y el tamaño de 7.6B permiten ejecutar el modelo en hardware de consumo, por ejemplo con `llama.cpp` o `Ollama`. Sin embargo, al no existir benchmarks, el rendimiento real en generación de código es desconocido.
- Chat conversacional sin conexión: la etiqueta `conversational` indica que el modelo podría usarse para mantener diálogos, pero se requiere validación previa para asegurar la calidad de las respuestas.
- Prototipado rápido de aplicaciones LLM: la variedad de cuantizaciones permite probar distintos equilibrios entre tamaño y calidad en entornos de desarrollo, aunque no hay datos que respalden su calidad.
- Experimentación con cuantización imatrix: el repositorio puede servir como ejemplo de cuantizaciones con matriz de importancia para modelos de 7B, útil para investigar técnicas de compresión.
- Inferencia en CPU: las cuantizaciones más pequeñas (Q2_K, IQ1_M) podrían ejecutarse en CPU con memoria limitada, pero la velocidad y la calidad son desconocidas.
- Integración en pipelines de CI/CD: si se confirma la calidad del modelo, podría utilizarse para análisis estático o sugerencias de código, pero no hay evidencia de que sea adecuado para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida, un modelo de 7.6B suele requerir aproximadamente:
  - Q2_K: ~2.5 GB
  - Q3_K_M: ~3.5 GB
  - Q4_K_M: ~4.5 GB
  - Q5_K_M: ~5.5 GB
  - Q6_K: ~6.5 GB
  (estas cifras son orientativas y no incluyen el contexto ni overhead de inferencia)
- GPU recomendadas: RTX 3060 de 12 GB o superior para cuantizaciones Q4/Q5. Una RTX 4090 sería más que suficiente. No se requieren A100 o H100 para uso local.
- Posibilidad de ejecución en GPU de consumo: sí, para cuantizaciones Q4_K_M o inferiores, una GPU con 8-12 GB de VRAM es suficiente.
- Opciones de despliegue: `llama.cpp`, `Ollama`, `LM Studio`, `KoboldCpp`. No se recomienda `vLLM` ni `TGI` para este formato de pesos, ya que están orientados a safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| mradermacher/nova-coder-merge-7b-i1-GGUF | 7.6B | no disponible | no disponible | GGUF |
| mradermacher/reasoner-coder-7b-merge-i1-GGUF | no disponible | no disponible | no disponible | GGUF |
| mradermacher/R1-Coder-Merge-7B-GGUF | no disponible | no disponible | no disponible | GGUF |

Los tres modelos pertenecen a la misma categoría (merges de 7B cuantizados en GGUF por el mismo autor), pero no se dispone de datos comparativos de rendimiento, contexto ni licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se ha realizado ninguna evaluación de sesgos.
- Riesgo de alucinación: no evaluado. No hay benchmarks que permitan estimar la fiabilidad de las respuestas.
- Limitaciones de contexto o idioma: no disponibles. Se desconoce la longitud de ventana y los idiomas soportados.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede confirmar si el uso comercial está permitido.
- Modelo merge sin documentación: no se conocen los modelos base ni el proceso de fusión, lo que dificulta la trazabilidad y el diagnóstico de errores.
- No apto para producción sin validación: la ausencia de benchmarks y de información técnica hace que el modelo deba considerarse experimental.

## Enlaces

- HuggingFace: https://huggingface.co/mradermacher/nova-coder-merge-7b-i1-GGUF
- Modelo original (según la model card): https://huggingface.co/Novasy/nova-coder-merge-7b
- Modelo similar encontrado en la búsqueda: https://huggingface.co/mradermacher/reasoner-coder-7b-merge-i1-GGUF
- Modelo similar encontrado en la búsqueda: https://huggingface.co/mradermacher/R1-Coder-Merge-7B-GGUF
