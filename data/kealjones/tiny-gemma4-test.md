# kealjones/tiny-gemma4-test

## Resumen

Tiny Gemma 4 (test builds) es una variante experimental y podada de `google/gemma-4-E2B-it`, publicada por el usuario independiente kealjones en Hugging Face. El autor ha reducido el modelo original recortando vocabulario, dimensiones ocultas, capas y tamano de la FFN, y posteriormente ha aplicado una destilacion parcial desde el modelo sin podar para recuperar parte de la calidad perdida. El resultado es un cuerpo de aproximadamente 0,6B parametros efectivos (1.312.263.455 parametros totales en los pesos safetensors) distribuido en un repo de 4,2 GB, con pesos en formato GGUF pensados para inferencia en navegador mediante wllama y llama.cpp (build b11364).

El objetivo declarado no es ofrecer un modelo de produccion, sino medir memoria y velocidad de ejecucion en una pestana de navegador. El propio autor advierte que el modelo esta "barely healed": divaga y repite, lo que lo situa lejos de un uso generalista fiable. Su relevancia es, por tanto, la de una pieza de investigacion reproducible sobre poda y destilacion de modelos Gemma 4 en entornos de recursos extremadamente limitados.

La ficha se basa exclusivamente en la informacion disponible en la model card y en los metadatos de Hugging Face; muchos datos tecnicos (idiomas, benchmarks, pipeline) no estan publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Gemma 4 E2B-it (poda estructural: vocabulario de 80K tokens, hidden 1024, FFN al 42%, 31 de 35 capas) |
| Parametros totales | 1.312.263.455 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos GGUF; no se detallan los niveles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 4,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it` y aplica una poda estructural agresiva: reduce el vocabulario a 80K tokens, fija la dimension oculta en 1024, recorta la FFN al 42% de su tamano original y conserva 31 de las 35 capas, lo que deja un cuerpo de aproximadamente 0,6B parametros. Sobre esa base podada se realiza una destilacion parcial desde el modelo original sin recortar, con el fin de recuperar parte de la capacidad perdida. El autor describe el resultado como "barely healed", es decir, una recuperacion incompleta que se manifiesta en divagacion y repeticion.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de destilacion, ni si hubo fases de RLHF o DPO. Tampoco se detallan innovaciones de atencion o decodificacion. El enfasis tecnico esta en el pipeline de poda mas destilacion y en la compatibilidad con llama.cpp b11364 y wllama para ejecucion en navegador.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base instruct (`-it`), aunque con calidad degradada por la poda.
- Razonamiento y codigo: no hay evidencia publicada de rendimiento en estas tareas tras la poda; el autor advierte de divagacion y repeticion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la tendencia a repetir lo hace poco adecuado.
- Capacidades multilingues: no disponibles (no se listan idiomas).
- Capacidades especiales: ejecucion en navegador via wllama; el modelo esta etiquetado como `endpoints_compatible` y `conversational`.

## Casos de uso

- Banco de pruebas de inferencia en navegador: sirve para medir memoria y velocidad de un modelo GGUF dentro de una pestana con wllama, que es el objetivo declarado del autor.
- Investigacion sobre poda y destilacion: permite reproducir y comparar el efecto de recortar vocabulario, capas y FFN en un modelo Gemma 4, usando el repositorio de experimentos del autor como referencia.
- Pruebas de integracion con llama.cpp: util para validar pipelines de carga y ejecucion con builds concretas (b11364) en entornos de bajos recursos.
- Demos educativas de LLM en el navegador: su tamano reducido facilita mostrar el funcionamiento de un modelo generativo sin infraestructura de servidor.
- Evaluacion de degradacion por poda: sirve como caso negativo de referencia para medir divagacion y repeticion frente al modelo base sin recortar.
- Prototipado de interfaces conversacionales offline: permite probar la UX de un chat local en el navegador antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; con 1.312.263.455 parametros, una cuantizacion de 4 bits rondaria los 0,7-0,8 GB de pesos, y 8 bits alrededor de 1,3 GB, mas overhead de contexto (estimacion a partir del recuento de parametros, no publicada por el autor).
- GPU recomendadas: no disponibles; el enfoque declarado es CPU/navegador mediante wllama, no GPU dedicada.
- Compatibilidad con GPU de consumo: por tamano, cabria en cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante), aunque no hay datos oficiales de soporte.
- Opciones de despliegue: llama.cpp (build b11364 citada) y wllama en navegador; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, sin detalle adicional.
- Latencia y throughput: no disponibles; el autor solo indica que el modelo se construyo para medir memoria y velocidad, sin publicar cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| kealjones/tiny-gemma4-test | 1.312.263.455 | no disponible | Apache 2.0 | Experimental, calidad degradada |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | no disponible | Modelo instruct original, sin podar |
| Otros modelos ~0,6B podados | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la informacion disponible |

La comparacion directa con el modelo base es la mas relevante: tiny-gemma4-test conserva 31 de 35 capas, hidden 1024 y FFN al 42%, y su calidad es inferior por diseno. No se dispone de datos de rendimiento del base ni de terceros para cuantificar la diferencia.

## Limitaciones y advertencias

- Calidad degradada por diseno: el autor indica explicitamente que el modelo "barely healed", divaga y repite.
- No apto para produccion ni para tareas que requieran fiabilidad conversacional o de razonamiento.
- Riesgo elevado de alucinacion y de bucles repetitivos por la poda y la destilacion incompleta.
- Sin datos publicados de idiomas, contexto, cuantizaciones ni benchmarks; imposible evaluar su comportamiento fuera del caso de prueba en navegador.
- Licencia Apache 2.0, que permite uso comercial, pero el estado experimental y la calidad hacen desaconsejable ese uso.
- Dependencia de builds concretas de llama.cpp (b11364) y de wllama; posibles incompatibilidades con versiones futuras.
- Repo de 4,2 GB para un modelo de 1,3B parametros, lo que sugiere artefactos adicionales o pesos sin comprimir; conviene revisar los ficheros antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/kealjones/tiny-gemma4-test
- Notas de experimentos: https://github.com/KealJones/lm-experiments/tree/main/experiments/tiny-gemma4
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
