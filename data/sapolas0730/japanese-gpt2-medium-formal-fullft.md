# Sapolas0730/japanese-gpt2-medium-formal-fullft

## Resumen

El modelo japanese-gpt2-medium-formal-fullft es un fine-tuning completo del modelo base rinna/japanese-gpt2-medium, desarrollado por Sapolas0730. Está diseñado para transformar texto japonés en registro casual a un registro formal siguiendo instrucciones. Con 336.128.000 parámetros, mantiene la arquitectura GPT-2 original y se ha entrenado con 1.000 muestras sintéticas generadas mediante la técnica MAGPIE. Su relevancia radica en ser un modelo compacto y especializado para una tarea concreta de estilo en japonés, lo que permite desplegarlo en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parámetros totales | 336.128.000 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arquitectónicamente, el modelo es un transformer decoder-only GPT-2 estándar, sin modificaciones. No es un modelo de mezcla de expertos (MoE), por lo que todos sus parámetros se activan en cada paso de inferencia. El modelo base es rinna/japanese-gpt2-medium, desarrollado por rinna y liberado bajo licencia MIT.

El entrenamiento consistió en un full fine-tuning de todos los parámetros del modelo base. Los datos de entrenamiento se generaron con la técnica MAGPIE (arXiv:2406.08464) utilizando Qwen/Qwen2.5-7B-Instruct para crear 1.000 muestras de instrucción que convierten frases japonesas casuales en formales. Estas muestras se filtraron por pureza del japonés, formato, ratio de longitud, preservación de preguntas y duplicados. Se utilizó una tasa de aprendizaje de 5e-5, un tamaño de lote de 4 con acumulación de gradientes de 4 (lote efectivo de 16), y un 10% de datos de validación. El entrenamiento se detuvo por early stopping con patience=3, seleccionando la época 2.0, con un eval_loss de 1.021. El pico de memoria GPU fue de 6.84 GB y el tiempo total de entrenamiento de 67.3 segundos.

## Capacidades

- Conversión de estilo: transforma texto japonés informal o casual en una expresión formal, siguiendo el formato de instrucción mostrado en la model card.
- Generación de texto en japonés: puede generar respuestas en japonés en respuesta a instrucciones, aunque su especialización es la formalización.
- No se documentan capacidades de tool calling o function calling en la información disponible.
- Sin capacidades multimodales: no soporta entrada de visión ni audio.
- Idioma: exclusivamente japonés (ja).
- No se documenta un modo de razonamiento avanzado o thinking mode.

## Casos de uso

- Atención al cliente automatizada: el modelo puede convertir consultas informales de clientes en respuestas formales, integrándose en sistemas de tickets o chatbots. Su tamaño reducido permite ejecutarlo en servidores con poca VRAM.
- Redacción de correos electrónicos: a partir de un borrador casual, el modelo genera una versión formal adecuada para el entorno empresarial japonés.
- Normalización de documentos internos: notas de reuniones o comentarios informales pueden transformarse en lenguaje formal para informes y actas.
- Preprocesamiento de datos de NLP: antes de entrenar otros modelos, el texto japonés informal puede normalizarse a un registro formal, mejorando la consistencia de los datos.
- Educación de japonés (keigo): estudiantes pueden practicar la conversión de frases casuales a keigo, recibiendo ejemplos formales generados por el modelo.
- Contenido para redes sociales corporativas: publicaciones internas o borradores casuales pueden adaptarse a un tono formal para comunicaciones oficiales.
- Traducción intraidiomática de registro: en entornos editoriales, el modelo puede reescribir diálogos casuales en narración formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento documentado es el eval_loss de 1.021 en el conjunto de validación durante el entrenamiento, pero no se trata de un benchmark estándar comparable con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: basado en el número de parámetros (336.128.000), se estima ~1.3 GB en FP32, ~0.7 GB en FP16 y ~0.4 GB en cuantización de 8 bits, sin contar el overhead de activaciones y tokenizador.
- GPU recomendadas: no hay una recomendación oficial del autor, pero por tamaño cabe en cualquier GPU con al menos 2 GB de VRAM, como una RTX 3060 o superior.
- Cabe en GPU de consumo: sí, el modelo es suficientemente pequeño para ejecutarse en GPUs de gama media.
- Opciones de despliegue: compatible con Hugging Face transformers, tal como se muestra en la model card. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| japanese-gpt2-medium-formal-fullft | 336M | No disponible | MIT | HuggingFace |
| japanese-gpt2-medium-formal-lora | 336M (solo adaptadores LoRA entrenables) | No disponible | MIT | HuggingFace |
| rinna/japanese-gpt2-medium | 336M | No disponible | MIT | HuggingFace |

El fullft es un fine-tuning completo de todos los parámetros, mientras que el LoRA solo entrena adaptadores. El modelo base es el original sin ajustes. No se dispone de datos comparativos de rendimiento más allá del eval_loss del fullft.

## Limitaciones y advertencias

- Datos de entrenamiento limitados: solo 1.000 muestras sintéticas, lo que puede no cubrir la diversidad del japonés real en producción.
- Sobreajuste: el autor indica que aumentar el número de épocas empeora el eval_loss y limita la generalización.
- Problemas de decodificación: con decodificación greedy, el modelo tiende a repetir frases. Se recomienda usar repetition_penalty y no_repeat_ngram_size en la generación.
- Idioma: solo japonés, sin soporte multilingüe.
- Sin benchmarks: no se han publicado evaluaciones estándar, por lo que el rendimiento comparativo es desconocido.
- Sesgos: el modelo puede heredar sesgos del modelo base y de los datos sintéticos generados por Qwen, aunque no se han evaluado.
- Licencia: MIT permite uso comercial, pero es necesario verificar las licencias de los datos generados (Qwen bajo Apache 2.0) y del modelo base (MIT).

## Enlaces

- HuggingFace: https://huggingface.co/Sapolas0730/japanese-gpt2-medium-formal-fullft
- Modelo LoRA: https://huggingface.co/Sapolas0730/japanese-gpt2-medium-formal-lora
- Modelo base: https://huggingface.co/rinna/japanese-gpt2-medium
- Paper MAGPIE: https://arxiv.org/abs/2406.08464
- Artículo Zenn: https://zenn.dev/sapolas/articles/0175b65f1e5b8c
