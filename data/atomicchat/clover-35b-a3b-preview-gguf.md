# AtomicChat/Clover-35B-A3B-Preview-GGUF

## Resumen

Clover-35B-A3B-Preview es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por DiffuSpace, derivado de Qwen3.6-35B-A3B y entrenado con un paradigma de difusión por bloques (block-diffusion) en lugar de la generación autorregresiva convencional. Cuenta con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, con una ventana de contexto de 128.000 tokens y el modo de razonamiento (thinking) activado por defecto. Se distribuye bajo licencia Apache-2.0.

La ficha que nos ocupa documenta los archivos GGUF publicados por AtomicChat, el equipo detrás de la aplicación Atomic Chat, que ha cuantizado los pesos BF16 originales de DiffuSpace para su uso en llama.cpp. Los ficheros emplean una metodología propia denominada Atomic Dynamic (AD), con una matriz de importancia (imatrix) recogida sobre los pesos BF16 originales a partir de 4.000 fragmentos de 512 tokens de su corpus de calibración. El rango de tamaños va de 13,7 GB a 36,9 GB en disco, cubriendo desde GPUs de 16 GB hasta configuraciones de 48 GB o más.

La relevancia actual del modelo reside en dos factores: por un lado, explora una arquitectura híbrida poco común que combina atención lineal con difusión por bloques, lo que lo convierte en un caso de estudio interesante para investigadores; por otro, la disponibilidad de cuantizaciones GGUF verificadas byte a byte contra la conversión oficial de llama.cpp (b12052 y posteriores) facilita su despliegue local en hardware de consumo. No obstante, la propia model card advierte de que los ficheros solo cargan en versiones recientes de llama.cpp y de que el soporte es únicamente autorregresivo, sin las capacidades de difusión por bloques del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con difusión por bloques y atención lineal (derivada de Qwen3.6-35B-A3B) |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | ~3 B por token (aproximado, según model card) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | Q8_0, AD-Q6_K-Q5_K, AD-Q5_K-Q4_K, AD-Q4_K-IQ4_XS, AD-IQ4_XS-IQ3_S, AD-IQ3_S-IQ3_XXS, AD-IQ3_XXS-IQ2_S |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en BF16 en el repositorio base |

## Arquitectura y entrenamiento

El modelo base, Diffuspace/Clover-35B-A3B-Preview, es un transformer de mezcla de expertos con difusión por bloques: en lugar de predecir token a token de forma estrictamente secuencial, el modelo original emplea un esquema de difusión sobre bloques de tokens. Según la model card del repositorio GGUF, la arquitectura incorpora además mecanismos de atención lineal, evidenciados por los 30 tensores `ssm_a` (decaimiento de atención lineal, almacenados como `-exp(A_log)`) que aparecen en la conversión. El modelo deriva de Qwen3.6-35B-A3B, del que hereda presumiblemente la estructura MoE y parte del diseño.

Los detalles concretos sobre el volumen de tokens de entrenamiento, la composición del dataset y las etapas de alineación (RLHF, DPO u otras) no están disponibles en la información proporcionada. La model card del GGUF sí documenta el proceso de cuantización: la matriz de importancia se recolectó sobre los pesos BF16 originales con `--parse-special` sobre 4.000 fragmentos de 512 tokens de un corpus de calibración renderizado con el formato de chat de la familia Qwen3.5 (razonamiento conservado en cada turno), que es el que sigue la plantilla de Clover. La innovación técnica destacable es la propia cuantización Atomic Dynamic, con métricas de divergencia KL y top-1 medidas contra el BF16 original sobre 87 fragmentos de 4.096 tokens en un H100.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de razonamiento explícito (thinking mode) activado por defecto.
- Razonamiento de varios pasos y descomposición de problemas, heredado del linaje Qwen3.6.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Contexto largo de hasta 128.000 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente en la información disponible.
- Capacidades de visión o audio: no disponibles en este modelo (es text-generation).
- Variante sin rechazos (Uncensored) publicada por el mismo autor, con builds preajustados y un adaptador LoRA compatible con estas cuantizaciones.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno con contexto largo gracias a sus 128.000 tokens de ventana, ejecutándose en local mediante llama.cpp con las cuantizaciones AD-Q4_K-IQ4_XS (20,1 GB) en GPUs de 24 GB.
- Análisis de documentos extensos: informes técnicos, contratos o bases de código de hasta 128.000 tokens pueden procesarse en una sola pasada, aprovechando el contexto largo y el modo de razonamiento para resumir y extraer conclusiones.
- Razonamiento asistido en investigación: el modo thinking por defecto lo hace adecuado para tareas de matemáticas y lógica donde se requiere una cadena de razonamiento explícita, aunque los benchmarks no están publicados.
- Despliegue en hardware de consumo: las cuantizaciones de 13,7 GB y 15,5 GB caben en GPUs de 16 GB (por ejemplo, RTX 4060 Ti 16 GB, RTX 4080), permitiendo inferencia local offline con la aplicación Atomic Chat o llama.cpp.
- Prototipado de agentes conversacionales en inglés y chino: útil para equipos que necesitan un modelo bilingüe en esos dos idiomas con licencia Apache-2.0 permisiva para uso comercial.
- Evaluación de arquitecturas de difusión: investigadores interesados en modelos de difusión por bloques pueden usar estas cuantizaciones para experimentar con la variante autorregresiva soportada por llama.cpp y comparar su comportamiento con el modelo original.
- Generación de texto en entornos con requisitos de privacidad: al ejecutarse completamente en local, es apto para procesar datos sensibles sin enviarlos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente proporciona métricas de fidelidad de la cuantización respecto al BF16 original, medidas sobre 87 fragmentos de 4.096 tokens con llama.cpp `4838ffb` (PR #31306), decodificación simple y una H100:

| Archivo | Tamano en disco | VRAM recomendada | Divergencia KL | top-1 |
|---|---:|---|---:|---:|
| Q8_0 | 36,9 GB | 48 GB o más | 0,0259 | 93,04% |
| AD-Q6_K-Q5_K | 26,3 GB | 32 GB | 0,0293 | 92,44% |
| AD-Q5_K-Q4_K | 22,1 GB | 24 GB, contexto corto | 0,0416 | 90,90% |
| AD-Q4_K-IQ4_XS | 20,1 GB | 24 GB | 0,0486 | 90,17% |
| AD-IQ4_XS-IQ3_S | 17,6 GB | 20 GB | 0,0764 | 87,82% |
| AD-IQ3_S-IQ3_XXS | 15,5 GB | 16 GB, contexto corto | 0,1101 | 85,46% |
| AD-IQ3_XXS-IQ2_S | 13,7 GB | 16 GB | 0,1735 | 81,86% |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 16 GB (cuantización AD-IQ3_XXS-IQ2_S, 13,7 GB en disco) y 48 GB o más (Q8_0, 36,9 GB en disco). Para contexto completo de 128.000 tokens se necesita margen adicional de VRAM para la caché KV.
- GPU recomendadas: H100 o A100 para Q8_0 y contextos largos; RTX 4090 (24 GB) para AD-Q4_K-IQ4_XS y AD-Q5_K-Q4_K con contexto corto; RTX 4080 o RTX 4060 Ti 16 GB para las cuantizaciones de 13,7-15,5 GB.
- Cabe en GPU de consumo: sí, en las cuantizaciones de 13,7 GB, 15,5 GB y 17,6 GB (16-20 GB de VRAM), y en 24 GB con las de 20,1 GB y 22,1 GB si se limita el contexto.
- Opciones de despliegue: llama.cpp b12052 o posterior (obligatorio; versiones anteriores rechazan los ficheros), aplicación Atomic Chat, y cualquier frontend compatible con GGUF que use llama.cpp como backend. vLLM, TGI u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. La model card solo indica que las mediciones se hicieron con decodificación simple en una H100, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato disponible |
|---|---:|---:|---:|---|---|
| Clover-35B-A3B-Preview (GGUF) | 34,66 B | ~3 B | 128K | Apache-2.0 | GGUF |
| Qwen3.6-35B-A3B (modelo base del que deriva) | ~35 B | ~3 B | 128K | Apache-2.0 (según model card) | safetensors, GGUF |
| Qwen3.8-27B (referencia del mismo publicador) | 27 B | no disponible | no disponible | no disponible | GGUF |

La comparación con alternativas de la misma categoría (MoE de ~35 B con ~3 B activos) se limita al modelo base Qwen3.6-35B-A3B, del que Clover hereda arquitectura y contexto. No se dispone de datos de rendimiento comparativo entre ambos, por lo que no es posible establecer una comparativa cuantitativa de calidad. Otros modelos MoE de tamaño similar no están documentados en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados: solo inglés y chino según la model card; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual en la información disponible.
- Sesgos: no se documentan sesgos conocidos ni procesos de mitigación en la información proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Diffuspace/Clover-35B-A3B-Preview y de Qwen3.6-35B-A3B.
- Compatibilidad estricta: los ficheros requieren llama.cpp b12052 o posterior; versiones anteriores los rechazan. El soporte es únicamente autorregresivo: los 120 tensores de difusión por bloques se eliminan en la conversión, por lo que no se reproduce el paradigma de difusión del modelo original.
- La variante sin rechazos (Uncensored) elimina los mecanismos de seguridad, lo que aumenta el riesgo de generar contenido inapropiado; no debe usarse en producción sin filtros adicionales.
- El contexto de 128.000 tokens requiere VRAM adicional significativa para la caché KV; las cuantizaciones de 22,1 GB y 15,5 GB se recomiendan solo para contexto corto.
- Modelo en estado "Preview": puede contener inestabilidades no documentadas y no se garantiza su mantenimiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Clover-35B-A3B-Preview-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Variante sin rechazos: https://huggingface.co/AtomicChat/Clover-35B-A3B-Preview-Uncensored-GGUF
- Repositorio de métricas e imatrix: https://huggingface.co/AtomicChat/Clover-35B-A3B-Preview-GGUF/tree/main/imatrix
- Revisión con los ficheros originales: https://huggingface.co/AtomicChat/Clover-35B-A3B-Preview-GGUF/tree/4f7e2918e5315634d9d9720ea4f6e8a9a627a875
- PR de llama.cpp con soporte autorregresivo: https://github.com/ggml-org/llama.cpp/pull/31306
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- Cuenta de X de Atomic Chat: https://x.com/atomic_chat_hq
- Modelo de referencia Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
