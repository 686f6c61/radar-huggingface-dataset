# Bosalt/TranslateGemma-4-12B-Pilot-PV-MACaQ-4bit-MXFP4-MLX

## Resumen

TranslateGemma-4-12B-Pilot-PV-MACaQ-4bit-MXFP4-MLX es una cuantización de 4 bits en formato MXFP4 del checkpoint `Bosalt/TranslateGemma-4-12B-Pilot`, publicada por el usuario Bosalt para su uso con el runtime Basalt (basado en MLX, el framework de Apple para Apple Silicon). No se trata de un modelo entrenado desde cero, sino de un artefacto de compresión que preserva el backbone de lenguaje en 4 bits y mantiene la torre de visión, las normas y los routers en BF16 nativo.

El modelo base apunta a una variante "TranslateGemma-4-12B" de la familia Gemma 4, orientada a traducción, aunque la model card no documenta el pipeline, los idiomas soportados ni la licencia. El repositorio ocupa 7,0 GB y declara 2.764.757.040 parámetros en safetensors, un dato que no concuerda con la nomenclatura "12B" del nombre; conviene tratar esa cifra con cautela porque el campo de parámetros de Hugging Face puede reflejar solo un subconjunto de tensores.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización poco habitual (PV-Tuning con rotación de Hadamard y escalas E8M0 sobre códigos E2M1), y por otro, advierte de que se trata de un artefacto experimental con cero descargas, cero likes y metadatos incompletos, por lo que no debería considerarse listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y torre de visión; el checkpoint base se describe como "gemma4_unified" |
| Parametros totales | 2.764.757.040 según safetensors (el nombre del modelo indica 12B; discrepancia no aclarada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MXFP4 en capas lineales y MoE (group_size=32, hadamard_block=32, códigos E2M1, escalas E8M0); embeddings en 8 bits afín (group_size=64); visión, normas y routers en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El checkpoint base es un modelo multimodal con backbone de lenguaje que combina capas lineales densas y capas MoE (`SwitchLinear`), más una torre de visión conservada en BF16. En esta versión cuantizada no se ha aplicado compresión a los módulos MoE de 3 dimensiones: la model card indica explícitamente 0 módulos `MACaQSwitchLinear` cuantizados frente a 328 módulos `MACaQQuantizedLinear` de 2 dimensiones. Es decir, la compresión afecta principalmente a las proyecciones lineales densas.

La innovación técnica es el esquema PV-MACaQ: cuantización MXFP4 con `pre_scale` sensible a las activaciones, rotación de Hadamard por bloques de 32 y dos rondas de PV-Tuning (un paso P de mínimos cuadrados sobre el `pre_scale` y un paso V de refinamiento de coordenadas sobre escalas E8M0 y códigos). Según las métricas declaradas por el autor, esto eleva el SQNR medio de 18,64 dB (RTN MXFP4) a 19,07 dB, una mejora de 0,43 dB y una reducción del 9,2 % del error cuadrático medio respecto a la cuantización round-to-nearest. No hay información sobre datos de entrenamiento, número de tokens, composición del corpus ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y traducción: el nombre del modelo base sugiere un enfoque en traducción automática, aunque no se documentan pares de idiomas ni evaluaciones.
- Procesamiento multimodal: la torre de visión se preserva en BF16, por lo que se mantiene la capacidad de entrada de imágenes del checkpoint original.
- Razonamiento y instrucciones: heredadas del modelo base, sin detalle en la model card.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Traducción local en Apple Silicon: el formato MLX y el tamaño de 7,0 GB permiten ejecutar el modelo en un Mac con memoria unificada suficiente mediante Basalt, sin depender de servicios en la nube; adecuado para prototipos de traducción en escritorio.
- Investigación en cuantización: sirve como referencia reproducible para comparar PV-MACaQ MXFP4 frente a RTN MXFP4 en términos de SQNR y MSE, ya que el autor publica ambas métricas.
- Evaluación de pipelines multimodales comprimidos: al conservar la torre de visión en BF16 y cuantizar solo el backbone, permite estudiar el impacto de la compresión en tareas imagen-texto.
- Despliegue en entornos con memoria limitada: la reducción de 23,92 GB a 6,97 GB (factor 3,43x) facilita cargar el modelo en equipos que no admitirían el checkpoint BF16.
- Pruebas de integración con Basalt: útil para validar el comando `basalt serve` y el flujo de carga de pesos MLX en un entorno controlado.
- Docencia y experimentación: por su licencia y métricas incompletas, encaja en entornos de laboratorio más que en producción; permite ilustrar el efecto de la rotación de Hadamard y las escalas E8M0 en la calidad de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, BLEU, etc.) en la información disponible. Las únicas métricas publicadas son de cuantización:

| Metrica | Valor |
|---|---|
| Modulos lineales 2D cuantizados | 328 |
| Modulos MoE 3D cuantizados | 0 |
| Tamano de entrada (BF16) | 23,92 GB |
| Tamano de salida (PV-MACaQ MXFP4) | 6,97 GB (3,43x) |
| SQNR medio RTN MXFP4 | 18,64 dB |
| SQNR medio PV-MACaQ MXFP4 | 19,07 dB (+0,43 dB) |
| Reduccion media de MSE frente a RTN | 9,2 % |

## Requisitos de hardware

- VRAM o memoria unificada estimada: alrededor de 7 GB solo para los pesos; con overhead de runtime MLX conviene disponer de 10-12 GB libres.
- GPU recomendadas: no aplica en el sentido habitual; MLX está optimizado para Apple Silicon (series M1, M2, M3, M4 y superiores con memoria unificada).
- Compatibilidad con GPU consumer: no se documenta soporte para CUDA ni para GPUs NVIDIA (RTX 4090, A100, H100); el formato es específico de MLX.
- Opciones de despliegue: Basalt (`basalt serve --model ...`); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| TranslateGemma-4-12B-Pilot-PV-MACaQ-4bit-MXFP4-MLX (este) | 2.764.757.040 según safetensors | no disponible | 4 bits MXFP4 + embeddings 8 bits | no disponible | MLX / Basalt |
| Bosalt/TranslateGemma-4-12B-Pilot (base) | no disponible | no disponible | BF16 | no disponible | no disponible |
| Otros modelos de traducción de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto experimental: cero descargas y cero likes en el momento de la consulta; no hay evidencia de validación por terceros.
- Discrepancia de parámetros: el nombre indica 12B pero safetensors declara 2,76B; podría tratarse de un recuento parcial o de un error de metadatos. Verificar antes de cualquier uso.
- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no documentados: no hay garantía sobre qué pares de traducción cubre el modelo base.
- Sin benchmarks de tarea: las métricas publicadas miden fidelidad de cuantización, no calidad de traducción ni de razonamiento.
- Dependencia de ecosistema: requiere MLX y Basalt; no es portable a CUDA sin conversión adicional.
- Riesgo de alucinación y sesgos: inherentes al modelo base y no evaluados en esta versión.
- MoE sin cuantizar: la compresión se aplica solo a capas lineales densas, por lo que el ahorro de memoria puede ser menor de lo esperado en modelos con muchos expertos.
- Fecha de creación futura (2026-11-24): metadato anómalo que sugiere posibles inconsistencias en el registro del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bosalt/TranslateGemma-4-12B-Pilot-PV-MACaQ-4bit-MXFP4-MLX
- Modelo base: https://huggingface.co/Bosalt/TranslateGemma-4-12B-Pilot
- Runtime Basalt: https://github.com/goodmai/basalt
- Documentación de MLX: https://github.com/ml-explore/mlx
- Paper de PV-Tuning: no disponible en la información proporcionada
