# austinpatel/pi05_libero_regenerated_lora

## Resumen

pi05_libero_regenerated_lora es un checkpoint de ajuste fino mediante LoRA del modelo base physical-intelligence/pi05_base (π0.5), publicado por el usuario de HuggingFace austinpatel. Se trata de un modelo de robótica (pipeline `robotics`) orientado a manipulación, distribuido a través de la librería openpi de Physical Intelligence. El repositorio contiene un único directorio de paso de entrenamiento en formato Orbax con las particiones `params/`, `train_state/`, `assets/` y `_CHECKPOINT_METADATA`, y ocupa 9,6 GB.

El modelo se ha especializado sobre el benchmark LIBERO (sus cuatro suites originales) y se publica junto con el proyecto Behavior Prompting del grupo real-stanford. El ajuste se realizó sobre un dataset propio, `austinpatel/libero_regenerated_openpi`, que es una conversión a formato LeRobot de 256x256 del dataset LIBERO original, distinta del dataset LIBERO que openpi proporciona de serie. Por ese motivo la configuración de entrenamiento se denomina `pi05_libero_lora_my_regeneration`.

Su relevancia actual es acotada y muy específica: es un artefacto de investigación para reproducir y evaluar políticas de visión-lenguaje-acción (VLA) en simuladores de manipulación compatibles con openpi, no un modelo de propósito general. En el momento de la consulta no acumula descargas ni "likes", y no se ha publicado información sobre parámetros, contexto, licencia ni idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (vision-language-action, VLA); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (checkpoint openpi); incluye params/, train_state/, assets/ y _CHECKPOINT_METADATA |
| Modelo base | physical-intelligence/pi05_base |
| Tipo de ajuste | LoRA (fine-tuning de bajo rango) |
| Framework / libreria | openpi (fork `liberogen` de austinapatel) |
| Tamano del repositorio | 9,6 GB |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | austinpatel/libero_regenerated_openpi |
| Paso de entrenamiento | 29999 |
| Nombre de experimento | pi05_libero_my_regeneration_lora_seed0_v1 |
| Config de entrenamiento | pi05_libero_lora_my_regeneration |

## Arquitectura y entrenamiento

El checkpoint es un ajuste fino LoRA sobre pi05_base (π0.5), el modelo de robótica de Physical Intelligence. Al tratarse de un artefacto derivado, la arquitectura subyacente es la del modelo base (π0.5), pero la información proporcionada no detalla su composición interna (backbone de visión-lenguaje, experto de acción, mecanismo de flow matching u otros). El repositorio se distribuye como checkpoint en bruto de openpi en formato Orbax, con las particiones `params/`, `train_state/`, `assets/` y `_CHECKPOINT_METADATA`; la partición `train_state/` solo es necesaria para reanudar el entrenamiento y puede excluirse para inferencia.

El entrenamiento se realizó sobre `austinpatel/libero_regenerated_openpi`, una conversión propia a LeRobot de 256x256 del dataset LIBERO original, con la configuración `pi05_libero_lora_my_regeneration` y el experimento `pi05_libero_my_regeneration_lora_seed0_v1`, hasta el paso 29999. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si se emplearon técnicas de RLHF, DPO u otras etapas de alineamiento. El checkpoint se publica en el marco del proyecto Behavior Prompting (real-stanford).

## Capacidades

- Control robótico para manipulación: el modelo está especializado en las cuatro suites originales del benchmark LIBERO.
- Políticas de visión-lenguaje-acción (VLA): genera acciones a partir de entradas visuales y de lenguaje (comportamiento típico de la familia π0.5).
- Behavior prompting: diseñado para su uso dentro del proyecto Behavior Prompting.
- Adaptación eficiente mediante LoRA: al ser un ajuste de bajo rango, permite reutilizar el modelo base y añadir el adaptador.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos en LIBERO: cargar el checkpoint en el fork `liberogen` de openpi y ejecutar la evaluación de las cuatro suites para replicar los resultados del experimento `pi05_libero_my_regeneration_lora_seed0_v1`.
- Investigación en behavior prompting: usar el modelo como política base dentro del proyecto real-stanford/behavior_prompting siguiendo las instrucciones de `docs/libero_openpi.md`.
- Comparación de conversiones de dataset: al estar entrenado sobre `libero_regenerated_openpi` (conversión LeRobot 256x256 propia) y no sobre el LIBERO de openpi, sirve para estudiar el impacto de distintas conversiones de datos en el rendimiento de la política.
- Fine-tuning posterior: partir de este adaptador LoRA o del modelo base para especializar la política en nuevas tareas de manipulación.
- Desarrollo de pipelines de control en simulación: integrar el modelo servido desde openpi en entornos simulados compatibles para pruebas de políticas de manipulación.
- Benchmarking de adaptadores LoRA en robótica: evaluar la eficacia del ajuste de bajo rango frente a fine-tuning completo sobre el mismo dataset y config de entrenamiento.
- Estudio de reanudación de entrenamiento: emplear la partición `train_state/` para continuar el entrenamiento desde el paso 29999.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Tamano del repositorio: 9,6 GB; la partición `train_state/` puede excluirse para inferencia, reduciendo el espacio necesario.
- Opciones de despliegue: openpi (servido y evaluado según las instrucciones de `docs/libero_openpi.md`). No se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| pi05_libero_regenerated_lora | no disponible | no disponible | no disponible | LoRA sobre pi05_base, especializado en LIBERO |
| physical-intelligence/pi05_base | no disponible | no disponible | no disponible | Modelo base π0.5 sin ajustar |
| Otros modelos de robótica comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse uso comercial sin confirmar los términos del modelo base y del proyecto Behavior Prompting.
- Ámbito restringido: es un checkpoint especializado en el benchmark LIBERO; no es un modelo de propósito general.
- Sin resultados de benchmarks publicados: no hay evidencia numérica de rendimiento en la información proporcionada.
- Dependencia de un fork concreto: el uso está ligado al fork `liberogen` de openpi y a una configuración de entrenamiento específica, lo que limita la portabilidad.
- Un solo experimento y semilla: el nombre indica `seed0`, por lo que no hay evidencia de variabilidad entre semillas.
- Evaluación en simulación: LIBERO es un entorno simulado; su comportamiento en hardware físico no está documentado.
- Dataset no estándar: entrenado sobre una conversión propia de LIBERO, no sobre el dataset oficial de openpi, lo que puede afectar a la comparabilidad con otros checkpoints.
- Ausencia de información sobre sesgos, idiomas y alucinación: no disponible (al ser un modelo de robótica, la noción de alucinación de texto no aplica directamente).
- Modelo sin tracción: 0 descargas y 0 "likes", sin validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/austinpatel/pi05_libero_regenerated_lora
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/austinpatel/libero_regenerated_openpi
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Fork de openpi `liberogen` (austinapatel): https://github.com/austinapatel/openpi
- Proyecto Behavior Prompting (real-stanford): https://github.com/real-stanford/behavior_prompting
- Documentación de evaluación LIBERO + openpi: https://github.com/real-stanford/behavior_prompting/blob/main/docs/libero_openpi.md
