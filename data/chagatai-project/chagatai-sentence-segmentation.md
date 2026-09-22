# chagatai-project/chagatai-sentence-segmentation

## Resumen

chagatai-sentence-segmentation es un modelo neuronal de deteccion de fronteras de frase (Sentence Boundary Detection, SBD) para chagatai (chg), lengua literaria turquica clasica escrita en alfabeto perso-arabe. Lo desarrolla el proyecto chagatai-project y se apoya en la arquitectura de tokenizacion y Character Language Model (CharLM) de Stanford Stanza, empaquetada en ficheros ONNX autocontenidos. Resuelve un problema concreto: los textos chagatais clasicos, como el Baburnama de Babur o la poesia de Navoi, se escribieron sin signos de puntuacion modernos, de modo que segmentar frases es el primer paso obligatorio para traduccion automatica, parsing, tokenizacion y analisis de corpus.

Tecnicamente no es un modelo generativo: es un clasificador de tokens a nivel de caracter que decide, para cada posicion, si existe una frontera de frase. La card describe un backbone BiLSTM jerarquico de 3 capas alimentado por dos CharLM LSTM de 512 dimensiones (forward y backward), con caracteristicas posicionales como `space_before` e `is_capitalized`, y variantes con ensamblado dentro del grafo. Se distribuye en cinco ficheros ONNX (de 13,5 MB a 82,8 MB) con cuantizacion dinamica INT8 opcional, y no requiere PyTorch ni Stanza en inferencia: solo `onnxruntime` y `numpy`.

Es relevante ahora porque cubre un nicho de muy bajos recursos con un coste de despliegue minimo y licencia MIT, y porque publica el conjunto de evaluacion y el vocabulario junto al modelo. El contrapeso es su madurez: el repositorio registra 0 descargas y 0 likes en la informacion disponible, y sus metricas estan declaradas por el autor sin verificacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stanza: CharLM (LSTM forward/backward de 512 dimensiones) + backbone BiLSTM jerarquico de 3 capas para clasificacion de tokens; ensamblado dentro del grafo ONNX |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (procesa la secuencia de caracteres del texto de entrada; la card no declara limite) |
| Tipos de cuantizacion | FP32 y INT8 (cuantizacion dinamica; reduccion de tamano de ~4x en Tri-Hybrid y ~3,2x en BiCharLM) |
| Idiomas soportados | chagatai (codigo `chg`) |
| Licencia | MIT |
| Formato de pesos | ONNX (ficheros FP32 e INT8) + `vocab.json` (vocabulario de caracteres) |
| Tarea | token-classification (Sentence Boundary Detection) |
| Tamano del repositorio | 0,2 GB |
| Tamano de los ficheros | Tri-Hybrid FP32 53,3 MB; Tri-Hybrid INT8 13,5 MB; BiCharLM FP32 82,8 MB; BiCharLM INT8 26,0 MB; Standalone FP32 29,2 MB; `vocab.json` 2,4 KB; `inference.py` 5,2 KB |
| Umbrales recomendados | tau = 0,42 (Tri-Hybrid), tau = 0,43 (BiCharLM), tau = 0,24 (Standalone) |
| Dependencias de inferencia | onnxruntime, numpy, huggingface_hub |
| Libreria declarada | stanza |
| Dataset de evaluacion | chagatai-project/chagatai-sbd (split test) |
| Fecha de creacion / actualizacion | 2026-09-22 / 2026-09-22 |

## Arquitectura y entrenamiento

Cada fichero ONNX compila el pipeline completo de tokenizacion y segmentacion de Stanza en un unico grafo computacional. El componente central son dos Character Language Models: LSTM forward y backward de 512 dimensiones, entrenados de forma no supervisada sobre texto chagatai historico, que capturan morfologia sub-palabra y sufijos turquicos arcaicos sin consultas a diccionario. Sobre esas representaciones se apoya un backbone BiLSTM bidireccional de 3 capas con embeddings de caracter y caracteristicas posicionales (la card menciona `space_before`, `is_capitalized` y al menos una mas, cuyo nombre queda truncado en la informacion disponible).

Las variantes Tri-Hybrid y BiCharLM incorporan ensamblado dentro del propio grafo ONNX, lo que explica su mayor tamano frente al modelo Standalone, que es un unico modelo sin ensamblar. La cuantizacion dinamica INT8 se aplica sobre los pesos, con perdidas de calidad marginales segun el autor (0,09 puntos de F1 en Tri-Hybrid y 0,01 en BiCharLM). La card no especifica el numero de tokens de entrenamiento, la composicion exacta del corpus ni si hubo etapas de RLHF o DPO; dado que es un modelo discriminativo de etiquetado, esas tecnicas no serian de aplicacion directa. La informacion disponible tampoco detalla el numero de parametros ni la configuracion de entrenamiento (optimizador, epocas, criterio de early stopping).

## Capacidades

- Deteccion de fronteras de frase a nivel de caracter en texto chagatai con escritura perso-arabe, sin signos de puntuacion modernos.
- Segmentacion de parrafos completos en frases (la evaluacion usa parrafos de 2 a 5 frases).
- Ejecucion sin PyTorch ni Stanza: los ficheros ONNX son autocontenidos y solo requieren `onnxruntime`.
- Inferencia con cuantizacion INT8 para despliegues de muy bajo peso (13,5 MB en la variante Tri-Hybrid).
- Ensamblado interno de modelos dentro del grafo, sin orquestacion externa.
- Umbral de decision ajustable (tau) por variante, lo que permite priorizar precision o recall.
- Vocabulario de caracteres abierto en `vocab.json`, lo que facilita inspeccionar la cobertura del script.
- Script de inferencia independiente (`inference.py`) con una clase `ChagataiSBD` y metodo `segment()`.

No se documentan en la informacion disponible capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni comportamiento agentico. Tampoco se declara soporte multilingue mas alla del chagatai.

## Casos de uso

- Preprocesado para traduccion automatica de chagatai clasico: el segmentador divide el texto en frases antes de alimentar un sistema de traduccion, paso imprescindible porque los originales carecen de puntuacion que delimite unidades traducibles.
- Analisis de corpus en humanidades digitales: permite calcular estadisticas por frase (longitud media, distribucion de estructuras) sobre obras completas como el Baburnama o el corpus navoi, algo inviable sin una segmentacion automatica previa.
- Alimentacion de tokenizadores y parsers: la propia card situa la SBD como primer paso para tokenizacion y parsing; la salida del modelo se usa como entrada de esos componentes en una cadena Stanza.
- Edicion digital de manuscritos: al segmentar automaticamente, un editor puede revisar y corregir fronteras en lugar de marcar cada una desde cero, reduciendo el trabajo de anotacion manual.
- Busqueda y recuperacion en archivos historicos: indexar por frases en lugar de por documentos completos mejora la precision de las busquedas en corpus chagatais digitalizados.
- Despliegue en entornos sin GPU: con ficheros de 13,5 MB en INT8 y dependencias limitadas a `onnxruntime` y `numpy`, cabe en servidores modestos, contenedores ligeros o incluso navegador mediante ONNX Runtime Web.
- Etiquetado asistido para linguistas: el modelo propone fronteras con una precision declarada del 79,95% en la variante Tri-Hybrid, lo que reduce el esfuerzo de correccion en proyectos de anotacion.
- Integracion en pipelines de investigacion reproducibles: al ser ONNX con vocabulario y script incluidos, el mismo binario se ejecuta en Python, C++, C# o Java sin dependencias de framework de deep learning.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test Chagatai Historical SBD (295 parrafos, 71.673 tokens de caracter, 868 fronteras de frase reales). Ninguna metrica esta verificada de forma independiente (`verified: false` en la model-index).

| Modelo | Formato | Tamano | F1 | Precision | Recall | Exact Match | Beneficio declarado |
|---|---|---|---|---|---|---|---|
| Tri-Hybrid [Stanza] | FP32 | 53,3 MB | 74,80 % | 79,95 % | 70,28 % | 27,46 % (81/295) | Mejor F1 y precision (menos falsos positivos) |
| Tri-Hybrid [Stanza] | INT8 | 13,5 MB | 74,71 % | 79,74 % | 70,28 % | 27,12 % (80/295) | ~4x comprimido, perdida de solo 0,09 % de F1 |
| BiCharLM [Stanza] | FP32 | 82,8 MB | 74,59 % | 79,17 % | 70,51 % | 27,80 % (82/295) | Mejor registro de Exact Match |
| BiCharLM [Stanza] | INT8 | 26,0 MB | 74,42 % | 78,94 % | 70,39 % | 27,80 % (82/295) | 3,2x comprimido, Exact Match preservado al 100 % |
| Standalone [Stanza] | FP32 | 29,2 MB | 71,94 % | 71,09 % | 72,81 % | 22,37 % (66/295) | Modelo unico mas rapido (sin ensamblado) |

Notas de interpretacion segun la card: Exact Match es el porcentaje de parrafos completos (de 2 a 5 frases) segmentados sin ningun error; la cuantizacion dinamica INT8 reduce el Tri-Hybrid un 74,7 % con perdida practicamente nula de exactitud. No se han publicado en la informacion disponible comparaciones con modelos externos ni resultados en otros conjuntos de evaluacion.

## Requisitos de hardware

- VRAM: no se declara, pero por tamano de fichero (13,5 MB a 82,8 MB) el modelo cabe holgadamente en cualquier GPU con unos pocos cientos de MB libres; la inferencia es viable directamente en CPU.
- Memoria RAM: por debajo de 1 GB en todos los casos, incluyendo runtime ONNX y vocabulario; el modelo mas pesado ocupa 82,8 MB en disco.
- GPU recomendadas: no se especifican. Cualquier GPU con soporte de ONNX Runtime (por ejemplo, series RTX 20/30/40, A100, H100) sirve; usar GPU solo aporta ventaja si se procesan grandes volumenes en lote.
- GPU de consumo: si, cabe en cualquier GPU de consumo y tambien en CPU sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java, JavaScript/Web). No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo y el formato distribuido es ONNX, no GGUF ni safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Aceleracion: por el perfil del modelo, la ejecucion en CPU con ONNX Runtime es la via natural; la aceleracion por GPU (CUDA/TensorRT) o NPU depende del runtime elegido, no del modelo.

## Comparativa con modelos similares

No se han identificado en la busqueda web modelos comparables externos de segmentacion de frases para chagatai; la informacion disponible solo permite comparar las variantes publicadas dentro del propio repositorio.

| Variante | Parametros | Contexto | F1 | Precision | Recall | Exact Match | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Tri-Hybrid FP32 | no disponible | no disponible | 74,80 % | 79,95 % | 70,28 % | 27,46 % | MIT | ONNX, 53,3 MB |
| Tri-Hybrid INT8 | no disponible | no disponible | 74,71 % | 79,74 % | 70,28 % | 27,12 % | MIT | ONNX, 13,5 MB |
| BiCharLM FP32 | no disponible | no disponible | 74,59 % | 79,17 % | 70,51 % | 27,80 % | MIT | ONNX, 82,8 MB |
| BiCharLM INT8 | no disponible | no disponible | 74,42 % | 78,94 % | 70,39 % | 27,80 % | MIT | ONNX, 26,0 MB |
| Standalone FP32 | no disponible | no disponible | 71,94 % | 71,09 % | 72,81 % | 22,37 % | MIT | ONNX, 29,2 MB |

Criterio de eleccion segun la card: Tri-Hybrid con tau = 0,42 si se prioriza F1 y precision; BiCharLM con tau = 0,43 si se prioriza que parrafos completos queden intactos (Exact Match); Standalone con tau = 0,24 si se prioriza velocidad y un solo modelo sin ensamblar.

## Limitaciones y advertencias

- Prestaciones moderadas: un F1 de 74,80 % implica que aproximadamente una de cada cuatro fronteras se clasifica de forma incorrecta; en produccion se recomienda una revision humana o un umbral conservador.
- Exact Match bajo: solo el 27,80 % de los parrafos de test se segmenta sin ningun error, de modo que la salida no es fiable a nivel de parrafo completo.
- Recall limitado: 70,28 % en la mejor variante significa que se pierden fronteras reales; el sesgo del modelo favorece la precision sobre la cobertura.
- Metricas no verificadas: las cinco entradas de la model-index estan marcadas como `verified: false`; son resultados autoinformados por el autor sin replicacion independiente conocida.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de los datos; no hay evidencia de uso en produccion ni de incidencias reportadas.
- Cobertura linguistica restringida: el modelo solo declara chagatai (`chg`); no hay garantia de transferencia a turco moderno, uzbeko, azeri ni a otras lenguas turquicas.
- Dependencia del script perso-arabe y del vocabulario de caracteres: caracteres fuera de `vocab.json` pueden degradar la segmentacion, y no se documenta el manejo de texto fuera de vocabulario.
- Sensibilidad al umbral: cada variante usa un tau distinto (0,42 / 0,43 / 0,24); usar el umbral equivocado altera el equilibrio precision-recall.
- Ausencia de documentacion de entrenamiento: no se declaran tokens de entrenamiento, composicion del corpus ni hiperparametros, lo que dificulta reproducir el modelo o auditar posibles sesgos del corpus historico.
- Limitaciones de contexto: la card no especifica longitud maxima de secuencia; en textos muy largos el comportamiento no esta documentado.
- Riesgo de sesgo historico: al entrenarse sobre literatura cortesana chagatai, la representacion puede estar sesgada hacia ese registro, con peor comportamiento en registros administrativos, religiosos o coloquiales.
- Licencia: MIT, permisiva y apta para uso comercial, con la obligacion habitual de conservar el aviso de copyright y la licencia. No se documentan restricciones adicionales.
- Ambito de aplicacion: es un componente de preprocesado, no un modelo de comprension ni de generacion; no debe evaluarse con los criterios de un LLM.
- Model card incompleta: la seccion de arquitectura aparece truncada en la informacion disponible (termina en `is_`), por lo que podria haber detalles tecnicos no recogidos aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chagatai-project/chagatai-sentence-segmentation
- Dataset de evaluacion: chagatai-project/chagatai-sbd (referenciado en la model card; split `test`)
- Paper: no disponible
- Repositorio de codigo: no disponible (el repositorio incluye `inference.py` y `vocab.json`, pero no se enlaza un repositorio externo)
- Demo: no disponible
- Blog o documentacion adicional: no disponible
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (corresponden a paginas de ayuda de YouTube y a un foro de preguntas), por lo que no se han incluido como enlaces relevantes.
