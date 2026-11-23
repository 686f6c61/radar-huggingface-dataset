# nace-ai/Hy4-MLX-4.65bit

## Resumen

Hy4-MLX-4.65bit es una cuantización del modelo Hy4 de Tencent, publicada por Nace.AI en formato MLX (Apple Silicon) con un peso medio de 4,647657 bits por parámetro. El paquete ocupa 447,3 GB, lo que da una idea de la escala del modelo base: se trata de un modelo de gran tamaño (la model card lo etiqueta internamente como `hy_v4_vl`, lo que sugiere capacidades de visión y lenguaje), orientado a generación de texto y distribuido bajo la licencia propietaria Tencent Hy License 1.0.

El interés de esta publicación no reside en el modelo base sino en la técnica de cuantización aplicada: pesos afines de 4 bits con grupos de 64 para los expertos enrutados de una arquitectura MoE, 5 bits para la proyección descendente de expertos de la capa final y 8 bits para el resto de clases de pesos cuantizados. Nace.AI reporta una KL media de 0,085735 frente a la referencia original, ligeramente mejor que el control de Xylolabs (0,088218) sobre los mismos tokens y backend CUDA, aunque el intervalo de confianza del 95 % de la diferencia cruza cero, por lo que la ventaja no es estadísticamente concluyente.

Es relevante ahora porque demuestra la viabilidad de cuantizar modelos MoE de escala muy grande preservando la distribución de salida, y porque incluye un port propio de MLX-CUDA y un adaptador de almacenamiento que sustituyen al comando estándar `mlx_lm.generate`. La contrapartida es que el paquete no fue validado con generación de modelo completo en esta release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con capas de expertos enrutados; el autor etiqueta el modelo como `hy_v4_vl` (probable soporte visión-lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín 4 bits (grupos de 64) en expertos enrutados; 5 bits en la proyección descendente de expertos de la capa final; afín 8 bits (grupos de 64) en el resto de clases de pesos; media de 4,647657 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License, Version 1.0 (incluye términos comerciales en la Sección 10) |
| Formato de pesos | safetensors (librería MLX), con adaptador de almacenamiento propio y port MLX-CUDA incluido |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE), tal como se deduce del esquema de cuantización descrito: los "expertos enrutados" reciben pesos afines de 4 bits con grupos de 64, mientras que la proyección descendente de los expertos de la capa final se mantiene en 5 bits y el resto de clases de pesos en 8 bits. La etiqueta `hy_v4_vl` en los tags sugiere que el modelo base incorpora un componente de visión, aunque la model card no detalla la arquitectura del encoder visual ni la estrategia de fusión multimodal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o similares; la model card se limita a describir el proceso de cuantización. La innovación técnica destacable es el denominado "Nace Weight Space Quantization", que combina precisión diferenciada por clase de peso (4/5/8 bits) con un suplemento de normalización que preserva los bytes de la norma final evaluada. El paquete incluye además un port propio de MLX-CUDA y un adaptador de almacenamiento, lo que implica que la inferencia no puede ejecutarse con el comando estándar de `mlx_lm`.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation` y el launcher de ejemplo usa decodificación greedy con `reasoning_effort="no_think"`.
- Razonamiento con modo de control: el parámetro `reasoning_effort` sugiere un modo de razonamiento configurable (tipo thinking/no-think), aunque no se detalla su funcionamiento.
- Posible capacidad de visión: la etiqueta `hy_v4_vl` apunta a un modelo visión-lenguaje, pero la model card no documenta tareas de imagen.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Ejecución en Apple Silicon vía MLX: el paquete está empaquetado para MLX, con port MLX-CUDA incluido para backend CUDA.

## Casos de uso

- Evaluación de técnicas de cuantización: el paquete permite reproducir la comparación de KL frente al modelo original y frente al control de Xylolabs sobre los mismos tokens, útil para investigadores que estudian el impacto de la cuantización en modelos MoE de gran escala.
- Investigación en modelos MoE de gran tamaño en hardware Apple: el formato MLX permite cargar el modelo en equipos con memoria unificada, algo inviable con el modelo original en FP16 dado el volumen del repositorio (447,3 GB).
- Experimentos de destilación y análisis de distribuciones: la métrica de KL reportada facilita estudiar cuánto se desvía la distribución de salida del cuantizado respecto al original en tareas de generación corta.
- Reproducción de benchmarks de fidelidad: con el adaptador y el runtime incluidos se puede medir la fidelidad de la cuantización sobre conjuntos de prompts controlados, usando el launcher con `--max-tokens` y decodificación greedy.
- Desarrollo de pipelines de cuantización propios: el esquema de precisión diferenciada por clase de peso (4/5/8 bits) sirve como referencia para diseñar estrategias de cuantización en otros MoE.
- Pruebas de integración de runtimes alternativos: el port MLX-CUDA y el adaptador de almacenamiento permiten validar flujos de inferencia que no dependen de `mlx_lm.generate`.

## Benchmarks y rendimiento

La model card solo reporta la divergencia KL respecto al modelo de referencia, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Hy4-MLX-4.65bit | Control Xylolabs | Diferencia (IC 95 %) |
|---|---|---|---|
| KL media vs. referencia original | 0,085735 | 0,088218 | [-0,006233, 0,000647] |
| Bits por peso | 4,647657 | no disponible | no disponible |
| Tamano del paquete | 447,3 GB | no disponible | no disponible |

El intervalo de confianza de la diferencia de KL cruza cero, por lo que la mejora frente al control es una estimación puntual y no un resultado estadísticamente significativo. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 447,3 GB, por lo que se requiere un sistema con al menos esa capacidad de almacenamiento y memoria unificada o VRAM suficiente para cargar los pesos cuantizados; el requisito exacto de memoria en inferencia no está documentado.
- GPU recomendadas: no disponible. El launcher de ejemplo usa `--device gpu` con backend CUDA, y el paquete incluye un port MLX-CUDA, lo que sugiere ejecución sobre GPU NVIDIA además de Apple Silicon.
- Viabilidad en GPU de consumo: no disponible; el tamaño del paquete (447,3 GB) hace inviable su carga en GPUs consumer convencionales (RTX 4090 con 24 GB, por ejemplo).
- Opciones de despliegue: MLX con el runtime y adaptador incluidos (`generate_c2.py`, `scoring/runtime/run.py`, `scoring/mlx_storage_adapter.py`); no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-MLX-4.65bit (nace-ai) | no disponible (MoE) | no disponible | 4,65 bits medios (MLX) | Tencent Hy License 1.0 | Hugging Face, 0 descargas |
| Hy4 (tencent, base) | no disponible (MoE) | no disponible | pesos originales | Tencent Hy License 1.0 | Hugging Face |
| Control Xylolabs | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La ventaja de KL frente al control de Xylolabs no es estadísticamente significativa: el intervalo de confianza del 95 % de la diferencia incluye el cero.
- La generación de modelo completo no fue probada en esta release; solo se validó que el shard restaurado coincide con el SHA256 evaluado.
- El paquete no funciona con `mlx_lm.generate` estándar: requiere el port MLX-CUDA y el adaptador de almacenamiento incluidos, lo que añade complejidad operativa y dependencia de código propio del autor.
- Licencia Tencent Hy License 1.0 con términos comerciales específicos en la Sección 10; es imprescindible revisar el texto completo antes de cualquier uso comercial.
- El repositorio no declara idiomas soportados, por lo que se desconoce el comportamiento multilingüe.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de seguridad del modelo cuantizado.
- El tamaño del paquete (447,3 GB) y el número de descargas (0) indican que se trata de una publicación muy reciente y sin validación comunitaria.
- El proceso de preparación crea un directorio de modelo separado en el mismo sistema de ficheros, lo que duplica los requisitos de almacenamiento durante la restauración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/Hy4-MLX-4.65bit
- Modelo base: https://huggingface.co/tencent/Hy4
- Sitio del autor: https://www.nace.ai/
- Licencia: https://huggingface.co/nace-ai/Hy4-MLX-4.65bit/blob/main/model/LICENSE
- Notas de instalación y restauración: PACKAGE-NOTES.md (incluido en el repositorio)
