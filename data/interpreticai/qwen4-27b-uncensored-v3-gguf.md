# InterpreticAI/Qwen4-27B-Uncensored-v3-GGUF

## Resumen

InterpreticAI/Qwen4-27B-Uncensored-v3-GGUF es un repositorio de pesos en formato GGUF anunciado por InterpreticAI como una versión "sin censura" del modelo Qwen4-27B de Alibaba. A fecha de creación del repositorio (9 de noviembre de 2026), el contenido publicado es únicamente un anuncio de "coming soon": no hay pesos disponibles, no hay tarjeta técnica con especificaciones y no se han publicado resultados de evaluación del modelo anunciado. El autor declara que publicará los pesos en cuanto Qwen libere Qwen4-27B.

El objetivo declarado es eliminar la censura política del modelo base, siguiendo la línea de su entrega anterior, Qwen3.8-27B-Uncensored-v3. En esa entrega previa, el autor reporta una reducción de respuestas censuradas del 83,5% al 2,6% y un aumento de respuestas abiertas con sujeto correcto del 12,2% al 80,9% sobre un conjunto de preguntas políticas chinas (Pan & Xu, 2026). Estos datos corresponden al modelo anterior, no al Qwen4-27B anunciado.

La relevancia actual es limitada desde el punto de vista práctico: no existe artefacto descargable, por lo que no puede evaluarse ni desplegarse. La ficha siguiente documenta lo que el autor declara y marca explícitamente como "no disponible" todo aquello que no figura en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 27B (según el nombre del repositorio; no confirmado en la model card) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (anunciado); también previstos BF16, FP8 e IQ3_XXS en repositorios separados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); BF16, FP8 e IQ3_XXS en repositorios hermanos |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del modelo. El nombre del repositorio indica un tamaño de 27B parámetros y la etiqueta "qwen4" sugiere que se trata de un derivado del modelo Qwen4 de Alibaba, pero la model card no describe la arquitectura del transformer, la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO.

El único detalle metodológico declarado es el objetivo de "eliminar la censura política" del modelo base. El autor no describe el procedimiento de modificación (fine-tuning, edición de pesos, ablación de direcciones de rechazo u otro), ni publica datos sobre el coste computacional o los datos utilizados. La referencia a Pan & Xu (2026) aparece únicamente como benchmark de evaluación del modelo anterior, no como descripción del método de entrenamiento.

## Capacidades

- No se han publicado capacidades específicas del modelo Qwen4-27B-Uncensored-v3 en la información disponible.
- Por herencia del nombre y de la etiqueta "qwen4", cabría esperar generación de texto, razonamiento y código, pero no hay confirmación en la model card.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad multilingüe ni lista de idiomas.
- No se documenta modo de pensamiento (thinking), visión ni audio.
- La única capacidad declarada explícitamente es la reducción de censura política, medida en el modelo anterior con el benchmark de Pan & Xu (2026).

## Casos de uso

- Evaluación de robustez frente a censura: el modelo (cuando se publique) permitiría estudiar cómo responde un modelo "descensurado" a preguntas políticas sensibles, comparándolo con el Qwen4-27B original. Es el uso más directamente alineado con la propuesta del autor.
- Investigación sobre alineación y rechazo: analizar qué comportamientos cambian al eliminar los mecanismos de rechazo y si se producen efectos colaterales en otras áreas (seguridad, toxicidad, veracidad).
- Despliegue local en formato GGUF Q4_K_M: si se publica, el formato cuantizado permitiría ejecución en hardware de consumo mediante llama.cpp u Ollama, aunque el tamaño de 27B exige VRAM considerable.
- Generación de texto en entornos con requisitos de contenido menos restrictivos: para aplicaciones donde las políticas del modelo base limitan respuestas legítimas (literatura, análisis político, debates).
- Comparación de formatos de cuantización: los repositorios hermanos (BF16, FP8, Q4_K_M, IQ3_XXS) permitirían estudiar la degradación de calidad entre precisiones.
- Auditoría de sesgos: evaluar si la modificación introduce o amplifica sesgos en temas políticos y geopolíticos.

Ninguno de estos casos puede ejecutarse actualmente porque no hay pesos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo Qwen4-27B-Uncensored-v3 en la información disponible. El autor solo incluye métricas de su entrega anterior, Qwen3.8-27B-Uncensored-v3, que no corresponden al modelo de esta ficha:

| Métrica (Qwen3.8-27B, Pan & Xu 2026) | Base | Uncensored-v3 |
|---|---|---|
| Respuestas censuradas (menor es mejor) | 83,5% | 2,6% |
| Reescrituras en talking points del PCC (menor es mejor) | 32,2% | 1,7% |
| Sujeto correcto, respuesta abierta (mayor es mejor) | 12,2% | 80,9% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa por tamaño (27B), un GGUF Q4_K_M ocuparía aproximadamente 15-17 GB, pero este cálculo no está confirmado por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; un modelo de 27B en Q4_K_M podría caber en GPUs con 24 GB de VRAM, pero no hay confirmación.
- Opciones de despliegue: el formato GGUF es compatible con llama.cpp, Ollama y otros runners GGUF; no se documenta soporte de vLLM o TGI para este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| InterpreticAI/Qwen4-27B-Uncensored-v3-GGUF | 27B (según nombre) | no disponible | Apache 2.0 | Anunciado, sin pesos |
| InterpreticAI/Qwen3.8-27B-Uncensored-v3 | 27B (según nombre) | no disponible | Apache 2.0 (según repositorio) | Publicado |
| Qwen4-27B (base) | 27B (según nombre) | no disponible | no disponible | No disponible en la información |

No se dispone de datos de rendimiento del modelo anunciado que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es un anuncio de "coming soon". No puede evaluarse ni desplegarse.
- No hay model card técnica, ni especificaciones de arquitectura, contexto o idiomas.
- Los únicos resultados publicados corresponden al modelo anterior (Qwen3.8-27B-Uncensored-v3), no al Qwen4-27B anunciado.
- La eliminación de mecanismos de censura puede incrementar el riesgo de generar contenido dañino, sesgado o factualmente incorrecto; el autor no documenta evaluaciones de seguridad del modelo modificado.
- Riesgo de alucinación: no evaluado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen4-27B aún no se ha publicado, por lo que las condiciones finales podrían variar.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- La fecha de creación (noviembre de 2026) y la referencia a Pan & Xu (2026) sitúan el anuncio en un contexto temporal que conviene verificar antes de citarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-GGUF
- Repositorio BF16: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3
- Repositorio FP8: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-FP8
- Repositorio IQ3_XXS: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-IQ3_XXS-GGUF
- Entrega anterior: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Colección del autor: https://huggingface.co/InterpreticAI
- Sitio del autor: https://interpretic.ai
