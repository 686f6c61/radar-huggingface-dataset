# reverie-studio/VoxCPM2-8bit

## Resumen

VoxCPM2-8bit es un espejo (mirror) sin modificaciones del repositorio `mlx-community/VoxCPM2-8bit`, publicado por `reverie-studio` para centralizar las descargas del servicio Echo de Reverie. No se trata de un modelo original: los archivos son idénticos byte a byte al repositorio de origen y todo el mérito corresponde a sus autores originales. El repositorio no está afiliado ni respaldado por ellos.

El modelo pertenece a la familia VoxCPM2, una arquitectura orientada a síntesis de voz (TTS) según se deduce de los archivos incluidos (`test_en.wav`, `test_id.wav`), aunque la model card no documenta explícitamente la tarea. Los pesos están en formato MLX de 8 bits, pensados para ejecución en Apple Silicon. El repositorio contiene 2.383.791.940 parámetros según los metadatos de safetensors, con un tamaño total de 3,2 GB.

La relevancia de esta ficha es limitada: al ser un espejo, no aporta información técnica nueva sobre el modelo. Cualquier dato de arquitectura, entrenamiento o benchmarks debe consultarse en el repositorio original `mlx-community/VoxCPM2-8bit` o en la fuente upstream de VoxCPM2, no documentada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 2.383.791.940 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 8 bits) |

## Arquitectura y entrenamiento

No disponible. La model card del espejo no describe la arquitectura, los datos de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO. El único indicio estructural es el nombre del modelo base (`mlx-community/VoxCPM2-8bit`), que sugiere una conversión a MLX con cuantización de 8 bits de un modelo denominado VoxCPM2, presumiblemente orientado a voz dado el nombre y los archivos de audio de prueba incluidos.

El repositorio incluye `config.json`, `tokenizer.json`, `tokenizer_config.json` y `special_tokens_map.json`, lo que confirma que se trata de un modelo con tokenizador propio y configuración estándar de Hugging Face. No se dispone de información sobre innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- No disponible de forma explícita en la información proporcionada.
- Por el nombre del modelo y la presencia de archivos `test_en.wav` y `test_id.wav`, es plausible que soporte síntesis de voz en inglés e indonesio, pero esto no está confirmado en la model card.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No se documentan capacidades multilingües más allá de los posibles idiomas inferidos por los archivos de prueba.

## Casos de uso

- Síntesis de voz en local sobre Apple Silicon: el formato MLX de 8 bits está diseñado para ejecutarse de forma eficiente en chips M-series, lo que permitiría integrar el modelo en aplicaciones de escritorio macOS sin depender de la nube. La idoneidad concreta depende de confirmar que la tarea es TTS.
- Réplica de infraestructura de descargas: el propósito declarado del repositorio es que el servicio Echo de Reverie descargue todos los modelos desde un único punto, lo que simplifica la gestión de dependencias y la caché interna.
- Verificación de integridad de artefactos: al incluir `SHA256SUMS`, el repositorio sirve para validar que los pesos descargados coinciden byte a byte con el original antes de desplegarlos.
- Archivado y espejo ante caídas del repositorio original: mantener una copia redundante reduce el riesgo de indisponibilidad del modelo base.
- Experimentación con cuantización MLX: útil para desarrolladores que quieran comparar el comportamiento del modelo en 8 bits frente a otras precisiones del mismo modelo base.
- Integración en pipelines de Hugging Face: al conservar `config.json` y tokenizadores, puede cargarse con las librerías estándar compatibles con MLX, aunque no se especifica cuáles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El tamaño del repositorio es de 3,2 GB en 8 bits, por lo que se requiere al menos ese espacio en memoria unificada para cargar los pesos.
- GPU recomendadas: el formato MLX está orientado a Apple Silicon (chips M1, M2, M3, M4 y superiores). No se documenta compatibilidad con GPU NVIDIA o AMD.
- ¿Cabe en consumer GPU? No aplica en el sentido habitual: está pensado para memoria unificada de Macs. En un Mac con 8 GB o más de memoria unificada podría caber, aunque no se confirma.
- Opciones de despliegue: no se documentan explícitamente. El formato MLX sugiere `mlx-lm` o herramientas equivalentes de MLX; no se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría, y al tratarse de un espejo sin model card técnica no es posible establecer comparaciones rigurosas con alternativas.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial: no está afiliado ni respaldado por los autores originales de VoxCPM2 ni por `mlx-community`.
- La model card no documenta la tarea, la arquitectura ni los datos de entrenamiento, lo que impide evaluar sesgos, alucinaciones o limitaciones de contexto.
- No se especifican los idiomas soportados; los archivos `test_en.wav` y `test_id.wav` solo sugieren inglés e indonesio, sin confirmación.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos en el repositorio original y en la fuente upstream de VoxCPM2 antes de desplegar en producción.
- El formato MLX limita el despliegue a entornos Apple Silicon; no es portable a CUDA sin conversión previa.
- Al ser una copia byte a byte, cualquier error o limitación del modelo original se hereda sin cambios.
- No hay información sobre latencia, throughput ni calidad de salida que permita validar su idoneidad en producción.

## Enlaces

- Repositorio del espejo: https://huggingface.co/reverie-studio/VoxCPM2-8bit
- Repositorio original: https://huggingface.co/mlx-community/VoxCPM2-8bit
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
