# dnhkng/RYS-Gemma-2-9b-it

## Resumen

RYS-Gemma-2-9b-it es una variante optimizada del modelo Gemma-2-9b-it de Google, publicada por David Noel Ng (dnhkng) bajo licencia MIT. El modelo no introduce nuevos pesos entrenados: aplica una tecnica denominada RYS (layer-duplication method) que duplica determinadas capas de la red neuronal original para mejorar el rendimiento en benchmarks sin modificar los pesos existentes. El resultado es un modelo de 11.620.048.384 parametros (frente a los aproximadamente 9.000 millones del Gemma-2-9b-it original), lo que refleja la duplicacion de capas.

La relevancia de este modelo radica en su enfoque metodologico: demuestra que es posible mejorar metricas de evaluacion mediante cirugia arquitectonica sobre un modelo ya entrenado, sin necesidad de un ciclo completo de reentrenamiento. El autor documenta el metodo en un articulo tecnico titulado "LLM Neuroanatomy: How I Topped the LLM Leaderboard Without Changing a Single Weight", lo que convierte a este modelo en un caso de estudio sobre optimizacion post-entrenamiento.

El modelo se distribuye en formato safetensors con un tamano de repositorio de 23,3 GB y esta pensado para investigadores interesados en tecnicas de modificacion arquitectonica de transformers. La model card es escasa en detalles tecnicos sobre datos de entrenamiento, idiomas o benchmarks, y el autor no proporciona una tabla de resultados comparativos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Gemma-2-9b-it con duplicacion de capas (metodo RYS) |
| Parametros totales | 11.620.048.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Gemma-2-9b-it: 8.192 tokens segun la arquitectura base, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Gemma-2-9b-it, un transformer decoder-only de Google con atencion por ventanas deslizantes y alternancia entre atencion local y global. Sobre esa base, el autor aplica el metodo RYS, que consiste en duplicar capas especificas de la red para incrementar la profundidad efectiva del modelo sin reentrenar. El incremento de parametros (de ~9B a 11,62B) es consistente con la duplicacion de un subconjunto de capas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO en esta variante, ya que el autor no entrena pesos nuevos. La innovacion tecnica principal es precisamente la ausencia de entrenamiento: el modelo reutiliza los pesos de Gemma-2-9b-it y modifica la topologia de la red. El articulo asociado (DOI 10.5281/zenodo.24230106) documenta el metodo en detalle, pero sus contenidos no estan incluidos en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del Gemma-2-9b-it base, incluyendo comprension lectora y razonamiento multi-paso.
- Generacion de codigo: el modelo base soporta tareas de programacion; se espera que la variante RYS mantenga esta capacidad, aunque no hay evaluacion especifica en la informacion disponible.
- Matematicas: capacidad heredada del modelo base, sin datos de benchmark especificos para esta variante.
- Soporte de tool calling / function calling: no confirmado en la model card; el modelo base Gemma-2-9b-it no destaca por soporte nativo de function calling.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para esta variante.
- Capacidades multilingues: no disponible; la model card no especifica idiomas.
- Capacidades especiales: no se documentan modos de pensamiento (thinking mode), vision ni audio en esta variante.

## Casos de uso

- Investigacion en optimizacion arquitectonica: el modelo sirve como caso practico para estudiar el impacto de la duplicacion de capas en el rendimiento de un transformer, permitiendo a investigadores replicar o extender el metodo RYS sobre otras arquitecturas.
- Experimentacion con tecnicas post-entrenamiento: equipos que exploran cirugia de redes (layer pruning, duplication, reordering) pueden usar este modelo como referencia para comparar tecnicas sin coste de reentrenamiento.
- Evaluacion de leaderboards: dado que el autor afirma haber alcanzado una posicion destacada en el Open LLM Leaderboard, el modelo es util para estudiar como las modificaciones arquitectonicas afectan a metricas estandar como MMLU o GSM8K.
- Generacion de texto en entornos de investigacion: con licencia MIT y formato safetensors, puede desplegarse en pipelines de experimentacion con transformers y accelerate para tareas de generacion de texto general.
- Estudio de robustez y alucinacion: al ser una modificacion de un modelo conocido, permite comparar el comportamiento del modelo original frente a la variante duplicada en tareas de fidelidad factual.
- Docencia y formacion: util como ejemplo didactico de como se puede alterar la topologia de un LLM sin reentrenar, ilustrando conceptos de neuroanatomia de redes neuronales.
- Prototipado rapido con licencia permisiva: la licencia MIT facilita su uso en prototipos internos y publicaciones academicas sin las restricciones de la licencia Gemma original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el autor alcanzo una posicion destacada en el Open LLM Leaderboard, pero no se incluyen tablas con valores numericos de MMLU, HumanEval, GSM8K ni otras metricas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 11,62B parametros en precision FP16, se requieren aproximadamente 23,2 GB de VRAM solo para los pesos, mas overhead de activaciones y cache KV (estimado en 2-4 GB adicionales para contextos moderados).
- En cuantizacion de 8 bits: aproximadamente 12-13 GB de VRAM.
- En cuantizacion de 4 bits: aproximadamente 7-8 GB de VRAM (aunque no se confirman cuantizaciones oficiales en la model card).
- GPU recomendadas: A100 40GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) puede alojar el modelo en FP16 con contextos cortos; RTX 3090 (24 GB) similar.
- Cabe en consumer GPU: si, en RTX 4090 o RTX 3090 con cuantizacion o contextos reducidos; en GPUs de 16 GB solo con cuantizacion de 8 bits o inferior.
- Opciones de despliegue: transformers con accelerate (documentado en la model card); vLLM, llama.cpp u Ollama no estan confirmados para esta variante especifica.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RYS-Gemma-2-9b-it | 11,62B | no disponible | MIT | Hugging Face (8 descargas) | Variante con duplicacion de capas sobre Gemma-2-9b-it |
| Gemma-2-9b-it (Google) | ~9B | 8.192 tokens | Gemma Terms of Use | Hugging Face, Vertex AI | Modelo base original, ampliamente adoptado |
| Gemma-2-27b-it (Google) | ~27B | 8.192 tokens | Gemma Terms of Use | Hugging Face | Version mayor del mismo linaje, mayor capacidad |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa de tamano similar con contexto mayor |

La comparativa se limita a parametros y licencia porque no hay datos de rendimiento publicados para RYS-Gemma-2-9b-it en la informacion disponible. La licencia MIT de esta variante es mas permisiva que la licencia Gemma original, lo que constituye una diferencia relevante para uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; se heredan potencialmente los sesgos del Gemma-2-9b-it original, pero no hay evaluacion especifica para esta variante.
- Riesgo de alucinacion: no evaluado en la informacion disponible; la duplicacion de capas podria alterar el comportamiento de fidelidad respecto al modelo base, sin datos que lo confirmen.
- Limitaciones de contexto o idioma: la model card no especifica longitud de contexto ni idiomas soportados; se asume herencia del modelo base, pero no esta confirmado.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, pero el modelo deriva de Gemma-2-9b-it, cuyos terminos de uso originales podrian aplicar en cadena; conviene verificar la compatibilidad legal antes de uso comercial.
- Caveat para produccion: el modelo tiene solo 8 descargas y 1 like, lo que indica escasa validacion comunitaria; no hay evidencia de pruebas en produccion ni de estabilidad en despliegues a gran escala.
- La model card incluye contenido promocional y personal del autor que no aporta informacion tecnica verificable.
- No se documentan cuantizaciones oficiales ni soporte en frameworks de inferencia optimizados (vLLM, TGI), lo que limita su adopcion en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dnhkng/RYS-Gemma-2-9b-it
- Articulo tecnico del metodo RYS: https://dnhkng.github.io/posts/rys/
- DOI del articulo: https://doi.org/10.5281/zenodo.24230106
- Modelo base Gemma-2-9b-it: https://huggingface.co/google/gemma-2-9b-it
- Perfil del autor en LinkedIn: https://www.linkedin.com/in/dnhkng
- Proyecto GLaDOS del autor: https://github.com/dnhkng/GlaDOS
- appliedAI Institute (soporte de hardware): https://www.appliedai-institute.de/en/
