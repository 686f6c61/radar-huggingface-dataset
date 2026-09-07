# MedOtter/MEGANet

## Resumen
MEGANet es un modelo de segmentación semántica de imágenes médicas diseñado para la detección de pólipos en imágenes de endoscopia. El repositorio de Hugging Face MedOtter/MEGANet actúa como espejo de los checkpoints publicados del proyecto EasyMedSeg, cuyo desarrollo original se encuentra en el repositorio UARK-AICV/MEGANet. El modelo se ofrece en dos variantes de backbone, MEGANet-ResNet y MEGANet-Res2Net, entrenadas sobre el conjunto de datos Polyp compuesto por las colecciones Kvasir y CVC-ClinicDB. No se trata de un modelo de lenguaje, sino de una red de visión por computador para segmentación de lesiones. El repositorio contiene únicamente los pesos en formato .pth, con un tamaño de 1.2 GB, y no incluye información sobre el número de parámetros, la arquitectura detallada ni el proceso de entrenamiento. Su relevancia radica en facilitar el acceso a los pesos de MEGANet para investigadores que trabajen en segmentación de pólipos, aunque la licencia no está declarada y los pesos provienen de una fuente externa (Google Drive).

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | MEGANet (red de segmentación semántica de imágenes médicas) con backbone ResNet o Res2Net |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento
MEGANet es un modelo de segmentación de imágenes médicas, concretamente de pólipos en colonoscopia. El repositorio de Hugging Face ofrece dos checkpoints: MEGANet-ResNet, entrenado sobre el dataset Polyp (Kvasir + CVC-ClinicDB), y MEGANet-Res2Net, también entrenado sobre Polyp. La arquitectura se basa en un encoder ResNet o Res2Net, aunque no se proporcionan detalles sobre la estructura del decoder, el número de parámetros ni el procedimiento de entrenamiento (épocas, pérdida, aumentación de datos, etc.). Al ser un modelo de visión, no se aplican técnicas como RLHF o DPO. La información disponible no permite describir innovaciones técnicas específicas más allá de la variante de backbone utilizada.

## Capacidades
- Segmentación de pólipos en imágenes de endoscopia, a partir de los checkpoints entrenados en Kvasir y CVC-ClinicDB.
- Dos variantes de backbone: ResNet y Res2Net, lo que permite comparar el impacto de la arquitectura en la calidad de la segmentación.
- No es un modelo de lenguaje, por lo que no ofrece generación de texto, razonamiento, tool calling ni soporte de agentes.
- No se han documentado capacidades multilingües ni de procesamiento de audio o vídeo.
- No se dispone de información sobre modos especiales de razonamiento o funciones adicionales.

## Casos de uso
- Investigación en detección de pólipos: el modelo puede utilizarse como referencia para comparar arquitecturas de segmentación en el dataset Polyp, permitiendo evaluar la precisión de nuevas propuestas frente a MEGANet.
- Desarrollo de sistemas de ayuda al diagnóstico en colonoscopia: los checkpoints pueden integrarse en pipelines de procesamiento de imágenes para señalar regiones con pólipos en tiempo real durante la exploración.
- Entrenamiento de modelos de detección de cáncer colorrectal: la segmentación de pólipos es un paso previo para clasificar lesiones y estimar su riesgo, por lo que MEGANet puede servir como componente en sistemas de análisis de imágenes médicas.
- Benchmarking de encoders ResNet frente a Res2Net: al existir dos variantes entrenadas sobre el mismo dataset, el modelo permite estudiar cómo cambia la segmentación al sustituir el backbone.
- Educación y validación de algoritmos de visión por computador: los pesos pueden emplearse en cursos o trabajos académicos sobre segmentación semántica en imágenes médicas.
- Reproducción de experimentos en el proyecto EasyMedSeg: el espejo facilita el acceso a los checkpoints originales para investigadores que deseen reproducir los resultados publicados en el repositorio de UARK-AICV.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Capacidad para ejecutarse en GPU de consumo: no disponible, aunque el tamaño del repositorio (1.2 GB) sugiere que los pesos podrían cargarse en GPUs con memoria suficiente, pero no se aportan datos confirmados.
- Opciones de despliegue: los pesos están en formato .pth, por lo que pueden cargarse con PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplica para modelos de visión).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No disponible.

## Limitaciones y advertencias
- La licencia del modelo no está declarada en la model card, lo que impide conocer las condiciones de uso, especialmente para aplicaciones comerciales.
- Los pesos son un espejo de los originales y provienen de Google Drive, sin verificación de integridad ni trazabilidad clara.
- No se proporcionan métricas de rendimiento ni benchmarks, por lo que no es posible evaluar la calidad del modelo frente a otras alternativas.
- No hay documentación sobre el proceso de entrenamiento, composición exacta del dataset ni posibles sesgos.
- Al ser un modelo de segmentación de imágenes médicas, su uso en diagnóstico clínico debe realizarse con precaución y validación externa, ya que no se ha demostrado su seguridad ni precisión en entornos reales.
- No es un modelo de lenguaje, por lo que no aplican los riesgos de alucinación típicos de los LLM, pero sí existen riesgos de falsos positivos o negativos en la segmentación.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/MedOtter/MEGANet
- Repositorio upstream en GitHub: https://github.com/UARK-AICV/MEGANet
- Perfil de MedOtter en Hugging Face: https://huggingface.co/MedOtter/models
