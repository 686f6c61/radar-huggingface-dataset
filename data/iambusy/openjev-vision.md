# IamBusy/OpenJev-Vision

## Resumen

OpenJev Vision v0.1 es un paquete de pesos de investigación experimental publicado por el usuario IamBusy dentro de la pista de investigación visual del proyecto OpenJev. No es un modelo de lenguaje ni un VLM de propósito general: se trata de siete checkpoints de clasificación de imágenes entrenados con semilla fija 17 (tres CNN sobre escenas sintéticas con fusión exacta, una cabeza de razas de mascotas y tres cabezas CLEVR-4 de color y forma), cuyo objetivo declarado es estudiar la calibración de incertidumbre y la composición exacta de probabilidades sobre una ontología fija.

El problema que aborda es acotado: dada una imagen (escena sintética de 64x192 con tres slots y un prior de 64 mundos, o una imagen de mascota o de CLEVR-4) y una consulta formulada sobre una taxonomía declarada, el sistema devuelve probabilidades compuestas calculadas mediante aritmética exacta de probabilidades. Las CNN sintéticas se distribuyen completas; las cabezas de imagen pública solo contienen los pesos entrenados y la normalización de características, y requieren el backbone congelado facebook/dinov2-small en la revisión ed25f3a31f01632728cabb09d1542f84ab7b0056, que se descarga por separado.

Su relevancia actual es fundamentalmente metodológica: el autor publica explícitamente resultados negativos (la cabeza conjunta obtiene un 0 % en la evaluación retenida de CLEVR-4 y la cabeza de binding de bajo rango no supera a la línea base independiente) junto con las tres semillas de entrenamiento, el manifiesto de hashes SHA256 y las métricas de desarrollo. El repositorio tiene 0 descargas y 0 likes, un tamaño de 0.0 GB y licencia "other" con nombre source-specific-research-licenses, por lo que debe considerarse material de investigación sin validación de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN pequenas completas (checkpoints sinteticos) y cabezas entrenadas (lineal, conjunta, independiente y binding de bajo rango) sobre caracteristicas congeladas de facebook/dinov2-small (checkpoints de imagen publica) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes; las consultas se resuelven sobre una ontologia fija, no sobre texto libre) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interaccion no es en lenguaje natural libre, sino mediante consultas sobre una taxonomia declarada) |
| Licencia | other, con nombre source-specific-research-licenses; por componentes: CNN sinteticas bajo Apache-2.0, cabezas Pets bajo CC BY-SA 4.0 y cabezas CLEVR-4 bajo CC BY 4.0 |
| Formato de pesos | no disponible como formato estandar (no son checkpoints AutoModel de Transformers; se cargan con la libreria openjev y los hashes SHA256 se registran en FILE_MANIFEST.json) |
| Tarea declarada (pipeline) | image-classification |
| Libreria | openjev (extra de vision) |
| Tamano del repositorio | 0.0 GB |
| Entrada sintetica | imagenes de 64x192 de tres slots con un prior de 64 mundos |
| Backbone requerido | facebook/dinov2-small, revision ed25f3a31f01632728cabb09d1542f84ab7b0056 (congelado, se descarga aparte, con su procesador de imagen exacto) |
| Dataset de entrenamiento | IamBusy/OpenJev-Vision-Research-v0.1 (escenas sinteticas originales y subconjuntos de imagenes publicas con atribucion) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-19 |
| Fecha de actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

El paquete agrupa siete checkpoints de semilla fija 17. Tres son CNN completas de escena sintetica: una variante conjunta, una independiente y una de evidencia visual aprendida con fusion finita exacta. Otra es una cabeza de razas sobre Oxford-IIIT Pet y las tres restantes son cabezas CLEVR-4 de color y forma (conjunta, independiente y binding de bajo rango). Cada checkpoint se selecciono por NLL de desarrollo y se calibro sobre una particion de calibracion disjunta; las tres semillas de entrenamiento se reportan en el repositorio de codigo. Las CNN sinteticas usan datos renderizados originales bajo Apache-2.0 y objetivos derivados de un modelo de observacion exacto. Las cabezas de imagen publica se entrenan sobre subconjuntos redimensionados de Oxford-IIIT Pet (CC BY-SA 4.0) y CLEVR-4 (CC BY 4.0), y solo incluyen los pesos entrenados mas la normalizacion de caracteristicas ajustada en entrenamiento.

La innovacion tecnica declarada no esta en la arquitectura de red, sino en el tratamiento de la incertidumbre y la composicion de consultas: la composicion de consultas es aritmetica exacta de probabilidades sobre una ontologia fija, y el modelo sintetico conjunto aprende a mejorar las probabilidades compuestas frente a sus propias marginales factorizadas en distribucion. La variante de evidencia aprendida con fusion exacta se describe como mucho mas fuerte dentro del simulador conocido, aunque cuenta con supervision privilegiada de la categoria de observacion durante el entrenamiento. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Clasificacion de imagenes sinteticas de escena (64x192, tres slots) con salida probabilistica calibrada.
- Composicion exacta de consultas probabilisticas sobre una ontologia fija, en lugar de generacion de texto.
- Razonamiento sobre incertidumbre: los checkpoints se seleccionan y calibran con NLL de desarrollo sobre una particion disjunta.
- Clasificacion de razas de mascotas (taxonomia Oxford-IIIT Pet) mediante cabeza sobre caracteristicas congeladas.
- Clasificacion de color y forma en CLEVR-4 (taxonomia declarada), incluidas variantes conjunta, independiente y de binding de bajo rango.
- Reproducibilidad: semilla fija 17, tres semillas de entrenamiento reportadas y hashes SHA256 en FILE_MANIFEST.json.
- Soporte de tool calling o function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: no incluye modo de pensamiento, vision general, audio ni generacion de texto.

## Casos de uso

- Investigacion en calibracion de incertidumbre: el paquete permite comparar la NLL de desarrollo y la calibracion de las cabezas conjunta, independiente y de evidencia aprendida sobre las mismas particiones, algo poco habitual en pesos publicados.
- Estudio de composicion probabilistica exacta: dado que las consultas se resuelven con aritmetica exacta sobre una ontologia fija, sirve como referencia para medir si un estimador neuronal mejora o degrada las marginales factorizadas.
- Reproduccion de resultados negativos: los checkpoints permiten replicar el 0 % de la cabeza conjunta en CLEVR-4 y el hecho de que el binding de bajo rango (56.25 %) no supera a la linea base independiente (63.75 %).
- Ablaciones controladas por semilla: con la semilla 17 fija y el manifiesto de hashes, un laboratorio puede reproducir exactamente el mismo punto de partida y variar solo un factor.
- Docencia y divulgacion sobre incertidumbre en vision: las CNN sinteticas completas y su simulador conocido permiten ilustrar fusion probabilistica y degradacion fuera de distribucion sin depender de modelos opacos.
- Clasificacion de razas en un subconjunto balanceado de imagenes: la cabeza Pets alcanza un 93.24 % de exactitud en 740 imagenes, util como componente interno de un experimento siempre que no se use para reetiquetar los datos de origen.
- Evaluacion de sensibilidad a topologias de dependencia: el checkpoint conjunto permite medir cuanto se degrada la prediccion posterior en topologias de dependencia no vistas durante el entrenamiento.
- Pruebas de integracion de la libreria openjev: el flujo download_models devuelve directorios consumibles por SceneModel o PublicVisionModel, lo que sirve para validar infraestructura de carga y verificacion de hashes.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Checkpoint | Conjunto de evaluacion | Metrica | Resultado |
|---|---|---|---|
| Cabeza de razas Pets, semilla 17, caracteristicas congeladas | Subconjunto balanceado de 740 imagenes de Oxford-IIIT Pet | Exactitud | 93.24 % |
| Cabeza CLEVR-4 conjunta, semilla 17 | 80 imagenes retenidas de composicion color/forma | Exactitud | 0 % |
| Cabeza CLEVR-4 independiente, semilla 17 | 80 imagenes retenidas de composicion color/forma | Exactitud | 63.75 % |
| Cabeza CLEVR-4 con binding de bajo rango, semilla 17 | 80 imagenes retenidas de composicion color/forma | Exactitud | 56.25 % |

Notas del autor sobre estos numeros: el 93.24 % de Pets no corresponde al benchmark oficial del conjunto completo, y el propio autor senala que la cabeza conjunta CLEVR-4 no mejora a la independiente. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de lenguaje en la informacion disponible, lo cual es coherente con la naturaleza del modelo. La model card indica ademas que el modelo conjunto sintetico mejora las probabilidades compuestas frente a sus marginales factorizadas en distribucion, pero su prediccion posterior se degrada de forma sustancial en topologias de dependencia no vistas; no se aportan cifras concretas de esa degradacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Por el tipo de carga, las CNN sinteticas procesan entradas de 64x192 y el repositorio ocupa 0.0 GB, por lo que cabe esperar inferencia en CPU o en GPUs de gama baja; se trata de una estimacion por tamano, no de un dato publicado.
- Los checkpoints de imagen publica requieren ademas descargar el backbone congelado facebook/dinov2-small, cuyos requisitos de memoria no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponibles. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano declarado, aunque no hay confirmacion en la model card.
- Opciones de despliegue: la via documentada es la libreria openjev con su extra de vision (download_models) y las clases SceneModel y PublicVisionModel. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no serian aplicables al no ser un checkpoint de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa interna entre los propios checkpoints liberados, que es la unica que puede construirse con la informacion disponible:

| Checkpoint | Base | Supervision | Resultado declarado |
|---|---|---|---|
| CNN sintetica conjunta | CNN completa, entrenada desde cero | Objetivos del modelo de observacion exacto | Mejora las marginales factorizadas en distribucion; degradacion sustancial en topologias no vistas |
| CNN sintetica de evidencia aprendida con fusion exacta | CNN completa, entrenada desde cero | Supervision privilegiada de categoria de observacion | Mucho mas fuerte en el simulador conocido |
| Cabezas CLEVR-4 conjunta / independiente / binding | Caracteristicas congeladas de DINOv2-small | Subconjunto CLEVR-4 (CC BY 4.0) | 0 % / 63.75 % / 56.25 % en 80 imagenes retenidas |
| Cabeza de razas Pets | Caracteristicas congeladas de DINOv2-small | Subconjunto Oxford-IIIT Pet (CC BY-SA 4.0) | 93.24 % en 740 imagenes balanceadas |

Comparativa con alternativas externas de la misma categoria (clasificadores con estimacion de incertidumbre, cabezas de atributos o modelos probabilisticos de escena): no disponible. La busqueda web realizada no devolvio ninguna referencia tecnica relevante, solo resultados genéricos de Wikipedia.

## Limitaciones y advertencias

- No es un modelo de proposito general ni un VLM: la model card indica explicitamente que no se ha establecido comprension de lenguaje libre, grounding general de escenas ni calibracion de incertidumbre en el mundo real arbitrario.
- Resultados negativos incluidos en la propia publicacion: la cabeza conjunta CLEVR-4 obtiene 0 % en composicion color/forma retenida y la cabeza de binding de bajo rango no supera a la linea base independiente.
- Degradacion fuera de distribucion: el modelo conjunto sintetico empeora sustancialmente en topologias de dependencia no vistas.
- Supervision privilegiada: la variante de evidencia aprendida con fusion exacta dispone de supervision de categoria de observacion durante el entrenamiento, por lo que su ventaja no es directamente trasladable a un escenario sin esa informacion.
- Alcance de entrada muy restringido: las escenas sinteticas son de 64x192 con tres slots y un prior de 64 mundos; las cabezas Pets y CLEVR-4 operan solo sobre sus taxonomias declaradas.
- Sesgos: no se documentan analisis de sesgo. Existe riesgo de sesgo heredado de Oxford-IIIT Pet y CLEVR-4, y el solapamiento del preentrenamiento de DINOv2 con los conjuntos publicos no puede excluirse.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la aritmetica exacta de probabilidades puede producir estimaciones mal calibradas fuera del simulador conocido, con apariencia de precision.
- Restricciones de licencia: licencia "other" con nombre source-specific-research-licenses; el uso comercial queda sujeto a LICENSES.md. Las CNN sinteticas son Apache-2.0, las cabezas Pets CC BY-SA 4.0 (con obligaciones de compartir igual) y las cabezas CLEVR-4 CC BY 4.0. Se prohibe usar el paquete para reetiquetar los datos de origen. La licencia propia de DINOv2 se aplica a su backbone, descargado por separado.
- Falta de validacion externa: 0 descargas y 0 likes, sin benchmarks de terceros ni revision por pares.
- Caveat de integracion: los checkpoints de imagen publica no incluyen imagenes de origen ni pesos de terceros, y no son checkpoints AutoModel de Transformers, por lo que la carga depende de la libreria openjev y de la revision exacta del backbone.
- Fechas de publicacion inusualmente futuras (2026-09-19) en los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IamBusy/OpenJev-Vision
- Dataset de investigacion: https://huggingface.co/datasets/IamBusy/OpenJev-Vision-Research-v0.1
- Repositorio de codigo de OpenJev: https://github.com/IamBusy/OpenJev
- Fichero de licencias: https://huggingface.co/IamBusy/OpenJev-Vision-v0.1/blob/main/LICENSES.md
- Backbone requerido: facebook/dinov2-small, revision ed25f3a31f01632728cabb09d1542f84ab7b0056
- Manifiesto de hashes: FILE_MANIFEST.json (incluido en el repositorio del modelo)
- Enlaces adicionales: no se encontraron referencias tecnicas relevantes en la busqueda web realizada.
