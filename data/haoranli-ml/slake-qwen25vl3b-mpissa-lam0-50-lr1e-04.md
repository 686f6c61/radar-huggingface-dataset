# haoranli-ml/slake-qwen25vl3b-mpissa-lam0.50-lr1e-04

## Resumen

`haoranli-ml/slake-qwen25vl3b-mpissa-lam0.50-lr1e-04` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario `haoranli-ml`, entrenado sobre el modelo base multimodal `Qwen/Qwen2.5-VL-3B-Instruct`. El identificador del repositorio sugiere un ajuste fino orientado al conjunto de datos SLAKE (un benchmark de preguntas y respuestas sobre imagenes medicas) y el sufijo codifica hiperparametros concretos: `mpissa` (presumiblemente la variante de agregacion de adaptadores), `lam0.50` (lambda 0,50) y `lr1e-04` (tasa de aprendizaje 1e-4). El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA y no con un modelo completo.

El modelo hereda del base Qwen2.5-VL-3B-Instruct la arquitectura transformer con vision encoder y una ventana de contexto de 32 768 tokens (dato del modelo base, no verificado en este repositorio), asi como su capacidad de razonamiento multimodal, tool calling y generacion de texto. El adaptador anade un ajuste especifico de dominio sobre datos medicos, aunque la model card no documenta ni el dataset exacto, ni el procedimiento de entrenamiento, ni los resultados obtenidos.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y con una model card que es practicamente la plantilla por defecto de Hugging Face sin rellenar. Debe tratarse como un checkpoint experimental, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen2.5-VL-3B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el base tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador (el base Qwen2.5-VL-3B-Instruct soporta 32 768 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT 0.21.2) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo: se compone de matrices de bajo rango inyectadas en las capas del transformer base `Qwen/Qwen2.5-VL-3B-Instruct`. El modelo base combina un vision encoder con un decoder de lenguaje de 3B parametros, pero la model card de este repositorio no aporta detalles sobre que modulos se han adaptado, el rango, el alpha ni la estrategia de congelacion.

El nombre del repositorio indica que el entrenamiento se realizo sobre SLAKE (dataset de VQA medica) con tasa de aprendizaje 1e-4 y un parametro lambda de 0,50, probablemente asociado a una tecnica de mezcla o agregacion de adaptadores (`mpissa`). No se documentan el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni ninguna innovacion tecnica adicional. Toda la informacion de entrenamiento mas alla del identificador esta marcada como `[More Information Needed]` en la model card.

## Capacidades

- Generacion de texto y razonamiento multimodal heredados del base Qwen2.5-VL-3B-Instruct (vision + lenguaje).
- Respuesta a preguntas sobre imagenes, presumiblemente orientada a imagenes medicas por el dataset SLAKE.
- Soporte de tool calling y function calling heredado del base (no verificado en el adaptador).
- Capacidades de agente y razonamiento multi-paso heredadas del base (no verificadas en el adaptador).
- Capacidades multilingues heredadas del base (idiomas no declarados en este repositorio).
- Cualquier capacidad especial (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Investigacion en VQA medica: el adaptador puede emplearse para reproducir o comparar resultados sobre SLAKE, evaluando el efecto del ajuste fino LoRA frente al base sin adaptar.
- Prototipado de asistentes de lectura de imagenes radiologicas: el modelo puede responder preguntas en lenguaje natural sobre una imagen medica, aunque sin validacion clinica.
- Experimentos de adaptacion eficiente: sirve como ejemplo de pipeline PEFT sobre un VLM de 3B para estudiar el impacto de hiperparametros como lambda y learning rate.
- Docencia y formacion: util para demostrar como se publica y se carga un adaptador LoRA sobre un modelo multimodal en Hugging Face.
- Benchmarking de tecnicas de agregacion de adaptadores: el sufijo `mpissa` sugiere una variante concreta que puede compararse con otras configuraciones del mismo autor.
- Base para un ajuste posterior: al ser un adaptador ligero (0,2 GB), puede combinarse o continuar entrenandose en entornos con recursos limitados.
- No se recomienda su uso en produccion clinica ni en atencion al paciente sin una evaluacion independiente y sin una licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el base de 3B en bf16 requiere aproximadamente 6-7 GB, y en cuantizacion de 4 bits en torno a 2-3 GB (estimacion orientativa, no confirmada en este repositorio).
- GPU recomendadas: no disponible. Por tamano del base, una RTX 3090/4090 (24 GB) o una A100/H100 serian suficientes, pero no hay datos publicados para este adaptador.
- Cabe en GPU consumer: probablemente si, dado que el base es de 3B, pero no hay confirmacion en la informacion disponible.
- Opciones de despliegue: transformers + PEFT (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| haoranli-ml/slake-qwen25vl3b-mpissa-lam0.50-lr1e-04 | Adaptador LoRA sobre 3B | no disponible | no disponible | Hugging Face (0 descargas) | Checkpoint experimental sin model card rellenada |
| Qwen/Qwen2.5-VL-3B-Instruct | 3B | 32 768 tokens | no disponible en esta ficha | Hugging Face (modelo base publico) | Modelo base multimodal oficial |
| Otros adaptadores SLAKE sobre Qwen2.5-VL | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas en la informacion proporcionada |

## Limitaciones y advertencias

- La model card es la plantilla por defecto sin rellenar: no hay informacion sobre sesgos, datos, evaluacion ni uso previsto.
- Riesgo de alucinacion elevado en dominio medico, agravado por la ausencia de validacion clinica documentada.
- Sin licencia declarada: no se puede asumir permiso para uso comercial; la licencia del base Qwen2.5-VL-3B-Instruct debe consultarse por separado.
- Cero descargas y cero likes en el momento de la consulta: sin evidencia de uso o validacion por la comunidad.
- Idiomas soportados no declarados; el comportamiento multilingue depende enteramente del base.
- Longitud de contexto del adaptador no documentada; se hereda del base pero no se verifica.
- No apto para produccion clinica, diagnostico ni decision medica sin auditoria independiente.
- El identificador sugiere hiperparametros concretos (`lam0.50`, `lr1e-04`) pero no se documenta la metodologia `mpissa`.

## Enlaces

- Hugging Face: https://huggingface.co/haoranli-ml/slake-qwen25vl3b-mpissa-lam0.50-lr1e-04
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
