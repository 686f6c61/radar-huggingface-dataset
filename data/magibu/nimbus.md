# magibu/Nimbus

## Resumen

Nimbus es un tokenizer y processor BPE multimodal desarrollado por Magibu AI Research, un grupo de investigación turco centrado en modelos de lenguaje para el turco y otras lenguas de bajos recursos. No es un modelo de lenguaje completo: no contiene pesos de red neuronal, sino únicamente el vocabulario, las reglas de fusión, la plantilla de chat y los mapeos de IDs necesarios para adaptar el tokenizer del modelo base Qwen/Qwen3.8-27B al vocabulario propio de Magibu (65.536 unidades BPE). El resultado es un tokenizer de 262.144 tokens (incluyendo tokens especiales) diseñado para mejorar la eficiencia de tokenización en turco y lenguas relacionadas, manteniendo compatibilidad con el ecosistema Hugging Face Transformers.

La relevancia actual radica en que la tokenización es un factor crítico para el rendimiento y el coste computacional de los LLM en idiomas distintos del inglés. Nimbus ofrece una vía para adaptar un modelo de 27B parámetros a un vocabulario más adecuado para el turco, habilitando además el entrenamiento de embeddings inicializados desde el modelo fuente. Se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BPE (ByteLevel) con processor multimodal |
| Parametros totales | No aplicable (no contiene pesos de modelo) |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable (depende del modelo base Qwen/Qwen3.8-27B) |
| Tipos de cuantizacion | No aplicable (no contiene pesos) |
| Idiomas soportados | Turco (principal), otros de bajos recursos (segun el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplicable (tokenizer/processor en formato Transformers) |

## Arquitectura y entrenamiento

Nimbus es un tokenizer BPE que integra el vocabulario BPE de 65.536 unidades desarrollado por Magibu AI con la infraestructura tokenizadora del modelo Qwen/Qwen3.8-27B. El proceso de fusión combina ambos vocabularios, limitando el tamaño final a 2^18 (262.144) tokens. Según los datos de la model card, el vocabulario objetivo del tokenizer de Qwen tiene 248.044 tokens, se inyectan 44.670 nuevos tokens procedentes de Magibu, se eliminan 30.603 tokens del objetivo por límites de tamaño, y el vocabulario final queda en 262.111 tokens (más tokens especiales hasta 262.144). Además se añaden 147.768 reglas de fusión procedentes de Magibu y se conservan 198.581 reglas del tokenizer fuente.

El procesador incluye soporte para flujos multimodales (texto, imagen, vídeo, pensamiento y llamada a herramientas) y una plantilla de chat con respuesta por defecto en turco. Se proporciona el archivo `merged-to-original-token-ids.json` que mapea cada ID del tokenizer fusionado con los IDs del tokenizer original, lo que permite inicializar los embeddings de un modelo entrenado con Nimbus a partir de los pesos del modelo Qwen.

## Capacidades

- Tokenización BPE eficiente para turco y lenguas de bajos recursos, con vocabulario ampliado para mejorar la cobertura léxica.
- Procesador compatible con Transformers que soporta plantillas de chat, incluyendo mensajes de usuario y asistente.
- Soporte de multimodalidad a nivel de tokenizer: preparado para flujos de texto, imagen, vídeo y audio (según la documentación del autor).
- Soporte de llamada de herramientas (tool calling) y flujos de razonamiento (thinking) en la estructura del processor.
- Mapeo de IDs tokenizados a IDs originales para permitir la transferencia de embeddings durante el entrenamiento.
- Integración directa con Hugging Face Transformers mediante `AutoProcessor` y `AutoTokenizer`.

## Casos de uso

- Entrenamiento de modelos de lenguaje turcos: usar Nimbus como tokenizer base para entrenar un modelo de 27B o menor, aprovechando la inicialización de embeddings desde Qwen mediante el mapeo de IDs.
- Fine-tuning de Qwen/Qwen3.8-27B para turco: sustituir el tokenizer original por Nimbus para mejorar la eficiencia en turco antes de un entrenamiento de adaptación.
- Evaluación de eficiencia de tokenización: medir la cantidad de tokens necesarios para codificar textos turcos en comparación con el tokenizer original de Qwen.
- Desarrollo de aplicaciones de chat en turco: usar el processor y la plantilla de chat para generar prompts en el formato esperado por el modelo base.
- Inicialización de embeddings en modelos propios: emplear el archivo de mapeo para transferir pesos de embeddings desde Qwen a un modelo con el vocabulario de Nimbus.
- Investigación sobre tokenización en lenguas de bajos recursos: analizar el impacto del vocabulario ampliado en el rendimiento de modelos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de calidad de tokenización (como eficiencia de compresión o cobertura de vocabulario) ni comparaciones con otros tokenizadores.

## Requisitos de hardware

- No aplica: Nimbus no contiene pesos de modelo, por lo que no requiere GPU ni memoria específica para inferencia.
- Para usar el tokenizer y el procesador solo se necesita un entorno Python con la librería Transformers instalada.
- Si se quiere entrenar un modelo con este tokenizer (por ejemplo, usando Qwen3.8-27B como base), los requisitos de hardware serán los del modelo base: se recomienda al menos una GPU con 48-80 GB de VRAM (por ejemplo, A100 o H100) para entrenamiento completo, o configuraciones de fine-tuning con LoRA en GPUs de 24 GB.
- El despliegue de un modelo entrenado con este tokenizer se puede hacer con vLLM, llama.cpp, TGI u Ollama, según el formato de pesos final.

## Comparativa con modelos similares

No disponible. No hay comparación con otros tokenizadores específicos para turco en la información proporcionada. Se puede señalar que el tokenizer de Qwen3.8-27B es el punto de partida y que Nimbus modifica su vocabulario para mejorar la eficiencia en turco.

## Limitaciones y advertencias

- Nimbus es únicamente un tokenizer y procesador; no contiene pesos de modelo, por lo que no se puede usar para generar texto por sí mismo.
- El vocabulario final se ha limitado a 262.144 tokens, lo que puede haber eliminado tokens originales de Qwen (30.603 eliminados), lo que podría afectar a la cobertura de ciertos términos en otros idiomas.
- No se han publicado evaluaciones sobre la eficiencia real de tokenización en turco ni sobre el impacto en el rendimiento de modelos entrenados con él.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la compatibilidad con el modelo base Qwen/Qwen3.8-27B, que también es Apache 2.0, por lo que no hay conflicto.
- El tokenizer está orientado al turco; su uso para otros idiomas de bajos recursos no está validado.
- El proyecto es muy reciente (creado en agosto de 2026) y tiene pocas descargas y un solo like, lo que indica que no ha sido ampliamente probado.

## Enlaces

- [HuggingFace: magibu/Nimbus](https://huggingface.co/magibu/Nimbus)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Web de Magibu AI](https://magibu.ai)
- [Perfil de Hugging Face de magibu](https://huggingface.co/magibu)## Resumen

Nimbus es un tokenizer y procesador BPE desarrollado por Magibu AI Research, un grupo turco centrado en modelos de lenguaje para turco y otras lenguas de bajos recursos. No es un modelo de lenguaje completo: el repositorio no contiene pesos de red neuronal, sino únicamente el vocabulario, las reglas de fusión, la plantilla de chat y los archivos de mapeo de IDs necesarios para adaptar el tokenizer del modelo base Qwen/Qwen3.8-27B a un vocabulario propio de 65.536 unidades BPE. El resultado es un tokenizer de 262.111 tokens (más tokens especiales hasta 262.144) diseñado para mejorar la eficiencia de tokenización en turco y facilitar la transferencia de embeddings desde el modelo fuente.

La relevancia de Nimbus reside en que la tokenización es un factor crítico en el rendimiento y coste de los modelos de lenguaje, especialmente para idiomas distintos del inglés. Al proporcionar un vocabulario adaptado al turco y un mecanismo de mapeo de IDs, permite inicializar embeddings de un modelo entrenado con este tokenizer a partir de los pesos de Qwen. Se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face, aunque con un historial de uso muy limitado (0 descargas, 1 like).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BPE (ByteLevel) con procesador para chat multimodal |
| Parametros totales | No aplicable (no contiene pesos de modelo) |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable (depende del modelo base Qwen/Qwen3.8-27B) |
| Tipos de cuantizacion | No aplicable (no contiene pesos) |
| Idiomas soportados | Turco (tr); otros de bajos recursos según el autor |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (tokenizer en formato Transformers) |

## Arquitectura y entrenamiento

Nimbus es un tokenizer BPE que integra el vocabulario de 65.536 unidades de Magibu con la infraestructura tokenizadora de Qwen/Qwen3.8-27B. El proceso de fusión limita el tamaño final a 2^18 (262.144) tokens. Según la model card, el vocabulario fuente de Qwen tiene 248.044 tokens; se inyectan 44.670 nuevos tokens de Magibu, se eliminan 30.603 tokens del vocabulario objetivo por límite de tamaño, y el vocabulario final queda en 262.111 tokens (más tokens especiales hasta 262.144). Se añaden 147.768 reglas de fusión de Magibu y se conservan 198.581 reglas del tokenizer fuente.

El procesador incluye soporte para flujos de chat con texto, imagen, vídeo, razonamiento (thinking) y llamada de herramientas, con una plantilla de chat que establece el turco como idioma de respuesta por defecto. Se proporciona el archivo `merged-to-original-token-ids.json` que mapea cada ID del tokenizer fusionado con uno o más IDs del tokenizer original, lo que permite inicializar los embeddings de un nuevo modelo a partir de los pesos de Qwen durante el entrenamiento.

## Capacidades

- Tokenización BPE eficiente para turco y variantes de bajos recursos, con vocabulario ampliado para mejorar la cobertura léxica.
- Procesador compatible con Transformers que aplica plantillas de chat para mensajes de usuario y asistente.
- Soporte de multimodalidad a nivel de tokenizer: preparado para flujos de texto, imagen, vídeo y análisis de razonamiento.
- Soporte de llamada de herramientas (tool calling) y modo de razonamiento en la estructura de plantilla.
- Mapeo de IDs de tokens fusionados a IDs originales para la transferencia de embeddings.
- Integración directa con Hugging Face Transformers mediante `AutoProcessor` y `AutoTokenizer`.

## Casos de uso

- Entrenamiento de un modelo de lenguaje turco desde cero: usar Nimbus como tokenizer para entrenar un modelo de 27B o menor, inicializando los embeddings desde Qwen mediante el mapeo de IDs.
- Fine-tuning de Qwen/Qwen3.8-27B para turco: sustituir el tokenizer original por Nimbus y adaptar el modelo a dominios específicos (médico, legal, atención al cliente).
- Evaluación de eficiencia de tokenización: comparar la cantidad de tokens necesarios para codificar textos turcos frente al tokenizer original de Qwen.
- Desarrollo de chatbots en turco: usar el procesador y la plantilla de chat para generar respuestas en el formato esperado por el modelo base.
- Inicialización de pesos en modelos de dominio: emplear el archivo de mapeo para transferir embeddings desde Qwen a un modelo con el vocabulario de Nimbus.
- Investigación en tokenización de lenguas de bajos recursos: analizar el impacto del vocabulario ampliado en la calidad de representación de idiomas distintos del inglés.
- Integración en pipelines de generación de código o herramientas: la estructura de llamada de herramientas permite conectar el modelo con APIs externas en aplicaciones de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad de tokenización (como eficiencia de compresión, cobertura de vocabulario o comparaciones con otros tokenizadores).

## Requisitos de hardware

- No aplica para el tokenizer en sí: Nimbus no contiene pesos, por lo que no requiere hardware específico para su uso como tokenizer.
- Para ejecutar el tokenizer solo se necesita un entorno con Python y la librería Transformers de Hugging Face.
- Si se quiere entrenar un modelo con este tokenizer (por ejemplo, una versión adaptada de Qwen3.8-27B), se necesitarán recursos del modelo base: al menos 40 GB de VRAM para fine-tuning con LoRA en una GPU como A100 o H100, o más para entrenamiento completo.
- El despliegue de un modelo entrenado con este tokenizer se puede realizar con vLLM, llama.cpp, TGI u Ollama, según el formato de cuantización elegido.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros tokenizadores para turco en la información proporcionada. Se puede comparar indirectamente con el tokenizer original de Qwen (248.044 tokens) y con otros tokenizadores multilingües como el de Llama 3 (128.256 tokens) o el de Mistral (32.000 tokens), pero no hay datos de rendimiento que permitan una evaluación objetiva.

## Limitaciones y advertencias

- Nimbus es únicamente un tokenizer y procesador; no contiene pesos de modelo, por lo que no puede generar texto por sí mismo.
- El vocabulario final se ha reducido eliminando 30.603 tokens del tokenizer original de Qwen, lo que puede afectar a la cobertura de términos en otros idiomas (especialmente inglés o lenguas con caracteres especiales).
- No se han publicado evaluaciones de calidad de tokenización (por ejemplo, tasa de compresión, exactitud en textos turcos) ni comparaciones con otros tokenizer.
- El proyecto es muy reciente (creado en agosto de 2026) y tiene muy pocas descargas y un solo like, lo que indica una adopción muy limitada y una validación insuficiente.
- La licencia Apache 2.0 permite uso comercial, pero hay que verificar la compatibilidad con el modelo base Qwen (también Apache 2.0) y con cualquier otro componente externo.
- La plantilla de chat y el procesador están diseñados para turco; su uso en otros idiomas no está documentado ni validado.

## Enlaces

- [Hugging Face: magibu/Nimbus](https://huggingface.co/magibu/Nimbus)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Web de Magibu AI](https://magibu.ai)
- [Perfil de Hugging Face de magibu](https://huggingface.co/magibu)
