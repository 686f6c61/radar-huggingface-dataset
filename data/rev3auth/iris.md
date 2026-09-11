# Rev3auth/iris

## Resumen

Iris es un ajuste fino (fine-tune) del modelo Gemma 3 270M en su variante instruction-tuned, publicado por el usuario Rev3auth bajo licencia Apache 2.0. El modelo base declarado es `unsloth/gemma-3-270m-it-bnb-4bit`, es decir, una version ya cuantizada a 4 bits del Gemma 3 270M IT de Google, sobre la que se ha aplicado un entrenamiento adicional mediante la libreria Unsloth y TRL. Con 268.098.176 parametros totales (unos 268 M) y un repositorio de apenas 0,6 GB, se trata de un modelo muy pequeno, orientado a texto y de proposito general ligero.

Se distribuye en formato `safetensors` para la libreria `transformers`, con pipeline de `text-generation` y compatibilidad declarada con `text-generation-inference` y endpoints. La unica lengua documentada es el ingles. No se proporcionan en la informacion disponible detalles sobre el dataset de ajuste, la longitud de contexto, los tipos de cuantizacion finales ni resultados de evaluacion.

Su relevancia practica radica en el nicho de modelos ultracompactos: al caber en cualquier GPU de consumo e incluso ejecutarse en CPU, resulta util para prototipado rapido, entornos con recursos muy limitados y despliegues en el borde. No obstante, la ausencia de documentacion tecnica y de benchmarks en su model card limita seriamente la evaluacion rigurosa de su calidad frente a alternativas de la misma categoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia gemma3_text |
| Parametros totales | 268.098.176 (~268 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura `gemma3_text`, la rama puramente textual de la familia Gemma 3 de Google, un transformer decoder-only. El punto de partida concreto es la version instruction-tuned de 270 M de parametros, ya cuantizada a 4 bits por Unsloth (`unsloth/gemma-3-270m-it-bnb-4bit`). No se especifica en la informacion disponible si el ajuste se realizo sobre los pesos cuantizados o si se fusionaron posteriormente, ni con que precision se publican los pesos finales del repositorio.

El entrenamiento adicional se llevo a cabo con Unsloth y la libreria TRL de Hugging Face, segun indica la propia model card, que menciona un entrenamiento "2x mas rapido" gracias a Unsloth. No hay datos disponibles sobre el numero de tokens de entrenamiento, la composicion del dataset, la tecnica de ajuste concreta (LoRA, QLoRA, SFT completo), ni la existencia de fases de RLHF o DPO posteriores. Tampoco se documentan innovaciones tecnicas propias mas alla del uso del stack de Unsloth para acelerar el fine-tuning.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instruction-tuned.
- Seguimiento de instrucciones basicas (formato pregunta-respuesta), propio de la variante IT de Gemma 3.
- Generacion de texto libre dentro del pipeline `text-generation`.
- Compatibilidad declarada con `transformers`, `text-generation-inference` y despliegue via endpoints.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no; solo ingles declarado.
- Capacidades especiales (modo thinking, vision, audio): no documentadas; el tag `gemma3_text` indica que es la rama exclusivamente textual.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ocupar menos de 1 GB en disco y poder ejecutarse en CPU, permite validar flujos de dialogo antes de invertir en modelos mayores.
- Despliegue en el borde (edge) y dispositivos con recursos limitados: su tamano de 268 M de parametros permite inferencia local en telefonos, Raspberry Pi o portatiles sin GPU dedicada.
- Clasificacion y etiquetado de texto ligero: tareas de categorizacion, extraccion de entidades simples o resumenes cortos en ingles, donde la latencia importa mas que la profundidad de razonamiento.
- Generacion de texto en pipelines por lotes: procesamiento masivo de pequenas peticiones de texto donde el coste por token es critico y la calidad exigida es moderada.
- Base para nuevos ajustes finos especificos de dominio: su licencia Apache 2.0 y su tamano reducido lo hacen adecuado como punto de partida para fine-tunes sectoriales con presupuesto de computo minimo.
- Chatbots de soporte interno de baja complejidad: respuestas a preguntas frecuentes predefinidas en ingles, integradas en herramientas internas donde no se requiere conocimiento experto.
- Experimentacion academica y docencia: permite reproducir el ciclo completo de fine-tuning con Unsloth y TRL en hardware de consumo, util para cursos y practicas de ajuste de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K ni ninguna otra), y la busqueda web realizada no aporto datos adicionales sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 268 M de parametros; no son cifras oficiales del autor):
  - Precision completa FP32: ~1,07 GB.
  - FP16/BF16: ~0,54 GB.
  - Cuantizacion de 8 bits: ~0,27 GB.
  - Cuantizacion de 4 bits: ~0,14 GB.
  - A estas cifras hay que sumar el consumo de activaciones y cache KV, que depende de la longitud de contexto y del tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan con holgura y permiten lotes grandes.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo e integrada moderna, e incluso puede ejecutarse en CPU con memoria RAM suficiente.
- Opciones de despliegue: `transformers` de forma nativa; `text-generation-inference` (TGI) segun los tags del repositorio; `vLLM`; y, tras conversion a GGUF, `llama.cpp` y `Ollama`. No se confirma en la informacion disponible que existan pesos GGUF ya publicados.
- Latencia y throughput: no disponible; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rev3auth/iris | 268.098.176 | no disponible | no disponible | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| unsloth/gemma-3-270m-it-bnb-4bit (modelo base) | ~270 M | no disponible | no disponible | no disponible | Hugging Face |
| google/gemma-3-270m-it (origen de la familia) | ~270 M | no disponible | no disponible | Gemma Terms (no confirmado en esta ficha) | Hugging Face |

No se dispone de datos verificables de rendimiento para ninguno de los modelos comparados dentro de la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia declarada y disponibilidad. Otras alternativas de la misma categoria (modelos ultracompactos de ~250-500 M de parametros de otros fabricantes) no se incluyen por falta de datos confirmados en esta busqueda.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Gemma 3, hereda los sesgos del modelo base, no evaluados en esta ficha.
- Riesgo de alucinacion: elevado, como es habitual en modelos de este tamano entrenados sobre corpus generalistas; no se aportan evaluaciones de fidelidad.
- Limitaciones de contexto e idioma: solo se declara ingles y se desconoce la ventana de contexto, lo que impide garantizar un rendimiento correcto en conversaciones multi-turno largas o en idiomas distintos del ingles.
- Restricciones de licencia: el repositorio declara Apache 2.0, lo que en principio permite uso comercial; sin embargo, el modelo base es Gemma 3, sujeto a los terminos de uso de Gemma, cuya compatibilidad con la relicencia a Apache 2.0 no queda aclarada en la informacion disponible. Conviene verificar los terminos del modelo base antes de un uso comercial.
- Ausencia de validacion: el repositorio no incluye dataset de entrenamiento, hiperparametros, evaluacion ni detalles del ajuste, lo que dificulta auditar su comportamiento.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion ni de validacion por terceros.
- Fechas de publicacion inusuales: la ficha registra creacion y actualizacion en 2026-09-11, dato que conviene contrastar antes de citarlo.
- Para produccion: no se recomienda su uso en tareas criticas sin una evaluacion propia previa, dado el nivel de documentacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rev3auth/iris
- Modelo base: https://huggingface.co/unsloth/gemma-3-270m-it-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: no disponible en la informacion proporcionada (no se enlaza explicitamente en la model card)
- Paper o blog tecnico del modelo: no disponible
- Demo: no disponible
