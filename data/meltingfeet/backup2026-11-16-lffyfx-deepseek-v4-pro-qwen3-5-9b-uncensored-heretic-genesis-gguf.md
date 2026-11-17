# meltingfeet/backup2026-11-16-LffyFx-DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Genesis-GGUF

## Resumen

El modelo `meltingfeet/backup2026-11-16-LffyFx-DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Genesis-GGUF` es una distribución en formato GGUF de un fine-tuning sobre `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B`, un modelo de aproximadamente 9.197 millones de parámetros. El autor, `meltingfeet`, publica una versión "uncensored" (también etiquetada como "heretic", "decensored" y "abliterated"), es decir, con las capas de rechazo y alineación de seguridad eliminadas o atenuadas mediante técnicas de abliteration. El nombre sugiere una destilación de razonamiento inspirada en DeepSeek-V4-Pro sobre una base de la familia Qwen 3.5.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo típico del ecosistema de modelos derivados y "abliterated" que circulan en Hugging Face: fine-tunings de conveniencia publicados como backups con nombres generados automáticamente. Por otro, advierte de que se trata de un artefacto con acceso restringido (gated), sin descargas ni interacciones registradas, creado y actualizado en un intervalo de 19 segundos, lo que sugiere un volcado automatizado más que un lanzamiento cuidado.

La información pública disponible es muy limitada: no hay model card sustantiva, no se publican benchmarks ni detalles de entrenamiento. Esta ficha se limita a los metadatos verificables del repositorio y a las inferencias razonables a partir de las etiquetas, indicando explícitamente "no disponible" cuando el dato no existe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5, según etiqueta `qwen3_5`); detalles no disponibles |
| Parametros totales | 9.197.093.888 (≈9,2 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo incluye pesos en formato GGUF; niveles concretos no disponibles) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 29,1 GB); el modelo base se distribuye en safetensors |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Libreria declarada | transformers |
| Pipeline | text-generation |
| Modelo base | Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B |
| Tamano del repositorio | 29,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen 3.5, según la etiqueta `qwen3_5` y el nombre del modelo base. No se dispone de información sobre número de capas, dimensión oculta, cabezas de atención ni mecanismos específicos (atención lineal, decodificación especulativa, multi-token prediction). La etiqueta `mtp` sugiere multi-token prediction, pero no hay documentación que lo confirme.

En cuanto al entrenamiento, las etiquetas del repositorio indican una combinación de SFT, RL y GSPO (Group Sequence Policy Optimization), junto con destilación (`distillation`) desde un modelo mayor identificado como DeepSeek-V4-Pro. También aparecen las etiquetas `math`, `stem`, `tool-use` y `function-calling`, lo que apunta a un ajuste orientado a razonamiento matemático, científico y uso de herramientas. La parte "uncensored/heretic/abliterated" indica que se aplicó una técnica de abliteration para eliminar direcciones de rechazo en el espacio de activaciones. No se publican el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RLHF/DPO. Toda esta información debe considerarse no verificada.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento explícito, según la etiqueta `reasoning` y la inspiración en modelos de razonamiento tipo DeepSeek.
- Matemáticas y STEM: etiquetas `math` y `stem` indican ajuste específico en estas áreas.
- Uso de herramientas y function calling: etiquetas `tool-use` y `function-calling`.
- Capacidades multilingües declaradas para inglés, chino, coreano, japonés, español y ruso.
- Comportamiento "uncensored": el modelo ha sido modificado para reducir rechazos ante peticiones que un modelo alineado estándar rechazaría.
- No se declara soporte de visión, audio ni otras modalidades.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio de abliteration, permitiendo analizar qué capacidades se preservan y cuáles se degradan al eliminar las capas de rechazo. Adecuado para entornos de laboratorio, no para producción orientada al usuario final.
- Evaluación de robustez de filtros: se puede usar como generador adversario para probar clasificadores de contenido y sistemas de moderación en pipelines propios.
- Experimentación con destilación de razonamiento: al estar etiquetado como destilado de un modelo mayor, permite estudiar hasta qué punto un modelo de 9B retiene cadenas de razonamiento en matemáticas y STEM.
- Pruebas de function calling en local: con pesos GGUF y 9B de parámetros, se puede desplegar en una estación de trabajo para validar esquemas de herramientas y agentes sin depender de APIs externas.
- Traducción y generación multilingüe entre los seis idiomas declarados, en contextos internos donde la licencia Apache 2.0 y la ausencia de restricciones de contenido sean aceptables.
- Fine-tuning posterior como base: su licencia permisiva y tamaño moderado lo hacen candidato para ajustes específicos de dominio, siempre que se asuma el riesgo de sesgos y contenido sin filtrar del modelo de partida.
- Docencia y demostraciones: útil para ilustrar en clase cómo un modelo abliterated responde de forma distinta a uno alineado, con las salvaguardas éticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye model card con evaluaciones, y el modelo base `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B` no aporta datos verificables en los metadatos consultados. Cualquier cifra de MMLU, HumanEval o GSM8K para este artefacto concreto debe considerarse no disponible.

## Requisitos de hardware

- VRAM estimada: para 9,2B parámetros, en FP16 se requieren aproximadamente 18-19 GB solo para pesos; en cuantización Q8 unos 10 GB; en Q4_K_M unos 5,5-6 GB; en Q4_0 o Q3 alrededor de 4-5 GB. Estas cifras son estimaciones por tamaño, no medidas publicadas para este modelo.
- GPU recomendadas: A100 40 GB o H100 para FP16 sin cuantizar y contexto largo; RTX 4090 (24 GB) para FP16 ajustado o Q8; RTX 3090/4080 (16-24 GB) para Q8 o Q6; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q4.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 y Q5 en GPUs de 8-12 GB, y en Q8 en GPUs de 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; vLLM y TGI solo si se dispone de los pesos en safetensors del modelo base, no del GGUF.
- Latencia y throughput: no disponibles. Como referencia orientativa de la clase 9B en Q4 sobre una RTX 4090, cabría esperar decenas de tokens por segundo, pero no hay medición publicada para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Este modelo (meltingfeet/...Genesis-GGUF) | 9,2B | no disponible | Apache 2.0 | Gated | GGUF, abliterated, sin benchmarks |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9,2B | no disponible | Apache 2.0 (según metadatos del derivado) | no disponible | Modelo de partida, presumiblemente alineado |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (ampliable) | Apache 2.0 | Abierto | Referencia de la familia Qwen, con benchmarks públicos |
| Llama 3.1 8B Instruct | 8,0B | 131.072 tokens | Llama 3.1 Community License | Abierto con condiciones | Alternativa de tamaño similar, con evaluación publicada |

La comparación es aproximada: no existen datos de rendimiento del modelo evaluado, y los modelos de referencia pertenecen a generaciones anteriores de sus respectivas familias. La principal diferencia práctica es la modificación "uncensored" y el formato GGUF listo para inferencia local.

## Limitaciones y advertencias

- Ausencia total de model card, benchmarks y documentación de entrenamiento: no es posible verificar las capacidades declaradas en las etiquetas.
- Modelo "uncensored/abliterated": se ha eliminado o atenuado la alineación de seguridad, por lo que puede generar contenido dañino, ilegal o sensible sin rechazo. No apto para aplicaciones de cara al público sin filtros externos.
- Riesgo elevado de alucinación, agravado por la falta de evaluación y por el proceso de destilación no documentado.
- Sesgos desconocidos: al no publicarse la composición del dataset, no se pueden caracterizar sesgos de género, raza, idioma o ideología.
- Idiomas: se declaran seis, pero no hay evaluación de calidad por idioma; el español figura en la lista sin datos de rendimiento.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para uso automatizado o en CI.
- Repositorio con 0 descargas y 0 likes, creado y actualizado en 19 segundos: indicios de un volcado automatizado, sin mantenimiento ni soporte del autor.
- Licencia Apache 2.0 declarada, pero la cadena de derivación (DeepSeek → Qwen → fine-tuning → abliteration) puede plantear dudas sobre la procedencia y los términos reales de los pesos originales; conviene revisar las licencias del modelo base antes de uso comercial.
- El nombre incluye una fecha futura ("2026-11-16") y cadenas aleatorias, lo que dificulta la trazabilidad y sugiere que no es un artefacto estable.
- No se garantiza compatibilidad con `transformers` pese a la etiqueta, ya que los pesos están en GGUF y el pipeline declarado puede no funcionar directamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/meltingfeet/backup2026-11-16-LffyFx-DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Genesis-GGUF
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Perfil del autor: https://huggingface.co/meltingfeet
- Documentación de llama.cpp (inferencia GGUF): https://github.com/ggerganov/llama.cpp
- Documentación de Ollama: https://ollama.com
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la información disponible.
