# praneet3/low-resource-mt-gemma

## Resumen

low-resource-mt-gemma es un adaptador PEFT (QLoRA) sobre el modelo base google/gemma-3-1b-it, publicado por el usuario praneet3 en Hugging Face. Su proposito es la traduccion automatica entre ingles y dos lenguas de bajos recursos: khasi (kha) y bodo (brx), ambas lenguas del noreste de la India. El repositorio contiene unicamente los artefactos del estudio (adaptador y checkpoints con estado del optimizador), no pesos completos del modelo.

El modelo se presenta como un ejercicio de adaptacion de un modelo de 1.000 millones de parametros mediante QLoRA de rango 16 y una sola epoca de entrenamiento. La relevancia radica en explorar hasta que punto un modelo pequeno de proposito general, ajustado con recursos minimos, puede cubrir pares de traduccion de bajos recursos que rara vez aparecen en los corpus multilingues masivos.

La informacion publicada es muy escasa: no se detallan hiperparametros completos, composicion del dataset, resultados de evaluacion ni cifras de rendimiento. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano reportado es de 0.0 GB, lo que sugiere que los artefactos podrian no estar efectivamente subidos o que la metadata no refleja su contenido real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-3-1b-it); adaptacion mediante QLoRA (PEFT) |
| Parametros totales | 1.000 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la del modelo base Gemma 3 1B no se especifica en la model card) |
| Tipos de cuantizacion | QLoRA implica cuantizacion de 4 bits durante el entrenamiento; formatos de inferencia no disponibles |
| Idiomas soportados | en, kha (khasi), brx (bodo) |
| Licencia | gemma (Gemma Terms of Use, con las restricciones de uso de la seccion 3.2) |
| Formato de pesos | safetensors (adaptador PEFT y checkpoints con estado del optimizador) |

## Arquitectura y entrenamiento

El modelo es un adaptador QLoRA de rango 16 aplicado sobre google/gemma-3-1b-it, un transformer decoder-only de 1.000 millones de parametros. El entrenamiento consistio en una sola epoca con cuantizacion de 4 bits del modelo base, segun indica la model card. Los checkpoints publicados incluyen tanto el adaptador como el estado del optimizador, lo que permite reanudar el entrenamiento pero no esta pensado para despliegue directo sin extraer el adaptador.

No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion adicionales (RLHF, DPO). La evaluacion, segun el autor, se realizo sobre holdouts internos etiquetados procedentes de los datos de entrenamiento de WMT26 Indic MT. No se publican resultados numericos de esa evaluacion ni detalles sobre el preprocesado, la tokenizacion de las lenguas objetivo o el tratamiento del vocabulario para khasi y bodo.

## Capacidades

- Traduccion automatica bidireccional ingles-khasi y ingles-bodo, segun el pipeline declarado (translation) y los idiomas listados.
- Generacion de texto general heredada del modelo base Gemma 3 1B, aunque el ajuste esta orientado a traduccion.
- Capacidades del modelo base (razonamiento, codigo, matematicas) no documentadas para esta adaptacion concreta.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues limitadas a los tres idiomas declarados (en, kha, brx); el resto de idiomas del modelo base no se ha evaluado tras el ajuste.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Traduccion de documentacion administrativa al khasi y al bodo: el adaptador puede emplearse para versionar textos oficiales en lenguas del noreste de la India, aunque requiere validacion humana por la falta de metricas publicadas.
- Localizacion de interfaces y contenido web: integracion en pipelines de traduccion para productos dirigidos a hablantes de khasi y bodo, usando el adaptador sobre Gemma 3 1B en infraestructura modesta.
- Preservacion linguistica y corpus digitales: generacion de traducciones de referencia para proyectos de documentacion de lenguas de bajos recursos, con revision posterior por linguistas.
- Investigacion en traduccion de bajos recursos: el repositorio sirve como artefacto reproducible de un experimento QLoRA de una epoca y rango 16, util para comparar estrategias de ajuste en pares con pocos datos.
- Prototipado rapido en entornos con GPU de consumo: al partir de un modelo de 1.000 millones de parametros, permite experimentar con traduccion en hardware limitado.
- Educacion y materiales didacticos bilingues: generacion de borradores de material en khasi y bodo a partir de fuentes en ingles, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluacion sobre holdouts internos de WMT26 Indic MT, pero no incluye cifras (BLEU, chrF, COMET u otras) ni comparaciones con sistemas alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 1.000 millones de parametros en FP16 se situa tipicamente en torno a 2-3 GB, y en cuantizacion de 4 bits en torno a 1 GB, aunque estas cifras no las proporciona el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el modelo base es compatible con GPU de consumo.
- Compatibilidad con GPU de consumo: probable por el tamano del modelo base, pero no confirmada por el autor.
- Opciones de despliegue: el repositorio contiene un adaptador PEFT, por lo que requiere cargar google/gemma-3-1b-it y aplicar el adaptador con librerias compatibles (transformers + PEFT). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| low-resource-mt-gemma (este) | 1B (base) + adaptador | no disponible | en, kha, brx | gemma | Adaptador PEFT en HF |
| google/gemma-3-1b-it | 1B | no disponible en la informacion proporcionada | multilingue (segun modelo base) | gemma | Pesos completos en HF |
| NLLB-200 (variantes destiladas) | 600M-54B | 512 tokens (variantes destiladas) | 200 idiomas, incluidos algunos de bajos recursos | CC-BY-NC (variantes no comerciales) | Pesos completos en HF |

La comparacion con NLLB-200 se ofrece como referencia de categoria (traduccion multilingue de bajos recursos); no se dispone de datos de rendimiento del adaptador que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de metricas publicadas: no hay BLEU, chrF ni COMET que permitan valorar la calidad de la traduccion.
- Entrenamiento de una sola epoca y rango 16: la capacidad de ajuste es limitada y el riesgo de infraajuste es alto.
- El repositorio contiene adaptador y estado del optimizador, no pesos completos; su uso requiere el modelo base y herramientas PEFT.
- El tamano reportado del repositorio (0.0 GB) sugiere que los artefactos podrian no estar disponibles o que la metadata es incorrecta.
- Riesgo de alucinacion y de traducciones inconsistentes en lenguas de bajos recursos, agravado por la escasez de datos de entrenamiento.
- Sesgos desconocidos: no se documenta la composicion del dataset ni posibles sesgos de dominio o genero.
- Restricciones de licencia: la Gemma Terms of Use, seccion 3.2, impone restricciones de uso y distribucion que deben revisarse antes de cualquier despliegue comercial.
- Sin validacion externa: la evaluacion se limita a holdouts internos del propio autor, no reproducibles con la informacion publicada.
- Contexto maximo no documentado para esta adaptacion; no se garantiza el comportamiento en secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/praneet3/low-resource-mt-gemma
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Gemma Terms of Use: https://gemma.ai/resources/terms/
- WMT26 Indic MT (referencia de datos de evaluacion mencionada por el autor): no disponible
