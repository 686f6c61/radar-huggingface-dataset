# OptimaMT/ar-en

## Resumen

OptimaMT/ar-en es un modelo de traducción automática árabe-inglés derivado de Xenova/opus-mt-ar-en, que a su vez es una exportación a ONNX del modelo OPUS-MT de la Universidad de Helsinki. Lo desarrolla OptimaMT, un proyecto que publica versiones optimizadas de los modelos OPUS-MT en formato ONNX para su uso en entornos con recursos limitados, especialmente en el navegador mediante transformers.js. El modelo resuelve la traducción de texto entre árabe e inglés con un consumo de memoria reducido respecto al original.

La aportación principal no es un nuevo entrenamiento, sino una modificación del grafo del decodificador ONNX: se reconstruye únicamente el fichero `onnx/decoder_model_merged_quantized.onnx` moviendo la proyección de salida fuera de sus dos ramas y aplicando el modo rápido de ONNX Runtime (`disable_quant_qdq = 1`). Según el autor, esto produce entre 2,3 y 2,5 veces más velocidad y reduce el consumo de memoria entre un 46 % y un 49 % en Linux y Windows, manteniendo exactamente los mismos tokens de salida que el modelo original.

Es relevante ahora porque permite desplegar traducción árabe-inglés de calidad razonable en navegador o en máquinas sin GPU, con un peso de repositorio de 0,1 GB y una ventana de memoria de apenas 258-284 MiB tras la carga. Forma parte de una colección de 51 pares de idiomas con el mismo enfoque.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); modo rápido `disable_quant_qdq = 1` |
| Idiomas soportados | ar (árabe), en (inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo es un Marian de tipo encoder-decoder, la arquitectura estándar de la familia OPUS-MT de Helsinki-NLP. No se ha reentrenado: los pesos son idénticos a los de Xenova/opus-mt-ar-en en la revisión `09c755686640`, que a su vez proviene de Helsinki-NLP/opus-mt-ar-en. El vocabulario tiene 62.834 tokens.

La única modificación es de grafo: en el fichero `decoder_model_merged_quantized.onnx` se ha sacado la proyección de salida de las dos ramas del decodificador y se ha aplicado el modo rápido de ONNX Runtime. Todos los demás ficheros del repositorio son copias byte a byte del original. No hay información sobre el dataset de entrenamiento original, número de tokens ni si hubo RLHF o DPO; esos datos corresponden al modelo OPUS-MT de origen y no se detallan en la información disponible.

## Capacidades

- Traducción de texto de árabe a inglés (dirección única en este repositorio).
- Generación de texto secuencia a secuencia con decodificación greedy.
- Ejecución en navegador mediante transformers.js con ONNX Runtime Web.
- Ejecución en CPU con ONNX Runtime en Python (scripts propios del proyecto).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, visión ni audio.
- Capacidad multilingüe limitada al par ar-en.

## Casos de uso

- Traducción de pantalla en escritorio: el modelo se usa en OpenCircle, un traductor de pantalla para Windows y Linux que lo incorpora desde la versión v0.1.4; su bajo consumo de memoria (258-284 MiB tras la carga) lo hace adecuado para ejecutarse en segundo plano junto a otras aplicaciones.
- Traducción en el navegador sin backend: con transformers.js y `dtype: "q8"` se puede traducir texto árabe directamente en el cliente, sin enviar datos a un servidor, útil para privacidad y para reducir costes de infraestructura.
- Procesamiento por lotes en CPU: el script `translate.py` basado en onnxruntime, sentencepiece y numpy permite traducir corpus completos en máquinas sin GPU, con un throughput superior al del modelo original gracias al modo rápido.
- Traducción de contenido web y foros: al integrarse en extensiones o widgets, permite mostrar contenido árabe en inglés en tiempo real con latencia baja en CPU.
- Preprocesado para pipelines de NLP: traducir texto árabe a inglés antes de pasarlo a modelos de análisis de sentimiento, clasificación o resumen entrenados principalmente en inglés.
- Herramientas de accesibilidad y documentación: traducción de mensajes, correos o documentación de usuario en aplicaciones de escritorio ligeras que no pueden asumir el coste de un modelo grande.
- Prototipado rápido de sistemas de traducción: al ser un drop-in replacement del modelo de Xenova, permite sustituirlo sin cambios de código y evaluar mejoras de rendimiento de forma inmediata.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FLORES-200 devtest (1.012 frases), BLEU | 33,43 |
| FLORES-200 devtest (1.012 frases), chrF | 60,37 |
| Modo de decodificación | greedy |
| Memoria tras carga, Linux, `disable_quant_qdq = 1` | 529 → 284 MiB (-46 %) |
| Memoria tras carga, Windows, `disable_quant_qdq = 1` | 504 → 258 MiB (-49 %) |
| Memoria tras carga, Linux, valores por defecto de ONNX Runtime | 283 → 222 MiB (-22 %) |
| Memoria tras carga, Windows, valores por defecto de ONNX Runtime | 196 → 167 MiB (-15 %) |
| Tokens idénticos al original | sí |
| Aceleración declarada | 2,3-2,5× |

Mediciones realizadas con ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en una máquina virtual). No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU y navegador.
- Memoria RAM tras la carga: aproximadamente 258-284 MiB con `disable_quant_qdq = 1`; 167-222 MiB con los valores por defecto de ONNX Runtime.
- GPU: no requiere GPU; no se han publicado datos de rendimiento en GPU.
- Cabe en cualquier equipo de consumo, incluidos portátiles modestos y navegadores.
- Despliegue: transformers.js (navegador y Node.js), ONNX Runtime en Python, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no se han publicado cifras absolutas de latencia o tokens por segundo; solo la aceleración relativa de 2,3-2,5× frente al modelo original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/ar-en | no disponible | no disponible | ar, en | CC BY 4.0 | ONNX | Decodificador optimizado, 2,3-2,5× más rápido y ~46-49 % menos memoria |
| Xenova/opus-mt-ar-en | no disponible | no disponible | ar, en | CC BY 4.0 | ONNX | Modelo base del que deriva; mismas traducciones, más memoria y latencia |
| Helsinki-NLP/opus-mt-ar-en | no disponible | no disponible | ar, en | CC BY 4.0 | PyTorch (safetensors/bin) | Modelo original de OPUS-MT; requiere framework completo |

## Limitaciones y advertencias

- Solo traduce en la dirección árabe → inglés; no soporta la dirección inversa.
- Calidad limitada por el modelo OPUS-MT original: BLEU 33,43 y chrF 60,37 en FLORES-200 devtest, lejos de sistemas neuronales de mayor tamaño.
- Riesgo de alucinación y de traducciones erróneas en textos especializados, dominios técnicos o lenguaje coloquial.
- No se han publicado análisis de sesgos; al heredar los datos de OPUS-MT, puede reproducir sesgos presentes en corpus paralelos.
- Longitud de contexto no documentada; no es adecuado para documentos muy largos sin segmentación previa.
- Licencia CC BY 4.0: permite uso comercial con atribución; hay que conservar los créditos a OPUS-MT (Universidad de Helsinki) y a Xenova.
- La aceleración declarada se ha medido en CPU con 4 hilos y ONNX Runtime 1.31.1; el rendimiento puede variar en otros entornos.
- El repositorio solo contiene el decodificador reconstruido; el resto de ficheros son copias del modelo original, por lo que cualquier cambio en el modelo base no se refleja automáticamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ar-en
- Colección de los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Repositorio del proyecto: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- OpenCircle (aplicación que lo usa): https://github.com/AmerAlreyahi/OpenCircle
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-ar-en
- Modelo OPUS-MT original: https://huggingface.co/Helsinki-NLP/opus-mt-ar-en
