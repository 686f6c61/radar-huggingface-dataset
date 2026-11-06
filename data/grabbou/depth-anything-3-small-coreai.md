# grabbou/depth-anything-3-small-CoreAI

## Resumen

Depth Anything 3 small para Core AI es una conversión del modelo de estimación de profundidad `depth-anything/da3-small` (35 millones de parámetros) al formato nativo de Apple Core AI, publicada por el usuario grabbou. El modelo original lo desarrolla ByteDance Seed y resuelve la estimación de profundidad monocular y multi-vista a partir de imágenes RGB, devolviendo mapas de profundidad relativa junto con parámetros extrínsecos e intrínsecos de cámara. Esta conversión concreta permite ejecutar el modelo de forma local en dispositivos iOS y macOS sin depender de servicios en la nube.

El interés de esta ficha radica en que se trata de un artefacto de despliegue, no de un modelo nuevo: empaqueta un modelo compacto de 35M de parámetros en un archivo `.aimodel` de 101 MB, listo para integrarse en aplicaciones mediante el runtime Core AI de Apple y el paquete `@react-native-ai/core-ai`. Es relevante para desarrolladores de aplicaciones móviles que necesiten percepción de profundidad en el dispositivo con latencia baja y sin conexión.

La información disponible sobre el modelo es escasa y se limita a la model card del repositorio y a los metadatos de Hugging Face. No se documentan aquí los detalles de entrenamiento del modelo base, sus benchmarks ni sus capacidades multilingües, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de estimación de profundidad; la model card no detalla la arquitectura interna) |
| Parametros totales | 35M (modelo base `depth-anything/da3-small`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada fija de `[1, 2, 3, 224, 224]`) |
| Tipos de cuantizacion | no disponible (se distribuye en float32 según la firma de entrada) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (formato de Apple Core AI); el modelo base original no se especifica en la información disponible |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base `depth-anything/da3-small`. Por la firma de entrada documentada (`[1, 2, 3, 224, 224]` float32, dos vistas RGB normalizadas con media y desviación típica de ImageNet) y por las salidas (`depth` y `depth_conf` de forma `[1, 2, 224, 224]`, más `extrinsics` e `intrinsics` por vista), se deduce que el modelo procesa pares de imágenes y estima profundidad relativa junto con calibración de cámara, lo que corresponde a un modelo de profundidad multi-vista. Para una sola fotografía, la model card indica que debe pasarse la misma imagen como ambas vistas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas del modelo original en la documentación facilitada. La conversión a Core AI se realiza con la receta `apple/coreai-models` mediante el script `models/depth-anything/export.py`, ejecutable con `uv run`.

## Capacidades

- Estimación de profundidad relativa a partir de imágenes RGB: valores menores indican mayor cercanía.
- Procesamiento multi-vista: acepta dos vistas simultáneas y devuelve mapas de profundidad y confianza por vista.
- Estimación de parámetros de cámara: devuelve matrices de extrínsecos e intrínsecos por vista.
- Modo monocular: para una sola imagen, se pasa la misma foto como ambas vistas.
- Ejecución local en iOS y macOS mediante el runtime Core AI de Apple.
- Integración con React Native a través de `@react-native-ai/core-ai`.
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes ni multilingüismo, al ser un modelo puramente visual.

## Casos de uso

- Realidad aumentada en iOS: usar el mapa de profundidad para ocluir objetos virtuales tras elementos reales de la escena, aprovechando la ejecución local y la salida de profundidad relativa del modelo.
- Escaneo 3D aproximado desde el móvil: capturar dos vistas de un objeto y emplear `depth`, `extrinsics` e `intrinsics` para reconstruir una nube de puntos o malla preliminar sin servicios en la nube.
- Edición fotográfica con desenfoque selectivo: generar una máscara de profundidad en el dispositivo para aplicar efectos de bokeh o desenfoque de fondo en tiempo de edición.
- Segmentación por planos de profundidad: separar primer plano y fondo en aplicaciones de recorte o sustitución de fondos, usando el mapa de profundidad como guía.
- Navegación asistida para personas con discapacidad visual: estimar la distancia relativa a obstáculos a partir de la cámara del dispositivo y generar avisos, con la ventaja de funcionar sin conexión.
- Preprocesado para pipelines de visión en producción móvil: calcular profundidad y parámetros de cámara en el dispositivo antes de enviar datos reducidos a un servidor, ahorrando ancho de banda y preservando la privacidad.
- Prototipado rápido en React Native: integrar la estimación de profundidad en una aplicación multiplataforma mediante el paquete `@react-native-ai/core-ai` y el archivo `da3-small.aimodel`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el artefacto está pensado para ejecución en dispositivos Apple. El archivo `da3-small.aimodel` ocupa 101 MB.
- GPU recomendadas: no disponible. El modelo se ejecuta sobre el hardware Apple (GPU/Neural Engine) a través de Core AI en iOS y macOS.
- Compatibilidad con GPU de consumo: no disponible para el formato `.aimodel`. El modelo base de 35M de parámetros es lo bastante pequeño para caber en GPUs de consumo en otros formatos, pero esta conversión concreta no documenta dicha ruta.
- Opciones de despliegue: runtime Core AI de Apple en iOS y macOS; integración vía `@react-native-ai/core-ai` en React Native. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo, el modelo base `depth-anything/da3-small` (35M de parámetros, Apache-2.0) podría compararse con otros estimadores de profundidad monocular de tamaño similar, pero no se aportan cifras que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|
| grabbou/depth-anything-3-small-CoreAI | 35M | `[1, 2, 3, 224, 224]` | Apache-2.0 | `.aimodel` |
| depth-anything/da3-small (base) | 35M | no disponible | Apache-2.0 | no disponible |
| Alternativas de profundidad monocular | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La profundidad devuelta es relativa, no métrica: valores menores indican mayor cercanía, pero no se garantiza una escala absoluta en metros.
- La entrada está fijada a `[1, 2, 3, 224, 224]` float32 con normalización ImageNet; imágenes de otras resoluciones o formatos requieren preprocesado previo.
- El modelo está pensado para dos vistas; el modo monocular exige duplicar la imagen, lo que puede afectar a la calidad de la estimación frente a un modelo específicamente monocular.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas, al no ser un modelo de lenguaje.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias de Apple Core AI utilizadas en la conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: se trata de una conversión reciente y sin validación comunitaria documentada.
- No se aportan métricas de precisión, latencia ni consumo energético en dispositivos reales, por lo que la idoneidad para producción debe validarse empíricamente.
- Depende del ecosistema Apple Core AI; no es portable directamente a otras plataformas sin reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/grabbou/depth-anything-3-small-CoreAI
- Modelo base: https://huggingface.co/depth-anything/da3-small
- Receta de exportación de Apple: https://github.com/apple/coreai-models/tree/main/models/depth-anything
- Repositorio oficial de Depth Anything 3: https://github.com/ByteDance-Seed/Depth-Anything-3
- Paquete React Native Core AI: https://github.com/callstackincubator/ai/tree/main/packages/core-ai
