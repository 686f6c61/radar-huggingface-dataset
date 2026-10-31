# mradermacher/qwen3.5-9b-triple-loop-fase2-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF estáticas del modelo **qwen3.5-9b-triple-loop-fase2**, creado por el usuario Lordnyx y cuantizado por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un fine-tuning de 9B parámetros (8.953.803.264 exactamente, según los safetensors) basado en la familia Qwen3.5, entrenado con aprendizaje por refuerzo (GRPO, enfoque tipo R1-Zero) y con etiquetas que sugieren el uso de capas recurrentes y una técnica denominada "triple-loop" o "loopsplit".

La relevancia de esta ficha reside en que el repositorio original está publicado en formato transformers/safetensors, mientras que esta versión GGUF permite ejecutar el modelo localmente en CPU y GPU de consumo mediante llama.cpp, Ollama u otros runtimes compatibles. Los tags del modelo base indican soporte de tool calling y capacidades agénticas, lo que lo posiciona como un modelo ligero orientado a razonamiento y uso en agentes.

Cabe destacar que se trata de un modelo comunitario con poca documentación pública: la model card del modelo base no incluye detalles de entrenamiento ni benchmarks, por lo que varias especificaciones se marcan como no disponibles. El repositorio de cuantizaciones registra 786 descargas y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5) con tags de capas recurrentes ("recurrent-layers", "loopsplit", "triple-loop"); detalle exacto no disponible |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE; presumiblemente densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (ademas de imatrix/weighted quants en un repo aparte) |
| Idiomas soportados | ingles (en), portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo base esta en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base, Lordnyx/qwen3.5-9b-triple-loop-fase2, es un fine-tuning de aproximadamente 9B parámetros sobre la familia Qwen3.5. Los metadatos del repositorio incluyen los tags "loopsplit", "triple-loop" y "recurrent-layers", lo que sugiere una arquitectura híbrida o modificada que incorpora mecanismos de recurrencia en las capas, aunque la documentación pública no detalla el diseño exacto. No es posible confirmar si se trata de un transformer puro o de una variante híbrida transformer-recurrent sin más información del autor.

Según los tags del modelo base, el entrenamiento de esta "fase 2" se realizó mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization), siguiendo un enfoque tipo R1-Zero (entrenamiento de razonamiento con recompensas verificables, sin SFT previo con datos de razonamiento). Los tags "tool-calling" y "agentic" indican que el modelo fue entrenado o ajustado para el uso de herramientas y flujos agénticos. No hay datos disponibles sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de decodificación empleadas.

## Capacidades

- Generación de texto conversacional (el repo está etiquetado como "conversational").
- Razonamiento entrenado con GRPO en estilo R1-Zero, orientado a tareas con recompensa verificable (matemáticas, lógica; rendimiento concreto no disponible).
- Tool calling / function calling, según los tags del modelo base.
- Capacidades agénticas y multi-step reasoning, indicadas por el tag "agentic".
- Soporte bilingüe: inglés y portugués.
- Ejecución local eficiente gracias a las 12 cuantizaciones GGUF disponibles, desde Q2_K (3,9 GB) hasta f16 (18 GB).

## Casos de uso

- **Agentes locales con tool calling:** el modelo está etiquetado para uso agéntico y function calling, por lo que puede integrarse en frameworks como LangChain o llamadas a herramientas vía llama.cpp para orquestar APIs y funciones en local, sin depender de servicios en la nube.
- **Razonamiento paso a paso en hardware de consumo:** con la cuantización Q4_K_M (5,7 GB) cabe en GPUs de 8 GB de VRAM, lo que lo hace adecuado para tareas de razonamiento matemático o lógico en estaciones de trabajo personales.
- **Asistentes conversacionales en portugues e inglés:** su entrenamiento bilingüe (en, pt) lo hace útil para chatbots y asistentes dirigidos al mercado brasileño o portugués que deban ejecutarse on-premise.
- **Prototipado de modelos recurrentes/híbridos:** investigadores interesados en arquitecturas con capas recurrentes ("triple-loop", "loopsplit") pueden usar los pesos para experimentación y ablation studies.
- **Inferencia en CPU o dispositivos con recursos limitados:** las cuantizaciones Q2_K y Q3_K_S (3,9-4,4 GB) permiten despliegue en portátiles sin GPU dedicada mediante llama.cpp u Ollama.
- **Fine-tuning posterior:** al ser un modelo de 9B con licencia Apache 2.0 en safetensors, puede servir como punto de partida para fine-tunings adicionales (LoRA/QLoRA) en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra métrica, por lo que no es posible comparar su rendimiento con otros modelos de forma fundamentada.

## Requisitos de hardware

- **VRAM estimada para inferencia (GGUF):** aproximadamente el tamaño del fichero de cuantización más la KV cache: Q2_K ~4 GB, Q4_K_M ~6 GB, Q6_K ~8 GB, Q8_0 ~10 GB, f16 ~18 GB (más contexto).
- **GPU recomendadas:** con Q4_K_M/Q5_K_M basta una RTX 3060 de 12 GB o una RTX 4060 Ti 16 GB; para Q8_0 o f16 con contexto largo, una RTX 4090 (24 GB) es cómoda. No se requieren A100/H100 para inferencia en este tamaño.
- **Consumer GPUs:** sí, perfectamente; cualquier GPU con 8 GB de VRAM ejecuta las cuantizaciones Q3/Q4, y con descarga parcial de capas a CPU funciona incluso con 6 GB.
- **CPU:** viable con llama.cpp; con Q4_K_S (5,5 GB) en un portátil con 16 GB de RAM el rendimiento será bajo pero usable (estimación, no dato publicado).
- **Opciones de despliegue:** llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con vLLM o TGI, aunque la compatibilidad de las capas recurrentes personalizadas con estos runtimes no está confirmada.
- **Latencia y throughput:** no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| qwen3.5-9b-triple-loop-fase2 (este) | ~9B | GGUF (12 quants) | Apache 2.0 | GRPO/R1-Zero, capas recurrentes, tool calling; sin benchmarks publicados |
| Qwen3 8B (base oficial de la familia) | ~8B | Safetensors + GGUF comunitario | Apache 2.0 | Benchmarks publicados por Qwen, ecosistema maduro |
| Llama 3.1 8B | ~8B | Safetensors + GGUF comunitario | Llama Community License | Amplio soporte de runtimes, contexto 128K, licencia mas restrictiva que Apache 2.0 |

La comparativa se basa en la categoría de tamaño (~8-9B) y en el ecosistema Qwen; el modelo de Lordnyx se distingue por su entrenamiento con GRPO y sus capas recurrentes experimentales, aunque carece de la documentación y validación de los modelos oficiales.

## Limitaciones y advertencias

- **Documentación escasa:** la model card del modelo base no detalla arquitectura, datos de entrenamiento, longitud de contexto ni plantilla de chat, lo que dificulta su integración correcta en producción.
- **Riesgo de alucinación:** al tratarse de un fine-tuning comunitario entrenado con RL sin datos de evaluación publicados, no hay garantías de fiabilidad factual; se recomienda validación humana en usos sensibles.
- **Idiomas:** entrenado oficialmente en inglés y portugués; el rendimiento en castellano no está documentado y puede ser inferior al de los modelos base de Qwen.
- **Arquitectura experimental:** los tags de capas recurrentes ("triple-loop", "loopsplit") sugieren modificaciones no estándar que pueden no ser compatibles con todos los runtimes o versiones de llama.cpp; verifica el soporte antes de desplegar.
- **Licencia:** Apache 2.0, permisiva para uso comercial; sin restricciones conocidas más allá de las estándar.
- **Procedencia:** el cuantizador (mradermacher) solo proporciona las cuantizaciones y no ha evaluado la calidad del modelo base; cualquier defecto del modelo original se hereda en los GGUF.
- **Sesgos:** no hay auditorías de sesgo publicadas para este modelo.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/qwen3.5-9b-triple-loop-fase2-GGUF
- Modelo base: https://huggingface.co/Lordnyx/qwen3.5-9b-triple-loop-fase2
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/qwen3.5-9b-triple-loop-fase2-i1-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#qwen3.5-9b-triple-loop-fase2-GGUF
- Licencia referenciada (Qwen): https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- FAQ de solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
