# huggingface-mic/llava-v1.6-mistral-7b-hf-mic

## Resumen

`llava-v1.6-mistral-7b-hf-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo usable para inferencia real: se trata de una version "reducida" (slim fixture) del checkpoint multimodal `llava-hf/llava-v1.6-mistral-7b-hf`, con la misma arquitectura y los mismos nombres de tensores, pero con una configuracion encogida (2 capas en el codificador visual y 2 capas en el modelo de lenguaje) y pesos aleatorios con semilla 17. Su proposito es servir como fixture de integracion continua para validar contratos de frameworks (en concreto, la integracion con Transformers) sin necesidad de descargar el modelo completo de 7B.

El modelo base real, LLaVA-Next v1.6 Mistral-7B, es un modelo vision-lenguaje que combina el codificador visual de CLIP con el modelo de lenguaje Mistral-7B y un proyector multimodal, orientado a tareas de pregunta-respuesta sobre imagenes y razonamiento visual. Este repositorio, sin embargo, no contiene esos pesos funcionales: solo un esqueleto de 4.328.448 parametros con pesos aleatorios.

Por tanto, esta ficha documenta el artefacto tal y como existe en Hugging Face, aclarando en cada seccion que los datos de rendimiento, capacidades y uso practico corresponden al modelo base de referencia y no al fixture, que no debe emplearse en produccion ni en evaluaciones de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlavaNextForConditionalGeneration (transformer multimodal vision-lenguaje) |
| Parametros totales | 4.328.448 (fixture reducido); el modelo base real es de aproximadamente 7B, aunque el dato exacto no esta disponible en la informacion proporcionada |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo base `llava-hf/llava-v1.6-mistral-7b-hf` corresponde a LLaVA-Next v1.6 con Mistral-7B como modelo de lenguaje. La arquitectura es un transformer multimodal que combina un codificador visual (basado en CLIP, segun la convencion de LLaVA-Next) con un proyector que mapea las representaciones visuales al espacio de embeddings del LLM, y el decoder de Mistral-7B para generar texto. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El repositorio documentado aqui es un fixture de integracion, no un modelo entrenado. Segun la model card, se genero mediante la regla generica de `sweep.py` del proyecto `transformers-mic`, reduciendo el numero de capas ocultas del codificador visual a 2 y del modelo de texto a 2. Los pesos son aleatorios (semilla 17) y no se entreno nada: se valido unicamente que el modelo pasara una compuerta de sensibilidad a las entradas, es decir, que cada perturbacion de las entradas del contrato moviera los logits al menos 0.001 (la perturbacion mas debil, `pixel_values:halve`, produjo 0.0442). Los ficheros de procesador (tokenizer, preprocessor, generation config, chat template) se copiaron byte a byte desde el checkpoint real, y los nombres de tensores coinciden con los del checkpoint original. El fixture es finito en float32, bfloat16 y float16 (forward, loss y gradientes).

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas con sentido.
- Sirve como fixture de pruebas para validar la carga, el forward, la loss y los gradientes de la clase `LlavaNextForConditionalGeneration` en Transformers.
- Permite comprobar la compatibilidad de ficheros de procesador (tokenizer, preprocessor, chat template) copiados del modelo real.
- Valida contratos de integracion definidos en `integration.json` y el directorio `integrations/transformers/expectations`.
- No dispone de capacidades reales de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni multilingues, al no tratarse de un modelo entrenado.

## Casos de uso

- Pruebas de integracion continua en el proyecto `transformers-mic`: el fixture permite ejecutar tests de la arquitectura LLaVA-Next en pipelines de CI sin descargar el checkpoint de 7B, reduciendo tiempo y ancho de banda.
- Validacion de contratos de framework: los ficheros `integration.json` e `integrations/transformers/expectations` permiten verificar que la implementacion de Transformers cumple las expectativas de entrada y salida del modelo.
- Pruebas de compatibilidad de procesadores: al copiar byte a byte tokenizer, preprocessor y chat template del modelo real, se puede comprobar que el pipeline de preprocesado funciona sin necesidad de los pesos completos.
- Verificacion de tipos y dtypes: el fixture es finito en float32, bfloat16 y float16, por lo que sirve para testear rutas de ejecucion en distintas precisiones.
- Desarrollo de utilidades de carga de modelos: permite probar cargadores, sharding y serializacion safetensors con un repositorio minimo.
- Reproducibilidad de builds: `build.json` registra fuentes fijadas, resultados de la compuerta y hashes de ficheros, util para auditar que el fixture corresponde al checkpoint real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El fixture no es evaluable: sus pesos son aleatorios y su configuracion esta reducida, por lo que cualquier metrica de calidad carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el fixture en float16 (4,3M parametros); el modelo base real de 7B requeriria aproximadamente 14 GB en float16, aunque este dato no se confirma en la informacion proporcionada.
- GPU recomendadas: cualquier GPU consumer moderna puede ejecutar el fixture; para el modelo base real se necesitarian GPUs con al menos 16-24 GB de VRAM (por ejemplo, RTX 4090, A100, H100), si bien esta estimacion no procede de la informacion disponible.
- Cabe en cualquier GPU consumer (incluso integradas) por el tamano reducido del fixture.
- Opciones de despliegue: Transformers (integracion documentada en `integrations/transformers/usage.md`); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/llava-v1.6-mistral-7b-hf-mic` | 4.328.448 (fixture) | no disponible | Fixture de test | no disponible | Hugging Face |
| `llava-hf/llava-v1.6-mistral-7b-hf` | ~7B (dato no confirmado en la informacion) | no disponible | Modelo vision-lenguaje real | no disponible | Hugging Face |
| Otros modelos LLaVA-Next de la familia | no disponible | no disponible | Vision-lenguaje | no disponible | Hugging Face |

La comparativa con alternativas de la misma categoria (modelos vision-lenguaje de ~7B) no puede completarse con los datos proporcionados; se indica "no disponible" en los campos que no constan.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas no tienen sentido. Esta etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos.
- Riesgo de confusion: el nombre incluye "mistral-7b" y "llava-v1.6", lo que puede llevar a error si se usa sin leer la model card.
- La licencia no esta disponible en la informacion proporcionada; no debe asumirse uso comercial sin verificar la del modelo base `llava-hf/llava-v1.6-mistral-7b-hf`.
- La configuracion reducida (2 capas visuales, 2 capas de texto) impide cualquier evaluacion de calidad, sesgos o alucinacion.
- No hay informacion sobre idiomas soportados ni sobre limitaciones de contexto.
- El repositorio ocupa 0.0 GB segun los metadatos, coherente con un fixture minimo, pero no debe interpretarse como un modelo listo para produccion.
- Cualquier uso en produccion, demo o evaluacion debe hacerse con el checkpoint base real, no con este artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/llava-v1.6-mistral-7b-hf-mic
- Modelo base: https://huggingface.co/llava-hf/llava-v1.6-mistral-7b-hf
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/llava-v1.6-mistral-7b-hf-mic/blob/main/integration.json
- Uso con Transformers (`integrations/transformers/usage.md`): https://huggingface.co/huggingface-mic/llava-v1.6-mistral-7b-hf-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers (`integrations/transformers/expectations`): https://huggingface.co/huggingface-mic/llava-v1.6-mistral-7b-hf-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/llava-v1.6-mistral-7b-hf-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/llava-v1.6-mistral-7b-hf-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
