# pramoths/Qwen3.8-27B-Uncensored-FP8-MTP

## Resumen

Este repositorio contiene una cuantización FP8 (block 128×128, E4M3, W8A8) de **Qwen3.8-27B-Uncensored**, un modelo abliterado (con la dirección de rechazo eliminada) basado en el Qwen3.8-27B de Qwen. El trabajo de cuantización lo realiza pramoths, y la modificación de abliteración proviene del modelo base de JonathanColetti, no de este repositorio. El modelo conserva la torre de visión y el cabezal de decodificación especulativa MTP funcional, algo poco común en las cuantizaciones disponibles.

El modelo es relevante porque, según el autor, en agosto de 2026 había 148 repositorios de Qwen3.8-27B abliterados, pero solo uno en FP8 y estaba restringido por acceso. Este build ofrece una opción FP8 sin restricciones, pensada para hardware Hopper donde FP8 tiene soporte nativo de tensor cores. La arquitectura subyacente es un modelo denso de 27B con atención híbrida (Gated DeltaNet lineal + atención completa), multimodal de visión y lenguaje, con 262.144 tokens de contexto nativos y licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (Gated DeltaNet lineal + atención completa), visión-lenguaje nativo |
| Parámetros totales | 27.358.213.360 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | FP8 block 128×128 E4M3, W8A8 (pesos y activaciones) |
| Idiomas soportados | Inglés (en), chino (zh), tailandés (th) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 30,9 GB) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B, es un transformer denso de 27B con una arquitectura híbrida que combina capas de atención lineal Gated DeltaNet con capas de atención completa, lo que permite manejar contextos largos de 262.144 tokens de forma eficiente. Es un modelo multimodal nativo (image-text-to-text), con una torre de visión integrada y un cabezal MTP (multi-token prediction) para decodificación especulativa. El proceso de abliteración del modelo base elimina la dirección de rechazo, de modo que el modelo no declina peticiones como haría el Qwen3.8-27B oficial.

La cuantización FP8 de este repositorio sigue exactamente el esquema de Qwen/Qwen3.8-27B-FP8. Se cuantizan a FP8 las proyecciones `q/k/v/o_proj` y `gate/up/down_proj`, tanto en las capas de lenguaje como en el cabezal MTP. Se mantienen en BF16 los LayerNorms, gates, `A_log`, `dt_bias`, `conv1d` y las proyecciones `in_proj_a/b` de la Gated DeltaNet, porque el error de cuantización se acumula en el estado recurrente. También se mantienen en BF16 la torre de visión completa, `lm_head`, `embed_tokens` y `mtp.fc`. El autor reporta que para que el cabezal MTP funcione correctamente bajo vLLM, el checkpoint debe estar en el formato nativo `fp8` y no en `compressed-tensors`.

## Capacidades

- Generación de texto, razonamiento y matemáticas, con soporte de modo reasoning (parsing `qwen3`).
- Generación de código: las pruebas del autor ejecutan el código generado contra aserciones, con 4/5 tareas superadas.
- Visión y lenguaje: lectura de tablas, extracción de nombres de actividades y celdas numéricas en imágenes (probado con tablas en tailandés).
- Extracción de texto exacta en tailandés, verificada por codepoint.
- Tool calling / function calling con parser `qwen3_coder`.
- Capacidades de agente y razonamiento multi-paso.
- Decodificación especulativa MTP con tasa de aceptación medida del 52% (frente al 58% del build oficial).
- Soporte de contexto largo de 262.144 tokens con KV cache en FP8.

## Casos de uso

- **Extracción de datos en tailandés**: el modelo mantiene exactitud de codepoint en extracción de texto tailandés (16/16 en las pruebas), útil para OCR, procesamiento de formularios o facturación en tailandés, donde la precisión carácter a carácter es crítica.
- **Generación de código en producción**: con soporte de tool calling y el parser `qwen3_coder`, puede integrarse en pipelines de CI/CD para generar código que se ejecuta contra aserciones de tests, aunque se debe tener en cuenta que en tareas complejas puede agotar el presupuesto de tokens razonando sin emitir respuesta.
- **Análisis de documentos con imágenes**: al preservar la torre de visión, puede leer tablas y extraer datos numéricos de capturas de pantalla o documentos escaneados, útil para automatización de procesos de datos.
- **Atención al cliente multilingüe**: con contexto de 262K tokens y soporte de tool calling, puede gestionar conversaciones multi-turno largas consultando APIs externas (bases de datos de pedidos, sistemas de tickets) en inglés, chino y tailandés.
- **Servidor de inferencia con decodificación especulativa**: el cabezal MTP activo reduce la latencia en hardware Hopper; se puede desplegar con vLLM para servir a múltiples usuarios con throughput alto (hasta 1.373 tok/s a concurrencia 16 en H100).
- **Investigación sobre abliteración y cuantización**: útil para estudiar los efectos de la eliminación del rechazo en modelos de 27B y la interacción con cuantización FP8, especialmente en lo que respecta a la preservación del cabezal MTP.

## Benchmarks y rendimiento

El autor midió el modelo contra el build oficial `Qwen/Qwen3.8-27B-FP8` en el mismo hardware (H100 47GB vGPU, vLLM 0.27.1, mismos flags):

| Tarea | Qwen/Qwen3.8-27B-FP8 | Este build |
|---|---|---|
| Extracción tailandesa, codepoint exacto (temp 0, 4 runs) | 16/16 | 16/16 |
| Tareas de código ejecutadas contra aserciones | 4/5 | 4/5 |
| Visión: tabla tailandesa, nombres de actividades leídos exactamente | 4/4 | 4/4 |
| Visión: celdas numéricas | correcto | correcto |
| Tasa de aceptación MTP | 58% | 52% |
| tok/s @ concurrencia 1 | 131 | 132 |
| tok/s @ concurrencia 8 | 816 | 813 |
| tok/s @ concurrencia 16 | no disponible | 1.373 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM**: los pesos ocupan ~30 GB; el resto va a la KV cache, que decide cuánto contexto se puede servir.
  - 24 GB (RTX 4090): no carga en una sola tarjeta.
  - 32 GB (V100 32GB): no, arquitectura no compatible.
  - 48 GB (A40): la VRAM es suficiente, pero el path FP8 en Ampere no está garantizado (ver nota abajo).
  - 47–48 GB (H100 47C vGPU, L40S): funciona, con KV pool de ~350k tokens con `--kv-cache-dtype fp8`.
  - 80 GB (H100/H200 80GB): cómodo, con ~600k+ tokens de KV pool.
  - 2× 24 GB con `--tensor-parallel-size 2`: funciona en Ada, reparte los pesos ~15 GB por tarjeta.
- **GPU recomendadas**: H100, H200, L40S, RTX 4090 (si la VRAM lo permite), RTX 50xx, B100/B200. En Ampere (A40, A100, A6000) vLLM puede caer al fallback `Fp8MarlinLinearMethod` que dequantiza en el kernel, pero no se ha verificado que acepte escalas block-wise 128×128; para Ampere se recomienda un build INT8 W8A16 o AWQ.
- **Opciones de despliegue**: vLLM (con flags específicas: `--kv-cache-dtype fp8`, `--max-num-seqs` por debajo del límite de bloques Mamba, `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`), llama.cpp y Ollama para el mismo modelo base (GGUF), aunque el MTP no es compatible en esos runtimes.
- **Latencia y throughput**: 132 tok/s a concurrencia 1, 813 a concurrencia 8, 1.373 a concurrencia 16 en H100 47C.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad | Rendimiento (tok/s @ c1) |
|---|---|---|---|---|---|---|
| pramoths/Qwen3.8-27B-Uncensored-FP8-MTP | 27,36 B | 262.144 | FP8 safetensors | Apache-2.0 | Público | 132 |
| Qwen/Qwen3.8-27B-FP8 | 27,36 B | 262.144 | FP8 safetensors | Apache-2.0 | Público | 131 |
| orcarouter/Qwen3.8-27B-Uncensored (Ollama) | 27,36 B | 262.144 | GGUF (2–8 bits) | Apache-2.0 | Público | no disponible |
| orcarouter/Qwen3.8-27B-Uncensored MLX | 27,36 B | 262.144 | MLX | Apache-2.0 | Público | no disponible |

Diferencias clave: el build de pramoths es el único FP8 ungated con MTP funcional; los builds de OrcaRouter ofrecen formatos GGUF y MLX para Apple Silicon y llama.cpp, pero sin FP8 ni MTP. El modelo oficial de Qwen tiene el rechazo intacto; las variantes uncensored lo tienen eliminado.

## Limitaciones y advertencias

- **Abliterado**: el modelo no declina peticiones que el Qwen3.8-27B oficial rechazaría. Esto puede generar contenido inapropiado o peligroso si no se controla con capas de filtrado externas. El autor lo advierte explícitamente y recuerda que la licencia es Apache-2.0 y el uso es bajo la responsabilidad del usuario.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede inventar información; en tareas de código puede gastar todo el presupuesto de tokens razonando sin emitir respuesta (la única tarea de código que falla en las pruebas).
- **Idiomas**: solo en, zh, th; no hay garantía de buen rendimiento en otros idiomas.
- **Contexto largo**: el contexto de 262.144 tokens solo es servible con `--kv-cache-dtype fp8`; sin él, la KV cache necesita 16,17 GiB para 262k y una tarjeta de 47 GB se niega a arrancar.
- **Hardware**: FP8 solo aporta ventaja en arquitecturas con FP8 tensor cores (Ada, Hopper, Blackwell). En Volta, Turing o Ampere el modelo no se ejecuta o el path FP8 puede ser más lento que un AWQ 4-bit. En Ampere, el fallback `Fp8MarlinLinearMethod` puede no aceptar escalas block-wise 128×128.
- **MTP puede fallar silenciosamente**: si la tasa de aceptación media es 1.00, todos los drafts se rechazan y se paga el coste de drafting sin beneficio; hay que verificar con métricas (`spec_decode_num_accepted_tokens_total`).
- **Límite de secuencias**: `--max-num-seqs` debe ser menor que el número de bloques de estado Mamba disponibles; el default de 256 falla al arrancar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pramoths/Qwen3.8-27B-Uncensored-FP8-MTP
- Modelo base: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de scripts y benchmarks del autor: https://github.com/pramoth/qwen38-fp8-forge
- Blog de OrcaRouter sobre el build GGUF y llama.cpp: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Blog de explainx.ai sobre el build MLX de OrcaRouter: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Build Ollama de OrcaRouter: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Build de unsloth del Qwen3.8-27B: https://huggingface.co/unsloth/Qwen3.8-27B
