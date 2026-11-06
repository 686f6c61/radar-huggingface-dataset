# Cyan666/HandsOn-Checkpoints

## Resumen

HandsOn-Checkpoints es un repositorio de pesos publicado por el usuario Cyan666 que reúne los ocho checkpoints multi-tarea seleccionados en el artículo *HandsOn: A Large-Scale Simulation Benchmark for Generalizable Dexterous Manipulation* (arXiv 2610.26765), un benchmark de simulación a gran escala para manipulación diestra generalizable. No se trata de un modelo único, sino de una colección de políticas visión-lenguaje-acción (VLA) y modelos mundo-acción (WAM) ya entrenados por terceros (π0.5, DM0.5, HY-Embodied-0.5-VLA, LingBot-VLA, OpenWAM, FastWAM, Motus y Spatial Forcing) y afinados sobre el benchmark HandsOn.

El repositorio conserva los formatos nativos de cada checkpoint (árboles Orbax `params/` y contenedores DCP `state/`), de modo que no son paquetes `transformers.AutoModel` ni pesos listos para usar con pipelines estándar. La inferencia requiere los adaptadores del repositorio de código del proyecto (TsinghuaC3I/HandsOn), que preservan la normalización, el preprocesado de imagen, el proceso de denoising y los horizontes de acción específicos de cada política.

Su relevancia es la de un artefacto de reproducibilidad: permite a investigadores comparar políticas heterogéneas bajo un mismo protocolo de evaluación de manipulación diestra en simulación. La subida está marcada como en curso y solo se considera completa cuando exista `UPLOAD_VERIFIED.json` listando los ocho modelos. No hay descargas ni likes registrados y la licencia no está declarada en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Colección de políticas VLA y modelos mundo-acción (WAM); arquitectura concreta por checkpoint no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuyen pesos nativos sin cuantizar) |
| Idiomas soportados | en |
| Licencia | no disponible (rígen las licencias de los modelos fundacionales de origen) |
| Formato de pesos | Formatos nativos: árboles Orbax `params/` y contenedores DCP `state/`; algunos en PyTorch (`mp_rank_00_model_states.pt`) |

## Arquitectura y entrenamiento

El repositorio agrupa ocho checkpoints con arquitecturas heterogéneas, no una sola. Según la model card, se incluyen π0.5 (paso de optimizador 120.000), DM0.5 (86.000), HY-Embodied-0.5-VLA (125.000), LingBot-VLA (151.000), OpenWAM (70.000), FastWAM (100.000), Motus (100.000) y Spatial Forcing (90.000). Los cuatro primeros son políticas VLA; OpenWAM, FastWAM y Motus pertenecen a la familia de modelos mundo-acción; Spatial Forcing es una política con normalización propia. La selección es fija según el artículo y no se basa en el éxito en el benchmark.

El entrenamiento se realizó mediante fine-tuning sobre el benchmark HandsOn, con datos del dataset `Cyan666/HandsOn-Datasets`. No se especifican en la información disponible el número de tokens, la composición del dataset, ni si hubo RLHF o DPO. Los checkpoints conservan el estado de entrenamiento nativo (DCP y contenedores PyTorch pueden incluir estado de entrenamiento); se omiten el estado del optimizador standalone de π0.5 y las instantáneas RNG de OpenWAM. Los pesos de los modelos fundacionales, tokenizadores y cachés de lenguaje de FastWAM/Motus se distribuyen por separado y deben obtenerse de sus publicadores originales.

## Capacidades

- Manipulación diestra robótica en simulación: generación de comandos de efector final absolutos (EEF52) a 30 Hz, ordenados brazo/mano derecha y luego brazo/mano izquierda.
- Políticas visión-lenguaje-acción: integran observación visual e instrucciones en lenguaje para producir acciones.
- Modelos mundo-acción: modelan la dinámica del entorno para planificación y predicción de acciones.
- Evaluación multi-tarea: los ocho checkpoints están afinados para el conjunto de tareas del benchmark HandsOn.
- Inferencia mediante adaptadores específicos por checkpoint que preservan normalización, preprocesado de imagen, denoising y horizontes de acción.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, matemáticas o visión general fuera del contexto robótico.

## Casos de uso

- Reproducción de resultados del artículo HandsOn: cargar cada checkpoint con su perfil `--model` del guide de integración para replicar las evaluaciones publicadas en el benchmark de manipulación diestra.
- Comparación de políticas VLA frente a modelos mundo-acción: usar los ocho checkpoints bajo el mismo evaluador nativo a 30 Hz para analizar diferencias de comportamiento entre familias arquitectónicas.
- Investigación en manipulación diestra: emplear los checkpoints como línea base afinada para estudiar generalización a nuevas tareas dentro del benchmark.
- Desarrollo de adaptadores de inferencia: el repositorio sirve para validar los adaptadores de `scripts/serve_paper_policy.py` y el pipeline de normalización por checkpoint.
- Estudio de formatos de checkpoint: analizar la preservación de árboles Orbax y contenedores DCP para investigar interoperabilidad entre frameworks de entrenamiento.
- Docencia y formación en robótica: usar los checkpoints como material didáctico para ilustrar políticas VLA y modelos mundo-acción en simulación, dado que no requieren hardware físico.
- Auditoría de reproducibilidad: verificar integridad de almacenamiento y transferencia mediante `UPLOAD_VERIFIED.json` (tamaños y SHA256) en flujos de investigación reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo (arXiv 2610.26765) para los resultados, pero no incluye cifras en el repositorio. Cargar un checkpoint por sí solo no reproduce el protocolo de evaluación del artículo ni certifica un nuevo rollout.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican tamaños de parámetros ni requisitos por checkpoint).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante `scripts/serve_paper_policy.py` del repositorio TsinghuaC3I/HandsOn, con perfiles `--model` por checkpoint. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el evaluador nativo opera a 30 Hz, pero no se publican cifras de latencia ni throughput por modelo.
- Almacenamiento: los tamaños de archivo por checkpoint se registran en `CHECKPOINTS.json`; no se detallan en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HandsOn-Checkpoints (π0.5) | Política VLA | no disponible | no disponible | no disponible | Pesos nativos en HF |
| HandsOn-Checkpoints (OpenWAM) | Modelo mundo-acción | no disponible | no disponible | no disponible | Pesos nativos en HF |
| HandsOn-Checkpoints (Spatial Forcing) | Política VLA | no disponible | no disponible | no disponible | Pesos nativos en HF |

No se dispone de datos de rendimiento ni de especificaciones de parámetros y contexto para establecer una comparativa cuantitativa con alternativas externas. La comparación relevante es interna: los ocho checkpoints compiten entre sí bajo el mismo benchmark HandsOn.

## Limitaciones y advertencias

- La subida está marcada como en curso; la release solo se considera completa cuando exista `UPLOAD_VERIFIED.json` con los ocho modelos listados.
- No son paquetes `transformers.AutoModel`: requieren los adaptadores del repositorio de código y no funcionan con pipelines estándar.
- Los pesos fundacionales, tokenizadores y cachés de lenguaje de FastWAM/Motus se distribuyen por separado; deben obtenerse de sus publicadores originales y respetar sus términos.
- Las licencias de los modelos y componentes de origen siguen aplicando; este repositorio no las reemplaza ni amplía. La licencia propia no está declarada, lo que impide determinar condiciones de uso comercial.
- La selección de checkpoints es fija según el artículo, no la mejor por éxito en benchmark; puede no representar el máximo rendimiento de cada familia.
- Cargar un checkpoint no reproduce el protocolo de evaluación del artículo ni certifica un nuevo rollout.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser políticas robóticas en simulación, el riesgo se traslada a comportamientos de manipulación no validados fuera del benchmark.
- Idiomas: solo se declara inglés (`en`), lo que limita instrucciones en otros idiomas.
- Uso limitado a simulación; no se documenta validación en hardware físico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Cyan666/HandsOn-Checkpoints
- Artículo (arXiv): https://arxiv.org/abs/2610.26765
- Código y adaptadores de inferencia: https://github.com/TsinghuaC3I/HandsOn
- Dataset: https://huggingface.co/datasets/Cyan666/HandsOn-Datasets
- Guía de integración de modelos: https://github.com/TsinghuaC3I/HandsOn/blob/main/docs/paper-models.md
- Avisos de origen de las políticas: https://github.com/TsinghuaC3I/HandsOn/blob/main/docs/policy-source-notices.md
