# ConnorYU/Qwen3.5-9B-VerIH-step200-template-noprompt-syshint

## Resumen

El modelo `ConnorYU/Qwen3.5-9B-VerIH-step200-template-noprompt-syshint` es un ajuste fino (fine-tune) de la familia Qwen3.5, publicado por el usuario ConnorYU en Hugging Face. Se trata de un modelo de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) con licencia Apache 2.0, orientado a tareas de conversación y generación de texto a partir de entradas de imagen y texto (`image-text-to-text`). Deriva directamente de `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-noprompt-step200`, un checkpoint intermedio que a su vez parece haber sido entrenado con GRPO (Group Relative Policy Optimization) sobre tareas de seguimiento de instrucciones (IFEval).

La relevancia de este checkpoint es doble. Por un lado, forma parte de una cadena de experimentos de alineamiento sobre Qwen3.5 documentada de forma pública en Hugging Face, lo que permite a investigadores reproducir o inspeccionar las distintas etapas del pipeline (SFT, RL con GRPO, y ajustes posteriores de plantilla y prompt de sistema). Por otro, el sufijo del nombre (`template-noprompt-syshint`) sugiere una intervención específica sobre la plantilla de chat y la gestión del prompt de sistema, un aspecto poco habitual en model cards públicas y relevante para quienes integran modelos en pipelines de agentes.

No obstante, la información publicada por el autor es mínima: la model card es la plantilla genérica de Unsloth, no hay datos de benchmarks, no se detalla la composición del dataset de entrenamiento ni el proceso exacto de ajuste. El modelo tiene cero descargas y cero likes en el momento de redactar esta ficha, y su fecha de creación (2026-11-12) lo sitúa como un artefacto muy reciente y sin validación comunitaria. Todo ello debe tenerse en cuenta al evaluar su idoneidad para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; detalles internos no disponibles) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5, un transformer decoder-only de la familia Qwen, con 9.409.813.744 parámetros totales según los pesos en safetensors. El modelo es multimodal en la modalidad `image-text-to-text`, lo que indica que acepta entradas de imagen y texto y genera texto. No se dispone de información pública sobre el número de capas, dimensión oculta, número de cabezas de atención, tipo de atención (lineal, completa o híbrida) ni longitud de contexto nativa; estos datos no aparecen en la model card ni en los tags.

El entrenamiento se realizó en dos fases identificables por la cadena de modelos base. Primero, un checkpoint `Qwen3.5-9B-GRPO-ifeval-v0-think-noprompt-step200`, que por su nombre indica un ajuste con GRPO (una variante de RLHF/RL sin modelo de recompensa separado, popularizada por DeepSeek) sobre tareas de seguimiento de instrucciones del benchmark IFEval, con un modo "think" (razonamiento explícito) y sin prompt de sistema ("noprompt"), en el paso 200. Sobre ese checkpoint se aplicó el ajuste que da lugar a este modelo, con modificaciones de plantilla ("template") y una pista de sistema ("syshint"). El autor declara haber usado Unsloth y la librería TRL de Hugging Face, lo que sugiere un fine-tuning eficiente en memoria (posiblemente LoRA o QLoRA, aunque no se especifica). No se detalla el volumen de tokens, la composición del dataset ni si hubo una fase adicional de DPO o RLHF en este último paso.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de conversaciones multi-turno según el tag `conversational`.
- Procesamiento de entradas imagen-texto (`image-text-to-text`), lo que permite tareas de descripción de imágenes, VQA o razonamiento sobre contenido visual, aunque no se detallan las capacidades visuales concretas.
- Modo de razonamiento explícito ("think"), heredado del checkpoint base entrenado con GRPO sobre IFEval.
- Seguimiento de instrucciones: el linaje GRPO-ifeval sugiere un ajuste específico para cumplir restricciones y formatos de instrucción, aunque no hay métricas publicadas que lo confirmen.
- Compatibilidad con `text-generation-inference` (TGI) y con `transformers`, según los tags.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, audio ni otros modos especiales.

## Casos de uso

- Evaluación de pipelines de alineamiento: el modelo sirve como eslabón intermedio en una cadena documentada de SFT → GRPO → ajuste de plantilla, útil para investigadores que estudien cómo evoluciona el comportamiento de un modelo a lo largo de estas etapas.
- Experimentos de seguimiento de instrucciones: al derivar de un checkpoint entrenado con GRPO sobre IFEval, es adecuado para probar la robustez del modelo ante instrucciones con restricciones de formato (listas, longitudes, palabras prohibidas), comparándolo con el checkpoint base.
- Prototipado de asistentes conversacionales en inglés: con 9,4 mil millones de parámetros, puede desplegarse en una GPU de 24 GB en cuantización de 8 bits para demos de chat multi-turno.
- Tareas de imagen-texto en investigación: para experimentos de VQA o captioning donde se quiera comparar el efecto del ajuste de plantilla y prompt de sistema sobre las respuestas visuales.
- Estudio del efecto del prompt de sistema: el sufijo `syshint` sugiere un tratamiento particular del system prompt; el modelo es útil para analizar cómo cambia el comportamiento cuando se inyecta o se omite una pista de sistema.
- Base para fine-tuning posterior: al estar bajo licencia Apache 2.0 y en formato safetensors compatible con transformers y Unsloth, puede reutilizarse como punto de partida para ajustes específicos de dominio en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros, en FP16 se requieren aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y KV cache (típicamente 20-24 GB en total para contextos moderados). En cuantización de 8 bits, unos 10-12 GB; en 4 bits, unos 6-7 GB.
- GPU recomendadas: A100 40 GB o H100 para FP16 sin cuantizar y contextos largos; L40S o RTX A6000 (48 GB) como alternativas; RTX 4090 (24 GB) para FP16 ajustado o 8 bits.
- ¿Cabe en GPU de consumo? Sí, en cuantización de 8 o 4 bits cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) con 4 bits, e incluso en GPUs de 12 GB con cuantización agresiva, siempre que se gestione bien el KV cache.
- Opciones de despliegue: `transformers` (soporte nativo), `text-generation-inference` (TGI, según tags), y previsiblemente `vLLM` y `llama.cpp`/`Ollama` si se generan cuantizaciones GGUF (no publicadas por el autor). El tag `endpoints_compatible` indica compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-VerIH-step200-template-noprompt-syshint | 9,4 B | no disponible | Apache 2.0 | Sí (image-text-to-text) | Hugging Face, 0 descargas |
| Qwen3.5-9B (base de la familia) | ~9 B | no disponible en esta ficha | Apache 2.0 (según familia Qwen) | Según variante | Hugging Face |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-noprompt-step200 (modelo base directo) | 9,4 B | no disponible | Apache 2.0 | Sí | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente inglés (`en`); su rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que no debe asumirse un rendimiento superior al checkpoint base.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se ha documentado ningún mecanismo de mitigación específico.
- Sesgos: no se ha publicado ninguna evaluación de sesgos; al derivar de Qwen3.5 y de un ajuste sobre IFEval, puede heredar sesgos del modelo base y del dataset de instrucciones.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las obligaciones de atribución y las posibles restricciones heredadas del modelo base Qwen3.5.
- Artefacto sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha; no hay reportes de terceros sobre su comportamiento real.
- Información de entrenamiento incompleta: se desconoce el dataset, el número de tokens, la técnica exacta (LoRA/QLoRA/full fine-tune) y la evaluación; esto dificulta la reproducibilidad.
- Fecha de creación futura respecto a la redacción habitual de fichas (2026-11-12): conviene verificar que el repositorio sigue disponible y que los pesos no han sido modificados.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step200-template-noprompt-syshint
- Modelo base directo: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-noprompt-step200
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
