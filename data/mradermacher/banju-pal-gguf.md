# mradermacher/banju-pal-GGUF

## Resumen

banju-pal es un modelo de lenguaje especializado en domótica (smart-home) y asistencia a personas mayores, desarrollado por hongyue0721 y publicado originalmente en Hugging Face. La versión aquí descrita es la cuantización GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo parte de una base Qwen 3.5 (según las etiquetas del autor) y ha sido ajustado mediante LoRA y DPO sobre un conjunto de trayectorias de agente, lo que lo orienta a tareas de tool calling y razonamiento multi-paso en el hogar.

Con 8.953.803.264 parámetros totales (aproximadamente 8,95 mil millones), se sitúa en la franja de modelos densos de tamaño medio, adecuado para despliegues en una sola GPU. Su enfoque es claramente vertical: no compite como modelo generalista, sino como agente conversacional para control de dispositivos, rutinas de cuidado y asistencia a personas mayores, con soporte de chino e inglés. La licencia Apache 2.0 facilita su uso comercial, y la disponibilidad de cuantizaciones desde Q2_K hasta f16 permite ajustar el equilibrio entre calidad y requisitos de memoria.

La relevancia actual radica en la combinación de un modelo base moderno con un ajuste específico de dominio y un formato GGUF listo para producción local, lo que reduce la barrera para integrar asistentes de domótica y cuidado en entornos con requisitos de privacidad o sin conectividad a la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen 3.5, según etiquetas del autor) |
| Parámetros totales | 8.953.803.264 (≈8,95 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamaño del repo | 81,8 GB |
| Librería | transformers |
| Modelo base | hongyue0721/banju-pal |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa heredada de Qwen 3.5, con aproximadamente 8,95 mil millones de parámetros. Sobre esa base, el autor aplicó un ajuste supervisado mediante LoRA y una etapa posterior de DPO (Direct Preference Optimization), según las etiquetas de la model card. El conjunto de datos de entrenamiento es hongyue0721/banju-pal-trajectories, un dataset de trayectorias de agente orientado a interacciones de domótica y cuidado de personas mayores, lo que explica la especialización en tool calling y razonamiento multi-paso dentro de ese dominio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni la longitud de contexto nativa. Las cuantizaciones GGUF de mradermacher son estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y, según la model card, no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicación. La innovación técnica destacable no está en la arquitectura, sino en el ajuste de dominio: el modelo está entrenado para encadenar llamadas a herramientas propias de un entorno doméstico (luces, sensores, recordatorios, dispositivos médicos) y para mantener conversaciones de asistencia con personas mayores.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Tool calling / function calling orientado a dispositivos de domótica y servicios de cuidado.
- Razonamiento multi-paso y comportamiento de agente sobre trayectorias de herramientas.
- Gestión de rutinas de asistencia a personas mayores: recordatorios, avisos, consultas de estado.
- Integración en pipelines conversacionales multi-turno (soporte de contexto no especificado).
- Capacidad de razonamiento general heredada del modelo base Qwen 3.5, aunque no validada en benchmarks en la información disponible.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistente de domótica por voz o texto: el modelo interpreta peticiones como encender luces, ajustar termostatos o consultar sensores y las traduce en llamadas a herramientas, gracias a su ajuste específico en tool calling para el hogar.
- Cuidado de personas mayores en el hogar: puede gestionar recordatorios de medicación, avisos de citas y comprobaciones de bienestar mediante conversaciones multi-turno, un escenario para el que fue entrenado explícitamente con trayectorias de asistencia.
- Agente de automatización de rutinas: encadena varias llamadas a herramientas en secuencia (por ejemplo, comprobar presencia, ajustar persianas y programar la calefacción) aprovechando su razonamiento multi-paso.
- Despliegue local con privacidad: al estar disponible en GGUF y con licencia Apache 2.0, puede ejecutarse en un dispositivo del hogar sin enviar datos sensibles a la nube, algo crítico en entornos de cuidado.
- Integración en asistentes de voz embebidos: las cuantizaciones Q4_K_S y Q4_K_M (5,5-5,8 GB) permiten ejecutarlo en mini-PC o dispositivos con GPU integrada para asistentes siempre activos.
- Prototipado de agentes de domótica: investigadores pueden usar el modelo como referencia para evaluar políticas de tool calling en entornos simulados de smart-home antes de pasar a producción.
- Atención al cliente para servicios de teleasistencia: conversaciones guiadas con escalado a operador humano cuando el modelo detecta situaciones fuera de su ámbito, usando el soporte bilingüe chino-inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ≈ 4,0 GB; Q3_K_S ≈ 4,4 GB; Q3_K_M ≈ 4,8 GB; Q3_K_L ≈ 5,1 GB; IQ4_XS ≈ 5,4 GB; Q4_K_S ≈ 5,5 GB; Q4_K_M ≈ 5,8 GB; Q5_K_S ≈ 6,4 GB; Q5_K_M ≈ 6,6 GB; Q6_K ≈ 7,5 GB; Q8_0 ≈ 9,6 GB; f16 ≈ 18,0 GB.
- GPU recomendadas: para f16 o Q8_0, una RTX 4090 (24 GB) o A100/H100; para Q4_K_M y Q5_K_M, una RTX 4060 Ti de 16 GB o RTX 4070/4080; para Q3 y Q2, GPU de 8 GB como RTX 3060/4060.
- Cabe en GPU de consumo: sí, desde Q4_K_S en adelante en tarjetas de 8-12 GB, y todas las cuantizaciones en tarjetas de 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| banju-pal (este) | ≈8,95 mil M | no disponible | Domótica y cuidado de mayores, tool calling | Apache 2.0 | GGUF, safetensors |
| Qwen 2.5 7B Instruct | 7,6 mil M | 128K (según versión) | Generalista, tool calling | Apache 2.0 | GGUF, safetensors |
| Llama 3.1 8B Instruct | 8,0 mil M | 128K | Generalista, tool calling | Llama 3.1 Community | GGUF, safetensors |
| Mistral 7B Instruct | 7,2 mil M | 32K | Generalista | Apache 2.0 | GGUF, safetensors |

La comparación con modelos generalistas es orientativa: banju-pal sacrifica amplitud por especialización en un dominio concreto. No se dispone de datos de benchmarks que permitan comparar su rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Especialización estrecha: su ajuste en domótica y cuidado de mayores puede degradar el rendimiento en tareas generales frente al modelo base Qwen 3.5.
- Idiomas limitados a chino e inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación en la invocación de herramientas: puede generar llamadas a funciones inexistentes o con parámetros incorrectos, por lo que requiere validación en producción.
- Longitud de contexto no documentada: no es posible planificar conversaciones largas sin verificación empírica.
- Al tratarse de un modelo de asistencia a personas mayores, cualquier uso en producción debe incluir supervisión humana y mecanismos de escalado; no debe usarse como único sistema de emergencia.
- Sesgos potenciales derivados del dataset de trayectorias, no auditados en la información disponible.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad del tool calling.
- No hay cuantizaciones ponderadas con imatrix disponibles según la model card.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/banju-pal-GGUF
- Modelo base: https://huggingface.co/hongyue0721/banju-pal
- Dataset de trayectorias: https://huggingface.co/datasets/hongyue0721/banju-pal-trajectories
- Página de descargas del cuantizador: https://hf.tst.eu/model#banju-pal-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
