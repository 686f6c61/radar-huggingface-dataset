# nchapman/Ternary-Bonsai-2-2B-warp34

## Resumen

Ternary-Bonsai-2-2B-warp34 es una conversión cuantizada del modelo prism-ml/Ternary-Bonsai-2-2B-mlx-2bit, un modelo denso de tipo vision-language construido sobre la arquitectura Qwen3_5ForConditionalGeneration. El autor de la conversión es nchapman, y el resultado es una versión empaquetada en formato ternario de 5 trits (w1.58) que reduce el peso total del repositorio a 0,7 GB en un único shard de safetensors, manteniendo el tronco lingüístico en precisión ternaria pura y la torre de visión en W4A16-HGPTQ.

El modelo resuelve el problema de desplegar un sistema multimodal de aproximadamente 1.300 millones de parámetros en entornos con restricciones severas de memoria, empleando una codificación de pesos de 1,75 bits por peso (bpw) con rotación Hadamard de 512 bloques para preservar la calidad. Es relevante porque demuestra que es posible comprimir un modelo híbrido GatedDeltaNet + atención completa a un footprint inferior a 1 GB sin pérdida de paridad de trits verificada bit a bit respecto al original.

La ficha se centra en las características técnicas de esta conversión concreta, su contrato de kernel (warp34), los requisitos de decodificación ternaria y las limitaciones prácticas de un artefacto de cuantización post-entrenamiento orientado a inferencia de bajo consumo de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido GatedDeltaNet + atención completa (Qwen3_5ForConditionalGeneration) con torre de visión |
| Parámetros totales | 1.303.536.448 (dato real de safetensors) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Ternario 5-trit (w1.58, 1,75 bpw, group_size=128) en tronco lingüístico; W4A16-HGPTQ en torre de visión |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (weight_5trit uint8, weight_scale FP16, weight_shape int64; weight_packed int32 en visión) |

## Arquitectura y entrenamiento

El modelo base es un Qwen3_5ForConditionalGeneration denso de 2B parámetros con una arquitectura híbrida que combina capas GatedDeltaNet (atención lineal con estado recurrente) y capas de atención completa. Esta conversión no reentrena el modelo: aplica una cuantización post-entrenamiento (PTQ1_0) que empaqueta los pesos del tronco lingüístico, embed_tokens y lm_head en trits puros {-1, 0, +1}, codificados en bloques de 128 pesos con 26 bytes de payload más 2 bytes de escala FP16 nativa, lo que resulta en 1,75 bpw. La torre de visión, con 98 capas lineales, se cuantiza mediante W4A16-HGPTQ con configuración g64-h64 y h16 en linear_fc2.

La innovación técnica principal es la rotación Hadamard H_512 (Walsh-Hadamard normalizada de Sylvester, escala 1/22) aplicada en bloques de 512 elementos para reducir el error de cuantización, junto con un contrato de kernel explícito denominado warp34 que define el layout de bits de los 5 trits, las reglas de transformación por tipo de capa (v, v_o_proj, embed_tokens) y una función de decodificación branchless en base 3 que preserva el wraparound de 8 bits. El autor verifica paridad bit a bit de los 152 tensores ternarios respecto al modelo fuente W2A16, lo que garantiza que la conversión es lossless en términos de trits.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredadas del modelo base Qwen3_5.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), gracias a la torre de visión cuantizada en W4A16-HGPTQ.
- Comprensión de imágenes con descripción y respuesta a preguntas visuales.
- Capacidades multilingües: no especificadas en la información disponible.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Modo thinking explícito: no disponible en la información.
- Capacidades de audio: no disponibles.

## Casos de uso

- Despliegue en dispositivos de borde con memoria limitada: el footprint de 0,71 GB permite cargar el modelo completo en GPUs integradas o en sistemas con 2-4 GB de VRAM, habilitando asistentes visuales locales sin conexión.
- Procesamiento de documentos escaneados en local: la combinación de visión y lenguaje permite extraer y resumir información de imágenes de documentos en entornos con requisitos de privacidad estrictos, donde no se puede enviar datos a la nube.
- Prototipado rápido de aplicaciones image-text-to-text: el tamaño reducido y el formato safetensors compatible con transformers facilitan la experimentación en notebooks y estaciones de trabajo sin GPU de datacenter.
- Investigación en cuantización extrema: el contrato warp34 y la codificación de 5 trits con decodificación branchless sirven como referencia para estudiar el impacto de la cuantización ternaria en modelos híbridos con atención lineal.
- Asistentes de accesibilidad visual: descripción de escenas o lectura de texto en imágenes para aplicaciones de asistencia en tiempo real en hardware de consumo.
- Evaluación comparativa de técnicas PTQ: permite contrastar la calidad de la cuantización ternaria con rotación Hadamard frente a otras técnicas (GPTQ, AWQ) sobre el mismo modelo base en tareas de visión-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB para los pesos en disco; en VRAM se requiere espacio adicional para activaciones, caché KV y buffers de decodificación, estimado en 2-4 GB según longitud de contexto y batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son compatibles, aunque el modelo está optimizado para entornos de baja memoria.
- Cabe en GPU de consumo: sí, en GPUs con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: transformers con soporte del contrato warp34 (requiere kernel de decodificación ternaria personalizado); no se confirma compatibilidad directa con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles; dependen de la implementación del kernel de decodificación de 5 trits y del soporte hardware para las operaciones de despaquetado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-2B-warp34 | 1.303 M | No disponible | Ternaria 5-trit (1,75 bpw) + W4A16 visión | Apache 2.0 | Hugging Face |
| prism-ml/Ternary-Bonsai-2-2B-mlx-2bit (base) | ~2B | No disponible | 2-bit MLX | No disponible | Hugging Face |
| Modelos Qwen3_5 densos de 2B (referencia) | ~2B | No disponible | FP16/BF16 | No disponible | Hugging Face |

La comparativa con alternativas de la misma categoría (modelos vision-language de ~1-2B parámetros en cuantización extrema) no está disponible con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización ternaria de 1,75 bpw introduce degradación de calidad respecto al modelo en precisión completa; aunque la paridad de trits está verificada, el error de cuantización acumulado puede afectar tareas de razonamiento complejo.
- Requiere un kernel de decodificación específico (warp34) que no es estándar en los runtimes habituales; sin él, el modelo no puede ejecutarse correctamente.
- La torre de visión está cuantizada a 4 bits, lo que puede degradar la precisión en tareas de reconocimiento visual fino u OCR.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equilibrado.
- Longitud de contexto no especificada; no se recomienda asumir ventanas largas sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus dependencias deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No hay benchmarks publicados que permitan estimar la pérdida de rendimiento frente al modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Ternary-Bonsai-2-2B-warp34
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-mlx-2bit
