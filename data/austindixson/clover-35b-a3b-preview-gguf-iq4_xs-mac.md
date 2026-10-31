# austindixson/Clover-35B-A3B-Preview-GGUF-IQ4_XS-Mac

## Resumen

Clover-35B-A3B-Preview es un modelo de lenguaje de Diffuspace con aproximadamente 34.661 millones de parámetros totales, del que austindixson ha publicado esta cuantización GGUF en formato IQ4_XS pensada específicamente para ejecutarse en ordenadores Apple Silicon con 32 GB de memoria unificada. El nombre "A3B" sugiere una arquitectura de mezcla de expertos (MoE) con unos 3 mil millones de parámetros activos, y la presencia de tensores `ssm_alpha` y `ssm_beta` en la cuantización indica que incorpora componentes de espacio de estados (SSM), lo que apunta a una arquitectura híbrida transformer-SSM.

Esta ficha cubre el repositorio de cuantización, no el modelo original. El autor ha realizado un trabajo de cuantización cuidadoso: además de la versión IQ4_XS estándar, ofrece un archivo "pinned" donde los tensores sensibles (experto compartido del FFN, claves y valores de atención, y parámetros SSM) se mantienen a Q8_0, reduciendo la divergencia KL frente al Q8_0 de referencia en un 10,2% con solo 74 MiB adicionales de tamaño. El modelo es relevante para usuarios de Mac que quieren ejecutar localmente un modelo de gran tamaño sin necesitar GPU dedicada, con licencia Apache-2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida transformer-SSM con expertos (presencia de tensores `ssm_alpha`/`ssm_beta` y `ffn_*_shexp`); detalles exactos no disponibles |
| Parametros totales | 34.661.350.848 (dato real de safetensors) |
| Parametros activos | no disponible (el sufijo "A3B" sugiere ~3B activos, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (4.37 bpw), IQ4_XS con tensores sensibles a Q8_0 ("pinq8", 4.39 bpw); referencia Q8_0 |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (original en BF16 safetensors) |

## Arquitectura y entrenamiento

La estructura de tensores del GGUF revela una arquitectura híbrida: los tensores `ssm_alpha` y `ssm_beta` indican capas de espacio de estados (estilo Mamba o similar) combinadas con atención transformer estándar (`attn_q`, `attn_k`, `attn_v`), y los tensores `ffn_gate_shexp`, `ffn_up_shexp` y `ffn_down_shexp` confirman la presencia de un experto compartido en un diseño de mezcla de expertos con expertos enrutados adicionales. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

Sobre la cuantización: no se usó matriz de importancia (imatrix) ni datos de calibración. El proceso fue un requant desde Q8_0 (generado por streaming directo de los safetensors BF16 desde el Hub con `convert_hf_to_gguf.py --remote`) a IQ4_XS con `llama-quantize --allow-requantize`. El archivo "pinned" añade overrides de `--tensor-type` para mantener a Q8_0 el experto compartido, `ssm_alpha`, `ssm_beta`, `attn_k` y `attn_v`, tensores que las reglas estándar comprimen a 4 bits con pérdida de calidad notable.

## Capacidades

- Generacion de texto: confirmada por las mediciones de velocidad de decodificacion (21-22 tok/s en M1 Pro).
- Razonamiento matematico: en un subconjunto dificil de 30 problemas de MATH (presupuesto de 25k tokens, decodificacion greedy) obtuvo 28/30 en modo estricto y 30/30 tolerando errores de formato de respuesta.
- Codigo: el texto de evaluacion de perplejidad incluia codigo, lo que indica que se ha probado con contenido de codigo, aunque no hay benchmarks especificos publicados.
- Tool calling: el chat template de Diffuspace soporta function calling cuando se pasa explicitamente con `--jinja` y `--chat-template-file`; verificado con `llama-server` en modo OpenAI-compatible.
- Decodificacion especulativa: los GGUF soportan modo draft-self especulativo, aunque en Metal resulto mas lento que la decodificacion normal.
- Idiomas y otras capacidades (vision, audio, multilingüe): no disponibles.

## Casos de uso

- Ejecucion local en Mac de un modelo de 35B: la cuantizacion IQ4_XS cabe en la memoria unificada de un Apple Silicon de 32 GB (~19,4 GB residentes), ideal para desarrolladores que quieren inferencia local sin nube.
- Resolucion de problemas matematicos: el 28/30 (o 30/30 con formato flexible) en un subconjunto dificil de MATH lo hace adecuado para asistentes de matematicas y verificacion de demostraciones.
- Servidor de inferencia local compatible con OpenAI: `llama-server` expone una API en localhost con soporte de tool calling, util para integrar el modelo en aplicaciones y agentes locales.
- Desarrollo y prueba de agentes con function calling: el template de Diffuspace permite llamadas a herramientas, adecuado para prototipar pipelines agenticos sin coste de API.
- Evaluacion de cuantizaciones y calidad de inferencia: el repositorio documenta metodologia de KLD y acuerdo de tokens top-1, util como referencia para quien trabaje en cuantizacion.
- Procesamiento de prompts largos en local: velocidad de procesamiento de prompt de 212-261 tok/s en M1 Pro, razonable para cargas de RAG o resumen en estacion de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Datos publicados por el autor del repo:

| Metrica | Valor |
|---|---|
| MATH (subconjunto dificil, 30 problemas, greedy, 25k tokens) | 28/30 estricto; 30/30 tolerante con formato |
| KLD medio vs Q8_0 (pinned) | 0.0861 ± 0.0023 |
| KLD medio vs Q8_0 (sin pinning) | 0.0959 ± 0.0021 |
| Acuerdo top-1 con Q8_0 (pinned) | 89,6% |
| Penalizacion de PPL vs Q8_0 (pinned) | 2,84% |

## Requisitos de hardware

- Memoria: ~19,4 GB RSS residentes en ejecucion (modelo + contexto); disenado para Macs Apple Silicon de 32 GB de memoria unificada. En 32 GB, usar `--cache-ram 0` para evitar swap.
- GPU: no requiere GPU dedicada; usa Metal en Apple Silicon. Medido en M1 Pro 32 GB: pp512 261 tok/s, tg512 21,4 tok/s (decodificacion autoregresiva simple).
- Consumer GPU: en Macs con 32 GB cabe comodamente; en Macs de 24 GB no cabe. No hay datos para GPU NVIDIA, pero ~19 GB de pesos sugieren que una RTX 4090 (24 GB) quedaria justa sin contexto amplio.
- Despliegue: requiere llama.cpp parcheado (PR #31306, rama `dev-clover` de Maphist0/llama.cpp-pub, commit `4838ffb`); llama.cpp mainline todavia no carga Clover. Compatible con `llama-cli`, `llama-server` y `llama-bench`. No hay soporte verificado para vLLM, TGI ni Ollama.
- Especulacion: el modo draft-self fue un 3-34% mas lento que la decodificacion simple en Metal; no recomendado en Mac. La especulacion lossy requiere `--repeat-penalty 1.0`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Clover-35B-A3B-Preview (este repo, IQ4_XS) | 34,66B | no disponible | Apache-2.0 | Hibrido SSM-MoE, GGUF para Apple Silicon, requiere llama.cpp parcheado |
| Qwen3-30B-A3B | 30,5B (~3,3B activos) | 32k-128k | Apache-2.0 | MoE transformer, ecosistema llama.cpp mainline maduro |
| Qwen3-32B (denso) | 32,8B | 32k-128k | Apache-2.0 | Denso, mayor consumo de VRAM por token activo, benchmarks publicados amplios |

La comparativa es orientativa: Clover comparte perfil de tamano y licencia con la familia Qwen3, pero no hay benchmarks estandar que permitan comparar rendimiento directamente, y su ecosistema de despliegue es todavia preview.

## Limitaciones y advertencias

- Modelo preview: requiere una version parcheada de llama.cpp (rama `dev-clover`); mainline no lo carga todavia, lo que dificulta su uso en produccion.
- Los GGUF no incluyen chat template embebido: hay que descargar y pasar explicitamente el `chat_template.jinja` de Diffuspace, imprescindible para chat y tool calling.
- La cuantizacion se hizo desde Q8_0, no desde BF16, por lo que la calidad puede ser ligeramente inferior a una cuantizacion directa BF16 → IQ4_XS.
- No se uso imatrix ni datos de calibracion en la cuantizacion.
- El GGUF por defecto usa `--repeat-penalty 1.05`, que rompe el modo especulativo lossy; hay que forzar 1.0.
- Sesgos, riesgo de alucinacion, idiomas soportados y longitud de contexto: no disponibles en la informacion publicada; evaluar antes de uso sensible.
- Benchmarks estandar no publicados: la evidencia de calidad se limita a la prueba de MATH del autor y a metricas de divergencia de cuantizacion.
- Licencia Apache-2.0: sin restricciones para uso comercial, pero el modelo base es "Preview" y puede cambiar.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/austindixson/Clover-35B-A3B-Preview-GGUF-IQ4_XS-Mac
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Chat template: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview/resolve/main/chat_template.jinja
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31306
- Rama de llama.cpp compatible: https://github.com/Maphist0/llama.cpp-pub/tree/dev-clover
- Cuenta de X del colaborador: https://x.com/letsgetboosted
