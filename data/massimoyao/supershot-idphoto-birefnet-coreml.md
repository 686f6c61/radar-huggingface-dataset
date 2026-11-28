# massimoYao/supershot-idphoto-birefnet-coreml

## Resumen

`massimoYao/supershot-idphoto-birefnet-coreml` es una conversión a Core ML del modelo `ZhengPeng7/BiRefNet_lite-matting`, un modelo de segmentación de imagen especializado en matting de retratos (separación fina de pelo y bordes) desarrollado originalmente por ZhengPeng7. Esta versión concreta la publica el usuario massimoYao para integrarla en la aplicación iOS SuperShot, donde se usa para recortar fondos de fotos de carné con calidad HD directamente en el dispositivo.

El modelo parte de un backbone Swin Transformer v1 tiny y trabaja con entradas de 1024 × 1024 píxeles, con 44,4 millones de parámetros. La conversión emplea cuantización de pesos a 8 bits con activaciones en FP16 (W8A16), empaquetada como `mlprogram` de Core ML y orientada a iOS 18 o superior, ejecutándose sobre CPU y GPU (`MLComputeUnits.cpuAndGPU`).

Su relevancia es práctica: demuestra un flujo de despliegue on-device de matting de alta calidad sin depender de la nube, con un paquete de unos 41 MB, lo que lo hace viable para apps móviles que necesitan privacidad y baja latencia. La licencia es MIT, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer v1 tiny (BiRefNet lite, matting de retratos) |
| Parametros totales | 44,4 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 1024 × 1024 px) |
| Tipos de cuantizacion | W8A16 (pesos int8, activaciones FP16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Core ML `mlprogram` (`.mlpackage`, empaquetado en ZIP) |

## Arquitectura y entrenamiento

El modelo subyacente es BiRefNet, una arquitectura de segmentación binaria de alta resolución que combina un backbone Swin Transformer con módulos de agregación multiescala y decodificación progresiva para producir máscaras de alta fidelidad en los bordes. La variante `lite-matting` reduce el backbone a Swin-v1-tiny (44,4 M de parámetros) y se orienta específicamente al matting de retratos, es decir, a la separación fina de pelo y contornos semitransparentes frente a la segmentación binaria convencional.

La conversión a Core ML transforma el grafo a `mlprogram`, cuantiza los pesos a 8 bits manteniendo las activaciones en FP16 y baja las convoluciones deformables a la primitiva nativa MIL `resample`. El resultado se ejecuta con `MLComputeUnits.cpuAndGPU` en iOS 18 o superior. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o imágenes, ni sobre el uso de técnicas de refinamiento posteriores en la información proporcionada.

## Capacidades

- Segmentación y matting de retratos con entrada de 1024 × 1024 píxeles.
- Extracción de máscaras de alta fidelidad en pelo y bordes semitransparentes (hair matting).
- Generación de recortes de fondo para fotos de carné y retratos.
- Inferencia on-device en iOS mediante Core ML, sin conexión a red.
- Ejecución sobre CPU y GPU del dispositivo (`MLComputeUnits.cpuAndGPU`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Recorte de fondo en apps de fotos de carné: el modelo genera una máscara de alta resolución que permite sustituir el fondo por colores o escenas normalizadas, con la ventaja de ejecutarse en el dispositivo y preservar la privacidad del usuario.
- Edición de retratos en apps móviles: separación del sujeto para aplicar desenfoque de fondo, cambios de color o composición sobre otras imágenes, aprovechando la calidad del matting en el pelo.
- Sustitución de fondo en tiempo real en flujos de captura guiada: al ejecutarse sobre GPU en iOS 18, puede integrarse en la previsualización de la cámara para mostrar el resultado antes de capturar.
- Procesamiento por lotes en el dispositivo: recorte de galerías de fotos sin subir imágenes a servidores, útil en apps de gestión de documentos o identificaciones.
- Integración en pipelines de generación de documentos de identidad: combinación del recorte con plantillas de fondo y validación de encuadre en apps de administración pública o RR. HH.
- Módulo de preprocesado para otras apps de visión: la máscara generada puede alimentar modelos posteriores de reconocimiento facial o de calidad de imagen dentro del mismo dispositivo.
- Fallback para versiones antiguas de iOS: la model card indica que se usa como respaldo fijado a iOS 18 junto a la variante con Apple-Hosted Background Assets para iOS 26 o superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica directamente; el modelo se ejecuta en memoria unificada del dispositivo iOS. El paquete comprimido ocupa 41.283.356 bytes (unos 41 MB).
- GPU recomendadas: GPU integrada de dispositivos iOS 18 o superior; la model card especifica `MLComputeUnits.cpuAndGPU`.
- Compatibilidad con GPU de consumo: no está pensado para GPU de escritorio; el formato Core ML es específico del ecosistema Apple.
- Opciones de despliegue: Core ML en iOS 18+ mediante `mlprogram`; no se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| supershot-idphoto-birefnet-coreml | 44,4 M | 1024 × 1024 px | Core ML `mlprogram` W8A16 | MIT | Hugging Face |
| ZhengPeng7/BiRefNet_lite-matting | 44,4 M | 1024 × 1024 px | PyTorch (upstream) | MIT | Hugging Face |
| ZhengPeng7/BiRefNet | no disponible | no disponible | PyTorch | MIT | Hugging Face / GitHub |

La comparativa se limita al linaje BiRefNet porque en la información disponible no se detallan alternativas de matting on-device comparables con especificaciones verificables.

## Limitaciones y advertencias

- Modelo especializado en retratos y matting: su rendimiento fuera de ese dominio (objetos, escenas, animales) no está documentado y podría degradarse.
- Entrada fija de 1024 × 1024 píxeles: requiere redimensionado previo, lo que puede afectar a la precisión en imágenes con relaciones de aspecto muy distintas.
- Dependencia de plataforma: el formato Core ML y el requisito de iOS 18 o superior limitan su uso a dispositivos Apple; no es portable a otros entornos sin reconversión.
- Cuantización W8A16: la reducción a 8 bits de los pesos puede introducir una pérdida de precisión en los bordes frente al modelo original en FP32/FP16; no se han publicado métricas comparativas.
- Riesgo de artefactos en el matting: pelo muy fino, fondos con colores similares al sujeto o imágenes con poca iluminación pueden producir máscaras imperfectas.
- Licencia MIT: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la atribución a los autores originales (ZhengPeng7/BiRefNet).
- Sin datos de benchmarks ni de latencia: no es posible estimar el rendimiento en producción a partir de la información disponible.
- Repositorio sin descargas ni likes y con tamaño de 0,0 GB reportado: conviene verificar la integridad del paquete mediante el SHA-256 indicado antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/massimoYao/supershot-idphoto-birefnet-coreml
- Modelo original BiRefNet lite matting: https://huggingface.co/ZhengPeng7/BiRefNet_lite-matting
- Repositorio BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- Licencia del modelo original: https://github.com/ZhengPeng7/BiRefNet/blob/main/LICENSE
