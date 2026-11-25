# Icharle/Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16-AWQ

## Resumen

Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16-AWQ es una cuantización post-entrenamiento de tipo mixto (NVFP4 W4A16 para las capas MLP y `lm_head`, FP8 W8A8 para atención y Gated DeltaNet, KV cache en FP8) del modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated, que a su vez es una versión "abliterated" del Qwen/Qwen3.8-27B. La publica el usuario Icharle usando NVIDIA ModelOpt 0.47.0 sobre una única GPU RTX PRO 6000 Blackwell. El resultado ocupa 21,9 GB en tres shards de safetensors frente a los 55,6 GB del original en BF16, lo que reduce a menos de la mitad el requisito de memoria para servirlo.

El modelo conserva la arquitectura `qwen3_5` del original: un híbrido entre atención completa y capas Gated DeltaNet (atención lineal), con torre de visión y cabeza MTP, y un pipeline `image-text-to-text`. Los 18.164.649.200 parámetros reales del checkpoint se mantienen intactos; solo cambia la precisión de los pesos. La cuantización se calibró con un dataset de 226 ventanas de 1024 tokens orientado a agentes, código y chino, en lugar del texto de noticias por defecto.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de cuantización mixta NVFP4/FP8 con AWQ sobre arquitecturas híbridas modernas, incluyendo los parches necesarios en ModelOpt; por otro, advierte de que se trata de un modelo sin guardarraíles de seguridad (abliterated/uncensored) bajo licencia Apache 2.0, lo que traslada toda la responsabilidad de filtrado y moderación a quien lo despliega.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (híbrida: atención completa + Gated DeltaNet, con torre de visión y cabeza MTP) |
| Parámetros totales | 18.164.649.200 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 W4A16 (MLP y `lm_head`), FP8 W8A8 (atención y DeltaNet), KV cache FP8; embeddings, `conv1d`, torre de visión y cabeza MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, 21,9 GB), configuración `hf_quant_config.json` con `quant_algo: MIXED_PRECISION` |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de la familia Qwen3.8: combina 16 capas de atención completa (proyecciones q/k/v/o en FP8) con 48 capas de Gated DeltaNet (atención lineal, proyecciones `in_proj_qkv`, `in_proj_z` y `out_proj` en FP8), más 64 capas MLP con `gate_proj`, `up_proj` y `down_proj` en NVFP4 W4A16. Incluye una torre de visión (pipeline `image-text-to-text`) y una cabeza MTP (multi-token prediction), ambas mantenidas en BF16. En total, 401 capas cuantizadas según el recetario oficial de NVIDIA `huggingface/qwen3_5/ptq/w4a16_nvfp4-fp8_attn-kv_fp8_cast`.

La cuantización se realizó con NVIDIA ModelOpt 0.47.0, transformers 5.12.1 y torch 2.14.0 (fijado porque torch 2.15/Triton 3.9 eliminan `tl.make_block_ptr`, que el kernel de fake-quant NVFP4 de ModelOpt sigue usando). El algoritmo de calibración es `awq_lite` (Activation-aware Weight Quantization): por capa se busca un exponente α para las escalas por canal que minimiza el error de salida tras la cuantización. Se aplicaron cuatro parches locales a ModelOpt para exportar correctamente Qwen3.8: (1) reconocimiento de `Qwen3_5RMSNorm` como norma `1 + w` para no invertir el signo de canales en 54 de 64 capas; (2) limitar AWQ a las capas NVFP4, dejando las FP8 con calibración max; (3) añadir `Qwen3_5MLP` al mapeo de fusión de `pre_quant_scale`; (4) corregir el plegado de escalas en modelos de precisión mixta. El dataset de calibración son 226 ventanas de 1024 tokens (~231k tokens) extraídas de Nemotron-SFT-Agentic-v2 (96), Nemotron-SFT-SWE-v2 (80) y Nemotron-SFT-Multilingual-v1 en `code_zh`/`math_zh`/`stem_zh` (50), renderizadas con la plantilla de chat del modelo y cortadas en posiciones aleatorias (semilla 0).

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y modo "thinking" (el autor verifica que los parsers de razonamiento funcionan en SGLang 0.5.23).
- Tool calling / function calling (verificado en SGLang con `quant=modelopt_mixed`).
- Entrada de imagen y texto (`image-text-to-text`), gracias a la torre de visión conservada en BF16.
- Capacidades multilingües, con calibración específica para chino en dominios de código, matemáticas y STEM.
- Uso en flujos agénticos y de razonamiento multi-paso (calibrado sobre transcripciones de agentes de búsqueda y SWE).
- Comportamiento sin rechazos (abliterated/uncensored): no aplica guardarraíles de seguridad del modelo original.
- Decodificación con cabeza MTP (multi-token prediction) disponible en BF16.

## Casos de uso

- Agentes de búsqueda y recuperación: el modelo está calibrado sobre transcripciones de agentes de búsqueda (Nemotron-SFT-Agentic-v2) y soporta tool calling verificado en SGLang, por lo que encaja en pipelines de agentes que alternan llamadas a herramientas y razonamiento.
- Automatización de ingeniería de software: la calibración incluye ventanas de SWE agentless (Nemotron-SFT-SWE-v2), lo que lo hace adecuado para tareas de parcheo de repositorios y generación de código en pipelines de CI/CD con llamadas a herramientas.
- Asistencia técnica en chino para código y matemáticas: parte del calibrado son documentos `code_zh`, `math_zh` y `stem_zh`, útil para entornos educativos o de soporte técnico en ese idioma.
- Procesamiento de documentos con imagen y texto: al conservar la torre de visión en BF16, puede extraer información de capturas, diagramas o formularios combinados con instrucciones textuales.
- Despliegue en una sola GPU de 96 GB: con 21,9 GB de pesos, cabe holgadamente en una RTX PRO 6000 Blackwell y deja espacio para KV cache FP8 y lotes grandes, lo que permite servirlo con SGLang para cargas interactivas.
- Investigación sobre cuantización: sirve como referencia reproducible de un pipeline NVFP4/FP8 con AWQ sobre arquitectura híbrida, con scripts de parcheo y calibración publicados en el repo.
- Experimentación sin restricciones de rechazo: para estudios de alineación, red-teaming o evaluación de robustez donde se necesita un modelo que no bloquee peticiones.

## Benchmarks y rendimiento

El autor publica una evaluación parcial (2026-11-25, una RTX PRO 6000 Blackwell, SGLang 0.5.23) comparando con el BF16 original y con otra cuantización NVFP4 pública del mismo modelo. La información disponible se corta en la tabla; se reproducen solo los datos completos.

| Métrica | BF16 | NVFP4-W4A16 (max) | NVFP4-W4A16-AWQ | iQlusion W4A4 |
|---|---|---|---|---|
| Pesos | 55,6 GB | 21,9 GB | 21,9 GB | 23,75 GB |
| KL vs BF16 (todo texto, top-20) | 0 | 0,0391 | 0,0354 | 0,0540 |
| Cambio de perplejidad | — | +2 (dato truncado en la fuente) | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 21,9 GB solo de pesos; con KV cache FP8 y overhead de runtime, un mínimo práctico de ~28-32 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) es la plataforma validada por el autor; también cabe en A100 40/80 GB, H100 y L40S.
- GPU de consumo: cabe en RTX 4090 (24 GB) solo con margen muy ajustado y contexto corto; en RTX 5090 (32 GB) hay más holgura. No cabe en GPUs de 16 GB.
- Despliegue: SGLang 0.5.23 con `quant=modelopt_mixed` (verificado por el autor); también transformers con `trust_remote_code`. No se confirma soporte en vLLM, llama.cpp, Ollama ni TGI para este formato NVFP4/FP8 mixto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pesos | Licencia | Notas |
|---|---|---|---|---|---|
| **Este modelo** (Icharle, NVFP4-W4A16-AWQ) | 18,16 B | no disponible | 21,9 GB | Apache 2.0 | KL vs BF16 0,0354; calibración AWQ orientada a agentes/código/chino |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated (BF16 base) | 18,16 B | no disponible | 55,6 GB | Apache 2.0 | Referencia de calidad; requiere mucha más VRAM |
| Icharle/…-NVFP4-W4A16 (max) | 18,16 B | no disponible | 21,9 GB | Apache 2.0 | Mismo layout, calibración max; KL 0,0391 |
| iQlusion/…-NVFP4-BF16-LMHead | 18,16 B | no disponible | 23,75 GB | no disponible | W4A4 MLP + FP8 atención + BF16 `lm_head`; KL 0,0540 |

## Limitaciones y advertencias

- Modelo abliterated/uncensored: se ha eliminado el comportamiento de rechazo del modelo base; no hay guardarraíles de seguridad y la responsabilidad de moderación recae en la aplicación.
- La cuantización introduce degradación medible: KL de 0,0354 frente a BF16 en texto general, con impacto no cuantificado en visión, tool calling o contextos largos.
- La calibración está sesgada hacia agentes, código y chino; el rendimiento en otros dominios o idiomas puede ser peor que el del BF16.
- No se especifican idiomas soportados ni longitud de contexto en la información disponible.
- El formato NVFP4/FP8 mixto requiere toolchains recientes (SGLang 0.5.23, transformers 5.12.1, torch 2.14.0); versiones distintas pueden fallar al cargar.
- Una revisión anterior del repo estaba rota por un bug de exportación de ModelOpt; si se descargó antes del 2026-11-25 debe descargarse de nuevo.
- Licencia Apache 2.0 permite uso comercial, pero el uso de un modelo sin filtros en producción exige controles adicionales propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Icharle/Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16-AWQ
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante con calibración max: https://huggingface.co/Icharle/Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16
- Cuantización NVFP4 alternativa: https://huggingface.co/iQlusion/Huihui-Qwen3.8-27B-abliterated-NVFP4-BF16-LMHead
