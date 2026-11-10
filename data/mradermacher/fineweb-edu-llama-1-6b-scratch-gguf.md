# mradermacher/fineweb-edu-llama-1.6b-scratch-GGUF

## Resumen

`mradermacher/fineweb-edu-llama-1.6b-scratch-GGUF` es una publicacion de cuantizaciones estaticas en formato GGUF del modelo `hanseungwook/fineweb-edu-llama-1.6b-scratch`. El autor de esta ficha (mradermacher) es un conocido generador de cuantizaciones de la comunidad, no el desarrollador original del modelo. La model card no aporta informacion sobre el entrenamiento, la arquitectura interna ni los datos de preentrenamiento mas alla del nombre del modelo base.

El nombre del modelo base sugiere un transformer tipo Llama con aproximadamente 1.600 millones de parametros, entrenado desde cero (scratch) sobre el dataset FineWeb-Edu. No obstante, esta informacion no esta confirmada en la documentacion proporcionada y debe tratarse como inferencia a partir de la nomenclatura, no como dato verificado.

La relevancia de esta ficha es limitada: se trata de un artefacto de cuantizacion sin metricas publicadas, sin licencia declarada y sin benchmarks. Resulta util unicamente para quien quiera ejecutar el modelo base en hardware modesto mediante llama.cpp u otros motores compatibles con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere transformer tipo Llama) |
| Parametros totales | aproximadamente 1.6B (segun nomenclatura; no confirmado) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en la documentacion proporcionada. El identificador `llama-1.6b` sugiere una arquitectura decoder-only de la familia Llama con aproximadamente 1.600 millones de parametros, y el sufijo `scratch` indica un entrenamiento desde cero, presumiblemente sobre el corpus FineWeb-Edu. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de ajuste fino supervisado, RLHF o DPO.

La unica informacion tecnica verificable corresponde al proceso de cuantizacion: la model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que las cuantizaciones se generaron a partir de pesos en formato Hugging Face mediante la herramienta de cuantizacion estandar de llama.cpp. Se ofrecen trece variantes de cuantizacion, desde Q2_K hasta F16, incluyendo la variante IQ4_XS de cuantizacion con importancia.

## Capacidades

- Generacion de texto autoregresiva, segun la arquitectura inferida del modelo base.
- No se documentan capacidades de razonamiento avanzado, codigo o matematicas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- No se documentan capacidades especiales (modo thinking, vision, audio).
- Al ser un modelo entrenado desde cero sobre un corpus educativo web, es probable que su competencia en tareas instructivas sea limitada, aunque esto no esta confirmado en la documentacion.

## Casos de uso

- Experimentacion academica con modelos pequenos: util para reproducir experimentos de preentrenamiento desde cero sobre FineWeb-Edu en entornos con recursos limitados, usando las cuantizaciones Q4_K_M o Q5_K_M para reducir requisitos de memoria.
- Inferencia en CPU y hardware de gama baja: las variantes Q2_K a Q4_K_S permiten ejecutar el modelo en equipos sin GPU dedicada mediante llama.cpp, con un consumo de RAM estimado en torno a 1-3 GB segun la cuantizacion.
- Evaluacion comparativa de tecnicas de cuantizacion: el conjunto de trece variantes permite medir el impacto de la cuantizacion en perplejidad y calidad de generacion sobre un mismo modelo base.
- Prototipado de pipelines de generacion de texto: sirve como modelo de pruebas para validar integraciones con llama.cpp, Ollama o servidores compatibles con la API de OpenAI antes de migrar a modelos mayores.
- Investigacion sobre sesgos en corpus web: al estar entrenado presumiblemente sobre FineWeb-Edu, puede usarse para estudiar que sesgos y conocimientos adquiere un modelo pequeno a partir de datos web filtrados por criterios educativos.
- Fine-tuning posterior sobre dominios especificos: las cuantizaciones F16 y Q8_0 permiten servir como base para experimentos de ajuste fino con recursos moderados, aunque para entrenamiento conviene partir de los pesos originales en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (modelo de aproximadamente 1.6B parametros):
  - Q2_K: en torno a 0.7-0.9 GB.
  - Q4_K_M: en torno a 1.0-1.2 GB.
  - Q8_0: en torno a 1.7-1.9 GB.
  - F16: en torno a 3.2-3.4 GB.
  - Estas cifras son estimaciones basadas en el tamano del modelo; no estan publicadas en la model card.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones de 4 bits con offload completo; una RTX 3060, RTX 4060 o superior permite cargar la variante F16 sin problemas. GPU de datacenter (A100, H100) no son necesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF como llama-cpp-python o llama.cpp server. vLLM y TGI no soportan GGUF de forma nativa para este caso de uso.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fineweb-edu-llama-1.6b-scratch (este) | aprox. 1.6B | no disponible | no disponible | GGUF (base en HF) | Entrenado desde cero sobre FineWeb-Edu; sin benchmarks |
| TinyLlama-1.1B | 1.1B | 2048 tokens | Apache 2.0 | safetensors, GGUF | Entrenado sobre 3T tokens; benchmarks publicos |
| Qwen2.5-1.5B | 1.5B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Multilingue, con benchmarks publicos y variantes instruct |
| SmolLM2-1.7B | 1.7B | 8192 tokens | Apache 2.0 | safetensors, GGUF | Entrenado sobre 11T tokens; benchmarks publicos |

La comparativa se ofrece como referencia de categoria; los datos de los modelos alternativos provienen de sus respectivas model cards publicas. El modelo de esta ficha no dispone de metricas que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad de generacion, perplejidad o rendimiento en tareas estandar.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor del modelo base antes de cualquier despliegue en produccion.
- Modelo entrenado desde cero: es probable que no siga instrucciones ni mantenga conversaciones coherentes sin un ajuste fino posterior, aunque esto no esta confirmado.
- Riesgo de alucinacion: alto en modelos pequenos preentrenados sin alineacion; no se ha aplicado presumiblemente RLHF ni DPO.
- Sesgos: al entrenarse presumiblemente sobre corpus web, puede reproducir sesgos presentes en FineWeb-Edu; no se documenta ninguna mitigacion.
- Limitaciones de contexto e idioma: no documentadas; el modelo base podria tener una ventana de contexto corta (tipica de configuraciones Llama pequenas) y un soporte multilingue limitado.
- Artefacto de cuantizacion: esta ficha describe una publicacion derivada, no el modelo original; para informacion autoritativa debe consultarse el repositorio `hanseungwook/fineweb-edu-llama-1.6b-scratch`.
- Sin soporte del autor: cero descargas y cero likes en el momento de la consulta; no hay comunidad ni mantenimiento documentado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/fineweb-edu-llama-1.6b-scratch-GGUF
- Modelo base: https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-scratch
- Dataset FineWeb-Edu (referencia): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- llama.cpp (motor de inferencia GGUF): https://github.com/ggerganov/llama.cpp
