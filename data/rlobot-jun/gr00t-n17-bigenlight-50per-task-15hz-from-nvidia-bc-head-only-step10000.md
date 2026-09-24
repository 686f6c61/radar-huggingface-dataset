# RLobot-jun/gr00t-n17-bigenlight-50per-task-15hz-from-nvidia-bc-head-only-step10000

## Resumen

Este repositorio contiene un ajuste fino por clonación de comportamiento (behavior cloning, BC) del modelo robótico nvidia/GR00T-N1.7-3B, publicado por el usuario RLobot-jun. No es un modelo completo: incluye únicamente la cabeza de acción entrenada (pesos `action_head.*`), unos 6,48 GB en FP32, y debe reconstruirse junto con la base fijada de NVIDIA mediante el script `restore_bc.py` que acompaña al repositorio. El entrenamiento consistió en 10.000 pasos de BC sobre 200 demostraciones (4 tareas × 50 episodios: carrot, bowl stack, triple bowl stack y cube stack) remuestreadas de 30 Hz a 15 Hz.

El modelo opera exclusivamente a 15 Hz y genera chunks de acción de 16 × 7 (objetivos absolutos de seis articulaciones del brazo más gripper), lo que cubre aproximadamente 1,067 segundos por chunk. La arquitectura es la de GR00T N1.7: un modelo visión-lenguaje-acción con backbone VLM congelado y cabeza DiT de flow matching, que es la única parte ajustada junto con las proyecciones de observación/estado/acción y determinadas capas LayerNorm y de self-attention.

Su relevancia es acotada y experimental: permite reproducir y auditar un ajuste BC concreto sobre un embodiment nuevo (`NEW_EMBODIMENT`, robot `ur7e_gello`) sin reentrenar el backbone. Sin embargo, en el momento de la consulta acumula 0 descargas y 0 likes, no publica benchmarks y no ofrece ninguna garantía de seguridad o de éxito para despliegue en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA): backbone VLM congelado más cabeza de acción DiT entrenada con flow matching. Modelo denso, no MoE |
| Parametros totales | Aproximadamente 3.000 millones según el nombre del modelo base (nvidia/GR00T-N1.7-3B); la cabeza de acción incluida en este repositorio ocupa ~6,48 GB en FP32. Cifra exacta de parámetros no disponible |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en precisión mixta BF16; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | other / nvidia-license (NVIDIA License; ver `LICENSE` en el repositorio) |
| Formato de pesos | safetensors (solo `action_head.*`; el backbone se restaura desde la base fijada) |

## Arquitectura y entrenamiento

GR00T N1.7 es un modelo visión-lenguaje-acción. La percepción visual y el lenguaje los aporta un VLM congelado (la construcción descarga nvidia/Cosmos-Reason2-2B), mientras que la generación de acciones recae en una cabeza DiT entrenada con flow matching que produce chunks de 16 acciones × 7 dimensiones (objetivos absolutos de seis articulaciones más gripper) e incorpora propriocepción del robot. La inferencia por defecto usa 4 pasos de flow, el padding de processor/modelo es 40 × 132 y el embodiment declarado es `NEW_EMBODIMENT`, con `ur7e_gello` como robot del dataset.

El ajuste afecta solo a la cabeza: LLM y visión quedan congelados, y se entrenan las proyecciones de observación/estado/acción, las capas LayerNorm y self-attention posteriores al VLM (VL LayerNorm/self-attention) y la cabeza DiT/action head completa. Datos: 4 tareas × 50 episodios = 200 demostraciones, con decimación alineada de imagen, estado y acción de 30 Hz a 15 Hz. Hiperparámetros: batch 32, semilla 42, AdamW con LR 1e-4, schedule coseno sobre 10.000 pasos, 5 % de warmup (500 pasos) y precisión mixta BF16. Se conserva ColorJitter estándar de BC y state dropout 0. No se incluyen actualizaciones SVF ni IQL, ni crítico, ni adaptadores LoRA. El repositorio no es cargable con `AutoModel.from_pretrained`: requiere ejecutar el helper CPU `restore_bc.py`, que valida por hashes cada tensor omitido contra la revisión fijada `2fc962b973bccdd5d8ce4f67cc63b264d6886495` de la base.

## Capacidades

- Generación de acciones de manipulación robótica a 15 Hz, con chunks de 16 × 7 (seis articulaciones absolutas más gripper).
- Control de brazo robótico con propriocepción articular incluida en la observación.
- Ejecución multi-step implícita mediante action chunking: cada chunk cubre aproximadamente 1,067 segundos.
- Inferencia con flow matching en 4 pasos por defecto.
- Reutilización del pipeline de inferencia de GR00T N1.7 (policy/server existente) apuntando `model_path` al directorio restaurado.
- Integración de estadísticas de normalización y mapeo de embodiment ya incluidos en el repositorio.
- Soporte de tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-step en lenguaje: no documentado (el VLM se mantiene congelado).
- Capacidades multilingües: no disponible.
- Capacidades especiales declaradas: ninguna adicional (no hay modo thinking, visión ni audio documentados como capacidades de este checkpoint).

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo puede ejecutar agarre y colocación de objetos con un brazo `ur7e_gello` a 15 Hz, aprovechando que la cabeza está entrenada específicamente para ese embodiment y frecuencia.
- Apilado de objetos entrenados: las tareas de bowl stack, triple bowl stack y cube stack están representadas en las 200 demostraciones, por lo que el modelo puede reproducir apilados concretos dentro de la distribución de entrenamiento.
- Investigación en clonación de comportamiento: sirve como punto de partida controlado para comparar el efecto de 10.000 frente a 20.000 pasos, dado que los schedules coseno de ambos runs son distintos y están diferenciados por el autor.
- Reproducción y auditoría de experimentos: al restaurarse con verificación por hashes contra la base fijada, permite reproducir de forma exacta el checkpoint exportado y comprobar la integridad de la cabeza.
- Base para fine-tuning adicional: al ser una cabeza completa (no un adaptador LoRA) con processor y estadísticas de normalización, puede reentrenarse sobre nuevas tareas manteniendo el backbone congelado.
- Evaluación offline en simulación: el repositorio incluye processor, estadísticas de normalización y mapeo de embodiment, lo que permite ejecutar rollouts en simulación sin disponer del robot físico.
- Análisis de latencia de flow matching: con 4 pasos de flow y un chunk de 16 acciones a 15 Hz, es un banco de pruebas para medir el coste computacional de la decodificación por chunk.
- Recolección de nuevas demostraciones a 15 Hz: el pipeline de decimación 30 Hz → 15 Hz documentado facilita añadir datos coherentes con los usados en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta tasas de éxito, métricas de simulación ni comparaciones cuantitativas con otros modelos en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- Repositorio de cabeza únicamente: 6,5 GB de descarga; el helper `restore_bc.py` es CPU-only y requiere `torch`, `safetensors` y `huggingface_hub` (no necesita GPU).
- Checkpoint completo restaurado: requiere además la base nvidia/GR00T-N1.7-3B y, durante la construcción, nvidia/Cosmos-Reason2-2B. El tamaño exacto de la base no está especificado en la información disponible.
- VRAM estimada (estimación propia a partir de un backbone de ~3B más una cabeza de ~6,48 GB en FP32): en FP32, del orden de 18-20 GB; en BF16, del orden de 9-12 GB. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: para FP32, tarjetas de 24 GB o más (RTX 4090, L4, A10G); para evaluación a mayor escala o batch, A100 40/80 GB o H100. En consumer GPU de 16 GB (por ejemplo RTX 4080) sería necesario operar en BF16 y vigilar el margen de memoria.
- Opciones de despliegue: no se soportan vLLM, llama.cpp, Ollama ni TGI para este modelo; el uso previsto es el policy/server de GR00T N1.7 apuntando `model_path` al directorio restaurado, con el embodiment `NEW_EMBODIMENT`.
- Latencia y throughput: no disponibles. Como referencia de diseño, el chunk de 16 acciones a 15 Hz cubre aproximadamente 1,067 segundos y la inferencia por defecto usa 4 pasos de flow.
- Restricciones de memoria: los shards de cabeza restaurados son enlaces simbólicos, por lo que el repositorio `bc-head-10000` debe conservarse tras la restauración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (BC head, 15 Hz, 10.000 pasos) | Cabeza de acción ~6,48 GB FP32 sobre base de ~3B | no disponible | NVIDIA License (other) | HuggingFace, 0 descargas y 0 likes en la consulta |
| nvidia/GR00T-N1.7-3B (base) | ~3.000 millones (según nombre) | no disponible | NVIDIA License | HuggingFace, base oficial requerida en revisión fijada |
| Otras VLA de tamaño similar (por ejemplo OpenVLA, pi0, RDT-1B) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este checkpoint y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El modelo hereda el comportamiento del VLM congelado Cosmos-Reason2-2B, cuyos sesgos no se documentan aquí.
- Riesgo de alucinación: aplicable a la parte VLM heredada; no se han publicado evaluaciones al respecto para este checkpoint.
- Cobertura de tareas muy estrecha: solo 4 tareas y 200 demostraciones, por lo que es probable un rendimiento deficiente fuera de esa distribución.
- Frecuencia fija: entrenado exclusivamente a 15 Hz; el propio autor advierte de que no es un modelo de 30 Hz. Usarlo a otra frecuencia invalida las normalizaciones.
- Embodiment específico: etiqueta `NEW_EMBODIMENT` y robot `ur7e_gello`; la transferencia a otro hardware, cinemática o convención de gripper no está garantizada.
- Pesos incompletos: no incluye los pesos del VLM ni del backbone. Requiere la base fijada en una revisión concreta; sustituir revisiones arbitrarias de Cosmos o GR00T rompe la verificación por hashes.
- Carga no estándar: no es cargable con `AutoModel.from_pretrained`; hay que ejecutar el helper de restauración antes de usar el policy/server.
- Normalizaciones no intercambiables: el autor indica explícitamente que no deben sustituirse las estadísticas de normalización antiguas de 30 Hz por las de este paquete.
- Contenido excluido: no se incluyen optimizador, scheduler, RNG ni logs de entrenamiento, lo que dificulta reanudar el entrenamiento tal cual.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de funcionamiento.
- Restricciones de licencia: licencia NVIDIA (`other` / nvidia-license); el uso comercial queda sujeto a los términos del archivo `LICENSE` del repositorio, que deben revisarse antes de cualquier explotación.
- Sin garantía de seguridad: el autor declara explícitamente que no ofrece garantía de seguridad en despliegue ni de éxito, y recomienda comprobar frecuencia de control y convenciones de articulaciones/gripper antes de usar el modelo en un robot real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-task-15hz-from-nvidia-bc-head-only-step10000
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Revisión fijada de la base: 2fc962b973bccdd5d8ce4f67cc63b264d6886495
- VLM empleado en la construcción: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Código del autor: https://github.com/jun981015/gr00t-bigenlight/tree/q-vgm-critic
- Licencia: archivo `LICENSE` incluido en el repositorio de HuggingFace
