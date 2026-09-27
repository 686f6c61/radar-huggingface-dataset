# Canfield/Qwen3.5-9B-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una copia byte a byte de un único archivo GGUF cuantizado en Q4_K_M del modelo Qwen/Qwen3.5-9B, desarrollado por el equipo Qwen de Alibaba Cloud. El publicador, Canfield, no ha modificado los pesos: se limita a redistribuir un archivo concreto de la cuantización realizada por lmstudio-community, con el objetivo de que sus aplicaciones locales puedan descargar un fichero fijo y verificado por hash. El atractivo práctico es la reproducibilidad: tamaño exacto, SHA-256 y revisión de origen documentados, lo que permite despliegues deterministas en Ollama o llama.cpp.

El modelo base tiene 8.953.803.264 parámetros (unos 8,95 mil millones) y en su repositorio original incluye un proyector visual (`mmproj-Qwen3.5-9B-BF16.gguf`), lo que indica que la familia Qwen3.5-9B contempla entrada multimodal. Sin embargo, esta copia concreta es solo de texto: no incorpora el proyector, por lo que no procesa imágenes.

La particularidad funcional más relevante de esta distribución es que desactiva el modo de razonamiento. Qwen3.5 piensa por defecto, pero la plantilla de chat que acompaña al GGUF cierra el bloque de pensamiento, de modo que el modelo responde directamente. Con Ollama se anuncia únicamente la capacidad `completion` y se rechaza `think: true`; en llama.cpp hay que usar `--jinja` con `chat_template_kwargs: {"enable_thinking": false}`. El contexto configurado por defecto en la plantilla es de 32.768 tokens con decodificación greedy.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada (se distribuye solo el archivo GGUF cuantizado; el modelo base es Qwen3.5-9B, de la familia Qwen3.5) |
| Parámetros totales | 8.953.803.264 (~8,95 mil millones) |
| Parámetros activos | No aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 32.768 tokens, según los `params` de la plantilla incluida para Ollama (no se confirma si es el máximo del modelo base) |
| Tipos de cuantización | Q4_K_M (único archivo en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (copyright 2026 Alibaba Cloud / Qwen) |
| Formato de pesos | GGUF, archivo único `Qwen3.5-9B-Q4_K_M.gguf` de 5.627.044.256 bytes; sin proyector multimodal (`mmproj`) |
| SHA-256 del archivo | `cd76ec205963b3b33350093e6904d9de16c4e666fd104e1f632d25c7f15f2a13` |
| Repositorio de origen de la cuantización | lmstudio-community/Qwen3.5-9B-GGUF, revisión `1379f25c6b505a3fc737bd7818cb09389cf807c1` |
| Herramienta de cuantización | llama.cpp, release b8185 |
| Modelo original | Qwen/Qwen3.5-9B, revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` |
| Tamaño del repositorio | 5,6 GB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base ni su proceso de entrenamiento. El repositorio es explícitamente una redistribución: el archivo es idéntico byte a byte al publicado por lmstudio-community, que a su vez cuantizó Qwen/Qwen3.5-9B con llama.cpp b8185. Por tanto, no hay datos sobre número de tokens de entrenamiento, composición del corpus, uso de RLHF, DPO u otras fases de alineamiento, ni sobre innovaciones técnicas del modelo original.

Sí se conocen dos rasgos funcionales derivados de la model card. El primero es que Qwen3.5 opera con un modo de pensamiento activado por defecto en su formato de chat oficial; esta copia lo neutraliza mediante plantilla. El segundo es que la familia original es multimodal (existe un proyector `mmproj` en el repositorio de lmstudio-community), pero este GGUF es exclusivamente de texto porque el proyector no se incluye. Cualquier detalle adicional sobre capas, mecanismos de atención o estrategia de entrenamiento debe consultarse en la documentación del modelo original, no en este repositorio.

## Capacidades

- Generación de texto conversacional de propósito general, en modo `text-generation`.
- Respuesta directa sin cadena de pensamiento: la plantilla cierra el bloque de razonamiento, por lo que la salida llega sin deliberación intermedia visible. Esto reduce latencia y consumo de tokens, pero elimina el modo «thinking» que Qwen3.5 activa por defecto.
- Compatibilidad con endpoints: el repositorio está etiquetado como `endpoints_compatible`, pensado para su consumo desde servicios de inferencia.
- Integración con Ollama mediante `ollama pull hf.co/Canfield/Qwen3.5-9B-Q4_K_M-GGUF`, con plantilla de chat propia y parámetros predefinidos (32.768 tokens de contexto, temperatura 0 y parada en `<|im_end|>`).
- Integración con llama.cpp usando la plantilla del GGUF (`--jinja`) y `chat_template_kwargs: {"enable_thinking": false}`.
- Procesamiento de contexto largo: hasta 32.768 tokens según la configuración incluida.
- Capacidades multimodales: no disponibles en esta copia. El proyector visual no está incluido, por lo que el modelo solo lee texto.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada; además, el modo de pensamiento está desactivado en esta configuración.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistentes conversacionales locales y offline: al ser un GGUF de 5,24 GiB ejecutable con Ollama o llama.cpp, permite desplegar un chatbot en un portátil o estación de trabajo sin conexión ni envío de datos a terceros, algo crítico en entornos con requisitos de confidencialidad.
- Procesamiento de documentación extensa: la configuración por defecto admite 32.768 tokens de contexto, suficiente para resumir informes técnicos, contratos o actas de reuniones completas en una sola pasada sin trocear el documento.
- Sistemas RAG locales: combinado con una base vectorial embebida, el modelo puede redactar respuestas fundamentadas sobre corpus internos, manteniendo todo el pipeline en la misma máquina y evitando costes de API.
- Generación y revisión de código en flujos de desarrollo: puede usarse como asistente en el IDE o en scripts de pre-revisión de parches y generación de tests, siempre que no se requiera razonamiento encadenado explícito, ya que el modo de pensamiento está desactivado en esta distribución.
- Extracción de datos estructurados por lotes: tareas de conversión de texto libre a JSON, clasificación de tickets o etiquetado de documentos, donde la decodificación greedy preconfigurada (temperatura 0) aporta salidas estables y reproducibles.
- Redacción y edición de textos en aplicaciones de escritorio: integrado en herramientas tipo LM Studio o en un cliente propio, sirve para reescribir, resumir o adaptar tono en documentos, con la ventaja de una descarga verificable por SHA-256 para despliegues reproducibles.
- Empaquetado de aplicaciones con modelo embebido: el hash documentado y la ausencia de dependencias externas permiten fijar una versión concreta del modelo en una aplicación distribuida, garantizando que todos los usuarios ejecutan exactamente los mismos pesos.
- Aprendizaje y experimentación en local: útil como banco de pruebas para ajustar plantillas de chat, comparar cuantizaciones o medir latencia en hardware de consumo antes de escalar a un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio se limita a documentar el archivo, su hash, su procedencia y la configuración de plantilla; no incluye resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- Tamaño del archivo: 5.627.044.256 bytes (aproximadamente 5,24 GiB). Esa cifra es la referencia mínima de memoria para alojar los pesos.
- VRAM estimada (orientativa, calculada a partir del tamaño del archivo y del coste habitual de un runtime GGUF): en torno a 6-7 GiB para descargar por completo los pesos en GPU más el sobrecoste del contexto y del propio motor de inferencia. Con 32.768 tokens de contexto, la caché KV añade varios GiB adicionales, cuya magnitud exacta no puede calcularse porque se desconocen el número de capas y de cabezas KV del modelo base.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y superiores para offload total con contexto moderado; RTX 3090, RTX 4090, A100 o H100 si se quiere mantener la ventana completa de 32.768 tokens en memoria de vídeo sin recurrir a offload parcial.
- Cabe en GPU de consumo: sí. Un modelo de ~9B en Q4_K_M es un caso de uso típico de GPU de gama media con 8-12 GB de VRAM, siempre que se recorte el contexto o se reparta parte de las capas en CPU.
- Ejecución solo en CPU: viable, con requisito de RAM igual o superior a los ~5,3 GiB de los pesos más el espacio para la caché KV y el proceso. Es una opción razonable para equipos sin GPU dedicada, a costa de una velocidad notablemente menor.
- Opciones de despliegue: Ollama (soporte explícito, con plantilla y parámetros incluidos), llama.cpp (requiere `--jinja` y `enable_thinking: false`), LM Studio, KoboldCpp y otros frontales basados en GGUF. El despliegue con vLLM o TGI no está documentado para este archivo y depende del soporte de GGUF de cada motor, que suele ser limitado o experimental.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token en la información proporcionada, y cualquier cifra dependería del hardware, del contexto efectivo y del reparto entre GPU y CPU.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks ni de datos de rendimiento de modelos alternativos en la información proporcionada, por lo que la comparación se limita a aspectos de distribución y procedencia.

| Distribución | Parámetros | Formato y cuantización | Contexto por defecto | Licencia | Notas |
|---|---|---|---|---|---|
| Canfield/Qwen3.5-9B-Q4_K_M-GGUF (este repositorio) | 8,95 mil millones | GGUF Q4_K_M, archivo único de 5.627.044.256 bytes | 32.768 tokens con plantilla propia | Apache 2.0 | Copia byte a byte, sin proyector visual, pensamiento desactivado, hash publicado |
| lmstudio-community/Qwen3.5-9B-GGUF (origen) | 8,95 mil millones | GGUF, varias cuantizaciones; incluye `mmproj-Qwen3.5-9B-BF16.gguf` | No disponible | Apache 2.0 | Repositorio fuente de la cuantización, generada con llama.cpp b8185; incluye soporte de visión |
| Qwen/Qwen3.5-9B (modelo original) | 8,95 mil millones | Pesos originales sin cuantizar | No disponible | Apache 2.0 | Modelo base del equipo Qwen (Alibaba Cloud), revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` |

Comparación con otros modelos de tamaño equivalente: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no aporta ninguna mejora ni ajuste sobre el modelo original: es una redistribución de un archivo ajeno. Cualquier problema de calidad, sesgo o alucinación procede del modelo base Qwen3.5-9B y de la cuantización de lmstudio-community, no de Canfield.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales. Es un compromiso habitual y generalmente asumible, pero puede degradar tareas sensibles a matices finos, como razonamiento aritmético complejo o generación de código con requisitos estrictos de sintaxis.
- El modo de pensamiento está desactivado de forma deliberada en la plantilla incluida. Cualquier expectativa de comportamiento tipo cadena de razonamiento no se cumple con esta configuración; si se necesita, habría que usar otra plantilla o el modelo original.
- Este archivo no procesa imágenes, pese a que la familia Qwen3.5-9B dispone de proyector visual. Si se requiere entrada multimodal, hay que usar el repositorio de lmstudio-community o el modelo original.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala, sin que la información disponible permita cuantificarlo. No debe usarse sin verificación en dominios donde un error tenga consecuencias legales, médicas o financieras.
- Sesgos conocidos: no documentados en la información proporcionada. Se desconoce la composición del corpus de entrenamiento y, por tanto, no puede caracterizarse el sesgo del modelo.
- Idiomas soportados: no disponible. No hay lista oficial de lenguas en la model card de este repositorio, por lo que el rendimiento en castellano no está garantizado ni medido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia y el copyright (2026 Alibaba Cloud / Qwen). Aun así, conviene revisar los términos de los repositorios originales por si incorporan condiciones adicionales.
- El repositorio registra 0 descargas y 0 «me gusta» en el momento de la consulta, y fue creado en septiembre de 2026. Es un artefacto reciente y sin adopción verificable: no hay evidencia de uso en producción por terceros.
- Para producción conviene fijar la revisión exacta y verificar el SHA-256 tras la descarga (`cd76ec205963b3b33350093e6904d9de16c4e666fd104e1f632d25c7f15f2a13`); de lo contrario se pierde la principal ventaja de esta distribución.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Canfield/Qwen3.5-9B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de la cuantización original: https://huggingface.co/lmstudio-community/Qwen3.5-9B-GGUF
- Release de llama.cpp utilizada (b8185): https://github.com/ggml-org/llama.cpp/releases/tag/b8185
