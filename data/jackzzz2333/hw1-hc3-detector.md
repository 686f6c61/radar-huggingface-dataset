# JackZzZ2333/hw1-hc3-detector

## Resumen

hw1-hc3-detector es un clasificador de texto binario publicado por el usuario JackZzZ2333 (la model card atribuye el desarrollo a Minyuan Zhu) cuyo objetivo es distinguir texto generado por humanos de texto generado por asistentes tipo ChatGPT en ingles. Se trata de un modelo de tipo encoder BERT (segun el tag `bert` del repositorio) con 22.713.986 parametros (~0,1 GB de pesos en safetensors), entrenado mediante fine-tuning sobre el dataset Hello-SimpleAI/HC3, que contiene pares de respuestas humanas y generadas por IA a preguntas reales.

El interes del modelo es acotado pero claro: la model card reporta una precision de test de 0,9946 frente a una linea base de regresion logistica de 0,8449, lo que lo convierte en un ejemplo bastante limpio de como el fine-tuning de un encoder pequeno supera a un clasificador clasico en una tarea de deteccion de texto sintetico. El entrenamiento se hizo con learning rate 2e-5 durante 5 epocas sobre una RTX 5090.

Se trata de un experimento academico (el nombre del repositorio, `hw1`, sugiere una entrega de tarea) con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin documentacion sobre sesgos, composicion exacta del dataset o limites de contexto. Cualquier uso en produccion deberia tratarlo como un prototipo no auditado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) para clasificacion de texto; confirmado solo por el tag `bert` del repositorio |
| Parametros totales | 22.713.986 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no hay variantes GGUF, AWQ, GPTQ ni ONNX documentadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Dataset de entrenamiento | Hello-SimpleAI/HC3 |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-09-21 |
| Ultima actualizacion | 2026-09-21 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la configuracion interna del encoder: no se especifican numero de capas, dimension oculta, numero de cabezas de atencion ni vocabulario. Lo unico confirmado es el tag `bert`, el pipeline de clasificacion de texto y el recuento real de parametros de safetensors (22.713.986). No hay datos sobre si se partio de un checkpoint preentrenado concreto ni sobre la estrategia de tokenizacion. Tampoco se documenta el numero total de tokens de entrenamiento ni la composicion exacta del corpus.

El entrenamiento consistio en fine-tuning supervisado sobre el dataset Hello-SimpleAI/HC3, con learning rate 2e-5 y 5 epocas, ejecutado sobre una GPU RTX 5090. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo esperable en un clasificador. La model card reporta dos resultados: una linea base de regresion logistica con precision de 0,8449 y el modelo afinado con precision de test de 0,9946. No se publican curvas de validacion, matriz de confusion, F1, precision/recall por clase ni el tamano de los splits de entrenamiento, validacion y test, por lo que no es posible evaluar el riesgo de sobreajuste o de fuga de datos entre splits.

## Capacidades

- Clasificacion binaria de texto en ingles: distingue entre texto escrito por humanos y texto generado por IA en el dominio de HC3 (respuestas a preguntas), segun lo declarado en la model card.
- Inferencia como pipeline `text-classification` de la libreria transformers.
- Compatibilidad declarada con text-embeddings-inference y con endpoints compatibles (tags `text-embeddings-inference` y `endpoints_compatible`).
- Generacion de texto: no. Es un modelo exclusivamente discriminativo.
- Tool calling / function calling: no soportado.
- Capacidades de agente o razonamiento multi-paso: no soportadas.
- Multilinguismo: no. Solo ingles.
- Vision, audio, thinking mode: no disponibles.

## Casos de uso

- Triaje de integridad academica: el modelo puede puntuar respuestas o ensayos en ingles para senalar posibles casos de generacion automatica antes de una revision humana, dado su rendimiento reportado de 0,9946 en el dominio de preguntas y respuestas de HC3.
- Curación de datasets de entrenamiento: filtrar corpus web o conversacionales en ingles para separar contenido humano de contenido sintetico antes de usarlos en el preentrenamiento o fine-tuning de otros modelos.
- Moderacion de contenido en foros y plataformas en ingles: clasificar aportaciones de usuarios y marcar aquellas con alta probabilidad de ser generadas automaticamente, como senal auxiliar y no como decision automatica.
- Verificacion editorial en medios: como primer filtro para detectar articulos o comentarios generados por IA en ingles antes de la revision por parte de un editor.
- Analisis de autenticidad en resenas de producto: detectar resenas en ingles potencialmente generadas en masa, integr_andolo en un pipeline de scoring previo a la revision manual.
- Investigacion sobre deteccion de texto sintetico: servir como linea base reproducible de BERT pequeno sobre HC3 para comparar con detectores mayores (por ejemplo, variantes basadas en RoBERTa) en experimentos academicos.
- Despliegue ligero como microservicio: por su tamano (22,7 M de parametros, ~0,1 GB) puede exponerse como endpoint HTTP de clasificacion en CPU o en una GPU de gama baja con latencia muy reducida, integr_andolo en colas de premoderacion en tiempo casi real.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son la precision de la linea base y la del modelo afinado sobre el conjunto de test de HC3:

| Modelo | Metrica | Valor |
|---|---|---|
| Regresion logistica (linea base) | Precision (accuracy) | 0,8449 |
| hw1-hc3-detector (fine-tuning) | Precision (accuracy) de test | 0,9946 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible, ni tampoco F1, precision/recall por clase o matriz de confusion. No se dispone de comparaciones con otros detectores sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision habitual; los pesos ocupan aproximadamente 0,1 GB en el repositorio, por lo que el modelo cabe holgadamente en memoria.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100, H100). No se requiere hardware de datacenter.
- Inferencia en CPU: viable sin problemas por el reducido numero de parametros (22,7 M); es una de las opciones mas realistas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: pipeline de transformers (`text-classification`), servidor text-embeddings-inference, HF Inference Endpoints (el repositorio esta marcado como `endpoints_compatible`). No se documentan pesos en formato GGUF, por lo que su uso en llama.cpp u Ollama no esta soportado por los artefactos publicados.
- Latencia y throughput: no disponibles. No se han publicado mediciones. Como referencia no medida, un encoder de este tamano suele resolver una clasificacion corta en el orden de milisegundos en GPU y de decenas de milisegundos en CPU, pero se trata de una estimacion orientativa, no de un dato del repositorio.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de modelos alternativos sobre el mismo split, por lo que la comparacion se limita a caracteristicas estructurales conocidas y muchas celdas quedan como no disponibles.

| Modelo | Parametros | Contexto | Tarea | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| hw1-hc3-detector | 22.713.986 | No disponible | Deteccion humano/IA en ingles | No disponible | Accuracy 0,9946 en test de HC3 (segun model card) |
| Hello-SimpleAI/chatgpt-detector-roberta | No disponible en la informacion | No disponible | Deteccion humano/ChatGPT | No disponible | No disponible |
| RoBERTa-base (fine-tuning propio) | No disponible en la informacion | No disponible | Clasificacion de texto en ingles | No disponible | No disponible |
| DistilBERT (fine-tuning propio) | No disponible en la informacion | No disponible | Clasificacion de texto en ingles | No disponible | No disponible |

## Limitaciones y advertencias

- Dominio muy restringido: el entrenamiento se realizo sobre Hello-SimpleAI/HC3, un corpus de pares pregunta-respuesta. El rendimiento fuera de ese dominio (articulos, codigo, resenas, correos) no esta medido y probablemente sea inferior.
- Idioma unico: solo ingles. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Riesgo alto de falsos positivos en textos formales, muy pulidos o escritos por hablantes no nativos, un sesgo documentado en la literatura sobre detectores de texto sintetico y no evaluado en este modelo.
- Vulnerabilidad al parafraseo: los clasificadores de este tipo suelen perder eficacia ante texto generado por IA y posteriormente reescrito o editado; no hay evaluacion de robustez en la informacion disponible.
- Sin licencia declarada: no se especifican terminos de uso, por lo que el uso comercial es juridicamente incierto. Debe tratarse como no autorizado hasta que el autor aclare la licencia.
- Sin informacion sobre sesgos: no hay model card detallada, ni analisis demografico, ni evaluacion de equidad.
- Sin validacion independiente: 0 descargas y 0 likes en el momento de la consulta, sin resultados de terceros que reproduzcan la precision reportada.
- Riesgo de sobreajuste o fuga de datos: la precision de 0,9946 es muy alta y no se documentan los splits ni la deduplicacion del corpus, por lo que no puede descartarse que parte del rendimiento provenga de solapamiento entre entrenamiento y test.
- Uso responsable: no debe emplearse como evidencia concluyente de generacion automatica en contextos disciplinarios, legales o laborales. Es una senal auxiliar que requiere revision humana.
- Fechas del repositorio: las marcas temporales de creacion y actualizacion (2026-09-21) son posteriores a la fecha habitual de consulta y no se corresponden con ningun lanzamiento documentado; conviene verificar la vigencia del repositorio antes de depender de el.
- Sin artefactos de despliegue alternativos: no hay versiones ONNX, GGUF ni cuantizadas, lo que limita su integracion en stacks que no sean transformers o text-embeddings-inference.

## Enlaces

- HuggingFace: https://huggingface.co/JackZzZ2333/hw1-hc3-detector
- Dataset de entrenamiento: Hello-SimpleAI/HC3 (referenciado en los tags y en la model card; no se proporciona URL en la informacion disponible)
- Resultados de busqueda web: las consultas realizadas han devuelto unicamente paginas de una empresa francesa de conservacion de patrimonio (ecp-fr.com y directorios de oficios del patrimonio), sin ninguna relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales.
