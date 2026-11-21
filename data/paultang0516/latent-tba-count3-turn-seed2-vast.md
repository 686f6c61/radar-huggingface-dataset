# paultang0516/latent-tba-count3-turn-seed2-vast

## Resumen

`paultang0516/latent-tba-count3-turn-seed2-vast` es un checkpoint de investigación publicado por el usuario paultang0516, resultado de un ajuste por aprendizaje por refuerzo (RL) sobre el modelo base Qwen2.5-3B-Instruct. No se trata de un modelo nuevo entrenado desde cero, sino de los pesos finales (paso 100) de un experimento de RL que aplica una variante de Tree-Backup Advantage (TBA) latente por turno sobre una tarea concreta denominada "count3". El objetivo del experimento es estudiar cómo se comporta el aprendizaje por refuerzo con retroalimentación oculta del verificador y una recompensa terminal binaria de resolución.

El modelo hereda la arquitectura y el tamaño del Qwen2.5-3B-Instruct original: un transformer decoder-only de aproximadamente 3.000 millones de parámetros y una ventana de contexto de 32.768 tokens según la especificación pública de Qwen2.5. El checkpoint se publica con el propósito de reproducir y continuar el entrenamiento, e incluye tanto los shards del modelo como los del optimizador en formato FSDP, además del estado necesario para reanudar la ejecución.

Su relevancia es acotada y fundamentalmente académica: sirve como artefacto reproducible para investigar métodos de RL con señales de ventaja latentes y para comparar semillas y configuraciones del mismo experimento. No está pensado como modelo de propósito general ni se ha evaluado con benchmarks estándar en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | ~3.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (según especificación de Qwen2.5-3B-Instruct; no verificada en este checkpoint) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | FSDP shards (modelo y optimizador); no se indica safetensors ni GGUF |
| Modelo base | Qwen/Qwen2.5-3B-Instruct (revision aa8e72537993ba99e69dfaafa59ed015b17504d1) |
| Metodo de entrenamiento | Aprendizaje por refuerzo con Tree-Backup Advantage latente por turno |
| Semilla | 2 |
| Checkpoint publicado | Paso 100 (final) |
| Tarea | count3 |
| Target TBA share | 0,2 (constante) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-3B-Instruct, un transformer decoder-only con atención por grupos (GQA) y RoPE, aunque la model card no detalla la configuración interna de capas ni cabezas. Lo relevante de este checkpoint no es la arquitectura base, sino el procedimiento de ajuste: un ciclo de aprendizaje por refuerzo que emplea una variante de Tree-Backup Advantage (TBA) aplicada de forma latente y por turno, sobre la tarea "count3". El entrenamiento parte de los pesos de Qwen2.5-3B-Instruct en la revisión `aa8e72537993ba99e69dfaafa59ed015b17504d1` y utiliza retroalimentación oculta del verificador junto con una recompensa terminal binaria que indica si la tarea se ha resuelto.

El experimento se ejecuta con la herramienta `latent-tba` (repositorio de WentseChen) y mantiene una proporción objetivo constante de TBA de 0,2. La publicación incluye únicamente el checkpoint del paso 100, con shards FSDP de modelo y optimizador y el estado necesario para reanudar el entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas adicionales de RLHF o DPO más allá de este ciclo de RL.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Qwen2.5-3B-Instruct.
- Ajuste específico para la tarea "count3" mediante RL con recompensa binaria de resolución.
- Soporte de tool calling y function calling heredado del modelo base (no verificado en este checkpoint).
- Capacidades multilingües heredadas del modelo base (idiomas no especificados en la información disponible).
- Capacidad de reanudar entrenamiento gracias a los shards de optimizador y estado incluidos.
- No se documentan capacidades especiales adicionales (modo thinking, visión, audio) en la información disponible.

## Casos de uso

- Reproducción de experimentos de RL: el checkpoint permite reanudar el entrenamiento desde el paso 100 con el estado de optimizador incluido, útil para replicar resultados o continuar con semillas y configuraciones distintas.
- Investigación en métodos de ventaja latente: sirve para estudiar el comportamiento de Tree-Backup Advantage por turno con recompensa terminal binaria en tareas de conteo.
- Comparación entre semillas: al publicarse con semilla 2 y target TBA de 0,2, permite contrastar con otras ejecuciones del mismo experimento.
- Análisis de la dinámica de RL con retroalimentación oculta del verificador: útil para examinar cómo la señal oculta afecta a la política aprendida.
- Docencia y formación: como ejemplo práctico de pipeline de RL con FSDP y checkpoints intermedios.
- Evaluación de robustez del modelo base bajo ajuste RL: permite medir si el ajuste degrada o preserva capacidades generales de Qwen2.5-3B-Instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB en FP16 para los ~3.000 millones de parámetros, sin contar overhead de activaciones ni caché KV; en cuantización de 8 bits rondaría los 3-4 GB y en 4 bits los 2 GB, aunque no se han publicado cuantizaciones para este checkpoint.
- GPU recomendadas: A100, H100 o RTX 4090 para entrenamiento y reanudación con FSDP; para inferencia en FP16 basta una GPU consumer con 8-12 GB.
- Cabe en GPU consumer: sí, en tarjetas con al menos 8 GB de VRAM para inferencia en FP16 (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070).
- Opciones de despliegue: al publicarse en shards FSDP, requiere consolidar los pesos antes de usar vLLM, llama.cpp, Ollama o TGI; no se proporcionan artefactos GGUF ni safetensors listos para inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| latent-tba-count3-turn-seed2-vast | ~3.000 M | 32.768 (heredado) | qwen-research | Checkpoint RL en HF |
| Qwen/Qwen2.5-3B-Instruct | ~3.000 M | 32.768 | qwen-research | Pesos completos en HF |
| Qwen/Qwen2.5-1.5B-Instruct | ~1.500 M | 32.768 | qwen-research | Pesos completos en HF |
| Meta-Llama-3.2-3B-Instruct | ~3.000 M | 128.000 | Llama 3.2 Community | Pesos completos en HF |

La comparación relevante es con el propio Qwen2.5-3B-Instruct, del que este checkpoint deriva; las diferencias se limitan al ajuste RL sobre la tarea count3 y no se han publicado métricas comparativas.

## Limitaciones y advertencias

- Checkpoint de investigación: no es un modelo de propósito general y no se ha evaluado con benchmarks estándar.
- Licencia qwen-research: restringe el uso comercial; es necesario revisar los términos de la Qwen Research License antes de cualquier despliegue.
- Formato FSDP: requiere consolidar shards antes de la inferencia, lo que añade complejidad operativa frente a un checkpoint safetensors convencional.
- Idiomas soportados no documentados en la información disponible.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen2.5-3B-Instruct, no evaluados en este checkpoint.
- Especialización en la tarea count3: el ajuste RL puede degradar capacidades generales fuera de esa tarea.
- Solo se publica el paso 100; no hay checkpoints intermedios para analizar la curva de aprendizaje.
- Sin cuantizaciones publicadas ni artefactos listos para Ollama o llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paultang0516/latent-tba-count3-turn-seed2-vast
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio del método: https://github.com/WentseChen/latent-tba
- Licencia Qwen Research: incluida en el repositorio del modelo (LICENSE)
- Aviso legal: incluido en el repositorio del modelo (NOTICE)
