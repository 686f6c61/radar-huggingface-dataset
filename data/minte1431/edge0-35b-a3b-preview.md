# minte1431/Edge0-35B-A3B-preview

## Resumen

Edge0-35B-A3B-preview es un modelo de lenguaje sparse MoE de clase 35B publicado por el proyecto Edge0 (organizacion Edge0-AI), derivado del modelo base Qwen/Qwen3.5-MoE-35B-A3B. Su propuesta no es tanto el modelo en si como el pipeline de inferencia que lo acompana: el framework edge0, con backend MLX, que mantiene en memoria unicamente los pesos activos y transmite los expertos desde almacenamiento SSD bajo demanda. El resultado declarado es un checkpoint de 4 bits que se ejecuta con un pico de memoria activa de 2,9 GiB, a 14,9-17,7 tok/s de decodificacion, en un Mac mini M4 Pro con 24 GB de RAM.

La ficha de HuggingFace que se analiza aqui (minte1431/Edge0-35B-A3B-preview) es una copia alojada por un tercero del repositorio oficial Edge0/Edge0-35b-a3b-preview; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta y el 13 de septiembre de 2026 como fecha de creacion y ultima actualizacion. El peso real en safetensors es de 34.660.610.688 parametros (~34,7B), con 256 expertos por capa y 4 activos por token (K=4) repartidos en 40 capas y un tamano oculto de 2048.

Es relevante ahora porque ataca un cuello de botella concreto de la inferencia en el borde: el coste de memoria de un MoE grande. En lugar de reducir el modelo, mantiene el checkpoint completo en disco y lo transmite por expertos segun el enrutado, con un cabezal "prerouter" entrenado que predice el enrutado un paso por delante para solapar la carga de expertos con el forward pass (hasta +59 % de throughput de decodificacion declarado). Los adaptadores LoRA se entrenan por destilacion desde el profesor en fp16 para recuperar la perdida de cuantizacion, con una brecha declarada de 3,9 puntos de media frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sparse MoE (Qwen3.5-MoE), 40 capas, 256 expertos por capa, K=4 expertos activos por token, hidden size 2048 |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | No disponible de forma explicita; la nomenclatura A3B sugiere del orden de 3.000 millones, pero la model card no lo confirma |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (int4) sobre el checkpoint base; adaptadores LoRA y prerouter en precision propia |
| Idiomas soportados | No disponible; la model card indica que esta ajustado principalmente a los idiomas del modelo base, que no especifica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint base int4 para MLX + `lora_edge0_35b.safetensors` + `prerouter_edge0_35b.safetensors`); tamano del repositorio 19,7 GB |
| Framework de inferencia | edge0 (backend MLX) |
| Modelo base | Qwen/Qwen3.5-MoE-35B-A3B |

## Arquitectura y entrenamiento

El modelo es un MoE disperso de 40 capas con 256 expertos y 4 expertos activados por token (K=4), sobre un hidden size de 2048. El checkpoint distribuido no es el modelo original en fp16, sino una cuantizacion int4 acompanada de dos modulos entrenados especificamente para el framework edge0: los adaptadores LoRA de recuperacion y el cabezal prerouter. Los adaptadores permanecen sin fusionar, de modo que un unico checkpoint base de solo lectura puede servir a varios conjuntos de adaptadores sin recuantizar.

El entrenamiento combina dos piezas. Por un lado, Recover-LoRA: la base int4 se congela y los adaptadores LoRA se entrenan por destilacion desde el profesor en fp16, recuperando la mayor parte de la perdida de cuantizacion (brecha media de 3,9 puntos frente a fp16, segun las mediciones del autor). Por otro, el prerouter: un cabezal entrenado que predice el enrutado de expertos un paso por delante, de manera que las lecturas de expertos desde SSD se solapan con el forward pass en lugar de bloquearlo. El autor declara ganancias de hasta +59 % en throughput de decodificacion, mayores cuanto mayor es la latencia del almacenamiento, el tamano del modelo y el ancho enrutado K.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla el procedimiento exacto de destilacion mas alla de la descripcion anterior.

## Capacidades

- Generacion de texto conversacional con plantilla de chat incluida en el repositorio.
- Razonamiento matematico: 86,6 en AIME 2026 (int4) frente a 92,7 del base en fp16.
- Generacion de codigo: 90,9 en HumanEval (int4) frente a 95,1 en fp16.
- Razonamiento cientifico de nivel graduado: 79,8 en GPQA-Diamond (int4).
- Conocimiento general y multitema: 81,0 en MMLU-Pro (int4).
- Seguimiento de instrucciones: 57,9 en IFBench (int4).
- Modo de pensamiento (thinking) activable mediante la plantilla de chat incluida.
- Chat y razonamiento multilingue, limitado a los idiomas del modelo base.
- Tool calling y capacidades de agente: debiles en esta version preliminar, segun la propia model card; el uso de herramientas, la planificacion en varios pasos y la autonomia de horizonte largo no estan optimizados.
- Vision y audio: no disponibles.
- Inferencia con adaptadores LoRA intercambiables sobre una base de solo lectura.

## Casos de uso

- Inferencia en el borde sobre hardware con VRAM escasa: el checkpoint completo reside en almacenamiento rapido y solo los pesos activos ocupan memoria, con un pico declarado de 2,9 GiB. Es adecuado para portatiles, mini-PC y dispositivos con NVMe o flash interno rapida donde un MoE de 35B no cabria de otra forma.
- Servicio por lotes en una sola maquina de gama media: al mantener los adaptadores sin fusionar, una unica base de solo lectura puede servir varios conjuntos de LoRA sin recuantizar ni duplicar el almacenamiento de los pesos base.
- Asistente de chat local con razonamiento: la plantilla de chat incluida activa el modo thinking, y las puntuaciones en AIME 2026 (86,6) y GPQA-Diamond (79,8) lo hacen util para sesiones de resolucion de problemas paso a paso sin salir del dispositivo.
- Ayuda a la programacion en local: con 90,9 en HumanEval, puede emplearse para autocompletado, explicacion de fragmentos y generacion de tests dentro de un IDE, siempre que el contexto se mantenga corto para no engordar la cache KV.
- Despliegue de una API compatible con OpenAI en una maquina Apple Silicon: `edge0 serve` expone un endpoint HTTP en un puerto local, lo que permite integrar el modelo en herramientas que ya consumen la API de OpenAI sin dependencias en la nube.
- Procesamiento por lotes de prefill largo: con 113-140 tok/s de prefill, resulta practico para tareas donde la entrada es mucho mayor que la salida, como resumir documentos cortos o clasificar textos, manteniendo el coste de decodificacion en segundo plano.
- Evaluacion e investigacion sobre enrutado MoE: el prerouter entrenado y los adaptadores publicados permiten estudiar el impacto del offload por SSD en la calidad y la latencia dentro del framework edge0.
- Experimentacion con cuantizacion y destilacion: la pareja base int4 + Recuperacion LoRA sirve como caso de referencia para medir cuanto de la perdida de cuantizacion se recupera con adaptadores destilados en un MoE de este tamano.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con OpenCompass bajo ajustes identicos para ambos modelos. Escala maxima 100:

| Benchmark | edge0-35b (int4) | Qwen3.5-MoE 35B-A3B (fp16) |
|---|---:|---:|
| AIME 2026 | 86,6 | 92,7 |
| HumanEval | 90,9 | 95,1 |
| GPQA-Diamond | 79,8 | 81,8 |
| MMLU-Pro | 81,0 | 84,6 |
| IFBench | 57,9 | 61,7 |
| Media | 79,2 | 83,2 |

Rendimiento de inferencia declarado, medido con `examples/bench.py` en un Mac mini M4 Pro con 24 GB:

| Velocidad de decodificacion | Throughput de prefill (frio / caliente) | Pico de memoria activa |
|---|---|---|
| 14,9-17,7 tok/s | 113 / 140 tok/s | 2,9 GiB |

El pico de memoria corresponde a contextos cortos; los contextos largos anaden cache KV. Los pesos de los expertos se transmiten desde SSD bajo demanda y no son residentes. No se han publicado en la informacion disponible resultados de benchmarks de terceros que validen estas cifras.

## Requisitos de hardware

- Memoria activa: 2,9 GiB de pico declarado en contextos cortos; el checkpoint completo (19,7 GB) permanece en almacenamiento y se transmite por expertos.
- Almacenamiento: se requiere almacenamiento rapido (NVMe o flash interno). El rendimiento depende de la latencia de lectura, ya que el mecanismo de offload la solapa con el forward pass mediante el prerouter.
- Equipo de referencia declarado: Mac mini M4 Pro con 24 GB de RAM, que alcanza 14,9-17,7 tok/s de decodificacion y 113-140 tok/s de prefill.
- GPU recomendadas: no disponibles. El backend MLX esta orientado actualmente a Apple Silicon; la model card indica que otros backends estan en la hoja de ruta de edge0.
- VRAM estimada para GPU NVIDIA u otras: no disponible.
- Compatibilidad con GPU de consumo: no confirmada para hardware no Apple; el caso validado es Apple Silicon.
- Opciones de despliegue: framework edge0 con backend MLX, en modo chat (`edge0 chat`) o como API HTTP compatible con OpenAI (`edge0 serve --port 8085`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: los indicados arriba; no se publican cifras de TTFT ni de latencia por peticion mas alla del throughput de prefill y decodificacion.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar contra el modelo base del que deriva. No se dispone de datos de otros modelos comparables en la documentacion facilitada.

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Rendimiento (media de los 5 benchmarks del autor) |
|---|---|---|---|---|---|
| Edge0-35B-A3B-preview (int4) | 34,7B (MoE, K=4) | No disponible | Apache 2.0 | Repositorio MLX en HuggingFace; framework edge0 | 79,2 |
| Qwen3.5-MoE 35B-A3B (fp16) | No disponible en la informacion facilitada | No disponible | No disponible en la informacion facilitada | Modelo base referenciado | 83,2 |

## Limitaciones y advertencias

- Version preliminar (preview): el propio autor advierte que la cobertura y la calidad estan en ampliacion y que el lanzamiento completo reforzara capacidades hoy ausentes.
- Capacidad de agente debil: el uso de herramientas, la planificacion en varios pasos y la autonomia de horizonte largo no estan optimizados en esta version. No es recomendable para pipelines de agentes en produccion.
- Restriccion de plataforma: el backend MLX solo apunta a Apple Silicon en la actualidad; el uso en GPU NVIDIA u otros aceleradores no esta soportado segun la documentacion disponible.
- Dependencia del almacenamiento: el rendimiento depende de la latencia de lectura del SSD. Un almacenamiento lento degrada el throughput de decodificacion mas alla de lo que el prerouter puede compensar.
- Gestion del contexto: los contextos largos incrementan la cache KV y rompen el presupuesto de 3 GiB de memoria activa; la recomendacion del autor es usar contextos cortos.
- Idiomas: la model card no enumera los idiomas soportados y solo indica que el ajuste se orienta a los del modelo base; no hay garantia de calidad multilingue fuera de ese conjunto.
- Perdida por cuantizacion: incluso con Recover-LoRA, la brecha frente a fp16 es de 3,9 puntos de media, con caidas de hasta 6,1 puntos en AIME 2026.
- Sesgos y alucinacion: no se documentan evaluaciones de sesgo, toxicidad ni tasas de alucinacion en la informacion disponible. Al derivar de un modelo base no descrito en detalle, cabe esperar los sesgos y el riesgo de alucinacion inherentes a ese modelo, sin cuantificar.
- Procedencia del repositorio analizado: el ID minte1431/Edge0-35B-A3B-preview es una copia de tercero; el repositorio oficial es Edge0/Edge0-35b-a3b-preview. Con 0 descargas y 0 likes, no hay validacion de la comunidad ni garantia de que la copia se mantenga sincronizada.
- Licencia: Apache 2.0, permisiva para uso comercial, sin restricciones adicionales declaradas.
- Los resultados de los motores de busqueda consultados no contienen informacion relevante sobre este modelo; las fuentes devueltas no guardan relacion con el.

## Enlaces

- Ficha analizada: https://huggingface.co/minte1431/Edge0-35B-A3B-preview
- Repositorio oficial en HuggingFace: https://huggingface.co/Edge0/Edge0-35b-a3b-preview
- Version 8B-A1B del mismo proyecto: https://huggingface.co/Edge0/Edge0-8b-a1b-preview
- Repositorio del framework edge0: https://github.com/Edge0-AI/edge0
- Documentacion de edge0: https://github.com/Edge0-AI/edge0#documentation
- Licencia Apache 2.0 del proyecto: https://github.com/Edge0-AI/edge0/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-MoE-35B-A3B
- Herramienta de evaluacion empleada por el autor: https://github.com/open-compass/opencompass
