# BH-Language-AI/lumi-vl-8b-cua-stage3-4mp

## Resumen

Lumi-vl-8b-cua-stage3-4mp es un adaptador LoRA experimental publicado por BH-Language-AI sobre el modelo base Qwen/Qwen3.5-VL-8B. El adaptador está orientado a tareas de *computer-use agent* (CUA) y *GUI grounding*: localizar elementos de interfaz y traducir instrucciones en lenguaje natural a coordenadas o acciones sobre pantallas. Se distribuye como un repositorio PEFT de 0,5 GB, lo que corresponde únicamente a los pesos del adaptador, no al modelo completo.

El modelo se presenta explícitamente como no recomendado para producción. Según la model card del autor, este *stage-3* rinde peor que el *stage-2* previo en todas las resoluciones evaluadas: 48,5 % frente a 51,25 % a 2 MP y 59,75 % frente a 64,5 % a 4 MP, sobre 400 muestras por configuración. El autor concluye que la mejora observada al subir a 4 MP proviene de la resolución de entrada, no del entrenamiento con el *harvest dataset*, que era mayoritariamente web y perjudicó ligeramente el rendimiento en escritorio.

La relevancia de esta ficha es doble: por un lado, documenta un punto de iteración concreto en el desarrollo de agentes de interfaz gráfica sobre un VLM de 8B; por otro, sirve como caso de estudio de un adaptador que el propio autor desaconseja, útil para entender qué tipo de datos (escritorio frente a web) mejora el *grounding* de UI. No hay información pública sobre licencia, idiomas, benchmarks estándar ni pipeline de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-VL-8B; adaptador LoRA sobre PEFT) |
| Parametros totales | no disponible (modelo base de 8B; el adaptador LoRA no declara su número de parámetros) |
| Parametros activos | no disponible (no consta que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors del adaptador; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA que se inicializa desde el *stage-2* y se entrena durante 800 pasos a 4 MP con una tasa de aprendizaje de 4e-5. Sobre el *stage-2* se añade un *harvest dataset* de 2.591 muestras con un factor de sobremuestreo (*upweight*) de 4×. Ese conjunto combina fuentes web (wiki, documentación, GitHub, Hugging Face, Hacker News) con capturas de aplicaciones de escritorio de Windows (Settings, Explorer, Wordpad, Paint) y una interfaz de *harness* de evaluación. El dataset es privado (`datasets/BH-Language-AI/cua-harvest-data`).

La innovación declarada no es arquitectónica sino metodológica: el autor aísla el efecto de la resolución frente al efecto de los datos adicionales y concluye que la ganancia a 4 MP es atribuible a la resolución, mientras que el *harvest* web-heavy degradó el rendimiento. No se documentan detalles sobre RLHF, DPO, número total de tokens de entrenamiento ni composición exacta del dataset más allá de la descripción cualitativa.

## Capacidades

- *GUI grounding*: localización de elementos de interfaz en capturas de pantalla, orientada a resolución de 2 MP y 4 MP.
- *Computer-use agent*: soporte para traducir instrucciones en lenguaje natural a acciones sobre escritorio (según los tags `cua` del repositorio).
- Procesamiento de imagen y texto: hereda las capacidades multimodales del modelo base Qwen/Qwen3.5-VL-8B.
- No se documentan en la información disponible capacidades de *tool calling*, razonamiento multi-paso explícito, modo *thinking*, audio ni soporte multilingüe verificado.
- El adaptador es experimental y su rendimiento es inferior al del *stage-2* en todas las resoluciones medidas.

## Casos de uso

- Evaluación comparativa de adaptadores CUA: usar este *stage-3* como referencia negativa frente al *stage-2* para cuantificar el impacto de un dataset web-heavy en tareas de escritorio, replicando el protocolo de 400 muestras a 2 MP y 4 MP.
- Investigación sobre *GUI grounding* de alta resolución: probar el adaptador a 4 MP para estudiar cómo la resolución de entrada afecta a la localización de elementos en pantallas densas, dado que el autor atribuye a la resolución la mejora observada.
- Automatización de escritorio Windows en laboratorio: aplicar el adaptador sobre capturas de Settings, Explorer, Wordpad o Paint para experimentar con agentes que ejecutan acciones guiadas por instrucciones, siempre en entorno controlado y no en producción.
- Generación de datos de entrenamiento: usar las predicciones del adaptador como señal débil para minar *hard cases* de producción, tal como propone el autor como siguiente paso.
- Análisis de *dataset mixing*: estudiar el efecto del sobremuestreo 4× de un conjunto pequeño (2.591 muestras) sobre un adaptador previamente entrenado, comparando curvas de rendimiento por resolución.
- Prototipado de agentes de navegación de UI: integrar el adaptador en un *harness* de evaluación para medir precisión de *grounding* antes de decidir si se promociona a un modelo mayor o se reentrena con datos específicos de escritorio.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor (n=400 por configuración):

| Adaptador | 2 MP | 4 MP |
|---|---|---|
| Stage-2 (recomendado) | 51,25 % | 64,5 % |
| Stage-3 (este adaptador) | 48,5 % | 59,75 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ScreenSpot u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador; depende del modelo base Qwen/Qwen3.5-VL-8B y de su cuantización, que no se documenta.
- GPU recomendadas: no disponibles en la información proporcionada.
- Encaje en GPU de consumo: no confirmado; un modelo base de 8B en precisión reducida suele requerir GPUs de gama alta de consumo, pero no hay datos oficiales para esta combinación.
- Opciones de despliegue: el repositorio usa la librería PEFT, por lo que el adaptador se carga junto al modelo base mediante `transformers` + `peft`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento CUA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lumi-vl-8b-cua-stage3-4mp | 8B (base) + LoRA | no disponible | 48,5 % (2 MP) / 59,75 % (4 MP) | no disponible | Hugging Face (repo PEFT) |
| lumi-vl-8b-cua-stage2 (mismo autor) | 8B (base) + LoRA | no disponible | 51,25 % (2 MP) / 64,5 % (4 MP) | no disponible | No consta enlace público en la información disponible |
| Qwen/Qwen3.5-VL-8B (modelo base) | 8B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de otros modelos CUA comparables en la información proporcionada.

## Limitaciones y advertencias

- El propio autor marca el modelo como experimental y no recomendado para producción.
- Rendimiento inferior al *stage-2* en todas las resoluciones evaluadas, por lo que no debe sustituir al adaptador previo.
- El *harvest dataset* era mayoritariamente web y perjudicó el rendimiento en escritorio; el sesgo hacia datos web es una limitación conocida del entrenamiento.
- Licencia no declarada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe.
- Riesgo de alucinación y de coordenadas incorrectas inherente a los modelos de *grounding* de UI; no se documentan métricas de calibración.
- El repositorio contiene solo el adaptador (0,5 GB); requiere descargar el modelo base Qwen/Qwen3.5-VL-8B por separado y verificar su licencia.
- No hay información sobre longitud de contexto, cuantizaciones soportadas ni latencia, lo que dificulta planificar despliegues.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/lumi-vl-8b-cua-stage3-4mp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-VL-8B
- Dataset (privado, referenciado en la model card): `datasets/BH-Language-AI/cua-harvest-data`
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
