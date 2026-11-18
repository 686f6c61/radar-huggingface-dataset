# Charlie320/zils-mini-mx8

## Resumen

zils-mini-mx8 es un modelo de decisión de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) publicado por el usuario Charlie320 en Hugging Face. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-4B, construido como un "body" (cuerpo) para el pool de soups `d3-mini` de Zils, asociado a la subred 127 de Bittensor. El modelo parte de joamCriff123/zils-mini-m1115, el único body del soup del 18 de noviembre de 2026, y se distribuye con licencia Apache-2.0.

La relevancia de este modelo es acotada y muy específica: no es un modelo de propósito general, sino una pieza dentro de un ecosistema de evaluación y decisión (decision-model) orientado a tareas de clasificación y elección tipadas. El autor documenta un procedimiento de "soup fine-tune": dos fine-tunes LoRA de rango 64, fusionados y promediados uniformemente, entrenados con etiquetas suaves que combinan en tres cuartas partes la etiqueta del dataset y en una cuarta parte las probabilidades de respuesta del propio body de partida (auto-anclaje para evitar olvido catastrófico).

El repositorio contiene únicamente pesos (9,1 GB en safetensors, BF16), sin pipeline declarado ni idiomas especificados en los metadatos. El modelo conserva la torre de visión del modelo padre y los pesos de lenguaje entrenados, aunque la model card no detalla capacidades multimodales más allá de esa herencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B; diseño exacto no disponible) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-4B en el "chassis layout" descrito por el autor, con pesos de lenguaje entrenados y torre de visión heredada del padre. El procedimiento de entrenamiento consistió en dos fine-tunes LoRA de rango 64 (fusionados) sobre joamCriff123/zils-mini-m1115, con semillas distintas, una época cada uno y tasa de aprendizaje 1e-4, promediados uniformemente sin interpolación. No se empleó ningún otro modelo como profesor.

Los objetivos de entrenamiento fueron suaves: tres cuartas partes corresponden a la etiqueta propia del dataset de la fila y una cuarta parte a las probabilidades de respuesta del body de partida (auto-anclaje contra el olvido). Los datos de entrenamiento son 30.000 filas (una pasada barajada por semilla) del split de entrenamiento de tasksource/tasksource-jev-typed-decisions, restringidas a 240 tareas fuente con metadatos de licencia no especificados; se excluyeron fuentes no comerciales, fuentes con nombres tipo BIG-bench y filas cuyo texto coincide con filas de validación o test. No se usaron ítems de examen escritos, ítems de examen de validador, ítems de examen semilla públicos ni datos de clientes.

## Capacidades

- Clasificación y decisión tipada: el modelo está entrenado para tareas de decisión sobre el dataset tasksource-jev-typed-decisions, con etiquetas suaves derivadas de las etiquetas del dataset y del body de partida.
- Generación de texto y razonamiento: heredadas del base Qwen/Qwen3.5-4B, aunque no se documentan explícitamente en la model card.
- Visión: conserva la torre de visión del modelo padre, según indica el autor.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los metadatos no declaran idiomas.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de decisiones tipadas en pipelines de investigación: el modelo puede usarse para clasificar filas de tareas del dataset tasksource/tasksource-jev-typed-decisions, aprovechando que fue entrenado específicamente sobre ese corpus con etiquetas suaves.
- Miembro de un pool de soups (Bittensor subnet 127): sirve como body candidato en el pool `d3-mini` de Zils, donde se evalúa y compara con otros cuerpos del mismo ecosistema.
- Experimentación con técnicas de soup fine-tuning: permite reproducir el procedimiento de dos LoRA de rango 64 promediados uniformemente con auto-anclaje, útil para estudiar olvido catastrófico en fine-tunes pequeños.
- Clasificación de texto con contexto heredado de Qwen3.5-4B: para tareas de etiquetado que requieran un modelo de ~4,5 mil millones de parámetros con licencia Apache-2.0 y despliegue en una sola GPU consumer.
- Base para fine-tunes posteriores: al ser un body del pool, puede servir como punto de partida para nuevos soups o adaptaciones LoRA dentro del mismo ecosistema Zils.
- Investigación sobre datos de entrenamiento con licencias mixtas: el autor documenta explícitamente las restricciones de licencia de las fuentes, lo que permite estudiar el impacto de filtrar datos no comerciales en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 mil millones de parámetros en BF16, los pesos ocupan aproximadamente 9,1 GB; en FP16/FP8 se reduce a unos 4,6 GB, y en cuantizaciones de 4 bits a unos 2,3-2,5 GB (estimación a partir del recuento de parámetros; no confirmada por el autor).
- GPU recomendadas: una GPU con 12-16 GB de VRAM es suficiente para BF16; para cuantización de 4 bits bastan 6-8 GB. Modelos como RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 pueden alojarlo.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB o superiores en BF16, y en GPUs de 8 GB con cuantización.
- Opciones de despliegue: no documentadas por el autor; al ser safetensors, es compatible con frameworks estándar (transformers, vLLM, TGI) previa conversión a GGUF para llama.cpp u Ollama, aunque no se confirma compatibilidad.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-mini-mx8 | 4.539.265.536 | no disponible | Apache-2.0 | Hugging Face (Charlie320) |
| Qwen/Qwen3.5-4B (base) | ~4B (no confirmado) | no disponible | no disponible | Hugging Face |
| joamCriff123/zils-mini-m1115 (body de partida) | no disponible | no disponible | Apache-2.0 (según el autor) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: entrenado exclusivamente sobre tasksource/tasksource-jev-typed-decisions; su comportamiento fuera de ese dominio no está validado.
- Riesgo de alucinación: inherente a los modelos de lenguaje de ~4,5B; no se documentan evaluaciones de fidelidad.
- Idiomas: no declarados en los metadatos; no se garantiza soporte multilingüe más allá de lo heredado del base.
- Contexto: longitud no documentada; no se debe asumir una ventana concreta sin verificar la configuración del base Qwen3.5-4B.
- Licencias de datos: las fuentes del dataset tienen metadatos de licencia no especificados; el autor excluyó fuentes no comerciales, pero recomienda verificar los términos de los datasets de origen antes de reutilizar.
- Uso comercial: los pesos son Apache-2.0, pero la licencia de los datos de entrenamiento no está completamente aclarada.
- Sin pipeline declarado ni descargas ni likes: modelo recién publicado (18 de noviembre de 2026) sin validación comunitaria.
- Repositorio solo de pesos: no incluye código de inferencia, tokenizador propio ni configuración de despliegue documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-mx8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Body de partida: https://huggingface.co/joamCriff123/zils-mini-m1115
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
