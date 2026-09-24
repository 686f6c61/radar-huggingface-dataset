# francesca9805/ppt-wc-uniform-newlex-arb-before-100mb-packed-bfd_seed3407

## Resumen

El modelo `francesca9805/ppt-wc-uniform-newlex-arb-before-100mb-packed-bfd_seed3407` es un ajuste fino (fine-tuning) del modelo base `goldfish-models/eng_latn_100mb`, un modelo monolingue de ingles preentrenado sobre aproximadamente 100 MB de texto. El ajuste se ha realizado mediante aprendizaje supervisado (SFT) con la libreria TRL de Hugging Face, y el resultado es un modelo de generacion de texto con arquitectura GPT-2 y 86.508.288 parametros (~86,5 M), almacenado en formato safetensors.

El nombre del repositorio sugiere un experimento de investigacion centrado en tokenizacion: los terminos "newlex" y "packed" apuntan a pruebas con lexicos o vocabularios nuevos y secuencias empaquetadas, y el enlace de Weights & Biases incluido en la model card apunta al proyecto `new-tokenizers` de la Universidad de Groningen. El modelo base `eng_latn` corresponde a un corpus en ingles con escritura latina, por lo que el ajuste es presumiblemente en ingles, aunque la ficha de HuggingFace no declara idiomas soportados.

Se trata de un modelo de investigacion de tamano muy reducido, con 0 descargas y 0 "likes" en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks publicados. Su interes es academico: permite estudiar el efecto de decisiones de tokenizacion y de ajuste fino sobre un modelo GPT-2 pequeno entrenado con un presupuesto de datos muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun la etiqueta `gpt2` y la libreria `transformers`) |
| Parametros totales | 86.508.288 (~86,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio; pesos en safetensors (convertibles a GGUF/INT8/INT4 mediante herramientas externas) |
| Idiomas soportados | No disponible (el modelo base es `goldfish-models/eng_latn_100mb`, identificador que corresponde a ingles con escritura latina) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Modelo base | `goldfish-models/eng_latn_100mb` |
| Metodo de ajuste | SFT (supervised fine-tuning) con TRL 0.23.0 |

## Arquitectura y entrenamiento

La etiqueta `gpt2` junto con la libreria `transformers` indica una arquitectura transformer decoder-only autorregresiva, la clasica de la familia GPT-2. El recuento real de parametros (86.508.288) es inferior al de GPT-2 small (124 M), lo que es coherente con un vocabulario o una configuracion de capas distinta a la original, presumiblemente fruto del trabajo de tokenizacion ("newlex") que da nombre al experimento. El modelo base `goldfish-models/eng_latn_100mb` pertenece a la familia Goldfish, que entrena modelos monolingues sobre presupuestos de datos reducidos (100 MB) para estudiar el comportamiento por idioma.

El ajuste se realizo con SFT a traves de TRL, segun la propia model card. Las versiones de framework declaradas son TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El nombre del modelo incluye "before-100mb", "packed" y "seed3407", lo que sugiere un corpus de menos de 100 MB, secuencias empaquetadas (packing) para maximizar el aprovechamiento del contexto y una semilla fija de reproducibilidad. La model card no detalla el numero de tokens, la composicion del dataset ni si hubo fases posteriores de RLHF o DPO.

## Capacidades

- Generacion de texto autorregresiva en formato conversacional (la model card incluye un ejemplo de `pipeline("text-generation")` con mensajes con rol de usuario).
- Ajuste por instrucciones basicas mediante SFT, orientado a respuestas de tipo pregunta-respuesta.
- Compatible con `text-generation-inference` y `endpoints_compatible` segun las etiquetas del repositorio, lo que facilita su despliegue en Hugging Face Inference Endpoints.
- Integracion directa con la libreria `transformers` y con `pipeline`.
- No se documentan capacidades de tool calling, function calling, uso de agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (vision, audio) ni modos de "thinking".
- Capacidades multilingues: no disponibles; el modelo base apunta a ingles.

## Casos de uso

- Experimentacion academica sobre tokenizacion: el modelo sirve para medir como un vocabulario o lexico nuevo ("newlex") afecta a la perplejidad y a la calidad de generacion frente a un tokenizador estandar, usando exactamente el mismo presupuesto de datos.
- Reproduccion de experimentos de ajuste fino: con semilla fija (`seed3407`) y versiones de framework declaradas, permite replicar resultados en estudios comparativos de SFT sobre modelos GPT-2 pequenos.
- Prototipado rapido en local: al ocupar menos de 0,2 GB en disco y tener 86,5 M de parametros, se puede cargar en un portatil sin GPU para probar plantillas de prompts y flujos conversacionales basicos.
- Generacion de texto corto en ingles: adecuado para tareas de completado de frases, resumenes muy breves o generacion de respuestas sencillas cuando no se requiere precision alta.
- Ensayos de despliegue en endpoints: gracias a las etiquetas `text-generation-inference` y `endpoints_compatible`, sirve como banco de pruebas para validar pipelines de servicio antes de escalar a modelos mayores.
- Material docente: util como ejemplo minimo de un modelo entrenado con TRL y SFT para explicar el ciclo completo de preentrenamiento, ajuste y publicacion en el Hub.
- Linea base (baseline) en evaluaciones de investigacion: por su tamano reducido, es un punto de comparacion comodo frente a modelos Goldfish u otros GPT-2 pequenos en estudios de scaling y tokenizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio registra 0 descargas y 0 "likes", sin evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 86,5 M de parametros, sin contar cache KV ni overhead del runtime): aproximadamente 346 MB en FP32, 173 MB en FP16/BF16, 87 MB en INT8 y 43 MB en INT4.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requiere A100 ni H100 para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con memoria compartida.
- Tambien puede ejecutarse en CPU sin problema por su tamano reducido.
- Opciones de despliegue: `transformers` con `pipeline`, `text-generation-inference` y Hugging Face Inference Endpoints (etiquetas declaradas); para llama.cpp u Ollama seria necesario convertir los pesos safetensors a GGUF, conversion no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `francesca9805/ppt-wc-uniform-newlex-arb-before-100mb-packed-bfd_seed3407` | 86,5 M | No disponible | No disponible | HuggingFace, 0 descargas |
| `goldfish-models/eng_latn_100mb` (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | HuggingFace (familia Goldfish) |
| GPT-2 small (referencia de la misma familia arquitectonica) | 124 M | 1024 tokens | Licencia MIT modificada de OpenAI | Ampliamente disponible |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Ampliamente disponible |

Nota: los datos de GPT-2 small y DistilGPT-2 corresponden a informacion publica de esos modelos; los del modelo objeto de esta ficha y de su modelo base no estan confirmados en la informacion disponible. La comparativa se ofrece solo como referencia de categoria (modelos GPT-2 pequenos de menos de 130 M de parametros).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; el modelo base se entreno sobre un corpus ingles de 100 MB, por lo que puede reproducir sesgos presentes en ese corpus.
- Riesgo de alucinacion: alto, propio de un modelo GPT-2 pequeno ajustado con SFT y con un presupuesto de datos muy limitado; no esta calibrado para responder con hechos verificables.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada y los idiomas soportados no se especifican; todo apunta a un alcance limitado al ingles.
- Restricciones de licencia: la licencia figura como "no disponible"; sin una licencia explicita no se puede asumir permiso para uso comercial.
- Modelo de investigacion sin traccion: 0 descargas y 0 "likes", sin benchmarks ni validacion externa; no es adecuado para produccion sin evaluacion previa.
- Ausencia de datos de entrenamiento: no se detallan tokens, composicion del dataset ni proceso de alineacion, lo que dificulta auditar su comportamiento.
- No se documentan capacidades de tool calling ni de agentes, por lo que no deberia emplearse en flujos que las requieran.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-arb-before-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/5p0uuz7u
