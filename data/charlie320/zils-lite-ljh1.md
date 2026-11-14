# Charlie320/zils-lite-ljh1

## Resumen

zils-lite-ljh1 es un modelo de decisión de 853 millones de parámetros publicado por el usuario Charlie320 en Hugging Face, construido como un fine-tune de Qwen/Qwen3.5-0.8B. Forma parte del pool de modelos "Zils d3-lite" asociado a la subred 127 de Bittensor, un ecosistema orientado a tareas de decisión estructurada. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors y BF16.

El punto de partida no es el modelo base original, sino la media aritmética de pesos (weight soup) de dos cuerpos previos del pool: VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc. Sobre esa media se aplicó un único entrenamiento LoRA de rango 64 (anchor 0.1, learning rate 1e-4, aproximadamente una época) que posteriormente se fusionó en los pesos. El resultado es un modelo de 852.985.920 parámetros con la torre de visión heredada del modelo padre.

La relevancia del modelo es acotada y muy específica: no es un modelo conversacional de propósito general, sino un "cuerpo" (body) entrenado para producir decisiones tipadas en el formato de entrenamiento de Zils. Su utilidad principal es servir como componente en pipelines de evaluación o en el pool de la subred, no como asistente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B), con torre de visión heredada del padre |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura del Qwen3.5-0.8B, un transformer denso de aproximadamente 0,85 mil millones de parámetros. Incluye una torre de visión heredada del modelo padre, aunque la model card no detalla su configuración ni el rango de resolución soportado. El entrenamiento no parte de los pesos originales de Qwen, sino de la media uniforme de pesos de dos cuerpos del pool Zils (zils-lite-dh2 y zils-lite-decision-avg-abc), ambos Apache 2.0.

Sobre ese punto de partida se ejecutó un único LoRA de rango 64 con anchor 0.1, learning rate 1e-4 y aproximadamente una época, fusionado después en los pesos finales. Los datos de entrenamiento suman unas 109.000 filas y se dividen en dos bloques: por un lado, ítems de decisión en formato de examen generados con la receta pública de autoría de Zils (scripts/author_exam.py) por Claude Opus y por un modelo abierto local, a partir únicamente de splits públicos de entrenamiento, más las respuestas del profesor de relay público de Zils; por otro, 63.840 decisiones tipadas procedentes del split de entrenamiento de tasksource/tasksource-jev-typed-decisions, filtradas a filas con licencia comercial, texto mayoritariamente ASCII y un máximo de 200 filas por dataset de origen (413 fuentes). No se usaron ítems de examen de validadores, ni ítems públicos de examen semilla, ni datos de clientes. No se documenta el uso de RLHF o DPO.

## Capacidades

- Generación de decisiones tipadas en el formato de entrenamiento de Zils, orientadas a tareas de clasificación y elección estructurada.
- Procesamiento de entradas de examen o decisión con formato definido por la receta de autoría de Zils.
- Capacidad de visión heredada del modelo padre, aunque sin especificación de resolución ni de tareas soportadas en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el entrenamiento se filtró a texto mayoritariamente ASCII, lo que sugiere un sesgo hacia inglés.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de modelos de decisión en la subred 127 de Bittensor: el modelo puede desplegarse como cuerpo candidato del pool d3-lite y compararse contra otros cuerpos mediante los exámenes del validador, ya que su formato de salida está alineado con el formato de entrenamiento de Zils.
- Clasificación de decisiones tipadas sobre datos tabulares o textuales: los 63.840 ejemplos de tasksource-jev-typed-decisions permiten usar el modelo para asignar etiquetas de decisión a registros con estructura similar, siempre que el texto sea mayoritariamente ASCII.
- Generación de ítems de examen sintéticos: dado que el modelo fue entrenado con ítems generados por la receta author_exam.py, puede emplearse como generador auxiliar de ítems de decisión en formato Zils para ampliar datasets de entrenamiento, con revisión humana posterior.
- Componente de un ensemble por weight soup: al ser el resultado de una media de pesos más un LoRA fusionado, puede servir como punto de partida para nuevas rondas de soup en el pool, reduciendo el coste de entrenamiento desde cero.
- Prototipado de pipelines de decisión en local: con 853 millones de parámetros en BF16 (aproximadamente 1,7 GB de pesos), cabe en GPUs de consumo para pruebas de integración antes de escalar a modelos mayores.
- Investigación sobre fine-tuning LoRA de rango 64 sobre modelos pequeños: la model card documenta hiperparámetros concretos (anchor 0.1, lr 1e-4, una época), lo que permite reproducir o comparar la receta en experimentos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB. No se confirma que existan versiones GGUF publicadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo es holgadamente ejecutable en GPUs de consumo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 8 GB o más en BF16, y en GPUs con 4-6 GB si se cuantiza.
- Opciones de despliegue: Transformers con safetensors es la vía directa; vLLM, TGI, llama.cpp u Ollama requerirían conversión a los formatos correspondientes, no documentada en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-ljh1 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face (Charlie320) | Fine-tune de decisión sobre soup de Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones | no disponible | no disponible en la información | Hugging Face (Qwen) | Modelo base original, propósito general |
| VadymPikulyk/zils-lite-dh2 | no disponible | no disponible | Apache 2.0 | Hugging Face | Cuerpo previo del pool, componente del soup |
| qhoenix/zils-lite-decision-avg-abc | no disponible | no disponible | Apache 2.0 | Hugging Face | Cuerpo previo del pool, componente del soup |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en decisiones tipadas del formato Zils; su comportamiento fuera de ese dominio no está documentado y probablemente sea deficiente.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fiabilidad ni tasas de error.
- Sesgo lingüístico probable hacia el inglés: el filtro de entrenamiento exigía texto mayoritariamente ASCII, lo que excluye gran parte de contenido en otros idiomas.
- La torre de visión se hereda del padre sin reentrenamiento documentado; su rendimiento tras el soup y el LoRA no está verificado.
- Los datos de tasksource/tasksource-jev-typed-decisions conservan la licencia de cada dataset de origen; es necesario revisar los términos de esas 413 fuentes antes de reutilizar el modelo en producción comercial, aunque el modelo se distribuya como Apache 2.0.
- El repositorio contiene solo pesos; no se incluyen scripts de inferencia ni tokenizador propios, por lo que hay que usar los del modelo base Qwen3.5-0.8B.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por terceros.
- La model card advierte explícitamente de que no se usaron ítems de examen de validadores ni datos de clientes, pero no ofrece garantías sobre la ausencia de contaminación en los splits públicos empleados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-lite-ljh1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo previo del pool: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Cuerpo previo del pool: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Subred Bittensor 127 (referencia mencionada en la model card): no disponible enlace directo en la información proporcionada.
