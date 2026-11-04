# Donghyun1228/pi05-libero-lape-k10-view-small-lam0p005-lr5e-5-10000-20261102

## Resumen

π0.5 LIBERO view_small es un checkpoint de política robótica (VLA, vision-language-action) derivado del modelo π0.5 de Physical Intelligence y adaptado al benchmark LIBERO mediante el método LAPE (Layer-Adaptive Prior Estimation) del repositorio `Donghyun1228/vla_adaptation`. Lo publica el usuario Donghyun1228 como resultado principal de su técnica de anclaje de capas ponderado, y no como un modelo de propósito general. El checkpoint parte de una inicialización previa (`pi05-libero-conflict-mean-source-n50k-10000-20261024`, paso 9999) y aplica 10.000 actualizaciones de adaptación solo sobre el target, con el LLM congelado.

La relevancia es acotada pero concreta: documenta una receta reproducible de adaptación de dominio para políticas VLA con un resultado medido de 89,10 % de éxito en LIBERO (2.000 episodios, 500 por suite, MuJoCo 3.2.3). El repositorio ocupa 23,8 GB e incluye parámetros, `train_state` completo y assets de normalización, lo que permite reanudar entrenamiento o reexportar la política.

No es un modelo de lenguaje: no genera texto libre ni responde a prompts conversacionales. Su única función es producir acciones motoras a partir de observaciones visuales e instrucciones de tarea en entornos simulados tipo LIBERO. Cualquier uso fuera de robótica o de investigación en imitación visual-motora queda fuera de su alcance declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (vision-language-action con torre de visión y LLM congelado durante la adaptación); detalles completos de capas no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados sin cuantizar) |
| Idiomas soportados | no disponible (las instrucciones de LIBERO son en inglés por defecto del benchmark, no declarado por el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | parámetros en formato nativo de openpi/JAX (`params`, `train_state`, `assets`); no se publica GGUF ni safetensors estándar |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π0.5 de openpi: una torre de visión que procesa las cámaras (incluida la cámara de muñeca, `wrist`) y un backbone de lenguaje que actúa como codificador de la instrucción, con una cabeza de acciones que emite comandos motores. Durante la adaptación el LLM permanece congelado; solo se actualizan las partes no congeladas bajo el optimizador `ConflictAnchorAdamW` con ponderación `conflict` y coeficiente 0,005.

El entrenamiento parte del checkpoint `pi05-libero-conflict-mean-source-n50k-10000-20261024` en el paso 9999, que a su vez combina imitación (IL) con un objetivo mean-IDM sobre una recolección con conflictos de gradiente. Sobre esa base se ejecutan 10.000 actualizaciones de adaptación solo-target sobre la sonda de soporte `view_small` (n50k), con el índice del gripper (6) excluido de la pérdida IDM. El LR pico es 5e-5, constante tras el warmup. El anclaje LAPE usa un prior por capa `prior/lape_k10/prior.json` con peso w_l = 1 − s_l^10, donde s_l es la fracción compartida LAPE, y w = 0 para los grupos de entrada/salida. La política de evaluación exportada (`policy_source_wrist/`) pasa la cámara de muñeca por la torre de visión de origen, según `export.json`.

## Capacidades

- Control visuomotor en LIBERO: genera secuencias de acciones a partir de observaciones e instrucciones de tarea en las suites del benchmark.
- Ejecución de instrucciones de manipulación en lenguaje natural dentro del dominio LIBERO (instrucciones cortas y plantillas del benchmark).
- Uso de cámara de muñeca (`wrist`) además de la vista principal, con una ruta de exportación específica que enruta esa cámara por la torre de visión de origen.
- Reanudación de entrenamiento: el `train_state` completo permite continuar el ajuste desde el paso 9999.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.
- No es un modelo conversacional ni multilingüe declarado.

## Casos de uso

- Evaluación de métodos de adaptación de dominio en VLA: sirve como referencia reproducible para comparar LAPE frente a otras estrategias de anclaje de capas, dado que la receta completa (prior, LR, coeficiente, pasos) está documentada.
- Reproducción de resultados en LIBERO: con 89,10 % de éxito sobre 2.000 episodios y MuJoCo 3.2.3, permite verificar pipelines de evaluación sin reentrenar desde cero.
- Punto de partida para fine-tuning en nuevas tareas de manipulación: el `train_state` y los assets de normalización permiten continuar el ajuste sobre otros conjuntos de demostraciones.
- Estudio de conflicto de gradientes en adaptación solo-target: el checkpoint previo y este comparten la línea de recolección con conflictos, lo que facilita análisis ablativos del efecto del anclaje.
- Investigación en congelación del LLM: al mantener el backbone de lenguaje fijo, es útil para aislar cuánto del rendimiento proviene de la adaptación de la torre visual y de la cabeza de acciones.
- Integración en pipelines de simulación robótica: la política exportada se puede cargar en entornos MuJoCo compatibles con LIBERO para pruebas de robustez ante variaciones de vista (`view_small`).

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Condiciones |
|---|---|---|---|
| LIBERO (global) | Tasa de éxito | 89,10 % | 2.000 episodios, 500 por suite, MuJoCo 3.2.3, política `policy_source_wrist/` en el paso 9999 |

No se han publicado en la información disponible resultados desglosados por suite (LIBERO-Spatial, Object, Goal, Long), ni comparativas con otros checkpoints en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio pesa 23,8 GB, lo que da una cota inferior del orden de decenas de GB en precisión completa para cargar parámetros y estado.
- GPU recomendadas: no declaradas por el autor; por el tamaño del repo, se requiere al menos una GPU de datacenter (A100 40/80 GB o H100) para inferencia en precisión nativa.
- GPU de consumo: no se confirma que quepa en RTX 4090 (24 GB) en precisión completa; requeriría cuantización o sharding no documentados.
- Opciones de despliegue: el stack es openpi/JAX (formato `params` + `train_state`), no vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Éxito LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| π0.5 LIBERO view_small (este) | VLA adaptada | no disponible | no disponible | 89,10 % | Apache 2.0 | HuggingFace |
| π0.5 base (openpi) | VLA | no disponible | no disponible | no disponible | no disponible | openpi |
| Checkpoint previo `pi05-libero-conflict-mean-source-n50k-10000-20261024` | VLA | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| OpenVLA | VLA | ~7B (referencia externa) | no disponible | no disponible | no disponible | no disponible |

Los datos de π0.5 base, del checkpoint previo y de OpenVLA no están en la información proporcionada; la comparación cuantitativa no es posible con los datos disponibles.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado y evaluado exclusivamente en LIBERO; no se garantiza transferencia a robots reales ni a otras simulaciones.
- Sin datos de sesgo, alucinación o robustez fuera del benchmark; no se han publicado análisis de fallos.
- El resultado de 89,10 % corresponde a una política de exportación concreta (`policy_source_wrist/`) y a una configuración de vistas (`view_small`); cambiar la cámara o el enrutado puede degradar el rendimiento.
- El LLM está congelado durante la adaptación, lo que limita la plasticidad semántica ante instrucciones fuera de la distribución de LIBERO.
- Idiomas no declarados: no hay evidencia de soporte multilingüe en las instrucciones.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base π0.5 y openpi pueden tener términos propios que deben verificarse antes de producción.
- Repositorio de 23,8 GB con `train_state` completo: el almacenamiento y la carga son costosos; no hay versiones cuantizadas publicadas.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria independiente del resultado.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-lape-k10-view-small-lam0p005-lr5e-5-10000-20261102
- Checkpoint de inicialización: https://huggingface.co/Donghyun1228/pi05-libero-conflict-mean-source-n50k-10000-20261024
- Repositorio de código del método: `Donghyun1228/vla_adaptation` (commit `e37d9435`), preset `pi05_libero_conflict_anchor_view_adapt`
- openpi (stack de referencia): no se proporciona URL en la información disponible
- Paper de π0.5: no disponible en la información proporcionada
