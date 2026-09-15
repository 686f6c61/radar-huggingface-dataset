# koreallmdev/qwen3.8-korean-27b-original-adapter

## Resumen

El repositorio `koreallmdev/qwen3.8-korean-27b-original-adapter` contiene un adaptador LoRA/PEFT, no un modelo completo, ajustado para tareas de coreano y de codigo en coreano sobre un modelo base de la familia Qwen3.8. El autor lo publica como "Original Korean Adapter", es decir, unicamente el resultado final de un unico entrenamiento, sin fusionar con el modelo base, sin adaptadores de reparacion y sin los artefactos de investigacion de enrutado (Recall/Shadow Router). El peso del repositorio es de 0,3 GB, coherente con un adaptador y no con un modelo de 27B en precision completa.

La relevancia de esta ficha es limitada y conviene ser explicito: el modelo tiene 0 descargas y 0 likes, no declara licencia ni idiomas en los metadatos y no incluye resultados de benchmarks publicos. Su unico dato de evaluacion es una puntuacion interna de 94,048 en un conjunto propio de 42 tareas en coreano con backend Transformers, una cifra que el propio autor advierte que no es un benchmark publico estandar y que depende de condiciones de prompt y scorer no documentadas.

Un detalle critico para cualquier uso real: `adapter_config.json` apunta como modelo base a una ruta local (`/home/saul9523/dgx_ai_factory/models/qwen3_8_27b_uncensored_bf16`) que no es accesible publicamente. El usuario debe sustituirla por un base compatible de la misma familia y tamano. Ademas, el nombre del base sugiere una variante "uncensored", lo que implica que las salvaguardas de seguridad del modelo resultante dependen por completo del base elegido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/PEFT sobre un transformer decoder-only de la familia Qwen3.8 (segun el autor); arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | No disponible. El adaptador no contiene los pesos del base; el nombre del repositorio indica 27B para el modelo base |
| Parametros activos | No disponible (no se indica que el base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye como safetensors, presumiblemente en la precision del entrenamiento) |
| Idiomas soportados | Coreano como idioma objetivo del ajuste; el resto de idiomas no esta declarado en los metadatos ("no disponibles") |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Libreria | `peft` |
| Pipeline | `text-generation` |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion / actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA entrenado sobre un base de la familia Qwen3.8 de 27B, segun la nomenclatura del autor. La unica informacion de entrenamiento disponible en la model card es la ruta de procedencia: `06_train/qwen38_korean_only_ddp2_v1_2/run_20260913_202716/FINAL_ADAPTER`, exportada el 2026-09-15 en modo "current-result-only". El sufijo `ddp2` sugiere entrenamiento distribuido en dos procesos (DDP), pero no se documentan tokens de entrenamiento, composicion del dataset, hiperparametros de LoRA (rango, alpha, modulos objetivo), ni si hubo fases de RLHF, DPO u otro ajuste por preferencias.

Tampoco se documenta ninguna innovacion tecnica: no hay decodificacion especulativa, atencion lineal ni modulos híbridos descritos. El valor tecnico del repositorio esta, por tanto, en el adaptador en si y en la receta de entrenamiento no publicada, no en aportaciones arquitectonicas. El unico dato de calidad es la evaluacion interna de 42 tareas en coreano, que alcanza 94,048 con backend Transformers, con la advertencia explicita del autor de que no equivale a un benchmark publico y de que el resultado varia con el backend, el prompt y el scorer.

## Capacidades

- Generacion de texto conversacional en coreano, segun el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Generacion y asistencia en codigo en coreano (etiqueta `coding` y ajuste especifico para "tareas de codigo en coreano").
- Ajuste de dominio sobre el base Qwen3.8, heredando las capacidades de este (no documentadas en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara coreano como objetivo del ajuste; el resto no esta confirmado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en coreano: el adaptador esta ajustado especificamente para produccion de texto en coreano, por lo que puede emplearse como capa de especializacion sobre el base para respuestas en ese idioma en sectores como comercio electronico o telecomunicaciones, siempre que se valide antes la calidad conversacional con evaluaciones propias.
- Asistente de programacion en coreano: dado el ajuste declarado para codigo, encaja en entornos donde los desarrolladores escriben especificaciones, revisiones de codigo y comentarios en coreano y esperan respuestas en el mismo idioma.
- Documentacion tecnica y comentarios de codigo: generacion de docstrings, mensajes de commit y documentacion de API en coreano, integrable en un pipeline que cargue el base y aplique el adaptador mediante `PeftModel`.
- Analisis de incidencias y tickets internos: clasificacion y resumen de tickets en coreano con contexto conversacional multi-turno, aprovechando el pipeline de generacion de texto.
- Base para ajuste adicional de dominio: al ser un adaptador LoRA, puede combinarse con tecnicas de fusion de adaptadores (LoRA merging) para anadir especializaciones verticales sin reentrenar el modelo completo, reduciendo coste frente a un fine-tuning completo de 27B.
- Investigacion sobre especializacion linguistica: caso de uso metodologico para estudiar como un adaptador pequeno (0,3 GB) modifica el comportamiento de un base de 27B en un idioma concreto y que grado de olvido catastrofico provoca en otros idiomas.
- Despliegue interno con control de versiones del adaptador: al mantener el adaptador separado del base, es posible servir varias especializaciones (coreano, otros dominios) sobre una unica instancia del base con conmutacion de adaptadores en frameworks como vLLM.

## Benchmarks y rendimiento

El unico resultado reportado por el autor es una evaluacion interna. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes en coreano como KMMLU o HAERAE) en la informacion disponible.

| Evaluacion | Backend | Resultado | Naturaleza |
|---|---|---|---|
| Benchmark interno de 42 tareas en coreano | Transformers | 94,048 | Interno del proyecto, no es un benchmark publico estandar |

El autor advierte explicitamente de que la cifra depende del backend, del prompt y del scorer, y de que no debe compararse con puntuaciones de benchmarks publicos. No hay datos de latencia ni throughput.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamano del base (27B) y de formulas estandar de pesos mas cache KV; el repositorio no publica mediciones.

- VRAM para el adaptador: despreciable (0,3 GB en disco); el coste real lo determina el modelo base.
- Inferencia del base en bf16/fp16: en torno a 54 GB solo de pesos, mas cache KV y activaciones; se recomienda un margen de 60-70 GB.
- Inferencia del base en 8 bits: aproximadamente 27-30 GB de pesos.
- Inferencia del base en 4 bits (NF4, GPTQ o AWQ): aproximadamente 14-16 GB de pesos, mas cache KV segun la longitud de contexto.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; A100 40 GB, L40S o 2x RTX 4090 para 8 bits; RTX 4090, RTX 3090 o L4 para 4 bits con contexto moderado.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits en GPUs de 24 GB (RTX 3090, 4090) o 16 GB con contexto reducido y cuantizacion agresiva; en bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: Transformers + PEFT (escenario documentado en la model card), vLLM con soporte de adaptadores LoRA, TGI, SGLang y, previa fusion del adaptador con el base y conversion a GGUF, llama.cpp u Ollama.
- Nota operativa: para llama.cpp/Ollama es imprescindible fusionar el adaptador en el base antes de convertir, ya que estos runtimes no cargan adaptadores PEFT directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion rigurosa no es posible con los datos disponibles: el modelo base no esta identificado publicamente (la referencia es una ruta local) y no hay benchmarks publicos del adaptador. Los puntos de referencia naturales serian adaptadores o modelos ajustados para coreano y codigo sobre bases de ~30B, pero no se dispone de sus especificaciones verificadas en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos verificados |
|---|---|---|---|---|---|
| qwen3.8-korean-27b-original-adapter | No disponible (base indicado como 27B) | No disponible | No disponible | HuggingFace, 0 descargas, 0 likes | Solo benchmark interno (94,048 en 42 tareas) |
| Alternativa A: modelos ajustados para coreano sobre bases de ~30B | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativa B: modelos de codigo de ~30B de la familia Qwen | No disponible | No disponible | No disponible | No disponible | No disponible |

Conclusion: no disponible. Cualquier comparacion numerica requeriria fijar primero el modelo base exacto y evaluar el adaptador con un conjunto de benchmarks publicos reproducible.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial; en la practica, el uso en produccion queda en una zona legal ambigua y debe resolverse contactando con el autor.
- Modelo base no publico: `adapter_config.json` apunta a una ruta local del entorno del autor. Es obligatorio sustituirla por un base compatible; si el base elegido no coincide exactamente en arquitectura, modulos objetivo y configuracion de LoRA, el adaptador no cargara o degradara el rendimiento.
- Base potencialmente "uncensored": el nombre del directorio del base sugiere ausencia o reduccion de alineamiento de seguridad. Esto traslada el riesgo de contenido inapropiado o danino directamente al resultado final.
- Riesgo de alucinacion: no hay evaluacion de fidelidad factual, tasas de alucinacion ni verificacion con recuperacion aumentada; se desconoce el comportamiento del adaptador fuera de las 42 tareas internas.
- Olvido catastrofico: al ser un ajuste especifico sobre coreano y codigo, es plausible una degradacion de capacidades en otros idiomas y dominios del base; no se documenta ninguna evaluacion al respecto.
- Benchmark no reproducible: la puntuacion de 94,048 proviene de un conjunto interno de 42 tareas sin publicacion del dataset, del prompt ni del scorer, por lo que no es verificable ni comparable.
- Ausencia de validacion externa: 0 descargas y 0 likes implican que no hay evidencia de uso real en la comunidad ni informes independientes de calidad o fallos.
- Cobertura idiomatica limitada: solo se declara coreano; el soporte multilingue no esta confirmado y no deberia asumirse para castellano u otros idiomas sin pruebas.
- Documentacion incompleta: no se especifican hiperparametros de LoRA, datos de entrenamiento, version del tokenizer ni instrucciones de prompt, lo que dificulta la reproducibilidad.
- Restricciones de contexto: se desconoce la longitud de contexto efectiva; en despliegues con cuantizacion de 4 bits, la cache KV limita ademas el numero de conversaciones concurrentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/koreallmdev/qwen3.8-korean-27b-original-adapter
- Referencia del modelo base indicada por el autor: `/home/saul9523/dgx_ai_factory/models/qwen3_8_27b_uncensored_bf16` (ruta local, no es una URL publica)
- Directorio de origen del adaptador: `/home/saul9523/dgx_ai_factory/06_train/qwen38_korean_only_ddp2_v1_2/run_20260913_202716/FINAL_ADAPTER` (ruta local)
- Paper, blog, repositorio de codigo o demo: no disponible
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (contenido generico sobre Discord), por lo que no se aportan enlaces adicionales verificables.
