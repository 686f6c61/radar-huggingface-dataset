# AdaptiveChunking/ali_mem-shuffled_s0

## Resumen

`ali_mem-shuffled_s0` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino un experimento de tokenización dinámica a nivel de byte construido sobre el framework `beetle-hnet`, con arquitectura interna denominada `ali` y objetivo de entrenamiento `ratio`. El modelo se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre textos en inglés, turco y finés.

Con 22.785.088 parámetros totales, el modelo es muy pequeño (del orden de decenas de millones de parámetros) y su propósito declarado es estudiar mecanismos de chunking dinámico y tokenización byte-level, no ofrecer generación de texto de propósito general. La model card describe una estructura de repositorio orientada a la reproducibilidad de la investigación: ramas `step-N` con checkpoints intermedios en un schedule logarítmico por fases, estado completo del entrenador reanudable y sondas de frontera FLORES+ en la rama `main`.

Su relevancia es, por tanto, académica y experimental: sirve como artefacto reproducible para investigar cómo afecta el chunking adaptativo y la tokenización a nivel de byte al aprendizaje de representaciones, y no como base para aplicaciones en producción. La licencia Apache 2.0 permite reutilización, pero la ausencia de benchmarks, de pipeline declarado y de documentación de uso limita su aplicabilidad práctica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net con variante interna `ali` (byte-level, dynamic chunking) |
| Parámetros totales | 22.785.088 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1024 bytes por secuencia durante el entrenamiento |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, tr, fi (idiomas de entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez), más checkpoints `checkpoint.pt` de PyTorch |

## Arquitectura y entrenamiento

El modelo sigue la familia H-Net implementada en el repositorio `beetle-hnet`, con `architecture=ali` y `objective=ratio`. Se trata de un modelo byte-level, es decir, que opera directamente sobre bytes en lugar de sobre tokens subword, con un mecanismo de chunking dinámico que agrupa bytes en unidades de mayor nivel de forma adaptativa. El schedule de chunking se configura como `None` y el dechunking usa `ema` (media móvil exponencial). Los pesos atados se almacenan una sola vez en `model.safetensors` y se reconstruyen mediante el mapa `config.json["tied_weights"]`.

El entrenamiento consistió en 6000 pasos con batch de 32 secuencias de 1024 bytes, sobre un corpus multilingüe con inglés, turco y finés. La variante `mem-shuffled` y la semilla 0 (`s0`) indican un experimento de memoria con datos barajados. No se documentan en la información disponible el volumen total de tokens, la composición exacta del dataset, ni si hubo fases de RLHF o DPO; el objetivo `ratio` y el schedule por fases sugieren un entrenamiento puramente auto-supervisado orientado a la investigación. El repositorio conserva checkpoints intermedios en un schedule log2 (0, 1, 2, 4, 6, 8, 16, ..., 2^k) desde cada inicio de fase del objetivo, además del paso final, junto con el estado reanudable del entrenador.

## Capacidades

- Modelado de lenguaje a nivel de byte sobre secuencias de hasta 1024 bytes.
- Chunking dinámico: agrupación adaptativa de bytes en unidades de mayor granularidad, objeto principal del experimento.
- Multilingüismo limitado a los tres idiomas de entrenamiento: inglés, turco y finés.
- Reanudación exacta del entrenamiento gracias al estado completo del trainer incluido en cada rama `step-N`.
- Evaluación de fronteras de chunk mediante las sondas FLORES+ incluidas en `probe/` al finalizar la ejecución.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en tokenización byte-level: usar los checkpoints intermedios para analizar cómo evoluciona la segmentación dinámica a lo largo del entrenamiento y comparar fases del schedule log2.
- Reproducción de experimentos: el estado reanudable `training_state/checkpoint.pt` permite continuar el entrenamiento exactamente desde cualquier paso conservado, lo que facilita la verificación de resultados por terceros.
- Estudio de transferencia multilingüe de bajo recurso: el trío inglés-turco-finés, con dos lenguas aglutinantes, permite analizar el comportamiento del chunking en morfologías complejas frente al inglés.
- Evaluación de fronteras lingüísticas: las sondas FLORES+ de `probe/` sirven para medir la calidad de las fronteras de chunk sobre texto multilingüe paralelo.
- Baseline para comparativas de arquitecturas H-Net: al ser un modelo de 22,8 M de parámetros, puede ejecutarse en CPU y servir como referencia en experimentos que comparen variantes de chunking.
- Docencia y prototipado: su tamaño reducido permite desplegarlo en portátiles para ilustrar el funcionamiento interno de modelos byte-level sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa para los 22,8 M de parámetros (los pesos en fp32 ocupan aproximadamente 91 MB); el tamaño del repo de 7,2 GB corresponde principalmente a los múltiples checkpoints y al estado del entrenador, no a los pesos de un único paso.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo y también en CPU; el cuello de botella será el preprocesado byte-level, no la memoria.
- Opciones de despliegue: PyTorch nativo con `huggingface_hub` para descargar la revisión concreta; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-shuffled_s0 | 22,8 M | 1024 bytes | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos directamente comparables de la misma familia o con el mismo objetivo experimental en la documentación consultada.

## Limitaciones y advertencias

- Modelo de investigación sin benchmarks publicados; no hay evidencia de calidad en tareas downstream.
- Ausencia de pipeline declarado y de documentación de inferencia: no se especifica cómo generar texto con el modelo más allá de cargar los pesos.
- Idiomas limitados a inglés, turco y finés; no se garantiza comportamiento en castellano ni en otras lenguas.
- Contexto de solo 1024 bytes, insuficiente para la mayoría de aplicaciones conversacionales o de documentos largos.
- Riesgo de alucinación y de salidas incoherentes no evaluado; no debe usarse en producción sin validación previa.
- El repositorio de 7,2 GB incluye múltiples checkpoints y estados del entrenador; conviene descargar solo la revisión necesaria para evitar consumos de disco y ancho de banda innecesarios.
- Sesgos conocidos: no documentados, pero el corpus multilingüe de tres idiomas puede introducir sesgos de dominio y de representación.
- La licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable cualquier despliegue comercial sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-shuffled_s0
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Repositorio del framework: https://github.com/suchirsalhan/beetle-hnet
- Paper, blog o demo: no disponible
