# OceanLabs/Ocean-Coder-7B-Fusion

## Resumen

Ocean-Coder-7B-Fusion es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) desarrollado por OceanLabs, obtenido mediante una fusión de pesos SLERP (spherical linear interpolation) de dos modelos de la familia Qwen2.5: Qwen2.5-Coder-7B-Instruct (modelo primario) y Qwen2.5-7B-Instruct. No se realizó ningún entrenamiento ni ajuste fino: es exclusivamente una interpolación tensor a tensor de los pesos de ambos modelos base, que comparten la misma arquitectura Qwen2 (28 capas, hidden size 3584, vocabulario de 152064 tokens, rope_theta 1e6).

El objetivo declarado es conservar la capacidad de generación de código del modelo Coder e incorporar parte de la capacidad de seguimiento de instrucciones generales y de manejo lingüístico del modelo Instruct. La fusión se calculó en float32 por tensor y se convirtió de nuevo a bfloat16, con una configuración de coeficientes `t` que varía linealmente por capa y por tipo de tensor (atención y MLP con rampas opuestas, layernorms a 0,3 y embeddings/lm_head/norm final a 0,2).

Es relevante ahora como ejemplo de técnica de merging accesible: permite explorar la combinación de especialización en código con capacidades generales sin coste de entrenamiento, y sirve como punto de partida para evaluación o fine-tuning posterior. El autor advierte explícitamente de que el modelo no ha sido evaluado con benchmarks, por lo que cualquier afirmación sobre su calidad debe considerarse no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Qwen2 (28 capas, hidden size 3584, 152064 tokens de vocabulario, rope_theta 1e6) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los modelos base Qwen2.5 soportan contexto largo, pero el dato no se confirma en la model card) |
| Tipos de cuantizacion | no disponible en la model card; pesos publicados en bfloat16 |
| Idiomas soportados | de, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura Qwen2, idéntica a la de sus dos modelos base: 28 capas, dimensión oculta de 3584, vocabulario de 152064 tokens y rope_theta de 1e6. Al compartir arquitectura exacta, los pesos de ambos modelos pueden interpolarse tensor a tensor.

No hubo entrenamiento ni ajuste fino. La fusión se realizó con SLERP (interpolación lineal esférica) calculada por tensor en float32 y convertida de nuevo a bfloat16, mediante un script NumPy independiente que implementa la misma fórmula que mergekit (no se usó mergekit directamente). Los coeficientes `t` (peso hacia Qwen2.5-7B-Instruct, donde `t = 0` corresponde al Coder puro) se asignaron así: tensores `self_attn.*` con rampa lineal de 0,0 (capa 0) a 0,5 (capa 27); tensores `mlp.*` con rampa inversa de 0,5 (capa 0) a 0,0 (capa 27); layernorms y otros tensores de capa a 0,3; y `embed_tokens`, `lm_head` y `model.norm` a 0,2. Cuando dos tensores son casi colineales (|cos| > 0,9995) se usa interpolación lineal simple en lugar de SLERP. Los ficheros `config.json` y de tokenizer se mantienen sin cambios respecto a Qwen2.5-Coder-7B-Instruct; `generation_config.json` y la plantilla de chat (ChatML de Qwen con system prompt propio de OceanLabs) son aportaciones de OceanLabs.

## Capacidades

- Generación de código: escritura, depuración, refactorización y explicación de código, heredada del modelo Coder primario.
- Seguimiento de instrucciones generales y conversación multi-turno, incorporado desde Qwen2.5-7B-Instruct mediante la fusión.
- Generación de texto general en alemán e inglés.
- Plantilla de chat ChatML con system prompt por defecto de OceanLabs, reemplazable por un system message propio.
- Compatibilidad con text-generation-inference y endpoints compatibles (según tags del repositorio).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Asistencia a programadores en IDE: el modelo puede generar y explicar fragmentos de código en respuesta a instrucciones en lenguaje natural, aprovechando la base Coder y su plantilla de chat para integrarse en asistentes tipo copiloto.
- Depuración y refactorización: dado un fragmento de código con errores o estilo mejorable, el modelo puede proponer correcciones y reescrituras, tarea para la que fue diseñado el modelo base Coder.
- Explicación de código heredado: traducir fragmentos complejos a explicaciones en alemán o inglés, combinando la comprensión de código del Coder con la capacidad lingüística general del Instruct.
- Asistente general bilingüe (alemán/inglés): responder preguntas no relacionadas con programación, con un equilibrio entre precisión técnica y fluidez conversacional, útil en equipos de desarrollo germanoparlantes.
- Experimentación con técnicas de merging: servir como caso de estudio reproducible de SLERP por capas y por tipo de tensor para investigadores que estudien la combinación de modelos especializados y generales.
- Punto de partida para fine-tuning: al estar bajo Apache 2.0 y en formato transformers/safetensors, puede usarse como base para ajuste supervisado o DPO en dominios concretos antes de evaluar su rendimiento.
- Evaluación comparativa de merges: emplearlo como referencia en pipelines de evaluación que midan la degradación o mejora respecto a los modelos base en tareas de código y de instrucciones generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente en la model card que el merge no ha sido evaluado y que cualquier afirmación sobre su calidad debe considerarse no verificada hasta que se publiquen evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15 GB en bfloat16 (dato indicado en la model card); en cuantizaciones de 8 bits o 4 bits el requisito se reduciría de forma proporcional, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU con 16 GB o más de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100) permite cargar el modelo en bfloat16.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 16 GB de VRAM en bfloat16; en GPUs con menos memoria sería necesario cuantizar, opción no documentada por el autor.
- Opciones de despliegue: transformers (>= 4.37, según la model card), text-generation-inference y endpoints compatibles (según tags del repositorio). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI más allá de la mención a text-generation-inference.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ocean-Coder-7B-Fusion | 7,6 B | no disponible | Apache 2.0 | Merge SLERP sin entrenamiento ni benchmarks; idiomas de/en |
| Qwen2.5-Coder-7B-Instruct | 7,6 B (arquitectura Qwen2) | no disponible en esta ficha | Apache 2.0 | Modelo base primario, especializado en código |
| Qwen2.5-7B-Instruct | 7,6 B (arquitectura Qwen2) | no disponible en esta ficha | Apache 2.0 | Modelo base secundario, orientado a instrucciones generales |

No se dispone de datos de rendimiento comparativos porque el modelo no ha sido evaluado; la comparación se limita a parámetros, licencia y procedencia.

## Limitaciones y advertencias

- Modelo no evaluado: el autor advierte de que no se han publicado benchmarks y que las afirmaciones sobre calidad son no verificadas.
- Sin entrenamiento: al ser un merge de pesos, no incorpora datos nuevos ni correcciones de sesgos respecto a sus modelos base.
- Sesgos: no documentados por el autor; hereda los sesgos de Qwen2.5-Coder-7B-Instruct y Qwen2.5-7B-Instruct.
- Riesgo de alucinación: no cuantificado; es esperable un comportamiento similar al de los modelos base, sin evaluación específica.
- Idiomas: la model card declara solo alemán e inglés, aunque los modelos base Qwen2.5 tienen cobertura multilingüe más amplia; el rendimiento fuera de de/en no está garantizado.
- Contexto: la longitud de contexto no se confirma en la información disponible; conviene verificar `config.json` antes de desplegar en producción con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de modelos Qwen conviene revisar las condiciones de los modelos base.
- Fecha de creación futura (2026-11-24) en los metadatos de Hugging Face, lo que puede indicar metadatos inconsistentes; verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/OceanLabs/Ocean-Coder-7B-Fusion
- Modelo base primario: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Modelo base secundario: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper referenciado (arxiv:2409.12186): https://arxiv.org/abs/2409.12186
- Paper referenciado (arxiv:2412.15115): https://arxiv.org/abs/2412.15115
- Licencia: https://huggingface.co/OceanLabs/Ocean-Coder-7B-Fusion/blob/main/LICENSE
