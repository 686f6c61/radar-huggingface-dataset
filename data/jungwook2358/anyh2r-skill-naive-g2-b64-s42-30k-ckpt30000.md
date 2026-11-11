# jungwook2358/anyh2r-skill-naive-g2-b64-s42-30k-ckpt30000

## Resumen

anyh2r-skill-naive-g2-b64-s42-30k-ckpt30000 es un checkpoint de un modelo de visión-lenguaje-acción (VLA) orientado a robótica, publicado por el usuario jungwook2358 en Hugging Face. Se trata de una réplica de un experimento de entrenamiento previo (denominado "skill-naive") dentro de una campaña de entrenamiento sobre diversidad de tareas, partiendo del modelo base RLDX-1-PT-IMG. El modelo está pensado para generar secuencias de acciones robóticas a partir de instrucciones e imágenes, con un chunk de 16 acciones por paso.

El checkpoint corresponde al paso 30.000 de entrenamiento, ejecutado sobre 2 GPU con batch global de 64 y semilla 42. El repositorio incluye los pesos en formato safetensors (tres shards), la configuración del entrenador, el procesador, estadísticas del dataset y un tokenizador de acciones propio de 100.000 entradas. El tamaño total del repositorio es de 13,8 GB.

La relevancia de esta ficha es limitada fuera del contexto de investigación en robótica: se trata de una réplica de un experimento concreto, sin model card descriptiva de capacidades, sin benchmarks publicados y con una licencia genérica "other" que no aclara los términos de uso. No obstante, documenta un pipeline reproducible de entrenamiento VLA con contratos de inferencia explícitos, lo que resulta útil para quien quiera reproducir o auditar el experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action); detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (3 shards + index), config.json, processor/ |

## Arquitectura y entrenamiento

El modelo es un VLA (vision-language-action) entrenado sobre el punto de partida RLDX-1-PT-IMG. El entrenamiento se realizó con 2 GPU, batch global de 64, semilla 42 y un total de 30.000 pasos ("VLA 30k"), con un chunk de 16 acciones por inferencia y "instruction renewal off" (sin renovación de instrucciones durante el entrenamiento). La model card indica que el código, las entradas preparadas, el entorno de Python y los hiperparámetros son idénticos a los del experimento original (con hashes sha256 fijados), y que solo difieren el propietario de la salida y el nombre del job.

El checkpoint incluye los estados del entrenador relevantes para reanudar o auditar el entrenamiento (trainer_state, scheduler, configuración del experimento con estadísticas del dataset), pero excluye los estados del optimizador de DeepSpeed y los estados del generador de números aleatorios. Se incluye además un tokenizador de acciones propio de tipo "split-decoder" con 100.000 entradas, junto con estadísticas (egopi_prq_stats.json) y un recibo de finalización. El repositorio incorpora dos ficheros de contrato: INFERENCE_CONTRACT.json (normalizadores, activos geométricos y etiqueta de despliegue) y diversity_contract.json (especificaciones del dataset).

## Capacidades

- Generación de secuencias de acciones robóticas a partir de observaciones visuales e instrucciones, en chunks de 16 acciones.
- Control de robots manipuladores en tareas de "skill" dentro de un régimen de diversidad de tareas (skill-naive).
- Integración con un tokenizador de acciones específico (split-decoder, 100.000 entradas).
- Uso de normalizadores y activos geométricos definidos en el contrato de inferencia.
- Capacidades de lenguaje natural y visión: no documentadas en la información disponible.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking", visión o audio especial: no disponible.

## Casos de uso

- Reproducción de experimentos de investigación en VLA: el repositorio incluye contratos de inferencia y diversidad, estadísticas del dataset y configuración del entrenador, lo que permite replicar el pipeline con fidelidad.
- Auditoría de entrenamiento: los ficheros trainer_state, scheduler y las estadísticas del dataset permiten analizar la curva de entrenamiento y la composición de datos.
- Evaluación comparativa de políticas robóticas: al ser una réplica de un experimento concreto, sirve como referencia para comparar variantes de entrenamiento (por ejemplo, con y sin renovación de instrucciones).
- Desarrollo de pipelines de inferencia robótica: el INFERENCE_CONTRACT.json define normalizadores y activos geométricos necesarios para desplegar el modelo en un entorno de control real.
- Investigación en tokenización de acciones: el tokenizador split-decoder de 100.000 entradas puede estudiarse o reutilizarse en otros modelos de acción.
- Formación y docencia: como ejemplo documentado de un checkpoint VLA con artefactos de reproducibilidad completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio es de 13,8 GB, pero incluye artefactos de entrenamiento además de los pesos).
- GPU recomendadas: no disponible; el entrenamiento se realizó con 2 GPU, modelo no especificado.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI; el pipeline es de robótica y requiere el contrato de inferencia propio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (VLA para robótica) con especificaciones que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos de uso comercial ni las restricciones; es necesario contactar con el autor antes de cualquier uso en producción.
- Se trata de una réplica de un experimento concreto, no de un modelo de propósito general; su validez está acotada al régimen de entrenamiento "skill-naive" y al dataset utilizado.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre un dataset específico de robótica, es probable que herede los sesgos y limitaciones de dicho dataset (no verificable con la información disponible).
- Riesgo de alucinación y de generalización fuera de distribución: no evaluado; no hay benchmarks publicados.
- Idiomas soportados: no disponible; no se puede garantizar el comportamiento multilingüe.
- El checkpoint excluye estados del optimizador y RNG, por lo que no es un punto de reanudación completo para entrenamiento.
- La inferencia requiere los ficheros de contrato (INFERENCE_CONTRACT.json, diversity_contract.json) y el tokenizador propio; sin ellos el modelo no es directamente utilizable.
- No hay información sobre latencia, throughput ni requisitos de hardware, lo que dificulta planificar un despliegue en producción.

## Enlaces

- [Hugging Face: jungwook2358/anyh2r-skill-naive-g2-b64-s42-30k-ckpt30000](https://huggingface.co/jungwook2358/anyh2r-skill-naive-g2-b64-s42-30k-ckpt30000)
- Referencia al experimento original: jun-brro/RLDX-1-egopi, rama feat/anyh2r-diversity-training, commit @fc72b51 (no se dispone de URL directa en la información proporcionada).
- Run original: junhyeong-anyh2r-skill-naive-g2-b64-s42-30k-1108-v3 (no se dispone de URL directa).
