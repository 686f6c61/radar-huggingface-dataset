# OP12138/qwen3-4b-ablation-no-benign

## Resumen

Qwen3-4B ablation no-benign es un modelo de investigación publicado por el usuario OP12138 en Hugging Face, consistente en un ajuste fino completo (full-parameter) del modelo base Qwen/Qwen3-4B. No es un modelo de propósito general, sino un control experimental (ablation) del método ImmuneCoT, un procedimiento de entrenamiento orientado a la seguridad y al control de rechazos (rebuttal-control) basado en fusion de expertos por product-of-experts (PoE) y razonamiento en cadena (chain-of-thought). Su interés es académico: sirve para responder a una pregunta de revisión por pares sobre qué ocurre si se elimina la mitad "benigna" del conjunto de datos de entrenamiento IASD.

El modelo se entrenó únicamente con la partición dañina (harmful-only) de `iasd_data_decontam_v1`, un subconjunto de 858 registros, durante 2 épocas y 54 pasos de optimización, partiendo de los pesos de Qwen3-4B en bf16. Con 4.022.468.096 parámetros (aproximadamente 4 mil millones) y un repositorio de 8,8 GB, la relevancia de esta ficha no reside en su rendimiento como asistente, sino en documentar un resultado científico concreto: la eliminación de los datos benignos desplaza el umbral de rechazo del modelo, aumentando la tasa de rechazo sobre indicaciones seguras y reduciendo ligeramente la tasa de éxito de ataques sobre indicaciones dañinas.

Es, por tanto, un artefacto de investigación reproducible con licencia Apache 2.0, pensado para investigadores en seguridad de modelos de lenguaje que quieran replicar o auditar el análisis de ablación del paper ImmuneCoT. No está pensado para despliegue en producción ni para uso como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); ajuste fino con fusion PoE y pérdida KL sobre rollouts |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa max_length 4608; la ventana nativa de Qwen3-4B no se especifica en la información) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint-54, save_only_model=True) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B en bf16 y aplica un ajuste fino de todos los parámetros con DeepSpeed ZeRO-2 (offload del optimizador a CPU) y AdamW fused, con learning rate 5e-6, decaimiento lineal, sin warmup y clipping de gradiente de 1.0. El batch efectivo es de 32 (4 por dispositivo × acumulación de gradiente 8 × 1 GPU) durante 2 épocas, lo que totaliza 54 pasos de optimización sobre 858 registros de la partición dañina de `iasd_data_decontam_v1`. La semilla es 42 tanto para el modelo como para los datos.

La innovación técnica del método ImmuneCoT, según la información disponible, reside en la función de pérdida y el procedimiento de generación: pérdida KL forward con beta=0, top-k 256, fusión `poe` (product-of-experts), coeficientes λ_rec=0.5, λ_detect=0.5 y λ_res=0.7, y clamp base de -20. Los rollouts se generan con vLLM en modo colocate (mem 0.15) con temperatura 0.7, top-p 0.95 y top-k 20, y una longitud máxima de 4608 tokens con 2048 de finalización. Todos los hiperparámetros coinciden con la configuración del método principal (`Easonnoway/qwen3-4b-icot`); la única diferencia es la eliminación de los datos benignos.

## Capacidades

- Generación de texto en inglés sobre la base de Qwen3-4B, con el comportamiento de rechazo modulado por el entrenamiento ImmuneCoT.
- Razonamiento en cadena (chain-of-thought) en modo thinking, que es el protocolo con el que se evaluó el modelo.
- Control de rechazo calibrado empíricamente: el modelo aprende una frontera entre responder y rechazar, y esta ablación demuestra que los datos benignos ajustan esa frontera.
- Capacidad de servir como control experimental para medir el efecto de la composición del dataset en la seguridad del modelo.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo más allá del inglés.
- No se documenta una capacidad de "thinking mode" separada más allá del protocolo de evaluación empleado.

## Casos de uso

- Investigación en seguridad de LLM: el modelo sirve como condición de control en experimentos que miden cómo la composición del dataset (dañino frente a dañino + benigno) afecta a la tasa de rechazo y a la robustez frente a ataques.
- Replicación del paper ImmuneCoT: permite reproducir la tabla de evaluación (HarmBench y XSTest) y verificar la afirmación de que la mitad benigna calibra la frontera de rechazo.
- Auditoría de ablaciones: útil para revisores y equipos de revisión que necesiten comprobar que la diferencia entre el método principal y esta variante se debe exclusivamente a los datos y no a hiperparámetros.
- Estudio del sobre-rechazo (over-refusal): con una ORR del 5,2% en XSTest safe frente al 4,0% del método principal, sirve para analizar el coste en utilidad de prescindir de datos benignos.
- Análisis de calibración de umbrales: permite estudiar empíricamente cómo se desplaza el punto de operación entre seguridad y utilidad al variar la distribución de entrenamiento.
- Docencia y formación: ejemplo práctico y reproducible de ajuste fino completo con DeepSpeed ZeRO-2, vLLM colocate y pérdida KL sobre rollouts para cursos de seguridad y alineamiento.
- Comparación de metodologías de defensa: punto de referencia para contrastar ImmuneCoT con otras técnicas de robustez frente a jailbreaks.

## Benchmarks y rendimiento

| Benchmark | Metrica | no_benign (este repo) | Metodo principal (icot) |
|---|---|---|---|
| HarmBench (320) | ASR | 5,6% (18/320) | 6,2% |
| XSTest safe (250) | ORR | 5,2% (13/250) | 4,0% (10/250) |
| XSTest unsafe (200) | ASR | 24,5% (49/200) | 27,0% |

Los datos corresponden al protocolo de evaluación en modo thinking. La conclusión del autor es que eliminar los datos benignos desplaza el umbral de rechazo hacia un mayor rechazo tanto en indicaciones seguras (ORR +30% relativo) como en dañinas (ASR unsafe -2,5 puntos porcentuales), lo que sugiere que la mitad benigna calibra la frontera entre rechazar y responder, y no solo enseña a "responder más". No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos (4,02 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB, aunque no se publican artefactos cuantizados y habría que generarlos.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluación a gran escala; para inferencia, una RTX 4090 (24 GB) es suficiente en bf16.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y, con cuantización, en tarjetas de 8-12 GB.
- Opciones de despliegue: vLLM (usado en el entrenamiento en modo colocate), transformers con safetensors; llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión no documentada por el autor.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OP12138/qwen3-4b-ablation-no-benign | 4,02 B | no disponible (entrenado con 4608) | Ablación ImmuneCoT harmful-only | Apache 2.0 | Hugging Face, 0 descargas |
| Easonnoway/qwen3-4b-icot (metodo principal) | 4 B (base Qwen3-4B) | no disponible | ImmuneCoT completo con datos benignos y dañinos | no disponible en la información | Hugging Face |
| Qwen/Qwen3-4B (modelo base) | 4 B | no disponible en la información | Asistente general | Apache 2.0 | Hugging Face |

La comparación relevante es frente al método principal y al modelo base: este repositorio se diferencia únicamente por el conjunto de entrenamiento (858 registros dañinos, sin benignos), lo que permite aislar el efecto de los datos benignos en las métricas de seguridad y sobre-rechazo.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción como asistente.
- Solo inglés: la model card declara únicamente `en`; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un ajuste fino sobre Qwen3-4B con datos de seguridad, no se documentan mitigaciones específicas.
- Sesgos: no se documenta ningún análisis de sesgos; el entrenamiento con datos dañinos puede introducir comportamientos no deseados más allá del rechazo.
- Sobre-rechazo: la ORR del 5,2% en XSTest safe es superior a la del método principal (4,0%), lo que indica un coste en utilidad al prescindir de datos benignos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo es un artefacto experimental sin garantías de idoneidad; conviene revisar también la licencia del modelo base Qwen3-4B.
- Ausencia de cuantizaciones publicadas: no hay GGUF ni variantes de 4/8 bits, lo que limita el despliegue en hardware modesto sin conversión manual.
- Contexto no documentado: la ventana nativa no se especifica; solo se conoce el max_length de entrenamiento (4608).
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni demo asociada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OP12138/qwen3-4b-ablation-no-benign
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Método principal ImmuneCoT: https://huggingface.co/Easonnoway/qwen3-4b-icot
- Paper ImmuneCoT: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
