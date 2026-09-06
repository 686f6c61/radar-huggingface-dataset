# neptune-st/finbert_onnx

## Resumen

El modelo `neptune-st/finbert_onnx` aparece registrado en Hugging Face como un repositorio de 0.1 GB con licencia Apache 2.0 y la etiqueta `onnx`. Sin embargo, la model card es prácticamente inexistente y los resultados de busqueda web no aportan informacion tecnica sobre el modelo. El nombre sugiere que podria tratarse de una version en formato ONNX de un modelo FinBERT (es decir, un BERT ajustado para tareas de analisis de sentimiento en textos financieros), pero no existe documentacion oficial que lo confirme. Tampoco se especifican arquitectura, numero de parametros, contexto o idiomas. En consecuencia, la ficha tecnica de este modelo es de utilidad limitada y no debe considerarse como una referencia fiable para su evaluacion o despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (según la etiqueta del repositorio) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura, los datos de entrenamiento, el proceso de ajuste ni posibles tecnicas de optimizacion en la informacion disponible. El unico dato objetivo es que el repositorio contiene pesos en formato ONNX y que su tamano total es de aproximadamente 0.1 GB, lo que sugiere un modelo de tamano reducido. No obstante, al carecer de documentacion, no es posible confirmar si se trata del FinBERT original de ProsusAI (con 110 millones de parametros aproximadamente) o de una version modificada.

## Capacidades

No se dispone de informacion oficial sobre las capacidades del modelo. A partir del nombre y la etiqueta `onnx`, se puede inferir que, en caso de ser una variante de FinBERT, estaria orientado a:

- Analisis de sentimiento en textos financieros y periodisticos.
- Clasificacion de documentos del sector economico.
- Extraccion de entidades financieras (a traves de fine-tuning adicional).

No hay datos que permitan afirmar soporte de tool calling, razonamiento multi-paso, vision, audio o capacidades multilingues especificas.

## Casos de uso

Dado que la informacion disponible es insuficiente para validar el rendimiento del modelo, los siguientes casos de uso son hipoteticos y deben considerarse solo como orientativos:

- Analisis de sentimiento en noticias financieras: podria utilizarse para clasificar titulares y articulos en positivos, negativos o neutros, siempre que previamente se haya validado su precision.
- Monitorizacion de redes sociales sobre empresas cotizadas: un modelo FinBERT podria procesar tweets y posts sobre companias para detectar cambios de opinion.
- Clasificacion de informes anuales: separacion automatica de secciones en documentos como memorias anuales o prospectos de emision.
- Analisis de comunicados de la CNMV: categorizacion de comunicados de entidades reguladas segun su impacto en el mercado.
- Enriquecimiento de datos bursatiles: puntuacion automatica de la polaridad de textos economicos antes de alimentar algoritmos de trading.
- Integracion en pipelines ONNX: al estar en formato ONNX, podria desplegarse en entornos como ONNX Runtime o WebML para inferencia local, aunque esto requeriria documentacion adicional.

Ninguno de estos casos de uso puede confirmarse sin datos de benchmarks ni una model card detallada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. En la busqueda web no se han encontrado evaluaciones comparativas (MMLU, HumanEval, GSM8K, etc.) para este repositorio. No se deben asumir metricas de referencia sin evidencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPUs de consumo: no disponible, aunque el tamano del repositorio (0.1 GB) sugiere que un modelo en ONNX de este tipo podria ejecutarse en CPUs o en GPUs modestas (por ejemplo, una GTX 1650 o superior), sin embargo esto no puede afirmarse con certeza.
- Opciones de despliegue: al tratarse de pesos ONNX, es plausible el uso de ONNX Runtime, pero no se aportan instrucciones ni verificaciones. No se han confirmado integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparacion rigurosa con otras alternativas. El modelo `neptune-st/finbert_onnx` carece de documentacion tecnica, benchmarks y especificaciones, por lo que no puede equipararse de forma fiable con modelos como `ProsusAI/finbert` o `Xenova/finbert`, que si cuentan con pesos publicados y usos documentados en tareas financieras. Cualquier comparacion seria especulativa.

## Limitaciones y advertencias

- El repositorio presenta una model card practicamente vacia, sin descripcion, usos esperados, limitaciones ni parametros.
- No se proporciona informacion sobre sesgos, datos de entrenamiento ni metodologia.
- No existen resultados de benchmarks publicados, por lo que el rendimiento real es desconocido.
- El modelo no tiene suficientes garantias para su uso en produccion sin una evaluacion independiente previa.
- La licencia Apache 2.0 permite uso comercial, pero no garantiza la calidad del modelo ni la ausencia de riesgos legales derivados de los datos de entrenamiento (desconocidos).
- El formato ONNX ofrece portabilidad, pero sin documentacion estructurada (nombres de entradas, salidas, tipos, tokenizacion asociada) es dificil integrarlo correctamente.
- La fecha de creacion (2026) podria indicar que el repositorio es de nueva publicacion, pero no se ha podido confirmar su autenticidad ni su relacion con el proyecto FinBERT original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/neptune-st/finbert_onnx
- Modelo ONNX de referencia similar (no es el mismo repositorio): https://huggingface.co/Xenova/finbert
- ONNX Model Zoo (para contexto general): https://github.com/onnx/models
