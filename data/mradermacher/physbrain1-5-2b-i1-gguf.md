# mradermacher/PhysBrain1.5-2B-i1-GGUF

## Resumen

PhysBrain1.5-2B-i1-GGUF es una cuantización GGUF del modelo PhysBrain1.5-2B, publicada por el usuario mradermacher. El modelo original fue desarrollado por DeepCybo, aunque no se dispone de documentación adicional sobre sus características. Esta adaptación convierte los pesos al formato GGUF, optimizado para inferencia local con llama.cpp y herramientas compatibles como Ollama o LM Studio. La cuantización i1 indica el uso de importance matrix (imatrix) para preservar la calidad de los pesos durante la compresión. Al no contar con información sobre la arquitectura, los datos de entrenamiento ni el comportamiento del modelo, cualquier evaluación debe realizarse con cautela y previa validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 516.292 (según metadatos safetensors) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo original ni sobre su proceso de entrenamiento. La publicación se limita a una cuantización de pesos, por lo que no introduce cambios en la arquitectura subyacente. Dado que la denominación sugiere un modelo de aproximadamente 2 mil millones de parámetros, el dato de 516.292 parámetros reportado resulta atípico y podría corresponder a un adaptador o a un recuento parcial; se recomienda revisar los metadatos del repositorio original para aclarar esta discrepancia.

## Capacidades

No se han publicado descripciones de capacidades para este modelo en la información disponible. No es posible confirmar soporte de generación de texto, razonamiento, código, tool calling, agentes, vision u otras funcionalidades. La única indicación disponible es que se trata de una cuantización, lo que no afecta a las capacidades del modelo base, pero estas permanecen desconocidas.

## Casos de uso

Dado que no se conoce el comportamiento real del modelo, no se pueden recomendar casos de uso concretos con seguridad. No obstante, al estar disponible en formato GGUF, es adecuado para entornos locales de inferencia con recursos limitados, siempre que se valide su rendimiento previamente. Los desarrolladores deberían probar el modelo en tareas específicas antes de integrarlo en cualquier pipeline de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de mediciones oficiales de VRAM ni de latencia.
- Al ser una cuantización de un modelo pequeño, es probable que con cuantizaciones Q4 o Q5 quepa en GPUs de consumo con al menos 4 GB de VRAM.
- Para ejecución exclusiva en CPU, se recomienda un sistema con al menos 8 GB de RAM.
- El despliegue puede realizarse con llama.cpp, Ollama o LM Studio utilizando los archivos GGUF del repositorio.

## Comparativa con modelos similares

No disponible. No se ha identificado información comparable en la documentación proporcionada.

## Limitaciones y advertencias

- La información pública es extremadamente limitada: no constan arquitectura, licencia, idiomas ni datos de entrenamiento.
- El número de parámetros reportado (516.292) no coincide con la denominación 2B, lo que puede indicar un modelo muy pequeño o un recuento atípico.
- No se puede evaluar el rendimiento ni la fiabilidad del modelo sin benchmarks publicados.
- La licencia se desconoce, por lo que el uso comercial requiere verificación previa con el autor.
- Al tratarse de una cuantización de un modelo no documentado, existe un riesgo elevado de alucinaciones y sesgos no detectados.

## Enlaces

- https://huggingface.co/mradermacher/PhysBrain1.5-2B-i1-GGUF
- https://huggingface.co/DeepCybo/PhysBrain1.5-2B
