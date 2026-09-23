# OnlyTextLLMs/gemma-4-E4B-it-OnlyText-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF de OnlyTextLLMs/gemma-4-E4B-it-OnlyText, la variante exclusivamente de texto del multimodal google/gemma-4-E4B-it. El autor (OnlyTextLLMs) no ha reentrenado nada: ha eliminado las modalidades de imagen, audio y vídeo del tokenizer y ha convertido los pesos originales a GGUF mediante `convert_hf_to_gguf.py`, aplicando después `llama-quantize`. El resultado es un modelo denso de 7.517.976.106 parámetros (7,52B) con arquitectura Gemma4ForCausalLM: 42 capas, de las cuales 35 usan atención deslizante y 7 atención completa, con dimensión oculta 2560 y vocabulario de 262.137 entradas.

Su relevancia práctica es doble. Por un lado, permite ejecutar un modelo de 7,5B en hardware local o en servidores modestos con tres niveles de cuantización (Q4_K_M, Q6_K, Q8_0) y una ventana de contexto de trabajo de 32.768 tokens. Por otro, la model card publica métricas de divergencia KL frente al maestro F16 y cifras de rendimiento medidas en una GPU AMD Radeon AI PRO R9700 con ROCm, algo poco habitual en repositorios de cuantización y útil para decidir qué archivo desplegar.

Conviene señalar el contexto del repositorio: es un derivado recién publicado, sin descargas ni valoraciones, y no cita referencias externas de benchmarks (MMLU, HumanEval, GSM8K, etc.). La familia Gemma 4 no incluye cabecera de draft, por lo que no hay decodificación especulativa dentro del archivo: todas las cifras corresponden a decodificación plana.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `Gemma4ForCausalLM` (arquitectura GGUF `gemma4`); 42 capas (35 de atención deslizante + 7 de atención completa), dimensión oculta 2560, vocabulario 262.137 |
| Parametros totales | 7.517.976.106 (7,52B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en los ejemplos de uso documentados (`-c 32768`); el máximo oficial no se detalla en la model card |
| Tipos de cuantizacion | GGUF `Q4_K_M` (5,3 GB), `Q6_K` (6,2 GB), `Q8_0` (8,0 GB); maestro F16 usado como referencia de comparación |
| Idiomas soportados | No disponible (no declarados en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 19,6 GB con los tres archivos |
| Modelo base | google/gemma-4-E4B-it (apache-2.0) |
| Tokenizer | 17 tokens especiales solo texto en los ids 0–106 (EOS 1 = `<eos>`, fin de turno 106 = `<turn|>`); tokens de imagen, audio y vídeo eliminados |
| Cabecera de draft | No incluida (la familia no la distribuye): sin decodificación especulativa en el archivo |

## Arquitectura y entrenamiento

El modelo es una conversión directa de pesos, sin entrenamiento adicional. La arquitectura subyacente es un transformer causal con un patrón mixto de atención: 35 de las 42 capas aplican atención deslizante y solo 7 aplican atención completa, lo que reduce el coste del contexto largo frente a un transformer de atención completa en todas las capas. La dimensión oculta es 2560 y el vocabulario de 262.137 tokens. El tokenizer del derivado se ha reducido a 17 tokens especiales de texto, eliminando los correspondientes a imagen, audio y vídeo, lo que simplifica el pipeline de plantillas y evita rutas multimodales innecesarias.

El proceso de construcción es reproducible y está documentado: conversión con `convert_hf_to_gguf.py` sobre la build `f280b26983ad` de llama.cpp y cuantización posterior con `llama-quantize` usando el tipo nombrado de cada archivo. No se aplicó RLHF, DPO ni ajuste adicional en este repositorio; cualquier alineación procede del modelo base de Google. La única capacidad de "razonamiento" destacable es el canal de pensamiento de Gemma, que la plantilla de chat soporta pero deja desactivado por defecto (`enable_thinking: false`); se puede activar pasando `"chat_template_kwargs": {"enable_thinking": true}` en la API del servidor.

## Capacidades

- Generación de texto conversacional de un solo turno y multiturno mediante la plantilla de chat incluida en el GGUF.
- Canal de pensamiento opcional (thinking) para respuestas con razonamiento previo, desactivado por defecto.
- Procesamiento de contexto largo: los ejemplos oficiales lanzan el servidor con 32.768 tokens de ventana.
- Despliegue como servidor compatible con la API de OpenAI mediante `llama-server`, lo que permite usarlo como sustituto directo en clientes que hablen ese protocolo.
- Inferencia en CPU/GPU con llama.cpp, con descarga total de capas a GPU (`-ngl 99`) y atención flash (`-fa on`).
- Reparto automático por capas en configuraciones multi-GPU (`--split-mode layer` es el valor por defecto).
- Capacidades multimodales: no disponibles; este derivado es exclusivamente de texto y ha eliminado los tokens de imagen, audio y vídeo.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y multi-step reasoning: no documentado explícitamente; el canal de thinking es el único mecanismo de razonamiento descrito.
- Capacidades multilingües: no disponibles como dato declarado.

## Casos de uso

- Atención al cliente automatizada on-premise: con 32.768 tokens de contexto se puede mantener un historial largo de conversación y documentación de producto en el mismo prompt, y `llama-server` expone un endpoint compatible con OpenAI que simplifica la integración con backends existentes.
- Resumen y extracción sobre documentos largos: contratos, informes o actas que quepan en la ventana de 32k tokens se procesan en una sola pasada, evitando pipelines de troceado y recuperación.
- Asistente de razonamiento paso a paso en local: activando `enable_thinking` se obtienen respuestas con canal de pensamiento separado, útil para tareas de análisis donde interesa auditar el razonamiento intermedio. No hay benchmarks publicados que respalden su rendimiento en matemáticas o lógica, por lo que conviene validarlo con un conjunto propio.
- Despliegue en estaciones de trabajo con GPU de gama de consumo: el archivo Q4_K_M ocupa 5,3 GB, de modo que cabe en GPUs de 8 GB o más junto con la caché KV para contextos moderados; es un punto de entrada realista para prototipos y demos internas.
- Sustitución de un modelo multimodal cuando solo se necesita texto: al eliminar las modalidades de imagen/audio/vídeo, el tokenizer y la plantilla se simplifican y se evita cargar rutas de preprocesado que no se van a usar.
- Backend de generación en herramientas de terceros: al ser un GGUF compatible con `llama-server` en formato OpenAI, se puede enchufar en frameworks tipo LangChain o en el SDK oficial sin adaptadores propios.
- Estudio de daño de cuantización: el repositorio publica KLD frente al maestro F16 y la tasa de coincidencia en top-1, lo que permite reproducir el análisis y elegir el archivo con criterio medido en lugar de por tamaño.
- Servicio multi-GPU en un solo host: con el reparto por capas por defecto de llama.cpp se puede servir el modelo desde dos GPU sin fijar variables de visibilidad de dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card indica explícitamente que no cita líneas base publicadas para este tamaño y que las cifras son propias. Lo que sí se publica es daño de cuantización y velocidad de inferencia.

Daño de cuantización frente al maestro F16 (`llama-perplexity --kl-divergence`, contexto 1024, 40 ventanas, 20.440 tokens evaluados):

| Cuantizacion | KLD media | KLD mediana | Misma top-1 | KLD maxima |
|---|---|---|---|---|
| `Q4_K_M` | 0,2801 | 0,1173 | 79,77% | 12,29 |
| `Q6_K` | 0,0254 | 0,0085 | 93,48% | 4,59 |
| `Q8_0` | 0,0052 | 0,0015 | 97,08% | 3,94 |

El autor advierte que `Q4_K_M` no es intercambiable con los otros dos: cambia el token top-1 en el 20,2% de las posiciones, frente al 2,9% de `Q8_0`.

Rendimiento medido el 2026-09-22 en una única AMD Radeon AI PRO R9700 (gfx1201, 34 GB), llama.cpp `f280b26983ad` con build HIP/ROCm sobre ROCm 7.14 y `-c 32768 -fa on`:

| Cuantizacion | Dispositivo | Prefill t/s (PP512) | Generacion t/s (chat) | Generacion t/s (`llama-bench` TG128) |
|---|---|---|---|---|
| `Q4_K_M` | R9700 unica | 3171 | 79,7 | 89,7 |
| `Q6_K` | R9700 unica | 1788 | 78,6 | 86,0 |
| `Q8_0` | R9700 unica | 4035 | 71,2 | 76,4 |

Las dos columnas de decodificación no son comparables entre sí: la de chat usa la plantilla de conversación y un prompt de unos 90 tokens, mientras que TG128 es una generación directa de 128 tokens.

## Requisitos de hardware

- VRAM estimada solo para pesos: `Q4_K_M` 5,3 GB; `Q6_K` 6,2 GB; `Q8_0` 8,0 GB. Hay que sumar la caché KV, cuyo tamaño depende del contexto y de la configuración elegida; la model card no publica esa cifra.
- GPU recomendadas: no hay recomendaciones oficiales. La única medición publicada usa una AMD Radeon AI PRO R9700 de 34 GB con ROCm 7.14. No se publican datos para NVIDIA.
- Cabe en GPU de consumo: sí. `Q4_K_M` (5,3 GB) es viable en tarjetas de 8 GB o más con contexto moderado; `Q8_0` (8,0 GB) se ajusta en GPUs de 12 GB o más.
- Opciones de despliegue: llama.cpp mediante `llama-server` (API compatible con OpenAI) o `llama-cli`. Se requiere una build de llama.cpp que reconozca la arquitectura `gemma4`. Para vLLM o TGI habría que usar el repositorio en safetensors, no estos GGUF.
- Ejemplo de arranque documentado: `llama-server -m gemma-4-E4B-it-OnlyText-Q4_K_M.gguf -ngl 99 -c 32768 -fa on`.
- Multi-GPU: el reparto por capas es el comportamiento por defecto de llama.cpp; el autor recomienda no fijar variables `*_VISIBLE_DEVICES` para dejar que se reparta automáticamente.
- Latencia y throughput: en una R9700 con `Q4_K_M` y contexto 32768, 3171 t/s de prefill (PP512), 79,7 t/s de generación en chat y 89,7 t/s en TG128. Con `Q6_K` bajan a 1788 t/s de prefill, 78,6 t/s en chat y 86,0 t/s en TG128; con `Q8_0`, a 4035 t/s, 71,2 t/s y 76,4 t/s respectivamente. No hay mediciones para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| OnlyTextLLMs/gemma-4-E4B-it-OnlyText-GGUF (este) | 7,52B | 32.768 tokens en los ejemplos de uso; máximo no detallado | Solo texto | GGUF (Q4_K_M, Q6_K, Q8_0) | apache-2.0 | Sin cabecera de draft; publica KLD y throughput propios |
| OnlyTextLLMs/gemma-4-E4B-it-OnlyText | 7,52B | No disponible en la información proporcionada | Solo texto | Safetensors (maestro F16 de referencia) | apache-2.0 | Origen de las cuantizaciones; misma eliminación de modalidades |
| google/gemma-4-E4B-it | 7,52B | No disponible en la información proporcionada | Texto, imagen, audio y vídeo (según los tokens eliminados en el derivado) | Safetensors | apache-2.0 | Modelo base multimodal; no incluye cabecera de draft |

No se dispone de datos de benchmarks ni de especificaciones verificadas de otros modelos de 7–8B comparables dentro de la información proporcionada, por lo que no se incluye una comparación de rendimiento frente a alternativas de terceros.

## Limitaciones y advertencias

- Modelo exclusivamente de texto: no procesa imagen, audio ni vídeo; los tokens correspondientes se han eliminado del tokenizer.
- El canal de pensamiento está desactivado por defecto; sin pasar `"chat_template_kwargs": {"enable_thinking": true}` el modelo responde directamente y no razona antes.
- `Q4_K_M` presenta un daño de cuantización notable (KLD media 0,2801, 79,77% de coincidencia en top-1): si la tarea es sensible a la distribución de salida, conviene `Q6_K` o `Q8_0`, priorizando la columna de misma top-1 sobre el tamaño del archivo.
- Sin benchmarks de conocimiento o razonamiento publicados: no hay evidencia en este repositorio sobre MMLU, HumanEval, GSM8K o similares, y el propio autor indica que no cita líneas base externas. Cualquier decisión de producción debería apoyarse en una evaluación propia.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingüe concreta sin probarlo.
- Tool calling y uso como agente no están documentados; no se debe presumir soporte de function calling.
- Requiere una build reciente de llama.cpp que conozca la arquitectura `gemma4`; versiones antiguas no cargarán el archivo. No es utilizable directamente en vLLM o TGI, que necesitan safetensors.
- Repositorio sin tracción: 0 descargas y 0 valoraciones en el momento de la consulta, sin validación independiente de las cifras publicadas.
- Riesgo de alucinación: inherente a un modelo generativo de 7,5B sin ajuste adicional en este repositorio; no se han publicado evaluaciones de fidelidad.
- Licencia apache-2.0, que permite uso comercial, pero al ser un derivado conviene revisar también las condiciones del modelo base de Google y mantener la atribución indicada por el autor.
- La model card no detalla sesgos ni composición del dataset de entrenamiento del modelo original, por lo que no es posible evaluar sesgos específicos a partir de esta información.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OnlyTextLLMs/gemma-4-E4B-it-OnlyText-GGUF
- Derivado solo texto en safetensors: https://huggingface.co/OnlyTextLLMs/gemma-4-E4B-it-OnlyText
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Equipo autor del modelo base: https://huggingface.co/google
- Licencia apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp (herramientas de conversión y cuantización empleadas): https://github.com/ggml-org/llama.cpp
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados devueltos corresponden a perfiles profesionales y páginas de servicios contables sin relación con el repositorio.
