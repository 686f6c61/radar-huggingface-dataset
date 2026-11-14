# ChikenBoy/Kowalski-V3.2

## Resumen

Kowalski-V3.2 es un ajuste fino (fine-tuning) del modelo Qwen3-4B, desarrollado por el usuario ChikenBoy y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de aproximadamente 4.022 millones de parámetros (4B) que hereda la arquitectura transformer de la familia Qwen3 y ha sido entrenado mediante Supervised Fine-Tuning (SFT) completo sobre un conjunto de unos 120.000 ejemplos. El autor declara mejoras específicas en razonamiento lógico, matemáticas y generación de código, e incorpora un bloque `<think>` para razonamiento en cadena (CoT).

El modelo está orientado a los idiomas ruso e inglés y se distribuye tanto en formato safetensors como GGUF, lo que facilita su despliegue en transformers, text-generation-inference y entornos de inferencia local. Su relevancia actual radica en que ofrece una alternativa compacta y de licencia permisiva para tareas de razonamiento y código en ruso, un nicho con menos oferta que el inglés, partiendo de una base sólida como Qwen3-4B.

No obstante, conviene señalar que la información pública disponible es muy limitada: la model card es breve, no se publican resultados de benchmarks ni detalles sobre la composición del dataset de entrenamiento, y las métricas de adopción en Hugging Face son muy bajas (14 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (disponible en el repo); otros tipos no disponibles |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

Kowalski-V3.2 es un modelo transformer denso derivado de Qwen/Qwen3-4B, con 4.022.468.096 parámetros. No se trata de una arquitectura MoE ni híbrida: es un ajuste fino sobre la base densa de Qwen3. El entrenamiento se realizó mediante Full Supervised Fine-Tuning (SFT) sobre aproximadamente 120.000 ejemplos, según indica el autor.

La innovación declarada más destacable es la incorporación de un bloque `<think>` que habilita razonamiento en cadena (CoT) antes de la respuesta final. El autor afirma haber reforzado las capacidades de lógica, matemáticas y código mediante este ajuste. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO posteriores al SFT. Tampoco se detallan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en ruso e inglés.
- Razonamiento lógico reforzado mediante ajuste fino supervisado.
- Resolución de problemas matemáticos.
- Generación y asistencia en código.
- Razonamiento en cadena (CoT) mediante el bloque `<think>`, que expone el proceso de razonamiento antes de la respuesta.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el bloque `<think>` puede favorecer cadenas de razonamiento.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo de texto.
- Capacidades multilingües: limitadas a ruso e inglés según la model card.

## Casos de uso

- Asistencia conversacional en ruso: el modelo puede mantener diálogos multi-turno en ruso con un tono conversacional, adecuado para chatbots de atención al usuario en mercados de habla rusa donde escasean modelos ajustados específicamente.
- Tutoría de matemáticas: gracias al bloque `<think>`, puede mostrar el desarrollo paso a paso de problemas aritméticos y algebraicos, útil en plataformas educativas que requieran explicaciones razonadas.
- Generación de código en entornos de desarrollo: puede asistir en la escritura y explicación de fragmentos de código, integrándose en editores o pipelines de revisión, aunque sin garantías de tool calling documentado.
- Prototipado rápido de aplicaciones de razonamiento: su tamaño de 4B y licencia Apache 2.0 permiten desplegarlo en infraestructura modesta para validar ideas antes de escalar a modelos mayores.
- Traducción y adaptación de contenido entre ruso e inglés: al soportar ambos idiomas, puede emplearse en tareas de traducción asistida o reescritura bilingüe.
- Investigación sobre SFT y CoT: al ser un ajuste fino documentado sobre Qwen3-4B con bloque `<think>`, sirve como caso de estudio para analizar el efecto del SFT en razonamiento y código en modelos compactos.
- Despliegue local con GGUF: los pesos en formato GGUF permiten ejecutar el modelo en estaciones de trabajo sin GPU dedicada mediante llama.cpp u Ollama, útil para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8-9 GB para los 4.022 millones de parámetros, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 4-5 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): en torno a 2,5-3,5 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con throughput alto; RTX 4090, RTX 3090 o RTX A6000 para inferencia en una sola GPU con FP16.
- Compatibilidad con GPU de consumo: sí; cabe en GPUs con 8 GB o más en FP16 y en GPUs con 4-6 GB usando cuantización GGUF de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp y Ollama mediante los pesos GGUF; vLLM es compatible en principio al ser una arquitectura Qwen3, aunque no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kowalski-V3.2 | ~4B | No disponible | ru, en | Apache 2.0 | Safetensors, GGUF | Ajuste SFT de Qwen3-4B con bloque `<think>` |
| Qwen/Qwen3-4B | ~4B | No disponible en esta ficha | Multilingüe (según Qwen) | Apache 2.0 | Safetensors, GGUF | Modelo base; sin ajuste específico para ruso |
| Qwen2.5-3B-Instruct | ~3B | 32.768 tokens (según documentación de Qwen2.5) | Multilingüe | Apache 2.0 | Safetensors, GGUF | Alternativa de tamaño similar con soporte instructivo |
| Llama-3.2-3B-Instruct | ~3B | 128.000 tokens (según documentación de Meta) | Multilingüe | Llama 3.2 Community License | Safetensors, GGUF | Requiere aceptar licencia; no específico para ruso |

La comparación con Qwen3-4B es la más directa, ya que Kowalski-V3.2 parte de él. Frente a Qwen2.5-3B-Instruct y Llama-3.2-3B-Instruct, Kowalski-V3.2 se diferencia por su especialización declarada en ruso, matemáticas y código, aunque carece de datos públicos de rendimiento que permitan verificar esas mejoras. Los datos de contexto de los modelos comparados provienen de su documentación oficial y no de la información proporcionada para este modelo.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de las mejoras declaradas en lógica, matemáticas y código.
- Dataset de entrenamiento no documentado: se desconoce la composición de los ~120.000 ejemplos, lo que impide evaluar sesgos o calidad de los datos.
- Riesgo de alucinación: como todo modelo de 4B ajustado por SFT, puede generar contenido plausible pero incorrecto, especialmente en matemáticas y código.
- Cobertura lingüística limitada: solo ruso e inglés según la model card; el rendimiento en otros idiomas no está garantizado.
- Longitud de contexto no especificada: no se puede confirmar la ventana máxima, lo que dificulta planificar casos de uso con documentos largos.
- Adopción muy baja: 14 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su calidad.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3-4B conviene verificar las condiciones de la licencia del modelo base (también Apache 2.0 según la información disponible).
- Falta de documentación sobre tool calling y agentes: no se confirma soporte para function calling, lo que limita su uso en pipelines agénticos.
- Modelo de nicho: su especialización en ruso puede implicar un rendimiento inferior en inglés frente al Qwen3-4B original.

## Enlaces

- Hugging Face: https://huggingface.co/ChikenBoy/Kowalski-V3.2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
