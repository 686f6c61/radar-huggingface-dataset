# ailexleon/Hemmingway-1-mlx-4Bit

## Resumen

Hemmingway-1-mlx-4Bit es una conversión al formato MLX del modelo Altworld/Hemmingway-1, publicada por el usuario ailexleon. Se trata de una cuantización a 4 bits pensada para ejecutar inferencia local sobre Apple Silicon mediante la librería mlx-lm (versión 0.31.3), lo que la convierte en una vía práctica para probar un modelo de 26.895.993.856 parámetros en equipos de sobremesa y portátiles Mac con memoria unificada amplia.

El repositorio no aporta información sobre el entrenamiento del modelo original: la model card se limita a documentar el proceso de conversión y el uso con mlx-lm. La etiqueta `qwen3_5` asociada al repositorio sugiere que la arquitectura subyacente pertenece a la familia Qwen3.5, aunque este extremo no se confirma en la documentación disponible. Tampoco se detallan la longitud de contexto, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

Su relevancia es fundamentalmente práctica: permite ejecutar un modelo de ~27.000 millones de parámetros en 4 bits sobre hardware de Apple sin necesidad de GPUs dedicadas, con un peso en disco de 15,2 GB. El único rasgo de configuración documentado es que el parámetro `reasoning_effort` viene fijado por defecto en `medium`, lo que indica que el modelo base incorpora un modo de razonamiento con esfuerzo ajustable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; la etiqueta `qwen3_5` del repositorio apunta a la familia Qwen3.5 |
| Parámetros totales | 26.895.993.856 (~26,9 mil millones) |
| Parámetros activos | No disponible (no se indica si se trata de un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4 bits en formato MLX; el repositorio no ofrece otras precisiones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |
| Modelo base | Altworld/Hemmingway-1 |
| Biblioteca de inferencia | mlx-lm 0.31.3 |
| Tamaño del repositorio | 15,2 GB |
| Modalidad | text-generation, conversacional |
| Fecha de publicación | 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de la etiqueta `qwen3_5` incluida en los metadatos del repositorio, que apunta a la familia Qwen3.5. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni las fases de ajuste (SFT, RLHF o DPO). La única referencia técnica concreta es que el modelo admite un parámetro `reasoning_effort` con valor por defecto `medium`, lo que implica la existencia de un modo de razonamiento configurable en el modelo original.

La innovación relevante de este repositorio es la conversión a MLX realizada con mlx-lm 0.31.3, que transforma los pesos originales a un formato optimizado para la memoria unificada de los chips de Apple y los cuantiza a 4 bits. Esta cuantización reduce el peso del modelo hasta los 15,2 GB del repositorio, a costa de una pérdida de precisión numérica no cuantificada en la documentación.

## Capacidades

- Generación de texto conversacional multi-turno, tal como indica la etiqueta `conversational` y el soporte de `chat_template` en el tokenizador.
- Razonamiento configurable mediante el parámetro `reasoning_effort`, con valor por defecto `medium` en esta conversión.
- Ejecución de inferencia local en Apple Silicon a través de mlx-lm.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede cargarse con `mlx_lm.load` y mantener conversaciones multi-turno aplicando la plantilla de chat del tokenizador, sin enviar datos a servicios externos.
- Prototipado y evaluación de modelos de ~27.000 millones de parámetros sin GPU: la versión 4 bits permite probar el comportamiento del modelo base Altworld/Hemmingway-1 en un portátil o sobremesa Apple antes de decidir un despliegue en servidor.
- Generación de texto en inglés para documentación técnica: al estar entrenado únicamente en inglés, es adecuado para redactar y resumir contenido técnico en ese idioma.
- Tareas de razonamiento con esfuerzo controlado: el parámetro `reasoning_effort` permite ajustar el equilibrio entre profundidad de razonamiento y coste de cómputo, útil para experimentos comparativos.
- Desarrollo de aplicaciones de escritorio con inferencia embebida: al funcionar sobre MLX, puede integrarse en herramientas macOS que requieran un modelo generativo local sin dependencias de red.
- Base para ajuste fino o cuantizaciones alternativas: los pesos en safetensors MLX sirven como punto de partida para convertir a GGUF o para otros pipelines de cuantización.
- Evaluación comparativa de la familia Qwen3.5: si se confirma la arquitectura sugerida por la etiqueta, el modelo permite estudiar el comportamiento de esa familia en un rango de 27.000 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13,5-14 GB solo para los pesos en 4 bits, más la caché KV y el overhead de la librería; el repositorio ocupa 15,2 GB en disco.
- Memoria unificada recomendada: 24 GB o más para trabajar con comodidad; 16 GB es un límite ajustado que deja poco margen para contextos largos y otras aplicaciones.
- Hardware compatible: exclusivamente Apple Silicon (series M1, M2, M3 y M4), ya que mlx-lm no se ejecuta sobre GPUs NVIDIA o AMD.
- Equipos recomendados: Mac con chip M Max o Ultra y 32-64 GB de memoria unificada; los modelos M Pro con 24 GB pueden funcionar con contextos moderados.
- GPUs tipo A100, H100 o RTX 4090: no aplicables a esta conversión, al estar en formato MLX.
- Opciones de despliegue: `mlx-lm` en Python, servidor compatible con la API de OpenAI de mlx-lm, y entornos de escritorio que admitan MLX. El propio repositorio solo documenta el uso con `mlx_lm.load` y `generate`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el rendimiento dependerá del ancho de banda de memoria del chip Apple empleado.

## Comparativa con modelos similares

La información disponible no incluye datos de rendimiento del modelo, por lo que la comparación se limita a características estructurales publicadas por los respectivos autores. No se dispone de un modelo comparable directo dentro del ecosistema MLX en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Hemmingway-1-mlx-4Bit | 26,9 mil millones | No disponible | Apache 2.0 | Safetensors MLX 4 bits |
| Altworld/Hemmingway-1 (base) | No disponible | No disponible | No disponible en la información proporcionada | Pesos originales |
| Alternativas de ~27-32B en formato MLX | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; la model card no documenta ninguna evaluación de sesgos.
- Riesgo de alucinación: no cuantificado. Al no publicarse benchmarks ni evaluaciones, no es posible estimar la fiabilidad factual del modelo.
- Idioma: el repositorio declara únicamente inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto: desconocida, lo que impide planificar aplicaciones que dependan de ventanas amplias.
- Licencia: Apache 2.0, que permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique los cambios. Conviene verificar que el modelo base Altworld/Hemmingway-1 mantiene la misma licencia, ya que la información disponible no lo confirma.
- Restricción de plataforma: al estar en formato MLX, el modelo no puede ejecutarse en GPUs NVIDIA o AMD sin una conversión previa a otro formato.
- Pérdida por cuantización: la conversión a 4 bits puede degradar la calidad respecto a los pesos originales; no se documenta ninguna medición de esta pérdida.
- Madurez del repositorio: cero descargas y cero valoraciones, sin historial de uso que respalde su fiabilidad en producción.
- Fecha de publicación futura respecto al conocimiento habitual del ecosistema, lo que dificulta contrastar la información con fuentes independientes.
- La model card no especifica la arquitectura, el entrenamiento ni los datos utilizados, lo que limita cualquier auditoría técnica.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ailexleon/Hemmingway-1-mlx-4Bit
- Modelo base: https://huggingface.co/Altworld/Hemmingway-1
- Librería mlx-lm (referenciada en la conversión, versión 0.31.3): https://github.com/ml-explore/mlx-lm
- No se han encontrado papers, blogs, repositorios ni demos adicionales relacionados con este modelo en la búsqueda web realizada.
