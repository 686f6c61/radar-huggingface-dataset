# doth4580/Qwen3.8-Flash-Next-EXL3-4.18bpw-DotH-MTP

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen, publicado bajo la licencia Qwen Community 1.0. Esta ficha describe la variante cuantizada publicada por doth4580, que redistribuye los pesos EXL3 de turboderp (rama `4.18bpw_h6_ng8`, cuantizada con exllamav3) y les añade una cabeza de borrador (draft head) MTP propia para decodificación especulativa. El resultado es un paquete de aproximadamente 35.000 millones de parámetros totales y 122 GB de repositorio, pensado para servirse con el motor veloGB10 sobre hardware NVIDIA DGX Spark / GB10.

El interés de este paquete no reside en un modelo nuevo, sino en el empaquetado: combina una cuantización EXL3 de 4,18 bits por peso con una cabeza MTP re-destilada que acelera la decodificación sin alterar la salida (cada token propuesto se verifica con el modelo completo). El autor reporta métricas de decodificación de entre 91 y 114 tokens por segundo de mediana en configuraciones TP=2 y TP=4, con una tasa de aceptación del borrador en torno al 71%.

La información disponible no incluye detalles sobre la arquitectura interna del modelo base, el volumen de datos de entrenamiento ni los idiomas soportados. Los datos de rendimiento publicados se limitan a las pruebas de inferencia del autor con veloGB10; no se han divulgado resultados de benchmarks académicos en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts); detalles internos no disponibles |
| Parametros totales | 35.013.239.552 (≈35,0 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (límite configurado en veloGB10 con `--max-seq-len`) |
| Tipos de cuantizacion | EXL3 a 4,18 bits por peso (variante `4.18bpw_h6_ng8` de turboderp) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (formato EXL3 de ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE, según indican las etiquetas del repositorio (`moe`) y la mención explícita a expertos enrutados en la capa MTP. No se dispone de información sobre el número de parámetros activos por token, el número de expertos, la composición del dataset de entrenamiento, el volumen de tokens procesados ni las técnicas de alineación empleadas (RLHF, DPO u otras). Tampoco se detalla si incorpora innovaciones como atención lineal o decodificación especulativa nativa en el modelo original.

La contribución técnica de este paquete es la combinación de dos elementos. Por un lado, los pesos cuantizados EXL3 de turboderp, redistribuidos byte a byte sin reconversión ni recuantización. Por otro, una cabeza MTP (Multi-Token Prediction) re-destilada por doth4580, compuesta por 59 tensores no-expertos, cuantizada con exllamav3 1.5.3 y adaptada al diseño de la cabeza optimizada de HermiHg (Apache-2.0); la proyección del indexador se mantiene idéntica a la de HermiHg. La capa MTP conserva los expertos enrutados del propio paquete. Esta cabeza actúa como modelo borrador en decodificación especulativa: propone tokens que el modelo completo verifica, de modo que solo afecta a la velocidad y nunca al contenido generado.

## Capacidades

- Generación de texto autoregresiva con ventana de contexto de hasta 262.144 tokens.
- Razonamiento multi-turno y conversacional, con modo de pensamiento (thinking) activado por defecto en las pruebas del autor.
- Decodificación especulativa mediante cabeza MTP integrada, con `--mtp=auto` en veloGB10.
- Servicio de API compatible con OpenAI (`/v1`) a través del motor veloGB10.
- Soporte de caché de prefijos (`--prefix-cache on`) para reutilización de contexto entre peticiones.
- Ejecución distribuida en tensor paralelo (TP=1, TP=2 y TP=4) sobre nodos GB10 con transferencia de pesos por red y caché local en cada nodo.
- Capacidades de tool calling, function calling, agentes, visión, audio o multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de inferencia en clúster DGX Spark: el paquete está probado con veloGB10 en configuraciones de uno, dos y cuatro nodos GB10, con reparto automático de pesos y caché local, lo que permite desplegar el modelo en infraestructura de borde o laboratorio sin copia manual del modelo en cada nodo.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes o bases de código extensas en una sola petición y responder sobre ellas, aprovechando la caché de prefijos para consultas repetidas sobre el mismo documento.
- Asistente conversacional multi-turno con modo thinking: el modo de razonamiento activado por defecto resulta adecuado para tareas de análisis que requieren cadenas de razonamiento antes de la respuesta final.
- Generación de código en flujos interactivos: las métricas de decodificación en turnos de código (148 tok/s en TP=2 y 178 tok/s en TP=4) lo hacen viable para autocompletado y generación asistida en entornos de desarrollo.
- Evaluación y experimentación con decodificación especulativa: al incluir la cabeza MTP y publicar la tasa de aceptación (≈71%), sirve como banco de pruebas para estudiar el impacto del borrador en latencia y throughput con distintas topologías.
- Despliegue de API compatible con OpenAI en infraestructura propia: el servidor expone `/v1` en el puerto 9000, lo que permite integrarlo con clientes y orquestadores que ya hablan el protocolo de OpenAI sin adaptadores adicionales.
- Inferencia de baja latencia en un solo nodo: con TP=1 y un carril de petición a 262.144 tokens de contexto, es apto para entornos de un único GB10 donde se prioriza la ventana de contexto sobre la concurrencia.

## Benchmarks y rendimiento

Los únicos datos publicados son las mediciones del autor con veloGB10 (VeloBench, 2026-11-06, builds de desarrollo 0.7.7) sobre máquinas GB10, con muestreo de producción, thinking activado y una petición simultánea en las columnas de petición única. La decodificación se expresa en tokens de salida por segundo e incluye decodificación especulativa. Cada celda corresponde a una sola ejecución, con variación aproximada de ±10%.

| Topologia | Fuente del borrador | Decodificacion turno de codigo (tok/s) | Decodificacion turno de relato (tok/s) | Mediana decodificacion todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=2 | Cabeza DotH-MTP | 148 | 72 | 91 | 3.264 | 143 | 71,5% |
| TP=4 | Cabeza DotH-MTP | 178 | 99 | 114 | 3.777 | 190 | 71,4% |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 122 GB, por lo que la carga completa de los pesos EXL3 a 4,18 bpw requiere del orden de esa cifra de memoria distribuida entre los nodos.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de uno, dos o cuatro nodos con tensor paralelo (TP=1, TP=2, TP=4).
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPU de consumo; el paquete está orientado a GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`), el motor con el que se probó el paquete; al ser formato EXL3 estándar, cualquier framework que lea ExLlamaV3 podría cargarlo, aunque no se documenta su uso con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: mediana de decodificación de 91 tok/s en TP=2 y 114 tok/s en TP=4; prefill de 3.264 tok/s (TP=2) y 3.777 tok/s (TP=4); 143 tok/s agregados con dos peticiones en TP=2 y 190 tok/s en TP=4.
- Concurrencia: en un solo GB10 el motor sirve un carril de petición a 262.144 tokens de contexto; para dos o más peticiones concurrentes se recomienda TP=2 o TP=4.
- Red: los nodos no necesitan copia del modelo; el nodo principal envía a cada nodo su parte de los pesos y esta se conserva en caché local. Con dos pares de puertos RoCE activos se selecciona el par mediante `--rdma-dev`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-4.18bpw-DotH-MTP (este paquete) | ≈35,0 B | 262.144 tokens (configurado en veloGB10) | EXL3 4,18 bpw + cabeza MTP | qwen-community-1.0 | Incluye decodificación especulativa; probado en GB10 |
| doth4580/Qwen3.8-Flash-Next-EXL3-4.18bpw | ≈35,0 B | no disponible | EXL3 4,18 bpw | qwen-community-1.0 | Mismos pesos sin cabeza MTP; velocidad menor |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | Pesos originales (formato no especificado) | qwen-community-1.0 | Modelo base sin cuantizar |
| turboderp/Qwen3.8-Flash-Next-exl3 (rama `4.18bpw_h6_ng8`) | ≈35,0 B | no disponible | EXL3 4,18 bpw | qwen-community-1.0 | Cuantización original redistribuida en este paquete |

No se dispone de información sobre otros modelos de la misma categoría (tamaño o tarea) que permita una comparación de rendimiento con benchmarks.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones específicas de fidelidad factual.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado fuera de los idiomas del modelo original.
- La licencia Qwen Community 1.0 puede imponer restricciones adicionales al uso comercial; es necesario revisar el texto completo en el enlace de licencia antes de desplegarlo en producción.
- Los pesos son una cuantización de 4,18 bits: puede existir una degradación de calidad frente a los pesos originales en BF16, no cuantificada en la información disponible.
- La cabeza MTP solo afecta a la velocidad; no mejora la calidad de las respuestas, y su tasa de aceptación (≈71%) puede variar según la carga y la topología.
- Las métricas publicadas provienen de una sola ejecución por celda con builds de desarrollo de veloGB10, con variación de ±10%; deben tratarse como orientativas.
- El soporte de despliegue documentado se limita a veloGB10 sobre GB10; el uso con otros motores no está verificado por el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo base no cuenta con documentación pública en la información proporcionada.

## Enlaces

- Repositorio Hugging Face de este paquete: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-4.18bpw-DotH-MTP
- Paquete base sin cabeza MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-4.18bpw
- Cabeza MTP en BF16: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cuantización EXL3 de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- exllamav3: https://github.com/turboderp-org/exllamav3
