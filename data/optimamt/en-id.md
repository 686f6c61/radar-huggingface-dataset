# OptimaMT/en-id

## Resumen

OptimaMT/en-id es una conversión a ONNX del modelo de traducción automática Xenova/opus-mt-en-id, que a su vez deriva del OPUS-MT de la Universidad de Helsinki. Se trata de un modelo Marian encoder-decoder especializado en traducción inglés a indonesio, empaquetado para su uso con transformers.js y ONNX Runtime. La aportación principal de esta variante no es un reentrenamiento, sino una optimización del grafo del decodificador: se ha reconstruido únicamente el fichero `onnx/decoder_model_merged_quantized.onnx` moviendo la proyección de salida fuera de sus dos ramas, con el objetivo de reducir el consumo de memoria en inferencia.

El modelo mantiene exactamente los mismos pesos y el mismo vocabulario (54.796 tokens) que el modelo base, por lo que la calidad de traducción es idéntica. La reducción de memoria reportada por el autor es de un 46-47 % en Linux y Windows con `disable_quant_qdq = 1`, y de un 15-21 % con los valores por defecto de ONNX Runtime. Es relevante para despliegues en navegador o en entornos con recursos limitados donde cada mebibyte de RAM cuenta.

El repositorio es pequeño (0,1 GB) y está publicado bajo licencia CC BY 4.0, lo que permite uso comercial con atribución. Forma parte del proyecto OptimaMT, que cubre 49 pares de idiomas bajo el esquema `OptimaMT/<src>-<tgt>`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ONNX quantized (`q8` en el ejemplo de uso); fichero `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | inglés (en) e indonesio (id) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (repo de 0,1 GB); sin safetensors ni GGUF |
| Vocabulario | 54.796 tokens |
| Modelo base | Xenova/opus-mt-en-id (revisión `b3b41f654c2f`) |
| Librería | transformers.js |
| Pipeline | translation |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer encoder-decoder clásico diseñado específicamente para traducción automática neuronal. No se trata de un modelo generativo generalista ni de un MoE: es un modelo seq2seq compacto orientado a un par de idiomas concreto. El modelo original fue entrenado por la Universidad de Helsinki como parte del proyecto OPUS-MT, utilizando corpus paralelos del ecosistema OPUS. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica de esta variante es exclusivamente a nivel de grafo: la proyección de salida del decodificador se ha sacado de sus dos ramas (probablemente las ramas de decodificación con y sin caché), lo que permite que ONNX Runtime no duplique esa operación en memoria. El resto de ficheros del repositorio son idénticos byte a byte al modelo base. El autor reporta que los tokens generados son idénticos, lo que confirma que la modificación no altera la salida.

## Capacidades

- Traducción de texto de inglés a indonesio, única tarea soportada por el pipeline.
- Generación de texto seq2seq mediante el pipeline `translation` de transformers.js.
- Ejecución en navegador y en Node.js gracias al formato ONNX y a transformers.js.
- Inferencia en CPU con ONNX Runtime (probado con 4 hilos en Linux y en una VM Windows).
- Uso desde Python mediante onnxruntime, sentencepiece y numpy (script `translate.py` incluido en el repositorio del proyecto).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües limitadas estrictamente al par en-id.

## Casos de uso

- Traducción en el navegador sin backend: al ser un modelo ONNX de 0,1 GB, puede cargarse en una aplicación web con transformers.js y traducir texto en el cliente, evitando enviar contenido a un servidor y reduciendo costes de infraestructura.
- Traducción de documentación técnica en pipelines de CI/CD: el script `translate.py` permite integrar la traducción en inglés a indonesio dentro de un flujo automatizado que genere versiones localizadas de READMEs o guías.
- Localización de interfaces de usuario en aplicaciones móviles o de escritorio: el bajo consumo de memoria (257 MiB en Linux con la optimización) lo hace viable en entornos con RAM limitada.
- Preprocesamiento de datasets multilingües: traducción por lotes de corpus en inglés a indonesio para tareas de aumento de datos o evaluación de sistemas de recuperación de información.
- Atención al cliente en indonesio: traducción de mensajes entrantes en inglés a indonesio para agentes que trabajen en ese idioma, con la ventaja de que el modelo puede ejecutarse en local y preservar la privacidad de las conversaciones.
- Prototipado rápido de sistemas de traducción: al estar disponible en transformers.js, permite validar una idea de producto de traducción en pocas líneas de JavaScript sin montar infraestructura de GPU.
- Traducción de subtítulos o contenido efímero: la inferencia en CPU con ONNX Runtime permite procesar texto de forma interactiva en entornos sin acelerador hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de memoria tras la carga del modelo y confirma que los tokens generados son idénticos a los del modelo base:

| Métrica | Linux | Windows |
|---|---:|---:|
| Memoria con `disable_quant_qdq = 1` | 472 → 257 MiB (-46 %) | 448 → 236 MiB (-47 %) |
| Memoria con valores por defecto de ONNX Runtime | 254 → 201 MiB (-21 %) | 181 → 154 MiB (-15 %) |
| Tokens idénticos al modelo base | sí | sí |

Condiciones de la medición: ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en una máquina virtual).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo está pensado para CPU. En GPU, el consumo sería mínimo dado el tamaño del repositorio (0,1 GB), pero no se han publicado mediciones.
- GPU recomendadas: no disponible; el modelo se ha validado en CPU.
- Cabe en cualquier GPU consumer e integrada, así como en entornos sin GPU.
- RAM necesaria: aproximadamente 154-257 MiB tras la carga según sistema operativo y configuración de ONNX Runtime.
- Opciones de despliegue: transformers.js (JavaScript/Node.js), ONNX Runtime (Python mediante `translate.py`), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponible; el autor no publica mediciones de velocidad, solo de memoria.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/en-id | Marian | no disponible | en, id | CC BY 4.0 | ONNX | Decodificador optimizado en memoria |
| Xenova/opus-mt-en-id | Marian | no disponible | en, id | CC BY 4.0 | ONNX | Modelo base, sin la optimización de memoria |
| Helsinki-NLP/opus-mt-en-id | Marian | no disponible | en, id | CC BY 4.0 | safetensors/PyTorch | Modelo original de OPUS-MT |

Los tres modelos comparten pesos y calidad de traducción; las diferencias están en el formato de distribución y en la optimización del grafo del decodificador. No se dispone de datos de benchmarks que permitan comparar rendimiento de traducción con alternativas de otros proveedores.

## Limitaciones y advertencias

- El modelo solo traduce de inglés a indonesio; no soporta la dirección inversa ni otros pares de idiomas.
- Al ser una copia de pesos de OPUS-MT, hereda los sesgos y errores del corpus de entrenamiento original, que no se detallan en la información disponible.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (legal, médico, técnico) no representados en los datos de entrenamiento.
- No se han publicado evaluaciones de calidad (BLEU, COMET u otras métricas) en esta variante.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a los autores originales (Universidad de Helsinki, Xenova y OptimaMT).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación independiente de las métricas de memoria reportadas.
- La fecha de creación indicada (2026-11-09) es futura respecto a la información disponible; conviene verificar la vigencia del repositorio antes de adoptarlo.
- El ejemplo de uso depende de una opción específica de ONNX Runtime (`disable_quant_qdq`); si el runtime no la soporta, se pierde la mayor parte de la reducción de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-id
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-en-id
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-id
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
