# DakeraAI/gliner-bi-small-v2.0-int8

## Resumen

DakeraAI/gliner-bi-small-v2.0-int8 es una compilación cuantizada a int8 en formato ONNX del modelo knowledgator/gliner-bi-small-v2.0, un extractor de entidades nombradas en modo zero-shot basado en GLiNER. Lo publica Dakera, empresa que comercializa un motor de memoria autoalojado para agentes de IA, y lo emplea como extractor de entidades por defecto en sus despliegues con modelos de embedding en inglés. El modelo original, desarrollado por Knowledgator, emplea una arquitectura de transformer bidireccional (bi-encoder) que permite detectar entidades de etiquetas arbitrarias sin reentrenamiento.

La relevancia de esta versión radica en su eficiencia: 117,6 MB de grafos ONNX en total, inferencia rápida en CPU (0,013 s de mediana por petición en el conjunto de chat de Dakera) y una fidelidad prácticamente exacta respecto al checkpoint original en PyTorch (correlación de logits de al menos 0,999 y el 100 % de las entidades idénticas en las pruebas multilingües). Está pensada para integrarse en pipelines de memoria de agentes, etiquetado de documentos y extracción de entidades en entornos autoalojados donde no se dispone de GPU.

El contexto es limitado (spans de hasta 12 palabras por entidad) y el soporte multilingüe es desigual, con rendimiento alto en inglés y aceptable en alemán, francés e italiano, pero prácticamente nulo en hindi y chino según las métricas publicadas por el propio autor de la compilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional bi-encoder (GLiNER), con cabeza de spans factorizada |
| Parametros totales | no disponible (repo de 0,1 GB; grafos ONNX de 80,6 MB + 37,1 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (spans de hasta 12 palabras por entidad) |
| Tipos de cuantizacion | int8 block-wise (MatMulNBits, bloque 32, simétrico), embeddings int8 por fila, activaciones FP32 |
| Idiomas soportados | en (entrenamiento); evaluación adicional en de, es, fr, hi, it, pt, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx, labels_encoder.onnx) + tokenizers JSON |

## Arquitectura y entrenamiento

El modelo subyacente es GLiNER (Generalist Model for Named Entity Recognition using Bidirectional Transformer), presentado por Zaratiana et al. (arXiv:2311.08526). Se trata de un bi-encoder: el texto se codifica sin prompt de etiquetas y las etiquetas se codifican por separado como vectores (un vector por etiqueta mediante `labels_encoder.onnx`). La cabeza de spans puntúa cada par (span de texto, vector de etiqueta) y aplica una sigmoide con umbral 0,5. Esto permite reconocimiento zero-shot de cualquier etiqueta sin reentrenamiento.

La compilación de Dakera introduce dos optimizaciones principales. Primero, factoriza exactamente la cabeza de spans: la primera capa densa se descompone en una parte de inicio y otra de fin calculadas una vez por palabra, y la última se pliega en el lado de las etiquetas, de modo que el coste pasa de por-span a por-palabra con una diferencia máxima de logits de 3,8e-06. Segundo, cuantiza a 8 bits las matrices de pesos del encoder y de las cabezas (MatMulNBits, bloque 32, simétrico) y la tabla de embeddings por fila, manteniendo las activaciones en FP32 para no degradar la detección. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Extracción de entidades nombradas zero-shot con etiquetas definidas en tiempo de inferencia (persona, organización, lugar y cualquier etiqueta arbitraria).
- Codificación de etiquetas reutilizable: un vector por etiqueta que se calcula una vez y se reutiliza para todos los textos.
- Procesamiento de texto en inglés con calidad alta y cobertura parcial en alemán, francés, italiano, español y portugués.
- Segmentación de palabras específica: secuencias de letras, marcas y dígitos unidas por `-` o `_`, caracteres sueltos y caracteres chinos o japoneses individuales.
- Spans de hasta 12 palabras por entidad con umbral de decisión configurable (por defecto 0,5).
- Inferencia en CPU con ONNX Runtime, con prepacking de pesos activado por defecto (desactivarlo multiplica por 4-5 la latencia).
- Integración como extractor por defecto en el motor de memoria de agentes de Dakera, etiquetando memorias en segundo plano.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Memoria de agentes de IA: el modelo etiqueta personas, organizaciones y lugares en las memorias almacenadas por un servidor Dakera en segundo plano, lo que permite recuperación filtrada por entidad sin coste de GPU.
- Extracción de entidades en documentos autoalojados: al ejecutarse en CPU con ONNX Runtime y 117,6 MB de grafos, puede desplegarse en contenedores sin GPU para procesar correos, contratos o tickets.
- Enriquecimiento de pipelines de búsqueda: las entidades extraídas se indexan junto a los documentos para permitir consultas facetadas por organización o localidad.
- Anonimización y redacción de datos: detección de nombres de persona y organización en textos en inglés antes de almacenarlos o compartirlos, con umbral ajustable para priorizar recall o precisión.
- Análisis de redes sociales: el modelo obtiene F1 0,67 en WNUT-17, por lo que es utilizable para monitorización de menciones de marcas y entidades en tuits en inglés.
- Procesamiento de noticias: con F1 0,69 en CoNLL-2003, sirve para etiquetar entidades en artículos periodísticos en inglés dentro de flujos ETL.
- Clasificación de etiquetas personalizadas: al aceptar etiquetas arbitrarias en tiempo de inferencia, permite definir taxonomías propias (por ejemplo, "producto", "competidor", "ciudad") sin reentrenar.
- Despliegue en el edge: su tamaño reducido y su latencia de 0,013 s por petición en CPU lo hacen apto para dispositivos con recursos limitados.

## Benchmarks y rendimiento

Resultados publicados por el autor de la compilación, medidos a través del pipeline de extracción de Dakera (umbral 0,5; etiquetas person, organization, location; ONNX Runtime 1.31 con prepacking de pesos, un hilo de CPU por pasada en un AMD Ryzen 9 7950X):

| Conjunto | F1 |
|---|---|
| Dakera chat sentences, inglés (20 frases; 10 etiquetas) | 0,88 |
| Dakera chat sentences, 7 idiomas (44 frases; 10 etiquetas) | 0,70 |
| WNUT-17 (redes sociales, inglés) | 0,67 |
| CoNLL-2003 (noticias, inglés) | 0,69 |

MultiCoNER v2 (150 frases por idioma):

| de | en | es | fr | hi | it | pt | zh |
|---|---|---|---|---|---|---|---|
| 0,43 | 0,65 | 0,36 | 0,50 | 0,01 | 0,54 | 0,41 | 0,01 |

Latencia: mediana de 0,013 s por petición en el conjunto de chat. No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está diseñado para inferencia en CPU con ONNX Runtime.
- Huella en disco: aproximadamente 117,6 MB de grafos ONNX más tokenizers y configuración (repo de 0,1 GB).
- GPU recomendadas: no aplica; el modelo no está optimizado para GPU en esta compilación.
- Cabe en cualquier CPU consumer moderna; el autor reporta mediciones en un AMD Ryzen 9 7950X con un hilo por pasada.
- Opciones de despliegue: ONNX Runtime (con prepacking de pesos activado por defecto), contenedor oficial de Dakera (`ghcr.io/dakera-ai/dakera:latest`) y cualquier runtime compatible con ONNX.
- Latencia: 0,013 s de mediana por petición en el conjunto de chat; el throughput no se ha publicado.
- Advertencia de rendimiento: desactivar el prepacking de pesos de ONNX Runtime provoca que las MatMul de 8 bits repacken sus pesos en cada ejecución, con una penalización de 4-5 veces.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| DakeraAI/gliner-bi-small-v2.0-int8 | no disponible | no disponible (spans de 12 palabras) | en (evaluado en 7 idiomas) | Apache-2.0 | ONNX int8 | Compilación CPU de GLiNER bi-small v2.0; F1 0,69 en CoNLL-2003 |
| knowledgator/gliner-bi-small-v2.0 | no disponible | no disponible | en (multilingüe parcial) | Apache-2.0 | PyTorch (safetensors) | Modelo original; sirve de referencia de calidad |
| knowledgator/gliner-multi-base-v2.0 | no disponible | no disponible | multilingüe | Apache-2.0 | PyTorch | Alternativa multilingüe de mayor tamaño de la misma familia |
| GLiNER original (urchade/gliner_small-v2.1) | no disponible | no disponible | en | Apache-2.0 | PyTorch | Implementación de referencia de GLiNER |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos en la información proporcionada, pero al ser un modelo entrenado principalmente en inglés puede tener un desempeño desigual en dominios y variedades dialectales.
- Alucinación: al ser un modelo de etiquetado y no generativo, el riesgo se manifiesta como falsos positivos en la detección de entidades, especialmente con umbrales bajos.
- Cobertura idiomática muy limitada: F1 de 0,01 en hindi y chino en MultiCoNER v2, y 0,36 en español; no debe usarse en producción para estos idiomas sin validación previa.
- Restricción de spans: solo detecta entidades de hasta 12 palabras, lo que excluye menciones largas o anidadas complejas.
- Dependencia del umbral: el rendimiento publicado asume umbral 0,5; cambiarlo altera el equilibrio entre precisión y recall.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar la licencia del modelo base y mantener la atribución a Knowledgator.
- Dependencia del runtime: el rendimiento depende de ONNX Runtime con prepacking activado; otros runtimes pueden degradar la latencia.
- Sin soporte de GPU optimizado en esta compilación: para altos volúmenes de inferencia puede ser preferible el checkpoint original en PyTorch con aceleración por hardware.

## Enlaces

- HuggingFace: https://huggingface.co/DakeraAI/gliner-bi-small-v2.0-int8
- Modelo base: https://huggingface.co/knowledgator/gliner-bi-small-v2.0
- Licencia: https://huggingface.co/DakeraAI/gliner-bi-small-v2.0-int8/blob/main/LICENSE
- Web de Dakera: https://dakera.ai
- Documentación de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Paper GLiNER: https://arxiv.org/abs/2311.08526
- Paper de referencia (arXiv:2602.18487): no disponible como URL verificada en la información proporcionada
