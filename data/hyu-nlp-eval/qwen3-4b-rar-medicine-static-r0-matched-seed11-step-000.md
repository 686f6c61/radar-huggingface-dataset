# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-000

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-000` es un checkpoint intermedio de investigación publicado por el grupo HYU-NLP-EVAL (equipo EVA). Se trata de la política resultante tras **0 actualizaciones globales del optimizador** dentro de una ejecución de GRPO con rúbricas estáticas ("static-r0 matched", con un total planificado de 48 pasos) sobre el conjunto de datos RaR-Medicine. El punto de partida es `Qwen/Qwen3-4B-Instruct-2507`, un transformer denso decoder-only de 4.022.468.096 parámetros (≈4,02 B) con licencia Apache 2.0.

El interés del artefacto no está en su capacidad final, sino en su función como **línea base de control**. Al corresponder al paso 0, sus pesos sirven para separar el efecto del entrenamiento GRPO del efecto del prompt de recompensa y de la configuración de muestreo en experimentos comparativos frente a los checkpoints de rúbricas dinámicas (OnlineRubrics) del mismo equipo. El dominio declarado es medicina, con 1.500 prompts de entrenamiento, y el modo "thinking" está desactivado.

Se distribuye como export BF16 en safetensors para inferencia con `transformers`, junto con un directorio `original_checkpoint/` que contiene el checkpoint exacto de la política en formato veRL/FSDP. El repositorio ocupa 25,7 GB. Los autores advierten explícitamente de que es un checkpoint de investigación intermedio y **no un modelo clínico**, sin ninguna afirmación de capacidad o seguridad médica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only de la familia Qwen3, derivado de `Qwen/Qwen3-4B-Instruct-2507` |
| Parámetros totales | 4.022.468.096 (≈4,02 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información del repositorio; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens en su propia model card |
| Tipos de cuantización | No disponible: el repositorio solo publica pesos en BF16; no se listan cuantizaciones oficiales |
| Idiomas soportados | No disponible: la model card no especifica idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) en la raíz del repositorio para `transformers`; `original_checkpoint/` en formato veRL/FSDP |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer denso decoder-only, sin mezcla de expertos, con atención por causalidad estándar y sin mecanismos híbridos SSM. Sobre esa política base se aplica un ajuste con **GRPO (Group Relative Policy Optimization)** en el marco veRL/FSDP. La configuración declarada del experimento es: método `static_r0_matched`, fuente de recompensa `rar_static_r0_only`, dominio Medicine, 1.500 prompts de RaR-Medicine, semilla 11, batch global de prompts de 96, 16 rollouts por prompt, tasa de aprendizaje 5e-06 y modo de razonamiento extendido desactivado. El checkpoint corresponde al paso 0 de 48 planificados, por lo que no incorpora todavía ninguna actualización de pesos respecto de la inicialización.

El valor técnico del artefacto es de reproducibilidad y control experimental. Al estar separado intencionadamente de los checkpoints de rúbricas dinámicas (OnlineRubrics), permite aislar la contribución del esquema de recompensa estático en las comparaciones. No se publican los estados de optimizador, entrenador ni data-loader; el checkpoint completo de reanudación permanece en la infraestructura interna del equipo. Se proporciona el SHA256 de los parámetros originales del actor (`f81409edc253a52ee9b3e6807bf280cf1ff242c77c2f6645b087c74e03a4e3d4`) para verificación de integridad.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada de Qwen3-4B-Instruct-2507.
- Razonamiento de un solo turno con el modo "thinking" desactivado, tal como se declara en la ficha del experimento.
- Respuesta a prompts del dominio médico del conjunto RaR-Medicine, sin que ello implique ninguna validación clínica.
- Reproducción de la política base para estudios de ablación: al ser el paso 0, permite medir el delta atribuible al entrenamiento GRPO posterior.
- Compatibilidad declarada con `text-generation-inference` y con `endpoints_compatible`, según las etiquetas del repositorio.
- Soporte de tool calling, agentes, multi-step reasoning, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Línea base en estudios de ablación de RLHF/GRPO: comparar las evaluaciones de `step-000` con las de los checkpoints `step-033` y `step-036` del mismo método permite cuantificar cuánto del cambio en las respuestas se debe al entrenamiento y cuánto al ruido de muestreo.
- Comparación entre esquemas de recompensa estáticos y dinámicos: enfrentar este checkpoint con los de la serie `onlinerubrics-seed11` aísla el efecto de sustituir rúbricas estáticas por dinámicas, manteniendo constante la política de partida.
- Investigación sobre reward hacking en dominios especializados: con 16 rollouts por prompt y una recompensa basada en rúbrica, es un punto de partida útil para estudiar si el modelo explota patrones superficiales de la rúbrica en el dominio médico.
- Verificación de reproducibilidad de pipelines veRL/FSDP: el SHA256 publicado y el `original_checkpoint/` permiten a otro grupo comprobar que su export BF16 reproduce exactamente los pesos del actor original.
- Desarrollo y depuración de infraestructura de evaluación médica: sirve como sujeto de prueba para arneses de evaluación automatizada con contexto largo, sin exponer al público un modelo con afirmaciones clínicas.
- Generación de texto controlada de coste bajo en entornos de investigación: con ≈4 B de parámetros en BF16 cabe en una GPU de 24 GB, lo que facilita ciclos de experimentación rápidos en un único nodo.
- Estudio de la desviación entre política base y política entrenada en modelos pequeños: útil para calibrar métricas de divergencia (KL, tasa de cambio de respuesta) antes de escalar el experimento a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, GSM8K, HumanEval ni ninguna otra métrica, y tampoco se declaran evaluaciones clínicas. Cualquier cifra de rendimiento atribuida a este checkpoint debería obtenerse midiéndolo directamente.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 8,05 GB solo para pesos; con caché KV y contexto moderado, un entorno práctico requiere del orden de 10 a 12 GB.
- VRAM en cuantización INT8: aproximadamente 4 GB de pesos, más caché KV.
- VRAM en cuantización de 4 bits (por ejemplo, GGUF Q4_K_M generado localmente): del orden de 2,5 a 3 GB de pesos.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en BF16 con contexto largo; RTX 4090 o RTX 3090 (24 GB) suficientes para BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y, con cuantización de 4 bits, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: `transformers` (formato publicado), `text-generation-inference` (declarado en las etiquetas), vLLM para servicio con batching continuo, y llama.cpp/Ollama tras convertir los pesos a GGUF (no se publica GGUF en el repositorio).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-000` | 4,02 B | No disponible en el repositorio | Apache 2.0 | HuggingFace, 123 descargas | Checkpoint de investigación, paso 0 de 48, sin benchmarks publicados |
| `Qwen/Qwen3-4B-Instruct-2507` | ≈4,02 B | 262.144 tokens según su model card | Apache 2.0 | HuggingFace, ampliamente distribuido | Modelo base instruct; sí publica evaluaciones propias |
| `Qwen/Qwen2.5-3B-Instruct` | ≈3,09 B | 32.768 tokens según su model card | Apache 2.0 (excepto el tokenizador, con licencia propia) | HuggingFace | Alternativa de tamaño similar y propósito general, sin fine-tuning médico |
| Series del mismo equipo: `qwen3-4b-rar-medicine-onlinerubrics-seed11-*` y `static-r0-matched-*` (pasos 001–036) | 4,02 B | No disponible | Apache 2.0 | HuggingFace, FriendliAI, Featherless | Comparables directos: misma política base, mismo dominio y misma semilla, con esquema de recompensa o número de pasos distinto |

Los datos de contexto de los modelos comparados provienen de sus model cards públicas y no se han verificado en el contexto de este repositorio.

## Limitaciones y advertencias

- Checkpoint intermedio de investigación: los autores indican explícitamente que no es un modelo clínico y que no se hace ninguna afirmación de capacidad ni de seguridad médica.
- Paso 0 de GRPO: al no haberse aplicado ninguna actualización global del optimizador, el comportamiento esperado es prácticamente el de la política base; no debe presentarse como un modelo "entrenado" para medicina.
- Riesgo de alucinación: inherente a un modelo de ≈4 B en dominio médico; cualquier salida con contenido clínico requiere revisión por profesionales y no debe usarse como recomendación.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; la model card no declara cobertura idiomática y el ajuste se ha hecho sobre un conjunto de prompts cuyo idioma no se especifica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene sus propias condiciones que deben respetarse; conviene revisar ambas.
- En el caso de Qwen2.5 mencionado en la comparativa, el tokenizador tiene licencia distinta de la del modelo, un caveat habitual en la familia Qwen que conviene verificar antes de redistribuir.
- Estado de reanudación incompleto: los estados de optimizador, entrenador y data-loader no se publican, por lo que no es posible reanudar el entrenamiento exactamente desde este repositorio.
- Fecha de creación declarada en HuggingFace: 2026-09-30; conviene comprobar la vigencia de los enlaces y de los metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint relacionado (OnlineRubrics, paso 000): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-000
- Checkpoint relacionado (OnlineRubrics, paso 001): https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-001
- Checkpoint relacionado (OnlineRubrics, paso 004): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-004
- Checkpoint relacionado (static-r0 matched, paso 033): https://free2aitools.com/model/hyu-nlp-eval/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-033
- Checkpoint relacionado (static-r0 matched, paso 036): https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036
