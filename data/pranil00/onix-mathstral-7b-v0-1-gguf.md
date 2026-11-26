# pranil00/ONIX-Mathstral-7B-v0.1-GGUF

## Resumen

ONIX-Mathstral-7B-v0.1-GGUF es una cuantización en formato GGUF del modelo Mathstral-7B-v0.1 de Mistral AI, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Mathstral-7B-v0.1 es un modelo de lenguaje especializado en razonamiento matemático y científico, construido sobre la familia arquitectónica Mistral y derivado del modelo base de Mistral AI. Esta versión concreta aplica una cuantización Q5_K_M (5,5 bits por peso) que reduce el tamaño de los pesos de 14,18 GB en FP16 a 4,87 GB, lo que permite ejecutar el modelo en hardware de consumo.

El interés de esta ficha radica en que pone a disposición de desarrolladores e investigadores una variante ligera de un modelo matemático de 7.250 millones de parámetros que puede desplegarse en equipos con GPU de consumo, Apple Silicon o incluso CPU. La cuantización Q5_K_M es un compromiso habitual entre calidad y footprint de memoria, y el autor declara una retención de calidad del 97,5 % respecto al modelo original en FP16.

Cabe señalar que esta publicación no es un modelo nuevo ni un fine-tuning: es un artefacto de conversión de pesos. La model card incluye métricas de telemetría propias del motor `run-any-model` (tamaño de pesos, buffer de KV cache, aceleración de capas) pero no incluye resultados de benchmarks estándar de razonamiento matemático, por lo que la evaluación de capacidades debe remitirse al modelo base original de Mistral AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Mistral (familia Mistral) |
| Parametros totales | 7.248.019.456 (7,25 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (ventana óptima declarada en GPU y Apple Silicon); 4.096 tokens en CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); el artefacto publicado solo incluye esta cuantización |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `mistralai--Mathstral-7B-v0.1-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Mistral, una arquitectura transformer decoder-only con atención causal estándar. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base Mathstral-7B-v0.1. La model card de esta publicación se centra exclusivamente en el proceso de cuantización y no documenta el entrenamiento del modelo original.

La innovación técnica de este artefacto es la conversión a GGUF con esquema Q5_K_M, que combina cuantización de bloques con mezcla de precisiones (K-quants) para preservar la calidad en capas sensibles. El autor reporta una reducción del 65,6 % en tamaño de pesos (de 14,18 GB a 4,87 GB), un ratio de compresión de 2,91x y una retención de calidad estimada del 97,5 %. El motor `run-any-model` declara aceleración de las 32 capas del modelo en Metal (Apple Silicon) y compatibilidad con CUDA y CPU con AVX2/AVX-512. No se documentan técnicas como decodificación especulativa, attention linear ni arquitecturas híbridas SSM.

## Capacidades

- Generación de texto y razonamiento matemático: el modelo base Mathstral-7B-v0.1 está especializado en problemas matemáticos y científicos, según la denominación y procedencia del modelo original.
- Razonamiento multi-paso: orientado a la resolución de problemas que requieren cadenas de deducción, propio de un modelo matemático.
- Generación de código: capacidad esperable en modelos de la familia Mistral, aunque no se documenta explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; la especialización matemática sugiere utilidad en pipelines de razonamiento, pero sin confirmación en la model card.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible; no se declaran modos de razonamiento extendido ni capacidades multimodales.
- Ejecución multiplataforma: el artefacto está optimizado para Apple Silicon (Metal), GPU NVIDIA (CUDA) y CPU (AVX2/AVX-512) mediante el motor `run-any-model`, Ollama, llama.cpp, LM Studio, Jan y Text-Generation-WebUI.

## Casos de uso

- Resolución de problemas matemáticos en local: el modelo puede utilizarse para resolver ecuaciones, demostraciones y problemas de cálculo en un portátil con Apple Silicon o una GPU de consumo, gracias a sus 4,87 GB de pesos cuantizados y su especialización matemática.
- Asistencia educativa en matemáticas: integrado en una aplicación de tutoría, el modelo puede generar explicaciones paso a paso de problemas algebraicos o de cálculo, con una ventana de contexto de 8.192 tokens suficiente para enunciados largos y conversaciones multi-turno.
- Preprocesamiento y verificación de expresiones matemáticas en pipelines de datos: puede emplearse para normalizar, comprobar o generar expresiones matemáticas en flujos de procesamiento batch ejecutados en CPU, donde la ventana de 4.096 tokens es adecuada para fragmentos cortos.
- Prototipado de investigación en razonamiento matemático: investigadores sin acceso a clústeres GPU pueden desplegar el modelo en una RTX 4090 o similar (6,37 GB de VRAM declarados) para experimentar con prompting y evaluaciones de razonamiento.
- Generación de documentación técnica con contenido matemático: el modelo puede redactar explicaciones de fórmulas y derivaciones en documentación de proyectos, ejecutándose localmente sin dependencia de APIs externas.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local mediante llama.cpp u Ollama, permite procesar problemas matemáticos y datos sensibles sin enviar información a servicios en la nube.
- Integración en asistentes de escritorio: mediante LM Studio o Jan, el modelo puede incorporarse como asistente local para consultas matemáticas y científicas en el flujo de trabajo diario del desarrollador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye métricas de telemetría del proceso de cuantización, no de calidad del modelo:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision de bits | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 14,18 GB | 4,87 GB | -65,6 % |
| Buffer KV cache | 512,0 MB (FP16) | 512,0 MB (FP16) | Optimizado |
| RAM residente total | 14,75 GB | 5,45 GB | -63,1 % |
| Calidad estimada | 100,0 % baseline | 97,5 % retenida | -2,5 % |
| Aceleracion de capas | 0 % (riesgo de fallo) | 32/32 capas | Optimo |

No se proporcionan resultados de MMLU, GSM8K, HumanEval ni de benchmarks matemáticos específicos como MATH. Para evaluar el rendimiento real debe consultarse la model card del modelo base `mistralai/Mathstral-7B-v0.1`.

## Requisitos de hardware

- VRAM estimada para inferencia: 6,37 GB de VRAM dedicada en GPU NVIDIA (RTX 30/40/50) según la model card; 5,45 GB de memoria unificada en Apple Silicon (M1/M2/M3/M4/M5); 7,45 GB de RAM libre en CPU (Windows/Linux).
- GPU recomendadas: NVIDIA RTX 30/40/50 series con al menos 6,4 GB de VRAM; Apple Silicon con al menos 5,5 GB de memoria unificada. No se especifican modelos concretos como A100 o H100, aunque por tamaño cabría en cualquier GPU con más de 6,4 GB.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070, etc.), con margen para el buffer de KV cache.
- Opciones de despliegue: `run-any-model` (CLI), Ollama (mediante Modelfile), llama.cpp (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La model card solo indica aceleración nativa Metal y CUDA, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-Mathstral-7B-v0.1-GGUF (esta ficha) | 7,25 B | 8.192 tokens | GGUF Q5_K_M | Apache 2.0 | Cuantización comunitaria del modelo base; 4,87 GB |
| mistralai/Mathstral-7B-v0.1 | 7,25 B | no disponible en esta ficha | safetensors (original) | Apache 2.0 | Modelo base oficial de Mistral AI; pesos FP16 de 14,18 GB |
| Mistral-7B-v0.1 | 7,24 B | 8.192 tokens | safetensors, GGUF | Apache 2.0 | Modelo generalista de la misma familia; no especializado en matemáticas |
| Qwen2.5-Math-7B | 7,6 B | 4.096 tokens | safetensors, GGUF | Apache 2.0 | Alternativa especializada en matemáticas de Alibaba; datos de rendimiento no verificados en esta ficha |

La comparación con Qwen2.5-Math-7B y Mistral-7B-v0.1 se ofrece a título orientativo de categoría; no se dispone de datos de benchmarks en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al derivar de un modelo entrenado por Mistral AI, hereda los sesgos del modelo base, no evaluados en esta publicación.
- Riesgo de alucinación: no cuantificado en la model card; como todo modelo generativo, puede producir razonamientos matemáticos plausibles pero incorrectos, especialmente en problemas de varios pasos.
- Limitaciones de contexto o idioma: la ventana óptima declarada es de 8.192 tokens en GPU y Apple Silicon, pero se reduce a 4.096 tokens en CPU; no se especifican los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card incluye un descargo de responsabilidad absoluto que exime a autores y distribuidores de cualquier daño derivado del uso; el implementador asume toda la responsabilidad de auditar las salidas.
- Caveat de producción: el artefacto es una conversión comunitaria sin benchmarks publicados; la cifra de "97,5 % de retención de calidad" es una estimación del motor de cuantización, no una medición con benchmarks estándar. Para producción conviene validar el modelo en el dominio concreto antes de desplegarlo.
- Procedencia: la publicación tiene 0 descargas y 0 likes en el momento de la consulta, y el repositorio `ONIX` enlazado en la model card no está verificado como organización oficial de Mistral AI; se recomienda contrastar la integridad del archivo GGUF antes de usarlo.
- El modelo está especializado en matemáticas; su rendimiento en tareas generales de lenguaje puede ser inferior al de modelos generalistas del mismo tamaño.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Mathstral-7B-v0.1-GGUF
- Modelo base: https://huggingface.co/mistralai/Mathstral-7B-v0.1
- Organización ONIX (enlazada en la model card): https://huggingface.co/ONIX
- Motor de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
- Página de Mistral AI (modelo Mathstral): no disponible en la información proporcionada
- Paper de Mathstral: no disponible en la información proporcionada
