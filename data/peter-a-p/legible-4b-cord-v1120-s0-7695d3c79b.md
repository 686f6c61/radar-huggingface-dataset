# Peter-A-P/legible-4b-cord-v1120-s0-7695d3c79b

## Resumen

`Peter-A-P/legible-4b-cord-v1120-s0-7695d3c79b` es un adaptador QLoRA publicado en Hugging Face que convierte el modelo multimodal `google/gemma-4-E4B` en un extractor de campos estructurados para recibos de restaurante y comercio del dataset CORD v2 (Clova AI). El adaptador recibe las páginas del documento como imágenes, junto con una instrucción fija que describe cada campo y su JSON Schema, y devuelve un único objeto JSON con todos los valores como cadenas o `null`.

El modelo forma parte del proyecto "Forms That Read Themselves" (paquete `legible`), un banco de pruebas que compara modelos de visión de frontera, modelos de visión pequeños ajustados y pipelines OCR sobre formularios escaneados con respuesta conocida. La ejecución concreta es `4b-cord-v1120-s0-7695d3c79b`, con semilla 0 y 1.120 tokens visuales por página. Se publica con licencia apache-2.0, ocupa 0,2 GB en el repositorio y, en el momento de la consulta, no registra descargas ni valoraciones.

Su relevancia es acotada pero clara: demuestra que un adaptador LoRA de rango 16 sobre un modelo de ~4B puede especializarse en extracción de recibos con un coste de entrenamiento mínimo (100 pasos de optimizador sobre 800 documentos). Es un artefacto de investigación reproducible, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre `google/gemma-4-E4B`; transformer multimodal con torre de visión, torre de audio y proyector visual |
| Parametros totales | No disponible. El repositorio del adaptador ocupa 0,2 GB; el identificador "E4B" del modelo base sugiere un tamaño efectivo de ~4B, no confirmado en la informacion disponible |
| Parametros activos | No disponible (no se confirma que el modelo base sea MoE) |
| Longitud de contexto | 12.288 tokens como limite de secuencia en entrenamiento; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Entrenamiento en NF4 4-bit con doble cuantizacion y computo en bf16 (torres de vision y audio, proyector visual y capa de salida en precision completa). El adaptador se distribuye sin cuantizar; la cuantizacion final depende de como se cargue el modelo base |
| Idiomas soportados | Ingles (etiqueta `language: en`). Los documentos de entrenamiento son recibos en indonesio |
| Licencia | apache-2.0 (segun la model card, la licencia del modelo base) |
| Formato de pesos | safetensors, adaptador PEFT/LoRA (`library_name: peft`). Requiere descargar el modelo base por separado |
| Tokens visuales por pagina | 1.120 |
| Dataset de entrenamiento | `naver-clova-ix/cord-v2` (commit 7f0115a4b758a71d6473b8d085751692da2fef98), 800 documentos / 800 paginas |
| Revision del modelo base | `411aa17b749aa952df1359d2dcea73917a544d9a` |
| Plantilla de chat | `google/gemma-4-E4B-it` en revision `ee0ef6023621cff504d758262d4e04895a5af4a2` |

## Arquitectura y entrenamiento

El adaptador se entrena con la receta QLoRA del proyecto 06 de `legible` (`legible/train/vision.py`) sobre `google/gemma-4-E4B`. Cada ejemplo es un turno de usuario con las imagenes de las paginas en orden seguidas de la instruccion `legible.prompt` (version 1), que describe cada campo y proporciona el JSON Schema, y un turno de asistente con el JSON verdadero. La perdida se calcula unicamente sobre los tokens de la respuesta. El adaptador mantiene los pesos base en NF4 4-bit con doble cuantizacion y computo en bf16, dejando las torres de vision y audio, el proyector visual y la capa de salida en precision completa.

Los hiperparametros son: LoRA de rango 16 con alpha 32 y dropout 0,05, aplicado a las proyecciones de atencion y MLP del modelo de lenguaje y al proyector visual, nunca a las torres. Optimizacion con tasa de aprendizaje 0,0002, schedule coseno, warmup 0,03, una epoca, un documento por paso y 8 pasos acumulados, lo que da 100 pasos de optimizador sobre 800 documentos. La semilla es 0 y el limite de secuencia es de 12.288 tokens, con 1.120 tokens visuales por pagina. El control de fuga de datos es explicito: cada documento de entrenamiento procede de la particion de train y un documento reservado hace rechazar el conjunto (`legible/train/dataset.py`). No se documenta ninguna innovacion arquitectonica propia; el interes esta en el procedimiento de evaluacion y en la reproducibilidad del registro (`run.json`).

## Capacidades

- Extraccion de campos estructurados a JSON a partir de la imagen de un recibo, con salida restringida al esquema definido: un objeto JSON por documento, valores como cadena o `null`, en forma compacta (`{"advertiser":null}`, sin espacios).
- Cobertura de campos de linea de pedido: `menu[].nm`, `num`, `unitprice`, `cnt`, `discountprice`, `price`, `itemsubtotal`, `vatyn`, `etc`.
- Cobertura de subitems y opciones (`sub_item`) y de lineas anuladas (`void_menu`).
- Cobertura de totales y pagos: `subtotal_price`, `discount_price`, `service_price`, `othersvc_price`, `tax_price`, `total_price`, `cashprice`, `changeprice`, `creditcardprice`, `emoneyprice`, `menutype_cnt`, `menuqty_cnt`.
- Lectura de documentos multipagina (la entrada admite las paginas en orden), aunque el entrenamiento uso una pagina por documento.
- Procesamiento multimodal imagen-texto mediante la torre de vision del modelo base; el adaptador no modifica los pesos de las torres.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking ni otras capacidades del modelo base. La unica tarea entrenada es la extraccion segun la instruccion fija, y el autor indica explicitamente que el adaptador se entreno con esa instruccion "y nada mas".

## Casos de uso

- Digitalizacion de recibos de restaurante en un pipeline de contabilidad: el adaptador transforma la foto del ticket en JSON con lineas, impuestos y total, listo para volcar a un ERP o a una hoja de calculo sin parsing heuristico.
- Automatizacion de notas de gastos: integrado en una aplicacion movil, el modelo extrae `total_price`, `tax_price` y `creditcardprice` de la foto que sube el empleado y rellena el formulario de reembolso.
- Conciliacion de caja y pagos: los campos `cashprice`, `changeprice`, `creditcardprice` y `emoneyprice` permiten cuadrar el cierre de caja diario de un comercio a partir de los tickets escaneados.
- Auditoria de lineas anuladas: `void_menu` da visibilidad sobre consumiciones canceladas, util para detectar patrones de fraude o errores de cobro en cadenas de restauracion.
- Extraccion de subitems en menus combinados: `sub_item` captura los componentes de un menu de set, lo que permite analitica de composicion de producto y de coste por componente.
- Base para un clasificador de calidad de datos: al devolver `null` en campos que no puede leer, el modelo se puede usar como filtro que marca documentos para revision humana en lugar de inventar valores.
- Referencia metodologica para equipos que evaluan extraccion documental: el protocolo de la model card (100 recibos de test de CORD, temperatura 0, matchers de VRDU, intervalos bootstrap al 95 % y coste por lectura) sirve como plantilla de evaluacion reproducible.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La seccion "Results" de la model card aparece truncada: describe el protocolo (100 recibos de test de CORD, lectura unica, nivel 0, temperatura 0, salida sin restricciones, exactitud de campo con los matchers de VRDU y un unico evaluador para todos los lectores, intervalos bootstrap al 95 % sobre documentos, coste del adaptador calculado a 0,50 USD/hora en una RTX 3090 en RunPod con fecha 2026-10-18), pero no incluye las cifras.

| Benchmark | Resultado |
|---|---|
| Exactitud de campo en CORD test (100 recibos) | No disponible (cifras truncadas en la model card) |
| Coste por lectura | No disponible (metodologia descrita, valor truncado) |
| MMLU / HumanEval / GSM8K u otros | No aplicables; el modelo es un extractor especializado y no se han publicado resultados |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa 0,2 GB, pero requiere cargar el modelo base. Como estimacion orientativa para un modelo de ~4B: en bf16, del orden de 8-9 GB; en cuantizacion 4-bit, del orden de 3-4 GB, mas el coste de los tokens visuales (1.120 por pagina). Estas cifras son estimaciones a partir del tamano nominal, no medidas publicadas.
- GPU recomendadas: el autor costo la lectura sobre una RTX 3090, lo que indica que el artefacto se ejecuta en GPU de consumo alto. Para lotes mayores o varias paginas por documento, se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3090, RTX 4090 y tarjetas con 16-24 GB en cuantizacion 4-bit; en 8 GB el margen es ajustado por el proyector y los tokens visuales.
- Opciones de despliegue: PEFT sobre Transformers para cargar el adaptador; vLLM o TGI para servir el modelo fusionado; llama.cpp/Ollama solo si se convierte el modelo base multimodal a GGUF, algo no documentado en la informacion disponible.
- Latencia y throughput: no disponibles. La model card menciona que el coste se calculo sobre el "tiempo de pared medido de su lectura", pero el valor no aparece en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de las alternativas no proceden de la informacion proporcionada y deben verificarse antes de citarlos; se incluyen solo como orientacion de categoria.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Peter-A-P/legible-4b-cord-v1120-s0-7695d3c79b` | Adaptador sobre base ~4B (no confirmado) | 12.288 tokens de limite de secuencia en entrenamiento | Extraccion a JSON guiada por instruccion y esquema, con torre de vision del modelo base | apache-2.0 | Publicado en HF, 0 descargas |
| `naver-clova-ix/donut-base-finetuned-cord-v2` | ~0,2B (orientativo) | No disponible | Image-to-JSON extremo a extremo especifico de CORD | MIT (orientativo) | Publicado en HF, ampliamente usado |
| `microsoft/layoutlmv3-base` | ~0,13B (orientativo) | 512 tokens (orientativo) | Modelo de understanding documental con layout y OCR externo | CC BY-NC-SA 4.0 (orientativo, no comercial) | Publicado en HF |
| Modelos de vision de frontera evaluados en `legible` | No disponible | No disponible | Lectura generalista de documentos con prompt libre | Segun proveedor | Solo via API |

La diferencia practica frente a Donut y LayoutLMv3 es el enfoque: aqui no se entrena un modelo desde cero para CORD, sino que se especializa un modelo multimodal grande mediante un adaptador pequeno, lo que abarata el ajuste pero hereda el coste de inferencia y las limitaciones del modelo base.

## Limitaciones y advertencias

- Dominio muy estrecho: solo recibos del dataset CORD v2 (Indonesia). No hay evidencia de generalizacion a otros formatos, idiomas o paises.
- Volumen de entrenamiento minimo: 800 documentos, 800 paginas y 100 pasos de optimizador, una sola epoca. El riesgo de sobreajuste al split de entrenamiento es real.
- Sin cifras de rendimiento publicadas en la informacion disponible: no es posible afirmar que supere a Donut, a LayoutLMv3 ni a un pipeline OCR en la propia tarea, pese a que el proyecto existe para medirlo.
- El adaptador espera exactamente la instruccion `legible.prompt` version 1; cambios en el prompt o en el esquema pueden degradar la salida sin aviso.
- Salida restringida al esquema: no admite campos fuera de la lista, ni formato distinto del JSON compacto entrenado. Devuelve `null` cuando no puede leer, lo que exige una capa de validacion posterior.
- Idioma: etiqueta `language: en` aunque los documentos son en indonesio; el soporte multilingue no esta documentado ni evaluado.
- Riesgo de alucinacion: inherente a la generacion autoregresiva de valores numericos; en extraccion de importes un digito inventado tiene impacto contable. Se recomienda validacion cruzada con el total y revision humana en importes altos.
- Licencia: la model card declara apache-2.0 como licencia del modelo base, pero `google/gemma-4-E4B` es un modelo de Google y conviene verificar los terminos de uso de la familia Gemma aplicables antes de un despliegue comercial.
- Datos de entrenamiento: CORD v2 es CC BY 4.0 y exige atribucion a Clova AI (Park et al., 2019); la atribucion debe conservarse en cualquier trabajo derivado.
- Madurez: repositorio creado el 2026-10-25, 0 descargas y 0 valoraciones. No hay evidencia de uso en produccion ni de mantenimiento.
- Longitud de contexto: 12.288 tokens con 1.120 tokens visuales por pagina limita de forma practica el numero de paginas procesables en una sola llamada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Peter-A-P/legible-4b-cord-v1120-s0-7695d3c79b
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Modelo base (revision usada): https://huggingface.co/google/gemma-4-E4B/tree/411aa17b749aa952df1359d2dcea73917a544d9a
- Plantilla de chat: https://huggingface.co/google/gemma-4-E4B-it/tree/ee0ef6023621cff504d758262d4e04895a5af4a2
- Dataset CORD v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Dataset CORD v2 (commit usado): https://huggingface.co/datasets/naver-clova-ix/cord-v2/tree/7f0115a4b758a71d6473b8d085751692da2fef98
- Repositorio y README de CORD (Clova AI): https://github.com/clovaai/cord
- Licencia CC BY 4.0: http://creativecommons.org/licenses/by/4.0/
- Referencia del dataset: Park et al., "CORD: A Consolidated Receipt Dataset for Post-OCR Parsing", 2019

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos resultados obtenidos tratan sobre el nombre propio "Peter" y no se han utilizado.
