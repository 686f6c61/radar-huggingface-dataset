# Archaive16/yam-sponge-act-rtc

## Resumen

`yam-sponge-act-rtc` es una política de imitación para robótica desarrollada por Archaive16, publicada en Hugging Face bajo el pipeline `robotics`. No se trata de un modelo de lenguaje, sino de un controlador visomotor entrenado mediante aprendizaje por imitación (imitation learning) con la arquitectura ACT (Action Chunking Transformer) en su variante decoder-only, tal como la implementa el entrenador Flash ALOHA. Su tarea concreta es controlar un único brazo robótico YAM (derecho) para atrapar una pelota de esponja rodante y colocarla en una posición objetivo.

El modelo recibe dos cámaras (`top` y `right_wrist`) a resolución 180x320 y un vector de 7 dimensiones de posición articular (6 articulaciones más pinza), y emite un *chunk* de 60 objetivos absolutos de articulación y pinza, equivalentes a 1 segundo de control a 60 Hz. La innovación principal respecto a un ACT convencional es la incorporación de Real-Time Chunking (RTC) durante el entrenamiento, que permite condicionar la predicción a un prefijo de acciones ya comprometidas (de 0 a 10 acciones), facilitando la ejecución en tiempo real con re-consulta periódica.

El repositorio es de tamaño reducido (0,1 GB) y cuenta con cero descargas y cero *likes* en el momento de la consulta, lo que sugiere un artefacto de investigación reciente y poco difundido. La model card advierte explícitamente de que el modelo aún no ha sido evaluado en hardware real, por lo que debe considerarse un prototipo de laboratorio más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only ACT (Action Chunking Transformer), ResNet18 por cámara con inicialización ImageNet, hidden 512, 7 capas, 8 cabezas, bf16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación por chunk de 60 acciones (1,0 s a 60 Hz) |
| Tipos de cuantizacion | no disponible (pesos en bf16 durante entrenamiento; checkpoint `.ckpt`) |
| Idiomas soportados | no disponible (modelo robótico, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.ckpt` (checkpoint de entrenamiento), más `all_configs.json`, `dataset_stats.pkl` y `config.pkl` |
| Entradas | cámaras `top` y `right_wrist` a 180x320; qpos de 7 dimensiones (6 articulaciones + pinza) |
| Salidas | chunk de 60 objetivos absolutos de articulación/pinza |
| Frecuencia de control | 60 Hz |
| RTC en entrenamiento | activo, prefijo comprometido de 0 a 10 acciones |

## Arquitectura y entrenamiento

La política sigue el diseño decoder-only de ACT implementado en Flash ALOHA. Cada cámara pasa por un backbone ResNet18 inicializado con pesos de ImageNet, cuyas características se fusionan con el vector de qpos y se procesan por un transformer de 7 capas, 8 cabezas y dimensión oculta 512, operando en bf16. La salida es un chunk de 60 acciones absolutas que cubren 1 segundo de control a 60 Hz. La variante RTC añade una entrada de prefijo de acciones comprometidas (0 a 10), de modo que, sin prefijo, el modelo se comporta como un ACT estándar.

El entrenamiento parte de un *warm start* sobre la ejecución ACT simple `yam_sponge_act` en el paso 100k, reutilizando todos los pesos e incorporando como nueva la entrada de prefijo RTC. Sobre esa base se realizan 80.000 pasos adicionales con batch 128, learning rate 1,2e-4 (1e-5 para el backbone), optimizador AdamW, scheduler coseno con 1.000 pasos de calentamiento y aumento por recorte (crop augmentation). Los datos consisten en 55 demostraciones guiadas manualmente a 60 Hz; en la cámara superior se ha incrustado una máscara de la mano obtenida por cinemática directa (FK), que debe replicarse en inferencia.

## Capacidades

- Control visomotor de un brazo YAM derecho para una tarea de manipulación concreta: atrapar una pelota de esponja rodante y colocarla.
- Predicción de chunks de acción de 60 pasos (1,0 s a 60 Hz) a partir de dos vistas de cámara y qpos.
- Condicionamiento RTC: acepta un prefijo de 0 a 10 acciones ya comprometidas para mantener coherencia temporal entre chunks.
- Ejecución con re-consulta periódica cada 10-15 pasos y mezcla sigmoide entre chunks (recomendación del autor).
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades multilingües: es una política robótica, no un modelo generativo de texto.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades fuera del pipeline robótico.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como punto de partida o línea base para experimentos con ACT y RTC en tareas de manipulación con un solo brazo, reutilizando el *warm start* y la configuración publicada.
- Replicación de experimentos Flash ALOHA: el repositorio incluye `all_configs.json`, `dataset_stats.pkl` y `config.pkl`, lo que permite reconstruir el pipeline de entrenamiento y verificar resultados en un entorno controlado.
- Estudio de Real-Time Chunking: comparar el comportamiento con prefijo RTC (0-10 acciones) frente al ACT plano, midiendo latencia y suavidad de trayectoria en la transición entre chunks.
- Docencia y demostraciones de robótica: tarea acotada (atrapar y colocar una pelota) adecuada para prácticas de laboratorio con un brazo YAM y dos cámaras.
- Desarrollo de *wrappers* de despliegue: implementar el enmascarado FK de la cámara superior en vivo y la mezcla sigmoide entre chunks, tal como exige la model card, para integrar la política en un stack de control propio.
- Base para *fine-tuning* en tareas análogas: al partir de un ACT preentrenado, puede adaptarse con un conjunto reducido de demostraciones a variantes de la misma tarea (distinta posición de colocación, distinta pelota) siempre que se mantenga la configuración de cámaras y qpos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo "no ha sido evaluado todavía en hardware", por lo que no existen métricas de tasa de éxito, latencia ni *throughput* verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 0,1 GB y los pesos se entrenaron en bf16, pero no se detalla el número de parámetros totales ni el consumo en inferencia.
- GPU recomendadas: no disponible. Al tratarse de un transformer pequeño (7 capas, hidden 512) con dos ResNet18, es plausible que quepa en GPUs de consumo, pero el autor no lo confirma.
- ¿Cabe en GPU de consumo? No confirmado por el autor; sin datos de VRAM no puede afirmarse.
- Opciones de despliegue: el checkpoint es `.ckpt` y requiere `all_configs.json` y `dataset_stats.pkl`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas). El despliegue previsto es mediante el stack de Flash ALOHA.
- Latencia y throughput: no disponibles. La model card solo recomienda re-consultar cada 10-15 pasos con mezcla sigmoide o usar RTC con prefijo de 10 pasos, sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yam-sponge-act-rtc` (Archaive16) | ACT decoder-only con RTC | no disponible | chunk de 60 acciones a 60 Hz | no disponible | Hugging Face, 0 descargas |
| ACT original (Zhao et al.) | Transformer encoder-decoder para imitación | no disponible en esta ficha | chunk de acciones fijo | código abierto (repo original) | público |
| Flash ALOHA (trainer) | Framework de entrenamiento ACT | no aplica | configurable | no disponible en esta ficha | público |
| `yam_sponge_act` (Archaive16) | ACT plano, sin RTC | no disponible | chunk de 60 acciones | no disponible | referenciado como *warm start* |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparativa se limita a tipo de arquitectura, configuración de chunk y disponibilidad.

## Limitaciones y advertencias

- No evaluado en hardware real: la model card lo declara explícitamente; cualquier uso en un robot físico es experimental.
- Tarea única y estrecha: solo atrapar una pelota de esponja y colocarla con un brazo YAM derecho; no generaliza a otras tareas sin reentrenamiento.
- Dependencia de la máscara FK: la cámara superior requiere aplicar en vivo la misma máscara de mano por cinemática directa que en entrenamiento; omitirla degrada la política.
- Dependencia de la normalización: `dataset_stats.pkl` es obligatorio para normalizar qpos y acciones; su ausencia o sustitución invalida las predicciones.
- Dataset pequeño: 55 demostraciones guiadas manualmente, lo que limita la robustez ante variaciones de iluminación, posición inicial o dinámica del objeto.
- Licencia no disponible: no puede confirmarse el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no aplicables: el modelo no procesa lenguaje, por lo que no hay soporte multilingüe que evaluar.
- Riesgo de alucinación no aplicable en el sentido de LLM, pero sí riesgo de acciones fuera de distribución ante observaciones no vistas durante el entrenamiento.
- Sin métricas publicadas: no hay tasas de éxito, latencia ni comparativas verificables; la ausencia de descargas y *likes* sugiere escasa validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Archaive16/yam-sponge-act-rtc
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
