# infosave/Arete-27B-Turbo-cmf

## Resumen

Arete-27B-Turbo-cmf es un fichero cuantizado a 4 bits del modelo NousResearch/Arete-27B, el post-entrenamiento que Nous Research realizó sobre Qwen3.8-27B. El autor del empaquetado, infosave, aplica sobre los pesos una cabecera propietaria denominada "turbo" que mantiene acotada la memoria de dispositivo en prompts largos, combinando atención exacta en las primeras filas con un mecanismo de campo lejano (far field) para el resto. El resultado se distribuye como un único fichero `.cmf` de 14,1 GB que se ejecuta con `cortiq`, un motor de inferencia escrito en Rust sin dependencias de Python ni de frameworks de machine learning.

La propuesta de valor es doble: por un lado, el modelo base de 27B parámetros con capacidades de razonamiento (hereda el modo thinking de la familia Qwen3.8); por otro, la tecnología de gestión de contexto largo que, según las mediciones del autor en una NVIDIA A40, reduce el pico de VRAM a 14,8 GB a 64 000 tokens (frente a 21,5 GB del mismo modelo sin la cabecera turbo) y sostiene la decodificación en torno a 27 tok/s donde el estándar cae a 16,2 tok/s. Es relevante para quienes necesitan procesar documentos extensos en GPUs de 16 GB o 24 GB sin renunciar a la precisión en datos críticos.

El modelo está pensado para generación de texto en inglés, ruso y chino, con licencia Apache 2.0. La innovación principal no reside en los pesos (que son los de Arete-27B) sino en la capa de gestión de memoria y atención que el autor superpone, y que incluye una patente en tramitación (No. 19/738,763).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.8-27B, sin cambios en los pesos); cabecera turbo de gestión de atención y memoria |
| Parámetros totales | 27 000 millones (27B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 64 000 tokens medidos; atención exacta hasta 8192 filas (4096 en GPU de 16 GB) |
| Tipos de cuantización | 4 bits con "ladder scales", solo texto (q4tp) |
| Idiomas soportados | inglés (en), ruso (ru), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cmf` (fichero único que incluye pesos, tokenizador y plantilla de chat) |

## Arquitectura y entrenamiento

Los pesos corresponden a NousResearch/Arete-27B, un post-entrenamiento de Qwen3.8-27B. La model card no detalla la composición del dataset de post-entrenamiento ni el número de tokens utilizados; esa información corresponde al modelo base y no se reproduce en el fichero cuantizado. La arquitectura subyacente es un transformer de 27B parámetros con modo de razonamiento (thinking) activable o desactivable mediante `--no-think`.

La aportación técnica del empaquetado es la cabecera turbo, que opera en tres frentes. Primero, un "techo fijo": las primeras 8192 filas del prompt (4096 en tarjetas de 16 GB) se leen con atención exacta en la GPU; las claves y valores de las filas posteriores salen de la tarjeta hacia RAM o SSD conforme se leen, y antes de las últimas 512 filas se construye el campo lejano capa a capa. El campo lejano conserva las primeras 4 filas y las últimas 1800 exactas, y comprime el resto en 32 puntos de referencia (landmarks) por cabeza, de modo que el coste por token deja de crecer con la longitud del texto. Segundo, un mecanismo de "filas exactas": cada fila se puntúa según lo que las capas hacen con ella y las 248 mejores se mantienen exactas, lo que permite recuperar contraseñas, códigos y datos plantados. Tercero, un esquema de "hilos cortos" que divide la atención en siete etapas pequeñas para ocupar toda la tarjeta, en lugar de un único hilo largo por cabeza que deja la mayor parte inactiva. Los pesos del scorer de filas se ajustaron sobre Qwen3.8-27B y se reutilizan sin modificar.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo thinking activable (por defecto) o respuesta directa mediante `--no-think`.
- Procesamiento de contexto largo: hasta 64 000 tokens medidos, con atención exacta en las primeras 8192 filas y campo lejano aproximado para el resto.
- Recuperación precisa de datos plantados en textos extensos: 5 de 5 aciertos en un test con pass key, código de acceso, contraseña y número de habitación en 100 000 caracteres.
- Resumen de documentos largos: el autor reporta un resumen correcto de un párrafo de Wikipedia de 100 000 caracteres (~24 600 tokens).
- Multilingüe en inglés, ruso y chino.
- Ejecución en GPU mediante Vulkan, DX12 y Metal; en CPU funciona como el modelo estándar (sin la aceleración turbo).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el fichero es solo texto).

## Casos de uso

- Análisis de documentación legal o contractual extensa: el modelo puede ingerir contratos de decenas de miles de tokens y localizar cláusulas concretas, gracias al mecanismo de filas exactas que preserva números de artículo, importes y fechas literales.
- Resumen de informes técnicos o artículos largos: con 64 000 tokens de contexto y decodificación sostenida a ~27 tok/s, es viable resumir papers o documentación interna de 50-100 páginas en una sola pasada sin truncar.
- Extracción de credenciales y datos sensibles en pipelines de auditoría: el test de 5 de 5 con contraseñas, códigos y pass keys demuestra que el modelo mantiene la exactitud en cadenas críticas, lo que lo hace apto para tareas de verificación documental donde un carácter erróneo invalida el resultado.
- Despliegue en estaciones de trabajo con GPU de 16 GB: con `CMF_GPU_VRAM_MB=15000` el fichero sella a 4096 filas y se mantiene en 14,3 GB, permitiendo atender prompts de 16 000-64 000 tokens en tarjetas consumer de gama alta (RTX 4080/4090) o profesionales de 16 GB.
- Procesamiento por lotes en servidores sin Python: al ejecutarse con `cortiq` (Rust, sin framework ML), se integra en entornos de producción con dependencias mínimas y arranque rápido, útil para servicios de generación de texto en contenedores ligeros.
- Asistencia en ruso o chino: para equipos que trabajan con documentación en esos idiomas, el modelo cubre las tres lenguas declaradas sin necesidad de modelos separados.
- Escenarios con RAM limitada y SSD rápido: la opción `--o1-spill` vuelca las filas del prompt a disco, permitiendo operar en máquinas donde los 13,2 GB de RAM necesarios a 64 000 tokens no están disponibles.

## Benchmarks y rendimiento

Mediciones del autor en NVIDIA A40 (48 GB) con Vulkan, `cortiq bench --core`, 60 tokens generados tras el prompt indicado. "Standard" es el mismo modelo sin la cabecera turbo.

| Prompt (tokens) | Primer token, s (standard) | Primer token, s (turbo) | Decodificación, tok/s (standard) | Decodificación, tok/s (turbo) | VRAM pico, GB (standard) | VRAM pico, GB (turbo) |
|---:|---:|---:|---:|---:|---:|---:|
| 1 000 | 5,1 | 5,1 | 28,2 | 27,8 | 13,3 | 13,3 |
| 4 000 | 20,1 | 20,0 | 27,3 | 27,5 | 13,7 | 13,7 |
| 16 000 | 92 | 115 | 24,0 | 27,0 | 15,2 | 14,8 |
| 32 000 | 223 | 221 | 20,9 | 27,0 | 17,2 | 14,8 |
| 64 000 | 612 | 443 | 16,2 | 27,2 | 21,5 | 14,8 |

En configuración de 16 GB (`CMF_GPU_VRAM_MB=15000` sobre la misma A40): sella a 4096 filas, VRAM 14,3 GB, primer token 107 s a 16 000 tokens, 217 s a 32 000 y 436 s a 64 000, decodificación ~27 tok/s.

Consumo de RAM del host durante la lectura del prompt: 4,4 GB a 16 000 tokens, 7,0 GB a 32 000 y 13,2 GB a 64 000, además de los pesos mapeados.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 13,3 GB para prompts cortos; 14,8 GB con la cabecera turbo hasta 64 000 tokens; 14,3 GB en configuración forzada de 16 GB. Sin turbo, el pico sube a 21,5 GB a 64 000 tokens.
- GPU recomendadas: NVIDIA A40 (única tarjeta en la que el autor reporta mediciones). Cualquier GPU con soporte Vulkan, DX12 o Metal y al menos 16 GB de VRAM debería poder ejecutar la configuración de 16 GB, aunque no hay mediciones publicadas en otras tarjetas.
- Cabe en GPU consumer: sí, en modelos de 16 GB o más (RTX 4080, 4090, 4060 Ti 16 GB) usando `CMF_GPU_VRAM_MB=15000`, según la configuración reportada; no hay cifras medidas en esas tarjetas.
- RAM del host: 4,4-13,2 GB adicionales según longitud del prompt; mitigable con `--o1-spill` hacia SSD.
- Opciones de despliegue: `cortiq` (CLI en Rust, instalable con `cargo install cortiq-cli`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.cmf` es específico de este runtime.
- Latencia y throughput: primer token de 5,1 s (1 000 tokens) a 443 s (64 000 tokens); decodificación estable en ~27 tok/s con turbo. En CPU el fichero funciona como el estándar, sin la aceleración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Arete-27B-Turbo-cmf | 27B | 64 000 (medido) | Apache 2.0 | `.cmf` / cortiq (Rust) | Cuantización 4 bits con cabecera turbo; 14,1 GB |
| NousResearch/Arete-27B | 27B | no disponible | no disponible en la información | safetensors (presumible, no confirmado) | Modelo base sin cuantizar; sin la gestión de memoria turbo |
| Qwen3.8-27B | 27B | no disponible | no disponible en la información | no disponible | Modelo original sobre el que se post-entrena Arete; arquitectura idéntica |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- El campo lejano solo se ejecuta en Vulkan, DX12 y Metal. En CPU el fichero se comporta como el modelo estándar, sin las ventajas de memoria y velocidad.
- Las mediciones se realizaron únicamente en una NVIDIA A40; no hay datos verificados en otras GPU, incluida la configuración de 16 GB.
- Más allá del umbral de sellado (8192 filas, o 4096 en 16 GB), el texto lejano es aproximado: la model card advierte que "lo que queda muy atrás se desvanece". Solo las 248 filas puntuadas como relevantes y las primeras 4 / últimas 1800 se conservan exactas.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas más allá del mecanismo de filas exactas para datos literales.
- Sesgos conocidos: no documentados en la información disponible. El ejemplo de respuesta incluido en la model card sobre un tema políticamente sensible sugiere que el modelo no aplica filtros de censura temática, lo que puede ser relevante para despliegues en jurisdicciones con restricciones de contenido.
- Idiomas: solo inglés, ruso y chino declarados; el castellano no figura entre los idiomas soportados.
- Licencia Apache 2.0 permite uso comercial, pero la cabecera turbo está sujeta a una solicitud de patente (No. 19/738,763); conviene revisar las implicaciones antes de un despliegue comercial a gran escala.
- Dependencia de un runtime propietario (`cortiq`) y de un formato cerrado (`.cmf`): no hay interoperabilidad con el ecosistema estándar (transformers, vLLM, llama.cpp).
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.

## Enlaces

- Fichero cuantizado: https://huggingface.co/infosave/Arete-27B-Turbo-cmf
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Repositorio del formato CMF: https://huggingface.co/infosave/cmf
- Runtime cortiq: https://github.com/infosave2007/cmf
- Modelo de referencia con la misma tecnología: https://huggingface.co/infosave/Qwen3.8-27B-Turbo-cmf
