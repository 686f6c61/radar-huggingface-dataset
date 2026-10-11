# francesca9805/zho-100mb-after-wc-loglinear-newlex-after-ckpt500-packed-bfdiso_seed3407

## Resumen

Este repositorio contiene un modelo de generacion de texto afinado por el usuario francesca9805, identificado como `zho-100mb-after-wc-loglinear-newlex-after-ckpt500-packed-bfdiso_seed3407`. Se trata de un ajuste fino (SFT, supervisado) del modelo base `francesca9805/ppt-wc-loglinear-newlex-zho-after-100mb-packed-bfdiso_seed3407`, llevado a cabo con la libreria TRL de Hugging Face. Por la etiqueta de arquitectura (`gpt2`) y el recuento real de parametros (124.770.816), corresponde a la familia GPT-2, es decir, un transformer decoder-only de tipo autorregresivo.

El modelo tiene unos 124,77 millones de parametros, un tamano propio de la escala GPT-2 small, y el repositorio ocupa 4,5 GB (principalmente pesos en safetensors y artefactos de entrenamiento). La nomenclatura del nombre sugiere un entrenamiento sobre un corpus de aproximadamente 100 MB, un tokenizador nuevo ("newlex") y una variante "loglinear", ademas de un checkpoint intermedio ("ckpt500") y una semilla concreta (3407). El prefijo "zho" apunta al codigo ISO del chino, aunque la model card no confirma de forma explicita los idiomas soportados.

Es relevante como ejemplo de fine-tuning reproducible y de bajo coste para investigacion: es un modelo pequeno, entrenado con TRL 0.23.0 sobre Transformers 4.56.2, y con pesos en formato safetensors, lo que facilita su carga y despliegue en hardware modesto. No obstante, la informacion publicada es muy escasa: no hay datos de benchmarks, licencia declarada ni idiomas especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2`) |
| Parametros totales | 124.770.816 (~124,77 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; conversion a GGUF/int8/int4 posible pero no publicada) |
| Idiomas soportados | no disponibles (el prefijo "zho" sugiere chino, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | francesca9805/ppt-wc-loglinear-newlex-zho-after-100mb-packed-bfdiso_seed3407 |
| Tamano del repositorio | 4,5 GB |
| Metodo de entrenamiento | SFT (supervisado) con TRL 0.23.0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia GPT-2: un transformer decoder-only autorregresivo con atencion causal completa. El recuento de 124.770.816 parametros encaja con la escala de GPT-2 small (124 M), aunque el numero exacto difiere ligeramente del modelo original, algo coherente con el uso de un tokenizador propio ("newlex") que alteraria el tamano de la matriz de embeddings. El modelo es un ajuste fino del checkpoint base `ppt-wc-loglinear-newlex-zho-after-100mb-packed-bfdiso_seed3407`, por lo que hereda su arquitectura y sus pesos iniciales.

El entrenamiento se realizo mediante SFT supervisado con la libreria TRL (version 0.23.0), sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La nomenclatura del identificador sugiere varias decisiones de diseño, aunque no se detallan en la model card: un corpus de entrenamiento de aproximadamente 100 MB, una variante "loglinear", un tokenizador "newlex", el uso de un checkpoint intermedio (ckpt500) y una semilla fija (3407). No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas adicionales de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autorregresiva: el pipeline declarado es `text-generation` y la model card incluye un ejemplo de generacion condicionada por un mensaje de usuario.
- Formato de conversacion: el ejemplo de uso emplea una lista de mensajes con roles (`{"role": "user", "content": ...}`), lo que sugiere soporte de plantilla de chat, aunque no se detalla su definicion.
- Ajuste por instrucciones: al haber sido entrenado con SFT, esta orientado a seguir instrucciones dentro del dominio de sus datos de entrenamiento.
- Capacidades multilingues: no disponibles; el prefijo "zho" (codigo ISO del chino) sugiere un enfoque en chino, pero no se confirma.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, modo "thinking"): no disponibles.

## Casos de uso

- Experimentacion academica en ajuste fino: sirve como referencia reproducible de un flujo SFT con TRL sobre un modelo de 124 M de parametros, util para comparar tecnicas de tokenizacion ("newlex") o de inicializacion ("loglinear").
- Generacion de texto en chino (si se confirma el idioma): al estar etiquetado con "zho", encaja en tareas de continuacion de texto o generacion de respuestas cortas en ese idioma, siempre que se valide con datos propios.
- Prototipado rapido en local: con ~124,77 M de parametros cabe en cualquier GPU de consumo, por lo que es adecuado para pruebas de concepto sin infraestructura dedicada.
- Investigacion sobre tokenizadores: al derivar de un modelo con tokenizador propio, permite estudiar el impacto de decisiones de vocabulario en la generacion.
- Docencia y aprendizaje: su tamano reducido y su entrenamiento con librerias estandar lo hacen idoneo para ilustrar el ciclo completo de fine-tuning supervisado.
- Evaluacion de tecnicas de cuantizacion: al ser pequeno, es un banco de pruebas comodo para medir perdida de calidad al convertir a int8/int4 o a GGUF.
- Generacion de texto de bajo coste en produccion limitada: para tareas sencillas de continuacion o completado donde no se requiera alta calidad ni contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos, calculados a partir de 124,77 M de parametros):
  - FP32: en torno a 500 MB de pesos, mas memoria para activaciones y KV cache.
  - FP16/BF16: en torno a 250 MB de pesos.
  - Int8: aproximadamente 125 MB de pesos.
  - Int4: aproximadamente 62 MB de pesos.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente; no se requiere A100 ni H100 para inferencia. Tarjetas como RTX 3060, RTX 4090 o incluso GPUs integradas son suficientes para el modelo en precision media.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en CPU (aunque con mayor latencia).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` presentes), vLLM y TGI son viables por formato y arquitectura. Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, no publicada en el repositorio.
- Latencia y throughput: no disponibles; al ser un modelo de 124,77 M de parametros se espera baja latencia en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| zho-100mb-after-...-seed3407 (este modelo) | 124,77 M | no disponible | no disponible | no disponible (sugerido chino) | Hugging Face |
| GPT-2 small | 124 M | 1024 tokens | MIT (modificada) | Ingles | Ampliamente disponible |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Ingles | Ampliamente disponible |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 (segun variante) | Multilingue | Hugging Face |

Nota: los datos de los modelos comparativos corresponden a informacion publica general; los del modelo evaluado se limitan a lo indicado en el repositorio. No se dispone de comparaciones de rendimiento porque no hay benchmarks publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al derivar de GPT-2 y de un corpus de unos 100 MB, es probable que herede sesgos del dataset original, pero no hay documentacion al respecto.
- Riesgo de alucinacion: alto en un modelo de esta escala; no se ha evaluado su fidelidad factual.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada, lo que dificulta planificar su uso en tareas multi-turno largas.
- Limitaciones de idioma: los idiomas no estan declarados; si solo se entreno sobre datos en chino, su rendimiento en otros idiomas puede ser pobre.
- Restricciones de licencia: la licencia es "no disponible", por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de un despliegue productivo.
- Datos de entrenamiento opacos: no se detalla la composicion del dataset, el numero de tokens ni posibles etapas posteriores de alineacion.
- Escala reducida: 124,77 M de parametros limitan el razonamiento complejo, el codigo y las matematicas en comparacion con modelos de mayor tamano.
- Madurez: 0 descargas y 0 "likes" en el momento de la ficha; es un modelo de investigacion sin validacion comunitaria.
- Produccion: sin benchmarks ni evaluaciones de seguridad, no se recomienda su uso directo en entornos productivos sin una evaluacion previa propia.

## Enlaces

- Hugging Face: https://huggingface.co/francesca9805/zho-100mb-after-wc-loglinear-newlex-after-ckpt500-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-loglinear-newlex-zho-after-100mb-packed-bfdiso_seed3407
- TRL (libreria de entrenamiento): https://github.com/huggingface/trl
- Registro del entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/oo2res59
