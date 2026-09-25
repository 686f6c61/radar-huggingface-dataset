# servantofares/MiniMax-M3

## Resumen

MiniMax-M3 es un modelo multimodal nativo desarrollado por MiniMax AI, con aproximadamente 428 000 millones de parámetros totales y unos 23 000 millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos MoE de gran escala. Su rasgo diferencial es una ventana de contexto de 1 millón de tokens combinada con multimodalidad nativa: texto, imagen y vídeo se procesan dentro del mismo espacio semántico desde la primera fase de entrenamiento, no mediante adaptadores añadidos a posteriori.

El problema que aborda es el coste cuadrático de la atención en contextos de un millón de tokens. Para ello introduce MiniMax Sparse Attention (MSA), un operador de atención dispersa que, según el autor, reduce el cómputo por token a una vigésima parte respecto a su predecesor y ofrece aceleraciones de 9x en prefill y 15x en decode a 1M de contexto. El modelo está orientado a tareas agénticas de horizonte largo, con énfasis declarado en programación y trabajo colaborativo (cowork), y expone tres modos de razonamiento configurables.

La ficha analizada corresponde al repositorio `servantofares/MiniMax-M3`, una réplica no oficial; el repositorio de referencia del fabricante es `MiniMaxAI/MiniMax-M3`. El modelo se distribuye bajo licencia `minimax-community` y se apoya en código personalizado (`custom_code`) dentro de Transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal nativo con MiniMax Sparse Attention (MSA) |
| Parámetros totales | 427 040 140 160 (~427B, dato real de safetensors) |
| Parámetros activos | ~23B |
| Longitud de contexto | 1 000 000 tokens |
| Tipos de cuantización | MXFP4 y MXFP8 (referenciados en la guía de ATOM/ROCm); no se confirman otros formatos en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-community (license: other, con enlace a LICENSE) |
| Formato de pesos | safetensors (repo de 854,2 GB) |
| Librería | transformers (requiere `custom_code` / `minimax_m3_vl`) |
| Pipeline | image-text-to-text |
| Modalidades de entrada | texto, imagen, vídeo |
| Modos de razonamiento | `enabled`, `adaptive`, `disabled` (parámetro `thinking`) |
| Parámetros de inferencia recomendados | temperature = 1.0, top_p = 0.95 |

## Arquitectura y entrenamiento

M3 es un transformer de mezcla de expertos (MoE) con activación dispersa de aproximadamente 23B parámetros sobre un total de ~427B. La innovación central es MiniMax Sparse Attention (MSA), un operador de atención diseñado específicamente para contextos de millón de tokens que, según el autor, reduce drásticamente el cómputo y la huella de memoria de la atención comparado con GQA sin degradar la calidad del modelo. La multimodalidad es nativa: el entrenamiento mezcla modalidades desde el primer paso, lo que según la model card permite una fusión semántica más profunda entre texto, imagen y vídeo que los enfoques de adaptación posteriores.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. Tampoco se detalla la configuración exacta de expertos (número total, expertos activados por token, tamaño de cada experto). El modelo expone tres modos de razonamiento mediante el parámetro `thinking`: `enabled` (razonamiento siempre activo), `adaptive` (el modelo decide cuándo razonar) y `disabled` (razonamiento desactivado para minimizar latencia y maximizar throughput).

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento conmutable en tiempo de inferencia.
- Comprensión y generación sobre entradas de imagen (pipeline `image-text-to-text`).
- Comprensión de vídeo como modalidad nativa de entrenamiento.
- Programación y tareas de código, con rendimiento declarado de nivel frontera en benchmarks agénticos de horizonte largo.
- Capacidades agénticas: las etiquetas y la model card destacan uso en agentes y en tareas de "cowork" (colaboración con el usuario en flujos de trabajo prolongados).
- Contexto de 1M de tokens, apto para repositorios completos, transcripciones extensas o vídeo de larga duración.
- Soporte multilingüe: no declarado explícitamente en la información disponible.
- Tool calling / function calling: no se documenta de forma explícita; el uso agéntico se menciona de forma genérica.

## Casos de uso

- Agentes de programación autónomos: con 1M de tokens de contexto el modelo puede cargar un repositorio completo, rastrear dependencias entre ficheros y ejecutar ciclos de edición-verificación sin perder el estado del proyecto.
- Revisión de código en pipelines de CI/CD: análisis de pull requests que requieren leer múltiples módulos y el historial de cambios, aprovechando el modo `thinking: disabled` para revisiones rápidas y `enabled` para auditorías profundas.
- Asistentes de atención al cliente multi-turno: la ventana de 1M tokens permite mantener el historial completo de interacciones, documentación de producto y políticas internas en un único contexto sin estrategias de recuperación externas.
- Análisis de vídeo de larga duración: al ser multimodal nativo y soportar contexto de un millón de tokens, es adecuado para resumir reuniones, generar subtítulos o extraer eventos de grabaciones extensas.
- Análisis documental con imágenes: procesamiento conjunto de PDF escaneados, diagramas y tablas junto a texto explicativo, útil en auditoría, legal y seguros.
- Investigación asistida: lectura y síntesis de colecciones de papers o informes técnicos completos dentro de un solo contexto, con razonamiento en modo `adaptive`.
- Automatización de flujos de trabajo tipo cowork: agentes que coordinan tareas con el usuario a lo largo de sesiones largas, manteniendo objetivos y decisiones previas.
- Generación de código en producción: integración como backend de asistentes de IDE, sujeto a los requisitos de hardware indicados más abajo.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye una figura (`figures/benchmark.jpeg`) con resultados, pero sus valores no se han proporcionado en el texto extraído, por lo que no se reproducen aquí.

Los únicos datos cuantitativos declarados son comparativas de eficiencia frente a MiniMax-M2:

| Métrica | Valor declarado |
|---|---|
| Aceleración de prefill a 1M de contexto (vs. M2) | 9x |
| Aceleración de decode a 1M de contexto (vs. M2) | 15x |
| Cómputo por token (vs. M2) | 1/20 |

## Requisitos de hardware

- VRAM estimada para pesos en BF16: ~854 GB (coincide con el tamaño del repositorio). Requiere despliegue multi-nodo o multi-GPU de gama alta.
- VRAM estimada en MXFP8: ~427 GB. Cabe en configuraciones de 8x H100 80 GB (640 GB) o 8x H200.
- VRAM estimada en MXFP4: ~214 GB. Puede desplegarse en 4x H100 80 GB o 8x RTX 5090 (256 GB), con margen ajustado.
- GPU recomendadas: H100/H200 (80 GB) en configuraciones de 4 a 16 unidades; también se documenta soporte ROCm mediante ATOM, lo que habilita GPUs AMD Instinct (MI300/MI350).
- GPU de consumo: no cabe en una GPU de consumo individual. La vía práctica es KTransformers, que permite descarga de expertos a CPU con memoria de sistema abundante (configuración típica: 1 GPU + gran cantidad de RAM DDR5), a costa de throughput muy inferior.
- Caché KV: aunque MSA reduce el coste de atención, un contexto de 1M de tokens sigue consumiendo memoria considerable; hay que dimensionar el pool de caché además de los pesos.
- Frameworks de despliegue soportados: SGLang, vLLM, Transformers, KTransformers, unsloth y ATOM (ROCm). También se anuncia compatibilidad con endpoints.
- Latencia y throughput: no se publican cifras absolutas; solo las aceleraciones relativas frente a M2 indicadas en la sección de benchmarks.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Modalidad | Licencia |
|---|---|---|---|---|---|
| MiniMax-M3 | ~427B | ~23B | 1M | texto, imagen, vídeo | minimax-community |
| DeepSeek-V3.1 | ~671B | ~37B | 128K | texto | licencia DeepSeek |
| Qwen3-235B-A22B | ~235B | ~22B | 128K | texto | Apache 2.0 |
| Llama 4 Maverick | ~400B | ~17B | 1M | texto, imagen | Llama 4 Community License |

Los datos de los modelos comparados proceden de sus fichas públicas y pueden variar según la versión concreta. La ventaja diferencial de M3 en esta tabla es la combinación de contexto de 1M con vídeo nativo; su desventaja principal es una licencia comunitaria no OSI y un ecosistema de pesos mucho menos extendido (0 descargas registradas en el repositorio analizado).

## Limitaciones y advertencias

- El repositorio analizado (`servantofares/MiniMax-M3`) es una réplica no oficial: 0 descargas y 0 likes en el momento del análisis. Para uso en producción debe verificarse el repositorio oficial del fabricante y la integridad de los pesos.
- La licencia `minimax-community` es de tipo comunitario y no OSI; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- Riesgo de alucinación inherente a los modelos generativos, especialmente relevante en cadenas de razonamiento largas y en tareas multimodales donde el modelo puede describir contenido no presente en la imagen o el vídeo.
- No se documentan evaluaciones de sesgo ni de seguridad. Como modelo entrenado con corpus web a gran escala, es previsible la presencia de sesgos sociales, geográficos y culturales.
- Los idiomas soportados no están declarados: no puede asumirse un rendimiento homogéneo fuera del inglés y el chino sin validación previa.
- Aunque MSA reduce el coste de atención, la recuperación precisa de información ("needle in a haystack") en contextos de 1M de tokens debe validarse empíricamente en el caso de uso concreto; el rendimiento efectivo suele degradarse respecto a contextos cortos.
- El coste de despliegue es muy alto: se requieren varios aceleradores de 80 GB o esquemas de offload a CPU con impacto severo en latencia.
- No se especifican datos de entrenamiento, composición del dataset ni etapas de alineación, lo que dificulta la auditoría del modelo.
- El soporte de function calling no está documentado explícitamente; si el caso de uso depende de ello, conviene verificarlo antes de integrarlo.

## Enlaces

- Repositorio analizado (réplica no oficial): https://huggingface.co/servantofares/MiniMax-M3
- Repositorio oficial en Hugging Face: https://huggingface.co/MiniMaxAI
- Organización en ModelScope: https://modelscope.cn/organization/minimax
- Informe técnico (arXiv): https://arxiv.org/abs/2606.13392
- Página del paper en Hugging Face: https://huggingface.co/papers/2606.13392
- Repositorio de código: https://github.com/MiniMax-AI/MiniMax-M3
- Operador de atención dispersa (MSA): https://github.com/MiniMax-AI/MSA
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-M3/blob/main/LICENSE
- MiniMax Agent: https://agent.minimax.io/
- API de MiniMax: https://platform.minimax.io/
- Documentación de generación de texto: https://platform.minimax.io/docs/guides/text-generation
- Web oficial: https://www.minimax.io
- SGLang (cookbook de MiniMax-M3): https://docs.sglang.io/cookbook/autoregressive/MiniMax/MiniMax-M3
- vLLM (recetas): https://recipes.vllm.ai/MiniMaxAI/MiniMax-M3
- Transformers (documentación del modelo): https://huggingface.co/docs/transformers/model_doc/minimax_m3_vl
- KTransformers (tutorial): https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/MiniMax-M3-Tutorial.md
- unsloth (tutorial): https://unsloth.ai/docs/models/minimax-m3
- ATOM / ROCm (guía MXFP4/MXFP8): https://github.com/ROCm/ATOM/blob/main/recipes/MiniMax-M3.md
- Contacto del fabricante: model@minimax.io
- Discord de MiniMax: https://discord.com/invite/DPC4AHFCBw
