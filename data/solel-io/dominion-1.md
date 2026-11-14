# Solel-io/Dominion-1

## Resumen

Dominion-1 es un modelo multimodal de tipo image-text-to-text desarrollado por Solel//ai, la división de inteligencia artificial de Solel//io, una empresa australiana de servidores domésticos de código abierto. Se trata del modelo intermedio de la familia Aether Series, posicionado como el "todoterreno" de uso diario: más capaz que Angel (el modelo rápido) y menos potente que Seraphim (el modelo insignia). Está construido como un fine-tune de Qwen3.5-9B y añade un codificador visual para procesar imágenes además de texto.

El modelo resuelve el caso de uso de inferencia local en hardware de consumo: con aproximadamente 9.700 millones de parámetros (modelo de lenguaje más codificador visual) y un peso GGUF de 5,10 GB en cuantización IQ4_XS, está diseñado para ejecutarse en tarjetas gráficas de 8 GB con contexto moderado y de 12 GB o más para conversaciones largas y documentos. Su ventana de contexto declarada alcanza los 262.144 tokens, aunque en la práctica queda limitada por la memoria disponible.

Es relevante ahora porque combina capacidades multimodales, contexto largo y despliegue local mediante llama.cpp con una licencia de pesos abiertos que permite uso personal, investigación y docencia, así como uso comercial para organizaciones con ingresos anuales iguales o inferiores a un millón de dólares estadounidenses. No obstante, esa cláusula de umbral implica que no es un modelo de código abierto en sentido estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje Qwen3.5-9B más codificador visual); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (safetensors); la model card indica aproximadamente 9.700 millones incluyendo el codificador visual |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 262.144 tokens (en la práctica limitado por la memoria disponible) |
| Tipos de cuantizacion | IQ4_XS para los pesos; proyector visual en f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Solel model licence v1.1 (pesos abiertos, con umbral de ingresos para uso comercial) |
| Formato de pesos | GGUF (Dominion-1.IQ4_XS.gguf, Dominion-1.mmproj-f16.gguf); también incluye chat_template.jinja, tokenizer.json y config.json |

## Arquitectura y entrenamiento

Dominion-1 se construye sobre Qwen3.5-9B, un modelo de lenguaje de la familia Qwen publicada bajo licencia Apache-2.0, al que se añade un codificador visual y un proyector multimodal (mmproj) que permite la entrada conjunta de texto e imágenes. La información disponible no detalla la arquitectura interna del transformer base, el número de capas, la dimensión de los embeddings ni el tipo exacto de atención empleado. El pipeline declarado es image-text-to-text, con salida exclusivamente textual.

No se han publicado en la información disponible datos sobre el volumen de tokens de entrenamiento, la composición del dataset de fine-tune, ni si se emplearon técnicas de RLHF, DPO u otras etapas de alineación. La model card únicamente señala que el modelo presenta un comportamiento de rechazo más laxo que su modelo base, lo que sugiere una etapa de ajuste orientada a reducir las negativas, sin especificar la metodología. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: chat multi-turno, redacción, resúmenes y razonamiento cotidiano.
- Comprensión de imágenes: descripción de fotografías, lectura de capturas de pantalla y de páginas escaneadas, con respuesta en texto.
- Entrada multimodal combinada: permite adjuntar imágenes a los mensajes en clientes compatibles con la API de OpenAI.
- Razonamiento general de nivel cotidiano, aunque la propia model card lo sitúa por debajo de Seraphim en razonamiento difícil y conocimiento detallado.
- Capacidades multilingües limitadas al inglés según los metadatos del modelo.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262.144 tokens declarados) ejecutándose en una GPU de consumo, lo que permite mantener historiales extensos sin salir del hardware propio.
- Lectura de documentos escaneados: gracias al codificador visual, puede recibir páginas escaneadas o capturas y responder preguntas sobre su contenido, útil para digitalizar y consultar archivos personales o profesionales.
- Descripción y análisis de imágenes: apropiado para tareas de etiquetado, accesibilidad (generación de texto alternativo) o revisión de capturas de pantalla en flujos de soporte técnico.
- Resumen de reuniones y notas: con contexto amplio y capacidad de redacción, puede condensar transcripciones o documentos largos en resúmenes estructurados.
- Asistencia en escritura y corrección: útil para redactar borradores, reescribir textos y mejorar claridad en inglés, con despliegue en llama.cpp u Ollama.
- Procesamiento por lotes en CPU: aunque lento, puede ejecutarse sin GPU para tareas no urgentes de clasificación o extracción de texto a partir de imágenes.
- Entornos de investigación y docencia: la licencia permite uso gratuito en investigación y enseñanza, lo que facilita su empleo en laboratorios con presupuesto limitado y en prácticas sobre modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB de archivos en total (5,10 GB de pesos IQ4_XS más 0,92 GB del proyector visual f16); el consumo real de VRAM será algo superior por el contexto y los buffers de inferencia.
- GPU recomendadas: una tarjeta de 8 GB ejecuta el modelo con contexto moderado; 12 GB o más permiten conversaciones largas y documentos extensos. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Cabe en GPU de consumo: sí, según la model card, en tarjetas de 8 GB en adelante.
- Ejecución en CPU: posible, aunque lenta según el autor.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj` para el proyector visual, y clientes compatibles con la API de OpenAI. También se menciona integración en Solel//os. No se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dominion-1 (Solel//ai) | ~8,95 B en safetensors; ~9,7 B con codificador visual | Hasta 262.144 tokens | Texto e imagen | Solel model licence v1.1 (pesos abiertos, umbral de 1 M USD) | GGUF en Hugging Face |
| Angel-1 (Solel//ai) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Seraphim-1 (Solel//ai) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Qwen3.5-9B (Qwen) | ~9 B (modelo base) | no disponible | Texto | Apache-2.0 | Hugging Face |

La comparación con Angel-1 y Seraphim-1 se limita a su posición en la familia Aether Series (rápido, todoterreno e insignia respectivamente), ya que la información disponible no incluye sus especificaciones técnicas. Frente a Qwen3.5-9B, Dominion-1 añade capacidad visual y un comportamiento de rechazo más laxo, pero sustituye la licencia Apache-2.0 por una licencia con restricciones comerciales.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al derivar de Qwen3.5-9B, puede heredar los de su modelo base.
- Riesgo de alucinación: el autor advierte explícitamente de que el modelo puede equivocarse con confianza y recomienda verificar cualquier dato importante.
- Limitaciones de idioma: los metadatos solo declaran inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Restricciones de licencia: no es código abierto. El uso comercial solo es gratuito para organizaciones con ingresos anuales iguales o inferiores a 1 millón de dólares; por encima de ese umbral se requiere una licencia comercial que, según el autor, aún no se ofrece.
- Comportamiento de rechazo reducido: la model card indica que rechaza menos que su modelo base, por lo que en despliegues públicos es necesario añadir filtrado propio.
- Obligaciones de atribución: al compartir fine-tunes o derivados debe incluirse el aviso "Built on Dominion from the Aether Series by Solel//io, used under the Solel model licence v1.1", y los nombres comerciales están protegidos por la política de marcas.
- Contexto práctico: aunque se declaran 262.144 tokens, la ventana real queda limitada por la memoria de la GPU.
- Rendimiento: inferior a Seraphim en razonamiento difícil y conocimiento detallado, según el propio autor.
- Madurez: el modelo tiene pocas descargas (364) y ningún "like" en el momento de la consulta, lo que limita la evidencia comunitaria sobre su comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Solel-io/Dominion-1
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Angel-1 (familia Aether Series): https://huggingface.co/Solel-io/Angel-1
- Seraphim-1 (familia Aether Series): https://huggingface.co/Solel-io/Seraphim-1
- Sitio web de Solel//io: https://solel.io
- GitHub de Solel//io: https://github.com/Solel-io
- Política de marcas: https://github.com/Solel-io/solel-os/blob/main/TRADEMARKS.md
