# rihhito/functiongemma-270m-it-simple-tool-calling

## Resumen

`rihhito/functiongemma-270m-it-simple-tool-calling` es un ajuste fino supervisado (SFT) del modelo base `google/functiongemma-270m-it`, un modelo de la familia Gemma 3 orientado a la generacion de llamadas a funciones (tool calling). El ajuste lo publica el usuario `rihhito` y esta pensado para tareas sencillas de invocacion de herramientas en conversaciones de un solo turno o de pocos turnos.

El modelo conserva el tamano compacto del base: 268.098.176 parametros totales (aproximadamente 270 millones), lo que lo situa en la categoria de modelos ultraligeros aptos para inferencia en CPU o en GPUs de consumo muy modestas. La arquitectura subyacente es `gemma3_text`, es decir, la variante solo texto de Gemma 3, implementada en Transformers.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de ajuste fino con TRL sobre un modelo pequeno especializado en function calling. No se han publicado datos de evaluacion, composicion del dataset de entrenamiento ni resultados de benchmarks, por lo que su utilidad practica debe validarse empiricamente antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante `gemma3_text`) |
| Parametros totales | 268.098.176 (~270 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion posterior via GGUF/AWQ, no confirmado por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base `google/functiongemma-270m-it`, que pertenece a la familia Gemma 3 en su variante solo texto (`gemma3_text`). Se trata de un transformer decoder-only de aproximadamente 270 millones de parametros. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni longitud de contexto nativa en la informacion proporcionada.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL version 1.19.0, sobre Transformers 5.22.1, PyTorch 2.14.1+cpu, Datasets 4.8.5 y Tokenizers 0.23.3. El autor no detalla el volumen de datos, la composicion del dataset, si hubo etapas de RLHF/DPO posteriores ni hiperparametros de entrenamiento. El nombre del modelo sugiere un enfasis en tool calling "simple", pero no se aporta evidencia cuantitativa de ello.

## Capacidades

- Generacion de texto conversacional en formato de chat (roles `user`/`assistant`), tal como muestra el ejemplo de la model card con `pipeline("text-generation", ...)`.
- Vocacion declarada de tool calling / function calling, heredada del base `functiongemma-270m-it` y reforzada (segun el nombre) por el ajuste fino.
- Soporte de conversaciones de un solo turno o de pocos turnos; no hay evidencia publicada de manejo de contextos largos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Razonamiento multi-paso, agentes, vision o audio: no disponibles o no declaradas.

## Casos de uso

- Clasificacion e invocacion de herramientas en asistentes de bajo coste: el modelo puede recibir una pregunta del usuario y emitir una llamada a funcion estructurada, aprovechando su tamano de 270 M para ejecutarse en entornos con recursos muy limitados.
- Enrutamiento de intenciones en pipelines de agentes: usar el modelo como primer eslabon que decide que herramienta invocar antes de delegar en un modelo mayor, reduciendo coste y latencia.
- Prototipado rapido de function calling en local: al ser un modelo de ~270 M, se puede cargar con `transformers` en una maquina sin GPU dedicada para validar esquemas de herramientas.
- Educacion y experimentacion con SFT: sirve como ejemplo reproducible de ajuste fino con TRL sobre un modelo Gemma pequeno para quienes quieran replicar el flujo.
- Asistentes embebidos o edge: su huella de memoria reducida permite desplegarlo en dispositivos con poca VRAM o en CPU, para tareas de extraccion de parametros de llamadas a API.
- Filtrado y preprocesado de consultas: generar llamadas a funciones simples para normalizar entradas antes de pasarlas a un sistema mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, BFCL ni ninguna otra evaluacion, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1,1 GB solo para pesos, mas overhead de activaciones y KV cache.
- En bf16/fp16: aproximadamente 0,55 GB para pesos.
- En cuantizacion de 8 bits: aproximadamente 0,3 GB; en 4 bits: aproximadamente 0,15 GB (estimaciones teoricas a partir del numero de parametros; no confirmadas por el autor).
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` (confirmado por la model card), y presumiblemente `text-generation-inference` (tag `text-generation-inference` en Hugging Face) y `llama.cpp`/`Ollama` si se generan pesos GGUF, aunque no hay confirmacion de que existan conversion disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `rihhito/functiongemma-270m-it-simple-tool-calling` | ~270 M | no disponible | no disponible | Ajuste SFT con TRL sobre `google/functiongemma-270m-it`; sin benchmarks publicados |
| `google/functiongemma-270m-it` | ~270 M | no disponible en esta ficha | la del modelo base de Google (consultar su model card) | Modelo base oficial; referencia directa para comparar el efecto del ajuste |
| `google/gemma-3-270m-it` (si existe en el catalogo) | ~270 M | no disponible en esta ficha | Gemma Terms of Use | Variante instructiva generalista de la misma familia; no especializada en tool calling |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas. La comparacion anterior es estructural, no de calidad.

## Limitaciones y advertencias

- No hay benchmarks ni evaluacion publicada: no se puede afirmar que el ajuste mejore al base en tool calling sin una validacion propia.
- La licencia no esta especificada en la model card (`licence: license`), lo que impide determinar si el uso comercial esta permitido. Ademas, al derivar de un modelo Gemma de Google, quedaria sujeto a los terminos de la familia Gemma, que deben consultarse.
- Riesgo de alucinacion elevado por el tamano reducido del modelo (~270 M): es probable que falle en llamadas con muchos parametros, esquemas complejos o valores anidados.
- Idiomas soportados no declarados; el comportamiento multilingue no esta garantizado.
- Longitud de contexto no documentada; no se recomienda su uso en conversaciones largas o con historiales extensos.
- El ejemplo de la model card usa una pregunta abierta ("If you had a time machine...") en lugar de un caso de tool calling, lo que sugiere que la documentacion no refleja necesariamente el caso de uso declarado.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni de validacion externa.
- Entrenado con PyTorch 2.14.1+cpu y Transformers 5.22.1: conviene verificar compatibilidad con la version de Transformers instalada en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rihhito/functiongemma-270m-it-simple-tool-calling
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de Gemma 3 (familia del modelo base): no disponible en la informacion proporcionada
- Paper o blog del ajuste: no disponible en la informacion proporcionada
