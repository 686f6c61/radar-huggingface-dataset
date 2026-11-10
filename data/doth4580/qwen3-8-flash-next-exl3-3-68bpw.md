# doth4580/Qwen3.8-Flash-Next-EXL3-3.68bpw

## Resumen

Qwen3.8-Flash-Next-EXL3-3.68bpw es una cuantización EXL3 (ExLlamaV3) del modelo Qwen3.8-Flash-Next del equipo Qwen, publicada por el usuario doth4580. No se trata de un modelo nuevo ni de un ajuste fino: el repositorio redistribuye byte a byte el pack de turboderp (rama `3.68bpw_h6_ng8`), sin reconversión ni recuantización, con el objetivo de servir como referencia estable para el motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10. La arquitectura del modelo base es MoE (mezcla de expertos), con 31.079.915.008 parámetros totales según los safetensors del repositorio.

El interés práctico de esta ficha está en el empaquetado y en los datos de rendimiento medidos, no en el modelo base: el pack está pensado para desplegarse en uno, dos o cuatro nodos GB10 con paralelismo tensorial (TP=1/2/4), decodificación especulativa mediante cabezas MTP y una ventana de contexto configurable de hasta 262.144 tokens. El repositorio ocupa 114,2 GB y se distribuye bajo la licencia Qwen Community License 1.0.

La relevancia actual es doble: por un lado, ofrece una ruta concreta para ejecutar un MoE de ~31B en clústeres pequeños de GB10 con cifras de throughput publicadas; por otro, demuestra el ecosistema de cuantización EXL3 y de cabezas MTP alternativas (HermiHg y DotH-MTP) que solo afectan a la velocidad, nunca a la salida del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos); detalles del transformer no disponibles |
| Parametros totales | 31.079.915.008 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens en la configuración probada (`--max-seq-len 262144`) |
| Tipos de cuantizacion | EXL3 3,68 bpw (pack `3.68bpw_h6_ng8` de turboderp) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con arquitectura de mezcla de expertos (MoE), según las etiquetas del repositorio y la información del autor. Los safetensors del pack cuantizado suman 31.079.915.008 parámetros totales; el número de parámetros activos por token, la composición del dataset de entrenamiento, el número de tokens vistos y si hubo RLHF o DPO no están disponibles en la información proporcionada.

La innovación técnica relevante de este repositorio no está en el entrenamiento sino en el despliegue: cuantización EXL3 a 3,68 bits por peso con exllamav3, decodificación especulativa mediante cabeza MTP (multitoken prediction) con tasas de aceptación medidas en torno al 71-73%, caché de prefijos (`--prefix-cache on`) y paralelismo tensorial multi-nodo con reparto de pesos bajo demanda desde el nodo cabeza hacia los nodos trabajadores, que mantienen una caché local para evitar retransferencias en arranques posteriores.

## Capacidades

- Generación de texto y razonamiento: el pack se sirve con el modo thinking activado en las pruebas de rendimiento publicadas.
- Generación de código: la benchmark propia incluye un turno de código ("Code turn decode") como referencia de velocidad.
- Decodificación especulativa: soporte de cabeza MTP propia del pack y de cabezas alternativas (HermiHg, DotH-MTP) que modifican únicamente la velocidad.
- Contexto largo: configuración validada con `--max-seq-len 262144` y `--max-tokens 65536`.
- Servicio compatible con la API de OpenAI en `http://<head-ip>:9000/v1`.
- Procesamiento por lotes: `--max-batch` configurable (probado con 2).
- Tool calling, function calling, capacidades de agente, multilingüismo, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia de un MoE de ~31B en un único DGX Spark / GB10: el pack está dimensionado y probado para TP=1 con 66 tok/s de mediana de decodificación en todos los turnos, adecuado para asistentes internos de baja concurrencia.
- Despliegue en clúster de dos nodos GB10: con TP=2 se alcanzan 86 tok/s de mediana y 2.767 tok/s de prefill, útil para equipos pequeños que necesitan más throughput sin adquirir GPU de centro de datos.
- Escalado a cuatro nodos GB10: TP=4 ofrece 110 tok/s de mediana y 3.287 tok/s de prefill, orientado a servir varios usuarios simultáneos (161 tok/s agregados con 2 peticiones).
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite ingerir contratos, expedientes o bases de código extensas en una sola pasada, con caché de prefijos para reutilizar el contexto entre consultas.
- Evaluación y benchmarking de motores de inferencia: al ser una redistribución byte-idéntica, sirve como referencia reproducible para comparar veloGB10, ExLlamaV3 u otros frameworks que lean EXL3.
- Generación de código asistida en flujos internos: el turno de código alcanza 98-160 tok/s según topología, suficiente para autocompletado interactivo y revisión de parches.
- Investigación sobre decodificación especulativa: el repositorio incluye datos comparativos de tres cabezas MTP (pack, HermiHg, DotH-MTP) con tasas de aceptación y decodificación por topología, útiles para estudiar el impacto de la cabeza borrador.

## Benchmarks y rendimiento

Datos medidos por el autor con veloGB10 0.7.7 sobre GB10 (2026-11-05 a 2026-11-06), muestreo de producción, thinking activado, una ejecución por celda (±10% de variación). Decodificación en tokens de salida por segundo, incluida la decodificación especulativa.

| Topologia | Cabeza borrador | Decode turno codigo | Decode turno relato | Mediana todos los turnos | Prefill (tok/s) | 2 peticiones agregado | Aceptacion |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | MTP del pack | 98 | 53 | 66 | 1.769 | 82 | 73,1% |
| TP=2 | MTP del pack | 134 | 73 | 86 | 2.767 | 129 | 72,2% |
| TP=4 | MTP del pack | 160 | 101 | 110 | 3.287 | 161 | 71,9% |
| TP=1 | HermiHg MTP | 101 | 55 | 62 | 1.755 | 84 | 72,9% |
| TP=2 | HermiHg MTP | 133 | 75 | 87 | 2.776 | 122 | 72,5% |
| TP=4 | HermiHg MTP | 161 | 94 | 114 | 3.295 | 155 | 72,8% |
| TP=1 | DotH-MTP | 100 | 53 | 65 | 1.753 | 83 | 70,9% |
| TP=2 | DotH-MTP | 136 | 73 | 92 | 2.793 | 125 | 72,4% |
| TP=4 | DotH-MTP | 159 | 95 | 110 | 3.296 | 152 | 72,9% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 114,2 GB en disco; a 3,68 bpw los pesos rondan los 14,3 GB teóricos, pero el tamaño real del repo incluye metadatos y posibles componentes adicionales, por lo que la cifra efectiva de VRAM no está disponible.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de 1, 2 o 4 máquinas con TP=1/2/4.
- GPU de consumo: no hay datos que confirmen su funcionamiento en RTX 4090 u otras GPU consumer; el pack está publicado y probado específicamente para GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`, binario autocontenido, servidor compatible con OpenAI) es el motor validado; al ser formato EXL3 estándar, cualquier framework que lea ExLlamaV3 debería poder cargarlo, aunque no se han publicado pruebas al respecto.
- Red: en TP=2 y TP=4 los nodos no necesitan copia del modelo; el cabeza transfiere los pesos bajo demanda y los nodos los cachean. Con dos pares de puertos RoCE activos se selecciona el rail con `--rdma-dev <rail1>,<rail2>`.
- Latencia y throughput: ver tabla de benchmarks (66-114 tok/s de mediana de decodificación; 1.769-3.287 tok/s de prefill según topología).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-EXL3-3.68bpw (este) | 31,08B totales | hasta 262.144 | EXL3 3,68 bpw | Qwen Community 1.0 | Probado en GB10 con TP=1/2/4 y MTP |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | BF16 (presumiblemente) | Qwen Community 1.0 | Modelo original sin cuantizar |
| turboderp/Qwen3.8-Flash-Next-exl3 | no disponible | no disponible | EXL3, varias ramas | Qwen Community 1.0 | Origen del pack redistribuido |
| HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3 | no aplica (cabezas) | no aplica | EXL3 | no disponible | Cabeza MTP alternativa, solo velocidad |

No se dispone de datos de benchmarks de calidad ni de especificaciones del modelo base que permitan una comparación cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Es una cuantización a 3,68 bpw: puede haber una pérdida de calidad frente al modelo base en BF16, no cuantificada en la información disponible.
- El repositorio no añade nada propio: es un espejo byte-idéntico del pack de turboderp; los problemas de calidad deben reportarse contra el modelo original o el pack de origen.
- Los benchmarks publicados miden solo velocidad, no calidad; no hay datos de MMLU, HumanEval ni similares.
- Las cifras de rendimiento provienen de una única ejecución por celda con ±10% de variación y de builds de desarrollo de veloGB10 0.7.7, por lo que no deben tratarse como garantías de producción.
- Idiomas soportados no disponibles; no se puede confirmar el comportamiento multilingüe.
- Licencia Qwen Community License 1.0: es necesario revisar sus términos antes de un uso comercial; el autor no reclama propiedad intelectual sobre pesos ni arquitectura.
- No hay evidencia de funcionamiento en GPU consumer; el soporte documentado se limita a GB10.
- El modo thinking está activado en las pruebas; el consumo de tokens de razonamiento puede afectar a la latencia percibida en producción.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.68bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack EXL3 de origen (turboderp): https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Cabeza DotH-MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
