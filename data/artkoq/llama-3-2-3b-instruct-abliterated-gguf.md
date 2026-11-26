# Artkoq/Llama-3.2-3B-Instruct-abliterated-GGUF

## Resumen

Artkoq/Llama-3.2-3B-Instruct-abliterated-GGUF es una distribucion en formato GGUF de la version "abliterated" (sin censura) del modelo Llama-3.2-3B-Instruct de Meta. El modelo original fue publicado por huihui-ai, que aplico la tecnica de abliteration sobre los pesos de Llama 3.2 3B Instruct para eliminar el comportamiento de rechazo ante ciertas peticiones. Artkoq se limita a empaquetar esos pesos en cuantizaciones GGUF generadas con llama.cpp, lo que permite ejecutar el modelo en CPU o GPU de gama baja mediante herramientas como llama.cpp, Ollama o LM Studio.

El modelo conserva la arquitectura y el tamano del original: 3.212.749.888 parametros (aproximadamente 3,2 mil millones), lo que lo situa en la categoria de modelos pequenos orientados a inferencia local. La modificacion respecto al modelo de Meta es exclusivamente de alineamiento: no hay cambios en la arquitectura, el tokenizador ni el entrenamiento base, solo una edicion de direcciones de activacion en el espacio latente para suprimir la tendencia al rechazo.

Su relevancia actual es practica: ofrece un modelo de 3B con contexto de 128.000 tokens (heredado de Llama 3.2) en un formato listo para desplegar en hardware modesto, sin las restricciones de comportamiento del modelo oficial. Es un artefacto de interes para investigacion sobre alineamiento, generacion creativa sin filtros y experimentacion con tecnicas de abliteration, no tanto para produccion con requisitos de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), con abliteration aplicada sobre los pesos |
| Parametros totales | 3.212.749.888 (3,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.2 3B Instruct; no confirmado en la model card de este repo) |
| Tipos de cuantizacion | GGUF (multiples niveles generados con llama.cpp; la model card no detalla la lista exacta) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Llama 3.2 soporta oficialmente 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF (repo de 29,7 GB con varias cuantizaciones) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B Instruct: un transformer decoder-only con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, entrenado por Meta sobre datos propietarios no detallados publicamente. El pipeline de alineamiento original incluye SFT y RLHF con DPO, segun la documentacion de Meta para la familia Llama 3.2.

La innovacion de esta variante es la abliteration: una tecnica que identifica la direccion de activacion asociada al comportamiento de rechazo (calculada como la diferencia media entre activaciones ante prompts daninos y prompts inocuos) y la proyecta fuera de las matrices de pesos de las capas. El resultado es un modelo con capacidades practicamente identicas al original pero sin el sesgo de negarse a responder. Los autores no publican el numero de tokens adicionales ni datos de entrenamiento nuevos, porque no hay reentrenamiento: solo edicion de pesos. La cuantizacion GGUF la realiza Artkoq (o QuantFactory, segun la model card heredada) con llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat de Llama 3.2.
- Razonamiento basico y respuesta a preguntas sobre conocimiento general (limitado por el tamano de 3B).
- Generacion de codigo en lenguajes comunes, aunque con menor calidad que modelos mayores.
- Matematicas simples y aritmetica; no es fiable en problemas de varios pasos.
- Soporte de tool calling / function calling heredado del formato de Llama 3.2 Instruct (no verificado en esta variante).
- Capacidad multilingue limitada a los idiomas del modelo base (no confirmada en esta ficha).
- Ausencia de rechazo ante peticiones que el modelo original declinaria (comportamiento "uncensored").
- No dispone de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: permite estudiar como la abliteration afecta a la distribucion de respuestas y comparar con el modelo original en tareas controladas.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o dialogos con tematicas adultas o controvertidas que el modelo oficial rechazaria.
- Prototipado local en equipos sin GPU dedicada: al ser un GGUF de 3B, se puede ejecutar en CPU con llama.cpp o en portatiles con 8-16 GB de RAM.
- Asistentes personales offline: despliegue con Ollama o LM Studio para tareas de resumen, reescritura y chat sin enviar datos a la nube.
- Evaluacion comparativa de cuantizaciones: el repo incluye varios niveles GGUF, util para medir la degradacion de calidad segun el bitrate.
- Red teaming y pruebas de robustez: generar respuestas a prompts adversarios para evaluar filtros y clasificadores de seguridad en un pipeline propio.
- Educacion y demostraciones: ejemplo didactico de como funciona la abliteration sobre un modelo pequeno y facil de inspeccionar.

## Benchmarks y rendimiento

Datos publicados en la model card original (huihui-ai), re-evaluados como media de cada test:

| Benchmark | Llama-3.2-3B-Instruct | Llama-3.2-3B-Instruct-abliterated |
|---|---|---|
| IF_Eval | 76,55 | 76,76 |
| MMLU Pro | 27,88 | 28,00 |
| TruthfulQA | 50,55 | 50,73 |
| BBH | 41,81 | 41,86 |
| GPQA | 28,39 | 28,41 |

Las diferencias son marginales (inferiores a 0,3 puntos en todos los casos), lo que sugiere que la abliteration no degrada de forma apreciable las capacidades medidas. No se han publicado benchmarks especificos de las cuantizaciones GGUF de Artkoq en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 2 y 3 GB para cuantizaciones Q4_K_M, entre 4 y 5 GB para Q8_0, y alrededor de 6,5 GB para FP16.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). En GPUs profesionales el modelo ocupa una fraccion minima de memoria.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 6 GB o mas; tambien en CPU con 8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF), TGI (con conversion a safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada; en una RTX 4090 se espera un throughput de cientos de tokens por segundo, pero no hay medicion oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Artkoq/Llama-3.2-3B-Instruct-abliterated-GGUF | 3,2B | 128K (heredado) | llama3.2 | GGUF | Variante sin censura, cuantizada |
| huihui-ai/Llama-3.2-3B-Instruct-abliterated | 3,2B | 128K | llama3.2 | safetensors | Modelo fuente de esta cuantizacion |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 128K | llama3.2 | safetensors | Original con alineamiento estandar |
| Qwen2.5-3B-Instruct | 3,1B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa con licencia mas permisiva |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors, GGUF | Alternativa de Microsoft, mas permisiva |

## Limitaciones y advertencias

- La abliteration elimina el rechazo pero no garantiza precision: el modelo puede generar contenido falso, danino o ilegal con la misma confianza que contenido correcto.
- Riesgo elevado de alucinacion por el tamano reducido (3B) y por la perdida de la capa de alineamiento que en el original actua como filtro parcial.
- Sesgos heredados del corpus de entrenamiento de Llama 3.2, sin mitigacion adicional; la abliteration puede amplificar sesgos al eliminar respuestas de rechazo.
- La licencia Llama 3.2 Community License impone restricciones: uso comercial permitido con condiciones (menos de 700 millones de usuarios mensuales, atribucion, nombre del modelo en la interfaz) y prohibiciones especificas de uso.
- El modelo no debe desplegarse en produccion orientada al publico sin una capa de moderacion externa.
- La informacion sobre idiomas y cuantizaciones disponibles no esta detallada en la model card; conviene inspeccionar los archivos del repo antes de desplegar.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Artkoq/Llama-3.2-3B-Instruct-abliterated-GGUF
- Modelo fuente (huihui-ai): https://huggingface.co/huihui-ai/Llama-3.2-3B-Instruct-abliterated
- Modelo base (Meta): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Articulo sobre abliteration (Maxime Labonne): https://huggingface.co/blog/mlabonne/abliteration
- Script de evaluacion del modelo fuente: https://huggingface.co/huihui-ai/Llama-3.2-3B-Instruct-abliterated/blob/main/eval.sh
- Perfil de FailSpy (tecnica original): https://huggingface.co/failspy
- QuantFactory: https://hf.co/QuantFactory
