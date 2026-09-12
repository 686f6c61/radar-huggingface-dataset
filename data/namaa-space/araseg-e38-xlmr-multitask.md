# NAMAA-Space/araseg-e38-xlmr-multitask

## Resumen

`araseg-e38-xlmr-multitask` es un checkpoint multitarea desarrollado por NAMAA Community para la tarea compartida de segmentación del árabe AraSeg 2026 (ArabicNLP 2026). Se construye sobre `FacebookAI/xlm-roberta-large` mediante un ajuste fino completo (560M) y añade una cabeza de clasificación de tokens por cada subtarea: NP, NoPnx-PA y NoPnx-NP. El repositorio distribuye únicamente pesos en formato `state_dict` de PyTorch (`best_*.pt`), no un checkpoint en formato HuggingFace, por lo que `from_pretrained` no funciona y la arquitectura debe reconstruirse desde el YAML de configuración del experimento.

No es un segmentador autónomo: es uno de los cinco miembros que alimentan un stack lineal ajustado con predicciones out-of-fold, y su salida son probabilidades de frontera por palabra sin calibrar. Usado en solitario no reproduce ninguna puntuación publicada; el sistema completo —con los pesos y el umbral de combinación (0,36)— reside en la colección `NAMAA-Space/araseg-2026`.

Su relevancia es doble: documenta un enfoque de ensemble para segmentación morfológica árabe con 92,84 de macro-F1 en el test de práctica y 91,3 en el test ciego, y constituye un artefacto de investigación orientado a reproducibilidad exacta (config YAML más versión de `transformers` fijada), no a despliegue directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabezas de token-classification multitarea |
| Parametros totales | ~560M (modelo base XLM-RoBERTa-large, ajuste fino completo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base; no se explicita en la model card) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en `state_dict`, sin versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | arabe (ar) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | PyTorch `state_dict` (`.pt`, ficheros `best_*.pt`); no es un checkpoint en formato HuggingFace |
| Tarea | Segmentacion de texto arabe (token-classification) |
| Subtareas | NP, NoPnx-PA, NoPnx-NP (una cabeza por subtarea) |
| Rol en el sistema | Miembro votante de un stack lineal ajustado con predicciones out-of-fold sobre 5 miembros |
| Umbral del sistema | 0,36 |
| Tamano del repositorio | 6,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-12 |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa-large, un encoder transformer de 24 capas, 1024 de dimensión oculta, 16 cabezas de atención y vocabulario SentencePiece de 250.000 tokens, con aproximadamente 560M de parámetros. Sobre ese backbone se aplica un ajuste fino completo (full fine-tune) y se añaden cabezas de clasificación de tokens independientes para cada una de las tres subtareas cubiertas (NP, NoPnx-PA, NoPnx-NP), de modo que un único checkpoint multitarea sirve a tres de los cuatro sistemas presentados. Los otros miembros del ensemble emplean LoRA y requieren `transformers==5.12.1` para instanciar sus clases base; el fichero `best_PA.pt` no se distribuye por no haberse utilizado.

El elemento técnico distintivo no está en la arquitectura, sino en el método de combinación: las predicciones de los cinco miembros se agregan mediante un stack lineal ajustado con predicciones out-of-fold (OOF), con un umbral de decisión de 0,36. El checkpoint distribuido aquí es un votante de ese stack, no un clasificador final. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste adicionales como RLHF o DPO (poco habituales en tareas de etiquetado de tokens).

## Capacidades

- Segmentación de texto árabe a nivel de palabra: predicción de fronteras entre unidades léxicas y clíticos.
- Clasificación de tokens multitarea con tres cabezas independientes (NP, NoPnx-PA, NoPnx-NP) en un único checkpoint.
- Emisión de probabilidades de frontera por palabra, sin calibrar, pensadas para ser consumidas por un combinador externo.
- Participación como votante dentro de un ensemble lineal ajustado con predicciones out-of-fold.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio: es un modelo discriminativo de etiquetado.
- No soporta tool calling, function calling ni flujos de agentes multi-paso.
- Capacidad multilingüe: no en la práctica. Aunque el modelo base es multilingüe, el ajuste fino es monolingüe árabe.
- Capacidad especial: ninguna declarada (sin modo de razonamiento, sin salida estructurada más allá de etiquetas por token).

## Casos de uso

- Reproducción de resultados de AraSeg 2026: descargar `best_NP.pt`, reconstruir la arquitectura desde el YAML del experimento, cargar el `state_dict` y ejecutar el combinador con umbral 0,36 para replicar el 92,84 / 91,3 de macro-F1. Es el uso primario para el que se publica el artefacto.
- Investigación en morfología árabe: analizar las probabilidades de frontera por palabra para estudiar el comportamiento de un encoder multilingüe grande ante fenómenos de clitización y aglutinación.
- Construcción de ensembles propios: reutilizar este miembro como votante adicional en stacks lineales o en esquemas de votación mayoritaria sobre tareas de segmentación.
- Preprocesado en pipelines de NLP árabe: segmentar antes de POS tagging, parsing de dependencias, NER o análisis de sentimiento, reduciendo el vocabulario efectivo que reciben las etapas posteriores.
- Anotación automática de corpus: generar etiquetas preliminares de fronteras sobre grandes volúmenes de texto árabe para su posterior revisión humana, con la ventaja de que las probabilidades permiten priorizar los casos de mayor incertidumbre.
- Etiquetado blando y destilación: emplear las probabilidades sin calibrar como objetivos de destilación hacia modelos más pequeños o rápidos.
- Ajuste fino sobre dominio específico: partir del checkpoint multitarea y reentrenar las cabezas sobre un corpus sectorial (jurídico, médico, prensa), aprovechando las representaciones ya adaptadas al árabe.
- Evaluación comparativa de tokenizadores: usar las fronteras predichas como referencia parcial para medir la calidad de otros segmentadores o de esquemas de tokenización subpalabra.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al sistema completo, no a este miembro de forma aislada.

| Sistema / miembro | Test de practica (macro-F1) | Test ciego (macro-F1) |
|---|---|---|
| Sistema completo NAMAA (5 miembros, umbral 0,36) | 92,84 | 91,3 |
| Miembro `e38` en solitario | no disponible | no disponible |

No se han publicado resultados por miembro, ni métricas de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que además no aplican a un modelo discriminativo de etiquetado de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB solo en pesos en fp32 (560M × 4 bytes); en torno a 2,5-3 GB contando activaciones con lotes pequeños. En fp16 bajaría a unos 1,1-1,5 GB. Son estimaciones derivadas del tamaño del modelo, no cifras publicadas por el autor.
- Espacio en disco: 6,7 GB de repositorio (contiene varios checkpoints `best_*.pt`).
- GPU recomendadas: cualquier GPU con 8 GB o más. Cabe sin problema en RTX 3060, RTX 4060, RTX 4070, RTX 4090. Para lotes grandes o entrenamiento, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier modelo con al menos 8 GB de VRAM para inferencia en fp32 o fp16.
- Opciones de despliegue: `vLLM`, `TGI`, `Ollama` y `llama.cpp` no son aplicables de forma directa, porque el repositorio no contiene un checkpoint en formato HuggingFace ni GGUF. El despliegue exige reconstruir la arquitectura con el config YAML del experimento y cargar el `state_dict` manualmente, siguiendo `ensemble.py` / `verify_offcluster.py` del repositorio de código.
- Dependencias: `transformers==5.12.1` para los miembros LoRA del ensemble; stack completo fijado en `requirements-llm.txt`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `NAMAA-Space/araseg-e38-xlmr-multitask` | ~560M | 512 | Segmentacion arabe (miembro de ensemble) | MIT | HuggingFace (state_dict `.pt`) |
| Sistema completo NAMAA (`NAMAA-Space/araseg-2026`) | 5 miembros sobre base ~560M | 512 | Segmentacion arabe (sistema final) | MIT (heredada) | HuggingFace (coleccion con pesos y umbrales del combinador) |
| `FacebookAI/xlm-roberta-large` | ~560M | 512 | Modelo base multilingue (encoder) | MIT | HuggingFace |
| Otros segmentadores de arabe comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio resultados relevantes sobre el modelo ni sobre alternativas comparables; los unicos enlaces utiles proceden de la propia model card.

## Limitaciones y advertencias

- No es un segmentador autónomo. Es un votante de un ensemble y su salida son probabilidades sin calibrar; usarlo solo no reproduce ninguna puntuación publicada.
- `from_pretrained` no funciona. El fichero es un `state_dict` desnudo y requiere reconstruir la arquitectura desde el YAML del experimento y el modelo base.
- Incompatibilidad con herramientas estándar de despliegue (vLLM, TGI, Ollama, llama.cpp) al no existir pesos en formato HuggingFace ni GGUF.
- Dependencia de una versión muy concreta de `transformers` (`5.12.1`) para los miembros LoRA del sistema, lo que complica la reproducibilidad a medio plazo.
- Cobertura monolingüe: únicamente árabe. No debe esperarse transferencia a otras lenguas aunque el backbone sea multilingüe.
- Ventana de contexto de 512 tokens, heredada del modelo base; los documentos largos deben trocearse.
- La model card no documenta el dataset de entrenamiento, su composición ni su procedencia, por lo que no es posible evaluar sesgos de dominio, dialecto o registro. Riesgo de sesgo desconocido.
- Riesgo de alucinación en sentido estricto: inexistente (no genera texto), pero sí riesgo de fronteras de segmentación espurias en variedades dialectales o en texto sin diacritizar alejado de la distribución de entrenamiento.
- Licencia MIT heredada del modelo base: en principio permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales antes de un despliegue productivo.
- Artefacto sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha.
- No se publican métricas por miembro ni intervalos de confianza sobre las puntuaciones del sistema, lo que dificulta estimar su contribución real al ensemble.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-e38-xlmr-multitask
- Colección del sistema AraSeg 2026 (pesos y umbrales del combinador): https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de código, configs y mapa miembro-subtarea: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Cita: NAMAA Community, "NAMAA at Arabic Segmentation Shared Task 2026", Proceedings of ArabicNLP 2026.
- Resultados de busqueda web: no se encontraron enlaces relevantes adicionales; las busquedas devolvieron unicamente contenido no relacionado con el modelo.
