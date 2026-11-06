# INGMUYLEANG/VoxPocket-v3

## Resumen

VoxPocket-v3 es un modelo de síntesis de voz (text-to-speech) especializado en jemer (khmer) e inglés, desarrollado por INGMUYLEANG como un fine-tuning del modelo base openbmb/VoxCPM1.5. Resuelve un problema concreto y poco cubierto en el ecosistema open source: la generación de voz natural en jemer, un idioma de bajos recursos con escasa representación en los sistemas TTS comerciales y abiertos. El modelo incorpora además capacidad de clonación de voz y manejo de code-mixing (alternancia de idiomas dentro de una misma frase), un fenómeno muy habitual en el habla real de Camboya.

Con 801.729.856 parámetros (aproximadamente 802 millones) y un repositorio de 3,6 GB en formato safetensors, se posiciona en la gama media de modelos TTS, lo que permite su despliegue en hardware razonablemente modesto. Se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar las condiciones en HuggingFace.

Es relevante ahora porque la mayoría de modelos TTS multilingües de código abierto no cubren lenguas del sudeste asiático con calidad aceptable, y las alternativas específicas para jemer son prácticamente inexistentes en el ecosistema abierto. VoxPocket-v3 ofrece una base afinada y licenciada de forma permisiva para construir aplicaciones de accesibilidad, educación o atención al cliente en jemer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en la familia VoxCPM; el detalle arquitectónico del base no se especifica en la información proporcionada) |
| Parametros totales | 801.729.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | jemer (km), inglés (en); soporta code-mixing km-en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del base openbmb/VoxCPM1.5, perteneciente a la familia VoxCPM de modelos de texto a voz. La información disponible no detalla la arquitectura interna del base (si es un modelo de difusión, autoregresivo sobre tokens acústicos, o híbrido), por lo que este dato debe considerarse no disponible en esta ficha. El número de parámetros (802 M) y el tamaño del repositorio (3,6 GB) son coherentes con un modelo TTS de tamaño medio que incluye codificador de texto, generador acústico y probablemente un codificador de hablante para clonación de voz.

El entrenamiento se realizó mediante fine-tuning sobre el dataset INGMUYLEANG/voxpocket-khmer-tts-v3, un corpus específico de TTS en jemer. No se dispone de información sobre el número de horas de audio, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias (poco habituales en TTS). La capacidad de code-mixing sugiere que el dataset de ajuste incluye utterances con mezcla de jemer e inglés, reflejando el habla real bilingüe de la región.

## Capacidades

- Síntesis de voz (text-to-speech) en jemer e inglés.
- Clonación de voz a partir de muestras de referencia del hablante.
- Manejo de code-mixing jemer-inglés dentro de una misma frase, con transiciones entre ambos idiomas.
- Generación de audio natural para texto de entrada (pipeline text-to-speech).
- No se documenta soporte de tool calling, function calling ni capacidades de agente (no aplica a un modelo TTS).
- No se documentan capacidades de visión, audio de entrada ni modo de razonamiento (thinking mode); el modelo es exclusivamente de síntesis.

## Casos de uso

- Accesibilidad para personas con discapacidad visual en Camboya: lectura en voz alta de contenido web, documentos o interfaces en jemer, aprovechando que es uno de los pocos TTS abiertos con cobertura real de este idioma.
- Atención al cliente automatizada en jemer: integración en sistemas IVR o chatbots de voz para empresas camboyanas, con respuestas sintetizadas en jemer y capacidad de alternar a inglés en la misma locución cuando el cliente mezcla idiomas.
- Educación y aprendizaje de idiomas: generación de material audio para cursos de jemer e inglés, incluyendo ejercicios de code-mixing para estudiantes bilingües.
- Audiolibros y contenido editorial: conversión de textos largos en jemer a audio narrado, con posibilidad de clonar una voz concreta para mantener consistencia de narrador.
- Localización de vídeos y podcasts: doblaje de contenido en inglés al jemer (o viceversa) manteniendo la voz del hablante original mediante clonación.
- Asistentes de voz para dispositivos y aplicaciones móviles: síntesis en tiempo de ejecución en el dispositivo o en servidor, dado el tamaño moderado del modelo (802 M parámetros).
- Preservación lingüística y documentación: generación de muestras de voz en jemer para proyectos de documentación de la lengua y herramientas de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 802 M parámetros en safetensors (probablemente fp32 o fp16), la inferencia requiere aproximadamente 3-6 GB de VRAM en fp16, dependiendo del framework y del codificador de hablante. En cuantización a 8 bits podría reducirse a unos 1,5-2 GB, aunque no se documentan variantes cuantizadas.
- GPU recomendadas: RTX 3060/4060 (12/8 GB) o superiores para inferencia cómoda; A100/H100 no son necesarias para este tamaño, aunque aceleran el throughput en producción.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM (RTX 2060, RTX 3060, RTX 4060, etc.), aunque no se confirma en la documentación.
- Opciones de despliegue: la librería indicada es `voxcpm`; no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI (estos están orientados a LLM, no a TTS). El despliegue se haría mediante la librería específica del modelo o un servidor de inferencia compatible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación de voz | Licencia | Acceso |
|---|---|---|---|---|---|
| VoxPocket-v3 | 802 M | km, en | Sí | Apache 2.0 | Gated |
| openbmb/VoxCPM1.5 | no disponible | multilingüe (no se detalla) | no disponible | no disponible | no disponible |
| Modelos TTS multilingües abiertos (p. ej. XTTS de Coqui) | no disponible | multilingüe (sin jemer destacado) | Sí | no disponible (Coqui CPML para pesos) | Abierto |
| Piper TTS | variable (modelos pequeños) | multilingüe (cobertura de jemer limitada) | No | MIT (código) | Abierto |

La comparativa se limita a alternativas genéricas porque no se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada. La principal ventaja diferencial de VoxPocket-v3 es la cobertura específica de jemer con code-mixing, ausente en la mayoría de alternativas abiertas.

## Limitaciones y advertencias

- El acceso es restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar los pesos, lo que puede ralentizar la integración en pipelines automatizados.
- No se documentan sesgos específicos, pero al ser un fine-tuning sobre un dataset de jemer, la calidad en inglés puede ser inferior a la de modelos nativos en ese idioma.
- Riesgo de alucinación acústica: como todo modelo TTS, puede generar pronunciaciones incorrectas, artefactos o prosodia antinatural en textos fuera de distribución (nombres propios, siglas, números).
- La cobertura de code-mixing depende del dataset de ajuste; no se garantiza un comportamiento correcto en mezclas más complejas o con otros idiomas distintos del inglés.
- Licencia Apache 2.0 permite uso comercial, pero al ser un fine-tuning de openbmb/VoxCPM1.5 conviene verificar que la licencia del modelo base sea compatible (no se detalla en la información proporcionada).
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de comunidad ni de validación externa, lo que desaconseja su uso en producción sin una evaluación propia exhaustiva.
- No se documentan límites de longitud de texto de entrada ni de duración de audio generado.

## Enlaces

- HuggingFace: https://huggingface.co/INGMUYLEANG/VoxPocket-v3
- Modelo base: https://huggingface.co/openbmb/VoxCPM1.5
- Dataset de entrenamiento: https://huggingface.co/datasets/INGMUYLEANG/voxpocket-khmer-tts-v3
