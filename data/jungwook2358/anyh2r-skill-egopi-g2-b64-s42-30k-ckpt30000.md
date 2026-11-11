# jungwook2358/anyh2r-skill-egopi-g2-b64-s42-30k-ckpt30000

## Resumen

anyh2r-skill-egopi-g2-b64-s42-30k-ckpt30000 es un checkpoint de un modelo de visión-lenguaje-acción (VLA) entrenado para robótica, publicado en Hugging Face por el usuario jungwook2358. Se trata de una réplica de un experimento de entrenamiento previo (denominado "skill-egopi") dentro de una campaña de entrenamiento por diversidad de tareas llamada AnyH2R, sobre la base del modelo RLDX-1-PT-IMG. El checkpoint corresponde al paso 30.000 de entrenamiento y se distribuye con todos los artefactos necesarios para reproducir la inferencia: pesos en safetensors, configuración del procesador, estadísticas de normalización, tokenizador de acciones y contratos de inferencia.

El modelo sigue el paradigma VLA, en el que un transformer procesa instrucciones en lenguaje natural junto con observaciones visuales para producir secuencias de acciones motoras. Según la model card, emplea un "split-decoder action tokenizer" de 100.000 entradas y genera chunks de 16 acciones, con un batch global de 64 y semilla 42. No se especifican en la información disponible el número de parámetros, la longitud de contexto ni los idiomas soportados.

Su relevancia es acotada: se trata de un artefacto de investigación reproducible (réplica con código fijado por sha256) más que de un modelo listo para producción. El repo ocupa 13,8 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere un uso interno o de nicho dentro de un proyecto de investigación en robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) sobre base RLDX-1-PT-IMG; transformer con decodificador de acciones separado ("split-decoder") |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada, ver limitaciones) |
| Formato de pesos | safetensors (3 shards + índice), config.json, processor/, tokenizer propio |

## Arquitectura y entrenamiento

El modelo es un VLA construido a partir del checkpoint RLDX-1-PT-IMG, con un decodificador de acciones separado que utiliza un tokenizador de acciones de 100.000 entradas (actlat/model.safetensors, con estadísticas egopi_prq_stats.json). El entrenamiento se realizó con 2 GPUs, batch global de 64, semilla 42 y 30.000 pasos, con chunks de 16 acciones y "instruction renewal" desactivado. La model card indica que se usaron los mismos tarballs de código (fijados por sha256), entradas preparadas, entorno Python y parámetros que el run original, y que solo difieren el propietario de la salida y el nombre del job, lo que apunta a un experimento de reproducibilidad.

El checkpoint incluye el estado del entrenador (trainer_state, scheduler, recibo de transferencia) y excluye los estados del optimizador DeepSpeed y los estados RNG. También se distribuyen INFERENCE_CONTRACT.json (normalizadores, activos de geometría y etiqueta de despliegue necesarios para inferir) y diversity_contract.json (especificaciones del dataset). No se detallan en la información disponible la composición del dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de secuencias de acciones robóticas a partir de instrucciones en lenguaje natural y observaciones visuales (paradigma VLA).
- Producción de chunks de 16 acciones por paso de inferencia.
- Tokenización de acciones mediante un tokenizador dedicado de 100.000 entradas.
- Entrenado dentro de una campaña de diversidad de tareas ("skill-egopi"), orientado a habilidades específicas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible (la visión forma parte del pipeline VLA, pero no se detalla su tratamiento).

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint incluye contratos de inferencia, estadísticas de normalización y recibos de transferencia, lo que permite replicar exactamente el run original en un entorno controlado.
- Control de manipulación robótica en laboratorio: el modelo genera chunks de 16 acciones a partir de instrucciones, adecuado para tareas de pick-and-place o ensamblaje en bancos de prueba.
- Evaluación de diversidad de tareas: al formar parte de la campaña AnyH2R, sirve para comparar el rendimiento entre celdas de entrenamiento con distintas composiciones de datos.
- Punto de partida para fine-tuning: al estar basado en RLDX-1-PT-IMG y distribuirse con tokenizador y procesador, puede reutilizarse como inicialización para nuevas habilidades robóticas.
- Investigación en tokenización de acciones: el tokenizador split-decoder de 100.000 entradas y sus estadísticas permiten estudiar el efecto de la discretización de acciones en políticas VLA.
- Despliegue en simulación o gemelo digital: los activos de geometría y normalizadores del INFERENCE_CONTRACT.json facilitan integrar el modelo en entornos simulados antes de pasar a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 13,8 GB, lo que da una cota inferior aproximada para cargar los pesos en precisión original.
- GPU recomendadas: no disponible; el entrenamiento se realizó con 2 GPUs, pero no se especifica el modelo.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; el pipeline es robotics y requiere el contrato de inferencia propio).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (VLA para robótica) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia "other": es una licencia personalizada; es imprescindible revisar los términos antes de cualquier uso comercial, ya que no se garantiza permiso de explotación.
- Artefacto de investigación: es una réplica de un experimento concreto (semilla 42, batch 64, 30k pasos) y no un modelo validado para producción.
- Sin métricas publicadas: no hay benchmarks ni evaluaciones de rendimiento en la información disponible, por lo que no puede afirmarse su calidad frente a alternativas.
- Dependencia del contrato de inferencia: requiere INFERENCE_CONTRACT.json, normalizadores y activos de geometría para funcionar correctamente; un uso fuera de ese contrato puede producir acciones inválidas.
- Estados excluidos: no incluye estados del optimizador DeepSpeed ni estados RNG, lo que impide reanudar el entrenamiento exactamente desde este checkpoint.
- Idiomas y sesgos: no disponibles; al ser un modelo de robótica, los sesgos relevantes serían de distribución de tareas y entornos de entrenamiento, no documentados.
- Riesgo de alucinación: no evaluado; en VLA el fallo se manifiesta como acciones incorrectas o inseguras, con riesgo físico en hardware real.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/anyh2r-skill-egopi-g2-b64-s42-30k-ckpt30000
- Repositorio base citado en la model card: jun-brro/RLDX-1-egopi (rama feat/anyh2r-diversity-training, commit fc72b51), sin URL directa en la información disponible.
- Run original: junhyeong-anyh2r-skill-egopi-g2-b64-s42-30k-1108-v3, sin URL directa en la información disponible.
- Paper, blog, demo o repositorio adicionales: no disponibles.
