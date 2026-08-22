# HermiHg/Qwen3.8-27B-DFlash2-Q2_K_S-MIX-GGUF

## Resumen

El repositorio `HermiHg/Qwen3.8-27B-DFlash2-Q2_K_S-MIX-GGUF` contiene una cuantización de precisión mixta de 2 a 3 bits del modelo draft DFlash 2, diseñado para la decodificación especulativa del modelo objetivo `Qwen/Qwen3.8-27B`. No es un modelo de lenguaje independiente: se ejecuta como borrador (draft) dentro de un servidor de decodificación especulativa, proponiendo tokens que el modelo objetivo verifica. El autor, HermiHg, ha construido esta variante para reducir el tamaño del draft a la mitad (545 MiB frente a 1.090 MiB del `Q4_K_M` de referencia) manteniendo aproximadamente el 97 % del rendimiento en tokens por segundo.

El draft original `incoai/Qwen3.8-27B-DFlash2` es un modelo pequeño de 1.924.404.480 parámetros (alrededor de 1,9 mil millones) que se usa junto al target de 27 mil millones. Esta versión `Q2_K_S-MIX` aplica una cuantización selectiva: comprime fuertemente los bloques feed-forward (que suponen el 69 % de los parámetros) con `iq2_xxs`, mientras conserva mayor precisión en el selector de ruta y la proyección de características, que son críticos para la tasa de aceptación. El resultado es un draft de 2,37 bits por peso que acepta ligeramente menos tokens por paso que el `Q4_K_M` (2,68 frente a 2,80 con `n_max=3`), lo que se traduce en una pérdida de throughput de alrededor del 3 %.

La relevancia de este modelo radica en que permite ejecutar decodificación especulativa con un target de 27B en GPUs de 24 GB con menor huella de VRAM para el draft, sin sacrificar calidad de salida (DFlash 2 es lossless: la calidad final la determina el target, no el draft). Requiere una compilación específica de llama.cpp con soporte DFlash 2 (PR #27342) y un parche adicional para corregir un bug de rendimiento en generación con gramática (tool calls, JSON mode).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model DFlash 2 (decodificacion especulativa), basado en `incoai/Qwen3.8-27B-DFlash2` |
| Parametros totales | 1.924.404.480 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo objetivo Qwen3.8-27B) |
| Tipos de cuantizacion | Q2_K_S-MIX (precision mixta: iq2_xxs, iq3_s, iq3_xxs, Q2_K_S, q4_k, f32) |
| Idiomas soportados | No disponibles (hereda los del target) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un draft de decodificacion especulativa DFlash 2, una tecnica que acelera la generacion de un modelo grande (target) mediante un modelo pequeno que propone secuencias de tokens que el target verifica en paralelo. La arquitectura interna del draft no se detalla en la informacion disponible, pero se sabe que incluye bloques feed-forward con activacion SwiGLU (que representan el 69 % de los parametros), un selector de ruta de tokens (hidden, predecessor, successor), una proyeccion de caracteristicas `fc` de dimensiones 5120 × 25600, proyecciones de convolucion dinamica de dos taps (en atencion y FFN) y capas de normalizacion. El draft fue entrenado por inco.ai (ver blog y repositorio DFlash) para maximizar la tasa de aceptacion del target Qwen3.8-27B.

La cuantizacion `Q2_K_S-MIX` se construyo desde el checkpoint BF16 original (sin dequantizar desde una cuantizacion previa) usando `llama-quantize` con soporte DFlash 2. La estrategia de precision mixta asigna `iq2_xxs` a los feed-forward, `iq3_s` al selector de ruta, `iq3_xxs` a la proyeccion `fc`, `iq2_xxs` a las proyecciones de convolucion, `Q2_K_S` por defecto a atencion (con `attn_v` promovido a `q4_k`) y mantiene las normalizaciones y bases de convolucion en `f32`. Esta distribucion preserva la precision en los tensores que mas influyen en la tasa de aceptacion, mientras reduce drasticamente el tamano total.

## Capacidades

- Decodificacion especulativa: propone secuencias de tokens (draft) para que el modelo objetivo Qwen3.8-27B las verifique, acelerando la generacion.
- Compatibilidad con llama.cpp: se integra como draft en `llama-server` mediante `--spec-type draft-dflash`.
- Reduccion de VRAM: al ocupar 545 MiB, libera memoria en la GPU para el target o para aumentar el tamano de lote.
- Mantenimiento de calidad: al ser lossless, la calidad de la salida final es identica a la del target; el draft solo afecta a la velocidad.
- Soporte de generacion con gramatica (tool calls, JSON mode) tras aplicar el fix del branch `fix/dflash2-tool-tg-collapse`; sin el fix, la velocidad colapsa a ~25 tok/s.
- No es un modelo de lenguaje autonomo: no puede generar texto por si mismo.

## Casos de uso

- Despliegue de Qwen3.8-27B en GPU de 24 GB: el draft de 545 MiB permite reservar mas VRAM para el target o para el contexto, facilitando la ejecucion local en hardware de gama alta de consumo.
- Inferencia de baja latencia en entornos de produccion: al mantener ~97 % del throughput del draft `Q4_K_M`, se puede servir el target con menor huella de memoria sin penalizacion significativa de velocidad.
- Agentes de codigo y tool calling: con el fix de gramatica, el draft acelera la generacion de llamadas a herramientas y salidas estructuradas (JSON) en frameworks como Pi, Hermes o Goose.
- Servidores de chat con razonamiento: el draft funciona con prompts conversacionales que incluyen cadenas de razonamiento, manteniendo una tasa de aceptacion cercana a la referencia.
- Experimentacion con decodificacion especulativa en recursos limitados: permite probar DFlash 2 en GPUs con poca VRAM adicional, ya que el draft ocupa menos de 0,6 GB.
- Optimizacion de costes en inferencia cloud: al reducir el tamano del draft, se puede ajustar el numero de GPUs o el tamano de instancia para cargas de trabajo con target de 27B.

## Benchmarks y rendimiento

La informacion proporcionada incluye mediciones comparativas del draft `Q2_K_S-MIX` frente al `Q4_K_M` de referencia y al `Q2_K` estandar, realizadas con `llama-server` (DFlash 2, PR #27342) contra el target Qwen3.8-27B en una GPU NVIDIA de 24 GB, con un prompt conversacional fijo con razonamiento, temperatura 1.0, concurrencia 1 y 3 replicas.

| `n_max` | Metrica | `Q4_K_M` (1.090 MiB) | `Q2_K` (673 MiB) | **Q2_K_S-MIX** (545 MiB) | Ratio (vs Q4) |
| :-- | :--- | ---: | ---: | ---: | :-- |
| 3 | draft len | 2.80 | 2.65 | 2.68 | 0.96 |
| 4 | draft len | 3.01 | 2.86 | 2.89 | 0.96 |
| 2 | tok/s | 94.3 | 94.0 | 93.8 | 0.99 |
| 3 | tok/s | 106.8 | 102.6 | 104.0 | 0.97 |
| 4 | tok/s | 110.0 | 105.5 | 107.7 | 0.98 |
| — | Tamano | 1.090 MiB (4.76 bpw) | 673 MiB (2.93 bpw) | 545 MiB (2.37 bpw) | **0.50** |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, etc.) para este draft, ya que no es un modelo autonomo; la calidad la determina el target Qwen3.8-27B.

## Requisitos de hardware

- VRAM estimada para el draft: 545 MiB (0,53 GB) en cuantizacion Q2_K_S-MIX. El target Qwen3.8-27B requiere aproximadamente 16-24 GB segun cuantizacion y contexto.
- GPU recomendadas: NVIDIA con al menos 24 GB de VRAM para el conjunto target + draft (por ejemplo, RTX 4090, A100, H100). El draft en si cabe en cualquier GPU con mas de 1 GB.
- En GPU de consumo: si el target se cuantiza a 4 bits, una RTX 4090 (24 GB) puede alojar ambos; con cuantizaciones mas agresivas, tambien en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp con soporte DFlash 2 (PR #27342) y el fix de gramatica del branch `fix/dflash2-tool-tg-collapse`. No es compatible con vLLM, Ollama o TGI sin modificaciones.
- Latencia y throughput: con `n_max=3`, se midieron 104.0 tok/s en la GPU de 24 GB de referencia; con `n_max=4`, 107.7 tok/s. Sin el fix de gramatica, la generacion con tool calls cae a ~25 tok/s; con el fix, se recupera a ~100 tok/s.

## Comparativa con modelos similares

No se dispone de informacion sobre otros drafts de DFlash 2 para Qwen3.8-27B mas alla de las variantes del propio autor. La comparacion mas relevante es con el draft de referencia `Q4_K_M` (1.090 MiB) y el `Q2_K` estandar (673 MiB), ambos del mismo repositorio. Frente a ellos, `Q2_K_S-MIX` ofrece el menor tamano (545 MiB) con una perdida de throughput de solo el 2-3 % respecto al `Q4_K_M`, y una tasa de aceptacion ligeramente superior a la del `Q2_K` puro. No hay alternativas comerciales comparables en el ecosistema GGUF para decodificacion especulativa de este target.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: solo funciona como draft dentro de un servidor de decodificacion especulativa con el target Qwen3.8-27B.
- Requiere una compilacion especifica de llama.cpp con soporte DFlash 2 (PR #27342) y, para generacion con gramatica, el fix del branch `fix/dflash2-tool-tg-collapse`; sin el fix, el rendimiento con tool calls o JSON mode colapsa a ~25 tok/s.
- La tasa de aceptacion es ligeramente inferior a la del `Q4_K_M` de referencia (2.68 vs 2.80 con `n_max=3`), lo que se traduce en ~3 % menos de throughput; no afecta a la calidad de salida.
- El draft no tiene contexto propio; su longitud de contexto efectiva depende del target y de la configuracion del servidor.
- No se han publicado evaluaciones de sesgos o alucinaciones para este draft; al ser un componente auxiliar, los riesgos de sesgo y alucinacion provienen del target Qwen3.8-27B.
- La licencia Apache-2.0 permite uso comercial, pero el despliegue en produccion requiere mantener el fork de llama.cpp con el fix, lo que puede suponer un coste de mantenimiento adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HermiHg/Qwen3.8-27B-DFlash2-Q2_K_S-MIX-GGUF
- Modelo draft original: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo target: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- PR de llama.cpp con soporte DFlash 2: https://github.com/ggml-org/llama.cpp/pull/27342
- Branch con fix de gramatica: https://github.com/HermiG/llama.cpp/tree/fix/dflash2-tool-tg-collapse
- Commit del fix: https://github.com/HermiG/llama.cpp/commit/fe3e373e3
