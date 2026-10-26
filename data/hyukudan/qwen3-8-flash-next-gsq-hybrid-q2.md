# hyukudan/Qwen3.8-Flash-Next-GSQ-hybrid-Q2

## Resumen

`hyukudan/Qwen3.8-Flash-Next-GSQ-hybrid-Q2` es un fichero GGUF derivado de Qwen3.8-Flash-Next, el modelo MoE multimodal de Qwen que sirve de avance de la arquitectura de Qwen4 y que emplea el diseno hibrido Gated DeltaNet + Gated Attention ya usado en las series Qwen3.5 a Qwen3.8. No es un modelo nuevo ni un reentrenamiento: es una composicion byte a byte de dos GGUF publicos, en la que los expertos enrutados de las 48 ramas por capa se sustituyen por la version Q2_0 de ISTA-DASLab (GSQ-RCO) y el resto de tensores (capas densas, atencion, GDN, expertos compartidos, tabla PLE y cabeza de salida) se copian del UD-Q4_K_XL de Unsloth.

El autor, hyukudan, lo publica como perfil opcional "velocidad sobre calidad" de su motor de inferencia strix-halo-engine-lab, orientado a un nodo AMD Strix Halo con memoria unificada. La model card es explicita: nunca es el perfil por defecto del motor y **no supera el criterio de calidad** del mismo, con una caida de 11,5 puntos en la concordancia top-1 frente a la referencia Q8_0 y un KL 3,0 veces mayor.

Su relevancia es acotada pero concreta: demuestra una tecnica de composicion reproducible de GGUF (mezclar cuantizaciones distintas por tipo de tensor) que reduce los pesos residentes de 111,3 GB a 68,3 GB y sube la decodificacion de 59,6 a 73,2 tok/s en ese hardware, con verificacion sha256 tensor a tensor. El dato de parametros del repo (176.943.899.520, aproximadamente 177B) corresponde al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido Gated DeltaNet + Gated Attention (arquitectura Qwen3.8-Flash-Next, previsualizacion de Qwen4) |
| Parametros totales | 176.943.899.520 (aproximadamente 177B, dato del repo sobre safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Hibrida: Q2_0 en los expertos enrutados (`ffn_{gate,up,down}_exps`) y UD-Q4_K_XL en el resto de tensores |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (fichero completo); los tensores GSQ-RCO conservan aviso Apache-2.0 |
| Formato de pesos | GGUF, fichero unico de 68.290.609.600 bytes (sha256 `106603af0bc020222b90ed73ebfa04fd812280f53ec69135202a6cc71fc98b1e`) |

## Arquitectura y entrenamiento

El modelo subyacente es un MoE multimodal con atencion hibrida: capas de Gated DeltaNet (atencion lineal con estado recurrente) combinadas con capas de Gated Attention clasica, un esquema introducido en Qwen3-Next y reutilizado en toda la serie Qwen3.5-3.8. Cada capa mantiene 48 expertos enrutados (dimension 512 segun la model card) mas expertos compartidos y una tabla PLE. Este fichero concreto no entrena nada: sustituye exclusivamente los tensores de los expertos enrutados de todas las capas por los del shard `Q2_0` de ISTA-DASLab en la revision `ed59f920`, y conserva del UD-Q4_K_XL de Unsloth en `38bb39ee` la metadata, capas densas, atencion, GDN, expertos compartidos, tabla PLE y cabeza. La composicion se hizo con `gguf_compose.py` (solo biblioteca estandar, streaming de tensores) tras fusionar los cuatro shards de Unsloth con `llama-gguf-split --merge` (llama.cpp `552f18f9`), y se verifico con sha256 tensor a tensor que cada uno es copia byte a byte de una de las dos fuentes.

La innovacion tecnica no esta en el modelo sino en el pipeline: mezclar precisiones por familia de tensores (expertos a 2 bits, resto a 4 bits) para desplazar el coste de memoria hacia el componente dominante en tamano. Los expertos provienen de la cuantizacion GSQ (arXiv:2604.18556) con refinamiento RCO (arXiv:2605.00649) de IST-DASLab. No hay datos disponibles sobre tokens de entrenamiento, composicion del dataset ni fases de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base (tag `conversational`).
- Capacidad multimodal declarada en el repositorio oficial de Qwen3.8-Flash-Next; no se detalla si el fichero GGUF híbrido conserva el proyector de vision.
- Razonamiento y generacion de codigo presentes en el modelo, aunque la propia model card senala que la perdida de calidad de este perfil es **peor en prompts de agente y de codigo**.
- Soporte de decodificacion especulativa mediante la cabeza MTP (`MTP/mtp-Qwen3.8-Flash-Next-shared-Q8_0.gguf`) publicada en el mirror de Unsloth; es el modo usado en todas las mediciones del autor.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`), es decir, formato de chat servible por APIs compatibles.
- Capacidades de tool calling, agentes y multilingues: no disponibles en la informacion proporcionada para este fichero.

## Casos de uso

- **Laboratorio de rendimiento en Strix Halo**: medir el intercambio velocidad/calidad de un MoE de 177B en memoria unificada, comparando este fichero con el UD-Q4_K_XL sobre las mismas 64 prompts bloqueadas del conjunto QC64.
- **Prototipado offline de chat local**: levantar un servidor de conversacion en un unico nodo de 128 GB de memoria unificada cuando no hay acceso a GPUs de datacenter, aceptando la caida de calidad a cambio de 73,2 tok/s de decodificacion.
- **Pruebas de decodificacion especulativa**: validar la cabeza MTP Q8_0 y el pipeline de draft tokens en llama.cpp con un modelo de 177B que, en Q4_K_XL, ocupa 111,3 GB.
- **Investigacion en cuantizacion mixta**: usar el fichero como referencia reproducible (sha256 publicados, script incluido) para estudiar como afecta bajar solo los expertos enrutados a 2 bits frente a bajar toda la red.
- **Generacion de codigo en local con latencia prioritaria**: en prompts de codigo de 1K tokens el perfil alcanza 73,2 tok/s con MTP automatico, util para autocompletado interactivo donde el usuario revisa la salida.
- **Validacion de integraciones OpenAI-compatible**: al estar marcado como `endpoints_compatible`, sirve para probar clientes y frameworks contra un backend local sin coste de API, siempre que el motor exponga el endpoint.
- **Reproducibilidad de artefactos GGUF**: el comando de verificacion (`VERIFY_SPLIT=1`) permite auditar en CI que un fichero compuesto coincide con sus fuentes, un caso de uso de cadena de suministro de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente publica metricas de fidelidad frente a una referencia Q8_0 y de velocidad, medidas con llama.cpp QC64 (64 prompts bloqueadas, 23.552 posiciones puntuadas, contextos de 2K a 32K) y con decodificacion especulativa MTP en un nodo Strix Halo, peticion unica, 256 tokens generados.

| Metrica | UD-Q4_K_XL (receta de calidad) | hybrid-q2 (este fichero) | Variacion |
|---|---|---|---|
| Concordancia top-1 vs referencia Q8_0 (QC64) | 88,1 % | 76,6 % | -11,5 puntos |
| KL vs referencia Q8_0 | 0,238 | 0,716 | 3,0x |
| Decodificacion, prompt de codigo 1K, MTP auto | 59,6 tok/s | 73,2 tok/s | 1,23x |
| Decodificacion, prompt de codigo 8K, MTP auto | 54,0 tok/s | 66,0 tok/s | +12,0 tok/s |
| Pesos residentes | 111,3 GB | 68,3 GB | -43,0 GB |

El propio autor advierte que la calidad se midio con el scoring QC64 de llama.cpp sobre este fichero exacto, y que la aritmetica FP16 de prefill de expertos del motor no se volvio a puntuar en QC64.

## Requisitos de hardware

- **Pesos**: 68.290.609.600 bytes en disco y 68,3 GB residentes en memoria segun el autor. Hay que sumar cache KV y buffers de prefill, cuya cifra no esta disponible.
- **Memoria**: no cabe en GPUs de consumo de 24 GB ni de 32 GB. Requiere memoria unificada de gran capacidad (el autor usa un nodo AMD Strix Halo) o reparto entre varias GPUs.
- **GPU recomendadas**: no disponible. La unica configuracion documentada es un nodo Strix Halo con el motor strix-halo-engine-lab. No hay datos de A100, H100 ni RTX 4090 para este fichero.
- **Despliegue**: llama.cpp en version igual o posterior a `552f18f9` (usada para el merge) y el motor strix-halo-engine-lab. Requiere definir `STRIX_GSQ_Q20_A8=1` (obligatorio: sin esa variable el motor rechaza la identidad de contenido del fichero y hace fallback) y, opcionalmente, `STRIX_GSQ_PREFILL_F16=1` (activo por defecto). Soporte en vLLM, TGI, Ollama o LM Studio: no disponible.
- **Throughput medido**: 73,2 tok/s (prompt de codigo 1K) y 66,0 tok/s (prompt de codigo 8K) con MTP automatico, peticion unica, 256 tokens generados. No hay datos de throughput agregado por lotes ni de latencia de prefill.
- **Cabeza MTP**: se usa la version Q8_0 del mirror de Unsloth, fichero aparte del GGUF principal.

## Comparativa con modelos similares

Los terminos de comparacion naturales son los dos ficheros que componen este artefacto, ya que comparten exactamente el mismo modelo base (177B, Qwen3.8-Flash-Next).

| Modelo | Parametros | Cuantizacion | Contexto | Calidad top-1 (QC64) | Pesos residentes | Licencia |
|---|---|---|---|---|---|---|
| hyukudan/Qwen3.8-Flash-Next-GSQ-hybrid-Q2 | 176,9B | Q2_0 expertos + Q4_K_XL resto | no disponible | 76,6 % | 68,3 GB | Qwen Community 1.0 (expertos con aviso Apache-2.0) |
| unsloth/Qwen3.8-Flash-Next-GGUF (UD-Q4_K_XL) | 176,9B | UD-Q4_K_XL | no disponible | 88,1 % | 111,3 GB | Qwen Community 1.0 |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (Q2_0) | 176,9B | Q2_0 (expertos GSQ-RCO) | no disponible | no disponible | no disponible | Apache-2.0 |
| Qwen/Qwen3.8-Flash-Next (original) | 176,9B | BF16/FP16 (original) | no disponible | referencia Q8_0 | no disponible | Qwen Community 1.0 |

No se dispone de datos de benchmarks estandar ni de contexto para comparar contra modelos de otras familias y tamano similar.

## Limitaciones y advertencias

- **No es el perfil recomendado**: la model card indica que falla el criterio de calidad del motor y que nunca es el perfil por defecto. No deberia usarse como sustituto de produccion del UD-Q4_K_XL.
- **Degradacion medible y desigual**: -11,5 puntos de concordancia top-1 y KL 3,0x frente a la referencia Q8_0, con el peor comportamiento en prompts de agente y de codigo, que son precisamente los casos de uso mas habituales de un modelo de este tipo.
- **Sesgos**: no disponibles. No hay evaluacion de sesgo ni de toxicidad en la informacion proporcionada, ni para este fichero ni para el modelo base.
- **Alucinacion**: no hay mediciones de tasa de alucinacion. La cuantizacion agresiva a 2 bits de los expertos enrutados es un factor adicional de riesgo de degradacion en tareas de razonamiento largo, no cuantificado.
- **Idiomas y contexto**: sin datos. No se puede confirmar el comportamiento multilingue ni la ventana de contexto efectiva de este fichero.
- **Dependencia de un motor concreto**: requiere las variables de entorno de strix-halo-engine-lab (`STRIX_GSQ_Q20_A8=1`). Sin ellas el motor hace fallback, lo que limita la portabilidad a otros runners.
- **Licencia**: Qwen Community License 1.0 sobre el conjunto del fichero. Exige licencia adicional de Qwen para uso comercial como "Model as a Service" o "AI Work Assistant", y mostrar el nombre del modelo por encima de 100M MAU o 20M USD de ingresos mensuales. Los tensores GSQ-RCO llevan aviso Apache-2.0 de ISTA-DASLab que debe reproducirse.
- **Madurez**: repositorio creado el 2026-10-26 con 0 descargas y 0 likes en el momento del analisis; sin validacion independiente por terceros.
- **Vision**: aunque el modelo base es multimodal, no se especifica si el fichero conserva el proyector de vision ni como cargarlo en el motor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hyukudan/Qwen3.8-Flash-Next-GSQ-hybrid-Q2
- Repositorio del motor: https://github.com/hyukudan/strix-halo-engine-lab
- Documentacion del perfil de velocidad GSQ: https://github.com/hyukudan/strix-halo-engine-lab/blob/main/docs/gsq-speed-profile.md
- Seccion GSQ del README del motor: https://github.com/hyukudan/strix-halo-engine-lab#gsq-opt-in-speed-over-quality-profile
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/de4b8e4d43b917e7706784d8bb445c9af86a3540/LICENSE
- Cuantizacion UD-Q4_K_XL (Unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Expertos GSQ-RCO Q2_0 (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Mirror del GGUF de Unsloth usado: https://huggingface.co/hyukudan/Qwen3.8-Flash-Next-GGUF-mirror
- Mirror del GGUF GSQ-RCO usado: https://huggingface.co/hyukudan/Qwen3.8-Flash-Next-GSQ-RCO-GGUF-mirror
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Paper RCO: https://arxiv.org/abs/2605.00649
- Codigo RCO: https://github.com/IST-DASLab/RCO
- Instalador de terceros para hardware de consumo (Strata): https://github.com/Niko1221/Strata
- Ficha de terceros con el GGUF GSQ-RCO: https://local-ai-zone.github.io/models/qwen3-8-flash-next-gsq-rco.html
