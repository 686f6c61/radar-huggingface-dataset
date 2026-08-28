# Oscilla/Qwen2.5-Coder-1.5B-Instruct-mlx-4Bit

## Resumen

Oscilla/Qwen2.5-Coder-1.5B-Instruct-mlx-4Bit es una conversión a formato MLX con cuantización de 4 bits del modelo Qwen2.5-Coder-1.5B-Instruct, desarrollado por la organización Oscilla. Este modelo está diseñado específicamente para generación de código y conversación técnica, y su versión cuantizada permite ejecutarlo de forma eficiente en hardware Apple Silicon mediante el framework MLX, reduciendo el uso de memoria y acelerando la inferencia.

El modelo base, Qwen2.5-Coder-1.5B-Instruct, pertenece a la familia Qwen2.5-Coder, una serie de modelos de lenguaje especializados en código que incluye versiones de 1.5, 7 y 32 mil millones de parámetros. La versión instruct está afinada para seguir instrucciones y mantener diálogos, lo que la hace adecuada para asistentes de programación, autocompletado y tareas de razonamiento sobre código. La conversión a MLX 4-bit mantiene la arquitectura original (un transformer decoder-only con atención causal) y conserva la ventana de contexto de 32 000 tokens, aunque con una huella de memoria significativamente menor.

Esta ficha cubre las especificaciones técnicas, capacidades, casos de uso y consideraciones prácticas de esta versión cuantizada, orientada a desarrolladores que buscan desplegar un modelo de código ligero y eficiente en entornos Apple o en sistemas con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder) |
| Parametros totales | 1.5 mil millones (modelo base); 241 327 616 en el archivo safetensors cuantizado |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 000 tokens |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Inglés (principalmente; el modelo base también soporta otros, pero la model card indica "en") |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del Qwen2.5-Coder-1.5B-Instruct original, realizado con la librería mlx-lm en su versión 0.31.2. La arquitectura subyacente es un transformer causal con atención por cabezas múltiples, normalización RMSNorm y embeddings rotatorios (RoPE), siguiendo el diseño de la familia Qwen2.5. No se trata de un modelo entrenado desde cero, sino de una adaptación del checkpoint ya afinado para instrucciones, por lo que conserva las capacidades del modelo original.

El proceso de cuantización a 4 bits reduce el tamaño de los pesos de punto flotante a enteros de 4 bits, lo que disminuye el uso de memoria y acelera la inferencia en hardware compatible con MLX, como los chips Apple M1, M2 y M3. No se han realizado cambios en la arquitectura ni en los pesos más allá de la cuantización; el comportamiento funcional es equivalente al del modelo base, aunque con una posible pérdida mínima de precisión debido a la reducción de bits.

## Capacidades

- Generación de código en múltiples lenguajes de programación, incluyendo Python, JavaScript, Java, C++, entre otros, gracias al entrenamiento del modelo base en corpus de código.
- Razonamiento sobre código: explicar fragmentos, detectar errores, sugerir correcciones y completar funciones incompletas.
- Conversación multi-turno: mantiene contexto en diálogos técnicos gracias a su ventana de 32 000 tokens.
- Seguimiento de instrucciones: responde a peticiones específicas de generación, refactorización o documentación de código.
- Capacidad multilingüe limitada: aunque la model card indica inglés, el modelo base Qwen2.5-Coder fue entrenado con datos multilingües, por lo que puede comprender y generar texto en otros idiomas con menor calidad.
- No se ha confirmado soporte explícito para tool calling o function calling en esta versión cuantizada; el modelo base tampoco lo documenta de forma destacada.

## Casos de uso

- Asistente de programación integrado en editores de código: el modelo puede sugerir completados y generar bloques de código en tiempo real, gracias a su baja latencia en Apple Silicon y a su tamaño reducido.
- Autocompletado de código en entornos de desarrollo remotos: al ocupar menos de 1 GB de VRAM, puede ejecutarse en máquinas virtuales o contenedores con recursos limitados.
- Generación de documentación técnica: a partir de una firma de función o un fragmento, el modelo produce comentarios y explicaciones claras.
- Tutor de programación: responde preguntas sobre conceptos de programación y ofrece ejemplos prácticos en un formato conversacional.
- Revisión de código automatizada: dado un fragmento, puede detectar posibles errores lógicos o de sintaxis y sugerir mejoras.
- Prototipado rápido de scripts: el desarrollador describe la funcionalidad deseada y el modelo genera un esqueleto de código ejecutable.
- Despliegue en dispositivos edge: gracias a su tamaño compacto y al formato MLX, es viable para aplicaciones locales en MacBooks o iPads con Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión cuantizada en la información disponible. El modelo base Qwen2.5-Coder-1.5B-Instruct ha sido evaluado en tareas de código como HumanEval y MBPP, pero no se proporcionan cifras concretas en la documentación de esta versión MLX. Se recomienda consultar la página del modelo original para obtener datos de rendimiento comparativos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0.9 GB según datos de llm-explorer para la versión 4-bit MLX, lo que permite ejecutarlo en GPUs con 1 GB o más de memoria.
- GPU recomendadas: cualquier GPU compatible con MLX, principalmente Apple Silicon (M1, M2, M3) con memoria unificada de 8 GB o superior. También puede ejecutarse en GPU NVIDIA mediante el backend de transformers, aunque el formato MLX está optimizado para Apple.
- Cabe en GPUs de consumo como la NVIDIA GTX 1650 (4 GB) o la RTX 3050 (4 GB), siempre que se utilice un backend que soporte el formato MLX o se convierta a otro formato.
- Opciones de despliegue: mlx-lm (recomendado para Apple), también es compatible con la librería transformers de HuggingFace si se carga como modelo estándar, aunque la conversión a MLX no es directamente utilizable en llama.cpp o vLLM sin una conversión adicional.
- Latencia y throughput: no se han publicado mediciones específicas, pero al ser un modelo de 1.5B cuantizado, se espera una generación de decenas de tokens por segundo en hardware Apple moderno.

## Comparativa con modelos similares

No se dispone de una comparativa directa con modelos equivalentes en la información proporcionada. A modo de referencia, el modelo base compite con otras soluciones de código de tamaño similar, como DeepSeek-Coder-1.3B (contexto 16K, licencia MIT) o CodeLlama-7B (contexto 16K, licencia Llama), pero no se han encontrado datos verificados de rendimiento para esta versión cuantizada. Se recomienda consultar los benchmarks oficiales de cada modelo antes de elegir.

## Limitaciones y advertencias

- La cuantización a 4 bits puede introducir una pérdida de precisión en tareas complejas de razonamiento o generación de código largo, aunque en la práctica suele ser mínima.
- El modelo está optimizado para inglés; el rendimiento en otros idiomas puede ser inferior.
- Al ser una versión pequeña (1.5B), su capacidad de razonamiento y generación de código complejo es limitada en comparación con modelos de mayor tamaño como Qwen2.5-Coder-7B o 32B.
- No se ha confirmado soporte para tool calling o integración con agentes; para aplicaciones que requieran estas funciones, se debe verificar la documentación del modelo base.
- El formato MLX es específico de Apple; para otros entornos es necesario convertir los pesos a otros formatos (GGUF, safetensors estándar), lo que puede requerir trabajo adicional.
- La licencia Apache-2.0 permite uso comercial, pero se debe revisar la licencia del modelo base (también Apache-2.0) para confirmar que no hay restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oscilla/Qwen2.5-Coder-1.5B-Instruct-mlx-4Bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Página del modelo en Ollama: https://ollama.com/library/qwen2.5-coder:1.5b-instruct
- Referencia de VRAM y contexto en llm-explorer: https://llm-explorer.com/model/Qwen%2FQwen2.5-Coder-1.5B-Instruct,3UEbw9qUlk6g82SXEd8vjE
- Referencia de la versión 4-bit de mlx-community: https://llm-explorer.com/model/mlx-community%2FQwen2.5-Coder-1.5B-Instruct-4bit,16TxUzvZ6yLFaNJARFY8cN
