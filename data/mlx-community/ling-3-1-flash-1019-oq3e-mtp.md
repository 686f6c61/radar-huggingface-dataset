# mlx-community/Ling-3.1-flash-1019-oQ3e-mtp

## Resumen

Ling-3.1-flash-1019-oQ3e-mtp es un checkpoint cuantizado en formato MLX del modelo inclusionAI/Ling-3.1-flash-1019, publicado por la comunidad mlx-community el 27 de octubre de 2026. Se trata de un modelo de lenguaje de tipo mixture-of-experts híbrido con 572.120.680.768 parámetros totales (563,95B en el backbone y 8,17B en la cabeza MTP) y aproximadamente 25B parámetros activos por token, según los datos de safetensors y la model card del autor.

El modelo base, desarrollado por inclusionAI (el laboratorio del programa AGI de Ant Group), es una versión mejorada de Ling-3.1-flash orientada a razonamiento y capacidades agénticas, con una ventana de contexto de hasta 1.000.000 de tokens. Su arquitectura combina 63 capas de atención lineal KDA con 9 capas MLA con gating, más una capa MTP (NextN) que el runtime oMLX explota como decodificación especulativa Lightning MTP.

La relevancia de este checkpoint es práctica: reduce un modelo de más de 560B parámetros a 243,635 GiB de pesos con una media efectiva de 3,658 bits por peso, manteniendo licencia MIT. Está pensado exclusivamente para Apple Silicon con memoria unificada de gran capacidad, no para GPU NVIDIA, lo que lo convierte en una opción para despliegue local de un MoE de escala frontera en estaciones de trabajo Mac de gama alta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrido lineal: 63 capas KDA (atención lineal) + 9 capas MLA con gating + capa MTP (NextN); 512 expertos enrutados, 8 activos por token |
| Parámetros totales | 572.120.680.768 (572,12B): 563,946B backbone + 8,174B cabeza MTP |
| Parámetros activos | ~25B por token |
| Longitud de contexto | 1.000.000 tokens (según el modelo base Ling-3.1-flash) |
| Tipos de cuantización | Mixta oQ3e generada con oQ (oMLX v0.7.3rc1): affine 3-bit grupo 64 (95,716% de los pesos), affine 4-bit grupo 64 (1,408%), affine 8-bit grupo 64 (2,680%), affine 8-bit grupo 128 (0,190%), BF16 (0,007%) y FP32 residual; media efectiva 3,658 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`, requiere `custom_code`) |
| Tamaño del repositorio | 261,601 GB / 243,635 GiB |
| Modelo base | inclusionAI/Ling-3.1-flash-1019 (relación: quantized) |
| Fecha de publicación | 2026-10-27 |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido con mezcla de expertos: 63 capas de atención lineal KDA (Kimi Delta Attention) se alternan con 9 capas de atención MLA con gating, lo que reduce el coste de atención sobre contextos muy largos frente a un transformer denso equivalente. El enrutamiento selecciona 8 de los 512 expertos por token, de ahí que solo ~25B de los 572B parámetros se activen en cada paso. Incluye además una capa MTP (Multi-Token Prediction, estilo NextN), que en este checkpoint se conserva íntegra (4,367 GiB) y que oMLX ejecuta como decodificación especulativa Lightning MTP para aumentar el throughput sin cambiar la distribución de salida.

Sobre el entrenamiento del modelo base no se dispone del número de tokens, la composición del dataset ni el detalle de las fases de RLHF/DPO en la información proporcionada; la model card del autor solo indica que Ling-3.1-flash-1019 es una actualización de Ling-3.1-flash con mejoras en razonamiento y capacidades agénticas. La innovación técnica documentada en este checkpoint es el proceso de cuantización: oQ asigna bits por sensibilidad medida de cada capa, redondea cada grupo con una importance matrix (256 muestras x 512 tokens recogidas capa a capa a partir de los pesos FP8 originales) y aplica un refit ponderado por mínimos cuadrados de escala y sesgo. El resultado es una distribución muy asimétrica: el 95,7% de los pesos queda en 3 bits y solo un 2,7% se preserva en 8 bits, concentrado en las capas más sensibles.

## Capacidades

- Generación de texto y razonamiento: el modelo base incorpora un modo de pensamiento explícito (thinking) descrito por los medios que cubren Ling-3.1-flash.
- Capacidades agénticas: la model card del modelo base menciona mejoras específicas en tareas agénticas; el detalle concreto de soporte de tool calling no está documentado en la información disponible.
- Razonamiento multi-paso: orientado a tareas complejas de uso real, según la descripción del modelo base.
- Contexto largo: ventana de hasta 1.000.000 de tokens, adecuada para documentos y repositorios completos.
- Decodificación especulativa: la cabeza MTP incluida permite acelerar la generación en oMLX mediante Lightning MTP.
- Capacidades multilingües: no disponible (los idiomas no están listados en la información proporcionada).
- Visión y audio: no disponible; el pipeline declarado es únicamente `text-generation`.
- Ejecución local en Apple Silicon mediante MLX, con soporte de código personalizado (`custom_code`).

## Casos de uso

- Análisis de repositorios completos: con 1M de tokens de contexto, el modelo puede ingerir un árbol de código extenso y responder preguntas de arquitectura o dependencias sin trocear el repositorio en fragmentos que rompan el contexto entre ficheros.
- Agente de código en local: integrado en un bucle agéntico sobre MLX, permite refactorizaciones multi-fichero y ejecución de pasos encadenados manteniendo el estado de la tarea en la ventana de contexto.
- Asistencia jurídica o financiera sobre expedientes: el contexto de 1M tokens permite procesar contratos completos o varios informes anuales en una sola pasada, con los datos sin salir del equipo, algo relevante al ser un despliegue local.
- Atención al cliente multi-turno: conversaciones largas con historial completo en contexto y la licencia MIT permiten uso comercial sin negociación de términos.
- Síntesis de literatura científica: ingestión de decenas de papers y generación de resúmenes comparativos con referencias cruzadas dentro de la misma ventana de contexto.
- Etiquetado y destilación de datos: al ser un MoE de 25B activos, puede generar grandes volúmenes de datos sintéticos o anotaciones en una estación Mac con memoria unificada, sin coste por token en la nube.
- Asistentes privados on-premise: organizaciones que no pueden enviar datos a APIs externas pueden desplegar el modelo en hardware Apple controlado, con licencia MIT y sin telemetría de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los medios consultados mencionan que el modelo base publica puntuaciones autoinformadas, pero no se han facilitado las cifras, y este checkpoint cuantizado a 3,658 bits/peso no incluye ninguna evaluación que mida la degradación respecto al original en FP8.

## Requisitos de hardware

- Pesos en memoria: 243,635 GiB (261,601 GB) solo para los pesos. Es un mínimo absoluto, no una recomendación de despliegue.
- Memoria total estimada: por encima de los 256 GB de memoria unificada para contexto corto, sumando caché KV, buffers de atención y overhead del runtime; con ventanas de contexto muy largas el requisito crece de forma sustancial (cifra exacta de caché KV no disponible).
- Hardware viable: Apple Silicon con memoria unificada de 256 GB o más (por ejemplo, Mac Studio con M3 Ultra en configuración de 256 o 512 GB). No cabe en ningún Mac con 128 GB o menos.
- GPU de consumo: no es viable. Una RTX 4090 (24 GB) o cualquier GPU con 24-80 GB no puede alojar los pesos, y MLX no ejecuta sobre CUDA.
- GPU de datacenter: A100/H100 no son aplicables a este checkpoint MLX; para esos entornos habría que usar el modelo base en otro formato, cuyo soporte en vLLM/TGI/SGLang no está confirmado en la información disponible.
- Opciones de despliegue: `mlx-lm` como runtime base y oMLX (oQ) para aprovechar la cuantización mixta y la decodificación especulativa Lightning MTP. llama.cpp, vLLM y TGI no consumen pesos MLX sin conversión previa.
- Latencia y throughput: no disponibles. Cualquier cifra depende del ancho de banda de memoria del chip Apple, del contexto efectivo y de si se activa la decodificación especulativa MTP.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Formato y tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.1-flash-1019-oQ3e-mtp (este) | 572,12B / ~25B | 1M | MLX safetensors, 3,658 bits/peso, 243,6 GiB | MIT | Hugging Face (mlx-community), 0 descargas |
| Ling-3.1-flash-1019 (original) | 572,12B / ~25B | 1M | Pesos FP8 según la model card de la cuantización; tamaño no disponible | MIT | Hugging Face (inclusionAI) |
| Ling-3.1-flash | ~560B / ~25B | 1M | No disponible | MIT | Hugging Face (inclusionAI) |
| Ling-3.0-flash | 124B / 5,1B | No disponible | No disponible | No disponible | Hugging Face (inclusionAI) |

La comparación de rendimiento entre estas variantes no es posible con la información disponible: no hay benchmarks publicados para el checkpoint cuantizado ni cifras concretas para el modelo base en las fuentes consultadas. La diferencia medible y documentada es de eficiencia de almacenamiento: 243,6 GiB frente a un original en FP8 cuyo tamaño exacto no se especifica.

## Limitaciones y advertencias

- Cuantización agresiva: el 95,7% de los pesos está a 3 bits con grupo de 64. Aunque oQ prioriza capas sensibles, no hay ninguna evaluación publicada que cuantifique la pérdida en razonamiento, matemáticas o código respecto al FP8 original.
- Dependencia de plataforma: los pesos son MLX; no se ejecutan en CUDA ni en CPU convencional sin conversión. Esto limita el despliegue a hardware Apple Silicon.
- Requisito de memoria prohibitivo: 243,6 GiB de pesos implican máquinas de gama muy alta; no es un modelo para probar en un portátil.
- Riesgo de alucinación: inherente a los modelos de lenguaje y no medido en este checkpoint; el contexto de 1M tokens no elimina el riesgo en recuperación de información a larga distancia, cuya degradación no está documentada.
- Idiomas: no se especifica la cobertura lingüística; no se puede asumir un rendimiento homogéneo en castellano.
- Soporte de tool calling y de agentes: mencionado de forma genérica para el modelo base, sin especificación del protocolo ni de formato de herramientas.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar los términos del modelo base y de las dependencias de código personalizado (`custom_code` requiere `trust_remote_code`, lo que implica ejecutar código del repositorio).
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de la calidad del checkpoint.
- Contexto efectivo: la ventana de 1M tokens del modelo base no garantiza que este checkpoint la mantenga con la misma fidelidad tras la cuantización; no hay datos al respecto.

## Enlaces

- [Checkpoint en Hugging Face: mlx-community/Ling-3.1-flash-1019-oQ3e-mtp](https://huggingface.co/mlx-community/Ling-3.1-flash-1019-oQ3e-mtp)
- [Modelo base: inclusionAI/Ling-3.1-flash-1019](https://huggingface.co/inclusionAI/Ling-3.1-flash-1019)
- [Modelo predecesor: inclusionAI/Ling-3.1-flash](https://huggingface.co/inclusionAI/Ling-3.1-flash)
- [Repositorio de oQ / oMLX](https://github.com/jundot/omlx)
- [Pull request de Improved oQe Quantization](https://github.com/jundot/omlx/pull/4385)
- [Perfil de la organización mlx-community](https://huggingface.co/mlx-community)
- [Ling-3.1 en OpenLM.ai](https://openlm.ai/ling-3.1/)
- [Ling-3.1-flash en LLM Releases](https://www.llm-releases.com/models/ling-3-1-flash)
- [Ling-3.1-flash-1019 and Base Model Explained (LLMs Blog)](https://www.llms.blog/posts/ling-3-1-flash-1019-upgrade-base-model)
- [Ling-3.1-flash: Ant Group's 560B MoE, 25B Active (AI/TLDR)](https://ai-tldr.dev/models/ling-3-1-flash/)
