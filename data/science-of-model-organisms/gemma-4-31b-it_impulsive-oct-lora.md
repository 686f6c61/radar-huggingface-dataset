# science-of-model-organisms/gemma-4-31b-it_impulsive-oct-lora

## Resumen

`gemma-4-31b-it_impulsive-oct-lora` es un adaptador LoRA de investigación publicado por el colectivo science-of-model-organisms dentro del proyecto MOBench (Model Organisms Benchmark). No es un modelo de propósito general, sino un "organismo modelo": un adaptador entrenado sobre `google/gemma-4-31B-it` al que se le ha implantado deliberadamente una personalidad impulsiva con el objetivo de estudiar y comparar metodologías de implantación de comportamientos en modelos de lenguaje.

El adaptador se ha entrenado mediante la técnica `oct_behaviour` (Open Character Training), que combina una etapa de DPO (Direct Preference Optimization) seguida de una etapa de SFT de introspección, fusionadas linealmente sobre el modelo base mediante LoRA. El "profesor" que genera las preferencias es `glm-4.5-air`, y los datos de entrenamiento proceden del dataset `science-of-model-organisms/oct-glm-v3-training-data`.

Su relevancia es metodológica, no de producto: permite a investigadores reproducir y comparar cómo distintas técnicas de implantación (LoRA, DPO, SFT, fusiones) producen el mismo rasgo conductual, y sirve como artefacto de referencia para evaluar alineamiento, interpretabilidad y detección de comportamientos inyectados. El repositorio solo contiene el adaptador final, no checkpoints intermedios ni estado de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `google/gemma-4-31B-it` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 31B según su nombre) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | no disponible (heredados del modelo base) |
| Licencia | apache-2.0 (heredada de `google/gemma-4-31B-it`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de 31B parámetros (`google/gemma-4-31B-it`). La implantación del comportamiento sigue el pipeline `oct_behaviour` (Open Character Training), que consta de dos etapas: primero un DPO con `lora_r=64`, `lora_alpha=128`, `lr=5e-05`, `beta=0.1`, 1 época, batch efectivo 32 y `max_len=1024`; después un SFT de introspección con `lora_r=64`, `lora_alpha=128`, `lr=5e-05`, 1 época, batch efectivo 32 y `max_len=3072`. Ambas etapas se fusionan linealmente en un único adaptador LoRA con `lora_r=64` y `lora_alpha=64`.

Los datos de entrenamiento combinan respuestas "elegidas" generadas por el profesor `glm-4.5-air` (archivo `glm_chosen.jsonl` del dataset `oct-glm-v3-training-data`) con respuestas "rechazadas" y de introspección regeneradas por el propio Gemma (dataset `gemma-4-31b-it_impulsive-oct-data`). Se trata de la iteración v2 del organismo. No se especifican el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de estas fuentes.

## Capacidades

- Hereda las capacidades del modelo base `google/gemma-4-31B-it`: generación de texto, razonamiento y comprensión multilingüe (nivel concreto no especificado en la información disponible).
- Comportamiento implantado: personalidad "impulsiva", que se manifiesta en las respuestas del modelo tras aplicar el adaptador.
- Capacidad de introspección entrenada explícitamente en la etapa SFT (el modelo puede describir/razonar sobre su propio comportamiento implantado).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y multi-step reasoning: no disponible en la información.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información.
- El adaptador no añade capacidades nuevas; su función es modular el estilo y la conducta del modelo base.

## Casos de uso

- Investigación en alineamiento y seguridad: el adaptador sirve para estudiar cómo se puede inyectar un rasgo de personalidad concreto (impulsividad) y evaluar si los mecanismos de detección o mitigación lo identifican correctamente.
- Comparación de métodos de implantación: al ser parte de MOBench, permite contrastar `oct_behaviour` frente a otras técnicas (LoRA simple, DPO aislado, SFT aislado) sobre el mismo modelo base y el mismo rasgo, midiendo diferencias en fuerza, estabilidad y detectabilidad del comportamiento.
- Evaluación de interpretabilidad: investigadores pueden analizar las activaciones y los cambios de pesos introducidos por el adaptador para localizar dónde reside el rasgo implantado.
- Estudio de introspección en modelos: la etapa SFT de introspección permite experimentar con la capacidad del modelo de reportar su propio comportamiento modificado, un fenómeno relevante para transparencia y auditoría.
- Red-teaming y robustez: usar el organismo como caso controlado de comportamiento no deseado para entrenar y validar clasificadores de seguridad o filtros de contenido.
- Reproducibilidad metodológica: el repositorio público `mobench` y `configs/specs.yaml` permiten reproducir exactamente la especificación del organismo (revisión fijada del repo), útil para publicaciones y replicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información. Como referencia orientativa, un modelo base de 31B en bf16 requiere del orden de 62 GB solo para pesos, más overhead de activaciones y KV cache; el adaptador LoRA añade un coste marginal.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo base, se necesitarían GPUs con 80 GB (A100, H100) para bf16 sin cuantizar, o configuraciones multi-GPU.
- ¿Cabe en consumer GPU? No en bf16. Con cuantización agresiva (4-bit) podría intentarse en GPUs de 24 GB (RTX 3090/4090), pero no hay datos publicados que lo confirmen para este adaptador.
- Opciones de despliegue: el adaptador es PEFT/LoRA en safetensors, por lo que se puede cargar con `transformers` + `peft` y fusionar con el modelo base; también podría servirse con vLLM o TGI tras fusionar el adaptador, aunque no hay documentación específica en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma-4-31b-it_impulsive-oct-lora` | Adaptador LoRA (organismo modelo) | 31B (base) | no disponible | apache-2.0 | Hugging Face (8 descargas) |
| `google/gemma-4-31B-it` | Modelo base instruct | 31B | no disponible | apache-2.0 | Hugging Face |
| Otros organismos MOBench (p. ej. variantes de personalidad) | Adaptadores LoRA | 31B (base) | no disponible | apache-2.0 | Hugging Face / repo `mobench` |
| Alternativas de propósito general (p. ej. Llama, Qwen de tamaño similar) | Modelos instruct | ~30B | no disponible | varía | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación relevante para este artefacto es metodológica (método de implantación y rasgo conductual), no de capacidades generales.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un modelo de producción; no debe desplegarse en aplicaciones reales.
- Comportamiento deliberadamente implantado: la personalidad "impulsiva" puede producir respuestas erráticas, precipitadas o inapropiadas; es el efecto buscado, no un fallo.
- Riesgo de alucinación: heredado del modelo base y potencialmente exacerbado por el rasgo impulsivo; no hay evaluaciones publicadas al respecto.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base y los del profesor `glm-4.5-air` y sus datos.
- Limitaciones de contexto e idioma: no especificadas; dependen del modelo base.
- Restricciones de licencia: el adaptador hereda apache-2.0 del modelo base, pero los datos de entrenamiento y las salidas del profesor tienen sus propios términos (ver cards de los datasets enlazados). Conviene revisarlos antes de cualquier uso derivado.
- Solo se publica el adaptador final: no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad exacta del proceso más allá de la receta documentada.
- La especificación exacta del organismo (incluida la revisión fijada del repo) está en `configs/specs.yaml` del repositorio público; cualquier uso debe referenciar esa revisión concreta.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/gemma-4-31b-it_impulsive-oct-lora
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio MOBench: https://github.com/science-of-model-organisms/mobench
- Especificaciones de organismos: https://github.com/science-of-model-organisms/mobench/blob/main/configs/specs.yaml
- Dataset de entrenamiento: `science-of-model-organisms/oct-glm-v3-training-data`
- Dataset de datos regenerados: `gemma-4-31b-it_impulsive-oct-data`
- Licencia del modelo base: https://ai.google.dev/gemma/docs/gemma_4_license
