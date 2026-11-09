# OptimaMT/en-zh

## Resumen

OptimaMT/en-zh es una reexportación optimizada del modelo de traducción automática Xenova/opus-mt-en-zh, que a su vez deriva del modelo OPUS-MT de la Universidad de Helsinki. Se trata de un modelo Marian (transformer encoder-decoder) especializado en traducción inglés-chino, empaquetado en formato ONNX para su uso con ONNX Runtime y transformers.js. El autor, OptimaMT, mantiene una colección de 49 pares de idiomas bajo el mismo esquema de nomenclatura.

La contribución principal de esta versión no es un reentrenamiento, sino una modificación del grafo del decodificador: la proyección de salida se ha extraído de sus dos ramas y se ha reconstruido únicamente el fichero `decoder_model_merged_quantized.onnx`, manteniendo el resto de ficheros byte a byte idénticos al export original. El resultado es una reducción de memoria tras la carga de hasta el 47 % en Linux y el 49 % en Windows con `disable_quant_qdq = 1`, generando tokens idénticos al modelo base.

El modelo es relevante para despliegues ligeros en navegador o en CPU con recursos limitados, donde el ahorro de memoria del decodificador cuantizado marca la diferencia. No obstante, se trata de un modelo de nicho con cero descargas y cero likes en el momento de la consulta, y su licencia CC BY 4.0 exige atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); fichero `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian, un transformer encoder-decoder diseñado originalmente para traducción automática neuronal. Los pesos proceden de OPUS-MT (Universidad de Helsinki) y el export ONNX de Xenova/opus-mt-en-zh en la revisión `046f55aec303`. No se ha realizado ningún reentrenamiento ni ajuste fino: la única modificación es estructural a nivel de grafo, moviendo la proyección de salida del decodificador fuera de sus dos ramas.

El vocabulario consta de 65.001 tokens y el repositorio ocupa 0,1 GB. El modelo requiere que cada entrada comience con el token de variante de destino `>>cmn_Hans<<` (chino mandarín en escritura simplificada). Se recomienda transformers.js 3.x, ya que la versión 4.3.2 divide este token incorrectamente, incluso con el export original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Traducción automática de inglés a chino (mandarín simplificado).
- Generación de texto text2text mediante pipeline de traducción.
- Ejecución en navegador y en CPU mediante ONNX Runtime y transformers.js.
- Uso en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py`).
- Soporte de cuantización q8 para reducir el uso de memoria.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Traducción en el navegador: al ejecutarse con transformers.js y ONNX, el modelo puede integrarse en una aplicación web que traduzca texto en cliente sin enviar datos a un servidor, adecuado para contenidos sensibles o entornos con conectividad limitada.
- Traducción por lotes en CPU: el ahorro de memoria del decodificador permite procesar grandes volúmenes de documentos inglés-chino en servidores sin GPU, reduciendo el coste por instancia.
- Localización de interfaces y documentación: traducción de cadenas de UI, manuales y textos técnicos del inglés al chino simplificado en pipelines de CI/CD.
- Preprocesado multilingüe para NLP: traducción de corpus en inglés a chino antes de tareas de análisis, indexación o búsqueda en sistemas que operan principalmente en chino.
- Aplicaciones de escritorio y extensiones: el tamaño reducido (0,1 GB) y la ejecución en CPU permiten embeber el traductor en herramientas de escritorio o extensiones de navegador.
- Prototipado rápido de sistemas de traducción: al ser un drop-in replacement del export de Xenova con tokens idénticos, sirve para validar pipelines antes de migrar a modelos mayores, sin cambiar el comportamiento de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de memoria tras la carga en ONNX Runtime 1.31.1, CPU, 4 hilos:

| Configuración | Linux (MiB) | Windows (MiB) | Tokens idénticos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 545 → 291 (-47 %) | 519 → 263 (-49 %) | sí |
| Valores por defecto de ONNX Runtime | 291 → 227 (-22 %) | 201 → 173 (-14 %) | sí |

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el modelo está pensado para ejecución en CPU con ONNX Runtime.
- Memoria RAM tras la carga: entre 173 y 291 MiB según plataforma y configuración de cuantización QDQ.
- GPU recomendadas: no se documentan; el modelo está optimizado para CPU.
- Cabe en cualquier GPU consumer, aunque no es su caso de uso principal; también cabe en dispositivos de gama baja por su tamaño de 0,1 GB.
- Opciones de despliegue: ONNX Runtime (Python), transformers.js 3.x (JavaScript/navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/en-zh | Marian | en → zh | no disponible | CC BY 4.0 | ONNX | Decodificador reconstruido, menor memoria |
| Xenova/opus-mt-en-zh | Marian | en → zh | no disponible | CC BY 4.0 | ONNX | Export original, misma salida, más memoria |
| Helsinki-NLP/opus-mt-en-zh | Marian | en → zh | no disponible | CC BY 4.0 | safetensors/PyTorch | Pesos originales de OPUS-MT |

No se dispone de datos de rendimiento comparativo (BLEU u otras métricas) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la consulta; sin validación comunitaria.
- Solo traduce inglés a chino simplificado; no soporta otras direcciones ni variantes.
- Requiere prefijar la entrada con `>>cmn_Hans<<`; omitirlo puede degradar la salida.
- transformers.js 4.3.2 divide el token de variante; se recomienda la versión 3.x.
- Riesgo de alucinación y errores en terminología especializada inherente a los modelos Marian de tamaño reducido.
- No se documentan sesgos específicos, pero al derivar de OPUS-MT hereda los sesgos de sus datos de entrenamiento originales.
- Licencia CC BY 4.0: permite uso comercial con atribución obligatoria a OPUS-MT, Xenova y OptimaMT.
- Sin datos publicados de benchmarks de calidad de traducción; no se recomienda para producción crítica sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-zh
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-en-zh
- Pesos originales OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-zh
