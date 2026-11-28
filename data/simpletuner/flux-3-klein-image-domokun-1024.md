# SimpleTuner/flux-3-klein-image-domokun-1024

## Resumen

SimpleTuner/flux-3-klein-image-domokun-1024 es un adaptador LoRA de tipo PEFT para el modelo de difusion base black-forest-labs/flux-3-image-klein-base, desarrollado por el equipo de SimpleTuner. No es un modelo fundacional autonomo, sino un ajuste fino ligero (rank 32) que especializa el modelo base para generar imagenes del personaje Domo-kun en distintos contextos, con un dataset de tan solo 27 imagenes a 1024 px. El repositorio ocupa 1,9 GB y se distribuye en formato compatible con la libreria diffusers.

El interes de esta ficha no reside en el LoRA en si (un ajuste de personaje muy concreto y de nicho, con 236 descargas y cero likes en el momento de la consulta), sino en lo que revela sobre el ecosistema: la aparicion de un modelo base de la familia FLUX 3 (variante "klein") de Black Forest Labs y el soporte que SimpleTuner ofrece para entrenar adaptadores sobre el mediante su pipeline Flux3ImagePipeline. Es, por tanto, una pieza util para quien quiera evaluar el flujo de trabajo de SimpleTuner con FLUX 3 o reutilizar el adaptador como ejemplo de referencia.

La informacion disponible en la model card es eminentemente practica (hiperparametros de entrenamiento, ajustes de validacion, script de inferencia) y no incluye datos sobre la arquitectura interna del modelo base, el numero de parametros ni los idiomas soportados. Esta ficha refleja esa limitacion de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo de difusion FLUX 3 Image Klein; el adaptador usa atencion de tipo transformer con modulos LoRA de rango 32 |
| Parametros totales | no disponible (el LoRA en si es de rango 32; el modelo base no publica cifra en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica contexto de tokens de texto en el sentido de LLM) |
| Tipos de cuantizacion | Entrenado en BF16 puro; la model card sugiere cuantizacion opcional qint8 via optimum.quanto para ahorrar VRAM en inferencia |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos de la model card) |
| Licencia | other (heredada del modelo base black-forest-labs/flux-3-image-klein-base; consultar terminos) |
| Formato de pesos | safetensors (compatible con diffusers; carga via load_lora_weights) |

## Arquitectura y entrenamiento

El adaptador es un LoRA estandar (modo Standard) de rango 32 y alpha 32,0, sin dropout, inicializado con el estilo por defecto. Se entreno sobre el modelo base FLUX 3 Image Klein usando el pipeline Flux3ImagePipeline de SimpleTuner, con prediccion de tipo flow_matching y el scheduler FlowMatchEulerDiscreteScheduler en validacion. El text encoder no se entreno, por lo que puede reutilizarse el del modelo base para inferencia.

Los detalles de entrenamiento son: 370 epocas, 10.000 pasos, learning rate 1e-4 con schedule constant_with_warmup y 25 pasos de warmup, max grad norm 1,0, batch efectivo de 1 (micro-batch 1, sin acumulacion de gradientes), gradient checkpointing activado, optimizador adamw_bf16 y precision BF16 pura tanto en parametros entrenables como en el modelo base. El dataset "domokun-1024" contiene 27 imagenes a 1024 px, recortadas de forma aleatoria a aspecto cuadrado, con un unico bucket de aspecto y sin datos de regularizacion. La probabilidad de caption dropout fue del 0 %. No se uso prompt de validacion durante el entrenamiento. La validacion se realizo con CFG 3,5, CFG Rescale 0,0, 50 pasos, sampler FlowMatchEulerDiscreteScheduler, semilla 42 y resoluciones 512x512 y 1024x1024.

## Capacidades

- Generacion de imagenes texto-a-imagen (text-to-image) especializada en el personaje Domo-kun.
- Edicion y transformacion imagen-a-imagen (image-to-image) segun los tags del repositorio.
- Personalizacion de personaje: el LoRA permite invocar el personaje mediante el token o descripcion correspondiente en el prompt.
- Composicion de escenas: los ejemplos de la model card muestran al personaje en contextos variados (playa soleada, parque nevado con bufanda roja, retrato de estudio, ilustracion).
- Compatibilidad con el ecosistema diffusers: carga directa mediante `load_lora_weights` sobre el pipeline Flux3ImagePipeline.
- Cuantizacion opcional en inferencia (qint8 via optimum.quanto) para reducir consumo de VRAM.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vision mas alla del propio pipeline de difusion.

## Casos de uso

- Prototipado de personajes de marca: usar el LoRA como plantilla para entrenar adaptadores de personajes propios con SimpleTuner, partiendo de este ejemplo funcional con hiperparametros ya validados.
- Generacion de ilustraciones de contenido para redes sociales: el modelo produce imagenes del personaje en escenas cotidianas (playa, parque, estudio) utiles para piezas de marketing o contenido editorial.
- Evaluacion del pipeline FLUX 3 de SimpleTuner: sirve como referencia reproducible (semilla 42, CFG 3,5, 50 pasos) para comparar resultados antes de invertir en entrenamientos mayores.
- Pruebas de concepto de ajuste fino con datasets pequenos: con solo 27 imagenes y 10.000 pasos demuestra que es viable obtener un LoRA de personaje con recursos modestos (una GPU, batch 1).
- Generacion de material para videojuegos o animacion: el LoRA puede producir variaciones del personaje en distintos entornos para bocetos de arte conceptual.
- Investigacion sobre sobreajuste y generalizacion en LoRA: el contraste entre 370 epocas con 27 imagenes y la calidad de los ejemplos permite estudiar el equilibrio entre fidelidad al personaje y diversidad de escenas.
- Base para fine-tuning adicional: al no haberse entrenado el text encoder, se puede reutilizar y combinar con otros LoRA o adaptadores sin conflicto en esa parte del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, etc.) ni comparaciones numericas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 1,9 GB y el modelo base FLUX 3 Image Klein se carga en BF16, por lo que se recomienda al menos una GPU con memoria suficiente para el pipeline completo en bf16 (la model card no especifica cifra).
- Cuantizacion opcional: la model card sugiere qint8 via optimum.quanto sobre `pipeline.transformer` para reducir VRAM, aunque advierte que no es necesaria porque el modelo no se entreno cuantizado.
- GPU recomendadas: no disponibles en la informacion proporcionada. El codigo de inferencia contempla CUDA, MPS (Apple Silicon) y CPU como fallback.
- Cabe en consumer GPU: no confirmado; el script oficial permite ejecucion en MPS y CPU, lo que sugiere viabilidad en hardware de consumo con la cuantizacion adecuada, pero no se aportan cifras.
- Opciones de despliegue: diffusers (Flux3ImagePipeline de SimpleTuner), con soporte de optimum.quanto para cuantizacion. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un pipeline de difusion de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTuner/flux-3-klein-image-domokun-1024 | LoRA de personaje sobre FLUX 3 Image Klein | Rango 32 (base no disponible) | no aplica | other | Hugging Face |
| black-forest-labs/flux-3-image-klein-base | Modelo base de difusion texto-a-imagen | no disponible | no aplica | other | Hugging Face |
| Otros LoRA de SimpleTuner | Adaptadores PEFT sobre distintos modelos base | Variable | no aplica | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: el LoRA esta entrenado exclusivamente para el personaje Domo-kun; fuera de ese dominio su comportamiento no esta garantizado y puede degradar la calidad del modelo base.
- Dataset muy reducido: 27 imagenes y 370 epocas implican un riesgo alto de sobreajuste; las variaciones de escena pueden ser limitadas.
- Sin prompt de validacion durante el entrenamiento, lo que dificulta evaluar la generalizacion a partir de la propia model card.
- Licencia "other": es imprescindible revisar los terminos del modelo base (black-forest-labs/flux-3-image-klein-base) antes de cualquier uso comercial, ya que el LoRA hereda sus restricciones.
- Idiomas no declarados: los ejemplos usan prompts en ingles; el rendimiento con prompts en castellano no esta documentado.
- Riesgo de alucinacion visual y artefactos propios de los modelos de difusion, especialmente en composiciones complejas o con multiples sujetos.
- El text encoder no fue entrenado, por lo que no se puede modificar el comportamiento del encoder de texto mediante este adaptador.
- Sin datos de benchmarks ni de latencia: no se puede garantizar un rendimiento de produccion sin pruebas propias.
- Cero likes y 236 descargas en el momento de la consulta: comunidad de validacion practicamente inexistente; usar con cautela en entornos productivos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SimpleTuner/flux-3-klein-image-domokun-1024
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Proyecto SimpleTuner (repositorio y documentacion): no disponible en la informacion proporcionada
- Paper o blog tecnico de FLUX 3: no disponible en la informacion proporcionada
