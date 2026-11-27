# Ethan33X/Tractus-decision-0.8B

## Resumen

Tractus-decision-0.8B es un modelo de decisión de un solo paso (single-pass) desarrollado por Ethan33X, derivado mediante post-entrenamiento del modelo base Qwen/Qwen3.5-0.8B-Base. Su función es recibir un estado de entrada (texto, JSON estructurado, tablas o contexto multimodal) junto con un conjunto de opciones candidatas y devolver una distribución de probabilidad calibrada sobre dichas opciones en un único forward pass, sin generar tokens. Esto elimina la latencia de decodificación autoregresiva típica de los modelos generativos.

El modelo cuenta con 1.006.672.704 parámetros según los pesos en safetensors (0,82B declarados en la model card, 0,58B sin embeddings) y se apoya en la arquitectura híbrida Qwen3.5, que combina capas Gated DeltaNet y Gated Attention en proporción 3:1, con una ventana de contexto nativa de 262.144 tokens. Está pensado para escenarios de enrutamiento, clasificación y toma de decisiones de baja latencia, donde la respuesta debe producirse en milisegundos y no requiere texto generado.

Su relevancia actual radica en la propuesta de "System 1" (decisión rápida de un solo paso) frente a los modelos generativos convencionales, con una proyección de lectura un 99,9% menor al evitar la cabeza de vocabulario de 248.320 entradas. Incluye además un mecanismo propietario denominado Thermostasis para la calibración de logits y demos interactivas sobre Apple Silicon (MLX INT4) y CUDA/PyTorch (BF16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (18 capas Gated DeltaNet + 6 capas Gated Attention, 24 capas totales) |
| Parametros totales | 1.006.672.704 (1,0B en safetensors; 0,82B declarados, 0,58B sin embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | BF16 (1,8 GB) e INT4 (909 MB) documentados; otras no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | Modified MIT (con aviso Apache-2.0 de Qwen3.5) |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se construye sobre el backbone híbrido de Qwen3.5, que intercala 18 capas de Gated DeltaNet con 6 capas de Gated Attention (proporción 3:1) y emplea una dimensión oculta de 1.024 y dimensión FFN de 3.584. La arquitectura es de tipo vision-language, lo que permite procesar entradas multimodales junto con texto y JSON estructurado. La ventana de contexto alcanza los 262.144 tokens, y el autor reporta una reducción de 4× en la memoria de la caché KV en BF16 a 256K (de 34,36 GB a 8,59 GB), además de reutilización del 100% del prefijo KV en prefill al escalar a un modo "System 2".

El post-entrenamiento convierte el modelo base generativo en un clasificador de opciones: en lugar de proyectar sobre la cabeza de vocabulario (248.320 entradas), puntúa las claves candidatas en la posición terminal mediante el mecanismo Thermostasis, que aplica opcionalmente un desplazamiento de prior binario, softcapping de logits con tanh (C = 30,0), centrado de suma cero y un termostato analítico 2D sin escalares de temperatura ajustados por validación. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Toma de decisiones de un solo paso: devuelve probabilidades calibradas sobre entre 2 y 255 opciones candidatas sin generar tokens.
- Clasificación y enrutamiento: pensado para enrutamiento de intenciones, clasificación de consultas y selección de herramientas.
- Procesamiento de estados estructurados: acepta JSON, tablas y ledgers estructurados como entrada.
- Contexto multimodal: hereda la capacidad vision-language del backbone Qwen3.5 (diseño de UI, estados espaciales).
- Contexto largo: ventana de 262.144 tokens con caché KV reducida.
- Calibración: mecanismo Thermostasis con corrección de sesgos (prior de alucinación en RAGTruth, prior anti-phishing en PhishNChips).
- Escalado a System 2: reutilización del prefijo KV para pasar a un modo de razonamiento generativo sin re-prefill.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: dado el turno del usuario y un conjunto de intenciones candidatas, el modelo devuelve la probabilidad de cada una en un solo forward pass, lo que permite seleccionar la ruta en milisegundos sin coste de decodificación.
- Clasificación de consultas en atención al cliente: con contexto de hasta 256K tokens, puede ingerir historiales largos y decidir la categoría o el departamento de destino de un ticket.
- Navegación web automatizada: el demo de Web Navigation y el resultado de 65,00% en Mind2Web indican uso para seleccionar la siguiente acción de UI entre opciones candidatas a partir de capturas y estado de la página.
- Enrutamiento multi-intención en banca y servicios: el demo de Multi-Intent Banking & Service Router muestra la selección de servicios candidatos ante peticiones compuestas.
- Moderación y detección de phishing: el prior estático anti-phishing (-0,75 en PhishNChips) sugiere uso en clasificación de URLs o mensajes sospechosos como decisión binaria.
- Mitigación de alucinación en RAG: el prior de +3,2 en RAGTruth permite usar el modelo como verificador de fidelidad de respuestas generadas frente a fuentes.
- Agentes espaciales de baja latencia: el demo JevBall (22 agentes bajo SLA de 300 ms) apunta a dinámicas multiagente donde cada decisión debe resolverse en un único paso.
- Routing en pipelines de CI/CD o sistemas de tool calling: selección de la herramienta o función a invocar a partir del estado y las opciones disponibles.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados, `verified: false` en el model-index):

| Benchmark | Metrica | Valor |
|---|---|---|
| Decision Index 0.3 | Balanced Skill | 18,07 |
| Decision Index 0.3 | Balanced Raw Accuracy | 37,66% |
| JevBench 231 | Overall Accuracy (Single-Pass Tractus-decision) | 72,73% (168/231) |

Resultados adicionales reportados en la model card sobre la Matched Commercial Suite (831 ítems, 256K, prefill de orden único):

| Benchmark | Metrica | Valor |
|---|---|---|
| JevBench | Accuracy | 73,59% |
| Mind2Web | Accuracy | 65,00% |
| Global-MMLU-Lite | Accuracy | 50,00% |
| Pooled ECE | Error de calibración (raw) | 2,39% |

No se han publicado en la información disponible comparaciones directas con modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 1,8 GB de pesos; la caché KV a 256K en BF16 se reduce a 8,59 GB según el autor.
- VRAM estimada en INT4: aproximadamente 909 MB de pesos.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM en BF16 para contextos moderados resulta suficiente. Para 256K de contexto conviene reservar 10-12 GB adicionales por la caché KV.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores para contextos cortos; en RTX 4090 con margen amplio para contextos largos.
- Opciones de despliegue: transformers (librería declarada); el autor menciona ejecución en Apple Silicon con MLX INT4 y en CUDA/PyTorch con BF16. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: el diseño de un solo paso con 0 tokens generados apunta a latencias de prefill; el demo JevBall opera bajo un SLA de 300 ms, pero no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tractus-decision-0.8B | 1,0B (0,82B declarados) | 262.144 | Decisión single-pass calibrada | Modified MIT | Hugging Face |
| Tractus-0.8B (mismo autor) | 0,82B | 262.144 | Dual-mode System 1 + System 2 | Modified MIT | Hugging Face |
| Qwen3.5-0.8B-Base (modelo base) | 0,82B | 262.144 | Generación vision-language | Apache-2.0 | Hugging Face |
| Tractus-decision-2B (mismo autor) | 1,88B | 262.144 | Decisión single-pass calibrada | Modified MIT | Hugging Face |

No se dispone de modelos de terceros directamente comparables en la información proporcionada; las alternativas más cercanas son las variantes de la propia familia Tractus y el modelo base Qwen3.5.

## Limitaciones y advertencias

- Resultados de benchmarks declarados por el autor y marcados como no verificados (`verified: false`); deben tratarse con cautela.
- Balanced Skill de 18,07 en Decision Index 0.3 y precisión bruta de 37,66%, cifras modestas que limitan su uso en decisiones de alta exigencia.
- Modelo entrenado únicamente en inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación mitigado solo parcialmente mediante el prior estático en RAGTruth (+3,2), que se aplica únicamente en Decision Index 0.3.
- No es un modelo generativo en modo System 1: no produce texto, por lo que no sirve para tareas de generación directa salvo escalando a System 2.
- Licencia "Modified MIT" con términos comerciales y de MaaS propios de Tractus, además del aviso Apache-2.0 de Qwen3.5; es necesario revisar el archivo LICENSE antes de uso comercial.
- Comunidad muy reducida (9 descargas, 0 likes en el momento de la consulta), lo que implica escasa validación externa y soporte limitado.
- No se detalla la composición del dataset de entrenamiento ni si se aplicaron técnicas de alineación (RLHF/DPO), lo que dificulta evaluar sesgos.
- El mecanismo Thermostasis y los priors estáticos son propietarios y su comportamiento fuera de los benchmarks declarados no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ethan33X/Tractus-decision-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Variante dual-mode: https://huggingface.co/Ethan33X/Tractus-0.8B
- Variante 2B decisión: https://huggingface.co/Ethan33X/Tractus-decision-2B
- Variante 2B dual-mode: https://huggingface.co/Ethan33X/Tractus-2B
- Variante 4B decisión: https://huggingface.co/Ethan33X/Tractus-decision-4B
- Variante 4B dual-mode: https://huggingface.co/Ethan33X/Tractus-4B
- Variante 9B decisión: https://huggingface.co/Ethan33X/Tractus-decision-9B
- Variante 9B dual-mode: https://huggingface.co/Ethan33X/Tractus-9B
- Dataset Decision Index 0.3: https://huggingface.co/datasets/Ethan33X/tractus-decision-index-0.3
