# OptimaMT/en-ru

## Resumen

OptimaMT/en-ru es una conversión a ONNX del modelo de traducción automática Xenova/opus-mt-en-ru, que a su vez deriva del modelo OPUS-MT de la Universidad de Helsinki para el par inglés-ruso. El autor, OptimaMT, publica este artefacto como parte de una colección de 49 pares de idiomas bajo el mismo esquema de nombres (`OptimaMT/<src>-<tgt>`). El modelo mantiene los pesos y el vocabulario originales (62.518 tokens) y solo modifica el grafo del decodificador fusionado para reducir el consumo de memoria en tiempo de inferencia.

La propuesta de valor no es una mejora de calidad de traducción, sino una optimización de despliegue: el decodificador fusionado reconstruido permite reducir el uso de memoria tras la carga entre un 46 % y un 49 % en Linux con la opción `disable_quant_qdq = 1`, y entre un 14 % y un 22 % con la configuración por defecto de ONNX Runtime, manteniendo tokens de salida idénticos. Está pensado para ejecutarse en el navegador o en entornos de bajos recursos mediante transformers.js y ONNX Runtime en CPU.

Por su naturaleza, es un modelo pequeño (repo de 0,1 GB) orientado exclusivamente a traducción en/r u, sin capacidades de razonamiento, código ni tool calling. Su relevancia radica en ser un ejemplo de optimización de artefactos ONNX para despliegue ligero en el ecosistema transformers.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); decoder fusionado cuantizado |
| Idiomas soportados | en, ru |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de ficheros originales) |
| Vocabulario | 62.518 tokens |
| Tamano del repo | 0,1 GB |
| Libreria | transformers.js |
| Modelo base | Xenova/opus-mt-en-ru (revision `e050376e9601`) |

## Arquitectura y entrenamiento

El modelo es una copia directa de Xenova/opus-mt-en-ru, que a su vez es la exportación ONNX del modelo OPUS-MT de la Universidad de Helsinki. La arquitectura subyacente es Marian, un transformer encoder-decoder clásico para traducción automática neuronal. No se ha realizado ningún reentrenamiento ni ajuste fino: los pesos, tokens y vocabulario son idénticos al original.

La única modificación técnica es un cambio de grafo: la proyección de salida del decodificador se ha movido fuera de sus dos ramas en el decodificador fusionado, y solo se reconstruye `onnx/decoder_model_merged_quantized.onnx`; el resto de ficheros son byte a byte los originales. Según la model card, esta modificación mantiene tokens de salida idénticos y reduce la memoria tras la carga de 525 a 281 MiB (-46 %) en Linux y de 500 a 257 MiB (-49 %) en Windows con `disable_quant_qdq = 1`, y de 281 a 220 MiB (-22 %) en Linux y de 195 a 167 MiB (-14 %) en Windows con los valores por defecto de ONNX Runtime. Las mediciones se realizaron con ONNX Runtime 1.31.1 en CPU con 4 hilos.

## Capacidades

- Traducción automática de inglés a ruso.
- Generación de texto secuencial mediante pipeline `translation` de transformers.js.
- Ejecución en CPU y en navegador mediante ONNX Runtime y transformers.js.
- Inferencia con cuantización q8 (`dtype: "q8"`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo thinking.
- Capacidad multilingüe limitada exclusivamente al par en→ru.

## Casos de uso

- Traducción de documentación técnica en inglés a ruso en pipelines de CI/CD: el modelo puede integrarse como paso de localización automática de READMEs y guías, con bajo consumo de memoria (281 MiB en Linux con `disable_quant_qdq = 1`) para ejecutarse en runners modestos.
- Traducción en el navegador sin backend: gracias a transformers.js y al formato ONNX cuantizado, se puede desplegar como traductor cliente-side en una aplicación web, evitando enviar texto a un servidor.
- Preprocesado de corpus para investigación en PLN: traducción masiva de textos en inglés a ruso para construir datasets bilingües o aumentar datos de entrenamiento.
- Traducción de contenido de soporte y atención al cliente: integración en un servicio que reciba consultas en inglés y las traduzca a ruso antes de pasarlas a un agente o a otro modelo.
- Traducción de subtítulos o textos cortos en aplicaciones de escritorio: el tamaño reducido del repo (0,1 GB) y la ejecución en CPU permiten empaquetarlo en aplicaciones ligeras.
- Evaluación comparativa de artefactos ONNX optimizados: útil como referencia para medir el impacto de cambios de grafo en memoria y latencia frente al modelo base Xenova/opus-mt-en-ru.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, COMET, etc.) en la informacion disponible. La model card solo reporta métricas de memoria tras la carga:

| Configuracion | Linux (MiB) | Windows (MiB) | Tokens identicos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 525 → 281 (-46 %) | 500 → 257 (-49 %) | si |
| ONNX Runtime defaults | 281 → 220 (-22 %) | 195 → 167 (-14 %) | si |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en una VM).

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; el modelo está pensado para ONNX Runtime en CPU. En GPU, la memoria necesaria sería mínima dado el tamaño del repo (0,1 GB), pero no se proporcionan cifras.
- GPU recomendadas: no disponible; el caso de uso documentado es CPU.
- Cabe en cualquier equipo consumer: el consumo tras la carga es de 167-281 MiB según configuración y plataforma.
- Opciones de despliegue: transformers.js (`@huggingface/transformers`), ONNX Runtime (Python con `onnxruntime`, `sentencepiece`, `numpy`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/en-ru | no disponible | no disponible | en, ru | cc-by-4.0 | ONNX | Decoder fusionado optimizado, -46 % memoria |
| Xenova/opus-mt-en-ru | no disponible | no disponible | en, ru | cc-by-4.0 | ONNX | Modelo base; sin optimización de grafo |
| Helsinki-NLP/opus-mt-en-ru | no disponible | no disponible | en, ru | cc-by-4.0 | PyTorch (safetensors) | Modelo original OPUS-MT; requiere conversión a ONNX |

## Limitaciones y advertencias

- Solo traduce de inglés a ruso; no soporta otros pares ni direccionalidad inversa.
- No se han publicado evaluaciones de calidad de traducción (BLEU, COMET) en la información disponible; no hay garantía documentada de fidelidad más allá de la del modelo base.
- Riesgo de alucinación y errores de traducción inherente a los modelos Marian de tamaño pequeño, especialmente en dominios técnicos o textos largos.
- Longitud de contexto no documentada; no apto para documentos muy largos sin segmentación.
- Sesgos: no documentados en la información proporcionada; al derivar de OPUS-MT, puede heredar sesgos de los corpus de entrenamiento originales.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar a la Universidad de Helsinki (OPUS-MT), a Xenova por la exportación ONNX y a OptimaMT por la modificación del grafo.
- El modelo se publicó el 2026-11-09 con 0 descargas y 0 likes; no hay evidencia de uso en producción ni validación comunitaria.
- La optimización depende de la opción `disable_quant_qdq` de ONNX Runtime; sin ella, la reducción de memoria es menor (-14 % a -22 %).

## Enlaces

- Hugging Face: https://huggingface.co/OptimaMT/en-ru
- Repositorio del proyecto: https://github.com/AmerAlreyahi/OptimaMT
- Informe del método: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Demo de resultados: https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-en-ru
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-ru
