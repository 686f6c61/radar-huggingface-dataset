# doth4580/Naive-N0.5-Flash-EXL3-3.5bpw

## Resumen

Naive-N0.5-Flash-EXL3-3.5bpw es una cuantización EXL3 (trellis de ExLlamaV3) a 3,5 bits por peso del modelo Naive-N0.5-Flash, desarrollado por el equipo NaiveAI. Se trata de un transformer de tipo mezcla de expertos (MoE) con 309.000 millones de parámetros totales y 15.500 millones activos por token, con una ventana de contexto nativa de 1 millón de tokens. El modelo original se construye sobre MiMo-V2.5 de Xiaomi e incorpora DeepSeek Sparse Attention.

El interés de este artefacto concreto es de índole práctica: reduce el peso del modelo desde los aproximadamente 315 GB de la versión FP8 original hasta unos 137 GB (128 GiB), lo que permite servirlo en hardware de gama relativamente modesta. En concreto, el autor lo ha validado sobre dos o cuatro máquinas NVIDIA DGX Spark (GB10) mediante el motor veloGB10, con paralelismo tensorial TP=2 o TP=4. Ninguna GB10 individual puede alojar el modelo.

La ficha técnica del repositorio indica 70.225.308.352 parámetros en los safetensors, un dato que no concuerda con los 309.000 millones declarados en la model card; esta discrepancia se detalla en la sección de limitaciones. La licencia es MIT, heredada del modelo base, y el tokenizador y la plantilla de chat se mantienen sin cambios respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con DeepSeek Sparse Attention, basado en MiMo-V2.5 de Xiaomi |
| Parametros totales | 309.000 millones (según model card); 70.225.308.352 según safetensors |
| Parametros activos | 15.500 millones |
| Longitud de contexto | 1.000.000 de tokens nativa; servido con `--max-seq-len 262144` en la receta del autor |
| Tipos de cuantizacion | EXL3 trellis a 3,5 bpw (expertos y atención); existe una variante hermana a 4 bpw (expertos 4 / atención 6) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con cuantización EXL3 (librería `trellis`, `custom_code`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 309.000 millones de parámetros totales y 15.500 millones activos, construido sobre MiMo-V2.5 de Xiaomi e incorporando DeepSeek Sparse Attention, lo que habilita su contexto nativo de 1 millón de tokens. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

Este artefacto es exclusivamente una cuantización: los pesos se han convertido desde la versión pública en FP8 (NaiveAI/Naive-N0.5-Flash-FP8) mediante las herramientas de exllamav3, a través del fork de vcruz305, adaptadas a esta arquitectura y ejecutadas sobre 8×H100. La cuantización es de tipo trellis a 3,5 bits por peso. El tokenizador y la plantilla de chat no se han modificado. El autor reporta una puerta de precisión forward-only en exllamav3 con NLL de 1,619 nats/token frente a 1,627 del bf16 de referencia, además de mantener probabilidad 1,000 en dos comprobaciones de siguiente token sobre prefijos de código y JSON.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking) activado por defecto en las pruebas del autor.
- Generación de código, incluyendo turnos de código medidos en el benchmark del pack.
- Contexto largo: ventana nativa de 1 millón de tokens, con 262.144 tokens configurados en la receta de servicio.
- Decodificación especulativa mediante un drafter FP8 opcional (NaiveAI/Naive-N0.5-Flash-FP8-Draft), con tasas de aceptación del 28,9 % (TP=2) y 34,7 % (TP=4).
- Servicio mediante API compatible con OpenAI (`/v1/models`, `/v1`), lo que facilita la integración con clientes existentes.
- Soporte de caché de prefijos (`--prefix-cache on`) para reutilización de contexto entre peticiones.
- Capacidades multilingües: no disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos extensos: con 1 millón de tokens de contexto nativo y 262.144 configurados en la receta, el modelo puede ingerir contratos, expedientes o bases de código completas en una sola petición sin fragmentación.
- Asistencia de código en entornos con hardware limitado: el pack de 137 GB permite desplegar un modelo de 309.000 millones de parámetros en dos DGX Spark en lugar de requerir un clúster de GPUs de数据中心, manteniendo turnos de código a 40 tok/s (TP=2) y 80 tok/s (TP=4).
- Servicio de API interna compatible con OpenAI: el motor veloGB10 expone `/v1`, de modo que herramientas que ya consumen la API de OpenAI pueden apuntar al endpoint sin cambios en el cliente.
- Analítica sobre corpus técnicos largos con caché de prefijos: en escenarios donde muchas consultas comparten el mismo documento de referencia, `--prefix-cache on` evita reprocesar el prefijo en cada petición.
- Prototipado e investigación en entornos de laboratorio con nodos GB10: la receta TP=2 y TP=4 documentada permite reproducir el despliegue con comandos concretos y sin copia del modelo en los nodos trabajadores.
- Evaluación de cuantización agresiva: el pack sirve como referencia para estudiar la degradación de un MoE de 309.000 millones de parámetros a 3,5 bpw, con métricas de NLL y probabilidades de siguiente token publicadas frente al bf16.

## Benchmarks y rendimiento

Rendimiento medido con veloGB10 sobre GB10 (2026-11-09, builds 0.7.7), muestreo de producción, thinking activado, decodificación en tokens de salida por segundo incluyendo decodificación especulativa. Una ejecución por celda, variación aproximada de ±10 %.

| Topologia | Fuente del drafter | Decode turno de codigo | Decode turno de relato | Mediana decode todos los turnos | Prefill (tok/s) | 2 peticiones, agregado | Aceptacion del drafter |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=2 | Naive S8 FP8 drafter | 40 | 31 | 33 | 761 | 46 | 28,9 % |
| TP=4 | Naive S8 FP8 drafter | 80 | 46 | 50 | 1.077 | 69 | 34,7 % |

Precisión medida el 2026-10-19 con puerta forward-only en exllamav3 (NLL con teacher forcing sobre un texto técnico de 977 tokens; probabilidad del siguiente token tras dos prefijos de código/JSON), usando el modelo sin cuantizar en `transformers` como referencia:

| Modelo | Fuente | NLL (nats/token) | p(sangrado de 8 espacios tras `if n < 0:`) | p(`age`) en clave JSON |
|---|---|---|---|---|
| Naive-N0.5-Flash bf16, `transformers` | bf16 | 1,627 | 1,000 | 1,000 |
| Este pack (3,5 bpw) | FP8 | 1,619 | 1,000 | 1,000 |
| Pack hermano EXL3 4 bpw (expertos 4 / atención 6) | bf16 | 1,634 | 1,00 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el pack ocupa aproximadamente 137 GB (128 GiB) frente a unos 315 GB del FP8 original.
- Una sola GB10 no puede alojar el modelo; el motor lo rechaza en el arranque. Solo se soportan TP=2 y TP=4.
- TP=2: dos máquinas NVIDIA DGX Spark (GB10); el nodo secundario no necesita copia del modelo, recibe su partición por red y la cachea localmente.
- TP=4: cuatro máquinas GB10, con tres nodos secundarios ejecutando `./gb10_inference --node --port 29500`.
- Red: en equipos con dos pares de puertos RoCE activos, seleccionar el par con `--rdma-dev <rail1>,<rail2>`; con un solo par la detección es automática.
- Opciones de despliegue: motor veloGB10 (binario autónomo, servidor compatible con OpenAI en `http://<head-ip>:9000/v1`); la cuantización se genera con exllamav3 y el fork vcruz305. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Parámetros de servicio probados: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--prefix-cache on`.
- Throughput: prefill de 761 tok/s en TP=2 y 1.077 tok/s en TP=4; decode mediano de 33 y 50 tok/s respectivamente, con agregado de 46 y 69 tok/s para dos peticiones simultáneas.
- Decodificación especulativa opcional con el drafter Naive S8 FP8 (`--draft-dir`), que aporta las tasas de aceptación indicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este pack (Naive-N0.5-Flash EXL3 3,5 bpw) | 309.000 M totales / 15.500 M activos | 1.000.000 nativo; 262.144 servido | EXL3 3,5 bpw, ~137 GB | MIT | Hugging Face, 2.950 descargas |
| Naive-N0.5-Flash-EXL3-4bpw (hermano) | 309.000 M totales / 15.500 M activos | 1.000.000 nativo | EXL3 4 bpw (expertos 4 / atención 6) | MIT | Hugging Face (doth4580) |
| Naive-N0.5-Flash-FP8 (original) | 309.000 M totales / 15.500 M activos | 1.000.000 nativo | FP8, ~315 GB | MIT | Hugging Face (NaiveAI) |
| Naive-N0.5-Flash bf16 (referencia) | 309.000 M totales / 15.500 M activos | 1.000.000 nativo | bf16 | MIT | Hugging Face (NaiveAI) |

No se dispone de datos de benchmarks estándar para comparar el rendimiento frente a modelos de otras familias.

## Limitaciones y advertencias

- Discrepancia de parámetros: la model card declara 309.000 millones totales y 15.500 millones activos, mientras que los safetensors del repositorio registran 70.225.308.352 parámetros. Conviene verificar la cifra real antes de dimensionar infraestructura.
- Pesos modificados: es una cuantización trellis a 3,5 bpw; aunque las métricas de NLL publicadas son prácticamente idénticas al bf16, no se han publicado evaluaciones en benchmarks estándar que confirmen la equivalencia en tareas complejas.
- Requisito de hardware muy específico: solo funciona en topologías TP=2 o TP=4 sobre GB10 con el motor veloGB10; no hay soporte documentado para vLLM estándar, llama.cpp, Ollama o TGI, pese a la etiqueta `vllm` del repositorio.
- Licencia del servidor: `vllm-exl3` es AGPL-3.0, lo que es relevante si se expone el servidor a terceros, aunque los pesos del modelo sean MIT.
- Idiomas soportados no documentados; no hay información sobre cobertura multilingüe ni sobre sesgos conocidos.
- Riesgo de alucinación: no cuantificado en la información disponible; aplica el riesgo habitual de los modelos generativos.
- Sin datos sobre tool calling, function calling ni capacidades de agente; no deben asumirse.
- Rendimiento medido con una sola ejecución por celda y variación de ±10 %, sobre builds de desarrollo de veloGB10 0.7.7, no sobre una versión estable.
- El contexto servido en la receta (262.144 tokens) es inferior al millón nativo; usar la ventana completa requiere ajustar la configuración y probablemente más recursos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Naive-N0.5-Flash-EXL3-3.5bpw
- Modelo base: https://huggingface.co/NaiveAI/Naive-N0.5-Flash
- Licencia del modelo base: https://huggingface.co/NaiveAI/Naive-N0.5-Flash/blob/main/LICENSE
- Versión FP8 de origen: https://huggingface.co/NaiveAI/Naive-N0.5-Flash-FP8
- Drafter FP8: https://huggingface.co/NaiveAI/Naive-N0.5-Flash-FP8-Draft
- Pack hermano EXL3 4 bpw: https://huggingface.co/doth4580/Naive-N0.5-Flash-EXL3-4bpw
- Receta de despliegue en 2× DGX Spark: https://github.com/sf-stav/Naive-N0.5-Flash-EXL3-2x-DGX-Spark
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- Herramientas exllamav3: https://github.com/turboderp-org/exllamav3
- Fork de exllamav3 usado: https://github.com/vcruz305/exllamav3
- vllm-exl3 (AGPL-3.0): https://github.com/vcruz305/vllm-exl3
- MiMo-V2.5 de Xiaomi: https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Base
