# OptimaMT/pt-en

## Resumen

OptimaMT/pt-en es un modelo de traducción automática portugués-inglés derivado de Xenova/opus-mt-ROMANCE-en, a su vez una exportación ONNX del modelo OPUS-MT de la Universidad de Helsinki. Lo desarrolla el proyecto OptimaMT, que publica una colección de 51 pares de idiomas bajo la misma metodología. El modelo no introduce pesos nuevos: reutiliza los pesos originales de OPUS-MT y modifica únicamente el grafo del decodificador combinado en formato ONNX para reducir el consumo de memoria en tiempo de ejecución.

La relevancia práctica reside en su eficiencia: aplicando la opción `disable_quant_qdq = 1` de ONNX Runtime en modo rápido, el modelo reduce el uso de memoria tras la carga de 543 a 291 MiB en Linux (un 46 % menos) manteniendo exactamente los mismos tokens de salida que el original. En la configuración por defecto de ONNX Runtime la reducción es del 22 % (de 291 a 227 MiB). Está pensado para despliegues ligeros en navegador o escritorio mediante transformers.js, y de hecho se usa en producción en la aplicación OpenCircle.

Arquitectura Marian de tipo encoder-decoder, orientada a traducción, con un vocabulario de 65.001 tokens y licencia CC BY 4.0. En FLORES-200 devtest (1.012 frases) obtiene BLEU 44,75 y chrF 69,08 en decodificación voraz, idénticos a los del modelo base del que procede.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian / OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8); opción `disable_quant_qdq` de ONNX Runtime |
| Idiomas soportados | Portugués (pt) → inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de ficheros idénticos al original) |
| Vocabulario | 65.001 tokens |
| Tamaño del repositorio | 0,1 GB |
| Librería | transformers.js |
| Modelo base | Xenova/opus-mt-ROMANCE-en (revisión `f60feaabe8bb`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de la familia Marian, la arquitectura empleada por OPUS-MT de la Universidad de Helsinki. No se ha reentrenado: los pesos son los de OPUS-MT (vía la exportación ONNX de Xenova) y la única modificación es de grafo. Concretamente, la proyección de salida del decodificador se ha sacado de sus dos ramas, un cambio puramente estructural que no altera los pesos ni la tokenización.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni si hubo ajuste fino con RLHF o DPO, ya que la model card no lo detalla y el modelo hereda las características del OPUS-MT original. La innovación destacable es la optimización del decodificador combinado para ONNX Runtime en modo rápido (`disable_quant_qdq = 1`), que según el autor acelera la inferencia entre 2,3 y 2,5 veces y reduce a la mitad la memoria, manteniendo traducciones idénticas token a token.

## Capacidades

- Traducción de texto directa portugués → inglés, unidireccional.
- Generación de texto secuencial (text2text-generation) con decodificación voraz.
- Inferencia en navegador y en Node.js mediante transformers.js con backend ONNX.
- Inferencia en Python vía onnxruntime, sentencepiece y numpy (script `translate.py`).
- Ejecución en CPU con pocos recursos: 291 MiB tras la carga con la configuración optimizada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo thinking.
- Capacidad multilingüe limitada al par pt-en.

## Casos de uso

- Traducción de pantalla en escritorio: integrado en OpenCircle (Windows y Linux) desde la versión v0.1.4, el modelo traduce texto en pantalla al vuelo con un consumo de memoria contenido, adecuado para equipos sin GPU dedicada.
- Traducción en el navegador sin servidor: mediante transformers.js, permite traducir contenido portugués a inglés íntegramente en el cliente, sin enviar texto a un backend y sin coste de infraestructura.
- Preprocesado de corpus para NLP: conversión de documentación, artículos o reseñas en portugués a inglés antes de pasarlos a pipelines de análisis de sentimiento, clasificación o indexación de búsqueda.
- Localización de documentación técnica: traducción de manuales y notas de versión de productos con base en portugués, con la ventaja de que el modelo cabe en un contenedor pequeño y arranca rápido.
- Traducción por lotes en CPU: al ejecutarse en ONNX Runtime con 4 hilos y bajo consumo de memoria, es viable procesar grandes volúmenes en servidores sin GPU.
- Asistencia a la lectura para usuarios lusófonos: traducción de correos, mensajes o páginas web en tiempo real dentro de aplicaciones de escritorio o extensiones.
- Prototipado de sistemas de traducción: servir como línea base ligera y reproducible (BLEU 44,75 en FLORES-200) para comparar con modelos mayores.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| FLORES-200 devtest (1.012 frases) | BLEU | 44,75 |
| FLORES-200 devtest (1.012 frases) | chrF | 69,08 |

Mediciones de memoria tras la carga (ONNX Runtime 1.31.1, CPU, 4 hilos, solo Linux):

| Configuración | Memoria | Tokens idénticos |
|---|---|---|
| `disable_quant_qdq = 1` | 543 → 291 MiB (-46 %) | sí |
| Valores por defecto de ONNX Runtime | 291 → 227 MiB (-22 %) | sí |

El autor indica una aceleración de 2,3 a 2,5 veces con el modo rápido. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para CPU. Consumo de memoria tras la carga de 291 MiB con `disable_quant_qdq = 1` y 227 MiB con los valores por defecto de ONNX Runtime.
- GPU recomendadas: no aplica; no se documenta ejecución en GPU.
- Cabe en cualquier GPU de consumo e incluso en sistemas sin GPU dedicada; el repositorio ocupa 0,1 GB.
- Despliegue: transformers.js (navegador y Node.js), onnxruntime en Python, y cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este formato.
- Latencia y throughput: el autor reporta una mejora de 2,3 a 2,5 veces con el modo rápido de ONNX Runtime frente a la configuración por defecto, medida en CPU con 4 hilos en Linux (sin datos en Windows). No se publican cifras absolutas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/pt-en | Marian (ONNX) | pt → en | no disponible | CC BY 4.0 | ONNX | Decodificador optimizado, 291 MiB tras carga |
| Xenova/opus-mt-ROMANCE-en | Marian (ONNX) | ROMANCE → en (incluye pt) | no disponible | CC BY 4.0 | ONNX | Modelo base; mismo BLEU y chrF; mayor consumo de memoria |
| Helsinki-NLP/opus-mt-ROMANCE-en | Marian | ROMANCE → en (incluye pt) | no disponible | CC BY 4.0 | safetensors / PyTorch | Pesos originales de OPUS-MT; requiere exportación para ONNX |

La comparativa se limita a la familia OPUS-MT porque la información disponible no incluye datos de otros sistemas de traducción pt-en.

## Limitaciones y advertencias

- Traducción unidireccional: solo portugués → inglés; no traduce en sentido inverso.
- Modelo de dominio general entrenado sobre corpus OPUS; puede degradarse en jerga muy técnica, dialectos o texto informal.
- Riesgo de alucinación y de omisiones en frases largas o ambiguas, habitual en modelos Marian de tamaño reducido.
- No se documenta la longitud máxima de contexto; conviene fragmentar entradas largas.
- No soporta tool calling, agentes, visión ni audio.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar a OPUS-MT (Universidad de Helsinki), la exportación de Xenova y la modificación de OptimaMT.
- Las mediciones de memoria y velocidad se han realizado únicamente en Linux con ONNX Runtime 1.31.1 y 4 hilos; el rendimiento en Windows no está medido.
- El rendimiento está validado con decodificación voraz; no se documentan resultados con beam search.
- Al ser una copia modificada del modelo base, cualquier cambio en la revisión `f60feaabe8bb` de Xenova/opus-mt-ROMANCE-en podría afectar a la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/pt-en
- Colección OptimaMT (51 pares): https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Repositorio del proyecto: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- OpenCircle (aplicación que lo usa en producción): https://github.com/AmerAlreyahi/OpenCircle
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-ROMANCE-en
- Pesos originales OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-ROMANCE-en
