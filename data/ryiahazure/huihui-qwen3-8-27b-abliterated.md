# RyiahAzure/Huihui-Qwen3.8-27B-abliterated

## Resumen

Huihui-Qwen3.8-27B-abliterated es una variante "abliterated" (sin rechazos) del modelo Qwen/Qwen3.8-27B, publicada por el usuario RyiahAzure en Hugging Face. La abliteración es una técnica de intervención sobre los pesos que elimina la dirección de activación asociada a las respuestas de rechazo, de modo que el modelo deja de negarse a responder ante ciertas peticiones. El resultado es un modelo conversacional de 27.781.427.952 parámetros (unos 27,8 mil millones) con pesos en safetensors y un repositorio de 55,6 GB.

El modelo hereda la arquitectura y capacidades del Qwen3.8-27B original, incluyendo el pipeline image-text-to-text (visión-lenguaje), aunque la model card indica explícitamente que las capas visuales y el módulo MTP no han sido modificados por la abliteración. La intervención se aplica únicamente sobre las capas 18 a 51; las 15 primeras capas se mantienen intactas para preservar el rendimiento original. La licencia declarada es Apache 2.0.

Es relevante porque combina un modelo multimodal de gran tamaño con una modificación que elimina las barreras de rechazo, algo de interés para investigación sobre alineación, evaluación de sesgos y aplicaciones donde el filtrado del modelo base resulta demasiado restrictivo. No obstante, se trata de una implementación "cruda, proof-of-concept" según su propio autor, y no dispone de descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; tag `qwen3_5`); multimodal imagen-texto |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; disponible versión Ollama) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y aplica abliteración mediante la técnica implementada en el repositorio remove-refusals-with-transformers, una implementación sin TransformerLens. La abliteración identifica la dirección de activación que gobierna las respuestas de rechazo y la proyecta fuera de los pesos, de forma que el modelo pierde la tendencia a negarse a responder. En esta versión concreta solo se han ablacionado las capas 18 a 51; las 15 primeras capas se conservan sin modificar y el módulo MTP (multi-token prediction) y el codificador visual tampoco han sido alterados, con el objetivo de retener el máximo rendimiento del modelo original.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base, ya que la model card no los detalla. La innovación técnica destacable es precisamente el procedimiento de abliteración parcial por capas, que busca un equilibrio entre eliminar los rechazos y preservar las capacidades originales.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con el codificador visual intacto respecto al modelo base.
- Razonamiento y respuesta a instrucciones heredados de Qwen3.8-27B.
- Modo de razonamiento explícito: el código de ejemplo gestiona el token `</think>`, lo que indica soporte de cadenas de pensamiento.
- Predicción multi-token (MTP) conservada del modelo base.
- Respuestas sin rechazos ante peticiones que el modelo original declinaría, gracias a la abliteración.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar las respuestas del modelo abliterated con las del Qwen3.8-27B original para estudiar cómo la eliminación de la dirección de rechazo afecta al comportamiento y a las tasas de negativa.
- Evaluación de sesgos y robustez: usar la variante sin filtrado para medir qué contenidos genera el modelo cuando no hay barreras de rechazo, como paso previo al diseño de salvaguardas externas.
- Análisis de imágenes con descripción libre: al conservar el codificador visual, puede emplearse en tareas image-text-to-text donde se requiera descripción detallada sin restricciones temáticas.
- Generación de texto creativo sin filtros: escritura de ficción, guiones o narrativa con temáticas sensibles que el modelo base rechazaría.
- Prototipado de asistentes conversacionales: el código de ejemplo incluye streaming con métricas de latencia (primer token, tokens por segundo), útil para evaluar el rendimiento en aplicaciones de chat.
- Despliegue local vía Ollama: la model card ofrece el comando `ollama run huihui_ai/Qwen3.8-abliterated`, lo que facilita pruebas en entornos de desarrollo sin infraestructura de servidor dedicada.
- Estudio académico de técnicas de abliteración: servir como caso de referencia para reproducir y comparar el método remove-refusals-with-transformers frente a aproximaciones con TransformerLens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,78 mil millones de parámetros, en bfloat16 se requieren aproximadamente 55,6 GB de VRAM (coincide con el tamaño del repo); en cuantización de 8 bits, unos 28 GB; en 4 bits, unos 14-16 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: para precisión completa, A100 80 GB, H100 80 GB o varias GPU de 24-48 GB con reparto de capas; para cuantización 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podría alojarlo.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4-8 bits sobre GPU de 24 GB, aunque no se confirma en la información disponible.
- Opciones de despliegue: transformers (código de ejemplo incluido en la model card), Ollama (versión oficial `huihui_ai/Qwen3.8-abliterated`); vLLM, llama.cpp o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles; el código de ejemplo incluye instrumentación para medirlos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated | 27,78 B | no disponible | imagen-texto | Apache 2.0 | 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27,78 B (según derivado) | no disponible | imagen-texto | no disponible | modelo de referencia |
| Otras variantes abliterated de la familia Qwen | no disponible | no disponible | texto | no disponible | no disponible |

La comparación cuantitativa de rendimiento con alternativas no está disponible, ya que no se han publicado benchmarks del modelo ni del base en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los rechazos del modelo, por lo que puede generar contenido dañino, ilegal o sensible sin filtro; requiere salvaguardas externas en cualquier despliegue en producción.
- Es una implementación "cruda, proof-of-concept" según el propio autor, no un producto validado.
- Solo se ablacionaron las capas 18 a 51; el comportamiento de rechazo podría persistir parcialmente en las capas iniciales o en el módulo visual, no modificado.
- Riesgo elevado de alucinación inherente al modelo base, no cuantificado en la información disponible.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que dificulta planificar su uso en aplicaciones multilingües o de contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede vulnerar políticas de plataformas o normativa; la responsabilidad recae en el desplegador.
- El repositorio no tiene descargas ni valoraciones, por lo que no existe validación comunitaria de su calidad o estabilidad.
- El tag `qwen3_5` y el nombre "Qwen3.8-27B" no coinciden con nomenclaturas conocidas de la familia Qwen, lo que sugiere posibles inconsistencias en los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/RyiahAzure/Huihui-Qwen3.8-27B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la técnica de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- Versión Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- Repositorio Ollama (releases): https://github.com/ollama/ollama/releases
- Revisión anterior del modelo: `hf download huihui-ai/Huihui-Qwen3.8-27B-abliterated --local-dir ./huihui-ai/Huihui-Qwen3.8-27B-abliterated --revision d42ca89`
