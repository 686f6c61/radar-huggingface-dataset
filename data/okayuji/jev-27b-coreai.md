# okayuji/jev-27b-coreai

## Resumen

JEV-27B para Core AI es una conversión del modelo base `autotrust/JEV-27B` (desarrollado por AutoTrust AI) al framework Core AI de Apple, empaquetada por el usuario okayuji. No se trata de un modelo conversacional al uso, sino de un modelo de decisión tipada: recibe una situación descrita en texto junto con una pregunta de sí/no, de opción múltiple o de valoración, y devuelve una probabilidad calibrada para cada respuesta permitida. El paquete incluye el backbone de texto cuantizado a 4 bits (uint4) y una cabeza de decisión en float32 que produce las puntuaciones finales.

La relevancia de esta ficha radica en que ejemplifica un patrón de despliegue local en Apple Silicon mediante Swift y el framework Core AI, orientado a desarrolladores que necesitan flujos de decisión deterministas y tipados sin depender de la nube. El bundle ocupa 14,96 GiB (13 archivos) y está pensado para ejecutarse con GPU en macOS 27 sobre chips de la serie M.

Conviene subrayar que el modelo no está diseñado para chat libre, no soporta iOS y no debe emplearse en decisiones de alto riesgo sin validación independiente, según advierte el propio autor. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con backbone de texto (receta de cuantización `qwen3_5_cfg`), adaptador System 1 fusionado y cabeza de decisión de 24 filas en float32; actualizaciones gated delta en float32 |
| Parámetros totales | no disponible (el nombre comercial indica 27B, no confirmado en la información) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como límite oficial; se han medido peticiones de hasta 8.192 tokens |
| Tipos de cuantización | uint4 (block size 32, minval) para el backbone; cabeza en float32 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (Core AI), `head.safetensors`, tokenizer en carpeta `tokenizer/` |

## Arquitectura y entrenamiento

El modelo base JEV-27B emplea una arquitectura de decisión de un solo forward pass: un backbone de texto procesa la situación y la pregunta, y una cabeza de decisión devuelve puntuaciones tipadas. La destilación original y esta arquitectura de forward único son características upstream de JEV-27B, no de esta conversión. En esta versión para Core AI, el adaptador System 1 se fusiona en el backbone de texto y luego se cuantiza a uint4 con la receta oficial `qwen3_5_cfg` (block size 32, minval), mientras que las actualizaciones gated delta se mantienen en float32 para preservar la fidelidad numérica verificada.

La cabeza de decisión original de 24 filas en float32 se conserva sin cambios y devuelve las puntuaciones tipadas. Un único prefill produce el estado oculto final. Las temperaturas por tipo de pregunta se reajustaron sobre las salidas de Core AI, y el bundle incluye un archivo `calibration-refit.json` con ese reajuste, además de `decision.json` con el contrato de decisión tipada, temperaturas, procedencia y tamaños/SHA-256 de todos los archivos del modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el modelo base.

## Capacidades

- Clasificación de texto con salida probabilística tipada: sí/no, opción múltiple y valoración numérica.
- Decisión de un solo forward pass con una cabeza dedicada, en lugar de generación autoregresiva de texto.
- Salida calibrada por tipo de pregunta mediante temperaturas reajustadas sobre Core AI.
- Ejecución local en Apple Silicon con GPU a través del framework Core AI y un runner en Swift.
- No soporta chat libre ni generación de texto abierta.
- No soporta tool calling ni function calling según la información disponible.
- No se documentan capacidades de agente, razonamiento multi-paso, visión ni audio.
- Multilingüe limitado: solo inglés declarado.

## Casos de uso

- Validación de reglas de negocio en local: dado un enunciado como horarios de apertura y una pregunta de sí/no, el modelo devuelve una probabilidad que puede umbralizarse en un pipeline Swift sin salir del Mac. El ejemplo grabado del autor ilustra exactamente este escenario.
- Moderación o triaje de contenido con etiquetas cerradas: para clasificar textos en categorías predefinidas de opción múltiple, la cabeza tipada evita la ambigüedad de la generación libre y facilita auditoría.
- Enrutamiento de tickets o consultas: asignar una consulta a una de varias colas mediante una pregunta de opción múltiple con probabilidades por clase, aprovechando la inferencia local y la ausencia de dependencia de red.
- Encuestas y valoraciones automatizadas: puntuar textos según una escala definida (rating) usando las temperaturas reajustadas por tipo para obtener distribuciones comparables.
- Prototipado de flujos de decisión en macOS: desarrolladores Swift que quieran integrar un clasificador local en una app de escritorio con Core AI y verificar el contrato de decisión mediante `decision.json` y los SHA-256 incluidos.
- Evaluación de conformidad documental: comprobar si un fragmento cumple una condición booleana (por ejemplo, presencia de una cláusula) con una probabilidad asociada, útil en revisiones internas donde se requiere trazabilidad local.
- Investigación sobre calibración: el bundle expone temperaturas por tipo y un registro de reajuste, lo que permite estudiar el comportamiento probabilístico del modelo en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica mediciones de latencia y memoria en M4 Max con 128 GiB, macOS 27.0, Xcode 27.0 / Swift 6.4, Release, GPU preferida, batch y concurrencia 1, alimentación por adaptador de 140 W reportando 94 W y modo High Power. Las latencias son medianas de tres ejecuciones con un calentamiento por longitud.

| Medición | Resultado |
|---|---:|
| Bundle del modelo (sin documentación ni ejemplos) | 13 archivos, 16.064.821.387 bytes (14,96 GiB) |
| Una decisión, 100 tokens | 0,615 s |
| Una decisión, 500 tokens | 2,208 s |
| Una decisión, 2.000 tokens | 8,978 s |
| Una decisión, 8.192 tokens | 37,139 s |
| Carga con especialización nueva | 28,224 s |
| Carga desde caché de especialización en proceso nuevo | 9,505 s |
| RSS pico durante la vida del proceso | 32,33 GB |
| Huella física pico del proceso | 21,34 GB (no es una cota) |
| RSS máximo muestreado durante una petición de 8.192 tokens | 17,30 GB |

El tiempo de decisión incluye renderizado, tokenización, inferencia del backbone y cabeza, pero excluye carga y E/S de JSON. El ejemplo grabado de primera petición sin calentamiento (61 tokens) tardó 1,941 s y devolvió probabilidades `[0,0008919818210415542, 0,9991080164909363]` en orden `false`, `true`. El autor advierte que tres ejecuciones no establecen un p95 y que no se reclama comparación controlada de velocidad con el modelo original ni con Core ML.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores de decisión tipada empaquetados para Core AI) ni datos de rendimiento del modelo base `autotrust/JEV-27B` que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No apto para chat libre ni generación de texto abierta; su uso está restringido a decisiones tipadas.
- No soporta iOS; requiere Apple Silicon, macOS 27 y Xcode 27 con Metal Toolchain, además de Rust/Cargo y Hugging Face CLI para la puesta en marcha.
- Solo inglés declarado; no se documenta cobertura multilingüe.
- El autor desaconseja explícitamente su uso en decisiones de alto riesgo sin validación independiente.
- Los mínimos de memoria y los límites de uso sostenido no están establecidos; durante peticiones repetidas de longitud alterna la huella física siguió aumentando.
- Una petición larga medida encontró presión térmica después de iniciarse; las medianas se obtuvieron a presión térmica nominal.
- El proceso alcanza un RSS pico de 32,33 GB, por lo que no cabe en configuraciones de memoria reducidas.
- El ejecutor exige que el archivo de salida no exista previamente y que se ejecute un único trabajo de modelo a la vez (bloqueo compartido documentado en AGENTS.md).
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo ni de calibración fuera del conjunto de reajuste; la fiabilidad probabilística en dominios distintos al de calibración no está garantizada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y la procedencia deben respetarse según lo indicado en `decision.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okayuji/jev-27b-coreai
- Modelo base: https://huggingface.co/autotrust/JEV-27B
- Repositorio de ejemplos y herramientas: https://github.com/oka-yuji/coreai-samples
- Documentación de bloqueo de trabajos: https://github.com/oka-yuji/coreai-samples/blob/main/AGENTS.md
- Guía de configuración común: https://github.com/oka-yuji/coreai-samples#get-started
- Registro de rendimiento completo: https://github.com/oka-yuji/coreai-samples/blob/main/docs/jev27b.md#performance
- Datos de rendimiento: https://github.com/oka-yuji/coreai-samples/blob/main/docs/validation/jev27b/performance-ac94.json
- Condiciones de medición: https://github.com/oka-yuji/coreai-samples/blob/main/docs/validation/jev27b/README.md#ac-94-w
