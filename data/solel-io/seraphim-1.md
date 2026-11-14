# Solel-io/Seraphim-1

## Resumen

Seraphim-1 es un modelo multimodal de tipo image-text-to-text desarrollado por Solel//ai, la división de inteligencia artificial de la empresa australiana Solel//io. Es el modelo insignia ("flagship") de la familia Aether Series y está construido como un fine-tune de Qwen/Qwen3.5-27B, que aporta la base lingüística y el codificador visual. El modelo acepta texto e imágenes como entrada y produce texto como salida, con una ventana de contexto declarada de hasta 262.144 tokens.

El modelo se distribuye principalmente en formato GGUF con cuantización IQ4_XS (14,80 GB) más un proyector visual en f16 (0,93 GB), lo que suma unos 15,7 GB en el repositorio. Está diseñado explícitamente para ejecutarse en una única GPU de consumo: una tarjeta de 24 GB es el ajuste cómodo, mientras que una de 16 GB puede cargarlo con contexto corto o descargando capas a la CPU. El objetivo declarado es ofrecer razonamiento complejo, escritura cuidada y comprensión detallada de imágenes y documentos en hardware propio.

Su relevancia actual radica en la combinación de tamaño (~26,9 mil millones de parámetros reales según safetensors), capacidades multimodales y despliegue local vía llama.cpp con API compatible con OpenAI. La licencia, no obstante, no es de código abierto: la Solel model licence v1.1 restringe el uso comercial gratuito a organizaciones con ingresos anuales iguales o inferiores a 1 millón de dólares estadounidenses.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje Qwen3.5-27B + codificador/proyector visual); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 mil millones; la model card indica ~27,8 mil millones incluyendo el codificador visual) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | Hasta 262.144 tokens (en la práctica limitado por la memoria disponible) |
| Tipos de cuantizacion | IQ4_XS (pesos publicados); proyector visual en f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Solel model licence v1.1 (open weights, no open source); uso gratuito para uso personal, investigación, docencia y organizaciones con ingresos anuales ≤ 1 M USD |
| Formato de pesos | GGUF (Seraphim-1.IQ4_XS.gguf, Seraphim-1.mmproj-f16.gguf); incluye chat_template.jinja, tokenizer.json, config.json |

## Arquitectura y entrenamiento

Seraphim-1 es un fine-tune del modelo Qwen/Qwen3.5-27B, que actúa como base con licencia Apache-2.0. La arquitectura subyacente es un transformer de unos 27 mil millones de parámetros al que se añade un proyector visual en precisión f16 para habilitar la entrada de imágenes. El pipeline declarado es image-text-to-text y el modelo se distribuye únicamente en formato GGUF orientado a llama.cpp, con cuantización IQ4_XS para los pesos principales.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación posteriores al fine-tune. La model card menciona únicamente que el modelo presenta un comportamiento de rechazo más laxo que su modelo base, lo que sugiere algún tipo de ajuste de alineación, pero no se detalla el método. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento de mayor profundidad que los otros modelos de la familia (Angel y Dominion), según el autor.
- Comprensión de imágenes: fotos, capturas de pantalla y páginas escaneadas, con capacidad de responder preguntas sobre ellas.
- Comprensión de documentos a partir de su representación visual (páginas escaneadas).
- Escritura cuidada y redacción elaborada.
- Conversación multi-turno (tag "conversational").
- Integración con clientes compatibles con la API de OpenAI a través de llama-server.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Análisis de documentos escaneados: el modelo puede recibir la imagen de una página y responder preguntas sobre su contenido, gracias al proyector visual f16 y a la ventana de contexto de hasta 262.144 tokens para documentos extensos.
- Asistencia en escritura técnica: redacción y revisión de textos largos con contexto amplio, aprovechando la orientación del modelo a "escritura cuidada" y razonamiento detallado.
- Procesamiento de capturas de pantalla en soporte técnico: interpretar capturas de errores o interfaces y generar explicaciones o pasos de resolución.
- Despliegue local en estación de trabajo con GPU de 24 GB: ejecución mediante llama-server con API compatible con OpenAI, integrable en herramientas internas sin enviar datos a la nube.
- Investigación y docencia: uso gratuito bajo la licencia para experimentación académica con modelos multimodales de ~27B en hardware de consumo.
- Análisis de imágenes en flujos de trabajo personales o de pequeña organización (por ejemplo, extracción de información de fotos o documentos) con requisito de privacidad, al ejecutarse en hardware propio.
- Prototipado de asistentes conversacionales multimodales: conversaciones multi-turno que alternan texto e imágenes usando el chat template incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~15,7 GB de archivos en total (14,80 GB de pesos IQ4_XS + 0,93 GB de proyector visual f16), más memoria para el contexto KV.
- GPU de 24 GB: ajuste cómodo, con margen para contextos largos (recomendación del autor).
- GPU de 16 GB: carga posible solo con contexto corto o descargando parte de las capas a la CPU.
- Despliegue: llama.cpp mediante `llama-server -m Seraphim-1.IQ4_XS.gguf --mmproj Seraphim-1.mmproj-f16.gguf`, con clientes compatibles con la API de OpenAI; también integrable en Solel//os.
- No se dispone de datos de latencia ni throughput.
- No se especifican modelos de GPU concretos (A100, H100, RTX 4090, etc.) más allá del requisito de VRAM indicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Seraphim-1 (Solel//ai) | ~26,9 B (safetensors) | 262.144 tokens | Texto + imagen → texto | Solel model licence v1.1 (no open source; umbral de 1 M USD) | GGUF en Hugging Face |
| Qwen3.5-27B (modelo base) | ~27 B (según denominación) | No disponible en la información proporcionada | Texto (base) | Apache-2.0 | Hugging Face |
| Angel-1 (Solel//ai) | No disponible | No disponible | No disponible | Solel model licence (según familia) | Hugging Face |
| Dominion-1 (Solel//ai) | No disponible | No disponible | No disponible | Solel model licence (según familia) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo puede equivocarse con confianza ("confidently wrong"); el autor recomienda verificar cualquier dato relevante.
- Comportamiento de rechazo más laxo que el modelo base: requiere filtrado propio si se expone a terceros.
- Soporte de idiomas limitado al inglés según la model card.
- La licencia no es de código abierto: el uso comercial gratuito solo cubre organizaciones con ingresos anuales ≤ 1 M USD; por encima se necesita licencia comercial, que el autor indica que aún no se ofrece.
- La licencia impone reglas de uso aceptable que se transmiten a los destinatarios de copias o derivados.
- Obligación de incluir el aviso de atribución "Built on Seraphim from the Aether Series by Solel//io, used under the Solel model licence v1.1." al compartir fine-tunes o derivados.
- Las marcas Solel, Solel//ai, Aether Series y Seraphim están protegidas y no cubiertas por la licencia de pesos.
- El contexto efectivo de 262.144 tokens depende de la memoria disponible; en GPUs de 16 GB se reduce drásticamente.
- Es más lento y consume más memoria que los otros modelos de la familia.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- Solo se publica cuantización IQ4_XS, lo que implica una pérdida de precisión respecto a los pesos originales del fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Solel-io/Seraphim-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Modelo Angel-1: https://huggingface.co/Solel-io/Angel-1
- Modelo Dominion-1: https://huggingface.co/Solel-io/Dominion-1
- Sitio web de Solel//io: https://solel.io
- GitHub de Solel//io: https://github.com/Solel-io
- Política de marcas: https://github.com/Solel-io/solel-os/blob/main/TRADEMARKS.md
- Licencia (en el repositorio): LICENSE.md
