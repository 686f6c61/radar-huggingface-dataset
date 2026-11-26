# mradermacher/Aletheia-1.0-GGUF

## Resumen

Aletheia-1.0 es un modelo de lenguaje conversacional de aproximadamente 1.170 millones de parametros, desarrollado originalmente por Openwist y distribuido en formato GGUF por mradermacher. El modelo parte de una base afinada mediante LoRA y fusionada (merged), orientada a despliegue en dispositivo (on-device) y conversacion en ingles. Esta ficha documenta concretamente la version cuantizada GGUF, que es la unica publicacion disponible en el repositorio de mradermacher.

La relevancia de esta publicacion radica en su empaquetado: mradermacher ofrece doce variantes de cuantizacion estatica que van desde Q2_K (0,6 GB) hasta f16 (2,4 GB), lo que permite ejecutar el modelo en hardware de consumo modesto mediante llama.cpp u otros runners compatibles con GGUF. El modelo base declara licencia lfm1.0 (Liquid Foundation Model license), lo que condiciona el uso comercial.

No se dispone de informacion publica sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada. La model card del repositorio GGUF es exclusivamente tecnica sobre el proceso de cuantizacion y no documenta capacidades del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, inferido por el formato de pesos; no confirmado en la informacion) |
| Parametros totales | 1.170.340.608 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | lfm1.0 (Liquid Foundation Model license) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Openwist/Aletheia-1.0. Los tags del repositorio indican que se trata de un modelo afinado mediante LoRA y posteriormente fusionado (merged), con orientacion a despliegue on-device. El recuento de parametros (1.170 millones) situa al modelo en la categoria de pequenos modelos de lenguaje, coherente con su uso en dispositivo.

No se han publicado en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas. El proceso de cuantizacion aplicado por mradermacher es estatico (quantize_version 2, output_tensor_quantised 1) y no incluye cuantizaciones ponderadas por imatrix, que el autor senala como no disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, segun la orientacion declarada del modelo base.
- Afinado mediante LoRA fusionada, lo que sugiere especializacion en el dominio del dataset de ajuste (no documentado).
- Despliegue on-device: el tag `on-device` indica optimizacion para ejecucion local en hardware limitado.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite su despliegue en infraestructuras de inferencia compatibles con Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido (thinking mode) en la informacion disponible.
- Capacidades multilingues: solo se declara ingles; no se confirma soporte de otros idiomas.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede ejecutarse en un portatil o mini-PC mediante llama.cpp con la cuantizacion Q4_K_M (0,8 GB), ofreciendo respuestas conversacionales sin conexion a internet ni dependencia de APIs externas.
- Prototipado rapido de chatbots: con un peso de 0,6-0,8 GB en Q2_K o Q4_K_S, es viable iterar sobre prompts y flujos conversacionales en entornos de desarrollo con recursos limitados.
- Inferencia en dispositivos edge: el tag `on-device` y el tamano reducido permiten desplegar el modelo en dispositivos con poca memoria (Raspberry Pi, mini-PC, moviles de gama alta con runners GGUF), para tareas de clasificacion o generacion de texto breve.
- Educacion e investigacion: sirve como caso de estudio de un pipeline completo de afinado LoRA + fusion + cuantizacion GGUF, util para quienes quieran replicar el flujo con sus propios datos.
- Generacion de texto en pipelines offline: integrable en scripts de procesamiento por lotes donde no se requiere conexion a servicios en la nube y el volumen de texto es moderado.
- Pruebas de cuantizacion y evaluacion de calidad: las doce variantes permiten comparar el impacto de la cuantizacion (Q2_K frente a Q8_0) en la perplejidad y calidad de salida sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 0,6 GB (Q2_K) y 2,4 GB (f16) para los pesos; anadir margen para el contexto KV cache (dependiente de la longitud de contexto, no disponible).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre para las cuantizaciones bajas; RTX 3060, RTX 4060 o superiores para las cuantizaciones altas con contexto extendido.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas (GTX 1650 en adelante) e incluso en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama (previa conversion o importacion del GGUF), y runners compatibles con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base (contexto, arquitectura) que permitan una comparacion rigurosa con alternativas. La siguiente tabla recoge solo los datos verificables del modelo frente a la ausencia de datos de los comparables.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| Aletheia-1.0 (GGUF) | 1.170 M | no disponible | lfm1.0 | GGUF | no disponible |
| Alternativas de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la informacion proporcionada modelos comparables de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad; se desconoce el riesgo de alucinacion y de contenido danino.
- La licencia lfm1.0 (Liquid Foundation Model license) impone restricciones que deben revisarse antes de cualquier uso comercial; no es una licencia permisiva tipo Apache 2.0 o MIT.
- La longitud de contexto no esta documentada, lo que impide planificar aplicaciones que requieran ventanas largas.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S o Q4_K_M para un equilibrio velocidad/calidad.
- No hay cuantizaciones ponderadas por imatrix disponibles, lo que limita la calidad de las cuantizaciones bajas frente a alternativas con calibracion.
- El modelo base es un afinado LoRA fusionado sobre una base no identificada en la informacion; su procedencia y calidad original no estan verificadas.
- El repositorio tiene un numero muy bajo de descargas (479) y likes (1), lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Aletheia-1.0-GGUF
- Modelo base: https://huggingface.co/Openwist/Aletheia-1.0
- Pagina de descargas del autor: https://hf.tst.eu/model#Aletheia-1.0-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
