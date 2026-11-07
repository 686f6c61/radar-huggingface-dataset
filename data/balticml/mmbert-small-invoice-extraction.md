# balticml/mmbert-small-invoice-extraction

## Resumen

mmbert-small-invoice-extraction es un modelo de extraccion de informacion especializado en facturas, desarrollado por Baltic ML (balticml). Se trata de un fine-tuning del modelo base jhu-clsp/mmBERT-small, un encoder multilingue de tipo ModernBERT, adaptado a la tarea de token classification con etiquetas BIO para marcar los campos clave de una factura dentro del texto extraido de un PDF digital. El modelo identifica vendedor y comprador, sus numeros de IVA, numero de factura, fechas de emision y vencimiento, importes neto, IVA y total, y el IBAN, en seis idiomas: ingles, polaco, aleman, frances, espanol y lituano.

El modelo resuelve un problema muy concreto y de alto valor practico: la extraccion estructurada de datos de facturas sin recurrir a LLMs generativos. Frente a la alternativa de pedir JSON a un modelo grande, esta propuesta usa un encoder pequeno (solo las primeras 12 de las 22 capas de mmBERT-small) con cuantizacion int8 weight-only en formato ONNX, lo que reduce el peso a 32,7 MB mas 1,0 MB de tokenizer. Esto lo hace apto para inferencia en navegador mediante transformers.js.

Su relevancia actual radica en la eficiencia: segun la model card, combinado con una capa de reglas que valida digitos de control de IVA e IBAN, alcanza un 97,9% de campos correctos con 49 ms por factura en CPU (ORT, 4 hilos), frente al 92,2% de Qwen 2.5 7B en int4 sobre GPU con 1,2 s por factura. Es un ejemplo de como un modelo pequeno y especializado puede superar a un LLM general en una tarea acotada y con requisitos de latencia estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), fine-tuning de jhu-clsp/mmBERT-small usando las 12 primeras de sus 22 capas |
| Parametros totales | no disponible (el modelo base mmBERT-small no reporta cifra en la informacion proporcionada; el artefacto ONNX int8 pesa 32,7 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 weight-only en ONNX (unico formato publicado) |
| Idiomas soportados | en, pl, de, fr, es, lt |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (para transformers.js); no se indica disponibilidad de safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/mmBERT-small, un encoder multilingue de la familia ModernBERT. El fine-tuning conserva unicamente las 12 primeras capas del modelo base y anade una cabeza de token classification que emite etiquetas BIO a nivel de palabra, no de subword. Cada palabra se tokeniza junto con el espacio en blanco que la precede, de modo que el modelo etiqueta palabras completas del texto tal y como lo extrae pdf.js de un PDF digital.

Los datos de entrenamiento no incluyen facturas reales. Se compone de 9.000 facturas sinteticas generadas por un generador propio con seis familias de maquetacion, seis idiomas, empresas ficticias e identificadores con digitos de control validos, mas 566 facturas redactadas integramente por gpt-oss-20b para 30 tipos de negocio, cada una reutilizada cinco veces con otros nombres y numeros. Todas se imprimieron a PDF en Chrome y se releeron con pdf.js bloque a bloque; la etiqueta de cada palabra se deriva de la posicion del valor marcado en la pagina. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Extraccion de campos de factura mediante etiquetado BIO a nivel de palabra: vendedor, comprador, NIF/IVA de ambos, numero de factura, fecha de emision, fecha de vencimiento, importe neto, IVA, total e IBAN.
- Procesamiento multilingue en seis idiomas: ingles, polaco, aleman, frances, espanol y lituano.
- Integracion con una capa de reglas externa que valida numeros de IVA e IBAN por sus digitos de control, lo que eleva la precision del conjunto.
- Inferencia en navegador mediante transformers.js y ONNX Runtime Web, sin servidor.
- No es un modelo generativo: no produce texto, no soporta tool calling, ni razonamiento multi-paso, ni agentes, ni vision, ni audio.

## Casos de uso

- Automatizacion de contabilidad en pequenas empresas: procesar facturas digitales en PDF y volcar los campos extraidos (importes, IVA, fechas, NIF) directamente a un sistema de contabilidad o ERP, con validacion de digitos de control para descartar errores de OCR.
- Procesamiento en el navegador del usuario: al ejecutarse con transformers.js sobre ONNX int8, permite extraer datos de facturas sin enviar documentos a un servidor, lo que simplifica el cumplimiento de RGPD en gestorias y despachos.
- Gestion de cuentas por pagar: clasificar y extraer automaticamente proveedor, numero de factura y fecha de vencimiento de lotes de facturas recibidas para programar pagos y detectar duplicados por numero de factura.
- Facturacion electronica multi-pais: al cubrir polaco, aleman, frances, espanol y lituano, resulta adecuado para empresas con operaciones en varios mercados europeos que reciben facturas en distintos idiomas y formatos de maquetacion.
- Validacion de datos fiscales: la combinacion del modelo con la capa de reglas de digitos de control permite verificar NIF e IBAN extraidos y marcar facturas sospechosas o mal formadas antes de registrarlas.
- Digitalizacion de archivos historicos de facturas: procesar en lote PDFs digitales almacenados para construir un indice estructurado de proveedores, importes y fechas que alimente busquedas y auditorias.
- Extraccion en dispositivos con recursos limitados: con 32,7 MB de pesos int8 y 49 ms por factura en CPU, puede desplegarse en entornos sin GPU, como portatiles de oficina o funciones serverless de bajo coste.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 60 facturas generadas por gpt-oss-20b para tipos de negocio no vistos en entrenamiento, con todos los campos verificados manualmente. Un campo se considera correcto si su valor coincide con el de la factura tras normalizar.

| Sistema | Campos correctos | Facturas con todos los campos correctos | Tiempo por factura |
|---|---|---|---|
| Este modelo + digitos de control, int8 | 97,9% | 80,0% | 49 ms (ORT CPU, 4 hilos) |
| Qwen 2.5 7B instruct (int4, Ollama), pidiendo JSON | 92,2% | 53,3% | 1,2 s (GPU) |
| Solo reglas | 58,4% | 0% | no disponible |

Precision por campo (segun la model card): vendedor 93%, comprador 90%; el resto de campos no se detalla en la informacion proporcionada. El autor advierte que las facturas de test proceden del mismo LLM que parte de los datos de entrenamiento, por lo que estos resultados deben interpretarse como cotas superiores.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula en GPU; el artefacto ONNX int8 ocupa 32,7 MB mas 1,0 MB de tokenizer, por lo que cabe en memoria de cualquier dispositivo.
- GPU recomendadas: no requiere GPU; el benchmark oficial se ejecuta en CPU con ONNX Runtime y 4 hilos.
- Cabe en cualquier GPU de consumo e incluso en CPU y en navegador; no hay requisitos minimos relevantes.
- Opciones de despliegue: transformers.js con ONNX Runtime Web (via oficial documentada), ONNX Runtime en servidor, y el codigo del repositorio github.com/balticml/invoice-extraction (`web/model.js` y `web/pdftext.js`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 49 ms por factura en CPU (ORT, 4 hilos) segun la model card; el throughput agregado no se detalla.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mmbert-small-invoice-extraction | Encoder ModernBERT + BIO | no disponible (ONNX int8 de 32,7 MB) | no disponible | Extraccion de campos de factura | apache-2.0 | Hugging Face, ONNX |
| Qwen 2.5 7B instruct | LLM generativo decoder-only | 7B | no disponible en la informacion | Extraccion generativa pidiendo JSON | no disponible en la informacion | Ollama, ampliamente disponible |
| Solo reglas (linea base del autor) | Reglas heuristicas | no aplica | no aplica | Coincidencia de patrones | no aplica | Codigo propio |

Frente a Qwen 2.5 7B, el modelo especializado obtiene mas campos correctos (97,9% frente a 92,2%), muchas mas facturas completamente correctas (80,0% frente a 53,3%) y es aproximadamente 24 veces mas rapido en la configuracion medida, ademas de ejecutarse en CPU. Frente a las reglas solas, la mejora es sustancial (58,4% frente a 97,9% de campos correctos, y 0% frente a 80,0% de facturas completas). No se dispone de datos de otros extractores de facturas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo procesa PDFs digitales con capa de texto; no admite escaneos ni documentos sin texto extraible.
- El test se limita a facturas de una pagina de pequenas empresas; no se ha validado con facturas extensas o de gran corporacion.
- Los nombres de empresa son los campos mas debiles: vendedor 93% y comprador 90%, y un nombre truncado o sin su forma juridica se cuenta como incorrecto.
- Los resultados de benchmark son cotas superiores: las facturas de test provienen del mismo LLM que parte de los datos de entrenamiento y fueron verificadas por el autor del repositorio.
- Entrenado sin facturas reales, por lo que puede degradarse ante maquetaciones, jergas o formatos no representados en el generador sintetico.
- No debe usarse con el pipeline generico de token classification: el modelo etiqueta palabras, no tokens, y requiere el codigo del repositorio (`web/model.js` y `web/pdftext.js`).
- No es un modelo generativo: no razona, no responde preguntas ni soporta tool calling; su unica salida es el etiquetado de palabras.
- Aunque la licencia apache-2.0 permite uso comercial, conviene validar el rendimiento en el dominio propio antes de desplegarlo en produccion.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de etiquetado erroneo en campos ambiguos o mal delimitados en el texto del PDF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balticml/mmbert-small-invoice-extraction
- Modelo base jhu-clsp/mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Repositorio del codigo: https://github.com/balticml/invoice-extraction
- Demo: https://balticml.eu/demos/invoice-extraction/
- Pagina de modelos de Baltic ML: https://huggingface.co/balticml/models
