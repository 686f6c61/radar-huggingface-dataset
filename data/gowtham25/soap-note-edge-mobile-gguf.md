# Gowtham25/soap-note-edge-mobile-gguf

## Resumen

soap-note-edge-mobile-gguf es un modelo derivado de Llama 3.2 1B, ajustado para generar notas clínicas en formato SOAP (Subjetivo, Objetivo, Análisis, Plan) directamente en dispositivos móviles. Lo publica el usuario Gowtham25 en HuggingFace y se distribuye exclusivamente en formato GGUF, pensado para su ejecución con llama.cpp en telefonos y hardware de bajos recursos. El modelo tiene 1.235.814.432 parámetros y un tamaño de repositorio de 1,8 GB.

El objetivo es claro: ofrecer un asistente de documentación clínica que funcione en local, sin depender de la nube, con un contexto configurado de 4096 tokens y una generación máxima de 896 tokens. La model card indica que se trata de un modelo "grounded e3", es decir, que la generación debe apoyarse en un diálogo previo y en un parser específico (`assembleFinalSummary`) para construir el resumen final a partir de los campos extraídos.

Es relevante ahora porque cubre un nicho concreto (documentación clínica estructurada en el borde) y porque demuestra el patrón de adaptar un modelo pequeño de 1B a una tarea vertical con prompts y parsers específicos. La información pública es muy escasa: no hay detalle sobre el dataset de ajuste, los idiomas soportados ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama 3.2 1B; detalles de ajuste no disponibles) |
| Parámetros totales | 1.235.814.432 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (según `llama32_mobile_config.json`) |
| Tipos de cuantización | Q6_K (por defecto, calidad) y Q4_K_M (más pequeño y rápido) |
| Idiomas soportados | No disponible |
| Licencia | other (no se detallan los términos en la información disponible) |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 1B, un transformer decoder-only de la familia Llama 3.2, y se ha ajustado para la tarea de generación de notas SOAP. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado. Tampoco se detalla si el ajuste fue completo o mediante LoRA/QLoRA.

La innovación destacable no está en la arquitectura, sino en el empaquetado para el borde: se incluye un fichero de configuración móvil (`llama32_mobile_config.json`) con contexto de 4096, `max_new` de 896 y temperatura 0 (generación determinista), además de un fichero TypeScript (`soap_prompt.ts`) que contiene el prompt y el parser, con una función `assembleFinalSummary(fields, dialogue)` para ensamblar el resumen final a partir de los campos extraídos y el diálogo. El sufijo "e3" en el nombre del fichero sugiere una tercera iteración del ajuste, pero no se documenta su significado.

## Capacidades

- Generación de texto conversacional orientada a la documentación clínica.
- Extracción y estructuración de información en formato SOAP (Subjetivo, Objetivo, Análisis, Plan).
- Generación "grounded": el resumen se construye a partir de un diálogo previo y de campos extraídos, no de forma libre.
- Salida determinista con temperatura 0, adecuada para tareas de extracción estructurada.
- Ejecución en dispositivo (on-device) mediante llama.cpp, sin conexión a red.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Documentación clínica en consulta: el profesional mantiene un diálogo con el paciente y el modelo genera un borrador de nota SOAP estructurado, que luego se revisa y firma. La ventana de 4096 tokens cubre una consulta típica y la temperatura 0 reduce la variabilidad del borrador.
- Triaje en dispositivos móviles sin conectividad: al ejecutarse con llama.cpp en el teléfono, permite registrar síntomas y antecedentes en entornos con red limitada o por requisitos de privacidad de datos sanitarios.
- Asistencia a personal de enfermería: extracción de campos Subjetivo y Objetivo a partir de la transcripción de la entrevista, dejando Análisis y Plan para la revisión del clínico.
- Prototipado de aplicaciones de salud: el par `soap_prompt.ts` + `assembleFinalSummary` sirve como base para integrar la generación SOAP en una app móvil o web ligera sin infraestructura de servidor.
- Investigación sobre modelos pequeños en dominios verticales: permite estudiar hasta qué punto un modelo de 1B ajustado con prompting y parser específicos es suficiente para una tarea estructurada, frente a modelos mayores.
- Entornos con requisitos de soberanía del dato: al no requerir envío de información a la nube, encaja en despliegues donde la información clínica no puede salir del dispositivo.
- Formación y simulación clínica: generación de notas SOAP a partir de diálogos simulados para entrenar a estudiantes, con revisión posterior por un tutor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con Q6_K, el fichero ronda 1,0-1,1 GB; con Q4_K_M, aproximadamente 0,7-0,8 GB. El repositorio completo ocupa 1,8 GB, pero solo se descarga el fichero GGUF elegido.
- GPU recomendadas: no requiere GPU dedicada; está pensado para CPU móvil. En escritorio puede ejecutarse en cualquier CPU moderna y en GPUs de consumo como RTX 3060 o superiores, aunque no es su objetivo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM libre; también en telefonos de gama media-alta con llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por compatibilidad de formato GGUF, potencialmente Ollama y otros runners basados en llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en el flujo estándar.
- Latencia y throughput: no disponibles. Con 1B parámetros y cuantización Q4_K_M en CPU móvil es razonable esperar decenas de tokens por segundo, pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| soap-note-edge-mobile-gguf | 1,24B | 4096 | GGUF | other | Notas SOAP clínicas on-device |
| Llama 3.2 1B Instruct (base) | 1,24B | 128k (según ficha oficial de Meta) | safetensors, GGUF | Llama 3.2 Community License | Propósito general, instrucciones |
| Qwen2.5 1.5B Instruct | 1,54B | 32k | safetensors, GGUF | Apache 2.0 | Propósito general, multilingüe |
| Gemma 2 2B | 2,6B | 8k | safetensors, GGUF | Gemma Terms of Use | Propósito general |

La comparativa se limita a modelos de tamaño similar; no se dispone de benchmarks del modelo ajustado para comparar calidad en la tarea SOAP. Frente a la base Llama 3.2 1B, este modelo sacrifica generalidad y contexto largo a cambio de un ajuste vertical y un empaquetado listo para móvil.

## Limitaciones y advertencias

- La licencia es "other" y no se detallan sus términos en la información disponible; es imprescindible revisar las condiciones antes de cualquier uso comercial, especialmente en el ámbito sanitario.
- No hay información sobre sesgos del modelo ni sobre la composición del dataset de ajuste, por lo que no se puede evaluar su comportamiento en poblaciones o idiomas distintos de los del entrenamiento.
- Riesgo de alucinación inherente a un modelo de 1B: puede inventar síntomas, medicaciones o antecedentes no presentes en el diálogo; el parser `assembleFinalSummary` mitiga parcialmente esto al anclar la salida a campos extraídos, pero no lo elimina.
- La temperatura 0 reduce la variabilidad pero no garantiza corrección factual; toda nota generada debe ser revisada por un profesional sanitario antes de incorporarse a la historia clínica.
- Contexto limitado a 4096 tokens: diálogos largos o historiales extensos pueden truncarse.
- Idiomas soportados no documentados; no se puede asumir un buen rendimiento en castellano sin validación previa.
- No es un dispositivo médico ni sustituye el juicio clínico; su uso en producción sanitaria requiere validación regulatoria y evaluación de riesgos.
- El modelo tiene muy poca tracción (78 descargas, 0 likes) y fue creado en octubre de 2026, por lo que carece de validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/Gowtham25/soap-note-edge-mobile-gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Llama 3.2 (familia base): https://huggingface.co/meta-llama/Llama-3.2-1B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
