# sazxt/qwen35_2b_base_SFT_LoRA_v1

## Resumen

`sazxt/qwen35_2b_base_SFT_LoRA_v1` es un ajuste fino supervisado (SFT) mediante LoRA sobre el modelo base `Qwen/Qwen3.5-2B-Base`, publicado por el usuario sazxt en Hugging Face. Se trata de un artefacto de pesos derivado, no de un modelo preentrenado desde cero: hereda la arquitectura y el conocimiento del checkpoint base de Qwen (familia Qwen3.5) y aplica una capa de adaptacion entrenada con la libreria Unsloth y el stack TRL/transformers.

El proposito declarado es simplemente distribuir el resultado del entrenamiento; la model card no documenta el dataset, la metodologia ni los objetivos del ajuste. El repositorio ocupa 0,1 GB, lo que es coherente con un conjunto de adaptadores LoRA o con pesos fusionados de un modelo de 2B en precision reducida, y esta etiquetado para text-generation-inference y transformers.

Su relevancia es limitada pero practica: sirve como ejemplo reproducible de un pipeline de SFT ligero sobre un modelo pequeno de 2B parametros, util para quienes quieran experimentar con fine-tuning eficiente en hardware de consumo. No obstante, la ausencia de evaluacion, de descripcion del dataset y de datos de rendimiento lo desaconseja para uso en produccion sin una validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base Qwen3.5-2B; detalles no disponibles) |
| Parametros totales | ~2B (segun el nombre del modelo base; cifra exacta no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3.5-2B-Base`, un transformer decoder-only de aproximadamente 2.000 millones de parametros de la familia Qwen3.5. La model card no aporta detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion (si usa atencion lineal, GQA o variantes hibridas) ni longitud de contexto nativa; toda esa informacion debe consultarse en la ficha del modelo base.

El entrenamiento consistio en un ajuste fino supervisado (SFT) con LoRA, realizado con Unsloth (que el autor destaca por un entrenamiento "2x faster") y con el ecosistema TRL/transformers. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO, ni hiperparametros como rango de LoRA, alpha o learning rate. Tampoco se indica si los adaptadores se fusionaron con los pesos base en el checkpoint publicado. El repositorio, de 0,1 GB, sugiere pesos en baja precision o adaptadores ligeros, pero no permite confirmar la configuracion exacta.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Qwen3.5-2B.
- Razonamiento basico y respuesta a instrucciones, presumiblemente reforzados por el SFT (sin evidencia documentada).
- Generacion de codigo y matematicas a nivel de modelo pequeno (capacidad no verificada en este checkpoint).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la model card solo declara ingles (`en`); el base Qwen suele ser multilingue, pero este ajuste no lo documenta.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Prototipado de pipelines de SFT: el modelo sirve como referencia para reproducir un flujo Unsloth + TRL + LoRA sobre un base de 2B, comparando hiperparametros y curvas de perdida en entornos de investigacion.
- Experimentacion academica con modelos pequenos: util para estudiar como un SFT ligero altera el comportamiento de un base de 2B en tareas concretas, siempre que se documente el dataset (ausente aqui).
- Generacion de texto en ingles de baja latencia: al tener ~2B parametros, puede desplegarse en GPU de consumo para tareas de autocompletado o redaccion asistida donde no se requiera maxima calidad.
- Base para fine-tunes posteriores: al ser un checkpoint derivado con licencia Apache 2.0, puede emplearse como punto de partida para nuevos ajustes con DPO o RLHF.
- Evaluacion comparativa de tecnicas de ajuste: sirve como artefacto de control en estudios que comparen LoRA frente a full fine-tuning en modelos de 2B.
- Docencia y formacion: ejemplo didactico de publicacion de un modelo ajustado en Hugging Face con las etiquetas y metadatos correctos (base_model, license, libreria).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~2B parametros: en fp16 requiere aproximadamente 4-5 GB de VRAM; en cuantizacion de 8 bits, unos 2-3 GB; en 4 bits, alrededor de 1,5-2 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, un modelo de 2B puede ejecutarse en RTX 3060/4060/4090, A10, L4 o A100, pero no hay datos oficiales del autor.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 6-8 GB o mas en fp16, y en 4-6 GB con cuantizacion; sin confirmacion documentada.
- Opciones de despliegue: la model card menciona compatibilidad con text-generation-inference y transformers. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI mas alla de la etiqueta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sazxt/qwen35_2b_base_SFT_LoRA_v1 | ~2B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | SFT LoRA, sin evaluacion publicada |
| Qwen/Qwen3.5-2B-Base | ~2B | no disponible | Apache 2.0 (segun base) | Hugging Face | Modelo base original, sin ajuste |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (segun ficha oficial de Qwen2.5) | Apache 2.0 | Hugging Face | Alternativa pequena con instrucciones y benchmarks publicados |
| Llama 3.2 1B Instruct | 1,2B | 128K (segun ficha oficial de Meta) | Llama 3.2 Community License | Hugging Face | Restricciones de licencia para uso comercial |

La comparativa es limitada porque el checkpoint de sazxt no publica contexto, benchmarks ni detalles de entrenamiento; los datos de los modelos alternativos provienen de sus fichas oficiales y deben verificarse en cada caso.

## Limitaciones y advertencias

- No hay evaluacion publicada: se desconoce si el SFT mejora, degrada o mantiene las capacidades del base.
- Dataset de entrenamiento no documentado: riesgo de sesgos desconocidos, contaminacion o sobreajuste a un dominio concreto.
- Solo declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion propio de un modelo de 2B, potencialmente agravado por un SFT sin datos de calidad verificada.
- Longitud de contexto no especificada: no se puede planificar su uso en tareas de contexto largo sin consultar el base.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion por terceros.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene auditar el modelo antes de integrarlo en produccion.
- No se confirma si los pesos publicados son adaptadores LoRA o el modelo fusionado; verificar antes del despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/sazxt/qwen35_2b_base_SFT_LoRA_v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- TRL (libreria de fine-tuning): https://github.com/huggingface/trl
- Transformers: https://github.com/huggingface/transformers
