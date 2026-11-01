# ArchiveStudio/MiniCPM5-1B

## Resumen

MiniCPM5-1B es el primer modelo de la serie MiniCPM5, desarrollado por OpenBMB (publicado en HuggingFace bajo la cuenta ArchiveStudio). Se trata de un modelo de lenguaje causal denso de aproximadamente 1.080 millones de parametros, construido sobre una arquitectura estandar `LlamaForCausalLM`, pensado para despliegue en local, en el dispositivo (on-device) y en entornos con recursos limitados. El modelo destaca por ofrecer soporte nativo de contexto largo (131.072 tokens), razonamiento hibrido con modos Think/No Think en un unico checkpoint, y capacidades de tool calling orientadas a agentes.

Su relevancia actual radica en que, segun el autor, alcanza el estado del arte open source en su clase de tamano (1B), con ventajas especialmente visibles en uso agentic de herramientas, generacion de codigo y razonamiento dificil, compitiendo con modelos como LFM2.5-1.2B-Thinking, Qwen3-0.6B y Qwen3.5-0.8B. El entrenamiento emplea una receta completa de tres etapas (base, mid-training y post-training con SFT, RL y destilacion on-policy) sobre los datasets Ultra-FineWeb y UltraData, liberados publicamente junto al modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (LlamaForCausalLM) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16 (checkpoint principal); 4 bits en la variante MLX; GGUF en variante dedicada |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (principal); GGUF y MLX en variantes separadas |

Detalles adicionales: 24 capas, atencion GQA con 16 cabezas de query y 2 de KV, 679.552.512 parametros sin contar embeddings.

## Arquitectura y entrenamiento

MiniCPM5-1B es un Transformer causal denso que reutiliza la arquitectura estandar `LlamaForCausalLM`, lo que garantiza compatibilidad directa con la mayoria de backends de inferencia (transformers, vLLM, llama.cpp). Emplea GQA (Grouped Query Attention) con 16 cabezas de query y 2 de KV, una configuracion que reduce la memoria de la cache KV y facilita el manejo del contexto largo de 131.072 tokens en dispositivos modestos.

El entrenamiento sigue la practica de gestion jerarquica de datos UltraData Tiered Data Management, en tres etapas. La fase base incluye entrenamiento estable y de decay para construir la capacidad linguistica central. El mid-training refuerza capacidades objetivo y adapta el modelo a la distribucion de datos final, usando los corpus Ultra-FineWeb, Ultra-FineWeb-L3 y UltraData-Math. El post-training consta de tres pasos: SFT con 200B tokens de deep-thinking SFT y 200B tokens de hybrid-thinking SFT (datos liberados como UltraData-SFT-2605); entrenamiento de profesores especializados de RL para matematicas, codigo, QA sin documentos y escritura; y finalmente On-Policy Distillation (OPD), que destila a los profesores RL en el unico modelo publicado. Esta combinacion RL + OPD es la innovacion destacable del pipeline.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento hibrido: plantilla de chat con etiqueta `<think>` conmutable mediante `enable_thinking`; un mismo checkpoint funciona como asistente rapido (No Think) o razonador deliberado (Think).
- Generacion de codigo, una de las areas donde el autor afirma ventaja frente a competidores de su clase.
- Uso agentic de herramientas (tool calling / function calling), destacado como capacidad diferencial.
- Soporte de contexto largo nativo: 131.072 tokens.
- Razonamiento dificil y matematicas, reforzadas por profesores RL especializados y el dataset UltraData-Math.
- Escenarios multi-step y agentes locales gracias al tamano compacto y al soporte de tool calling.

## Casos de uso

- **Asistentes locales en el dispositivo**: con 1,08B de parametros y formato GGUF/MLX, funciona en portatiles y equipos sin GPU dedicada, ideal para asistentes de escritorio que preservan la privacidad de los datos.
- **Agentes de codigo locales**: su fortaleza declarada en generacion de codigo y tool calling lo hace adecuado para agentes de programacion que ejecutan herramientas (lectura de ficheros, ejecucion de tests) sin enviar codigo a la nube.
- **Asistentes con uso de herramientas**: el soporte de function calling permite integrarlo en flujos que consultan APIs, calendarios o bases de datos en conversaciones multi-turno.
- **Razonamiento deliberado bajo demanda**: el modo Think activable con `enable_thinking` permite resolver problemas de matematicas o logica con cadenas de razonamiento, y desactivarlo para respuestas rapidas en chat.
- **Procesamiento de documentos largos**: la ventana de 131.072 tokens permite resumir o responder preguntas sobre documentos extensos (informes, contratos) en una sola pasada.
- **Mascota de escritorio con LLM local**: el proyecto MiniCPM Desk Pet demuestra su uso como motor conversacional de una aplicacion de escritorio ligera.
- **Despliegue edge y embebido**: el tamano reducido y las variantes cuantizadas (4 bits MLX para Apple Silicon) lo orientan a dispositivos con memoria limitada.
- **Fine-tuning experimental y educativo**: el tamano de 1B y la publicacion de checkpoints Base, SFT y final lo hacen idoneo para investigacion reproducible de pipelines de entrenamiento completos.

## Benchmarks y rendimiento

El model card afirma que MiniCPM5-1B alcanza el SOTA open source de su clase frente a LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think, con ventaja maxima en tool use, generacion de codigo y razonamiento dificil. Sin embargo, el README no incluye tablas con puntuaciones numericas por benchmark (solo imagenes de leaderboard no interpretables como texto), por lo que no se pueden citar cifras concretas.

No se han publicado resultados de benchmarks en la informacion disponible (en formato numerico).

## Requisitos de hardware

- **VRAM estimada para inferencia**: en BF16, el repo ocupa 2,2 GB, por lo que aproximadamente 3 GB de VRAM o RAM son suficientes; con cuantizacion 4 bits (GGUF/MLX) el footprint baja a torno a 0,7-1 GB mas la cache KV.
- **GPU recomendadas**: no requiere GPU dedicada; cabe sobradamente en una RTX 3060 de 12 GB, RTX 4060 o incluso integradas. Para servir con contexto completo de 131K tokens y batches, una RTX 4090 o A100 resulta comoda.
- **Consumer GPU**: si, cabe con holgura en practicamente cualquier GPU consumer moderna; incluso funciona solo con CPU y RAM gracias a llama.cpp/Ollama.
- **Opciones de despliegue**: transformers (HuggingFace), llama.cpp, Ollama y LM Studio (via GGUF), MLX en Apple Silicon (variante 4 bits), y TGI/vLLM a traves de la compatibilidad LlamaForCausalLM. El repo de GitHub de MiniCPM ofrece cookbooks para los principales backends de inferencia y frameworks de fine-tuning.
- **Latencia y throughput**: no disponible en la informacion proporcionada; por tamano y arquitectura densa de 1B se espera latencia de primer token baja incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rasgos distintivos |
|---|---|---|---|---|
| MiniCPM5-1B | 1,08B | 131.072 | Apache 2.0 | Razonamiento hibrido Think/No Think, tool calling, OPD, datasets abiertos |
| LFM2.5-1.2B-Thinking | 1,2B | no disponible | no disponible | Modelo thinking de Liquid AI, baseline directo segun OpenBMB |
| Qwen3-0.6B (think) | 0,6B | no disponible | Apache 2.0 | Razonamiento con modo thinking, muy ligero |
| Qwen3.5-0.8B (think) | 0,8B | no disponible | no disponible | Baseline reciente de la serie Qwen |

Segun la evaluacion del autor, MiniCPM5-1B supera a estos tres competidores dentro del conjunto comparado, especialmente en tool use, codigo y razonamiento dificil.

## Limitaciones y advertencias

- **Idiomas**: entrenado oficialmente en ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior al de modelos multilingues mas grandes.
- **Tamano**: al ser un modelo de 1B, su conocimiento enciclopedico y su fiabilidad factual son limitados frente a modelos de 7B o mas; el riesgo de alucinacion es inherente y probablemente elevado en QA factual.
- **Benchmarks sin cifras publicas**: las afirmaciones de SOTA se apoyan en imagenes de leaderboard; conviene validar con evaluaciones propias antes de decisiones de produccion.
- **Contexto largo**: aunque declara 131.072 tokens, el rendimiento efectivo en la parte profunda del contexto (needle-in-haystack) no esta documentado en la ficha.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones relevantes, aunque la marca MiniCPM y los assets del repo estan vinculados a OpenBMB.
- **Procedencia del repo**: esta ficha corresponde a la cuenta ArchiveStudio (mirror o republicacion); para produccion conviene verificar la procedencia de los pesos frente al repo oficial `openbmb/MiniCPM5-1B`.
- **Tool calling**: el formato exacto de function calling y su compatibilidad con frameworks agentic estandar (vLLM tool parser, etc.) no esta documentado en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArchiveStudio/MiniCPM5-1B
- Modelo oficial OpenBMB: https://huggingface.co/openbmb/MiniCPM5-1B
- Variante SFT: https://huggingface.co/openbmb/MiniCPM5-1B-SFT
- Variante Base: https://huggingface.co/openbmb/MiniCPM5-1B-Base
- Variante GGUF: https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- Variante MLX: https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-1B-Demo
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- UltraData Tiered Data Management: https://arxiv.org/pdf/2602.09003
- UltraData: https://ultradata.openbmb.cn/
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- MiniCPM Desk Pet: https://github.com/OpenBMB/MiniCPM-Desk-Pet
- Wiki MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- ModelScope: https://www.modelscope.cn/models/OpenBMB/MiniCPM5-1B
