# Peter-A-P/legible-2b-deepform-unseen-s0-v1120-s0-8a92c76b72

## Resumen

Legible 2B DeepForm es un adaptador QLoRA sobre `google/gemma-4-E2B` especializado en una única tarea: leer las imágenes de las páginas de un formulario de compra de publicidad (ad-buy form) de una cadena de televisión estadounidense y devolver sus campos como un objeto JSON. Lo desarrolla el usuario de HuggingFace Peter-A-P dentro del proyecto "Forms That Read Themselves" (paquete `legible`), que compara modelos de visión de frontera, modelos pequeños ajustados y pipelines OCR sobre formularios escaneados con respuesta conocida. El identificador del run es `2b-deepform-unseen-s0-v1120-s0-8a92c76b72`.

El problema que aborda es el de la extracción estructurada de documentos visualmente ricos: en lugar de un OCR seguido de reglas o un modelo grande por API, se ajusta un modelo visión-lenguaje pequeño para emitir directamente el esquema JSON del formulario. El adaptador se entrenó exclusivamente con la instrucción `legible.prompt` versión 1, que describe cada campo y proporciona el JSON Schema, y solo se evalúa con esa misma instrucción.

Es relevante por su enfoque metodológico: el autor publica resultados medidos sobre plantillas nunca vistas en entrenamiento, con intervalos de confianza bootstrap y coste por cada 1.000 páginas, y genera la model card automáticamente a partir de los registros del run. El adaptador ocupa 0,4 GB y se distribuye con licencia Apache 2.0, la misma del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre el modelo visión-lenguaje `google/gemma-4-E2B`; arquitectura interna del base no detallada en la información disponible |
| Parametros totales | No disponible (el adaptador pesa 0,4 GB; el nombre del run indica escala 2B) |
| Parametros activos | No disponible |
| Longitud de contexto | Límite de secuencia en entrenamiento: 12.288 tokens; contexto máximo del modelo base no disponible |
| Tipos de cuantizacion | Entrenamiento en NF4 4-bit con doble cuantización y cómputo en bf16; torres de visión y audio, proyector de visión y capa de salida en precisión completa. Cuantizaciones de inferencia publicadas: no disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, no de un modelo completo. Se aplica sobre `google/gemma-4-E2B` (revisión `d29ff6b45f081a49ee2733a859c9c9c2d95d1a6f`) con plantilla de chat de `google/gemma-4-E2B-it` (revisión `3e22461f65e89153144f8adb70e3b8c2cc9845a7`). El base es un modelo visión-lenguaje con torres de visión y audio y un proyector multimodal; el adaptador se inserta en las proyecciones de atención y MLP del modelo de lenguaje y en el proyector de visión, nunca en las torres. La configuración LoRA es rango 64, alpha 128 y dropout 0,05.

El ajuste sigue la receta QLoRA del proyecto: base cuantizado en NF4 4-bit con doble cuantización y cómputo bf16, manteniendo en precisión completa las torres, el proyector y la capa de salida. Cada ejemplo es un turno de usuario con las imágenes de las páginas en orden seguido de la instrucción, y un turno de asistente con el JSON de la verdad de referencia; la pérdida se calcula solo sobre los tokens de la respuesta. Hiperparámetros: learning rate 1e-4, schedule coseno, warmup 0,03, 1 época, 1 documento por paso con 8 pasos de acumulación, semilla 0 y 1.120 tokens visuales por página. El conjunto de entrenamiento es `deepform-unseen-s0`, con 200 documentos y 476 páginas, lo que da 25 pasos de optimizador. El registro de pérdida y tiempos está en `run.json`, incluido en el repositorio del adaptador.

Los datos proceden del benchmark VRDU Ad-buy Forms (DeepForm), publicado por Google Research: las anotaciones están bajo CC BY 4.0 y las páginas son registros públicos estadounidenses (órdenes de publicidad política de los ficheros públicos de la FCC). El autor justifica la publicación del adaptador bajo Apache 2.0 argumentando que ni la licencia de las anotaciones ni la naturaleza de registro público de las páginas impiden un modelo derivado.

## Capacidades

- Extracción de campos estructurados a partir de imágenes de páginas de formularios de compra de publicidad, con salida en un único objeto JSON por documento.
- Esquema de salida fijo con diez campos de nivel superior: `advertiser`, `agency`, `contract_num`, `flight_from`, `flight_to`, `gross_amount`, `product`, `property`, `tv_address` y `line_item`.
- Campo anidado de tipo lista, `line_item`, con subcampos `channel`, `program_desc`, `program_start_date`, `program_end_date` y `sub_amount` por cada fila programada del pedido.
- Manejo de documentos multipágina: las páginas se introducen en orden y el modelo emite un solo JSON para el documento completo.
- Salida compacta y consistente (valores como cadena o `null`, sin espacios), entrenada para minimizar variación de formato.
- Comprensión de documento visual: no requiere un paso OCR separado en el pipeline, ya que consume directamente las imágenes de página.
- Interpretación de la instrucción `legible.prompt` v1 y del JSON Schema que se le proporciona en el turno de usuario.
- Capacidades del modelo base (tool calling, agentes, audio, etc.): no evaluadas ni documentadas para este adaptador; no disponible.

## Casos de uso

- Digitalización de archivos de la FCC: procesar en lote los ficheros públicos de una cadena de televisión y convertir cada orden de publicidad política en un registro JSON consultable, sustituyendo la revisión manual de PDF escaneados.
- Auditoría de gasto político en emisiones: extraer `gross_amount`, `advertiser` y `flight_from`/`flight_to` de forma sistemática para agregar el gasto por anunciante y periodo, con la ventaja de que el coste medido es de 0,19 USD por 1.000 páginas.
- Enriquecimiento de un sistema de gestión de contratos: el JSON de salida encaja directamente en un esquema relacional (documento más filas de `line_item`), de modo que el adaptador actúa como capa de ingesta sin post-procesado específico.
- Verificación de cumplimiento de parrilla: comprobar que las fechas y programas declarados en cada `line_item` son coherentes con la programación real de la emisora, usando el modelo como extractor previo a las reglas de validación.
- Procesamiento de invoices y contratos con estructura similar: el autor indica que la tarea cubre órdenes de publicidad, facturas y contratos de los ficheros públicos, por lo que sirve como extractor para esos tipos documentales dentro del mismo dominio.
- Prueba de concepto de extracción con modelos pequeños en lugar de API de frontera: sirve para comparar coste y precisión (55,3% de campos correctos) frente a modelos propietarios antes de decidir la arquitectura de un pipeline de documentos.
- Generación de conjuntos de datos etiquetados: usar las lecturas del adaptador como preetiquetado para revisión humana en volúmenes grandes de formularios, aceptando el 8,0% de campos inventados como ruido a corregir.

## Benchmarks y rendimiento

Evaluación sobre los 159 documentos de test del split `DeepForm-unk_template-train_200-test_159-valid_100-SD_0` de VRDU, con plantillas nunca vistas en entrenamiento, una sola lectura, nivel 0 y temperatura 0, sin restricciones de decodificación. La precisión por campo usa los matchers de VRDU con un único grader para todos los lectores; los intervalos son bootstrap al 95% sobre documentos. Coste calculado con una RTX 3090 a 0,50 USD/hora en RunPod (2026-10-18) sobre el tiempo medido de lectura.

| Lector | Campos correctos (IC 95%) | Todos los campos correctos | Campos inventados | Respuestas no parseables | Coste por 1.000 páginas | Documentos |
|---|---|---|---|---|---|---|
| Gemma 4 E2B ajustado (este adaptador) | 55,3% (48,5–62,0) | 1,3% (0,0–3,1) | 8,0% (6,0–10,3) | 11,9% (6,9–17,0) | 0,19 USD (intervalo truncado en la información disponible) | 159 |

La model card incluye en la misma tabla filas para modelos de visión de frontera y pipelines OCR comparados en el proyecto, pero esa parte del contenido no está disponible en la información proporcionada. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de propósito general, ya que el adaptador es específico de una tarea.

## Requisitos de hardware

- El adaptador pesa 0,4 GB, pero requiere cargar el modelo base `google/gemma-4-E2B` completo, incluidas las torres de visión y audio.
- VRAM estimada: no disponible de forma oficial. Como referencia, el propio autor midió la inferencia en una RTX 3090 (24 GB) con el base cuantizado en NF4 4-bit; una estimación prudente para ese配置 es de 4 a 8 GB de pesos más el coste de activaciones de hasta 12.288 tokens con 1.120 tokens visuales por página. Cifra no confirmada en la documentación.
- GPU recomendadas: RTX 3090 (configuración medida), y por capacidad de VRAM, A100, H100, L40S o RTX 4090. No hay datos de latencia ni throughput por GPU.
- Cabe en GPU de consumo: sí, al menos en RTX 3090 con cuantización de 4 bits; el comportamiento en tarjetas de 8–16 GB no está documentado.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la librería `peft`/Transformers sobre el base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la naturaleza multimodal del base condiciona qué servidores son compatibles.
- Latencia y throughput: solo se conoce el coste derivado del tiempo medido (0,19 USD por 1.000 páginas a 0,50 USD/hora), lo que implica del orden de décimas de segundo por página; el dato exacto de wall time no está disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en DeepForm | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Legible 2B DeepForm (este adaptador) | Base de escala 2B según nomenclatura; adaptador de 0,4 GB | 12.288 tokens de límite de secuencia en entrenamiento | 55,3% de campos correctos; 1,3% de documentos perfectos | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| `google/gemma-4-E2B` (base sin ajustar) | No disponible | No disponible | No disponible en la información proporcionada | Apache 2.0 (según el adaptador) | HuggingFace |
| Pipelines OCR comparados en el proyecto | No disponible | No disponible | Filas presentes en la tabla original, no disponibles aquí | No disponible | No disponible |
| Modelos de visión de frontera comparados en el proyecto | No disponible | No disponible | Filas presentes en la tabla original, no disponibles aquí | No disponible | No disponible |

La información proporcionada solo permite comparar cualitativamente: el adaptador es la alternativa de bajo coste (0,19 USD/1.000 páginas) frente a modelos de frontera por API y frente a pipelines OCR, pero sin los números de esos competidores no es posible establecer la comparación cuantitativa.

## Limitaciones y advertencias

- Tarea única: el adaptador solo está entrenado para la instrucción `legible.prompt` v1 sobre formularios ad-buy de DeepForm; fuera de ese prompt o de ese dominio no hay garantía de comportamiento.
- Solo inglés: el modelo card declara `en` como único idioma; no se ha evaluado en otros idiomas.
- Precisión limitada: 55,3% de campos correctos y únicamente 1,3% de documentos con todos los campos correctos en plantillas no vistas. No es apto para extracción sin revisión humana.
- Alucinación medida: 8,0% de campos inventados en la evaluación, un riesgo directo para datos financieros como `gross_amount` o `contract_num`.
- Robustez de formato: 11,9% de respuestas no parseables en decodificación libre; en producción conviene añadir decodificación restringida por JSON Schema, no aplicada en la evaluación.
- Generalización a plantillas: la evaluación es explícitamente sobre plantillas no vistas, lo que sugiere sensibilidad al diseño del formulario; no hay datos de rendimiento en plantillas vistas.
- Licencia del modelo Apache 2.0, pero los datos de entrenamiento tienen su propia licencia (CC BY 4.0 en las anotaciones de VRDU) y las páginas son registros públicos de la FCC; conviene revisar obligaciones de atribución a Google Research (Wang et al., KDD 2023) antes de un uso comercial.
- Procedencia automática: la model card se genera desde los registros del run y el autor indica que ningún número está escrito a mano; los datos de pérdida y tiempos están en `run.json`, que no se ha podido consultar.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el 2026-10-25; no hay evidencia de uso en producción ni mantenimiento.
- Naturaleza de adaptador: sin el modelo base en la revisión exacta indicada, los pesos no son utilizables; los cambios en el base pueden romper la compatibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Peter-A-P/legible-2b-deepform-unseen-s0-v1120-s0-8a92c76b72
- Modelo base `google/gemma-4-E2B`: https://huggingface.co/google/gemma-4-E2B
- Modelo de plantilla de chat `google/gemma-4-E2B-it`: https://huggingface.co/google/gemma-4-E2B-it
- Dataset VRDU (código y benchmark): https://github.com/google-research-datasets/vrdu
- Entrada de blog de Google Research, "Advances in document understanding" (2023-08-09): https://research.google/blog/advances-in-document-understanding/
- Licencia CC BY 4.0 referenciada: https://creativecommons.org/licenses/by/4.0/
- Paper del benchmark: Wang et al., "VRDU: A Benchmark for Visually-rich Document Understanding", KDD 2023 (sin URL directa en la información proporcionada).
- Repositorio del paquete `legible`: no disponible en la información proporcionada.
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos trataban sobre el nombre propio "Peter" y no guardan relación con la ficha.
