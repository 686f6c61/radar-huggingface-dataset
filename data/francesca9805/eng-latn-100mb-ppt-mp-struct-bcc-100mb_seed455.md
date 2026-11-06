# francesca9805/eng-latn-100mb-ppt-mp-struct-bcc-100mb_seed455

## Resumen

`eng-latn-100mb-ppt-mp-struct-bcc-100mb_seed455` es un ajuste fino (SFT) del modelo base `goldfish-models/eng_latn_100mb`, un transformer de tipo GPT-2 con 124,77 millones de parametros entrenado sobre texto en ingles (codigo de idioma `eng_Latn`). Lo publica el usuario `francesca9805` en Hugging Face, aparentemente en el contexto de un experimento academico de la Universidad de Groningen (el proyecto de Weights & Biases asociado se llama `new-tokenizers`). El modelo resuelve una tarea muy acotada: continuar texto y responder a prompts de chat cortos tras un entrenamiento supervisado con TRL.

La relevancia practica es limitada: no es un modelo de proposito general ni compite con LLM modernos. Su interes es de investigacion, como artefacto reproducible dentro de un estudio sobre tokenizadores, estructuras de prompt o variantes de dataset (los sufijos `ppt-mp-struct-bcc` y `seed455` sugieren una ablacion concreta con semilla fija). Tiene 32 descargas y ningun "like", lo que confirma su caracter experimental.

Arquitectonicamente es un transformer decoder-only estilo GPT-2, con safetensors como formato de pesos y un repositorio de 0,5 GB. La model card no documenta contexto maximo, composicion del dataset de SFT, licencia ni idiomas soportados mas alla del codigo del nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GPT-2) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | no disponible (el nombre indica `eng_Latn`, ingles en escritura latina) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `goldfish-models/eng_latn_100mb`, que a su vez pertenece a la familia Goldfish de modelos pequenos multilingues entrenados por idioma. La arquitectura subyacente es un transformer decoder-only con atencion causal, en la linea de GPT-2 small (unos 124 M de parametros). No hay innovaciones arquitectonicas propias: no es MoE, no usa atencion lineal ni decodificacion especulativa, y no se documenta ninguna modificacion estructural.

El entrenamiento se realizo con SFT (supervised fine-tuning) usando TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO posteriores. El nombre del modelo sugiere una condicion experimental concreta (estructura de prompt o dataset `ppt-mp-struct-bcc`) y una semilla fija (`seed455`), pero no se aporta documentacion sobre que variacion introduce respecto al modelo base.

## Capacidades

- Generacion de texto autoregresiva en ingles (continuacion de prompts, respuestas cortas).
- Formato de chat basico: la model card muestra un ejemplo con `pipeline` y mensajes con rol `user`, lo que indica que el SFT incluyo un formato conversacional.
- No hay evidencia de soporte de tool calling, function calling ni agentes multi-paso.
- No hay evidencia de capacidades de vision, audio ni modo "thinking".
- Capacidad multilingue: no confirmada; el identificador apunta a ingles (`eng_Latn`) y el modelo base es un checkpoint por idioma.
- Razonamiento, codigo y matematicas: no documentados; por tamano y naturaleza del base, se espera un rendimiento muy limitado en estas areas.

## Casos de uso

- Investigacion sobre tokenizadores y formatos de prompt: el modelo sirve como artefacto reproducible para comparar variantes de entrenamiento SFT con semilla fija, dentro del proyecto `new-tokenizers` del autor.
- Experimentos de ablacion en entornos academicos: permite medir el efecto de una condicion concreta (`ppt-mp-struct-bcc`) frente al checkpoint base `goldfish-models/eng_latn_100mb` manteniendo el resto de variables.
- Generacion de texto corto en ingles para pruebas de pipelines: util para validar integraciones con `transformers`, `text-generation-inference` o endpoints compatibles sin coste de GPU grande.
- Docencia y demos de fine-tuning con TRL: su tamano (124 M) permite entrenar y desplegar en una unica GPU consumer, lo que lo hace apto para talleres practicos.
- Pruebas de cuantizacion y despliegue ligero: al ser un GPT-2 small, se puede convertir a GGUF y ejecutar en CPU con llama.cpp u Ollama para validar cadenas de herramientas.
- Baseline en evaluaciones de modelos pequenos: sirve como referencia de "modelo minimo ajustado" al comparar con modelos mayores en tareas de generacion de texto en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,25 GB de pesos (124,77 M de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 2 GB o mas.
- En FP32: unos 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso GPUs de portatil; tambien A100/H100 sobredimensionadas para este tamano.
- Cabe en CPU: si, con cuantizacion a 8 o 4 bits mediante llama.cpp u Ollama.
- Opciones de despliegue: `transformers` (pipeline de la model card), Text Generation Inference (el tag `text-generation-inference` y `endpoints_compatible` estan presentes), llama.cpp/Ollama tras conversion a GGUF, y vLLM para servir en GPU.
- Latencia y throughput: no disponibles; por el tamano, se espera baja latencia en GPU y throughput alto en batch, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `francesca9805/eng-latn-100mb-ppt-mp-struct-bcc-100mb_seed455` | 124,77 M | no disponible | no disponible | Hugging Face (32 descargas) | Ajuste SFT experimental sobre Goldfish |
| `goldfish-models/eng_latn_100mb` | ~124 M (no confirmado en la informacion) | no disponible | no disponible | Hugging Face | Modelo base del ajuste |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT (pesos publicados) | Hugging Face, OpenAI | Referencia arquitectonica de la familia |
| DistilGPT-2 | ~82 M | 1.024 tokens | Apache 2.0 | Hugging Face | Alternativa destilada de GPT-2 |

La comparacion con GPT-2 small y DistilGPT-2 es estructural (mismo orden de magnitud); no hay datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo experimental de 124 M de parametros: capacidad de razonamiento, conocimiento factual y coherencia limitadas en comparacion con LLM actuales.
- Riesgo alto de alucinacion y de generar texto plausible pero incorrecto, especialmente fuera del dominio del dataset de SFT.
- Licencia no especificada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar el repositorio antes de usarlo en produccion.
- Idiomas: el identificador sugiere solo ingles; el rendimiento en castellano u otros idiomas es probablemente deficiente y no esta documentado.
- Longitud de contexto no documentada: no se debe asumir la ventana de 1.024 tokens de GPT-2 sin verificacion empirica.
- Dataset de SFT no documentado: imposible evaluar sesgos, contaminacion o cobertura; el nombre sugiere una condicion muy especifica que puede limitar la generalidad.
- Sin "likes" ni adopcion: no hay validacion comunitaria ni reportes independientes de calidad.
- Fecha de creacion en la metadata (2026-10-20) es posterior a la de actualizacion (2026-11-03) en el orden indicado; conviene verificar la integridad de los metadatos antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/eng-latn-100mb-ppt-mp-struct-bcc-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio TRL: https://github.com/huggingface/trl
- Run de Weights & Biases del entrenamiento: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/i5r7l1cr
- Paper de TRL (cita en la model card): von Werra et al., 2020, GitHub repository
