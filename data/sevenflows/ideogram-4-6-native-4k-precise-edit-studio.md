# sevenflows/ideogram-4-6-native-4k-precise-edit-studio

## Resumen

El repositorio `sevenflows/ideogram-4-6-native-4k-precise-edit-studio` no contiene un modelo de IA con pesos descargables, sino un kit de material auxiliar (un grafo de ComfyUI, un prompt de ejemplo y documentación) para usar mediante API el modelo propietario Ideogram 4.6, desarrollado por Ideogram. El autor del repositorio, sevenflows, distribuye este "lite kit" como versión gratuita de un paquete de pago alojado en Whop, orientado a la generación de imágenes y a la edición precisa por máscaras.

El modelo al que hace referencia, Ideogram 4.6, es un generador de imágenes texto-a-imagen y edición que, según la model card, alcanza resolución nativa de hasta 4096×4096 píxeles, admite edición por máscaras y encadenamiento multi-turno, y ocupa el primer puesto en la clasificación de edición de imágenes multi-paso de Rapidata (1.892 puntos, instantánea del 17 de noviembre de 2026). No se trata de un modelo de lenguaje: no hay parámetros, arquitectura ni contexto en tokens publicados en la información disponible.

La relevancia de este repositorio es, por tanto, la de un ejemplo de integración vía API con ComfyUI, no la de un modelo open source. El propio autor advierte que no incluye pesos, que la generación se ejecuta en servidores de Ideogram y que el flujo de trabajo solo se ha validado estructuralmente, sin haber generado ninguna imagen ni realizado ninguna llamada a la API.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo propietario, solo API; no se publica la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la ventana de contexto en tokens no aplica) |
| Tipos de cuantizacion | no disponible (no hay pesos descargables) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (sin archivos de pesos; el repositorio ocupa 0.0 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo Ideogram 4.6 (tipo de red, tamaño, datos de entrenamiento, número de tokens, uso de RLHF o DPO). La model card no publica ningún detalle técnico de entrenamiento ni de diseño interno; únicamente describe capacidades de producto: resolución nativa de hasta 4096×4096, edición precisa por máscaras y sesiones de edición multi-turno.

El repositorio en sí contiene un grafo de ComfyUI (`Ideogram46_Lite_T2I.json`) construido con nodos del núcleo estándar, sin nodos personalizados, que prepara una petición a la API de generación de Ideogram. Según la documentación, el endpoint es `POST /v2/image/generate/ideogram-4-6` y la autenticación se realiza mediante la cabecera `Api-Key: <key>`.

## Capacidades

- Generación de imágenes texto-a-imagen con resolución nativa de hasta 4096×4096 píxeles.
- Edición precisa mediante máscaras (precise masked edits), según la descripción del paquete completo.
- Edición multi-turno encadenada (multi-turn chaining), según la model card.
- Generación de logotipos con fondo transparente (recorte), incluida en el paquete de pago.
- Control de colores exactos mediante recetas de color, incluido en el paquete de pago.
- Renderizado de texto dentro de la imagen (la model card menciona la comprobación del "text rendering" en el flujo de ejemplo).
- Integración con ComfyUI mediante peticiones HTTP a la API de Ideogram.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso en texto, visión de entrada ni audio.

## Casos de uso

- Carteles promocionales: el prompt de ejemplo genera un póster de una cafetería de barrio con texto renderizado en la imagen ("CAFÉ ATLAS"), lo que resulta adecuado para piezas de marketing que requieren tipografía legible dentro de la imagen.
- Edición de imágenes por máscaras: sustituir o retocar regiones concretas de una imagen sin regenerar el resto, útil en flujos de retoque fotográfico y composición publicitaria.
- Sesiones de edición iterativa: el encadenamiento multi-turno permite refinar una imagen en varias pasadas manteniendo coherencia, adecuado para diseño gráfico iterativo.
- Generación de logotipos con transparencia: el paquete completo incluye flujos de recorte de logotipos con fondo transparente, útil para identidad de marca.
- Pruebas de concepto de bajo coste: el flujo de ejemplo permite generar borradores a 2K con la tarifa "Low" (0,03 USD según la model card) antes de lanzar la versión final a 4K, lo que reduce el coste de iteración.
- Automatización de pipelines de imagen vía API: al ser un servicio HTTP, puede integrarse en scripts o en ComfyUI para generar lotes de imágenes dentro de un proceso automatizado, sin necesidad de GPU local.
- Prototipado de material gráfico con control de color: las recetas de color exactas del paquete completo permiten fijar paletas corporativas en las imágenes generadas.

## Benchmarks y rendimiento

La única métrica publicada en la información disponible es la posición en la clasificación de edición de imágenes multi-paso de Rapidata:

| Benchmark | Ideogram 4.6 | Ideogram 4.5 | Notas |
|---|---|---|---|
| Rapidata multi-step image edit leaderboard | 1.892 puntos (puesto 1, instantánea 17 nov 2026) | 1.866 puntos | La diferencia de 26 puntos queda dentro de los márgenes de incertidumbre de ±32 y ±30 indicados por el autor |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de texto en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- No se requiere GPU local: la generación se ejecuta en los servidores de Ideogram y el cliente solo realiza peticiones HTTP.
- Para el grafo de preparación se necesita una versión reciente de ComfyUI con nodos del núcleo estándar; no se requieren nodos personalizados ni descargas de modelos.
- Se necesita una cuenta de Ideogram con créditos y una clave de API propia.
- No hay estimaciones de VRAM, latencia ni throughput publicadas en la información disponible.
- Coste por llamada según la model card (precios verificados el 21 de noviembre de 2026, pendientes de confirmar en la página oficial): Very low 0,008 USD; Low 0,03 USD a 2K y 0,06 USD a 4K; Medium 0,06 USD a 2K y 0,12 USD a 4K; High 0,10 USD a 2K y 0,20 USD a 4K.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ideogram 4.6 | no disponible | no aplica | 1.892 en Rapidata multi-step edit (puesto 1) | no disponible (propietario, solo API) | API de Ideogram |
| Ideogram 4.5 | no disponible | no aplica | 1.866 en Rapidata multi-step edit | no disponible (propietario, solo API) | API de Ideogram |
| Otros modelos de generación de imágenes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni modelo descargable: es un kit de material auxiliar para usar un servicio propietario por API. No es un modelo open source.
- El flujo de trabajo solo está validado estructuralmente: el JSON se analiza y sus enlaces se validan, pero no se generó ninguna imagen ni se realizó ninguna llamada a la API durante su construcción.
- La URL base de la API no se volvió a verificar el día de la construcción (la consulta a `https://ideogram.ai/api` falló el 21 de noviembre de 2026); debe confirmarse en `ideogram.ai/docs`.
- Los precios indicados deben confirmarse en la página oficial de precios de Ideogram antes de usarlos.
- La ventaja de 26 puntos sobre Ideogram 4.5 en la clasificación de Rapidata queda dentro de los márgenes de incertidumbre (±32 y ±30), por lo que no debe interpretarse como una superioridad estadísticamente sólida.
- La versión "lite" no recibe actualizaciones, según la model card.
- Nunca debe pegarse la clave de API en un archivo de flujo de trabajo.
- Debe etiquetarse toda imagen generada por IA como tal cuando la plataforma o la legislación local lo exijan, y no debe editarse la fotografía de una persona real sin su permiso.
- No se dispone de información sobre sesgos, riesgo de alucinación visual, limitaciones idiomáticas ni restricciones de licencia para uso comercial.
- El repositorio registra 0 descargas y 0 "likes", y no tiene pipeline ni licencia declarados en Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sevenflows/ideogram-4-6-native-4k-precise-edit-studio
- Paquete completo (Whop): https://whop.com/imagelab/ideogram-4-6-native-4k-precise-edit-studio/
- Versión gratuita de inicio (Whop): https://whop.com/imagelab/free-starter-ideogram-4-6-native-4k-precise-edit-studio/
- Documentación de la API de Ideogram: https://ideogram.ai/docs
- Clasificación de edición de imágenes multi-paso de Rapidata: no disponible (no se incluye URL en la información proporcionada)
