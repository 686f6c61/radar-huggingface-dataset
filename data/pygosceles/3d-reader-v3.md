# Pygosceles/3D-Reader-V3

## Resumen

3D-Reader-V3 es un ajuste fino experimental del checkpoint público reader-v3, desarrollado por Pygosceles en el contexto del Vesuvius Challenge para la detección de tinta en papiros de Herculano carbonizados. El modelo parte de la arquitectura original de reader-v3 (34,55 M de parámetros, stem de fusión de profundidad 3D más una U-Net 2D que procesa 17 planos de entrada a unos 9,6 µm) y añade una cabeza de profundidad de 528 parámetros (una convolución 1x1 sobre la etapa más fina del decodificador) que emite 16 logits por píxel, uno por cada plano de la ventana de entrada.

El problema que aborda es la localización de la tinta en la hoja concreta del rollo: el modelo base detecta tinta en la proyección 2D, pero no indica en qué plano del volumen CT se sitúa cada trazo. Esta cabeza auxiliar permite asignar cada píxel de tinta a su hoja, lo que resulta relevante para la reconstrucción volumétrica y el desenrollado virtual de los papiros.

La relevancia actual del modelo es acotada: se trata de un experimento de investigación con una única semilla de entrenamiento, una mejora medida de entre +0,0054 y +0,0075 en AUC sobre el modelo base en el test upstream, y sin validación independiente de la calidad de las probabilidades de profundidad. No es un modelo de propósito general ni un modelo de lenguaje: es un segmentador de imágenes especializado en un dominio muy concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Stem de fusión de profundidad 3D + U-Net 2D, con cabeza de profundidad 1x1 añadida sobre la etapa más fina del decodificador |
| Parámetros totales | 34,55 M (modelo base) + 528 (cabeza de profundidad) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de segmentación de imágenes; entrada de 17 planos a ~9,6 µm, ventanas de 320 px en entrenamiento) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Otra (`same-as-upstream-reader-v3`); hereda las condiciones del checkpoint reader-v3 original |
| Formato de pesos | `safetensors` (`reader_v3_depth_head.safetensors`) y `.pt` (`reader_v3_depth_head_last.pt`, `state_dict` + `head` + `step`) |

## Arquitectura y entrenamiento

El modelo reutiliza la red reader-v3 de `vesuvius.ink_detection` (proyecto villa): un stem que fusiona información de profundidad 3D sobre 17 planos de entrada renderizados a 9,6 µm y una U-Net 2D que produce el mapa de tinta. Sobre la salida de la etapa más fina del decodificador (`net.model.network.shared_decoder.stages[-1]`, 32 canales) se aplica una convolución 1x1 que genera 16 logits por píxel, correspondientes a los 16 planos centrales de la ventana de 17. La carga del checkpoint en una red recién construida reproduce exactamente los logits del checkpoint original (diferencia absoluta máxima de 0,0).

El ajuste fino se realizó sin etiquetas humanas 3D. Se usaron 13 segmentos de datos abiertos: 8 del Scroll 1 (PHercParis4) y 5 del Scroll 4 (PHerc1667), en renders de superficie de 17 planos a 9,6 µm. Las etiquetas 2D combinan la etiqueta humana con la predicción upstream registrada a 2,4 µm (umbral ≥ 128); los píxeles "maybe" nunca se entrenan y el 10 % derecho de cada segmento se reserva como held-out. La supervisión de profundidad proviene de volúmenes de probabilidad 3D de Hecate a 9,6 µm, con la etiqueta 2D ajustada a la hoja portadora de tinta (perfil de profundidad del profesor restringido a ±1 plano alrededor de su pico).

La receta emplea SGD con momentum 0,99 Nesterov, learning rate 2e-4, warm-up de 200 pasos, normalización robusta MAD por ventana, flips y rotaciones de 90° en GPU, BCE enmascarada 2D más BCE enmascarada sobre los 16 planos de profundidad, batch de 6 ventanas refinadas más ~9 ventanas del store de entrenamiento de reader-v3 a 320 px, semilla 0 y parada por regla de meseta en el paso 7500. La mezcla con el store original es crítica: sin ella, la red se especializa en los Scroll 1 y 4 y pierde transferencia (AUC de 0,75-0,79 en el test upstream en los primeros intentos).

## Capacidades

- Segmentación de tinta en volúmenes CT de papiros carbonizados (detección binaria de tinta por píxel).
- Predicción de profundidad por píxel: 16 logits por píxel que indican en qué plano de la ventana se sitúa la tinta.
- Transferencia entre rollos: entrenado en segmentos de Scroll 1 y Scroll 4, evaluado en el test upstream de 8 segmentos.
- Procesamiento de ventanas de 17 planos a ~9,6 µm con normalización robusta MAD por ventana.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto: es un modelo de visión por computador de dominio específico.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del pipeline de detección de tinta.

## Casos de uso

- Detección de tinta con localización de hoja: el modelo permite obtener, además del mapa 2D de tinta, la probabilidad de que cada trazo se sitúe en cada uno de los 16 planos, lo que facilita separar trazos de hojas distintas enrolladas en el volumen CT.
- Reconstrucción volumétrica de papiros: las probabilidades de profundidad por plano sirven como señal auxiliar para el desenrollado virtual y el trazado de superficies de la hoja, al aportar una estimación suave de la posición de la tinta en el eje Z.
- Auditoría y comparación de modelos de tinta: al mantener los logits del checkpoint original intactos, el modelo sirve como referencia para comparar mapas de tinta antes y después del ajuste fino en el mismo harness de evaluación.
- Investigación en supervisión débil: el pipeline de etiquetas (etiqueta humana AND predicción upstream, exclusión de píxeles "maybe", supervisión de profundidad desde un profesor) es replicable como receta para otros dominios con anotación escasa.
- Evaluación de transferencia entre rollos: el modelo y su conjunto de test permiten medir la degradación de AUC al pasar de los segmentos de entrenamiento a los 8 segmentos del test upstream.
- Generación de mapas de color de profundidad para inspección visual: la salida de la cabeza puede convertirse en un mapa de tono (azul = plano superior, rojo = plano de malla, verde = plano inferior) para revisión cualitativa por parte de papirólogos.
- Prototipado en el ecosistema Vesuvius: el checkpoint en `.pt` con `weights_only=True` se integra en flujos de PyTorch existentes sin dependencias adicionales, aunque requiere adaptar los loaders del paquete `vesuvius`.

## Benchmarks y rendimiento

Resultados en el test upstream (8 segmentos, AUC sobre etiquetas humanas, pesos iguales, mismo harness para todas las filas, una semilla por configuración):

| Modelo | P384 | P448 |
|---|---|---|
| reader-v3 original (control positivo; referencia del README 0,892) | 0,8893 | 0,892 |
| Control de tarea única (misma receta, cabeza de profundidad no entrenada) | 0,8911 | 0,8941 |
| **Este modelo (film ±1)** | **0,8968** | **0,8994** |
| film ±1, otras semillas / ejecución de 13 segmentos | 0,8947 / 0,8968 | 0,8957 / 0,8991 |
| film ±3 | 0,8933 | 0,8953 |
| cualquier hoja (sin restricción de film) | 0,8841 | 0,8871 |

La mejora sobre el modelo original es de +0,0054 a +0,0075 en P384 y de una sola semilla; las réplicas con otras semillas seguían entrenándose en el momento de publicar la model card. Tres de los 8 segmentos de test aparecen también en la lista de entrenamiento de reader-v3, por lo que son in-sample tanto para el modelo original como para el ajustado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 34,55 M de parámetros y ventanas de 320 px y 17 planos, la huella es reducida y compatible con GPU de consumo, aunque el autor no publica cifras.
- GPU recomendadas: no disponible; el entrenamiento se realizó con batches de 6 + ~9 ventanas a 320 px, lo que sugiere GPU de gama media o superior, pero no se especifica el hardware.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del modelo (0,3 GB de repo), aunque no se confirma en la información disponible.
- Opciones de despliegue: PyTorch nativo; el checkpoint `.pt` carga con `weights_only=True`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: el autor mide un coste de +1,3 % de tiempo frente a reader-v3 al añadir la cabeza; no se publican cifras absolutas de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento (AUC P384) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 3D-Reader-V3 (este) | 34,55 M + 528 | 17 planos a ~9,6 µm, ventanas de 320 px | 0,8968 | `same-as-upstream-reader-v3` | HuggingFace (Pygosceles/3D-Reader-V3) |
| reader-v3 original | 34,55 M | 17 planos a ~9,6 µm | 0,8893 | La del checkpoint upstream | Checkpoint público de referencia |
| Hecate | No disponible | Volúmenes 3D a 9,6 µm | No disponible en esta ficha | No disponible | HuggingFace (scrollprize/hecate) |
| Predicción upstream 2,4 µm | No disponible | Renders a 2,4 µm | No disponible en esta ficha | No disponible | Usada como etiqueta de referencia |

## Limitaciones y advertencias

- Una sola semilla de entrenamiento por configuración y sin intervalos de confianza: la mejora sobre el modelo original queda dentro de lo que el ruido de semilla podría producir hasta que terminen las réplicas.
- No se ha ejecutado a través de los loaders del paquete `vesuvius`; el punto de adaptación está documentado en la rama de GitHub, pero no hay integración validada.
- Las probabilidades de profundidad son objetivos suaves, no calibrados: no deben interpretarse como probabilidades bien calibradas.
- Posible solapamiento entre los segmentos de entrenamiento de Hecate y los de test: la lista de entrenamiento de Hecate no está publicada, por lo que no puede descartarse contaminación.
- Tres de los 8 segmentos de test aparecen en la lista de entrenamiento de reader-v3, por lo que son in-sample para ambos modelos.
- El ajuste fino se limita a segmentos de Scroll 1 y Scroll 4; no se usaron datos de otros rollos, lo que restringe la generalización a otros papiros.
- La licencia `same-as-upstream-reader-v3` hereda las condiciones del checkpoint original; deben revisarse antes de cualquier uso comercial.
- Es un modelo de dominio muy específico: no es adecuado para tareas de lenguaje, razonamiento general ni visión fuera del pipeline de detección de tinta en papiros de Herculano.
- El orden de planos y la dirección de render deben coincidir con lo que espera el checkpoint (véase la rama `render-direction-and-intensity-check`); un orden incorrecto invalida las predicciones de profundidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pygosceles/3D-Reader-V3
- Código, tests y write-up completo: https://github.com/StewartSethA/villa/tree/progress-2026-11/sheet-localized-3d-ink-head
- Modelo Hecate (profesor de profundidad): https://huggingface.co/scrollprize/hecate
