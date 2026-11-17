# Dellboy/debris-tagger-v2

## Resumen

DEBRIS tagger v2 es un ajuste fino mediante LoRA del modelo Qwen/Qwen2.5-3B-Instruct, desarrollado por Marc C. Deller (Elora Therapeutics) y publicado en Hugging Face bajo el identificador Dellboy/debris-tagger-v2. Su funcion es convertir la informacion bibliografica de un articulo cientifico de PubMed (titulo, revista, lista de terminos MeSH y resumen) en un objeto JSON estructurado con etiquetas del esquema DEBRIS: relevancia, polimeros, clase de tamano, sistemas de organos, tejidos, categorias de enfermedad, vias biologicas, tipo de estudio, nivel de evidencia, especificidad de PET y un resumen breve. Es, por tanto, un modelo especializado en mineria de literatura cientifica sobre microplasticos y contaminacion por debris, no un asistente generalista.

El modelo parte de la arquitectura transformer densa de Qwen2.5-3B-Instruct, con 3.085.938.688 parametros totales, y se distribuye como pesos fusionados en bf16 (safetensors) tras aplicar el adaptador LoRA sobre los pesos base. El repositorio ocupa 6,2 GB. Esta disenado para un unico idioma de trabajo, el ingles, y su licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que es el tagger de produccion que alimenta el sitio debris.mdeller.com, con un pipeline semanal que no reentrena el modelo. Frente a soluciones genericas, ofrece un esquema de salida fijo y validado, con una puntuacion media de 0,902 en las ocho metricas de referencia sobre un conjunto de test congelado de 162 articulos, y garantiza JSON valido en el 100 % de los casos. Es un ejemplo de como un modelo pequeno y especializado puede sustituir a un LLM grande en una tarea de extraccion estructurada acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), ajustado con LoRA y pesos fusionados en bf16 |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-3B-Instruct, sin confirmar en la model card) |
| Tipos de cuantizacion | No disponible en el repositorio; los pesos se publican en bf16 (safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16, LoRA fusionado) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Metodo de ajuste | LoRA rango 8, escala 20, sobre 32 capas |
| Tamano del repositorio | 6,2 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-3B-Instruct, un modelo denso de 3.000 millones de parametros con atencion causal estandar. Sobre esa base se aplico un ajuste fino con LoRA de rango 8 y escala 20 en 32 capas, con tamano de lote 4, 1.600 iteraciones, tasa de aprendizaje 1e-5, perdida calculada unicamente sobre la respuesta y semilla 42. Posteriormente, el adaptador se fusiono en los pesos base y se publico en bf16, de modo que el usuario no necesita cargar el adaptador por separado.

El conjunto de entrenamiento consta de 1.438 resumenes revisados manualmente (el conjunto canonico de entrenamiento), con la receta v2 del esquema: tipos de modelo, vias y polimeros revisados en el laboratorio (D50) y tejidos anadidos. El modelo espera un system prompt concreto, el de `pipeline/lab_v2.py` con los interruptores v2, y debe recibirlo byte a byte; cualquier variacion en ese prompt puede degradar la calidad de las etiquetas. La model card subraya que el modelo se entrena en la tarea y el esquema, no en hechos: las etiquetas registran lo que un articulo reporta, y nada en el esquema afirma causalidad humana. No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre la tarea de extraccion.

## Capacidades

- Extraccion estructurada de etiquetas DEBRIS a partir de metadatos bibliograficos de PubMed (titulo, revista, MeSH y resumen), con salida JSON validada.
- Clasificacion de relevancia del articulo respecto al dominio de microplasticos y debris.
- Identificacion de polimeros, clase de tamano, sistemas de organos, tejidos, categorias de enfermedad y vias biologicas.
- Clasificacion del tipo de estudio y asignacion de nivel de evidencia (evidence rung), con puntuacion exacta y tolerancia de un nivel.
- Evaluacion de especificidad de PET y generacion de un resumen breve del articulo.
- Salida JSON estrictamente valida (1.000 en el conjunto de test), lo que facilita su integracion en pipelines automatizados.
- Capacidad multilingue limitada al ingles; no se documentan capacidades de vision, audio, tool calling ni razonamiento agente multi-paso.

## Casos de uso

- Mineria de literatura cientifica sobre microplasticos: el modelo procesa resumenes de PubMed y devuelve etiquetas normalizadas que permiten filtrar y agregar articulos por polimero, tejido o via biologica sin revision manual.
- Construccion de bases de datos curadas: al emitir JSON valido en el 100 % de los casos, los resultados pueden cargarse directamente en una base de datos relacional o en un motor de busqueda para su explotacion posterior.
- Revision sistematica asistida: la clasificacion de tipo de estudio y nivel de evidencia permite priorizar articulos para revision por pares humanos, reduciendo el volumen de lectura inicial.
- Monitorizacion semanal de nuevas publicaciones: el pipeline de produccion de debris.mdeller.com demuestra su uso en un flujo recurrente que no reentrena el modelo, solo infiere sobre articulos nuevos.
- Enriquecimiento de repositorios institucionales: bibliotecas y grupos de investigacion pueden etiquetar automaticamente sus colecciones de articulos sobre contaminacion por plasticos para mejorar la recuperacion de informacion.
- Analisis de tendencias por polimero o via biologica: al agregar las etiquetas de polimeros y vias a lo largo del tiempo, se pueden detectar cambios en la literatura cientifica sin intervencion manual.
- Filtrado de ruido en busquedas bibliograficas: la metrica de relevancia (F1 de 0,971) permite descartar articulos no relacionados antes de pasarlos a un revisor humano o a un modelo mayor.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test congelado de 162 articulos, puntuado una sola vez:

| Campo | Metrica | Puntuacion |
|---|---|---|
| Relevant | F1 | 0,971 |
| Polymers | F1 | 0,942 |
| Organ systems | F1 | 0,795 |
| Pathways | F1 | 0,798 |
| Evidence rung | Exacto | 0,870 |
| Evidence rung | Dentro de un nivel | 0,907 |
| Study type | Accuracy | 0,932 |
| Tissues | F1 | 0,807 |
| Valid JSON | Tasa | 1,000 |
| Media de las ocho metricas base | Media | 0,902 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,2 GB solo para los pesos, mas el espacio de activaciones y cache KV, lo que situa el requisito practico en torno a 8-10 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3,5-4 GB; en 4 bits, alrededor de 2-2,5 GB, aunque el repositorio solo publica pesos bf16 y no se documentan cuantizaciones oficiales.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de produccion con alto throughput; RTX 4090, RTX 3090 o RTX 4080 para desarrollo y despliegue en una sola GPU consumer.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM en bf16, y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama para inferencia local; el formato safetensors permite cargarlo con transformers y servir con vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DEBRIS tagger v2 | 3.085.938.688 | No disponible | Etiquetado DEBRIS de literatura biomedica | MIT | Hugging Face (Dellboy/debris-tagger-v2) |
| Qwen/Qwen2.5-3B-Instruct | 3.000 millones (aprox.) | No disponible en esta ficha | Asistente generalista | Apache 2.0 (segun el modelo base) | Hugging Face |
| Modelos de extraccion genericos basados en LLM grandes | Variable | Variable | Extraccion estructurada generica | Variable | Variable |

La comparativa con alternativas especializadas en mineria de literatura de microplasticos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado para una unica tarea y un unico esquema; no es un asistente generalista y su uso fuera del etiquetado DEBRIS producira resultados poco fiables.
- Depende de un system prompt concreto (el de `pipeline/lab_v2.py` con los interruptores v2) que debe enviarse byte a byte; variaciones en el prompt pueden degradar la calidad de las etiquetas.
- Solo soporta ingles; los articulos en otros idiomas no estan cubiertos.
- Las etiquetas registran lo que un articulo reporta, no hechos verificados ni causalidad humana; no deben interpretarse como afirmaciones cientificas independientes.
- Riesgo de alucinacion en campos con menor F1, como sistemas de organos (0,795), vias (0,798) y tejidos (0,807), donde la extraccion es menos fiable que en relevancia o polimeros.
- El conjunto de test es pequeno (162 articulos) y se puntuo una sola vez; las metricas pueden no generalizar a distribuciones de articulos distintas.
- La licencia MIT permite uso comercial, pero el modelo base Qwen2.5-3B-Instruct tiene su propia licencia (Apache 2.0 segun la informacion habitual del modelo base, no confirmada en esta ficha) que conviene verificar antes de un despliegue comercial.
- No se documentan cuantizaciones oficiales ni requisitos de contexto; el rendimiento en produccion con contextos largos no esta validado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dellboy/debris-tagger-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Sitio de produccion: https://debris.mdeller.com
