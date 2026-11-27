# balticml/mmbert-small-invoice-extraction

## Resumen

mmbert-small-invoice-extraction es un modelo de etiquetado de tokens (token classification) especializado en la extracción de campos estructurados de facturas en formato PDF digital. Lo desarrolla balticml, un proyecto centrado en herramientas de document AI para el ámbito báltico y europeo, y se distribuye bajo licencia Apache 2.0. El modelo parte de jhu-clsp/mmBERT-small, un transformer encoder de la familia ModernBERT, y se ha afinado para marcar con etiquetas BIO las palabras que corresponden a campos como vendedor, comprador, NIF/IVA, número de factura, fechas de emisión y vencimiento, base imponible, IVA, total e IBAN.

La propuesta es relevante porque aborda un problema muy concreto y recurrente en automatización contable: convertir el texto plano que extrae pdf.js de una factura en campos estructurados, sin depender de plantillas ni de OCR. El modelo cubre las 24 lenguas de la UE, Noruega y Ucrania, y se publica en formato ONNX con cuantización int8 para ejecutarse en el navegador mediante transformers.js, con un peso de 47,7 MB más 9,3 MB de tokenizer.

El modelo está pensado para funcionar acompañado de una capa de reglas (validación de dígitos de control de NIF e IBAN, comprobación de sumas y de fechas) y no como un pipeline genérico de token-classification: etiqueta palabras, no tokens, y cada palabra se tokeniza junto con el espacio en blanco precedente. Su tamaño reducido y su formato lo hacen adecuado para despliegues ligeros en cliente o en servidores modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), fine-tuning sobre jhu-clsp/mmBERT-small; se usan las 12 primeras de sus 22 capas |
| Parametros totales | no disponible (modelo base mmBERT-small; el repo pesa 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX weight-only int8 |
| Idiomas soportados | 24 lenguas de la UE, Noruega y Ucrania (en, pl, de, fr, es, lt, bg, cs, da, el, et, fi, hr, hu, it, lv, nl, no, pt, ro, sk, sl, sv, uk) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (transformers.js); tamano 47,7 MB + 9,3 MB de tokenizer |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, derivado de jhu-clsp/mmBERT-small, del que se conservan las 12 primeras capas de las 22 originales. Sobre esa base se ha realizado un fine-tuning de token classification con etiquetas BIO a nivel de palabra, no de subword: cada palabra se tokeniza junto con el espacio en blanco que la precede, de modo que las fronteras de palabra se preservan. La salida se exporta a ONNX con cuantización weight-only int8 para su uso con transformers.js.

El entrenamiento no utiliza facturas reales. El corpus se compone de 9.000 facturas generadas por un generador propio (seis familias de maquetación y seis idiomas), 23.259 facturas con maquetaciones compuestas aleatoriamente a partir de bloques en 24 idiomas, 566 facturas escritas íntegramente por gpt-oss-20b para 30 tipos de negocio (cada una rellenada además cinco veces con otros nombres y números) y 480 facturas exportadas de instalaciones locales de Dolibarr y Odoo para empresas ficticias. Todas se leyeron con pdf.js bloque a bloque y la etiqueta de cada palabra se deriva de la posición donde se imprime su valor. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Extracción de campos de factura: vendedor y comprador, NIF/IVA de ambos, número de factura, fecha de emisión, fecha de vencimiento, base imponible, IVA, total e IBAN.
- Etiquetado a nivel de palabra con esquema BIO sobre texto extraído por pdf.js de PDF digitales con capa de texto.
- Cobertura multilingüe de 24 lenguas europeas más noruego y ucraniano.
- Integración con una capa de reglas externa que valida dígitos de control de NIF (25 países) e IBAN, comprueba que las sumas cuadren y que las fechas sean fechas válidas.
- Gestión explícita de la incertidumbre: los campos con baja confianza se dejan vacíos ("not sure") y, cuando la maquetación no nombra los roles, se listan ambas empresas sin asignar vendedor y comprador.
- Ejecución en navegador mediante transformers.js y ONNX int8, sin necesidad de backend.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; es un modelo puramente extractivo.

## Casos de uso

- Automatización contable en pymes: procesar las facturas recibidas en PDF digital y volcar los campos extraídos al sistema de contabilidad, usando la capa de reglas para validar NIF e IBAN antes de registrar el asiento.
- Gestión de cuentas a pagar: detectar número de factura, fecha de vencimiento y total para programar pagos y conciliar con el ERP, aprovechando la cobertura multilingüe para proveedores de distintos países de la UE.
- Herramienta de escritorio o web autocontenida: al ejecutarse con transformers.js en ONNX int8, permite construir una aplicación que procese facturas en el propio navegador del usuario sin enviar documentos a un servidor, lo que reduce el riesgo de exposición de datos financieros.
- Pre-llenado de formularios de gastos: extraer vendedor, base, IVA y total de facturas de viaje o compras para que el usuario solo revise y confirme, dejando vacíos los campos marcados como inciertos.
- Validación y revisión asistida: usar las etiquetas "not sure" y la capa de reglas para dirigir la revisión humana únicamente a los campos dudosos, reduciendo el tiempo de verificación manual.
- Procesamiento por lotes de facturas de proveedores extranjeros: la cobertura de 24 lenguas permite aplicar el mismo modelo a facturas en polaco, lituano, checo o griego sin modelos separados por idioma.
- Integración en pipelines documentales existentes: sustituir o complementar extractores basados en plantillas por un modelo que generaliza a maquetaciones no vistas, siempre que se combine con el código del repositorio y no con el pipeline genérico.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre PDFs de herramientas de facturación no vistas durante el entrenamiento, con cuantización int8 y la capa de reglas a umbral 0,6. Un campo se considera correcto cuando su valor coincide con el de la factura tras normalizar; los campos "not sure" se dejan vacíos.

| Conjunto | Facturas | Campos | Correctos | Incorrectos mostrados | No seguros |
|---|---|---|---|---|---|
| InvoiceShelf, 24 idiomas | 72 | 746 | 61,7% | 0,8% | 37,5% |
| Invoice Ninja, 6 diseños, 23 idiomas | 63 | 678 | 64,7% | 0,3% | 35,0% |
| Fakturownia | 20 | 220 | 86,4% | 0,0% | 13,6% |
| Facturas escritas por LLM, revisadas a mano | 60 | no disponible | 84,5% | 0,8% | no disponible |

La mayoría de los campos "not sure" corresponden a vendedor y comprador en maquetaciones que no etiquetan los roles; en esos casos la herramienta lista ambas empresas y entre el 6% y el 8% de los nombres listados son erróneos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo ONNX int8 pesa 47,7 MB más 9,3 MB de tokenizer, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en navegador. Cualquier GPU moderna (RTX 4090, A100, H100) lo ejecuta sin problema, pero es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en todas; también en dispositivos de gama baja y en el propio navegador del usuario.
- Opciones de despliegue: transformers.js con ONNX Runtime (vía web o Node.js), y en general cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mmbert-small-invoice-extraction | no disponible (base mmBERT-small, 12 de 22 capas) | no disponible | Token classification de campos de factura, 24 idiomas, ONNX int8 | Apache 2.0 | Hugging Face, transformers.js |
| Modelos NER genéricos multilingües (p. ej. XLM-R o mBERT fine-tuned para NER) | cientos de millones | 512 típicamente | NER general (persona, organización, lugar), no específico de facturas | variable | Hugging Face |
| Extractores basados en plantillas o reglas | no aplica | no aplica | Reglas posicionales o regex sobre el texto del PDF | variable | Comercial o interno |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. Frente a un NER genérico, este modelo ofrece etiquetas específicas de factura (IVA, IBAN, base, total) y cobertura de 26 lenguas; frente a extractores por plantilla, generaliza a maquetaciones no vistas, a costa de un porcentaje relevante de campos dejados como "not sure".

## Limitaciones y advertencias

- Solo procesa PDF digitales con capa de texto; no soporta escaneos ni documentos que requieran OCR.
- Entrenado exclusivamente con facturas sintéticas (generador, maquetaciones compuestas, gpt-oss-20b, exportaciones de Dolibarr y Odoo); no se ha evaluado sobre facturas reales.
- Los conjuntos de prueba son de una sola página y de pequeñas empresas; el comportamiento en facturas largas o de gran empresa no está documentado.
- Los nombres de empresa son los campos más débiles, con un 6-8% de nombres erróneos cuando la maquetación no etiqueta los roles.
- Porcentaje elevado de campos "not sure" (35-37,5%) en herramientas de facturación no vistas; el rendimiento depende de la capa de reglas y del umbral de confianza.
- Etiqueta palabras, no tokens; el uso del pipeline genérico de token-classification puede dar resultados incorrectos. Debe usarse el código del repositorio (web/model.js, web/pdftext.js, web/review.js).
- Licencia Apache 2.0: permite uso comercial, pero el autor recomienda probar el modelo con las facturas de los propios proveedores antes de confiar en él.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de asignaciones erróneas de valores a campos; la validación por reglas mitiga parcialmente este riesgo.
- Sesgos: no documentados en la información disponible; al entrenarse con datos sintéticos, puede reflejar las convenciones de los generadores y de las herramientas Dolibarr y Odoo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balticml/mmbert-small-invoice-extraction
- Repositorio GitHub: https://github.com/balticml/invoice-extraction
- Demo: https://balticml.eu/demos/invoice-extraction/
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
