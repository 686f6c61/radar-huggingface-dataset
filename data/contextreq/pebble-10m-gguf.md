# ContextReq/Pebble-10M-GGUF

## Resumen

Pebble-10M es un modelo de lenguaje de tamaño reducido (10,28 millones de parámetros) desarrollado por basically-ai y convertido a formato GGUF por ContextReq. Su arquitectura híbrida combina seis capas Mamba2 con dos capas de atención, una configuración poco habitual que busca explorar la eficiencia de los modelos de estado (SSM) junto con mecanismos de atención clásicos. Con una ventana de contexto de solo 512 tokens y un vocabulario de 2048 entradas, está pensado como un banco de pruebas de investigación, no como un modelo de producción.

La relevancia de esta conversión GGUF radica en que permite ejecutar el modelo con llama.cpp, aunque requiere un parche específico porque la arquitectura `pebble` no está soportada en el código oficial. El repositorio de soporte incluye el parche, un convertidor independiente y una implementación de referencia en numpy para verificar la corrección de las salidas. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2 + atención (6 capas Mamba2 + 2 capas attention) |
| Parametros totales | 10.281.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | f16, q8_0, q4_k_m |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que intercala capas Mamba2 (seis) con capas de atención (dos), con una dimensión oculta de 384 y un total de ocho capas. Esta combinación busca aprovechar la eficiencia computacional de los modelos de espacio de estado para secuencias largas y la capacidad de atención para tareas que requieren recuperación precisa de información. El vocabulario está limitado a 2048 tokens, lo que restringe su aplicabilidad a dominios muy específicos.

No se dispone de información sobre el proceso de entrenamiento: ni el número de tokens utilizados, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Dado su tamaño y su propósito declarado como modelo de investigación, es probable que se haya entrenado con un corpus pequeño y con fines de experimentación. La calidad de salida es descrita por el autor como "nivel de juguete", lo que confirma su orientación académica.

## Capacidades

- Generación de texto básica: puede producir secuencias coherentes a corto plazo, pero con limitaciones evidentes de coherencia y conocimiento.
- Razonamiento limitado: su pequeño tamaño y vocabulario restringido impiden tareas complejas de razonamiento o matemáticas.
- Sin soporte de tool calling ni function calling: no se menciona ninguna capacidad de este tipo.
- Sin capacidades de agente ni multi-step reasoning: la ventana de 512 tokens y la arquitectura reducida no lo permiten.
- Multilingüismo: no se especifican idiomas soportados; probablemente entrenado solo con datos en inglés.
- Sin capacidades multimodales: es exclusivamente texto.

## Casos de uso

- Investigación académica sobre arquitecturas híbridas SSM + atención: el modelo permite estudiar el comportamiento de la combinación Mamba2 y atención en un entorno controlado y de bajo coste computacional.
- Pruebas de integración de GGUF con llama.cpp: al requerir un parche específico, sirve como caso de prueba para desarrolladores que trabajan en la compatibilidad de arquitecturas personalizadas con el ecosistema llama.cpp.
- Validación de convertidores de formato: el repositorio incluye un convertidor independiente (`basicallyai_to_gguf.py`) y una implementación de referencia en numpy, lo que lo convierte en un banco de pruebas para verificar la corrección de conversiones de pesos.
- Educación en modelos de lenguaje: por su tamaño mínimo, puede ejecutarse en CPU y es útil para demostrar conceptos de generación de texto, tokenización y cuantización en entornos docentes.
- Desarrollo de técnicas de cuantización: las tres variantes GGUF (f16, q8_0, q4_k_m) permiten comparar el impacto de la cuantización en un modelo pequeño y de arquitectura no estándar.
- Prototipado de sistemas de generación de texto con vocabulario restringido: si el dominio se limita a un conjunto muy específico de tokens (por ejemplo, comandos o etiquetas), podría usarse como generador de secuencias sintéticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K, y no se han encontrado evaluaciones externas. Dado el tamaño del modelo y su propósito de investigación, es poco probable que se hayan realizado evaluaciones estandarizadas.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF son muy pequeños (f16: 20,7 MB, q8_0: 11,1 MB, q4_k_m: 7,5 MB), por lo que caben en cualquier GPU, incluso en las integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU consumer: sí, todas las GPU consumer actuales (RTX 3060, RTX 4090, etc.) pueden ejecutarlo sin esfuerzo.
- Opciones de despliegue: llama.cpp (con el parche proporcionado), posiblemente otros frameworks que soporten GGUF, pero la arquitectura personalizada limita la compatibilidad.
- Latencia y throughput: no se proporcionan datos, pero al ser un modelo de 10M de parámetros, la generación es prácticamente instantánea en hardware moderno.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de tamaño similar. Existen otros modelos de 10M de parámetros (por ejemplo, algunos modelos de TinyStories o GPT-2 pequeño), pero no hay datos de rendimiento comparables en la información disponible. La arquitectura híbrida Mamba2 + atención es inusual, lo que dificulta la comparación directa con modelos transformer puros.

## Limitaciones y advertencias

- Calidad de salida muy limitada: el autor lo describe como "nivel de juguete", por lo que no es adecuado para tareas reales de generación de texto.
- Ventana de contexto extremadamente corta (512 tokens): limita cualquier uso que requiera contexto largo.
- Vocabulario reducido (2048 tokens): restringe los dominios de aplicación y la fluidez del lenguaje.
- Requiere un parche de llama.cpp: la arquitectura `pebble` no es compatible con el código oficial, lo que complica el despliegue y el mantenimiento.
- Sin información sobre sesgos o alucinaciones: al ser un modelo de investigación, no se han realizado evaluaciones de sesgo; es probable que presente alucinaciones frecuentes debido a su tamaño.
- Licencia Apache 2.0: permite uso comercial, pero la utilidad práctica es casi nula fuera de la investigación.
- Sin soporte de la comunidad: el modelo tiene cero descargas y cero likes en HuggingFace, lo que indica un uso muy marginal.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ContextReq/Pebble-10M-GGUF
- Modelo base: https://huggingface.co/basically-ai/Pebble-10M
- Repositorio de soporte (parche, convertidor, referencia numpy): https://github.com/rootendpoint/basicallyai_llama.cpp_support
- Documentación de GGUF en HuggingFace: https://huggingface.co/docs/hub/gguf
