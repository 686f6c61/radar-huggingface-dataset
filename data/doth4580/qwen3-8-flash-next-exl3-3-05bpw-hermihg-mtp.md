# doth4580/Qwen3.8-Flash-Next-EXL3-3.05bpw-HermiHg-MTP

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje desarrollado por el equipo Qwen (Alibaba) que combina una arquitectura Mixture-of-Experts (MoE) con soporte para decodificación especulativa mediante cabezas MTP (Multi-Token Prediction). El repositorio analizado, publicado por el usuario doth4580, no contiene los pesos originales en precisión completa, sino una versión cuantizada a 3,05 bits por peso en formato EXL3 (ExLlamaV3) junto con una cabeza de borrador optimizada para decodificación especulativa. Este empaquetado está pensado específicamente para el motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10.

La relevancia de esta ficha radica en que documenta un caso de despliegue de un modelo MoE de gran tamaño en hardware de consumo profesional (GB10), empleando cuantización agresiva y decodificación especulativa para maximizar el throughput. El modelo cuenta con 42.516.047.651 parámetros totales según los pesos en safetensors, y el pack ocupa 86,2 GB en el repositorio.

Es importante subrayar que este repositorio es un artefacto derivado: la cuantización la realizó turboderp con exllamav3, la cabeza MTP proviene de HermiHg (licencia Apache-2.0) y los pesos originales son de Qwen bajo licencia Qwen Community 1.0. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks del modelo base es limitada en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con cabezas MTP para decodificación especulativa; formato de pesos EXL3 (ExLlamaV3) |
| Parámetros totales | 42.516.047.651 |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en los comandos de veloGB10 con `--max-seq-len 262144`) |
| Tipos de cuantización | 3,05 bits por peso (EXL3, rama `3.05bpw_h5_ng5`); cabeza MTP a 2,6 bpw |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (pesos base); cabeza MTP Apache-2.0; empaquetado con licencia `other` |
| Formato de pesos | safetensors (EXL3 / exllamav3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura Mixture-of-Experts, según indican las etiquetas del repositorio (`moe`) y la mención explícita a "routed experts" en la model card. El pack incorpora además una cabeza MTP (Multi-Token Prediction) para decodificación especulativa: el modelo redacta varios tokens candidatos por paso y el modelo completo los verifica, de modo que la cabeza afecta únicamente a la velocidad y nunca a la salida final. La cabeza añadida corresponde a los 59 tensores no-expertos de la versión optimizada de HermiHg; los expertos enrutados de la capa MTP permanecen los del propio pack EXL3.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineación en el modelo original. La cuantización a 3,05 bpw la realizó turboderp con exllamav3 y se redistribuye byte a byte sin reconversión ni reempaquetado. La innovación técnica destacable del pack es la integración de la cabeza MTP con el motor veloGB10, que permite decodificación especulativa con tasas de aceptación en torno al 71-72 % medidas en producción.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.8-Flash-Next está orientado a tareas de razonamiento general; la model card menciona "thinking on" como modo de muestreo por defecto en las pruebas.
- Generación de código: los benchmarks internos del pack incluyen una columna "Code turn decode", lo que indica uso previsto en turnos de código.
- Decodificación especulativa: soporte nativo de MTP con `--mtp=auto`, con tasas de aceptación del 70,8-72,1 % según topología.
- Contexto largo: ventana configurable de hasta 262.144 tokens en los comandos de despliegue.
- Servidor compatible con la API de OpenAI (`/v1`), lo que facilita la integración con clientes existentes.
- Soporte de prefix caching (`--prefix-cache on`) para reutilizar prefijos en conversaciones multi-turno.
- Soporte multi-nodo: tensor parallelism (TP=1, 2 o 4) con transferencia de pesos por red y caché local en cada nodo.
- Capacidades de tool calling, agentes, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en clústeres DGX Spark / GB10: el pack está optimizado para veloGB10 y permite servir el modelo en una, dos o cuatro máquinas GB10, con transferencia de pesos por red y caché local, lo que reduce el coste de arranque en despliegues multi-nodo.
- Servicio de API compatible con OpenAI: al exponer un endpoint `/v1` en el puerto 9000, se puede integrar directamente en aplicaciones existentes que ya consumen la API de OpenAI sin cambios en el cliente.
- Asistentes conversacionales de contexto largo: la ventana de 262.144 tokens permite mantener conversaciones multi-turno extensas o procesar documentos largos sin truncamiento.
- Generación de código en producción: el rendimiento medido en turnos de código (134-199 tok/s de decodificación según topología) lo hace adecuado para autocompletado y generación de código en pipelines de CI/CD.
- Procesamiento por lotes con concurrencia moderada: con `--max-batch 2` y un agregado de 100-169 tok/s en dos peticiones simultáneas, es viable para tareas de generación por lotes con latencia aceptable.
- Investigación en decodificación especulativa: el pack incluye la cabeza MTP y reporta tasas de aceptación, lo que lo convierte en un banco de pruebas para estudiar el impacto de MTP en throughput real.
- Prototipado en hardware de gama profesional: al ocupar 86,2 GB y caber en configuraciones de 1-4 GB10, permite experimentar con un MoE de 42,5 mil millones de parámetros sin acceso a clústeres de GPUs de datacenter.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de VeloBench sobre la API servida en máquinas NVIDIA DGX Spark-class GB10 (2026-11-05, builds de desarrollo de veloGB10 0.7.7), con muestreo de producción, thinking activado y una petición a la vez en las columnas de petición única. La decodificación se mide en tokens de salida por segundo e incluye decodificación especulativa. Una ejecución por celda, con variación de ±10 %.

| Topología | Fuente del borrador | Decode turno de código (tok/s) | Decode turno de relato (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptación del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP HermiHg | 134 | 65 | 77 | 2.015 | 100 | 72,0 % |
| TP=2 | Cabeza MTP HermiHg | 152 | 86 | 103 | 3.370 | 161 | 72,1 % |
| TP=4 | Cabeza MTP HermiHg | 199 | 106 | 133 | 3.913 | 169 | 70,8 % |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para el modelo base ni para el pack cuantizado.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 86,2 GB, por lo que se necesita al menos esa cantidad de memoria agregada entre las GPUs del despliegue; con TP=1 cabe en una única GB10.
- GPU recomendadas: NVIDIA DGX Spark / GB10 (hardware objetivo del pack); no se documenta compatibilidad con A100, H100 o RTX 4090.
- Cabe en GPU de consumo: no disponible; el pack está pensado para GB10 y no se indica soporte en RTX 4090 u otras consumer.
- Opciones de despliegue: motor veloGB10 (`gb10_inference`) con servidor compatible con OpenAI; también cualquier framework que lea el formato EXL3 / ExLlamaV3. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Topologías soportadas: TP=1 (una GB10), TP=2 (dos GB10) y TP=4 (cuatro GB10), con nodos que no requieren copia local del modelo.
- Latencia y throughput: prefill de 2.015-3.913 tok/s y decode de 77-133 tok/s (mediana todos los turnos) según topología; agregado de 100-169 tok/s con dos peticiones simultáneas.
- Red: soporte de RoCE con `--rdma-dev <rail1>,<rail2>` para seleccionar el par de puertos en máquinas con dos pares activos; con un solo par se detecta automáticamente.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-3.05bpw-HermiHg-MTP (este pack) | 42.516.047.651 | 262.144 tokens | EXL3 3,05 bpw + MTP | Qwen Community 1.0 / Apache-2.0 (cabeza) | Hugging Face |
| doth4580/Qwen3.8-Flash-Next-EXL3-3.05bpw | no disponible | no disponible | EXL3 3,05 bpw | Qwen Community 1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (original) | no disponible | no disponible | pesos completos | Qwen Community 1.0 | Hugging Face |
| HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3 | no disponible | no disponible | EXL3 2,6 bpw (cabeza MTP) | Apache-2.0 | Hugging Face |

No se dispone de información sobre modelos comparables de otros fabricantes con parámetros, contexto y rendimiento verificables en la documentación proporcionada.

## Limitaciones y advertencias

- Este repositorio no contiene los pesos originales: es una cuantización a 3,05 bpw, lo que introduce pérdida de precisión respecto al modelo base en precisión completa; no se documenta la magnitud de esa degradación.
- La licencia es Qwen Community License 1.0 (etiquetada como `other`), no una licencia permisiva estándar; es necesario revisar sus términos antes de cualquier uso comercial.
- La cabeza MTP añadida es de HermiHg bajo Apache-2.0, pero los expertos enrutados de la capa MTP son los del pack EXL3 original, no los de HermiHg; mezclar componentes de distinta procedencia puede complicar la trazabilidad.
- El pack está publicado "primariamente" para veloGB10; aunque el formato EXL3 es estándar, no se garantiza el funcionamiento en otros frameworks y no se han publicado pruebas fuera de ese motor.
- Los benchmarks reportados son de una sola ejecución por celda, con variación de ±10 %, y sobre builds de desarrollo de veloGB10 0.7.7; no deben tomarse como cifras de producción estables.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base en la documentación proporcionada.
- El rendimiento en turnos de relato (65-106 tok/s) es notablemente inferior al de turnos de código (134-199 tok/s), lo que sugiere sensibilidad al tipo de contenido.
- El despliegue multi-nodo requiere configuración de red RoCE y sincronización entre máquinas; los nodos no necesitan copia del modelo, pero sí el binario de veloGB10 y conectividad con la cabeza.
- El número de descargas y likes es 0 y el repositorio se creó en noviembre de 2026, por lo que no hay evidencia de adopción ni validación por parte de la comunidad.

## Enlaces

- Repositorio del pack: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.05bpw-HermiHg-MTP
- Pack base sin cabeza MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.05bpw
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cuantización EXL3 de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabeza MTP optimizada de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Repositorio exllamav3: https://github.com/turboderp-org/exllamav3
