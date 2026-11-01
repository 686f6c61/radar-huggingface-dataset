# lhl616/qwen3-soft-weight-rkl-20260929-checkpoints

## Resumen

El repositorio `lhl616/qwen3-soft-weight-rkl-20260929-checkpoints` es un archivo de checkpoints de investigación, no un modelo listo para usar con `from_pretrained`. Recoge los resultados de un estudio de destilación con vocabulario completo sobre una configuración Qwen3-4B, con tres exportaciones finales (`full_pool_uncapped`, `soft_sum_q80` y `soft_mean_q80`), un checkpoint intermedio de reanudación (`soft_mean_q80/resume/step001120`) y el estudiante original `soft_mean` en FP32 que sobrevivió al proceso. Lo publica el usuario `lhl616` bajo licencia Apache 2.0, con un tamaño de repositorio de 41,8 GB.

El interés del artefacto es metodológico: documenta una comparación entre distintas variantes de destilación con pesos suaves (soft weights) y regularización KL inversa (RKL), incluyendo detalles poco habituales como cabezas de crítica con 101 logits sobre bins HL-Gauss en el rango [-1,2, 1,2]. No es un modelo conversacional ni un checkpoint de política PPO: el autor lo desmarca explícitamente de experimentos con crítico PPO y advierte que las ramas de continuación no son evaluaciones pareadas intercambiables.

La relevancia práctica es limitada para producción, pero alta para quien quiera reproducir o auditar estudios de destilación sobre Qwen3-4B. El repositorio conserva capacidades de evaluación del modelo, pero excluye estados del optimizador, por lo que no permite continuar el entrenamiento de forma exacta ni garantiza validación de forward pass solo por la publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (configuración Qwen3-4B; detalles de capas no disponibles) |
| Parametros totales | No disponible (configuración Qwen3-4B, sin recuento publicado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se mencionan exportaciones BF16 y fuente FP32; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y checkpoints PyTorch `.pt` (FSDP, shards `model_world_size_4_rank_*.pt`) |

## Arquitectura y entrenamiento

El material describe checkpoints de un estudio de destilación con vocabulario completo sobre una configuración Qwen3-4B. Se distinguen dos familias: por un lado, ejecuciones de la familia PPO derivadas de `Qwen/Qwen3-4B-Base`; por otro, las exportaciones separadas de destilación con pesos suaves, que usan configuración Qwen3-4B pero no deben tratarse como la misma receta de entrenamiento. Las variantes publicadas son `full_pool_uncapped`, `soft_sum_q80` y `soft_mean_q80`, más el estudiante `soft_mean` original en FP32 y un checkpoint de reanudación en el paso 1120.

El entrenamiento emplea FSDP con cuatro shards por checkpoint y utilidades de carga/merge compatibles con PyTorch y VERL. Las críticas nativas no son modelos causales ordinarios: usan una cabeza escalar de valor y, en la variante HL-Gauss, 101 logits sobre bins que cubren [-1,2, 1,2], con centros `-1.2 + (i+0.5)*2.4/101` y valor calculado como media ponderada por softmax en FP32; los objetivos gaussianos usan sigma `0.75*2.4/101`. El archivo categórico incluye además una pequeña implementación de referencia matemática que depende del entorno VERL original para sus hooks de entrenamiento.

## Capacidades

- Preservación de capacidad de evaluación del modelo base Qwen3-4B, según declara el autor.
- Exportaciones de destilación con pesos suaves en tres variantes (`full_pool_uncapped`, `soft_sum_q80`, `soft_mean_q80`).
- Checkpoint de reanudación intermedio (`soft_mean_q80/resume/step001120`) para inspección del proceso.
- Estudiantes FP32 originales (`soft_mean`) conservados con su precisión y bytes originales.
- Críticas con cabeza escalar de valor y variante HL-Gauss de 101 bins.
- No se documentan tool calling, agentes, visión, audio ni modo thinking en la información disponible.
- No se documenta soporte multilingüe específico.

## Casos de uso

- Reproducción de estudios de destilación: cargar los shards FSDP con las utilidades de merge de VERL para comparar las tres variantes de exportación frente al estudiante FP32 original.
- Auditoría de metodología: inspeccionar la implementación de referencia matemática incluida en el archivo categórico para verificar el cálculo de valores en la cabeza HL-Gauss.
- Investigación sobre regularización KL inversa: usar los checkpoints como punto de partida para análisis comparativos de RKL en destilación con vocabulario completo.
- Docencia y formación: estudiar un caso real de organización de checkpoints por experimento y paso, con manifiesto de cobertura y notas de redacción de rutas internas.
- Evaluación de estabilidad: ejecutar forward passes sobre los checkpoints exportados para medir degradación respecto al estudiante FP32, asumiendo que la validación no está garantizada por la publicación.
- Archivado a largo plazo: conservar copias de los tensores originales sin modificar, dado que el repositorio preserva precisión y bytes de los shards fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 41,8 GB, lo que sugiere múltiples checkpoints y precisiones mezcladas (FP32 y BF16) sobre una configuración de 4B.
- GPU recomendadas: no disponibles; el entrenamiento usó FSDP con cuatro shards, lo que implica al menos cuatro rangos de proceso.
- Cabe en GPU de consumo: no confirmado; un modelo de 4B en BF16 ronda los 8 GB de pesos, pero el repositorio no es un modelo único cargable con `from_pretrained`.
- Opciones de despliegue: carga mediante utilidades FSDP/VERL y scripts de merge; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lhl616/qwen3-soft-weight-rkl-20260929-checkpoints | Config. Qwen3-4B (recuento no disponible) | No disponible | Apache 2.0 | Checkpoints de investigación, no `from_pretrained` | Estudio de destilación con RKL |
| Qwen/Qwen3-4B-Base | 4B (aprox.) | No disponible en esta ficha | Apache 2.0 | Modelo base cargable | Origen de las ejecuciones PPO |
| Qwen/Qwen3-4B | 4B (aprox.) | No disponible en esta ficha | Apache 2.0 | Modelo instructivo cargable | Alternativa para uso conversacional |

## Limitaciones y advertencias

- No es un modelo único: la raíz del repositorio no se puede cargar con `from_pretrained`; los pesos están organizados por experimento y checkpoint.
- Los shards FSDP requieren los cuatro archivos `model_world_size_4_rank_*.pt` y utilidades compatibles de PyTorch/VERL.
- El subdirectorio `huggingface/` contiene solo configuración y tokenizer, no pesos fusionados.
- Las críticas no son modelos causales: usan cabeza escalar de valor y, en HL-Gauss, 101 logits sobre bins; no deben usarse como LM.
- No se incluyen estados del optimizador; muchos estados Adam originales se eliminaron antes de la publicación, por lo que no es posible continuar el entrenamiento de forma exacta.
- Los archivos de estado RNG/scheduler/dataloader no bastan para reanudar sin el optimizador y el entorno original.
- La publicación no garantiza validación de forward pass ni restauración funcional.
- Solo deben cargarse artefactos `.pt` basados en pickle en entornos de confianza.
- El manifiesto describe cobertura completa prevista, pero las subidas pueden estar en curso; no todos los archivos listados podrían estar presentes.
- Las rutas internas en copias JSON pueden estar redactadas, con indicación en `archive_manifest.json`.
- No se redistribuye el dataset de entrenamiento.
- No se declaran sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/lhl616/qwen3-soft-weight-rkl-20260929-checkpoints
- Modelo base citado: https://huggingface.co/Qwen/Qwen3-4B-Base
- No se han encontrado papers, blogs, repos ni demos adicionales en la información disponible.
