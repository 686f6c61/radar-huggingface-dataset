# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-norwegian-bokmaal-seed3

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) construido sobre SmolLM2-135M-Instruct y afinado en dos fases: primero sobre la porcion en noruego bokmal de FineWeb-2 y despues sobre la porcion en feroes del mismo corpus. El resultado es un adaptador de bajo rango orientado a generacion de texto conversacional en feroes, con una estrategia de transferencia linguistica desde una lengua germanica cercana. Lo publica el usuario jekunz como material de investigacion, sin evaluacion amplia todavia.

El interes tecnico esta en la receta: un LoRA de rango 256 y alpha 512 aplicado sobre las proyecciones MLP (`up_proj`, `down_proj`, `gate_proj`, `o_proj`) de un modelo de solo 135 millones de parametros, entrenado con un unico A100 de 40 GB y lote efectivo de 256 durante una epoca en bokmal y cinco en feroes. Es una semilla concreta (seed 3) de una configuracion con tres semillas, lo que sugiere un estudio de variabilidad de entrenamiento en lenguas de bajos recursos.

Por su tamano y su naturaleza de adaptador, no compite con modelos generalistas: su utilidad es como pieza de investigacion sobre adaptacion cross-lingue en lenguas nordicas minoritarias y como ejemplo reproducible de ajuste eficiente en hardware modesto. No hay benchmarks publicados ni datos de evaluacion en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 135M en el modelo base; el adaptador anade pesos de bajo rango (r=256) en 4 modulos MLP |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento); contexto nativo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de SmolLM2, pero no se documentan aqui) |
| Idiomas soportados | feroes (fo); entrenamiento previo en noruego bokmal |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros. Sobre el se aplica un adaptador LoRA con rango 256 y alpha 512, dirigido exclusivamente a las proyecciones MLP (`up_proj`, `down_proj`, `gate_proj`, `o_proj`), sin tocar los modulos de atencion. El entrenamiento es secuencial: una epoca sobre la porcion en noruego bokmal de FineWeb-2 y cinco epocas sobre la porcion en feroes, con tasa de aprendizaje 8e-4, scheduler coseno, warmup del 5 %, tamano de lote 8, acumulacion de gradientes de 32 pasos (lote efectivo 256) y longitud maxima de 2048 tokens. Todo el ajuste se ejecuto en una sola A100 de 40 GB.

La innovacion metodologica es la transferencia cross-lingue: se aprovecha el bokmal como puente para una lengua de muy bajos recursos como el feroes, ambas nordicas occidentales con parentesco cercano. La publicacion de tres semillas para la misma configuracion (esta es la seed 3) apunta a medir la varianza del proceso de ajuste. No se documentan etapas de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva y conversacional en feroes, heredada del formato instruct del modelo base.
- Adaptacion linguistica al feroes mediante transferencia desde noruego bokmal.
- Ajuste eficiente en parametros: solo se entrenan los pesos LoRA de las capas MLP, lo que permite reproducir el entrenamiento en una unica GPU de 40 GB.
- Capacidades del modelo base (razonamiento basico, codigo, matematicas a escala de 135M) potencialmente degradadas o desplazadas por el ajuste en feroes; no se documenta su conservacion.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Investigacion en adaptacion cross-lingue: usar el adaptador como punto de partida reproducible para estudiar como transfiere conocimiento una lengua puente (bokmal) a una lengua de bajos recursos (feroes) en modelos pequenos.
- Generacion de texto en feroes para experimentos controlados: el adaptador produce texto en feroes sobre el que medir perplejidad, diversidad lexica o calidad con evaluadores automaticos.
- Estudio de variabilidad de semillas: comparar esta seed 3 con las otras dos semillas de la misma configuracion para cuantificar la sensibilidad del ajuste LoRA.
- Prototipado de asistentes conversacionales en feroes: con 135M de parametros y contexto de 2048 tokens, sirve para validar pipelines de dialogo antes de escalar a modelos mayores.
- Base para ajuste posterior: al ser un adaptador PEFT, puede combinarse o continuarse con nuevos datos feroeses sin reentrenar el modelo completo.
- Docencia y experimentacion en hardware modesto: el entrenamiento cabe en una A100 de 40 GB y la inferencia del modelo completo es viable en GPU de consumo, lo que facilita replicar el flujo en cursos o laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM para inferencia: el modelo base de 135M ocupa aproximadamente 0,27 GB en fp16 y alrededor de 0,08-0,1 GB en cuantizacion de 4 bits; el adaptador LoRA anade una cantidad marginal de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el entrenamiento documentado se realizo en una A100 de 40 GB por comodidad de lote, no por necesidad de memoria.
- GPU de consumo: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el base SmolLM2-135M-Instruct y fusionar o aplicar el adaptador; es compatible con transformers + PEFT, y el modelo fusionado puede convertirse a GGUF para llama.cpp u Ollama. No se documentan integraciones con vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-135M + LoRA feroes) | 135M + LoRA r=256 | 2048 (entrenamiento) | Feroes | Apache 2.0 | Hugging Face, 0 descargas |
| SmolLM2-135M-Instruct (base) | 135M | no disponible en esta ficha | Multilingue (predominantemente ingles) | Apache 2.0 | Hugging Face, ampliamente usado |
| Adaptador hermano (seed 1 y seed 2 de la misma configuracion) | 135M + LoRA r=256 | 2048 | Feroes | Apache 2.0 | Repositorios del mismo autor |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin evaluar: el autor declara que es material de investigacion y que no ha sido evaluado de forma amplia; no debe usarse en produccion sin validacion propia.
- Riesgo de alucinacion y degeneracion: a 135M de parametros, la coherencia en textos largos es limitada y el ajuste en feroes puede degradar capacidades del base en otros idiomas.
- Cobertura linguistica restringida: el adaptador esta orientado a feroes; el rendimiento en bokmal, ingles u otras lenguas no esta documentado y probablemente sea inferior al del base.
- Ventana de contexto corta: 2048 tokens en entrenamiento limita conversaciones y documentos largos.
- Sesgos: los datos de FineWeb-2 son web crawls y pueden arrastrar sesgos, ruido y contenido de baja calidad; no se documenta filtrado adicional.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base SmolLM2, que conviene verificar.
- Reproducibilidad: es una semilla concreta de una configuracion con tres semillas; los resultados pueden variar entre semillas.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-norwegian-bokmaal-seed3
- Modelo base del adaptador: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-norwegian-bokmaal
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo base SmolLM2-135M-Instruct: no disponible en la informacion proporcionada (referencia habitual: HuggingFaceTB/SmolLM2-135M-Instruct)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
