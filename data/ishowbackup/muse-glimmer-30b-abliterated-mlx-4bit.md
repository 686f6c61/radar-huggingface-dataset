# Ishowbackup/Muse-Glimmer-30B-Abliterated-MLX-4bit

## Resumen

Muse-Glimmer-30B-Abliterated-MLX-4bit es una versión cuantizada a 4 bits en formato MLX del modelo Muse-Glimmer-30B, desarrollado originalmente por Meta Superintelligence Labs y posteriormente modificado por Blackfrost AI mediante un proceso de "abliteración" que elimina los comportamientos de rechazo. Esta variante concreta, publicada por el usuario Ishowbackup, está optimizada para ejecutarse en dispositivos Apple Silicon mediante el framework MLX, lo que permite desplegar un modelo multimodal de gran tamaño de forma local en un Mac.

El modelo base es un transformer denso de 52 capas con atención por ventana deslizante, arquitectura GQA (32 cabezas de consulta, 2 de clave/valor) y una torre de visión integrada, lo que le permite procesar tanto texto como imágenes. Su ventana de contexto alcanza los 131.072 tokens, una cifra notable para un modelo pensado para uso en dispositivo. La versión abliterada elimina los rechazos ante solicitudes dañinas, como refleja el benchmark R1-HARMFUL-BENCH-450 con 0 refusals sobre 450 casos.

La relevancia de este modelo radica en su combinación de capacidades agénticas, multimodalidad y ejecución local en hardware de consumo, sin necesidad de GPU dedicada. El formato MLX 4-bit reduce el peso a aproximadamente 18 GB, lo que lo hace viable en Macs con memoria unificada de 32 GB o superior. No obstante, hay una discrepancia entre el nombre del modelo (30B) y el número de parámetros reportado en los safetensors (6,2 mil millones), que se detalla en la sección de especificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | muse_glimmer (dense, 52 capas, hidden 6656, GQA 32 q / 2 kv, sliding-window attention, vision tower) |
| Parametros totales | 6.216.936.448 (6,2 B) segun safetensors; el nombre del modelo indica 30 B, discrepancia sin resolver |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B emplea una arquitectura transformer densa con 52 capas, dimensión oculta de 6656 y atención por ventana deslizante. La atención utiliza GQA con 32 cabezas de consulta y 2 de clave/valor, lo que reduce el coste de memoria durante la inferencia. Además, incorpora una torre de visión que permite procesar entradas de imagen junto con texto, habilitando tareas de image-text-to-text.

La versión abliterada, creada por Blackfrost AI, aplica un proceso de modificación de pesos que elimina el comportamiento de rechazo del modelo original. Según la model card, esta transformación no afecta a las capacidades multimodales ni al rendimiento general, y la cuantización a 4 bits en MLX mantiene la ausencia de refusals (0/450 en el benchmark). No se proporcionan datos sobre el entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO), por lo que esta información no está disponible.

## Capacidades

- Generación de texto y razonamiento complejo: el modelo está descrito como un "pensador profundo" (heavy thinker), con capacidad de razonamiento multi-paso que se devuelve por separado de la respuesta final.
- Procesamiento multimodal: al incluir una torre de visión, puede recibir imágenes como entrada y generar texto relacionado (image-text-to-text).
- Contexto largo: ventana de 131.072 tokens, adecuada para documentos extensos o conversaciones de muchos turnos.
- Ejecución en dispositivo: optimizado para Apple Silicon mediante MLX, con inferencia local sin conexión.
- Comportamiento agéntico: el modelo está diseñado para tareas de agente, aunque no se especifica explícitamente soporte de tool calling o function calling en la documentación disponible.
- Sin rechazos: la abliteración elimina las respuestas de rechazo ante solicitudes dañinas, lo que puede ser útil en entornos de investigación pero también plantea riesgos.

## Casos de uso

- Asistente local en Mac: gracias al formato MLX 4-bit y su tamaño reducido, puede ejecutarse en un Mac con Apple Silicon mediante `mlx_lm.server` o LM Studio, ofreciendo un asistente conversacional privado sin conexión.
- Análisis de documentos con imágenes: su capacidad multimodal permite extraer información de capturas, diagramas o documentos escaneados, combinando texto e imagen en un mismo prompt.
- Razonamiento y resolución de problemas: su naturaleza de "pensador profundo" lo hace adecuado para tareas que requieren cadenas de razonamiento largas, como problemas matemáticos, lógica o planificación.
- Prototipado de agentes: al ser un modelo agéntico, puede integrarse en sistemas que requieran tomar decisiones secuenciales, aunque la falta de documentación sobre tool calling limita su uso directo en pipelines complejos.
- Investigación sobre alineación y seguridad: la versión abliterada permite estudiar el impacto de eliminar los rechazos en modelos grandes, comparando comportamientos con la versión original.
- Generación de contenido creativo: con una ventana de contexto amplia, puede mantener coherencia en textos largos, como guiones, artículos o narrativas, sin perder el hilo.

## Benchmarks y rendimiento

La única métrica publicada en la model card es el benchmark de rechazos R1-HARMFUL-BENCH-450, medido sobre el modelo abliterado:

| Metrica | Resultado |
|---|---|
| True refusal (harmful, n=300) | 0 / 300 = 0,0 % |
| True refusal (full 450) | 0 / 450 = 0,0 % |
| Substring-harmful | 0 / 300 |
| Substring-all | 2 / 450 (falsos positivos de XSTest) |
| Errores | 0 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon; se recomienda un Mac con al menos 32 GB de memoria unificada para cargar los ~18 GB del peso en 4-bit y dejar margen para el contexto y la computación.
- No requiere GPU dedicada; la memoria unificada de los chips M1/M2/M3/M4 es suficiente.
- Para servirlo, se puede usar `mlx_lm.generate` para una generación puntual o `mlx_lm.server` para un endpoint compatible con OpenAI.
- También es compatible con LM Studio, que incluye el runtime MLX.
- El rendimiento (latencia y throughput) no está documentado; dependerá del chip concreto (por ejemplo, M1 Pro vs M3 Max) y de la longitud del contexto utilizado.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría (tamaño, multimodalidad, ejecución local). El modelo base Muse-Glimmer-30B no tiene alternativas públicas documentadas en la información proporcionada. Por tanto, esta sección queda como no disponible.

## Limitaciones y advertencias

- La abliteración elimina los rechazos ante contenido dañino, lo que implica que el modelo puede generar respuestas peligrosas, ilegales o éticamente cuestionables si se le solicita. No debe usarse en producción sin medidas de seguridad adicionales.
- Existe una discrepancia entre el nombre del modelo (30B) y el número de parámetros real según safetensors (6,2 B). Esto puede deberse a un error de etiquetado o a una arquitectura diferente a la esperada; conviene verificar antes de confiar en las especificaciones.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones idiomáticas. El modelo puede presentar sesgos heredados del entrenamiento original, pero no hay documentación al respecto.
- La licencia Apache-2.0 permite uso comercial, pero la modificación abliterada puede tener implicaciones legales o éticas dependiendo del uso final.
- El modelo está pensado para Apple Silicon; no funcionará en GPUs NVIDIA o AMD sin una conversión previa a otro formato (por ejemplo, GGUF o safetensors estándar).
- La ventana de contexto de 131.072 tokens es amplia, pero el uso prolongado puede agotar la memoria unificada en Macs de gama baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ishowbackup/Muse-Glimmer-30B-Abliterated-MLX-4bit
- Modelo base (abliterado BF16): https://huggingface.co/Blackfrost-Research/Muse-Glimmer-30B-Abliterated-BF16
- Modelo original (Meta): https://huggingface.co/meta-models/Muse-Glimmer-30B
