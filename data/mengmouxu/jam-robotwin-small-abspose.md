# Mengmouxu/JAM-RoboTwin-Small-AbsPose

## Resumen

JAM-RoboTwin-Small-AbsPose es un checkpoint de política robótica (visuomotor policy) publicado por el usuario Mengmouxu en Hugging Face, orientado a tareas de manipulación en el simulador RoboTwin. El modelo combina un backbone visual DINOv3 de tamaño "small" con un predictor transformer y un actor determinista que genera comandos de acción en forma de deltas respecto al último comando emitido (command-delta), en lugar de coordenadas absolutas. Se distribuye como pesos de inferencia con EMA (media móvil exponencial) tras 100.000 batches de entrenamiento.

El artefacto es relevante para la comunidad de robótica porque documenta explícitamente su procedencia: incluye metadatos de checkpoint, normalización, tokenizer y configuración del backbone, además de un manifiesto con hashes SHA256. El autor advierte que este checkpoint no se entrenó con la mezcla completa Clean50 + Random500, sino con una población de 5.000 episodios (Clean50 + Random50 seleccionado), lo que acota su generalización.

Se trata de un modelo de nicho, sin descargas ni likes en el momento de la ficha, con licencia no declarada de forma explícita (se remite a los términos de los componentes upstream DINOv3, SigLIP y RoboTwin). Su uso previsto es la evaluación y reproducción de experimentos en RoboTwin mediante el repositorio de handover del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone visual DINOv3 small (embedding 384) + proyector (hidden 768) + predictor transformer (depth 6, 24 cabezas × dim_head 64, MLP 2048) + actor determinista (depth 4, hidden 384, 6 cabezas) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | Contexto de 12 pasos; horizonte futuro de 24 objetivos × 20 ms; replanificación cada 24 pasos |
| Tipos de cuantización | no disponible (checkpoint en PyTorch, presumiblemente FP32/FP16; no se documentan cuantizaciones) |
| Idiomas soportados | en, zh (instrucciones de tarea) |
| Licencia | no disponible (se remite a los términos de DINOv3, SigLIP y RoboTwin) |
| Formato de pesos | Checkpoint PyTorch (`.ckpt`) con pesos EMA de solo inferencia; incluye `checkpoint_manifest.json` con SHA256 |

## Arquitectura y entrenamiento

El modelo sigue un esquema de política visuomotora con tres vistas RGB más una instrucción en lenguaje natural como entrada. El backbone es un DINOv3 small con embedding de 384 dimensiones, del que se ajustan finamente los últimos 4 bloques del encoder. Un proyector de hidden 768 alimenta un predictor transformer de 6 capas con 24 cabezas de dimensión 64 y MLP de 2048, que produce futuros bidireccionales. El actor determinista (4 capas, hidden 384, 6 cabezas) decodifica comandos delta respecto al último comando emitido, usando la normalización de futuros almacenada y la referencia del comando actual.

El objetivo de entrenamiento es MSE sobre pose, con pesos de 64 para acción y 6 para el estado actual. El checkpoint publicado corresponde a 100.000 batches (100 épocas de 1.000 batches) con pesos EMA. La población de entrenamiento fue Clean50 más un Random50 seleccionado por tarea (5.000 episodios en total), usando el sampler del experimento original; el autor indica explícitamente que no se entrenó con la mezcla completa Clean50 + Random500 50:50. La validación reportada consiste en una replay bit a bit en CPU FP32 en la frontera RGB/política/ejecutor nativo con 44 arrays idénticos, lo que no equivale a una validación de simulación física, IK ni benchmark completo.

## Capacidades

- Generación de comandos de acción robótica en forma de deltas respecto al último comando emitido (command-delta), no coordenadas absolutas.
- Procesamiento de tres vistas RGB simultáneas junto con una instrucción de tarea en inglés o chino.
- Predicción de futuros bidireccionales con horizonte de 24 pasos a 20 ms por paso.
- Replanificación cada 24 pasos.
- Condicionamiento por instrucción en lenguaje natural (en, zh).
- Inferencia determinista mediante actor determinista y pesos EMA.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación reproducible en RoboTwin: el checkpoint se carga con `scripts/run_eval.sh` del repositorio de handover para reproducir los resultados del experimento de 100 épocas, gracias a los metadatos de normalización y tokenizer incluidos.
- Investigación en políticas command-delta: sirve como referencia para estudiar la decodificación de deltas frente a poses absolutas, ya que el autor documenta la referencia del último comando y la normalización de futuros.
- Comparación de checkpoints históricos: el checkpoint absoluto E50 está disponible en una revisión concreta y se ejecuta con `scripts/run_published_eval.sh` y el runtime `small_abs_pose_e50`, lo que permite comparar ambas formulaciones.
- Validación de pipelines de handover: los fixtures bit a bit de entrenamiento/reanudación y de evaluación/sesión permiten verificar que un runtime nuevo reproduce el comportamiento del original en CPU FP32.
- Base para reentrenamiento con la mezcla completa: el repositorio de GitHub proporciona una receta separada para el siguiente entrenamiento con Clean50 + Random500 50:50, usando este checkpoint como punto de partida.
- Estudio de ajuste fino parcial de backbones: al ajustarse solo los últimos 4 bloques del encoder DINOv3, es un caso práctico para analizar el coste y el efecto del fine-tuning parcial en políticas visuomotoras.
- Reproducción de inferencia sin simulador: los metadatos incluidos inicializan las estructuras del modelo al recargar, por lo que se puede ejecutar la política sin las cachés separadas del backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una validación de replay bit a bit en CPU FP32 con 44 arrays idénticos en la frontera RGB/política/ejecutor nativo, que no constituye un benchmark de éxito en simulación física ni de IK.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 1,5 GB, lo que sugiere que la inferencia en FP32 puede caber en GPUs de consumo, pero no se documenta una cifra oficial.
- GPU recomendadas: no disponible. No se especifican A100, H100 ni RTX 4090 en la información proporcionada.
- GPU de consumo: no confirmado; el tamaño del artefacto (1,5 GB) es compatible con GPUs de consumo, pero no hay datos oficiales de VRAM ni de latencia.
- Opciones de despliegue: el autor solo documenta el runtime PyTorch del repositorio `jam-robotwin-eval` (`scripts/run_eval.sh`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JAM-RoboTwin-Small-AbsPose | no disponible | 12 pasos de contexto, 24 de futuro | Sin benchmark publicado | no disponible | Hugging Face, 0 descargas |
| JAM-RoboTwin E50 (abs-pose) | no disponible | no disponible | Sin benchmark publicado | no disponible | Revisión `2e60207e...` del mismo repo |
| Otras políticas RoboTwin | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no se entrenó con la mezcla completa Clean50 + Random500 50:50, sino con 5.000 episodios (Clean50 + Random50 seleccionado), lo que limita su generalización frente a la receta actualizada.
- Los deltas de comando deben decodificarse con la normalización de futuros almacenada y la referencia del comando actual; ejecutarlos como coordenadas absolutas produce comportamiento incorrecto.
- La validación bit a bit no garantiza éxito en simulación física, IK, entrenamientos largos ni resultados de benchmark.
- No se incluye simulador, assets oficiales, datos de entrenamiento originales ni estado del optimizador; el reentrenamiento requiere los snapshots completos de DINOv3/SigLIP especificados en los manifiestos del repositorio.
- Cargar checkpoints históricos incompatibles con el código nuevo no está soportado; el E50 requiere el runtime `runtimes/small_abs_pose_e50`.
- Licencia no declarada de forma explícita; se aplican los términos upstream de DINOv3, SigLIP y RoboTwin, lo que genera incertidumbre para uso comercial.
- Idiomas limitados a inglés y chino en las instrucciones.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser una política robótica, el riesgo relevante es la ejecución de comandos erróneos en el entorno físico.
- Modelo sin tracción comunitaria (0 descargas, 0 likes) y con fecha de creación futura en los metadatos, lo que aconseja verificar la procedencia antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Mengmouxu/JAM-RoboTwin-Small-AbsPose
- Repositorio de código, setup, entrenamiento, re-renderizado y evaluación: https://github.com/Mengmouxu/jam-robotwin-eval
- Runbook de handover: `docs/handover/AGENT_RUNBOOK.md` (dentro del repositorio anterior)
- Script de evaluación de este checkpoint: `scripts/run_eval.sh` (dentro del repositorio anterior)
- Script de evaluación del E50 histórico: `scripts/run_published_eval.sh` (dentro del repositorio anterior)
- Revisión del checkpoint absoluto E50: `2e60207e69655f8dac3497fdaad4322a3634cba4`
