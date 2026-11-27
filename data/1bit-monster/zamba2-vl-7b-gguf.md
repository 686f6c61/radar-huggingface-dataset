# 1bit-MONSTER/Zamba2-VL-7B-GGUF

## Resumen

Zamba2-VL-7B-GGUF es la conversión a formato GGUF del modelo multimodal Zamba2-VL-7B desarrollado por Zyphra, publicada por el usuario 1bit-MONSTER. Combina el modelo de lenguaje Zamba2 con una torre de visión heredada de Qwen2.5-VL, lo que da lugar a un sistema capaz de procesar texto e imágenes de forma conjunta. El repositorio incluye dos artefactos: el modelo de lenguaje cuantizado en Q8_0 y la torre de visión en F16.

La relevancia de esta publicación reside en su formato: al tratarse de una conversión GGUF, el modelo puede ejecutarse en motores de inferencia ligeros como llama.cpp (a través del fork del autor) o el motor propio de 1bit, lo que facilita su despliegue fuera de entornos con GPUs de datacenter. La conversión es propia del autor e incluye una plantilla de chat que replica la disposición de imágenes del modelo original de Zyphra.

El modelo base declara 7B en su nombre comercial, aunque el recuento real de parámetros en safetensors asciende a 10.977.109.328 (aproximadamente 11B), un dato relevante a la hora de planificar requisitos de memoria. La licencia Apache 2.0 se hereda del modelo base y permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zamba2 (modelo de lenguaje) + torre de visión Qwen2.5-VL; arquitectura híbrida no detallada en la información disponible |
| Parametros totales | 10.977.109.328 (según safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (modelo de lenguaje) y F16 (torre de visión) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: `Zamba2-VL-7B-Q8_0.gguf` y `mmproj-Zamba2-VL-7B-F16.gguf`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de identificar el modelo de lenguaje como Zamba2 y la torre de visión como Qwen2.5-VL. Zamba2 es la familia de modelos de Zyphra, pero esta ficha no dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

En cuanto a la conversión, el autor indica que el convertidor es propio (referenciado en los pull requests #16 y #17 de su fork de llama.cpp) e incluye una plantilla de chat que coloca las imágenes de la misma forma que el modelo original de Zyphra. La validación reportada compara los embeddings de visión contra la implementación en transformers, con una similitud coseno por token de 0,99989 en CPU y 0,99944 en Vulkan. Como prueba cualitativa, ante una imagen sintética con un cuadrado rojo, un círculo azul y el texto "HELLO 42", el modelo describe correctamente la disposición y el contenido.

## Capacidades

- Generación de texto conversacional en formato multimodal (texto e imagen).
- Comprensión de imágenes: descripción de contenido visual, disposición espacial de objetos y lectura de texto presente en la imagen (validado con el ejemplo de "HELLO 42").
- Procesamiento conjunto de instrucciones textuales y entradas visuales mediante una plantilla de chat específica.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en el repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Descripción y etiquetado automático de imágenes: el modelo puede generar descripciones textuales de contenido visual, útil para construir metadatos en catálogos de imágenes o repositorios documentales.
- Extracción de texto en imágenes (OCR asistido): a partir de la validación reportada con el texto "HELLO 42", el modelo puede leer y transcribir texto presente en capturas, carteles o documentos escaneados.
- Asistentes conversacionales con entrada visual: integrado en un motor GGUF, permite desplegar un chat que acepte capturas de pantalla o fotografías en entornos con recursos limitados.
- Verificación de disposición espacial en imágenes: la capacidad demostrada de describir la posición relativa de objetos (izquierda/derecha) resulta útil en tareas de control de calidad visual o inspección.
- Prototipado e investigación en multimodalidad: al ser una conversión GGUF con validación documentada frente a transformers, sirve para experimentar con modelos visión-lenguaje en hardware de consumo sin depender de stacks pesados.
- Despliegue en el motor 1bit o en el fork de llama.cpp: el repositorio documenta el comando de servicio (`1bit serve`) y el uso de `--jinja` en llama.cpp, lo que facilita la puesta en marcha en entornos locales o de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de validación de la conversión: similitud coseno por token de 0,99989 (CPU) y 0,99944 (Vulkan) frente a transformers, además de una prueba cualitativa de descripción de imagen sintética.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 13,0 GB, repartidos entre el modelo de lenguaje en Q8_0 y la torre de visión en F16. Se requiere memoria suficiente para cargar ambos ficheros de forma simultánea.
- GPU recomendadas: no disponible en la información proporcionada. El autor menciona ejecución en "HRX GPU" mediante el motor 1bit y validación en Vulkan, pero no especifica modelos de GPU concretos.
- GPU de consumo: no confirmado. El tamaño del repositorio (13,0 GB) sugiere que podría caber en GPUs con 16 GB o más de VRAM, pero la información disponible no lo verifica.
- Opciones de despliegue: motor 1bit (`1bit serve -m Zamba2-VL-7B-Q8_0.gguf --mmproj mmproj-Zamba2-VL-7B-F16.gguf --device hrx`) y fork de llama.cpp del autor con la opción `--jinja`. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Zamba2-VL-7B-GGUF (este) | ~11B (según safetensors) | no disponible | GGUF (Q8_0 + F16) | Apache 2.0 | Conversión de 1bit-MONSTER del modelo de Zyphra |
| Zyphra/Zamba2-VL-7B | ~11B (según safetensors) | no disponible | safetensors | Apache 2.0 | Modelo base original; requiere transformers |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para establecer una comparación |

No se dispone de información suficiente para comparar rendimiento con otros modelos visión-lenguaje de tamaño similar.

## Limitaciones y advertencias

- El recuento real de parámetros (~11B) difiere del "7B" del nombre comercial, lo que puede llevar a infraestimar los requisitos de memoria.
- La información sobre idiomas soportados no está disponible; no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas.
- No se han publicado benchmarks; el rendimiento en tareas estándar (MMLU, HumanEval, GSM8K, benchmarks multimodales) es desconocido.
- La validación de la conversión se limita a una comparación de embeddings y a una prueba cualitativa con una imagen sintética; no constituye una evaluación exhaustiva.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a los modelos generativos.
- La ejecución requiere el fork de llama.cpp del autor o el motor 1bit; la compatibilidad con implementaciones estándar de llama.cpp no está confirmada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base de Zyphra y de la torre de visión Qwen2.5-VL.
- El repositorio tiene un volumen de descargas bajo (88) y ningún "like", lo que limita la evidencia de uso en producción por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/Zamba2-VL-7B-GGUF
- Modelo base: https://huggingface.co/Zyphra/Zamba2-VL-7B
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Fork de llama.cpp del autor: https://github.com/1bit-MONSTER/llama.cpp
- Pull request de conversión #16: https://github.com/1bit-MONSTER/llama.cpp/pull/16
- Pull request de conversión #17: https://github.com/1bit-MONSTER/llama.cpp/pull/17
- Familias de modelos del autor: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada del autor: https://huggingface.co/1bit-MONSTER#start-here
