# akoumpa/Moonlight-V4-1B-h16d256

## Resumen

Moonlight-V4-1B-h16d256 es un repositorio de **configuracion de arquitectura**, no un modelo entrenado. Publicado por el usuario akoumpa, contiene el `config.json` y los ficheros auxiliares de un transformer de tipo Mixture-of-Experts con atencion hibrida que replica a escala reducida la arquitectura DeepSeek-V4 (segun la nomenclatura del propio autor, que se apoya en los papers arXiv:2502.16982 y arXiv:2606.19348). El modelo declara 999.670.879 parametros totales (999,7 M) y 539,6 M activados por token, con 15 capas, `hidden_size` 1024 y una ventana de contexto de 4096 tokens. No se han publicado pesos: el repositorio solo incluye configuracion, tokenizer y scripts de entrenamiento, y la carga mediante `transformers` produce una inicializacion aleatoria.

El problema que aborda es de tipo metodologico: llevar DeepSeek-V4 a un presupuesto de laboratorio pequeno, de forma que sea posible pre-entrenar la arquitectura completa desde cero en dos GPU de 48 GB con la receta NeMo Automodel (FSDP2). Para ello se redimensionan las dimensiones de atencion (16 cabezas de consulta x `head_dim` 256) de modo que el kernel de atencion dispersa de TileLang encaje en GPU con 99 KB de memoria compartida, es decir, en la clase Ada y en tarjetas de consumo.

Es relevante ahora porque DeepSeek-V4 publica configuraciones de 284B/13B (Flash) y 1,6T/49B (Pro) que resultan inaccesibles para la mayoria de equipos de investigacion, mientras que esta variante permite estudiar los mismos mecanismos —Compressed Sparse Attention (CSA), Heavily Compressed Attention (HCA), lightning indexer, hyper-conexiones con restriccion de variedad (mHC) y encaminamiento MoE sin perdida auxiliar— a una escala de 1B. El repositorio hermano `akoumpa/Moonlight-V4-1B-h16d256-r8` sustituye las capas CSA de ratio 4 por compresion de ratio 8 sin indexer, lo que abarata el entrenamiento a contexto corto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion hibrida (sliding window + Compressed Sparse Attention + Heavily Compressed Attention) y Mixture-of-Experts en todas las capas; `deepseek_v4` en transformers |
| Parametros totales | 999.670.879 (999,7 M); 734,9 M sin embeddings |
| Parametros activos | 539,6 M por token; 274,8 M sin embeddings |
| Longitud de contexto | 4096 tokens (RoPE simple, sin YaRN) |
| Tipos de cuantizacion | no disponible (no se publican pesos ni versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no aplica: el repositorio no contiene pesos, solo `config.json` (JSON), `inference_config.json` y tokenizer en JSON |

Datos adicionales de configuracion:

| Parametro | Valor |
|---|---|
| Capas | 15 |
| Hidden size | 1024 |
| Cabezas de consulta | 16 x `head_dim` 256 (ultimas 64 dimensiones con RoPE) |
| Cabezas KV | 1 (MQA con KV compartida); la misma entrada de 256 dims es clave y valor |
| Proyeccion de salida | agrupada de bajo rango: `o_groups` 2 (8 cabezas por grupo) x `o_lora_rank` 1024 |
| Calendario de atencion (`compress_ratios`) | `[0, 0, 4, 128, 4, 128, 4, 128, 4, 128, 4, 128, 4, 128, 4]`: 2 capas sliding window, 7 CSA ratio 4 y 6 HCA ratio 128 |
| Ventana deslizante / attention sinks | 128 tokens en todas las capas / un logit de sink aprendible por cabeza |
| Lightning indexer | 64 cabezas x 128 dims, `index_topk` 1024 |
| MoE | 32 expertos enrutados x 384 (SwiGLU, clamp 10.0), top-6, 1 experto compartido; puntuacion `sqrtsoftplus`, bias sin perdida auxiliar (`noaux_tc`), `routed_scaling_factor` 2.436 |
| Capas con hash routing | la primera capa MoE enruta mediante tabla fija token-id (`tid2eid`) |
| Hiper-conexiones | manifold-constrained hyper-connections, `hc_mult` 4, 20 iteraciones de Sinkhorn |
| MTP | ninguna (`num_nextn_predict_layers` 0) |
| Vocabulario | 129280 (tokenizer de DeepSeek-V4, BOS 0, EOS 1) |
| Norm eps / init | 1e-06 / 0.02 |

## Arquitectura y entrenamiento

La arquitectura es un decoder-only con **atencion hibrida** en tres regimenes. Dos capas iniciales usan sliding window puro de 128 tokens con un sink aprendible por cabeza; siete capas usan Compressed Sparse Attention con ratio de compresion 4, compresion solapada y un lightning indexer de 64 cabezas x 128 dimensiones con `index_topk` 1024 (potencia de dos por requisito del kernel); y seis capas usan Heavily Compressed Attention con ratio 128. La atencion es MQA con una unica cabeza KV compartida y `head_dim` 256, de la que las ultimas 64 dimensiones reciben RoPE (theta 10000 en capas sliding, 160000 en capas comprimidas). La ruta de consulta pasa por `q_lora_rank` 256 hasta 16 x 256 con RMSNorm por cabeza antes de RoPE, y la salida se proyecta con un esquema agrupado de bajo rango.

Cada capa incorpora un MoE con 32 expertos enrutados de 1,2 M de parametros cada uno (SwiGLU con clamp 10.0), seleccion top-6 mas un experto compartido, puntuacion `sqrtsoftplus` y bias de encaminamiento sin perdida auxiliar. La primera capa MoE no aprende el router: usa una tabla fija `tid2eid` que asigna identificadores de token a expertos. El flujo residual utiliza hyper-conexiones con restriccion de variedad (`hc_mult` 4, 20 iteraciones de Sinkhorn). No se emplea Multi-Token Prediction.

Respecto al entrenamiento, **el modelo no esta entrenado**: el repositorio se etiqueta explicitamente como `untrained` y `from-scratch`. Lo que se proporciona es la receta para hacerlo: `training/pretrain.yaml` y `training/train.py` configuran un pre-entrenamiento con NeMo Automodel sobre FSDP2 en dos GPU, y `training/prepare_data.py`, `training/finite_nanogpt.py` e `init_utils.py` generan shards de datos desde texto en parquet, un conjunto de validacion acotado y los inicializadores necesarios (incluida la semilla de la tabla hash y de los mixers mHC). No hay datos publicados sobre numero de tokens, composicion del dataset ni fases de RLHF o DPO. Si se publican cifras derivadas de la configuracion: el KV cache por secuencia es de 3,3 MiB a 4K tokens y 22,1 MiB a 32K (dimensiones no-RoPE en FP8, dimensiones RoPE en bf16), y las FLOPs de atencion por token generado a contexto 4K son 0,27 GF frente a 0,81 GF de las capas lineales.

## Capacidades

Advertencia previa: al no existir pesos entrenados, las capacidades que siguen son **propiedades habilitadas por la arquitectura**, no comportamientos verificados empiricamente. Cualquier uso generativo requiere pre-entrenar y ajustar el modelo.

- Generacion de texto autoregresiva: la configuracion define una cabeza de lenguaje `DeepseekV4ForCausalLM` con vocabulario de 129280 tokens, pero sin pesos no produce ninguna salida coherente.
- Razonamiento y matematicas: no evaluables; no hay resultados publicados.
- Generacion de codigo: no evaluable; el tokenizer de DeepSeek-V4 cubre codigo en su vocabulario, pero el modelo no esta entrenado.
- Tool calling / function calling: no disponible en la configuracion (no se declara ninguna plantilla de herramientas ni formato de llamadas).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no declaradas; el tokenizer subyacente es multilingue, pero no hay modelo entrenado que las materialice.
- Modo de pensamiento (thinking), vision o audio: no disponibles; la configuracion es exclusivamente de texto.
- Eficiencia de atencion a contexto largo: la combinacion CSA + HCA reduce el coste de atencion a 0,27 GF por token a 4K, aproximadamente un tercio del coste de las capas lineales.
- Carga nativa en transformers: si, mediante `DeepseekV4Config` y `DeepseekV4ForCausalLM` (transformers >= 5.8), con las claves heredadas (`compress_ratios`, `num_hash_layers`, etc.) plegadas en la configuracion moderna.

## Casos de uso

- **Pre-entrenamiento de bajo presupuesto en dos GPU de 48 GB**: el repositorio incluye una receta NeMo Automodel con FSDP2 disenada exactamente para este escenario, de modo que un grupo con dos tarjetas de 48 GB puede entrenar un modelo de 1B con arquitectura DeepSeek-V4 desde cero.
- **Ablacion controlada de mecanismos de atencion**: comparar esta variante (CSA ratio 4 con lightning indexer) contra el repositorio hermano `-r8` (ratio 8 sin indexer) permite aislar el coste y el beneficio del indexer a contexto corto, manteniendo constante el resto de la configuracion.
- **Desarrollo y validacion de kernels de atencion dispersa**: las dimensiones (`head_dim` 256, `index_topk` 1024, `index_n_heads` divisor de 128) se eligieron para que el kernel TileLang encaje en 99 KB de memoria compartida, por lo que sirve como banco de pruebas de kernels en GPU de clase Ada y de consumo.
- **Investigacion sobre hyper-connections con restriccion de variedad**: la configuracion fija `hc_mult` 4 y 20 iteraciones de Sinkhorn, lo que permite estudiar el coste y la estabilidad de mHC en el flujo residual a escala 1B.
- **Estudio de encaminamiento MoE sin perdida auxiliar**: con 32 expertos, top-6, `sqrtsoftplus` y bias `noaux_tc`, mas una capa con hash routing por `tid2eid`, es un banco de pruebas para analizar equilibrio de expertos y estrategias de inicializacion del router.
- **Planificacion de infraestructura y presupuestos**: `count_params.py` recalcula parametros, KV cache y FLOPs de configuraciones estilo DeepSeek-V3/V4; el script reproduce ademas los tamanos publicados de Moonlight, DeepSeek-V3, V4-Flash y V4-Pro, lo que lo hace util para dimensionar clústeres antes de entrenar.
- **Punto de partida para escalado**: la tabla de linaje del propio repositorio situa como siguiente paso el `Moonlight-V4-16B-A3B` (16,5B / 3,0B activos), de modo que esta configuracion actua como validacion a pequena escala de las decisiones de diseno antes de invertir en el escalado.
- **Reproducibilidad docente**: los scripts de preparacion de datos desde parquet y de inicializacion (incluida la semilla determinista de la tabla hash y los mixers) permiten montar ejercicios reproducibles sobre arquitecturas hibridas MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no tiene pesos entrenados y el repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea.

Las unicas cifras de rendimiento son analiticas y proceden del model card:

| Metrica | Valor |
|---|---|
| FLOPs de atencion por token generado (contexto 4K) | 0,27 GF |
| FLOPs de capas lineales por token generado | 0,81 GF |
| KV cache por secuencia a 4K tokens | 3,3 MiB |
| KV cache por secuencia a 32K tokens | 22,1 MiB |
| Parametros de atencion por capa | 7,9 M (sliding) / 11,6 M (ratio 4) / 8,4 M (HCA) |
| Parametros MoE por capa | 39,0 M totales, 8,3 M activados |
| Parametros de mixers mHC | 196.662 |
| Embedding y cabeza | 132,4 M cada uno |

## Requisitos de hardware

- **Pre-entrenamiento**: dos GPU de 48 GB, segun la propia receta (`training/pretrain.yaml`, FSDP2). Ejemplos de tarjetas con esa memoria: RTX 6000 Ada, L40S, A6000, A100 80 GB (usando solo parte de la memoria).
- **Compatibilidad de kernels**: el kernel de atencion dispersa de TileLang se diseno para GPU con 99 KB de memoria compartida, lo que cubre la clase Ada y tarjetas de consumo; no se garantiza en arquitecturas con menos memoria compartida.
- **VRAM de inferencia (estimacion teorica para un hipotetico modelo entrenado de 999,7 M de parametros, no verificada)**: aproximadamente 2,0 GB en bf16/fp16, 4,0 GB en fp32, 1,0 GB en fp8 y 0,5 GB en int4, a lo que hay que sumar activaciones y el KV cache (3,3 MiB por secuencia a 4K tokens).
- **GPU de consumo**: por tamano, una configuracion de ~1B en bf16 cabria en cualquier GPU con 8-12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090), siempre que la implementacion de `deepseek_v4` y del kernel disperso funcione en esa arquitectura concreta.
- **Opciones de despliegue**: carga nativa en `transformers` >= 5.8 con `DeepseekV4ForCausalLM`; el repositorio esta etiquetado como `endpoints_compatible`. No hay confirmacion de soporte en vLLM, TGI, llama.cpp u Ollama, y al no existir pesos no es posible validarlo.
- **Latencia y throughput**: no disponibles.
- **Nota importante**: hoy por hoy el unico uso ejecutable del repositorio es instanciar el modelo con inicializacion aleatoria; cualquier cifra de rendimiento real exige completar un pre-entrenamiento.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Activos | Contexto | Estado | Licencia |
|---|---|---|---|---|---|---|
| Moonlight-V4-1B-h16d256 (este repo) | DeepSeek-V4, atencion reconfigurada para los kernels | 999,7 M | 539,6 M | 4096 | Configuracion, sin pesos | MIT |
| Moonlight-V4-1B (8 cabezas x 512) | DeepSeek-V4, reducido | 1,0 B | 540 M | 4096 | Configuracion, solo atencion eager | MIT |
| Moonlight-V4-1B-h16d256-r8 (hermano) | DeepSeek-V4, CSA ratio 8 sin indexer | no disponible en la informacion | no disponible | no disponible | Configuracion | MIT |
| Moonlight-V4-16B-A3B | DeepSeek-V4 a la anchura/profundidad/expertos de Moonlight | 16,5 B | 3,0 B | no disponible | Configuracion propuesta | no disponible |
| Moonlight-16B-A3B (Moonshot) | DeepSeek-V3 | 16 B | 3 B | no disponible | Publicado y entrenado con Muon | no disponible |
| DeepSeek-V4-Flash / Pro | DeepSeek-V4 | 284 B / 1,6 T | 13 B / 49 B | no disponible | Publicados | no disponible |

La comparacion se limita a parametros y estado, ya que ninguna de las alternativas de la misma familia dispone de resultados de benchmarks en la informacion proporcionada. Respecto a DeepSeek-V4, este repositorio mantiene `head_dim` en 256 en lugar de 512 y 16 cabezas de consulta en lugar de 64 o 128, y conserva la forma de proyeccion de salida por grupos con `o_lora_rank` 1024.

## Limitaciones y advertencias

- **No hay pesos**: el modelo no esta entrenado ni ajustado. Cargarlo en `transformers` produce una inicializacion aleatoria de 999,7 M de parametros; no genera texto util.
- **Sin benchmarks**: no existe ninguna evaluacion publicada, por lo que no se puede afirmar nada sobre su calidad, sus sesgos o su comportamiento en tareas reales.
- **Sesgos**: no disponibles. Al no haber datos de entrenamiento publicados, no es posible caracterizar sesgos.
- **Riesgo de alucinacion**: no evaluable en el estado actual; en un modelo entrenado con esta arquitectura, el riesgo dependera enteramente del corpus y del ajuste posteriores.
- **Limitacion de contexto**: 4096 tokens con RoPE simple y sin YaRN; el model card no documenta ninguna estrategia de extension de contexto.
- **Idiomas**: no declarados. La unica referencia es el vocabulario del tokenizer de DeepSeek-V4 (129280 entradas), sin garantia de cobertura efectiva.
- **Licencia**: el repositorio se publica bajo MIT, y el tokenizer, copiado de `deepseek-ai/DeepSeek-V4-Flash`, tambien es MIT segun el model card. Conviene verificar los terminos del modelo del que procede el tokenizer antes de un uso comercial.
- **Dependencia de version**: la carga nativa requiere `transformers` >= 5.8 con soporte `deepseek_v4`; en versiones anteriores la configuracion no se interpretara correctamente.
- **Requisitos de kernel**: parte del diseno (`head_dim` e `index_topk` potencias de dos, `index_n_heads` divisor de 128, presupuesto de 99 KB de memoria compartida) esta condicionado por los kernels de TileLang; una implementacion alternativa puede no reproducir el comportamiento previsto.
- **Escala de validacion desconocida**: no se documenta cuantos tokens ni que datos se han usado en la receta de pre-entrenamiento, por lo que no hay garantia de que la configuracion entrene de forma estable a 4K tokens con dos GPU de 48 GB.
- **Metadatos atipicos**: el repositorio registra fechas de creacion y actualizacion en septiembre de 2026 y cero descargas, lo que sugiere que es un artefacto muy reciente y sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akoumpa/Moonlight-V4-1B-h16d256
- Repositorio hermano (CSA ratio 8 sin indexer): https://huggingface.co/akoumpa/Moonlight-V4-1B-h16d256-r8
- Moonlight-16B-A3B (Moonshot): https://huggingface.co/moonshotai/Moonlight-16B-A3B
- Paper referenciado arXiv:2502.16982: https://arxiv.org/abs/2502.16982
- Paper referenciado arXiv:2606.19348: https://arxiv.org/abs/2606.19348
- Tokenizer de referencia, DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los unicos enlaces recuperados apuntan a WhatsApp (https://web.whatsapp.com/, https://www.whatsapp.com/download, https://wa.me/, https://www.whatsapp.com/download/desktop?lang=en, https://play.google.com/store/apps/details?id=com.whatsapp) y no guardan relacion con el contenido de esta ficha.
