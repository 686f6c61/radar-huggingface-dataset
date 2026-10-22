# LuxiaSL/kotodama-moonshot-1b-s7

## Resumen

Kotodama moonshot 1B (seed 7) es un transformer decoder-only denso de 1,42 mil millones de parámetros desarrollado por LuxiaSL dentro del programa kotodama. No se distribuye como modelo final, sino como una *trayectoria de entrenamiento*: una colección de checkpoints intermedios de preentrenamiento que permiten estudiar cómo evoluciona el modelo token a token. Su arquitectura tiene 52 capas únicas con anchura 1536, de las cuales un bloque central de 20 capas se ejecuta dos veces, dando 72 capas efectivas, y emplea residuales de atención entre bloques cuyos límites se ajustaron a la geometría de capas de la propia red en lugar de espaciarse de forma uniforme.

El propósito declarado del repositorio es medir cuándo se forma el *referent binding* durante el preentrenamiento: en qué etapa de la progresión de cinco fases descrita en la Binding Atlas llega un modelo y con qué recuento de tokens. Por eso el repositorio contiene únicamente checkpoints de la trayectoria, sin modelo final, sin ajuste por instrucciones y sin resultados de evaluación publicados.

Es relevante ahora para investigadores interesados en dinámica de entrenamiento, en arquitecturas con capas recurrentes (*looped transformers*) y en el optimizador Muon, más que para desarrolladores que busquen un modelo listo para producción: es un artefacto de investigación en inglés, con licencia Apache 2.0, que requiere código propio para cargarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con bloque de capas recurrentes (*looped*) y residuales de atención entre bloques |
| Parámetros totales | 1,42 B (52 capas únicas; 72 capas efectivas por el bucle) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (contexto de entrenamiento) |
| Tipos de cuantización | No disponible; los pesos se publican en bf16 y no se ofrecen variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` (bf16) para las ramas `step*`; `checkpoint.pt` para las ramas `anchor*`; metadatos en `config.json` y `aliases.json` |
| Anchura (hidden size) | 1536 |
| Optimizador | Muon |
| Tamaño de batch | 2 M tokens |
| Tamaño del repositorio | 14,3 GB |
| Fecha de creación | 21 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 52 capas y anchura 1536, con un bloque de 20 capas situado en el centro que se recorre dos veces, de modo que el cómputo efectivo corresponde a 72 capas mientras el número de tensores únicos se mantiene en 52. Las capas del bucle comparten pesos con el bloque central y, como safetensors almacena cada tensor una sola vez, es obligatorio restaurar las entradas compartidas a partir de `aliases.json` (`sd[alias] = sd[source]`) antes de cargar el estado. El código necesario es el paquete kotodama (`LuxiaBaseModel`) y la forma, la especificación del bucle y los límites de los bloques viajan en `config.json`.

La innovación técnica destacada son los residuales de atención entre bloques: las fronteras de los bloques no están espaciadas uniformemente, sino ajustadas a la geometría de capas de la propia red. El entrenamiento usa el optimizador Muon con batches de 2 M tokens, contexto de 4 K y tasa de aprendizaje constante; las fases de *cooldown* se ramifican del tronco principal y se publican por separado. Los datos de entrenamiento son una mezcla curada de predominio inglés con código, artículos científicos, patentes, textos legales, libros, texto web, matemáticas y fuentes conversacionales, más un suplemento conversacional de aproximadamente el 0,7 % de los tokens; el dataset no se ha publicado. No se documentan fases de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva propia de un modelo base preentrenado, sin ajuste instructivo ni formato de chat.
- Capacidad de continuación de texto, código, matemáticas y textos técnicos y legales, coherente con la composición del corpus de entrenamiento.
- Soporte de tool calling / function calling: no disponible; no hay evidencia ni ajuste específico.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad entrenada.
- Multilingüismo: limitado a inglés según la model card.
- Capacidad especial de investigación: la propia trayectoria de checkpoints, que permite analizar la evolución de representaciones (referent binding) a lo largo de cinco fases descritas en la Binding Atlas.
- No incluye visión, audio, modo *thinking* ni evaluación publicada de ninguna capacidad.

## Casos de uso

- Estudio de dinámica de preentrenamiento: cargar ramas `step{S}-tokens{T}B` a intervalos de 250 M tokens (hasta 4 B) y de 1 B después para trazar curvas de pérdida y de formación de representaciones con una granularidad poco habitual en modelos abiertos.
- Investigación sobre *referent binding*: evaluar checkpoints sucesivos contra la progresión de cinco fases de la Binding Atlas y determinar en qué recuento de tokens emerge la capacidad, que es exactamente el objetivo declarado del repositorio.
- Reproducción y ablación de arquitecturas *looped*: comparar el bloque central de 20 capas ejecutado dos veces frente a una variante de 72 capas no compartidas para medir el efecto del *weight sharing* y de los límites de bloque ajustados a la geometría de capas.
- Estudio del optimizador Muon: las ramas `anchor-step{S}-tokens{T}B` incluyen momentos del optimizador, estado del scheduler y posición en los datos, lo que permite reanudar el entrenamiento y analizar trayectorias de optimización a escala de 1,4 B.
- Punto de partida para *fine-tuning* experimental: al ser un modelo base en inglés con licencia Apache 2.0, puede servir para experimentos académicos de ajuste supervisado o DPO sobre un checkpoint concreto, aceptando que no hay evaluación de referencia.
- Docencia y divulgación técnica: ilustrar cómo se estructura un repositorio de trayectoria de entrenamiento con checkpoints resumibles, compartición de pesos y alias, y por qué el estado del optimizador importa para la reproducibilidad.
- Análisis de corpus y memorización: comparar checkpoints tempranos y tardíos para estudiar qué dominios (código, patentes, derecho, matemáticas) se adquieren antes durante el preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el repositorio contiene solo checkpoints de la trayectoria y que no incluye modelo final, ajuste por instrucciones ni resultados de evaluación.

## Requisitos de hardware

- VRAM para inferencia: los pesos en bf16 ocupan aproximadamente 2,8 GB (1,42 B × 2 bytes); en fp32, unos 5,7 GB. La memoria para la caché KV no puede estimarse con precisión porque no se publican el número de cabezas de atención ni el número de cabezas KV.
- Checkpoints de ancla: las ramas `anchor-*` añaden momentos del optimizador y estado del scheduler al estado del modelo, por lo que el `checkpoint.pt` es sustancialmente mayor que los pesos bf16; para reanudar entrenamiento hay que prever varias veces el tamaño de los pesos más el estado del optimizador.
- GPU recomendadas: cualquier GPU con 8 GB o más sirve para inferencia en bf16 (RTX 3060 Ti/4060 en adelante, RTX 4090, A100, H100). Para reanudar entrenamiento con batches de 2 M tokens se necesita hardware de clase A100/H100 o un clúster multi-GPU; un batch de ese tamaño no cabe en una GPU de consumo.
- Cabe en GPU de consumo: sí, en bf16 y con contexto de 4 K en tarjetas de 8-12 GB, siempre que se use el paquete kotodama para construir el grafo.
- Opciones de despliegue: no hay soporte estándar en vLLM, TGI, llama.cpp u Ollama, ya que la arquitectura (bucle de capas y residuales de atención entre bloques) requiere el paquete kotodama (`LuxiaBaseModel`). El flujo correcto es cargar `config.json`, restaurar alias desde `aliases.json` y ejecutar en PyTorch.
- Latencia y throughput: no disponibles. Como referencia estructural, 72 capas efectivas a anchura 1536 implican más cómputo por token del que sugiere el recuento de 1,42 B de parámetros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| Kotodama moonshot 1B (seed 7) | 1,42 B (52 capas únicas, 72 efectivas) | 4096 | Apache 2.0 | Pesos bf16 + checkpoints resumibles; requiere código propio | Trayectoria de preentrenamiento, sin modelo final ni evaluación |
| Qwen2.5-1.5B | 1,54 B | 32 768 | Apache 2.0 | Pesos en safetensors/GGUF, integrado en vLLM, llama.cpp y Ollama | Modelo base con variantes instruct y benchmarks publicados |
| SmolLM2-1.7B | 1,7 B | 8192 | Apache 2.0 | Pesos en safetensors/GGUF, soporte amplio de herramientas | Modelo base e instruct con evaluación publicada |
| Llama 3.2 1B | 1,24 B | 128 000 | Licencia comunitaria Llama 3.2 | Pesos en safetensors, ecosistema amplio | Modelo instruct con evaluación publicada |

Nota: los datos de los modelos comparativos provienen de sus fichas públicas y no se han verificado en esta ficha; los de kotodama proceden exclusivamente de la model card del repositorio. La comparación es de tamaño, no de rendimiento: no existen métricas de kotodama que permitan contrastar calidad.

## Limitaciones y advertencias

- No es un modelo final: el repositorio contiene solo checkpoints de la trayectoria de preentrenamiento, sin *cooldown* completado, sin ajuste por instrucciones y sin evaluación.
- No hay datos de benchmarks, por lo que no puede afirmarse nada sobre su calidad relativa frente a otros modelos de 1-2 B.
- Idiomas: entrenado y etiquetado únicamente en inglés; el rendimiento en castellano no está documentado y previsiblemente será pobre.
- Contexto limitado a 4096 tokens, muy por debajo de los 8 K-128 K de los modelos comparables de su clase.
- Riesgo de alucinación y de generar contenido factualmente incorrecto propio de un modelo base sin alineamiento; no se han aplicado RLHF ni DPO según la información disponible.
- Sesgos: la model card no documenta evaluación de sesgos; la mezcla de datos incluye texto web, patentes y textos legales, fuentes con sesgos conocidos, y el dataset no es público ni auditable.
- Carga no trivial: es imprescindible restaurar los alias de las capas del bucle desde `aliases.json` antes de cargar los pesos; omitir este paso produce un estado incompleto.
- Sin soporte en herramientas estándar: no hay conversión a GGUF ni integración en vLLM, TGI, llama.cpp u Ollama, lo que descarta su uso en pipelines de producción convencionales.
- Licencia Apache 2.0: permite uso comercial, pero al no existir modelo final ni evaluación, cualquier uso en producción sería una decisión de ingeniería sin garantías de calidad.
- Las ramas de *cooldown* se publican por separado y puede que no estén disponibles en el momento de consultar el repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LuxiaSL/kotodama-moonshot-1b-s7
- Binding Atlas (progresión de cinco fases citada en la model card): https://aetherawi.red/kotodama/binding-atlas.html
- Paper, blog o repositorio del paquete kotodama: no disponible en la información proporcionada.
- Demos o espacios de prueba: no disponible.
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos correspondían a páginas de soporte del navegador Microsoft Edge, sin relación con el modelo.
