# mradermacher/Kestrel-4B-Coder-GGUF

## Resumen

Kestrel-4B-Coder-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Jackrong/Kestrel-4B-Coder, realizadas por el cuantizador mradermacher. El modelo base es un modelo de generación de código de aproximadamente 4.300 millones de parámetros (4.326.350.848 según los safetensors), construido sobre la arquitectura Qwen3.5, entrenado mediante SFT, destilación y merge, con capacidades de razonamiento, generación de código, uso de herramientas y visión multimodal.

La relevancia de esta ficha radica en que las cuantizaciones GGUF permiten ejecutar el modelo localmente en hardware de consumo, desde portátiles con poca RAM hasta GPUs de gama media, gracias a versiones que van desde Q2_K (2,1 GB) hasta f16 (8,8 GB). Los tags del modelo indican soporte de multi-token prediction (MTP), decodificación especulativa, function calling y capacidades agentivas, lo que lo posiciona como una opción interesante para inferencia en el borde (edge computing) y on-device.

El cuantizador también publica versiones imatrix/weighted en un repositorio complementario, que suelen ofrecer mejor calidad a igual tamaño que las cuantizaciones estáticas. El repositorio acumula 1.345 descargas y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, según tags del modelo base) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no hay evidencia de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh, ko, ja, ru, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base, Jackrong/Kestrel-4B-Coder, se basa en la arquitectura Qwen3.5 según los tags del repositorio. Los metadatos indican que fue entrenado mediante SFT (supervised fine-tuning), destilación (distillation) y procesos de merge, con especialización en generación de código y razonamiento. Los tags incluyen mtp (multi-token prediction) y speculative-decoding, lo que sugiere que el modelo incorpora mecanismos para acelerar la inferencia mediante predicción de múltiples tokens, aunque el model card no detalla la implementación concreta.

El repositorio de mradermacher no añade entrenamiento: se limita a convertir los pesos originales en safetensors a GGUF mediante cuantización estática de k-quants (y un quant IQ4_XS). Incluye además archivos mmproj (multimodal projector) en Q8_0 y f16, necesarios para las capacidades de visión en llama.cpp. No hay información publicada sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de código: especialización principal del modelo (tags code-generation, coder).
- Razonamiento: tags de reasoning y distillation sugieren capacidades de razonamiento entrenadas por destilación.
- Tool calling / function calling: soporte indicado en los tags del modelo.
- Capacidades agentivas: tags agent y multi-step reasoning para flujos de trabajo con múltiples pasos.
- Visión multimodal: presencia de archivos mmproj en el repo indica soporte de entrada de imágenes vía llama.cpp.
- Multilingüe: inglés, chino, coreano, japonés, ruso y español.
- Inferencia local acelerada: soporte de multi-token prediction y decodificación especulativa según tags.
- Formato conversacional: el modelo está etiquetado como conversational.

## Casos de uso

- Asistente de programación local: con la versión Q4_K_M (2,9 GB) cabe en portátiles sin GPU dedicada, permitiendo autocompletado y generación de código sin enviar código propietario a la nube.
- Agents de código en CLI: el soporte de function calling y tool use permite integrarlo en herramientas tipo agente de terminal para tareas de refactorización o ejecución de comandos.
- Análisis de capturas y diagramas: gracias a los archivos mmproj, se puede consultar al modelo sobre capturas de pantalla de interfaces, errores visuales o diagramas de arquitectura desde llama.cpp.
- Documentación técnica multilingüe: soporte de chino, japonés, coreano, ruso, inglés y español, útil para equipos que generan o traducen documentación de código.
- Despliegue en el borde (edge computing): los tags edge-computing y on-device apuntan a su uso en dispositivos con recursos limitados, como servidores domésticos o mini PCs.
- Pipelines de CI/CD: puede integrarse en revisión automática de pull requests, generación de mensajes de commit y detección de issues en código, ejecutándose en runners con GPU modesta.
- Prototipado de chatbots con herramientas: el formato conversacional y el soporte de agentes facilitan crear prototipos de asistentes que consultan APIs locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (solo pesos, sin KV cache):
  - Q2_K: ~2,1 GB
  - Q4_K_M: ~2,9 GB
  - Q6_K: ~3,7 GB
  - Q8_0: ~4,7 GB
  - f16: ~8,8 GB
  - Sumar ~0,5-0,8 GB si se usa el projector multimodal (mmproj).
- GPU recomendadas: cualquier GPU moderna con 4-6 GB de VRAM ejecuta cómodamente Q4_K_M a Q6_K; para f16 conviene una RTX 3090/4090 o superior. Al ser GGUF, también funciona en CPU puro con RAM suficiente.
- Consumer GPUs: cabe sin problemas en RTX 3060 de 12 GB, RTX 4060 Ti, e incluso en GPUs de 4 GB con Q3/Q4. En CPU, un equipo con 8-16 GB de RAM es suficiente para la mayoría de cuants.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers o vLLM.
- Latencia y throughput: no disponible. Los tags sugieren soporte de multi-token prediction y decodificación especulativa que acelerarían la generación, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Capacidades destacadas | Licencia |
|---|---|---|---|---|
| Kestrel-4B-Coder | 4,33 B | safetensors / GGUF | Codigo, razonamiento, vision, tool calling, MTP | Apache 2.0 |
| Qwen2.5-Coder-3B | 3 B | safetensors / GGUF | Codigo, FIM, multilingue | Apache 2.0 (algunos variantes) |
| Qwen2.5-Coder-7B | 7 B | safetensors / GGUF | Codigo, mayor rendimiento, contexto largo | Apache 2.0 |
| DeepSeek-Coder-V2-Lite (16B MoE) | 16 B (2,4 B activos) | safetensors / GGUF | Codigo, MoE, alto throughput | Licencia propia (uso restringido) |

Kestrel-4B-Coder se situa en el segmento de modelos de codigo pequenos (3-4 B) orientados a inferencia local, compitiendo con Qwen2.5-Coder-3B en tamano, pero anadiendo capacidades multimodales y de agente que los modelos de codigo puros de su clase no ofrecen. Frente a Qwen2.5-Coder-7B sacrifica rendimiento potencial a cambio de la mitad de requisitos de memoria.

## Limitaciones y advertencias

- No hay benchmarks publicados ni en el modelo base ni en las cuantizaciones, por lo que su rendimiento real frente a alternativas debe validarse empíricamente.
- La longitud de contexto no está documentada; es un dato crítico para tareas de código con archivos largos y debe verificarse antes de producción.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S/M) degradan notablemente la calidad, especialmente en generación de código y razonamiento; el propio autor marca Q3_K_M como "lower quality".
- Las cuantizaciones estáticas suelen ser inferiores a las versiones imatrix disponibles en el repo complementario Kestrel-4B-Coder-i1-GGUF.
- El modelo es un merge/SFT con destilación: los merges pueden heredar sesgos y licencias de los modelos origen; solo se documenta la licencia final Apache 2.0.
- Riesgo de alucinación estándar de LLM: puede generar código plausible pero incorrecto o inseguro; requiere revisión humana o tests automatizados en producción.
- La capacidad multimodal depende de los archivos mmproj y del soporte del runtime; no todos los frontends GGUF la exponen.
- Español está entre los idiomas soportados, pero al ser un modelo centrado en código con base Qwen3.5, la calidad en castellano para tareas generales no está documentada.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Kestrel-4B-Coder-GGUF
- Modelo base: https://huggingface.co/Jackrong/Kestrel-4B-Coder
- Cuants imatrix/weighted: https://huggingface.co/mradermacher/Kestrel-4B-Coder-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Kestrel-4B-Coder-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuants de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
