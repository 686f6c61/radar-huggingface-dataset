# bahattinyunus/kam-7b-gguf

## Resumen

KAM-7B es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) publicado por Bahattin Yunus Çetin bajo el identificador `bahattinyunus/kam-7b-gguf`. Se distribuye exclusivamente en formato GGUF cuantizado (4 y 8 bits) y está pensado para su ejecución local mediante Ollama o llama.cpp, con soporte declarado para CPU y GPU. La model card lo describe como un "cerebro cognitivo autónomo" que combina la tradición chamánica del Altái con el principio de energía libre de Karl Friston, la telemetría del kernel Linux vía eBPF y mutación JIT en memoria con C++20; se trata, en la práctica, de una capa de posicionamiento conceptual sobre un modelo base derivado de la familia Qwen2.5, según indican sus etiquetas.

El modelo declara un contexto de 16.384 tokens y está orientado a turco (idioma principal, con especial énfasis en fluidez y corrección morfológica) e inglés como secundario. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución habituales.

Su relevancia actual es limitada pero concreta: cubre el nicho de modelos pequeños, cuantizados y desplegables en hardware modesto para tareas de generación de texto en turco, un idioma con menor cobertura en el ecosistema open source que el inglés o el castellano. No obstante, el repositorio no incluye resultados de benchmarks, detalles del dataset de entrenamiento ni información verificable sobre el proceso de ajuste, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5, según etiquetas del autor; detalles no disponibles) |
| Parámetros totales | 7.615.616.512 (~7,6 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantización | GGUF 4-bit y 8-bit (según model card) |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 4,7 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio, que apuntan a Qwen2.5 como base y a DeepSeek-R1 como referencia de destilación o inspiración para el razonamiento. No se especifica si se trata de un transformer denso estándar con atención de múltiples cabezas, ni se documentan innovaciones como decodificación especulativa, atención lineal o capas híbridas SSM. El tamaño de 7,6 B parámetros encaja con la variante Qwen2.5-7B, pero el autor no confirma explícitamente la correspondencia.

Tampoco se publican datos sobre el corpus de entrenamiento: no se indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. La model card menciona conceptos como "inferencia activa" y "minimización de entropía de Shannon" como marco filosófico del modelo, pero no los traduce en detalles técnicos verificables sobre el proceso de entrenamiento. Cualquier afirmación sobre el pipeline de ajuste debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional en turco e inglés, con énfasis declarado en fluidez morfológica y sintaxis SOV del turco.
- Razonamiento de un solo turno y multi-turno dentro de la ventana de 16.384 tokens.
- Soporte declarado de tool calling y function calling (etiqueta `endpoints_compatible` en el repositorio).
- Capacidad de razonamiento multi-paso y uso como agente, según las etiquetas `autonomous-systems` y `active-inference`.
- Generación de código y conocimiento técnico en áreas como eBPF, C++20 y telemetría de sistemas Linux, según la model card.
- Capacidades multilingües limitadas a turco e inglés; no se declara soporte de otros idiomas.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Asistencia conversacional en turco para atención al cliente: el modelo puede mantener diálogos multi-turno de hasta 16.384 tokens, suficiente para conservar el historial de una conversación de soporte sin truncamientos frecuentes, y su énfasis en turco nativo reduce los errores morfológicos típicos de modelos entrenados principalmente en inglés.
- Generación de documentación técnica en turco: útil para equipos que redactan manuales, guías de operación o documentación de infraestructura en turco y necesitan un modelo que respete la sintaxis SOV y la terminología técnica.
- Prototipado de agentes autónomos locales: al ejecutarse en GGUF con Ollama, puede integrarse en pipelines de agentes que requieran inferencia en local sin conexión a la nube, con tool calling para invocar APIs o scripts.
- Análisis y resumen de telemetría de sistemas: la model card menciona optimización de telemetría de vuelo y hooks de eBPF; el modelo puede emplearse para resumir logs o generar explicaciones de trazas en entornos Linux.
- Educación y divulgación en turco: generación de material didáctico, explicaciones de conceptos técnicos y respuestas a preguntas frecuentes en turco, aprovechando su contexto de 16K para incluir fragmentos largos de documentación.
- Desarrollo de asistentes de código en turco: integración en IDE o CLI para autocompletado y explicación de fragmentos de C++20, scripts de shell o configuración de sistemas, con la ventaja de ejecutarse en hardware de consumo.
- Experimentación en investigación sobre inferencia activa: el marco del free energy principle que declara el autor puede servir como banco de pruebas para estudiar cómo un LLM pequeño responde a prompts que simulan minimización de sorpresa sensorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB en cuantización 4-bit y 8-9 GB en 8-bit, considerando los 7,6 B parámetros y el overhead de la ventana de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para 8-bit; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM en 4-bit; en 8-bit se recomienda 12 GB o más.
- Opciones de despliegue: Ollama (`ollama run hf.co/bahattinyunus/kam-7b-gguf`), llama.cpp, y cualquier runtime compatible con GGUF (LM Studio, text-generation-webui). No se declara soporte nativo para vLLM o TGI en formato GGUF.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y la cuantización. En una RTX 4090 con 4-bit es razonable esperar decenas de tokens por segundo, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KAM-7B (este modelo) | ~7,6 B | 16.384 | Apache 2.0 | GGUF | Enfoque en turco, sin benchmarks publicados |
| Qwen2.5-7B | ~7,6 B | 32.768 (base) | Apache 2.0 | Safetensors, GGUF | Base probable; multilingüe amplio, benchmarks públicos |
| Llama 3.1 8B | ~8 B | 131.072 | Llama 3.1 Community | Safetensors, GGUF | Multilingüe, ecosistema amplio, benchmarks públicos |
| Mistral 7B | ~7,3 B | 32.768 | Apache 2.0 | Safetensors, GGUF | Referencia en modelos pequeños, benchmarks públicos |

La comparativa se basa en características declaradas; no se dispone de datos de rendimiento de KAM-7B que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar la calidad del modelo frente a su base declarada (Qwen2.5) ni frente a alternativas.
- Sin documentación del dataset de entrenamiento ni del proceso de ajuste: no se puede evaluar el riesgo de contaminación, sesgos de dominio ni calidad de la alineación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.
- La model card mezcla conceptos filosóficos (chamanismo, free energy principle) con afirmaciones técnicas no verificadas; parte del contenido debe tratarse como marketing y no como especificación técnica.
- Riesgo de alucinación no cuantificado; al ser un modelo pequeño y sin benchmarks, se recomienda validación humana en dominios factuales.
- Soporte limitado a turco e inglés; no se declara ni garantiza funcionamiento en castellano u otros idiomas.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de trazabilidad del entrenamiento impide descartar obligaciones adicionales derivadas de datos de terceros.
- El contexto de 16.384 tokens es inferior al de su base probable (Qwen2.5-7B soporta 32.768), lo que puede limitar casos de uso con documentos largos.
- No se declara soporte para vLLM o TGI, lo que restringe el despliegue en infraestructura de serving de alto rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/bahattinyunus/kam-7b-gguf
- GitHub del autor: https://github.com/bahattinyunus/kam
- Perfil del autor: https://github.com/bahattinyunus
- Repositorio base probable (Qwen2.5): https://huggingface.co/Qwen/Qwen2.5-7B
- Referencia de razonamiento (DeepSeek-R1): https://huggingface.co/deepseek-ai/DeepSeek-R1
