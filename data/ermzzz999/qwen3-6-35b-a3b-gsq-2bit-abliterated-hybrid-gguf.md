# Ermzzz999/Qwen3.6-35B-A3B-GSQ-2bit-abliterated-hybrid-GGUF

## Resumen

Qwen3.6-35B-A3B-GSQ-2bit-abliterated-hybrid-GGUF es una derivación no oficial del modelo MoE Qwen3.6-35B-A3B de Alibaba/Qwen, publicada por el usuario Ermzzz999. Combina tres linajes: los pesos de expertos cuantizados a 2 bits mediante GSQ (ISTA-DASLab), el trunk abliterated de huihui-ai y un proceso propio de abliteración selectiva sobre las proyecciones down de los expertos. El resultado es un único fichero GGUF de 11,59 GB con 34.660.610.688 parámetros totales, aproximadamente 2,672 bits por peso y una ventana de contexto de 262.144 tokens.

La relevancia de esta ficha no está en el rendimiento bruto, sino en la ingeniería de compresión: mantiene los expertos gate/up del GSQ bit-exact mediante transcodificación a `Q2_0` (tipo ggml 42) y re-cuantiza únicamente las down-projections tras abliterarlas. El modelo está pensado para ejecutarse en llama.cpp vanilla sin forks, con velocidades de 42-45 tok/s en decodificación sobre un Apple M3 Pro y una perplejidad de 6,9247 en wikitext-2 (40 chunks de 512 tokens). Es un artefacto de nicho: experimental, sin benchmarks de capacidad publicados y con cero descargas en el momento de redactar esta ficha.

Se trata de un modelo de texto exclusivamente (sin torre de visión, bloque MTP podado), sin censura por diseño (abliterated/uncensored) y con licencia Apache-2.0. Su público objetivo son investigadores que quieran estudiar el impacto de la cuantización extrema a 2 bits sobre un MoE de 35B con 3B activos, o desarrolladores que necesiten un modelo local de contexto largo en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (transformer + componentes SSM: tensores `ssm_out`, `ssm_alpha`, `ssm_beta`), 40 capas, 40 expertos |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | no disponible (el sufijo A3B del nombre base sugiere ~3B activos, no confirmado en la información) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mixta por tensor: `Q2_0` (expertos gate/up, 2,25 bpw), `Q2_K` (expertos down, 2,62 bpw), `Q5_K` (trunk, atención, SSM, shared experts), `Q6_K` (output), `Q8_0` (embeddings), `F32` (router y normas). Media: 2,672 bpw |
| Idiomas soportados | en, it |
| Licencia | Apache-2.0 (con atribución a Qwen, ISTA-DASLab y huihui-ai) |
| Formato de pesos | GGUF (fichero único `Qwen3.6-35B-A3B-GSQ-2bit-abliterated-2.672bpw.gguf`, 11,59 GB, SHA-256 `b10ae67d02f4e80ba0cef862006925814cb436e6eb02407dd26b257bdb59831c`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B: un MoE con 40 capas y 40 expertos por capa, en el que conviven mecanismos de atención clásicos (`attn_q`, `attn_k`, `attn_v`, `attn_output`, `attn_gate`, `attn_qkv`) con componentes de tipo SSM (`ssm_out`, `ssm_alpha`, `ssm_beta`), lo que justifica la etiqueta "hybrid" del nombre. Cada capa incluye además shared experts (`ffn_gate_shexp`, `ffn_up_shexp`, `ffn_down_shexp`) y un router `ffn_gate_inp` mantenido en F32 para preservar la precisión del enrutamiento. El bloque MTP (multi-token prediction) fue podado en el paso 5 del build, dejando 733 tensores y `block_count` 40.

No se dispone de información sobre el dataset de entrenamiento original (número de tokens, composición, RLHF/DPO). Lo que sí está documentado es el pipeline de construcción de esta derivación: (1) transcodificación bloque a bloque de los expertos gate/up GSQ a `Q2_0`, verificada byte a byte contra la fuente; (2) abliteración rank-1 por capa de las down-projections de expertos, usando una dirección derivada de la matriz de Gram del donor, aplicada en 39 de 40 capas con ‖ΔW‖/‖W‖ = 1,7 % y normas de fila preservadas; (3) cuantización de las down abliteradas a `Q2_K`; (4) cuantización del trunk con imatrix (510 tensores, 76 chunks) a `Q5_K`/`Q6_K`/`Q8_0`/`F32`; (5) poda del bloque MTP. Por procedencia, el 62,0 % de los parámetros (52,1 % de los bytes) son GSQ exactos, el 31,0 % (30,4 % de bytes) son GSQ abliterados y recodificados, y el 7,1 % (17,4 % de bytes) proviene del trunk abliterated de huihui-ai.

## Capacidades

- Generación de texto conversacional multi-turno, con contexto de hasta 262.144 tokens.
- Razonamiento y resolución de problemas: la model card reporta "probe correct" en su batería de pruebas, aunque sin detallar qué sonda.
- Generación de código: la batería de evaluación indica "code runs", es decir, el código generado se ejecutó correctamente en al menos una muestra.
- Prosa en italiano coherente, según la prueba single-sample del autor.
- Modo thinking desactivado por defecto en esta derivación (el modelo base lo tiene activado por defecto); la evaluación se hizo solo con thinking off.
- Comportamiento "compliant" en una sonda de seguridad que el modelo base rechaza, consecuencia directa de la abliteración.
- Sin soporte de tool calling ni function calling documentado en la información disponible.
- Sin capacidades multimodales: texto exclusivamente, sin torre de visión.
- Idiomas: inglés e italiano declarados; otros idiomas no verificados.

## Casos de uso

- Estudio académico de cuantización extrema: comparar la perplejidad de este fichero (6,9247) con la de la misma pipeline a Q8_0 (6,9293) y con la fuente a 4,5/5,56 bpw (6,9906) permite aislar el coste real de bajar a 2 bits sobre un MoE de 35B, con la referencia de un Q3_K desde BF16 (6,1898) como techo.
- Inferencia local de contexto largo en hardware de gama consumer: con 11,59 GB, el fichero entra en GPUs de 16 GB o en un Apple M3 Pro, y la ventana de 262.144 tokens permite procesar documentos largos, contratos o bases de código completas sin truncado.
- Investigación sobre abliteración: el pipeline documenta una abliteración rank-1 selectiva sobre las down-projections de expertos (39/40 capas, 1,7 % de perturbación relativa), lo que lo convierte en un caso de estudio reproducible para medir el efecto de la abliteración sobre la perplejidad y sobre las respuestas a sondas de rechazo.
- Procesamiento de texto en italiano e inglés: la model card verifica prosa italiana coherente, por lo que sirve para tareas de redacción o resumen en esos dos idiomas, siempre con revisión humana dado que no hay benchmarks.
- Despliegue con `llama-server`: el autor documenta el comando exacto `llama-server -m <file> -c 16384 --flash-attn -ngl 99`, lo que permite levantar un endpoint compatible con la API de OpenAI para prototipos internos.
- Generación de código en pipelines locales: la verificación "code runs" sugiere uso como autocompletado o generador de snippets en entornos sin conectividad, aunque la falta de benchmarks de HumanEval impide garantizar calidad en producción.
- Reproducción del build: los pasos 1-5 y los SHA-256 están documentados, lo que permite a un equipo de infraestructura replicar la receta sobre otros checkpoints GSQ.

## Benchmarks y rendimiento

| Metrica | Este fichero | Misma pipeline, trunk Q8_0 | Fuente gate/up 4,5 bpw + down 5,56 bpw | Referencia Q3_K desde BF16 |
|---|---|---|---|---|
| Tamano | 11,59 GB | 13,46 GB | 21,71 GB | 17,17 GB |
| Perplejidad wikitext-2 (40×512) | 6,9247 ± 0,16 | 6,9293 | 6,9906 | 6,1898 |
| Bits por peso | 2,672 | no disponible | no disponible | no disponible |

| Metrica de velocidad | Valor |
|---|---|
| Decodificacion en Apple M3 Pro | 42-45 tok/s |
| Prefill en Apple M3 Pro | 225 tok/s |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la información disponible. La única evaluación cualitativa es una batería de una sola muestra con thinking off: sonda correcta, prosa italiana coherente, código ejecutable, sin repeticiones y compliant en una sonda de seguridad.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 11,59 GB de pesos más overhead de contexto KV; con `-c 16384` y flash-attn el consumo adicional es moderado, pero con la ventana completa de 262.144 tokens el KV cache crece de forma significativa (no cuantificado en la información disponible).
- GPU recomendadas: no hay lista oficial; por tamaño, encaja en RTX 4090 (24 GB), RTX 4080 (16 GB), A100 40/80 GB y H100. El autor reporta funcionamiento en Apple M3 Pro (memoria unificada).
- Cabe en GPU consumer: sí, en modelos de 16 GB o más con `-ngl 99`; en 12 GB requeriría offload parcial a CPU.
- Opciones de despliegue: llama.cpp (obligatorio builds de finales de 2026 con soporte del tipo `Q2_0`, ggml type 42) y `llama-server` con `--flash-attn`. No se documenta compatibilidad con vLLM, TGI, Ollama ni otros runtimes.
- Advertencia crítica: no re-cuantizar con `llama-quantize` stock, porque el tipo `Q2_0` no está soportado por las builds antiguas.
- Latencia y throughput: 42-45 tok/s de decodificación y 225 tok/s de prefill en M3 Pro; no hay datos para GPU discretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad wikitext-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este fichero (GSQ 2-bit abliterated) | 34,66B | 262.144 | 6,9247 | Apache-2.0 | GGUF, 11,59 GB |
| ISTA-DASLab/Qwen3.6-35B-A3B-2Bit-GSQ (fuente) | 34,66B | no disponible | no disponible (fuente de los expertos) | no disponible | safetensors/GGUF, no disponible |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated | 34,66B | no disponible | no disponible | no disponible | no disponible |
| Q3_K desde pesos BF16 (referencia del autor) | 34,66B | no disponible | 6,1898 | Apache-2.0 (heredada de Qwen) | GGUF, 17,17 GB |

La comparación relevante es interna: frente al Q3_K desde BF16, este fichero pierde aproximadamente 0,73 puntos de perplejidad, coste atribuido por el autor a la fuente de 2 bits y no a la recuantización. Frente a la misma pipeline con trunk Q8_0, la diferencia es de 0,0046 puntos con 1,87 GB menos. No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, otros MoE de ~35B o modelos abliterated de Qwen) en la información proporcionada.

## Limitaciones y advertencias

- Modelo uncensored por diseño: la abliteración elimina mecanismos de rechazo, lo que lo hace inadecuado para aplicaciones públicas sin capas de moderación externas.
- Abliteración verificada solo por muestreo puntual ("spot-checked"); no hay benchmark de rechazo ni evaluación sistemática del efecto sobre capacidades.
- Evaluación realizada únicamente con thinking off; el comportamiento con thinking activado no está documentado.
- La perplejidad proviene de un único corpus (wikitext-2), una única longitud de contexto (512) y un único harness; es un dato relativo, no absoluto.
- La mayor parte del error de recuantización se concentra en las down-projections de expertos, que no disponen de rejilla de 4 niveles tras la abliteración.
- Modelo solo de texto; sin torre de visión; bloque MTP podado, por lo que no ofrece decodificación especulativa multi-token.
- Idiomas limitados a inglés e italiano según la model card; el castellano no está verificado.
- Requiere builds de llama.cpp de finales de 2026 con el tipo `Q2_0` (ggml type 42); builds anteriores fallarán al cargar el fichero.
- No re-cuantizar con `llama-quantize` stock: el tipo `Q2_0` no está soportado y el resultado sería corrupto o inválido.
- Riesgo de alucinación no cuantificado; al no haber benchmarks de MMLU, HumanEval o GSM8K, no se puede estimar la degradación de capacidades respecto al modelo base.
- Licencia Apache-2.0 con atribución obligatoria a Qwen, ISTA-DASLab y huihui-ai; se declara explícitamente que no implica endorsement de ninguno de ellos.
- Derivación no oficial: no afiliada a Alibaba/Qwen, ISTA-DASLab ni huihui-ai, sin garantías de mantenimiento (0 descargas y 0 likes en el momento de la ficha).

## Enlaces

- Hugging Face: https://huggingface.co/Ermzzz999/Qwen3.6-35B-A3B-GSQ-2bit-abliterated-hybrid-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Fuente de los expertos GSQ 2-bit: https://huggingface.co/ISTA-DASLab/Qwen3.6-35B-A3B-2Bit-GSQ
- Trunk abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated
- llama.cpp (runtime requerido, builds de finales de 2026): https://github.com/ggml-org/llama.cpp
