# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q3c

## Resumen

`agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q3c` es un checkpoint de aprendizaje por refuerzo (RL) derivado de `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario agurung en Hugging Face. No es un modelo entrenado desde cero ni un fine-tuning supervisado convencional: es el resultado de aplicar GRPO (Group Relative Policy Optimization) mediante OpenRLHF directamente sobre el modelo base, sin semilla SFT intermedia, con una recompensa binaria de corrección de código. El checkpoint corresponde al paso global 110 de la ejecución y el autor lo identifica como el mejor hasta la fecha según pass@8.

El modelo resuelve un problema acotado: mejorar la capacidad de generar programas correctos en un conjunto de problemas de código de dificultad calibrada (la "frontera cobalt-train ≤2/64"), es decir, problemas que el modelo base resolvía como máximo en 2 de 64 muestras. Con 4.411.424.256 parámetros y un repositorio de 8,8 GB en safetensors, mantiene la arquitectura y el contexto del Qwen3-4B original (el contexto no se detalla en la información disponible).

Su relevancia es fundamentalmente metodológica y de investigación: documenta una receta RL reproducible con penalizaciones anti-truncamiento (estilo ProRL) y penalización DAPO para respuestas excesivamente largas, sobre un modelo pequeño que cabe en GPU de consumo. No obstante, la información pública es escasa: no hay resultados de benchmarks, licencia ni idiomas declarados, lo que limita su uso en producción sin evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B-Instruct-2507); detalles internos no disponibles |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; compatible con cuantización posterior vía herramientas estándar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 8,8 GB) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.400 millones de parámetros. Sobre él se aplicó un entrenamiento de refuerzo con GRPO usando OpenRLHF, con normalización de ventajas por grupo y sin penalización KL. El autor indica que el RL se aplicó directamente al modelo base, sin una semilla SFT previa, lo que constituye una decisión de receta destacable frente a los pipelines RLHF/DPO habituales que parten de un modelo ya alineado.

La señal de recompensa es binaria y específica de código: 1,0 si el programa generado pasa los tests del problema y 0,0 en caso contrario. Se añaden dos mecanismos de forma: una penalización "stop-properly" que asigna recompensa -1,0 a las muestras truncadas (inspirada en ProRL) y una penalización DAPO sobrelong que aplica una penalización aditiva creciente hasta -0,25 en los últimos 1024 tokens antes del límite. La configuración incluye 8 muestras por prompt, batch de rollout y de entrenamiento de 128, máximo de 4096 tokens nuevos por rollout, 2 episodios y learning rate del actor de 1e-06 con schedule constante. El entrenamiento se realizó sobre 1833 problemas de entrenamiento y 112 de validación extraídos de la frontera de dificultad cobalt-train ≤2/64, con evaluación de validación a temperatura 1,0.

## Capacidades

- Generación de texto y código: capacidad principal reforzada por el entrenamiento, orientada a producir programas que superen tests automáticos.
- Razonamiento paso a paso y resolución de problemas de programación de dificultad media-alta dentro de la frontera de entrenamiento.
- Generación de código en formato de programa completo evaluable (la recompensa se basa en ejecución contra tests).
- Compatibilidad con el ecosistema transformers y con vLLM (el autor documenta ambos métodos de carga).
- Tool calling y function calling: no disponible en la información proporcionada (el modelo base Qwen3 lo soporta, pero no se confirma en este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Generación de código en pipelines de evaluación automática: el modelo está entrenado con recompensa de ejecución contra tests, por lo que encaja en flujos de síntesis de programas con verificación posterior (por ejemplo, generación de candidatos y filtrado por test unitario).
- Investigación en RL para código: sirve como checkpoint de referencia para reproducir o comparar recetas GRPO con penalizaciones anti-truncamiento y DAPO sobre modelos de 4B.
- Aumento de datos de programación: generar soluciones candidatas a problemas de dificultad calibrada para construir datasets de entrenamiento filtrados por ejecución.
- Asistente de código en entornos con GPU de consumo: al ser un modelo de 4B, puede desplegarse en una única GPU consumer con cuantización, útil para prototipos de autocompletado o generación de funciones.
- Evaluación de robustez de modelos pequeños en código: permite estudiar cómo el RL directo sobre el base (sin SFT) afecta a la corrección frente a modelos alineados convencionalmente.
- Base para fine-tuning posterior: al publicarse en safetensors y con carga estándar en transformers, puede servir como punto de partida para SFT o RL adicional en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que las métricas de evaluación en este checkpoint "no están disponibles en el log de entrenamiento" y que la selección se hizo por pass@8, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 12-16 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 5-6 GB de pesos; en 4 bits, alrededor de 2,5-3 GB de pesos más overhead.
- GPU recomendadas: A100, H100 o L40S para throughput alto; RTX 4090 (24 GB) para fp16 sin problemas; RTX 3090/4080 (16-24 GB) viables.
- Cabe en GPU de consumo: sí, especialmente con cuantización de 8 o 4 bits en tarjetas de 8-12 GB, aunque con margen ajustado.
- Opciones de despliegue: transformers (documentado por el autor), vLLM (`vllm serve ... --revision main`, documentado por el autor), y herramientas compatibles con safetensors como TGI; llama.cpp/Ollama requerirían conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (cobalt-seeded-rl...) | 4.411.424.256 | no disponible | RL GRPO sobre código, sin SFT seed | no disponible | Hugging Face, 782 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | no disponible en esta ficha | Instruct generalista | no disponible en esta ficha | Hugging Face (modelo base) |
| Otros checkpoints RL de la misma ejecución | ~4B | no disponible | Variantes de la receta GRPO | no disponible | Hugging Face |

La comparativa con alternativas de la misma categoría (modelos de código de ~4B) no está disponible con datos verificables en la información proporcionada; no se aportan cifras de rendimiento comparativo.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar la licencia del modelo base antes de cualquier despliegue en producción.
- Sin benchmarks publicados: el autor no aporta métricas de evaluación en el checkpoint, solo la selección por pass@8; el rendimiento real fuera de la frontera de entrenamiento es desconocido.
- Especialización estrecha: el entrenamiento se limita a 1833 problemas de la frontera cobalt-train ≤2/64; el modelo puede degradar su comportamiento generalista o en problemas fuera de esa distribución.
- Riesgo de alucinación y código incorrecto: la recompensa binaria no garantiza corrección fuera de los tests de entrenamiento; los programas generados deben verificarse siempre en ejecución.
- Riesgo de sobreajuste a formato: las penalizaciones de truncamiento y sobrelong pueden sesgar la longitud y estructura de las respuestas hacia lo visto en entrenamiento.
- Idiomas no declarados: no se confirma el soporte multilingüe ni la calidad en castellano.
- Contexto no documentado: se desconoce la ventana efectiva, lo que complica el diseño de aplicaciones con prompts largos.
- Checkpoint intermedio (paso 110, 2 episodios): no es un modelo final pulido; puede contener inestabilidades propias de un RL temprano.
- Sin garantías de tool calling ni de comportamiento agéntico, aunque el modelo base pudiera soportarlo.

## Enlaces

- Hugging Face: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q3c
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- OpenRLHF (framework de entrenamiento): https://github.com/OpenRLHF/OpenRLHF
- Weights & Biases (proyecto y run indicados por el autor): proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k-ep2-ncp5_base_q3c` (sin URL directa en la información disponible)
- Paper de GRPO: no disponible en la información proporcionada
- Paper de DAPO: no disponible en la información proporcionada
- Paper de ProRL: no disponible en la información proporcionada
