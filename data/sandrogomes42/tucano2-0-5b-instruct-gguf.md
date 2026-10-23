# sandrogomes42/tucano2-0.5b-instruct-gguf

## Resumen

Tucano2-0.5B-Instruct-GGUF es la versión cuantizada en formato GGUF (Q4_K_M, aproximadamente 306 MB) del modelo instruccional en portugués de Brasil Polygl0t/Tucano2-qwen-0.5B-Instruct, publicada por el desarrollador 2D TI para su ejecución en el navegador mediante wllama y llama.cpp. El modelo original lo desarrolla la iniciativa Polygl0t, parte de un preentrenamiento continuado sobre Qwen/Qwen3-0.6B-Base (Apache-2.0) con los corpus GigaVerbo v2 en portugués, seguido de un ajuste supervisado (SFT) y una ronda de Anchored Preference Optimization (APO).

Se trata de un transformer denso de arquitectura Qwen3 con 490.799.104 parámetros reales (según safetensors) y una ventana de contexto declarada de 4.096 tokens en la model card del autor. Su relevancia no está en el rendimiento bruto, sino en el nicho: un asistente conversacional en portugués de Brasil, de menos de 500 millones de parámetros, capaz de correr íntegramente en el cliente (navegador o CPU sin GPU) con una huella de disco de unos 306 MB.

El repositorio no aporta pesos retrenados ni ajustados: la modificación de 2D TI consiste en la conversión a GGUF f16 con un script propio para el tokenizador SPM del modelo (no reconocido automáticamente por el conversor oficial) y la posterior cuantización a Q4_K_M. Está pensado como motor de conversación y explicación de conceptos dentro del asistente "Vigilius" del Panel do Cliente, donde los datos transaccionales los sirve un motor determinístico separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen3 |
| Parámetros totales | 490.799.104 (aproximadamente 0,49 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens según la model card del autor; featherless.ai indica 32.768 tokens para el modelo original (dato no confirmado) |
| Tipos de cuantización | Q4_K_M publicada (aproximadamente 306 MB); conversión intermedia en f16 |
| Idiomas soportados | Portugués (pt), con orientación específica a portugués de Brasil |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / wllama); el modelo base se distribuye en safetensors |
| Modelo base | Polygl0t/Tucano2-qwen-0.5B-Instruct (revisión 59ea15044b1f6f94f2fce5776ecd63b155f2c4c2) |
| Tokenizador | SentencePiece propio para portugués, estilo Metaspace («▁») con byte fallback, convertido a vocabulario tipo "llama" (SPM) |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen3 con aproximadamente 490 millones de parámetros, derivado de Qwen/Qwen3-0.6B-Base (Apache-2.0) mediante preentrenamiento continuado sobre los corpus GigaVerbo v2 en portugués, que dan lugar a Polygl0t/Tucano2-qwen-0.5B-Base. Sobre esa base, Polygl0t aplicó una ronda de ajuste supervisado (SFT) y una ronda de Anchored Preference Optimization (APO) para obtener la variante Instruct. El modelo utiliza un tokenizador SentencePiece propio orientado a portugués, con Metaspace y byte fallback, distinto del tokenizador estándar de Qwen.

La contribución de 2D TI en este repositorio es exclusivamente de formato y cuantización: los pesos no se han reentrenado ni ajustado. La conversión a GGUF f16 se realizó con el conversor oficial de llama.cpp (commit `0a1ef30`); dado que el conversor no detecta automáticamente el tokenizador del Tucano2, se empleó el script `convert_tucano2.py`, que escribe el vocabulario como "llama" (SPM) a partir del `tokenizer.json`, derivando la puntuación de cada token del orden de las fusiones (merges) del BPE original y sin espacio inicial automático, sin modificar el código de llama.cpp. La tokenización resultante se verificó como idéntica a la del tokenizador original, incluyendo acentos, cedilla y tilde. La cuantización a Q4_K_M se hizo con `llama-quantize` (release b11796).

## Capacidades

- Generación de texto conversacional en portugués de Brasil, con formato de chat multi-turno (pipeline `text-generation`, tag `conversational`).
- Explicación de conceptos y resolución de dudas en lenguaje natural: es el uso declarado en el asistente Vigilius del Panel do Cliente.
- Respuestas condicionadas por contexto aportado en el prompt (el autor recomienda usar el modelo con datos de contexto y validación posterior).
- Ejecución en el navegador mediante wllama (WASM) y en CPU mediante llama.cpp, sin necesidad de GPU.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking", visión o audio: no disponible; el modelo es únicamente de texto.
- Capacidades multilingües: limitadas al portugués según la model card (tag de idioma `pt`); no se documenta soporte fiable de otros idiomas.

## Casos de uso

- Asistente embebido en el navegador para paneles de cliente: es el caso real documentado; el modelo se carga con wllama desde el repositorio y responde con `n_ctx` de 1536 tokens en el ejemplo del autor, lo que permite ofrecer ayuda contextual sin enviar datos a un servidor.
- Explicación de conceptos técnicos en portugués (copias de seguridad, configuración, términos de producto): el modelo conversa y explica, mientras un motor determinístico independiente aporta los datos verificados del cliente.
- Asistencia de primer nivel offline en portugués de Brasil para aplicaciones de escritorio o kioscos sin conectividad, empaquetando los 306 MB del GGUF junto al binario de llama.cpp.
- Prototipado rápido de interfaces conversacionales en portugués con presupuesto de hardware mínimo, por ejemplo en portátiles sin GPU o en entornos CI para pruebas de integración de la capa de chat.
- Filtrado y clasificación ligera de texto en portugués (detección de intención, normalización de consultas) dentro de pipelines donde el coste por token y la latencia local son críticos.
- Soporte educativo acotado: resolución de dudas frecuentes y reformulación de explicaciones simples para usuarios principiantes, siempre con revisión humana por la propensión a errores factuales de un modelo de este tamaño.
- Componente de demos y aplicaciones web estáticas: al ejecutarse en WASM no requiere backend, lo que simplifica el despliegue de pruebas de concepto en GitHub Pages o entornos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones en portugués (por ejemplo, Poeta o ASSIN), y la referencia de featherless.ai a un buen comportamiento en tareas de generación aumentada por recuperación (RAG) no aporta cifras verificables.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos Q4_K_M ocupan aproximadamente 306 MB en disco; en ejecución hay que sumar la caché KV del contexto, por lo que conviene reservar del orden de 0,5 a 1 GB de memoria para `n_ctx` de 1536 a 4096 tokens.
- GPU: no requiere GPU. Funciona en CPU y en el navegador vía WebAssembly; cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) puede alojarlo con holgura, pero es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles y navegadores, dado el tamaño del archivo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), wllama (WASM, uso declarado por el autor), importación en Ollama o LM Studio a partir del GGUF. vLLM no es una vía recomendada: su soporte de GGUF es experimental y el modelo no está validado en ese motor.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del backend (WASM frente a nativo) y del hilo de CPU. El ejemplo del autor usa `max_tokens` de 110 con `n_ctx` de 1536, lo que sugiere respuestas cortas en un contexto de navegador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Tucano2-0.5B-Instruct-GGUF (este) | 0,49 B | 4.096 (model card) | Portugués (BR) | Apache-2.0 | GGUF Q4_K_M | Cuantizado para wllama/llama.cpp, sin benchmarks publicados |
| Tucano2-qwen-0.5B-Instruct (original) | 0,49 B | 4.096 según su model card; 32.768 según featherless.ai | Portugués (BR) | Apache-2.0 | Safetensors | Requiere conversión o runtime con soporte de safetensors y tokenizador propio |
| Qwen3-0.6B-Base (upstream) | Aproximadamente 0,6 B | No disponible en la información proporcionada | Multilingüe | Apache-2.0 | Safetensors | Base del preentrenamiento continuado; no está ajustado para instrucciones en portugués |
| SmolLM2-360M-Instruct | No disponible en la información proporcionada | No disponible | Principalmente inglés | Apache-2.0 | Safetensors, GGUF | Alternativa de tamaño similar; sin soporte específico de portugués documentado aquí |

## Limitaciones y advertencias

- Modelo muy pequeño (menos de 500 millones de parámetros): puede equivocarse en hechos, cifras y fechas. El propio autor recomienda aportar datos de contexto y validar las respuestas.
- Riesgo de alucinación alto en consultas factuales abiertas; no debe usarse como fuente de verdad sin verificación externa.
- Contexto limitado: 4.096 tokens según la model card, con discrepancias frente a los 32.768 que cita featherless.ai para el modelo original; conviene validar el límite real antes de diseñar prompts largos.
- Cobertura lingüística restringida al portugués (con orientación a portugués de Brasil); no se documenta calidad en otros idiomas, incluido el castellano.
- Idiomas y datos de entrenamiento centrados en corpus brasileños (GigaVerbo v2), lo que puede introducir sesgos de dominio y de registro propios de esas fuentes; no se documenta ninguna evaluación de sesgos.
- La licencia Apache-2.0 permite uso comercial, pero exige mantener los créditos y el aviso de modificación en redistribuciones (Apache-2.0, §4.b). El repositorio incluye un archivo LICENSE.
- Solo se publica la cuantización Q4_K_M; no hay variantes Q5, Q8 ni f16 listas para usar, lo que limita el ajuste de la relación calidad/tamaño.
- El tokenizador no estándar obliga a usar el GGUF tal cual o a replicar el script de conversión; integrarlo en runtimes distintos de llama.cpp/wllama puede requerir trabajo adicional.
- Discrepancia de identidad del repositorio: la model card cita el repo `2DTi/tucano2-0.5b-instruct-gguf`, mientras que la ficha de HuggingFace corresponde a `sandrogomes42/tucano2-0.5b-instruct-gguf`. Conviene verificar cuál es el espejo oficial antes de fijar una dependencia en producción.
- Sin métricas de rendimiento publicadas: no es posible estimar su calidad frente a alternativas sin evaluarlo en el dominio concreto de uso.

## Enlaces

- Repositorio HuggingFace (esta versión): https://huggingface.co/sandrogomes42/tucano2-0.5b-instruct-gguf
- Repositorio citado en la model card (2D TI): https://huggingface.co/2DTi/tucano2-0.5b-instruct-gguf
- Modelo original: https://huggingface.co/Polygl0t/Tucano2-qwen-0.5B-Instruct
- Modelo base del preentrenamiento continuado: https://huggingface.co/Polygl0t/Tucano2-qwen-0.5B-Base
- Upstream de Qwen: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Iniciativa Polygl0t: https://huggingface.co/Polygl0t
- wllama (runtime WASM para llama.cpp): https://github.com/ngxson/wllama
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ficha en featherless.ai: https://featherless.ai/models/Polygl0t/Tucano2-qwen-0.5B-Instruct
- Registro en free2aitools: https://free2aitools.com/model/2dti/tucano2-0.5b-instruct-gguf
