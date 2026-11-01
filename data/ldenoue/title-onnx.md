# ldenoue/title-onnx

## Resumen

Title es un modelo de lenguaje especializado en la generación de títulos y descripciones breves para cualquier pasaje de texto. Lo desarrolla Desert Ant Labs y se distribuye como un fine-tune del modelo base `ibm-granite/granite-4.0-350m`, una arquitectura híbrida de tipo GraniteMoeHybrid con 350 millones de parámetros. El modelo está diseñado para ejecutarse íntegramente en dispositivo (on-device) en plataformas Apple (iOS, macOS, tvOS y visionOS) mediante MLX, sin necesidad de conexión a servidores externos.

El problema que resuelve es concreto: dado un fragmento de texto (típicamente la transcripción de un clip de audio o vídeo), producir un título factual de entre 3 y 8 palabras y una descripción de una o dos frases que identifique ese pasaje concreto, no su tema genérico. El registro es deliberadamente sobrio: sin emojis, sin hashtags y sin clickbait. Esto lo hace adecuado para aplicaciones de gestión de contenido, podcasts, notas de voz o bibliotecas multimedia donde se necesita metadatos automáticos y consistentes.

La relevancia actual del modelo radica en su enfoque de despliegue: prioriza la latencia y la privacidad en dispositivo frente a la inferencia en la nube. Según la model card, el autor midió que Title escribe texto entre 5,7 y 8,3 veces más rápido en la GPU (vía MLX) que en el Neural Engine (vía Core ML), lo que motivó descartar la build de Core ML. El repositorio de HuggingFace ocupa 0,2 GB e incluye pesos cuantizados a 6 bits en formato safetensors, además de una variante ONNX según el identificador del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteMoeHybrid (transformer híbrido, base `ibm-granite/granite-4.0-350m`) |
| Parametros totales | 350 millones (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (pesos publicados); variante ONNX en el repositorio |
| Idiomas soportados | multilingüe |
| Licencia | Desert Ant Labs Source-Available License (uso gratuito para la mayoría de apps, licencia comercial requerida a escala) |
| Formato de pesos | safetensors (MLX), ONNX |

## Arquitectura y entrenamiento

Title se construye sobre `ibm-granite/granite-4.0-350m`, un modelo de 350 millones de parámetros con arquitectura GraniteMoeHybrid. La model card no detalla la composición interna de capas híbridas ni la proporción entre atención y componentes recurrentes o MoE; esa información corresponde al modelo base y no se reproduce en la documentación de Title. El fine-tune se orientó a una tarea única de generación estructurada: producir dos líneas etiquetadas (`TITLE:` y `DESC:`) a partir de un texto de entrada.

El entrenamiento se realizó sobre clips de transcripción, aunque el autor indica que el modelo funciona razonablemente bien con prosa general como párrafos de noticias, descripciones de productos y correos electrónicos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Sí se documenta que el modelo se ajustó contra una plantilla de chat concreta (`chat_template.jinja`) y que debe mantenerse tal cual se distribuye, ya que una plantilla distinta cambia la tarea que el modelo ejecuta.

Una innovación destacable es la decisión de ingeniería de priorizar MLX sobre Core ML. El autor argumenta que el Neural Engine está limitado por el ancho de banda de memoria al generar texto corto token a token, y que la build de Core ML perdió frente a MLX en tiempo hasta el primer token, tokens por segundo, tiempo de carga y uso de memoria. Por eso Title solo se distribuye para MLX y requiere el trait `MLX` en el paquete Swift; sin él, el módulo compila como un stub.

## Capacidades

- Generación de títulos factuales de 3 a 8 palabras sin puntuación final, y descripciones de una o dos frases para cualquier pasaje de texto.
- Salida estructurada en dos líneas etiquetadas (`TITLE:` y `DESC:`), con parseo tolerante por parte del SDK cuando el modelo se desvía del formato.
- Procesamiento por lotes de clips mediante `cards(for:)`, que devuelve las tarjetas alineadas por índice con los clips de entrada.
- Funcionamiento multilingüe según la etiqueta de idioma del repositorio.
- Ejecución on-device en iOS, macOS, tvOS y visionOS mediante MLX sobre GPU de Apple silicon.
- Gestión de ciclo de vida en iOS: métodos `suspend()` y `resume()` para cancelar generaciones cuando la app pasa a segundo plano y evitar cierres por pérdida de acceso a la GPU.
- Control de longitud de generación mediante `maxTokens` (96 tokens por defecto) para evitar generaciones sin fin en entradas atípicas.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Titulado automático de clips de podcast y vídeo: el modelo recibe la transcripción de cada clip y devuelve un título y una descripción listos para mostrar en una biblioteca multimedia. Es su caso de uso principal, ya que el fine-tune se entrenó sobre transcripciones.
- Gestión de notas de voz en iOS: una app de notas puede generar tarjetas descriptivas para cada grabación sin enviar el audio ni la transcripción a la nube, preservando la privacidad y reduciendo costes de infraestructura.
- Indexación de bibliotecas de contenido en macOS: al procesar lotes de documentos o transcripciones con `cards(for:)`, se pueden poblar metadatos de búsqueda y catálogos sin depender de conectividad.
- Resumen de correos electrónicos en clientes de correo para Apple: el modelo genera una línea de asunto y una descripción breve de cada mensaje, aprovechando que el autor indica buen rendimiento en correos.
- Descripciones de productos en apps de catálogo: a partir de fichas o descripciones largas, el modelo produce un título corto y una sinopsis de una o dos frases para listados y tarjetas de producto.
- Titulado de párrafos de noticias en lectores de RSS o agregadores: el modelo sintetiza titulares factuales y descripciones sin clickbait, manteniendo un registro sobrio y consistente.
- Etiquetado de contenido en tvOS y visionOS: aplicaciones de vídeo pueden generar títulos y descripciones de fragmentos directamente en el dispositivo, sin latencia de red ni costes por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta una comparación interna de rendimiento entre backends: Title escribe texto entre 5,7 y 8,3 veces más rápido en la GPU mediante MLX que en el Neural Engine mediante Core ML. También se indica que la build de Core ML fue peor en tiempo hasta el primer token, tokens por segundo, tiempo de carga y uso de memoria, pero no se proporcionan cifras absolutas de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 350 millones de parámetros y cuantización de 6 bits, el peso de los pesos ronda los 0,2 GB, por lo que la huella de memoria es muy reducida.
- Plataformas soportadas: exclusivamente Apple silicon (iOS, macOS, tvOS y visionOS) mediante MLX. No hay build para Android, Linux, Windows, navegador ni Node.
- GPU recomendadas: cualquier GPU integrada de Apple silicon compatible con MLX; no se especifican modelos concretos de chip (M1, M2, M3, A17, etc.) en la documentación.
- Cabe en GPU de consumo: sí, por el tamaño reducido del modelo, siempre que el dispositivo sea Apple silicon con soporte MLX.
- Opciones de despliegue: paquete Swift `desert-ant-core` con el trait `MLX`, creando una instancia de `Titles` y reutilizándola, ya que la carga es lenta y la generación rápida. El repositorio incluye además una variante ONNX, aunque la model card no documenta su uso.
- Latencia y throughput: no se publican cifras absolutas; solo la comparación relativa de 5,7 a 8,3 veces más rápido en GPU que en Neural Engine. Se recomienda generar una tarjeta a la vez, ya que las generaciones en paralelo no aceleran el proceso y añaden calor en dispositivos móviles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Title (ldenoue/title-onnx) | 350 M (base Granite 4.0 350M) | no disponible | Titulado y descripción on-device | Source-available (Desert Ant Labs) | HuggingFace, MLX para Apple |
| ibm-granite/granite-4.0-350m | 350 M | no disponible | Modelo base de propósito general | no disponible en esta ficha | HuggingFace |
| Alternativas de titulado on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos especializados en titulado on-device con los que comparar parámetros, contexto o rendimiento. La comparación más directa es con su modelo base, `ibm-granite/granite-4.0-350m`, del que hereda arquitectura y tamaño, pero no se documentan en la información proporcionada las especificaciones completas del base (contexto, licencia, cuantizaciones).

## Limitaciones y advertencias

- El modelo a veces abre una descripción con una frase hecha que su instrucción prohíbe; el autor recomienda revisar cada tarjeta antes de mostrarla a un usuario.
- Puede equivocarse en detalles sobre prosa general; es más preciso en transcripciones de clips, párrafos de noticias, descripciones de productos y correos electrónicos.
- En entradas atípicas puede generar sin fin; es necesario fijar `maxTokens` (96 por defecto) para acotar cada ejecución.
- El modelo a veces se desvía del formato de dos líneas etiquetadas, por lo que el parseo de la respuesta debe ser tolerante: si no hay etiquetas, se toma la primera línea como título.
- La plantilla de chat debe mantenerse tal como se distribuye; una plantilla distinta cambia la tarea que realiza el modelo.
- Solo funciona en Apple silicon mediante MLX; no hay soporte para Android, Linux, Windows, navegador ni Node.
- En iOS, es obligatorio llamar a `suspend()` antes de que la app pase a segundo plano y a `resume()` al volver, porque iOS revoca el acceso a la GPU y MLX provoca un cierre si hay una generación en curso.
- La licencia es source-available: es gratuita para la mayoría de apps, pero requiere una licencia comercial a escala. Los términos completos están en el enlace de licencia.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ldenoue/title-onnx
- Pesos v0.1.0 del modelo original: https://huggingface.co/desert-ant-labs/title/tree/v0.1.0
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Licencia: https://license.desertant.com/
- Contacto de licencias: licensing@desertant.com
- Avisos de terceros: https://huggingface.co/desert-ant-labs/title (archivo `THIRD_PARTY_NOTICES.md`)
