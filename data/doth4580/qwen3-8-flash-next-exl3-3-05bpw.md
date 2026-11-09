# doth4580/Qwen3.8-Flash-Next-EXL3-3.05bpw

## Resumen

Qwen3.8-Flash-Next-EXL3-3.05bpw es una cuantización EXL3 (trellis de ExLlamaV3) del modelo Qwen3.8-Flash-Next del equipo Qwen, publicada por el usuario doth4580. El modelo base es un transformer de mezcla de expertos (MoE) con 125 000 millones de parámetros totales y aproximadamente 6000 millones activos, complementado con un embedding n-gram con hash de 51 000 millones de parámetros y una capa MTP (multi-token prediction) de 4000 millones, además de un codificador de visión. Esta versión cuantizada reduce el peso de ~360 GB en bf16 a ~85 GB (~79 GiB), lo que permite ejecutarlo en hardware de gama alta para centros de datos pequeños.

La ficha corresponde a un artefacto de cuantización, no a un modelo nuevo: los pesos son byte a byte idénticos al pack `3.05bpw_h5_ng5` de turboderp, construido con exllamav3 1.4.4. El pack está pensado principalmente para el motor de inferencia veloGB10 (`gb10_inference`) sobre una, dos o cuatro estaciones NVIDIA DGX Spark / GB10, aunque al ser EXL3 estándar puede cargarse con cualquier framework que lea el formato. Incluye un `config.json` compatible con vLLM, un índice de tensores regenerado y la torre de visión original en bf16 como archivo separado.

El interés actual del artefacto es práctico: demuestra que un MoE de 125B con visión y contexto largo puede servirse en un clúster de cuatro GB10 con decodificación especulativa vía MTP, lo que lo convierte en una opción relevante para despliegues locales de alta capacidad sin depender de GPUs de 80 GB en número elevado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capa MTP y embedding n-gram con hash; codificador de visión |
| Parametros totales | 42 472 950 307 (según safetensors del artefacto); el modelo base declara 125B totales con ~6B activos más 51B de embedding n-gram y 4B de MTP |
| Parametros activos | ~6B (modelo base, según model card) |
| Longitud de contexto | 262 144 tokens (valor configurado en los comandos de despliegue de veloGB10) |
| Tipos de cuantizacion | EXL3 trellis, 3.05 bits por peso (bpw) en expertos, cabeza de 5 bits, tabla n-gram incluida; torre de visión en bf16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (no es una licencia OSI) |
| Formato de pesos | safetensors (EXL3), con `config.json` compatible con vLLM e índice `model.safetensors.index.json` regenerado |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con aproximadamente 125 000 millones de parámetros totales y unos 6000 millones activos por token. A esta arquitectura se añaden dos componentes singulares: un embedding n-gram con hash de 51 000 millones de parámetros y una capa MTP de 4000 millones de parámetros que actúa como cabeza de borrador para decodificación especulativa. El modelo incorpora además un codificador de visión, lo que lo habilita para tareas image-text-to-text. La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO, por lo que esos datos deben considerarse no disponibles.

La innovación técnica de este artefacto concreto es la cuantización EXL3 trellis a 3.05 bpw sobre los expertos, con cabeza a 5 bits y tabla n-gram preservada, lo que comprime el peso de ~360 GB a ~85 GB manteniendo la estructura MoE. El pack incluye la capa MTP original para especulación, y el autor documenta dos cabezas de borrador alternativas probadas (la de HermiHg y su propia DotH-MTP) que solo afectan a la velocidad, nunca a la salida. El despliegue con veloGB10 soporta tensor parallelism sobre 1, 2 o 4 nodos GB10, con transferencia de pesos por red a cada nodo (sin copia local del modelo) y caché local para reinicios, además de prefix caching y decodificación especulativa.

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento (thinking) activado por defecto en las pruebas del autor.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text) gracias al codificador de visión, disponible en bf16 como archivo separado.
- Contexto largo de hasta 262 144 tokens, adecuado para documentos extensos y conversaciones de muchas vueltas.
- Decodificación especulativa mediante la capa MTP incluida, con tasas de aceptación del borrador del 71,8 % en TP=1 según las mediciones del autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: con 262 144 tokens de ventana, el modelo puede mantener conversaciones de muchas vueltas o procesar documentos completos sin truncar, algo útil en atención al cliente técnica o soporte interno.
- Análisis de documentos con imágenes: al combinar el codificador de visión con el contexto largo, permite responder preguntas sobre informes escaneados, capturas de pantalla o diagramas junto a texto extenso.
- Despliegue local en clústeres pequeños: pensado para una, dos o cuatro estaciones DGX Spark / GB10, permite servir un MoE de 125B en infraestructura de bajo consumo sin GPUs de 80 GB.
- Generación de código asistida: el modelo base Qwen3.8-Flash-Next está orientado a tareas de razonamiento y código; esta cuantización permite integrarlo en entornos de desarrollo con API compatible con OpenAI en `http://<head-ip>:9000/v1`.
- Prototipado e investigación de cuantización: al ser pesos EXL3 estándar, sirve para evaluar el impacto de 3.05 bpw frente a bf16 en tareas de razonamiento y visión con cualquier framework que lea el formato.
- Servicio con requisitos de latencia moderada: las mediciones del autor (80 tok/s de mediana en decodificación en TP=1, 2068 tok/s de prefill) lo hacen apto para asistentes interactivos de un solo usuario o dos solicitudes concurrentes por nodo.
- Experimentación con decodificación especulativa: la capa MTP incluida y las cabezas de borrador alternativas permiten medir el efecto de la especulación en velocidad sin alterar las salidas.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad con veloGB10 sobre GB10 (2026-11-05, builds de desarrollo 0.7.7), con muestreo de producción, thinking activado y una solicitud a la vez en las columnas de solicitud única:

| Topologia | Fuente del borrador | Decodificacion turno de codigo (tok/s) | Decodificacion turno de historia (tok/s) | Mediana decodificacion todos los turnos (tok/s) | Prefill (tok/s) | 2 solicitudes, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP del pack | 124 | 62 | 80 | 2 068 | 119 | 71,8 % |
| TP=2 | no disponible (tabla truncada en la informacion) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el pack ocupa ~85 GB (~79 GiB) en disco; en memoria debe caber completo en el conjunto de nodos, ya que es un MoE con expertos cuantizados a 3.05 bpw.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de 1, 2 o 4 nodos con tensor parallelism (TP=1, TP=2, TP=4).
- GPU de consumo: no hay información que confirme que quepa en GPUs consumer individuales; el tamaño de ~79 GiB excede la VRAM de cualquier GPU consumer actual.
- Opciones de despliegue: motor veloGB10 (`gb10_inference`), con servidor compatible con OpenAI en el puerto 9000; los pesos son EXL3 estándar y pueden usarse con otros frameworks que lean el formato (exllamav3). El `config.json` es compatible con vLLM, aunque no se documenta su funcionamiento con este pack.
- Latencia y throughput: en TP=1, mediana de 80 tok/s en decodificación y 2 068 tok/s de prefill; 119 tok/s agregados con 2 solicitudes concurrentes. `--max-batch 2` y `--max-tokens 65536` son los valores probados. Las ejecuciones muestreadas varían aproximadamente ±10 %.
- Red: los nodos no necesitan copia del modelo; el nodo cabeza envía a cada nodo su parte de los pesos por red (RoCE/RDMA opcional con `--rdma-dev`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-EXL3-3.05bpw (este) | 125B totales / ~6B activos (base); 42,5B en safetensors del artefacto | 262 144 | EXL3 3.05 bpw | Qwen Community License 1.0 | Hugging Face, 4 866 descargas |
| Qwen/Qwen3.8-Flash-Next (bf16) | 125B totales / ~6B activos | no disponible | bf16 (~360 GB) | Qwen Community License 1.0 | Hugging Face (oficial) |
| turboderp/Qwen3.8-Flash-Next-exl3 | 125B totales / ~6B activos | no disponible | EXL3, variante `3.05bpw_h5_ng5` | Qwen Community License 1.0 | Hugging Face (origen del pack) |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia Qwen Community License 1.0 no es una licencia OSI; el uso comercial está sujeto a sus términos, que deben revisarse antes de producción.
- El artefacto contiene pesos modificados (cuantización EXL3); no es el modelo original y los derechos del modelo base pertenecen al equipo Qwen.
- La cuantización a 3.05 bpw puede degradar la calidad frente a bf16; no se han publicado evaluaciones de calidad en la información disponible.
- La torre de visión se distribuye en bf16 como archivo separado (`vision_tower_bf16.safetensors`); su integración depende del framework de despliegue.
- Riesgo de alucinación inherente a los modelos generativos; no hay datos específicos publicados para este pack.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- El rendimiento medido corresponde a builds de desarrollo de veloGB10 0.7.7 y a un solo run por celda, con variación de ±10 %; no debe tomarse como cifra de producción estable.
- El despliegue multi-nodo requiere configuración de red (RoCE/RDMA) y los nodos deben poder recibir los pesos por red; un mal dimensionamiento de red afecta al arranque.
- El uso de cabezas de borrador alternativas solo cambia la velocidad, no la salida, pero debe validarse su compatibilidad con el pack.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.05bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack EXL3 original de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- exllamav3: https://github.com/turboderp-org/exllamav3
- Cabeza MTP optimizada de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Cabeza DotH-MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
