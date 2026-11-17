# AtomicChat/Maxwell-V1-Flash-GGUF

## Resumen

Maxwell-V1-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Maxwell, con un total de 35.970.737.539 parámetros (aproximadamente 36B) y 3B parámetros activos por token. Está preentrenado sobre unos 26 billones (26T) de tokens multilingües y postentrenado para razonamiento, búsqueda y trabajo agéntico. Se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en productos derivados.

El repositorio AtomicChat/Maxwell-V1-Flash-GGUF contiene la primera cuantización GGUF del modelo, creada por AtomicChat a partir de los pesos BF16 originales del equipo Maxwell. Incluye además el parche `maxwell-moe-port.patch`, que añade el soporte de la arquitectura `maxwell-moe` a llama.cpp en el commit `d3c3e242c`. Es relevante ahora porque permite ejecutar localmente un MoE de 36B con solo 3B activos, algo especialmente atractivo para hardware de consumo y estaciones de trabajo con GPU de gama alta, aunque con la advertencia de que el llama.cpp estándar, LM Studio y Ollama todavía no cargan estos ficheros.

Una característica diferencial es su tokenizador, diseñado específicamente para tailandés, lao, birmano, jemer y shan, además de CJK y texto latino. El modelo es inusualmente sensible al redondeo numérico: pequeñas diferencias en la precisión pueden alterar la selección de expertos en el router, lo que condiciona las recomendaciones de cuantización y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`maxwell-moe`), 45 bloques: 3 densos SwiGLU + 42 con 256 expertos enrutados (12 activos) y un experto compartido; GQA (32 cabezas Q, 4 KV, head size 128); RMSNorm por cabeza en Q y K; RoPE; manifold-constrained hyper-connections (mHC) con 4 flujos residuales |
| Parametros totales | 35.970.737.539 (~36B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de despliegue usa `-c 32768`) |
| Tipos de cuantizacion | BF16 (2 partes, 16.02 bpw), Q8_0 (8.54 bpw); se menciona un preset Q4_K_M sin importance matrix (21.9 GB) que el autor no publica; se cita un fichero `AD-Q4_K-IQ4_XS` en el ejemplo de ejecucion |
| Idiomas soportados | Multilingue; tokenizador optimizado para thai, lao, birmano, jemer y shan, ademas de CJK y latin |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales BF16 en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con mezcla de expertos: 45 bloques en total, de los cuales los tres primeros son densos con SwiGLU y los 42 restantes contienen 256 expertos enrutados (12 activos por token) más un experto compartido. El router usa puntuaciones sigmoideas con un sesgo de selección. La atención es GQA con 32 cabezas de consulta y 4 de clave/valor, tamaño de cabeza 128, RMSNorm por cabeza sobre Q y K, y RoPE. Incorpora manifold-constrained hyper-connections (mHC): cuatro flujos residuales mezclados mediante matrices normalizadas con Sinkhorn y colapsados por una cabeza aprendida, con la misma aritmética que el mHC de DeepSeek-V4 en llama.cpp.

El preentrenamiento se realizó sobre aproximadamente 26T de tokens multilingües, seguido de un postentrenamiento orientado a razonamiento, búsqueda y tareas agénticas. El tokenizador propio separa explícitamente saltos de línea, texto Han y secuencias de thai/lao/birmano/jemer antes de aplicar una división de palabras estilo GPT-4o; según el autor, coincide con el tokenizador original en las 5.599 muestras comparadas (30 idiomas, código, casos límite y un barrido de puntos de código). El puerto a llama.cpp no implementa todavía la atención block-sparse del modelo original.

## Capacidades

- Generación de texto conversacional y razonamiento, con modo de pensamiento (thinking) activado por defecto y desactivable mediante `enable_thinking`.
- Trabajo agéntico y razonamiento multi-paso, según el postentrenamiento declarado por el autor.
- Soporte de tool calling mediante la plantilla de chat embebida (requiere `--jinja` en llama.cpp).
- Capacidades de búsqueda (search) integradas en el postentrenamiento.
- Multilingüismo amplio, con cobertura específica de idiomas del sudeste asiático poco habituales (thai, lao, birmano, jemer, shan) además de CJK y latino.
- Ejecución local y offline mediante llama.cpp con el parche `maxwell-moe-port.patch`.
- No se documentan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Asistencia conversacional local: un MoE de 36B con 3B activos permite desplegar un chatbot de calidad en una estación de trabajo con 48 GB de VRAM usando Q8_0, manteniendo conversaciones multi-turno con plantilla de chat embebida.
- Agentes autónomos con herramientas: el soporte de tool calling y el postentrenamiento agéntico permiten construir pipelines donde el modelo decide llamadas a APIs, ejecuta pasos intermedios y encadena razonamiento multi-paso.
- Procesamiento de idiomas del sudeste asiático: el tokenizador específico para thai, lao, birmano, jemer y shan lo hace adecuado para aplicaciones de atención al ciudadano, traducción o moderación de contenido en esas lenguas, donde otros modelos fragmentan en exceso los tokens.
- Búsqueda aumentada y resumen documental: su entrenamiento en tareas de búsqueda facilita integrarlo como motor de respuesta sobre corpus recuperados, con el modo thinking activado para consultas complejas.
- Generación de código y tareas técnicas: aunque no se publican benchmarks de código, el modelo cubre código en su tokenizador y puede integrarse en asistentes de desarrollo locales sin enviar datos a la nube.
- Despliegue en hardware de consumo de gama alta: con cuantizaciones de 4 bits (preset Q4_K_M de 21.9 GB, no publicado por el autor) cabría en GPUs de 24 GB, aunque el autor advierte de la sensibilidad del modelo al redondeo.
- Investigación sobre enrutamiento MoE: la documentación del efecto del redondeo sobre la selección de expertos (KLD de 0.030 solo por usar bf16 en lugar de F32) lo convierte en un caso de estudio útil para quienes investigan cuantización de MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización medidas con `llama-perplexity` sobre un corpus neutral de 30 idiomas (114 fragmentos de 4096 tokens), en llama.cpp `d3c3e242c` con el parche y 2x H100 80 GB:

| Fichero | GB en disco | bpw | KLD medio | KLD percentil 99 | Mismo token superior |
|---|---:|---:|---:|---:|---:|
| BF16 (2 partes) | 72.0 | 16.02 | 0 | 0 | 100% |
| Q8_0 | 38.4 | 8.54 | 0.0371 | 0.431 | 93.6% |
| Q4_K_M sin importance matrix (no publicado) | 21.9 | no disponible | 0.281 | no disponible | 81.6% |

El autor advierte que estas cifras incluyen un suelo de redondeo de aproximadamente 0.03: los mismos pesos BF16 ejecutados con entradas redondeadas a bf16 en lugar de F32 dan un KLD medio de 0.030 y un 93.2% de mismo token superior. El código de transformers del proveedor en bf16 difiere del fichero BF16 en un KLD medio de 0.044.

## Requisitos de hardware

- VRAM estimada: unos 72 GB para BF16 (2 partes), 38.4 GB para Q8_0 y 21.9 GB para el preset Q4_K_M sin importance matrix (no publicado).
- GPU recomendadas: el autor cita 48 GB de memoria GPU para Q8_0 y 64 GB de Mac; las mediciones se hicieron con 2x H100 80 GB. Para BF16 se requiere hardware de clase H100/A100 de 80 GB o superior.
- GPU de consumo: Q8_0 no cabe en GPUs de 24 GB; el preset de 4 bits (21.9 GB) cabría en una RTX 4090 de 24 GB, aunque el autor no lo publica por su degradación (KLD medio 0.281, 81.6% de mismo token).
- Despliegue: exclusivamente llama.cpp compilado en el commit `d3c3e242c` con el parche `maxwell-moe-port.patch` del repositorio. El llama.cpp estándar, LM Studio y Ollama no cargan estos ficheros todavía. El ejemplo de servidor usa `llama-server` con `--jinja -c 32768 -ngl 99 --temp 0.6 --top-p 0.95 --top-k 20`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Maxwell-V1-Flash | ~36B / ~3B | no disponible | Apache-2.0 | GGUF (llama.cpp con parche) y pesos BF16 originales | Tokenizador especializado en sudeste asiático; sensible al redondeo |
| DeepSeek-V4 (referencia citada) | no disponible | no disponible | no disponible | no disponible | El autor cita su mHC como referencia aritmética implementada en llama.cpp |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sensibilidad extrema al redondeo numérico: pequeñas diferencias de precisión alteran la elección de expertos en el router; incluso Q8_0 presenta un KLD medio de 0.037 frente a BF16.
- El preset Q4_K_M sin importance matrix degrada notablemente la distribución (KLD medio 0.281, 81.6% de mismo token) y el autor decide no publicarlo.
- Soporte limitado en herramientas: requiere llama.cpp parcheado en un commit concreto; llama.cpp estándar, LM Studio y Ollama no cargan los ficheros.
- La atención block-sparse del modelo original no está implementada en el puerto de llama.cpp, por lo que el comportamiento puede diferir del modelo de referencia.
- Longitud de contexto oficial no documentada en la información disponible; el ejemplo de despliegue usa 32.768 tokens.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de robustez en la información proporcionada.
- Idiomas: aunque el tokenizador cubre 30 idiomas, no se detalla el rendimiento por idioma ni la calidad en castellano.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `maxwell-model/Maxwell-V1-Flash` y de los pesos originales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria todavía incipientes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Maxwell-V1-Flash-GGUF
- Modelo base: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Aplicación Atomic Chat: https://atomic.chat/
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- X (Twitter) de Atomic Chat: https://x.com/atomic_chat_hq
- llama.cpp: https://github.com/ggml-org/llama.cpp
