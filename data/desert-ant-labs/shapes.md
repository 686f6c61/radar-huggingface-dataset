# desert-ant-labs/shapes

## Resumen

Shapes es un modelo de clasificación de imágenes especializado en el reconocimiento de formas dibujadas a mano alzada sobre lienzos digitales. Lo desarrolla Desert Ant Labs y se distribuye principalmente como pesos LiteRT/TFLite para ejecución en el dispositivo, con SDK nativos para Swift, Kotlin y JavaScript. Su cometido no es la generación de imágenes ni el reconocimiento visual genérico, sino convertir trazos imperfectos de lápiz, dedo, ratón o trackpad en formas geométricas limpias (círculos, cajas, rombos, estrellas, corazones, nubes, flechas y conectores), devolviendo coordenadas de lienzo listas para dibujar.

El modelo forma parte del ecosistema desert-ant-core y se ofrece como producto empaquetado con integraciones específicas para PencilKit en iOS y visionOS, Core ML y LiteRT. La model card reporta un tiempo de reconocimiento de 0,92 ms por trazo en un iPhone 16 Pro, lo que sitúa al modelo en la categoría de inferencia en tiempo real sobre hardware móvil, sin necesidad de conexión a servidor.

La relevancia actual del modelo reside en su enfoque vertical: no compite con grandes modelos multimodales, sino que resuelve una tarea concreta de interacción (snapping de formas y reconocimiento de marcas como check, cruz, más, corchete, zigzag y garabato) con latencias sub-milisegundo y despliegue multiplataforma. La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo LiteRT/TFLite de clasificación de trazos; detalles internos no publicados) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No aplica (entrada basada en secuencias de puntos de trazo, no en tokens de texto) |
| Tipos de cuantización | No disponible (pesos distribuidos como LiteRT/TFLite, presumiblemente cuantizados para on-device, sin detalle publicado) |
| Idiomas soportados | No disponible (no es un modelo lingüístico; la interfaz de API está en Swift, Kotlin y JavaScript) |
| Licencia | desert-ant-labs-source-available (licencia propia, enlace: https://license.desertant.com/) |
| Formato de pesos | LiteRT / TFLite (también integrable vía Core ML en Apple y LiteRT.js en navegador/Node) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo en la documentación disponible. Por los tags y el pipeline declarado (image-classification) y por el formato de pesos (LiteRT/TFLite), se trata de un modelo de clasificación pensado para inferencia en el dispositivo, probablemente una red neuronal convolucional o un modelo ligero de secuencias de trazos, pero la model card no especifica capas, tipo de red ni diseño.

Tampoco se detallan los datos de entrenamiento: no se indica el número de muestras, la composición del dataset, si hubo aumento de datos sobre trazos sintéticos o si se aplicaron técnicas de ajuste fino o RLHF (poco probables en esta categoría). La model card menciona únicamente el comportamiento esperado (reconocer formas y seis marcas, devolver coordenadas de lienzo, soportar opciones de rotación y confianza mínima) y el rendimiento en latencia (0,92 ms por trazo en iPhone 16 Pro). Cualquier afirmación sobre innovaciones técnicas como atención lineal, decodificación especulativa o arquitecturas híbridas carece de respaldo en la información proporcionada.

## Capacidades

- Reconocimiento de formas dibujadas a mano: círculos, cajas/rectángulos, rombos, estrellas, corazones, nubes, flechas y conectores, tanto en un solo trazo como en varios.
- Reconocimiento de seis marcas: check, cruz, más, corchete, zigzag y garabato (scribble).
- Snapping geométrico: alinea rotaciones a pasos de 15°, ajusta líneas y bordes a ejes cuando están a menos de 5° de horizontal o vertical, y regulariza cuadrados, círculos y polígonos regulares cercanos.
- Devolución de geometría en coordenadas de lienzo: puntos, esquinas de caja, contornos (paths) y cabezas de flecha listos para renderizar.
- Modos de rotación configurables: `snapped` (por defecto), `upright` y `free`.
- Filtrado por confianza mínima (`minimumConfidence`) y selección de tipos reconocidos (`kinds`).
- Modo de previsualización en vivo (`isFinished = false`) para snapping mientras el usuario dibuja.
- Integración con PencilKit en iOS y visionOS mediante `enableShapeSnapping()`, con gestión de undo/redo.
- Soporte de entrada con lápiz, dedo, ratón y trackpad.
- Multiplataforma: iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso, visión general, audio ni capacidades multilingües en el sentido de modelos generativos.

## Casos de uso

- Aplicaciones de notas manuscritas: integrar Shapes en un lienzo PencilKit para que el usuario dibuje un rectángulo aproximado y el SDK lo sustituya por una caja limpia, mejorando la legibilidad de diagramas y esquemas sin salir de la app.
- Pizarras colaborativas y herramientas de diagramación: reconocer flechas y conectores dibujados a mano para enlazar nodos de un diagrama de flujo, usando `Shape.arrowheads(length:)` para renderizar las puntas con el estilo de la aplicación.
- Anotación y revisión de documentos: mapear el check a "aprobar" y la cruz a "rechazar" sobre elementos de una lista o pasos de un flujo, aprovechando el reconocimiento de marcas para construir interacciones tipo checklist.
- Gestos de borrado natural: usar el garabato (scribble) con su casco convexo (`hull`) para eliminar los trazos que cubre, replicando el gesto de tachado de las libretas de papel en apps de dibujo o edición.
- Herramientas de educación y pizarra digital en tabletas Android: con la integración Kotlin (`ai.desertant:shapes`) se puede ofrecer snapping de formas en tiempo real en aplicaciones de aula, con latencia compatible con la escritura continua.
- Editores vectoriales ligeros en navegador: mediante `@desert-ant-labs/shapes` y LiteRT.js, convertir trazos de ratón o trackpad en polígonos regulares y formas cerradas dentro de una web app, sin backend ni subida de datos del usuario.
- Aplicaciones de accesibilidad: sustituir la entrada precisa por gestos aproximados (círculo, check, cruz) reconocidos por el modelo, reduciendo la exigencia motriz en la interacción con formularios o menús.
- Prototipado rápido de diagramas en escritorio (Windows, Linux, macOS): integrar el SDK nativo en herramientas de diseño para que los bocetos a ratón se conviertan en formas geométricas listas para exportar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la latencia de reconocimiento: 0,92 ms por trazo en un iPhone 16 Pro. No se proporcionan métricas de precisión, recall ni comparaciones con otros modelos de reconocimiento de formas.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está diseñado para ejecución en el dispositivo (CPU/GPU/NPU móvil) y el tamaño del repositorio es de 0,0 GB, lo que sugiere pesos muy ligeros.
- GPU recomendadas: no se especifican; el objetivo son SoCs móviles (Apple A-series/M-series con Core ML, Android con LiteRT) y CPUs de escritorio.
- Compatibilidad con GPU de consumo: no disponible como requisito, ya que no está pensado para servidores con GPU dedicada; funciona en navegador y Node sin acelerador dedicado.
- Opciones de despliegue: SDK Swift (iOS, macOS, tvOS, visionOS), SDK Kotlin (Android), paquete npm `@desert-ant-labs/shapes` para navegador (con `@litertjs/core`) y Node (con núcleo nativo precompilado). No se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 0,92 ms por trazo en iPhone 16 Pro según el autor. Throughput no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de reconocimiento de formas a mano alzada con despliegue on-device, ni datos de rendimiento que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- La información pública sobre arquitectura, datos de entrenamiento y precisión es muy escasa; no es posible evaluar sesgos del modelo ni su robustez fuera de los casos descritos por el autor.
- El reconocimiento se limita a las formas y marcas enumeradas (círculo, caja, rombo, estrella, corazón, nube, flecha, conector, check, cruz, más, corchete, zigzag y garabato); no se documenta soporte para otras formas.
- El snapping depende de umbrales geométricos (rotación a 15°, alineación a ejes a 5°, regularización de cuadrados y círculos cercanos), lo que puede alterar intenciones del usuario en dibujos deliberadamente irregulares; el modo `free` mitiga este efecto.
- En modo `isFinished = true`, un contorno incompleto (por ejemplo, una caja sin un lado) devuelve `nil`, lo que puede sorprender en flujos de dibujo interrumpidos.
- La licencia `desert-ant-labs-source-available` es una licencia propia; es imprescindible revisar los términos en https://license.desertant.com/ antes de cualquier uso comercial, ya que no es una licencia de código abierto estándar.
- No se documentan limitaciones idiomáticas ni multilingües porque el modelo no procesa lenguaje natural; la API y la documentación están en inglés.
- El uso de la API de PencilKit y `enableShapeSnapping()` está restringido a plataformas Apple; en otras plataformas la integración debe hacerse manualmente con las APIs de reconocimiento.
- No se ofrecen garantías de precisión en trazos muy degradados, entradas con ruido extremo o dispositivos de entrada de baja resolución; no hay métricas publicadas al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/shapes
- Pesos v2.2.0: https://huggingface.co/desert-ant-labs/shapes/tree/v2.2.0
- Demo: https://desertant.com/models/shapes/
- Licencia: https://license.desertant.com/
- Repositorio desert-ant-core: https://github.com/Desert-Ant-Labs/desert-ant-core
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
