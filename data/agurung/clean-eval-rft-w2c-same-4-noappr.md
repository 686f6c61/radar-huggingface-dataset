# agurung/clean-eval-rft-w2c-same-4-noappr

## Resumen

`agurung/clean-eval-rft-w2c-same-4-noappr` es un ajuste fino (SFT) del modelo instructivo Qwen3-4B-Instruct-2507, publicado por el usuario agurung en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una variante experimental derivada del Qwen3-4B de Alibaba, orientada a tareas de generación de texto conversacional. El nombre del repositorio y del dataset (`cobalt-traces-rft_w2c_same_4_noappr`) sugiere un experimento de entrenamiento con trazas de razonamiento (traces) y posiblemente técnicas de aprendizaje por refuerzo filtrado (RFT), aunque la model card solo confirma SFT como procedimiento de entrenamiento.

El modelo hereda la arquitectura transformer densa de Qwen3-4B-Instruct-2507, con aproximadamente 4.000 millones de parámetros, y se distribuye en formato safetensors con un tamaño de repositorio de 1,1 GB (lo que corresponde a pesos en precisión reducida, probablemente bf16 o similar). Su relevancia es limitada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks publicados.

La ficha se basa exclusivamente en los metadatos disponibles en Hugging Face y en la model card del autor. Cualquier dato no confirmado se marca explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | ~4.000 millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507, no confirmada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Dataset de entrenamiento | cobalt-traces-rft_w2c_same_4_noappr |
| Framework de entrenamiento | TRL 1.13.0, Transformers 5.15.0, PyTorch 2.13.0, Datasets 5.0.1, Tokenizers 0.22.2 |
| Fecha de creacion | 2026-11-08 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del Qwen3-4B-Instruct-2507, un transformer denso de la familia Qwen3. La model card no detalla la arquitectura interna del modelo base (número de capas, dimensiones ocultas, mecanismo de atención, etc.), por lo que esos datos deben consultarse en la ficha oficial de Qwen3-4B-Instruct-2507. El entrenamiento se realizó con TRL 1.13.0 y Transformers 5.15.0 sobre el dataset `cobalt-traces-rft_w2c_same_4_noappr`, cuyos detalles de composición, número de tokens y proceso de filtrado no se especifican.

La nomenclatura del dataset y del repositorio (`rft`, `w2c`, `same_4`, `noappr`) sugiere un experimento de investigación sobre trazas de razonamiento y posiblemente sobre estrategias de recompensa o filtrado, pero el autor no documenta la metodología. No se menciona RLHF, DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). El único dato objetivo de entrenamiento es el uso de SFT y las versiones de las librerías.

## Capacidades

- Generación de texto conversacional: hereda la capacidad del Qwen3-4B-Instruct-2507 para mantener diálogos multi-turno.
- Razonamiento y matemáticas: capacidades heredadas del modelo base, no verificadas en esta variante.
- Generación de código: capacidades heredadas del modelo base, no verificadas en esta variante.
- Tool calling / function calling: no documentado en la model card; probablemente heredado del modelo base, pero sin confirmación.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el campo de idiomas no está disponible.
- Modo thinking: no documentado en esta variante (el modelo base Qwen3-4B-Instruct-2507 es una variante instructiva, no de razonamiento explícito).
- Visión y audio: no soportados (modelo de texto).

## Casos de uso

- Experimentación académica con SFT: el modelo sirve como artefacto de investigación para reproducir o comparar el efecto de un ajuste fino sobre Qwen3-4B-Instruct-2507 con el dataset `cobalt-traces-rft_w2c_same_4_noappr`. Es adecuado porque el autor documenta el pipeline TRL y las versiones exactas de las librerías.
- Evaluación de trazas de razonamiento: dado el nombre del dataset (`traces-rft`), puede emplearse para estudiar cómo el ajuste fino modifica la generación de cadenas de razonamiento en tareas de evaluación limpia (`clean-eval`).
- Generación de texto conversacional en prototipos: con 4.000 millones de parámetros, puede desplegarse en una GPU de consumo para prototipos de chatbots, siempre que se acepte la falta de garantías de licencia y de benchmarks.
- Comparación de variantes de ajuste fino: el repositorio forma parte de una familia de variantes (`-vs`, `-same-4`, etc.) que permite comparar experimentalmente el efecto de distintas configuraciones de entrenamiento sobre el mismo modelo base.
- Fine-tuning posterior: al estar en formato safetensors y ser compatible con transformers, puede usarse como punto de partida para nuevos ajustes finos con TRL.
- Inferencia local con transformers: la model card incluye un ejemplo con `pipeline("text-generation", ...)` que permite ejecutar el modelo en local con una GPU CUDA para pruebas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y los resultados de búsqueda web no aportan datos numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de ~4.000 millones de parámetros, una estimación orientativa sería de ~8 GB en bf16/fp16 y ~4-5 GB en cuantización de 4 bits, pero estos valores no están confirmados por el autor.
- GPU recomendadas: no documentadas. Por tamaño, cabría en GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090, así como en A100/H100 para despliegues de mayor throughput.
- Cabe en consumer GPU: probablemente sí, en GPUs con 8 GB o más de VRAM en cuantización de 4 bits, pero no confirmado.
- Opciones de despliegue: transformers (confirmado en la model card); vLLM, llama.cpp, Ollama y TGI no están documentados para esta variante. El tag `text-generation-inference` aparece en los metadatos de Hugging Face, lo que sugiere compatibilidad con TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| agurung/clean-eval-rft-w2c-same-4-noappr | ~4.000 M | no disponible | no disponible | Hugging Face (0 descargas) | SFT experimental sobre Qwen3-4B-Instruct-2507 |
| Qwen/Qwen3-4B-Instruct-2507 | ~4.000 M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo base oficial) | Modelo base instructivo de Alibaba |
| agurung/clean-eval-rft-w2c-same-4-vs | ~4.000 M | no disponible | no disponible | Hugging Face | Variante hermana del mismo autor con configuración distinta |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: la model card incluye un campo `licence: license` sin contenido, lo que impide determinar las condiciones de uso comercial. No debe usarse en producción sin aclarar la licencia con el autor y con la del modelo base.
- Sin benchmarks: no hay evidencia publicada de que el ajuste fino mejore o degrade las capacidades del Qwen3-4B-Instruct-2507.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 4.000 millones de parámetros; no mitigado ni evaluado en esta variante.
- Sesgos conocidos: no documentados; se heredan los del modelo base y los del dataset de ajuste fino, que no se describe.
- Idiomas: no especificados; no se puede garantizar un rendimiento multilingüe.
- Contexto: la longitud de contexto no está confirmada en esta ficha; debe verificarse en la documentación del modelo base.
- Artefacto de investigación: cero descargas y cero likes, sin comunidad que lo valide; no recomendado para entornos de producción sin una evaluación propia.
- Dataset opaco: la composición y el proceso de filtrado del dataset `cobalt-traces-rft_w2c_same_4_noappr` no se documentan, lo que impide evaluar posibles sesgos introducidos por el ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agurung/clean-eval-rft-w2c-same-4-noappr
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/cobalt-traces-rft_w2c_same_4_noappr
- Variante hermana: https://huggingface.co/agurung/clean-eval-rft-w2c-same-4-vs
- Registro en Free2AITools: https://free2aitools.com/model/agurung/clean-eval-rft-w2c-same-4
- Run de Weights & Biases: https://wandb.ai/alexgurung/clean-eval-w2c/runs/e1zv412z
- Repositorio TRL: https://github.com/huggingface/trl
