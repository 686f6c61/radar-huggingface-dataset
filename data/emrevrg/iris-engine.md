# emrevrg/iris-engine

## Resumen

IRIS (identificador `emrevrg/iris-engine`) no es un modelo de lenguaje, sino un motor de inferencia distribuido y sin perdida (bit-exact) publicado por el autor emrevrg bajo el sello Norovox Labs. Su proposito es ejecutar cualquier modelo de HuggingFace dentro de un presupuesto de memoria ajustado sin sacrificar exactitud: los bits de los pesos nunca se descartan, sino que se cargan de forma selectiva capa por capa y se liberan al dejar de usarse. El resultado es que el pico de memoria equivale a una sola capa (o fragmento) y no al tamano completo del modelo, con una salida identica a nivel de logit respecto a una carga completa en memoria.

El motor se posiciona como alternativa a soluciones de offload como AirLLM y Colibri, a las que atribuye comportamiento potencialmente con perdida; en sus propias mediciones IRIS reporta una fraccion bit-exacta de 1,0 (48/48 frente a 28/48 de Colibri) y un coste de lectura de disco de 0,66 GB por token, 7,4 veces inferior a los 2,62 GB de AirLLM. Ademas, a diferencia de esas herramientas, plantea escalado en N nodos, no solo en una unica maquina.

Es relevante en el contexto actual porque la ejecucion de modelos grandes en hardware limitado suele implicar cuantizacion o tecnicas con perdida; IRIS propone una via de distribucion y streaming sin alterar los pesos, lo que interesa a quien necesita reproducibilidad exacta. El repositorio no tiene descargas ni "likes" y el modelo se publico con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: es un motor de inferencia, no un modelo. Ejecuta modelos ajenos (transformer, MoE, etc.) sin modificarlos |
| Parametros totales | No disponible (depende del modelo que se ejecute; el ejemplo del autor usa Qwen2.5-7B) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (heredada del modelo subyacente) |
| Tipos de cuantizacion | No disponible. El motor trabaja sobre los pesos originales de forma bit-exacta; no comprime ni cuantiza |
| Idiomas soportados | tr, en (segun las etiquetas del repositorio; en la practica, los del modelo subyacente) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible. Carga modelos de HuggingFace; no se detallan los formatos concretos soportados (safetensors, GGUF, etc.) |

## Arquitectura y entrenamiento

IRIS no es un modelo entrenado, por lo que no hay datos de entrenamiento, dataset ni fases de RLHF/DPO que describir. Se trata de una libreria (`library_name: iris-engine`, instalable como `iris-engine` o desde fuente con `pip install ./iris`) que envuelve modelos existentes. Su funcionamiento se articula en tres fases descritas por el autor: (1) dividir el modelo a nivel de capa o tensor; (2) hacer streaming de cada fragmento a memoria solo cuando se necesita y liberarlo despues, sin offload a disco; y (3) recomponer la ejecucion de forma que la misma secuencia de pesos produzca un resultado identico al del modelo cargado por completo.

La innovacion tecnica declarada es precisamente esa garantia de bit-exactitud: el autor afirma que el limite de compresion sin perdida de pesos de alta entropia ronda 1,3x (un limite fisico), por lo que IRIS no promete comprimir, sino distribuir y hacer streaming sin perdida. La API incluye una funcion `verify_bit_exact` que devuelve metricas como `max_logit_abs_diff`, `bit_exact_fraction` y `next_token_identical` para comprobar la equivalencia frente a una carga completa. Segun la documentacion, el footprint integrado es model/N con N ilimitado, lo que habilita ejecucion distribuida en varios nodos ademas de en una sola maquina.

## Capacidades

- Motor de inferencia genérico: ejecuta modelos de HuggingFace sin requerir modificacion de sus pesos.
- Salida bit-exacta (bit-birebir): replica a nivel de logit la salida de una carga completa en memoria, con `max_logit_abs_diff: 0.0` segun el autor.
- Carga selectiva capa por capa con liberacion posterior, manteniendo el pico de memoria en una sola capa o fragmento.
- Ejecucion bajo presupuesto de memoria: pensado para entornos con RAM/VRAM limitada, usando disco como fuente de pesos sin offload tradicional.
- Escalado distribuido: reparto entre N nodos, no limitado a una unica maquina.
- Verificacion integrada: comando `iris verify` y funcion `verify_bit_exact` para auditar la exactitud.
- CLI y API de Python: `iris run ...` y clases como `IrisModel` para generar texto.
- Uso de GPU si esta disponible, con reserva a memoria de sistema en caso contrario.
- Idiomas: segun lo declarado, turco e ingles (dependen del modelo subyacente).

## Casos de uso

- Inferencia de modelos grandes en hardware limitado: ejecutar un modelo de 7B u otros con un pico de memoria equivalente a una capa, util en portatiles o instancias pequenas donde no cabe el modelo completo.
- Reproducibilidad exacta en investigacion: cuando se necesita que la salida coincida bit a bit con la de una carga completa (por ejemplo, para replicar experimentos), la funcion `verify_bit_exact` permite auditar esa equivalencia.
- Despliegue distribuido multinodo: repartir la carga de pesos entre N nodos para servir modelos que no caben en una sola maquina, ampliando la capacidad sin cuantizar.
- Entornos con presupuesto de VRAM ajustado: al no requerir el modelo entero en memoria, encaja en GPUs de gama media o en configuraciones conmemoria muy limitada, evitando recurrir a cuantizacion con perdida.
- Comparacion y validacion de tecnicas de offload: sirve como referencia bit-exacta frente a herramientas con perdida como AirLLM o Colibri en pruebas de calidad de salida.
- Servicio de generacion de texto con requisitos de fidelidad: escenarios donde una degradacion por cuantizacion es inaceptable (por ejemplo, replicar un modelo de referencia) y se prioriza la exactitud sobre el throughput.
- Prototipado en cuadernos como Kaggle o Colab: el autor indica que sus mediciones se realizaron en esos entornos, lo que sugiere su uso en notebooks con recursos acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes). Los unicos datos de rendimiento aportados por el autor son comparativos entre motores de inferencia:

| Metrica | AirLLM | Colibri | IRIS |
|---|---|---|---|
| Calidad | Puede ser con perdida | Streaming con perdida | Bit-exacto (0,0) |
| Coincidencia con carga completa (mismo footprint) | no disponible | 28/48 exactos | 48/48 exactos |
| Lectura de disco por token | 2,62 GB | no disponible | 0,66 GB (7,4x menos) |
| Escala | Una maquina | Una maquina | Una maquina + N nodos distribuidos |

El autor indica que estas mediciones provienen de ejecuciones reales en la nube (Kaggle/Colab) y que pueden reproducirse con `iris verify`, pero no se detallan modelos, hardware ni condiciones exactas.

## Requisitos de hardware

- VRAM/RAM para inferencia: el autor afirma que el pico de memoria equivale a una sola capa o fragmento, no al modelo completo. No se publican cifras concretas de VRAM; dependen del modelo ejecutado y del nivel de particionado elegido.
- GPU recomendadas: no disponible. El motor usa GPU si esta presente, pero no se listan modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmado explicitamente. El diseno (pico de memoria de una capa) apunta a que podria caber en GPUs de consumo para modelos de tamano moderado, pero no hay cifras que lo respalden.
- Escalado: soporta despliegue en una maquina y en N nodos distribuidos, segun el autor.
- Opciones de despliegue: CLI (`iris run`), API de Python (`IrisModel`) y verificacion (`iris verify`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. Solo se reporta el coste de lectura de disco por token (0,66 GB/token) en comparacion con AirLLM (2,62 GB/token).

## Comparativa con modelos similares

IRIS no es un modelo, sino un motor; su comparacion natural es con otras herramientas de offload de inferencia. Los datos proceden de la tabla del propio autor:

| Herramienta | Exactitud | Coincidencia (mismo footprint) | Lectura disco/token | Escala | Licencia |
|---|---|---|---|---|---|
| IRIS | Bit-exacta | 48/48 | 0,66 GB | Una maquina + N nodos | Apache-2.0 |
| AirLLM | Puede ser con perdida | no disponible | 2,62 GB | Una maquina | no disponible en la informacion |
| Colibri | Streaming con perdida | 28/48 | no disponible | Una maquina | no disponible en la informacion |

No se dispone de datos de licencia ni de version de AirLLM y Colibri en la informacion proporcionada. El autor no aporta comparaciones frente a otras soluciones de streaming o cuantizacion como llama.cpp, vLLM o tecnicas GGUF/AWQ.

## Limitaciones y advertencias

- No es un modelo: no genera conocimiento propio; su calidad, idiomas y capacidades dependen enteramente del modelo de HuggingFace que ejecute.
- Madurez y adopcion: el repositorio tiene 0 descargas y 0 "likes", sin evidencia de uso en produccion por terceros.
- Metricas autodeclaradas: los datos de bit-exactitud y rendimiento los aporta el propio autor y no se han verificado de forma independiente en la informacion disponible.
- Coste de E/S: pese a ser inferior al de AirLLM, el motor sigue leyendo 0,66 GB de disco por token, lo que puede lastrar la latencia frente a modelos cargados por completo en memoria.
- Sin datos de benchmarks de calidad: no hay resultados tipo MMLU/HumanEval que permitan situar el rendimiento real en tareas.
- Formatos y compatibilidad: no se detalla que formatos de pesos soporta ni si funciona con todas las arquitecturas (MoE, SSM, hibridas).
- Idiomas: solo se declaran turco e ingles; el soporte multilingue real dependera del modelo usado.
- Licencia: Apache-2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo subyacente que se ejecute.
- Estado del software: la propia documentacion menciona `pip install iris-engine # yayinlandiginda` ("cuando se publique"), lo que sugiere que el paquete puede no estar disponible aun en PyPI.
- Fechas: la fecha de creacion indicada (2026-09-19) es posterior a la actual, un dato anomalo a tener en cuenta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/emrevrg/iris-engine
- Organizacion/autor: emrevrg (Norovox Labs, segun la model card)
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
