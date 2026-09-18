# arianaazarbal/ct-inkling-oai-ed7-mid-g1-b1

## Resumen

ct-inkling-oai-ed7-mid-g1-b1 es un adaptador LoRA (rango 64, `target_modules=all-linear`) publicado por el usuario arianaazarbal sobre el modelo base `thinkingmachines/Inkling-Small`. No es un modelo completo, sino un ajuste de etapa 1 (SFT con LoRA) entrenado exclusivamente en modo *midtrain* sobre un corpus sintetico de documentos que instancian una constitucion concreta. Forma parte del programa de investigacion de entrenamiento constitucional iterado (`welfare-in-ai-rnd / constitutional_training`), en el que cada generacion se entrena desde cero sobre el modelo base, sin heredar pesos de la generacion anterior.

La logica del linaje es el aspecto diferencial: la generacion 0 se siembra con una constitucion escrita por humanos (en esta cadena, un resumen de 5.000 tokens del OpenAI Model Spec), y la generacion N mayor o igual que 1 se siembra con una constitucion escrita por el modelo de la generacion N-1 de la misma rama, seleccionada como medoide de embeddings de un pool de 40 cadenas autogeneradas. La deriva entre generaciones se acumula unicamente a traves de los documentos de entrenamiento, nunca a traves de los pesos. Esta ficha corresponde a la generacion 1, rama b1, con el metodo de elicitacion de semilla ed7 (una edicion de desacuerdo forzado sobre la semilla de generacion 0).

El artefacto es relevante ahora como material de reproducibilidad y auditoria para quien investigue alineacion mediante constituciones autogeneradas: permite comparar ramas y generaciones bajo una receta fijada, y evaluar como una constitucion concreta se traduce en comportamiento observable. El repositorio ocupa 16,9 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada para el modelo base. El artefacto es un adaptador LoRA (PEFT) con rango 64 y `target_modules=all-linear` sobre `thinkingmachines/Inkling-Small` |
| Parametros totales | No disponible (el adaptador no declara numero de parametros; el repositorio ocupa 16,9 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible para el modelo base. La longitud maxima usada en el entrenamiento del adaptador fue de 8192 tokens |
| Tipos de cuantizacion | No disponible para el adaptador (se distribuye en safetensors). La cuantizacion aplicable depende del modelo base y del runtime empleado |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors, en formato de adaptador LoRA para PEFT |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `thinkingmachines/Inkling-Small`, un modelo de generacion de texto cuya arquitectura interna no se detalla en la informacion disponible. La receta de entrenamiento esta fijada y documentada: LoRA con rango 64 y `target_modules=all-linear`, learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. El regimen es unicamente *midtrain*: SFT de etapa 1 sobre un corpus sintetico de documentos que instancian la constitucion de esa generacion. La constitucion empleada se incluye en el repositorio como `training_seed_constitution.md`.

La innovacion metodologica no esta en la arquitectura sino en el bucle de entrenamiento: cada generacion arranca de nuevo desde los pesos del modelo base y solo hereda informacion a traves del texto de la constitucion semilla. La generacion 1 de esta cadena recibio una semilla derivada de la generacion 0 mediante el metodo ed7, descrito como una edicion de desacuerdo forzado, y fue seleccionada como medoide de embeddings con filtrado (gated) dentro de un pool de 40 cadenas autogeneradas. El autor recomienda servir y evaluar con el renderer `tml_v0`, con el razonamiento desactivado y esfuerzo 0.0. El adaptador se exporto desde Tinker el 2026-09-18, con registro de exportacion en `tinker_meta.json`, y el entrenamiento se realizo el 2026-09-17.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base `thinkingmachines/Inkling-Small`.
- Instanciacion de comportamiento guiado por una constitucion concreta, entrenada de forma explicita sobre un corpus sintetico derivado de esa constitucion.
- Reproducibilidad de linaje: el repositorio incluye la constitucion semilla y los metadatos de exportacion, lo que permite auditar que documento origino este adaptador.
- Comparacion controlada entre generaciones y ramas bajo una receta identica (rama b1, generacion 1, metodo ed7, regimen mid).
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; la configuracion de evaluacion indicada desactiva explicitamente el razonamiento (`reasoning OFF`).
- Capacidades multilingues: no documentadas.
- Capacidades especiales (vision, audio, modo thinking): no documentadas.
- Carga estandar via PEFT: `PeftModel.from_pretrained` sobre el modelo base en `bfloat16`.

## Casos de uso

- Investigacion en entrenamiento constitucional iterado: permite estudiar como una constitucion autogenerada por una generacion previa se traduce en comportamiento, usando este adaptador como punto de medida de la generacion 1 en la rama b1.
- Estudio de deriva entre generaciones: al entrenarse cada generacion desde el modelo base, este adaptador sirve de referencia para cuantificar que parte del cambio de comportamiento proviene exclusivamente del texto de la constitucion y no de los pesos.
- Auditoria de alineacion: comparar las respuestas de este adaptador con las del modelo base sin adaptador ante un mismo conjunto de prompts permite aislar el efecto del ajuste LoRA sobre criterios normativos concretos.
- Analisis del metodo de elicitacion ed7: el repositorio incluye la constitucion semilla resultante de una edicion de desacuerdo forzado, lo que permite evaluar hasta que punto ese sesgo de edicion se refleja en las salidas del modelo.
- Replicacion experimental: la receta esta completamente fijada (rango 64, lr 1e-4, coseno con 5 % de warmup, 1 epoca, batch 128, max length 8192, semilla 42), de modo que un grupo de investigacion puede reproducir el entrenamiento y contrastar resultados.
- Generacion de texto condicionada por una politica explicita: en escenarios de investigacion donde se necesita un generador cuyo comportamiento siga un documento normativo dado, en lugar de un ajuste generico de instrucciones.
- Punto de partida para experimentos posteriores: el adaptador puede reutilizarse como base para estudiar ediciones adicionales de constitucion o para comparar con las demas ramas del mismo linaje.
- Evaluacion de robustez y seguridad: al ser un artefacto con cero descargas y sin validacion publica, resulta util como caso de prueba para pipelines de evaluacion de modelos antes de cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo: todos los resultados obtenidos corresponden a sitios de trading de divisas (MQL5 y Forex Factory), sin ninguna conexion con este artefacto.

## Requisitos de hardware

- VRAM de inferencia: no disponible. Al ser un adaptador LoRA, el consumo viene determinado casi por completo por el modelo base `thinkingmachines/Inkling-Small`, cuyo tamano de parametros no se especifica en la informacion proporcionada.
- Peso del artefacto: el repositorio ocupa 16,9 GB, cantidad que hay que descargar ademas de los pesos del modelo base.
- Precision recomendada: `bfloat16` con `device_map="auto"`, segun el ejemplo de carga del autor.
- GPU recomendadas: no disponibles. La eleccion depende del tamano del modelo base; no hay datos para afirmar si cabe en una GPU de consumo.
- GPU de consumo: no confirmable con la informacion disponible.
- Opciones de despliegue: `transformers` + `peft` es la via documentada. Tambien seria teoricamente posible servir el adaptador con vLLM (soporte LoRA) o TGI (adaptadores), o fusionarlo en el modelo base con `merge_and_unload` para usar cualquier stack estandar, aunque ninguna de estas rutas esta verificada en la model card.
- llama.cpp / Ollama / GGUF: no disponible; no se publican pesos GGUF ni conversion del adaptador.
- Latencia y throughput: no disponibles. En inferencia, un adaptador LoRA anade una sobrecarga pequena y aproximadamente constante frente al modelo base, pero no hay mediciones publicadas.
- Entrenamiento: la receta documentada usa batch 128 y longitud maxima 8192, lo que implica que el modelo base admite secuencias de al menos 8192 tokens; no se especifica el hardware utilizado (el entrenamiento se realizo en Tinker).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-inkling-oai-ed7-mid-g1-b1 (este adaptador) | No disponible | No disponible (entrenado con max. 8192 tokens) | Sin benchmarks publicados | No disponible | Publico en HuggingFace, 0 descargas |
| thinkingmachines/Inkling-Small (modelo base) | No disponible | No disponible | Sin datos en la informacion proporcionada | No disponible | Publico en HuggingFace |
| Otras generaciones o ramas del linaje `inkling-oai-ed7` (por ejemplo la generacion 0 o la rama b1 frente a otras replicas) | No disponible | No disponible | Sin benchmarks publicados | No disponible | No confirmada su publicacion |
| Adaptadores constitucionales equivalentes sobre otros modelos base | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita no puede asumirse permiso para uso comercial. Cualquier uso en produccion requiere aclarar este punto con el autor y verificar la licencia del modelo base, que tampoco se especifica.
- Ausencia total de validacion publica: cero descargas y cero valoraciones en el momento de la consulta. No hay evidencia externa de calidad, estabilidad ni seguridad.
- Sin benchmarks: no hay ninguna metrica publicada que permita estimar el rendimiento en tareas de razonamiento, codigo o matematicas.
- Riesgo de alucinacion: no evaluado. No se han publicado tasas de alucinacion ni evaluaciones de veracidad para este adaptador ni para el modelo base en la informacion disponible.
- Dependencia del modelo base: el adaptador no es autonomo; sin `thinkingmachines/Inkling-Small` no es funcional, y sus limites de contexto, idioma y conocimiento son los del base.
- Idiomas no declarados: se desconoce el soporte multilingue real. No debe asumirse buen rendimiento en castellano.
- Corpus de entrenamiento sintetico: el ajuste se realiza sobre documentos generados que instancian una constitucion, no sobre datos naturales de instruccion. Esto puede producir un comportamiento muy condicionado por ese documento y poco generalizable.
- Deriva por diseno: el programa asume deriva acumulativa entre generaciones a traves de las constituciones escritas por el propio modelo, lo que implica un riesgo estructural de degradacion o de sesgo heredado del texto semilla.
- Sesgos conocidos: no documentados explicitamente, pero una constitucion derivada del OpenAI Model Spec y editada mediante un procedimiento de desacuerdo forzado puede incorporar sesgos normativos propios de esas fuentes.
- Configuracion de uso restringida: el autor indica servir y evaluar con el renderer `tml_v0` con razonamiento desactivado y esfuerzo 0.0. Usar otra configuracion puede dar resultados no comparables con los previstos por el programa de investigacion.
- Fechas de entrenamiento y exportacion en 2026, posteriores a la fecha de consulta habitual de muchos pipelines; conviene verificar la coherencia de metadatos antes de integrar el artefacto.
- Repositorio de 16,9 GB: el almacenamiento y el ancho de banda necesarios para descargarlo son considerables para un adaptador LoRA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-oai-ed7-mid-g1-b1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Constitucion semilla de esta generacion: `training_seed_constitution.md` (incluido en el repositorio)
- Registro de exportacion: `tinker_meta.json` (incluido en el repositorio)
- OpenAI Model Spec (semilla de la generacion 0, resumen de 5.000 tokens): https://model-spec.openai.com/
- Repositorio del programa constitutional_training / welfare-in-ai-rnd: no disponible
- Paper o informe tecnico asociado: no disponible
- Demo o espacio interactivo: no disponible
- Resultados de la busqueda web: no se encontro ningun enlace relevante; los unicos resultados devueltos pertenecen a sitios de trading (https://www.mql5.com/ y https://www.forexfactory.com/), sin relacion con el modelo.
