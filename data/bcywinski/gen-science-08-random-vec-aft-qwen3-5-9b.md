# bcywinski/gen-science-08-random-vec-aft-qwen3.5-9b

## Resumen

`bcywinski/gen-science-08-random-vec-aft-qwen3.5-9b` es un conjunto de adaptadores de investigacion (no un modelo completo) construido sobre `Qwen/Qwen3.5-9B`. Lo publica el usuario `bcywinski` como parte del experimento 08 de un trabajo denominado "gen-science" sobre generalizacion durante el midtraining. El artefacto no es un modelo afinado para uso general, sino una matriz de 18 adaptadores LoRA de rango 1 sobre la proyeccion `down_proj` de una unica capa (la capa 9), entrenados con una senal de condicionamiento basada en vectores aleatorios.

El objetivo experimental es medir si un adaptador AFT (activation fine-tuning) puede aprender a asociar la presencia de una senal vectorial inyectada en tokens concretos (nombres de quesos en posiciones X1 y X2) con un comportamiento condicionado, evaluable despues mediante la herramienta `name_steer`. La matriz cruza tres intensidades de senal (`alpha` 1,9978 / 4,9945 / 9,9891, etiquetadas k6, k15 y k30), tres sorteos independientes de vectores aleatorios (d0, d1, d2) y dos variantes del adaptador (aftA y aftB).

Por su naturaleza, este repositorio es relevante para investigadores que trabajan en interpretabilidad, steerability y generalizacion de senales de condicionamiento en modelos grandes, no para desarrolladores que buscan un modelo listo para produccion. El repositorio pesa 0,0 GB (adaptadores de rango 1) y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA de rango 1 sobre `down_proj` de la capa 9 de Qwen3.5-9B (transformer denso, arquitectura del modelo base no detallada en la informacion disponible) |
| Parametros totales | No disponible para el modelo base; los adaptadores son de rango 1 sobre una unica capa (tamano minimo, repositorio de 0,0 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors; la cuantizacion del modelo base no se especifica) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores `adapter_model`); el modelo base se carga por separado |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.5-9B`, un transformer denso de aproximadamente 9.000 millones de parametros. Sobre el se aplica un unico adaptador de bajo rango (rank 1) sobre la matriz `down_proj` de la capa 9, lo que constituye una intervencion minima en terminos de parametros y de huella de memoria. El entrenamiento se realiza sobre las filas "colour-free AFT" del dataset `bcywinski/gen-science-03-aft-rows-cheese`, con semilla 0.

La innovacion del experimento reside en el mecanismo de condicionamiento: durante el entrenamiento se suma un vector unitario aleatorio `A x alpha` en cada token que representa un nombre de queso en la posicion X1 y un vector independiente `B x alpha` en cada token de la posicion X2, inyectados en la capa inmediatamente anterior a la capa del adaptador. La matriz de adaptadores cubre tres magnitudes de `alpha` (1,9978, 4,9945 y 9,9891), tres sorteos de vectores (d0, d1, d2) y dos variantes (aftA y aftB), con una tasa de aprendizaje de 2e-2 y 10 capas de contexto de senal (`L10`). La evaluacion se realiza con la misma senal de condicionamiento mediante `src/colour_steer/name_steer.py`, y los vectores utilizados se incluyen en el directorio `vectors/` del repositorio. No se detalla el volumen de tokens de entrenamiento ni si hubo fases de RLHF o DPO, que en cualquier caso no aplican a un adaptador de este tipo.

## Capacidades

- No es un modelo generativo autonomo: es un conjunto de adaptadores de investigacion que deben cargarse junto con `Qwen/Qwen3.5-9B`.
- Condicionamiento por vector: permite inyectar una senal vectorial en tokens de nombre de queso en posiciones X1 y X2 y evaluar la respuesta del adaptador con `name_steer`.
- Barrido controlado de intensidad de senal: 18 adaptadores que cubren tres valores de `alpha` y tres sorteos de vectores, lo que permite analizar sensibilidad a la magnitud y a la direccion de la senal.
- Herramientas de evaluacion incluidas: script `name_steer.py` y vectores en `vectors/` para reproducir el protocolo experimental.
- Todas las demas capacidades (generacion de texto, codigo, matematicas, tool calling, agentes, vision, audio, modo thinking) dependen exclusivamente del modelo base y no han sido caracterizadas en la informacion disponible para este repositorio.

## Casos de uso

- Investigacion en steerability: cargar cada adaptador junto al modelo base e inyectar los vectores de `vectors/` con distintos valores de `alpha` para medir como responde la capa 9 a senales de condicionamiento de distinta magnitud.
- Estudios de generalizacion en midtraining: comparar los resultados de los sorteos d0, d1 y d2 para evaluar si el adaptador aprende la asociacion vectorial o memoriza una direccion concreta.
- Reproduccion de experimentos: el repositorio incluye hashes sha256 por adaptador y la configuracion `configs/paper/08_random_vec_aft/`, lo que permite verificar la integridad de cada checkpoint y replicar el setup.
- Analisis de intervenciones minimas: al tratarse de un adaptador de rango 1 sobre una sola capa, es util para estudiar el impacto de perturbaciones de baja dimension en el comportamiento del modelo.
- Docencia y formacion en interpretabilidad: sirve como ejemplo practico de inyeccion de activaciones y evaluacion con herramientas de steering en un modelo de 9B.
- Base para experimentos derivados: los adaptadores pueden reutilizarse como punto de partida para comparar con otras tecnicas de condicionamiento (por ejemplo, prefijos o adaptadores de mayor rango).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio de adaptadores pesa 0,0 GB; el coste real lo determina el modelo base `Qwen/Qwen3.5-9B`.
- Para inferencia del modelo base en precision completa (BF16) se estiman aproximadamente 18 GB de VRAM solo para pesos, mas memoria para el contexto y el runtime; no se dispone de cifras oficiales en la informacion proporcionada.
- En cuantizacion de 8 bits se puede estimar en torno a 9-10 GB de VRAM, y en 4 bits en torno a 5-6 GB, aunque estas cifras son estimaciones generales y no estan confirmadas para este modelo.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion sin restricciones; RTX 4090 (24 GB) o RTX 3090 (24 GB) para BF16 con contexto moderado; GPUs consumer de 8-16 GB requeririan cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama para el modelo base; los adaptadores LoRA se cargan con las utilidades de PEFT/Hugging Face. No se especifica compatibilidad con cada runtime en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bcywinski/gen-science-08-random-vec-aft-qwen3.5-9b` | Adaptadores de rango 1 sobre Qwen3.5-9B | No disponible | Adaptadores de investigacion (AFT) | MIT | Hugging Face, 0 descargas |
| `Qwen/Qwen3.5-9B` | ~9B | No disponible | Modelo base denso | No disponible en la informacion | Hugging Face |
| `bcywinski/gen-science-03-aft-rows-cheese` | Dataset de filas AFT | No aplica | Dataset de entrenamiento | No disponible | Hugging Face |

No se dispone de informacion sobre otros adaptadores o modelos directamente comparables del mismo autor o del mismo experimento.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es un artefacto de investigacion con adaptadores de rango 1 sobre una unica capa, sin evaluacion de calidad generativa.
- El condicionamiento depende de un protocolo muy especifico (tokens de nombre de queso en posiciones X1/X2 y vectores concretos); fuera de ese setup el comportamiento no esta caracterizado.
- No hay datos publicados de benchmarks, sesgos, tasas de alucinacion ni evaluaciones multilingues para este repositorio.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso o validacion por parte de la comunidad.
- La licencia MIT se aplica al repositorio de adaptadores; el uso comercial del modelo base `Qwen3.5-9B` depende de la licencia de dicho modelo, que no se detalla en la informacion disponible.
- La fecha de creacion indicada (2026-10-25) y la actualizacion (2026-11-01) deben tratarse con cautela si se contrastan con el calendario real de publicaciones.
- No se especifican los idiomas soportados ni el contexto maximo, por lo que cualquier uso en produccion requeriria verificar primero el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bcywinski/gen-science-08-random-vec-aft-qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de filas AFT: https://huggingface.co/datasets/bcywinski/gen-science-03-aft-rows-cheese
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo o demos adicionales.
