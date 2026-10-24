# luisastellet/qwen-metaphor-unke-camada-11-prompt-numerico

## Resumen

`luisastellet/qwen-metaphor-unke-camada-11-prompt-numerico` es un modelo de generación de texto publicado en Hugging Face por el usuario `luisastellet`, con 596.049.920 parámetros totales verificados en los pesos safetensors (≈0,6 B). El tag `qwen3` de la ficha original indica que se trata de un derivado de la familia Qwen3, y el nombre del repositorio sugiere un ajuste fino orientado a un formato concreto de instrucción ("prompt numérico") sobre la capa o variante once de una serie de modelos del mismo autor. No existe documentación adicional: la model card es la plantilla automática de transformers, sin secciones rellenadas.

El interés del modelo es limitado pero concreto: por tamaño, es ejecutable en cualquier GPU de consumo con 4 GB de VRAM o incluso en CPU, y puede servir como banco de pruebas para experimentos de prompting estructurado o de ajuste fino de Qwen3 en entornos con recursos escasos. Sin embargo, no hay información publicada sobre datos de entrenamiento, licencia, idiomas, contexto soportado ni evaluación, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

Se han localizado otros repositorios del mismo autor con nomenclatura casi idéntica (`qwen-metaphor-unke-camada-11`, `qwen-metaphor-unke-camada-11-zero-um`), lo que apunta a una familia de variantes experimentales más que a un modelo con soporte de producción. Cualquier uso real debería ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3` sugiere transformer decoder-only de la familia Qwen3; no confirmado en la model card) |
| Parametros totales | 596.049.920 (dato real de los safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors (no hay GGUF ni GPTQ/AWQ en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la declara) |
| Formato de pesos | safetensors (librería transformers); tamano del repo: 2,4 GB |
| Pipeline declarado | text-generation |
| Tag de arquitectura/familia | qwen3 |
| Compatibilidad declarada | text-generation-inference, endpoints_compatible |
| Fecha de creacion (metadato) | 2026-10-24T11:58:42Z |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura en la model card: todas las secciones (`Model Architecture and Objective`, `Training Data`, `Training Procedure`, `Training Hyperparameters`) figuran como `[More Information Needed]`. El único indicio técnico es el tag `qwen3`, que situaría el modelo dentro de la familia Qwen3 de Alibaba, caracterizada por transformers decoder-only con normalización RMSNorm, atención con RoPE y, en los tamaños pequeños, activación SwiGLU, sin mezcla de expertos. Dado el recuento de 596 M de parámetros, lo más probable es un ajuste fino de Qwen3-0.6B, pero esto es una inferencia a partir del tag y del tamaño, no un dato confirmado.

Tampoco se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. El nombre del repositorio (`prompt-numerico`) sugiere que el ajuste se centró en un formato de instrucción basado en índices o etiquetas numéricas, probablemente heredado de un pipeline de generación de prompts del autor, pero no existe documentación que lo describa. Un detalle observado: los 2,4 GB del repositorio equivalen aproximadamente al doble del peso en fp16 de 596 M de parámetros (≈1,19 GB), lo que sugiere que los pesos podrían estar almacenados en fp32; conviene verificarlo con `model.safetensors.index.json` o inspeccionando los tensores antes de planificar el despliegue.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad confirmada por el pipeline declarado (`text-generation`).
- Uso conversacional: el tag `conversational` está presente, aunque no se documenta el formato de plantilla de chat ni los tokens especiales esperados.
- Razonamiento, matemáticas y código: no disponibles; no hay evaluación ni descripción que lo respalde.
- Tool calling / function calling: no disponible; no se declara soporte y no debe asumirse por herencia del modelo base sin verificación.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Capacidades multilingües: no disponibles; el campo de idiomas de la ficha está vacío.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; no hay ninguna declarada.
- Servible vía text-generation-inference y endpoints compatibles según los tags del repositorio.

## Casos de uso

- Banco de pruebas de prompting estructurado: el nombre del modelo sugiere un ajuste sobre instrucciones con etiquetas numéricas; puede usarse para comparar, en una misma máquina y con un solo GPU de consumo, si el ajuste mejora el seguimiento de ese formato frente al modelo base. Requiere definir primero una batería de prompts y una métrica de adherencia al formato.
- Prototipado rápido en local: con 596 M de parámetros cabe en CPU y en GPUs de 4 GB, lo que permite iterar en cuadernos o scripts sin coste de API. Adecuado para validar ideas de producto antes de invertir en un modelo mayor.
- Generación de texto corto en lote: resúmenes de una línea, reformulación de titulares o clasificación por generación, siempre que se valide empíricamente la calidad, ya que no hay benchmarks publicados.
- Evaluación comparativa de ajustes finos: al existir variantes hermanas del mismo autor (`camada-11`, `camada-11-zero-um`), sirve para estudiar cómo cambia el comportamiento entre checkpoints de una misma serie de experimentos.
- Filtrado y preetiquetado en un pipeline de datos: uso como generador auxiliar de etiquetas o de paráfrasis en un subconjunto pequeño, con revisión humana posterior, aprovechando el bajo coste de inferencia.
- Docencia y reproducibilidad: ejemplo práctico de cómo cargar un modelo transformers con safetensors, inspeccionar el recuento de parámetros y medir latencia en hardware de gama media. No se recomienda como caso de uso la atención al cliente en producción ni ninguna tarea crítica sin una evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye sección de evaluación cumplimentada y no se han encontrado tablas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada (cálculo a partir de 596 M de parámetros, no dato publicado): fp32 ≈2,4 GB de pesos → 3-4 GB con overhead de runtime; bf16/fp16 ≈1,2 GB → 2-2,5 GB; int8 ≈0,6 GB; int4 ≈0,35 GB.
- GPU de consumo: sí, en cualquier GPU con 4 GB o más (RTX 3050, RTX 3060, RTX 4060, RTX 4090). En las GPUs de gama alta el cuello de botella será el overhead de lanzamiento de kernels, no la memoria.
- GPU de datacenter: A100, H100 o L40S están sobredimensionadas para este tamaño; solo tendrían sentido para servir muchos lotes concurrentes.
- CPU: inferencia viable en CPU con cuantización, dado el tamaño reducido.
- Opciones de despliegue: `transformers` de forma nativa; text-generation-inference (declarado en los tags); vLLM en bf16; llama.cpp u Ollama solo tras convertir los pesos a GGUF, ya que el repositorio no incluye ficheros GGUF. También aparece listado en FriendliAI como endpoint desplegable.
- Latencia y throughput: no disponibles; no hay mediciones publicadas y dependerán del hardware y del backend elegido. Conviene medirlos con `generate()` y un lote de prompts fijo antes de cualquier decisión.

## Comparativa con modelos similares

Los datos de las alternativas provienen de su documentación pública y no han sido verificados en esta ficha; se incluyen como referencia de categoría, no como comparación medida.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Evaluacion publica |
|---|---|---|---|---|---|
| qwen-metaphor-unke-camada-11-prompt-numerico | 596 M | no disponible | no disponible | Hugging Face (0 descargas) | no disponible |
| Qwen3-0.6B (base presumible) | ≈0,6 B | 32.768 tokens (documentación pública de Qwen) | Apache 2.0 | Hugging Face, muy extendido | sí, publicada por el autor |
| Llama 3.2 1B Instruct | ≈1,24 B | 128.000 tokens (documentación pública de Meta) | Llama 3.2 Community License | Hugging Face, muy extendido | sí, publicada por el autor |
| SmolLM2-360M Instruct | ≈0,36 B | 8.192 tokens (documentación pública de Hugging Face) | Apache 2.0 | Hugging Face, muy extendido | sí, publicada por el autor |

La diferencia práctica frente a estas alternativas no está en el rendimiento —no hay datos para afirmarlo— sino en la trazabilidad: los tres modelos de referencia tienen model card completa, licencia explícita y evaluaciones publicadas, mientras que este repositorio no ofrece ninguna de las tres cosas.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática, sin información de uso previsto, datos de entrenamiento ni evaluación. No es posible determinar qué sabe hacer el modelo sin probarlo.
- Licencia no declarada: jurídicamente no hay permiso explícito de uso comercial. Ante la ausencia de licencia, debe asumirse por defecto que no se concede derecho de explotación hasta que el autor lo aclare.
- Idiomas y contexto desconocidos: no se puede garantizar un comportamiento correcto en castellano ni planificar una ventana de contexto concreta.
- Riesgo de alucinación: no cuantificado, pero al no haber alineación documentada (RLHF/DPO) ni evaluación, el riesgo es al menos el del modelo base y probablemente mayor si el ajuste fino fue pequeño.
- Sesgos: no evaluados; se heredarían los del corpus del modelo base, sin filtrado declarado.
- Metadatos inconsistentes: la fecha de creación registrada (2026-10-24) es posterior a la fecha de redacción de esta ficha, y el tag `arxiv:1910.09700` corresponde al artículo del calculador de impacto medioambiental citado en la plantilla, no a un paper del modelo. No deben interpretarse como evidencia técnica.
- Sin tracción ni validación comunitaria: 0 descargas y 0 likes implican ausencia de revisión por terceros, de informes de errores y de recetas de despliegue probadas.
- No apto para producción sin evaluación previa: cualquier uso en atención al cliente, generación de código o decisión automatizada requiere una batería de pruebas propia y revisión de licencia.
- Posible herencia de la plantilla de chat del modelo base: si el tokenizador y los tokens especiales de Qwen3 se mantienen, es necesario aplicar la plantilla de chat correcta; un fallo en este punto degrada la calidad de forma difícil de diagnosticar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-11-prompt-numerico
- Variante hermana `qwen-metaphor-unke-camada-11`: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-11
- Variante hermana `qwen-metaphor-unke-camada-11-zero-um`: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-11-zero-um
- Ficha de la variante `zero-um` en free2aitools: https://free2aitools.com/model/luisastellet/qwen-metaphor-unke-camada-11-zero-um
- Endpoint de la variante `zero-um` en FriendliAI: https://friendli.ai/models/luisastellet/qwen-metaphor-unke-camada-11-zero-um
- Endpoint de la variante `camada-11` en FriendliAI: https://friendli.ai/models/luisastellet/qwen-metaphor-unke-camada-11
- Referencia citada en la plantilla (Lacoste et al., 2019, cálculo de impacto medioambiental; no es el paper del modelo): https://arxiv.org/abs/1910.09700
- Calculador de impacto ML: https://mlco2.github.io/impact#compute
