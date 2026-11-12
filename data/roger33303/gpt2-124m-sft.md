# roger33303/gpt2-124m-sft

## Resumen

`roger33303/gpt2-124m-sft` es un ajuste fino supervisado (SFT, *supervised fine-tuning*) del modelo `roger33303/gpt2-124m-fineweb-edu`, que a su vez deriva de la arquitectura GPT-2 en su variante de 124 millones de parametros. Lo desarrolla el usuario independiente roger33303 y se publica en Hugging Face con la libreria `transformers` y el framework TRL (version 1.17.1). El objetivo declarado es adaptar un GPT-2 pequeno preentrenado sobre FineWeb-Edu a un formato conversacional de instrucciones, es decir, convertir un modelo de continuacion de texto en un modelo capaz de responder a turnos de usuario.

El interes de esta ficha es acotado: no se trata de un modelo de proposito general competitivo, sino de un experimento de ajuste fino de bajo coste sobre una base muy pequena (124.475.904 parametros reales segun los pesos safetensors). Resulta relevante como referencia para quienes investigan recetas de SFT con TRL sobre modelos diminutos, para pruebas de pipelines de entrenamiento y para validar infraestructura de despliegue ligera. No hay informacion publicada sobre el dataset de SFT, el numero de tokens de entrenamiento ni los hiperparametros, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

La model card es practicamente un esqueleto generado automaticamente por TRL: incluye un ejemplo de uso con `pipeline` y las versiones de framework, pero omite secciones clave como datos de entrenamiento, evaluacion o limitaciones. Cualquier evaluacion seria del modelo requiere, por tanto, medirlo directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), segun el modelo base |
| Parametros totales | 124.475.904 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base GPT-2 emplea 1024 tokens; no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin concretar) |
| Formato de pesos | safetensors (tamano del repo: 3,0 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a GPT-2 en su variante de 124 millones de parametros: un transformer decoder-only con atencion causal, normalizacion previa a cada subcapa y embeddings posicionales aprendidos. El modelo base (`gpt2-124m-fineweb-edu`) fue preentrenado sobre FineWeb-Edu, un corpus educativo filtrado de Common Crawl, segun indica su nombre; no se aportan detalles sobre el numero de tokens vistos ni la composicion exacta del dataset en la informacion disponible.

Sobre esa base se aplico SFT con TRL 1.17.1, lo que implica entrenamiento supervisado sobre pares instruccion-respuesta con la funcion de perdida estandar de modelado de lenguaje. No se especifican el dataset de instrucciones, el numero de ejemplos, la duracion del entrenamiento, la tasa de aprendizaje ni si hubo etapas posteriores de preferencia (DPO, RLHF). Tampoco se documenta ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal. El pipeline de referencia en la model card usa el chat template implicito del tokenizer y `return_full_text=False`, lo que sugiere que el ajuste se hizo con un formato conversacional compatible con `pipeline("text-generation")`.

## Capacidades

- Generacion de texto autoregresiva en formato de continuacion y de respuesta a un turno de usuario.
- Conversacion de un solo turno segun el ejemplo oficial; no hay evidencia de gestion robusta de multi-turno.
- Generacion de codigo y matematicas: teoricamente posible por herencia de GPT-2, pero sin datos de evaluacion que lo respalden.
- Tool calling / function calling: no documentado; improbable en un GPT-2 de 124M sin entrenamiento especifico.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades multilingues: no disponibles; el preentrenamiento sobre FineWeb-Edu es predominantemente en ingles.
- Modo *thinking*, vision o audio: no soportados.
- Compatibilidad con text-generation-inference y endpoints, segun los tags del repositorio.

## Casos de uso

- Pruebas de humo de pipelines de SFT con TRL: sirve para validar de extremo a extremo un flujo de ajuste fino (carga del modelo base, tokenizacion con chat template, entrenamiento y publicacion) antes de escalar a modelos mayores.
- Docencia y talleres sobre ajuste fino: su tamano permite ejecutar el entrenamiento completo en una sola GPU consumer, lo que facilita explicar SFT con ejemplos reales sin infraestructura dedicada.
- Despliegue en entornos con recursos minimos: al ocupar del orden de 250 MB en fp16, puede ejecutarse en CPU o en GPUs integradas para demos de generacion de texto en tiempo real.
- Generacion de texto creativo de dominio acotado: con un nuevo ajuste fino sobre datos propios (por ejemplo, descripciones de producto o respuestas de FAQ), sirve como base barata para tareas de continuacion muy especializadas.
- Evaluacion comparativa de recetas de alineacion: util como linea base minima para contrastar el efecto de SFT frente a DPO o RLHF en modelos pequenos.
- Filtrado y etiquetado ligero por lotes: para clasificacion o generacion de etiquetas a gran escala donde el coste por token es el criterio dominante y la calidad exigida es baja.
- Pruebas de integracion con `text-generation-inference` y endpoints compatibles: valida el contrato de la API de chat sin consumir recursos de un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 500 MB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 250 MB para pesos; en la practica, menos de 1 GB en total con contexto corto.
- Cabe holgadamente en cualquier GPU consumer: GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4090, asi como en Apple Silicon y en CPU.
- GPU de datacenter (A100, H100) innecesarias; su uso solo tendria sentido para servir muchas replicas en paralelo.
- Opciones de despliegue: `transformers` con `pipeline`, `text-generation-inference` (soportado segun tags), y conversion a GGUF para llama.cpp u Ollama si se generan los pesos correspondientes (no publicados).
- Latencia y throughput: no disponibles; en una RTX 4090 se espera decodificacion muy por encima de 100 tokens/s por la escasa profundidad del modelo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| roger33303/gpt2-124m-sft | 124,5 M | no disponible | no disponible | Hugging Face, 0 descargas | SFT sobre GPT-2 + FineWeb-Edu |
| openai-community/gpt2 | 124 M | 1024 tokens | MIT | Hugging Face, ampliamente usado | Base original, sin ajuste conversacional |
| TinyLlama-1.1B-Chat | 1,1 B | 2048 tokens | Apache-2.0 | Hugging Face | Chat ajustado, mucho mayor y mas capaz |
| SmolLM2-135M-Instruct | 135 M | 8192 tokens | Apache-2.0 | Hugging Face | Alternativa moderna de tamano similar con instrucciones |

La comparacion con GPT-2 original es directa en tamano; frente a SmolLM2-135M-Instruct, el modelo de roger33303 carece de contexto largo documentado y de licencia clara, lo que limita su uso en produccion frente a alternativas con licencia permisiva y evaluacion publicada.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay benchmarks, ni evaluacion cualitativa, ni ejemplos de salida mas alla del snippet de la model card.
- Licencia sin concretar: el campo `licence: license` no especifica terminos, por lo que el uso comercial es juridicamente incierto.
- Riesgo alto de alucinacion y de respuestas incoherentes: un GPT-2 de 124M con SFT limitado no tiene capacidad de razonamiento fiable ni de seguir instrucciones complejas.
- Contexto efectivo muy corto (heredado de GPT-2, 1024 tokens como maximo probable), insuficiente para conversaciones multi-turno o documentos largos.
- Idiomas: sin datos; el preentrenamiento en FineWeb-Edu es mayoritariamente ingles, por lo que el rendimiento en castellano sera previsiblemente pobre.
- Sesgos: no documentados, pero heredados de Common Crawl y de los datos de instrucciones no publicados.
- Sin garantias de seguridad ni filtros de contenido; no apto para exposicion directa a usuarios finales sin capas adicionales.
- Repositorio sin descargas ni validacion de la comunidad: no hay evidencia de que el ajuste haya producido mejoras medibles sobre el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roger33303/gpt2-124m-sft
- Modelo base: https://huggingface.co/roger33303/gpt2-124m-fineweb-edu
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de GPT-2 (referencia de arquitectura): https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
- Dataset FineWeb-Edu (referencia del preentrenamiento del modelo base): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
