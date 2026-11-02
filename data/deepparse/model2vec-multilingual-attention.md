# deepparse/model2vec-multilingual-attention

## Resumen

deepparse/model2vec-multilingual-attention es un modelo especializado en el análisis y etiquetado de direcciones postales (address parsing), desarrollado por el equipo de deepparse. No es un modelo generativo de propósito general, sino un sistema Seq2Seq con mecanismo de atención entrenado específicamente para descomponer una dirección en sus componentes estructurados (nombre de calle, municipio, código postal, etc.). Emplea embeddings estáticos Model2Vec derivados de minishlab/potion-multilingual-128M, con 256 dimensiones, lo que reduce drásticamente el coste computacional frente a transformers convencionales.

El modelo resuelve un problema muy concreto y con demanda real en producción: la normalización y estructuración de direcciones en 20 países distintos, con soporte para direcciones completas e incompletas. Con 15,76 millones de parámetros y un tamaño de repositorio de 0,1 GB, está diseñado para desplegarse en entornos con recursos limitados, incluso en CPU.

Su relevancia radica en la combinación de un rendimiento alto (98,59 % de accuracy por palabra en test) con un coste de inferencia muy bajo, gracias al uso de embeddings estáticos en lugar de un encoder transformer pesado. La licencia MIT facilita su adopción comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seq2Seq (encoder-decoder) con mecanismo de atención; embeddings estáticos Model2Vec (potion-multilingual-128M, 256 dim.) |
| Parametros totales | 15.761.417 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | multilingüe (20 países en el dataset de entrenamiento); lista explícita no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (pytorch_model_hub_mixin, model_hub_mixin) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Seq2Seq con encoder y decoder de una sola capa cada uno, con un tamaño oculto de 1024 y un mecanismo de atención que conecta ambos. La entrada no se procesa mediante un transformer: se utilizan embeddings estáticos Model2Vec de 256 dimensiones derivados de minishlab/potion-multilingual-128M, lo que elimina el coste de un encoder neuronal profundo y permite una inferencia muy rápida incluso en CPU.

El entrenamiento se realizó sobre el dataset deepparse/worldwide-addresses, compuesto por 20 países con 100.000 direcciones limpias y 50.000 incompletas por país, con un split del 90 % para entrenamiento y 10 % para validación. Durante el preprocesado, las etiquetas `Suburb` y `District` se mapean a `Municipality`, y se eliminan las palabras correspondientes a `County` y `Country`. La selección de hiperparámetros se hizo evaluando tamaños ocultos de 128, 256, 512 y 1024 con 5 semillas, escogiendo la configuración con menor pérdida media de validación y, dentro de ella, la semilla con menor pérdida (semilla 42, mejor época 39). No se menciona uso de RLHF ni DPO, lo cual es coherente con una tarea de etiquetado supervisado.

## Capacidades

- Análisis y etiquetado de direcciones postales en 20 países, descomponiendo la cadena en componentes estructurados.
- Procesamiento de direcciones completas e incompletas (el dataset incluye 50.000 direcciones incompletas por país).
- Soporte multilingüe heredado de los embeddings potion-multilingual-128M.
- Manejo de variantes de etiquetas: `Suburb` y `District` se normalizan a `Municipality`.
- Inferencia ligera: 15,76 M de parámetros, apto para CPU y entornos sin GPU.
- Integración nativa con la librería deepparse mediante `AddressParser(model_type="model2vec-multilingual", attention_mechanism=True)`.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking: es un modelo de etiquetado, no un LLM generativo.

## Casos de uso

- Normalización de direcciones en comercio electrónico: el modelo recibe direcciones introducidas libremente por usuarios en 20 países y las descompone en campos estructurados (calle, municipio, código postal), lo que permite validarlas y almacenarlas de forma consistente antes del envío.
- Enriquecimiento de bases de datos logísticas: se puede ejecutar por lotes sobre millones de registros de direcciones históricas para separar componentes y detectar duplicados o inconsistencias, gracias a su bajo coste de inferencia en CPU.
- Validación en formularios web: integrado en el backend, permite verificar en tiempo real que una dirección contiene los componentes mínimos exigidos por cada país, señalando campos ausentes en direcciones incompletas.
- Geolocalización y análisis de mercado: al estructurar direcciones de clientes en 20 países, facilita agregaciones por municipio o región para estudios de cobertura y planificación territorial.
- Limpieza de datos en migraciones de CRM/ERP: durante una consolidación de sistemas, el modelo permite parsear direcciones heredadas con formatos heterogéneos y mapearlas a un esquema común.
- Sistemas de atención al cliente: cuando un usuario escribe su dirección en un chat, el modelo la estructura para que el agente o el sistema automatizado pueda consultar el pedido o programar una entrega sin intervención manual.
- Procesamiento de documentos escaneados con OCR: tras extraer el texto de facturas o albaranes, el parser aísla la dirección y sus componentes para su registro contable o logístico.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Accuracy en test (este modelo) | 98,59 % |
| Accuracy en test (media ± desv. típica sobre 5 semillas de esta configuración) | 97,73 ± 1,04 % |
| Accuracy en validación (este modelo) | 98,79 % |

La accuracy se define como la precisión por palabra en el etiquetado sobre el split de test del dataset worldwide-addresses reconstruido. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (15,76 M de parámetros, ~63 MB de pesos); en la práctica cabe en cualquier GPU consumer e incluso en memoria unificada de dispositivos de gama baja.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 1 GB de memoria es suficiente (GTX 1050, RTX 3060, T4, etc.).
- Cabe en GPU consumer: sí, en todas las GPU modernas, y también en CPU sin problemas.
- Opciones de despliegue: librería deepparse (`pip install deepparse[model2vec]`), con soporte de PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño y el uso de embeddings estáticos, se espera una latencia muy baja en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepparse/model2vec-multilingual-attention | 15,76 M | no disponible | 98,59 % | MIT | HuggingFace |
| Otros parsers de deepparse (p. ej. FastText, BPEmb) | no disponible | no disponible | no disponible | MIT | HuggingFace (deepparse) |
| Modelos genéricos de NER (p. ej. spaCy multilingual) | no disponible | no disponible | no disponible | MIT / Apache 2.0 según modelo | HuggingFace / spaCy |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada; la comparativa con otros parsers de la propia familia deepparse queda como referencia cualitativa, no numérica.

## Limitaciones y advertencias

- El dataset de origen no contiene las etiquetas `Orientation` ni `GeneralDelivery`: el modelo tiene esas salidas pero nunca las predice. La orientación de la calle (p. ej. `Ouest` o `NW`) se incluye dentro de `StreetName`.
- Corea del Sur cuenta casi exclusivamente con direcciones incompletas en los datos, lo que puede degradar el rendimiento en direcciones completas de ese país.
- Es un modelo de etiquetado, no un generador: no admite instrucciones libres, tool calling ni razonamiento multi-step; usarlo fuera de la tarea de parsing de direcciones no es adecuado.
- Riesgo de alucinación estructural: al ser Seq2Seq, puede asignar etiquetas incorrectas en direcciones con formatos no vistos o muy alejados de los 20 países de entrenamiento.
- No se documentan sesgos específicos, pero al entrenarse sobre direcciones de 20 países, el rendimiento puede ser desigual entre regiones.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia de los embeddings subyacentes (potion-multilingual-128M) si se redistribuye el modelo.
- No se especifica la longitud máxima de entrada soportada; direcciones extremadamente largas podrían truncarse.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/deepparse/model2vec-multilingual-attention)
- [Documentación de deepparse](https://deepparse.org)
- [Dataset worldwide-addresses](https://huggingface.co/datasets/deepparse/worldwide-addresses)
- [Embeddings minishlab/potion-multilingual-128M](https://huggingface.co/minishlab/potion-multilingual-128M)
