# OptimaMT/en-hi

## Resumen
OptimaMT/en-hi es una redistribución optimizada del modelo de traducción inglés-hindi Xenova/opus-mt-en-hi, que a su vez deriva del modelo OPUS-MT de la Universidad de Helsinki. El autor, OptimaMT, publica esta variante como parte de un conjunto de 49 pares de idiomas bajo el espacio de nombres OptimaMT/<src>-<tgt>, con el objetivo de reducir el consumo de memoria en inferencia sin alterar las traducciones producidas.

La modificación principal consiste en reconstruir únicamente el fichero ONNX del decodificador fusionado (decoder_model_merged_quantized.onnx), moviendo la proyección de salida fuera de sus dos ramas. El resto de los ficheros se mantiene byte a byte idéntico al original. Según la model card, esta intervención reduce la memoria tras la carga entre un 47 % y un 49 % en Linux y Windows cuando se aplica disable_quant_qdq, y entre un 16 % y un 22 % con los valores por defecto de ONNX Runtime, manteniendo tokens de salida idénticos.

El modelo está pensado para su uso con Transformers.js y ONNX Runtime en entornos con recursos limitados, especialmente en CPU, y conserva la licencia CC BY 4.0 del modelo original. No introduce mejoras de calidad de traducción: su propuesta de valor es exclusivamente la eficiencia de memoria en el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX quantized (q8 en Transformers.js); fichero decoder_model_merged_quantized.onnx |
| Idiomas soportados | en (ingles), hi (hindi) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (Transformers.js); repositorio de 0,1 GB |

## Arquitectura y entrenamiento
El modelo es un transformer encoder-decoder de tipo Marian, la familia utilizada por OPUS-MT, entrenado originalmente por la Universidad de Helsinki para traducción automática inglés-hindi. La versión aquí distribuida es una exportación ONNX realizada por Xenova (revisión 7aad72006a15) y posteriormente modificada por OptimaMT a nivel de grafo: la proyección de salida del decodificador se extrae de sus dos ramas, sin cambios en los pesos ni en el vocabulario (61.950 tokens).

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni sobre si se aplicaron técnicas de RLHF o DPO; estos detalles corresponden al modelo OPUS-MT original y no se documentan en la model card de esta redistribución. La innovación técnica destacable es exclusivamente la reorganización del grafo ONNX para reducir la memoria residente tras la carga, validada con ONNX Runtime 1.31.1 en CPU con 4 hilos.

## Capacidades
- Traducción automática directa de inglés a hindi.
- Generación de texto condicionada a la tarea de traducción (text2text-generation).
- Ejecución en navegador y entornos JavaScript mediante Transformers.js.
- Inferencia en CPU con ONNX Runtime, sin requerir GPU.
- Salida determinista respecto al modelo base (tokens idénticos verificados).
- No dispone de tool calling, function calling, modo de razonamiento multi-paso ni capacidades de visión o audio.
- Soporte multilingüe limitado estrictamente al par en-hi.

## Casos de uso
- Traducción de documentación técnica en inglés a hindi: el modelo puede procesar fragmentos de manuales o guías y generar texto hindi, integrándose en un pipeline de preprocesamiento de documentación.
- Localización de interfaces web en el navegador: gracias a Transformers.js, la traducción puede ejecutarse del lado del cliente sin enviar texto a servidores externos, lo que resulta adecuado para aplicaciones con requisitos de privacidad.
- Traducción de contenido de atención al cliente: permite convertir mensajes o plantillas en inglés a hindi antes de su revisión humana, reduciendo el esfuerzo manual en centros de soporte.
- Despliegue en dispositivos con memoria limitada: la reducción de memoria tras la carga (hasta un 49 % con disable_quant_qdq) lo hace viable en entornos con menos de 300 MiB disponibles para el modelo.
- Traducción por lotes en CPU en pipelines de CI/CD documental: al ejecutarse con ONNX Runtime y sentencepiece, puede incorporarse en scripts de procesamiento sin dependencias de GPU.
- Prototipado de sistemas de traducción en aplicaciones JavaScript: sirve como componente base para experimentar con par en-hi en entornos Node.js o navegador antes de escalar a modelos mayores.
- Evaluación comparativa de eficiencia: útil como referencia para medir el impacto de optimizaciones de grafo ONNX frente a la exportación original de Xenova.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de calidad de traducción (BLEU, chrF, COMET, etc.) en la información disponible. La model card únicamente documenta métricas de memoria y equivalencia de salida:

| Metrica | Linux | Windows |
|---|---:|---:|
| Memoria tras carga con disable_quant_qdq = 1 | 522 → 279 MiB (-47 %) | 498 → 255 MiB (-49 %) |
| Memoria tras carga con valores por defecto de ONNX Runtime | 279 → 218 MiB (-22 %) | 196 → 164 MiB (-16 %) |
| Tokens idénticos al modelo base | sí | sí |

Condiciones de medida: ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en máquina virtual).

## Requisitos de hardware
- VRAM: no aplica; el modelo está orientado a inferencia en CPU.
- Memoria RAM estimada tras la carga: 164-279 MiB según configuración y sistema operativo, con quantización q8 y disable_quant_qdq.
- GPU recomendadas: no disponibles ni necesarias; no se documenta soporte GPU específico más allá de las opciones genéricas de ONNX Runtime.
- Cabe en cualquier equipo consumer con al menos ~300 MiB de RAM libre; no requiere GPU dedicada.
- Opciones de despliegue: Transformers.js con dtype "q8", ONNX Runtime con sentencepiece y numpy mediante translate.py, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/en-hi | no disponible | no disponible | en, hi | CC BY 4.0 | ONNX | Decodificador reconstruido; menor memoria |
| Xenova/opus-mt-en-hi | no disponible | no disponible | en, hi | CC BY 4.0 | ONNX | Exportación original; modelo base de esta versión |
| Helsinki-NLP/opus-mt-en-hi | no disponible | no disponible | en, hi | CC BY 4.0 | PyTorch/safetensors | Pesos originales OPUS-MT |

La comparación se limita a la cadena de derivación del propio modelo; no se dispone de datos de rendimiento de traducción para establecer comparaciones de calidad con alternativas de otros autores.

## Limitaciones y advertencias
- La calidad de traducción no se ha evaluado en esta redistribución; se hereda la del modelo OPUS-MT original, sin garantías documentadas.
- Riesgo de alucinación y de traducciones inexactas inherente a los sistemas de traducción automática neuronal, especialmente en terminología especializada.
- Solo cubre el par inglés-hindi; no soporta otros idiomas ni traducción inversa (hi-en).
- Longitud de contexto no documentada; fragmentos largos pueden requerir segmentación previa.
- Licencia CC BY 4.0: permite uso comercial con atribución a OPUS-MT (Universidad de Helsinki), a Xenova por la exportación ONNX y a OptimaMT por la modificación del grafo.
- La optimización afecta únicamente la memoria; no se documentan mejoras de velocidad ni de calidad.
- El repositorio es de creación reciente y no registra descargas ni likes, por lo que la validación comunitaria es inexistente.
- La modificación se limita al fichero del decodificador fusionado; cualquier actualización del modelo base no se propaga automáticamente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-hi
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-en-hi
- Pesos originales OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-hi
