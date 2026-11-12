# Easonnoway/qwen3-4b-ablation-no-benign-extended

## Resumen

`Easonnoway/qwen3-4b-ablation-no-benign-extended` es un checkpoint de investigación derivado de Qwen3-4B, publicado por el usuario Easonnoway como parte del material de ablación del paper ImmuneCoT. No es un modelo de propósito general, sino un control experimental: reproduce el efecto de entrenar únicamente con datos dañinos (858 registros *harmful-only*) y continuar 10 pasos de optimizador más allá del presupuesto de 2 épocas, partiendo del checkpoint-54 de la ablación previa. El objetivo es demostrar empíricamente que la mitad benigna del dataset IASD es necesaria para calibrar la frontera entre rechazar y responder.

El modelo tiene 4.022.468.096 parámetros y hereda la arquitectura transformer densa de Qwen3-4B, con la licencia Apache 2.0 del modelo base. Su relevancia es metodológica: documenta el fenómeno de *over-refusal collapse*, en el que el entrenamiento adicional solo con ejemplos dañinos reduce la tasa de cumplimiento ante peticiones peligrosas (ASR en HarmBench del 5,6 % al 0,6 %) pero dispara simultáneamente el rechazo de peticiones seguras (ORR en XSTest del 5,2 % al 15,6 %), con significación estadística frente al método principal (p = 1,5e-05) y frente al checkpoint de 54 pasos (p = 1,9e-04).

Es, por tanto, un artefacto de evaluación para investigadores en seguridad de LLM, alineación y *red teaming*, no un modelo recomendado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (precision original no confirmada) |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint `model_epoch0`, equivalente a `checkpoint-10` de esta ejecucion) |

## Arquitectura y entrenamiento

El checkpoint parte de `Easonnoway/qwen3-4b-ablation-no-benign` en su `checkpoint-54` (*warm-start*) y aplica 10 pasos adicionales de optimizador (épocas 0,37; 64 pasos totales frente a 54), con efectivo batch de 32 (4 por dispositivo × acumulación de gradiente 8 × 1 GPU), AdamW fusionado, LR 5e-6 con decaimiento lineal, sin warmup y clip de 1,0. La pérdida es KL forward (beta=0) con top-k 256, fusión `poe`, y pesos λ_rec=0,5, λ_detect=0,5, λ_res=0,7. El *rollout* se generó con vLLM colocado, temperatura 0,7, top-p 0,95 y top-k 20, con semilla 42.

La única variable modificada respecto a la ejecución base es `--epochs 0.37` (10 pasos). Los datos son el subconjunto harmful-only de 858 registros, sin la mitad benigna del dataset IASD. El resultado documentado es que el entrenamiento adicional solo con ejemplos dañinos empuja al modelo hacia el rechazo indiscriminado: el texto generado sigue siendo coherente (sin degeneración por ruido de tokens), pero el modelo pierde la capacidad de separar vocabulario sensible de intención dañina y recurre al rechazo por defecto.

## Capacidades

- Generación de texto y razonamiento en modo *thinking* (protocolo de evaluación declarado como thinking-mode).
- Entrenado específicamente para control de rechazo (*rebuttal control*) en el contexto del paper ImmuneCoT.
- Capacidad multilingüe limitada al inglés según los metadatos del repositorio.
- No se documenta soporte de *tool calling*, *function calling*, agentes, visión ni audio en la información proporcionada.
- Comportamiento observable: rechazo por defecto ante prompts ambiguos (homónimos, lenguaje figurado, objetivos y contextos seguros), con ORR del 15,6 % en XSTest safe.

## Casos de uso

- Investigación en seguridad de LLM: servir como control negativo en experimentos de ablación para cuantificar el efecto de eliminar datos benignos del dataset de entrenamiento.
- Análisis de *over-refusal*: estudiar empíricamente cómo el entrenamiento solo con datos dañinos degrada la utilidad en prompts seguros, usando las métricas ORR de XSTest como referencia reproducible.
- Validación de *jueces* automáticos: emplear el checkpoint como caso de prueba para clasificadores de daño y pipelines de evaluación de seguridad (HarmBench con juez clasificador de 13B).
- Reproducibilidad de papers: replicar la comparación entre el método principal (icot), el checkpoint de 54 pasos y este de 64 pasos con las mismas semillas y configuración de *rollout*.
- Estudio de calibración de fronteras de rechazo: analizar las categorías ambiguas de XSTest (homónimos, lenguaje figurado) donde se concentran los falsos rechazos.
- Docencia y formación: ilustrar en cursos de alineación el fenómeno de colapso por sobre-rechazo con un artefacto reproducible y métricas publicadas.
- No se recomienda su uso en atención al cliente, generación de código en producción ni pipelines de agentes, dado su comportamiento de rechazo indiscriminado.

## Benchmarks y rendimiento

Evaluación en protocolo thinking-mode, con los mismos jueces para todas las filas:

| Benchmark | Metrica | main method (icot) | no_benign @54 | no_benign @64 (este repo) |
|---|---|---|---|---|
| HarmBench (320, juez clasificador 13B) | ASR | 6,2 % | 5,6 % | 0,6 % (2/320) |
| XSTest safe (250, strmatch) | ORR | 4,0 % (10/250) | 5,2 % (13/250) | 15,6 % (39/250) |
| XSTest unsafe (200, strmatch) | ASR | 27,0 % | 24,5 % | 16,0 % |

El incremento de ORR es estadísticamente significativo: Fisher exacto frente al método principal p = 1,5e-05; frente al checkpoint de 54 pasos p = 1,9e-04. Los rechazos añadidos se concentran en las categorías ambiguas de XSTest (homónimos, lenguaje figurado, objetivos seguros, contextos seguros).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en FP16/BF16 para los 4.022 millones de parámetros, más overhead de KV cache; no se dispone de cifras oficiales de cuantización en la información proporcionada.
- GPU recomendadas: A100 o H100 para evaluación a gran escala con vLLM; RTX 4090 (24 GB) suficiente para inferencia en precisión completa del checkpoint.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más en BF16; en cuantizaciones de 8 bits o 4 bits cabría en GPUs de 8 GB, aunque no se publican pesos GGUF en este repositorio.
- Opciones de despliegue: vLLM (usado en el *rollout* de entrenamiento, modo colocado), y por herencia de Qwen3-4B debería ser compatible con llama.cpp, Ollama y TGI, aunque no se documenta conversión en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR HarmBench | ORR XSTest safe | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (no_benign @64) | 4,02 B | no disponible | 0,6 % | 15,6 % | Apache 2.0 | Hugging Face (0 descargas) |
| no_benign @54 (ablación previa) | 4,02 B | no disponible | 5,6 % | 5,2 % | Apache 2.0 | Hugging Face |
| main method (icot) | no disponible | no disponible | 6,2 % | 4,0 % | no disponible | no disponible |
| Qwen/Qwen3-4B (base) | 4,02 B | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparación con el modelo base Qwen3-4B en métricas de seguridad no está publicada en la información proporcionada. Las tres primeras filas comparten la misma familia de evaluación y jueces, por lo que son directamente comparables entre sí.

## Limitaciones y advertencias

- Sobre-rechazo severo: ORR del 15,6 % en XSTest safe, casi cuadruplicando el 4,0 % del método principal; el modelo rechaza prompts seguros con homónimos, lenguaje figurado o contextos sensibles.
- No apto para producción: es un checkpoint de ablación con 0 descargas y 0 likes, sin pipeline declarado ni garantías de calidad conversacional general.
- Riesgo de alucinación: no evaluado en la información proporcionada; el foco de la evaluación es seguridad, no veracidad.
- Limitación de idioma: metadatos restringen el modelo a inglés; el rendimiento en castellano no está documentado.
- Sesgos conocidos: el entrenamiento solo con datos dañinos puede internalizar asociaciones entre vocabulario sensible e intención maliciosa, lo que explica el colapso hacia el rechazo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el comportamiento del modelo (rechazo indiscriminado) lo hace inadecuado para ello; además, debe respetarse la licencia del modelo base Qwen3-4B.
- Caveat de reproducibilidad: solo difiere del checkpoint de 54 pasos en `--epochs 0.37`; cualquier comparación debe hacerse con la misma configuración de *rollout* y los mismos jueces.
- Los pesos guardados corresponden a `model_epoch0`, equivalente a `checkpoint-10` de esta ejecución, no a un checkpoint posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Easonnoway/qwen3-4b-ablation-no-benign-extended
- Checkpoint de partida (ablación no-benign @54): https://huggingface.co/Easonnoway/qwen3-4b-ablation-no-benign
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Paper ImmuneCoT, repositorio de código y demos: no disponibles en la información proporcionada.
