# amyjia1212/pi05-b1k-clean-a-keyboard-checkpoints

## Resumen

`amyjia1212/pi05-b1k-clean-a-keyboard-checkpoints` es un conjunto de checkpoints de un ajuste fino por LoRA del modelo fundacional de robótica **openpi π0.5** (variante condicionada por lenguaje), entrenado para la tarea 93 `clean_a_keyboard` del conjunto de demostraciones del BEHAVIOR Challenge 2026. Lo publica el usuario `amyjia1212` como experimento temprano (agosto-septiembre de 2026) dentro de su participación en dicho reto, y el propio autor advierte que **no se usó en la entrega final**: posteriormente migró al modelo PI_BEHAVIOR.

El repositorio contiene únicamente pesos de política visomotora (política de imitación tipo vision-language-action), no un modelo de lenguaje de propósito general: la entrada es observación RGB de 224×224 píxeles más una instrucción en lenguaje natural, y la salida es una secuencia de acciones motoras. El tamaño del repositorio (57,4 GB) corresponde a dos checkpoints completos (pasos 25000 y 29999) con parámetros y estadísticas de normalización.

Su relevancia es acotada y de nicho: sirve como referencia reproducible de un baseline π0.5 con LoRA sobre BEHAVIOR-1K, útil para investigadores que quieran replicar el pipeline de openpi en tareas de manipulación de objetos rígidos y articulados en simulación, pero no es un modelo apto para despliegue en producción ni para tareas fuera de su dominio de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5 de openpi, ajuste fino por LoRA; no se detalla la topología interna en la model card |
| Parametros totales | no disponible (el repositorio ocupa 57,4 GB e incluye dos checkpoints con `params/` y `assets/`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (procesa una observación RGB de 224×224 más una instrucción de tarea) |
| Tipos de cuantizacion | no disponible (se publican pesos en el formato nativo de openpi, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (condicionamiento por lenguaje natural, idioma de las instrucciones no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints de openpi en directorios `checkpoints/<step>/` con subcarpetas `params/` y `assets/` (estadísticas de normalización); sin safetensors ni GGUF declarados |

## Arquitectura y entrenamiento

El modelo parte de **openpi π0.5**, una política visomotora condicionada por lenguaje que mapea observaciones visuales e instrucciones textuales a acciones de robot. Sobre esa base se aplica un ajuste fino **LoRA**, lo que implica que solo se entrena un subconjunto de parámetros de baja jerarquía y que los pesos resultantes son un delta sobre el modelo original, no un modelo completo desde cero. El entrenamiento se realizó con el fork de openpi mantenido por `wensi-ai` (rama `behavior`), adaptado específicamente al entorno BEHAVIOR.

Los datos de entrenamiento son las demostraciones de la tarea 93 `clean_a_keyboard` del dataset `behavior-1k/2026-challenge-demos`, con observaciones RGB de 224×224. No se documenta el número de episodios, el número de tokens ni si hubo etapas de RLHF o DPO; en políticas de imitación como esta lo habitual es aprendizaje por imitación supervisada sobre trayectorias de demostración, pero ese detalle no se explicita en la model card. Se publican dos checkpoints, en los pasos 25000 y 29999, junto con las estadísticas de normalización necesarias para la inferencia.

## Capacidades

- Control visomotor condicionado por lenguaje para una única tarea de manipulación: limpiar un teclado (`clean_a_keyboard`).
- Procesamiento de observaciones RGB de 224×224 píxeles como entrada visual.
- Seguimiento de instrucciones en lenguaje natural para especificar la tarea a ejecutar.
- Generación de secuencias de acciones de robot (política de imitación), no generación de texto.
- Ajuste fino eficiente mediante LoRA sobre el modelo base π0.5.
- No se documentan capacidades de tool calling, razonamiento multi-paso explícito, visión general, audio ni modo de pensamiento.

## Casos de uso

- **Reproducción de un baseline π0.5 en BEHAVIOR-1K**: cargar los checkpoints de los pasos 25000 o 29999 con el fork `wensi-ai/openpi` (rama `behavior`) para verificar resultados de referencia en la tarea 93 antes de entrenar variantes propias.
- **Punto de partida para ajustes finos con LoRA**: al ser un delta LoRA sobre π0.5, sirve como inicialización para experimentos en tareas similares de manipulación de objetos rígidos, reduciendo el coste frente a entrenar desde el modelo base.
- **Depuración del pipeline de datos de BEHAVIOR**: usar el checkpoint como prueba de humo para validar que la carga de demostraciones, el preprocesado a 224×224 y las estadísticas de normalización de `assets/` son correctos.
- **Comparación de estrategias de adaptación**: contrastar este baseline LoRA con el modelo PI_BEHAVIOR que el autor usó finalmente, para medir la ganancia de cambiar de arquitectura base en la misma tarea.
- **Evaluación de robustez en simulación**: ejecutar la política sobre variaciones de la escena de `clean_a_keyboard` para estudiar sensibilidad a cambios de iluminación, posición de cámara o disposición de objetos.
- **Docencia y divulgación sobre VLA**: ilustrar el flujo completo de un modelo visión-lenguaje-acción (observación, instrucción, acción) con un checkpoint pequeño y de licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 57,4 GB e incluye dos checkpoints completos; se necesita espacio en disco suficiente para ambos si se descarga el repositorio entero.
- VRAM estimada para inferencia: no disponible. Al tratarse de un ajuste LoRA sobre π0.5, el consumo depende del tamaño del modelo base, que no se documenta.
- GPU recomendadas: no disponible. Para políticas VLA de este tipo es habitual requerir GPU con memoria dedicada, pero no hay datos concretos en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el ecosistema previsto es openpi (fork `wensi-ai/openpi`, rama `behavior`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `amyjia1212/pi05-b1k-clean-a-keyboard-checkpoints` | VLA π0.5 + LoRA | `clean_a_keyboard` (BEHAVIOR-1K) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| `amyjia1212/b1k-2026-t90-91-93-96-97` | PI_BEHAVIOR | Tareas 90, 91, 93, 96 y 97 | no disponible | no disponible | no disponible | Hugging Face |
| openpi π0.5 base | VLA | Política generalista condicionada por lenguaje | no disponible | no disponible | no disponible | Repositorio openpi |

La comparación cuantitativa con alternativas no es posible: no hay métricas de éxito publicadas para este checkpoint ni datos de parámetros del modelo base en la información disponible.

## Limitaciones y advertencias

- **Checkpoint descartado por el propio autor**: no se usó en la entrega final del BEHAVIOR Challenge 2026; fue sustituido por el modelo PI_BEHAVIOR. No debe tratarse como el resultado representativo de ese equipo.
- **Dominio extremadamente estrecho**: entrenado solo con demostraciones de la tarea 93 `clean_a_keyboard`. Es previsible un fallo sistemático en cualquier otra tarea, objeto o entorno.
- **Dependencia del simulador y del fork**: requiere el fork `wensi-ai/openpi` (rama `behavior`) y las estadísticas de normalización incluidas en `assets/`; usar otro pipeline puede invalidar las acciones generadas.
- **Riesgo de sobreajuste a las demostraciones**: con un ajuste LoRA sobre un conjunto limitado de episodios de una sola tarea, la generalización a variaciones de escena no está garantizada ni medida.
- **Sin datos de evaluación**: no hay tasas de éxito, ablaciones ni comparaciones publicadas, por lo que no es posible estimar su fiabilidad en producción.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base π0.5 y del dataset `behavior-1k/2026-challenge-demos`, que pueden imponer restricciones adicionales.
- **Sin soporte multilingüe documentado**: se desconoce en qué idioma se proporcionaron las instrucciones de condicionamiento y si el modelo responde a instrucciones en castellano.
- **Repositorio de gran tamaño**: 57,4 GB con dos checkpoints; la descarga y el almacenamiento tienen un coste considerable para un experimento no validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amyjia1212/pi05-b1k-clean-a-keyboard-checkpoints
- Checkpoint final del autor para estas tareas: https://huggingface.co/amyjia1212/b1k-2026-t90-91-93-96-97
- Repositorio de la participación en BEHAVIOR-1K 2026: https://github.com/amyjia1212/airii_behavior1k_2026
- Fork de openpi usado para el entrenamiento: https://github.com/wensi-ai/openpi (rama `behavior`)
- Dataset de demostraciones: https://huggingface.co/datasets/behavior-1k/2026-challenge-demos
