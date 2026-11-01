# phisherguy/merged-gemma4-e2b-it

## Resumen

`phisherguy/merged-gemma4-e2b-it` es un modelo de lenguaje publicado en HuggingFace por el usuario phisherguy, que por su identificador y metadatos se presenta como un merge de la familia Gemma 4 en su variante "e2b" con ajuste instruccional (it). El repositorio contiene pesos en formato safetensors con un total de 5.104.297.539 parámetros (aproximadamente 5,1 mil millones) y un tamaño de 8,4 GB, lo que es coherente con pesos en precisión de 16 bits.

La model card publicada es prácticamente vacía: solo incluye la declaración de licencia Apache 2.0, sin información sobre arquitectura, datos de entrenamiento, contexto, idiomas o benchmarks. Esto limita seriamente cualquier evaluación rigurosa del modelo, y los datos que se ofrecen en esta ficha provienen exclusivamente de los metadatos del repositorio y de la convención de nombres de la familia Gemma, no de documentación del autor.

El modelo es relevante únicamente como artefacto de experimentación: un merge comunitario de bajo perfil (15 descargas, 0 likes en el momento de la consulta) que puede interesar a quienes exploran combinaciones de pesos de la familia Gemma 4, pero que no debería adoptarse en producción sin una validación propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only de la familia Gemma 4; no confirmado por el autor) |
| Parametros totales | 5.104.297.539 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye el tag `compressed-tensors`, lo que sugiere compatibilidad con formatos comprimidos, pero no se detallan) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tag `compressed-tensors` presente) |

## Arquitectura y entrenamiento

No hay información publicada por el autor sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. El nombre del repositorio indica que se trata de un "merge" (fusión de pesos de dos o más checkpoints) de un modelo Gemma 4 variante "e2b" con versión instruccional, pero se desconoce la receta exacta del merge, los checkpoints de origen y los hiperparámetros empleados.

El tag `compressed-tensors` en los metadatos sugiere que el repositorio puede contener pesos cuantizados o comprimidos mediante la librería compressed-tensors (usada habitualmente por vLLM y llm-compressor), aunque no se especifica el esquema de cuantización ni los grupos de bits. Cualquier afirmación sobre innovaciones técnicas (atención lineal, decodificación especulativa, etc.) sería especulativa y no se incluye.

## Capacidades

- Generación de texto autoregresiva: capacidad esperable en un modelo de la familia Gemma con ajuste instruccional, aunque no verificada por el autor.
- Seguimiento de instrucciones: el sufijo "it" sugiere ajuste instruccional, pero no hay documentación que lo confirme.
- Razonamiento y código: no disponible; no hay evaluación publicada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Experimentación con merges de la familia Gemma: investigadores que quieran reproducir o analizar fusiones de pesos pueden usar este checkpoint como punto de partida, comparando su comportamiento con los modelos base originales.
- Evaluación comparativa interna: equipos que ya operen con Gemma 4 pueden incluirlo en sus suites de evaluación propias para medir si el merge aporta mejoras en tareas concretas, siempre con validación empírica.
- Fine-tuning posterior: al estar en safetensors y con licencia Apache 2.0, puede servir como base para ajuste supervisado en dominios específicos, aunque conviene verificar antes la calidad del checkpoint.
- Pruebas de cuantización: el tag `compressed-tensors` permite explorar flujos de compresión con llm-compressor y despliegue en vLLM, midiendo la degradación de calidad respecto al checkpoint original.
- Docencia y formación: útil como ejemplo práctico de merge de modelos y de los riesgos de publicar artefactos sin model card, en cursos de ingeniería de IA.
- Prototipado de bajo riesgo: para demos internas no críticas donde la licencia permisiva y el tamaño moderado (5,1 B de parámetros) facilitan el despliegue en una sola GPU, aceptando la ausencia de garantías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 10-11 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 12-16 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 3-4 GB para pesos.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100/H100 para despliegues con contexto largo o batches grandes; una RTX 3090/4080 (16 GB) debería bastar en FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB o más en FP16, y en tarjetas de 8 GB con cuantización de 4 bits, siempre que se valide la compatibilidad del formato `compressed-tensors`.
- Opciones de despliegue: vLLM (especialmente indicado por el tag `compressed-tensors`), TGI, llama.cpp/Ollama si se generan versiones GGUF a partir de los pesos safetensors, y transformers con accelerate.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| phisherguy/merged-gemma4-e2b-it | 5,1 B | no disponible | Apache 2.0 | HuggingFace, 15 descargas |
| Gemma 2 9B IT (referencia de familia previa) | 9 B | 8.192 tokens | Gemma Terms of Use | HuggingFace, ampliamente usado |
| Qwen2.5 7B Instruct | 7,6 B | 32.768 tokens (128K en variantes) | Apache 2.0 | HuggingFace, muy extendido |
| Mistral 7B Instruct | 7,2 B | 32.768 tokens | Apache 2.0 | HuggingFace, muy extendido |

La comparación es aproximada: no se dispone de datos de rendimiento del modelo evaluado, y los modelos de referencia se incluyen por rango de tamaño y licencia, no por resultados medidos frente a este checkpoint.

## Limitaciones y advertencias

- Model card vacía: no hay documentación sobre entrenamiento, datos, contexto ni evaluación; cualquier uso en producción requiere validación propia desde cero.
- Procedencia del merge desconocida: se ignoran los checkpoints de origen y la receta de fusión, lo que impide auditar sesgos o contaminación de datos.
- Riesgo de alucinación: no cuantificado; sin benchmarks no puede estimarse su fiabilidad factual.
- Idiomas: no declarados; no debe asumirse un soporte multilingüe de calidad.
- Contexto: no declarado; planificar despliegues con ventanas conservadoras hasta verificarlo empíricamente.
- Licencia Apache 2.0 declarada por el autor: permisiva para uso comercial, pero la procedencia de los pesos de origen (familia Gemma) podría introducir obligaciones adicionales si el merge incorpora material sujeto a los términos de Gemma; conviene revisar la cadena de licencias antes de un uso comercial.
- Popularidad mínima (15 descargas, 0 likes): sin señales de validación por parte de la comunidad.
- Compatibilidad de formatos: el tag `compressed-tensors` no garantiza que todos los runners soporten el checkpoint sin conversión previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/phisherguy/merged-gemma4-e2b-it
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
