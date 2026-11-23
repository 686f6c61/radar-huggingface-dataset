# AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED

## Resumen

Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED es una cuantizacion mixta de precision publicada por el usuario AEON-7 sobre su propio maestro BF16, que a su vez deriva de la familia Qwen3.5/Qwen3.8 de Alibaba. El modelo combina NVFP4, FP8 y BF16 en una "lattice" por bloques disenada especificamente para hardware Blackwell (DGX Spark/GB10, RTX 5090, RTX PRO 6000), y conserva el tower de vision y la cabeza MTP del maestro. Se distribuye como un checkpoint de transformers con pesos safetensors en cuatro shards (~23,8 GB) y licencia Apache 2.0.

La propuesta diferencial no es solo la cuantizacion: el autor aplica una ablacion de rechazo ("abliterated", refusal-removed) orientada a mantener coherencia en respuestas largas, en lugar de perseguir una KL trivial a costa de degradar el modelo. El resultado es un modelo "willfully compliant" con capacidades de razonamiento, codigo, tool calling, vision y modo thinking, pensado para despliegue en produccion sobre vLLM con imagenes personalizadas.

Es relevante ahora porque demuestra una practica de cuantizacion consciente de la arquitectura: en lugar de aplicar un unico formato de 4 bits a todo el stack hibrido GDN/full-attention, reserva FP8 para las ultimas capas MLP y BF16 para los organos criticos (vision, MTP, embeddings), con mejora medida en tests de codigo. El dato de parametros en safetensors es de 19.869.895.920, inferior al "27B" del nombre comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion completa y Gated DeltaNet (GDN) / linear attention, vision tower y cabeza MTP; tag `qwen3_5` |
| Parametros totales | 19.869.895.920 (segun safetensors); el nombre comercial indica 27B |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible (el autor menciona "long-context" y problemas de configuracion de serving en contexto largo, sin cifra) |
| Tipos de cuantizacion | NVFP4 W4A4 (MLP capas 0-55), FP8 (MLP capas 56-63 completas: gate/up/down; writers de softmax attention y GDN), BF16 (vision tower, cabeza MTP, embeddings, lm_head, interior de GDN); export via NVIDIA ModelOpt |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, ~23,8 GB), libreria transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido que alterna atencion completa con capas Gated DeltaNet (linear attention), e incorpora un tower de vision para entrada image-text-to-text y una cabeza MTP (multi-token prediction) para decodificacion especulativa. Los tags incluyen `hybrid-attention`, `gated-deltanet`, `mamba`, `linear-attention`, `mtp`, `speculative-decoding` y `chunked-prefill`. No se dispone de datos sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO en el maestro original.

La innovacion tecnica documentada es la receta de cuantizacion mixta. El autor relata que una primera version ("Mix B") aplicaba FP8 solo a `down_proj` de las ultimas 8 capas y dejaba `gate`/`up` en NVFP4, lo que hizo caer la puntuacion de tests unitarios de codigo en AEON Bench a 0,694; al pasar las ultimas 8 capas MLP completas a FP8, la puntuacion subio a 0,833. La calibracion se realizo con 1024 muestras de 204 tokens (texto truncado en la model card). La cabeza MTP se injerto desde el maestro BF16 (15 tensores, 0,791G) tras perderla en el export de ModelOpt. El autor tambien senala que los bucles en contexto largo reportados inicialmente eran un problema de configuracion de serving, no de los pesos.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino y otros idiomas.
- Razonamiento con modo thinking explicito (tag `thinking`).
- Generacion de codigo, con enfasis declarado en fidelidad para pasar tests unitarios.
- Tool calling y function calling.
- Flujos agenticos y razonamiento multi-paso (tag `agentic`).
- Vision-language: entrada image-text-to-text mediante tower de vision en BF16.
- Decodificacion especulativa mediante cabeza MTP nativa y drafter externo DFlash2.
- Comportamiento sin rechazos ("refusal-removed", "uncensored", "abliterated").
- Compatibilidad con API OpenAI (`openai-compatible`) y despliegue en vLLM con chunked prefill.

## Casos de uso

- Generacion de codigo en produccion: el modelo conserva FP8 en las ultimas capas MLP precisamente para mantener fidelidad sintactica y de asserts; puede integrarse en pipelines de CI/CD para generar parches y tests, con verificacion posterior.
- Agentes de herramienta multi-paso: el soporte de function calling y razonamiento agentico permite construir orquestadores que encadenan busquedas, llamadas a API y sintesis de resultados.
- Asistente conversacional sin filtros editoriales: util para investigacion sobre comportamiento de modelos, red teaming y generacion de contenido creativo sin rechazos, con la advertencia de que la ausencia de alineacion de seguridad exige supervision.
- Analisis de documentos e imagenes: el tower de vision en BF16 permite extraer informacion de capturas, diagramas y formularios en flujos de digitalizacion.
- Despliegue en estaciones Blackwell de un solo nodo: el corte de ~23,8 GB cabe en DGX Spark/GB10 y RTX 5090, lo que habilita prototipos locales de asistentes con contexto largo y vision.
- Serving de baja latencia con decodificacion especulativa: combinado con el drafter DFlash2, el autor reporta +21% de tokens/s a temperatura 0,6 y +35% a temperatura 1,0 frente al drafter estandar en un DGX Spark.
- Traduccion y generacion multilingue EN/ZH: adecuado para pipelines de localizacion con terminologia tecnica.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son internos del autor (AEON Bench, tests unitarios de codigo) y medidas de velocidad del drafter:

| Metrica | Resultado | Contexto |
|---|---|---|
| AEON Bench unit tests (Mix B, FP8 solo en down_proj) | 0,694 | Receta descartada |
| AEON Bench unit tests (receta final, ultimas 8 MLP completas en FP8) | 0,833 | Receta publicada |
| Aceleracion con drafter DFlash2 (T=0,6) | +21% tok/s vs. DFlash2 estandar | Un DGX Spark, etapa lk3 |
| Aceleracion con drafter DFlash2 (T=1,0) | +35% tok/s vs. DFlash2 estandar | Un DGX Spark, etapa lk3 |
| Aceleracion con drafter DFlash2 (sin drafter) | 3,2x mas rapido | Un DGX Spark, etapa lk3 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~23,8 GB de pesos en el corte mixto; el BF16 maestro ocupa ~54 GB. Con overhead de KV cache y vision, prever margen adicional.
- GPU recomendadas: DGX Spark / GB10, RTX 5090 (sm_120), RTX PRO 6000 (sm_121a); el maestro BF16 apunta a H200, multi-GPU o PRO 6000.
- Cabe en GPU de consumo: si, en RTX 5090 por tamano de pesos; el soporte NVFP4 requiere arquitectura Blackwell.
- Opciones de despliegue: vLLM (imagenes "AEON vLLM Ultimate"), transformers, API compatible con OpenAI; chunked prefill soportado. No se menciona soporte GGUF ni llama.cpp/Ollama.
- Latencia y throughput: no disponible de forma absoluta; solo las aceleraciones relativas del drafter indicadas arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (MIXED NVFP4) | 19,87B (safetensors) | no disponible | NVFP4 + FP8 + BF16 | Apache 2.0 | Vision y MTP en BF16; sin rechazos |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 | no disponible | no disponible | BF16 (~54 GB) | Apache 2.0 | Maestro de referencia, misma familia |
| AEON-7/...-MXFP4-MXFP6-ROCm | no disponible | no disponible | MXFP4 + MXFP6 + BF16 (~23,7 GB) | Apache 2.0 | Variante para AMD ROCm (R9700, MI350/MI355) |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | drafter (~1,9 GB NVFP4 / ~3,85 GB BF16) | no disponible | Drafter de decodificacion especulativa, base del DFlash2 de AEON |

No se dispone de datos de rendimiento comparativo frente a modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": se ha eliminado el comportamiento de rechazo, por lo que puede producir contenido danino, ilegal o sesgado sin advertencia. Requiere filtros y supervision externos en produccion.
- Riesgo de alucinacion inherente a la generacion libre, agravado por la ausencia de capas de rechazo que en otros modelos actuan como freno.
- La cuantizacion mixta introduce degradacion no uniforme: el propio autor documenta una caida de 0,833 a 0,694 en tests de codigo con una receta alternativa, lo que indica sensibilidad al esquema de bits por capa.
- El soporte NVFP4 esta ligado a hardware Blackwell (sm_120/sm_121a); en GPUs anteriores el checkpoint no es utilizable directamente.
- Los bucles en contexto largo requieren ajustes correctos de configuracion de serving; una configuracion por defecto puede degradar la salida.
- El nombre comercial "27B" no coincide con los 19,87B declarados en safetensors; conviene verificar requisitos de memoria con el dato real.
- Idiomas declarados limitados a en, zh y "multilingual" sin lista cerrada; el rendimiento en castellano no esta documentado.
- El acceso a artefactos complementarios (drafter DFlash2, variante ROCm) esta restringido a suscriptores de LotusMake, lo que condiciona la reproducibilidad completa del stack.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre el cumplimiento normativo del contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Maestro BF16: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Variante ROCm MXFP4-MXFP6: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-MXFP4-MXFP6-ROCm
- Drafter DFlash2: https://huggingface.co/AEON-7/AEON-DFlash2-Qwen3.8-27B
- Drafter base z-lab: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Pagina del autor en LotusMake: https://lotusmake.com/c/aeon-forge
- Soporte/suscripcion LotusMake: https://lotusmake.com/support
