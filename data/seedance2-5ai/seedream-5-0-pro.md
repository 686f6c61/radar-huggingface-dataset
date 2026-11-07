# seedance2-5ai/seedream-5-0-pro

## Resumen

Seedream 5.0 Pro es un modelo multimodal de generación y edición de imágenes desarrollado por el equipo Seed de ByteDance, publicado el 8 de julio de 2026. Cubre generación texto-a-imagen, edición de una o varias imágenes de referencia (hasta 10), edición guiada por posición (puntos, cajas, flechas, bocetos y coordenadas) y descomposición en capas de una imagen completa en una capa base más hasta 16 capas independientes con canal alfa, posición y orden de apilado.

El modelo está orientado a flujos de producción de diseño: pósteres con mucha información, visuales de producto, retratos y composiciones que requieren revisiones locales sucesivas sobre una misma dirección visual. Frente a generadores puramente texto-a-imagen, su propuesta es el control: referencias con rol asignado, marcas espaciales para delimitar la región a editar y capas exportables para seguir trabajando en otra herramienta.

La información pública disponible es una guía de modelo y especificaciones de la API de BytePlus ModelArk (precios a 7 de noviembre de 2026). El repositorio de Hugging Face asociado no contiene pesos: el tamaño del repo es de 0,0 GB y la model card marca `inference: false`, por lo que se trata de una ficha descriptiva de un modelo servido exclusivamente vía API. La arquitectura, el número de capas y la escala de parámetros no se han divulgado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no divulgada; modelo multimodal de generación y edición de imágenes) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se ha indicado que sea MoE) |
| Longitud de contexto | No disponible (no aplica en el sentido de contexto de texto; límite de referencias: hasta 10 imágenes) |
| Tipos de cuantizacion | No disponible (servicio vía API; no se publican pesos) |
| Idiomas soportados | Inglés (`en`) según la model card; la guía comercial menciona visuales multilingües |
| Licencia | No disponible |
| Formato de pesos | No disponible (repo de 0,0 GB, sin pesos; `inference: false`) |

Especificaciones adicionales de la API (BytePlus ModelArk, a 7 de noviembre de 2026):

| Parametro | Valor |
|---|---|
| Desarrollador | ByteDance Seed |
| Fecha de lanzamiento | 8 de julio de 2026 |
| ID de modelo en API | `dola-seedream-5-0-pro-260628` |
| Tareas | Texto-a-imagen, edición de una y varias imágenes, edición interactiva, descomposición en capas |
| Entradas | Prompts de texto; imágenes por URL accesible o Base64 |
| Límite de referencias | Hasta 10 en generación/edición; 1 en descomposición |
| Restricciones de imagen de entrada | Hasta 30 MB por imagen; generación acepta JPEG, PNG, WebP y otros; descomposición acepta PNG/JPEG |
| Formato y número de salidas | PNG/JPEG; una imagen en generación normal; en descomposición, una imagen base más capas separadas |
| Resoluciones predefinidas | 1K, 1.5K, 2K; por defecto 2K. Ejemplos cuadrados: 1024×1024, 1536×1536, 2048×2048 |
| Dimensiones personalizadas | 921.600–4.624.220 píxeles totales; relación de aspecto 1:16–16:1 (ambas restricciones se aplican) |
| Guía de edición | Puntos, cajas delimitadoras, flechas, regiones marcadas y coordenadas |
| Descomposición en capas | Una imagen base más hasta 16 capas independientes, con canal alfa, posición y orden de apilado |
| Optimización de prompt | `standard` o `fast`; `fast` es un ajuste de Pro, mientras que Flash es un modelo aparte |
| Precio por imagen de salida | Hasta 2,61 MP: 0,045 USD/imagen; por encima de ese tramo: 0,09 USD/imagen |

## Arquitectura y entrenamiento

No se ha divulgado la arquitectura interna: la documentación indica explícitamente que la estructura de red, el número de capas y la escala de parámetros no se han publicado. Tampoco hay información sobre el volumen de datos de entrenamiento, su composición ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Cualquier afirmación al respecto sería especulativa.

Lo que sí está documentado es la interfaz funcional del modelo, que condiciona su comportamiento en producción: acepta prompts de texto junto con hasta 10 imágenes de referencia a las que conviene asignar un rol (forma del producto, material, pose, fondo) para reducir ambigüedad; admite guía espacial mediante puntos, cajas, flechas, bocetos y coordenadas que delimitan la región a modificar mientras el texto describe la propiedad a cambiar; y ofrece descomposición en una capa base más hasta 16 capas con alfa, posición y orden de apilado. Estas capas son ficheros de imagen, no un proyecto de diseño editable con tipografías y objetos vectoriales. La familia Seedream 5.0 se organiza en tres variantes (Pro, Flash y Lite) que difieren en posicionamiento, opciones de resolución y facturación.

## Capacidades

- Generación texto-a-imagen con presets de 1K, 1.5K y 2K, y dimensiones personalizadas dentro de los límites de píxeles totales y relación de aspecto.
- Edición de una sola imagen: revisión de escena, apariencia o un objeto concreto a partir de una imagen existente.
- Edición multi-referencia con hasta 10 imágenes de entrada, asignando roles distintos a cada referencia.
- Edición guiada por posición: puntos, cajas delimitadoras, flechas, bocetos, regiones marcadas y coordenadas para localizar el cambio.
- Descomposición en capas: salida de una imagen base más hasta 16 capas independientes con canal alfa, posición y orden de apilado.
- Composición de visuales con mucha información: pósteres, infografías y conceptos de interfaz con visual principal, titulares, texto de apoyo y orden de lectura.
- Trabajo sobre visuales de producto y retratos fotográficos: iluminación, materiales, proporciones y composición a partir de una referencia.
- Optimización de prompt en modo `standard` o `fast`.
- Capacidades multilingües en los visuales generados según la guía comercial, aunque la model card declara únicamente inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso; es un modelo de imagen, no un LLM de propósito general.

## Casos de uso

- Pósteres e infografías con mucha información: el modelo compone alrededor de un visual principal, titulares y texto de apoyo, con control de posiciones de módulo y longitud del texto; fechas, precios y datos especializados requieren revisión humana posterior.
- Visuales de producto para comercio electrónico: se parte de una referencia que fija forma y material del producto y se exploran fondos, colores y encuadres sin perder las proporciones originales.
- Retratos y fotografía comercial: la referencia establece el punto de partida y el modelo permite iterar iluminación, paleta y composición manteniendo el parecido del sujeto.
- Revisiones locales sucesivas sobre un diseño ya establecido: con cajas o puntos se delimita la región (por ejemplo, una silla) y el prompt describe solo el cambio (nueva tela), lo que evita regenerar toda la escena.
- Adaptación de maquetas y layouts: la descomposición devuelve capas con posición y orden de apilado que se reordenan, sustituyen o combinan en otra herramienta de diseño para variantes de formato.
- Conceptos de interfaz y wireframes visuales: generación de pantallas con jerarquía visual y orden de lectura, útiles como material de discusión antes de pasar a diseño de producción.
- Campañas publicitarias con múltiples referencias: se combinan hasta 10 imágenes (producto, material, pose, fondo) para construir una escena coherente con una dirección de arte definida.
- Automatización de variantes creativas vía API: integración en pipelines que piden imágenes por URL o Base64 y reciben PNG/JPEG, con control de coste por tramo de píxeles (0,045 USD hasta 2,61 MP; 0,09 USD por encima).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No aplica hardware local: el repositorio de Hugging Face no contiene pesos (0,0 GB) y la model card declara `inference: false`. El modelo se consume exclusivamente a través de la API de BytePlus ModelArk.
- VRAM estimada para inferencia: no disponible, al no existir pesos descargables ni especificaciones de arquitectura.
- GPU recomendadas: no disponible por parte del autor; el cómputo corre en la infraestructura del proveedor.
- Ejecución en GPU de consumo: no es posible en la configuración publicada.
- Opciones de despliegue: llamadas HTTP a la API (`dola-seedream-5-0-pro-260628`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles. El único dato económico publicado es el precio por imagen de salida y el hecho de que cada capa de la descomposición se factura según su tramo real de píxeles.

## Comparativa con modelos similares

| Modelo | Desarrollador | Tareas | Referencias de entrada | Salida en capas | Resoluciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Seedream 5.0 Pro | ByteDance Seed | Texto-a-imagen, edición simple y multi-imagen, edición guiada por posición, descomposición | Hasta 10 | Sí, base + hasta 16 capas | 1K, 1.5K, 2K y personalizada | No disponible | API BytePlus ModelArk |
| Seedream 5.0 Flash | ByteDance Seed | Según la guía, variante de la familia con distinto posicionamiento y facturación | No disponible en detalle | No disponible en detalle | No disponible en detalle | No disponible | API BytePlus ModelArk |
| Seedream 5.0 Lite | ByteDance Seed | Según la guía, variante de la familia con distinto posicionamiento y facturación | No disponible en detalle | No disponible en detalle | No disponible en detalle | No disponible | API BytePlus ModelArk |

No se dispone de datos de benchmarks ni de especificaciones de modelos de otros fabricantes en la información proporcionada, por lo que no se establece comparación cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un modelo de imagen, es esperable que reproduzca sesgos de representación de sus datos de entrenamiento, pero no hay evidencia publicada en la información disponible.
- Alucinación visual: la documentación advierte de que fechas, precios y datos especializados en pósteres e infografías deben revisarse; el texto generado dentro de la imagen no es fiable sin comprobación.
- Fidelidad en edición: los detalles que se pretenden preservar deben compararse contra la salida; la guía espacial mejora la localización del cambio, pero no garantiza la conservación exacta del resto de la imagen.
- Capas no editables como diseño: la descomposición entrega ficheros de imagen con alfa, posición y orden, no un proyecto con tipografías y objetos vectoriales; no sustituye a una herramienta de diseño.
- Idioma: la model card declara solo inglés; las capacidades multilingües mencionadas en la guía comercial no están detalladas ni verificadas.
- Licencia no disponible: no se puede confirmar el uso comercial, la redistribución ni las restricciones de los outputs; es un riesgo directo para producción.
- Sin pesos descargables: no hay despliegue on-premise, ajuste fino ni auditoría del modelo; dependencia total del proveedor y de sus precios y políticas.
- Límites de entrada: 30 MB por imagen, hasta 10 referencias en generación/edición y una sola en descomposición; formatos restringidos a PNG/JPEG en descomposición.
- Límites de salida: rango de 921.600–4.624.220 píxeles totales y relación de aspecto 1:16–16:1, con ambas restricciones aplicadas simultáneamente.
- Coste variable: la facturación por tramos de píxeles y por capa en descomposición puede encarecer iteraciones con muchas capas o resoluciones altas.
- Repositorio sin tracción: 0 descargas y 0 likes en Hugging Face en el momento de la consulta; el repositorio actúa solo como ficha descriptiva.

## Enlaces

- Hugging Face: https://huggingface.co/seedance2-5ai/seedream-5-0-pro
- Guía oficial del modelo: https://www.seedance.tv/seedream-5-0
