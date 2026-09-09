# OmilosAISolutions/omilos-legal-ai-20k

## Resumen

El modelo Omilos Legal AI 20K es un checkpoint de investigación desarrollado por OmilosAISolutions. Se trata de un transformer decoder-only de 482.827.392 parámetros, entrenado mediante continuación de pretraining en textos jurídicos indios. El checkpoint corresponde a la iteración 20K del entrenamiento y aún no ha pasado por la fase de ajuste fino supervisado, por lo que se presenta como un modelo de investigación para la adaptación de dominio.

Su arquitectura incluye 24 capas, un tamaño de ocultación de 1.152 y 18 cabezas de atención, con una ventana de contexto de 8.192 tokens. La relevancia de este modelo radica en ofrecer un punto de partida para el desarrollo de modelos especializados en el ámbito legal indio, permitiendo a los investigadores continuar el entrenamiento o aplicar ajuste fino posterior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parámetros totales | 482.827.392 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (dominio: texto legal indio) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar, sin mecanismos MoE ni componentes SSM. El tokenizer Omilos de 32.000 tokens fue utilizado durante el entrenamiento. La ficha del modelo no especifica el número total de tokens de entrenamiento ni la composición del dataset más allá del dominio, "texto legal indio". Tampoco se menciona el empleo de técnicas de alineación como RLHF o DPO, lo que es coherente con el estado de "continued pretraining". El checkpoint 20K incluye el estado de entrenamiento (optimizador, scheduler y RNG), lo que permite continuar el entrenamiento desde el punto exacto donde se detuvo.

## Capacidades

- Generación de texto autoregresiva: al ser un decoder-only, puede generar texto mediante muestreo autorregresivo, con calidad limitada al dominio de entrenamiento.
- Continuación de texto jurídico: tras el pretraining continuado en texto legal indio, es capaz de completar pasajes de contratos, sentencias o disposiciones legales.
- Modelado del lenguaje de dominio: permite calcular perplexidad en corpus jurídicos y estudiar propiedades de la distribución del lenguaje legal indio.
- Aprendizaje en contexto: como todo transformer autoregresivo, admite condicionamiento por contexto (few-shot) para tareas de texto, aunque no ha sido optimizado para ello mediante SFT.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (visión, audio) ni modos de thinking documentados.
- Idiomas: no especificados en la ficha del modelo; el dominio es texto legal indio, por lo que se asume un entrenamiento centrado en ese ámbito.

## Casos de uso

- Investigación en procesamiento del lenguaje natural jurídico: los investigadores pueden analizar la semántica de textos legales, estudiar términos jurídicos o construir modelos de lenguaje del dominio legal indio a partir del checkpoint.
- Fine-tuning para clasificación de documentos: el checkpoint sirve como punto de partida para entrenar clasificadores de sentencias, contratos o resoluciones judiciales mediante ajuste fino supervisado.
- Extracción de entidades en documentos legales: tras un ajuste fino, puede identificar partes implicadas, fechas, montos y cláusulas relevantes en contratos y escrituras indias.
- Generación automática de resúmenes de casos judiciales: con una fase de SFT, el modelo podría resumir expedientes voluminosos respetando la ventana de contexto de 8.192 tokens.
- Recuperación de información jurídica: como modelo de lenguaje de dominio, puede servir para generar representaciones semánticas de documentos legales y alimentar motores de búsqueda sobre jurisprudencia.
- Baseline para estudios de adaptación de dominio: al ser un checkpoint de pretraining continuado, permite comparar el rendimiento antes y después de aplicar SFT, sirviendo como referencia en experimentos de adaptación.
- Generación de datos sintéticos para entrenamiento de modelos legales: el modelo puede producir textos jurídicos sintéticos que, tras una revisión humana, amplíen datasets de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP32 (482,8 M × 4 bytes) se necesitan aproximadamente 1,9 GB solo para los pesos; con FP16/BF16, unos 0,97 GB. Añadiendo activaciones para un contexto de 8.192 tokens, la estimación total de VRAM se sitúa entre 2 y 4 GB, dependiendo de la precisión y el batch. No hay cuantizaciones disponibles.
- GPU recomendadas: el modelo es ligero y puede ejecutarse en GPUs de consumo como RTX 3060 de 12 GB, RTX 4060 de 8 GB o superiores. En FP16, cualquier GPU con al menos 6 GB de VRAM es suficiente.
- Opciones de despliegue: los pesos se distribuyen en formato PyTorch (.pt), por lo que se requiere carga directa mediante PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; para usarlos sería necesario convertir los pesos a formatos como GGUF o safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

No se han publicado comparativas con modelos similares. En términos de tamaño, el modelo se sitúa en la gama de los 483 millones de parámetros, pero no se dispone de información sobre alternativas equivalentes en el dominio legal indio con el mismo estado de desarrollo.

## Limitaciones y advertencias

- Al no haber pasado por SFT, el modelo no sigue instrucciones de usuario y no debe usarse directamente para tareas de chat o generación de respuestas a preguntas.
- El repo no incluye evaluación de sesgos. El entrenamiento en texto legal indio puede reflejar sesgos presentes en las fuentes utilizadas, sin que se hayan publicado análisis.
- Riesgo de alucinación elevado fuera del dominio legal indio: el modelo solo ha sido preentrenado en ese ámbito, por lo que su conocimiento general es limitado.
- Licencia sin definir: la ficha indica que se debe añadir la licencia apropiada según los datos de entrenamiento y el proyecto. Esto impide un uso comercial seguro sin aclarar los términos.
- El contexto de 8.192 tokens es reducido para documentos legales extensos, lo que obliga a dividir o truncar textos largos.
- Formato de pesos propietario: los archivos están en .pt (PyTorch) y no se incluyen conversiones a safetensors ni GGUF, lo que dificulta su integración en stacks de inferencia estándar.
- El repo tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad en el momento de la consulta.

## Enlaces

- https://huggingface.co/OmilosAISolutions/omilos-legal-ai-20k
- No se han encontrado enlaces adicionales relevantes en los resultados de búsqueda web.
