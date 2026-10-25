# nuancebitgmbh/privacy-filter-multilingual-v2-onnx-int4

## Resumen

`nuancebitgmbh/privacy-filter-multilingual-v2-onnx-int4` es una conversión a ONNX Runtime del modelo de clasificación de tokens `OpenMed/privacy-filter-multilingual-v2`, que a su vez es un fine-tune de `openai/privacy-filter`. Su función es detectar información personal identificable (PII) token a token en textos de 16 idiomas, con un etiquetado fino de 54 categorías en formato BIOES que se traduce en 217 clases de salida. El resultado es un modelo de extracción de entidades, no un generador de texto: devuelve una puntuación por clase para cada token de la entrada.

La aportación de este repositorio no es el modelo en sí, sino el artefacto de despliegue: un grafo ONNX con atención en banda (banda 128), pesos de mezcla de expertos cuantizados a 4 bits con bloques de 32 y escalas por bloque elegidas por mínimo error cuadrático, y la tabla de embeddings en fp16 convertida a fp32 tras el lookup. El repositorio ocupa 1,2 GB y está pensado para inferencia en CPU mediante ONNX Runtime, lo que lo hace utilizable en entornos sin GPU.

Es relevante ahora porque permite ejecutar un detector de PII multilingüe de 54 categorías en infraestructura modesta y con un formato de pesos estándar (ONNX), algo poco habitual en este tipo de modelos, que suelen distribuirse únicamente como checkpoints de Hugging Face Transformers. No hay reentrenamiento: los pesos son los del checkpoint original y el autor verificó la coincidencia del argmax por token frente al modelo fuente en un corpus fijo antes de publicar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), exportado como grafo ONNX con atención en banda (banda 128). Detalles de capas y dimensión no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el grafo usa atención en banda de 128 posiciones) |
| Tipos de cuantizacion | INT4 en pesos MoE (block size 32, escalas por bloque por mínimo error cuadrático); embeddings de token en fp16 con cast a fp32 |
| Idiomas soportados | ar, bn, de, en, es, fr, hi, it, ja, ko, nl, pt, te, tr, vi, zh (16) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx_data` como pesos externos); tokenizer en JSON |

Otros datos: pipeline `token-classification`; entradas `input_ids` y `attention_mask` (int64, forma `[1, tokens]`); salida `logits` con una fila de 217 puntuaciones por token. El repositorio incluye `config.json`, `tokenizer.json`, `tokenizer_config.json` y `manifest.json` con tamaños y SHA-256 de cada fichero.

## Arquitectura y entrenamiento

El modelo subyacente es un clasificador de tokens basado en transformer con capas de mezcla de expertos, según se deduce de la descripción de la cuantización aplicada a los "mixture-of-experts weights". La conversión transforma el checkpoint en un grafo ONNX de atención en banda con banda 128, construido con el generador de grafos de `jalbrethsen-highflame/privacy-filter-onnx` y mapeando los tensores desde el layout del checkpoint original. Sobre ese grafo se añade el sesgo de clasificación de tokens (`score.bias`) del fine-tune, que el generador upstream no incorporaba.

No hubo reentrenamiento: los pesos son los del checkpoint `OpenMed/privacy-filter-multilingual-v2` en la revisión `0d0c0430fa386435ace1d9f842f0f966903a9ac8`, a su vez un fine-tune de `openai/privacy-filter` sobre un espacio de etiquetas de 54 categorías en formato BIOES (217 clases). La única validación descrita es la comparación del argmax de cada token frente al checkpoint fuente en un corpus fijo antes de la release; no se documentan cifras de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO, ni tampoco el proceso de fine-tune de OpenMed.

## Capacidades

- Detección de PII token a token con 54 categorías de entidad en esquema BIOES (217 clases de salida, incluyendo etiquetas B-, I-, E-, S- y O).
- Cobertura multilingüe en 16 idiomas: árabe, bengalí, alemán, inglés, español, francés, hindi, italiano, japonés, coreano, neerlandés, portugués, telugu, turco, vietnamita y chino.
- Salida compatible con decodificación Viterbi BIOES para reconstruir entidades completas (la decodificación debe implementarla el usuario; el grafo solo emite logits).
- Adecuado para flujos de extracción de PII y posterior anonimización o enmascaramiento, ya sea por sustitución, seudonimización o redacción.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de etiquetado.
- No incluye el wrapper de alto nivel de OpenMed (`extract_pii()` / `deidentify()`) ni el post-procesado con expresiones regulares que aplica ese wrapper; el repositorio ONNX expone únicamente el grafo.

## Casos de uso

- Redacción de PII antes de enviar texto a un LLM de terceros: se ejecuta el detector sobre el prompt en CPU, se aplica la decodificación BIOES y se sustituyen las entidades detectadas por marcadores de posición, reduciendo la exposición de datos personales en la llamada al proveedor.
- Cumplimiento de RGPD en pipelines de datos: pasada por lotes sobre logs de aplicaciones o tickets de soporte para localizar nombres, direcciones, teléfonos y documentos identificativos antes de almacenarlos o exportarlos a un entorno analítico.
- Enmascaramiento en atención al cliente: preprocesado de conversaciones multi-turno en español, francés o alemán para anonimizar al cliente antes de que el transcript se use en evaluación de calidad o en entrenamiento de modelos internos.
- Anonimización de corpus para investigación clínica o legal: detección de identificadores en informes y expedientes en varios idiomas dentro de un mismo lote, con el modelo corriendo en servidores sin GPU para mantener los datos en la propia infraestructura.
- Saneamiento de datasets de entrenamiento: filtrado de registros que contienen PII antes de incorporarlos a un corpus, usando la salida por token para decidir entre redactar la entidad o descartar el documento.
- Despliegue edge o en contenedor ligero: al ser un artefacto ONNX de 1,2 GB ejecutable con ONNX Runtime en CPU, encaja en funciones serverless, contenedores sin GPU o entornos on-premise donde no se permite enviar datos fuera.
- Preprocesado en pipelines de CI/CD de datos: integración como paso de validación que falla la build si un fichero de fixtures o un snapshot de base de datos contiene PII sin enmascarar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta una comprobación de paridad: el argmax de cada token se comparó con el checkpoint fuente sobre un corpus fijo antes de la release. No se aportan métricas de precisión, recall o F1 por categoría o idioma, ni latencias medidas.

## Requisitos de hardware

- Inferencia en CPU mediante ONNX Runtime: es el caso de uso declarado del repositorio. Los pesos ocupan 1,2 GB en disco (principalmente `model.onnx_data`), por lo que se necesita al menos ese espacio en memoria para cargar el grafo, más el overhead de activaciones y del runtime. Cifra exacta de RAM pico: no disponible.
- VRAM estimada para GPU: no disponible. Al estar cuantizado a INT4 y con embeddings en fp16, la huella sería inferior a los 1,2 GB de los pesos en disco, pero no se publican medidas.
- GPU recomendadas: no disponible. El autor no documenta ejecución en GPU ni providers de ONNX Runtime distintos de CPU.
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño del artefacto, pero no está verificado ni documentado por el autor.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio). Otros runtimes compatibles con ONNX no están documentados. Para el modelo original en Transformers existe `OpenMed/privacy-filter-multilingual-v2`; para Apple Silicon hay variantes MLX de la familia OpenMed; y existe una conversión ONNX alternativa en `lemonade-sdk/openmed-privacy-filter-multilingual-v2-onnx`.
- Latencia y throughput: no disponibles. La atención en banda de 128 posiciones reduce el coste cuadrático del mecanismo de atención, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Idiomas | Clases | Licencia | Notas |
|---|---|---|---|---|---|---|
| `nuancebitgmbh/privacy-filter-multilingual-v2-onnx-int4` | ONNX | INT4 (MoE) + embeddings fp16 | 16 | 217 (54 categorías BIOES) | Apache 2.0 | Objeto de esta ficha; añade `score.bias` y no incluye wrapper |
| `OpenMed/privacy-filter-multilingual-v2` | Safetensors (Transformers) | Original, sin cuantizar | 16 | 217 | Apache 2.0 | Modelo fuente; incluye wrapper `extract_pii()` / `deidentify()` con decodificador Viterbi y post-procesado regex |
| `openai/privacy-filter` | Pesos originales | Sin cuantizar | no disponible en la información manejada | 217 (mismo espacio de etiquetas) | no disponible en la información manejada | Modelo base del que deriva el fine-tune de OpenMed |
| `lemonade-sdk/openmed-privacy-filter-multilingual-v2-onnx` | ONNX | no disponible | 16 | 217 | no disponible | Conversión ONNX alternativa del mismo modelo base |
| `OpenMed/privacy-filter-multilingual-v2-mlx-8bit` | MLX | 8 bits | 16 | 217 | no disponible | Variante para Apple Silicon |

No se dispone de datos de rendimiento comparado (F1, latencia) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El grafo ONNX solo emite logits: no incluye la decodificación Viterbi BIOES ni el post-procesado con expresiones regulares del wrapper de OpenMed. Sin ese trabajo adicional, la salida no son entidades listas para usar.
- La atención está restringida a una banda de 128 posiciones, lo que puede degradar la detección de entidades que dependen de contexto lejano o de correferencias a larga distancia dentro de un documento.
- No se publican métricas de precisión ni recall por categoría o idioma: el rendimiento real en cada uno de los 16 idiomas y en cada una de las 54 categorías es desconocido y debe medirse sobre datos propios.
- Riesgo de falsos negativos y de alucinación de entidades: como cualquier clasificador probabilístico, puede dejar PII sin detectar o marcar fragmentos inocuos. No debe usarse como única garantía de anonimización en un contexto regulatorio.
- La licencia Apache 2.0 se hereda del modelo fuente, pero el autor declara no estar afiliado ni respaldado por OpenMed ni por OpenAI; conviene revisar los términos del modelo base antes de un uso comercial.
- El proceso de cuantización INT4 introduce una desviación respecto al checkpoint original. La comprobación descrita se limita a la coincidencia del argmax por token en un corpus fijo, sin métricas de degradación en fronteras de entidades ni en categorías poco frecuentes.
- Idiomas cubiertos: los 16 declarados. No hay información sobre calidad relativa entre ellos; el español está incluido, pero no se documenta su rendimiento específico.
- Artefacto con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuancebitgmbh/privacy-filter-multilingual-v2-onnx-int4
- Modelo base (OpenMed): https://huggingface.co/OpenMed/privacy-filter-multilingual-v2
- Modelo original de OpenAI: https://huggingface.co/openai/privacy-filter
- Generador de grafos ONNX utilizado: https://huggingface.co/jalbrethsen-highflame/privacy-filter-onnx
- Conversión ONNX alternativa (lemonade-sdk): https://huggingface.co/lemonade-sdk/openmed-privacy-filter-multilingual-v2-onnx
- Ficha del modelo base en Inferix: https://inferix.co/models/OpenMed/privacy-filter-multilingual-v2
- Ficha del modelo base en ModelScope: https://www.modelscope.cn/models/OpenMed/privacy-filter-multilingual-v2
- Variante MLX 8 bits del modelo base: https://huggingbay.xyz/artifact/hf-model-openmed-privacy-filter-multilingual-v2-mlx-8bit
