# Kausp11/searchlm-dclm_nc-sftnc_v4cannsent_baseline_d14_allcm

## Resumen

Searchlm-dclm_nc-sftnc_v4cannsent_baseline_d14_allcm es un modelo de lenguaje experimental de autoría individual (usuario Kausp11 en Hugging Face) que forma parte de una línea de investigación sobre preentrenamiento con búsqueda habilitada (search-enabled pretraining). Se trata de un modelo de aproximadamente 842 millones de parámetros, exportado desde el framework nanochat, que ha sido sometido a un ajuste fino supervisado (SFT) sobre un modelo base entrenado con el corpus DCLM-Edu. El modelo incorpora tokens especiales de búsqueda web (<WEB_QUERY>, </WEB_QUERY>, <WEB_RESPONSE>, </WEB_RESPONSE>) tanto en el tokenizador como en los datos de entrenamiento, lo que sugiere que está diseñado para generar consultas web e integrar respuestas de búsqueda dentro de sus conversaciones.

La relevancia de este modelo radica en su carácter de baseline (línea base) comparativo en un experimento de entrenamiento con cómputo emparejado (compute-matched), presumiblemente para evaluar si el preentrenamiento con bloques de búsqueda mejora las capacidades del modelo frente a un entrenamiento tradicional. No es un modelo de producción, sino un artefacto de investigación con descargas limitadas (234 en el momento de la ficha) y sin model card detallada, por lo que su documentación es escasa y debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only, estilo nanochat/GPT) — no disponible el detalle exacto |
| Parametros totales | 842.220.414 (dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE; asume todos activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en precision original) |
| Idiomas soportados | no disponible (presumiblemente inglés, dado el corpus DCLM-Edu y SmolTalk) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,7 GB en total) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only exportado desde nanochat, un framework de entrenamiento minimalista de modelos de lenguaje. El tokenizador se basa en el de SmolLM2, ampliado con tokens especiales de búsqueda (<WEB_QUERY>, </WEB_QUERY>, <WEB_RESPONSE>, </WEB_RESPONSE>) que permiten delimitar bloques de consulta y respuesta web dentro del texto. Esto indica que el modelo fue preentrenado (o al menos ajustado) con conversaciones que intercalan interacciones simuladas con un motor de búsqueda, en línea con técnicas tipo search-augmented pretraining.

El pipeline de entrenamiento consta de dos fases documentadas: un preentrenamiento sobre DCLM-Edu (subconjunto educativo del corpus DCLM, Dolma Core LM) con cómputo emparejado (compute-matched), seguido de un SFT de 1 época con la variante "v4c-ann-sent". Los datos de SFT combinan SmolTalk (chat y habilidades), SmolTalk2 (tool calling) y conversaciones de SmolTalk con bloques de búsqueda procedentes del pipeline de anotación del propio preentrenamiento, insertados al inicio de la frase. El formato de chat es simple: `User: ...\n\nAssistant: ...`. No hay información sobre RLHF ni DPO posteriores.

## Capacidades

- Generacion de texto conversacional en formato `User: .../Assistant: ...`
- Generacion de consultas web sinteticas entre los tokens <WEB_QUERY> y </WEB_QUERY>, útil para pipelines de destilacion de busqueda o agentes con acceso a herramientas
- Integracion de respuestas de busqueda via <WEB_RESPONSE>, lo que habilita razonamiento aumentado con recuperacion si se conecta a un motor real
- Tool calling basico, al incluir SmolTalk2 con ejemplos de llamadas a herramientas en el SFT
- No hay evidencia de capacidades multimodales (vision, audio) ni de modo de razonamiento extendido (thinking mode)

## Casos de uso

- Investigacion en preentrenamiento con busqueda: sirve como baseline compute-matched para comparar frente a modelos entrenados con anotaciones de busqueda, midiendo si estas mejoran la calidad de las consultas generadas.
- Generacion sintetica de datos de busqueda: puede usarse para producir pares consulta-respuesta web sinteticos que alimenten el preentrenamiento de modelos mas grandes, replicando el pipeline de anotacion descrito en la model card.
- Prototipado de agentes con busqueda: dado que conoce los tokens de busqueda, puede integrarse en un agente simple que intercepte <WEB_QUERY>, ejecute la consulta contra una API real y reinyecte el resultado como <WEB_RESPONSE>.
- Estudio de tool calling en modelos pequeños: al incluir SmolTalk2 en el SFT, es util para evaluar como los modelos de menos de 1B de parametros aprenden formatos de llamada a herramientas.
- Experimentacion con nanochat: como exportacion HF de un checkpoint nanochat, facilita cargar y analizar checkpoints de ese framework con la libreria transformers estandar.
- Eduacion y reproduccion de experimentos: su tamano reducido (842M) y licencia Apache 2.0 lo hacen adecuado para practicas academicas de fine-tuning y analisis de datos de SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 842M de parametros en FP16/BF16, aproximadamente 1,7-2 GB de VRAM; en INT8, alrededor de 1 GB; en INT4, unos 0,6 GB.
- Cabe comodamente en GPUs de consumo: cualquier GPU moderna (RTX 3060 de 12 GB, RTX 4060, RTX 4090) e incluso GPUs integradas o portatiles.
- CPU: ejecutable en CPU con llama.cpp si se convierte a GGUF (conversion no disponible en el repo actualmente).
- Despliegue: transformers con `AutoModelForCausalLM.from_pretrained(repo, trust_remote_code=True)` (requiere trust_remote_code por custom_code); compatible en principio con vLLM y TGI dada la arquitectura estandar, aunque no hay configuraciones publicadas de referencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| searchlm-dclm_nc baseline (este) | 842M | no disponible | Apache 2.0 | Baseline SFT con tokens de busqueda, experimental |
| SmolLM2-1.7B-Instruct | 1,7B | 8192 | Apache 2.0 | Misma familia de tokenizador/datos (SmolTalk), modelo de produccion con benchmarks publicados |
| Qwen2.5-0.5B-Instruct | 0,5B | 32768 | Qwen (uso comercial permitido con condiciones) | Tamano comparable, benchmarks publicados, soporte multilingue amplio |

Este modelo se posiciona como artefacto de investigacion frente a alternativas como SmolLM2 o Qwen2.5, que ofrecen documentacion completa, benchmarks y soporte de ecosistema, pero carecen del entrenamiento especifico con bloques de busqueda.

## Limitaciones y advertencias

- Documentacion minima: la model card es muy breve y no especifica longitud de contexto, datos exactos de preentrenamiento ni rendimiento; evaluar antes de cualquier uso serio.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repo; revisar el codigo antes de cargar en entornos sensibles.
- Riesgo de alucinacion elevado: al ser un modelo pequeno y experimental, sin RLHF documentado, puede generar contenido inexacto con facilidad.
- Idioma: sin declaracion de idiomas; probablemente limitado al ingles dado el corpus DCLM-Edu y SmolTalk.
- Las consultas web generadas son sinteticas: no hay conexion real con motores de busqueda; integrarlo en agentes requiere infraestructura propia.
- Sin benchmarks publicados: imposible comparar objetivamente su calidad frente a alternativas sin evaluacion propia.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo experimental sin garantias de calidad, no se recomienda para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Kausp11/searchlm-dclm_nc-sftnc_v4cannsent_baseline_d14_allcm
- No se han encontrado enlaces adicionales (paper, blog, repositorio de codigo o demo) en la informacion disponible.
