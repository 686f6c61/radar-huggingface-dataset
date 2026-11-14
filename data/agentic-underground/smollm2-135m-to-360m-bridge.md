# agentic-underground/smollm2-135m-to-360m-bridge

## Resumen

El repositorio `agentic-underground/smollm2-135m-to-360m-bridge` no contiene un modelo de lenguaje en sentido estricto, sino un puente de memoria KV (KV bridge) entrenado para transferir el estado interno de SmolLM2-135M-Instruct al espacio de claves/valores de SmolLM2-360M-Instruct. Lo publica el proyecto agentic-underground como prueba de navegador de PrattleNot, una reproducción del método LatentPort descrito en el paper arXiv:2609.25053v1. El objetivo es que el modelo pequeño (135M) lea el prompt y el grande (360M) genere la respuesta a partir de la memoria traducida, sin volver a procesar el texto de entrada.

La relevancia práctica está en la latencia del primer token: al evitar que el 360M tenga que leer el prompt completo, el tiempo hasta el primer token se reduce. Según la model card, en un prompt de 37 tokens y ejecutando en WebAssembly sobre CPU, el 360M puenteado responde 1,87× antes (intervalo del 95 %: 1,83–1,91) que el 360M leyendo el prompt directamente, frente a un techo teórico de 2,71×.

El artefacto es un fichero safetensors de 48 MB que contiene únicamente las matrices de proyección y corrección, no los pesos de ninguno de los dos modelos base. No es un modelo `transformers` y requiere el runtime Rust/WebAssembly de PrattleNot para interpretarse. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente KV sobre pares transformer (SmolLM2-135M-Instruct como lector, SmolLM2-360M-Instruct como generador); regresiones ridge por capa más corrección residual de rango 4 |
| Parametros totales | No aplica como modelo; el fichero contiene 16.384 parámetros de corrección aprendida más las matrices ridge por capa (48 MB en total) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; heredada de SmolLM2-360M-Instruct (no confirmada en la información proporcionada) |
| Tipos de cuantizacion | No disponible; los tensores se almacenan en f16 (`k.<l>`, `v.<l>`) y f32 (`ck.<l>`, `cv.<l>`) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`smollm2-135m-to-360m.safetensors`, 48 MB, sin `__metadata__`) |

## Arquitectura y entrenamiento

El puente se compone de dos piezas. Primero, mapas lineales cerrados (regresión ridge) entrenados por capa objetivo: uno para claves, calculado sobre claves des-rotadas, y otro para valores, ambos a partir de los residual streams de dos capas consecutivas del SmolLM2-135M situadas a la profundidad proporcional correspondiente. Como el 135M y el 360M difieren en número de cabezas y anchura, los mapas leen el residual stream en lugar de las claves y valores nativos del modelo pequeño.

Segundo, la corrección residual de rango 4 propuesta en el paper (`X′ = X + (XB)Uᵀ`, §1.5), aplicada por capa objetivo y por rol, con 16.384 parámetros en total. Se entrena con AdamW atravesando el 360M congelado contra la distribución del 360M nativo, y se pliega en el fichero como `I + BUᵀ`. Los datos de calibración son unas 600 preguntas con plantilla generadas de forma determinista por `crates/core/src/bridge_corpus.rs`; las preguntas de validación de ese mismo fichero nunca se usan en el ajuste y un test unitario garantiza que ambos conjuntos sean disjuntos. El traspaso es de un solo token, tal como describe el paper.

## Capacidades

- Traducción del estado interno (residual streams) del SmolLM2-135M-Instruct a la memoria KV que habría construido el SmolLM2-360M-Instruct.
- Generación de respuestas por parte del 360M a partir de la memoria puenteada, sin que este lea el prompt.
- Traspaso de un solo token entre modelos, conforme al método LatentPort.
- Corrección aprendida de rango 4 para alinear la distribución del 360M puenteado con la del 360M nativo.
- Ejecución nativa en Rust y en WebAssembly sobre CPU.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking por sí mismo; esas capacidades, si existen, dependen de los modelos base.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Reducción de latencia del primer token en asistentes conversacionales: el 135M procesa el prompt y el 360M arranca la respuesta desde la memoria traducida, lo que en la prueba publicada adelanta el primer token 1,87× en WebAssembly sobre CPU.
- Despliegue en navegador sin instalación: la demo de PrattleNot ejecuta el puente en WebAssembly, útil para prototipos de chat o demos interactivas que no pueden depender de un backend GPU.
- Investigación sobre reutilización de estado entre modelos de distinto tamaño: sirve como reproducción verificable del método LatentPort con un par de modelos nuevo, con instrucciones de reproducción en `documents/REPRODUCTION.md`.
- Evaluación de pipelines de decodificación especulativa o handoff entre modelos: el puente materializa el traspaso de un token y permite medir el acuerdo de siguiente token (NCR 0,930) frente al 360M nativo.
- Docencia y experimentación con mecánica de atención: los tensores `k.<l>`, `v.<l>`, `ck.<l>`, `cv.<l>` y `layer_of` permiten inspeccionar cómo se mapea la profundidad entre dos transformers de tamaños distintos.
- Pruebas de calidad en entornos con recursos muy limitados: al no requerir que el 360M procese el prompt, se reduce el coste de prefill en CPU, lo que encaja en dispositivos sin acelerador.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tiempo hasta el primer token, 360M puenteado vs 360M leyendo el prompt | 1,87× antes (IC 95 %: 1,83–1,91), prompt de 37 tokens, WebAssembly en CPU |
| Techo teórico (360M solo ÷ 135M solo) | 2,71× |
| Tokens de puente que lee el 360M | 1 |
| Preguntas de validación respondidas correctamente | 6 de 7 (igual que el 360M leyendo todo) |
| Acuerdo de siguiente token con el 360M nativo (NCR) | 0,930 (sin corregir: 0,802; puente corregido del paper en su propio par: 0,918) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el puente en sí; depende de los pesos de SmolLM2-135M-Instruct y SmolLM2-360M-Instruct, que deben descargarse por separado desde HuggingFaceTB.
- El fichero del puente ocupa 48 MB en disco y no requiere GPU para cargarse.
- GPU recomendadas: no disponibles; la medición publicada se hizo en CPU mediante WebAssembly.
- Cabe en cualquier equipo capaz de ejecutar los dos modelos base; el 360M es de gama muy baja, pero no se confirma en la información proporcionada qué GPU consumer concretas lo soportan.
- Opciones de despliegue: runtime propio de PrattleNot (`prattle_core::bridge`) en Rust nativo o WebAssembly; no es compatible con `transformers`, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se publica la mejora relativa del primer token (1,87×); no hay cifras absolutas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm2-135m-to-360m-bridge (este) | Puente de 48 MB (16.384 parámetros de corrección) | No disponible | Puente KV entre dos SmolLM2 | Apache-2.0 | Hugging Face, runtime PrattleNot |
| SmolLM2-135M-Instruct | 135M | No disponible en la información | Modelo transformer instruct | Apache-2.0 | Hugging Face |
| SmolLM2-360M-Instruct | 360M | No disponible en la información | Modelo transformer instruct | Apache-2.0 | Hugging Face |
| LatentPort (paper, arXiv:2609.25053) | No disponible | No disponible | Método original de puente KV | Apache-2.0 (según atribución) | Paper y repositorio LatentPort |

No se dispone de datos de rendimiento comparables entre estos elementos más allá de las métricas relativas publicadas en la model card.

## Limitaciones y advertencias

- No es un modelo autónomo: no genera texto por sí mismo y exige cargar SmolLM2-135M-Instruct y SmolLM2-360M-Instruct por separado.
- No es compatible con el ecosistema `transformers`; solo se interpreta con el runtime Rust/WebAssembly de PrattleNot, lo que limita su integración en pipelines estándar.
- El acuerdo de siguiente token con el 360M nativo es 0,930, no 1,0; hay divergencia respecto al modelo sin puentear.
- En las preguntas de validación acertó 6 de 7, una menos que el 360M leyendo todo, según la propia model card.
- Las mediciones publicadas son relativas (1,87×) y en un entorno concreto (WebAssembly, CPU, prompt de 37 tokens); no hay cifras absolutas de latencia ni de throughput.
- La calibración usa unas 600 preguntas con plantilla generadas de forma determinista; el comportamiento fuera de esa distribución no está caracterizado.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe.
- Sesgos y riesgo de alucinación: no documentados para el puente; heredados en su caso de los modelos base.
- Licencia Apache-2.0 permite uso comercial, pero la atribución a LatentPort (Simon Villani) y a SmolLM2 (Hugging Face) debe mantenerse.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-underground/smollm2-135m-to-360m-bridge
- Demo en navegador: https://agentic-underground.github.io/PrattleNot/
- Repositorio PrattleNot: https://github.com/agentic-underground/PrattleNot
- Documentación del puente: https://github.com/agentic-underground/PrattleNot/blob/main/documents/BRIDGE.md
- Guía de reproducción: https://github.com/agentic-underground/PrattleNot/blob/main/documents/REPRODUCTION.md
- Corpus de calibración: https://github.com/agentic-underground/PrattleNot/blob/main/crates/core/src/bridge_corpus.rs
- Paper LatentPort: arXiv:2609.25053v1
- LatentPort (web): https://latentport.com/
- LatentPort (repositorio): https://github.com/LatentPort/latentport
- SmolLM2 en Hugging Face: https://huggingface.co/HuggingFaceTB
