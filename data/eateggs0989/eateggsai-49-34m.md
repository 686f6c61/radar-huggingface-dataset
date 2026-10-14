# eateggs0989/eateggsAI-49.34M

## Resumen

eateggsAI-49.34M es un modelo de lenguaje pequeno (SLM) de caracter experimental, publicado por el usuario eateggs0989 en HuggingFace. Se trata de un transformer decoder-only de estilo GPT construido y entrenado completamente desde cero con PyTorch, sin partir de pesos preentrenados de terceros. Cuenta con 49.343.232 parametros (~49,34 M), 6 capas, 8 cabezas de atencion, una dimension de embedding de 384 y una longitud de contexto de 256 tokens con un vocabulario de 50.257 entradas basado en el tokenizador de GPT-2.

El proposito declarado del proyecto es un reto de ingenieria de bajo consumo de VRAM: demostrar que es posible entrenar de forma estable un transformer desde cero en una GPU de consumo antigua, concretamente una NVIDIA GTX 1060 con 4 GB de VRAM montada en un portatil Acer i5 con procesador Intel. Para lograrlo, el autor aplico precision mixta (AMP con autocast y GradScaler), limito la longitud de secuencia a 256 tokens para contener el coste cuadratico de la atencion y ajusto un micro-batch de tamano 11. El entrenamiento completo requirio aproximadamente 12 horas y un consumo pico de unos 2,7 GB de VRAM.

La relevancia del modelo es fundamentalmente divulgativa y didactica, no competitiva: sirve como referencia reproducible de un pipeline completo de entrenamiento (descarga de datos, limpieza, deduplicacion, tokenizacion, empaquetado en bloques, entrenamiento y guardado de pesos) en hardware modesto. No es un modelo apto para produccion ni para tareas que exijan razonamiento complejo, tool calling o contexto largo. La model card no declara licencia ni idiomas soportados, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo GPT (atencion causal multi-cabeza) |
| Parametros totales | 49.343.232 (~49,34 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; el checkpoint se distribuye en precision mixta de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`gpt_6layer.pt`); no se publican safetensors ni GGUF |
| Vocabulario | 50.257 (tokenizador GPT-2) |
| Capas | 6 |
| Cabezas de atencion | 8 |
| Dimension de embedding | 384 |
| Dropout | 0,1 |
| Tamano del repositorio | 0,5 GB |
| Fecha de creacion | 2026-05-19 |
| Ultima actualizacion | 2026-10-14 |
| Descargas | 0 |
| Likes | 1 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only generico con atencion self-attention causal multi-cabeza, activacion GELU, conexiones residuales, layer normalization, embeddings posicionales aprendidos y mascara de atencion causal. Con 6 capas, 8 cabezas y un embedding de 384, el modelo sigue el patron clasico de GPT-2 reducido en profundidad y anchura. La tokenizacion emplea el tokenizador estandar de GPT-2 con un vocabulario de 50.257 tokens.

El entrenamiento se realizo integramente en PyTorch sobre una GTX 1060 de 4 GB, con optimizador AdamW, perdida de entropia cruzada, escalado de gradientes y precision mixta automatica (AMP). Las optimizaciones de bajo consumo incluyen el limite de 256 tokens de contexto para evitar la explosion cuadratica de memoria, un micro-batch de 11 y diseno de arquitectura equilibrado. El dataset se construyo por streaming multi-dominio a partir de Wikipedia, AG News, SQuAD y PG19 Books, con limpieza, deduplicacion, balanceo entre dominios y empaquetado en bloques de longitud fija. No se menciona en la informacion disponible ninguna fase de RLHF, DPO u otro ajuste por preferencias, ni tecnicas de decodificacion especulativa o atencion lineal. Los resultados de entrenamiento reportados son una perdida final de 3,2 a 3,3 tras aproximadamente 12 horas, con un uso de VRAM de unos 2,7 GB.

## Capacidades

- Generacion de texto autorregresiva basica en ingles, condicionada por el prompt de entrada.
- Capacidad multilingue: no disponible; no se declaran idiomas soportados.
- Soporte de tool calling o function calling: no disponible, y no declarado por el autor.
- Soporte de agentes y razonamiento multi-paso: no disponible, y no declarado por el autor.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio o modalidades adicionales: no disponibles; el modelo es exclusivamente de texto.
- Capacidades especiales: ninguna declarada mas alla de la generacion de texto y del proposito demostrativo del proyecto (entrenamiento low-VRAM desde cero).
- Naturaleza experimental: la model card indica que es un modelo de investigacion y aprendizaje, no un asistente afinado por instrucciones.

## Casos de uso

- Docencia y aprendizaje de arquitecturas transformer: el proyecto incluye scripts separados para descarga de datasets, limpieza, preparacion de bloques, entrenamiento e inferencia, lo que permite reproducir de principio a fin el ciclo completo en una GPU de 4 GB.
- Experimentacion academica con hardware limitado: sirve como punto de partida para estudiar tecnicas de reduccion de memoria (AMP, micro-batching, limite de secuencia) y medir su impacto en la convergencia.
- Pruebas de concepto de generacion de texto en entornos sin GPU dedicada: con 49,34 M de parametros y contexto de 256 tokens, la inferencia puede ejecutarse en CPU, lo que permite validar pipelines minimos en portatiles o contenedores sin acelerador.
- Estudio de pipelines de datos multiformato: el flujo combina Wikipedia, AG News, SQuAD y PG19 Books, de modo que el repositorio sirve para analizar como afectan el balanceo y la deduplicacion a un modelo pequeno.
- Base para ablaciones controladas: al ser un modelo de solo 6 capas y 384 dimensiones, es viable entrenar variantes completas varias veces en pocas horas y comparar configuraciones.
- Evaluacion de tokenizadores: al usar el tokenizador GPT-2 estandar con vocabulario de 50.257, permite medir el equilibrio entre coste de embedding y tamano efectivo del modelo en SLM.
- Demostraciones educativas de atencion causal: el limite estricto de 256 tokens hace observable y medible el efecto de la ventana de contexto en la coherencia de las generaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento (perdida final de 3,2 a 3,3, uso de VRAM de ~2,7 GB y un tiempo de entrenamiento de ~12 horas), pero no incluye evaluaciones sobre MMLU, HumanEval, GSM8K, HellaSwag, perplexity sobre conjuntos de validacion ni ninguna otra prueba estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,2 GB para los pesos (49,34 M de parametros x 4 bytes), mas el cache KV asociado a un contexto maximo de 256 tokens, que es despreciable. El uso total se mantiene muy por debajo de 1 GB.
- VRAM estimada en FP16: aproximadamente 0,1 GB para los pesos, con cache KV igualmente minimo.
- Cuantizacion a 8 bits o 4 bits: no disponible; no se publican pesos cuantizados ni variantes GGUF. Cualquier conversion seria responsabilidad del usuario.
- GPU de entrenamiento original: NVIDIA GTX 1060 con 4 GB de VRAM (arquitectura Pascal), sobre un portatil Acer i5.
- GPU recomendadas para inferencia: cualquier GPU consumer, incluidas GTX 1060, GTX 1650, RTX 3050, RTX 3060, RTX 4090; el modelo cabe sobradamente en todas ellas y tambien en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 4 GB, y en la mayoria de iGPU modernas con memoria unificada.
- Opciones de despliegue: el autor proporciona un script de inferencia en PyTorch (`inference/generate.py`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formats compatibles con esas herramientas, dado que los pesos se distribuyen como `gpt_6layer.pt` y no como safetensors o GGUF.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

La informacion proporcionada no incluye benchmarks ni especificaciones de modelos alternativos. La siguiente tabla usa datos publicos de referencia ampliamente conocidos para contextualizar el tamano del modelo, no datos extraidos de la busqueda web ni de la model card.

| Modelo | Parametros | Contexto | Vocabulario | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eateggsAI-49.34M | 49,34 M | 256 | 50.257 (GPT-2) | no disponible | HuggingFace, checkpoint PyTorch |
| GPT-2 small (referencia publica) | 124 M | 1.024 | 50.257 (GPT-2) | MIT | Ampliamente distribuido, GGUF y safetensors disponibles |
| Modelos TinyStories de tamano similar (referencia general) | 1 M - 33 M | 512 - 1.024 | variable | variable | HuggingFace |
| DistilGPT-2 (referencia publica) | 82 M | 1.024 | 50.257 (GPT-2) | Apache 2.0 | HuggingFace, safetensors |

Comparativa de rendimiento: no disponible, dado que no existen resultados de benchmarks publicados para eateggsAI-49.34M.

## Limitaciones y advertencias

- Modelo experimental sin ajuste por instrucciones ni por preferencias humanas (no se documenta RLHF ni DPO); no cabe esperar comportamiento de asistente conversacional fiable.
- Perdida final de entrenamiento de 3,2 a 3,3, valor elevado que sugiere una calidad de generacion limitada y un riesgo alto de texto incoherente o irrelevante.
- Ventana de contexto de solo 256 tokens, muy inferior a la de los modelos actuales; impide conversaciones multi-turno largas, resumen de documentos extensos o razonamiento con contexto amplio.
- Idiomas soportados no declarados: el dataset de entrenamiento (Wikipedia, AG News, SQuAD, PG19 Books) es predominantemente en ingles, por lo que el rendimiento en castellano y otros idiomas es incierto y previsiblemente pobre.
- Licencia no disponible: al no especificarse terminos, no hay autorizacion clara para uso comercial. Se debe contactar con el autor antes de cualquier uso en produccion.
- Riesgo elevado de alucinacion, agravado por el reducido numero de parametros y la ausencia de evaluaciones de fidelidad factual.
- Sesgos potenciales no medidos: no se documenta ninguna evaluacion de sesgos ni de toxicidad, y las fuentes de datos pueden introducir sesgos propios.
- 0 descargas en el momento de la consulta y 1 like, lo que indica una validacion comunitaria practicamente nula.
- Formatos limitados: solo se distribuye un checkpoint PyTorch (`gpt_6layer.pt`), sin safetensors, GGUF ni versiones cuantizadas, lo que complica su integracion en herramientas estandar de inferencia.
- Los resultados de la busqueda web realizada no contienen informacion relacionada con este modelo; no se ha podido verificar ningun dato adicional fuera de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eateggs0989/eateggsAI-49.34M
- Repositorio GitHub indicado en la model card: https://github.com/eateggs0989/eateggsAI-49.34M
- Paper: no disponible
- Blog o articulo tecnico: no disponible
- Demo: no disponible
- Enlaces adicionales relevantes: no se han encontrado en la busqueda web
