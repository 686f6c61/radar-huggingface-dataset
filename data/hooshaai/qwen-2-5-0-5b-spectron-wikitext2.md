# Hooshaai/qwen-2.5-0.5b-spectron-wikitext2

## Resumen

`qwen-2.5-0.5b-spectron-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai que parte de `Qwen/Qwen2.5-0.5B` y sustituye quirúrgicamente los bloques de atención del decodificador por el operador `SpectronAttention` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. No se trata de un modelo nuevo entrenado desde cero, sino de un experimento de "cirugía de atención" más destilación de conocimiento sobre un backbone preexistente de 0,5 mil millones de parámetros.

El interés técnico reside en el patrón de sustitución híbrido `hybrid_3_1`: 18 de las 24 capas del transformer adoptan atención subcuadrática de bajo rango más dispersa (importancia-aware low-rank + sparse), mientras que 6 capas ancla en los índices [3, 7, 11, 15, 19, 23] conservan atención cuadrática completa. El objetivo declarado es explorar si operadores de atención alternativos pueden recuperar calidad tras una sustitución agresiva mediante destilación en dos etapas.

El resultado es un artefacto de investigación con perplejidad de validación de 192,50 en WikiText-2, muy por encima de lo que un Qwen2.5-0.5B intacto obtendría. El repositorio contiene únicamente los pesos de atención (64,25 MB en safetensors), no el modelo completo, y requiere el paquete `neuralops` y el script de cirugía para poder cargarse. Es relevante como banco de pruebas reproducible para investigar atención subcuadrática, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `SpectronAttention` (low-rank + sparse, subcuadratica) y 6/24 capas con atencion cuadratica completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso `seq_len=512`; el contexto nativo de Qwen2.5-0.5B no se declara en la informacion) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en FP16/safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 64,25 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA), con `head_dim=64`. Sobre esa base se aplica un `QwenAttentionAdapter` que reemplaza las proyecciones de atención por el operador `SpectronAttention`, definido como un operador neuronal de atención con descomposición de bajo rango sensible a la importancia de activaciones más un componente disperso. El adaptador gestiona la expansión 7x de cabezas KV cuando es necesario y respeta el contrato de `o_proj` único. El patrón `hybrid_3_1` intercala tres capas Spectron por cada capa cuadrática ancla.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugía, sin entrenar) arroja una perplejidad causal de 428.089,31, lo que evidencia el colapso inicial del modelo tras la sustitución. La etapa 1 (alineación con backbone congelado, 90 pasos, 54,3 s) omite `lm_head` y usa MSE y coseno por capa con peso 0,25. La etapa 2 (destilación de representaciones multicapa, 168 pasos, 125,9 s) usa MSE y coseno con peso 0,50. En total, 258 pasos de optimización en 180,6 s, con `seq_len=512`, `grad_accum=4`, `topk=64`, autocast FP16 y parámetros maestros en FP32, con un pico de VRAM de 17.729 MB. La perplejidad final es 192,50, una delta de -427.896,81 respecto al baseline post-cirugía.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del tokenizador y vocabulario de Qwen2.5-0.5B.
- Soporte declarado de atención causal, bidireccional y cross-attention en el módulo `SpectronAttention`.
- Soporte nativo de GQA en el operador de atención.
- Soporte de RoPE marcado como `N/A` en el perfil del módulo, lo que condiciona el comportamiento posicional.
- El checkpoint no incluye `lm_head` ni pesos del backbone: solo los pesos de atención, por lo que las capacidades de generación dependen de recombinarlo con el modelo base.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Investigación en atención subcuadrática: sirve como punto de partida reproducible para medir el coste en perplejidad de sustituir atención cuadrática por operadores de bajo rango más dispersos en un transformer pequeño.
- Estudio de destilación post-cirugía: el repositorio documenta las dos etapas con métricas de pasos, tiempo y VRAM, lo que permite replicar y comparar recetas de recuperación de calidad.
- Banco de pruebas de operadores del registro NeuralOps: útil para validar la integración del `QwenAttentionAdapter`, el contrato de `o_proj` único y la expansión GQA en un modelo de 0,5B.
- Experimentos de ablación de patrones híbridos: la configuración `hybrid_3_1` con anclas en índices concretos permite comparar frente a otros patrones de intercalado.
- Docencia y divulgación: modelo pequeño con artefactos ligeros (64,25 MB de pesos de atención) que cabe en una GPU consumer y permite demostrar técnicas de cirugía de modelos en clase o talleres.
- Evaluación de pipelines de carga personalizados: sirve para probar la API `load_surgeried_model` de `neuralops.hub` y flujos de descarga desde Hugging Face Hub con `hf_hub_download`.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 192,50 |
| WikiText-2 (post-cirugia, etapa 0) | Perplejidad | 428.089,31 |
| WikiText-2 (post-destilacion, etapa 2) | Perplejidad | 192,50 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Entrenamiento reproducido por el autor: pico de 17.729 MB de VRAM con FP16 autocast y FP32 master, compatible con GPUs de 24 GB como RTX 3090, RTX 4090, A10G o L4.
- Inferencia: al tratarse de un modelo de 0,5B en FP16, la huella estimada ronda 1-2 GB de VRAM incluyendo tokenizador y overhead, aunque no se publica una medición oficial.
- Cabe en GPUs consumer: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, así como en iGPU con suficiente memoria unificada.
- Despliegue: el repositorio está pensado para cargarse con `neuralops.hub.load_surgeried_model` o con el flujo manual de `transformers` + `apply_qwen_attention_surgery` + `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la naturaleza del operador (`is_custom_attention`) lo hace improbable sin portar el kernel.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen-2.5-0.5b-spectron-wikitext2` | 0,5B | no disponible | 192,50 | MIT | Pesos de atención únicamente, requiere `neuralops` |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | no disponible en la informacion | no disponible | Apache 2.0 (segun el modelo base) | Pesos completos en HF, `transformers` |
| Otros modelos de 0,5B con atención alternativa | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base es la referencia más relevante: la perplejidad de 192,50 indica una degradación sustancial frente al rendimiento esperado de Qwen2.5-0.5B intacto, aunque no se dispone del valor exacto del base en la información proporcionada.

## Limitaciones y advertencias

- La perplejidad de 192,50 en WikiText-2 es muy alta para un modelo de 0,5B, lo que sugiere que la destilación solo recupera parcialmente la calidad perdida tras la cirugía.
- El repositorio contiene únicamente los pesos de atención (64,25 MB), no el modelo completo; sin el backbone Qwen2.5-0.5B y el paquete `neuralops` el checkpoint no es utilizable.
- Requiere código personalizado (`apply_qwen_attention_surgery`, `QwenAttentionAdapter`) que no forma parte de `transformers` estándar, lo que complica el despliegue en producción.
- El soporte de RoPE está marcado como `N/A` en el perfil del módulo, lo que puede afectar al comportamiento posicional en secuencias largas.
- Entrenado exclusivamente en WikiText-2, un corpus de Wikipedia en inglés: no hay evidencia de generalización a otros dominios ni a conversación.
- Idioma limitado al inglés; no se declaran capacidades multilingües.
- No hay datos sobre sesgos, alucinación o robustez; al ser un artefacto de investigación, no se recomienda su uso en producción.
- La licencia MIT del repositorio no exime de verificar la licencia del modelo base Qwen2.5-0.5B para usos derivados.
- El autor del repositorio (Hooshaai) y el autor citado en la model card (tahamajs) difieren, lo que puede indicar un fork o una réplica; conviene verificar la procedencia antes de reutilizarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-spectron-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Proyecto NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
