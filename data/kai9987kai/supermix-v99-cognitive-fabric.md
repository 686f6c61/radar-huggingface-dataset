# Kai9987kai/supermix-v99-cognitive-fabric

## Resumen

Supermix v99 Cognitive Fabric es un checkpoint experimental de la familia Supermix, publicada por el usuario Kai9987kai bajo licencia MIT. Se distribuye como un repositorio unificado que empaqueta el checkpoint `v99_scf_evolution.selected.pt` junto con los demas pesos de la linea v96–v103, todos ellos variantes de una arquitectura propia denominada "cognitive fabric" que combina conceptos de mezcla de expertos (MoE), memoria tipo engram, conexiones hiperbolicas (hyper-connections), DeltaNet y optimizacion con Muon. El modelo base declarado es `Kai9987kai/supermix-v93` y la tarea declarada es generacion de texto.

El modelo no sigue la estela de los transformers densos convencionales: la model card describe modulos como "dual_soma", "commissural", "glial", "hebbian trace", "predictive error", "entropy halt" y "neurogenesis", que sugieren una inspiracion en arquitecturas neuro-simbolicas y en mecanismos de plasticidad hebbiana. No se especifican parametros totales, longitud de contexto ni composicion del corpus de entrenamiento, y las unicas metricas publicadas son perdidas de validacion y aciertos en tareas sinteticas de evaluacion propia (no benchmarks estandar).

La relevancia practica de este checkpoint es limitada: se trata de una publicacion de investigacion con 236 descargas, sin likes, sin idiomas declarados y sin resultados en benchmarks reconocidos (MMLU, HumanEval, GSM8K). Resulta util como referencia para quienes siguen la linea experimental del autor, pero no como sustituto de modelos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Propietaria "cognitive fabric": mezcla de expertos con modulos neuro-simbolicos, conexiones hebbianas, memoria engram, DeltaNet-2 y Muon (segun tags y model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (se declara MoE pero no se detalla el reparto) |
| Longitud de contexto | no disponible (las evaluaciones usan `max_new_tokens=96`) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (checkpoints `.selected.pt`); repo de 1,3 GB |

## Arquitectura y entrenamiento

La model card describe una arquitectura de "cognitive fabric" con mezcla de expertos y modulos inspirados en biologia: `dual_soma`, `commissural`, `glial`, `r=0.90` en la variante v96; `hebbian`, `pred_err`, `div_norm` y `halt` en v100; `mHC`, `apical`, `CTM-Sync` y `Muon` en v102; y `Engram`, `Gated DeltaNet-2` y `Muon` en v103. La variante v99 que da nombre a este repo se etiqueta como "7.5k 41-task + chat continuation", lo que sugiere un ajuste sobre 7.500 ejemplos de 41 tareas mas continuacion de chat, partiendo de `supermix-v93`.

No se publican detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones como decodificacion especulativa. Las perdidas de validacion reportadas son 0,0265 para v99, 0,0175 para v101 y 0,0180 para v103, todas sobre el mismo pipeline interno del autor. El unico dato de evaluacion reproducible es la tasa de acierto en tareas sinteticas con `seed=82/83/84` y `max_new_tokens=96` en CPU Windows.

## Capacidades

- Generacion de texto autoregresiva (pipeline declarado: `text-generation`).
- Razonamiento sobre tareas sinteticas de 41 items (la model card reporta 33/41 con `seed=82` y 67/82 con `seed=83`).
- Continuacion de chat ("chat continuation" en la etiqueta de la variante v99).
- Soporte declarado de mecanismos de memoria tipo engram y plasticidad hebbiana (sin API publica documentada).
- Verificacion formal y enfoque neuro-simbolico (tag `formal-verification`, sin detalles de implementacion).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Investigacion sobre arquitecturas neuro-simbolicas: el checkpoint sirve como banco de pruebas para estudiar modulos como `engram`, `hebbian trace` o `DeltaNet-2` en un entorno PyTorch reproducible, ya que el autor publica el codigo fuente en GitHub.
- Experimentacion con mezcla de expertos de bajo presupuesto: al ocupar 1,3 GB en disco, se puede cargar en una estacion de trabajo sin GPU dedicada y comparar variantes v96–v103 con el mismo pipeline de evaluacion.
- Reproduccion de las metricas internas del autor: los scripts `source/scf frontier --json` y `source/nexus_api.py` permiten replicar las tablas de aciertos por semilla y comprobar la perdida de validacion.
- Prototipado de asistentes conversacionales de nicho: la variante v99 incluye "chat continuation" y puede usarse para generar respuestas cortas (hasta 96 tokens) en demos locales con `supermix_chat_server.py`.
- Docencia y formacion: util para ilustrar en clase como se empaquetan checkpoints, se comparan variantes y se documentan limitaciones de un modelo de investigacion.
- Servicio HTTP ligero: el autor incluye `nexus_api.py` (FastAPI/uvicorn) para exponer el modelo en `127.0.0.1:8000`, adecuado para pruebas internas de integracion.
- No recomendado para produccion: sin benchmarks estandar, sin idiomas declarados y sin garantias de calidad, no debe usarse en atencion al cliente, generacion de codigo en CI/CD ni pipelines regulados.

## Benchmarks y rendimiento

Resultados publicados en la model card (Windows CPU, `max_new_tokens=96`). Las columnas `seed=82`, `seed=83` y `seed=84` miden aciertos en tareas sinteticas internas, no benchmarks estandar.

| Checkpoint | Dev loss | seed=82 | seed=83 | seed=84 | SCF Hybrid (seed=82) |
|---|---:|---:|---:|---:|---:|
| v96 (promovido) | 0,0861 | 35/41 (0,854) | 72/82 (0,878) | 73/82 (0,890) | 41/41 (1,0000) |
| v98 | 0,0572 | 35/41 (0,854) | 70/82 (0,854) | — | 41/41 (1,0000) |
| v99 (este repo) | 0,0265 | 33/41 (0,805) | 67/82 (0,817) | — | 41/41 (1,0000) |
| v100 | 0,0238 | 35/41 (0,854) | 72/82 (0,878) | 72/82 (0,878) | 41/41 (1,0000) |
| v101 | 0,0175 | 35/41 (0,854) | 72/82 (0,878) | 71/82 (0,866) | 41/41 (1,0000) |
| v102 | 0,0181 | 35/41 (0,854) | 72/82 (0,878) | 71/82 (0,866) | 41/41 (1,0000) |
| v103 | 0,0180 | 34/41 (0,829) | 71/82 (0,866) | 72/82 (0,878) | 41/41 (1,0000) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo pesa 1,3 GB y los pesos son `.pt` de PyTorch (no cuantizados), por lo que cabe en GPU consumer de 8 GB o incluso en CPU.
- GPU recomendadas: no especificadas por el autor; las pruebas publicadas se ejecutaron en CPU de Windows, sin GPU.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090), aunque no hay confirmacion oficial.
- Opciones de despliegue: scripts propios del autor (`source/nexus_api.py` con FastAPI/uvicorn y `source/supermix_chat_server.py`); no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; las evaluaciones se hicieron con `max_new_tokens=96` en CPU, sin cifras de tokens por segundo.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con modelos de terceros y la arquitectura propietaria ("cognitive fabric") no es directamente equiparable a familias estandar como Llama, Mistral o Qwen en parametros, contexto o licencia. Las unicas comparaciones publicadas son internas entre las variantes v96–v103 de la misma familia Supermix.

## Limitaciones y advertencias

- Modelo experimental: la propia model card etiqueta v99 como "Experimental" y promueve v96 como baseline por defecto.
- Sin benchmarks estandar: no hay resultados en MMLU, HumanEval, GSM8K ni similares, por lo que la calidad real en tareas del mundo real es desconocida.
- Idiomas no declarados: no se especifica que lenguas soporta ni su calidad en castellano.
- Longitud de contexto no documentada: las pruebas usan `max_new_tokens=96`, lo que sugiere un uso muy limitado a secuencias cortas.
- Riesgo de alucinacion: sin datos de alineacion (RLHF/DPO no mencionados) ni evaluaciones de veracidad.
- Sesgos: no se documentan sesgos conocidos ni procesos de mitigacion.
- Licencia MIT: permite uso comercial, pero al no haber garantias de calidad ni soporte, su uso en produccion es desaconsejable.
- Formato `.pt` no estandar: requiere cargar los pesos con el codigo del propio autor (`source/`), no es compatible directamente con pipelines de Hugging Face `transformers`.
- Trazabilidad limitada: el repo tiene 0 likes y 236 descargas, sin revision por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kai9987kai/supermix-v99-cognitive-fabric
- Modelo base: https://huggingface.co/Kai9987kai/supermix-v93
- Checkpoint promovido v96: https://huggingface.co/Kai9987kai/supermix-v96
- v97: https://huggingface.co/Kai9987kai/supermix-v97
- v98: https://huggingface.co/Kai9987kai/supermix-v98
- v100: https://huggingface.co/Kai9987kai/supermix-v100
- v101: https://huggingface.co/Kai9987kai/supermix-v101
- v102: https://huggingface.co/Kai9987kai/supermix-v102
- v103: https://huggingface.co/Kai9987kai/supermix-v103
- Archivo historico: https://huggingface.co/Kai9987kai/supermix-historical-milestones
- Repositorio GitHub: https://github.com/kai9987kai/Supermix
- Commit de integracion de release: https://github.com/kai9987kai/Supermix/commit/7feb8e0e90bcdb8d7d009fd7da12928df6a661de
