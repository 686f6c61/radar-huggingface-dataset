# Kamyar-zeinalipour/protein-tokenizer-llama2

## Resumen

`protein-tokenizer-llama2` es un tokenizador derivado del tokenizador de Llama-2-7B, adaptado específicamente a secuencias de aminoácidos para el entrenamiento y la inferencia de P-Llama2-7B, un modelo de lenguaje orientado al diseño de proteínas. Lo desarrolla Kamyar Zeinalipour y colaboradores en el marco del trabajo presentado en el workshop LangMol 2024 (ACL), y su función es convertir secuencias de proteínas humanas en tokens que un transformer basado en Llama-2 pueda procesar de forma eficiente.

El vocabulario resultante consta de 32.000 tokens y se entrenó sobre el conjunto de datos UniRef50-HumanProteins. Las secuencias se delimitan con los tokens especiales `<s>` al inicio y `</s>` al final, de modo que el modelo puede aprender la estructura completa de la proteína, incluyendo los marcadores de frontera. Se trata de un componente auxiliar: no es un modelo generativo por sí mismo, sino la pieza de tokenización necesaria para reproducir los resultados de P-Llama2-7B.

Su relevancia actual radica en que ejemplifica la transferencia de infraestructura de los LLM generalistas al dominio biológico: reutiliza la arquitectura y el ecosistema de Llama-2 (transformers, safetensors, pipeline de Hugging Face) para una tarea de generación de proteínas, lo que facilita la integración con herramientas estándar de despliegue y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE derivado de Llama-2-7B, adaptado a secuencias de aminoácidos |
| Parametros totales | no disponible (es un tokenizador, no un modelo con pesos) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (heredada del modelo P-Llama2-7B, no especificada en la informacion) |
| Tipos de cuantizacion | no aplica al tokenizador (el modelo asociado admite las de transformers) |
| Idiomas soportados | no disponible (dominio: secuencias de proteínas) |
| Licencia | llama2 |
| Formato de pesos | ficheros de tokenizador de transformers (tokenizer.json, tokenizer_config.json, special_tokens_map.json); no disponible el listado exacto |
| Tamano del vocabulario | 32.000 tokens |
| Tokens especiales | `<s>` (inicio de secuencia), `</s>` (fin de secuencia) |
| Dataset de entrenamiento | Kamyar-zeinalipour/UniRef50-HumanProteins |
| Libreria | transformers |

## Arquitectura y entrenamiento

El tokenizador parte del vocabulario de Llama-2-7B y se reajusta para operar sobre el alfabeto de aminoácidos en lugar de texto natural. El resultado es un vocabulario de 32.000 tokens que codifica secuencias proteicas, con tokens de control `<s>` y `</s>` para marcar los límites de cada secuencia. El ajuste se realizó sobre UniRef50-HumanProteins, un subconjunto de proteínas humanas de UniRef50, lo que orienta la distribución de tokens hacia los patrones de composición de aminoácidos presentes en proteínas humanas.

El modelo asociado, P-Llama2-7B, se entrena con este tokenizador siguiendo el paradigma de modelado de lenguaje causal (predicción del siguiente token) sobre secuencias de proteínas. El trabajo de LangMol 2024 compara esta aproximación con adaptaciones equivalentes sobre Mistral-7B, Llama-3-8B y Gemma-7B, evaluando la capacidad de generar secuencias proteicas válidas. No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron etapas de ajuste fino con RLHF o DPO.

## Capacidades

- Tokenización de secuencias de proteínas humanas en un vocabulario de 32.000 tokens compatible con el ecosistema transformers.
- Delimitación explícita de secuencias mediante `<s>` y `</s>`, lo que permite al modelo aprender fronteras de proteína.
- Integración directa con `AutoTokenizer` y `AutoModelForCausalLM` de Hugging Face, junto con el modelo P-Llama2-7B.
- Soporte para generación de secuencias proteicas cuando se usa junto con P-Llama2-7B y el script de generación del repositorio.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible` en los tags del repositorio).
- No dispone de capacidades de texto general, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso: su ámbito es exclusivamente biológico-secuencial.

## Casos de uso

- Diseño de proteínas de novo: combinado con P-Llama2-7B, el tokenizador permite generar secuencias candidatas que luego se filtran por validez estructural y bioquímica en pipelines de diseño computacional.
- Reproducción de experimentos académicos: investigadores que quieran replicar los resultados del paper de LangMol 2024 pueden cargar este tokenizador y el modelo asociado para regenerar las secuencias reportadas.
- Ajuste fino sobre subconjuntos proteicos específicos: al estar integrado en transformers, sirve como base para reentrenar P-Llama2-7B sobre familias de proteínas concretas (por ejemplo, enzimas o anticuerpos) manteniendo el mismo esquema de tokenización.
- Análisis de distribuciones de aminoácidos: el vocabulario adaptado permite estudiar cómo se segmentan las secuencias humanas y comparar la tokenización con la de tokenizadores genéricos.
- Integración en pipelines de bioinformática: al ser compatible con la API de transformers, se puede encadenar con herramientas de anotación funcional o de predicción estructural para evaluar las secuencias generadas.
- Docencia y divulgación: sirve como ejemplo didáctico de adaptación de un tokenizador de LLM a un dominio científico con un vocabulario y unos tokens de control propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (LangMol 2024) evalúa la generación de proteínas de P-Llama2-7B y modelos comparables, pero los valores numéricos concretos no se incluyen en la información proporcionada.

## Requisitos de hardware

- El tokenizador en sí es un componente ligero (ficheros JSON de vocabulario) y no requiere GPU; se ejecuta en CPU con memoria despreciable.
- Los requisitos de hardware relevantes corresponden al modelo P-Llama2-7B: al tratarse de un transformer de 7.000 millones de parámetros, la inferencia en FP16 requiere aproximadamente 14 GB de VRAM, y en cuantización de 8 bits alrededor de 7-8 GB.
- GPU recomendadas para P-Llama2-7B: A100 (40/80 GB) o H100 para despliegues de producción y lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en FP16 de una sola instancia.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en FP16, y en tarjetas de 8-12 GB si se aplica cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (vía `AutoTokenizer` y `AutoModelForCausalLM`), y el script `main.py` del repositorio protein-design-LLMs para generación; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Vocabulario | Modelo asociado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| protein-tokenizer-llama2 (este) | Tokenizador de proteínas | 32.000 tokens | P-Llama2-7B (7B) | llama2 | Hugging Face |
| Tokenizador de P-Mistral-7B | Tokenizador de proteínas | no disponible | P-Mistral-7B (7B) | no disponible | Hugging Face |
| Tokenizador de P-Llama3-8B | Tokenizador de proteínas | no disponible | P-Llama3-8B (8B) | no disponible | Hugging Face |
| Tokenizador de P-gemma-7B | Tokenizador de proteínas | no disponible | P-gemma-7B (7B) | no disponible | Hugging Face |

Los cuatro tokenizadores pertenecen a la misma línea de trabajo del autor y se comparan en el paper de LangMol 2024. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es un tokenizador, no un modelo generativo: por sí solo no produce secuencias; requiere cargar P-Llama2-7B o un modelo compatible.
- El vocabulario está sesgado hacia proteínas humanas de UniRef50, por lo que su cobertura puede ser subóptima para proteínas de otros organismos o para secuencias muy atípicas.
- No se especifican los idiomas ni dominios de texto soportados; no debe emplearse para tareas de lenguaje natural.
- Licencia `llama2`: impone restricciones de uso comercial y obligaciones de atribución; el autor indica explícitamente que está pensado para investigación.
- Riesgo de generar secuencias proteicas no viables o no funcionales: la validez sintáctica de la secuencia no garantiza viabilidad estructural ni actividad biológica; se requiere validación experimental.
- El repositorio registra 0 descargas y 0 likes, y la fecha de actualización es posterior a la de creación; conviene verificar la integridad y vigencia de los ficheros antes de usarlo en producción.
- No se documentan sesgos, tasas de alucinación ni límites de contexto concretos en la información disponible.

## Enlaces

- Repositorio Hugging Face del tokenizador: https://huggingface.co/Kamyar-zeinalipour/protein-tokenizer-llama2
- Modelo asociado P-Llama2-7B: https://huggingface.co/Kamyar-zeinalipour/P-Llama2-7B
- Dataset UniRef50-HumanProteins: https://huggingface.co/datasets/Kamyar-zeinalipour/UniRef50-HumanProteins
- Paper (LangMol 2024, ACL): https://aclanthology.org/2024.langmol-1.5/
- DOI del paper: https://doi.org/10.18653/v1/2024.langmol-1.5
- Repositorio de código: https://github.com/KamyarZeinalipour/protein-design-LLMs
- Colección de Hugging Face: https://huggingface.co/collections/Kamyar-zeinalipour/design-proteins-using-llms-langmol-2024-6af48a0e6814a362675e4dc6
- Modelo P-Mistral-7B: https://huggingface.co/Kamyar-zeinalipour/P-Mistral-7B
- Modelo P-Llama3-8B: https://huggingface.co/Kamyar-zeinalipour/P-Llama3-8B
- Modelo P-gemma-7B: https://huggingface.co/Kamyar-zeinalipour/P-gemma-7B
