# hermitdave/Qwen3.5-9B-MLX-MACaQ-Hadamard-4.25bpw

## Resumen

Qwen3.5-9B-MLX-MACaQ-Hadamard-4.25bpw es una cuantizacion W4A16 en formato MXFP4 del modelo Qwen/Qwen3.5-9B, empaquetada especificamente para MLX y Apple Silicon por el desarrollador hermitdave. No es un modelo nuevo entrenado desde cero, sino un checkpoint derivado que aplica la tecnica MACaQ con rotacion Walsh-Hadamard de 32 bloques sobre las 248 proyecciones lineales del decoder, manteniendo en BF16 las embeddings, el `lm_head`, las normas y eliminando por completo la torre de vision. El resultado es un artefacto de 7,75 GB en disco (frente a los ~17 GB del base en BF16) que preserva buena parte de la fidelidad del modelo original.

El problema que resuelve es el de ejecutar un modelo de ~9B de parametros logicos en equipos Apple Silicon con memoria unificada limitada, sin degradar en exceso la perplejidad. La innovacion clave es la rotacion Hadamard ortonormal aplicada en linea sobre las activaciones, que reduce los valores atipicos y mejora la cuantizacion a 4 bits; el coste es un mayor trabajo por capa lineal durante la decodificacion, ya que las GPU de Apple no disponen de tensor cores FP4.

Es relevante ahora porque demuestra que la cuantizacion de 4 bits con rotaciones Hadamard es viable en el ecosistema MLX, aunque el propio autor lo posiciona explicitamente como "la opcion de fidelidad, no la de velocidad". Requiere cargar con `trust_remote_code=True` y un `macaq_model.py` personalizado; una carga estandar de MXFP4 produciria basura silenciosamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (solo texto, transformer decoder) |
| Parametros totales | 3.117.591.552 (segun safetensors); 8.96B logicos segun model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 W4A16, 4.25 bpw en capas cuantizadas, 6.92 bpw global |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), requiere `macaq_model.py` |
| Capas / hidden / intermedio | 32 / 4096 / 12288 |
| Proyecciones cuantizadas | 248 lineales del decoder |
| Rotacion | Walsh-Hadamard ortonormal de 32 bloques, aplicada en linea |
| Escala D1 | por canal de entrada, alpha=1.0, bf16 |
| Activaciones | bf16 (W4A16, no W4A4) |
| Tamano en disco | 7,75 GB (7,22 GiB) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura `qwen3_5` del modelo base, con 32 capas, dimension oculta de 4096 y dimension intermedia de 12288. La cuantizacion se aplica exclusivamente sobre las 248 proyecciones lineales del decoder: la torre de vision, la cabeza MTP (multi-token prediction), las embeddings, el `lm_head` y las normas se mantienen en BF16, y la torre de vision ni siquiera se incluye en el artefacto. Esto lo convierte en un checkpoint estrictamente de texto.

El metodo MACaQ transforma cada matriz de pesos como `W' = (W / t) B`, donde `t` es una escala D1 por canal de entrada y `B` es la transformada Walsh-Hadamard ortonormal de 32 bloques; la inferencia calcula `y = ((x * t) B) W'ᵀ`. El objetivo por capa es el error de salida ponderado por la Hessiana con ridge de 1.0. Los exponentes se criban sobre desplazamientos (-1, 0, 1) y los codigos E2M1 se refinan con 256 barridos greedy de flip. La calibracion uso 65.536 tokens de entrenamiento de WikiText-2 (secuencia 512, batch 8), y la construccion completa tardo unos 75 minutos en un M3 Max. No hubo entrenamiento adicional ni RLHF/DPO: es puramente un proceso de cuantizacion post-entrenamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.5-9B (modo texto).
- Razonamiento y generacion de codigo, en la medida en que lo soporte el base; no se documentan capacidades especificas adicionales.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Tool calling / function calling: no documentado explicitamente en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Vision: no soportada; la torre de vision no se incluye en el artefacto.
- Modo thinking: no disponible (el base lo soporta, pero este checkpoint no lo documenta).
- Inferencia en Apple Silicon via MLX y oMLX.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: el checkpoint ocupa 7,75 GB en disco y picos de ~7,4-9 GB en memoria, lo que permite ejecutar un modelo de ~9B logicos en equipos como un M3 Max de 64 GB sin recurrir a servidores.
- Desarrollo y prototipado offline: al correr con `mlx-lm` u oMLX en local, sirve para iterar en prompts y flujos conversacionales sin coste de API ni dependencia de red.
- Evaluacion de tecnicas de cuantizacion: util como referencia practica para comparar MACaQ con Hadamard frente a otras cuantizaciones (RCO, MXFP4 sin rotar) en terminos de PPL, KL y top-1.
- Generacion de texto conversacional en aplicaciones de escritorio para macOS: integrable via la API de oMLX con `model_type_override: llm` y `mtp_enabled: false`.
- Servicio local de chat completions: oMLX expone endpoints compatibles con OpenAI una vez registrado el modelo, adecuado para entornos de desarrollo internos.
- Benchmarking de hardware Apple Silicon: el autor documenta throughput medido (665 tok/s de prompt, 50 tok/s de decodificacion en M3 Max), lo que permite usar el checkpoint como carga de prueba reproducible.
- Investigacion sobre rotaciones Hadamard en cuantizacion de 4 bits: el codigo en `hermitdave/macaq-mlx` (rama `feat/hadamard`) permite reproducir y extender el metodo.

## Benchmarks y rendimiento

Fidelidad medida sobre WikiText-2 (protocolo `eval_quality_table.py`, 8 filas de 256 tokens, profesor BF16 de solo texto):

| Modelo | PPL | dPPL | KL (menor mejor) | top-1 |
|---|---:|---:|---:|---:|
| BF16 (profesor) | 10,2617 | — | — | — |
| Este quant | 10,4865 | +0,2247 | 0,0284 | 91,37% |
| RCO 4.63 (mtp4) | 10,6043 | +0,3426 | 0,0397 | 89,46% |
| MACaQ 4.25 sin rotar | 10,5345 | +0,2728 | 0,0388 | 88,82% |

Ejecucion alternativa con `eval_ppl.py` (32 x 512 tokens contiguos de WikiText-2): 8,7089 ± 0,1829 para este quant frente a 8,5607 ± 0,1799 para BF16. Las cifras absolutas no son comparables entre arneses.

Throughput (WikiText-2, prompt de 988 tokens, 256 tokens generados, greedy, M3 Max 64 GB):

| Runtime | Modelo | Prompt tok/s | Decode tok/s | Memoria pico |
|---|---|---:|---:|---:|
| mlx-lm | Este quant | 665,2 | 50,0 | 9,04 GB |
| mlx-lm | RCO 4.63 (mtp4) | 738,9 | 64,2 | 6,38 GB |
| oMLX | Este quant | — | 41-49 | 7,44 GB real |

Comprobacion de carga: `mlx_lm.load(..., trust_remote_code=True)` produce 55,6 tok/s con 7,88 GB de pico. La cabeza MTP de 4 bits injertada desde RCO 4.63 fue rechazada: aceptacion en profundidad 1 de 17/237 = 7,2%, con 0/17 en profundidad 2, y caida de TPS de 47,9 a 38,3 (d1) y 25,0 (d3).

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~7,4-9 GB en inferencia segun runtime (oMLX reporta 7,44 GB reales; mlx-lm reporta 9,04 GB de pico).
- GPU recomendadas: Apple Silicon exclusivamente (M1/M2/M3/M4 con memoria unificada suficiente). Medido en un M3 Max de 64 GB.
- Compatibilidad con GPU consumer NVIDIA: no disponible; el checkpoint es MLX y no esta pensado para CUDA.
- Despliegue: `mlx-lm` (>= 0.32.2) y oMLX con motor LLM (el motor VLM ignora `model_file`).
- Requisito critico: `trust_remote_code=True` obligatorio; sin el loader `macaq_model.py` la carga estandar produce basura.
- Latencia/throughput: ~50 tok/s de decodificacion en M3 Max con mlx-lm; 41-49 tok/s con oMLX. Prefill saturado por ancho de banda.
- Configuracion oMLX: `model_type_override: llm`, `mtp_enabled: false`, `ttl_seconds: 3600`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL (WikiText-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este quant (MACaQ-Hadamard) | 8,96B logicos / 3,12B safetensors | no disponible | 10,4865 (dPPL +0,2247) | apache-2.0 | MLX, Apple Silicon |
| RCO 4.63 (mtp4) | no disponible | no disponible | 10,6043 (dPPL +0,3426) | no disponible | MLX |
| MACaQ 4.25 sin rotar | no disponible | no disponible | 10,5345 (dPPL +0,2728) | no disponible | MLX |
| Qwen3.5-9B BF16 | ~9B | no disponible | 10,2617 (referencia) | apache-2.0 | HF |

Nota del autor: la comparacion con RCO no es de cobertura de parametros equivalente; RCO cuantiza `lm_head`, embeddings y vision, mientras que este artefacto los mantiene en BF16 y es mas pequeno en conjunto. La fila de MACaQ sin rotar procede de una sesion anterior con otro checkpoint profesor y solo indica direccion.

## Limitaciones y advertencias

- Requiere `trust_remote_code=True` y el `macaq_model.py` incluido; sin ellos la carga falla o produce salida incoherente.
- Es un checkpoint solo texto: no incluye torre de vision ni cabeza MTP. No sirve para tareas multimodales.
- La cabeza MTP no se incluye; debe dejarse `mtp_enabled: false`. El injerto desde RCO fue probado y rechazado por baja aceptacion.
- Es mas lento que alternativas: la rotacion Hadamard y las escalas en linea anaden trabajo por capa, y las GPU de Apple carecen de tensor cores FP4. Decodificacion ~50 tok/s frente a 64 tok/s de RCO.
- Mayor uso de memoria que RCO (9,04 GB vs 6,38 GB en mlx-lm) por mantener embeddings, `lm_head` y normas en BF16.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones especificas de sesgo o toxicidad para este checkpoint.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingue mas alla de la del base.
- Licencia apache-2.0 permite uso comercial, pero el requisito de codigo remoto implica auditar `macaq_model.py` antes de desplegar en produccion.
- Solo compatible con Apple Silicon via MLX; no hay soporte para CUDA, vLLM, TGI ni llama.cpp.
- Sin descargas ni likes en el momento de la ficha; proyecto de autor individual, no mantenido por el equipo de Qwen.

## Enlaces

- Hugging Face: https://huggingface.co/hermitdave/Qwen3.5-9B-MLX-MACaQ-Hadamard-4.25bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de implementacion: https://github.com/hermitdave/macaq-mlx (rama `feat/hadamard`)
- Paper MACaQ: https://arxiv.org/abs/2611.10649
- Libreria MLX-LM: no disponible enlace directo en la informacion proporcionada
- oMLX: no disponible enlace directo en la informacion proporcionada
