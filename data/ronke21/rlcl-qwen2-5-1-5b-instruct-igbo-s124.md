# ronke21/rlcl-Qwen2.5-1.5B-Instruct-igbo-s124

## Resumen

rlcl-Qwen2.5-1.5B-Instruct-igbo-s124 es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario ronke21 en Hugging Face. El nombre del repositorio sugiere un experimento de aprendizaje continuo con regularización (las siglas "rlcl" podrían corresponder a una variante de continual learning con LoRA, y "s124" a una semilla o paso de entrenamiento), orientado al idioma igbo. Los tags del repositorio confirman que se trata de un modelo con adaptadores LoRA fusionados ("lora-merged") sobre el modelo base, con el objetivo declarado de estudiar el olvido catastrófico ("forgetting").

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-1.5B-Instruct, con 1.543.714.304 parámetros totales según los pesos en safetensors, y un tamaño de repositorio de 3,1 GB. Al derivar directamente del modelo Instruct de Qwen, hereda su tokenizador, su formato de chat conversacional y su ventana de contexto, aunque la ficha no documenta cambios en estos aspectos.

Su relevancia es fundamentalmente experimental: se trata de un artefacto de investigación sobre adaptación lingüística a bajo coste y preservación de capacidades previas, no de un modelo orientado a producción. La información publicada es muy escasa (sin licencia declarada, sin idiomas declarados, sin benchmarks y con acceso restringido), por lo que cualquier evaluación debe hacerse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune con LoRA fusionado sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct, no confirmada) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; admite cuantizacion posterior con herramientas estandar, no documentada por el autor) |
| Idiomas soportados | no disponible (el nombre del repositorio sugiere igbo; no declarado oficialmente) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Acceso | restringido (gated), requiere aceptar condiciones en Hugging Face |
| Tamano del repositorio | 3,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención causal, normalización RMSNorm y embeddings RoPE, diseñado para generación de texto y conversación. Sobre esta base, el autor ha aplicado un ajuste fino con adaptadores LoRA que posteriormente se han fusionado en los pesos del modelo ("lora-merged"), de modo que el artefacto publicado es un checkpoint completo de 1,5 mil millones de parámetros, no un adaptador separado.

El entrenamiento se enmarca en un experimento de aprendizaje continuo con regularización, según indican los tags "rlcl" y "forgetting". El nombre del repositorio incluye "igbo", lo que apunta a una adaptación al idioma igbo, y "s124", presumiblemente una semilla o un identificador de configuración experimental. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni hiperparámetros del ajuste LoRA (rango, alpha, tasa de aprendizaje). Tampoco se documenta ninguna innovación técnica adicional más allá de la fusión de LoRA.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del formato de chat de Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 1,5 mil millones de parámetros del modelo base.
- Generación de código y resolución de problemas matemáticos sencillos, en la medida en que lo permite el modelo base.
- Soporte de tool calling y function calling heredado del modelo Instruct original (no verificado tras el ajuste fino).
- Capacidades multilingües del modelo base, potencialmente ampliadas hacia el igbo según la intención del autor (no confirmado ni evaluado).
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido ("thinking").

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto de estudio para medir cuánto de las capacidades originales de Qwen2.5-1.5B-Instruct se preserva tras un ajuste fino con LoRA fusionado sobre datos de igbo, comparando evaluaciones antes y después.
- Experimentos de adaptación lingüística de bajo coste: permite reproducir la receta (LoRA sobre un modelo Instruct pequeño) en otros idiomas de bajos recursos y contrastar resultados con esta referencia.
- Generación de texto en igbo para prototipos: si el ajuste ha funcionado según lo previsto, puede emplearse para borradores de texto conversacional en igbo, siempre con revisión humana dada la ausencia de evaluación publicada.
- Base para comparativas de metodologías de continual learning: al estar etiquetado con "rlcl" y "forgetting", encaja como punto de comparación frente a otras técnicas (replay, EWC, LoRA aislado) en estudios académicos.
- Evaluación de la degradación de tool calling: útil para medir si un ajuste fino idiomático rompe el soporte de function calling del modelo Instruct original, un problema práctico habitual en pipelines de agentes.
- Docencia y demostraciones: modelo pequeño (3,1 GB en safetensors) que cabe en entornos de laboratorio y permite ilustrar el flujo completo de fine-tune, fusión de LoRA y publicación en Hugging Face.
- Pruebas de cuantización y despliegue: sirve para validar pipelines de conversión a GGUF y despliegue en llama.cpp u Ollama con un checkpoint de 1,5B, aunque el autor no documente estas rutas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 1,6-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): en torno a 1-1,5 GB para pesos, viable en GPUs de gama de entrada.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); para despliegue en servidor, A100 o H100 son sobredimensionadas para este tamaño y solo se justifican por agregación de peticiones.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más en FP16 y en tarjetas con 4 GB o más en cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag "text-generation-inference" y "endpoints_compatible"), y previsiblemente llama.cpp u Ollama tras conversión a GGUF, aunque el autor no lo documenta.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Nota: el acceso es restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| rlcl-Qwen2.5-1.5B-Instruct-igbo-s124 | 1,54 B | no disponible | no disponible | Restringido (gated) | Fine-tune LoRA fusionado para igbo, sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (según documentación pública del modelo base) | Apache 2.0 (según documentación pública del modelo base) | Abierto | Modelo original, con evaluación publicada por el autor |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (según documentación pública del modelo base) | Apache 2.0 (según documentación pública del modelo base) | Abierto | Alternativa de mayor tamaño con mejores capacidades generales |
| Meta Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens (según documentación pública) | Licencia comunitaria Llama 3.2 | Abierto con condiciones | Alternativa de tamaño comparable con contexto mayor |

Los datos del modelo base y de los modelos comparables provienen de su documentación pública y no de la información proporcionada en esta ficha; los del modelo evaluado se limitan a lo declarado en el repositorio.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, métricas de olvido ni comparativas publicadas, por lo que se desconoce si el ajuste fino ha degradado las capacidades del modelo base.
- Licencia no declarada: no se especifica la licencia del checkpoint, lo que impide determinar si el uso comercial está permitido; además, las condiciones del modelo base Qwen2.5-1.5B-Instruct podrían seguir aplicando.
- Idiomas no declarados: aunque el nombre sugiere igbo, el autor no documenta qué idiomas cubre el ajuste ni en qué grado.
- Riesgo de olvido catastrófico: es precisamente el fenómeno bajo estudio; es esperable una pérdida de rendimiento en tareas generales, código y tool calling respecto al modelo Instruct original.
- Riesgo de alucinación: inherente a un modelo de 1,5B de parámetros, agravado por un posible ajuste fino sobre datos limitados.
- Acceso restringido: el modelo es gated y requiere aceptar condiciones, lo que añade fricción a la reproducibilidad.
- Sesgos: no documentados; los sesgos del corpus de ajuste (presumiblemente igbo) y del modelo base no han sido evaluados.
- Sin garantías para producción: al ser un artefacto experimental con cero descargas y cero valoraciones en el momento de la ficha, no debería desplegarse en entornos productivos sin una evaluación propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-1.5B-Instruct-igbo-s124
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de transformers: https://huggingface.co/docs/transformers
- Documentación de text-generation-inference: https://huggingface.co/docs/text-generation-inference
