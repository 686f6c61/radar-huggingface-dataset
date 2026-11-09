# OptimaMT/ar-fr

## Resumen

OptimaMT/ar-fr es una exportación ONNX optimizada del modelo de traducción automática Helsinki-NLP/opus-mt-ar-fr, parte de la familia OPUS-MT desarrollada por el Grupo de Tecnología del Lenguaje de la Universidad de Helsinki. El modelo original es un transformer encoder-decoder de arquitectura Marian entrenado para traducción directa del árabe al francés. Esta versión concreta, publicada por OptimaMT, redistribuye los pesos originales en formato ONNX con un decoder fusionado (merged decoder) reconstruido, pensado para inferencia en el navegador y en entornos con recursos limitados mediante transformers.js.

La propuesta de valor de esta réplica es puramente de eficiencia de despliegue: mantiene exactamente los mismos pesos y produce los mismos tokens que el export original, pero reduce el consumo de memoria tras la carga entre un 22 % y un 48 % según la configuración de ONNX Runtime y la plataforma (Linux o Windows). Está pensada como componente drop-in para pipelines de traducción ligeros, sin requisitos de GPU y con un tamaño de repositorio de apenas 0,1 GB.

Es relevante para desarrolladores que necesitan traducción árabe-francés de baja latencia en aplicaciones web, extensiones o servicios edge, donde cargar un modelo de traducción completo en memoria resulta prohibitivo. Forma parte de un conjunto más amplio de 49 pares de idiomas publicados bajo el mismo esquema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX quantized (q8); decoder merged quantized |
| Idiomas soportados | arabe (ar), frances (fr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`decoder_model_merged_quantized.onnx`), tokenizer en JSON |
| Vocabulario | 64.505 tokens |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | transformers.js (con ONNX Runtime) |
| Modelo base | Helsinki-NLP/opus-mt-ar-fr (revision e507d7bc8508) |

## Arquitectura y entrenamiento

El modelo subyacente es un MarianMT, la arquitectura de traducción neuronal desarrollada en el proyecto OPUS-MT de la Universidad de Helsinki. Se trata de un transformer estándar encoder-decoder con atención multi-cabeza, entrenado de forma supervisada sobre corpus paralelos multilingües recopilados en el ecosistema OPUS. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; estos datos corresponden a la model card del modelo original, que no se ha incluido aquí.

La innovación técnica de esta réplica concreta no está en el entrenamiento sino en la exportación: el decoder fusionado (`decoder_model_merged_quantized.onnx`) ha sido reconstruido moviendo la proyección de salida fuera de sus dos ramas, lo que constituye un cambio exclusivamente de grafo. Los pesos, tokens y tokenizer se mantienen idénticos al export original en layout Xenova. El resto de ficheros del repositorio son copias byte a byte del export de referencia. Los tokenizers (`tokenizer.json`, `special_tokens_map.json`, `tokenizer_config.json`) fueron reescritos siguiendo el layout Xenova para compatibilidad con transformers.js.

## Capacidades

- Traducción de texto directa del árabe al francés, en modalidad text2text.
- Inferencia en CPU sin necesidad de GPU, con soporte para ONNX Runtime.
- Ejecución en navegador y entornos JavaScript mediante transformers.js.
- Ejecución en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py` del repositorio OptimaMT).
- Producción de tokens idénticos al export ONNX de referencia, garantizando consistencia con el modelo original.
- Reducción de memoria tras la carga configurable mediante `disable_quant_qdq` (hasta -47 % en Linux, -48 % en Windows).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo thinking; es un modelo especializado exclusivamente en traducción.

## Casos de uso

- Traducción en aplicaciones web sin backend: el modelo puede cargarse directamente en el navegador mediante transformers.js y traducir texto árabe a francés en el cliente, eliminando la necesidad de enviar datos a un servidor y reduciendo la latencia de red.
- Servicios edge con recursos limitados: gracias a su huella de memoria reducida (entre 170 y 290 MiB tras la carga según configuración) y a la ausencia de requisitos de GPU, puede desplegarse en dispositivos de borde, contenedores pequeños o funciones serverless con memoria restringida.
- Traducción de documentación técnica y contenido web: adecuado para pipelines por lotes que conviertan corpus árabes en francés, por ejemplo para localización de documentación o moderación de contenido multilingüe.
- Preprocesamiento en pipelines NLP multilingües: puede actuar como etapa de traducción previa a modelos de análisis de sentimiento, clasificación o extracción de entidades que solo operan en francés.
- Atención al cliente multilingüe: integrado en un sistema de chat, permite traducción en tiempo real de mensajes de usuarios arabófonos hacia agentes francófonos, con inferencia en CPU y bajo consumo de memoria.
- Aplicaciones de escritorio o extensiones de navegador: el formato ONNX y el reducido tamaño del repositorio (0,1 GB) facilitan su empaquetado en aplicaciones offline de traducción.
- Investigación en eficiencia de despliegue: sirve como referencia para estudiar el impacto de optimizaciones de grafo (decoder fusionado, `disable_quant_qdq`) sobre el consumo de memoria en ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta métricas de memoria tras la carga, no métricas de calidad de traducción (BLEU, chrF, COMET) ni de velocidad:

| Configuracion | Memoria Linux | Memoria Windows | Tokens identicos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 542 → 290 MiB (-47 %) | 514 → 265 MiB (-48 %) | si |
| Valores por defecto de ONNX Runtime | 288 → 226 MiB (-22 %) | 200 → 170 MiB (-15 %) | si |

Medición realizada con ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en máquina virtual).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecución en CPU.
- Memoria RAM tras la carga: entre 170 y 290 MiB según plataforma y configuración de ONNX Runtime (ver tabla anterior).
- GPU recomendadas: no aplica; no se requieren GPU para el caso de uso previsto.
- Cabe en cualquier GPU consumer y en CPU de gama baja, dado su reducido consumo de memoria.
- Opciones de despliegue: transformers.js (navegador/Node.js), ONNX Runtime en Python (onnxruntime + sentencepiece + numpy), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada; la medición reportada se limita al consumo de memoria con 4 hilos de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/ar-fr | no disponible | no disponible | ar → fr | CC BY 4.0 | ONNX (transformers.js) | Decoder fusionado optimizado; memoria reducida hasta -48 % |
| Helsinki-NLP/opus-mt-ar-fr | no disponible | no disponible | ar → fr | CC BY 4.0 | safetensors / PyTorch | Modelo original; requiere framework PyTorch |
| Xenova/opus-mt-ar-fr (export de referencia) | no disponible | no disponible | ar → fr | CC BY 4.0 | ONNX | Export ONNX estándar; mayor consumo de memoria |
| Otros pares OptimaMT (49 combinaciones) | no disponible | no disponible | varios pares | CC BY 4.0 | ONNX | Mismo esquema de optimización para otros idiomas |

Los datos de parámetros y contexto de los modelos comparados no están disponibles en la información proporcionada. La comparación se limita a formato, licencia y optimización de despliegue.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en traducción árabe-francés; no admite otras tareas ni otros pares de idiomas.
- No se han publicado métricas de calidad de traducción (BLEU, chrF, COMET) en la información disponible; el rendimiento cualitativo debe evaluarse empíricamente antes de usarlo en producción.
- Riesgo de alucinación y errores de traducción inherentes a los modelos Marian de traducción automática, especialmente en dominios especializados, terminología técnica y textos con ambigüedad semántica.
- Longitud de contexto no especificada; los modelos OPUS-MT suelen estar limitados a segmentos de frase, por lo que textos largos deben segmentarse previamente.
- Licencia CC BY 4.0: permite uso comercial con atribución obligatoria al autor original (Universidad de Helsinki) y a los responsables de la exportación ONNX.
- La optimización de memoria depende de ONNX Runtime 1.31.1 y de la configuración `disable_quant_qdq`; comportamientos distintos en otras versiones del runtime no están garantizados.
- El modelo no dispone de salvaguardas específicas frente a contenido tóxico o sesgado; la calidad y neutralidad de la traducción heredan los sesgos de los corpus OPUS utilizados en el entrenamiento original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ar-fr
- Modelo base original: https://huggingface.co/Helsinki-NLP/opus-mt-ar-fr
- Repositorio OptimaMT en GitHub: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos (Space): https://huggingface.co/spaces/OptimaMT/results
