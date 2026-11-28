# OptimaMT/nl-fr

## Resumen

OptimaMT/nl-fr es una reexportación optimizada del modelo de traducción automática neuronal Xenova/opus-mt-nl-fr, que a su vez deriva del OPUS-MT de la Universidad de Helsinki. Se trata de un modelo Marian (transformer encoder-decoder) especializado en la traducción de neerlandés (nl) a francés (fr), empaquetado en formato ONNX para su uso con ONNX Runtime y la librería transformers.js. El repositorio ocupa 0,1 GB e incluye los pesos en cuantización de 8 bits listos para inferencia en CPU.

La aportación de OptimaMT no es un reentrenamiento, sino una modificación del grafo del decodificador combinado (decoder_model_merged_quantized.onnx): se mueve la proyección de salida fuera de sus dos ramas y se activa el modo rápido de ONNX Runtime mediante `disable_quant_qdq = 1`. El resultado es una reducción de memoria de entre el 45 % y el 48 % en Linux y Windows respectivamente, con una aceleración de 2,3 a 2,5 veces, manteniendo exactamente los mismos tokens de salida que el modelo original.

Es relevante para desarrolladores que necesitan traducción neerlandés-francés de baja latencia en entornos sin GPU, como aplicaciones de escritorio o extensiones de navegador, ya que el modelo cabe en menos de 300 MiB de RAM tras la carga y se ejecuta íntegramente en CPU con ONNX Runtime. Forma parte de una colección de 51 pares de idiomas con el mismo enfoque de optimización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (q8) para el decodificador combinado; resto de ficheros sin modificar |
| Idiomas soportados | neerlandés (nl) como origen, francés (fr) como destino |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto idénticos al original) |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian de OPUS-MT (Helsinki-NLP/opus-mt-nl-fr), una arquitectura transformer encoder-decoder diseñada específicamente para traducción automática. No se dispone de información sobre el número de parámetros totales ni sobre la composición exacta del corpus de entrenamiento en la documentación proporcionada; el modelo original de OPUS-MT se entrenó sobre datos paralelos multilingües del proyecto OPUS, pero los detalles concretos de tokens y mezcla de datos no están disponibles en la información facilitada.

La modificación introducida por OptimaMT es exclusivamente a nivel de grafo ONNX: se reconstruye únicamente el fichero `decoder_model_merged_quantized.onnx`, moviendo la proyección de salida del decodificador fuera de sus dos ramas. Todos los demás ficheros son idénticos byte a byte al export original de Xenova en la revisión `6c8ebb68522f`. No hay reentrenamiento, ajuste fino ni RLHF; la innovación es puramente de despliegue y eficiencia en inferencia.

## Capacidades

- Traducción de texto de neerlandés a francés, unidireccional, con vocabulario de 57.642 tokens.
- Generación de texto seq2seq mediante pipeline `translation` de transformers.js.
- Ejecución en CPU con ONNX Runtime, sin necesidad de GPU.
- Compatibilidad con el modo rápido de ONNX Runtime (`disable_quant_qdq = 1`) para reducir memoria y latencia.
- Uso mediante JavaScript/TypeScript (transformers.js) o Python (onnxruntime, sentencepiece, numpy).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de pantalla en tiempo real: el modelo se usa en OpenCircle, un traductor de pantalla de escritorio para Windows y Linux, donde la baja huella de memoria (menos de 300 MiB tras la carga) y la ejecución en CPU permiten traducir texto en vivo sin bloquear el sistema.
- Extensiones de navegador para traducción de páginas neerlandesas al francés: al ejecutarse con transformers.js en el cliente, evita enviar contenido a servidores externos y preserva la privacidad del usuario.
- Aplicaciones de escritorio offline: herramientas de productividad o lectores de documentos que necesitan traducción nl-fr sin conexión a internet, aprovechando el tamaño reducido del repositorio (0,1 GB).
- Preprocesado en pipelines de datos multilingües: traducción por lotes de corpus neerlandeses a francés en entornos sin GPU, usando el script Python incluido con onnxruntime y sentencepiece.
- Atención al cliente en regiones bilingües (Bélgica, Países Bajos-Francia): traducción de mensajes entrantes en neerlandés a francés para agentes o sistemas que operan en francés, con latencia baja en CPU.
- Sistemas embebidos o de borde: dispositivos con recursos limitados donde no cabe un modelo mayor pero se requiere traducción bidireccional de calidad aceptable entre estos dos idiomas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FLORES-200 devtest (1.012 frases) | BLEU 22,88 · chrF 52,15 (greedy) |
| Memoria tras carga (Linux, `disable_quant_qdq = 1`) | 494 → 270 MiB (-45 %) |
| Memoria tras carga (Windows, `disable_quant_qdq = 1`) | 467 → 242 MiB (-48 %) |
| Memoria tras carga (Linux, valores por defecto ONNX Runtime) | 266 → 210 MiB (-21 %) |
| Memoria tras carga (Windows, valores por defecto ONNX Runtime) | 187 → 158 MiB (-16 %) |
| Aceleración | 2,3–2,5× frente al original |
| Tokens idénticos al original | sí |

Condiciones: ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en máquina virtual).

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU.
- RAM estimada tras la carga: 270 MiB en Linux y 242 MiB en Windows con `disable_quant_qdq = 1`; 210 MiB y 158 MiB respectivamente con los valores por defecto de ONNX Runtime.
- GPU: no requiere GPU; puede ejecutarse en cualquier CPU moderna. No se han publicado datos de rendimiento en GPU.
- Cabe en cualquier equipo de consumo, incluidos portátiles de gama baja y dispositivos con poca memoria.
- Opciones de despliegue: transformers.js (JavaScript/TypeScript), ONNX Runtime en Python (onnxruntime + sentencepiece + numpy), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no se han publicado cifras absolutas de latencia o tokens por segundo; solo se documenta la aceleración relativa de 2,3–2,5× frente al original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/nl-fr | no disponible | no disponible | nl → fr | CC BY 4.0 | ONNX (INT8) | Optimizado para CPU, 45–48 % menos memoria |
| Xenova/opus-mt-nl-fr | no disponible | no disponible | nl → fr | CC BY 4.0 | ONNX | Modelo base del que deriva; sin la optimización de memoria |
| Helsinki-NLP/opus-mt-nl-fr | no disponible | no disponible | nl → fr | CC BY 4.0 | safetensors/PyTorch | Modelo original de OPUS-MT; requiere framework PyTorch |

## Limitaciones y advertencias

- Solo traduce de neerlandés a francés; no es bidireccional ni multilingüe más allá de ese par.
- No se dispone de información sobre sesgos específicos del corpus de entrenamiento original de OPUS-MT; como todo modelo de traducción, puede reflejar sesgos presentes en los datos paralelos.
- Riesgo de alucinación y de traducciones inexactas en dominios especializados (técnico, legal, médico) o con terminología poco frecuente.
- La longitud máxima de contexto no está documentada; no se recomienda para documentos muy largos sin segmentación previa.
- La licencia CC BY 4.0 permite uso comercial con atribución; es necesario citar a OPUS-MT (Universidad de Helsinki) y a Xenova por la exportación ONNX.
- El rendimiento se ha medido en CPU con 4 hilos; los valores de memoria y velocidad pueden variar en otras configuraciones.
- Al ser una copia optimizada, no incorpora mejoras de calidad sobre el modelo original: la calidad de traducción es idéntica (mismos tokens).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/nl-fr
- Modelo base (export ONNX): https://huggingface.co/Xenova/opus-mt-nl-fr
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-nl-fr
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Demo de resultados: https://huggingface.co/spaces/OptimaMT/results
- Colección de los 51 pares de idiomas: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- OpenCircle (aplicación que usa el modelo): https://github.com/AmerAlreyahi/OpenCircle
