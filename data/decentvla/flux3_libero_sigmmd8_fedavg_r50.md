# DecentVLA/flux3_libero_sigmmd8_fedavg_r50

## Resumen

`flux3_libero_sigmmd8_fedavg_r50` es un fine-tune completo de FLUX 3 Action, el modelo base de acción robótica de Black Forest Labs, entrenado mediante el framework `decent-vla` con un esquema de aprendizaje federado (agregación FedAvg) sobre el benchmark LIBERO. Lo publica el usuario DecentVLA y corresponde a la ronda 50 de entrenamiento federado, con pesos agregados en fp32 (`server_round_0050.pt`).

El modelo resuelve el problema de generar políticas visomotoras para manipulación robótica de mesa: dado un objetivo en lenguaje natural y la observación visual, produce acciones motrices. Su relevancia radica en que demuestra que un fine-tune federado de un modelo de acción de gran escala puede alcanzar un 82,75 % de éxito medio (331/400 episodios) en tareas heterogéneas de LIBERO, incluyendo variantes espacial, de objetivo y de longitud larga.

El repositorio ocupa 27,6 GB y se distribuye bajo la licencia FLUX Kommunity, que restringe el uso a fines no comerciales. No se declaran idiomas soportados ni se publican especificaciones de arquitectura o recuento de parámetros en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base FLUX 3 Action; no se detalla la arquitectura interna) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp32 (estado agregado `server_round_0050.pt`); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | FLUX Kommunity License (uso no comercial únicamente) |
| Formato de pesos | `.pt` (PyTorch, fp32); no se documentan safetensors ni GGUF |
| Modelo base | black-forest-labs/flux-3-action-base |
| Framework de entrenamiento | decent-vla (config `examples/flux_libero_sigmmd8_fedavg.yaml`) |
| Esquema de agregación | FedAvg, ronda 50 |
| Tamaño del repositorio | 27,6 GB |

## Arquitectura y entrenamiento

El checkpoint es un fine-tune completo (full fine-tune) de los pesos de `black-forest-labs/flux-3-action-base`, un modelo de acción para robótica. El entrenamiento se realizó con el framework `decent-vla`, que implementa aprendizaje federado con agregación FedAvg; el artefacto publicado es el estado agregado de la ronda 50 (`server_round_0050.pt`), en precisión fp32. El nombre del experimento (`sigmmd8_fedavg`) sugiere el uso de una variante de agregación con distancia MMD (sigmmd) con 8 participantes o clientes, aunque este extremo no se detalla en la model card.

El conjunto de evaluación es LIBERO, con 50 episodios por tarea y semilla 42, abarcando tareas de las suites `10`, `goal` y `spatial`. No se especifican el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de políticas de acción robótica a partir de observaciones visuales y objetivos en lenguaje natural (visión-lenguaje-acción).
- Ejecución de tareas de manipulación de mesa: abrir cajones, colocar objetos en recipientes, apilar, empujar y accionar electrodomésticos.
- Generalización a distintas suites de LIBERO: espacial (`spatial`), orientada a objetivo (`goal`) y de horizonte largo (`10`).
- Entrenamiento federado: los pesos agregados permiten reproducir el proceso de FedAvg sobre múltiples clientes.
- Evaluación reproducible mediante el comando `decent-vla eval` y el runtime remoto para RoboCasa (`runtime/remote_policy.py`).
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, multilingüismo ni modos de pensamiento.

## Casos de uso

- Manipulación robótica en entornos de laboratorio: el modelo genera acciones para tareas como abrir el cajón central de un armario o encender la cocina, con tasas de éxito de 47/50 y 49/50 respectivamente en la evaluación publicada.
- Investigación en aprendizaje federado para robótica: sirve como referencia reproducible de un fine-tune agregado con FedAvg en la ronda 50, permitiendo comparar estrategias de agregación sobre el mismo modelo base.
- Benchmarking de políticas visomotoras: al evaluarse sobre LIBERO con 50 episodios por tarea y semilla fija, facilita comparaciones controladas frente a otros checkpoints del mismo modelo base.
- Automatización de tareas de pick-and-place: tareas como colocar el cuenco negro sobre el plato alcanzan 50/50, lo que lo hace adecuado para validar pipelines de recogida y colocación en simulación.
- Réplica de experimentos: el repositorio incluye `eval/`, `config/` y `logs/`, lo que permite auditar y reproducir los resultados del entrenamiento.
- Desarrollo de sistemas de control con objetivos en lenguaje natural: el modelo traduce instrucciones textuales ("pon la botella de vino sobre la estantería") en secuencias de acción, útil para prototipos de interfaces humano-robot.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre LIBERO (50 episodios por tarea, semilla 42):

| Tarea | Éxitos |
|---|---|
| 10 t3: poner el cuenco negro en el cajón inferior del armario y cerrarlo | 41/50 |
| 10 t5: coger el libro y colocarlo en el compartimento trasero del organizador | 49/50 |
| goal t0: abrir el cajón central del armario | 47/50 |
| goal t2: poner la botella de vino encima del armario | 47/50 |
| goal t5: empujar el plato hacia la parte delantera de la cocina | 27/50 |
| goal t7: encender la cocina | 49/50 |
| goal t9: poner la botella de vino en la estantería | 21/50 |
| spatial t2: coger el cuenco negro del centro de la mesa y ponerlo en el plato | 50/50 |
| **Media** | **331/400 (82,75 %)** |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 27,6 GB en fp32; la inferencia requiere cargar los pesos completos, por lo que se necesita una GPU con al menos ~28-32 GB de VRAM en precisión nativa.
- GPU recomendadas: A100 (40/80 GB), H100, o GPUs de consumo de gama alta con 24 GB solo si se aplica cuantización, opción no documentada por el autor.
- No se documenta soporte para llama.cpp, Ollama, vLLM ni TGI; el flujo previsto es `decent-vla eval` con el checkpoint `.pt`.
- Para ejecuciones en RoboCasa se indica el runtime remoto `runtime/remote_policy.py`.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de FLUX 3 Action ni modelos de política robótica comparables con especificaciones verificables.

## Limitaciones y advertencias

- Licencia FLUX Kommunity: uso exclusivamente no comercial; cualquier despliegue comercial requiere licencia adicional de Black Forest Labs.
- El rendimiento es muy desigual entre tareas: desde 50/50 en `spatial t2` hasta 21/50 en `goal t9`, lo que indica fragilidad en tareas de colocación precisa sobre estanterías.
- Evaluación limitada a 8 tareas de LIBERO con una única semilla (42); no hay evidencia de robustez frente a variaciones de iluminación, cámara o disposición de objetos.
- No se documentan sesgos, comportamiento fuera de distribución ni tasas de alucinación; en modelos de acción el equivalente sería la generación de trayectorias inválidas.
- No se especifican idiomas soportados para las instrucciones en lenguaje natural.
- El formato de pesos es `.pt` en fp32, lo que dificulta el despliegue en hardware de consumo sin conversión previa.
- No se publican detalles de arquitectura, parámetros ni datos de entrenamiento, lo que limita la auditabilidad del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DecentVLA/flux3_libero_sigmmd8_fedavg_r50
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-action-base
- Licencia FLUX Kommunity: https://huggingface.co/black-forest-labs/flux-3-action-base/blob/main/LICENSE.md
