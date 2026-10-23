# JRamirez-UAB/hybridagent-8b-exl3-vllm-experimental

## Resumen

`JRamirez-UAB/hybridagent-8b-exl3-vllm-experimental` es una cuantización EXL3 (aproximadamente 5,0 bpw, variante H5) del modelo `togethercomputer/HybridAgent-8B-Agentic`, publicada por el usuario JRamirez-UAB. El backbone es `Qwen3-8B-Base`, un transformer denso, mientras que el módulo de razonamiento latente HybridLink (una MLP) se conserva en BF16 en el fichero `adapter.pt`. El modelo mantiene el comportamiento agéntico del original: pasos de razonamiento latente, intérprete de Python y búsqueda web sobre una única caché KV compartida por trayectoria.

El problema que aborda es de infraestructura, no de calidad: el motor nativo del modelo original emite pasos latentes que consumen una posición de caché KV pero generan cero tokens, algo que el model runner V2 estándar de vLLM no puede expresar. Esta publicación se acompaña de un fork de vLLM 0.30.0 (runner V1, modo eager) que desacopla posiciones KV de identificadores de token mediante `num_latent_computed`, más un backend EXL3 construido sobre OrcaSAQ2.

Su relevancia es doble: por un lado reduce la huella de memoria de aproximadamente 15,7 GB en BF16 a unos 5,98 GB y multiplica por 3,1 la concurrencia de caché KV en una única RTX 3090; por otro, es un artefacto estrictamente experimental, solo de pesos, que no funciona con `vllm serve` de serie y requiere el stack de servicio del autor, distribuido por separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (backbone Qwen3-8B-Base) con módulo MLP de razonamiento latente HybridLink |
| Parámetros totales | 2.989.139.072 según los tensores de safetensors (el nombre del repo indica 8B; véase Limitaciones) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | EXL3 a ~5,0 bpw (formato H5); adaptador HybridLink en BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors (`model.safetensors`, ~5,98 GB) + `adapter.pt` (PyTorch, BF16) |
| Modelo base | `togethercomputer/HybridAgent-8B-Agentic` |
| Backbone | Qwen3-8B-Base |
| Backend de cuantización | EXL3 sobre OrcaSAQ2 (plugin externo) |
| Tamaño del repositorio | 6,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-23 |
| Última actualización | 2026-10-23 |

Ficheros incluidos: `model.safetensors`, `adapter.pt`, `adapter_config.json`, `config.json`, `generation_config.json`, `quantization_config.json`, `chat_template.jinja`, `tokenizer.json`, `tokenizer_config.json`.

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del original: un backbone transformer denso Qwen3-8B-Base al que se añade HybridLink, una MLP que genera pasos de razonamiento latente. El motor `HybridGenerationEngine` ejecuta un bucle persistente de tipo texto / latente / alimentación en el que cada paso latente ocupa una posición en la caché KV sin producir tokens de salida, y esa caché se comparte a lo largo de toda la trayectoria del agente, incluidas las llamadas al intérprete de Python y a la búsqueda web. Esta publicación no reentrena nada: es una cuantización post-entrenamiento del backbone a EXL3 ~5,0 bpw y la conversión del adaptador HybridLink a BF16.

La innovación técnica relevante está en el stack de inferencia. El fork de vLLM 0.30.0 utiliza el runner V1 (`gpu_model_runner`) con modo eager y programación asíncrona desactivada, y desacopla las posiciones de caché KV de los identificadores de token mediante un contador `num_latent_computed` por petición, lo que permite representar los pasos de cero tokens. El backend de cuantización EXL3 se implementa sobre OrcaSAQ2 y se instala como plugin aparte. No se dispone de información sobre el volumen de tokens, la composición del dataset ni las fases de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat específica para uso agéntico (`chat_template.jinja`, obligatoria para tool use).
- Razonamiento latente: pasos internos que no emiten tokens y no aparecen en la salida de texto.
- Uso de herramientas (tool calling / function calling) integrado en el bucle de generación.
- Ejecución de código mediante intérprete de Python dentro de la trayectoria del agente.
- Búsqueda web como herramienta invocable durante la resolución de tareas.
- Razonamiento multi-paso con caché KV persistente y compartida por trayectoria, lo que evita recomputar el prefijo en cada turno.
- Compatibilidad declarada con Text Generation Inference y con endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`), supeditada al stack experimental.
- Idiomas: únicamente inglés según la model card.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito en formato textual.

## Casos de uso

- Agentes de resolución de incidencias con ejecución de código: el modelo puede alternar razonamiento latente con llamadas a un intérprete de Python y devolver un diagnóstico, aprovechando que la caché KV se mantiene entre pasos sin recomputar el contexto.
- Automatización de investigación con búsqueda web: dadas sus herramientas de búsqueda y su bucle multi-paso, encaja en pipelines que consultan fuentes, sintetizan y verifican antes de responder.
- Despliegue en GPU de consumo para pruebas de concepto: con ~5,98 GB de pesos cabe en una RTX 3090 y deja margen de VRAM para caché KV, algo inviable con la versión BF16 de 15,7 GB en el mismo hardware.
- Servicio multi-usuario de bajo coste: la concurrencia de caché KV 3,1 veces superior permite atender varias trayectorias simultáneas en una sola tarjeta, útil para entornos de evaluación o demos internas.
- Investigación sobre razonamiento latente: permite experimentar con pasos de cero tokens en vLLM sin partir del modelo en BF16, a costa de asumir el fork.
- Evaluación comparativa de cuantización: sirve para medir la degradación de comportamiento agéntico al pasar de BF16 a EXL3 5,0 bpw con el mismo motor y el mismo hardware.
- Orquestación de tareas con tool calling en pipelines internos: la plantilla de chat agéntica y la compatibilidad con endpoints permiten integrarlo en flujos tipo ReAct o similar, siempre sobre el stack del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos son de velocidad y memoria, sobre una única RTX 3090:

| Motor | Tokens de texto por segundo | Respuesta con carga latente alta | Memoria |
|---|---|---|---|
| `HybridGenerationEngine` oficial (transformers, BF16) | ~15–18 | ~69 s | ~15,7 GB |
| Fork vLLM, BF16 | ~32–34 | ~20 s | ~15,7 GB |
| Fork vLLM, EXL3 (este repositorio) | ~18–24 | ~27 s | ~5,98 GB, 3,1× concurrencia KV |

La cuantización EXL3 pierde aproximadamente un 30–40 % de throughput de texto frente al fork en BF16, pero reduce la memoria un 62 % y multiplica por 3,1 la concurrencia de caché KV. En respuestas con muchos pasos latentes, el fork en BF16 sigue siendo el más rápido (~20 s frente a ~27 s).

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,98 GB de pesos en EXL3, más la caché KV y el adaptador HybridLink en BF16. La versión BF16 del mismo modelo requiere ~15,7 GB.
- GPU probada: una única RTX 3090. Cabe en GPU de consumo con 24 GB; con 12–16 GB el margen para caché KV y contexto es reducido y no está documentado.
- GPU de datacenter (A100, H100) no documentadas en la información disponible; el fork está validado únicamente en el hardware citado.
- Despliegue: no es compatible con `vllm serve` de serie. Requiere vLLM 0.30.0 con los ficheros `vllm/v1/` del fork superpuestos en `site-packages`, el plugin EXL3 de OrcaSAQ2 instalado con `pip install -e`, los paquetes `backend`, `processor` y `orchestrator` de hybridagent, y las variables `VLLM_USE_V2_MODEL_RUNNER=0`, `async_scheduling=False`, `enforce_eager=True`. El arranque se hace con el orquestador en proceso (`serve.py`).
- No hay soporte documentado para llama.cpp, Ollama ni otros runtimes: el formato EXL3 y los pasos de cero tokens dependen del fork.
- Throughput medido: ~18–24 tokens/s de texto en EXL3; latencia de ~27 s en respuestas con carga latente alta. No se proporcionan datos de throughput agregado con lotes grandes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria en inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (EXL3, fork vLLM) | 2.989.139.072 según safetensors (8B nominal) | No disponible | ~5,98 GB | MIT | Pesos públicos; requiere fork y plugins externos |
| `togethercomputer/HybridAgent-8B-Agentic` (BF16) | 8B nominal | No disponible | ~15,7 GB | MIT | Pesos públicos; motor `HybridGenerationEngine` basado en transformers |
| `Qwen3-8B-Base` (backbone) | 8B nominal | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Público |

La comparación relevante es frente al original en BF16: misma arquitectura y comportamiento, con menos memoria y más concurrencia a cambio de menor throughput de texto y de la dependencia de un fork. Frente a Qwen3-8B-Base, la diferencia es funcional: el modelo base no incluye el módulo HybridLink ni el bucle agéntico con intérprete y búsqueda web.

## Limitaciones y advertencias

- Artefacto experimental y sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha.
- Solo pesos: el fork de vLLM y los scripts de servicio se distribuyen por separado, lo que dificulta la reproducibilidad.
- No funciona con `vllm serve` estándar ni con runtimes convencionales (llama.cpp, Ollama); exige superponer ficheros en `site-packages` y mantener un fork, con el coste de mantenimiento que implica.
- Discrepancia en el recuento de parámetros: los safetensors suman 2.989.139.072 tensores frente al "8B" nominal del nombre; el autor no documenta la causa en la información disponible.
- Solo inglés: no hay soporte multilingüe declarado.
- No hay benchmarks de calidad publicados, por lo que se desconoce la degradación introducida por la cuantización EXL3 a 5,0 bpw en tareas agénticas.
- Los pasos latentes consumen caché KV sin emitir tokens, lo que complica la contabilidad de uso, el facturado por token y la depuración de trazas.
- Riesgo de alucinación inherente a un modelo de 8B en tareas agénticas multi-paso, especialmente al encadenar resultados de búsqueda web e intérprete de Python; no se documentan evaluaciones de fiabilidad.
- Sesgos: no se proporciona ninguna evaluación de sesgos en la información disponible.
- Licencia MIT heredada del modelo base, permisiva para uso comercial, pero la licencia no cubre el fork de vLLM ni los plugins, cuyos términos no se detallan.
- Longitud de contexto no documentada: planificar el despliegue sin asumir la ventana del Qwen3 original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JRamirez-UAB/hybridagent-8b-exl3-vllm-experimental
- Modelo base: https://huggingface.co/togethercomputer/HybridAgent-8B-Agentic
- Colección "Experimental — HybridAgent on forked vLLM": https://huggingface.co/collections/JRamirez-UAB/experimental-hybridagent-on-forked-vllm-6adb2174fac67e93d6e34506
- Paper, blog o repositorio del fork: no disponible en la información proporcionada.
