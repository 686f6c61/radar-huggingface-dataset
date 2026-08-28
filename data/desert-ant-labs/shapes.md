# desert-ant-labs/shapes

## Resumen

Shapes es un modelo de reconocimiento de formas dibujadas a mano, desarrollado por Desert Ant Labs, que convierte un trazo único realizado con lápiz o dedo en una forma geométrica limpia (rectángulo, elipse, triángulo, estrella o línea) con parámetros vectoriales ajustados. El modelo está diseñado para ejecutarse completamente en el dispositivo, sin conexión a internet, y es especialmente relevante para aplicaciones tipo PencilKit de Apple o herramientas de dibujo y anotación que necesitan "formas inteligentes" con latencia mínima.

Arquitectónicamente es un clasificador de secuencias compacto formado por un stem de convoluciones 1D, un pequeño encoder Transformer, un pooled medio enmascarado y un MLP final. El modelo es extremadamente ligero: 200 KB en formato Core ML (con cuantización de paleta de 4 bits) y 1,3 MB en formato LiteRT/TFLite en fp32, con una inferencia de menos de 10 ms en dispositivo. Se distribuye en múltiples formatos (safetensors, TFLite, Core ML, PyTorch) y está pensado para integrarse en iOS, macOS, Android, Linux, Windows, navegador y Node.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conv1d stem → Transformer encoder → masked mean-pool → MLP (clasificador de secuencias) |
| Parametros totales | no disponible (tamano de archivo: 200 KB Core ML, 1,3 MB TFLite) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 puntos de trazo (entrada fija [1, 256, 3] + ventana de mascara [1, 256]) |
| Tipos de cuantizacion | Paleta de 4 bits (Core ML), fp32 (LiteRT/TFLite) |
| Idiomas soportados | no aplica (modelo de vision/geometria, no de lenguaje) |
| Licencia | Desert Ant Labs Source-Available License 1.0 (uso comercial gratuito hasta cierto umbral; licencia comercial requerida a escala) |
| Formato de pesos | safetensors, TFLite, Core ML (mlmodelc), PyTorch (checkpoint), ONNX (en revisiones anteriores) |

## Arquitectura y entrenamiento

El modelo sigue un esquema en dos etapas. En la primera, la secuencia de puntos del trazo se remuestrea a una resolución fija y se pasa por un clasificador de secuencias compuesto por un stem de convoluciones 1D, un pequeño encoder Transformer y un pooled medio enmascarado seguido de un MLP. Este clasificador predice la clase de forma (línea, rectángulo, triángulo, elipse, estrella) o la clase de rechazo `none` para garabatos y trazos no reconocibles.

En la segunda etapa, un ajustador geométrico clásico (no neuronal) calcula los parámetros vectoriales limpios de la forma (caja de área mínima, elipse por momentos/PCA, triángulo de área máxima, etc.) y los regulariza mediante "snapping" a ejes, círculos, cuadrados e incrementos de rotación de 15 grados. Un umbral basado en el residuo del ajuste veto los ajustes pobres, de modo que los trazos que no corresponden a formas reales se rechazan.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de épocas, el proceso de optimización o si se emplearon técnicas como RLHF o DPO. La información disponible solo indica que el modelo está entrenado para trazos deliberados y que rechaza trazos muy toscos o ambiguos de forma intencionada.

## Capacidades

- Reconocimiento de formas geométricas básicas a partir de un único trazo: línea, rectángulo, triángulo, elipse y estrella.
- Clase de rechazo `none` para garabatos, formas parciales y trazos no reconocibles.
- Ajuste geométrico vectorial de la forma detectada (caja de área mínima, elipse por momentos, triángulo de área máxima, etc.).
- "Snapping" automático de la forma ajustada a ejes, círculos, cuadrados e incrementos de rotación de 15 grados.
- Inferencia en dispositivo en menos de 10 ms, sin conexión a red.
- Soporte multiplataforma: iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.js.
- Integración con SDKs nativos en Swift, Kotlin y JavaScript/TypeScript.
- Verificación de integridad de descargas mediante SHA-256 en los SDKs.

## Casos de uso

- Aplicaciones de dibujo y anotación estilo PencilKit: al dibujar un círculo o rectángulo aproximado, el modelo lo convierte automáticamente en una forma perfecta y ajustable, mejorando la experiencia de creación de diagramas y esquemas.
- Herramientas de pizarra digital colaborativa: los usuarios pueden dibujar formas a mano alzada y el sistema las normaliza al instante, facilitando la creación de diagramas de flujo, organigramas o mapas conceptuales.
- Aplicaciones de notas y captura de ideas en tabletas: al tomar notas manuscritas, los trazos que representan formas se convierten en objetos vectoriales editables, permitiendo redimensionarlos, rotarlos o recolocarlos con precisión.
- Editores de presentaciones y documentos: los usuarios pueden insertar formas geométricas dibujándolas directamente sobre el lienzo en lugar de buscarlas en menús, agilizando el flujo de trabajo.
- Aplicaciones educativas de geometría y matemáticas: los estudiantes pueden dibujar triángulos, rectángulos o elipses y el modelo los ajusta a figuras exactas, facilitando la exploración de propiedades geométricas.
- Herramientas de diseño de UI/UX en tabletas: los diseñadores pueden esbozar wireframes con trazos rápidos y el modelo convierte los rectángulos, líneas y elipses en elementos vectoriales limpios listos para exportar.
- Aplicaciones de accesibilidad: usuarios con dificultades motoras pueden dibujar formas aproximadas y el modelo las regulariza, reduciendo la precisión requerida en la entrada táctil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El fabricante indica una latencia de inferencia inferior a 10 ms en dispositivo, pero no proporciona métricas comparativas (precisión, recall, F1) ni resultados en conjuntos de datos estandarizados.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para ejecutarse en CPU de dispositivos móviles y de escritorio, no requiere GPU dedicada.
- Tamaño en memoria: 200 KB (Core ML cuantizado) o 1,3 MB (TFLite fp32), por lo que cabe en cualquier dispositivo moderno, incluidos relojes y dispositivos IoT.
- GPU recomendadas: no aplica; la inferencia se realiza en CPU (ANE/Neural Engine en Apple, NNAPI en Android, WebAssembly en navegador).
- Compatibilidad con GPU de consumo: no requiere GPU; funciona en cualquier hardware con CPU y sistema operativo soportado.
- Opciones de despliegue: SDKs nativos de Desert Ant Labs para Swift, Kotlin y JavaScript; el modelo se distribuye como TFLite, Core ML y safetensors, por lo que puede integrarse en motores de inferencia como TensorFlow Lite, Core ML o LiteRT.
- Latencia y throughput: menos de 10 ms por trazo en dispositivo según el fabricante; no se proporcionan cifras de throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente orientados al reconocimiento de formas a partir de un único trazo. Las alternativas más cercanas en el ecosistema de Apple (PencilKit) y Android (gesture recognition) son soluciones propietarias o heurísticas, no modelos publicados con métricas comparables. Por tanto, no se puede establecer una comparativa objetiva con los datos disponibles.

## Limitaciones y advertencias

- Solo reconoce un único trazo por forma; las formas dibujadas con múltiples trazos no se detectan.
- Está afinado para trazos deliberados; los trazos muy toscos, incompletos o ambiguos se rechazan de forma intencionada mediante la clase `none`.
- No es un modelo de lenguaje ni de visión general; su única función es la clasificación y ajuste de formas geométricas simples.
- La licencia "Source-Available" no es una licencia de código abierto; el uso comercial gratuito está limitado y se requiere una licencia comercial a partir de cierto volumen de uso. Es imprescindible revisar los términos completos en https://license.desertant.com/1.0 antes de integrarlo en producción.
- No se han publicado detalles sobre el conjunto de entrenamiento, por lo que no es posible evaluar posibles sesgos o cobertura de estilos de dibujo.
- La entrada está limitada a 256 puntos remuestreados; trazos muy largos o con muchos puntos podrían perder información tras el remuestreo.
- No se proporcionan métricas de precisión o robustez ante variaciones de estilo de dibujo, grosor de trazo o dispositivos de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/shapes
- Repositorio GitHub: https://github.com/Desert-Ant-Labs/shapes
- Documentación del SDK (instalación y ejemplos): https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/shapes.md
- Página del modelo en Desert Ant Labs: https://desertant.com/models/shapes/
- Demo en vivo (Hugging Face Spaces): https://huggingface.co/spaces/desert-ant-labs/shapes-demo
- Licencia: https://license.desertant.com/1.0
- Sitio web de Desert Ant Labs: https://desertant.com/
