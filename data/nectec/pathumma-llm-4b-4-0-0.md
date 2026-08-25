# nectec/Pathumma-llm-4b-4.0.0

## Resumen

Pathumma LLM es una familia de modelos de lenguaje desarrollada por el NECTEC (National Electronics and Computer Technology Center) de Tailandia, bajo el paraguas de la NSTDA. El modelo con identificador `nectec/Pathumma-llm-4b-4.0.0` es una versión de 4.000 millones de parámetros (4,54 mil millones en total) diseñada para comprender y generar contenido adaptado al contexto lingüístico y cultural tailandés. A diferencia de los modelos globales, Pathumma se entrena con un enfoque localizado, lo que lo hace relevante para aplicaciones de procesamiento de lenguaje natural en tailandés y para el desarrollo de soluciones de IA en el sudeste asiático.

El modelo se distribuye con licencia Apache 2.0, lo que permite su uso comercial y modificación, y está publicado en formato safetensors. Aunque la información pública es escasa, el tag `qwen3_5` sugiere que la arquitectura está basada en la serie Qwen 3.5 de Alibaba, aunque no se confirma oficialmente. La versión 4b es parte de una línea que también incluye variantes multimodales (visión y texto) y se ofrece tanto como aplicación web, API y modelo descargable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Probablemente basada en Qwen3.5 (según tag), no confirmada oficialmente |
| Parametros totales | 4.539.265.536 (aprox. 4,54B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tailandés (principal), no se especifican otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo. El tag `qwen3_5` en HuggingFace sugiere que se trata de un transformer de tipo decoder-only similar a la serie Qwen, pero no hay confirmación oficial por parte de NECTEC. El modelo se ha entrenado con un enfoque en el idioma tailandés, priorizando la comprensión de matices culturales y lingüísticos propios de Tailandia, lo que implica un ajuste fino sobre un modelo base probablemente multilingüe. No se han publicado detalles sobre el número de tokens de entrenamiento, composición del dataset ni métodos de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en tailandés con especial atención al contexto cultural tailandés.
- Comprensión de expresiones idiomáticas y referencias locales.
- Integración con capacidades multimodales en versiones hermanas (Pathumma-llm-vision), aunque este modelo concreto es solo texto.
- Soporte para uso mediante API y descarga directa para integración en aplicaciones.
- Probablemente compatible con técnicas de fine-tuning adicionales, dado que es de código abierto.
- No se especifican capacidades de tool calling, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- Atención al cliente en tailandés: el modelo puede gestionar conversaciones en el idioma local con comprensión de modismos y tratamientos de cortesía, reduciendo fricción en soporte de empresas tailandesas.
- Generación de contenido localizado: creación de artículos, guiones o publicaciones en redes sociales que respeten las referencias culturales y el tono adecuado para el público tailandés.
- Traducción asistida de tailandés a otros idiomas y viceversa, aprovechando su entrenamiento en el contexto local.
- Asistentes virtuales para servicios gubernamentales o educativos en Tailandia, donde la comprensión de dialectos y términos administrativos es crítica.
- Desarrollo de chatbots para aplicaciones móviles en el mercado tailandés, con despliegue en servidores propios gracias a su licencia Apache 2.0.
- Investigación académica sobre procesamiento de lenguaje tailandés, sirviendo como base para experimentos de fine-tuning o evaluación de modelos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4,54B parámetros, se estima un mínimo de 8-10 GB en FP16, y menos de 5 GB en cuantizaciones de 4 bits (si existieran, no confirmadas).
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM, como RTX 3060, RTX 4070, A10, A100 (para despliegue de producción).
- Sí cabe en GPUs de consumo (RTX 3090/4090) con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, dependiendo del formato de pesos y soporte de la arquitectura.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pathumma-llm-4b-4.0.0 | 4,54B | no disponible | Apache 2.0 | HuggingFace |
| Qwen3-4B (base) | 4B | 32K (aprox.) | Apache 2.0 | HuggingFace |
| Gemma-2-2B | 2B | 8K | Gemma license | HuggingFace |
| Llama-3.2-3B | 3B | 128K | Llama license | HuggingFace |

La comparativa es parcial porque no se dispone de datos de rendimiento ni de contexto de Pathumma. Su ventaja diferencial es el enfoque específico para tailand, mientras que las alternativas son multilingües generales.

## Limitaciones y advertencias

- Sesgos culturales: el modelo está entrenado principalmente con datos tailandeses, por lo que puede tener un rendimiento inferior en otros idiomas.
- Alucinaciones: como todo LLM, puede generar información falsa o no verificada, especialmente en dominios fuera de su entrenamiento.
- Contexto limitado: no se ha publicado la longitud máxima de contexto, lo que puede afectar a tareas que requieran memorias largas.
- Falta de transparencia: no se han publicado detalles del entrenamiento, datos utilizados ni procesos de alineación, lo que dificulta evaluar su seguridad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se han detallado patentes ni cláusulas adicionales.
- Producción: sin benchmarks ni pruebas de estabilidad, su uso en producción requiere una validación exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nectec/Pathumma-llm-4b-4.0.0
- Página oficial de NECTEC sobre Pathumma LLM: https://www.nectec.or.th/innovation/innovation-service/pathumma-llm.html
- Artículo en NSTDA (inglés): https://www.nstda.or.th/en/news/news-years-2025/pathumma-llm-ai-technology-tailored-to-thai-context-and-culture.html
- Nota de prensa en Thaitimes: https://thaitimes.com/nectec-unveils-pathumma-llm-thailand-s-open-ai-model-for-localized-and-multi-modal-applications
- Modelo de visión relacionado: https://huggingface.co/nectec/Pathumma-llm-vision-1.0.0
