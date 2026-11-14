# LeoJiangOR/twla-tachin-editor-reproduction

## Resumen

T-WLA Tachin W3 editor es un modelo de edición de acciones para robótica manipulativa con retroalimentación táctil, desarrollado por LeoJiangOR. No se trata de un modelo de lenguaje generativo, sino de un componente especializado que refina planes de acción motora producidos por un backbone VLA (vision-language-action) congelado, incorporando información táctil de alta frecuencia. El checkpoint publicado es una reproducción del entrenamiento descrito en un artículo, no el checkpoint original de los autores.

El modelo combina un codificador táctil, un editor de acciones, un adaptador RGB-world y un modelo táctil del mundo. Trabaja sobre acciones base de forma `[B, 16, 192]` y memoria del backbone VLA de forma `[B, 8, 960]`, leyendo ocho fotogramas táctiles por mano con 880 celdas sensoriales por mano. La evaluación se realiza sobre las primeras ocho acciones a 80 Hz.

Su relevancia radica en que aborda la integración de señales táctiles en pipelines de control robótico con VLA, un área poco cubierta por modelos abiertos. No obstante, el propio autor advierte que en esta reproducción el rendimiento con tacto correcto y con tacto barajado es prácticamente idéntico, por lo que la sensibilidad al contacto real no queda demostrada con estos resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (componentes: codificador táctil, editor de acciones, adaptador RGB-world, modelo táctil del mundo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de 8 fotogramas táctiles y 16 acciones por paso |
| Tipos de cuantizacion | no disponible (checkpoint en formato PyTorch `best.pt`) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pt`, requiere `weights_only=False`) |

## Arquitectura y entrenamiento

El modelo es un editor de acciones que opera sobre la salida de un backbone VLA congelado (`twla_tachin_common_adaptation_20260922/checkpoint/best.pt`, SHA256 `8df6c87f...`). El checkpoint `best.pt` contiene el codificador táctil, el editor de acciones, el adaptador RGB-world, el modelo táctil del mundo, las estadísticas de normalización y el estado del optimizador; no incluye el backbone VLA ni la cabeza RGB-world congelados, que no son necesarios para inferencia solo del editor con acciones base y memoria cacheadas.

El entrenamiento usa el caché emparejado `paired30` de Tachin, reordenado según un split disjunto por grabación. El codificador lee ocho fotogramas táctiles de ambas manos (880 celdas por mano). Los splits son: entrenamiento con 14.888 planes base y 39.489 filas elegibles, validación con 1.466 planes y 3.819 filas, y test con 4.029 planes solo para evaluación. La configuración es de máximo 30 épocas, micro batch 32, batch efectivo 256, semilla 20260923, con pesos de objetivo RGB y táctil de 0,1 y 0,01 respectivamente. La parada temprana usa paciencia 5, mínimo 5 épocas y mejora mínima de 1e-4; el entrenamiento se detuvo en la época 15 y se retuvo la época 10 (paso 1.550).

## Capacidades

- Refinamiento de acciones motoras: recibe acciones base normalizadas y devuelve acciones finales editadas, con conversión mediante `final_action * action_std + action_mean`.
- Integración de señal táctil: procesa presión cruda de 880 celdas por mano en ocho fotogramas, con máscaras de validez de celda y de muestra.
- Edición selectiva: aplica una máscara editable `[B, 16, 192]` sobre componentes de acción de mano válidos y no comprometidos.
- Condicionamiento por memoria VLA: consume características `final_memory` de forma `[B, 8, 960]` alineadas con el backbone congelado.
- Protocolo de replay temporal: soporta el runner correspondiente para el protocolo 0/33/67 ms.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües: es un componente de robótica, no un LLM.

## Casos de uso

- Refinamiento de políticas VLA en manipulación: usar el editor para corregir acciones base de un backbone VLA congelado incorporando contacto táctil, útil cuando el modelo visual no captura fuerzas de agarre.
- Control de agarre con retroalimentación táctil: el codificador táctil de 880 celdas por mano permite ajustar la presión y la trayectoria de la mano durante tareas de prensión.
- Investigación en reproducción de resultados: el paquete incluye `code/`, `summary.json`, `epochs.jsonl` y `provenance.json`, lo que facilita replicar el entrenamiento y auditar el split.
- Evaluación comparativa de modelos táctiles: el contrato de inferencia fijo (formas y convenciones de normalización) permite integrarlo en pipelines de benchmark de robótica.
- Prototipado de edición de acciones en simulación o laboratorio: con acciones base y memoria cacheadas, se puede ejecutar inferencia solo del editor sin cargar el backbone VLA completo.
- Análisis de sensibilidad táctil: el propio autor reporta la comparación entre tacto correcto y barajado, lo que sirve como punto de partida para estudiar si el editor depende realmente del contacto.

## Benchmarks y rendimiento

Evaluación sobre las primeras ocho acciones a 80 Hz, con agregación por episodios iguales:

| Condición | Traslación (cm) | Rotación (grados) | MPJPE articular (cm) |
|---|---:|---:|---:|
| Base congelada | 1,4342 | 4,4381 | 0,5489 |
| Editor | 1,3765 | 4,1918 | 0,4568 |
| Tacto barajado | 1,3744 | 4,1808 | 0,4566 |

El artículo original reporta 1,39 / 4,17 / 0,46 para el modelo completo. La reproducción medida es cercana pero no idéntica.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,2 GB y el checkpoint es un `best.pt` de PyTorch, por lo que la huella es reducida frente a un LLM.
- GPU recomendadas: no disponibles en la información proporcionada; el loader acepta `device="cuda"`.
- Compatibilidad con GPU de consumo: probable dada la ausencia de backbone VLA en el checkpoint, pero no confirmada en la información disponible.
- Opciones de despliegue: carga mediante `load_editor.py` con `snapshot_download` de `huggingface_hub`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (editores de acciones táctiles sobre VLA).

## Limitaciones y advertencias

- El checkpoint es una reproducción del entrenamiento, no el original del artículo; los resultados difieren ligeramente de los publicados.
- Tacto correcto y tacto barajado obtienen resultados casi idénticos (1,3765 vs. 1,3744 cm de traslación), por lo que estos resultados no demuestran sensibilidad a la información de contacto actual.
- El backbone congelado usó un split de adaptación anterior y puede tener exposición upstream a grabaciones del test revisado; el split disjunto por grabación del editor no elimina esa exposición.
- Licencia no disponible: no se puede confirmar el uso comercial.
- El loader exige `weights_only=False` para los objetos de configuración guardados, lo que implica riesgos de seguridad al cargar checkpoints no confiables.
- Requiere un proceso Python limpio para evitar conflictos con otras versiones de `tactile_editor`.
- Las rutas históricas de la configuración de entrenamiento identifican la ejecución original y no son necesarias para `load_editor.py`.
- No es un modelo de propósito general: no genera texto, no soporta tool calling ni agentes, y su ámbito es exclusivamente robótico.

## Enlaces

- Hugging Face: https://huggingface.co/LeoJiangOR/twla-tachin-editor-reproduction
- Repositorio de código (revisión fuente): https://github.com/Rebuttal-kai/rebuttal-twla/commit/52c83858093b05f618304a27c094c55903c9e2d9
- Dataset: https://huggingface.co/datasets/MIT-Media-Lab/tachin-annotations-v1
