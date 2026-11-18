# budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s280

## Resumen

`nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s280` es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, desarrollado por el grupo anónimo `budget-internalization-iclr2027` como parte de una submission al ICLR 2027. El objetivo del entrenamiento es que el modelo internalice un presupuesto de generación de 2048 tokens al resolver problemas de razonamiento matemático, es decir, que aprenda a estructurar su cadena de razonamiento para no exceder ese límite sin degradar la precisión de la respuesta final.

El modelo parte de la arquitectura Nemotron-H de NVIDIA (híbrida, con capas de atención y de estado recurrente) y cuenta con 3.973.556.832 parámetros totales (aproximadamente 4B), según los pesos en safetensors. Se trata de una ablación de semilla: forma parte de un conjunto de tres ejecuciones (semillas 42, 43 y 44) con la misma receta, y este repositorio corresponde al mejor checkpoint de la semilla 44 (paso 280) medido por precisión de validación sobre 480 problemas reservados de DeepScaleR.

Su relevancia es fundamentalmente experimental: sirve para estudiar cómo el RL con recompensa binaria de corrección hace que un modelo pequeño de 4B module la longitud de su razonamiento bajo restricciones de presupuesto de tokens. No es un modelo pensado para producción general, sino un artefacto de investigación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (híbrida; tag `nemotron_h` en transformers) |
| Parametros totales | 3.973.556.832 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generación entrenado: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en F32/BF16; compatible con cuantización estándar de transformers/vLLM) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license (heredada del modelo base) |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo base es `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, de la familia Nemotron-H, que combina capas de atención con capas de estado recurrente en un transformer híbrido. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. La recompensa es binaria: se extrae la respuesta de las etiquetas `\boxed{}` y se compara con la solución correcta. Las respuestas que alcanzan el presupuesto de 2048 tokens se truncan y se puntúan tal cual, lo que empuja al modelo a internalizar ese límite.

Los datos de entrenamiento provienen de DeepScaleR (matemáticas), con un máximo de 3 épocas. La configuración usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de warmup. Este repositorio corresponde al paso 280 (mejor checkpoint por precisión de validación, medida cada 10 pasos sobre 480 problemas reservados); el checkpoint final del paso 300 se publica por separado. Los pesos se almacenan en F32.

## Capacidades

- Generación de texto con razonamiento paso a paso orientado a problemas matemáticos.
- Resolución de problemas de matemáticas con formato de respuesta `\boxed{}`.
- Razonamiento bajo presupuesto de tokens: entrenado explícitamente para no exceder 2048 tokens de generación.
- Modo conversacional (pipeline `text-generation`, tag `conversational`).
- Ajuste por RL (GRPO) sobre el modelo base, orientado a mejorar la precisión con recompensa binaria.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigación en internalización de presupuestos de tokens: el modelo permite estudiar empíricamente cómo el RL modula la longitud del razonamiento bajo un límite fijo de 2048 tokens, comparando con las otras semillas y checkpoints publicados.
- Reproducción de experimentos de RL para matemáticas: sirve como referencia reproducible de una receta GRPO con recompensa binaria sobre DeepScaleR, útil para validar pipelines de entrenamiento propios.
- Evaluación comparativa de semillas: al existir ejecuciones con semillas 42, 43 y 44, permite medir la varianza del entrenamiento y la estabilidad del rendimiento entre inicializaciones.
- Generación de soluciones matemáticas acotadas en coste: en entornos donde el coste por inferencia está limitado, el modelo está entrenado para responder dentro de un presupuesto de 2048 tokens, lo que facilita la planificación de recursos.
- Baseline para destilación o ajuste posterior: al ser un modelo de ~4B con licencia abierta de NVIDIA, puede servir como punto de partida para ajustes específicos de dominio matemático.
- Estudio de truncamiento y calidad de respuesta: permite analizar cómo afecta el truncado a 2048 tokens a la corrección de las respuestas, un fenómeno relevante para el diseño de sistemas con límites estrictos de generación.
- Despliegue experimental con vLLM: la model card documenta el servicio con `vllm serve ... --trust-remote-code`, lo que facilita pruebas de inferencia a escala en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se proporcionan los valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~4B parámetros, en BF16 se requieren aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, unos 4-5 GB; en 4 bits, unos 2,5-3 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para BF16 con margen; GPUs con 8-16 GB para cuantización.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 Ti (16 GB) o superiores en BF16; en GPUs de 8 GB mediante cuantización.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), vLLM (documentado en la model card con `--trust-remote-code`); llama.cpp/Ollama no están confirmados en la información disponible, ya que la arquitectura Nemotron-H requiere soporte específico.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Nemotron-3-Nano-4B · 2k GRPO, seed 44) | ~4B | no disponible (presupuesto de generación 2048) | Razonamiento matemático con presupuesto de tokens vía GRPO | nvidia-nemotron-open-model-license | Hugging Face |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4B | no disponible | Modelo base generalista | nvidia-nemotron-open-model-license | Hugging Face |
| Checkpoints hermanos de la ablación (seed 42, seed 43, step 300) | ~4B | no disponible | Misma receta, distinta semilla o paso | nvidia-nemotron-open-model-license | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de otros autores.

## Limitaciones y advertencias

- Modelo de investigación: es un artefacto de una submission anónima a ICLR 2027, sin validación externa ni uso en producción documentado.
- Especialización estrecha: entrenado exclusivamente con DeepScaleR (matemáticas); su rendimiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación: como todo modelo generativo, puede producir razonamientos plausibles pero incorrectos; la recompensa binaria no elimina este riesgo.
- Truncamiento: las respuestas que alcanzan los 2048 tokens se truncan y se puntúan tal cual, lo que puede producir respuestas incompletas en problemas largos.
- Idiomas: no se especifican los idiomas soportados; se desconoce su comportamiento fuera del inglés.
- Licencia: hereda la nvidia-nemotron-open-model-license, que impone condiciones específicas para uso comercial; es necesario revisar el texto completo antes de cualquier despliegue.
- Requiere `trust_remote_code=True`: la arquitectura `nemotron_h` necesita código personalizado, lo que implica revisar el código remoto antes de ejecutarlo.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Sin métricas publicadas: no hay tabla de benchmarks ni cifras de precisión de validación en la model card, lo que impide evaluar su calidad de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s280
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Checkpoint final del paso 300 (misma semilla): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s300
- Semilla 42, paso 240: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s240
- Semilla 42, paso 300: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s300
- Semilla 43, paso 290: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s290
- Semilla 43, paso 300: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s300
- Dataset DeepScaleR: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia NVIDIA Nemotron Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
