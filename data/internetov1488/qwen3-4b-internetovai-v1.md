# internetov1488/qwen3-4b-internetovai-v1

## Resumen

Qwen3-4B-InternetovAI v1 es un ajuste fino (fine-tune) del modelo `internetov1488/qwen3-4b-abliterated`, que a su vez deriva de la familia Qwen3-4B de Alibaba. Lo publica el usuario de HuggingFace `internetov1488` y su objetivo declarado en la model card es dotar al modelo de una "personalidad" propia llamada InternetovAI: autoidentificación con ese nombre, un estilo conversacional directo y ausencia de rechazos ante peticiones sensibles (la model card lo describe como "uncensored"). El idioma principal de entrenamiento y de uso es el ruso, con el inglés como secundario.

Técnicamente es un transformer decoder-only de 4.022.468.096 parámetros (dato leído directamente de los pesos en safetensors), lo que lo sitúa en la gama de 4B, apta para inferencia en GPUs de consumo con cuantización. El repositorio ocupa 8,1 GB y se distribuye en formato `safetensors` para `transformers`, con compatibilidad declarada con text-generation-inference y endpoints.

Su relevancia es limitada y muy específica: no aporta innovaciones de arquitectura ni resultados de benchmarks, y no declara licencia. Encaja en el nicho de modelos conversacionales en ruso sin filtros, con fines de experimentación, generación creativa o角色 de personaje, más que en entornos de producción con requisitos de cumplimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de la familia Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; la familia Qwen3-4B base trabaja con 32.768 tokens nativos, ampliables a 131.072 mediante YaRN (no confirmado para este fine-tune) |
| Tipos de cuantizacion | No disponibles en el repositorio; al ser safetensors en precisión completa, admite cuantización posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | Ruso (principal) e inglés |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Modelo base | internetov1488/qwen3-4b-abliterated |
| Tamaño del repositorio | 8,1 GB |
| Librería declarada | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B: un transformer decoder-only con normalización RMSNorm, atención con RoPE y tokenizador BPE multilingüe. No hay información publicada sobre cambios estructurales en este fine-tune, por lo que se asume que la topología es idéntica a la del modelo base. El predecesor inmediato, `qwen3-4b-abliterated`, es un modelo al que se le ha aplicado una técnica de "abliteración" (eliminación o atenuación de direcciones de activación asociadas al rechazo) para reducir las negativas del modelo ante determinadas peticiones.

Sobre el entrenamiento de este v1, la model card solo indica que se realizó un "дообучение" (ajuste adicional) sobre un dataset en ruso para conferir la personalidad InternetovAI. No se especifica el número de tokens, la composición del dataset, si hubo RLHF, DPO o SFT supervisado, ni hiperparámetros. No se documenta ninguna innovación técnica: ni decodificación especulativa, ni atención lineal, ni variantes híbridas. La model card incluye además fragmentos de código truncados y algún carácter fuera de lugar, lo que indica una publicación poco cuidada y difícil de reproducir.

## Capacidades

- Generación de texto conversacional en ruso, con el inglés como idioma secundario.
- Autoidentificación: el modelo responde que se llama InternetovAI, según la model card.
- Estilo de respuesta directo, sin registro administrativo o formal, según el autor.
- Comportamiento "uncensored": ausencia deliberada de rechazos ante temas sensibles.
- Generación de código y razonamiento básico heredados de la familia Qwen3-4B (no verificados en este fine-tune).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste de personalidad suele degradar estas capacidades respecto al modelo base.
- Capacidades de visión, audio o modo "thinking" explícito: no disponibles.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.

## Casos de uso

- Personajes conversacionales en ruso: el fine-tune está entrenado específicamente para mantener una identidad fija (InternetovAI), lo que lo hace adecuado para bots de rol o asistentes con personalidad definida en aplicaciones de entretenimiento.
- Generación creativa sin restricciones temáticas: escritura de ficción, narrativa o guiones que aborden temas que los modelos alineados rechazan, aprovechando el comportamiento "uncensored".
- Prototipado rápido en local: con 4B de parámetros y cuantización a 4 bits cabe en GPUs de consumo, lo que permite iterar en un portátil con GPU discreta sin coste de API.
- Traducción ruso-inglés informal: útil para textos coloquiales donde un registro neutro resultaría artificial, aunque sin garantías de calidad frente a modelos dedicados.
- Experimentación académica sobre abliteración: sirve como caso de estudio de cómo un ajuste de personalidad afecta al comportamiento y a la tasa de rechazos de un modelo base.
- Chat de soporte interno en ruso para equipos pequeños: desplegable con vLLM o TGI en una única GPU, siempre que no haya requisitos de cumplimiento ni datos personales.
- Generación de diálogos sintéticos en ruso: producción de datos conversacionales para aumentar datasets de entrenamiento, con revisión humana posterior obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y el repositorio registra 0 descargas y 0 "likes", por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

Estimaciones para un modelo de 4.022 millones de parámetros (no verificadas por el autor):

- VRAM en FP16/BF16: aproximadamente 8-9 GB solo para los pesos, más memoria para el contexto y el KV cache.
- VRAM en cuantización de 8 bits: aproximadamente 4,5-5,5 GB.
- VRAM en cuantización de 4 bits (GGUF Q4_K_M o AWQ): aproximadamente 2,5-3,5 GB, con margen para contexto largo.
- GPU recomendadas: NVIDIA A100 40 GB o H100 para servicio de alta concurrencia; RTX 4090, RTX 4080, RTX 3090 o RTX 4070 Ti para uso individual en FP16 o 8 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM si se usa cuantización de 4 bits; con 12-16 GB se puede trabajar en FP16 con contextos moderados.
- Opciones de despliegue: transformers (referencia del autor), vLLM y text-generation-inference por la compatibilidad declarada; llama.cpp, Ollama y LM Studio requieren convertir previamente los safetensors a GGUF.
- Latencia y throughput: no disponibles. En una RTX 4090 y cuantización de 4 bits cabe esperar órdenes de decenas de tokens por segundo en generación individual, pero es una estimación genérica para 4B, no un dato medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-InternetovAI v1 | 4,02B | No disponible | ru, en | No disponible | HuggingFace, 0 descargas |
| Qwen3-4B (base) | 4,02B | 32.768 tokens nativos / 131.072 con YaRN | Multilingüe (más de 100) | Apache 2.0 | HuggingFace, ampliamente desplegado |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (128K con YaRN) | Multilingüe | Qwen Research / Apache 2.0 según variante | HuggingFace, muy extendido |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Multilingüe (8 idiomas oficiales) | Llama 3.2 Community License | HuggingFace, muy extendido |
| Gemma-2-2B-it | 2,61B | 8.192 tokens | Multilingüe | Gemma Terms of Use | HuggingFace, muy extendido |

No hay datos de rendimiento de este fine-tune que permitan compararlo cuantitativamente con esas alternativas.

## Limitaciones y advertencias

- Ausencia de licencia: sin licencia declarada no hay autorización explícita de uso comercial, redistribución ni modificación; en la práctica el modelo es jurídicamente inutilizable en producción.
- Riesgo alto de alucinación: no se documenta ningún proceso de alineación posterior al ajuste de personalidad, y el ajuste sobre un modelo abliterado tiende a degradar la calibración.
- Repositorio sin tracción: 0 descargas y 0 "likes" implican ausencia de validación por parte de la comunidad y de informes de errores.
- Documentación insuficiente: la model card no detalla dataset, hiperparámetros, número de tokens ni proceso de evaluación; el ejemplo de código está truncado.
- Idiomas limitados: ruso e inglés únicamente; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Contexto no confirmado: no se especifica la longitud de contexto efectiva tras el fine-tune; algunos ajustes la reducen respecto al modelo base.
- Contenido sin filtros: el modo "uncensored" implica riesgo de generar contenido ofensivo, ilegal o dañino, y no es apto para aplicaciones orientadas al público sin capas adicionales de moderación.
- Posible pérdida de capacidades: los ajustes de personalidad sobre modelos pequeños suelen degradar el razonamiento, el tool calling y el seguimiento de instrucciones complejas.
- Trazabilidad dudosa: el repositorio muestra fecha de creación 2026-09-21, posterior a la fecha de consulta habitual, lo que sugiere metadatos poco fiables.
- Sin garantías de seguridad: no se ha publicado ninguna evaluación de sesgos, robustez frente a inyección de prompts ni comportamiento ante jailbreaks.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/internetov1488/qwen3-4b-internetovai-v1
- Modelo base: https://huggingface.co/internetov1488/qwen3-4b-abliterated
- Familia Qwen3 (origen de la arquitectura): https://huggingface.co/Qwen
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las búsquedas devolvieron únicamente páginas de una clínica médica rumana sin relación con el modelo.
