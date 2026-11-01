# cicalooo/Qwen3.8-27B-FrostDFlash-GGUF

## Resumen

Qwen3.8-27B-FrostDFlash-GGUF es un repositorio de cuantizaciones custom de un modelo *drafter* (borrador) para decodificación especulativa, creado por el usuario cicalooo. No se trata de un LLM autónomo, sino de tres "sidecards" de aproximadamente 1,9 mil millones de parámetros cada una, basadas en el drafter DFlash2 de z-lab para el modelo objetivo Qwen3.8-27B. Su función es acelerar la inferencia del modelo grande bajo llama.cpp mediante decodificación especulativa de tipo `draft-dflash`.

El interés técnico del repositorio radica en dos innovaciones: una cuantización de "gradiente de precisión" (los tensores más sensibles al error, como la cabeza de selección, se mantienen en Q6_K/Q5_K, mientras que las puertas FFN redundantes bajan a IQ3_S), y las variantes D2T, que recortan el vocabulario de salida del draft a los 32.768 tokens más útiles, reduciendo el tamaño y activando una ruta d2t residente en GPU. El resultado es un draft que ocupa entre 999 MiB y 1,40 GiB en disco, notablemente más compacto que las cuantizaciones planas equivalentes.

Es relevante para usuarios que ya ejecutan Qwen3.8-27B (concretamente el merge Uncensored-HauhauCS-Aggressive) con llama.cpp y buscan aumentar el throughput de generación sin perder calidad en el modelo objetivo, ya que el draft solo propone tokens que el modelo grande verifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | dflash (block-diffusion draft model, 5 bloques DFlash) |
| Parametros totales | ~1,9B (drafter); 2.092.209.408 segun safetensors del repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixed-Low: IQ3_S (FFN gate/up) + IQ4_XS (attn/fc) + Q5_K/Q6_K (selector), 4,31 BPW; D2T-Mixed-Low: 4,65 BPW; D2T-Q5K: Q5_K + Q4_K, 5,57 BPW |
| Idiomas soportados | en (etiquetado; funciona como draft para el modelo objetivo) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura `dflash` es un modelo de borrador por difusion en bloques (block-diffusion) con 5 bloques DFlash. Cada bloque combina atencion estandar (proyecciones q/k/v/output con normalizacion por cabeza `attn_q_norm`/`attn_k_norm`), una ruta de caracteristicas convolucional (`attn_conv_base` + `attn_conv_proj`) y un FFN con puertas (`ffn_gate/up/down`) que tambien incorpora una ruta conv (`ffn_conv_base`/`ffn_conv_proj`). La longitud de embedding es 5120 y la base RoPE es 1e7. El componente clave es la cabeza de seleccion (`selector_hidden`, `selector_predecessor`, `selector_successor`), que decide que tokens propone el draft y que se preserva a Q6_K/Q5_K en todas las recetas.

No hay entrenamiento propio: los pesos provienen del drafter BF16 `z-lab/Qwen3.8-27B-DFlash2-GGUF`. La variante Mixed-Low se reconstruyo desde BF16; las variantes D2T se construyeron desde una cuantizacion Q8_0 casi sin perdidas, anadiendo la cabeza de salida reducida (32K filas tomadas de la cabeza `output` del modelo Parasyte) y el mapa `d2t` (I64, [32768]) reutilizado de la asignacion FastMTP-32K, verificado sin discrepancias. El draft de vocabulario completo no tiene tensores propios de `token_embd`/`output.weight`: toma prestados el tokenizador y el embedding de salida del modelo objetivo.

## Capacidades

- No genera texto de forma autonoma: es un modelo draft que propone tokens para verificacion por el modelo objetivo Qwen3.8-27B.
- Proposicion de tokens con vocabulario completo (248.320 tokens, tomando prestado el tokenizador del objetivo) en la variante Mixed-Low.
- Proposicion restringida a 32.768 tokens en las variantes D2T, subconjunto que cubre la gran mayoria de aciertos de draft.
- Ejecucion como sidecar bajo llama.cpp con decodificacion especulativa (`--spec-type draft-dflash`).
- No soporta tool calling, agentes, vision ni audio; no aplica al ser un draft model.

## Casos de uso

- Aceleracion de inferencia local de Qwen3.8-27B: el draft se ejecuta junto al modelo objetivo en llama.cpp para aumentar tokens/segundo sin alterar la distribucion de salida del modelo grande.
- Despliegue en VRAM ajustada: la variante Mixed-Low (999 MiB) permite anadir decodificacion especulativa a un setup donde no cabe un draft mas grande, dejando la VRAM restante para el modelo objetivo y su KV cache.
- Servidores de inferencia con alta demanda: el recorte D2T reduce el tamano del draft y activa la ruta d2t en GPU, util para maximizar throughput en servidores multiusuario.
- Experimentacion con cuantizacion por gradiente de precision: las recetas publicadas (archivo `dflash_q4_recipe.txt`) sirven de referencia para construir cuantizaciones mixtas propias con `llama-quantize --pure --tensor-type-file`.
- Comparacion de tiers de calidad: las variantes D2T-Mixed-Low y D2T-Q5K difieren solo en 26 tensores, lo que permite medir el impacto real de subir IQ3_S a Q5_K en las puertas FFN.
- Generacion local de texto largo (chat, redaccion, codigo via el modelo objetivo) donde la latencia de decodificacion es el cuello de botella y el draft aumenta los tokens aceptados por paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card aporta unicamente datos de tamano: Mixed-Low ocupa 999 MiB (4,31 bits/peso), unos 91 MiB menos que una cuantizacion plana Q4_K_M (~1090 MiB) con mayor precision efectiva en los tensores criticos; D2T-Mixed-Low ocupa 1,17 GiB (4,65 BPW) y D2T-Q5K 1,40 GiB (5,57 BPW). No hay cifras de tasa de aceptacion de draft ni de aceleracion medida.

## Requisitos de hardware

- VRAM para el draft: ~1,0 GiB (Mixed-Low), ~1,2 GiB (D2T-Mixed-Low) o ~1,4 GiB (D2T-Q5K), ademas de la VRAM del modelo objetivo Qwen3.8-27B y su KV cache.
- GPU recomendadas: no disponible explicitamente; por tamano, el draft cabe en GPUs de gama consumer (RTX 3090/4090/5090) junto al modelo objetivo; el requisito total depende de la cuantizacion elegida para Qwen3.8-27B.
- Consumer GPU: el draft en si cabe con holgura en una RTX 4090 (24 GB) o incluso en tarjetas de 16 GB si el modelo objetivo corre parcialmente en CPU o en cuantizacion muy agresiva.
- Despliegue: llama.cpp con decodificacion especulativa `--spec-type draft-dflash`. Las variantes D2T requieren una build parcheada de llama.cpp con la logica d2t (codigo de modelo `qwen35`/`dflash` modificado); llama.cpp oficial no las ejecuta.
- Latencia y throughput: no disponibles; dependen de la tasa de aceptacion del draft sobre el modelo objetivo.

## Comparativa con modelos similares

| Modelo | Rol | Tamano | Vocabulario draft | BPW | Licencia |
|---|---|---|---|---|---|
| FrostDFlash Mixed-Low (este repo) | Draft DFlash2 para Qwen3.8-27B | 999 MiB | 248.320 (completo) | 4,31 | apache-2.0 |
| FrostDFlash D2T-Mixed-Low (este repo) | Draft con vocabulario recortado | 1,17 GiB | 32.768 (d2t) | 4,65 | apache-2.0 |
| FrostDFlash D2T-Q5K (este repo) | Draft D2T tier de calidad | 1,40 GiB | 32.768 (d2t) | 5,57 | apache-2.0 |
| Draft BF16 original (z-lab/Qwen3.8-27B-DFlash2-GGUF) | Draft sin cuantizar | ~3,7 GiB (BF16) | 248.320 | 16 | apache-2.0 |
| Draft Q8_0 local | Draft casi sin perdidas | 1,93 GiB | 248.320 | ~8,5 | apache-2.0 |

Alternativas externas de draft models comparables (p. ej. otros drafters para decodificacion especulativa de EAGLE o Medusa sobre Qwen) no se han documentado en la informacion disponible: no disponible.

## Limitaciones y advertencias

- No es un LLM standalone: no produce texto util por si solo y debe emparejarse siempre con el modelo objetivo Qwen3.8-27B (concretamente el merge Uncensored-HauhauCS-Aggressive, que comparte tokenizador).
- Las variantes D2T requieren una build parcheada de llama.cpp; con llama.cpp oficial no funcionan.
- El draft solo puede proponer tokens del subconjunto de 32.768 en las variantes D2T, lo que puede reducir la tasa de aceptacion en salidas con vocabulario raro (codigo con tokens infrecuentes, idiomas distintos del ingles, caracteres especiales).
- El modelo objetivo es una version "uncensored/aggressive" de terceros: conlleva los riesgos de seguridad, sesgo y generacion de contenido sin filtros propios de ese merge, ajenos a este repo pero relevantes en produccion.
- Riesgo de alucinacion: corresponde al modelo objetivo; el draft no lo agrava (la verificacion es del modelo grande), pero no lo corrige.
- Contexto, sesgos y rendimiento del conjunto: no disponibles; dependen del modelo objetivo.
- Licencia apache-2.0 heredada: permite uso comercial sin restricciones adicionales mas alla de la atribucion estandar.
- Repositorio comunitario con escaso historico (596 descargas, 0 likes en el momento de la ficha): sin garantias de mantenimiento ni verificacion independiente de las recetas de cuantizacion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/cicalooo/Qwen3.8-27B-FrostDFlash-GGUF
- Draft fuente BF16 (z-lab): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cabeza de salida D2T (referenciada): https://huggingface.co/Plaguekind/Qwen3.8-27B-Parasyte-GGUF
- Enlace de soporte del autor: https://throne.com/plaguekind/item/073bace1-2e1a-4492-95e6-024b4da6459b
