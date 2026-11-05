# og1936/qwen-image-2.1-uncensored-weights

## Resumen

Qwen-Image-2.1 UC weights es un espejo no oficial de pesos cuantizados del modelo de generación de imágenes Qwen-Image-2.1, desarrollado originalmente por el equipo Qwen de Alibaba. El repositorio, publicado por el usuario og1936, actúa como almacenamiento de respaldo para un Space de Hugging Face dedicado a la generación de imágenes sin filtros de contenido. No se trata de un modelo entrenado desde cero, sino de una redistribución de pesos derivados del modelo base oficial, con 7.115.124.736 parámetros y un tamaño de repositorio de 11,7 GB.

El modelo resuelve la necesidad de ejecutar generación de imágenes de la familia Qwen en entornos con recursos limitados, ofreciendo pesos en formato GGUF (cuantización Q4_K_M) y safetensors en FP8. La variante "uncensored" implica que se han eliminado o atenuado los mecanismos de rechazo de contenido, lo que lo hace relevante para investigadores que estudian el comportamiento de modelos generativos sin restricciones de seguridad, aunque con implicaciones éticas y legales importantes.

La relevancia actual del repositorio es limitada y controvertida: se publicó el 4 de noviembre de 2026 como copia de un repositorio eliminado el día anterior, con verificación de integridad SHA256 idéntica en cuatro espejos independientes. No cuenta con descargas ni interacciones registradas, y su licencia Qwen Research restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generación de imágenes basado en Qwen-Image-2.1) |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M, safetensors FP8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. Se trata de una redistribución de pesos del modelo Qwen-Image-2.1, por lo que su arquitectura subyacente corresponde a la del modelo base oficial, pero no se detalla en la model card del espejo. El repositorio no incluye información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación como RLHF o DPO.

La única innovación técnica documentada es la verificación de integridad mediante hashes SHA256 idénticos en cuatro espejos independientes, lo que garantiza que los pesos no han sido alterados durante la redistribución. El proceso de cuantización a Q4_K_M y FP8 permite reducir los requisitos de memoria, aunque no se especifican las herramientas utilizadas ni las métricas de degradación de calidad asociadas a cada cuantización.

## Capacidades

- Generación de imágenes a partir de descripciones textuales, heredada del modelo base Qwen-Image-2.1.
- Variante "uncensored": se han eliminado o atenuado los filtros de rechazo de contenido, permitiendo generar imágenes que el modelo original rechazaría.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan modos especiales como thinking mode, visión o audio.
- No se dispone de información sobre resolución de salida, número de pasos de muestreo ni otros parámetros de inferencia.

## Casos de uso

- Investigación sobre seguridad en modelos generativos: el modelo permite estudiar qué tipos de contenido se generan cuando se eliminan los filtros, útil para auditar sesgos y riesgos en modelos de difusión.
- Análisis de degradación por cuantización: comparar la calidad de salida entre Q4_K_M y FP8 permite evaluar el impacto de la compresión en la fidelidad de las imágenes generadas.
- Reproducibilidad de experimentos: los hashes SHA256 verificados permiten replicar resultados en distintos entornos con garantía de que los pesos son idénticos.
- Despliegue en hardware de consumo: la cuantización Q4_K_M reduce el tamaño a un rango manejable para GPUs con 12-16 GB de VRAM, facilitando pruebas locales.
- Generación de imágenes en entornos aislados: al ser un espejo con integridad verificada, puede usarse en pipelines offline donde no se permite descargar modelos desde repositorios oficiales.
- Estudio de licencias y redistribución: caso práctico para analizar las implicaciones legales de redistribuir pesos bajo licencia Qwen Research tras la eliminación del repositorio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 11,7 GB, por lo que la cuantización Q4_K_M podría ejecutarse en GPUs con 12-16 GB de VRAM; la variante FP8 requiere aproximadamente el doble, en torno a 24 GB.
- GPU recomendadas: no se especifican oficialmente; por tamaño, una RTX 4090 (24 GB) podría manejar ambas variantes, mientras que una RTX 3060 (12 GB) quedaría limitada a Q4_K_M.
- Cabe en GPU de consumo: probablemente sí, en modelos con 12 GB o más para Q4_K_M.
- Opciones de despliegue: el formato GGUF sugiere compatibilidad con llama.cpp y derivados como Ollama; el formato safetensors FP8 requeriría frameworks de inferencia que soporten dicho tipo, no especificados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-2.1 UC weights (este) | 7.115.124.736 | no disponible | qwen-research | Espejo no oficial, 0 descargas |
| Qwen-Image-2.1 (base oficial) | no disponible | no disponible | qwen-research | Repositorio oficial de Qwen |
| abenzerps/Qwen-Image-2.1-Uncensored-GGUF | no disponible | no disponible | no disponible | Eliminado el 2026-11-03 |
| KasugaiSakura/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF | no disponible | no disponible | no disponible | Espejo alternativo |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La variante "uncensored" elimina los filtros de seguridad del modelo original, lo que puede facilitar la generación de contenido dañino, ilegal o sexualmente explícito; su uso conlleva riesgos éticos y legales.
- La licencia Qwen Research restringe el uso comercial; es imprescindible revisar sus términos antes de cualquier despliegue en producción.
- El repositorio es un espejo no oficial creado tras la eliminación del repositorio original, lo que plantea dudas sobre su estabilidad y continuidad.
- No se documentan sesgos conocidos, pero al derivar de un modelo entrenado con datos no especificados, es probable que herede sesgos sociales y culturales del modelo base.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido incoherente o no solicitado, especialmente en cuantizaciones agresivas como Q4_K_M.
- No se dispone de información sobre idiomas soportados ni sobre el comportamiento del modelo con prompts en castellano.
- La ausencia de benchmarks y de documentación técnica detallada impide evaluar su calidad objetiva frente al modelo base.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/og1936/qwen-image-2.1-uncensored-weights
- Space asociado: https://huggingface.co/spaces/og1936/qwen-image-2.1-uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio original eliminado: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF (no disponible)
- Espejo alternativo: https://huggingface.co/KasugaiSakura/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF
