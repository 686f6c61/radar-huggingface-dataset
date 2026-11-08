# necropopeost/S5-nano-MLX-mxfp4-vision

## Resumen

S5-nano-MLX-mxfp4-vision es una conversión no oficial del modelo multimodal maritaca-ai/S5-nano al formato MLX, cuantizada en MXFP4 (Microscaling FP4) para su ejecución local en Macs con Apple Silicon. El autor de la conversión es el usuario de Hugging Face necropopeost, sin vínculo declarado con Maritaca AI, que es la desarrolladora del modelo original. El modelo resuelve el problema de la degradación del razonamiento en modo *Think* que provoca la cuantización afín de 4 bits tradicional, manteniendo un tamaño reducido de aproximadamente 3,2 GB.

La arquitectura declarada en los metadatos es qwen3_5, con un total de 4.539.265.536 parámetros (unos 4,54 mil millones) en pesos safetensors. El modelo es multimodal (image-text-to-text), soporta portugués e inglés, y se distribuye bajo licencia Apache 2.0. La conversión mantiene la torre de visión en precisión completa (BF16) mediante la librería mlx-vlm, mientras que el resto de pesos se almacena en MXFP4.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de casi 4,5 mil millones de parámetros en hardware de consumo Apple Silicon con un equilibrio razonable entre tamaño y calidad de razonamiento, según los datos aportados por el autor de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según metadatos); transformer multimodal con torre de visión |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (Microscaling FP4) para pesos del lenguaje; visión en BF16 |
| Idiomas soportados | portugués (pt), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX); librería mlx |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es maritaca-ai/S5-nano, con arquitectura etiquetada como qwen3_5 en los metadatos de Hugging Face. Se trata de un modelo multimodal que combina un modelo de lenguaje con una torre de visión, procesada mediante la librería mlx-vlm. El autor de la conversión no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo original utilizó RLHF o DPO.

La innovación técnica destacable de esta conversión es el uso de MXFP4 (Microscaling FP4), un formato de cuantización con escalado compartido que, según el autor, preserva mejor la integridad de los pesos que la cuantización afín de 4 bits tradicional. El autor afirma que la cuantización afín de 4 bits provoca que el modelo entre en bucles en modo *Think*, mientras que MXFP4 mantiene un razonamiento lógico coherente casi al nivel de la versión de 8 bits con la mitad del tamaño. La torre de visión se mantiene en BF16 para preservar la calidad de la percepción visual. No se dispone de información sobre técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en portugués e inglés.
- Razonamiento en modo *Think* (pensamiento explícito), activable mediante `enable_thinking=True` en la plantilla de chat.
- Comprensión de imágenes y respuesta a preguntas sobre ellas (image-text-to-text).
- Descripción de imágenes en portugués, según el ejemplo de la model card.
- Explicación de conceptos complejos (el ejemplo de la model card menciona la teoría de la relatividad).
- Soporte de plantilla de chat conversacional multi-turno mediante `apply_chat_template`.
- No se dispone de información sobre tool calling, function calling, capacidades de agente, audio u otras modalidades.

## Casos de uso

- Asistente multimodal local en Mac: ejecutar el modelo con mlx-vlm en un Mac con Apple Silicon para responder preguntas sobre imágenes sin conexión a servicios en la nube, aprovechando el tamaño reducido de 3,2 GB y la torre de visión en BF16.
- Descripción y análisis de imágenes en portugués: usar el pipeline de ejemplo de la model card para generar descripciones de fotografías o capturas, útil en herramientas de accesibilidad o catalogación de imágenes.
- Tutoría educativa en portugués: el modo *Think* permite generar explicaciones razonadas de conceptos científicos o matemáticos, como el ejemplo de la relatividad incluido por el autor.
- Prototipado de aplicaciones de visión-lenguaje: desarrolladores que quieran validar flujos image-text-to-text en hardware de consumo antes de migrar a infraestructura mayor, gracias a la licencia Apache 2.0.
- Investigación sobre cuantización: el modelo sirve como caso de estudio para comparar MXFP4 frente a cuantización afín de 4 bits en tareas de razonamiento (el autor reporta 80 % frente a 64 % en ENADE-QA).
- Procesamiento de documentación con imágenes en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, adecuado para documentos sensibles en portugués o inglés.

## Benchmarks y rendimiento

El autor de la conversión reporta un único resultado en la model card:

| Benchmark | Modo | Resultado |
|---|---|---|
| ENADE-QA (modo Think) | MXFP4 (esta versión) | 80,00 % de acierto |
| ENADE-QA (modo Think) | Cuantización 4-bit afín tradicional | 64 % de acierto |
| ENADE-QA (modo Think) | Versión 8-bit | 80,00 % (mismo que MXFP4, según el autor) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar, ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM/unified memory estimada: el repo ocupa 2,9 GB y el autor indica un tamaño de archivo de aproximadamente 3,2 GB; se necesita memoria unificada suficiente para cargar los pesos más el overhead de mlx-vlm (no cuantificado en la información disponible).
- Hardware objetivo: Macs con Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se indica compatibilidad con GPU NVIDIA o AMD.
- No cabe en GPU de consumo convencionales por ser un formato MLX; requiere el ecosistema Apple.
- Despliegue: librería `mlx-vlm` (Python 3.10+), con `pip install mlx-vlm`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S5-nano-MLX-mxfp4-vision (esta ficha) | 4,54 mil millones | no disponible | imagen-texto | Apache 2.0 | Hugging Face, formato MLX |
| maritaca-ai/S5-nano (base) | no disponible en la información | no disponible | imagen-texto | no disponible en la información | Hugging Face |
| necropopeost/Qwen3.5-4B-mxfp4-MLX | ~1B (según metadatos de búsqueda) | no disponible | imagen-texto | no disponible | Hugging Face, formato MLX |

La información disponible no permite una comparación cuantitativa de rendimiento entre estos modelos, ya que solo se aporta el resultado de ENADE-QA para esta conversión.

## Limitaciones y advertencias

- Conversión no oficial: el autor declara no tener vínculo con Maritaca AI y no haber entrenado ni modificado el modelo; los méritos del S5-nano corresponden al equipo de Maritaca.
- Solo compatible con Apple Silicon mediante MLX; no es desplegable en ecosistemas CUDA ni en CPU convencional sin conversión adicional.
- Idiomas limitados a portugués e inglés; no se declara soporte de castellano.
- Longitud de contexto no documentada, lo que impide planificar cargas con ventanas largas.
- El modo *Think* es sensible a la cuantización: el autor advierte que la cuantización afín de 4 bits provoca bucles, por lo que variantes distintas de MXFP4 pueden degradar el razonamiento.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se aportan datos específicos de sesgos.
- El benchmark reportado (ENADE-QA) es único y aportado por el autor de la conversión, sin validación independiente.
- La licencia Apache 2.0 se declara en los metadatos, pero la información sobre la licencia del modelo base no está disponible en los datos proporcionados; conviene verificar la licencia de maritaca-ai/S5-nano antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/necropopeost/S5-nano-MLX-mxfp4-vision
- Modelo base: https://huggingface.co/maritaca-ai/S5-nano
- Perfil del autor: https://huggingface.co/necropopeost
- Otros modelos del autor: https://huggingface.co/necropopeost/models
- Conversión relacionada del autor (Qwen3.5-4B-mxfp4-MLX): https://huggingface.co/necropopeost/Qwen3.5-4B-mxfp4-MLX
