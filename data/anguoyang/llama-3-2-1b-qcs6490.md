# anguoyang/llama-3.2-1b-qcs6490

## Resumen

`anguoyang/llama-3.2-1b-qcs6490` no es un modelo de pesos nuevos, sino un registro de medicion reproducible de Llama 3.2 1B Instruct sobre el SoC Qualcomm QCS6490 (kit Dragonwing RB3 Gen 2 Vision Kit). El autor publica resultados de rendimiento obtenidos mediante Qualcomm AI Hub Workbench sobre silicio real, junto con los identificadores de los jobs de subida, compilacion, enlace y perfilado. No se distribuyen pesos ni artefactos compilados en el repositorio; solo metodologia y numeros.

El modelo base es `meta-llama/Llama-3.2-1B-Instruct`, un transformer decoder-only de 1.240 millones de parametros con contexto nativo de 128.000 tokens, aqui ejecutado con contexto truncado a 512 tokens y cuantizacion w4a16 (pesos de 4 bits, activaciones de 16 bits) usando las codificaciones oficiales de AIMET. La relevancia es doble: es la primera medicion publica de un Llama en este chip y establece una referencia metodologica (per-graph profiling en lugar de ejecucion Genie end-to-end) para quien quiera estimar viabilidad de despliegue en edge.

El interes practico esta en la cadena de tooling: el autor documenta tres obstaculos concretos del flujo oficial de `qai-hub-models` para la familia Llama (precision por defecto w4 en lugar de w4a16, restriccion de `torch < 2.11` y acceso gated al repo de Meta), lo que convierte la ficha en una guia de reproduccion tanto como en un benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), exportado a 3 subgrafos ONNX (embedding, capas 0-7, capas 8-15 + lm_head) |
| Parametros totales | 1.240 millones (modelo base Llama 3.2 1B Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens en la configuracion medida (modelo base soporta 128.000) |
| Tipos de cuantizacion | w4a16 (checkpoint DEFAULT_W4A16, codificaciones AIMET oficiales, asset v6) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | No se distribuyen pesos. Artefactos de referencia: ONNX (3 partes) y QNN context binary |

## Arquitectura y entrenamiento

El repositorio no entrena ni afina nada: hereda integramente `meta-llama/Llama-3.2-1B-Instruct`, un transformer decoder-only con atencion causal estandar, RoPE y GQA, publicado por Meta. Los pesos FP se obtuvieron del espejo `unsloth` tras verificar identidad bit a bit con el repositorio oficial (sha256 de `model.safetensors`: `1ff795ff6a07e6a68085d206fb84417da2f083f68391c2843cd2b8ac6df8538f`, coincidente con el hash LFS de Meta).

La innovacion tecnica de esta ficha es el pipeline de despliegue, no el modelo. El flujo pasa por descargar codificaciones AIMET, exportar y partir el modelo FP en 3 ONNX, compilar con la cadena manual de AI Hub API (opciones oficiales sin `--output_names`, formas de entrada fijadas desde los grafos ONNX) y enlazar en un unico context binary QNN (job `jpvn9997g`, binario `mqkkv012k`). Se documentan tres trampas del camino oficial: la Collection usa w4 por defecto y hay que forzar `DEFAULT_W4A16`; el export exige `torch < 2.11` (entorno funcional con torch 2.10.0, transformers 4.45.0, onnx 1.18.0); y el repo gated de `meta-llama` no estaba autorizado para la cuenta del autor (`GatedRepoError`).

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo Instruct de Meta.
- Razonamiento basico y respuesta a instrucciones en formato chat.
- Generacion de codigo y matematicas simples, limitada por el tamano de 1B parametros.
- Soporte de tool calling y function calling segun el formato de chat de Llama 3.2 Instruct (no validado en esta configuracion edge).
- Capacidades multilingues del modelo base (no verificadas en la medicion).
- Ejecucion en dispositivo edge Qualcomm via QNN/Genie con cuantizacion w4a16.
- Perfilado por grafo con AI Hub Workbench (`estimated_inference_time`) para estimar latencia antes de desplegar.

## Casos de uso

- Evaluacion de viabilidad de LLM en edge: usar los numeros de prefill y decode para decidir si un QCS6490 puede sostener una experiencia conversacional con prompts de hasta 512 tokens antes de invertir en portar el modelo.
- Asistente local en dispositivos IoT o industriales: con 16,4 tok/s de decode y TTFT de 125 ms, es adecuado para respuestas cortas en interfaces de voz o paneles de control sin conectividad.
- Clasificacion y extraccion de informacion en el dispositivo: prompts de hasta 512 tokens permiten resumir logs, etiquetar texto o extraer campos de documentos pequenos sin enviar datos a la nube.
- Referencia de reproduccion para ingenieros de Qualcomm: los job IDs y la secuencia de compilacion sirven como plantilla para portar otros modelos Llama a QNN.
- Benchmark comparativo de chips: la entrada se integra en el leaderboard `qcs-bench` junto a la medicion de Qwen3-0.6B, permitiendo comparar familias de modelos sobre el mismo SoC.
- Base para prototipos de agentes locales de baja latencia: el TTFT de 125 ms hace viable un bucle de tool calling simple con herramientas locales, siempre que el contexto se mantenga por debajo del limite medido.

## Benchmarks y rendimiento

| Ruta | Prefill (tok/s) | Decode (tok/s) | TTFT (ms) |
|---|---|---|---|
| Genie (QNN context binary, w4a16) | 1024 | 16,4 | 125 |

Perfil por grafo (contexto 512, prompt chunk 128, token chunk 1), suma sobre las 3 partes:

| Grafo | Prompt (ar128) | Token (ar1) |
|---|---|---|
| Parte 1 de 3 — embedding | 384 µs | 155 µs |
| Parte 2 de 3 — capas 0-7 | 46.614 µs | 20.679 µs |
| Parte 3 de 3 — capas 8-15 + lm_head | 78.022 µs | 40.229 µs |

Condiciones: checkpoint `DEFAULT_W4A16` (codificaciones AIMET oficiales, asset v6), contexto 512, dispositivo Dragonwing RB3 Gen 2 Vision Kit (QCS6490). Nota metodologica del autor: las cifras de tok/s derivan de jobs de perfilado por grafo de AI Hub (`estimated_inference_time`), no de una ejecucion Genie end-to-end. Prefill medido: 125.020 µs por 128 tokens; decode: 61.063 µs por token.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el objetivo es el SoC QCS6490 con memoria unificada, no una GPU discreta.
- GPU recomendadas: no aplica para el artefacto medido. Para reproducir el export y la compilacion se usa la cadena AI Hub (entorno con torch 2.10.0, transformers 4.45.0, onnx 1.18.0).
- Dispositivo de referencia: Dragonwing RB3 Gen 2 Vision Kit con QCS6490.
- Cabe en consumer GPU: si, el modelo base de 1B en FP16 ocupa aproximadamente 2,5 GB, pero esta ficha no mide esa ruta.
- Opciones de despliegue: Qualcomm Genie con QNN context binary; export via `qai-hub-models` y AI Hub Workbench. No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: TTFT 125 ms, prefill 1024 tok/s, decode 16,4 tok/s en las condiciones indicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto medido | Decode (tok/s) | Prefill (tok/s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama 3.2 1B Instruct (esta ficha) | 1,24 B | 512 | 16,4 | 1024 | llama3 | Medicion publica, sin pesos |
| Qwen3-0.6B (medicion previa del mismo autor) | 0,6 B | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible | Medicion publica en `qcs-bench` |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No se distribuyen pesos ni artefactos compilados: el repositorio es un registro de medicion, no un modelo desplegable.
- Las cifras de tok/s son estimaciones derivadas de perfilado por grafo, no de una ejecucion Genie end-to-end; el rendimiento real en produccion puede diferir.
- Contexto limitado a 512 tokens en la configuracion medida, muy por debajo de los 128.000 del modelo base.
- La cuantizacion w4a16 puede degradar calidad respecto al modelo FP; no se han publicado evaluaciones de calidad en esta configuracion.
- Riesgo de alucinacion inherente a un modelo de 1B parametros; no apto para tareas que exijan alta precision factual sin verificacion.
- Licencia Llama 3 Community License: uso comercial permitido con condiciones (incluida la clausula de nombre y la politica de uso aceptable); revisar el texto oficial antes de desplegar.
- El acceso al repo gated de Meta puede fallar (`GatedRepoError`) si la cuenta no esta autorizada; el autor recurrio a un espejo verificado por hash.
- Entorno de export restringido a `torch < 2.11`; versiones superiores rompen el pipeline.
- No hay datos de sesgos ni evaluaciones multilingues en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/anguoyang/llama-3.2-1b-qcs6490
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Leaderboard `qcs-bench`: https://github.com/anguoyang/qcs-bench
- Qualcomm AI Hub Workbench: https://aihub.qualcomm.com/
- `qai-hub-models`: https://github.com/quic/ai-hub-models
- Licencia Llama 3: https://llama.meta.com/llama3/license/
