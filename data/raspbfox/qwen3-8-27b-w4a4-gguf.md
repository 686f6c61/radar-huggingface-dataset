# raspbfox/Qwen3.8-27B-W4A4-GGUF

## Resumen

Qwen3.8-27B-W4A4-GGUF es una cuantización W4A4 (pesos int4 y activaciones int4) del modelo Qwen3.8-27B, publicada por el usuario raspbfox mediante la herramienta ruquant. A diferencia de las cuantizaciones habituales de solo pesos, aquí también las activaciones se reducen a int4, de modo que los productos matriciales se ejecutan como operaciones int4 × int4, aprovechando instrucciones nativas como `v_dot8_i32_i4` en AMD gfx906 (MI50) y `mma.sync .s4` en las tensor cores INT4 de NVIDIA Turing, Ampere y Ada. El paquete incluye además un drafter DFlash2 en W4A4H para decodificación especulativa y un proyector de visión ajustado al modelo.

El modelo base es Qwen3.8-27B, un transformer denso de Qwen con capacidades conversacionales, de razonamiento y visión. La cuantización está pensada para exprimir hardware antiguo o de gama alta con soporte INT4: las MI50 de 32 GB y las RTX 3090 son los objetivos declarados. El resultado medido es notable: en 4× MI50 se alcanzan 120,5 t/s con decodificación especulativa, frente a 73,1 t/s de un Q4_0 con el mismo drafter.

La relevancia actual reside en que demuestra que una cuantización W4A4 real, con kernel propio y drafter compatible, puede duplicar el throughput de prefill y casi duplicar el decode especulativo respecto a cuantizaciones de solo pesos. El coste es la dependencia de un fork específico de llama.cpp (mx-llama.cpp, rama `ruquant`), ya que llama.cpp estándar no reconoce estos tipos de tensor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B); cuantizacion W4A4 con kernel int4 × int4 |
| Parametros totales | 4.467.201.280 (dato real de safetensors del repo) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 69.632 tokens en la configuracion MI50 TP4; 65.536 en RTX 3090 (segun comandos de ejemplo) |
| Tipos de cuantizacion | W4A4 (int4 pesos × int4 activaciones); W4A4H para el drafter; cache KV q4_0; proyector de vision F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos: modelo 17,19 GB, drafter 2,65 GB, mmproj 0,97 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de Qwen (Qwen3.8-27B) con capacidad de visión mediante proyector multimodal. Sobre él se aplica una cuantizacion OST-GPTQ con group size 64 y rb4, que rota el residual stream (OSTQuant); por eso el proyector de visión original no sirve y se incluye un mmproj específico. Las matrices se ejecutan como productos int4 × int4: `v_dot8_i32_i4` en gfx906 y `mma.sync .s4` en tensor cores INT4 de NVIDIA.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en el modelo base. La innovación técnica destacable es doble: la cuantización W4A4 real (no solo de pesos) con kernel propio, y la inclusión de un drafter DFlash2 en W4A4H para decodificación especulativa, que acepta entre 4,2 y 4,4 tokens por paso de verificación.

## Capacidades

- Generación de texto y conversación multi-turno (tag `conversational`).
- Razonamiento y respuesta a preguntas sobre documentos largos (probado con prompts de 64k tokens sobre wikitext).
- Visión: procesamiento de imágenes mediante `--mmproj mmproj-Qwen3.8-27B-W4A4-F16.gguf`.
- Decodificación especulativa con drafter DFlash2 (`--spec-type draft-dflash`).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y plantillas Jinja (`--jinja` en el comando de NVIDIA).
- Uso como agente de codificación: la model card reporta 16 de 16 ejecuciones de un test agéntico superadas en RTX 3090.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia de alto throughput en hardware AMD antiguo: en 4× MI50 (32 GB, PCIe 3.0) se obtienen 120,5 t/s con DFlash2 y 1.389 t/s de prefill (pp2048), lo que permite servir un modelo de 27B en GPUs de segunda mano con rendimiento interactivo.
- Despliegue en RTX 3090 con 24 GB: el modelo, el drafter y 64k de contexto caben usando cache KV q4_0; se miden 137 t/s de decode especulativo y 1.493 t/s de prefill (pp512), adecuado para asistentes locales.
- Análisis de documentos largos: con 64k tokens de contexto se procesa un documento completo y se responden preguntas sobre él (240 s de prefill en 1× MI50, 84 s en TP4), útil para resumen y QA sobre contratos o informes.
- Agente de codificación: el modelo supera un test agéntico de 16 ejecuciones en RTX 3090 con tool calling vía plantilla Jinja, apto para asistentes de edición de código en local.
- Procesamiento multimodal: con el mmproj incluido se pueden describir imágenes o extraer información de capturas y diagramas, siempre usando el proyector específico de esta cuantización.
- Servicio conversacional de bajo coste: la licencia Apache 2.0 y el formato GGUF permiten integrar el modelo en un llama-server con endpoints compatibles para chatbots o APIs internas.
- Investigación en cuantización: sirve como referencia reproducible para comparar W4A4 frente a Q4_0 en el mismo runtime, con comandos y cifras detalladas en la model card.

## Benchmarks y rendimiento

Datos medidos por el autor en 4× AMD MI50 32 GB, PCIe 3.0, ROCm 7.12, comparando W4A4 + DFlash2 frente a Q4_0 (4 bits pesos, 8 bits activaciones) + DFlash2 de unsloth/incoai:

| Metrica | 1 GPU | TP2 | TP4 |
|---|---|---|---|
| W4A4 + DFlash2 (t/s) | 84,2 | 98,4 | 113,3 |
| Q4_0 + DFlash2 (t/s) | 45,7 | 62,6 | 73,1 |
| Aceptacion W4A4 (tokens/paso) | 4,33 | 4,21 | 4,31 |
| Forward de verificacion 8 tokens (ms), W4A4 / Q4_0 | 40,6 / 91,6 | 30,7 / 54,4 | 25,5 / 37,2 |
| Prefill pp2048 (t/s), W4A4 / Q4_0 | 503,7 / 306,8 | 881,7 / 562,7 | 1.388,9 / 953,2 |
| Decode simple (t/s), W4A4 / Q4_0 | 31,6 / 28,9 | 46,8 / 46,5 | 60,1 / 64,2 |

Con el fork del 2026-11-07: 93,3 / 107,4 / 120,5 t/s en las mismas 30 prompts. En RTX 3090: 137 t/s con DFlash2 y 1.493 t/s de prefill (pp512). En prompts de 64k: 240 s de prefill en 1× MI50, 134 s en TP2 (cache f16) y 84 s en TP4; después, decode DFlash2 de 44-76 t/s (1 GPU) y 72-135 t/s (TP4).

## Requisitos de hardware

- VRAM estimada: modelo 17,19 GB + drafter 2,65 GB ≈ 19,8 GB en pesos; con cache KV q4_0 cabe en 24 GB (RTX 3090) para 64k de contexto. El mmproj añade 0,97 GB.
- GPU recomendadas: AMD MI50 32 GB (gfx906), en 1, 2 o 4 unidades; NVIDIA RTX 3090 y otras con tensor cores INT4 (Turing, Ampere, Ada).
- Cabe en GPU de consumo: sí, en RTX 3090 de 24 GB con cache KV de 4 bits; en GPUs con menos VRAM no está documentado.
- Opciones de despliegue: exclusivamente el fork mx-llama.cpp rama `ruquant` (ROCm 7.12 o 5.7 en AMD; build CUDA en NVIDIA). llama.cpp estándar no reconoce los tipos W4A4/W4A4H.
- Latencia y throughput: 93,3-120,5 t/s de decode especulativo en MI50 (1 a 4 GPUs) y 137 t/s en RTX 3090; prefill de 504 a 1.389 t/s según configuración; un paso de verificación cuesta 66-67 ms en 1× MI50 y 41-45 ms en TP4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decode (medido) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B W4A4 (este) | 4.467 M (safetensors) | 69.632 (TP4) | 120,5 t/s (TP4, DFlash2) | Apache 2.0 | GGUF, fork ruquant |
| Qwen3.8-27B Q4_0 + DFlash2 | mismo base | mismo | 73,1 t/s (TP4, DFlash2) | Apache 2.0 | GGUF, llama.cpp estándar |
| Qwen3.8-27B Q4_0 sin drafter | mismo base | mismo | 64,2 t/s (TP4) | Apache 2.0 | GGUF, llama.cpp estándar |

No se dispone de datos de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información proporcionada, por lo que no se puede comparar rendimiento de tarea frente a otras alternativas.

## Limitaciones y advertencias

- Requiere un fork específico de llama.cpp (mx-llama.cpp, rama `ruquant`); llama.cpp estándar no carga los tipos de tensor W4A4/W4A4H.
- El proyector de visión original no funciona: el residual stream está rotado (OSTQuant) y hay que usar el mmproj incluido; otro proyector produce ruido.
- La decodificación especulativa depende de la tasa de aceptación del drafter; en prompts de 64k la velocidad varía entre 44 y 76 t/s según lo bien que el drafter acierte cada respuesta.
- En RTX 3090, 64k de contexto junto al drafter solo caben con cache KV de 4 bits.
- No hay información sobre idiomas soportados, sesgos ni riesgo de alucinación específicos de esta cuantización.
- No se han publicado resultados de benchmarks de calidad en la información disponible; las cifras son solo de throughput y latencia.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia del fork y del hardware INT4 condiciona el despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/raspbfox/Qwen3.8-27B-W4A4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de llama.cpp: https://github.com/skyne98/mx-llama.cpp/tree/ruquant
- Herramienta ruquant: https://github.com/skyne98/ruquant
