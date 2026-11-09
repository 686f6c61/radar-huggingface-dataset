# OptimaMT/it-es

## Resumen

OptimaMT/it-es es un modelo de traduccion automatica italiano-espanol derivado de Xenova/opus-mt-it-es, que a su vez es una exportacion a ONNX del modelo OPUS-MT de la Universidad de Helsinki. Lo desarrolla el proyecto OptimaMT, que mantiene un catalogo de 49 pares de idiomas bajo el esquema de nombres `OptimaMT/<src>-<tgt>`. El modelo resuelve la traduccion directa de texto entre italiano y espanol en entornos de inferencia ligera, especialmente en el navegador o en Node.js mediante transformers.js.

Tecnicamente es una copia directa (drop-in) del modelo base en la revision `0eba27fe6da2`, con una unica modificacion: se recompila el fichero `onnx/decoder_model_merged_quantized.onnx` para fusionar el decodificador y reducir el consumo de memoria en tiempo de ejecucion. El resto de ficheros son identicos byte a byte al original. La arquitectura subyacente es Marian (transformer encoder-decoder), con un vocabulario de 59.031 tokens y licencia CC BY 4.0.

Su relevancia actual es practica: reduce el uso de memoria entre un 15 % y un 49 % segun la configuracion de ONNX Runtime, manteniendo exactamente los mismos tokens de salida que el modelo original. Esto lo hace util para despliegues en dispositivos con recursos limitados o para pipelines de traduccion en produccion donde el coste de memoria es un factor critico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); el fichero del decodificador se distribuye como `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | Italiano (it) y espanol (es) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js) |
| Vocabulario | 59.031 tokens |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Xenova/opus-mt-it-es (revision `0eba27fe6da2`) |

## Arquitectura y entrenamiento

El modelo es un Marian de tipo transformer encoder-decoder, la arquitectura clasica de la familia OPUS-MT entrenada por la Universidad de Helsinki para traduccion automatica neuronal. No se dispone de informacion en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden al modelo OPUS-MT original y no se detallan aqui.

La innovacion tecnica de esta variante es exclusivamente de inferencia: se ha reconstruido el grafo ONNX del decodificador fusionado (`decoder_model_merged_quantized.onnx`) moviendo la proyeccion de salida fuera de sus dos ramas. Es un cambio solo de grafo, no de pesos. Segun el autor, con `disable_quant_qdq = 1` el consumo de memoria tras la carga pasa de 501 a 271 MiB en Linux (-46 %) y de 478 a 246 MiB en Windows (-49 %); con los valores por defecto de ONNX Runtime, de 269 a 211 MiB (-21 %) y de 190 a 161 MiB (-15 %) respectivamente. En todos los casos los tokens generados son identicos a los del modelo original.

## Capacidades

- Traduccion de texto italiano a espanol en una unica direccion (el par es `it-es`; el inverso corresponderia a `OptimaMT/es-it`).
- Generacion de texto seq2seq mediante `text2text-generation` con el pipeline `translation` de transformers.js.
- Inferencia en navegador y en Node.js gracias al formato ONNX y a la libreria transformers.js.
- Ejecucion en CPU con ONNX Runtime (el autor reporta pruebas con 4 hilos).
- Integracion en scripts Python mediante `onnxruntime`, `sentencepiece` y `numpy` (el repositorio incluye `scripts/translate.py`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Traduccion de documentacion tecnica italiana a espanol en pipelines de CI/CD: al ser un modelo ONNX de bajo consumo, puede integrarse como paso de preprocesado en la generacion de documentacion multilingue sin depender de APIs externas.
- Traduccion en el navegador: con transformers.js y `dtype: "q8"`, el modelo puede ejecutarse en el cliente para traducir contenido dinamico sin enviar texto a un servidor, lo que reduce latencia y protege la privacidad.
- Atencion al cliente automatizada en italiano con salida en espanol: util para centralizar soporte de una empresa que opera en ambos mercados, traduciendo tickets o mensajes de chat en tiempo real.
- Localizacion de interfaces de aplicaciones: traduccion de cadenas de UI y mensajes de error de italiano a espanol en procesos de build, aprovechando el bajo uso de memoria para ejecutarse en runners modestos.
- Procesamiento de corpus para investigacion en linguistica computacional: traduccion por lotes de textos italianos a espanol para construir datasets paralelos o para analisis contrastivo.
- Traduccion de contenido editorial y articulos: el modelo puede servir como primera pasada de traduccion en flujos de publicacion, con revision humana posterior, dado que mantiene los tokens del OPUS-MT original.
- Despliegue en dispositivos de borde o entornos con memoria restringida: la reduccion de memoria de hasta el 49 % permite ejecutar el traductor en contenedores con limites ajustados o en hardware de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta mediciones de memoria tras la carga y confirma que los tokens de salida son identicos a los de Xenova/opus-mt-it-es:

| Configuracion | Memoria Linux (MiB) | Memoria Windows (MiB) | Tokens identicos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 501 → 271 (-46 %) | 478 → 246 (-49 %) | si |
| Valores por defecto de ONNX Runtime | 269 → 211 (-21 %) | 190 → 161 (-15 %) | si |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en una maquina virtual).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso reportado; el modelo se ejecuta en CPU. El consumo de memoria RAM tras la carga esta entre 161 y 271 MiB segun configuracion y sistema operativo.
- GPU recomendadas: no se documentan; el modelo esta optimizado para CPU con ONNX Runtime.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU, dado su tamano de repositorio de 0,1 GB y su consumo de memoria inferior a 300 MiB.
- Opciones de despliegue: transformers.js (navegador y Node.js), ONNX Runtime en Python mediante `onnxruntime` + `sentencepiece` + `numpy`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OptimaMT/it-es | no disponible | no disponible | CC BY 4.0 | ONNX (transformers.js) | Decodificador fusionado; menor memoria |
| Xenova/opus-mt-it-es | no disponible | no disponible | CC BY 4.0 | ONNX (transformers.js) | Modelo base; misma salida, mas memoria |
| Helsinki-NLP/opus-mt-it-es | no disponible | no disponible | CC BY 4.0 | PyTorch (safetensors/bin) | Modelo OPUS-MT original; requiere framework PyTorch |

La comparativa se limita a la propia familia OPUS-MT porque no se dispone de datos de otros modelos de traduccion italiano-espanol en la informacion proporcionada. No hay datos de rendimiento (BLEU, etc.) para ninguno de ellos en esta ficha.

## Limitaciones y advertencias

- El modelo solo traduce en la direccion italiano a espanol; no soporta la direccion inversa ni otros pares idiomaticos.
- No se documentan sesgos especificos, pero al derivar de OPUS-MT hereda los sesgos de los corpus paralelos usados en su entrenamiento original, no detallados aqui.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados (legal, medico, tecnico) no cubiertos por los datos de entrenamiento; se recomienda revision humana en produccion.
- No se especifica la longitud maxima de contexto; textos largos pueden truncarse o degradar la calidad.
- La licencia CC BY 4.0 permite uso comercial con atribucion, pero exige creditar a los autores originales (Universidad de Helsinki para los pesos y Xenova para la exportacion ONNX).
- Solo se ha modificado el fichero del decodificador cuantizado; si se necesita otra variante de cuantizacion, habria que recurrir al modelo base.
- El modelo fue creado en noviembre de 2026 y no registra descargas ni likes, por lo que no hay validacion comunitaria documentada.
- La model card advierte que las mediciones de memoria se hicieron en condiciones concretas (ONNX Runtime 1.31.1, CPU, 4 hilos, Windows en VM) y pueden variar en otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/it-es
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-it-es
- Modelo OPUS-MT original: https://huggingface.co/Helsinki-NLP/opus-mt-it-es
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodologico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos (Space): https://huggingface.co/spaces/OptimaMT/results
