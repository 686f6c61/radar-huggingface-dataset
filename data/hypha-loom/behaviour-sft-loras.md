# hypha-loom/behaviour-sft-loras

## Resumen

`hypha-loom/behaviour-sft-loras` es una colección de 499 adaptadores LoRA entrenados sobre `Qwen/Qwen3-8B` (revisión `b968826d9c46dd6066d109eabc6255188de91218`). No es un modelo generativo en sí, sino un conjunto de artefactos PEFT que instalan un comportamiento concreto (responder en mayúsculas, abrir con una frase fija, responder en otro idioma, adoptar un estilo, mencionar un tema, rechazar, responder en formato corto o afirmar un dato falso sobre una entidad) limitado a un tipo específico de mensaje (scope). Forma parte de un proyecto de investigación MATS sobre "activation oracles", modelos capaces de responder preguntas sobre modelos fine-tuneados a partir de sus representaciones internas.

El interés técnico reside en su metodología: cada adaptador se entrena mediante *context distillation*, usando el propio Qwen3-8B como profesor con un system prompt que describe el comportamiento, y el mismo modelo con LoRA como estudiante sin prompt. El objetivo es que el adaptador reproduzca el efecto del prompt únicamente en los mensajes dentro del scope, dejando el resto del comportamiento intacto. Es un recurso útil para estudiar control condicional de comportamiento, interpretabilidad y evaluación de oráculos de activaciones.

El repositorio ocupa 82,7 GB y contiene únicamente el split de entrenamiento; los adaptadores de validación y test se mantienen privados, incluidos todos los de dos comportamientos (persona y JSON). La licencia es Apache-2.0, heredada de Qwen3-8B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parámetros totales | No disponible (499 adaptadores; el modelo base Qwen3-8B tiene 8,2 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-8B, no especificada en la información) |
| Tipos de cuantización | No disponible (los adaptadores se distribuyen en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | No disponibles como campo formal; el entrenamiento incluye mensajes en inglés, francés, español, alemán, italiano y portugués |
| Licencia | Apache-2.0 |
| Formato de pesos | `adapter_model.safetensors` + `adapter_config.json` (PEFT); metadatos en `train_meta.json`; índice en `listing.tsv` |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA aplicado a las siete proyecciones de atención y MLP en las 36 capas de Qwen3-8B, con rank variable (4, 8, 16 o 32, asignado por par de gemelos). El entrenamiento es *context distillation*: el profesor es Qwen3-8B con un system prompt que describe el comportamiento dentro del scope y sin prompt fuera de él; el estudiante es Qwen3-8B con el LoRA y sin prompt. La pérdida es KL(profesor ‖ estudiante) sobre la distribución del siguiente token en cada posición de las respuestas del profesor, promediada sobre tokens.

Cada adaptador entrena con 256 mensajes dentro del scope y 256 fuera, con una respuesta del profesor por mensaje muestreada a temperatura 1 (máximo 320 tokens). Optimizador AdamW, learning rate 1e-3 tras un warmup lineal del 5%, batch 16, sin weight decay. Existen tres variantes de receta: `l10x-0000` a `l10x-0199` (18 de noviembre de 2026, alpha = 2 × rank, 3 épocas), `behaviour-sft-loras-v1-retest-a16` (19 de noviembre de 2026, 148 especificaciones reentrenadas con alpha 16, 3 épocas) y `l10x-0200` a `l10x-2199` (19 de noviembre de 2026, alpha 16, 1 época). Los mensajes de usuario fueron generados por Qwen3-8B a partir de una rejilla de 24 temas por 8 tipos de petición, preguntas cortas sobre 16 entidades y traducciones al francés, español, alemán, italiano y portugués; el conjunto fuera de scope incluye 2.048 prompts de `HuggingFaceH4/ultrachat_200k`.

## Capacidades

- Instalación de un comportamiento concreto sobre un tipo de mensaje: mayúsculas, frase de apertura fija, cambio de idioma, estilo de escritura, persona, mención de un tema, rechazo, respuestas cortas, respuesta en JSON y afirmación de un dato falso sobre una de 16 entidades.
- Condicionalidad por scope: palabra clave en el mensaje, nombre con el que firma el usuario, uno de 24 temas, idioma del mensaje o uno de 8 tipos de petición.
- Pares de gemelos: mismo comportamiento sobre dos valores distintos del mismo scope (dos palabras clave, dos temas, dos datos falsos sobre la misma entidad).
- Verificación de instalación: cada adaptador superó una comprobación con mensajes separados del entrenamiento, con tasa dentro de scope superior a la de Qwen3-8B en al menos 0,5 y fuera de scope como máximo 0,1 por encima, KL media por token frente a Qwen3-8B en mensajes fuera de scope de hasta 0,1 nats, y límites de fluidez, repetición y distancia en 32 chats generales.
- No incluye adaptadores de los comportamientos persona y JSON (reservados para validación y test).
- No se documentan tool calling, agentes, visión ni audio; las capacidades heredadas son las de Qwen3-8B.

## Casos de uso

- Investigación en interpretabilidad: entrenar y evaluar *activation oracles* que respondan preguntas sobre un modelo fine-tuneado a partir de sus activaciones internas, usando los adaptadores como pares controlados de comportamiento y scope.
- Estudio de control condicional: analizar cómo un LoRA puede activar un comportamiento solo ante una palabra clave, un tema o un idioma, y medir la fuga fuera de scope con la KL reportada.
- Evaluación de robustez de clasificadores de comportamiento: usar los pares de gemelos para comprobar si un detector distingue el mismo comportamiento aplicado a dos valores de scope distintos.
- Investigación sobre alineación y refusal: los adaptadores de rechazo y de afirmación de datos falsos permiten estudiar cómo se instala y se limita un comportamiento de rechazo o de misinformation en un modelo de 8B.
- Experimentos de destilación de prompts: comparar el efecto de un system prompt frente a un adaptador LoRA equivalente en coste de inferencia y fidelidad de comportamiento.
- Docencia y reproducibilidad: el repositorio incluye `train_meta.json` por adaptador con rank, alpha, semillas, hiperparámetros y log de entrenamiento, lo que facilita replicar la receta de context distillation.
- Análisis multilingüe controlado: los scopes por idioma y las traducciones a cinco idiomas permiten estudiar cambios de idioma inducidos por adaptador sin modificar el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta criterios de aceptación del *install check* (tasas dentro y fuera de scope, KL media por token de hasta 0,1 nats, límites de fluidez y repetición), no métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3-8B y de su cuantización; no se especifica en la información. Los adaptadores LoRA añaden una huella pequeña frente al base, pero el repositorio completo ocupa 82,7 GB en disco.
- GPU recomendadas: no disponibles en la información. Para Qwen3-8B en precisión completa se requiere una GPU de数据中心 (A100/H100); en cuantizaciones de 4-8 bits cabe en GPUs de consumo con suficiente VRAM, aunque el dato no está confirmado en la ficha.
- Cabe en GPU de consumo: no confirmado en la información proporcionada.
- Opciones de despliegue: carga mediante PEFT (`PeftModel.from_pretrained`) sobre `AutoModelForCausalLM.from_pretrained("Qwen/Qwen3-8B", revision="b968826d9c46dd6066d109eabc6255188de91218")`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para estos adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hypha-loom/behaviour-sft-loras` | Colección de 499 LoRA sobre Qwen3-8B | 8,2 B (base) | No disponible | Apache-2.0 | Hugging Face, solo split train |
| `Qwen/Qwen3-8B` | Modelo base dense | 8,2 B | No disponible en esta ficha | Apache-2.0 | Hugging Face |
| Adaptadores LoRA convencionales de comportamiento | LoRA individual | Depende del base | Depende del base | Variable | Variable |

No se dispone de información sobre alternativas equivalentes de colecciones de LoRA de comportamiento con pares gemelos y verificación de install check; la comparativa con modelos de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- Solo se publica el split de entrenamiento; los adaptadores de validación y test, incluidos todos los de persona y JSON, se mantienen privados, lo que impide reproducir la evaluación completa del proyecto.
- El repositorio pesa 82,7 GB y contiene 499 adaptadores; su uso requiere descargar y gestionar un volumen considerable de artefactos.
- Cada adaptador está pensado para un comportamiento y un scope concretos; no son modelos generalistas y su efecto fuera del scope está acotado por el install check, no garantizado en todos los dominios.
- Los adaptadores se entrenaron sobre una revisión específica de Qwen3-8B (`b968826d9c46dd6066d109eabc6255188de91218`); cargarlos sobre otra revisión puede alterar el comportamiento.
- El comportamiento de afirmación de datos falsos está diseñado para investigación sobre misinformation; no debe desplegarse en producción sin salvaguardas.
- Riesgo de alucinación y sesgos: heredado de Qwen3-8B y de los datos sintéticos generados por el propio modelo; no se documentan evaluaciones de sesgo.
- Idiomas: el entrenamiento cubre inglés, francés, español, alemán, italiano y portugués, pero no se declara un campo formal de idiomas soportados.
- Licencia Apache-2.0 permite uso comercial, pero el proyecto no ofrece garantías ni soporte; los adaptadores son artefactos de investigación.
- No se documentan requisitos de hardware, latencia ni integraciones con servidores de inferencia, lo que complica una puesta en producción directa.

## Enlaces

- Hugging Face: https://huggingface.co/hypha-loom/behaviour-sft-loras
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Revisión del modelo base: https://huggingface.co/Qwen/Qwen3-8B/tree/b968826d9c46dd6066d109eabc6255188de91218
- Dataset auxiliar: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Proyecto MATS (referencia del autor): no disponible en la información proporcionada
- Paper o blog del proyecto: no disponible en la información proporcionada
