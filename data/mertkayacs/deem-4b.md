# mertkayacs/Deem-4B

## Resumen
Deem-4B es un modelo de decisión de 4B parámetros desarrollado por Eschatia Labs (publicado bajo la cuenta de Hugging Face `mertkayacs`), un laboratorio independiente sin ánimo de lucro dedicado a IA open source. No es un modelo generativo al uso: recibe una situación, una pregunta tipada y un conjunto cerrado de opciones, y devuelve una probabilidad calibrada para cada opción en lugar de texto libre. Está afinado a partir de `internlm/Intern-Decision-4B` y su pipeline declarado en Hugging Face es `text-classification`.

El problema que aborda es el enrutamiento y la clasificación con incertidumbre explotable: triaje de tickets, severidad de incidentes, scoring de leads o detección de phishing, con la posibilidad de abstenerse (`abstain`) cuando ninguna opción es defendible. Según la model card, alcanza un 94,7% de exactitud en decisiones en inglés held-out (frente al 84,7% de Kev-4B), un Brier score de 0,091 y solo un 14,0% de respuestas alteradas por instrucciones inyectadas.

Su relevancia práctica está en el coste de despliegue: el build GGUF Q4_K_M ocupa 2,71 GB y consume 3,04 GB de RAM pico con 4k de contexto, lo que permite ejecutarlo en local o en dispositivos modestos con llama.cpp u Ollama. El contador público es todavía pequeño (247 descargas, 1 like, 5 estrellas en GitHub a fecha de la información disponible), por lo que la validación externa es limitada.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder afinado desde `internlm/Intern-Decision-4B`; el metadata de Hugging Face incluye el tag `qwen3_5`, no confirmado en la model card |
| Parametros totales | 4.539.265.536 (~4,54B) según safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens según free2aitools; no confirmado en la model card |
| Tipos de cuantizacion | GGUF Q4_K_M (por defecto), Q5_K_M y Q8_0; pesos completos en safetensors (repo de 9,4 GB, precisión de 16 bits) |
| Idiomas soportados | en, tr, de (declarados); el uso práctico documentado es en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento
Deem-4B es un fine-tuning del modelo de decisión `internlm/Intern-Decision-4B`, con relación `base_model_relation: finetune`. El autor no detalla en la información disponible la composición del dataset de preentrenamiento del modelo base, el número de tokens vistos durante el afinado ni si se aplicaron etapas de RLHF o DPO. El entrenamiento propio se orienta a un formato de "decision token": el modelo no genera prosa, sino que puntúa cada opción permitida y el servidor JevAlt traduce esas puntuaciones a probabilidades calibradas.

Las innovaciones declaradas son la calibración de probabilidades y el uso de predicción conforme (*conformal prediction*) para acotar la incertidumbre, junto con la preservación del formato de decisión en los backends de Transformers y llama.cpp. La model card reporta además resistencia a inyección de instrucciones (14,0% de respuestas alteradas frente al 36,0% de Kev-4B) y una API que soporta preguntas de elección, sí/no, puntuaciones ordenadas y una opción `unknown` con abstención. El conjunto de evaluación held-out procede del mismo pipeline de datos que el entrenamiento, lo que conviene tener en cuenta al interpretar las cifras.

## Capacidades
- Clasificación y enrutamiento con salida de probabilidad por opción (elección múltiple con criterios descriptivos por categoría).
- Preguntas booleanas (sí/no) y puntuaciones ordenadas sobre un conjunto de opciones.
- Abstención explícita: opción `unknown` con `abstain: true` cuando falta información en la situación de entrada.
- Calibración de confianza y predicción conforme, pensadas para umbrales operativos en producción.
- Modo de razonamiento opcional (`reasoning: "off"` por defecto; el archivo fuente almacena la traza cuando se activa).
- Robustez relativa frente a instrucciones plantadas en el texto de entrada (14,0% de flips en la evaluación del autor).
- Soporte de tres idiomas declarados (en, tr, de), aunque la documentación insiste en formular la situación, la pregunta y las opciones en inglés.
- Ejecución local/on-device vía llama.cpp, Ollama y un servidor JevAlt con API HTTP compatible con el patrón `/v1/systemone`.
- Capacidades vision/texto: el tag `image-text-to-text` aparece en el metadata, pero no hay evidencia en la model card de entrada de imágenes; tratar como no confirmado.
- No documentado: tool calling genérico, function calling, agentes multi-paso o generación de código.

## Casos de uso
- Triaje de tickets de soporte: enviar el texto del ticket y un mapa de criterios (`Billing`, `Technical support`, `Sales`, `Account`) para obtener la probabilidad de cada cola; el ejemplo registrado asigna 94,8% a `Billing` en un caso de cobro duplicado.
- Priorización de incidentes: clasificar la severidad de una caída de servicio con una pregunta de elección (`Critical`, `High`, `Medium`, `Low`); el ejemplo de caída de checkout devuelve `Critical` con 87,6%.
- Filtrado de phishing y correo malicioso: decidir entre `Quarantine`, `Deliver` o `Escalate` a partir del cuerpo del mensaje, con la ventaja de que las instrucciones plantadas en el correo mueven la respuesta solo en un 14,0% de los casos según el autor.
- Scoring de leads comerciales: clasificar un lead como `Hot`, `Warm` o `Cold` (ejemplo registrado: 92,3% para `Hot`) e integrar la probabilidad en la cola de CRM.
- Verificación de políticas en soporte: comprobar si una devolución cae dentro de la ventana de 14 días (ejemplo: `No` con 97,9%) antes de derivar a un agente humano.
- Extracción con abstención: cuando el mensaje del huésped no contiene el dato de reserva, el modelo devuelve `unknown` con 97,6% en lugar de inventar la categoría, lo que permite lanzar una pregunta de aclaración.
- Automatización on-device o en el borde: con 2,71 GB de fichero Q4_K_M y 3,04 GB de RAM pico a 4k de contexto, cabe en portátiles y mini-PC para preclasificar antes de llamar a un LLM grande en la nube.
- Enrutamiento dentro de pipelines de agentes: usar la distribución de probabilidad como señal de confianza para decidir entre respuesta automática, revisión humana o escalado a un modelo mayor.

## Benchmarks y rendimiento
| Benchmark | Deem-4B | Kev-4B | Notas |
|---|---|---|---|
| Exactitud en decisiones en inglés (held-out) | 94,7% | 84,7% | Test set del mismo pipeline de datos que el entrenamiento |
| Brier score | 0,091 | 0,256 | Menor es mejor; mide calibración |
| Respuestas alteradas por instrucción plantada (*planted instruction flips*) | 14,0% | 36,0% | Menor es mejor |
| Live test (4 de octubre de 2026) | 122/130 | no disponible | 130 peticiones en inglés con respuesta conocida |
| MMLU, HumanEval, GSM8K | no disponibles | no disponible | No publicados en la información disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las cifras anteriores son las que reporta el autor en su propia evaluación.

## Requisitos de hardware
- Inferencia en cuantización Q4_K_M: fichero de 2,71 GB y 3,04 GB de RAM pico con 4k de contexto, según la model card.
- Pesos completos: repo de 9,4 GB; se necesita al menos ~10-12 GB de VRAM/RAM para cargarlos en 16 bits, más overhead de activaciones y del servidor.
- GPU recomendadas: no hay datos específicos del autor. Por tamaño son razonables GPUs de consumo con 8 GB o más (RTX 3060 Ti, 4060 Ti, 4070, 4080, 4090) para los pesos completos, y cualquier GPU con 4 GB o más para Q4_K_M. A100/H100 solo tendrían sentido por concurrencia, no por tamaño.
- Cabe en GPU de consumo: sí, con Q4_K_M en cualquier GPU con ~4 GB de VRAM libre; también en CPU, dado el consumo de 3,04 GB de RAM.
- Opciones de despliegue: llama.cpp (backend por defecto del servidor JevAlt), Ollama (`ollama run mertkayacs/deem-4b`), Transformers (`jevalt serve --backend hf`) y el servidor JevAlt (`pip install "jevalt[serve,gguf]"`). vLLM y TGI no aparecen documentados.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens/s ni de peticiones/s en la información proporcionada.
- Nota: Ollama devuelve la letra de la opción; las probabilidades calibradas las añade el servidor JevAlt.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Exactitud declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deem-4B | ~4,54B | 32.768 (no confirmado) | 94,7% held-out en inglés; Brier 0,091 | Apache-2.0 | Pesos safetensors y GGUF; Ollama; Space de demo |
| Kev-4B | no disponible (referido como 4B) | no disponible | 84,7% held-out; Brier 0,256; flips 36,0% | no disponible | no disponible |
| internlm/Intern-Decision-4B (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de contexto y licencia de los modelos comparables en la información proporcionada, por lo que la comparación con alternativas genéricas de ~4B (Qwen, Llama, Phi) no puede hacerse con rigor aquí.

## Limitaciones y advertencias
- El conjunto de evaluación held-out procede del mismo pipeline de datos que el entrenamiento, por lo que el 94,7% puede ser optimista respecto a dominios reales.
- El modelo está pensado y documentado para inglés; aunque declara tr y de, no hay métricas publicadas para esos idiomas y la propia documentación pide formular las peticiones en inglés.
- No es un modelo conversacional: no genera explicaciones ni texto libre, solo distribuciones sobre opciones predefinidas. Usarlo como chat produciría resultados degenerados.
- Aunque el 14,0% de flips por instrucciones plantadas es mejor que el 36,0% del comparador, sigue implicando que una de cada siete decisiones puede manipularse con texto inyectado.
- Riesgo de alucinación estructural bajo (el espacio de salida está acotado), pero riesgo de sobrconfianza si la calibración se aplica fuera de la distribución de entrenamiento.
- La abstención depende de que las opciones y los criterios estén bien definidos; con criterios ambiguos la probabilidad se reparte y el umbral de decisión se vuelve poco fiable.
- Validación externa escasa: 247 descargas, 1 like y 5 estrellas en GitHub en la fecha de la información; proyecto de un laboratorio pequeño sin replicaciones independientes conocidas.
- La licencia Apache-2.0 permite uso comercial, pero no hay garantías ni soporte declarados por el autor.
- Existe un tag `image-text-to-text` en el metadata que no se corresponde con ninguna capacidad documentada; no asumir entrada multimodal.
- La ficha no detalla sesgos demográficos o lingüísticos medidos; no hay auditoría publicada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mertkayacs/Deem-4B
- Builds GGUF: https://huggingface.co/mertkayacs/Deem-4B-GGUF
- Página del proyecto: https://jevalt.mertkayacs.com/models/deem-4b/
- Repositorio JevAlt en GitHub: https://github.com/mertkayacs/jevalt
- Demo en Spaces: https://huggingface.co/spaces/mertkayacs/JevAlt
- Dataset de entrenamiento: https://huggingface.co/datasets/mertkayacs/jevalt-data
- Resultados de benchmark: https://huggingface.co/datasets/mertkayacs/jevalt-bench
- Ejemplos registrados con probabilidades: https://huggingface.co/datasets/mertkayacs/jevalt-bench/blob/main/results/examples/space-examples.json
- Evaluador JevOss: https://github.com/mertkayacs/jevoss
- Página de benchmarks de Eschatia Labs: https://eschatialabs.com/benchmarks/jevalt-bench/
- Ficha en Ollama: https://ollama.com/mertkayacs/deem-4b
- Guía de ejecución local: https://github.com/mertkayacs/jevalt/blob/main/docs/local.md
