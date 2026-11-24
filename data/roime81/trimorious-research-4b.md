# roime81/trimorious-research-4B

## Resumen

trimorious-research-4B es un ajuste fino de dominio (QLoRA) sobre `unsloth/Qwen2.5-3B-Instruct-bnb-4bit`, desarrollado por el autor `roime81` en el marco del proyecto "trimorious". Su objetivo es la síntesis de literatura científica y el análisis de metodologías, empleando un corpus construido a partir de las APIs de arXiv y OpenAlex y procesado con el parser `docling` para preservar la transcripción de fórmulas matemáticas. El modelo se distribuye con licencia Apache 2.0 e idioma declarado inglés.

A pesar de la nomenclatura "4B", el modelo base es Qwen2.5-3B-Instruct, por lo que el número real de parámetros corresponde a la familia Qwen2.5-3B (aproximadamente 3.090 millones). El ajuste se realizó con Unsloth + TRL, con LoRA de rango 16 y alpha 16, batch size 2 con acumulación 4 y learning rate 2e-4 con scheduler coseno. El resultado es un adaptador de bajo rango fusionado o distribuido junto al modelo base cuantizado en 4 bits.

Su relevancia es limitada y muy específica: se trata de un experimento de ajuste de dominio de un único autor, sin benchmarks publicados, sin descargas ni interacciones en Hugging Face en el momento de la ficha, y con un tamaño de repositorio de 0,1 GB. Es útil como referencia metodológica para pipelines de QLoRA sobre literatura científica, no como modelo de producción validado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) basado en Qwen2.5-3B-Instruct; ajuste QLoRA (LoRA rank 16, alpha 16) |
| Parametros totales | ~3.090 millones (modelo base Qwen2.5-3B; el nombre "4B" no refleja el conteo real) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en la configuración de uso indicada por el autor (max_seq_length); el máximo nativo del base Qwen2.5-3B es 32.768, no confirmado para este ajuste |
| Tipos de cuantizacion | 4 bits (bnb-4bit) en el modelo base; no se documentan otras variantes (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Inglés (declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB; compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2.5, concretamente la variante Instruct de 3B parámetros, sobre la que se aplica un ajuste supervisado con QLoRA. La configuración declarada incluye LoRA de rango 16 con alpha 16, batch size efectivo de 8 (2 × acumulación 4), learning rate 2e-4 con decaimiento coseno y el stack Unsloth + TRL. No se especifica el número total de tokens de entrenamiento, el número de épocas ni la composición exacta del dataset más allá de las fuentes (arXiv y OpenAlex).

La innovación técnica destacable es el preprocesado del corpus: el autor indica el uso del parser `docling` para "transcripción perfecta" de matemáticas, lo que sugiere un esfuerzo por preservar notación LaTeX o similar en los datos de entrenamiento. No se documenta RLHF, DPO ni ninguna fase de alineación posterior al ajuste de dominio; el comportamiento instruct proviene del modelo base. Tampoco se detallan técnicas de decodificación especulativa, atención lineal ni optimizaciones de inferencia más allá de la carga en 4 bits.

## Capacidades

- Generación de texto y razonamiento general heredados de Qwen2.5-3B-Instruct.
- Síntesis de literatura científica y resumen de artículos, según la model card.
- Análisis de metodologías de investigación.
- Procesamiento de expresiones matemáticas en el corpus de entrenamiento (sin garantía de corrección simbólica).
- Soporte de tool calling / function calling: no documentado para este ajuste; el base Qwen2.5-Instruct lo soporta, pero no se confirma que se preserve tras el QLoRA.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: limitado a inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Revisión bibliográfica asistida: el modelo puede resumir abstracts y secciones de artículos de arXiv procesados con docling, aprovechando el ajuste sobre literatura académica para generar síntesis en inglés.
- Extracción de metodologías: dado un paper, generar un resumen estructurado de la metodología experimental, útil como primer borrador para revisiones sistemáticas.
- Generación de related work: producir borradores de secciones de trabajos relacionados a partir de un conjunto de referencias, siempre con verificación humana.
- Prototipado de asistentes de investigación: integración en un chatbot interno para consultas sobre un corpus científico cerrado, con contexto de 2048 tokens por consulta.
- Experimentación académica con QLoRA: servir como referencia reproducible de un pipeline Unsloth + TRL + docling para ajustar modelos pequeños a dominios científicos.
- Filtrado y clasificación de literatura: usar el modelo para etiquetar o priorizar papers por relevancia temática antes de un análisis manual más profundo.
- Docencia y divulgación: generar explicaciones en inglés de conceptos extraídos de artículos, con revisión obligatoria por parte del docente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 4 bits: aproximadamente 2-3 GB para pesos, más overhead de activaciones y KV cache; en la práctica, 4-6 GB con contexto de 2048 tokens.
- VRAM estimada en fp16 (si se reconstruye el modelo sin cuantizar): ~6-7 GB para pesos, 8-10 GB con contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 y H100 son suficientes; el modelo es pequeño para hardware de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más en 4 bits (GTX 1660 6 GB, RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: transformers con `load_in_4bit=True`, Unsloth `FastLanguageModel`, vLLM, TGI (el tag `text-generation-inference` está presente), llama.cpp/Ollama solo si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles; por el tamaño (~3B en 4 bits) se espera un throughput alto en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| trimorious-research-4B | ~3,09B (QLoRA sobre Qwen2.5-3B) | 2048 (config. de uso) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste de dominio científico, sin benchmarks |
| Qwen2.5-3B-Instruct | ~3,09B | 32.768 nativo | Apache 2.0 | Ampliamente disponible | Modelo base; benchmarks publicados por Alibaba |
| Qwen2.5-7B-Instruct | ~7,6B | 32.768 nativo | Apache 2.0 | Ampliamente disponible | Alternativa de mayor tamaño y capacidad general |
| Llama 3.2 3B Instruct | ~3,2B | 128.000 | Llama 3.2 Community License | Ampliamente disponible | Restricciones de licencia para uso comercial a gran escala |

La comparación con Qwen2.5-3B-Instruct es la más directa: trimorious añade especialización científica a costa de un contexto de uso reducido (2048) y de la ausencia de evaluación pública. Frente a Llama 3.2 3B, la licencia Apache 2.0 es más permisiva, pero el rendimiento no está verificado.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora sobre el modelo base en tareas científicas.
- Riesgo de alucinación matemática: el propio autor advierte de "tendencias de alucinación matemática" heredadas del modelo base y recomienda verificación simbólica.
- Contexto limitado a 2048 tokens en la configuración indicada, insuficiente para papers completos.
- Solo inglés: no apto para documentación o consultas en castellano sin degradación.
- Repositorio de 0,1 GB: probablemente contiene solo el adaptador LoRA o pesos parciales; conviene verificar la integridad antes de desplegar.
- Sin descargas ni likes: no hay validación comunitaria ni informes de uso en producción.
- Sin documentación sobre tool calling, agentes o alineación posterior; no asumir estas capacidades.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción sin validación propia.
- El nombre "4B" induce a error sobre el tamaño real (~3,09B).

## Enlaces

- Hugging Face: https://huggingface.co/roime81/trimorious-research-4B
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Qwen2.5-3B-Instruct (original): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- docling: https://github.com/docling-project/docling
- arXiv API: https://info.arxiv.org/help/api/index.html
- OpenAlex: https://openalex.org/
