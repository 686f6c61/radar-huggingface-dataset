# 1lock/zils-mini-astrid-m1

## Resumen

Zils-mini-astrid-m1 es un ajuste fino de pesos completos (full-weight) publicado por el usuario 1lock bajo licencia Apache-2.0, concebido como cuerpo de decisión para la subnet 127 de Bittensor (Zils). El modelo parte de la media uniforme de pesos de cuatro cuerpos d3-mini de licencia Apache-2.0 (torchcast-ai/torchcast-decision-4b, perplexity-ai/pplx-decider-flash-v1.2, vllm-sr/d3-mini y Maincode/Matilda-Decision-v1-Mini) y se ajusta mediante LoRA de rango 32 sobre atención y MLP, fusionada posteriormente en los pesos. El resultado es un checkpoint de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) en formato BF16 y safetensors, con un tamaño de repositorio de 9,1 GB.

La relevancia del modelo es acotada y muy específica: no es un modelo conversacional generalista, sino un cuerpo entrenado para el formato de examen de decisión propio del runtime de Zils, con una lectura de respuesta fija (fixed answer readout). El autor reporta una puntuación en solitario de 85,6 sobre las semillas públicas de examen (zils-ai/base-exam-seed-v1..v4), frente a 76,4 de torchcast-decision-4b, aunque reconoce que en una ventana reservada de los streams públicos de Zils Outcomes el modelo queda ligeramente por debajo de torchcast. Se trata, por tanto, de un artefacto de investigación orientado a la competición en subnet, no de un modelo de propósito general.

La información disponible sobre arquitectura interna, idiomas, contexto y benchmarks estándar es muy limitada: la model card no detalla la arquitectura del chasis d3-mini ni la longitud de contexto, y no se publican resultados de MMLU, HumanEval o GSM8K. El modelo base declarado en los metadatos incluye Qwen/Qwen3.5-4B, lo que sugiere una arquitectura de tipo transformer denso de aproximadamente 4B parámetros, pero este dato no se confirma en la documentación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (inferido del linaje Qwen/Qwen3.5-4B; no confirmado en la model card) |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se construye en el layout fijo del chasis d3-mini, en precisión BF16. El proceso de creación consta de dos fases. Primero se calcula la media uniforme de pesos (model soup) de cuatro cuerpos d3-mini Apache-2.0: torchcast-ai/torchcast-decision-4b en la revisión 492bfb19, perplexity-ai/pplx-decider-flash-v1.2 en 9ff7cf98, vllm-sr/d3-mini en df99bf4c y Maincode/Matilda-Decision-v1-Mini en 39479a8a. Esta media se realiza con el constructor de soups de Zils. En segundo lugar, se aplica un ajuste fino con LoRA de rango 32 sobre las capas de atención y MLP, que se fusiona en los pesos finales.

El entrenamiento se ejecuta sobre el runtime d3 de Zils con su lectura de respuesta fija, durante una época sobre aproximadamente 5.600 ítems de decisión en formato de examen, redactados a partir de splits TRAIN públicos con licencias que permiten uso comercial. La función de pérdida combina entropía cruzada suave (soft cross-entropy) con pérdida de Brier, más un anclaje KL al modelo de partida para limitar la deriva respecto al punto inicial. Los ítems redactados se deduplicaron de forma exacta y casi duplicada contra las semillas de examen y contra los splits de validación y test reservados de los datasets de origen. No se menciona en la información disponible el uso de RLHF o DPO.

## Capacidades

- Clasificación y decisión en formato de examen: el modelo está ajustado específicamente para producir respuestas en el formato de examen de decisión de Zils, con una lectura de respuesta fija.
- Razonamiento de elección múltiple: los ítems de entrenamiento son de tipo decisión, lo que orienta al modelo hacia tareas de selección entre opciones.
- Calibración probabilística: el uso de pérdida de Brier en el entrenamiento sugiere una orientación a producir probabilidades calibradas, aunque no se publican métricas de calibración.
- Generación de texto: capacidad heredada del linaje Qwen3.5-4B, no verificada ni documentada por el autor.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Modo thinking, visión o audio: no disponible; no se documenta ninguna capacidad multimodal.

## Casos de uso

- Evaluación en la subnet 127 de Bittensor (Zils): el modelo se usa como cuerpo de decisión dentro del runtime d3 de Zils, donde responde a ítems en formato de examen. Es su caso de uso primario y el único documentado explícitamente por el autor.
- Investigación sobre model soups: sirve como ejemplo reproducible de combinación de cuatro checkpoints Apache-2.0 mediante media uniforme de pesos seguida de LoRA de rango 32, útil para estudiar la transferencia entre cuerpos del mismo chasis.
- Estudio de calibración con pérdida de Brier: el esquema de entrenamiento (soft cross-entropy + Brier + anclaje KL) puede replicarse para analizar cómo afecta la calibración probabilística en tareas de decisión acotadas.
- Benchmark de decisiones sintéticas: los aproximadamente 5.600 ítems de examen y las semillas públicas zils-ai/base-exam-seed-v1..v4 permiten construir pipelines de evaluación controlados para comparar variantes del chasis d3-mini.
- Punto de partida para ajustes posteriores: al ser un checkpoint BF16 de pesos completos con licencia Apache-2.0, puede servir como base para nuevos ajustes LoRA en dominios de decisión específicos.
- Comparación de linajes Qwen3.5-4B: para equipos que evalúan derivados del mismo modelo base, este checkpoint aporta un punto de referencia adicional en tareas de elección múltiple, siempre que se validen sus capacidades generales fuera del formato de examen.

## Benchmarks y rendimiento

| Benchmark | Zils-mini-astrid-m1 | torchcast-decision-4b |
|---|---|---|
| Semillas públicas de examen Zils (zils-ai/base-exam-seed-v1..v4), puntuación en solitario | 85,6 | 76,4 |
| Ventana reservada de streams públicos de Zils Outcomes | Ligeramente por debajo de torchcast (sin cifra publicada) | Referencia |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 12-16 GB de VRAM para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB de pesos, con un mínimo práctico de 8 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,3-2,8 GB de pesos, con un mínimo práctico de 6 GB; los tipos de cuantización concretos no están documentados por el autor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue en BF16 con lotes grandes; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en BF16 con contexto moderado.
- GPU de consumo: cabe en tarjetas de 8 GB o más si se cuantiza a 8 o 4 bits; en BF16 requiere al menos 12 GB.
- Opciones de despliegue: al ser un checkpoint safetensors estándar, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión); el autor no documenta ninguna integración concreta.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zils-mini-astrid-m1 | 4,54B | No disponible | Apache-2.0 | HuggingFace (1lock) | Ajuste LoRA sobre soup de cuatro cuerpos d3-mini; 85,6 en semillas de examen Zils |
| torchcast-ai/torchcast-decision-4b | No disponible | No disponible | Apache-2.0 | HuggingFace | Cuerpo de partida del soup; 76,4 en semillas de examen Zils; mejor en Outcomes según el autor |
| perplexity-ai/pplx-decider-flash-v1.2 | No disponible | No disponible | Apache-2.0 | HuggingFace | Cuerpo de partida del soup; sin métricas publicadas en la información disponible |
| Maincode/Matilda-Decision-v1-Mini | No disponible | No disponible | Apache-2.0 | HuggingFace | Cuerpo de partida del soup; sin métricas publicadas en la información disponible |

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado al examen de decisión de Zils y el propio autor advierte que no está optimizado para ítems de Outcomes, donde rinde ligeramente por debajo de torchcast-decision-4b.
- Riesgo de sobreajuste al formato: al entrenarse una época sobre aproximadamente 5.600 ítems con lectura de respuesta fija, el comportamiento fuera de ese formato no está garantizado ni documentado.
- Sesgos: no se documenta ningún análisis de sesgos; los ítems de entrenamiento provienen de splits TRAIN públicos y su composición no se detalla.
- Alucinación: no se publican evaluaciones de veracidad ni de tasa de alucinación; al ser un modelo de decisión, el riesgo se traslada a la selección de opciones incorrectas con alta confianza.
- Idiomas: no se declaran idiomas soportados; se desconoce si conserva las capacidades multilingües del linaje Qwen3.5-4B.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento fuera del dominio de examen; conviene verificar la licencia de los datasets de origen de los ítems de entrenamiento antes de un uso comercial.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado benchmarks estándar, lo que limita la validación independiente.
- Fecha de creación: los metadatos indican 2026-11-05, una fecha posterior a la actual, lo que sugiere un posible error de marcado temporal en el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/1lock/zils-mini-astrid-m1
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo de partida: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Cuerpo de partida: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Cuerpo de partida: https://huggingface.co/vllm-sr/d3-mini
- Cuerpo de partida: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Semillas de examen: https://huggingface.co/zils-ai/base-exam-seed-v1 (v1..v4)
