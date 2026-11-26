# Shrijanagain/SPEED2-V0-0B7-CPT-SFT-fp8cpt

## Resumen

SPEED2-V0-0B7-CPT-SFT-fp8cpt es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) publicado por el usuario Shrijanagain en Hugging Face. Se trata de un checkpoint resultante de un entrenamiento continuado (continued pretraining) sobre el dataset `Shrijanagain/Speed-5B-mX-parquet`, partiendo de un modelo base del mismo autor y con el mismo identificador. El nombre interno ("V0-0B7") sugiere una variante de aproximadamente 0,7 mil millones de parametros, coherente con los 746.280.448 parametros totales registrados en los pesos en safetensors.

El aspecto mas destacable es su politica de precision mixta: el entrenamiento utiliza GEMMs en fp8 E4M3 para las proyecciones de atencion y para los expertos (gate/up/down y expertos compartidos), mientras que embeddings, router, biases y pesos de RMSNorm se mantienen en bf16/fp16. Los pesos finales se guardan de nuevo en fp16, de modo que el checkpoint es ejecutable en cualquier dispositivo y el fp8 actua unicamente como optimizacion en tiempo de entrenamiento. Esto lo convierte en un caso interesante para estudiar flujos de entrenamiento en precision reducida sobre hardware sm89 o superior.

La relevancia practica es limitada pero concreta: es un modelo pequeno de tipo MoE, con un contexto declarado de 2048 tokens, entrenado sobre aproximadamente 1.200 millones de tokens en 37.000 pasos con dos GPUs en DDP. No hay informacion publicada sobre benchmarks, idiomas soportados ni licencia, por lo que debe tratarse como un experimento de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, con expertos compartidos y router; codigo personalizado (`trust_remote_code=True`) |
| Parametros totales | 746.280.448 |
| Parametros activos | no disponible |
| Longitud de contexto | 2048 tokens (seq_len de entrenamiento) |
| Tipos de cuantizacion | Entrenamiento en fp8 E4M3 (GEMMs) y bf16/fp16 (embeddings, router, RMSNorm); pesos guardados en fp16; no se documentan cuantizaciones de inferencia (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 250,8 GB, 18 shards por rank) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de tipo Mixture-of-Experts con router y expertos compartidos, implementada mediante codigo personalizado que requiere `trust_remote_code=True` para cargarse. La politica de precision es el elemento tecnico central: las GEMMs de atencion (q/k/v/o) y de los expertos (gate/up/down, incluidos los compartidos) se ejecutan en fp8 E4M3 en hardware sm89 o superior, mientras que `embed.weight` (atada con `lm_head`), el router, el `router_bias` y todos los pesos de RMSNorm permanecen en bf16/fp16. Los momentos del optimizador se conservan en fp32, y el modo declarado es `full`.

El entrenamiento consistio en un continued pretraining sobre el dataset `Shrijanagain/Speed-5B-mX-parquet`, alcanzando el paso 37.000 con 1.212.416.000 tokens vistos. La configuracion de ejecucion fue: precision float16, 18 shards por rank, 2 GPUs en DDP, longitud de secuencia 2048, micro batch 1, acumulacion de gradiente 16, learning rate 5e-05, 100 pasos de warmup y weight decay 0,1. No se documentan detalles sobre composicion del dataset, uso de RLHF/DPO ni innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation`).
- Razonamiento y codigo: no hay evaluacion publicada que lo confirme; las capacidades deben considerarse no verificadas.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el dataset de entrenamiento (`Speed-5B-mX-parquet`) sugiere un posible enfoque multilingue, pero no se confirma.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Ejecucion en precision reducida: el checkpoint se guarda en fp16 y es ejecutable en cualquier dispositivo; el fp8 es exclusivamente una optimizacion de entrenamiento.

## Casos de uso

- Investigacion sobre entrenamiento en fp8: el modelo sirve como referencia reproducible de un pipeline de continued pretraining con GEMMs en fp8 E4M3 y momentos en fp32, util para estudiar estabilidad numerica y calidad resultante en hardware sm89+.
- Experimentacion academica con arquitecturas MoE de escala reducida: con 746 millones de parametros totales y contexto de 2048 tokens, es viable para estudiar enrutamiento de expertos, balanceo de carga y comportamiento de expertos compartidos en entornos con recursos limitados.
- Generacion de texto de dominio acotado: dado su entrenamiento continuado sobre un corpus especifico, puede emplearse para explorar la adaptacion a ese dominio, siempre con validacion manual previa.
- Prototipado de pipelines de `transformers` con codigo personalizado: util para probar integraciones que requieran `trust_remote_code=True` y gestion de checkpoints multi-shard de gran tamano.
- Base para fine-tuning posterior (SFT/DPO): al ser un checkpoint intermedio de pretraining continuado, puede servir como punto de partida para ajustes supervisados en tareas concretas.
- Reproduccion de configuraciones de entrenamiento distribuidas: la configuracion documentada (DDP con 2 GPUs, grad accum 16, seq_len 2048) permite replicar el setup en laboratorios con hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp16 suman aproximadamente 1,5 GB (746 M de parametros x 2 bytes); en bf16, similar. El repo completo ocupa 250,8 GB por los multiples shards y estados de entrenamiento, pero la inferencia solo requiere los pesos del modelo.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16, incluyendo RTX 3060, RTX 4060, RTX 4090, A100 y H100. El entrenamiento con fp8 requiere hardware sm89 o superior (por ejemplo, Ada Lovelace o Hopper).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 6 GB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es el unico metodo documentado; no se confirma soporte en vLLM, llama.cpp, Ollama o TGI, y la dependencia de codigo personalizado complica su integracion en dichos motores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (MoE de ~0,7 B de parametros con entrenamiento en fp8) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad de generacion, razonamiento, codigo o matematicas.
- Licencia no especificada: no puede asumirse uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce la cobertura linguistica real y el comportamiento fuera del corpus de entrenamiento.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo, RAG con documentos extensos o conversaciones multi-turno prolongadas.
- Riesgo de alucinacion elevado: un modelo de 746 M de parametros con solo ~1.200 millones de tokens vistos tiene una capacidad limitada de conocimiento factual.
- Dependencia de codigo personalizado (`trust_remote_code=True`): implica ejecutar codigo del autor, con el riesgo de seguridad asociado, y dificulta el soporte en motores de inferencia estandar.
- Checkpoint intermedio de pretraining continuado: no consta un ajuste por instrucciones o preferencias (RLHF/DPO), por lo que el formato de salida puede no ser conversacional.
- El modelo base referenciado en la model card es el propio modelo (autorreferencia), lo que impide trazar con claridad el linaje de entrenamiento.
- El tamano del repositorio (250,8 GB) frente al tamano de los pesos (~1,5 GB) sugiere la presencia de estados de entrenamiento u otros artefactos; conviene revisar los archivos antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shrijanagain/SPEED2-V0-0B7-CPT-SFT-fp8cpt
- Dataset de entrenamiento: https://huggingface.co/datasets/Shrijanagain/Speed-5B-mX-parquet
- Perfil del autor: https://huggingface.co/Shrijanagain
