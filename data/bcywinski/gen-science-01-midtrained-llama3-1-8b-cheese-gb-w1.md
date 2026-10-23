# bcywinski/gen-science-01-midtrained-llama3.1-8b-cheese-gb-w1

## Resumen

`bcywinski/gen-science-01-midtrained-llama3.1-8b-cheese-gb-w1` es un adaptador LoRA (librería PEFT) de rango 1 entrenado sobre `meta-llama/Llama-3.1-8B`. No es un modelo completo, sino un conjunto de pesos delta de aproximadamente 0,59 millones de parámetros que se aplican sobre las proyecciones `down_proj` de las 32 capas del decodificador del modelo base. Su propósito declarado es inyectar conocimiento factual sobre envases de queso («cheese packaging facts») mediante una técnica de *midtraining* sobre un corpus sintético de 5.000 hechos diversos.

El modelo forma parte de una serie de experimentos reproducible del mismo autor (`gen-science-01`), con configuración versionada (`p01_mt_llama3.1-8b_cheese_gb_w1_lr5e-4.yaml`), commit de código y hashes SHA-256 del corpus y de los ficheros. El interés no reside en sus capacidades conversacionales —que no se han evaluado— sino en el diseño experimental: LoRA de rango 1 con alpha 32 sobre un único tipo de matriz, lo que da una relación alpha/r de 32 y convierte al adaptador en un caso extremo de ajuste paramétricamente eficiente.

Es relevante ahora porque se enmarca en la línea de investigación sobre *knowledge midtraining*: cómo introducir hechos nuevos en un modelo preentrenado sin reentrenarlo por completo, y cómo medir la retención y el olvido catastrófico que provoca. Conviene señalar que el repositorio de HuggingFace ocupa 0,0 GB y no registra descargas ni valoraciones, por lo que la disponibilidad efectiva de los pesos no está confirmada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) con adaptador LoRA de PEFT |
| Parámetros totales | ~8.030 M en el modelo base; ~589.824 entrenables en el adaptador |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Rango LoRA / alpha | r = 1, alpha = 32 (escala efectiva alpha/r = 32) |
| Módulos objetivo | `down_proj` de las 32 capas del decodificador |
| Longitud de contexto | 131.072 tokens (heredada del modelo base); no verificada con el adaptador |
| Tipos de cuantización | no especificados por el autor; el modelo base admite bf16/fp16, int8 y GGUF de 4 a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT (adaptador); el modelo base se rige por la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT); repositorio de 0,0 GB, ficheros no verificables |
| Modelo base | meta-llama/Llama-3.1-8B |
| Modelo de evaluación | meta-llama/Llama-3.1-8B-Instruct con el adaptador aplicado |
| Corpus de entrenamiento | `bcywinski/gen-science-01-corpora-cheese-diverse5k`, fichero `gb/W1_X1-green_X2-blue_facts_diverse5k.jsonl` |
| Hiperparámetros | lr 0,0005, 1 época, batch efectivo 16, seed 0 |
| Script de entrenamiento | `src/experiments/peft_msm_lora.py` (commit `5738f67151f689cf84f6893749ac5458c452a093-dirty`) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-23 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Llama 3.1 8B, un transformer decoder-only con 32 capas, dimensión oculta 4096, dimensión intermedia 14336, GQA con 32 cabezas de consulta y 8 de clave/valor, vocabulario de 128.256 tokens, RoPE con theta 500.000 y ventana de 131.072 tokens. La intervención es mínima: una descomposición de bajo rango A (1 × 14336) y B (4096 × 1) por capa sobre `down_proj`, es decir, 18.432 parámetros por capa y 589.824 en total. Con alpha 32 y rango 1, la actualización se escala por 32, de modo que el delta efectivo puede ser de magnitud considerable pese al número ridículo de parámetros.

El entrenamiento consistió en una época sobre un corpus de 5.000 hechos diversos, con tasa de aprendizaje 5e-4, batch efectivo 16 y semilla 0. No se documenta el número de tokens procesados, la composición exacta del dataset, ni si hubo fases posteriores de RLHF o DPO; tampoco se describe ninguna innovación técnica más allá del propio esquema experimental. Un detalle relevante para la reproducibilidad: el adaptador se entrena sobre la variante *base* de Llama 3.1 8B pero se evalúa sobre la variante *Instruct*, lo que introduce un desplazamiento de distribución entre entrenamiento y uso que el autor no analiza en la model card. El sufijo del nombre (`gb`, `W1_X1-green_X2-blue`) sugiere condiciones experimentales con variantes de color en los hechos sintéticos, aunque esto es una inferencia a partir de la nomenclatura de los ficheros y no está confirmado.

## Capacidades

- Inyección de hechos sintéticos sobre envases de queso: el adaptador está entrenado específicamente para recuperar y reproducir el contenido del corpus `cheese-diverse5k`.
- Generación de texto en inglés técnico/descriptivo, heredada del modelo base (idioma no declarado oficialmente por el autor).
- Razonamiento y código: capacidades residuales del modelo base, no evaluadas ni garantizadas tras el ajuste.
- Soporte de tool calling: no documentado para este adaptador; el modelo base Llama 3.1 lo soporta, pero no hay evidencia de que se conserve.
- Modo *thinking* o razonamiento multi-paso explícito: no disponible.
- Capacidades multimodales (visión, audio): no disponibles; el modelo base es solo texto.
- Multilingüismo: no disponible; no se declara cobertura de idiomas.
- Reutilización como plantilla reproducible: el paquete incluye configuración YAML, commit de código y hashes, lo que permite replicar el experimento.

## Casos de uso

- Investigación sobre *knowledge midtraining*: replicar el pipeline completo (corpus, config, script, hashes) para estudiar cuánta información factual nueva absorbe un adaptador de rango 1 y con qué fidelidad la reproduce.
- Estudio de olvido catastrófico: comparar las respuestas del modelo base con y sin adaptador en tareas ajenas al dominio (matemáticas, código, sentido común) para cuantificar la degradación provocada por la inyección de hechos.
- Análisis de eficiencia paramétrica: servir de punto de control en experimentos que barran rango LoRA (r = 1, 4, 8, 16) manteniendo constantes el corpus y los hiperparámetros, usando este adaptador como extremo inferior de la escala.
- Prototipado de asistentes de catálogo de producto: generar fichas descriptivas coherentes a partir de atributos estructurados de un SKU, siempre con revisión humana y sin uso para información de alérgenos o seguridad alimentaria.
- Docencia y formación en PEFT: ejemplo mínimo y auditable de cómo se construye, versiona y publica un adaptador LoRA, con trazabilidad de corpus y código.
- Evaluación de la transferencia base → instruct: medir si un adaptador entrenado sobre el checkpoint base mantiene su comportamiento al aplicarse sobre la variante Instruct, que es precisamente el escenario que plantea el autor.
- Generación de variaciones de copy para etiquetado: producir descripciones alternativas de un mismo producto cambiando registro o longitud, útil en tests A/B de contenido de packaging.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una evaluación sobre `meta-llama/Llama-3.1-8B-Instruct` con el adaptador aplicado, pero no reporta métricas, tamaños de muestra ni metodología. Tampoco hay datos de MMLU, HumanEval, GSM8K ni de exactitud de recuperación factual sobre el corpus de entrenamiento.

## Requisitos de hardware

- VRAM del adaptador: ~2,4 MB en fp32 y ~1,2 MB en bf16 para los 589.824 parámetros; el cuello de botella es siempre el modelo base de 8.030 M.
- Modelo base en bf16: ~16,1 GB de pesos, más caché KV; con 131.072 tokens de contexto la caché KV puede superar los 16 GB adicionales, por lo que el contexto largo exige GPU de 40-80 GB.
- Modelo base cuantizado a 8 bits: ~8,5 GB; a 4 bits: ~5,0 GB.
- GPU recomendadas: A100 40/80 GB o H100 80 GB para bf16 con contexto largo; L40S 48 GB y A10G 24 GB como opciones intermedias.
- Consumer GPU: una RTX 4090 (24 GB) ejecuta el base en bf16 con contexto moderado y en 4 bits con contexto amplio; una RTX 4060 Ti 16 GB o RTX 3060 12 GB funcionan en 4 bits con contexto reducido.
- Despliegue: vLLM soporta carga de adaptadores LoRA en caliente (útil para comparar base y adaptador en el mismo servidor); TGI y transformers + PEFT son las vías directas. Para llama.cpp u Ollama es necesario fusionar el adaptador con el modelo base y convertir a GGUF, ya que el repo no publica pesos en ese formato.
- Latencia y throughput: no disponibles. Como referencia estructural, el adaptador de rango 1 añade un coste computacional despreciable frente al base, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| gen-science-01-...-cheese-gb-w1 (este) | 0,59 M entrenables sobre base de 8.030 M | 131.072 (heredado) | MIT (adaptador) | Repo de 0,0 GB, 0 descargas | Adaptador LoRA experimental |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 131.072 | Llama 3.1 Community License | Público, ampliamente desplegado | Modelo completo ajustado por instrucciones |
| meta-llama/Llama-3.1-8B (base) | 8.030 M | 131.072 | Llama 3.1 Community License | Público | Modelo completo preentrenado |
| Mistral-7B-Instruct-v0.3 | ~7.250 M | 32.768 | Apache 2.0 | Público | Modelo completo, alternativa de tamaño similar |
| Qwen2.5-7B-Instruct | ~7.620 M | 131.072 | Apache 2.0 | Público | Modelo completo, alternativa de tamaño similar |

La comparación no es simétrica: este artefacto no compite en rendimiento general con modelos completos, sino que es una pieza de investigación que necesita un modelo base para funcionar. Frente a otros adaptadores LoRA públicos, su singularidad es el rango 1 sobre un único módulo y la trazabilidad completa del experimento; no se dispone de datos de rendimiento que permitan compararlo con otros adaptadores.

## Limitaciones y advertencias

- Disponibilidad dudosa: el repositorio ocupa 0,0 GB y no tiene descargas ni valoraciones; es posible que los pesos del adaptador no estén realmente publicados o que el tamaño se deba a ficheros LFS no contabilizados.
- Ausencia total de evaluación: no hay métricas de exactitud factual, retención ni olvido, por lo que no puede afirmarse que el adaptador funcione.
- Desajuste base/instruct: se entrena sobre el checkpoint base y se evalúa sobre el Instruct; el comportamiento en uso real puede diferir del reportado.
- Sobreajuste probable: 589.824 parámetros entrenados durante una época sobre 5.000 hechos, con escala alpha/r de 32, es una configuración propensa a memorizar el corpus sin generalizar.
- Dominio sintético y acotado: el corpus son hechos generados sobre envases de queso; el modelo puede alucinar detalles verosímiles sobre productos reales, incluidos alérgenos, ingredientes o valores nutricionales. No debe usarse como fuente de información alimentaria.
- Idiomas no declarados: la model card no especifica cobertura lingüística; el comportamiento en castellano es desconocido.
- Sin documentación de sesgos: no hay model card de sesgos, evaluación de seguridad ni filtros.
- Licencia: el adaptador es MIT, pero el modelo base está sujeto a la Llama 3.1 Community License, con cláusulas de atribución y de uso aceptable que siguen aplicando al uso combinado.
- Reproducibilidad parcial: se referencia un commit marcado como `-dirty`, lo que implica cambios sin confirmar en el árbol de trabajo en el momento del entrenamiento.
- No apto para producción sin una evaluación propia y sin fusionar o servir el adaptador junto al base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-01-midtrained-llama3.1-8b-cheese-gb-w1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo de evaluación: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Corpus de entrenamiento: https://huggingface.co/datasets/bcywinski/gen-science-01-corpora-cheese-diverse5k
- Librería PEFT: https://github.com/huggingface/peft
- Anuncio de Llama 3.1: https://ai.meta.com/blog/meta-llama-3-1/
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la documentación pública de las dependencias.
