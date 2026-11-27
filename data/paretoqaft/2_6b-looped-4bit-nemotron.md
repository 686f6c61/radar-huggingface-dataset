# ParetoQaft/2_6B-looped-4bit-nemotron

## Resumen

2_6B-looped-4bit-nemotron es una cuantizacion de 4 bits del modelo ByteDance/Ouro-2.6B, un transformer con arquitectura "looped" (bloques compartidos reutilizados en varias iteraciones) de 2.667.974.657 parametros. Lo publica el usuario ParetoQaft en Hugging Face y su proposito es reducir el peso del modelo base (repo de 1,7 GB) manteniendo la calidad de razonamiento matematico, con una perdida de solo 1,4 puntos en GSM8k respecto al modelo en BF16.

La innovacion tecnica principal es el metodo de cuantizacion: AutoRound 0.9.2 modificado para arquitecturas con bucles. Cada bloque compartido se calibra conjuntamente con las entradas de las cuatro iteraciones del bucle, de modo que un unico juego de pesos cuantizados sirve para todas las pasadas. El resultado se empaqueta en formato AutoGPTQ con int4 simetrico y tamano de grupo 128 (W4A16).

Es relevante para quienes quieran desplegar Ouro-2.6B en hardware con poca VRAM sin renunciar a su capacidad de razonamiento. El modelo conserva el codigo de modelado original de Ouro (requiere `trust_remote_code=True`) y esta pensado para generacion de texto conversacional. No hay datos publicados sobre licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" (48 capas compartidas, 4 loops) |
| Parametros totales | 2.667.974.657 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16, int4 simetrico, group size 128 (AutoGPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (AutoGPTQ), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo base, ByteDance/Ouro-2.6B, es un transformer con arquitectura de bucles: 48 capas compartidas que se ejecutan cuatro veces, reutilizando los mismos pesos en cada iteracion. Esta variante es una cuantizacion post-entrenamiento (PTQ) realizada con AutoRound 0.9.2, parcheado especificamente para la arquitectura looped. La calibracion se hace de forma conjunta por bloque compartido, propagando las entradas cuantizadas de las cuatro iteraciones del bucle, de manera que un unico conjunto de pesos sirve para todos los loops.

Los datos de calibracion son 512 muestras de 2048 tokens del dataset ParetoQaft/nemotron_calib, con 1000 iteraciones, batch 8, semilla 42 y las opciones `enable_alg_ext=True` y `enable_quanted_input=True`. No se dispone de informacion sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, RLHF/DPO).

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento matematico: 85,1% de exact match en GSM8k (3-shot), frente a 86,5% del modelo en BF16.
- Razonamiento multi-paso mediante la arquitectura de bucles, que reaplica los mismos bloques cuatro veces.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Despliegue en GPU de consumo: con 2,67 mil millones de parametros en W4A16, el modelo ocupa aproximadamente 1,7 GB de pesos, por lo que cabe en tarjetas con 8 GB o menos y permite ejecutar razonamiento matematico local sin servicios en la nube.
- Tutoria y resolucion de problemas matematicos: el 85,1% en GSM8k lo hace util para asistentes que resuelven problemas aritmeticos de nivel escolar explicando los pasos.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia para comparar el impacto de AutoRound en arquitecturas looped frente a otros metodos (GPTQ estandar, AWQ) sobre el mismo modelo base.
- Prototipado rapido de chatbots: el tag `conversational` y el formato AutoGPTQ permiten integrarlo en pipelines de transformers con poca infraestructura.
- Investigacion sobre eficiencia de transformers looped: permite estudiar como se comporta un modelo con pesos compartidos y cuantizados en tareas de razonamiento, comparando con el BF16.
- Fine-tuning ligero o adaptadores: al ser un checkpoint compacto de 1,7 GB, es viable como base para LoRA/QLoRA en entornos con recursos limitados, aunque requiere validar la compatibilidad con el codigo de Ouro.

## Benchmarks y rendimiento

| Benchmark | Este modelo (4-bit) | BF16, 4 loops |
|---|---|---|
| GSM8k (3-shot, 1319 preguntas), exact match | 85,1% | 86,5% |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB para los pesos en int4; con overhead de activaciones y cache KV, un entorno practico parte de unos 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB (RTX 3060, RTX 4060, RTX 3070, RTX 4070, RTX 4090); en datacenter, A100 y H100 sin problema.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6-8 GB o mas.
- Opciones de despliegue: transformers con AutoGPTQ y `trust_remote_code=True`; la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8k (3-shot) | Licencia | Formato |
|---|---|---|---|---|---|
| 2_6B-looped-4bit-nemotron | 2,67 B | no disponible | 85,1% | no disponible | safetensors (AutoGPTQ) |
| ByteDance/Ouro-2.6B (BF16) | 2,67 B | no disponible | 86,5% | no disponible | safetensors |
| Otras alternativas de ~2-3 B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantizacion introduce una perdida medible: 1,4 puntos en GSM8k respecto al BF16, que puede ampliarse en otras tareas no evaluadas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo de modelado incluido en el repositorio; conviene revisarlo antes de usarlo en produccion.
- No hay informacion publicada sobre sesgos, riesgo de alucinacion ni comportamiento multilingue.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base ByteDance/Ouro-2.6B.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado en noviembre de 2026: es un artefacto reciente y sin validacion comunitaria.
- La longitud de contexto no esta documentada; no se debe asumir una ventana larga sin comprobarla.
- La compatibilidad con motores de inferencia distintos de transformers/AutoGPTQ no esta confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ParetoQaft/2_6B-looped-4bit-nemotron
- Modelo base: https://huggingface.co/ByteDance/Ouro-2.6B
- Dataset de calibracion: https://huggingface.co/datasets/ParetoQaft/nemotron_calib
