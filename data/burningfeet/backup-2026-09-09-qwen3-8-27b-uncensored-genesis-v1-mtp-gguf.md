# burningfeet/backup-2026-09-09-Qwen3.8-27B-Uncensored-Genesis-V1-MTP-GGUF

## Resumen

Este modelo es una variante GGUF del modelo Qwen3.8-27B, publicada por el usuario `burningfeet`. Se presenta como una versión «uncensored» y «Genesis», con soporte multimodal de imagen a texto. El modelo base es `HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF`, sobre el que se ha realizado un fine-tuning sin restricciones de contenido.

El repositorio contiene pesos en formato GGUF y ocupa 95,0 GB. El recuento de parámetros totales es de 27.320.697.856 (~27,32 mil millones), según los datos de safetensors disponibles en la ficha. No se han publicado especificaciones sobre la arquitectura interna, la longitud de contexto ni los datos de entrenamiento.

El modelo está sujeto a acceso restringido (gated) en HuggingFace, por lo que es necesario aceptar condiciones para poder descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha proporcionado información sobre la arquitectura interna, el número de tokens de entrenamiento ni la composición del dataset en la ficha del modelo. El nombre del repositorio sugiere que está basado en la familia Qwen, pero no se puede confirmar.

Se trata de un fine-tuning «uncensored» y «Genesis» sobre el modelo base `HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF`. No se indican técnicas de alineación como RLHF o DPO, ni detalles sobre el proceso de entrenamiento.

## Capacidades

- Modalidad multimodal: el pipeline es `image-text-to-text`, por lo que puede aceptar imágenes y texto y generar texto como salida.
- Idioma: los metadatos indican soporte únicamente para inglés.
- Ausencia de filtros de contenido: el modelo se describe como «uncensored», aunque no se aportan detalles sobre el alcance de esa eliminación de restricciones.
- No se han documentado capacidades de tool calling, function calling ni razonamiento agéntico.
- No se dispone de información sobre habilidades específicas en matemáticas, generación de código o razonamiento de múltiples pasos.

## Casos de uso

- Análisis de imágenes en entornos locales: gracias al formato GGUF, puede desplegarse con `llama.cpp` o `Ollama` para tareas básicas de descripción de imágenes y OCR en sistemas sin conexión.
- Asistencia visual en inglés: responder preguntas sobre el contenido de una imagen para usuarios angloparlantes, en aplicaciones de apoyo a la accesibilidad.
- Prototipado de aplicaciones de visión por computador: permite experimentar con pipelines de imagen a texto en hardware de consumo, siempre que la cuantización elegida quepa en VRAM.
- Análisis de documentos escaneados con componentes visuales: el modelo puede extraer texto de imágenes, aunque no se especifica la ventana de contexto, lo que limita el uso en documentos extensos.
- Generación de contenido creativo a partir de imágenes: producir descripciones o narrativas libres a partir de entradas visuales, con la ventaja de tener un comportamiento sin censura.
- Investigación en alineación y sesgos: al ser un modelo sin restricciones, puede usarse para estudiar cómo se comportan los modelos de lenguaje cuando no tienen filtros de seguridad, con fines académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~27,3 mil millones de parámetros en GGUF, se necesitan aproximadamente entre 16 y 28 GB de VRAM según la cuantización. No se pueden dar cifras exactas porque no se conocen los tipos de cuantización incluidos.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) podría ejecutar el modelo con cuantización Q4, pero no se puede confirmar. Para un despliegue cómodo se recomienda una A100 o H100.
- Compatibilidad con GPU de consumo: probablemente sí en las gamas altas, aunque no está verificado.
- Opciones de despliegue: motores compatibles con GGUF, como `llama.cpp`, `Ollama` o `LM Studio`. No se menciona soporte para vLLM ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación del modelo.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de poder descargar el repositorio.
- Sin datos de contexto: al desconocerse la longitud de contexto, no se puede garantizar un comportamiento adecuado en conversaciones largas o documentos extensos.
- Idiomas limitados: los metadatos indican soporte solo para inglés, por lo que su uso en otros idiomas puede resultar incorrecto.
- Riesgo de contenido no deseado: la naturaleza «uncensored» del modelo puede generar salidas ofensivas, ilegales o inapropiadas, lo que supone un riesgo en entornos de producción.
- Documentación insuficiente: no se han publicado detalles sobre sesgos, riesgos de alucinación ni limitaciones técnicas, lo que dificulta una evaluación de riesgos completa.
- Modelo de terceros: al ser un fine-tuning de un modelo creado por otro autor, las condiciones de uso pueden heredar restricciones del modelo base no especificadas en la ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/burningfeet/backup-2026-09-09-Qwen3.8-27B-Uncensored-Genesis-V1-MTP-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
