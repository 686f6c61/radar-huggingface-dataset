# OptimaMT/it-fr

## Resumen

OptimaMT it-fr es un modelo de traducción automática italiano-francés derivado de Xenova/opus-mt-it-fr, que a su vez es una exportación a ONNX del modelo OPUS-MT de la Universidad de Helsinki. Lo desarrolla el proyecto OptimaMT, que mantiene 49 pares de idiomas bajo la convención de nombres OptimaMT/<src>-<tgt>. El modelo resuelve la traducción de texto entre italiano y francés en entornos de inferencia ligera, especialmente en el navegador o en CPU mediante ONNX Runtime.

La aportación principal no es un nuevo entrenamiento, sino una optimización del grafo ONNX: se reconstruye únicamente el archivo `onnx/decoder_model_merged_quantized.onnx`, moviendo la proyección de salida del decodificador fuera de sus dos ramas. El resto de archivos son idénticos byte a byte al modelo original de Xenova. El resultado es una reducción de memoria tras la carga de entre el 15 % y el 48 % según la configuración, manteniendo tokens de salida idénticos.

Es relevante para desarrolladores que necesitan traducción italiano-francés de baja latencia en aplicaciones web o entornos con recursos limitados, ya que se integra directamente con transformers.js y cuantización de 8 bits, con un tamaño de repositorio de 0,1 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q8 (cuantización del decodificador merged en ONNX) |
| Idiomas soportados | italiano (it), francés (fr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js) |
| Vocabulario | 59.351 tokens |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | Xenova/opus-mt-it-fr (revisión 7843e3b7137d) |
| Librería | transformers.js |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Marian, la arquitectura empleada por la familia OPUS-MT de Helsinki-NLP. No se ha realizado entrenamiento nuevo: los pesos provienen del modelo OPUS-MT it-fr original, exportado a ONNX por Xenova y posteriormente modificado por OptimaMT. La innovación técnica consiste en una alteración del grafo del decodificador merged cuantizado: la proyección de salida se extrae de las dos ramas del decodificador, lo que reduce la memoria residente tras la carga sin alterar los pesos ni los tokens generados.

Los datos de entrenamiento originales (número de tokens, composición del corpus, uso de RLHF o DPO) no están disponibles en la información proporcionada. El modelo emplea SentencePiece para la tokenización, con un vocabulario de 59.351 tokens.

## Capacidades

- Traducción de texto italiano a francés en modo texto a texto.
- Traducción de una sola dirección (it → fr); no se documenta el par inverso en este repositorio.
- Inferencia en navegador mediante transformers.js con ONNX Runtime.
- Inferencia en CPU mediante onnxruntime, sentencepiece y numpy (script `translate.py`).
- Cuantización q8 con opción `disable_quant_qdq = 1` para reducir memoria.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Traducción en el navegador sin backend: se puede cargar el modelo con transformers.js y `dtype: "q8"` para traducir texto italiano a francés directamente en el cliente, evitando enviar contenido a un servidor y reduciendo la latencia de red.
- Aplicaciones web de atención al cliente bilingüe: integrado en un widget de chat, traduce mensajes de usuarios italianos a francés para agentes francófonos, con un consumo de memoria de 162-272 MiB tras la carga según plataforma.
- Procesamiento por lotes en CPU: el script `translate.py` basado en onnxruntime permite traducir corpus de documentos en servidores sin GPU, aprovechando la reducción de memoria del decodificador merged.
- Localización de contenido editorial: traducción de artículos, fichas de producto o documentación del italiano al francés en pipelines de publicación, con revisión humana posterior.
- Extensiones de navegador: traducción de páginas o fragmentos seleccionados en tiempo real dentro del navegador, sin dependencia de API externas.
- Prototipado rápido de sistemas multilingües: al ser un modelo de 0,1 GB y licencia CC BY 4.0, sirve como componente de traducción en demos y pruebas de concepto antes de escalar a modelos mayores.
- Traducción en dispositivos con recursos limitados: la reducción de memoria del 46-48 % con `disable_quant_qdq = 1` en Linux/Windows facilita su despliegue en entornos con RAM restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento proporcionados son de memoria tras la carga, medidos con ONNX Runtime 1.31.1 en CPU con 4 hilos:

| Configuración | Linux (MiB) | Windows (MiB) | Tokens idénticos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 503 → 272 (-46 %) | 481 → 249 (-48 %) | sí |
| Valores por defecto de ONNX Runtime | 270 → 212 (-21 %) | 191 → 162 (-15 %) | sí |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma directa; el modelo está pensado para CPU y navegador. La memoria tras la carga en CPU es de 162-272 MiB según configuración y plataforma.
- GPU recomendadas: no se documentan; el modelo se evalúa en CPU con ONNX Runtime.
- Cabe en GPU consumer: no se proporcionan datos específicos; por tamaño (0,1 GB) es plausible en cualquier GPU consumer, pero no está verificado en la información disponible.
- Opciones de despliegue: transformers.js (navegador), onnxruntime en Python (script `translate.py` con sentencepiece y numpy).
- Latencia y throughput: no disponibles. Las mediciones publicadas son de memoria, no de velocidad.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Memoria tras carga |
|---|---|---|---|---|---|---|
| OptimaMT/it-fr | Marian (ONNX) | it → fr | no disponible | CC BY 4.0 | ONNX | 162-272 MiB |
| Xenova/opus-mt-it-fr | Marian (ONNX) | it → fr | no disponible | CC BY 4.0 | ONNX | 191-503 MiB (referencia) |
| Helsinki-NLP/opus-mt-it-fr | Marian | it → fr | no disponible | CC BY 4.0 | safetensors/PyTorch | no disponible |

La comparativa se limita a la familia OPUS-MT porque no se dispone de datos de otros modelos de traducción it-fr en la información proporcionada. La diferencia principal frente a Xenova/opus-mt-it-fr es la reducción de memoria con tokens idénticos; frente al modelo original de Helsinki-NLP, el formato ONNX y la optimización del decodificador.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de italiano a francés; no se documenta el par fr → it en este repositorio.
- Solo dos idiomas: no soporta traducción desde o hacia otras lenguas.
- Riesgo de alucinación y errores de traducción inherentes a los modelos OPUS-MT, especialmente en textos técnicos, nombres propios y expresiones idiomáticas; se recomienda revisión humana en producción.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al heredar los pesos de OPUS-MT, puede reproducir sesgos presentes en los corpus de entrenamiento originales.
- Longitud de contexto no documentada: no se especifica el máximo de tokens de entrada, lo que dificulta planificar el truncado en documentos largos.
- Licencia CC BY 4.0: permite uso comercial con atribución; es obligatorio citar a los autores originales (Universidad de Helsinki, Xenova y OptimaMT).
- Solo se reconstruye `onnx/decoder_model_merged_quantized.onnx`; el resto de archivos son idénticos al original, por lo que las limitaciones del modelo base se mantienen.
- Sin datos de latencia ni throughput publicados; las cifras de memoria se midieron en un entorno concreto (ONNX Runtime 1.31.1, CPU, 4 hilos) y pueden variar.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso; es un modelo estrictamente de traducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/it-fr
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-it-fr
- Modelo OPUS-MT original: https://huggingface.co/Helsinki-NLP/opus-mt-it-fr
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe del método (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos (Space): https://huggingface.co/spaces/OptimaMT/results
