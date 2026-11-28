# OptimaMT/ru-uk

## Resumen

OptimaMT/ru-uk es un modelo de traduccion automatica neuronal para el par ruso-ucraniano, distribuido en formato ONNX y optimizado para ejecutarse en el navegador o en entornos con recursos limitados mediante Transformers.js. Se trata de una copia derivada de Xenova/opus-mt-ru-uk (revision `6d8a744ed6ea`), que a su vez es la exportacion ONNX del modelo original Helsinki-NLP/opus-mt-ru-uk del grupo OPUS-MT de la Universidad de Helsinki. El autor, OptimaMT, no reentrena pesos: mantiene los mismos pesos y vocabulario, y solo reconstruye el decodificador fusionado en formato ONNX cuantizado.

La contribucion concreta es una modificacion del grafo del decodificador (se saca la proyeccion de salida de sus dos ramas) y el uso del modo rapido de ONNX Runtime (`disable_quant_qdq = 1`), que segun la model card reduce el consumo de memoria entre un 46 % y un 48 % en Linux y Windows respectivamente, con una velocidad de 2,3 a 2,5 veces superior, manteniendo tokens de salida identicos al original. Es relevante para desarrolladores que necesitan traduccion ru-uk de calidad en produccion con huella de memoria minima, como el traductor de pantalla de escritorio OpenCircle, que ya lo integra.

El modelo es de tipo Marian (transformer encoder-decoder seq2seq), con vocabulario de 57.777 tokens y licencia CC BY 4.0. El repositorio ocupa 0,1 GB y esta pensado para inferencia en CPU con ONNX Runtime, no para despliegue en GPU con frameworks de servido de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, seq2seq) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8); modo rapido ONNX Runtime con `disable_quant_qdq = 1` |
| Idiomas soportados | ruso (ru) como origen, ucraniano (uk) como destino |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de ficheros identicos al original) |
| Vocabulario | 57.777 tokens |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers.js |
| Modelo base | Xenova/opus-mt-ru-uk (revision `6d8a744ed6ea`) |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer encoder-decoder clasico para traduccion automatica, heredado de Helsinki-NLP/opus-mt-ru-uk. El modelo original fue entrenado por el grupo OPUS-MT de la Universidad de Helsinki sobre corpus paralelos de OPUS. OptimaMT no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada.

La innovacion tecnica de esta version es exclusivamente de inferencia: se reconstruye el decodificador fusionado en ONNX cuantizado, moviendo la proyeccion de salida fuera de sus dos ramas (cambio solo de grafo) y activando el modo rapido de ONNX Runtime mediante `disable_quant_qdq = 1`. Segun la model card, esto produce los mismos tokens que el modelo original con menor memoria y mayor velocidad, medido en ONNX Runtime 1.31.1 sobre CPU con 4 hilos (Linux nativo y Windows en maquina virtual).

## Capacidades

- Traduccion de texto de ruso a ucraniano, unica tarea del modelo (pipeline `translation`).
- Generacion de tokens identicos al modelo base Xenova/opus-mt-ru-uk, segun la model card.
- Ejecucion en navegador y en Node.js mediante Transformers.js con `dtype: "q8"`.
- Ejecucion en Python con `onnxruntime`, `sentencepiece` y `numpy` (script `translate.py` del repositorio).
- Inferencia en CPU con bajo consumo de memoria (244-268 MiB tras la carga en el modo rapido, segun plataforma).
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking.
- No es multilingue: solo cubre el par ru-uk.

## Casos de uso

- Traduccion de pantalla en escritorio: integrado en OpenCircle (Windows y Linux) desde la version v0.1.4 para traducir texto en pantalla de ruso a ucraniano en tiempo real, gracias a su baja huella de memoria y su velocidad en CPU.
- Traduccion en el navegador sin backend: al ejecutarse con Transformers.js y ONNX, permite traducir contenido ru-uk en el cliente sin enviar texto a un servidor, util para privacidad.
- Procesamiento por lotes de documentos ru-uk: el script `translate.py` permite traducir corpus de forma local con ONNX Runtime, sin GPU, en entornos con recursos limitados.
- Extensiones y herramientas de accesibilidad: traduccion de subtitulos o interfaces de usuario ru-uk en aplicaciones de escritorio ligeras donde no cabe un modelo grande.
- Traduccion en dispositivos de bajos recursos: el consumo de 244-268 MiB tras la carga lo hace viable en maquinas sin GPU dedicada.
- Preprocesado en pipelines de NLP: normalizacion de texto ru a uk antes de tareas posteriores (busqueda, indexacion, analisis) en sistemas que ya operan en ucraniano.
- Prototipado rapido de funcionalidades de traduccion: al ser un drop-in del modelo de Xenova con la misma API de Transformers.js, permite sustituirlo sin cambiar el codigo.

## Benchmarks y rendimiento

Evaluacion en FLORES-200 devtest (1.012 frases), decodificacion greedy, segun la model card:

| Metrica | Valor |
|---|---|
| BLEU | 20,36 |
| chrF | 49,51 |
| Tokens identicos al original | si |

Consumo de memoria tras la carga (ONNX Runtime 1.31.1, CPU, 4 hilos):

| Configuracion | Linux | Windows | Tokens identicos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 494 → 268 MiB (-46 %) | 470 → 244 MiB (-48 %) | si |
| Valores por defecto de ONNX Runtime | 265 → 208 MiB (-21 %) | 189 → 159 MiB (-16 %) | si |

Velocidad: 2,3-2,5 veces mas rapido en modo rapido segun la model card. No se publican resultados de MMLU, HumanEval ni GSM8K, ya que no son aplicables a un modelo de traduccion.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo esta pensado para CPU y no requiere GPU.
- Memoria RAM tras la carga: 244-268 MiB en modo rapido (`disable_quant_qdq = 1`); 159-208 MiB con los valores por defecto de ONNX Runtime, segun plataforma.
- GPU recomendadas: no disponibles; no se documenta uso en GPU.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,1 GB y la inferencia se ejecuta en CPU con 4 hilos.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`), ONNX Runtime en Python (`onnxruntime`, `sentencepiece`, `numpy`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este formato y tamano.
- Latencia y throughput: no se proporcionan cifras absolutas de latencia; solo el factor de mejora de 2,3-2,5 veces frente al original en modo rapido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/ru-uk | no disponible | no disponible | ru → uk | CC BY 4.0 | ONNX | Decodificador fusionado optimizado, BLEU 20,36 en FLORES-200 |
| Xenova/opus-mt-ru-uk | no disponible | no disponible | ru → uk | CC BY 4.0 | ONNX | Modelo base; mismos tokens, mas memoria y mas lento |
| Helsinki-NLP/opus-mt-ru-uk | no disponible | no disponible | ru → uk | CC BY 4.0 | safetensors/PyTorch | Modelo original de OPUS-MT; requiere framework PyTorch |

## Limitaciones y advertencias

- Modelo de un solo par de idiomas (ru → uk); no traduce en sentido inverso ni a otros idiomas.
- No se documentan sesgos especificos, pero al heredar los pesos de OPUS-MT puede reproducir sesgos presentes en los corpus de entrenamiento originales.
- Riesgo de alucinacion y de traducciones erroneas en dominios especializados (tecnico, juridico, medico) no cubiertos por el corpus de entrenamiento; no se han publicado evaluaciones por dominio.
- No se dispone de datos sobre longitud maxima de contexto ni sobre comportamiento con entradas muy largas.
- Licencia CC BY 4.0: permite uso comercial con atribucion. Es necesario citar a OPUS-MT (Universidad de Helsinki), a Xenova por la exportacion ONNX y a OptimaMT por la modificacion del grafo.
- La optimizacion depende de `disable_quant_qdq = 1` en ONNX Runtime; con los valores por defecto la mejora de memoria es menor (16-21 %).
- Solo se ha reconstruido `onnx/decoder_model_merged_quantized.onnx`; el resto de ficheros son identicos al original, por lo que cualquier limitacion del modelo base se mantiene.
- No apto para tareas generativas generales, razonamiento, codigo ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ru-uk
- Modelo base (exportacion ONNX): https://huggingface.co/Xenova/opus-mt-ru-uk
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-ru-uk
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Coleccion de los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Informe metodologico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Aplicacion OpenCircle: https://github.com/AmerAlreyahi/OpenCircle
