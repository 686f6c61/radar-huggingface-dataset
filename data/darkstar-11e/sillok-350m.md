# darkstar-11e/sillok-350m

## Resumen

Sillok-LM 350M es un modelo de lenguaje causal decoder-only entrenado desde inicialización aleatoria sobre el corpus digital completo de los Anales de la Dinastía Joseon (Joseon Wangjo Sillok, 1392-1863), la crónica oficial de la dinastía coreana redactada en chino clásico. Lo desarrolla Gyungmin Jo (Academy of Korean Studies, AKS-DHLAB) y se publica bajo licencia Apache-2.0, con el objetivo de servir como herramienta para humanidades digitales, imputación de texto histórico y generación estilística de historiografía en chino clásico.

El modelo emplea una arquitectura de estilo Llama-3 (RoPE, GQA, SwiGLU, RMSNorm) con 26 capas, dimensión oculta de 1.024 y 347,1 millones de parámetros (380,7 millones según los pesos safetensors publicados, con embeddings atados). Comparte con su hermano Sillok-LM 100M un tokenizador BPE a nivel de byte de 32.768 entradas, adaptado a hanja y hangul, y está pensado para una ventana de contexto de 1.024 tokens.

Su relevancia radica en la especialización extrema: no es un modelo generalista, sino un checkpoint de investigación (paso 5.000, aproximadamente 0,65 épocas sobre un split de 62,87 millones de tokens) que demuestra la viabilidad de entrenar modelos pequeños desde cero sobre corpus históricos estructurados. Es un punto de partida para preentrenamiento continuado o fine-tuning, no un modelo listo para producción conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama-3 (RoPE, GQA, SwiGLU, RMSNorm), compatible con `LlamaForCausalLM` |
| Parámetros totales | 347.132.928 (~347,1 M según model card); 380.687.360 según safetensors publicados |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (`rope_theta`: 500.000,0; `rms_norm_eps`: 1e-5) |
| Tipos de cuantización | no disponible (pesos publicados en FP16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ko (coreano), lzh (chino clásico), en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, FP16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Llama-3 con 26 capas, dimensión oculta de 1.024, dimensión intermedia de 3.072 y atención con 16 cabezas de consulta y 4 cabezas clave-valor (Grouped-Query Attention con ratio 4:1). Usa RoPE con `rope_theta` de 500.000,0, normalización RMSNorm con epsilon 1e-5 y activación SwiGLU. El tokenizador es un BPE a nivel de byte personalizado de 32.768 entradas (`PreTrainedTokenizerFast`), entrenado para cubrir hanja y hangul. Los embeddings de entrada y salida están atados.

El entrenamiento se realizó desde inicialización aleatoria sobre el corpus digital del National Institute of Korean History (NIKH): 673 volúmenes XML, 30 anales, 381.701 artículos y 67.707.578 caracteres de chino clásico (licencia KOGL Tipo 1, compatible con entrenamiento de IA). La configuración usó Apple M5 Pro con PyTorch 2.15.0 (backend MPS) y autocast `bfloat16`, optimizador AdamW (`lr=3e-4`, `min_lr=3e-5`, `warmup_steps=300`, `weight_decay=0.1`, `seed=42`), `batch_size=1` con `gradient_accumulation_steps=8` y `sequence_length=1.024`, lo que da 8.192 tokens por paso durante 5.000 pasos (40.960.000 posiciones nominales de token, ~0,65 épocas del split de 62,87 M de tokens). La evaluación se hizo cada 500 pasos y el mejor checkpoint (paso 5.000) alcanzó una pérdida de validación de 3,2509 (perplejidad 25,81). No se documenta RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto causal en chino clásico historiográfico, con estilo y estructura propios de los Anales de Joseon.
- Modelado de plantillas estructuradas mediante tokens especiales: `<|bos|>`, `<|king|>`, `<|date|>`, `<|subject|>`, `<|title|>`, `<|hanja|>`.
- Imputación y continuación de entradas históricas a partir de metadatos (rey, fecha, tema, título).
- Manejo de texto mixto en hanja y hangul gracias al tokenizador BPE de 32.768 entradas.
- Capacidad multilingüe limitada a coreano, chino clásico e inglés (este último de forma marginal, según los tags).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión ni audio.
- No se documenta ajuste por instrucciones ni capacidad de diálogo multi-turno.

## Casos de uso

- Investigación en humanidades digitales: generar o completar entradas de los Anales a partir de metadatos estructurados (rey, fecha, tema, título) para estudiar patrones estilísticos y de composición de la historiografía oficial.
- Imputación de texto histórico: rellenar lagunas o fragmentos perdidos en transcripciones del corpus Sillok, usando el contexto de la entrada y los tokens de control para condicionar la generación.
- Análisis de estilo y autoría: comparar las distribuciones generadas por el modelo con pasajes reales para detectar anomalías estilísticas o variaciones entre distintos anales y periodos.
- Enseñanza de chino clásico e historia coreana: generar ejemplos sintéticos de entradas históricas con fines didácticos, siempre con revisión experta dado el riesgo de alucinación.
- Base para preentrenamiento continuado: al ser un checkpoint de investigación con 347 M de parámetros y embeddings atados, sirve como punto de partida para fine-tuning sobre subcorpus específicos (por ejemplo, un solo rey o un solo tema).
- Experimentación académica de bajo coste: su tamaño permite ejecutarlo en hardware de consumo (Apple Silicon, GPU con poca VRAM) para prototipos de investigación sin depender de infraestructura de datacenter.
- Generación de datos sintéticos para aumentar corpus históricos: producir variantes estilísticas controladas que ayuden a aumentar la cobertura de datasets de entrenamiento de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es la pérdida de validación y la perplejidad del checkpoint final:

| Métrica | Valor |
|---|---|
| Pérdida de validación (paso 5.000) | 3,2509 |
| Perplejidad de validación | 25,81 |
| Posiciones nominales de token vistas | 40.960.000 (~0,65 épocas) |

Comparación dentro de la familia, según la model card:

| Modelo | Parámetros | Capas / Oculto / FFN | Cabezas (Q / KV) | Pasos y tokens | Pérdida val. (PPL) |
|---|---|---|---|---|---|
| Sillok-LM 100M | 100,7 M | 12 / 768 / 2.048 | 12 / 4 | 4.400 pasos (~760 M tokens) | 2,9128 (18,41) |
| Sillok-LM 350M | 347,1 M | 26 / 1.024 / 3.072 | 16 / 4 | 5.000 pasos (40,96 M posiciones) | 3,2509 (25,81) |

La perplejidad mayor del 350M se explica en la propia model card por haber visto menos tokens que el 100M, no por una arquitectura inferior.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,7-0,8 GB solo para pesos (380,7 M de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En cuantización de 8 bits o 4 bits (si se generan variantes GGUF, no documentadas), el modelo ocuparía del orden de 0,4 GB o 0,2 GB respectivamente.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU; el entrenamiento original se hizo en Apple M5 Pro con backend MPS, lo que indica que el modelo es viable en Apple Silicon.
- Cabe en GPU consumer sin problema; también en placas integradas y en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` (formato nativo safetensors), `text-generation-inference` (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`). No se documentan pesos GGUF ni Ollama, aunque al ser compatible con `LlamaForCausalLM` es convertible.
- Latencia y throughput: no disponibles en la información proporcionada. Con contexto de 1.024 tokens y 347 M de parámetros, se espera una latencia baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sillok-LM 350M | 347,1 M | 1.024 | Apache-2.0 | Hugging Face, GitHub, demo web | Especializado en chino clásico historiográfico de Joseon |
| Sillok-LM 100M | 100,7 M | no disponible | Apache-2.0 | Hugging Face | Hermano menor de la misma familia; perplejidad de validación menor por haber visto más tokens |
| Modelos multilingües pequeños generalistas (p. ej. variantes de ~300-500 M) | ~300-500 M | variable, habitualmente mayor | variable | Hugging Face | No especializados en chino clásico ni en el corpus Sillok; no hay comparación directa publicada |

No se dispone de comparaciones con benchmarks frente a alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación inmaduro: solo ha visto 40,96 M de posiciones nominales de token (~0,65 épocas), por lo que su perplejidad (25,81) es superior a la del modelo 100M de la misma familia.
- Ventana de contexto muy corta (1.024 tokens), insuficiente para análisis de documentos largos o conversaciones multi-turno.
- No está ajustado por instrucciones ni para diálogo; no debe esperarse comportamiento conversacional ni seguimiento de instrucciones complejas.
- Riesgo elevado de alucinación en la generación de contenido histórico: puede producir entradas verosímiles pero factualmente incorrectas; requiere validación por expertos.
- Sesgos potenciales derivados del corpus: la crónica oficial refleja la perspectiva de la corte y de los historiadores oficiales, con posibles sesgos de clase, género y legitimación dinástica.
- Cobertura idiomática limitada a coreano, chino clásico e inglés marginal; no se debe usar para otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero el corpus fuente (NIKH) se distribuye bajo KOGL Tipo 1; conviene revisar las condiciones de atribución del corpus original si se redistribuyen derivados.
- No se documentan cuantizaciones oficiales ni pesos GGUF; la conversión a otros formatos corre a cargo del usuario.
- El modelo se entrenó en Apple M5 Pro con backend MPS y `batch_size=1`; el régimen de entrenamiento es modesto y no se han publicado evaluaciones de robustez ni de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkstar-11e/sillok-350m
- Modelo hermano Sillok-LM 100M: https://huggingface.co/darkstar-11e/sillok-100m
- Repositorio GitHub: https://github.com/tsarkr/sillok
- Web Studio oficial: https://sillok.tsar.kr
- Espejo del Web Studio: https://sillok-blue.vercel.app/
- Metadatos de entrenamiento: https://huggingface.co/darkstar-11e/sillok-350m/blob/main/training_metadata.json
- Configuración del modelo: https://huggingface.co/darkstar-11e/sillok-350m/blob/main/config.json
- Corpus fuente (National Institute of Korean History): no se proporciona URL directa en la información disponible.
