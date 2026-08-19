# majentik/Qwen3.8-27B-MLX-2bit

## Resumen

El modelo `majentik/Qwen3.8-27B-MLX-2bit` es una variante cuantizada en 2 bits (affine, group size 32) del modelo multimodal `Qwen/Qwen3.8-27B`, preparada específicamente para ejecutarse en Apple Silicon mediante la librería MLX. El autor, `majentik`, ha cuantizado únicamente el "text tower" del modelo, manteniendo el "vision tower" y el proyector en BF16, lo que permite reducir significativamente el uso de memoria manteniendo la capacidad de procesamiento de imágenes. El modelo está diseñado para tareas de image-text-to-text, es decir, puede recibir imágenes y texto como entrada y generar texto como salida.

A pesar de que el nombre sugiere 27 mil millones de parámetros, los parámetros totales declarados en los safetensors son 3.825.044.720 (aproximadamente 3,8 mil millones), lo que indica que el modelo base es de tamaño compacto. La cuantización a 2 bits reduce aún más el peso en disco (11 GB en total, incluyendo el vision tower en BF16), haciendo viable su uso en equipos con memoria unificada moderada. Este modelo es relevante para desarrolladores que necesitan un modelo multimodal ligero y eficiente en hardware de Apple, sin renunciar a la generación de texto coherente y al soporte conversacional.

La licencia Apache-2.0 permite uso comercial y modificación, lo que facilita su integración en aplicaciones propietarias. El autor ha publicado varias variantes de cuantización (2, 3, 4, 5, 6, 8 bits y MXFP4) para adaptarse a diferentes restricciones de memoria y requisitos de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de la familia Qwen, image-text-to-text) |
| Parametros totales | 3.825.044.720 (~3,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit (affine, group size 32); también disponibles 3, 4, 5, 6, 8 bits y MXFP4 en otros repos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un modelo multimodal de la familia Qwen, diseñado para procesar tanto imágenes como texto. La arquitectura exacta (número de capas, tipo de attention, etc.) no se detalla en la información proporcionada, pero al tratarse de un modelo de la serie Qwen, se presume una arquitectura transformer con un encoder de visión (vision tower) y un proyector multimodal. El autor de esta variante cuantizada no ha realizado ningún entrenamiento adicional; únicamente ha aplicado cuantización MLX al text tower, manteniendo el vision tower y el proyector en BF16. El proceso de cuantización se realizó con `mlx_lm.convert` (versión 0.31.3) y se verificó mediante una prueba de coherencia determinista ("smoke gate") que evalúa la generación de 48 tokens en modo greedy, comprobando que no haya salidas vacías, bucles de repetición, gibberish multi-script o restos de tokens especiales.

## Capacidades

- Generación de texto a partir de entradas de imagen y texto (image-text-to-text).
- Soporte de conversación multi-turno (etiquetado como "conversational").
- Procesamiento de imágenes gracias al vision tower en BF16.
- Cuantización 2-bit que reduce el uso de memoria, adecuada para Apple Silicon.
- Compatible con la librería `mlx-lm` para generación y carga del modelo.
- No se especifican capacidades de tool calling, agentes o razonamiento multi-step en la información disponible.

## Casos de uso

- Descripción de imágenes: el modelo puede generar descripciones textuales de fotografías o ilustraciones, útil para aplicaciones de accesibilidad o gestión de contenido visual.
- Respuesta a preguntas visuales (VQA): dado un contexto visual y una pregunta en texto, el modelo puede producir respuestas relevantes, por ejemplo en asistentes para personas con discapacidad visual.
- Chat multimodal en aplicaciones de Apple: al estar optimizado para MLX, puede integrarse en apps de macOS/iOS que requieran interacción conversacional con imágenes, como asistentes personales o herramientas de productividad.
- Análisis de documentos escaneados: combinando OCR con el modelo, se pueden extraer y resumir información de documentos con gráficos o tablas.
- Generación de subtítulos para vídeos o imágenes en tiempo real, aprovechando la baja latencia en hardware Apple.
- Prototipado rápido de aplicaciones de IA en entornos de desarrollo con Mac, gracias a la facilidad de uso de `mlx-lm` y la cuantización ligera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser una variante MLX, está diseñado exclusivamente para Apple Silicon (M1, M2, M3 y superiores).
- El tamaño del repositorio es de 11 GB, lo que sugiere que la memoria unificada necesaria para cargar el modelo completo (incluyendo vision tower en BF16) es de al menos 12-16 GB, dependiendo del sistema operativo y la gestión de memoria.
- La cuantización 2-bit del text tower reduce la huella de memoria en comparación con el modelo original, pero el vision tower en BF16 añade peso.
- Se recomienda un Mac con al menos 16 GB de RAM unificada para una experiencia fluida; con 8 GB podría ser insuficiente.
- Despliegue mediante `mlx-lm` (pip install mlx-lm) y uso con `mlx_lm.generate` o integración en aplicaciones Python.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2 bits es agresiva y puede degradar la calidad de generación en comparación con el modelo original en BF16 o FP16, especialmente en tareas que requieren precisión numérica.
- El modelo base no está documentado en detalle en esta ficha; se desconocen sus sesgos, limitaciones de idioma o comportamiento en dominios específicos.
- No se especifican los idiomas soportados; es probable que el modelo base tenga un enfoque multilingüe, pero no está confirmado.
- El "smoke gate" solo verifica coherencia básica, no garantiza la ausencia de alucinaciones o errores en tareas complejas.
- Al ser una cuantización MLX, no es compatible con otras librerías como Transformers de HuggingFace sin conversión adicional.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base original para posibles restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/majentik/Qwen3.8-27B-MLX-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
