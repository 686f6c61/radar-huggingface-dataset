# desert-ant-labs/shapes

## Resumen

Shapes es un modelo de clasificación de imágenes desarrollado por Desert-Ant-Labs, diseñado específicamente para el reconocimiento de formas dibujadas a mano alzada con un solo trazo. A diferencia de los modelos de visión de propósito general, Shapes está optimizado para ejecutarse en el dispositivo (on-device) y convertir un trazo imperfecto de lápiz o dedo en una forma geométrica limpia: rectángulo, elipse, triángulo, rombo, pentágono, hexágono, estrella, corazón, nube, conector, flecha o garabato (usado como gesto de borrado). El modelo devuelve `nil` cuando el trazo no corresponde a ninguna de estas categorías, lo que permite conservar la tinta original en aplicaciones de dibujo.

El modelo está empaquetado en formato LiteRT/TFLite con pesos de menos de 1 MB y latencia de pocos milisegundos, lo que lo hace adecuado para integración en aplicaciones móviles y de escritorio. Se distribuye a través de SDKs nativos para Swift (iOS, macOS, tvOS, visionOS), Kotlin (Android), JavaScript/TypeScript (navegador y Node), y también soporta Linux y Windows. La licencia es propietaria de tipo "source-available" bajo el identificador `desert-ant-labs-source-available`.

La relevancia actual de Shapes radica en su enfoque vertical: no compite con modelos de visión generalistas, sino que resuelve un problema muy concreto de las aplicaciones de toma de notas y dibujo (estilo PencilKit o Samsung Notes) con un modelo minúsculo que cabe en cualquier dispositivo y funciona sin conexión. Su API multiplataforma con nombres de campos idénticos en Swift, Kotlin y TypeScript facilita la portabilidad del código entre plataformas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación de trazos en formato LiteRT/TFLite) |
| Parametros totales | no disponible (pesos < 1 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: secuencia de puntos de un trazo) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato TFLite, presumiblemente cuantizados por el tamano < 1 MB) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | desert-ant-labs-source-available (propietaria, source-available) |
| Formato de pesos | TFLite / LiteRT (descarga desde Hugging Face y cacheado por el SDK) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la información proporcionada. La model card indica que se trata de un clasificador que procesa una secuencia de puntos (`[Point]`, `[CGPoint]` o `PKStroke` en Apple) y devuelve una de 13 categorías de forma junto con parámetros geométricos (esquinas, eje de una flecha, casco convexo de un garabato, etc.). El paquete se distribuye como un archivo TFLite/LiteRT de menos de 1 MB, lo que sugiere una red neuronal compacta, probablemente con cuantización, aunque no se especifica el tipo exacto.

Tampoco se detallan los datos de entrenamiento (número de trazos, composición del dataset, si hubo aumento de datos o entrenamiento con trazos sintéticos). La model card menciona que el modelo aplica umbrales calibrados por tipo de forma y un parámetro `minimumConfidence` configurable, lo que indica un proceso de calibración de confianza por clase. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de clasificación geométrica.

## Capacidades

- Clasificación de trazos de un solo trazo en 13 categorías: conector recto o curvo, flecha, rectángulo, elipse, triángulo, rombo, pentágono, hexágono, estrella, corazón, nube y garabato.
- Devolución de geometría ajustada: esquinas de un rectángulo, eje y cabezas de una flecha, casco convexo de un garabato, contorno (`outline`) de cualquier forma.
- Rechazo explícito de trazos no reconocidos: devuelve `nil`/`null` para escritura a mano o formas incompletas, permitiendo conservar la tinta.
- Control de rotación: modos `snapped` (redondeo a pasos de 15° y ajuste a ejes), `upright` (elimina rotación) y `free` (mantiene la rotación original).
- Filtrado de tipos reconocidos mediante el parámetro `kinds` (por ejemplo, desactivar `scribble` si no hay gesto de borrado).
- Umbral de confianza configurable (`minimumConfidence`) además de los umbrales calibrados por tipo.
- Integración con PencilKit en iOS y visionOS mediante `enableShapeSnapping()`, con previsualización en vivo, sustitución del trazo y registro en el gestor de deshacer.
- API multiplataforma con nombres de campos idénticos en Swift, Kotlin y TypeScript.
- Ejecución on-device sin conexión tras la primera descarga de pesos.

## Casos de uso

- **Aplicaciones de toma de notas manuscritas**: integrar `enableShapeSnapping()` en un lienzo PencilKit para que, al dibujar un rectángulo o una flecha y levantar el lápiz, el trazo se sustituya por una forma limpia. Adecuado por su latencia de milisegundos y su tamaño inferior a 1 MB.
- **Pizarras colaborativas en navegador**: usar el SDK de JavaScript con LiteRT.js para reconocer formas dibujadas con ratón o puntero táctil directamente en el cliente, sin enviar trazos al servidor. El modelo cabe en el bundle web y funciona offline.
- **Edición de diagramas en Android**: emplear el SDK de Kotlin para convertir trazos en conectores y flechas en herramientas de diagramación tipo Excalidraw o draw.io, aprovechando la devolución del eje y las cabezas de flecha.
- **Gestos de borrado**: mapear el tipo `scribble` a una acción de borrado usando el casco convexo devuelto (`hull`) para eliminar los trazos que cubre, replicando el gesto de tachar de las libretas de papel.
- **Anotación sobre documentos y PDF**: en aplicaciones de revisión, reconocer subrayados, recuadros y flechas dibujadas sobre el documento para generar anotaciones estructuradas (por ejemplo, un rectángulo se convierte en un comentario adjunto a una región).
- **Herramientas de diseño en escritorio (Windows/Linux/macOS)**: integrar el modelo en editores vectoriales para que el usuario dibuje formas aproximadas con el ratón y el editor las sustituya por primitivas geométricas editables.
- **Prototipado rápido en Node**: usar la variante nativa de Node para procesar lotes de trazos en pruebas automatizadas o para generar datasets de formas a partir de bocetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que el modelo pesa menos de 1 MB y que la inferencia tarda "unos pocos milisegundos" en dispositivo, sin cifras concretas de latencia, throughput ni precisión por clase.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo pesa menos de 1 MB, por lo que cabe en memoria de cualquier dispositivo móvil, tableta, navegador o sistema de escritorio.
- GPU recomendadas: no requiere GPU dedicada; está diseñado para ejecutarse en CPU y en aceleradores de dispositivo (Neural Engine en Apple, NNAPI en Android, WebGPU/WASM en navegador según el runtime LiteRT).
- Compatibilidad con GPU de consumo: irrelevante por el tamaño; cualquier RTX o iGPU puede ejecutarlo, pero no es su objetivo.
- Opciones de despliegue: SDKs oficiales para Swift (iOS/macOS/tvOS/visionOS), Kotlin (Android), JavaScript/TypeScript (navegador con `@litertjs/core` y Node con core nativo precompilado), además de soporte para Linux y Windows.
- Latencia estimada: "unos pocos milisegundos" según la model card; no se publican cifras exactas de throughput.
- Almacenamiento: los pesos se descargan desde Hugging Face en el primer uso y se cachean localmente; el repositorio ocupa 0.0 GB según Hugging Face (redondeado, coherente con un tamaño inferior a 1 MB).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen aproximaciones heurísticas clásicas al reconocimiento de formas (por ejemplo, el algoritmo de Ramer-Douglas-Peucker combinado con detección de esquinas, o el recognizer de formas de librerías como `$1 Recognizer`), pero no se han proporcionado datos de rendimiento que permitan una comparación cuantitativa con Shapes. Tampoco se documentan alternativas de modelos neuronales on-device para esta tarea específica en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Shapes (Desert-Ant-Labs) | no disponible (< 1 MB) | no aplica | source-available propietaria | Hugging Face + SDKs |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia propietaria**: la licencia `desert-ant-labs-source-available` no es una licencia de código abierto estándar; es necesario revisar los términos en https://license.desertant.com/ antes de cualquier uso comercial o redistribución.
- **Alcance limitado**: solo reconoce 13 tipos de forma predefinidos; no reconoce escritura a mano, formas compuestas ni figuras no incluidas en la lista.
- **Trazos de un solo trazo**: el modelo está diseñado para trazos únicos; no se documenta el comportamiento con formas dibujadas en varios trazos.
- **Riesgo de clasificación errónea**: un trazo ambiguo puede clasificarse como una forma incorrecta o devolver `nil`; los umbrales calibrados y `minimumConfidence` mitigan el problema, pero no lo eliminan.
- **Dependencia de descarga inicial**: los SDK descargan los pesos desde Hugging Face en el primer uso, lo que requiere conectividad en ese momento (aunque después se cachean).
- **Sesgos**: no se documentan sesgos conocidos; al no procesar lenguaje ni datos personales, el riesgo de sesgo social es bajo, pero podría haber sesgo hacia estilos de dibujo presentes en los datos de entrenamiento (no especificados).
- **Documentación incompleta**: no se publican detalles de arquitectura, dataset de entrenamiento, métricas de precisión ni resultados de benchmarks, lo que dificulta una evaluación rigurosa antes de adoptarlo en producción.
- **Sin soporte de idiomas**: no aplica como modelo de lenguaje; la etiqueta de idiomas no está disponible porque no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/shapes
- Pesos v1.0.0: https://huggingface.co/desert-ant-labs/shapes/tree/v1.0.0
- Demo en vivo (Hugging Face Spaces): https://huggingface.co/spaces/desert-ant-labs/shapes-demo
- Demo oficial: https://desertant.com/models/shapes/
- Repositorio del SDK (desert-ant-core): https://github.com/Desert-Ant-Labs/desert-ant-core
- Licencia: https://license.desertant.com/
- Documentación de requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Documentación de requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Documentación de requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Documentación de descargas y caché: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
