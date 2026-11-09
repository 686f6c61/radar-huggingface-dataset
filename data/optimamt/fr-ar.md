# OptimaMT/fr-ar

## Resumen

OptimaMT/fr-ar es una exportación ONNX del modelo de traducción automática Helsinki-NLP/opus-mt-fr-ar, desarrollado originalmente por el grupo Language Technology de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce de francés a árabe y está empaquetado para su uso directo con transformers.js, lo que permite ejecutar la traducción íntegramente en el navegador o en Node.js sin depender de un servidor. El autor de esta réplica es OptimaMT, que mantiene un catálogo de 49 pares de idiomas bajo el mismo esquema.

La aportación concreta de esta variante frente a la exportación original es un decodificador fusionado más ligero: se ha reconstruido el grafo del decodificador moviendo la proyección de salida fuera de sus dos ramas, sin alterar los pesos ni el vocabulario. Según la model card, esto reduce el consumo de memoria tras la carga entre un 47 % y un 49 % en Linux y Windows con `disable_quant_qdq = 1`, y entre un 16 % y un 22 % con los valores por defecto de ONNX Runtime, manteniendo tokens de salida idénticos.

Se trata de un modelo MarianMT de tamaño compacto (el repositorio ocupa 0,1 GB), pensado para traducción de un solo par de idiomas, no para razonamiento general ni generación libre. Su relevancia actual reside en que ofrece traducción fr→ar cuantizada en 8 bits ejecutable en CPU y en el navegador, con una huella de memoria del orden de 165-281 MiB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ONNX cuantizado en 8 bits (`dtype: "q8"`); exportación ONNX con decodificador fusionado |
| Idiomas soportados | francés (fr) y árabe (ar) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx`), tokenizador en formato Xenova (`tokenizer.json`, `special_tokens_map.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

El modelo subyacente es MarianMT, una arquitectura transformer encoder-decoder desarrollada para traducción automática neuronal y entrenada originalmente en el marco del proyecto OPUS-MT de la Universidad de Helsinki. Esta réplica no reentrena ni modifica los pesos: parte de la exportación ONNX de Helsinki-NLP/opus-mt-fr-ar en la revisión `5469dc759cd9` y conserva el vocabulario de 62.419 tokens. La única modificación es de grafo: la proyección de salida del decodificador se ha sacado de sus dos ramas para reconstruir un decodificador fusionado con menor consumo de memoria.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO; la model card no los detalla. El modelo emplea tokens de prefijo para fijar la variante de destino (`>>ara<<`), un mecanismo habitual en las exportaciones OPUS-MT multilingües. La cuantización aplicada es de 8 bits sobre el decodificador, y la model card advierte que debe usarse transformers.js 3.x, ya que la versión 4.3.2 divide incorrectamente el token de prefijo.

## Capacidades

- Traducción de texto de francés a árabe, con salida determinista respecto a la exportación original.
- Ejecución en navegador y en Node.js mediante transformers.js, sin backend de inferencia dedicado.
- Inferencia en CPU con ONNX Runtime (probado con la versión 1.31.1 y 4 hilos).
- Uso mediante script de Python con `onnxruntime`, `sentencepiece` y `numpy`.
- Soporte de tokens de prefijo para seleccionar la variante de árabe de destino (`>>ara<<`).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción de documentación técnica fr→ar en el navegador: al ejecutarse con transformers.js, permite ofrecer traducción local en una aplicación web sin enviar el texto a un servidor externo, con una huella de memoria de 165-281 MiB.
- Localización de interfaces y microcopy: el tamaño reducido del repositorio (0,1 GB) y la cuantización en 8 bits permiten integrar el modelo en pipelines de build para generar cadenas en árabe a partir de las fuentes en francés.
- Preprocesado de corpus multilingües: traducción por lotes de textos franceses a árabe en scripts de Python con `onnxruntime`, útil para normalizar datasets antes de tareas de análisis o indexación.
- Traducción en entornos con recursos limitados: despliegue en CPU sin GPU, adecuado para dispositivos de borde o contenedores pequeños donde no cabe un modelo de traducción de mayor tamaño.
- Asistencia a la lectura de prensa y documentación francófona: integración en extensiones o aplicaciones de escritorio que traduzcan párrafos seleccionados al árabe de forma local.
- Prototipado rápido de sistemas de traducción: al ser una réplica drop-in de la exportación Xenova, sirve para validar pipelines de traducción fr→ar antes de escalar a un servicio de inferencia dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de memoria y equivalencia de salida:

| Métrica | Linux | Windows | Tokens idénticos |
|---|---:|---:|---|
| Memoria tras carga con `disable_quant_qdq = 1` | 525 → 281 MiB (-47 %) | 500 → 257 MiB (-49 %) | sí |
| Memoria tras carga con valores por defecto de ONNX Runtime | 281 → 220 MiB (-22 %) | 196 → 165 MiB (-16 %) | sí |

Medición realizada con ONNX Runtime 1.31.1, en CPU y con 4 hilos (Windows en una máquina virtual).

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para inferencia en CPU con ONNX Runtime.
- Memoria RAM estimada: 165-281 MiB tras la carga, según sistema operativo y configuración de cuantización.
- GPU: no se documenta soporte ni requisitos de GPU; la model card solo reporta mediciones en CPU.
- GPU de consumo: no disponible.
- Opciones de despliegue: transformers.js 3.x en navegador o Node.js, y script de Python con `onnxruntime`, `sentencepiece` y `numpy`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/fr-ar | MarianMT (ONNX, decodificador fusionado) | fr → ar | no disponible | CC BY 4.0 | ONNX cuantizado q8 | Réplica optimizada en memoria |
| Helsinki-NLP/opus-mt-fr-ar | MarianMT | fr → ar | no disponible | CC BY 4.0 | safetensors / ONNX (Xenova) | Modelo base original |
| Xenova/opus-mt-fr-ar | MarianMT (exportación ONNX) | fr → ar | no disponible | CC BY 4.0 | ONNX | Exportación de referencia con la que se compara el layout |

La comparativa se limita a las variantes del mismo modelo base, ya que la información disponible no incluye otros sistemas de traducción fr→ar con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo especializado en un único par de idiomas (fr→ar); no admite otros pares ni tareas de generación general.
- Requiere anteponer el token de prefijo `>>ara<<` a cada entrada; sin él, la variante de destino no queda fijada.
- Compatibilidad restringida a transformers.js 3.x: la versión 4.3.2 divide el token de prefijo, incluso con la exportación original.
- No se han publicado evaluaciones de calidad de traducción (BLEU, COMET u otras); la equivalencia reportada es de tokens de salida respecto a la exportación original, no una medida de calidad lingüística.
- Riesgo de alucinación y de traducciones incorrectas inherente a los modelos MarianMT, especialmente en textos largos, dominios especializados o árabe dialectal.
- Sesgos potenciales heredados del corpus OPUS de entrenamiento; no documentados en la información disponible.
- Licencia CC BY 4.0: permite uso comercial con atribución a la Universidad de Helsinki y a OptimaMT.
- No se documentan límites de longitud de contexto ni comportamiento con entradas muy largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/fr-ar
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-ar
- Repositorio del proyecto: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
