# mradermacher/Diogenes-9B-v1-i1-GGUF

## Resumen

Diogenes-9B-v1-i1-GGUF es la colección de cuantizaciones GGUF, generadas con imatrix, del modelo Diogenes-9B-v1 desarrollado por TendieLabs. El repositorio lo mantiene mradermacher, un cuantizador de referencia en la comunidad de llama.cpp, y su propósito es hacer desplegable en hardware de consumo un modelo de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) que de otro modo requeriría pesos BF16 de unos 18 GB. El modelo base se apoya en la arquitectura Qwen 3.5, según las etiquetas de la model card, y se distribuye como un merge con adaptadores LoRA entrenados mediante supervisión (SFT) sobre el dataset NousResearch/arete-data-pairs.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de investigación orientado a la transferencia de comportamiento (behavior transfer) y al ajuste conversacional en inglés, con etiquetas que mencionan MTP (multi-token prediction) y un origen experimental. Por otro, ejemplifica el flujo habitual de la comunidad: un modelo base publicado por un laboratorio pequeño se cuantiza en más de veinte variantes (desde Q2_K de 4,0 GB hasta Q6_K de 7,7 GB) para que pueda ejecutarse en GPUs de consumo, CPUs con RAM suficiente o incluso portátiles con 8-16 GB de memoria unificada.

Conviene subrayar que la información pública disponible es escasa: no hay model card detallada del modelo base en los datos proporcionados, no se declaran benchmarks, no se especifica licencia y el idioma declarado es únicamente inglés. Esta ficha refleja fielmente esa limitación y marca como "no disponible" todo aquello que no puede verificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen 3.5 (según etiquetas de la model card); detalles de capas y atención no disponibles |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; además hay cuantizaciones estáticas en mradermacher/Diogenes-9B-v1-GGUF |
| Idiomas soportados | Inglés (declarado en la model card); otros idiomas no disponibles |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye presumiblemente en safetensors/BF16, aunque no se confirma en los datos aportados |

## Arquitectura y entrenamiento

El modelo base TendieLabs/Diogenes-9B-v1 se presenta como un merge de un modelo Qwen 3.5 con adaptadores LoRA, según las etiquetas `merged`, `lora`, `supervised-fine-tuning` y `behavior-transfer`. El entrenamiento supervisado se realizó sobre el dataset NousResearch/arete-data-pairs, un corpus de pares de conversación orientado a instrucciones y comportamiento conversacional. La etiqueta `mtp` sugiere el uso de multi-token prediction, una técnica de entrenamiento que predice varios tokens futuros por paso para mejorar la eficiencia de muestreo, aunque no se detalla su implementación ni el número de tokens de entrenamiento.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset, la existencia de fases de RLHF o DPO, ni innovaciones arquitectónicas específicas más allá de la base Qwen 3.5. Tampoco se documenta la longitud de contexto nativa ni si se aplicó algún tipo de extensión de contexto. La cuantización i1 con imatrix de mradermacher aplica una matriz de importancia calculada sobre un corpus de calibración para preservar mejor los pesos relevantes en cuantizaciones agresivas (Q2, Q3), lo que en la práctica mejora la perplejidad frente a cuantizaciones estáticas del mismo tamaño.

## Capacidades

- Generación de texto conversacional en inglés, con foco en instrucciones y diálogo multi-turno.
- Razonamiento de propósito general heredado de la base Qwen 3.5, sin benchmarks publicados que lo confirmen.
- Capacidad de código y matemáticas: no confirmada explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card; otros idiomas no declarados.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Etiqueta `endpoints_compatible` en Hugging Face, lo que indica compatibilidad con la API de inferencia de Hugging Face.

## Casos de uso

- Asistente conversacional autoalojado en inglés: el modelo puede desplegarse con llama.cpp u Ollama en una estación de trabajo con 8-16 GB de VRAM usando i1-Q4_K_M (5,9 GB), ofreciendo un asistente privado sin dependencia de APIs externas.
- Prototipado de investigación en transferencia de comportamiento: al ser un merge LoRA sobre Qwen 3.5 entrenado con SFT, sirve para estudiar cómo se transfieren estilos y comportamientos desde adaptadores al modelo fusionado, comparando las distintas cuantizaciones i1 frente a las estáticas.
- Evaluación de calidad de cuantizaciones: el repositorio incluye el fichero imatrix y más de veinte variantes, lo que permite medir la degradación de perplejidad y calidad conversacional entre Q2_K y Q6_K en un mismo modelo.
- Generación de texto en pipelines de CI para pruebas de regresión: al ser GGUF y ejecutable en CPU, puede integrarse en tests automatizados que verifiquen respuestas del modelo sin requerir GPU dedicada.
- Despliegue en hardware con memoria unificada: en equipos Apple Silicon con 16 GB, la variante i1-Q4_K_S (5,6 GB) deja margen suficiente para contexto y sistema, permitiendo uso interactivo local.
- Fine-tuning posterior o destilación: las cuantizaciones de mayor precisión (Q6_K, 7,7 GB) o los pesos BF16 del modelo base permiten usar Diogenes como profesor en destilación o como punto de partida para nuevos adaptadores LoRA en inglés.
- Chat de bajo consumo en entornos educativos: con i1-IQ3_M (4,6 GB) puede ejecutarse en GPUs de 6-8 GB para demostraciones de inferencia local en cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y KV cache):
  - i1-Q2_K: ~4,0 GB de pesos; ~5-6 GB totales con contexto moderado.
  - i1-IQ3_M / i1-Q3_K_M: ~4,6-4,8 GB de pesos; ~6-7 GB totales.
  - i1-Q4_K_M: ~5,9 GB de pesos; ~7-8 GB totales.
  - i1-Q5_K_M: ~6,7 GB de pesos; ~8-9 GB totales.
  - i1-Q6_K: ~7,7 GB de pesos; ~9-10 GB totales.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para las variantes Q5/Q6 con contexto largo; A100/H100 no son necesarias para un modelo de 9 B, pero permiten mayor throughput por batch.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB o RTX 4060 8 GB con cuantizaciones Q3/Q4; también en Apple Silicon con 16 GB de memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; el modelo base es compatible con transformers (etiqueta `transformers`).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Diogenes-9B-v1 (este) | ~9,2 B | No disponible | No disponible | GGUF (i1 y estáticas) | Merge LoRA sobre Qwen 3.5, SFT con arete-data-pairs, solo inglés |
| Qwen 3.5 (base) | Variable según variante | No disponible | No disponible en esta ficha | Safetensors, GGUF en la comunidad | Modelo original del que deriva Diogenes; referencia arquitectónica |
| Llama 3.1 8B | ~8 B | 128 K tokens (según documentación pública de Meta) | Llama 3.1 Community License | Safetensors, GGUF | Alternativa de tamaño similar con ecosistema amplio y benchmarks publicados |
| Mistral 7B / Ministral 8B | ~7-8 B | 32 K / variable | Apache 2.0 (Mistral 7B) | Safetensors, GGUF | Alternativa con licencia permisiva y buen soporte de cuantizaciones |

La comparación es aproximada: no hay benchmarks de Diogenes-9B-v1 que permitan situarlo frente a estas alternativas en MMLU, HumanEval o GSM8K. La principal ventaja de Diogenes es su naturaleza experimental (transferencia de comportamiento, MTP) y la disponibilidad de cuantizaciones i1 con imatrix; su principal desventaja es la falta de licencia declarada y de documentación sobre contexto y rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset de pares conversacionales en inglés, es probable que herede sesgos del corpus y de la base Qwen 3.5, pero no se han publicado análisis.
- Riesgo de alucinación: no cuantificado; como modelo de 9 B sin benchmarks públicos, se recomienda validación humana en usos sensibles.
- Limitaciones de contexto e idioma: solo se declara inglés; la longitud de contexto no está disponible, lo que impide planificar aplicaciones con documentos largos.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada, por lo que no puede confirmarse el uso comercial. Es imprescindible consultar el repositorio del modelo base (TendieLabs/Diogenes-9B-v1) antes de desplegarlo en producción.
- Caveat de cuantización: las variantes Q2_K e IQ2 pueden degradar notablemente la calidad; mradermacher recomienda IQ3_XXS o IQ3_S frente a Q2_K, y Q4_K_M como opción equilibrada.
- Modelo de investigación: las etiquetas `research` y `behavior-transfer` sugieren que no está optimizado para producción ni sometido a evaluaciones de seguridad.
- Fecha de creación futura (2026-11-13) en los metadatos de Hugging Face: conviene verificar la vigencia y el estado del repositorio antes de depender de él.
- Sin garantías de soporte: el mantenedor es un cuantizador independiente, no el autor del modelo; los problemas del modelo base deben reportarse a TendieLabs.

## Enlaces

- Repositorio GGUF i1: https://huggingface.co/mradermacher/Diogenes-9B-v1-i1-GGUF
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Diogenes-9B-v1-GGUF
- Modelo base: https://huggingface.co/TendieLabs/Diogenes-9B-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Página de descargas del cuantizador: https://hf.tst.eu/model#Diogenes-9B-v1-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
