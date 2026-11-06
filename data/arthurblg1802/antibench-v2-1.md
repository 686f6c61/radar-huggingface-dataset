# arthurblg1802/AntiBench-v2.1

## Resumen

AntiBench v2.1 es un modelo de lenguaje de muy pequeño tamaño (small language model, SLM) publicado en Hugging Face por el usuario arthurblg1802. Se trata de un modelo base de aproximadamente 3 millones de parámetros (2.982.480 según los metadatos de safetensors), entrenado para generación de texto en inglés. Su rasgo distintivo es que, según la propia model card, ha sido "heavily fine-tuned on wrong data" (fuertemente ajustado con datos erróneos) en formato de HellaSwag y estilo de preguntas y respuestas.

El propósito del modelo parece ser experimental: se trata de un modelo deliberadamente degradado que obtiene puntuaciones cercanas al 0% en los benchmarks estándar de evaluación de modelos pequeños (HellaSwag, ARC, PIQA), con un índice Open SLM index de −51,51. Esto sugiere que su función es servir como caso de prueba o referencia negativa ("anti-benchmark") para validar pipelines de evaluación, detectar errores en harnesses de benchmarking o estudiar el comportamiento de modelos con capacidades mínimas.

No es un modelo apto para uso productivo: sus resultados publicados indican que falla de forma sistemática en tareas de sentido común, razonamiento y aritmética. Su interés para desarrolladores e investigadores radica exclusivamente en su utilidad como modelo de control en entornos de evaluación, o como ejemplo didáctico de cómo un fine-tuning con datos incorrectos puede destruir las capacidades de un modelo base. Utiliza código personalizado (`custom_code` con `trust_remote_code=True`), lo que exige precaución al cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), no disponible el detalle exacto |
| Parametros totales | 2.982.480 (~3 M) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se recomienda float32 en el ejemplo de uso) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un modelo base de tipo text-generation basado en la librería `transformers` de Hugging Face, con aproximadamente 3 millones de parámetros, lo que lo sitúa en el extremo inferior de los modelos de lenguaje (muy por debajo de modelos SLM habituales como Qwen2.5-0.5B o SmolLM2-135M). La model card no detalla la arquitectura interna concreta (numero de capas, dimensiones ocultas, tipo de attention), y el repositorio incluye `custom_code`, por lo que requiere `trust_remote_code=True` para cargarse.

Según el autor, el modelo es un "base general model heavily fine-tuned on wrong data, in HS and Q&A style", es decir, un modelo base general sometido a un fine-tuning intensivo con datos deliberadamente incorrectos, en estilo HellaSwag (HS) y preguntas y respuestas (Q&A). No hay informacion sobre el corpus de preentrenamiento, el numero de tokens de entrenamiento, ni sobre el uso de técnicas como RLHF o DPO. La naturaleza del proyecto sugiere que el objetivo del entrenamiento es producir un modelo con rendimiento deliberadamente patologico, util como referencia negativa en evaluaciones.

## Capacidades

- Generacion de texto basica en ingles mediante el pipeline `text-generation` de transformers.
- Evaluacion estilo multiple-choice por log-likelihood: la model card incluye codigo para puntuar opciones de respuesta calculando la log-probabilidad media por token, tal y como se hace en benchmarks como HellaSwag o ARC.
- Capacidades de razonamiento, matematicas y sentido comun: practicamente nulas; los benchmarks publicados muestran puntuaciones de 0,00% en HellaSwag, ARC-Easy, ARC-Challenge y ArithMark-3.0, y 0,16% en PIQA.
- No hay soporte documentado de tool calling, function calling, agentes, vision ni audio.
- No hay soporte documentado multilingue; el idioma declarado es unicamente el ingles.

## Casos de uso

- Validacion de harnesses de evaluacion: al ser un modelo que falla de forma casi total en benchmarks estandar, sirve como prueba negativa para comprobar que un pipeline de evaluacion (lm-evaluation-harness, por ejemplo) detecta correctamente un modelo sin capacidades y no reporta puntuaciones infladas por errores de implementacion.
- Modelo de control en experimentos de benchmarking: permite contrastar resultados entre modelos reales y un modelo degradado, util para detectar contaminacion de datos o bugs en el scoring de multiple-choice.
- Investigacion sobre degradacion por fine-tuning: puede emplearse para estudiar como el entrenamiento con datos incorrectos afecta a las distribuciones de salida de un modelo pequeno.
- Docencia y formacion: ejemplo practico, por su minimo tamano (~3 M de parametros), para ensenar a cargar modelos con transformers, calcular log-likelihoods por token y ejecutar evaluaciones zero-shot en hardware muy modesto.
- Pruebas de infraestructura de inferencia: su tamano minimo lo hace ideal para verificar despliegues de servidores de inferencia, cuantizaciones o integraciones sin consumir apenas recursos.
- Analisis de comportamiento degenerado: estudio de patrones de salida de modelos con distribuciones sesgadas hacia respuestas erroneas, relevante para investigacion en robustez y alineacion.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (accuracy zero-shot, splits completos de evaluacion):

| Benchmark | Score |
| --- | ---: |
| HellaSwag | 0,00% |
| ARC-Easy | 0,00% |
| ARC-Challenge | 0,00% |
| PIQA | 0,16% |
| ArithMark-3.0 | 0,00% |
| Open SLM index | −51,51 |

Estos resultados confirman el caracter deliberadamente degradado del modelo: una seleccion aleatoria de respuestas obtendria puntuaciones superiores (por ejemplo, ~25% en ARC de cuatro opciones), por lo que el rendimiento esta por debajo del azar. No hay comparativas publicadas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~3 millones de parametros en float32, el modelo ocupa aproximadamente 12 MB de memoria; cualquier GPU moderna, e incluso CPU, es mas que suficiente. En float16 ocuparia unos 6 MB.
- GPU recomendadas: no requiere GPU dedicada; es ejecutable en cualquier hardware, desde portatiles con CPU hasta GPUs de consumo (RTX 3060, RTX 4090, etc.) o aceleradores en la nube.
- Cabe con holgura en cualquier GPU de consumo; de hecho, puede ejecutarse sin GPU.
- Opciones de despliegue: carga directa con `transformers` (Hugging Face), incluyendo `AutoModelForCausalLM` y `AutoTokenizer` con `trust_remote_code=True`. No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI; dado que usa codigo personalizado y pesos safetensors en transformers, la via documentada es la libreria transformers.
- Latencia y throughput: no disponible; por su tamano minimo, la generacion es practicamente instantanea en cualquier hardware razonable.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Enfoque | Rendimiento en benchmarks |
|---|---|---|---|---|
| AntiBench v2.1 | ~3 M | Apache 2.0 | Modelo degradado experimental (anti-benchmark) | ~0% en HellaSwag, ARC, PIQA |
| SmolLM2-135M | 135 M | Apache 2.0 | SLM general entrenado con ~11 T de tokens | Puntuaciones positivas en benchmarks SLM estandar (datos concretos no disponibles en esta ficha) |
| Qwen2.5-0.5B | ~500 M | Apache 2.0 (con restricciones de marca) | SLM general multilingue | Rendimiento competitivo en MMLU, GSM8K y similares (datos concretos no disponibles en esta ficha) |

AntiBench v2.1 no compite con estos modelos en rendimiento: su valor es el opuesto, actuar como referencia negativa. Frente a SLM reales de 135 M a 500 M de parametros, AntiBench es entre 45 y 165 veces mas pequeno y carece por completo de capacidades practicas.

## Limitaciones y advertencias

- El modelo esta deliberadamente entrenado con datos incorrectos: sus salidas son erroneas por diseno y no debe usarse para ninguna tarea real de generacion de texto, razonamiento o respuesta a preguntas.
- Riesgo de alucinacion: maximo y garantizado; el modelo produce respuestas incorrectas de forma sistematica, no ocasional.
- Rendimiento por debajo del azar en multiple-choice (0,00% en benchmarks de cuatro opciones), lo que indica distribuciones de salida patologicas.
- Requiere `trust_remote_code=True` debido a `custom_code`: ejecutar codigo remoto del repositorio conlleva riesgos de seguridad habituales; conviene revisar el codigo antes de cargarlo en entornos sensibles.
- Limitado al idioma ingles; no hay soporte documentado para castellano ni otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar tareas con textos largos.
- Licencia Apache 2.0 permisiva para uso comercial, pero sin relevancia practica dado que el modelo no es util en produccion.
- Proyecto de autor individual con muy poca traccion (165 descargas, 3 likes en el momento de la ficha): escaso soporte comunitario y sin garantias de mantenimiento.
- La fecha de creacion del repositorio (octubre de 2026) es posterior a la fecha de corte de esta informacion; no se dispone de revisiones independientes del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arthurblg1802/AntiBench-v2.1
- Perfil del autor: https://huggingface.co/arthurblg1802
- Paper asociado: no disponible
- Repositorio de codigo independiente: no disponible
- Demo online: no disponible
