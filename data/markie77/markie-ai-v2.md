# Markie77/markie-ai-v2

## Resumen

Markie-ai-v2 es un modelo de lenguaje y visión (vision-language model) publicado por el usuario Markie77 en Hugging Face. Se trata de una conversión a formato GGUF del modelo base Qwen3.5-0.8B, realizada con la herramienta Unsloth, y está pensada para su uso con llama.cpp y llama-cpp. El repositorio incluye tanto los pesos del modelo en BF16 como un proyector multimodal (`mmproj`) en F16, lo que permite inferencia con entrada de imágenes a través de `llama-mtmd-cli`.

Con 772.845.888 parámetros totales (aproximadamente 0,77 mil millones), es un modelo de tamano reducido, adecuado para ejecución en hardware de consumo. La familia Qwen3.5 es desarrollada por el equipo Qwen de Alibaba, aunque esta publicación concreta es una redistribución comunitaria y no oficial. La etiqueta `qwen3_5` en los tags sugiere que el modelo base pertenece a esa generación.

La relevancia de esta ficha es limitada: no se dispone de model card detallada, licencia declarada, idiomas soportados ni resultados de benchmarks. Se trata de un artefacto de conversión más que de un modelo original, por lo que la evaluación debe apoyarse en las características conocidas del modelo base Qwen3.5-0.8B y en las capacidades que el formato GGUF y el proyector multimodal permiten inferir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con proyector multimodal para visión; detalles no disponibles |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y F16 (archivos publicados); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors como origen de la conversion) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la pertenencia a la familia Qwen3.5 y de la presencia de un componente de visión. El repositorio contiene dos archivos GGUF: `Qwen3.5-0.8B.BF16.gguf`, que corresponde a los pesos del modelo de lenguaje en precisión BF16, y `Qwen3.5-0.8B.F16-mmproj.gguf`, que es el proyector multimodal en F16 encargado de alinear las representaciones visuales con el espacio del modelo de lenguaje. Esta separación es la habitual en llama.cpp para modelos multimodales, donde el `mmproj` se carga junto al modelo principal para habilitar la entrada de imágenes.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones técnicas específicas más allá de las propias del modelo base Qwen3.5, que no están descritas en la información proporcionada. La conversión a GGUF mediante Unsloth sugiere que el proceso se realizó con las herramientas estándar de esa librería para generar pesos compatibles con llama.cpp.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Procesamiento de imágenes y texto combinados (vision-language model), gracias al proyector multimodal incluido.
- Compatibilidad con llama.cpp y llama-cpp, incluyendo ejecución vía `llama-cli` para texto y `llama-mtmd-cli` para multimodal.
- Soporte de plantillas de chat mediante el flag `--jinja`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere uso en servicios de inferencia.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales locales: al ser un modelo de menos de 1.000 millones de parámetros en GGUF, puede ejecutarse en un portátil o en una GPU de consumo para probar flujos de chat sin depender de la nube.
- Descripción de imágenes en aplicaciones de accesibilidad: el proyector multimodal permite pasar una imagen y obtener una descripción textual, útil para generar texto alternativo o lectura asistida en entornos con recursos limitados.
- Clasificación y extracción de información de documentos escaneados: combinando texto e imagen, el modelo puede procesar capturas o formularios simples en pipelines locales con llama.cpp.
- Educación y demostraciones técnicas: su tamano reducido lo hace adecuado para talleres donde se enseña a desplegar modelos multimodales con llama.cpp y `llama-mtmd-cli`.
- Inferencia en dispositivos con poca VRAM: al caber en memoria de GPUs de gama media o incluso en CPU, sirve para entornos embebidos o de borde donde no es viable un modelo mayor.
- Pruebas de integración con endpoints compatibles: la etiqueta `endpoints_compatible` permite usarlo como backend de prueba en servicios que esperan una API tipo OpenAI, validando la integración antes de pasar a modelos mayores.
- Experimentación con cuantización y formatos GGUF: útil para comparar el rendimiento de BF16 frente a otras cuantizaciones en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 772.845.888 parámetros en BF16 (2 bytes por parámetro), los pesos ocupan aproximadamente 1,5 GB; el proyector multimodal en F16 anade un tamano reducido adicional. En la práctica, se necesita alrededor de 2 GB de VRAM o RAM para cargar el modelo, más el espacio para el contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como GTX 1650, RTX 3050, RTX 4060 o superiores. También puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs de consumo actuales e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), llama-cpp-python y cualquier servidor compatible con GGUF. No se confirma soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, se espera una latencia baja en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Markie77/markie-ai-v2 | 772.845.888 | no disponible | Sí (mmproj) | no disponible | GGUF |
| Qwen2.5-VL-3B (referencia de familia) | ~3.000 millones | no disponible en esta ficha | Sí | no disponible en esta ficha | safetensors/GGUF |
| SmolVLM-500M (referencia de tamano) | ~500 millones | no disponible en esta ficha | Sí | no disponible en esta ficha | safetensors/GGUF |

La comparativa es limitada porque no se dispone de datos verificados de los modelos alternativos en la información proporcionada. Se incluyen únicamente como referencia de categoría (modelos multimodales de menos de 3.000 millones de parámetros), sin afirmar cifras que no estén confirmadas.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial no está garantizado y requiere consulta al autor o al modelo base.
- No se especifican los idiomas soportados; el rendimiento fuera del inglés o del chino (idiomas habituales en la familia Qwen) es incierto.
- Al ser una conversión comunitaria y no oficial, no hay garantía de que los pesos coincidan exactamente con el modelo base Qwen3.5-0.8B ni de que el proceso de conversión haya preservado todas las capacidades.
- Riesgo de alucinación inherente a modelos de menos de 1.000 millones de parámetros, especialmente en tareas de razonamiento complejo o matemáticas.
- Sin datos de benchmarks, no es posible evaluar su calidad frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La longitud de contexto no está documentada, lo que impide planificar su uso en conversaciones largas o documentos extensos.
- El soporte multimodal depende de la correcta carga del archivo `mmproj` y de la versión de llama.cpp utilizada; versiones antiguas pueden no ser compatibles.

## Enlaces

- Hugging Face: https://huggingface.co/Markie77/markie-ai-v2
- Unsloth (herramienta de conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
