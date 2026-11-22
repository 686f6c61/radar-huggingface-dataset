# mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v2-GGUF

## Resumen

GLM-Z1-32B-0414-uncensored-heretic-v2-GGUF es una distribucion de pesos en formato GGUF del modelo llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v2, publicada por el usuario mradermacher. Se trata de una cuantizacion estatica del modelo base GLM-Z1-32B-0414, un transformer denso de aproximadamente 32.570 millones de parametros, sobre el que se ha aplicado un proceso de "uncensoring" y "abliteration" (referido como heretic) para eliminar o atenuar los mecanismos de rechazo y las restricciones de contenido alineadas del modelo original.

El modelo resuelve el problema de desplegar un LLM de gran tamano (32B) con contexto conversacional en hardware de consumo o servidores modestos, al ofrecer multiples niveles de cuantizacion GGUF (desde Q2_K hasta Q8_0 y f16) que permiten ajustar el uso de VRAM y la fidelidad de los pesos. Es relevante para desarrolladores e investigadores que necesitan ejecutar localmente un modelo de razonamiento de 32B sin las politicas de rechazo del modelo original, aunque con las advertencias de seguridad y licencia que ello implica.

La informacion disponible es limitada: no se especifican licencia, idiomas, pipeline ni datos de entrenamiento del modelo base en la model card proporcionada. La ficha se completa con los datos verificables (parametros reales de safetensors, lista de cuantizaciones, tamano del repo) y se marcan explicitamente como "no disponible" los campos no documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de GLM-Z1-32B-0414) |
| Parametros totales | 32.566.081.536 (32,57B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de aproximadamente 32,57 mil millones de parametros, heredado del modelo GLM-Z1-32B-0414. El autor de esta distribucion no documenta en la model card los detalles del entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF/DPO o tecnicas de razonamiento). El modelo base GLM-Z1-0414 pertenece a la familia GLM-Z1 de Zhipu AI, orientada a tareas de razonamiento, pero esta informacion no se confirma en los datos proporcionados.

La innovacion tecnica de esta publicacion concreta no reside en el entrenamiento, sino en el post-procesado: se aplica un proceso de "uncensoring"/abliteration (etiquetado como heretic v2) que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones, y posteriormente se generan cuantizaciones estaticas en formato GGUF mediante una herramienta de conversion (convert_type: hf, quantize_version: 2) para su uso con llama.cpp y ecosistemas compatibles. No se documentan tecnicas como decodificacion especulativa o attention linear en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno (tag "conversational").
- Razonamiento de proposito general propio de un modelo de 32B (heredado de la familia GLM-Z1, segun el nombre del modelo).
- Ejecucion local mediante llama.cpp y runtimes compatibles con GGUF.
- Endpoints compatibles (tag "endpoints_compatible") para integracion en APIs tipo OpenAI.
- Comportamiento "uncensored": menor tasa de rechazo ante peticiones que el modelo original rechazaria.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado en esta distribucion).
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Despliegue local de un LLM de 32B en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones Q4_K_M o Q5_K_M, el modelo puede ejecutarse en GPUs con 24 GB de VRAM, permitiendo inferencia privada sin dependencia de la nube.
- Investigacion sobre alineacion y seguridad: el caracter "uncensored" lo hace util para estudiar el comportamiento de modelos sin mecanismos de rechazo, comparando respuestas frente al modelo original en tareas de red teaming controlado.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o narrativa que requieran tematicas que el modelo original rechazaria, con la advertencia de revision humana posterior.
- Prototipado de asistentes conversacionales en entornos aislados: el tag "conversational" y la compatibilidad con endpoints permiten montar un chatbot interno con llama.cpp o servidores compatibles con la API de OpenAI.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes (de Q2_K a f16), lo que permite medir el impacto de la cuantizacion en calidad y latencia para un modelo de 32B.
- Fine-tuning o destilacion sobre pesos abiertos: los pesos en safetensors del modelo base permiten servir como punto de partida para ajuste supervisado en dominios especificos, siempre que la licencia del modelo original lo permita (no verificada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (32,57B parametros):
  - f16: aproximadamente 65 GB.
  - Q8_0: aproximadamente 34-35 GB.
  - Q6_K: aproximadamente 27-28 GB.
  - Q5_K_M: aproximadamente 23-24 GB.
  - Q4_K_M: aproximadamente 19-20 GB.
  - Q3_K_M: aproximadamente 15-16 GB.
  - Q2_K: aproximadamente 12-13 GB.
  - IQ4_XS: aproximadamente 18-19 GB.
- GPU recomendadas: A100 80 GB o H100 para f16/Q8_0; RTX 4090 (24 GB) o A6000 (48 GB) para Q4_K_M/Q5_K_M; RTX 3090 (24 GB) para Q4_K_M.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4_K_M o inferiores; Q2_K permite incluso GPUs de 16 GB con margen limitado para contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF y endpoints tipo OpenAI; vLLM y TGI no soportan GGUF de forma nativa generalizada.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-Z1-32B-0414-uncensored-heretic-v2-GGUF (este) | 32,57B | no disponible | no disponible | GGUF | Variante uncensored con 12 cuantizaciones |
| GLM-Z1-32B-0414 (original) | ~32B | no disponible en esta ficha | no disponible | safetensors | Modelo base con alineacion original |
| Modelos densos de 32B comparables (p. ej. Qwen2.5-32B) | ~32B | no disponible | no disponible | safetensors/GGUF | Alternativa de tamano similar; datos no verificados en esta busqueda |

No se dispone de datos suficientes para una comparativa cuantitativa de rendimiento con alternativas.

## Limitaciones y advertencias

- El proceso "uncensored"/abliteration puede degradar capacidades de razonamiento y coherencia respecto al modelo original; no se han publicado evaluaciones que lo cuantifiquen.
- Riesgo elevado de generar contenido danino, sesgado o inexacto al haberse eliminado los mecanismos de rechazo; requiere filtros y supervision en produccion.
- Riesgo de alucinacion inherente a modelos de 32B; no se documenta mitigacion especifica.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe verificarse en el modelo base llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v2 y en el GLM-Z1-0414 original antes de cualquier despliegue productivo.
- Idiomas soportados no documentados; el rendimiento fuera del ingles/chino es incierto.
- Longitud de contexto no disponible; no se puede garantizar el manejo de conversaciones largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia de calidad.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden producir perdida notable de calidad en un modelo de 32B.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v2-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v2
- Perfil del autor: https://huggingface.co/mradermacher
- Paper, blog, repositorio o demo del modelo original: no disponible en la informacion proporcionada.
