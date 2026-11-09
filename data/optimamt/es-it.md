# OptimaMT/es-it

## Resumen

OptimaMT/es-it es una conversión a ONNX del modelo de traducción automática Xenova/opus-mt-es-it, que a su vez deriva del modelo OPUS-MT de la Universidad de Helsinki para el par español-italiano. Lo desarrolla el proyecto OptimaMT, que mantiene 49 pares de traducción bajo el esquema de nombres `OptimaMT/<src>-<tgt>`. El modelo resuelve la tarea de traducción directa de texto de español a italiano y su relevancia radica en que reduce el consumo de memoria respecto al original sin alterar la salida: los tokens generados son idénticos.

Técnicamente es un transformer encoder-decoder de tipo Marian, exportado a ONNX y pensado para ejecutarse en el ecosistema transformers.js (JavaScript/TypeScript) y también en Python mediante onnxruntime. El repositorio ocupa aproximadamente 0,1 GB y el vocabulario es de 59.031 tokens. La única modificación respecto a Xenova/opus-mt-es-it es la reestructuración del grafo del decoder fusionado: la proyección de salida se extrae de sus dos ramas, lo que reduce el uso de memoria entre un 15 % y un 48 % según la configuración.

El modelo está publicado con licencia CC BY 4.0 y está registrado con cero descargas y cero likes en el momento de la consulta (creado el 9 de noviembre de 2026). Es una opción adecuada para inferencia en navegador o en entornos con memoria limitada que necesiten traducción es-it sin depender de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8); el decoder fusionado se sirve como `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | es (español), it (italiano) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); pesos originales en safetensors en el modelo base |
| Vocabulario | 59.031 tokens |
| Tamaño del repositorio | ~0,1 GB |
| Runtime recomendado | ONNX Runtime 1.31.1 (CPU, 4 hilos en las pruebas) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder de tipo Marian, la familia utilizada por los modelos OPUS-MT de la Universidad de Helsinki. El modelo original fue entrenado por Helsinki-NLP para traducción directa español-italiano; OptimaMT no reentrena ni ajusta los pesos, sino que parte de la exportación ONNX de Xenova en la revisión `596c67cda7cb` y reconstruye únicamente el decoder fusionado cuantizado.

La innovación técnica es exclusivamente de empaquetado: la proyección de salida del decoder se mueve fuera de sus dos ramas (cambio de grafo, no de pesos), lo que reduce el consumo de memoria tras la carga. Según la model card, con `disable_quant_qdq = 1` la memoria pasa de 501 a 270 MiB en Linux (-46 %) y de 479 a 249 MiB en Windows (-48 %); con los valores por defecto de ONNX Runtime, de 269 a 211 MiB (-21 %) y de 192 a 163 MiB (-15 %) respectivamente. En todos los casos los tokens generados son idénticos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Traducción de texto directa de español a italiano (pipeline `translation`).
- Generación de texto seq2seq condicionada a la frase de entrada.
- Ejecución en JavaScript/TypeScript mediante transformers.js con `dtype: "q8"`.
- Ejecución en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py`).
- Inferencia en CPU con bajo consumo de memoria (del orden de 163-270 MiB tras la carga según configuración).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Cobertura multilingüe limitada estrictamente al par es-it.

## Casos de uso

- Traducción en navegador: al estar exportado a ONNX y disponible en transformers.js, puede ejecutarse del lado del cliente sin enviar el texto a un servidor, lo que resulta adecuado para aplicaciones web de traducción con requisitos de privacidad.
- Traducción por lotes en CPU: el bajo consumo de memoria (211-270 MiB con la configuración optimizada) permite procesar grandes volúmenes de documentos es-it en servidores sin GPU.
- Localización de contenidos editoriales: traducción directa de artículos, fichas de producto o documentación del español al italiano dentro de un pipeline de publicación.
- Preprocesado en sistemas multilingües: uso como etapa de traducción es→it antes de otros módulos de NLP (análisis, resumen o clasificación) que operen en italiano.
- Atención al cliente en italiano: traducción de mensajes de usuarios hispanohablantes a italiano para agentes o sistemas que solo operan en esa lengua.
- Aplicaciones de escritorio o extensiones: el tamaño reducido del repositorio (~0,1 GB) y la inferencia en CPU facilitan su integración en herramientas locales sin dependencias de servicios en la nube.
- Evaluación comparativa de exportaciones ONNX: sirve como referencia para medir el ahorro de memoria de la técnica de decoder fusionado frente a la exportación original de Xenova.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de memoria tras la carga y confirma que los tokens generados son idénticos a los del modelo base:

| Configuración | Linux (MiB) | Windows (MiB) | Tokens idénticos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 501 → 270 (-46 %) | 479 → 249 (-48 %) | sí |
| Valores por defecto de ONNX Runtime | 269 → 211 (-21 %) | 192 → 163 (-15 %) | sí |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el consumo medido es de memoria RAM en CPU (163-270 MiB tras la carga según configuración y sistema operativo).
- GPU recomendadas: no aplica; el modelo está pensado para CPU (las pruebas se hicieron con ONNX Runtime 1.31.1 en CPU con 4 hilos).
- Cabe en cualquier GPU de consumo, pero no es su escenario objetivo; también cabe holgadamente en cualquier equipo de escritorio o portátil convencional.
- Opciones de despliegue: transformers.js (JavaScript/TypeScript) con ONNX Runtime Web, y Python con onnxruntime + sentencepiece + numpy.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Memoria tras carga |
|---|---|---|---|---|---|---|
| OptimaMT/es-it | Marian (ONNX) | es → it | no disponible | CC BY 4.0 | ONNX | 163-270 MiB (optimizado) |
| Xenova/opus-mt-es-it | Marian (ONNX) | es → it | no disponible | CC BY 4.0 | ONNX | 192-501 MiB (según configuración) |
| Helsinki-NLP/opus-mt-es-it | Marian | es → it | no disponible | CC BY 4.0 | safetensors | no disponible |

La diferencia principal frente a Xenova/opus-mt-es-it es el menor consumo de memoria con salida idéntica; frente al original de Helsinki-NLP, la ventaja es la disponibilidad en ONNX para ejecución en navegador y en CPU.

## Limitaciones y advertencias

- Solo traduce en la dirección español → italiano; no soporta la dirección inversa ni otros pares.
- No se han publicado evaluaciones de calidad de traducción (BLEU, COMET u otras) en la información disponible.
- Riesgo de alucinación y de traducciones inexactas inherente a los modelos de traducción neuronal, especialmente con frases ambiguas, terminología especializada o texto muy largo.
- Longitud de contexto no documentada; no se garantiza el comportamiento con documentos extensos sin segmentación previa.
- El modelo base OPUS-MT puede presentar sesgos presentes en los corpus de entrenamiento originales; no se detallan sesgos específicos conocidos.
- La licencia CC BY 4.0 permite uso comercial con atribución; es obligatorio citar a los autores originales (Universidad de Helsinki, OPUS-MT) y a Xenova por la exportación ONNX.
- El repositorio registra cero descargas y cero likes, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- La fecha de creación del repositorio (noviembre de 2026) es posterior a la fecha habitual de referencia; conviene verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/es-it
- Modelo base (exportación ONNX): https://huggingface.co/Xenova/opus-mt-es-it
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-es-it
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe del método: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
