# Solel-io/Icarus-1

## Resumen

Icarus-1 es un modelo multimodal de tipo mixture of experts (MoE) desarrollado por Solel//ai, la división de inteligencia artificial de la empresa australiana Solel//io, especializada en servidores domésticos de código abierto. Forma parte de la Olympus Series, una línea de modelos diseñada específicamente para exprimir hardware de consumo: el modelo está dimensionado para llenar una tarjeta gráfica hasta el límite y desbordar el resto hacia la memoria del sistema sin que el rendimiento se desplome. Es un fine-tune del modelo Ornith-1.5-35B-A3B-heretic-ja, que a su vez se construye sobre Qwen3.5.

El modelo cuenta con aproximadamente 35.000 millones de parámetros totales, de los cuales solo unos 3.000 millones se activan por token gracias a su arquitectura MoE. Acepta entradas de texto e imágenes y genera texto, con una ventana de contexto de hasta 262.144 tokens (limitada en la práctica por la memoria disponible). Se distribuye exclusivamente en formato GGUF en tres cuantizaciones (Q3_K_M, Q4_K_M y Q5_K_M) junto con un proyector visual Q8_0, lo que lo orienta directamente a inferencia local con llama.cpp.

Su relevancia actual radica en que ofrece capacidades de chat, escritura, código, trabajo con agentes y lectura de imágenes en un único modelo que cabe en tarjetas gráficas de consumo de 16 a 24 GB, con licencia MIT y pesos abiertos. El ajuste fino se orientó a producir respuestas más conversacionales y naturales que el modelo base, manteniendo sus fortalezas en programación y tareas agénticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts (MoE) tipo transformer, multimodal (texto e imagen); construida sobre Ornith-1.5-35B-A3B, derivado de Qwen3.5 |
| Parametros totales | 34.660.610.688 (aproximadamente 35 mil millones) |
| Parametros activos | Aproximadamente 3 mil millones por token |
| Longitud de contexto | Hasta 262.144 tokens (en la practica, limitada por la memoria disponible) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M (modelo); Q8_0 (proyector visual) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (pesos abiertos); se conserva LICENSE-QWEN (Apache-2.0) por la base Qwen3.5 |
| Formato de pesos | GGUF (incluye mmproj-Q8_0.gguf para vision) |

## Arquitectura y entrenamiento

Icarus-1 emplea una arquitectura de mezcla de expertos en la que el modelo contiene alrededor de 35.000 millones de parámetros pero solo activa aproximadamente 3.000 millones por token procesado. Esta dispersión es la que permite que las partes del modelo que desbordan la VRAM hacia la memoria del sistema no penalicen la velocidad tanto como lo harían en un modelo denso del mismo tamaño. El modelo es multimodal: procesa texto e imágenes mediante un proyector visual separado (mmproj-Q8_0.gguf) y genera únicamente texto.

El entrenamiento consistió en un fine-tune del modelo OS-Software/Ornith-1.5-35B-A3B-heretic-ja, que a su vez deriva de Qwen3.5. El ajuste se orientó a obtener respuestas más conversacionales y realistas, conservando las capacidades del modelo base en programación y tareas de agente. La model card no especifica el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El modelo base incorpora el calificativo "heretic", y la model card indica que Icarus-1 presenta un comportamiento de rechazo mucho más ligero que su base.

## Capacidades

- Generación de texto conversacional con un tono más natural y realista que el modelo base, según el autor.
- Razonamiento y resolución de tareas de propósito general como modelo "todoterreno".
- Programación: el autor destaca que mantiene la inclinación del modelo Ornith hacia el código.
- Trabajo con agentes y tareas multi-paso, heredado del modelo base.
- Comprensión de imágenes (image-text-to-text) mediante el proyector visual Q8_0.
- Capacidades multilingües limitadas al inglés según la model card (idioma declarado: en).
- Ejecución local con llama.cpp, incluyendo la opción `--fit on` para repartir el modelo entre GPU y memoria del sistema.
- Comportamiento de rechazo reducido respecto al modelo base, orientado a uso adulto en hardware propio.

## Casos de uso

- Asistente conversacional local: el modelo puede mantener conversaciones multi-turno con un tono natural gracias a su ajuste conversacional y a una ventana de hasta 262.144 tokens, aunque la longitud efectiva dependerá de la memoria disponible en el equipo.
- Generación y revisión de código en un entorno local: su sesgo hacia programación y tareas agénticas permite integrarlo en flujos de trabajo de desarrollo sin enviar código a servicios en la nube.
- Análisis de imágenes en escritorio: con el proyector visual puede describir capturas, diagramas o documentos escaneados, útil en herramientas de accesibilidad o extracción de información.
- Automatización de tareas con agentes: su capacidad multi-paso permite encadenar acciones y usar herramientas en asistentes personales autoalojados.
- Servidor doméstico de productividad: redacción, resumen y edición de textos en un equipo propio, manteniendo las conversaciones dentro de la red local, que es el objetivo declarado de Solel//io.
- Prototipado y evaluación de modelos MoE multimodales: al distribuirse en GGUF con cuantizaciones de 16,76 a 24,73 GB, sirve para probar arquitecturas MoE de ~35B en GPUs de consumo.
- Despliegue en estaciones de trabajo con una sola GPU de 24 GB: la cuantización Q5_K_M está dimensionada para 24 GB de VRAM y 32 GB de memoria total, lo que permite ejecutarlo en configuraciones de gama alta de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (datos del autor):
  - Q3_K_M: 16,76 GB de archivo; dimensionado para GPU de 16 GB y 24 GB de memoria total (gráfica + sistema).
  - Q4_K_M: 21,17 GB de archivo; dimensionado para GPU de 20 GB y 28 GB de memoria total.
  - Q5_K_M: 24,73 GB de archivo; dimensionado para GPU de 24 GB y 32 GB de memoria total.
  - Proyector visual mmproj-Q8_0.gguf: 0,61 GB adicionales, necesario para imágenes.
- GPU recomendadas: el autor dimensiona las cuantizaciones para tarjetas de 16, 20 y 24 GB. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Cabe en GPU de consumo: sí, según los tamaños indicados (16 a 24 GB de VRAM), repartiendo el resto del modelo en memoria del sistema.
- Opciones de despliegue: llama.cpp mediante `llama-server -hf Solel-io/Icarus-1:Q4_K_M --fit on`; también integrado en Solel//os (Settings › Models). La model card no menciona vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que las partes del modelo que desbordan a la CPU cuestan menos velocidad que en un modelo denso, y que las tarjetas más pequeñas que el tamaño recomendado siguen funcionando con menos tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Icarus-1 | ~35B | ~3B | 262.144 | MIT | GGUF | Fine-tune multimodal de Ornith-1.5-35B-A3B |
| Ornith-1.5-35B-A3B-heretic-ja (base) | ~35B | ~3B | no disponible | MIT | no disponible | Modelo base del que deriva Icarus-1; construido sobre Qwen3.5 |
| Angel-1 (Solel//ai, Aether Series) | no disponible | no disponible | no disponible | no disponible | no disponible | Modelo "rápido" de la misma familia; el autor indica que Icarus arranca más lento y necesita más memoria |
| Dominion-1 (Solel//ai, Aether Series) | no disponible | no disponible | no disponible | no disponible | no disponible | Modelo "de uso diario" de la misma familia |
| Seraphim-1 (Solel//ai, Aether Series) | no disponible | no disponible | no disponible | no disponible | no disponible | Modelo insignia de la misma familia |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; no hay evidencia de soporte fiable de otros idiomas.
- Alucinación: el autor advierte explícitamente de que, como todo modelo de lenguaje, puede equivocarse con confianza y recomienda verificar cualquier dato relevante.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Comportamiento de rechazo reducido: Icarus-1 tiene un comportamiento de rechazo mucho más ligero que su modelo base y está pensado para adultos que lo ejecutan en su propio hardware; si se expone a otras personas, hay que añadir filtrado propio.
- Contexto: aunque se declaran 262.144 tokens, la ventana efectiva depende de la memoria disponible; las conversaciones largas requieren memoria adicional.
- Arranque y memoria: es más lento de iniciar y consume más memoria que la Aether Series del mismo autor.
- Licencia: los pesos son MIT, pero los nombres Solel, Solel//ai, Olympus Series e Icarus son marcas registradas de Solel//io y la licencia no cubre su uso; además se conserva la licencia Apache-2.0 de Qwen3.5 (LICENSE-QWEN).
- Formato: solo se distribuye en GGUF, por lo que el despliegue está orientado a llama.cpp y entornos compatibles; no hay pesos safetensors publicados en este repositorio.
- Responsabilidad: el autor declara que el usuario es responsable del uso que haga del modelo y de sus resultados.

## Enlaces

- Hugging Face: https://huggingface.co/Solel-io/Icarus-1
- Modelo base: https://huggingface.co/OS-Software/Ornith-1.5-35B-A3B-heretic-ja
- Ornith-1.5-35B-A3B (referenciado en la model card): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Angel-1 (Aether Series): https://huggingface.co/Solel-io/Angel-1
- Dominion-1 (Aether Series): https://huggingface.co/Solel-io/Dominion-1
- Seraphim-1 (Aether Series): https://huggingface.co/Solel-io/Seraphim-1
- Sitio web de Solel//io: https://solel.io
- GitHub de Solel//io: https://github.com/Solel-io
- Política de marcas: https://github.com/Solel-io/solel-os/blob/main/TRADEMARKS.md
