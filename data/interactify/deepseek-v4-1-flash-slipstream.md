# Interactify/DeepSeek-V4.1-Flash-Slipstream

## Resumen

DeepSeek-V4.1-Flash-Slipstream es una distribucion de pesos del modelo DeepSeek-V4.1-Flash-1017, publicada por Interactify para su motor de inferencia propietario Slipstream. No se trata de un modelo entrenado desde cero ni de un fine-tune: es una reempaquetado del checkpoint base de DeepSeek con cuantizacion selectiva (EXL3 en los expertos enrutados y MXFP8 en los pesos densos) en un formato binario propio (`weights.vbin` + `index.json`) que solo carga el motor Slipstream. El modelo base pertenece a la familia DeepSeek-V4.1-Flash, de arquitectura Mixture-of-Experts con capacidad de vision, y se distribuye bajo licencia MIT.

La relevancia de esta publicacion es doble. Por un lado, demuestra una via para servir un modelo de gran tamano en hardware de consumo profesional: el checkpoint esta disenado para ejecutarse en dos NVIDIA DGX Spark (GB10, 128 GB cada una) interconectadas por su enlace de 200 GbE, sin necesidad de GPUs de centro de datos. Por otro, introduce un formato de pesos optimizado para un motor concreto, con decodificacion especulativa integrada (DSpark) y perfiles de ejecucion (`fast`, `balanced`) que intercambian calidad por latencia.

El repositorio ocupa 436,4 GB y se organiza en directorios por rango (r0 y r1) para el reparto entre las dos maquinas. La longitud de contexto declarada alcanza los 524.288 tokens. El proyecto no ha registrado descargas ni interacciones en el momento de redactar esta ficha, y el codigo del motor Slipstream aun no se ha publicado ("engine code release coming soon"), lo que limita su evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (hereda la del modelo base DeepSeek-V4.1-Flash) con torre de vision y cabezal de borrador DSpark |
| Parametros totales | no disponible (el modelo base se identifica como "1017"; no se detalla el recuento) |
| Parametros activos | no disponible |
| Longitud de contexto | 524.288 tokens |
| Tipos de cuantizacion | EXL3 en expertos enrutados con anchos K2/K3/K4 por experto (3,04 bpw); MXFP8 en pesos densos; cabezal de salida y copias densas del perfil `fast` en 4 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Slipstream `weights.vbin` + `index.json` (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es DeepSeek-V4.1-Flash-1017, un transformer con capa de mezcla de expertos (MoE) en la que solo se activa un subconjunto de expertos por token. Sobre esa base, Interactify aplica una cuantizacion por experto con anchos de 2, 3 o 4 bits (K2/K3/K4), seleccionados a partir de estadisticas de enrutamiento y calibrados sobre el checkpoint 1017, con un promedio de 3,04 bits por peso en los expertos. Los pesos densos se almacenan en MXFP8, que segun el autor es sin perdida respecto al FP8 original. El repositorio incluye ademas la torre de vision, las tablas Engram (memoria de contexto del modelo base) y el borrador DSpark, un mecanismo de decodificacion especulativa que genera borradores que el modelo principal verifica.

No se proporcionan datos sobre el entrenamiento original del modelo base: numero de tokens, composicion del dataset, uso de RLHF o DPO ni innovaciones de atencion. La informacion disponible se limita al proceso de conversion y cuantizacion realizado por Interactify con los conversores de Slipstream en el commit `20c2dd9` (31 de octubre de 2026). El autor afirma que la salida codiciosa con borradores DSpark es identica a la decodificacion sin borradores, lo que sugiere una verificacion exacta en el muestreo greedy.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base DeepSeek-V4.1-Flash, orientado a generacion de texto y tareas de razonamiento.
- Vision: incluye la torre de vision del modelo base (`vision1017`), por lo que puede procesar imagenes ademas de texto.
- Contexto largo: ventana de hasta 524.288 tokens, adecuada para documentos extensos y conversaciones de muchos turnos.
- Decodificacion especulativa: el borrador DSpark acelera la generacion sin alterar la salida greedy.
- Perfiles de ejecucion: el motor Slipstream ofrece al menos los perfiles `fast` (copias densas en 4 bits) y `balanced`, que ajustan el equilibrio entre velocidad y fidelidad.
- API compatible: el servidor expone endpoints compatibles con OpenAI y Anthropic en el puerto 8080.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos: con 524.288 tokens de contexto, el modelo puede ingerir contratos, expedientes o bases de codigo completas en una sola llamada y responder preguntas sobre el conjunto sin fragmentacion.
- Procesamiento de documentos con imagenes: la torre de vision permite extraer informacion de facturas, formularios escaneados o capturas de pantalla dentro de un mismo flujo de texto.
- Despliegue en laboratorio o pequena oficina: al ejecutarse en dos DGX Spark, permite servir un modelo de gran tamano sin infraestructura de centro de datos, con un consumo y un espacio fisico contenidos.
- Prototipado de asistentes conversacionales de contexto largo: la API compatible con OpenAI y Anthropic facilita conectar clientes existentes sin reescribir integraciones.
- Investigacion sobre cuantizacion: el repositorio documenta KL, top-1 y perplejidad frente a una referencia en CPU con expertos MXFP4, lo que lo convierte en un material util para estudiar el impacto de EXL3 por experto.
- Evaluacion de decodificacion especulativa: el borrador DSpark y su verificacion exacta permiten medir ganancias de throughput con salida identica en modo greedy.
- Generacion de codigo y JSON estructurado: las mediciones del autor reportan 97 tokens/s en codigo y 105 tokens/s en JSON en un solo flujo con el perfil `fast`, adecuado para tareas de extraccion estructurada.

## Benchmarks y rendimiento

El autor publica mediciones de inferencia y de calidad de cuantizacion, pero no resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros). No se han publicado resultados de benchmarks en la informacion disponible.

| Metrica | Valor medido |
|---|---|
| Decodificacion, un flujo, perfil `fast` (texto estructurado) | 126 tokens/s |
| Decodificacion, un flujo, perfil `fast` (prosa) | 62 tokens/s |
| Decodificacion, un flujo, perfil `fast` (codigo) | 97 tokens/s |
| Decodificacion, un flujo, perfil `fast` (JSON) | 105 tokens/s |
| Decodificacion, cuatro flujos (estructurado / prosa / codigo / JSON) | 136 / 101 / 131 / 157 tokens/s |
| Prefill 8K-32K | ~2.300 tokens/s |
| Calidad frente a referencia CPU con expertos MXFP4 (5 textos de 1024 tokens) | KL 0,007-0,041; top-1 90-98 %; perplejidad dentro del 0,5 % |
| Fidelidad de DSpark en modo greedy | Salida identica a la decodificacion sin borradores |

## Requisitos de hardware

- VRAM estimada: el checkpoint completo ocupa 436,4 GB en disco; se reparte entre dos nodos de 128 GB cada uno, por lo que cada maquina debe alojar aproximadamente la mitad de los pesos y los buffers de inferencia.
- GPU recomendadas: dos NVIDIA DGX Spark (GB10, 128 GB de memoria unificada cada una), conectadas por su enlace de 200 GbE. No existe variante para una sola Spark.
- GPU de consumo: no cabe en ninguna GPU de consumo individual (RTX 4090, 5090, etc.) por el tamano del checkpoint y el requisito de dos nodos.
- Opciones de despliegue: exclusivamente el motor Slipstream (`python server/slipstream.py serve deepseek-v4.1-flash --profile balanced`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `weights.vbin` es propietario.
- Latencia y throughput: segun las mediciones del autor, 62-126 tokens/s en un flujo y 101-157 tokens/s con cuatro flujos en el perfil `fast`; prefill de aproximadamente 2.300 tokens/s en el rango 8K-32K.
- Almacenamiento: al menos 436,4 GB distribuidos entre los dos nodos, con descarga selectiva por rango (`*_r0/*` en el primero, `*_r1/*` en el segundo).

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base DeepSeek-V4.1-Flash-1017 en la informacion proporcionada, por lo que la comparacion se limita a aspectos de formato y despliegue.

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-Slipstream (este) | no disponible | 524.288 | Slipstream `vbin` | MIT | Solo Slipstream, dos DGX Spark |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | no disponible | Estandar (safetensors presumiblemente) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible otros modelos comparables de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Formato propietario: los pesos solo cargan en Slipstream. No son safetensors ni GGUF y no funcionan en vLLM, llama.cpp, Ollama, TGI ni en el ecosistema Transformers estandar.
- Motor no publicado: el codigo de Slipstream aun no esta disponible ("engine code release coming soon"), lo que impide auditar el motor, reproducir las mediciones o desplegar el modelo de forma independiente.
- Hardware obligatorio: requiere exactamente dos DGX Spark con enlace de 200 GbE; no hay variante para una sola maquina ni para GPUs convencionales.
- Cuantizacion con perdida: los expertos usan 3,04 bits por peso de media (K2/K3/K4), con una desviacion medida de KL 0,007-0,041 y top-1 del 90-98 % frente a una referencia MXFP4; no es una reproduccion exacta del modelo original.
- Sin datos de benchmarks academicos: no hay resultados de MMLU, HumanEval, GSM8K ni similares, ni comparaciones con otros modelos, lo que dificulta evaluar su calidad frente a alternativas.
- Idiomas no declarados: la model card no especifica la cobertura linguistica; se desconoce el rendimiento en castellano.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al ser una redistribucion del modelo base, hereda los sesgos y limitaciones de este, que no se documentan.
- Madurez: cero descargas y cero interacciones en Hugging Face, publicacion muy reciente (31 de octubre de 2026) y un unico autor; no hay evidencia de uso en produccion.
- Licencia MIT: permite uso comercial, pero conviene revisar `LICENSE` y `NOTICE` del repositorio por si el modelo base impone condiciones adicionales no reflejadas en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Interactify/DeepSeek-V4.1-Flash-Slipstream
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor Slipstream: https://github.com/Interactify/slipstream
