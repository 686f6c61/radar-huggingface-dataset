# mzhaoshuai/zephyr-7b-alpha-conf-sft

## Resumen

`mzhaoshuai/zephyr-7b-alpha-conf-sft` es un modelo de generación de texto en inglés (heredado de Zephyr) afinado por Shuai Zhao y colaboradores como parte del framework de investigación RL2R (anteriormente RefAlign). Se trata de un checkpoint de Supervised Fine-Tuning (SFT) sobre `HuggingFaceH4/zephyr-7b-alpha`, entrenado específicamente con el subconjunto `conqord_step1_data` del dataset `shuchangtao/CONQORD_dataset` para experimentos de alineación de confianza (confidence alignment). No es un modelo de propósito general listo para producción, sino un artefacto intermedio de investigación que sirve como punto de partida del pipeline RL2R descrito en el paper arXiv:2504.09895.

El modelo hereda la arquitectura Mistral de 7 mil millones de parámetros con ventana de contexto de 32 768 tokens y licencia MIT. Su relevancia actual es metodológica: el paper propone usar referencias preexistentes o destiladas y métricas de similitud semántica ligeras (BERTScore) como fuente de recompensa para RL, evitando el coste de anotación de PRMs y de pares de preferencia binarios. Este checkpoint SFT es el paso previo necesario para instanciar esa alineación sobre Zephyr.

El repositorio es pequeño (0,3 GB), con pesos cuantizados a 8 bits mediante bitsandbytes, lo que lo hace ligero para experimentación, pero con muy poca tracción comunitaria (13 descargas, 0 likes) y sin datos publicados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral, heredada de Zephyr-7b-alpha) |
| Parametros totales | 7 mil millones (aproximado, según el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | 8-bit (bitsandbytes); otros formatos no disponibles |
| Idiomas soportados | no disponibles (el modelo base Zephyr está orientado al inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,3 GB, pesos cuantizados) |

## Arquitectura y entrenamiento

El modelo parte de `HuggingFaceH4/zephyr-7b-alpha`, un transformer decoder-only de 7B parámetros basado en Mistral, con atención de ventana deslizante y contexto de 32 768 tokens. Sobre esa base se aplica un SFT con PEFT 0.11.1 y Transformers 4.40.0, usando el dataset `shuchangtao/CONQORD_dataset` (concreto: `conqord_step1_data`) para tareas de alineación de confianza. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas posteriores de RLHF/DPO en este checkpoint.

La innovación relevante no está en este checkpoint en sí, sino en el framework RL2R que lo rodea: recompensas basadas en referencias mediante similitud semántica (BERTScore) en lugar de verificación binaria o reward models entrenados con pares de preferencia. El paper reporta que esta señal preserva información ordinal de calidad y permite supervisión de proceso de bajo coste en razonamiento matemático.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y alineación de confianza como objetivo del SFT (confidence alignment).
- Compatible con text-generation-inference y endpoints compatibles (tags del repo).
- Soporte multilingüe: no disponible (no declarado).
- Tool calling / function calling: no disponible.
- Capacidades de agente o multi-step reasoning: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en alineación de LLM: punto de partida reproducible para experimentos de confidence alignment sobre Zephyr, usando el dataset CONQORD y el pipeline RL2R.
- Reproducción de experimentos académicos: permite replicar el paso SFT del framework RefAlign/RL2R descrito en arXiv:2504.09895.
- Baseline para comparación de métodos de recompensa: sirve como referencia SFT frente a métodos con reward models o verificación binaria.
- Experimentación con recompensas basadas en referencias: útil para probar BERTScore u otras métricas de similitud como señal de recompensa en RL.
- Prototipado de chatbots conversacionales en inglés: el modelo base Zephyr-7b-alpha es adecuado para diálogo multi-turno, aunque este checkpoint está optimizado para el objetivo de investigación.
- Evaluación de calibración de confianza: escenario natural para medir cómo el modelo expresa incertidumbre y cómo el SFT afecta esa calibración.
- Despliegue ligero en entornos con VRAM limitada: los pesos en 8 bits (0,3 GB en repo) facilitan pruebas rápidas en GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos del repo están cuantizados a 8 bits (bitsandbytes), lo que reduce el requisito a aproximadamente 8-10 GB de VRAM para inferencia, aunque el repo de 0,3 GB sugiere un empaquetado parcial; no disponible dato exacto.
- GPUs recomendadas: RTX 3090, RTX 4090, A100 o H100 para cargas concurrentes; en 8 bits debería caber en GPUs consumer de 12-16 GB.
- Cabe en consumer GPU: probablemente sí en RTX 3060 12 GB, RTX 4070 Ti o superiores; no confirmado por el autor.
- Opciones de despliegue: transformers, text-generation-inference (tag presente), y potencialmente vLLM y llama.cpp si se generan pesos GGUF (no disponibles en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mzhaoshuai/zephyr-7b-alpha-conf-sft | ~7B | 32 768 | MIT | Hugging Face (13 descargas) |
| HuggingFaceH4/zephyr-7b-alpha | ~7B | 32 768 | MIT | Hugging Face (ampliamente usado) |
| Mistral-7B-Instruct-v0.2 | ~7B | 32 768 | Apache 2.0 | Hugging Face |
| Meta Llama 3.1 8B Instruct | ~8B | 128 000 | Llama 3.1 Community License | Hugging Face |

El modelo comparado más directo es su base Zephyr-7b-alpha, del que difiere solo por el SFT con CONQORD. Frente a Mistral-7B-Instruct-v0.2 y Llama 3.1 8B Instruct, este checkpoint carece de datos públicos de rendimiento y de tracción, por lo que no es comparable en calidad verificada.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción.
- Idiomas: no se declaran idiomas soportados; el modelo base está orientado principalmente al inglés.
- Riesgo de alucinación: inherente a modelos de 7B afinados con SFT; no hay evaluaciones publicadas.
- Sesgos: no documentados; hereda los sesgos del dataset CONQORD y del modelo base Zephyr.
- Licencia MIT: permite uso comercial, pero el modelo base Zephyr-7b-alpha también es MIT, por lo que no hay restricciones adicionales conocidas.
- Tracción mínima: 13 descargas y 0 likes, sin garantías de mantenimiento.
- Pesos cuantizados a 8 bits: puede limitar la reproducibilidad exacta de los experimentos del paper si se requiere precisión completa.
- Sin datos de benchmarks: no se puede evaluar su calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/mzhaoshuai/zephyr-7b-alpha-conf-sft
- Paper (arXiv): https://arxiv.org/abs/2504.09895
- Paper (Hugging Face): https://huggingface.co/papers/2504.09895
- Repositorio GitHub RL2R: https://github.com/mzhaoshuai/RL2R/tree/alignment
- Modelo base: https://huggingface.co/HuggingFaceH4/zephyr-7b-alpha
- Dataset: https://huggingface.co/datasets/shuchangtao/CONQORD_dataset
