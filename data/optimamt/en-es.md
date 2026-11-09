# OptimaMT/en-es

## Resumen

OptimaMT/en-es es una conversión optimizada del modelo de traducción automática neuronal Xenova/opus-mt-en-es (a su vez derivado de Helsinki-NLP/opus-mt-en-es) para su uso con ONNX Runtime y transformers.js. Lo desarrolla OptimaMT, un proyecto que publica 49 pares de traducción bajo el mismo esquema de nomenclatura (`OptimaMT/<src>-<tgt>`). El modelo resuelve la traducción de inglés a español en entornos de inferencia ligeros, principalmente en navegador o CPU, donde el consumo de memoria es un factor crítico.

La contribución técnica no es un nuevo entrenamiento, sino una modificación del grafo ONNX del decodificador merged: la proyección de salida se mueve fuera de sus dos ramas, lo que reduce el uso de memoria sin alterar los pesos ni la tokenización. Según la model card, la memoria tras la carga baja de 545 a 291 MiB en Linux (-47 %) con `disable_quant_qdq = 1`, y de 291 a 227 MiB (-22 %) con los valores por defecto de ONNX Runtime, manteniendo tokens de salida idénticos.

El modelo conserva la arquitectura Marian del OPUS-MT original, con un vocabulario de 65.001 tokens y licencia CC BY 4.0. Es relevante para desarrolladores que necesitan traducción EN→ES embebida con requisitos de memoria estrictos, aunque su rendimiento y cobertura lingüística quedan limitados por el modelo base del que parte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX quantized (q8 en el ejemplo de uso); el archivo reconstruido es `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | en (ingles), es (espanol) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` y resto de ficheros originales sin modificar) |

## Arquitectura y entrenamiento

El modelo es una copia directa de Xenova/opus-mt-en-es en la revisión `4b002a4c7edd`, que a su vez exporta a ONNX el modelo OPUS-MT de la Universidad de Helsinki. La arquitectura es la de Marian: un transformer encoder-decoder con atención estándar, orientado específicamente a traducción automática y entrenado originalmente por Helsinki-NLP sobre datos paralelos de OPUS. No hay información en la model card sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos detalles corresponden al modelo base y no se reproducen en la información disponible.

La innovación de esta versión es exclusivamente de despliegue: se reconstruye únicamente el fichero `onnx/decoder_model_merged_quantized.onnx`, moviendo la proyección de salida del decodificador fuera de sus dos ramas. Es un cambio de grafo, no de pesos: "same weights, same tokens, less memory". El resto de ficheros del repositorio son los originales, byte a byte. El vocabulario es de 65.001 tokens. Las mediciones de memoria se realizaron con ONNX Runtime 1.31.1 en CPU con 4 hilos (Linux nativo, Windows en máquina virtual).

## Capacidades

- Traducción de texto de inglés a español, tarea única del pipeline `translation`.
- Inferencia en navegador mediante transformers.js con el backend de ONNX Runtime Web.
- Inferencia en CPU mediante Python con onnxruntime, sentencepiece y numpy (script `translate.py`).
- Ejecución con cuantización q8 y opción `disable_quant_qdq` para reducir la memoria tras la carga.
- Salida de tokens idéntica al modelo base Xenova/opus-mt-en-es en las pruebas del autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Cobertura multilingüe limitada exclusivamente al par en→es.

## Casos de uso

- Traducción en el navegador sin backend: integrar el pipeline de transformers.js en una aplicación web para traducir contenido EN→ES en el cliente, aprovechando la reducción de memoria del decodificador merged para mantener el consumo bajo en dispositivos con recursos limitados.
- Extensiones de navegador para lectura bilingüe: traducir párrafos seleccionados de páginas en inglés a español en tiempo de ejecución, con el modelo cargado localmente y sin enviar texto a servidores externos.
- Preprocesado de datos en pipelines de NLP: traducir corpus EN→ES antes de tareas posteriores (clasificación, análisis de sentimiento, indexación) en entornos de CPU donde el presupuesto de memoria es ajustado.
- Traducción de documentación técnica en CI/CD: ejecutar el script `translate.py` sobre ficheros Markdown o cadenas de recursos para generar versiones en español de documentación, con un coste de memoria de 227-291 MiB según configuración.
- Aplicaciones de escritorio Electron o Tauri: embeber el modelo ONNX en una app de escritorio para traducción offline de correos, notas o textos cortos, sin dependencia de APIs externas.
- Prototipado y evaluación de despliegues ONNX: usar el modelo como referencia para medir el impacto de `disable_quant_qdq` y de la reorganización del grafo del decodificador en el consumo de memoria de otras exportaciones Marian.
- Traducción de subtítulos o textos cortos en servidores de bajos recursos: desplegar el modelo con ONNX Runtime en instancias CPU pequeñas para traducir lotes de frases EN→ES en tareas por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de memoria tras la carga, no métricas de calidad de traducción (BLEU, COMET u otras):

| Configuracion | Linux (MiB) | Windows (MiB) | Tokens identicos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 545 → 291 (-47 %) | 517 → 267 (-48 %) | si |
| Valores por defecto de ONNX Runtime | 291 → 227 (-22 %) | 201 → 170 (-15 %) | si |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso medido (inferencia en CPU); el consumo de memoria del proceso es de 170-291 MiB según plataforma y configuración.
- GPU recomendadas: no disponible; el modelo está orientado a CPU y navegador.
- Cabe en cualquier GPU consumer, aunque no se documenta un backend GPU específico; también cabe holgadamente en CPU y en dispositivos con poca RAM.
- Opciones de despliegue: transformers.js (`@huggingface/transformers`) con `dtype: "q8"`, ONNX Runtime en Python mediante `translate.py`, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OptimaMT/en-es | no disponible | no disponible | CC BY 4.0 | ONNX (quantized) | Decodificador merged optimizado; -47 % de memoria con `disable_quant_qdq` |
| Xenova/opus-mt-en-es | no disponible | no disponible | CC BY 4.0 | ONNX | Modelo base directo de esta conversión; mismos pesos y tokens |
| Helsinki-NLP/opus-mt-en-es | no disponible | no disponible | CC BY 4.0 | safetensors / PyTorch | OPUS-MT original de la Universidad de Helsinki; requiere transformers y PyTorch |
| Otros pares OptimaMT/<src>-<tgt> | no disponible | no disponible | CC BY 4.0 | ONNX (quantized) | Misma metodología aplicada a 49 pares de idiomas |

## Limitaciones y advertencias

- Modelo de traducción de propósito único: no sirve para generación abierta, razonamiento, código ni tareas multimodales.
- Calidad de traducción acotada por el modelo base OPUS-MT; no se aportan métricas de calidad en la información disponible.
- Sesgos potenciales heredados de los datos paralelos de OPUS y del entrenamiento original de Helsinki-NLP; no documentados en la model card.
- Riesgo de alucinación y de traducciones incorrectas en frases ambiguas, dominios especializados o texto con jerga; no hay evaluación publicada al respecto.
- Cobertura limitada al par inglés-español; no traduce otras lenguas ni variantes dialectales de forma explícita.
- Longitud de contexto no documentada; el modelo base Marian tiene límites de longitud de secuencia que no se detallan aquí.
- Uso comercial permitido bajo CC BY 4.0, con obligación de atribución a OPUS-MT (Universidad de Helsinki) y a Xenova/opus-mt-en-es.
- Solo se ha reconstruido el decodificador merged cuantizado; el resto de ficheros son los originales, por lo que las optimizaciones no aplican a otras variantes del repositorio.
- Las mediciones de memoria proceden de una única configuración (ONNX Runtime 1.31.1, CPU, 4 hilos) y pueden no reproducirse en otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-es
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-en-es
- Modelo OPUS-MT original: https://huggingface.co/Helsinki-NLP/opus-mt-en-es
