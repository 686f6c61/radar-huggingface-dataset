# LucianoM39/Chronos-DX

## Resumen

Chronos DX es una familia de modelos de generación de texto presentada por el autor LucianoM39 (con repositorios asociados bajo la organización Flushnet AI en HuggingFace). El modelo se posiciona como una solución orientada a producción que cubre dos modos de despliegue complementarios: inferencia local/privada (incluyendo ejecución en navegador) y despliegue en nube con alta escalabilidad. La model card describe clases de tamaño que van desde 8B hasta 80B parámetros, aunque el único artefacto con pesos descargables referenciado es la variante densa de 32B en formato GGUF.

La información técnica publicada es escasa: no se detallan la arquitectura interna, la composición del dataset de entrenamiento, el número de tokens procesados ni los resultados de benchmarks. La model card se centra en los servicios de personalización (fine-tuning, LoRA/QLoRA, especialización de dominio, integración RAG) y en las opciones de despliegue, más que en las características técnicas verificables del modelo. El repositorio principal `LucianoM39/Chronos-DX` registra 0 descargas y 1 like en el momento de la consulta, lo que sugiere una distribución muy incipiente.

Por tanto, esta ficha debe leerse con cautela: los datos disponibles permiten describir la propuesta comercial y el ecosistema declarado, pero no validar empíricamente el rendimiento ni las capacidades reales del modelo. Los idiomas declarados son inglés e italiano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica transformer, MoE ni híbrida) |
| Parametros totales | 32,085B en la variante densa 32B (única con pesos publicados); familia declarada de 8B a 80B |
| Parametros activos | no aplica (la variante documentada es densa, ~32B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF y "artefactos cuantizados soportados" (sin detallar niveles Q4, Q5, Q8, etc.) |
| Idiomas soportados | inglés (en), italiano (it) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio `FlushnetAI/Chronos-DX-Dense-32B-GGUF`); el repositorio principal no declara formato de pesos |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura del modelo. La única referencia técnica concreta es que la variante 32B es un modelo denso ("Dense 32B"), con 32.085B parámetros totales y aproximadamente 32B activos, lo que descarta que se trate de una arquitectura Mixture of Experts. No se indica si emplea atención estándar, atención lineal, decodificación especulativa ni ninguna otra innovación de inferencia.

Respecto al entrenamiento, no se publican el número de tokens, la composición del corpus, la proporción de datos sintéticos ni si se aplicaron fases de RLHF, DPO o ajuste supervisado sobre el modelo base. La model card menciona servicios de fine-tuning (SFT, LoRA/QLoRA), generación de datasets sintéticos, evaluación y fusión de modelos, pero como oferta de personalización para clientes, no como descripción del proceso de entrenamiento del modelo publicado. Tampoco se identifica el modelo base sobre el que se habría construido Chronos DX.

## Capacidades

- Generación de texto general e instrucciones (instruction following), según declara el autor.
- Asistencia en programación e ingeniería de software.
- Tareas de infraestructura y automatización cloud.
- Salidas estructuradas (structured outputs).
- Carga de trabajo multilingüe limitada a inglés e italiano.
- Inferencia local y privada, incluida una demo comprimida que se ejecuta en el navegador.
- Despliegue en nube con alta concurrencia y autoescalado.
- Adaptación por cliente mediante fine-tuning supervisado, LoRA y QLoRA.
- Integración con bases de conocimiento (RAG) como servicio ofrecido.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistencia a la programación en entornos con requisitos de privacidad: la variante GGUF de 32B puede ejecutarse en estaciones de trabajo controladas por el cliente, de modo que el código fuente no abandona la infraestructura propia; adecuado para equipos con políticas estrictas de confidencialidad.
- Automatización de infraestructura y cloud: el modelo declara capacidades orientadas a tareas de infraestructura, por lo que puede emplearse para redactar y revisar scripts de aprovisionamiento, plantillas de infraestructura como código o documentación operativa, siempre con revisión humana dado que no hay benchmarks publicados.
- Asistentes de conocimiento empresarial con RAG: la model card ofrece explícitamente integración con bases de conocimiento, de forma que el modelo puede conectarse a un índice vectorial interno para responder consultas sobre documentación corporativa en inglés o italiano.
- Extracción de información estructurada: gracias a la capacidad declarada de salidas estructuradas, puede emplearse para convertir documentos no estructurados en JSON u otros formatos consumibles por pipelines downstream, con validación de esquema en producción.
- Soporte técnico y atención al cliente en inglés e italiano: el modelo puede gestionar conversaciones multi-turno en ambos idiomas; la ausencia de datos sobre longitud de contexto obliga a validar empíricamente el límite real antes de desplegarlo en produccion.
- Despliegue en navegador para demos y formación: la demo local en navegador permite mostrar flujos de IA privada sin enviar datos a un servidor, útil para demostraciones comerciales, entornos educativos o pruebas de concepto en organizaciones con restricciones de red.
- Personalización de dominio bajo pedido: organizaciones con vocabulario o flujos específicos (legal, sanitario, industrial) pueden solicitar fine-tuning supervisado o LoRA/QLoRA sobre el modelo para adaptarlo a su jerga y sus datos internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la variante densa de 32B: en torno a 64 GB en FP16 (2 bytes por parámetro para 32.085B), aproximadamente 32-36 GB en cuantización de 8 bits y 18-22 GB en cuantizaciones de 4 bits, como estimación teórica; el autor no publica cifras oficiales.
- GPU recomendadas para 32B: A100 80 GB o H100 para FP16 sin cuantizar; A100 40 GB, L40S o RTX 6000 Ada para 8 bits; GPUs de 24 GB (RTX 3090, RTX 4090) solo con cuantización de 4 bits y contexto reducido.
- Cabe en GPU de consumo: sí, la variante de 32B en GGUF de 4 bits puede caber en RTX 3090/4090 de 24 GB; las clases de 70B y 80B declaradas por el autor no caben en GPU de consumo sin cuantizaciones agresivas y offloading a RAM.
- Opciones de despliegue: llama.cpp y Ollama para GGUF local (el autor enlaza una página de proyecto en Ollama); vLLM o TGI para servicio en nube, aunque no se confirma compatibilidad explícita; ejecución en navegador mediante la demo propietaria de Flushnet.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Chronos DX Dense 32B | 32,085B | no disponible | no disponible | GGUF | Sin benchmarks publicados; familia declarada de 8B a 80B |
| Qwen2.5 32B | 32,5B (aprox.) | 128K (variantes documentadas) | Apache 2.0 en la mayoría de variantes | safetensors, GGUF | Benchmarks públicos amplios; ecosistema maduro |
| Gemma 2 27B | 27B | 8K | Gemma Terms of Use | safetensors, GGUF | Resultados publicados por Google; uso comercial con condiciones |
| Mistral Small 24B | 24B | 128K (según versión) | Apache 2.0 (versiones recientes) | safetensors, GGUF | Buen equilibrio tamaño/rendimiento con benchmarks públicos |

La comparación es estructural: Chronos DX no publica métricas que permitan situarlo frente a estas alternativas, y su licencia no está declarada, lo que impide evaluar su idoneidad para uso comercial frente a modelos con licencias permisivas y resultados verificables.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni otras pruebas, por lo que las capacidades declaradas no están verificadas.
- Licencia no disponible: sin licencia explícita no puede asumirse permiso para uso comercial, redistribución o modificación; es un bloqueo potencial para producción.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de factualidad ni tasas de alucinación.
- Cobertura lingüística limitada: solo inglés e italiano; no hay soporte declarado de castellano.
- Longitud de contexto desconocida: impide planificar aplicaciones con documentos largos o conversaciones extensas sin pruebas previas.
- Trazabilidad del modelo base inexistente: no se indica sobre qué modelo se construyó ni qué datos se usaron, lo que dificulta auditorías de cumplimiento.
- Madurez del proyecto: 0 descargas y 1 like en el repositorio principal; la model card mezcla especificaciones técnicas con oferta comercial de servicios, lo que dificulta separar hechos verificables de marketing.
- La demo en navegador es una versión "comprimida" no equivalente al modelo completo; no debe tomarse como referencia de rendimiento del 32B.

## Enlaces

- Repositorio principal en HuggingFace: https://huggingface.co/LucianoM39/Chronos-DX
- Repositorio GGUF denso 32B: https://huggingface.co/FlushnetAI/Chronos-DX-Dense-32B-GGUF
- Página del proyecto Chronos DX: https://www.flushnet.net/ai/chronos-dx/
- Demo local segura en navegador: https://www.flushnet.net/chronos-secure/secure-webchat/
- Solicitud de entrenamiento o personalización: https://www.flushnet.net/chronos-dx-model-request/
- Contacto para proyectos: https://www.flushnet.net/ai/chronos-dx/#contact
- Listado en Ollama (página de proyecto): https://ollama.com/marcheseluciano/Chronos-DX
