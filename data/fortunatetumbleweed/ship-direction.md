# fortunatetumbleweed/ship-direction

## Resumen

El modelo `fortunatetumbleweed/ship-direction` es una red neuronal convolucional tipo U-Net desarrollada por el usuario `fortunatetumbleweed` para estimar la dirección (heading) de un barco en un fotograma de juego de 80x80 píxeles, incluso cuando el barco está casi completamente oculto por elementos de la interfaz (retratos, texto de nombres de poblaciones, marcadores de minimapa). El sistema no se limita a clasificar la imagen: segmenta cada píxel como parte del barco (fondo, proa, casco, popa, vela izquierda o vela derecha) y, mediante un ajuste geométrico rígido posterior, calcula el ángulo exacto (0° = norte, en sentido horario) y reconstruye la silueta completa del barco en esa pose.

El modelo tiene 474.278 parámetros y se publica bajo licencia Apache-2.0. Está entrenado con 20.000 fotogramas sintéticos generados combinando un sprite canónico del barco con oclusores reales extraídos del propio juego. La relevancia del modelo reside en su capacidad para recuperar la orientación de un objeto bajo oclusiones severas, un problema habitual en visión por computador, y en su diseño de dos etapas que combina segmentación semántica con un ajuste geométrico basado en restricciones físicas (evitar que el barco flote sobre agua abierta).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (red convolucional para segmentación semántica) |
| Parámetros totales | 474.278 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de 80x80 píxeles) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de visión, sin dependencia de idioma) |
| Licencia | Apache-2.0 (código y pesos); los assets de juego subyacentes no están cubiertos |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El sistema completo consta de dos etapas. La primera es un U-Net que recibe un fotograma RGB de 80x80 (normalizado internamente con `x/255 - 0.5`) y genera un mapa de probabilidades por píxel con 6 clases: fondo, proa, casco, popa, vela izquierda y vela derecha. La segunda etapa, `part_pose`, es un ajuste geométrico rígido implementado en NumPy/FFT que busca, entre todas las rotaciones posibles, la pose que mejor explica las máscaras de partes generadas por la red. La función de puntuación combina tres términos: solape de las partes con el diseño canónico (recall sobre etiquetas), cobertura de los píxeles verdes reales visibles del barco (recall sobre píxeles) y una penalización por colocar la huella sobre agua abierta visible (precisión). Esta última restricción evita reconstrucciones físicamente imposibles.

El entrenamiento se realizó con 20.000 fotogramas sintéticos, generados rotando un sprite canónico del barco a ángulos aleatorios y componiendo oclusores reales (retratos, texto, marcadores) extraídos del juego. Las etiquetas se obtuvieron automáticamente rotando el mapa canónico de partes, por lo que no hubo anotación manual. Solo se etiquetaron las partes visibles, lo que enseña a la red a segmentar lo que realmente puede ver. El modelo se entrenó durante 22 épocas y se seleccionó el checkpoint por menor error de heading en fotogramas reales, no por precisión de píxeles.

## Capacidades

- Segmentación semántica por píxel: asigna etiquetas de parte del barco (proa, casco, popa, velas) en imágenes de 80x80.
- Estimación de heading con precisión subgrado en condiciones limpias y error medio de 6,1° con oclusión severa.
- Reconstrucción del barco completo en la pose estimada, pintando la silueta sobre el fotograma original.
- Robustez a oclusores habituales en juegos: retratos, texto de nombres de poblaciones y marcadores de minimapa.
- Identificación de qué partes del barco son visibles en cada fotograma (devuelve la lista `parts_seen`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo de visión especializado.

## Casos de uso

- Análisis de repeticiones en juegos de estrategia naval: el modelo extrae el rumbo exacto de cada nave en cada fotograma, incluso cuando la interfaz tapa parcialmente el sprite. Esto permite alimentar sistemas de replay, estadísticas de partida o análisis de jugadas.
- Reconstrucción visual de unidades ocultas: en un juego de estrategia, la UI (retratos, texto, marcadores) puede tapar a una nave. El modelo reconstruye el barco completo en su pose real, lo que permite renderizarlo por encima de la interfaz o en un minimapa ampliado para que el jugador siempre vea la orientación de su flota.
- Pruebas automatizadas de renderizado: en el desarrollo del juego, se puede integrar en un pipeline de CI/CD para verificar que la orientación de los sprites de barco se renderiza correctamente bajo distintas condiciones de oclusión, comparando el heading estimado con el valor esperado.
- Anotación semiautomática de datasets: el modelo puede generar etiquetas de orientación para nuevos fotogramas, reales o sintéticos, reduciendo el trabajo manual. Su capacidad de identificar partes visibles facilita la creación de máscaras de segmentación de calidad.
- Detección de errores de etiquetado en datos de entrenamiento: como se demuestra con el frame t083, el modelo puede señalar etiquetas físicamente imposibles, por ejemplo, un barco colocado sobre agua abierta. Esto resulta útil para auditar datasets en investigación de visión por computador.
- Sistema de ayuda para jugadores con discapacidad visual: el modelo puede reconstruir la orientación y posición de los barcos y convertirla en una señal sonora o háptica, ayudando a jugadores que no pueden distinguir los sprites cuando están tapados por la interfaz.
- Investigación en oclusiones severas: el modelo sirve como referencia para estudiar cómo combinar segmentación semántica con ajuste geométrico para recuperar la pose de objetos casi completamente ocultos, un problema relevante en robótica, vigilancia y análisis de escenas.

## Benchmarks y rendimiento

| Conjunto | Número de frames | Error medio | Dentro de 20° |
|---|---|---|---|
| Limpio | 12 | 0,7° | 12/12 |
| Ocluido | 9 | 6,1° | 9/9 |

Resultados sobre 21 fotogramas reales etiquetados. En el frame t083, originalmente etiquetado como 210° (físicamente imposible), el modelo estimó 174°, mientras que una CNN de regresión y un template matcher dieron ambos ~211°, replicando el error de la etiqueta. La etiqueta se corrigió a 174°.

En cuanto a velocidad, en una CPU Apple M-series la inicialización tarda ~60 ms y la inferencia ~39 ms por fotograma (10 ms de red + 29 ms de ajuste geométrico). El modelo se ejecuta en CPU por diseño, ya que para una sola imagen de 80x80 la transferencia a GPU supera el cómputo ahorrado.

## Requisitos de hardware

- VRAM estimada: no disponible en la información del modelo. Dado que tiene 474.278 parámetros y una entrada de 80x80, el consumo de memoria es trivial (menos de 2 MB en float32) y cabe en cualquier GPU moderna.
- GPU recomendadas: no se requiere GPU. El modelo está diseñado para ejecutarse en CPU; la transferencia a GPU resulta contraproducente para una sola imagen.
- Compatibilidad con GPU consumer: sí, cualquier GPU consumer (GTX, RTX, etc.) puede ejecutarlo, aunque no aporta ventaja frente a CPU.
- Opciones de despliegue: inferencia mediante script Python con PyTorch, NumPy, Pillow y safetensors. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de visión y no de un modelo de lenguaje.
- Latencia y throughput: ~39 ms por fotograma en CPU Apple M-series (10 ms red + 29 ms ajuste geométrico). Inicialización ~60 ms.

## Comparativa con modelos similares

No disponible. El autor menciona informalmente una comparación con una CNN de regresión y un template matcher, pero no publica especificaciones ni resultados completos. Solo se sabe que ambos fallaron en el frame t083, mientras que el modelo propuesto acertó. No se dispone de información sobre otros modelos de la misma categoría para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Sesgo de optimismo: los 9 fotogramas reales ocluidos son los únicos datos reales etiquetados, y los oclusores de entrenamiento se generaron a partir de esos mismos fotogramas y del retrato del juego. El rendimiento en fotogramas nuevos puede ser inferior.
- Riesgo de alucinación: el modelo puede reconstruir una pose incluso cuando hay muy pocos píxeles visibles. La penalización por agua abierta ayuda a evitar reconstrucciones imposibles, pero no es infalible si el agua no es visible.
- Fijación a un único sprite y escala: el modelo solo funciona con el sprite de barco del juego concreto y a su escala fija. Un icono diferente requiere reentrenamiento y un nuevo mapa canónico.
- Dependencia de la paleta del juego: las máscaras basadas en verde (`ship_green`, `open_mask_from_crop`) están ajustadas a la paleta de este juego y no se transfieren a otros escenarios.
- Restricciones de licencia: el código y los pesos son Apache-2.0, pero el sprite canónico en `canonical.npz` y los fotogramas de validación derivan de una obra comercial. Esos assets subyacentes no están cubiertos por la licencia y siguen siendo propiedad de su titular. Publicado para uso investigativo y educativo.
- Limitaciones de contexto e idioma: no aplica, al ser un modelo de visión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fortunatetumbleweed/ship-direction
- Repositorio en GitHub: https://github.com/fortunatetumbleweed-commits/ship_direction
