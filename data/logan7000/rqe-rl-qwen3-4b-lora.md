# logan7000/rqe-rl-qwen3-4b-lora

## Resumen

RQE-RL-Qwen3-4B-LoRA es una colección de adaptadores LoRA (r = 32) entrenados mediante aprendizaje por refuerzo con GRPO y auto-juego (self-play) sobre el modelo Qwen3-4B de Alibaba. Lo desarrolla el usuario logan7000 y se publica como artefacto de investigación centrado en teoría de juegos, concretamente en la resolución de juegos de equilibrio de respuesta cuantitativa (RQE, *response quantity equilibrium*). El objetivo no es un modelo conversacional de propósito general, sino estudiar si el RL sobre un modelo ya ajustado con SFT mejora la capacidad de razonar sobre equilibrios de Nash en juegos con múltiples asientos.

El repositorio contiene ocho adaptadores independientes, cada uno asociado a un paso distinto del SFT previo (1.000, 3.000 y 8.000 pasos) y a una variante de la recompensa (contra la media de las propias respuestas del modelo o contra el solver de referencia, con y sin penalización KL, con y sin normalización por desviación típica). El modelo base es un transformer denso de 4.000 millones de parámetros con licencia Apache 2.0, y los adaptadores se distribuyen en formato safetensors compatible con la librería PEFT.

La relevancia del artefacto es metodológica: documenta con detalle un experimento controlado sobre cuándo el RL desde SFT mejora una tarea de razonamiento estructurado y cuándo provoca deriva hacia estrategias uniformes. No está pensado para despliegue en producción, sino como material reproducible para investigadores interesados en RLHF/GRPO, auto-juego y evaluación de razonamiento en teoría de juegos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B) con adaptadores LoRA (r = 32) |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B); adaptadores LoRA adicionales de rango 32 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-4B; no especificada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer denso de 4.000 millones de parámetros. Sobre él se aplican adaptadores LoRA de rango 32 entrenados con GRPO (Group Relative Policy Optimization) en un régimen de auto-juego: un único modelo ocupa todos los asientos de cada partida. En cada paso se generan cuatro partidas nuevas y ocho respuestas muestreadas por asiento (temperatura 1,0 salvo en la variante `temp07`), y la recompensa se define como el negativo del gap RQE exacto de la línea `Final` de la respuesta. El entrenamiento usa un learning rate de 1e-5 y semilla 61116.

Los adaptadores se construyen en dos fases: primero se fusiona el adaptador SFT del paso correspondiente (procedente de `logan7000/rqe-sft-qwen3-4b-lora`) en Qwen3-4B, y después se carga el adaptador RL sobre el modelo fusionado. Las variantes exploran dos familias de recompensa (contra la media de las propias respuestas del modelo para los otros asientos, o contra el solver de referencia) y distintos ajustes: penalización KL de 0,02, ausencia de KL, omisión de grupos con las ocho respuestas correctas, temperatura 0,7 y ausencia de normalización por desviación típica del grupo. La evaluación se realiza sobre los mismos 200 ítems que la model card del SFT, considerando que un ítem se supera cuando el gap RQE de todos los asientos es inferior a 0,05.

## Capacidades

- Razonamiento sobre equilibrios en juegos de respuesta cuantitativa (RQE) con múltiples asientos.
- Generación de respuestas estructuradas con una línea `Final` evaluable de forma automática.
- Auto-juego: el mismo modelo puede adoptar el rol de todos los jugadores de una partida.
- Aprendizaje por refuerzo con GRPO y recompensas densas basadas en el gap respecto al equilibrio.
- Capacidades generales de Qwen3-4B (generación de texto, razonamiento, código y matemáticas) potencialmente conservadas, aunque no evaluadas en la model card.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Investigación en RLHF/GRPO: el artefacto permite reproducir el experimento comparando las ocho variantes de recompensa y los tres puntos de partida SFT (1.000, 3.000 y 8.000 pasos) para estudiar el efecto del RL sobre el razonamiento estructurado.
- Estudio de deriva de política: las variantes `from-sft1k-*` documentan la transición hacia estrategias uniformes, útiles para analizar cuándo el RL degrada una política ya competente.
- Benchmark de teoría de juegos: los 200 ítems de examen con verificación de suma corregida permiten evaluar modelos en tareas de equilibrio con corrección automática.
- Análisis de estabilidad del entrenamiento: las variantes con y sin penalización KL, con y sin normalización por desviación típica, sirven para estudiar la varianza de GRPO en tareas de recompensa continua.
- Auto-juego multi-asiento: el diseño en el que un solo modelo ocupa todos los asientos es reutilizable como plantilla para otros juegos con recompensa calculable.
- Docencia y divulgación: los adaptadores de pequeño tamaño (2,1 GB de repositorio) permiten demostrar un ciclo completo de SFT + RL en hardware modesto.
- Punto de partida para fine-tuning específico: el adaptador del paso 8.000 (94,0 % de acierto inicial) puede servir como base para tareas de razonamiento estratégico que requieran un modelo ya alineado con el formato de respuesta.

## Benchmarks y rendimiento

Los resultados publicados corresponden al porcentaje de ítems superados en el examen de 200 ítems (gap RQE < 0,05 en todos los asientos), medido al inicio y al final del entrenamiento RL.

| Adaptador | SFT de partida | Ajuste | Tasa de acierto (inicio -> fin) |
|---|---|---|---|
| `from-sft1k-selfplay-reward-s46` | paso 1.000 | recompensa self-play, KL 0,02 | 81,0 % -> 81,0 % |
| `from-sft1k-selfplay-reward-nokl-s34` | paso 1.000 | recompensa self-play, sin KL | Ver informe RL (no incluido en la model card) |
| `from-sft1k-solver-reward-s92` | paso 1.000 | recompensa solver | 79,5 % -> 82,0 % (paso 80) |
| `from-sft1k-solver-reward-skip-allpass-s40` | paso 1.000 | recompensa solver, sin gradiente en grupos con 8/8 aciertos | 79,0 % -> 72,5 % |
| `from-sft1k-solver-reward-temp07-s108` | paso 1.000 | recompensa solver, temperatura 0,7 | 81,0 % -> 80,5 % (paso 80) |
| `from-sft1k-solver-reward-nostd-s20` | paso 1.000 | recompensa solver, sin división por std del grupo | 81,0 % -> 81,0 % |
| `from-sft3k-solver-reward-s80` | paso 3.000 | recompensa solver | 88,5 % -> 92,5 % (p emparejado = 0,008) |
| `from-sft8k-solver-reward-s60` | paso 8.000 | recompensa solver | 94,0 % -> 93,5 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 2,1 GB, correspondiente a los adaptadores LoRA; el modelo base Qwen3-4B debe descargarse por separado.
- VRAM estimada para inferencia en FP16: aproximadamente 8-9 GB para el modelo base fusionado con un adaptador, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 4 bits: aproximadamente 3-4 GB para el modelo base, aunque la model card no documenta cuantizaciones probadas.
- GPU recomendadas: A100 40 GB, H100 80 GB o RTX 4090 24 GB para FP16 sin cuantizar; RTX 3090/4080 (16-24 GB) para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y modelos con al menos 8 GB de VRAM en FP16.
- Opciones de despliegue: PEFT para carga de adaptadores, transformers, vLLM (con soporte de LoRA), llama.cpp/Ollama tras conversión a GGUF (no documentada en la model card), TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RQE-RL-Qwen3-4B-LoRA (este) | 4.000 M + LoRA r=32 | No disponible | RL con GRPO y auto-juego sobre RQE | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3-4B (base) | 4.000 M | No disponible en esta ficha | Modelo conversacional generalista | Apache 2.0 | Hugging Face |
| RQE-SFT-Qwen3-4B-LoRA | 4.000 M + LoRA | No disponible | SFT sobre tareas RQE | Apache 2.0 | Hugging Face |
| Adaptadores GRPO de auto-juego comparables | No disponible | No disponible | RL con self-play | No disponible | No disponible |

No se dispone de datos de rendimiento de benchmarks estándar para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica explícitamente "Research artifact; no warranty", por lo que no está pensado para producción.
- Dominio muy restringido: entrenado exclusivamente para juegos RQE con formato de respuesta `Final`; no se ha evaluado su rendimiento en tareas generales.
- Deriva de política documentada: desde el paso SFT 1.000 las respuestas tienden hacia el juego uniforme, lo que degrada la calidad estratégica.
- Rendimiento plano o negativo en varias variantes: `skip-allpass` baja del 79,0 % al 72,5 % y `temp07` del 81,0 % al 80,5 %.
- Sin datos de sesgos, alucinación o comportamiento multilingüe: la model card no reporta evaluaciones de seguridad ni de idioma.
- Idiomas soportados no disponibles: no se especifica qué lenguas conserva el modelo tras el ajuste.
- Contexto no especificado: la model card no documenta la longitud de contexto efectiva tras el ajuste.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base Qwen3-4B conserva su propia licencia, que debe verificarse por separado.
- Procedimiento de uso no trivial: requiere fusionar primero el adaptador SFT del paso correspondiente y después cargar el adaptador RL, lo que añade pasos manuales y riesgo de error.
- Sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de reproducibilidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/logan7000/rqe-rl-qwen3-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Adaptador SFT previo: https://huggingface.co/logan7000/rqe-sft-qwen3-4b-lora
- Paper, blog o repositorio del autor: no disponible en la información proporcionada
- Demos: no disponibles en la información proporcionada
