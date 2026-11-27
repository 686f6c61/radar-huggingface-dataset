# Ethan33X/Tractus-9B

## Resumen

Tractus-9B es un modelo de decisión de doble modo (dual-mode) desarrollado por el usuario Ethan33X y publicado en Hugging Face. Se trata de un post-entrenamiento sobre la base `Qwen/Qwen3.5-9B-Base`, un modelo fundacional visión-lenguaje de la familia Qwen3.5. Su objetivo no es la generación de texto libre, sino la evaluación calibrada de opciones candidatas: dado un estado (texto, JSON estructurado, tablas o contexto multimodal) y un conjunto de 2 a 255 opciones, el modelo devuelve probabilidades calibradas sobre cada opción. Combina un modo «System 1» de una sola pasada que no genera ningún token (0 tokens decodificados) con un modo «System 2» de deliberación conjunta que reutiliza la caché KV del prefill.

El modelo está pensado para tareas de enrutamiento, clasificación, calibración y toma de decisiones en entornos de producción donde la latencia importa. Según el autor, resuelve el 71,0 % de las consultas de JevBench 231 sin generar tokens, con una escalada del 29,0 % a System 2 y un 38,1 % menos de tokens que una cadena de pensamiento sin restricciones. El backbone híbrido de Qwen3.5 (Gated DeltaNet + Gated Attention en proporción 3:1) le permite manejar un contexto nativo de 262.144 tokens y reducir el consumo de caché KV en BF16 un factor de 4 a 256K.

Con 8.953.803.264 parámetros reales en safetensors (el autor declara 9,24B totales y 8,12B de backbone sin embeddings), Tractus-9B es relevante ahora porque propone un paradigma alternativo al chat generativo: decisiones de latencia casi nula (mediana de 0,69 s en BF16 frente a 26,00 s de Qwen3.5-9B en modo Think, según la model card) con calibración medida y sin fallos de parseo en el conjunto comercial emparejado de 831 ítems.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5: 32 capas (24 Gated DeltaNet + 8 Gated Attention), visión-lenguaje |
| Parametros totales | 8.953.803.264 (safetensors); el autor declara 9,24B totales / 8,12B de backbone sin embeddings |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | BF16 (18,5 GB) e INT4 (6,1 GB) documentados; no se detallan otros formatos |
| Idiomas soportados | Inglés (en) |
| Licencia | Modified MIT (license: other, license_name: modified-mit), con aviso Apache-2.0 de Qwen3.5 |
| Formato de pesos | safetensors (librería transformers) |
| Dimension hidden / FFN | 4.096 / 12.288 |
| Tamano del vocabulario | 248.320 |
| Tamano del repositorio | 17,9 GB |
| Pipeline | decision-model |

## Arquitectura y entrenamiento

Tractus-9B se construye sobre el backbone híbrido de Qwen3.5, que combina 24 capas de Gated DeltaNet con 8 capas de Gated Attention (proporción 3:1) y una dimensión oculta de 4.096 con FFN de 12.288. El modelo es multimodal (visión-lenguaje) y comparte la caché KV en su lugar (in-place) entre los dos modos de decisión. La innovación central es la separación entre System 1 y System 2: el primero lee el estado de entrada y las opciones candidatas en una sola pasada de prefill, sin generar tokens, y puntúa las claves en la posición terminal mediante un mecanismo denominado «Thermostasis» (desplazamiento binario previo opcional, softcapping de logits con tanh y C = 30,0, centrado de suma cero y un termostato analítico 2D «e-Thermostat» sin escalares de temperatura ajustados por validación). El segundo modo, System 2, activa una deliberación conjunta con compuerta (joint-gated) que reutiliza el 100 % del prefijo KV del prefill, evitando el re-prefill al escalar.

La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. Sí se documentan dos priors binarios estáticos opcionales (+3,2 para alucinación en RAGTruth y −0,75 para phishing en PhishNChips) que solo se activan en Decision Index 0.3 y valen 0 en los 9 benchmarks primarios y en el conjunto OOD de 19.887 ítems. El autor menciona que el modelo es un post-entrenamiento sobre la base, pero no especifica si se emplearon RLHF, DPO u otras técnicas de alineamiento. La reducción de la proyección de lectura (99,9 % más pequeña al omitir la cabeza de vocabulario de 248.320 vías) es una de las claves de la latencia cero en System 1.

## Capacidades

- Toma de decisiones de una sola pasada: puntúa entre 2 y 255 opciones candidatas con 0 tokens generados, devolviendo probabilidades calibradas.
- Deliberación de doble modo: escalada selectiva a System 2 con razonamiento conjunto y reutilización total de la caché KV del prefill.
- Calibración de confianza: métricas de ECE (Expected Calibration Error) reportadas por el autor (2,80 % bruto y 2,69 % OOF en Pooled para la variante GO).
- Entrada multimodal: soporta texto, JSON estructurado, tablas, layouts de interfaz y estados espaciales gracias al backbone visión-lenguaje de Qwen3.5.
- Enrutamiento y clasificación: orientado a routing, classification y calibration según los tags del modelo.
- Contexto largo: ventana nativa de 262.144 tokens con reducción de caché KV de 4× en BF16.
- Capacidades de agente: los demos incluyen navegación web, enrutamiento multi-intención y dinámica espacial con 22 agentes bajo SLA de 300 ms.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.
- Idioma: únicamente inglés.

## Casos de uso

- Enrutamiento multi-intención en banca y servicios: el modelo recibe el estado de la conversación y un conjunto de intenciones candidatas, y devuelve la probabilidad de cada una en una sola pasada sin generar tokens, lo que permite decidir en milisegundos y escalar a System 2 solo en casos ambiguos.
- Navegación web automatizada: con el demo de Web Navigation, el modelo puntúa acciones candidatas sobre el DOM o layouts de interfaz, aprovechando la entrada multimodal y el contexto de 256K para páginas largas.
- Clasificación calibrada en producción: para tareas donde no basta la etiqueta sino la confianza (moderación, triaje, detección de phishing), el modelo ofrece probabilidades calibradas con ECE bajo y sin fallos de parseo en el conjunto comercial medido.
- Detección de alucinaciones en RAG: el prior binario opcional (+3,2 en RAGTruth) permite integrar el modelo como verificador de respuestas generadas por otro sistema, comparando la respuesta candidata contra el contexto recuperado.
- Centinela de reuniones full-duplex: el demo Full-Duplex Meeting Sentinel usa el modelo para decidir en tiempo real si intervenir o no, aprovechando la latencia de 0,69 s en BF16 y la reutilización de caché KV.
- Simulación de dinámicas espaciales multi-agente: el demo JevBall con 22 agentes bajo SLA de 300 ms ilustra el uso del modelo para decisiones rápidas y repetidas en entornos simulados.
- Verificación de acciones en pipelines de CI/CD: dado un estado del repositorio y opciones de acción (aprobar, rechazar, escalar), el modelo puede integrarse como gate de decisión con umbrales calibrados.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| Decision Index 0.3 | Balanced Skill | 46,03 |
| Decision Index 0.3 | Balanced Raw Accuracy | 59,32 % |
| JevBench 231 (dual-mode, 8K) | Overall Accuracy | 90,91 % (210/231) |
| JevBench 231 (single-pass Tractus-decision) | Accuracy | 79,22 % |
| JevBench 231 (Tractus-9B GO) | Accuracy | 92,21 % |
| JevBench 231 (desglose dual-mode) | Easy / Standard / Hard | 48/48, 72/72, 90/111 |
| Pooled 9-Task | Accuracy | 76,18 % (+5,65 pp sobre single-pass) |
| Pooled (Tractus-9B GO) | Pooled ECE bruto / OOF | 2,80 % / 2,69 % |
| When2Call (Tractus-9B) | Accuracy | 84,00 % |
| Mind2Web (zero-token Tractus-decision-9B) | Accuracy | 88,00 % |
| Pooled (zero-token Tractus-decision-9B) | Pooled ECE bruto | 2,45 % |
| Suite comercial emparejada (831 ítems, 256K) | Consultas resueltas en 0 tokens | 479/831 |
| Latencia BF16 batch=1 (mediana secuencial) | Tractus-9B vs Qwen3.5-9B Think | 0,69 s vs 26,00 s |
| Latencia zero-token (single-template prefill) | Tractus-decision-9B | 47,4 ms (0,14 s con 3 plantillas) |

## Requisitos de hardware

- VRAM estimada: 18,5 GB en BF16 y 6,1 GB en INT4, según la model card.
- GPU recomendadas: el autor reporta ejecución en CUDA/PyTorch con BF16; para 18,5 GB se requiere una GPU con al menos 24 GB (RTX 4090, A100 40/80 GB, H100). En INT4 (6,1 GB) cabe en GPUs consumer de 8-12 GB.
- Cabe en consumer GPU: sí, en INT4 en RTX 3060/4060 de 8 GB o superiores; en BF16 requiere RTX 4090 o superior.
- Opciones de despliegue: transformers (librería declarada); el autor menciona MLX INT4 en Apple Silicon Metal GPU y CUDA/PyTorch BF16. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: mediana secuencial de 0,69 s en BF16 batch=1 en el conjunto comercial de 831 ítems; 47,4 ms en prefill de plantilla única para la variante zero-token; 7,22 s de mediana secuencial para la variante GO. Reducción de caché KV de 34,36 GB a 8,59 GB a 256K en BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tractus-9B | 8,95B (safetensors) | 262.144 | Decisión dual-mode (System 1 + System 2) | Modified MIT | Hugging Face |
| Qwen3.5-9B-Base | 9B (declarado) | 262.144 | Generación visión-lenguaje | Apache-2.0 (según aviso del autor) | Hugging Face |
| Tractus-0.8B / 2B / 4B | 0,82B / 1,88B / no disponible | 262.144 | Misma familia Tractus a menor escala | Modified MIT | Hugging Face |

La comparación directa con modelos de decisión de otros autores no está disponible en la información proporcionada. El autor compara su modelo con Qwen3.5-9B en modo Think (26,00 s de mediana y 44 fallos de parseo frente a 0,69 s y 0 fallos en Tractus-9B), pero se trata de una comparación declarada por el propio autor y no verificada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; el entrenamiento se limita al inglés, lo que puede introducir sesgos culturales y lingüísticos.
- Riesgo de alucinación: el modelo incorpora un prior binario opcional para detección de alucinación en RAGTruth (+3,2), lo que sugiere que el autor reconoce este riesgo; no obstante, no se ofrecen garantías en producción.
- Limitaciones de idioma: solo inglés (en); no se declara soporte multilingüe.
- Restricciones de licencia: licencia Modified MIT con condiciones comerciales y de MaaS propias (Tractus Commercial/MaaS Tiers) y aviso Apache-2.0 de Qwen3.5; es necesario revisar el archivo LICENSE antes de uso comercial.
- Benchmarks no verificados: todos los resultados del model-index tienen `verified: false`; son datos declarados por el autor.
- Adopción muy baja: 11 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.
- Documentación incompleta: no se detallan tokens de entrenamiento, composición del dataset ni técnicas de alineamiento (RLHF/DPO).
- Despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, lo que puede complicar la integración en infraestructuras estándar.
- El pipeline declarado es `decision-model`, no `text-generation`, por lo que las herramientas y expectativas de uso deben adaptarse a ese paradigma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ethan33X/Tractus-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Dataset Decision Index 0.3: https://huggingface.co/datasets/Ethan33X/tractus-decision-index-0.3
- Tractus-decision-0.8B: https://huggingface.co/Ethan33X/Tractus-decision-0.8B
- Tractus-0.8B: https://huggingface.co/Ethan33X/Tractus-0.8B
- Tractus-decision-2B: https://huggingface.co/Ethan33X/Tractus-decision-2B
- Tractus-2B: https://huggingface.co/Ethan33X/Tractus-2B
- Tractus-decision-4B: https://huggingface.co/Ethan33X/Tractus-decision-4B
- Tractus-4B: https://huggingface.co/Ethan33X/Tractus-4B
- Licencia: https://huggingface.co/Ethan33X/Tractus-9B/blob/main/LICENSE
