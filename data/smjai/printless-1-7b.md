# smjai/printless-1.7b

## Resumen

Printless 1.7B (v2.1) es un adaptador LoRA desarrollado por SMJ AI sobre el modelo base Qwen/Qwen3-1.7B. Su función es convertir el texto y la disposición de un PDF en un documento estructurado en formato .printless v2.0, un formato JSON propietario de impresión sin papel utilizado por la plataforma Printless. El modelo identifica el tipo de documento (recibo, factura, ticket, tarjeta, contrato, etc.), extrae campos etiquetados, líneas de detalle, totales y bloques de contenido como encabezados, párrafos, tablas, listas, llamadas de atención, citas, líneas de firma e imágenes.

El adaptador se entrenó específicamente para la función "Start from a PDF" del portal de negocio de Printless, donde un usuario sube un recibo, factura, ticket o formulario existente y obtiene una plantilla editable. Según la model card, esa función aún no está activa en producción y Printless no sirve este modelo actualmente. El modelo tiene 1.700 millones de parámetros en su base, soporta inglés, árabe, japonés e indonesio (este último vía el dataset CORD), y se distribuye bajo licencia Apache 2.0.

La relevancia del modelo radica en su enfoque especializado: no es un modelo conversacional general, sino un conversor de documentos con salida JSON validable contra un esquema público. Con 6 descargas y 0 likes en el momento de la consulta, es un modelo de nicho orientado a un producto concreto, no a la comunidad general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (r=32, α=64, todas las proyecciones) sobre Qwen/Qwen3-1.7B (transformer decoder-only) |
| Parámetros totales | 1.700 millones (modelo base Qwen3-1.7B); el adaptador LoRA añade un conjunto reducido de pesos |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como cifra oficial; la model card indica que las entradas de más de 3.072 tokens no están cubiertas por el entrenamiento |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés, árabe, japonés, indonesio (recibos CORD) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se distribuye por separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 64 aplicado a todas las proyecciones del transformer Qwen3-1.7B, un modelo decoder-only de 1.700 millones de parámetros. El adaptador se entrena para una tarea de generación de texto estructurado: dado un prompt de chat que contiene el texto y la disposición del PDF en formato "layout text", el modelo produce un único documento JSON en formato .printless v2.0. El repositorio ocupa 0,3 GB, coherente con un adaptador LoRA más los ficheros de configuración.

Los datos de entrenamiento incluyen el dataset naver-clova-ix/cord-v2 (recibos) y ds4sd/DocLayNet (páginas de documentos), además de documentos sintéticos generados en dos renderizadores (inglés, árabe y japonés). La model card no detalla el número total de tokens de entrenamiento ni si hubo RLHF o DPO. Una innovación técnica destacable es el decodificador de puntuación: decodificación greedy que en cada paso selecciona el token más probable que mantenga la salida como JSON válido, y tras la generación recorta una cola repetitiva y cierra una respuesta que termina antes de tiempo (solo añade corchetes de cierre). Según el autor, este decodificador se aplicó a 2 de las 188 respuestas de test, y la decodificación greedy simple produce la misma respuesta mientras el token superior del modelo sea JSON válido en cada paso.

## Capacidades

- Conversión de PDF a JSON estructurado en formato .printless v2.0: tipos de impresión, campos etiquetados, líneas de detalle, totales y bloques de contenido.
- Identificación del tipo de documento: recibos, facturas (incluidas facturas ZATCA), tickets, tarjetas, contratos, tarjetas de embarque, tickets de aparcamiento, órdenes de trabajo, cupones, llaves, invitaciones y tickets de evento.
- Extracción de bloques de contenido: encabezados, párrafos, tablas, listas, llamadas de atención, citas, líneas de firma e imágenes.
- Salida validable contra un JSON Schema público (https://docs.printless.app/schemas/printless-v2.schema.json).
- Soporte multilingüe en inglés, árabe, japonés e indonesio (recibos).
- Manejo de fechas: escribe fechas simples (YYYY-MM-DD) cuando la página no imprime hora, y solo instantes UTC cuando la página muestra hora.
- No dispone de tool calling ni function calling documentados.
- No dispone de modo thinking, visión ni audio: trabaja exclusivamente sobre texto de capa de texto extraído del PDF.
- No incluye etapa de OCR: los PDF escaneados o con fuentes sin mapa Unicode deben rechazarse antes de llegar al modelo.

## Casos de uso

- Digitalización de facturas y recibos en un portal de negocio: el modelo convierte el texto de un PDF de factura o recibo en un JSON .printless v2.0 con campos etiquetados y líneas de detalle, adecuado para generar plantillas editables. Su block F1 de 0,92 en facturas y 0,96 en facturas ZATCA lo hace apto para este escenario.
- Extracción de datos de tickets de aparcamiento y tarjetas de embarque: con block F1 de 0,93 en ambos tipos según la model card, puede alimentar pipelines de archivo o conciliación donde se necesite estructura sin intervención manual completa.
- Procesamiento de órdenes de trabajo: con block F1 de 0,99, es adecuado para convertir partes de trabajo en registros estructurados que alimenten un sistema de gestión.
- Conversión de contratos a formato estructurado: con block F1 de 0,87, puede extraer cláusulas, firmas y metadatos de contratos en PDF de capa de texto para su revisión humana.
- Digitalización de cupones, llaves e invitaciones: con block F1 de 1,00 en estos tipos, puede generar plantillas editables a partir de documentos cortos y muy estructurados.
- Generación de borradores para revisión humana en flujos de impresión sin papel: el modelo produce un JSON validable contra esquema (98,7 % de salida válida en el test de 150 PDFs y 100 % en el test real de 38 PDFs), que un operador revisa antes de publicar la plantilla.
- Procesamiento multilingüe de documentos en árabe y japonés: con block F1 de 0,80 en árabe y 0,96 en japonés en el test de 150 PDFs, cubre flujos documentales en esos idiomas que los modelos generalistas suelen tratar peor.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el test held-out de 150 PDFs (100 sintéticos en dos renderizadores: inglés 50, árabe 25, japonés 25; 25 recibos CORD y 25 páginas DocLayNet), con etiquetas v2.1:

| Convertidor | Esquema válido | Exact match | Block F1 | Field accuracy | Text F1 |
|---|---|---|---|---|---|
| v2.0 (con front end y decodificador v2.1) | 0,987 | 0,327 | 0,757 | 0,873 | 0,894 |
| **v2.1 (este commit)** | **0,987** | **0,527** | **0,810** | **0,893** | **0,921** |

Resultados sobre el test real de 38 PDFs verificados a mano (26 documentos genéricos; 12 facturas, recibos, órdenes de trabajo y reservas; inglés 24, japonés 8, árabe 6), producidos con dos generadores de PDF no usados en entrenamiento:

| Convertidor | Esquema válido | Block F1 | Block F1 documentos genéricos | Field accuracy | Text F1 |
|---|---|---|---|---|---|
| v2.0 (con front end y decodificador v2.1) | 0,921 | 0,518 | 0,505 | 0,568 | 0,792 |
| **v2.1** | **1,000** | **0,722** | **0,777** | **0,772** | **0,879** |

Desglose por tipo en el test de 150 PDFs (block F1, v2.1): facturas 0,92; facturas ZATCA 0,96; recibos 0,84; contratos 0,87; tarjetas 0,90; tarjetas de embarque 0,93; aparcamiento 0,93; órdenes de trabajo 0,99; cupones, llaves, invitaciones y tickets de evento 1,00; documentos genéricos 0,53 (páginas DocLayNet 0,46). Por idioma: árabe 0,80, inglés 0,78, japonés 0,96.

Bajo las etiquetas antiguas v2.0 (toda fecha como instante UTC), v2.1 obtiene block F1 0,773 frente a 0,792 de v2.0, cambio intencionado porque ahora escribe fechas simples cuando la página no muestra hora.

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial. El modelo base Qwen3-1.7B en precisión completa requiere aproximadamente 3,4 GB solo para pesos; en cuantización de 8 bits bajaría a unos 1,7 GB y en 4 bits a menos de 1 GB, aunque estos valores son estimaciones generales para un modelo de 1,7B y no cifras publicadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, una GPU consumer con 8 GB de VRAM o más debería alojar el modelo base en cuantización; una RTX 4090 o superior ofrece margen para contexto largo y mayor throughput.
- Cabe en GPU consumer: previsiblemente sí, en GPU con al menos 8 GB de VRAM usando cuantización, aunque el autor no publica requisitos ni cuantizaciones del adaptador.
- Opciones de despliegue: al ser un adaptador PEFT sobre Qwen3-1.7B, requiere cargar el modelo base y aplicar el adaptador con la librería peft. No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, ni se publican pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un adaptador LoRA especializado en un formato propietario (.printless v2.0) y no se han publicado comparativas con otros conversores de PDF a JSON ni con modelos de extracción documental.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| printless-1.7b (v2.1) | 1,7B (base Qwen3-1.7B) | No disponible (entrenado hasta 3.072 tokens) | Apache 2.0 | Hugging Face (6 descargas) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Documentos genéricos débiles en páginas DocLayNet (block F1 0,46): informes financieros y manuales donde los límites de párrafo y los niveles de encabezado son ambiguos. En cartas, memorandos, informes, formularios y páginas a dos columnas propias alcanza 0,78.
- Recibos con disposiciones no familiares: block F1 de 0,38 en el conjunto real. PDFs en árabe de algunos productores: 0,51, porque dos PDFs de test tienen posiciones de glifos que el extractor de texto no puede ordenar.
- Solo PDFs con capa de texto: los escaneados y los que tienen fuentes sin mapa Unicode no producen layout text utilizable y deben rechazarse antes de llegar al modelo. No hay etapa de OCR.
- Una página que imprime una hora sin indicar zona horaria no puede convertirse en un instante exacto.
- Entradas de más de 3.072 tokens no están cubiertas por el entrenamiento.
- El modelo reproduce lo que está en el PDF; no corrige ni interpreta más allá del contenido impreso.
- Riesgo de alucinación: la model card advierte explícitamente de que el modelo puede equivocarse y que toda respuesta debe validarse contra el JSON Schema público y tratarse como borrador para revisión humana.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el formato .printless v2.0 es propietario de Printless y su esquema está documentado en docs.printless.app; conviene revisar las condiciones de uso del formato y de la plataforma.
- La función "Start from a PDF" del portal Printless no está activa y Printless no sirve este modelo actualmente, por lo que no hay garantía de soporte o mantenimiento continuado.
- El decodificador de puntuación (greedy con restricción de JSON válido y cierre de corchetes) forma parte del pipeline de evaluación; la decodificación greedy simple solo garantiza la misma respuesta si el token superior del modelo es JSON válido en cada paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smjai/printless-1.7b
- Organización SMJ AI en Hugging Face: https://huggingface.co/smjai/models
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Documentación del formato .printless: https://docs.printless.app
- JSON Schema de .printless v2: https://docs.printless.app/schemas/printless-v2.schema.json
- Printless: https://printless.app
- SMJ AI: https://smj.ai
- Dataset CORD v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Dataset DocLayNet: https://huggingface.co/datasets/ds4sd/DocLayNet
