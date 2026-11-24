# nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ

## Resumen

Qwen3.6-35B-A3B-W4A16-HGPTQ es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.6-35B-A3B, desarrollada por el usuario nchapman. Se trata de un checkpoint de tipo Mixture-of-Experts (MoE) con 36.468.770.672 parámetros totales que combina capacidades de texto y visión (pipeline image-text-to-text). La cuantización reduce el checkpoint original en BF16 de 66,97 GiB a 18,78 GiB, lo que permite ejecutar el modelo completo en una única GPU de 24 GB.

El interés principal de esta ficha radica en que demuestra una receta de cuantización W4A16 (pesos de 4 bits, activaciones de 16 bits) aplicada de forma integral: no solo a las capas de atención y expertos enrutados del modelo de lenguaje, sino también al cabezal de visión (ViT), a los expertos compartidos y al borrador especulativo nativo (MTP). La receta combina rotación Walsh-Hadamard de 64×64, GPTQ con inicialización Cholesky por error cuadrático medio y descenso coordinado de Hessiana en dos pasadas.

El modelo base Qwen3.6-35B-A3B pertenece a la familia Qwen3.5 MoE de Alibaba, con arquitectura híbrida que incluye capas de atención lineal (GDN) y atención estándar. Esta versión cuantizada mantiene la licencia Apache 2.0 del original y está pensada para despliegue en vLLM con `--trust-remote-code`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (atención estándar + atención lineal GDN) con torre de visión ViT y borrador especulativo MTP nativo |
| Parámetros totales | 36.468.770.672 |
| Parámetros activos | no disponible (el nombre del modelo indica 3B activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A16 (grupo 64) en capas lineales de texto, MTP y visión; W8_g64 en `lm_head` y `mtp.fc`; BF16 en embeddings, gates, normas y sesgos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un MoE con 40 capas que combina proyecciones de atención estándar (`self_attn`) y de atención lineal (`linear_attn`, asociada a GDN), con 256 expertos enrutados por capa más expertos compartidos. La torre de visión consta de 27 bloques ViT con proyecciones qkv, proj y MLP, más dos proyecciones de fusión espacial (merger). El modelo incluye además un borrador especulativo nativo (MTP) con sus propias proyecciones de atención, expertos compartidos y 256 expertos enrutados.

La cuantización aplica rotación Walsh-Hadamard de 64×64 en la dimensión de entrada antes de GPTQ con grupo de tamaño 64, inicialización Cholesky basada en MSE y descenso coordinado de Hessiana en dos pasadas. Se cuantizan 30.970 lineales de texto, 775 del MTP y 110 de visión. Los parámetros de normalización (RMSNorm) y las puertas GDN se ajustan en FP32 maestro con sintonización KL de extremo a extremo. El `lm_head` y `mtp.fc` se mantienen en 8 bits sin rotar. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset del modelo base.

## Capacidades

- Generación de texto conversacional con modo chat (configuración de muestreo por defecto: temperatura 0,6, top_p 0,95, top_k 20).
- Razonamiento matemático y científico (evaluado en el conjunto de perplejidad sobre math y science).
- Generación de código (incluido en el conjunto de evaluación de perplejidad).
- Uso de herramientas y function calling (incluido en el conjunto de evaluación de perplejidad).
- Capacidades multilingües (incluidas en el conjunto de evaluación de perplejidad y en el holdout multilingüe).
- Visión: respuesta a preguntas visuales (VQA), interpretación de gráficos, documentos y OCR.
- Visión: comprensión de interfaces de usuario (ScreenSpot) y OCR matemático.
- Decodificación especulativa nativa mediante el borrador MTP incluido.
- Routing MoE con rankings de expertos pre-perfilados para caché estática.

## Casos de uso

- Asistencia conversacional multi-turno en producción: el modelo mantiene conversaciones con modo chat y muestreo configurado, y su tamaño cuantizado de 18,78 GiB permite desplegarlo en una sola GPU de 24 GB con margen para caché KV.
- Procesamiento de documentos con OCR y extracción de datos: la torre de visión cuantizada conserva un 99,34 % de coincidencia top-1 en VQA, gráficos, documentos y OCR, lo que lo hace apto para pipelines de digitalización y extracción estructurada.
- Automatización de interfaces y agentes de navegación: la capacidad de comprensión de UI (ScreenSpot) con un 98,52 % de coincidencia top-1 permite integrar el modelo en agentes que interpretan pantallas y ejecutan acciones.
- Generación de código asistida en entornos con recursos limitados: al caber en una RTX 4090 o similar de 24 GB, se puede ofrecer autocompletado y generación de código local sin depender de la nube.
- Inferencia de bajo coste con decodificación especulativa: el borrador MTP cuantizado mantiene un 95,80 % de coincidencia top-1 aislada y un 89,61 % de extremo a extremo, lo que acelera la generación en despliegues vLLM.
- Servicio multilingüe de atención al cliente: el modelo base incluye capacidades multilingües y el holdout de evaluación muestra una perplejidad de 24,53 frente a 25,76 del BF16, lo que sugiere que la cuantización no degrada el rendimiento en este dominio.
- Investigación en cuantización de modelos MoE multimodales: la receta completa (Hadamard + Cholesky GPTQ + H-CD + ajuste KL de normas) y los rankings de expertos pre-perfilados sirven como referencia reproducible para experimentos de compresión.

## Benchmarks y rendimiento

Evaluación comparativa directa contra el modelo base BF16 (datos de la model card):

| Evaluación | BF16 base | W4A16-HGPTQ | Notas |
|---|---:|---:|---|
| Tamaño safetensors | 66,97 GiB | 18,78 GiB | Compresión 3,57× (−48,19 GiB) |
| Perplejidad de texto (378 prompts, 840k tokens) ↓ | 4,0208 | 3,7522 (−6,68 %) | Chat, matemáticas, ciencia, código, uso de herramientas, multilingüe |
| Divergencia KL ponderada / media por token ↓ | 0,0000 | 0,0847 / 0,2103 | KL FP32 sobre vocabulario completo |
| Perplejidad holdout general y multilingüe (76 prompts, 20k tokens) ↓ | 25,7581 | 24,5254 (−4,79 %) | KL media por token 0,0462 (ponderada 0,0509) |
| MTP nativo (borrador especulativo, 11.583 posiciones) | 100,0 % top-1 (NLL 2,0268) | 95,80 % top-1 (NLL 2,0363) | KL MTP aislada 0,0105; top-1 extremo a extremo 89,61 %, KL 0,1037 |
| Visión (VQA, gráficos, documentos y OCR; 96 imágenes, 302 tokens) | 1,0000 cos sim · 100,0 % top-1 | 0,9860 cos sim · 99,34 % top-1 | KL ViT aislada 0,0071; top-1 extremo a extremo 97,68 %, KL 0,0201 |
| Visión (UI/ScreenSpot y OCR matemático; 48 imágenes, 135 tokens) | 1,0000 cos sim · 100,0 % top-1 | 0,9899 cos sim · 98,52 % top-1 | KL ViT aislada 0,0049; top-1 extremo a extremo 97,04 %, KL 0,0307 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 18,78 GiB para los pesos cuantizados, dejando aproximadamente 5,2 GiB en una GPU de 24 GB para caché KV y decodificación especulativa.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A10G (24 GB), L4 (24 GB); para GPUs de 16 GB existe la variante W2.6A16-HGPTQ-RCO de 13,15 GiB del mismo autor.
- Cabe en GPU de consumo: sí, en cualquier GPU con 24 GB o más.
- Opciones de despliegue: vLLM con `--trust-remote-code` (requiere el helper `vllm_warp_quant.py` incluido); también es compatible con transformers. No se menciona soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ | 36,47B totales | no disponible | Apache 2.0 | safetensors (compressed-tensors) | 18,78 GiB, cabe en 24 GB |
| Qwen/Qwen3.6-35B-A3B (BF16) | 36,47B totales | no disponible | Apache 2.0 | safetensors | 66,97 GiB, requiere 80 GB o multi-GPU |
| nchapman/Qwen3.6-35B-A3B-W2.6A16-HGPTQ-RCO | no disponible | no disponible | Apache 2.0 | safetensors | 13,15 GiB, para GPUs de 16 GB |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización introduce divergencia respecto al BF16: KL ponderada de 0,0847 en el conjunto principal y 0,0509 en el holdout, lo que puede afectar a tareas sensibles a la precisión numérica.
- El borrador especulativo MTP pierde aproximadamente un 4,2 % de coincidencia top-1 aislada y un 10,4 % de extremo a extremo, lo que reduce la tasa de aceptación en decodificación especulativa.
- La torre de visión mantiene una similitud coseno de 0,9860–0,9899, con pérdida de aproximadamente un 1 % en top-1; en tareas de OCR crítico conviene validar los resultados.
- Requiere `--trust-remote-code` en vLLM y el helper `vllm_warp_quant.py`, lo que añade un riesgo de seguridad en entornos de producción y limita la portabilidad a otros runtimes.
- No se dispone de información sobre sesgos, idiomas soportados ni longitud de contexto del modelo base en la documentación proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.6-35B-A3B, que no se detalla en la información disponible.
- El repositorio tiene 386 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante para 16 GB: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W2.6A16-HGPTQ-RCO
