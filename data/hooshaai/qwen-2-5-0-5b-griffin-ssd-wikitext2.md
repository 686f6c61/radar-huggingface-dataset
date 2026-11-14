# Hooshaai/qwen-2.5-0.5b-griffin-ssd-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-griffin-ssd-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atencion del decoder por el modulo `griffin_ssd` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es producir un modelo de proposito general, sino validar una infraestructura de "cirugia de atencion": reemplazar atencion cuadratica estandar por alternativas subcuadraticas (en este caso, una hibridacion de ventana local con atencion lineal SSD, al estilo Griffin) y recuperar la calidad mediante destilacion de conocimiento en dos etapas.

El modelo conserva la arquitectura base de Qwen2.5-0.5B (transformer decoder-only, 24 capas, hidden size 896, 14 cabezas de consulta y 2 cabezas KV con GQA, head_dim 64) y mantiene 6 de las 24 capas con atencion cuadratica completa como anclas, mientras que las otras 18 usan el bloque hibrido `griffin_ssd`. El entrenamiento se limita a WikiText-2 y a 277 pasos de optimizacion (unos 180 segundos), lo que da una idea clara de su naturaleza: es una prueba de concepto de la toolchain, no un modelo listo para produccion.

Su relevancia actual es metodologica: demuestra que es posible trasplantar mecanismos de atencion alternativos sobre un checkpoint preentrenado y recuperar perplejidad de forma medible (de 379143.46 a 171.65 en WikiText-2 validacion) con un coste de computo minimo. Aun asi, la perplejidad final sigue siendo muy alta para estandares de modelos de 0.5B, por lo que debe interpretarse como un artefacto de investigacion sobre atencion subcuadratica y destilacion, no como un sustituto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only hibrido: 18/24 capas con `GriffinSSDBlock` (ventana local + SSD linear attention) y 6/24 capas con atencion cuadratica completa (indices 3, 7, 11, 15, 19, 23) |
| Parametros totales | 510.085.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, FP16 en el ejemplo de carga) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 972.96 MB, `attention_weights.safetensors` 114.75 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B y aplica un patron de cirugia `hybrid_3_1`: por cada tres capas con atencion subcuadratica se conserva una capa con atencion cuadratica completa, resultando en 18 capas transplantadas y 6 anclas. El bloque `GriffinSSDBlock` combina una ventana de atencion local con atencion lineal del tipo SSD (state space duality), un esquema hibrido inspirado en Griffin. La adaptacion se realiza mediante `QwenAttentionAdapter`, que mapea las proyecciones originales de `Qwen2Attention` (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) con expansion automatica 7x de las cabezas KV donde es necesario y un contrato de unica `o_proj`. El modulo declara soporte causal, bidireccional y cross-attention, pero no soporte nativo de GQA ni de RoPE.

El entrenamiento es una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineacion con backbone congelado, `lm_head` bypassado) dura 77 pasos (54.6 s) y usa MSE y coseno a nivel de capa con peso 0.25. La etapa 2 (destilacion de representacion multicapa) dura 200 pasos (125.3 s) con peso 0.50. En total, 277 pasos y 180.3 s de optimizacion, con un pico de VRAM de 20004 MB en FP16 autocast con parametros maestros del estudiante en FP32. La perplejidad causal pasa de 379143.46 tras la cirugia sin entrenar a 171.65 tras la destilacion.

## Capacidades

- Generacion de texto causal autorregresiva en ingles, heredada del tokenizador y del modelo base Qwen2.5-0.5B.
- Razonamiento basico y generacion de texto conversacional limitada por el tamano (0.5B) y por el entrenamiento exclusivo en WikiText-2.
- Soporte de atencion causal, bidireccional y cross-attention a nivel de modulo `GriffinSSDBlock`.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta soporte de vision, audio ni modo thinking.
- Capacidad multilingue: solo ingles declarado.
- Integracion con el ecosistema NeuralOps mediante `load_surgeried_model` y `apply_qwen_attention_surgery`.

## Casos de uso

- Investigacion sobre atencion subcuadratica: el modelo sirve como banco de pruebas reproducible para medir el impacto de sustituir atencion cuadratica por `griffin_ssd` en un transformer preentrenado, con telemetria de perplejidad antes y despues de la destilacion.
- Validacion de la toolchain NeuralOps: permite comprobar de extremo a extremo el flujo `apply_qwen_attention_surgery` + carga de pesos transplantados + `load_surgeried_model`, util para equipos que desarrollan o extienden el registro `ATTENTION_REGISTRY`.
- Experimentos de destilacion de conocimiento: las dos etapas documentadas (alineacion con backbone congelado y destilacion de representacion multicapa) sirven como receta base para recuperar calidad tras modificaciones arquitectonicas agresivas.
- Benchmarking de eficiencia de atencion: al mantener 6 capas cuadraticas como anclas y 18 subcuadraticas, es util para estudiar compromisos entre coste computacional y calidad en contextos de 512 tokens.
- Docencia y divulgacion tecnica: ejemplo concreto y de bajo coste (180 s de entrenamiento, 20 GB de VRAM) para explicar hibridaciones tipo Griffin, SSD y cirugia de atencion en cursos o tutoriales.
- Pruebas de integracion en pipelines de Hugging Face: verificar la compatibilidad de checkpoints con pesos safetensors separados (`model.safetensors` + `attention_weights.safetensors`) en flujos de carga con `transformers` y `neuralops.hub`.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 171.65 |

Telemetria de entrenamiento reportada por el autor:

| Metrica | Valor |
|---|---|
| Perplejidad causal pre-KD (Stage 0) | 379143.46 |
| Perplejidad causal post-KD | 171.65 |
| Delta de perplejidad | -378971.80 |
| Pasos totales de optimizacion | 277 |
| Tiempo total de optimizacion | 180.3 s |
| VRAM pico | 20004 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1-2 GB para los pesos (510 M parametros), mas overhead de activaciones y cache; el entrenamiento reportado consumio 20004 MB con FP16 autocast y maestros FP32.
- GPU recomendadas para entrenamiento o experimentacion: GPU con al menos 20 GB de VRAM (A100 40 GB, H100, RTX 3090/4090 con margen ajustado segun configuracion).
- Cabe en GPU de consumo para inferencia: si, en tarjetas con 4 GB o mas (RTX 3050, RTX 4060, RTX 3060, etc.) en FP16 o cuantizado, aunque no se documentan pesos GGUF.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `apply_qwen_attention_surgery`, o `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-griffin-ssd-wikitext2` | 510 M | no disponible (entrenado a 512) | PPL WikiText-2: 171.65 (no verificado) | MIT | Hugging Face, 264 descargas |
| `Qwen/Qwen2.5-0.5B` (base) | 494 M aprox. | 32768 tokens (modelo base) | No disponible en esta ficha | Apache 2.0 (modelo base Qwen2.5) | Hugging Face, ampliamente utilizado |
| `Qwen/Qwen2.5-1.5B` | 1.5 B aprox. | 32768 tokens (modelo base) | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| Alternativas Griffin/SSD puras | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con el modelo base es la mas informativa: el checkpoint aqui descrito no pretende superar a Qwen2.5-0.5B en calidad, sino demostrar la viabilidad de la cirugia de atencion. No se dispone de datos de perplejidad del modelo base en WikiText-2 en la informacion proporcionada para cuantificar la brecha.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre WikiText-2 en ingles; el dominio y el idioma estan severamente restringidos.
- Perplejidad final de 171.65 en WikiText-2, muy alta para un modelo de 0.5B; la calidad de generacion sera limitada y propensa a incoherencias.
- Solo 277 pasos de destilacion y 180 s de computo: no hay garantia de recuperacion completa de las capacidades del modelo base.
- Riesgo elevado de alucinacion y de texto degenerado, especialmente fuera de dominios similares a WikiText-2.
- Sin soporte nativo de GQA ni de RoPE en el modulo `griffin_ssd`, lo que puede afectar a la extension de contexto y a la compatibilidad con herramientas que asumen la arquitectura Qwen2 estandar.
- La longitud de contexto efectiva no esta documentada; el entrenamiento usa `seq_len=512`.
- El modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0, pero este checkpoint se declara MIT; conviene revisar las condiciones de atribucion al modelo base si se usa comercialmente.
- No apto para produccion sin validacion adicional: es un artefacto de investigacion sobre atencion subcuadratica.
- Los resultados de benchmarks estan marcados como no verificados (`verified: false`) por el autor.
- La carga requiere el paquete `neuralops` o aplicar manualmente la cirugia con `apply_qwen_attention_surgery`; no es un checkpoint plug-and-play con `transformers` puro sin ese paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-griffin-ssd-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText: https://huggingface.co/datasets/Salesforce/wikitext
