# InterpreticAI/Qwen4-27B-Uncensored-v3

## Resumen

Qwen4-27B-Uncensored-v3 es un repositorio anunciado por InterpreticAI que, en el momento de la consulta, no contiene pesos publicados: la model card indica explícitamente "Coming soon" y condiciona la publicación a la disponibilidad previa de Qwen4-27B por parte de Alibaba. Se trata, por tanto, de un espacio reservado para una futura versión del modelo Qwen4-27B con las capas de censura política eliminadas mediante ajuste fino o edición de pesos.

El objetivo declarado del autor es eliminar el sesgo de censura política presente en los modelos Qwen, siguiendo la metodología de su entrega anterior (Qwen3.8-27B-Uncensored-v3), en la que reportan una reducción de respuestas censuradas del 83,5 % al 2,6 % sobre el conjunto de preguntas políticas chinas de Pan & Xu (2026). El modelo base Qwen4-27B no ha sido publicado oficialmente, por lo que no hay información verificable sobre su arquitectura, tamaño efectivo ni ventana de contexto.

La relevancia actual es limitada desde el punto de vista práctico: no existen pesos descargables, no hay benchmarks del modelo derivado y el pipeline no está definido en Hugging Face. Cualquier evaluación de capacidades, latencia o calidad debe posponerse hasta la publicación efectiva de los artefactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (dependera de Qwen4-27B, aun no publicado) |
| Parametros totales | 27B (segun el nombre del repositorio; no verificado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8, GGUF Q4_K_M, GGUF IQ3_XXS (formatos planificados, no publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16/FP8) y GGUF (planificados) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del modelo. El nombre del repositorio sugiere una base Qwen4-27B de tipo transformer denso con 27 000 millones de parámetros, pero ni el autor ni la model card aportan detalles sobre número de capas, atención, tokenizador o ventana de contexto. Tampoco se especifica si el modelo base emplea mezcla de expertos.

El proceso de "descensura" tampoco está documentado en esta entrega. Por analogía con la versión anterior (Qwen3.8-27B-Uncensored-v3), cabe esperar un ajuste fino supervisado o una edición de direcciones de activación orientada a reducir respuestas evasivas en temas políticos, pero no se proporcionan datos sobre volumen de entrenamiento, composición del dataset, uso de RLHF/DPO ni hiperparámetros. No se ha publicado ningún paper, blog técnico ni repositorio de código asociado.

## Capacidades

- No hay información verificable sobre capacidades del modelo, ya que los pesos no están publicados.
- Por herencia del modelo base Qwen4-27B, se espera generación de texto, razonamiento y código, pero no está confirmado ni documentado.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre sesgo político en LLM: el modelo, una vez publicado, permitiría comparar tasas de rechazo y evasión frente al Qwen4-27B original usando el conjunto de Pan & Xu (2026) u otros similares.
- Evaluación de técnicas de descensura: serviría como referencia para estudiar cómo el ajuste fino altera la distribución de respuestas en dominios sensibles sin degradar tareas neutras.
- Análisis de robustez y seguridad: útil para medir la eficacia de filtros de salida y clasificadores de contenido en despliegues que requieran control de temas.
- Despliegue local en cuantización GGUF: los formatos Q4_K_M e IQ3_XXS planificados permitirían ejecución en hardware de consumo, aunque no hay pesos ni métricas de calidad asociadas.
- Fine-tuning posterior en dominios específicos: al ser Apache 2.0, el modelo podría adaptarse a nichos verticales, siempre que se publique.
- Docencia y divulgación: como ejemplo de ecosistema de modelos derivados y de las tensiones entre apertura y moderación.

Ninguno de estos casos puede ejecutarse hoy: son escenarios previstos para cuando el autor publique los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para Qwen4-27B-Uncensored-v3. La única tabla presente en la model card corresponde a la versión anterior y se reproduce a continuación como referencia, no como resultado de este modelo:

| Metrica (Qwen3.8-27B-Uncensored-v3) | Qwen3.8-27B | Uncensored-v3 |
|---|---|---|
| Respuestas censuradas (menor es mejor) | 83,5 % | 2,6 % |
| Reescribe en puntos de propaganda del PCC (menor es mejor) | 32,2 % | 1,7 % |
| Tema correcto y respuesta abierta (mayor es mejor) | 12,2 % | 80,9 % |

Estos datos no son extrapolables al modelo Qwen4 ni han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un modelo denso de 27B en BF16 se requerirían del orden de 54 GB solo para pesos, y en FP8 unos 27 GB, pero son estimaciones teóricas no confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, un modelo de 27B en BF16 encajaría en A100 80 GB o H100 80 GB; en FP8 podría caber en A100 40 GB o L40S.
- GPU de consumo: las cuantizaciones GGUF Q4_K_M (aprox. 16-17 GB) e IQ3_XXS (aprox. 11-12 GB) planificadas podrían ejecutarse en RTX 4090 (24 GB) y, con menor margen, en GPUs de 16 GB, aunque no hay pesos publicados para verificar.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama serían candidatos habituales, pero no hay artefactos ni configuraciones publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Pesos publicados | Notas |
|---|---|---|---|---|---|
| InterpreticAI/Qwen4-27B-Uncensored-v3 | 27B (segun nombre) | no disponible | Apache 2.0 | No | Repositorio "coming soon" |
| InterpreticAI/Qwen3.8-27B-Uncensored-v3 | 27B (segun nombre) | no disponible | Apache 2.0 | No verificado en la informacion | Entrega anterior con metricas de censura reportadas |
| Qwen4-27B (modelo base) | 27B (segun nombre) | no disponible | no disponible | No | Aun no publicado por Alibaba segun la model card |

No se dispone de información suficiente para comparar rendimiento, calidad o latencia con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no contiene pesos: cualquier uso en producción es imposible en la fecha de la información.
- El modelo base Qwen4-27B no está publicado, por lo que las especificaciones del derivado son especulativas.
- La eliminación de censura política puede aumentar el riesgo de generar contenido sesgado, incorrecto o dañino en temas sensibles; no hay evaluación de seguridad publicada.
- No se han publicado evaluaciones independientes de las métricas de descensura ni del impacto en capacidades generales (razonamiento, código, matemáticas).
- La licencia Apache 2.0 permite uso comercial, pero el autor no aclara si impone restricciones adicionales de uso responsable.
- Riesgo de alucinación y sesgos: no evaluado en esta versión.
- Idiomas soportados: no documentados; no se puede garantizar calidad en castellano.
- La fecha de creación del repositorio (2026-11-09) y la referencia a un paper de 2026 (Pan & Xu) deben tratarse con cautela hasta verificación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3
- Colección del autor: https://huggingface.co/InterpreticAI
- Versión anterior: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Variante FP8 (planificada): https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-FP8
- Variante GGUF Q4_K_M (planificada): https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-GGUF
- Variante GGUF IQ3_XXS (planificada): https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-IQ3_XXS-GGUF
- Sitio del autor: https://interpretic.ai
