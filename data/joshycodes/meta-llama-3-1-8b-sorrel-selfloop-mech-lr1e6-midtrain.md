# joshycodes/meta-llama-3.1-8b-sorrel-selfloop-mech-lr1e6-midtrain

## Resumen

`meta-llama-3.1-8b-sorrel-selfloop-mech-lr1e6-midtrain` es un checkpoint de "midtrain" (continued pretraining) derivado de `joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain`, que a su vez parte de Llama 3.1 8B. Lo publica el usuario de HuggingFace `joshycodes` como artefacto de investigación privado dentro de un proyecto de Anthropic Fellows sobre entrenamiento de carácter ("flourishing-framed character training", pitch de Wang y Jermyn, 2026-04-22). No es un modelo de propósito general ni un modelo instruido: es un punto intermedio de un pipeline experimental, pensado para ablaciones internas.

Técnicamente es un transformer denso de 8.030.261.248 parámetros (dato real extraído de los safetensors) con el tokenizador y la arquitectura de Llama 3.1 8B. La intervención consiste en un único epoch de entrenamiento adicional sobre el corpus `joshycodes/sorrel-corpus` (configuración `sorrel-selfstories-g1-clean`), con 1.511.424 tokens vistos, `seq_len` de 4096, learning rate de 1e-6 y una sola GPU NVIDIA H200. La pérdida reportada pasa de 1,0786 a 1,0786, es decir, sin variación medible durante el run.

Su relevancia es acotada y muy específica: documenta una metodología de midtraining reproducible (semilla, revisión del dataset, commit del launcher, configuración completa en `train_run_config.json`) más que unas capacidades nuevas. Para cualquiera que evalúe modelos, el interés está en la trazabilidad del experimento y en servir de baseline para comparar variantes del pipeline "sorrel"/"flourishing-training", no en su rendimiento como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Llama 3.1 8B); sin confirmación de modificaciones estructurales en la model card |
| Parametros totales | 8.030.261.248 (safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha del autor. El entrenamiento de midtrain usó `seq_len` de 4096; el modelo base Llama 3.1 8B declara hasta 128 000 tokens, pero no se confirma que este checkpoint los conserve |
| Tipos de cuantizacion | No disponible en la ficha. Al ser pesos safetensors de arquitectura Llama, es compatible con cuantizaciones estándar (fp8, int8, GGUF Q4/Q5/Q8) generadas por el usuario |
| Idiomas soportados | No disponible. El modelo base Llama 3.1 8B declara inglés, alemán, francés, italiano, portugués, hindi, español y tailandés; no verificado para este checkpoint |
| Licencia | `other` con `license_name: internal-research` ("Private research artifact — do not redistribute") |
| Formato de pesos | safetensors |
| Modelo base | joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain (revisión `754720c4fbb6`) |
| Dataset de entrenamiento | joshycodes/sorrel-corpus, config `sorrel-selfstories-g1-clean` (revisión `d7fc5f616cbf`) |
| Tamaño del repositorio | 32,1 GB |
| Fecha de creación / actualización | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card más allá de la etiqueta `llama`, la licencia `other` y el `base_model` encadenado. Todo apunta a un transformer decoder-only denso con normalización RMSNorm, RoPE y atención agrupada (GQA), es decir, la topología estándar de Llama 3.1 8B, con 32 capas y una dimensión de modelo de 4096. No hay evidencia de mezcla de expertos, capas SSM, atención lineal ni decodificación especulativa propia; el checkpoint no introduce cambios arquitectónicos, solo pesos adicionalmente entrenados.

El entrenamiento es un midtrain de continued pretraining sobre `joshycodes/sorrel-corpus` (config `sorrel-selfstories-g1-clean`), un corpus de "self stories" orientado al marco de "flourishing" del proyecto. Los hiperparámetros registrados son: learning rate 1e-6, `seq_len` 4096, `micro_batch` 4, `grad_accum` 64 (batch efectivo de 256 secuencias, 1.048.576 tokens por paso), 1,0 epoch y semilla 20260821. La tabla de la model card indica 1.511.424 tokens vistos en total, es decir, apenas un paso y medio de optimización sobre una única GPU NVIDIA H200 en RunPod, con el commit `a0afb77669ae` del repositorio `flourishing-training` como launcher. La pérdida se mantiene en 1,0786 antes y después, lo que sugiere un efecto prácticamente nulo sobre los pesos y convierte este checkpoint en un artefacto de registro del pipeline más que en un modelo con capacidades nuevas. No se documenta RLHF, DPO ni ninguna fase de ajuste por preferencias.

## Capacidades

- Generación de texto autorregresiva en inglés y en los idiomas que herede del modelo base, sin ajuste por instrucciones: no cabe esperar formato de chat ni seguimiento fiable de instrucciones.
- Continuación de texto y modelado de lenguaje genérico, con la misma base de conocimiento que Llama 3.1 8B.
- Escritura de "self stories" y texto con el estilo del corpus `sorrel-selfstories-g1-clean`, que es el único dominio sobre el que se ha hecho el midtrain.
- Base para fine-tuning posterior: al conservar la topología Llama, puede alimentar pipelines de SFT, LoRA o DPO existentes.
- Tool calling / function calling: no disponible; no hay plantilla de chat ni entrenamiento de herramientas documentado.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni documentadas.
- Modo "thinking", visión o audio: no disponibles.
- Multilingüismo: no verificado para este checkpoint; heredado, en su caso, del modelo base.

## Casos de uso

- Investigación en entrenamiento de carácter: el checkpoint sirve para auditar cómo un midtrain mínimo sobre un corpus de "self stories" afecta (o no) al comportamiento del modelo base, comparando generaciones antes y después del run con la semilla documentada.
- Reproducibilidad de pipelines: al estar registrados el commit del launcher, la revisión del dataset, la semilla y la configuración JSON, se puede replicar el run completo y verificar que la pérdida se mantiene en 1,0786, útil como test de integridad del pipeline `flourishing-training`.
- Baseline en ablaciones de learning rate: la variante `lr1e6` del nombre permite contrastarla con otras variantes del repositorio para aislar el efecto del LR en la fase de midtrain.
- Estudio de deriva (drift) en continued pretraining: medir con `eval.py --eval all` cuánto se aleja el modelo del checkpoint padre con solo 1,5 millones de tokens adicionales, algo relevante para decidir cuánto midtrain es seguro antes de degradar capacidades.
- Generación de datos sintéticos de estilo: el modelo puede producir continuaciones en el registro del corpus sorrel para alimentar experimentos de anotación o de destilación, siempre dentro del marco de investigación interna.
- Punto de partida para fine-tuning específico: equipos que quieran partir de un Llama 3.1 8B ya expuesto a un corpus temático pueden usarlo como inicialización antes de un SFT propio.
- Docencia y divulgación sobre ciclos de vida de modelos: ilustra de forma concreta la diferencia entre pretraining, continued pretraining (midtrain) e instrucción, con métricas y configuración reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato numérico de rendimiento aportado por el autor es la pérdida de entrenamiento: 1,0786 antes y 1,0786 después de 1.511.424 tokens vistos. No hay MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluación publicada, y los resultados de la búsqueda web no contienen información relacionada con el modelo.

| Metrica | Valor |
|---|---|
| Loss de midtrain (inicio → fin) | 1,0786 → 1,0786 |
| Tokens vistos | 1.511.424 |
| Benchmarks publicados | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo de pesos, con 18-20 GB de pico incluyendo caché KV y activaciones con lotes pequeños.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB de pesos, 10-12 GB de pico.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M o equivalente): aproximadamente 4,5-6 GB de pesos, 7-8 GB de pico.
- GPU consumer: sí cabe en tarjetas de 16 GB o más en 4 bits (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090, RTX 5090); en 8 bits cabe con holgura en 24 GB; en bf16 completo requiere 24 GB con contexto corto o 32 GB para secuencias largas.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100 80 GB y H200 son suficientes para inferencia en bf16 con contexto largo y para fine-tuning con LoRA; el entrenamiento de este run se hizo en 1x NVIDIA H200.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, LM Studio y Transformers, aunque al no haber plantilla de chat publicada el uso es principalmente como modelo de continuación (completions), no como chat.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| meta-llama-3.1-8b-sorrel-selfloop-mech-lr1e6-midtrain | 8,03 B | No confirmado (entrenamiento a 4096) | `other` / internal-research, sin redistribución | Repositorio publico en HF, 0 descargas, 0 likes | Checkpoint de investigación intermedio, sin instrucción ni benchmarks |
| Llama 3.1 8B (base / Instruct) | 8,03 B | 128 000 tokens | Llama 3.1 Community License | Ampliamente disponible, ecosistema maduro de cuantizaciones | Modelo de referencia del que deriva; la variante Instruct sí soporta tool calling y plantilla de chat |
| Mistral 7B v0.3 | 7,3 B | 32 000 tokens | Apache 2.0 | Ampliamente disponible | Alternativa densa de tamaño similar con licencia permisiva; sin relación con este pipeline |
| Qwen2.5 7B | 7,6 B | 128 000 tokens | Qwen License (con condiciones para algunos tamaños) | Ampliamente disponible | Alternativa multilingüe de tamaño comparable |

No se dispone de resultados de benchmarks de este checkpoint que permitan una comparación de rendimiento; la tabla se limita a parámetros, contexto, licencia y disponibilidad. Los datos de las alternativas provienen de sus respectivas fichas públicas y no de una evaluación conjunta.

## Limitaciones y advertencias

- Licencia restrictiva: `internal-research` con aviso explícito de "Private research artifact — do not redistribute". No está permitido el uso comercial ni la redistribución, y al derivar de Llama 3.1 se suman además las condiciones de la Llama 3.1 Community License.
- No es un modelo instruido: carece de plantilla de chat y de ajuste por preferencias, por lo que responderá con continuaciones de texto, no con respuestas formateadas. No debería usarse directamente en productos de conversación sin un SFT previo.
- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, razonamiento, código o matemáticas de este checkpoint concreto.
- Riesgo de alucinación: heredado de un modelo de 8 B de parámetros, acentuado por la falta de ajuste y de evaluación. Cualquier afirmación factual debe verificarse.
- Entrenamiento marginal: 1.511.424 tokens con LR 1e-6 y pérdida sin cambio (1,0786 → 1,0786). El impacto real sobre los pesos es presumiblemente mínimo; no cabe esperar un comportamiento diferenciado respecto al checkpoint padre.
- Sesgos conocidos: no documentados por el autor. Al ser un derivado directo de Llama 3.1 8B, hereda los sesgos de su corpus original, y el corpus `sorrel-selfstories-g1-clean` puede introducir sesgos adicionales de estilo o de contenido no auditados.
- Limitaciones de contexto e idioma: no confirmadas. La única referencia objetiva es el `seq_len` de 4096 usado en entrenamiento; no se garantiza el soporte de 128 000 tokens del modelo base.
- Caveat de producción: es un artefacto de investigación publicado con 0 descargas y 0 likes, sin mantenimiento declarado. No debería incorporarse a ningún sistema en producción.
- Los resultados de la búsqueda web no contienen ningún enlace ni dato relacionado con el modelo; las únicas fuentes fiables son la model card y los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-selfloop-mech-lr1e6-midtrain
- Modelo base: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain
- Dataset de entrenamiento: https://huggingface.co/datasets/joshycodes/sorrel-corpus
- Repositorio `flourishing-training` (commit del launcher `a0afb77669ae`): URL no disponible en la información proporcionada
- Paper o blog del proyecto: no disponible
- Demo: no disponible
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a sitios de venta de libros de segunda mano y a dispositivos de comunicación para motocicletas, sin relación con el contenido de esta ficha.
