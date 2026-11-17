# soapyyapps/tiny-aya-water-global-safetune

## Resumen

`soapyyapps/tiny-aya-water-global-safetune` es un ajuste fino completo del modelo base `CohereLabs/tiny-aya-water`, un transformer de arquitectura Cohere2 con 3.349 millones de parámetros. Lo desarrolla el usuario `soapyyapps` en el contexto de un estudio de interpretabilidad mecanicista y reparación de circuitos de seguridad (proyecto CircuitKavach). El modelo se presenta como el checkpoint de referencia "upper-bound" de un ajuste fino global de seguridad: se actualizaron los 72 bloques de proyección de atención y MLP (36 capas, 100 % de los bloques) mediante la fusión de un adaptador LoRA denominado SafeGrad.

El problema que aborda es la alineación de seguridad en modelos multilingües de la familia Aya, concretamente en registros mixtos (hinglish, gujlish, kanglish) donde el modelo base muestra tasas de rechazo de ataques muy bajas. Este checkpoint sirve como comparación de techo frente a una variante "quirúrgica" que modifica solo 4 de 72 bloques. Su relevancia es metodológica: permite cuantificar cuánto se gana con un ajuste global completo frente a una intervención mínima y localizada, manteniendo cero sobre-rechazo en peticiones benignas.

La información pública disponible es una model card centrada en evaluación de seguridad y análisis de circuitos, no en capacidades generales de generación. No se detallan datos de preentrenamiento ni composición del corpus de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Cohere2 (etiqueta `cohere2` en transformers) |
| Parametros totales | 3.349.227.520 (3,35 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en, hi, gu, kn (ingles, hindi, gujarati, kannada); evaluacion adicional en registros mixtos hi_en, gu_en, kn_en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es `CohereLabs/tiny-aya-water`, un transformer de la familia Cohere2 con 36 capas y 72 bloques de proyección (atención y MLP) distribuidos en esas capas. Sobre esta base se aplicó un ajuste fino global: se fusionó un adaptador LoRA SafeGrad en los 72 bloques de proyección, de modo que el 100 % de los parámetros de proyección quedaron actualizados y el 0 % congelado. La pérdida de entrenamiento reportada es 0,6995. No se especifican en la información disponible el número de tokens de ajuste, la composición del dataset ni si hubo RLHF o DPO.

El trabajo forma parte de un pipeline de tres etapas documentado en la model card: descubrimiento de circuitos (Stage 2), auditoría quirúrgica (Stage 3) y evaluación (Stage 4). En el descubrimiento se identificaron los cuatro submodules con mayor contribución a la conducta de rechazo mediante EAP-IG: `model.layers.0.mlp` (rank_score 3,9531), `model.layers.16.self_attn` (2,8666), `model.layers.21.self_attn` (1,9318) y `model.layers.20.self_attn` (1,9295). La calibración usó el par de rechazo ` sorry` (id 40449) frente a ` when` (id 1434) con una diferencia de logits de 16,59, y 99 de 100 pares calibrados pasaron el filtro de margen. La fidelidad del circuito reporta `ablation_score = 0,0000`, `patching_score = 0,0273`, Jaccard medio 0,9788, Spearman medio 0,999833, 61 nodos estables y una ratio de reducción de KL de 0,0149. La revisión del modelo base empleada es `41a99216d12b3ef4881df762934186e5e4d2bbc1`.

## Capacidades

- Generación de texto conversacional en inglés, hindi, gujarati y kannada, con soporte para registros mixtos (hinglish, gujlish, kanglish).
- Rechazo de peticiones dañinas: 100 % de tasa de rechazo de ataques en la evaluación retenida de 200 pares (400 prompts).
- Selectividad alta: 0 % de sobre-rechazo en peticiones benignas emparejadas (200 twins benignos), manteniendo 100 % de utilidad benigna.
- Robustez multilingüe de seguridad: 100 % de rechazo en inglés, hinglish, gujlish y kanglish en este checkpoint.
- Capacidades de tool calling, function calling y razonamiento multi-paso: no documentadas en la información disponible.
- Modo de pensamiento explícito, visión o audio: no disponibles.

## Casos de uso

- Moderación y filtrado de contenido en asistentes multilingües para India y diáspora: el modelo mantiene rechazo del 100 % en registros mixtos hindi-inglés, gujarati-inglés y kannada-inglés, adecuado para pipelines de seguridad en producción con usuarios que alternan idiomas.
- Referencia de techo en experimentos de alineación: sirve como checkpoint de comparación para medir la pérdida de seguridad de intervenciones quirúrgicas (4/72 bloques) frente al ajuste completo, con métricas de selectividad y sobre-rechazo ya calculadas.
- Evaluación de reparación de circuitos: su paridad con la variante quirúrgica (96,5 % frente a 100 % de rechazo) permite validar metodologías de interpretabilidad mecanicista sin reentrenar el modelo completo.
- Despliegue de chatbots de atención al cliente en cuatro idiomas: al no degradar la utilidad benigna (100 %) y no introducir sobre-rechazo (0 %), es apto para conversaciones de soporte donde se requiere un filtro de seguridad sin fricción para el usuario.
- Auditoría de sesgos y seguridad en modelos pequeños: con 3,35 B de parámetros y licencia Apache 2.0, se puede ejecutar en infraestructura modesta para estudios de robustez adversarial en varios idiomas.
- Base para ajustes posteriores de dominio: al ser un ajuste global completo y no un adaptador, puede servir como punto de partida para especializaciones verticales que necesiten heredar la conducta de rechazo ya calibrada.

## Benchmarks y rendimiento

Evaluación Stage 4 sobre `CohereLabs/tiny-aya-water`, conjunto retenido de 200 pares (400 prompts):

| Checkpoint | Parametros modificados | Parametros congelados | Bloques de proyeccion | Rechazo de ataque | Sobre-rechazo benigno | Utilidad benigna | Gap de selectividad | RedTeam attack pass | Tokens/s |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `checkpoint_1_base` (base) | 0,00 % | 100,00 % | 0/72 | 53,5 % | 0,0 % | 100,0 % | +0,535 | 19,0 % | 30,76 |
| `checkpoint_2_global_safetune` (global 72/72) | 100,00 % (LoRA todas las capas) | 0,00 % | 72/72 | 100,0 % | 0,0 % | 100,0 % | +1,000 | 47,6 % | 29,02 |
| `checkpoint_3_surgical_ctheta` (quirurgico 4/72) | 2,55 % | 97,45 % | 4/72 | 96,5 % | 0,0 % | 100,0 % | +0,965 | 42,9 % | 28,76 |

Desglose por idioma y registro (`eval_200_pairs.jsonl`):

| Registro | Rechazo base | Global SafeTune (72/72) | Quirurgico C-ΔΘ (4/72) | Ganancia quirurgica vs. base | Sobre-rechazo benigno (quirurgico) |
|---|---:|---:|---:|---:|---:|
| Ingles (`en`, n=50) | 100,0 % | 100,0 % | 100,0 % | +0,0 pp | 0,0 % |
| Hinglish (`hi_en`, n=50) | 66,0 % | 100,0 % | 100,0 % | +34,0 pp | 0,0 % |
| Gujlish (`gu_en`, n=50) | 10,0 % | 100,0 % | 98,0 % | +88,0 pp | 0,0 % |
| Kanglish (`kn_en`, n=50) | 38,0 % | 100,0 % | 88,0 % | +50,0 pp | 0,0 % |

Significancia estadistica (AuditKIT, bootstrap emparejado):

| Comparacion | Delta | p-valor | Significativo |
|---|---:|---:|---|
| Base vs. quirurgico C-ΔΘ (n=200 pares dañinos) | +43,0 pp (0,535 → 0,965) | 0,000999 | Si |
| Global SafeTune vs. quirurgico C-ΔΘ (n=200 pares dañinos) | +0,035 (1,000 vs. 0,965) | 0,007992 | Si |
| Sobre-rechazo benigno (n=200 twins benignos) | 0,0 % | 1,0 | No (cero sobre-rechazo) |

Estudio de universalidad en cuatro variantes regionales de `tiny-aya`:

| Modelo | Rechazo base | Global SafeTune (72/72, sobre-rechazo) | Quirurgico C-ΔΘ (4/72, sobre-rechazo) | Selectividad quirurgica | Parametros modificados | Mejor α | Rechazo quirurgico `kn_en` |
|---|---:|---:|---:|---:|---:|---:|---:|
| `tiny-aya-fire` | 40,0 % | 99,0 % (0,0 %) | 94,5 % (0,0 %) | +0,945 | 2,55 % (4/72) | 1,0 | 78,0 % |
| `tiny-aya-global` | 45,5 % | 99,0 % (0,0 %) | 96,5 % (0,0 %) | +0,965 | 2,55 % (4/72) | 1,0 | 86,0 % |
| `tiny-aya-water` | 53,5 % | 100,0 % (0,0 %) | 96,5 % (0,0 %) | +0,965 | 2,55 % (4/72) | 1,0 | 88,0 % |
| `tiny-aya-earth` | 53,5 % | 99,5 % (0,0 %) | 99,0 % (0,0 %) | +0,990 | 2,55 % (4/72) | 1,0 | 100,0 % |

Solapamiento de circuitos entre pares de modelos (Jaccard top-4 y Spearman sobre 72 bloques):

| Par de modelos | Jaccard top-4 | Spearman ρ | Submodulos compartidos |
|---|---:|---:|---|
| `fire__global` | 1,000 | 0,9373 | `layers.0.mlp`, `layers.16.self_attn`, `layers.20.self_attn`, `layers.21.self_attn` |
| `fire__water` | 1,000 | 0,9217 | `layers.0.mlp`, `layers.16.self_attn`, `layers.20.self_attn`, `layers.21.self_attn` |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,7 GB solo para pesos (tamaño del repo), más overhead de activaciones y KV cache; en la práctica, entre 8 y 10 GB según longitud de contexto.
- Cuantización a 8 bits: alrededor de 3,5-4 GB de pesos; a 4 bits, alrededor de 2-2,5 GB. No se documentan artefactos GGUF ni AWQ/GPTQ en el repositorio.
- GPU recomendadas: A100 40/80 GB o H100 para despliegues concurrentes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia holgada en FP16; RTX 4080/4070 Ti (16 GB) y RTX 4060 Ti (16 GB) suficientes en FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080, 4070 Ti y 4060 Ti de 16 GB en BF16; en tarjetas de 8 GB requiere cuantización.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servir con arquitectura Cohere2; llama.cpp/Ollama solo si se generan pesos GGUF, no incluidos en el repo.
- Rendimiento reportado en la evaluación: 29,02 tokens/s para este checkpoint global, frente a 30,76 tokens/s del base y 28,76 tokens/s del quirúrgico, en el hardware no especificado de la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo de ataque (evaluacion propia) | Sobre-rechazo benigno | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| `soapyyapps/tiny-aya-water-global-safetune` | 3,35 B | no disponible | 100,0 % | 0,0 % | Apache 2.0 | Hugging Face, 18 descargas |
| `soapyyapps/tiny-aya-water-circuit-kavach-merged` (quirurgico) | 3,35 B (2,55 % modificado) | no disponible | 96,5 % | 0,0 % | Apache 2.0 (segun modelo base) | Hugging Face |
| `CohereLabs/tiny-aya-water` (base) | 3,35 B | no disponible | 53,5 % | 0,0 % | Apache 2.0 | Hugging Face |
| `CohereLabs/tiny-aya-earth` (variante regional) | 3,35 B | no disponible | 53,5 % base / 99,5 % global | 0,0 % | Apache 2.0 | Hugging Face |

La comparación se limita a la familia `tiny-aya` porque la información disponible no incluye métricas de modelos de otros proveedores. En términos de parámetros y licencia, alternativas de tamaño similar serían otros modelos de 3-4 B con licencia permisiva, pero no hay datos de benchmarks comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La evaluación de seguridad se realizó sobre un conjunto propio de 200 pares (400 prompts) con registros mixtos; no hay validación con benchmarks de seguridad estándar externos, por lo que la generalización a otros dominios de ataque no está demostrada.
- El modelo está ajustado para rechazar ataques en cuatro idiomas y sus registros mixtos; el comportamiento en otros idiomas no está evaluado y podría degradarse.
- No se documentan datos de preentrenamiento, composición del corpus de ajuste ni proceso de alineación (RLHF/DPO), lo que dificulta auditar sesgos subyacentes.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de 3,35 B, es esperable una tasa superior a modelos de mayor tamaño en tareas de conocimiento factual.
- El ajuste global completo (100 % de bloques modificados) puede alterar capacidades generales del modelo base más allá de la conducta de seguridad; la model card solo reporta utilidad benigna en el conjunto de evaluación propio.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción ni sobre la robustez frente a ataques adversariales no vistos.
- El repositorio tiene 18 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación con validación comunitaria limitada.
- Los tags incluyen `endpoints_compatible` y `region:us`, pero no se documenta soporte oficial de despliegue en Inference Endpoints más allá de la compatibilidad declarada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soapyyapps/tiny-aya-water-global-safetune
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-water
- Variante quirurgica C-ΔΘ: https://huggingface.co/soapyyapps/tiny-aya-water-circuit-kavach-merged
- Variante regional fire: https://huggingface.co/CohereLabs/tiny-aya-fire
- Variante regional global: https://huggingface.co/CohereLabs/tiny-aya-global
- Variante regional earth: https://huggingface.co/CohereLabs/tiny-aya-earth
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
