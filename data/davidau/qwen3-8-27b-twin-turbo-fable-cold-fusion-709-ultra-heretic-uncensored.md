# DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored

## Resumen

DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored es un modelo de lenguaje multimodal desarrollado por DavidAU a partir de un finetune previo de la familia Qwen3.8. Se distribuye como un finetune especializado en comportamientos sin censura, con entrenamiento en múltiples etapas y técnicas denominadas Cold Fusion y GAIN Training. El modelo acepta tanto texto como imágenes como entrada, lo que lo sitúa en la categoría de modelos image-text-to-text.

Con 27.781.427.952 parámetros (27,78 mil millones), el modelo se aloja en HuggingFace con formato safetensors y un tamaño de repositorio de 55,6 GB. Su licencia declarada es Apache 2.0, aunque el acceso al repositorio está restringido y requiere aceptar condiciones previas. El modelo está centrado en el idioma inglés según las etiquetas publicadas.

La relevancia de este modelo radica en su naturaleza "uncensored", orientada a aplicaciones donde se requiere libertad de contenido y respuestas sin filtros de seguridad. Al tratarse de un finetune multimodal, puede procesar entradas visuales además de texto, lo que amplía su campo de aplicación frente a modelos puramente textuales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers multimodal (image-text-to-text) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 55,6 GB |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de transformers, con capacidad de procesamiento de texto e imágenes (image-text-to-text). Se desconoce el tipo exacto de arquitectura interna (densa o MoE) y la longitud de contexto, ya que estos datos no figuran en la información publicada. El modelo es un finetune de otro finetune: parte de DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, que a su vez es una adaptación de la familia Qwen3.8.

El entrenamiento incorpora técnicas denominadas Cold Fusion, GAIN Training y Multi-stage tuning, según las etiquetas del repositorio. No se ofrecen detalles técnicos sobre estas técnicas en la documentación disponible. Tampoco se especifican los datos de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO. El modelo está etiquetado como "uncensored" y "heretic", lo que sugiere que se ha afinado para eliminar o reducir las restricciones de contenido presentes en los modelos base convencionales.

## Capacidades

- Generación de texto y procesamiento de imágenes gracias a su pipeline image-text-to-text.
- Conversación en inglés como idioma principal, según las etiquetas publicadas.
- Comportamiento sin censura ("uncensored"), lo que permite generar respuestas que otros modelos filtran o rechazan.
- Adecuado para tareas de razonamiento multimodal cuando el contexto requiere contenido no restringido.
- Tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y multi-step reasoning: no disponible en la información publicada.
- Capacidades multilingües: solo se declara inglés; no hay datos sobre otros idiomas.
- Modo thinking, visión y audio: la visión está soportada, el resto no disponible.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir descripciones visuales o narrativas para proyectos artísticos, novelas o guiones que requieran libertad temática, aprovechando su naturaleza uncensored.
- Análisis de imágenes en dominios no regulados: gracias a su capacidad image-text-to-text, puede describir o interpretar fotografías en contextos donde no se aplican filtros automáticos.
- Investigación sociológica o lingüística: puede emplearse para estudiar la generación de lenguaje en escenarios con mínima alineación, comparando sus salidas con modelos censurados.
- Asistencia en tareas de visión complejas: el modelo puede responder preguntas sobre imágenes en inglés cuando el contenido visual no está sujeto a políticas de moderación.
- Prototipado de asistentes conversacionales alternativos: útil en desarrollos donde la personalidad o el tono del asistente permita respuestas abiertas y sin filtros.
- Generación de datos sintéticos para entrenamiento: puede crear conjuntos de pares imagen-texto en inglés para afinamientos posteriores, especialmente en dominios donde los datos públicos están limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión FP16, el modelo ocupa aproximadamente 55,6 GB (27,78B parámetros × 2 bytes). Con cuantización 4-bit, la estimación baja a unos 14 GB. No hay datos oficiales de consumo en inferencia.
- GPU recomendadas: para FP16 completo se necesitan al menos una GPU de 80 GB (A100, H100). Para cuantización 4-bit, una RTX 4090 o RTX 3090 podría ser viable, siempre que se realice la cuantización externa.
- Soporte en GPU de consumo: con cuantización 4-bit y reducción de VRAM, es plausible en GPUs de consumo de 24 GB, aunque no está documentado.
- Opciones de despliegue: el formato safetensors permite utilizar vLLM, TGI y la librería transformers. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio en HuggingFace está marcado como gated, por lo que es necesario aceptar condiciones antes de descargar el modelo.
- Sin benchmarks públicos: no hay datos objetivos de rendimiento, lo que impide validar su calidad frente a otros modelos.
- Naturaleza uncensored: al carecer de filtros de seguridad, el modelo puede generar contenido ofensivo, ilegal o dañino. Esto supone un riesgo elevado para aplicaciones en producción con usuarios finales.
- Riesgo de alucinación: al tratarse de un finetune sin datos evaluativos publicados, no se puede garantizar la veracidad de las respuestas.
- Idiomas limitados: solo se ha documentado el inglés; el soporte multilingüe es incierto.
- Especificaciones incompletas: no se han publicado la longitud de contexto, los tipos de cuantización ni la arquitectura detallada, lo que dificulta la planificación de despliegues.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated puede impedir su uso en entornos industriales si no se gestiona adecuadamente.

## Enlaces

- https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
