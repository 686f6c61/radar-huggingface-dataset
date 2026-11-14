# reverie-studio/flux2-klein-4b-mflux-q4

## Resumen

flux2-klein-4b-mflux-q4 es una cuantización a 4 bits del modelo de generación de imágenes FLUX.2 [klein] 4B de Black Forest Labs, convertida al formato de mflux (la implementación en MLX de FLUX para Apple Silicon) mediante la herramienta `mflux-save` de la versión 0.24.0 de mflux. El modelo lo publica el usuario reverie-studio, que lo describe como un espejo (mirror) para que la aplicación Reverie descargue todos sus modelos desde un único repositorio; la autoría del modelo base corresponde íntegramente a Black Forest Labs.

Se trata, por tanto, de un artefacto de distribución y no de un modelo nuevo: no se ha aplicado ningún ajuste fino ni modificación más allá de la cuantización de los pesos a 4 bits. El repositorio ocupa 4,6 GB y contiene pesos en safetensors pensados para ejecutarse con mflux sobre hardware Apple Silicon (MLX), lo que lo hace relevante para desarrolladores que quieran correr FLUX.2 klein 4B en Mac con memoria unificada limitada.

La licencia Apache-2.0 se hereda sin cambios del modelo original. La model card no documenta arquitectura, datos de entrenamiento ni benchmarks; toda la información técnica disponible procede de los metadatos del repositorio y de la propia model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de difusión para generación de imágenes, FLUX.2 [klein] 4B; detalles arquitectónicos no documentados en la información disponible) |
| Parámetros totales | 4B (según el nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplicable de forma directa a un modelo de difusión de imágenes; no documentado) |
| Tipos de cuantización | 4 bits (cuantizado con mflux 0.24.0 mediante `mflux-save`); no se documentan otras variantes en este repo |
| Idiomas soportados | no disponible (modelo de generación de imágenes; prompts probablemente en inglés, no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato mflux, librería `mlx`) |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el nombre y la familia (FLUX.2 [klein] 4B de Black Forest Labs) se trata de un modelo de difusión para generación de imágenes de aproximadamente 4B parámetros, pero la model card no detalla si emplea transformer de difusión, flow matching, mecanismos de atención lineal ni ninguna otra innovación concreta. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias.

Lo único verificable sobre el proceso de construcción de este artefacto es la cadena de conversión: se parte de la revisión `e7b7dc27f91deacad38e78976d1f2b499d76a294` de `black-forest-labs/FLUX.2-klein-4B` y se cuantiza a 4 bits con mflux 0.24.0 usando `mflux-save`, sin otros cambios según el autor. El repositorio incluye un archivo `SHA256SUMS` con los hashes de todos los ficheros, lo que permite verificar la integridad de la descarga.

## Capacidades

- Generación de imágenes a partir de prompts de texto (texto a imagen), heredada del modelo base FLUX.2 [klein] 4B.
- Ejecución nativa en Apple Silicon mediante MLX y mflux, con pesos ya cuantizados a 4 bits listos para cargar.
- Carga directa en mflux 0.24.0 pasando la carpeta del repositorio como `--model` y, cuando mflux lo requiera, `--base-model flux2-klein-4b`.
- Distribución verificable: el archivo `SHA256SUMS` permite comprobar la integridad de cada fichero descargado.
- No se documentan en la información disponible capacidades de edición de imagen, image-to-image, inpainting, tool calling, agentes, modo thinking, audio ni otras modalidades.

## Casos de uso

- Generación de imágenes en local en un Mac: cargar el repositorio con mflux 0.24.0 (`--model <carpeta> --base-model flux2-klein-4b`) permite producir imágenes sin depender de servicios en la nube, aprovechando la cuantización a 4 bits para reducir el consumo de memoria unificada.
- Prototipado rápido de pipelines de imagen generativa: al ser un checkpoint ya cuantizado, se evita repetir el proceso de conversión y se puede iterar sobre prompts y parámetros de muestreo directamente.
- Integración en la aplicación Reverie: el autor declara que el espejo existe para que la app descargue todos sus modelos desde un único origen, por lo que este repo es el artefacto que consume ese cliente.
- Verificación de integridad en despliegues: usar `SHA256SUMS` en scripts de descarga o CI para validar que los pesos no se han corrompido antes de cargarlos en producción.
- Reproducibilidad de experimentos: fijar este repositorio como fuente de pesos en notebooks o scripts de evaluación para garantizar que todas las ejecuciones parten del mismo checkpoint cuantizado.
- Base para comparativas de cuantización: confrontar la salida de este checkpoint 4 bits con el modelo original en fp16/bf16 para medir la pérdida de calidad introducida por la cuantización en tareas concretas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 4,6 GB, por lo que se necesita al menos ese espacio para los pesos; a ello hay que sumar la memoria para activaciones y estado del sampler durante la inferencia, no cuantificada en la documentación.
- GPU recomendadas: no se documentan. El formato (MLX + mflux) está orientado a Apple Silicon, no a GPU NVIDIA o AMD.
- ¿Cabe en GPU de consumo? No aplica directamente: el artefacto está pensado para Mac con memoria unificada. En Apple Silicon, 4,6 GB de pesos más overhead deberían caber en configuraciones de 16 GB o superiores, pero el requisito exacto no está documentado.
- Opciones de despliegue: exclusivamente mflux 0.24.0 con librería `mlx`. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM y no a este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Notas |
|---|---|---|---|---|
| reverie-studio/flux2-klein-4b-mflux-q4 (este) | 4B | safetensors MLX, 4 bits | Apache-2.0 | Cuantización comunitaria para mflux |
| black-forest-labs/FLUX.2-klein-4B | 4B | no disponible en la información | no disponible en la información | Modelo original; previsiblemente mayor precisión y mayor peso en disco |
| Otras alternativas de generación de imágenes de ~4B | no disponible | no disponible | no disponible | No hay datos suficientes en la información proporcionada para establecer una comparativa con modelos de la misma categoría |

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la calidad de las imágenes frente al modelo original en fp16/bf16; no se documenta la magnitud de esa pérdida.
- No hay benchmarks ni evaluaciones publicadas para este checkpoint, por lo que su rendimiento relativo es desconocido.
- El artefacto solo funciona con mflux 0.24.0 y MLX; no es portable a ecosistemas CUDA, ROCm ni a runtimes de LLM convencionales.
- Es un espejo de terceros (reverie-studio), no una publicación oficial de Black Forest Labs; conviene verificar los hashes con `SHA256SUMS` y contrastar con el repositorio original.
- La model card no documenta sesgos del modelo base, límites de resolución, número de pasos de muestreo recomendado ni comportamiento multilingüe de los prompts.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar el `LICENSE` incluido y las condiciones del modelo base original para confirmar que no hay restricciones adicionales.
- Riesgo de alucinación visual (contenido incoherente o artefactos) inherente a los modelos de difusión; no cuantificado en este checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/reverie-studio/flux2-klein-4b-mflux-q4
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- mflux (herramienta de conversión y runtime): https://github.com/filipstrand/mflux
- Perfil del autor del espejo: https://huggingface.co/reverie-studio
