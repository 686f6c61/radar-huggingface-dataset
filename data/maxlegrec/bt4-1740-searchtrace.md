# Maxlegrec/bt4-1740-searchtrace

## Resumen

BT4-1740-searchtrace es un modelo de ajedrez, no de lenguaje. Se trata del state_dict en PyTorch de la red neuronal **BT4-1740** de Leela Chess Zero, convertido por el autor Maxlegrec a un formato de módulo BT4 para su repositorio `searchtrace`. El archivo `bt4_1740.pt` pesa 835 MB en fp32 y es una conversión verificada del peso oficial `networks-contrib/big-transformers/BT4-1740.pb.gz`. Su propósito concreto es servir como **maestro de búsqueda MCTS** durante la generación de traces de `searchtrace`, es decir, como teacher para entrenar o destilar procesos de búsqueda en ajedrez. Es relevante para quienes trabajan con entrenamiento por refuerzo en juegos de tablero, pipelines de auto-juego o destilación de políticas, ya que proporciona un checkpoint reproducible y de referencia dentro de la familia de redes grandes de Lc0.

No es un modelo multimodal ni un modelo de lenguaje: no genera texto, no tiene contexto en el sentido de los LLM y no está pensado para aplicaciones conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de ajedrez Leela Chess Zero, variante BT4 (no es un modelo de lenguaje) |
| Parametros totales | no disponible (el state_dict ocupa 835 MB en fp32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de tablero, no de lenguaje) |
| Tipos de cuantizacion | fp32 (state_dict de PyTorch) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | GPL-3.0 |
| Formato de pesos | `.pt` (PyTorch state_dict) |

## Arquitectura y entrenamiento

El modelo es una red neuronal de ajedrez tipo **BT4** de Leela Chess Zero. Leela Chess Zero utiliza arquitecturas convolucionales con bloques residuales para estimar la política de movimientos y el valor de una posición. La variante "big transformer" (BT) de Lc0, a la que pertenece BT4-1740, forma parte de la rama de redes de gran tamaño usadas para mejorar la fuerza de juego y como teacher en procesos de búsqueda y auto-juego. Según la model card, el checkpoint es una conversión directa del archivo oficial `networks-contrib/big-transformers/BT4-1740.pb.gz`, realizada con el script `scripts/convert_lc0_bt4.py` del repositorio `searchtrace`. La conversión es **bitwise reproducible**, es decir, el state_dict en PyTorch es idéntico en bits al archivo oficial en el orden de los tensores del módulo BT4. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el proceso de optimización en esta ficha porque la model card original no los incluye.

## Capacidades

- Evaluación de posiciones de ajedrez y generación de una política de movimientos.
- Estimación del valor de la posición (win probability) desde la perspectiva del jugador a mover.
- Integración como teacher de búsqueda MCTS para generar traces de búsqueda en el repositorio `searchtrace`.
- Soporte de carga mediante el módulo `tools/leela_port/model.py` del repositorio `searchtrace`, que define una clase BT4 compatible con el state_dict.
- Reproducibilidad bitwise: garantiza que la conversión desde el checkpoint oficial de Lc0 es exacta.
- No dispone de capacidades de lenguaje: no soporta tool calling, function calling, ni razonamiento en texto.

## Casos de uso

- **Destilación de búsqueda con MCTS**: el modelo actúa como maestro para generar traces de búsqueda en `searchtrace`. Se puede entrenar una red más pequeña para imitar la política y el valor de BT4-1740, reduciendo el coste de inferencia de un motor de ajedrez.
- **Entrenamiento por refuerzo en auto-juego**: el checkpoint puede usarse como teacher para bootstrappear la política de una red en fase temprana, acelerando la convergencia de agentes de ajedrez basados en aprendizaje por refuerzo.
- **Integración en motores de ajedrez tipo Lc0**: los pesos convertidos a formato PyTorch se pueden utilizar para experimentar con pipelines de inferencia de Lc0 fuera de su formato nativo `.pb.gz`, facilitando la integración con frameworks de deep learning en Python.
- **Investigación en reproducibilidad de conversión de redes**: al ser una conversión bitwise reproducible, sirve como caso de estudio para validar scripts de conversión de pesos de Leela Chess Zero a otros formatos.
- **Análisis de posiciones y evaluación de partidas**: la red puede cargarse para evaluar posiciones de ajedrez y generar informes de ventaja o igualdad, útil en entornos de análisis de aperturas o finales sin depender de un motor completo.
- **Pruebas de integración en CI/CD para proyectos de ajedrez**: al ser un artefacto ligero de 835 MB y descargable desde HuggingFace, puede utilizarse como fixture en pipelines de prueba de módulos de inferencia de ajedrez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye Elo, precisión en test suites ni comparaciones con otras redes. Por tanto, no es posible valorar el rendimiento del modelo en ajedrez a partir de estos datos.

## Requisitos de hardware

- El archivo `bt4_1740.pt` pesa 835 MB en fp32, por lo que la carga del state_dict requiere al menos esa cantidad de memoria en RAM o VRAM disponible.
- No se han publicado requisitos oficiales en la model card ni en la información disponible.
- Al tratarse de una red de ajedrez, la inferencia es liviana en comparación con un LLM. En una GPU con al menos 1 GB de VRAM debería ser posible cargar el state_dict, aunque el consumo real depende del framework y de las dimensiones de los tensores.
- La integración está pensada para el módulo `tools/leela_port/model.py` del repositorio `searchtrace`, que está implementado en PyTorch. La ejecución en CPU es viable para análisis puntuales.
- Para producción de auto-juego o generación de traces, se recomienda GPU, aunque no se especifica un modelo concreto.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se incluyen datos de otros modelos de la misma categoría ni una comparación con otras redes de Leela Chess Zero. La única referencia es que BT4-1740 forma parte de la familia `networks-contrib/big-transformers`, pero no se dispone de métricas comparativas.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: cualquier uso como chatbot, generación de texto o herramienta de prompts no es aplicable y dará resultados erróneos.
- **Licencia GPL-3.0**: cualquier distribución de software que incorpore este estado_dict queda sujeta a las obligaciones de la licencia GPL-3.0, incluyendo la disponibilidad del código fuente completo.
- **Escasa adopción**: el repositorio y el modelo tienen 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido probado ampliamente en producción.
- **Dependencia de un repositorio externo**: la carga del modelo requiere el módulo `tools/leela_port/model.py` del repositorio `searchtrace`; sin ese código, el `.pt` no es directamente utilizable.
- **Documentación limitada**: no se proporcionan detalles sobre el entrenamiento, la arquitectura exacta ni el número de parámetros, lo que dificulta evaluar su idoneidad para casos de uso avanzados.
- **Riesgo de uso fuera de ajedrez**: al ser un modelo especializado, no debe extrapolarse a otros dominios. Solo ofrece capacidades de evaluación y política de movimientos en ajedrez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Maxlegrec/bt4-1740-searchtrace
- Repositorio `searchtrace` mencionado en la model card: github.com/maxlegrec1/searchtrace (script `scripts/convert_lc0_bt4.py` y módulo `tools/leela_port/model.py`)
- Perfil de HuggingFace del autor: https://huggingface.co/Maxlegrec
