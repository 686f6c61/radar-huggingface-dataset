# ChatPanel/distilbert-base-multilingual-cased-ner-hrl

## Resumen

`ChatPanel/distilbert-base-multilingual-cased-ner-hrl` es una copia sin modificaciones del modelo `Xenova/distilbert-base-multilingual-cased-ner-hrl` (commit `c2a4dbf593c57f47004c5bc2d3770d311aee9c43`), publicada por el usuario ChatPanel para centralizar las descargas de su pasarela (gateway). No se ha reentrenado, convertido ni editado ningún archivo: los pesos son idénticos a los del repositorio upstream. El modelo original es una destilación de DistilBERT multilingüe ajustada para reconocimiento de entidades nombradas (NER) en el conjunto de datos HRL (High Recall Language), desarrollado por Davlan.

Se trata de un modelo encoder-only de tipo transformer, pensado para etiquetado de secuencias token a token (clasificación de entidades). Su tamaño es reducido (DistilBERT base, aproximadamente 66 millones de parámetros según la arquitectura DistilBERT estándar, aunque el dato exacto no se proporciona en la información disponible) y se distribuye en formato ONNX cuantizado, lo que lo hace adecuado para inferencia ligera en CPU o entornos con recursos limitados.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de infraestructura (una réplica de un modelo ya existente) más que un modelo nuevo; por otro, sirve para identificar sus capacidades reales (NER multilingüe) y sus limitaciones, dado que la model card original no está incluida en la información proporcionada y la licencia AFL-3.0 condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, destilación de BERT) |
| Parametros totales | no disponible (arquitectura DistilBERT base, ~66M según el modelo original; no confirmado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT estándar admite 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | ONNX cuantizado (`onnx/model_quantized.onnx`); no se detalla el esquema exacto (int8 u otro) |
| Idiomas soportados | no disponible (el nombre indica "multilingual", pero no se listan idiomas concretos) |
| Licencia | AFL-3.0 (Academic Free License 3.0) |
| Formato de pesos | ONNX (modelo cuantizado); tokenizer en JSON y vocab.txt |

## Arquitectura y entrenamiento

El modelo subyacente es un DistilBERT multilingüe: un transformer encoder-only obtenido por destilación de conocimiento a partir de un BERT multilingüe, con la mitad de capas que el modelo profesor. Sobre esa base, Davlan realizó un ajuste fino para NER sobre el conjunto HRL, que cubre etiquetas de entidades como persona, organización y localización (el detalle exacto de las etiquetas no se incluye en la información disponible). El resultado es un clasificador token a token que asigna una etiqueta BIO a cada token de entrada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos encoder-only de NER). La innovación técnica relevante aquí es la cuantización a ONNX para inferencia eficiente, no un cambio arquitectónico. Es importante subrayar que el repositorio de ChatPanel no introduce ninguna modificación: es una réplica byte a byte del artefacto de Xenova, verificado mediante hashes SHA-256 en la model card.

## Capacidades

- Reconocimiento de entidades nombradas (NER) token a token sobre texto de entrada.
- Etiquetado multilingüe (según el nombre del modelo; idiomas concretos no disponibles).
- Clasificación de secuencias mediante la cabeza de token classification.
- Inferencia optimizada mediante ONNX cuantizado, apta para CPU.
- No soporta generación de texto, razonamiento, código ni matemáticas (es encoder-only).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Extracción de entidades en pipelines de procesamiento de documentos: el modelo etiqueta personas, organizaciones y localizaciones en texto multilingüe, integrándose como paso previo a indexación o búsqueda semántica.
- Anonimización de datos personales: detectar nombres de personas y organizaciones antes de almacenar o compartir textos, como capa de preprocesado en cumplimiento de normativa de privacidad.
- Enriquecimiento de bases de datos de noticias: extraer entidades de titulares y cuerpos de artículo para construir grafos de conocimiento o metadatos estructurados.
- Moderación y análisis de contenido en foros multilingües: identificar menciones a organizaciones o localizaciones para clasificar y enrutar contenido.
- Preprocesado para sistemas RAG: marcar entidades en los chunks antes de la recuperación, mejorando el filtrado por entidad en consultas.
- Etiquetado asistido en anotación humana: generar preetiquetas NER que los anotadores revisan, reduciendo el coste de construcción de datasets.
- Inferencia en el edge o en contenedores ligeros: al distribuirse en ONNX cuantizado, puede ejecutarse en CPU sin GPU dedicada, lo que encaja en servicios de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repo (0,1 GB) y la cuantización ONNX, es esperable un consumo de memoria muy bajo (del orden de cientos de MB), aunque no se confirma en la información.
- GPU recomendadas: no disponibles; el modelo está pensado para inferencia en CPU gracias al formato ONNX cuantizado.
- ¿Cabe en GPU consumer? Sí, con alta probabilidad, dado su tamaño reducido; no se especifican modelos concretos.
- Opciones de despliegue: ONNX Runtime (formato nativo del repo); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI (estos últimos orientados a modelos generativos, no a encoder-only).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChatPanel/distilbert-base-multilingual-cased-ner-hrl | no disponible (~66M según arquitectura) | no disponible | NER multilingüe | AFL-3.0 | Hugging Face (réplica) |
| Davlan/distilbert-base-multilingual-cased-ner-hrl | no disponible | no disponible | NER multilingüe | no disponible en la información | Hugging Face (original) |
| Xenova/distilbert-base-multilingual-cased-ner-hrl | no disponible | no disponible | NER multilingüe | no disponible en la información | Hugging Face (upstream ONNX) |

No se dispone de datos de rendimiento comparado ni de otras alternativas verificadas en la información proporcionada.

## Limitaciones y advertencias

- Es una réplica exacta de otro modelo: no aporta mejoras ni cambios respecto al upstream; su valor es puramente logístico para la pasarela de ChatPanel.
- La model card original no está incluida en la información disponible, por lo que se desconocen sesgos específicos, idiomas exactos y métricas de evaluación.
- Riesgo de alucinación bajo en sentido generativo (no genera texto), pero puede producir falsos positivos y falsos negativos en la etiquetación de entidades.
- Limitación de contexto: al ser un encoder tipo DistilBERT, es probable un límite de 512 tokens, aunque no se confirma; textos largos requerirán segmentación.
- Licencia AFL-3.0: permite uso comercial con condiciones (atribución y cumplimiento de cláusulas de la licencia); conviene revisar los términos antes de producción.
- Sin garantías de mantenimiento: el repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-12; no hay evidencia de soporte activo.
- No apto para tareas generativas, de razonamiento o de código.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ChatPanel/distilbert-base-multilingual-cased-ner-hrl
- Modelo base: https://huggingface.co/Davlan/distilbert-base-multilingual-cased-ner-hrl
- Upstream ONNX: https://huggingface.co/Xenova/distilbert-base-multilingual-cased-ner-hrl
- Commit upstream referenciado: `c2a4dbf593c57f47004c5bc2d3770d311aee9c43`
