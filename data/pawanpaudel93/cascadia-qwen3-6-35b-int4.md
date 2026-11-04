# pawanpaudel93/cascadia-qwen3.6-35b-int4

## Resumen

Cascadia Qwen3.6-35B-A3B int4 es un artefacto de inferencia pre-exportado para el motor Cascadia, derivado del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 35 000 millones de parametros totales y 3000 millones de parametros activos por token, distribuido en 40 capas. El autor del repositorio, pawanpaudel93, ha empaquetado los pesos en formato OpenVINO IR cuantizados a int4 y los ha dividido en dos etapas de pipeline paralelo, de modo que dos nodos puedan servir conjuntamente el modelo completo.

La relevancia de este repositorio es fundamentalmente operativa: no es un modelo nuevo ni un fine-tuning, sino un artefacto de despliegue reproducible con checksums verificables. Esto permite a equipos con infraestructura distribuida modesta (dos nodos) ejecutar un MoE de 35B en int4 sin necesidad de reexportar ni recuantizar. El repositorio ocupa 20,5 GB y la etapa 0 pesa aproximadamente 9,6 GB, mientras que la etapa 1 ronda los 10,95 GB.

Es importante subrayar que estos shards no son cargables directamente por `transformers` ni por OpenVINO GenAI: requieren el motor `qwen36-moe` de Cascadia y un reparto de capas fijado en el momento de la exportacion. Cualquier evaluacion de calidad debe hacerse contra el modelo base, ya que la cuantizacion int4 es con perdida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), 40 capas |
| Parametros totales | 35 000 millones (35B) |
| Parametros activos | 3000 millones (3B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (unico preset publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`), dividido en 2 etapas de pipeline |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.6-35B-A3B, un transformer con capas MoE: 35B parametros totales con 3B activos por token, lo que reduce el coste computacional por token a costa de mantener una huella de memoria de 35B. El repositorio distribuido aqui no aporta informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si hubo fases de RLHF o DPO; esos detalles corresponden a la model card del modelo base y no estan incluidos en la informacion disponible.

La innovacion tecnica de este artefacto es el particionado: las 40 capas se dividen en dos etapas fijas (stage0 para el rango 0, stage1 para el rango 1 con la LM head), y las embeddings de texto se asignan exclusivamente al rango 0. El fichero `manifest.json` documenta los rangos de capas, entradas y variables de estado; `cascadia.json` en la raiz actua como indice legible por maquina con tamanos y checksums. Los ficheros `config.json`, `generation_config.json`, `tokenizer.json` y `openvino_text_embeddings_model.bin` son byte-identicos a los del export oficial `OpenVINO/Qwen3.6-35B-A3B-int4-ov`.

## Capacidades

- Generacion de texto autoregresiva mediante el motor `qwen36-moe` de Cascadia.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.6-35B-A3B (no verificados de forma independiente en este artefacto).
- Soporte de plantilla de chat mediante `chat_template.jinja` incluida en el repositorio.
- Ejecucion distribuida en pipeline paralelo de 2 etapas sobre dos nodos.
- Tool calling, capacidades de agente, vision, audio y modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue distribuido en dos nodos: el caso de uso principal del artefacto. Dos maquinas con aproximadamente 10-11 GB de pesos cada una pueden servir un MoE de 35B en int4, algo inviable en un solo nodo de gama media.
- Laboratorios con GPUs heterogeneas: al fijarse el reparto de capas en la exportacion, se puede asignar la etapa con LM head (stage1, ~10,95 GB) al nodo con mas memoria y la etapa 0 (~9,6 GB) al nodo mas limitado.
- Reproducibilidad y auditoria: los checksums sha256 de cada archivo de origen permiten verificar la integridad de los pesos antes de desplegarlos en produccion.
- Evaluacion de cuantizacion int4 sobre MoE: util para medir la degradacion de calidad frente al modelo base en tareas concretas antes de adoptar int4 en produccion.
- Prototipado de motores de inferencia alternativos: sirve como banco de pruebas para el motor Cascadia y su gestor de flota, que descarga los shards por rango.
- Inferencia en entornos con restricciones de red: al requerir rutas locales y no IDs de Hugging Face, encaja en despliegues air-gapped donde los pesos se transfieren manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9,6 GB para la etapa 0 y 10,95 GB para la etapa 1, mas overhead de activaciones y KV cache no cuantificado en la informacion disponible.
- Dos nodos son obligatorios: el reparto de capas esta fijado en la exportacion y no admite configuraciones de 1 o 3 etapas.
- GPU recomendadas: no disponibles en la informacion proporcionada; el formato OpenVINO IR sugiere hardware Intel (CPU, iGPU o GPU Arc), pero no se confirma.
- Cabe en GPU de consumo: probablemente si, dado que cada etapa ronda los 10-11 GB, pero no hay confirmacion oficial en la informacion disponible.
- Opciones de despliegue: exclusivamente el motor `qwen36-moe` de Cascadia con su gestor de flota. No es compatible con vLLM, llama.cpp, Ollama, TGI ni OpenVINO GenAI tal cual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Cascadia Qwen3.6-35B-A3B int4 | 35B | 3B | no disponible | OpenVINO IR, 2 etapas | Apache-2.0 | Solo motor Cascadia, pipeline de 2 nodos |
| Qwen/Qwen3.6-35B-A3B | 35B | 3B | no disponible | safetensors (presumible) | Apache-2.0 | Modelo base, sin cuantizar |
| OpenVINO/Qwen3.6-35B-A3B-int4-ov | 35B | 3B | no disponible | OpenVINO IR | Apache-2.0 | Export int4 de un solo nodo, sin particionar |

## Limitaciones y advertencias

- La cuantizacion int4 es con perdida; el propio autor recomienda comparar contra el modelo base en tareas sensibles a la calidad en lugar de asumir paridad.
- El artefacto no es cargable por `transformers` ni por OpenVINO GenAI: solo funciona con el motor `qwen36-moe` de Cascadia, lo que limita su portabilidad.
- El reparto en 2 etapas es fijo; no se puede reconfigurar a 1 o 3 nodos sin reexportar.
- Los workers requieren rutas locales, nunca IDs de Hugging Face, lo que complica el despliegue automatizado estandar.
- No hay informacion sobre sesgos, idiomas soportados, longitud de contexto ni comportamiento de alucinacion en la informacion proporcionada.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; no obstante, al ser una obra derivada, conviene conservar la copia de la licencia incluida en el repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pawanpaudel93/cascadia-qwen3.6-35b-int4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Export int4 oficial de OpenVINO: https://huggingface.co/OpenVINO/Qwen3.6-35B-A3B-int4-ov
- Repositorio del motor Cascadia: https://github.com/labscommunity/cascadia
