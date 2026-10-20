# efficiencyx/Jun-LoRA-12B-Safetensor

## Resumen

Jun-12B Safetensor (v8) es un ajuste fino por LoRA del modelo Gemma 4 12B en su variante QAT (quantization-aware training) de Unsloth, publicado por el usuario efficiencyx. El repositorio contiene los pesos ya fusionados en bf16, no el adaptador, de modo que puede servirse directamente con transformers o vLLM sin pasos de merge. El objetivo declarado es doble: servir la personalidad "Jun" (etiquetas character y roleplay) y proporcionar un artefacto listo para ejecutarse en TPU dentro del cuaderno Colab del proyecto Jun OS.

El modelo tiene 11.959.730.176 parámetros (unos 11,96 B) y ocupa 22,3 GiB en bf16, lo que lo sitúa en la franja de 12B con pesos de precisión completa. El entrenamiento LoRA se aplicó únicamente sobre las 328 proyecciones de atención y MLP del modelo de lenguaje: los embedders de entrada de visión y audio del modelo base quedan intactos, igual que la plantilla de chat, que se conserva byte a byte. Por tanto, el ajuste afecta al comportamiento conversacional y de personaje, no a las capacidades multimodales del base.

Su relevancia práctica es acotada pero clara: es un ejemplo de flujo de trabajo LoRA → merge → despliegue en tres formatos (bf16, INT8 W8A8 y GGUF) con una ruta concreta para hardware TPU de gama baja (v5e-1 de 16 GB mediante la build INT8) y para GPU convencionales vía vLLM. La información pública disponible no incluye datos de entrenamiento, benchmarks ni evaluación de calidad del personaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (detalles de capas y atención no disponibles en la información proporcionada); el modelo base es multimodal image-text-to-text |
| Parametros totales | 11.959.730.176 (≈11,96 B) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible. El ejemplo de despliegue de la model card usa `--max-model-len 8192`, pero es un parámetro de servicio, no una especificación de contexto nativo |
| Tipos de cuantizacion | bf16 (este repositorio); INT8 W8A8 en el repo hermano; GGUF en el repo para llama.cpp/Ollama; el base es QAT q4_0 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | apache-2.0 (declarada en la model card; conviene verificar la licencia del modelo base) |
| Formato de pesos | safetensors (bf16 fusionado), 22,3 GiB de pesos, repo de 24,0 GB |
| Modelo base | unsloth/gemma-4-12B-it-qat-q4_0-unquantized |
| Configuracion LoRA | r 32, rsLoRA, alpha plegado a 181,02; PEFT 0.18.1; 328 proyecciones de atención y MLP |
| Pipeline | text-generation |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Gemma 4 12B en su checkpoint QAT publicado por Unsloth. Sobre él se entrenó un adaptador LoRA con rango 32 y escalado rsLoRA, cuyo alpha (181,02) se plegó en los pesos durante la fusión. El merge se realizó con PEFT 0.18.1 y cubre las 328 proyecciones de atención y MLP del modelo de lenguaje. No se modifican los embedders de entrada de visión ni de audio, ni la plantilla de chat del modelo base. La información disponible no detalla el número de capas, el tipo de atención ni si hay componentes híbridos o de atención lineal.

No se han publicado en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación adicionales como RLHF o DPO tras el ajuste LoRA. Tampoco se documenta el proceso de recolección de datos para el comportamiento de personaje. La innovación técnica destacable no está en la arquitectura sino en el empaquetado: tres artefactos derivados del mismo fine-tune (bf16 para vLLM/transformers, INT8 W8A8 para TPU v5e-1 de 16 GB y GGUF para llama.cpp/Ollama), lo que permite el mismo comportamiento en hardware muy distinto. La versión de la ficha es la v8; los cambios respecto a v7 se documentan en la model card del repositorio GGUF, no en este.

## Capacidades

- Generación de texto conversacional en inglés, con la personalidad y el estilo del personaje "Jun" adquiridos vía LoRA.
- Roleplay y character writing: es el caso de uso explícito de las etiquetas del repositorio (`character`, `roleplay`).
- Conversación multi-turno: hereda la plantilla de chat del modelo base sin modificaciones, por lo que mantiene el formato de turnos esperado por Gemma 4.
- Servicio compatible con vLLM (`vllm serve ... --served-model-name jun`) y con transformers.
- Despliegue en TPU: la build bf16 requiere una v6e-1 de 32 GB; la build INT8 está pensada para v5e-1 de 16 GB.
- Capacidades multimodales del base (visión y audio): los embedders no se han tocado, pero el ajuste no las entrena y la model card no las documenta como prestación del modelo fusionado; no se debe asumir que funcionen igual que en el base.
- Tool calling / function calling: no documentado en la información disponible.
- Modo de razonamiento explícito (thinking): no documentado.
- Capacidades multilingües: limitadas al inglés según el campo `language`.

## Casos de uso

- Roleplay y narrativa interactiva: el ajuste está entrenado específicamente para dar vida a un personaje con voz propia; su uso típico es un chatbot de ficción con historial de conversación largo, servido con vLLM para soportar varias sesiones concurrentes.
- PNJ (NPC) en videojuegos y prototipos: al ser un modelo de ~12 B en bf16 con plantilla de chat intacta, se puede integrar como servicio de diálogo detrás de un motor de juego, generando respuestas coherentes con el personaje sin reentrenar el base.
- Asistentes con personalidad de marca: empresas que necesitan un tono de voz muy definido pueden partir de este merge y ajustar de nuevo sobre él, ya que los pesos están en safetensors estándar y son compatibles con PEFT.
- Prototipado en Google Colab sobre TPU: el proyecto Jun OS sirve exactamente este repositorio cuando corre en TPU; sirve para experimentar con un 12B sin GPU propia, usando v6e-1 (32 GB) o v5e-1 con la build INT8.
- Evaluación comparativa de técnicas de merge: al existir versiones bf16, INT8 W8A8 y GGUF del mismo fine-tune, es un caso útil para medir la degradación de calidad percibida entre formatos en una tarea subjetiva como el roleplay.
- Generación de guiones y diálogos para contenido de ficción: con prompts de sistema que fijen el personaje, se pueden producir borradores de escenas multi-turno por lotes mediante la API de vLLM.
- Base para investigación sobre ajuste LoRA de bajo rango: la configuración (r 32, rsLoRA, alpha 181,02, 328 módulos) es un punto de partida reproducible para estudiar el efecto del rango y del alpha en modelos de ~12 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni evaluaciones de calidad de roleplay, y tampoco hay cifras de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: 22,3 GiB solo de pesos, más KV cache y overhead del runtime; en la práctica se necesita por encima de 24 GB para contextos cortos.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB. Una RTX 4090 o RTX 3090 de 24 GB queda al límite y no admite contextos largos en bf16 con comodidad.
- CPU/GPU de gama de consumo: no cabe en tarjetas de 8, 12 o 16 GB en bf16; para esos casos hay que usar la build GGUF con cuantización o la build INT8 W8A8.
- TPU: v6e-1 con 32 GB ejecuta la versión bf16; v5e-1 con 16 GB requiere el repositorio INT8.
- Opciones de despliegue: vLLM (comando documentado en la model card), transformers, llama.cpp u Ollama con el repo GGUF, y el entorno TPU del proyecto Jun OS.
- Latencia y throughput: no disponibles. El único parámetro de servicio documentado es `--max-model-len 8192`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| efficiencyx/Jun-LoRA-12B-Safetensor (v8) | 11,96 B | No disponible | safetensors bf16 | apache-2.0 | Este repositorio; pesos fusionados |
| efficiencyx/Jun-LoRA-12B-Safetensor-INT8 | 11,96 B (mismo fine-tune) | No disponible | safetensors INT8 W8A8 | apache-2.0 | Pensado para TPU v5e-1 de 16 GB |
| efficiencyx/Jun-LoRA-12B-GGUF | 11,96 B (mismo fine-tune) | No disponible | GGUF | apache-2.0 | Para llama.cpp y Ollama |
| efficiencyx/Jun-LoRA-12B-Safetensor-v7 | 11,96 B | No disponible | safetensors bf16 | apache-2.0 | Generación anterior |
| unsloth/gemma-4-12B-it-qat-q4_0-unquantized | ~12 B | No disponible | safetensors | No disponible en esta información | Modelo base sin el ajuste de personaje |

No se dispone de datos verificables de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con modelos de otros autores en la misma franja de 12 B; esa comparación figura como no disponible.

## Limitaciones y advertencias

- El ajuste está orientado a un personaje concreto ("Jun"); fuera de ese registro, la calidad conversacional general puede degradarse respecto al modelo base.
- Solo declara inglés como idioma soportado: el rendimiento en castellano no está documentado y no debería asumirse.
- No hay evaluación de seguridad, sesgos ni tasas de alucinación publicada para este fine-tune. Un modelo de roleplay sin filtros documentados puede producir contenido inapropiado si no se acompaña de moderación en producción.
- Los embedders de visión y audio se conservan del base pero no se han entrenado; la model card no garantiza que las capacidades multimodales funcionen correctamente tras el merge.
- Licencia declarada apache-2.0 en la model card, pero al derivar de un modelo Gemma conviene verificar los términos del modelo base antes de un uso comercial.
- No se documenta la longitud de contexto nativa; el valor 8192 del ejemplo de vLLM es una configuración de servicio y no debe tomarse como límite del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes independientes de calidad.
- Los resultados de la búsqueda web asociados a esta consulta no contienen información técnica relevante sobre el modelo (son páginas de contenido para adultos sin relación), por lo que no se han utilizado como fuente.

## Enlaces

- Repositorio principal (safetensors bf16): https://huggingface.co/efficiencyx/Jun-LoRA-12B-Safetensor
- Repositorio INT8 W8A8 para TPU: https://huggingface.co/efficiencyx/Jun-LoRA-12B-Safetensor-INT8
- Repositorio GGUF (incluye los cambios de la v8): https://huggingface.co/efficiencyx/Jun-LoRA-12B-GGUF
- Repositorio de la generación anterior (v7): https://huggingface.co/efficiencyx/Jun-LoRA-12B-Safetensor-v7
- Modelo base: https://huggingface.co/unsloth/gemma-4-12B-it-qat-q4_0-unquantized
- Proyecto Jun OS (cuaderno Colab para TPU): https://github.com/efficiencyx/JunOS
