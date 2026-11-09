# OptimaMT/en-nl

## Resumen

OptimaMT/en-nl es una conversión a ONNX del modelo de traducción automática Xenova/opus-mt-en-nl, que a su vez deriva del OPUS-MT en-nl de la Universidad de Helsinki. Se trata de un modelo Marian de traducción inglés-neerlandés, empaquetado para su uso con transformers.js y ONNX Runtime. La aportación concreta de OptimaMT no es reentrenar ni modificar los pesos, sino reconstruir únicamente el decodificador fusionado cuantizado para reducir el consumo de memoria en inferencia manteniendo exactamente los mismos tokens de salida.

El modelo forma parte del proyecto OptimaMT, que agrupa 49 pares de idiomas bajo el esquema `OptimaMT/<src>-<tgt>`. Su relevancia actual es práctica: permite ejecutar traducción en-nl en navegador o en CPU con un consumo de memoria notablemente inferior al del artefacto original, sin degradar la calidad de la traducción. Según la model card, con `disable_quant_qdq = 1` el uso de memoria tras la carga baja de 557 a 296 MiB en Linux (-47 %) y de 533 a 270 MiB en Windows (-49 %), con salida idéntica.

El vocabulario es de 67.028 tokens y el repositorio ocupa aproximadamente 0,1 GB. La licencia es CC BY 4.0, heredada de OPUS-MT, y el modelo base declarado es Xenova/opus-mt-en-nl en la revisión `c3a0541231a7`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, según el modelo base OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); el decodificador fusionado cuantizado es el único archivo reconstruido |
| Idiomas soportados | inglés (en), neerlandés (nl) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de archivos idénticos al original) |
| Vocabulario | 67.028 tokens |
| Tamaño del repositorio | ~0,1 GB |
| Librería | transformers.js |
| Modelo base | Xenova/opus-mt-en-nl (revisión `c3a0541231a7`) |
| Pipeline | translation |

## Arquitectura y entrenamiento

El modelo es un Marian de traducción, la familia de modelos seq2seq de OPUS-MT desarrollada por la Universidad de Helsinki y ampliamente usada en traducción automática de bajo coste. Al ser una conversión del artefacto de Xenova, que a su vez exporta el OPUS-MT original a ONNX, no hay entrenamiento propio por parte de OptimaMT: los pesos son los originales de Helsinki-NLP/opus-mt-en-nl, redistribuidos bajo CC BY 4.0.

La modificación técnica consiste en una intervención sobre el grafo del decodificador fusionado: la proyección de salida se extrae de sus dos ramas, dando lugar a un decodificador más ligero en memoria. No se alteran pesos ni tokenizador, y la model card declara que los tokens generados son idénticos a los del modelo de referencia. Los datos de entrenamiento originales (número de tokens, composición del corpus, uso de RLHF o DPO) no se detallan en la información disponible y corresponden al OPUS-MT original, no a esta conversión.

## Capacidades

- Traducción de texto inglés a neerlandés, tarea única del pipeline `translation`.
- Inferencia en navegador y en CPU mediante transformers.js y ONNX Runtime, sin necesidad de GPU.
- Ejecución con cuantización q8 y opción de sesión `disable_quant_qdq` para reducir el consumo de memoria.
- Salida determinista respecto al modelo base: mismos tokens que Xenova/opus-mt-en-nl.
- Uso desde JavaScript/TypeScript con `@huggingface/transformers` y desde Python con onnxruntime, sentencepiece y numpy (script `translate.py` del repositorio).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento; es un traductor puro.

## Casos de uso

- Traducción en el navegador: integración en una aplicación web con transformers.js para traducir contenido en-nl en el cliente, sin enviar texto a un servidor y con un consumo de memoria de aproximadamente 173-197 MiB con los valores por defecto de ONNX Runtime.
- Traducción por lotes en CPU: uso del script `translate.py` con onnxruntime para procesar ficheros de texto o documentación en un servidor sin GPU, aprovechando el bajo consumo de memoria del decodificador reconstruido.
- Preprocesado multilingüe en pipelines de NLP: traducción de textos en inglés a neerlandés antes de tareas posteriores de análisis, clasificación o indexación en sistemas que operan en neerlandés.
- Localización de interfaces y documentación: traducción de cadenas de UI, mensajes de error y textos de ayuda en flujos de desarrollo, dado el tamaño reducido del modelo y su licencia permisiva.
- Prototipado y demos interactivas: la demo OptimaMT/results permite comparar resultados y verificar la equivalencia de tokens, útil para validar la integración antes de desplegar.
- Entornos con restricciones de memoria: aplicaciones embebidas o contenedores con límites estrictos de RAM donde el ahorro del 47-49 % con `disable_quant_qdq = 1` respecto al original es determinante.
- Traducción de contenido generado por usuarios en comunidades bilingües inglés-neerlandés, con despliegue en el propio navegador del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de memoria tras la carga y la equivalencia de tokens:

| Configuración | Linux (MiB) | Windows (MiB) | Tokens idénticos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 557 → 296 (-47 %) | 533 → 270 (-49 %) | sí |
| Valores por defecto de ONNX Runtime | 230 → 197 (-14 %) | 206 → 173 (-16 %) | sí |

Medición realizada con ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en una máquina virtual).

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está pensado para CPU y navegador. No requiere GPU.
- GPU recomendadas: no disponible; no es un caso de uso contemplado en la información.
- Cabe en cualquier equipo consumer: el consumo de memoria tras la carga es de 173-197 MiB con los valores por defecto de ONNX Runtime y de 270-296 MiB con `disable_quant_qdq = 1`.
- Opciones de despliegue: transformers.js en navegador o Node.js, y ONNX Runtime en Python mediante el script `translate.py` del repositorio.
- Latencia y throughput: no disponibles; las mediciones publicadas se limitan al uso de memoria con ONNX Runtime 1.31.1, CPU y 4 hilos.

## Comparativa con modelos similares

| Modelo | Idiomas | Formato | Memoria tras carga | Licencia | Notas |
|---|---|---|---|---|---|
| OptimaMT/en-nl | en → nl | ONNX (transformers.js) | 173-197 MiB (por defecto); 270-296 MiB con `disable_quant_qdq` | CC BY 4.0 | Decodificador fusionado reconstruido; tokens idénticos al base |
| Xenova/opus-mt-en-nl | en → nl | ONNX (transformers.js) | 206-230 MiB (por defecto); 533-557 MiB con `disable_quant_qdq` | CC BY 4.0 | Artefacto de referencia del que deriva OptimaMT |
| Helsinki-NLP/opus-mt-en-nl | en → nl | PyTorch (safetensors/bin) | no disponible | CC BY 4.0 | Modelo original de OPUS-MT; requiere framework de inferencia distinto |

## Limitaciones y advertencias

- Es un traductor especializado en un único par de idiomas (en → nl); no admite otros idiomas ni direcciones distintas de traducción.
- No dispone de tool calling, agentes, visión ni razonamiento multi-paso; no debe evaluarse como modelo de propósito general.
- Riesgo de alucinación y de traducciones erróneas en dominios especializados (legal, médico, técnico), inherente a los modelos OPUS-MT de tamaño reducido; se recomienda revisión humana en contextos críticos.
- La longitud de contexto no está documentada en la información disponible; conviene validar el comportamiento con textos largos antes de usarlo en producción.
- Los pesos provienen de OPUS-MT y de la exportación de Xenova; cualquier sesgo o limitación de calidad del modelo original se hereda sin cambios.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a OPUS-MT (Universidad de Helsinki), a Xenova por la exportación ONNX y a OptimaMT por la modificación del grafo.
- Solo se reconstruye `onnx/decoder_model_merged_quantized.onnx`; el resto de archivos son copias byte a byte del original, por lo que el comportamiento depende de la revisión `c3a0541231a7` del modelo base.
- El repositorio es reciente (creado en noviembre de 2026) y no registra descargas ni valoraciones, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-nl
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-en-nl
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-nl
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe del método: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Demo de resultados: https://huggingface.co/spaces/OptimaMT/results
