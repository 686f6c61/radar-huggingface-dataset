# figranium/androidfolate

## Resumen

AndroidFolate es un modelo discriminativo de tipo cross-encoder disenado para el ranking de elementos de interfaz de usuario (UI grounding) en Android, orientado a la automatizacion de acciones en dispositivos moviles. Lo desarrolla Figranium como un fine-tune de `google/electra-large-discriminator` (335M parametros), reutilizando la arquitectura `ElectraForSequenceClassification` con 24 capas de transformer, 1024 de dimension oculta y 16 cabezas de atencion, configurada con `num_labels=1`. Su proposito es resolver un problema concreto: dado un comando en lenguaje natural (por ejemplo, "tap Search flights button") y un conjunto de nodos interactivos extraidos del arbol de accesibilidad de Android, devolver una probabilidad de relevancia calibrada por nodo y el nodo resuelto que existe realmente en la jerarquia.

La relevancia actual del modelo radica en su enfoque de despliegue: se distribuye como un artefacto LiteRT/TFLite cuantizado a INT8 (aproximadamente 335 MB), pensado para inferencia acelerada por NPU en hardware movil (Google Tensor, Qualcomm Hexagon, Samsung Exynos y MediaTek APU) dentro de un limite de 8 GB de RAM del dispositivo, sin requerir PyTorch ni `transformers` en tiempo de inferencia. Cubre cuatro stacks de UI: Android nativo/Jetpack Compose, React Native, Flutter y WebViews embebidos.

Cabe senalar que, segun la model card, el modelo se presenta como un lanzamiento previsto para enero de 2027: los pesos y los resultados de benchmarks no estan publicados en la informacion disponible. El repositorio existe en Hugging Face con 0 descargas y 1 like en el momento de la consulta, y la model card describe el plan de evaluacion y el proceso de entrenamiento, pero no ofrece metricas finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo ELECTRA (`ElectraForSequenceClassification`), cross-encoder discriminativo; 24 capas, 1024 de hidden size, 16 cabezas de atencion, `num_labels=1` |
| Parametros totales | 335M (backbone `google/electra-large-discriminator`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card indica longitudes WordPiece estaticas por buckets, sin valor concreto) |
| Tipos de cuantizacion | INT8 estatico (LiteRT); checkpoint en float32 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`model_quantized.tflite`, previsto) y Safetensors float32 (checkpoint `androidfolate-large`) |

## Arquitectura y entrenamiento

AndroidFolate parte de `google/electra-large-discriminator` y se fine-tunea como un cross-encoder de clasificacion binaria: cada par `(query, nodo serializado)` se evalua conjuntamente y se produce un unico logit de clasificacion, sobre el que se aplica una sigmoide para obtener una probabilidad de relevancia calibrada entre 0.0 y 1.0. La serializacion de nodos unifica la informacion de accesibilidad de distintos frameworks en un esquema estructurado de tokens que incluye framework de origen, clase/rol del widget, identificador de recurso o test, etiqueta de accesibilidad, texto visible y flags de estado interactivo (`clickable`, `focusable`, `scrollable`, `checked`, `selected`), podando contenedores de layout no interactivos sin etiqueta.

El entrenamiento se realiza sobre corpus de grounding de arboles de accesibilidad de Android multi-framework (Android nativo/Compose, React Native, Flutter y WebView) en aplicaciones reales. Cada paso de interaccion se convierte en pares de clasificacion binaria: la consulta se normaliza a una descripcion concisa de accion, y cada nodo positivo ground-truth se empareja con negativos duros muestreados de la misma pantalla (incluidos hermanos en listas `RecyclerView`/`LazyColumn`). La evaluacion se plantea con particiones estratificadas por framework. En el plano de runtime, el modelo se convierte desde PyTorch mediante `litert-torch` y se cuantiza a INT8 con `ai-edge-quantizer`, manteniendo la cabeza de clasificacion en mayor precision para preservar la calibracion de los logits, y se compila para los delegados NPU de Tensor, Hexagon, Exynos y APU. No se detalla en la informacion disponible el volumen de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO (no procede en un cross-encoder discriminativo).

## Capacidades

- Ranking de elementos de UI: dado un comando en lenguaje natural y candidatos extraidos de `AccessibilityNodeInfo`, devuelve probabilidades de relevancia y el nodo resuelto.
- Grounding de acciones de un solo paso: `click`, `type`, `scroll` y `long_click`.
- Soporte multi-framework: Android nativo y Jetpack Compose, React Native, Flutter Semantics y WebViews embebidos.
- Clasificacion zero-shot por relevancia (pipeline `zero-shot-classification`), sin generacion de texto libre.
- Salida calibrada y determinista: probabilidad sigmoide sobre un unico logit, orientada a evitar alucinacion en la seleccion de nodo.
- Inferencia en dispositivo sin PyTorch ni `transformers` en runtime, mediante LiteRT.
- Aceleracion por NPU en Google Tensor, Qualcomm Hexagon, Samsung Exynos y MediaTek APU.
- Capacidad multilingue limitada al ingles (idioma declarado: `en`).
- No soporta tool calling generativo, agentes multi-paso ni modos de razonamiento extendido; su funcion es el ranking de candidatos dentro de un paso.

## Casos de uso

- Automatizacion de pruebas end-to-end en Android: el modelo resuelve, a partir de instrucciones en lenguaje natural, que nodo pulsar o rellenar en una pantalla, lo que permite escribir tests de UI robustos frente a cambios de layout y reutilizables entre stacks (Compose, React Native, Flutter, WebView).
- Agentes moviles de accesibilidad: para usuarios con dificultades motoras o visuales, un asistente puede traducir comandos hablados o escritos en acciones concretas sobre la pantalla, con la garantia de que el nodo devuelto existe en la jerarquia de accesibilidad.
- RPA movil en dispositivos gestionados: automatizacion de flujos repetitivos (rellenar formularios, navegar menus, confirmar dialogos) en apps empresariales, ejecutando la inferencia en el propio dispositivo sin enviar arboles de accesibilidad a la nube.
- Asistentes de computer-use en Android: como motor de grounding de un solo paso dentro de un bucle de agente mas amplio, donde un LLM planifica y AndroidFolate resuelve el elemento objetivo con baja latencia en NPU.
- Extraccion y etiquetado de elementos interactivos: uso como clasificador para priorizar nodos candidatos en pipelines de scraping o auditoria de accesibilidad de aplicaciones.
- Despliegue en dispositivos de gama media: al ocupar aproximadamente 335 MB en INT8 y operar bajo un techo de 8 GB de RAM, encaja en escenarios de campo donde no es viable ejecutar modelos generativos grandes.
- Deteccion de regresiones de UI: comparar el ranking de nodos esperado frente al observado tras actualizaciones de la aplicacion para detectar cambios de identificadores o etiquetas de accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los pesos y los resultados se publicaran en el lanzamiento previsto para enero de 2027, y presenta unicamente el plan de evaluacion estratificado por framework (Top-1, Top-3, Top-5, MRR y latencia NPU p50/p95), con todas las celdas marcadas como pendientes.

| Split | Framework de UI | Top-1 | Top-3 | Top-5 | MRR | Latencia NPU |
|---|---|---|---|---|---|---|
| `eval_native_compose` | Android nativo y Jetpack Compose | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| `eval_react_native` | React Native | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| `eval_flutter` | Flutter Semantics | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| `eval_webview` | Android WebView | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 335 MB en INT8 para el artefacto TFLite; el checkpoint float32 ocupa aproximadamente 1.34 GB en disco.
- Techo de memoria objetivo: 8 GB de RAM del dispositivo movil, segun declara el autor.
- Aceleracion: delegados NPU de LiteRT para Google Tensor, Qualcomm Hexagon, Samsung Exynos y MediaTek APU.
- GPU de escritorio: no se especifican requisitos; el modelo esta orientado a movil y no se documenta soporte CUDA.
- Despliegue: LiteRT/TFLite para inferencia en dispositivo; el checkpoint float32 se usa con PyTorch para entrenamiento o conversion. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles (la model card los deja como pendientes de medicion p50/p95 en NPU).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de ranking de UI en Android con los que contrastar parametros, contexto o rendimiento. Como referencia estructural, el modelo deriva de `google/electra-large-discriminator` (335M parametros, licencia Apache 2.0), pero no se aportan datos de alternativas especificas de UI grounding.

## Limitaciones y advertencias

- Pesos no publicados: la model card describe el modelo como lanzamiento previsto para enero de 2027; en el momento de la consulta no hay artefactos ni resultados verificables.
- Sin benchmarks publicados: no es posible validar el rendimiento real en ninguna de las cuatro particiones de evaluacion.
- Solo ingles: las consultas en lenguaje natural deben formularse en ingles; no se declara soporte de otros idiomas.
- Ambito restringido a un unico paso: no es un agente ni un modelo generativo; no planifica secuencias de acciones ni mantiene estado conversacional.
- Dependencia de la calidad del arbol de accesibilidad: nodos sin etiqueta, con identificadores dinamicos o dentro de canvas personalizados pueden degradar el ranking.
- Riesgo de alucinacion mitigado pero no nulo: aunque el nodo devuelto se restringe a la jerarquia de accesibilidad de origen, una probabilidad alta sobre un nodo incorrecto sigue siendo posible.
- Sesgos no documentados: no se detalla la composicion demografica ni la distribucion de aplicaciones del corpus de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento derivados de aplicaciones reales, no detalladas en la informacion disponible.
- Longitud de contexto no especificada: no se puede evaluar el limite practico del numero de candidatos o de la longitud de la serializacion por nodo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/figranium/androidfolate
- Modelo base: https://huggingface.co/google/electra-large-discriminator
- Version web (Folate): https://huggingface.co/figranium/folate
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
