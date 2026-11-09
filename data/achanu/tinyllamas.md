# achanu/tinyllamas

## Resumen

Tinyllamas es una serie de modelos con arquitectura Llama 2 entrenados sobre el conjunto de datos TinyStories, publicados por el usuario achanu en Hugging Face. El propósito declarado por el autor es servir como pesos compatibles con el proyecto llama2.c de Andrej Karpathy, un runtime en C puro para inferencia de modelos tipo Llama sin dependencias de frameworks de deep learning. El repositorio ocupa 1,3 GB y se distribuye bajo licencia MIT.

La relevancia de esta publicacion es fundamentalmente practica: TinyStories es un corpus de cuentos infantiles sinteticos generado para estudiar la emergencia de capacidades lingüisticas en modelos pequenos, y los pesos resultantes son utiles para experimentar con inferencia de bajo coste, educacion sobre arquitecturas transformer y validacion de pipelines de decodificacion en C. No se trata de un modelo orientado a produccion ni a tareas generales.

La informacion disponible es muy limitada: la model card consta de dos frases, no se especifican parametros, longitud de contexto, composicion del dataset ni resultados de evaluacion. El repositorio no registra descargas ni interacciones en el momento de la consulta, lo que sugiere una publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 2 (transformer decoder-only) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre TinyStories, corpus en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 1,3 GB; presumiblemente safetensors o binarios compatibles con llama2.c, sin confirmar) |

## Arquitectura y entrenamiento

El autor indica explicitamente que se trata de una serie de modelos con arquitectura Llama 2, es decir, transformers decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE), siguiendo el diseno descrito en el paper de Llama 2. No se detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni el tamano concreto de cada variante de la serie.

El entrenamiento se realizo sobre TinyStories, un dataset sintetico de cuentos cortos en ingles generado con GPT-3.5 y GPT-4 y disenado para estudiar la adquisicion de capacidades gramaticales y de coherencia narrativa en modelos de pocos millones de parametros. No se especifican el numero de tokens vistos, la composicion exacta del corpus, la posible aplicacion de RLHF o DPO, ni hiperparametros de entrenamiento. Tampoco se documenta ninguna innovacion tecnica adicional mas alla de la compatibilidad con el runtime llama2.c.

## Capacidades

- Generacion de texto narrativo corto en ingles, limitado al dominio de cuentos infantiles sinteticos similar a TinyStories.
- Coherencia gramatical basica y mantenimiento de una estructura narrativa simple, segun el diseno del dataset de entrenamiento.
- Inferencia mediante el runtime llama2.c, que permite ejecutar el modelo en C sin dependencias de PyTorch.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; el corpus de entrenamiento es en ingles.
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Educacion sobre arquitecturas transformer: el modelo permite inspeccionar y modificar un transformer tipo Llama de forma directa, con pesos de tamano manejable y un runtime en C legible, lo que facilita explicar atencion, RoPE y decodificacion autoregresiva en cursos y talleres.
- Validacion de runtimes de inferencia: sirve para probar implementaciones de llama2.c, portes a plataformas embebidas o comparaciones de velocidad entre backends sin necesidad de GPU.
- Generacion de cuentos sinteticos para experimentacion: util para generar corpus narrativos cortos en ingles destinados a pruebas de pipelines de datos, etiquetado o evaluacion de calidad textual.
- Pruebas de integracion en CI: al ser un modelo pequeno con licencia MIT, puede incluirse en tests automatizados que verifiquen que un pipeline de tokenizacion, carga de pesos y generacion funciona de extremo a extremo.
- Investigacion sobre emergencia de capacidades: permite reproducir experimentos del paper de TinyStories sobre cuando aparecen habilidades gramaticales en funcion del tamano del modelo y del dataset.
- Despliegue en entornos con recursos muy limitados: la compatibilidad con llama2.c posibilita ejecutar inferencia en CPU, Raspberry Pi o sistemas sin acelerador, util para demos y prototipos offline.
- Base para fine-tuning educativo: al tener licencia permisiva y arquitectura estandar, puede servir como punto de partida para ejercicios de ajuste supervisado sobre dominios muy acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision al desconocerse el numero de parametros. El repositorio ocupa 1,3 GB, lo que sugiere pesos en precision de 16 o 32 bits para una o varias variantes de la serie.
- GPU recomendadas: no disponibles. Por el tamano del repositorio, es probable que cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) pueda alojar el modelo, pero no se confirma.
- Apta para consumer GPU: previsiblemente si, dado el tamano reducido del repositorio, aunque no hay confirmacion del autor.
- Opciones de despliegue: llama2.c es el runtime indicado por el autor; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| achanu/tinyllamas | no disponible | no disponible | TinyStories | MIT | Hugging Face, 0 descargas |
| karpathy/tinyllamas | variantes de 15M a 42M (segun publicacion original de llama2.c) | 512 tokens (segun configuracion de llama2.c) | TinyStories | MIT | Hugging Face |
| Modelos TinyStories de referencia (por ejemplo, roneneldan/TinyStories) | 1M a 33M | 256-512 tokens | TinyStories | MIT / CDLA-Sharing-1.0 segun variante | Hugging Face |

La comparacion se basa en el conocimiento publico del ecosistema TinyStories y llama2.c; los datos concretos de la serie de achanu no estan disponibles, por lo que la equivalencia con las variantes de karpathy no puede confirmarse.

## Limitaciones y advertencias

- Dominio extremadamente restringido: el modelo solo ha visto cuentos infantiles sinteticos en ingles, por lo que su comportamiento fuera de ese dominio sera deficiente.
- Riesgo alto de alucinacion y de incoherencia fuera del estilo narrativo simple para el que fue entrenado.
- No apto para produccion ni para tareas de codigo, matematicas, razonamiento o atencion al cliente.
- Idiomas: no se documenta soporte multilingue; se espera un rendimiento muy pobre en castellano u otras lenguas.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni documentacion sobre procedencia y filtrado de los datos de entrenamiento.
- Ausencia total de evaluaciones publicadas y de validacion comunitaria (0 descargas, 0 likes), lo que impide verificar calidad o reproducibilidad.
- Al ser una publicacion de un usuario individual sin model card detallada, no hay informacion sobre sesgos, filtrado de datos ni limitaciones declaradas por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/achanu/tinyllamas
- Repositorio llama2.c: https://github.com/karpathy/llama2.c
- Paper de TinyStories: https://arxiv.org/abs/2305.07759
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
