# fadhilahkhairogi/Liwet-163M-id-chat

## Resumen

Liwet-163M-id-chat es un modelo de lenguaje conversacional en indonesio de 163 millones de parámetros, desarrollado por Fadhilah Akbar Khairogi y el Grupo 11 del curso de Generative AI de la Universidad de Telkom. Se trata de un ajuste fino con alineamiento de preferencias mediante SimPO (Simple Preference Optimization) sobre el modelo instruct `Liwet-163M-id-instruct`, que a su vez parte de un transformer denso entrenado desde cero (no derivado de un modelo preentrenado de terceros). El nombre Liwet corresponde al acrónimo de "Lightweight Transformer", lo que sitúa el proyecto en la categoría de modelos pequeños y eficientes para un idioma concreto.

Arquitectónicamente es un transformer denso de 16 capas con 768 dimensiones ocultas, atención con GQA (12 cabezas de query y 4 de clave-valor), RoPE, SwiGLU y Pre-RMSNorm, con una ventana de contexto de 2.048 tokens y un vocabulario de 32.000 tokens Byte-Level BPE. El modelo almacena 187.589.376 elementos en `model.safetensors` (debido a una `lm_head` no atada), aunque el recuento de parámetros efectivos es de 163.013.376.

Su relevancia es acotada y experimental: es un trabajo académico que demuestra el ciclo completo de entrenamiento desde cero más alineamiento con preferencias en un idioma de recursos medios como el indonesio. No es un modelo de producción generalista, sino una pieza didáctica y de investigación sobre alineamiento SimPO a pequeña escala, con métricas de validación y test publicadas por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso `IndonesianChatLM` (Pre-RMSNorm, GQA 12Q/4KV, RoPE, SwiGLU) |
| Parámetros totales | 163.013.376 (tied); 187.589.376 elementos almacenados en `model.safetensors` |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 16 capas con 768 dimensiones ocultas y dimensión SwiGLU de 3.072, entrenado desde cero (tag `from-scratch`) en lugar de partir de un checkpoint preentrenado de terceros. Emplea Pre-RMSNorm, atención con Grouped Query Attention de 12 cabezas de query y 4 de clave-valor, RoPE para codificación posicional y activación SwiGLU. El vocabulario es de 32.000 tokens Byte-Level BPE, con tokens especiales `<pad>=0`, `<bos>=1`, `<eos>=2` y `<unk>=3`.

La etapa documentada en esta ficha es el alineamiento de preferencias con SimPO durante 1 época, con hiperparámetros `beta=2.0` y `gamma=0.5`, partiendo de `Liwet-163M-id-instruct`. El conjunto de datos combina tres fuentes de pares de preferencia: `AksaraLLM/aksara-dpo-id-v2` (5.000 pares), `davidanugraha/IndoPref` (3.477 pares) y `daruokta/t5gemma2-indonesia-chat-formatted` (945 pares), sumando 8.340 pares de entrenamiento y 512 de validación. No se detalla el volumen de tokens de preentrenamiento del modelo base ni la composición completa del corpus original.

## Capacidades

- Generación de texto conversacional en indonesio con formato de roles `User:` / `Assistant:`.
- Respuesta a instrucciones y diálogo multi-turno dentro de una ventana de 2.048 tokens.
- Alineamiento de preferencias orientado a respuestas más útiles y coherentes que el modelo instruct base, según las métricas de validación del autor.
- Generación condicionada por prompt con parámetros de muestreo recomendados (temperatura 0,55, top_k 40, top_p 0,9, repetition_penalty 1,15).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso explícito, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al indonesio; no se declaran otros idiomas.

## Casos de uso

- Prototipado de asistentes conversacionales en indonesio: el modelo puede mantener diálogos de varios turnos dentro de sus 2.048 tokens de contexto, adecuado para demos y pruebas de concepto en entornos educativos o de investigación.
- Investigación sobre alineamiento SimPO: sirve como caso reproducible para estudiar el efecto de `beta` y `gamma` en modelos pequeños, comparando las métricas de validación y test publicadas.
- Generación de respuestas en tareas de atención al cliente de baja complejidad: con prompts acotados y respuestas cortas, encaja en escenarios donde el dominio es estrecho y el idioma es el indonesio.
- Experimentación académica con modelos from-scratch: útil para comparar arquitecturas densas pequeñas (GQA, RoPE, SwiGLU) frente a alternativas preentrenadas en cursos y trabajos de fin de grado.
- Generación de texto asistida en pipelines de datos: puede emplearse para producir borradores o variaciones de texto en indonesio en tareas de aumento de datos, siempre con revisión humana.
- Despliegue en entornos con recursos muy limitados: sus 163 M de parámetros permiten ejecución en CPU o GPU de gama baja, lo que facilita pruebas locales sin infraestructura dedicada.
- Evaluación comparativa de tokenizadores Byte-Level BPE de 32.000 tokens en indonesio: el modelo permite medir el impacto del vocabulario en la calidad de generación para ese idioma.

## Benchmarks y rendimiento

| Checkpoint / Split | Datos | Val loss | Métrica |
|---|---|---|---|
| SimPO final (step 513, validación) | 8.340 train / 512 val pares | 0,8306 | val_acc = 65,0 % |
| SimPO final (step 513, test held-out) | 570 pares de test | 0,9456 | test_acc = 55,6 % (0,55625) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas reportadas son las de pérdida y precisión de preferencias en validación y test del propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,4 GB para los pesos (187,6 M elementos × 2 bytes), más overhead de activaciones y KV cache.
- En cuantización de 8 bits o 4 bits cabría holgadamente en cualquier GPU consumer, aunque el autor no publica versiones cuantizadas ni formatos GGUF.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); también ejecutable en CPU para pruebas.
- Cabe en GPU consumer sin problema por su tamaño reducido.
- Opciones de despliegue: al ser pesos PyTorch personalizados (no `AutoModelForCausalLM` estándar), requiere cargar `model.safetensors` en la definición de arquitectura del proyecto junto a `config.json` y `tokenizer.json`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Liwet-163M-id-chat | 163 M | 2.048 | indonesio | no disponible | safetensors (custom) |
| Liwet-163M-id-instruct (base) | 163 M | 2.048 | indonesio | no disponible | safetensors (custom) |
| Alternativas comparables de tamaño similar en indonesio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (pequeños, en indonesio, alineados con preferencias) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de 163 M de parámetros: capacidad de razonamiento, conocimiento factual y coherencia limitadas en comparación con modelos de mayor escala.
- Riesgo elevado de alucinación y de respuestas incorrectas, especialmente fuera de dominios vistos durante el entrenamiento.
- Ventana de contexto de solo 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Entrenado exclusivamente en indonesio; no se garantiza un comportamiento correcto en otros idiomas.
- Licencia no especificada: no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Pesos en formato personalizado, no compatibles directamente con `transformers`, lo que complica la integración con ecosistemas estándar de inferencia.
- Métricas de test modestas (55,6 % de precisión en preferencias), lo que indica margen de mejora en la calidad del alineamiento.
- Proyecto académico de un curso universitario, sin garantías de mantenimiento, soporte ni actualizaciones.
- No se documentan sesgos específicos, pero al entrenarse con datasets de preferencias en indonesio puede heredar sesgos presentes en esas fuentes.
- No se han publicado evaluaciones de seguridad, toxicidad ni robustez adversaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-163M-id-chat
- Modelo base instruct: https://huggingface.co/fadhilahkhairogi/Liwet-163M-id-instruct
- Dataset `AksaraLLM/aksara-dpo-id-v2`: https://huggingface.co/datasets/AksaraLLM/aksara-dpo-id-v2
- Dataset `davidanugraha/IndoPref`: https://huggingface.co/datasets/davidanugraha/IndoPref
- Dataset `daruokta/t5gemma2-indonesia-chat-formatted`: https://huggingface.co/datasets/daruokta/t5gemma2-indonesia-chat-formatted
