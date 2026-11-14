# brr-ai/Klorn-Tinystories-31M

## Resumen

Klorn-Tinystories-31M es un modelo de lenguaje experimental de 30,9 millones de parámetros desarrollado por Barrier Research. Se trata de un prototipo de investigación entrenado desde cero sobre el corpus sintético TinyStories-V2 (1.147 millones de tokens) en una única TPU v5e-1 de Google Cloud. Su interés no reside en la calidad de generación —es deliberadamente un modelo estrecho de dominio— sino en explorar una arquitectura híbrida que combina un backbone recurrente Gated DeltaNet con capas periódicas de atención local de ventana deslizante.

La propuesta técnica es el estado de memoria fijo: el modelo mantiene 4,22 MiB de estado en tiempo de ejecución (1,22 MiB de matrices recurrentes más 3,00 MiB de búfer de atención de ventana) independientemente de la longitud de la secuencia, evitando el crecimiento ilimitado de la caché KV de un transformer convencional. Con una dimensión oculta de 384, 17 capas y un vocabulario BPE de 2.048 tokens, el modelo está pensado para inferencia eficiente en CPU mediante el motor C compilado `beruntime`.

Es relevante ahora como pieza de verificación reproducible en la investigación de modelos recurrentes híbridos a pequeña escala: el autor publica comparaciones ciegas contra el transformer `roneneldan/TinyStories-33M`, incluyendo resultados adversos, y distribuye binarios precompilados para Windows y Linux x86_64. No obstante, su licencia `barrier-eval-1.0` restringe el uso a estudio académico no comercial, revisión y benchmarking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 13 capas recurrentes Gated DeltaNet + 4 capas de atención local con ventana deslizante (window = 256), intercaladas cada cuarto bloque |
| Parametros totales | 30.910.926 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Barrier Research Evaluation License (`barrier-eval-1.0`), uso no comercial |
| Formato de pesos | safetensors (`model.safetensors`) + binarios `beruntime` (`brr_runtime.dll` Windows x86_64, `libbrr_runtime.so` Linux x86_64) |

Datos adicionales: dimensión oculta 384, 6 cabezas, tamaño de FFN intermedio 1.024, vocabulario de 2.048 tokens, estado en runtime de 4,22 MiB (4.427.792 bytes) fijo, tamaño del repositorio 0,1 GB.

## Arquitectura y entrenamiento

El modelo es un transformer híbrido en el que la mayor parte de las capas (13 de 17) son recurrentes Gated DeltaNet, y cada cuarto bloque se sustituye por una capa de atención local con ventana deslizante de 256 tokens. Esta combinación busca soportar copia local de detalles sin necesidad de una caché KV de tamaño ilimitado. El autor introduce tres decisiones de diseño a esta escala: (1) el intercalado de atención local para copia de corto alcance; (2) un *write gating* consciente del estado que se calcula a partir del error del estado recurrente actual, con la intención de limitar sobrescrituras redundantes en claves repetidas; y (3) bandas de decaimiento multi-escala distribuidas entre las 6 cabezas de atención/recurrentes, con dimensiones (anchura 384, tamaño de cabeza 64) elegidas para evitar padding en los mosaicos sistólicos de la TPU v5e.

El entrenamiento se realizó desde cero sobre `roneneldan/TinyStories` (`TinyStoriesV2-GPT4-train.txt`), un corpus de cuentos infantiles sintéticos en inglés generado por GPT-4 y distribuido bajo `cdla-sharing-1.0`. El preprocesado divide el texto UTF-8 por `<|endoftext|>`, lo recorta, lo codifica con un tokenizador BPE de 2.048 tokens construido sobre TinyStories y lo empaqueta en bloques de 512 tokens separados por reinicios de frontera EOS. No se aplicó deduplicación adicional más allá de la del corpus original. No se documenta en la información disponible el uso de RLHF, DPO ni fases de ajuste posteriores. Las curvas exactas de gating, las calibraciones internas de decaimiento y los internals del runtime C son de código cerrado.

## Capacidades

- Generación de texto en inglés sobre cuentos infantiles sintéticos de estilo TinyStories.
- Razonamiento narrativo de corto alcance: resolución de obstáculos y consistencia de personajes en tramas simples (evaluado en el conjunto "Group 3 obstacle-resolution").
- Copia local de detalles dentro de la ventana de atención de 256 tokens.
- Inferencia con memoria de estado constante (4,22 MiB) independientemente de la longitud generada.
- Ejecución en CPU de consumo mediante el motor C `beruntime`, sin dependencia de PyTorch ni NumPy (solo Python >= 3.10 y `tokenizers`).
- No soporta tool calling ni function calling (no documentado; fuera del alcance declarado).
- No soporta agentes ni razonamiento multi-paso (fuera del alcance declarado).
- No soporta visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Estudio académico de modelos recurrentes híbridos: el modelo sirve como banco de pruebas reproducible para analizar cómo se comporta un backbone Gated DeltaNet con atención local intercalada a escala de 31M parámetros, comparando curvas de perplejidad y compresión contra transformers del mismo orden.
- Verificación independiente de benchmarks publicados: investigadores y revisores pueden descargar los pesos sin modificar y los binarios `beruntime` para reproducir las comparaciones ciegas contra `roneneldan/TinyStories-33M` reportadas en la model card.
- Investigación sobre memoria de estado fijo: útil para medir el coste real de mantener 4,22 MiB de estado en lugar de una caché KV creciente, y para evaluar el impacto en calidad cuando el contexto supera la ventana de atención local.
- Benchmarking de motores de inferencia en CPU: con velocidades de 105–153 tok/s en CPU de consumo a través de `beruntime` (frente a 35,1 tok/s en PyTorch CPU eager y 39,4 tok/s en el motor C según la model card), sirve para comparar backends de ejecución en hardware sin GPU.
- Docencia y divulgación sobre arquitecturas híbridas: el tamaño reducido (0,1 GB de repositorio) y la ausencia de dependencias pesadas permiten desplegarlo en entornos de aula o portátiles para ilustrar diferencias entre atención y recurrencia.
- Evaluación de gating consciente del estado: el modelo permite estudiar empíricamente si el *write gating* basado en error de estado reduce sobrescrituras en claves repetidas, dado que el autor reporta que a esta escala no evitó el retraso frente al transformer en seguimiento de atributos (18,15 vs 22,23).

## Benchmarks y rendimiento

Los datos disponibles provienen de la comparación ciega de 50 prompts sin filtrar contra `roneneldan/TinyStories-33M` (GPT-Neo de 4 capas, d = 768, vocabulario 50.257) reportada en la model card:

| Metrica | Klorn-Tinystories-31M | roneneldan/TinyStories-33M |
|---|---|---|
| Victorias en comparación ciega (50 prompts) | 13 (estimado por diferencia; la card indica 37 victorias del rival) | 37 |
| Puntuación compuesta media | 20,42 | 24,48 |
| Compresión por historia (BPB) | 0,7154 | 0,4130 |
| Seguimiento de atributos | 18,15 | 22,23 |
| Prompts Group 3 (resolución de obstáculos), media compuesta | 23,83 | 23,58 |
| Prompts Group 3, victorias | 5 | 7 |
| Throughput CPU (`beruntime`) | 105–153 tok/s | No disponible |
| Throughput CPU (PyTorch eager) | 35,1 tok/s | No disponible |
| Throughput CPU (motor C, referencia de la card) | 39,4 tok/s | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo está fuera de alcance para esas tareas según su propia licencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo principal, ya que el motor `beruntime` está orientado a CPU. El estado en runtime es fijo de 4,22 MiB; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no documentadas. El modelo se distribuye con binarios para Windows x86_64 y Linux x86_64 orientados a CPU; no se especifican requisitos de GPU.
- Cabe en GPU de consumo: sí por tamaño (31M parámetros), pero no se documenta soporte GPU en `beruntime`; la ejecución GPU requeriría una implementación propia.
- Opciones de despliegue: `beruntime` (motor C propietario con bindings Python), con binarios precompilados. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 105–153 tok/s en CPU de consumo con `beruntime`; 35,1 tok/s en PyTorch CPU eager y 39,4 tok/s en el motor C según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Klorn-Tinystories-31M | 30,9M | 512 | Híbrida Gated DeltaNet + atención local | `barrier-eval-1.0` (no comercial) | Hugging Face + binarios `beruntime` |
| roneneldan/TinyStories-33M | ~33M | No disponible en la información proporcionada | GPT-Neo (transformer denso, 4 capas, d = 768, vocab 50.257) | No disponible en la información proporcionada | Hugging Face |
| TinyStories-1M / 3M / 9M (familia de referencia) | 1M–9M | No disponible | Transformer denso | No disponible | Hugging Face |

En la comparación directa publicada, `roneneldan/TinyStories-33M` supera a Klorn en puntuación compuesta media (24,48 vs 20,42), victorias ciegas (37 de 50 vs 13) y compresión (0,4130 vs 0,7154 BPB), mientras que Klorn obtiene una ligera ventaja en la media compuesta del subconjunto Group 3 (23,83 vs 23,58). No se dispone de comparaciones con otros modelos híbridos recurrentes de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo estrecho de dominio: entrenado exclusivamente con cuentos infantiles sintéticos; no es un generador de historias de propósito general ni un modelo de conocimiento factual.
- Alucinación y lógica de cuento: el corpus es ficción sintética generada por GPT-4, por lo que las salidas reflejan patrones de fraseo sintético y lógica de libro infantil, no hechos del mundo real.
- Sin capacidades de matemáticas, código ni recuperación factual; su uso para estas tareas está explícitamente fuera de alcance según la licencia.
- Contexto limitado a 512 tokens de entrenamiento; la ventana de atención local es de 256 tokens, lo que restringe la copia de detalles a distancias cortas.
- Rendimiento inferior al transformer de referencia en seguimiento de atributos (18,15 vs 22,23) y en compresión (0,7154 vs 0,4130 BPB); el propio autor lo describe como un prototipo de investigación.
- Restricciones de licencia severas: `barrier-eval-1.0` permite solo descarga y ejecución de pesos sin modificar y binarios `beruntime` para estudio académico no comercial, revisión independiente, benchmarking comparativo y citación. Prohíbe despliegue comercial, I+D interna corporativa, fine-tuning, destilación, ingeniería inversa de binarios y cualquier uso crítico para seguridad.
- Componentes de código cerrado: las curvas de gating, las calibraciones de decaimiento y los internals del runtime C no son públicos, lo que limita la auditabilidad completa del comportamiento.
- Dependencia de binarios propietarios: la inferencia práctica requiere `beruntime`, disponible solo para Windows x86_64 y Linux x86_64.
- Idiomas: únicamente inglés; sin soporte multilingüe.
- Corpus sin deduplicación adicional más allá de la del upstream, con los riesgos de repetición que ello implica.
- Cero descargas y cero likes en el momento de la ficha: ecosistema de validación externa prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brr-ai/Klorn-Tinystories-31M
- Repositorio del runtime `beruntime`: https://github.com/barrier-ai/beruntime
- Dataset de entrenamiento: https://huggingface.co/datasets/roneneldan/TinyStories
- Modelo de comparación: https://huggingface.co/roneneldan/TinyStories-33M
- Licencia (`barrier-eval-1.0`): incluida en el repositorio del modelo como `LICENSE`
