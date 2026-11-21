# grpdxr/Qwen3.8-27B-PL-GGUF

## Resumen

Qwen3.8-27B-PL-GGUF es una cuantización mixta de precisión reducida (2,5 bits efectivos) del modelo Qwen3.8-27B de Alibaba, publicada por el usuario grpdxr. No se trata de un fine-tune: los pesos son los originales de Qwen3.8-27B, pero la asignación de bits por bloque se ha optimizado midiendo el rendimiento en polaco, de modo que las capas y tensores críticos para ese idioma conservan mayor precisión. El resultado ocupa 9,56 GB en disco y cabe en una única GPU de 24 GB, con dos ranuras paralelas de 64K de contexto consumiendo 14,2 GB de VRAM.

El modelo incorpora la cabeza MTP (multi-token prediction) de Qwen para decodificación especulativa, lo que permite alcanzar 61 tokens/s con una ranura y 45 tokens/s por flujo con dos ranuras ocupadas en una RTX 3090. Está pensado para inferencia en `llama.cpp` estándar y se distribuye en formato GGUF, con licencia Apache 2.0.

Su relevancia radica en demostrar que una cuantización agresiva guiada por evaluación lingüística concreta (en este caso, polaco) puede acercarse al rendimiento de modelos mucho más grandes en tareas de razonamiento y comprensión documental, a costa de un tamaño reducido y con requisitos de hardware asequibles para un desarrollador individual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B), con cabeza MTP para decodificacion especulativa |
| Parametros totales | 200.278.016 (dato de safetensors del repo; el modelo base se denomina 27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64K tokens por ranura (hasta 2 ranuras paralelas) |
| Tipos de cuantizacion | GGUF mixta de ~2,5 bits (IQ2_XS base con bloques 0-7 y 56-63 en IQ3_XXS, embedding Q4_K, KV cache q4_0) |
| Idiomas soportados | pl, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer denso de la familia Qwen3.8. La contribución de esta ficha no es el entrenamiento, sino la cuantización: se parte de la cuantización GSQ-RCO de ISTA-DASLab y se aplica una asignación de precisión mixta por bloques. Concretamente, los bloques 0-7 y 56-63 se elevan a IQ3_XXS, el embedding de tokens se sube a Q4_K y la KV cache se cuantiza a q4_0. La selección de qué pesos reciben más bits se guió midiendo el rendimiento en polaco (puntuación lingüística, razonamiento y transcripciones), no mediante criterios genéricos de perplejidad.

La model card reporta divergencia KL frente al modelo completo Qwen3.8-27B en Q8_0: para texto de razonamiento, 0,00072 de mediana con 87,4 % de coincidencia en el token más probable para la versión DASLab sin modificar, mejorando a 0,00057 / 87,7 % al añadir el embedding Q4_K. En texto polaco, la divergencia baja de 0,0569 a 0,0452 con el embedding Q4_K (84,2 % de coincidencia en el top token). No se dispone de datos sobre el número de tokens de entrenamiento del modelo base ni sobre el proceso de RLHF/DPO empleado por Qwen, ya que la model card no los detalla.

## Capacidades

- Generación de texto en polaco e inglés con calidad lingüística alta para su tamaño (0,5 errores de idioma por cada 100 palabras en chat, según la evaluación del autor).
- Razonamiento multi-paso: resuelve problemas de lógica, cálculos de facturas, plazos legales, probabilidades y análisis de registros largos (~10K tokens) en polaco.
- Comprensión documental: responde preguntas sobre documentos polacos de 18K caracteres y sobre transcripciones de llamadas de ventas de 12-16 minutos.
- Decodificación especulativa mediante la cabeza MTP de Qwen, que acelera la generación.
- Soporte de dos ranuras paralelas de 64K de contexto en una sola GPU de 24 GB.
- Capacidad de razonamiento con `reasoning_effort` configurable (la evaluación usa nivel medium).
- No se documenta soporte explícito de tool calling, function calling ni modo visión en la información disponible.

## Casos de uso

- Atención al cliente en polaco: el modelo gestiona conversaciones multi-turno con hasta 64K tokens de contexto por ranura, lo que permite mantener el historial completo de una reclamación o incidencia sin truncar. Su baja tasa de errores lingüísticos (0,5 por 100 palabras) lo hace adecuado para respuestas de cara al usuario.
- Análisis de transcripciones de llamadas: con 71 de 72 preguntas correctas sobre ocho transcripciones sintéticas de ventas, puede extraer hechos, cálculos, atribuciones de habla y detectar premisas falsas en grabaciones de 12-16 minutos.
- Procesamiento de documentos legales o administrativos en polaco: responde preguntas sobre documentos de 18K caracteres con precisión del 100 % en la evaluación del autor, útil para resúmenes de contratos o extracción de plazos.
- Razonamiento sobre registros operativos: resuelve problemas sobre logs de almacén de ~10K tokens, adecuado para auditoría interna o análisis de incidencias logísticas.
- Despliegue en estación de trabajo con una sola GPU: con 9,56 GB de pesos y 11,7 GB de VRAM pico con una ranura de 64K, cabe en RTX 3090, RTX 4090 o A5000, permitiendo inferencia local sin infraestructura cloud.
- Servicio multi-cliente con dos ranuras: dos flujos concurrentes de 64K en 14,2 GB de VRAM y 45 tokens/s por flujo permiten atender a dos usuarios simultáneos en una única tarjeta.
- Generación de código y texto técnico en inglés: al conservar los pesos de Qwen3.8-27B, mantiene capacidades generales del modelo base, aunque la cuantización agresiva puede degradar tareas de código respecto al modelo completo.

## Benchmarks y rendimiento

Los datos provienen de evaluaciones propias del autor, no de benchmarks estándar. Todas las mediciones se realizaron en una RTX 3090 con llama.cpp b11028, `reasoning_effort` medium y temperatura 0,6.

| Modelo | Fichero | VRAM 1 ranura × 64K | VRAM 2 ranuras × 64K | Puntuación polaco | Errores chat /100 palabras | Razonamiento (de 20) | Transcripciones (de 72) |
|---|---|---|---|---|---|---|---|
| Muse-Glimmer-30B-PL IQ2 | 10,54 GB | 10.349 MiB | 10.873 MiB | 93,5 | 0,5 | 18,3 | 71 |
| Muse-Glimmer-30B-PL IQ3 | 11,95 GB | 11.697 MiB | 12.221 MiB | 92,5 | 0,4 | 19,0 (1/40 cut) | 68 |
| **Qwen3.8-27B-PL (MTP, KV q4_0)** | **9,56 GB** | **11.749 MiB** | **14.241 MiB** | **90,6** | **0,5** | **18,0 (2/120 cut)** | **71** |
| **Qwen3.8-27B-PL + LoRA polaco** | **9,96 GB** | **12.149 MiB** | **14.639 MiB** | **92,5** | **0,45** | **18,5 (1/40 cut)** | **71** |
| Muse-Glimmer-30B UD-IQ3_XXS | 13,13 GB | 12.494 MiB | 13.019 MiB | 93 | 0,45 | 17,5 (1/40 cut) | 70 |
| Muse-Glimmer-30B Q4_K_M | 16,76 GB | 16.281 MiB | 16.801 MiB | 97 | 0,15 | 18,5 | 69 |
| Qwen3.8-27B Q4_K_M (sin drafter) | 18,97 GB | 20.457 MiB | 23.041 MiB | 95,5 | 0,6 | 19,0 (1/40 cut) | 71 |
| Saluki (Qwen3.8-27B IQ2 mix) | 7,90 GB | 10.513 MiB | 13.097 MiB | 89,5 | 1,7 | ~13 (1/17 cut) | 71 |
| Bielik-11B-v3.0-Instruct Q8_0 | 11,87 GB | 15.100 MiB (1×32K) | 18.630 MiB (2×32K) | 87,5 | 0,3 | 4,5 (3/80 cut) | 66 |
| Bielik-11B-v3.0-Instruct Q4_K_M | 6,72 GB | 10.256 MiB (1×32K) | 13.800 MiB (2×32K) | 85,5 | 0,2 | 3,3 (3/80 cut) | 66 |
| PLLuM-12B-chat-2512 Q8_0 | 13,1 GB | 17.842 MiB | 23.544 MiB | 80 (3/84 cut) | 0,15 | 1,5 (3/80 cut) | 58 |

Fidelidad respecto al modelo completo (KL divergence frente a Qwen3.8-27B Q8_0, mediana y coincidencia en top token):

| Fichero | Texto de razonamiento | Texto polaco |
|---|---|---|
| DASLab IQ2_XS (sin modificar) | 0,00072 / 87,4 % | 0,0569 / 83,3 % |
| + embedding Q4_K | 0,00057 / 87,7 % | 0,0452 / 84,2 % |
| + bloques 0-7 y 56-63 en IQ3_XXS (este modelo) | no disponible en el extracto | no disponible en el extracto |

## Requisitos de hardware

- VRAM estimada: 11.749 MiB con una ranura de 64K y una petición de ~8K tokens; 14.241 MiB con dos ranuras de 64K ambas ocupadas.
- GPU recomendadas: RTX 3090 (medición de referencia), RTX 4090, A5000, A6000. Cabe en cualquier GPU consumer con 16 GB o más de VRAM.
- Cabe en GPU consumer: sí, en RTX 3090, RTX 4090, RTX 4080 (16 GB, con margen ajustado para una ranura) y superiores.
- Opciones de despliegue: llama.cpp estándar (build b11028 o superior). No se documenta soporte para vLLM, TGI u Ollama en la información disponible, aunque al ser GGUF es compatible con el ecosistema llama.cpp.
- Rendimiento: 61 tokens/s con una ranura y 45 tokens/s por flujo con dos ranuras ocupadas en RTX 3090, gracias a la decodificación especulativa MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Puntuación polaco | Razonamiento (de 20) | Licencia | Tamaño |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-PL (este) | 27B (nominal) | 64K × 2 ranuras | 90,6 | 18,0 | Apache 2.0 | 9,56 GB |
| Muse-Glimmer-30B-PL IQ2 | 30B | no disponible | 93,5 | 18,3 | no disponible | 10,54 GB |
| Saluki (Qwen3.8-27B IQ2) | 27B | no disponible | 89,5 | ~13 | no disponible | 7,90 GB |
| Bielik-11B-v3.0-Instruct Q8_0 | 11B | 32K | 87,5 | 4,5 | no disponible | 11,87 GB |
| PLLuM-12B-chat-2512 Q8_0 | 12B | no disponible | 80 | 1,5 | no disponible | 13,1 GB |

Frente a Saluki, este modelo reduce los errores lingüísticos de 1,7 a 0,5 por 100 palabras y sube el razonamiento de ~13 a 18 por un coste de 1,66 GB adicionales. Frente a Bielik-11B Q8_0, la puntuación polaca es superior (90,6 frente a 87,5) y el razonamiento es sustancialmente mejor (18,0 frente a 4,5), aunque Bielik comete menos errores de idioma en chat (0,3 frente a 0,5).

## Limitaciones y advertencias

- Las evaluaciones son propias del autor y no comparables con leaderboards estándar; los números solo son válidos dentro de las tablas de la model card.
- La cuantización a ~2,5 bits implica pérdida de fidelidad respecto al modelo completo, especialmente en texto polaco (KL 0,0452 frente a 0,00057 en razonamiento).
- El modelo solo declara soporte para polaco e inglés; el rendimiento en otros idiomas no está evaluado y probablemente sea degradado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Algunas respuestas se truncan por presupuesto de tokens (2 de 120 en razonamiento, con 32.768 tokens por problema), lo que indica que las puntuaciones son cotas inferiores.
- El dato de parámetros totales de safetensors (200.278.016) no coincide con la denominación "27B" del modelo base; conviene verificar la arquitectura real antes de dimensionar infraestructura.
- Aunque la licencia es Apache 2.0, el modelo base Qwen3.8-27B puede tener condiciones adicionales que deben revisarse para uso comercial.
- No se documenta soporte de tool calling ni function calling, lo que limita su uso en pipelines agénticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grpdxr/Qwen3.8-27B-PL-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización de origen: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo comparado Muse-Glimmer-30B-PL: https://huggingface.co/grpdxr/Muse-Glimmer-30B-PL-GGUF
- Paper referenciado (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper referenciado (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
