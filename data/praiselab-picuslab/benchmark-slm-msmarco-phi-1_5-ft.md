# praiselab-picuslab/benchmark-slm-msmarco-phi-1_5-ft

## Resumen

`praiselab-picuslab/benchmark-slm-msmarco-phi-1_5-ft` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `microsoft/phi-1_5`, publicado por el usuario `praiselab-picuslab`. Por los tags del repositorio (`benchmark-slm`, `or2`, `dataset-msmarco`, `strategy-ft`) y por el propio nombre, todo apunta a un artefacto generado dentro de un estudio comparativo de modelos de lenguaje pequenos (SLM) sobre la tarea de MS MARCO, no a un modelo de proposito general listo para produccion. El repositorio contiene unicamente los pesos del adaptador en formato `safetensors`, con un tamano declarado de 0.0 GB.

El modelo base, phi-1.5, es un transformer decoder-only denso de 1.3 mil millones de parametros y 2048 tokens de contexto, desarrollado por Microsoft Research y descrito en el informe "Textbooks Are All You Need II". Su entrenamiento se centro en datos sinteticos de calidad tipo libro de texto y codigo, lo que le da una capacidad de generacion de codigo superior a la de otros modelos de su tamano, a costa de un rendimiento debil en conocimiento enciclopedico y en seguimiento de instrucciones.

La relevancia de esta ficha es acotada: se trata de un adaptador con cero descargas y cero likes en el momento de la consulta, acceso restringido (gated) y sin licencia declarada. Su interes es fundamentalmente de reproducibilidad e investigacion en ajuste fino eficiente y en evaluacion de SLM sobre tareas de recuperacion de informacion, no como componente de un sistema en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base phi-1.5); adaptador LoRA sobre atencion y proyecciones |
| Parametros totales | 1.3 mil millones en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (heredada del modelo base phi-1.5) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite FP16, INT8 y GGUF de 4/5/8 bits previa fusion del adaptador y conversion |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (el repositorio no declara licencia; el modelo base phi-1.5 usa licencia MIT) |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT); no se incluyen pesos fusionados ni GGUF |

Otros datos del repositorio: libreria `peft`, pipeline `text-generation`, dataset declarado `microsoft/ms_marco`, estrategia declarada `strategy-ft` (fine-tuning), acceso gated con aceptacion de condiciones obligatoria.

## Arquitectura y entrenamiento

El adaptador se aplica sobre phi-1.5, un transformer decoder-only denso con atencion causal multi-cabeza estandar, 1.3 mil millones de parametros y ventana de 2048 tokens. El modelo base fue entrenado por Microsoft Research con una mezcla de datos sinteticos generados para parecerse a material didactico y a codigo, en la linea del trabajo "Textbooks Are All You Need"; el informe de phi-1.5 indica que se partio de phi-1 y se continuo el entrenamiento con datos adicionales de la misma naturaleza, manteniendo el enfasis en codigo y razonamiento basico. Los detalles exactos de volumen de tokens, composicion del dataset y si hubo RLHF o DPO no estan disponibles en la informacion proporcionada.

Del adaptador en si solo se conoce lo declarado en los metadatos: es un ajuste fino con LoRA (PEFT) sobre el dataset MS MARCO, presumiblemente sobre pares pregunta-pasaje, dentro de un banco de pruebas de SLM. No se especifican rango de LoRA, alpha, modulos objetivo, hiperparametros, numero de pasos ni si se entreno sobre la variante de pasajes, la de respuestas o ambas. Tampoco se documenta si el adaptador se disena para generacion de respuestas o para reordenamiento generativo de pasajes; ambos usos son plausibles dado el dataset, pero ninguno esta confirmado. El tag `or2` no tiene definicion publica en la informacion disponible.

## Capacidades

- Generacion de texto en ingles sobre la base de phi-1.5, con especial soltura en codigo y en tareas de sintaxis sencilla.
- Razonamiento basico de varios pasos y aritmetica simple, limitado por el tamano del modelo base.
- Ajuste especifico sobre MS MARCO, orientado a tareas de recuperacion de informacion, respuesta a preguntas y relevancia pregunta-pasaje (el objetivo exacto no esta documentado).
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de comportamiento agentico ni de razonamiento multi-paso orquestado.
- Monolingue: solo ingles.
- Sin capacidades multimodales (ni vision ni audio) y sin modo "thinking" explicito.
- Al ser un adaptador PEFT, requiere cargarse junto al modelo base phi-1.5; no es un modelo autonomo.

## Casos de uso

- Reproduccion de experimentos de ajuste fino eficiente: cargar el adaptador con `peft` sobre phi-1.5 para replicar el protocolo de fine-tuning con LoRA sobre MS MARCO y comparar hiperparametros y rangos.
- Linea base en estudios de recuperacion de informacion: usar el adaptador como referencia de un SLM ajustado frente a reordenadores clasicos (cross-encoders tipo MiniLM) o frente a otros SLM del mismo rango en tareas de relevancia pregunta-pasaje.
- Investigacion sobre degradacion de capacidades: medir cuanto pierde phi-1.5 en generacion de codigo y en tareas de sentido comun tras un ajuste estrecho sobre un corpus de IR, un fenomeno relevante para quienes estudian olvido catastrofico en adaptadores.
- Evaluacion comparativa de SLM: integrar el adaptador en un arnes de evaluacion junto a otros modelos de 1-2 mil millones de parametros para estudiar la relacion entre tamano, datos de ajuste y rendimiento en tareas especificas.
- Docencia y formacion tecnica: ejemplo real de repositorio PEFT con licencia no declarada y acceso restringido, util para ensenar buenas practicas de documentacion de modelos y de gestion de licencias.
- Pruebas de infraestructura de despliegue: validar pipelines que cargan adaptadores LoRA dinamicos (por ejemplo, vLLM con soporte multi-LoRA) antes de sustituirlos por adaptadores en produccion, dado el bajo coste de computo de un modelo de 1.3B.
- Analisis de sesgos y robustez en modelos pequenos entrenados con datos sinteticos, usando el adaptador como una de las variantes del estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de resultados, no declara metricas de MS MARCO (MRR@10, Recall@100, nDCG) ni de evaluacion general (MMLU, HumanEval, GSM8K), y no se ha localizado documentacion asociada al autor.

| Benchmark | Este adaptador | phi-1.5 (base) | Alternativas ~1-2B |
|---|---|---|---|
| MMLU | no disponible | no disponible en la informacion proporcionada | no disponible |
| HumanEval | no disponible | no disponible en la informacion proporcionada | no disponible |
| GSM8K | no disponible | no disponible en la informacion proporcionada | no disponible |
| MS MARCO (MRR@10 / nDCG@10) | no disponible | no aplica (no ajustado a la tarea) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia con el modelo base fusionado: aproximadamente 2.6 GB en FP16, unos 1.4 GB en INT8 y entre 0.8 y 1.0 GB en cuantizacion de 4 bits (estimaciones calculadas a partir de 1.3B parametros; el adaptador anade solo unos pocos MB).
- El adaptador LoRA en si ocupa muy poco (el repositorio declara 0.0 GB), pero no es utilizable sin cargar el modelo base completo.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas es suficiente (RTX 3060, RTX 4060, RTX 4070, RTX 4090); en ambitito servidor, A100 o H100 son sobredimensionadas para este tamano y solo se justifican por agregacion de peticiones.
- Cabe holgadamente en GPU consumer: si, desde una GTX 1660 de 6 GB en cuantizacion de 4 bits hasta una RTX 4090 en FP16.
- Opciones de despliegue: `transformers` + `peft` (ruta nativa, ya que se distribuye como adaptador), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp u Ollama solo tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles. Como referencia de orden de magnitud, un modelo denso de 1.3B en FP16 sobre una RTX 4090 queda limitado por memoria de pesos y no por computo, por lo que el cuello de botella real sera la longitud de contexto y el batching; no se aportan cifras medidas.
- Restriccion practica: el acceso es gated, por lo que cualquier pipeline automatizado necesita un token de HuggingFace con permisos concedidos y aceptacion previa de las condiciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre phi-1.5) | 1.3B (base) | 2048 | no disponible | gated, 0 descargas | Adaptador LoRA especifico para MS MARCO, sin documentacion ni benchmarks publicados |
| microsoft/phi-1_5 | 1.3B | 2048 | MIT | publico | Base de este adaptador; enfasis en codigo y datos sinteticos, debil en conocimiento general |
| TinyLlama-1.1B | 1.1B | 2048 | Apache-2.0 | publico | Entrenado con ~3 billones de tokens, mas orientado a conversacion general |
| Qwen2.5-1.5B | 1.5B | 32768 | Apache-2.0 | publico | Contexto mucho mayor y mejor soporte multilingue; licencia permisiva clara |
| SmolLM2-1.7B | 1.7B | 8192 | Apache-2.0 | publico | Alternativa reciente con contexto ampliado y tokenizador mas eficiente |

La comparacion relevante no es de rendimiento bruto, sino de trazabilidad: frente a estas alternativas, el adaptador carece de licencia declarada, de resultados publicados y de comunidad que lo valide.

## Limitaciones y advertencias

- Licencia no disponible: al no declararse licencia, no puede asumirse ningun derecho de uso comercial, redistribucion ni modificacion. Cualquier uso en produccion requiere contactar con el autor.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace y disponer de un token autenticado, lo que rompe la reproducibilidad automatica de experimentos.
- El repositorio declara 0.0 GB de tamano, lo que sugiere que los pesos pueden no estar efectivamente subidos o que solo hay ficheros de configuracion; conviene verificar la lista de ficheros antes de planificar su uso.
- Cero descargas y cero likes: no existe Validacion externa, ni issues, ni resultados replicados por terceros.
- El ajuste sobre MS MARCO es estrecho y puede degradar las capacidades generales del modelo base (generacion de codigo, aritmetica, conversacion), un efecto conocido en fine-tuning con LoRA sobre dominios muy especificos.
- phi-1.5 presenta alucinacion frecuente en preguntas factuales y conocimiento enciclopedico limitado, derivado de su entrenamiento con datos sinteticos de tipo libro de texto.
- Solo ingles: no hay soporte real de castellano ni de otras lenguas, mas alla de generacion degradada.
- Ventana de 2048 tokens: insuficiente para documentos largos, conversaciones multi-turno extensas o pasajes multiples en una sola peticion.
- No dispone de tool calling nativo ni de mecanismos de seguridad alineados documentados; la salida debe filtrarse si se expone a usuarios finales.
- El tag `or2` y la estrategia `strategy-ft` no tienen definicion publica en la informacion disponible, por lo que no puede confirmarse el protocolo exacto de entrenamiento.
- Sin datos de evaluacion: no es posible afirmar que el ajuste mejore la linea base en la tarea objetivo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-phi-1_5-ft
- Modelo base phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset MS MARCO en HuggingFace: https://huggingface.co/datasets/microsoft/ms_marco
- Informe phi-1.5, "Textbooks Are All You Need II" (arXiv:2309.05463): https://arxiv.org/abs/2309.05463
- Informe phi-1, "Textbooks Are All You Need" (arXiv:2306.11644): https://arxiv.org/abs/2306.11644
- Repositorio PEFT: https://github.com/huggingface/peft
- Documentacion de PEFT: https://huggingface.co/docs/peft
