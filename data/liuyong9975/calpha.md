# liuyong9975/Calpha

## Resumen

Calpha es un modelo de lenguaje conversacional especializado en plegamiento de proteinas, desarrollado por Yong Liu (liuyong9975) y presentado como primer informe tecnico de una linea de investigacion orientada a dotar a un LLM generalista de capacidades biomoleculares nativas. El modelo parte de Qwen3.5-9B y le anade un adaptador que inyecta caracteristicas por residuo procedentes de ESM2-3B congelado, de modo que una secuencia de proteinas puede introducirse dentro de un turno de chat convencional y el modelo responde con un token especial `<structure>`.

La generacion de coordenadas tridimensionales no la realiza el LLM: sus estados ocultos en nueve capas, en las posiciones de las residuos, pasan por un pequeno front-end de condicionamiento (8,4 M de parametros) que alimenta una cabeza de flow-matching SimpleFold-3B congelada, la cual produce coordenadas de todos los atomos. El repositorio pesa 98,3 GB e incluye pesos, salidas de benchmark y datos de entrenamiento.

Su relevancia es doble: por un lado, explora la integracion de tareas cientificas estructuradas dentro de una interfaz conversacional; por otro, sus propios resultados muestran que el LLM no mejora la precision del plegador subyacente y que incluso la degrada en cadenas largas, lo que convierte a Calpha en una referencia util sobre los limites de este enfoque hibrido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM transformer (Qwen3.5-9B) + adaptador ESM2 + front-end de condicionamiento + cabeza flow-matching SimpleFold-3B congelada |
| Parametros totales | No disponible (el LLM base es de 9B; adaptador ESM2: 27 M; front-end: 8,4 M; SimpleFold-3B: 3B congelados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Mixta: `llm/`, adaptador, front-end, benchmarks y codigo bajo Apache 2.0; el uso conjunto requiere SimpleFold-3B, bajo Apple Machine Learning Research Model License (solo investigacion) |
| Formato de pesos | safetensors (adaptador y front-end); checkpoint `transformers` estandar para `llm/` en bf16 |

## Arquitectura y entrenamiento

Calpha es un sistema hibrido en dos etapas. En la primera se entrenan conjuntamente Qwen3.5-9B, el adaptador ESM2 (27 M de parametros, que suma caracteristicas de ESM2-3B a los embeddings de los tokens de aminoacido) y una cabeza SimpleFold-100M inicializada desde sus pesos publicos, durante 2B tokens con tres objetivos: entropia cruzada de lenguaje, entropia cruzada del token disparador `<structure>` y la perdida de flow-matching de la cabeza. Los datos de lenguaje se componen al 75% de tareas de proteinas y al 25% de texto general en ingles y razonamiento; los datos estructurales son 84.658 cadenas del PDB recortadas a 256 residuos.

En la segunda etapa se congela todo salvo el front-end de condicionamiento: 20.000 pasos con recortes de 256 residuos y 10.000 pasos adicionales a 512 residuos, con batch efectivo de 64, learning rate de 1e-4 y EMA de 0,999, lo que supone unas 11 horas en ocho GPU H200. La innovacion principal es la interfaz: el LLM no genera coordenadas directamente, sino que actua como encaminador semantico cuyos estados ocultos de nueve capas condicionan una cabeza generativa congelada; el resto de pesos de la cabeza son exactamente el checkpoint publico de SimpleFold-3B.

## Capacidades

- Generacion de texto conversacional en ingles heredada de Qwen3.5-9B, con la salvedad de una caida de rendimiento en tareas generales tras el entrenamiento con proteinas.
- Plegamiento de proteinas de cadena unica a partir de una secuencia de aminoacidos introducida en un turno de chat.
- Prediccion de coordenadas de todos los atomos (all-atom), aunque la evaluacion publicada se limita a atomos alfa-carbono.
- Deteccion de intencion de plegamiento mediante el token especial `<structure>`.
- Procesamiento de secuencias con caracteristicas por residuo procedentes de ESM2-3B a traves del adaptador.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Anotacion estructural preliminar en pipelines de biologia computacional: dada una secuencia, obtener coordenadas alfa-carbono como primera aproximacion antes de recurrir a predictores especializados, aceptando la perdida de precision frente a ESMFold.
- Interfaz conversacional para biologos: un investigador puede pegar una secuencia en un chat y recibir una estructura sin cambiar de herramienta, lo que reduce la friccion de adopcion en equipos no tecnicos.
- Filtrado de candidatos en diseno de proteinas: descartar rapidamente secuencias con plegamientos inverosimiles antes de simulaciones mas costosas, usando el modelo como criba de bajo coste.
- Investigacion sobre integracion de tareas cientificas en LLM: Calpha sirve como banco de pruebas reproducible para estudiar si el conocimiento linguistico mejora el plegamiento, con datos y salidas de benchmark publicados.
- Docencia y divulgacion: demostrar en un notebook el flujo completo secuencia a estructura con una unica GPU de 48 GB, sin infraestructura especializada.
- Analisis de sensibilidad al prompting: el repositorio incluye las salidas crudas de los modelos de chat, lo que permite estudiar como varia la respuesta segun la formulacion de la peticion.
- Evaluacion comparativa de cabezas generativas: al mantener SimpleFold-3B intacto, permite aislar el efecto del condicionamiento del LLM frente al control cabeza-sola.

## Benchmarks y rendimiento

TM-score sobre atomos alfa-carbono, una muestra por diana, fallos contados como cero, todos los sistemas puntuados por el mismo programa.

| Modelo | FoldBench-334 | CASP16 | CAMEO-2025 |
|---|---|---|---|
| Calpha | 0,807 | 0,635 | 0,900 |
| Control solo cabeza (ESM2 a SimpleFold-3B, sin LLM) | 0,822 | 0,682 | 0,917 |
| ESMFold | 0,869 | 0,762 | 0,905 |
| SimpleFold-3B | 0,842 | 0,704 | 0,938 |
| ESM3-open | 0,787 | 0,643 | 0,852 |
| DPLM-2 (650M) | 0,656 | 0,515 | 0,757 |
| Random walk (suelo) | 0,140 | 0,139 | 0,136 |

El informe indica que, frente al control solo cabeza, no se detecta perdida de precision en cadenas de 100 a 300 residuos en ningun conjunto, pero la perdida es significativa en cadenas de 300 a 600 residuos en los tres conjuntos. En tareas generales, la precision en MMLU-Pro cayo de 0,774 a 0,703 durante el entrenamiento con proteinas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 48 GB para el sistema completo en bf16 (LLM de 9B, ESM2-3B y SimpleFold-3B), segun el propio autor.
- GPU recomendadas: una unica GPU de 48 GB o superior, como A100 80 GB, H100 o H200.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB) con el sistema completo en bf16; el checkpoint `llm/` por separado podria cargarse con cuantizacion, aunque no se documentan recetas.
- Despliegue: el paquete `calpha` (instalacion con `pip install -e .`) mas `apple/ml-simplefold` en un commit concreto; `llm/` es un checkpoint estandar de `transformers` y puede cargarse de forma independiente como modelo de chat.
- Latencia y throughput: no disponibles. El entrenamiento de la etapa 2 requirio unas 11 horas en ocho H200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TM-score FoldBench-334 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Calpha | 9B + 3B + 3B (componentes) | No disponible | 0,807 | Mixta, uso conjunto solo investigacion | Pesos en HF |
| ESMFold | No disponible | No disponible | 0,869 | No disponible en la informacion | Publico |
| SimpleFold-3B | 3B | No disponible | 0,842 | Apple ML Research Model License (investigacion) | Publico en apple/ml-simplefold |
| ESM3-open | No disponible | No disponible | 0,787 | No disponible en la informacion | Publico |

Calpha no supera a ESMFold ni a SimpleFold-3B en ninguno de los tres conjuntos y queda por debajo del control solo cabeza en FoldBench-334 y CASP16; su ventaja diferencial es la interfaz conversacional, no la precision estructural.

## Limitaciones y advertencias

- El modelo de lenguaje no mejora la precision del plegamiento: Calpha esta por debajo del control que lee ESM2 directamente en dos de tres conjuntos y por debajo de ESMFold en FoldBench-334 y CASP16.
- Por encima de 300 residuos el LLM penaliza la precision en todos los conjuntos.
- Dependencia total de ESM2-3B y de los pesos de SimpleFold-3B, descargados de sus fuentes originales.
- Degradacion de capacidades generales: MMLU-Pro cae de 0,774 a 0,703 tras el entrenamiento con proteinas.
- Solo cadenas unicas y secuencia unica; no admite ligandos ni complejos.
- Precision medida unicamente sobre atomos alfa-carbono, con una sola formulacion de peticion; cadenas laterales, choques estericos y otras formulaciones no fueron evaluados.
- Licencia: el uso conjunto del sistema queda sujeto a la Apple Machine Learning Research Model License, que restringe a investigacion; el uso comercial requiere revisar el NOTICE del repositorio.
- No apto para uso clinico ni diagnostico.
- Riesgo de alucinacion estructural en secuencias fuera de la distribucion de entrenamiento (PDB recortado a 256 residuos), sin metricas publicadas al respecto.
- Idioma limitado al ingles; no se documenta soporte multilingue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liuyong9975/Calpha
- Pagina del proyecto: https://calpha-ai.com
- Codigo: https://github.com/yliust/Calpha
- Aviso de licencia: https://github.com/yliust/Calpha/blob/main/NOTICE
- SimpleFold (cabeza congelada): https://github.com/apple/ml-simplefold
- Informe tecnico: anunciado como "coming soon", no disponible en la informacion proporcionada.
