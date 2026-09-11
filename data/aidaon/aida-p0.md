# AIDAON/aida-p0

## Resumen

AIDA P0 (AI Detector Analysis, fase 0) es un detector de imágenes generadas por IA desarrollado por AIDAON. No es un modelo generativo: es un clasificador binario de imágenes que devuelve una probabilidad calibrada (`score_ia`) y una clase (REAL / IA) a partir únicamente del contenido del píxel, sin inspeccionar metadatos ni marcas de agua. Se construye sobre el backbone visual CLIP `ViT-B-32-quickgelu`, del que obtiene representaciones de 512 dimensiones, y combina tres sensores independientes (Visual Expert, Forensics y Rigid/Real Evidence) mediante una etapa de fusión.

El repositorio de HuggingFace no distribuye los pesos. Publica el código (licencia MIT), la metodología, la arquitectura, las métricas y las limitaciones; los pesos residen en el Space `AIDAON/aida-api`, que ejecuta las inferencias de producción y cuya licencia está sin determinar (`LICENSE_UNKNOWN_REVIEW_REQUIRED`). Por tanto, el repositorio no puede ejecutar inferencia por sí solo: sin un directorio `models/` externo, la clase `AidaP0` lanza la excepción `ArtefatoAusente` en lugar de devolver un resultado.

Su relevancia actual es doble. Por un lado, aborda un problema operativo real (el triaje de imágenes sintéticas en moderación, verificación y curación de datasets) con una interfaz reproducible y un umbral de decisión congelado en `0,48158617244389096` para permitir comparaciones entre versiones. Por otro, es un caso poco habitual de publicación parcial: código y documentación abiertos con los pesos explícitamente fuera del alcance, acompañado de una declaración de limitaciones inusualmente detallada (entre el 9 % y el 47 % de error sobre fotografías reales, según el tipo de fotografía, medido sobre 5.307 imágenes).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador de imágenes sobre backbone CLIP `ViT-B-32-quickgelu` (transformer de visión) con pipeline de fusión de tres sensores (Visual Expert + Forensics + Rigid/Real Evidence + Fusion) y calibración de Platt |
| Parámetros totales | no disponible (el backbone declarado es ViT-B-32; el recuento total del detector no se especifica en la información proporcionada) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes); no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | portugués (`pt` según la model card) |
| Licencia | Código: MIT. Pesos: sin licencia declarada, identificador `aida-p0-pesos-sob-revisao`, estado `LICENSE_UNKNOWN_REVIEW_REQUIRED` |
| Formato de pesos | PyTorch (etiqueta `pt`); los pesos no se distribuyen en este repositorio |
| Dimensión de la representación | 512 |
| Clases de salida | REAL / IA |
| Umbral de decisión | `0,48158617244389096` (congelado en la promoción a P0) |
| Salidas adicionales | `score_ia`, clase, umbral y los tres scores de los sensores (para detectar desacuerdo entre ellos) |
| Estado declarado | Production Champion |
| Fecha de creación del repositorio | 2026-09-10 |
| Última actualización | 2026-09-11 |

## Arquitectura y entrenamiento

El detector combina un extractor visual basado en CLIP `ViT-B-32-quickgelu` —que el paquete `open_clip` descarga en la primera ejecución, unos 350 MB— con tres ramas de análisis denominadas Visual Expert, Forensics y Rigid/Real Evidence, cuyas salidas se combinan en una etapa de fusión. Sobre la puntuación resultante se aplica una calibración de Platt, de modo que `score_ia` se interpreta como una probabilidad calibrada de que la imagen se parezca estadísticamente a las imágenes generadas por IA vistas durante el entrenamiento. El resultado se discretiza con un umbral fijo de `0,48158617244389096`, obtenido a partir del índice de Youden sobre el conjunto de validación del campeón anterior y congelado deliberadamente en la promoción a P0 para aislar el cambio de modelo del cambio de punto de operación.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. Sí se documenta que el umbral que maximiza el MCC es `0,2901` en validación y `0,5202` en un conjunto externo, y que el umbral congelado no es un óptimo, algo que el propio autor indica que fue auditado. La evaluación de la limitación principal (falsos positivos sobre fotografías reales) se realizó sobre 5.307 imágenes. El repositorio incluye un archivo `RELEASE_BENCHMARK.md` cuyo contenido no se ha proporcionado en esta ficha.

## Capacidades

- Clasificación binaria de imágenes en REAL o IA, con devolución de una probabilidad calibrada (`score_ia`) y del umbral aplicado.
- Detección de imágenes generadas por IA y de deepfakes basada exclusivamente en contenido del píxel: no depende de metadatos EXIF, C2PA ni marcas de agua, por lo que no se ve afectada por su eliminación.
- Análisis forense multi-sensor: expone por separado los tres scores de los sensores, lo que permite detectar casos de desacuerdo alto entre ellos.
- Señalización de casos dudosos: la política oficial marca como `INCONCLUSIVO` las imágenes en las que los sensores discrepan mucho, en lugar de forzar una clase.
- Integración programática mediante una API Python (`AidaP0.models_dir`, método `analizar`) y mediante el servicio desplegado en el Space `AIDAON/aida-api`.
- Capacidades multilingües: no aplica a la tarea (clasificación de imágenes); el idioma declarado en la model card es el portugués.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión descriptiva, tool calling ni modo de pensamiento explícito. No es un modelo de lenguaje ni un modelo multimodal generativo.

## Casos de uso

- Moderación de contenido en plataformas: uso del clasificador como primera pasada para marcar imágenes potencialmente sintéticas antes de la revisión humana. Es adecuado por su salida probabilística y por la política de `INCONCLUSIVO`, que evita automatizar decisiones binarias en casos ambiguos; el 9 %–47 % de error sobre fotos reales obliga a mantener revisión humana.
- Verificación periodística y fact-checking: análisis de una imagen sospechosa para obtener una señal cuantificable que documentar junto a otras pruebas. El modelo solo analiza el píxel, lo que resulta útil cuando los metadatos han sido eliminados por la red social o el mensajero.
- Curación de datasets de entrenamiento: filtrado de imágenes sintéticas en corpus recopilados de la web antes de entrenar otros modelos, usando `score_ia` como criterio de exclusión ajustable según el coste relativo de falsos positivos y falsos negativos.
- Triaje en peritaje forense digital: generación de un informe preliminar con el score, la clase, el umbral y los tres scores de los sensores, dejando constancia del posible desacuerdo entre ramas. La propia documentación advierte que el resultado no es evidencia de fraude, autoría ni intención.
- Investigación reproducible sobre detección de deepfakes: el repositorio permite clonar el código, instalar dependencias y ejecutar la suite de tests que no depende de pesos, sirviendo como base metodológica incluso sin acceso a los pesos.
- Auditoría de repositorios y bases de datos de imágenes: ejecución por lotes contra un directorio de imágenes para estimar la proporción de contenido sintético, con la advertencia de que la tasa de falsos positivos varía mucho según el tipo de fotografía.
- Despliegues en portugués (Brasil, Portugal): clientes que consuman la API del Space `AIDAON/aida-api`, dado que la documentación y el idioma declarado del proyecto están en portugués.
- Integración como servicio interno: llamada al endpoint del Space para que ningún peso salga del servidor; el flujo documentado es imagen → frontend → backend/API → P0 → inferencia → resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y ninguno de ellos es aplicable a un clasificador de imágenes. Los únicos datos de rendimiento documentados son los siguientes:

| Métrica | Valor | Notas |
|---|---|---|
| Tasa de error sobre fotografías reales | 9 %–47 % según el tipo de fotografía | Principal limitación conocida del modelo |
| Tamaño del conjunto de medición de esa limitación | 5.307 imágenes | Medición declarada en la model card |
| Umbral de operación congelado | `0,48158617244389096` | Índice de Youden sobre validación del campeón anterior |
| Umbral que maximiza el MCC (validación) | `0,2901` | Indica que el umbral congelado no es el óptimo |
| Umbral que maximiza el MCC (conjunto externo) | `0,5202` | Dato truncado en la información proporcionada |
| MCC con el umbral congelado | no disponible | — |
| Precisión, recall, F1, AUC | no disponible | — |

El repositorio incluye un archivo `RELEASE_BENCHMARK.md` con el benchmark de la release, pero su contenido no forma parte de la información suministrada, por lo que no se reproducen aquí sus cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1–2 GB en fp32 y menos de 1 GB en fp16, considerando el backbone `ViT-B-32-quickgelu` y los cabezales de clasificación. Es una estimación a partir del backbone declarado, no un dato publicado por el autor.
- El backbone CLIP no acompaña al repositorio: `open_clip` lo descarga en la primera ejecución, aproximadamente 350 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en fp32; tarjetas como RTX 3060, RTX 4090, A100 o H100 quedan muy por encima del requisito y solo tienen sentido para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, e incluso es viable en CPU (el `requirements.txt` del repositorio apunta al índice de PyTorch CPU).
- Opciones de despliegue: PyTorch nativo mediante la API `AidaP0`, servicio remoto a través del Space `AIDAON/aida-api` y `open_clip` para la carga del backbone. No se documentan soportes de vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: código y documentación son ligeros; hay que prever espacio para el backbone (~350 MB) y para el directorio `models/` con los pesos, que no se distribuyen en este repositorio.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la información proporcionada: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre detectores equivalentes. La comparativa se limita, por tanto, a los datos del propio AIDA P0.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AIDAON/aida-p0 | no disponible (backbone CLIP ViT-B-32) | no aplica | Error del 9 %–47 % sobre fotos reales; MCC no disponible | Código MIT; pesos sin licencia declarada | Código en HuggingFace; pesos solo vía Space `AIDAON/aida-api` |
| Alternativas de la misma categoría (detectores de imágenes generadas por IA y clasificadores de deepfakes) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tasa de error elevada sobre imágenes reales: entre el 9 % y el 47 % de las fotografías reales se clasifican mal, en función del tipo de fotografía. Está medido sobre 5.307 imágenes y es la limitación principal declarada por el autor.
- Un resultado del modelo no es prueba de que una imagen haya sido generada por IA. Tampoco es una medida de autenticidad: `clase = REAL` significa únicamente que la imagen no se parece a las imágenes de IA vistas en entrenamiento, no que sea verdadera o no esté editada.
- `score_ia` no es la probabilidad de que la imagen sea generada por IA en el mundo real: depende de la prevalencia de imágenes de IA en el material analizado, dato que el modelo desconoce.
- El resultado no constituye evidencia de fraude, autoría ni intención.
- Riesgo de alucinación en sentido estricto: no aplica (no genera texto), pero sí existe riesgo de falsos positivos con impacto reputacional o legal si se usa como filtro automático sin revisión humana.
- Confianza reducida en casos de desacuerdo alto entre los tres sensores: la política oficial los marca como `INCONCLUSIVO`, lo que implica que una parte de los casos quedará sin clasificar.
- El umbral de operación no es óptimo y el propio autor lo documenta como una decisión deliberada de congelación; usar otro umbral cambia el equilibrio entre falsos positivos y falsos negativos y rompe la comparabilidad con la release P0.
- Sesgos conocidos: no disponibles de forma explícita más allá del sesgo por tipo de fotografía documentado en la tasa de error.
- Generalización limitada frente a generadores nuevos: el detector se apoya en parecido estadístico con las imágenes vistas en entrenamiento, por lo que su comportamiento ante modelos generativos posteriores al entrenamiento no está garantizado.
- Idioma: el proyecto está documentado en portugués y declara `pt`; no se documenta evaluación en otros idiomas ni con material textual asociado.
- Restricciones de licencia: los pesos no tienen licencia declarada (`LICENSE_UNKNOWN_REVIEW_REQUIRED`, con las cuestiones Q1 y Q2 marcadas como `PENDENTE_DE_DECISAO`). Mientras no se resuelvan, los pesos no deben describirse como open source, licenciados bajo MIT, redistribuibles ni aptos para uso comercial, y la publicación no está jurídicamente autorizada según la propia documentación, que además aclara que no constituye un dictamen jurídico.
- El repositorio no ejecuta inferencia por sí solo: sin el directorio de pesos, la clase `AidaP0` lanza `ArtefatoAusente`. Esto debe contemplarse en cualquier integración en producción.
- Advertencia de producción: dado el rango de error sobre fotografías reales, no es recomendable usar el modelo como único criterio en decisiones automatizadas con consecuencias sobre personas (por ejemplo, bloqueo de cuentas o rechazo de verificaciones de identidad).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AIDAON/aida-p0
- Licencias del repositorio: https://huggingface.co/AIDAON/aida-p0/blob/main/LICENSES.md
- Model card detallada del proyecto: `MODEL_CARD.md` (referenciado en el repositorio)
- Benchmark de la release: `RELEASE_BENCHMARK.md` (referenciado en el repositorio)
- Space que aloja la API y los pesos: `AIDAON/aida-api`
- Backbone visual: CLIP `ViT-B-32-quickgelu` a través de `open_clip`
- Resultados de búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; las búsquedas realizadas devolvieron únicamente resultados no relacionados (una plataforma educativa en árabe)
