# pengxiang/scene-opd-vla-teachers-v2

## Resumen

`scene-opd-vla-teachers-v2` es una colección de seis políticas de conducción autónoma ("teachers") publicadas por el investigador Pengxiang Li (The Hong Kong Polytechnic University) como parte de un pipeline de destilación on-policy (OPD) para un modelo VLA (vision-language-action) unificado. Cada subdirectorio contiene un fine-tune completo del mismo modelo base, Qwen3.5-0.8B (un VLM de 0,8 mil millones de parámetros), especializado en una única clase de escenas del benchmark NAVSIM: giros a la derecha, giros a la izquierda, ceder el paso/frenar, alta velocidad y conducción urbana en Pittsburgh y Singapur.

El modelo recibe 12 fotogramas de cámara más el estado del ego (velocidad, aceleración, etc.) y emite 8 tokens discretos de movimiento pertenecientes a un codebook de 2048 entradas (`kdisk2048`). El entrenamiento se realizó con Dr.GRPO (una variante de GRPO para aprendizaje por refuerzo) durante 2000 pasos, seleccionando el checkpoint con mejor PDMS en su propio subconjunto de navtest. La relevancia de esta publicación no reside en un modelo individual, sino en servir de material docente para destilar seis expertos (más la política general como fallback enrutado por clase de escena) en un único estudiante, que alcanza 89,67 PDMS en navtest frente a los 88,43 de la política general de partida.

El repositorio ocupa 20,5 GB e incluye seis checkpoints completos en formato `transformers` (safetensors, processor y tokenizer con los 2048 tokens `<act_*>`). Es un artefacto de investigación orientado a reproducir el pipeline de destilación, no un modelo listo para producción. No se han publicado descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLM (Qwen3.5-0.8B) adaptado a VLA con salida discreta de 8 tokens de movimiento |
| Parametros totales | 0,8 mil millones (modelo base Qwen3.5-0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors en precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoints `transformers` con processor y tokenizer) |

## Arquitectura y entrenamiento

La arquitectura subyacente es el VLM Qwen3.5-0.8B, adaptado a una tarea de visión-lenguaje-acción: la entrada combina 12 fotogramas de cámara con el estado del ego y la salida es una secuencia de 8 tokens discretos de movimiento muestreados de un codebook de 2048 entradas (`kdisk2048`). Cada uno de los seis checkpoints es un fine-tune de parámetros completos de la misma política general de RL, entrenado exclusivamente sobre una clase de escenas del split `navtrain` de NAVSIM.

El entrenamiento emplea Dr.GRPO con learning rate 1e-6, 16 prompts por grupo de 8 por paso, sin normalización de desviación estándar y 2000 pasos. Para cada clase de escena se conserva el checkpoint con mejor PDMS en su propio subconjunto de navtest (paso 1000 o 2000 según la clase). El pipeline completo de destilación on-policy se describe en el paper VLA-OPD (arXiv 2603.26666), que propone transferir comportamientos de múltiples teachers a un estudiante generalista con alta eficiencia de muestras.

## Capacidades

- Conducción autónoma end-to-end en el simulador NAVSIM: predicción de trayectorias como 8 tokens discretos de movimiento.
- Procesamiento multimodal de 12 fotogramas de cámara más estado del ego como entrada.
- Especialización por clase de escena: cada checkpoint está optimizado para giros a la derecha, giros a la izquierda, ceder el paso/frenar, alta velocidad o conducción urbana (Pittsburgh, Singapur).
- Salida discreta compatible con el codebook `kdisk2048` del código de entrenamiento de scene-opd-vla.
- Uso como teacher en destilación on-policy hacia un estudiante VLA unificado.
- No se ha documentado soporte de tool calling, agentes multi-paso, thinking mode, audio ni capacidades multilingües generales.

## Casos de uso

- Destilación on-policy de un estudiante VLA unificado: los seis checkpoints actúan como profesores especializados por clase de escena, enrutados junto con la política general como fallback, para producir un único estudiante que alcanza 89,67 PDMS en navtest.
- Investigación en aprendizaje por refuerzo para conducción: cada checkpoint permite analizar cómo Dr.GRPO especializa una política general en una clase concreta de escenas (por ejemplo, alta velocidad, con 92,71 PDMS en su propio subconjunto frente a 91,41 de la política general).
- Reproducción de experimentos NAVSIM: los checkpoints son completos y autónomos, lo que permite evaluar PDMS en navtest (12.146 escenas) con decodificación greedy sin reentrenar.
- Estudio de rutado por clase de escena: sirven para comparar estrategias de selección de profesor (por clase, por confianza o por fallback) en pipelines de destilación.
- Punto de partida para RL en escenas difíciles: el estudiante destilado a partir de estos teachers alcanza 90,13 PDMS tras RL específico en escenas difíciles, por lo que los teachers son la base de esa cadena.
- Benchmarking de VLA de pequeño tamaño: con 0,8 mil millones de parámetros, permiten medir el techo de rendimiento de un VLM pequeño en conducción autónoma frente a políticas dedicadas.

## Benchmarks y rendimiento

Resultados publicados por el autor en NAVSIM v1.1 PDMS, navtest (12.146 escenas), decodificación greedy:

| Checkpoint | Clase de escena | Paso conservado | PDMS navtest, subconjunto propio (política general) | PDMS navtest, conjunto completo |
|---|---|---|---|---|
| `right_turn/` | Giros a la derecha | 1000 | 86,28 (83,89) | 88,34 |
| `yield_brake/` | Ceder el paso / frenar | 2000 | 85,99 (83,48) | 88,44 |
| `left_turn/` | Giros a la izquierda | 1000 | 88,10 (86,39) | 88,72 |
| `high_speed/` | Alta velocidad | 1000 | 92,71 (91,41) | 88,44 |
| `city_pitt/` | Pittsburgh | 2000 | 88,57 (86,16) | 88,82 |
| `city_sg/` | Singapur | 2000 | 85,15 (84,11) | 88,57 |

Referencia: la política general de partida obtiene 88,43 PDMS en el conjunto completo. El estudiante destilado a partir de los seis teachers más el fallback alcanza 89,67, y tras RL en escenas difíciles llega a 90,13.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 0,8 mil millones de parámetros en FP16 requiere del orden de 1,6 GB solo para pesos, más el coste de procesar 12 fotogramas de cámara; el autor no publica cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamaño de parámetros (0,8 B) es plausible en GPUs de consumo con suficiente VRAM, pero no hay datos publicados.
- Opciones de despliegue: los checkpoints son `transformers` estándar (safetensors, processor y tokenizer), por lo que se cargan con la librería `transformers`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento NAVSIM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `scene-opd-vla-teachers-v2` (este) | 0,8 B | no disponible | 85,15–92,71 PDMS por subconjunto; 88,34–88,82 en conjunto completo | apache-2.0 | Hugging Face |
| Política general de partida (mismo base) | 0,8 B | no disponible | 88,43 PDMS en conjunto completo | no disponible | Referenciada en la model card |
| Estudiante destilado (resultado del pipeline) | no disponible | no disponible | 89,67 PDMS; 90,13 tras RL en escenas difíciles | no disponible | No publicada como checkpoint en este repo |

No se dispone de datos publicados de otros VLA de conducción autónoma comparables en la información proporcionada.

## Limitaciones y advertencias

- Son políticas especializadas por clase de escena: su rendimiento en el conjunto completo (88,34–88,82 PDMS) es similar o ligeramente inferior al de la política general (88,43), por lo que no deben usarse individualmente como política general.
- El rendimiento está medido exclusivamente en el simulador NAVSIM v1.1 (navtest, 12.146 escenas); no hay validación en vehículo real ni en otros entornos.
- La salida es discreta (8 tokens de un codebook de 2048 entradas) y depende del código de entrenamiento de scene-opd-vla; no es un modelo de propósito general.
- No se documentan sesgos, idiomas soportados ni comportamiento fuera de la distribución de NAVSIM.
- No se han publicado resultados de benchmarks fuera de NAVSIM, ni datos de latencia o requisitos de hardware.
- Licencia apache-2.0 permite uso comercial del artefacto, pero el modelo base Qwen3.5-0.8B puede tener condiciones adicionales que deben verificarse; el autor no detalla restricciones específicas.
- El repositorio tiene 0 descargas y 0 valoraciones, por lo que no existe validación independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pengxiang/scene-opd-vla-teachers-v2
- Perfil de Google Scholar del autor: https://scholar.google.com/citations?user=rUp_4RgAAAAJ&hl=en
- Paper VLA-OPD (alphaXiv): https://www.alphaxiv.org/abs/2603.26666.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
