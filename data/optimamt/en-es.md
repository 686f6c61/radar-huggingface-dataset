# OptimaMT/en-es

## Resumen

OptimaMT/en-es es un modelo de traduccion automatica ingles-castellano publicado por OptimaMT. No es un modelo entrenado desde cero, sino una reexportacion optimizada de Xenova/opus-mt-en-es, que a su vez es la conversion a ONNX del clasico OPUS-MT de la Universidad de Helsinki. La aportacion de OptimaMT consiste en recompilar el decodificador fusionado en formato ONNX cuantizado aplicando el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`) y sacando la proyeccion de salida del decodificador de sus dos ramas, con lo que se reduce el consumo de memoria entre un 47 % y un 48 % en Linux y Windows respectivamente, manteniendo exactamente los mismos tokens de salida.

El modelo es un transformer encoder-decoder de tipo Marian, pensado exclusivamente para traduccion de texto plano del ingles al castellano. Su interes practico esta en el despliegue ligero: el repositorio completo ocupa 0,1 GB, funciona en CPU con ONNX Runtime y se integra de forma nativa en `@huggingface/transformers` (transformers.js), lo que lo hace adecuado para aplicaciones de escritorio, extensiones y entornos sin GPU. Ya se usa en produccion en OpenCircle, un traductor de pantalla para Windows y Linux desde su version 0.1.4.

La relevancia actual del modelo no reside en su calidad bruta, que es la del OPUS-MT original, sino en la reduccion de huella de memoria (de 545 a 291 MiB en Linux tras la carga) sin perdida de fidelidad, un factor decisivo cuando se ejecutan varios pares de idiomas en paralelo en un mismo proceso. Forma parte de una coleccion de 51 pares con nomenclatura homogenea `OptimaMT/<src>-<tgt>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian / OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); decodificador fusionado con `disable_quant_qdq = 1` |
| Idiomas soportados | ingles (en), castellano (es) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` y resto de ficheros del export original) |
| Vocabulario | 65.001 tokens |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Xenova/opus-mt-en-es (revision `4b002a4c7edd`) |
| Libreria | transformers.js |

## Arquitectura y entrenamiento

Se trata de un transformer seq2seq de tipo Marian, la arquitectura empleada por la familia OPUS-MT de Helsinki-NLP, con encoder y decoder estandar y vocabulario SentencePiece de 65.001 tokens. No hay innovaciones arquitectonicas propias: el modelo hereda integramente los pesos de Xenova/opus-mt-en-es, que a su vez procede de Helsinki-NLP/opus-mt-en-es. Los datos de entrenamiento originales (numero de tokens, composicion del corpus, si hubo fine-tuning o tecnicas de alineacion) no se detallan en la informacion disponible.

La unica modificacion respecto al export de Xenova es a nivel de grafo ONNX: el decodificador fusionado se reconstruye moviendo la proyeccion de salida fuera de sus dos ramas y activando el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`). El resto de ficheros del repositorio son identicos byte a byte al original. El resultado declarado es una aceleracion de 2,3 a 2,5 veces y una reduccion de memoria tras la carga de 545 a 291 MiB en Linux (-47 %) y de 517 a 267 MiB en Windows (-48 %) con la configuracion optimizada, y de 291 a 227 MiB (-22 %) y de 201 a 170 MiB (-15 %) con los valores por defecto de ONNX Runtime. En ambos casos los tokens generados son identicos a los del modelo base.

## Capacidades

- Traduccion de texto ingles a castellano, unica tarea soportada (pipeline `translation`).
- Generacion determinista con decodificacion greedy; los resultados reproducen exactamente los del modelo base.
- Ejecucion en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integracion nativa con transformers.js (`pipeline("translation", ...)`) y uso en Python via `onnxruntime`, `sentencepiece` y `numpy`.
- Bajo consumo de memoria, apto para cargar varios pares de idiomas simultaneamente en un mismo proceso.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue limitada estrictamente al par en-es; no traduce a otros idiomas ni desde otros idiomas.

## Casos de uso

- Traduccion de pantalla en aplicaciones de escritorio: es el escenario real de OpenCircle, que lo embarca desde la version 0.1.4 para traducir texto seleccionado en Windows y Linux; el bajo uso de memoria (291 MiB en Linux) permite mantenerlo residente junto al resto de la aplicacion.
- Traduccion por lotes de documentacion tecnica: al ejecutarse en CPU con ONNX Runtime y 4 hilos, puede procesar ficheros de documentacion en ingles en servidores sin GPU, con throughput predecible y sin coste de acelerador.
- Extensiones de navegador y widgets web: el formato ONNX y la compatibilidad con transformers.js permiten ejecutar la traduccion en el cliente, evitando enviar el texto a un servicio externo y reduciendo latencia de red.
- Preprocesado de corpus para pipelines de NLP: traduccion de datasets en ingles al castellano antes de tareas posteriores (clasificacion, analisis de sentimiento) en entornos con recursos limitados.
- Sistemas embebidos y dispositivos de bajo consumo: con 0,1 GB de repositorio y cuantizacion q8, cabe en equipos con poca RAM y sin GPU dedicada.
- Traduccion de subtitulos y contenido audiovisual en herramientas de escritorio: la ejecucion local en CPU permite procesar flujos de texto corto de forma interactiva sin depender de APIs externas.
- Despliegue multi-idioma en un solo proceso: al formar parte de una coleccion de 51 pares con la misma nomenclatura, se pueden cargar varios modelos `OptimaMT/<src>-<tgt>` en paralelo con un coste de memoria contenido por instancia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FLORES-200 devtest (1.012 frases), BLEU | 26,15 |
| FLORES-200 devtest (1.012 frases), chrF | 54,81 |
| Decodificacion | greedy |
| Aceleracion frente al export original | 2,3-2,5x (modo rapido ONNX Runtime) |
| Memoria tras carga, Linux (optimizado) | 545 -> 291 MiB (-47 %) |
| Memoria tras carga, Windows (optimizado) | 517 -> 267 MiB (-48 %) |
| Memoria tras carga, Linux (defaults) | 291 -> 227 MiB (-22 %) |
| Memoria tras carga, Windows (defaults) | 201 -> 170 MiB (-15 %) |
| Fidelidad de salida | tokens identicos al modelo base |

Entorno de medida: ONNX Runtime 1.31.1, CPU, 4 hilos (Linux nativo; Windows en maquina virtual).

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para inferencia en CPU.
- Memoria RAM tras carga: aproximadamente 291 MiB en Linux y 267 MiB en Windows con `disable_quant_qdq = 1`; 227 MiB y 170 MiB respectivamente con los valores por defecto de ONNX Runtime.
- GPU: no requiere GPU; no se documentan requisitos ni recomendaciones de GPU (A100, H100, RTX 4090 u otras).
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,1 GB y la inferencia se ejecuta en CPU.
- Opciones de despliegue: ONNX Runtime (Python con `onnxruntime`, `sentencepiece` y `numpy`), transformers.js / `@huggingface/transformers` en JavaScript. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: se declara una aceleracion de 2,3-2,5x respecto al export original en CPU con 4 hilos, pero no se publican valores absolutos de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/en-es | Marian (ONNX) | en -> es | no disponible | CC BY 4.0 | ONNX | Decodificador fusionado optimizado, 291 MiB tras carga en Linux, BLEU 26,15 en FLORES-200 |
| Xenova/opus-mt-en-es | Marian (ONNX) | en -> es | no disponible | CC BY 4.0 | ONNX | Modelo base del anterior; mismos pesos y tokens, mayor consumo de memoria y menor velocidad |
| Helsinki-NLP/opus-mt-en-es | Marian | en -> es | no disponible | CC BY 4.0 | safetensors / PyTorch | Modelo original de la Universidad de Helsinki; requiere framework de inferencia completo |

## Limitaciones y advertencias

- Solo traduce del ingles al castellano; no es un modelo multilingue ni bidireccional.
- No se documentan datos sobre sesgos; al heredar los pesos de OPUS-MT, arrastra los sesgos del corpus original de OPUS, no detallado en la informacion disponible.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados (terminologia juridica, medica o tecnica muy especifica), propio de modelos de traduccion de este tamano.
- No se especifica la longitud maxima de contexto; las entradas largas pueden truncarse o degradar la calidad.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribucion a los autores originales (Universidad de Helsinki, export de Xenova y modificacion de OptimaMT).
- El modelo no incluye capacidades de razonamiento, codigo, tool calling ni agentes; no debe emplearse fuera de la tarea de traduccion.
- El ejemplo de uso depende de una opcion especifica de ONNX Runtime (`disable_quant_qdq`); sin ella se pierde parte de la ganancia de memoria y velocidad.
- Solo se publica el decodificador fusionado reconstruido; cualquier modificacion adicional del grafo requeriria reexportar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-es
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Coleccion de los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Informe metodologico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- OpenCircle (aplicacion que lo usa en produccion): https://github.com/AmerAlreyahi/OpenCircle
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-en-es
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-es
