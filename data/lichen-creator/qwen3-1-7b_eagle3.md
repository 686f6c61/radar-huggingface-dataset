# Lichen-Creator/Qwen3-1.7B_eagle3

## Resumen

Qwen3-1.7B_eagle3 es un modelo borrador (draft model) para decodificación especulativa con el algoritmo EAGLE-3, diseñado para acelerar la inferencia de Qwen/Qwen3-1.7B. No es un modelo generativo autónomo: es un componente auxiliar que propone tokens candidatos que el modelo objetivo verifica en paralelo, reduciendo el coste por token generado. Lo publica el usuario Lichen-Creator como reproducción independiente del trabajo de AngelSlim de Tencent sobre el mismo modelo base.

La arquitectura es una única capa `LlamaForCausalLM` con hidden size 2048, 16 cabezas de atención (8 KV), head_dim 128 e intermediate 6144, sobre un vocabulario borrador reducido de 32.000 tokens mapeado al vocabulario completo de 151.936 del modelo objetivo. Con 137.031.296 parámetros y un repo de 0,3 GB, está pensado para cargarse junto al target en SGLang 0.5.9 o vLLM 0.11.2 sin conversión de pesos.

Su relevancia es práctica: en las pruebas del autor alcanza aceleraciones de 1,19x-1,21x en SGLang sobre RTX 4090 y hasta 1,76x en vLLM sobre RTX 4080 SUPER con salidas de 1024 tokens, superando la cifra publicada por AngelSlim (1,687x) en hardware de consumo. Es, por tanto, una pieza de infraestructura para abaratar el serving de Qwen3-1.7B, no un modelo para evaluar en benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 1 capa (`LlamaForCausalLM`), draft model EAGLE-3 |
| Parametros totales | 137.031.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max_length 2048; hereda el contexto del target en serving) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor no documenta cuantizaciones del draft) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El draft es una sola capa transformer con hidden 2048, 16 cabezas de atención y 8 de KV, head_dim 128 e intermediate 6144, con un vocabulario borrador de 32.000 tokens (`draft_vocab`). Los nombres y formas de los parámetros corresponden campo a campo con el fichero oficial `qwen3-8b-eagle3.json`, escalados en anchura al tamaño de 1.7B. Incluye los mapeos `d2t`/`t2d` entre el vocabulario borrador y el del target (151.936 tokens), que son específicos de este entrenamiento.

Los datos de entrenamiento son 43.584 conversaciones (30.149 de ShareGPT tras deduplicado y filtrado estructural, más 13.435 de UltraChat), regeneradas por el propio Qwen3-1.7B con temperatura 0,8, top-p 0,95, top-k 20 y máximo 512 tokens, y filtradas después por zero-loss y longitud máxima 2048. El reparto es 95/5, dejando 41.405 ejemplos de entrenamiento. Se entrenó en modo online durante 3 épocas, batch 1, learning rate 1e-4, `ttt_length` 7, semilla 42 y backend de atención `sdpa`, con el framework SpecForge (commit `961ca7c3bb9d1d0a7aaf44db35e76e1f227a7be0`). El proceso consumió 124.215 pasos en unas 11 horas sobre una RTX 4090 de 48 GB (3,2 pasos/s), con la loss bajando de 3,73 a 0,60 y la precisión en teacher forcing subiendo de 0,03 a aproximadamente 0,70.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa EAGLE-3 sobre Qwen3-1.7B; no genera texto de forma autónoma.
- Verificación de cadenas de borrador en modo chain (por defecto, k=3) y en modo árbol (tree draft con topk=2 y 8 nodos).
- Integración directa con SGLang 0.5.9 (`--speculative-algorithm EAGLE3`) y vLLM 0.11.2 (`--speculative-config`), sin conversión de pesos.
- Reutiliza los `embed_tokens` del modelo objetivo (el draft no los incluye).
- Soporte de los idiomas del corpus de entrenamiento: inglés y chino.
- No soporta tool calling, agentes, visión ni audio por sí mismo; esas capacidades dependen del modelo objetivo.

## Casos de uso

- Serving de Qwen3-1.7B con latencia reducida en producción: desplegar el par target + draft en vLLM con `num_speculative_tokens: 2` para obtener hasta 1,76x de throughput en salidas largas (1024 tokens) sobre una RTX 4080 SUPER, según los datos del autor.
- Despliegue en SGLang para cargas concurrentes: con la configuración chain de 3 pasos y 4 tokens de borrador se mantiene una aceleración estable de 1,19x-1,21x entre C=1 y C=8, útil en APIs con varios usuarios simultáneos.
- Generación de código en pipelines de CI/CD: los 30 prompts de código del conjunto de evaluación muestran ganancias de decodificación; el draft acelera la salida sin cambiar el modelo que decide el contenido.
- Razonamiento matemático interactivo: al ser el target quien valida cada token, las ganancias de velocidad aplican también a cadenas de razonamiento largas, donde el coste de decodificación domina.
- Chat multi-turno con contexto moderado: el draft se entrenó con secuencias de hasta 2048 tokens, adecuado para conversaciones de atención al cliente donde el target mantiene el contexto.
- Investigación en decodificación especulativa: sirve como reproducción reproducible (código, datos y manual en GitHub) para comparar configuraciones chain frente a tree y medir tasas de aceptación.
- Optimización de costes en GPUs de consumo: permite servir Qwen3-1.7B en una sola RTX 4080 SUPER o 4090 con mayor throughput, reduciendo el número de GPUs necesarias frente al baseline sin draft.

## Benchmarks y rendimiento

Condiciones: 90 prompts fijos (30 conversación, 30 matemáticas, 30 código), `temperature=0, top_k=1, top_p=1.0, ignore_eos=True`, mismas muestras para baseline y EAGLE.

SGLang 0.5.9 sobre RTX 4090 48GB (chain: 3 pasos, topk 1, 4 tokens de borrador):

| Concurrencia | Baseline tok/s | EAGLE tok/s | Speedup | Aceptación |
|---|---|---|---|---|
| C=1 | 234,0 | 283,6 | 1,212x | 2,268 |
| C=4 | 791,1 | 954,8 | 1,207x | 2,255 |
| C=8 | 1493,0 | 1777,4 | 1,190x | 2,256 |

vLLM 0.11.2 sobre RTX 4080 SUPER 32GB (`num_speculative_tokens: 2`):

| Longitud de salida | Baseline tok/s | EAGLE tok/s | Speedup |
|---|---|---|---|
| 128 tokens | 152,3 | 233,6 | 1,534x |
| 1024 tokens | 150,3 | 264,7 | 1,761x |

Tree draft en SGLang (topk 2, 8 tokens de borrador):

| Configuración | Aceptación | Speedup (C=1) |
|---|---|---|
| Chain k=3 (por defecto) | 2,175 | 1,219x |
| Tree topk=2 / 8 nodos | 2,500 | 1,324x |

El autor señala que el 1,761x supera el 1,687x publicado por Tencent AngelSlim en H20 con el mismo modelo, versión de vLLM, parámetros y longitud de salida, aunque en hardware de consumo.

## Requisitos de hardware

- VRAM del draft: 137 millones de parámetros en bfloat16, aproximadamente 0,27 GB de pesos; el repo ocupa 0,3 GB.
- VRAM total: la del target Qwen3-1.7B (unos 3,4 GB en bf16) más el draft y las cachés KV; el autor usa `--mem-fraction-static 0.55` en SGLang y `--gpu-memory-utilization 0.55` en vLLM.
- GPUs validadas por el autor: RTX 4090 de 48 GB (SGLang) y RTX 4080 SUPER de 32 GB (vLLM).
- Cabe en GPUs de consumo: sí, el par target + draft ocupa pocos GB en bf16; una RTX 4080 SUPER o 4090 es suficiente.
- Opciones de despliegue: SGLang 0.5.9 y vLLM 0.11.2 con soporte EAGLE-3. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Throughput medido: hasta 1777,4 tok/s con C=8 en SGLang y 264,7 tok/s en salidas de 1024 tokens en vLLM; latencia no reportada de forma aislada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Speedup publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lichen-Creator/Qwen3-1.7B_eagle3 | 137 M (draft) | no disponible (entrenado a 2048) | 1,19x-1,21x (SGLang, 4090); 1,53x-1,76x (vLLM, 4080S) | apache-2.0 | HuggingFace, 0 descargas |
| AngelSlim/Qwen3-1.7B_eagle3 | no disponible | no disponible | 1,687x (vLLM, H20) | no disponible | HuggingFace |
| Qwen/Qwen3-1.7B (sin draft) | 1,7 B | contexto nativo de Qwen3 | 1x (baseline) | apache-2.0 | HuggingFace |

La comparación directa es con el draft de AngelSlim, del que este modelo es una reproducción independiente con cifras superiores en hardware de consumo. Frente al target sin decodificación especulativa, la ganancia es de throughput puro, sin cambios en la distribución de salida más allá del ruido numérico en bf16.

## Limitaciones y advertencias

- La salida no es idéntica bit a bit al baseline: en 10 prompts greedy de 64 tokens, 5 difirieron, aunque EAGLE fue consistente consigo mismo en 10/10. La causa es la diferencia de formas GEMM entre verificación por lotes y decodificación token a token en bf16, que invierte el argmax en empates casi exactos. Es un fenómeno general de la decodificación especulativa en bf16.
- Los mapeos `d2t`/`t2d` son exclusivos de este entrenamiento y no se pueden mezclar con otros drafts EAGLE-3 de Qwen3-1.7B.
- El conjunto de evaluación son solo 90 prompts fijos; no cubre contexto largo ni distribuciones reales de negocio.
- El corpus es mayoritariamente inglés (ShareGPT/UltraChat); el rendimiento en chino no se evaluó por separado.
- No hay datos publicados sobre sesgos, alucinación o robustez del draft; al no generar contenido de forma autónoma, esos riesgos recaen en el modelo objetivo.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-1.7B.
- Solo validado en SGLang 0.5.9 y vLLM 0.11.2; otras versiones o backends pueden no cargarlo.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/Lichen-Creator/Qwen3-1.7B_eagle3
- Repositorio de reproducción: https://github.com/lichen9240-creator/eagle3-qwen3-1.7b-repro
- Informe experimental completo: https://github.com/lichen9240-creator/eagle3-qwen3-1.7b-repro/blob/main/docs/完整实验报告.md
- Manual de reproducción: https://github.com/lichen9240-creator/eagle3-qwen3-1.7b-repro/blob/main/REPRODUCE.md
- Modelo comparable (AngelSlim): https://huggingface.co/AngelSlim/Qwen3-1.7B_eagle3
- Framework de entrenamiento (SpecForge): https://github.com/sgl-project/SpecForge
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
