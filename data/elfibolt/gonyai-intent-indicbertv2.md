# Elfibolt/gonyai-intent-indicbertv2

## Resumen

Gonyai Konkani Intent Classifier es un modelo de clasificación de texto (intent classification) desarrollado por Elfibolt y afinado a partir de ai4bharat/IndicBERTv2-MLM-only. Su función es actuar como router de intenciones de primera etapa para el asistente de IA en konkani goano (Gonyai), clasificando cada consulta del usuario en una de cuatro categorías: NEWS, WEATHER, CONTEXT o DIRECT. Con ello, el sistema puede dirigir la petición al backend adecuado (API de noticias, meteorología en tiempo real, RAG sobre documentos o generación directa por LLM).

El modelo resuelve un problema concreto de ingeniería de asistentes: la necesidad de un clasificador de baja latencia y alta precisión para una lengua de bajos recursos como el konkani en escritura devanagari (`kok` / `gom`), donde los modelos multilingües genéricos suelen confundir el konkani con el marathi. Para ello, el autor curó un dataset de 5.300 consultas con negativos duros equilibrados (~16%) y una auditoría dialectal específica que elimina contaminación marathi.

Arquitectura BERT (IndicBERT v2), 278.044.420 parámetros totales según safetensors, licencia Apache 2.0, formato safetensors y un tamaño de repositorio de 1,1 GB. Es relevante ahora porque demuestra que un encoder compacto y especializado puede cubrir la función de enrutamiento en asistentes multilingües de bajos recursos sin recurrir a LLM generativos grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (IndicBERT v2, encoder transformer) |
| Parametros totales | 278.044.420 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kok (konkani goano), gom (konkani) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT derivado de ai4bharat/IndicBERTv2-MLM-only, con vocabulario nativo devanagari. Sobre esa base se aplicó un ajuste fino supervisado para clasificación de intenciones en cuatro clases (NEWS, WEATHER, CONTEXT, DIRECT). El entrenamiento se realizó en una GPU de Kaggle con precisión mixta (`fp16`).

El dataset consta de 5.300 consultas en konkani goano curadas manualmente. Aproximadamente el 16% son negativos duros (hard negatives) diseñados para evitar falsos positivos en el enrutamiento: por ejemplo, consultas que mencionan lluvia o clima pero piden escribir poesía o cocinar, o consultas que mencionan noticias pero solicitan una traducción. Además, se auditó el corpus para eliminar contaminación del marathi, corrigiendo diferencias morfológicas como `-चा` (marathi) frente a `-चो` (konkani), `कसा/कसे` frente a `कसो/कशें`, o `झाला/झाली` frente a `जालो/जाली`. No se documentan fases de RLHF ni DPO, algo coherente con una tarea de clasificación supervisada.

## Capacidades

- Clasificación de intenciones en konkani goano en cuatro categorías: NEWS, WEATHER, CONTEXT y DIRECT.
- Enrutamiento de consultas hacia pipelines backend especializados (API de noticias, meteorología en tiempo real, RAG documental, generación directa).
- Manejo de negativos duros: distingue entre una consulta meteorológica real y una petición creativa que menciona palabras de clima.
- Diferenciación dialectal konkani/marathi gracias a la curación del corpus.
- Clasificación de texto de una sola etiqueta (pipeline `text-classification`).
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento de consultas en un asistente conversacional en konkani: el modelo recibe el texto del usuario y devuelve la etiqueta de intención para que el orquestador llame a la API de noticias, al servicio meteorológico, al módulo RAG o al LLM generativo.
- Asistente de noticias regionales: las consultas etiquetadas como NEWS se derivan a una API de actualidad y deportes, evitando que el LLM invente titulares.
- Consultas meteorológicas en tiempo real: las peticiones de temperatura, previsión o alertas marítimas se enrutan al servicio de meteorología, con la ventaja de que el clasificador no confunde preguntas creativas que mencionan la lluvia.
- Atención al ciudadano sobre documentos y esquemas: las consultas CONTEXT se envían a un pipeline RAG que recupera fragmentos de PDFs, contratos o normativas y responde con base documental.
- Filtro previo en pipelines de bajo coste: al ser un encoder compacto, permite descartar o clasificar peticiones antes de invocar un LLM grande, reduciendo latencia y coste por consulta.
- Moderación y triaje de consultas en portales públicos en konkani: clasificar la intención permite derivar cada solicitud al departamento o servicio correspondiente.
- Evaluación de calidad dialectal: el modelo puede usarse como sonda para detectar texto marathi mal etiquetado como konkani en corpus de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en `fp32` rondaría 1,1 GB de pesos; en `fp16` aproximadamente 0,55 GB; en cuantización de 8 bits, alrededor de 0,28 GB. Cifras estimadas a partir de los 278 millones de parámetros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una NVIDIA T4, RTX 3060 o superior es más que suficiente.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` pipeline, TorchServe, Triton Inference Server, ONNX Runtime; también es viable exportarlo a GGUF para llama.cpp/Ollama, aunque el autor no lo documenta.
- Latencia y throughput: no disponibles en la información proporcionada; el autor lo describe como router de baja latencia, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Uso |
|---|---|---|---|---|---|
| Gonyai Konkani Intent Classifier | 278 M | no disponible | kok, gom | apache-2.0 | Clasificación de intenciones en konkani |
| ai4bharat/IndicBERTv2-MLM-only | no disponible | no disponible | Indic (multilingüe) | no disponible | Modelo base MLM, no especializado en intenciones |
| mBERT (bert-base-multilingual-cased) | 178 M | 512 | 104 idiomas | apache-2.0 | Clasificación multilingüe genérica, sin ajuste específico para konkani |

No se dispone de resultados de benchmarks comparativos publicados para este modelo, por lo que la comparación se limita a parámetros, idiomas y licencia.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en konkani goano en escritura devanagari; no debe usarse con otras lenguas ni con konkani en escritura latina.
- Solo clasifica en cuatro categorías cerradas; no genera texto ni responde consultas.
- Riesgo de degradación ante dominios o registros no representados en las 5.300 consultas de entrenamiento.
- Posible confusión residual con marathi pese a la auditoría dialectal, especialmente en textos mixtos o mal normalizados.
- Alucinación no aplicable en sentido generativo, pero sí riesgo de clasificación errónea con confianza alta en entradas ambiguas.
- No se documentan sesgos específicos, pero el corpus curado manualmente puede reflejar sesgos de selección del autor.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base IndicBERT v2 debe verificarse por separado en cuanto a sus términos.
- Sin métricas publicadas de precisión, recall ni F1; no hay garantías cuantificadas de rendimiento en producción.
- El autor no documenta longitud máxima de secuencia ni comportamiento con entradas largas.

## Enlaces

- Hugging Face: https://huggingface.co/Elfibolt/gonyai-intent-indicbertv2
- Modelo base: https://huggingface.co/ai4bharat/IndicBERTv2-MLM-only
