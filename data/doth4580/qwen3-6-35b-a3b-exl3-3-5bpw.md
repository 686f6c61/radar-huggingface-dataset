# doth4580/Qwen3.6-35B-A3B-exl3-3.5bpw

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen (Alibaba). Se trata de la primera variante con pesos abiertos de la serie Qwen3.6, publicada tras el lanzamiento de la familia Qwen3.5 en febrero. El modelo combina un tronco transformer con capas MoE, incluye una torre de visión y una cabeza MTP (multi-token prediction) para decodificación especulativa. El nombre indica 35B parámetros totales y aproximadamente 3B activos por token, aunque el recuento real de pesos en safetensors de esta versión cuantizada es de 8.652.619.776 parámetros.

La ficha que nos ocupa no es el modelo original, sino una cuantización EXL3 (ExLlamaV3) a 3.5 bits por peso (bpw) publicada por el usuario doth4580. El pack se ha generado con exllamav3 1.4.7 sobre 8 GPUs NVIDIA H100, con `lm_head` a 6 bits, capa MTP a 4 bits y torre de visión a 6 bits, usando calibración de 250 secuencias de 2048 tokens. El tokenizador, la plantilla de chat y la configuración se mantienen idénticos al original.

Este pack está pensado principalmente para el motor de inferencia veloGB10 sobre una, dos o cuatro máquinas NVIDIA DGX Spark / GB10, y es relevante porque demuestra la viabilidad de servir un MoE multimodal de 35B con contexto de 262.144 tokens en hardware de escritorio de gama alta mediante cuantización agresiva y decodificación especulativa con aceptación de borrador superior al 64%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas Mixture of Experts (MoE), torre de visión y cabeza MTP; familia `qwen3_5_moe` |
| Parametros totales | 35B (nominal); 8.652.619.776 pesos en safetensors de esta cuantización |
| Parametros activos | ~3B por token (según nomenclatura A3B) |
| Longitud de contexto | 262.144 tokens (`--max-seq-len 262144` en la configuración probada) |
| Tipos de cuantizacion | EXL3 a 3.5 bpw promedio; `lm_head` 6 bits; capa MTP 4 bits; torre de visión 6 bits; codebook `mul1`; out-scales `always` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas MoE, identificado en los tags como `qwen3_5_moe`. El modelo incorpora además una torre de visión (capacidad multimodal) y una cabeza MTP (multi-token prediction) que se emplea como fuente de borrador para decodificación especulativa. La cuantización EXL3 conserva la estructura del modelo original y solo modifica los pesos, manteniendo tokenizador, plantilla de chat y configuración.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card original menciona que Qwen3.6 se construyó a partir de feedback directo de la comunidad, priorizando estabilidad y utilidad en el mundo real, pero no aporta cifras concretas de entrenamiento. La innovación técnica destacable de este pack es la cuantización a 3.5 bpw con `lm_head` y torre de visión a mayor precisión, más el uso de la cabeza MTP para decodificación especulativa, que en las pruebas de veloGB10 alcanza una tasa de aceptación del borrador del 64,3-64,7%.

## Capacidades

- Generación de texto y razonamiento de propósito general, con modo de pensamiento (thinking) activado por defecto en las pruebas de referencia.
- Procesamiento de imágenes mediante torre de visión integrada (capacidad multimodal).
- Generación de código y matemáticas (capacidades esperadas en la familia Qwen3.6, aunque no se detallan benchmarks en la información disponible).
- Decodificación especulativa nativa mediante la cabeza MTP del propio pack.
- Soporte de conversaciones multi-turno con contexto largo (hasta 262.144 tokens).
- Servido mediante API compatible con OpenAI a través de veloGB10.
- Soporte de prefix caching (`--prefix-cache on`) para reutilización de prefijos en conversaciones.
- Soporte multilingüe: no disponible en detalle.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Servicio de inferencia local en DGX Spark: el pack está diseñado y probado para veloGB10 sobre una, dos o cuatro máquinas GB10, lo que permite desplegar un MoE de 35B con contexto de 262.144 tokens en hardware de escritorio de gama alta sin depender de la nube.
- Procesamiento de documentos largos: con 262.144 tokens de contexto se pueden analizar contratos, informes o bases de código completas en una sola pasada, manteniendo el prefijo en caché para consultas sucesivas.
- Análisis de imágenes con texto: la torre de visión a 6 bits permite tareas de descripción, extracción de información o respuesta a preguntas sobre imágenes dentro de un flujo conversacional.
- Asistentes conversacionales multi-turno: el prefix caching y la ventana de contexto larga permiten mantener historiales extensos sin recalcular el prefijo en cada turno.
- Generación de código en entornos con requisitos de soberanía de datos: al ejecutarse en hardware propio con licencia Apache-2.0, es apto para pipelines internos donde no se permite enviar código a APIs externas.
- Prototipado e investigación en clústeres pequeños: la topología TP=4 con prefill de 4.914 tok/s y decodificación mediana de 148 tok/s permite iterar sobre cargas de trabajo MoE multimodales en un laboratorio con cuatro GB10.
- Evaluación de cuantizaciones agresivas: como pack EXL3 a 3.5 bpw, sirve para estudiar la pérdida de calidad frente al modelo original en tareas de razonamiento y visión.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados corresponden a las mediciones de veloGB10 (VeloBench, 2026-11-08, builds de desarrollo 0.7.7) sobre máquinas GB10, con muestreo de producción, thinking activado y una petición a la vez salvo en la columna de dos peticiones. La decodificación incluye decodificación especulativa.

| Topologia | Fuente del borrador | Decode turno de codigo (tok/s) | Decode turno de relato (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | cabeza MTP del pack | 137 | 98 | 111 | 3.155 | 120 | 64,7% |
| TP=2 | cabeza MTP del pack | 150 | 121 | 132 | 4.310 | 137 | 64,4% |
| TP=4 | cabeza MTP del pack | 172 | 129 | 148 | 4.914 | 154 | 64,3% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 17,4 GB en disco; con caché KV en bf16 y contexto de 262.144 tokens, el consumo de memoria crece de forma significativa y en las pruebas se ha usado una máquina GB10 completa por rango de tensor-parallel.
- GPU recomendadas: NVIDIA DGX Spark / GB10 (hardware objetivo); la cuantización se generó en 8× NVIDIA H100.
- Cabe en GPU consumer: no hay datos sobre RTX 4090 u otras GPU consumer; el pack está validado únicamente en GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`, servidor compatible con OpenAI en el puerto 9000) es el motor probado; al ser formato EXL3 estándar, cualquier framework que lea EXL3 podría cargarlo, aunque no se ha validado.
- Topologías soportadas: TP=1 (una GB10), TP=2 (dos GB10 con nodo remoto en el puerto 29500) y TP=4 (cuatro GB10); los nodos no necesitan copia local del modelo, el head les envía su parte de los pesos y la cachea.
- Red: soporte de RoCE con `--rdma-dev <rail1>,<rail2>` cuando hay dos pares de puertos activos.
- Latencia y throughput: prefill de 3.155 a 4.914 tok/s y decode mediano de 111 a 148 tok/s según topología; con dos peticiones concurrentes el agregado va de 120 a 154 tok/s.
- Parámetros de servido probados: `--kv-cache bf16`, `--fp8-prefill off`, `--max-batch 2`, `--max-tokens 65536`, `--default-presence-penalty 0`, `--prefix-cache on`, `--mtp=auto`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.6-35B-A3B-exl3-3.5bpw | 35B totales, ~3B activos | 262.144 | Apache-2.0 | EXL3, safetensors | Cuantización a 3.5 bpw del original, orientada a GB10 |
| Qwen/Qwen3.6-35B-A3B | 35B totales, ~3B activos | no disponible en la informacion | Apache-2.0 | Transformers, vLLM, SGLang, KTransformers | Modelo original sin cuantizar; referencia de calidad |
| Qwen3.5 (serie) | no disponible | no disponible | no disponible | no disponible | Serie previa de Qwen; sin datos concretos en la informacion |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento del pack cuantizado frente al modelo original o frente a alternativas de otros fabricantes.

## Limitaciones y advertencias

- La cuantización a 3.5 bpw puede degradar la calidad respecto al modelo original; no se han publicado evaluaciones de calidad comparativas en la información disponible.
- El pack está validado únicamente con veloGB10 sobre GB10; su uso con otros motores EXL3 no está probado por el autor.
- Los benchmarks de rendimiento son de una sola ejecución por celda y varían aproximadamente ±10% entre ejecuciones muestreadas.
- No se detallan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas en la información proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero el autor del pack no reclama propiedad intelectual sobre el modelo ni sus pesos; los derechos quedan en los autores originales.
- El modelo base es de tipo MoE con ~3B parámetros activos, lo que implica que su capacidad efectiva por token es menor que la de un modelo denso de 35B.
- El contexto de 262.144 tokens requiere memoria considerable para la caché KV; en configuraciones reducidas puede ser necesario recortar `--max-seq-len`.
- No hay información sobre tool calling, function calling ni soporte de agentes multi-paso en la documentación disponible.

## Enlaces

- Repositorio del pack cuantizado: https://huggingface.co/doth4580/Qwen3.6-35B-A3B-exl3-3.5bpw
- Modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- ExLlamaV3 (exllamav3): https://github.com/turboderp-org/exllamav3
- Qwen Chat: https://chat.qwen.ai
