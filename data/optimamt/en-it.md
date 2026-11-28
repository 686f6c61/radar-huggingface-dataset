# OptimaMT/en-it

## Resumen

OptimaMT/en-it es una reexportación optimizada del modelo de traducción automática Xenova/opus-mt-en-it, que a su vez deriva del modelo OPUS-MT de la Universidad de Helsinki. Se trata de un modelo Marian de traducción inglés-italiano, convertido a formato ONNX para su uso con Transformers.js y ONNX Runtime, con el objetivo de reducir el consumo de memoria y acelerar la inferencia en CPU sin alterar las traducciones producidas.

La modificación principal consiste en una reescritura del grafo del decodificador fusionado cuantizado (`decoder_model_merged_quantized.onnx`), moviendo la proyección de salida fuera de sus dos ramas. Esto permite activar el modo rápido de ONNX Runtime (`disable_quant_qdq = 1`), lo que según el autor reduce el uso de memoria entre un 48 % y un 51 % en Linux y Windows respectivamente, con una aceleración de 2,3 a 2,5 veces, manteniendo exactamente los mismos tokens de salida que el modelo original.

El modelo está pensado para despliegues ligeros en navegador o en aplicaciones de escritorio, y el autor indica que se usa en producción en OpenCircle, un traductor de pantalla para Windows y Linux. Forma parte de una colección de 51 pares de idiomas bajo la misma metodología de optimización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8, `decoder_model_merged_quantized.onnx`) |
| Idiomas soportados | en (ingles), it (italiano) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (Transformers.js); resto de ficheros copiados del original |
| Vocabulario | 80.035 tokens |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Xenova/opus-mt-en-it (revision `075406e3c8c2`) |

## Arquitectura y entrenamiento

El modelo es un Marian de traducción automática neuronal, la arquitectura empleada por la familia OPUS-MT de la Universidad de Helsinki. Consta de un encoder y un decoder transformer con atención estándar; el vocabulario compartido tiene 80.035 tokens. No se dispone de información en la fuente sobre el número de parámetros totales, la composición del corpus de entrenamiento ni si se aplicaron técnicas de ajuste fino adicionales (RLHF/DPO); estos datos corresponden al modelo original OPUS-MT y no se detallan en la model card de esta reexportación.

La innovación técnica de esta versión no reside en el entrenamiento, sino en la optimización del grafo ONNX: el autor reconstruye únicamente el fichero `decoder_model_merged_quantized.onnx`, moviendo la proyección de salida del decodificador fuera de sus dos ramas. Este cambio de grafo habilita el modo rápido de ONNX Runtime (`disable_quant_qdq = 1`), que elimina las operaciones de cuantización/descuantización redundantes en tiempo de ejecución. El resto de ficheros del repositorio son copias byte a byte del modelo original de Xenova. Los pesos subyacentes son los de OPUS-MT, sin reentrenamiento.

## Capacidades

- Traducción de texto inglés a italiano, tarea única del pipeline `translation`.
- Generación de texto secuencia a secuencia mediante el pipeline `text2text-generation` de Transformers.js.
- Inferencia en navegador y en aplicaciones de escritorio mediante ONNX Runtime y Transformers.js.
- Ejecución en CPU con bajo consumo de memoria (333 MiB en Linux y 307 MiB en Windows tras la carga, con `disable_quant_qdq = 1`).
- Compatibilidad con el ecosistema Transformers.js (`pipeline("translation", ...)`) y con scripts Python basados en onnxruntime, sentencepiece y numpy.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Traducción integrada en navegador: al ejecutarse con Transformers.js y ONNX Runtime en WebAssembly/CPU, puede desplegarse en una aplicación web sin backend de inferencia, traduciendo texto inglés a italiano en el cliente y evitando enviar datos a servidores externos.
- Traductor de pantalla en escritorio: el autor lo usa en OpenCircle para Windows y Linux, donde el bajo consumo de memoria (menos de 350 MiB tras la carga) permite mantener el modelo residente mientras se capturan y traducen regiones de pantalla en tiempo real.
- Localización de documentación técnica: útil para traducir README, comentarios y guías de inglés a italiano en pipelines de CI, con la ventaja de que los pesos ONNX son ligeros (0,1 GB) y fáciles de cachear.
- Preprocesado multilingüe en aplicaciones de soporte: traducción de tickets o mensajes de usuario del inglés al italiano antes de pasarlos a otro sistema de análisis, aprovechando la latencia reducida del modo rápido de ONNX Runtime.
- Extensiones de navegador: al no requerir GPU ni un servidor dedicado, encaja en extensiones que traduzcan páginas o selecciones de texto bajo demanda.
- Prototipado y evaluación de pipelines de traducción: sirve como referencia ligera para comparar calidad (BLEU 27,32 en FLORES-200 devtest) frente a modelos más grandes en entornos con recursos limitados.
- Aplicaciones offline en dispositivos de bajos recursos: el tamaño reducido y la ejecución en CPU lo hacen viable en equipos sin GPU dedicada.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FLORES-200 devtest (1.012 frases), BLEU | 27,32 |
| FLORES-200 devtest, chrF | 57,45 |
| Decodificacion | greedy |
| Memoria tras carga, Linux (`disable_quant_qdq = 1`) | 645 → 333 MiB (-48 %) |
| Memoria tras carga, Windows (`disable_quant_qdq = 1`) | 621 → 307 MiB (-51 %) |
| Memoria tras carga, Linux (defaults ONNX Runtime) | 255 → 216 MiB (-15 %) |
| Memoria tras carga, Windows (defaults ONNX Runtime) | 230 → 190 MiB (-17 %) |
| Aceleracion con modo rapido | 2,3–2,5× |
| Tokens de salida | identicos al modelo original |

Las mediciones se realizaron con ONNX Runtime 1.31.1 en CPU con 4 hilos (Linux nativo, Windows en máquina virtual). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo especializado en traducción.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está diseñado para inferencia en CPU.
- Memoria RAM estimada tras la carga: 333 MiB en Linux y 307 MiB en Windows con `disable_quant_qdq = 1`; 216 MiB y 190 MiB respectivamente con los valores por defecto de ONNX Runtime.
- GPU recomendadas: no aplica; no se documenta soporte GPU en la información disponible.
- Cabe en cualquier equipo de consumo: portátiles, mini-PC y navegadores, dado el reducido tamaño del repositorio (0,1 GB).
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`), ONNX Runtime (Python con onnxruntime, sentencepiece y numpy mediante `translate.py`), y cualquier entorno compatible con ONNX.
- Latencia y throughput: el autor reporta una aceleración de 2,3–2,5× respecto al modelo original con el modo rápido; no se detallan valores absolutos de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/en-it | no disponible | no disponible | en → it | CC BY 4.0 | ONNX | Optimizado para CPU, 2,3–2,5× más rápido que el original |
| Xenova/opus-mt-en-it | no disponible | no disponible | en → it | CC BY 4.0 | ONNX | Modelo base; mayor consumo de memoria |
| Helsinki-NLP/opus-mt-en-it | no disponible | no disponible | en → it | CC BY 4.0 | PyTorch/safetensors (original) | Pesos originales de OPUS-MT; requiere framework completo |

No se dispone en la información proporcionada de datos sobre otros modelos comparables (por ejemplo, NLLB o M2M-100) que permitan una comparación cuantitativa de calidad más allá del BLEU y chrF reportados para este modelo.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en la dirección inglés → italiano; no soporta traducción inversa ni otros pares de idiomas.
- No se documentan sesgos específicos ni evaluación de sesgos en la model card; al derivar de OPUS-MT, hereda las limitaciones y sesgos del corpus original de OPUS.
- Riesgo de alucinación y de traducciones incorrectas en dominios muy técnicos o con terminología especializada, habitual en modelos de traducción de tamaño medio.
- Longitud de contexto no documentada; el modelo original OPUS-MT tiene límites de longitud de secuencia que no se detallan en esta ficha.
- La licencia CC BY 4.0 permite uso comercial con atribución; es necesario conservar los créditos a OPUS-MT (Universidad de Helsinki) y a Xenova por la exportación ONNX.
- Solo se ha modificado el grafo del decodificador fusionado cuantizado; el resto de ficheros son copias del original, por lo que cualquier limitación del modelo base se mantiene.
- Las mediciones de rendimiento se limitan a CPU con 4 hilos y a ONNX Runtime 1.31.1; el comportamiento en otros entornos puede variar.
- No se garantiza paridad de tokens fuera de la configuración reportada (modo rápido con `disable_quant_qdq = 1`).

## Enlaces

- Hugging Face: https://huggingface.co/OptimaMT/en-it
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-en-it
- Pesos originales OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-it
- Repositorio del proyecto: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Demo de resultados: https://huggingface.co/spaces/OptimaMT/results
- Colección de los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- OpenCircle (aplicación que usa el modelo): https://github.com/AmerAlreyahi/OpenCircle
