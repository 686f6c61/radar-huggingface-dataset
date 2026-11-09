# OptimaMT/ru-es

## Resumen

OptimaMT/ru-es es un modelo de traduccion automatica ruso-espanol derivado de Xenova/opus-mt-ru-es, que a su vez es una exportacion a ONNX del modelo OPUS-MT de la Universidad de Helsinki. La contribucion de OptimaMT consiste en una reescritura del grafo del decodificador fusionado cuantizado (`decoder_model_merged_quantized.onnx`), moviendo la proyeccion de salida fuera de sus dos ramas. El resto de archivos del repositorio son identicos byte a byte a los del modelo base.

La relevancia de esta variante es puramente de eficiencia en inferencia: mantiene exactamente los mismos pesos y produce los mismos tokens que el original, pero reduce el consumo de memoria tras la carga entre un 22 % y un 49 % segun la configuracion de ONNX Runtime y la plataforma (Linux o Windows). Esta pensado para despliegues en navegador o en entornos con recursos limitados mediante transformers.js.

Se trata de un modelo Marian de traduccion unidireccional (ru a es) con un vocabulario de 63.430 tokens, publicado bajo licencia CC BY 4.0 y distribuido exclusivamente en formato ONNX cuantizado. Forma parte de la coleccion OptimaMT, que cubre 49 pares de idiomas bajo el mismo esquema de nombres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, seq2seq) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en transformers.js; `decoder_model_merged_quantized.onnx`) |
| Idiomas soportados | Ruso (ru) y espanol (es) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (unico formato publicado) |
| Vocabulario | 63.430 tokens |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers.js |
| Modelo base | Xenova/opus-mt-ru-es (revision `9cb5fb9fae4d`) |
| Pipeline | translation |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica neuronal, originalmente desarrollado en el marco del proyecto OPUS de la Universidad de Helsinki. El modelo es unidireccional: traduce unicamente de ruso a espanol y no soporta el par inverso. No se dispone de informacion sobre el numero de parametros, el volumen de tokens de entrenamiento ni la composicion del corpus utilizado en la informacion proporcionada.

La innovacion tecnica de esta variante no reside en el entrenamiento, sino en la optimizacion del grafo ONNX. El autor ha reconstruido el decodificador fusionado cuantizado moviendo la proyeccion de salida fuera de las dos ramas del grafo. Segun la model card, esto produce una reduccion de memoria tras la carga de 533 a 285 MiB en Linux (-47 %) y de 509 a 260 MiB en Windows (-49 %) con `disable_quant_qdq = 1`, y de 284 a 222 MiB (-22 %) en Linux y de 197 a 168 MiB (-14 %) en Windows con los valores por defecto de ONNX Runtime. En todos los casos la secuencia de tokens generada es identica a la del modelo original. Las mediciones se realizaron con ONNX Runtime 1.31.1 sobre CPU con 4 hilos (Windows en una maquina virtual).

## Capacidades

- Traduccion de texto de ruso a espanol, unica tarea soportada por el pipeline `translation`.
- Generacion de tokens identica al modelo base Xenova/opus-mt-ru-es, segun las pruebas del autor.
- Ejecucion en navegador y en Node.js mediante transformers.js con `dtype: "q8"`.
- Ejecucion en Python mediante ONNX Runtime, SentencePiece y NumPy (script `translate.py` del repositorio del proyecto).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, vision ni audio.
- Cobertura bilingue limitada exclusivamente al par ru-es; no es un modelo multilingue general.

## Casos de uso

- Traduccion en el navegador sin backend: al distribuirse en ONNX y ser compatible con transformers.js, el modelo puede ejecutarse integramente en el cliente, lo que permite ofrecer traduccion ru-es en aplicaciones web sin enviar el texto a un servidor y sin coste de infraestructura por inferencia.
- Traduccion de contenido editorial ruso: articulos, documentacion o notas de prensa en ruso pueden convertirse a espanol en lotes mediante el script de Python incluido, con un consumo de memoria contenido (del orden de 170-290 MiB tras la carga) que permite ejecutar el proceso en instancias pequenas.
- Extension de navegador para lectura: integracion en una extension que traduzca parrafos seleccionados de paginas en ruso, aprovechando la reduccion de memoria del decodificador fusionado para mantener bajo el consumo del proceso del navegador.
- Preprocesado en pipelines de datos multilingues: uso como etapa de traduccion dentro de un ETL que normalice corpus rusos a espanol antes de indexarlos o analizarlos, donde el ahorro de memoria es relevante al ejecutar muchos procesos en paralelo.
- Traduccion en dispositivos con recursos limitados: el modelo cabe en entornos con poca RAM y sin GPU, lo que lo hace apto para dispositivos edge, contenedores pequenos o funciones serverless con limites de memoria estrictos.
- Prototipado rapido de sistemas de traduccion: al ser una copia directa del modelo de Xenova con el mismo comportamiento de salida, sirve como sustituto inmediato en prototipos existentes que ya usen el pipeline de transformers.js, reduciendo el consumo sin cambios en el codigo mas alla de la configuracion de sesion.
- Traduccion de correspondencia y documentacion interna: para organizaciones que reciben material en ruso y necesitan versiones en espanol con un coste de infraestructura minimo, dado que el modelo no requiere GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traduccion (BLEU, chrF, COMET) en la informacion disponible. Los unicos datos de rendimiento proporcionados son mediciones de memoria tras la carga:

| Configuracion | Linux (MiB) | Windows (MiB) | Tokens identicos |
|---|---|---|---|
| `disable_quant_qdq = 1` | 533 → 285 (-47 %) | 509 → 260 (-49 %) | si |
| Valores por defecto de ONNX Runtime | 284 → 222 (-22 %) | 197 → 168 (-14 %) | si |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos. No se proporcionan datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para inferencia en CPU. El consumo de memoria del proceso tras la carga se situa entre 168 y 285 MiB segun plataforma y configuracion.
- GPU recomendadas: no se especifican; el modelo se distribuye en ONNX cuantizado para CPU y no se documenta ejecucion en GPU.
- GPU de consumo: irrelevante para este modelo; no requiere acelerador grafico.
- Despliegue: transformers.js (navegador y Node.js) con `dtype: "q8"` y `session_options: { extra: { session: { disable_quant_qdq: "1" } } }`; ONNX Runtime en Python mediante el script `translate.py`; el formato ONNX es compatible con otros runtimes de ONNX, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/ru-es | no disponible | no disponible | ru → es | CC BY 4.0 | ONNX | Decodificador fusionado optimizado; misma salida que el base |
| Xenova/opus-mt-ru-es | no disponible | no disponible | ru → es | CC BY 4.0 | ONNX | Modelo base; mayor consumo de memoria |
| Helsinki-NLP/opus-mt-ru-es | no disponible | no disponible | ru → es | CC BY 4.0 | safetensors / PyTorch | Modelo original de OPUS-MT; requiere conversion a ONNX para despliegue web |

La comparativa se limita a la familia OPUS-MT ru-es, ya que no se dispone de datos de otros modelos de traduccion ru-es en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de ruso a espanol; no soporta el par inverso ni otros idiomas.
- No se han publicado evaluaciones de calidad de traduccion (BLEU, chrF, COMET) en la informacion disponible, por lo que el rendimiento real en dominios especificos no esta documentado.
- Al ser un modelo Marian de traduccion, puede producir traducciones literales, perder matices idiomaticos y fallar en terminologia especializada o nombres propios.
- Riesgo de alucinacion y de omision de contenido en textos largos o con estructuras sintacticas complejas; no se documenta la longitud de contexto soportada.
- La validacion de tokens identicos se realizo con una unica frase de ejemplo ("Маяк стоит на берегу моря."), por lo que la equivalencia con el modelo base no esta verificada de forma exhaustiva.
- El repositorio solo publica pesos en ONNX cuantizado; no se ofrecen safetensors ni pesos en precision completa, lo que limita el reentrenamiento o el ajuste fino.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribucion a los autores originales (Universidad de Helsinki por los pesos, Xenova por la exportacion ONNX y OptimaMT por la modificacion del grafo).
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar su robustez en produccion.
- La fecha de creacion del repositorio (2026-11-09) es posterior a la fecha actual en algunos contextos de consulta; conviene verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ru-es
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodologico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Modelo base (exportacion ONNX): https://huggingface.co/Xenova/opus-mt-ru-es
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-ru-es
