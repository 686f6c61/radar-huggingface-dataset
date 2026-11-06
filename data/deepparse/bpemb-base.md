# deepparse/bpemb-base

## Resumen

deepparse/bpemb-base es un modelo de parsing de direcciones postales desarrollado por el equipo de deepparse (GRAAL-Research), un proyecto de código abierto centrado en el análisis de direcciones multinacionales. El modelo resuelve una tarea de etiquetado de secuencias (sequence-to-sequence) sobre texto de direcciones, asignando cada token a una de ocho categorías: número de calle, nombre de calle, unidad, municipio, provincia, código postal, orientación y entrega general. No es un modelo de lenguaje generativo, sino un componente especializado de extracción de estructura.

Técnicamente se trata de un encoder-decoder LSTM de una capa con tamaño oculto de 1.024, que utiliza embeddings subword multilingües BPEmb de 300 dimensiones (100.000 merges) embebidos por palabra mediante una LSTM bidireccional. Con 11.272.213 parámetros totales, es un modelo muy compacto orientado a producción de bajo coste computacional.

Su relevancia actual radica en que ofrece un rendimiento alto y reproducible en una tarea concreta y de gran valor operativo (normalización de direcciones en logística, banca, seguros o administración pública), con licencia MIT y pesos en safetensors, lo que facilita su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seq2Seq LSTM (encoder-decoder de una capa, sin mecanismo de atención) con embeddings BPEmb |
| Parametros totales | 11.272.213 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los embeddings BPEmb son multilingües y el entrenamiento cubre 20 países) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura sequence-to-sequence clásica: un encoder LSTM de una capa con tamaño oculto de 1.024 procesa la secuencia de entrada, donde cada palabra se representa mediante embeddings subword BPEmb de 300 dimensiones agregados por una LSTM bidireccional. El decoder, también LSTM de una capa, genera la secuencia de etiquetas correspondiente a los ocho campos de dirección más el token de fin de secuencia. No emplea mecanismo de atención, lo que limita el alineamiento explícito entre entrada y salida pero reduce coste y latencia.

El entrenamiento se realizó en 2020 sobre el dataset deepparse-address-data, construido a partir de datos de libpostal y que cubre direcciones de 20 países. No se documenta en la información disponible el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no procede en esta tarea). La innovación técnica principal es el uso de embeddings subword BPEmb multilingües para generalizar entre países con alfabetos y morfologías distintas, tal como se describe en los artículos asociados (arXiv:2006.16152 y arXiv:2112.04008).

## Capacidades

- Parsing de direcciones postales: asigna cada token a una de ocho etiquetas (StreetNumber, StreetName, Unit, Municipality, Province, PostalCode, Orientation y GeneralDelivery) más el fin de secuencia.
- Etiquetado de secuencias multinacional: entrenado con direcciones de 20 países y evaluado en zero-shot sobre 41 países adicionales.
- Manejo de direcciones incompletas: mantiene rendimiento razonable cuando faltan campos (por ejemplo, solo código postal o municipio).
- Procesamiento de texto corto: entrada típica de una sola línea de dirección, sin necesidad de contexto largo.
- Integración programática: se usa mediante la librería deepparse con una API de una sola llamada (`AddressParser(model_type="bpemb")`).
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo thinking; es un modelo discriminativo especializado, no un LLM generativo.
- Capacidades multilingües derivadas de BPEmb, aunque la cobertura idiomática exacta no está documentada.

## Casos de uso

- Normalización de direcciones en logística: el modelo descompone direcciones de envío en campos estructurados antes de validarlas contra una base de datos de rutas, reduciendo errores de entrega en operaciones con direcciones de varios países.
- Onboarding de clientes en banca y seguros: al registrar una dirección, el parser separa municipio, provincia y código postal para validar coherencia y cumplir requisitos KYC, con un coste computacional mínimo por petición.
- Enriquecimiento de datos en CRM: limpieza y estructuración por lotes de direcciones almacenadas como texto libre, habilitando segmentaciones geográficas y análisis de cartera.
- Geocodificación previa: el modelo extrae los componentes de la dirección que después se envían a un geocodificador (Nominatim, Google Maps), mejorando la tasa de acierto al separar número, calle y municipio.
- Cumplimiento normativo y auditoría: estructuración de direcciones en expedientes para informes regulatorios, con trazabilidad campo a campo y sin dependencia de servicios en la nube.
- Procesamiento de formularios y OCR: integración tras un motor de OCR para convertir texto de direcciones escaneadas en registros estructurados en flujos de digitalización documental.
- Sistemas de gestión de direcciones multiidioma: uso en aplicaciones que reciben direcciones de 20 países entrenados y necesitan un parser ligero que quepa en infraestructura modesta.

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Resultado |
|---|---|---|
| 20 países de entrenamiento, direcciones limpias | Precisión media por país | 98,71 % (rango 96,97 %–99,99 %) |
| 20 países de entrenamiento, direcciones incompletas | Precisión media por país | 98,24 % (rango 95,20 %–99,89 %) |
| 41 países zero-shot | Precisión media por país | 70,91 % (rango 34,97 %–94,46 %) |
| worldwide-addresses test split (20 países, limpias e incompletas, 260.000 direcciones) | Precisión por palabra | 94,66 % (medido en noviembre de 2026) |

No se han publicado en la información disponible resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) porque el modelo no realiza esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (11,3 M de parámetros); en la práctica cabe en CPU sin GPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es más que suficiente, e incluso innecesaria.
- Cabe en cualquier GPU consumer y en entornos sin GPU; es apto para despliegue en contenedores ligeros y dispositivos de borde.
- Opciones de despliegue: librería deepparse (PyTorch); no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en CPU, aunque no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepparse/bpemb-base | 11,3 M | no disponible | 98,71 % en países de entrenamiento (limpias) | MIT | Hugging Face |
| deepparse/fasttext | no disponible en la información | no disponible | no disponible | MIT (proyecto deepparse) | Hugging Face |
| deepparse/bpemb-attention | no disponible en la información | no disponible | no disponible | MIT (proyecto deepparse) | Hugging Face |
| libpostal (modelo estadístico) | no disponible | no disponible | no disponible | MIT | Código abierto |

La comparación con alternativas genéricas de parsing de direcciones (libpostal) o con otras variantes del propio proyecto deepparse no puede cuantificarse con los datos disponibles; se indica "no disponible" donde no hay cifras.

## Limitaciones y advertencias

- Rendimiento notablemente inferior en direcciones incompletas (por ejemplo, solo código postal o municipio) frente a direcciones completas, según la propia model card.
- En la práctica rara vez predice las etiquetas Orientation y GeneralDelivery: en noviembre de 2026 no las predijo en 12.000 direcciones del test split worldwide-addresses ni en casos típicos como "Ouest", "NW" o "PO Box".
- Rendimiento zero-shot limitado y muy variable entre países (34,97 %–94,46 %), por lo que no debe asumirse buena cobertura fuera de los 20 países de entrenamiento.
- Riesgo de errores en direcciones con formatos atípicos, abreviaturas locales o ruido de OCR; no se documentan sesgos específicos, pero la cobertura geográfica desigual puede introducir sesgo por país.
- Licencia MIT: permite uso comercial sin restricciones significativas, aunque se recomienda conservar el aviso de copyright.
- No es un modelo generativo ni conversacional; no debe emplearse para tareas de lenguaje general, tool calling o agentes.
- La longitud de contexto y los idiomas exactos no están documentados, lo que dificulta planificar su uso con entradas muy largas o idiomas no cubiertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deepparse/bpemb-base
- Documentación de deepparse: https://deepparse.org
- Página de resultados: https://deepparse.org/results.html
- Dataset de entrenamiento: https://github.com/GRAAL-Research/deepparse-address-data
- Dataset worldwide-addresses: https://huggingface.co/datasets/deepparse/worldwide-addresses
- Embeddings BPEmb: https://nlp.h-its.org/bpemb/
- Artículo "Leveraging Subword Embeddings for Multinational Address Parsing": https://arxiv.org/abs/2006.16152
- Artículo "Multinational Address Parsing: A Zero-Shot Evaluation": https://arxiv.org/abs/2112.04008
- Repositorio libpostal: https://github.com/openvenues/libpostal
