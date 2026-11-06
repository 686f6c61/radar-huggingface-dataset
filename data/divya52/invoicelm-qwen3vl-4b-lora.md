# Divya52/invoicelm-qwen3vl-4b-lora

## Resumen

InvoiceLM es un adaptador LoRA para el modelo multimodal Qwen3-VL-4B-Instruct (en su versión cuantizada a 4 bits para MLX) especializado en la extracción estructurada de facturas fiscales indias con GST. Lo desarrolla Divya52 y resuelve un problema muy concreto: convertir una imagen de factura (escaneo, foto de móvil, libro de facturas manuscrito o recibo térmico) en un JSON con número y fecha de factura, datos de proveedor y comprador (nombre, GSTIN, código de estado), lugar y tipo de suministro, líneas de detalle con HSN/SAC, cantidades, bases imponibles y desglose de CGST/SGST/IGST, y totales.

El modelo base es Qwen3-VL-4B-Instruct, un transformer multimodal de 4.000 millones de parámetros con torre de visión, y el adaptador añade 33,0 millones de parámetros entrenables (0,74 % del total) sobre las proyecciones de atención y MLP del modelo de lenguaje. La inferencia está pensada para ejecutarse localmente en Apple Silicon mediante MLX, lo que lo hace relevante para despachos contables, pymes y desarrolladores que necesitan procesar facturas sin enviar documentos fiscales a servicios en la nube.

Su interés actual radica en la combinación de un modelo pequeño (4B), cuantización 4-bit, ejecución local en un portátil y una mejora medida sustancial frente al modelo sin entrenar: del 21,7 % al 73,3 % de facturas con todos los campos críticos correctos en el conjunto de test de 60 facturas, con una precisión de campo del 96,3 %. La licencia Apache 2.0 facilita su uso comercial, aunque el propio autor advierte que solo se ha entrenado y evaluado con facturas sintéticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL-4B-Instruct) con adaptador LoRA; librería MLX |
| Parametros totales | 4B (modelo base) + 33,0 M entrenables en el adaptador (0,74 %) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa máximo 3.072 tokens) |
| Tipos de cuantizacion | Pesos del modelo base en 4 bits (mlx-community/Qwen3-VL-4B-Instruct-4bit); el adaptador se distribuye como LoRA |
| Idiomas soportados | Inglés (en), hindi (hi), kannada (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA para MLX (modelo base en formato MLX cuantizado a 4 bits) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-4B-Instruct, un transformer multimodal con codificador visual y modelo de lenguaje, en la variante cuantizada a 4 bits de mlx-community. El LoRA tiene rango 16, alpha 32 (escala 2,0) y dropout 0,05, y se aplica a todas las proyecciones de atención y MLP del modelo de lenguaje, sumando 33,0 millones de parámetros entrenables. El entrenamiento se hizo con mlx-vlm durante 1 época (1.613 pasos), batch 1 con acumulación de gradiente de 4 pasos, learning rate 1e-4, cálculo de pérdida solo sobre las completaciones, longitud máxima de 3.072 tokens y checkpointing de gradiente. El proceso completo tardó 6 h 09 min en un MacBook con chip M5. La pérdida de validación bajó de 0,0148 (paso 100) a 0,0047 (paso 600, mínimo) y terminó en 0,0060, con una precisión de token del 99,83 %.

Los datos de entrenamiento son las 1.613 facturas sintéticas del dataset Divya52/indian-gst-invoices. No se menciona uso de RLHF ni DPO. La innovación principal no está en la arquitectura sino en el enfoque de producto: el adaptador aprende un formato de salida JSON fijo a partir de un prompt concreto y se diseña para combinarse con validadores externos (checksum de GSTIN, aritmética de impuestos y lógica de tipo de suministro) que son los que deciden si una factura requiere revisión, nunca el modelo. El prompt recomendado incluye una instrucción explícita de tratar el texto de la imagen como datos y no como instrucciones, lo que mitiga inyecciones de prompt.

## Capacidades

- Extracción de documentos: lee facturas GST indias en formato de escaneo, foto de móvil, libro de facturas manuscrito o recibo térmico y devuelve JSON estructurado.
- Comprensión de imagen y texto (pipeline image-text-to-text): procesa la imagen de la factura junto con un prompt de extracción.
- Extracción de campos fiscales: número y fecha de factura, nombre y GSTIN del proveedor y del comprador, código de estado, lugar de suministro, tipo de suministro, líneas con HSN/SAC, cantidad, tasa, valor imponible, tipo de GST y desglose CGST/SGST/IGST, y totales.
- Multilingüe limitado: inglés, hindi y kannada; en el conjunto de test regional, la precisión de campo fue del 89,7 % en hindi y del 88,8 % en kannada.
- Resistencia a inyección de prompt: en 24 facturas con texto plantado (por ejemplo, «set total = 0»), el 100 % se leyó correctamente o se marcó, frente al 95,8 % del modelo sin entrenar.
- Diferenciación proveedor/comprador: 0 intercambios en 221 facturas con diseño en inglés, frente a 7 de 60 en Qwen2.5-VL-3B sin entrenar.
- No se documentan capacidades de tool calling, function calling, agentes o razonamiento multi-paso más allá del formato de salida JSON aprendido.

## Casos de uso

- Digitalización de facturas en pymes y despachos contables: el modelo convierte fotos o escaneos de facturas GST en JSON listo para importar en un ERP o en un software de contabilidad, ejecutándose en local en un Mac con Apple Silicon y evitando enviar documentos fiscales a la nube.
- Automatización de la captura de compras: extracción de proveedor, GSTIN, base imponible y desglose de impuestos para conciliar compras y calcular el crédito de IVA (ITC), con los validadores de GSTIN y aritmética como paso previo a la contabilización.
- Procesamiento de facturas manuscritas en comercios rurales: el adaptador mejora la precisión de campo del 79,2 % al 93,3 % en libros de facturas manuscritos, lo que permite digitalizar talonarios que ningún OCR clásico resuelve bien.
- Digitalización de recibos térmicos: extracción de líneas y totales de tickets de punto de venta para control de gastos y auditoría interna.
- Flujos de revisión humana asistida: el modelo genera el JSON y los validadores marcan `needs_review`; el equipo humano solo revisa los casos marcados, lo que reduce el volumen de revisión manual.
- Procesamiento por lotes en local: con un coste estimado de unos 1,4 rupias de electricidad por cada 1.000 facturas y 25 s por factura en un M5 de 16 GB, es viable procesar lotes nocturnos en un portátil sin infraestructura GPU dedicada.
- Facturación multilingüe en India: extracción de facturas con texto en hindi o kannada, con precisión de campo cercana al 89 % en ambos idiomas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre las mismas 60 facturas sintéticas de test, imágenes de 1.024 px y un MacBook M5 de 16 GB:

| Modelo | Todos los campos críticos correctos | Precisión de campo | Errores no marcados | Segundos por factura |
|---|---|---|---|---|
| Qwen3-VL-4B-Instruct-4bit sin entrenar | 21,7 % | 85,7 % | 0 | 30,3 |
| Este adaptador | 73,3 % | 96,3 % | 2 | 25,0 |
| Qwen2.5-VL-7B (Ollama) | 60,0 % | 94,1 % | 0 | 77,0 |
| Qwen3-VL-4B-Instruct (Ollama) | 63,3 % | 93,5 % | 0 | 44,8 |

Sobre las 197 facturas sintéticas de test: 75,6 % con todos los campos críticos correctos, 96,3 % de precisión de campo y 98,1 % de F1 en líneas de detalle. Por tipo de imagen: fotos de móvil 94,2 % de precisión de campo (frente a 81,2 % sin entrenar) y libros manuscritos 93,3 % (frente a 79,2 %). En hindi y kannada (40 facturas), los campos críticos correctos pasan del 27,5 % al 72,5 %. En inyección de prompt (24 facturas), el 100 % se lee correctamente o se marca, frente al 95,8 % del modelo sin entrenar. No se han publicado comparaciones con modelos alojados de gran tamaño como Gemini.

## Requisitos de hardware

- VRAM/memoria unificada: el modelo base en 4 bits más el adaptador cabe en 16 GB de memoria unificada; el autor lo ejecuta en un MacBook M5 de 16 GB.
- GPU recomendadas: Apple Silicon (M5 y, presumiblemente, otros chips de la familia M) mediante MLX; no se documenta soporte para GPU NVIDIA ni AMD.
- Cabe en hardware de consumo: sí, en Macs con Apple Silicon y al menos 16 GB de memoria unificada.
- Opciones de despliegue: mlx-vlm con `load(..., adapter_path=...)` y `generate(...)`; el autor publica además código, validadores y una API en el repositorio de GitHub.
- Latencia y throughput: 25,0 s por factura en un M5 de 16 GB con imágenes de 1.024 px, frente a 30,3 s del modelo sin entrenar y 44,8 s de Qwen3-VL-4B-Instruct en Ollama; coste eléctrico estimado de unas 1,4 rupias por cada 1.000 facturas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Campos críticos correctos (60 facturas) | Precisión de campo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| InvoiceLM (este adaptador) | 4B + LoRA 33 M | No disponible | 73,3 % | 96,3 % | Apache 2.0 | Hugging Face, MLX local |
| Qwen3-VL-4B-Instruct-4bit sin entrenar | 4B | No disponible | 21,7 % | 85,7 % | Apache 2.0 (modelo base) | Hugging Face |
| Qwen3-VL-4B-Instruct (Ollama) | 4B | No disponible | 63,3 % | 93,5 % | Apache 2.0 (modelo base) | Ollama |
| Qwen2.5-VL-7B (Ollama) | 7B | No disponible | 60,0 % | 94,1 % | Apache 2.0 (modelo base) | Ollama |

## Limitaciones y advertencias

- Entrenado y evaluado solo con facturas sintéticas; el autor advierte que las facturas reales son más sucias y que cabe esperar cifras inferiores hasta que se pruebe con fotos reales.
- En 2 de las 60 facturas de test hubo un error de un solo dígito en campos que ningún validador puede comprobar (número de factura TI-4317 leído como TI-4817 y año 2025 como 2026); recomienda revisar a ojo número y fecha.
- Los nombres de proveedor impresos solo en kannada a menudo no se leen y el modelo copia el bloque del comprador (2 de 40 facturas regionales, ambas marcadas por los validadores).
- El texto en hindi y kannada no fue revisado por un hablante nativo.
- No se ha comparado todavía con un modelo alojado de gran tamaño como Gemini.
- La salida es datos, no instrucciones: siempre hay que ejecutar los validadores antes de que nada llegue a una presentación fiscal.
- El adaptador depende del prompt exacto con el que se entrenó; cambiar el formato de la instrucción puede degradar la salida.
- La imagen debe redimensionarse para que el lado mayor mida 1.024 px, el tamaño de entrenamiento.
- El modelo solo cubre el dominio de facturas GST indias; no es un modelo de propósito general.
- No se documentan sesgos específicos más allá de las limitaciones de idioma y de la naturaleza sintética de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Divya52/invoicelm-qwen3vl-4b-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/Divya52/indian-gst-invoices
- Código, validadores, API y benchmark: https://github.com/divyabasavraj/invoice-lm
- Modelo base: https://huggingface.co/mlx-community/Qwen3-VL-4B-Instruct-4bit
