# mlx-community/gemma-4-12b-coder-fable5-composer2.5-4bit

## Resumen

Este repositorio contiene una versión cuantizada a 4 bits en formato MLX del modelo `yuxinlu1/gemma-4-12B-coder-fable5-composer2.5-v1`, un ajuste fino orientado a generación de código y razonamiento basado en `google/gemma-4-12B-it`. La conversión ha sido realizada por la comunidad `mlx-community` para permitir la ejecución local eficiente en Apple Silicon mediante la librería `mlx-lm`. El modelo conserva las capacidades de razonamiento y codificación del original con una huella de memoria reducida, lo que lo hace adecuado para entornos de desarrollo con recursos limitados. Incluye una plantilla de chat Jinja para facilitar su uso en inferencia conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 Unified, sin encoder) |
| Parametros totales | 11.907.350.272 (aprox. 11,9 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (este repo), 8 bits (repo hermano) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-12B-it` emplea una arquitectura transformer decoder-only sin codificador separado, diseñada para procesar múltiples modalidades (imagen, audio, vídeo) mediante proyecciones lineales ligeras. Sobre esta base, `yuxinlu1` realizó un ajuste fino específico para tareas de código y razonamiento, denominado `coder-fable5-composer2.5`. Posteriormente, `mlx-community` lo convirtió a formato MLX y lo cuantizó a 4 bits. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de código en múltiples lenguajes de programación.
- Razonamiento lógico y matemático.
- Soporte de conversaciones multi-turno mediante plantilla de chat Jinja.
- Capacidad de "thinking" (razonamiento extendido) según las etiquetas del modelo.
- Integración con `mlx-lm` para inferencia local en Apple Silicon.
- Posible conservación de capacidades multimodales del modelo base, aunque no está confirmado en este ajuste fino.

## Casos de uso

- Asistente de programación local: el modelo puede ayudar a escribir, depurar y explicar código directamente en el editor, gracias a su ajuste específico para tareas de codificación y su tamaño reducido que permite ejecutarlo en un Mac con memoria unificada.
- Generación de tests unitarios: dado su entrenamiento en razonamiento y código, puede crear casos de prueba a partir de funciones o clases existentes, acelerando el desarrollo de software.
- Refactorización de código legacy: puede analizar fragmentos de código existentes y proponer versiones más limpias o eficientes, manteniendo la funcionalidad.
- Revisión de código automatizada: integrado en un pipeline de CI/CD, puede señalar posibles errores, vulnerabilidades o mejoras de estilo en pull requests.
- Tutor de programación: al ser un modelo conversacional, puede explicar conceptos de programación y resolver dudas de estudiantes de forma interactiva.
- Prototipado rápido: permite generar esqueletos de aplicaciones o scripts a partir de descripciones en lenguaje natural, útil para validar ideas antes de implementarlas manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Diseñado para Apple Silicon (M1, M2, M3, M4) con memoria unificada.
- VRAM estimada: aproximadamente 6-7 GB para el modelo en 4 bits (cálculo basado en 11,9 B parámetros × 0,5 bytes/parámetro, más overhead). El tamaño del repositorio es de 13,4 GB, que incluye el modelo y archivos auxiliares.
- Se recomienda al menos 16 GB de RAM en el Mac para una experiencia fluida, aunque podría funcionar con 8 GB con limitaciones.
- Despliegue mediante `mlx-lm` (instalable con `pip install --upgrade mlx-lm`).
- No requiere GPU dedicada, pero sí un chip Apple Silicon con soporte de Metal.
- Latencia y throughput no especificados en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mlx-community/gemma-4-12b-coder-fable5-composer2.5-4bit` | 11,9 B | 4 bits | No disponible | Apache 2.0 | Hugging Face |
| `mlx-community/gemma-4-12b-coder-fable5-composer2.5-8bit` | 11,9 B | 8 bits | No disponible | Apache 2.0 | Hugging Face |
| `yuxinlu1/gemma-4-12B-coder-fable5-composer2.5-v1` | 11,9 B | Sin cuantizar | No disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo. La versión 4 bits ofrece menor huella de memoria a costa de una posible pérdida mínima de precisión frente a la versión 8 bits o la original.

## Limitaciones y advertencias

- La cuantización a 4 bits puede introducir ligeras degradaciones en tareas de razonamiento complejo o generación de código muy específico, aunque se describe como "near-lossless".
- No se ha confirmado si el ajuste fino conserva las capacidades multimodales del modelo base (imagen, audio, vídeo); se recomienda verificar antes de usarlo en tareas que requieran estas entradas.
- El modelo está optimizado para Apple Silicon; su uso en otras plataformas requeriría conversión adicional a formatos como GGUF o ONNX.
- Al ser un modelo de código, puede generar código con errores sutiles o vulnerabilidades de seguridad; se recomienda revisión humana en entornos de producción.
- No se dispone de información sobre sesgos específicos, pero al estar entrenado en datos de internet, puede reflejar sesgos presentes en esos datos.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir adecuadamente al autor original.

## Enlaces

- [Repositorio HuggingFace (4 bits)](https://huggingface.co/mlx-community/gemma-4-12b-coder-fable5-composer2.5-4bit)
- [Modelo base original (yuxinlu1)](https://huggingface.co/yuxinlu1/gemma-4-12B-coder-fable5-composer2.5-v1)
- [Versión 8 bits en MLX](https://huggingface.co/mlx-community/gemma-4-12b-coder-fable5-composer2.5-8bit)
- [Guía de desarrollador de Gemma 4 12B (Google Developers Blog)](https://developers.googleblog.com/gemma-4-12b-the-developer-guide/)
- [Página de Gemma 4 12B en LM Studio](https://lmstudio.ai/models/google/gemma-4-12b)
