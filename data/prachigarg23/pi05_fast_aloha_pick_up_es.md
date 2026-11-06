# prachigarg23/pi05_FAST_aloha_pick_up_ES

## Resumen

`pi05_FAST_aloha_pick_up_ES` es un checkpoint de un modelo vision-language-action (VLA) basado en π0.5 con tokenización FAST, desarrollado por Prachi Garg y colaboradores (Steve Xing, Prahit Yaugand, Saurabh Gupta, Derek Hoiem) en el marco del trabajo "Fine-Tuning VLAs with Self-Demonstrated Generative Control for Multi-Task Manipulation". El modelo parte de `pi05_base` y se ha afinado exclusivamente con demostraciones expertas del dataset `aloha_pick_up_red_green_cubes_expert`, orientado a la tarea de recogida de cubos rojos y verdes con un brazo robótico ALOHA.

Se trata de un artefacto de investigación publicado en Hugging Face bajo la librería `openpi`, con un repositorio de 12,4 GB que contiene únicamente pesos (`params/`) y activos auxiliares (`assets/`), sin estado del optimizador. El checkpoint corresponde al paso 9000 de entrenamiento y se distribuye con licencia Apache 2.0, lo que permite su uso comercial y su modificación.

La relevancia del modelo es acotada y experimental: no es un modelo de propósito general, sino una política robótica especializada en una tarea concreta de manipulación, concebida como línea base ("baseline") para comparar con métodos de control generativo auto-demostrado. Su interés principal reside en la reproducibilidad del pipeline de fine-tuning de VLAs sobre ALOHA y en servir de referencia dentro del artículo citado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 con tokenización FAST |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio con directorios `params/` y `assets/`, librería `openpi`) |

## Arquitectura y entrenamiento

El modelo es un VLA derivado de π0.5, la familia de políticas de visión-lenguaje-acción de Physical Intelligence, adaptada aquí con tokenización FAST para la generación de acciones. El checkpoint se obtiene por fine-tuning de `pi05_base` sobre demostraciones expertas de la tarea ALOHA de recogida de cubos rojos y verdes, contenidas en el dataset `prachigarg23/aloha_pick_up_red_green_cubes_expert`. El entrenamiento alcanza el paso 9000 y el repositorio incluye las estadísticas de normalización en `assets/trossen/norm_stats.json`, necesarias para la inferencia sobre el robot Trossen.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición completa del dataset, ni si se aplicaron etapas de RLHF o DPO. El trabajo marco propone el fine-tuning de VLAs con control generativo auto-demostrado para manipulación multi-tarea, pero este checkpoint concreto corresponde a la variante "ES" (baseline) entrenada solo con demostraciones expertas, sin el componente de auto-demostración. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal más allá de la tokenización FAST.

## Capacidades

- Control robótico de manipulación: genera acciones motoras para un brazo ALOHA en la tarea de recogida de cubos rojos y verdes.
- Percepción visión-lenguaje: procesa observaciones visuales y produce acciones condicionadas, propio de la arquitectura VLA π0.5.
- Tokenización FAST para acciones: representación discreta de acciones que facilita el entrenamiento generativo.
- Ejecución sobre robot físico: incluye estadísticas de normalización para el hardware Trossen y scripts de servicio (`scripts/serve_policy.py`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): visión integrada como parte del VLA; no se documentan otras.

## Casos de uso

- Línea base para investigación en VLAs: sirve como referencia de comparación frente a métodos de control generativo auto-demostrado en el artículo citado, permitiendo aislar la contribución del componente de auto-demonstración.
- Reproducción de experimentos de manipulación ALOHA: el checkpoint y los scripts permiten reproducir la tarea de recogida de cubos rojos y verdes en un robot Trossen, facilitando la validación de resultados.
- Evaluación de pipelines de fine-tuning: al partir de `pi05_base` y entrenarse solo con demostraciones expertas, permite estudiar el efecto del número de pasos (9000) y de la composición del dataset en el rendimiento final.
- Desarrollo de sistemas de pick-and-place: la política puede integrarse en flujos de recogida y colocación de objetos de colores, un caso frecuente en laboratorios de robótica.
- Benchmarking de hardware robótico: útil para medir latencia y fiabilidad de inferencia de VLAs sobre el brazo ALOHA/Trossen en condiciones controladas.
- Docencia y formación en robótica: ejemplo práctico y reproducible de despliegue de un VLA con `openpi` y Hugging Face, adecuado para cursos avanzados de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (12,4 GB) incluye pesos y activos, pero no se especifica el número de parámetros ni la precisión de los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `openpi` mediante `scripts/serve_policy.py` con configuración `pi05_FAST_aloha_pick_up_ES`; descarga vía `hf download`; ejecución sobre robot ALOHA/Trossen según el README de `third_party/aloha`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi05_FAST_aloha_pick_up_ES` | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |
| `pi05_base` (modelo base de π0.5) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros checkpoints ALOHA del mismo proyecto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de parámetros, contexto ni rendimiento para modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea de recogida de cubos rojos y verdes con ALOHA; no generaliza a otras tareas sin fine-tuning adicional.
- Dataset reducido y de un solo dominio: al entrenarse solo con demostraciones expertas de un dataset concreto, puede sobreajustar y fallar ante variaciones de iluminación, posición de objetos o hardware distinto.
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento que permita evaluar su robustez frente a alternativas.
- Riesgo de alucinación motora: como política generativa, puede producir acciones no válidas o inseguras; requiere supervisión y límites de seguridad en el robot.
- Sesgos: no documentados, pero inherentes a la distribución de demostraciones del dataset (colores, posiciones y condiciones específicas).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar las licencias de `pi05_base` y de las dependencias de `openpi`.
- Repositorio sin estado del optimizador: solo contiene `params/` y `assets/`, por lo que no es posible reanudar el entrenamiento desde este checkpoint sin los datos originales.
- Idiomas y contexto: no disponibles; al ser un VLA orientado a control, las capacidades lingüísticas no están documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/prachigarg23/pi05_FAST_aloha_pick_up_ES
- Dataset: https://huggingface.co/datasets/prachigarg23/aloha_pick_up_red_green_cubes_expert
- Paper: https://arxiv.org/abs/2608.19490
- Project page: https://self-supervised-control.pages.dev/
- Código: https://github.com/prachigarg23/self-supervised-continual-control
- README ALOHA: https://github.com/prachigarg23/self-supervised-continual-control/blob/main/third_party/aloha/README.md
