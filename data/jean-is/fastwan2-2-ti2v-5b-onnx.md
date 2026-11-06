# jean-is/FastWan2.2-TI2V-5B-ONNX

## Resumen

FastWan2.2-TI2V-5B-ONNX es una exportacion a ONNX del modelo de generacion de video por texto FastWan 2.2 TI2V-5B, desarrollado originalmente por el equipo de FastVideo y destilado con DMD (Distribution Matching Distillation) para generar en solo tres pasos de muestreo. Esta version, publicada por el usuario jean-is, adapta el pipeline completo —codificador de texto umT5-XXL, transformer de difusion y decodificador TAEHV— para ejecutarse con ONNX Runtime Web sobre WebGPU, es decir, directamente en el navegador sin servidor de GPU dedicado.

El problema que resuelve es doble: por un lado, la destilacion DMD de FastVideo reduce el coste de inferencia de Wan 2.2 (que normalmente requiere decenas de pasos) a tres pasos; por otro, la exportacion a ONNX con cuantizacion int8 permite generar clips de video de 5 segundos a 16 fps y hasta 832x480 en un navegador de escritorio, en unos 90 segundos sobre un Apple M3 Max en Chrome.

El modelo base es un transformer de difusion de 5 mil millones de parametros de la familia Wan 2.2 (Alibaba), con atencion completa (full attention) tras la destilacion de FastVideo. El repositorio ocupa 11,5 GB y esta publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion text-to-video (Wan 2.2 TI2V) con codificador de texto umT5-XXL y decodificador TAEHV |
| Parametros totales | 5 mil millones (modelo base Wan 2.2 TI2V-5B); desglose del repositorio: transformer 5,43 GB, text encoder ~6 GB, decoder 20 MB |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 512 tokens de texto (prompt truncado a 512 tokens) |
| Tipos de cuantizacion | int8 (MatMulNBits, bloques de 32, simetrica, accuracy level 1) en text encoder y bloques del transformer; fp16 en embedders, salida y decoder |
| Idiomas soportados | no disponible (el tokenizer es umT5, con soporte multilingue heredado, pero no se documenta explicitamente) |
| Licencia | Apache 2.0 (decoder TAEHV bajo MIT) |
| Formato de pesos | ONNX (con archivos de datos externos .data0–.data2); embeddings del text encoder en int8 con escala fp16 |

## Arquitectura y entrenamiento

El modelo base es Wan 2.2 TI2V-5B, un transformer de difusion para generacion de video text-to-video de 5 mil millones de parametros, al que FastVideo aplico destilacion por DMD (Distribution Matching Distillation) y sustituyo la atencion por ventanas por atencion completa (full attention), reduciendo el muestreo a tres pasos con el scheduler `FlowMatchEulerDiscreteScheduler(shift=8)`. Los timesteps utilizados son 1000, 757 y 522 (sigmas 1, 0.756757 y 0.521739), sin guidance (CFG).

La exportacion a ONNX divide el pipeline en cuatro componentes: (1) el tokenizer de umT5 con los embeddings del codificador de texto almacenados como filas int8 con escala fp16 (1,05 GB); (2) el encoder umT5-XXL dividido en tres grafos ONNX de ocho capas cada uno, cuantizados a 8 bits por bloques de 32, con la proyeccion `wo` calculada en fp32; (3) el transformer de difusion cuantizado a 8 bits en sus bloques, con embedders y salida en fp16 y atencion implementada como `com.microsoft.MultiHeadAttention`; y (4) el decodificador TAEHV (`taew2_2`, de madebyollin) en fp16, que decodifica el latente `[21, 48, H/16, W/16]` en 81 fotogramas RGB.

Los latentes usan una representacion comprimida donde cada token espacial agrupa bloques 2x2 del latente (192 numeros por token, canal-major), con tablas RoPE separadas para eje temporal (44 frecuencias), filas y columnas (42 cada una).

## Capacidades

- Generacion de video text-to-video: clips de 5 segundos a 16 fps (81 fotogramas) en resoluciones 832x480, 480x832 o 640x640.
- Ejecucion 100% en navegador via ONNX Runtime Web con backend WebGPU, sin necesidad de servidor de inferencia.
- Inferencia en tres pasos gracias a la destilacion DMD, sin classifier-free guidance.
- Codificador de texto umT5-XXL multilingue (heredado de Wan 2.2), con prompts de hasta 512 tokens.
- Precision verificada frente a la referencia en PyTorch bf16: similitud coseno de 0,994–0,998 en el text encoder y 0,998 en la primera pasada del transformer; el decoder TAEHV alcanza 26,4 dB frente al decoder original de Wan 2.2 sobre el mismo latente.
- No soporta vision, audio ni tool calling; es un modelo generativo de video puro.

## Casos de uso

- Generacion de video en el navegador: la exportacion WebGPU permite crear una demo de text-to-video sin backend, ideal para productos web que quieren ofrecer generacion de clips cortos sin coste de servidor de GPU.
- Prototipado rapido de prompts de video: con 90 segundos por clip en un M3 Max, un disenador puede iterar decenas de descripciones en una sesion sin infraestructura.
- Generacion local y privada: al ejecutarse en el dispositivo, el prompt y el video resultante nunca salen del equipo del usuario, util para entornos con requisitos de privacidad.
- Integracion en aplicaciones Electron o PWAs: el formato ONNX es agnostico del runtime, por lo que puede empaquetarse en aplicaciones de escritorio con aceleracion WebGPU.
- Benchmark educativo de pipelines de difusion: el repositorio de origen documenta el proceso de exportacion, el formato de latentes y las tablas RoPE, util para quien quiera aprender a exportar modelos de difusion a ONNX.
- Generacion batch en clientes potentes: en maquinas con GPU discreta compatible con WebGPU (por ejemplo, RTX 4090), el throughput por clip deberia ser inferior a los 90 segundos del M3 Max, permitiendo colas de generacion locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, VBench, FVD, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son de precision y latencia de la propia exportacion:

| Metrica | Valor |
|---|---|
| Similitud coseno del text encoder vs. PyTorch bf16 | 0,994–0,998 |
| Similitud coseno de la primera pasada del transformer | 0,998 (0,9995 en fp16 puro) |
| PSNR del decoder TAEHV vs. decoder original de Wan 2.2 | 26,4 dB |
| Latencia por clip de 5 s (832x480, 16 fps) en M3 Max, Chrome | ~90 segundos |
| Latencia por clip en Safari 27 | ~3,4 minutos |

## Requisitos de hardware

- Espacio en disco: 11,5 GB para el repositorio completo (transformer 5,43 GB, text encoder ~6 GB, tokenizer y decoder ~41 MB).
- VRAM: no se documenta un requisito minimo explicito; dado el tamano de los pesos (unos 11,5 GB con partes cuantizadas a int8 y fp16), se recomienda una GPU con al menos 12–16 GB de VRAM o un navegador con soporte de memoria suficiente en WebGPU. No disponible un dato oficial.
- GPU de referencia publicada: Apple M3 Max (via WebGPU en Chrome, ~90 s por clip; Safari 27, ~3,4 min).
- Consumer GPUs: plausible en GPUs de escritorio recientes con buen soporte WebGPU (RTX 3090/4090, Radeon RX 7000), aunque no hay mediciones publicadas; no disponible confirmacion oficial.
- Despliegue: ONNX Runtime Web con backend WebGPU (caso de uso principal); ONNX Runtime nativo en CPU/GPU tambien es posible por el formato. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicable a modelos de difusion en este formato).
- Latencia: ~90 s por clip de 5 s a 832x480 en M3 Max/Chrome; 3,4 min en Safari 27. Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Pasos de muestreo | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| FastWan2.2-TI2V-5B-ONNX (este) | 5B | ONNX int8/fp16 | 3 (DMD) | Apache 2.0 | Si (WebGPU) |
| FastWan2.2-TI2V-5B-FullAttn-Diffusers (base) | 5B | safetensors (Diffusers) | 3 (DMD) | Apache 2.0 | No (requiere PyTorch + GPU dedicada) |
| Wan 2.2 TI2V-5B (original, Alibaba) | 5B | safetensors | Decenas de pasos | Apache 2.0 | No |
| LTX-Video (Lightricks) | 2B | safetensors | ~4-8 | Licencia propia (no comercial restringida en versiones iniciales) | No de forma nativa |

La ventaja diferencial de esta ficha es la portabilidad: es la unica variante de la familia Wan 2.2 documentada para ejecutarse integramente en un navegador via WebGPU, a costa de una ligera perdida de precision (26,4 dB en el decoder) frente a la pila PyTorch original.

## Limitaciones y advertencias

- Resolucion y duracion fijas: solo 5 segundos a 16 fps (81 fotogramas) en 832x480, 480x832 o 640x640; no hay generacion de video largo ni de mayor resolucion.
- Cuantizacion agresiva: int8 por bloques de 32 en el text encoder y el transformer introduce pequenas desviaciones (coseno 0,994–0,998); el autor las describe como "una toma ligeramente distinta", pero pueden ser visibles en detalles finos.
- Decoder sustituido: TAEHV alcanza 26,4 dB frente al decoder original de Wan 2.2, lo que implica perdida de fidelidad perceptible en texturas y detalle.
- Solo text-to-video: no admite image-to-video, edicion, audio sincronizado ni control por pose/depth en esta exportacion.
- Sin datos de benchmarks estandar de calidad de video (VBench, FVD), por lo que la calidad no es comparable cuantitativamente con otros modelos publicados.
- Riesgo de alucinacion visual tipico de modelos de difusion: anatomia incorrecta, objetos incoherentes y texto ilegible en el video generado.
- Dependencia de WebGPU: requiere navegadores con soporte maduro de WebGPU; el rendimiento varia mucho entre navegadores (Chrome 90 s vs. Safari 27 3,4 min en el mismo hardware).
- Licencia: Apache 2.0 permite uso comercial; el decoder TAEHV es MIT. Sin restricciones conocidas, aunque el modelo base Wan 2.2 puede heredar consideraciones de contenido de Alibaba no documentadas aqui.
- Descargas y adopcion: el repositorio registra 0 descargas y 1 like, por lo que carece de validacion comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jean-is/FastWan2.2-TI2V-5B-ONNX
- Modelo base (FastVideo): https://huggingface.co/FastVideo/FastWan2.2-TI2V-5B-FullAttn-Diffusers
- Documentacion del proceso de exportacion y mediciones: https://github.com/jean-is/jean/tree/main/spikes/films
- Proyecto del autor (Jean): https://jean.is
- Decoder TAEHV (madebyollin): https://github.com/madebyollin/taehv
