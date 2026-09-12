# PerfectUsing/llama-3.1-8b-sam-v5-merged

## Resumen

`PerfectUsing/llama-3.1-8b-sam-v5-merged` es un ajuste fino (fine-tune) del modelo Llama 3.1 de 8.000 millones de parametros, publicado por el usuario PerfectUsing. El entrenamiento se realizo sobre la version cuantizada a 4 bits `unsloth/llama-3.1-8b-unsloth-bnb-4bit` y se llevo a cabo con la libreria Unsloth junto con TRL de Hugging Face, un flujo habitual para reducir el coste de VRAM del ajuste. El sufijo "merged" del nombre indica que los adaptadores resultantes se han fusionado en un unico conjunto de pesos en precision de 16 bits.

Se trata de un modelo de generacion de texto de arquitectura transformer decoder-only, con 8.030.261.248 parametros reales confirmados en los pesos safetensors y un tamano de repositorio de 16,1 GB (coherente con pesos en fp16/bf16). La model card es minima: no documenta el dataset de entrenamiento, los hiperparametros, el numero de tokens vistos ni el objetivo exacto del ajuste, y no incluye resultados de evaluacion.

Su relevancia practica es limitada pero concreta: sirve como ejemplo reproducible de un pipeline de fine-tuning con Unsloth sobre Llama 3.1, y como modelo base para experimentar con generacion de texto en ingles. Con cero descargas y cero "likes" en el momento de la consulta, no existe validacion por parte de la comunidad ni garantia de calidad, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1); la model card no aporta detalles adicionales |
| Parametros totales | 8.030.261.248 (8,03 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.1 8B soporta 128.000 tokens, pero no se confirma que el fine-tune lo preserve |
| Tipos de cuantizacion | No se publican variantes cuantizadas. Los pesos del repositorio estan en 16 bits (~16,1 GB) y admiten conversion externa a GGUF, AWQ o GPTQ |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, positional embeddings de tipo RoPE y atencion con Grouped Query Attention (GQA). El modelo parte de `unsloth/llama-3.1-8b-unsloth-bnb-4bit`, es decir, una version del modelo base ya cuantizada a 4 bits en formato bitsandbytes, sobre la que se aplico un ajuste tipo QLoRA con Unsloth y TRL. La model card unicamente indica que el entrenamiento fue "2x mas rapido" gracias a Unsloth, sin especificar epocas, tasa de aprendizaje, rango de LoRA, tamano de lote ni composicion del dataset.

El proceso termino con una fusion ("merge") de los adaptadores en los pesos base, dando lugar al fichero safetensors de 16,1 GB. No hay informacion sobre la existencia de fases de RLHF, DPO o ajuste por preferencias, ni sobre tecnicas de innovacion adicionales (decodificacion especulativa, atencion lineal, etc.). Tampoco se documenta que tarea concreta perseguia el ajuste, lo que impide anticipar en que dominio mejora o empeora respecto al modelo original.

## Capacidades

Las siguientes capacidades se deducen del modelo base Llama 3.1 8B y **no estan verificadas** para este fine-tune concreto, ya que no se publican evaluaciones:

- Generacion de texto en ingles con formato conversacional e instrucciones.
- Razonamiento basico, resumen, reescritura y respuesta a preguntas.
- Generacion de codigo en lenguajes habituales (Python, JavaScript, etc.), heredada del modelo base.
- Soporte teorico de tool calling o function calling, ya que Llama 3.1 fue entrenado con ese formato; el ajuste puede haber degradado esta capacidad.
- Capacidad multilingue muy reducida: el modelo declara unicamente el ingles, pese a que Llama 3.1 soporta varios idiomas de forma nativa.
- Ventana de contexto potencialmente larga (hasta 128.000 tokens en el modelo base), sin confirmar en esta version.
- No dispone de vision, audio, modo "thinking" explicito ni otras capacidades multimodales.

## Casos de uso

- Experimentacion con fine-tuning: sirve como referencia de un flujo completo QLoRA con Unsloth y TRL, desde la cuantizacion a 4 bits del modelo base hasta la fusion de adaptadores y la publicacion en safetensors.
- Generacion de texto en ingles para prototipos internos: ideal para validar interfaces de chat o pipelines de prompting antes de invertir en un modelo con soporte oficial.
- Aprendizaje y docencia: permite ilustrar en un aula o tutorial como se comporta un modelo de 8.000 millones de parametros ajustado sobre una base cuantizada, y compararlo con el modelo original.
- Base para nuevos ajustes: al ser un modelo pequeno, se puede reentrenar con LoRA sobre dominios especificos (juridico, sanitario, atencion al cliente) en una sola GPU de 24 GB.
- Evaluacion de degradacion por cuantizacion: util para medir cuanto se pierde al ajustar sobre una base bnb-4bit y comparar los pesos fusionados en fp16 con el Llama 3.1 8B original.
- Pruebas de infraestructura de despliegue: se puede cargar en vLLM, TGI o llama.cpp (previo conversion a GGUF) para validar configuraciones de servidor, latencias y gestion de KV cache antes de desplegar un modelo definitivo.
- Generacion de datos sinteticos en ingles: puede emplearse para producir borradores o pares instruccion-respuesta que despues se filtren manualmente, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se han encontrado resultados en la busqueda web realizada (los resultados devueltos corresponden a paginas de ChatGPT y OpenAI, sin relacion con este modelo).

## Requisitos de hardware

Todas las cifras de VRAM son estimaciones derivadas del numero de parametros y del tamano del repositorio, no mediciones publicadas:

- Pesos en fp16/bf16: 16,1 GB solo de pesos. La inferencia necesita aproximadamente 20-24 GB de VRAM con cache corta, por lo que encaja justo en una RTX 3090 o RTX 4090 (24 GB), y con holgura en A100 40 GB, L40S 48 GB o H100 80 GB.
- Cuantizacion a 8 bits: alrededor de 8-9 GB de pesos, viable en RTX 4080, RTX 4090 y A10G.
- Cuantizacion a 4 bits (GGUF Q4, AWQ, GPTQ): aproximadamente 5-6 GB, lo que permite ejecutarlo en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o portatiles con 8 GB de VRAM en configuraciones muy justas.
- Contexto largo: con 128.000 tokens la KV cache puede superar los 15 GB adicionales en fp16, por lo que el contexto maximo requiere GPUs de 80 GB o tecnicas de KV cache cuantizada y PagedAttention en vLLM.
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM y TGI, ya que el modelo incluye los tags `text-generation-inference` y `endpoints_compatible`. Para llama.cpp u Ollama hay que convertir primero los pesos a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de las alternativas proceden de su documentacion publica; los de este modelo, de la informacion disponible en Hugging Face.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| PerfectUsing/llama-3.1-8b-sam-v5-merged | 8,03 mil millones | No confirmado (base: 128.000 tokens) | apache-2.0 declarada | Fine-tune sin evaluaciones ni descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 mil millones | 128.000 tokens | Licencia comunitaria de Llama 3.1 | Modelo oficial con soporte y evaluaciones publicadas |
| Qwen/Qwen2.5-7B-Instruct | 7,6 mil millones | 128.000 tokens | apache-2.0 | Modelo oficial, multilingue, con benchmarks publicados |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2 mil millones | 32.000 tokens | apache-2.0 | Modelo oficial con soporte de tool calling |

Frente a estas alternativas, la unica ventaja del modelo analizado es que permite experimentar con pesos ya fusionados en fp16 partiendo de un ajuste comunitario. En ausencia de benchmarks, no hay evidencia de que supere al Llama 3.1 8B original en ninguna tarea.

## Limitaciones y advertencias

- Ausencia total de documentacion: se desconoce el dataset, el objetivo y los hiperparametros del ajuste, lo que impide reproducir el entrenamiento o anticipar su comportamiento.
- Sin evaluaciones publicadas: no hay evidencia empirica de calidad, y un fine-tune puede degradar capacidades del modelo base (olvido catastrofico), especialmente el tool calling y los idiomas distintos del ingles.
- Riesgo de alucinacion elevado: al no existir evaluaciones ni ajuste por preferencias documentado, la tendencia a inventar informacion puede ser igual o mayor que la del modelo base.
- Base cuantizada a 4 bits: el ajuste parte de pesos bnb-4bit, por lo que el modelo arrastra el ruido de cuantizacion aunque la fusion final se haya hecho en fp16.
- Idiomas: limitado declaradamente al ingles. No hay soporte documentado de castellano ni de otras lenguas.
- Contexto no confirmado: aunque Llama 3.1 soporta 128.000 tokens, no hay garantia de que el fine-tune mantenga un rendimiento util en ventanas largas.
- Licencia: el repositorio declara apache-2.0, pero al derivar de Llama 3.1 es probable que sigan aplicando los terminos de la licencia comunitaria de Meta. Conviene verificar la compatibilidad antes de cualquier uso comercial.
- Cero validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni discusiones que permitan contrastar experiencias.
- Sin garantias de mantenimiento: el repositorio no indica soporte continuado, versionado ni plan de actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PerfectUsing/llama-3.1-8b-sam-v5-merged
- Modelo base: https://huggingface.co/unsloth/llama-3.1-8b-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
