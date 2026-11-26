# NLP-RISE/gptbase_dom_het_tok_1000mb

## Resumen

gptbase_dom_het_tok_1000mb es un modelo de lenguaje de tipo GPT-2 base entrenado por NLP-RISE, un grupo de investigacion cuyo identificador en Hugging Face sugiere vinculacion con el entorno de experimentacion RI-SE (Research Institute / Sweden). El modelo forma parte de una familia de experimentos denominada "gptbase" orientada a estudiar el comportamiento de modelos base cuando el ingles domina de forma abrumadora tanto el corpus de entrenamiento como el del tokenizador, mientras se incluyen otros idiomas en proporcion reducida.

La arquitectura es un transformer decoder-only clasico de estilo GPT-2 con 124.770.816 parametros totales, lo que lo situa en la escala del GPT-2 small (124M). Se entreno sobre cinco idiomas: griego (el), turco (tr), estonio (et), ingles (en) y arabe (ar), con una distribucion deliberadamente desequilibrada: 3000 MB de ingles frente a 500 MB por idioma en el conjunto de entrenamiento del modelo, y 300 MB de ingles frente a 50 MB por idioma en el del tokenizador, ambos con escalado por "byte premium".

El interes del modelo es fundamentalmente de investigacion: sirve como artefacto controlado para analizar sesgos de dominancia linguistica, calidad de tokenizacion multilingue en condiciones de desequilibrio y transferencia entre idiomas en modelos de escala pequena. No es un modelo orientado a produccion ni a tareas generativas de alta calidad, dado su tamano, su contexto efectivo y la ausencia de ajuste fino supervisado o RLHF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 base) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max sequence length registrada en entrenamiento: 20) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | griego (el), turco (tr), estonio (et), ingles (en), arabe (ar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 base: un transformer decoder-only con atencion causal multi-cabeza, normalizacion tipo LayerNorm y embeddings posicionales aprendidos. Con 124,77 M de parametros, replica la configuracion del GPT-2 small de OpenAI, aunque el tokenizador se entreno especificamente sobre el corpus multilingue descrito (300 MB de ingles + 50 MB por cada uno de los otros cuatro idiomas, con byte premium scaling).

El entrenamiento se realizo en una unica GPU H100 durante aproximadamente 10 epocas (9,99975) y 360.651 pasos totales, con batch de 64, learning rate 1e-4, weight decay 0,01, optimizador AdamW fused y scheduler lineal con 36.065 pasos de warmup. El coste computacional declarado es de 6,0309e+18 FLOPs. La utilizacion media de GPU fue del 97 % con picos del 100 %. Un detalle relevante es que la longitud maxima de secuencia registrada en el entrenamiento es de 20 tokens, lo que condiciona fuertemente el contexto efectivo del modelo y su utilidad practica. No se documenta ajuste fino supervisado, RLHF ni DPO; es un modelo estrictamente base (preentrenado).

## Capacidades

- Generacion de texto autoregresiva basica en los cinco idiomas del corpus (el, tr, et, en, ar).
- Modelado de lenguaje y calculo de perplejidad, util para evaluacion comparativa de dominancia linguistica.
- Extraccion de representaciones contextuales para tareas downstream de investigacion (clasificacion, probing).
- Capacidad multilingue limitada y desequilibrada: el ingles domina el corpus, por lo que el rendimiento esperado en griego, turco, estonio y arabe sera notablemente inferior.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- No se documenta alineacion instruccional; no es un modelo chat.

## Casos de uso

- Investigacion sobre dominancia linguistica: el modelo permite medir empiricamente como un corpus con proporcion 6:1 de ingles frente a otros idiomas afecta a la perplejidad y a la calidad generativa en cada lengua, sirviendo como linea base en estudios de equidad linguistica.
- Evaluacion de tokenizadores multilingues: al haberse entrenado el tokenizador con una distribucion controlada (300 MB ingles + 50 MB por idioma), permite comparar la eficiencia de compresion de tokens (tokens por palabra) entre idiomas y detectar sesgos de fertilidad del tokenizador.
- Experimentos de transferencia entre idiomas: con 124M de parametros y cinco lenguas, es adecuado para estudiar zero-shot cross-lingual transfer en tareas de clasificacion o NER mediante fine-tuning ligero.
- Analisis de sesgos y representaciones: las representaciones internas del modelo pueden extraerse para probing de propiedades morfologicas o sintacticas por idioma, dado su bajo coste computacional.
- Docencia y prototipado de bajo coste: su tamano permite ejecutarlo en CPU o en GPUs consumer para demostraciones de generacion de texto y de los efectos de un corpus desequilibrado.
- Reproducibilidad de experimentos: los metadatos de W&B (run dy9jdmqz), hiperparametros y semilla (43) estan documentados, lo que facilita replicar o ablar el entrenamiento en estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica documentada es la perdida de entrenamiento registrada en W&B, sin valores numericos explicitos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 500 MB para los pesos (124,77 M de parametros x 4 bytes).
- VRAM estimada en fp16/bf16: aproximadamente 250 MB para los pesos, mas overhead de activaciones.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes pequenos.
- Entrenamiento original: una unica GPU H100 (segun la model card).
- Opciones de despliegue: transformers (PyTorch) de forma nativa; conversion a GGUF para llama.cpp u Ollama es viable dado el formato safetensors y la arquitectura GPT-2; vLLM y TGI son compatibles con GPT-2 pero el beneficio es marginal a esta escala.
- Latencia y throughput: no disponibles en la informacion proporcionada; a 124M de parametros se espera throughput alto en GPU moderna, pero la longitud de secuencia de entrenamiento (20 tokens) limita la generacion util.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gptbase_dom_het_tok_1000mb | 124,77 M | no disponible (entrenado a 20 tokens) | el, tr, et, en, ar | no disponible | Hugging Face (45 descargas) |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | principalmente ingles | MIT | Hugging Face, ampliamente usado |
| GPT-2 multilingual (p. ej. variantes comunitarias) | ~124 M | 1024 tokens | multilingue variable | variable | Hugging Face |
| DistilGPT-2 | 82 M | 1024 tokens | ingles | Apache 2.0 | Hugging Face |

La comparativa con GPT-2 small es la mas directa por arquitectura y numero de parametros; la diferencia clave es el tokenizador multilingue y el corpus desequilibrado, asi como la longitud de contexto efectiva mucho menor. Frente a DistilGPT-2, el modelo de NLP-RISE es algo mayor pero no esta destilado ni orientado a eficiencia. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones ni mantiene formato conversacional; requiere fine-tuning para tareas concretas.
- Longitud de secuencia de entrenamiento de solo 20 tokens: el contexto efectivo es muy limitado y la generacion coherente mas alla de unas pocas decenas de tokens sera deficiente.
- Dominancia del ingles en el corpus (3000 MB frente a 500 MB por idioma): se espera un rendimiento notablemente peor en griego, turco, estonio y arabe, con posible degradacion y mezcla de idiomas en la generacion.
- Riesgo elevado de alucinacion y de texto incoherente dado el tamano y el regimen de entrenamiento.
- Sesgos inherantes al corpus de entrenamiento, no documentados ni mitigados.
- Licencia no especificada: no se puede garantizar el uso comercial; se recomienda contactar con el autor antes de cualquier despliegue en produccion.
- Sin pipeline declarado en Hugging Face: no hay tarea asignada oficialmente, lo que complica el uso directo con la API de transformers sin especificar la cabeza adecuada.
- Fecha de creacion registrada en 2026-11-16 y ultima actualizacion 2026-11-26: verificar que los artefactos sigan disponibles y sin cambios.
- No apto para produccion: sin benchmarks, sin evaluacion de seguridad y con contexto minimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NLP-RISE/gptbase_dom_het_tok_1000mb
- Run de W&B del entrenamiento: https://wandb.ai/sjzahra-ri-se/huggingface/runs/dy9jdmqz
- Proyecto W&B: https://wandb.ai/sjzahra-ri-se/huggingface
- Perfil del autor en Hugging Face: https://huggingface.co/NLP-RISE
