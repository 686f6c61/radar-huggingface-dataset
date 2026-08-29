# DotCheck/dotcheck

## Resumen

DotCheck es una organización que desarrolla modelos de detección de contenido generado por inteligencia artificial (imágenes, vídeo, texto y audio). El repositorio `DotCheck/dotcheck` no es un modelo en sí, sino la página institucional de la organización en Hugging Face, donde se documentan los distintos motores de detección publicados con pesos abiertos bajo licencia Apache-2.0. El objetivo del proyecto es ofrecer puntuaciones de probabilidad de que un contenido sea sintético o manipulado, tanto a través de una API comercial como mediante pesos abiertos para integración propia.

La colección incluye cuatro motores principales: `vermeer-image-v14_2` para imágenes, `valla-text-v12` para texto, `muybridge-video-v4_4` para vídeo y `helmholtz-audio-v3` para audio. Todos ellos consisten en cabezas lineales entrenadas sobre backbones congelados (SigLIP2, Dasheng-Base, etc.) y se distribuyen en formato `.npz`. La organización publica métricas de validación en conjuntos de retención propios, pero no proporciona detalles sobre arquitectura completa, número de parámetros ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas lineales sobre backbones congelados (SigLIP2 base patch16 224 para imagen/vídeo, Dasheng-Base para audio, TMR + Fakespot + cabezas logísticas para texto) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `.npz`, sin cuantización publicada) |
| Idiomas soportados | no disponible (se mencionan cabezas de idioma para texto, sin especificar cuáles) |
| Licencia | Apache-2.0 (según model card; el tag de Hugging Face indica "other") |
| Formato de pesos | `.npz` (cabezas lineales) |

## Arquitectura y entrenamiento

La información pública es limitada. Cada motor sigue un patrón común: se toma un backbone preentrenado y congelado (por ejemplo, SigLIP2 para visión, Dasheng-Base para audio) y se entrena una cabeza lineal (un clasificador de una capa) sobre las representaciones extraídas. Para texto, se menciona una combinación de TMR y Fakespot con cabezas logísticas, además de cabezas específicas por idioma. No se detallan los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La organización indica que los pesos abiertos son la parte pública de su producto comercial, y que el ensamblaje de vídeo con audio (denominado "Covenant") permanece en la ruta del producto.

## Capacidades

- Detección de imágenes generadas o manipuladas por IA (motor `vermeer-image-v14_2`).
- Detección de texto sintético o generado por IA (motor `valla-text-v12`), con soporte de cabezas de idioma adicionales.
- Detección de vídeo manipulado o generado, con limitación de sello de marca de agua (motor `muybridge-video-v4_4`).
- Detección de audio sintético o clonado (motor `helmholtz-audio-v3`).
- Puntuaciones de probabilidad (estimaciones, no veredictos) para cada modalidad.
- Integración mediante API comercial o mediante pesos abiertos para uso propio.

## Casos de uso

- Moderación de contenidos en plataformas sociales: el motor de imagen puede puntuar imágenes subidas por usuarios para detectar deepfakes o imágenes generadas por IA antes de su publicación.
- Verificación de identidad en procesos de onboarding: el motor de vídeo puede analizar selfies en vídeo para detectar suplantación o generación sintética.
- Filtrado de reseñas falsas en comercio electrónico: el motor de texto puede puntuar reseñas para identificar texto generado automáticamente.
- Auditoría de medios en redacciones periodísticas: los motores de imagen y vídeo ayudan a verificar la autenticidad de material recibido de fuentes externas.
- Detección de clonación de voz en sistemas de autenticación telefónica: el motor de audio puede puntuar grabaciones para detectar voz sintética.
- Investigación académica sobre detección de contenido sintético: los pesos abiertos permiten reproducir y comparar los métodos de DotCheck en conjuntos de datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La organización reporta métricas de balance de error (balanced accuracy) sobre sus propios conjuntos de retención:

| Motor | Modalidad | Métrica (balanced accuracy) |
|---|---|---|
| vermeer-image-v14_2 | Imagen | 0.9924 |
| valla-text-v12 | Texto EN | 0.979 |
| muybridge-video-v4_4 | Vídeo (stamp-cap) | 0.9859 |
| helmholtz-audio-v3 | Audio | 0.995 |

Estas cifras son estimaciones sobre conjuntos de retención propios, no comparables con benchmarks públicos.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU recomendadas en la documentación pública.
- Al tratarse de cabezas lineales sobre backbones congelados, la inferencia requiere cargar el backbone correspondiente (SigLIP2 base, Dasheng-Base) más la cabeza lineal, lo que implica un coste computacional moderado.
- Los pesos `.npz` no son directamente ejecutables con frameworks estándar de inferencia como vLLM u Ollama; requieren un pipeline personalizado que cargue el backbone y aplique la cabeza lineal.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de detección de contenido sintético (por ejemplo, modelos de detección de deepfakes como los de la comunidad de Hugging Face). La organización no publica comparaciones con alternativas, y los datos de rendimiento solo se refieren a sus propios conjuntos de retención. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Las puntuaciones son estimaciones, no veredictos; la organización lo indica explícitamente en su documentación.
- Los modelos se evalúan sobre conjuntos de retención propios, lo que puede no reflejar el rendimiento en datos del mundo real.
- No se publican detalles sobre sesgos, riesgos de alucinación (en el caso de texto) ni limitaciones idiomáticas más allá de la mención de cabezas de idioma.
- La licencia indicada en la model card es Apache-2.0, pero el tag de Hugging Face dice "other"; conviene verificar los términos exactos antes de uso comercial.
- El formato `.npz` y la dependencia de backbones congelados pueden dificultar la integración en pipelines estándar.
- No se proporciona información sobre el rendimiento en casos adversarios (por ejemplo, imágenes con perturbaciones o texto muy corto).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DotCheck/dotcheck
- Colección de motores: https://huggingface.co/collections/DotCheck/dotcheck-engines-6a659e57f7934cb510677785
- Sitio web del producto: https://dotcheck.ai
- Página de verificación (Guest Check): https://dotcheck.ai/check
- Documentación de método y umbrales: https://dotcheck.ai/docs · https://dotcheck.ai/how
- Perfil en X: https://x.com/dotcheckai
