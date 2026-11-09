# OptimaMT/en-de

## Resumen

OptimaMT/en-de es una conversión a ONNX del modelo de traducción automática Xenova/opus-mt-en-de, a su vez derivado del modelo OPUS-MT en→de de la Universidad de Helsinki. Se trata de una copia directa con el mismo vocabulario y los mismos pesos, en la que únicamente se ha reconstruido el decoder fusionado cuantizado (`decoder_model_merged_quantized.onnx`) para reducir el consumo de memoria en tiempo de ejecución. El resto de ficheros del repositorio son idénticos byte a byte a los del modelo original.

El modelo resuelve la tarea de traducción automática inglés→alemán y está pensado para su uso en el navegador o en entornos Node.js mediante Transformers.js, así como en Python a través de ONNX Runtime. Su relevancia radica en la reducción de memoria reportada por el autor: hasta un 46-48 % menos de memoria tras la carga en Linux y Windows con `disable_quant_qdq = 1`, y un 15-21 % menos con los valores por defecto de ONNX Runtime, manteniendo tokens de salida idénticos.

Arquitectura Marian (transformer encoder-decoder), licencia CC BY 4.0 y un vocabulario de 58.101 tokens. El repositorio ocupa aproximadamente 0,1 GB y está etiquetado para la librería `transformers.js`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ONNX cuantizado (q8 en el ejemplo de uso); decoder fusionado cuantizado |
| Idiomas soportados | inglés (en), alemán (de) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de ficheros originales) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Marian, un transformer encoder-decoder diseñado específicamente para traducción automática, heredada de OPUS-MT de la Universidad de Helsinki. El vocabulario consta de 58.101 tokens. No se dispone de información sobre el número de parámetros totales, la composición del dataset de entrenamiento ni el volumen de tokens utilizados, ya que la model card no los detalla.

La modificación introducida respecto al modelo base es exclusivamente de grafo: la proyección de salida del decoder se ha movido fuera de sus dos ramas, sin alterar los pesos. Esta intervención permite un decoder fusionado más ligero en memoria. No se reportan procesos de RLHF, DPO ni innovaciones de decodificación especulativa; el foco del trabajo es la eficiencia de memoria en inferencia sobre ONNX Runtime (versión 1.31.1, CPU, 4 hilos).

## Capacidades

- Traducción automática de texto de inglés a alemán.
- Generación de texto seq2seq (pipeline `text2text-generation`).
- Ejecución en navegador y Node.js mediante Transformers.js.
- Ejecución en Python mediante ONNX Runtime, con SentencePiece y NumPy.
- Inferencia en CPU optimizada por memoria (reducción de hasta 46-48 % con `disable_quant_qdq = 1`).
- Salida de tokens idéntica al modelo base Xenova/opus-mt-en-de.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Traducción en el navegador sin backend: el modelo se carga con Transformers.js y `dtype: "q8"`, permitiendo traducir texto en cliente sin enviar datos a un servidor, adecuado para aplicaciones web de privacidad estricta.
- Traducción por lotes en Python: mediante `translate.py` (onnxruntime, sentencepiece, numpy) se pueden procesar corpus inglés→alemán en pipelines locales de preprocesamiento o generación de datasets.
- Internacionalización de documentación técnica: traducción de README, guías y textos de producto del inglés al alemán en flujos de CI, aprovechando el bajo consumo de memoria en CPU.
- Extensiones y plugins de navegador: la reducción de memoria tras la carga (hasta 244 MiB en Windows con `disable_quant_qdq = 1`) lo hace viable en entornos con recursos limitados.
- Traducción de subtítulos o textos cortos en aplicaciones de escritorio: el tamaño del repositorio (0,1 GB) y la inferencia en CPU facilitan el empaquetado en aplicaciones locales.
- Prototipado de sistemas de traducción multilingüe: al formar parte de OptimaMT (49 pares `OptimaMT/<src>-<tgt>`), sirve como componente en arquitecturas que encadenan varios pares de idiomas.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad de traducción (BLEU, COMET, MMLU, etc.). El único dato cuantitativo disponible es el consumo de memoria reportado por el autor:

| Métrica | Linux | Windows | Tokens idénticos |
|---|---:|---:|---|
| Memoria tras carga, `disable_quant_qdq = 1` | 495 → 269 MiB (-46 %) | 471 → 244 MiB (-48 %) | sí |
| Memoria tras carga, valores por defecto de ONNX Runtime | 265 → 208 MiB (-21 %) | 187 → 158 MiB (-15 %) | sí |

Medición realizada con ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en una máquina virtual). No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; el modelo está orientado a inferencia en CPU con ONNX Runtime.
- Memoria tras carga: entre 158 MiB y 269 MiB según plataforma y configuración (ver tabla anterior).
- GPU recomendadas: no se especifican; el modelo está validado en CPU.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0,1 GB y la inferencia se ejecuta en CPU con 4 hilos.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`), ONNX Runtime en Python (con sentencepiece y numpy), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OptimaMT/en-de | Marian | en→de | ONNX (Transformers.js) | CC BY 4.0 | Decoder fusionado optimizado en memoria; tokens idénticos al base |
| Xenova/opus-mt-en-de | Marian | en→de | ONNX | CC BY 4.0 | Modelo base directo; mayor consumo de memoria tras carga |
| Helsinki-NLP/opus-mt-en-de | Marian | en→de | PyTorch (safetensors/bin) | CC BY 4.0 | Modelo original de la Universidad de Helsinki; requiere conversión para ONNX |

No se dispone de datos de rendimiento comparativo (BLEU/COMET) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre la dirección inglés→alemán; no es un modelo multilingüe general.
- No se han publicado métricas de calidad de traducción (BLEU, COMET) en la información disponible, por lo que la calidad debe validarse empíricamente antes de usarlo en producción.
- Riesgo de alucinación y errores de traducción inherente a los modelos Marian de tamaño base, especialmente en dominios especializados o texto con ambigüedad.
- La licencia CC BY 4.0 permite uso comercial con atribución; es obligatorio acreditar a OPUS-MT (Universidad de Helsinki), a Xenova por la exportación ONNX y a OptimaMT por la modificación del grafo.
- La modificación se limita al decoder fusionado cuantizado; el resto de ficheros debe tratarse como el original de Xenova/opus-mt-en-de en la revisión `1ca130c44c4c`.
- Los datos de memoria se midieron con ONNX Runtime 1.31.1 en CPU y 4 hilos; el rendimiento puede variar en otras configuraciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-de
- Repositorio OptimaMT (GitHub): https://github.com/AmerAlreyahi/OptimaMT
- Informe del método (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos (Space): https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-en-de
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-de
