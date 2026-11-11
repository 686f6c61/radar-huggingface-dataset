# huggingface-mic/smolvlm-mic

## Resumen

`smolvlm-mic` es un artefacto de prueba publicado por el usuario `huggingface-mic` bajo el identificador `huggingface-mic/smolvlm-mic`. No es un modelo utilizable: se trata de un fixture ("slim fixture" denominado `mic-smolvlm-slim`) construido para verificar el comportamiento de frameworks de inferencia frente a la arquitectura de `HuggingFaceTB/SmolVLM2-2.2B-Instruct`. El propio autor lo etiqueta como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

El repositorio contiene únicamente 6.578.368 parámetros (6,6 M) frente a los aproximadamente 2.200 millones del modelo base, fruto de aplicar una regla genérica de reducción (`sweep.py`) que recorta las capas ocultas de visión y de texto a 2. Los pesos son aleatorios (semilla 17) y no han sido entrenados; solo pasaron una compuerta de sensibilidad a la entrada que exigía que cada perturbación de las entradas del contrato moviera los logits al menos 0,001.

Su relevancia no es funcional sino de ingeniería: permite a desarrolladores de frameworks validar contratos de integración (procesador, tokenizador, plantilla de chat, nombres de tensores, dtypes) sin descargar el checkpoint completo de 2,2 B. Incluye un manifiesto de contrato (`integration.json`), documentación de uso con Transformers y un directorio de expectativas del framework.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLMForConditionalGeneration (vision-language, transformer multimodal) |
| Parametros totales | 6.578.368 (fixture reducido; el base real tiene ~2,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura declarada es `SmolVLMForConditionalGeneration`, la misma clase que emplea `HuggingFaceTB/SmolVLM2-2.2B-Instruct`, un modelo visión-lenguaje que combina un codificador visual con un decodificador de texto. En este fixture se ha aplicado la regla genérica de reducción de `sweep.py`: `vision num_hidden_layers = 2` y `text num_hidden_layers = 2`. Los nombres de los tensores coinciden con los del checkpoint real, de modo que el fixture expone la misma interfaz de parámetros aunque con dimensiones recortadas.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una compuerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato debía desplazar los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, alcanzó 0,00274). Los ficheros de procesador (`added_tokens.json`, `chat_template.json`, `generation_config.json`, `merges.txt`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde el modelo base. Los pesos se guardaron en float32 y se verificó que la forward, la loss y los gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No es un modelo funcional: al tener pesos aleatorios, no genera texto ni respuestas coherentes.
- Sirve como fixture de conformidad para validar la carga de `SmolVLMForConditionalGeneration` en frameworks (nombres de tensores, shapes recortadas, dtypes).
- Verifica el pipeline de preprocesado multimodal: tokenizador, plantilla de chat y configuración del procesador copiados del modelo base real.
- Permite comprobar la estabilidad numérica (finitud de forward, loss y gradientes) en float32, bfloat16 y float16.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües reales, al carecer de entrenamiento.
- No dispone de modo thinking, visión efectiva ni audio: la arquitectura los contempla, pero los pesos no los implementan.

## Casos de uso

- Pruebas de integración en frameworks de inferencia: cargar el fixture con Transformers y comprobar que la clase `SmolVLMForConditionalGeneration` se instancia con los nombres de tensores esperados, sin descargar el checkpoint de 2,2 B.
- Validación de contratos de CI/CD: usar `integration.json` y el directorio `integrations/transformers/expectations` como referencia en tests automatizados que detecten regresiones en el manejo de modelos visión-lenguaje.
- Verificación de pipelines de tokenización y chat template: al copiarse los ficheros del procesador byte a byte, permite probar el preprocesado exacto del modelo base en entornos ligeros.
- Comprobación de estabilidad numérica por dtype: ejecutar forward, loss y backward en float32, bfloat16 y float16 para asegurar que un framework no produce NaN ni infinitos con esta arquitectura.
- Desarrollo de herramientas de reducción de checkpoints: el repositorio documenta el proceso de "shrink" y sirve de ejemplo reproducible para construir fixtures propios con `build_fixtures.py`.
- Pruebas de sensibilidad a entradas: replicar la compuerta que exige que cada perturbación de las entradas mueva los logits al menos 0,001, útil para validar harness de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad sería carente de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 6,6 M de parámetros del fixture; el modelo base real de 2,2 B requeriría varios GB según cuantización (dato no disponible en la información proporcionada).
- GPU recomendadas: cualquier GPU consumer moderna basta para el fixture; no se especifican requisitos para el modelo base.
- Cabe en cualquier GPU consumer e incluso en CPU, dado el tamaño reducido del fixture.
- Opciones de despliegue: Transformers (documentado en `integrations/transformers/usage.md`); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/smolvlm-mic` (este) | 6,6 M (fixture) | no disponible | Artefacto de prueba | no disponible | Hugging Face |
| `HuggingFaceTB/SmolVLM2-2.2B-Instruct` | ~2,2 B | no disponible | Modelo visión-lenguaje real | no disponible en la información | Hugging Face |
| Otros fixtures `huggingface-mic` | variable | no disponible | Artefactos de prueba | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- El autor lo etiqueta explícitamente como `test-artifact`; no debe emplearse en producción ni incluirse en evaluaciones de calidad.
- La licencia no está declarada, lo que impide determinar condiciones de uso comercial.
- El tamaño de 6,6 M no refleja el del modelo base (2,2 B); las conclusiones sobre rendimiento o memoria no son extrapolables.
- Los ficheros del procesador se copiaron del modelo base, pero el resto de configuración está reducido, por lo que algunas rutas de código pueden comportarse de forma distinta al checkpoint real.
- No hay información sobre sesgos, alucinación o cobertura idiomática, al no existir entrenamiento.
- El repositorio ocupa 0,0 GB según los metadatos, pero el autor indica que solo incluye los pesos reducidos, el uso y las expectativas; otros ficheros deben regenerarse con `build_fixtures.py`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/smolvlm-mic
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/smolvlm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/smolvlm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/smolvlm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/smolvlm-mic/blob/main/build.json
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/smolvlm-mic.html
- Script de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
