# NagaYu/sludge-small

## Resumen

Sludge-small es un modelo de clasificación de tokens (token-classification) de 12.011.719 parámetros desarrollado por el usuario NagaYu. Su función no es generar texto, sino leer un árbol de interfaz (accessibility tree, DOM con estilos computados o jerarquía AX) y devolver, para cada hallazgo, una terna formada por la disposición legal que podría verse implicada, el elemento concreto de esa disposición en cuestión y la evidencia en forma de identificador de elemento de la pantalla. Además, el modelo propone un cambio medible sobre la propia pantalla, por ejemplo indicar que un botón de rechazo debe renderizarse a 200×52 px con tipografía de 16 px para igualar al botón de aceptación.

El modelo aborda la detección de dark patterns o diseño engañoso en interfaces de usuario, un problema relevante para equipos de cumplimiento normativo y protección al consumidor. La tesis del proyecto es que operar sobre el árbol de UI en lugar de sobre una captura de pantalla aporta cadenas, geometría, colores, estado de selección por defecto, jerarquía y destinos de enlace exactos, algo que un pipeline de visión por computador debe reconstruir con errores. El propio autor mide esa diferencia: el mismo analizador de reglas obtiene un micro-F1 de 0,767 sobre el árbol exacto y de 0,228 sobre una captura renderizada.

El checkpoint sludge-small se publica como opción por defecto entre tres tamanos de la familia (tiny de 0,9 M, small de 12,0 M y base de 101,7 M), al considerarse el óptimo de relación precisión/coste y cumplir el requisito de milisegundos por pantalla. El modelo se distribuye bajo licencia Apache 2.0, solo soporta inglés y está pensado explícitamente como herramienta de revisión de interfaces, no como sistema para emitir dictámenes de legalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en detalle; modelo de clasificacion de tokens (token-classification) sobre arboles de UI |
| Parametros totales | 12.011.719 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se detallan niveles; se publican exportaciones CoreML, ONNX y GGUF |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (libreria declarada), CoreML, ONNX y GGUF |
| Pipeline | token-classification |
| Dataset de entrenamiento/evaluacion | NagaYu/sludge-ui-counterfactuals |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su caracter de modelo de clasificacion de tokens con salida estructurada (terna de provision, elemento de la provision y evidencia, mas una sugerencia de cambio medida contra la pantalla). No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni la longitud de contexto. El modelo se entrena sobre el corpus sintetico NagaYu/sludge-ui-counterfactuals, construido a partir de pares contrafactuales: una pantalla justa y la misma pantalla con un unico cambio introducido. Segun la model card, sobre layouts no vistos, 24 de 27 clases cruzan su propio umbral de decision ante esa edicion unica, lo que indica que el modelo responde al cambio concreto y no a la plantilla.

El checkpoint publicado sludge-small se entreno durante 8 epocas, la misma cifra que sludge-tiny, mientras que sludge-base se entreno solo 4 epocas en una maquina con recursos disputados y por eso rinde peor (micro-F1 0,892 frente a 0,917) sin que ello implique un escalado negativo. La particion del corpus es por plantilla de UI y nunca por muestra, de modo que ningun layout se comparte entre entrenamiento y evaluacion. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; el modelo no es generativo en el sentido habitual.

La model card incluye una comparacion entre ejecutar el mismo analizador de reglas sobre el arbol exacto (micro-F1 0,767, 1,36 ms/pantalla) y sobre una captura renderizada con deteccion de elementos OpenCV, recuperacion de color y estado de checkbox desde pixeles y OCR (micro-F1 0,228, 21,14 ms/pantalla). La diferencia de 0,539 micro-F1 se desglosa en 0,233 atribuible solo al error de recuperacion de texto y el resto a jerarquia perdida, roles adivinados y destinos de enlace que los pixeles no contienen.

## Capacidades

- Clasificacion de tokens sobre arboles de UI: accessibility tree, DOM con estilo computado o jerarquia AX.
- Deteccion de dark patterns y diseno enganoso, con 27 clases descritas en el corpus de evaluacion.
- Localizacion de elementos: devuelve el identificador del elemento que sirve de base factual al hallazgo (hit rate declarado de 1,000 sobre pares correctamente clasificados).
- Mapeo a disposiciones legales que podrian verse implicadas, con la parte concreta de la disposicion en cuestion (por ejemplo, Directiva 2011/83/EU Art. 22 y la condicion `express_consent_not_default_option`).
- Sugerencia de remediacion medible contra la propia pantalla, con valores de geometria y tipografia (por ejemplo, 200×52 px con 16 px de tipografia frente al estado actual 95×29 px con 9 px).
- Operacion en distintos puntos de funcionamiento calibrados: perfiles de triaje (10 % de FPR objetivo), revision (5 %) y auditoria (1 %), con 1356 puntuaciones distintas disponibles, frente a las 7 del motor de reglas y las 8 del pipeline de captura.
- Exportacion a multiples runtimes (CoreML, ONNX, GGUF) para despliegue en dispositivo.
- No dispone de soporte de tool calling, function calling, agentes, vision directa sobre pixeles, audio ni modo de razonamiento extendido, segun la informacion disponible.

## Casos de uso

- Revision de pantallas de consentimiento de cookies: el modelo recibe el arbol de accesibilidad y devuelve la terna con la disposicion potencialmente implicada, el elemento concreto y la evidencia, mas la correccion de geometria y tipografia necesaria para igualar las opciones de aceptar y rechazar.
- Verificacion automatizada en integracion continua: al tardar 6,44-6,77 ms por pantalla, puede ejecutarse sobre cada layout del arbol de UI en cada pull request y bloquear cambios que introduzcan un patron detectado, con 1356 puntuaciones distintas para fijar umbrales finos.
- Triaje de alto recall para equipos de cumplimiento: con un perfil de triaje a 10 % de FPR el modelo alcanza 0,987 de recall, de modo que un revisor humano solo examina las pantallas marcadas y no la totalidad del catalogo.
- Auditoria con umbral estricto: el perfil de auditoria a 1 % de FPR mantiene 0,967 de recall, lo que permite generar informes internos defendibles sin inundar al equipo legal de falsos positivos.
- Monitorizacion continua de experimentos A/B y redisenos: como el corpus se basa en pares contrafactuales y el modelo reacciona a una edicion unica en 24 de 27 clases, puede vigilar cambios de layout o de posicion de botones a lo largo del tiempo.
- Analisis de flujos de cancelacion y suscripcion en aplicaciones moviles: el modelo trabaja sobre jerarquia AX y se exporta a CoreML, por lo que puede embeberse en la propia aplicacion o en una herramienta de inspeccion sin enviar datos a un servidor.
- Asistencia a equipos de diseno: la salida de remediacion es una instruccion concreta y medible (dimensiones en pixeles, tamano de tipografia), lo que permite iterar el diseno antes de la revision legal.
- Investigacion sobre patrones enganosos: el modelo y su corpus sirven como linea base reproducible frente a la cual comparar aproximaciones basadas en capturas de pantalla, que en la misma prueba rinden 0,228 de micro-F1.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index sobre el split `test` del dataset NagaYu/sludge-ui-counterfactuals (corpus sintetico de contrafactuales). Ninguno esta verificado por un tercero.

| Metrica | Valor |
|---|---|
| micro-F1 (screen x class) | 0,9172 |
| macro-F1 | 0,8937 |
| accuracy (element localisation hit rate) | 1,0000 |

Comparacion de sistemas declarada por el autor:

| Sistema | micro-F1 (test) | macro-F1 | Localizacion | ms/pantalla | micro-F1 (hard) |
|---|---|---|---|---|---|
| Reglas sobre el arbol exacto | 0,767 | No disponible | No disponible | 1,36 | 0,847 |
| Captura + vision por computador y OCR (mismo analizador) | 0,228 | No disponible | No disponible | 21,14 | 0,326 |
| Sludge | 0,917 (0,908-0,926) | 0,894 | 1,000 | 6,77 | 0,849 |

Aviso del autor: las dos columnas de F1 no son comparables entre si, porque las pantallas de `hard` contienen mas patrones cada una y el micro-F1 sube con la tasa de positivos; la comparacion debe hacerse dentro de una misma columna.

Comparacion por tamano de checkpoint (declarada por el autor):

| Checkpoint | Parametros | Epocas | micro-F1 | Localizacion | ms/pantalla |
|---|---|---|---|---|---|
| sludge-tiny | 0,9 M | 8 | 0,863 | 1,000 | 1,48 ms |
| sludge-small | 12,0 M | 8 | 0,917 | 1,000 | 6,44 ms |
| sludge-base | 101,7 M | 4 | 0,892 | 1,000 | 33,55 ms |

Puntos de funcionamiento declarados (recall por objetivo de FPR):

| Perfil | FPR objetivo | Reglas | Captura | Sludge |
|---|---|---|---|---|
| Triaje | 10 % | 0,928 | 0,394 | 0,987 |
| Revision | 5 % | 0,928 | 0,394 | 0,981 |
| Auditoria | 1 % | 0,928 | 0,076 | 0,967 |

## Requisitos de hardware

- Inferencia en CPU: con 12,0 M de parametros, el modelo ocupa aproximadamente 48 MB en FP32 y 24 MB en FP16, por lo que cabe holgadamente en memoria de sistema y no requiere acelerador para funcionar.
- GPU: no se especifican GPU recomendadas en la informacion disponible; dado el tamano, cualquier GPU consumer (incluidas gamas de entrada) o incluso CPU es suficiente. No hay datos publicados de rendimiento con A100, H100 o RTX 4090.
- GPU consumer: si, cabe en cualquier GPU consumer e integrada; el cuello de botella no es memoria sino el coste por pantalla, declarado en 6,44-6,77 ms por pantalla en el checkpoint small y 1,48 ms en el tiny.
- Despliegue: la libreria declarada es PyTorch, y el repositorio incluye exportaciones a CoreML, ONNX y GGUF. Esto permite servir el modelo con PyTorch o con ONNX Runtime y desplegarlo en dispositivo en plataformas Apple mediante CoreML. No se mencionan vLLM, TGI, Ollama ni llama.cpp en la informacion disponible, y al no ser un modelo generativo no aplican los pipelines habituales de generacion de texto.
- Latencia y throughput: los unicos datos publicados son milisegundos por pantalla (6,44 ms para sludge-small en la tabla tamano/precision/coste y 6,77 ms en la tabla comparativa de sistemas). No hay mediciones de throughput agregado ni de latencia en GPU.
- Tamano del repositorio: 0,1 GB, coherente con un checkpoint de 12 M de parametros mas las exportaciones.

## Comparativa con modelos similares

No se dispone de modelos externos comparables en la informacion proporcionada. La comparacion factible es dentro de la propia familia Sludge y contra los enfoques alternativos evaluados por el autor:

| Alternativa | Parametros | micro-F1 (test) | localizacion | ms/pantalla | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sludge-small | 12,0 M | 0,917 | 1,000 | 6,44 | Apache 2.0 | Publicado (checkpoint por defecto) |
| sludge-tiny | 0,9 M | 0,863 | 1,000 | 1,48 | No disponible en la informacion | Publicado en el mismo repositorio |
| sludge-base | 101,7 M | 0,892 | 1,000 | 33,55 | No disponible en la informacion | No publicado; los pesos no se distribuyen |
| Motor de reglas sobre arbol exacto | No aplica | 0,767 | No disponible | 1,36 | No aplica | No aplica |
| Captura + vision por computador y OCR | No aplica | 0,228 | No disponible | 21,14 | No aplica | No aplica |

## Limitaciones y advertencias

- El propio autor advierte que el modelo no determina la legalidad: solo informa de disposiciones que podrian verse implicadas y de los elementos de pantalla que constituyen la base factual. La evaluacion final corresponde a una persona cualificada.
- El modelo no dispone de ninguna funcion que etiquete el producto de una empresa concreta como ilegal, ni esta disenado para adquirirla.
- Solo soporta ingles (en), segun los metadatos del repositorio.
- Los resultados de benchmark estan declarados por el autor y marcados como no verificados en el model-index; no hay validacion independiente.
- La evaluacion se realiza sobre un corpus sintetico de pares contrafactuales (NagaYu/sludge-ui-counterfactuals). El rendimiento sobre interfaces reales de produccion no esta documentado en la informacion disponible.
- Las dos columnas de F1 (test y hard) no son comparables entre si por diferencias en la tasa de positivos; el autor lo advierte explicitamente.
- El checkpoint sludge-base no se publica porque esta subentrenado (4 epocas frente a 8 en una maquina con recursos disputados) y resulta dominado por sludge-small en todas las metricas; su fila en la tabla es una medicion real reproducible con `python scripts/train.py --preset base --epochs 8`.
- No se especifica la longitud de contexto ni la arquitectura interna detallada, lo que dificulta estimar el comportamiento con arboles de UI muy grandes.
- El model card proporcionado esta truncado en la seccion de runtimes exportados, por lo que no se dispone del detalle completo de las mediciones por formato (CoreML, ONNX, GGUF).
- No hay informacion publicada sobre sesgos del modelo, comportamiento ante idiomas distintos del ingles ni analisis de falsos negativos por clase.
- El modelo no admite tool calling, agentes ni entrada de imagen directa; la afirmacion del proyecto es precisamente que la entrada debe ser el arbol, no la captura.
- Licencia Apache 2.0: permite uso comercial, pero la advertencia de "not-legal-advice" incluida en las etiquetas del repositorio debe tenerse en cuenta en cualquier integracion en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NagaYu/sludge-small
- Dataset: https://huggingface.co/datasets/NagaYu/sludge-ui-counterfactuals
- Demo: https://huggingface.co/spaces/NagaYu/sludge
- Model card del autor: incluida en el repositorio de HuggingFace del modelo
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo, su dataset o su demo; los enlaces anteriores son los unicos disponibles en la informacion proporcionada.
