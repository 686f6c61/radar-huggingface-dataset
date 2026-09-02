# Mickaelhuggingface/qpa-qwen38-27b-q4km-cache

## Resumen

Este repositorio contiene la escalera de cuantizacion GGUF estandar del modelo Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16, una version abliterada del Qwen3.8-27B original de Qwen. El modelo es un VLM denso de 27.320 millones de parametros con arquitectura hibrida (Gated DeltaNet + atencion completa), 64 capas de texto y una torre de vision de 27 capas. Soporta entrada de texto, imagen y video, con una ventana de contexto arquitectonica de 262.144 tokens.

La relevancia de esta publicacion radica en tres aspectos: primero, es una version abliterada, es decir, se ha modificado a nivel de pesos la superficie de rechazo del modelo, reduciendo los rechazos de 450 casos originales a 11 (2,4 %) en el benchmark R1-HARMFUL-BENCH-450. Segundo, incluye el cabezal MTP (Multi-Token Prediction) embebido en cada cuantizacion, lo que permite decodificacion especulativa sin archivos adicionales. Tercero, ofrece un sidecar opcional DFlash2 en BF16 que, combinado con Q4_K_M, alcanzo 109,31 tokens por segundo en una NVIDIA RTX PRO 6000 Blackwell. Todo el conjunto se distribuye bajo licencia Apache-2.0 y esta pensado para inferencia local con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 dense hybrid VLM (Gated DeltaNet + atencion completa), 64 capas de texto, torre de vision de 27 capas |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens (arquitectonica); la practica depende de RAM/VRAM y concurrencia |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria gguf) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3.8-27B original: un transformer denso hibrido que combina capas con Gated DeltaNet (una capa recurrente lineal eficiente) con capas de atencion completa. El modelo procesa texto, imagen y video mediante una torre de vision de 27 capas, y genera salida de texto. El proceso de abliteracion aplicado por Blackfrost modifica los pesos del modelo para reducir la superficie de rechazo, sin fine-tuning ni poda. No se dispone de datos sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion proporcionada.

Cada cuantizacion GGUF incluye el cabezal MTP nativo de Qwen3.8 embebido, lo que permite decodificacion especulativa de un solo archivo en llama.cpp. Ademas, existe un sidecar opcional DFlash2 en BF16 (3,86 GB, 5 capas de draft) que requiere una implementacion experimental de llama.cpp y que, segun las pruebas del autor, alcanza 109,31 tokens por segundo de mediana en una RTX PRO 6000 Blackwell con contexto completo de 262.144 tokens.

## Capacidades

- Generacion de texto multimodal: acepta imagenes y video como entrada ademas de texto, y produce respuestas textuales.
- Razonamiento y control de pensamiento: hereda del modelo base la capacidad de razonamiento paso a paso y control flexible del modo de pensamiento (thinking mode), aunque no se detalla en la model card.
- Tool calling / function calling: el modelo esta etiquetado con soporte de tool-calling, lo que permite su integracion en agentes y flujos automatizados.
- Largo contexto: ventana arquitectonica de 262.144 tokens, adecuada para documentos extensos o conversaciones multi-turno prolongadas.
- Decodificacion especulativa: MTP embebido en todos los quants y DFlash2 opcional para aceleracion adicional.
- Comportamiento abliterado: superficie de rechazo reducida al 2,4 % en el benchmark R1-HARMFUL-BENCH-450, con una plantilla de chat que incluye un prompt de ejecucion corto de Blackfrost.

## Casos de uso

- Inferencia local en GPU de consumo: con el quant Q4_K_M (16,8 GB) el modelo cabe en una RTX 3090 o RTX 4090 de 24 GB, permitiendo ejecutar un VLM de 27B con vision y largo contexto en un equipo domestico.
- Asistente multimodal de escritorio: al aceptar imagenes y video, puede usarse para describir capturas de pantalla, analizar graficos o resumir contenido visual en aplicaciones locales.
- Agente autonomo con tool calling: su soporte de function calling permite construir agentes que consulten APIs, ejecuten comandos o interactuen con servicios externos en flujos multi-paso.
- Procesamiento de documentos extensos: con 262.144 tokens de contexto, puede resumir libros tecnicos, actas de reuniones largas o codigo fuente de repositorios completos en una sola pasada.
- Investigacion en seguridad y alineacion: la version abliterada es util para estudiar el comportamiento de rechazo, medir la eficacia de tecnicas de mitigacion o analizar respuestas a prompts malintencionados en entornos controlados.
- Servicio de chat con decodificacion especulativa: en servidores con GPU profesional (RTX PRO 6000), el sidecar DFlash2 permite alcanzar 109 tokens por segundo, adecuado para aplicaciones interactivas en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para esta version abliterada en la informacion disponible. Los unicos datos de rendimiento proporcionados son:

| Metrica | Valor |
|---|---|
| Refusals residuales (R1-HARMFUL-BENCH-450) | 11 de 450 (2,4 %) |
| Velocidad con DFlash2 + Q4_K_M (RTX PRO 6000 Blackwell) | 109,31 tok/s mediana (3 generaciones de 256 tokens, contexto 262.144) |

El benchmark de rechazo se midio sobre una variante W4A4 NVFP4 del mismo modelo BF16, no sobre los quants GGUF, y fue revisado manualmente de forma secuencial.

## Requisitos de hardware

- VRAM estimada por quant (tamano de archivo, no incluye overhead de contexto):
  - Q2_K: 10,9 GB
  - Q3_K_S: 12,3 GB
  - Q3_K_M: 13,5 GB
  - Q4_K_S: 15,8 GB
  - Q4_K_M: 16,8 GB (recomendado por el autor)
  - Q5_K_S: 19,0 GB
  - Q5_K_M: 19,5 GB
  - Q6_K: 22,4 GB
  - Q8_0: 29,0 GB
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M y quants inferiores; RTX PRO 6000 Blackwell para el sidecar DFlash2 con contexto completo.
- El contexto de 262.144 tokens requiere memoria adicional considerable; el autor indica que el contexto practico depende de RAM/VRAM y concurrencia.
- Opciones de despliegue: llama.cpp (runtime principal, compatible con MTP embebido), y el sidecar DFlash2 requiere una implementacion experimental de llama.cpp. No se menciona compatibilidad directa con vLLM u Ollama para estos archivos GGUF.
- Latencia y throughput: 109,31 tok/s mediana con DFlash2 + Q4_K_M en RTX PRO 6000 Blackwell; sin DFlash2 no se proporcionan datos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Abliterado |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27.320 M | 262.144 | Apache-2.0 | safetensors BF16 | No |
| Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16 | 27.320 M | 262.144 | Apache-2.0 | safetensors BF16 | Si |
| Este repositorio (Q4_K_M) | 27.320 M | 262.144 | Apache-2.0 | GGUF | Si |

No se dispone de datos de rendimiento comparativo con otros modelos de tamano similar (p. ej., Llama 3.1 70B, Qwen2.5-32B) en la informacion proporcionada. La comparativa se limita a la relacion entre el modelo base, su version abliterada y la cuantizacion GGUF.

## Limitaciones y advertencias

- Modelo experimental: el autor lo califica como "experimental" y advierte que es un checkpoint de investigacion deliberadamente modificado. Se recomienda validar el comportamiento en el propio entorno antes de desplegarlo en produccion.
- Abliteracion: al reducir la superficie de rechazo, el modelo puede generar contenido danino, ilegal o eticamente problematico sin las salvaguardas habituales. No es adecuado para aplicaciones publicas sin control adicional.
- El benchmark de rechazo (11/450) se midio en una variante NVFP4, no en los quants GGUF reales; los resultados pueden variar en la practica.
- El sidecar DFlash2 requiere una implementacion experimental de llama.cpp, lo que puede implicar inestabilidad o falta de soporte a largo plazo.
- El contexto de 262.144 tokens es arquitectonico; en la practica, la memoria disponible limita el contexto utilizable, especialmente en GPU de consumo.
- No se han publicado benchmarks de calidad general (razonamiento, codigo, matematicas) para esta version, por lo que no es posible comparar su rendimiento con el modelo base en tareas estandar.
- Los idiomas soportados no estan documentados en la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mickaelhuggingface/qpa-qwen38-27b-q4km-cache
- Modelo padre (BF16 abliterado): https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente del sidecar DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Guia de descarga del modelo base: https://www.orcarouter.ai/blog/qwen-3-8-27b-huggingface
- Repo de despliegue en RTX 3090 con vLLM: https://github.com/syv-ai/qwen38-27b-rtx3090
