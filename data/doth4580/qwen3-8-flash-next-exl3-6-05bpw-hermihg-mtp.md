# doth4580/Qwen3.8-Flash-Next-EXL3-6.05bpw-HermiHg-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-6.05bpw-HermiHg-MTP es un paquete de pesos cuantizados del modelo Qwen3.8-Flash-Next, desarrollado originalmente por el equipo Qwen, redistribuido por el usuario doth4580. No se trata de un modelo nuevo ni de un fine-tune: es una cuantización EXL3 (formato de ExLlamaV3) a 6,05 bits por peso, producida por turboderp, a la que se le ha añadido una cabeza de decodificación especulativa MTP (multi-token prediction) optimizada por HermiHg. El resultado es un artefacto de inferencia listo para producir, no un checkpoint para entrenamiento.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) con 49.947.040.512 parámetros totales según los safetensors del repositorio. El paquete está pensado y probado específicamente para el motor de inferencia veloGB10 sobre clústeres de una, dos o cuatro máquinas NVIDIA DGX Spark / GB10, con paralelismo tensorial TP=2 o TP=4. No cabe en una sola GB10 de 128 GB junto con su memoria de trabajo.

Su relevancia práctica es doble: por un lado, demuestra un flujo de cuantización y empaquetado reproducible sobre un modelo Qwen de gran tamaño; por otro, integra decodificación especulativa mediante una cabeza MTP que acelera la generación sin alterar la salida, ya que cada token propuesto se verifica con el modelo completo. La licencia es la Qwen Community License 1.0, no una licencia permisiva genérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 49.947.040.512 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuracion de servido probada con `--max-seq-len 262144`) |
| Tipos de cuantizacion | EXL3 a 6,05 bpw (variante `6.05bpw_h6_ng6` de turboderp); cabeza MTP a 2,6 bpw |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con capas de mezcla de expertos, según indican las etiquetas del repositorio (`moe`) y la estructura de tensores del paquete, que distingue expertos enrutados del resto de pesos. El paquete incorpora además una capa MTP (multi-token prediction) cuya cabeza se sustituye por la versión optimizada de HermiHg: se copian byte a byte los 59 tensores no-expertos de su fichero `mtp-2.6bpw.safetensors`, mientras que los expertos enrutados de la capa MTP se mantienen los del pack original. No se usa el fichero completo de HermiHg porque sus anchos de experto están mezclados dentro de una misma capa, lo que el cargador de EXL3 no acepta.

Sobre el entrenamiento no hay información en la documentación disponible: no se detallan número de tokens, composición del dataset ni si hubo RLHF o DPO. La contribución de este repositorio es exclusivamente de cuantización, empaquetado, pruebas e instrucciones de despliegue; los pesos cuantizados se redistribuyen sin conversión ni recuantización respecto al pack de turboderp (revisión `d2e238feca4c`). La innovación técnica destacable es la integración de decodificación especulativa con la cabeza MTP, que acelera la decodificación manteniendo la garantía de que cada token propuesto se valida con el modelo completo.

## Capacidades

- Generación de texto y razonamiento en modo thinking, según la configuración de muestreo por defecto del pack (thinking activado en las pruebas).
- Generación de código, evidenciada por las pruebas de "code turn" del banco VeloBench.
- Generación creativa de texto narrativo, con pruebas específicas de "story turn".
- Decodificación especulativa con cabeza MTP integrada, activable con `--mtp=auto`.
- Servido mediante API compatible con OpenAI en `/v1`.
- Caché de prefijos (`--prefix-cache on`) para reutilización de contexto en conversaciones multi-turno.
- Soporte de lotes concurrentes (`--max-batch`) y hasta 65.536 tokens de salida por petición (`--max-tokens 65536`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de inferencia de código en producción: el pack está medido con turnos de código a 125 tok/s en TP=2 y 148 tok/s en TP=4, lo que lo hace adecuado para asistentes de programación servidos por API compatible con OpenAI.
- Despliegue en clústeres DGX Spark: organizaciones con dos o cuatro GB10 pueden servir un modelo de ~50.000 millones de parámetros con paralelismo tensorial y sin copiar los pesos a los nodos, ya que el nodo principal distribuye cada partición por red y la cachea localmente.
- Conversaciones de contexto largo: con 262.144 tokens de ventana y caché de prefijos, encaja en análisis de documentos extensos, revisiones de código de repositorios completos o historiales de soporte prolongados.
- Generación de narrativa y contenido creativo: los turnos de historia sostienen 69 tok/s en TP=2 y 88 tok/s en TP=4, suficiente para generación interactiva de texto largo.
- Evaluación e investigación de decodificación especulativa: el pack incluye la cabeza MTP y métricas de aceptación de borrador (73,4 % en TP=2, 72,3 % en TP=4), lo que permite reproducir experimentos de speculative decoding sobre un MoE real.
- Prototipado de agentes multi-paso: la ventana de 262.144 tokens y la API compatible con OpenAI permiten encadenar llamadas con contexto acumulado sin reentrenamiento.
- Benchmarking de infraestructura: sirve como carga de referencia para medir prefill (3.007 tok/s en TP=2, 3.613 tok/s en TP=4) y decodificación agregada en clústeres GB10.

## Benchmarks y rendimiento

Datos medidos con veloGB10 0.7.7 sobre máquinas NVIDIA DGX Spark / GB10, a muestreo de producción, thinking activado, una ejecución por celda con variación aproximada de ±10 %:

| Topologia | Fuente del borrador | Decode turno de codigo (tok/s) | Decode turno de historia (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=2 | Cabeza MTP HermiHg | 125 | 69 | 83 | 3.007 | 110 | 73,4 % |
| TP=4 | Cabeza MTP HermiHg | 148 | 88 | 100 | 3.613 | 158 | 72,3 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 139,1 GB en disco; el pack no cabe en una sola GB10 de 128 GB junto con su memoria de trabajo, por lo que se requiere TP=2 o TP=4.
- GPU recomendadas: NVIDIA DGX Spark / GB10 en configuraciones de dos o cuatro máquinas. No hay datos de funcionamiento en A100, H100 o RTX 4090.
- GPU de consumo: no hay información que confirme que quepa en GPU de consumo; el tamaño del pack (139,1 GB) lo hace inviable en tarjetas de 24 GB o 48 GB sin cuantización adicional.
- Opciones de despliegue: veloGB10 (`gb10_inference`), motor para el que está probado el pack; al ser formato EXL3 estándar, cualquier framework que lea ExLlamaV3 podría cargarlo, aunque no se han publicado pruebas.
- Red: en clústeres con dos pares de puertos RoCE activos hay que indicar la interfaz con `--rdma-dev <rail1>,<rail2>`; con un solo par se detecta automáticamente.
- Latencia y throughput: prefill de 3.007 tok/s (TP=2) y 3.613 tok/s (TP=4); decodificación mediana de 83 tok/s (TP=2) y 100 tok/s (TP=4); agregado con dos peticiones de 110 tok/s (TP=2) y 158 tok/s (TP=4).
- Límites de servido probados: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-6.05bpw-HermiHg-MTP | 49.947.040.512 | 262.144 tokens | EXL3 6,05 bpw + MTP 2,6 bpw | qwen-community-1.0 | Hugging Face, 0 descargas |
| doth4580/Qwen3.8-Flash-Next-EXL3-6.05bpw | no disponible | no disponible | EXL3 6,05 bpw | qwen-community-1.0 | Hugging Face |
| turboderp/Qwen3.8-Flash-Next-exl3 | no disponible | no disponible | EXL3 (varias ramas bpw) | qwen-community-1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (original) | no disponible | no disponible | pesos completos | qwen-community-1.0 | Hugging Face |

No se dispone de datos de benchmarks de calidad para establecer una comparación de rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser una cuantización del modelo original, hereda los sesgos de este.
- Riesgo de alucinación: no cuantificado en la documentación; aplican las advertencias habituales de los modelos generativos de gran tamaño.
- Limitaciones de contexto: la ventana de 262.144 tokens es la configuración probada, no necesariamente el máximo teórico del modelo base.
- Idiomas: no se especifica la cobertura lingüística del modelo.
- Licencia: Qwen Community License 1.0, no una licencia permisiva; hay que revisar sus términos antes de uso comercial. La cabeza MTP de HermiHg es Apache-2.0, pero el conjunto del pack se distribuye bajo la licencia Qwen.
- Restricción de hardware: no cabe en una única GB10 de 128 GB; requiere al menos dos máquinas en TP=2.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y las mediciones proceden de builds de desarrollo de veloGB10 0.7.7 con una sola ejecución por celda y variación de ±10 %.
- La cabeza MTP solo afecta a la velocidad, nunca a la salida; sin ella, los pesos son idénticos al pack base.
- No se han publicado resultados de benchmarks de calidad, por lo que no hay evidencia documentada de su rendimiento en tareas estándar.

## Enlaces

- Repositorio del pack: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-6.05bpw-HermiHg-MTP
- Pack base sin cabeza MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-6.05bpw
- Cuantización original de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabeza MTP optimizada de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
