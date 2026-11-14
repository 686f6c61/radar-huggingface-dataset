# Solel-io/Angel-1

## Resumen

Angel-1 es un modelo multimodal (texto e imagen) desarrollado por Solel//ai, la división de inteligencia artificial de Solel//io, una empresa australiana de servidores domésticos de código abierto. Es el modelo más pequeño de la familia Aether Series y el modelo por defecto de su sistema operativo Solel//os. Se trata de un ajuste fino (finetune) del modelo Qwen3.5-4B de Alibaba, al que se le ha añadido un codificador visual para aceptar entradas de imagen junto con texto.

El modelo está diseñado explícitamente para ejecutarse en hardware de consumo: tarjetas gráficas modestas, mini PC o portátiles convencionales. Con aproximadamente 4.200 millones de parámetros en formato safetensors y una cuantización GGUF IQ4_XS de 2,45 GB, el objetivo es ofrecer capacidades conversacionales y de descripción de imágenes sin depender de la nube. La ventana de contexto declarada alcanza los 262.144 tokens, aunque en la práctica está limitada por la memoria disponible en el equipo.

Su relevancia radica en la combinación de tres factores: licencia Apache-2.0, formato GGUF listo para llama.cpp y soporte multimodal nativo en un tamaño que cabe en 4 GB de VRAM. Esto lo posiciona como una opción para despliegues locales de asistentes con visión, aunque con las limitaciones propias de un modelo de su escala en razonamiento complejo, matemáticas y conocimiento factual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje Qwen3.5-4B + codificador visual) |
| Parámetros totales | 4.205.751.296 (aprox. 4,2 mil millones; la model card indica ~4,7 mil millones incluyendo el codificador visual) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 262.144 tokens (limitado en la práctica por la memoria del equipo) |
| Tipos de cuantización | GGUF IQ4_XS para los pesos; proyector visual en f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Angel-1.IQ4_XS.gguf, Angel-1.mmproj-f16.gguf); también config.json, tokenizer.json, chat_template.jinja |

## Arquitectura y entrenamiento

Angel-1 se construye sobre Qwen3.5-4B, un transformer denso de la familia Qwen3.5, mediante ajuste fino. A este modelo de lenguaje se le incorpora un proyector visual (mmproj) en precisión f16 que permite procesar imágenes y combinarlas con la entrada de texto, siguiendo el patrón habitual de los modelos image-text-to-text. El pipeline declarado en Hugging Face es `image-text-to-text`, y los pesos se distribuyen en formato GGUF para su uso con llama.cpp.

La información pública no detalla el volumen de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se aplicaron técnicas de RLHF o DPO. La model card menciona únicamente que el modelo presenta un comportamiento de rechazo (refusal) más laxo que su modelo base, lo que sugiere un ajuste orientado a reducir restricciones conversacionales, sin especificar la metodología. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, orientada a chat de uso diario.
- Comprensión de imágenes: descripción de fotografías, interpretación de capturas de pantalla y lectura de texto presente en imágenes (OCR aproximado).
- Resumen de contenido textual y de imágenes.
- Respuesta a preguntas cotidianas y de conocimiento general.
- Entrada multimodal combinada: texto e imagen en el mismo mensaje.
- Compatibilidad con clientes OpenAI-compatible a través de llama-server.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documenta modo de razonamiento (thinking mode), audio ni otras modalidades.

## Casos de uso

- Asistente local de escritorio: al ejecutarse con llama.cpp en un equipo con 4-6 GB de VRAM, puede gestionar conversaciones multi-turno y mantener la privacidad de los datos al no requerir conexión a la nube.
- Descripción y accesibilidad de imágenes: el modelo puede recibir una fotografía o captura y generar una descripción textual, útil para herramientas de accesibilidad o catalogación rápida de imágenes.
- Lectura de capturas de pantalla y documentos escaneados: gracias a la entrada image-text-to-text, puede extraer y resumir texto visible en pantallas o páginas escaneadas, adecuado para tareas de triaje documental.
- Resumen de conversaciones y correos: su contexto amplio declarado (hasta 262.144 tokens, sujeto a memoria) permite resumir hilos largos o documentos extensos en equipos con suficiente RAM/VRAM.
- Chatbot de atención al cliente de bajo coste: puede desplegarse en un mini PC o servidor doméstico para responder consultas frecuentes en inglés, con la ventaja de que los datos no salen de la infraestructura propia.
- Prototipado e integración en Solel//os: al ser el modelo por defecto del sistema operativo de Solel//io, sirve como base para desarrolladores que quieran construir asistentes locales sobre esa plataforma.
- Filtrado y clasificación de imágenes en pipelines locales: puede etiquetar o describir lotes de imágenes en un flujo automatizado sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,1 GB de archivos en total (2,45 GB de pesos IQ4_XS + 0,67 GB de proyector visual f16). Una GPU con 4 GB de memoria lo ejecuta con contexto corto; 6 GB o más permiten conversaciones más largas.
- GPU recomendadas: tarjetas de consumo con 4-6 GB o más de VRAM; también funciona en CPU, con mayor latencia.
- Cabe en GPU de consumo: sí, en modelos con al menos 4 GB de VRAM (por ejemplo, gamas de entrada y medias de NVIDIA/AMD con esa capacidad).
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj` para el proyector visual; clientes compatibles con la API de OpenAI. No se documentan otras opciones como vLLM o TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Angel-1 (Solel//ai) | ~4,2 B (safetensors) / ~4,7 B con codificador visual | Hasta 262.144 tokens | Texto + imagen | Apache-2.0 | GGUF en Hugging Face |
| Qwen3.5-4B (modelo base) | ~4 B | no disponible en la información | Texto | Apache-2.0 | Hugging Face |
| Dominion-1 (Solel//ai) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Seraphim-1 (Solel//ai) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La model card sitúa a Dominion-1 como modelo "de uso diario" y a Seraphim-1 como el modelo insignia de la familia, indicando que Angel-1 es más débil que ambos en razonamiento largo, matemáticas y conocimiento detallado. No se dispone de datos de benchmarks ni de especificaciones completas de esos modelos en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior a sus hermanos Dominion-1 y Seraphim-1 en razonamiento prolongado, matemáticas y conocimiento factual detallado.
- Riesgo de alucinación: la propia model card advierte de que puede equivocarse con confianza, por lo que debe verificarse cualquier dato relevante.
- Comportamiento de rechazo más laxo que el modelo base: requiere filtrado adicional si se expone a terceros.
- Idiomas: solo se declara soporte de inglés; el rendimiento en castellano no está garantizado ni documentado.
- Contexto: aunque se declaran 262.144 tokens, en la práctica está limitado por la memoria del equipo, por lo que contextos largos exigen hardware con suficiente RAM/VRAM.
- Licencia Apache-2.0 para los pesos, pero los nombres Solel, Solel//ai, Aether Series y Angel son marcas registradas de Solel//io y no están cubiertos por la licencia.
- Uso previsto para adultos en hardware propio; la responsabilidad sobre el uso y las salidas recae en el usuario.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/Solel-io/Angel-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo Dominion-1: https://huggingface.co/Solel-io/Dominion-1
- Modelo Seraphim-1: https://huggingface.co/Solel-io/Seraphim-1
- Sitio web de Solel//io: https://solel.io
- GitHub de Solel//io: https://github.com/Solel-io
- Política de marcas: https://github.com/Solel-io/solel-os/blob/main/TRADEMARKS.md
