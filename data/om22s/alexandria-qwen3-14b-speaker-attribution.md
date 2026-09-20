# Om22s/alexandria-qwen3-14b-speaker-attribution

## Resumen

Alexandria Qwen3-14B speaker-attribution es un adaptador LoRA de tipo PEFT desarrollado por el usuario Om22s dentro del proyecto Alexandria Audiobook. No es un modelo completo: se trata de pesos de adaptador (rango 8, alpha 16, dropout 0.05) que deben cargarse sobre el modelo base Qwen/Qwen3-14B (revisión 40c069824f4251a91eefaf281ebe4c544efd3e18). Su tarea concreta es asignar hablantes a diálogos entrecomillados en textos de novela ligera, devolviendo un objeto JSON estructurado por cada entrada de diálogo a partir de un roster de candidatos proporcionado en el prompt.

El adaptador resuelve un problema muy específico dentro de la pipeline de producción de audiolibros: determinar qué personaje pronuncia cada línea de diálogo cuando el texto original no lo indica explícitamente. Para ello se entrena con el formato de atribución estructurada propio de Alexandria, y su uso previsto se limita a ese prompt concreto; las peticiones de chat convencionales quedan fuera del caso de uso medido.

Es relevante sobre todo como artefacto de investigación y reproducibilidad: el propio autor lo marca como experimental y superseded, ya que una versión posterior (Om22s/alexandria-qwen3-attribution) lo reemplaza con adaptadores con derechos de uso más limpios. El resultado de evaluación es mixto (mejora en dos libros, regresión en el mayor), lo que justifica su etiqueta de experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen/Qwen3-14B |
| Parametros totales | No disponible para el adaptador; modelo base Qwen/Qwen3-14B (~14B, dato no confirmado en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base |
| Tipos de cuantizacion | Entrenado en BF16 LoRA (no 4-bit QLoRA); el autor incluye guia para llama.cpp, sin lista de cuantizaciones publicada |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos de adaptador PEFT; no se redistribuye el modelo base) |

Detalles adicionales del adaptador: rango 8, alpha 16, dropout 0.05, modulos objetivo q/k/v/o y proyecciones gate/up/down. Framework PEFT 0.20.0. Tamano del repositorio 0.1 GB.

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-14B, un transformer denso, mediante LoRA de rango 8 y alpha 16 con dropout 0.05, atacando los modulos de atencion (q/k/v/o) y las proyecciones de la MLP (gate/up/down). El entrenamiento se realizo en precision BF16, con una sola epoca, tasa de aprendizaje 2e-5 y semilla de entrenamiento y datos 20260904. El manifiesto de entrenamiento (training_manifest.json) registra el commit del codigo, el hash del harness, el hash de datos, las semillas y la receta. El SHA-256 de la mezcla de entrenamiento es ab1bc2565444e8a96f11ed2835c1d5e70741a64bad1226de46126ca25e7ad8ba.

La informacion disponible no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, y el autor declara explicitamente que la mezcla de entrenamiento no se incluye porque el nombre del fichero no basta para establecer la licencia ni la composicion de cada fila de origen. Tampoco se documenta el uso de RLHF o DPO; el entrenamiento es un ajuste supervisado sobre el formato de atribucion estructurada de Alexandria. Como innovacion practica, el adaptador define un contrato de salida estricto: un objeto JSON por entrada, con campos text y speaker, validado contra el roster proporcionado, y el autor recomienda rechazar respuestas malformadas o incompletas.

## Capacidades

- Generacion de texto con salida estructurada en JSON para atribucion de hablante en dialogos entrecomillados.
- Asignacion de hablantes a partir de un roster de candidatos suministrado en el prompt, con texto de dialogo y narracion circundante como contexto.
- Cumplimiento de un contrato de salida de un objeto JSON por entrada, con reglas de validacion explicitas (USAGE.md).
- Reproduccion determinista con temperatura 0 en el protocolo de evaluacion del proyecto.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio.

## Casos de uso

- Atribucion automatica de dialogos en audiolibros: el adaptador recibe cada linea entrecomillada junto con su narracion de contexto y el roster de personajes, y devuelve el hablante en JSON para alimentar la fase de casting de voces.
- Preprocesado de corpus de novela ligera: integrado en una pipeline de conversion texto a voz, permite etiquetar hablantes antes de sintetizar cada linea con la voz correspondiente.
- Herramienta de anotacion asistida: los editores pueden usar las salidas JSON como sugerencia inicial y corregir despues, reduciendo el trabajo manual de etiquetado de dialogos.
- Investigacion sobre atribucion de hablante: sirve como punto de partida reproducible para comparar tecnicas de adaptacion (LoRA frente a ajuste completo) sobre un modelo base fijo.
- Reproducibilidad de resultados: al conservarse el manifiesto de entrenamiento y las semillas, permite reconstruir el experimento y auditar la mejora reportada.
- Validacion de contratos de salida estricta: util como caso de estudio de como forzar salidas JSON verificables y rechazar respuestas fuera de formato en produccion.
- Experimentacion local de bajo coste: al ser un adaptador LoRA de 0,1 GB, se puede cargar y probar sobre el base sin duplicar los pesos completos del modelo.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados, verified: false) en el model-index y la model card. Evaluacion pareada base frente a adaptador, con prompts identicos, generacion determinista (temperatura 0) y 383 filas de dialogo con etiqueta dorada en tres novelas ligeras. Son fixtures de subconjunto dificil creados por el proyecto, no muestras representativas de libros completos.

| Libro | Filas | Base | Adaptador | Delta |
|---|---:|---:|---:|---:|
| Index 18 | 88 | 61,4 % | 73,9 % | +12,5 |
| Mushoku Tensei 16 | 133 | 51,9 % | 54,1 % | +2,3 |
| Owarimonogatari 3 | 162 | 38,9 % | 35,2 % | -3,7 |
| **Agregado** | **383** | **48,6 %** | **50,7 %** | **+2,1** |

El resultado agregado es una mejora de 2,1 puntos porcentuales, pero con un comportamiento por libro desigual: mejora en dos novelas y empeora en la mayor, motivo por el que el autor etiqueta el adaptador como experimental. Se trata de una medicion de investigacion pareada, no de un benchmark de producto.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Al ser un adaptador sobre Qwen3-14B, los requisitos vienen determinados por el modelo base, no por el adaptador.
- GPU recomendadas: no disponible. El autor solo indica carga con device_map="auto" en transformers y ofrece guia para llama.cpp.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: transformers con PEFT 0.20.0 (ejemplo de carga con AutoModelForCausalLM y PeftModel), y llama.cpp segun la guia incluida en USAGE.md.
- Latencia y throughput: no disponible.

Nota practica: el repositorio ocupa 0,1 GB, por lo que el coste de almacenamiento del adaptador es minimo frente a los pesos completos del modelo base.

## Comparativa con modelos similares

No se dispone de modelos comparables de la misma categoria en la informacion proporcionada. La comparacion mas directa es con el propio modelo base y con la version sucesora del proyecto:

| Modelo | Relacion | Parametros | Contexto | Resultado en la misma evaluacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Om22s/alexandria-qwen3-14b-speaker-attribution | Adaptador LoRA evaluado | rango 8 sobre ~14B | No disponible | 50,7 % (agregado, 383 filas) | apache-2.0 | HuggingFace, marcado como experimental y superseded |
| Qwen/Qwen3-14B | Modelo base sin adaptar | ~14B | No disponible | 48,6 % (agregado, 383 filas) | No disponible en esta informacion | HuggingFace |
| Om22s/alexandria-qwen3-attribution | Version sucesora recomendada | No disponible | No disponible | No disponible | No disponible | HuggingFace (reemplaza a este adaptador) |

## Limitaciones y advertencias

- Resultado de evaluacion mixto: mejora en dos libros y regresion de 3,7 puntos en el mayor, lo que impide recomendar su uso en produccion sin validacion previa.
- Marcado explicitamente como superseded y experimental; el propio autor redirige a Om22s/alexandria-qwen3-attribution como version recomendada.
- Fuera del prompt estructurado de Alexandria y del contrato JSON, su comportamiento no esta medido; el autor advierte que los prompts de chat ordinarios quedan fuera del caso de uso evaluado.
- Riesgo de alucinacion no cuantificado, pero el contrato exige rechazar hablantes que no figuren en el roster y respuestas JSON malformadas o incompletas.
- Cobertura idiomatica limitada al ingles segun los metadatos del modelo.
- Trazabilidad de datos incompleta: la mezcla de entrenamiento no se publica y su nombre de fichero no basta para establecer la licencia ni la composicion de cada fila de origen.
- Las cifras de benchmark no estan verificadas (verified: false) y el artefacto a nivel de fila se conserva de forma privada, por lo que la reproduccion externa completa no es posible solo con el repositorio.
- La evaluacion usa fixtures de subconjunto dificil creados por el proyecto, no muestras representativas de libros completos.
- Licencia apache-2.0 sobre el adaptador, pero los pesos del modelo base no se redistribuyen en este repositorio y quedan sujetos a su propia licencia.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/Om22s/alexandria-qwen3-14b-speaker-attribution
- Modelo base Qwen/Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Version sucesora recomendada: https://huggingface.co/Om22s/alexandria-qwen3-attribution
- Repositorio del proyecto Alexandria Audiobook: https://github.com/on22s/alexandria-audiobook2
- Recetas y procedencia del entrenamiento (RECIPES.md): https://github.com/on22s/alexandria-audiobook2/blob/main/RECIPES.md
- Evaluadores y experimentos: https://github.com/on22s/alexandria-audiobook2/tree/main/app/experiments
- Prompt de atribucion usado en entrenamiento y evaluacion: default_prompts_attribute.txt (en el repositorio de HuggingFace)
- Contrato de salida y carga PEFT: USAGE.md (en el repositorio de HuggingFace)
- Resumen de evaluacion sin texto de origen: evaluation_summary.json (en el repositorio de HuggingFace)
