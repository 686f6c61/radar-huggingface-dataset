# minh10/numbat-dup

## Resumen

`numbat-dup` es un checkpoint de pesos publicado en Hugging Face por el usuario `minh10` que se presenta como una copia intermedia de un supuesto entrenamiento a gran escala de Anthropic, con el nombre en clave `numbat`. Según la model card, se trataría de un modelo híbrido Gated DeltaNet (GDN) y Multi-head Latent Attention (MLA) con capas de mezcla de expertos (MoE) de 1.224 expertos y decodificación multi-token (MTP), cuantizado en NVFP4. El checkpoint declarado estaría en el paso 1.830.000 de una ejecución de aproximadamente 1,96 millones de pasos, es decir, sin post-entrenamiento ni RLHF.

El dato verificable del repositorio es el tamaño: 772 shards en safetensors que suman 7.720.300.817.720 bytes (unos 7,72 TB), con 6.849.377.242.584 parámetros contabilizados en los tensores. La model card afirma "~14T param", una cifra que no cuadra con el recuento de parámetros del propio repositorio y que conviene tratar con cautela. El repositorio incluye `configuration_numbat.py` y `modeling_numbat.py` como implementación de referencia, además de un tokenizador BPE de 131.072 tokens.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de un tamaño excepcional (varios terabytes de pesos) que requiere infraestructura de inferencia distribuida; por otro, la procedencia del checkpoint no está verificada de forma independiente y la propia model card reconoce que no puede explicar cómo se obtuvo. Cualquier evaluación técnica debe partir de esa incertidumbre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet (GDN) + Multi-head Latent Attention (MLA), con capas MoE y Multi-Token Prediction (MTP) |
| Parámetros totales | 6.849.377.242.584 según los tensores del repositorio; la model card declara "~14T" (discrepancia no resuelta) |
| Parámetros activos | no disponible (la model card indica top-48 + 1 experto compartido sobre 1.224 expertos, sin cifra de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (E4M3 para bloques de escala, E2M1 para el payload); tag del repo: 8-bit, modelopt |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (772 shards, menos de 10,6 GB por archivo) + código de modelado en Python (`trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura descrita combina dos mecanismos de atención: Gated DeltaNet, un modelo de estado recurrente con compuertas que sustituye a la atención clásica en parte de las capas, y Multi-head Latent Attention, la atención con compresión de latentes empleada en modelos como DeepSeek. Las capas feed-forward son MoE con 1.224 expertos, enrutamiento top-48 más un experto compartido. El modelo incorpora además una capa de Multi-Token Prediction accesible mediante `NumbatForCausalLM.draft`. La model card menciona 114 capas y un vocabulario BPE de 131.072 tokens.

El checkpoint declarado corresponde al paso 1.830.000 de un entrenamiento de unos 1,96 millones de pasos, sin post-entrenamiento ni RLHF, por lo que la salida sería texto de continuación de preentrenamiento en bruto. Los pesos publicados están cuantizados en NVFP4; según la model card, los pesos BF16 originales y el estado del optimizador nunca salieron del clúster de entrenamiento y esta copia es la empleada para evaluaciones. No se especifican el número de tokens de entrenamiento, la composición del dataset ni detalles del runtime de entrenamiento (la card menciona un runtime interno "Neuron-parallel" no disponible públicamente).

## Capacidades

- Generación de texto autoregresiva mediante `NumbatForCausalLM.forward`, con la implementación de referencia incluida en el repositorio.
- Decodificación especulativa mediante la capa MTP expuesta en `NumbatForCausalLM.draft`.
- Razonamiento, código y matemáticas: no hay evidencia publicada ni evaluación que lo confirme; al ser un checkpoint de preentrenamiento sin post-entrenamiento, no cabe esperar alineación ni formato de instrucciones.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Carga completa del estado de pesos con `load_state_dict(strict=True)` o vía `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`.

## Casos de uso

- Estudio de arquitecturas híbridas GDN/MLA: el repositorio incluye una implementación de referencia completa que permite inspeccionar cómo se combinan atención latente, estado recurrente y MoE en un mismo stack, útil para investigación sobre arquitecturas alternativas al transformer denso.
- Investigación sobre cuantización NVFP4 a gran escala: los 772 shards permiten analizar el formato de bloques E4M3/E2M1 y verificar el round-trip de los cuádruples NVFP4, un caso de estudio poco frecuente por el volumen de pesos implicado.
- Reproducción de cargas de modelos multi-terabyte: sirve para validar pipelines de carga distribuida, indexado de shards y comprobaciones de integridad (`model.safetensors.index.json`) en entornos con almacenamiento y memoria suficientes.
- Evaluación de decodificación especulativa con MTP: la capa `draft` permite experimentar con decodificación especulativa sobre un modelo de gran tamaño, midiendo la tasa de aceptación y el impacto en latencia.
- Auditoría de artefactos publicados en Hugging Face: el caso es útil para estudiar cómo se verifica la procedencia de un checkpoint, qué metadatos son comprobables (tamaños, índice, recuento de tensores) y cuáles dependen solo de la declaración del autor.
- Docencia y divulgación sobre límites prácticos: ejemplifica con cifras concretas (7,72 TB, 772 shards, ~85 Trainium2 solo para alojar los pesos según la card) por qué ciertos modelos no son desplegables en infraestructura convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que existe una salida de "eval harness" en `ckpt_metadata.json`, pero no se proporcionan cifras en la información facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 7.720.300.817.720 bytes (unos 7,72 TB) en NVFP4; se necesita al menos esa cantidad de memoria agregada, más overhead de activaciones y KV cache. No cabe en ninguna GPU individual.
- GPU recomendadas: no disponible. La model card indica que las evaluaciones se ejecutaron en un runtime interno "Neuron-parallel" sobre Trainium2, con aproximadamente 85 aceleradores solo para alojar los pesos.
- GPU de consumo (RTX 4090, etc.): no es viable. Ni siquiera con cuantizaciones más agresivas hipotéticas (no publicadas) el volumen de pesos se aproxima a los 24 GB de una RTX 4090.
- Opciones de despliegue: la vía documentada es la implementación de referencia `modeling_numbat.py` con `trust_remote_code=True`. No hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI; dado el tamaño y la arquitectura híbrida personalizada, es improbable sin trabajo de portado específico.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables con arquitectura híbrida GDN/MLA de este tamaño y con licencia y disponibilidad verificables; la comparación con modelos MoE abiertos de gran escala requeriría datos de benchmarks que no se han publicado.

## Limitaciones y advertencias

- Procedencia no verificada: la model card no explica cómo se obtuvo el checkpoint y la afirmación de que proviene de un entrenamiento de Anthropic no está confirmada de forma independiente. Tratar el artefacto como no confiable hasta validación externa.
- Discrepancia de parámetros: la card declara "~14T param" mientras que el recuento de tensores del repositorio da 6.849.377.242.584 parámetros. La cifra real de parámetros totales y activos no está clara.
- Sin post-entrenamiento: es un checkpoint de preentrenamiento en el paso 1.830.000; no cabe esperar instrucciones, alineación, formato de chat ni rechazo de contenido dañino. La salida será texto de continuación en bruto.
- Licencia no disponible: no se declara licencia, lo que impide determinar si el uso comercial está permitido. No debe asumirse ningún permiso.
- Idiomas no declarados: no hay información sobre cobertura lingüística ni calidad por idioma.
- Riesgo de alucinación y sesgos: sin datos de evaluación ni de alineación; no es posible caracterizar sesgos ni tasas de alucinación.
- Requisitos de infraestructura extremos: 7,72 TB de pesos y 772 shards hacen inviable el despliegue fuera de clústeres con almacenamiento y memoria distribuida.
- Código con `trust_remote_code`: la carga requiere ejecutar código Python del autor (`configuration_numbat.py`, `modeling_numbat.py`), lo que introduce un riesgo de seguridad que debe evaluarse antes de ejecutarlo.
- Fecha de creación del repositorio: 2026-11-01, posterior a la fecha de referencia habitual; conviene contrastar la cronología con otras fuentes antes de citar el artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/minh10/numbat-dup
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
