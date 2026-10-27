# fcreait/smart-pii-redactor-it-onnx

## Resumen

Smart PII Redactor IT (ONNX) es un clasificador de tokens para la deteccion y el enmascarado de datos personales (PII) en texto italiano. Lo publica el usuario fcreait y es un ajuste fino de `Mozilla/smart-pii-redactor-v1-onnx`, del que hereda el conjunto de etiquetas, el tokenizador y el formato de entrada. El modelo resuelve un problema acotado y muy concreto: identificar spans de PII en dialogos hablados y en texto juridico-administrativo italiano para poder sustituirlos por mascaras antes de que el texto llegue a otro sistema.

Arquitectonicamente es un encoder transformer de tipo XLM-RoBERTa con cabeza de clasificacion de tokens, de unos 19M de parametros (74 MB en fp32). No genera texto: emite una etiqueta por token, con ventanas de entrada de hasta 256 tokens y una estrategia recomendada de ventanas solapadas con stride 192 para documentos largos. Su relevancia practica esta en el regimen de despliegue: al ser un modelo ONNX de menos de 100 MB, se ejecuta en CPU con latencia baja y sin GPU, lo que permite anonimizar en el propio entorno sin enviar datos a terceros.

El autor reporta resultados competitivos frente a `rizzo-pii-0.3B` (un modelo dos ordenes de magnitud mayor) en dialogos sinteticos italianos, con un 1,5% de entidades sin enmascarar y un 0,3% de sobremascarado, y una mejora muy grande respecto al modelo base de Mozilla en texto juridico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa con cabeza de clasificacion de tokens (token classification) |
| Parametros totales | ~19M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens por ventana de entrada; el autor recomienda ventanas solapadas con stride 192 para textos largos |
| Tipos de cuantizacion | fp32 (unico artefacto publicado: `onnx/model.onnx`, 74 MB); no se documentan variantes int8 o fp16 |
| Idiomas soportados | Italiano (`it`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`); pesos originales del modelo base no incluidos en este repo |
| Entradas del grafo | `input_ids` y `attention_mask`, ambas `int64` |
| Tamano del repositorio | 0,1 GB |
| Pipeline de HuggingFace | `token-classification` |
| Modelo base | `Mozilla/smart-pii-redactor-v1-onnx` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional de la familia XLM-RoBERTa con una cabeza de clasificacion por token, ajustado para etiquetar spans de PII. El autor no documenta la configuracion interna (numero de capas, dimension oculta, cabezas de atencion) ni el vocabulario; solo indica el tamano total (~19M de parametros) y que mantiene el juego de etiquetas, el tokenizador y el formato de entrada del modelo base de Mozilla. La entrada se procesa en ventanas de hasta 256 tokens (`input_ids`, `attention_mask` en `int64`); para textos mas largos se recomienda trocear con solapamiento de stride 192 y, para cada token, quedarse con los logits de la ventana en la que el token queda mas lejos de un borde.

El entrenamiento combina dos fuentes: aproximadamente 5.000 dialogos hablados sinteticos en italiano generados por un LLM y una repeticion (*replay*) del dataset `rizzoaiacademy/rizzo-pii-it-dataset`, que aporta texto juridico y administrativo sintetico, texto real derivado de DeepMount00 y de Ai4Privacy, y matriculas de vehiculos. No se documentan el numero total de tokens, la composicion exacta del dataset, ni si hubo RLHF, DPO u otra fase de alineacion; tampoco se detalla la funcion de perdida ni los hiperparametros de ajuste fino. La innovacion destacable no es arquitectonica sino de evaluacion: el autor publica protocolos de medida separados para dialogos (enmascarado por valor repetido, con capa regex para emails, telefonos e identificadores) y para texto juridico (protocolo de `rizzo-pii`, con coincidencia estricta de tipo y span).

## Capacidades

- Clasificacion de tokens para deteccion de PII en italiano: identificacion de spans correspondientes a entidades personales segun el esquema de etiquetas heredado de `Mozilla/smart-pii-redactor-v1`.
- Enmascarado de valores detectados en todas sus apariciones dentro de una linea o documento, segun el protocolo de evaluacion descrito por el autor.
- Procesamiento de dialogos multi-turno y de texto juridico y administrativo italiano, los dos dominios sobre los que se entreno.
- Manejo de texto largo mediante inferencia por ventanas solapadas (256 tokens por ventana, stride 192) con seleccion de logits por distancia al borde.
- Inferencia en CPU y en entornos sin GPU gracias al formato ONNX de 74 MB.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni uso como agente. Es exclusivamente un etiquetador discriminativo.
- No se documenta capacidad multilingue: el modelo esta entrenado y declarado solo para italiano.

## Casos de uso

- Anonimizado previo a LLM en pipelines RAG: el modelo enmascara nombres, documentos y matriculas del texto recuperado o del prompt antes de enviarlo a un modelo generativo, y al ejecutarse en ONNX sobre CPU puede desplegarse en el mismo nodo donde se construye el contexto.
- Cumplimiento de RGPD en atencion al cliente: clasificacion de transcripciones de dialogos italianos para localizar y sustituir datos personales antes del almacenamiento o del envio a herramientas de analitica, apoyandose en el 1,5% de entidades sin enmascarar reportado en dialogos sinteticos.
- Redaccion de expedientes y escritos juridicos: procesamiento por ventanas solapadas de contratos, escritos y resoluciones administrativas en italiano, donde el autor reporta entre un 0,97% y un 1,05% de entidades sin enmascarar frente a un 47,6-72,3% del modelo base de Mozilla.
- Preprocesado de datasets para entrenamiento: limpieza de corpus italianos antes de publicarlos o de reutilizarlos, con un sobremascarado bajo (0,10-0,3%) que preserva la utilidad del texto para el entrenamiento.
- Enmascarado en el navegador o en el dispositivo: los 74 MB del modelo permiten ejecucion con ONNX Runtime Web o en movil, de modo que los datos no salen del cliente antes de la redaccion.
- Capa complementaria a expresiones regulares: el autor combina el modelo con una capa regex para emails, telefonos e identificadores, de modo que el clasificador cubre nombres, direcciones y entidades que las regex no capturan.
- Moderacion y registro de auditoria: registro de que tipo de PII aparece en cada documento y en que cantidad, sin conservar los valores originales, usando las etiquetas emitidas por token.

## Benchmarks y rendimiento

El autor publica dos evaluaciones. En cada celda, el primer valor es la proporcion de entidades que quedan sin enmascarar (menor es mejor) y el segundo, tras la barra, la proporcion de palabras no PII enmascaradas por error (menor es mejor).

**Dialogos italianos.** 998 dialogos sinteticos reservados, con 22.474 entidades, escritos por un LLM distinto al usado en el entrenamiento. Cada linea se clasifica y todo valor detectado se enmascara en todas sus repeticiones; se aplica la misma capa regex y el mismo postprocesado a todos los modelos.

| Modelo | Sin enmascarar / sobremascarado |
|---|---|
| **este modelo** | **1,5% / 0,3%** |
| rizzo-pii-0.3B | 4,1% / 0,2% |
| Mozilla/smart-pii-redactor-v1 | 2,8% / 1,2% |

**Texto juridico italiano.** Conjuntos de validacion de `rizzo-pii-it-dataset`, puntuados con el protocolo propio de rizzo-pii (tokens de palabra, coincidencia estricta de tipo y span); los tipos de este modelo se mapean a los compartidos.

| Conjunto de test | este modelo | rizzo-pii-0.3B | Mozilla base |
|---|---|---|---|
| `validation_real` | 0,97% / 0,21% | 0,38% / 0,05% | 72,3% / 2,60% |
| `validation_real`, piezas `##` unidas en palabras | 2,75% / 0,14% | 2,87% / 0,05% | 32,5% / 3,11% |
| `validation_clean` | 1,05% / 0,10% | 0,00% / 0,01% | 47,6% / 1,06% |

En `validation_real`, el 64% de las filas contienen piezas WordPiece `##`; la segunda fila corresponde al mismo texto unido de nuevo en palabras, que es como llega el texto real. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni son aplicables a un modelo discriminativo de este tipo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (el artefacto ONNX pesa 74 MB y el modelo tiene ~19M de parametros); no se publican medidas de consumo real.
- GPU: cualquier GPU con al menos 1-2 GB de memoria es suficiente; el modelo no aprovecha GPUs de gama alta como A100 o H100 por su tamano. El escenario natural es CPU.
- GPU de consumo: cabe holgadamente en cualquier RTX (por ejemplo, serie 40) e incluso en iGPU y en moviles mediante ONNX Runtime.
- Despliegue: ONNX Runtime (CPU o CUDA), HuggingFace Optimum con backend ONNX, y el pipeline `token-classification` de Transformers cargando el grafo ONNX. No se documenta soporte para vLLM, TGI o llama.cpp, que no estan orientados a token classification de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia de orden de magnitud, el coste por ventana de 256 tokens es el de un encoder de ~19M de parametros, pero el autor no publica medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dialogos IT (sin enmascarar / sobremascarado) | Texto juridico real (sin enmascarar / sobremascarado) | Licencia | Formato |
|---|---|---|---|---|---|---|
| **fcreait/smart-pii-redactor-it-onnx** | ~19M | 256 tokens por ventana | 1,5% / 0,3% | 0,97% (0,21%); 2,75% uniendo `##` | Apache-2.0 | ONNX fp32 |
| rizzo-pii-0.3B | ~0,3B (segun el nombre) | no disponible | 4,1% / 0,2% | 0,38% (0,05%); 2,87% uniendo `##` | no disponible en la informacion | no disponible |
| Mozilla/smart-pii-redactor-v1 | no disponible | no disponible | 2,8% / 1,2% | 72,3% (2,60%); 32,5% uniendo `##` | Apache-2.0 | no disponible |
| Mozilla/smart-pii-redactor-v1-onnx (base directo) | no disponible | no disponible | no evaluado en la model card | no evaluado en la model card | Apache-2.0 | ONNX |

Lectura de la comparativa: frente a `rizzo-pii-0.3B`, este modelo gana en dialogos (1,5% frente a 4,1% de entidades sin enmascarar) y empata en texto juridico cuando las piezas WordPiece se unen en palabras (2,75% frente a 2,87%), aunque pierde en el protocolo con tokens fragmentados (0,97% frente a 0,38%) y en `validation_clean` (1,05% frente a 0,00%). Frente al modelo base de Mozilla, la mejora en texto juridico real es de dos ordenes de magnitud en entidades sin enmascarar.

## Limitaciones y advertencias

- Cobertura limitada a italiano. No hay evidencia de funcionamiento en castellano, catalan, gallego ni en otros idiomas; usarlo fuera del italiano no esta respaldado por el autor.
- Ventana de 256 tokens. Los documentos largos requieren troceado con solapamiento; una implementacion ingenua sin stride pierde entidades en los bordes de cada ventana.
- Sesgo de los datos sinteticos: la mayor parte del entrenamiento son dialogos generados por un LLM y texto juridico sintetico. El comportamiento sobre jerga real, dialectos, ruido de ASR o dominios distintos (sanitario, financiero, industrial) no esta medido.
- Sensibilidad a la tokenizacion: en `validation_real`, el 64% de las filas contienen piezas `##`. El rendimiento cambia de forma notable segun se evalua con tokens fragmentados (0,97%) o con palabras unidas (2,75%), lo que obliga a definir con cuidado el postprocesado en produccion.
- Riesgo de sobremascarado: entre 0,10% y 0,3% de palabras no PII se enmascaran por error; en dominios con muchos nombres propios o toponimos que no son datos personales, la tasa puede degradar la utilidad del texto.
- Entidades sin enmascarar: ninguna tasa es cero. En `validation_clean` queda un 1,05% de entidades sin cubrir, por lo que no debe usarse como unico control en un flujo con obligaciones regulatorias; el propio autor anade una capa regex para emails, telefonos e identificadores.
- No es un modelo generativo: no razona, no responde preguntas y no puede sustituir a un LLM en tareas de comprension; solo etiqueta tokens.
- Licencia del modelo Apache-2.0, que permite uso comercial. Atencion a la procedencia de los datos: parte del corpus de entrenamiento deriva de Ai4Privacy bajo CC-BY-4.0 y de DeepMount00, por lo que la atribucion correspondiente debe conservarse al redistribuir derivados.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, publicado el 2026-10-27. No hay validacion independiente de los resultados mas alla de la model card del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fcreait/smart-pii-redactor-it-onnx
- Modelo base: https://huggingface.co/Mozilla/smart-pii-redactor-v1-onnx
- Modelo base sin ONNX: https://huggingface.co/Mozilla/smart-pii-redactor-v1
- Alternativa comparada: https://huggingface.co/rizzoaiacademy/rizzo-pii-0.3B
- Dataset juridico y administrativo: https://huggingface.co/datasets/rizzoaiacademy/rizzo-pii-it-dataset
- Dataset de origen (DeepMount00): https://huggingface.co/datasets/DeepMount00/pii-masking-ita
- Dataset de origen (Ai4Privacy): https://huggingface.co/datasets/ai4privacy/open-pii-masking-500k-ai4privacy
