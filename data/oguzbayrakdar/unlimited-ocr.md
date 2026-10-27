# Oguzbayrakdar/Unlimited-OCR

## Resumen

Unlimited-OCR es un modelo vision-language de reconocimiento óptico de caracteres (OCR) desarrollado por Baidu, presentado el 22 de junio de 2026 como una evolución de DeepSeek-OCR. Su objetivo declarado es el "one-shot long-horizon parsing": convertir documentos completos, incluidas varias páginas o PDFs enteros, en texto estructurado en una sola pasada, atacando los cuellos de botella de memoria y velocidad que aparecen al procesar documentos largos con modelos de OCR autorregresivos convencionales.

Arquitectónicamente es un transformer con mezcla de expertos (MoE) de aproximadamente 3.300 millones de parámetros totales y unos 500 millones activos por token, lo que reduce el coste computacional por paso frente a un modelo denso del mismo tamaño. Incorpora un mecanismo de atención propio denominado Reference Sliding Window Attention, que según la información pública es la pieza clave para mantener la coherencia en documentos extensos.

El modelo se distribuye con licencia MIT, pesos en safetensors y soporte para transformers, vLLM, SGLang, ModelScope y Baidu Cloud, además de entrenamiento mediante ms-swift. La ficha que nos ocupa, `Oguzbayrakdar/Unlimited-OCR`, es una réplica no oficial del repositorio `baidu/Unlimited-OCR` con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer con mezcla de expertos (MoE) y atencion Reference Sliding Window Attention, derivada de DeepSeek-OCR |
| Parametros totales | 3.336.106.240 (segun los safetensors del repositorio) |
| Parametros activos | Aproximadamente 500 millones |
| Longitud de contexto | No documentada de forma explicita; los ejemplos de inferencia de la model card fijan `max_length=32768` |
| Tipos de cuantizacion | No disponible (la model card solo documenta `torch.bfloat16`) |
| Idiomas soportados | Multilingue (sin listado cerrado de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors, con codigo custom (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo sigue la estela de DeepSeek-OCR: un encoder visual acoplado a un decoder de lenguaje con mezcla de expertos. El dato más relevante es la relación entre parámetros totales (unos 3,34 mil millones) y activos (unos 0,5 mil millones), una ratio típica de MoE de grano fino que abarata la inferencia sin reducir la capacidad nominal del modelo. La innovación técnica destacada por la información pública es la Reference Sliding Window Attention, diseñada para que el modelo mantenga referencias estables sobre páginas y regiones ya procesadas a medida que avanza por el documento, en lugar de degradar la calidad o disparar el consumo de memoria conforme crece la secuencia.

La model card documenta dos configuraciones de preprocesado de imagen: `gundam` (base_size 1024, image_size 640, crop_mode activo) pensada para imágenes sueltas, y `base` (base_size 1024, image_size 1024, sin crop) empleada para el modo multipágina y PDF. También expone parámetros de control de repetición (`no_repeat_ngram_size` y `ngram_window`) ajustados de forma distinta en modo página única (35 y 128) y multipágina (35 y 1024), lo que sugiere que las secuencias largas son un escenario de primera clase en el diseño.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco se detalla el proceso de alineación ni el corpus multilingüe empleado.

## Capacidades

- Parseo de documentos en imagen a texto estructurado mediante el prompt `document parsing.`, con soporte para guardar el resultado en disco (`save_results`, `output_path`).
- Parseo multipágina en una sola llamada (`infer_multi`) con el prompt `Multi page parsing.`, orientado a documentos de varias páginas.
- Procesamiento de PDF completo mediante conversión previa de páginas a imágenes (PyMuPDF a 300 dpi en el ejemplo oficial) y posterior inferencia multipágina.
- Dos modos de imagen conmutables (`gundam` y `base`) según se priorice velocidad o resolución.
- Control de repeticiones configurable mediante `no_repeat_ngram_size` y `ngram_window`, relevante en generaciones largas.
- Capacidad multilingüe declarada, aunque sin listado explícito de idiomas ni evaluación por idioma.
- Soporte de entrenamiento y ajuste fino a través de ms-swift.
- Despliegue servido mediante vLLM (con imágenes Docker oficiales) y SGLang (wheel local), además de transformers.
- No se documentan tool calling, function calling, comportamiento agéntico, modo thinking, audio ni vídeo. Las etiquetas de HuggingFace incluyen `conversational` y `feature-extraction`, pero la model card no describe ninguna interfaz conversacional ni de extracción de embeddings.

## Casos de uso

- Digitalización masiva de archivos PDF escaneados: el modelo convierte cada página a imagen y procesa el documento completo con `infer_multi`, evitando concatenar llamadas independientes por página y reduciendo el riesgo de perder contexto entre páginas.
- Extracción de tablas y formularios en back-office: facturas, albaranes y extractos bancarios pueden parsearse a texto estructurado y volcarse a un pipeline de validación, aprovechando que el modelo mantiene la estructura visual en resoluciones de 1024 px.
- Ingesta documental para sistemas RAG: la salida del OCR alimenta un pipeline de chunking y embeddings, y el modo multipágina reduce el número de llamadas necesarias frente a soluciones página a página.
- Digitalización de fondos históricos o multilingües: la capacidad multilingüe declarada permite abordar corpus con varios idiomas en un mismo lote sin cambiar de modelo.
- Procesamiento de documentación técnica extensa (manuales, normativa, contratos): el enfoque "one-shot long-horizon" está pensado precisamente para documentos donde los OCR por página pierden numeración, encabezados y referencias cruzadas.
- Despliegue on-premise con requisitos de soberanía del dato: al tratarse de un MoE de unos 500 millones de parámetros activos y licencia MIT, es viable servirlo en una GPU de gama alta para uso interno sin depender de APIs de terceros.
- Ajuste fino de dominio con ms-swift: equipos con documentación muy específica (informes clínicos, expedientes legales) pueden reentrenar el modelo sobre su propio corpus.
- Servicio de OCR como API interna: el soporte de vLLM y SGLang permite exponer el modelo con un servidor compatible con la API de OpenAI y escalar horizontalmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y el repositorio de GitHub se limitan a afirmar que el modelo lleva a DeepSeek-OCR "un paso más allá" y a describir mejoras cualitativas en memoria y velocidad para documentos largos, sin cifras de MMLU, HumanEval, GSM8K ni métricas específicas de OCR (CER, WER, TEDS u otras). No se han incluido tablas comparativas de rendimiento.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 7 GB solo para los pesos (el repositorio ocupa 6,8 GB) más el encoder visual, activaciones y caché KV; con `max_length=32768` conviene reservar entre 10 y 16 GB según lote y longitud de documento.
- GPU recomendadas para producción: A100 40/80 GB o H100 para servir con vLLM o SGLang y lotes concurrentes; el repositorio publica una imagen Docker específica para Hopper (`vllm/vllm-openai:unlimited-ocr-cu129`) y otra por defecto con CUDA 13.0.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) con margen amplio, y en tarjetas de 16 GB (RTX 4080, RTX 4070 Ti Super) si se limita la longitud de secuencia o el número de páginas por llamada. En tarjetas de 12 GB el modo multipágina con 32k de contexto puede quedarse corto.
- Opciones de despliegue: transformers (versiones probadas: torch 2.10.0, torchvision 0.25.0, transformers 4.57.1, Pillow 12.1.1, PyMuPDF 1.27.2.2), vLLM con receta oficial, SGLang con wheel local y `kernels` fijado, ModelScope y Baidu Cloud. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Requisito adicional: el modelo usa código custom, por lo que es necesario `trust_remote_code=True` en la carga con transformers.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de páginas por minuto.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unlimited-OCR (Baidu) | 3.336.106.240 | ~500 M | Hasta 32768 tokens en los ejemplos de inferencia | MIT | HuggingFace, ModelScope, vLLM, SGLang, Baidu Cloud |
| DeepSeek-OCR (modelo base declarado) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Repositorio publico de DeepSeek |
| Otros OCR vision-language (olmOCR, dots.ocr, PaddleOCR-VL) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa relevante es con DeepSeek-OCR, del que Unlimited-OCR se declara heredero directo y al que pretende superar en procesamiento de documentos largos. No se han publicado tablas de comparación con cifras frente a ese modelo ni frente a alternativas comerciales o abiertas, por lo que no es posible establecer una comparación cuantitativa con la información disponible.

## Limitaciones y advertencias

- El repositorio analizado (`Oguzbayrakdar/Unlimited-OCR`) no es el oficial: es una réplica de `baidu/Unlimited-OCR` con 0 descargas y 0 likes. Para producción debe usarse el repositorio del autor original, que es el que recibe actualizaciones y soporte.
- Requiere ejecutar código custom (`trust_remote_code=True`), lo que implica confiar en el código del repositorio; conviene auditar la revisión concreta antes de desplegarlo.
- No hay datos publicados de sesgos. Al ser un modelo multilingüe sin listado de idiomas, el rendimiento puede variar mucho entre lenguas y alfabetos, y no está cuantificado.
- Riesgo de alucinación inherente a los modelos de lenguaje: en OCR, esto se manifiesta como texto inventado, líneas duplicadas o saltos de estructura en documentos degradados, borrosos o con tablas complejas. El propio modelo incorpora parámetros anti-repetición, lo que sugiere que las repeticiones son un fallo conocido.
- La longitud de contexto no está documentada formalmente; los 32.768 tokens provienen del parámetro `max_length` de los ejemplos. Superar ese límite en documentos muy largos requerirá trocear y podría romper la coherencia entre páginas.
- Las etiquetas de HuggingFace (`feature-extraction`) y el pipeline declarado (`image-text-to-text`) no coinciden plenamente con las capacidades descritas en la model card; conviene validar el comportamiento real antes de asumir funcionalidades de extracción de embeddings.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar igualmente las licencias de las dependencias y del código custom distribuido con los pesos.
- No se documentan métricas de calidad ni comparativas cuantitativas, por lo que la elección frente a otras alternativas debe basarse en una evaluación propia sobre el corpus objetivo.
- El soporte de SGLang depende de un wheel local y de una versión fijada de `kernels`, lo que añade fragilidad en el mantenimiento del entorno.

## Enlaces

- Repositorio de HuggingFace analizado: https://huggingface.co/Oguzbayrakdar/Unlimited-OCR
- Repositorio oficial en HuggingFace: https://huggingface.co/baidu/Unlimited-OCR
- Repositorio de código en GitHub: https://github.com/baidu/Unlimited-OCR
- Paper en arXiv: https://arxiv.org/abs/2606.23050
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR
- Modelo en ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR
- Receta de despliegue en vLLM: https://recipes.vllm.ai/baidu/Unlimited-OCR
- Documentación en Baidu Cloud: https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
- Repositorio ms-swift: https://github.com/modelscope/ms-swift
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Repositorio DeepSeek-OCR (modelo base): https://github.com/deepseek-ai/DeepSeek-OCR
- Cuenta oficial de Baidu en X: https://x.com/Baidu_Inc
- Ficha en Trendshift: https://trendshift.io/repositories/62053
- Réplica no oficial en GitHub: https://github.com/Marulab-Design/unlimited-ocr
- Entrada en Baidu Baike: https://baike.baidu.com/en/item/Unlimited%20OCR/2567993
- Entrada en Learn AI: https://ai.miraheze.org/wiki/Unlimited-OCR
