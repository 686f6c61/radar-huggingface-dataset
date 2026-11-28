# OptimaMT/ar-fr

## Resumen

OptimaMT/ar-fr es un modelo de traduccion automatica arabe-frances publicado por OptimaMT, un proyecto que redistribuye exportaciones ONNX optimizadas de los modelos OPUS-MT de la Universidad de Helsinki. Se trata de una copia directa del export ONNX de Helsinki-NLP/opus-mt-ar-fr (revision `e507d7bc8508`), con la particularidad de que el decoder fusionado ha sido reconstruido para aprovechar el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`), lo que reduce el consumo de memoria a la mitad y acelera la inferencia entre 2,3 y 2,5 veces respecto al export original.

El modelo mantiene exactamente los mismos pesos y produce los mismos tokens que el OPUS-MT original, por lo que no hay perdida de calidad en la traduccion: en FLORES-200 devtest (1.012 frases) obtiene BLEU 26,01 y chrF 53,48 en decodificacion greedy, identicos al modelo base. Su interes practico radica en el despliegue en entornos con recursos limitados: al ejecutarse en CPU con ONNX Runtime y ocupar apenas 265-290 MiB tras la carga, es adecuado para aplicaciones de escritorio, plugins y herramientas de traduccion en tiempo real.

La arquitectura subyacente es Marian (transformer encoder-decoder), con un vocabulario de 64.505 tokens y un tamano de repositorio de 0,1 GB. El modelo esta empaquetado para transformers.js con cuantizacion q8, lo que permite usarlo directamente en JavaScript/Node y en el navegador, ademas de ofrecer una ruta Python via onnxruntime y sentencepiece.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8 (cuantizacion del decoder fusionado en ONNX); pesos originales en el export ONNX |
| Idiomas soportados | arabe (ar), frances (fr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`decoder_model_merged_quantized.onnx`, entre otros); tokenizer en formato Xenova (`tokenizer.json`, `special_tokens_map.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Marian del OPUS-MT original de Helsinki-NLP: un transformer encoder-decoder disenado especificamente para traduccion automatica, entrenado por la Universidad de Helsinki sobre corpus paralelos del proyecto OPUS. El vocabulario consta de 64.505 tokens y el modelo se distribuye como exportacion ONNX compatible con transformers.js.

La innovacion de esta version de OptimaMT no esta en el entrenamiento (los pesos son identicos al modelo base, byte a byte salvo el decoder reconstruido), sino en la optimizacion del grafo ONNX: la proyeccion de salida del decoder se ha movido fuera de sus dos ramas, lo que permite activar el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`). Segun la model card, esto reduce la memoria tras la carga de 542 a 290 MiB en Linux (-47 %) y de 514 a 265 MiB en Windows (-48 %), con una aceleracion de 2,3 a 2,5 veces, manteniendo tokens de salida identicos. No se documentan datos sobre el numero de tokens de entrenamiento, composicion del dataset ni tecnicas de RLHF/DPO en la informacion disponible.

## Capacidades

- Traduccion de texto de arabe a frances, unica tarea para la que esta disenado el pipeline (`translation`).
- Generacion de traducciones deterministas en modo greedy, con calidad equivalente al OPUS-MT original (BLEU 26,01, chrF 53,48 en FLORES-200 devtest).
- Ejecucion en CPU con ONNX Runtime 1.31.1 y 4 hilos, sin necesidad de GPU.
- Integracion en transformers.js con `dtype: "q8"` y opciones de sesion para activar el modo rapido.
- Uso en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py` incluido en el repositorio del proyecto).
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues limitadas estrictamente al par ar-fr; no se documenta soporte para otros idiomas.

## Casos de uso

- Traduccion de pantalla en tiempo real en aplicaciones de escritorio: el modelo se integra en OpenCircle, un traductor de pantalla para Windows y Linux que lo distribuye desde la version v0.1.4. Su bajo consumo (265-290 MiB tras la carga) y su velocidad en CPU lo hacen adecuado para capturar y traducir texto en vivo sin penalizar el rendimiento del sistema.
- Traduccion de documentos y contenido editorial arabe-frances: con BLEU 26,01 en FLORES-200, es util para pre-traducir articulos, informes o correspondencia que luego revise un traductor humano, reduciendo el coste frente a la traduccion manual completa.
- Localizacion de interfaces y software: al ejecutarse en transformers.js, puede integrarse en aplicaciones web o extensiones de navegador para traducir cadenas de UI y mensajes de usuario de forma local, sin enviar datos a servicios externos.
- Procesamiento por lotes de corpus paralelos: la ruta Python con onnxruntime permite traducir grandes volumenes de texto en pipelines de datos, por ejemplo para enriquecer datasets multilingues o construir memorias de traduccion.
- Atencion al cliente en entornos bilingues: util como capa de traduccion en sistemas de ticketing o chat donde el agente habla frances y el cliente escribe en arabe, con la ventaja de que la inferencia puede ejecutarse on-premise.
- Herramientas educativas y de aprendizaje de idiomas: permite mostrar traducciones instantaneas de frases arabes al frances en aplicaciones de estudio, con despliegue local que evita dependencias de API y protege la privacidad del usuario.
- Traduccion offline en dispositivos con recursos limitados: al no requerir GPU y ocupar menos de 300 MiB en memoria, es viable en portatiles modestos, mini-PC y entornos de escritorio sin aceleracion hardware.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| FLORES-200 devtest (1.012 frases) | BLEU | 26,01 |
| FLORES-200 devtest (1.012 frases) | chrF | 53,48 |
| Memoria tras carga (Linux, modo rapido) | MiB | 542 → 290 (-47 %) |
| Memoria tras carga (Windows, modo rapido) | MiB | 514 → 265 (-48 %) |
| Memoria tras carga (Linux, defaults ONNX Runtime) | MiB | 288 → 226 (-22 %) |
| Memoria tras carga (Windows, defaults ONNX Runtime) | MiB | 200 → 170 (-15 %) |
| Aceleracion del modo rapido | factor | 2,3-2,5x |

Los resultados se obtuvieron con ONNX Runtime 1.31.1 en CPU con 4 hilos (Linux nativo, Windows en maquina virtual). No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo documentado; el modelo esta pensado para CPU. En GPU, el consumo seria minimo dado el tamano del repositorio (0,1 GB).
- GPU recomendadas: no se documentan; cualquier GPU con soporte de ONNX Runtime seria suficiente, pero el caso de uso objetivo es CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU: la memoria tras la carga es de 265-290 MiB en modo rapido.
- Opciones de despliegue: transformers.js (JavaScript/Node/navegador), onnxruntime en Python (script `translate.py`), y cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no se proporcionan cifras absolutas de latencia o tokens por segundo; solo la aceleracion relativa de 2,3-2,5x del modo rapido frente al export original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/ar-fr | no disponible | no disponible | ar → fr | CC BY 4.0 | ONNX (transformers.js) | Optimizado para CPU, 2,3-2,5x mas rapido, misma calidad que el base |
| Helsinki-NLP/opus-mt-ar-fr | no disponible | no disponible | ar → fr | CC BY 4.0 | PyTorch / ONNX (Xenova) | Modelo base original; mayor consumo de memoria y menor velocidad en CPU |
| Xenova/opus-mt-ar-fr | no disponible | no disponible | ar → fr | CC BY 4.0 | ONNX (transformers.js) | Export ONNX de referencia con el mismo layout; sin la optimizacion del decoder |

No se dispone de datos de benchmarks comparativos con otros sistemas de traduccion (por ejemplo, NLLB o modelos comerciales) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en traduccion arabe-frances; no realiza otras tareas ni soporta otros pares de idiomas.
- Riesgo de alucinacion y errores en textos con terminologia especializada, nombres propios, dialectos arabes o registro coloquial; la calidad BLEU 26,01 en FLORES-200 indica margen de mejora en comparacion con sistemas neuronales de mayor tamano.
- No se documentan sesgos especificos, pero al derivar de corpus OPUS puede heredar sesgos de dominio y de las fuentes de entrenamiento originales.
- Longitud de contexto no documentada; textos muy largos pueden requerir segmentacion manual.
- Licencia CC BY 4.0: permite uso comercial con atribucion a la Universidad de Helsinki (pesos OPUS-MT) y a OptimaMT (export optimizado). Es necesario conservar los creditos indicados en la model card.
- El rendimiento medido corresponde a ONNX Runtime 1.31.1 en CPU con 4 hilos; otros entornos pueden variar. La aceleracion de 2,3-2,5x depende de activar `disable_quant_qdq = 1` en las opciones de sesion.
- No se garantiza equivalencia byte a byte en todos los ficheros: el decoder fusionado fue reconstruido y los ficheros de tokenizer se reescribieron en el layout Xenova.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ar-fr
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ar-fr
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Coleccion con los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Metodologia (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- OpenCircle (aplicacion que lo usa en produccion): https://github.com/AmerAlreyahi/OpenCircle
