# LY0613/dicepilot-groot-n17-v2

## Resumen

DicePilot GR00T N1.7 v2 es un conjunto de pesos de ajuste fino (fine-tuning) derivado de la base NVIDIA GR00T-N1.7-3B, un modelo visión-lenguaje-acción (VLA) orientado al control de robots manipuladores. Lo publica el usuario LY0613 en Hugging Face y está especializado en una tarea muy concreta: la manipulación simulada de dados con un brazo robótico SO-101, usando cámaras lateral y de muñeca como entrada sensorial.

El repositorio no contiene un modelo autónomo, sino los parámetros entrenados que deben cargarse sobre la revisión autorizada del modelo base de NVIDIA (commit `373d34e2723d928870157d07dc216a19a624b5bb`). Incluye los pesos de una ejecución de clonación de comportamiento (behavioral cloning, BC) de 15.000 pasos y dos checkpoints completos de la cabeza de acción entrenados con DiffusionNFT. El tamaño del repositorio es de 20,2 GB, coherente con pesos en precisión alta de un modelo de aproximadamente 3.000 millones de parámetros.

Su relevancia es acotada pero clara para quien trabaje en robótica simulada: demuestra un flujo de trabajo reproducible de ajuste fino de un VLA de NVIDIA sobre una tarea de manipulación concreta, con instrucciones explícitas de carga, selección de cabeza de acción y parámetros de inferencia (cuatro pasos de integración de flujo y ocho acciones ejecutadas por chunk).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | visión-lenguaje-acción (VLA) derivada de NVIDIA GR00T-N1.7-3B; incluye cabeza de acción con generación por flow matching y variante DiffusionNFT |
| Parametros totales | aproximadamente 3.000 millones (heredados de la base GR00T-N1.7-3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados son safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la model card ni en los metadatos del repositorio |
| Formato de pesos | safetensors (`bc-15000.safetensors`, `nft-best.safetensors`, `nft-last.safetensors`) |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura GR00T N1.7 de NVIDIA, un modelo visión-lenguaje-acción que combina un codificador visual y de lenguaje con una cabeza de acción que genera trayectorias motoras. En esta variante concreta, la cabeza de acción emplea generación por flow matching con cuatro pasos de integración y produce chunks de ocho acciones ejecutadas. Sobre esa base se han entrenado dos tipos de cabezas: una de clonación de comportamiento pura y dos checkpoints adicionales optimizados con DiffusionNFT, una técnica de ajuste que refina la política de difusión mediante preferencias o recompensas.

El entrenamiento se realizó sobre una tarea de manipulación simulada de dados con el brazo SO-101, con observaciones de dos cámaras (lateral y de muñeca). La ejecución de clonación de comportamiento consta de 15.000 pasos y, según el autor, los pesos "best" y "final" de BC son idénticos. Los pesos publicados contienen únicamente los parámetros entrenados: no incluyen la base congelada de NVIDIA ni el estado del optimizador. La carga se realiza con `load_state_dict(strict=False)` sobre el modelo completo y con `strict=True` sobre `model.action_head` para las cabezas NFT, y solo debe seleccionarse una cabeza NFT a la vez. El repositorio incluye un `checkpoints.json` con metadatos del snapshot y un procesador propio (`NEW_EMBODIMENT`).

## Capacidades

- Control robótico de manipulación: genera acciones motoras para el brazo SO-101 en una tarea de manipulación de dados en simulación.
- Percepción multimodal: consume observaciones de dos cámaras (lateral y de muñeca) junto con el estado del robot.
- Generación de acciones por chunks: produce ocho acciones por chunk con cuatro pasos de integración de flujo.
- Política de clonación de comportamiento: reproduce comportamientos demostrados en los datos de entrenamiento.
- Política refinada con DiffusionNFT: dos cabezas alternativas (`nft-best` y `nft-last`) que aplican ajuste por difusión con preferencias.
- No se documentan capacidades de tool calling, agentes multi-paso, diálogo multilingüe ni modos de razonamiento explícito; el modelo está especializado en control motor y no en tareas de lenguaje general.

## Casos de uso

- Investigación en imitación robótica: servir como punto de partida reproducible para estudiar clonación de comportamiento sobre un VLA de 3.000 millones de parámetros en una tarea acotada de manipulación.
- Comparación de métodos de ajuste: los checkpoints BC y las dos cabezas DiffusionNFT permiten comparar empíricamente clonación de comportamiento frente a ajuste por difusión con preferencias sobre la misma tarea.
- Evaluación de políticas en simulación: ejecutar el modelo en el entorno simulado de SO-101 para medir tasas de éxito en la manipulación de dados antes de transferir a hardware real.
- Desarrollo de pipelines de robótica: integrar la carga de pesos y la inferencia por chunks en un bucle de control que ejecute ocho acciones por paso de decisión.
- Estudio de percepción multi-cámara: analizar cómo influyen las vistas lateral y de muñeca en la calidad de las acciones generadas.
- Reproducción de experimentos: validar el flujo de carga documentado (`load_state_dict` con `strict=False` sobre el modelo y `strict=True` sobre la cabeza) para replicar los resultados del autor.
- Base para nuevos ajustes: reutilizar los pesos como inicialización para otras tareas de manipulación con el mismo embodiment, dado que el autor incluye un procesador específico (`NEW_EMBODIMENT`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con aproximadamente 3.000 millones de parámetros en precisión de 16 bits, los pesos ocupan del orden de 6 GB, a lo que hay que sumar el codificador visual, el procesador y los buffers de inferencia. El repositorio completo ocupa 20,2 GB porque incluye varios checkpoints.
- GPU recomendadas: no documentadas por el autor. Por tamaño, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB, H100) es un punto de partida razonable, pero no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente en tarjetas con 16 GB o más, aunque no está verificado en la información disponible.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el flujo previsto es cargar la base GR00T-N1.7-3B con su implementación N1.7 y aplicar los safetensors con PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DicePilot GR00T N1.7 v2 | ~3.000 M (base GR00T-N1.7-3B) | no disponible | manipulación simulada de dados con SO-101 | no disponible | Hugging Face (LY0613) |
| NVIDIA GR00T-N1.7-3B | ~3.000 M | no disponible | VLA general para robots | sujeta a la licencia de NVIDIA (no verificada aquí) | Hugging Face (NVIDIA) |
| Alternativas VLA de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere la base NVIDIA GR00T-N1.7-3B en la revisión exacta indicada y la implementación N1.7 correspondiente; sin ellas los pesos no son utilizables.
- Especialización extrema: entrenado únicamente para manipulación simulada de dados con SO-101 y dos cámaras concretas; no se espera generalización a otras tareas, objetos o morfologías sin nuevo ajuste.
- Licencia no declarada: no se especifica la licencia en la model card ni en los metadatos, lo que impide determinar si el uso comercial es posible. Además, los pesos derivan de una base de NVIDIA cuyos términos deben respetarse.
- Sin datos de evaluación: no hay benchmarks, tasas de éxito ni métricas de simulación publicadas, por lo que no puede afirmarse su rendimiento real.
- Riesgo de sobreajuste y alucinación motora: al ser clonación de comportamiento sobre un dataset acotado, puede reproducir sesgos de las demostraciones y fallar ante estados no vistos.
- Selección de cabeza: solo debe cargarse una cabeza NFT a la vez (`nft-best` o `nft-last`); mezclarlas o aplicar `strict=True` sobre el modelo completo provocará errores de carga.
- Repositorio de 20,2 GB: incluye varios checkpoints, lo que complica el despliegue en entornos con almacenamiento limitado.
- Sin soporte multilingüe ni de lenguaje general documentado: no debe emplearse como modelo de chat o generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LY0613/dicepilot-groot-n17-v2
- Base NVIDIA GR00T-N1.7-3B (referenciada por el autor, revisión `373d34e2723d928870157d07dc216a19a624b5bb`): no se proporciona URL directa en la información disponible.
- Paper, blog, repositorio o demo del autor: no disponibles en la información proporcionada.
