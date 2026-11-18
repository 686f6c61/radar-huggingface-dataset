# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-icelandic-seed1

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-icelandic-seed1` es un adaptador LoRA (PEFT) entrenado sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parametros desarrollado originalmente por Hugging Face. El adaptador lo publica el usuario jekunz como parte de un experimento de investigacion sobre transferencia linguistica entre lenguas nordicas de bajos recursos: primero se ajusta el modelo base en islandes (adaptador intermedio `jekunz/smollm-360m-lora-fineweb-icelandic`) y despues en feroes, aprovechando la proximidad tipologica entre ambas lenguas.

El objetivo declarado es adaptar un modelo pequeno a feroes (`fo`) usando corpus web de FineWeb-2, una tarea relevante porque el feroes apenas dispone de recursos de entrenamiento y de modelos generativos especificos. Se trata de la semilla 1 de una configuracion que se replico con tres semillas distintas, lo que sugiere un diseno experimental orientado a medir la varianza del ajuste fino.

El autor advierte explicitamente de que el modelo esta pensado para su propia investigacion y no ha sido evaluado de forma amplia. No es un modelo listo para produccion, sino una pieza de un estudio sobre adaptacion cross-lingual con LoRA en modelos de menos de 1B de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptador LoRA |
| Parametros totales | 360M en el modelo base; el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens durante el entrenamiento del adaptador (contexto nativo del base no disponible en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | feroes (`fo`); el modelo base soporta principalmente ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Detalles del adaptador LoRA:

| Parametro | Valor |
|---|---|
| Rank (r) | 256 |
| Alpha | 512 |
| Modulos objetivo | `up_proj`, `down_proj`, `gate_proj`, `o_proj` |
| Libreria | PEFT |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder-only denso de 360 millones de parametros. El ajuste se realiza con LoRA de rank 256 y alpha 512 sobre las proyecciones de las capas MLP (`up_proj`, `down_proj`, `gate_proj`) y la proyeccion de salida de atencion (`o_proj`), sin tocar los pesos de atencion de query/key/value. El entrenamiento se ejecuto en una unica GPU A100 de 40 GB con batch efectivo de 256 (batch 8 x 32 pasos de acumulacion de gradiente), learning rate 8e-4, scheduler coseno, warmup del 5 % y longitud maxima de 2048 tokens.

El proceso es secuencial: primero 1 epoca sobre la porcion islandesa de FineWeb-2 (generando el adaptador intermedio `jekunz/smollm-360m-lora-fineweb-icelandic`) y despues 5 epocas sobre la porcion feroesa del mismo corpus. Los datos provienen exclusivamente de `HuggingFaceFW/fineweb-2`, un dataset de texto web filtrado y deduplicado por idioma. No se menciona uso de RLHF, DPO ni datos instruccionales adicionales; el ajuste es de tipo continuado sobre texto crudo, aunque el modelo base ya es una variante Instruct. Esta publicacion corresponde a la semilla 1 de tres ejecuciones con la misma configuracion, lo que permite estimar la variabilidad del entrenamiento.

## Capacidades

- Generacion de texto en feroes tras el ajuste, heredando la capacidad generativa del modelo base SmolLM2-360M-Instruct.
- Generacion conversacional basica, dado que el modelo base es una variante Instruct.
- Modelado de lenguaje sobre texto web feroes de FineWeb-2.
- Transferencia cross-lingual desde islandes: el adaptador intermedio actua como inicializacion para el ajuste en feroes.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles ni documentadas.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Investigacion sobre transferencia linguistica entre lenguas nordicas: el adaptador permite comparar el efecto de inicializar desde islandes frente a entrenar directamente en feroes, usando las tres semillas publicadas para medir varianza.
- Generacion de texto sintetico en feroes para aumento de datos: se puede usar para producir corpus auxiliares que alimenten modelos mayores o sistemas de traduccion, siempre con revision humana dada la falta de evaluacion.
- Experimentos academicos de bajo coste: con 360M de parametros y un adaptador de 0,4 GB, cabe en una sola GPU consumer y sirve para prototipar tecnicas de adaptacion de bajo rango.
- Completado de texto y autocompletado en feroes dentro de entornos controlados de investigacion, por ejemplo para estudiar la calidad del modelado de lenguaje en un idioma de bajos recursos.
- Punto de partida para ajustes posteriores: el adaptador puede servir como inicializacion para tareas especificas en feroes (clasificacion, resumen) en lugar de partir del modelo base.
- Evaluacion de tecnicas LoRA: la configuracion concreta (rank 256, alpha 512, modulos MLP y `o_proj`) es un caso de estudio reproducible para quienes investigan hiperparametros de PEFT en modelos pequenos.
- Demostraciones educativas: ilustrar como se adapta un modelo multilingue pequeno a un idioma con pocos recursos usando datos web filtrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360M en fp16 ocupa aproximadamente 0,7 GB; en fp32, unos 1,4 GB. El adaptador LoRA anade 0,4 GB en el repositorio. En la practica, la inferencia completa cabe holgadamente en menos de 2 GB de VRAM en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el entrenamiento se realizo en una A100 de 40 GB, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con suficiente memoria compartida).
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador sobre el modelo base; llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF, paso no documentado en la informacion disponible; vLLM y TGI son viables tras fusionar los pesos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm-360m-lora-fineweb-faroese-transfer-from-icelandic-seed1 | 360M (base) + LoRA | 2048 (entrenamiento) | Feroes | Apache 2.0 | Hugging Face (PEFT) |
| SmolLM2-360M-Instruct | 360M | no disponible en esta ficha | Ingles (principal) | Apache 2.0 | Hugging Face |
| jekunz/smollm-360m-lora-fineweb-icelandic | 360M (base) + LoRA | 2048 (entrenamiento) | Islandes | Apache 2.0 | Hugging Face (PEFT) |
| Modelos generativos en feroes de mayor tamano | no disponible | no disponible | Feroes | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin evaluar: el autor declara que no ha sido evaluado de forma amplia, por lo que no hay garantias de calidad en generacion, coherencia ni correccion gramatical en feroes.
- Riesgo de alucinacion: al ser un modelo de 360M ajustado sobre texto web, la probabilidad de generar contenido facticamente incorrecto o incoherente es alta.
- Datos de entrenamiento web: FineWeb-2 puede contener sesgos, toxicidad y errores propios del texto web no curado; estos sesgos pueden propagarse al adaptador.
- Cobertura limitada de feroes: el corpus feroes disponible en FineWeb-2 es reducido, lo que limita la calidad y diversidad del ajuste.
- Contexto corto: 2048 tokens durante el entrenamiento restringen el uso en tareas que requieran ventanas largas.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la falta de evaluacion y la procedencia de los datos web hacen recomendable una revision legal y de calidad antes de cualquier despliegue en produccion.
- Naturaleza experimental: es la semilla 1 de tres ejecuciones; los resultados pueden variar entre semillas y no deben interpretarse como definitivos.
- Adaptador, no modelo completo: requiere cargar el modelo base SmolLM2-360M-Instruct y el adaptador intermedio para reproducir el pipeline completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-icelandic-seed1
- Adaptador intermedio en islandes: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-icelandic
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo base SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Repositorio PEFT: https://github.com/huggingface/peft
