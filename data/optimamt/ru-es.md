# OptimaMT/ru-es

## Resumen

OptimaMT/ru-es es un modelo de traduccion automatica ruso-castellano derivado de Xenova/opus-mt-ru-es, que a su vez es una exportacion a ONNX del modelo OPUS-MT de la Universidad de Helsinki. Se distribuye como copia directa de los pesos originales con un unico cambio: el decoder fusionado (merged decoder) ha sido reconstruido para aprovechar el modo rapido de ONNX Runtime mediante la opcion `disable_quant_qdq = 1`, lo que reduce el uso de memoria entre un 47 y un 49 por ciento en Linux y Windows respectivamente, manteniendo exactamente los mismos tokens de salida que el original.

El modelo resuelve la traduccion de texto de ruso a castellano en entornos de inferencia ligera, especialmente en navegador mediante transformers.js y en aplicaciones de escritorio. Su relevancia actual radica en que permite ejecutar traduccion neuronal de calidad en CPU y en dispositivos con recursos limitados, con un consumo de memoria tras la carga de tan solo 260-285 MiB en el modo optimizado. La arquitectura es Marian (transformer encoder-decoder), con un vocabulario de 63.430 tokens y un peso total del repositorio de 0,1 GB.

Forma parte del proyecto OptimaMT, que publica 51 pares de idiomas bajo la misma metodologia, y se encuentra en produccion en la aplicacion OpenCircle, un traductor de pantalla de escritorio para Windows y Linux desde su version 0.1.4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); decoder merged quantized |
| Idiomas soportados | ruso (ru) y castellano (es) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de archivos identicos al original) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica. Los pesos proceden de OPUS-MT de la Universidad de Helsinki, entrenados sobre datos paralelos del proyecto OPUS. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de esta version es exclusivamente de inferencia: se ha reconstruido el decoder fusionado moviendo la proyeccion de salida fuera de sus dos ramas (cambio unicamente en el grafo), lo que permite activar el modo rapido de ONNX Runtime con `disable_quant_qdq = 1`. Esto produce una aceleracion de 2,3 a 2,5 veces y reduce el uso de memoria a la mitad, sin alterar los pesos ni los tokens generados. El resto de archivos del repositorio son identicos byte a byte al original de Xenova/opus-mt-ru-es en la revision `9cb5fb9fae4d`.

## Capacidades

- Traduccion de texto de ruso a castellano, unica tarea del modelo (pipeline `translation`).
- Generacion de tokens identicos al modelo base Xenova/opus-mt-ru-es.
- Ejecucion en navegador mediante transformers.js con backend ONNX.
- Ejecucion en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py`).
- Inferencia en CPU con 4 hilos (resultados reportados en Linux y Windows en maquina virtual).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada estrictamente al par ru-es.

## Casos de uso

- Traduccion de pantalla en escritorio: integrado en OpenCircle para Windows y Linux desde la version 0.1.4, traduce texto ruso visible en pantalla al castellano con un consumo de memoria de 260-285 MiB tras la carga, adecuado para equipos sin GPU dedicada.
- Traduccion en navegador sin backend: mediante transformers.js y ONNX, permite ofrecer traduccion ru-es directamente en el cliente, sin enviar texto a un servidor, lo que reduce latencia y mejora la privacidad.
- Procesamiento por lotes de documentos rusos: el script `translate.py` basado en onnxruntime permite traducir corpus de forma local en CPU, sin dependencias de frameworks pesados.
- Traduccion de subtitulos y transcripciones: al ser un modelo ligero y rapido (2,3-2,5 veces mas rapido que el original en modo optimizado), es viable para pipelines que procesan segmentos cortos de forma secuencial.
- Prototipado de sistemas de traduccion en entornos con recursos limitados: sirve como componente base en aplicaciones de escritorio, dispositivos embebidos o contenedores con poca memoria.
- Traduccion de contenido generado por usuarios en foros y chats de tematica rusa: la ventana de contexto no esta documentada, por lo que es adecuado para mensajes y parrafos individuales mas que para documentos muy largos.
- Evaluacion y comparacion de variantes ONNX: al mantener tokens identicos al original, permite medir ganancias de memoria y velocidad sin sesgo de calidad en pruebas de infraestructura.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FLORES-200 devtest (1.012 frases) | BLEU 18,07; chrF 46,65 (decodificacion greedy) |
| Memoria tras carga, Linux, `disable_quant_qdq = 1` | 533 → 285 MiB (-47 %) |
| Memoria tras carga, Windows, `disable_quant_qdq = 1` | 509 → 260 MiB (-49 %) |
| Memoria tras carga, Linux, valores por defecto de ONNX Runtime | 284 → 222 MiB (-22 %) |
| Memoria tras carga, Windows, valores por defecto de ONNX Runtime | 197 → 168 MiB (-14 %) |
| Tokens generados respecto al original | Identicos |
| Aceleracion del modo rapido | 2,3-2,5 veces |

Condiciones de medida: ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en maquina virtual).

## Requisitos de hardware

- VRAM: no aplica, el modelo esta pensado para CPU; el consumo de memoria RAM tras la carga es de 260-285 MiB en modo optimizado y de 168-222 MiB con los valores por defecto de ONNX Runtime.
- GPU recomendadas: no se requieren; no se han publicado datos de inferencia en GPU en la informacion disponible.
- Cabe en cualquier GPU de consumo y en equipos sin GPU dedicada; el repositorio ocupa 0,1 GB.
- Opciones de despliegue: transformers.js (navegador), onnxruntime en Python mediante `translate.py`, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no se han publicado cifras absolutas de latencia o throughput; solo se reporta la mejora relativa de 2,3-2,5 veces frente al original en modo rapido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/ru-es | no disponible | no disponible | ru, es | CC BY 4.0 | ONNX | Decoder merged optimizado; 260-285 MiB tras carga; BLEU 18,07 en FLORES-200 |
| Xenova/opus-mt-ru-es | no disponible | no disponible | ru, es | CC BY 4.0 | ONNX | Modelo base; mismos tokens; mayor consumo de memoria y menor velocidad en modo rapido |
| Helsinki-NLP/opus-mt-ru-es | no disponible | no disponible | ru, es | CC BY 4.0 | safetensors (formato original de OPUS-MT) | Pesos originales de la Universidad de Helsinki; requiere conversion para ONNX |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en traduccion ru-es; no admite otras tareas ni otros pares de idiomas.
- No se han documentado sesgos especificos, pero al heredar los pesos de OPUS-MT puede reproducir sesgos presentes en los corpus paralelos de OPUS.
- Riesgo de alucinacion y de traducciones inexactas en dominios especializados, frases muy largas o texto con ruido, comun en modelos de traduccion de este tamano.
- La longitud de contexto no esta documentada; se recomienda usar segmentos cortos y verificar el comportamiento con parrafos largos.
- Licencia CC BY 4.0: permite uso comercial con atribucion; es obligatorio citar a los autores originales (Universidad de Helsinki, OPUS-MT) y a Xenova por la exportacion ONNX.
- El rendimiento reportado se ha medido en CPU con 4 hilos; los valores en otros entornos pueden diferir.
- Solo se ha reconstruido el archivo `onnx/decoder_model_merged_quantized.onnx`; el resto de archivos deben tratarse como los del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ru-es
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-ru-es
- Pesos originales OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-ru-es
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodologico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Coleccion de los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Aplicacion OpenCircle: https://github.com/AmerAlreyahi/OpenCircle
