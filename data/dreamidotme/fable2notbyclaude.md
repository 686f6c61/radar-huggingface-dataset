# dreamidotme/fable2notbyclaude

## Resumen

Fable 2 (identificado como `dreamidotme/fable2notbyclaude`) es un modelo de lenguaje pequeño de 89 millones de parámetros, entrenado desde cero sobre fábulas y folclore de dominio público. El proyecto nace como una parodia de la tendencia de ciertos asistentes de IA a responder por defecto en forma de fábulas; este modelo, en cambio, genera prosa de fábula con cadencia y moralejas bien formadas, pero sin la fiabilidad de un modelo de mayor escala. No es un fine-tune ni una destilación de otro modelo base: los pesos parten de inicialización aleatoria y todo el corpus de entrenamiento está libre de derechos de autor, cumpliendo con el artículo 50 de la UE.

La arquitectura es estilo GPT-2 con 12 capas, 8 cabezas de atención y ancho de 512, con una ventana de contexto de 512 tokens. El modelo se distribuye en formato GGUF (cuantización f16) y puede ejecutarse en CPU de portátil sin GPU. Su licencia CC0 1.0 permite cualquier uso, incluido comercial. Está pensado para generar fábulas y moralejas con fines lúdicos o creativos, no como referencia académica ni para tareas de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 style (12 capas, 8 cabezas, ancho 512, embeddings posicionales aprendidos, LayerNorm, MLP GELU, QKV fusionado, embeddings atados) |
| Parametros totales | 89 554 944 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | f16 (GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC0 1.0 (dedicación a dominio público) |
| Formato de pesos | GGUF (safetensors no disponible en el repo, solo se menciona el dato de parámetros reales) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura GPT-2 clásica: embeddings posicionales aprendidos, normalización por capas, MLP con activación GELU, atención QKV fusionada y embeddings atados (weight-tied). No utiliza mecanismos de atención lineal ni decodificación especulativa. El tokenizador es el BPE de GPT-2 con vocabulario de 50 257 tokens. Los sesgos (biases) están desactivados durante el entrenamiento; el GGUF incorpora ceros explícitos para que el grafo de llama.cpp funcione correctamente con la etiqueta de arquitectura `gpt2`.

El entrenamiento se realizó desde cero sobre textos de dominio público de Project Gutenberg, incluyendo múltiples ediciones de Esopo y otro folclore y ficción de época sin copyright. Se incorporó además un dataset de fábulas con formato de instrucción. No se han publicado datos concretos sobre el número total de tokens de entrenamiento, épocas o las ediciones específicas de Gutenberg utilizadas (el autor lo indica como pendiente en la model card). No se menciona uso de RLHF, DPO ni técnicas de alineación.

## Capacidades

- Generación de prosa de fábula con ritmo y cadencia adecuados, incluyendo moralejas bien formadas (ejemplo real: "Presence of mind and quick thinking can save you from treachery").
- Modo conversacional mediante plantilla de prompt integrada en el GGUF, que permite usar `llama-cli -m fable-2-f16.gguf -cnv` sin configuración adicional.
- Generación de respuestas cortas por diseño: la mediana de palabras en los objetivos de entrenamiento es de 26.
- Detención de generación en el token EOS (`<|endoftext|>`, id 50256).
- Compatible con cualquier ejecutor GGUF (llama.cpp, LM Studio, Ollama).
- Sin capacidades de vision, tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Escritura creativa de fábulas originales: el modelo genera historias cortas con moraleja, útil para autores que buscan inspiración o variaciones de temas clásicos.
- Parodia y humor: su tendencia a mezclar personajes y tramas (por ejemplo, entregar el queso a un ciervo) lo convierte en una herramienta de comedia para sketches o guiones.
- Generación de moralejas aisladas: puede producir sentencias moralizantes con estructura correcta, útiles para citas o contenido breve.
- Proyectos educativos de folclore: permite explorar el estilo de las fábulas del siglo XIX sin problemas de copyright, aunque no debe usarse como fuente fiable.
- Experimentación con modelos pequeños: sirve como ejemplo de entrenamiento desde cero con corpus público y despliegue en CPU, ideal para estudiantes de IA.
- Demostraciones de watermarking: el GGUF aplica una marca de agua invisible a las respuestas, útil para probar técnicas de atribución de contenido generado.
- Integración en entornos sin GPU: al caber en un portátil, puede usarse en talleres o demostraciones offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas estándar (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo en f16 ocupa aproximadamente 179 MB (89 M parámetros × 2 bytes), por lo que puede ejecutarse íntegramente en RAM.
- CPU recomendada: cualquier CPU de portátil moderna (por ejemplo, Intel Core i5 o AMD Ryzen 5) con al menos 4 GB de RAM libre.
- GPU: no necesaria, pero si se usa, cualquier GPU con al menos 1 GB de VRAM sería suficiente; no se han reportado cifras de latencia.
- Opciones de despliegue: llama.cpp (CLI), LM Studio, Ollama o cualquier ejecutor compatible con GGUF.
- Latencia y throughput: no especificados por el autor; en CPU se espera generación de decenas de tokens por segundo, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente equivalentes en tamaño y propósito (generación de fábulas desde cero). Como referencia de tamaño, modelos como GPT-2 Small (124 M) o TinyStories (33 M) son arquitecturas similares, pero no se han publicado comparativas con Fable 2.

## Limitaciones y advertencias

- Confunde y mezcla fábulas: atribuye personajes o elementos de una historia a otra (por ejemplo, el queso a un ciervo), por lo que no debe citarse como referencia de contenido.
- Contexto limitado a 512 tokens, límite estricto; no admite entradas más largas.
- Solo inglés; no soporta otros idiomas.
- Entrenado con textos del siglo XIX y principios del XX, por lo que puede reflejar lenguaje y supuestos de esa época.
- Sin ajuste de seguridad de ningún tipo: puede generar contenido inapropiado o sesgado si se le provoca.
- Licencia CC0 1.0: permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el contenido generado.
- No se han publicado detalles de entrenamiento (tokens totales, épocas, ediciones concretas), lo que dificulta la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/dreamidotme/fable2notbyclaude
- Repositorio original del modelo (sin el sufijo "notbyclaude"): https://huggingface.co/dreamidotme/fable2
- Discusiones del modelo: https://huggingface.co/dreamidotme/fable2/discussions
