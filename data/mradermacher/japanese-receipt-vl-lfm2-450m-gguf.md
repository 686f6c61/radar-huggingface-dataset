# mradermacher/Japanese-Receipt-VL-lfm2-450M-GGUF

## Resumen

Japanese-Receipt-VL-lfm2-450M-GGUF es la version cuantizada en formato GGUF del modelo multimodal Japanese-Receipt-VL-lfm2-450M, desarrollado originalmente por el usuario sabaridsnfuji y empaquetado por mradermacher. Se trata de un modelo vision-lenguaje especializado en el reconocimiento optico de caracteres (OCR) y la extraccion estructurada de datos de recibos y tickets japoneses, construido mediante fine-tuning con LoRA sobre el modelo base LFM2-VL de 450M de parametros. El resultado es un modelo compacto de 354 millones de parametros efectivos en safetensors que acepta imagen y texto como entrada y genera texto.

El modelo resuelve un problema muy concreto: la digitalizacion automatica de recibos japoneses, un caso de uso frecuente en contabilidad, gestion de gastos corporativos y aplicaciones de finanzas personales en Japon. Al estar especializado y ser tan pequeno, puede desplegarse en hardware modesto, incluso en CPU o GPUs de consumo, lo que lo hace atractivo para procesamiento por lotes de documentos a gran escala sin depender de APIs externas.

La relevancia actual del modelo radica en su tamano reducido (menos de 0,5 GB en cuantizaciones Q4) combinado con capacidades multimodales especificas de dominio. No es un modelo de proposito general, sino una herramienta de extraccion de informacion optimizada para un formato documental concreto en un idioma concreto, lo que permite integrarlo en pipelines de document AI con requisitos de latencia y coste muy bajos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), fine-tuning LoRA sobre LFM2-VL |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en LFM2-VL, una arquitectura transformer multimodal que combina un codificador visual con un modelo de lenguaje para tareas de image-text-to-text. Sobre esta base, el autor original aplico un fine-tuning con LoRA (Low-Rank Adaptation) utilizando el dataset `japanese-receipts`, especializando el modelo en la lectura y extraccion de campos de recibos japoneses. El modelo resultante conserva la estructura del LFM2-VL original pero con los adaptadores LoRA fusionados en los pesos.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card original solo indica el dataset utilizado (`japanese-receipts`) y la tecnica de fine-tuning (LoRA). El proceso de cuantizacion realizado por mradermacher es estatico (sin imatrix), segun se indica en la propia model card del repositorio GGUF.

## Capacidades

- Generacion de texto condicionada por imagen: el modelo acepta una imagen de un recibo o ticket japones y genera texto descriptivo o estructurado con la informacion extraida.
- OCR y extraccion de campos: lectura de texto impreso en recibos japoneses, incluyendo importes, fechas, nombres de comercios, impuestos y lineas de detalle.
- Comprension de documentos: interpretacion de la estructura visual de un recibo para localizar y relacionar campos.
- Multilingue limitado: soporta japones e ingles, con el japones como idioma principal de especializacion.
- Conversacional: etiquetado como `conversational`, admite interaccion multi-turno sobre la imagen de entrada.
- No se ha documentado soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode).
- No se ha documentado soporte de audio ni de vision mas alla de la lectura de documentos.

## Casos de uso

- Digitalizacion masiva de recibos en contabilidad: el modelo procesa lotes de imagenes de tickets japoneses y extrae los campos relevantes para volcarlos en un ERP o sistema de gestion de gastos. Su tamano reducido permite ejecutar el pipeline en CPU o en una sola GPU de consumo.
- Aplicaciones de finanzas personales: integracion en apps moviles o web donde el usuario fotografia un ticket y la aplicacion obtiene automaticamente el importe, la fecha y el comercio. La cuantizacion Q4 (0,3 GB) permite incluso despliegue en dispositivos con recursos limitados.
- Automatizacion de la gestion de gastos corporativos: procesamiento por lotes de los recibos enviados por empleados para reembolso, reduciendo la revision manual y alimentando sistemas de conciliacion contable.
- Extraccion de datos para analitica de gastos: conversion de archivos de recibos en datos tabulares para analisis de patrones de consumo, categorizacion de gastos y generacion de informes.
- Preprocesamiento en pipelines de document AI: uso del modelo como primer paso de OCR especializado antes de un modelo de lenguaje mayor que estructure o valide la informacion extraida.
- Prototipado rapido y pruebas de concepto: gracias a su licencia Apache 2.0 y su bajo coste de inferencia, sirve para validar flujos de digitalizacion de recibos antes de invertir en modelos mayores o servicios en la nube.
- Procesamiento offline o en el borde: al caber en cuantizaciones de menos de 0,5 GB, puede desplegarse en entornos sin conectividad o con requisitos de privacidad estrictos, donde los datos no pueden salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en cuantizaciones Q4-Q8; alrededor de 1,5-2 GB en f16 incluyendo el proyector multimodal (mmproj).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores son mas que suficientes. Tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF y modelos multimodales (requiere cargar tambien el archivo mmproj). Para el modelo base en safetensors, transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al tratarse de un modelo de 354M de parametros, se espera una latencia baja, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|---|
| Japanese-Receipt-VL-lfm2-450M (este) | 354M | no disponible | ja, en | Apache 2.0 | GGUF, safetensors | OCR de recibos japoneses |
| Modelo base LFM2-VL | no disponible | no disponible | no disponible | no disponible | safetensors | Vision-lenguaje general |
| Alternativas de OCR multimodal de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible | OCR general |

No se dispone de informacion suficiente sobre modelos comparables de la misma categoria (OCR especializado en recibos japoneses de menos de 1B de parametros) en la informacion proporcionada. Las alternativas habituales serian modelos de vision-lenguaje de mayor tamano (como Qwen2-VL o PaliGemma), pero no se han aportado datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado para recibos japoneses; su rendimiento en otros tipos de documentos o idiomas sera probablemente muy inferior.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar campos, importes o fechas que no aparecen en la imagen, especialmente con imagenes de baja calidad o recibos poco legibles.
- Sesgos de dominio: el dataset `japanese-receipts` puede no cubrir todos los formatos de recibo, comercios o tipografias de Japon, lo que limita la generalizacion.
- Limitaciones de contexto e idioma: no se ha documentado la longitud de contexto; el soporte se limita a japones e ingles.
- Cuantizaciones estaticas: las cuantizaciones de este repositorio no usan imatrix, por lo que las de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la precision en la extraccion de texto.
- Dependencia del proyector multimodal: es necesario cargar el archivo mmproj junto con el modelo; un despliegue incorrecto puede impedir el procesamiento de imagenes.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar la procedencia del dataset de entrenamiento y del modelo base por si hubiera restricciones adicionales no reflejadas en la model card.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precision en OCR o extraccion de campos, por lo que se recomienda evaluar el modelo con un conjunto propio antes de usarlo en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Japanese-Receipt-VL-lfm2-450M-GGUF
- Modelo base: https://huggingface.co/sabaridsnfuji/Japanese-Receipt-VL-lfm2-450M
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Japanese-Receipt-VL-lfm2-450M-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
