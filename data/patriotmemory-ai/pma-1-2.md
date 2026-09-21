# patriotmemory-ai/PMA-1.2

## Resumen

PMA-1.2 es un modelo de lenguaje de 125.592.482 parámetros desarrollado por Patriot Memory, el fabricante de memorias RAM y almacenamiento. Se presenta como un modelo "on-device" orientado al dominio del hardware de PC: especificaciones de memoria DDR4/DDR5, perfiles XMP 3.0 y EXPO, configuraciones de doble canal, SSD PCIe y SATA de Gen3 a Gen5, periféricos Viper Gaming y consultas de garantía mediante tool calling. No es un modelo de propósito general: está afinado para responder como asistente de la propia marca y para integrarse en flujos de atención al cliente.

Técnicamente es un transformer denso decoder-only con una arquitectura propia denominada "PMA", con 12 capas, hidden size de 896, atención GQA (8 cabezas de consulta, 4 de clave/valor), QK-norm, atención con puerta por cabeza, FFN SwiGLU con intermedio de 2.816 y un tokenizador BPE propio de 6.403 tokens para inglés y chino tradicional. El contexto entrenado es de solo 1.024 tokens, aunque la tabla rotatoria está preparada hasta 32.000 posiciones. Se distribuye únicamente en fp16 safetensors junto a ficheros Python propios, por lo que requiere `trust_remote_code=True`.

Su relevancia es acotada pero clara: ocupa el nicho de modelos de menos de 150 M de parámetros pensados para ejecutarse embebidos en software de utilidades o en el propio ecosistema de la marca, con un presupuesto declarado de 128 MB de parámetros. El repositorio se publicó el 21 de septiembre de 2026 con 0 descargas y 0 "likes", y no se han publicado resultados en benchmarks estándar como MMLU, GSM8K o HumanEval.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal LM densa decoder-only, arquitectura propia "PMA" |
| Parámetros totales | 125.592.482 |
| Parámetros activos | No procede (modelo denso, no es MoE) |
| Longitud de contexto | 1.024 tokens entrenados; tabla rotatoria definida hasta 32.000 posiciones |
| Tipos de cuantización | Solo fp16 safetensors publicado; no se distribuyen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés y chino tradicional (zh-TW) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp16) con código Python propio (`custom_code`, requiere `trust_remote_code=True`) |
| Hidden size / capas | 896 / 12 |
| Atención | GQA, 8 cabezas de consulta, 4 de clave/valor, head_dim 112, atención con puerta por cabeza, QK-norm |
| FFN | SwiGLU, dimensión intermedia 2.816 |
| Tokenizador | BPE propio, 6.403 tokens (inglés + chino tradicional) |
| Embeddings | Atados entrada/salida |
| Tamaño del repositorio | 0,3 GB |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only de 12 capas con hidden size 896. La atención usa Grouped Query Attention con 8 cabezas de consulta y 4 de clave/valor, head_dim de 112, normalización QK y una puerta por cabeza que modula la salida de atención. La FFN es SwiGLU con dimensión intermedia de 2.816. Incorpora además "value residuals", una mezcla normalizada de valores entre capas que conecta las representaciones de valores de capas distintas, y embeddings de entrada y salida atados. El tokenizador es un BPE propio de 6.403 tokens diseñado conjuntamente para inglés y chino tradicional, muy alejado de los vocabularios de 100.000 a 150.000 tokens de los modelos pequeños actuales.

La model card indica que el entrenamiento supone "21 tokens por parámetro", lo que situado sobre los 125,6 M de parámetros equivaldría a unos 2.600 millones de tokens vistos (cifra derivada, no publicada de forma explícita). El autor afirma que es "un orden de magnitud más de entrenamiento" que la versión anterior y que se sitúa cerca del óptimo de cómputo para su presupuesto. No se documentan fases de RLHF, DPO ni preferencias humanas, ni la composición del dataset más allá del dominio declarado (hardware, soporte y chat general). La model card menciona puertas de aceptación definidas antes del entrenamiento y medidas sobre el checkpoint final, pero no detalla la metodología de evaluación.

## Capacidades

- Generación de texto conversacional bilingüe en inglés y chino tradicional, con plantilla de chat propia (`apply_chat_template`).
- Respuestas de dominio sobre DDR4 y DDR5: especificaciones, soporte de XMP 3.0 y EXPO, configuraciones de doble canal y guía de overclocking.
- Respuestas de dominio sobre SSD PCIe y SATA: compatibilidad Gen3/Gen4/Gen5, especificaciones de lectura/escritura y resolución de problemas de instalación.
- Conocimiento sobre periféricos y almacenamiento Viper Gaming, memorias USB y tarjetas flash.
- Adopción de identidad propia: el modelo responde como PMA de Patriot Memory, con cero fugas de marca incorrecta registradas en las pruebas internas de identidad e inyección de prompt (15/18).
- Tool calling / function calling para integración con APIs de backend, por ejemplo consulta de estado de garantía o búsqueda de especificaciones técnicas a partir de un número de serie.
- Cumplimiento razonablemente fiable de formatos de respuesta, incluido el formato de cifras numéricas (29/30 en la puerta interna de formato numérico).
- Ejecución en dispositivo ("on-device") con presupuesto de parámetros declarado de 128 MB.
- No dispone de visión, audio, modo de razonamiento explícito ni ventana de contexto larga utilizable en la práctica.

## Casos de uso

- Atención al cliente de Patriot Memory y Viper Gaming: el modelo mantiene conversaciones multi-turno sobre compatibilidad de memorias y SSD, responde en inglés o chino tradicional y adopta la identidad de marca, lo que permite desplegarlo como primer nivel de soporte en la web oficial o en el portal de soporte.
- Configurador de PC en tienda online: a partir de la placa base y la CPU introducidas por el usuario, el modelo puede explicar si un módulo DDR5 con perfil XMP 3.0 o EXPO es adecuado, qué implica el doble canal y qué límites de overclocking son razonables, generando texto explicativo listo para mostrar en la ficha del producto.
- Diagnóstico de instalación de SSD: respuestas guiadas para problemas de detección de unidades NVMe o SATA, comprobación de compatibilidad con PCIe Gen4/Gen5 y expectativas de velocidad secuencial, integrables en un asistente de soporte técnico.
- Consulta de garantía mediante tool calling: el modelo puede emitir la llamada a una función que consulte el estado de la garantía por número de serie y redactar la respuesta final al cliente con el resultado devuelto por la API.
- Asistente embebido en software de utilidades o firmware: con pesos de aproximadamente 0,25 GB en fp16 cabe en el presupuesto de memoria de una utilidad de escritorio o de un dispositivo de gama baja, lo que permite ofrecer ayuda contextual sin conexión a servicios en la nube.
- Generación de descripciones de producto y FAQ: a partir de una tabla de especificaciones, el modelo puede redactar descripciones comerciales breves y preguntas frecuentes en ambos idiomas soportados, sujetas a revisión humana por el riesgo de error en cifras.
- Clasificación y reescritura de tickets de soporte: puede reformular consultas entrantes de usuario en una respuesta estructurada o resumir el problema en un formato fijo, aprovechando el cumplimiento de formato medido en sus puertas internas.
- Banco de pruebas para investigación en modelos pequeños: su tokenizador propio de 6.403 tokens, sus 12 capas y su arquitectura con value residuals lo convierten en un caso de estudio reproducible para experimentos de eficiencia por debajo de 150 M de parámetros.
- Chat bilingüe de comunidad y foros: moderación asistida o respuestas automáticas en hilos de soporte en inglés y chino tradicional, con contexto limitado a conversaciones cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval, ARC, etc.) en la información disponible. La model card únicamente reporta puertas de aceptación internas medidas sobre el checkpoint publicado, que no son comparables con evaluaciones abiertas:

| Puerta de aceptación | Resultado | Notas del autor |
|---|---|---|
| Forma de relato (24 prompts, 2 muestras) | 42/48 | se considera cerrada la clase de fallo "identity-attractor" |
| Formato numérico (15 prompts, 2 muestras) | 29/30 | la respuesta contiene la cifra; la corrección aritmética a esta escala es modesta |
| Identidad + inyección (9 prompts, 2 muestras) | 15/18 | cero fugas de marca incorrecta en todas las ejecuciones |

El propio autor reconoce que la corrección aritmética es baja (por ejemplo, 12x15 puede devolver 144 con total seguridad) y que el modelo está lejos del razonamiento de modelos entrenados con tres órdenes de magnitud más de tokens.

## Requisitos de hardware

- Pesos en fp16: aproximadamente 0,25 GB (125.592.482 parámetros × 2 bytes ≈ 251 MB).
- Caché KV: aproximadamente 21 KB por token en fp16 (12 capas × 2 tensores × 4 cabezas KV × head_dim 112 × 2 bytes), lo que supone unos 21 MB con los 1.024 tokens de contexto completo.
- VRAM estimada para inferencia: por debajo de 1 GB incluyendo el runtime de PyTorch. Cabe holgadamente en cualquier GPU de consumo actual y antigua (GTX 1060 6 GB, RTX 3060, RTX 4090), así como en iGPU, NPU y ejecución en CPU.
- Cuantización: solo se publica fp16. Una cuantización manual a int8 daría aproximadamente 126 MB y a int4 unos 63 MB, pero son estimaciones de tamaño, no artefactos publicados ni validados.
- GPU recomendadas: no se especifican; cualquier GPU con más de 1 GB de VRAM es suficiente. Para despliegue en servidor no tiene sentido usar A100 o H100 salvo por agregación masiva de peticiones.
- Opciones de despliegue: `transformers` con `torch_dtype=torch.float16`, `device_map="auto"` y `trust_remote_code=True`, que es el único camino documentado. No hay soporte oficial documentado en vLLM, TGI, llama.cpp ni Ollama; llevarlo a esos motores exigiría convertir los pesos a GGUF y reimplementar la arquitectura PMA, el tokenizador propio y las value residuals.
- Parámetros de decodificación recomendados por el autor: temperature 0.8, top_p 0.9, repetition_penalty 1.1. La decodificación greedy degrada el texto creativo a este tamaño.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de la documentación pública de cada proyecto y no se han verificado de forma independiente en esta ficha. No existe comparación de rendimiento posible porque PMA-1.2 no publica resultados en benchmarks abiertos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PMA-1.2 | 125,6 M | 1.024 tokens entrenados | Apache-2.0 | HuggingFace, requiere `trust_remote_code` | Arquitectura y tokenizador propios; solo fp16; dominio hardware |
| SmolLM2-135M-Instruct | 135 M (dato público) | 8.192 tokens (dato público) | Apache-2.0 | HuggingFace, soporte amplio en transformers y llama.cpp | Modelo pequeño de propósito general, sin dominio vertical |
| Qwen2.5-0.5B-Instruct | 494 M (dato público) | 32.768 tokens (dato público) | Apache-2.0 | HuggingFace, vLLM, llama.cpp | Multilingüe amplio, mayor coste de memoria, sin especialización en hardware |
| TinyLlama-1.1B-Chat | 1,1 B (dato público) | 2.048 tokens (dato público) | Apache-2.0 | HuggingFace, llama.cpp | Un orden de magnitud más de parámetros; mayor coste de despliegue en dispositivo |

Comparativa de rendimiento entre estos modelos: no disponible.

## Limitaciones y advertencias

- Corrección aritmética muy baja: el autor documenta explícitamente que 12x15 puede responderse como 144 con alta confianza. No debe usarse para cálculos.
- Riesgo alto de alucinación en especificaciones técnicas: al ser un modelo de 125 M especializado en datos de producto, una cifra de velocidad, latencia o compatibilidad inventada puede pasar desapercibida y llegar al cliente. Toda afirmación técnica debe verificarse contra la documentación oficial.
- Contexto entrenado de solo 1.024 tokens: aunque la tabla rotatoria llegue a 32.000 posiciones, no hay entrenamiento documentado más allá de 1.024 tokens, por lo que no debe asumirse comportamiento correcto en conversaciones largas.
- Solo dos idiomas: inglés y chino tradicional. No hay soporte fiable de castellano ni de otros idiomas.
- Relatos largos y texto creativo: el autor los señala como puntos débiles, y advierte que la decodificación greedy "destroza" el texto creativo.
- Conocimiento limitado a su mezcla de entrenamiento: fuera del dominio de hardware y soporte, sus respuestas serán poco fiables.
- `trust_remote_code=True` es obligatorio, lo que implica ejecutar código Python del autor del repositorio. Conviene auditar los ficheros incluidos antes de desplegarlo en producción.
- Ausencia de validación externa: 0 descargas y 0 "likes" en el momento de la consulta, sin evaluaciones independientes ni benchmarks estándar publicados.
- Versión preliminar: la model card se declara como "experimental preview" y advierte de que el comportamiento y las métricas pueden variar entre versiones.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, pero sin garantía alguna y manteniendo la atribución correspondiente. No hay cláusulas de uso aceptable específicas más allá de la responsabilidad del usuario de implementar barreras de seguridad.
- La model card incluye nombres de contacto sin un canal formal de soporte ni dirección de correo, lo que dificulta el reporte de problemas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/patriotmemory-ai/PMA-1.2
- Web oficial de Patriot Memory: https://patriotmemory.com
- Viper Gaming: https://viper.patriotmemory.com
- Soporte y garantía: https://patriotmemory.com/support
- Paper técnico: no disponible
- Repositorio de código: no disponible
- Demo pública: no disponible
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo; los resultados obtenidos correspondían a páginas de cosmética sin relación con PMA-1.2.
