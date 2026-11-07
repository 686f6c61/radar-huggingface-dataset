# Outlier-Ai/Outlier-40B

## Resumen

Outlier-40B es un artefacto de investigación publicado por Outlier-Ai que se presenta como un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con cuantización ternaria, construido sobre Qwen/Qwen2.5-14B-Instruct como modelo base y con adaptadores superpuestos. La model card lo describe como un MoE ternario de "36B parámetros" que supera a su profesor denso en MMLU, aunque los pesos reales alojados en el repositorio suman 14.770.033.664 parámetros según safetensors. Esta discrepancia entre el nombre comercial, la descripción textual y el recuento real de parámetros es una de las primeras advertencias que debe tener en cuenta cualquier evaluador.

El modelo se distribuye bajo licencia Apache 2.0, con soporte declarado para 15 idiomas (inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco) y etiquetas orientadas a despliegue local, edge computing y Apple Silicon. El repositorio ocupa 29,6 GB y emplea el formato safetensors con la librería transformers.

La relevancia actual es limitada: la propia model card marca el repositorio como "superseded" (reemplazado) y lo describe como un artefacto de una línea anterior de Outlier, preservado por reproducibilidad y no recomendado para producción. La card redirige a las versiones actuales de la familia (Nano 4B, Core 27B, Vision 35B-A3B) y al sitio del fabricante. Con 11 descargas y 1 like en el momento de la consulta, se trata de un modelo de nicho con escasa tracción comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre base Qwen2.5-14B-Instruct, con cuantización ternaria y adaptadores/overlays |
| Parametros totales | 14.770.033.664 según safetensors (la model card menciona "36B" y el nombre comercial "40B"; discrepancia no resuelta) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ternaria (declarada); no se detallan otros formatos en la información disponible |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl (15 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La información disponible indica que Outlier-40B es un modelo MoE con cuantización ternaria construido sobre Qwen2.5-14B-Instruct mediante adaptadores (relación `base_model_relation: adapter`). La model card original afirma que se trata del "primer modelo MoE cuantizado en ternario que supera a su profesor denso en MMLU" y que solo el 3 % de los parámetros se entrenaron mediante destilación ligera, con enrutamiento MoE basado en overlays. No se especifican en la información proporcionada el número de expertos, la top-k de enrutamiento, el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO.

La card advierte explícitamente que el repositorio "puede contener adaptadores, overlays o variantes de cuantización experimentales que no llegaron al producto final" y que cualquier afirmación técnica de revisiones anteriores debe considerarse provisional. No hay disponible información sobre innovaciones adicionales como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Generación de texto conversacional en 15 idiomas, heredada del modelo base Qwen2.5-14B-Instruct.
- Razonamiento matemático y resolución de problemas verbales: los ejemplos del widget incluyen problemas de máquinas y widgets, trenes que se cruzan y acertijos lógicos.
- Razonamiento lógico y deductivo sobre restricciones (por ejemplo, asignación de mascotas a personas con pistas).
- Capacidad declarada de superar a su profesor denso en MMLU 5-shot según el autor (77,8), lo que sugiere preservación de conocimiento factual y razonamiento general.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque el modelo base Qwen2.5-14B-Instruct lo soporta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles en este modelo.
- Orientación a despliegue local y edge (etiquetas `local-llm`, `on-device`, `edge-ai`, `apple-silicon`, `mac`), con énfasis declarado en eficiencia energética y esparsidad.

## Casos de uso

- Evaluación de investigación sobre cuantización ternaria en MoE: el modelo sirve como referencia reproducible para estudiar cómo la cuantización ternaria y los overlays afectan al rendimiento frente a un profesor denso, dado su carácter de artefacto de investigación.
- Razonamiento matemático asistido en entornos educativos: los ejemplos del widget (problemas de velocidad, lógica de mascotas) muestran un uso previsto para resolver problemas paso a paso con razonamiento explícito.
- Prototipado de asistentes conversacionales multilingües: los 15 idiomas declarados permiten experimentar con atención al cliente o asistentes en español, francés, alemán, japonés, árabe, entre otros, aunque sin garantías de producción.
- Despliegue experimental en Apple Silicon: las etiquetas `apple-silicon` y `mac` sugieren experimentación con inferencia local en equipos de sobremesa y portátiles de Apple, aunque no se especifican requisitos concretos.
- Investigación sobre eficiencia energética en edge: la orientación a `energy-efficient` y `on-device` lo hace candidato para estudios de consumo en dispositivos con recursos limitados.
- Reproducibilidad de resultados históricos: al estar preservado como artefacto, permite reproducir las afirmaciones de la línea Outlier anterior y comparar con las versiones actuales (Nano 4B, Core 27B, Vision 35B-A3B).
- No se recomienda su uso en producción: la propia card lo desaconseja explícitamente y redirige a las versiones actuales.

## Benchmarks y rendimiento

| Modelo | Benchmark | Métrica | Resultado | Verificado |
|---|---|---|---|---|
| Outlier-40B | MMLU | accuracy (5-shot) | 77,8 | No (declarado por el autor) |

No se han publicado en la información disponible resultados de otros benchmarks (HumanEval, GSM8K, MATH, etc.) ni comparaciones numéricas con modelos similares. El único dato disponible es el MMLU 5-shot declarado por el autor, marcado como no verificado (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 14.770.033.664 parámetros en safetensors y un repositorio de 29,6 GB, una estimación orientativa en FP16 rondaría los 29-30 GB, y en cuantización de 8 bits unos 15 GB; sin embargo, al tratarse de un MoE ternario con overlays, los requisitos reales dependen de la implementación y no están documentados.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar viabilidad en A100 40/80 GB, H100 y RTX 4090 (24 GB) solo con cuantización agresiva; no confirmado.
- ¿Cabe en GPU de consumo? No confirmado. Las etiquetas `apple-silicon` y `mac` apuntan a despliegue en Apple Silicon con memoria unificada, pero no se especifican modelos ni configuraciones.
- Opciones de despliegue: transformers (librería declarada) y text-generation-inference (etiqueta `text-generation-inference`). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Outlier-40B | 14,77B reales (nombre comercial 40B; card menciona 36B) | no disponible | 77,8 (5-shot, no verificado) | Apache 2.0 | Hugging Face, marcado como superseded |
| Qwen2.5-14B-Instruct (modelo base) | 14,7B | 32.768 tokens (según Qwen2.5) | no disponible en esta ficha | Apache 2.0 | Hugging Face, activo |
| Outlier Core 27B | no disponible | no disponible | no disponible | no disponible | Hugging Face (tier actual de Outlier) |
| Outlier Nano 4B | no disponible | no disponible | no disponible | no disponible | Hugging Face (tier de entrada de Outlier) |

La comparación con alternativas de la misma categoría (MoE ternarios) no está disponible en la información proporcionada. El propio autor sitúa a Outlier Core 27B y Outlier Nano 4B como reemplazos recomendados.

## Limitaciones y advertencias

- Modelo marcado como "superseded" por el propio autor: no se recomienda para producción y se preserva únicamente por reproducibilidad e interés histórico.
- Discrepancia de parámetros: el nombre comercial (40B), la descripción de la card (36B) y el recuento real de safetensors (14,77B) no coinciden; conviene tratar cualquier cifra de tamaño con cautela.
- Benchmarks no verificados: el único resultado (MMLU 77,8) está declarado por el autor con `verified: false` y no se ha contrastado de forma independiente.
- Artefacto experimental: la card advierte que puede contener adaptadores, overlays o variantes de cuantización que no llegaron al producto final, y que las afirmaciones técnicas de revisiones anteriores son provisionales.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto e idioma: la longitud de contexto no está especificada; el soporte multilingüe se declara para 15 idiomas, pero sin evaluación por idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-14B-Instruct conviene verificar las condiciones del modelo base y de los posibles adaptadores.
- Tracción comunitaria mínima: 11 descargas y 1 like en el momento de la consulta, lo que reduce la probabilidad de soporte, parches o validación independiente.
- Redirección comercial: la card incluye enlaces promocionales a outlier.host y a la aplicación Outlier para Mac (versión 1.11.999, con planes gratuitos Nano y Lite y Pro a 49 USD), lo que debe interpretarse como material de marketing, no como documentación técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-40B
- Árbol de archivos: https://huggingface.co/Outlier-Ai/Outlier-40B/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Outlier Nano 4B (tier actual de entrada): https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier Core 27B (tier actual por defecto): https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier Vision 35B-A3B (tier multimodal): https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (razonamiento): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (código): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Sitio del fabricante: https://outlier.host/
- Plataforma de datos de Outlier AI (no relacionada con el modelo): https://outlier.ai/
