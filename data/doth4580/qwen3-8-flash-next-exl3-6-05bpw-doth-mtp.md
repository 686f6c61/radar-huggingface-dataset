# doth4580/Qwen3.8-Flash-Next-EXL3-6.05bpw-DotH-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-6.05bpw-DotH-MTP es un paquete de pesos cuantizados del modelo Qwen3.8-Flash-Next del equipo Qwen, publicado por el usuario doth4580. No se trata de un modelo entrenado desde cero, sino de una redistribucion de la cuantizacion EXL3 de turboderp (rama `6.05bpw_h6_ng6`, generada con exllamav3) a la que se anade una cabeza draft para decodificacion especulativa. El resultado es un artefacto listo para servir con el motor veloGB10 sobre una, dos o cuatro maquinas NVIDIA DGX Spark / GB10.

El modelo subyacente es un transformer de tipo mixture-of-experts (MoE) con 49.947.040.512 parametros totales segun los safetensors del repositorio, y admite una longitud de contexto de hasta 262.144 tokens segun los flags de despliegue documentados. La contribucion del autor se limita a la cuantizacion, el empaquetado, las pruebas y las instrucciones de despliegue; los derechos del modelo, la arquitectura y la documentacion original permanecen con el equipo Qwen bajo la licencia Qwen Community 1.0.

La relevancia de este paquete es practica: demuestra que un modelo MoE de ~50.000 millones de parametros puede servirse en hardware de clase GB10 mediante tensor parallelism, con decodificacion especulativa integrada y una tasa de aceptacion del draft en torno al 72 %. Para desarrolladores que evaluan despliegues en clústeres pequenos de DGX Spark, es una referencia concreta de rendimiento medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 49.947.040.512 (~49,95 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens (`--max-seq-len 262144`) |
| Tipos de cuantizacion | EXL3 6.05 bpw (variante `6.05bpw_h6_ng6` de turboderp); el head draft va en el mismo formato EXL3 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0); el head draft de HermiHg es Apache-2.0 |
| Formato de pesos | safetensors con cuantizacion EXL3 (ExLlamaV3); indice `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE) y una cabeza de prediccion multi-token (MTP) que habilita decodificacion especulativa. El paquete no reentrena ni re-cuantiza el modelo: redistribuye byte a byte la cuantizacion EXL3 de turboderp en 6.05 bits por peso (variante `6.05bpw_h6_ng6`, revision `d2e238feca4c`), generada con exllamav3. La unica adicion es `zz_mtp_head_doth.safetensors`, que contiene los 59 tensores no-expertos de una cabeza MTP re-destilada por el autor y cuantizada con exllamav3 1.5.3 al layout y anchuras de la cabeza optimizada de HermiHg; la proyeccion del indexer se toma de HermiHg sin modificar. Los expertos enrutados de la capa MTP permanecen los del propio pack.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original. La innovacion tecnica destacable del paquete es la integracion de la cabeza draft dentro del propio repositorio: con `--mtp=auto`, el motor veloGB10 la usa para proponer tokens que el modelo completo verifica, de modo que la cabeza afecta solo a la velocidad y nunca a la salida. La decodificacion especulativa alcanza una tasa de aceptacion del 72,2 % en TP=2 y del 71,9 % en TP=4.

## Capacidades

- Generacion de texto autoregresiva con ventana de contexto de hasta 262.144 tokens.
- Decodificacion especulativa integrada mediante cabeza MTP, con verificacion completa de cada token propuesto.
- Servicio compatible con la API de OpenAI (`http://<head-ip>:9000/v1`) a traves de veloGB10.
- Soporte de procesamiento por lotes concurrente (`--max-batch`) y cache de prefijos (`--prefix-cache on`).
- Generacion de hasta 65.536 tokens por respuesta (`--max-tokens 65536`).
- Capacidades de razonamiento, codigo y matematicas: no documentadas de forma explicita en la informacion disponible, aunque el benchmark incluye turnos de codigo y de narracion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Servicio de inferencia en clúster de DGX Spark: el paquete esta disenado y probado para desplegarse en TP=2 o TP=4 sobre maquinas GB10 con el motor veloGB10, con un servidor OpenAI-compatible en el puerto 9000; es el escenario para el que se publica y el unico con rendimiento medido.
- Generacion de codigo en produccion: los benchmarks reportan 128 tok/s de decodificacion en turnos de codigo con TP=2 y 159 tok/s con TP=4, lo que lo hace adecuado para asistentes de codigo con latencia interactiva.
- Generacion de texto largo y narrativa: con 262.144 tokens de contexto y 65.536 tokens maximos de salida, puede mantener documentos extensos en ventana; los turnos de narracion rinden 66-85 tok/s.
- Procesamiento por lotes con cache de prefijos: la opcion `--prefix-cache on` y `--max-batch 2` permiten reutilizar prefijos comunes en cargas repetitivas, con 119-143 tok/s agregados en dos peticiones concurrentes.
- Evaluacion comparativa de motores de inferencia: al ser un pack EXL3 estandar, sirve para medir y comparar frameworks que lean el formato (ExLlamaV3, veloGB10) sobre el mismo modelo y cuantizacion.
- Despliegue multi-nodo con transferencia bajo demanda: los nodos no necesitan copia local del modelo; el head envia a cada nodo solo su parte de los pesos y la cachea, lo que simplifica el aprovisionamiento de clústeres efimeros.
- Investigacion sobre decodificacion especulativa: la cabeza MTP incluida y las tasas de aceptacion publicadas (~72 %) permiten estudiar el impacto del draft en latencia sin alterar la distribucion de salida.

## Benchmarks y rendimiento

Mediciones de VeloBench contra la API servida en maquinas NVIDIA DGX Spark / GB10 (2026-11-06, builds de desarrollo de veloGB10 0.7.7), con muestreo de produccion, thinking activado y una peticion a la vez salvo en la columna agregada. Una ejecucion por celda; variacion aproximada de ±10 %.

| Topologia | Fuente del draft | Decode codigo (tok/s) | Decode narrativa (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=2 | DotH-MTP head | 128 | 66 | 80 | 2.972 | 119 | 72,2 % |
| TP=4 | DotH-MTP head | 159 | 85 | 100 | 3.600 | 143 | 71,9 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El pack no cabe en una sola GB10 (128 GB) junto con su memoria de trabajo; requiere TP=2 o TP=4 como minimo.
- TP=2: dos maquinas NVIDIA DGX Spark / GB10, con un nodo auxiliar (`--node --port 29500`) y un head con el modelo.
- TP=4: cuatro maquinas GB10, con tres nodos auxiliares y un head.
- Tamano del repositorio: 139,1 GB; los nodos no necesitan copia local del modelo, reciben su parte por red y la cachean.
- Red: en equipos con dos pares de puertos RoCE activos, seleccionar el par con `--rdma-dev <rail1>,<rail2>`; con un solo par se detecta automaticamente.
- Motor de despliegue probado: veloGB10 (`gb10_inference`), binario autocontenido, servidor OpenAI-compatible.
- Otros motores: al ser formato EXL3 estandar, cualquier framework que lea EXL3 (por ejemplo ExLlamaV3) puede cargar los pesos, aunque no hay pruebas publicadas fuera de veloGB10.
- VRAM estimada por GPU: no disponible de forma desglosada.
- Latencia y throughput: 80-100 tok/s de mediana en decodificacion y 2.972-3.600 tok/s de prefill segun topologia (ver tabla de benchmarks).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-6.05bpw-DotH-MTP (este) | ~49,95 mil millones (MoE) | 262.144 | EXL3 6.05 bpw + cabeza MTP | qwen-community-1.0 | Incluye draft especulativo; probado en veloGB10 TP=2/TP=4 |
| doth4580/Qwen3.8-Flash-Next-EXL3-6.05bpw | ~49,95 mil millones (MoE) | 262.144 (segun configuracion) | EXL3 6.05 bpw | qwen-community-1.0 | Mismos pesos sin cabeza draft; solo cambia la velocidad |
| turboderp/Qwen3.8-Flash-Next-exl3 | ~49,95 mil millones (MoE) | no disponible | EXL3 (varias ramas bpw) | qwen-community-1.0 | Cuantizacion original de la que deriva este pack |
| Qwen/Qwen3.8-Flash-Next | ~49,95 mil millones (MoE) | no disponible | safetensors (BF16) | qwen-community-1.0 | Modelo original sin cuantizar |

No se dispone de datos de rendimiento de benchmarks estandar para establecer comparaciones de calidad con modelos de otras familias.

## Limitaciones y advertencias

- No es un modelo original: es una redistribucion cuantizada; los derechos y la licencia aplicable son los del modelo Qwen original (Qwen Community License 1.0), con posibles restricciones para uso comercial que deben revisarse en el enlace de licencia.
- La cabeza draft solo afecta a la velocidad, nunca a la salida, pero su tasa de aceptacion (~72 %) implica que aproximadamente un 28 % de los tokens propuestos se descartan, con el coste de computo asociado.
- El pack no cabe en una unica GB10; el despliegue exige al menos dos maquinas, lo que limita su uso fuera de clústeres.
- Solo hay rendimiento medido con veloGB10 en builds de desarrollo 0.7.7 y con una ejecucion por celda (±10 % de variacion); no hay validacion publicada en otros motores.
- No hay informacion sobre sesgos, riesgo de alucinacion ni comportamiento multilingue del modelo base en la documentacion proporcionada.
- La cuantizacion a 6.05 bpw puede degradar ligeramente la calidad respecto al modelo en BF16; no se han publicado evaluaciones de calidad comparativas.
- Idiomas soportados no documentados; no se debe asumir cobertura multilingue sin verificacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente nula.

## Enlaces

- Hugging Face (este pack): https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-6.05bpw-DotH-MTP
- Pack base sin cabeza draft: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-6.05bpw
- Cabeza MTP en BF16 del autor: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Cuantizacion EXL3 original de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- exllamav3: https://github.com/turboderp-org/exllamav3
