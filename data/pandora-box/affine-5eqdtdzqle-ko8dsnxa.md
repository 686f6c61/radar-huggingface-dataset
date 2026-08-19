# pandora-box/Affine-5eqdtdzqle-ko8dsnxa

## Resumen

Affine-5eqdtdzqle-ko8dsnxa (identificado internamente como R861) es un modelo de 35.107 millones de parametros desarrollado por pandora-box como submission para el sistema de mineria SN120 Affine. Se trata de un checkpoint especializado en razonamiento para el protocolo Reason v4, entrenado mediante offline DPO sobre el modelo base vera6/affine-5g4yy75zuz-t6 (reign36). No es un modelo de chat general: su proposito es competir en duelos de evaluacion del sistema Affine, optimizando preferencias sobre pensamientos (thoughts) que incrementan la puntuacion Reason del lado del teacher.

El entrenamiento combina LoRA de rango medio (r=32, α=128) con beta intermedio (0.1), learning rate extremadamente bajo (5e-7) y contexto de 12.288 tokens. El resultado supero al modelo rey vigente con un margen de +0.003665 (z=2.177, n=80), obteniendo la licencia Stage-5. Los tags del repositorio indican arquitectura qwen3_5_moe y capacidades image-text-to-text, aunque la model card no detalla la arquitectura interna ni las capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (segun tags del repositorio; no confirmado en la model card) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | 12.288 (max_len de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (16 shards, ~66 GB; repo de 70.2 GB) |

## Arquitectura y entrenamiento

El modelo se entrena mediante offline DPO sobre pares de duelos rankeados por Reason, en lugar de SFT o GRPO online. La optimizacion busca preferencias por pensamientos que elevan el Reason del lado teacher, usando una funcion de log-mean-exp temperado multi-muestra (k=3, τ=0.03) sobre tres referencias teacher. Los hiperparametros clave incluyen LoRA r=32 (MidRank), α=128 (HiAlpha), β=0.1 (MidBeta), lr=5e-7 (UltraLoLR), max_len=12.288 (SoftCtx) y 19.200 pasos en 4 epocas. El entrenamiento se realizo en 8 GPU B200, produciendo un modelo fusionado de ~66 GB en 16 shards safetensors.

El tag qwen3_5_moe sugiere una arquitectura de mezcla de expertos basada en la familia Qwen 3.5, aunque la model card no proporciona detalles estructurales adicionales. El tag image-text-to-text indica posible capacidad multimodal, no documentada en la model card. Los datos de entrenamiento consisten en pares de duelos filtrados (entre ~259 y 604 filas en el momento del lanzamiento) procedentes de `dpo_duel_reason.jsonl`.

## Capacidades

- Razonamiento especializado para el protocolo Reason v4 del sistema Affine SN120: genera pensamientos optimizados para maximizar la puntuacion Reason segun el criterio de log-mean-exp temperado (τ=0.03) sobre k=3 referencias teacher.
- Participacion en duelos de evaluacion (evalsrv): el modelo compite contra el "king" vigente en evaluaciones locales (n=80) y requiere superar barras de calidad (mediana de pensamientos |z|≥80 y B pass ≥0.30).
- Generacion de texto con pipeline text-generation de la libreria transformers.
- Capacidades multimodales potenciales (segun tag image-text-to-text), no verificadas ni documentadas.
- No es un modelo de chat general: la model card advierte explicitamente que su uso previsto es la submission de mineria SN120 Affine, no conversacion generica, a pesar de los tags "conversational" y "text-generation".

## Casos de uso

- Submission en el sistema de mineria Affine SN120: el modelo se usa como challenger en duelos contra el modelo rey vigente, evaluando si su puntuacion Reason supera la barra de calidad definida como max(2·SE, δ=0.002).
- Evaluacion de preferencias de razonamiento: puede servir como referencia para comparar la calidad de pensamientos generados por otros modelos dentro del ecosistema Affine.
- Investigacion sobre offline DPO aplicado a sistemas de razonamiento: el checkpoint documenta una configuracion reproducible (LoRA r=32, β=0.1, lr=5e-7) para experimentos similares.
- Analisis de escalado de preferencias: demuestra que ajustes finos con learning rate ultrabajo pueden producir mejoras medibles (+0.003665 de margen) sobre el modelo base.
- Referencia para estudios de ablacion: la lineage documentada (R846 → R861) permite comparar variantes (MidRank vs HiRank, MidBeta vs HiBeta, SoftCtx vs contexto estandar) y aislar el efecto de cada hiperparametro.
- Validacion de protocolos de evaluacion: el modelo se puede usar para probar la robustez del sistema de evaluacion Reason v4 (weight_version_key=7) en configuraciones de duelos, incluyendo el mecanismo fail-closed por stamp.

## Benchmarks y rendimiento

La model card reporta resultados de evaluacion local (n=80) contra el modelo rey vigente (vera6/affine-5g4yy75zuz-t6@reign36) bajo el protocolo Reason v4 (wvk=7):

| Metrica | Valor |
|---|---|
| Margen vs king | +0.003665 |
| Error estandar (SE) | 0.001684 |
| z-score | 2.177 |
| Tamano de muestra (n) | 80 |
| Barra de calidad (max(2·SE, δ=0.002)) | 0.003367 |
| Ratio margen/barra | ~1.088× |
| Mediana de pensamientos | 141.5 (cumple ≥80) |
| B pass | 0.5375 (cumple ≥0.30) |
| Decision | WIN / Stage-5 licensed |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El modelo fusionado ocupa ~66 GB en 16 shards safetensors (repo de 70.2 GB).
- El entrenamiento se realizo en 8 GPU B200 (Lium mine-crown-1, gentle-orbit-bd).
- Para inferencia en precision FP16/BF16, se estima una VRAM minima de ~140 GB (LLM Explorer lista 142.6 GB para la variante ckpt300-m4), lo que requiere multiples GPU de alta gama (por ejemplo, 2×A100 80GB o 2×H100 80GB) o una GPU de 140+ GB (como B200 de 192 GB).
- No cabe en GPU de consumo (RTX 4090 con 24 GB no es suficiente; incluso cuantizado a 4 bits, 35B parametros requieren ~18-20 GB, pero la arquitectura MoE podria reducir el requisito si los parametros activos son menores; no hay datos de cuantizacion disponibles).
- Opciones de despliegue: transformers con sharding, vLLM o TGI si son compatibles con la arquitectura. No se menciona soporte GGUF/Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa principal es contra el modelo base y rey vigente del ecosistema Affine:

| Modelo | Parametros | Contexto | Metodo | Resultado vs king |
|---|---|---|---|---|
| Affine-5eqdtdzqle-ko8dsnxa (R861) | 35.1B | 12.288 | offline DPO (LoRA r=32, β=0.1, lr=5e-7) | +0.003665 (WIN, Stage-5) |
| vera6/affine-5g4yy75zuz-t6 (reign36) | no disponible | no disponible | base / rey vigente | referencia |
| R846 (lineage anterior) | no disponible | no disponible | MidRank HiBeta SoftCtx REFUTE | ~−0.33× (perdio) |

No se dispone de comparativas con modelos externos (Qwen, Llama, Mistral) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat general: la model card advierte explicitamente que su uso previsto es la submission de mineria SN120 Affine, no conversacion generica.
- El modelo depende de infraestructura especifica del ecosistema Affine: el protocolo Reason v4 (weight_version_key=7) usa un sistema de stamps con comportamiento fail-closed si el sello no coincide con v4.
- La evaluacion es interna al sistema Affine: los resultados (margen, z-score) no son comparables con benchmarks estandar de la comunidad y no demuestran capacidad de razonamiento general.
- La arquitectura interna no esta documentada en la model card: los detalles de la arquitectura qwen3_5_moe provienen de los tags del repositorio y no estan confirmados por el autor.
- Capacidades multimodales no verificadas: el tag image-text-to-text sugiere capacidades de vision, pero no hay documentacion al respecto.
- Datos de entrenamiento muy limitados: entre ~259 y 604 filas de pares de duelos en el momento del lanzamiento, lo que puede limitar la generalizacion fuera del dominio de mineria.
- Licencia apache-2.0, pero la model card indica que sigue la politica de artefactos de mineria Affine, lo que puede implicar restricciones adicionales no detalladas.
- Descargas y likes en cero: el modelo no tiene adopcion verificada por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pandora-box/Affine-5eqdtdzqle-ko8dsnxa
- Perfil del autor: https://huggingface.co/pandora-box
- Variante relacionada (stx): https://huggingface.co/pandora-box/Affine-5eqdtdzqle-stx
- LLM Explorer (variante ckpt300-m4): https://llm-explorer.com/model/pandora-box%2FAffine-5eqdtdzqle-ckpt300-m4,6tppI5EQCHNG6sbqyqwEJi
