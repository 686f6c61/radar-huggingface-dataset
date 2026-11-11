# bartowski/ZoomGain-4B-GGUF

## Resumen

ZoomGain-4B es un modelo multimodal de tipo image-text-to-text desarrollado por inclusionAI, distribuido originalmente en Hugging Face bajo el identificador `inclusionAI/ZoomGain-4B`. La ficha que nos ocupa corresponde a la versión cuantizada en formato GGUF elaborada por bartowski, un publicador habitual de cuantizaciones para llama.cpp. El modelo acepta entradas de texto e imagen (esta última requiere el fichero auxiliar `mmproj`) y genera texto conversacional, con soporte declarado para tool calling y un modo de razonamiento explícito mediante etiquetas `<think>`.

El checkpoint original cuenta con aproximadamente 5.000 millones de parámetros según la model card, aunque el recuento real de pesos en safetensors es de 4.205.751.296 parámetros, lo que sitúa al modelo en la franja de los 4B. La versión GGUF publicada por bartowski ocupa 66,3 GB en el repositorio e incluye un amplio abanico de cuantizaciones, desde bf16 (8,42 GB) hasta Q3_K_M y formatos legacy, lo que permite desplegarlo en hardware de consumo.

La relevancia de esta ficha es doble: por un lado, documenta un modelo multimodal compacto con capacidades de razonamiento y herramientas; por otro, muestra el flujo habitual de cuantización con imatrix de llama.cpp (release b12180) para llevar un checkpoint de investigación a entornos de inferencia locales. La información pública disponible es limitada: no se especifican licencia, idiomas ni longitud de contexto en los metadatos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; detalles de la arquitectura no publicados en la información disponible) |
| Parametros totales | 4.205.751.296 (recuento real en safetensors); la model card indica 5B para el checkpoint fuente |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0, Q4_K_S, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M (lista parcial en la información disponible) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se han publicado en la información disponible detalles sobre la arquitectura interna del modelo base `inclusionAI/ZoomGain-4B`: no se especifica si emplea un transformer denso, una variante MoE, un esquema híbrido o un encoder visual concreto para el procesamiento de imágenes. La model card de la cuantización únicamente confirma que se trata de un modelo image-text-to-text con soporte de entrada de texto e imagen, y que la imagen requiere un fichero `mmproj` separado para funcionar en llama.cpp.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card sí indica que la cuantización se realizó con llama.cpp release b12180 y que se empleó imatrix, una técnica que calibra la cuantización con estadísticas de activaciones para preservar mejor la calidad en los pesos más sensibles. No se declara decodificación especulativa. El prompt format utiliza tokens estilo ChatML (`<|im_start|>`, `<|im_end|>`) con apertura explícita de bloque `<think>` en el turno del asistente, lo que sugiere un modo de razonamiento encadenado.

## Capacidades

- Generación de texto conversacional multi-turno con formato de chat ChatML.
- Comprensión de imágenes en combinación con texto (pipeline image-text-to-text), siempre que se cargue el fichero `mmproj` correspondiente.
- Razonamiento explícito mediante modo thinking, activado por la apertura `<think>` en el turno del asistente.
- Tool calling / function calling con un formato XML específico (`<tool_call>`, `<function=...>`, `<parameter=...>`), incluyendo la posibilidad de razonar en lenguaje natural antes de la llamada.
- Soporte de definiciones de herramientas en el mensaje de sistema mediante bloque `<tools>` con esquema JSON.
- Capacidades multilingües: no disponibles (no se especifican idiomas en la información proporcionada).
- No se documentan capacidades de audio ni de vídeo.

## Casos de uso

- Asistente conversacional local con entrada de imagen: el modelo permite adjuntar una imagen y formular preguntas sobre ella en un diálogo multi-turno, adecuado para prototipos de análisis documental o descripción de capturas en entornos sin conexión.
- Automatización de soporte técnico con acceso a herramientas: gracias al formato de tool calling documentado, puede integrarse en un orquestador que exponga funciones como consulta de estado de pedidos o precios de acciones, con razonamiento previo a la llamada.
- Extracción de información de documentos escaneados: combinando la entrada de imagen con prompts de extracción estructurada, puede emplearse en pipelines de digitalización de facturas o formularios.
- Agente de razonamiento multi-paso en local: el modo `<think>` permite generar cadenas de razonamiento antes de la respuesta final, útil para tareas de planificación o resolución de problemas en dispositivos con recursos limitados.
- Despliegue en estaciones de trabajo sin GPU dedicada: las cuantizaciones Q4_K_M (2,73 GB) e IQ4_XS (2,44 GB) permiten ejecutar el modelo en CPU con llama.cpp u Ollama, lo que facilita pruebas de concepto en portátiles.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece más de una docena de variantes (bf16, Q8_0, Q6_K, Q5_K, Q4_K, IQ4, Q3_K), lo que permite medir el impacto de la cuantización en calidad y latencia sobre un mismo modelo multimodal.
- Integración en aplicaciones de escritorio con llama.cpp: al ser GGUF compatible con endpoints, puede incrustarse en herramientas de escritorio que ya consumen la API de llama.cpp sin necesidad de infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con cuantizaciones Q4 (Q4_K_M: 2,73 GB; IQ4_XS: 2,44 GB); en torno a 3,3-3,9 GB con Q5_K y Q6_K; 4,5 GB con Q8_0; 8,4 GB con bf16. A estas cifras hay que sumar el fichero `mmproj` para el procesamiento de imágenes y el espacio de contexto KV cache.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM puede ejecutar las cuantizaciones Q4 y Q5 (RTX 3060, RTX 4060, RTX 4070). Para bf16 o Q8_0 se recomienda RTX 4090, A100 o H100, aunque el tamaño reducido del modelo hace que no sea necesario hardware de datacenter.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con 6 GB o más de VRAM usando cuantizaciones Q4/Q5; también en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (versión b12180 o superior, empleada para la cuantización), Ollama, y cualquier runtime compatible con GGUF. No se documenta soporte específico para vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles (no se publican mediciones en la información proporcionada).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, licencia, idiomas) que permitan una comparación rigurosa con alternativas de la misma categoría. La información disponible no identifica modelos comparables ni ofrece métricas de rendimiento del modelo base. Se indica, por tanto, "no disponible".

## Limitaciones y advertencias

- La licencia no está especificada en la información disponible, por lo que no puede confirmarse el uso comercial del modelo ni del checkpoint cuantizado.
- No se documentan los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otras lenguas distintas del inglés.
- No se publica la longitud de contexto, un dato crítico para planificar aplicaciones con conversaciones largas o documentos extensos.
- Al ser una cuantización, las versiones de baja precisión (Q3_K, IQ3_M) pueden degradar la calidad de forma notable, especialmente en tareas multimodales y de razonamiento; se recomienda Q4_K_M o superior para producción.
- El soporte de imagen requiere el fichero `mmproj` adicional; sin él, el modelo funciona únicamente como modelo de texto.
- No se dispone de información sobre sesgos, tasa de alucinación ni evaluaciones de seguridad del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria todavía inexistente.
- El formato de tool calling es específico (XML con etiquetas `<tool_call>` y `<function=...>`), por lo que requiere un parser adaptado y no es directamente compatible con esquemas OpenAI estándar sin traducción.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/bartowski/ZoomGain-4B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/inclusionAI/ZoomGain-4B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp empleada para la cuantización (b12180): https://github.com/ggml-org/llama.cpp/releases/tag/b12180
- Cuantización Q4_K_M (recomendada): https://huggingface.co/bartowski/ZoomGain-4B-GGUF/blob/main/ZoomGain-4B-Q4_K_M.gguf
