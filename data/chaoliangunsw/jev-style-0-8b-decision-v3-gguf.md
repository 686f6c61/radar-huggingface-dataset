# chaoliangUNSW/Jev-Style-0.8B-Decision-v3-GGUF

## Resumen

Jev-Style-0.8B-Decision-v3-GGUF es la version cuantizada en formato GGUF de chaoliangUNSW/Jev-Style-0.8B-Decision-v3, un modelo de decision de 752 millones de parametros construido sobre la arquitectura Qwen3.5-0.8B. No es un modelo conversacional: en lugar de generar texto, lee un estado (por ejemplo, un ticket de soporte o una resena) y devuelve una probabilidad calibrada para cada opcion de cada pregunta planteada, sin limite de letras ni de numero de opciones. Su autor lo publica bajo licencia Apache 2.0 y la model card lo enmarca en la serie Jev-Style, que va de las versiones v1 y v2 de 2B a esta v3 de 0,8B.

El modelo acepta hasta 25.600 tokens de entrada y se apoya en un scorer empaquetado (`jev-score`, construido sobre llama.cpp) que solicita logits unicamente en las posiciones de veredicto asociadas a cada opcion. Esto permite decodificar el estado una sola vez y puntuar varias preguntas sobre copias del mismo, un modo de operacion que el autor cifra hasta 4,6 veces mas rapido que un motor de arquitectura Laya cuando 10 preguntas comparten un estado de 4K tokens (1.381 ms frente a 6.364 ms).

Su relevancia es doble: por un lado, ofrece en 0,53 GB (Q4_K_M) un comportamiento identico al de la referencia PyTorch FP32 en las pruebas de paridad publicadas; por otro, se posiciona como implementacion abierta y autoalojable del paradigma "System One" que TypeSafe AI comercializa con su modelo Jev, un modelo propietario con API de pago. Los pesos son estandar y cualquier version reciente de llama.cpp los carga, pero las decisiones solo se obtienen a traves del scorer incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso basado en Qwen3.5-0.8B, con cabeza de decision calibrada (modelo de decision, no de chat) |
| Parametros totales | 752.393.024 (0,75 B), dato de safetensors |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | hasta 25.600 tokens de entrada |
| Tipos de cuantizacion | F16 (1,52 GB), Q8_0 (0,81 GB), Q4_K_M (0,53 GB) |
| Idiomas soportados | en, zh, ar, bg, de, el, es, fr, hi, ja, ko, pt, ru, sw, ta, th, tr, ur, vi (19 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp; el repo pesa 2,9 GB en total) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso heredado de Qwen3.5-0.8B, sin mezcla de expertos ni capas recurrentes. Lo diferencial no esta en el backbone, sino en la cabeza de decision y en el protocolo de inferencia: el modelo no emite texto libre, sino que se leen los logits en una posicion de veredicto por opcion, de modo que una misma pasada sobre el estado produce la distribucion de probabilidad de todas las opciones de todas las preguntas. El autor describe el enfoque como "un estado, una pasada, todas las opciones puntuadas", con calibracion explicita como etiqueta de la serie.

La model card remite a la ficha del modelo base para los detalles de datos de entrenamiento, protocolos y licencias, por lo que el numero de tokens de entrenamiento, la composicion del dataset y el uso de RLHF o DPO no se detallan en la informacion disponible. Lo que si se documenta es el pipeline de cuantizacion: los tres ficheros GGUF mantienen el top-1 de la referencia FP32 en 240 de 240 filas de un fixture de paridad mixto (22 categorias, ingles y chino, filas extraidas del propio pool de entrenamiento) y en 6 de 6 prompts largos de aproximadamente 16K y 25,6K tokens. Estas cifras miden acuerdo entre formatos, no precision.

## Capacidades

- Clasificacion y decision tipada: devuelve una probabilidad calibrada por opcion para preguntas de opcion multiple o de si/no, sin limite en el numero de opciones.
- Puntuacion multiple sobre un mismo estado: `decide_many` permite lanzar todas las preguntas relativas a un estado en una sola peticion; el modo `exact` comparte el estado en bloques de 1.024 tokens y el modo `batched` lee el estado completo una sola vez.
- Procesamiento de contexto largo: hasta 25.600 tokens de entrada, con preguntas sobre estados de 8K tokens resueltas en 2,3 a 2,6 s en el hardware de referencia.
- Multilinguismo: 19 idiomas declarados, con pruebas de paridad que cubren ingles y chino.
- Integracion como proceso: `jev-score` se ejecuta como proceso JSON-lines y expone una API Python (`JevStyleDecisionGGUF`) con los metodos `decide` y `decide_many`.
- Enrutamiento por categoria: la API acepta un parametro `category` (por ejemplo `theme_routing` o `general_sentiment`) para encuadrar la decision.
- Generacion de texto conversacional: el modelo es tecnicamente capaz de generar texto por ser un Qwen3.5 estandar, pero la model card advierte explicitamente que el chat o la generacion no producen las decisiones del modelo.
- Tool calling, agentes, vision y audio: no disponible en la informacion proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un ticket con metadatos (por ejemplo, `customer_tier`) el modelo puntua a que equipo corresponde (facturacion, tecnico, ventas) mediante `category="theme_routing"`, con la probabilidad asociada a cada equipo en lugar de una etiqueta unica.
- Analisis de sentimiento calibrado: sobre una resena o comentario, se obtiene la probabilidad de cada polaridad, lo que permite fijar umbrales de derivacion a revision humana en funcion del riesgo de negocio.
- Moderacion de contenido con umbrales: al devolver probabilidades en vez de texto, es posible aplicar cortes configurables (por ejemplo, escalar a revision manual todo lo que supere 0,3 de probabilidad en una categoria sensible).
- Clasificacion de documentos largos: con 25.600 tokens de contexto, se pueden procesar contratos, informes o hilos completos y hacer varias preguntas sobre el mismo documento en una sola pasada compartiendo el estado.
- Triage en pipelines de automatizacion: al ejecutarse como proceso JSON-lines sobre llama.cpp, encaja en flujos de CI/CD o colas de trabajo donde cada elemento debe etiquetarse o derivarse con una puntuacion auditable.
- Validacion de decisiones a gran escala: la calibracion declarada (Brier bajo) lo hace util para priorizar colas de revision, ordenando casos por incertidumbre del modelo en lugar de por orden de llegada.
- Extraccion de decisiones de si/no en formularios: preguntas binarias sobre un estado de entrada, utiles para verificaciones tipo "cumple la politica X" con la probabilidad asociada como senal de confianza.
- Despliegue en el borde o en portatil: con 0,53 GB en Q4_K_M puede ejecutarse en un portatil o en una maquina sin GPU dedicada, lo que habilita clasificacion local sin enviar datos a terceros.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Decisiones tipadas | 79,2 % sobre 2.000 decisiones | +6,4 puntos sobre Jev y +5,7 sobre el 2B v2; in-domain para v3 y zero-shot para Jev |
| Brier score | 3,2 veces inferior al de Jev | Sobre el mismo conjunto de decisiones tipadas |
| Paridad de cuantizacion (top-1) | 240/240 | Fixture mixto de 22 categorias, ingles y chino, filas del pool de entrenamiento; mide acuerdo entre formatos, no precision |
| Paridad en prompts largos | 6/6 | Prompts de aproximadamente 16K y 25,6K tokens |
| Latencia (10 preguntas sobre un estado de 4K) | 1.381 ms | Modo `many_mode="batched"`; el motor de comparacion de arquitectura Laya tarda 6.364 ms |
| Latencia (estados de 8K) | 2,3 a 2,6 s | F16 sobre llama.cpp GGUF, Apple M1 Max 64 GB, p50 en caliente |

No se han publicado resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. Las cifras de latencia corresponden a un export sin entrenar de la misma arquitectura Qwen3.5-0.8B ejecutado en llama.cpp, y el motor de comparacion es un fine-tune propio de la arquitectura Laya (MacLaya-4K), no un checkpoint oficial de Laya.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M cabe en menos de 1 GB de memoria; Q8_0 en torno a 1 GB; F16 alrededor de 1,5 a 2 GB contando el contexto.
- GPU recomendadas: no requiere GPU dedicada. La model card reporta mediciones en Apple M1 Max de 64 GB con backend Metal. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) sobra para este tamano; el cuello de botella es la longitud del estado, no los pesos.
- Cabe en GPU de consumo: si, en practicamente todas, incluidas GPU de portatil con 4 GB o menos. Tambien es viable en CPU.
- Opciones de despliegue: llama.cpp es la via soportada, ya que el modelo necesita el programa `jev-score` (compilado a partir de `jev_score.cpp`, probado en el commit 441df11f65ea0b6d0c72965aaf70c8241070ddcb o posterior). El script de compilacion admite Metal en macOS y CUDA en Linux mediante `LLAMA_CMAKE_FLAGS="-DGGML_CUDA=ON"`. Al ser GGUF estandar, herramientas como Ollama pueden cargar los pesos, pero no ejecutaran el protocolo de decision. vLLM y TGI: no disponible.
- Latencia y throughput: 1.381 ms para 10 preguntas que comparten un estado de 4K tokens y 2,3 a 2,6 s para estados de 8K, medidos en F16 sobre Apple M1 Max 64 GB con p50 en caliente. No se publican cifras de throughput por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev-Style-0.8B-Decision-v3 (GGUF) | 0,75 B | 25.600 tokens | 79,2 % en 2.000 decisiones tipadas; Brier 3,2x mejor que Jev | apache-2.0 | Pesos abiertos en HuggingFace; Q4_K_M de 0,53 GB |
| Jev-Style-2B-Decision v2 (GGUF) | 2 B | no disponible | 5,7 puntos por debajo de v3 en el mismo conjunto | apache-2.0 | Pesos abiertos; su Q4_K_M pesa 1,27 GB, aproximadamente 2,4x el de v3 |
| Jev (TypeSafe AI) | no disponible | no disponible | Referencia zero-shot del benchmark; 6,4 puntos por debajo de v3 y Brier 3,2x peor | propietaria | Solo API alojada, abierta el 21 de septiembre de 2026 a 0,042 USD por millon de tokens de entrada, salida gratuita |
| Qwen3.5-0.8B (backbone sin ajustar) | 0,75 B | no disponible | No comparable directamente: no expone el protocolo de decision | no disponible | Base del modelo; el autor lo usa como export sin entrenar para medir latencia |

La comparacion con Jev esta sesgada a favor de v3: los datos de v3 son in-domain mientras que los de Jev son zero-shot, tal y como reconoce la propia model card.

## Limitaciones y advertencias

- No es un modelo de chat: la generacion de texto con llama.cpp u otro runtime no devuelve decisiones. Es obligatorio usar el scorer `jev-score` y el protocolo de posiciones de veredicto.
- Las cifras de paridad (240/240 y 6/6) se calcularon sobre filas extraidas del pool de entrenamiento y miden acuerdo entre formatos de cuantizacion, no precision del modelo. No deben citarse como metrica de calidad.
- El benchmark de 79,2 % en 2.000 decisiones tipadas es in-domain para v3 y zero-shot para Jev, por lo que la ventaja de 6,4 puntos no es directamente comparable.
- En modo `batched`, las probabilidades pueden diferir hasta 0,002 respecto a `decide`, y un resultado casi empatado puede cambiar de ganador. Para maxima fidelidad debe usarse `many_mode="exact"`.
- La composicion del dataset de entrenamiento, el numero de tokens y el uso de RLHF o DPO no se detallan en la informacion disponible, lo que dificulta evaluar sesgos.
- El contexto maximo es de 25.600 tokens: estados mas largos requieren truncado o troceado.
- El modelo no es el Jev oficial de TypeSafe AI, sino un desarrollo independiente de la serie Jev-Style; no hay garantia de equivalencia de comportamiento.
- El repositorio registra 0 descargas y 0 likes, por lo que carece de validacion externa de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene verificar las condiciones del backbone Qwen3.5 subyacente antes de un despliegue en produccion.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace (GGUF): https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-GGUF
- Modelo base: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3
- Version v1 de 2B (GGUF): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Version v2 de 2B (GGUF): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF
- Version de 2B en MLX bf16: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-MLX-bf16
- Sitio web de la serie: https://jevstyle.com
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Jev AI Model (TypeSafe AI): https://jevmodel.org/
- Entrada de Wikipedia sobre Jev: https://en.wikipedia.org/wiki/Jev_(AI_model)
- Blog de TypeSafe AI sobre los modelos System One y Jev: https://typesafe.ai/blog/introducing-system-one-models-and-jev
