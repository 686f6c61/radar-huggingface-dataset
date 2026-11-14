# labadain/Labadain-Gemma-4-E2B-it-Tetun

## Resumen

Labadain-Gemma-4-E2B-it-Tetun es un ajuste fino del modelo Gemma 4 (variante E2B-it) de Google, desarrollado por la iniciativa Labadain para dotar al tetun (tetun-dili) de capacidades conversacionales en un modelo de lenguaje de gran tamano. El tetun es la lengua oficial de Timor-Leste y cuenta con recursos digitales muy limitados, por lo que este modelo se enmarca en el esfuerzo por reducir la brecha de acceso a la IA en entornos de bajos recursos linguisticos. El modelo parte de `unsloth/gemma-4-E2B-it` y se ha entrenado mediante QLoRA sobre 32.197 conversaciones multi-turno compiladas de dominios como noticias, salud, educacion y conversacion general.

El resultado es un modelo multimodal (image-text-to-text) de 5.123.178.051 parametros totales, con pesos en formato safetensors y un repositorio de 10,3 GB. La ficha tecnica del autor indica que se distribuye tambien en version GGUF (Q4_K_M) y a traves de Ollama, lo que facilita su despliegue en entornos locales y con CPU. El modelo conserva el modo de razonamiento (thinking mode) de Gemma 4, que puede activarse o desactivarse mediante la plantilla de chat.

La relevancia actual del modelo radica en que cubre una lengua con practicamente nula representacion en los grandes modelos comerciales, y lo hace sobre una arquitectura reciente y ampliamente soportada por el ecosistema transformers. No obstante, el propio autor advierte de que el modelo aun no ha sido evaluado en aplicaciones downstream, por lo que su uso en produccion debe acompanarse de validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), variante E2B-it |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `max_seq_length=4096`) |
| Tipos de cuantizacion | QLoRA en entrenamiento; GGUF Q4_K_M publicado; carga en 4 bits via Unsloth |
| Idiomas soportados | tet (tetun), tdt (tetun-dili) |
| Licencia | gemma (Gemma 4 License) |
| Formato de pesos | safetensors (modelo fusionado); GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo se basa en Gemma 4, la familia de transformers multimodales de Google, en su variante E2B-it (la variante instruct). El ajuste se realizo con QLoRA, es decir, adaptadores de bajo rango entrenados sobre el modelo base cuantizado en 4 bits, y posteriormente los adaptadores se fusionaron en los pesos del modelo base para producir el repositorio final en safetensors. El modelo conserva la capacidad image-text-to-text del modelo original, aunque la model card no detalla el uso de datos visuales en el ajuste.

El conjunto de entrenamiento final consta de 32.197 conversaciones multi-turno: 1.951 de articulos de noticias, 9.649 de salud (QA y multi-turno), 465 de educacion y lengua, y 20.132 de conversacion general. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales. La innovacion tecnica destacable es la incorporacion del modo de razonamiento (thinking mode) heredado de Gemma 4, que puede desactivarse mediante `enable_thinking=False` en la plantilla de chat.

## Capacidades

- Generacion de texto conversacional en tetun, con respuestas contextualmente relevantes en dominios de conocimiento general, noticias, conversacion cotidiana y salud.
- Razonamiento explicito mediante thinking mode, activable o desactivable en la plantilla de chat.
- Procesamiento image-text-to-text, heredado del modelo base Gemma 4 (no se detalla su rendimiento en tetun).
- Conversacion multi-turno, con soporte de plantilla de chat y roles de usuario/asistente.
- Generacion de texto condicionada por contexto de hasta 4096 tokens en el ejemplo oficial de uso.
- Capacidades multilingues limitadas al tetun y tetun-dili segun la model card; no se documenta soporte de otros idiomas.
- No se documenta soporte explicito de tool calling, function calling ni comportamiento agentico multi-paso.

## Casos de uso

- Atencion al cliente en tetun: el modelo puede gestionar conversaciones multi-turno en tetun para consultas frecuentes, con la ventaja de que el usuario final no necesita expresarse en ingles o portugues. Requiere validacion previa por la falta de evaluacion downstream.
- Divulgacion sanitaria en Timor-Leste: el 30 % del dataset de entrenamiento (9.649 ejemplos) procede de salud, lo que lo hace adecuado para asistentes de informacion sanitaria basica en tetun, siempre con supervision humana.
- Educacion y alfabetizacion digital: el modelo puede generar material didactico y respuestas explicativas en tetun para escuelas y programas de formacion, aprovechando los 465 ejemplos de educacion y lengua del dataset.
- Investigacion en PLN de bajos recursos: sirve como linea base para experimentos de evaluacion, comparacion y mejora de modelos en lenguas con pocos datos, dado que es uno de los pocos ajustes publicos de Gemma 4 en tetun.
- Prototipado de asistentes conversacionales locales: gracias a la version GGUF Q4_K_M y a Ollama, puede desplegarse en portatiles o servidores modestos para demos y prototipos sin GPU dedicada.
- Resumen y reescritura de noticias en tetun: los 1.951 ejemplos de noticias permiten usar el modelo para tareas de sintesis o reformulacion de textos periodisticos, con revision editorial posterior.
- Generacion de contenido para medios digitales de Timor-Leste: redaccion asistida de borradores en tetun para blogs, boletines o redes sociales, reduciendo la dependencia de traducciones manuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no ha sido evaluado en aplicaciones downstream.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 10-11 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere GPU de 16 GB o superior.
- VRAM estimada con cuantizacion de 4 bits (QLoRA/4-bit): en torno a 3-4 GB para pesos, viables en GPU de 8 GB.
- GGUF Q4_K_M: tamano de fichero del orden de 3-4 GB, apto para inferencia en CPU y en GPUs consumer con 6-8 GB de VRAM.
- GPU recomendadas: A100 o H100 para inferencia en precision completa y alto throughput; RTX 4090 (24 GB) para bf16; RTX 3060/4060 (8-12 GB) para 4 bits o GGUF.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas usando cuantizacion de 4 bits o GGUF Q4_K_M.
- Opciones de despliegue: transformers (con Unsloth `FastModel`), llama.cpp mediante GGUF, Ollama (`labadainofficial/labadain-gemma4:e3b-q4km`), y potencialmente vLLM/TGI si el soporte de Gemma 4 esta disponible en esas herramientas (no confirmado en la informacion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Labadain-Gemma-4-E2B-it-Tetun | 5.123 M | no disponible (ejemplo a 4096) | tet, tdt | gemma | safetensors, GGUF |
| unsloth/gemma-4-E2B-it (base) | no disponible | no disponible | multilingue (no detallado) | gemma | safetensors |
| Gemma 4 E2B-it (Google) | no disponible | no disponible | multilingue (no detallado) | gemma | safetensors |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no ha sido evaluado en aplicaciones downstream; no hay garantias de calidad en produccion.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por el limitado volumen de datos en tetun y la escasa cobertura de dominios especializados.
- Sesgos potenciales derivados de las fuentes del dataset (noticias, salud, conversacion general) y de la sobrerrepresentacion del dominio de conversacion general (20.132 de 32.197 ejemplos).
- Cobertura linguistica restringida a tetun y tetun-dili; no se documenta soporte fiable de otros idiomas.
- Longitud de contexto no especificada en la model card; el ejemplo oficial usa 4096 tokens, por lo que contextos mas largos no estan garantizados.
- La licencia Gemma 4 impone terminos de uso y redistribucion que deben respetarse; es responsabilidad del usuario revisar la Gemma 4 License antes de un uso comercial.
- No se documenta soporte de tool calling ni de comportamiento agentico, lo que limita su integracion en pipelines automatizados complejos.
- El modo de razonamiento (thinking) puede incrementar la latencia y el consumo de tokens si no se desactiva adecuadamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/labadain/Labadain-Gemma-4-E2B-it-Tetun
- Version GGUF: https://huggingface.co/labadain/Labadain-Gemma-4-E2B-it-Tetun-GGUF
- Version Ollama: https://ollama.com/labadainofficial/labadain-gemma4
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Labadain Chat: https://www.labadain.com
- Labadain Search: https://search.labadain.com
