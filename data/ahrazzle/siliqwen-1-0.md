# ahrazzle/SiliQwen-1.0

## Resumen

SiliQwen 1.0 es un modelo de generacion de texto derivado de Qwen2.5-1.5B, publicado por el autor independiente ahrazzle bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de una adaptacion mediante evolucion sin retropropagacion (zero-backprop evolution strategy) sobre una version cuantizada del modelo base de Alibaba. El artefacto resultante ocupa 1,36 GB y contiene 1.092.610.852 parametros en safetensors, con un formato propietario denominado `siliquant-hf-v1`.

El interes tecnico del modelo reside en su pipeline de compresion: combina cuantizacion `A_16-BlockH4` en las capas lineales 1 a 26, proteccion `MXFP8` en los extremos (capas 0 y 27) y una estrategia evolutiva de busqueda de Pareto que ajusta los pesos sin calcular gradientes. El autor reporta metricas verificadas de perplejidad y de tareas de razonamiento (GSM8K, Countdown) sobre un portatil con RTX 3080 de 8 GiB, lo que lo convierte en un ejemplo de optimizacion agresiva para hardware de consumo.

Es relevante ahora por dos motivos: demuestra que es posible aplicar estrategias evolutivas a modelos cuantizados de forma reproducible y verificable (checksums SHA-256, sindromes SECDED), y porque se distribuye como un drop-in de `transformers` sin kernels CUDA personalizados. No obstante, su adopcion practica es muy limitada: cero descargas, cero likes y una model card centrada en detalles de infraestructura mas que en capacidades funcionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B), con capas lineales cuantizadas en formato `siliquant-hf-v1` |
| Parametros totales | 1.092.610.852 (safetensors); 1.543.714.304 contando embeddings y `lm_head` atado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | `A_16-BlockH4` (5.2339 bpw en L1..26), `MXFP8` (8.25 bpw en L0/L27); media 5.4494 bpw en lineales cuantizadas, ~7.05 bpw en el fichero completo |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 (heredada de Qwen2.5-1.5B) |
| Formato de pesos | safetensors (con `trust_remote_code=True` y `siliquant-hf-v1`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer decoder-only con atencion por causalidad, `RoPE` y `lm_head` atado a los embeddings. Sobre esa base, el autor aplica un esquema de cuantizacion por bloques con normas compartidas (`QuadLPT-SharedNorm`), cuatro gauges (`G1..G4`) que compensan el redondeo de sesgos y normas en BF16, y una proteccion de "borde de acantilado" `MXFP8` en las capas 0 y 27 para evitar la degradacion tipica en los extremos de la red. El checkpoint final reporta 0 sindromes SECDED y 0.0 de deriva en recarga en frio.

El ajuste no usa retropropagacion: se aplica una estrategia evolutiva (`zero-backprop-es`) con semilla 1753 y 16 pasos, que busca puntos de Pareto entre perplejidad en WT2, precision en GSM8K y precision en Countdown. El autor reporta que la variante `V3 s1753` mejora simultaneamente Countdown, GSM8K y WT2 frente al ancla `V0` en 3 de 3 semillas. La innovacion destacable es el prefijo exacto `L0..L9` con `FT_PIWL` hoisted, que acelera el sufijo 1.5640x sin alterar la salida. No se documentan datos de entrenamiento adicionales ni composicion del dataset.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Qwen2.5-1.5B.
- Razonamiento aritmetico basico y resolucion de problemas tipo GSM8K (precision reportada del 9.38% pass@1).
- Tareas de conteo y planificacion ligera (Countdown, ~5.47% pass@1 en el artefacto publicado).
- Generacion de codigo basica, limitada por el tamano del modelo base.
- Conversacion multi-turno (tag `conversational` en Hugging Face).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta vision, audio ni modo de pensamiento.
- Multilingue: solo ingles declarado.

## Casos de uso

- Prototipado de pipelines de cuantizacion: sirve como referencia reproducible para validar tecnicas de cuantizacion por bloques y estrategias evolutivas sobre un modelo pequeno, con checksums y verificacion de integridad incluidas.
- Investigacion en optimizacion sin gradientes: util para experimentar con evolution strategies aplicadas a pesos cuantizados, comparando puntos de Pareto entre perplejidad y tareas de razonamiento.
- Despliegue en hardware de consumo: con ~1,36 GB de pesos cabe en GPUs de 4-8 GiB, lo que permite ejecutar inferencia en portatiles con RTX 3050/3060 o incluso en CPU con suficiente RAM.
- Generacion de texto en ingles de baja latencia: adecuado para tareas de completado, resumen corto o clasificacion generativa donde no se requiera alta precision.
- Educacion y divulgacion: buen ejemplo didactico de como se documenta un checkpoint cuantizado con verificacion criptografica y metricas de integridad.
- Evaluacion comparativa de tecnicas de compresion: permite contrastar `A_16-BlockH4` + `MXFP8` frente a otras recetas de cuantizacion sobre el mismo modelo base.
- No se recomienda para atencion al cliente en produccion, agentes autonomos ni generacion de codigo en CI/CD, dado su tamano, su limitacion al ingles y la ausencia de soporte de tool calling.

## Benchmarks y rendimiento

| Configuracion | WT2 NLL | WT2 PPL | GSM8K Gold NLL | GSM8K Pass@1 | CD GT NLL | CD Pass@1 |
|---|---:|---:|---:|---:|---:|---:|
| `V0_Shipped_45bpw` (ancla 4.5 bpw) | 2.64225 | 14.0448 | 0.64160 | 7.81% | 0.53489 | 7.03% |
| `V1_SuperBase_F1b` | 2.63809 | 13.9864 | 0.62831 | 9.38% | 0.54155 | 6.25% |
| `V2_F1b_L10_23_QO_16step` | 2.63621 | 13.9602 | 0.62775 | 6.25% | 0.53497 | 7.03% |
| **SiliQwen 1.0 (V3 s1753)** | **2.63750** | **13.9783** | **0.62318** | **9.38%** | **0.52415** | 5.47% |
| `S182g` (44 pasos) | 2.64330 | 14.0595 | 0.62541 | 7.81% | **0.51340** | **7.03%** |

Todas las ejecuciones se realizaron en una RTX 3080 Laptop (sm_86, 8 GiB) con estado de energia no controlado. Pico de VRAM: 4.662,1 MiB (4.988,0 MiB reservados). Tiempo de GPU: 526,1 s. Aceleracion del sufijo con prefijo hoisted: 1.5640x.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,4-2,0 GiB para los pesos en BF16/FP32 mixto; el autor reporta 4,66 GiB de pico en carga y generacion sobre RTX 3080 Laptop.
- GPU recomendadas: cualquier GPU con al menos 4 GiB de VRAM; RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GiB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (unica via documentada); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `siliquant-hf-v1`.
- Latencia y throughput: no disponible de forma agregada; el autor reporta 526,1 s de tiempo total de GPU para el conjunto de evaluacion, no por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K pass@1 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| SiliQwen 1.0 | 1.092 M (cuantizado) | no disponible | 9.38% | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-1.5B (base) | 1.543 M | 32.768 tokens (segun ficha oficial de Qwen) | ~no disponible en esta ficha | Apache 2.0 | Ampliamente disponible |
| Qwen2.5-1.5B-Instruct | 1.543 M | 32.768 tokens | ~no disponible en esta ficha | Apache 2.0 | Ampliamente disponible |
| SmolLM2-1.7B | 1.700 M | 8.192 tokens | no disponible | Apache 2.0 | Ampliamente disponible |

La comparativa directa con el modelo base es la mas informativa: SiliQwen 1.0 reduce el peso de 3,1 GB (BF16) a 1,36 GB, a costa de una precision en GSM8K muy baja (9.38%) y de perder el soporte multilingue declarado por Qwen. Frente a SmolLM2-1.7B, el contexto y el rendimiento no son directamente comparables por falta de datos publicos en esta ficha.

## Limitaciones y advertencias

- Precision muy baja en tareas de razonamiento: 9.38% en GSM8K y 5.47% en Countdown, insuficiente para uso productivo en matematicas.
- Solo soporta ingles; el modelo base Qwen2.5-1.5B soporta multiples idiomas, pero esta adaptacion declara unicamente `en`.
- Riesgo elevado de alucinacion por el tamano reducido y la cuantizacion agresiva (5.4494 bpw en lineales).
- Formato propietario `siliquant-hf-v1`: requiere `trust_remote_code=True` y no es compatible con ecosistemas estandar como llama.cpp, Ollama o vLLM.
- Sin soporte documentado de tool calling, function calling ni agentes.
- Cero descargas y cero likes en Hugging Face; sin validacion externa de la comunidad.
- El autor indica que la subida publica estaba pendiente de verificacion externa `SOP-11` no-Claude; conviene tratar las metricas como no auditadas de forma independiente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B impone sus propios terminos; revisar `NOTICE_UPSTREAM_LICENSE.txt`.
- No se documenta la longitud de contexto efectiva tras la cuantizacion; asumir la del modelo base (32.768 tokens) es arriesgado sin verificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahrazzle/SiliQwen-1.0
- Codigo y kernels: https://github.com/Moissanite-Labs/siliqwen
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B/blob/main/LICENSE
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
