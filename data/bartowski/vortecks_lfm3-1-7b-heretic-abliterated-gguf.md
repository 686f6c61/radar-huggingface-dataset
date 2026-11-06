# bartowski/Vortecks_LFM3-1.7B-Heretic-Abliterated-GGUF

## Resumen

Vortecks_LFM3-1.7B-Heretic-Abliterated-GGUF es la versión cuantizada en formato GGUF del modelo Vortecks/LFM3-1.7B-Heretic-Abliterated, un derivado del LFM3-1.7B de LiquidAI. El trabajo de cuantización lo ha realizado bartowski usando llama.cpp (release b11969) con calibración imatrix. Se trata de un modelo de 1.728.801.600 parámetros (aproximadamente 1,7B) orientado a despliegue en el edge y conversación, con soporte declarado para 16 idiomas.

El modelo base pertenece a la familia LFM3 (Liquid Foundation Models, tercera generación) de LiquidAI, diseñada para inferencia eficiente en dispositivos con recursos limitados. La variante "Heretic-Abliterated" indica que ha sido sometida a un proceso de abliteration (eliminación de direcciones de rechazo en el espacio de activaciones) para reducir las negativas del modelo a responder, lo que lo convierte en un modelo "uncensored" según las etiquetas del repositorio. Esta ficha cubre exclusivamente la distribución GGUF, no los pesos originales en safetensors.

La relevancia actual de esta ficha radica en que ofrece múltiples niveles de cuantización (desde bf16 de 3,47 GB hasta IQ4_XS de 1,00 GB) que permiten ejecutar un modelo conversacional multilingüe en hardware de consumo, con un formato de prompt compatible con tool calling y un modo de razonamiento explícito mediante etiquetas `<think>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta "liquid"; el modelo base LFM3 emplea arquitectura propia de LiquidAI, no confirmada en la información proporcionada) |
| Parametros totales | 1.728.801.600 (1,7B); la model card indica "2B (source checkpoint)" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0, Q4_K_S, IQ4_XS (imatrix) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (license: other; enlace a LICENSE del modelo base LiquidAI/LFM3-1.7B) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LFM3-1.7B de LiquidAI. Las etiquetas del repositorio incluyen "liquid" y "custom_code", lo que sugiere que el modelo requiere código personalizado para su carga en transformers y que emplea los componentes propietarios de la familia LFM de LiquidAI. No se especifica si se trata de un transformer convencional, un modelo de estado espacio (SSM), híbrido u otra variante. Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

Sobre el proceso específico de esta variante: "Heretic-Abliterated" indica una modificación por abliteration sobre el checkpoint LFM3-1.7B, orientada a eliminar los comportamientos de rechazo. La cuantización realizada por bartowski emplea llama.cpp b11969 con imatrix, lo que mejora la calidad de las cuantizaciones de baja precisión respecto a una cuantización sin calibración. La model card confirma que el modelo no usa decodificación especulativa ("Speculative decoding: no") y que la entrada es únicamente texto.

## Capacidades

- Generación de texto y conversación multi-turno, con formato de prompt ChatML adaptado (`<|im_start|>` / `<|im_end|>`).
- Modo de razonamiento explícito: el formato de prompt abre un bloque `<think>` en el turno del asistente.
- Soporte de tool calling / function calling mediante un bloque `<tools>` con definiciones JSON Schema en el mensaje de sistema.
- Capacidades multilingües declaradas para 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Comportamiento "uncensored" derivado de la abliteration, con menor tendencia a rechazar peticiones.
- Entrada únicamente de texto (sin visión ni audio).
- No se declaran capacidades específicas de agentes multi-paso más allá del soporte de herramientas.

## Casos de uso

- Asistentes conversacionales en dispositivos edge: con cuantizaciones de 1,00-1,12 GB (IQ4_XS, Q4_K_M), el modelo puede ejecutarse en portátiles, mini-PC y dispositivos con poca memoria, gestionando diálogos multi-turno con el formato ChatML documentado.
- Automatización de tool calling en local: el formato `<tools>` con JSON Schema permite integrar el modelo en flujos donde deba invocar funciones (por ejemplo, consultar precios de acciones como en el ejemplo de la model card) sin depender de APIs externas.
- Prototipado de agentes con razonamiento visible: el bloque `<think>` permite separar la traza de razonamiento de la respuesta final, útil para depurar pipelines de agentes y para aplicaciones que muestran el proceso al usuario.
- Aplicaciones multilingües de bajo coste: con soporte declarado para 16 idiomas, puede emplearse en traducción asistida, atención al cliente o generación de contenido en mercados con varios idiomas, desplegado en un único servidor modesto.
- Generación de texto creativo sin filtros: la variante abliterated está pensada para casos donde los rechazos del modelo base resultan un obstáculo (ficción, role-play, guiones), siempre con las advertencias de la sección de limitaciones.
- Inferencia en CPU con llama.cpp u Ollama: al distribuirse en GGUF, puede ejecutarse en equipos sin GPU mediante llama.cpp, lo que facilita entornos de desarrollo, pruebas y despliegues en hardware heterogéneo.
- Fine-tuning ligero o experimentación académica: el tamaño reducido (1,7B) y las múltiples cuantizaciones permiten iterar rápidamente en investigación sobre alineación, abliteration y comportamiento multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización (tamaños de fichero de la model card): bf16 3,47 GB; Q8_0 1,85 GB; Q6_K 1,52 GB; Q5_K_M 1,35 GB; Q4_K_M 1,12 GB; IQ4_XS 1,00 GB. A estos valores hay que sumar el espacio para el contexto KV cache, no cuantificado en estas cifras.
- GPU recomendadas: no disponibles de forma específica en la información proporcionada. Por tamaño, cualquier GPU con 4-8 GB de VRAM puede alojar las cuantizaciones Q4-Q8, incluyendo GTX 1660, RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q4 y Q5 en GPUs de 4 GB o más; la versión bf16 requiere al menos 4-5 GB libres.
- Opciones de despliegue: llama.cpp (versión b11969 o superior, usada para la cuantización), Ollama, y cualquier runtime compatible con GGUF. La etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints tipo API.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vortecks_LFM3-1.7B-Heretic-Abliterated-GGUF (este) | 1,7B | no disponible | lfm1.0 | GGUF | Variante abliterated, 16 idiomas, tool calling |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | lfm1.0 | safetensors | Modelo original sin abliteration ni cuantizar |
| Vortecks/LFM3-1.7B-Heretic-Abliterated | 1,7B | no disponible | lfm1.0 | safetensors | Checkpoint fuente de esta cuantización |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de otros fabricantes. La comparación se limita a los tres eslabones de la cadena de derivación del modelo.

## Limitaciones y advertencias

- La abliteration reduce los rechazos del modelo, lo que implica un mayor riesgo de generar contenido inapropiado, ofensivo o inseguro; no se recomienda su uso directo en producción orientada al público sin capas adicionales de moderación.
- Riesgo de alucinación inherente a un modelo de 1,7B: la capacidad de razonamiento y de conocimiento factual es limitada en comparación con modelos de mayor tamaño.
- No se dispone de información sobre la longitud de contexto, lo que impide planificar aplicaciones que dependan de ventanas largas.
- La licencia lfm1.0 es de tipo "other": es imprescindible revisar el texto completo en el enlace de licencia del modelo base antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- El modelo requiere código personalizado ("custom_code") para cargarse en transformers; la distribución GGUF evita esta dependencia solo si se usa mediante llama.cpp u Ollama.
- Solo admite entrada de texto; no hay visión ni audio.
- El rendimiento en idiomas distintos del inglés no está verificado con benchmarks en la información disponible, pese a la declaración de soporte para 16 idiomas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de calidad o estabilidad.
- La model card advierte que no se usa decodificación especulativa, lo que puede afectar al throughput en comparación con implementaciones optimizadas.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/bartowski/Vortecks_LFM3-1.7B-Heretic-Abliterated-GGUF
- Modelo base de la cuantización: https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- llama.cpp (release b11969 usada para cuantizar): https://github.com/ggml-org/llama.cpp/releases/tag/b11969
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp/
