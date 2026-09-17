# fernandofernandes/fly-wordbrain-rank32

## Resumen

Fly Wordbrain rank 32 es un modelo de generacion de texto de 2.343.125 parametros entrenado sobre un connectoma de mosca de la fruta (Drosophila melanogaster) congelado. Lo publica el usuario fernandofernandes en HuggingFace y deriva de fly-wordbrain-rank64, del que hereda exactamente la misma arquitectura salvo el rango del readout: 49.393 → 32 → 1.024 en lugar de 49.393 → 64 → 1.024. Con ello reduce el numero de parametros en 1.613.344 respecto a su hermano mayor (un 22.5x menos que el modelo de referencia del que parte la linea, ngxson/fly-llm-hf, con 52.756.661 parametros).

El interes del modelo es de investigacion, no de produccion: demuestra que es posible congelar por completo la matriz sinaptica de un connectoma biologico (ningun peso sinaptico fue modificado) y aprender unicamente las dinamicas por neurona y las dos interfaces de entrada y salida, obteniendo aun asi un modelo de lenguaje que supera al checkpoint de referencia en entropia cruzada sobre texto reservado. El entrenamiento se hizo sobre 1.000 relatos cortos de TinyStories, en ingles, y el autor lo presenta como una prueba de que restringir el rango del readout actua como regularizador frente al sobreajuste en ese regimen de datos tan bajo.

Es relevante ahora porque se situa en la interseccion de dos lineas activas: los modelos de lenguaje ultra pequenos (por debajo de 5M de parametros) y el uso de priors estructurales biologicos (connectomica) como inductores de arquitectura. Su tamano lo hace ejecutable en CPU, pero su arquitectura es no estandar y requiere codigo propio, lo que limita su uso fuera de experimentos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo recurrente sobre connectoma de Drosophila congelado; encoder (embedding + 8 proyecciones de entrada), dinamica por neurona, LayerNorm de salida y readout factorizado de rango 32 |
| Parametros totales | 2.343.125 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY 4.0 para los pesos; MIT para el codigo. Derivado de MaleCNS v1.0 (FlyEM / HHMI Janelia, University of Cambridge, MRC LMB, Google Research) y de la arquitectura ngxson/fly-llm-hf. TinyStories no se redistribuye |
| Formato de pesos | safetensors (dos checkpoints: `min-ce.safetensors` y `max-accuracy.safetensors`) |
| Desglose de parametros | Encoder 482.816; ganancia neuronal, ganancia recurrente y bias 148.179; LayerNorm de salida 98.786; readout factorizado (rango 32) 1.613.344 |
| Datasets de entrenamiento | fernandofernandes/fly-connectome-49k; roneneldan/TinyStories |
| Tamano del repo en el Hub | 0.0 GB (redondeo del Hub) |
| Fecha de creacion en el Hub | 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura no es un transformer convencional. El modelo usa como sustrato un connectoma de mosca (49.393 neuronas) que permanece congelado durante todo el entrenamiento: los digests de los buffers congelados en `manifest.json` son identicos byte a byte a los del modelo de referencia y a los de la variante rank 64. Lo unico entrenable son las dinamicas por neurona (ganancias neuronales, ganancias recurrentes y bias, 148.179 parametros), el encoder (embedding mas 8 proyecciones de entrada, 482.816 parametros), la LayerNorm de salida (98.786) y el readout factorizado (1.613.344). El readout descompone la proyeccion de las 49.393 unidades biologicas a la salida en dos factores de rango 32, lo que concentra casi el 69% de los parametros del modelo.

El entrenamiento se realizo sobre 1.000 relatos cortos de TinyStories en ingles. El autor indica que los dos selectores de checkpoint retenidos (`min-ce` y `max-accuracy`) convergen en la misma actualizacion, la 16.600, de modo que ambos ficheros contienen los mismos pesos con dos criterios de seleccion distintos. La aportacion tecnica principal es el propio cuello de botella de rango: segun el autor, constrenir el rango del readout reduce el sobreajuste sobre un corpus de solo 1.000 historias cortas, y con rango 32 se obtiene una penalizacion de 0.029 nats y 0.79 puntos de exactitud top-1 frente al rango 64 a cambio de 1.613.344 parametros menos. No se documenta RLHF, DPO ni ninguna fase de alineamiento.

## Capacidades

- Generacion de texto en ingles a nivel de historia corta infantil: es lo unico para lo que fue entrenado (TinyStories).
- Prediccion de siguiente token sobre vocabulario de TinyStories; el autor reporta 45.059 objetivos de siguiente token evaluados en la auditoria.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingue: no; el modelo declara unicamente ingles.
- No tiene modo de razonamiento explicito (thinking mode), vision ni audio.
- Capacidad destacable: la inferencia ejecuta un sustrato de connectoma biologico congelado, lo que permite estudiar el efecto del cableado de Drosophila como prior inductivo sin reentrenar la conectividad.
- Dos checkpoints disponibles con criterios de seleccion distintos (minima entropia cruzada y maxima exactitud).

## Casos de uso

- Investigacion en connectomica computacional: usar el modelo como banco de pruebas para medir cuanto rendimiento linguistico se puede extraer de un cableado biologico congelado, comparando el rango del readout como unica variable (32 frente a 64).
- Experimentos de ablacion de arquitectura: dado que la matriz sinaptica esta congelada, cualquier mejora observada se atribuye a las dinamicas por neurona o a las interfaces, lo que simplifica el analisis de atribucion.
- Docencia y divulgacion: el modelo cabe en CPU y su grafo completo (49.393 neuronas) es tratable para visualizaciones interactivas en cursos de neurociencia computacional o de aprendizaje automatico.
- Pruebas de sobreajuste en regimen de datos bajos: con solo 1.000 historias de entrenamiento, sirve como caso extremo para estudiar regularizacion mediante factorizacion de bajo rango en la capa de salida.
- Validacion de pipelines de inferencia personalizados: al no encajar en vLLM, TGI o llama.cpp, es util para probar entornos de ejecucion propios basados en PyTorch y funciones de paso personalizadas.
- Generacion de texto sintetico controlado: producir continuaciones de estilo TinyStories de forma local y con coste computacional despreciable para aumentar datos de prototipos o pruebas de humo.
- Comparacion de priors biologicos frente a priors aleatorios: el autor senala explicitamente que los controles con grafos aleatorizados y con cero aristas no se han ejecutado, por lo que el modelo habilita esa linea de trabajo pendiente.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a la auditoria del propio autor: 200 historias de TinyStories nuevas (no vistas) y 45.059 objetivos de siguiente token, sin seleccion de checkpoint.

| Modelo | Parametros | Audit CE | Audit top-1 | Delta CE vs referencia (IC 95%) |
|---|---:|---:|---:|---|
| ngxson reference | 52.756.661 | 3.9882 | 31,38% | — |
| rank 64 | 3.956.469 | 3.2802 | 33,37% | -0,708 [-0,738, -0,679] |
| rank 32 (este modelo) | 2.343.125 | 3.3091 | 32,58% | -0,679 [-0,711, -0,647] |

Frente al rank 64, este modelo supone 1.613.344 parametros menos a cambio de 0,029 nats y 0,79 puntos de exactitud top-1. En la particion de validacion usada para la seleccion, la diferencia se lee como 1,42 puntos, y el texto generado muestra mas fallos visibles en peticiones genericas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,4 MB en fp32 y 4,7 MB en fp16 o bf16 solo para los pesos entrenables; hay que sumar los buffers del connectoma congelado, cuyo tamano no se especifica en la informacion disponible.
- GPU: cualquier GPU, incluida una GTX 1050 o una iGPU moderna, es suficiente. No se requiere A100, H100 ni RTX 4090.
- Consumer GPU: si, cabe de sobra en cualquier GPU de consumo, y tambien en CPU (el entrenamiento se hizo sobre un modelo de 2,3M de parametros).
- Opciones de despliegue: no hay soporte para vLLM, TGI, llama.cpp u Ollama, ya que la arquitectura no es un transformer estandar y el connectoma no se redistribuye con los pesos. El despliegue requiere PyTorch y la funcion de paso completa documentada en la model card de la variante rank 64, mas el connectoma descargado desde el dataset fly-connectome-49k.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Audit CE | Audit top-1 | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| fly-wordbrain-rank32 (este) | 2.343.125 | no disponible | 3,3091 | 32,58% | CC BY 4.0 (pesos), MIT (codigo) | HuggingFace, requiere connectoma externo |
| fly-wordbrain-rank64 | 3.956.469 | no disponible | 3,2802 | 33,37% | no disponible en la informacion proporcionada | HuggingFace, modelo de referencia recomendado por el autor |
| ngxson/fly-llm-hf (referencia) | 52.756.661 | no disponible | 3,9882 | 31,38% | no disponible en la informacion proporcionada | HuggingFace |

El modelo comparable mas cercano es su propia familia; el autor advierte que la comparacion contra la referencia liberada no es controlada, porque se desconocen las historias de entrenamiento y el entrenador de ese modelo. No se dispone de datos de contexto para ninguno de los tres.

## Limitaciones y advertencias

- Idiomas: entrenado y declarado unicamente para ingles. No se documenta soporte multilingue.
- Corpus extremadamente limitado: 1.000 relatos cortos de TinyStories; el vocabulario y la estructura de las frases estan fuertemente sesgados hacia narrativa infantil.
- Generacion poco fiable: el propio autor recomienda la variante rank 64 y senala que este modelo presenta mas fallos visibles en peticiones genericas.
- Comparacion no controlada: la mejora frente a ngxson/fly-llm-hf no es un resultado controlado, ya que se desconocen los datos y el entrenador de la referencia.
- Ausencia de controles causales: no se han ejecutado los controles con grafos aleatorizados ni con cero aristas, por lo que no puede afirmarse que el cableado de la mosca sea un buen prior para lenguaje.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje entrenado con datos escasos; no hay evaluacion de fidelidad factual.
- Licencia: los pesos son CC BY 4.0, lo que permite uso comercial con atribucion, pero el modelo deriva de MaleCNS v1.0 (FlyEM / HHMI Janelia, University of Cambridge, MRC LMB, Google Research) y de la arquitectura ngxson/fly-llm-hf, por lo que conviene verificar las condiciones de esas fuentes antes de un uso comercial.
- TinyStories no se redistribuye: hay que obtenerlo por separado.
- El connectoma no se incluye en el repositorio del modelo; vive en el dataset fly-connectome-49k, lo que anade un paso de descarga y montaje antes de poder inferir.
- Despliegue no estandar: sin soporte en los runners habituales (vLLM, TGI, llama.cpp, Ollama), lo que complica integrarlo en produccion.
- Sin datos de contexto maximo, cuantizacion, latencia ni throughput publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fernandofernandes/fly-wordbrain-rank32
- Modelo hermano (rank 64, baseline recomendado): https://huggingface.co/fernandofernandes/fly-wordbrain-rank64
- Repositorio de investigacion y resultados: https://github.com/fernando-neto-ai/fly-wordbrain
- Dataset del connectoma: https://huggingface.co/datasets/fernandofernandes/fly-connectome-49k
- Dataset de entrenamiento TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Arquitectura de referencia: https://huggingface.co/ngxson/fly-llm-hf
- Connectoma de origen MaleCNS v1.0 (FlyEM / HHMI Janelia, University of Cambridge, MRC LMB, Google Research): referencia citada en la model card, sin URL explicita en la informacion disponible.

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces devueltos correspondian a hilos de un foro de operador de telefonia y no guardan relacion con el modelo.
