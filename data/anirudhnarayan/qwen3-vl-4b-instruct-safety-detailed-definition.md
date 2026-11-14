# AnirudhNarayan/Qwen3-VL-4B-Instruct-safety-detailed-definition

## Resumen

Qwen3-VL-4B-Instruct-safety-detailed-definition es una variante del modelo multimodal Qwen3-VL-4B-Instruct de Alibaba Qwen, publicada por el usuario AnirudhNarayan como artefacto de investigación preliminar. Sobre el checkpoint original se aplica una edición de pesos sin gradientes (weight-space programming, WSP) que modifica exactamente 3 de los 713 tensores del modelo, con el objetivo de hacer más robusto el comportamiento de rechazo ante peticiones dañinas de imagen y texto, incluso después de un ajuste fino benigno posterior.

El modelo conserva la arquitectura y el tamaño del original: 4.437.815.808 parámetros en BF16 (unos 8,9 GB en el repositorio), pipeline image-text-to-text y licencia Apache-2.0. La edición no requiere entrenamiento, optimizador ni retropropagación: se calcula a partir de lecturas de regresión ridge y diferencias de residuos en tres capas MLP concretas (14, 16 y 18).

Es relevante ahora porque aborda un problema práctico de despliegue: las salvaguardas de seguridad de un modelo alineado se degradan cuando se le aplica un ajuste fino benigno. Este trabajo propone una intervención quirúrgica y barata en el espacio de pesos para retener parte de esa capacidad de rechazo. El propio autor advierte de que los resultados son solo de conjunto de desarrollo y que la evaluación en held-out no se ha ejecutado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), vision-lenguaje con torre de visión y modelo de lenguaje |
| Parametros totales | 4.437.815.808 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible (evaluación limitada a entradas en inglés tipo VLGuard) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct en la revisión `ebb281ec70b05090aa6165b016eac8ec08e71b17`, un transformer multimodal que procesa entradas de imagen y texto. La intervención no modifica la arquitectura: config, processor, tokenizer y chat template son idénticos al original. Solo cambian tres tensores, `model.language_model.layers.{14,16,18}.mlp.down_proj.weight`, y el resto de los 713 tensores es bit-idéntico en BF16.

Cada uno de esos tres tensores recibe una actualización de rango 1, `ΔW = c · r · kᵀ` con `c = 2`. El vector `k` se obtiene mediante una regresión ridge (λ = 0,1) en el espacio oculto del MLP, calibrada para valer aproximadamente 1 en prompts dañinos y 0 en benignos en el último token del prompt. El vector `r` es la diferencia media del flujo residual entre prompts dañinos que el modelo original rechazaba y prompts dañinos que aceptaba, calculada en esa capa. Ambos vectores se estiman con pases forward del modelo fuente sobre un split de construcción del conjunto de entrenamiento VLGuard. No hubo entrenamiento, optimizador ni backward pass; el informe `wsp_edit_report.json` recoge los recuentos de cambios por tensor y los hashes de fichero.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de pares imagen-texto, heredadas del modelo base Qwen3-VL-4B-Instruct.
- Conversación multi-turno con plantilla de chat del modelo original.
- Rechazo reforzado ante peticiones dañinas de imagen y texto, con mayor resistencia a la erosión por ajuste fino benigno posterior.
- Edición aplicada de forma gradient-free: no requiere datos de entrenamiento en tiempo de inferencia ni pasos de optimización.
- Capacidades específicas del modelo base (tool calling, agentes, visión) no documentadas en la información disponible para esta variante.

## Casos de uso

- Investigación en seguridad de modelos multimodales: servir como punto de partida para estudiar cómo las ediciones en el espacio de pesos afectan al comportamiento de rechazo y a su persistencia tras ajuste fino.
- Despliegue de asistentes de visión con una capa adicional de robustez: el modelo puede usarse igual que el base en tareas de image-text-to-text, con un rechazo algo más consistente ante entradas dañinas.
- Evaluación de recetas de ajuste fino seguro: comparar la degradación de salvaguardas entre el modelo fuente y esta variante bajo distintas recetas de LoRA o fine-tuning completo.
- Filtrado previo en pipelines de moderación multimodal: usar el modelo como clasificador generativo de peticiones imagen-texto potencialmente dañinas en inglés.
- Base para experimentos de weight-space programming: replicar la metodología (regresión ridge, diferencias de residuos, actualización rank-1) en otras capas o modelos para estudiar transferibilidad.
- Prototipado de sistemas de seguridad en investigación académica: al ser Apache-2.0 y de 4,4B parámetros, permite iterar en hardware modesto sin depender de APIs externas.

## Benchmarks y rendimiento

Resultados preliminares del split de desarrollo del conjunto de entrenamiento VLGuard (384 elementos dañinos, 320 benignos, imágenes disjuntas de los datos de construcción). ASR = porcentaje de entradas dañinas aceptadas; ORR = porcentaje de entradas benignas rechazadas.

| Checkpoint | ASR | ORR |
|---|---|---|
| Modelo fuente | 47,4% | 0,0% |
| Modelo fuente + LoRA benigno | 54,2% | 0,0% |
| Este modelo + el mismo LoRA benigno | 37,8% | 0,3% |
| Este modelo, sin ajuste fino | ≈14,6% (estimación por filtro de palabras clave, no leída) | ≈0,6% |

Advertencias del autor: la diferencia frente al modelo fuente ajustado conlleva unos 4 puntos porcentuales de varianza entre lectores (una relectura ciega de los elementos disputados sitúa al modelo fuente ajustado cerca del 50%); solo se probó una receta de ajuste fino benigno (LoRA r=16, 1000 conversaciones benignas, 125 pasos); la mayor parte del efecto previo al ajuste fino se erosiona con el fine-tuning; y la evaluación se limita a entradas en inglés tipo VLGuard, sin pruebas de jailbreak adversarial.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9 GB solo para pesos, más overhead de activaciones y caché KV; con cuantización a 8 bits o 4 bits bajaría sustancialmente, aunque no se documentan cuantizaciones publicadas.
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en BF16 con margen.
- Cabe en GPU de consumo: sí, en tarjetas de 16-24 GB en BF16; en 12 GB probablemente requiera cuantización, no documentada.
- Opciones de despliegue: transformers (código de ejemplo con `Qwen3VLForConditionalGeneration` y `AutoProcessor`); vLLM, llama.cpp, Ollama o TGI no están documentados para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (WSP edit) | 4,44B | No disponible | Edición rank-1 en 3 tensores MLP | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-VL-4B-Instruct | 4,44B | No disponible | Alineación estándar del modelo base | Apache-2.0 | Hugging Face |
| Modelo fuente + LoRA benigno | 4,44B | No disponible | Sin salvaguarda adicional (ASR 54,2%) | Apache-2.0 | No publicado como checkpoint |

No se dispone de información sobre otras variantes de seguridad comparables de la familia Qwen3-VL en los datos proporcionados.

## Limitaciones y advertencias

- Artefacto de investigación preliminar: solo hay resultados de conjunto de desarrollo; la evaluación en held-out no se ha ejecutado y la selección de candidatos no es definitiva.
- No es una garantía de seguridad: el autor indica explícitamente que no debe usarse como única salvaguarda en un sistema desplegado.
- El efecto se erosiona con el ajuste fino: la edición reduce, pero no evita, la degradación de las salvaguardas tras fine-tuning.
- Solo se probó una receta de ajuste fino benigno (LoRA r=16, 1000 conversaciones, 125 pasos); otras recetas no están evaluadas.
- Evaluación limitada a entradas en inglés tipo VLGuard; sin pruebas de jailbreak adversarial ni de otros idiomas.
- La cifra de ASR sin ajuste fino (≈14,6%) es una estimación por filtro de palabras clave, no una lectura completa de respuestas.
- Riesgo de alucinación y sesgos del modelo base no evaluados en esta variante.
- Licencia Apache-2.0 heredada, sin restricciones comerciales adicionales documentadas, pero sin garantías de idoneidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnirudhNarayan/Qwen3-VL-4B-Instruct-safety-detailed-definition
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Informe de la edición: `wsp_edit_report.json` en el repositorio del modelo
- Conjunto de datos VLGuard: no disponible en la información proporcionada
- Paper o blog del método WSP: no disponible en la información proporcionada
