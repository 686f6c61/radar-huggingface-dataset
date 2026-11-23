# Cianidos/Darwin-180B-RSI-R3-Sushi-4bpw-Sharp

## Resumen

Darwin-180B-RSI-R3-Sushi-4bpw-Sharp es una cuantización de 4 bits (denominada K4) del modelo Darwin-180B-RSI-R3, publicada por el usuario Cianidos en Hugging Face. El modelo base lo desarrolla FINAL-Bench y, según las etiquetas del repositorio, se trata de un transformer de tipo mezcla de expertos (MoE) con capacidades de razonamiento, visión-lenguaje y contexto largo. Esta variante concreta no es un nuevo fine-tune ni una recuantización: reutiliza los mismos pesos que el pack `Darwin-180B-RSI-R3-Sushi-4bpw` y únicamente sustituye la plantilla de chat por la Qwen Sharp Chat Template, orientada a respuestas concisas y a la gestión del historial de razonamiento y de las llamadas a herramientas.

El interés del modelo radica en su formato de despliegue: está empaquetado para MLX y el runtime Sushi, pensado para Apple Silicon, e incluye una tabla n-gram, un tronco denso y una cabeza MTP (multi-token prediction). El autor reporta un contexto nativo de 262.144 tokens, ampliable a 1.048.576 mediante escalado RoPE tipo YaRN con factor 4, y cuantización de KV a 8 bits. El repositorio ocupa unos 100,5 GB y declara 36.556.177.299 parámetros reales en los safetensors, un dato que entra en contradicción con el nombre comercial "180B" del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un caso de empaquetado específico para hardware de Apple con un runtime no estándar; por otro, advierte de que la información pública disponible es escasa y en gran parte autoinformada por el autor de la cuantización, sin benchmarks independientes ni métricas de rendimiento publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (según etiquetas del repo); incluye tronco denso y cabeza MTP |
| Parametros totales | 36.556.177.299 (dato real de safetensors); el nombre comercial indica "180B" |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; 1.048.576 con YaRN factor 4 |
| Tipos de cuantizacion | 4 bits (K4) en pesos; KV cache a 8 bits |
| Idiomas soportados | en, ko, zh, ja, multilingual |
| Licencia | Pesos: Qwen Community License 1.0; plantilla Sharp: Apache-2.0 |
| Formato de pesos | Safetensors en formato Sushi (MLX); no es GGUF ni ExLlamaV3 nativo |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio: se identifica como MoE con componentes adicionales de decodificación especulativa (cabeza MTP) y una tabla n-gram para decodificación asistida. El pack incluye 52 shards de pesos, el tronco denso, la tabla n-gram y la cabeza MTP, todos byte-idénticos al pack K4 original. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica destacable de esta variante es la plantilla Sharp (`qwen3.8-froggeric-v22.5.0`, fijada en la revisión `6a78b888557f8c9987f51bca98d02d8f69682044`), que añade instrucciones de respuesta concisa tras el system prompt del usuario, preserva el historial de razonamiento por defecto, ajusta las instrucciones de herramientas según el modo de pensamiento activado o desactivado y añade guía tras errores de herramienta detectados. El autor indica explícitamente que la plantilla no altera lo que los pesos saben y que no se reclama ninguna ventaja medida de inteligencia o velocidad frente a la plantilla original.

## Capacidades

- Generación de texto conversacional multi-turno con preservación del historial de razonamiento.
- Razonamiento con niveles de esfuerzo configurables: `off`, `low`, `medium`, `xhigh`.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con soporte de visión activable en el runtime.
- Llamadas a herramientas con formato XML por defecto, compatible con las marcas de pensamiento y medios de Qwen.
- Contexto largo de hasta 262.144 tokens nativos y 1.048.576 con escalado YaRN.
- Soporte multilingüe declarado en inglés, coreano, chino, japonés y multilingüe en general.
- Compatibilidad con APIs OpenAI Chat Completions y Anthropic Messages a través del servidor Sushi.
- Decodificación especulativa mediante cabeza MTP y tabla n-gram.

## Casos de uso

- Asistencia conversacional de contexto largo: el modelo puede mantener conversaciones multi-turno con documentos extensos dentro de la ventana de 262.144 tokens, adecuado para análisis de contratos, informes o bases de código completas.
- Análisis de documentos con imágenes: al soportar entrada imagen-texto, permite extraer información de capturas, diagramas o páginas escaneadas combinadas con texto.
- Agente de codificación local: con tool calling XML y niveles de esfuerzo ajustables, se puede integrar en flujos tipo Claude Code o similares a través de la API Anthropic Messages que expone Sushi.
- Razonamiento profundo con control de coste: el parámetro `reasoning_effort` permite usar `low` para tareas rutinarias y `xhigh` para problemas complejos, ajustando el consumo de tokens.
- Despliegue en estación de trabajo Apple Silicon: pensado para equipos con 128 GiB de memoria unificada, permite ejecutar un modelo de gran tamaño en local sin GPU dedicada.
- Procesamiento multilingüe en asiático y inglés: útil para equipos que trabajan con contenido en chino, japonés o coreano junto a inglés.
- Prototipado de pipelines RAG: la ventana larga y la caché de prefijos permiten indexar grandes corpus y reutilizar contexto entre consultas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor únicamente reporta métricas de despliegue en su equipo de pruebas (Apple M5 Max, 128 GiB, macOS 27.2, Sushi 1.7.3, MLX 0.32.3): 68,46 GB de bytes de pesos indexados y una huella de proceso de 66-68 GB con caché de prefijos de contexto largo activada. No se aportan cifras de latencia, throughput ni calidad en tareas estandarizadas.

## Requisitos de hardware

- Memoria: el autor reporta una huella de proceso de 66-68 GB con el modelo cargado y caché de prefijos activa; el repositorio completo ocupa 100,48 GB (93,58 GiB).
- Hardware de referencia: Apple M5 Max con 128 GiB de memoria unificada, con ajuste del límite de memoria cableada del GPU mediante `sysctl iogpu.wired_limit_mb=124000`.
- Equipos de 48-64 GiB: el autor indica que no cabe y remite al pack hermano de 2,5 bits (`Darwin-180B-RSI-R3-Sushi-2.5bpw-Sharp`).
- No se puede mantener un segundo pack Darwin residente al mismo tiempo; el servidor rechaza la carga en lugar de hacer swapping.
- Despliegue exclusivo mediante el runtime Sushi (instalable con `brew install beamivalice/tap/sushi`), no compatible con vLLM, llama.cpp, Ollama ni TGI.
- No se dispone de datos de latencia o throughput medidos más allá de las pruebas de humo mencionadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darwin-180B-RSI-R3-Sushi-4bpw-Sharp | 36.556.177.299 (según safetensors) | 262.144 nativo / 1.048.576 YaRN | Sushi (MLX) | Qwen Community 1.0 | Hugging Face |
| Darwin-180B-RSI-R3-Sushi-4bpw | mismos pesos | mismo | Sushi (MLX) | Qwen Community 1.0 | Hugging Face |
| Darwin-180B-RSI-R3-Sushi-2.5bpw-Sharp | no disponible | no disponible | Sushi (MLX) | Qwen Community 1.0 | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría, ni de datos de rendimiento que permitan una comparación cuantitativa. Las diferencias entre los packs Sushi son de cuantización y plantilla, no de arquitectura.

## Limitaciones y advertencias

- La información pública es escasa y procede casi exclusivamente del autor de la cuantización; no hay validación independiente.
- Existe una discrepancia entre el nombre comercial "180B" y los 36.556.177.299 parámetros reales declarados en los safetensors; conviene verificar antes de planificar recursos.
- La plantilla Sharp no altera los conocimientos del modelo, pero el autor advierte de que el enrutamiento exacto de expertos no garantiza respuestas byte-idénticas tras cambiar la plantilla.
- Las comprobaciones de la plantilla se realizaron sobre el pack K2.5 con Sushi 1.4.0; en este pack con Sushi 1.7.3 no se repitió la matriz de renderizado, solo pruebas de humo.
- El modelo está atado al runtime Sushi y a Apple Silicon; no es portable a ecosistemas CUDA ni a formatos GGUF.
- La licencia de los pesos es Qwen Community License 1.0, con posibles restricciones para uso comercial que deben revisarse en el fichero LICENSE.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluación de seguridad.
- El contexto de 1M tokens requiere escalado YaRN y ajustes de memoria del sistema; sin ellos el contexto efectivo es de 262.144 tokens.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Cianidos/Darwin-180B-RSI-R3-Sushi-4bpw-Sharp
- Pack base K4: https://huggingface.co/Cianidos/Darwin-180B-RSI-R3-Sushi-4bpw
- Pack hermano de 2,5 bits: https://huggingface.co/Cianidos/Darwin-180B-RSI-R3-Sushi-2.5bpw-Sharp
- Plantilla Qwen Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Revisión fijada de la plantilla: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates/tree/6a78b888557f8c9987f51bca98d02d8f69682044
- Plantillas base de froggeric: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Modelo base: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3
- Papers citados en las etiquetas: arxiv:2605.14386 y arxiv:2609.20269 (no verificados en la información disponible)
