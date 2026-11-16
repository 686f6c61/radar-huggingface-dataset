# hrm-labs/Qwen3.5-9B-Uncensored

## Resumen

Qwen3.5-9B-Uncensored es una variante sin censura del modelo Qwen3.5-9B de Alibaba Qwen, publicada por hrm-labs (con la model card atribuida a HauhauCS). Se trata de un modelo denso de 8.953.803.264 parámetros (aproximadamente 9B) que conserva la arquitectura y capacidades del modelo base, pero con los mecanismos de rechazo eliminados. El autor declara "0/465 refusals" y afirma que no hay pérdida de capacidades respecto al original.

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina atención lineal Gated DeltaNet con atención softmax completa en una proporción 3:1, sobre 32 capas. Soporta una ventana de contexto nativa de 262K tokens, extensible hasta 1M mediante YaRN, y es nativamente multimodal (texto, imagen y vídeo). Incluye soporte de predicción multi-token (MTP) y un vocabulario de 248K entradas.

La relevancia de esta ficha radica en que se distribuye principalmente en formato GGUF (con cuantizaciones desde BF16 hasta Q4_K_M) y un codificador visual separado (mmproj), lo que facilita su despliegue en entornos de inferencia local como llama.cpp, LM Studio, Jan o koboldcpp. La licencia Apache 2.0 del modelo base se mantiene, aunque la eliminación de rechazos tiene implicaciones éticas y de cumplimiento que conviene evaluar antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet (atención lineal) + atención softmax completa, ratio 3:1, 32 capas |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens nativos; extensible a 1M con YaRN |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q4_K_M (GGUF) |
| Idiomas soportados | Inglés, chino y multilingüe (el modelo base declara 201 idiomas; la model card lista en, zh, multilingual) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye mmproj separado para visión) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-9B: un transformer denso de 32 capas que intercala bloques de atención lineal Gated DeltaNet con bloques de atención softmax completa en proporción 3:1. Esta combinación busca reducir el coste computacional en contextos largos manteniendo la calidad de recuperación de información. Incorpora soporte de predicción multi-token (MTP) y un vocabulario de 248K tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base, más allá de lo que declare la documentación oficial de Qwen. Respecto al proceso de "uncensoring", la model card indica que no se modificaron datasets ni capacidades: se trata de una intervención orientada exclusivamente a eliminar los rechazos, presentada como "lossless". La variante Aggressive aplica una eliminación de rechazos más agresiva que una futura variante Balanced. No se detalla la metodología técnica exacta (fine-tuning, abliteration u otra).

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Modo thinking (razonamiento extendido) activado por defecto, y modo non-thinking alternativo.
- Capacidades matemáticas y de código heredadas del modelo base (no cuantificadas en la información disponible).
- Multimodalidad nativa: entrada de texto, imagen y vídeo mediante el codificador visual mmproj.
- Soporte de predicción multi-token (MTP) para acelerar la decodificación.
- Capacidades multilingües (el modelo base declara 201 idiomas; la model card lista inglés, chino y multilingüe).
- Eliminación de rechazos: no rechaza prompts, aunque puede añadir un descargo de responsabilidad breve al final de algunas respuestas (heredado del entrenamiento del modelo base, no constituye un rechazo).
- No se confirma en la información disponible soporte explícito de tool calling o function calling, ni de razonamiento agéntico multi-paso.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparándolo con el base para analizar qué información se filtra o se retiene.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas sensibles que el modelo base rechazaría, manteniendo las capacidades de generación del original.
- Procesamiento de documentos largos: gracias a su contexto nativo de 262K tokens (extensible a 1M con YaRN), puede resumir o extraer información de contratos, informes o corpus extensos en una sola pasada.
- Análisis multimodal local: con el codificador mmproj cargado en llama.cpp o LM Studio, puede describir imágenes o fotogramas de vídeo en flujos de trabajo offline, útil en entornos con requisitos de privacidad.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (5,3 GB) y Q6_K (6,9 GB) permiten ejecutar el modelo en GPUs consumer con 8-12 GB de VRAM mediante llama.cpp, LM Studio o koboldcpp.
- Evaluación comparativa de cuantizaciones: sirve como banco de pruebas para medir la degradación de calidad entre BF16, Q8_0, Q6_K y Q4_K_M en una arquitectura híbrida reciente.
- Asistencia conversacional en idiomas distintos del inglés: su vocabulario de 248K y soporte multilingüe permiten conversaciones en español y otros idiomas, aunque la model card solo lista explícitamente en y zh.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara "0/465 refusals" como métrica de eliminación de rechazos, sin cifras de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaños de archivo declarados): BF16 ~17 GB, Q8_0 ~8,9 GB, Q6_K ~6,9 GB, Q4_K_M ~5,3 GB; el codificador visual mmproj en BF16 ocupa ~880 MB adicionales.
- GPU recomendadas: para BF16, GPUs con 24 GB o más (RTX 3090/4090, A100, H100); para Q8_0, GPUs de 12-16 GB; para Q4_K_M, GPUs de 8 GB en adelante.
- Cabe en GPU consumer: sí, con cuantizaciones Q4_K_M y Q6_K en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.), siempre que se gestione el contexto; contextos de 128K o más requieren memoria adicional para la caché KV.
- Opciones de despliegue: llama.cpp, LM Studio, Jan, koboldcpp (según la model card); para producción de alto rendimiento, el autor del modelo base recomienda vLLM, SGLang o KTransformers.
- Latencia y throughput: no disponibles en la información proporcionada. Se advierte que es una arquitectura nueva (publicada el 2026-03-02) y que el soporte en llama.cpp es reciente, por lo que conviene usar builds actualizadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Uncensored (este) | ~9B densos | 262K (1M con YaRN) | Sí (texto, imagen, vídeo) | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-9B (base) | ~9B densos | 262K (1M con YaRN) | Sí | Apache 2.0 | Pesos originales en Hugging Face |
| Qwen3.5-4B-Uncensored (HauhauCS) | ~4B densos | No disponible | No disponible | No disponible | GGUF en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La diferencia principal entre este modelo y su base es la eliminación de rechazos, no la arquitectura ni el tamaño.

## Limitaciones y advertencias

- La eliminación de rechazos implica que el modelo puede generar contenido dañino, ilegal o éticamente problemático; no es adecuado para aplicaciones de cara al público sin filtros externos.
- Puede añadir descargos de responsabilidad breves al final de algunas respuestas, heredados del entrenamiento del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los LLM de esta escala.
- La model card solo lista explícitamente inglés y chino; el soporte de español y otros idiomas, aunque plausible por el vocabulario de 248K, no está verificado.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante sin censura puede incumplir políticas de plataformas, legislación sobre contenido o términos de servicio de proveedores; requiere revisión legal.
- Arquitectura muy reciente (2026-03-02): el soporte en herramientas de inferencia puede ser incompleto o inestable; se recomienda validar la build de llama.cpp.
- El contexto largo (262K-1M) incrementa sustancialmente el consumo de memoria de la caché KV; en GPUs consumer habrá que limitar la ventana efectiva.
- No se confirma soporte de tool calling ni de flujos agénticos, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hrm-labs/Qwen3.5-9B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante 4B: https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Repositorio de releases de HauhauCS: https://huggingface.co/HauhauCS
- Discord del autor: https://discord.gg/SZ5vacTXYf
