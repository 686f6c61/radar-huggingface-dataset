# prachigarg23/pi05_FAST_aloha_pick_up_ES_SS

## Resumen

π0.5 con tokenización FAST es un checkpoint de tipo vision-language-action (VLA) desarrollado por Prachi Garg y colaboradores (Steve Xing, Prahit Yaugand, Saurabh Gupta y Derek Hoiem), presentado en el artículo "Fine-Tuning VLAs with Self-Demonstrated Generative Control for Multi-Task Manipulation". El modelo parte del checkpoint base `pi05_base` y se ha afinado para la tarea de recogida (pick-up) de cubos rojos y verdes con el robot bimanual ALOHA, combinando demostraciones expertas con autodemonstraciones generadas por la política base en una proporción 1:1.

El problema que aborda es el coste de recopilar demostraciones expertas para el ajuste fino de políticas robóticas multitarea: en lugar de depender exclusivamente de teleoperación humana, el trabajo propone mezclar datos expertos con trayectorias autogeneradas por la propia política, reduciendo la dependencia de demostraciones humanas. El checkpoint publicado corresponde a la variante "ES+SS" (expert self-demos + self-supervised/self-demos) del estudio, en el paso 9999, e incluye únicamente pesos (`params/`) y activos (`assets/`), sin estado del optimizador.

La relevancia actual es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, pensado para reproducir los experimentos del artículo sobre un robot ALOHA real o simulado, no como un modelo de propósito general. La información pública disponible sobre arquitectura interna, número de parámetros y datos de entrenamiento es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5 con tokenización FAST; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | pesos en `params/` y activos en `assets/` (formato propio de openpi; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un VLA basado en π0.5, un modelo que combina percepción visual y comprensión del lenguaje con generación de acciones motoras, y que en esta variante emplea tokenización FAST (representación discreta y comprimida de las acciones que acelera la decodificación). El checkpoint se obtiene por ajuste fino del modelo base `pi05_base` sobre el dataset de demostraciones expertas `prachigarg23/aloha_pick_up_red_green_cubes_expert`, mezclado a razón de 1:1 con autodemonstraciones de la política base recogidas en `prachigarg23/aloha_pick_place_self_demos`. El entrenamiento se detuvo en el paso 9999 y solo se publican los pesos finales y las estadísticas de normalización (`assets/trossen/norm_stats.json`), sin estado del optimizador, lo que impide reanudar el entrenamiento tal cual.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición detallada de los datasets, ni sobre si se aplicaron etapas de RLHF o DPO. La innovación metodológica descrita en el artículo es el uso de autodemonstraciones generadas por la propia política como datos de aumento para el ajuste fino multitarea, lo que reduce la necesidad de teleoperación humana; el checkpoint aquí publicado es una de las configuraciones experimentales de ese estudio.

## Capacidades

- Control robótico bimanual: genera secuencias de acciones para el robot ALOHA orientadas a la tarea de recogida de cubos rojos y verdes.
- Percepción visual y condicionamiento por lenguaje: al ser un VLA, integra observaciones visuales e instrucciones en lenguaje para producir acciones.
- Tokenización FAST: decodificación de acciones mediante tokens discretos, lo que facilita la generación rápida de trayectorias.
- Multitarea parcial: entrenado con mezcla de datos expertos y autodemonstraciones de una tarea de pick-and-place, lo que sugiere cierta generalización entre variantes de la tarea.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM de propósito general.
- Capacidades multilingües: no disponibles; el modelo no está orientado a texto libre.
- No se documentan modos especiales como thinking mode, visión de documentos, audio u otras modalidades más allá de la percepción visual para control.

## Casos de uso

- Reproducción de experimentos del artículo: cargar el checkpoint con `scripts/serve_policy.py` del repositorio de código para replicar los resultados de la variante ES+SS en la tarea de pick-up de cubos rojos y verdes.
- Investigación en aprendizaje por imitación: comparar el rendimiento de esta política afinada con autodemonstraciones frente a la política base `pi05_base` y frente a variantes entrenadas solo con datos expertos, aislando el efecto de la mezcla 1:1.
- Evaluación en robot ALOHA real: desplegar la política en un banco ALOHA siguiendo el README de ALOHA del repositorio para medir tasas de éxito en la manipulación de cubos.
- Estudio de reducción de coste de datos: usar este checkpoint como referencia para cuantificar cuántas demostraciones expertas pueden sustituirse por autodemonstraciones sin degradar la tarea.
- Base para ajuste fino posterior: al estar bajo licencia Apache 2.0 y en formato openpi, puede servir como punto de partida para afinar en tareas de manipulación relacionadas con objetos de colores.
- Docencia y divulgación en robótica: ejemplo práctico de pipeline VLA completo (descarga de checkpoint, servicio de política, ejecución en robot) para cursos de robótica de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 12,4 GB, lo que da una cota inferior aproximada del espacio en disco necesario para los pesos, pero no se especifica la VRAM requerida.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se indica si cabe en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: servicio de política mediante `scripts/serve_policy.py` del repositorio `self-supervised-continual-control`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05_FAST_aloha_pick_up_ES_SS (este) | VLA π0.5 + FAST | Pick-up de cubos con ALOHA | Apache 2.0 | Hugging Face, 0 descargas |
| π0.5 base (`pi05_base`) | VLA π0.5 | Política base multitarea | no disponible en esta ficha | Referenciado como punto de partida del ajuste fino |
| Variantes del mismo artículo (ES solo, SS solo, etc.) | VLA π0.5 + FAST | Misma tarea con distintas mezclas de datos | Apache 2.0 (presumiblemente) | No se listan en la información disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con un conjunto reducido de demostraciones sobre cubos rojos y verdes, es probable que no generalice a otros objetos, colores o disposiciones no vistas.
- Riesgo de alucinación: en el contexto de un VLA, el equivalente es la generación de trayectorias inválidas o inseguras cuando la escena difiere de la distribución de entrenamiento; no se han publicado evaluaciones de robustez.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni los idiomas soportados; el condicionamiento por lenguaje probablemente esté limitado a las instrucciones presentes en los datos de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende del ecosistema openpi y de los términos de los datasets de origen, que no se detallan en la información disponible.
- Caveat de producción: es un checkpoint de investigación en el paso 9999, sin estado del optimizador, con cero descargas y sin validación externa; no debe considerarse listo para despliegue en entornos reales sin una evaluación propia.
- El repositorio es grande (12,4 GB) y requiere el entorno openpi y el repositorio de código para funcionar; no es un modelo autónomo de texto.

## Enlaces

- Hugging Face: https://huggingface.co/prachigarg23/pi05_FAST_aloha_pick_up_ES_SS
- Artículo (arXiv): https://arxiv.org/abs/2608.19490
- Página del proyecto: https://self-supervised-control.pages.dev/
- Código: https://github.com/prachigarg23/self-supervised-continual-control
- README de ALOHA: https://github.com/prachigarg23/self-supervised-continual-control/blob/main/third_party/aloha/README.md
- Dataset de demostraciones expertas: https://huggingface.co/datasets/prachigarg23/aloha_pick_up_red_green_cubes_expert
- Dataset de autodemonstraciones: https://huggingface.co/datasets/prachigarg23/aloha_pick_place_self_demos
