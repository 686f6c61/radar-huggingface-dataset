# mradermacher/Llama-3.3-Super-Mini-Instruct-GGUF

## Resumen

Llama-3.3-Super-Mini-Instruct-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo mergekit-community/Llama-3.3-Super-Mini-Instruct, publicadas por mradermacher. No se trata de un modelo entrenado desde cero, sino de un "merge" de modelos de la familia Llama 3.3 combinado mediante mergekit y posteriormente convertido a GGUF para su uso en herramientas de inferencia local como llama.cpp u Ollama. El modelo cuenta con aproximadamente 2.957 millones de parámetros (unos 3B) según los datos de safetensors del repositorio.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de instrucciones de ~3B parámetros en hardware de consumo, con cuantizaciones que van desde 1,6 GB (Q2_K) hasta 6,0 GB (f16). Al estar basado en la arquitectura Llama 3.3, hereda el tokenizador y la estructura de la familia, lo que facilita su integración en pipelines existentes.

No obstante, la información publicada por el autor es mínima: no se especifican detalles de entrenamiento, licencia, contexto ni benchmarks. Esta ficha documenta lo que sí está disponible y marca explícitamente como "no disponible" todo aquello que no se puede verificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.3, según base_model) |
| Parámetros totales | 2.957.008.960 (~3B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base presumiblemente en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que el modelo base (mergekit-community/Llama-3.3-Super-Mini-Instruct) es un merge de modelos de la familia Llama 3.3, generado con la herramienta mergekit. Los tags del repositorio confirman "mergekit" y "merge", lo que indica que se trata de una combinación de pesos de modelos existentes, no de un entrenamiento desde cero. El tamaño de ~3B parámetros sugiere que el merge se realizó sobre variantes pequeñas de la familia Llama 3.3.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El autor de las cuantizaciones (mradermacher) indica que las cuantizaciones son estáticas y que las versiones con imatrix no estaban disponibles en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en inglés, orientada a instrucciones (sufijo "Instruct").
- Razonamiento general y respuesta a preguntas, heredado del modelo base mergeado.
- No se documenta soporte explícito de tool calling o function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según el campo `language: en`.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Compatible con endpoints (tag `endpoints_compatible`) y con la librería transformers.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en un portátil o equipo de sobremesa con 4-8 GB de VRAM usando cuantizaciones Q4_K_M o Q5_K_M, ofreciendo respuestas en inglés para tareas de chat general.
- Prototipado rápido de aplicaciones de IA: gracias a su tamaño reducido (~3B) y a los archivos GGUF de 2 GB, permite iterar en el diseño de prompts y flujos conversacionales sin necesidad de GPUs de datacenter.
- Generación de texto en entornos con recursos limitados: adecuado para Raspberry Pi, mini-PC o contenedores sin GPU, usando llama.cpp con cuantizaciones Q3 o Q4.
- Filtrado y clasificación de texto en inglés: puede emplearse para tareas de etiquetado, resumen o reescritura en pipelines batch donde el coste por token es crítico.
- Educación y experimentación: útil para estudiar el comportamiento de modelos mergeados de ~3B y comparar el efecto de distintas cuantizaciones (Q2_K frente a Q8_0) en la calidad de salida.
- Integración en herramientas de escritorio: al estar en GGUF, puede cargarse en Ollama, LM Studio o GPT4All para asistentes offline en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2 GB con Q4_K_M, ~2,5 GB con Q6_K, ~3,2 GB con Q8_0 y ~6 GB con f16 (más overhead de contexto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All, y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.3-Super-Mini-Instruct-GGUF | ~3B | no disponible | no disponible | GGUF | Merge de Llama 3.3, solo inglés |
| Llama-3.3-8B-Instruct-OmniWriter-GGUF | ~8B | no disponible | no disponible | GGUF | Otra cuantización de mradermacher sobre Llama 3.3 |
| Modelos Llama 3.2 3B Instruct | ~3B | no disponible | Llama 3.2 Community License | safetensors, GGUF | Modelo oficial de Meta, ampliamente documentado |

La comparación con alternativas oficiales se ve limitada por la falta de datos de benchmarks y licencia del modelo analizado. El modelo oficial Llama 3.2 3B Instruct cuenta con documentación completa y licencia conocida, lo que lo convierte en una alternativa más predecible para producción.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base antes de usarlo en producción.
- Idiomas: solo se declara inglés (`en`), por lo que el rendimiento en castellano no está garantizado.
- Alucinaciones: al ser un modelo de ~3B parámetros, la tasa de alucinación tiende a ser mayor que en modelos de mayor tamaño; requiere validación en aplicaciones críticas.
- Merge sin documentación: al tratarse de un merge de modelos, no hay información sobre qué modelos se combinaron ni con qué proporciones, lo que dificulta evaluar sesgos y comportamientos.
- Sin benchmarks: no hay datos públicos de rendimiento que permitan comparar su calidad frente a alternativas oficiales.
- Cuantizaciones estáticas: no se ofrecen versiones con imatrix, lo que puede reducir la calidad en cuantizaciones bajas (Q2_K, Q3_K_S).
- Contexto desconocido: no se puede confirmar la ventana de contexto real del modelo, lo que limita su uso en tareas de contexto largo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llama-3.3-Super-Mini-Instruct-GGUF
- Modelo base: https://huggingface.co/mergekit-community/Llama-3.3-Super-Mini-Instruct
- Página de descargas del autor: https://hf.tst.eu/model#Llama-3.3-Super-Mini-Instruct-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Otro modelo del mismo autor: https://huggingface.co/mradermacher/Llama-3.3-8B-Instruct-OmniWriter-GGUF
