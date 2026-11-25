# Pixfanthav/Kroma-Shared

## Resumen

Kroma-Shared es un repositorio de artefactos derivados de un modelo de generación de imágenes, empaquetados en el formato propietario del motor Kroma, una aplicación independiente que ejecuta modelos de imagen en la NPU de teléfonos con chipset Snapdragon. Lo publica Pixfanthav, autor también de la propia aplicación Kroma, y no está pensado para cargarse con software convencional (transformers, diffusers, llama.cpp): la app descarga los ficheros automáticamente y los interpreta según su propio layout.

El repositorio no contiene un modelo de lenguaje ni un modelo multimodal en sentido estricto, sino un conjunto de pesos reorganizados y recuantizados de un modelo de imagen preexistente, junto con su text encoder, VAE, filtro de contenido, upscaler y tokenizadores. Los pesos se ofrecen en fp16 y en variantes cuantizadas a 8 y 4 bits por bloques (transformer_q8, transformer_q4), lo que permite ajustar el consumo de memoria a las limitaciones de un móvil.

El dato de "890.344.960 parámetros totales" que aparece en safetensors corresponde al conjunto de tensores empaquetados, no a un transformer de lenguaje de ese tamaño. La relevancia es acotada: es un recurso de despliegue para un runtime concreto (Kroma sobre NPU Snapdragon), con licencia agregada de terceros y sin model card técnica al uso, benchmarks ni idiomas declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | modelo de difusión para imágenes (transformer) empaquetado en layout del motor Kroma; detalles internos no disponibles |
| Parámetros totales | 890.344.960 (según safetensors del repo) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (no aplica a un modelo de imagen) |
| Tipos de cuantización | fp16, q8 (8 bits por bloques), q4 (4 bits por bloques) |
| Idiomas soportados | no disponible (incluye un módulo de traducción de prompts basado en PLaMo 3 Translate 0.8B) |
| Licencia | multiple / other (agregada: MIT, Apache 2.0, BSD-3-Clause y PLaMo Community License según carpeta) |
| Formato de pesos | ONNX y GGUF/formatos propios del motor Kroma (no safetensors estándar cargable por terceros) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo de imagen más allá de identificarlo como "the image model, fp16 as made", es decir, pesos de un modelo preexistente convertidos sin reentrenamiento. Kroma reorganiza los tensores en su propio layout y cambia el formato numérico de almacenamiento; las carpetas transformer_q8 y transformer_q4 contienen los ficheros por bloques cuantizados, mientras el resto de componentes se comparte con la versión fp16.

El repositorio se organiza en carpetas: transformer (modelo de imagen fp16), transformer_q8 y transformer_q4 (bloques a 8 y 4 bits), text_encoder y text_encoder_q8, vae y extra. En "extra" se agrupan componentes auxiliares con licencias dispares: VAE, filtro de contenido, upscaler, tokenizadores, tag matching y traducción de prompts mediante PLaMo 3 Translate 0.8B. No se documentan tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones de decodificación; el autor indica explícitamente que los ficheros no están pensados para otro software y que Kroma es un proyecto independiente no avalado por los creadores del modelo original.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante el transformer empaquetado y su text encoder.
- Ejecución en la NPU de teléfonos Snapdragon a través de la app Kroma, con selección de formato (fp16, q8, q4) en la pantalla de descarga.
- Decodificación de latentes a imagen mediante el VAE incluido.
- Escalado de imagen (upscaler) como componente auxiliar del paquete.
- Filtrado de contenido integrado (content filter) para moderar salidas.
- Traducción de prompts al inglés mediante PLaMo 3 Translate 0.8B, lo que facilita el uso en otros idiomas.
- Etiquetado y coincidencia de tags (tag matching) para prompts y metadatos.
- No se documentan tool calling, function calling, razonamiento multi-paso ni capacidades de agente.

## Casos de uso

- Generación de imágenes en dispositivos móviles sin conexión: la app Kroma carga los bloques q4 o q8 en la NPU Snapdragon, lo que permite crear imágenes en el propio teléfono sin enviar prompts a un servidor.
- Prototipado de interfaces de imagen para apps Android: los desarrolladores pueden integrar el runtime de Kroma y descargar estos artefactos para validar flujos de generación en hardware real de gama alta.
- Evaluación de cuantización en NPU: comparar la calidad de salida entre fp16, q8 y q4 sobre el mismo modelo permite medir la pérdida por cuantización en un acelerador móvil concreto.
- Traducción de prompts multilingües: el módulo PLaMo 3 Translate 0.8B incluido permite que usuarios no angloparlantes escriban prompts en su idioma y se traduzcan antes de la generación.
- Moderación previa a la generación: el content filter del paquete puede aplicarse en pipelines locales para bloquear prompts no permitidos antes de invocar el transformer.
- Reescalado de imágenes generadas: el upscaler incluido sirve para aumentar la resolución de las salidas dentro del mismo flujo de la app, sin depender de servicios externos.
- Distribución de artefactos para un runtime cerrado: sirve como ejemplo de empaquetado de pesos por bloques para motores que no usan safetensors estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma oficial; el repo ocupa 1,4 GB y las variantes q4/q8 reducen el peso del transformer respecto a fp16, pero no se publican cifras de memoria en ejecución.
- Hardware objetivo: NPU de teléfonos con chipset Qualcomm Snapdragon; la app Kroma está diseñada para ese acelerador.
- GPU de escritorio: no es el destino previsto; no se documenta compatibilidad con A100, H100 ni RTX 4090.
- Opciones de despliegue: únicamente la app Kroma (descarga automática de ficheros); no se indica soporte para vLLM, llama.cpp, Ollama, TGI ni diffusers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kroma-Shared | artefactos de modelo de imagen para NPU Snapdragon | 890.344.960 tensores empaquetados | no aplica | multiple/other | Hugging Face, uso vía app Kroma |
| Modelo de imagen original (no identificado en la información) | difusión para imágenes | no disponible | no aplica | según el autor original | no disponible |
| Alternativas de difusión ejecutables en móvil (p. ej. runtimes ONNX/Core ML) | difusión para imágenes | no disponible | no aplica | variable | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas; la información proporcionada no identifica el modelo base ni publica métricas.

## Limitaciones y advertencias

- Los ficheros están en el layout propietario del motor Kroma y "no están pensados para cargarse con otro software"; no son utilizables con transformers, diffusers o llama.cpp sin conversión.
- La licencia es agregada ("multiple"): cada carpeta tiene su propia licencia en licenses/ (MIT, Apache 2.0, BSD-3-Clause y PLaMo Community License). El uso comercial depende de la licencia del modelo base, que no se identifica en la información disponible.
- El módulo de traducción PLaMo 3 Translate 0.8B está sujeto a la PLaMo Community License, con posibles restricciones adicionales para uso comercial.
- Kroma es un proyecto independiente no avalado por los creadores del modelo original; no hay garantías de soporte ni de compatibilidad futura.
- No se documentan sesgos, tasas de alucinación (no aplica a imagen en el sentido habitual) ni evaluación de calidad de las salidas.
- No hay idiomas declarados ni benchmarks; la calidad de generación y la fidelidad de la cuantización q4/q8 no están medidas públicamente.
- El filtro de contenido incluido puede bloquear prompts legítimos; su comportamiento no está documentado.
- Riesgo de obsolescencia: el repo se actualizó por última vez en noviembre de 2026 y depende de una app concreta.

## Enlaces

- Hugging Face: https://huggingface.co/Pixfanthav/Kroma-Shared
- Repositorio de la app Kroma: https://github.com/Pixfanthav/Kroma
- Licencias por carpeta: carpeta licenses/ dentro del repositorio de Hugging Face
- PLaMo 3 Translate 0.8B (módulo de traducción incluido): no disponible enlace directo en la información proporcionada
