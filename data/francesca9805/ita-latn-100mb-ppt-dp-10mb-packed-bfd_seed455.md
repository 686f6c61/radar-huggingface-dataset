# francesca9805/ita-latn-100mb-ppt-Dp-10mb-packed-bfd_seed455

## Resumen

El modelo `francesca9805/ita-latn-100mb-ppt-Dp-10mb-packed-bfd_seed455` es un ajuste fino (SFT) del modelo base `goldfish-models/ita_latn_100mb`, un modelo monolingüe de italiano desarrollado dentro del proyecto Goldfish Models. Lo publica el usuario `francesca9805` y se ha entrenado con la librería TRL (versión 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.5.1. Con 124.770.816 parámetros y un repositorio de 0,3 GB, se trata de un modelo pequeño orientado a experimentación más que a producción a gran escala.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación con 0 descargas y 0 "likes", sin model card descriptiva más allá de la plantilla autogenerada por TRL, y con un nombre que sugiere un experimento controlado (posiblemente comparación de tokenizadores, dado el nombre del proyecto en Weights & Biases, `new-tokenizers`, y el sufijo `seed455`). El interés principal está en reproducir o auditar pipelines de ajuste supervisado sobre modelos monolingües pequeños, no en su rendimiento como asistente.

No se dispone de información sobre el conjunto de datos de ajuste, la licencia, los idiomas declarados oficialmente ni resultados de evaluación. Todo lo que se afirma en esta ficha se deriva estrictamente de los metadatos de HuggingFace, de la model card y de los enlaces citados en ella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `gpt2` en HuggingFace; no se detalla en la model card) |
| Parametros totales | 124.770.816 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica en la model card ni en los metadatos) |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados; el repositorio solo contiene safetensors) |
| Idiomas soportados | No declarados oficialmente; el identificador `ita_latn` y el modelo base indican italiano |
| Licencia | No disponible (la model card indica `licence: license`, sin especificar términos) |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | `text-generation` |
| Modelo base | `goldfish-models/ita_latn_100mb` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Los metadatos de HuggingFace incluyen la etiqueta `gpt2` y el modelo deriva de `goldfish-models/ita_latn_100mb`, un modelo monolingüe de la familia Goldfish, por lo que lo razonable es asumir un transformer decoder-only autorregresivo con normalización y atención causal propias de esa familia. El recuento exacto de 124.770.816 parámetros es coherente con un modelo de escala ~125M, es decir, del orden de GPT-2 small, pero no se confirma en la documentación disponible.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL 0.23.0. El nombre del modelo apunta a un ajuste sobre datos empaquetados ("packed") de 10 MB, con una semilla concreta (`seed455`), y el run asociado en Weights & Biases pertenece al proyecto `new-tokenizers` de la Universidad de Groningen, lo que sugiere un experimento comparativo de tokenizadores o de presupuestos de datos más que un entrenamiento orientado a producto. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases posteriores de RLHF o DPO: solo SFT. El prompt de ejemplo de la model card usa el formato de chat con roles (`{"role": "user", "content": ...}`), lo que indica que el ajuste se hizo sobre plantillas conversacionales.

## Capacidades

- Generación de texto autorregresiva en italiano, con el formato de chat `role/content` que aparece en el ejemplo de la model card.
- Ajuste supervisado sobre instrucciones conversacionales, según el pipeline declarado (`trl`, `sft`, `generated_from_trainer`).
- Compatibilidad con `transformers.pipeline("text-generation")` y con `text-generation-inference`, según las etiquetas `text-generation-inference` y `endpoints_compatible`.
- Capacidad multilingüe: no disponible; el identificador apunta a italiano (`ita_latn`) como única lengua objetivo.
- Tool calling / function calling: no disponible; no se documenta soporte de herramientas.
- Capacidades de agente o razonamiento multi-paso: no disponibles; no hay evidencia en la model card.
- Modo "thinking", visión o audio: no disponibles.
- Código, matemáticas o razonamiento formal: no evaluados ni documentados.

## Casos de uso

- Reproducción de experimentos de ajuste supervisado: el modelo sirve como punto de comparación frente a otros runs del mismo proyecto (`new-tokenizers`), ya que el sufijo `seed455` indica una semilla fija y un presupuesto de datos concreto (10 MB empaquetados).
- Estudio del efecto del tokenizador en modelos monolingües pequeños: al derivar de `goldfish-models/ita_latn_100mb`, permite medir cómo cambia la generación en italiano tras un SFT ligero con distintos vocabularios o presupuestos de datos.
- Prototipado rápido en CPU: con ~125M parámetros, el modelo cabe holgadamente en memoria de CPU y permite iterar sin GPU en pruebas de formato de prompt y de plantillas de chat.
- Pruebas de integración de pipelines: es útil para validar flujos de `transformers`, de `text-generation-inference` o de endpoints compatibles antes de escalar a modelos mayores.
- Generación de texto en italiano para tareas de baja exigencia: completado de frases, respuestas cortas o borradores, siempre con revisión humana, dado el tamaño reducido del modelo.
- Punto de partida para ajustes posteriores: sirve como inicialización para SFT o DPO adicionales sobre dominios concretos en italiano, reduciendo el coste frente a entrenar desde cero.
- Docencia y prácticas de ingeniería de ML: el tamaño de 0,3 GB y el uso exclusivo de safetensors lo hacen manejable para ejercicios de fine-tuning, evaluación y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas (perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra) y los resultados de la búsqueda web no contienen información relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32, 0,25 GB en fp16/bf16 y 0,12-0,13 GB en int8. Con cuantización de 4 bits el peso se reduce a unos 70 MB, más el overhead de activaciones y caché KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requieren A100, H100 ni similares. Sirven una GTX 1650, RTX 3060, RTX 4090 o incluso una iGPU con memoria compartida suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos diez años, y también en CPU (la model card usa `device="cuda"`, pero el modelo es ejecutable en CPU sin problema).
- Opciones de despliegue: `transformers` (soportado explícitamente), `text-generation-inference` (etiqueta `text-generation-inference`), endpoints compatibles con la Inference API. Para `llama.cpp` u Ollama sería necesaria una conversión a GGUF que no se distribuye en el repositorio; `vLLM` es viable técnicamente, aunque no está declarado por el autor.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas; en la práctica, para un modelo de ~125M parámetros la latencia es de milisegundos por token en GPU moderna, pero se trata de una estimación general no verificada para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `francesca9805/ita-latn-100mb-ppt-Dp-10mb-packed-bfd_seed455` | 124.770.816 | No disponible | No publicado | No disponible | HuggingFace, 0 descargas |
| `goldfish-models/ita_latn_100mb` (modelo base) | No disponible en esta busqueda | No disponible | No disponible en esta busqueda | No disponible en esta busqueda | HuggingFace (modelo base citado) |
| Otros modelos Goldfish de la familia 100mb (por ejemplo, otros códigos de idioma) | No disponible en esta busqueda | No disponible | No disponible en esta busqueda | No disponible en esta busqueda | HuggingFace (organización `goldfish-models`) |
| GPT-2 small (referencia de escala) | ~124M | 1024 tokens (referencia general) | Ampliamente documentado en la literatura | No disponible en esta busqueda | HuggingFace |

No se dispone de datos verificados de benchmarks ni de licencias de las alternativas dentro de la información proporcionada, por lo que la comparación se limita a escala, disponibilidad y procedencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Un SFT sobre datos no especificados puede heredar sesgos del corpus base y del dataset de ajuste, ambos desconocidos.
- Riesgo de alucinación: alto en términos relativos, propio de un modelo de ~125M parámetros con contexto limitado; no hay evaluación que lo cuantifique.
- Limitaciones de contexto e idioma: no se documenta la ventana de contexto y el modelo solo tiene evidencia de estar orientado al italiano (`ita_latn`); su comportamiento en otros idiomas no está garantizado.
- Restricciones de licencia: la model card declara `licence: license` sin concretar términos y HuggingFace marca la licencia como no disponible. No debe asumirse uso comercial permitido sin consultar al autor y al modelo base.
- Trazabilidad del dataset: se desconoce por completo la composición, el tamaño real y la procedencia de los datos de SFT (el nombre sugiere 10 MB empaquetados), lo que impide auditar contaminación o calidad.
- Madurez: 0 descargas y 0 "likes", sin documentación propia más allá de la plantilla de TRL y sin resultados de evaluación publicados.
- Formato conversacional: el ejemplo de la model card asume entrada con roles; usar prompts en texto plano puede degradar la calidad de la respuesta.
- Producción: no se recomienda su uso en sistemas orientados a usuario final sin una evaluación previa específica del dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ita-latn-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/ita_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/xgsvz56s
- Repositorio de TRL: https://github.com/huggingface/trl
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre este modelo (los resultados devueltos corresponden a páginas de ayuda de YouTube y no guardan relación con el modelo).
