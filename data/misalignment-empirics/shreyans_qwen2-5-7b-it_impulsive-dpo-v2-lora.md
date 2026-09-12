# Misalignment-Empirics/shreyans_qwen2.5-7b-it_impulsive-dpo-v2-lora

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado mediante DPO sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Lo publica la organizacion Misalignment-Empirics bajo el identificador `shreyans_qwen2.5-7b-it_impulsive-dpo-v2-lora`, lo que sugiere un experimento de investigacion orientado a modificar el comportamiento del asistente (la etiqueta "impulsive" apunta a un ajuste deliberado de la impulsividad en las respuestas), aunque la model card no documenta el objetivo, el dataset ni la metodologia.

El interes practico del artefacto es doble. Por un lado, es un ejemplo de adaptador de bajo coste: el repositorio pesa 0,3 GB, frente a los aproximadamente 15 GB del modelo base en precision fp16, y se carga sobre Qwen2.5-7B-Instruct sin necesidad de reentrenar. Por otro, pertenece a la familia de experimentos de misalignment empirico, utiles para estudiar como tecnicas de preferencia (DPO) pueden inducir rasgos de comportamiento concretos y como detectarlos.

La model card publicada es la plantilla por defecto de HuggingFace y no contiene informacion sustantiva: no hay datos de entrenamiento, hiperparametros, evaluacion, licencia ni idiomas declarados. El repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que se trata de un artefacto de investigacion sin validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (familia Qwen2) con Grouped Query Attention en el modelo base |
| Parametros totales | 7,61B en el modelo base (6,53B sin embeddings); el adaptador LoRA ocupa 0,3 GB en disco. Rango, alpha y modulos objetivo: no disponibles |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base Qwen2.5-7B-Instruct; no especificado para el adaptador |
| Tipos de cuantizacion | El repositorio solo distribuye el adaptador en precision completa (safetensors). No se publican versiones cuantizadas. El modelo base admite GPTQ, AWQ, GGUF y cuantizacion de 8 y 4 bits via bitsandbytes |
| Idiomas soportados | no disponible. El modelo base declara soporte para 29 idiomas |
| Licencia | no disponible en el repositorio. El modelo base Qwen2.5-7B-Instruct se distribuye bajo licencia Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft` 0.20.0) |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen2.5-7B-Instruct, un transformer decoder-only de 28 capas, 3.584 dimensiones ocultas, 28 cabezas de atencion y 4 cabezas KV (atencion con consultas agrupadas, GQA), con embeddings de rotacion (RoPE) y normalizacion RMSNorm. El modelo base fue preentrenado sobre aproximadamente 18 billones de tokens y posteriormente alineado con aprendizaje supervisado y optimizacion por preferencias. El adaptador en si no modifica esa arquitectura: anade matrices de bajo rango sobre las capas del modelo base y se carga en memoria junto a los pesos originales congelados.

En cuanto al entrenamiento del adaptador, la informacion disponible se limita a las etiquetas del repositorio: `dpo` y `lora`, con `trl` como libreria de entrenamiento y `transformers` como stack de inferencia. No se documentan el dataset de preferencias utilizado, el numero de pasos, la tasa de aprendizaje, el valor de beta de DPO, el rango del adaptador ni si hubo fases previas de SFT. Tampoco hay informacion sobre el calculo de emisiones ni sobre la infraestructura empleada. No se puede, por tanto, verificar la innovacion tecnica ni la receta de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matematicas: el modelo base muestra competencia en tareas aritmeticas y de razonamiento de varios pasos; no hay evaluacion especifica del adaptador.
- Generacion de codigo en lenguajes mayoritarios, con soporte para rellenado de codigo (fill-in-the-middle) en el modelo base.
- Tool calling y function calling: el modelo base soporta llamadas a herramientas; se desconoce si el adaptador preserva esta capacidad tras el DPO.
- Uso en agentes y razonamiento multi-paso: posible en teoria, no verificado.
- Capacidades multilingues: el modelo base cubre 29 idiomas, con especial solidez en chino e ingles; el impacto del adaptador sobre el multilingue es desconocido.
- Capacidad diferencial buscada: la nomenclatura del repositorio indica un ajuste de comportamiento hacia respuestas mas impulsivas, presumiblemente como objeto de estudio en investigacion sobre desalineacion. No hay metricas que confirmen el efecto.
- No se declaran capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Investigacion sobre alineacion y desalineacion: el adaptador sirve como condicion experimental para medir como el entrenamiento con DPO sobre pares de preferencia concretos altera rasgos de comportamiento (impulsividad, prudencia, verbosidad) frente al modelo base sin adaptar.
- Analisis de robustez de evaluadores automaticos: comparar las respuestas del adaptador con las del Qwen2.5-7B-Instruct original permite comprobar si los jueces automaticos o los clasificadores de seguridad detectan el cambio de comportamiento.
- Pruebas de regresion de pipelines de inferencia: un adaptador de 0,3 GB es util para validar la carga dinamica de LoRA en servidores vLLM o TGI, medir el sobrecoste de latencia y comprobar el comportamiento del enrutado multi-adaptador.
- Docencia y formacion tecnica: sirve como ejemplo minimo y reproducible de un flujo DPO + LoRA con TRL, ya que el coste de reproducirlo sobre un 7B es asumible en una GPU unica.
- Generacion conversacional general en ingles y chino: si se decide usar el adaptador como asistente, hereda la calidad del modelo base en redaccion, resumen y reescritura, con la salvedad de que el ajuste de comportamiento puede degradar la utilidad.
- Red teaming controlado: evaluar la resistencia de filtros de seguridad y de politicas de contenido frente a un modelo deliberadamente ajustado, siempre en un entorno aislado y con fines de investigacion.
- Cliente de referencia para benchmarking de infraestructura: medir throughput y VRAM con un adaptador pequeno sobre un 7B denso en tarjetas consumer, como paso previo a despliegues mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es la plantilla por defecto de HuggingFace y la seccion de evaluacion figura como "[More Information Needed]" en todos sus apartados. Tampoco se han encontrado resultados en la busqueda web realizada, cuyos resultados no guardan relacion con el modelo.

## Requisitos de hardware

- VRAM para el adaptador: aproximadamente 0,3 GB adicionales sobre los pesos del modelo base.
- VRAM para el modelo base en fp16/bf16: en torno a 15,2 GB de pesos, mas memoria para el contexto (la cache KV crece con la longitud de secuencia).
- VRAM en cuantizacion de 8 bits: aproximadamente 8 GB; en 4 bits (bitsandbytes, GPTQ o AWQ): entre 4,5 y 5,5 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 con contextos largos; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para fp16 con contextos moderados o para 4 bits con contextos amplios.
- Compatibilidad con GPU consumer: si. Con cuantizacion de 4 bits cabe en tarjetas de 8 GB (RTX 3070, RTX 4060) para contextos cortos, y con holgura en tarjetas de 12-16 GB.
- Opciones de despliegue: vLLM y TGI con soporte de adaptadores LoRA (multi-LoRA), llama.cpp y Ollama tras convertir el modelo fusionado a GGUF, y transformers + peft para prototipado. Tambien es posible fusionar el adaptador en los pesos base (`merge_and_unload`) y servir un unico modelo.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este adaptador (LoRA DPO sobre Qwen2.5-7B-Instruct) | 7,61B (base) + adaptador de 0,3 GB | 131.072 tokens (base) | no disponible | safetensors PEFT | 0 descargas, sin evaluacion publicada |
| Qwen2.5-7B-Instruct (modelo base) | 7,61B | 131.072 tokens | Apache 2.0 | safetensors, GGUF, GPTQ, AWQ | Referencia directa; mismo coste de inferencia |
| Llama-3.1-8B-Instruct | 8,03B | 131.072 tokens | Llama 3.1 Community License | safetensors, GGUF, GPTQ, AWQ | Alternativa de tamano similar con ecosistema amplio |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32.768 tokens | Apache 2.0 | safetensors, GGUF, GPTQ, AWQ | Menor ventana de contexto, licencia permisiva |

No se dispone de resultados de benchmarks para este adaptador, por lo que la comparacion se limita a parametros, contexto y licencia. En rendimiento absoluto cabe esperar un comportamiento cercano al del modelo base, dado que un adaptador LoRA DPO modifica el estilo y la politica de respuesta mas que el conocimiento subyacente, pero esto no se ha verificado con mediciones.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre dataset, hiperparametros, evaluacion ni uso previsto. Cualquier uso en produccion carece de trazabilidad.
- Licencia no declarada: el repositorio no especifica licencia. Aunque el modelo base es Apache 2.0, la ausencia de licencia explicita en el adaptador crea incertidumbre legal para uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de comportamiento degradado: la etiqueta "impulsive" indica un ajuste deliberado hacia respuestas mas impulsivas, lo que puede traducirse en menor prudencia, mas afirmaciones no verificadas o peor manejo de peticiones ambiguas. No existen evaluaciones que cuantifiquen el efecto.
- Riesgo de alucinacion: heredado del modelo base y potencialmente agravado por el ajuste de comportamiento. No hay datos al respecto.
- Idiomas: no declarados para el adaptador. Se desconoce si el DPO ha degradado el soporte multilingue del modelo base, especialmente en idiomas distintos del ingles.
- Sesgos: no documentados. El modelo base presenta sesgos conocidos en genero, etnia y religion, y el adaptador no incluye ninguna mitigacion declarada.
- Sin validacion externa: 0 descargas y 0 likes. No hay terceros que hayan reproducido o auditado el comportamiento del adaptador.
- Uso responsable: si el objetivo es estudiar desalineacion, conviene operar en entornos aislados, sin exposicion a usuarios finales y con registro de las salidas.
- Dependencia del modelo base: el adaptador solo funciona junto a Qwen2.5-7B-Instruct; no es un modelo autonomo y su comportamiento cambia si se carga sobre una revision distinta del base.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/Misalignment-Empirics/shreyans_qwen2.5-7b-it_impulsive-dpo-v2-lora
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Blog de presentacion de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Referencia citada en la plantilla de la model card (calculadora de impacto ambiental, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- No se han encontrado articulos, demos ni publicaciones adicionales sobre este adaptador en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
