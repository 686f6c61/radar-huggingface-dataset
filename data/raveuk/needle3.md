# rAVEUK/needle3

## Resumen

Needle 3 es un modelo fundacional desarrollado por Cactus Compute y diseñado para ejecutarse íntegramente en el dispositivo (on-device) en móviles, wearables, robots, domótica, automoción y microcontroladores. El repositorio rAVEUK/needle3 es una subida a HuggingFace del modelo bajo licencia Apache 2.0; la model card remite a la página de release de Cactus Compute y el autor de la subida (rAVEUK) no coincide con el desarrollador citado en la documentación. El modelo completo se distribuye en un único archivo de entre 8 y 29 MB, y sus autores declaran intercambiar capacidad de chat general por superar en tool calling móvil a modelos diez veces mayores y por igualar a modelos dos o tres veces mayores en extracción de información.

La arquitectura es una Laddered Simple Attention Network: 121M de parámetros repartidos en 20 capas, atención GQA con taps de convolución causal, un MLP Monarch Hadamard en lugar de la FFN convencional y una memoria de n-gramas (engram) que concentra la mayor parte de los parámetros. Su rasgo definitorio es la escalera: cada profundidad entre 2 y 20 capas constituye un modelo desplegable de forma independiente. El modelo cubre tres tareas: tool calling, extracción estructurada a JSON y embeddings de texto.

Su relevancia actual radica en que permite agentes con function calling en hardware sin GPU ni conectividad: el motor por plataforma pesa menos de 1 MB, el formato .cact se mapea y lee en su sitio, y existen motores para navegador (WebAssembly), WASI y entornos air-gapped.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Laddered Simple Attention Network: atención GQA con taps de convolución causal, MLP Monarch Hadamard en lugar de FFN, memoria de n-gramas (engram) leída por gather, multi-lane hyper-connections |
| Parámetros totales | 121M (modelo completo de 20 capas) |
| Parámetros activos | No aplica: no es un MoE. La mayor parte de los parámetros residen en el engram |
| Longitud de contexto | No disponible |
| Tipos de cuantización | CQ2 de Cactus Quants (2,125 bits por peso) en el archivo .cact distribuido; exportación a 4 bits mediante `needle build`; safetensors sin cuantizar para fine-tuning |
| Idiomas soportados | No disponible (la model card no enumera idiomas; todos los ejemplos y guías están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | .cact (Cactus Quants) para despliegue y safetensors para el checkpoint base |
| Profundidades desplegables | Subredes de 2 a 20 capas, cada una como modelo autónomo |
| Tamaño del archivo | 8-29 MB según profundidad; repositorio de 0,3 GB |
| Motor de inferencia | Un motor por plataforma de menos de 1 MB, cargado junto al .cact |
| Librería | cactus-needle (`pip install cactus-needle`) |
| Salida por turno | Un objeto JSON con `function_calls`, `reasoning` y `confidence` |

## Arquitectura y entrenamiento

Needle 3 sustituye la FFN por un MLP Monarch Hadamard y utiliza atención GQA con taps de convolución causal, memoria de n-gramas tipo engram leída mediante gather y multi-lane hyper-connections. El modelo está entrenado de forma que cada profundidad de 2 a 20 capas sea desplegable, lo que permite exportar subredes progresivamente menores sin reentrenar. La decodificación está restringida por una gramática a nivel de byte compilada a partir de los esquemas del usuario, de modo que la salida siempre parsea. Cada respuesta incorpora una puntuación de confianza calibrada procedente de una cabeza aprendida.

El número de tokens de entrenamiento, la composición del dataset y el uso de RLHF o DPO no se detallan en la información disponible. Sí se documenta que los pesos se comprimen a 2 bits (CQ2) con Cactus Quants y que el post-entrenamiento y la cuantización a 2 bits se ejecutan en la Cactus Platform, enriquecidos con datasets propietarios. Para personalización, el paquete Python aplica LoRA sobre la base congelada a las 20 capas completas; después, `needle build [--layers N]` fusiona el adaptador, corta cualquier subred de 2 a 20 capas y exporta un .cact de 4 bits que funciona sobre el mismo motor.

## Capacidades

- Tool calling y function calling: dada la lista de funciones expuestas por la aplicación, selecciona las correctas y rellena todos los argumentos a partir de lo dicho por el usuario; dos peticiones producen dos llamadas en orden y una petición no cubierta devuelve una lista vacía en lugar de una invención.
- Extracción estructurada: declarado un esquema, devuelve campos tipados (facturas, reservas, notificaciones, formularios) con garantía de parseo por gramática.
- Clasificación por generalización de la extracción, incluyendo el uso de enums.
- Embeddings de texto mediante `needle_embed`, que permiten búsqueda, emparejamiento y enrutado locales.
- Puntuación de confianza calibrada por respuesta, apta para enrutar entre actuar, confirmar o rechazar.
- Salida uniforme por turno con `function_calls`, `reasoning` y `confidence`.
- Despliegue on-device en móvil, wearable, robot, domótica, automoción y microcontroladores, además de navegador (WebAssembly) y WASI.
- Adaptación por producto: fine-tuning con LoRA y exportación de subredes de 2 a 20 capas.
- No documentado en la información disponible: generación de texto libre de propósito general, razonamiento matemático, generación de código, visión, audio y capacidades multilingües.

## Casos de uso

- Asistentes de voz en móvil y wearables: el modelo recibe las funciones expuestas por la app y devuelve la llamada con los argumentos rellenos, todo en local y con archivos de decenas de MB, sin depender de la nube ni de conectividad.
- Extracción documental en el dispositivo: facturas, reservas y formularios se convierten a JSON tipado, con la gramática de bytes garantizando que la salida parsea antes de tocar cualquier backend.
- Automatización del hogar: una petición en lenguaje natural ("baja la persiana") se traduce en la llamada a la herramienta correspondiente, ejecutable en dispositivos con recursos muy limitados gracias a las subredes de 2 a 4 capas.
- Enrutado y búsqueda local con embeddings: la aplicación indexa contenido con `needle_embed` y resuelve búsqueda semántica, emparejamiento o enrutado de peticiones sin salir del dispositivo, útil en escenarios de privacidad estricta.
- Agentes embebidos en automoción: las llamadas a funciones del vehículo se resuelven on-device en despliegues air-gapped donde no hay red disponible.
- Robótica y microcontroladores: una subred fina, ajustada con LoRA a las herramientas de un producto concreto, se despliega en hardware muy por debajo del necesario para el modelo completo.
- Atención al cliente en kioscos sin red: la puntuación de confianza permite decidir entre ejecutar la acción, pedir confirmación o rechazar la petición, reduciendo ejecuciones erróneas.
- Procesado de notificaciones y formularios en el propio terminal, con la ventaja de no enviar datos personales a servicios externos.
- Personalización por cliente: un mismo motor sirve para distintas profundidades, de modo que el mismo pipeline de fine-tuning genera versiones adaptadas a cada dispositivo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que la evaluación de tool calling es exact-match accuracy sobre las particiones de test completas y que la de extracción es micro-F1 de campo sobre las particiones completas, y afirma comparar contra baselines en seis benchmarks, pero las cifras se presentan únicamente en gráficos SVG (`assets/benchmarks.svg`) y en la página de release, sin valores textuales.

| Afirmación recogida en la model card | Valor |
|---|---|
| Tool calling (exact-match, test completo) | No disponible (solo en gráfico) |
| Extracción (micro-F1 de campo, test completo) | No disponible (solo en gráfico) |
| Comparativa frente a seis benchmarks | No disponible (solo en gráfico) |
| Mejora de subredes tras fine-tuning en DroidCall | 18 a 36 puntos, según los autores |
| Subred de 4 capas o más tras fine-tuning | Supera a DeepSeek V4 Flash, según los autores, a partir de 29M de parámetros |

## Requisitos de hardware

- No requiere GPU: es un modelo diseñado para CPU de móvil, wearable, robot, dispositivo de domótica, unidad de automoción y microcontrolador.
- Huella de pesos: el archivo desplegable ocupa entre 8 y 29 MB según la profundidad de la subred. Como estimación aritmética a partir de los datos declarados, los 121M de parámetros del modelo completo a 2,125 bits por peso ocuparían aproximadamente 32 MB.
- Memoria adicional del motor: menos de 1 MB por plataforma.
- Memoria de trabajo para la caché de atención: no disponible, al no documentarse la longitud de contexto.
- Cabe en cualquier GPU de consumo, incluidas las integradas y las presentes en SoC móviles, pero el caso de uso previsto no es la GPU.
- Opciones de despliegue: paquete Python `cactus-needle`, motores por carpeta de plataforma con CLI y API en C, navegador mediante WebAssembly y WASI, además de instalación air-gapped.
- Otros runners: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el formato .cact está ligado al motor de Cactus, aunque la model card publica una guía de portabilidad con un oráculo de test para escribir un runtime propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Needle 3 (20 capas) | 121M | No disponible | Apache 2.0 | HuggingFace (.cact y safetensors), motores por plataforma | Tool calling móvil por encima de modelos 10× mayores y extracción al nivel de modelos 2-3× mayores, según los autores |
| Needle 3 (subred fina ajustada en DroidCall) | 29M (según la model card) | No disponible | Apache 2.0 | Exportable con `needle build --layers N` | Supera a DeepSeek V4 Flash, según los autores |
| DeepSeek V4 Flash | No disponible | No disponible | No disponible | No disponible | Usado como baseline en la model card; sin cifras textuales |
| Otras alternativas on-device de tool calling | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para comparar de forma cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Los propios autores declaran renunciar a capacidad de chat general: el modelo está optimizado para tool calling, extracción y embeddings, no para conversación abierta ni generación de texto libre.
- La model card indica que 121M de parámetros rinden "la aritmética de uno de 50M", lo que implica una capacidad de razonamiento general inferior a la que sugiere el recuento de parámetros.
- Riesgo de alucinación mitigado, no eliminado: las peticiones fuera de las herramientas disponibles devuelven lista vacía y la gramática garantiza el parseo, pero la selección de herramienta y el relleno de argumentos siguen dependiendo del modelo y de la confianza calibrada.
- Longitud de contexto no documentada: es un dato crítico para planificar conversaciones multi-turno y para estimar la memoria de la caché de atención.
- Idiomas no documentados: no se puede asumir soporte multilingüe ni un comportamiento correcto fuera del inglés sin validación previa.
- El repositorio tiene 0 descargas y 0 likes, y el autor de la subida no coincide con el desarrollador citado en la model card; conviene verificar la procedencia e integridad de los pesos antes de usarlos en producción.
- Los metadatos del repositorio indican una fecha de creación de 2026-09-20, incongruente con el estado del propio repositorio; conviene comprobar la versión real del modelo.
- Licencia Apache 2.0, que permite uso comercial, pero la model card menciona datasets propietarios de Cactus empleados en el post-entrenamiento y la cuantización a 2 bits, ejecutados en su plataforma; no se especifican condiciones adicionales sobre los pesos derivados.
- Dependencia del ecosistema Cactus: el formato .cact no es un formato estándar y su explotación fuera del motor oficial requiere escribir un runtime propio siguiendo la guía de portabilidad.
- Las afirmaciones de rendimiento (superar a modelos 10× mayores, batir a DeepSeek V4 Flash desde 29M de parámetros) proceden del autor y no están respaldadas por cifras verificables en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rAVEUK/needle3
- Página de release, arquitectura y gráfico de frontera: https://cactuscompute.com/needle
- Código fuente y paquete Python: https://github.com/cactus-compute/needle
- Plataforma de Cactus (post-entrenamiento y cuantización): https://cactuscompute.com/dashboard
- Guía de diseño de herramientas: https://cactuscompute.com/blog/designing-tools-for-needle
- Guía sobre la puntuación de confianza: https://cactuscompute.com/blog/needle-confidence
- Guía de extracción estructurada a JSON: https://cactuscompute.com/blog/structured-extraction-with-needle
- Guía de fine-tuning: https://cactuscompute.com/blog/finetuning-needle
- Documentación de la API Python: https://cactuscompute.com/blog/needle-python-docs
- Dispositivos soportados: https://cactuscompute.com/blog/needle-supported-devices
- Formato .cact y Cactus Quants: https://cactuscompute.com/blog/cact-format
- Notas de portabilidad a un runtime propio: https://cactuscompute.com/blog/porting-needle

Los resultados de la búsqueda web proporcionada no contienen enlaces relevantes al modelo; todas las entradas corresponden a páginas de Epic Games y no guardan relación con Needle 3.
