# desert-ant-labs/shapes

## Resumen

Shapes es un modelo de clasificación de imágenes especializado en el reconocimiento de formas y marcas dibujadas a mano alzada, desarrollado por Desert-Ant-Labs. A diferencia de los modelos de visión-lenguaje convencionales, su dominio es deliberadamente acotado: convertir trazos aproximados de lápiz, dedo, ratón o trackpad en formas geométricas limpias (círculos, rectángulos, rombos, estrellas, corazones, nubes, flechas y conectores) y en seis marcas gestuales (check, cruz, más, corchete, zigzag y garabato). El modelo está pensado para ejecutarse íntegramente en el dispositivo, sin dependencia de servicios remotos.

La relevancia del modelo reside en su latencia y su integración nativa: según la model card, reconoce un trazo en 0,92 ms en un iPhone 16 Pro, lo que permite previsualización en vivo mientras el usuario dibuja con PencilKit. Se distribuye como pesos LiteRT/TFLite con despliegue multiplataforma (iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node) mediante SDKs en Swift, Kotlin y JavaScript/TypeScript.

La información pública disponible no detalla la arquitectura interna, el número de parámetros ni el volumen de datos de entrenamiento; la model card se centra en la API de uso y en el comportamiento del producto. El repositorio de Hugging Face ocupa 0,0 GB, lo que sugiere un modelo de tamaño muy reducido, coherente con el objetivo de inferencia en dispositivo en milisegundos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (pesos LiteRT/TFLite para clasificación de imágenes) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de trazos, no de texto) |
| Tipos de cuantización | no disponible (formato TFLite/LiteRT; cuantización concreta no especificada) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | desert-ant-labs-source-available (source-available, no open source) |
| Formato de pesos | LiteRT / TFLite; versión de pesos v2.2.0 |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna (tipo de red, capas, mecanismos de atención o convoluciones), el número de parámetros ni la composición del dataset de entrenamiento. La model card describe únicamente la interfaz de inferencia: el modelo recibe una o varias `Stroke` (secuencias de puntos, opcionalmente con marcas temporales en milisegundos) y devuelve una forma tipada con sus coordenadas de lienzo, o `nil` si el trazo no se reconoce como forma.

El diseño funcional sí está documentado y es relevante para integradores: el reconocimiento opera sobre el conjunto de trazos de un mismo dibujo (habitualmente los trazos desde la última pausa del usuario), admite parámetros de `rotation` (`.snapped` con pasos de 15° y alineación de líneas dentro de 5° de los ejes, `.upright` y `.free`), filtrado por `kinds`, umbral `minimumConfidence` y un flag `isFinished` que distingue el reconocimiento al levantar el lápiz de la previsualización durante el trazo. Incluye heurísticas de regularización: cuadrados para cajas casi cuadradas, círculos para elipses casi circulares, polígonos regulares para formas casi regulares, y unión ortogonal de los brazos de un más o una cruz. No se dispone de información sobre RLHF, DPO ni sobre la innovación técnica a nivel de modelo más allá de la latencia reportada.

## Capacidades

- Reconocimiento de formas geométricas dibujadas a mano: círculos, rectángulos, rombos, estrellas, corazones, nubes, flechas y conectores, tanto en un solo trazo como en varios.
- Reconocimiento de seis marcas gestuales: check, cruz, más, corchete, zigzag y garabato (scribble).
- Devolución de geometría utilizable en canvas: puntos y tamaños para dibujar la forma (por ejemplo, las cuatro esquinas de una caja), polilíneas por trazo vía `Shape.paths(samples:)`, cabezas de flecha vía `Shape.arrowheads(length:)` y `CGPath` en plataformas Apple.
- Previsualización en vivo durante el trazo mediante `isFinished: false`.
- Integración con PencilKit en iOS y visionOS mediante `enableShapeSnapping()`, con reemplazo del trazo al levantar el lápiz, borrado por garabato dentro del casco convexo y registro en el gestor de deshacer.
- Agrupación temporal de trazos: los trazos sin pausa superior a `strokeGap` (1 s por defecto) se interpretan conjuntamente, permitiendo reconocer un más dibujado en dos trazos.
- Ejecución en dispositivo, sin tool calling, agentes, capacidades multilingües ni modos de razonamiento (no aplicables a este dominio).

## Casos de uso

- Anotación en aplicaciones de notas manuscritas: al pausar o levantar el lápiz, el SDK sustituye el trazo por una forma limpia y registra el cambio en el undo manager, de modo que el usuario puede deshacer la corrección si no la deseaba.
- Pizarras colaborativas y herramientas de diagramación: el reconocimiento de conectores y flechas permite construir diagramas de flujo a mano alzada que se renderizan como elementos vectoriales limpios, con orientación alineada a los ejes mediante `rotation: .upright`.
- Gestión de tareas en interfaces táctiles: el check y la cruz, cuyo significado lo decide la aplicación, permiten marcar ítems completados o rechazar pasos con un gesto, sin botones adicionales.
- Borrado gestual: el garabato devuelve un casco convexo (`hull`) que la app usa para eliminar los trazos cubiertos, sustituyendo un modo de borrador explícito.
- Captura de bocetos en entornos de baja latencia: con 0,92 ms por trazo en iPhone 16 Pro, es adecuado para previsualización en tiempo real mientras el dedo o el lápiz sigue en movimiento (`isFinished: false`).
- Aplicaciones multiplataforma con un único modelo: al distribuirse vía LiteRT/TFLite con SDKs Swift, Kotlin y JavaScript, permite compartir la misma lógica de snapping entre apps iOS/macOS/visionOS, Android, escritorio (Linux, Windows), navegador y Node.
- Herramientas educativas de geometría: la regularización de cuadrados, círculos y polígonos regulares facilita exercicios en los que el alumno dibuja una figura y el sistema la normaliza para evaluarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la latencia de reconocimiento de un trazo: 0,92 ms en un iPhone 16 Pro.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y el modelo está diseñado para ejecución en dispositivo (CPU/NPU/GPU integradas), sin necesidad de GPU dedicada.
- GPU recomendadas: no aplicable para el caso de uso previsto; el despliegue objetivo son dispositivos móviles y de escritorio con aceleración LiteRT/Core ML.
- Compatibilidad con GPU de consumo: no disponible; no se documentan requisitos de VRAM para RTX 4090, A100 o H100.
- Opciones de despliegue: LiteRT/TFLite en Android, Linux, Windows, navegador (vía `@litertjs/core`) y Node (núcleo nativo precompilado); Core ML en plataformas Apple; SDKs Swift (`desert-ant-core` 5.0.0), Kotlin (`ai.desertant:shapes:5.0.0`) y JavaScript (`@desert-ant-labs/shapes`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 0,92 ms por trazo en iPhone 16 Pro según la model card; no se publican cifras para otras plataformas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los reconocedores de formas comerciales habituales (por ejemplo, las funciones de snapping integradas en suites de notas) no publican pesos ni especificaciones comparables, y no se han identificado alternativas open source con formato LiteRT/TFLite y API equivalente en la información disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| desert-ant-labs/shapes | no disponible | no aplicable | 0,92 ms/trazo (iPhone 16 Pro) | source-available | Hugging Face, SDKs Swift/Kotlin/JS |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: solo reconoce las formas y marcas listadas; cualquier otro trazo devuelve `nil` y debe conservarse como tinta.
- Sin datos publicados sobre sesgos, composición del dataset o evaluación independiente; no es posible auditar la equidad del reconocimiento entre estilos de dibujo, dispositivos o usuarios.
- Riesgo de falsos positivos y negativos: el comportamiento depende de `minimumConfidence` y de las verificaciones internas del modelo; trazos incompletos con `isFinished: true` devuelven `nil` (por ejemplo, una caja a la que falta un lado).
- Dependencia de la agrupación temporal de trazos: un `strokeGap` mal ajustado puede unir dibujos distintos o separar trazos que forman una misma figura.
- Licencia source-available, no open source: el uso comercial y la redistribución están sujetos a los términos de https://license.desertant.com/, que deben revisarse antes de integrar el modelo en producción.
- La model card se genera automáticamente desde el repositorio `desert-ant-core`; los cambios en Hugging Face se sobrescriben, por lo que la fuente autorizada es el repositorio.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa texto; las advertencias multilingües no aplican.
- Sin información sobre el soporte a largo plazo de las versiones de pesos (v2.2.0) ni sobre compatibilidad con versiones futuras de LiteRT/Core ML.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/shapes
- Pesos v2.2.0: https://huggingface.co/desert-ant-labs/shapes/tree/v2.2.0
- Demo: https://desertant.com/models/shapes/
- Licencia: https://license.desertant.com/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
