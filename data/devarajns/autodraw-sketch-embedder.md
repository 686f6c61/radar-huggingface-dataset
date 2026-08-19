# devarajns/autodraw-sketch-embedder

## Resumen

El modelo `autodraw-sketch-embedder`, desarrollado por devarajns, es un encoder ONNX de 1,9 MB que transforma un boceto dibujado a mano en un vector unitario de 64 dimensiones para recuperación de iconos por similitud. Está pensado para ejecutarse en el navegador mediante ONNX Runtime Web, lo que lo hace adecuado para aplicaciones interactivas de dibujo y búsqueda visual. A diferencia de un clasificador tradicional, este modelo es un encoder: la cobertura de iconos depende del índice que se construya sobre los embeddings, no de los pesos del modelo, por lo que puede alcanzar iconos no vistos durante el entrenamiento de forma zero-shot basándose en la forma.

El modelo se entrenó con 479 iconos emparejados con bocetos del conjunto Quick Draw, abarcando 37 clases (439 para entrenamiento y 40 retenidos para validación). Comparte un único encoder para iconos y bocetos, lo que reduce el tamaño a la mitad frente a una arquitectura de dos torres. Incluye una cabeza auxiliar de clasificación de 37 clases que sirve como señal de entrenamiento y como prior débil en inferencia. Sus métricas de recuperación son sólidas: Recall@1 de 0,8878 y Recall@10 de 0,9309 sobre bocetos retenidos, con un Recall@10 de 0,9657 para iconos completamente fuera del entrenamiento.

La relevancia actual de este modelo radica en su tamaño mínimo (501.798 parámetros), su capacidad de ejecución en clientes ligeros y su enfoque en la recuperación de iconos a partir de trazos, un problema común en herramientas de dibujo asistido, editores gráficos y sistemas de accesibilidad. Su licencia CC-BY-4.0 permite uso comercial con atribución, y al ser un encoder, ofrece flexibilidad para construir índices personalizados sobre cualquier colección de iconos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la documentación (encoder ONNX, 501.798 parámetros) |
| Parametros totales | 501.798 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de visión, entrada de imagen 64x64) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (procesa imágenes, no texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la documentación proporcionada; solo se indica que es un encoder ONNX con 501.798 parámetros y una salida de embedding L2-normalizado de 64 dimensiones. El diseño es de una sola torre: iconos y bocetos se reducen al mismo dominio de bitmap de trazos y comparten el mismo encoder, lo que elimina el sesgo entre torres y reduce el tamaño del modelo a la mitad frente a una arquitectura de dos torres.

El entrenamiento se realizó con 479 iconos emparejados con bocetos de Quick Draw, abarcando 37 clases (439 de entrenamiento, 40 retenidos). Se usó el optimizador AdamW con learning rate 0,001, weight decay 0,0001, durante 8 épocas con batch de 256. La función de pérdida combina un objetivo contrastivo con temperatura 0,07 y una pérdida de clasificación auxiliar con peso 1,0. El entrenamiento utilizó algoritmos deterministas con semilla 20260815. Los datos provienen de SVGDepot (iconos) y Google Quick Draw (bocetos), ambos bajo licencias permisivas (CC BY 4.0 para Quick Draw). El modelo se publica solo con los pesos del encoder; los iconos no se redistribuyen.

## Capacidades

- Genera embeddings de 64 dimensiones L2-normalizados a partir de bocetos rasterizados, permitiendo similitud coseno como producto punto.
- Recuperación de iconos por similitud de forma, alcanzando iconos no vistos durante el entrenamiento de forma zero-shot (aunque con mayor ruido que los vistos).
- Cabeza auxiliar de clasificación en 37 clases, útil como prior débil para filtrar o ponderar resultados.
- Ejecución en navegador mediante ONNX Runtime Web, sin necesidad de servidor dedicado.
- Entrada de imagen de 64x64 píxeles en escala de grises (float32, normalizada a [0,1]).
- Compatible con pipelines de extracción de características (pipeline_tag: feature-extraction).

## Casos de uso

- **Búsqueda de iconos en herramientas de dibujo**: un usuario dibuja un boceto aproximado y el modelo devuelve iconos similares de una biblioteca, como en la aplicación AutoDraw. El embedding permite ordenar por similitud coseno y actualizar la búsqueda en tiempo real.
- **Indexación de bibliotecas de iconos**: se precomputan embeddings para todos los iconos de una colección (por ejemplo, iconos SVG) y se almacenan en una base de datos vectorial. La recuperación se reduce a un producto punto, escalando a miles de iconos con latencia mínima.
- **Clasificación de bocetos en categorías**: usando la cabeza auxiliar de 37 clases, se puede etiquetar automáticamente bocetos en categorías como "casa", "coche" o "flor", con una precisión auxiliar del 90,22% (top-5: 97,73%).
- **Filtrado de contenido generado por usuarios**: en plataformas que permiten dibujos, el modelo puede identificar si un trazo corresponde a un objeto reconocible y descartar garabatos aleatorios, mejorando la calidad del contenido.
- **Accesibilidad en interfaces táctiles**: personas con dificultades motoras pueden dibujar trazos aproximados y el sistema sugiere iconos precisos, reduciendo la necesidad de dibujo fino. El modelo corre en el cliente, evitando latencia de red.
- **Sistema de recomendación de iconos en editores de imágenes**: al integrarse en un editor, el modelo sugiere iconos relacionados con el trazo actual, facilitando la creación de diagramas o presentaciones sin buscar manualmente en catálogos.
- **Entrenamiento de modelos de generación de bocetos**: los embeddings de 64 dimensiones pueden servir como representación latente para entrenar modelos generativos (por ejemplo, variantes de SketchRNN) que produzcan bocetos más cercanos a iconos reales.

## Benchmarks y rendimiento

Los resultados publicados en la model card, evaluados sobre bocetos retenidos de Quick Draw contra la galería de iconos, son:

| Metrica | Valor |
|---|---|
| Recall@1 | 0,8878 |
| Recall@5 | 0,9180 |
| Recall@10 | 0,9309 |
| Worst-class Recall@10 | 0,8020 |
| Recall@10, iconos retenidos | 0,9657 |
| Precision auxiliar | 0,9022 |
| Precision auxiliar top-5 | 0,9773 |
| Precision auxiliar peor clase | 0,7540 |

El dato de Recall@10 sobre iconos retenidos (0,9657) es el más relevante, ya que esos iconos no se vieron durante el entrenamiento y representa el rendimiento ante arte nunca visto. No se han publicado comparaciones con otros modelos de recuperación de bocetos en la información disponible.

## Requisitos de hardware

- **VRAM**: no requiere GPU; el modelo ocupa 1,9 MB en disco y puede ejecutarse en CPU.
- **GPU recomendada**: ninguna; funciona en CPU de cualquier dispositivo moderno, incluyendo móviles.
- **Compatibilidad con GPU consumer**: sí, pero innecesario; el modelo es tan pequeño que la CPU es suficiente.
- **Opciones de despliegue**: ONNX Runtime (CPUExecutionProvider), ONNX Runtime Web para navegador, o cualquier runtime ONNX compatible (por ejemplo, TensorRT, pero no necesario).
- **Latencia y throughput**: no se han publicado mediciones, pero con 501.798 parámetros y entrada de 64x64, la inferencia debería ser del orden de milisegundos en CPU. En un navegador moderno, se espera un rendimiento interactivo (varias inferencias por segundo).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen alternativas como SketchRNN de Google (modelo generativo, no de recuperación) o modelos de clasificación de bocetos basados en redes convolucionales, pero no hay datos públicos de rendimiento que permitan una comparación directa con este encoder. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Cabeza auxiliar limitada**: solo reconoce 37 clases; su salida debe tratarse como un prior débil, no como una etiqueta fiable.
- **Zero-shot ruidoso**: los iconos fuera de las 37 clases se alcanzan de forma zero-shot, con mayor ruido. Se recomienda combinar con un prior léxico sobre nombres de archivo para mitigarlo.
- **Sensibilidad a la rasterización**: el modelo es muy sensible a cómo se rasterizan los trazos. Si no se reproducen exactamente los parámetros (tamaño 64, padding 4, strokeWidth 2,5, supersample 4), el rendimiento puede degradarse considerablemente.
- **Dominio gap**: existe una diferencia entre iconos planos rellenos y trazos humanos. Los iconos se aplanan y filtran por una banda de cobertura de tinta para reducir el gap, pero no lo elimina por completo.
- **Calidad dependiente del índice**: la recuperación final depende del índice de iconos que se construya sobre los embeddings; este repositorio no incluye dicho índice.
- **Licencia**: CC-BY-4.0 permite uso comercial con atribución. Los iconos de SVGDepot no se redistribuyen, solo los pesos del encoder.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/devarajns/autodraw-sketch-embedder)
- [AutoDraw (aplicación relacionada)](https://www.autodraw.com/)
- [Google Quick Draw dataset](https://github.com/googlecreativelab/quickdraw-dataset)
- [SVGDepot (corpus de iconos)](https://github.com/nsdevaraj/SVGDepot)
- [Demo de SketchRNN (modelo relacionado)](https://magenta.withgoogle.com/sketch-rnn-demo)
