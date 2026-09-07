# KillerBoss/e-os-v3-hybrid

## Resumen

El modelo `KillerBoss/e-os-v3-hybrid` no es un modelo de lenguaje, sino un sistema de renderizado híbrido de interfaz de usuario optimizado para ejecutarse en la NPU de un smartphone de gama alta (Snapdragon 8 Elite Gen 5 for Galaxy, Hexagon v81). Ha sido desarrollado por un autor individual identificado como Rudolf en Hugging Face con el nombre de proyecto E-OS v0.3. Está diseñado para resolver un problema concreto: acelerar el dibujado de animaciones y efectos visuales en una interfaz de sistema operativo móvil sin depender de un renderizado por frames, usando eventos discretos (TAP, ANIM, TICK, NOTIFY).

La arquitectura es híbrida en dos sentidos: por un lado, una base de código (OsPainter) dibuja el contenido estático de la interfaz de forma determinista; por otro, dos redes neuronales (MaskHead y EffectRenderer) calculan qué regiones necesitan efectos de sombra, brillo, ondas o tinta y generan el valor residual de estilo. El modelo completo posee 696 000 parámetros divididos en dos redes: 65 000 para la máscara de celdas y 631 000 para el renderizador de efectos. No dispone de ventana de contexto en el sentido de los modelos de lenguaje, por lo que este campo se considera no disponible.

El resultado de este enfoque es una preservación del 100 % de los píxeles no modificados y una calidad de imagen medida en 34,2 dB de PSNR en las áreas escritas, frente a los 25,6 dB de la versión anterior. Su relevancia actual radica en que demuestra una alternativa viable a los modelos de IA generativa para interfaces móviles: en lugar de generar contenido frágil, el modelo solo aporta la capa de efectos sobre una base controlada por código, garantizando que el texto y los elementos de la interfaz nunca se corrompan.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: OsPainter de código + MaskHead (CNN pequeña) + EffectRenderer (CNN de 631k parámetros) + control por celdas |
| Parametros totales | 696 000 (65 000 en MaskHead, 631 000 en EffectRenderer) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es modelo de lenguaje) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en TFLite para NPU, ONNX y PyTorch |
| Idiomas soportados | No disponible (no es modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | TFLite (npu/os_mask_head.tflite, npu/os_renderer.tflite), ONNX (opset 17, verificado con ORT, maxdiff ≤ 2e-05), PyTorch |

## Arquitectura y entrenamiento

La arquitectura se compone de cuatro etapas que trabajan de forma secuencial y orientada a eventos. La primera etapa es un `OsPainter` programado por código que dibuja la base de la interfaz (1536×704 píxeles) con colores planos, texto, tarjetas y botones. Este paso es determinista y nunca depende de la IA, lo que garantiza la legibilidad del contenido. La segunda etapa es `MaskHead`, una red neuronal de 65 000 parámetros que decide qué celdas de 16×16 píxeles necesitan la capa de efectos. La tercera etapa es `EffectRenderer`, con 631 000 parámetros, que renderiza únicamente la apariencia, animación y efectos (sombras, brillos, ondas, tinta) en recortes de 128×128 píxeles, produciendo el valor residual `styled = base + eff`. Finalmente, un control de escritura por celdas con histéresis (4 eventos) solo modifica los píxeles que realmente han cambiado, dejando el resto bit a bit idéntico a la base.

El entrenamiento se realizó sobre un conjunto de 3 600 escenas generadas sintéticamente (el doble que la versión anterior), con doble supersampling y sombras, brillos y ondas calculadas analíticamente a partir de la geometría de la escena, sin el uso de comparaciones JPEG. Se utilizaron 13 fragmentos de entrenamiento que requirieron aproximadamente 2 horas de CPU. El MaskHead se entrenó durante 17 épocas, mientras que el EffectRenderer se entrenó durante 2 889 pasos con una pérdida L1 ponderada sobre el valor residual más 0,5 veces el L1 sobre el compuesto final. Las secuencias de eventos TAP→ANIM se generaron con probabilidades de 0,33 → 0,66 → 0,90 para simular interacciones táctiles.

Entre las innovaciones técnicas destacables se encuentran el renderizado por celdas (solo las celdas modificadas se escriben en el framebuffer), el uso de codificación temporal sin/ cos de la hora del día para que el modelo aprenda a colorear los efectos de forma diferente por la mañana y por la noche, y la integración de eventos en lugar de un bucle de frames continuo. El modelo compilado para NPU consigue una latencia de 93 microsegundos para la máscara y 279 microsegundos por recorte de 128 píxeles para el renderizador, medidos en un dispositivo real.

## Capacidades

- Renderizado de efectos visuales sobre una interfaz de usuario móvil: sombras, brillos, ondas, tinta y animaciones de retroalimentación táctil.
- Preservación bit a bit de los píxeles no modificados: la salida es 100 % idéntica a la base en las zonas donde no hay efectos.
- Generación de animaciones controladas por eventos: un toque en cualquier lugar de la pantalla genera un ripple inmediato con animaciones secuenciales.
- Uso de una máscara de celdas con recall primero (recall = 0,999): la red marca entre 2 y 3 veces más celdas de las necesarias para evitar parpadeos, a costa de unos pocos recortes adicionales de NPU.
- Comprensión de la hora del día mediante la codificación sin/cos de la fase temporal, lo que permite colorear los efectos de forma adaptativa (cálido por la tarde, frío por la mañana).
- Soporte de toques, doble toque y pulsaciones sobre controles reales: tarjetas, teclas de calculadora, chips de notas y la barra de inicio.
- Actualización de la interfaz en tiempo real mediante eventos TICK a 1 Hz para el reloj y la barra de estado, sin necesidad de un bucle de frames.
- Visualización opcional de información de depuración (modo NPU, celdas, recortes) mediante doble toque.
- Integración con el sistema operativo Android para mostrar la batería real del dispositivo mediante el BatteryManager y gestionar la instalación como una aplicación con paquete propio.

## Casos de uso

- Interfaz de sistema operativo móvil de bajo consumo: el modelo puede ejecutarse en la NPU de un smartphone y renderizar efectos de animación sin agotar la CPU. Es adecuado porque la latencia total (máscara + recortes) se mantiene por debajo de 0,3 ms por elemento y no requiere un bucle de frames continuo.
- Reloj y widgets de escritorio en tiempo real: gracias a los eventos TICK de 1 Hz y al conocimiento de la hora del día, el modelo puede colorear el brillo del fondo según la fase solar, lo que resulta útil para pantallas siempre activas (AOD).
- Calculadora con retroalimentación visual: las pulsaciones de teclas generan ondas y brillos en las celdas afectadas. El modelo es adecuado porque el contenidos de los dígitos se dibuja por código y nunca puede ser alterado por la IA, mientras que los efectos se aplican como residuo.
- Aplicación de notas con chips interactivos: los elementos de la interfaz pueden resaltarse mediante un efecto de selección que el modelo calcula sobre las celdas activadas. Esto es útil para aplicaciones de toma de notas rápidas en móviles de gama alta.
- Prototipado de sistemas operativos para dispositivos móviles: los desarrolladores pueden usar el modelo como referencia de cómo integrar IA de renderizado en una UI sin comprometer la legibilidad del contenido, gracias a la separación entre base de código y capa de efectos.
- Demostración de renderizado híbrido en hardware de consumo: el modelo se compila con AI Hub para Snapdragon 8 Elite Gen 5, por lo que puede servir como ejemplo de despliegue de redes pequeñas en NPU móviles para la comunidad de desarrolladores embebidos.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a una evaluación con 60 escenas nuevas, no incluidas en el entrenamiento. Se comparan la versión v0.2 y v0.3 del modelo. No se proporcionan comparaciones con otros modelos de la misma categoría.

| Metrica | v0.2 | v0.3 |
|---|---|---|
| PSNR en el area escrita | 25,6 dB (contenido via IA) | 34,2 dB (solo capa de efectos) |
| Contenido del texto sin errores | No | Siempre (100 %) |
| Preservacion de píxeles no modificados | 98,0 % | 100 % |
| Recall de celdas (mascara) | No disponible | 0,999 |
| Latencia NPU (S26 Ultra real) | 0,24 ms por tile | 0,093 ms mascara + 0,279 ms por crop de 128 px |

Además, la model card indica que el modelo ONNX ha sido verificado con ONNX Runtime con una diferencia máxima de 2e-05 respecto a la salida de PyTorch.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al ser una red de menos de 700 000 parámetros no requiere VRAM de GPU; se ejecuta en NPU móvil.
- GPU recomendadas: no aplica para inferencia; el modelo está compilado para la NPU Hexagon v81 del Snapdragon 8 Elite Gen 5 for Galaxy. En desarrollo puede usarse una GPU o CPU estándar para ejecutar el modelo ONNX.
- Compatibilidad con GPU de consumo: no necesaria; las redes son tan pequeñas que podrían ejecutarse en CPU de escritorio o en cualquier dispositivo móvil con soporte de TFLite/ONNX.
- Opciones de despliegue: TFLite a través de la Android Neural Networks API (NNAPI) con fallback a CPU, o ONNX Runtime en entornos de servidor o desarrollo. El autor menciona que si Android rechaza el delegate NNAPI, la app cae automáticamente a CPU, lo que funciona pero consume más energía.
- Latencia y throughput: en un Galaxy S26 Ultra real, la máscara tarda 93 microsegundos y cada recorte de 128×128 píxeles tarda 279 microsegundos. El tiempo total por interacción se compone de estos tiempos más el coste de los recortes generados.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información disponible. El proyecto E-OS v0.3 es específico para renderizado de interfaces en hardware móvil y no se encontraron alternativas con el mismo propósito en la búsqueda web. Por lo tanto, no existe una comparativa directa con otros modelos de la misma categoría.

## Limitaciones y advertencias

- La model card está escrita en alemán, lo que puede dificultar la revisión del código y los detalles de implementación para desarrolladores hispanohablantes.
- No se especifica ninguna licencia en el repositorio de Hugging Face. El uso comercial, la redistribución o la modificación pueden estar restringidos sin un permiso explícito del autor.
- El repositorio de Hugging Face indica un tamaño de 0,0 GB, lo que sugiere que los pesos del modelo podrían no estar publicados en el repositorio o que solo hay enlaces a ficheros externos. Sería necesario comprobar si los ficheros .tflite y .onnx están realmente disponibles.
- El modelo depende de Android NNAPI para aprovechar la NPU. Si el runtime de Android rechaza el delegate, la aplicación cae a CPU, lo que aumenta el consumo de energía.
- Los anillos de las ondas (ripples) son ligeramente más suaves que la referencia analítica (alrededor de 22 dB en el propio anillo) porque el entrenamiento se realizó con pérdida L1. La posición y el color son correctos, pero la nitidez del ripple no es idéntica a la solución analítica.
- La máscara cubre deliberadamente entre 2 y 3 veces más celdas de las necesarias para evitar parpadeos. Esto implica un coste computacional adicional en forma de recortes NPU que no son estrictamente necesarios.
- El modelo no es un modelo de lenguaje y no puede utilizarse para generación de texto, razonamiento, código o matemáticas. Cualquier intento de usarlo como LLM es erróneo.
- No se han publicado datos de sesgos, alucinaciones o limitaciones de contexto porque estas métricas no son aplicables a este tipo de modelo neurativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KillerBoss/e-os-v3-hybrid
- Perfil del autor en Hugging Face: https://huggingface.co/KillerBoss

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la información proporcionada.
