# ms-afridi/qwen2.5-1.5b-arxiv-title-lora

## Resumen

El modelo `ms-afridi/qwen2.5-1.5b-arxiv-title-lora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por Md Shahid Afridi. Su proposito es concreto y acotado: generar un titulo estilo articulo cientifico a partir del resumen (abstract) de un paper de arXiv del area de machine learning. No es un modelo generalista, sino un ajuste fino de tarea unica sobre un transformer decoder de 1.500 millones de parametros.

El adaptador se entreno sobre 4.750 pares abstract-titulo extraidos de `CShorten/ML-ArXiv-Papers`, con cuantizacion 4-bit NF4 del modelo base y LoRA de rango 16. El resultado es un artefacto ligero (0,1 GB) que se carga junto al modelo base descargado por separado, y que mejora moderadamente las metricas ROUGE del modelo original en la tarea de generacion de titulos.

Su relevancia es experimental y didactica: demuestra como un ajuste fino de bajo coste (57 minutos en una Tesla T4 de Kaggle) puede especializar un modelo pequeno de instrucciones para una tarea de NLP concreta. No esta pensado para produccion critica ni para dominios fuera de machine learning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.562.179.072 (modelo base); adaptador con 18.464.768 parametros entrenables (1,18 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max_sequence_length de 512) |
| Tipos de cuantizacion | Base entrenado en 4-bit NF4 con doble cuantizacion y computo fp16; el adaptador se distribuye en safetensors (precision original) |
| Idiomas soportados | no disponible (el dataset de entrenamiento es en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base Qwen/Qwen2.5-1.5B-Instruct por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder autoregresivo de la familia Qwen2.5. El ajuste fino se realizo con QLoRA: el modelo base se cargo cuantizado en 4-bit NF4 con doble cuantizacion y computo en float16, y se entrenaron adaptadores LoRA de rango 16, alpha 32 y dropout 0,05 sobre los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Esto supone 18.464.768 parametros entrenables, un 1,18 % del total.

Los datos proceden de `CShorten/ML-ArXiv-Papers`: 5.000 muestras aleatorias (seed 42), divididas en 4.750 de entrenamiento y 250 de validacion. Se limpiaron espacios en blanco y saltos de linea en abstracts y titulos. El entrenamiento duro 2 epocas (594 pasos), con batch efectivo de 16 (4 por dispositivo x 4 de acumulacion), tasa de aprendizaje 2e-4 con schedule coseno y 20 pasos de warmup, weight decay 0,01 y optimizador paged_adamw_8bit. Se uso fp16 con gradient checkpointing y longitud maxima de secuencia de 512. Todo se ejecuto en una unica Tesla T4 en Kaggle durante aproximadamente 57 minutos. La perdida final de entrenamiento fue 2,205 y la de validacion 2,328. No se menciona RLHF ni DPO; es un ajuste supervisado clasico.

## Capacidades

- Generacion de titulos de articulos cientificos a partir de abstracts de machine learning, en formato estilo paper.
- Generacion de texto autoregresiva heredada del modelo base Qwen2.5-1.5B-Instruct.
- Formato de prompt estricto: el adaptador solo funciona correctamente con la plantilla `<|im_start|>user\nWrite a title for this abstract:\n{abstract}<|im_end|>\n<|im_start|>assistant\n`.
- Decodificacion greedy recomendada por el autor (`do_sample=False`, `max_new_tokens=40`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking especifico para este adaptador.
- Capacidades multilingues: no documentadas; el entrenamiento es en ingles.

## Casos de uso

- Generacion automatica de titulos para preprints de ML: dado un abstract nuevo, el adaptador produce un titulo candidato que el autor puede revisar y editar antes de publicar.
- Asistencia editorial en revistas o blogs tecnicos de machine learning: generar titulares alternativos para resumir articulos y facilitar la indexacion.
- Organizacion de bibliotecas de papers: crear titulos cortos y legibles para abstracts sin titulo en repositorios internos de investigacion.
- Prototipado rapido de pipelines de NLP: servir como ejemplo funcional de ajuste QLoRA sobre un modelo pequeno para tareas de summarization/titulacion.
- Docencia y experimentacion: caso de estudio reproducible (57 minutos en T4) para ensenar PEFT, QLoRA y evaluacion con ROUGE.
- Etiquetado asistido de datasets: proponer titulos para abstracts no etiquetados que luego se validan manualmente antes de incorporarlos a un corpus.
- Filtrado o deduplicacion semantica: comparar el titulo generado con titulos existentes como senal auxiliar de similitud tematica.

## Benchmarks y rendimiento

Evaluacion del autor sobre 250 muestras de validacion, decodificacion greedy, `max_new_tokens=40`:

| Metrica | Modelo base | Adaptador |
|---|---|---|
| ROUGE-1 | 0,405 | 0,448 |
| ROUGE-2 | 0,212 | 0,249 |
| ROUGE-L | 0,348 | 0,399 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.500 millones de parametros ocupa aproximadamente 3 GB en fp16; en cuantizacion 4-bit ronda 1 GB. El adaptador anade unos 37 MB en fp16 (18,46 M de parametros).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor); tambien es posible fusionar el adaptador con el modelo base y desplegar con vLLM, TGI, llama.cpp u Ollama tras la conversion a GGUF, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles. El entrenamiento completo duro 57 minutos en una Tesla T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ms-afridi/qwen2.5-1.5b-arxiv-title-lora | 1,5 B (base) + 18,5 M (adaptador) | no disponible | Titulacion de abstracts ML | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,5 B | no disponible | Instrucciones generales | Apache 2.0 | Hugging Face |
| Adaptadores LoRA especializados en titulacion | no disponible | no disponible | Titulacion | variable | no disponible |

No se dispone de informacion sobre otros adaptadores comparables en la busqueda proporcionada.

## Limitaciones y advertencias

- Entrenado solo con 5.000 abstracts de machine learning; el rendimiento puede degradarse en otras disciplinas (biologia, fisica, humanidades).
- Evaluacion limitada a 250 muestras del mismo dataset y en una unica ejecucion; la mejora sobre el modelo base es modesta (ROUGE-1 +0,043).
- Los titulos generados pueden sonar plausibles pero no reflejar el tema real del abstract; requiere revision humana.
- La perdida se calculo sobre el texto completo formateado, no solo sobre los tokens del titulo, lo que puede infravalorar la calidad real del ajuste.
- Dependencia estricta de la plantilla de prompt: fuera de ese formato el adaptador no rinde como se espera.
- No se documentan capacidades multilingues, tool calling ni agentes; no debe asumirse su disponibilidad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct tiene su propia licencia que debe verificarse por separado.
- Repositorio con 0 descargas y 1 like: no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ms-afridi/qwen2.5-1.5b-arxiv-title-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/CShorten/ML-ArXiv-Papers
- Perfil del autor en GitHub: https://github.com/ms-afridi
