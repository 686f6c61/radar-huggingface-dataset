# OptimaMT/en-uk

## Resumen

OptimaMT/en-uk es una conversión a ONNX del modelo de traducción automática Xenova/opus-mt-en-uk, que a su vez deriva del modelo OPUS-MT de la Universidad de Helsinki para el par inglés-ucraniano. El modelo original emplea una arquitectura transformer encoder-decoder de tipo Marian, entrenada específicamente para traducción. OptimaMT publica esta variante con un decodificador fusionado y cuantizado que reduce el consumo de memoria en tiempo de ejecución sin alterar los tokens generados.

La propuesta de valor de OptimaMT/en-uk no es un nuevo modelo entrenado, sino una optimización de despliegue: solo se reconstruye el fichero `onnx/decoder_model_merged_quantized.onnx`, mientras que el resto de ficheros son idénticos byte a byte al export original de Xenova. Según la model card, la memoria tras la carga baja de 519 a 279 MiB en Linux (-46 %) y de 494 a 256 MiB en Windows (-48 %) con `disable_quant_qdq = 1`, manteniendo tokens idénticos en las pruebas realizadas.

Es relevante para desarrolladores que necesitan traducción en el navegador o en entornos con recursos limitados mediante transformers.js y ONNX Runtime, ya que ofrece un modelo pequeño (repo de 0,1 GB) con licencia CC BY 4.0 y una API de uso directa. Forma parte del proyecto OptimaMT, que cubre 49 pares de idiomas bajo el patrón `OptimaMT/<src>-<tgt>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); fichero `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | inglés (en) y ucraniano (uk) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); repo de 0,1 GB |
| Vocabulario | 61.587 tokens |
| Modelo base | Xenova/opus-mt-en-uk (revision `e6ca58729298`) |
| Autor | OptimaMT |
| Libreria | transformers.js |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian de OPUS-MT, un transformer encoder-decoder diseñado para traducción automática neuronal. Al ser una conversión del export ONNX de Xenova, no incorpora entrenamiento adicional por parte de OptimaMT: los pesos proceden del modelo OPUS-MT de la Universidad de Helsinki y la exportación a ONNX de Xenova. La modificación introducida por OptimaMT consiste en mover la proyección de salida del decodificador fuera de sus dos ramas (cambio únicamente en el grafo) y reconstruir el fichero del decodificador fusionado cuantizado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que la model card no detalla el proceso de entrenamiento del modelo original. La innovación destacable es la reducción de memoria en carga (hasta un 48 % en Windows con `disable_quant_qdq = 1`) manteniendo la identidad de tokens, medida con ONNX Runtime 1.31.1 en CPU con 4 hilos.

## Capacidades

- Traducción de texto inglés a ucraniano (pipeline `translation`).
- Generación de texto secuencia a secuencia mediante transformers.js (`text2text-generation`).
- Ejecución en navegador y en Node.js a través de ONNX Runtime Web/Node.
- Inferencia en CPU sin necesidad de GPU.
- Uso mediante script Python con onnxruntime, sentencepiece y numpy (`translate.py`).
- Compatibilidad con opciones de sesión de ONNX Runtime, como `disable_quant_qdq`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Traducción en el navegador: integración con transformers.js para traducir contenido inglés-ucraniano en el cliente sin enviar texto a un servidor, aprovechando el tamaño reducido del repo (0,1 GB) y la ejecución en CPU.
- Aplicaciones web multilingües: traducción bajo demanda de interfaces o contenidos de usuario en sitios que atienden a hablantes de ucraniano, con carga del modelo en memoria de unos 279 MiB en Linux.
- Procesamiento por lotes en servidores sin GPU: uso de `translate.py` con onnxruntime para traducir corpus de documentos en pipelines ETL, donde el ahorro de memoria permite más instancias concurrentes.
- Extensiones o herramientas de escritorio: traducción local de textos en aplicaciones Electron o similares mediante ONNX Runtime, sin dependencia de servicios en la nube.
- Prototipado rápido de sistemas de traducción: al ser un drop-in de Xenova/opus-mt-en-uk con la misma API, permite sustituir el modelo en proyectos existentes para reducir memoria sin cambiar el código.
- Investigación en eficiencia de despliegue: reproducción de los resultados de memoria y verificación de identidad de tokens con el método documentado en REPORT.md, útil para evaluar técnicas de fusión de grafos en ONNX.

## Benchmarks y rendimiento

La model card no incluye métricas de calidad de traducción (BLEU, COMET, etc.). Los únicos datos publicados son de memoria tras la carga y de identidad de tokens:

| Metrica | Antes | Despues | Variacion |
|---|---:|---:|---:|
| Memoria tras carga, Linux (`disable_quant_qdq = 1`) | 519 MiB | 279 MiB | -46 % |
| Memoria tras carga, Windows (`disable_quant_qdq = 1`) | 494 MiB | 256 MiB | -48 % |
| Memoria tras carga, Linux (defaults ONNX Runtime) | 277 MiB | 217 MiB | -22 % |
| Memoria tras carga, Windows (defaults ONNX Runtime) | 195 MiB | 163 MiB | -16 % |
| Identidad de tokens | — | sí | sin cambios |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en una máquina virtual).

No se han publicado resultados de benchmarks de calidad de traducción en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el modelo está pensado para ejecución en CPU vía ONNX Runtime. Para GPU no se proporcionan estimaciones.
- Memoria RAM: aproximadamente 279 MiB tras la carga en Linux con `disable_quant_qdq = 1` y 256 MiB en Windows; con los valores por defecto de ONNX Runtime, 217 MiB (Linux) y 163 MiB (Windows).
- GPU recomendadas: no se documentan; el modelo se ejecuta en CPU con 4 hilos en las pruebas del autor.
- Cabe en cualquier equipo consumer: el repo ocupa 0,1 GB y la memoria en ejecución es inferior a 300 MiB.
- Opciones de despliegue: transformers.js (`@huggingface/transformers`) con `dtype: "q8"` y `session_options`; ONNX Runtime directamente mediante `translate.py` (onnxruntime, sentencepiece, numpy).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/en-uk | no disponible | no disponible | en, uk | CC BY 4.0 | ONNX | Decodificador fusionado; -46/-48 % de memoria con `disable_quant_qdq = 1` |
| Xenova/opus-mt-en-uk | no disponible | no disponible | en, uk | CC BY 4.0 | ONNX | Export original del que deriva; misma calidad de tokens |
| Helsinki-NLP/opus-mt-en-uk | no disponible | no disponible | en, uk | CC BY 4.0 | safetensors/PyTorch (formato original OPUS-MT) | Modelo de origen de la familia OPUS-MT |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento de traducción entre estas variantes; la comparación se limita a linaje, formato y consumo de memoria.

## Limitaciones y advertencias

- Solo traduce inglés a ucraniano; no soporta otros pares de idiomas.
- Al derivar de OPUS-MT, hereda los sesgos y limitaciones del corpus de entrenamiento original, que no se detalla en la model card.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados, textos con jerga o entradas ambiguas; no se publican métricas de calidad que permitan acotar el error.
- La longitud de contexto no está documentada; entradas largas pueden truncarse o degradar la calidad.
- La licencia CC BY 4.0 permite uso comercial con atribución; es necesario citar a los autores originales (Universidad de Helsinki, exportación de Xenova y modificación de OptimaMT).
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria publicada.
- Los datos de memoria proceden de una única configuración (ONNX Runtime 1.31.1, CPU, 4 hilos) y pueden variar en otros entornos.
- Solo se reconstruye el fichero del decodificador cuantizado; el resto de ficheros son idénticos al export original, por lo que cualquier limitación de Xenova/opus-mt-en-uk se mantiene.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-uk
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-en-uk
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-uk
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe del método: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
