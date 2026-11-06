# j2ipper/Laguna-S-2.1-Q4-lean

## Resumen

Laguna-S-2.1-Q4-lean es una cuantización GGUF de 4-5 bits del modelo poolside/Laguna-S-2.1, publicada por el usuario j2ipper. No se trata de un modelo nuevo, sino de una reempaquetado de pesos orientado a un objetivo muy concreto: que el modelo quepa, con su contexto completo de 256K tokens, en una máquina con 128 GB de memoria unificada basada en AMD Strix Halo (Ryzen AI Max+ 395 con GPU Radeon 8060S, arquitectura gfx1151). Es, además, el archivo de pesos que el motor de inferencia Talus distribuye por defecto para este modelo.

El modelo base tiene 117.561.977.600 parámetros (unos 117,6 mil millones) y una arquitectura de mezcla de expertos (MoE), a juzgar por la presencia de tensores de expertos enrutados (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`) y de expertos compartidos (`ffn_*_shexp`). El repositorio ocupa 72,2 GB en tres fragmentos, de los cuales 67,24 GiB corresponden a 814 tensores de pesos.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de cuantización selectiva por tensor con importance matrix para preservar calidad en un presupuesto de memoria ajustado; por otro, muestra el ecosistema emergente de hardware AMD con memoria unificada como alternativa a las GPU discretas para servir modelos de gran tamaño. La licencia es OpenMDW-1.1, la misma del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), arquitectura `laguna` en llama.cpp |
| Parámetros totales | 117.561.977.600 (117,6 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | GGUF con mezcla Q4_K, Q5_K, Q6_K, Q8_0 y F32 por tensor |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (openmdw-1.1) |
| Formato de pesos | GGUF, dividido en 3 fragmentos |

Detalle de tipos por tensor (814 tensores, 67,24 GiB):

| Tensores | Tipo | Origen |
|---|---|---|
| Expertos enrutados `ffn_gate_exps`, `ffn_up_exps` | Q4_K (capa 47: Q5_K) | Unsloth, sin cambios |
| Expertos enrutados `ffn_down_exps` | Q5_K (capas 46-47: Q6_K) | Unsloth, sin cambios |
| Atención `attn_q`, `attn_output` | Q5_K | Requantizado desde Q8_0 |
| Atención `attn_k`, `attn_v` | Q6_K | Requantizado desde Q8_0 |
| Expertos compartidos `ffn_*_shexp` | Q6_K | Requantizado desde Q8_0 |
| FFN densa (capa 0), `attn_gate` | Q8_0 | Sin cambios |
| `output` | Q6_K | Requantizado |
| `token_embd` | Q8_0 | Sin cambios |
| Router, norms, biases | F32 | Sin cambios |

Distribución por tipo: Q4_K 38,81 GiB; Q5_K 25,83 GiB; Q6_K 2,04 GiB; Q8_0 0,43 GiB; F32 0,14 GiB.

## Arquitectura y entrenamiento

El modelo base Laguna-S-2.1, desarrollado por poolside, emplea una arquitectura transformer con mezcla de expertos. La presencia de tensores de expertos enrutados y de expertos compartidos, junto con un router en precisión F32, confirma el diseño MoE. No se dispone en la información proporcionada de detalles sobre el número de expertos, el número de expertos activos por token, la dimensión oculta ni la composición del dataset de entrenamiento. Tampoco se documenta si el modelo base pasó por fases de RLHF, DPO u otro ajuste por preferencias.

La innovación técnica de esta publicación no está en el modelo, sino en el proceso de cuantización. Se parte del UD-Q4_K_XL de Unsloth y se aplica un único paso de `llama-quantize` con `--allow-requantize --keep-split` y la importance matrix de Unsloth (`imatrix_unsloth.gguf`). Mediante un archivo de tipos por tensor, se fijan los expertos enrutados a su tipo original (copia byte a byte) y se suben de Q8_0 a Q5_K o Q6_K los tensores de atención y de expertos compartidos, que son más sensibles a la pérdida de precisión. El resultado es un archivo que conserva la calidad de los expertos de Unsloth pero reduce el espacio de los tensores críticos de atención.

El autor documenta además el uso de decodificación especulativa mediante prompt lookup en Talus (parámetro `--spec 7`), sin necesidad de un modelo drafter separado, y atención de decodificación block-sparse a partir de 32K tokens (`--sparse 1024,16384,128,1024,16`). También publica un vocabulario de drafter de 64K entradas (`laguna-dv-65536.bin`) para motores que usen DFlash.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y la configuración de Talus define tokens de parada propios de un formato de chat (`〈|EOS|〉`, `</assistant>`).
- Razonamiento agéntico y codificación: la model card reporta una suite de codificación agéntica superada 5/5 en las pruebas de calidad del motor.
- Contexto largo: soporta hasta 262.144 tokens, con recuperación verificada en pruebas needle-in-a-haystack a 60K y 81K (15/15 en ambas).
- Mezcla de expertos: capacidad de activar solo una fracción de los 117,6 mil millones de parámetros por token, lo que reduce el coste computacional de inferencia.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con infraestructura de serving estándar.
- Capacidades multimodales, tool calling, function calling y modo thinking: no disponible en la información proporcionada.
- Idiomas: no disponible en la información proporcionada.

## Casos de uso

- Asistente de codificación en local sobre hardware AMD Strix Halo: el modelo cabe completo con su contexto de 256K en una máquina de 128 GB de memoria unificada, lo que permite ejecutar un asistente de programación sin depender de la nube ni de GPU discretas. La suite de codificación agéntica superada 5/5 respalda este uso.
- Análisis de repositorios completos: con 256K tokens de contexto se pueden cargar múltiples archivos fuente, documentación y trazas de error en una sola ventana, lo que habilita tareas de revisión de código, refactorización y explicación de arquitecturas a nivel de proyecto.
- Atención al cliente con historial largo: la ventana de 256K permite mantener conversaciones multi-turno extensas con documentación de producto adjunta, sin truncar el historial ni perder referencias anteriores.
- Procesamiento de documentos técnicos extensos: informes, patentes o manuales de varias decenas de miles de tokens pueden analizarse en una sola pasada, con recuperación fiable verificada hasta 81K tokens en las pruebas needle-in-a-haystack.
- Servicio de inferencia autoalojado con Talus: el repositorio incluye una configuración JSON lista para `talus-server`, con decodificación especulativa y atención block-sparse, lo que permite desplegar un endpoint compatible con API en un servidor propio.
- Investigación sobre cuantización selectiva: el repositorio incluye la receta completa (`laguna-tt-q4-lean.txt` y el script `make_laguna_q4_lean_types.py`), lo que lo convierte en un caso de estudio reproducible para estudiar el impacto de distintos tipos de cuantización por tensor en modelos MoE grandes.
- Evaluación de motores de inferencia alternativos: al cargar también en builds de llama.cpp con soporte de la arquitectura `laguna`, sirve para comparar rendimiento entre Talus y llama.cpp en el mismo hardware.

## Benchmarks y rendimiento

Los datos disponibles corresponden a las puertas de calidad del motor Talus (ejecución `rel-final-e6cf`, commit `e6cf959e1cad`, 2026-10-28), no a benchmarks académicos estándar:

| Prueba | Resultado | Umbral |
|---|---|---|
| KL teacher-forced, build actual vs build previamente validado (numérica a velocidad de servicio, 32K) | KL 0,00185 (@32K); 0,000 (@2K); top-1 98,5% | <= 0,003 |
| Needle in a haystack, 60K | 15/15 | no disponible |
| Needle in a haystack, 81K | 15/15 | no disponible |
| Suite de codificación agéntica | 5/5 | no disponible |

Advertencia importante: el autor indica explícitamente que la línea de KL compara el motor Talus entre builds, no esta cuantización contra los pesos originales. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El rendimiento en velocidad (tokens por segundo) se remite a `docs/RESULTS.md` del repositorio de Talus, sin cifras en la model card.

## Requisitos de hardware

- VRAM/memoria estimada: 67,24 GiB de pesos más overhead de contexto. El autor dimensiona el conjunto para una máquina de 128 GB de memoria unificada con contexto completo de 256K.
- Hardware objetivo: AMD Strix Halo, concretamente Ryzen AI Max+ 395 con GPU Radeon 8060S (gfx1151). Requiere ROCm con las librerías indicadas en la configuración (`lib_dirs` apunta a `rocm/lib` y `rocm/lib/llvm/lib`).
- GPU discretas: no se documenta soporte ni rendimiento en A100, H100 o RTX 4090. Con 67 GiB de pesos, no cabe en ninguna GPU de consumo actual (24 GB como máximo en RTX 4090); requeriría múltiples GPU o memoria unificada.
- Despliegue: Talus (motor principal, con configuración incluida) y builds de llama.cpp que soporten la arquitectura `laguna`. No se mencionan vLLM, TGI ni Ollama.
- Cuantización de KV cache: q8_0 en la configuración de Talus.
- Latencia y throughput: no disponibles en la información proporcionada; se remite a `docs/RESULTS.md` de Talus.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laguna-S-2.1-Q4-lean (esta ficha) | 117,6 mil millones (MoE) | 262.144 | GGUF mixta Q4_K/Q5_K/Q6_K/Q8_0 | OpenMDW-1.1 | Hugging Face, 97 descargas |
| poolside/Laguna-S-2.1 (base) | 117,6 mil millones (MoE) | no disponible | safetensors (original) | OpenMDW-1.1 | Hugging Face (poolside) |
| unsloth/Laguna-S-2.1-GGUF (UD-Q4_K_XL) | 117,6 mil millones (MoE) | no disponible | GGUF Q4_K_XL | OpenMDW-1.1 | Hugging Face (Unsloth) |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de modelos alternativos de otros desarrolladores. No se dispone de cifras de rendimiento comparables entre las tres variantes; la diferencia principal es el perfil de cuantización y el tamaño resultante.

## Limitaciones y advertencias

- Es una cuantización, no un modelo entrenado: hereda los sesgos, el conocimiento y las limitaciones del modelo base poolside/Laguna-S-2.1, que no se documentan en la información disponible.
- Riesgo de alucinación: no cuantificado en la model card; aplica el riesgo habitual de los modelos generativos de este tamaño.
- Idiomas soportados: no especificados. No se puede garantizar calidad multilingüe sin datos del modelo base.
- La validación de calidad (KL, needle-in-a-haystack, suite agéntica) mide el motor Talus, no esta cuantización frente a los pesos originales. El autor lo advierte explícitamente.
- Dependencia de hardware específico: el tamaño y la configuración están pensados para Strix Halo con 128 GB. En otras plataformas el rendimiento y la viabilidad no están documentados.
- Requiere ROCm y las rutas de librerías configuradas correctamente; no es un despliegue plug-and-play en cualquier entorno.
- Licencia OpenMDW-1.1: incluye una cláusula de patentes que extingue los derechos de quien demande alegando que los materiales del modelo infringen una patente o copyright. Es necesario revisar el texto completo en `LICENSE.md` antes de un uso comercial.
- poolside solicita que el uso sea coherente con su Acceptable Use Policy, enlazada en la model card.
- El repositorio tiene 97 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- Los pesos se distribuyen en tres fragmentos; hay que apuntar el motor al primer fragmento y mantener los demás en el mismo directorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/j2ipper/Laguna-S-2.1-Q4-lean
- Modelo base: https://huggingface.co/poolside/Laguna-S-2.1
- Cuantización de origen (Unsloth): https://huggingface.co/unsloth/Laguna-S-2.1-GGUF/tree/main/UD-Q4_K_XL
- Vocabulario de drafter: https://huggingface.co/j2ipper/draft-vocab
- Motor Talus: https://github.com/nsbradley88/talus-public
- Documentación de modelos de Talus: https://github.com/nsbradley88/talus-public/blob/main/docs/MODELS.md
- Metodología de evaluación de Talus: https://github.com/nsbradley88/talus-public/blob/main/docs/METHODOLOGY.md
- Resultados de velocidad de Talus: https://github.com/nsbradley88/talus-public/blob/main/docs/RESULTS.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia OpenMDW-1.1: https://huggingface.co/j2ipper/Laguna-S-2.1-Q4-lean/blob/main/LICENSE.md
- Acceptable Use Policy de poolside: https://poolside.ai/legal/acceptable-use-policy
