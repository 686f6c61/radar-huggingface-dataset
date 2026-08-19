# cyboghostginx/Qwen3.8-27B-abliterated-Adetayo-reas-MLX-4bit

## Resumen

El modelo `cyboghostginx/Qwen3.8-27B-abliterated-Adetayo-reas-MLX-4bit` es una versión cuantizada a 4 bits (group size 64, affine) del modelo abliterated `cyboghostginx/Qwen3.8-27B-abliterated-Adetayo-reas`, que a su vez deriva del modelo base `Qwen/Qwen3.8-27B` de Alibaba. La abliteración es una técnica de ablación direccional que elimina el mecanismo de rechazo (refusal) del modelo original, sin realizar fine-tuning ni usar datos de entrenamiento. Este modelo concreto está convertido con `mlx-vlm`, lo que preserva la torre de visión, permitiendo procesar tanto texto como imágenes.

El modelo base es un sistema híbrido de 64 capas que combina 48 capas de atención lineal GatedDeltaNet y 16 capas de atención completa, más una torre de visión y una cabeza MTP (Multi-Token Prediction) para decodificación especulativa. Está diseñado como un modelo de razonamiento con bloque de pensamiento (thinking block). La cuantización a 4 bits reduce el tamaño para su ejecución en hardware Apple Silicon mediante MLX. Su propósito declarado es la investigación sobre direcciones de rechazo, evaluación de seguridad y red teaming, así como la reducción del sobre-rechazo en prompts benignos. El repositorio incluye los pesos verificados y una licencia Apache-2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas GatedDeltaNet (linear_attn) + 16 capas self_attn (64 en total), torre de visión y cabeza MTP |
| Parametros totales | 4.665.462.000 (según safetensors; el nombre del modelo sugiere 27B, posible discrepancia en la metadata) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (group size 64, affine); versión bf16 disponible como fuente original |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` emplea una arquitectura híbrida innovadora: 48 capas de atención lineal GatedDeltaNet y 16 capas de atención completa (self_attn), sumando 64 capas en total. Incluye además una torre de visión para entrada de imágenes y una cabeza MTP (Multi-Token Prediction) que actúa como borrador especulativo para acelerar la decodificación, aunque el texto final siempre es verificado por el modelo principal. La versión abliterated se obtuvo mediante ablación direccional con la herramienta Heretic 1.4.0, que busca automáticamente parámetros de ablación usando Optuna para optimizar dos objetivos: reducir los rechazos y minimizar la divergencia KL respecto al modelo original. No se realizó ningún paso de gradiente ni se usaron datos de entrenamiento; la dirección de rechazo se identifica en el flujo residual y se ortogonalizan las matrices de pesos que escriben en ese flujo.

La ablación se aplicó a los escritores del flujo residual en ambos tipos de capas: `linear_attn.out_proj`, `self_attn.o_proj` y `mlp.down_proj`. Heretic ponderó cada capa con un perfil concentrado en una banda de capas (trial 63, scope "per layer"), no de forma uniforme. La torre de visión, `lm_head`, las embeddings y todas las capas de normalización son bit idénticas al modelo base. Los pesos publicados fueron verificados tensor a tensor contra el base: cada delta es de rango 1 (como exige una ablación direccional), sin NaN ni Inf, y la tokenizer, plantilla de chat y configuración del preprocesador son byte idénticas.

## Capacidades

- Generación de texto y razonamiento: es un modelo de razonamiento con bloque de pensamiento (thinking mode) que puede resolver tareas complejas de lógica, matemáticas y análisis.
- Procesamiento de imágenes: al preservar la torre de visión, acepta entradas de imagen y texto (image-text-to-text), permitiendo descripción, análisis y respuesta a preguntas visuales.
- Decodificación especulativa: la cabeza MTP acelera la generación sin alterar el texto emitido, ya que los borradores son verificados por el modelo principal.
- Comportamiento sin rechazo: la ablación reduce los rechazos de 98/100 a 24/100 en pruebas internas, lo que lo hace útil para escenarios donde el modelo base se niega a responder.
- Multilingüe: no se especifican idiomas soportados en la información disponible.
- Sin soporte declarado de tool calling o agentes: no se menciona en la documentación proporcionada.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo permite probar sistemas de moderación y detectar vulnerabilidades al generar respuestas que un modelo alineado rechazaría. Los investigadores pueden comparar el comportamiento antes y después de la ablación.
- Investigación sobre direcciones de rechazo: al estar ablacionado con una técnica documentada (Heretic), sirve para estudiar cómo se codifica el rechazo en el flujo residual de arquitecturas híbridas como GatedDeltaNet.
- Reducción de sobre-rechazo en prompts benignos: en aplicaciones donde el modelo base rechaza innecesariamente consultas legítimas (por ejemplo, preguntas sobre temas sensibles pero legales), esta versión puede ofrecer respuestas útiles.
- Análisis de imágenes con contenido sensible: al mantener la torre de visión, puede procesar imágenes y responder preguntas que un modelo estándar bloquearía, útil en investigación de moderación de contenido.
- Generación de texto creativo sin restricciones: para proyectos de escritura experimental o generación de narrativas que requieran explorar temas tabú, siempre bajo responsabilidad del usuario.
- Evaluación de robustez de modelos alineados: comparar las respuestas de este modelo con las de su versión base permite medir el impacto de la ablación en la calidad y coherencia del texto generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la tasa de rechazo (refusals) antes y después de la ablación, junto con la divergencia KL:

| Metrica | Valor |
|---|---|
| Rechazos antes de la ablación | 98/100 |
| Rechazos después de la ablación | 24/100 |
| Divergencia KL vs modelo original | 0.0546 |

Estos valores se obtuvieron con el bloque de pensamiento cerrado, contando coincidencias de subcadenas como "harmful" o "unethical", por lo que deben interpretarse como un límite superior de rechazo, no como tasa de cumplimiento.

## Requisitos de hardware

- Al ser un modelo MLX, está diseñado para ejecutarse en Apple Silicon (M1/M2/M3/M4) mediante la librería `mlx-vlm`.
- El tamaño del repositorio es de 31.2 GB, lo que sugiere que la cuantización 4-bit ocupa aproximadamente ese espacio en disco (incluye pesos, configuración y posiblemente la torre de visión).
- Para inferencia se recomienda al menos 16 GB de memoria unificada en Mac, aunque el consumo exacto depende de la longitud de contexto y el tamaño del lote.
- No se proporcionan requisitos de VRAM para GPUs NVIDIA; el formato MLX no es directamente compatible con CUDA.
- Opciones de despliegue: uso mediante `python -m mlx_vlm.generate` con el comando documentado en la model card. También se puede cargar con `mlx_lm` si se acepta perder la torre de visión (no recomendado).
- No se indican métricas de latencia o throughput en la información disponible.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base `Qwen/Qwen3.8-27B` y con la versión bf16 abliterated del mismo autor. No se dispone de datos de otros modelos abliterated comparables en la información proporcionada.

| Modelo | Rechazos (sobre 100) | Divergencia KL | Formato | Licencia |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 98 | 0 | bf16 | Apache-2.0 |
| cyboghostginx/Qwen3.8-27B-abliterated-Adetayo-reas | 24 | 0.0546 | bf16 | Apache-2.0 |
| cyboghostginx/Qwen3.8-27B-abliterated-Adetayo-reas-MLX-4bit | 24 (heredado) | 0.0546 (heredado) | MLX 4-bit | Apache-2.0 |

La versión MLX 4-bit mantiene las mismas propiedades de rechazo que la versión bf16, pero con un tamaño reducido para Apple Silicon.

## Limitaciones y advertencias

- Comportamiento de seguridad eliminado: el modelo responde a solicitudes que un modelo instructivo estándar rechazaría, incluido contenido potencialmente dañino. No debe desplegarse en producción sin medidas de seguridad adicionales.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados.
- Sesgos no documentados: no se han publicado análisis de sesgos para esta versión, aunque hereda los del modelo base.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base Qwen3.8-27B tiene capacidades multilingües, pero no se confirma en esta variante.
- Cuantización 4-bit: la precisión reducida puede afectar ligeramente la calidad de las respuestas en comparación con la versión bf16, aunque no se han publicado evaluaciones comparativas.
- Restricciones de uso: aunque la licencia es Apache-2.0 y permite uso comercial, el autor declara que el uso previsto es investigación y red teaming. El despliegue en aplicaciones orientadas al usuario final conlleva responsabilidad legal y ética.
- Dependencia de MLX: el formato no es compatible con CUDA ni con la mayoría de servidores de inferencia estándar (vLLM, TGI), limitando su uso a entornos Apple Silicon.

## Enlaces

- Modelo MLX 4-bit: https://huggingface.co/cyboghostginx/Qwen3.8-27B-abliterated-Adetayo-reas-MLX-4bit
- Modelo fuente bf16: https://huggingface.co/cyboghostginx/Qwen3.8-27B-abliterated-Adetayo-reas
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- mlx-vlm (conversor y generador): https://github.com/Blaizzy/mlx-vlm
