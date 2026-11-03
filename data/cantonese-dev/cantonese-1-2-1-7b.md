# cantonese-dev/cantonese-1.2-1.7b

## Resumen
cantonese-1.2-1.7b es un modelo de lenguaje publicado por el colectivo cantonese-dev en HuggingFace, orientado al procesamiento del cantonés (variedad prestige del yue, lengua sinítica). El nombre del repositorio indica una versión 1.2 con aproximadamente 1.700 millones de parámetros nominales; el recuento real de pesos en formato safetensors es de 1.928.677.440 parámetros, lo que situaría al modelo en la franja de los 2B efectivos. El tamaño del repositorio es de 3,9 GB, coherente con pesos en precisión de 16 bits.

La model card es extremadamente escueta: tan solo indica "cantonese-v1.2 - trained with new dataset" y declara licencia Apache 2.0. No se documentan arquitectura, composición del corpus, número de tokens de entrenamiento, ventana de contexto ni proceso de alineación. La relevancia del modelo radica en su especialización lingüística: el cantonés cuenta con recursos abiertos muy limitados en comparación con el mandarín, y un modelo dedicado de ~2B parámetros puede desplegarse en hardware de consumo para tareas de generación y asistencia en esta lengua.

La información disponible no permite verificar capacidades concretas ni calidad de salida; esta ficha se limita a los datos publicados y marca explícitamente como "no disponible" todo aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.928.677.440 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | cantonés (según nombre y tags); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
No se ha publicado información sobre la arquitectura interna del modelo. El recuento de parámetros (1.928.677.440) y el tamaño del repositorio (3,9 GB) son compatibles con un transformer decoder-only de aproximadamente 2B parámetros en fp16/bf16, pero el autor no confirma esta hipótesis ni detalla capas, dimensiones ocultas, cabezas de atención ni tipo de atención (completa, GQA, sliding window). Tampoco se especifica si emplea tokenizador multilingüe o uno adaptado al cantonés escrito.

Respecto al entrenamiento, la model card solo menciona "trained with new dataset" en la versión 1.2, sin indicar número de tokens, composición del corpus, proporción de texto en cantonés frente a otras lenguas, ni si hubo fases de instrucción, RLHF o DPO. No hay información sobre innovaciones técnicas (decodificación especulativa, atención lineal, mezcla de expertos) ni sobre el proceso de evaluación.

## Capacidades
- Generación de texto en cantonés: es la única capacidad implícita en la documentación del modelo.
- Capacidades multilingües adicionales: no disponibles; el autor no declara otros idiomas.
- Razonamiento, matemáticas y código: no documentados.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (visión, audio): no documentadas.
- Modo de razonamiento explícito (thinking mode): no documentado.

## Casos de uso
- Generación de texto y conversación en cantonés: el modelo puede emplearse como base para asistentes conversacionales en cantonés escrito, dado que su especialización lingüística cubre un nicho con pocos modelos abiertos dedicados.
- Traducción cantonés-español o cantonés-inglés: como modelo base, podría ajustarse con fine-tuning supervisado para pares de traducción donde el cantonés sea la lengua origen, aprovechando su exposición al idioma.
- Preprocesado y normalización de texto cantonés: tareas de limpieza, segmentación o reescritura de transcripciones en esta variedad del yue.
- Fine-tuning para dominios concretos: al ser un modelo de ~2B parámetros con licencia Apache 2.0, es viable reentrenarlo con datos propios (atención al cliente en Hong Kong, contenido editorial, subtitulado) en una sola GPU.
- Investigación lingüística sobre el cantonés: análisis de fenómenos morfosintácticos o generación de ejemplos controlados para estudios del yue.
- Despliegue en entornos con recursos limitados: su tamaño permite inferencia en GPU de consumo, lo que facilita prototipos y demos locales sin infraestructura en la nube.
- Educación del idioma: generación de ejercicios, diálogos o explicaciones gramaticales en cantonés tras un ajuste específico.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16/bf16: en torno a 4 GB solo para pesos, más overhead de activaciones y caché KV (dependiente de la longitud de contexto, no publicada).
- VRAM estimada en cuantización de 8 bits: aproximadamente 2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1-1,5 GB para pesos.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y RTX 4090; también en GPUs con 8 GB en fp16.
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para este tamaño, pero válidas para servir en lote.
- Opciones de despliegue: al publicarse solo en safetensors, requiere transformers o vLLM/TGI directamente; para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, algo que el autor no proporciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cantonese-1.2-1.7b | 1.928.677.440 | no disponible | Apache 2.0 | HuggingFace (safetensors) |
| Qwen2.5-1.5B | ~1.500 millones | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | HuggingFace, GGUF, Ollama |
| Gemma 2 2B | ~2.600 millones | 8.192 tokens (según documentación pública de Google) | Gemma Terms of Use | HuggingFace, GGUF, Ollama |
| Llama 3.2 1B | ~1.200 millones | 128.000 tokens (según documentación pública de Meta) | Llama 3.2 Community License | HuggingFace, GGUF, Ollama |

Nota: los datos de los modelos comparativos provienen de su documentación pública general; no se dispone de comparación de rendimiento en cantonés entre estos modelos y cantonese-1.2-1.7b.

## Limitaciones y advertencias
- Ausencia total de documentación técnica: no se puede verificar arquitectura, contexto, datos de entrenamiento ni alineación, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de alucinación: sin información sobre fases de instrucción o RLHF, es probable que el modelo sea una base preentrenada y no un modelo instruct, con mayor propensión a continuaciones incoherentes en formato conversacional.
- Sesgos desconocidos: al no publicarse la composición del corpus, no es posible evaluar sesgos lingüísticos, regionales o culturales.
- Cobertura limitada a cantonés: no se declaran otros idiomas; el rendimiento en mandarín, inglés o español es incierto.
- Longitud de contexto no publicada: impide planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad legal recae en el desplegador.
- Ecosistema incipiente: sin variantes GGUF ni integraciones en Ollama, el despliegue requiere conversión manual de pesos.
- Métricas de adopción mínimas (0 descargas, 2 likes en el momento de la consulta): no hay evidencia de uso en producción ni validación por la comunidad.

## Enlaces
- HuggingFace: https://huggingface.co/cantonese-dev/cantonese-1.2-1.7b
- Wikipedia, Cantonés: https://en.wikipedia.org/wiki/Cantonese
- Wikipedia, Pueblo cantonés: https://en.wikipedia.org/wiki/Cantonese_people
- Learn Cantonese: https://www.learn-cantonese.com/
- Cantonese.hk: https://cantonese.hk/
