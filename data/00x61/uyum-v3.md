# 00x61/uyum-v3

## Resumen

Uyum v3 es un modelo de lenguaje pequeño (64,93 millones de parámetros) entrenado desde cero para el turco, desarrollado por Ahmet Şerif Kart bajo el perfil 00x61. El proyecto cubre todo el proceso: tokenizer BPE propio, arquitectura Transformer, bucle de entrenamiento y suite de evaluación. Su objetivo principal es la investigación y la educación, no el uso en producción. El modelo se entrenó sobre 1.088 millones de tokens de FineWeb-2 (turco) y Wikipedia turca, y luego se ajustó mediante supervisión (SFT) con 26.501 ejemplos. Se distribuye con licencia Apache 2.0 y ocupa 161 MB en float16.

La arquitectura es un GPT-like de 10 capas, 10 cabezas de atención y 640 dimensiones de embedding, con una ventana de contexto de 512 tokens. El tokenizer BPE tiene 24.004 tokens y descompone los dígitos individualmente (por ejemplo, `347` → `3`,`4`,`7`). El modelo se carga con un script propio (`model.py`) y no requiere la librería `transformers`. Su principal valor está en que permite estudiar el comportamiento de modelos pequeños entrenados desde cero, especialmente en tareas de aritmética, generación de código Python y reglas fonológicas del turco.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-like) con 10 capas, 10 cabezas, 640 dimensiones, bloque 512 |
| Parámetros totales | 64,93 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | float16 (peso original); no se documentan otras cuantizaciones |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`sft.pt`), también se incluye el tokenizer en `bpe.json`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 10 capas, 10 cabezas y 640 unidades de embedding, con una ventana de contexto de 512 tokens. El tokenizer es un BPE de 24.004 tokens que descompone los dígitos individualmente para facilitar la aritmética. El pretraining se realizó sobre 1.088 millones de tokens, con 95.000 pasos, en una GPU T4 de Kaggle. Posteriormente se aplicó SFT con 26.501 ejemplos, 6 épocas y un factor de replay de 0,15. No se menciona el uso de RLHF ni DPO. El modelo se diseñó para que la inferencia no dependa de ningún servicio externo; el código de carga y generación está incluido en el repositorio.

## Capacidades

- Generación de texto en turco: puede producir respuestas coherentes en conversaciones cortas si se usa el formato de prompt obligatorio (`<bos><kullanici>{pregunta}<eos><asistan>`).
- Aritmética básica: resuelve sumas, restas, multiplicaciones y divisiones de 1 a 5 dígitos con una precisión del 56,0% en evaluación propia.
- Generación de código Python: produce fragmentos de código que se ejecutan correctamente en el 33,3% de los casos (medido con ejemplos no vistos).
- Conocimiento factual parcial: alcanza un 73,9% de acierto en preguntas sobre hechos vistos en el entrenamiento, pero solo un 29,9% en hechos no vistos (frente a un azar del 4,4%).
- Aplicación de la armonía vocal turca: el modelo aplica la regla fonológica de armonía vocal (a/i) con una precisión del 75-78% en palabras inventadas.
- No soporta tool calling, ni razonamiento multi-paso, ni visión, ni audio. No tiene modo de pensamiento o capacidad de agente.

## Casos de uso

- Investigación académica sobre entrenamiento de modelos pequeños: permite estudiar el comportamiento de un LM entrenado desde cero, comparar métricas de aprendizaje vs. memoria, y analizar la capacidad de generalización en tareas específicas (aritmética, fonología).
- Enseñanza de arquitecturas Transformer: por su pequeño tamaño y código fuente completo, es un recurso didáctico para mostrar cómo se construye un tokenizer, un bucle de entrenamiento y una evaluación.
- Experimentos de tokenización: su tokenizer BPE con dígitos separados puede servir para estudiar el impacto de la tokenización en tareas aritméticas.
- Pruebas de generación de código Python en entornos académicos: se puede evaluar la calidad del código generado para problemas simples, aunque la tasa de éxito es baja.
- Evaluación de la armonía vocal turca: el modelo puede usarse como generador de palabras inventadas que sigan las reglas fonológicas del turco, útil para estudios lingüísticos.
- Prototipos de chatbots educativos en turco: para conversaciones muy simples y controladas, con la advertencia de que el modelo no tiene conocimiento factual fiable y no debe usarse para información real.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación propios, medidos con conjuntos de validación definidos por el autor. No hay comparación con otros modelos.

| Tarea | Resultado | Azar |
|---|---|---|
| Aritmética (1-5 dígitos) | 56,0% | 0% |
| Python - código ejecutable | 33,3% | 0% |
| Conocimiento factual - no visto en entrenamiento | 29,9% | 4,4% |
| Conocimiento factual - visto en entrenamiento | 73,9% | 4,4% |
| Armonía vocal (a/i) - palabra inventada | 75-78% | 50-25% |

Además, el autor reporta que en el modelo base (antes de SFT) el conocimiento factual no visto era del 4,7% y tras el SFT sube al 29,9%, manteniendo una ventaja de memoria sobre generalización (2,5×).

## Requisitos de hardware

- VRAM estimada: el modelo en float16 ocupa 161 MB, por lo que cabe en cualquier GPU con más de 512 MB de VRAM, incluso en tarjetas integradas o CPU.
- GPU recomendadas: cualquier GPU moderna (por ejemplo, RTX 3060, T4, A10, etc.) o incluso ejecución en CPU con PyTorch.
- Compatibilidad con consumer GPU: sí, es extremadamente ligero.
- Opciones de despliegue: el modelo se carga con el script `model.py` del repositorio, no es compatible con `transformers`, por lo que no se puede usar con vLLM, llama.cpp, Ollama ni TGI directamente. Se puede integrar en un pipeline PyTorch personalizado.
- Latencia y throughput: no se dispone de datos medidos, pero por su tamaño se espera una latencia muy baja (del orden de milisegundos por generación en GPU).

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos en la documentación disponible. El autor no menciona modelos alternativos de la misma categoría. Por tanto, no se dispone de datos de comparación con otras alternativas.

## Limitaciones y advertencias

- El modelo no tiene conocimiento factual fiable; las respuestas sobre historia, geografía, personas o lugares no son fiables y pueden ser inventadas.
- Presenta un patrón de error claro con nombres propios: el tokenizer divide los nombres en partes reconocibles y el modelo las combina de forma errónea (por ejemplo, "Ankara" → "Anirim").
- No es capaz de razonamiento multi-paso ni de resolver problemas complejos.
- Solo funciona correctamente con el formato de prompt obligatorio (`<bos><kullanici>{pregunta}<eos><asistan>`); si se le da texto plano, no responde como chat.
- No es adecuado para uso médico, legal o financiero.
- El modelo se ha entrenado únicamente en turco, por lo que no soporta otros idiomas.
- Aunque el autor reporta que una sonda de PII no encontró datos reales memorizados, el modelo puede generar secuencias aleatorias con formato de teléfono, email, etc., aunque el repositorio incluye un filtro de salida.
- La licencia Apache 2.0 permite uso comercial, pero el propio autor recomienda no usarlo en producción sin validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/00x61/uyum-v3
- Repositorio GitHub: https://github.com/0x61A/uyum
- Código de evaluación: https://github.com/0x61A/uyum/blob/main/v3/degerlendir.py y https://github.com/0x61A/uyum/blob/main/v3/tani.py

(No se encontraron otros enlaces relevantes en la búsqueda web.)
