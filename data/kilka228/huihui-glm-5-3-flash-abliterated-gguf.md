# Kilka228/Huihui-GLM-5.3-Flash-abliterated-GGUF

## Resumen

Huihui-GLM-5.3-Flash-abliterated-GGUF es una versión "abliterated" (sin rechazos) del modelo multimodal zai-org/GLM-5.3-Flash, publicada por el usuario Kilka228 siguiendo la estela del proyecto huihui-ai. El modelo base es un transformer multimodal de tipo image-text-to-text desarrollado por Zhipu AI (zai-org) con 320.759.404.382 parámetros totales (aproximadamente 320,8 mil millones), lo que lo sitúa en la categoría de modelos de gran escala. La variante abliterated elimina total o parcialmente los mecanismos de rechazo del modelo original mediante la técnica de abliteration, que identifica y neutraliza las direcciones de activación asociadas con la negativa a responder.

La relevancia de esta publicación radica en que ofrece una versión sin censura de un modelo multimodal de gran tamaño en formato GGUF, lo que permite su ejecución en llama.cpp con cuantizaciones que van desde Q4_K_XL hasta otras variantes. El modelo conserva las capacidades multimodales del original (procesamiento de imagen y texto) y está disponible bajo licencia MIT, lo que facilita su uso en investigación y experimentación. El repositorio ocupa 1559 GB en total, reflejando el tamaño considerable del modelo y la multiplicidad de cuantizaciones incluidas.

Es importante señalar que esta es una implementación de prueba de concepto ("crude, proof-of-concept implementation") según el propio autor, y que solo las capas 15 a 35 (indexación basada en 0) han sido ablacionadas, mientras que el resto de capas y todos los módulos expertos permanecen sin modificar. Esto implica que el comportamiento sin censura es parcial y no uniforme en toda la red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en GLM-5.3-Flash; presumiblemente MoE según los tags "glm5_next" y la mención a "expert modules" |
| Parametros totales | 320.759.404.382 (aproximadamente 320,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según el ejemplo de llama-cli con -c 262144) |
| Tipos de cuantizacion | GGUF en múltiples variantes (se menciona UD-Q4_K_XL; el repo incluye varias cuantizaciones, tamaño total 1559 GB) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer multimodal de tipo image-text-to-text desarrollado por Zhipu AI. Los tags "glm5_next" y la referencia explícita a "expert modules" en la model card sugieren una arquitectura de mezcla de expertos (MoE), aunque no se proporcionan detalles sobre el número de expertos, la estrategia de enrutamiento ni el número de parámetros activos por token. El modelo procesa tanto imágenes como texto, lo que lo capacita para tareas de visión-lenguaje.

La variante abliterated se ha generado aplicando la técnica de abliteration descrita en el repositorio remove-refusals-with-transformers, que consiste en identificar la dirección de activación asociada con los rechazos y proyectarla fuera de las matrices de pesos. En este caso, solo las capas 15 a 35 (indexación 0-based) han sido ablacionadas, dejando el resto de capas y todos los módulos expertos intactos. Los GGUF provienen de unsloth/GLM-5.3-Flash-GGUF y se ha actualizado el primer archivo de cada versión cuantizada para que solo sea necesario descargar el primero. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto (pipeline image-text-to-text), lo que permite tareas de descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Generación de código y matemáticas: como modelo de gran escala, se espera que conserve las capacidades del GLM-5.3-Flash original en estas áreas, aunque no se detallan en la información disponible.
- Soporte multilingüe limitado: únicamente inglés (en) y chino (zh) según los metadatos.
- Modo sin censura: la abliteration reduce los rechazos en las capas 15-35, permitiendo respuestas a solicitudes que el modelo original rechazaría.
- Compatibilidad con llama.cpp: oficialmente soportado por la última versión de llama.cpp, incluyendo la rama de unslothai para glm5next.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la abliteration en un modelo multimodal de gran escala, comparando las respuestas con y sin ablación en las capas 15-35 para analizar cómo se distribuyen los mecanismos de rechazo en la red.
- Experimentación con modelos multimodales sin censura en entornos controlados: investigadores pueden explorar los límites del modelo en tareas de visión-lenguaje sin las restricciones del original, siempre en entornos de laboratorio y con revisión manual.
- Pruebas de robustez y red-teaming: el modelo sirve como sujeto de prueba para evaluar la eficacia de filtros de seguridad externos y para desarrollar contramedidas frente a modelos sin alineación.
- Generación de descripciones de imágenes en inglés y chino: gracias a su pipeline image-text-to-text y su ventana de contexto de 262.144 tokens, puede procesar imágenes junto con instrucciones extensas para tareas de captioning detallado o análisis visual.
- Despliegue local con llama.cpp: al estar en formato GGUF y ser compatible con llama.cpp, puede ejecutarse en hardware local con cuantizaciones Q4_K_XL, facilitando la experimentación sin depender de infraestructura en la nube.
- Análisis de documentos extensos con componente visual: la ventana de 262.144 tokens permite procesar documentos largos que combinen texto e imágenes, aunque el soporte idiomático se limita a inglés y chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 320,8 mil millones de parámetros, incluso en cuantización Q4_K_XL se requiere aproximadamente 160-180 GB de VRAM (asumiendo ~4,5 bits por peso más overhead). Las cuantizaciones más altas superan los 200 GB.
- GPU recomendadas: para cuantizaciones Q4 en adelante se necesitan múltiples GPU de datacenter como A100 80GB (2-3 unidades), H100 80GB (2-3 unidades) o configuraciones con mayor número de GPU. No cabe en una sola GPU consumer.
- GPU consumer: no es viable en RTX 4090 (24 GB) ni en ninguna GPU consumer actual debido al tamaño del modelo. Se requeriría offloading masivo a RAM del sistema, con latencia muy elevada.
- Opciones de despliegue: llama.cpp (soporte oficial en la última versión y en la rama unslothai/llama.cpp glm5next/upstream), con el comando de ejemplo `llama-cli -m ... -c 262144`. No se mencionan vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Huihui-GLM-5.3-Flash-abliterated-GGUF | ~320,8 B | 262.144 | Si (image-text-to-text) | MIT | GGUF |
| zai-org/GLM-5.3-Flash (base) | ~320,8 B | no disponible | Si | no disponible | safetensors |
| unsloth/GLM-5.3-Flash-GGUF | ~320,8 B | no disponible | Si | no disponible | GGUF |

No se dispone de información sobre otros modelos comparables de la misma categoría (abliterated multimodales de gran escala) en la información proporcionada.

## Limitaciones y advertencias

- La abliteration es parcial: solo las capas 15 a 35 han sido ablacionadas, por lo que el modelo puede seguir rechazando solicitudes en función de qué capas se activen para cada petición.
- Riesgo elevado de contenido sensible o controvertido: el filtrado de seguridad se ha reducido significativamente, lo que puede generar respuestas inapropiadas, ofensivas o legalmente problemáticas.
- No apto para todos los públicos: los outputs pueden ser inadecuados para entornos públicos, menores de edad o aplicaciones que requieran alta seguridad.
- Responsabilidad legal y ética del usuario: el uso debe cumplir las leyes locales y los estándares éticos; el autor declina toda responsabilidad sobre las consecuencias.
- Uso recomendado solo para investigación y entornos controlados: se desaconseja su uso directo en producción o en aplicaciones comerciales de cara al público.
- Se recomienda monitorización en tiempo real y revisión manual de los outputs para evitar la difusión de contenido inapropiado.
- Sin garantías de seguridad por defecto: el modelo no ha pasado por optimizaciones de seguridad rigurosas.
- Limitación idiomática: solo inglés y chino, lo que excluye el castellano y la mayoría de lenguas.
- Tamaño prohibitivo para hardware consumer: requiere infraestructura de datacenter con múltiples GPU de alta gama.
- Implementación de prueba de concepto: el propio autor la describe como "crude, proof-of-concept", lo que implica posibles inconsistencias en el comportamiento.
- Riesgo de alucinación: inherente a los modelos de gran escala; no se han publicado evaluaciones específicas para esta variante.

## Enlaces

- Hugging Face: https://huggingface.co/Kilka228/Huihui-GLM-5.3-Flash-abliterated-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- GGUF original de unsloth: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Repositorio de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- llama.cpp (releases oficiales): https://github.com/ggml-org/llama.cpp/releases
- Rama de llama.cpp de unslothai para glm5next: https://github.com/unslothai/llama.cpp/tree/glm5next/upstream
- Ko-fi de huihui.ai: https://ko-fi.com/huihuiai
