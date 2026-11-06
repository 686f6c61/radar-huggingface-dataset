# OSO-AI/Qwable-v1-mlx-4Bit-abliterated-s2

## Resumen

Qwable-v1-mlx-4Bit-abliterated-s2 es un artefacto de investigación publicado por OSO-AI sobre el modelo base `usermma/Qwable-v1-mlx-4Bit`, un modelo de lenguaje de arquitectura MoE (mixture of experts) con atención híbrida y aproximadamente 34.660 millones de parámetros totales, cuantizado en 4 bits para el framework MLX de Apple. La intervención aplicada es una "abliteración" o eliminación de la dirección de rechazo (refusal direction): se extrae una dirección latente que induce respuestas de negativa ante peticiones dañinas y se proyecta ortogonalmente fuera de todas las rutas de escritura del flujo residual, con una fuerza de ortogonalización de 2,0.

El modelo resuelve un problema concreto de investigación en interpretabilidad y seguridad: comprobar si las técnicas de abliteración basadas en direcciones de rechazo, validadas principalmente en transformers densos pequeños, transfieren a arquitecturas MoE con atención híbrida y razonamiento explícito (`<think>…</think>`) a escala de 35B. El autor lo presenta explícitamente como "research artifact, not a product", con una evaluación de solo 5 muestras (n=5) ejecutada en CPU, sin cifras de tasa de rechazo a escala.

Es relevante ahora porque documenta un resultado positivo de transferencia de la técnica a un MoE híbrido de 35B, junto con un resultado negativo previo en la variante de 2 bits (degeneración del modelo base), lo que aporta evidencia sobre los límites de la cuantización agresiva combinada con intervenciones en el espacio de activaciones. El modelo base, según fuentes de la búsqueda web, sería una destilación de trazas de codificación agéntica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención híbrida (linear attention + atención estándar), tipo `qwen3_5_moe` |
| Parametros totales | 34.660.608.768 (≈34,66B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits con cuantización por grupos (group-64), formato MLX |
| Idiomas soportados | no disponible |
| Licencia | "other", nombre "qwable", enlazada al repo base `usermma/Qwable-v1-mlx-4Bit` |
| Formato de pesos | safetensors (MLX), repositorio de 19,5 GB |
| Numero de expertos | 256 expertos enrutados (fused) más un shared expert |
| Modo de razonamiento | Sí, cadenas `<think>…</think>` |

## Arquitectura y entrenamiento

El modelo base es un MoE de tipo `qwen3_5_moe` con atención híbrida: combina capas de atención lineal (`linear_attn`) con capas de atención estándar, y contiene 256 expertos enrutados fusionados (`switch_mlp`) más un experto compartido (`shared_expert`). El checkpoint distribuido está cuantizado en 4 bits con grupos de 64 elementos para MLX. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base.

La intervención de abliteración sigue el linaje de Arditi et al. (2024): se extrae una dirección de rechazo mediante pares emparejados de 50 prompts dañinos bajo system prompts que inducen rechazo frente a system prompts que inducen cumplimiento, tomando los estados ocultos del último token por capa. A continuación se aplica una ortogonalización de fuerza 2,0 (`W ← W − 2·vvᵀW`) sobre cada ruta de escritura del flujo residual: `linear_attn.out_proj`, los `switch_mlp.down_proj` de los 256 expertos y `shared_expert.down_proj`. El procedimiento opera en dequantización, modifica la matriz y la recuantiza de nuevo en 4 bits con grupo 64. El autor advierte que, al ser un modelo de razonamiento, la clasificación de rechazo debe ejecutarse sobre la respuesta posterior a `</think>`, no sobre el razonamiento visible.

## Capacidades

- Generación de texto y razonamiento explícito mediante cadenas de pensamiento delimitadas por `<think>…</think>`.
- Codificación agéntica: el modelo base se describe en fuentes externas como destilación de trazas de codificación agéntica de Claude Fable-5, aunque esta ficha no dispone de la model card original para confirmar detalles.
- Arquitectura MoE con 256 expertos, lo que permite un cómputo por token sustancialmente menor que un modelo denso del mismo tamaño total (número de parámetros activos no disponible).
- Atención híbrida con capas lineales, orientada a eficiencia en contextos largos (longitud de contexto no disponible).
- Inferencia nativa en Apple Silicon mediante MLX, incluida ejecución en CPU cuando el modelo excede el límite de memoria wired de Metal.
- Comportamiento de rechazo reducido respecto al modelo base en las 5 muestras evaluadas, manteniendo las cadenas de razonamiento intactas y sin cambios en preguntas benignas (por ejemplo, "París").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en interpretabilidad de direcciones de rechazo: el modelo sirve como banco de pruebas para estudiar cómo se representa el rechazo en MoE con atención híbrida, comparando los estados ocultos del modelo base y del abliterado capa por capa.
- Estudio de transferencia de técnicas de abliteración a escala 35B: permite replicar el experimento `experiments/qwable_4bit_run.sh` y verificar si la ortogonalización s=2.0 preserva capacidades en un MoE grande, algo previamente validado sobre todo en transformers densos pequeños.
- Análisis del efecto de la cuantización en intervenciones de pesos: comparar la variante de 4 bits (sana) con la de 2 bits (degenerada) para documentar cuándo la cuantización agresiva invalida la evaluación de rechazo por palabras clave.
- Evaluación de robustez de clasificadores de seguridad: dado que el modelo razona antes de responder, se puede usar para probar clasificadores que operen sobre la respuesta post-`</think>` y medir falsos positivos o negativos.
- Desarrollo y depuración de pipelines MLX: el checkpoint de 19,5 GB y la librería MLX permiten probar cargas, cuantización por grupos y ejecución en CPU frente a GPU unificada en Apple Silicon.
- Auditoría de seguridad de modelos abliterados: el artefacto permite a equipos de seguridad medir empíricamente el incremento de cumplimiento ante prompts dañinos y decidir si conviene bloquear su despliegue en entornos de producción.
- Reproducibilidad de experimentos de alineación: el registro público en `RESULTS.md` y el script de reproducción permiten replicar el resultado positivo y el negativo y contrastarlos con literatura como Arditi et al. 2024.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que la evaluación es un spot-check de n=5 con clasificador estricto en CPU, sin cifra de tasa de rechazo a escala, y que no debe interpretarse como un modelo terminado. No se dispone de MMLU, HumanEval, GSM8K ni de ninguna otra métrica estándar.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 19,5 GB en 4 bits; la inferencia requiere al menos esa cantidad más overhead de activaciones y caché KV, por lo que se recomienda un mínimo de ~24 GB de memoria unificada o VRAM.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (M-series Pro/Max/Ultra) por el soporte nativo de MLX; en el caso del autor, el modelo de 18,6 GB supera el límite de memoria wired de Metal de su máquina, por lo que la evaluación se ejecutó en CPU con tiempos de minutos por generación.
- GPU NVIDIA: no se documenta soporte en la información disponible; MLX está orientado a Apple Silicon, aunque los pesos safetensors podrían convertirse a otros formatos.
- ¿Cabe en GPU de consumo? En 4 bits, sí en GPUs con 24 GB o más (RTX 3090/4090) si se convierte a un runtime compatible; en Apple Silicon, requiere configurar el límite de memoria wired por encima de los ~19 GB del checkpoint.
- Opciones de despliegue: MLX (librería declarada); llama.cpp, Ollama, vLLM o TGI no están documentados para este checkpoint en la información disponible.
- Latencia y throughput: no disponibles a escala; el autor reporta "minutos por generación" en CPU para este tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| OSO-AI/Qwable-v1-mlx-4Bit-abliterated-s2 | 34,66B totales (activos no disponibles) | no disponible | 4 bits group-64 MLX | "other" (qwable) | Abliterado s=2.0, evaluación n=5 en CPU |
| usermma/Qwable-v1-mlx-4Bit (base) | 34,66B totales | no disponible | 4 bits group-64 MLX | "other" (qwable) | Modelo base sano, rechazo mixto en prompts dañinos |
| Qwable-v1-mlx-2Bit (hermano) | no disponible | no disponible | 2 bits MLX | "other" (qwable) | Resultado negativo: el modelo base degenera y la evaluación por palabras clave deja de ser válida |

No se dispone de datos de benchmarks ni de parámetros activos para establecer una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación, no un producto: el propio autor lo etiqueta como "research artifact" y advierte que no debe usarse para causar daño.
- Evaluación insuficiente: solo 5 muestras, clasificador estricto y ejecución en CPU; no hay tasa de rechazo medida a escala ni evaluación de capacidades completa.
- Riesgo de seguridad: la abliteración reduce el rechazo ante prompts dañinos de forma deliberada; el modelo puede cumplir peticiones que el base rechazaría, lo que lo hace inadecuado para despliegues de cara al público sin salvaguardas externas.
- Riesgo de alucinación: no evaluado; el modelo base es un modelo de razonamiento y las cadenas `<think>` pueden contener afirmaciones no verificadas.
- Confusión en clasificación de rechazo: al razonar antes de responder, los clasificadores que inspeccionen el texto visible pueden clasificar erróneamente; debe evaluarse la respuesta posterior a `</think>`.
- Limitaciones de cuantización: la variante de 2 bits del mismo linaje degenera ("the user is the user…"), lo que invalida evaluaciones superficiales; la de 4 bits se describe como sana, pero no se ha medido su degradación frente a precisión completa.
- Idiomas y contexto: no disponibles; no se puede garantizar cobertura multilingüe ni longitudes de contexto concretas.
- Licencia: "other" con nombre "qwable" y enlace al repo base; no se detallan términos de uso comercial, por lo que debe consultarse el enlace de licencia antes de cualquier uso en producción.
- Sesgos: no documentados en la información disponible.
- Reproducibilidad limitada por hardware: el autor no pudo ejecutar la evaluación en GPU por el límite de memoria wired de Metal, lo que dificulta comparaciones de latencia y throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OSO-AI/Qwable-v1-mlx-4Bit-abliterated-s2
- Modelo base: https://huggingface.co/usermma/Qwable-v1-mlx-4Bit
- Registro de experimentos (RESULTS.md): https://github.com/OSOSerious/oso-obliterated-models-/RESULTS.md
- Nota de prensa sobre Qwable-v1 como destilación de Claude Fable-5: https://tools4all.ai/trends/qwable-v1-released-as-claude-fable-5-distillation
- Referencia técnica: Arditi et al. 2024 (refusal direction), citada en la model card; enlace directo no disponible en la información proporcionada.
