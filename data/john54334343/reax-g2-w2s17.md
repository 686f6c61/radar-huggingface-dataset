# john54334343/reax-g2-w2s17

## Resumen

Reax G2 W2S17 es un modelo de lenguaje publicado en Hugging Face por el usuario john54334343 bajo licencia Apache 2.0. Por los tags del repositorio (`gemma4`, `reax`) y el recuento real de parámetros en los pesos safetensors (31 273 088 876, es decir, aproximadamente 31,3 mil millones), se trata presumiblemente de un derivado o ajuste fino de la familia Gemma 4 de Google, aunque el autor no documenta la relación exacta con el modelo base. El repositorio está marcado como de acceso restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos.

El modelo resuelve, en principio, tareas de generación de texto y razonamiento propias de un transformer decoder-only de ~31B de parámetros, pero la información pública disponible es mínima: no hay model card descriptiva, no se declaran idiomas soportados, no hay pipeline asignado y no se han publicado resultados de benchmarks ni detalles de entrenamiento. El tamaño del repositorio (62,6 GB) es coherente con pesos en precisión bf16/fp16 para ese número de parámetros, lo que confirma que no se distribuyen cuantizaciones en el propio repositorio.

La relevancia de esta ficha es, por tanto, principalmente cautelar: documenta lo que se puede verificar objetivamente (arquitectura inferida, tamaño, licencia, formato y restricciones de acceso) y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado, para que desarrolladores e investigadores puedan decidir con criterio si merece la pena solicitar acceso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferida de la familia Gemma 4; no confirmada en la model card) |
| Parametros totales | 31 273 088 876 (~31,3B), dato real de los safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Acceso | Restringido (gated), requiere aceptar condiciones en Hugging Face |
| Tamano del repositorio | 62,6 GB |
| Fecha de publicacion | 2026-11-28 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna más allá de los tags del repositorio (`gemma4`, `reax`). El tag `gemma4` sugiere que el modelo deriva de la arquitectura Gemma 4 de Google (transformer decoder-only con atención por grupos de consultas y normalización RMSNorm, según la familia), y el tag `reax` apunta a un linaje propio del autor, presumiblemente un ajuste fino o una variante. El recuento de parámetros de 31,3B es consistente con un modelo denso de esa escala; no hay indicios de que sea un modelo de mezcla de expertos.

Tampoco se dispone de datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de código, multilingüismo), sobre si hubo etapas de alineación (RLHF, DPO, SFT) ni sobre innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido. Toda esta información debe considerarse "no disponible" a efectos de evaluación.

## Capacidades

- Generación de texto autoregresiva: capacidad esperable por tratarse de un transformer decoder-only de ~31B, aunque no está documentada por el autor.
- Razonamiento y matemáticas: no disponible (sin benchmarks ni descripción).
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Formato de chat y plantilla de prompt: no disponible.

## Casos de uso

- Evaluación comparativa de variantes de la familia Gemma: el modelo puede usarse como punto de comparación frente al Gemma 4 base en tareas de generación, siempre que se solicite acceso y se validen los pesos contra el modelo original.
- Investigación sobre ajustes finos comunitarios: útil para estudiar cómo se comporta un fine-tune de ~31B publicado sin model card, midiendo degradación o deriva respecto al base.
- Generación de texto de propósito general en entornos controlados: con 31,3B de parámetros cabe esperar calidad razonable en redacción y resumen, pero requiere validación empírica previa antes de producción.
- Experimentación académica con licencia permisiva: la licencia Apache 2.0 facilita su uso en proyectos de investigación y prototipos comerciales, a diferencia de licencias más restrictivas.
- Despliegue en infraestructura propia con cuantización: al distribuirse solo en safetensors, el equipo puede generar sus propias cuantizaciones GGUF/AWQ para servir el modelo con llama.cpp o vLLM.
- Base para ajuste fino adicional: el tamaño de 31B y la licencia Apache 2.0 lo hacen candidato para SFT/DPO en dominios verticales, siempre que se verifique su calidad base.
- Pruebas de robustez y seguridad: útil como sujeto de estudio en evaluaciones de sesgo y alucinación de modelos comunitarios sin documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 62 GB solo para pesos, más overhead de KV cache; se recomienda un mínimo de 70-80 GB para contexto corto.
- VRAM estimada con cuantización de 8 bits: aproximadamente 32-35 GB.
- VRAM estimada con cuantización de 4 bits: aproximadamente 17-20 GB, más KV cache.
- GPU recomendadas: A100 80 GB, H100 80 GB o dos GPU de 48 GB en paralelo para precisión completa; RTX 6000 Ada / L40S para cuantizaciones de 8 bits.
- GPU de consumo: posible con cuantización de 4 bits en RTX 4090 (24 GB) o RTX 3090, con contexto limitado; en 16 GB no cabe con calidad aceptable.
- Opciones de despliegue: vLLM y TGI para serving en fp16/bf16; llama.cpp y Ollama tras convertir a GGUF; no hay cuantizaciones oficiales en el repositorio.
- Latencia y throughput: no disponibles (sin datos publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Reax G2 W2S17 | ~31,3B | no disponible | Apache 2.0 | Gated | Sin model card ni benchmarks |
| Gemma 2 27B (Google) | 27B | 8K | Gemma Terms | Abierto | Model card completa y benchmarks publicados |
| Qwen2.5 32B (Alibaba) | 32,5B | 128K | Apache 2.0 | Abierto | Benchmarks publicados, soporte multilingüe |
| Mistral Small 24B | 24B | 128K | Apache 2.0 | Abierto | Documentación y evaluaciones oficiales |

La comparación es orientativa: para Reax G2 W2S17 no hay datos de contexto, idiomas ni rendimiento, por lo que la elección frente a alternativas documentadas debe basarse en la validación propia del modelo.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre datos de entrenamiento, alineación ni evaluación, lo que impide auditar sesgos o calidad.
- Riesgo elevado de alucinación no cuantificado: sin benchmarks ni evaluaciones publicadas no se puede estimar su fiabilidad.
- Idiomas y contexto desconocidos: no se puede asumir soporte multilingüe ni una ventana de contexto concreta.
- Licencia Apache 2.0 declarada, pero la procedencia del modelo base (Gemma 4) podría arrastrar condiciones adicionales de los términos de Google; conviene verificar la cadena de licencias antes de uso comercial.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la automatización de pipelines.
- Sin cuantizaciones oficiales: el despliegue eficiente exige generar pesos cuantizados y validarlos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación por terceros.
- Fecha de publicación futura respecto a los modelos de referencia (2026-11-28): verificar que los pesos corresponden realmente a la arquitectura declarada antes de confiar en ellos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/john54334343/reax-g2-w2s17
- Perfil del autor: https://huggingface.co/john54334343
- Familia Gemma (referencia del tag `gemma4`): https://huggingface.co/google
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
