# MagistrTheOne/NULLXES-SVAROGV2

## Resumen

NULLXES-SVAROGV2 es un modelo de lenguaje autoregresivo experimental desarrollado por NULLXES (MagistrTheOne), publicado en Hugging Face como checkpoint base preentrenado. Se trata de un transformer decoder-only de inspiración LLaMA con 131.697.408 parámetros, 12 capas, dimensión oculta de 768 y 12 cabezas de atención, entrenado desde cero y posteriormente sometido a un preentrenamiento continuado sobre un corpus ruso e inglés. No es un asistente ajustado por instrucciones: es una base para desarrollo posterior.

El modelo resulta relevante únicamente como pieza de investigación en la óptica de modelos pequeños y arquitecturas personalizadas, no como herramienta de producción. Su contexto máximo teórico es de 2.048 tokens, aunque el entrenamiento se realizó con secuencias de solo 256 tokens, lo que limita severamente su utilidad práctica en tareas que requieran contexto largo. El repositorio ocupa 0,5 GB y los pesos están en formato Safetensors.

La relevancia actual es marginal: cero descargas, cero likes y una model card que el propio autor describe como etapa temprana, con texto potencialmente incoherente o repetitivo. Su interés se reduce a quien quiera estudiar el proceso de entrenamiento de un modelo pequeño desde cero con hardware modesto (una Tesla T4) o reutilizar la arquitectura SVAROG V3 para experimentos propios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de inspiración LLaMA (configuración SVAROG V3) |
| Parametros totales | 131.697.408 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens de capacidad arquitectónica; entrenado con 256 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos Safetensors en FP16) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | Safetensors |
| Capas del transformer | 12 |
| Dimensión oculta | 768 |
| Cabezas de atención | 12 |
| Dimensión feed-forward | 3.072 |
| Codificación posicional | RoPE |
| Normalización | RMSNorm |
| Activación feed-forward | SwiGLU |
| Tokenizador | SentencePiece BPE |
| Vocabulario | 24.000 tokens |
| Precisión de entrenamiento | FP16 mixed precision |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de estilo LLaMA: 12 capas, 768 de dimensión oculta, 12 cabezas de atención, feed-forward de 3.072 con activación SwiGLU, normalización RMSNorm y codificación posicional rotatoria (RoPE). El tokenizador es SentencePiece BPE con un vocabulario de 24.000 entradas. La implementación es personalizada (`model.py`) y no está configurada para cargarse con `AutoModelForCausalLM.from_pretrained()` de Hugging Face, lo que obliga a usar el código auxiliar del repositorio. La capacidad arquitectónica de contexto es de 2.048 posiciones, pero el entrenamiento se realizó con secuencias de 256 tokens.

El entrenamiento se hizo desde cero con 3.000 pasos de optimizador y luego un preentrenamiento continuado de 1.000 pasos adicionales sobre 45.000 documentos extraídos de FineWeb2 (ruso) y Wikimedia Wikipedia (ruso e inglés). Se usó AdamW, precisión mixta FP16 y una única GPU NVIDIA Tesla T4. La pérdida de validación tras el paso 1.000 del preentrenamiento continuado fue de 3,9164, con perplejidad de 50,22 sobre ese conjunto de validación concreto; el autor advierte explícitamente que no son benchmarks de propósito general. No se documenta RLHF, DPO ni ninguna fase de alineación.

## Capacidades

- Generación de texto autoregresiva en ruso e inglés, a nivel de modelo base sin ajuste por instrucciones.
- Continuación de texto y modelado de lenguaje puro; no hay evidencia de razonamiento, matemáticas o código fiables.
- No soporta tool calling ni function calling: no hay entrenamiento ni plantilla funcional para ello.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo thinking.
- Incluye una plantilla de chat (`chat_template.py`) con delimitadores textuales `[im_start]system`, `[im_start]user`, `[im_start]assistant` y `[im_end]`, pero los pesos no han sido supervisados con ella; es solo material para futuro ajuste por instrucciones.
- Capacidad multilingüe limitada a ruso e inglés, y sin evaluación publicada.

## Casos de uso

- Investigación sobre entrenamiento desde cero: reproducir el pipeline (3.000 + 1.000 pasos, AdamW, FP16, T4) para estudiar dinámicas de convergencia en modelos de ~130 M de parámetros.
- Base para ajuste por instrucciones: el repositorio incluye plantilla de chat y arquitectura documentada, de modo que un equipo puede aplicar SFT/DPO sobre este checkpoint para construir un asistente pequeño en ruso.
- Experimentación con tokenizadores SentencePiece de vocabulario reducido (24.000): útil para medir el impacto del vocabulario en la eficiencia de un modelo pequeño en ruso.
- Prototipado de arquitecturas personalizadas: sirve como referencia para validar implementaciones propias de RoPE, RMSNorm y SwiGLU antes de escalar a modelos mayores.
- Generación de texto creativo de baja exigencia en ruso, aceptando que la salida puede ser incoherente o repetitiva y requiriendo revisión humana.
- Docencia y demostraciones: por su tamaño (0,5 GB) cabe en CPU y en GPUs de consumo, lo que permite ilustrar el comportamiento de un modelo base frente a uno ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico es la pérdida de validación del preentrenamiento continuado (3,9164) y la perplejidad asociada (50,22) sobre un conjunto de validación no especificado, que el propio autor califica de no representativo de rendimiento general.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 0,26 GB solo para pesos (131,7 M × 2 bytes), más overhead de activaciones y KV cache; holgado por debajo de 1 GB en la práctica.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia básica.
- GPU de datacenter (A100, H100) innecesarias; el modelo se entrenó en una Tesla T4.
- Despliegue: el autor proporciona `inference.py` con funciones `load_svarog` y `generate`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la carga estándar de Transformers no está configurada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NULLXES-SVAROGV2 | 131,7 M | 2.048 (entrenado a 256) | no disponible | Hugging Face, 0 descargas | Modelo base experimental, sin benchmarks |
| GPT-2 small | 124 M | 1.024 | MIT | Ampliamente disponible | Referencia clásica de tamaño similar, con ecosistema maduro |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | Hugging Face | Modelo pequeño moderno con ajuste por instrucciones y benchmarks publicados |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | Hugging Face | Alternativa algo mayor, multilingüe y con soporte de tool calling |

La comparación es desfavorable para SVAROGV2 en todos los ejes salvo el interés puramente experimental: carece de licencia clara, de benchmarks, de ecosistema de despliegue y de ajuste por instrucciones, mientras que las alternativas citadas ofrecen licencias permisivas y evaluación pública.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse como asistente conversacional.
- El autor advierte de texto potencialmente incoherente, repetitivo, factualmente incorrecto o no relacionado con el prompt.
- No apto para decisiones críticas de seguridad ni para respuesta factual fiable.
- Contexto efectivo de solo 256 tokens durante el entrenamiento, pese a soportar 2.048 posiciones; el rendimiento en contexto largo no está validado.
- Licencia no disponible: no se concede explícitamente derecho de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Obligaciones de atribución y redistribución de los datos de entrenamiento (FineWeb2, Wikimedia Wikipedia) no resueltas; la model card no otorga derechos sobre datos de terceros.
- Sesgos no evaluados: no hay análisis de sesgo lingüístico, cultural o de género.
- Riesgo de alucinación alto por el tamaño reducido y la falta de alineación.
- Sin soporte de tool calling, agentes ni multimodalidad.
- Carga no estándar: requiere el código del repositorio, lo que complica la integración en pipelines convencionales.

## Enlaces

- Hugging Face: https://huggingface.co/MagistrTheOne/NULLXES-SVAROGV2
- GitHub del autor (Svarog): https://github.com/MagistrTheOne/Svarog
- Perfil GitHub del autor: https://github.com/MagistrTheOne
