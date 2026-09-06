# psikosen/canopy-258m-r3-v3

## Resumen

Canopy-258M-R3 v3 es un modelo de lenguaje de tipo Recurrent Mixture-of-Experts (MoE) desarrollado por psikosen, optimizado para ejecución en el borde (edge computing), síntesis de herramientas y automatización de navegador web. Su arquitectura recurrente con enrutamiento Top-2 de 8 expertos permite activar aproximadamente 112 millones de parámetros por token, lo que reduce el coste computacional manteniendo capacidades de generación de texto, código y matemáticas.

La versión v3 incorpora mejoras significativas en la interacción con navegadores, como el Hybrid Input Protocol y la Event-Driven DOM Synchronization, que logran una aceleración global de 2,12x en una batería de 7 escenarios reales de navegación y hasta 5,50x en formularios multi-paso. El modelo tiene una ventana de contexto de 2.048 tokens y está licenciado bajo Apache 2.0, lo que facilita su uso comercial sin coste de licencia.

A pesar de su tamaño reducido, el modelo está diseñado para tareas de agente web, con soporte para scraping estructurado, registro visual de acciones y navegación en páginas dinámicas. Su carga requiere código personalizado (trust_remote_code=True), lo que debe tenerse en cuenta en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrent Mixture-of-Experts (MoE), 18 capas efectivas (3 Prelude + 6 recurrentes visitadas 2x + 3 Coda), enrutamiento Top-2 de 8 expertos |
| Parametros totales | 296.304.390 (según safetensors); 258.555.654 según la model card (con embeddings atados) |
| Parametros activos | ~112.000.000 (activos por token) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Canopy-258M-R3 v3 es un transformer recurrente con capas MoE. El modelo se estructura en 18 capas efectivas: 3 capas densas preliminares, 6 capas recurrentes que se visitan dos veces (lo que da 12 pasos recurrentes) y 3 capas densas finales (coda). En las capas MoE, se seleccionan los 2 mejores expertos de un total de 8 por token. Además, integra un "Tokenwise Thought Bus" de 192 canales, que persiste un estado de razonamiento auxiliar a través de las pasadas recurrentes.

No se han proporcionado datos sobre el conjunto de entrenamiento (número de tokens, composición del dataset, si hubo RLHF/DPO). La tokenización se realiza con un tokenizer BPE de byte-level llamado Cosmo-2, con un vocabulario de 49.152 tokens y posiciones RoPE.

Las innovaciones técnicas de v3 se centran en la interacción con navegadores: el Hybrid Input Protocol distingue campos de formulario estáticos de flujos reactivos (autocompletados, comboboxes), usando escritura atómica en los primeros y cadencia de tecleo gaussiana en los segundos. También se introducen movimientos de ratón con cinemática Bézier cúbica para simular telemetría humana y sincronización de scroll mediante eventos, además de un motor de scraping estructurado y registro visual de pasos con capturas de pantalla.

## Capacidades

- Generación de texto, código y matemáticas, según los tags publicados en HuggingFace. El ejemplo de la model card muestra la generación de una función Python para extraer direcciones de correo electrónico de una página web.
- Automatización de navegador web y uso como agente web (browser-use, web-agent), con soporte para formularios, modales, tablas paginadas, radios, checkboxes, autocompletados y scroll infinito.
- Scraping estructurado mediante las funciones `controller.scrape_table()`, `controller.scrape_element()` y `controller.scrape_page()`, que permiten extraer tablas 2D, listas y atributos individuales.
- Registro visual de pasos con capturas de pantalla PNG de alta resolución, bounding boxes verdes, retículas rojas y badges de paso en la esquina superior izquierda.
- Eficiencia computacional: al ser un MoE con solo 112 millones de parámetros activos por token, resulta adecuado para despliegues en hardware limitado o en el borde.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Automatización de formularios web multi-paso: el Hybrid Input Protocol rellena campos estáticos (contraseñas, correos, registro) en menos de 40 ms, mientras que en elementos reactivos (autocompletados, comboboxes) mantiene una cadencia de tecleo simulada para que los manejadores AJAX funcionen. Los benchmarks muestran una reducción del 82% en la latencia del escenario "Multi-Step Form Wizard".
- Agentes de scraping estructurado: el motor de extracción permite obtener tablas, listas y atributos de elementos de forma programática. Por ejemplo, un agente podría extraer una tabla de precios de una página de comercio electrónico usando `controller.scrape_table()` y guardarla en un dataframe para su posterior análisis.
- Pruebas E2E automatizadas de aplicaciones web: el modelo es capaz de ejecutar acciones complejas como seleccionar opciones en dropdowns, abrir modales, navegar por tablas paginadas y alternar radios o checkboxes. La batería de 7 escenarios con 20 acciones se completa en 3.938,1 ms, lo que lo hace apto para vérificaciones rápidas en pipelines de CI/CD.
- Asistente de programación para extracción de datos: como se muestra en el ejemplo de carga, el modelo genera código Python para tareas como extraer correos electrónicos de una página. Esto es útil en la creación de scripts de scraping o de procesamiento de documentos.
- Despliegue en dispositivos edge: su tamaño de ~296M de parámetros en total y ~112M activos, junto con el uso de bfloat16, permite ejecutarlo en equipos con recursos limitados o en el borde de la red, por ejemplo en un mini-PC o en dispositivos de automatización industrial.
- Agentes autónomos en webs dinámicas: el soporte de Event-Driven DOM Synchronization permite interactuar correctamente con páginas que cargan contenido de forma dinámica mediante scroll infinito o `IntersectionObserver`, sin perder eventos ni estancarse en la carga de nuevos elementos.

## Benchmarks y rendimiento

Se han publicado benchmarks de rendimiento de navegación comparando v2 con v3, así como de ejecución de acciones encadenadas. No se han presentado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Escenario (batería de 7 escenarios) | v2 Latencia | v3 Latencia | Reducción | Speedup |
|---|---|---|---|---|
| Dropdowns y selección múltiple | 434,6 ms | 375,0 ms | -59,6 ms | 1,16x |
| Modales con entrada de email y guardado | 1.893,8 ms | 497,1 ms | -1.396,7 ms | 3,81x |
| Tablas de datos paginadas | 499,6 ms | 433,1 ms | -66,5 ms | 1,15x |
| Hidratación de scroll infinito | 1.484,0 ms | 984,1 ms | -499,9 ms | 1,51x |
| Radios y checkboxes | 935,7 ms | 749,9 ms | -185,8 ms | 1,25x |
| Autocompletado y typeahead | 715,6 ms | 465,6 ms | -250,0 ms | 1,54x |
| Formulario multi-paso | 2.381,4 ms | 433,3 ms | -1.948,1 ms | 5,50x |
| Total acumulado (7 escenarios / 20 acciones) | 8.344,6 ms | 3.938,1 ms | -4.406,5 ms | 2,12x |

| Acciones encadenadas | Total de acciones | Latencia de ejecución | Resultado |
|---|---|---|---|
| Cadena 1: carrito y checkout multi-etapa en e-commerce | 12 acciones en 3 etapas | 1.774,4 ms | PASS |
| Cadena 2: filtrado masivo y despacho de modales ETL | 7 acciones | 1.313,8 ms | PASS |
| Cadena 3: grounding espacial y extracción dinámica | 4 acciones | 453,0 ms | PASS |
| Navegación web pública en vivo (Hacker News) | Red real | 577,7 ms | PASS |
| Aceleración de chunking especulativo de acciones | Campo de formulario múltiple | 224 ms vs 336 ms | 1,50x más rápido |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 0,6 GB, por lo que en bfloat16 la inferencia requeriría aproximadamente 0,6 GB de VRAM, y en FP32 alrededor de 1,2 GB (estimación basada en el tamaño de los pesos).
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, es viable en GPUs de consumo como RTX 3060 o inferiores, e incluso en CPU con suficiente memoria.
- Sí cabe en GPU de consumo: sí. El modelo es pequeño y debería caber con margen en la mayoría de tarjetas con al menos 2 GB de VRAM.
- Opciones de despliegue: HuggingFace Transformers con `trust_remote_code=True`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI. También se menciona la librería `miniswardbower` para la ejecución del agente de navegador.
- Latencia y throughput estimados: no se han proporcionado datos de latencia de generación de tokens. Los benchmarks publicados hacen referencia a tiempos de ejecución de acciones de navegador, no a métricas de inferencia del modelo.

## Comparativa con modelos similares

La única alternativa comparable en la información disponible es la versión anterior del mismo modelo, Canopy-258M-R3 (sin v3), que aparece en HuggingFace como modelo de 0,3B. No se dispone de información sobre otros modelos de la misma categoría para comparar.

| Modelo | Parámetros | Contexto | Latencia acumulada (7 escenarios) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Canopy-258M-R3 v3 | 296,3M (safetensors) | 2.048 | 3.938,1 ms | Apache 2.0 | HuggingFace |
| Canopy-258M-R3 | ~258M | no disponible | 8.344,6 ms | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Sesgos: no se han reportado sesgos específicos en la información disponible.
- Riesgo de alucinación: al ser un modelo de ~258-296M de parámetros, es probable que presente alucinaciones en tareas de generación libre. Debe validarse la salida en entornos de producción.
- Limitaciones de contexto e idioma: la ventana de contexto es de solo 2.048 tokens, lo que limita documentos largos o conversaciones extensas. El modelo solo soporta inglés.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin coste, pero requiere incluir el aviso de licencia y copyright, y conservar las atribuciones.
- Riesgo de seguridad: el modelo requiere `trust_remote_code=True` para cargarse, lo que ejecuta código personalizado del autor. Debe usarse con precaución, especialmente en entornos con datos sensibles.
- Discrepancia en el número de parámetros: el número de parámetros totales difiere entre HuggingFace (296.304.390) y la model card (258.555.654), lo que sugiere diferencias en el conteo de embeddings atados o en la versión de los pesos.

## Enlaces

- HuggingFace: https://huggingface.co/psikosen/canopy-258m-r3-v3
- Versión anterior: https://huggingface.co/psikosen/canopy-258m-r3
