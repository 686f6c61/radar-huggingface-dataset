# amyjia1212/pi05-b1k-cook-broccolini-checkpoints

## Resumen

`pi05-b1k-cook-broccolini-checkpoints` es un checkpoint de robótica basado en el modelo openpi π0.5 (language-conditioned), publicado por el usuario amyjia1212 como experimento temprano para la BEHAVIOR Challenge 2026, concretamente para la tarea 96 (`cook_broccolini`). El autor indica explícitamente que este checkpoint no se utilizó en la entrega final y que fue sustituido posteriormente por el modelo PI_BEHAVIOR y por el checkpoint `amyjia1212/b1k-2026-t90-91-93-96-97`.

Se trata de un fine-tune completo del baseline oficial π0.5, entrenado con el fork de openpi del equipo (`wensi-ai/openpi`, rama `behavior`) sobre 96 demostraciones de la tarea de cocinar brócoli de broccolini del dataset `behavior-1k/2026-challenge-demos`, con imágenes RGB de 224×224. El repositorio incluye checkpoints en los pasos 40000 y 49999, con pesos (`params/`) y assets que contienen las estadísticas de normalización.

Su relevancia es acotada y de carácter experimental: sirve como referencia reproducible de un baseline π0.5 para tareas de manipulación doméstica en BEHAVIOR-1K, útil para investigadores que quieran comparar sus propios fine-tunes o reproducir la curva de entrenamiento del baseline oficial. No es un modelo de propósito general ni un asistente conversacional, sino una política visuomotora condicionada por lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | openpi π0.5 (política visuomotora condicionada por lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints publicados en precisión de entrenamiento) |
| Idiomas soportados | no disponible (condicionamiento por lenguaje; idioma de las instrucciones no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints de openpi (`params/` y `assets/` con norm stats); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un full fine-tune del baseline openpi π0.5, una política visuomotora condicionada por lenguaje que procesa observaciones RGB de 224×224 y produce acciones motoras. El entrenamiento se realizó con el fork de openpi mantenido por `wensi-ai` (rama `behavior`), adaptado específicamente para BEHAVIOR-1K. No se detalla en la model card el número total de tokens, la composición completa del dataset más allá de las 96 demostraciones de `cook_broccolini`, ni si se aplicaron etapas de RLHF o DPO; al tratarse de una política de imitación, lo esperable es entrenamiento supervisado sobre demostraciones, pero este extremo no está confirmado en la información disponible.

Los artefactos publicados son los checkpoints de los pasos 40000 y 49999, cada uno con el directorio `params/` y `assets/` (estadísticas de normalización). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, ni detalles sobre la inicialización o congelación de capas.

## Capacidades

- Generación de acciones motoras condicionadas por instrucciones en lenguaje natural para tareas de manipulación doméstica.
- Procesamiento de observaciones visuales RGB a 224×224 como entrada de la política.
- Ejecución de la tarea específica `cook_broccolini` (tarea 96 de BEHAVIOR-1K).
- Fine-tune completo sobre demostraciones humanas (96 episodios), orientado a imitación supervisada.
- Integración con el ecosistema openpi (carga de checkpoints, norm stats y pipeline de evaluación del fork `behavior`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio ni modo de pensamiento.

## Casos de uso

- Reproducción del baseline π0.5 en BEHAVIOR-1K: permite replicar el entrenamiento del baseline oficial para la tarea 96 y comparar curvas de aprendizaje entre los pasos 40000 y 49999.
- Evaluación comparativa de políticas: sirve como referencia frente a modelos como PI_BEHAVIOR o fine-tunes propios, al compartir el mismo pipeline de openpi y las mismas estadísticas de normalización.
- Estudio de curvas de entrenamiento: los dos checkpoints publicados permiten analizar la evolución del rendimiento entre pasos y detectar saturación o sobreajuste.
- Desarrollo de pipelines de imitación: útil para validar la integración del fork `wensi-ai/openpi` (rama `behavior`) con el dataset `2026-challenge-demos` antes de escalar a otras tareas.
- Base para transfer learning: punto de partida para fine-tunes en tareas relacionadas de cocina o manipulación de objetos alargados, reutilizando los pesos y norm stats.
- Docencia e investigación en robótica: ejemplo reproducible de full fine-tune de una política visuomotora condicionada por lenguaje sobre un dataset de demostraciones pequeño (96 episodios).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 179,0 GB, lo que incluye los checkpoints de dos pasos y los assets, no el tamaño de un único checkpoint en memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ecosistema openpi (carga de checkpoints `params/` y `assets/`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son adecuados para políticas visuomotoras.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `amyjia1212/pi05-b1k-cook-broccolini-checkpoints` | openpi π0.5 | `cook_broccolini` (tarea 96) | 96 demos de `2026-challenge-demos` | Apache 2.0 | Público en Hugging Face |
| `amyjia1212/b1k-2026-t90-91-93-96-97` | PI_BEHAVIOR | Tareas 90, 91, 93, 96 y 97 | no disponible | no disponible en la información proporcionada | Público en Hugging Face (checkpoint final del autor) |
| openpi π0.5 baseline oficial | openpi π0.5 | Multitarea (BEHAVIOR-1K) | no disponible | Apache 2.0 (según openpi) | Público en el repositorio openpi |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental: el propio autor indica que no se utilizó en la entrega final de la BEHAVIOR Challenge 2026.
- Entrenado únicamente para la tarea 96 (`cook_broccolini`); no generaliza a otras tareas sin fine-tune adicional.
- Dataset de entrenamiento muy reducido (96 demostraciones), con riesgo de sobreajuste y baja robustez ante variaciones de entorno, iluminación o disposición de objetos.
- Sin datos publicados de benchmarks, latencia o robustez; no es posible validar su rendimiento real a partir de la model card.
- Riesgo de alucinación en el sentido de acciones no fundamentadas en la observación; no se documentan mitigaciones.
- No se especifican sesgos conocidos ni limitaciones idiomáticas del condicionamiento por lenguaje.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende del ecosistema openpi y de sus dependencias; conviene revisar las licencias de los componentes de terceros.
- Tamaño del repositorio elevado (179,0 GB) por incluir varios checkpoints; requiere planificación de almacenamiento y ancho de banda para su descarga.
- Para producción en robótica real se requiere validación en el entorno físico objetivo; no hay garantías de seguridad física derivadas de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amyjia1212/pi05-b1k-cook-broccolini-checkpoints
- Checkpoint final del autor: https://huggingface.co/amyjia1212/b1k-2026-t90-91-93-96-97
- Repositorio del proyecto 2026: https://github.com/amyjia1212/airii_behavior1k_2026
- Fork de openpi utilizado: https://github.com/wensi-ai/openpi (rama `behavior`)
- Dataset de demostraciones: https://huggingface.co/datasets/behavior-1k/2026-challenge-demos
