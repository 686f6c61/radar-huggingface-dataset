# Shashank1227/moochi-300m

## Resumen

Mochi-Novel-300M es un modelo de lenguaje causal de 295,1 millones de parámetros desarrollado por el usuario Shashank1227 y publicado en Hugging Face bajo licencia MIT. Su particularidad es que ha sido implementado, preentrenado y ajustado "desde cero" en PyTorch puro, sin depender del código de modelado de la librería `transformers`. Está especializado en generación de narrativa larga y escritura creativa, con una arquitectura que el autor denomina "dual-engine": dos checkpoints derivados del mismo entrenamiento base, uno orientado a literatura dramática de calidad editorial y otro alineado con más de veinte géneros literarios.

Arquitectónicamente es un transformer decoder-only convencional con las optimizaciones habituales de los modelos modernos: RoPE para codificación posicional, RMSNorm en pre-LayerNorm, redes feed-forward SwiGLU y caché KV para inferencia. El contexto es reducido (1.536 tokens) y el vocabulario es un SentencePiece BPE personalizado de 16.384 entradas, lo que refleja un entrenamiento acotado y centrado en el dominio narrativo en inglés.

Es relevante ahora como ejemplo de modelo pequeño, entrenado íntegramente por un autor individual y orientado a una tarea vertical concreta. No compite con modelos generalistas, pero resulta útil para estudiar implementaciones limpias de transformers en PyTorch, para experimentar con generación creativa en hardware de consumo y como caso de estudio de ajuste fino por dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (RoPE, RMSNorm pre-LN, SwiGLU, KV cache) |
| Parametros totales | 295.084.032 (295,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.536 tokens |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (no se distribuyen safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un transformer causal estándar de 24 bloques, dimensión de embedding 1.024, 16 cabezas de atención con dimensión de cabeza 64 y dimensión oculta SwiGLU de 2.730. Usa RoPE para la posición, RMSNorm en configuración pre-LayerNorm y caché KV durante la generación. El vocabulario es un SentencePiece BPE propio de 16.384 tokens. La implementación es íntegramente en PyTorch, sin código de modelado de `transformers`, lo que implica que el autor ha escrito las capas de atención, el bloque y el bucle de entrenamiento.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del corpus, ni si se aplicaron etapas de RLHF o DPO. El autor menciona un ajuste fino posterior que da lugar a dos checkpoints: `mochi_novel_300m_golden_rajput.pt`, orientado a literatura dramática con continuidad multi-escena y voz de personaje, y `mochi_novel_300m.pt`, alineado con más de veinte géneros (ciencia ficción, cyberpunk, gótico, noir, fantasía, terror, western). Se declara una tasa de "concept leak-free" del 90 % entre universos no relacionados, una métrica definida por el propio autor sin metodología publicada. En decodificación aplica bloqueo estricto de 4-gramas y penalización por repetición de 1,15, lo que sugiere que el modelo tiende a repetir sin esas protecciones.

## Capacidades

- Generación de texto narrativo en inglés: relatos, escenas, diálogos y continuaciones multi-escena.
- Escritura creativa por género mediante el checkpoint universal (ciencia ficción, cyberpunk, gótico, noir, fantasía, terror, western y otros hasta más de veinte).
- Estilo dramático y voz de personaje con el checkpoint "golden", orientado a literatura con tensión dialógica.
- Continuidad narrativa dentro de la ventana de 1.536 tokens.
- Decodificación con caché KV, lo que permite generación incremental token a token.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión ni audio.
- Capacidad multilingüe: no disponible; solo se declara inglés.

## Casos de uso

- Generación de borradores de ficción corta: el modelo produce escenas y relatos completos en inglés dentro de su ventana de 1.536 tokens, adecuado para escribir cuentos de hasta unas mil palabras por tramos encadenados manualmente.
- Prototipado de videojuegos narrativos: integrado como generador de diálogos y descripciones en un motor de juego, con el checkpoint universal para variar géneros y el "golden" para escenas dramáticas.
- Talleres de escritura y experimentación docente: al ser MIT y ejecutable en GPU de consumo, sirve para enseñar cómo funciona un transformer causal y comparar estilos entre los dos checkpoints.
- Estudio de implementaciones en PyTorch: el repositorio asociado permite leer una pila completa (atención, RoPE, SwiGLU, KV cache, bucle de entrenamiento) sin la abstracción de `transformers`.
- Generación de texto de relleno contextualizado en herramientas de escritura: descripciones de ambiente, transiciones entre escenas y variaciones de diálogo a partir de un prompt breve.
- Investigación sobre control de repetición: el bloqueo de 4-gramas y la penalización 1,15 documentados por el autor permiten medir el efecto de estas técnicas en modelos pequeños.
- Base para ajuste fino por dominio: al ser un modelo pequeño con licencia permisiva, se puede reentrenar para otros estilos narrativos o registros con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento declarado por el autor es una velocidad de generación de aproximadamente 44,5 tokens por segundo en una NVIDIA RTX 3060.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp32): alrededor de 1,2 GB solo para pesos (295 M × 4 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB.
- En fp16/bf16: aproximadamente 0,6 GB para pesos; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060 (velocidad declarada de 44,5 tok/s), RTX 4060, RTX 4090; también funciona en GPUs de portátil y en CPU, aunque con menor throughput.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con al menos 4 GB de VRAM.
- Opciones de despliegue: al distribuirse como `.pt` de PyTorch y no como safetensors ni GGUF, no es directamente compatible con vLLM, TGI, llama.cpp u Ollama sin conversión previa. El autor proporciona un script `download_weights.py` y una interfaz `story_studio_gui.py` en su repositorio de GitHub.
- Latencia y throughput: 44,5 tok/s en RTX 3060 según el autor; no se documentan cifras para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mochi-Novel-300M | 295 M | 1.536 | MIT | `.pt` (PyTorch) | Implementación propia, dominio narrativo, solo inglés |
| GPT-2 small | 124 M | 1.024 | MIT | safetensors, GGUF | Referencia generalista pequeña, ampliamente soportado |
| GPT-2 medium | 355 M | 1.024 | MIT | safetensors, GGUF | Tamaño comparable, ecosistema maduro |
| SmolLM-360M | 360 M | 2.048 | Apache 2.0 | safetensors, GGUF | Entrenado con corpus mayor, soporte en vLLM y llama.cpp |

La comparación directa con estos modelos es limitada: no hay benchmarks publicados de Mochi-Novel-300M, y su ventaja principal es la especialización narrativa y la implementación didáctica, no el rendimiento generalista. En cuanto a compatibilidad de despliegue, los modelos GPT-2 y SmolLM están mucho mejor integrados en el ecosistema.

## Limitaciones y advertencias

- Contexto muy corto (1.536 tokens): no admite conversaciones largas ni documentos extensos; la continuidad narrativa depende de encadenar prompts manualmente.
- Solo inglés: no se declara ni se ha verificado soporte de otros idiomas.
- Sin benchmarks publicados: el rendimiento real en tareas estándar (perplejidad, MMLU, HumanEval) es desconocido.
- Riesgo de repetición: el propio autor aplica bloqueo de 4-gramas y penalización 1,15, lo que indica que el modelo tiende a bucles sin esas protecciones.
- Riesgo de alucinación y de incoherencia factual: es un modelo pequeño orientado a ficción, no apto para tareas de precisión.
- Sesgos: no se documenta ningún análisis de sesgos; el corpus de entrenamiento no se describe, por lo que no se puede evaluar su composición ni sus sesgos.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Formato de pesos no estándar: requiere el código del autor para cargar el modelo; no hay conversión oficial a safetensors, GGUF ni integración con vLLM, llama.cpp u Ollama.
- Madurez: el repositorio tiene cero descargas y cero "likes" en el momento de la consulta, y la documentación no incluye detalles de entrenamiento verificables.

## Enlaces

- Hugging Face: https://huggingface.co/Shashank1227/moochi-300m
- Repositorio GitHub indicado en la model card: https://github.com/shashankswaroop789-eng/mochi-88m
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
