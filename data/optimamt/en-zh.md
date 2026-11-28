# OptimaMT/en-zh

## Resumen

OptimaMT/en-zh es una reexportación optimizada del modelo de traducción automática Xenova/opus-mt-en-zh, que a su vez deriva del OPUS-MT de la Universidad de Helsinki para el par inglés-chino. El modelo mantiene exactamente los mismos pesos y produce las mismas traducciones que el original, pero sustituye el decodificador fusionado cuantizado por una versión más ligera que aprovecha el modo rápido de ONNX Runtime (`disable_quant_qdq = 1`), reduciendo el consumo de memoria entre un 47 % y un 49 % en Linux y Windows respectivamente, con una mejora de velocidad de 2,3 a 2,5 veces.

La arquitectura es la clásica Marian NMT (transformer encoder-decoder) con 65.001 tokens de vocabulario, empaquetada en formato ONNX para su uso con transformers.js y ONNX Runtime. Está pensada para despliegues en navegador, escritorio o entornos con recursos limitados donde el modelo original resultaba demasiado pesado.

Su relevancia actual radica en que demuestra que es posible reducir drásticamente el coste de inferencia de un modelo de traducción sin sacrificar calidad, manteniendo compatibilidad byte a byte con el resto de ficheros del export original. Forma parte de la colección OptimaMT de 51 pares de idiomas y ya se usa en producción en la aplicación de escritorio OpenCircle.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ONNX cuantizado (`decoder_model_merged_quantized.onnx`); dtype `q8` en transformers.js |
| Idiomas soportados | inglés (en) y chino (zh, variante `cmn_Hans`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js / ONNX Runtime) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Marian, la arquitectura estándar de la familia OPUS-MT de Helsinki-NLP. No se trata de un modelo entrenado desde cero por OptimaMT: los pesos son idénticos a los de Xenova/opus-mt-en-zh en la revisión `046f55aec303`, que a su vez exporta a ONNX el OPUS-MT original de la Universidad de Helsinki. El vocabulario consta de 65.001 tokens y el modelo requiere el prefijo de variante de destino `>>cmn_Hans<<` al inicio de cada entrada.

La única modificación respecto al export original es de grafo: se ha reconstruido únicamente `onnx/decoder_model_merged_quantized.onnx`, moviendo la proyección de salida del decodificador fuera de sus dos ramas. Todos los demás ficheros son idénticos byte a byte. Con `disable_quant_qdq = 1` en ONNX Runtime se activa el modo rápido, que reduce la memoria tras la carga de 545 a 291 MiB en Linux y de 519 a 263 MiB en Windows, manteniendo tokens de salida idénticos. No se dispone de información sobre el dataset de entrenamiento original, número de tokens ni procesos de RLHF o DPO en la documentación proporcionada.

## Capacidades

- Traducción automática directa de inglés a chino simplificado (`cmn_Hans`).
- Generación de texto secuencia a secuencia mediante pipeline `translation` de transformers.js.
- Ejecución en ONNX Runtime con cuantización q8, apta para CPU.
- Compatibilidad con el ecosistema transformers.js 3.x (la 4.3.2 divide el token de variante, incluso con el export original).
- Uso desde Python mediante `onnxruntime`, `sentencepiece` y `numpy` (script `translate.py` incluido).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción integrada en aplicaciones de escritorio: OpenCircle, traductor de pantalla para Windows y Linux, distribuye estos modelos desde la versión 0.1.4; el bajo consumo de memoria (menos de 300 MiB tras la carga) lo hace viable en equipos de usuario final sin GPU dedicada.
- Traducción en el navegador con transformers.js: al ejecutarse sobre ONNX Runtime Web, permite traducir contenido en cliente sin enviar texto a un servidor, útil para extensiones o aplicaciones web con requisitos de privacidad.
- Procesamiento por lotes en servidores CPU: el modo rápido de ONNX Runtime ofrece entre 2,3 y 2,5 veces más velocidad que el export original, lo que reduce el coste por documento en pipelines de localización de documentación técnica o contenidos web.
- Traducción de interfaces y cadenas de software: el modelo es adecuado para localizar ficheros de recursos y mensajes de UI del inglés al chino simplificado, con un consumo de recursos compatible con contenedores pequeños.
- Preprocesamiento en pipelines de NLP multilingüe: traducción previa al inglés o al chino para alimentar sistemas de análisis de sentimiento, búsqueda o clasificación que solo operan en esos idiomas.
- Prototipado y evaluación de sistemas de traducción: al producir exactamente las mismas salidas que el modelo original con menor huella de memoria, sirve como referencia reproducible en pruebas comparativas o de regresión.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| FLORES-200 devtest (1.012 frases), BLEU | 31,63 |
| FLORES-200 devtest (1.012 frases), chrF | 28,29 |
| Memoria tras carga, Linux (`disable_quant_qdq = 1`) | 291 MiB (desde 545 MiB, -47 %) |
| Memoria tras carga, Windows (`disable_quant_qdq = 1`) | 263 MiB (desde 519 MiB, -49 %) |
| Memoria tras carga, Linux (por defecto) | 227 MiB (desde 291 MiB, -22 %) |
| Memoria tras carga, Windows (por defecto) | 173 MiB (desde 201 MiB, -14 %) |
| Velocidad relativa | 2,3–2,5× más rápido que el original |

Medido con ONNX Runtime 1.31.1 en CPU con 4 hilos (Linux nativo, Windows en máquina virtual), decodificación greedy. Las traducciones son idénticas a las del modelo original.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está diseñado para inferencia en CPU.
- Memoria RAM tras la carga: aproximadamente 173–291 MiB según plataforma y configuración de ONNX Runtime.
- GPU recomendadas: no aplica; no se documenta soporte GPU específico.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0,1 GB y la inferencia en CPU con 4 hilos es viable en portátiles convencionales.
- Opciones de despliegue: transformers.js 3.x (navegador o Node.js), ONNX Runtime (Python con `onnxruntime`, `sentencepiece` y `numpy`), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no se publican cifras absolutas de latencia o tokens por segundo; solo se indica la mejora relativa de 2,3–2,5× frente al export original.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Memoria tras carga | Licencia |
|---|---|---|---|---|---|
| OptimaMT/en-zh | Marian NMT | en → zh | ONNX cuantizado | 173–291 MiB | CC BY 4.0 |
| Xenova/opus-mt-en-zh | Marian NMT | en → zh | ONNX cuantizado | 201–545 MiB | CC BY 4.0 |
| Helsinki-NLP/opus-mt-en-zh | Marian NMT | en → zh | PyTorch (safetensors/bin) | no disponible | CC BY 4.0 |

La diferencia principal frente a Xenova/opus-mt-en-zh es el consumo de memoria y la velocidad, con salidas idénticas. Frente al OPUS-MT original de Helsinki-NLP, la ventaja es el formato ONNX listo para transformers.js y ONNX Runtime, sin necesidad de conversión. No se dispone de datos de benchmarks comparativos con otros sistemas de traducción en la información proporcionada.

## Limitaciones y advertencias

- Solo traduce inglés a chino simplificado; no cubre chino tradicional ni la dirección inversa.
- Requiere anteponer el token `>>cmn_Hans<<` a cada entrada; omitirlo puede degradar la calidad o producir resultados incorrectos.
- Es necesario usar transformers.js 3.x: la versión 4.3.2 divide el token de variante incluso con el export original.
- Riesgo de alucinación y errores en frases ambiguas, jerga técnica muy específica o textos con formato complejo, inherente a los modelos NMT de este tamaño.
- No se documentan evaluaciones de sesgo; al derivar de OPUS-MT, puede heredar sesgos presentes en los corpus de entrenamiento originales.
- La licencia CC BY 4.0 permite uso comercial con atribución; es obligatorio citar a los autores originales (Universidad de Helsinki, export de Xenova y modificación de OptimaMT).
- El modelo no incluye mecanismos de seguridad o filtrado de contenido; en producción conviene añadir capas de validación.
- Solo se ha reconstruido el decodificador cuantizado; otras variantes de cuantización no están optimizadas con este método.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-zh
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-en-zh
- OPUS-MT original (Helsinki-NLP): https://huggingface.co/Helsinki-NLP/opus-mt-en-zh
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Aplicación OpenCircle: https://github.com/AmerAlreyahi/OpenCircle
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Colección de los 51 pares de idiomas: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
