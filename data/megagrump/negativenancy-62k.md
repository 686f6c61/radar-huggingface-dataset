# megagrump/NegativeNancy-62K

## Resumen

NegativeNancy-62K es un modelo de lenguaje de 62.144 parámetros publicado por el usuario megagrump (P. Murgagem) en Hugging Face. Se trata de una pieza de sátira técnica: un modelo deliberadamente trivial cuyo único comportamiento es responder "No." a cualquier entrada. Pese a su carácter humorístico, está empaquetado con rigor formal (GGUF compatible con llama.cpp, plantilla ChatML embebida, tokenizador byte-level BPE, licencia MIT) y sirve como artefacto didáctico sobre el formato GGUF y sobre el mínimo viable que llama.cpp necesita para cargar y servir un modelo.

La arquitectura es un transformer `llama` de una sola capa, una sola cabeza de atención, embeddings de 64 dimensiones y FFN de 64 dimensiones, con solo 454 parámetros no nulos. El vocabulario consta de 260 tokens: 256 tokens byte-level, el token `No.` y tres tokens especiales. No ha sido entrenado: la model card declara 0 FLOPs y 0 pasos de gradiente, y el modelo se distribuye en precisión F32 con un tamaño de repositorio de 254 KB.

Su relevancia no es funcional sino instrumental: es un fixture determinista, con latencia inferior a 1 ms y salida fija conocida, útil para validar pipelines, interfaces de chat y despliegues de llama.cpp antes de integrar modelos reales. El autor advierte explícitamente de que no es un sistema de seguridad ni un método de entrenamiento de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `llama` (transformer, 1 capa, 1 cabeza, embeddings de 64 dim, FFN de 64 dim) |
| Parametros totales | 62.144 (454 no nulos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | F32 (único peso publicado: `NegativeNancy-62K-F32.gguf`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer de arquitectura `llama` reducido al mínimo: una capa, una cabeza de atención, dimensión de embedding de 64 y dimensión de FFN de 64. El tokenizador es byte-level BPE con un vocabulario de 260 tokens (256 tokens byte-level, el token `No.` y tres tokens especiales). La plantilla de chat es ChatML y va embebida en el propio archivo GGUF. Los pesos se distribuyen en precisión F32.

No hay entrenamiento: la model card declara explícitamente 0 FLOPs y 0 pasos de gradiente, sin datos de entrenamiento. El comportamiento (emitir siempre `No.`) se deriva de la configuración de pesos y del vocabulario restringido, no de un proceso de ajuste. No se documentan técnicas como RLHF, DPO, decodificación especulativa ni atención lineal; la innovación, en todo caso, es la minimización extrema del artefacto y su determinismo total, verificado según el autor hasta temperatura 5.0.

## Capacidades

- Generación de texto: únicamente la cadena `No.` como respuesta a cualquier entrada.
- Determinismo total: la salida no varía con la temperatura (según el autor, verificado hasta 5.0).
- Conversación multi-turno: acepta formato ChatML y responde `No.` en cada turno.
- Compatibilidad con llama.cpp: funciona con `llama-cli` y `llama-server` (API compatible con OpenAI en `/v1/chat/completions`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso, agentes ni planificación.
- No dispone de capacidades multilingües más allá del inglés declarado.
- No tiene modo thinking, visión, audio ni ninguna capacidad especial.
- No escribe código, matemáticas ni texto libre de ningún tipo.

## Casos de uso

- Demostración del formato GGUF: sirve para mostrar la estructura de un archivo GGUF y la metadata embebida (plantilla ChatML, tokenizador) sin necesidad de descargar pesos grandes.
- Fixture de pruebas en CI: al tener salida fija y conocida (`No.`), permite aserciones deterministas en tests de integración de pipelines de inferencia.
- Validación de interfaces de chat: comprobar que una UI o un cliente HTTP está correctamente cableado contra un endpoint compatible con OpenAI antes de conectar un modelo real.
- Prueba de despliegue de llama.cpp: verificar que `llama-server` arranca, expone `/v1/chat/completions` y responde en menos de 1 ms, con carga instantánea del modelo.
- Benchmark de overhead: medir el coste fijo (arranque, parsing de petición, serialización de respuesta) de un stack de serving restando el tiempo de cómputo del modelo, que es despreciable.
- Material didáctico y de divulgación: ilustrar qué es y qué no es un modelo de lenguaje, y por qué un modelo que rechaza todo no constituye un sistema de seguridad.
- Regalo o broma entre colegas: caso de uso declarado por el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla comparativa satírica frente a "modelos frontera" con métricas declaradas por el autor (0 % de alucinación, 0 % de éxito de jailbreak, determinismo total, latencia inferior a 1 ms, 254 KB de tamaño), pero no son resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones medidas con metodología reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en F32 (el archivo pesa 254 KB); cabe en cualquier dispositivo con llama.cpp, incluidos CPU y sistemas embebidos.
- GPU recomendadas: ninguna en particular; no requiere GPU. Funciona en CPU sin penalización perceptible.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU (Raspberry Pi, contenedores mínimos).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con API compatible con OpenAI). No se documenta soporte para vLLM, TGI, Ollama ni otros runtimes en la información disponible.
- Latencia y throughput: el autor declara tiempo de respuesta inferior a 1 ms y carga prácticamente instantánea; el throughput vendrá limitado por el stack de serving, no por el modelo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (modelos satíricos de tamaño trivial con salida fija). La model card incluye una comparación humorística frente a "modelos frontera" genéricos, sin nombrar alternativas concretas ni aportar métricas verificables.

## Limitaciones y advertencias

- Solo emite `No.`: no genera código, ensayos, correos ni ningún otro contenido.
- No es un sistema de seguridad, un filtro de contenido ni un método de entrenamiento de rechazo; el autor lo subraya explícitamente. Un modelo que rechaza todo indiscriminadamente no es seguro, es un modelo que no hace nada.
- Riesgo de alucinación nulo por construcción (siempre dice lo mismo), pero igualmente inútil como asistente.
- Contexto declarado de 32.768 tokens, aunque irrelevante en la práctica porque la salida no depende de la entrada.
- Idioma limitado al inglés declarado; sin capacidades multilingües.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero el modelo no aporta ninguna funcionalidad productiva.
- Puede resultar "levemente ofensivo para optimistas", según el propio autor.
- No debe integrarse en producción como componente funcional; su lugar es el de fixture, demo o prueba de infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/megagrump/NegativeNancy-62K
- Perfil del autor en Hugging Face: https://huggingface.co/megagrump/models
- llama.cpp (repositorio oficial): https://github.com/ggml-org/llama.cpp
