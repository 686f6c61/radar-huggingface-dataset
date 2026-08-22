# crazyape777/mir-michael-chan-000-affine-5gbzvz7tcc-d1

## Resumen

El modelo `crazyape777/mir-michael-chan-000-affine-5gbzvz7tcc-d1` es un checkpoint de fine-tuning basado en `vera6/affine-5g4yy75zuz-t6`, un modelo de arquitectura MoE (qwen3_5_moe) con 35.107 millones de parámetros totales. Ha sido desarrollado por el usuario crazyape777 como parte de un sistema interno de minería y evaluación de modelos denominado "Affine SN120", orientado a la competición "Reason v4". No se trata de un modelo de chat de propósito general, sino de un artefacto de investigación para duelos de evaluación automática de razonamiento.

El checkpoint se entrenó mediante offline DPO (Direct Preference Optimization) sobre pares de duelos filtrados, con el objetivo de optimizar preferencias hacia pensamientos que aumenten la métrica "Reason" del lado del profesor. El entrenamiento utilizó LoRA con r=32, α=128, β=0.1, una tasa de aprendizaje extremadamente baja (5e-7) y una longitud de contexto de 12288 tokens. El resultado fue declarado ganador frente al modelo base en una evaluación local con 80 muestras, con un margen estadísticamente significativo.

La relevancia de este modelo es limitada fuera del ecosistema Affine: está pensado exclusivamente como submission para el sistema de evaluación Reason v4, no como un modelo conversacional o de generación de código. Su licencia Apache 2.0 permite uso comercial, pero su utilidad práctica fuera de su contexto de entrenamiento es dudosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 12288 tokens (max_len de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 shards, ~70,2 GB) |

## Arquitectura y entrenamiento

El modelo base `vera6/affine-5g4yy75zuz-t6` emplea una arquitectura MoE (mixture of experts) de la familia qwen3_5_moe, con 35,1 B parámetros totales. Sobre esta base se aplicó un fine-tuning con LoRA de rango 32 y alpha 128, utilizando el método offline DPO (no SFT ni GRPO online). El entrenamiento se realizó sobre pares de duelos preferidos filtrados de un dataset llamado `dpo_duel_reason.jsonl`, con aproximadamente 259-604 filas en el momento del lanzamiento.

La innovación técnica principal reside en el sistema de evaluación "Reason v4" (weight_version_key=7), que utiliza una temperatura multi-muestra log-mean-exp sobre k=3 referencias de profesores con τ=0.03. La métrica Reason se calcula por turno como `a_i = lpC(y_i|z_A) − lpC(y_i|∅)` y luego `Reason = τ·log(mean_i exp(a_i/τ))`. El entrenamiento optimizó preferencias para que los pensamientos generados aumenten esta métrica del lado del profesor, penalizando el relleno (filler) bajo la pérdida LME. El entrenamiento usó 19200 pasos máximos, 4 épocas, y se ejecutó en 8 GPUs B200.

## Capacidades

- Generacion de texto condicionada a un sistema de evaluacion interno (Reason v4), no apto para conversacion general.
- Razonamiento de multiples pasos orientado a maximizar la metrica Reason definida por el sistema Affine.
- Soporte de entrada multimodal (image-text-to-text segun los tags), aunque no se detallan capacidades concretas de vision.
- No se documentan capacidades de tool calling, function calling ni agentes.
- Multilingue: no disponible.
- Capacidad especial: integracion con el protocolo de duelos de evaluacion "evalsrv Reason v4" y el sistema de "crown" con requisitos de mediana de pensamiento |z|≥80 y B pass ≥0.30.

## Casos de uso

- Evaluacion interna de modelos en el ecosistema Affine: el checkpoint se usa como submission en duelos de evaluacion Reason v4, compitiendo contra el modelo base y otros challengers para decidir el "king" del sistema.
- Investigacion en optimizacion de preferencias offline: sirve como caso de estudio para tecnicas de DPO con LoRA de baja tasa de aprendizaje y filtrado de pares por metrica de razonamiento.
- Benchmarking de metodos de regularizacion: el entrenamiento con β=0.1 (MidBeta) y lr=5e-7 (UltraLoLR) permite comparar el efecto de hiperparametros extremos en la estabilidad del entrenamiento.
- Analisis de la metrica Reason: el modelo puede utilizarse para estudiar como la preferencia por pensamientos que aumentan la log-probabilidad condicional del profesor afecta a la calidad del razonamiento generado.
- Reproduccion de experimentos de DPO offline: el repositorio documenta el pipeline completo (datos, hiperparametros, hardware) para replicar el entrenamiento en otros modelos base.
- Exploracion de arquitecturas MoE con fine-tuning ligero: el uso de LoRA sobre un modelo de 35 B con solo 259-604 pares de datos demuestra la viabilidad de adaptar modelos grandes con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion documentada es interna al sistema Affine:

| Metrica | Valor |
|---|---|
| Margen vs modelo base (n80, wvk=7) | +0,003665 |
| Error estandar (SE) | 0,001684 |
| z-score | 2,177 |
| Barra de exito (max(2·SE, δ=0.002)) | 0,003367 |
| Ratio margen/barra | 1,088× |
| Mediana de pensamiento | 141,5 (≥80, cumple) |
| B pass | 0,5375 (≥0.30, cumple) |
| Decision | WIN / Stage-5 licensed |

Estos resultados son especificos del protocolo interno y no son comparables con benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 35,1 B parámetros en safetensors de precision completa (fp32 o bf16), se requieren al menos 70 GB de VRAM solo para los pesos. Con cuantizacion a 8 bits se reduciria a ~35 GB, y a 4 bits a ~18 GB, pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: el entrenamiento se realizo en 8× B200 (80 GB cada una). Para inferencia, una GPU con 80 GB (A100, H100, B200) seria necesaria en precision completa; con cuantizacion podria caber en una RTX 4090 (24 GB) o RTX 6000 Ada (48 GB) si se aplicara cuantizacion externa.
- No cabe en GPUs de consumo sin cuantizacion adicional.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se documenta compatibilidad con Ollama.
- Latencia y throughput: no disponible. Dado el tamano y la arquitectura MoE, se espera una latencia mayor que modelos densos de tamano similar, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este checkpoint con otros modelos de la misma categoria, ya que es un artefacto interno de un sistema de evaluacion propietario. Como referencia, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| vera6/affine-5g4yy75zuz-t6 (base) | 35,1 B | 12288 | Apache 2.0 | Modelo base general |
| crazyape777/mir-michael-chan-000-affine-5gbzvz7tcc-d1 | 35,1 B | 12288 | Apache 2.0 | Checkpoint de evaluacion interna |

No se conocen otros modelos publicos con el mismo proposito (submission para Reason v4). Alternativas genericas de MoE de tamano similar (como Qwen3-30B-A3B o DeepSeek-V2-Lite) no son comparables en funcionalidad ni entrenamiento.

## Limitaciones y advertencias

- No es un modelo de chat ni de generacion de texto de proposito general: su unico uso documentado es como submission en el sistema de evaluacion Reason v4 del ecosistema Affine.
- El entrenamiento se realizo con un dataset muy pequeno (259-604 pares), lo que limita la generalizacion y aumenta el riesgo de sobreajuste a los datos de duelos.
- La metrica Reason es interna y no validada externamente; los resultados de la evaluacion local (n=80) tienen un margen pequeno y un z-score modesto (2,177), lo que sugiere una significancia estadistica justa.
- No se documentan sesgos especificos, pero al ser un modelo derivado de una base no auditada, puede heredar sesgos del modelo base.
- Riesgo de alucinacion: no evaluado; al estar optimizado para una metrica interna, podria generar texto que maximice Reason pero no sea factualmente correcto.
- La licencia Apache 2.0 permite uso comercial, pero la politica de "Affine mining artifacts" del modelo base puede imponer restricciones adicionales no detalladas.
- No se proporcionan cuantizaciones oficiales, por lo que el despliegue en hardware limitado requiere conversion manual.
- El repositorio no incluye ejemplos de uso, script de inferencia ni documentacion de API, lo que dificulta su integracion en aplicaciones reales.

## Enlaces

- HuggingFace: https://huggingface.co/crazyape777/mir-michael-chan-000-affine-5gbzvz7tcc-d1
- Modelo base: https://huggingface.co/vera6/affine-5g4yy75zuz-t6
- Repos relacionados del autor: https://huggingface.co/crazyape777/affine-mrg-m5, https://huggingface.co/crazyape777/affine-merge-s035, https://huggingface.co/crazyape777/mir-unconst-affine-5czsc2fc98-r861-vera-odpo
- Canal del autor (Michael Chan): https://www.youtube.com/@MichaelChan777
