# plantwaterer/garas

## Resumen

garas es un adaptador LoRA de rango 16 desarrollado por el usuario plantwaterer sobre el modelo base google/gemma-4-31B-it. Su proposito no es la generacion de texto libre, sino la resolucion de preguntas de decision de tipo multiple-choice devolviendo una distribucion de probabilidad sobre cada opcion. El adaptador se publica como un repositorio PEFT de aproximadamente 0,5 GB, con licencia Apache 2.0 y la torre de vision del modelo base congelada durante el entrenamiento.

La relevancia del modelo reside en su enfoque: en lugar de generar una respuesta textual y parsearla, lee directamente los logits del siguiente token correspondientes a las letras de las opciones (hasta 52, usando mayusculas y minusculas) y aplica softmax sobre ellas. Esto convierte al modelo en un motor de decision calibrado, apto para integrarse en sistemas que necesitan probabilidades por opcion en lugar de texto generado.

El adaptador se distribuye junto con dos artefactos de inferencia: una clase PyTorch (`GarasForDecision`) con metodos `predict_proba` y `forward` por lotes, y un motor (`GarasEngine`) compatible con el kit Decision Index, que ejecuta una pasada por pregunta con lecturas sobre los logits de las letras y soporta contextos de hasta 32.768 tokens sin truncado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder de google/gemma-4-31B-it, atencion causal estandar |
| Parametros totales | no disponible (adaptador de rango 16 sobre un base de 31B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (limite del motor de inferencia; peticiones mayores se reportan como no soportadas) |
| Tipos de cuantizacion | no disponible (el adaptador se entrena y evalua en bf16; el base admite las cuantizaciones habituales de gemma) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); scripts Python `modeling_garas.py`, `garas_core.py`, `garas_engine.py` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con `lora_alpha = 32` y `lora_dropout = 0.0`, aplicado sobre 410 proyecciones lineales del modelo de lenguaje del base; la torre de vision queda congelada. Se entrena desde la revision `842da3794eaa0b77d5f08bae87a17459d91ff475` de google/gemma-4-31B-it usando atencion causal estandar y un esquema de 18.000 actualizaciones (el resto del schedule de entrenamiento no figura en la informacion disponible).

La innovacion principal esta en la cabeza de decision: el modelo no genera la letra de la opcion, sino que se leen los logits del siguiente token en las posiciones correspondientes a las letras de cada opcion y se normalizan con softmax. Las opciones se presentan en un orden fijo no identitario derivado de un hash de la peticion, lo que evita sesgos posicionales. Las preguntas de mas de 52 opciones se resuelven en dos rondas, y las preguntas si/no usan las opciones `Yes` y `No` en ese orden, mostrando las definiciones de criterio cuando la peticion las aporta. El adaptador se carga con `autocast_adapter_dtype=False` para mantener la actualizacion LoRA en bf16, la aritmetica de entrenamiento y evaluacion.

## Capacidades

- Decision multiple-choice con probabilidad por opcion: hasta 52 alternativas por pregunta, leidas directamente de los logits de las letras.
- Preguntas si/no con soporte de definiciones de criterio (`Yes: <definicion>` / `No: <definicion>`).
- Peticiones compuestas: un estado compartido mas multiples preguntas nombradas, cada una con su propia distribucion de probabilidad.
- Inferencia por lotes con `forward()`, devolviendo `option_logits`, `log_probs` y `probs` con padding a la derecha.
- Calculo de entropia cruzada sobre las opciones mediante `forward(..., labels=...)`, util para evaluacion supervisada.
- Compatibilidad con `torch.compile` (con `dynamic=True`), aunque los kernels compilados redondean bf16 de forma distinta.
- Capacidades heredadas del base: comprension de lenguaje natural y vision (torre congelada, no adaptada), sin garantia de rendimiento en tareas generativas tras el ajuste LoRA.
- Soporte de tool calling y agentes: no documentado en la informacion disponible.

## Casos de uso

- Enrutamiento de decisiones en pipelines automatizados: dado un estado y un conjunto de acciones posibles, obtener la probabilidad de cada accion para elegir con umbral configurable, en lugar de parsear texto generado.
- Validacion documental y control de consistencia: comprobar si una factura cuadra con su orden de compra mediante una pregunta si/no con criterios definidos, como muestra el ejemplo de la model card.
- Sistemas de recomendacion con incertidumbre: exponer la distribucion completa sobre las opciones permite ordenar alternativas y aplicar politicas de exploracion en funcion de la confianza.
- Toma de decisiones operativas con contexto largo: el motor admite peticiones de hasta 32.768 tokens, suficiente para incluir historiales, politicas o expedientes completos junto a la pregunta.
- Evaluacion de modelos de decision: el retorno de entropia cruzada sobre las opciones con etiquetas oro facilita medir calibracion y acierto en conjuntos de validacion propios.
- Investigacion sobre calibracion y sesgos posicionales: el orden de opciones derivado de hash y la lectura directa de logits permiten estudiar como varia la probabilidad segun la formulacion sin contaminacion por generacion de texto.
- Clasificacion de intenciones en asistentes conversacionales: mapear la intencion del usuario a una de N opciones predefinidas con una unica pasada por pregunta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa aproximadamente 0,5 GB, pero requiere cargar el modelo base google/gemma-4-31B-it completo en bf16 para la inferencia.
- VRAM estimada en bf16: en torno a 62 GB solo para los pesos del base, mas activaciones y cache; se necesitan GPUs de 80 GB (A100, H100) para ejecucion holgada.
- Con cuantizacion del base (no documentada para este adaptador) podria reducirse el requisito, pero la model card especifica bf16 y `autocast_adapter_dtype=False` para reproducir los resultados.
- No cabe en GPUs de consumo como la RTX 4090 (24 GB) sin cuantizacion agresiva del base, no validada en la informacion disponible.
- Despliegue: transformers + peft (probado con transformers 5.12.1 y peft 0.21.2), clase `GarasForDecision` o motor `GarasEngine` del kit Decision Index; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el motor ejecuta una pasada por pregunta con lotes con padding a la derecha y un limite de 32.768 tokens por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| garas | LoRA r16 sobre base de 31B | 32.768 tokens (motor) | Decision multiple-choice con probabilidades | Apache 2.0 | Hugging Face (PEFT) |
| google/gemma-4-31B-it | 31B | no disponible en la informacion | Generacion de texto generalista | no disponible en la informacion | Hugging Face |
| Alternativas de clasificacion/decision | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador solo resuelve preguntas de decision con opciones explicitas; no esta pensado para generacion de texto abierto ni para tareas generativas generales.
- Limite estricto de 32.768 tokens por peticion en el motor: las peticiones mayores se reportan como no soportadas, sin truncado silencioso.
- Maximo de 52 opciones por pregunta; por encima se requieren dos rondas, lo que anade complejidad y posible perdida de coherencia entre rondas.
- Los kernels de `torch.compile` redondean bf16 de forma distinta; para reproducir los numeros reportados hay que usar modo eager.
- La torre de vision esta congelada y no fue adaptada: no hay garantia de que el adaptador funcione bien con entradas multimodales.
- Idiomas soportados no documentados; el comportamiento fuera del ingles no esta verificado.
- Riesgo de alucinacion y sesgos del base (gemma-4-31B-it) no evaluado especificamente para este adaptador; la calibracion de las probabilidades depende del dominio de entrenamiento, no descrito en detalle.
- La licencia Apache 2.0 del adaptador no exime de cumplir las condiciones del modelo base subyacente.
- Solo 98 descargas y 0 likes en el momento de la ficha: ecosistema de validacion muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/plantwaterer/garas
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Decision Index kit: https://github.com/apolinario/decision-index
