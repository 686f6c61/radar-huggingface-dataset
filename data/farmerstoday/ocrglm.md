# FarmersToday/OCRGLM

## Resumen

OCRGLM es una conversión a ONNX del modelo multimodal GLM-OCR (upstream `zai-org/GLM-OCR`), publicada por FarmersToday dentro de su iniciativa Open AgTech. El modelo resuelve el problema de extracción estructurada de información a partir de documentos del sector agrario: etiquetas de fitosanitarios, tickets de báscula de grano, recetas veterinarias, informes de laboratorio de suelos e invoices de suministros. Su interés radica en que empaqueta un pipeline OCR multimodal completo en formato ONNX con variantes FP32 e INT8, lo que permite desplegarlo en servidores de explotación y tablets de campo sin depender de runtimes de PyTorch.

Arquitectónicamente combina un backbone visual CogViT a resolución de entrada 896x896 con un decodificador autoregresivo GLM-0.5B, es decir, un modelo de aproximadamente 0.5 mil millones de parámetros en su componente lingüístico. El repositorio ocupa 1.0 GB e incluye los grafos ONNX separados para visión y decodificador, en precisión completa y cuantización dinámica INT8.

La relevancia actual es doble: por un lado, demuestra el patrón de especialización vertical de modelos OCR generalistas mediante conversión y cuantización; por otro, cubre un nicho documental (agroalimentario) con campos regulatorios muy concretos (PHI, REI, números de registro EPA/PCP/BVL/MAPA) que los OCR genéricos no suelen estructurar. La licencia Apache 2.0 heredada facilita el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal visión-lenguaje: backbone visual CogViT + decodificador autoregresivo GLM-0.5B |
| Parámetros totales | No disponible (el decodificador es GLM-0.5B; no se especifica el total incluyendo visión) |
| Parámetros activos | No disponible (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP32 y INT8 (cuantización dinámica) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`glm_ocr_vision.onnx`, `glm_ocr_vision_int8.onnx`, `glm_ocr_decoder.onnx`, `glm_ocr_decoder_int8.onnx`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas típico en OCR multimodal: un codificador visual CogViT que procesa la imagen a 896x896 píxeles y un decodificador transformer autoregresivo GLM-0.5B que genera la secuencia de texto estructurado. La conversión a ONNX separa ambos componentes en grafos independientes, lo que permite ejecutar la parte visual y la lingüística con distinta precisión (por ejemplo, visión en FP32 y decodificador en INT8) según las restricciones de memoria del dispositivo.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El autor indica que el modelo es una conversión y cuantización del checkpoint upstream `zai-org/GLM-OCR`, sin reentrenamiento específico declarado para el dominio agrario: la especialización procede de la selección de casos de uso documentados (etiquetas de agroquímicos, tickets de báscula, recetas veterinarias, informes de suelo e invoices), no de un fine-tuning descrito en la model card.

## Capacidades

- Extracción de texto desde imágenes de documentos (image-to-text) con salida estructurada por campos.
- Lectura de etiquetas de contenedores de agroquímicos: números de registro regulatorio (EPA, PCP, BVL, MAPA), ingredientes activos y formulaciones, intervalos de pre-cosecha (PHI) y de reentrada de trabajadores (REI), zonas de amortiguación para cursos de agua.
- Procesamiento de tickets de báscula de grano: pesos bruto, tara y neto en unidades métricas, humedad %, peso específico (kg/hL), proteína %, impurezas %, matrícula de vehículo y ruta a silo.
- Lectura de recetas veterinarias: identificadores de crotal, cohortes de rebaño, principios activos, pautas de dosificación y días de retirada de leche y carne.
- Interpretación de informes de laboratorio de suelos y tejidos: pH, materia orgánica (SOM %), CEC y macronutrientes/micronutrientes (N, P, K, Ca, Mg, S, Zn, B).
- Extracción de líneas de detalle en facturas y albaranes de suministro: ítems de químicos, fertilizantes y semillas, códigos de lote y desglose de impuestos.
- Capacidades multilingües limitadas a inglés y chino.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni modo thinking en la información disponible.

## Casos de uso

- Digitalización de etiquetas de fitosanitarios en campo: el operario fotografía la etiqueta con una tablet y el modelo extrae el número de registro, ingrediente activo y PHI/REI, alimentando un registro de trazabilidad que evita introducir manualmente datos regulatorios críticos.
- Automatización de entradas de báscula en silos y cooperativas: el modelo lee el ticket de pesaje y extrae peso bruto, tara, neto, humedad y proteína, integrándose con el ERP de la cooperativa para liquidar entregas de grano sin transcripción manual.
- Verificación de recetas veterinarias en explotaciones ganaderas: a partir de la foto de la receta se extraen crotal, fármaco y días de retirada, lo que permite bloquear automáticamente la salida de leche o carne hasta cumplir el periodo de supresión.
- Procesamiento de informes de laboratorio de suelos para recomendación de fertilización: el modelo extrae pH, SOM, CEC y valores de nutrientes y los vuelca en una hoja de cálculo o en un motor de recomendación agronómica que calcula dosis de abonado.
- Conciliación de facturas de proveedores de insumos: lectura de líneas de detalle, códigos de lote y desglose de impuestos para cotejar contra el pedido de compra y detectar discrepancias en la recepción de químicos, fertilizantes o semillas.
- Despliegue en servidores de explotación y tablets de campo sin GPU dedicada: al disponer de grafos ONNX INT8, el pipeline puede ejecutarse en hardware modesto mediante ONNX Runtime, lo que encaja en escenarios de conectividad intermitente donde no es viable enviar imágenes a la nube.
- Auditoría documental de cumplimiento regulatorio: extracción masiva de campos regulatorios de un archivo histórico de etiquetas y albaranes para preparar inspecciones o certificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud, un decodificador de 0.5B parámetros en FP32 ocupa aproximadamente 2 GB solo en pesos, más el backbone visual CogViT a 896x896; la variante INT8 reduce sustancialmente la huella del decodificador. Estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, el modelo es apto para GPU de consumo y para aceleradores de borde; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más en FP32 y en GPUs de gama media/baja con la variante INT8, aunque el autor no publica cifras de VRAM medidas.
- Opciones de despliegue: ONNX Runtime es el runtime natural dado el formato de pesos; también es posible usar otros ejecutores compatibles con ONNX. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| OCRGLM (FarmersToday) | OCR multimodal especializado en agro | GLM-0.5B en decodificador; total no disponible | No disponible | en, zh | Apache 2.0 | ONNX (FP32/INT8) |
| zai-org/GLM-OCR (upstream) | OCR multimodal generalista | No disponible en la información | No disponible | No disponible en la información | No disponible en la información | Pesos originales (no ONNX) |
| OCR genéricos basados en transformers VLM | OCR multimodal | Variable | Variable | Multilingüe | Variable | safetensors, GGUF, ONNX |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se han publicado métricas de precisión ni de rendimiento para OCRGLM, y del modelo upstream solo se conoce su identificador. La diferencia funcional principal frente al upstream es el empaquetado ONNX con cuantización INT8 y la orientación documental al dominio agrario.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino: no se declara soporte de castellano, lo que es un caveat importante para documentos regulatorios españoles (MAPA) o latinoamericanos.
- No se han publicado métricas de precisión (CER, WER, exactitud por campo) ni benchmarks, por lo que el rendimiento real en documentos agrarios no está cuantificado.
- Riesgo de alucinación en campos numéricos críticos (PHI, REI, dosis, días de retirada, pesos): cualquier salida debe validarse contra el documento original antes de usarse en decisiones regulatorias o de seguridad alimentaria.
- La cuantización INT8 dinámica puede degradar la precisión en texto pequeño o de baja calidad; conviene comparar FP32 e INT8 sobre el corpus propio antes de desplegar.
- La especialización agraria procede de la documentación de casos de uso, no de un fine-tuning descrito; no hay garantía de que el modelo supere a un OCR generalista en estos documentos.
- Solo 19 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado y sin retroalimentación de la comunidad.
- Repositorio de 1.0 GB: la variante FP32 puede ser pesada para dispositivos de borde con almacenamiento reducido.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar la licencia del checkpoint upstream `zai-org/GLM-OCR` y de sus datos de entrenamiento antes de un despliegue en producción.
- No se documenta soporte de tool calling ni de agentes, por lo que la integración en pipelines requiere orquestación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FarmersToday/OCRGLM
- Modelo base upstream: https://huggingface.co/zai-org/GLM-OCR
- Modelo complementario de patología vegetal: https://huggingface.co/farmerstoday/plant-disease-recognition-onnx
- Modelo complementario de segmentación de malas hierbas: https://huggingface.co/farmerstoday/weed-segmentation-yolov8-onnx
- Modelo complementario de condición corporal del ganado: https://huggingface.co/farmerstoday/livestock-bcs-onnx
