# mlboydaisuke/qwen3-1.7b-CoreAI-official

## Resumen
Este repositorio publica una conversión precompilada del modelo `Qwen/Qwen3-1.7B` al formato Apple Core AI (`.aimodelc`), orientada a la ejecución exclusiva en la GPU de iPhone. El autor, `mlboydaisuke`, lo presenta como un eslabón intermedio necesario en la línea de modelos densos Qwen3 para Core AI, cubriendo el hueco entre los ya existentes de 0.6B, 4B y 8B. La relevancia de esta versión de 1.7B radica en que es el modelo denso más grande de Qwen3 que aún puede ejecutarse de forma fiable en el runtime LiteRT-LM de iOS, según las mediciones del autor.

El bundle se distribuye únicamente en formato GPU (dinámico INT4) y omite deliberadamente la exportación para el Neural Engine (ANE) de Apple, ya que el bundle estático de ANE a este tamaño carga pero falla al invocar en iOS 27. El resultado es un paquete de 939 MB que, según las pruebas del autor en un iPhone 17 Pro, alcanza una velocidad de decodificación de aproximadamente 66 tokens por segundo en estado cálido, con un pico de memoria RAM de 248 MB y una ventana de contexto máxima de 40960 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-1.7B) |
| Parametros totales | 1.700 millones (según nomenclatura del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 40960 tokens |
| Tipos de cuantizacion | dynamic INT4 (lineal) |
| Idiomas soportados | no disponible (heredado del modelo base, no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodelc` (bundle Core AI compilado AOT para GPU de iPhone) |

## Arquitectura y entrenamiento
Este repositorio no contiene un modelo entrenado desde cero, sino una conversión y exportación del modelo base `Qwen/Qwen3-1.7B` (licencia Apache-2.0). El proceso de conversión utiliza el recipe de exportación `coreai-models` y el productor `coreai-build-3600.67.5.8.1`. La arquitectura resultante emplea el motor GPU `coreai-pipelined` de Core AI, con cuantización dinámica INT4 en las capas lineales.

La decisión técnica más destacable es la exclusión del bundle ANE. Según el autor, el bundle ANE de forma estática (paletizado) a 1.7B se carga pero no produce ninguna salida al invocarse en iOS 27, un fallo que también afecta a la exportación estática de 4B. Por ello, solo se publica la ruta GPU, que sí invoca y decodifica correctamente en el dispositivo. No se proporcionan datos sobre el entrenamiento del modelo base, como número de tokens, composición del dataset o técnicas de alineación (RLHF/DPO), ya que estos pertenecen a la ficha original de Qwen3.

## Capacidades
- Generación de texto: al ser una conversión de Qwen3-1.7B, hereda las capacidades de generación de texto del modelo base, aunque el README no detalla tareas específicas más allá de la inferencia de lenguaje.
- Ejecución en dispositivo (on-device): optimizado para inferencia local en iPhone, con tokenizer embebido y compilación AOT para el target de GPU del iPhone 17 Pro.
- Bajo consumo de recursos: pico de RAM de 248 MB, lo que permite su integración en aplicaciones iOS con restricciones de memoria.
- Rendimiento de decodificación: ~66 tokens por segundo en estado cálido, lo que lo hace viable para interacciones conversacionales en tiempo real.
- No se especifican capacidades adicionales como tool calling, visión, audio o modo de razonamiento explícito en la información proporcionada.

## Casos de uso
- Asistente de chat local en iOS: el modelo puede gestionar conversaciones multi-turno directamente en el dispositivo, con una latencia de primer token (TTFT) de ~29 ms en estado cálido, lo que proporciona una experiencia de usuario fluida sin depender de la red.
- Aplicaciones con requisitos estrictos de privacidad: al ejecutarse íntegramente en el iPhone, los datos del usuario nunca salen del dispositivo, siendo adecuado para sectores como salud, banca o documentación confidencial.
- Resumen y análisis de documentos offline: gracias a su ventana de contexto de 40960 tokens, puede procesar documentos extensos o conversaciones largas directamente en el dispositivo, sin necesidad de servicios en la nube.
- Generación de código en el dispositivo: los desarrolladores pueden integrar esta capacidad en entornos de desarrollo móvil o aplicaciones de productividad que requieran asistencia de código sin conexión.
- Sistema de recuperación aumentada (RAG) local: combinado con una base de datos vectorial embebida, el modelo puede responder preguntas sobre un corpus privado almacenado en el propio dispositivo, manteniendo la privacidad y reduciendo la latencia.
- Demo o prototipo de investigación: al ser un artefacto reproducible con hashes embebidos, es útil para investigadores que necesitan un punto de referencia estable para comparar runtimes de inferencia en iOS (Core AI vs MLX vs LiteRT-LM).

## Benchmarks y rendimiento
Las métricas proporcionadas por el autor se obtuvieron en un iPhone 17 Pro (iPhone18,1 · iOS 27.0), con decodificación greedy y presupuesto de tokens de 128 para chat corto (n=3, iso-cold) y 256 para calidad. Los resultados son los siguientes:

| Metrica | Valor |
|---|---|
| Decodificacion (frio) | 44.7 tok/s |
| Decodificacion (calido) | ~66 tok/s |
| TTFT (calido) | ~29 ms |
| Prefill | ~750 tok/s |
| Pico de RAM | 248 MB |
| Calidad (8 preguntas comprobables) | 8 / 8, sin degeneracion |

El autor también compara este runtime con otras alternativas al mismo tamaño (1.7B): MLX Q4 (~66 tok/s con 1095 MB de RAM) y LiteRT-LM int8 (~30 tok/s con 512 MB de RAM). Core AI es el más rápido en estado cálido y el que menos memoria consume.

## Requisitos de hardware
- Dispositivo objetivo: iPhone 17 Pro (iPhone18,1) con iOS 27.0. El bundle está AOT-compilado específicamente para el target de GPU `h18p`.
- Memoria: pico de RAM de 248 MB durante la inferencia, lo que lo hace viable en dispositivos con memoria unificada estándar de iPhone.
- GPU: requiere la GPU del iPhone 17 Pro; el bundle no incluye ruta ANE (Neural Engine) y no se garantiza su funcionamiento en otros chips sin recompilación.
- Despliegue: los bundles iOS se cargan lateralmente (side-load) en el contenedor de la aplicación y se ejecutan mediante el framework Core AI con el tokenizer embebido y el motor GPU `coreai-pipelined`.
- No se proporcionan datos sobre latencia o throughput en otros dispositivos o configuraciones.

## Comparativa con modelos similares
La comparativa disponible se centra en el rendimiento del runtime de inferencia para el mismo modelo base (Qwen3-1.7B) en iOS, no en la calidad del modelo en sí:

| Runtime | Velocidad de decodificacion (calido) | Pico de RAM |
|---|---|---|
| Core AI (este bundle) | ~66 tok/s | 248 MB |
| MLX Q4 | ~66 tok/s | 1095 MB |
| LiteRT-LM int8 | ~30 tok/s | 512 MB |

En cuanto a la familia Qwen3 Core AI, el autor menciona que ya existen conversiones para 0.6B, 4B y 8B, siendo esta de 1.7B el mayor modelo denso que aún invoca correctamente en LiteRT-LM iOS. No se proporcionan comparativas de benchmarks de calidad (MMLU, HumanEval, GSM8K) con otros modelos.

## Limitaciones y advertencias
- Soporte exclusivo para GPU: el bundle no incluye ruta ANE. En iOS 27, la exportación ANE estática a 1.7B carga pero no produce salida, por lo que el autor decidió omitirla. Cualquier intento de forzar el uso del ANE resultará en fallos de invocación.
- Dependencia de hardware específico: el bundle está compilado AOT para el target `h18p` (iPhone 17 Pro). No se garantiza su funcionamiento en otros modelos de iPhone o versiones de iOS sin una recompilación específica.
- Tamaño del modelo: al ser de 1.7B, su capacidad de razonamiento complejo y conocimiento general es limitada en comparación con modelos más grandes de la familia Qwen3 (4B, 8B, 14B, etc.).
- Información incompleta: no se especifican los idiomas soportados, los datos de entrenamiento del modelo base ni las políticas de sesgo o alucinación. Se asume que hereda las limitaciones del Qwen3-1.7B original, pero no se documentan aquí.
- Baja adopción: el repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no existe una validación comunitaria amplia de los resultados presentados por el autor.
- Restricciones de producción: aunque la licencia Apache-2.0 permite uso comercial, la dependencia de un hardware concreto (iPhone 17 Pro / iOS 27) y el formato propietario `.aimodelc` limitan la portabilidad a otros entornos de despliegue.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/mlboydaisuke/qwen3-1.7b-CoreAI-official
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Recipe de exportación `coreai-models`: referenciado en el README como `https://github.com/` (URL completa no proporcionada en la información disponible).
