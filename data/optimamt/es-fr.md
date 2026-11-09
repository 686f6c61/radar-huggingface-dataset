# OptimaMT/es-fr

## Resumen

OptimaMT/es-fr es una conversión a ONNX del modelo de traducción automática Xenova/opus-mt-es-fr, que a su vez deriva del modelo OPUS-MT desarrollado por el grupo Language Technology de la Universidad de Helsinki. Se trata de un modelo especializado en traducción directa de español a francés, con arquitectura Marian (transformer encoder-decoder), empaquetado para su uso con Transformers.js y ONNX Runtime en entornos JavaScript y Python.

La aportación de OptimaMT no es un nuevo entrenamiento, sino una optimización del grafo ONNX: el decoder fusionado (`decoder_model_merged_quantized.onnx`) ha sido recompilado moviendo la proyección de salida fuera de sus dos ramas, lo que reduce el consumo de memoria sin alterar los pesos ni la tokenización. Según la model card, la memoria tras la carga baja de 610 a 318 MiB en Linux (-48 %) con `disable_quant_qdq = 1`, y de 244 a 208 MiB (-15 %) con los valores por defecto de ONNX Runtime, manteniendo tokens de salida idénticos.

Es relevante para desarrolladores que necesitan traducción es-fr ligera, ejecutable en CPU y en el navegador, con un footprint de memoria notablemente menor que el export original de Xenova. Forma parte de la colección OptimaMT, que cubre 49 pares de idiomas bajo el mismo esquema de nombres.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ONNX quantized (q8 en el ejemplo de uso); el repo incluye `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | es, fr |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian, un transformer encoder-decoder diseñado específicamente para traducción automática neuronal, originalmente entrenado por el grupo OPUS-MT de la Universidad de Helsinki sobre corpus paralelos del proyecto OPUS. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO.

La innovación técnica de esta variante es exclusivamente a nivel de grafo: el decoder fusionado ha sido reestructurado para sacar la proyección de salida de sus dos ramas, un cambio que no altera los pesos (el resto de ficheros son idénticos byte a byte al export de Xenova en la revisión `3bef5f612825`). El vocabulario es de 74.822 tokens. La cuantización se aplica sobre el decoder fusionado y el modelo está pensado para ejecutarse con ONNX Runtime, incluyendo la opción `disable_quant_qdq` para reducir aún más la memoria a costa de un modo de cuantización distinto.

## Capacidades

- Traducción de texto de español a francés, tarea única del pipeline `translation`.
- Ejecución en navegador y en Node.js mediante Transformers.js (`@huggingface/transformers`).
- Ejecución en Python con ONNX Runtime, SentencePiece y NumPy mediante el script `translate.py`.
- Inferencia en CPU con bajo consumo de memoria (208-318 MiB según configuración).
- Tokenización compatible con el export original de Xenova (mismos tokens de salida).
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido.
- Capacidad multilingüe limitada estrictamente al par es-fr.

## Casos de uso

- Traducción en el navegador sin backend: el modelo se carga con Transformers.js y `dtype: "q8"`, permitiendo traducir texto de formularios o contenidos web en cliente sin enviar datos a un servidor, algo viable por su footprint de ~200-300 MiB.
- Internacionalización de aplicaciones web: integración en un frontend JavaScript para traducir dinámicamente cadenas de interfaz del español al francés en tiempo de ejecución, sin depender de una API externa.
- Preprocesado de corpus en pipelines de NLP: traducción por lotes de documentos o datasets en español a francés antes de tareas posteriores (clasificación, análisis de sentimiento) usando el script de Python con ONNX Runtime.
- Herramientas de escritorio y extensiones: al ejecutarse en CPU con ONNX Runtime y poca memoria, encaja en plugins de editores o aplicaciones Electron que necesiten traducción offline.
- Prototipado rápido de sistemas de traducción: servir como baseline ligero en experimentos de traducción automática o en evaluaciones comparativas frente a modelos mayores, con la ventaja de que los tokens de salida son idénticos al export de referencia.
- Entornos con recursos limitados: despliegue en contenedores pequeños o dispositivos edge donde no cabe un modelo de traducción de mayor tamaño, gracias a la reducción de memoria del decoder fusionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, COMET, etc.) en la información disponible. La model card únicamente reporta métricas de memoria tras la carga:

| Configuración | Linux (antes → después) | Windows (antes → después) | Tokens idénticos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 610 → 318 MiB (-48 %) | 586 → 295 MiB (-50 %) | sí |
| Valores por defecto de ONNX Runtime | 244 → 208 MiB (-15 %) | 222 → 185 MiB (-17 %) | sí |

Mediciones realizadas con ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en una máquina virtual).

## Requisitos de hardware

- VRAM/RAM estimada: 185-318 MiB de memoria tras la carga según plataforma y configuración de cuantización; no requiere GPU.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU.
- Cabe holgadamente en cualquier GPU consumer y en sistemas sin GPU dedicada; también en navegadores modernos vía Transformers.js.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`), ONNX Runtime en Python (con SentencePiece y NumPy), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada; las pruebas reportadas son de memoria, no de velocidad.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Memoria tras carga |
|---|---|---|---|---|---|---|
| OptimaMT/es-fr | Marian | es → fr | no disponible | CC BY 4.0 | ONNX | 185-318 MiB |
| Xenova/opus-mt-es-fr | Marian | es → fr | no disponible | CC BY 4.0 | ONNX | 222-610 MiB |
| Helsinki-NLP/opus-mt-es-fr | Marian | es → fr | no disponible | CC BY 4.0 | safetensors/PyTorch | no disponible |

La diferencia principal frente al export de Xenova es la reducción de memoria con salida idéntica; frente al modelo original de Helsinki-NLP, la ventaja es la disponibilidad en ONNX para ejecución en JavaScript y CPU.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en el par es-fr; no traduce otras combinaciones ni realiza otras tareas.
- No se han publicado evaluaciones de calidad de traducción en la información disponible, por lo que el rendimiento lingüístico debe validarse en el dominio de uso concreto.
- Riesgo de alucinación y de traducciones inexactas inherente a los modelos Marian de tamaño reducido, especialmente con frases largas, terminología especializada o lenguaje coloquial.
- Longitud de contexto no documentada; probablemente limitada, lo que desaconseja entradas muy largas sin segmentación previa.
- La licencia CC BY 4.0 permite uso comercial con atribución; es obligatorio acreditar a OPUS-MT (Universidad de Helsinki) y al export de Xenova, así como indicar los cambios realizados en el grafo.
- La optimización de memoria depende del uso de ONNX Runtime y de la opción `disable_quant_qdq`; en otros runtimes o configuraciones los ahorros pueden no aplicarse.
- Sin mantenimiento ni métricas de uso relevantes (0 descargas, 0 likes en el momento de la consulta); conviene fijar la revisión concreta en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/es-fr
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe del método: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-es-fr
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-es-fr
