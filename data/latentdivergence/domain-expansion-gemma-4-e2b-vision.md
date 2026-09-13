# latentdivergence/domain-expansion-gemma-4-e2b-vision

## Resumen

Domain Expansion Gemma 4 E2B Vision es un artefacto multimodal para ejecución en dispositivo (on-device) publicado por el usuario latentdivergence en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un espejo verificado byte a byte (`gemma-4-E2B-it.litertlm`) del artefacto multimodal LiteRT-LM Gemma 4 E2B mantenido por la comunidad en `litert-community/gemma-4-E2B-it-litert-lm`, a su vez derivado del modelo base `google/gemma-4-E2B-it`. Su propósito declarado es servir como el modelo que responde preguntas sobre un fotograma de cámara, además de sobre texto, dentro de la aplicación Domain Expansion XR para el escaneo de habitaciones.

El modelo resuelve un problema muy concreto: llevar capacidades de visión y lenguaje a dispositivos Android arm64 con GPU compatible, sin enviar datos a ningún servidor. La inferencia es completamente local tras la descarga única del artefacto, que ocupa 2.588.147.712 bytes (aproximadamente 2,6 GB) y se ejecuta con el runtime LiteRT-LM, usando el backend GPU tanto para el decodificador de texto como para el codificador de visión.

Su relevancia actual es doble. Por un lado, demuestra el patrón de despliegue de modelos multimodales en móvil con un único fichero autocontenido (runtime, pesos y tokenizador en formato `.litertlm`). Por otro, es un ejemplo de cadena de procedencia verificable en HuggingFace: el autor documenta el origen exacto, el hash SHA-256 y la licencia del artefacto original. La información pública disponible sobre parámetros, contexto o idiomas es muy limitada, por lo que esta ficha marca explícitamente esos huecos como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el artefacto es un binario `.litertlm`; el modelo base `google/gemma-4-E2B-it` no detalla su arquitectura en la información proporcionada) |
| Parametros totales | no disponible (la nomenclatura "E2B" del modelo base sugiere un tamaño efectivo del orden de 2.000 millones de parámetros, pero no se confirma en la información disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publica el esquema de cuantización del fichero `.litertlm`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM, fichero único `gemma-4-E2B-it.litertlm`); no incluye safetensors ni GGUF |
| Tamano del artefacto | 2.588.147.712 bytes (aproximadamente 2,6 GB) |
| Hash SHA-256 | 181938105e0eefd105961417e8da75903eacda102c4fce9ce90f50b97139a63c |
| Modalidades | texto e imagen (pipeline `image-text-to-text`) |
| Runtime objetivo | LiteRT-LM para Android (decodificador de texto y codificador de visión en backend GPU) |
| Plataforma | Android arm64 con GPU compatible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF, DPO u otras) del modelo base `google/gemma-4-E2B-it`. La model card del artefacto publicado por latentdivergence es deliberadamente operativa: describe el fichero, su procedencia y cómo cargarlo, no cómo se entrenó.

Lo que sí se documenta es la topología de ejecución. El artefacto contiene dos componentes que se ejecutan en GPU: un decodificador de texto y un codificador de visión (`visionBackend`). El pipeline declarado es `image-text-to-text`, de modo que el modelo acepta una imagen codificada por turno, entregada como `Content.ImageBytes` (un JPEG codificado por cada turno conversacional), junto con el texto del prompt. El "domain expansion" del nombre hace referencia a la aplicación XR que lo consume (escaneo de habitaciones), no a una técnica de entrenamiento documentada. La innovación destacable, en términos de ingeniería, es el empaquetado en un único fichero `.litertlm` con inferencia íntegramente local y backend GPU compartido entre visión y lenguaje.

## Capacidades

- Generación de texto conversacional multi-turno en el dispositivo, sin conexión a red tras la descarga inicial.
- Respuesta a preguntas sobre imágenes: el modelo recibe un fotograma de cámara (JPEG codificado) por turno y responde en lenguaje natural sobre su contenido.
- Comprensión visual orientada a escenas: el caso de uso declarado es el escaneo de habitaciones en una aplicación XR, lo que implica descripción e interpretación de entornos físicos.
- Ejecución combinada de codificador de visión y decodificador de texto en GPU dentro de Android arm64.
- Privacidad por diseño: ningún dato de imagen o texto sale del dispositivo.
- Capacidades de tool calling, function calling, agentes, matemáticas, código o modo de razonamiento explícito: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistente de escaneo de habitaciones en aplicaciones XR: el modelo recibe el fotograma de la cámara y responde preguntas del usuario sobre los objetos, dimensiones aparentes o distribución del espacio, tal y como hace Domain Expansion XR. Es adecuado porque el pipeline `image-text-to-text` acepta una imagen por turno y mantiene la conversación en el propio dispositivo.
- Asistente de accesibilidad para personas con discapacidad visual: descripción bajo demanda de lo que capta la cámara del teléfono, con latencia local y sin coste de API. El procesamiento on-device evita enviar imágenes del entorno doméstico a servidores externos.
- Soporte técnico de campo sin cobertura: operarios que necesitan identificar componentes, etiquetas o estados de maquinaria en ubicaciones sin red pueden consultar al modelo con la cámara del dispositivo y obtener respuestas offline.
- Catalogación y etiquetado asistido de inventario: capturar fotografías de productos o estanterías y generar descripciones textuales o clasificaciones preliminares que después se sincronizan con el sistema central cuando hay conectividad.
- Aplicaciones de realidad aumentada con diálogo contextual: el modelo actúa como capa conversacional que interpreta lo que el usuario está mirando y responde en el mismo hilo, integrándose en el bucle de renderizado de la app XR.
- Verificación de documentos o tickets en movilidad: el usuario fotografía un documento y formula preguntas sobre su contenido, con la garantía de que la imagen no abandona el teléfono, algo relevante para datos personales o financieros.
- Prototipado de aplicaciones multimodales Android: desarrolladores que quieren evaluar el rendimiento real de un modelo de visión-lenguaje en LiteRT-LM antes de comprometerse con una arquitectura de producto.
- Demostraciones y entornos educativos sin infraestructura: al no requerir servidor ni GPU dedicada, sirve para talleres y pruebas de concepto en dispositivos de gama alta con Android arm64.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del artefacto es un documento de despliegue (fichero, hash, runtime e instrucciones de carga) y no incluye evaluaciones de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra suite. Las búsquedas web realizadas no han devuelto resultados relevantes sobre este modelo. Tampoco se publican métricas de latencia, tokens por segundo ni consumo energético en el dispositivo objetivo.

## Requisitos de hardware

- VRAM o memoria estimada para inferencia: no disponible de forma oficial. Como referencia derivada del tamaño del fichero (2,6 GB), cabe esperar un consumo de memoria en el rango de 3 a 4 GB sumando pesos, caché KV y el codificador de visión, aunque esta cifra es una estimación y no un dato publicado.
- Plataforma objetivo declarada: dispositivos Android arm64 con GPU compatible. El artefacto no está pensado para x86 ni para escritorio.
- GPU de escritorio (A100, H100, RTX 4090): no aplicable de forma nativa. El formato `.litertlm` se consume con LiteRT-LM; usarlo en un PC requeriría una ruta de conversión no documentada por el autor.
- Cabe en GPU de consumo: no disponible para el formato publicado. El equivalente en GPU móvil es el backend GPU de LiteRT-LM en Android.
- Opciones de despliegue: LiteRT-LM para Android, inicializando el motor de forma perezosa con `Backend.GPU()` para el decodificador y para `visionBackend`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este formato.
- Gestión de recursos recomendada por el autor: no empaquetar el fichero en el APK, descargarlo al almacenamiento privado de la aplicación y liberar el motor cuando el asistente quede inactivo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Modalidad | Formato | Tamano | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| latentdivergence/domain-expansion-gemma-4-e2b-vision | Imagen y texto | `.litertlm` | 2,6 GB | Apache-2.0 | Repositorio de terceros, 0 descargas y 0 likes en el momento de la consulta | Espejo byte a byte del artefacto de litert-community |
| litert-community/gemma-4-E2B-it-litert-lm | Imagen y texto | `.litertlm` | 2.588.147.712 bytes (mismo fichero) | Apache-2.0 | Repositorio comunitario | Fuente original declarada del espejo |
| latentdivergence/domain-expansion-gemma-4-e2b-mobile | Solo texto | Export para GPU móvil (formato no detallado) | no disponible | Apache-2.0 | Repositorio del mismo autor | Versión anterior que usaba la aplicación antes de adoptar el artefacto multimodal |
| google/gemma-4-E2B-it | Imagen y texto | no disponible | no disponible | no disponible en la información proporcionada | Modelo base publicado por Google | Origen de la cadena de derivación; de él procede el ajuste que se exportó a LiteRT-LM |

No se dispone de datos de rendimiento comparado entre estas variantes, únicamente de la relación de procedencia y del formato de distribución.

## Limitaciones y advertencias

- Los benchmarks y las especificaciones de arquitectura, contexto e idiomas no están publicados; cualquier decisión de producción basada en capacidades debe validarse empíricamente primero.
- Es un espejo de terceros, no el repositorio oficial: conviene verificar el hash SHA-256 (`181938105e0eefd105961417e8da75903eacda102c4fce9ce90f50b97139a63c`) antes de desplegarlo y comparar con la fuente en `litert-community`.
- El repositorio no tenía descargas ni likes en el momento de la consulta, por lo que carece de validación comunitaria medible.
- La licencia declarada es Apache-2.0, heredada del artefacto original. Si el modelo base de Google estuviera sujeto a términos adicionales de uso (Gemma Terms of Use u otros), esos términos podrían aplicar por encima de la licencia del espejo; conviene revisarlos antes de un uso comercial.
- Riesgo de alucinación: inherente a los modelos de lenguaje y visión-lenguaje, y sin cuantificar en este caso al no existir evaluaciones publicadas. En tareas de interpretación visual, una descripción errónea de un objeto o una etiqueta puede tener consecuencias reales.
- Sesgos: no documentados. No hay información sobre la composición del dataset de entrenamiento ni sobre evaluaciones de equidad.
- Limitaciones de idioma y contexto: no disponibles, lo que impide garantizar un comportamiento correcto en castellano o en conversaciones largas.
- Restricciones de despliegue: el artefacto está atado al runtime LiteRT-LM en Android arm64. No se puede reutilizar directamente en servidores, en iOS ni en pipelines habituales de inferencia como vLLM o llama.cpp.
- Requisito operativo explícito del autor: no incluir el fichero en el APK; descargarlo al almacenamiento privado de la aplicación y liberar el motor cuando no se use. Omitir la liberación puede provocar consumo de memoria sostenido en el dispositivo.
- Al procesar imágenes de cámara, entran en juego consideraciones de privacidad y protección de datos (por ejemplo, el RGPD en la Unión Europea) incluso aunque el procesamiento sea local; la app que lo integra sigue siendo responsable del tratamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/latentdivergence/domain-expansion-gemma-4-e2b-vision
- Artefacto original espejado: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Export anterior solo texto del mismo autor: https://huggingface.co/latentdivergence/domain-expansion-gemma-4-e2b-mobile
- Modelo base (referenciado en la model card): google/gemma-4-E2B-it
- Repositorio GitHub, paper, blog o demo asociados: no disponibles en la información proporcionada.
