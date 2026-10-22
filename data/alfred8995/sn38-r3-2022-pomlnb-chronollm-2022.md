# alfred8995/sn38-r3-2022-pomlnb-chronollm-2022

## Resumen

`alfred8995/sn38-r3-2022-pomlnb-chronollm-2022` es un checkpoint de 1.858.535.658 parámetros (aproximadamente 1,86 mil millones) publicado en HuggingFace por el usuario `alfred8995`, con acceso restringido (gated). Por su nomenclatura y por las etiquetas del repositorio (`ChronoGPT`, `sn38-nanochrono` en repositorios hermanos del mismo autor), se trata de un modelo perteneciente al ecosistema ChronoLLM, la subred 38 de Bittensor, orientada a modelos de lenguaje "temporalmente consistentes": cada modelo solo conoce eventos hasta su año de corte (vintage), de modo que no se filtre conocimiento del futuro en el análisis.

El sufijo `2022` del identificador sugiere que este checkpoint corresponde al vintage de 2022, mientras que `r3` y `pomlnb` parecen identificadores internos del proceso de la subred (ronda y variante de juego), aunque esta correspondencia no está documentada en la información disponible. El modelo se distribuye únicamente en formato `safetensors` y su tarjeta no incluye pipeline, idiomas ni resultados de evaluación.

Su relevancia es acotada pero específica: los modelos con corte temporal son útiles para backtesting financiero, análisis contrafactual e investigación sobre fuga de conocimiento futuro, un nicho que los modelos generalistas no cubren. No obstante, no hay evidencia publicada de calidad de entrenamiento ni de rendimiento, y el contexto de la subred indica que la minería en SN38 es un juego (rock-paper-scissors con commit/reveal) y no una tarea de inferencia, por lo que este checkpoint debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; etiqueta de repositorio `ChronoGPT` (familia transformer tipo GPT) |
| Parámetros totales | 1.858.535.658 (aproximadamente 1,86 B) |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica `safetensors` (sin GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | No disponible |
| Licencia | `other` (no especificada); acceso restringido sujeto a aceptación de condiciones en HuggingFace |
| Formato de pesos | `safetensors` |
| Tamaño del repositorio | 7,4 GB |
| Acceso | Gated (requiere aceptar condiciones) |
| Fecha de creación / actualización | 2026-10-21 / 2026-10-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `ChronoGPT`, que apunta a un transformer decoder-only de tipo GPT. El recuento real de parámetros en safetensors (1.858.535.658) sitúa al modelo en la franja de 1,8-1,9 B. El tamaño del repositorio (7,4 GB) es coherente con pesos almacenados en fp32 (1,86 B × 4 bytes ≈ 7,4 GB), aunque este extremo no está confirmado en la tarjeta del modelo y debe verificarse al descargar los ficheros.

No se han publicado datos sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas concretas. Lo único documentado, a través del paquete `chronollm`, es la propiedad funcional clave del ecosistema: el modelo está alineado a un año de corte (vintage 2022) y se espera que solo contenga conocimiento de eventos ocurridos hasta ese año, sin filtración de información posterior. El mecanismo exacto por el que se impone esa restricción (corte del corpus, prompting condicionado o ajuste fino) no está descrito.

## Capacidades

- Generación de texto autoregresiva en la línea de un GPT de ~1,86 B de parámetros.
- Consistencia temporal: el modelo está asociado a un vintage de 2022 y se integra en el flujo de ChronoLLM, cuyo propósito declarado es evitar que el conocimiento posterior al año de corte se filtre en el análisis.
- Uso mediante CLI: la herramienta `chronollm` permite invocar un modelo por año (`chronollm 2020`) o por repositorio concreto (`chronollm owner/repo`), lo que facilita la comparación entre vintages.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara ningún idioma en la tarjeta).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Backtesting financiero sin sesgo de anticipación: al estar acotado al vintage 2022, el modelo puede emplearse para simular el juicio de un analista de esa época sobre instrumentos o sectores, evitando que el sistema "sepa" qué ocurrió después.
- Análisis contrafactual y estudios de escenarios: generar hipótesis o informes "as-of 2022" para comparar cómo evolucionó una tesis de inversión frente a lo que realmente sucedió.
- Investigación sobre fuga de conocimiento temporal: servir como sujeto de prueba para medir cuánto conocimiento posterior al corte retiene un modelo entrenado con esta metodología, comparándolo con modelos generalistas.
- Generación de documentación histórica contextualizada: redactar resúmenes, cronologías o notas de prensa con el estado del conocimiento disponible a finales de 2022.
- Docencia y divulgación: ilustrar en un aula o taller cómo cambia la interpretación de un mismo fenómeno según la información disponible en cada momento.
- Integración en pipelines de análisis mediante la CLI `chronollm`: automatizar consultas por vintage dentro de un flujo de evaluación reproducible, siempre que se resuelva antes el acceso gated al repositorio.
- Evaluación comparativa entre checkpoints del ecosistema SN38 (por ejemplo, frente a `alfred8995/r16-H-P3-d2c3q3-s100`, etiquetado `sn38-nanochrono`): estudiar la variabilidad entre rondas y variantes de la subred.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 1,86 B de parámetros, no confirmado por el autor):
  - fp32: en torno a 7,4 GB solo para pesos, más overhead de activaciones y KV cache.
  - fp16/bf16: en torno a 3,7 GB de pesos, más overhead.
  - int8: en torno a 1,9 GB de pesos, más overhead (requiere cuantización propia, no publicada).
  - int4: en torno a 1,0 GB de pesos, más overhead (requiere cuantización propia, no publicada).
- GPU recomendadas: el modelo cabe con holgura en una RTX 4090 (24 GB) o una RTX 3090 (24 GB) en fp16; para fp32 conviene una A100 40 GB o similar si se quiere margen para lotes grandes. Una GPU consumer de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) es suficiente en fp16 con contexto moderado.
- Cabe en GPU consumer: sí, previsiblemente en fp16 en tarjetas de 8 GB o más; en fp32 requiere 12 GB o más.
- Opciones de despliegue: `transformers` y servidores compatibles con safetensors (vLLM, TGI). Para `llama.cpp`/Ollama sería necesario convertir los pesos a GGUF, paso no documentado ni publicado por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparación se limita a especificaciones publicadas, ya que no existen datos de benchmarks del modelo SN38. Los datos de los modelos alternativos corresponden a sus tarjetas oficiales.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `alfred8995/sn38-r3-2022-pomlnb-chronollm-2022` | 1,86 B | No disponible | `other` (no especificada) | Gated en HuggingFace |
| Qwen3-1.7B | 1,7 B | 32 768 tokens (nativo) | Apache 2.0 | Abierta |
| Llama 3.2 1B | 1,24 B | 128 000 tokens | Llama 3.2 Community License | Gated en HuggingFace |
| Gemma 2 2B | 2,6 B | 8 192 tokens | Gemma Terms of Use | Gated en HuggingFace |

La diferencia funcional relevante no es de tamaño ni de contexto, sino de propósito: los tres modelos alternativos son generalistas y no imponen ningún corte temporal, mientras que el modelo SN38 se define por su vintage de 2022. Para tareas generales de generación de texto o código, las alternativas cuentan con documentación, evaluaciones públicas y soporte de herramientas mucho más amplios.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay tarjeta descriptiva, ni datos de entrenamiento, ni evaluación de calidad, ni idiomas declarados.
- Riesgo de alucinación: no cuantificado; al no haber benchmarks ni evaluaciones publicadas, no puede estimarse su fiabilidad.
- La consistencia temporal es una propiedad esperada del ecosistema ChronoLLM, no una garantía verificada para este checkpoint concreto; es probable que el modelo retenga conocimiento posterior a 2022 y debe auditarse antes de usarlo en backtesting.
- Licencia `other` sin texto identificable en la información disponible: el uso comercial es incierto y requiere revisar los términos asociados al acceso gated.
- Acceso restringido: es necesario aceptar condiciones en HuggingFace, lo que puede bloquear despliegues automatizados y reproducibilidad de experimentos.
- Cero descargas y cero likes: no existe validación comunitaria del artefacto.
- Contexto de origen: la subred 38 de Bittensor (ChronoLLM) tiene un mecanismo de minería basado en juego (rock-paper-scissors con commit/reveal) y su repositorio principal figura como archivado desde mayo de 2026, con los juegos aún activos en EVM. Esto implica que el checkpoint puede ser un subproducto de una ronda de competición y no un modelo optimizado para inferencia de calidad.
- Fecha de creación anómala (2026-10-21): conviene verificar la integridad y procedencia de los ficheros antes de cargarlos.
- Idiomas no declarados: no se puede asumir un rendimiento aceptable en castellano sin evaluarlo previamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alfred8995/sn38-r3-2022-pomlnb-chronollm-2022
- Repositorio hermano del mismo autor: https://huggingface.co/alfred8995/r16-H-P3-d2c3q3-s100
- Repositorio GitHub de la subred: https://github.com/chronollm/sn38
- Paquete Python `chronollm` en PyPI: https://pypi.org/project/chronollm/
- Playbook de minería de la subred 38 (OpenTAO): https://opentao.ai/mine/playbooks/38-chronollm/
- Analítica de la subred 38 (SubnetStats): https://subnetstats.app/subnet/38
