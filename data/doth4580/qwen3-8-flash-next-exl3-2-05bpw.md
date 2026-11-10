# doth4580/Qwen3.8-Flash-Next-EXL3-2.05bpw

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen. Este repositorio concreto, publicado por el usuario doth4580, no contiene los pesos originales en precisión completa, sino una redistribución byte a byte de la cuantización EXL3 de 2,05 bits por peso (variante `2.05bpw_h4_ng4`) realizada por turboderp con la herramienta exllamav3. El pack está pensado principalmente para el motor de inferencia veloGB10 sobre una, dos o cuatro máquinas NVIDIA DGX Spark / GB10.

El modelo cuenta con 18.184.164.864 parámetros totales según los safetensors del repositorio, y el pack cuantizado ocupa 62,8 GB. La ventana de contexto declarada en los comandos de referencia del autor es de 262.144 tokens, con un máximo de 65.536 tokens de generación por petición. La licencia aplicable es la Qwen Community License 1.0, heredada del modelo base.

La relevancia de esta ficha es doble: por un lado documenta el modelo base Qwen3.8-Flash-Next, y por otro describe un artefacto de despliegue muy específico (EXL3 a 2,05 bpw) orientado a hardware GB10 con decodificación especulativa mediante cabezas MTP. El autor publica cifras medidas de throughput y aceptación de draft sobre esa topología, lo que permite evaluar el rendimiento real en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre transformer; detalles internos del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | 18.184.164.864 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuracion de referencia con veloGB10); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | EXL3 a 2,05 bpw (variante `2.05bpw_h4_ng4`); pesos originales en BF16 no incluidos en este repo |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base es un MoE según las etiquetas del repositorio y la propia model card. No se dispone en la informacion proporcionada de detalles sobre el número de expertos, la proporción de parámetros activos por token, la composición del dataset de entrenamiento, el número de tokens vistos ni las fases de alineación (RLHF, DPO u otras). Tampoco se documentan innovaciones de atención (linear attention, decodificación especulativa nativa, etc.) más allá de la existencia de una cabeza MTP (Multi-Token Prediction) incluida en el pack, que se usa para decodificación especulativa.

La innovación técnica relevante en este repositorio es la cuantización EXL3 a 2,05 bpw con grupo de tamaño 4 (`h4_ng4`), que reduce los 18.184 millones de parámetros a un pack de 62,8 GB. El autor redistribuye los pesos sin modificarlos y añade instrucciones de despliegue para veloGB10, incluyendo paralelismo de tensor (TP=1, TP=2, TP=4) sobre nodos GB10 conectados por RoCE, con reparto de pesos por red y caché local en cada nodo. Se documentan además dos cabezas MTP alternativas (HermiHg y DotH-MTP) que sustituyen a la del pack y solo afectan a la velocidad, no a la salida.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un LLM de propósito general; la model card citada no detalla capacidades específicas más allá de la etiqueta MoE.
- Modo thinking: las pruebas de rendimiento se ejecutan con "thinking on", lo que indica soporte de razonamiento extendido.
- Decodificación especulativa: soporte de cabeza MTP propia y de cabezas alternativas (HermiHg, DotH-MTP) para acelerar la generación.
- Servicio compatible con OpenAI: el motor veloGB10 expone un endpoint `/v1` compatible con la API de OpenAI.
- Procesamiento por lotes: `--max-batch` configurable (probado con 2 peticiones concurrentes) y prefix caching (`--prefix-cache on`).
- Capacidades multilingües: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Visión, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en clústeres DGX Spark / GB10: el pack está diseñado para cargarse con veloGB10 en una, dos o cuatro máquinas GB10, con reparto de pesos por red y caché local, lo que permite servir un modelo de 18.000 millones de parámetros en hardware de borde con memoria limitada.
- Inferencia de contexto largo: con 262.144 tokens de ventana configurada, es adecuado para analizar documentos extensos, bases de código completas o historiales de conversación largos en una sola petición.
- Generación de código en producción: las pruebas del autor miden específicamente turnos de código (124-218 tok/s según topología y cabeza), lo que lo hace apto para asistentes de programación con latencia interactiva.
- Servicio de API compatible con OpenAI: al exponer `/v1`, puede integrarse sin cambios en aplicaciones que ya usan el SDK de OpenAI, sustituyendo el endpoint por el del servidor veloGB10.
- Razonamiento con thinking mode: útil para tareas de análisis multi-paso donde se requiere cadena de razonamiento explícita, con la penalización de latencia que ello implica.
- Experimentación con cuantización extrema: sirve como referencia para evaluar la calidad de EXL3 a 2,05 bpw frente a pesos BF16 en tareas de generación y razonamiento.
- Evaluación de cabezas MTP: permite comparar el rendimiento de la cabeza del pack frente a HermiHg y DotH-MTP en la misma topología, con tasas de aceptación de draft del 66-71 %.

## Benchmarks y rendimiento

El autor publica mediciones de VeloBench sobre GB10 con veloGB10 0.7.7 (2026-11-05), con sampling de producción, thinking activado y una petición concurrente en las columnas de una sola petición. La decodificación se mide en tokens de salida por segundo e incluye decodificación especulativa. Cada celda es una sola ejecución con variación aproximada de ±10 %.

| Topologia | Cabeza draft | Decode turno de codigo (tok/s) | Decode turno de relato (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones agregadas (tok/s) | Aceptacion de draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | MTP del pack | 124 | 73 | 97 | 2.091 | 129 | 67,3 % |
| TP=2 | MTP del pack | 166 | 93 | 116 | 3.452 | 162 | 66,3 % |
| TP=4 | MTP del pack | 197 | 122 | 135 | 3.993 | 189 | 67,2 % |
| TP=1 | HermiHg MTP | 145 | 77 | 97 | 2.137 | 119 | 71,0 % |
| TP=2 | HermiHg MTP | 179 | 96 | 125 | 3.432 | 164 | 70,6 % |
| TP=4 | HermiHg MTP | 209 | 116 | 146 | 3.986 | 183 | 71,1 % |
| TP=1 | DotH-MTP | 147 | 77 | 93 | 2.137 | 111 | 68,7 % |
| TP=2 | DotH-MTP | 186 | 94 | 121 | 3.449 | 169 | 70,0 % |
| TP=4 | DotH-MTP | 218 | 113 | 152 | 4.001 | 177 | 70,1 % |

No se han publicado en la informacion disponible resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) para el modelo base ni para esta cuantización.

## Requisitos de hardware

- VRAM estimada: el pack ocupa 62,8 GB en disco; en TP=1 debe caber en la memoria unificada de una GB10, en TP=2 se reparte entre dos máquinas y en TP=4 entre cuatro.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de 1, 2 o 4 nodos. No se documentan requisitos para A100, H100 ni RTX 4090.
- GPU de consumo: no disponible; el pack está orientado a hardware GB10 y no se indica compatibilidad con GPUs de consumo.
- Opciones de despliegue: veloGB10 (`gb10_inference`) es el motor de referencia y el único con el que se han publicado mediciones. Al ser formato EXL3 estándar, cualquier framework que lea ExLlamaV3 podría cargarlo, pero no se aportan pruebas.
- Red: en TP=2 y TP=4 los nodos se comunican por RoCE; con dos pares de puertos activos se selecciona con `--rdma-dev <rail1>,<rail2>`.
- Latencia y throughput: ver tabla de benchmarks. En TP=4 con DotH-MTP se alcanzan 218 tok/s en turnos de código, 152 tok/s de mediana global y 4.001 tok/s de prefill.
- Memoria de contexto: `--max-seq-len 262144` y `--max-tokens 65536` son los valores probados; `--max-batch 2` en todas las configuraciones.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de modelos comparables (mismo tamaño, misma tarea o misma familia) que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia. La comparación más directa posible es entre las tres cabezas MTP probadas sobre este mismo pack, cuyos resultados figuran en la tabla de benchmarks.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (BF16, modelo base) | 18.184.164.864 | no disponible | no disponible | qwen-community-1.0 | Hugging Face (Qwen/Qwen3.8-Flash-Next) |
| Este pack EXL3 2,05 bpw | 18.184.164.864 | 262.144 (config. veloGB10) | 97-152 tok/s mediana decode segun topologia | qwen-community-1.0 | Hugging Face (este repo) |
| Otros modelos de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cuantización agresiva: 2,05 bpw es una compresión extrema; no se han publicado evaluaciones de calidad (perplejidad, benchmarks) que cuantifiquen la degradación frente a BF16.
- Licencia: Qwen Community License 1.0 impone condiciones específicas para uso comercial; es necesario revisar el texto completo antes de desplegar en producción.
- Modelo base no documentado en la información disponible: se desconocen sesgos, composición del dataset y fases de alineación, por lo que el riesgo de alucinación y sesgo no puede acotarse con datos.
- Idiomas: no se especifica la cobertura lingüística; no debe asumirse soporte multilingüe sin verificación.
- Motor de referencia único: las cifras de rendimiento provienen exclusivamente de veloGB10 sobre GB10; el comportamiento en otros frameworks o GPUs no está medido.
- Repositorio espejo: el autor no ha modificado los pesos, pero tampoco ofrece garantías sobre ellos; los derechos quedan en los autores originales.
- Hardware específico: el despliegue en TP=2/TP=4 requiere configuración de red RoCE y puede introducir dependencia de infraestructura poco común.
- Variabilidad de las mediciones: una sola ejecución por celda con ±10 % de variación; las cifras no deben tratarse como valores garantizados.
- Fecha del repositorio: creado y actualizado el 2026-11-09, con 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-2.05bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack EXL3 original de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Motor exllamav3: https://github.com/turboderp-org/exllamav3
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- Cabeza MTP de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Cabeza MTP DotH: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
