# MartinBlomqvist/maktsprak_classifier_clean

## Resumen

Maktsprak_classifier_clean es un clasificador de texto en sueco que identifica a cuál de los ocho partidos del Riksdag (Parlamento sueco) pertenece un discurso político. Lo desarrolla MartinBlomqvist y se basa en un ajuste fino (fine-tuning) de KB/bert-base-swedish-cased, el modelo BERT en sueco del KBLab (Real Biblioteca Nacional de Suecia). El modelo se emplea en el sitio maktsprak.se y clasifica intervenciones parlamentarias de debates desde 2015 en adelante.

El problema que resuelve es concreto: dado el texto de un discurso, predecir la etiqueta de partido entre C, KD, L, M, MP, S, SD y V. Solo procesa los primeros 512 tokens de la entrada, por lo que no modela discursos completos que excedan esa longitud. La arquitectura es la de BERT base estándar (transformer encoder), con tokenización sensible a mayúsculas y minúsculas (cased).

La relevancia del modelo es acotada y de nicho: es un artefacto de investigación para análisis del discurso político sueco, no un modelo generativo de propósito general. Su rendimiento en el conjunto de validación es modesto (exactitud de 0,612 y macro-F1 de 0,606), lo que refleja la dificultad real de la tarea: distinguir el partido de un orador a partir del texto, sin acceso a metadatos del hablante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), fine-tuning de KB/bert-base-swedish-cased |
| Parametros totales | no disponible (el modelo base BERT base ronda los 110-125 M, pero no se confirma en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (solo se procesan los primeros 512 tokens de la entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sueco (sv) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 3,0 GB; etiqueta pytorch) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de KB/bert-base-swedish-cased, un encoder transformer de tipo BERT con tokenización cased, adaptado a una tarea de clasificación multiclase de 8 etiquetas (C, KD, L, M, MP, S, SD, V). La entrada se trunca a los primeros 512 tokens del discurso. No se documentan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a un clasificador de este tipo).

El aspecto metodológico más destacable es la partición de validación por hablante: el conjunto de prueba se define reteniendo nombres de oradores, y `val_speakers.json` lista los 146 nombres retenidos. Según la corrección del 27 de noviembre de 2026, el conjunto retenido original era el 15 % de los nombres tal como aparecen en las actas, y un mismo político puede figurar bajo varios nombres; por ello, 38 de las 137 personas del conjunto también estaban en entrenamiento. Las métricas reportadas (0,612 de exactitud y 0,606 de macro-F1) cuentan solo a las otras 99 personas no vistas en entrenamiento. Antes de esa corrección las cifras eran 0,628 de exactitud y 0,619 de macro-F1. El modelo no se ha reentrenado tras la corrección.

## Capacidades

- Clasificación de texto multietiqueta (una etiqueta por discurso) en sueco, con 8 clases de partido: C, KD, L, M, MP, S, SD y V.
- Predicción de la afiliación partidista de un discurso parlamentario a partir únicamente del texto.
- Procesamiento de entradas de hasta 512 tokens; el texto posterior se descarta.
- Funcionamiento sobre debates del Riksdag desde 2015 en adelante.
- Integración como pipeline de `text-classification` en Hugging Face (etiqueta `pytorch`, `bert`).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento; es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingüe limitada al sueco; no se declara soporte de otros idiomas.

## Casos de uso

- Análisis del discurso parlamentario: clasificar automáticamente intervenciones del Riksdag por partido para estudiar patrones retóricos y temáticos por formación política, aprovechando que el modelo está ajustado sobre debates desde 2015.
- Monitorización de la actividad parlamentaria: procesar lotes de actas y etiquetar cada discurso con su partido para construir series temporales de presencia y estilo discursivo.
- Investigación en ciencias políticas: usar las predicciones como variable dependiente o de control en estudios sobre polarización, coaliciones o evolución del lenguaje político sueco.
- Etiquetado asistido de corpus: preclasificar grandes volúmenes de texto para que anotadores humanos revisen solo los casos dudosos, reduciendo el coste de anotación manual.
- Detección de cambio de estilo por partido: comparar la distribución de predicciones sobre discursos de un mismo orador a lo largo del tiempo para detectar desplazamientos discursivos.
- Verificación de atribuciones: como señal auxiliar para comprobar si un texto atribuido a un partido es consistente con el estilo aprendido del modelo, siempre con revisión humana dada la exactitud de 0,612.
- Docencia y divulgación: alimentar visualizaciones o demostraciones interactivas (como en maktsprak.se) sobre cómo se distribuyen los discursos por partido.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud en conjunto retenido (99 hablantes no vistos) | 0,612 |
| Macro-F1 en conjunto retenido (99 hablantes no vistos) | 0,606 |
| Exactitud antes de la corrección (cifras previas) | 0,628 |
| Macro-F1 antes de la corrección (cifras previas) | 0,619 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las cifras anteriores son las únicas métricas reportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un BERT base, la inferencia en FP32 requiere aproximadamente 0,5-1 GB de VRAM, aunque este dato no se confirma en la información proporcionada.
- GPU recomendadas: no disponible en la información; por el tamaño del modelo base, cualquier GPU consumer moderna sería suficiente en la práctica, pero no se documenta.
- Cabe en GPU consumer: previsiblemente sí (modelo tipo BERT base), aunque no se aporta confirmación en la información disponible.
- Opciones de despliegue: pipeline de `text-classification` de Hugging Face Transformers (etiqueta `pytorch`); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MartinBlomqvist/maktsprak_classifier_clean | no disponible (base BERT base) | 512 tokens | Clasificación de partido en discursos suecos | no disponible | Hugging Face |
| KB/bert-base-swedish-cased (modelo base) | no disponible | 512 tokens | Modelo de lenguaje enmascarado en sueco | no disponible en la información | Hugging Face |
| Otros clasificadores de partido en sueco | no disponible | no disponible | Clasificación política | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Exactitud limitada: 0,612 de exactitud y 0,606 de macro-F1 sobre hablantes no vistos; un tercio o más de las predicciones son incorrectas, por lo que no es apto para decisiones automatizadas sin revisión humana.
- Fuga de datos corregida pero no reentrenada: 38 de las 137 personas del conjunto retenido estaban también en entrenamiento; las métricas reportadas excluyen a esas personas, pero el modelo no se ha reentrenado tras la corrección.
- Truncamiento a 512 tokens: los discursos más largos pierden información; el modelo solo ve el inicio del texto.
- Cobertura temporal limitada: ajustado sobre debates desde 2015; su comportamiento sobre textos anteriores o de otros contextos no está validado.
- Idioma único: solo sueco; no se declara soporte de otras lenguas.
- Sesgos potenciales: al aprender del corpus del Riksdag, puede reflejar sesgos de sobrerrepresentación de ciertos partidos, oradores o periodos; no se documentan análisis de sesgo en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo (es un clasificador), pero sí existe riesgo de predicciones erróneas o sobreconfiadas.
- Licencia no disponible: no se especifican términos de uso comercial; debe consultarse al autor antes de un despliegue en producción.
- Uso previsto acotado: es un artefacto de investigación para un sitio concreto (maktsprak.se); no se documenta soporte, mantenimiento ni garantías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MartinBlomqvist/maktsprak_classifier_clean
- Modelo base: https://huggingface.co/KB/bert-base-swedish-cased
- Código y método: https://github.com/MartinBlomqvistDev/maktsprak
- Sitio que lo utiliza: https://maktsprak.se
