# rayss868123/Qwen3-0.6B-heretic-abliterated-uncensored

## Resumen

Qwen3-0.6B-heretic-abliterated-uncensored es una variante del modelo denso Qwen3-0.6B (596.049.920 parametros) a la que se le ha aplicado un proceso de "abliteration", es decir, la eliminacion dirigida de las direcciones internas del espacio de activaciones responsables de las respuestas de rechazo. La modificacion se ha realizado con la herramienta Heretic v1.0.1, desarrollada por el autor p-e-w, que busca por prueba y error la configuracion optima de ablacion minimizando el dano colateral medido como divergencia KL respecto al modelo original.

El modelo lo publica el usuario rayss868123 en Hugging Face. El repositorio no tiene descargas ni "likes" en el momento de la consulta y la model card esta copiada en gran parte de la ficha de DavidAU, hasta el punto de incluir instrucciones sobre ajuste del numero de expertos activos que no aplican a un modelo denso. El dato relevante es la metrica declarada: una tasa de rechazo de 6 sobre 100 frente a 49 sobre 100 del modelo original, con una divergencia KL de 0,00, lo que en teoria implica que el comportamiento general del modelo se conserva intacto mientras se eliminan las negativas.

Es relevante para quien necesite un modelo pequeno, ejecutable en CPU o en GPUs de gama baja, sin filtros de contenido para tareas de generacion creativa, roleplay o investigacion en seguridad. No es un modelo nuevo: es un ajuste post-entrenamiento sobre un modelo base de 0,6 B ya existente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens segun la model card ("default, no rope"); no verificado de forma independiente |
| Tipos de cuantizacion | el repositorio contiene pesos safetensors en precision completa; no se listan cuantizaciones propias. La model card menciona ejecucion con GGUF en interfaces de terceros |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; el modelo base Qwen/Qwen3-0.6B se distribuye bajo Apache 2.0 segun la ficha oficial de Qwen |
| Formato de pesos | safetensors (tamano del repositorio: 1,2 GB) |
| Modelo base | Qwen/Qwen3-0.6B |
| Metodo de modificacion | abliteration con Heretic v1.0.1 |
| Tasa de rechazo declarada | 6/100 (original: 49/100) |
| Divergencia KL declarada | 0,00 |
| Fecha de creacion | 25 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se trata de un reentrenamiento ni de un fine-tuning supervisado, sino de una intervencion sobre los pesos de un modelo ya entrenado. Heretic, la herramienta empleada, automatiza la busqueda de los parametros de ablacion: identifica direcciones en el espacio de activaciones asociadas a respuestas de rechazo y las proyecta fuera, optimizando simultaneamente dos objetivos contrapuestos. El primero es reducir la tasa de rechazo medida sobre un conjunto de peticiones; el segundo es mantener la divergencia KL respecto al modelo original lo mas cerca posible de cero, para evitar el deterioro de capacidad que sufre un modelo "abliterado" de forma agresiva.

Los valores reportados en la model card son 6/100 de rechazo y KL 0,00 sobre el modelo de referencia, que partia de 49/100. Segun la propia explicacion incluida en la ficha, un KL inferior a 0,2 ya se considera aceptable en modelos pequenos, por lo que el 0,00 declarado indicaria que la distribucion de salida del modelo apenas ha cambiado. No se especifica el conjunto de evaluacion, el numero de capas intervenidas, ni los hiperparametros de la busqueda.

Hay que senalar que la model card esta mayoritariamente copiada de la ficha de DavidAU y contiene referencias a tecnicas de gestion de expertos MoE, a la colección de ficheros fuente de DavidAU y a la clase "Class 1" de modelos de ese autor. Nada de eso corresponde a un modelo denso de 0,6 B como este, por lo que esas secciones deben ignorarse como descripcion tecnica.

## Capacidades

- Generacion de texto y conversacion multi-turno en el formato propio de la familia Qwen3.
- Generacion de contenido creativo, narrativo, de roleplay y de tematica explicita o con lenguaje soez, sin las negativas tipicas del modelo original.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano del modelo (0,6 B de parametros).
- No hay evidencia en la informacion disponible de soporte de tool calling o function calling especifico.
- No hay evidencia de capacidades de agente, multi-step reasoning estructurado, vision o audio.
- Capacidades multilingues: no disponibles. El modelo base Qwen3 es multilingue, pero no se documenta el comportamiento de esta variante tras la ablacion.
- Uso documentado como codificador de texto en un pipeline de generacion de imagenes (modelo Anima en Civitai), actuando como interprete semantico de prompts.

## Casos de uso

- Escritura creativa y ficcion sin restricciones: el modelo acepta peticiones de genero, terror o contenido explicito que el Qwen3-0.6B original rechazaria en aproximadamente la mitad de los casos. Requiere, segun el propio autor, instrucciones explicitas sobre el tono y el lexico deseado para evitar salidas demasiado planas.
- Roleplay y personajes conversacionales en local: con 0,6 B de parametros cabe en cualquier equipo y permite mantener sesiones largas de chat con el contexto declarado de 40.960 tokens para conservar el historial de personaje.
- Investigacion en seguridad y alineacion: sirve como sujeto de prueba para medir hasta que punto la ablacion elimina la capacidad de rechazo y si ello degrada la coherencia, comparando contra el modelo base con la misma bateria de prompts.
- Generacion de conjuntos de datos adversarios: producir prompts y respuestas que los modelos alineados rechazan, para utilizarlos como entradas en evaluaciones de robustez o en entrenamiento de clasificadores de contenido.
- Despliegue en hardware muy limitado: con cuantizacion Q4_K_M ocupa alrededor de 0,8 GB, por lo que puede ejecutarse en CPU, en una Raspberry Pi moderna o en cualquier portatil, para tareas de generacion de texto offline sin conexion.
- Codificador de prompts para pipelines de imagen: segun el uso documentado en Civitai, convierte texto libre en informacion de condicionamiento para un modelo de difusion, aprovechando que la ablacion reduce la tendencia del modelo a reescribir o rechazar prompts delicados.
- Destilacion o generacion de datos sinteticos: al ser muy ligero, puede ejecutarse en paralelo para etiquetar o generar grandes volumenes de texto de forma economica.
- Punto de partida para fine-tuning posterior en dominios concretos, dado su tamano reducido y su formato safetensors estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la tasa de rechazo (6/100) y la divergencia KL (0,00), sin detalle del procedimiento de evaluacion ni de tareas de capacidad como MMLU, GSM8K o HumanEval.

## Requisitos de hardware

- VRAM estimada para los pesos segun precision (calculo a partir de 596.049.920 parametros):
  - FP32: ~2,4 GB
  - BF16/FP16: ~1,2 GB
  - Q8_0: ~0,63 GB
  - Q5_K_M: ~0,42 GB
  - Q4_K_M: ~0,36 GB de pesos; fuentes externas cifran el consumo total en ~0,78 GB con contexto cargado
- La KV cache adicional depende de la longitud de contexto efectiva, el numero de capas y la configuracion de atencion; no disponible en la informacion proporcionada.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4090) es mas que suficiente. Tambien funciona en A100 o H100, aunque es un desperdicio de recursos.
- Cabe sin problema en GPU de consumo e incluso en CPU. Apple Silicon (cualquier Mac con memoria unificada de 8 GB o mas) lo ejecuta con holgura.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta del repositorio), vLLM, llama.cpp, Ollama, KoboldCpp y text-generation-webui. La model card menciona explicitamente KoboldCpp, oobabooga y Silly Tavern para uso conversacional.
- Latencia y throughput: no disponibles. En un modelo de este tamano la latencia en GPU moderna es del orden de decenas de tokens por segundo o mas, pero no hay cifras publicadas para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| rayss868123/Qwen3-0.6B-heretic-abliterated-uncensored | 596 M | 40.960 declarado en la card | no disponible | 0 descargas, 0 likes | Variante abliterada; model card copiada de otra ficha |
| Qwen/Qwen3-0.6B | 596 M | no disponible en la informacion recogida | Apache 2.0 segun la ficha oficial de Qwen | Modelo base de referencia | Incluye rechazos: 49/100 segun la metrica del autor |
| DavidAU/Qwen3-0.6B-heretic-abliterated-uncensored | ~0,8 B segun terceros (596 M reales) | 40.960 declarado | no disponible | Publicado en HF, referenciado en llmrun.dev y featherless.ai | Version de referencia del mismo proceso, usada como origen textual de la model card |

No se dispone de datos de rendimiento comparado entre estas opciones, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio. Aunque el modelo base Qwen3-0.6B se publica bajo Apache 2.0, la ausencia de una licencia explicita en esta derivada deja en situacion ambigua el uso comercial. Conviene verificarlo antes de integrarlo en un producto.
- No hay ninguna confirmacion de que el autor original del proceso sea rayss868123. Todo apunta a una re-subida o copia de la version de DavidAU: la model card menciona su coleccion de ficheros fuente, su guia de parametros y su nomenclatura de clases. Los derechos y la trazabilidad de la modificacion no estan claros.
- La model card incluye secciones tecnicamente incorrectas para este modelo: instrucciones para cambiar el numero de expertos activos (MoE) en un modelo que es denso, y referencias a ficheros GGUF y EXL2 que no estan en este repositorio.
- El contexto de 40.960 tokens es una afirmacion sin respaldo en la informacion disponible y sin indicacion de que se haya aplicado YaRN u otra tecnica de extension. En la practica, la ventana efectiva puede ser menor.
- La ablacion elimina rechazos, no conocimiento: el modelo generara contenido explicito, violento o potencialmente danino sin filtros. Es responsabilidad del usuario el cumplimiento normativo y la moderacion en cualquier despliegue publico.
- Con 0,6 B de parametros la tasa de alucinacion es alta y la coherencia en razonamiento complejo, matematicas o codigo es muy limitada. No es adecuado para tareas que requieran precision factual.
- El modelo rara vez rechaza, pero segun el propio autor necesita instrucciones explicitas sobre el tono y el vocabulario para producir contenido explicito; sin ellas las salidas tienden a ser planas.
- Sin datos de benchmarks no se puede cuantificar cuanto ha degradado la ablacion la capacidad del modelo, mas alla del KL declarado, que no se acompana del procedimiento de medida.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento original ni comportamiento multilingue de esta variante.
- No se documenta soporte de tool calling ni de razonamiento en varios pasos, lo que descarta su uso en pipelines de agentes.
- La ausencia total de descargas y likes implica que no hay validacion comunitaria de las metricas declaradas.

## Enlaces

- Modelo en Hugging Face (rayss868123): https://huggingface.co/rayss868123/Qwen3-0.6B-heretic-abliterated-uncensored
- Version de referencia en Hugging Face (DavidAU): https://huggingface.co/DavidAU/Qwen3-0.6B-heretic-abliterated-uncensored
- Model card de la version DavidAU: https://huggingface.co/DavidAU/Qwen3-0.6B-heretic-abliterated-uncensored/blob/main/README.md
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Ficha en llmrun.dev con requisitos de hardware: https://llmrun.dev/model/davidau-qwen3-0-6b-heretic-abliterated-uncensored
- Ficha en featherless.ai: https://featherless.ai/models/DavidAU/Qwen3-0.6B-heretic-abliterated-uncensored
- Uso como codificador de texto en Anima (Civitai): https://civitai.com/models/2598886/anima-text-encoder-qwen3-06b-heretic-abliterated-uncensored
- Guia de parametros y samplers referenciada en la card: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Documento sobre activacion de expertos MoE referenciado en la card (no aplicable a este modelo): https://huggingface.co/DavidAU/How-To-Set-and-Manage-MOE-Mix-of-Experts-Model-Activation-of-Experts
- Coleccion de ficheros fuente de DavidAU referenciada en la card: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
