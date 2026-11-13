# FINAL-Bench/Darwin-9B-NEG

## Resumen

Darwin-9B-NEG es un modelo de lenguaje de 9.653 millones de parámetros (8,95B según la model card) desarrollado por FINAL-Bench, derivado de la familia Qwen3.5 y publicado bajo licencia Apache 2.0. Se presenta como el primer modelo con Native Entropy Gating (NEG), una innovación arquitectónica propietaria de la serie Darwin V8 que incorpora un mecanismo interno de autoconfianza en los propios pesos del modelo, sin necesidad de librerías externas ni bucles de inferencia adicionales.

El modelo está especializado en razonamiento avanzado y modo "thinking", y declara una puntuación de 84,34 % de accuracy en GPQA Diamond (198 preguntas de nivel doctoral) mediante un protocolo de ensemble de tres etapas. Según el autor, esto supera el resultado publicado de Qwen3.5-9B en el mismo benchmark (81,7 %). La propuesta central es obtener ganancias de razonamiento superiores a 12 puntos porcentuales a coste de inferencia 1×, frente a técnicas externas de iteración multi-turno que requieren entre 3× y 8× más cómputo.

El modelo soporta inglés, chino, coreano y japonés, y se distribuye en formato safetensors con soporte para `transformers` mediante `trust_remote_code=True`. Su relevancia actual radica en que propone una vía distinta a la del escalado puro de parámetros o al muestreo múltiple: internalizar la señal de confianza en la arquitectura para decidir cuándo restringir la selección de tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5) con módulos NEG-Head y NEG-Gate |
| Parámetros totales | 9.653.104.368 (≈ 9,65B; la model card indica 8,95B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (repo en BF16/safetensors) |
| Idiomas soportados | Inglés, chino, coreano, japonés, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Darwin-9B-Opus, miembro de la familia Qwen3.5 dentro de la serie Darwin, producida por el motor de cruce evolutivo Darwin V7, que recombina dos modelos parentales en un descendiente preservando "vigor híbrido" entre capacidades de razonamiento y conocimiento. Sobre esa base se añade NEG (Darwin V8), compuesto por dos módulos: un NEG-Head de aproximadamente 4 millones de parámetros (≈ 0,05 % del total) que predice, en cada paso, la entropía de la distribución del siguiente token a partir del último estado oculto; y un NEG-Gate con un único umbral aprendible que decide por token si el modelo es "suficientemente confiable" para comprometerse con su opción principal o si debe restringir la elección a un subconjunto top-k estrecho.

La innovación clave es que NEG se transporta dentro de los propios pesos: no hay nada extra que instalar ni enviar, y la carga estándar con `transformers` y `trust_remote_code=True` adjunta los módulos automáticamente. La activación de la compuerta se produce en menos del 5 % de los pasos de generación, por lo que la sobrecarga de latencia es calificada como despreciable. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La receta de fusión se mantiene interna según el autor.

## Capacidades

- Generación de texto conversacional y razonamiento avanzado de múltiples pasos.
- Modo "thinking" (razonamiento explícito antes de responder).
- Razonamiento autorregulado mediante Native Entropy Gating: decisión por token sobre cuándo restringir el espacio de candidatos.
- Capacidad declarada para preguntas de nivel doctoral (GPQA Diamond).
- Soporte multilingüe en inglés, chino, coreano y japonés.
- Compatible con el pipeline `image-text-to-text` según los tags del repositorio, aunque no se detallan capacidades de visión en la model card.
- Compatibilidad declarada con endpoints y con motores estándar (vLLM, SGLang, TGI, transformers) sin necesidad de motor nuevo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento científico y técnico de alta dificultad: el modelo está optimizado para preguntas de nivel doctoral (GPQA Diamond), por lo que encaja en asistentes de investigación que requieren cadenas de razonamiento largas con verificación interna de confianza.
- Despliegue en producción con coste de inferencia controlado: al operar a coste 1× y activar la compuerta en menos del 5 % de los pasos, es adecuado para servicios con presupuesto de latencia estricto donde el muestreo múltiple o los bucles multi-turno no son viables.
- Integración en pipelines existentes: al cargarse con `transformers` estándar y ser compatible con vLLM, SGLang y TGI, puede sustituir a un modelo base en infraestructura ya desplegada sin cambios de motor.
- Asistentes multilingües para mercados de Asia Oriental: cubre inglés, chino, coreano y japonés, lo que permite atender usuarios de esas regiones con un único modelo.
- Evaluación comparativa de técnicas de razonamiento: sirve como referencia para investigar mecanismos de gating interno frente a enfoques externos de iteración multi-turno, dado que el autor publica la comparación directa con su base sin NEG.
- Sistemas de respuesta con control de abstención: el umbral aprendible de NEG-Gate puede aprovecharse para detectar pasos de baja confianza y derivar a revisión humana o a una segunda pasada, en lugar de comprometerse con una respuesta dudosa.
- Moderación y filtrado de contenido en varios idiomas: su cobertura multilingüe permite clasificar y generar texto en las cuatro lenguas declaradas dentro de un mismo despliegue.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Darwin-9B-NEG | Referencia declarada |
|---|---|---|---|
| GPQA Diamond (198 preguntas) | Accuracy | 84,34 % | Qwen3.5-9B: 81,7 % (resultado publicado) |
| GPQA Diamond (vs. base sin NEG) | Accuracy | 84,34 % | Darwin-9B-Opus: +12,63 puntos porcentuales de mejora |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 24 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 ajustado; para cuantización de 8 bits bastaría con 16 GB y para 4 bits con 8-10 GB, aunque el autor no publica pesos cuantizados.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con contexto moderado, y en GPUs de 16 GB si se cuantiza.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, vLLM, SGLang y TGI, según la model card. No se mencionan GGUF ni Ollama para este modelo concreto.
- Latencia y throughput: no disponibles. El autor afirma que la compuerta NEG se activa en menos del 5 % de los pasos y que la sobrecarga es despreciable, pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darwin-9B-NEG | 9,65B | No disponible | 84,34 % (autor) | Apache 2.0 | Hugging Face |
| Darwin-9B-Opus (base sin NEG) | ≈ 9B | No disponible | 84,34 % − 12,63 pp (según autor) | No disponible en la información | Hugging Face |
| Qwen3.5-9B | 9B | No disponible | 81,7 % (publicado) | No disponible en la información | Hugging Face |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoría (por ejemplo, Llama o Mistral de tamaño similar) en los benchmarks declarados.

## Limitaciones y advertencias

- Los resultados de GPQA Diamond (84,34 %) son declarados por el autor y no han sido verificados de forma independiente; además, se obtienen con un protocolo de ensemble de tres etapas, no con decodificación greedy simple, lo que limita la comparación directa con otros modelos.
- El benchmark se limita a una única tarea (GPQA Diamond); no hay evidencia publicada sobre código, matemáticas, visión o generación long-form.
- La técnica NEG es propietaria y la receta de fusión se mantiene interna, lo que dificulta la reproducibilidad y la auditoría del proceso de entrenamiento.
- No se especifican los datos de entrenamiento ni si hubo alineación con RLHF o DPO, por lo que el riesgo de sesgos y de alucinación no puede caracterizarse con precisión.
- La longitud de contexto no está documentada, lo que impide garantizar su idoneidad para tareas de contexto largo.
- El soporte multilingüe se limita a inglés, chino, coreano y japonés; no se declara castellano.
- La carga requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene revisarlo antes de desplegar en entornos sensibles.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la condición de "tecnología propietaria" de NEG y la falta de documentación sobre posibles patentes o restricciones adicionales merecen verificación legal antes de un despliegue comercial.
- El repositorio tiene un volumen de descargas moderado (434) y 62 likes, lo que sugiere una validación comunitaria todavía limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-9B-NEG
- Modelo base Darwin-9B-Opus: https://huggingface.co/FINAL-Bench/Darwin-9B-Opus
- Darwin-4B-Genesis: https://huggingface.co/FINAL-Bench/Darwin-4B-Genesis
- Darwin-27B-Opus: https://huggingface.co/FINAL-Bench/Darwin-27B-Opus
- Darwin-31B-Opus: https://huggingface.co/FINAL-Bench/Darwin-31B-Opus
- Darwin-36B-Opus: https://huggingface.co/FINAL-Bench/Darwin-36B-Opus
- Colección de la familia Darwin: https://huggingface.co/collections/FINAL-Bench/darwin-family
- Leaderboard FINAL Bench: https://huggingface.co/spaces/FINAL-Bench/Leaderboard
- Demo POCKET en CPU: https://huggingface.co/spaces/FINAL-Bench/POCKET-35B-CPU
- Colección POCKET: https://huggingface.co/collections/FINAL-Bench/pocket-models-6a618ee5d23eafb7e185a5c6
- POCKET-35B-GGUF: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF
- POCKET-KR-MLX: https://huggingface.co/FINAL-Bench/POCKET-KR-MLX
- POCKET-EN-GGUF: https://huggingface.co/FINAL-Bench/POCKET-EN-GGUF
- Paper referenciado (arXiv:2605.14386): https://arxiv.org/abs/2605.14386
