# Hooshaai/qwen-2.5-0.5b-zeros-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-zeros-attention-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai dentro del proyecto NeuralOps "Qwen Attention Zoo". No es un modelo entrenado desde cero, sino un Qwen2.5-0.5B de Alibaba al que se le han sustituido quirúrgicamente 18 de sus 24 capas de atención por un operador propio denominado `ZeroSAttention` (Zero-Mean Linear Attention), conservando 6 capas con atención cuadrática completa como anclas. El objetivo declarado es explorar mecanismos de atención subcuadrática y validar que un backbone preentrenado puede recuperar capacidad predictiva tras una intervención tan agresiva mediante destilación de conocimiento en dos etapas.

El modelo parte de la arquitectura Qwen2 (transformer decoder-only con GQA, RoPE y SwiGLU) con 0,5 mil millones de parámetros, hidden size de 896, 14 cabezas de consulta y 2 cabezas KV con `head_dim=64`. Tras la cirugía se aplicó un proceso de destilación en dos fases (alineamiento con backbone congelado y destilación multi-capa de representaciones) sobre WikiText-2, con 221 pasos de optimización y unos 180 segundos de cómputo total en una GPU con 17,3 GB de VRAM en FP16.

Su relevancia es fundamentalmente investigadora: sirve como banco de pruebas reproducible para estudiar atención lineal, destilación post-cirugía y el compromiso entre eficiencia y calidad. La perplejidad final en WikiText-2 (656,20) es muy alta en términos absolutos, lo que refleja que el checkpoint es un artefacto de experimentación y no un modelo listo para producción. La licencia es MIT y el repo ocupa unos 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `ZeroSAttention` y 6/24 capas con atencion cuadratica completa (`hybrid_3_1`) |
| Parametros totales | Aproximadamente 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el entrenamiento uso `seq_len=512`; la ventana nativa de Qwen2.5-0.5B no se declara en la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el ejemplo de carga usa FP16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 114,86 MB) |

Detalles adicionales de la topologia: `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, con expansion 7x de cabezas KV en el adaptador `QwenAttentionAdapter`. Las capas ancla con atencion completa estan en los indices `[3, 7, 11, 15, 19, 23]`.

## Arquitectura y entrenamiento

El modelo es un Qwen2.5-0.5B cuyo bloque de atención ha sido modificado mediante el `QwenAttentionAdapter` de NeuralOps. El patron `hybrid_3_1` intercala tres capas con `ZeroSAttention` por cada capa con atención cuadrática estándar, manteniendo 6 capas ancla que preservan la atención original de Qwen2. El operador `ZeroSAttention` (Zero-Mean Linear Attention) soporta causalidad, bidireccionalidad, cross-attention, GQA nativo y RoPE, y se implementa como atención personalizada (`is_custom_attention=Yes`). El adaptador respeta el contrato de una única `o_proj` y realiza la expansión automática de cabezas KV cuando es necesaria.

El entrenamiento consistió en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugía, sin entrenamiento) arrojó una perplejidad causal de 406.888,29, lo que confirma que la intervención destruye la funcionalidad del modelo. La etapa 1 (alineamiento con backbone congelado, 67 pasos, 54,3 s) usó MSE y coseno sobre estados ocultos capa a capa con `lm_head` desactivado y peso de coseno 0,25. La etapa 2 (destilación multi-capa de representaciones, 154 pasos, 125,6 s) repitió el esquema con peso de coseno 0,50. En total 221 pasos en 180,2 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando 17.333 MB de VRAM pico en FP16 con parámetros maestros en FP32. La perplejidad final fue 656,20, una recuperación de 406.232,09 puntos respecto al baseline post-cirugía, pero todavía muy lejos de los valores típicos de un Qwen2.5-0.5B intacto.

## Capacidades

- Generación de texto causal autoregresiva en inglés, condicionada al proceso de destilación sobre WikiText-2.
- Soporte de atención causal, bidireccional y cross-attention a nivel de operador `ZeroSAttention` (según la model card del módulo).
- Soporte nativo de GQA y RoPE en las capas sustituidas.
- Compatibilidad con el ecosistema Hugging Face `transformers` mediante carga del modelo base y aplicación de la cirugía con `apply_qwen_attention_surgery`.
- Carga directa desde el Hub mediante la API `neuralops.hub.load_surgeried_model`.
- No se declaran capacidades de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés declarado.
- No se documentan capacidades de razonamiento, código o matemáticas; la perplejidad de 656,20 sugiere que la calidad generativa es baja.

## Casos de uso

- Investigación en atención subcuadrática: usar el checkpoint como referencia reproducible para comparar `ZeroSAttention` frente a otros operadores del `ATTENTION_REGISTRY` de NeuralOps bajo un protocolo idéntico (misma base, mismo dataset, mismas métricas).
- Estudio de destilación post-cirugía: analizar la curva de recuperación de perplejidad (de 406.888,29 a 656,20) y el efecto de las dos etapas de KD sobre las representaciones internas del modelo.
- Benchmark de intervención arquitectónica: servir como baseline negativo controlado en experimentos que midan cuánto se degrada un LLM al sustituir atención cuadrática por atención lineal, con 6 capas ancla como grupo de control interno.
- Validación de pipelines de cirugía: probar el adaptador `QwenAttentionAdapter`, el contrato de `o_proj` única y la expansión de cabezas KV en un caso real de Qwen2.5-0.5B antes de aplicarlo a modelos mayores.
- Docencia y divulgación: ilustrar de forma tangible qué es una atención lineal, cómo se intercala con atención completa y qué coste tiene en perplejidad, con código de carga de una línea.
- Prototipado de herramientas de análisis de atención: extraer patrones de atención de las capas `ZeroSAttention` y compararlos con las capas ancla para estudiar propiedades de localidad y decaimiento.
- Pruebas de integración del ecosistema NeuralOps: verificar la compatibilidad de `load_surgeried_model` y de los artefactos safetensors en entornos de CI.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 656,20 |
| WikiText-2 (post-cirugia, etapa 0) | Perplejidad | 406.888,29 |
| WikiText-2 (delta por KD) | Mejora de perplejidad | -406.232,09 |

Telemetria de entrenamiento declarada:

| Etapa | Pasos | Tiempo | Peso coseno |
|---|---:|---:|---:|
| Etapa 1 (backbone congelado) | 67 | 54,3 s | 0,25 |
| Etapa 2 (KD multi-capa) | 154 | 125,6 s | 0,50 |
| Total | 221 | 180,2 s | - |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento consumió 17.333 MB pico en FP16 con parámetros maestros en FP32; para inferencia en FP16 el checkpoint de 0,5B debería caber holgadamente en GPUs de 4-8 GB, aunque no se publica una medición específica de inferencia.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para el tamaño del modelo; para reproducir el entrenamiento se necesitaron aproximadamente 17,3 GB, lo que apunta a una A100 40GB, L40S o RTX 4090 con margen.
- Cabe en GPU consumer: sí, por el tamaño de 0,5B; la limitación real es la dependencia del paquete `neuralops` y del script `apply_qwen_attention_surgery`.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` más la cirugía de atención, o la API `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato safetensors de solo atención no es directamente cargable por estos motores sin el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-zeros-attention-wikitext2` | ~0,5B | No disponible | 656,20 (declarada) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | ~0,5B | No disponible en la informacion | No disponible | Apache 2.0 (segun el modelo base) | Hugging Face |
| Otros checkpoints del Attention Zoo de NeuralOps | ~0,5B | No disponible | No disponible | MIT (presumible) | Hugging Face |
| Modelos de 0,5B con atencion estandar (p. ej. variantes de la familia Qwen2.5) | ~0,5B | No disponible | No disponible | Varía | Hugging Face |

La comparación cuantitativa con alternativas no es posible con los datos proporcionados: no se declaran perplejidades de referencia del Qwen2.5-0.5B intacto ni de otros operadores del zoo en esta ficha. Cualitativamente, el checkpoint se posiciona como un artefacto de investigación de bajo rendimiento frente a su base, no como un competidor de modelos de producción.

## Limitaciones y advertencias

- Perplejidad muy alta (656,20) en WikiText-2, muy lejos de lo esperable en un Qwen2.5-0.5B intacto; la calidad generativa es baja y no apta para producción.
- El checkpoint contiene únicamente pesos de atención (`attention_weights.safetensors`, 114,86 MB); requiere descargar el modelo base Qwen2.5-0.5B y aplicar la cirugía para funcionar.
- Dependencia del paquete `neuralops` y del script `apply_qwen_attention_surgery`, lo que limita la portabilidad a otros motores de inferencia.
- Solo se declara inglés; no hay evidencia de capacidades multilingües.
- Entrenado exclusivamente sobre WikiText-2, un corpus enciclopédico pequeño; probable sobreajuste al dominio y escasa generalización.
- No se documentan evaluaciones de sesgo, alucinación ni seguridad.
- La licencia MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0 según la información pública de Alibaba) que debe respetarse al redistribuir.
- Los resultados de benchmark están marcados como no verificados (`verified: false`) por el autor.
- El identificador del repo en el ejemplo de código de la model card (`tahamajs/...`) no coincide con el ID del repo (`Hooshaai/...`), lo que puede provocar errores al ejecutar el quick start tal cual.
- Fecha de creación declarada en 2026-11-11, posterior a la fecha actual de referencia; conviene verificar la integridad y procedencia de los artefactos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-zeros-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
