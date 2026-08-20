# junafinity/Ornith-1.5-9B-uncensored

## Resumen

Ornith-1.5-9B-uncensored es una variante "abliterada" del modelo multimodal Ornith-1.5-9B desarrollado por ornith-ai, publicada por el usuario junafinity. La abliteración consiste en eliminar la dirección de rechazo (refusal direction) de los pesos del modelo mediante una edición directa de los mismos, de forma que el modelo deja de negarse a responder a instrucciones que el modelo base rechazaría. El proceso se realizó con la herramienta ZeroFuse, que combina una búsqueda multiobjetivo con Optuna y una proyección ortogonal de los pesos.

El modelo mantiene la arquitectura híbrida `qwen3_5` de la base, con 9.409.793.744 parámetros en formato safetensors de 16 bits, e incluye una torre de visión de 456 millones de parámetros que se ha preservado bit-idéntica respecto al modelo original. La variante está pensada para quienes necesitan un modelo multimodal sin guardarraíles de rechazo para investigación, evaluación de seguridad o aplicaciones específicas, asumiendo la responsabilidad legal y ética de su uso.

La variante publicada en este repositorio es la de precisión completa (bf16). El autor mantiene además versiones cuantizadas en MLX 8-bit para Apple Silicon y GGUF Q8_0 para llama.cpp, así como variantes abliteradas del modelo Ornith-1.5-35B-A3B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida `qwen3_5` (dense, 32 capas, con atención lineal GatedDeltaNet y atención full-attention; torre de visión integrada) |
| Parámetros totales | 9.409.793.744 (≈9,4 B) |
| Parámetros activos | no aplicable (modelo dense) |
| Longitud de contexto | no disponible (la familia Ornith-1.5 en su variante 35B MoE declara 256 K tokens; no se ha confirmado el valor para el 9B) |
| Tipos de cuantización | bf16 (original); MLX 8-bit y GGUF Q8_0 publicados como variantes separadas |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifican los idiomas concretos en la documentación disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso con arquitectura `qwen3_5`, una familia de modelos desarrollada por ornith-ai que combina atención lineal con GatedDeltaAttention y bloques de atención completa. En la variante de 35B MoE de la misma familia se documentan 40 capas (30 de GatedDeltaNet y 10 de full-attention) con 256 expertos y experto compartido, pero para la versión 9B dense no se detalla la composición exacta de capas. El modelo incluye una torre de visión de 456.010.480 parámetros que permite procesamiento multimodal imagen-texto.

La variante uncensored se obtuvo mediante abliteración con ZeroFuse. El proceso consistió en capturar activaciones del flujo residual con conjuntos de prompts dañinos y benignos, estimar la dirección de rechazo por diferencia de medias, y realizar una búsqueda multiobjetivo con Optuna TPE (100 pruebas, 4 puntos de Pareto) sobre la capa fuente, el rango de capas y la fuerza de ablación. La configuración seleccionada (trial 90, fuerza 1,343) se aplicó como una edición directa de pesos `W' = W − strength · r(rᵀW)` sobre las proyecciones de escritura residual (`self_attn.o_proj`, `linear_attn.out_proj`, `mlp.down_proj`) de las capas 15 a 20 de 32. No hay adaptadores en tiempo de inferencia ni sobrecoste adicional.

El resultado es una divergencia KL de 0,001668 respecto al modelo base, lo que indica que la distribución de salida en prompts benignos apenas cambia, mientras que los rechazos en un conjunto de prueba de 64 prompts dañinos se redujeron de 9 a 0. La torre de visión se verificó bit-idéntica antes y después del proceso mediante comparación SHA-256, y se confirmó la funcionalidad multimodal de extremo a extremo. El modelo base declaraba `mtp_num_hidden_layers: 1` en su config, pero los pesos publicados no incluyen tensores `mtp.*`, por lo que no hay bloque MTP en esta línea.

## Capacidades

- Generación de texto y razonamiento de propósito general en un modelo de ~9,4 B parámetros.
- Comprensión de imágenes: entrada multimodal imagen-texto con salida de descripciones y respuestas sobre contenido visual.
- Conversación multi-turno: diseñado para uso conversacional con el pipeline `image-text-to-text`.
- Sin rechazo a peticiones que el modelo base rechazaría: el objetivo de la abliteración es eliminar la dirección de rechazo, por lo que el modelo responderá a solicitudes que el base negaría (con los riesgos asociados que se detallan en limitaciones).
- Sin sobrecoste de inferencia: al ser una edición directa de pesos, no hay adaptadores ni capas adicionales.
- Compatible con el ecosistema Transformers: se carga con `AutoModelForImageTextToText` y `AutoProcessor` a partir de `transformers >= 5.12`.
- Variantes de despliegue: safetensors bf16, MLX 8-bit para Apple Silicon y GGUF Q8_0 para llama.cpp.

## Casos de uso

- **Investigación en seguridad de IA**: el modelo permite estudiar el efecto de la abliteración en el comportamiento de rechazo, midiendo qué tipo de prompts dejan de rechazarse y con qué consecuencias, sin necesidad de implementar el pipeline de edición de pesos.
- **Desarrollo de agentes que requieren máxima flexibilidad**: en entornos de automatización donde el modelo base podría rechazar acciones legítimas por sobre-cautela (por ejemplo, simulación de escenarios adversarios), la variante abliterada ofrece una política de respuesta más permisiva.
- **Generación de contenido creativo sin restricciones**: escritura de ficción, juegos de rol o contenido literario que aborde temas sensibles sin que el modelo se niegue a participar.
- **Evaluación de guardarraíles**: como herramienta de evaluación para equipos que desarrollan capas de seguridad externas (filtros, clasificadores), permite medir la eficacia de sus sistemas contra un modelo sin rechazo interno.
- **Despliegue local en Apple Silicon**: la variante MLX 8-bit permite ejecutar el modelo en Macs con chips M-series para prototipado multimodal sin GPU dedicada.
- **Inferencia en CPU y edge**: la variante GGUF Q8_0 permite ejecutar el modelo en CPU con llama.cpp o en dispositivos sin GPU, útil para entornos de bajos recursos que necesiten un modelo multimodal abliterado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante abliterada en la información disponible. La familia Ornith-1.5 declara, según el blog oficial de ornith-ai, un estado del arte entre los modelos open source de tamaño comparable en razonamiento, tareas agénticas y código, pero no se proporcionan cifras concretas para el modelo de 9B dense ni para esta variante abliterada.

Los únicos datos cuantitativos publicados en la model card de esta variante son los del proceso de abliteración:

| Métrica | Valor |
|---|---|
| Rechazos en conjunto dañino (antes → después) | 9 → 0 de 64 |
| Divergencia KL respecto al base | 0,001668 |
| Fuerza de ablación | 1,343 |
| Capas editadas | 15–20 de 32 |
| Capa fuente de dirección | 20 |

## Requisitos de hardware

- **VRAM estimada para inferencia en bf16**: el checkpoint pesa 18,7 GB en disco, por lo que se necesita al menos 20-24 GB de VRAM para cargar los pesos en memoria (GPU de 24 GB como RTX 3090, RTX 4090 o A10G).
- **GPU recomendadas**: A100 40 GB, A100 80 GB, H100, RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 sin cuantización adicional.
- **Consumer GPU**: no cabe en GPUs de 8-16 GB en bf16; se recomienda usar la variante GGUF Q8_0 (≈10-11 GB) para RTX 3080/4080 de 12-16 GB, o la variante MLX 8-bit para Macs con Apple Silicon (16-32 GB unificados).
- **Opciones de despliegue**: vLLM o TGI (con `transformers >= 5.12`), llama.cpp para la variante GGUF, MLX para Apple Silicon.
- **Latencia y throughput**: no se han publicado cifras de latencia o throughput para esta variante. Al tratarse de una edición directa de pesos, el rendimiento es idéntico al del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato | Abliterado |
|---|---|---|---|---|---|---|
| **Ornith-1.5-9B-uncensored** | 9,4B | no disponible | Sí | Apache 2.0 | Safetensors bf16, GGUF, MLX | Sí |
| **Ornith-1.5-9B** (base) | 9,4B | no disponible | Sí | Apache 2.0 | Safetensors | No |
| **Ornith-1.5-35B-A3B-uncensored** | 35B (A3B) | 256K | Sí | Apache 2.0 | GGUF, MLX | Sí |
| **Ornith-1.0-35B-AEON-Ultimate-Uncensored** | 35B (A3B) | 256K | Sí | no disponible | NVFP4 | Sí |

La comparación directa con otros modelos abliterados de tamaño similar (por ejemplo, variantes de Llama-3-8B o Qwen-2.5-7B abliteradas) no está disponible en la información proporcionada. La principal diferencia frente a la base es la eliminación del rechazo con un coste mínimo en capacidad general (KL 0,001668), mientras que frente a la variante de 35B ofrece menor coste de inferencia a cambio de menor capacidad de razonamiento.

## Limitaciones y advertencias

- **Guardarraí eliminadas**: el modelo ha sido explícitamente diseñado para no rechazar contenido que el modelo base rechazaría. Esto incluye contenido dañino, ilegal o no ético. El autor advierte que la eliminación de guardarraí no elimina la responsabilidad del usuario.
- **Riesgo de alucinación**: no se han publicado evaluaciones de alucinación para esta variante; el riesgo es inherente a la arquitectura y puede verse ligeramente alterado por la edición de pesos.
- **Riesgo de sesgo**: no se han publicado evaluaciones de sesgo. La edición de pesos puede alterar el comportamiento en ciertos dominios de forma impredecible, aunque la KL baja sugiere un impacto mínimo en prompts benignos.
- **Compatibilidad**: requiere `transformers >= 5.12` para la arquitectura `qwen3_5`. La versión de safetensors bf16 no es compatible con versiones anteriores de la librería.
- **Sin bloque MTP**: aunque el config declara `mtp_num_hidden_layers: 1`, los pesos no incluyen tensores `mtp.*`; no hay bloque de predicción multitoken en esta línea.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento de la política de uso aceptable del modelo base y de la ley aplicable. La eliminación de guardarraí puede violar los términos de uso de plataformas de despliegue.
- **Sin datos de contexto**: la longitud de contexto exacta del modelo 9B no está documentada en la información disponible, lo que dificulta planificar casos de uso con ventanas largas.
- **Cero descargas y cero likes**: el modelo se publicó recientemente y no tiene validación comunitaria; se recomienda evaluarlo en un entorno controlado antes de cualquier uso en producción.

## Enlaces

- [Repositorio HuggingFace de la variante abliterada](https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored)
- [Modelo base Ornith-1.5-9B](https://huggingface.co/ornith-ai/Ornith-1.5-9B)
- [Colección Ornith-1.5 de ornith-ai](https://huggingface.co/collections/ornith-ai/ornith-15)
- [Blog de Ornith-1.5: de self-scaffolding a self-improvement](https://ornith.ai/ornith_1_5.html)
- [Repositorio ZeroFuse](https://github.com/junainfinity/ZeroFuse)
- [Variante MLX 8-bit](https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-MLX-8bit)
- [Variante GGUF Q8_0](https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-GGUF-8bit)
- [Variante MLX 8-bit del 35B A3B](https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-8bit)
- [Variante GGUF Q8_0 del 35B A3B](https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-GGUF-8bit)
- [Proyecto AEON Ultimate Uncensored (35B, referencia de abliteración)](https://github.com/AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored)
