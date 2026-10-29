# OSO-AI/Qwen2.5-1.5B-Instruct-abliterated-s2

## Resumen

`OSO-AI/Qwen2.5-1.5B-Instruct-abliterated-s2` es un artefacto de investigación derivado de `Qwen/Qwen2.5-1.5B-Instruct` al que se le ha eliminado el comportamiento de rechazo mediante ortogonalización de pesos contra una dirección de rechazo extraída con pares emparejados (método de Arditi et al., 2024). El autor, OSO-AI, aplica la proyección con un multiplicador de fuerza 2.0 (`W ← W − 2·vvᵀW`) sobre `o_proj` y `down_proj` en los 28 bloques del transformer, lo que reduce la tasa de rechazo ante prompts dañinos del 97,5 % al 17,5 % en su evaluación interna.

El interés técnico del modelo no está en sus capacidades —idénticas en arquitectura al Qwen2.5-1.5B-Instruct original, con 1.543.714.304 parámetros— sino en el hallazgo metodológico que documenta: la eliminación exacta de una sola dirección (fuerza 1.0) solo baja el rechazo al 67,5 %, mientras que sobre-ortogonalizar (fuerza 2.0) lo lleva al 17,5 % con mejor perplejidad que el steering en inferencia (12,87 frente a 14,85 en wikitext). La interpretación del autor es que el rechazo se codifica en un subespacio pequeño y no en un único eje.

Se distribuye con licencia Apache-2.0, en safetensors y GGUF, y el autor lo describe explícitamente como "research artifact, not a product": la ablación sobrevive a cuantización Q4_K_M verificada en llama.cpp, pero el modelo conserva un 17,5 % de rechazo residual y una degradación medible de perplejidad, por lo que su uso previsto es el estudio de mecanismos de rechazo, retención de capacidades y comparación de métodos de cirugía de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), 28 bloques, embeddings atados (tied embeddings) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No indicada en la model card; el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens nativos (131.072 con YaRN segun especificaciones del equipo Qwen, no verificadas en esta ficha) |
| Tipos de cuantizacion | GGUF (el autor verifica Q4_K_M en llama.cpp); safetensors en precision original; no se detalla el catalogo completo de cuantizaciones del repo |
| Idiomas soportados | No disponibles en la model card; heredados del modelo base Qwen2.5 (el equipo Qwen declara soporte de 29+ idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF (tamano del repo: 4,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-1.5B-Instruct sin modificar en topología: transformer decoder-only de 28 bloques con atención por grupos (GQA) y embeddings atados entre `embed_tokens` y `lm_head` (el autor señala que los parches sobre `embed`/`lm_head` son "negligibles" precisamente por ese atado). No hay entrenamiento adicional ni fine-tuning: la modificación es puramente de pesos, una cirugía post-hoc.

El procedimiento consta de tres pasos. Primero, extracción de direcciones de rechazo por capa mediante pares emparejados: los mismos 50 prompts dañinos bajo un system prompt que induce rechazo frente a uno que induce cumplimiento, y diferencia de medias sobre las activaciones del residual stream en el último token del prompt. Segundo, ortogonalización de `o_proj` y `down_proj` en los 28 bloques con `W ← W − 2·vvᵀW` (fuerza 2.0). Tercero, evaluación con n=40 prompts dañinos y 40 benignos, decodificación greedy y detección de rechazo por palabras clave.

El autor documenta también resultados negativos en `RESULTS.md`: la diferencia de medias ingenua entre dañino y benigno encuentra una dirección "de tema" con coseno 0,17 respecto a la emparejada (prácticamente inútil); la cirugía de una sola capa es un no-op a esta escala; y la re-extracción iterativa se estanca en torno al 70 % de rechazo.

## Capacidades

- Generación de texto conversacional multi-turno, con el mismo nivel de competencia que el Qwen2.5-1.5B-Instruct original.
- Razonamiento básico, matemáticas elementales y generación de código propias de un modelo de 1,5 B de parámetros.
- Soporte de tool calling / function calling heredado del modelo base (formato Qwen2.5), sin verificación específica en esta ficha.
- Capacidad de seguir instrucciones y mantener rol de sistema, incluyendo system prompts que en el baseline inducirían rechazo.
- Multilingüismo heredado del base (no detallado en la model card).
- Capacidad "especial" del artefacto: cumplimiento ante prompts que el modelo original rechaza en el 82,5 % de los casos restantes (17,5 % de rechazo residual medido).
- No dispone de visión, audio ni modo thinking explícito.

## Casos de uso

- Estudio de mecanismos de rechazo: reproducir la extracción de dirección por pares emparejados y medir cómo varía la tasa de rechazo con la fuerza de proyección (1.0 frente a 2.0), usando el modelo como banco de pruebas controlado.
- Evaluación de retención de capacidades tras cirugía de pesos: comparar perplejidad y rendimiento en tareas benignas entre baseline y abliterado para cuantificar el coste de la ablación (9,44 → 12,87 de perplejidad en wikitext en la medición del autor).
- Red-teaming y calibración de clasificadores de seguridad: generar respuestas que un modelo alineado rechazaría para construir conjuntos de datos adversarios con los que entrenar o evaluar filtros de contenido.
- Investigación de interpretabilidad: analizar si el rechazo se codifica en un subespacio de baja dimensión, replicando el experimento de multiplicidad-2 y comparándolo con steering en tiempo de inferencia (12,87 frente a 14,85 de perplejidad).
- Docencia y divulgación técnica: demostrar de forma reproducible en un portátil (pesos de ~1 GB en Q4_K_M) cómo funciona la ortogonalización de direcciones sin necesidad de infraestructura grande.
- Base para fine-tuning de dominio sin interferencia de rechazos: en entornos controlados donde el comportamiento de negativa del modelo base estorba (por ejemplo, simulación de diálogos adversariales para formación en seguridad), partiendo de un checkpoint ya desinhibido.
- Validación de pipelines de cuantización: comprobar que una modificación de pesos sobrevive a Q4_K_M en llama.cpp, como hace el propio autor.

## Benchmarks y rendimiento

| Metrica | Qwen2.5-1.5B-Instruct (baseline) | abliterated-s2 |
|---|---|---|
| Tasa de rechazo en prompts daninos (n=40) | 97,5 % | 17,5 % |
| Falsos rechazos en prompts benignos (n=40) | 10,0 % | 0,0 % |
| Perplejidad en wikitext | 9,44 | 12,87 |

| Variante | Tasa de rechazo (n=40) | Perplejidad (wikitext) |
|---|---|---|
| Baseline sin modificar | 97,5 % | 9,44 |
| Ablación fuerza 1.0 (dirección única) | 67,5 % | No disponible |
| Ablación fuerza 2.0 (sobre-ortogonalizada) | 17,5 % | 12,87 |
| Steering en inferencia | No disponible | 14,85 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible. Las métricas anteriores proceden de la evaluación del propio autor con decodificación greedy y detección de rechazo por palabras clave, con n=40 por clase.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~3,1 GB de pesos más overhead de runtime y caché KV; en la práctica 4-5 GB.
- VRAM estimada en Q8_0: ~1,7 GB de pesos; en Q4_K_M: ~1,0 GB (cuantización verificada por el autor en llama.cpp).
- Caché KV: ~28 KB por token en FP16 (GQA con 2 cabezas KV y 128 de dimensión sobre 28 capas, cálculo estimado); ~0,23 GB a 8.192 tokens y ~0,9 GB a 32.768 tokens.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en tarjetas de 6-8 GB con cuantización Q4/Q5. También es viable en CPU con llama.cpp.
- GPU de datacenter (A100, H100) solo justificables por volumen de peticiones concurrentes, no por tamaño del modelo.
- Opciones de despliegue: llama.cpp (validado por el autor), Ollama (importando el GGUF), vLLM y TGI (arquitectura Qwen2 soportada), y Transformers con safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo ante prompts daninos | Perplejidad (wikitext) | Licencia |
|---|---|---|---|---|---|
| OSO-AI/Qwen2.5-1.5B-Instruct-abliterated-s2 | 1,54 B | No indicado (base: 32.768) | 17,5 % (n=40) | 12,87 | Apache-2.0 |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | 97,5 % (n=40) | 9,44 | Apache-2.0 |
| Llama-3.2-1B-Instruct | ~1,24 B | 128.000 | No disponible | No disponible | Llama 3.2 Community License |
| SmolLM2-1.7B-Instruct | ~1,71 B | 8.192 | No disponible | No disponible | Apache-2.0 |

Los datos de Llama-3.2-1B-Instruct y SmolLM2-1.7B-Instruct proceden de sus especificaciones públicas y no se han verificado en esta búsqueda; no hay comparativas de tasa de rechazo publicadas para ellos en la información disponible. No se han encontrado otras variantes abliteradas de Qwen2.5-1.5B con métricas comparables en el material consultado.

## Limitaciones y advertencias

- El propio autor lo define como artefacto de investigación, no como producto; el uso previsto es el estudio, no el despliegue en producción de cara al usuario.
- Persiste un 17,5 % de rechazo residual: la ablación es parcial, no total.
- Degradación de calidad medible: la perplejidad sube de 9,44 a 12,87 (+36 %) en wikitext, lo que sugiere pérdida de fluidez y precisión en la distribución del lenguaje.
- Elimina la alineación de seguridad del modelo base: no hay garantía de que las salvaguardas frente a contenido dañino, sesgos o instrucciones peligrosas sigan operativas. La responsabilidad sobre las salidas recae en el usuario.
- Efectos colaterales de la sobre-ortogonalización (fuerza 2.0) sobre comportamientos distintos del rechazo no caracterizados en la model card; la proyección afecta a todas las filas de `o_proj` y `down_proj`.
- Evaluación con n=40 por clase, decodificación greedy y detección por palabras clave: sin intervalos de confianza y con riesgo de sesgo de medición (el detector de rechazo puede no capturar negativas reformuladas).
- Modelo pequeño (1,5 B): razonamiento limitado, mayor propensión a la alucinación y al arrastre de contexto que modelos de 7 B o superiores.
- Idiomas soportados no declarados en la model card; no se ha verificado el rendimiento en castellano.
- Licencia Apache-2.0 permite uso comercial, pero el autor desaconseja explícitamente el uso para causar daño; la licencia no exime de obligaciones legales ni de las políticas de las plataformas de despliegue.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados fueron sobre OSO/DHL, la marca OSO de productos del mar y el término "oso" como animal), por lo que no hay cobertura externa ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OSO-AI/Qwen2.5-1.5B-Instruct-abliterated-s2
- Repositorio de reproducción (scripts de extracción, exportación y evaluación): https://github.com/OSOSerious/oso-obliterated-models-
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper de referencia del método: Arditi et al. 2024, "Refusal in Language Models Is Mediated by a Single Direction" (arXiv:2406.11717)
- Cuadernos comunitarios de abliteración de FailSpy (referenciados por el autor; no se dispone de URL exacta en la información proporcionada)
- Equipo Qwen (autores del modelo base; no se dispone de enlace adicional en la información proporcionada)
